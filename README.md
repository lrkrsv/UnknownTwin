# AI Campus

An AI-powered **digital twin of Unknown Twin** — giving every student a personal AI Professor, AI Coach, and AI Mentor, grounded exclusively in the university's official knowledge base.

> **Core rule:** The AI answers using retrieved university content (RAG). It never invents academic content or policies. When uncertain, it escalates to a human mentor whose answer is fed back into the knowledge base.

> **Fully local:** Everything runs on one machine. SQLite database, local embeddings (Transformers.js), local LLM — no cloud services, no API keys, no accounts.

---

## Tech Stack (local-only)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | SQLite via `better-sqlite3` → `./data/aicampus.db` |
| Vector store | Embeddings as BLOB (Float32) in SQLite; cosine similarity in Node |
| Embeddings | `@huggingface/transformers` — Xenova/all-MiniLM-L6-v2 (384 dims) |
| LLM | Pluggable `lib/llm.ts` — Transformers.js (default) or Ollama *(M3)* |
| Auth | Local bcrypt passwords + signed httpOnly JWT cookies (`jose`) |
| File storage | `./data/uploads/` |
| Notifications | In-app only (SQLite `notifications` table) *(M4)* |
| Validation | Zod |
| Client state | TanStack Query |

---

## Milestone 2 — Knowledge base + RAG retrieval

- `db/migrations/002_chunks_embedding_blob.sql` — stores embeddings as BLOB (Float32)
- `lib/embeddings.ts` — in-process Transformers.js (`Xenova/all-MiniLM-L6-v2`, 384 dims)
- `lib/chunk.ts` — text chunking (~800 chars, ~120 overlap)
- `lib/ingest.ts` — chunk → embed → store in a SQLite transaction
- `lib/retrieve.ts` — cosine similarity search (dot product on normalized vectors)
- `POST /api/admin/documents` — admin-only ingestion API (Zod-validated)
- Extended `db/seed.ts` — idempotent seed of the Business Model Canvas knowledge base

### Seed the knowledge base

```bash
npm run seed
```

First run downloads the embedding model to `./data/model-cache/` (one-time). Subsequent runs are fully offline. Re-running seed is idempotent — it will not duplicate documents.

### Test retrieval

```bash
npm run test:retrieve
# Or with a custom query:
npm run test:retrieve -- "What is a Value Proposition?"
```

### Test admin ingestion API

```bash
# 1. Start the dev server
npm run dev

# 2. Log in as admin and ingest (save the session cookie)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@demo.test","password":"admin1234"}'

curl -b cookies.txt -X POST http://localhost:3000/api/admin/documents \
  -H 'Content-Type: application/json' \
  -d '{"title":"My Doc","source_type":"policy","module":"General","content":"Your document text here."}'
# → {"documentId":"...","chunkCount":N}

# 3. Same call as student returns 403
```

---

## Milestone 1 — Foundation (verified)

- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- `lib/db.ts` — SQLite singleton at `./data/aicampus.db` (WAL + foreign keys)
- `db/migrate.ts` — idempotent runner tracking `_migrations`
- `lib/auth.ts` — `getCurrentUser()`, `requireRole()`, bcrypt + JWT cookies (`jose`)
- Auth API: `POST /api/auth/signup`, `login`, `logout` (Zod-validated)
- `middleware.ts` — protects `/chat`, `/dashboard`, `/assignments`, `/mentor`, `/admin`
- Landing `/` with inline login + signup forms; role-gated placeholder pages
- `npm run migrate` and `npm run seed`

### Milestone 1 acceptance checklist

| # | Test | Status |
|---|------|--------|
| 1 | `npm install` → `npm run migrate` → `npm run seed` → `npm run dev` | ✅ |
| 2 | Sign up new student; duplicate email rejected | ✅ |
| 3 | Log out / log in; wrong password → generic error | ✅ |
| 4 | Logged-out `/chat` → redirected to login | ✅ |
| 5 | Student blocked from `/admin` and `/mentor` | ✅ |
| 6 | `admin@demo.test` → `/admin`; `mentor@demo.test` → `/mentor` | ✅ |
| 7 | `./data/aicampus.db` has `users` with bcrypt hashes | ✅ |
| 8 | No external services in auth flow | ✅ |

---

## Prerequisites

- **Node.js 20+**
- **npm**
- A C++ build toolchain for `better-sqlite3` and `bcrypt` native modules (prebuilt binaries usually work on macOS/Linux)

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit JWT_SECRET to a random string (min 32 chars)

# 3. Create database and seed demo users
npm run migrate
npm run seed

# Or combined:
npm run db:setup

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo seed accounts (Milestone 1)

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@demo.test` | `admin1234` |
| mentor | `mentor@demo.test` | `mentor1234` |
| student | `student@demo.test` | `student1234` |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | *(required)* | Secret for signing session cookies (min 32 chars) |
| `DATABASE_PATH` | `./data/aicampus.db` | SQLite database file path |
| `LLM_ENGINE` | `transformers` | `transformers` (in-process) or `ollama` |
| `TRANSFORMERS_LLM_MODEL` | `onnx-community/Qwen3-0.6B-ONNX` | In-process LLM (when `LLM_ENGINE=transformers`) |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.1:8b` | Ollama model name |
| `RAG_CONFIDENCE_THRESHOLD` | `0.35` | Top retrieval score below this → mentor CTA |
| `RAG_TOP_K` | `5` | Chunks retrieved per query |

No third-party API keys are needed.

---

## Database commands

```bash
npm run db:migrate   # Apply pending SQL migrations
npm run db:seed      # Migrate + insert default users
npm run db:setup     # migrate + seed
```

The dev server also auto-runs migrations on first database access.

---

## Testing Milestone 1

### Landing page
Visit `/` — product pitch for Unknown Twin, local-first messaging.

### Sign up
1. Go to `/signup`, create an account.
2. You are signed in automatically and redirected to `/chat`.

### Sign in
1. Go to `/login` with a seed account (e.g. `student@unknown-twin.local` / `student1234`).
2. Redirected to `/chat`.

### Protected routes
- Visit `/chat` while logged out → redirected to `/login?redirect=/chat`.
- `/mentor` requires mentor or admin role.
- `/admin` requires admin role.

### Role access

| Route | student | mentor | admin |
|-------|---------|--------|-------|
| `/chat` | ✅ | ✅ | ✅ |
| `/dashboard`, `/assignments` | ✅ | ❌ | ✅ |
| `/mentor` | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ✅ |

### Sign out
Use the user menu → Sign out.

---

## Project structure

```
.
├── data/                         # SQLite DB + uploads (gitignored)
├── db/
│   ├── migrations/001_initial.sql
│   ├── migrate.ts                # CLI migration runner
│   └── seed.ts                   # CLI seed runner
├── middleware.ts                 # Auth + role checks
├── src/
│   ├── app/
│   │   ├── api/auth/             # login, signup, logout, me
│   │   ├── (marketing)/          # Landing page
│   │   ├── (auth)/               # Login, signup
│   │   └── (app)/                # Protected routes
│   ├── components/
│   ├── lib/
│   │   ├── auth/                 # session, password, middleware
│   │   ├── db/                   # SQLite connection + migrations
│   │   ├── prompts.ts            # AI system prompt (Unknown Twin)
│   │   └── constants.ts
│   └── types/auth.ts
├── .env.example
└── README.md
```

---

## Milestone 3 — AI Professor chat

- `lib/llm.ts` — local LLM adapter (`transformers` default, `ollama` optional) with streaming
- `lib/prompts.ts` — `buildProfessorPrompt()` for grounded markdown answers (no JSON from model)
- **Retrieval-based confidence** — top cosine score vs `RAG_CONFIDENCE_THRESHOLD` (default `0.35`)
- `POST /api/chat` — SSE stream (`meta` → `token` → `done`)
- `/chat` UI — conversation sidebar, streaming messages, source chips, mentor CTA stub
- Conversations and messages persist in SQLite

### Use the chat

```bash
npm run db:setup    # ensure KB is seeded
npm run dev
# Sign in as student@unknown-twin.local / student1234
# Open http://localhost:3000/chat
```

Try:
- **In KB:** "What is the Business Model Canvas?" → streamed grounded answer + source chips
- **Outside KB:** "What's the parking permit refund policy?" → low score, mentor CTA appears

### CLI chat test (no browser)

```bash
npm run test:chat -- "What is the Business Model Canvas?"
npm run test:chat -- "What's the parking permit refund policy?"
```

### Tuning `RAG_CONFIDENCE_THRESHOLD`

Confidence comes from **retrieval**, not the LLM. The top cosine similarity score from `retrieve()` is compared to `RAG_CONFIDENCE_THRESHOLD`:

- **Higher** (e.g. `0.5`) → stricter; more questions trigger the mentor CTA
- **Lower** (e.g. `0.25`) → more permissive; LLM answers even with weaker matches

Set in `.env.local`:
```
RAG_CONFIDENCE_THRESHOLD=0.35
```

### Switching `LLM_ENGINE`

```bash
# Default — in-process Transformers.js (downloads once to ./data/model-cache/)
LLM_ENGINE=transformers

# Optional — better quality via local Ollama
LLM_ENGINE=ollama
OLLAMA_MODEL=llama3.1:8b
```

Install Ollama and pull a model:
```bash
ollama pull llama3.1:8b
```

No code changes required — `lib/llm.ts` abstracts both backends.

---

## LLM engine

`lib/llm.ts` supports two local backends via `LLM_ENGINE`:

### `transformers` (default)
Runs an instruct model in-process via `@huggingface/transformers`. Default model: `onnx-community/Qwen3-0.6B-ONNX`. Weights download once to `./data/model-cache/`, then run offline.

Override with `TRANSFORMERS_LLM_MODEL` (e.g. `Xenova/Qwen2.5-0.5B-Instruct` if available on your machine).

### `ollama` (optional, better quality)
Requires [Ollama](https://ollama.com) installed locally:

```bash
ollama pull llama3.1:8b

# .env.local:
LLM_ENGINE=ollama
OLLAMA_MODEL=llama3.1:8b
```

---

## Roadmap

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Scaffold, SQLite, local auth, protected routes | ✅ Done |
| 2 | Knowledge base + RAG (embeddings, ingestion, retrieval) | ✅ Done |
| 3 | AI Professor chat (streaming, local LLM) | ✅ Done |
| 4 | Escalation + self-learning loop | 🔜 Next |
| 4 | Escalation + self-learning loop | Planned |
| 5 | Practice + assignment feedback | Planned |
| 6 | AI Coach dashboard | Planned |
| 7 | Admin KB manager, admissions stub | Planned |

---

## License

Private — all rights reserved.
