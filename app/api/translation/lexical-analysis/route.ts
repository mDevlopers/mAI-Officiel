import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai/providers";

const payloadSchema = z.object({
  text: z.string().trim().min(1).max(8000),
});

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
     const { text } = await generateText({
       model: getLanguageModel("openai/gpt-5.4-nano"),
       temperature: 0.2,
       system:
         "Tu es un assistant linguistique expert. Donne une analyse lexicale courte (max 4 phrases), précise et contextuelle. Corrige les erreurs de syntaxe, explique le registre, et mentionne toute ambiguïté.",
       prompt: `Analyse ce texte traduit. Identifie: registre, qualité de traduction, erreurs potentielles, suggestions d'amélioration: ${parsed.data.text}`,
     });

    return NextResponse.json({ analysis: text.trim() });
  } catch {
    return NextResponse.json(
      { error: "Impossible de générer l'analyse IA" },
      { status: 500 }
    );
  }
}
