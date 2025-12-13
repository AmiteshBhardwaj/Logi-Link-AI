import { OpenAI } from "openai";
import type { Locale, VoiceTranscription } from "@/types";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required. Please set it in your .env.local file.");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

export async function transcribeAudio(base64Audio: string, language: Locale = "en"): Promise<VoiceTranscription> {
  const audioBuffer = Buffer.from(base64Audio, "base64");
  const file = new File([audioBuffer], "input.webm", { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: process.env.WHISPER_MODEL || "whisper-1",
    language,
    response_format: "verbose_json"
  });

  // Calculate confidence from segments if available
  const confidence = (transcription as any).segments?.reduce(
    (acc: number, seg: any) => acc + (seg?.avg_logprob ?? 0),
    0
  ) || undefined;

  return {
    text: transcription.text,
    language,
    confidence
  };
}

