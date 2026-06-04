import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Sword, Shield, Zap } from "lucide-react";

const ENEMIES = [
  { name: "Scribe",     color: "#a78bfa", hp: 100 },
  { name: "Guard",      color: "#f87171", hp: 130 },
  { name: "Magistrate", color: "#fb923c", hp: 160 },
  { name: "Warlord",    color: "#facc15", hp: 200 },
  { name: "Champion",   color: "#ef4444", hp: 250 },
];

function HealthBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max((value / max) * 100, 0);
  return (
    <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
      />
    </div>
  );
}

function WordDisplay({ word, input }: { word: string; input: string }) {
  return (
    <div className="flex items-center justify-center gap-1 font-mono text-2xl md:text-3xl font-bold tracking-widest">
      {word.split("").map((ch, i) => {
        let cls = "text-white/30";
        if (i < input.length) {
          cls = input[i] === ch ? "text-emerald-400 drop-shadow-[0_0_8px_#34d399]" : "text-red-400 bg-red-500/20 rounded";
        } else if (i === input.length) {
          cls = "text-white border-b-2 border-yellow-400";
        }
        return (
          <span key={i} className={`transition-all duration-75 ${cls}`}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

// CSS fighter character
function Fighter({ side, color, isAttacking, isHit, isDead }: {
  side: "left" | "right";
  color: string;
  isAttacking: boolean;
  isHit: boolean;
  isDead: boolean;
}) {
  const flip = side === "right" ? "scaleX(-1)" : "";
  return (
    <motion.div
      className="relative select-none"
      style={{ transform: flip }}
      animate={
        isHit ? { x: side === "left" ? [-10, 5, -5, 0] : [10, -5, 5, 0], scale: [1, 0.9, 1.05, 1] }
        : isAttacking ? { x: side === "left" ? [0, 24, 0] : [0, -24, 0], y: [0, -6, 0] }
        : isDead ? { opacity: 0, y: 20 }
        : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {/* Body */}
      <div className="relative w-16 h-20">
        {/* Head */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2"
          style={{ background: color + "30", borderColor: color }}
        >
          {/* Eyes */}
          <div className="absolute top-2.5 left-2 w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <div className="absolute top-2.5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {/* Mouth */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded" style={{ background: color }} />
        </div>
        {/* Torso */}
        <div className="absolute top-9 left-1/2 -translate-x-1/2 w-7 h-7 rounded-md border-2"
          style={{ background: color + "20", borderColor: color }}
        />
        {/* Arms */}
        <div className="absolute top-10 left-0 w-3 h-2 rounded border" style={{ borderColor: color, background: color + "20" }} />
        <div className="absolute top-10 right-0 w-3 h-2 rounded border" style={{ borderColor: color, background: color + "20" }} />
        {/* Weapon */}
        <motion.div
          className="absolute top-9 -right-3 w-5 h-1 rounded"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          animate={isAttacking ? { scaleX: [1, 1.4, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 0.2 }}
        />
        {/* Legs */}
        <div className="absolute bottom-0 left-2 w-2.5 h-5 rounded-b-md border-l-2 border-b-2"
          style={{ borderColor: color, background: color + "15" }}
        />
        <div className="absolute bottom-0 right-2 w-2.5 h-5 rounded-b-md border-r-2 border-b-2"
          style={{ borderColor: color, background: color + "15" }}
        />
      </div>

      {/* Glow ring when attacking */}
      <AnimatePresence>
        {isAttacking && (
          <motion.div
            initial={{ opacity: 0.8, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{}}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${color}40 0%, transparent 70%)` }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FighterGame({
  words, wordIndex, currentInput, wpm, accuracy,
  targetWpm, lastWordCorrect, levelNumber, submissionCount,
}: ArcadeProps) {
  const enemy = ENEMIES[Math.min(levelNumber - 1, ENEMIES.length - 1)];
  const totalWords = words.length;

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboLabel, setComboLabel] = useState<string | null>(null);
  const prevSubmission = useRef(0);

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    if (lastWordCorrect) {
      const dmg = Math.round(enemy.hp / totalWords);
      setEnemyHp(h => Math.max(h - dmg, 0));
      setPlayerAttacking(true);
      setTimeout(() => setPlayerAttacking(false), 250);
      setEnemyHit(true);
      setTimeout(() => setEnemyHit(false), 250);
      setCombo(c => {
        const next = c + 1;
        if (next >= 5) setComboLabel("ULTRA COMBO!");
        else if (next >= 3) setComboLabel(`${next}x COMBO!`);
        else setComboLabel(null);
        return next;
      });
    } else {
      const dmg = 8;
      setPlayerHp(h => Math.max(h - dmg, 0));
      setEnemyAttacking(true);
      setTimeout(() => setEnemyAttacking(false), 250);
      setPlayerHit(true);
      setTimeout(() => setPlayerHit(false), 250);
      setCombo(0);
      setComboLabel(null);
    }
  }, [lastWordCorrect, submissionCount, enemy.hp, totalWords]);

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 3);
  const progress = (wordIndex / Math.max(words.length, 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-3">
        <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-white/60">{accuracy}% acc</span>
        </div>
        <div className="ml-auto font-mono text-sm text-white/40">
          {wordIndex} / {words.length}
        </div>
      </div>

      {/* Arena */}
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-white/10"
        style={{ height: 220 }}
        animate={playerHit ? { x: [0, -8, 8, -5, 5, 0], y: [0, -4, 4, -2, 2, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Background */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, #1a0a2e 0%, #160520 50%, #0d0d0d 100%)"
        }} />

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-10"
          style={{ background: "linear-gradient(to top, #1a1a2e, transparent)" }}
        />
        {/* Floor line */}
        <div className="absolute bottom-8 left-0 right-0 h-px bg-white/10" />

        {/* Crowd silhouettes */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-end justify-around opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-4 rounded-t-full bg-purple-900"
              style={{ height: `${20 + (i % 3) * 8}px` }}
            />
          ))}
        </div>

        {/* Player HP */}
        <div className="absolute top-12 left-4 w-32 space-y-1">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400">YOU</span>
            <span className="text-xs font-mono text-white/50 ml-auto">{playerHp}/100</span>
          </div>
          <HealthBar value={playerHp} max={100} color="#34d399" />
        </div>

        {/* Enemy HP */}
        <div className="absolute top-12 right-4 w-32 space-y-1">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs font-mono text-white/50">{Math.max(enemyHp, 0)}/{enemy.hp}</span>
            <span className="text-xs font-mono font-bold" style={{ color: enemy.color }}>
              {enemy.name.toUpperCase()}
            </span>
            <Sword className="w-3 h-3" style={{ color: enemy.color }} />
          </div>
          <HealthBar value={enemyHp} max={enemy.hp} color={enemy.color} />
        </div>

        {/* VS in center */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white/20 font-black text-lg font-mono">
          VS
        </div>

        {/* Combo label */}
        <AnimatePresence>
          {comboLabel && (
            <motion.div
              key={comboLabel + combo}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -30, scale: 1.2 }}
              exit={{}}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-black text-lg font-mono z-10 pointer-events-none drop-shadow-lg"
            >
              {comboLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attack effect */}
        <AnimatePresence>
          {playerAttacking && (
            <motion.div
              initial={{ opacity: 0.8, scaleX: 0 }}
              animate={{ opacity: 0, scaleX: 1 }}
              exit={{}}
              className="absolute top-1/2 left-1/4 right-1/4 h-px origin-left"
              style={{ background: "linear-gradient(to right, #34d399, transparent)" }}
            />
          )}
          {enemyAttacking && (
            <motion.div
              initial={{ opacity: 0.8, scaleX: 0 }}
              animate={{ opacity: 0, scaleX: 1 }}
              exit={{}}
              className="absolute top-1/2 left-1/4 right-1/4 h-px origin-right"
              style={{ background: "linear-gradient(to left, #f87171, transparent)" }}
            />
          )}
        </AnimatePresence>

        {/* Player character */}
        <div className="absolute left-8 bottom-8">
          <Fighter
            side="left"
            color="#34d399"
            isAttacking={playerAttacking}
            isHit={playerHit}
            isDead={playerHp <= 0}
          />
        </div>

        {/* Enemy character */}
        <div className="absolute right-8 bottom-8">
          <Fighter
            side="right"
            color={enemy.color}
            isAttacking={enemyAttacking}
            isHit={enemyHit}
            isDead={enemyHp <= 0}
          />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <motion.div
            className="h-full bg-primary/60"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      {/* Typing panel */}
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <Sword className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400">ATTACK MOVE</span>
          {combo > 1 && <span className="ml-auto text-yellow-400 font-bold">{combo}x COMBO</span>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.12 }}
          >
            <WordDisplay word={currentWord} input={currentInput} />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 pt-1">
          {nextWords.map((w, i) => (
            <span key={i} className="font-mono text-xs text-white/20">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
