# Logi-Link AI

## Project Description
Logi-Link AI is a multilingual agentic architecture designed for enterprise logistics that functions as a Digital Dispatcher to bridge the gap between static knowledge like SOPs or PDFs and dynamic reality like live tracking and ERPs. The application targets mid-sized freight forwarders and aims to reduce query resolution time by 90 percent by moving beyond passive dashboards to active reasoning. The core functionality relies on Hybrid Intelligence, which unifies structured SQL data for live tracking with Vector RAG for document retrieval into a single reasoning loop. This allows the system to correlate a shipment delay with specific legal clauses in a contract instantly. The system also features Global Voice, enabling seamless voice and text interaction in English, Hindi, Mandarin, and Spanish to assist frontline staff.
For the technical stack, we are utilizing a modern web architecture to replace the prototype's Python-based setup. The frontend is built using Next.js with the App Router and Tailwind CSS to provide a responsive, multilingual user interface. The backend leveraging Supabase provides a unified database solution: PostgreSQL is used to store structured shipment data (replacing the local JSON files), and Supabase Vector (pgvector) is used to store and retrieve embeddings from regulatory PDF documents (replacing ChromaDB). The orchestration layer is handled by Next.js server-side logic which integrates with LLMs like GPT-4o or Gemini to perform the synthesis and reasoning tasks previously managed by local LangChain scripts.

## Product Requirements Document
Product Requirements Document (PRD): Logi-Link AI - Digital Dispatcher v1.0

1. Introduction and Goals

1.1 Project Overview
Logi-Link AI is an agentic architecture designed to transform enterprise logistics operations by functioning as an \"Active Digital Dispatcher.\" It bridges the gap between static organizational knowledge (SOPs, Contracts, Policies) and dynamic, real-time operational data (Live Tracking, ERP status). The system aims to replace passive data monitoring with active, context-aware reasoning for exception management.

1.2 Target Audience
Mid-sized Freight Forwarders.

1.3 Key Personas
1. Frontline Logistics Coordinators: Require immediate, synthesized answers for active shipment exceptions.
2. Operations Managers: Need auditing tools and high-level compliance checks regarding penalties and liabilities.

1.4 Success Metrics (KPIs)
* Primary Goal: Reduce query resolution time for exception management by 90% compared to manual methods.
* Performance Goal: Complex Hybrid Reasoning Queries (SQL + RAG) resolved in under 5 seconds (Target Latency).
* Adoption Goal: Successful demonstration of seamless multilingual interaction (English, Hindi, Mandarin, Spanish).

2. Core Functionality and Features

2.1 Feature Set 1: Hybrid Intelligence Reasoning Engine (The Core Agent)
The system must seamlessly integrate two distinct data modalities into a single reasoning loop, orchestrated by an advanced LLM (GPT-4o or Gemini 1.5 Pro).

2.1.1 Dynamic Data Retrieval (SQL Layer)
The system must query the structured PostgreSQL database (via Supabase) to retrieve live shipment data.
*   Required Tables (Minimum for MVP): Shipments (Header data), Tracking_Events (Status updates, timestamps, locations).
*   Functionality: Must accurately translate natural language requests (e.g., \"Where is shipment 999 and when did it leave port?\") into executable SQL queries.

2.1.2 Static Knowledge Retrieval (Vector RAG Layer)
The system must retrieve relevant text chunks from embedded regulatory and contract documents stored in Supabase Vector (pgvector).
*   Source Data: 20-50 key PDF documents (Contracts, SOPs, Regulatory Policies).
*   Functionality: Must perform semantic similarity search based on the retrieved dynamic data context.

2.1.3 Active Reasoning Loop (Cross-Modal Synthesis)
The core output is the synthesized answer, not raw data points.
*   Requirement: The LLM must correlate findings from SQL (e.g., Shipment #999 is delayed 72 hours in Customs) with specific clauses retrieved via RAG (e.g., Contract Section 4.2 specifies liability exceptions for Customs delays under 48 hours).
*   Output: Definitive, actionable determination (e.g., \"No immediate carrier liability due to contract terms, but initiate documentation for filing X.\").

2.2 Feature Set 2: Global Voice and Multilingual Interface
The system must provide accessible interaction for field staff.

2.2.1 Input Modality Support
*   Supported Languages (Voice & Text): English, Hindi, Mandarin, Spanish.
*   Voice-to-Text Conversion: Utilize a robust ASR service (e.g., OpenAI Whisper API) prioritizing transcription accuracy over ultra-low latency, given the critical nature of logistical decisions.

2.2.2 User Interface (UI/UX)
*   Technology: Next.js App Router and Tailwind CSS.
*   Design Metaphor: "Command Center" – Mandatory Dark Mode with high-contrast alert accents (\"Code Red\").
*   Trust Visualization: The UI must visually differentiate the data source:
    *   Live Data Indicators (e.g., status tags sourced from SQL).
    *   Static Knowledge Citations (e.g., document icons linking to specific RAG source chunks).

2.3 Feature Set 3: Data Management and Ingestion
2.3.1 Document Ingestion Pipeline
*   Scope (MVP): Manual or admin-triggered processing of 20-50 documents.
*   Storage: Documents must be processed, chunked, embedded, and stored in Supabase Vector.
*   Update Cadence: Updates are infrequent (weekly/monthly). Re-indexing can be a scheduled or manual trigger via an administrative interface.

2.3.2 ERP/Data Integration Simulation
*   For MVP/Hackathon, live ERP integration is simulated via direct interaction with the Supabase PostgreSQL shipment tables.
*   Data Synchronization: Backend logic must handle the simulation of receiving new tracking events to populate the tables before reasoning occurs.

3. Technical Specifications and Architecture

3.1 Architecture Stack
| Component | Technology | Rationale |
| :--- | :--- | :--- |
| Frontend | Next.js (App Router), Tailwind CSS | Responsive, modern, supports built-in I18n for multilingual support. |
| Backend/Orchestration | Next.js Server Components/Actions | Replaces Python/Streamlit prototype; handles LLM integration and data fetching. |
| Database (Structured) | PostgreSQL (via Supabase) | Source of truth for live shipment data (replacing JSON files). |
| Vector Database (RAG) | Supabase Vector (pgvector) | Cloud-accessible, replacing local ChromaDB. |
| LLM Orchestration | LangChain (Model Agnostic) | Maintains modularity for swapping LLMs (GPT-4o/Gemini 1.5 Pro default). |

3.2 LLM Requirements
*   Primary Models: Must support complex reasoning and large context windows (e.g., GPT-4o, Gemini 1.5 Pro) to handle the length of legal documents during RAG synthesis.
*   Constraint: Architecture must facilitate future cost optimization via swapping to smaller models for simpler tasks, though not required for MVP.

3.3 Data Security and Compliance
*   Tenancy: Row Level Security (RLS) in Supabase must be configured to ensure strict data isolation between client environments/tenants.
*   PII Handling: Adhere to PII Best Practices. If data must pass to an external LLM provider, sanitization of sensitive customer names should occur at the orchestration layer if possible. Zero-retention Enterprise LLM endpoints are preferred.
*   GDPR: Full compliance is deferred past the initial build, but security best practices are mandatory.

4. Performance and Scalability Requirements

4.1 Latency Targets
*   Complex Reasoning Query (Hybrid): < 5 seconds (must feel instantaneous to the user).
*   ASR Transcription: Accuracy is prioritized over speed in noisy environments.

4.2 Concurrency
*   MVP Target: Stable performance supporting 50-100 concurrent users, validating the architectural shift to a scalable cloud stack.

5. Reasoning Complexity Thresholds (MVP Use Cases)

The system must successfully execute the following logical flow, defining the baseline for \"Active Reasoning\":

Scenario Example: Exception Management (Cross-Modal Reasoning)
1.  **Trigger**: User asks: \"Why is shipment #XYZ delayed?\"
2.  **SQL Step**: System retrieves: Shipment #XYZ delayed 60 hours in Port A due to Customs Hold.
3.  **RAG Step**: System searches contracts/SOPs for keywords: \"Customs Hold,\" \"Delay,\" \"Port A.\" Retrieves Clause X (stipulating liability based on delay duration).
4.  **Synthesis**: LLM compares 60 hours delay against Clause X threshold (e.g., 48 hours).
5.  **Output**: \"Shipment is delayed 60 hours. Under Contract Clause C-12, carrier liability applies after 48 hours. Prepare immediate penalty assessment documentation.\" (Active Answer).

## Technology Stack
# LOGI-LINK AI: TECHNOLOGY STACK DOCUMENTATION

## 1. Overview and Architecture Philosophy

Logi-Link AI is moving from a monolithic Python prototype to a scalable, modern web architecture to deliver a multilingual, agentic Digital Dispatcher. The core philosophy centers on **Hybrid Intelligence**: seamlessly unifying real-time structured data (SQL) with unstructured, contextual knowledge (Vector RAG) within a unified LLM orchestration loop. The selected stack prioritizes developer velocity (Next.js), unified data persistence/retrieval (Supabase), and state-of-the-art reasoning capabilities (Advanced LLMs).

## 2. Frontend Stack (User Experience & Multilingual Interface)

The frontend is designed for high responsiveness, visual clarity (Dark Mode Command Center aesthetic), and seamless multilingual support for global logistics staff.

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Provides server-side rendering (SSR) capabilities for initial load performance and simplifies complex routing and API route handling, crucial for server-side LLM orchestration. |
| **Styling/UI** | Tailwind CSS | Enables rapid construction of the required high-contrast, dark-mode \"Command Center\" interface. Excellent utility-first approach for maintaining visual consistency across multilingual components. |
| **State Management** | React Context / Hooks | Kept lean for the MVP. Complex global state will be managed primarily through context providers, relying on Next.js Server Components for initial data fetching to reduce client-side overhead. |
| **Internationalization (i18n)** | Next.js Internationalized Routing | Native support for handling English, Hindi, Mandarin, and Spanish translation layers required for the Global Voice interface. |

## 3. Backend & Orchestration Layer (Hybrid Intelligence Core)

This layer manages data persistence, vector indexing, and the critical logic that chains database queries with LLM reasoning.

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Platform & Database** | Supabase (PostgreSQL) | Provides a unified platform replacing disparate local systems. PostgreSQL is the robust backbone for structured data. |
| **Structured Data Storage** | PostgreSQL Tables | Stores Shipment Headers, Tracking Events, User Profiles, and ERP integration simulation data. |
| **Vector Database** | Supabase Vector (pgvector) | Cloud-native replacement for local ChromaDB. Stores embeddings generated from SOPs and contracts, allowing for direct SQL/Vector integration within the same database transaction context. |
| **Authentication & Security** | Supabase Auth & RLS | Row Level Security (RLS) is mandatory for enforcing data isolation and multi-tenancy between different freight forwarder clients (when scaled). |
| **Orchestration Framework** | LangChain (JS/TS flavor) | Essential for defining the complex, multi-step reasoning chains (SQL Retrieval -> RAG Lookup -> Synthesis). Provides the necessary abstraction layer for LLM model swapping. |
| **Primary Reasoning LLM** | GPT-4o / Gemini 1.5 Pro | Chosen for superior context window size and advanced multi-modal reasoning capabilities, critical for cross-referencing complex legal clauses against live data within the 5-second target latency window. |
| **Data Ingestion/Processing**| Next.js Server Actions/API Routes | Handles the backend logic for document parsing, embedding generation (using external embedding models), and batch insertion into `pgvector`. |

## 4. Specialized AI Components

These components handle specific inputs (voice) and critical reasoning tasks.

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Speech-to-Text (STT)** | OpenAI Whisper API | Selected for its industry-leading accuracy, which is prioritized over sub-second latency due to the high cost of logistical misinterpretation. Supports all required languages (EN, HI, ZH, ES). |
| **Embedding Model** | OpenAI Embeddings or a specialized open-source alternative (e.g., BGE family) | Used for converting document chunks into vectors stored in `pgvector`. Selection will be balanced between accuracy and cost efficiency during initial setup. |
| **Voice Interaction Handling** | Dedicated Next.js API Route | Acts as a gateway to stream audio input to Whisper, receive the transcript, and immediately feed the text into the LangChain Orchestration flow. |

## 5. Data Flow and Reasoning Requirements

The technology stack is explicitly chosen to enable the core "Active Reasoning" loop:

1.  **Live Data Retrieval:** Server logic executes optimized PostgreSQL queries to fetch real-time status for a given shipment ID.
2.  **Contextual Retrieval (RAG):** The LLM prompt is augmented by querying `pgvector` using the context derived from the real-time event (e.g., \"Customs Delay at Port X\").
3.  **Synthesis:** The unified context (SQL results + Vector results) is passed to the powerful LLM (GPT-4o/Gemini) via LangChain, enabling complex, cross-modal reasoning (e.g., determining liability based on the confluence of live tracking data and static contract language).

## 6. Deployment and Environment

| Component | Technology | Justification |
| :--- | :--- | :--- |
| **Hosting Platform** | Vercel (Recommended for Next.js) / AWS Amplify | Provides seamless CI/CD integration with the Next.js repository. Supabase instances will be deployed separately but connect easily via environment variables. |
| **Version Control** | Git (GitHub/GitLab) | Standard repository for source control and enabling collaborative development pipelines. |
| **Environment Management** | `.env` files and Supabase Project Settings | Configuration for database URLs, API keys (LLMs, Whisper), and RLS policies will be strictly managed via environment variables and the hosted platform controls. |

## Project Structure
PROJECT STRUCTURE DOCUMENT: LOGI-LINK AI

1. CORE ARCHITECTURE OVERVIEW
The system follows a decoupled, cloud-native architecture centered around Next.js for unified frontend/backend orchestration and Supabase for persistence and vector storage.

├── .next/                 (Next.js build output - Ignored by Git)
├── node_modules/          (Project dependencies)
├── public/                (Static assets, images, fonts)
│   └── assets/
│       └── icons/         (UI icons, Tailwind components)
│       └── logos/
├── src/                   (Main application source code)
│   ├── app/               (Next.js App Router structure)
│   │   ├── (auth)/        (Optional: Future authentication routes)
│   │   ├── (dashboard)/   (Main application interface)
│   │   │   ├── api/       (Server-side API routes for orchestration layer)
│   │   │   │   ├── agents/          (Orchestration logic entry points)
│   │   │   │   │   ├── hybrid_reasoner.ts  (Core logic: SQL + RAG synthesis)
│   │   │   │   │   └── voice_handler.ts      (Handles Whisper transcription routing)
│   │   │   │   └── llm/             (Interfacing with external LLM APIs)
│   │   │   │       └── prompt_templates.ts  (Reusable prompt definitions)
│   │   │   ├── layout.tsx         (Root layout, theme context setup)
│   │   │   ├── page.tsx           (The main Command Center Dashboard view)
│   │   │   └── globals.css        (Tailwind imports and base styles)
│   │   ├── favicon.ico
│   │   └── layout.tsx             (Root layout, metadata)
│   ├── components/        (Reusable React UI components)
│   │   ├── common/        (Generic, theme-agnostic components)
│   │   ├── dashboard/     (UI components specific to the Command Center)
│   │   │   ├── LiveStatusCard.tsx (Displays SQL-derived status, high contrast)
│   │   │   ├── PolicyCitation.tsx  (Displays RAG context, document reference)
│   │   │   └── VoiceInputWidget.tsx (Interface for Global Voice interaction)
│   │   └── ui/            (Tailwind components, potentially from shadcn/ui)
│   ├── lib/               (Utility functions, hooks, and external integrations)
│   │   ├── db/            (Supabase integration and client initialization)
│   │   │   ├── supabaseClient.ts
│   │   │   └── migrations/        (For initial SQL schema setup in PostgreSQL)
│   │   ├── embeddings/    (Vectorization and RAG utilities)
│   │   │   └── vectorStore.ts     (pgvector interaction logic)
│   │   ├── integrations/  (External service wrappers)
│   │   │   ├── llmService.ts      (Abstraction for GPT-4o/Gemini)
│   │   │   └── whisper.ts         (Voice transcription wrapper)
│   │   └── hooks/
│   │       └── useLogiData.ts     (Custom hooks for data fetching/caching)
│   └── types/             (TypeScript definitions)
│       └── index.ts
├── .env.local             (Local environment variables: Supabase Keys, LLM Keys)
├── next.config.js         (Next.js configuration)
├── package.json
├── postcss.config.js
├── tailwind.config.ts     (Tailwind configuration, defining dark mode/color palette)
└── tsconfig.json

2. COMPONENT FOLDER STRUCTURE EXPLANATIONS

2.1. src/app/
    - **(dashboard)/**: Groups all routes related to the main user-facing application, adhering to Next.js App Router best practices for modularity.
    - **api/server/agents/**: This is the critical orchestration layer. All complex reasoning happens here, acting as the 'brain' that calls Supabase SQL, Supabase Vector, and the LLM sequentially or in parallel.
        - `hybrid_reasoner.ts`: Contains the core function that executes the Cross-Modal Reasoning logic (e.g., taking Shipment ID, querying DB, searching vectors, synthesizing final answer).
        - `voice_handler.ts`: Manages the lifecycle of voice input: API call -> Whisper transcription -> Text passed to `hybrid_reasoner`.

2.2. src/components/
    - **dashboard/**: Components designed to reflect the "Command Center" visual metaphor.
        - `LiveStatusCard.tsx`: Must use highly visible colors (e.g., saturated red/green) based on real-time SQL data, fulfilling the UI constraint of visually distinguishing Live Data.
        - `PolicyCitation.tsx`: Displays text retrieved from RAG, clearly marked with document source links or icons (e.g., PDF icon) to build trust in Static Knowledge citations.
        - `VoiceInputWidget.tsx`: Primary interface for Global Voice, optimized for accessibility in noisy environments.

2.3. src/lib/
    - **db/**: Manages all interaction with Supabase.
        - `migrations/`: Placeholder for SQL scripts to define the initial `shipments` and `tracking_events` tables in PostgreSQL, and the necessary index for `pgvector`.
    - **embeddings/**: Focuses purely on the RAG pipeline's data handling layer.
        - `vectorStore.ts`: Handles embedding creation (if needed during ingestion) and querying `pgvector` for relevant document chunks based on the LLM's query context.
    - **integrations/**: Abstraction layer to ensure LLM and Voice APIs can be swapped easily (Model Agnostic goal).
        - `llmService.ts`: The single point of entry for calling GPT-4o or Gemini, responsible for managing API keys and context window limits.

3. DATA & KNOWLEDGE LAYERS

3.1. Supabase PostgreSQL (Structured Data)
    - **Schema**: `shipments` (ID, current_location, status_code, delay_duration, liability_flag) and `tracking_events` (shipment_id, timestamp, event_description).
    - **Security**: Row Level Security (RLS) will be configured immediately to isolate tenants/data sets, fulfilling the primary security requirement.

3.2. Supabase Vector (Unstructured Knowledge)
    - **Collection**: A single primary index for all SOPs, Contracts, and Regulatory PDFs.
    - **Ingestion**: Handled through a lightweight administrative interface or script (outside the core UI scope for MVP) that chunks the 20-50 documents and pushes embeddings to `pgvector` via the `vectorStore.ts` utility.
    - **Indexing**: Optimized for semantic search relevant to logistics clauses and penalty definitions.

4. WORKFLOW MAPPING (Hybrid Intelligence Loop)
1.  **User Input**: Voice (Whisper API) or Text input hits a Next.js API Route (e.g., `/api/agents/query`).
2.  **Orchestration**: `hybrid_reasoner.ts` executes:
    a.  **Data Retrieval**: Queries the SQL `shipments` table using the shipment ID provided in the query.
    b.  **Knowledge Retrieval**: Formulates a natural language query based on the issue (e.g., "Customs penalty clause for 72-hour delay") and queries the `pgvector` store.
    c.  **Synthesis**: Passes results from (a) and (b) simultaneously to the LLM (e.g., GPT-4o) with a structured prompt asking for a definitive, cited answer regarding liability or next steps.
3.  **Output**: Returns structured JSON containing the final answer, confidence score, and visual metadata linking back to the source SQL status and the specific Policy Citation component.

## Database Schema Design
SCHEMADESIGN: Logi-Link AI - Database Schema Design

========================================================================

1. OVERVIEW AND TECHNOLOGY STACK

------------------------------------------------------------------------

Logi-Link AI utilizes Supabase as its unified backend, leveraging PostgreSQL for structured data and pgvector for unstructured data embeddings. This design explicitly supports the Hybrid Intelligence model by co-locating relational (Live Tracking) and vector (Static Knowledge) data.


**Primary Technologies:** PostgreSQL (via Supabase), Supabase Vector (pgvector).


**Data Partitioning Strategy:**
1. Structured Data (Relational Tables): Managed by standard PostgreSQL.
2. Unstructured Data (Document Chunks & Embeddings): Managed by the `documents` and `embeddings` tables using `vector` columns in PostgreSQL.


**Security Constraint:** Row Level Security (RLS) will be implemented at the table level to ensure tenancy isolation across different enterprise clients (though this scope is simplified for the MVP).

========================================================================

2. STRUCTURED DATA MODELS (PostgreSQL Tables)

------------------------------------------------------------------------


---
### Table: organizations
(Used for multi-tenancy structure, even if MVP is single-tenant)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Unique organization identifier. |
| name | TEXT | NOT NULL, UNIQUE | Organization name (e.g., Freight Forwarder ABC). |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |


---
### Table: users
(Mapped to Supabase Auth Users, but stored here for relationship context)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) | Foreign Key to Supabase Auth. |
| organization_id | UUID | FOREIGN KEY (organizations) | Which organization the user belongs to. |
| role | TEXT | ENUM ('Coordinator', 'Manager', 'Admin') | User role defining permissions. |


---
### Table: shipments
(Core data simulating ERP/Live Tracking integration)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PRIMARY KEY | Shipment identifier (e.g., internal tracking number). |
| organization_id | UUID | FOREIGN KEY (organizations), RLS Policy | Tenant context. |
| external_ref | TEXT | INDEXED | The customer-facing Bill of Lading (BOL) or tracking ID. |
| current_status | TEXT | NOT NULL | e.g., 'In Transit', 'Customs Hold', 'Delivered'. |
| current_location | TEXT | | Last known geographic location. |
| delay_duration_hours | INTEGER | NULLABLE | Calculated delay time in hours (critical for reasoning). |
| last_updated_at | TIMESTAMPTZ | NOT NULL | Time of last status change. |
| associated_contract_id | BIGINT | NULLABLE, FOREIGN KEY (contracts) | Link to the governing contract document. |


---
### Table: tracking_events
(Log of granular shipment movements)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PRIMARY KEY | Event ID. |
| shipment_id | BIGINT | FOREIGN KEY (shipments) | Shipment linkage. |
| event_code | TEXT | | ERP/Carrier defined code (e.g., CZ01 for Customs Delay). |
| event_description | TEXT | | Human-readable description. |
| event_timestamp | TIMESTAMPTZ | NOT NULL | When the event occurred. |


---
### Table: contracts
(Metadata for documents used in RAG)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PRIMARY KEY | Document/Contract ID. |
| organization_id | UUID | FOREIGN KEY (organizations) | Tenant context. |
| document_name | TEXT | NOT NULL | Original filename or title. |
| version | TEXT | | Document version (e.g., v3.1). |
| embedding_version | TEXT | | Tracks when the document was last vectorized. |
| is_active | BOOLEAN | DEFAULT TRUE | Status for ingestion pipeline. |

========================================================================

3. UNSTRUCTURED DATA MODELS (Vector RAG using pgvector)

------------------------------------------------------------------------

These tables facilitate the "Static Knowledge" lookup, bridging text content with its vector representation.


---
### Table: documents
(Stores the metadata and the actual text content of document chunks)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | BIGINT | PRIMARY KEY | Unique chunk ID. |
| contract_id | BIGINT | FOREIGN KEY (contracts) | Which source document this chunk belongs to. |
| chunk_order | INTEGER | | The sequential order of the chunk within the document. |
| content_text | TEXT | NOT NULL | The raw text segment retrieved for context. |
| metadata | JSONB | | Stores source page number, clause identifiers, etc. |


---
### Table: embeddings
(Stores the high-dimensional vectors for similarity search)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| document_id | BIGINT | FOREIGN KEY (documents), PRIMARY KEY | Links vector back to text content. |
| embedding_vector | VECTOR(1536) | NOT NULL | The 1536-dimension vector (assuming OpenAI/text-embedding-3-large). **CRITICAL** |
| model_used | TEXT | | Which embedding model generated this vector. |


**Indexing Strategy:** A specialized GIN index must be created on the `embedding_vector` column in the `embeddings` table to support fast Approximate Nearest Neighbor (ANN) searches necessary for the RAG pipeline.

========================================================================

4. HYBRID INTELLIGENCE DATA FLOW MAPPING

------------------------------------------------------------------------

The core reasoning process requires joining data synthesized from these two distinct sources:


1. **Dynamic Context Retrieval (SQL/ERP):**
    * **Query:** `SELECT * FROM shipments WHERE external_ref = '...'`
    * **Result:** Shipment ID, current_status, delay_duration_hours.


2. **Static Context Retrieval (Vector RAG):**
    * **Query:** ANN search against `embeddings` table using the query prompt vector to find nearest neighbors.
    * **Join:** Join results back to `documents` via `document_id` to retrieve the raw text of relevant clauses (e.g., "Penalty Clauses for Customs Hold").


3. **Synthesis (LLM Orchestration):**
    * The LLM (GPT-4o/Gemini) receives the structured results from Step 1 and the textual context from Step 2 to perform the final liability determination (Active Logic).

========================================================================

5. VOICE INTERACTION DATA MODEL

------------------------------------------------------------------------

Although transcription uses an external API (Whisper), we must log the interaction for auditing and context retention.


---
### Table: voice_sessions


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | Session ID. |
| user_id | UUID | FOREIGN KEY (users) | User who initiated the session. |
| start_time | TIMESTAMPTZ | | |
| source_language | TEXT | | e.g., 'HIN', 'ENG', 'MAN', 'SPA'. |
| final_transcript | TEXT | | The cleaned text passed to the LLM. |
| llm_response_id | UUID | NULLABLE | Link to a dedicated audit table for LLM calls. |


---
### Table: audio_segments
(For detailed storage/debugging, though potentially optional for MVP)


| Column Name | Data Type | Constraints/Notes | Description |
| :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | |
| session_id | UUID | FOREIGN KEY (voice_sessions) | |
| audio_blob | BYTEA | | Raw or URI to stored audio file (S3/Supabase Storage). |
| transcription_confidence | REAL | | Confidence score from Whisper. |

========================================================================


## User Flow
USERFLOW DOCUMENTATION: LOGI-LINK AI (Digital Dispatcher)

1. OVERVIEW AND SCOPE

This document details the primary user journeys (flows) for Logi-Link AI, focusing on the critical \"Exception Management\" workflow for Frontline Logistics Coordinators and Operations Managers. The core goal is to demonstrate the rapid resolution of complex queries by fusing live operational data (SQL) with static regulatory knowledge (RAG).

Target Architecture: Next.js Frontend, Supabase Backend (PostgreSQL + pgvector), LLM Orchestration Layer.
Visual Metaphor: Dark Mode \"Command Center\" UI.

2. PRIMARY USER FLOW: EXCEPTION MANAGEMENT (RED ALERT RESOLUTION)

This flow addresses the most critical pain point: resolving shipment deviations requiring cross-referencing dynamic status with contractual obligations.

2.1. User Persona: Frontline Logistics Coordinator (FLC)

2.2. Scenario Trigger: FLC identifies or receives notification of a critical shipment status change (e.g., Shipment #999 delayed).

2.3. Flow Steps:

Step 1: System State Initialization (System Action)
The Logi-Link AI dashboard loads in Dark Mode. Key components visible: Global Search/Voice Input Bar (Center), Live Alerts Panel (Left, high-contrast red indicators), and Knowledge Panel (Right, for citations).

Step 2: Query Initiation (User Action - Voice Preferred)
The FLC uses the Global Voice Input feature, recognizing the noisy environment requirement.
Interaction Pattern: FLC taps the microphone icon and speaks (e.g., in English, Hindi, or Spanish):
User Query Example: \"Global Voice Input: What is the status of shipment 999, and are we liable for this customs delay in Frankfurt?\"
System Action: Whisper API transcribes the query. Transcription is displayed immediately above the input bar for verification (Prioritizing Accuracy over Sub-second Latency).

Step 3: Hybrid Intelligence Data Retrieval (Backend Orchestration)
The Next.js server logic initiates a multi-pronged parallel retrieval:
A. Live Data Retrieval (SQL/PostgreSQL): Query Supabase for Shipment #999 Header and most recent Tracking Event (simulated ERP synchronization). Result: Shipment #999 is currently marked \"STUCK: Customs Hold\" for 52 hours at FRA.
B. Static Knowledge Retrieval (Vector RAG/pgvector): The LLM prompt is augmented with keywords extracted from the live status (\"Customs Hold,\" \"52 hours,\" \"Liability\"). Vector search retrieves relevant document chunks (e.g., Clause 4.B regarding Customs Delay Penalties from the primary Freight Contract PDF).

Step 4: Active Reasoning and Synthesis (LLM Core)
The Orchestration Layer (Gemini 1.5 Pro / GPT-4o) receives the unified context:
Context A: Live Data (Delay duration: 52 hours; Location: FRA; Cause: Customs).
Context B: Retrieved Knowledge Snippet (Penalty Clause 4.B: No liability for customs delays less than 72 hours, provided the originating documentation was correct).
Reasoning Logic: The LLM performs Cross-Modal Reasoning: (52 hours < 72 hours) AND (Cause = Customs) -> Conclusion: No immediate financial liability triggered by the delay length.

Step 5: Response Generation and UI Presentation (System Action)
The system generates a concise, actionable response delivered within the target < 5-second window.
Response Output (Displayed in the main chat window):
\"Shipment #999 is currently in Customs Hold (52 hours). Based on Contract Clause 4.B, Logi-Link AI confirms: NO immediate liability exposure for this delay duration. Recommended Action: Escalate tracking query to local broker contact XYZ.\"
UI Trust Indicator: The response clearly separates information sources. The liability conclusion is sourced next to a Document Icon linked to the specific page/document citation in the Knowledge Panel. The \"52 hours\" status is sourced next to a glowing Red/Green Status Indicator icon linked to the Live Tracking data.

Step 6: Follow-up/Deep Dive (User Action - Optional)
The FLC can follow up by typing or speaking: \"Show me the full text of Clause 4.B.\"
System Action: The UI updates the Knowledge Panel to display the full vectorized document text chunk retrieved in Step 3, maintaining context within the session.

3. SECONDARY USER FLOW: KNOWLEDGE INGESTION (ADMIN ONLY)

This flow describes how new static knowledge (SOPs, Contracts) is integrated into the Vector Store for the Hybrid Intelligence loop.

3.1. User Persona: Operations Manager / System Administrator

3.2. Scenario Trigger: A new regulatory document (e.g., updated Incoterms 2025 PDF) must be added to the system knowledge base.

3.3. Flow Steps:

Step 1: Access Admin Interface
Admin logs into the dedicated Administration Portal (distinct from the Command Center UI).

Step 2: Document Upload
Admin navigates to the \"Knowledge Base Management\" section and selects the PDF file (e.g., Incoterms\_2025.pdf).

Step 3: Vectorization Trigger (Backend Process)
Upon upload confirmation, the Next.js server triggers the ingestion pipeline:
A. Document Parsing: Extract text content from the PDF.
B. Chunking: Segment the text into manageable pieces optimized for RAG.
C. Embedding Generation: Use a supported embedding model (e.g., via Supabase services) to generate vector embeddings for each chunk.
D. Storage: Store both the original text chunk and its corresponding vector embedding into the designated `documents` table in Supabase Vector (pgvector).

Step 4: Index Verification
The system confirms successful insertion count. (Note: For MVP, re-indexing is manual/simple confirmation, not a continuous background process).

4. INTERACTION PATTERNS AND TECHNICAL MAPPING

| Interaction/Component | User Experience (UX) | Technical Mapping (Next.js/Supabase) | Rationale |
| :--- | :--- | :--- | :--- |
| **Global Query Input** | Combined Voice/Text input bar, accessible globally. | Next.js Client Component using browser MediaRecorder API, feeding to Whisper API. | Supports noisy environments and multilingual staff priority. |
| **Live Data Display** | High-contrast, colored indicators (e.g., Red for Alert, Green for On-Time). | SQL query result binding directly to Tailwind CSS classes controlling color/animation state. | Builds immediate user trust by distinguishing volatile data. |
| **Static Citation** | A small hyperlink or document icon next to the LLM answer snippet. | Metadata returned by RAG indicating `source_document_id` and `page_number`. Click opens a modal view of the specific chunk. | Ensures auditability and prevents LLM hallucination; critical for compliance checks. |
| **Multilingual Session** | User inputs in any supported language (EN, HI, ZH, ES). | LLM orchestration layer uses system prompts instructing the reasoning agent to maintain the response language matching the input language if context allows. | Supports Global Voice requirement. |
| **Tenancy Isolation** | Users only see data relevant to their assigned accounts/shipments. | Supabase Row Level Security (RLS) policies enforced on all `shipments` and `tracking_events` tables, keyed off the authenticated user's role/ID. | Essential for multi-tenant enterprise use case security. |

## Styling Guidelines
# Logi-Link AI: Styling Guidelines Document

## 1. Design Philosophy & Visual Metaphor

**Core Concept:** Command Center

Logi-Link AI is designed to function as a mission-critical decision support system. Our styling reflects a **Dark Mode Command Center**—a high-focus, low-distraction environment built for rapid, critical exception management. The design prioritizes clarity, trust, and the immediate visual separation of live operational data from static knowledge references.

**Key Principles:**
1.  **High Contrast for Focus:** Utilize a dark background to reduce eye strain during long monitoring sessions and ensure primary data elements (alerts, status changes) pop with high-contrast accents.
2.  **Trust Through Transparency:** Visually delineate the sources of information (Live Data vs. Static Knowledge) to build user confidence in the Hybrid Intelligence outputs.
3.  **Multilingual Accessibility:** Ensure all interface elements adhere to clear hierarchy and typography standards to support users interacting in English, Hindi, Mandarin, or Spanish.

## 2. Color Palette

The palette is optimized for a primary Dark Mode experience, using accents to denote status and data type.

| Color Name | Hex Code | Usage | Rationale |
| :--- | :--- | :--- | :--- |
| **Background Primary** (Dark Base) | #0A0F1A | Main application background, containers. | Deep, low-glare base for Command Center feel. |
| **Surface Secondary** (Panel Background) | #141D2B | Sidebars, modal backgrounds, primary query input area. | Slightly lighter than primary for subtle separation. |
| **Text Primary** | #E0E7FF | Default text, headings, labels. | High-contrast, light blue/off-white for readability against dark backgrounds. |
| **Text Secondary** | #93A3C0 | Descriptions, footnotes, secondary metadata. | Softer contrast for less critical information. |
| **Accent - Critical Alert** (Code Red) | #FF4D4F | Critical status indicators (e.g., Shipment Down, Major Delay). | Highest urgency indicator, linked to immediate action required. |
| **Accent - Warning** (Amber/Yellow) | #FFC107 | Pending issues, approaching SLAs, mild exceptions. | Medium urgency alerts. |
| **Accent - Success/Live Data** (Operational Green) | #36D180 | Confirmation messages, "Shipment On Track," successful connections. | Used to denote real-time operational health. |
| **Accent - Knowledge Reference** (System Blue) | #4A90E2 | Used for citations, policy links, RAG retrieval indicators. | Distinguishes static, retrieved knowledge from dynamic status. |

## 3. Typography

The typography aims for clean readability across all integrated languages, prioritizing clarity over stylistic flourish.

**Font Family:**
*   **Primary Typeface:** Inter (or a suitable open-source alternative like Roboto if Inter licensing requires complexity).
*   **Rationale:** Highly legible, modern sans-serif optimized for screen display across diverse scripts (Latin, Devanagari, Han characters).

**Scale & Hierarchy:**

| Element | Size (px/rem) | Weight | Color | Usage Context |
| :--- | :--- | :--- | :--- | :--- |
| **H1 - Main Title/Agent Name** | 2.5rem (40px) | Bold (700) | Text Primary | Application header. |
| **H2 - Panel Titles** | 1.5rem (24px) | SemiBold (600) | Text Primary | Section headers (e.g., "Active Query Log," "Shipment Snapshot"). |
| **Body Large (Data Points)** | 1.125rem (18px) | Medium (500) | Text Primary | Key shipment IDs, high-priority reasoning results. |
| **Body Standard** | 1rem (16px) | Regular (400) | Text Primary | General descriptive text, query prompts. |
| **Caption/Metadata** | 0.875rem (14px) | Regular (400) | Text Secondary | Timestamps, database source tags, RLS notes. |
| **Voice Input Display** | 1.25rem (20px) | Medium (500) | Text Primary | Large, clear display of transcribed voice input. |

## 4. UI/UX Principles: Visualizing Hybrid Intelligence

The core success metric of Logi-Link AI relies on the user trusting the synthesis of SQL and Vector data. This must be visually explicit.

### 4.1 Data Source Differentiation

Every piece of output must be visually associated with its source type:

*   **Live Data Indicators (SQL Source):** Use chips or icons colored with **Operational Green** or **Critical Alert** (e.g., a small flashing circle next to the shipment ID). These elements represent dynamic, real-time state fetched from Supabase PostgreSQL.
*   **Static Knowledge Indicators (Vector/RAG Source):** Use a distinct "Document/Scroll" icon paired with the **Knowledge Reference Blue** accent. When the system cites a contract clause, the corresponding text snippet must be highlighted in blue and linked directly to the source document metadata (e.g., "SOP-004, Section 3.2").

### 4.2 The Reasoning Thread

The main interaction area (the active query/response) must present a clear chronological flow demonstrating the "Active Reasoning" loop:

1.  **User Input:** Standard Input Field.
2.  **System Processing State:** A visible "Orchestrating Logic..." spinner, perhaps using a subtle pulse effect in **System Blue**.
3.  **Deconstructed Output:** The final answer should be segmented:
    *   *Statement of Fact (Live Data):* "Shipment #999 is delayed 72 hours in Customs." (Colored with appropriate Status Accent).
    *   *Reasoning & Citation (Knowledge Data):* "Per Contract Clause 4.b, penalties apply after 48 hours." (Colored **Knowledge Reference Blue** with document citation icon).
    *   *Conclusion:* The synthesized, final answer (Text Primary).

### 4.3 Global Voice Interaction

Given noisy environments (warehouses), the voice interface must prioritize clarity and confirmation:

*   **Input Focus:** When the microphone is active, the entire input panel should gain a subtle, pulsating border using **Operational Green** to signify active listening.
*   **Transcription Display:** The transcribed text (Whisper output) must be displayed immediately and prominently using **Body Large** text size.
*   **Error Handling:** If transcription confidence is low (a condition to be monitored via Whisper/API feedback), display the transcription in **Warning Amber** with a small note: "Low Confidence Transcription. Please verify input."

### 4.4 Component Styling (Tailwind Application)

*   **Buttons:** Primary CTAs (e.g., "Submit Query," "Rerun Analysis") use a solid fill of **Surface Secondary** with a hover effect that subtly brightens the background or adds a thin **Knowledge Reference Blue** border. Danger/Reset buttons use the **Critical Alert** color sparingly.
*   **Containers/Cards:** Panels should have slightly rounded corners (e.g., `rounded-lg`) for a modern feel but maintain a sharp, professional edge. Border visibility should be minimal, relying instead on subtle differences in background shade (`Background Primary` vs. `Surface Secondary`).
*   **Focus States:** Accessibility demands clear focus indicators. When navigating via keyboard, all interactive elements must adopt a solid 2px ring using **Knowledge Reference Blue**.
