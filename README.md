<<<<<<< HEAD
# UnknownTwin
=======
# AI Campus

An AI-powered digital twin of your university — giving every student a personal **AI Professor**, **AI Coach**, and **AI Mentor**, all grounded exclusively in the university's official knowledge base.

> **Core rule:** The AI answers using retrieved university content (RAG). It never invents academic content or policies. When uncertain, it escalates to a human mentor whose answer is fed back into the knowledge base.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database / Auth | Supabase (Postgres + Auth) |
| Client state | TanStack Query |
| Validation | Zod |

---

## Milestone 1 — What's included

- Next.js 15 scaffold with TypeScript (strict), Tailwind CSS, and shadcn/ui
- Supabase client utilities (browser, server, middleware)
- Email + password auth and magic link login
- `profiles` table with roles (`student` \| `mentor` \| `admin`) and RLS policies
- Protected routes via Next.js middleware (role-aware for `/mentor` and `/admin`)
- Base layouts: marketing landing, auth pages, authenticated app shell
- Route stubs: `/chat`, `/dashboard`, `/assignments`, `/mentor`, `/admin`, `/admissions`
- TanStack Query provider wired at the root
- Complete `.env.example`

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- npm

---

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at minimum:

- `NEXT_PUBLIC_UNIVERSITY_NAME` — displayed across the app
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Supabase project setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Authentication → Providers → Email** and enable:
   - Email provider
   - Confirm email (optional for local dev — you can disable it)
   - Magic Link (OTP)
3. Go to **Authentication → URL Configuration** and add:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. Open the **SQL Editor** and run the migration:

```bash
# File: supabase/migrations/001_profiles.sql
```

Paste the contents of `supabase/migrations/001_profiles.sql` and execute.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing Milestone 1

### Landing page
Visit `/` — product pitch, feature cards, sign-up CTA.

### Sign up
1. Go to `/signup`, create an account with email + password.
2. If email confirmation is enabled, click the link in your inbox.
3. You should land on `/chat` after login.

### Magic link login
1. Go to `/login`, check **Send me a magic link instead**.
2. Enter your email and submit.
3. Click the link in your email → redirected to `/chat`.

### Protected routes
- Visit `/chat` while logged out → redirected to `/login?redirect=/chat`.
- `/dashboard` and `/assignments` are accessible to any authenticated user (student role default).

### Role-based access
Promote a user in the Supabase SQL editor:

```sql
-- Make a mentor
update public.profiles set role = 'mentor' where id = '<user-uuid>';

-- Make an admin
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

| Route | student | mentor | admin |
|-------|---------|--------|-------|
| `/chat` | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ❌ | ✅ |
| `/assignments` | ✅ | ❌ | ✅ |
| `/mentor` | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ✅ |

### Admissions stub
Visit `/admissions` — public roadmap placeholder (no auth required).

---

## Project structure

```
.
├── middleware.ts                 # Auth session refresh + route protection
├── supabase/
│   └── migrations/
│       └── 001_profiles.sql      # Profiles table, RLS, signup trigger
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing page
│   │   ├── (auth)/               # Login, signup
│   │   ├── (app)/                # Authenticated routes
│   │   ├── admissions/           # Public admissions stub
│   │   └── auth/callback/        # OAuth / magic link callback
│   ├── components/
│   │   ├── auth/                 # Login & signup forms
│   │   ├── layout/               # Headers, user menu
│   │   ├── providers/            # TanStack Query
│   │   └── ui/                   # shadcn/ui primitives
│   ├── lib/
│   │   ├── auth/                 # getProfile, requireRole
│   │   ├── supabase/             # Client, server, middleware helpers
│   │   ├── validations/          # Zod schemas
│   │   └── constants.ts
│   └── types/
│       └── database.ts           # Supabase types (profiles)
├── .env.example
└── README.md
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

---

## Roadmap (upcoming milestones)

| # | Milestone | Status |
|---|-----------|--------|
| 1 | Scaffold, auth, profiles, protected routes | ✅ Done |
| 2 | Knowledge base + RAG (pgvector, ingestion, seed) | 🔜 Next |
| 3 | AI Professor chat (streaming, sources) | Planned |
| 4 | Escalation + self-learning loop | Planned |
| 5 | Practice exercises + assignment feedback | Planned |
| 6 | AI Coach dashboard | Planned |
| 7 | Admin KB manager, admissions stub, voice hook | Planned |

---

## License

Private — all rights reserved.
>>>>>>> 0388641 (feat: Milestone 1 scaffold — Next.js, Supabase auth, profiles, protected routes)
