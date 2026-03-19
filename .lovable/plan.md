

# SafeStride: Feature Enhancement + Multi-Agent System + RAG+CAG Implementation

## What Exists Today

SafeStride currently has: Splash → Auth → Onboarding → Home (voice input, sidebar) → Route Planner (AI risk assessment) → Active Trip (live tracking, SOS, fake call) → Debrief (AI badge) → SafeChat (streaming AI) → Community (safety reports map) → Trip History (charts) → Notifications → Settings → Profile → Privacy Dashboard.

Backend: 3 edge functions (safety-ai, safety-chat, sos-alert), 4 tables (profiles, safety_documents, safety_reports, trip_history), pgvector embeddings on safety_documents.

---

## Plan: 8 Implementation Batches

### Batch A: Multi-Agent System Architecture

Create a new edge function `multi-agent` that orchestrates specialized AI agents, each with a distinct role. Instead of one monolithic safety-ai function, implement an **agent router** that delegates to specialized sub-agents:

1. **Router Agent** — Classifies user intent and dispatches to the correct specialist
2. **Safety Analyst Agent** — Route risk assessment, crime data analysis
3. **Legal Advisor Agent** — IPC sections, rights awareness, legal guidance
4. **Emergency Coordinator Agent** — SOS handling, nearest resources, escape routes
5. **Community Intelligence Agent** — Aggregates community reports, trend detection
6. **Companion Agent** — Empathetic chat, mental wellness, de-escalation tips

**Implementation:**
- New edge function `supabase/functions/multi-agent/index.ts` with agent routing logic
- Each agent has its own system prompt, tools, and RAG context scope
- Agents can hand off to each other (e.g., Safety Analyst detects high risk → hands off to Emergency Coordinator)
- Update SafeChat to use multi-agent endpoint with agent indicator in UI (show which agent is responding)
- Update Planner to use multi-agent for richer risk analysis

### Batch B: RAG + CAG (Cache-Augmented Generation) System

Enhance the existing RAG pipeline and add a caching layer:

**RAG Improvements:**
- New edge function `supabase/functions/rag-query/index.ts` — semantic search using existing `match_safety_documents` pgvector function
- Generate embeddings for user queries using Lovable AI, then match against safety_documents embeddings
- Add a `safety_knowledge_base` table for structured FAQ-style entries (category, question, answer, embedding)

**CAG Layer:**
- New `ai_cache` table: `(query_hash TEXT, response JSONB, context_hash TEXT, created_at, ttl_seconds, hit_count)`
- Before calling AI, hash the query + relevant context → check cache → return cached if fresh
- Cache common queries like "Is Andheri safe at night?" to reduce latency and API costs
- Auto-invalidate cache when new community reports are added in the same area (trigger)

**Database changes:**
- Create `ai_cache` table with RLS (public read, service-role write)
- Create `safety_knowledge_base` table with embeddings
- Add trigger: on `safety_reports` INSERT, invalidate cache entries matching that location

### Batch C: New Page — Safety Heatmap Dashboard

A dedicated full-screen heatmap visualization page:

- `/heatmap` route with a full-screen Leaflet map
- Color-coded zones based on aggregated safety_reports + safety_documents data
- Time-of-day filter (morning/afternoon/evening/night) that changes heatmap colors
- Tap any zone to see AI-generated safety summary (using multi-agent)
- Layer toggles: police stations, hospitals, safe spots, danger zones
- "My frequent routes" overlay from trip_history

### Batch D: New Page — Safety Leaderboard & Gamification

`/leaderboard` page to drive community engagement:

- New `badges` table: `(id, user_id, badge_type, badge_title, earned_at, trip_id)`
- Leaderboard ranking by: trips completed, reports submitted, badges earned
- Badge collection gallery with 3D card flip animations
- Weekly safety challenges (e.g., "Report 3 safe spots this week")
- Share badges to social media

### Batch E: New Page — Emergency Toolkit

`/emergency` page — a quick-access emergency resource hub:

- One-tap SOS (biggest button, always visible)
- Speed-dial grid for emergency contacts
- Nearest police stations/hospitals with distance + phone (from safety_documents)
- "Record Evidence" — start audio/video recording (MediaRecorder API)
- Self-defense tips carousel (from safety_knowledge_base via RAG)
- Offline mode: cache critical data in localStorage

### Batch F: Smart Notifications + Geofencing Agent

Enhance the notification system with AI-powered alerting:

- **Geofence Agent** — When user enters a known high-risk area (from safety_reports), push an in-app alert with AI-generated safety tips
- **Time-based alerts** — "It's getting dark. Share your live location?" prompts
- **Community alert digest** — Daily summary of new reports near user's frequent routes
- **Trip reminder** — If user hasn't ended trip in 2+ hours, prompt check-in
- Store user's frequent locations in `user_preferences` table

### Batch G: Improve Existing Features

1. **Home page** — Replace hardcoded stats with real data from trip_history; add "Recent Safety Alerts" feed from community reports; dynamic greeting based on time of day
2. **SafeChat** — Show which agent is responding; add conversation history persistence in DB; add suggested follow-up questions after each response
3. **Trip History** — Filter by date range; export trip data as CSV; show route replay on map
4. **Profile** — Avatar upload (Supabase Storage bucket); safety score calculated from real trip data; achievement timeline
5. **Settings** — Dark mode that actually works (toggle `dark` class on html); notification preferences; data export/download
6. **Active Trip** — Real GPS tracking (navigator.geolocation.watchPosition); actual heartrate-like animation based on risk level; audio alert on high risk

### Batch H: Offline Intelligence + PWA Enhancements

- Service worker for offline caching of safety documents
- Add `manifest.json` for installable PWA
- Cache the last 50 safety documents + user's frequent route data in IndexedDB
- Offline SafeChat with pre-cached responses (CAG)
- Background sync for trip data when back online

---

## Technical Architecture: Multi-Agent + RAG + CAG Flow

```text
User Query
    │
    ▼
┌──────────────┐
│ Router Agent │ ← classifies intent
└──────┬───────┘
       │
  ┌────┴────┬────────┬──────────┬───────────┐
  ▼         ▼        ▼          ▼           ▼
Safety   Legal    Emergency  Community  Companion
Agent    Agent    Agent      Agent      Agent
  │         │        │          │           │
  └────┬────┘────────┘──────────┘───────────┘
       │
       ▼
┌─────────────┐    ┌───────────┐
│ CAG Cache   │◄──►│ RAG Query │
│ (ai_cache)  │    │ (pgvector)│
└─────────────┘    └───────────┘
       │
       ▼
   AI Response
```

## Database Changes Summary

1. `ai_cache` — query caching for CAG
2. `safety_knowledge_base` — structured FAQ with embeddings
3. `badges` — user achievement tracking
4. `user_preferences` — frequent locations, notification settings
5. `chat_history` — persistent conversation storage
6. Storage bucket `avatars` for profile photos

## Suggested Implementation Order

Start with **Batch A** (Multi-Agent) + **Batch B** (RAG+CAG) as they're foundational, then Batches C-H can be done in any order.

