import pool from "../db.js";
import { getAllPrompts, calculateTotalScore } from "../prompts.js";
import dotenv from "dotenv";

dotenv.config();

// Mock evaluation scores - simulating diverse evaluator feedback
function generateMockEvaluation(promptId, candidateId) {
  const rubrics = {
    crisis: {
      decisionMaking: Math.floor(Math.random() * 20) + 1,
      communication: Math.floor(Math.random() * 20) + 1,
      technicalAcumen: Math.floor(Math.random() * 20) + 1,
      leadership: Math.floor(Math.random() * 20) + 1,
      completeness: Math.floor(Math.random() * 20) + 1,
    },
    sustainability: {
      analysis: Math.floor(Math.random() * 15) + 1,
      prioritization: Math.floor(Math.random() * 20) + 1,
      innovation: Math.floor(Math.random() * 20) + 1,
      measurement: Math.floor(Math.random() * 20) + 1,
      businessAcumen: Math.floor(Math.random() * 25) + 1,
    },
    team: {
      empathy: Math.floor(Math.random() * 15) + 1,
      diagnostics: Math.floor(Math.random() * 20) + 1,
      execution: Math.floor(Math.random() * 20) + 1,
      culture: Math.floor(Math.random() * 20) + 1,
      development: Math.floor(Math.random() * 25) + 1,
    },
  };

  const scores = rubrics[promptId];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    rubricScores: scores,
    totalScore: totalScore,
  };
}

// Generate mock responses for each prompt type
function generateMockResponse(promptType, firstName) {
  const responses = {
    crisis: `As ${firstName}, my immediate response would be:

1. **Immediate Actions (Next 15 minutes)**
   - Declare incident severity level 1
   - Activate incident response team
   - Get real-time metrics on outage scope
   - Begin root cause analysis in parallel
   - Establish war room communication channel

2. **Communication Strategy**
   - Internal: Status page update every 5 minutes, all-hands Slack notification
   - External: Customer notification via email and in-app banner with ETA
   - Media: Prepare holding statement acknowledging issue and our response

3. **Timeline**
   - 0-15 min: Diagnosis and containment
   - 15-30 min: Implement primary fix or rollback
   - 30-45 min: Validate systems and restore service
   - 45-60 min: Comprehensive testing before full restoration

4. **Risk Mitigation**
   - Database replication validation
   - Backup payment processing enabled
   - Load balancer failover ready
   - Communication team on standby

5. **Post-Incident**
   - Full RCA within 24 hours
   - Action items assigned
   - Prevention measures implemented
   - Communication to customers on resolution`,

    sustainability: `As VP of Sustainability, I would:

1. **Root Cause Analysis**
   - Water consumption: Manufacturing process design and facility efficiency
   - Transparency: Lack of supply chain tracking systems
   - Recycling: No infrastructure or incentive for customers
   - Labor: Supplier oversight and compliance mechanisms
   - Carbon: Logistics and material production processes

2. **Top 5 Priorities**
   - Implement supply chain visibility (blockchain/IoT tracking)
   - Redesign manufacturing process to reduce water by 70%
   - Launch customer take-back and recycling program
   - Audit and improve supplier labor practices
   - Switch to renewable energy for manufacturing

3. **Measurable Goals**
   - Water: 15,000L → 4,500L per garment (70% reduction)
   - Supply chain: 100% transparency within 18 months
   - Recycling: 30% of produced items recycled within 3 years
   - Labor: 100% of suppliers certified compliant within 2 years
   - Carbon: 50% reduction per unit within 3 years

4. **Implementation Timeline**
   - Year 1: Assessments, supplier engagement, pilot recycling program
   - Year 2: Full manufacturing upgrade, blockchain implementation
   - Year 3: Scale recycling, measure and communicate impact

5. **Business Impact**
   - Cost: $8M investment, $2M/year operational savings by year 3
   - Revenue: 15-20% premium pricing for sustainable line
   - Risk reduction: Regulatory compliance and brand protection
   - Competitive advantage: Market leader in sustainable fashion

6. **Success Metrics**
   - Water and carbon footprint tracking dashboards
   - Supplier compliance scores
   - Customer participation rates in recycling
   - Brand perception improvement

7. **Stakeholder Strategy**
   - Transparent reporting to customers and investors
   - Supplier partnership approach rather than punishment
   - Employee engagement in sustainability initiatives`,

    team: `As Engineering Manager, my 90-day plan:

1. **Diagnostic Approach (Week 1-2)**
   - 1-on-1s with each team member (confidential)
   - Code review of recent work (quality assessment)
   - Process documentation audit
   - Understand departure context

2. **Quick Wins (Days 1-30)**
   - Implement daily 15-min standup (reduce friction)
   - Create knowledge base for critical systems
   - Celebrate completed launch despite delays
   - Have coffee chats with departing employees

3. **Process Improvements**
   - Asynchronous communication protocols (time zones)
   - Weekly cross-functional sync (frontend+backend)
   - Sprint planning with estimation confidence
   - Documentation requirements for all PRs

4. **Retention Strategy**
   - Understanding departure reasons
   - Career development conversations with remaining strong performers
   - Recognition program for crisis-period efforts

5. **Morale Rebuild**
   - Realistic sprint planning (avoid overcommitment)
   - Focus on shipping smaller features successfully
   - Team building activities (virtual + in-person)

6. **Role Clarity**
   - RACI matrix for decisions
   - Clear expectations and growth paths
   - Technical leads defined for each domain

7. **Success Metrics**
   - Sprint velocity stabilization
   - Issue resolution time
   - Team satisfaction scores
   - Zero critical bugs in production

8. **Long-term Vision**
   - Autonomous, cross-functional sub-teams
   - Strong testing culture
   - Mentorship and growth-focused environment`,
  };

  return responses[promptType] || "";
}

async function populateEvaluations() {
  const connection = await pool.getConnection();

  try {
    console.log("📊 Starting mock evaluation population...");

    // Get all candidates
    const [candidates] = await connection.execute(
      "SELECT id, first_name FROM candidates",
    );
    console.log(`Found ${candidates.length} candidates to evaluate`);

    const prompts = getAllPrompts();
    let evaluationsCreated = 0;

    // Create evaluations for each candidate for each prompt
    for (const candidate of candidates) {
      for (const prompt of prompts) {
        try {
          const evaluation = generateMockEvaluation(prompt.id, candidate.id);
          const response = generateMockResponse(
            prompt.id,
            candidate.first_name,
          );
          const evaluatorNotes = `Mock evaluation for ${prompt.name}. Generated for demo purposes.`;

          await connection.execute(
            `INSERT INTO evaluations (candidate_id, prompt_type, response, rubric_scores, total_score, evaluator_notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              candidate.id,
              prompt.id,
              response,
              JSON.stringify(evaluation.rubricScores),
              evaluation.totalScore,
              evaluatorNotes,
            ],
          );

          evaluationsCreated++;
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            // Evaluation already exists, skip
            continue;
          }
          throw error;
        }
      }
    }

    console.log(`✓ Created ${evaluationsCreated} evaluations`);

    // Verify rankings were created by triggers
    const [rankings] = await connection.execute(
      "SELECT COUNT(*) as count FROM rankings",
    );
    console.log(`✓ Rankings auto-generated: ${rankings[0].count}`);

    // Get top 10 for verification
    const [topTen] = await connection.execute(`
  SELECT
    c.first_name,
    c.last_name,
    r.overall_score,
    r.crisis_score,
    r.sustainability_score,
    r.team_score
  FROM rankings r
  JOIN candidates c ON r.candidate_id = c.id
  ORDER BY r.overall_score DESC
  LIMIT 10
`);


    console.log("\n🏆 Top 10 Candidates:");
    topTen.forEach((candidate, idx) => {
      console.log(
        `${idx + 1}. ${candidate.first_name} ${candidate.last_name} - Overall: ${Number(candidate.overall_score).toFixed(2)}`,
      );
    });
  } catch (error) {
    console.error("Error populating evaluations:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

populateEvaluations()
  .then(() => {
    console.log("\n✅ Mock evaluation population complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Evaluation population failed:", err.message);
    process.exit(1);
  });
