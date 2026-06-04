import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Zap, Shield, Star } from "lucide-react";

// Pre-calculated star field so it's stable
const STARS = Array.from({ length: 40 }, (_, i) => ({
  x: ((i * 73 + 17) % 100),
  y: ((i * 37 + 11) % 100),
  size: (i % 3) + 1,
  opacity: 0.1 + (i % 5) * 0.1,
}));

// Pre-calculated ship grid positions
const SHIP_COLS = 5;
const SHIP_ROWS = 2;

function WordDisplay({ word, input }: { word: string; input: string }) {
  return (
    <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest">
      {word.split("").map((ch, i) => {
        let cls = "text-white/30";
        if (i < input.length) {
          cls = input[i] === ch ? "text-cyan-300 drop-shadow-[0_0_6px_#67e8f9]" : "text-red-400 bg-red-500/20 rounded";
        } else if (i === input.length) {
          cls = "text-white border-b-2 border-cyan-400";
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

function AlienShip({ word, isTarget, destroyed, showLaser, color }: {
  word: string;
  isTarget: boolean;
  destroyed: boolean;
  showLaser: boolean;
  color: string;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {!destroyed ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* UFO body */}
            <div className="relative">
              {/* Dome */}
              <div className="w-6 h-3 rounded-t-full border-t border-x"
                style={{ borderColor: color, background: color + "20" }}
              >
                <div className="w-2 h-1.5 rounded-t-full mx-auto mt-0.5 border-t"
                  style={{ borderColor: color + "80", background: color + "30" }}
                />
              </div>
              {/* Saucer */}
              <div className="w-10 h-3 rounded-full -mt-0.5 flex items-center justify-between px-1"
                style={{ background: color + "30", borderTop: `1px solid ${color}60`, borderBottom: `1px solid ${color}60` }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: color }} />
                <div className="w-1 h-1 rounded-full" style={{ background: color }} />
                <div className="w-1 h-1 rounded-full" style={{ background: color }} />
              </div>
              {/* Glow */}
              {isTarget && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              )}
              {/* Laser beam when destroyed */}
              {showLaser && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 1 }}
                  animate={{ scaleY: 1, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-20 origin-top"
                  style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
                />
              )}
            </div>

            {/* Word tag */}
            <div className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold truncate max-w-[80px] text-center ${
              isTarget
                ? "border text-cyan-300"
                : "text-white/30 border border-white/10"
            }`}
              style={isTarget ? { borderColor: color, background: color + "20" } : {}}
            >
              {word}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.4 }}
            className="text-base"
          >
            💥
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GalaxyGame({
  words, wordIndex, currentInput, wpm, accuracy,
  targetWpm, lastWordCorrect, elapsedSeconds, startTime,
}: ArcadeProps) {
  const [shieldHp, setShieldHp] = useState(100);
  const [score, setScore] = useState(0);
  const [destroyedSet, setDestroyedSet] = useState<Set<number>>(new Set());
  const [laserTarget, setLaserTarget] = useState<number | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [playerLaser, setPlayerLaser] = useState(false);
  const prevCorrect = useRef<boolean | null>(null);

  const progress = (wordIndex / Math.max(words.length, 1)) * 100;

  // Ship grid — show SHIP_COLS * SHIP_ROWS ships at a time
  const gridSize = SHIP_COLS * SHIP_ROWS;
  const gridStart = Math.floor(wordIndex / gridSize) * gridSize;
  const gridWords = words.slice(gridStart, gridStart + gridSize);

  // Ship descent — ships move down slightly as time passes
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;
  const timeRatio = startTime ? Math.min(elapsedSeconds / targetSeconds, 1) : 0;
  const descentPct = timeRatio * 30; // ships descend 0–30% of arena height

  // Pre-calculated ship grid layout
  const shipLayout = useMemo(() =>
    gridWords.map((word, i) => ({
      word,
      absIdx: gridStart + i,
      col: i % SHIP_COLS,
      row: Math.floor(i / SHIP_COLS),
      color: ["#67e8f9", "#a78bfa", "#86efac", "#fb923c", "#f472b6"][i % 5],
    })),
    [gridStart, gridWords.join(",")]
  );

  const currentAbsIdx = wordIndex;
  const shipInGrid = currentAbsIdx - gridStart;

  const ALIEN_COLORS = ["#67e8f9", "#a78bfa", "#86efac", "#fb923c", "#f472b6"];

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (lastWordCorrect === prevCorrect.current) return;
    prevCorrect.current = lastWordCorrect;

    if (lastWordCorrect) {
      setScore(s => s + 10);
      setDestroyedSet(d => new Set([...d, wordIndex - 1]));
      setLaserTarget(wordIndex - 1);
      setPlayerLaser(true);
      setTimeout(() => {
        setLaserTarget(null);
        setPlayerLaser(false);
      }, 400);
    } else {
      const dmg = 8;
      setShieldHp(h => Math.max(h - dmg, 0));
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 300);
    }
  }, [lastWordCorrect, wordIndex]);

  const currentWord = words[wordIndex] ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/70 border border-cyan-500/30 rounded-xl px-3 py-1.5">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-white">{shieldHp}</span>
          <span className="text-xs text-white/40">SHIELD</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-yellow-400">{score}</span>
        </div>
        <div className="bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-white/50">{accuracy}% acc</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm}</span>
          <span className="text-xs text-white/40">WPM</span>
        </div>
      </div>

      {/* Shield bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-cyan-400">SHIELD</span>
        <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ width: `${shieldHp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/30">{shieldHp}/100</span>
      </div>

      {/* Space arena */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ height: 180 }}
        animate={screenFlash ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Starfield */}
        <div className="absolute inset-0 bg-[#050510]">
          {STARS.map((star, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`, top: `${star.y}%`,
                width: star.size, height: star.size,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* Screen flash on hit */}
        <AnimatePresence>
          {screenFlash && (
            <motion.div
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-red-500 pointer-events-none z-20"
            />
          )}
        </AnimatePresence>

        {/* Alien ships grid */}
        <div
          className="absolute left-4 right-4 grid gap-x-2 gap-y-4 transition-all duration-1000"
          style={{
            top: `${6 + descentPct}%`,
            gridTemplateColumns: `repeat(${SHIP_COLS}, 1fr)`,
          }}
        >
          {shipLayout.map(({ word, absIdx, color }) => {
            const isTarget = absIdx === currentAbsIdx;
            const isDestroyed = destroyedSet.has(absIdx) || absIdx < currentAbsIdx;
            return (
              <div key={absIdx} className="flex justify-center">
                <AlienShip
                  word={word}
                  isTarget={isTarget}
                  destroyed={isDestroyed}
                  showLaser={laserTarget === absIdx}
                  color={color}
                />
              </div>
            );
          })}
        </div>

        {/* Player laser beam */}
        <AnimatePresence>
          {playerLaser && shipInGrid >= 0 && shipInGrid < gridSize && (
            <motion.div
              initial={{ scaleY: 0, opacity: 1 }}
              animate={{ scaleY: 1, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.25 }}
              className="absolute bottom-6 w-0.5 origin-bottom"
              style={{
                left: `calc(${(((shipInGrid % SHIP_COLS) + 0.5) / SHIP_COLS) * 100}% - 1px)`,
                height: "80%",
                background: "linear-gradient(to top, #67e8f9, transparent)",
                boxShadow: "0 0 4px #67e8f9",
              }}
            />
          )}
        </AnimatePresence>

        {/* Player ship at bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <motion.div
            animate={playerLaser ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 0.2 }}
          >
            {/* Spaceship */}
            <div className="relative w-10 h-8">
              {/* Main body */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-5 bg-cyan-900/80 border border-cyan-500/40 rounded-t-xl" />
              {/* Wings */}
              <div className="absolute bottom-1 left-0 w-3 h-2 bg-cyan-900/60 border border-cyan-500/30 rounded-l-full" />
              <div className="absolute bottom-1 right-0 w-3 h-2 bg-cyan-900/60 border border-cyan-500/30 rounded-r-full" />
              {/* Cockpit */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400/40 border border-cyan-400/60" />
              {/* Engine glow */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full"
                style={{ background: "#67e8f9", boxShadow: "0 0 6px #67e8f9" }}
                animate={{ opacity: [0.6, 1, 0.6], scaleX: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <motion.div className="h-full bg-cyan-500/50" animate={{ width: `${progress}%` }} />
        </div>
      </motion.div>

      {/* Typing panel */}
      <div className="bg-[#050518]/90 border border-cyan-500/20 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/60">
          <Zap className="w-3 h-3" />
          <span>FIRE SEQUENCE — type to shoot!</span>
          <span className="ml-auto text-white/25">{words.length - wordIndex} ships remaining</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
          >
            <WordDisplay word={currentWord} input={currentInput} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between text-xs text-white/25 font-mono px-1">
        <span>Target: {targetWpm} WPM</span>
        <span>{Math.round(progress)}% fleet destroyed</span>
      </div>
    </div>
  );
}
