import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, animate, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Gamepad2, Zap, Trophy, ArrowRight, Keyboard, Target, BarChart2,
  Shield, Code2, Play, Clock, BookOpen, Star, Cpu, ChevronDown,
  Users, TrendingUp, Award, Flame, Check, Crosshair, Terminal
} from "lucide-react";

const HERO_WORDS = ["faster.", "sharper.", "smarter.", "accurate.", "unstoppable.", "dangerous."];
const QUICK_WORDS = ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "type", "fast"];

const FLOATING_KEYS = [
  { key: "A", x: "5%",  y: "20%", delay: 0 },
  { key: "S", x: "12%", y: "60%", delay: 0.6 },
  { key: "D", x: "3%",  y: "80%", delay: 1.2 },
  { key: "F", x: "18%", y: "35%", delay: 1.8 },
  { key: "J", x: "79%", y: "25%", delay: 0.3 },
  { key: "K", x: "88%", y: "55%", delay: 0.9 },
  { key: "L", x: "74%", y: "75%", delay: 1.5 },
  { key: ";", x: "93%", y: "40%", delay: 2.1 },
  { key: "↵", x: "85%", y: "85%", delay: 0.7 },
  { key: "⌘", x: "9%",  y: "92%", delay: 1.3 },
  { key: "⇧", x: "22%", y: "88%", delay: 0.4 },
  { key: "⌫", x: "91%", y: "12%", delay: 1.6 },
];

const WPM_TIERS = [
  { range: "10–25",  label: "Beginner",    desc: "Learning the basics",         color: "from-slate-500/20 to-slate-500/5",  badge: "bg-slate-500/20 text-slate-400 border-slate-500/30",  bar: "bg-slate-500", pct: 18 },
  { range: "25–45",  label: "Average",     desc: "Typing conversations",         color: "from-blue-500/20 to-blue-500/5",    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",    bar: "bg-blue-500",  pct: 32 },
  { range: "45–65",  label: "Proficient",  desc: "Exam ready",                   color: "from-primary/20 to-primary/5",      badge: "bg-primary/20 text-primary border-primary/30",       bar: "bg-primary",   pct: 52 },
  { range: "65–90",  label: "Fast",        desc: "Professional typist",          color: "from-chart-2/20 to-chart-2/5",      badge: "bg-chart-2/20 text-chart-2 border-chart-2/30",       bar: "bg-chart-2",   pct: 70 },
  { range: "90–120", label: "Expert",      desc: "Top 5% worldwide",             color: "from-yellow-500/20 to-yellow-500/5",badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",bar: "bg-yellow-500",pct: 85 },
  { range: "120+",   label: "Elite",       desc: "Keyboard god",                 color: "from-red-500/20 to-red-500/5",      badge: "bg-red-500/20 text-red-400 border-red-500/30",       bar: "bg-red-500",   pct: 100 },
];

const EXAM_BOARDS = [
  { icon: "🏛️", name: "SSC CGL",      speed: "35",  topic: "General / Administrative", color: "border-blue-500/30 hover:border-blue-400/60",     tag: "bg-blue-500/15 text-blue-400" },
  { icon: "🏦", name: "IBPS Banking",  speed: "40",  topic: "Financial & Banking Terms", color: "border-emerald-500/30 hover:border-emerald-400/60", tag: "bg-emerald-500/15 text-emerald-400" },
  { icon: "🚂", name: "RRB NTPC",     speed: "30",  topic: "Railway Technical Terms",   color: "border-orange-500/30 hover:border-orange-400/60",  tag: "bg-orange-500/15 text-orange-400" },
  { icon: "📜", name: "UPSC Mains",   speed: "40",  topic: "Civil Services & Polity",   color: "border-purple-500/30 hover:border-purple-400/60",  tag: "bg-purple-500/15 text-purple-400" },
  { icon: "⚖️", name: "High Court",    speed: "40",  topic: "Legal & Judiciary Terms",  color: "border-primary/30 hover:border-primary/60",        tag: "bg-primary/15 text-primary" },
  { icon: "👮", name: "SSC CPO",      speed: "35",  topic: "Police & Defence Terms",    color: "border-red-500/30 hover:border-red-400/60",        tag: "bg-red-500/15 text-red-400" },
];

const GAME_HIGHLIGHTS = [
  {
    id: "turbo-race", name: "Turbo Race", icon: "🏎️",
    gradient: "linear-gradient(140deg, rgba(251,146,60,0.38) 0%, rgba(234,88,12,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(251,146,60,0.35)", glow: "0 0 40px rgba(251,146,60,0.18), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#fb923c", label: "🏎 Arcade Racing",
    desc: "Pseudo-3D neon highway. Type to accelerate — ghost car tracks your target WPM in real time.",
  },
  {
    id: "zombie-hunt", name: "Zombie Hunt", icon: "🧟",
    gradient: "linear-gradient(140deg, rgba(163,230,53,0.36) 0%, rgba(101,163,13,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(163,230,53,0.33)", glow: "0 0 40px rgba(163,230,53,0.16), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#a3e635", label: "🧟 Zombie Survival",
    desc: "Zombie waves approach. Type the word on each enemy to blast them before they reach you.",
  },
  {
    id: "cyber-heist", name: "Cyber Heist", icon: "🕵️",
    gradient: "linear-gradient(140deg, rgba(52,211,153,0.36) 0%, rgba(16,185,129,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(52,211,153,0.33)", glow: "0 0 40px rgba(52,211,153,0.16), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#34d399", label: "🕵️ Cyber Heist",
    desc: "Breach a secured node by typing access keys before the firewall timer expires. Speed is the key.",
  },
  {
    id: "bubble-pop", name: "Bubble Pop", icon: "🫧",
    gradient: "linear-gradient(140deg, rgba(244,114,182,0.36) 0%, rgba(219,39,119,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(244,114,182,0.33)", glow: "0 0 40px rgba(244,114,182,0.16), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#f472b6", label: "🫧 Bubble Pop",
    desc: "Word-bubbles drift upward. Pop them all before they escape — calm, satisfying, and fast.",
  },
  {
    id: "galaxy-blitz", name: "Galaxy Blitz", icon: "🚀",
    gradient: "linear-gradient(140deg, rgba(167,139,250,0.36) 0%, rgba(124,58,237,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(167,139,250,0.33)", glow: "0 0 40px rgba(167,139,250,0.16), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#a78bfa", label: "🚀 Space Shooter",
    desc: "Alien invaders each carry a practice word. Type it to fire lasers and destroy them.",
  },
  {
    id: "arena-blitz", name: "Arena Blitz", icon: "🎯",
    gradient: "linear-gradient(140deg, rgba(139,92,246,0.36) 0%, rgba(99,102,241,0.18) 55%, rgba(0,0,0,0) 100%)",
    border: "rgba(139,92,246,0.33)", glow: "0 0 40px rgba(139,92,246,0.16), 0 8px 32px rgba(0,0,0,0.6)",
    tag: "#8b5cf6", label: "🎯 Arena Combat",
    desc: "Top-down turret. Multiple enemies circle from all directions — type any word to destroy them.",
  },
];

const FEATURES = [
  { icon: Zap,      color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/20",     title: "Strict WPM Engine",     desc: "Only perfectly typed words count. Wrong words = zero WPM. Industry-standard honesty." },
  { icon: Gamepad2, color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/20",  title: "20 Unique Games",       desc: "Racing, Fighters, Zombies, Space Shooters, Bubble Pop, Fruit Blitz, Snake, Matrix Rain." },
  { icon: BarChart2,color: "text-chart-2",     bg: "bg-chart-2/10",     border: "border-chart-2/20",     title: "Deep Analytics",        desc: "Letter heatmap, WPM trend chart, session history, achievement badges — know your weak keys." },
  { icon: Trophy,   color: "text-yellow-400",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20",  title: "Global Rankings",       desc: "Leaderboard per game. Daily challenge streaks. 12 achievement badges. Compete worldwide." },
  { icon: Shield,   color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    title: "Govt Exam Ready",       desc: "500+ authentic vocabulary words from SSC, UPSC, Banking, Railways, Police, High Court." },
  { icon: Code2,    color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", title: "Coding Vocabulary",     desc: "TypeScript, Python, Go, SQL, Git, DevOps — real code snippets with brackets and symbols." },
  { icon: Cpu,      color: "text-chart-3",     bg: "bg-chart-3/10",     border: "border-chart-3/20",     title: "Real-time Sound",       desc: "Mechanical keyboard, typewriter, and soft-touch audio themes. Every keystroke has weight." },
  { icon: TrendingUp,color:"text-violet-400", bg: "bg-violet-400/10",  border: "border-violet-400/20",  title: "Progression System",    desc: "5 levels per game. Pass WPM + 90% accuracy to unlock the next tier. No shortcuts." },
];

const HOW_IT_WORKS = [
  { icon: Play,      step: "01", title: "Pick a Game",      desc: "20 unique typing games — Zombie Hunt, Cyber Heist, Turbo Race, Galaxy Blitz, and 16 more. Each builds a different typing skill.", color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/30" },
  { icon: Zap,       step: "02", title: "Level Up",         desc: "5 progressively harder levels per game. You need both target WPM AND 90%+ accuracy to advance. Wrong words contribute zero.", color: "text-chart-2",   bg: "bg-chart-2/10",   border: "border-chart-2/30" },
  { icon: BarChart2, step: "03", title: "See Your DNA",     desc: "Your dashboard shows WPM trends over time, per-letter heatmap, 12 achievement badges, streak counter, and full session history.",  color: "text-yellow-400",bg: "bg-yellow-400/10",border: "border-yellow-400/30" },
];

function FloatingKey({ keyChar, x, y, delay }: { keyChar: string; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.20, 0.08, 0.20], scale: [0.85, 1, 0.96, 1], y: [0, -18, 0, -10, 0] }}
      transition={{ delay, duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          background: "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,245,255,0.02))",
          border: "1px solid rgba(0,245,255,0.18)",
          borderBottom: "2px solid rgba(0,0,0,0.4)",
          color: "rgba(0,245,255,0.4)",
          boxShadow: "0 0 8px rgba(0,245,255,0.06), 0 4px 12px rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
        }}
      >
        {keyChar}
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, target, { duration: 2.5, delay: 0.4, ease: "easeOut", onUpdate(v) { setValue(Math.round(v)); } });
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
    const delay = isDeleting ? 50 : 110;
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < word.length) setDisplayed(word.slice(0, displayed.length + 1));
        else setTimeout(() => setIsDeleting(true), 2200);
      } else {
        if (displayed.length > 0) setDisplayed(displayed.slice(0, -1));
        else { setIsDeleting(false); setWordIdx(i => (i + 1) % HERO_WORDS.length); }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, wordIdx]);
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-chart-2 to-emerald-400">
      {displayed}
      <span className="inline-block w-0.5 h-[0.9em] bg-primary ml-1 animate-pulse align-middle" />
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
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setInput(""); setWordIdx(0); setStartTime(null); setWpm(null); setCorrectWords(0); setErrors(0);
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
      else setErrors(e => e + 1);
      const nextIdx = wordIdx + 1;
      if (nextIdx >= QUICK_WORDS.length) {
        const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 / 60;
        const finalCorrectCount = isCorrect ? correctWords + 1 : correctWords;
        const avgCharLen = QUICK_WORDS.reduce((s, w) => s + w.length + 1, 0) / QUICK_WORDS.length;
        const correctChars = finalCorrectCount * avgCharLen;
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
  const accuracy = correctWords > 0 ? Math.round((correctWords / (correctWords + errors)) * 100) : 0;
  const grade = speed >= 80 ? { label: "Elite Typist 🔥", color: "text-yellow-400" } :
                speed >= 60 ? { label: "Advanced Typist ⚡", color: "text-primary" } :
                speed >= 40 ? { label: "Proficient Typist 💪", color: "text-chart-2" } :
                              { label: "Beginner — Keep Going! 🎯", color: "text-chart-3" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.6 }}
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <div className={`rounded-2xl border bg-card/90 backdrop-blur-sm p-5 transition-all duration-300 ${focused ? "border-primary/60 shadow-xl shadow-primary/15" : "border-card-border"}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground font-mono">Live Demo — Type right now</span>
          </div>
          <div className="flex items-center gap-3">
            {startTime && !isFinished && (
              <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {wordIdx}/{QUICK_WORDS.length}
              </span>
            )}
            {isFinished && (
              <button onClick={reset} className="text-xs text-primary hover:underline font-mono">↺ Reset</button>
            )}
          </div>
        </div>

        {!isFinished ? (
          <>
            <div className="text-base sm:text-lg leading-relaxed mb-3 select-none flex flex-wrap gap-x-2.5 gap-y-1 p-3 rounded-xl" style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(13,13,15,0.6)" }}>
              {QUICK_WORDS.map((word, i) => {
                let style: React.CSSProperties = { color: "rgba(150,155,170,0.4)", transition: "all 150ms" };
                if (i < wordIdx) style = { color: "#39FF14", textShadow: "0 0 6px rgba(57,255,20,0.4)", textDecoration: "line-through", textDecorationColor: "rgba(57,255,20,0.3)", transition: "all 150ms" };
                if (i === wordIdx) style = { color: "#fff", fontWeight: "bold", textDecoration: "underline", textDecorationColor: "rgba(0,245,255,0.6)", textUnderlineOffset: "4px", transition: "all 150ms" };
                return <span key={i} style={style}>{word}</span>;
              })}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={wordIdx === 0 ? "Click here and start typing…" : `Type: "${QUICK_WORDS[wordIdx]}"`}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/30"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(20,20,24,0.8)",
                border: focused ? "1px solid rgba(0,245,255,0.5)" : "1px solid rgba(42,42,53,0.9)",
                boxShadow: focused ? "0 0 0 2px rgba(0,245,255,0.08), 0 0 12px rgba(0,245,255,0.06)" : "none",
              }}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            />
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-3">
            <div className="flex items-end justify-center gap-4">
              <div>
                <div className="text-5xl font-extrabold font-mono text-primary">{wpm}</div>
                <div className="text-xs text-muted-foreground mt-0.5">WPM</div>
              </div>
              <div className="pb-1 text-muted-foreground/30 text-2xl">·</div>
              <div>
                <div className="text-3xl font-bold font-mono text-chart-3">{accuracy}%</div>
                <div className="text-xs text-muted-foreground mt-0.5">Accuracy</div>
              </div>
            </div>
            <div className={`text-sm font-bold ${grade.color}`}>{grade.label}</div>
            <div className="flex gap-3 justify-center pt-1">
              <Button size="sm" onClick={reset} variant="outline" className="font-mono text-xs gap-1.5 h-8">
                ↺ Try Again
              </Button>
              <Link href="/games">
                <Button size="sm" className="font-mono text-xs gap-1.5 h-8 shadow-sm shadow-primary/20">
                  <Gamepad2 className="w-3.5 h-3.5" /> Play Full Game
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
  { value: 20,  suffix: "",      unit: "Games",    label: "Unique Arcade Modes",     icon: Gamepad2, color: "text-primary"     },
  { value: 100, suffix: "",      unit: "Levels",   label: "Progressive Challenges",  icon: TrendingUp, color: "text-chart-2"   },
  { value: 500, suffix: "+",     unit: "Words",    label: "Govt Exam Vocabulary",    icon: Shield,   color: "text-blue-400"   },
  { value: 12,  suffix: "",      unit: "Lessons",  label: "Touch-Type Lessons",      icon: BookOpen, color: "text-yellow-400" },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 md:px-10 py-24 overflow-hidden">

        {/* Background glows — layered depth */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[750px] h-[750px] bg-primary/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[550px] h-[550px] bg-chart-2/9 rounded-full blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-emerald-500/5 rounded-full blur-[190px]" />
          <div className="absolute top-3/4 left-1/5 w-[400px] h-[400px] bg-violet-500/7 rounded-full blur-[140px]" />
          <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-primary/6 rounded-full blur-[120px]" />
        </div>

        {/* Grid overlay — subtle perspective grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.045]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Scanline sweep — CRT feel */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "120px",
              background: "linear-gradient(to bottom, transparent 0%, rgba(0,245,255,0.022) 50%, transparent 100%)",
              animation: "scanline 8s linear infinite",
              willChange: "transform",
            }}
          />
        </div>

        {/* Vignette overlay to darken edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(13,13,15,0.5) 100%)" }}
        />

        {/* Floating keyboard keys */}
        {FLOATING_KEYS.map(({ key, x, y, delay }) => (
          <FloatingKey key={key} keyChar={key} x={x} y={y} delay={delay} />
        ))}

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl w-full text-center space-y-6 z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-mono text-xs sm:text-sm font-bold"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>20 arcade games · Govt Exam ready · Real-time analytics</span>
          </motion.div>

          <h1 className="display-hero text-foreground">
            Type{" "}
            <TypingWord />
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The most addictive typing platform ever built. 20 arcade games, government exam vocabulary,
            real-time analytics, and a WPM engine that never lies. Become unstoppable.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link href="/games">
              <Button size="lg" className="h-14 px-10 text-base font-bold gap-2.5 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                <Gamepad2 className="w-5 h-5" />
                Start Playing Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold gap-2.5 w-full sm:w-auto border-border hover:border-primary/50 transition-colors">
                <Clock className="w-5 h-5" />
                Practice Mode
              </Button>
            </Link>
          </motion.div>

          <HeroTypingWidget />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="z-10 mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
        >
          {STATS.map((s, i) => (
            <div key={i} className="bg-card/80 backdrop-blur border border-card-border rounded-2xl p-4 text-center group hover:border-primary/30 transition-colors">
              <div className={`text-2xl md:text-3xl font-black font-mono ${s.color} mb-0.5`}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
                <span className="text-base font-bold text-muted-foreground ml-1">{s.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground/30"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── WPM TIER GUIDE ──────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="display-md mb-2">Where do you stand?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Average typing speed is 40 WPM. Most government exams require 30–40. TypeBlitz trains you to surpass them all.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WPM_TIERS.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-2xl bg-gradient-to-br ${tier.color} border border-white/5 backdrop-blur-sm group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border font-mono ${tier.badge}`}>
                  {tier.range} WPM
                </span>
                <span className="text-xs text-muted-foreground font-mono">{tier.pct}%</span>
              </div>
              <div className="font-bold text-lg mb-1">{tier.label}</div>
              <div className="text-xs text-muted-foreground mb-3">{tier.desc}</div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${tier.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${tier.bar}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="display-md mb-3">How TypeBlitz works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            A simple feedback loop that actually makes you faster — no tricks, just deliberate daily practice.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border ${step.border} group`}
            >
              <div className={`text-6xl font-black font-mono opacity-[0.07] absolute top-3 right-4 ${step.color}`}>{step.step}</div>
              <div className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center ${step.color} mb-5`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 z-10 items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/25" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ARCADE GAMES ────────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-8 pb-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3 font-mono">
              <Gamepad2 className="w-3.5 h-3.5" /> 13 Canvas Games + 7 Skill Trainers
            </div>
            <h2 className="display-md mb-2">Arcade-grade typing games</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Every game uses real-time canvas rendering at 60fps — not just trivia widgets.</p>
          </div>
          <Link href="/games">
            <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:border-primary/60 text-sm">
              All 20 Games <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAME_HIGHLIGHTS.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
            >
              <Link href={`/play/${game.id}/1`}>
                <motion.div
                  whileHover={{ y: -7, transition: { duration: 0.18 } }}
                  className="group cursor-pointer h-full"
                  style={{
                    background: game.gradient,
                    border: `1px solid ${game.border}`,
                    borderRadius: "28px",
                    padding: "28px",
                    boxShadow: game.glow,
                    transition: "box-shadow 0.25s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Inner radial glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: `radial-gradient(ellipse, ${game.border.replace('0.35', '0.12')} 0%, transparent 70%)` }} />

                  <div className="relative">
                    {/* Top row: emoji + label + arrow */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}>
                        {game.icon}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                        <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                      </div>
                    </div>

                    {/* Category label */}
                    <div className="text-xs font-bold mb-1 uppercase tracking-widest" style={{ color: game.tag }}>
                      {game.label}
                    </div>

                    {/* Game name */}
                    <h3 className="text-xl font-black mb-2 text-white leading-tight" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
                      {game.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/60 leading-relaxed mb-5">{game.desc}</p>

                    {/* CTA row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: game.tag }}>
                        <Play className="w-3 h-3" /> Play Now · 5 Levels
                      </div>
                      <div className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: `${game.border.replace('0.35', '0.18')}`, color: game.tag, border: `1px solid ${game.border}` }}>
                        Free
                      </div>
                    </div>
                  </div>
                </motion.div>
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
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30">
              View All 20 Games <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ── GOVT EXAM READY ─────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-8 pb-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/8 via-primary/5 to-transparent p-7 md:p-12"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold font-mono mb-5">
                <Shield className="w-3.5 h-3.5" /> Government Exam Ready
              </div>
              <h2 className="display-md mb-4 leading-tight">
                Crack SSC, UPSC, Banking<br className="hidden sm:block" /> &amp; Railway Typing Tests
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg leading-relaxed text-sm sm:text-base">
                TypeBlitz trains you with authentic vocabulary from real government exam papers.
                Not random word lists — words that <span className="text-foreground font-semibold">actually appear</span> in your exam.
                Organized by difficulty, timed to your target, with progress tracking.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["500+ Authentic Words", "5 Difficulty Levels", "Per-Exam Vocabulary", "Real Passages"].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                    <Check className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/practice">
                  <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                    <BookOpen className="w-4 h-4" /> Start Exam Practice
                  </Button>
                </Link>
                <Link href="/play/govt-exam-sprint/1">
                  <Button size="lg" variant="outline" className="gap-2 border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:text-blue-300 w-full sm:w-auto">
                    <Gamepad2 className="w-4 h-4" /> Govt Exam Game
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-80 grid grid-cols-1 gap-2.5">
              {EXAM_BOARDS.map((exam, i) => (
                <motion.div
                  key={exam.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                >
                  <Link href="/practice">
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-background/40 border ${exam.color} cursor-pointer transition-all`}>
                      <span className="text-xl flex-shrink-0">{exam.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{exam.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{exam.topic}</div>
                      </div>
                      <div className={`text-xs font-black font-mono px-2 py-0.5 rounded-md ${exam.tag}`}>
                        {exam.speed} WPM
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CODING SECTION ──────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-8 pb-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-chart-3/5 to-transparent p-7 md:p-12"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start gap-10">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold font-mono mb-5">
                <Terminal className="w-3.5 h-3.5" /> Developer Mode
              </div>
              <h2 className="display-md mb-4 leading-tight">
                Type code at the<br className="hidden sm:block" /> speed of thought
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg leading-relaxed text-sm sm:text-base">
                TypeBlitz includes real code snippets for TypeScript, Python, Go, SQL, and more.
                Master brackets, symbols, and indentation. Build the muscle memory you need to write code faster.
              </p>
              <div className="bg-background/60 border border-emerald-500/20 rounded-2xl p-4 font-mono text-xs text-emerald-300/80 mb-6 leading-relaxed">
                <span className="text-muted-foreground">// Level 4 example — type this exactly</span><br />
                <span className="text-blue-400">async function</span> <span className="text-yellow-300">fetchWithRetry</span>
                <span className="text-foreground">&lt;T&gt;(</span><br />
                &nbsp;&nbsp;<span className="text-primary">url</span><span className="text-foreground">: </span><span className="text-orange-300">string</span><span className="text-foreground">,</span><br />
                &nbsp;&nbsp;<span className="text-primary">retries</span><span className="text-foreground"> = </span><span className="text-chart-3">3</span><br />
                <span className="text-foreground">): </span><span className="text-blue-400">Promise</span><span className="text-foreground">&lt;T&gt; &#123;</span><br />
                &nbsp;&nbsp;<span className="text-blue-400">for</span><span className="text-foreground"> (</span><span className="text-blue-400">let</span> <span className="text-primary">i</span> <span className="text-foreground">= </span><span className="text-chart-3">0</span><span className="text-foreground">; </span><span className="text-primary">i</span><span className="text-foreground"> &lt; </span><span className="text-primary">retries</span><span className="text-foreground">; </span><span className="text-primary">i</span><span className="text-foreground">++) &#123;&#125;</span><br />
                <span className="text-foreground">&#125;</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/play/code-type/1">
                  <Button size="lg" className="gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 w-full sm:w-auto shadow-none">
                    <Code2 className="w-4 h-4" /> Code Type Game
                  </Button>
                </Link>
                <Link href="/play/code-vocab/1">
                  <Button size="lg" variant="outline" className="gap-2 border-emerald-500/30 hover:border-emerald-400/60 text-emerald-400 w-full sm:w-auto">
                    <Cpu className="w-4 h-4" /> Code Vocab Game
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-72 space-y-2.5">
              {[
                { lang: "TypeScript", icon: "🔷", words: "220+" },
                { lang: "Python",     icon: "🐍", words: "180+" },
                { lang: "Go",         icon: "🐹", words: "120+" },
                { lang: "SQL",        icon: "🗄️", words: "140+" },
                { lang: "DevOps",     icon: "⚙️", words: "160+" },
                { lang: "Git",        icon: "🌿", words: "80+"  },
              ].map((lang, i) => (
                <motion.div
                  key={lang.lang}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-emerald-500/15 hover:border-emerald-400/40 transition-all"
                >
                  <span className="text-lg">{lang.icon}</span>
                  <div className="flex-1 font-semibold text-sm">{lang.lang}</div>
                  <span className="text-xs font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md">{lang.words}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-8 pb-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="display-md mb-2">Everything you need to master typing</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            8 core features built for serious typists — from casual players to government exam aspirants to professional developers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-2xl bg-card border ${f.border} hover:border-opacity-60 transition-all group`}
            >
              <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="px-5 md:px-10 py-8 pb-20 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent p-8 md:p-14 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-primary text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5" /> Free to play · No credit card required
            </div>
            <h2 className="display-lg">
              Your fastest typing<br />starts <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-3">right now.</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              Join thousands of typists who are breaking their WPM records every day.
              Free to play. No limits. No excuses.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={user ? "/games" : "/login"}>
                <Button size="lg" className="h-14 px-12 text-base font-bold gap-2.5 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                  <Zap className="w-5 h-5" />
                  {user ? "Play Now" : "Create Free Account"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/challenge">
                <Button size="lg" variant="outline" className="h-14 px-12 text-base font-bold gap-2.5 border-primary/30 hover:border-primary/60">
                  <Trophy className="w-5 h-5" />
                  Daily Challenge
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/60 flex-wrap">
              {["20 arcade games", "Govt exam vocabulary", "Real-time analytics", "Global leaderboard"].map(feat => (
                <div key={feat} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-primary/60" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
