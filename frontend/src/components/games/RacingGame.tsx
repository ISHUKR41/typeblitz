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

interface RoadsideObject {
  z: number;
  side: "left" | "right";
  type: "palm" | "sign" | "barrier" | "lamp";
  label?: string;
  phase: number;
  speed: number;
}

interface RainDrop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  len: number;
  alpha: number;
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
  const roadsideObjectsRef = useRef<RoadsideObject[]>([]);
  const rainRef = useRef<RainDrop[]>([]);
  const lastSpawnRef = useRef(0);
  const prevSubmissionRef = useRef(submissionCount);
  const wordIndexRef = useRef(wordIndex);
  wordIndexRef.current = wordIndex;
  const currentInputRef = useRef(currentInput);
  currentInputRef.current = currentInput;
  const wpmRef = useRef(wpm);
  wpmRef.current = wpm;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const ghostPosRef = useRef(0);
  const startTimeRef = useRef(startTime);
  startTimeRef.current = startTime;
  const comboStreakRef = useRef(comboStreak);
  comboStreakRef.current = comboStreak;

  // Ghost progress calculation
  const [ghostPos, setGhostPos] = useState(0);
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / Math.max(words.length, 1);
  const totalChars = words.length * (avgWordLen + 1);
  const targetSeconds = (totalChars / (targetWpm * 5)) * 60;

  useEffect(() => {
    if (!startTime) return;
    const pos = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
    setGhostPos(pos);
    ghostPosRef.current = pos;
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

  // Responsive canvas sizing — match internal resolution to display width
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => { const cw = parent.clientWidth; if (cw > 0) canvas.width = cw; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastFrameT = 0;

    const render = (ts: number) => {
      const dt = Math.min(ts - (lastFrameT || ts), 50);
      lastFrameT = ts;
      const DT = dt / 16.667;
      const w = canvas.width;
      const h = canvas.height;

      // Dynamic speed based on WPM (frame-rate independent)
      const speed = startTimeRef.current ? (wpmRef.current / 15) + 2 : 1;
      roadOffsetRef.current = (roadOffsetRef.current + speed * DT) % 200;
      curveRef.current = Math.sin(Date.now() / 2000) * 0.4; // scrolling road curves

      // 1. Draw Sky (Dark Cyberpunk Gradient with aurora band)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, "#050210");
      skyGrad.addColorStop(0.4, "#0d0520");
      skyGrad.addColorStop(0.7, "#180a2b");
      skyGrad.addColorStop(1, "#1a0e30");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Stars (twinkling with varying brightness)
      for (let i = 0; i < 45; i++) {
        const sx = (i * 127 + 53) % w;
        const sy = (i * 37 + 11) % (h * 0.32);
        const twinkle = 0.2 + Math.abs(Math.sin(Date.now() / (500 + i * 80) + i)) * 0.6;
        const starSize = (i % 3 === 0) ? 2 : 1.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
        ctx.fillRect(sx, sy, starSize, starSize);
      }

      // Distant mountain range silhouette
      ctx.fillStyle = "#0f0720";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      for (let mx = 0; mx <= w; mx += 8) {
        const peak = Math.sin(mx / 90) * 14 + Math.sin(mx / 45 + 2) * 8 + Math.sin(mx / 20) * 4;
        ctx.lineTo(mx, h * 0.38 - peak);
      }
      ctx.lineTo(w, h * 0.45);
      ctx.closePath();
      ctx.fill();

      // Closer mountain range (darker)
      ctx.fillStyle = "#0a0418";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      for (let mx = 0; mx <= w; mx += 6) {
        const peak = Math.sin(mx / 60 + 1) * 10 + Math.sin(mx / 30 + 3) * 6;
        ctx.lineTo(mx, h * 0.42 - peak);
      }
      ctx.lineTo(w, h * 0.45);
      ctx.closePath();
      ctx.fill();

      // Neon city skyline buildings at horizon
      ctx.fillStyle = "#0c0620";
      const buildings = [40, 90, 130, 180, 240, 310, 360, 420, 480, 530, 580, 640, 700, 750];
      buildings.forEach((bx, bi) => {
        const bw = 12 + (bi * 7) % 18;
        const bh = 8 + (bi * 13) % 20;
        ctx.fillRect(bx, h * 0.45 - bh, bw, bh);
        // Tiny window lights
        ctx.fillStyle = `rgba(168, 85, 247, ${0.15 + Math.sin(Date.now() / 800 + bi) * 0.1})`;
        for (let wy = 2; wy < bh - 2; wy += 4) {
          for (let wx = 2; wx < bw - 2; wx += 4) {
            if ((bi + wx + wy) % 3 !== 0) ctx.fillRect(bx + wx, h * 0.45 - bh + wy, 1.5, 1.5);
          }
        }
        ctx.fillStyle = "#0c0620";
      });

      // Aurora/horizon glow
      const glowGrad = ctx.createLinearGradient(0, h * 0.33, 0, h * 0.45);
      glowGrad.addColorStop(0, "rgba(168, 85, 247, 0)");
      glowGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.08)");
      glowGrad.addColorStop(1, "rgba(236, 72, 153, 0.18)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, h * 0.33, w, h * 0.12);

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

      // 3.5 ROADSIDE OBJECTS — 3D perspective palm trees, neon signs, lamp posts, barriers
      const now3 = Date.now();
      const spawnInterval = Math.max(420 - speed * 28, 110);
      if (now3 - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now3;
        const SIGN_LABELS = ["NITRO", "SPEED", "APEX", "RUSH", "TURBO", "ULTRA", "BLITZ", "ZONE"];
        const types: RoadsideObject["type"][] = ["palm", "palm", "sign", "barrier", "lamp"];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        ["left", "right"].forEach((side, si) => {
          if (Math.random() > 0.45 || chosenType === "sign") {
            roadsideObjectsRef.current.push({
              z: 0.02,
              side: side as "left" | "right",
              type: chosenType,
              label: chosenType === "sign" ? SIGN_LABELS[Math.floor(Math.random() * SIGN_LABELS.length)] : undefined,
              phase: Math.random() * Math.PI * 2 + si,
              speed: 0.008 + speed * 0.0035,
            });
          }
        });
      }

      // Update z positions
      roadsideObjectsRef.current = roadsideObjectsRef.current
        .map(obj => ({ ...obj, z: obj.z + obj.speed }))
        .filter(obj => obj.z <= 1.25);

      // Draw roadside objects sorted far-to-near
      [...roadsideObjectsRef.current].sort((a, b) => a.z - b.z).forEach(obj => {
        const objZ = obj.z;
        const roadWAtZ = w * 0.08 + Math.pow(objZ, 2.5) * w * 0.5;
        const curveOff = Math.sin(objZ * Math.PI + Date.now() / 1500) * curveRef.current * 40;
        const roadCX = w / 2 + curveOff;
        const sc = Math.pow(objZ, 1.6);
        const screenY = horizonY + Math.pow(objZ, 2.5) * roadH;
        const edgePad = roadWAtZ * 0.06 + 2;
        const screenX = obj.side === "left"
          ? roadCX - roadWAtZ / 2 - edgePad - sc * 10
          : roadCX + roadWAtZ / 2 + edgePad + sc * 10;

        ctx.save();
        ctx.translate(screenX, screenY);

        if (obj.type === "palm") {
          const trunkH = 30 * sc;
          // Neon underglow
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 8 * sc;
          ctx.fillStyle = "rgba(168,85,247,0.4)";
          ctx.fillRect(-1.5 * sc, -2, 3 * sc, 3);
          ctx.shadowBlur = 0;
          // Trunk
          ctx.fillStyle = "#2d1b0e";
          ctx.fillRect(-1.5 * sc, -trunkH, 3 * sc, trunkH);
          // Fronds
          for (let fi = 0; fi < 5; fi++) {
            const ang = (fi / 5) * Math.PI * 2 + obj.phase + Date.now() / 3000;
            ctx.strokeStyle = `rgba(${obj.side === "left" ? "80,180,80" : "60,160,60"},${0.6 + sc * 0.4})`;
            ctx.lineWidth = 1.2 * sc;
            ctx.beginPath();
            ctx.moveTo(0, -trunkH);
            ctx.quadraticCurveTo(
              Math.cos(ang) * 9 * sc, -trunkH - 4 * sc,
              Math.cos(ang) * 13 * sc, -trunkH + Math.sin(ang) * 3 * sc
            );
            ctx.stroke();
          }
        } else if (obj.type === "sign") {
          const bw = 24 * sc;
          const bh = 11 * sc;
          const bxOff = obj.side === "left" ? -bw - 2 : 2;
          // Pole
          ctx.fillStyle = "#334155";
          ctx.fillRect(-sc, -22 * sc, 2 * sc, 22 * sc);
          // Board glow
          ctx.shadowColor = "#818cf8";
          ctx.shadowBlur = 7 * sc;
          ctx.fillStyle = "#1e1b4b";
          ctx.strokeStyle = "#818cf8";
          ctx.lineWidth = 1.5 * sc;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bxOff, -30 * sc, bw, bh, 2 * sc);
          else ctx.rect(bxOff, -30 * sc, bw, bh);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          if (sc > 0.28 && obj.label) {
            ctx.fillStyle = "#a5b4fc";
            ctx.font = `bold ${Math.max(Math.floor(5.5 * sc), 6)}px monospace`;
            ctx.textAlign = "center";
            ctx.fillText(obj.label, bxOff + bw / 2, -30 * sc + bh * 0.7);
          }
        } else if (obj.type === "lamp") {
          const poleH = 26 * sc;
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5 * sc;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -poleH);
          ctx.lineTo((obj.side === "left" ? -1 : 1) * 5 * sc, -poleH - 5 * sc);
          ctx.stroke();
          // Lamp bulb
          ctx.fillStyle = `rgba(250,220,80,${0.5 + sc * 0.5})`;
          ctx.shadowColor = "#facc14";
          ctx.shadowBlur = 10 * sc;
          ctx.beginPath();
          ctx.arc((obj.side === "left" ? -1 : 1) * 5 * sc, -poleH - 5 * sc, 2.5 * sc, 0, Math.PI * 2);
          ctx.fill();
          // Light cone
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.08 * sc;
          ctx.fillStyle = "#facc14";
          ctx.beginPath();
          ctx.moveTo((obj.side === "left" ? -1 : 1) * 5 * sc, -poleH - 5 * sc);
          ctx.lineTo((obj.side === "left" ? -1 : 1) * 5 * sc - 12 * sc, -1);
          ctx.lineTo((obj.side === "left" ? -1 : 1) * 5 * sc + 12 * sc, -1);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          // Barrier / guardrail
          const gw = 20 * sc;
          const gh = 6 * sc;
          const bxOff = obj.side === "left" ? -gw - 3 : 3;
          ctx.fillStyle = "#0f172a";
          ctx.strokeStyle = "#ec4899";
          ctx.lineWidth = sc;
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 5 * sc;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bxOff, -gh, gw, gh, sc);
          else ctx.rect(bxOff, -gh, gw, gh);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Reflector dots
          ctx.fillStyle = "#fbbf24";
          for (let di = 0; di < 3; di++) {
            ctx.beginPath();
            ctx.arc(bxOff + (di + 0.5) * (gw / 3), -gh / 2, sc * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });

      // RAIN EFFECT — appears when WPM > 65
      if (startTime && wpm > 65) {
        const intensity = Math.min((wpm - 65) / 40, 1);
        for (let ri = 0; ri < Math.floor(intensity * 5); ri++) {
          rainRef.current.push({
            x: Math.random() * w, y: 0,
            vy: 14 + Math.random() * 9,
            vx: 1.5 + Math.random() * 2,
            len: 10 + Math.random() * 14,
            alpha: 0.08 + intensity * 0.18,
          });
        }
        rainRef.current = rainRef.current.filter(r => r.y < h + 20);
        rainRef.current.forEach(r => {
          r.x += r.vx; r.y += r.vy;
          ctx.save();
          ctx.globalAlpha = r.alpha;
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x + r.vx * 1.8, r.y + r.len);
          ctx.stroke();
          ctx.restore();
        });
      } else {
        rainRef.current = [];
      }

      // Speed motion-blur streaks — appear at WPM > 40, intensify with speed
      if (startTime && wpm > 40) {
        const intensity = Math.min((wpm - 40) / 60, 1);
        ctx.save();
        ctx.globalAlpha = intensity * 0.13;
        ctx.strokeStyle = "#c7d2fe";
        ctx.lineWidth = 0.7;
        const streakCount = Math.floor(intensity * 16) + 5;
        for (let si = 0; si < streakCount; si++) {
          const seed = (si * 137 + Math.floor(roadOffsetRef.current / 6)) % 1000;
          const sx = (seed / 1000) * w;
          const sy = horizonY + (((si * 67) % 100) / 100) * roadH;
          const len = 18 + intensity * 40;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - len, sy + 0.5);
          ctx.stroke();
        }
        ctx.restore();
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
            color: comboStreakRef.current >= 4 ? "#38bdf8" : "#ec4899", // Blue nitrox or pink smoke
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
      const relativeGhostProgress = ghostPosRef.current;
      const relativePlayerProgress = progressRef.current;

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
        ctx.globalAlpha = 0.55; // Translucent ghost car
        ctx.fillStyle = "rgba(30, 41, 59, 0.7)"; 
        ctx.strokeStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.5;
        // Draw ghost car outline
        ctx.beginPath();
        ctx.moveTo(ghostX - ghostSizeW * 0.45, ghostY);
        ctx.lineTo(ghostX - ghostSizeW * 0.48, ghostY - ghostSizeH * 0.3);
        ctx.lineTo(ghostX - ghostSizeW * 0.42, ghostY - ghostSizeH * 0.7);
        ctx.lineTo(ghostX - ghostSizeW * 0.3, ghostY - ghostSizeH * 0.88);
        ctx.lineTo(ghostX - ghostSizeW * 0.15, ghostY - ghostSizeH * 0.95);
        ctx.lineTo(ghostX + ghostSizeW * 0.15, ghostY - ghostSizeH * 0.95);
        ctx.lineTo(ghostX + ghostSizeW * 0.3, ghostY - ghostSizeH * 0.88);
        ctx.lineTo(ghostX + ghostSizeW * 0.42, ghostY - ghostSizeH * 0.7);
        ctx.lineTo(ghostX + ghostSizeW * 0.48, ghostY - ghostSizeH * 0.3);
        ctx.lineTo(ghostX + ghostSizeW * 0.45, ghostY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ghost Tail lights
        ctx.fillStyle = "#ef4444";
        ctx.shadowBlur = 4;
        ctx.fillRect(ghostX - ghostSizeW * 0.4, ghostY - ghostSizeH * 0.55, ghostSizeW * 0.15, 2.5);
        ctx.fillRect(ghostX + ghostSizeW * 0.25, ghostY - ghostSizeH * 0.55, ghostSizeW * 0.15, 2.5);

        // Tag
        ctx.fillStyle = "#38bdf8";
        ctx.shadowBlur = 0;
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("OPPONENT", ghostX, ghostY - ghostSizeH - 6);
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
      // Smooth speed-vibration using sinusoidal oscillation (not random — eliminates jitter)
      const shakeIntensity = startTimeRef.current ? Math.min(wpmRef.current / 200, 0.7) : 0;
      const shakeX = shakeIntensity > 0 ? Math.sin(ts * 0.027) * Math.cos(ts * 0.019) * shakeIntensity * 1.5 : 0;
      const shakeY = shakeIntensity > 0 ? Math.sin(ts * 0.021) * Math.cos(ts * 0.013) * shakeIntensity * 0.8 : 0;

      ctx.translate(playerX + shakeX, playerY + shakeY);

      // Underglow neon (purple glow under car)
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(168, 85, 247, 0.12)";
      ctx.beginPath();
      ctx.ellipse(0, 2, playerSizeW * 0.6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Nitro booster exhaust fire (dual jets)
      if (comboStreakRef.current >= 4) {
        const flameLen1 = 16 + Math.random() * 12;
        const flameLen2 = 14 + Math.random() * 10;
        // Left exhaust
        const fireGrad1 = ctx.createLinearGradient(-12, 0, -12, flameLen1);
        fireGrad1.addColorStop(0, "#38bdf8");
        fireGrad1.addColorStop(0.4, "#818cf8");
        fireGrad1.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = fireGrad1;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, flameLen1);
        ctx.closePath();
        ctx.fill();
        // Right exhaust
        const fireGrad2 = ctx.createLinearGradient(12, 0, 12, flameLen2);
        fireGrad2.addColorStop(0, "#38bdf8");
        fireGrad2.addColorStop(0.4, "#818cf8");
        fireGrad2.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = fireGrad2;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(16, 0);
        ctx.lineTo(12, flameLen2);
        ctx.closePath();
        ctx.fill();
      } else if (startTime) {
        // Normal exhaust puff
        ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
        ctx.beginPath();
        ctx.arc(-12, 4 + Math.random() * 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, 4 + Math.random() * 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wheels (visible from behind)
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      // Left wheel
      ctx.beginPath();
      ctx.roundRect(-playerSizeW / 2 - 3, -playerSizeH * 0.6, 5, playerSizeH * 0.5, 1);
      ctx.fill();
      ctx.stroke();
      // Right wheel
      ctx.beginPath();
      ctx.roundRect(playerSizeW / 2 - 2, -playerSizeH * 0.6, 5, playerSizeH * 0.5, 1);
      ctx.fill();
      ctx.stroke();

      // Main body (aerodynamic sports car shape)
      ctx.fillStyle = "rgba(139, 92, 246, 0.92)";
      ctx.strokeStyle = "#a855f7";
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Car body silhouette - viewed from behind
      ctx.moveTo(-playerSizeW * 0.45, 0);  // bottom-left
      ctx.lineTo(-playerSizeW * 0.48, -playerSizeH * 0.3); // fender curve
      ctx.lineTo(-playerSizeW * 0.42, -playerSizeH * 0.7); // pillar
      ctx.lineTo(-playerSizeW * 0.3, -playerSizeH * 0.88); // roof start
      ctx.lineTo(-playerSizeW * 0.15, -playerSizeH * 0.95); // roof peak
      ctx.lineTo(playerSizeW * 0.15, -playerSizeH * 0.95);  // roof peak
      ctx.lineTo(playerSizeW * 0.3, -playerSizeH * 0.88);   // roof end
      ctx.lineTo(playerSizeW * 0.42, -playerSizeH * 0.7);   // pillar
      ctx.lineTo(playerSizeW * 0.48, -playerSizeH * 0.3);   // fender
      ctx.lineTo(playerSizeW * 0.45, 0);  // bottom-right
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windshield (cyan gradient glow)
      ctx.shadowBlur = 0;
      const windshieldGrad = ctx.createLinearGradient(0, -playerSizeH * 0.92, 0, -playerSizeH * 0.65);
      windshieldGrad.addColorStop(0, "rgba(34, 211, 238, 0.9)");
      windshieldGrad.addColorStop(1, "rgba(34, 211, 238, 0.4)");
      ctx.fillStyle = windshieldGrad;
      ctx.beginPath();
      ctx.roundRect(-playerSizeW * 0.25, -playerSizeH * 0.9, playerSizeW * 0.5, playerSizeH * 0.25, 3);
      ctx.fill();

      // Rear spoiler
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(-playerSizeW * 0.38, -playerSizeH * 0.96, playerSizeW * 0.76, 2);
      // Spoiler wing supports
      ctx.fillRect(-playerSizeW * 0.3, -playerSizeH * 0.96, 2, -3);
      ctx.fillRect(playerSizeW * 0.28, -playerSizeH * 0.96, 2, -3);

      // Tail lights (bright red LED strips with glow)
      ctx.fillStyle = "#ff2222";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff0000";
      ctx.beginPath();
      ctx.roundRect(-playerSizeW * 0.44, -playerSizeH * 0.55, playerSizeW * 0.18, 3, 1);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(playerSizeW * 0.26, -playerSizeH * 0.55, playerSizeW * 0.18, 3, 1);
      ctx.fill();

      // Center brake light strip
      ctx.fillStyle = "#ef4444";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(-playerSizeW * 0.12, -playerSizeH * 0.72, playerSizeW * 0.24, 2, 1);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // ── Word overlay panel on road ──────────────────────────────────
      const cw = words[wordIndexRef.current] ?? "";
      if (cw) {
        const inp = currentInputRef.current;
        ctx.font = "bold 20px 'Courier New', monospace";
        const totalWordW = ctx.measureText(cw).width;
        const panelW = Math.max(totalWordW + 60, 220);
        const panelH = 58;
        const panelX = (w - panelW) / 2;
        const panelY = h - 76;
        ctx.fillStyle = "rgba(5,5,20,0.84)";
        ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, panelH, 10); ctx.fill();
        ctx.strokeStyle = "rgba(168,85,247,0.65)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(panelX, panelY, panelW, panelH, 10); ctx.stroke();
        ctx.font = "10px monospace"; ctx.fillStyle = "#a855f7"; ctx.textAlign = "center";
        ctx.fillText("▸ TYPE TO ACCELERATE", w / 2, panelY + 14);
        ctx.font = "bold 20px 'Courier New', monospace";
        const chars = cw.split("");
        let cx3 = w / 2 - totalWordW / 2;
        ctx.textAlign = "left";
        for (let ci = 0; ci < chars.length; ci++) {
          const isTyped = ci < inp.length;
          const correct = isTyped && inp[ci] === chars[ci];
          ctx.fillStyle = isTyped ? (correct ? "#39FF14" : "#FF2079") : "#e2e8f0";
          ctx.shadowBlur = correct ? 10 : 0; ctx.shadowColor = "#39FF14";
          ctx.fillText(chars[ci], cx3, panelY + 42);
          cx3 += ctx.measureText(chars[ci]).width;
        }
        ctx.shadowBlur = 0; ctx.textAlign = "center";
      }
      // ───────────────────────────────────────────────────────────────

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          height={260}
          className="w-full h-[260px] block"
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
