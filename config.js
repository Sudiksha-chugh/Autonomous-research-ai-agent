import dotenv from "dotenv";
dotenv.config();

export const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
export const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
export const DATABASE_URL = process.env.DATABASE_URL;

if (!SERPAPI_API_KEY) throw new Error("Missing SERPAPI_API_KEY in .env");
if (!DATABASE_URL) throw new Error("Missing DATABASE_URL in .env");