import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { z } from "zod";

const SpeakyRequestSchema = z.object({
  text: z.string().trim().min(1).max(220),
  language: z.string().trim().min(2).max(8).default("fr"),
});

/**
 * Endpoint TTS sans clé API.
 * Implémentation basée sur un endpoint public Google Translate TTS.
 * Limite volontaire à 220 caractères pour rester fiable avec ce provider.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SpeakyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres invalides (texte max 220 caractères)." },
        { status: 400 }
      );
    }

    const { language, text } = parsed.data;
    const ttsUrl = new URL("https://translate.google.com/translate_tts");
    ttsUrl.searchParams.set("ie", "UTF-8");
    ttsUrl.searchParams.set("client", "tw-ob");
    ttsUrl.searchParams.set("tl", language);
    ttsUrl.searchParams.set("q", text);

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: "Échec de génération audio", details },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      audioBase64,
      contentType: "audio/mpeg",
      durationEstimateSec: Math.ceil(text.length / 14),
      provider: "public-google-tts",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erreur serveur Speaky",
      },
      { status: 500 }
    );
  }
}
