# ⌨️ TypeBlitz

<div align="center">

**The most addictive typing platform ever built — for government exam prep and developers.**  
Type faster. Track everything. Dominate the leaderboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 🎮 What is TypeBlitz?

TypeBlitz is a **deep-void neon typing game platform** designed for:

| Audience | What they get |
|----------|--------------|
| 🏛️ **Govt exam aspirants** | UPSC, SSC CGL, IBPS Banking, RRB, Police, High Court vocabulary |
| 💻 **Developers** | Real code snippets, TypeScript, Python, Go, SQL, Git vocabulary |
| 🏆 **Competitive typists** | Leaderboards, daily challenges, combo streaks |
| 🎯 **Everyone** | 20 unique arcade games that make practice genuinely addictive |

> **Design Philosophy** — Deep void neon aesthetic (`#0D0D0F` bg · `#00F5FF` cyan · `#39FF14` green · `#FF2079` magenta). JetBrains Mono font. 60fps canvas games. Nothing fake, everything purpose-built.

---

## ✨ Core Features

### 🕹️ 20 Unique Typing Games

| # | Game | Genre | Unique Mechanic |
|---|------|-------|-----------------|
| 1 | 🏎️ **Turbo Race** | Racing | Pseudo-3D neon highway — type faster to accelerate. Ghost car tracks target WPM. Speed blur at 40+ WPM. |
| 2 | 🧟 **Zombie Hunt** | Survival | Zombies march from right. Type each word to shoot before they reach the survivor. |
| 3 | ⚔️ **Word Fighter** | Combat | Street-fighter duel. Type words to throw combo attacks and deplete enemy HP. |
| 4 | 🚀 **Galaxy Blitz** | Shooter | Space invaders. UFO ships descend carrying words — type to fire dual lasers. 3-layer nebula background. |
| 5 | ☄️ **Meteor Storm** | Defense | Meteors fall on city skyline. Type words before impact to destroy them and protect the planet. |
| 6 | 🏃 **Neon Runner** | Platformer | Endless runner — type correctly to jump over obstacles. Miss = fall. |
| 7 | 🐍 **Snake Typer** | Classic | Snake grows longer with every correct word. Miss = lose length. |
| 8 | 👾 **Word Invaders** | Arcade | Classic space invaders, remixed — alien rows descend unless you type faster. |
| 9 | 💻 **Code Rain** | Matrix | Descending matrix columns of words — clear columns before they overflow. |
| 10 | 🕵️ **Cyber Heist** | Stealth | Breach firewalls by typing access keys before the countdown expires. |
| 11 | 🎯 **Arena Blitz** | Combat | Top-down turret — enemies encircle you; type any visible word to destroy them. |
| 12 | 🫧 **Bubble Pop** | Casual | Word bubbles drift upward. Pop them before they float off-screen. |
| 13 | 🍉 **Fruit Blitz** | Action | Fruit Ninja-style — type words on flying fruit before they hit the ground. |
| 14 | ⚡ **Word Sprint** | Classic | Pure speed training with 5 difficulty tiers. |
| 15 | 🏛️ **Govt Exam Sprint** | Training | Authentic vocabulary from SSC, UPSC, Banking, Railways. |
| 16 | 📝 **Sentence Rush** | Fluency | Full-sentence typing for natural rhythm and flow. |
| 17 | `</>` **Code Type** | Developer | Real code snippets with brackets, symbols, semicolons. |
| 18 | 📚 **Code Vocab** | Developer | TypeScript · Python · Go · SQL · Git · DevOps terminology. |
| 19 | 💥 **Letter Blaster** | Drill | Rapid-fire single-letter reaction training. |
| 20 | 🏁 **Typing Race** | Competition | Your WPM vs a moving ghost-pace indicator. |

---

### ⚡ Engine & Mechanics

| Feature | Details |
|---------|---------|
| **Strict WPM Engine** | Only perfectly typed words count. Wrong words = **zero WPM contribution**. MonkeyType / TypeRacer standard. |
| **Sequential Accuracy** | Live WPM breaks at first typo in current word — no inflation from mismatched characters. |
| **Keystroke Accuracy** | `(total_keystrokes - errors) / total_keystrokes × 100` — every key pressed is tracked. |
| **Strict Mode** | Backspace or wrong key blocks input — maximum discipline. |
| **Combo System** | Chain correct words for streaks (3× → 5× → 10× → 15× COMBO with visual fireworks). |
| **Progressive Levels** | 5 levels per game. Need target WPM **and** 90%+ accuracy to advance. |

### 📊 Deep Analytics Dashboard

- **WPM Trend Chart** — visualize your speed over every session
- **Per-Letter Heatmap** — see exactly which keys you're slow or error-prone on
- **12 Achievement Badges** — Bronze to Diamond tier milestones
- **Session History** — full timeline of every practice run
- **Streak Counter** — daily login streaks with XP rewards

### 🔊 Real-Time Sound Engine

Three audio themes: **Mechanical Keyboard** · **Typewriter** · **Soft Touch**  
Every keystroke has weight. Wrong keys get an error buzz. Combo streaks trigger special sounds.

### 🏛️ Government Exam Vocabulary

| Exam Board | Vocabulary Domain |
|-----------|-------------------|
| SSC CGL / CHSL | Administrative, General Knowledge, English |
| IBPS / SBI Banking | Financial, Economy, Banking terms |
| RRB NTPC / Group D | Railway, Technical, Engineering |
| UPSC Mains | Civil Services, Polity, Governance |
| High Court / District | Legal, Judiciary, Constitutional |
| SSC CPO / CAPFs | Police, Defence, Security |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| pnpm | 8+ |
| MongoDB | Optional (Atlas or local) |

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/typeblitz.git
cd typeblitz

# Install all workspace dependencies
pnpm install
```

### Running Locally

```bash
# Terminal 1 — Backend API (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend Vite dev server
pnpm --filter @workspace/typeblitz run dev
```

Open **[http://localhost:8080](http://localhost:8080)** — the backend proxies the frontend automatically.

### Environment Variables

```env
# backend/.env

# MongoDB Atlas or local (optional — app works without it, returns empty arrays)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/typeblitz

# Session secret (change in production!)
SESSION_SECRET=your-super-secret-key-change-me

# Server port
PORT=8080
```

---

## 🏗️ Architecture

```
typeblitz/                         ← pnpm monorepo root
│
├── frontend/                      ← React + Vite (port 25383)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home.tsx           ← Landing page with live typing demo
│   │   │   ├── games.tsx          ← Game selection grid with categories
│   │   │   ├── play.tsx           ← Main typing arena (classic + arcade)
│   │   │   ├── dashboard.tsx      ← Stats, WPM chart, letter heatmap
│   │   │   ├── leaderboard.tsx    ← Global rankings per game
│   │   │   ├── practice.tsx       ← Touch-typing lesson hub
│   │   │   ├── challenge.tsx      ← Daily challenge with streak counter
│   │   │   └── lesson.tsx         ← Guided lesson with highlighted keys
│   │   │
│   │   ├── components/
│   │   │   ├── games/             ← 14 canvas-rendered arcade game modes
│   │   │   │   ├── ArcadeArena.tsx     ← Orchestrator + input/WPM engine
│   │   │   │   ├── RacingGame.tsx      ← Pseudo-3D racing with motion blur
│   │   │   │   ├── ZombieGame.tsx      ← Zombie survival + bullet tracers
│   │   │   │   ├── FighterGame.tsx     ← Street fighter HP duel
│   │   │   │   ├── GalaxyGame.tsx      ← Space shooter + nebula background
│   │   │   │   ├── MeteorGame.tsx      ← Meteor defense with city skyline
│   │   │   │   ├── NeonRunnerGame.tsx  ← Endless platformer runner
│   │   │   │   ├── SnakeTyperGame.tsx  ← Snake typer with growing body
│   │   │   │   ├── WordInvadersGame.tsx← Space invaders remix
│   │   │   │   ├── CodeRainGame.tsx    ← Matrix rain columns
│   │   │   │   ├── CyberHeistGame.tsx  ← Firewall breach countdown
│   │   │   │   ├── ArenaBlitzGame.tsx  ← Top-down turret combat
│   │   │   │   ├── BubblePopGame.tsx   ← Bubble drift pop
│   │   │   │   └── FruitBlitzGame.tsx  ← Fruit ninja typing
│   │   │   │
│   │   │   ├── layout.tsx         ← Sidebar + mobile nav drawer
│   │   │   ├── VirtualKeyboard.tsx← On-screen keyboard with neon glow
│   │   │   └── ui/                ← shadcn/ui components (Radix)
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx    ← JWT auth state (login/logout/me)
│   │   │
│   │   ├── lib/
│   │   │   ├── audio.ts           ← Web Audio API sound engine (3 themes)
│   │   │   ├── progress.ts        ← Level unlock logic (local storage)
│   │   │   └── utils.ts           ← Shared utilities
│   │   │
│   │   ├── App.tsx                ← Router + Suspense lazy loading
│   │   └── index.css              ← Deep void neon design system (v2)
│   │
│   └── package.json
│
├── backend/                       ← Express API (port 8080)
│   ├── src/
│   │   ├── app.ts                 ← Express + Vite dev proxy
│   │   ├── routes/
│   │   │   ├── auth.ts            ← POST /register, /login, /logout
│   │   │   ├── games.ts           ← GET /games, /games/:id, /levels
│   │   │   ├── sessions.ts        ← POST /sessions, GET /sessions
│   │   │   ├── leaderboard.ts     ← GET /leaderboard?game=
│   │   │   └── users.ts           ← GET /me, /stats, /progress
│   │   │
│   │   ├── data/
│   │   │   ├── words.ts           ← 500+ authentic vocabulary words
│   │   │   └── games.ts           ← Game definitions + 5 levels each
│   │   │
│   │   └── db/                    ← MongoDB connection (optional)
│   │
│   └── package.json
│
└── pnpm-workspace.yaml
```

---

## 📊 WPM Calculation — The Honest Standard

TypeBlitz uses the **industry-standard strict WPM formula** (same as MonkeyType, TypeRacer):

```
WPM = (correct_characters / 5) / elapsed_minutes
```

### Rules

| Rule | Details |
|------|---------|
| ✅ **Exact match only** | Only perfectly typed words contribute characters |
| ❌ **Wrong word = 0** | Incorrect words add zero to WPM |
| ✅ **Sequential chars** | Current word counts chars only up to first mismatch |
| 📊 **Accuracy formula** | `(total_keystrokes - errors) / total_keystrokes × 100` |
| 🔄 **Live tick** | WPM recalculates every 400ms for a smooth, honest display |

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18, TypeScript, Vite 5 | Fast HMR, strict typing |
| **Styling** | Tailwind CSS 4, custom design system | Utility-first + custom neon classes |
| **Animations** | Framer Motion 11 | GPU-accelerated transitions & effects |
| **UI Components** | shadcn/ui (Radix UI) | Accessible, composable primitives |
| **State / Data** | TanStack Query (React Query v5) | Optimistic updates, background sync |
| **Routing** | Wouter | Tiny, hook-based router |
| **Backend** | Node.js + Express 4 | Fast REST API |
| **Database** | MongoDB Atlas | Flexible schema for game progress & sessions |
| **Auth** | JWT + HTTP-only cookies | Secure, stateless sessions |
| **Games** | HTML5 Canvas + `requestAnimationFrame` | 60fps game loops |
| **Audio** | Web Audio API | Zero-latency typing sounds |
| **Fonts** | JetBrains Mono, Inter | Developer-first aesthetic |
| **Monorepo** | pnpm workspaces | Shared types, fast installs |

---

## 🏆 Progression System

Each game has **5 levels** with increasing difficulty:

| Level | Rank | Target WPM | Word Complexity |
|-------|------|-----------|----------------|
| 1 | 🟢 Cadet | ~20–25 | Basic common words |
| 2 | 🔵 Soldier | ~30–35 | Common vocabulary |
| 3 | 🟡 Sergeant | ~45–50 | Mixed difficulty |
| 4 | 🟠 Lieutenant | ~60–65 | Complex vocabulary |
| 5 | 🔴 Commander | ~75–85 | Expert + special chars |

**Unlock rule:** Hit target WPM **and** maintain ≥90% accuracy.

---

## 📱 Responsive Design

TypeBlitz is fully responsive across all breakpoints:

| Device | Layout |
|--------|--------|
| 📱 Mobile (< 640px) | Full-screen games, collapsible sidebar drawer, touch-optimized |
| 💻 Tablet (640–1024px) | 2-column game grid, condensed HUD |
| 🖥️ Desktop (> 1024px) | Fixed sidebar, 3-column grids, full HUD |

---

## 🤝 Contributing

```bash
# Fork and clone
git clone https://github.com/your-username/typeblitz.git

# Create a feature branch
git checkout -b feat/your-feature-name

# Make changes and open a PR
git push origin feat/your-feature-name
```

### Good First Issues
- Adding more government exam vocabulary to `backend/src/data/words.ts`
- Improving mobile touch interaction in existing games
- Adding new sound themes (synthwave, chiptune, rain)
- Writing unit tests for the WPM calculation engine
- Translating game instructions to Hindi / regional languages

---

## 📄 License

**MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

*Type faster. Type smarter. TypeBlitz.*

⭐ **Star this repo** if TypeBlitz helped your WPM!

</div>
