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

## Milestone 1 — What's included

- Next.js 15 scaffold with TypeScript (strict), Tailwind CSS, shadcn/ui
- SQLite database with idempotent migration runner (`db/migrations/`)
- Full schema created (users, sessions, documents, chunks, conversations, messages, escalations, exercises, assignments, notifications)
- Local auth: signup/login API, bcrypt password hashing, JWT session cookies
- Role-based route protection via middleware (`student` | `mentor` | `admin`)
- Seed script with default admin, mentor, and student accounts
- Base layouts: marketing landing, auth pages, authenticated app shell
- Route stubs for all planned features
- `lib/prompts.ts` with the Unknown Twin system prompt (used from M3)
- `.env.example` with local-only config

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

# 3. Create database and seed default users
npm run db:setup

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default seed accounts

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@unknown-twin.local` | `admin1234` |
| mentor | `mentor@unknown-twin.local` | `mentor1234` |
| student | `student@unknown-twin.local` | `student1234` |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | *(required)* | Secret for signing session cookies (min 32 chars) |
| `DATABASE_PATH` | `./data/aicampus.db` | SQLite database file path |
| `LLM_ENGINE` | `transformers` | `transformers` (in-process) or `ollama` *(M3)* |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL *(M3)* |
| `OLLAMA_MODEL` | `llama3.1:8b` | Ollama model name *(M3)* |
| `CONFIDENCE_THRESHOLD` | `0.55` | RAG confidence cutoff *(M3)* |
| `RAG_TOP_K` | `6` | Chunks retrieved per query *(M2)* |

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

## LLM engine (Milestone 3+)

`lib/llm.ts` will support two local backends via `LLM_ENGINE`:

### `transformers` (default)
Runs a small instruct model in-process via `@huggingface/transformers`. No separate app, no account. Model weights download once, then run offline.

### `ollama` (optional, better quality)
Requires [Ollama](https://ollama.com) installed locally:

```bash
# Install Ollama, then pull a model:
ollama pull llama3.1:8b

# Set in .env.local:
LLM_ENGINE=ollama
OLLAMA_MODEL=llama3.1:8b
```

---

## Roadmap

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Scaffold, SQLite, local auth, protected routes | ✅ Done |
| 2 | Knowledge base + RAG (embeddings, ingestion, seed KB) | 🔜 Next |
| 3 | AI Professor chat (streaming, local LLM) | Planned |
| 4 | Escalation + self-learning loop | Planned |
| 5 | Practice + assignment feedback | Planned |
| 6 | AI Coach dashboard | Planned |
| 7 | Admin KB manager, admissions stub | Planned |

---

## License

Private — all rights reserved.
