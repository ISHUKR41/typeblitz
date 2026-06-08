<div align="center">

# ⚡ TypeBlitz

**A fully professional, animated typing game platform.**

Train your typing speed and accuracy across arcade games, structured lessons, custom practice, and timed tests — with a personal progress dashboard and global leaderboards.

</div>

---

## Features

- **5 Arcade Games** — Word Sprint, Sentence Rush, Code Type, Letter Blaster, Typing Race — each with 8 progressive levels
- **Jitter-free 60 fps canvas** — All animation loops use stable `useRef` closures; RAF loops never restart on keystrokes
- **3 Practice Modes** — Structured Lessons (12 progressive lessons), Custom Practice with AI analysis, Timed Tests (1/2/5 min)
- **Personal Dashboard** — WPM progress chart, per-letter accuracy heatmap, level progress bars, recent sessions, streak counter
- **Global Leaderboard** — Best WPM per player, filterable by game
- **Real-time Sound Effects** — Mechanical (with noise transient), typewriter, and cyber synth audio themes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · Vite 7 · TypeScript 5.9 · Tailwind v4 · shadcn/ui · Framer Motion |
| Routing | Wouter |
| Charts | Recharts |
| API Client | React Query hooks (auto-generated via Orval from OpenAPI spec) |
| Backend | Express 5 · Node.js 24 |
| Database | PostgreSQL · Drizzle ORM |
| Auth | scrypt password hashing · HMAC Bearer tokens |
| Validation | Zod v4 · drizzle-zod |
| Build | esbuild (CJS bundle) · pnpm workspaces |

## Getting Started

### Prerequisites
- Node.js 24+
- pnpm 9+
- PostgreSQL

### Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:5432/typeblitz
SESSION_SECRET=your-secret-key-here
```

### Development

```bash
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Backend API (port 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (port 5000)
pnpm --filter @workspace/typeblitz run dev
```

### API Code Generation

After any OpenAPI spec change:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Project Structure

```
/
├── frontend/src/
│   ├── pages/           # home, login, games, play, dashboard, leaderboard, practice, lesson
│   ├── components/
│   │   ├── games/       # 13 canvas arcade game components
│   │   └── layout.tsx   # Sidebar navigation
│   └── context/AuthContext.tsx
├── backend/src/
│   ├── routes/          # auth, users, games, sessions, leaderboard, practice, lessons
│   └── data/            # static game, lesson, and word data
└── lib/
    ├── api-spec/         # OpenAPI spec (source of truth)
    ├── api-client-react/ # Generated React Query hooks
    └── db/               # Drizzle ORM schema
```

## WPM Engine

TypeBlitz uses a strict, honest WPM calculation:

1. **Only exact-match words count** — a mistyped word contributes **zero** characters to WPM
2. **Standard formula** — `(correct_characters / 5) / minutes_elapsed`
3. **Live update** — recalculated every 400ms during gameplay
4. **Accuracy** — tracked separately as `(correct_keystrokes / total_keystrokes) × 100`

## Architecture Notes

- **Contract-first API**: The OpenAPI spec in `lib/api-spec` is the source of truth. Run `codegen` after any spec change before touching frontend code.
- **Jitter-free canvas rendering**: All arcade game animation loops use `useRef` for volatile props (WPM, wordIndex, currentInput, combo). RAF loops only restart when the word list changes, eliminating the 1-frame blank flash that occurred on every keystroke and every WPM tick.
- **HMAC auth**: Tokens are stored in `localStorage` and attached to every API call via `customFetch` wired through `setAuthTokenGetter` in `AuthProvider`.
- **Static content**: All game words, lesson content, and challenge text live as static data in `backend/src/data/` — no CMS required.

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive token |
| GET | `/api/users/me` | Get current user |
| GET | `/api/games` | List all games |
| POST | `/api/sessions` | Save typing session |
| GET | `/api/leaderboard` | Global leaderboard |

## License

MIT
