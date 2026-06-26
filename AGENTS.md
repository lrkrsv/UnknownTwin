# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
"AI Campus" (a.k.a. the *Unknown Twin* digital twin) — a **fully local** Next.js 15 (App Router, TypeScript) web app: SQLite via `better-sqlite3`, local embeddings + LLM via `@huggingface/transformers`, JWT cookie auth (`jose` + `bcrypt`). No cloud services or API keys required. Standard commands live in `README.md` and `package.json` `scripts` — refer to those; this section only captures non-obvious caveats.

### Branch layout (non-obvious)
The base branch `main` is an empty placeholder (only `README.md`). The actual application lives on feature branches; `cursor/milestone-3-chat-2729` is the most complete (Milestone 1 auth + Milestone 2 RAG + Milestone 3 chat) and is a clean superset of `cursor/local-milestone-1-scaffold-2729`. If `main` looks empty, check out the latest milestone branch.

### Running it
- Dev server: `npm run dev` → http://localhost:3000 (Turbopack). This is the development command; do not use `npm run build`/`npm start` for normal dev.
- Required env: copy `.env.example` → `.env.local` and set `JWT_SECRET` to a random string ≥32 chars (the app refuses short secrets). All other vars have working defaults.
- Database: `npm run db:setup` (migrate + seed). Seed accounts: `admin@unknown-twin.local`/`admin1234`, `mentor@.../mentor1234`, `student@.../student1234`. The DB and model cache live under `./data/` (gitignored), so they persist across branch checkouts.
- First embed/LLM call downloads models from HuggingFace into `./data/model-cache/` (needs network the first time; fully offline afterward).

### Gotchas
- **Lint must run on a clean tree.** The flat ESLint config (`next/core-web-vitals` + `next/typescript`) does NOT ignore generated files. A leftover `.next/` build directory makes `npm run lint` report thousands of spurious errors, and the generated `next-env.d.ts` triggers one `triple-slash-reference` error. Run `npm run lint` *before* building, or `rm -rf .next` first; source code itself lints clean.
- **In-process LLM is impractically slow inside the dev server.** With the default `LLM_ENGINE=transformers` (`onnx-community/Qwen3-0.6B-ONNX`), a single grounded `POST /api/chat` answer pins ~1 CPU core and can take many minutes or stall in `next dev`, even though the standalone CLI `npm run test:chat -- "..."` finishes the same generation in ~60–70s. For interactive/browser chat use `LLM_ENGINE=ollama` (see README). RAG retrieval and the out-of-KB "ask a mentor" escalation path are fast because they do not call the LLM.
- **Aborted chat requests do not cancel server-side generation.** `/api/chat` keeps generating even after the client disconnects (browser timeout, killed curl), so repeated aborted requests accumulate runaway generations that peg CPU and hold port 3000, making the server unresponsive. If that happens, kill the lingering `next-server` PID (`ps -eo pid,pcpu,comm --sort=-pcpu`) and restart `npm run dev`.
- CLI sanity checks without a browser: `npm run test:retrieve -- "<query>"` (RAG) and `npm run test:chat -- "<query>"` (full grounded answer).
