import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Sword, Shield, Zap } from "lucide-react";
import { soundEffects } from "@/lib/audio";

const ENEMIES = [
  { name: "Scribe",     color: "#a78bfa", hp: 100 },
  { name: "Guard",      color: "#f87171", hp: 130 },
  { name: "Magistrate", color: "#fb923c", hp: 160 },
  { name: "Warlord",    color: "#facc15", hp: 200 },
  { name: "Champion",   color: "#ef4444", hp: 250 },
];

interface CanvasParticle {
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

interface DamageNumber {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

function HealthBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max((value / max) * 100, 0);
  return (
    <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 85, damping: 14 }}
      />
    </div>
  );
}

export function FighterGame({
  words,
  wordIndex,
  currentInput,
  wpm,
  accuracy,
  targetWpm,
  lastWordCorrect,
  levelNumber,
  submissionCount,
}: ArcadeProps) {
  const enemy = ENEMIES[Math.min(levelNumber - 1, ENEMIES.length - 1)] ?? ENEMIES[0];
  const totalWords = words.length;

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevSubmissionRef = useRef(submissionCount);
  
  // Animation state triggers
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboLabel, setComboLabel] = useState<string | null>(null);

  // Floating messages and particles refs
  const particlesRef = useRef<CanvasParticle[]>([]);
  const damagesRef = useRef<DamageNumber[]>([]);

  useEffect(() => {
    if (lastWordCorrect === null) return;
    if (submissionCount === prevSubmissionRef.current) return;
    prevSubmissionRef.current = submissionCount;

    if (lastWordCorrect) {
      // Player attacks
      const dmg = Math.round(enemy.hp / totalWords) || 12;
      setEnemyHp(h => Math.max(h - dmg, 0));
      setPlayerAttacking(true);
      setEnemyHit(true);
      soundEffects.playSlash();
      setTimeout(() => soundEffects.playImpact(), 80);

      // Add damage popup
      damagesRef.current.push({
        x: 550 + (Math.random() * 20 - 10),
        y: 110 + (Math.random() * 20 - 10),
        text: `-${dmg} HP`,
        color: "#facc15",
        alpha: 1,
        life: 0,
        maxLife: 35,
      });

      // Hit particles
      for (let k = 0; k < 15; k++) {
        particlesRef.current.push({
          x: 550,
          y: 120,
          vx: (Math.random() * 8 - 4) * 1.5,
          vy: (Math.random() * 8 - 6) * 1.5,
          size: Math.random() * 3 + 2,
          color: enemy.color,
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }

      setTimeout(() => {
        setPlayerAttacking(false);
        setEnemyHit(false);
      }, 250);

      setCombo(c => {
        const next = c + 1;
        if (next >= 5) setComboLabel("ULTRA COMBO!");
        else if (next >= 3) setComboLabel(`${next}x COMBO!`);
        else setComboLabel(null);
        return next;
      });
    } else {
      // Enemy attacks
      const dmg = 10;
      setPlayerHp(h => Math.max(h - dmg, 0));
      setEnemyAttacking(true);
      setPlayerHit(true);
      soundEffects.playSlash();
      setTimeout(() => soundEffects.playImpact(), 80);

      damagesRef.current.push({
        x: 250 + (Math.random() * 20 - 10),
        y: 110 + (Math.random() * 20 - 10),
        text: `-${dmg} HP`,
        color: "#f87171",
        alpha: 1,
        life: 0,
        maxLife: 35,
      });

      for (let k = 0; k < 12; k++) {
        particlesRef.current.push({
          x: 250,
          y: 120,
          vx: (Math.random() * 8 - 4) * 1.5,
          vy: (Math.random() * 8 - 6) * 1.5,
          size: Math.random() * 3 + 2,
          color: "#34d399",
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 15,
        });
      }

      setTimeout(() => {
        setEnemyAttacking(false);
        setPlayerHit(false);
      }, 250);

      setCombo(0);
      setComboLabel(null);
    }
  }, [lastWordCorrect, submissionCount, enemy.hp, totalWords, enemy.color]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Screen Shake offset if hit
      ctx.save();
      if (playerHit || enemyHit) {
        const shakeX = Math.random() * 10 - 5;
        const shakeY = Math.random() * 8 - 4;
        ctx.translate(shakeX, shakeY);
      }

      // Draw background (cyberpunk dojo/arena)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#0e0620");
      grad.addColorStop(0.35, "#0b0518");
      grad.addColorStop(0.6, "#0a0415");
      grad.addColorStop(1, "#050210");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Background torii gate silhouette (Japanese aesthetic)
      ctx.fillStyle = "rgba(107, 33, 168, 0.06)";
      ctx.fillRect(w * 0.42, h * 0.08, w * 0.16, 8); // top crossbar
      ctx.fillRect(w * 0.40, h * 0.05, w * 0.20, 5); // upper crossbar
      ctx.fillRect(w * 0.44, h * 0.08, 6, h * 0.70); // left pillar
      ctx.fillRect(w * 0.54, h * 0.08, 6, h * 0.70); // right pillar

      // Atmospheric floating dust motes
      for (let d = 0; d < 20; d++) {
        const dx = (d * 97 + Date.now() / (800 + d * 40)) % w;
        const dy = (d * 53 + Math.sin(Date.now() / (600 + d * 30) + d) * 15) % (h * 0.75);
        const da = 0.05 + Math.abs(Math.sin(Date.now() / 1000 + d * 2)) * 0.1;
        ctx.fillStyle = `rgba(168, 85, 247, ${da})`;
        ctx.beginPath();
        ctx.arc(dx, dy, 1 + (d % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Arena floor (textured stone with perspective grid)
      const floorGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
      floorGrad.addColorStop(0, "#0c0618");
      floorGrad.addColorStop(1, "#050210");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      // Perspective floor grid lines
      ctx.strokeStyle = "rgba(168, 85, 247, 0.08)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, h * 0.78);
        ctx.lineTo(w / 2 + (gx - w / 2) * 0.3, h);
        ctx.stroke();
      }
      // Horizontal floor lines
      for (let gy = 0; gy < 4; gy++) {
        const lineY = h * 0.78 + gy * (h * 0.055);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(w, lineY);
        ctx.stroke();
      }

      // Main floor line (bright)
      ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.78);
      ctx.stroke();

      // Floor glow reflection under fighters
      ctx.fillStyle = "rgba(52, 211, 153, 0.04)";
      ctx.beginPath();
      ctx.ellipse(250, h * 0.80, 50, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `${enemy.color}08`;
      ctx.beginPath();
      ctx.ellipse(550, h * 0.80, 50, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dojo pillars with neon brackets
      ctx.fillStyle = "rgba(107, 33, 168, 0.1)";
      ctx.fillRect(w * 0.08, 0, 18, h * 0.78);
      ctx.fillRect(w * 0.88, 0, 18, h * 0.78);
      // Neon bracket accents on pillars
      ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
      ctx.lineWidth = 2;
      [h * 0.15, h * 0.35, h * 0.55].forEach(py => {
        ctx.beginPath();
        ctx.moveTo(w * 0.08, py);
        ctx.lineTo(w * 0.08 + 18, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.88, py);
        ctx.lineTo(w * 0.88 + 18, py);
        ctx.stroke();
      });

      // Arena ropes (top and bottom boundary)
      ctx.strokeStyle = "rgba(239, 68, 68, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.12);
      ctx.lineTo(w * 0.88, h * 0.12);
      ctx.stroke();
      ctx.setLineDash([]);

      // Character base positions
      const playerIdleY = Math.sin(Date.now() / 150) * 2;
      const enemyIdleY = Math.cos(Date.now() / 150) * 1.8;

      const pBaseX = 250 + (playerAttacking ? 120 : 0);
      const eBaseX = 550 - (enemyAttacking ? 120 : 0);

      // ─── PLAYER DRAWING ───
      if (playerHp > 0) {
        ctx.save();
        ctx.translate(pBaseX, h * 0.75 + playerIdleY);

        // Attack sword trail
        if (playerAttacking) {
          ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(30, -25, 30, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        // Body glow shadow
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 10;

        // Player Head
        ctx.fillStyle = "rgba(52, 211, 153, 0.2)";
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -50, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "#34d399";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(4, -53, 2, 0, Math.PI * 2);
        ctx.arc(10, -53, 2, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.shadowBlur = 10;
        ctx.fillStyle = "rgba(52, 211, 153, 0.15)";
        ctx.beginPath();
        ctx.roundRect(-12, -36, 22, 26, 4);
        ctx.fill();
        ctx.stroke();

        // Arms (holding neon katana)
        ctx.beginPath();
        ctx.moveTo(8, -25);
        ctx.lineTo(24, -20);
        ctx.stroke();

        // Katana blade
        ctx.strokeStyle = "#ffffff";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(24, -20);
        ctx.lineTo(44, -38);
        ctx.stroke();

        // Legs
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.lineTo(-8, 5);
        ctx.moveTo(4, -10);
        ctx.lineTo(6, 5);
        ctx.stroke();

        ctx.restore();
      }

      // ─── ENEMY DRAWING ───
      if (enemyHp > 0) {
        ctx.save();
        ctx.translate(eBaseX, h * 0.75 + enemyIdleY);

        // Enemy scale left-facing
        ctx.scale(-1, 1);

        // Red slash trail
        if (enemyAttacking) {
          ctx.strokeStyle = `${enemy.color}60`;
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.arc(30, -25, 30, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
        }

        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;

        // Enemy Head
        ctx.fillStyle = `${enemy.color}25`;
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, -50, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(4, -53, 2, 0, Math.PI * 2);
        ctx.arc(10, -53, 2, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.shadowBlur = 10;
        ctx.fillStyle = `${enemy.color}15`;
        ctx.beginPath();
        ctx.roundRect(-12, -36, 22, 26, 4);
        ctx.fill();
        ctx.stroke();

        // Weapon
        ctx.beginPath();
        ctx.moveTo(8, -25);
        ctx.lineTo(24, -20);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(24, -20);
        ctx.lineTo(44, -38);
        ctx.stroke();

        // Legs
        ctx.shadowBlur = 0;
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, -10);
        ctx.lineTo(-8, 5);
        ctx.moveTo(4, -10);
        ctx.lineTo(6, 5);
        ctx.stroke();

        ctx.restore();
      }

      // ─── PARTICLES SYSTEM ───
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
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

      // ─── FLOATING DAMAGE NUMBERS ───
      damagesRef.current.forEach(d => {
        d.y -= 1.2;
        d.life++;
        d.alpha = 1 - (d.life / d.maxLife);

        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 3;
        ctx.fillText(d.text, d.x, d.y);
        ctx.restore();
      });
      damagesRef.current = damagesRef.current.filter(d => d.life < d.maxLife);

      ctx.restore(); // end screen shake translation
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [playerHp, enemyHp, playerAttacking, enemyAttacking, playerHit, enemyHit, enemy.color]);

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 3);
  const progress = (wordIndex / Math.max(words.length, 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 select-none">
      {/* HUD metrics */}
      <div className="flex items-center gap-3">
        <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-mono font-bold text-white">{wpm} WPM</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5">
          <span className="font-mono text-sm text-white/60">{accuracy}% acc</span>
        </div>
        <div className="ml-auto font-mono text-sm text-white/40">
          {wordIndex} / {words.length} words
        </div>
      </div>

      {/* Fight arena wrapper */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="w-full h-[220px] block"
        />

        {/* Player HP */}
        <div className="absolute top-4 left-4 w-36 space-y-1 z-10 bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-400">YOU</span>
            <span className="text-xs font-mono text-white/50 ml-auto">{playerHp}/100</span>
          </div>
          <HealthBar value={playerHp} max={100} color="linear-gradient(to right, #34d399, #10b981)" />
        </div>

        {/* Enemy HP */}
        <div className="absolute top-4 right-4 w-36 space-y-1 z-10 bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs font-mono text-white/50">{enemyHp}/{enemy.hp}</span>
            <span className="text-xs font-mono font-bold ml-1" style={{ color: enemy.color }}>
              {enemy.name.toUpperCase()}
            </span>
            <Sword className="w-3 h-3 ml-1" style={{ color: enemy.color }} />
          </div>
          <HealthBar value={enemyHp} max={enemy.hp} color={enemy.color} />
        </div>

        {/* VS emblem */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/20 font-black text-2xl font-mono select-none pointer-events-none">
          VS
        </div>

        {/* Combo indicator label */}
        <AnimatePresence>
          {comboLabel && (
            <motion.div
              key={comboLabel + combo}
              initial={{ opacity: 1, y: 30, scale: 0.8 }}
              animate={{ opacity: 0, y: -20, scale: 1.4 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 font-black text-xl font-mono z-10 pointer-events-none drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
            >
              {comboLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Typing box */}
      <div className="bg-gray-900/80 border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
          <Sword className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400">COMBAT DRILL — type attack moves!</span>
          {combo > 1 && <span className="ml-auto text-yellow-400 font-bold">{combo}x COMBO ACTIVE</span>}
        </div>

        <div className="flex items-center justify-center gap-1 font-mono text-2xl md:text-3xl font-bold tracking-widest select-none py-1">
          {currentWord.split("").map((ch, i) => {
            let cls = "text-white/25";
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

        <div className="flex justify-center gap-4 pt-1">
          {nextWords.map((w, i) => (
            <span key={i} className="font-mono text-xs text-white/25">{w}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
