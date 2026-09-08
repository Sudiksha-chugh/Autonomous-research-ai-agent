import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import { SERPAPI_API_KEY } from "./config.js";
import { embedText } from "./llm.js";
import { insertSource, searchSimilar } from "./db.js";

let currentTopic = "general";
export function setCurrentTopic(topic) {
  currentTopic = topic;
}

export const webSearchTool = tool(
  async ({ query }) => {
    const params = { q: query, api_key: SERPAPI_API_KEY, num: 3, engine: "google" };
    const resp = await axios.get("https://serpapi.com/search", { params, timeout: 15000 });
    const organic = resp.data.organic_results || [];

    const results = organic.slice(0, 3).map((r) => ({
      title: r.title || "",
      link: r.link || "",
      snippet: r.snippet || "",
    }));

    // Every result gets embedded and stored — this is how memory builds up over time
    for (const r of results) {
      const embedding = await embedText(`${r.title}\n${r.snippet}`);
      await insertSource({ topic: currentTopic, title: r.title, link: r.link, summary: r.snippet, embedding });
    }

    return JSON.stringify(results, null, 2);
  },
  {
    name: "web_search",
    description: "Search Google for current information. Use for facts not already found in memory.",
    schema: z.object({ query: z.string().describe("The search query") }),
  }
);

export const memorySearchTool = tool(
  async ({ query }) => {
    const embedding = await embedText(query);
    const rows = await searchSimilar(embedding, 5);
    if (rows.length === 0) return "No relevant memory found.";
    return rows
      .map((r, i) => `[${i + 1}] (${r.topic}) ${r.title}\n${r.summary}\n(distance: ${r.distance.toFixed(3)})`)
      .join("\n\n");
  },
  {
    name: "memory_search",
    description: "Search previously researched sources in the vector database before doing a new web search.",
    schema: z.object({ query: z.string().describe("What to look for in past research") }),
  }
);

export const tools = [webSearchTool, memorySearchTool];