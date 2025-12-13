-- ============================================================================
-- Logi-Link AI - Complete Supabase Database Schema
-- ============================================================================
-- This file contains the complete database schema for Logi-Link AI
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Step 1: Enable required PostgreSQL extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Step 2: Create Organizations Table (Multi-tenancy)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create Users Table (linked to Supabase Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations (id),
  role TEXT CHECK (role IN ('Coordinator', 'Manager', 'Admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create Contracts Table (Document Metadata)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations (id),
  document_name TEXT NOT NULL,
  version TEXT,
  embedding_version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 5: Create Shipments Table (Live Tracking Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  organization_id UUID REFERENCES organizations (id),
  external_ref TEXT,
  current_status TEXT NOT NULL,
  current_location TEXT,
  delay_duration_hours INTEGER,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  associated_contract_id BIGINT REFERENCES contracts (id)
);

-- Index for faster shipment lookups
CREATE INDEX IF NOT EXISTS idx_shipments_org_external 
  ON shipments (organization_id, external_ref);

-- Step 6: Create Tracking Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id BIGSERIAL PRIMARY KEY,
  shipment_id BIGINT REFERENCES shipments (id) ON DELETE CASCADE,
  event_code TEXT,
  event_description TEXT,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster event queries
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_time 
  ON tracking_events (shipment_id, event_timestamp DESC);

-- Step 7: Create Documents Table (Chunked Text for RAG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT REFERENCES contracts (id) ON DELETE CASCADE,
  chunk_order INTEGER,
  content_text TEXT NOT NULL,
  metadata JSONB
);

-- Step 8: Create Embeddings Table (Vector Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS embeddings (
  document_id BIGINT PRIMARY KEY REFERENCES documents (id) ON DELETE CASCADE,
  embedding_vector vector(1536) NOT NULL,
  model_used TEXT
);

-- Vector similarity index (IVFFlat for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS embeddings_vector_idx 
  ON embeddings 
  USING ivfflat (embedding_vector vector_cosine_ops) 
  WITH (lists = 100);

-- Step 9: Create Voice Sessions Table (Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  source_language TEXT,
  final_transcript TEXT,
  llm_response_id UUID
);

-- Step 10: Create Audio Segments Table (Optional - for debugging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audio_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voice_sessions (id) ON DELETE CASCADE,
  audio_blob BYTEA,
  transcription_confidence REAL
);

-- Step 11: Create Vector Search Function (Critical for RAG)
-- ============================================================================
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  match_threshold float DEFAULT 0.6
) 
RETURNS TABLE (
  document_id bigint,
  contract_id bigint,
  content_text text,
  metadata jsonb,
  similarity float
) 
LANGUAGE plpgsql 
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.contract_id,
    d.content_text,
    d.metadata,
    1 - (e.embedding_vector <=> query_embedding) AS similarity
  FROM embeddings e
  JOIN documents d ON d.id = e.document_id
  WHERE 1 - (e.embedding_vector <=> query_embedding) > match_threshold
  ORDER BY e.embedding_vector <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 12: Seed Demo Data
-- ============================================================================

-- Insert demo organization
INSERT INTO organizations (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Freight Forwarder')
ON CONFLICT (id) DO NOTHING;

-- Insert demo contract
INSERT INTO contracts (id, organization_id, document_name, version, embedding_version)
VALUES (1001, '00000000-0000-0000-0000-000000000000', 'Master Freight Contract', 'v1.0', 'emb-v1')
ON CONFLICT (id) DO NOTHING;

-- Insert demo shipments
INSERT INTO shipments (id, organization_id, external_ref, current_status, current_location, delay_duration_hours, last_updated_at, associated_contract_id)
VALUES
  (999001, '00000000-0000-0000-0000-000000000000', 'LL-999001', 'Customs Hold', 'Frankfurt (FRA)', 52, NOW() - INTERVAL '1 hour', 1001),
  (999002, '00000000-0000-0000-0000-000000000000', 'LL-999002', 'In Transit', 'Hamburg', NULL, NOW() - INTERVAL '2 hours', 1001)
ON CONFLICT (id) DO NOTHING;

-- Insert demo tracking events
INSERT INTO tracking_events (shipment_id, event_code, event_description, event_timestamp)
VALUES
  (999001, 'CZ01', 'Shipment held in customs inspection at FRA', NOW() - INTERVAL '52 hours'),
  (999001, 'DOC', 'Awaiting broker paperwork', NOW() - INTERVAL '48 hours'),
  (999002, 'MOV', 'Departed port', NOW() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

-- Step 13: Enable Row Level Security (RLS) for Multi-tenancy
-- ============================================================================

-- Enable RLS on shipments
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS shipments_org_rls ON shipments;

CREATE POLICY shipments_org_rls ON shipments
  FOR SELECT 
  USING (
    organization_id = COALESCE(
      (current_setting('request.jwt.claims', TRUE)::json->>'org_id')::uuid,
      organization_id
    )
  );

-- Enable RLS on tracking_events
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS tracking_events_org_rls ON tracking_events;

CREATE POLICY tracking_events_org_rls ON tracking_events
  FOR SELECT 
  USING (
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE organization_id = COALESCE(
        (current_setting('request.jwt.claims', TRUE)::json->>'org_id')::uuid,
        organization_id
      )
    )
  );

-- ============================================================================
-- Schema Setup Complete!
-- ============================================================================
-- Next Steps:
-- 1. Verify all tables were created: Check the Tables section in Supabase
-- 2. Verify the match_documents function exists: Check Functions section
-- 3. Test the vector search by ingesting some documents via the /api/ingest endpoint
-- 4. Verify demo data: SELECT * FROM shipments;
-- ============================================================================

