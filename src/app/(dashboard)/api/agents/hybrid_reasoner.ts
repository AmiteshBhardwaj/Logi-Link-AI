import { supabaseAdminClient } from "@/lib/db/supabaseClient";
import { searchSimilar } from "@/lib/embeddings/vectorStore";
import { callLLM } from "@/lib/integrations/llmService";
import { buildHybridUserPrompt, hybridSystemPrompt } from "../llm/prompt_templates";
import type { HybridAnswer, ReasoningRequest, Shipment, TrackingEvent, VectorSearchResult } from "@/types";

async function fetchShipment(shipmentId?: number) {
  if (!shipmentId) return { shipment: null, latestEvent: null as TrackingEvent | null };

  const { data: shipment, error } = await supabaseAdminClient
    .from("shipments")
    .select("*")
    .eq("id", shipmentId)
    .maybeSingle();
  if (error) throw error;

  const { data: events, error: eventsError } = await supabaseAdminClient
    .from("tracking_events")
    .select("*")
    .eq("shipment_id", shipmentId)
    .order("event_timestamp", { ascending: false })
    .limit(1);
  if (eventsError) throw eventsError;

  return { shipment: shipment as Shipment | null, latestEvent: events?.[0] ?? null };
}

export async function runHybridReasoner(payload: ReasoningRequest): Promise<HybridAnswer> {
  const language = payload.language || "en";
  
  let shipment, latestEvent;
  try {
    const result = await fetchShipment(payload.shipmentId);
    shipment = result.shipment;
    latestEvent = result.latestEvent;
  } catch (error) {
    throw new Error(`Failed to fetch shipment data: ${error instanceof Error ? error.message : String(error)}`);
  }

  const shipmentContext = shipment
    ? `Shipment ${shipment.external_ref || shipment.id} is ${shipment.current_status} at ${shipment.current_location || "unknown"} with delay ${shipment.delay_duration_hours ?? 0} hours. Latest event: ${latestEvent?.event_description ?? "n/a"}`
    : "No shipment matched.";

  let ragResults: VectorSearchResult[];
  try {
    ragResults = await searchSimilar(`${payload.query} ${shipment?.current_status ?? ""} ${shipment?.current_location ?? ""}`, {
      matchCount: 5,
      threshold: 0.55
    });
  } catch (error) {
    console.error("Vector search error:", error);
    // Continue with empty results if vector search fails
    ragResults = [];
  }

  const ragSnippets = ragResults
    .map((r) => `Doc ${r.contract_id} (score ${r.similarity.toFixed(2)}): ${r.content_text}`)
    .join("\n");

  const userPrompt = buildHybridUserPrompt({
    query: payload.query,
    language,
    shipmentContext,
    ragSnippets: ragSnippets || "No citations found."
  });

  let llmResponse;
  try {
    llmResponse = await callLLM([
      { role: "system", content: hybridSystemPrompt },
      { role: "user", content: userPrompt }
    ]);
  } catch (error) {
    throw new Error(`LLM call failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    answer: llmResponse.answer,
    language: (llmResponse.language as HybridAnswer["language"]) || language,
    liveData: shipment ? { ...shipment, latest_event: latestEvent ?? undefined } : undefined,
    citations: ragResults,
    confidence: llmResponse.confidence ?? 0.72,
    reasoning_trace: llmResponse.trace ?? ["SQL lookup", "Vector search", "LLM synthesis"]
  };
}

