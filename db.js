import pg from "pg";
import { DATABASE_URL } from "./config.js";

const { Pool } = pg;
export const pool = new Pool({ connectionString: DATABASE_URL });

export async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sources (
      id SERIAL PRIMARY KEY,
      topic TEXT NOT NULL,
      title TEXT,
      link TEXT,
      summary TEXT,
      embedding vector(768),
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}

export async function insertSource({ topic, title, link, summary, embedding }) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await pool.query(
    `INSERT INTO sources (topic, title, link, summary, embedding)
     VALUES ($1, $2, $3, $4, $5)`,
    [topic, title, link, summary, vectorLiteral]
  );
}

// Finds the most semantically similar past sources to a query
export async function searchSimilar(embedding, limit = 5) {
  const vectorLiteral = `[${embedding.join(",")}]`;
  const { rows } = await pool.query(
    `SELECT topic, title, link, summary, embedding <=> $1 AS distance
     FROM sources
     ORDER BY embedding <=> $1
     LIMIT $2`,
    [vectorLiteral, limit]
  );
  return rows;
}