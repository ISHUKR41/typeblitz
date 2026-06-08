import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Heart, Skull, Zap } from "lucide-react";
import { soundEffects } from "@/lib/audio";

const ZOMBIE_COLORS = ["#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d"];

interface SplatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface BulletTracer {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  life: number;
  maxLife: number;
}

export function ZombieGame({
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
}: ArcadeProps) {
  const [playerHp, setPlayerHp] = useState(100);
  const [screenShake, setScreenShake] = useState(false);
  const prevSubmission = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splatsRef = useRef<SplatParticle[]>([]);
  const bulletsRef = useRef<BulletTracer[]>([]);

  // Visible zombies
  const visibleStart = Math.max(0, wordIndex - 1);
  const visibleEnd = Math.min(words.length, visibleStart + 5);
  const visibleWords = words.slice(visibleStart, visibleEnd);

  // Pressure calculations
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;
  const timeRatio = startTime ? Math.min(elapsedSeconds / targetSeconds, 1) : 0;
  const targetZombiePressure = Math.max(0, timeRatio - (wordIndex / words.length));

  const zombieXPositions = useMemo(() => {
    return visibleWords.map((_, i) => {
      const idx = visibleStart + i;
      if (idx < wordIndex) return -100; // dead
      if (idx === wordIndex) {
        // current target moves closer
        return 90 - Math.min(0.5 + targetZombiePressure * 0.8, 0.95) * 70; // 90% down to 20%
      }
      return 90 - (0.1 + i * 0.15) * 70;
    });
  }, [visibleWords.length, wordIndex, targetZombiePressure, visibleStart]);

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    const targetX = 800 * (zombieXPositions[wordIndex - visibleStart] ?? 80) / 100;

    if (lastWordCorrect) {
      // Shoot bullet tracer
      bulletsRef.current.push({
        startX: 55,
        startY: 140,
        endX: targetX,
        endY: 135,
        life: 0,
        maxLife: 6,
      });

      // Splat particles
      for (let k = 0; k < 18; k++) {
        splatsRef.current.push({
          x: targetX,
          y: 135,
          vx: (Math.random() * 8 - 3),
          vy: (Math.random() * 8 - 5),
          size: Math.random() * 4 + 2,
          color: ZOMBIE_COLORS[wordIndex % ZOMBIE_COLORS.length],
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }

      soundEffects.playGunshot();
      setTimeout(() => soundEffects.playSplat(), 90);
    } else {
      // Zombie hit player
      const dmg = Math.max(5, Math.round(targetZombiePressure * 20)) || 10;
      setPlayerHp(h => Math.max(h - dmg, 0));
      setScreenShake(true);
      soundEffects.playError();
      setTimeout(() => setScreenShake(false), 250);
    }
  }, [lastWordCorrect, submissionCount, targetZombiePressure, wordIndex, zombieXPositions, visibleStart]);

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      if (screenShake) {
        ctx.translate(Math.random() * 8 - 4, Math.random() * 8 - 4);
      }

      // Draw background (atmospheric graveyard)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#060a04");
      skyGrad.addColorStop(0.3, "#0a1208");
      skyGrad.addColorStop(0.6, "#0e170a");
      skyGrad.addColorStop(1, "#030602");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars in night sky
      for (let s = 0; s < 25; s++) {
        const sx = (s * 137 + 29) % w;
        const sy = (s * 41 + 7) % (h * 0.35);
        const twinkle = 0.15 + Math.abs(Math.sin(Date.now() / (700 + s * 60) + s)) * 0.3;
        ctx.fillStyle = `rgba(200, 255, 200, ${twinkle})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Blood moon with pulsing glow
      const moonPulse = 0.06 + Math.abs(Math.sin(Date.now() / 2000)) * 0.04;
      ctx.fillStyle = `rgba(164, 229, 133, ${moonPulse})`;
      ctx.beginPath();
      ctx.arc(w * 0.85, 32, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(164, 229, 133, 0.12)";
      ctx.beginPath();
      ctx.arc(w * 0.85, 32, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(200, 255, 200, 0.2)";
      ctx.beginPath();
      ctx.arc(w * 0.85, 32, 12, 0, Math.PI * 2);
      ctx.fill();
      // Moon craters
      ctx.fillStyle = "rgba(100, 150, 100, 0.08)";
      ctx.beginPath();
      ctx.arc(w * 0.85 - 4, 28, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.85 + 5, 35, 2, 0, Math.PI * 2);
      ctx.fill();

      // Dead tree silhouettes
      ctx.fillStyle = "#0a1208";
      ctx.strokeStyle = "rgba(30, 41, 15, 0.6)";
      ctx.lineWidth = 3;
      // Tree 1 (left)
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.82);
      ctx.lineTo(w * 0.12, h * 0.30);
      ctx.lineTo(w * 0.08, h * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.45);
      ctx.lineTo(w * 0.18, h * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.55);
      ctx.lineTo(w * 0.06, h * 0.38);
      ctx.stroke();
      // Tree 2 (right)
      ctx.beginPath();
      ctx.moveTo(w * 0.92, h * 0.82);
      ctx.lineTo(w * 0.92, h * 0.35);
      ctx.lineTo(w * 0.95, h * 0.20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.92, h * 0.50);
      ctx.lineTo(w * 0.87, h * 0.32);
      ctx.stroke();

      // Rolling fog layer (bottom)
      const fogGrad = ctx.createLinearGradient(0, h * 0.70, 0, h * 0.85);
      fogGrad.addColorStop(0, "rgba(74, 222, 128, 0)");
      fogGrad.addColorStop(0.5, "rgba(74, 222, 128, 0.03)");
      fogGrad.addColorStop(1, "rgba(74, 222, 128, 0)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, h * 0.70, w, h * 0.15);
      // Second fog layer (drifting)
      const fogOffset = Math.sin(Date.now() / 3000) * 30;
      ctx.fillStyle = "rgba(74, 222, 128, 0.015)";
      ctx.beginPath();
      ctx.ellipse(w * 0.3 + fogOffset, h * 0.78, 120, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.7 - fogOffset, h * 0.80, 100, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ground floor
      ctx.fillStyle = "#060a04";
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      ctx.strokeStyle = "rgba(74, 222, 128, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.82);
      ctx.lineTo(w, h * 0.82);
      ctx.stroke();

      // Graves and crosses in background
      ctx.fillStyle = "rgba(30, 41, 30, 0.5)";
      ctx.strokeStyle = "rgba(74, 222, 128, 0.06)";
      ctx.lineWidth = 1;
      // Tombstones
      [15, 33, 52, 71, 88].forEach((xPos, idx) => {
        const gx = w * xPos / 100;
        const gh = 15 + (idx * 7) % 10;
        ctx.beginPath();
        ctx.roundRect(gx - 7, h * 0.82 - gh, 14, gh, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();
      });
      // Crosses
      ctx.strokeStyle = "rgba(74, 222, 128, 0.08)";
      ctx.lineWidth = 2;
      [24, 45, 62, 80].forEach((xPos) => {
        const cx = w * xPos / 100;
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.82 - 22);
        ctx.lineTo(cx, h * 0.82 - 4);
        ctx.moveTo(cx - 6, h * 0.82 - 16);
        ctx.lineTo(cx + 6, h * 0.82 - 16);
        ctx.stroke();
      });

      // Fireflies / glowing particles
      for (let f = 0; f < 8; f++) {
        const fx = (w * 0.2) + (f * 91 + Math.sin(Date.now() / (500 + f * 100) + f) * 20) % (w * 0.6);
        const fy = h * 0.40 + Math.sin(Date.now() / (400 + f * 80) + f * 3) * 25;
        const fa = 0.1 + Math.abs(Math.sin(Date.now() / (300 + f * 70) + f)) * 0.25;
        ctx.fillStyle = `rgba(74, 222, 128, ${fa})`;
        ctx.shadowColor = "#4ade80";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ─── DRAW PLAYER SURVIVOR ───
      ctx.save();
      ctx.translate(45, h * 0.82 - 32);

      // Neon glow
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 10;

      // Legs/Combat boots
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(-5, 26);
      ctx.moveTo(3, 10);
      ctx.lineTo(4, 26);
      ctx.stroke();

      // Heavy Body Armor Torso
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-8, -10, 16, 20, 3);
      ctx.fill();
      ctx.stroke();
      
      // Armor plate lines
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.moveTo(-8, 4);
      ctx.lineTo(8, 4);
      ctx.stroke();

      // Commander Helmet with tactical visor
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Visor glow
      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-2, -21);
      ctx.lineTo(6, -20);
      ctx.stroke();
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 10;

      // Gun aiming logic
      const currentZombieIdx = wordIndex - visibleStart;
      const targetZombieX = w * (zombieXPositions[currentZombieIdx] ?? 80) / 100;
      const angle = Math.atan2(0, targetZombieX - 45); // horizontal aim

      ctx.save();
      ctx.translate(2, -4);
      ctx.rotate(angle);
      
      // Heavy Plasma Rifle Stock & Battery Pack
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-8, -2, 10, 5, 1);
      ctx.fill();
      ctx.stroke();
      
      // Barrel
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(22, 0);
      ctx.stroke();
      
      // Scope
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(4, -4, 6, 2);
      
      // Underbarrel battery glow
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#22c55e";
      ctx.shadowBlur = 6;
      ctx.fillRect(10, 1, 8, 2);
      
      // Muzzle tip
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(22, -1.5, 2.5, 3);
      ctx.restore();

      ctx.restore();

      // ─── DRAW ZOMBIES ───
      visibleWords.forEach((word, i) => {
        const absIdx = visibleStart + i;
        if (absIdx < wordIndex) return; // dead

        const xPct = zombieXPositions[i];
        if (xPct < 0) return;
        const zx = w * xPct / 100;
        const zy = h * 0.82;

        const isTarget = absIdx === wordIndex;
        const walkCycle = Math.sin(Date.now() / 120 + i * 5) * 2;

        ctx.save();
        ctx.translate(zx, zy + walkCycle);

        // Zombie silhouette
        const color = ZOMBIE_COLORS[absIdx % ZOMBIE_COLORS.length];
        
        ctx.shadowColor = color;
        ctx.shadowBlur = isTarget ? 12 : 4;
        
        // Decaying zombie legs
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(-7, 6);
        ctx.moveTo(4, -6);
        ctx.lineTo(1, 6);
        ctx.stroke();
        
        // Ragged clothes torso
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, -22);
        ctx.lineTo(7, -22);
        ctx.lineTo(5, -6);
        ctx.lineTo(-5, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Rib cage decay detail
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.lineTo(4, -14);
        ctx.moveTo(-3, -10);
        ctx.lineTo(3, -10);
        ctx.stroke();

        // Decay skull head
        ctx.fillStyle = `${color}20`;
        ctx.beginPath();
        ctx.arc(0, -32, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Hollow glowing eyes
        ctx.fillStyle = isTarget ? "#ff3333" : "#00ff00";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(-3, -33, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -33, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = isTarget ? 12 : 4;

        // Ragged outstretched claw arms
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(-6, -18);
        ctx.lineTo(-18, -16);
        ctx.lineTo(-24, -20); // claw tip
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(6, -18);
        ctx.lineTo(-12, -12);
        ctx.lineTo(-18, -7); // claw tip
        ctx.stroke();

        // Draw text tag — typed part in neon green, remaining in red/grey
        ctx.shadowBlur = 0;
        ctx.font = "bold 11px monospace";
        const typedLen = isTarget ? Math.min(currentInput.length, word.length) : 0;
        const typedPart = word.slice(0, typedLen);
        const remainPart = word.slice(typedLen);
        const fullW = ctx.measureText(word).width;
        let xCur = -fullW / 2;
        ctx.textAlign = "left";
        if (typedPart) {
          ctx.fillStyle = "#39FF14";
          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 5;
          ctx.fillText(typedPart, xCur, -48);
          xCur += ctx.measureText(typedPart).width;
        }
        ctx.fillStyle = isTarget ? "#ff7777" : "rgba(255,255,255,0.50)";
        ctx.shadowColor = isTarget ? "#ff5555" : "transparent";
        ctx.shadowBlur = isTarget ? 3 : 0;
        ctx.fillText(remainPart, xCur, -48);
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // ─── BULLET TRACERS ───
      ctx.strokeStyle = "rgba(74, 222, 128, 0.85)";
      ctx.shadowColor = "#4ade80";
      ctx.lineWidth = 2;
      bulletsRef.current.forEach(b => {
        b.life++;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      bulletsRef.current = bulletsRef.current.filter(b => b.life < b.maxLife);

      // ─── SPLAT PARTICLES ───
      splatsRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life++;
        p.alpha = 1 - (p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      splatsRef.current = splatsRef.current.filter(p => p.life < p.maxLife);

      ctx.restore(); // screen shake
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [wordIndex, currentInput, visibleWords, zombieXPositions, screenShake, visibleStart]);

  const currentWord = words[wordIndex] ?? "";
  const progress = (wordIndex / Math.max(words.length, 1)) * 100;
  const wave = Math.ceil((wordIndex + 1) / Math.max(1, Math.ceil(words.length / 3)));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD Metrics */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/60 border border-red-500/30 rounded-xl px-3 py-1.5">
          <Heart className="w-4 h-4 text-red-500" />
          <span className="font-mono font-bold text-white">{playerHp}</span>
          <span className="text-xs text-white/40">HP</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <Skull className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-sm text-white">{wordIndex} eliminated</span>
        </div>
        <div className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-orange-400 font-bold">WAVE {wave}</span>
        </div>
        <div className="bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-yellow-300 font-bold">{comboStreak}x STREAK</span>
        </div>
        <div className="bg-red-500/15 border border-red-500/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-red-300">{mistakeCount} errors</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-red-400">HP</span>
        <div className="flex-1 h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
            animate={{ width: `${playerHp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/40">{playerHp}/100</span>
      </div>

      {/* Graveyard canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-[200px] block"
        />

        {/* Laser weapon warning glow */}
        {targetZombiePressure > 0.4 && (
          <div className="absolute inset-0 border border-red-500/30 animate-pulse pointer-events-none z-10" />
        )}
      </div>

      {/* Typing box */}
      <div className="bg-gray-900/90 border border-red-500/20 rounded-2xl p-5 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400/70">
          <Skull className="w-3.5 h-3.5 text-emerald-400" />
          <span>INCOMING HORDE — shoot down targets!</span>
          <span className="ml-auto text-white/30">{words.length - wordIndex} targets left</span>
        </div>

        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-wider select-none py-1">
          {currentWord.split("").map((ch: string, i: number) => {
            let cls = "text-white/20";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch ? "text-emerald-400 drop-shadow-[0_0_6px_#34d399]" : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-white border-b-2 border-red-400 animate-pulse";
            }
            return (
              <span key={i} className={`transition-colors duration-75 ${cls}`}>
                {ch}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
