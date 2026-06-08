<div align="center">

# ⚡ TypeBlitz

**The most addictive typing platform ever built.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<br/>

> **20 arcade-grade canvas games · 100 difficulty levels · Govt exam vocabulary (SSC/UPSC/Banking/Railways/Police) · Real-time analytics · Keystroke-accurate WPM · Global leaderboard**

<br/>

![Status](https://img.shields.io/badge/Status-Active%20Development-39FF14?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-00F5FF?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-FF2079?style=for-the-badge)

</div>

---

## 📖 Table of Contents

- [What is TypeBlitz?](#-what-is-typeblitz)
- [Features](#-features)
- [Game Catalog](#-game-catalog-20-games)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [WPM & Accuracy Engine](#-wpm--accuracy-engine)
- [Vocabulary System](#-vocabulary-system)
- [API Reference](#-api-reference)
- [Dashboard & Analytics](#-dashboard--analytics)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🎯 What is TypeBlitz?

TypeBlitz is a **fully professional, arcade-grade typing platform** built for:

- 🇮🇳 **Government exam aspirants** preparing for SSC CGL, UPSC, IBPS, RRB, and Police exams
- 💻 **Developers** building muscle memory for code syntax and terminal commands
- 🏆 **Competitive typists** chasing WPM records on a global leaderboard
- 📚 **Students** who want to learn touch typing through game-based reinforcement

Unlike boring typing tutors, TypeBlitz delivers **20 canvas-rendered arcade games** — each with its own physics engine, particle system, and difficulty curve. You fight enemies, outrun zombies, decrypt Matrix rains, and race opponents — all by typing the right words at the right speed.

**Strict WPM measurement:** Only correctly typed words count. Wrong words contribute zero — no WPM inflation for fast-but-inaccurate typing.

---

## ✨ Features

### 🎮 Arcade Game Engine

| Feature | Description |
|---------|-------------|
| **20 Unique Games** | Each with its own physics, AI, and visual style |
| **100 Levels Total** | 5 levels per game, progressive difficulty |
| **60fps Canvas Rendering** | All games use requestAnimationFrame loops |
| **Particle Systems** | Explosion, trail, sparkle effects on every action |
| **Screen Shake** | Haptic-grade visual feedback on hits and combos |
| **Combo System** | Streak multipliers with popup animations |
| **Neon Color-Split Typing** | Green = correct · Red = wrong · Dim = remaining |
| **Virtual Keyboard Guide** | Live key highlighting shows which key to press next |
| **Body Collision** | Snake Typer detects head-into-body with death + respawn |
| **Opponent AI** | Racing game features an AI opponent that matches your pace |

### 📊 Analytics & Dashboard

| Feature | Description |
|---------|-------------|
| **Real-time WPM** | Updates every 400ms — strict correct-chars-only calculation |
| **Keystroke Accuracy** | Tracks every keystroke including wrong characters |
| **WPM History Chart** | 30-point rolling sparkline per session |
| **Letter Heatmap** | Per-key error frequency visualization |
| **Daily Challenge Streak** | Consecutive day tracking with streak badges |
| **Global Leaderboard** | Ranked by WPM with accuracy filters |
| **User Progress** | Per-game level progression saved to MongoDB |

### 📝 Practice Modes

| Mode | Description |
|------|-------------|
| **Timed Test** | 30/60/90/120-second typing tests with real passages |
| **Word Sprint** | Type a fixed set of words as fast as possible |
| **Blind Typing** | Hidden input trains pure muscle memory |
| **Govt Exam Passages** | Authentic text from SSC, UPSC, Banking, Railways exam papers |
| **Code Typing** | TypeScript, Python, Go, SQL, DevOps snippets |

### 🏫 Touch-Type Lessons

- **12 structured lessons** from home row to full keyboard mastery
- **Finger placement guides** with animated overlays
- **Speed milestones** unlock the next lesson
- **Progressive difficulty** — home row → QWERTY → numbers → symbols

---

## 🎮 Game Catalog (20 Games)

### 🏎️ Canvas Arcade Games (13 games)

| # | Game | Description | Canvas Features |
|---|------|-------------|----------------|
| 1 | **Turbo Race** | Type words to accelerate; AI opponent races you | 3D perspective road, rain physics, word overlay panel |
| 2 | **Arcade Fighter** | Type attack words to strike cyberpunk enemies | Sprite renderer, particle combat, screen shake, combo system |
| 3 | **Zombie Hunt** | Type words to shoot approaching zombies | HP system, wave spawning, moonlit graveyard atmosphere |
| 4 | **Galaxy Blitz** | Type words to fire energy bolts at alien invaders | Starfield parallax, shield bar, explosion rings, descent threat |
| 5 | **Meteor Defense** | Type words to destroy incoming meteors | Orbital physics, trail effects, warning zones |
| 6 | **Neon Runner** | Type words to jump over obstacles at high speed | Infinite scrolling, gravity physics, procedural obstacles |
| 7 | **Snake Typer** | Type food words to grow; avoid body collision | Pathfinding AI, death animation, 💀 body collision + respawn |
| 8 | **Word Invaders** | Space Invaders-style — type alien words before they land | Formation AI, color-coded waves, neon glow |
| 9 | **Code Rain** | Matrix-style — decrypt falling character columns | Vertical char-by-char color split, neon green glyphs |
| 10 | **Cyber Heist** | Type security codes to bypass firewall layers | Timer bombs, security breach animation |
| 11 | **Arena Blitz** | Rapid-fire word arena with speed bonuses | Multi-target selection, tray system |
| 12 | **Bubble Pop** | Type bubble words before they float away | Physics bubbles, float trajectories |
| 13 | **Fruit Blitz** | Fruit Ninja-style — slice word-tagged fruits | Slice animations, combo multipliers |

### 📚 Skill Trainer Games (7 games)

| # | Game | Description |
|---|------|-------------|
| 14 | **Word Sprint** | Pure speed drill — most common English words |
| 15 | **Govt Exam Sprint** | SSC/UPSC/Banking/Railways vocabulary speed test |
| 16 | **Sentence Rush** | Full sentence fluency from simple to complex passages |
| 17 | **Coding Practice** | Syntax-heavy coding vocabulary (TypeScript, Python, Go) |
| 18 | **Developer Vocab** | Terminal commands, git, DevOps vocabulary |
| 19 | **Reaction Drill** | Flash-card style reaction-time improvement |
| 20 | **Speed Competition** | Head-to-head speed race mode |

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + TypeScript 5        Component architecture with strict types
Vite 5                          Dev server, HMR, lazy-loaded bundle splitting
Tailwind CSS v4                 Utility-first styling with CSS custom properties
Framer Motion                   Page transitions, UI animations, spring physics
HTML5 Canvas API                All 13 arcade game engines at 60fps
Wouter                          Lightweight client-side routing (no React Router bloat)
TanStack Query v5               Server state management + automatic caching
Lucide React                    SVG icon system (tree-shakeable)
shadcn/ui                       Accessible, headless UI component primitives
Web Audio API                   Sound effects engine (click, slash, impact, bell)
```

### Backend
```
Express 4 + TypeScript          REST API server with typed request/response
Mongoose 8                      MongoDB ODM with schema validation
JWT (jsonwebtoken)              Stateless auth tokens — no session storage
bcrypt                          Password hashing (12 salt rounds)
CORS + Helmet                   Security middleware
Morgan                          HTTP request logging
Graceful Fallback               Server starts without MONGODB_URI — returns empty arrays
```

### Database
```
MongoDB Atlas                   Cloud-hosted NoSQL (or local MongoDB)
Collections: users, gameSessions, leaderboard, dailyChallenges
Indexes: userId, gameId, createdAt, wpm (leaderboard sorted queries)
```

### Monorepo (pnpm workspaces)
```
packages/api-spec               OpenAPI 3.0 spec — single source of truth
packages/api-client             Framework-agnostic REST client (fetch-based)
packages/api-client-react       TanStack Query hooks auto-generated from spec
```

---

## 📂 Project Structure

```
typeblitz/
├── frontend/                           React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── games/                  All 20 game canvas components
│   │   │   │   ├── ArcadeArena.tsx     Core game controller (WPM/accuracy engine)
│   │   │   │   ├── RacingGame.tsx      3D road physics + AI opponent
│   │   │   │   ├── FighterGame.tsx     Cyberpunk combat arena + particle system
│   │   │   │   ├── ZombieGame.tsx      Zombie wave survival with pressure logic
│   │   │   │   ├── GalaxyGame.tsx      Space invaders + starfield parallax
│   │   │   │   ├── MeteorGame.tsx      Meteor defense with orbital physics
│   │   │   │   ├── NeonRunnerGame.tsx  Infinite runner with gravity + jump physics
│   │   │   │   ├── SnakeTyperGame.tsx  Snake + body collision + respawn
│   │   │   │   ├── WordInvadersGame.tsx Alien invaders + color-split display
│   │   │   │   ├── CodeRainGame.tsx    Matrix rain + vertical char coloring
│   │   │   │   ├── CyberHeistGame.tsx  Heist puzzle with security timers
│   │   │   │   ├── ArenaBlitzGame.tsx  Arena combat with tray system
│   │   │   │   ├── BubblePopGame.tsx   Bubble physics + float trajectories
│   │   │   │   └── FruitBlitzGame.tsx  Fruit ninja with slice animations
│   │   │   ├── ui/                     shadcn/ui primitives
│   │   │   ├── layout.tsx              App shell + sidebar navigation
│   │   │   └── VirtualKeyboard.tsx     Animated live key highlighting
│   │   ├── pages/
│   │   │   ├── home.tsx                Landing page (782 lines, animated hero)
│   │   │   ├── games.tsx               Game catalog with category filters
│   │   │   ├── play.tsx                Game session controller (817 lines)
│   │   │   ├── dashboard.tsx           Analytics dashboard
│   │   │   ├── practice.tsx            Practice modes (1254 lines)
│   │   │   ├── leaderboard.tsx         Global rankings with filters
│   │   │   ├── challenge.tsx           Daily challenge with streak tracking
│   │   │   └── lesson.tsx              Touch-type lesson engine
│   │   ├── context/AuthContext.tsx     JWT auth state + token refresh
│   │   └── lib/
│   │       ├── audio.ts                Web Audio API sound effects engine
│   │       └── utils.ts                Shared utility functions
│   └── vite.config.ts
│
├── backend/                            Express + Mongoose REST API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts                 POST /login, /register · GET /me
│   │   │   ├── sessions.ts             POST /sessions · GET /sessions/:userId
│   │   │   ├── leaderboard.ts          GET /leaderboard
│   │   │   ├── games.ts                GET /games · GET /games/:id
│   │   │   ├── words.ts                GET /words?level=&category=
│   │   │   ├── lessons.ts              GET /lessons
│   │   │   └── challenge.ts            GET /challenge/today
│   │   ├── models/
│   │   │   ├── User.ts                 User schema (bcrypt password, stats)
│   │   │   ├── GameSession.ts          Session schema (wpm, accuracy, duration)
│   │   │   └── DailyChallenge.ts       Challenge schema with expiry
│   │   ├── data/
│   │   │   ├── words.ts                500+ curated vocabulary words
│   │   │   └── games.ts                20 game definitions × 5 levels each
│   │   └── middleware/auth.ts          JWT verification middleware
│   └── package.json
│
├── packages/
│   ├── api-spec/                       OpenAPI 3.0 specification
│   ├── api-client/                     Framework-agnostic REST client
│   └── api-client-react/               TanStack Query hooks
│
├── DESIGN.md                           Design system specification
├── README.md                           This file
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 20
pnpm >= 9
MongoDB Atlas account (or local MongoDB for development)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/typeblitz.git
cd typeblitz

# Install all workspace dependencies
pnpm install

# Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — add MONGODB_URI and JWT_SECRET
```

### Development

```bash
# Terminal 1 — Frontend (React + Vite)
pnpm --filter @workspace/typeblitz run dev

# Terminal 2 — Backend (Express + Mongoose)
pnpm --filter @workspace/api-server run dev
```

### Environment Variables

```env
# backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/typeblitz
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=3001
NODE_ENV=development
```

> **Note:** The backend starts successfully without `MONGODB_URI` — it logs a warning and returns empty arrays from database routes. This lets you run and develop the frontend without a MongoDB connection.

---

## ⚙️ WPM & Accuracy Engine

TypeBlitz uses **industry-standard strict WPM measurement** that prevents score inflation from fast-but-inaccurate typing.

### WPM Formula

```
WPM = (Total Correct Characters / 5) / Time in Minutes
```

**Rules:**
- ✅ Exactly typed words → all characters + 1 space count toward WPM
- ❌ Wrong words → contribute **zero** characters (no WPM padding for errors)
- ⏱️ Live WPM recalculates every 400ms during gameplay
- 🔤 Current unfinished word: only sequential correct chars from position 0 (stops at first mismatch)

### Accuracy Formula

```
Accuracy = ((Total Keystrokes − Error Keystrokes) / Total Keystrokes) × 100
```

**Keystroke tracking rules:**
- Every character typed (not backspace) increments `totalKeystrokes`
- Wrong character at any position → `errorKeystrokes++`
- Submitting a wrong word via space → additional error counted
- Backspace → not counted (correcting mistakes isn't penalized)

### Worked Example

```
Target:  "government exam preparation"

Typed:   "government exam preperation"  (wrong 'e' in preparation)

WPM chars:   "government " = 11 chars ✓
             "exam "       = 5 chars  ✓
             "preperation" = 0 chars  ✗ (wrong word = zero contribution)

Accuracy:    totalK = 27, errorK = 1 (wrong char at position 14)
             → (26/27) × 100 = 96.3%
```

---

## 📚 Vocabulary System

### Government Exam Vocabulary (500+ words)

| Category | Word Count | Example Words |
|----------|-----------|---------------|
| **SSC CGL** | 80+ | constitution, sovereignty, promulgation, jurisdiction, gazette |
| **UPSC Civil Services** | 70+ | bureaucracy, parliamentary, legislative, fundamental, tribunal |
| **IBPS Banking** | 70+ | collateral, depreciation, monetization, liquidity, consortium |
| **RRB Railways** | 60+ | infrastructure, electrification, privatization, locomotive |
| **Police/Defence** | 50+ | constabulary, cognizable, ordinance, jurisdiction, magistrate |
| **General Government** | 80+ | expenditure, appropriation, ordinance, ministerial, promulgate |

### Coding Vocabulary (300+ terms)

| Language/Domain | Word Count | Example Terms |
|----------------|-----------|---------------|
| **TypeScript** | 60+ | interface, generic, readonly, namespace, assertion, discriminated |
| **Python** | 50+ | decorator, generator, comprehension, iteration, metaclass |
| **Go** | 40+ | goroutine, channel, interface, defer, panic, recover |
| **SQL** | 40+ | transaction, constraint, aggregate, partition, materialized |
| **DevOps/Cloud** | 50+ | containerization, orchestration, kubernetes, terraform |
| **Git** | 30+ | rebase, stash, cherry-pick, bisect, worktree, reflog |

---

## 🌐 API Reference

All API routes are prefixed with `/api/`.

### Authentication
```http
POST   /api/auth/register    Body: { username, email, password }
POST   /api/auth/login       Body: { email, password } → { token, user }
GET    /api/auth/me          Headers: Authorization: Bearer <token>
```

### Game Data
```http
GET    /api/games                      All 20 game definitions with metadata
GET    /api/games/:id                  Single game + all 5 level configurations
GET    /api/words?level=1&category=govt Word list for a specific game session
GET    /api/lessons                    Touch-type lesson catalog (12 lessons)
GET    /api/challenge/today            Today's daily challenge word set
```

### Sessions & Analytics
```http
POST   /api/sessions                   Save completed game session result
GET    /api/sessions/:userId           User's full session history
GET    /api/sessions/:userId/stats     Aggregated stats: avg WPM, accuracy, heatmap data
GET    /api/leaderboard?limit=50       Global leaderboard sorted by WPM
```

---

## 📊 Dashboard & Analytics

The user dashboard tracks every dimension of typing performance:

| Metric | Description |
|--------|-------------|
| **Average WPM** | Rolling 30-day average across all game modes |
| **Peak WPM** | All-time personal best with date stamp |
| **Accuracy Trend** | Weekly accuracy improvement chart |
| **WPM History** | Session-by-session progression sparkline |
| **Letter Heatmap** | Per-key error rate — highlights weak fingers |
| **Game Progress** | Per-game level completion with unlocks |
| **Daily Streak** | Consecutive days with at least one completed session |
| **Words Typed** | All-time cumulative word count |
| **Exam Readiness** | Progress toward target WPM for each exam type |

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)

- [x] 20 arcade games with 5 difficulty levels each (100 total levels)
- [x] Strict WPM engine — correct-only word counting
- [x] Keystroke-based accuracy tracking
- [x] Real-time neon color-split typing display (green/red/dim)
- [x] MongoDB Atlas backend with graceful no-DB fallback
- [x] JWT authentication (register, login, protected routes)
- [x] Government exam vocabulary — 500+ words (SSC, UPSC, IBPS, RRB, Police)
- [x] Coding vocabulary — 300+ terms (TypeScript, Python, Go, SQL, DevOps, Git)
- [x] Virtual keyboard guide with live key highlighting
- [x] Analytics dashboard with WPM history + letter heatmap
- [x] Global leaderboard with WPM + accuracy ranking
- [x] Daily challenge system with streak tracking
- [x] 12 progressive touch-type lessons
- [x] Practice modes: Timed Test, Blind Typing, Word Sprint, Passage Mode
- [x] Fully responsive design (mobile → desktop)
- [x] Lazy-loaded routes and game components
- [x] Snake body collision with death animation + respawn
- [x] Racing game word overlay with color-split display
- [x] Racing game AI opponent

### 🔄 In Progress (v1.1)

- [ ] Clerk authentication integration
- [ ] Multiplayer head-to-head race mode (WebSocket)
- [ ] Progressive Web App (PWA) offline support
- [ ] Sound themes (typewriter, sci-fi, mechanical keyboard, rain)

### 📋 Planned (v1.2+)

- [ ] Mobile-optimized touch typing interface
- [ ] AI-powered weak key detection + targeted drill generation
- [ ] Custom vocabulary import (PDF / plain text upload)
- [ ] Tournament bracket system with scheduled events
- [ ] Hindi / regional language support
- [ ] Offline mode via Service Worker caching
- [ ] Discord bot for leaderboard sharing
- [ ] GitHub Copilot integration for developer practice mode
- [ ] Accessibility improvements (ARIA labels, screen reader support)

---

## 🎨 Design System

TypeBlitz uses a custom dark-mode design system. See [DESIGN.md](./DESIGN.md) for full specification.

**Core design tokens:**
```css
--background:   #0D0D0F    /* Near-black base */
--primary:      #00F5FF    /* Neon cyan — actions, progress, highlights */
--correct:      #39FF14    /* Neon green — correct keystrokes */
--error:        #FF2079    /* Neon pink — wrong keystrokes */
--surface:      #141418    /* Card / panel surfaces */
--muted:        #8B8B8B    /* Secondary / dimmed text */
```

**Design principles:**
- Dark-first, neon-accented — game context demands it
- Monospace for all game data (WPM, accuracy, scores)
- Motion is purposeful — animations communicate state, not decoration
- Canvas games own their visual space — no UI bleed into game canvas

---

## 🤝 Contributing

Contributions are very welcome! TypeBlitz is built in the open.

```bash
# Fork and clone
git clone https://github.com/yourusername/typeblitz.git

# Create a feature branch
git checkout -b feat/new-game-mode

# Install dependencies
pnpm install

# Run in development
pnpm --filter @workspace/typeblitz run dev
pnpm --filter @workspace/api-server run dev

# Submit a Pull Request
```

**Good first contributions:**
- 🎮 New game modes (any typing mechanic is welcome)
- 🌏 Regional language vocabulary packs (Hindi, Tamil, Telugu, etc.)
- 🧪 Test coverage (Vitest + React Testing Library)
- 🔊 Sound design (Web Audio API, new themes)
- 📱 Mobile UX improvements
- ♿ Accessibility (ARIA attributes, keyboard navigation)
- 📖 Documentation improvements

---

## 📄 License

MIT © TypeBlitz Contributors

---

<div align="center">

**Built with ❤️ for typists, developers, and government exam aspirants across India**

⭐ Star this repo if TypeBlitz improved your typing speed!

[🎮 Play Now](https://typeblitz.replit.app) · [📊 Dashboard](https://typeblitz.replit.app/dashboard) · [🏆 Leaderboard](https://typeblitz.replit.app/leaderboard) · [📖 Practice](https://typeblitz.replit.app/practice)

</div>
