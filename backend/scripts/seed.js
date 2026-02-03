import { faker } from "@faker-js/faker";
import pool from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const SKILLS = [
  "JavaScript",
  "Python",
  "Java",
  "TypeScript",
  "React",
  "Node.js",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Go",
  "Rust",
  "C++",
  "Product Management",
  "Design",
  "Data Analysis",
  "Machine Learning",
  "DevOps",
  "System Design",
  "Leadership",
  "Communication",
  "Project Management",
  "Agile",
];

async function generateFakeCandidates(count = 40) {
  const candidates = [];

  const generatePhone = () => {
    const digits = faker.string.numeric(10);
    return faker.datatype.boolean() ? `+${digits}` : digits;
  };

  for (let i = 0; i < count; i++) {
    candidates.push({
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: generatePhone(),
      location: faker.location.city() + ", " + faker.location.state(),
      bio: faker.lorem.paragraph(2),
      avatar_url: faker.image.avatar(),
      years_experience: faker.number.int({ min: 1, max: 20 }),
      primary_skill: SKILLS[Math.floor(Math.random() * SKILLS.length)],
      secondary_skills: JSON.stringify(
        Array.from(
          { length: 3 },
          () => SKILLS[Math.floor(Math.random() * SKILLS.length)],
        ),
      ),
      linkedin_url: `https://linkedin.com/in/${faker.internet.username()}`,
      github_url: `https://github.com/${faker.internet.username()}`,
      website_url: faker.internet.url(),
    });
  }

  return candidates;
}

async function seedDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("🌱 Starting database seeding...");

    // Generate candidates
    const candidates = await generateFakeCandidates(40);
    console.log(`📝 Generated ${candidates.length} fake profiles`);

    // Insert candidates
    const insertQuery = `
      INSERT INTO candidates (
        first_name, last_name, email, phone, location, bio, avatar_url,
        years_experience, primary_skill, secondary_skills, linkedin_url,
        github_url, website_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    let inserted = 0;
    for (const candidate of candidates) {
      try {
        await connection.execute(insertQuery, [
          candidate.first_name,
          candidate.last_name,
          candidate.email,
          candidate.phone,
          candidate.location,
          candidate.bio,
          candidate.avatar_url,
          candidate.years_experience,
          candidate.primary_skill,
          candidate.secondary_skills,
          candidate.linkedin_url,
          candidate.github_url,
          candidate.website_url,
        ]);
        inserted++;
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          // Handle duplicate email
          continue;
        }
        throw error;
      }
    }

    console.log(`✓ Inserted ${inserted} candidates into database`);

    // Fetch all candidates for verification
    const [candidates_list] = await connection.execute(
      "SELECT COUNT(*) as count FROM candidates",
    );
    console.log(`✓ Total candidates in database: ${candidates_list[0].count}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await connection.release();
  }
}

seedDatabase()
  .then(() => {
    console.log("\n✅ Database seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  });
