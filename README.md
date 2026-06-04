<div align="center">

<img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/keyboard.svg" width="72" height="72" alt="TypeBlitz Logo" />

# TypeBlitz

### The Professional Typing Game Platform

**Master typing speed through competitive games, structured lessons, and intelligent analytics —**  
**built for government exam aspirants, developers, and serious typists.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

<br/>

[🎮 Play Now](#getting-started) · [📖 Docs](#api-reference) · [🗺️ Roadmap](#roadmap) · [🤝 Contribute](#contributing)

<br/>

![TypeBlitz Screenshot](https://placehold.co/1200x600/0d1117/00d4aa?text=TypeBlitz+—+Professional+Typing+Platform&font=mono)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Game Modes](#game-modes)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

TypeBlitz is a **full-stack, production-grade typing game platform** designed to help users measurably improve their typing speed and accuracy through gamified practice. Unlike casual typing tools, TypeBlitz is built with a specific focus on three core user groups:

| Audience | What TypeBlitz Offers |
|---|---|
| 🏛️ **Govt Exam Aspirants** | SSC · UPSC · Banking · Railways · Police vocabulary |
| 💻 **Developers & Coders** | Programming keywords, algorithms, and DevOps terminology |
| ⌨️ **General Typists** | Progressive lessons, timed tests, and custom practice |

Every feature — from the real-time WPM sparkline to the letter-accuracy heatmap — is built to give users **actionable, measurable feedback** on exactly where they need to improve.

---

## ✨ Features

### 🎮 Gaming Experience
- **7 unique game modes** covering different vocabulary domains
- **5 levels per game** with progressive difficulty and WPM targets
- **Live WPM sparkline** — see your speed graph as you type, updated every second
- **Character-by-character feedback** with instant green/red visual response
- **Grade system** (S / A / B / C / D) on level completion based on WPM
- **Ghost Race mode** — race against a ghost typist through passages

### 📊 Analytics & Dashboard
- **Personal WPM progress chart** tracking improvement over time
- **Letter accuracy heatmap** — 26-key visual showing weakest characters
- **Level progress bars** for all 7 game modes
- **Recent sessions list** with WPM, accuracy, and duration
- **Streak counter** tracking consecutive days of practice
- **Per-user data** — every stat scoped to the authenticated user

### 🎓 Professional Practice
- **12 structured lessons** from home row to symbols and speed training
- **Government Exam passages** from actual SSC, UPSC, Banking, and Railways topics
- **Custom text practice** — paste any content and get AI-powered improvement suggestions
- **Timed tests** — 1, 2, and 5 minute benchmarks with instant results

### 🏆 Competition
- **Global leaderboard** ranked by best WPM per player
- **Filterable** by game mode to compare domain-specific rankings

### 🔐 Authentication
- Secure password hashing with `crypto.scrypt` (no bcrypt dependency)
- HMAC Bearer tokens signed with `SESSION_SECRET`
- Token stored in `localStorage` with auto-attach on every API call

### 📱 Responsive Design
- **Mobile-first** layout with slide-in hamburger drawer
- Fully functional on phones, tablets, and large monitors
- Consistent experience from 320px to 4K displays

---

## 🎮 Game Modes

<table>
<thead>
<tr><th>Game</th><th>Category</th><th>Vocabulary Domain</th><th>Difficulty</th><th>Levels</th></tr>
</thead>
<tbody>
<tr>
  <td><strong>⚡ Word Sprint</strong></td>
  <td>Speed Training</td>
  <td>Common English → Technical terms</td>
  <td>Beginner</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>🛡️ Govt Exam Sprint</strong></td>
  <td>Govt Exam Prep</td>
  <td>SSC · UPSC · Banking · Railways · Police</td>
  <td>Intermediate</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>≡ Sentence Rush</strong></td>
  <td>Fluency Training</td>
  <td>Daily sentences → Exam paragraphs</td>
  <td>Beginner</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>&lt;/&gt; Code Type</strong></td>
  <td>Coding Practice</td>
  <td>Variables → Production TypeScript</td>
  <td>Intermediate</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>&gt;_ Code Vocab</strong></td>
  <td>Developer Vocabulary</td>
  <td>Keywords → Architecture patterns</td>
  <td>Intermediate</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>🎯 Letter Blaster</strong></td>
  <td>Reaction Drill</td>
  <td>Home row → Symbols</td>
  <td>Beginner</td>
  <td>5</td>
</tr>
<tr>
  <td><strong>⏱️ Typing Race</strong></td>
  <td>Speed Competition</td>
  <td>Passages of increasing complexity</td>
  <td>Intermediate</td>
  <td>5</td>
</tr>
</tbody>
</table>

### Government Exam Vocabulary — Level Breakdown

| Level | Exam Equivalent | Example Words |
|---|---|---|
| 1 | Basic Admin | act, bill, vote, levy, loan, audit |
| 2 | Clerical | abide, cadre, fraud, quota, scrutiny |
| 3 | SSC CGL | abeyance, gazette, tribunal, fiduciary |
| 4 | UPSC Prelims | sovereignty, promulgation, bicameralism |
| 5 | IAS / IPS | devolutionary, gerrymandering, plenipotentiary |

### Coding Vocabulary — Level Breakdown

| Level | Equivalent | Example Terms |
|---|---|---|
| 1 | Keywords | int, var, let, null, void, bool |
| 2 | Common Dev | async, await, fetch, queue, scope |
| 3 | Engineering | abstraction, middleware, polymorphism |
| 4 | Architecture | dependency injection, event sourcing |
| 5 | Expert DevOps | circuit breaker, twelve-factor, zero downtime |

---

## 🛠️ Tech Stack

### Frontend (`artifacts/typeblitz`)

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 7 | Build tool & dev server |
| **TypeScript** | 5.9 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Framer Motion** | 12 | Animations & transitions |
| **shadcn/ui** | latest | Component library (Radix primitives) |
| **Wouter** | 3 | Lightweight client-side routing |
| **TanStack Query** | 5 | Server state management |
| **Recharts** | 2 | Dashboard data visualizations |
| **Lucide React** | latest | Icon system |
| **Orval** | generated | Auto-generated type-safe API hooks |

### Backend (`artifacts/api-server`)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24 | Runtime |
| **Express** | 5 | HTTP framework |
| **TypeScript** | 5.9 | Type safety |
| **Mongoose** | 9 | MongoDB ODM |
| **Pino** | 9 | Structured logging |
| **Zod** | v4 | Request/response validation |
| **esbuild** | latest | Fast CJS bundler |
| **crypto.scrypt** | built-in | Password hashing |
| **HMAC tokens** | built-in | Authentication |

### Shared Libraries

| Package | Purpose |
|---|---|
| `@workspace/api-spec` | OpenAPI 3.1 specification (source of truth) |
| `@workspace/api-client-react` | Auto-generated React Query hooks |
| `@workspace/api-zod` | Auto-generated Zod validation schemas |
| `@workspace/db` | Drizzle ORM schema (PostgreSQL fallback) |

### Infrastructure

| Service | Role |
|---|---|
| **MongoDB Atlas** | Primary database (cloud) |
| **PostgreSQL** | Fallback / local development |
| **Replit** | Hosting & deployment |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER CLIENT                           │
│  React 19 + Vite · TanStack Query · Framer Motion · Tailwind    │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTPS (Bearer token)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      REVERSE PROXY (Replit)                      │
│               Path-based routing: /  →  typeblitz                │
│                              /api →  api-server                  │
└──────┬───────────────────────────────────┬───────────────────────┘
       │                                   │
       ▼                                   ▼
┌──────────────┐                ┌──────────────────────────────────┐
│  Frontend    │                │         API Server               │
│  :25383      │                │  Express 5 · Node 24 · :8080     │
│              │                │                                  │
│  /           │                │  POST  /api/auth/register        │
│  /games      │                │  POST  /api/auth/login           │
│  /play/:g/:l │                │  GET   /api/auth/me              │
│  /practice   │                │  GET   /api/games                │
│  /dashboard  │                │  GET   /api/games/:id            │
│  /leaderboard│                │  GET   /api/games/:id/levels/:n  │
│  /lessons/:id│                │  GET   /api/lessons              │
└──────────────┘                │  POST  /api/sessions             │
                                │  GET   /api/users/:id/stats      │
                                │  GET   /api/leaderboard          │
                                │  POST  /api/practice/analyze     │
                                └──────────────┬───────────────────┘
                                               │
                                               ▼
                                ┌──────────────────────────────────┐
                                │          MongoDB Atlas            │
                                │                                  │
                                │  users       sessions            │
                                │  letterStats                     │
                                └──────────────────────────────────┘
```

### Contract-First API Design

The API is **OpenAPI-first**: the spec at `lib/api-spec/openapi.yaml` is the single source of truth. React Query hooks and Zod validation schemas are **auto-generated** via Orval from this spec — never written by hand.

```
lib/api-spec/openapi.yaml
        │
        │  pnpm --filter @workspace/api-spec run codegen
        ▼
lib/api-client-react/src/generated/api.ts        ← React Query hooks
lib/api-zod/src/generated/api.ts                 ← Zod schemas
```

---

## 📁 Project Structure

```
typeblitz/
├── artifacts/
│   ├── typeblitz/                    # 🖥️  Frontend (React + Vite)
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── home.tsx          # Landing page with hero + stats
│   │       │   ├── games.tsx         # Game mode selection grid
│   │       │   ├── play.tsx          # Typing arena (real-time WPM)
│   │       │   ├── practice.tsx      # Lessons / Govt Exam / Custom / Timed
│   │       │   ├── dashboard.tsx     # Analytics dashboard
│   │       │   ├── leaderboard.tsx   # Global rankings
│   │       │   ├── lesson.tsx        # Individual lesson view
│   │       │   └── login.tsx         # Auth (login + register)
│   │       ├── components/
│   │       │   ├── layout.tsx        # Responsive sidebar + hamburger
│   │       │   └── ui/               # shadcn/ui primitives
│   │       └── context/
│   │           └── AuthContext.tsx   # Auth state + token management
│   │
│   └── api-server/                   # ⚙️  Backend (Express + Node)
│       └── src/
│           ├── routes/
│           │   ├── index.ts          # Route mounting
│           │   ├── auth.ts           # Register, login, logout, me
│           │   ├── games.ts          # Game list + level words
│           │   ├── sessions.ts       # Session CRUD + practice analyze
│           │   ├── users.ts          # Stats, progress, letter accuracy
│           │   ├── leaderboard.ts    # Global WPM rankings
│           │   └── lessons.ts        # Structured lesson content
│           ├── models/               # Mongoose schemas
│           │   ├── User.ts
│           │   ├── Session.ts
│           │   └── LetterStat.ts
│           ├── data/                 # Static game content
│           │   ├── games.ts          # Game + level definitions
│           │   ├── words.ts          # Word banks (7 games × 5 levels)
│           │   └── lessons.ts        # 12 structured lessons
│           ├── lib/
│           │   └── db.ts             # MongoDB connection manager
│           └── index.ts              # Server entry point
│
├── lib/
│   ├── api-spec/                     # 📋 OpenAPI 3.1 spec
│   ├── api-client-react/             # 🔗 Generated React Query hooks
│   ├── api-zod/                      # ✅ Generated Zod schemas
│   └── db/                           # 🗄️  Drizzle ORM (PostgreSQL)
│
├── pnpm-workspace.yaml               # Workspace + catalog
├── tsconfig.base.json                # Shared TypeScript config
└── README.md                         # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 24
- **pnpm** ≥ 9
- **MongoDB Atlas** account (or local MongoDB for development)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/typeblitz.git
cd typeblitz
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | ✅ Yes | HMAC signing secret (min 32 chars) |
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `DATABASE_URL` | Optional | PostgreSQL URL (fallback) |
| `PORT` | Auto | Server port (set by Replit) |

### 4. Start Development Servers

```bash
# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (port 25383)  
pnpm --filter @workspace/typeblitz run dev
```

### 5. Regenerate API Hooks (after spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## 🔐 Environment Variables

### `SESSION_SECRET`
Used to sign HMAC Bearer tokens. Generate a secure value:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `MONGODB_URI`
Your MongoDB Atlas connection string:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/typeblitz?retryWrites=true&w=majority
```

> ⚠️ **Never commit secrets to version control.** Use Replit Secrets or `.env` files.

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create new account | No |
| `POST` | `/auth/login` | Get Bearer token | No |
| `POST` | `/auth/logout` | Invalidate token | Yes |
| `GET` | `/auth/me` | Get current user | Yes |

### Games

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/games` | List all game modes |
| `GET` | `/games/:gameId` | Get single game |
| `GET` | `/games/:gameId/levels/:level/words` | Get level content |

### Sessions & Stats

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/sessions` | Save a completed session |
| `GET` | `/users/:id/sessions` | User's session history |
| `GET` | `/users/:id/stats` | WPM/accuracy averages |
| `GET` | `/users/:id/progress` | Progress per game |
| `GET` | `/users/:id/letter-accuracy` | Per-letter accuracy |
| `GET` | `/users/:id/level-progress` | Level unlock status |

### Practice

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/practice/analyze` | AI-powered text analysis |
| `GET` | `/lessons` | List all 12 lessons |
| `GET` | `/lessons/:id` | Get lesson content |

### Leaderboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/leaderboard` | Global best WPM rankings |

---

## 🗄️ Database Schema

### `users` Collection

```typescript
{
  _id: ObjectId,
  username: string,          // unique
  passwordHash: string,      // scrypt hash
  salt: string,              // random hex salt
  bestWpm: number,
  totalSessions: number,
  createdAt: Date,
  updatedAt: Date,
}
```

### `sessions` Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users
  gameId: string,            // e.g. "word-sprint"
  gameMode: string,
  level: number,
  wpm: number,
  accuracy: number,          // 0-100
  duration: number,          // seconds
  createdAt: Date,
}
```

### `letterstats` Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // ref: users
  letter: string,            // single character
  totalTyped: number,
  correctTyped: number,
  accuracy: number,          // computed field
  updatedAt: Date,
}
```

---

## 🗺️ Roadmap

### ✅ Current (v1.0)

- [x] 7 game modes with 5 levels each
- [x] Government Exam vocabulary (SSC/UPSC/Banking/Railways)
- [x] Programming/Coding vocabulary (Keywords → DevOps)
- [x] Real-time WPM sparkline during gameplay
- [x] Letter-by-letter accuracy heatmap
- [x] 12 structured progressive lessons
- [x] Government Exam practice passages
- [x] Custom text practice with AI analysis
- [x] Timed tests (1 / 2 / 5 minutes)
- [x] Global leaderboard
- [x] Responsive design with mobile hamburger menu
- [x] MongoDB Atlas integration
- [x] HMAC token authentication

### 🔄 In Progress (v1.1)

- [ ] Ghost Race — visual cursor showing your best previous run
- [ ] Persistent level unlock tracking (per-user in DB)
- [ ] Email verification on registration
- [ ] Session replay — watch your typing session back

### 🔭 Future (v2.0)

- [ ] **Multiplayer Mode** — race against other users in real-time via WebSockets
- [ ] **AI Difficulty Adaptation** — dynamically adjust word difficulty based on live accuracy
- [ ] **Hindi / Regional Language Mode** — Devanagari typing support
- [ ] **Custom Word Packs** — import any word list / vocabulary CSV
- [ ] **Exam-Specific Packs** — SSC CGL 2024, UPSC Prelims, IBPS PO dedicated word sets
- [ ] **Mobile App** — React Native (Expo) with the same backend
- [ ] **Streak & Achievement System** — badges, daily goals, XP system
- [ ] **Teacher Dashboard** — classroom mode for institutes and coaching centers
- [ ] **Offline Mode** — Progressive Web App with service worker
- [ ] **Accessibility** — full screen reader + keyboard navigation support

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes with clear messages
4. **Run** typechecks: `pnpm run typecheck`
5. **Open** a Pull Request against `main`

### Development Guidelines

- Follow the **contract-first API** pattern — update `lib/api-spec/openapi.yaml` before writing route code
- Run `pnpm --filter @workspace/api-spec run codegen` after any spec change
- Never use `console.log` in server code — use `req.log` (Pino)
- Keep each feature in its own file; avoid mega-components
- All new word content goes in `artifacts/api-server/src/data/words.ts`

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License — Copyright (c) 2025 TypeBlitz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

<div align="center">

**Built with ❤️ for the typing community**

[⬆ Back to top](#typeblitz)

</div>
