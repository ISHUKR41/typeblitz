import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Zap, Flag, Trophy } from "lucide-react";

// Pre-calculated tree positions so they're stable
const TREES = [
  { x: 4, lane: "top" }, { x: 18, lane: "top" }, { x: 33, lane: "top" }, { x: 48, lane: "top" },
  { x: 62, lane: "top" }, { x: 77, lane: "top" }, { x: 91, lane: "top" },
  { x: 8, lane: "bot" }, { x: 22, lane: "bot" }, { x: 37, lane: "bot" }, { x: 52, lane: "bot" },
  { x: 67, lane: "bot" }, { x: 82, lane: "bot" }, { x: 96, lane: "bot" },
];

function WordDisplay({ word, input }: { word: string; input: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest select-none">
      {word.split("").map((ch, i) => {
        let cls = "text-white/30";
        if (i < input.length) {
          cls = input[i] === ch ? "text-emerald-400" : "text-red-400 bg-red-500/20 rounded";
        } else if (i === input.length) {
          cls = "text-white border-b-2 border-yellow-400";
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

export function RacingGame({
  words, wordIndex, currentInput, wpm, accuracy, progress,
  targetWpm, startTime, lastWordCorrect, elapsedSeconds,
}: ArcadeProps) {
  const carPos = progress;
  const [ghostPos, setGhostPos] = useState(0);
  const [speedLines, setSpeedLines] = useState(false);
  const prevCorrect = useRef<boolean | null>(null);
  const [hitFlash, setHitFlash] = useState<"good" | "bad" | null>(null);

  // Total avg chars for ghost estimation
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;

  useEffect(() => {
    if (!startTime) return;
    const pos = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
    setGhostPos(pos);
  }, [elapsedSeconds, targetSeconds, startTime]);

  useEffect(() => {
    setSpeedLines(wpm > targetWpm);
  }, [wpm, targetWpm]);

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (lastWordCorrect === prevCorrect.current) return;
    prevCorrect.current = lastWordCorrect;
    setHitFlash(lastWordCorrect ? "good" : "bad");
    const t = setTimeout(() => setHitFlash(null), 400);
    return () => clearTimeout(t);
  }, [lastWordCorrect]);

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 4);
  const isAhead = carPos > ghostPos;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="font-mono font-bold text-xl text-white">{wpm}</span>
            <span className="text-xs text-white/50">WPM</span>
          </div>
          <div className="bg-black/60 border border-white/10 rounded-xl px-4 py-2">
            <span className="font-mono text-sm text-white/70">{accuracy}% acc</span>
          </div>
          <div className={`rounded-xl px-3 py-2 text-xs font-bold font-mono ${isAhead ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
            {isAhead ? "▲ AHEAD" : "▼ BEHIND"}
          </div>
        </div>
        <div className="font-mono text-sm text-white/50">
          {wordIndex} / {words.length} words
        </div>
      </div>

      {/* Race Track */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ height: 180 }}
        animate={hitFlash === "bad" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Sky + Ground */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, #0a0a1a 0%, #0a0a1a 40%, #111827 40%, #111827 100%)"
        }} />

        {/* Stars in sky */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white/60 rounded-full"
            style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 13 + 5) % 38}%` }}
          />
        ))}

        {/* Road surface */}
        <div className="absolute left-0 right-0 rounded-lg overflow-hidden"
          style={{ top: "40%", height: "50%", background: "linear-gradient(to bottom, #1f2937, #111827)" }}
        >
          {/* Road edges — white lines */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/30" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30" />

          {/* Animated center dashes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 flex gap-6"
              animate={{ x: [0, -72] }}
              transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              style={{ width: "200%" }}
            >
              {[...Array(30)].map((_, i) => (
                <div key={i} className="w-10 h-1 bg-yellow-400/50 rounded-full flex-shrink-0" />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Trees on top edge */}
        {TREES.filter(t => t.lane === "top").map((t, i) => (
          <div key={i} className="absolute" style={{ left: `${t.x}%`, top: "22%" }}>
            <div className="w-3 h-6 bg-emerald-800 rounded-t-full" />
            <div className="w-2 h-2 bg-emerald-900 mx-auto" />
          </div>
        ))}

        {/* Trees on bottom edge */}
        {TREES.filter(t => t.lane === "bot").map((t, i) => (
          <div key={i} className="absolute" style={{ left: `${t.x}%`, top: "88%" }}>
            <div className="w-3 h-4 bg-emerald-800 rounded-t-full" />
          </div>
        ))}

        {/* Finish line */}
        <div className="absolute top-0 bottom-0 flex items-center" style={{ right: 8 }}>
          <div className="w-3 h-[55%] grid" style={{ gridTemplateRows: "repeat(6, 1fr)", gridTemplateColumns: "1fr 1fr" }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`${(Math.floor(i / 2) + i % 2) % 2 === 0 ? "bg-white" : "bg-black"}`} />
            ))}
          </div>
          <Flag className="w-4 h-4 text-white ml-1" />
        </div>

        {/* Ghost car */}
        <motion.div
          className="absolute"
          style={{ top: "48%", left: `${Math.min(ghostPos, 90)}%` }}
          animate={{ left: `${Math.min(ghostPos, 90)}%` }}
          transition={{ duration: 0.4, ease: "linear" }}
        >
          <div className="relative -translate-y-1/2 -translate-x-1/2">
            <div className="w-14 h-6 bg-white/20 border border-white/30 rounded-lg relative">
              <div className="absolute top-0.5 left-1 right-1 h-2 bg-white/10 rounded-md" />
              <div className="absolute -left-1 top-1 w-1.5 h-1 bg-white/20 rounded-l-sm" />
              <div className="absolute -bottom-1 left-2 w-2.5 h-2.5 bg-white/30 rounded-full border border-white/20" />
              <div className="absolute -bottom-1 right-2 w-2.5 h-2.5 bg-white/30 rounded-full border border-white/20" />
            </div>
            <div className="text-center text-[8px] text-white/40 font-mono mt-1">GHOST</div>
          </div>
        </motion.div>

        {/* Player car */}
        <motion.div
          className="absolute"
          style={{ top: "65%", left: `${Math.min(carPos, 90)}%` }}
          animate={{ left: `${Math.min(carPos, 90)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="relative -translate-y-1/2 -translate-x-1/2">
            {/* Speed lines */}
            <AnimatePresence>
              {speedLines && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-full top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pr-1"
                >
                  {[...Array(4)].map((_, i) => (
                    <motion.div key={i}
                      className="h-px bg-yellow-400/60 rounded"
                      animate={{ width: [8, 20, 8] }}
                      transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.07 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Car body */}
            <div className="w-14 h-6 bg-primary rounded-lg relative shadow-lg shadow-primary/40">
              <div className="absolute top-0.5 left-2 right-2 h-2.5 bg-primary/60 rounded-md border border-primary/40" />
              <div className="absolute -left-1.5 top-1.5 w-2 h-2 bg-primary/60 rounded-l-sm" />
              {/* Wheels */}
              <div className="absolute -bottom-1.5 left-1.5 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600" />
              <div className="absolute -bottom-1.5 right-1.5 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-600" />
            </div>

            {/* Hit flash */}
            <AnimatePresence>
              {hitFlash === "good" && (
                <motion.div
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2, y: -20 }}
                  exit={{}}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-emerald-400 text-sm font-bold pointer-events-none"
                >
                  +1 ✓
                </motion.div>
              )}
              {hitFlash === "bad" && (
                <motion.div
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 1.5, y: -20 }}
                  exit={{}}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-400 text-sm font-bold pointer-events-none"
                >
                  ✗
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center text-[8px] text-primary font-mono font-bold mt-1">YOU</div>
          </div>
        </motion.div>

        {/* Progress bar overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <motion.div
            className="h-full bg-primary/60"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Typing arena */}
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 md:p-7 space-y-4">
        {!startTime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-yellow-400/70 font-mono text-sm"
          >
            ⌨ Start typing to begin the race!
          </motion.p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <WordDisplay word={currentWord} input={currentInput} />
          </motion.div>
        </AnimatePresence>

        {/* Next words */}
        <div className="flex items-center justify-center gap-4">
          {nextWords.map((w, i) => (
            <span key={i} className="font-mono text-sm text-white/20">{w}</span>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="flex justify-between text-xs text-white/30 font-mono px-1">
        <span>Target: {targetWpm} WPM</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
}
