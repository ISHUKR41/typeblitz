import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Crosshair, Zap, Heart, Target } from "lucide-react";
import { soundEffects } from "@/lib/audio";

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  word: string;
  wordIdx: number;
  hp: number;
  maxHp: number;
  radius: number;
  color: string;
  angle: number;
  speed: number;
  pulse: number;
  type: "grunt" | "tank" | "speeder";
}

interface Bullet {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string;
}

interface BlastParticle {
  x: number; y: number; vx: number; vy: number;
  color: string; alpha: number; life: number; maxLife: number; size: number;
}

interface RingExplosion {
  x: number; y: number; r: number; maxR: number; alpha: number; color: string;
}

const ENEMY_COLORS = { grunt: "#f87171", tank: "#fb923c", speeder: "#818cf8" };
const CENTER_X = 400, CENTER_Y = 120;

let _eid = 0;

export function ArenaBlitzGame({
  words, wordIndex, currentInput, wpm, accuracy, progress,
  startTime, lastWordCorrect, submissionCount, comboStreak, mistakeCount,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<BlastParticle[]>([]);
  const ringsRef = useRef<RingExplosion[]>([]);
  const prevSubmissionRef = useRef(submissionCount);
  const shieldHpRef = useRef(100);
  const frameRef = useRef(0);
  const [shieldHp, setShieldHp] = useState(100);
  const [kills, setKills] = useState(0);

  const spawnEnemy = useCallback((wordForEnemy: string) => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 230 + Math.random() * 50;
    const x = CENTER_X + Math.cos(angle) * dist;
    const y = CENTER_Y + Math.sin(angle) * dist;
    const r = Math.random();
    const type: Enemy["type"] = r < 0.6 ? "grunt" : r < 0.8 ? "tank" : "speeder";
    const speedBase = type === "speeder" ? 0.55 : type === "tank" ? 0.22 : 0.38;
    const speed = speedBase + (wpm / 200) * 0.12;
    const dx = CENTER_X - x, dy = CENTER_Y - y;
    const len = Math.hypot(dx, dy);
    const hp = type === "tank" ? 2 : 1;
    enemiesRef.current.push({
      id: _eid++, x, y,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      word: wordForEnemy,
      wordIdx: 0,
      hp, maxHp: hp,
      radius: type === "tank" ? 18 : type === "speeder" ? 10 : 13,
      color: ENEMY_COLORS[type],
      angle, speed,
      pulse: Math.random() * Math.PI * 2,
      type,
    });
  }, [wpm]);

  // Spawn enemies periodically
  useEffect(() => {
    if (!startTime) return;
    const available = words.slice(wordIndex, wordIndex + 8);
    let spawnIdx = 0;
    const baseInterval = Math.max(2000 - wpm * 12, 600);
    const interval = setInterval(() => {
      if (enemiesRef.current.length < 6) {
        const w = available[spawnIdx % available.length] ?? words[0];
        spawnEnemy(w);
        spawnIdx++;
      }
    }, baseInterval);
    return () => clearInterval(interval);
  }, [startTime, wpm, words, wordIndex, spawnEnemy]);

  // Initial spawn
  useEffect(() => {
    if (startTime && enemiesRef.current.length === 0) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnEnemy(words[i] ?? words[0]), i * 400);
      }
    }
  }, [startTime, words, spawnEnemy]);

  // Word submission
  useEffect(() => {
    if (submissionCount === prevSubmissionRef.current) return;
    prevSubmissionRef.current = submissionCount;

    if (!lastWordCorrect) {
      // Damage player
      shieldHpRef.current = Math.max(0, shieldHpRef.current - 8);
      setShieldHp(shieldHpRef.current);
      return;
    }

    // Find closest enemy and fire at it
    if (enemiesRef.current.length === 0) return;
    const target = enemiesRef.current.reduce((closest, e) => {
      const d1 = Math.hypot(e.x - CENTER_X, e.y - CENTER_Y);
      const d2 = Math.hypot(closest.x - CENTER_X, closest.y - CENTER_Y);
      return d1 < d2 ? e : closest;
    });

    // Fire bullet at target
    const dx = target.x - CENTER_X, dy = target.y - CENTER_Y;
    const len = Math.hypot(dx, dy);
    const bulletSpeed = 9;
    bulletsRef.current.push({
      x: CENTER_X, y: CENTER_Y,
      vx: (dx / len) * bulletSpeed, vy: (dy / len) * bulletSpeed,
      life: 0, maxLife: 60, color: comboStreak >= 4 ? "#fbbf24" : "#a78bfa",
    });

    // Kill enemy
    const idx = enemiesRef.current.indexOf(target);
    if (idx !== -1) {
      const e = target;
      e.hp--;
      if (e.hp <= 0) {
        // Explosion
        for (let i = 0; i < 32; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 4;
          particlesRef.current.push({
            x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            color: e.color, alpha: 1, life: 0, maxLife: 35 + Math.random() * 20, size: 2 + Math.random() * 3,
          });
        }
        ringsRef.current.push({ x: e.x, y: e.y, r: e.radius, maxR: e.radius * 3.5, alpha: 0.8, color: e.color });
        enemiesRef.current.splice(idx, 1);
        setKills(k => k + 1);
        // Spawn replacement
        const nextWord = words[Math.min(wordIndex + 1, words.length - 1)];
        setTimeout(() => spawnEnemy(nextWord), 800);
      }
    }
  }, [submissionCount, lastWordCorrect, comboStreak, spawnEnemy, words, wordIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const w = canvas.width, h = canvas.height;
      frameRef.current++;
      const t = Date.now();

      // Background — dark arena
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Arena floor grid
      const gridSize = 32;
      ctx.strokeStyle = "rgba(139,92,246,0.07)";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < w; gx += gridSize) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
      for (let gy = 0; gy < h; gy += gridSize) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

      // Arena boundary circle
      ctx.save();
      const arenaR = 175;
      const arenaGrad = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, arenaR);
      arenaGrad.addColorStop(0, "rgba(139,92,246,0.04)");
      arenaGrad.addColorStop(0.7, "rgba(139,92,246,0.02)");
      arenaGrad.addColorStop(1, "rgba(139,92,246,0)");
      ctx.fillStyle = arenaGrad;
      ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, arenaR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(139,92,246,${0.15 + Math.sin(t / 800) * 0.07})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 5]); ctx.lineDashOffset = -(t / 60) % 13;
      ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, arenaR, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      // Inner danger circle
      ctx.strokeStyle = `rgba(239,68,68,${0.1 + Math.sin(t / 400) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(CENTER_X, CENTER_Y, 30, 0, Math.PI * 2); ctx.stroke();

      // Update and draw bullets
      bulletsRef.current = bulletsRef.current.filter(b => b.life < b.maxLife);
      bulletsRef.current.forEach(b => {
        b.x += b.vx; b.y += b.vy; b.life++;
        const alpha = 1 - b.life / b.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = b.color; ctx.shadowBlur = 10;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
        // Trail
        ctx.strokeStyle = b.color; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 4, b.y - b.vy * 4);
        ctx.stroke();
        ctx.restore();
      });

      // Update and draw ring explosions
      ringsRef.current = ringsRef.current.filter(r => r.alpha > 0.02);
      ringsRef.current.forEach(r => {
        r.r += 3; r.alpha *= 0.88;
        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color; ctx.lineWidth = 2;
        ctx.shadowColor = r.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      });

      // Update and draw enemies
      enemiesRef.current.forEach(e => {
        e.x += e.vx; e.y += e.vy;
        e.pulse += 0.05;

        // Check if reached center
        const dist = Math.hypot(e.x - CENTER_X, e.y - CENTER_Y);
        if (dist < 32) {
          shieldHpRef.current = Math.max(0, shieldHpRef.current - 15);
          setShieldHp(shieldHpRef.current);
          // Remove enemy and respawn
          const idx = enemiesRef.current.indexOf(e);
          if (idx !== -1) enemiesRef.current.splice(idx, 1);
          spawnEnemy(words[Math.min(wordIndex, words.length - 1)]);
          return;
        }

        const sc = Math.min(1, 0.4 + (1 - dist / 230) * 0.6);

        ctx.save();
        ctx.translate(e.x, e.y);

        // Outer pulse ring
        ctx.strokeStyle = `${e.color}${Math.floor((0.3 + Math.sin(e.pulse) * 0.2) * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 1.5 + Math.sin(e.pulse) * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Body
        const eGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, e.radius);
        eGrad.addColorStop(0, e.color + "80");
        eGrad.addColorStop(1, e.color + "20");
        ctx.fillStyle = eGrad;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12 * sc;
        ctx.beginPath();
        if (e.type === "tank") {
          // Hexagon
          for (let vi = 0; vi < 6; vi++) {
            const va = (vi / 6) * Math.PI * 2 - Math.PI / 6;
            if (vi === 0) ctx.moveTo(Math.cos(va) * e.radius, Math.sin(va) * e.radius);
            else ctx.lineTo(Math.cos(va) * e.radius, Math.sin(va) * e.radius);
          }
          ctx.closePath();
        } else if (e.type === "speeder") {
          // Diamond
          ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius * 0.7, 0);
          ctx.lineTo(0, e.radius); ctx.lineTo(-e.radius * 0.7, 0);
          ctx.closePath();
        } else {
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // HP bar
        if (e.maxHp > 1) {
          const bw = e.radius * 2;
          ctx.fillStyle = "#1f2937";
          ctx.fillRect(-bw / 2, -e.radius - 9, bw, 4);
          ctx.fillStyle = e.color;
          ctx.fillRect(-bw / 2, -e.radius - 9, bw * (e.hp / e.maxHp), 4);
        }

        // Word label
        ctx.fillStyle = "#f9fafb";
        ctx.font = `bold ${Math.floor(7 * sc + 4)}px monospace`;
        ctx.textAlign = "center";
        ctx.shadowColor = e.color; ctx.shadowBlur = 5;
        ctx.fillText(e.word.toUpperCase(), 0, e.radius + 14 * sc);
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // Blast particles
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life++; p.vy += 0.08;
        // Floor bounce
        if (p.y > h - 5 && p.vy > 0) { p.vy = -p.vy * 0.4; p.vx *= 0.8; }
        p.alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // Player ship (center)
      ctx.save();
      ctx.translate(CENTER_X, CENTER_Y);
      const angle = (t / 3000);
      // Rotating shield ring
      ctx.strokeStyle = `rgba(99,102,241,${0.3 + (shieldHpRef.current / 100) * 0.5})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = "#6366f1"; ctx.shadowBlur = 12;
      ctx.setLineDash([10, 6]);
      ctx.lineDashOffset = -(t / 50) % 16;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur = 0;

      // Ship body
      const shipGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
      shipGrad.addColorStop(0, "rgba(99,102,241,0.9)");
      shipGrad.addColorStop(1, "rgba(49,46,129,0.95)");
      ctx.fillStyle = shipGrad;
      ctx.strokeStyle = "#818cf8"; ctx.lineWidth = 2;
      ctx.shadowColor = "#818cf8"; ctx.shadowBlur = 15;
      ctx.beginPath();
      for (let vi = 0; vi < 5; vi++) {
        const va = (vi / 5) * Math.PI * 2 - Math.PI / 2;
        if (vi === 0) ctx.moveTo(Math.cos(va) * 13, Math.sin(va) * 13);
        else ctx.lineTo(Math.cos(va) * 13, Math.sin(va) * 13);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      // Cannon barrels (pointing outward)
      ctx.strokeStyle = "#a5b4fc"; ctx.lineWidth = 2;
      for (let ci = 0; ci < 4; ci++) {
        const ca = (ci / 4) * Math.PI * 2 + angle;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ca) * 14, Math.sin(ca) * 14);
        ctx.lineTo(Math.cos(ca) * 22, Math.sin(ca) * 22);
        ctx.stroke();
      }
      ctx.restore();

      // Shield HP bar (bottom left)
      const shieldW = 120;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(8, h - 22, shieldW + 2, 12, 3); else ctx.rect(8, h - 22, shieldW + 2, 12); ctx.fill();
      const shieldColor = shieldHpRef.current > 60 ? "#818cf8" : shieldHpRef.current > 30 ? "#fb923c" : "#ef4444";
      ctx.fillStyle = shieldColor;
      ctx.shadowColor = shieldColor; ctx.shadowBlur = 6;
      const fillW = (shieldHpRef.current / 100) * shieldW;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(9, h - 21, fillW, 10, 2); else ctx.rect(9, h - 21, fillW, 10); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e2e8f0"; ctx.font = "bold 7px monospace"; ctx.textAlign = "left";
      ctx.fillText(`SHIELD ${shieldHpRef.current}%`, 12, h - 12);

      // HUD stats
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(w - 100, 0, 100, 20);
      ctx.fillStyle = "#a78bfa"; ctx.font = "bold 7px monospace"; ctx.textAlign = "right";
      ctx.fillText(`${kills} KILLS  ${wpm} WPM`, w - 6, 13);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [wpm, accuracy, spawnEnemy, words, wordIndex, kills]);

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 4);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 select-none">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="bg-black/80 border border-violet-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-mono font-bold text-violet-400">{wpm}</span>
          <span className="text-violet-600 text-xs">WPM</span>
        </div>
        <div className="bg-black/80 border border-violet-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-violet-300">
          {accuracy}% ACC
        </div>
        <div className="bg-black/80 border border-yellow-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-yellow-300">
          x{comboStreak} COMBO
        </div>
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-violet-300 flex items-center gap-1">
          <Target className="w-3 h-3" /> {kills} KILLS
        </div>
        <div className="ml-auto font-mono text-xs text-violet-600">{mistakeCount} misses</div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-500/10">
        <canvas ref={canvasRef} width={800} height={240} className="w-full h-[240px] block" />
      </div>

      <div className="bg-gray-950/90 border border-violet-500/20 rounded-2xl p-4 md:p-5 space-y-3 shadow-inner">
        {!startTime && (
          <p className="text-center text-violet-400/60 font-mono text-sm">⌨ Type words to fire — defend the center!</p>
        )}
        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest">
          {currentWord.split("").map((ch, i) => {
            let cls = "text-violet-900";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch ? "text-violet-400 drop-shadow-[0_0_6px_#818cf8]" : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-violet-200 border-b-2 border-violet-400 animate-pulse";
            }
            return <span key={i} className={`transition-all duration-50 ${cls}`}>{ch}</span>;
          })}
        </div>
        <div className="flex items-center justify-center gap-4">
          {nextWords.map((w, i) => (
            <span key={i} className="font-mono text-sm text-violet-800">{w}</span>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs text-violet-800 font-mono px-1">
        <span>SHIELD: {shieldHp}%</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
}
