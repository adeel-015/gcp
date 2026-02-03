import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    multipleStatements: true,
  });

  try {
    // Create database
    const dbName = process.env.DB_NAME || "evaluator_db";
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query(`CREATE DATABASE \`${dbName}\``);

    // Use the database
    await connection.query(`USE \`${dbName}\``);
    console.log(`✓ Database '${dbName}' created successfully`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, "../schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Execute full schema in a single call (supports triggers)
    await connection.query(schema);

    console.log("✓ Schema initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log("Database initialization complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Initialization failed:", err);
    process.exit(1);
  });
