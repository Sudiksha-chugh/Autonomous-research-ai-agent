import dotenv from "dotenv";
dotenv.config();

export const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

if (!SERPAPI_API_KEY) {
  throw new Error("Missing SERPAPI_API_KEY in .env");
}