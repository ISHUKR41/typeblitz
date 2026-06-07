# TypeBlitz ⚡

**The most addictive typing platform ever built.**  
Train through 20 arcade games, master government exam vocabulary, track your letter-level accuracy heatmap, and compete on the global leaderboard.

---

## What is TypeBlitz?

TypeBlitz is a full-stack typing game platform built for two audiences:

- **Government exam aspirants** (UPSC / SSC / RRB / Banking / Railways) — practise the exact vocabulary that appears on competitive exams, at exam-room speeds.
- **Developers & coders** — type real code snippets, programming keywords, algorithms, and DevOps terminology to build keystroke fluency.

Every session records WPM, accuracy, and per-letter error statistics so you always know which keys let you down.

---

## Features

### 20 Arcade Typing Games
| Game | Style | Focus |
|---|---|---|
| Word Sprint | Word-by-word timer | Raw speed |
| Govt Exam Sprint | Word-by-word timer | UPSC / SSC vocab |
| Sentence Rush | Full-sentence passages | Flow & accuracy |
| Code Type | Real code snippets | Brackets & symbols |
| Code Vocab | Keyword lists | Dev terminology |
| Letter Blaster | Falling letters | Reaction time |
| Typing Race | Ghost typist race | Beat the target WPM |
| Turbo Race | Car race metaphor | Speed with stakes |
| Word Fighter | Combat mechanic | Combo building |
| Zombie Hunt | Survival waves | Accuracy under pressure |
| Galaxy Blitz | Space shooter | Rapid-fire typing |
| Meteor Storm | Missile defence | Multi-target tracking |
| Neon Runner | Endless runner | Rhythm typing |
| Snake Typer | Snake game | Sustained focus |
| Word Invaders | Space Invaders | Formation shooting |
| Code Rain | Matrix rain | Find & decrypt words |
| Cyber Heist | Hacking nodes | Atmospheric accuracy |
| Arena Blitz | Circular arena | Multi-enemy targeting |
| Bubble Pop | Floating bubbles | Calm focus |
| Fruit Blitz | Fruit-slicing | Speed reaction |

Each game has **5 levels** with escalating WPM targets, word counts, and vocabulary difficulty.

### WPM & Accuracy Tracking
- **WPM** = correct characters ÷ 5 ÷ elapsed minutes (industry standard)
- **Accuracy** = correct keystrokes ÷ total keystrokes
- Wrong key = immediate red highlight; backspace required before advancing
- Only correctly typed characters count toward WPM

### Per-Letter Statistics
- Heatmap of every letter you have typed across all sessions
- Shows accuracy rate and average WPM per letter
- Identifies your slowest and most error-prone keys

### User Dashboard
- Lifetime stats: total sessions, best WPM, average accuracy, total characters typed
- WPM progress chart over time
- Letter accuracy heatmap
- Per-game and per-level progress tracking

### Leaderboard
- Global top-50 ranking by best WPM
- Filterable by game type and difficulty
- Updates after each session

### Practice Mode
- Free-form typing analysis
- Paste any text and receive an accuracy breakdown with weak-spot identification

### Lessons
- 12 structured lessons from beginner to advanced
- Covers home-row technique, special characters, government vocabulary, and code fluency

### Keyboard Pathfinder
- On-screen keyboard highlights the next key to press during gameplay
- Toggle on/off; helps beginners build correct finger placement habits

---

## Architecture

```
typeblitz/
├── frontend/                   # React + Vite (port 25383, serves "/")
│   └── src/
│       ├── pages/              # home, games, play, dashboard, leaderboard, practice, lesson, challenge, login
│       ├── components/
│       │   ├── games/          # 20 game components
│       │   └── ui/             # shadcn/ui component library
│       └── context/            # AuthContext (JWT)
│
├── backend/                    # Express + MongoDB/Mongoose (port 8080)
│   └── src/
│       ├── routes/             # auth, games, sessions, users, leaderboard, practice, lessons
│       ├── models/             # User, Session, LetterStat (Mongoose schemas)
│       └── lib/                # JWT auth, password hashing, DB connection
│
├── lib/
│   ├── api-spec/               # OpenAPI 3.0 spec (668 lines)
│   ├── api-client-react/       # Orval-generated React Query hooks
│   └── api-zod/                # Orval-generated Zod validation schemas
│
└── README.md
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Routing | Wouter |
| Data fetching | TanStack Query v5 + Orval codegen |
| Validation | Zod |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (HS256), bcrypt |
| API contract | OpenAPI 3.0 |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- MongoDB Atlas account (optional — app runs without it, returning empty data)

### Install dependencies
```bash
pnpm install
```

### Configure environment
```bash
# backend/.env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/typeblitz
JWT_SECRET=your-secret-key-min-32-chars
PORT=8080
```

The backend starts and serves all static game data even without `MONGODB_URI`. User accounts and session saving require a MongoDB connection.

### Run development servers

```bash
# Terminal 1 — backend API
pnpm --filter @workspace/api-server run dev

# Terminal 2 — frontend
pnpm --filter @workspace/typeblitz run dev
```

### Run in Replit
The **backend: API Server** and **frontend: web** workflows start automatically.  
Visit the preview URL to play immediately.

---

## API Reference

The full API is documented in [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml).

### Key endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/users/me` | Current user profile |
| GET | `/api/games` | List all 20 games with levels |
| GET | `/api/games/:id` | Single game detail |
| GET | `/api/games/:id/levels/:n/words` | Words for a specific level |
| POST | `/api/sessions` | Save a completed session |
| GET | `/api/users/:id/sessions` | Session history |
| GET | `/api/users/:id/stats` | Lifetime stats |
| GET | `/api/users/:id/letter-accuracy` | Per-letter heatmap data |
| GET | `/api/leaderboard` | Global rankings |
| GET | `/api/lessons` | List all lessons |
| POST | `/api/practice/analyze` | Analyze a practice passage |

All authenticated routes require `Authorization: Bearer <token>` header.

---

## Scoring & WPM Logic

```
WPM      = (correct_chars / 5) / elapsed_minutes
Accuracy = correct_keystrokes / total_keystrokes * 100
```

- A **word** is defined as 5 characters (standard)
- A character is **correct** only if it was typed without error
- Backspacing over a wrong character and retyping correctly still counts the original wrong keystroke against accuracy
- The timer starts on the first keypress and stops when the passage is complete or time expires

---

## License

MIT — build on it, learn from it, ship with it.
