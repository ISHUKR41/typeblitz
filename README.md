# TypeBlitz ⚡

> **The world's most addictive typing trainer** — 13 arcade-quality game modes, millisecond-precise WPM tracking, and government exam vocabulary built for serious aspirants.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongoosejs.com/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Game Modes](#game-modes)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [WPM Accuracy Model](#wpm-accuracy-model)

---

## Overview

TypeBlitz is a full-stack typing game platform where speed meets precision. Unlike generic typing tests, TypeBlitz is purpose-built for:

- **Government exam aspirants** — SSC CGL, UPSC, Banking, Railways vocabulary embedded into gameplay
- **Developers** — Real code snippets, programming keywords, and DevOps terminology
- **Competitive typists** — Leaderboards, combo streaks, and grade rankings (S/A/B/C/D)

Every WPM point is earned honestly — wrong words contribute **zero** correct characters to your score.

---

## Architecture

```
typeblitz/
├── frontend/          React 19 + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── games/         Canvas arcade engines
│   │   │   │   ├── ArcadeArena.tsx    (orchestrator + WPM engine)
│   │   │   │   ├── RacingGame.tsx     (car racing canvas)
│   │   │   │   ├── FighterGame.tsx    (fighting game canvas)
│   │   │   │   ├── ZombieGame.tsx     (zombie wave canvas)
│   │   │   │   ├── GalaxyGame.tsx     (space shooter canvas)
│   │   │   │   ├── MeteorGame.tsx     (NEW: meteor defense canvas)
│   │   │   │   └── NeonRunnerGame.tsx (NEW: endless runner canvas)
│   │   │   ├── ui/            shadcn/ui component library
│   │   │   └── VirtualKeyboard.tsx
│   │   ├── pages/             Wouter route pages
│   │   │   ├── home.tsx       Landing page
│   │   │   ├── games.tsx      Game selector with level cards
│   │   │   ├── play.tsx       Universal game runner
│   │   │   ├── leaderboard.tsx
│   │   │   ├── dashboard.tsx  Per-user analytics
│   │   │   ├── challenge.tsx  Daily challenge
│   │   │   └── practice.tsx   Custom practice mode
│   │   ├── context/           Auth context (JWT)
│   │   ├── lib/               Audio engine, progress tracker
│   │   └── main.tsx
│   └── vite.config.ts
│
├── backend/           Express 5 + Mongoose API server
│   ├── src/
│   │   ├── routes/            REST API route handlers
│   │   ├── models/            Mongoose schemas
│   │   │   ├── User.ts        (username, hashedPw, stats)
│   │   │   ├── Session.ts     (wpm, accuracy, letterErrors)
│   │   │   └── LetterStat.ts
│   │   └── data/
│   │       ├── games.ts       Game + level definitions (13 games, 65 levels)
│   │       └── words.ts       10,000+ word vocabulary bank
│   └── build.mjs              esbuild bundler config
│
└── lib/               Shared types + React Query hooks
    └── api-client-react/      Orval-generated OpenAPI client
```

---

## Game Modes

### Standard Games (7 modes)

| Game | Difficulty | Focus |
|------|-----------|-------|
| **Word Sprint** | Beginner | Raw speed, common English + UPSC vocab |
| **Govt Exam Sprint** | Intermediate | SSC CGL, UPSC, Banking, Railways terms |
| **Sentence Rush** | Beginner | Full sentences, exam passages |
| **Code Type** | Intermediate | Real code snippets (JS/TS) |
| **Code Vocab** | Intermediate | Programming keywords + DevOps terms |
| **Letter Blaster** | Beginner | Key-group drills, symbol practice |
| **Typing Race** | Intermediate | Race against ghost typist |

### Arcade Games — Canvas Engines (6 modes)

| Game | Mechanic | Visual Style |
|------|----------|-------------|
| **Turbo Race** | Type words = accelerate your car | Side-scroll race with ghost opponent |
| **Word Fighter** | Type = combo strike attack | Sprite fighting arena |
| **Zombie Hunt** | Type = eliminate zombie | Survival wave horde mode |
| **Galaxy Blitz** | Type = fire laser at alien ship | Space shooter with shield HP |
| **Meteor Storm** ✨ | Type = laser-destroy incoming meteors | Parallax city with cannon + explosions |
| **Neon Runner** ✨ | Type = jump/dash over obstacles | Neon cyberpunk endless runner |

Each arcade game uses `requestAnimationFrame` canvas rendering with:
- 60 fps parallax multi-layer backgrounds
- Particle burst explosions
- Real-time physics (jumping, velocity, gravity simulation)
- Combo streak multipliers displayed live
- HP shield system with color-coded warnings

---

## Tech Stack

### Frontend
- **React 19** with concurrent features
- **Vite 6** — HMR, tree-shaking, esbuild minification
- **Tailwind CSS 4** — utility-first responsive design
- **Framer Motion** — spring animations, page transitions
- **Wouter** — lightweight client-side routing (~2kb)
- **shadcn/ui** — accessible Radix-based component library
- **React Query v5** — server state, caching, mutations
- **Orval** — OpenAPI spec → typed React Query hooks (auto-generated)

### Backend
- **Express 5** — async route handlers, error middleware
- **Mongoose 8** — MongoDB ODM with typed schemas
- **Pino** — structured JSON logging with pretty dev output
- **esbuild** — fast ESM bundle for production

### Monorepo
- **pnpm workspaces** — shared `lib/` package across frontend + backend
- **TypeScript 5** strict mode throughout
- **OpenAPI 3.1** spec drives the API contract

---

## Features

### Honest WPM Scoring
- Wrong words contribute **zero** correct characters
- Live WPM recalculated every 400ms
- Industry-standard 5-chars-per-word normalization
- Keystroke-level accuracy (every wrong keypress is an error)

### Canvas Arcade Engine
- All 6 arcade games share the `ArcadeProps` interface
- Single hidden `<input>` captures all keystrokes
- Canvas renders game world at 60fps
- Word submissions fire `lastWordCorrect` + `submissionCount` signals

### Progress & Leveling
- 5 levels per game with target WPM + min 90% accuracy threshold
- Progress stored in localStorage (no account required)
- Sequential unlock gating
- Grades: S ≥80, A ≥60, B ≥40, C ≥25, D <25 WPM

### Vocabulary Bank
- **10,000+ words** across four categories
- Government exams: SSC CGL, UPSC, Banking, Railways, Police
- Programming: keywords, patterns, DevOps, architecture
- Code snippets: variables, functions, classes, algorithms
- Escalating difficulty per level within each game

### Audio System
- 4 sound themes: Default, Mechanical, Typewriter, Retro
- Per-event sounds: click, error, typewriter bell, laser, explosion, victory, defeat
- Mutable via HUD toggle

### Analytics
- Letter-by-letter error heatmap
- WPM sparkline history chart
- Global leaderboard with rank delta
- Daily challenge streak tracking

---

## API Reference

Base URL: `http://localhost:8080/api`

### Auth
```
POST  /api/auth/register    { username, password } → { token, user }
POST  /api/auth/login       { username, password } → { token, user }
GET   /api/auth/me                                 → { id, username }
POST  /api/auth/logout
```

### Games
```
GET   /api/games                              → Game[]
GET   /api/games/:gameId                      → Game
GET   /api/games/:gameId/levels/:n/words      → { words[], text? }
```

### Sessions
```
POST  /api/sessions    { userId, gameId, wpm, accuracy, duration, level }
GET   /api/sessions    ?userId=...  → Session[]
```

### Leaderboard
```
GET   /api/leaderboard?gameId=...&limit=50    → LeaderboardEntry[]
```

### Stats
```
GET   /api/stats/:userId         → { totalSessions, avgWpm, bestWpm, accuracy }
GET   /api/letter-stats/:userId  → { letter: { attempts, correct } }
```

---

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- MongoDB (optional — app works without it, returns empty data)

### Steps

```bash
# 1. Clone and install
git clone https://github.com/your-username/typeblitz.git
cd typeblitz
pnpm install

# 2. Environment (optional)
echo "MONGODB_URI=mongodb://localhost:27017/typeblitz" >> .env
echo "JWT_SECRET=your-secret-key" >> .env

# 3. Start backend (port 8080)
cd backend && pnpm dev

# 4. Start frontend (auto-proxies /api to backend)
cd frontend && pnpm dev

# Open: http://localhost:25383
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | No | MongoDB connection string. App works without it (empty data) |
| `JWT_SECRET` | Yes (auth) | Secret for signing JWT tokens |
| `PORT` | No | Backend listen port (default: 8080) |
| `NODE_ENV` | No | `production` enables minification + disables error overlay |

---

## Project Structure (Key Files)

```
frontend/src/
  components/games/ArcadeArena.tsx    WPM engine + game router
  components/games/MeteorGame.tsx     Meteor defense canvas (NEW)
  components/games/NeonRunnerGame.tsx Endless runner canvas (NEW)
  pages/play.tsx                      Universal game runner
  pages/games.tsx                     Game selector grid
  lib/audio.ts                        Web Audio sound effects
  lib/progress.ts                     LocalStorage level progress
  context/AuthContext.tsx             JWT auth provider

backend/src/
  data/games.ts                       13 games, 65 level definitions
  data/words.ts                       10,000+ word vocabulary bank
  routes/games.ts                     /api/games REST handlers
  routes/sessions.ts                  /api/sessions REST handlers
  models/Session.ts                   Mongoose session schema
```

---

## WPM Accuracy Model

TypeBlitz uses **strict exact-word WPM counting**:

```
correctChars = Σ (word.length + 1) for each EXACTLY matched word
                                ↑ +1 for space separator

WPM = correctChars / 5 / elapsedMinutes
```

Typing `"teh"` for `"the"` → **0 correct chars** for that word. Only 100% correct words contribute.

Accuracy uses keystroke-level counting:
```
accuracy = (totalKeystrokes - errorKeystrokes) / totalKeystrokes × 100
```

`errorKeystrokes` increments once per wrong character typed (not per wrong word), making it sensitive to all mistakes while remaining fair to fast typists who self-correct.

---

## License

MIT — build on top of it, ship it, remix it.
