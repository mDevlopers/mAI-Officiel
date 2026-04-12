import { tool } from "ai";
import { z } from "zod";

const normalizeSuggestions = (suggestions: string[]) =>
  suggestions
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 3);

export const followUpSuggestions = tool({
  description:
    "Generate up to 3 short follow-up prompts based on the current answer context. Keep prompts actionable and user-ready.",
  inputSchema: z.object({
    responseDraft: z
      .string()
      .min(1)
      .max(4000)
      .describe("Draft response used as context to propose follow-up prompts."),
    userLanguage: z
      .string()
      .min(2)
      .max(24)
      .optional()
      .describe(
        "BCP-47 language tag or language name inferred from user prompt."
      ),
  }),
  execute: async ({ responseDraft, userLanguage }) => {
    const cleanedDraft = responseDraft.replace(/\s+/g, " ").trim();
    const seed = cleanedDraft
      .split(/[.!?]/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .slice(0, 3);

    const fallbackLanguage = (userLanguage ?? "fr").toLowerCase();
    const defaults = fallbackLanguage.startsWith("fr")
      ? [
          "Donne-moi une version plus concise",
          "Ajoute un exemple concret",
          "Transforme cela en plan d'action",
        ]
      : [
          "Give me a shorter version",
          "Add a concrete example",
          "Turn this into an action plan",
        ];

    const inferred = normalizeSuggestions(
      seed.map((sentence) => {
        const shortSentence = sentence.slice(0, 80);
        return fallbackLanguage.startsWith("fr")
          ? `Approfondis: ${shortSentence}`
          : `Go deeper on: ${shortSentence}`;
      })
    );

    const suggestions = normalizeSuggestions([...inferred, ...defaults]);

    return {
      suggestions,
      markdownHints: suggestions.map(
        (item) => `[${item}](mai-suggest:${encodeURIComponent(item)})`
      ),
    };
  },
});
