import { useGetGames, getGetGamesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Zap, AlignLeft, Code2, Target, Timer, Shield, Terminal,
  ChevronRight, Star, Lock, TrendingUp, Car, Sword, Skull, Rocket, CalendarDays, Flame, Play,
  Gamepad2, Crosshair, Cpu
} from "lucide-react";
import { getGameProgress, isLevelUnlocked } from "@/lib/progress";

// ─── Colour tokens per game ───────────────────────────────────────────────
const GAME_THEME: Record<string, { text: string; bg: string; border: string; shadow: string }> = {
  "word-sprint":      { text: "text-primary",    bg: "bg-primary/10",    border: "border-primary/30",    shadow: "hover:shadow-primary/15" },
  "govt-exam-sprint": { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   shadow: "hover:shadow-blue-400/15" },
  "sentence-rush":    { text: "text-chart-2",    bg: "bg-chart-2/10",    border: "border-chart-2/30",    shadow: "hover:shadow-chart-2/15" },
  "code-type":        { text: "text-chart-3",    bg: "bg-chart-3/10",    border: "border-chart-3/30",    shadow: "hover:shadow-chart-3/15" },
  "code-vocab":       { text: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/30",shadow: "hover:shadow-emerald-400/15" },
  "letter-blaster":   { text: "text-chart-4",    bg: "bg-chart-4/10",    border: "border-chart-4/30",    shadow: "hover:shadow-chart-4/15" },
  "typing-race":      { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", shadow: "hover:shadow-yellow-400/15" },
  "turbo-race":       { text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", shadow: "hover:shadow-orange-400/15" },
  "word-fighter":     { text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30",    shadow: "hover:shadow-red-400/15" },
  "zombie-hunt":      { text: "text-lime-400",   bg: "bg-lime-400/10",   border: "border-lime-400/30",   shadow: "hover:shadow-lime-400/15" },
  "galaxy-blitz":     { text: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/30",   shadow: "hover:shadow-cyan-400/15" },
  "meteor-storm":     { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30", shadow: "hover:shadow-orange-500/15" },
  "neon-runner":      { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30", shadow: "hover:shadow-violet-400/15" },
  "snake-typer":      { text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30",  shadow: "hover:shadow-green-400/15"  },
  "word-invaders":    { text: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/30",    shadow: "hover:shadow-sky-400/15"    },
  "code-rain":        { text: "text-emerald-300",bg: "bg-emerald-300/10",border: "border-emerald-300/30",shadow: "hover:shadow-emerald-300/15" },
  "cyber-heist":      { text: "text-green-300",  bg: "bg-green-300/10",  border: "border-green-300/30",  shadow: "hover:shadow-green-300/15"  },
  "arena-blitz":      { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30", shadow: "hover:shadow-violet-400/15" },
  "bubble-pop":       { text: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/30",   shadow: "hover:shadow-pink-400/15"   },
  "fruit-blitz":      { text: "text-lime-500",   bg: "bg-lime-500/10",   border: "border-lime-500/30",   shadow: "hover:shadow-lime-500/15"   },
};

const GAME_ICONS: Record<string, React.ElementType> = {
  Zap, AlignLeft, Code: Code2, Code2, Target, Timer, Shield, Terminal,
  CarFront: Car, Sword, Skull, Rocket, Flame, Play, Gamepad2, Crosshair, Cpu,
  Wifi: Target, Crosshair2: Crosshair,
};

const DIFFICULTY: Record<string, { label: string; cls: string }> = {
  beginner:     { label: "Beginner",     cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  intermediate: { label: "Intermediate", cls: "bg-yellow-500/15  text-yellow-400  border-yellow-500/30"  },
  advanced:     { label: "Advanced",     cls: "bg-red-500/15     text-red-400     border-red-500/30"      },
};

function CheckMarkDot({ className = "" }: { className?: string }) {
  return (
    <span className={`flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground ${className}`}>
      ✓
    </span>
  );
}

// ─── Category tags shown above game cards ────────────────────────────────
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  "word-sprint":      { label: "Speed Training",        color: "text-primary" },
  "govt-exam-sprint": { label: "Govt Exam Prep",         color: "text-blue-400" },
  "sentence-rush":    { label: "Fluency Training",       color: "text-chart-2" },
  "code-type":        { label: "Coding Practice",        color: "text-chart-3" },
  "code-vocab":       { label: "Developer Vocabulary",   color: "text-emerald-400" },
  "letter-blaster":   { label: "Reaction Drill",         color: "text-chart-4" },
  "typing-race":      { label: "Speed Competition",      color: "text-yellow-400" },
  "turbo-race":       { label: "🏎 Arcade Racing",        color: "text-orange-400" },
  "word-fighter":     { label: "⚔️ Arcade Fighter",       color: "text-red-400" },
  "zombie-hunt":      { label: "🧟 Zombie Survival",      color: "text-lime-400" },
  "galaxy-blitz":     { label: "🚀 Space Shooter",        color: "text-cyan-400" },
  "meteor-storm":     { label: "☄️ Meteor Defense",        color: "text-orange-500" },
  "neon-runner":      { label: "🏃 Neon Runner",           color: "text-violet-400" },
  "snake-typer":      { label: "🐍 Snake Typer",           color: "text-green-400"  },
  "word-invaders":    { label: "👾 Word Invaders",          color: "text-sky-400"    },
  "code-rain":        { label: "💻 Code Rain",              color: "text-emerald-300"},
  "cyber-heist":      { label: "🕵️ Cyber Heist",            color: "text-green-300"  },
  "arena-blitz":      { label: "🎯 Arena Blitz",            color: "text-violet-400" },
  "bubble-pop":       { label: "🫧 Bubble Pop",             color: "text-pink-400"   },
  "fruit-blitz":      { label: "🍉 Fruit Blitz",            color: "text-lime-500"   },
};

// ─── Single game card ────────────────────────────────────────────────────
function GameCard({ game, index }: { game: any; index: number }) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const theme  = GAME_THEME[game.id]    ?? GAME_THEME["word-sprint"];
  const diff   = DIFFICULTY[game.difficulty] ?? DIFFICULTY.beginner;
  const meta   = CATEGORY_META[game.id] ?? { label: "Game", color: "text-muted-foreground" };
  const Icon   = GAME_ICONS[game.icon]  ?? Zap;
  const levels: any[] = game.levels ?? [];
  const progress = getGameProgress(game.id);
  const unlockedLevel = progress.unlockedLevel;
  const completedCount = levels.filter(level => progress.levels[level.number]?.passed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      className={`flex flex-col bg-card border ${theme.border} rounded-[22px] p-5 group
                  hover:shadow-xl ${theme.shadow} transition-all duration-300`}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${theme.bg} border ${theme.border}
                         flex items-center justify-center ${theme.text}
                         group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diff.cls}`}>
          {diff.label}
        </span>
      </div>

      {/* ── Title ── */}
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${meta.color}`}>{meta.label}</p>
      <h3 className="text-lg font-extrabold mb-2 leading-tight">{game.name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{game.description}</p>

      <div className="mb-4 rounded-xl border border-border bg-background/60 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">Local progress</span>
          <span className={theme.text}>{completedCount}/8 cleared · L{unlockedLevel} unlocked</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
          <div
            className="typing-progress-bar h-full rounded-full transition-all"
            style={{ width: `${(completedCount / Math.max(levels.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Level selector ── */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">
          <Star className="w-3 h-3" /> Choose Level
        </div>
        <div className="grid grid-cols-4 gap-2">
          {levels.map((level: any) => {
            const unlocked = isLevelUnlocked(game.id, level.number);
            const passed = Boolean(progress.levels[level.number]?.passed);
            return unlocked ? (
            <Link key={level.number} href={`/play/${game.id}/${level.number}`}>
              <motion.div
                onHoverStart={() => setHoveredLevel(level.number)}
                onHoverEnd={() => setHoveredLevel(null)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.93 }}
                className={`relative h-9 rounded-xl flex items-center justify-center
                            font-mono font-bold text-sm cursor-pointer transition-all duration-150
                            ${hoveredLevel === level.number
                              ? `${theme.bg} ${theme.text} border ${theme.border} shadow-md`
                              : "bg-muted/50 text-muted-foreground border border-transparent hover:border-border"
                            }`}
                title={`${level.name} — ${level.targetWpm} WPM target`}
                >
                {level.number}
                {passed && (
                  <CheckMarkDot className="absolute -right-1 -top-1" />
                )}
                {!passed && level.number === unlockedLevel && (
                  <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${theme.bg.replace('/10', '')} animate-ping opacity-75`} />
                )}
              </motion.div>
            </Link>
            ) : (
              <div
                key={level.number}
                className="relative flex h-9 cursor-not-allowed items-center justify-center rounded-xl border border-border/60 bg-muted/25 font-mono text-sm font-bold text-muted-foreground/40"
                title={`Clear level ${level.number - 1} to unlock`}
              >
                <Lock className="h-3.5 w-3.5" />
              </div>
            );
          })}
        </div>

        {/* Level tooltip */}
        <AnimatePresence>
          {hoveredLevel !== null && (() => {
            const lvl = levels.find((l: any) => l.number === hoveredLevel);
            return lvl ? (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className={`mt-2 px-3 py-2 ${theme.bg} border ${theme.border} rounded-lg`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${theme.text}`}>{lvl.name}</span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {lvl.targetWpm} WPM
                  </span>
                </div>
              </motion.div>
            ) : null;
          })()}
        </AnimatePresence>
      </div>

      {/* ── Quick play CTA ── */}
      <Link href={`/play/${game.id}/1`} className="mt-4 block">
        <motion.div
          whileHover={{ x: 3 }}
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl
                      ${theme.bg} border ${theme.border} cursor-pointer group/cta`}
        >
          <span className={`text-sm font-bold ${theme.text}`}>Quick Play</span>
          <ChevronRight className={`w-4 h-4 ${theme.text} group-hover/cta:translate-x-1 transition-transform`} />
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function Games() {
  const { data: games, isLoading } = useGetGames({
    query: { queryKey: getGetGamesQueryKey() }
  });

  const gameList = (games ?? []).filter((g: any) => g.category === "game");

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card/60 p-6 md:p-8">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-40 bg-primary/8 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-60 h-32 bg-chart-2/6 rounded-full blur-[50px]" />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 neon-grid opacity-40 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/22 text-primary text-xs font-bold font-mono">
              <Gamepad2 className="w-3.5 h-3.5" />
              20 Games · 160 Levels
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-bold font-mono">
              <Shield className="w-3.5 h-3.5" />
              Govt Exam Ready
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chart-3/10 border border-chart-3/20 text-chart-3 text-xs font-bold font-mono">
              <Terminal className="w-3.5 h-3.5" />
              Code Vocab
            </div>
          </div>
          <h1 className="display-md">Game Modes</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">
            13 canvas arcade games + 7 skill trainers. Master government exam vocabulary, coding terminology, and raw typing speed — all in one platform.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: "Arcade Canvas Games", value: "13", color: "text-primary" },
              { label: "Skill Trainers", value: "7", color: "text-chart-3" },
              { label: "Levels per Game", value: "8", color: "text-yellow-400" },
              { label: "Vocab Words", value: "500+", color: "text-blue-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-extrabold font-mono ${color}`}>{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <Link href="/challenge">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 shadow-lg shadow-primary/10 md:flex-row md:items-center md:justify-between neon-border-animated"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Daily return challenge</p>
              <h2 className="mt-1 text-xl font-extrabold">One fresh exam/code typing test every day</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Honest WPM, weak-key feedback, local best score, and streak tracking.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-bold text-primary">
            Play Today <ChevronRight className="h-4 w-4" />
          </div>
        </motion.div>
      </Link>

      {/* Category legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2"
      >
        {Object.entries(CATEGORY_META).map(([id, meta]) => (
          <span key={id} className={`text-xs font-semibold px-3 py-1 rounded-full bg-muted border border-border ${meta.color}`}>
            {meta.label}
          </span>
        ))}
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-80 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {gameList.map((game: any, i: number) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      )}

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4"
      >
        <Lock className="w-3.5 h-3.5" />
        Progress is saved locally. Sign in to sync across devices and appear on the leaderboard. Complete all 8 levels to master each game.
      </motion.p>
    </div>
  );
}
