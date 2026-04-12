import { tool } from "ai";
import { z } from "zod";

export const webSearch = tool({
  description:
    "Search the web for up-to-date information, news, or general knowledge.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The search query to send to the web search engine."),
  }),
  execute: async (input) => {
    try {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) {
        return { error: "Clé API Tavily non configurée." };
      }

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: input.query,
          max_results: 20,
          include_answer: true,
          include_raw_content: false,
          search_depth: "advanced",
        }),
      });

      if (!response.ok) {
        return { error: `Erreur Tavily: ${response.statusText}` };
      }

      const data = (await response.json()) as {
        answer?: string;
        query?: string;
        results?: Array<{
          content?: string;
          score?: number;
          title?: string;
          url?: string;
        }>;
      };

      const results = (data.results ?? []).slice(0, 20).map((result) => ({
        score: result.score ?? 0,
        snippet: result.content ?? "",
        title: result.title ?? "Sans titre",
        url: result.url ?? "",
      }));

      return {
        answer: data.answer ?? "",
        query: data.query ?? input.query,
        results,
      };
    } catch (error) {
      console.error("Web Search Tool Error:", error);
      return { error: "Échec de la recherche web." };
    }
  },
});
