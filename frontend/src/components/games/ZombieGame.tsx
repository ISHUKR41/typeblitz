import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Heart, Skull, Zap } from "lucide-react";

const ZOMBIE_COLORS = ["#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d"];

function WordDisplay({ word, input }: { word: string; input: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-wider">
      {word.split("").map((ch, i) => {
        let cls = "text-white/30";
        if (i < input.length) {
          cls = input[i] === ch ? "text-emerald-400" : "text-red-400 bg-red-500/20 rounded";
        } else if (i === input.length) {
          cls = "text-white border-b-2 border-red-400 animate-pulse";
        }
        return (
          <span key={i} className={`transition-colors duration-75 ${cls}`}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

// Simple CSS zombie figure
function ZombieFigure({ color, killed, isTarget }: { color: string; killed: boolean; isTarget: boolean }) {
  if (killed) return null;
  return (
    <div className="flex flex-col items-center" style={{ color }}>
      {/* Head */}
      <div className="w-6 h-6 rounded-full border-2 relative"
        style={{ borderColor: color, background: color + "20" }}
      >
        <div className="absolute top-1.5 left-1 w-1 h-1 rounded-full" style={{ background: color }} />
        <div className="absolute top-1.5 right-1 w-1 h-1 rounded-full" style={{ background: color }} />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-0.5 rounded" style={{ background: color, opacity: 0.6 }} />
        {isTarget && (
          <motion.div
            className="absolute -inset-1 rounded-full border"
            style={{ borderColor: color }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </div>
      {/* Body */}
      <div className="w-5 h-5 border-2 rounded-sm mt-0.5"
        style={{ borderColor: color, background: color + "15" }}
      />
      {/* Arms (outstretched) */}
      <div className="relative w-12 h-2 -mt-4">
        <div className="absolute left-0 top-0 w-3 h-1.5 rounded border" style={{ borderColor: color, background: color + "20" }} />
        <div className="absolute right-0 top-0 w-3 h-1.5 rounded border" style={{ borderColor: color, background: color + "20" }} />
      </div>
      {/* Legs */}
      <div className="flex gap-1 mt-1">
        <div className="w-2 h-4 rounded-b-sm border-2" style={{ borderColor: color, background: color + "15" }} />
        <div className="w-2 h-4 rounded-b-sm border-2 mt-1" style={{ borderColor: color, background: color + "15" }} />
      </div>
    </div>
  );
}

export function ZombieGame({
  words, wordIndex, currentInput, wpm, accuracy,
  targetWpm, lastWordCorrect, startTime, elapsedSeconds, comboStreak, mistakeCount, submissionCount,
}: ArcadeProps) {
  const [playerHp, setPlayerHp] = useState(100);
  const [killedIndices, setKilledIndices] = useState<Set<number>>(new Set());
  const [killFlash, setKillFlash] = useState<number | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const prevSubmission = useRef(0);

  // Show 5 zombies at a time
  const visibleStart = Math.max(0, wordIndex - 1);
  const visibleEnd = Math.min(words.length, visibleStart + 6);
  const visibleWords = words.slice(visibleStart, visibleEnd);

  // Zombie approach — based on elapsed time relative to target
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;
  const timeRatio = startTime ? Math.min(elapsedSeconds / targetSeconds, 1) : 0;

  // Each zombie (current target) gets closer as time passes relative to typing progress
  const targetZombiePressure = Math.max(0, timeRatio - (wordIndex / words.length));

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    if (lastWordCorrect) {
      setKilledIndices(s => new Set([...s, wordIndex - 1]));
      setKillFlash(wordIndex - 1);
      setTimeout(() => setKillFlash(null), 400);
    } else {
      const dmg = Math.max(5, Math.round(targetZombiePressure * 20));
      setPlayerHp(h => Math.max(h - dmg, 0));
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 350);
    }
  }, [lastWordCorrect, submissionCount, targetZombiePressure, wordIndex]);

  const currentWord = words[wordIndex] ?? "";
  const progress = (wordIndex / Math.max(words.length, 1)) * 100;
  const wave = Math.ceil((wordIndex + 1) / Math.max(1, Math.ceil(words.length / 3)));

  // Pre-calculate zombie approach ratios (stable, not in render)
  const zombieApproach = useMemo(() => {
    return visibleWords.map((_, i) => {
      const idx = visibleStart + i;
      const isCurrent = idx === wordIndex;
      const isPast = idx < wordIndex;
      if (isPast) return 1;
      if (isCurrent) return Math.min(0.5 + targetZombiePressure * 0.8, 0.95);
      return 0.1 + i * 0.05;
    });
  }, [visibleWords.length, wordIndex, targetZombiePressure, visibleStart]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/60 border border-red-500/30 rounded-xl px-3 py-1.5">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-mono font-bold text-white">{playerHp}</span>
          <span className="text-xs text-white/40">HP</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <Skull className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-sm text-white">{wordIndex} killed</span>
        </div>
        <div className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-orange-400 font-bold">WAVE {wave}</span>
        </div>
        <div className="bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-yellow-300 font-bold">{comboStreak}x STREAK</span>
        </div>
        <div className="bg-red-500/15 border border-red-500/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-red-300">{mistakeCount} mistakes</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm}</span>
          <span className="text-xs text-white/40">WPM</span>
        </div>
      </div>

      {/* HP bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-red-400">HP</span>
        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, #ef4444, #f97316)` }}
            animate={{ width: `${playerHp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/40">{playerHp}/100</span>
      </div>

      {/* Zombie field */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/10 cursor-text"
        style={{ height: 160 }}
        animate={screenShake ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Background — dark graveyard */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, #0d0d0d 0%, #0d1a0d 60%, #0a1a0a 100%)"
        }} />

        {/* Moon */}
        <div className="absolute top-3 right-8 w-8 h-8 rounded-full bg-yellow-100/10 border border-yellow-100/20" />

        {/* Ground line */}
        <div className="absolute bottom-10 left-0 right-0 h-px bg-emerald-900/40" />

        {/* Graves in background */}
        {[15, 30, 50, 68, 83].map((x, i) => (
          <div key={i} className="absolute bottom-10" style={{ left: `${x}%` }}>
            <div className="w-5 h-7 bg-gray-800/60 rounded-t-lg border border-gray-700/40" />
          </div>
        ))}

        {/* Player base on left */}
        <div className="absolute left-4 bottom-2">
          <div className="w-8 h-10 bg-emerald-900/40 border border-emerald-800/40 rounded-t-lg flex items-center justify-center">
            <span className="text-lg">🔫</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <motion.div className="h-full bg-emerald-500/50" animate={{ width: `${progress}%` }} />
        </div>

        {/* Zombies */}
        {visibleWords.map((word, i) => {
          const absIdx = visibleStart + i;
          const isCurrent = absIdx === wordIndex;
          const isPast = absIdx < wordIndex;
          const killed = killedIndices.has(absIdx) || isPast;
          const approachRatio = zombieApproach[i] ?? 0;
          const xPos = 95 - approachRatio * 75; // from 95% down to 20%

          return (
            <AnimatePresence key={absIdx}>
              {!killed && (
                <motion.div
                  className="absolute bottom-8 flex flex-col items-center"
                  style={{ left: `${xPos}%` }}
                  animate={{ left: `${xPos}%` }}
                  exit={{ opacity: 0, y: -30, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Word label */}
                  <div className={`mb-1 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    isCurrent
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-black/50 text-white/30 border border-white/10"
                  }`}>
                    {isCurrent ? currentInput + (word.slice(currentInput.length) ? "_" : "") : word}
                  </div>

                  <ZombieFigure
                    color={ZOMBIE_COLORS[absIdx % ZOMBIE_COLORS.length]}
                    killed={killed}
                    isTarget={isCurrent}
                  />

                  {/* Kill flash */}
                  <AnimatePresence>
                    {killFlash === absIdx && (
                      <motion.div
                        initial={{ opacity: 1, scale: 0.5, y: 0 }}
                        animate={{ opacity: 0, scale: 1.5, y: -20 }}
                        exit={{}}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 text-emerald-400 font-black text-sm pointer-events-none"
                      >
                        💀
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </motion.div>

      {/* Typing panel */}
      <div className="bg-gray-900/90 border border-red-500/20 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400/70">
          <Skull className="w-3 h-3" />
          <span>TARGET WORD — type it fast!</span>
          <span className="ml-auto text-white/30">{words.length - wordIndex} zombies left</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.12 }}
          >
            <WordDisplay word={currentWord} input={currentInput} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between text-xs text-white/25 font-mono px-1">
        <span>Target: {targetWpm} WPM</span>
        <span>{Math.round(progress)}% waves cleared</span>
      </div>
    </div>
  );
}
