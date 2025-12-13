-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Users (mapped to Supabase Auth)
create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references organizations (id),
  role text check (role in ('Coordinator', 'Manager', 'Admin')),
  created_at timestamptz not null default now()
);

-- Contracts metadata
create table if not exists contracts (
  id bigserial primary key,
  organization_id uuid references organizations (id),
  document_name text not null,
  version text,
  embedding_version text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Shipments
create table if not exists shipments (
  id bigserial primary key,
  organization_id uuid references organizations (id),
  external_ref text,
  current_status text not null,
  current_location text,
  delay_duration_hours integer,
  last_updated_at timestamptz not null default now(),
  associated_contract_id bigint references contracts (id)
);

create index if not exists idx_shipments_org_external on shipments (organization_id, external_ref);

-- Tracking events
create table if not exists tracking_events (
  id bigserial primary key,
  shipment_id bigint references shipments (id) on delete cascade,
  event_code text,
  event_description text,
  event_timestamp timestamptz not null default now()
);

create index if not exists idx_tracking_events_shipment_time on tracking_events (shipment_id, event_timestamp desc);

-- Documents (chunked text)
create table if not exists documents (
  id bigserial primary key,
  contract_id bigint references contracts (id) on delete cascade,
  chunk_order integer,
  content_text text not null,
  metadata jsonb
);

-- Embeddings table
create table if not exists embeddings (
  document_id bigint primary key references documents (id) on delete cascade,
  embedding_vector vector(1536) not null,
  model_used text
);

-- Vector index
create index if not exists embeddings_vector_idx on embeddings using ivfflat (embedding_vector vector_cosine_ops) with (lists = 100);

-- Voice session audit
create table if not exists voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id),
  start_time timestamptz default now(),
  source_language text,
  final_transcript text,
  llm_response_id uuid
);

create table if not exists audio_segments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references voice_sessions (id) on delete cascade,
  audio_blob bytea,
  transcription_confidence real
);

-- Vector search helper
create or replace function match_documents (
  query_embedding vector,
  match_count int default 5,
  match_threshold float default 0.6
) returns table (
  document_id bigint,
  contract_id bigint,
  content_text text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select d.id,
         d.contract_id,
         d.content_text,
         d.metadata,
         1 - (e.embedding_vector <=> query_embedding) as similarity
  from embeddings e
  join documents d on d.id = e.document_id
  where 1 - (e.embedding_vector <=> query_embedding) > match_threshold
  order by e.embedding_vector <=> query_embedding
  limit match_count;
end;
$$;

-- Seed demo org and sample shipments
insert into organizations (id, name)
values ('00000000-0000-0000-0000-000000000000', 'Demo Freight Forwarder')
on conflict (id) do nothing;

insert into contracts (id, organization_id, document_name, version, embedding_version)
values (1001, '00000000-0000-0000-0000-000000000000', 'Master Freight Contract', 'v1.0', 'emb-v1')
on conflict (id) do nothing;

insert into shipments (id, organization_id, external_ref, current_status, current_location, delay_duration_hours, last_updated_at, associated_contract_id)
values
  (999001, '00000000-0000-0000-0000-000000000000', 'LL-999001', 'Customs Hold', 'Frankfurt (FRA)', 52, now() - interval '1 hour', 1001),
  (999002, '00000000-0000-0000-0000-000000000000', 'LL-999002', 'In Transit', 'Hamburg', null, now() - interval '2 hours', 1001)
on conflict (id) do nothing;

insert into tracking_events (shipment_id, event_code, event_description, event_timestamp)
values
  (999001, 'CZ01', 'Shipment held in customs inspection at FRA', now() - interval '52 hours'),
  (999001, 'DOC', 'Awaiting broker paperwork', now() - interval '48 hours'),
  (999002, 'MOV', 'Departed port', now() - interval '5 hours');

-- RLS setup (basic tenant isolation)
alter table shipments enable row level security;
drop policy if exists shipments_org_rls on shipments;
create policy shipments_org_rls on shipments
  for select using (organization_id = coalesce(current_setting('request.jwt.claims', true)::json->>'org_id', organization_id));

alter table tracking_events enable row level security;
drop policy if exists tracking_events_org_rls on tracking_events;
create policy tracking_events_org_rls on tracking_events
  for select using (
    shipment_id in (
      select id from shipments where organization_id = coalesce(current_setting('request.jwt.claims', true)::json->>'org_id', organization_id)
    )
  );

