import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ArcadeProps } from "./ArcadeArena";
import { Cpu, Shield, Wifi, Lock, Unlock, Activity } from "lucide-react";
import { soundEffects } from "@/lib/audio";

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  word: string;
  label: string;
  hacked: boolean;
  hacking: boolean;
  hackProgress: number;
  pulse: number;
  connections: number[];
  isTarget: boolean;
  isBoss: boolean;
}

interface MatrixDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  alpha: number;
  length: number;
}

interface HackParticle {
  x: number; y: number; vx: number; vy: number;
  color: string; alpha: number; life: number; maxLife: number; size: number;
}

const MATRIX_CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function CyberHeistGame({
  words, wordIndex, currentInput, wpm, accuracy, progress,
  lastWordCorrect, submissionCount, comboStreak, mistakeCount,
}: ArcadeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const dropsRef = useRef<MatrixDrop[]>([]);
  const particlesRef = useRef<HackParticle[]>([]);
  const prevSubmissionRef = useRef(submissionCount);
  const scanLineRef = useRef(0);
  const glitchRef = useRef(0);
  const [hackedCount, setHackedCount] = useState(0);
  // Stable refs — keep animation loop from restarting on every prop change
  const wpmRef         = useRef(wpm);         wpmRef.current         = wpm;
  const accuracyRef    = useRef(accuracy);    accuracyRef.current    = accuracy;
  const progressRef    = useRef(progress);    progressRef.current    = progress;
  const comboStreakRef = useRef(comboStreak); comboStreakRef.current = comboStreak;
  const hackedCountRef = useRef(hackedCount); hackedCountRef.current = hackedCount;

  const initNodes = useCallback(() => {
    if (!canvasRef.current) return;
    const w = 800, h = 220;
    const GRID = [
      { id: 0, x: w * 0.12, y: h * 0.25, label: "PROXY", connections: [1, 2] },
      { id: 1, x: w * 0.28, y: h * 0.12, label: "GATE-A", connections: [3] },
      { id: 2, x: w * 0.28, y: h * 0.78, label: "GATE-B", connections: [3] },
      { id: 3, x: w * 0.48, y: h * 0.45, label: "FIREWALL", connections: [4, 5] },
      { id: 4, x: w * 0.67, y: h * 0.18, label: "SERVER-1", connections: [6] },
      { id: 5, x: w * 0.67, y: h * 0.72, label: "SERVER-2", connections: [6] },
      { id: 6, x: w * 0.86, y: h * 0.45, label: "MAINFRAME", connections: [] },
    ];
    nodesRef.current = GRID.map((n, i) => ({
      ...n,
      word: words[Math.min(i, words.length - 1)] ?? "hack",
      hacked: false, hacking: false, hackProgress: 0,
      pulse: Math.random() * Math.PI * 2,
      isTarget: i === 0,
      isBoss: i === GRID.length - 1,
    }));
  }, [words]);

  useEffect(() => { initNodes(); }, [initNodes]);

  // React to correct word submission — advance hack
  useEffect(() => {
    if (submissionCount === prevSubmissionRef.current) return;
    prevSubmissionRef.current = submissionCount;
    if (!lastWordCorrect) {
      glitchRef.current = 12;
      return;
    }
    const targetIdx = nodesRef.current.findIndex(n => n.isTarget && !n.hacked);
    if (targetIdx === -1) return;
    const node = nodesRef.current[targetIdx];
    // Burst particles from node
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 3;
      particlesRef.current.push({
        x: node.x, y: node.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        color: "#22c55e", alpha: 1, life: 0, maxLife: 30 + Math.random() * 20, size: 2 + Math.random() * 3,
      });
    }
    // Mark node hacked, unlock connected
    nodesRef.current[targetIdx].hacked = true;
    nodesRef.current[targetIdx].hackProgress = 100;
    setHackedCount(c => c + 1);
    // Set next target
    const connections = nodesRef.current[targetIdx].connections;
    connections.forEach(cid => {
      const n = nodesRef.current.find(n => n.id === cid);
      if (n && !n.hacked) {
        n.isTarget = true;
        n.word = words[Math.min(wordIndex + 1, words.length - 1)] ?? n.word;
      }
    });
    soundEffects.playLaser();
  }, [submissionCount, lastWordCorrect, words, wordIndex]);

  // Responsive canvas sizing
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    // Init matrix drops
    if (dropsRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        dropsRef.current.push({
          x: Math.random() * 800,
          y: Math.random() * 220 - 220,
          speed: 0.8 + Math.random() * 1.8,
          chars: Array.from({ length: 8 }, () => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]),
          alpha: 0.05 + Math.random() * 0.12,
          length: 4 + Math.floor(Math.random() * 8),
        });
      }
    }

    let lastFrameT = 0;
    const render = (ts: number) => {
      const dt = Math.min(ts - (lastFrameT || ts), 50);
      lastFrameT = ts;
      const DT = dt / 16.667;
      const w = canvas.width, h = canvas.height;
      scanLineRef.current = (scanLineRef.current + DT) % h;
      if (glitchRef.current > 0) glitchRef.current -= DT;
      const t = Date.now();

      // Background — deep dark
      ctx.fillStyle = "#020808";
      ctx.fillRect(0, 0, w, h);

      // Matrix rain background
      dropsRef.current.forEach(d => {
        d.y += d.speed * DT;
        if (d.y > h + 60) { d.y = -60; d.x = Math.random() * w; }
        if (Math.random() < 0.06) d.chars[Math.floor(Math.random() * d.chars.length)] = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        d.chars.forEach((ch, ci) => {
          const cy = d.y + ci * 12;
          if (cy < 0 || cy > h) return;
          const isHead = ci === d.chars.length - 1;
          ctx.font = `${isHead ? "bold " : ""}9px monospace`;
          ctx.fillStyle = isHead
            ? `rgba(100,255,120,${d.alpha * 3})`
            : `rgba(0,${80 + ci * 15},30,${d.alpha * (1 - ci / d.chars.length)})`;
          ctx.fillText(ch, d.x, cy);
        });
      });

      // Grid pattern
      ctx.strokeStyle = "rgba(0,255,80,0.04)";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < w; gx += 32) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 32) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }

      // Glitch effect on error
      if (glitchRef.current > 0) {
        const gSlices = 3;
        for (let gi = 0; gi < gSlices; gi++) {
          const gy1 = Math.random() * h;
          const gH = 8 + Math.random() * 20;
          const gOff = (Math.random() - 0.5) * 20;
          ctx.save();
          ctx.globalAlpha = 0.3;
          const imgData = ctx.getImageData(0, gy1, w, gH);
          ctx.putImageData(imgData, gOff, gy1);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Draw connections between nodes
      nodesRef.current.forEach(node => {
        node.connections.forEach(cid => {
          const target = nodesRef.current.find(n => n.id === cid);
          if (!target) return;
          const isActive = node.hacked;
          ctx.save();
          ctx.strokeStyle = isActive ? `rgba(34,197,94,0.7)` : `rgba(0,100,30,0.25)`;
          ctx.lineWidth = isActive ? 2 : 1;
          if (isActive) {
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 8;
          }
          // Animated dash offset
          ctx.setLineDash([6, 4]);
          ctx.lineDashOffset = -(t / 80) % 10;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Data packet animation on hacked connections
          if (isActive) {
            const pct = ((t / 600) % 1);
            const px = node.x + (target.x - node.x) * pct;
            const py = node.y + (target.y - node.y) * pct;
            ctx.fillStyle = "#86efac";
            ctx.shadowColor = "#22c55e";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      });

      // Draw nodes
      nodesRef.current.forEach(node => {
        node.pulse += 0.04;
        const pulseScale = 1 + Math.sin(node.pulse) * 0.08;
        const r = node.isBoss ? 18 : 13;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Hacked glow ring
        if (node.hacked) {
          ctx.shadowColor = "#22c55e";
          ctx.shadowBlur = 20;
          ctx.strokeStyle = `rgba(34,197,94,${0.4 + Math.sin(node.pulse) * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, r * pulseScale * 1.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Target pulsing ring
        if (node.isTarget && !node.hacked) {
          ctx.strokeStyle = `rgba(251,191,36,${0.5 + Math.sin(node.pulse * 2) * 0.4})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(0, 0, r * 1.7 + Math.sin(node.pulse * 2) * 3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Node circle fill
        const nodeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        if (node.hacked) {
          nodeGrad.addColorStop(0, "rgba(34,197,94,0.6)");
          nodeGrad.addColorStop(1, "rgba(20,83,45,0.95)");
        } else if (node.isTarget) {
          nodeGrad.addColorStop(0, "rgba(251,191,36,0.5)");
          nodeGrad.addColorStop(1, "rgba(120,53,15,0.9)");
        } else if (node.isBoss) {
          nodeGrad.addColorStop(0, "rgba(239,68,68,0.5)");
          nodeGrad.addColorStop(1, "rgba(127,29,29,0.9)");
        } else {
          nodeGrad.addColorStop(0, "rgba(15,80,40,0.6)");
          nodeGrad.addColorStop(1, "rgba(2,20,10,0.95)");
        }
        ctx.fillStyle = nodeGrad;
        ctx.strokeStyle = node.hacked ? "#22c55e" : node.isTarget ? "#fbbf24" : "rgba(34,197,94,0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Icon inside node
        ctx.fillStyle = node.hacked ? "#86efac" : node.isTarget ? "#fde68a" : "rgba(34,197,94,0.4)";
        ctx.font = `bold ${node.isBoss ? 10 : 8}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.hacked ? "✓" : node.isBoss ? "⬡" : "▣", 0, 0);
        ctx.textBaseline = "alphabetic";

        // Node label
        ctx.fillStyle = node.hacked ? "#86efac" : node.isTarget ? "#fde68a" : "rgba(150,200,150,0.5)";
        ctx.font = `bold ${Math.floor(6 + (node.isBoss ? 1 : 0))}px monospace`;
        ctx.fillText(node.label, 0, r + 10);

        // Word label for target node
        if (node.isTarget && !node.hacked) {
          ctx.fillStyle = "#fde68a";
          ctx.shadowColor = "#fbbf24";
          ctx.shadowBlur = 6;
          ctx.font = "bold 8px monospace";
          ctx.fillText(`[${node.word.toUpperCase()}]`, 0, -r - 6);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx * DT; p.y += p.vy * DT; p.life += DT;
        p.vy -= 0.05 * DT;
        p.alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // Scan line
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = "#00ff40";
      ctx.fillRect(0, scanLineRef.current, w, 2);
      ctx.restore();

      // HUD — top overlay
      ctx.save();
      ctx.fillStyle = "rgba(0,20,10,0.7)";
      ctx.fillRect(0, 0, w, 22);
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`// CYBER HEIST v2.0  |  NODES: ${hackedCountRef.current}/${nodesRef.current.length}  |  WPM: ${wpmRef.current}  |  ACC: ${accuracyRef.current}%  |  COMBO: x${comboStreakRef.current}`, 8, 14);
      ctx.fillStyle = "rgba(34,197,94,0.5)";
      ctx.fillRect(0, 21, (progressRef.current / 100) * w, 1);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentWord = words[wordIndex] ?? "";
  const nextWords = words.slice(wordIndex + 1, wordIndex + 3);
  const targetNode = nodesRef.current.find(n => n.isTarget && !n.hacked);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 select-none">
      {/* HUD */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="bg-black/80 border border-green-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-green-400" />
          <span className="font-mono font-bold text-green-400">{wpm}</span>
          <span className="text-green-600 text-xs">WPM</span>
        </div>
        <div className="bg-black/80 border border-green-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-green-300">
          {accuracy}% ACC
        </div>
        <div className="bg-black/80 border border-yellow-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-yellow-300">
          x{comboStreak} COMBO
        </div>
        <div className="bg-black/80 border border-green-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-green-400">
          {hackedCount}/{nodesRef.current.length} NODES HACKED
        </div>
        {targetNode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5 font-mono text-xs text-yellow-300 flex items-center gap-1">
            <Wifi className="w-3 h-3" /> TARGET: {targetNode.label}
          </div>
        )}
        <div className="ml-auto font-mono text-xs text-green-600">{mistakeCount} errors</div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/10">
        <canvas ref={canvasRef} height={220} className="w-full h-[220px] block" />
      </div>

      {/* Terminal typing tray */}
      <div className="bg-black/90 border border-green-500/25 rounded-2xl p-4 font-mono shadow-inner">
        <div className="text-green-600 text-xs mb-2">
          {targetNode
            ? `root@typeblitz:~# ./hack --target ${targetNode.label} --key`
            : "root@typeblitz:~# [NETWORK COMPROMISED — MISSION COMPLETE]"}
        </div>
        <div className="flex items-center justify-center gap-0.5 text-2xl md:text-3xl font-bold tracking-widest mb-2">
          <span className="text-green-600 mr-2">{">"}</span>
          {currentWord.split("").map((ch, i) => {
            let cls = "text-green-900";
            if (i < currentInput.length) {
              cls = currentInput[i] === ch ? "text-green-400 drop-shadow-[0_0_6px_#22c55e]" : "text-red-400 bg-red-500/20 rounded";
            } else if (i === currentInput.length) {
              cls = "text-green-300 border-b-2 border-green-400 animate-pulse";
            }
            return <span key={i} className={`transition-all duration-50 ${cls}`}>{ch}</span>;
          })}
        </div>
        <div className="flex gap-4 justify-center">
          {nextWords.map((w, i) => (
            <span key={i} className="text-green-800 text-sm">{w}</span>
          ))}
        </div>
      </div>

      <div className="flex justify-between text-xs text-green-800 font-mono px-1">
        <span>PROGRESS: {Math.round(progress)}%</span>
        <span>{wordIndex}/{words.length} commands executed</span>
      </div>
    </div>
  );
}
