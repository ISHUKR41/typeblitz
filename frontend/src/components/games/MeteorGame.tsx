import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Shield, Flame, Zap } from "lucide-react";
import { soundEffects } from "@/lib/audio";

interface Meteor {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  angle: number;
  tailLength: number;
  destroyed: boolean;
  exploding: boolean;
  explodeFrame: number;
  targetWordIdx: number;
}

interface LaserBeam {
  x1: number; y1: number;
  x2: number; y2: number;
  life: number; maxLife: number;
  color: string;
}

interface ExplosionRing {
  x: number; y: number;
  radius: number; maxRadius: number;
  alpha: number; life: number; maxLife: number;
  color: string;
}

const METEOR_COLORS = ["#f97316", "#ef4444", "#fb923c", "#fbbf24", "#f43f5e"];

export function MeteorGame({
  words,
  wordIndex,
  currentInput,
  wpm,
  accuracy,
  targetWpm,
  lastWordCorrect,
  startTime,
  elapsedSeconds,
  comboStreak,
  mistakeCount,
  submissionCount,
  progress,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meteorsRef = useRef<Meteor[]>([]);
  const lasersRef = useRef<LaserBeam[]>([]);
  const ringsRef = useRef<ExplosionRing[]>([]);
  const prevSubmission = useRef(submissionCount);
  const meteorIdRef = useRef(0);
  const starRef = useRef<{ x: number; y: number; s: number; sp: number }[]>([]);
  const cityRef = useRef<{ x: number; w: number; h: number; lit: boolean[] }[]>([]);
  const frameRef = useRef(0);

  const [shieldHp, setShieldHp] = useState(100);
  const [score, setScore] = useState(0);
  const [screenFlash, setScreenFlash] = useState<"red" | "green" | null>(null);

  // Init stars and city once
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * 800, y: Math.random() * 240, s: Math.random() * 1.8 + 0.3, sp: Math.random() * 0.3 + 0.05 });
    }
    starRef.current = stars;
    const city = [];
    for (let cx = 0; cx < 800; cx += 18 + Math.floor(Math.random() * 18)) {
      const bh = 20 + Math.floor(Math.random() * 45);
      const bw = 14 + Math.floor(Math.random() * 14);
      const windows: boolean[] = [];
      for (let i = 0; i < Math.floor(bh / 7) * Math.floor(bw / 6); i++) {
        windows.push(Math.random() > 0.4);
      }
      city.push({ x: cx, w: bw, h: bh, lit: windows });
    }
    cityRef.current = city;
  }, []);

  // Spawn meteors tied to wordIndex
  useEffect(() => {
    if (!startTime) return;
    const currentMeteor = meteorsRef.current.find(m => m.targetWordIdx === wordIndex && !m.destroyed);
    if (currentMeteor) return;

    const speed = 0.25 + (wpm / 120) * 0.4 + (wordIndex / Math.max(words.length, 1)) * 0.3;
    const color = METEOR_COLORS[wordIndex % METEOR_COLORS.length];
    meteorsRef.current.push({
      id: meteorIdRef.current++,
      word: words[wordIndex] ?? "",
      x: 120 + Math.random() * 560,
      y: -30,
      speed,
      size: 22 + (words[wordIndex]?.length ?? 4) * 1.5,
      color,
      angle: (Math.random() - 0.5) * 0.3,
      tailLength: 60 + Math.random() * 40,
      destroyed: false,
      exploding: false,
      explodeFrame: 0,
      targetWordIdx: wordIndex,
    });
  }, [wordIndex, startTime, wpm, words]);

  // Handle word submission
  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    const targetMeteor = meteorsRef.current.find(m => m.targetWordIdx === wordIndex - 1 && !m.destroyed);

    if (lastWordCorrect) {
      setScore(s => s + Math.max(10, Math.round(100 / Math.max(targetMeteor?.y ?? 100, 1) * 10)));
      soundEffects.playLaser();
      setTimeout(() => soundEffects.playExplosion(), 80);
      setScreenFlash("green");
      setTimeout(() => setScreenFlash(null), 200);

      if (targetMeteor) {
        const canvas = canvasRef.current;
        const cw = canvas?.width ?? 800;
        // Add laser beam
        lasersRef.current.push({
          x1: cw / 2, y1: 240,
          x2: targetMeteor.x, y2: targetMeteor.y,
          life: 0, maxLife: 8,
          color: "#38bdf8",
        });
        // Add explosion rings
        for (let r = 0; r < 3; r++) {
          ringsRef.current.push({
            x: targetMeteor.x, y: targetMeteor.y,
            radius: 5 + r * 8, maxRadius: 40 + r * 20,
            alpha: 1, life: 0, maxLife: 20 + r * 6,
            color: targetMeteor.color,
          });
        }
        targetMeteor.destroyed = true;
        targetMeteor.exploding = true;
        targetMeteor.explodeFrame = 0;
      }
    } else {
      soundEffects.playError();
      setScreenFlash("red");
      setTimeout(() => setScreenFlash(null), 180);

      const dmg = 8 + comboStreak;
      setShieldHp(h => Math.max(h - dmg, 0));
    }
  }, [lastWordCorrect, submissionCount, wordIndex, comboStreak]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      frameRef.current++;
      const w = canvas.width;
      const h = canvas.height;
      const t = Date.now();

      // === BACKGROUND: Deep space ===
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, h);
      spaceGrad.addColorStop(0, "#020510");
      spaceGrad.addColorStop(0.55, "#050818");
      spaceGrad.addColorStop(1, "#0a0c18");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, w, h);

      // Scrolling stars parallax
      starRef.current.forEach(star => {
        star.y = (star.y + star.sp) % h;
        const twinkle = 0.3 + Math.abs(Math.sin(t / 600 + star.x)) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nebula glow blob
      const nebGrad = ctx.createRadialGradient(w * 0.6, h * 0.25, 0, w * 0.6, h * 0.25, 180);
      nebGrad.addColorStop(0, "rgba(168,85,247,0.06)");
      nebGrad.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, w, h);
      const neb2 = ctx.createRadialGradient(w * 0.2, h * 0.5, 0, w * 0.2, h * 0.5, 140);
      neb2.addColorStop(0, "rgba(239,68,68,0.04)");
      neb2.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, w, h);

      // Screen flash overlay
      if (screenFlash === "red") {
        ctx.fillStyle = "rgba(239,68,68,0.18)";
        ctx.fillRect(0, 0, w, h);
      } else if (screenFlash === "green") {
        ctx.fillStyle = "rgba(52,211,153,0.10)";
        ctx.fillRect(0, 0, w, h);
      }

      // === DRAW METEORS ===
      meteorsRef.current.forEach(meteor => {
        if (meteor.destroyed && !meteor.exploding) return;
        if (!meteor.destroyed) {
          meteor.y += meteor.speed;
          meteor.x += Math.sin(meteor.angle * 10 + meteor.y / 50) * 0.4;
        }

        if (meteor.exploding) {
          meteor.explodeFrame++;
          if (meteor.explodeFrame > 25) {
            meteor.exploding = false;
          }
          return; // Explosion handled by rings
        }

        ctx.save();
        ctx.translate(meteor.x, meteor.y);
        ctx.rotate(meteor.angle + Math.PI / 4);

        // Tail / trail
        const tailGrad = ctx.createLinearGradient(0, -meteor.tailLength, 0, 0);
        tailGrad.addColorStop(0, `${meteor.color}00`);
        tailGrad.addColorStop(0.6, `${meteor.color}30`);
        tailGrad.addColorStop(1, `${meteor.color}80`);

        ctx.fillStyle = tailGrad;
        ctx.beginPath();
        ctx.moveTo(-meteor.size * 0.3, -meteor.tailLength);
        ctx.lineTo(meteor.size * 0.3, -meteor.tailLength);
        ctx.lineTo(meteor.size * 0.55, 0);
        ctx.lineTo(-meteor.size * 0.55, 0);
        ctx.closePath();
        ctx.fill();

        // Fire particles in tail
        for (let fp = 0; fp < 5; fp++) {
          const fy = -meteor.tailLength * (fp / 5) + Math.sin(t / 80 + fp * 2) * 4;
          const fa = 0.1 + Math.abs(Math.sin(t / 100 + fp)) * 0.2;
          const fr = 1.5 + Math.random() * 2;
          ctx.fillStyle = `rgba(251,191,36,${fa})`;
          ctx.beginPath();
          ctx.arc(Math.sin(t / 60 + fp) * (meteor.size * 0.2), fy, fr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Glow halo
        ctx.shadowColor = meteor.color;
        ctx.shadowBlur = 20;

        // Main meteor body (irregular rock shape)
        ctx.fillStyle = "#1a0a06";
        ctx.strokeStyle = meteor.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pts = 8;
        for (let p = 0; p < pts; p++) {
          const ang = (p / pts) * Math.PI * 2;
          const rad = meteor.size * (0.75 + Math.sin(ang * 3 + meteor.id) * 0.2);
          const px = Math.cos(ang) * rad;
          const py = Math.sin(ang) * rad;
          p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Hot glowing core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, meteor.size * 0.6);
        coreGrad.addColorStop(0, "#ffffff");
        coreGrad.addColorStop(0.3, meteor.color);
        coreGrad.addColorStop(1, `${meteor.color}00`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, meteor.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();

        // Draw word tag ABOVE meteor — typed (neon green) + remaining (amber/white)
        const isTarget = meteor.targetWordIdx === wordIndex;
        ctx.save();
        ctx.font = `bold ${isTarget ? 12 : 10}px monospace`;
        const word = meteor.word;
        const typedLen = isTarget ? Math.min(currentInput.length, word.length) : 0;
        const typedPart = word.slice(0, typedLen);
        const remainPart = word.slice(typedLen);
        const fullW = ctx.measureText(word).width;
        let xCur = meteor.x - fullW / 2;
        ctx.textAlign = "left";
        if (typedPart) {
          ctx.fillStyle = "#39FF14";
          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 6;
          ctx.fillText(typedPart, xCur, meteor.y - meteor.size - 8);
          xCur += ctx.measureText(typedPart).width;
        }
        ctx.fillStyle = isTarget ? "#fef08a" : "rgba(255,255,255,0.5)";
        ctx.shadowColor = isTarget ? "#fbbf24" : "rgba(0,0,0,0.8)";
        ctx.shadowBlur = isTarget ? 8 : 4;
        ctx.fillText(remainPart, xCur, meteor.y - meteor.size - 8);
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.restore();

        // If meteor hits bottom (ground), damage shield
        if (meteor.y > h + 20 && !meteor.destroyed) {
          meteor.destroyed = true;
          setShieldHp(hp => Math.max(hp - 15, 0));
          soundEffects.playError();
        }
      });

      // Clean destroyed meteors
      meteorsRef.current = meteorsRef.current.filter(m => !m.destroyed || m.exploding);

      // === EXPLOSION RINGS ===
      ringsRef.current.forEach(ring => {
        ring.life++;
        ring.radius += (ring.maxRadius - ring.radius) * 0.18;
        ring.alpha = 1 - (ring.life / ring.maxLife);
        ctx.save();
        ctx.globalAlpha = ring.alpha;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      ringsRef.current = ringsRef.current.filter(r => r.life < r.maxLife);

      // === LASER BEAMS ===
      lasersRef.current.forEach(laser => {
        laser.life++;
        const alpha = 1 - (laser.life / laser.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = laser.color;
        ctx.lineWidth = 3 - (laser.life / laser.maxLife) * 2;
        ctx.shadowColor = laser.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        // Core white line
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.moveTo(laser.x1, laser.y1);
        ctx.lineTo(laser.x2, laser.y2);
        ctx.stroke();
        ctx.restore();
      });
      lasersRef.current = lasersRef.current.filter(l => l.life < l.maxLife);

      // === CITY SKYLINE at bottom ===
      const groundY = h - 32;
      // Ground strip
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
      groundGrad.addColorStop(0, "#0d0a1a");
      groundGrad.addColorStop(1, "#050210");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Neon ground line
      ctx.strokeStyle = "rgba(168,85,247,0.5)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Buildings
      cityRef.current.forEach(b => {
        const by = groundY - b.h;
        ctx.fillStyle = "rgba(5,3,20,0.95)";
        ctx.fillRect(b.x, by, b.w, b.h);

        // Building outline
        ctx.strokeStyle = "rgba(168,85,247,0.12)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(b.x, by, b.w, b.h);

        // Window lights
        let winIdx = 0;
        const cols = Math.floor(b.w / 6);
        const rows = Math.floor(b.h / 7);
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (b.lit[winIdx]) {
              const wx = b.x + col * 6 + 2;
              const wy = by + row * 7 + 2;
              const blink = Math.sin(t / 2000 + winIdx * 0.7) > 0.85;
              ctx.fillStyle = blink ? "rgba(168,85,247,0.05)" : "rgba(251,191,36,0.25)";
              ctx.fillRect(wx, wy, 3, 3);
            }
            winIdx++;
          }
        }
      });

      // === DEFENSE CANNON (player) ===
      ctx.save();
      ctx.translate(w / 2, groundY);
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 14;

      // Cannon base platform
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-28, -6, 56, 12, 4);
      ctx.fill();
      ctx.stroke();

      // Cannon barrel (aims at current target)
      const targetMet = meteorsRef.current.find(m => m.targetWordIdx === wordIndex && !m.destroyed);
      let aimAngle = -Math.PI / 2;
      if (targetMet) {
        aimAngle = Math.atan2(targetMet.y - groundY, targetMet.x - w / 2);
        aimAngle = Math.max(-Math.PI + 0.2, Math.min(-0.2, aimAngle));
      }

      ctx.save();
      ctx.rotate(aimAngle + Math.PI / 2);
      // Barrel
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-5, -32, 10, 32, 3);
      ctx.fill();
      ctx.stroke();
      // Barrel tip glow
      ctx.fillStyle = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -32, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shield dome indicator (pulsing when low)
      const shieldAlpha = shieldHp < 30 ? 0.15 + Math.abs(Math.sin(t / 200)) * 0.15 : 0.06;
      ctx.strokeStyle = `rgba(56,189,248,${shieldAlpha * 4})`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(0, 0, 40, -Math.PI, 0);
      ctx.stroke();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [wordIndex, currentInput, words, shieldHp, screenFlash]);

  const currentWord = words[wordIndex] ?? "";
  const wave = Math.ceil((wordIndex + 1) / 5);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/70 border border-orange-500/30 rounded-xl px-3 py-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="font-mono font-bold text-white">{shieldHp}</span>
          <span className="text-xs text-white/40">SHIELD</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/70 border border-yellow-500/30 rounded-xl px-3 py-1.5">
          <span className="font-mono text-xs text-yellow-400 font-bold">WAVE {wave}</span>
        </div>
        <div className="bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-yellow-300 font-bold">{comboStreak}x STREAK</span>
        </div>
        <div className="bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-white/50">{accuracy}% acc</span>
        </div>
        <div className="bg-red-500/15 border border-red-500/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-red-300">{mistakeCount} errors</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/70 border border-cyan-500/25 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
      </div>

      {/* Shield bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-orange-400">SHIELD</span>
        <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className={`h-full rounded-full ${shieldHp > 50 ? "bg-gradient-to-r from-cyan-500 to-blue-500" : shieldHp > 25 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-red-600 to-red-400"}`}
            animate={{ width: `${shieldHp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/30">{shieldHp}/100</span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-orange-900/20">
        <canvas
          ref={canvasRef}
          width={800}
          height={240}
          className="w-full h-[240px] block"
        />
        {!startTime && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-orange-400/60 font-mono text-sm animate-pulse">
              ☄️ Type words to fire the cannon at incoming meteors!
            </p>
          </div>
        )}
        {shieldHp <= 20 && (
          <div className="absolute inset-0 border-2 border-red-500/40 animate-pulse pointer-events-none rounded-2xl" />
        )}
      </div>

      {/* Typing box */}
      <div className="bg-gray-950/95 border border-orange-500/20 rounded-2xl p-5 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-orange-400/70">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>METEOR INTERCEPT — type words to fire cannon!</span>
          <span className="ml-auto text-white/25">{words.length - wordIndex} meteors incoming</span>
        </div>

        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest py-1">
          {currentWord.split("").map((ch, i) => {
            let cls = "text-white/20";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch
                ? "text-orange-300 drop-shadow-[0_0_6px_#fb923c]"
                : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-white border-b-2 border-orange-400 animate-pulse";
            }
            return (
              <span key={i} className={`transition-colors duration-75 ${cls}`}>{ch}</span>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {words.slice(wordIndex + 1, wordIndex + 3).map((w, i) => (
            <span key={i} className="font-mono text-xs text-white/20">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
