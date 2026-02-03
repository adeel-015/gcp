import express from "express";
import cors from "cors";
import pool from "./db.js";
import { getAllPrompts, getPrompt, PROMPT_TOTALS } from "./prompts.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get all prompts
app.get("/api/prompts", (req, res) => {
  try {
    const prompts = getAllPrompts().map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      rubric: p.rubric,
    }));
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single prompt
app.get("/api/prompts/:id", (req, res) => {
  try {
    const prompt = getPrompt(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    res.json({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt,
      rubric: prompt.rubric,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top 10 leaderboard
app.get("/api/leaderboard/top10", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(`
      SELECT 
        ranked.rank_position,
        ranked.overall_score,
        ranked.crisis_score,
        ranked.sustainability_score,
        ranked.team_score,
        ranked.percentile,
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.primary_skill,
        c.avatar_url,
        c.location,
        c.years_experience
      FROM (
        SELECT
          r.*,
          ROW_NUMBER() OVER (ORDER BY r.overall_score DESC) AS rank_position
        FROM rankings r
      ) ranked
      JOIN candidates c ON ranked.candidate_id = c.id
      WHERE ranked.rank_position <= 10
      ORDER BY ranked.rank_position ASC
    `);

    const resultsWithRank = results.map((row) => ({
      ...row,
      rank: row.rank_position,
    }));

    res.json(resultsWithRank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get full leaderboard with pagination
app.get("/api/leaderboard", async (req, res) => {
  const connection = await pool.getConnection();
  const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);
  const offset = (page - 1) * limit;

  try {
    const [results] = await connection.query(
      `
      SELECT 
        ranked.rank_position,
        ranked.overall_score,
        ranked.crisis_score,
        ranked.sustainability_score,
        ranked.team_score,
        ranked.percentile,
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.primary_skill,
        c.avatar_url,
        c.location,
        c.years_experience
      FROM (
        SELECT
          r.*,
          ROW_NUMBER() OVER (ORDER BY r.overall_score DESC) AS rank_position
        FROM rankings r
      ) ranked
      JOIN candidates c ON ranked.candidate_id = c.id
      ORDER BY ranked.rank_position ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    );

    const [countResult] = await connection.execute(
      "SELECT COUNT(*) as total FROM rankings",
    );
    const total = countResult[0].total;

    res.json({
      data: results.map((row) => ({
        ...row,
        rank: row.rank_position,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get candidate details with all evaluations
app.get("/api/candidates/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [candidateData] = await connection.execute(
      `
      SELECT * FROM candidates WHERE id = ?
    `,
      [req.params.id],
    );

    if (candidateData.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const candidate = candidateData[0];

    const [evaluations] = await connection.execute(
      `
      SELECT id, prompt_type, total_score, rubric_scores, response, evaluator_notes, created_at
      FROM evaluations
      WHERE candidate_id = ?
    `,
      [req.params.id],
    );

    const [ranking] = await connection.execute(
      `
      SELECT r.*, ranked.rank_position
      FROM rankings r
      JOIN (
        SELECT candidate_id, ROW_NUMBER() OVER (ORDER BY overall_score DESC) AS rank_position
        FROM rankings
      ) ranked ON r.candidate_id = ranked.candidate_id
      WHERE r.candidate_id = ?
    `,
      [req.params.id],
    );

    res.json({
      ...candidate,
      secondary_skills: (() => {
        try {
          return JSON.parse(candidate.secondary_skills || "[]");
        } catch {
          return [];
        }
      })(),
      evaluations: evaluations.map((e) => ({
        ...e,
        rubric_scores: (() => {
          try {
            return JSON.parse(e.rubric_scores || "{}");
          } catch {
            return {};
          }
        })(),
      })),
      ranking:
        ranking.length > 0
          ? { ...ranking[0], rank: ranking[0].rank_position }
          : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get candidates by skill
app.get("/api/candidates/skill/:skill", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      `
      SELECT c.*, ranked.overall_score, ranked.rank_position
      FROM candidates c
      LEFT JOIN (
        SELECT candidate_id, overall_score, ROW_NUMBER() OVER (ORDER BY overall_score DESC) AS rank_position
        FROM rankings
      ) ranked ON c.id = ranked.candidate_id
      WHERE c.primary_skill = ? OR c.secondary_skills LIKE ?
      ORDER BY ranked.overall_score DESC
      LIMIT 50
    `,
      [req.params.skill, `%"${req.params.skill}"%`],
    );

    res.json(
      results.map((c) => {
        try {
          return {
            ...c,
            rank: c.rank_position,
            secondary_skills: JSON.parse(c.secondary_skills || "[]"),
          };
        } catch (parseError) {
          return {
            ...c,
            rank: c.rank_position,
            secondary_skills: [],
          };
        }
      }),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get skill distribution (for heatmap)
app.get("/api/analytics/skills", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(`
      SELECT 
        primary_skill as skill,
        COUNT(*) as count,
        AVG(COALESCE(r.overall_score, 0)) as avg_score
      FROM candidates c
      LEFT JOIN rankings r ON c.id = r.candidate_id
      GROUP BY primary_skill
      ORDER BY count DESC
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get evaluation metrics
app.get("/api/analytics/evaluations", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(`
      SELECT 
        prompt_type,
        COUNT(*) as count,
        AVG(total_score) as avg_score,
        MIN(total_score) as min_score,
        MAX(total_score) as max_score
      FROM evaluations
      GROUP BY prompt_type
    `);

    res.json(
      results.map((row) => ({
        ...row,
        max_possible: PROMPT_TOTALS[row.prompt_type] ?? 100,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Create shareable link for candidate
app.post("/api/candidates/:id/share", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const shareToken = uuidv4();

    await connection.execute(
      `
      UPDATE rankings
      SET share_token = ?, is_shared = true, last_shared_at = CURRENT_TIMESTAMP
      WHERE candidate_id = ?
    `,
      [shareToken, req.params.id],
    );

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/${shareToken}`;

    res.json({
      shareToken,
      shareUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Get shared candidate profile
app.get("/api/share/:token", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rankings] = await connection.execute(
      `
      SELECT candidate_id FROM rankings WHERE share_token = ?
    `,
      [req.params.token],
    );

    if (rankings.length === 0) {
      return res.status(404).json({ error: "Share token not found" });
    }

    const candidateId = rankings[0].candidate_id;

    const [candidateData] = await connection.execute(
      `
      SELECT * FROM candidates WHERE id = ?
    `,
      [candidateId],
    );

    const [evaluations] = await connection.execute(
      `
      SELECT prompt_type, total_score, rubric_scores, created_at
      FROM evaluations
      WHERE candidate_id = ?
    `,
      [candidateId],
    );

    const [ranking] = await connection.execute(
      `
      SELECT r.overall_score, ranked.rank_position, r.percentile, r.crisis_score, r.sustainability_score, r.team_score
      FROM rankings r
      JOIN (
        SELECT candidate_id, ROW_NUMBER() OVER (ORDER BY overall_score DESC) AS rank_position
        FROM rankings
      ) ranked ON r.candidate_id = ranked.candidate_id
      WHERE r.candidate_id = ?
    `,
      [candidateId],
    );

    res.json({
      ...candidateData[0],
      secondary_skills: (() => {
        try {
          return JSON.parse(candidateData[0].secondary_skills || "[]");
        } catch {
          return [];
        }
      })(),
      evaluations: evaluations.map((e) => ({
        ...e,
        rubric_scores: (() => {
          try {
            return JSON.parse(e.rubric_scores || "{}");
          } catch {
            return {};
          }
        })(),
      })),
      ranking:
        ranking.length > 0
          ? { ...ranking[0], rank: ranking[0].rank_position }
          : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Search candidates
app.get("/api/search", async (req, res) => {
  const connection = await pool.getConnection();
  const query = `%${req.query.q}%`;

  try {
    const [results] = await connection.execute(
      `
      SELECT c.*, ranked.overall_score, ranked.rank_position
      FROM candidates c
      LEFT JOIN (
        SELECT candidate_id, overall_score, ROW_NUMBER() OVER (ORDER BY overall_score DESC) AS rank_position
        FROM rankings
      ) ranked ON c.id = ranked.candidate_id
      WHERE 
        c.first_name LIKE ? OR 
        c.last_name LIKE ? OR 
        c.email LIKE ? OR 
        c.primary_skill LIKE ?
      LIMIT 20
    `,
      [query, query, query, query],
    );

    res.json(
      results.map((c) => {
        try {
          return {
            ...c,
            rank: c.rank_position,
            secondary_skills: JSON.parse(c.secondary_skills || "[]"),
          };
        } catch (parseError) {
          return {
            ...c,
            rank: c.rank_position,
            secondary_skills: [],
          };
        }
      }),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   API Base: http://localhost:${PORT}/api`);
});
