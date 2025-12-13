# Database Setup Guide for Logi-Link AI

This guide will help you set up the Supabase database for Logi-Link AI.

## Quick Start

1. **Go to Supabase SQL Editor**
   - Navigate to: https://app.supabase.com/project/_/sql
   - Select your project

2. **Run the Schema SQL**
   - Copy the contents of `supabase_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

3. **Verify Setup**
   - Check that all tables are created in the "Table Editor"
   - Verify the `match_documents` function exists in "Database" > "Functions"

## Database Structure

### Core Tables

- **organizations** - Multi-tenant organization data
- **users** - User profiles linked to Supabase Auth
- **contracts** - Document metadata for RAG
- **shipments** - Live shipment tracking data
- **tracking_events** - Event log for shipments
- **documents** - Chunked text content for vector search
- **embeddings** - Vector embeddings (1536 dimensions)
- **voice_sessions** - Voice interaction audit trail
- **audio_segments** - Audio storage (optional)

### Key Functions

- **match_documents** - Vector similarity search function for RAG

## Important Notes

### Vector Extension
The schema requires the `vector` extension (pgvector). Supabase should have this enabled by default, but if you get errors:
- Go to Database > Extensions
- Enable "vector" if not already enabled

### Embedding Dimensions
The embeddings table uses **1536 dimensions** which matches OpenAI's `text-embedding-3-large` model. If you use a different model, update the vector size:
- `text-embedding-3-small`: 1536 dimensions
- `text-embedding-ada-002`: 1536 dimensions
- Other models may vary

### Row Level Security (RLS)
RLS is enabled on `shipments` and `tracking_events` for multi-tenant isolation. For development, you can temporarily disable RLS if needed:
```sql
ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events DISABLE ROW LEVEL SECURITY;
```

## Testing the Setup

### 1. Check Demo Data
```sql
SELECT * FROM shipments;
SELECT * FROM tracking_events;
SELECT * FROM contracts;
```

### 2. Test Vector Search Function
```sql
-- This will return empty results until you ingest documents
SELECT * FROM match_documents(
  (SELECT embedding_vector FROM embeddings LIMIT 1),
  5,
  0.6
);
```

### 3. Verify Extensions
```sql
SELECT * FROM pg_extension WHERE extname IN ('vector', 'pgcrypto');
```

## Ingesting Documents

After setting up the schema, you can ingest documents via the API:

```bash
POST /api/ingest
{
  "contractId": 1001,
  "text": "Your document text here...",
  "documentName": "Sample Contract"
}
```

Or use the Supabase dashboard to manually insert test documents.

## Troubleshooting

### Error: "extension vector does not exist"
- Enable the vector extension in Supabase Dashboard > Database > Extensions

### Error: "function match_documents does not exist"
- Re-run the function creation SQL from `supabase_schema.sql`

### Error: "relation embeddings does not exist"
- Make sure you ran the complete schema SQL file
- Check that all CREATE TABLE statements executed successfully

### Vector Search Returns Empty Results
- This is normal if no documents have been ingested yet
- Use the `/api/ingest` endpoint to add documents
- Documents need to be chunked and embedded before they appear in search results

## Next Steps

1. ✅ Database schema is set up
2. ⏭️ Configure environment variables (`.env.local`)
3. ⏭️ Ingest sample documents for RAG
4. ⏭️ Test the hybrid reasoning API

