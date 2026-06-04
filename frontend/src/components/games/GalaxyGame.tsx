import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Zap, Shield, Star } from "lucide-react";
import { soundEffects } from "@/lib/audio";

const SHIP_COLS = 5;
const SHIP_ROWS = 2;
const ALIEN_COLORS = ["#67e8f9", "#a78bfa", "#86efac", "#fb923c", "#f472b6"];

interface StarData {
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface Particle {
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

interface LaserBolt {
  x: number;
  y: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
}

export function GalaxyGame({
  words,
  wordIndex,
  currentInput,
  wpm,
  accuracy,
  targetWpm,
  lastWordCorrect,
  elapsedSeconds,
  startTime,
  comboStreak,
  mistakeCount,
  submissionCount,
}: ArcadeProps) {
  const [shieldHp, setShieldHp] = useState(100);
  const [score, setScore] = useState(0);
  const [screenFlash, setScreenFlash] = useState(false);
  const prevSubmission = useRef(submissionCount);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<StarData[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lasersRef = useRef<LaserBolt[]>([]);

  const progress = (wordIndex / Math.max(words.length, 1)) * 100;

  // Ship grid calculations
  const gridSize = SHIP_COLS * SHIP_ROWS;
  const gridStart = Math.floor(wordIndex / gridSize) * gridSize;
  const gridWords = words.slice(gridStart, gridStart + gridSize);

  const timeRatio = startTime ? Math.min(elapsedSeconds / targetSeconds(), 1) : 0;
  const descentPct = timeRatio * 26; // alien descent limit (0-26% Y position)

  function targetSeconds() {
    const avgLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
    const chars = words.length * (avgLen + 1);
    return (chars / (targetWpm * 5)) * 60;
  }

  const shipLayout = useMemo(() =>
    gridWords.map((word, i) => ({
      word,
      absIdx: gridStart + i,
      col: i % SHIP_COLS,
      row: Math.floor(i / SHIP_COLS),
      color: ALIEN_COLORS[i % ALIEN_COLORS.length],
    })),
    [gridStart, gridWords.join(",")]
  );

  // Initialize stars once
  useEffect(() => {
    const stars: StarData[] = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 180,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  // Handle combat triggers
  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    if (lastWordCorrect) {
      setScore(s => s + 10);
      soundEffects.playLaser();
      setTimeout(() => soundEffects.playExplosion(), 120);

      // Find alien position for explosion coordinates
      const currentAbsIdx = wordIndex - 1;
      const shipInGrid = currentAbsIdx - gridStart;
      if (shipInGrid >= 0 && shipInGrid < gridSize) {
        const col = shipInGrid % SHIP_COLS;
        const row = Math.floor(shipInGrid / SHIP_COLS);
        const alienX = 800 * ((col + 0.5) / SHIP_COLS);
        const alienY = 20 + descentPct + (row * 35);

        // Fire dual lasers from ship at (400, 155) to target (alienX, alienY)
        lasersRef.current.push({ x: 388, y: 155, vy: -7, color: "#67e8f9", life: 0, maxLife: 30 });
        lasersRef.current.push({ x: 412, y: 155, vy: -7, color: "#67e8f9", life: 0, maxLife: 30 });

        // Giant explosion particles
        for (let k = 0; k < 20; k++) {
          particlesRef.current.push({
            x: alienX,
            y: alienY + 10,
            vx: (Math.random() * 8 - 4) * 1.2,
            vy: (Math.random() * 8 - 4) * 1.2,
            size: Math.random() * 4 + 2,
            color: ALIEN_COLORS[currentAbsIdx % ALIEN_COLORS.length],
            alpha: 1,
            life: 0,
            maxLife: 25 + Math.random() * 15,
          });
        }
      }
    } else {
      const dmg = 8;
      setShieldHp(h => Math.max(h - dmg, 0));
      setScreenFlash(true);
      soundEffects.playError();
      setTimeout(() => setScreenFlash(false), 250);
    }
  }, [lastWordCorrect, submissionCount, wordIndex, gridStart, descentPct, gridSize]);

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

      // Draw space sky
      ctx.fillStyle = "#04040e";
      ctx.fillRect(0, 0, w, h);

      // Draw & Scroll Stars
      ctx.fillStyle = "#ffffff";
      starsRef.current.forEach(star => {
        star.y = (star.y + star.speed) % h;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Screen Flash overlay
      if (screenFlash) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
        ctx.fillRect(0, 0, w, h);
      }

      // ─── DRAW ALIEN SHIPS ───
      const currentAbsIdx = wordIndex;

      shipLayout.forEach(({ word, absIdx, col, row, color }) => {
        const isTarget = absIdx === currentAbsIdx;
        const isDestroyed = absIdx < currentAbsIdx;

        if (isDestroyed) return; // don't draw blown up ships

        const alienX = w * ((col + 0.5) / SHIP_COLS);
        const alienY = 20 + descentPct + (row * 35);
        const floatOffset = Math.sin(Date.now() / 200 + col) * 1.5;

        ctx.save();
        ctx.translate(alienX, alienY + floatOffset);

        // Draw saucer body
        ctx.shadowColor = color;
        ctx.shadowBlur = isTarget ? 14 : 4;
        
        // Detailed outer ring
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 2, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dome cockpit
        ctx.fillStyle = `${color}40`;
        ctx.beginPath();
        ctx.arc(0, -2, 8, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        
        // Inner glowing core
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = isTarget ? 14 : 4;

        // Rotating outer neon indicators
        ctx.fillStyle = "#ffffff";
        const rotateOffset = (Date.now() / 250) + col;
        const lx1 = Math.cos(rotateOffset) * 13;
        const ly1 = Math.sin(rotateOffset) * 2 + 2;
        const lx2 = Math.cos(rotateOffset + Math.PI) * 13;
        const ly2 = Math.sin(rotateOffset + Math.PI) * 2 + 2;
        ctx.beginPath();
        ctx.arc(lx1, ly1, 2, 0, Math.PI * 2);
        ctx.arc(lx2, ly2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Target bounding glow
        if (isTarget) {
          ctx.strokeStyle = "rgba(103, 232, 249, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw alien word tag
        ctx.shadowBlur = 0;
        ctx.fillStyle = isTarget ? "#67e8f9" : "rgba(255, 255, 255, 0.25)";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(isTarget ? currentInput + (word.slice(currentInput.length) ? "_" : "") : word, 0, 14);

        ctx.restore();
      });

      // ─── DRAW LASERS ───
      ctx.lineWidth = 2.5;
      lasersRef.current.forEach(l => {
        l.y += l.vy;
        l.life++;

        ctx.strokeStyle = l.color;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y - 12);
        ctx.stroke();
      });
      lasersRef.current = lasersRef.current.filter(l => l.life < l.maxLife && l.y > 0);

      // ─── EXPLOSION PARTICLES ───
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
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
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // ─── DRAW PLAYER SPACESHIP ───
      ctx.save();
      ctx.translate(400, 155);

      // Engine thrusters (Dual left and right wings)
      const flameH1 = 8 + Math.random() * 10;
      const flameH2 = 8 + Math.random() * 10;
      const thrusterGrad1 = ctx.createLinearGradient(-8, 2, -8, flameH1);
      thrusterGrad1.addColorStop(0, "#22d3ee");
      thrusterGrad1.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = thrusterGrad1;
      ctx.fillRect(-10, 1, 4, flameH1);
      
      const thrusterGrad2 = ctx.createLinearGradient(8, 2, 8, flameH2);
      thrusterGrad2.addColorStop(0, "#22d3ee");
      thrusterGrad2.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = thrusterGrad2;
      ctx.fillRect(6, 1, 4, flameH2);

      // Ship body (Detailed cyberpunk space fighter)
      ctx.strokeStyle = "#22d3ee";
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#22d3ee";
      ctx.lineWidth = 2.2;
      
      ctx.beginPath();
      ctx.moveTo(0, -22); // Nose cone tip
      ctx.lineTo(4, -12); // nose side right
      ctx.lineTo(16, 2);   // wingtip right
      ctx.lineTo(8, -1);   // wing inner notch right
      ctx.lineTo(5, 1);    // thruster edge right
      ctx.lineTo(-5, 1);   // thruster edge left
      ctx.lineTo(-8, -1);  // wing inner notch left
      ctx.lineTo(-16, 2);  // wingtip left
      ctx.lineTo(-4, -12); // nose side left
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit shield cover (neon white/cyan visor)
      ctx.fillStyle = "rgba(34, 211, 238, 0.45)";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-3, -11);
      ctx.lineTo(3, -11);
      ctx.lineTo(4, -4);
      ctx.lineTo(-4, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shield dome ripple overlay
      if (screenFlash) {
        ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -3, 24, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [wordIndex, currentInput, shipLayout, descentPct, screenFlash]);

  const currentWord = words[wordIndex] ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD Metrics */}
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
        <div className="bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-yellow-300 font-bold">{comboStreak}x STREAK</span>
        </div>
        <div className="bg-red-500/15 border border-red-500/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-red-300">{mistakeCount} errors</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
      </div>

      {/* Shield Bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-cyan-400">SHIELD</span>
        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            animate={{ width: `${shieldHp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/30">{shieldHp}/100</span>
      </div>

      {/* Space Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          width={800}
          height={180}
          className="w-full h-[180px] block"
        />

        {/* Fleet landing warning alert bar */}
        {descentPct > 15 && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/20 border-b border-red-500/30 text-red-400 text-center font-mono text-[9px] py-0.5 animate-pulse select-none z-10">
            ⚠️ WARNING: ALIEN FLEET APPROACHING DEFENSE LINE ⚠️
          </div>
        )}
      </div>

      {/* Typing box */}
      <div className="bg-[#050518]/90 border border-cyan-500/20 rounded-2xl p-5 space-y-3 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/60">
          <Zap className="w-3 h-3" />
          <span>FIRE SEQUENCE — type to shoot energy bolts!</span>
          <span className="ml-auto text-white/25">{words.length - wordIndex} fleet targets left</span>
        </div>

        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest select-none py-1">
          {currentWord.split("").map((ch: string, i: number) => {
            let cls = "text-white/20";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch ? "text-cyan-300 drop-shadow-[0_0_6px_#67e8f9]" : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-white border-b-2 border-cyan-400 animate-pulse";
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
