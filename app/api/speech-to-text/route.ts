import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&language=fr&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": audioFile.type || "audio/webm",
        },
        body: audioFile,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Deepgram Error Response:", errText);
      return NextResponse.json(
        { error: "Deepgram error", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("speech-to-text error", error);
    return NextResponse.json(
      { error: "Speech to text failed" },
      { status: 500 }
    );
  }
}
