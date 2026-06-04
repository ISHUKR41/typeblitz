import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Zap, Flag, Shield, Volume2, VolumeX } from "lucide-react";
import { soundEffects } from "@/lib/audio";

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

export function RacingGame({
  words,
  wordIndex,
  currentInput,
  wpm,
  accuracy,
  progress,
  targetWpm,
  startTime,
  lastWordCorrect,
  elapsedSeconds,
  comboStreak,
  mistakeCount,
  submissionCount,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roadOffsetRef = useRef(0);
  const curveRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const prevSubmissionRef = useRef(submissionCount);

  // Ghost progress calculation
  const [ghostPos, setGhostPos] = useState(0);
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;

  useEffect(() => {
    if (!startTime) return;
    const pos = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
    setGhostPos(pos);
  }, [elapsedSeconds, targetSeconds, startTime]);

  // Audio trigger on submission
  useEffect(() => {
    if (submissionCount === prevSubmissionRef.current) return;
    prevSubmissionRef.current = submissionCount;
    if (lastWordCorrect) {
      soundEffects.playEngineRev();
    } else {
      soundEffects.playTireScreech();
    }
  }, [submissionCount, lastWordCorrect]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dynamic speed based on WPM
      const speed = startTime ? (wpm / 15) + 2 : 1;
      roadOffsetRef.current = (roadOffsetRef.current + speed) % 200;
      curveRef.current = Math.sin(Date.now() / 2000) * 0.4; // scrolling road curves

      // 1. Draw Sky (Dark Cyberpunk Gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, "#090514");
      skyGrad.addColorStop(1, "#180a2b");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 30; i++) {
        const sx = (i * 127 + 53) % w;
        const sy = (i * 37 + 11) % (h * 0.35);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Horizon glow
      const glowGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.45);
      glowGrad.addColorStop(0, "rgba(236, 72, 153, 0)");
      glowGrad.addColorStop(1, "rgba(236, 72, 153, 0.15)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, h * 0.35, w, h * 0.1);

      // 2. Draw ground (cyberpunk grid lines)
      ctx.fillStyle = "#0c051a";
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // 3. Draw Pseudo 3D Road
      const roadH = h * 0.55;
      const horizonY = h * 0.45;

      const segments = 24;
      for (let i = segments; i > 0; i--) {
        const y1 = horizonY + Math.pow((i - 1) / segments, 2.5) * roadH;
        const y2 = horizonY + Math.pow(i / segments, 2.5) * roadH;
        const w1 = w * 0.08 + Math.pow((i - 1) / segments, 2.5) * w * 0.5;
        const w2 = w * 0.08 + Math.pow(i / segments, 2.5) * w * 0.5;

        // Apply curve offset
        const curveOffset1 = Math.sin(((i - 1) / segments) * Math.PI + Date.now() / 1500) * curveRef.current * 40;
        const curveOffset2 = Math.sin((i / segments) * Math.PI + Date.now() / 1500) * curveRef.current * 40;

        const x1 = w / 2 + curveOffset1;
        const x2 = w / 2 + curveOffset2;

        const isEven = Math.floor((roadOffsetRef.current + i * 25) / 50) % 2 === 0;

        // Draw Road Segment
        ctx.fillStyle = isEven ? "#1b112d" : "#130a22";
        ctx.beginPath();
        ctx.moveTo(x1 - w1 / 2, y1);
        ctx.lineTo(x2 - w2 / 2, y2);
        ctx.lineTo(x2 + w2 / 2, y2);
        ctx.lineTo(x1 + w1 / 2, y1);
        ctx.fill();

        // Draw Road Shoulders (Red/White stripes)
        ctx.fillStyle = isEven ? "#ec4899" : "#ffffff";
        const shoulderW1 = w1 * 0.05;
        const shoulderW2 = w2 * 0.05;
        ctx.beginPath();
        ctx.moveTo(x1 - w1 / 2 - shoulderW1, y1);
        ctx.lineTo(x2 - w2 / 2 - shoulderW2, y2);
        ctx.lineTo(x2 - w2 / 2, y2);
        ctx.lineTo(x1 - w1 / 2, y1);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x1 + w1 / 2, y1);
        ctx.lineTo(x2 + w2 / 2, y2);
        ctx.lineTo(x2 + w2 / 2 + shoulderW2, y2);
        ctx.lineTo(x1 + w1 / 2 + shoulderW1, y1);
        ctx.fill();

        // Draw center dashed lines
        if (isEven && i > 4) {
          ctx.fillStyle = "#eab308";
          const centerW1 = w1 * 0.02;
          const centerW2 = w2 * 0.02;
          ctx.beginPath();
          ctx.moveTo(x1 - centerW1 / 2, y1);
          ctx.lineTo(x2 - centerW2 / 2, y2);
          ctx.lineTo(x2 + centerW2 / 2, y2);
          ctx.lineTo(x1 + centerW1 / 2, y1);
          ctx.fill();
        }
      }

      // 4. Emit Particles from player car exhaust
      if (startTime) {
        const emitCount = wpm > 40 ? 3 : 1;
        for (let k = 0; k < emitCount; k++) {
          particlesRef.current.push({
            x: w * 0.35 + (Math.random() * 8 - 4),
            y: h * 0.8 + 10,
            vx: -speed * 0.5 - Math.random() * 3,
            vy: (Math.random() * 2 - 1) * 0.8,
            size: Math.random() * 4 + 2,
            color: comboStreak >= 4 ? "#38bdf8" : "#ec4899", // Blue nitrox or pink smoke
            alpha: 1,
            life: 0,
            maxLife: 20 + Math.random() * 15,
          });
        }
      }

      // Update and Draw Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - (p.life / p.maxLife);
        p.size += 0.2; // expand smoke

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Filter out dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // 5. Draw Competitor (Ghost Car)
      // Ghost's lane is slightly offset right, player's lane slightly offset left
      const relativeGhostProgress = ghostPos;
      const relativePlayerProgress = progress;

      // Position relative to player: if player is ahead, ghost is further back on canvas
      const ghostDelta = relativeGhostProgress - relativePlayerProgress; // positive if ghost is ahead
      const ghostYScale = Math.min(Math.max((ghostDelta + 100) / 200, 0.1), 1.0); // 3D projection Y position
      
      const ghostY = horizonY + Math.pow(ghostYScale, 1.8) * roadH;
      const ghostSizeW = 20 + Math.pow(ghostYScale, 2) * 50;
      const ghostSizeH = 10 + Math.pow(ghostYScale, 2) * 22;
      const ghostRoadW = w * 0.08 + Math.pow(ghostYScale, 2.5) * w * 0.5;
      const ghostCurveOffset = Math.sin((ghostYScale) * Math.PI + Date.now() / 1500) * curveRef.current * 40;
      // Ghost rides slightly to the right side of the lane center
      const ghostX = w / 2 + ghostCurveOffset + ghostRoadW * 0.15;

      if (ghostYScale > 0.15 && ghostYScale < 0.98) {
        ctx.save();
        ctx.globalAlpha = 0.5; // Translucent ghost car
        ctx.fillStyle = "#94a3b8"; // Gray neon outline
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        // Draw ghost car box
        ctx.beginPath();
        ctx.roundRect(ghostX - ghostSizeW / 2, ghostY - ghostSizeH, ghostSizeW, ghostSizeH, 4);
        ctx.fill();
        ctx.stroke();
        // Tail lights
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(ghostX - ghostSizeW / 2 + 3, ghostY - ghostSizeH + 2, 4, 3);
        ctx.fillRect(ghostX + ghostSizeW / 2 - 7, ghostY - ghostSizeH + 2, 4, 3);
        // Tag
        ctx.fillStyle = "#ffffff";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GHOST", ghostX, ghostY - ghostSizeH - 4);
        ctx.restore();
      }

      // 6. Draw Player Car (YOU)
      // Player Y position is stable at bottom road scale (85%)
      const playerYScale = 0.85;
      const playerY = horizonY + Math.pow(playerYScale, 1.8) * roadH;
      const playerSizeW = 20 + Math.pow(playerYScale, 2) * 55;
      const playerSizeH = 10 + Math.pow(playerYScale, 2) * 24;
      const playerRoadW = w * 0.08 + Math.pow(playerYScale, 2.5) * w * 0.5;
      const playerCurveOffset = Math.sin((playerYScale) * Math.PI + Date.now() / 1500) * curveRef.current * 40;
      // Player rides slightly to the left side of the lane center
      const playerX = w / 2 + playerCurveOffset - playerRoadW * 0.15;

      ctx.save();
      // Drift/shake effect based on WPM
      const shakeX = startTime ? (Math.random() * 2 - 1) * (wpm / 60) : 0;
      const shakeY = startTime ? (Math.random() * 1.5 - 0.75) * (wpm / 60) : 0;

      ctx.translate(playerX + shakeX, playerY + shakeY);

      // Nitro booster exhaust fire
      if (comboStreak >= 4) {
        const fireGrad = ctx.createLinearGradient(0, 0, 0, 15);
        fireGrad.addColorStop(0, "#38bdf8");
        fireGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 18 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(15, 0);
        ctx.lineTo(10, 18 + Math.random() * 8);
        ctx.closePath();
        ctx.fill();
      }

      // Main body (cyberpunk sports car)
      ctx.fillStyle = "rgba(168, 85, 247, 0.9)"; // Purple neon body
      ctx.strokeStyle = "#a855f7";
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-playerSizeW / 2, -playerSizeH, playerSizeW, playerSizeH, 6);
      ctx.fill();
      ctx.stroke();

      // Windshield (cyan glow)
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.roundRect(-playerSizeW * 0.35, -playerSizeH * 0.8, playerSizeW * 0.7, playerSizeH * 0.35, 2);
      ctx.fill();

      // Tail lights (bright red neon)
      ctx.fillStyle = "#ff2222";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#ff0000";
      ctx.fillRect(-playerSizeW / 2 + 4, -playerSizeH * 0.7, 8, 4);
      ctx.fillRect(playerSizeW / 2 - 12, -playerSizeH * 0.7, 8, 4);

      // Wheels
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-playerSizeW / 2 - 2, -playerSizeH * 0.45, 3, playerSizeH * 0.4);
      ctx.fillRect(playerSizeW / 2 - 1, -playerSizeH * 0.45, 3, playerSizeH * 0.4);

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [wpm, progress, ghostPos, startTime, comboStreak]);

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 4);
  const isAhead = progress > ghostPos;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD Bar */}
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
          <div className="rounded-xl px-3 py-2 text-xs font-bold font-mono bg-yellow-400/15 text-yellow-300 border border-yellow-400/25">
            {comboStreak}x STREAK
          </div>
          <div
            className={`rounded-xl px-3 py-2 text-xs font-bold font-mono ${
              isAhead
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {isAhead ? "▲ AHEAD" : "▼ BEHIND"}
          </div>
        </div>
        <div className="font-mono text-sm text-white/50">
          {wordIndex} / {words.length} words · {mistakeCount} mistakes
        </div>
      </div>

      {/* Render Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="w-full h-[220px] block"
        />
        {/* Flag finish tag overlay */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-70 pointer-events-none">
          <Flag className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_#34d399] animate-bounce" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 mt-1">FINISH</span>
        </div>
      </div>

      {/* Word typing tray */}
      <div className="bg-gray-900/85 border border-white/10 rounded-2xl p-5 md:p-7 space-y-4 shadow-inner">
        {!startTime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-yellow-400/70 font-mono text-sm"
          >
            ⌨ Start typing to accelerate your racer!
          </motion.p>
        )}

        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest select-none">
          {currentWord.split("").map((ch, i) => {
            let cls = "text-white/20";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch ? "text-emerald-400 drop-shadow-[0_0_6px_#34d399]" : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-white border-b-2 border-yellow-400 animate-pulse";
            }
            return (
              <span key={i} className={`transition-all duration-75 ${cls}`}>
                {ch}
              </span>
            );
          })}
        </div>

        {/* Next words */}
        <div className="flex items-center justify-center gap-4">
          {nextWords.map((w, i) => (
            <span key={i} className="font-mono text-sm text-white/20">{w}</span>
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex justify-between text-xs text-white/30 font-mono px-1">
        <span>Target speed: {targetWpm} WPM</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
}
