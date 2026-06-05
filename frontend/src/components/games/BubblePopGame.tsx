import { useEffect, useRef } from "react";
import type { ArcadeProps } from "./ArcadeArena";

const PALETTE = [
  { main: "#8b5cf6", light: "#c4b5fd", glow: "rgba(139,92,246,0.35)" },
  { main: "#06b6d4", light: "#67e8f9", glow: "rgba(6,182,212,0.35)"  },
  { main: "#10b981", light: "#6ee7b7", glow: "rgba(16,185,129,0.35)" },
  { main: "#f59e0b", light: "#fcd34d", glow: "rgba(245,158,11,0.35)" },
  { main: "#ec4899", light: "#f9a8d4", glow: "rgba(236,72,153,0.35)" },
  { main: "#ef4444", light: "#fca5a5", glow: "rgba(239,68,68,0.35)"  },
  { main: "#3b82f6", light: "#93c5fd", glow: "rgba(59,130,246,0.35)" },
];

interface Bubble {
  wIdx: number; word: string;
  x: number; y: number; r: number;
  vy: number; driftAmp: number; driftPhase: number;
  ci: number;
  popping: boolean; popT: number;
  pts: { x: number; y: number; vx: number; vy: number; life: number; r: number }[];
  alive: boolean;
}

export function BubblePopGame({
  words, wordIndex, currentInput, wpm, accuracy, levelNumber,
  lastWordCorrect, submissionCount, comboStreak,
}: ArcadeProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const livesRef   = useRef(3);
  const rafRef     = useRef(0);
  const lastTRef   = useRef(0);
  const prevSubRef = useRef(submissionCount);
  const prevWidRef = useRef(wordIndex);
  const spawnedRef = useRef(-1);

  function spawnFor(canvas: HTMLCanvasElement, wIdx: number) {
    if (wIdx < 0 || wIdx >= words.length) return;
    if (bubblesRef.current.some(b => b.wIdx === wIdx)) return;
    const word = words[wIdx];
    const r  = Math.max(36, Math.min(62, 30 + word.length * 3.8));
    const ci = wIdx % PALETTE.length;
    const offset = Math.max(0, wIdx - wordIndex);
    bubblesRef.current.push({
      wIdx, word, r, ci,
      x: r + 20 + Math.random() * Math.max(1, (canvas.width) - 2 * r - 40),
      y: canvas.height * 0.72 + Math.min(offset * 95, canvas.height * 0.38),
      vy: -(0.42 + (levelNumber - 1) * 0.09 + Math.random() * 0.06),
      driftAmp: 0.3 + Math.random() * 0.5,
      driftPhase: Math.random() * Math.PI * 2,
      popping: false, popT: 0, pts: [], alive: true,
    });
  }

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const WS = Math.min(4 + levelNumber, 8);
    for (let i = wordIndex; i < Math.min(words.length, wordIndex + WS); i++) spawnFor(c, i);
    spawnedRef.current = Math.min(words.length - 1, wordIndex + WS - 1);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (submissionCount === prevSubRef.current) return;
    const prevW = prevWidRef.current;
    prevSubRef.current = submissionCount;
    prevWidRef.current = wordIndex;

    if (lastWordCorrect) {
      const b = bubblesRef.current.find(b => b.wIdx === prevW && !b.popping);
      if (b) {
        b.popping = true; b.popT = 0;
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.25;
          const spd = 1.8 + Math.random() * 3.8;
          b.pts.push({ x: b.x, y: b.y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 0.6, life: 1, r: 2.5 + Math.random() * 4.5 });
        }
      }
    }

    const c = canvasRef.current;
    if (c) {
      const next = spawnedRef.current + 1;
      if (next < words.length) { spawnFor(c, next); spawnedRef.current = next; }
    }
  }, [submissionCount]); // eslint-disable-line

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth ?? 700;
      canvas.height = Math.min(500, Math.max(360, window.innerHeight - 270));
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (ts: number) => {
      const dt = Math.min(ts - (lastTRef.current || ts), 48);
      lastTRef.current = ts;
      const W = canvas.width, H = canvas.height, now = Date.now();

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#03001c"); bg.addColorStop(1, "#0e0532");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(139,92,246,0.07)";
      for (let gx = 35; gx < W; gx += 50)
        for (let gy = 35; gy < H; gy += 50) { ctx.beginPath(); ctx.arc(gx,gy,1.5,0,Math.PI*2); ctx.fill(); }

      const dz = ctx.createLinearGradient(0,0,0,80);
      dz.addColorStop(0,"rgba(239,68,68,0.18)"); dz.addColorStop(1,"transparent");
      ctx.fillStyle=dz; ctx.fillRect(0,0,W,80);
      ctx.strokeStyle="rgba(239,68,68,0.4)"; ctx.lineWidth=1;
      ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(0,80); ctx.lineTo(W,80); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font="10px system-ui"; ctx.fillStyle="rgba(239,68,68,0.5)"; ctx.textAlign="right"; ctx.textBaseline="alphabetic";
      ctx.fillText("ESCAPE ZONE", W-8, 75);

      bubblesRef.current = bubblesRef.current.filter(b => b.alive);

      for (const b of bubblesRef.current) {
        if (b.popping) {
          b.popT += dt/380;
          if (b.popT >= 1) { b.alive = false; continue; }
          const c2 = PALETTE[b.ci];
          ctx.globalAlpha = 1 - b.popT;
          ctx.strokeStyle = c2.light; ctx.lineWidth = 3*(1-b.popT);
          ctx.beginPath(); ctx.arc(b.x,b.y,b.r*(1+b.popT*2.8),0,Math.PI*2); ctx.stroke();
          ctx.globalAlpha = 1;
          for (const p of b.pts) {
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.13; p.life-=dt/480;
            if (p.life<=0) continue;
            ctx.globalAlpha=p.life*(1-b.popT*0.7);
            ctx.fillStyle=c2.main; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
          }
          b.pts = b.pts.filter(p=>p.life>0);
          ctx.globalAlpha=1;
          continue;
        }

        b.y += b.vy * dt;
        b.x += Math.sin(now/1400 + b.driftPhase) * b.driftAmp;
        b.x  = Math.max(b.r+2, Math.min(W-b.r-2, b.x));

        if (b.y + b.r < 0) { livesRef.current = Math.max(0, livesRef.current-1); b.alive=false; continue; }

        const isActive = b.wIdx === wordIndex;
        const c2 = PALETTE[b.ci];
        const pulse = Math.sin(now/290)*0.5+0.5;

        const gl = ctx.createRadialGradient(b.x,b.y,b.r*0.3,b.x,b.y,b.r+22);
        gl.addColorStop(0,c2.glow); gl.addColorStop(1,"transparent");
        ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(b.x,b.y,b.r+22,0,Math.PI*2); ctx.fill();

        const grad = ctx.createRadialGradient(b.x-b.r*0.28,b.y-b.r*0.32,b.r*0.05,b.x,b.y,b.r);
        grad.addColorStop(0,c2.light+"cc"); grad.addColorStop(0.55,c2.main+"bb"); grad.addColorStop(1,c2.main+"f0");
        ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();

        ctx.fillStyle="rgba(255,255,255,0.38)";
        ctx.beginPath(); ctx.ellipse(b.x-b.r*0.25,b.y-b.r*0.28,b.r*0.24,b.r*0.14,-Math.PI/4,0,Math.PI*2); ctx.fill();

        if (isActive) {
          ctx.strokeStyle=c2.light; ctx.lineWidth=2+pulse*2.5; ctx.globalAlpha=0.55+pulse*0.45;
          ctx.beginPath(); ctx.arc(b.x,b.y,b.r+7+pulse*7,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
        }
        ctx.strokeStyle = isActive ? c2.light : c2.main+"55"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.stroke();

        const fs = Math.max(10, Math.min(16, Math.floor(b.r*0.44)));
        ctx.font=`bold ${fs}px 'JetBrains Mono',monospace`;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        if (isActive && currentInput.length>0) {
          const typed=currentInput, rest=b.word.slice(typed.length);
          const tw=ctx.measureText(b.word).width, sx=b.x-tw/2;
          ctx.fillStyle="#4ade80"; ctx.fillText(typed, sx+ctx.measureText(typed).width/2, b.y);
          ctx.fillStyle="#fff";    ctx.fillText(rest,  sx+ctx.measureText(typed).width+ctx.measureText(rest).width/2, b.y);
        } else {
          ctx.fillStyle = isActive?"#fff":"rgba(255,255,255,0.82)";
          ctx.shadowColor="rgba(0,0,0,0.55)"; ctx.shadowBlur=4;
          ctx.fillText(b.word, b.x, b.y); ctx.shadowBlur=0;
        }
      }

      ctx.textAlign="left"; ctx.textBaseline="top"; ctx.font="14px system-ui"; ctx.fillStyle="#fff";
      ctx.fillText("❤️".repeat(Math.max(0,livesRef.current))+"🤍".repeat(Math.max(0,3-livesRef.current)), 10, 10);
      ctx.font="bold 13px 'JetBrains Mono',monospace";
      ctx.textAlign="center"; ctx.fillStyle="#a78bfa"; ctx.fillText(`${wpm} WPM`, W/2, 10);
      ctx.textAlign="right";  ctx.fillStyle="#34d399"; ctx.fillText(`${accuracy}%`, W-10, 10);

      if (comboStreak > 2) {
        ctx.textAlign="center"; ctx.font=`bold ${Math.min(14+comboStreak,22)}px 'JetBrains Mono',monospace`;
        ctx.fillStyle=`hsl(${40+comboStreak*6},100%,62%)`; ctx.globalAlpha=0.95;
        ctx.fillText(`🔥 ${comboStreak}x COMBO`, W/2, 34); ctx.globalAlpha=1;
      }

      const ab = bubblesRef.current.find(b=>b.wIdx===wordIndex&&!b.popping);
      if (ab) {
        const typed=currentInput, rest=ab.word.slice(typed.length);
        const c2=PALETTE[ab.ci];
        ctx.font="bold 20px 'JetBrains Mono',monospace"; ctx.shadowColor=c2.main; ctx.shadowBlur=18;
        const fw=ctx.measureText(ab.word).width, sx=W/2-fw/2;
        ctx.textAlign="left"; ctx.textBaseline="bottom";
        ctx.fillStyle="#4ade80"; ctx.fillText(typed, sx, H-26);
        ctx.fillStyle="rgba(255,255,255,0.65)"; ctx.fillText(rest, sx+ctx.measureText(typed).width, H-26);
        ctx.shadowBlur=0;
        ctx.textAlign="center"; ctx.font="11px system-ui"; ctx.fillStyle="rgba(255,255,255,0.32)";
        ctx.fillText("type the glowing bubble · SPACE to pop", W/2, H-8);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize",resize); };
  }, [words, wordIndex, currentInput, wpm, accuracy, levelNumber, comboStreak]); // eslint-disable-line

  return <canvas ref={canvasRef} className="w-full rounded-2xl border border-violet-500/20 block" />;
}
