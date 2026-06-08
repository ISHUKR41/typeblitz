import { useEffect, useRef } from "react";
import type { ArcadeProps } from "./ArcadeArena";
import { soundEffects } from "@/lib/audio";

interface Alien { word: string; col: number; row: number; alive: boolean; hue: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }
interface Laser { x: number; y: number; ty: number; life: number; col: string }
interface Star { x: number; y: number; r: number; a: number; speed: number }

const COLS_A = 4;
const ROWS_A = 3;

function buildWave(words: string[], startIdx: number): Alien[] {
  const aliens: Alien[] = [];
  for (let row = 0; row < ROWS_A; row++) {
    for (let col = 0; col < COLS_A; col++) {
      const widx = startIdx + row * COLS_A + col;
      aliens.push({ word: words[widx] ?? "type", col, row, alive: true, hue: 160 + row * 40 });
    }
  }
  return aliens;
}

export function WordInvadersGame({
  words, wordIndex, currentInput, wpm, accuracy,
  lastWordCorrect, submissionCount, comboStreak,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordIdxRef = useRef(wordIndex);
  wordIdxRef.current = wordIndex;
  const currentInputRef = useRef(currentInput);
  currentInputRef.current = currentInput;

  const stateRef = useRef({
    aliens: buildWave(words, 0),
    particles: [] as Particle[],
    lasers: [] as Laser[],
    stars: Array.from({ length: 120 }, (): Star => ({
      x: Math.random() * 800, y: Math.random() * 500,
      r: Math.random() * 1.5 + 0.3, a: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.3 + 0.1,
    })),
    descentY: 0,
    descentTimer: 0,
    lives: 3,
    score: 0,
    wave: 1,
    screenShake: 0,
    flashTimer: 0,
  });
  const prevSubRef = useRef(submissionCount);

  useEffect(() => {
    const s = stateRef.current;
    s.aliens = buildWave(words, 0);
  }, []);

  function getTarget(aliens: Alien[]): Alien | null {
    const alive = aliens.filter(a => a.alive);
    if (!alive.length) return null;
    const maxRow = Math.max(...alive.map(a => a.row));
    const bottomRow = alive.filter(a => a.row === maxRow);
    return bottomRow.reduce((a, b) => a.col < b.col ? a : b);
  }

  useEffect(() => {
    if (submissionCount === prevSubRef.current) return;
    prevSubRef.current = submissionCount;
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;

    const target = getTarget(s.aliens);
    if (!target) return;

    const margin = 80, slotW = (W - margin * 2) / COLS_A;
    const topPad = 80, slotH = 90;
    const tx = margin + target.col * slotW + slotW / 2;
    const ty = topPad + target.row * slotH + slotH / 2 + s.descentY;
    const px = W / 2, py = H - 55;

    if (lastWordCorrect && target.word === (words[wordIdxRef.current - 1] ?? "")) {
      s.lasers.push({ x: px, y: py, ty, life: 1, col: `hsl(${target.hue},100%,65%)` });
      target.alive = false;
      s.score += target.word.length * 15 * Math.max(1, comboStreak);
      s.screenShake = 8;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        s.particles.push({ x: tx, y: ty, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, color: `hsl(${target.hue},100%,65%)`, size: 3 + Math.random() * 4 });
      }
      const aliveLeft = s.aliens.filter(a => a.alive);
      if (aliveLeft.length === 0) {
        s.wave++;
        s.descentY = 0;
        s.descentTimer = 0;
        s.aliens = buildWave(words, wordIdxRef.current);
      }
    } else {
      s.screenShake = 4;
      s.flashTimer = 8;
    }
  }, [submissionCount, lastWordCorrect, words, comboStreak]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const drawUFO = (ctx: CanvasRenderingContext2D, cx: number, cy: number, hue: number, pulsePh: number, isTarget: boolean, alive: boolean) => {
      if (!alive) return;
      const t = Date.now() / 1000;
      const bob = Math.sin(t * 2 + pulsePh) * 3;
      const cy2 = cy + bob;
      const grd = ctx.createRadialGradient(cx, cy2 - 5, 4, cx, cy2, 28);
      grd.addColorStop(0, `hsla(${hue},100%,75%,0.9)`);
      grd.addColorStop(1, `hsla(${hue},100%,40%,0.6)`);

      if (isTarget) {
        ctx.shadowBlur = 22; ctx.shadowColor = "#ffee00";
        ctx.strokeStyle = "rgba(255,238,0,0.85)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy2, 36, 18, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = grd; ctx.shadowBlur = 18; ctx.shadowColor = `hsl(${hue},100%,60%)`;
      ctx.beginPath(); ctx.ellipse(cx, cy2, 28, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(${hue},80%,80%,0.8)`;
      ctx.beginPath(); ctx.ellipse(cx, cy2 - 8, 14, 9, 0, Math.PI, Math.PI * 2); ctx.fill();
      const lights = [{ dx: -14, dc: "#ff4444" }, { dx: 0, dc: "#ffffff" }, { dx: 14, dc: "#44ff88" }];
      for (const l of lights) {
        ctx.fillStyle = l.dc; ctx.shadowBlur = 8; ctx.shadowColor = l.dc;
        ctx.beginPath(); ctx.arc(cx + l.dx, cy2 + 10, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      const W = canvas.width, H = canvas.height;
      const t = Date.now() / 1000;

      s.descentTimer++;
      const descentInterval = Math.max(120, 400 - wpm * 3);
      if (s.descentTimer >= descentInterval) {
        s.descentTimer = 0;
        s.descentY += 35;
        if (s.descentY > H - 160) {
          s.lives = Math.max(0, s.lives - 1);
          s.descentY = 0;
          s.descentTimer = 0;
          s.aliens = s.aliens.map(a => ({ ...a, alive: true }));
        }
      }

      const sx = s.screenShake > 0 ? (Math.random() - 0.5) * s.screenShake : 0;
      const sy = s.screenShake > 0 ? (Math.random() - 0.5) * s.screenShake : 0;
      if (s.screenShake > 0) s.screenShake -= 0.8;

      ctx.save(); ctx.translate(sx, sy);

      ctx.fillStyle = "#01010d";
      ctx.fillRect(-10, -10, W + 20, H + 20);

      for (const star of s.stars) {
        ctx.globalAlpha = star.a * (0.8 + Math.sin(t + star.x) * 0.2);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
        star.y += star.speed;
        if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
      }
      ctx.globalAlpha = 1;

      if (s.flashTimer > 0) {
        ctx.fillStyle = `rgba(255,50,50,${s.flashTimer / 80})`;
        ctx.fillRect(0, 0, W, H);
        s.flashTimer--;
      }

      const margin = 80, slotW = (W - margin * 2) / COLS_A;
      const topPad = 80, slotH = 90;
      const target = getTarget(s.aliens);

      for (const alien of s.aliens) {
        if (!alien.alive) continue;
        const ax = margin + alien.col * slotW + slotW / 2;
        const ay = topPad + alien.row * slotH + slotH / 2 + s.descentY;
        const isTarget = target === alien;
        drawUFO(ctx, ax, ay, alien.hue, alien.col + alien.row * 3, isTarget, true);
        ctx.font = `${isTarget ? "bold " : ""}11px 'Courier New', monospace`;
        const tw = ctx.measureText(alien.word).width;
        const bx = ax - tw / 2 - 8, bw = tw + 16, bh = 18;
        ctx.fillStyle = isTarget ? "rgba(57,255,20,0.13)" : "rgba(100,100,200,0.15)";
        ctx.strokeStyle = isTarget ? "rgba(57,255,20,0.75)" : "rgba(100,100,255,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx, ay + 20, bw, bh, 4); ctx.fill(); ctx.stroke();
        if (isTarget) {
          const inp = currentInputRef.current;
          const chars = alien.word.split("");
          ctx.textAlign = "left";
          let cx2 = ax - tw / 2;
          for (let ci = 0; ci < chars.length; ci++) {
            const isTyped = ci < inp.length;
            ctx.fillStyle = isTyped ? (inp[ci] === chars[ci] ? "#39FF14" : "#FF2079") : "#ffee00";
            ctx.shadowBlur = isTyped && inp[ci] === chars[ci] ? 8 : 0;
            ctx.shadowColor = "#39FF14";
            ctx.fillText(chars[ci], cx2, ay + 33);
            cx2 += ctx.measureText(chars[ci]).width;
          }
          ctx.shadowBlur = 0; ctx.textAlign = "center";
        } else {
          ctx.fillStyle = "#aaccff";
          ctx.textAlign = "center"; ctx.fillText(alien.word, ax, ay + 33);
        }
      }

      s.lasers = s.lasers.filter(l => l.life > 0);
      for (const laser of s.lasers) {
        const px = laser.x;
        ctx.globalAlpha = laser.life;
        ctx.strokeStyle = laser.col; ctx.lineWidth = 3;
        ctx.shadowBlur = 16; ctx.shadowColor = laser.col;
        ctx.beginPath(); ctx.moveTo(px, laser.y); ctx.lineTo(px, laser.ty); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = "#ffffff";
        ctx.beginPath(); ctx.moveTo(px, laser.y); ctx.lineTo(px, laser.ty); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        laser.life -= 0.06;
      }

      s.particles = s.particles.filter(p => p.life > 0);
      for (const p of s.particles) {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.shadowBlur = 12; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vx *= 0.95; p.vy *= 0.95; p.life -= 0.022;
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      const px2 = W / 2, py2 = H - 55;
      const thruster = Math.sin(t * 8) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(0,150,255,${0.6 + thruster * 0.4})`;
      ctx.shadowBlur = 18; ctx.shadowColor = "#0066ff";
      ctx.beginPath(); ctx.moveTo(px2 - 8, py2 + 18); ctx.lineTo(px2 + 8, py2 + 18); ctx.lineTo(px2, py2 + 30 + thruster * 10); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      const grd2 = ctx.createLinearGradient(px2 - 22, py2 - 22, px2 + 22, py2 + 18);
      grd2.addColorStop(0, "#ffffff"); grd2.addColorStop(1, "#88aaff");
      ctx.fillStyle = grd2; ctx.shadowBlur = 14; ctx.shadowColor = "#4488ff";
      ctx.beginPath(); ctx.moveTo(px2, py2 - 22); ctx.lineTo(px2 + 22, py2 + 18); ctx.lineTo(px2, py2 + 8); ctx.lineTo(px2 - 22, py2 + 18); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;

      const dangerFrac = s.descentY / (H - 160);
      ctx.fillStyle = "rgba(5,5,20,0.8)";
      ctx.beginPath(); ctx.roundRect(8, 8, 210, 56, 8); ctx.fill();
      ctx.strokeStyle = "rgba(80,80,200,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(8, 8, 210, 56, 8); ctx.stroke();
      ctx.fillStyle = "#aaccff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
      ctx.fillText(`👾 Wave ${s.wave} | Score: ${s.score}`, 18, 28);
      ctx.fillStyle = "#ff6666"; ctx.font = "13px monospace";
      ctx.fillText(`Lives: ${"❤️".repeat(s.lives)}  WPM: ${wpm}`, 18, 48);

      if (dangerFrac > 0.6) {
        ctx.fillStyle = `rgba(255,50,50,${(dangerFrac - 0.6) * 0.4})`;
        ctx.font = `bold ${16 + Math.sin(t * 6) * 2}px monospace`;
        ctx.textAlign = "center"; ctx.fillText("⚠ INCOMING!", W / 2, H / 2);
      }

      const descentBarW = W - 20;
      ctx.fillStyle = "rgba(255,50,50,0.15)";
      ctx.fillRect(10, H - 16, descentBarW * dangerFrac, 6);
      ctx.strokeStyle = "rgba(255,100,100,0.3)"; ctx.lineWidth = 1;
      ctx.strokeRect(10, H - 16, descentBarW, 6);

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [words, wpm, accuracy]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full rounded-xl border border-blue-500/20"
      style={{ background: "#01010d" }}
    />
  );
}
