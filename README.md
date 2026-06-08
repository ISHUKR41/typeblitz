# ⌨️ TypeBlitz

<div align="center">

**The most addictive typing platform ever built — for government exam prep and developers.**  
Type faster. Track everything. Dominate the leaderboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

</div>

---

## What is TypeBlitz?

TypeBlitz is a full-stack typing game platform with **20 unique arcade games**, **5 difficulty levels each**, a deep analytics dashboard, government exam vocabulary, and coding practice. It uses a strict WPM engine where only perfectly typed words count — no inflation, no cheating.

---

## Features

### 20 Unique Game Modes

| Mode | Game | Description |
|------|------|-------------|
| Skill Trainer | **Word Sprint** | Type common English words as fast as possible |
| Skill Trainer | **Govt Exam Sprint** | SSC, UPSC, Banking, Railways, Police vocabulary |
| Skill Trainer | **Sentence Rush** | Full sentences from simple to complex |
| Skill Trainer | **Code Burst** | Real code snippets in TS, Python, SQL, Go |
| Skill Trainer | **Fluency Drill** | Advanced vocabulary for fluency |
| Skill Trainer | **Reaction Drill** | Short bursts for raw reaction speed |
| Skill Trainer | **Speed Competition** | Head-to-head WPM challenges |
| Arcade | **Turbo Race** | Pseudo-3D neon highway — type to accelerate |
| Arcade | **Zombie Hunt** | Shoot down zombie hordes before they reach you |
| Arcade | **Word Fighter** | Cyberpunk arena combat — type attack moves |
| Arcade | **Galaxy Blitz** | Space shooter — destroy alien invaders with words |
| Arcade | **Meteor Storm** | Defend a city from falling meteors |
| Arcade | **Neon Runner** | Endless runner — type to clear obstacles |
| Arcade | **Snake Typer** | Classic snake meets typing — eat words to grow |
| Arcade | **Word Invaders** | Space Invaders with typing |
| Arcade | **Code Rain** | Matrix-style falling code — type to intercept |
| Arcade | **Cyber Heist** | Hack a secured node before the firewall expires |
| Arcade | **Arena Blitz** | Top-down turret — enemies circle you |
| Arcade | **Bubble Pop** | Floating bubbles drift up — pop them by typing |
| Arcade | **Fruit Blitz** | Neon fruit slicing with typing |

### Strict WPM Engine

Only **perfectly typed words** count. Wrong words contribute **zero WPM**. Industry-standard honesty.

```
WPM = (correct_characters / 5) / elapsed_minutes
```

Where `correct_characters` = sum of character counts from exactly-matched words only.

### Keystroke-Based Accuracy

```
Accuracy = (total_keystrokes - error_keystrokes) / total_keystrokes × 100
```

Every keypress is tracked individually. Errors are recorded when the typed character doesn't match the expected character at that position.

### Deep Analytics Dashboard

- **WPM Progress Chart** — line chart of your speed across every session
- **Mechanical Heatmap** — per-key accuracy on a real QWERTY layout keyboard, colour-coded from green (excellent) to red (needs work)
- **12 Achievement Badges** — Speed Starter, Half-Century, Century Club, Accuracy Expert, Grandmaster, and more
- **Day Streak Counter** — daily habit tracking
- **Global Rank** — percentile among all TypeBlitz players
- **Session History** — every game, level, WPM, and accuracy stored

### Government Exam Vocabulary

500+ authentic vocabulary words from **SSC CGL, IBPS Banking, RRB NTPC, UPSC Mains, High Court, SSC CPO** — the exact words that appear on computer-based typing tests.

### Coding Vocabulary

Real code snippets from **TypeScript, Python, SQL, JavaScript, Go** — symbols, brackets, camelCase, everything a developer actually types.

### 5-Level Progression

Each game has 5 difficulty tiers. To unlock the next level you must hit the **target WPM AND maintain 90%+ accuracy**. No shortcuts.

### Immersive Sound Design

Three keyboard audio themes synthesized in real-time via the Web Audio API — zero audio files, zero loading lag:

- **Mechanical** — clicky switch sounds with low-frequency thud on spacebar
- **Typewriter** — wooden carriage clack with metallic ring on word completion
- **Cyber** — futuristic bubble synth with pitch-swept space tones

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript |
| Styling | Tailwind CSS v4 with custom neon dark design system |
| Animation | Framer Motion |
| Data Fetching | TanStack React Query (auto-generated hooks) |
| Routing | Wouter |
| Charts | Recharts |
| Game Engine | HTML5 Canvas API (custom per-game renderers) |
| Sound | Web Audio API (synthesized, no audio files) |
| Backend | Express.js 4 + TypeScript |
| Database | MongoDB via Mongoose (graceful fallback without URI) |
| Auth | JWT with middleware (Clerk-ready) |
| API Schemas | Zod (shared between frontend and backend) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
typeblitz/
├── frontend/                   # React + Vite web app
│   └── src/
│       ├── pages/              # Home, Games, Play, Practice, Dashboard, Leaderboard
│       ├── components/
│       │   ├── games/          # 13 canvas-based arcade game components
│       │   ├── ui/             # Reusable UI components (Button, Progress, etc.)
│       │   ├── ArcadeArena     # Game orchestrator + WPM/accuracy engine
│       │   └── VirtualKeyboard # Animated QWERTY keyboard overlay
│       ├── context/            # AuthContext (JWT-based)
│       └── lib/
│           └── audio.ts        # Web Audio API sound effects engine
├── backend/                    # Express API server
│   └── src/
│       ├── routes/             # /auth, /games, /sessions, /progress, /leaderboard
│       ├── models/             # User, Session, LetterAccuracy (Mongoose models)
│       └── data/
│           └── games.ts        # Static game + level definitions
└── lib/
    ├── api-client-react/       # Auto-generated TanStack Query hooks
    └── api-schemas/            # Shared Zod schemas (request/response types)
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **pnpm** 9 or higher (`npm install -g pnpm`)
- **MongoDB Atlas URI** — optional; the app runs in graceful fallback mode (empty arrays from DB routes) without it

### Installation

```bash
# Clone and install all workspace dependencies
pnpm install
```

### Environment Setup

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/typeblitz
JWT_SECRET=your-long-random-secret-key
PORT=8080
```

> The app starts and runs without `MONGODB_URI` — it just returns empty data from database routes and logs a warning.

### Running in Development

```bash
# Terminal 1 — API server on port 8080
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend on port 5173 (or PORT env var)
pnpm --filter @workspace/typeblitz run dev
```

Then open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (JWT required) |
| GET | `/api/games` | List all games and levels |
| GET | `/api/games/:id` | Get single game details |
| POST | `/api/sessions` | Save a completed typing session |
| GET | `/api/users/:id/stats` | Overall stats (WPM, streak, rank) |
| GET | `/api/users/:id/progress` | WPM progress chart data |
| GET | `/api/users/:id/sessions` | Session history |
| GET | `/api/users/:id/level-progress` | Per-game level completion |
| GET | `/api/users/:id/letter-accuracy` | Per-letter accuracy heatmap data |
| GET | `/api/leaderboard` | Global leaderboard (filterable by game) |
| GET | `/api/lessons` | Structured typing lessons list |
| GET | `/api/lessons/:id` | Single lesson content |
| GET | `/api/daily-challenge` | Today's challenge text |

---

## Gameplay

### Standard Mode (Skill Trainers)

1. Click a game card on the **Games** page
2. Select a level (1–5)
3. A text passage appears — type every word exactly
4. Correct chars light up green, wrong chars flash red
5. Your live WPM and accuracy update every 400ms
6. Finish the passage → see your final stats and level result

### Arcade Mode

1. Click any arcade game card
2. The game canvas renders a visual game world
3. Type the word shown on the current target (zombie, alien, meteor, etc.)
4. Correct word → game action (shoot, accelerate, destroy)
5. Wrong word or miss → player takes damage
6. Clear all words → victory screen

---

## Design System

TypeBlitz uses a custom **Deep Void Neon** design system:

| Token | Color | Usage |
|-------|-------|-------|
| Background | `#0D0D0F` | App background |
| Primary | `#00F5FF` (Electric Cyan) | WPM, UI accents, cursor |
| Correct | `#39FF14` (Neon Green) | Correctly typed chars |
| Error | `#FF2079` (Hot Magenta) | Wrong chars, errors |
| Amber | `#FFB800` (Neon Amber) | Warnings, streaks |
| Purple | `#BF5FFF` (Neon Purple) | Chart accents |

All colors have matching glow shadow tokens (`--glow-cyan`, `--glow-green`, etc.) for the neon aesthetic.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes, following the existing code style
4. Run the linter: `pnpm --filter @workspace/typeblitz run lint`
5. Open a pull request with a clear description of what you changed and why

### Code Conventions

- **TypeScript** everywhere — no `any` unless absolutely necessary
- **Component naming** — PascalCase for components, camelCase for everything else
- **Game components** — each arcade game lives in `frontend/src/components/games/` and receives `ArcadeProps`
- **API routes** — Express routes in `backend/src/routes/`, validated with Zod schemas from the shared lib

---

## License

MIT — free to use, modify, and distribute.

---

*Built with React, Canvas API, Web Audio API, and a deep love for typing.*
