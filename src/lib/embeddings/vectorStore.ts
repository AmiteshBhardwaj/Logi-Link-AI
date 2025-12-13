import { OpenAI } from "openai";
import { supabaseAdminClient } from "../db/supabaseClient";
import type { VectorSearchResult } from "@/types";

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY environment variable is required. Please set it in your .env.local file.");
}

const embeddingModel = process.env.EMBEDDING_MODEL || "text-embedding-3-large";
const openai = new OpenAI({ apiKey: openaiApiKey });

export const chunkText = (text: string, chunkSize = 800, overlap = 80): string[] => {
  const sanitized = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < sanitized.length) {
    const end = Math.min(start + chunkSize, sanitized.length);
    chunks.push(sanitized.slice(start, end));
    start = end - overlap;
  }
  return chunks;
};

export const embedText = async (input: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    input,
    model: embeddingModel
  });
  return response.data[0]?.embedding ?? [];
};

export async function ingestDocument(params: {
  contractId: number;
  documentName: string;
  text: string;
  modelUsed?: string;
}) {
  const { contractId, documentName, text, modelUsed = embeddingModel } = params;
  const chunks = chunkText(text);

  const { data: contractExists, error: contractError } = await supabaseAdminClient
    .from("contracts")
    .select("id")
    .eq("id", contractId)
    .maybeSingle();

  if (contractError) throw contractError;
  if (!contractExists) {
    throw new Error(`Contract ${contractId} not found for ${documentName}`);
  }

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const embedding = await embedText(chunk);

    const { data: docRow, error: docError } = await supabaseAdminClient
      .from("documents")
      .insert({
        contract_id: contractId,
        chunk_order: i,
        content_text: chunk,
        metadata: { documentName, chunk }
      })
      .select("id")
      .single();

    if (docError) throw docError;

    const { error: embedError } = await supabaseAdminClient.from("embeddings").insert({
      document_id: docRow.id,
      embedding_vector: embedding,
      model_used: modelUsed
    });

    if (embedError) throw embedError;
  }

  return { chunksIngested: chunks.length };
}

export async function searchSimilar(query: string, options?: { matchCount?: number; threshold?: number }) {
  try {
    const embedding = await embedText(query);
    const { matchCount = 5, threshold = 0.6 } = options || {};

    const { data, error } = await supabaseAdminClient.rpc("match_documents", {
      query_embedding: embedding,
      match_count: matchCount,
      match_threshold: threshold
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      // If the function doesn't exist or there's a database error, return empty array
      if (error.message?.includes("function") || error.message?.includes("does not exist")) {
        console.warn("match_documents function may not exist. Returning empty results.");
        return [];
      }
      throw new Error(`Vector search failed: ${error.message || String(error)}`);
    }

    return (data || []) as VectorSearchResult[];
  } catch (error) {
    console.error("searchSimilar error:", error);
    // Return empty array on error to allow the reasoner to continue
    return [];
  }
}

