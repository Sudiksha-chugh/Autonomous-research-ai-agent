import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { OLLAMA_MODEL, OLLAMA_EMBED_MODEL } from "./config.js";

export const chatModel = new ChatOllama({ model: OLLAMA_MODEL, temperature: 0.3 });

const embedder = new OllamaEmbeddings({ model: OLLAMA_EMBED_MODEL });

export async function embedText(text) {
  return embedder.embedQuery(text);
}