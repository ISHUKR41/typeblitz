import { useEffect, useRef } from "react";
import type { ArcadeProps } from "./ArcadeArena";

const FRUITS = [
  { name:"apple",      main:"#ef4444", light:"#fca5a5", inner:"#fee2e2", glow:"rgba(239,68,68,0.35)"  },
  { name:"orange",     main:"#f97316", light:"#fdba74", inner:"#ffedd5", glow:"rgba(249,115,22,0.35)" },
  { name:"watermelon", main:"#22c55e", light:"#86efac", inner:"#dcfce7", glow:"rgba(34,197,94,0.35)"  },
  { name:"grape",      main:"#a855f7", light:"#d8b4fe", inner:"#f3e8ff", glow:"rgba(168,85,247,0.35)" },
  { name:"lemon",      main:"#eab308", light:"#fde047", inner:"#fef9c3", glow:"rgba(234,179,8,0.35)"  },
  { name:"blueberry",  main:"#3b82f6", light:"#93c5fd", inner:"#dbeafe", glow:"rgba(59,130,246,0.35)" },
  { name:"cherry",     main:"#e11d48", light:"#fda4af", inner:"#ffe4e6", glow:"rgba(225,29,72,0.35)"  },
];

interface Fruit {
  wIdx: number; word: string;
  x: number; y: number; r: number; vy: number; fi: number;
  slicing: boolean; sliceT: number;
  lx:number; ly:number; lrot:number; lvy:number; lvx:number;
  rx:number; ry:number; rrot:number; rvy:number; rvx:number;
  pts: { x:number; y:number; vx:number; vy:number; life:number; r:number }[];
  alive: boolean;
}

export function FruitBlitzGame({
  words, wordIndex, currentInput, wpm, accuracy, levelNumber,
  lastWordCorrect, submissionCount, comboStreak,
}: ArcadeProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const fruitsRef  = useRef<Fruit[]>([]);
  const livesRef   = useRef(3);
  const rafRef     = useRef(0);
  const lastTRef   = useRef(0);
  const prevSubRef = useRef(submissionCount);
  const prevWidRef = useRef(wordIndex);
  const spawnedRef = useRef(-1);
  // Stable refs so the animation loop never stale-closes over prop values
  const wordIndexRef    = useRef(wordIndex);    wordIndexRef.current    = wordIndex;
  const currentInputRef = useRef(currentInput); currentInputRef.current = currentInput;
  const wpmRef          = useRef(wpm);          wpmRef.current          = wpm;
  const accuracyRef     = useRef(accuracy);     accuracyRef.current     = accuracy;
  const comboStreakRef  = useRef(comboStreak);  comboStreakRef.current  = comboStreak;

  function spawnFruit(canvas: HTMLCanvasElement, wIdx: number) {
    if (wIdx < 0 || wIdx >= words.length) return;
    if (fruitsRef.current.some(f => f.wIdx === wIdx)) return;
    const word = words[wIdx];
    const r = Math.max(30, Math.min(54, 26 + word.length * 3.2));
    const fi = wIdx % FRUITS.length;
    const offset = Math.max(0, wIdx - wordIndex);
    fruitsRef.current.push({
      wIdx, word, r, fi,
      x: r + 20 + Math.random() * Math.max(1, canvas.width - 2*r - 40),
      y: -r - 20 - offset * Math.min(90, canvas.height / 6),
      vy: 0.32 + (levelNumber-1)*0.08 + Math.random()*0.05,
      slicing:false, sliceT:0,
      lx:0,ly:0,lrot:0,lvy:0,lvx:0,
      rx:0,ry:0,rrot:0,rvy:0,rvx:0,
      pts:[], alive:true,
    });
  }

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const WS = Math.min(3+levelNumber, 6);
    for (let i=wordIndex; i<Math.min(words.length,wordIndex+WS); i++) spawnFruit(c,i);
    spawnedRef.current = Math.min(words.length-1, wordIndex+WS-1);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (submissionCount===prevSubRef.current) return;
    const prevW = prevWidRef.current;
    prevSubRef.current = submissionCount;
    prevWidRef.current = wordIndex;

    if (lastWordCorrect) {
      const f = fruitsRef.current.find(f=>f.wIdx===prevW&&!f.slicing);
      if (f) {
        f.slicing=true; f.sliceT=0;
        f.lx=f.x; f.ly=f.y; f.lvx=-1.3-Math.random()*0.8; f.lvy=-1.8+Math.random()*0.5; f.lrot=0;
        f.rx=f.x; f.ry=f.y; f.rvx=1.3+Math.random()*0.8;  f.rvy=-1.8+Math.random()*0.5; f.rrot=0;
        for (let i=0; i<18; i++) {
          const angle=-Math.PI/2+(Math.random()-0.5)*Math.PI;
          const spd=2+Math.random()*3.5;
          f.pts.push({x:f.x,y:f.y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-1.5,life:1,r:2+Math.random()*4});
        }
      }
    }

    const c = canvasRef.current;
    if (c) {
      const next = spawnedRef.current+1;
      if (next<words.length) { spawnFruit(c,next); spawnedRef.current=next; }
    }
  }, [submissionCount]); // eslint-disable-line

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth ?? 700;
      canvas.height = Math.min(500, Math.max(360, window.innerHeight-270));
    };
    resize();
    const _roF = new ResizeObserver(resize);
    if (canvas.parentElement) _roF.observe(canvas.parentElement);

    function drawFruitShape(cx:number,cy:number,r:number,fi:number,alpha=1) {
      const ft = FRUITS[fi];
      ctx.globalAlpha = alpha;
      const gl = ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r+18);
      gl.addColorStop(0,ft.glow); gl.addColorStop(1,"transparent");
      ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(cx,cy,r+18,0,Math.PI*2); ctx.fill();
      const grad = ctx.createRadialGradient(cx-r*0.25,cy-r*0.3,r*0.05,cx,cy,r);
      grad.addColorStop(0,ft.light); grad.addColorStop(0.65,ft.main); grad.addColorStop(1,ft.main);
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
      if (fi===2) {
        ctx.fillStyle="#ef4444"; ctx.beginPath(); ctx.arc(cx,cy,r*0.72,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="#1f2937";
        for (const [sx,sy] of [[-0.28,-0.08],[0.12,-0.28],[0.30,0.14],[-0.1,0.28],[0.18,0.24]]) {
          ctx.beginPath(); ctx.ellipse(cx+sx*r,cy+sy*r,r*0.07,r*0.12,sx*0.5,0,Math.PI*2); ctx.fill();
        }
      }
      ctx.fillStyle="rgba(255,255,255,0.38)";
      ctx.beginPath(); ctx.ellipse(cx-r*0.24,cy-r*0.27,r*0.22,r*0.13,-Math.PI/4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=ft.light+"70"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1;
    }

    const draw = (ts:number) => {
      const dt = Math.min(ts-(lastTRef.current||ts),48);
      lastTRef.current=ts;
      const DT_NORM = dt / 16.667; // normalize: 1.0 = 60fps
      const W=canvas.width, H=canvas.height, now=Date.now();

      const bg=ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#0a1628"); bg.addColorStop(1,"#15052e");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      ctx.save(); ctx.globalAlpha=0.03; ctx.strokeStyle="#fff"; ctx.lineWidth=1;
      for (let i=-H; i<W+H; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+H,H); ctx.stroke(); }
      ctx.restore();

      const gg=ctx.createLinearGradient(0,H-60,0,H);
      gg.addColorStop(0,"rgba(239,68,68,0)"); gg.addColorStop(1,"rgba(239,68,68,0.12)");
      ctx.fillStyle=gg; ctx.fillRect(0,H-60,W,60);
      ctx.strokeStyle="rgba(239,68,68,0.35)"; ctx.lineWidth=1;
      ctx.setLineDash([6,5]); ctx.beginPath(); ctx.moveTo(0,H-60); ctx.lineTo(W,H-60); ctx.stroke(); ctx.setLineDash([]);
      ctx.font="10px system-ui"; ctx.fillStyle="rgba(239,68,68,0.45)"; ctx.textAlign="left"; ctx.textBaseline="alphabetic";
      ctx.fillText("MISS ZONE", 8, H-43);

      fruitsRef.current = fruitsRef.current.filter(f=>f.alive);

      for (const f of fruitsRef.current) {
        if (f.slicing) {
          f.sliceT+=dt/620;
          if (f.sliceT>=1) { f.alive=false; continue; }
          const alpha=1-f.sliceT;
          const ft=FRUITS[f.fi];
          f.lx+=f.lvx*DT_NORM; f.ly+=f.lvy*DT_NORM; f.lvy+=0.16*DT_NORM; f.lrot+=0.045*DT_NORM;
          f.rx+=f.rvx*DT_NORM; f.ry+=f.rvy*DT_NORM; f.rvy+=0.16*DT_NORM; f.rrot-=0.045*DT_NORM;

          ctx.save(); ctx.translate(f.lx,f.ly); ctx.rotate(f.lrot); ctx.globalAlpha=alpha;
          const lg=ctx.createRadialGradient(-f.r*0.2,-f.r*0.2,f.r*0.05,0,0,f.r);
          lg.addColorStop(0,ft.light); lg.addColorStop(1,ft.main);
          ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(0,0,f.r,Math.PI/2,3*Math.PI/2); ctx.closePath(); ctx.fill();
          ctx.fillStyle=ft.inner+"bb"; ctx.beginPath(); ctx.arc(0,0,f.r*0.82,Math.PI/2,3*Math.PI/2); ctx.closePath(); ctx.fill();
          ctx.restore();

          ctx.save(); ctx.translate(f.rx,f.ry); ctx.rotate(f.rrot); ctx.globalAlpha=alpha;
          const rg=ctx.createRadialGradient(f.r*0.2,-f.r*0.2,f.r*0.05,0,0,f.r);
          rg.addColorStop(0,ft.light); rg.addColorStop(1,ft.main);
          ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(0,0,f.r,-Math.PI/2,Math.PI/2); ctx.closePath(); ctx.fill();
          ctx.fillStyle=ft.inner+"bb"; ctx.beginPath(); ctx.arc(0,0,f.r*0.82,-Math.PI/2,Math.PI/2); ctx.closePath(); ctx.fill();
          ctx.restore(); ctx.globalAlpha=1;

          for (const p of f.pts) {
            p.x+=p.vx*DT_NORM; p.y+=p.vy*DT_NORM; p.vy+=0.18*DT_NORM; p.life-=dt/440;
            if (p.life<=0) continue;
            ctx.globalAlpha=p.life; ctx.fillStyle=ft.light;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fill();
          }
          f.pts=f.pts.filter(p=>p.life>0);
          ctx.globalAlpha=1;
          continue;
        }

        f.y+=f.vy*dt;
        if (f.y-f.r>H-55) { livesRef.current=Math.max(0,livesRef.current-1); f.alive=false; continue; }

        const isActive=f.wIdx===wordIndexRef.current;
        const ft=FRUITS[f.fi];
        const pulse=Math.sin(now/300)*0.5+0.5;

        drawFruitShape(f.x,f.y,f.r,f.fi);

        if (isActive) {
          ctx.strokeStyle=ft.light; ctx.lineWidth=2+pulse*2.5; ctx.globalAlpha=0.5+pulse*0.5;
          ctx.beginPath(); ctx.arc(f.x,f.y,f.r+7+pulse*6,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha=1;
          ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
          ctx.beginPath(); ctx.moveTo(f.x,f.y-f.r-2); ctx.lineTo(f.x,f.y+f.r+2); ctx.stroke(); ctx.setLineDash([]);
        }

        const fs=Math.max(9,Math.min(15,Math.floor(f.r*0.38)));
        ctx.font=`bold ${fs}px 'JetBrains Mono',monospace`;
        ctx.textAlign="center"; ctx.textBaseline="top";
        const lY=f.y+f.r+6;
        if (isActive && currentInputRef.current.length>0) {
          const typed=currentInputRef.current, rest=f.word.slice(typed.length);
          const fw=ctx.measureText(f.word).width, sx=f.x-fw/2;
          ctx.textAlign="left";
          ctx.fillStyle="#4ade80"; ctx.fillText(typed, sx, lY);
          ctx.fillStyle="rgba(255,255,255,0.75)"; ctx.fillText(rest, sx+ctx.measureText(typed).width, lY);
          ctx.textAlign="center";
        } else {
          ctx.fillStyle=isActive?"#fff":"rgba(255,255,255,0.65)";
          ctx.shadowColor="rgba(0,0,0,0.6)"; ctx.shadowBlur=5;
          ctx.fillText(f.word,f.x,lY); ctx.shadowBlur=0;
        }
      }

      ctx.textAlign="left"; ctx.textBaseline="top"; ctx.font="14px system-ui"; ctx.fillStyle="#fff";
      ctx.fillText("❤️".repeat(Math.max(0,livesRef.current))+"🤍".repeat(Math.max(0,3-livesRef.current)),10,10);
      ctx.font="bold 13px 'JetBrains Mono',monospace";
      ctx.textAlign="center"; ctx.fillStyle="#fb923c"; ctx.fillText(`${wpmRef.current} WPM`,W/2,10);
      ctx.textAlign="right";  ctx.fillStyle="#34d399"; ctx.fillText(`${accuracyRef.current}%`,W-10,10);

      if (comboStreakRef.current>2) {
        const cs=comboStreakRef.current;
        ctx.textAlign="center"; ctx.font=`bold ${Math.min(14+cs,22)}px 'JetBrains Mono',monospace`;
        ctx.fillStyle=`hsl(${40+cs*6},100%,62%)`; ctx.globalAlpha=0.9;
        ctx.fillText(`✂️ ${cs}x SLICE COMBO`,W/2,34); ctx.globalAlpha=1;
      }

      const af=fruitsRef.current.find(f=>f.wIdx===wordIndexRef.current&&!f.slicing);
      if (af) {
        const typed=currentInputRef.current, rest=af.word.slice(typed.length);
        const ft=FRUITS[af.fi];
        ctx.font="bold 20px 'JetBrains Mono',monospace"; ctx.shadowColor=ft.main; ctx.shadowBlur=16;
        const fw=ctx.measureText(af.word).width, sx=W/2-fw/2;
        ctx.textAlign="left"; ctx.textBaseline="bottom";
        ctx.fillStyle="#4ade80"; ctx.fillText(typed,sx,H-26);
        ctx.fillStyle="rgba(255,255,255,0.65)"; ctx.fillText(rest,sx+ctx.measureText(typed).width,H-26);
        ctx.shadowBlur=0;
        ctx.textAlign="center"; ctx.font="11px system-ui"; ctx.fillStyle="rgba(255,255,255,0.32)";
        ctx.fillText("type the glowing fruit · SPACE to slice",W/2,H-8);
      }

      rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); _roF.disconnect(); };
  }, [words]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className="w-full rounded-2xl border border-orange-500/20 block" />;
}
