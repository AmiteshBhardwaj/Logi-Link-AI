import { useEffect, useState } from "react";
import type { HybridAnswer, ReasoningRequest } from "@/types";

export function useHybridQuery(initial?: ReasoningRequest) {
  const [result, setResult] = useState<HybridAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = async (payload: ReasoningRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/hybrid_reasoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        // Include details if available (in development mode)
        const errorMsg = data.error || `Hybrid reasoner error: ${res.statusText}`;
        const details = data.details ? `\n\nDetails: ${data.details}` : "";
        throw new Error(errorMsg + details);
      }
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Hybrid query error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) {
      runQuery(initial);
    }
  }, []);

  return { result, loading, error, runQuery };
}

