import { useEffect, useRef } from "react";
import type { ArcadeProps } from "./ArcadeArena";
import { soundEffects } from "@/lib/audio";

const CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノ@#$%&*<>{}[]|\\^~`";
const CHAR_W = 20;
const CHAR_H = 22;

interface Column {
  x: number;
  chars: string[];
  head: number;
  speed: number;
  burst: number;
}

interface TargetWord {
  col: number;
  row: number;
  word: string;
  id: number;
  typed: string;
  burst: number;
  particles: Particle[];
}

interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number }

let twIdCounter = 0;

function rndChar() { return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)]; }

export function CodeRainGame({
  words, wordIndex, currentInput, wpm, accuracy, progress,
  lastWordCorrect, submissionCount, comboStreak,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordIdxRef = useRef(wordIndex);
  wordIdxRef.current = wordIndex;
  const currentInputRef = useRef(currentInput);
  currentInputRef.current = currentInput;

  const stateRef = useRef({
    cols: [] as Column[],
    targets: [] as TargetWord[],
    score: 0,
    spawnTimer: 0,
    spawnInterval: 90,
    decryptedTotal: 0,
    glitchTimer: 0,
  });
  const prevSubRef = useRef(submissionCount);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const numCols = Math.floor(W / CHAR_W);
    const numRows = Math.floor(H / CHAR_H);
    const s = stateRef.current;
    s.cols = Array.from({ length: numCols }, (_, i) => ({
      x: i * CHAR_W,
      chars: Array.from({ length: numRows }, () => rndChar()),
      head: Math.floor(Math.random() * numRows),
      speed: 0.3 + Math.random() * 0.7,
      burst: 0,
    }));
    s.spawnInterval = Math.max(50, 90 - Math.floor(progress / 20) * 10);
  }, []);

  useEffect(() => {
    if (submissionCount === prevSubRef.current) return;
    prevSubRef.current = submissionCount;
    const s = stateRef.current;
    const expected = words[wordIdxRef.current - 1] ?? "";
    const tidx = s.targets.findIndex(t => t.word === expected);
    if (lastWordCorrect && tidx !== -1) {
      const tgt = s.targets[tidx];
      const canvas = canvasRef.current;
      if (!canvas) return;
      const cx = tgt.col * CHAR_W + CHAR_W / 2;
      const cy = tgt.row * CHAR_H + tgt.word.length * CHAR_H / 2;
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        tgt.particles.push({ x: cx, y: cy, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, size: 2 + Math.random() * 3 });
      }
      tgt.burst = 30;
      const bonus = expected.length * 20 * Math.max(1, comboStreak);
      s.score += bonus;
      s.decryptedTotal++;
      const col = s.cols[tgt.col];
      if (col) col.burst = 20;
      s.cols[tgt.col].chars = Array.from({ length: s.cols[tgt.col].chars.length }, () => rndChar());
      setTimeout(() => {
        s.targets.splice(s.targets.findIndex(t => t.id === tgt.id), 1);
      }, 600);
    } else if (!lastWordCorrect) {
      s.glitchTimer = 15;
    }
  }, [submissionCount, lastWordCorrect, words, comboStreak]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let lastFrameT = 0;
    let lastColUpdateT = 0;
    let lastSpawnT = 0;

    const spawnTarget = () => {
      const s = stateRef.current;
      const canvas = canvasRef.current!;
      const W = canvas.width, H = canvas.height;
      const numCols = Math.floor(W / CHAR_W);
      const numRows = Math.floor(H / CHAR_H);
      const widx = wordIdxRef.current;
      const numTargets = Math.min(3, Math.max(1, Math.floor(progress / 35) + 1));
      if (s.targets.length >= numTargets || widx >= words.length) return;
      const occupiedCols = new Set(s.targets.map(t => t.col));
      const availCols: number[] = [];
      for (let c = 0; c < numCols; c++) if (!occupiedCols.has(c)) availCols.push(c);
      if (!availCols.length) return;
      const col = availCols[Math.floor(Math.random() * availCols.length)];
      const word = words[widx + s.targets.length] ?? words[widx] ?? "code";
      const startRow = 1 + Math.floor(Math.random() * (numRows - word.length - 2));
      for (let i = 0; i < word.length; i++) s.cols[col].chars[startRow + i] = word[i].toUpperCase();
      s.targets.push({ col, row: startRow, word: word.toLowerCase(), id: twIdCounter++, typed: "", burst: 0, particles: [] });
    };

    const loop = (ts: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min(ts - (lastFrameT || ts), 50);
      lastFrameT = ts;
      const DT = dt / 16.667;
      const s = stateRef.current;
      const W = canvas.width, H = canvas.height;
      const numRows = Math.floor(H / CHAR_H);

      // Update columns at ~50ms intervals (3 frames at 60fps)
      if (ts - lastColUpdateT >= 50) {
        lastColUpdateT = ts;
        for (const col of s.cols) {
          if (col.burst > 0) { col.burst -= DT; continue; }
          col.head = (col.head + col.speed) % numRows;
          const replaceRow = Math.floor(col.head);
          const isInTarget = s.targets.some(t => t.col === s.cols.indexOf(col) && replaceRow >= t.row && replaceRow < t.row + t.word.length);
          if (!isInTarget) col.chars[replaceRow] = rndChar();
        }
      }

      // Spawn timer: interval in ms (1500ms default, down to 800ms at high progress)
      const sIntervalMs = Math.max(800, 1600 - Math.floor(progress / 20) * 160);
      if (ts - lastSpawnT >= sIntervalMs) { lastSpawnT = ts; spawnTarget(); }
      if (s.glitchTimer > 0) s.glitchTimer -= DT;

      ctx.fillStyle = "rgba(1,4,1,0.85)";
      ctx.fillRect(0, 0, W, H);

      if (s.glitchTimer > 0) {
        ctx.fillStyle = `rgba(255,0,0,${Math.min(s.glitchTimer / 15, 0.25)})`;
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) {
          const gy = Math.random() * H, gh = 2 + Math.random() * 8;
          const goffset = (Math.random() - 0.5) * 20;
          ctx.fillStyle = `rgba(255,0,0,0.15)`;
          ctx.fillRect(goffset, gy, W, gh);
        }
      }

      const targetColSet = new Map(s.targets.map(t => [t.col, t]));

      for (let c = 0; c < s.cols.length; c++) {
        const col = s.cols[c];
        const tgt = targetColSet.get(c);
        const headRow = Math.floor(col.head);

        for (let r = 0; r < col.chars.length; r++) {
          const x = col.x + 4, y = (r + 1) * CHAR_H;
          const distFromHead = (headRow - r + col.chars.length) % col.chars.length;
          const isBright = distFromHead < 3;
          const alpha = Math.max(0, 1 - distFromHead / 18);

          if (tgt && r >= tgt.row && r < tgt.row + tgt.word.length) {
            const isDecrypted = tgt.burst > 0;
            const charIdx = r - tgt.row;
            const isActiveTarget = tgt.word === (words[wordIdxRef.current] ?? "");
            const inp = currentInputRef.current;
            ctx.globalAlpha = 1;
            ctx.font = "bold 13px 'Courier New', monospace";
            if (isDecrypted) {
              ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 24; ctx.shadowColor = "#ffffff";
            } else if (isActiveTarget && charIdx < inp.length) {
              ctx.fillStyle = inp[charIdx] === tgt.word[charIdx] ? "#39FF14" : "#FF2079";
              ctx.shadowBlur = 16; ctx.shadowColor = inp[charIdx] === tgt.word[charIdx] ? "#39FF14" : "#FF2079";
            } else {
              ctx.fillStyle = "#ffd700"; ctx.shadowBlur = 14; ctx.shadowColor = "#ffa500";
            }
            ctx.fillText(col.chars[r], x, y);
            ctx.shadowBlur = 0;
          } else if (col.burst > 0) {
            ctx.globalAlpha = 1; ctx.font = "bold 13px 'Courier New', monospace";
            ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 20; ctx.shadowColor = "#00ff41";
            ctx.fillText(col.chars[r], x, y); ctx.shadowBlur = 0;
          } else {
            ctx.globalAlpha = alpha;
            ctx.font = isBright ? "bold 13px 'Courier New', monospace" : "12px 'Courier New', monospace";
            if (isBright) {
              ctx.fillStyle = "#ccffcc"; ctx.shadowBlur = 10; ctx.shadowColor = "#00ff41";
            } else {
              ctx.fillStyle = `hsl(135,100%,${18 + alpha * 30}%)`;
              ctx.shadowBlur = 0;
            }
            ctx.fillText(col.chars[r], x, y);
            ctx.shadowBlur = 0;
          }
        }
      }
      ctx.globalAlpha = 1;

      for (const tgt of s.targets) {
        tgt.particles = tgt.particles.filter(p => p.life > 0);
        for (const p of tgt.particles) {
          ctx.globalAlpha = p.life; ctx.fillStyle = "#ffd700";
          ctx.shadowBlur = 8; ctx.shadowColor = "#ffaa00";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
          p.x += p.vx * DT; p.y += p.vy * DT; p.vx *= Math.pow(0.92, DT); p.vy *= Math.pow(0.92, DT); p.life -= 0.025 * DT;
        }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(0,10,0,0.85)";
      ctx.beginPath(); ctx.roundRect(8, 8, 220, 54, 8); ctx.fill();
      ctx.strokeStyle = "rgba(0,200,50,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(8, 8, 220, 54, 8); ctx.stroke();
      ctx.fillStyle = "#00ff41"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
      ctx.fillText(`💻 Score: ${s.score} | Decrypted: ${s.decryptedTotal}`, 18, 28);
      ctx.fillStyle = "#88ff88"; ctx.font = "11px monospace";
      ctx.fillText(`WPM: ${wpm}  Acc: ${accuracy}%  Combo: ×${comboStreak}`, 18, 48);

      const numTargets = Math.min(3, Math.max(1, Math.floor(progress / 35) + 1));
      ctx.fillStyle = "rgba(0,10,0,0.85)";
      ctx.beginPath(); ctx.roundRect(W - 190, 8, 182, 54, 8); ctx.fill();
      ctx.strokeStyle = "rgba(255,200,0,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(W - 190, 8, 182, 54, 8); ctx.stroke();
      ctx.fillStyle = "#ffd700"; ctx.font = "bold 12px monospace"; ctx.textAlign = "left";
      ctx.fillText(`🔐 Targets active: ${s.targets.length}/${numTargets}`, W - 180, 28);
      const nextWord = words[wordIdxRef.current] ?? "";
      ctx.fillStyle = "#ffcc44"; ctx.font = "11px monospace";
      ctx.fillText(`Next: "${nextWord}"`, W - 180, 48);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [words, wpm, accuracy, progress]);

  return (
    <canvas
      ref={canvasRef}
      width={760}
      height={480}
      className="w-full rounded-xl border border-green-900/50"
      style={{ background: "#010401" }}
    />
  );
}
