# TypeBlitz

A fully professional, animated typing game platform. Train your typing speed and accuracy across 5 competitive games, structured lessons, custom practice, and timed tests — with a personal dashboard and global leaderboards.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/typeblitz run dev` — run the frontend (port 25383)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — HMAC token signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Wouter routing, Recharts, Framer Motion, shadcn/ui, Tailwind v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: crypto.scrypt password hashing + HMAC Bearer tokens (SESSION_SECRET)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec`)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/typeblitz/src/pages/` — all frontend pages (home, login, games, play, dashboard, leaderboard, practice, lesson)
- `artifacts/typeblitz/src/context/AuthContext.tsx` — auth state, token storage, setAuthTokenGetter wiring
- `artifacts/typeblitz/src/components/layout.tsx` — sidebar navigation
- `artifacts/api-server/src/routes/` — all API routes (auth, users, games, sessions, lessons, leaderboard, practice)
- `artifacts/api-server/src/data/` — static game, lesson, and word data
- `lib/db/src/schema/` — Drizzle ORM schema (users, sessions, letterStats)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks

## Architecture decisions

- Contract-first API: OpenAPI spec is the source of truth; hooks and Zod schemas are generated from it via Orval.
- Auth uses HMAC tokens stored in localStorage; `setAuthTokenGetter` is called once in AuthProvider to attach `Authorization: Bearer` to every API call via `customFetch`.
- All game/lesson content is static data in `api-server/src/data/` — no CMS required.
- Each feature page is its own file in `pages/`; no mega-components.
- Sessions route is double-mounted at `/sessions` and `/practice` for the analyze endpoint.

## Product

- **5 Games**: Word Sprint, Sentence Rush, Code Type, Letter Blaster, Typing Race — each with 5 levels
- **3 Practice Modes**: Structured Lessons (12 progressive lessons), Custom Practice (any text + AI analysis), Timed Tests (1/2/5 min)
- **Personal Dashboard**: WPM progress chart, letter accuracy heatmap, level progress bars, recent sessions, streak counter
- **Global Leaderboard**: Best WPM per player, filterable by game

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching frontend code.
- `setAuthTokenGetter` must be called in AuthProvider before any authenticated API call.
- The sessions route is mounted twice in `routes/index.ts` — intentional for the `/practice/analyze` path alias.
- Do NOT call `pnpm run dev` at workspace root — use individual workflow restarts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
