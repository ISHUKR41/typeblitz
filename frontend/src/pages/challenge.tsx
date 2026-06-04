import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Challenge = {
  id: string;
  title: string;
  category: "Govt Exam" | "Code" | "Professional";
  targetWpm: number;
  text: string;
  tags: string[];
};

type ChallengeResult = {
  dateKey: string;
  challengeId: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  completedAt: string;
  weakKeys: string[];
};

const STORAGE_KEY = "typeblitz.dailyChallenge.results.v1";

const CHALLENGES: Challenge[] = [
  {
    id: "constitution-fundamentals",
    title: "Constitution Fundamentals",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["UPSC", "SSC", "Polity"],
    text: "The Constitution of India establishes justice, liberty, equality, and fraternity as guiding principles for democratic governance and public administration.",
  },
  {
    id: "banking-operations",
    title: "Banking Operations",
    category: "Govt Exam",
    targetWpm: 38,
    tags: ["Banking", "IBPS", "SBI"],
    text: "A scheduled commercial bank accepts deposits, extends credit, maintains liquidity ratios, manages risk exposure, and follows Reserve Bank of India regulations.",
  },
  {
    id: "railway-technical",
    title: "Railway Technical Terms",
    category: "Govt Exam",
    targetWpm: 34,
    tags: ["Railways", "RRB", "Technical"],
    text: "Railway signalling, traction systems, station yards, freight corridors, and safety protocols support reliable passenger and goods movement across India.",
  },
  {
    id: "typescript-api",
    title: "TypeScript API Drill",
    category: "Code",
    targetWpm: 32,
    tags: ["TypeScript", "API", "Backend"],
    text: "export async function fetchUserStats(userId: string) { const response = await fetch(`/api/users/${userId}/stats`); return response.json(); }",
  },
  {
    id: "python-loop",
    title: "Python Logic Drill",
    category: "Code",
    targetWpm: 30,
    tags: ["Python", "Logic", "Loops"],
    text: "for index, value in enumerate(scores): average += value / len(scores); print(f'Rank {index + 1}: {round(average, 2)}')",
  },
  {
    id: "professional-email",
    title: "Professional Communication",
    category: "Professional",
    targetWpm: 42,
    tags: ["Office", "Email", "Accuracy"],
    text: "Please review the attached report, verify the pending observations, and share a concise update before the scheduled meeting tomorrow morning.",
  },
  {
    id: "public-finance",
    title: "Public Finance",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["Economy", "UPSC", "Finance"],
    text: "Fiscal deficit, revenue expenditure, capital receipts, direct taxes, subsidies, and public debt are central concepts in government budget analysis.",
  },
  {
    id: "ssc-cgl-administration",
    title: "SSC CGL Administration",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["SSC", "CGL", "Administration"],
    text: "The Staff Selection Commission conducts examinations for recruitment to Group B and Group C posts in various ministries, departments, and attached offices of the Government of India.",
  },
  {
    id: "ssc-chsl-clerical",
    title: "SSC CHSL Clerical Skills",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["SSC", "CHSL", "Clerical"],
    text: "Lower Division Clerks maintain official records, handle correspondence, prepare reports, process applications, manage file movements, and assist senior officers in administrative functions.",
  },
  {
    id: "court-stenographer",
    title: "Court Proceedings",
    category: "Govt Exam",
    targetWpm: 40,
    tags: ["Court", "Stenographer", "Legal"],
    text: "The Honourable Court directed that the respondent shall file a written statement within thirty days and the matter shall be listed for hearing on the next date fixed by the registry.",
  },
  {
    id: "police-examination",
    title: "Police Examination Passage",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["Police", "SSC", "CPO"],
    text: "Central Police Organisation recruits Sub-Inspectors through written examination, physical endurance test, and medical examination conducted under the supervision of the commission.",
  },
  {
    id: "ias-governance",
    title: "IAS Governance Concepts",
    category: "Govt Exam",
    targetWpm: 38,
    tags: ["UPSC", "IAS", "Governance"],
    text: "Good governance emphasises transparency, accountability, responsiveness, consensus orientation, equity, inclusiveness, effectiveness, and adherence to the rule of law in public administration.",
  },
  {
    id: "defense-services",
    title: "Defence Services",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["Defense", "NDA", "CDS"],
    text: "The Combined Defence Services Examination selects candidates for admission to the Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers Training Academy.",
  },
  {
    id: "election-commission",
    title: "Election Commission",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["Polity", "SSC", "Elections"],
    text: "The Election Commission of India is an autonomous constitutional body responsible for administering union and state election processes, ensuring free and fair elections across the country.",
  },
  {
    id: "react-component",
    title: "React Component Pattern",
    category: "Code",
    targetWpm: 30,
    tags: ["React", "JSX", "Frontend"],
    text: "const Dashboard = ({ user, stats }: Props) => { return (<div className='grid gap-4'><Header name={user.name} /><StatsCard data={stats} /></div>); };",
  },
  {
    id: "sql-query",
    title: "SQL Query Drill",
    category: "Code",
    targetWpm: 28,
    tags: ["SQL", "Database", "Query"],
    text: "SELECT users.name, COUNT(sessions.id) AS total_sessions, AVG(sessions.wpm) AS avg_wpm FROM users LEFT JOIN sessions ON users.id = sessions.user_id GROUP BY users.id ORDER BY avg_wpm DESC;",
  },
  {
    id: "go-concurrency",
    title: "Go Concurrency Pattern",
    category: "Code",
    targetWpm: 28,
    tags: ["Go", "Goroutines", "Backend"],
    text: "func processItems(items []Item) { var wg sync.WaitGroup; for _, item := range items { wg.Add(1); go func(i Item) { defer wg.Done(); handle(i) }(item); }; wg.Wait(); }",
  },
  {
    id: "java-oop",
    title: "Java OOP Drill",
    category: "Code",
    targetWpm: 29,
    tags: ["Java", "OOP", "Classes"],
    text: "public class UserService implements Service<User> { @Override public User findById(Long id) { return repository.findById(id).orElseThrow(() -> new NotFoundException(id)); } }",
  },
  {
    id: "rust-ownership",
    title: "Rust Ownership",
    category: "Code",
    targetWpm: 26,
    tags: ["Rust", "Memory", "Safety"],
    text: "fn process(data: Vec<u8>) -> Result<String, Error> { let parsed = String::from_utf8(data)?; let trimmed = parsed.trim().to_lowercase(); Ok(trimmed) }",
  },
  {
    id: "professional-minutes",
    title: "Meeting Minutes",
    category: "Professional",
    targetWpm: 40,
    tags: ["Office", "Minutes", "Reporting"],
    text: "The committee resolved that the quarterly budget allocation be revised to accommodate infrastructure development, staff training initiatives, and digital transformation projects across all departments.",
  },
  {
    id: "professional-tender",
    title: "Tender Notice Format",
    category: "Professional",
    targetWpm: 38,
    tags: ["Tender", "Government", "Procurement"],
    text: "Sealed tenders are hereby invited from eligible contractors for the construction and maintenance of the district headquarters building, as per specifications available in the office of the Executive Engineer.",
  },
];

function getDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashDateKey(dateKey: string): number {
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function countCorrectChars(expected: string, typed: string): number {
  let correct = 0;
  const len = Math.min(expected.length, typed.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === expected[i]) correct++;
  }
  return correct;
}

function calculateStats(expected: string, typed: string, seconds: number) {
  if (typed.length === 0) {
    return { wpm: 0, accuracy: 100, errors: 0, correct: 0 };
  }

  const correct = countCorrectChars(expected, typed);
  const denominator = Math.max(expected.length, typed.length);
  const accuracy = denominator > 0 ? Math.round((correct / denominator) * 100) : 100;
  const wpm = Math.round((correct / 5) / (Math.max(seconds, 1) / 60));
  const errors = Math.max(denominator - correct, 0);
  return { wpm, accuracy, errors, correct };
}

function findWeakKeys(expected: string, typed: string): string[] {
  const misses = new Map<string, number>();
  const maxLen = Math.max(expected.length, typed.length);

  for (let i = 0; i < maxLen; i++) {
    const source = expected[i]?.toLowerCase();
    if (!source || !/[a-z0-9]/.test(source)) continue;
    if (typed[i]?.toLowerCase() !== source) {
      misses.set(source, (misses.get(source) ?? 0) + 1);
    }
  }

  return [...misses.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key]) => key);
}

function loadResults(): ChallengeResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveResult(result: ChallengeResult) {
  const existing = loadResults();
  const next = [
    result,
    ...existing.filter(
      item => !(item.dateKey === result.dateKey && item.challengeId === result.challengeId),
    ),
  ].slice(0, 90);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function getStreak(results: ChallengeResult[], todayKey: string): number {
  const completedDates = new Set(results.map(result => result.dateKey));
  let streak = 0;
  const cursor = new Date(`${todayKey}T00:00:00`);

  while (completedDates.has(getDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function ChallengeText({ text, input }: { text: string; input: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-mono text-base leading-8 md:text-lg">
      {text.split("").map((char, index) => {
        let cls = "text-muted-foreground/55";
        if (index < input.length) {
          cls = input[index] === char
            ? "text-foreground"
            : "rounded-sm bg-destructive/15 text-destructive";
        } else if (index === input.length) {
          cls = "border-b-2 border-primary text-foreground";
        }
        return <span key={index} className={cls}>{char}</span>;
      })}
    </div>
  );
}

export default function ChallengePage() {
  const todayKey = getDateKey();
  const challenge = useMemo(
    () => CHALLENGES[hashDateKey(todayKey) % CHALLENGES.length],
    [todayKey],
  );
  const [results, setResults] = useState<ChallengeResult[]>(() => loadResults());
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ChallengeResult | null>(() =>
    loadResults().find(
      item => item.dateKey === todayKey && item.challengeId === challenge.id,
    ) ?? null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const liveStats = calculateStats(challenge.text, input, elapsed || 1);
  const personalBest = results.find(
    item => item.dateKey === todayKey && item.challengeId === challenge.id,
  );
  const streak = getStreak(results, todayKey);
  const progress = Math.min((input.length / challenge.text.length) * 100, 100);

  useEffect(() => {
    if (!startedAt || result) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [startedAt, result]);

  const completeChallenge = (typed: string, seconds: number) => {
    const stats = calculateStats(challenge.text, typed, seconds);
    const completed: ChallengeResult = {
      dateKey: todayKey,
      challengeId: challenge.id,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      duration: Math.max(seconds, 1),
      completedAt: new Date().toISOString(),
      weakKeys: findWeakKeys(challenge.text, typed),
    };
    const nextResults = saveResult(completed);
    setResults(nextResults);
    setResult(completed);
  };

  const handleChange = (value: string) => {
    if (!startedAt && value.length > 0) {
      setStartedAt(Date.now());
    }

    setInput(value);

    if (value.length >= challenge.text.length && !result) {
      const seconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 1;
      setElapsed(Math.max(seconds, 1));
      completeChallenge(value, Math.max(seconds, 1));
    }
  };

  const reset = () => {
    setInput("");
    setStartedAt(null);
    setElapsed(0);
    setResult(null);
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
            Daily Challenge
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {challenge.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            One ranked passage per day for exam, code, and professional typing discipline.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="font-mono text-lg font-bold text-primary">{challenge.targetWpm}</div>
            <div className="text-[11px] text-muted-foreground">Target</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="font-mono text-lg font-bold text-yellow-400">{streak}</div>
            <div className="text-[11px] text-muted-foreground">Streak</div>
          </div>
          <div className="rounded-xl border border-border bg-card px-3 py-2">
            <div className="font-mono text-lg font-bold text-chart-2">{personalBest?.wpm ?? 0}</div>
            <div className="text-[11px] text-muted-foreground">Best</div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {challenge.category}
            </span>
            {challenge.tags.map(tag => (
              <span key={tag} className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <ChallengeText text={challenge.text} input={input} />

          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>

          {!result ? (
            <textarea
              ref={textareaRef}
              value={input}
              onChange={event => handleChange(event.target.value)}
              className="min-h-32 w-full resize-none rounded-2xl border border-border bg-background p-4 font-mono text-sm leading-7 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Start typing today's challenge..."
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-primary/25 bg-primary/10 p-5"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Challenge Complete</h2>
                  <p className="text-sm text-muted-foreground">
                    {result.accuracy >= 95 ? "Clean run. Push speed tomorrow." : "Accuracy first. Slow down and reclaim the weak keys."}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={reset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </Button>
                <Link href="/games">
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Train Games
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Live Score
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-background p-3">
                <div className="font-mono text-2xl font-bold text-primary">{result?.wpm ?? liveStats.wpm}</div>
                <div className="text-xs text-muted-foreground">WPM</div>
              </div>
              <div className="rounded-xl bg-background p-3">
                <div className="font-mono text-2xl font-bold text-chart-2">{result?.accuracy ?? liveStats.accuracy}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
              <div className="rounded-xl bg-background p-3">
                <div className="font-mono text-2xl font-bold text-destructive">{result?.errors ?? liveStats.errors}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
              <div className="rounded-xl bg-background p-3">
                <div className="font-mono text-2xl font-bold text-yellow-400">{result?.duration ?? elapsed}s</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Target className="h-4 w-4 text-chart-2" />
              Weak Keys
            </h2>
            {(result?.weakKeys.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result?.weakKeys.map(key => (
                  <span key={key} className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-1 font-mono text-sm font-bold text-destructive">
                    {key}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete the challenge to reveal your highest-priority keys.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Return Loop
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Daily streak</span>
                <span className="flex items-center gap-1 font-mono font-bold text-yellow-400">
                  <Flame className="h-4 w-4" />
                  {streak}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Challenge pool</span>
                <span className="font-mono font-bold text-foreground">{CHALLENGES.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Today</span>
                <span className="font-mono text-xs text-foreground">{todayKey}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
