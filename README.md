<div align="center">

# ⚡ TypeBlitz

**The most addictive typing platform ever built.**

20 arcade games · 8 levels each · Govt exam vocabulary · Real-time analytics · Strict WPM engine

</div>

---

## Features

- **20 Unique Games** — Word Sprint, Govt Exam Sprint, Sentence Rush, Code Type, Code Vocab, Letter Blaster, Typing Race + 13 canvas arcade games
- **8 Levels per Game** — Progressive difficulty with WPM + accuracy gates
- **Strict WPM Engine** — Only perfectly typed words count. Wrong words = zero WPM contribution
- **3 Practice Modes** — Structured Lessons, Custom Practice, Timed Tests (1/2/5 min)
- **Personal Dashboard** — WPM chart, letter heatmap, achievement badges, streak counter
- **Global Leaderboard** — Per-game rankings filterable by category
- **Govt Exam Vocabulary** — 500+ terms from SSC, UPSC, IBPS Banking, RRB Railways, Police, High Court
- **Real-time Sound Effects** — Mechanical, typewriter, and cyber synth audio themes

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4, Framer Motion, shadcn/ui, Wouter |
| Backend | Express 5, Node.js 24, TypeScript 5.9 |
| Database | PostgreSQL + Drizzle ORM |
| Auth | scrypt password hashing + HMAC Bearer tokens |
| API | OpenAPI spec → Orval codegen → React Query hooks |
| Build | pnpm workspaces, esbuild |

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

# Backend API (port 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (port 3000)
pnpm --filter @workspace/typeblitz run dev
```

### Database

```bash
pnpm --filter @workspace/db run push
```

### API Code Generation

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Project Structure

```
typeblitz/
├── frontend/src/
│   ├── pages/           # home, login, games, play, dashboard, leaderboard, practice, lesson
│   ├── components/
│   │   ├── games/       # 14 game components (canvas + text-based)
│   │   └── layout.tsx   # Sidebar navigation
│   └── context/AuthContext.tsx
├── backend/src/
│   ├── routes/          # auth, users, games, sessions, leaderboard, practice, lessons
│   └── data/            # games.ts (level data), words.ts (word lists), lessons.ts
└── lib/
    ├── api-spec/        # OpenAPI spec (source of truth)
    ├── api-client-react/ # Generated React Query hooks
    └── db/              # Drizzle ORM schema
```

## WPM Engine

TypeBlitz uses a strict, honest WPM calculation:

1. **Only exact-match words count** — a mistyped word contributes **zero** characters to WPM
2. **Standard formula** — `(correct_characters / 5) / minutes_elapsed`
3. **Live update** — recalculated every 400ms during gameplay
4. **Accuracy** — tracked separately as `(correct_keystrokes / total_keystrokes) × 100`

## Level System

Each game has **8 progressive levels**:

| Tier | Levels | WPM Range | Vocabulary |
|---|---|---|---|
| Beginner | 1–2 | 20–35 | Short common words |
| Intermediate | 3–4 | 40–60 | Govt exam + professional |
| Advanced | 5–6 | 65–85 | UPSC-level + technical |
| Expert | 7–8 | 90–120+ | IAS/IPS + expert CS |

To unlock the next level: hit target WPM **and** maintain 85–95% accuracy.

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive token |
| GET | `/api/users/me` | Get current user |
| GET | `/api/games` | List all games |
| POST | `/api/sessions` | Save typing session |
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/challenge/today` | Daily challenge |

## License

MIT
