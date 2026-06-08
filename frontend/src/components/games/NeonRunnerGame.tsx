import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Zap, Heart, Trophy } from "lucide-react";
import { soundEffects } from "@/lib/audio";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  word: string;
  wordIdx: number;
  cleared: boolean;
  color: string;
  type: "wall" | "platform" | "gate";
}

interface FloatingParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  alpha: number; life: number; maxLife: number;
}

interface ScorePopup {
  x: number; y: number;
  text: string; color: string;
  alpha: number; life: number; maxLife: number;
}

const OBS_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"];

const GROUND_Y = 185;
const PLAYER_X = 80;

export function NeonRunnerGame({
  words, wordIndex, currentInput, wpm, accuracy,
  targetWpm, lastWordCorrect, startTime, elapsedSeconds,
  comboStreak, mistakeCount, submissionCount, progress,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const popupsRef = useRef<ScorePopup[]>([]);
  const prevSubmission = useRef(submissionCount);
  const bgOffsetRef = useRef(0);
  const groundOffsetRef = useRef(0);
  const cityOffsetRef = useRef(0);
  const obsIdRef = useRef(0);
  const starsRef = useRef<{ x: number; y: number; s: number }[]>([]);

  const [hp, setHp] = useState(100);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(GROUND_Y);
  const [isJumping, setIsJumping] = useState(false);
  const playerYRef = useRef(GROUND_Y);
  const jumpVelRef = useRef(0);
  const isJumpingRef = useRef(false);
  const collisionCooldownRef = useRef(0);

  const [screenShake, setScreenShake] = useState(false);
  // Stable refs — keep animation loop from restarting on every prop change
  const wordIndexRef    = useRef(wordIndex);    wordIndexRef.current    = wordIndex;
  const currentInputRef = useRef(currentInput); currentInputRef.current = currentInput;
  const startTimeRef    = useRef(startTime);    startTimeRef.current    = startTime;
  const screenShakeRef  = useRef(screenShake);  screenShakeRef.current  = screenShake;
  const scrollSpeedRef  = useRef(0);

  // Init stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * (GROUND_Y - 60),
      s: Math.random() * 1.5 + 0.3,
    }));
  }, []);

  // Spawn obstacle for current word
  useEffect(() => {
    if (!startTime) return;
    const existing = obstaclesRef.current.find(o => o.wordIdx === wordIndex && !o.cleared);
    if (existing) return;

    const type = (wordIndex % 3 === 0) ? "gate" : (wordIndex % 3 === 1) ? "wall" : "platform";
    const color = OBS_COLORS[wordIndex % OBS_COLORS.length];
    const word = words[wordIndex] ?? "";
    const baseH = type === "platform" ? 22 : 60 + word.length * 2;
    const baseY = type === "platform" ? GROUND_Y - 45 : GROUND_Y - baseH;

    obstaclesRef.current.push({
      id: obsIdRef.current++,
      x: 820,
      y: baseY,
      w: Math.max(60, word.length * 14),
      h: baseH,
      word,
      wordIdx: wordIndex,
      cleared: false,
      color,
      type,
    });
  }, [wordIndex, startTime, words]);

  // Obstacle scroll speed
  const scrollSpeed = startTime ? 2.5 + (wpm / targetWpm) * 1.8 : 0;
  scrollSpeedRef.current = scrollSpeed;

  // Handle word correct/wrong
  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmission.current) return;
    prevSubmission.current = submissionCount;

    const obs = obstaclesRef.current.find(o => o.wordIdx === wordIndex - 1);

    if (lastWordCorrect) {
      soundEffects.playClick(true);
      // Jump!
      jumpVelRef.current = -9;
      isJumpingRef.current = true;
      setIsJumping(true);
      setScore(s => s + 10 + comboStreak * 2);

      if (obs) {
        obs.cleared = true;
        // Burst particles
        for (let k = 0; k < 18; k++) {
          particlesRef.current.push({
            x: obs.x + obs.w / 2,
            y: obs.y + obs.h / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.8) * 7,
            size: Math.random() * 4 + 2,
            color: obs.color,
            alpha: 1, life: 0, maxLife: 25 + Math.random() * 15,
          });
        }
        popupsRef.current.push({
          x: obs.x + obs.w / 2, y: obs.y - 10,
          text: `+${10 + comboStreak * 2}`,
          color: "#4ade80",
          alpha: 1, life: 0, maxLife: 30,
        });
      }
    } else {
      soundEffects.playError();
      const dmg = 8 + Math.floor(comboStreak / 2);
      setHp(h => Math.max(h - dmg, 0));
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 280);

      if (obs) {
        popupsRef.current.push({
          x: obs.x + obs.w / 2, y: obs.y - 10,
          text: `-${dmg}HP`,
          color: "#f87171",
          alpha: 1, life: 0, maxLife: 30,
        });
      }
    }
  }, [lastWordCorrect, submissionCount, wordIndex, comboStreak, targetWpm]);

  // Canvas resize — make canvas match CSS display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastFrameT = 0;

    const render = (ts: number) => {
      // Frame-rate independent delta time (capped at 50ms = 20fps minimum)
      const dt = Math.min(ts - (lastFrameT || ts), 50);
      lastFrameT = ts;
      const DT = dt / 16.667; // normalize: 1.0 = 60fps, 0.46 = 144fps
      const t = Date.now();

      const w = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const h = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      // Physics update — frame-rate independent
      if (isJumpingRef.current) {
        jumpVelRef.current += 0.55 * DT; // gravity (normalized to 60fps)
        playerYRef.current += jumpVelRef.current * DT;
        if (playerYRef.current >= GROUND_Y) {
          playerYRef.current = GROUND_Y;
          jumpVelRef.current = 0;
          isJumpingRef.current = false;
          setIsJumping(false);
        }
        setPlayerY(playerYRef.current);
      }

      // ── Real obstacle–player collision detection ─────────────────────
      if (startTimeRef.current && Date.now() > collisionCooldownRef.current) {
        const collY = playerYRef.current;
        const pLeft  = PLAYER_X - 16;
        const pRight = PLAYER_X + 16;
        const pTop   = collY - 40;
        const pBot   = collY + 6;
        for (const obs of obstaclesRef.current) {
          if (!obs.cleared
              && obs.x < pRight && obs.x + obs.w > pLeft
              && obs.y < pBot   && obs.y + obs.h > pTop) {
            obs.cleared = true;
            collisionCooldownRef.current = Date.now() + 900;
            setHp(h => Math.max(h - 15, 0));
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 320);
            // Collision particles burst
            for (let pk = 0; pk < 12; pk++) {
              particlesRef.current.push({
                x: PLAYER_X + (Math.random() * 20 - 10),
                y: collY - 20 + (Math.random() * 20 - 10),
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.8) * 6,
                size: Math.random() * 3 + 1.5,
                color: obs.color,
                alpha: 1, life: 0, maxLife: 22 + Math.random() * 12,
              });
            }
            break;
          }
        }
      }

      // Scroll backgrounds — frame-rate independent
      if (startTimeRef.current) {
        bgOffsetRef.current = (bgOffsetRef.current + scrollSpeedRef.current * 0.15 * DT) % 800;
        groundOffsetRef.current = (groundOffsetRef.current + scrollSpeedRef.current * DT) % 80;
        cityOffsetRef.current = (cityOffsetRef.current + scrollSpeedRef.current * 0.4 * DT) % 800;
      }

      // === SKY GRADIENT ===
      ctx.save();
      if (screenShakeRef.current) {
        const t = ts / 60;
        ctx.translate(Math.sin(t * 2.5) * 2.5, Math.cos(t * 1.8) * 1.8);
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, "#050210");
      skyGrad.addColorStop(0.5, "#0d0520");
      skyGrad.addColorStop(1, "#180a2b");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, GROUND_Y);

      // Stars (parallax slow)
      starsRef.current.forEach(star => {
        const sx = ((star.x - bgOffsetRef.current * 0.5) % w + w) % w;
        const twinkle = 0.2 + Math.abs(Math.sin(t / 600 + star.x * 0.05)) * 0.5;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(sx, star.y, star.s, 0, Math.PI * 2);
        ctx.fill();
      });

      // Moon
      ctx.fillStyle = "rgba(230,200,255,0.12)";
      ctx.beginPath();
      ctx.arc(680, 28, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(230,200,255,0.22)";
      ctx.beginPath();
      ctx.arc(680, 28, 13, 0, Math.PI * 2);
      ctx.fill();

      // Neon city skyline (parallax medium)
      const cityBuildingData = [
        { bx: 0, bh: 55, bw: 22 }, { bx: 28, bh: 38, bw: 16 }, { bx: 50, bh: 70, bw: 24 },
        { bx: 80, bh: 45, bw: 18 }, { bx: 104, bh: 60, bw: 20 }, { bx: 130, bh: 35, bw: 14 },
        { bx: 150, bh: 80, bw: 26 }, { bx: 184, bh: 50, bw: 20 }, { bx: 210, bh: 40, bw: 16 },
        { bx: 232, bh: 65, bw: 22 }, { bx: 260, bh: 55, bw: 18 }, { bx: 284, bh: 42, bw: 14 },
        { bx: 304, bh: 75, bw: 24 }, { bx: 334, bh: 48, bw: 18 }, { bx: 358, bh: 60, bw: 20 },
        { bx: 384, bh: 38, bw: 16 }, { bx: 406, bh: 70, bw: 22 }, { bx: 434, bh: 52, bw: 20 },
        { bx: 460, bh: 45, bw: 16 }, { bx: 482, bh: 68, bw: 24 }, { bx: 512, bh: 40, bw: 18 },
        { bx: 536, bh: 58, bw: 20 }, { bx: 562, bh: 50, bw: 16 }, { bx: 584, bh: 72, bw: 26 },
        { bx: 616, bh: 44, bw: 18 }, { bx: 640, bh: 62, bw: 22 }, { bx: 668, bh: 38, bw: 14 },
        { bx: 688, bh: 55, bw: 20 }, { bx: 714, bh: 70, bw: 24 }, { bx: 744, bh: 45, bw: 18 },
        { bx: 768, bh: 60, bw: 22 },
      ];

      cityBuildingData.forEach(({ bx, bh, bw }) => {
        const cx = ((bx - cityOffsetRef.current) % (w + 100) + w + 100) % (w + 100) - 50;
        const by = GROUND_Y - bh;
        ctx.fillStyle = "#0c051a";
        ctx.fillRect(cx, by, bw, bh);
        // Neon window accents
        for (let wr = 0; wr < Math.floor(bh / 9); wr++) {
          for (let wc = 0; wc < Math.floor(bw / 7); wc++) {
            if ((bx + wr + wc) % 3 !== 0) {
              const winAlpha = 0.08 + Math.abs(Math.sin(t / 1800 + bx * 0.1 + wr)) * 0.15;
              ctx.fillStyle = `rgba(168,85,247,${winAlpha})`;
              ctx.fillRect(cx + wc * 7 + 2, by + wr * 9 + 2, 4, 4);
            }
          }
        }
      });

      // Horizon glow
      const horizGlow = ctx.createLinearGradient(0, GROUND_Y - 30, 0, GROUND_Y);
      horizGlow.addColorStop(0, "rgba(168,85,247,0)");
      horizGlow.addColorStop(1, "rgba(168,85,247,0.12)");
      ctx.fillStyle = horizGlow;
      ctx.fillRect(0, GROUND_Y - 30, w, 30);

      // === GROUND ===
      const gGrad = ctx.createLinearGradient(0, GROUND_Y, 0, h);
      gGrad.addColorStop(0, "#1a0930");
      gGrad.addColorStop(1, "#0d0518");
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, GROUND_Y, w, h - GROUND_Y);

      // Ground grid lines
      ctx.strokeStyle = "rgba(168,85,247,0.25)";
      ctx.lineWidth = 1;
      // Horizontal lines
      for (let gy = 0; gy < 4; gy++) {
        const lineY = GROUND_Y + gy * ((h - GROUND_Y) / 4);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }
      // Vertical scroll lines
      ctx.strokeStyle = "rgba(168,85,247,0.12)";
      for (let gx = 0; gx < w + 80; gx += 80) {
        const lx = ((gx - groundOffsetRef.current) % (w + 80) + w + 80) % (w + 80);
        ctx.beginPath();
        ctx.moveTo(lx, GROUND_Y);
        ctx.lineTo(lx - (h - GROUND_Y) * 0.3, h);
        ctx.stroke();
      }

      // Ground neon line
      ctx.strokeStyle = "rgba(168,85,247,0.6)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(w, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // === OBSTACLES ===
      obstaclesRef.current.forEach(obs => {
        if (!startTimeRef.current) return;
        if (!obs.cleared) obs.x -= scrollSpeedRef.current * DT;

        if (obs.x + obs.w < -50) {
          obs.cleared = true;
          return;
        }

        if (obs.cleared) return;

        const isTarget = obs.wordIdx === wordIndexRef.current;
        const pulseAlpha = isTarget ? 0.25 + Math.abs(Math.sin(t / 300)) * 0.2 : 0.1;

        ctx.save();
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = isTarget ? 18 : 6;

        if (obs.type === "gate") {
          // Two vertical posts with a gap in the middle
          const gateW = 10;
          const gateH = GROUND_Y - obs.y;
          ctx.fillStyle = `${obs.color}20`;
          ctx.strokeStyle = obs.color;
          ctx.lineWidth = 2.5;
          // Left post
          ctx.fillRect(obs.x, obs.y, gateW, gateH);
          ctx.strokeRect(obs.x, obs.y, gateW, gateH);
          // Right post
          ctx.fillRect(obs.x + obs.w - gateW, obs.y, gateW, gateH);
          ctx.strokeRect(obs.x + obs.w - gateW, obs.y, gateW, gateH);
          // Top bar
          ctx.fillRect(obs.x, obs.y, obs.w, 10);
          ctx.strokeRect(obs.x, obs.y, obs.w, 10);

          // Danger warning triangles
          if (isTarget) {
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.w / 2, obs.y - 18);
            ctx.lineTo(obs.x + obs.w / 2 - 8, obs.y - 4);
            ctx.lineTo(obs.x + obs.w / 2 + 8, obs.y - 4);
            ctx.closePath();
            ctx.fill();
          }
        } else if (obs.type === "wall") {
          // Solid wall
          ctx.fillStyle = `${obs.color}15`;
          ctx.strokeStyle = obs.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
          ctx.fill();
          ctx.stroke();
          // Inner grid texture
          ctx.strokeStyle = `${obs.color}30`;
          ctx.lineWidth = 1;
          for (let gry = obs.y + 10; gry < obs.y + obs.h - 5; gry += 12) {
            ctx.beginPath();
            ctx.moveTo(obs.x + 4, gry);
            ctx.lineTo(obs.x + obs.w - 4, gry);
            ctx.stroke();
          }
        } else {
          // Floating platform
          ctx.fillStyle = `${obs.color}25`;
          ctx.strokeStyle = obs.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6);
          ctx.fill();
          ctx.stroke();
          // Glow under platform
          const platGlow = ctx.createLinearGradient(0, obs.y + obs.h, 0, obs.y + obs.h + 16);
          platGlow.addColorStop(0, `${obs.color}30`);
          platGlow.addColorStop(1, `${obs.color}00`);
          ctx.fillStyle = platGlow;
          ctx.fillRect(obs.x + 4, obs.y + obs.h, obs.w - 8, 16);
        }

        ctx.shadowBlur = 0;

        // Word label: typed (neon green) + remaining (red/dimmed)
        ctx.font = `bold ${isTarget ? 11 : 10}px monospace`;
        const labelY = obs.type === "platform" ? obs.y - 8 : obs.y + obs.h / 2 + 4;
        const word = obs.word;
        const typedLen = isTarget ? Math.min(currentInputRef.current.length, word.length) : 0;
        const typedPart = word.slice(0, typedLen);
        const remainPart = word.slice(typedLen);
        const fullW = ctx.measureText(word).width;
        let xCur = obs.x + obs.w / 2 - fullW / 2;
        ctx.textAlign = "left";
        if (typedPart) {
          ctx.fillStyle = "#39FF14";
          ctx.shadowColor = "#39FF14";
          ctx.shadowBlur = 5;
          ctx.fillText(typedPart, xCur, labelY);
          xCur += ctx.measureText(typedPart).width;
        }
        ctx.fillStyle = isTarget ? "#ff9999" : `${obs.color}80`;
        ctx.shadowColor = isTarget ? "#ff5555" : obs.color;
        ctx.shadowBlur = isTarget ? 4 : 0;
        ctx.fillText(remainPart, xCur, labelY);
        ctx.textAlign = "center";
        ctx.shadowBlur = 0;
        ctx.restore();
      });
      obstaclesRef.current = obstaclesRef.current.filter(o => !o.cleared || o.wordIdx >= wordIndexRef.current);

      // === PLAYER CHARACTER ===
      const py = playerYRef.current;
      ctx.save();
      ctx.translate(PLAYER_X, py);

      const jumpOff = py < GROUND_Y - 2;
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 14;

      // Shadow under player
      if (!jumpOff) {
        ctx.fillStyle = "rgba(168,85,247,0.15)";
        ctx.beginPath();
        ctx.ellipse(0, 4, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Legs (running animation)
      const runCycle = jumpOff ? 0 : Math.sin(t / 90) * 12;
      const runCycle2 = jumpOff ? 0 : Math.sin(t / 90 + Math.PI) * 12;
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-4, -4);
      ctx.lineTo(-4 + runCycle * 0.4, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, -4);
      ctx.lineTo(4 + runCycle2 * 0.4, 10);
      ctx.stroke();

      // Torso
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-10, -26, 20, 22, 3);
      ctx.fill();
      ctx.stroke();

      // Chest glow
      const chestGrad = ctx.createRadialGradient(0, -16, 0, 0, -16, 8);
      chestGrad.addColorStop(0, "rgba(168,85,247,0.6)");
      chestGrad.addColorStop(1, "rgba(168,85,247,0)");
      ctx.fillStyle = chestGrad;
      ctx.beginPath();
      ctx.arc(0, -16, 8, 0, Math.PI * 2);
      ctx.fill();

      // Head/Helmet
      ctx.fillStyle = "rgba(15,23,42,0.95)";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, -36, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Visor
      ctx.strokeStyle = "#e0aaff";
      ctx.shadowColor = "#e0aaff";
      ctx.shadowBlur = 5;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, -38);
      ctx.lineTo(8, -36);
      ctx.stroke();
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 14;

      // Arm (punching forward when correct)
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -22);
      ctx.lineTo(jumpOff ? 20 : 16, jumpOff ? -26 : -18);
      ctx.stroke();

      // Jump trail sparkles
      if (jumpOff) {
        for (let jp = 0; jp < 4; jp++) {
          const jx = (Math.random() - 0.5) * 12;
          const jy = 10 + Math.random() * 15;
          ctx.fillStyle = `rgba(168,85,247,${0.3 - jp * 0.07})`;
          ctx.beginPath();
          ctx.arc(jx, jy, 2.5 - jp * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // === PARTICLES === (frame-rate independent)
      particlesRef.current.forEach(p => {
        p.x += p.vx * DT; p.y += p.vy * DT; p.vy += 0.18 * DT;
        p.life++; p.alpha = 1 - (p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // === SCORE POPUPS === (frame-rate independent)
      popupsRef.current.forEach(pop => {
        pop.y -= 1 * DT; pop.life++;
        pop.alpha = 1 - (pop.life / pop.maxLife);
        ctx.save();
        ctx.globalAlpha = pop.alpha;
        ctx.fillStyle = pop.color;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = pop.color;
        ctx.shadowBlur = 6;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      });
      popupsRef.current = popupsRef.current.filter(p => p.life < p.maxLife);

      ctx.restore(); // screen shake

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [words]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentWord = words[wordIndex] ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-black/70 border border-purple-500/30 rounded-xl px-3 py-1.5">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="font-mono font-bold text-white">{hp}</span>
          <span className="text-xs text-white/40">HP</span>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-yellow-300">{score}</span>
        </div>
        <div className="bg-yellow-400/15 border border-yellow-400/25 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-yellow-300 font-bold">{comboStreak}x STREAK</span>
        </div>
        <div className="bg-black/70 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-white/50">{accuracy}% acc</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-black/70 border border-purple-500/25 rounded-xl px-3 py-1.5">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
      </div>

      {/* HP bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-purple-400">RUNNER</span>
        <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
          <motion.div
            className={`h-full rounded-full ${hp > 50 ? "bg-gradient-to-r from-purple-500 to-violet-400" : hp > 25 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-red-600 to-red-400"}`}
            animate={{ width: `${hp}%` }}
            transition={{ type: "spring", stiffness: 80 }}
          />
        </div>
        <span className="text-xs font-mono text-white/30">{hp}/100</span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/20">
        <canvas
          ref={canvasRef}
          className="w-full h-[220px] block"
          style={{ imageRendering: "crisp-edges" }}
        />
        {!startTime && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-purple-400/60 font-mono text-sm animate-pulse">
              🏃 Type words to jump over obstacles in the neon city!
            </p>
          </div>
        )}
        {hp <= 20 && (
          <div className="absolute inset-0 border-2 border-red-500/40 animate-pulse pointer-events-none rounded-2xl" />
        )}
      </div>

      {/* Typing box */}
      <div className="bg-gray-950/95 border border-purple-500/20 rounded-2xl p-5 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400/70">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>NEON RUN — type words to jump obstacles!</span>
          <span className="ml-auto text-white/25">{words.length - wordIndex} obstacles left</span>
        </div>

        <div className="flex items-center justify-center gap-0.5 font-mono text-2xl md:text-3xl font-bold tracking-widest py-1">
          {currentWord.split("").map((ch, i) => {
            let cls = "text-white/20";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch
                ? "text-purple-300 drop-shadow-[0_0_6px_#c084fc]"
                : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-white border-b-2 border-purple-400 animate-pulse";
            }
            return (
              <span key={i} className={`transition-colors duration-75 ${cls}`}>{ch}</span>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          {words.slice(wordIndex + 1, wordIndex + 3).map((word, i) => (
            <span key={i} className="font-mono text-xs text-white/20">{word}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
