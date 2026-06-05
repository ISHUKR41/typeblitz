import { useEffect, useRef } from "react";
import type { ArcadeProps } from "./ArcadeArena";
import { soundEffects } from "@/lib/audio";

const COLS = 22;
const ROWS = 14;
const CELL = 34;

type Pos = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

interface Food { pos: Pos; word: string; timer: number; maxTimer: number; id: number; hue: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }
interface PopText { x: number; y: number; text: string; life: number; color: string }

function posEq(a: Pos, b: Pos) { return a.x === b.x && a.y === b.y; }
function nextPos(p: Pos, d: Dir): Pos {
  if (d === "right") return { x: (p.x + 1) % COLS, y: p.y };
  if (d === "left")  return { x: (p.x - 1 + COLS) % COLS, y: p.y };
  if (d === "up")    return { x: p.x, y: (p.y - 1 + ROWS) % ROWS };
  return { x: p.x, y: (p.y + 1) % ROWS };
}
function dirToward(from: Pos, to: Pos, body: Set<string>, current: Dir): Dir {
  const dx = to.x - from.x, dy = to.y - from.y;
  const adx = Math.abs(dx), ady = Math.abs(dy);
  const pref: Dir = adx >= ady ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  const order: Dir[] = [pref, dx > 0 ? "right" : "left", dy > 0 ? "down" : "up", "right", "left", "up", "down"];
  const opposite: Record<Dir, Dir> = { right: "left", left: "right", up: "down", down: "up" };
  for (const d of order) {
    if (d === opposite[current]) continue;
    const np = nextPos(from, d);
    if (!body.has(`${np.x},${np.y}`)) return d;
  }
  return current;
}

let foodIdCounter = 0;

export function SnakeTyperGame({
  words, wordIndex, wpm, accuracy, progress,
  lastWordCorrect, submissionCount, comboStreak,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordIdxRef = useRef(wordIndex);
  wordIdxRef.current = wordIndex;

  const stateRef = useRef({
    snake: [{ x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }] as Pos[],
    dir: "right" as Dir,
    foods: [] as Food[],
    particles: [] as Particle[],
    popTexts: [] as PopText[],
    score: 0,
    stars: Array.from({ length: 60 }, () => ({
      x: Math.random() * COLS * CELL, y: Math.random() * ROWS * CELL,
      r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.4 + 0.1,
    })),
  });
  const prevSubRef = useRef(submissionCount);

  function spawnFood(existingFoods: Food[], snake: Pos[], wordsArr: string[], startIdx: number): Food[] {
    const occupied = new Set([...snake.map(p => `${p.x},${p.y}`), ...existingFoods.map(f => `${f.pos.x},${f.pos.y}`)]);
    const numFoods = Math.min(3, Math.max(1, Math.ceil(progress / 35) + 1));
    const result = [...existingFoods];
    while (result.length < numFoods) {
      const widx = startIdx + result.length;
      if (widx >= wordsArr.length) break;
      let pos: Pos;
      let tries = 0;
      do { pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; tries++; }
      while (occupied.has(`${pos.x},${pos.y}`) && tries < 200);
      const timerMax = Math.max(150, 400 - result.length * 30);
      result.push({ pos, word: wordsArr[widx], timer: timerMax, maxTimer: timerMax, id: foodIdCounter++, hue: 100 + Math.random() * 140 });
      occupied.add(`${pos.x},${pos.y}`);
    }
    return result;
  }

  useEffect(() => {
    const s = stateRef.current;
    if (s.foods.length === 0) {
      s.foods = spawnFood([], s.snake, words, wordIndex);
    }
  }, []);

  useEffect(() => {
    if (submissionCount === prevSubRef.current) return;
    prevSubRef.current = submissionCount;
    const s = stateRef.current;
    const expected = words[wordIdxRef.current - 1] ?? "";
    const fidx = s.foods.findIndex(f => f.word === expected);
    if (lastWordCorrect && fidx !== -1) {
      const food = s.foods[fidx];
      const fx = food.pos.x * CELL + CELL / 2;
      const fy = food.pos.y * CELL + CELL / 2;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const spd = 2 + Math.random() * 4;
        s.particles.push({ x: fx, y: fy, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: 1, color: `hsl(${food.hue},100%,65%)`, size: 3 + Math.random() * 3 });
      }
      const bonus = expected.length * 10 * (comboStreak > 1 ? comboStreak : 1);
      s.popTexts.push({ x: fx, y: fy - 20, text: `+${bonus}`, life: 1, color: `hsl(${food.hue},100%,65%)` });
      for (let i = 0; i < expected.length; i++) s.snake.push({ ...s.snake[s.snake.length - 1] });
      s.score += bonus;
      s.foods.splice(fidx, 1);
      s.foods = spawnFood(s.foods, s.snake, words, wordIdxRef.current);
    } else {
      s.popTexts.push({ x: COLS * CELL / 2, y: ROWS * CELL / 2, text: "✗ Wrong!", life: 1, color: "#ff4444" });
    }
  }, [submissionCount, lastWordCorrect, words, comboStreak]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number, lastMove = 0;

    const loop = (ts: number) => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      const W = COLS * CELL, H = ROWS * CELL;
      const now = Date.now() / 1000;

      const moveMs = Math.max(70, 320 - Math.max(wpm, 10) * 2.5);
      if (ts - lastMove > moveMs && s.snake.length > 0 && s.foods.length > 0) {
        lastMove = ts;
        const head = s.snake[0];
        const bodySet = new Set(s.snake.slice(0, -1).map(p => `${p.x},${p.y}`));
        const target = s.foods.reduce((closest, f) => {
          const d = Math.abs(f.pos.x - head.x) + Math.abs(f.pos.y - head.y);
          const dc = Math.abs(closest.pos.x - head.x) + Math.abs(closest.pos.y - head.y);
          return d < dc ? f : closest;
        }, s.foods[0]);
        s.dir = dirToward(head, target.pos, bodySet, s.dir);
        const nh = nextPos(head, s.dir);
        s.snake.unshift(nh);
        s.snake.pop();
        for (const f of s.foods) f.timer = Math.max(0, f.timer - 1);
        s.foods = s.foods.filter(f => f.timer > 0);
        if (s.foods.length < Math.ceil(progress / 35) + 1) {
          s.foods = spawnFood(s.foods, s.snake, words, wordIdxRef.current);
        }
      }

      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(0,200,100,0.04)";
      for (let gx = 0; gx < COLS; gx++) for (let gy = 0; gy < ROWS; gy++) {
        ctx.beginPath(); ctx.arc(gx * CELL + CELL / 2, gy * CELL + CELL / 2, 1, 0, Math.PI * 2); ctx.fill();
      }
      for (const star of s.stars) {
        ctx.globalAlpha = star.a; ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (let i = s.snake.length - 1; i >= 0; i--) {
        const seg = s.snake[i];
        const isHead = i === 0;
        const frac = i / s.snake.length;
        ctx.shadowBlur = isHead ? 22 : 8;
        ctx.shadowColor = isHead ? "#00ff88" : "#00aa55";
        ctx.globalAlpha = Math.max(0.35, 1 - frac * 0.55);
        const lightness = isHead ? 60 : Math.max(30, 55 - frac * 20);
        ctx.fillStyle = isHead ? "#00ff88" : `hsl(135,100%,${lightness}%)`;
        const pad = isHead ? 2 : 4;
        const r = CELL / 2 - pad;
        const cx = seg.x * CELL + CELL / 2, cy = seg.y * CELL + CELL / 2;
        ctx.beginPath(); ctx.roundRect(cx - r, cy - r, r * 2, r * 2, isHead ? 8 : 5); ctx.fill();
        if (isHead) {
          ctx.shadowBlur = 0; ctx.globalAlpha = 1;
          const ew = s.dir === "right" ? 5 : -5, eh = s.dir === "down" ? 5 : -5;
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.arc(cx + (s.dir === "right" ? 6 : s.dir === "left" ? -6 : 4), cy + (s.dir === "down" ? 6 : s.dir === "up" ? -6 : -4), 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + (s.dir === "right" ? 6 : s.dir === "left" ? -6 : -4), cy + (s.dir === "down" ? 6 : s.dir === "up" ? -6 : 4), 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#001a05";
          ctx.beginPath(); ctx.arc(cx + (s.dir === "right" ? 7 : s.dir === "left" ? -7 : 4), cy + (s.dir === "down" ? 7 : s.dir === "up" ? -7 : -4), 2, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx + (s.dir === "right" ? 7 : s.dir === "left" ? -7 : -4), cy + (s.dir === "down" ? 7 : s.dir === "up" ? -7 : 4), 2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      for (const food of s.foods) {
        const fx = food.pos.x * CELL + CELL / 2, fy = food.pos.y * CELL + CELL / 2;
        const pulse = 0.85 + Math.sin(now * 3.5 + food.id) * 0.15;
        const timerFrac = food.timer / food.maxTimer;
        const isNext = food.word === (words[wordIdxRef.current] ?? "");
        const col = isNext ? `hsl(55,100%,65%)` : `hsl(${food.hue},100%,65%)`;

        ctx.shadowBlur = 28 * pulse; ctx.shadowColor = col;
        ctx.fillStyle = col; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(fx, fy, 9 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(fx, fy, 14 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;

        ctx.font = `bold ${isNext ? 13 : 11}px 'Courier New', monospace`;
        const tw = ctx.measureText(food.word).width;
        const bw = tw + 18, bh = 22, bx = fx - bw / 2, by = fy - CELL + 2;
        ctx.fillStyle = isNext ? "rgba(255,240,50,0.18)" : "rgba(0,200,100,0.12)";
        ctx.strokeStyle = isNext ? "rgba(255,240,80,0.7)" : "rgba(0,200,100,0.4)";
        ctx.lineWidth = isNext ? 1.5 : 1;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isNext ? "#fff964" : `hsl(${food.hue},100%,75%)`;
        ctx.textAlign = "center"; ctx.fillText(food.word, fx, by + 15);

        ctx.fillStyle = timerFrac > 0.4 ? "#00ff88" : timerFrac > 0.2 ? "#ffaa00" : "#ff4444";
        ctx.fillRect(bx, by + bh + 3, bw * timerFrac, 3);
      }

      s.particles = s.particles.filter(p => p.life > 0);
      for (const p of s.particles) {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96; p.life -= 0.022;
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      s.popTexts = s.popTexts.filter(pt => pt.life > 0);
      for (const pt of s.popTexts) {
        ctx.globalAlpha = pt.life; ctx.fillStyle = pt.color;
        ctx.font = `bold ${18 + (1 - pt.life) * 10}px monospace`;
        ctx.textAlign = "center"; ctx.shadowBlur = 12; ctx.shadowColor = pt.color;
        ctx.fillText(pt.text, pt.x, pt.y - (1 - pt.life) * 40);
        pt.life -= 0.018;
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(5,5,16,0.75)";
      ctx.beginPath(); ctx.roundRect(8, 8, 200, 52, 8); ctx.fill();
      ctx.strokeStyle = "rgba(0,255,100,0.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(8, 8, 200, 52, 8); ctx.stroke();
      ctx.fillStyle = "#00ff88"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
      ctx.fillText(`🐍 Length: ${s.snake.length}`, 18, 28);
      ctx.fillStyle = "#88ffcc"; ctx.font = "11px monospace";
      ctx.fillText(`Score: ${s.score}  WPM: ${wpm}  Acc: ${accuracy}%`, 18, 48);

      const tgt = words[wordIdxRef.current];
      if (tgt) {
        ctx.font = "bold 15px monospace"; ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,100,0.85)"; ctx.shadowBlur = 10; ctx.shadowColor = "#ffff40";
        ctx.fillText(`Type → "${tgt}"`, W / 2, H - 10);
        ctx.shadowBlur = 0;
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [words, wpm, accuracy, progress]);

  return (
    <canvas
      ref={canvasRef}
      width={COLS * CELL}
      height={ROWS * CELL}
      className="w-full rounded-xl border border-green-500/20"
      style={{ background: "#050510" }}
    />
  );
}
