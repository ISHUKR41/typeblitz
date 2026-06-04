import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Gamepad2, Zap, Trophy, ArrowRight, Keyboard, Target, BarChart2, ChevronDown } from "lucide-react";

const HERO_WORDS = ["faster.", "smarter.", "sharper.", "better."];

const FLOATING_KEYS = [
  { key: "A", x: "8%", y: "20%", delay: 0 },
  { key: "S", x: "15%", y: "60%", delay: 0.5 },
  { key: "D", x: "5%", y: "75%", delay: 1 },
  { key: "F", x: "20%", y: "35%", delay: 1.5 },
  { key: "J", x: "80%", y: "25%", delay: 0.3 },
  { key: "K", x: "88%", y: "55%", delay: 0.8 },
  { key: "L", x: "75%", y: "70%", delay: 1.2 },
  { key: ";", x: "92%", y: "40%", delay: 1.7 },
  { key: "↵", x: "85%", y: "80%", delay: 0.6 },
  { key: "⌘", x: "12%", y: "88%", delay: 1.1 },
];

function FloatingKey({ keyChar, x, y, delay }: { keyChar: string; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute font-mono font-bold text-xs select-none pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 0.15, 0.08, 0.15],
        scale: [0.8, 1, 0.95, 1],
        y: [0, -12, 0, -8, 0],
      }}
      transition={{
        delay,
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
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
    const controls = animate(0, target, {
      duration: 2,
      delay: 0.5,
      ease: "easeOut",
      onUpdate(v) { setValue(Math.round(v)); },
    });
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
    const delay = isDeleting ? 60 : 120;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < word.length) {
          setDisplayed(word.slice(0, displayed.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
        } else {
          setIsDeleting(false);
          setWordIdx(i => (i + 1) % HERO_WORDS.length);
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [displayed, isDeleting, wordIdx]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-chart-2">
      {displayed}
      <span className="inline-block w-0.5 h-[0.9em] bg-primary ml-1 animate-pulse align-middle" />
    </span>
  );
}

const STATS = [
  { value: 50000, suffix: "+", label: "Keystrokes Tracked" },
  { value: 11, suffix: " Games", label: "Unique Game Modes" },
  { value: 99, suffix: "%", label: "Typing Accuracy" },
  { value: 12, suffix: " Lessons", label: "Pro Lessons" },
];

const FEATURES = [
  {
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    title: "Real-time WPM",
    desc: "Millisecond-precise metrics calculated as you type. Every keystroke tracked, every mistake caught.",
  },
  {
    icon: Gamepad2,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/20",
    title: "11 Game Modes",
    desc: "Word Sprint to arcade battles. Each game trains a different muscle — from raw speed to symbol precision.",
  },
  {
    icon: BarChart2,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
    title: "Deep Analytics",
    desc: "Letter-by-letter heatmaps reveal exactly which keys slow you down. No guesswork.",
  },
  {
    icon: Trophy,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    title: "Global Leaderboard",
    desc: "Your personal best locked in on a worldwide ranking. Climb the board one WPM at a time.",
  },
  {
    icon: Target,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
    title: "12 Pro Lessons",
    desc: "Structured learning path from home row to symbols. Designed by touch-typing methodology.",
  },
  {
    icon: Keyboard,
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
    title: "Adaptive Levels",
    desc: "Difficulty scales with your performance. 5 levels per game, each demanding more precision.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-chart-2/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-chart-3/5 rounded-full blur-[160px]" />
        </div>

        {/* Floating keyboard keys */}
        {FLOATING_KEYS.map(({ key, x, y, delay }) => (
          <FloatingKey key={key} keyChar={key} x={x} y={y} delay={delay} />
        ))}

        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-5xl w-full text-center space-y-6 z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>The world's most addictive typing trainer</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
            <span className="text-foreground">Type </span>
            <TypingWord />
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every keystroke has weight. Train like an athlete, compete like a gamer.
            TypeBlitz is the platform serious typists use to reach their peak.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/games">
              <Button size="lg" className="h-14 px-10 text-lg font-bold gap-2 w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <Gamepad2 className="w-5 h-5" />
                Start Playing
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold gap-2 w-full sm:w-auto border-border hover:border-primary/50 transition-colors">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="z-10 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
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

      {/* FEATURES GRID */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            Everything a serious typist needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built from the ground up for people who care about the craft of typing.
          </p>
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
          className="mt-12 text-center"
        >
          <Link href="/practice">
            <Button variant="outline" size="lg" className="gap-2 border-primary/30 hover:border-primary/60">
              Explore Practice Modes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
