import { transcribeAudio } from "@/lib/integrations/whisper";
import { runHybridReasoner } from "./hybrid_reasoner";
import type { HybridAnswer, Locale } from "@/types";

export async function handleVoiceQuery(params: {
  base64Audio: string;
  language?: Locale;
}): Promise<{ transcript: string; result: HybridAnswer }> {
  const transcription = await transcribeAudio(params.base64Audio, params.language || "en");
  const hybridResult = await runHybridReasoner({
    query: transcription.text,
    language: transcription.language
  });

  return {
    transcript: transcription.text,
    result: hybridResult
  };
}

