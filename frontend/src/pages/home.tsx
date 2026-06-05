import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Gamepad2, Zap, Trophy, ArrowRight, Keyboard, Target, BarChart2,
  ChevronDown, Shield, Code2, Play, CheckCircle, Star, Cpu, Crosshair,
  BookOpen, Clock, Users
} from "lucide-react";

const HERO_WORDS = ["faster.", "sharper.", "smarter.", "accurate.", "unstoppable."];

const FLOATING_KEYS = [
  { key: "A", x: "6%",  y: "18%", delay: 0    },
  { key: "S", x: "13%", y: "58%", delay: 0.5  },
  { key: "D", x: "4%",  y: "78%", delay: 1    },
  { key: "F", x: "18%", y: "32%", delay: 1.5  },
  { key: "J", x: "78%", y: "22%", delay: 0.3  },
  { key: "K", x: "87%", y: "54%", delay: 0.8  },
  { key: "L", x: "73%", y: "72%", delay: 1.2  },
  { key: ";", x: "92%", y: "38%", delay: 1.7  },
  { key: "↵", x: "84%", y: "82%", delay: 0.6  },
  { key: "⌘", x: "10%", y: "90%", delay: 1.1  },
];

const QUICK_WORDS = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "and", "types"];

function FloatingKey({ keyChar, x, y, delay }: { keyChar: string; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute font-mono font-bold text-xs select-none pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.18, 0.08, 0.18], scale: [0.8, 1, 0.95, 1], y: [0, -14, 0, -8, 0] }}
      transition={{ delay, duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-10 h-10 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center text-primary/40 shadow-lg shadow-primary/10">
        {keyChar}
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, target, { duration: 2.2, delay: 0.5, ease: "easeOut", onUpdate(v) { setValue(Math.round(v)); } });
    return controls.stop;
  }, [target]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

function TypingWord() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    const word = HERO_WORDS[wordIdx];
    const delay = isDeleting ? 55 : 115;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < word.length) setDisplayed(word.slice(0, displayed.length + 1));
        else setTimeout(() => setIsDeleting(true), 2000);
      } else {
        if (displayed.length > 0) setDisplayed(displayed.slice(0, -1));
        else { setIsDeleting(false); setWordIdx(i => (i + 1) % HERO_WORDS.length); }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, wordIdx]);
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-chart-2 to-chart-3">
      {displayed}
      <span className="inline-block w-0.5 h-[0.85em] bg-primary ml-1 animate-pulse align-middle" />
    </span>
  );
}

function HeroTypingWidget() {
  const [input, setInput] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [correctWords, setCorrectWords] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setInput(""); setWordIdx(0); setStartTime(null); setWpm(null); setCorrectWords(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    if (val.endsWith(" ")) {
      const typed = val.trim();
      const expected = QUICK_WORDS[wordIdx];
      const isCorrect = typed === expected;
      if (isCorrect) setCorrectWords(c => c + 1);
      const nextIdx = wordIdx + 1;
      if (nextIdx >= QUICK_WORDS.length) {
        const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 / 60;
        const correctChars = QUICK_WORDS.reduce((s, w) => s + w.length + 1, 0);
        setWpm(Math.round(correctChars / 5 / Math.max(elapsed, 0.001)));
        setWordIdx(nextIdx);
      } else {
        setWordIdx(nextIdx);
      }
      setInput("");
    } else {
      setInput(val);
    }
  };

  const isFinished = wordIdx >= QUICK_WORDS.length;
  const speed = wpm ?? 0;
  const grade = speed >= 80 ? { label: "Elite", color: "text-yellow-400" } :
                speed >= 60 ? { label: "Advanced", color: "text-primary" } :
                speed >= 40 ? { label: "Intermediate", color: "text-chart-2" } :
                              { label: "Beginner", color: "text-chart-3" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className={`rounded-2xl border bg-card/80 backdrop-blur-sm p-5 transition-all duration-300 ${focused ? "border-primary/50 shadow-lg shadow-primary/10" : "border-card-border"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground font-mono">Quick Test — try it now</span>
          </div>
          {startTime && !isFinished && (
            <span className="text-xs font-mono text-muted-foreground">
              {wordIdx}/{QUICK_WORDS.length} words
            </span>
          )}
          {isFinished && (
            <button onClick={reset} className="text-xs text-primary hover:underline font-mono">↺ Reset</button>
          )}
        </div>

        {!isFinished ? (
          <>
            <div className="font-mono text-base sm:text-lg leading-relaxed mb-3 select-none flex flex-wrap gap-x-2 gap-y-1">
              {QUICK_WORDS.map((word, i) => {
                let cls = "text-muted-foreground/40";
                if (i < wordIdx) cls = "text-emerald-400";
                if (i === wordIdx) cls = "text-foreground underline decoration-primary/50 underline-offset-4";
                return <span key={i} className={`${cls} transition-colors`}>{word}</span>;
              })}
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                value={input}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={wordIdx === 0 ? "Start typing here…" : QUICK_WORDS[wordIdx]}
                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 font-mono text-sm outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/30"
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              {!focused && wordIdx === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground/50 font-mono">click to start typing</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className="text-5xl font-extrabold font-mono text-primary mb-1">{wpm} <span className="text-2xl font-bold text-muted-foreground">WPM</span></div>
            <div className={`text-sm font-semibold mb-1 ${grade.color}`}>{grade.label} Typist</div>
            <div className="text-xs text-muted-foreground mb-4">{correctWords}/{QUICK_WORDS.length} words correct</div>
            <div className="flex gap-3 justify-center">
              <Button size="sm" onClick={reset} variant="outline" className="font-mono text-xs gap-1.5">
                ↺ Try Again
              </Button>
              <Link href="/games">
                <Button size="sm" className="font-mono text-xs gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" /> Full Game
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

const STATS = [
  { value: 1000000, suffix: "+", label: "Keystrokes Tracked" },
  { value: 16,      suffix: " Games", label: "Unique Game Modes" },
  { value: 99,      suffix: "%", label: "Peak Accuracy Achieved" },
  { value: 12,      suffix: " Lessons", label: "Structured Lessons" },
];

const FEATURES = [
  { icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20",
    title: "Precise WPM Engine", desc: "Only perfect words count. Millisecond-accurate measurement. No inflation from wrong attempts." },
  { icon: Gamepad2, color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/20",
    title: "16 Unique Games", desc: "Racing, Fighters, Zombies, Space Shooters, Matrix Rain, Snake — all built around typing mastery." },
  { icon: BarChart2, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/20",
    title: "Deep Analytics", desc: "Letter-by-letter heatmaps reveal exactly which keys slow you down. Track improvement daily." },
  { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20",
    title: "Global Rankings", desc: "Your personal best locked into a worldwide leaderboard. Climb one WPM at a time." },
  { icon: Shield, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20",
    title: "Govt Exam Ready", desc: "SSC, UPSC, Banking, Railways, Police exam vocabulary across all 5 levels. Built for aspirants." },
  { icon: Code2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20",
    title: "Coding Vocabulary", desc: "JavaScript, Python, React, SQL, Git keywords. Master every symbol and shorthand." },
];

const HOW_IT_WORKS = [
  { icon: Play, step: "01", title: "Pick a Game", desc: "Choose from 16 unique typing games — each one trains a different skill, from raw speed to symbol precision.", color: "text-primary" },
  { icon: Zap, step: "02", title: "Level Up", desc: "Complete 5 progressively harder levels per game. Passing requires both speed AND 90%+ accuracy.", color: "text-chart-2" },
  { icon: BarChart2, step: "03", title: "Track Progress", desc: "Your dashboard shows WPM trends, weak keys, session history, and global rank. Everything in one place.", color: "text-chart-3" },
];

const GAME_HIGHLIGHTS = [
  { id: "turbo-race",    name: "Turbo Race",     icon: "🏎️", color: "text-orange-400", desc: "Outrun a ghost car in neon streets" },
  { id: "zombie-hunt",   name: "Zombie Hunt",    icon: "🧟", color: "text-lime-400",   desc: "Survive a zombie horde with typing" },
  { id: "galaxy-blitz",  name: "Galaxy Blitz",   icon: "🚀", color: "text-cyan-400",   desc: "Shoot alien fleets in deep space" },
  { id: "snake-typer",   name: "Snake Typer",    icon: "🐍", color: "text-green-400",  desc: "Feed your neon snake with words" },
  { id: "word-invaders", name: "Word Invaders",  icon: "👾", color: "text-sky-400",    desc: "Space Invaders but you type to shoot" },
  { id: "code-rain",     name: "Code Rain",      icon: "💻", color: "text-emerald-300",desc: "Decrypt the Matrix cascade in real-time" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-chart-2/8 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-chart-3/5 rounded-full blur-[160px]" />
        </div>

        {FLOATING_KEYS.map(({ key, x, y, delay }) => (
          <FloatingKey key={key} keyChar={key} x={x} y={y} delay={delay} />
        ))}

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl w-full text-center space-y-5 z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>The world's most addictive typing trainer — 16 games, zero compromise</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
            <span className="text-foreground">Type </span>
            <TypingWord />
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every keystroke has weight. Train through 16 arcade games. Master govt exam &amp; coding vocabulary.
            TypeBlitz is where serious typists reach their peak.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/games">
              <Button size="lg" className="h-14 px-10 text-lg font-bold gap-2 w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                <Gamepad2 className="w-5 h-5" />
                Start Playing Free
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold gap-2 w-full sm:w-auto border-border hover:border-primary/50 transition-colors">
                <Clock className="w-5 h-5" /> Practice Mode
              </Button>
            </Link>
          </motion.div>

          <HeroTypingWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="z-10 mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
        >
          {STATS.map((s, i) => (
            <div key={i} className="bg-card/80 backdrop-blur border border-card-border rounded-2xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-primary">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/40"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">How it works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A simple loop that actually makes you faster — no gimmicks, just deliberate practice.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 rounded-2xl bg-card border border-card-border group"
            >
              <div className={`text-5xl font-black font-mono opacity-10 absolute top-4 right-5 ${step.color}`}>{step.step}</div>
              <div className={`w-12 h-12 rounded-xl bg-card border border-card-border flex items-center justify-center ${step.color} mb-4`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── GAME HIGHLIGHTS ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-8 pb-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Arcade Games</h2>
            <p className="text-muted-foreground">Each game builds a different skill — speed, accuracy, rhythm, or reaction time.</p>
          </div>
          <Link href="/games">
            <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex border-primary/30 hover:border-primary/60">
              All 16 games <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_HIGHLIGHTS.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link href={`/play/${game.id}/1`}>
                <div className="p-5 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-all group cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div>
                      <div className={`font-bold text-sm ${game.color}`}>{game.name}</div>
                      <div className="text-xs text-muted-foreground">5 Levels</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 ml-auto transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{game.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 sm:hidden text-center"
        >
          <Link href="/games">
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30">All 16 games <ArrowRight className="w-3.5 h-3.5" /></Button>
          </Link>
        </motion.div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Everything a serious typist needs</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Built for students preparing government exams, developers learning touch-typing, and anyone who wants to type at their peak.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-6 rounded-2xl bg-card border ${f.border} group cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/practice">
            <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:border-primary/60 w-full sm:w-auto">
              <BookOpen className="w-4 h-4" /> Practice Modes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/challenge">
            <Button variant="outline" size="lg" className="gap-2 border-yellow-400/30 hover:border-yellow-400/60 w-full sm:w-auto text-yellow-400">
              <Trophy className="w-4 h-4" /> Daily Challenge
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
