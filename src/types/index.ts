export type Locale = "en" | "hi" | "zh" | "es";

export type Shipment = {
  id: number;
  organization_id: string;
  external_ref: string;
  current_status: string;
  current_location: string;
  delay_duration_hours: number | null;
  last_updated_at: string;
  associated_contract_id?: number | null;
};

export type TrackingEvent = {
  id: number;
  shipment_id: number;
  event_code?: string | null;
  event_description: string;
  event_timestamp: string;
};

export type Contract = {
  id: number;
  organization_id: string;
  document_name: string;
  version?: string | null;
  embedding_version?: string | null;
  is_active: boolean;
};

export type DocumentChunk = {
  id: number;
  contract_id: number;
  chunk_order: number;
  content_text: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingRow = {
  document_id: number;
  embedding_vector: number[];
  model_used: string;
};

export type VectorSearchResult = {
  document_id: number;
  contract_id: number;
  content_text: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

export type ReasoningRequest = {
  query: string;
  shipmentId?: number;
  language?: Locale;
};

export type HybridAnswer = {
  answer: string;
  language: Locale;
  liveData?: Shipment & { latest_event?: TrackingEvent | null };
  citations?: VectorSearchResult[];
  confidence?: number;
  reasoning_trace?: string[];
};

export type VoiceTranscription = {
  text: string;
  language: Locale;
  confidence?: number;
};

