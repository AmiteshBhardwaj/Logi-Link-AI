"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/types";

type Props = {
  onSubmit: (query: string, language: Locale) => Promise<void>;
};

export function VoiceInputWidget({ onSubmit }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState<Locale>("en");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const base64 = await blobToBase64(blob);
        const res = await fetch("/api/agents/voice_handler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: base64.split(",")[1], language })
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Voice transcription failed");
        }
        const data = await res.json();
        setTranscript(data.transcript || "");
        if (data.transcript) {
          await onSubmit(data.transcript, language);
        }
      } catch (err) {
        console.error("Voice transcription error:", err);
        setTranscript(`Error: ${err instanceof Error ? err.message : "Failed to transcribe audio"}`);
      }
    };

    recorder.start();
    setIsListening(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  };

  const handleSubmitText = async () => {
    if (!transcript.trim()) return;
    await onSubmit(transcript, language);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-accent-knowledge">Global Voice</p>
          <p className="text-text-primary">Speak or type your logistics question</p>
        </div>
        <select
          className="rounded-md border border-slate-700 bg-background-primary px-2 py-1 text-sm text-text-primary"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Locale)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="zh">Mandarin</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={isListening ? stopRecording : startRecording}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            isListening
              ? "bg-accent-critical text-black ring-2 ring-accent-critical"
              : "bg-slate-800 text-text-primary hover:ring-2 hover:ring-accent-knowledge"
          }`}
        >
          {isListening ? "Stop" : "Mic"}
        </button>
        <input
          className="w-full rounded-lg border border-slate-800 bg-background-primary/60 px-3 py-2 text-text-primary"
          placeholder="Ask about shipments, delays, liability..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <button
          onClick={handleSubmitText}
          className="rounded-lg bg-accent-knowledge px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

