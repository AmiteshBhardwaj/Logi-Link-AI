import { NextRequest, NextResponse } from "next/server";
import { handleVoiceQuery } from "../voice_handler";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio = body?.audioBase64;
    if (!audio) {
      return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    }
    const language = body?.language;
    const result = await handleVoiceQuery({ base64Audio: audio, language });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice handler failed", error);
    const errorMessage = error instanceof Error ? error.message : "Voice handler failed";
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? String(error) : undefined },
      { status: 500 }
    );
  }
}

