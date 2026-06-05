<div align="center">

<img src="https://img.shields.io/badge/TypeBlitz-v2.0-8b5cf6?style=for-the-badge&logo=keyboard&logoColor=white" />
<img src="https://img.shields.io/badge/Games-18-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Stack-React%20%2B%20Express-38bdf8?style=for-the-badge" />
<img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" />

# ⌨️ TypeBlitz

### *The world's most immersive typing trainer — where speed meets skill, arcade games meet muscle memory, and government exam prep meets genuine fun.*

[🎮 Play Now](#) · [📊 Dashboard](#) · [🏆 Leaderboard](#) · [📘 Practice](#)

---

</div>

## ✨ What is TypeBlitz?

TypeBlitz is a **professional typing training platform** built around a simple idea: if typing practice was as fun as gaming, people would actually do it every day.

It combines:
- **18 unique game modes** — canvas-rendered arcade games that train your fingers while keeping you hooked
- **Government exam preparation** — SSC CGL/CHSL, Railways NTPC, Court Stenographer — complete with official scoring algorithms
- **Developer vocabulary** — JavaScript, Python, React, SQL, Git, Architecture terms across all 5 levels
- **Deep analytics** — per-letter accuracy heatmap, WPM trend chart, session history, and 12 achievement badges
- **Strict WPM engine** — wrong words contribute zero characters; no inflation, no shortcuts

---

## 🎮 Game Library — 18 Modes

### 🕹️ Arcade Canvas Games (11 total)

Canvas-rendered games with real-time physics, particles, and animations:

| Game | Theme | Unique Mechanic |
|------|-------|-----------------|
| 🏎️ **Turbo Race** | Cyberpunk Synthwave | Race a ghost car on a pseudo-3D Outrun highway with **3D roadside palm trees, neon signs, lamp posts, and rain effects** at high WPM |
| ⚔️ **Word Fighter** | Cyberpunk Dojo | Katana-wielding fighter — type words to attack; health bars with spring physics |
| 🧟 **Zombie Hunt** | Horror Survival | Zombie horde approaches your safe house; correct words fire your gun |
| 🚀 **Galaxy Blitz** | Space Shooter | Alien fleet descends; dual energy bolts fire on each correct word; shield HP system |
| ☄️ **Meteor Storm** | Planetary Defense | Meteors orbit inward with velocity; type words to blast them before impact |
| 🏃 **Neon Runner** | Infinite Runner | Endless procedural neon city; jump/duck/dash via typing; obstacle patterns scale with level |
| 🐍 **Snake Typer** | Grid Snake | Classic snake on a glowing grid — feed it by typing words on orbs before timers drain; grows longer each level |
| 👾 **Word Invaders** | Space Invaders | Type alien words to fire your laser cannon; alien fleet descends in formation over time |
| 💻 **Code Rain** | Matrix Decrypt | Words glow gold in cascading matrix rain; type them to collapse columns in burst-of-light explosions |
| 🕵️ **Cyber Heist** | Hacker Terminal | Network topology with 7 interconnected nodes; type passkeys to hack each node; animated data packets flow on hacked connections; glitch overlay on errors |
| 🎯 **Arena Blitz** | Top-Down Shooter | You're a rotary weapons platform; grunt/tank/speeder enemies spiral inward from the edge; floor-bounce particles on kills |

### 📚 Classic Typing Modes (7 total)

| Mode | Target Skill |
|------|-------------|
| ⚡ **Word Sprint** | Raw speed training with 5 progressive levels |
| 🏛️ **Govt Exam Sprint** | SSC/UPSC/Banking vocabulary, 5 difficulty levels |
| 📄 **Sentence Rush** | Full-sentence fluency and reading flow |
| 💻 **Code Type** | Typing actual code syntax, operators, brackets |
| 📖 **Code Vocab** | Developer terminology from basic to architecture-level |
| 🔡 **Letter Blaster** | Individual key reaction speed training |
| 🏁 **Typing Race** | Competitive passage racing |

---

## 🏋️ Practice Hub — 5 Modes

| Mode | Description |
|------|-------------|
| 📘 **12 Structured Lessons** | From home-row fundamentals to advanced symbol rows |
| 🏛️ **Govt Exam Simulator** | SSC CGL/CHSL, Railways NTPC, High Court — official scoring with Levenshtein error detection (half/full mistakes, exact exam rules) |
| ✏️ **Custom Text** | Paste any content — code, articles, meeting notes — get detailed accuracy breakdown |
| ⏱️ **Timed Test** | 1, 2, or 5-minute WPM benchmark with live character highlighting |
| 🫣 **Blind Mode** | Type without seeing your input — builds pure muscle memory |

---

## 📊 Dashboard & Analytics

Every session is recorded and displayed in a rich analytics dashboard:

- **WPM Progress Chart** — Recharts line graph of speed over all sessions
- **Mechanical Heatmap** — QWERTY keyboard colored by per-letter accuracy (emerald → amber → red with hover tooltips showing exact %)
- **Game Level Progress** — animated progress bars for all 18 games
- **Recent Sessions** — last 8 plays with WPM, accuracy, game mode, and level
- **12 Achievement Badges** — Speed (30/50/80/100 WPM), Accuracy (95%/99%), Sessions (10/50/200), Streaks (3/7/30 days) — with animated unlock progress bar
- **Global Rank** — real-time worldwide leaderboard position

---

## 🏛️ Government Exam Rules — Implemented Exactly

TypeBlitz implements **official Indian government exam typing evaluation**:

### SSC CGL / CHSL
- **Target**: 35 WPM net speed
- **Error limit**: 7% of total key depressions
- **Penalty**: Every 10 errors beyond limit = 1 word deducted from net score
- Uses Levenshtein distance to detect **full mistakes** (omission, substitution) vs **half mistakes** (capitalization errors)

### Railways NTPC
- **Target**: 30 WPM net speed
- **Free allowance**: First 5% of errors are ignored
- **Penalty for excess**: 10 depressions per mistake beyond the free zone

### High Court Stenographer
- **Target**: 40 WPM net speed
- **Error limit**: 3% (strictest mode)
- Separate counts for full mistakes and half mistakes

---

## 🛠️ Tech Stack

### Frontend
```
React 19 + TypeScript 5
Vite 6 (dev server, HMR, build)
Tailwind CSS v4 + CSS Custom Properties theming
Framer Motion (all UI animations, spring physics, AnimatePresence)
Recharts (WPM trend chart, ResponsiveContainer)
HTML5 Canvas API (all 11 arcade games — no game engine, raw canvas)
Wouter (lightweight SPA routing)
TanStack Query v5 (server state, queryKey-explicit hooks)
Lucide React (icon system)
```

### Backend
```
Express 5 + TypeScript
Mongoose 8 + MongoDB Atlas
OpenAPI 3.0 spec → auto-generated type-safe client (orval)
Zod validation on all request bodies
bcryptjs (password hashing, salt rounds = 12)
JWT (stateless auth, 7-day expiry)
```

### Monorepo
```
pnpm 9 workspaces
├── frontend/    → React Vite app  (port 25383 dev / 3000 external)
├── backend/     → Express API     (port 8080  dev / 80  external)
└── lib/         → Shared OpenAPI-generated TanStack Query hooks
```

---

## 📁 Project Structure

```
typeblitz/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── games/                  # 11 canvas arcade game components
│   │   │   │   ├── ArcadeArena.tsx     # Game session controller + routing
│   │   │   │   ├── RacingGame.tsx      # Pseudo-3D Outrun + 3D roadside objects
│   │   │   │   ├── FighterGame.tsx     # Cyberpunk dojo fighter
│   │   │   │   ├── ZombieGame.tsx      # Zombie horde survival
│   │   │   │   ├── GalaxyGame.tsx      # Space shooter with shields
│   │   │   │   ├── MeteorGame.tsx      # Orbital meteor defense
│   │   │   │   ├── NeonRunnerGame.tsx  # Infinite neon runner
│   │   │   │   ├── SnakeTyperGame.tsx  # Grid snake with countdown orbs
│   │   │   │   ├── WordInvadersGame.tsx# Space Invaders formation
│   │   │   │   ├── CodeRainGame.tsx    # Matrix rain decrypt
│   │   │   │   ├── CyberHeistGame.tsx  # Network hacking terminal
│   │   │   │   └── ArenaBlitzGame.tsx  # Top-down arena shooter
│   │   │   ├── ui/                     # shadcn/ui components
│   │   │   └── VirtualKeyboard.tsx     # On-screen keyboard for mobile
│   │   ├── pages/
│   │   │   ├── home.tsx         # Landing page + live typing widget
│   │   │   ├── games.tsx        # Game library (18 games, themed cards)
│   │   │   ├── play.tsx         # Game session + letter stat tracking
│   │   │   ├── practice.tsx     # Practice hub (5 modes incl. Blind Mode)
│   │   │   ├── dashboard.tsx    # Analytics + heatmap + achievements
│   │   │   ├── challenge.tsx    # Daily challenge + streak system
│   │   │   ├── leaderboard.tsx  # Global rankings table
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # JWT auth context + useAuth hook
│   │   ├── lib/
│   │   │   ├── audio.ts         # Sound effects engine (Web Audio API)
│   │   │   └── progress.ts      # Level unlock logic + localStorage sync
│   │   └── App.tsx              # Root router + layout
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── games.ts         # 18 game definitions + 95 level configs
│   │   │   └── words.ts         # Word lists for every game × 5 levels
│   │   ├── models/
│   │   │   ├── User.ts          # Mongoose user schema
│   │   │   ├── Session.ts       # Game session schema
│   │   │   └── LetterStat.ts    # Per-letter accuracy schema
│   │   ├── routes/
│   │   │   ├── auth.ts          # Register + login
│   │   │   ├── games.ts         # Game + word list endpoints
│   │   │   ├── sessions.ts      # Session submit + analyze
│   │   │   ├── users.ts         # Stats, progress, letter accuracy
│   │   │   └── lessons.ts       # 12 structured lessons
│   │   └── index.ts             # Express app entry
│   └── openapi.yaml
│
└── lib/
    └── api-client-react/        # Auto-generated TanStack Query hooks
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- MongoDB Atlas cluster (free tier works)

### Installation

```bash
git clone https://github.com/your-username/typeblitz.git
cd typeblitz
pnpm install
```

### Environment Setup

```bash
# backend/.env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/typeblitz
JWT_SECRET=your-256-bit-secret-key
PORT=8080
NODE_ENV=development
```

> Without `MONGODB_URI`, the server starts in **demo mode** — all API routes return empty arrays and sessions are not saved. The app is still fully playable.

### Development

```bash
# Start both services
pnpm run dev

# Or individually:
pnpm --filter @workspace/typeblitz run dev    # Frontend → localhost:25383
pnpm --filter @workspace/api-server run dev   # Backend  → localhost:8080
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/games` | All 18 games with levels |
| `GET` | `/api/games/:id` | Single game detail |
| `GET` | `/api/games/:id/levels/:n/words` | Word list for game+level |
| `POST` | `/api/sessions` | Submit completed session |
| `GET` | `/api/users/:id/stats` | WPM, rank, streak, accuracy |
| `GET` | `/api/users/:id/progress` | WPM history (for chart) |
| `GET` | `/api/users/:id/sessions` | Recent 8 sessions |
| `GET` | `/api/users/:id/letter-accuracy` | Per-letter heatmap data |
| `GET` | `/api/users/:id/level-progress` | Game unlock status |
| `GET` | `/api/leaderboard` | Global rankings |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login + JWT response |
| `GET` | `/api/lessons` | 12 structured lessons |
| `POST` | `/api/practice/analyze` | Custom text accuracy analysis |

---

## ⚡ WPM Calculation — Strict & Fair

```typescript
// Only fully correct words count
const correctChars = words
  .filter((word, i) => typedWords[i] === word)
  .reduce((sum, w) => sum + w.length + 1, 0); // +1 for space

const wpm = Math.round((correctChars / 5) / (elapsedMinutes));
const accuracy = (correctChars / Math.max(expectedLength, typedLength)) * 100;
```

- Wrong words → **zero chars** counted toward WPM
- Partially correct words → **zero chars** counted
- Matches **monkeytype.com** standard
- No inflation, no partial credit

---

## 📈 Roadmap

### ✅ v2.0 — Current
- [x] 18 game modes (11 arcade canvas + 7 classic)
- [x] 5 levels per game with unique word lists (govt + code vocab)
- [x] Strict WPM calculation — wrong words = 0 contribution
- [x] Govt exam simulator with official SSC/Railway/Court scoring rules
- [x] Dashboard: WPM chart + letter heatmap + achievements (12 badges)
- [x] Blind Mode practice (type without seeing input)
- [x] Interactive typing widget on home page
- [x] 3D roadside objects in RacingGame (palm trees, neon signs, lamp posts, rain)
- [x] Cyber Heist (hacker terminal) + Arena Blitz (top-down shooter) games
- [x] MongoDB Atlas production-ready with graceful demo fallback
- [x] Fully responsive on all device sizes

### 🔜 v2.1 — Upcoming
- [ ] Multiplayer race rooms (WebSocket real-time)
- [ ] Hindi / Devanagari typing mode
- [ ] Mobile-native on-screen keyboard overlay
- [ ] Sharable result cards (OG image generation)
- [ ] AI Typing Coach — personalized drills targeting your weakest keys
- [ ] Custom word list import (CSV / plain text)
- [ ] PWA + offline mode
- [ ] Audio theme selector (lo-fi, synthwave, silence)

---

## 🤝 Contributing

```bash
# Fork + clone
git checkout -b feature/your-feature-name

# Canvas games follow the ArcadeProps interface in ArcadeArena.tsx
# All games receive: words, wordIndex, currentInput, wpm, accuracy,
#   progress, startTime, lastWordCorrect, submissionCount, comboStreak, mistakeCount

pnpm run dev   # test locally
# Submit PR with clear description
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Built for typists, government exam aspirants, and developers who believe every keystroke counts.**

⌨️ *Type faster. Think clearer. Win more.*

</div>
