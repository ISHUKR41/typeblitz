import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useGetGame, useGetLevelWords, useCreateSession, getGetLevelWordsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, ArrowRight, Zap, RotateCcw, Home, CheckCircle, Volume2, VolumeX } from "lucide-react";
import { ArcadeArena } from "@/components/games/ArcadeArena";
import { soundEffects } from "@/lib/audio";
import { VirtualKeyboard } from "@/components/VirtualKeyboard";
import {
  isLevelUnlocked,
  isPassingResult,
  MIN_PASSING_ACCURACY,
  recordLevelResult,
} from "@/lib/progress";

const ARCADE_GAME_IDS = new Set(["turbo-race", "word-fighter", "zombie-hunt", "galaxy-blitz"]);

type LetterStatMap = Record<string, { attempts: number; correct: number }>;

function buildLetterStats(expectedText: string, typedText: string): LetterStatMap {
  const stats: LetterStatMap = {};
  const maxLen = Math.max(expectedText.length, typedText.length);

  for (let i = 0; i < maxLen; i++) {
    const expected = expectedText[i]?.toLowerCase();
    if (!expected || !/[a-z0-9]/.test(expected)) continue;

    stats[expected] ??= { attempts: 0, correct: 0 };
    stats[expected].attempts++;

    if (typedText[i]?.toLowerCase() === expected) {
      stats[expected].correct++;
    }
  }

  return stats;
}

// ─── WPM sparkline ────────────────────────────────────────────────────────
function WpmSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 100, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70 hidden sm:block">
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Render typed text char-by-char ──────────────────────────────────────
function TypedText({ text, input }: { text: string; input: string }) {
  return (
    <p className="font-mono text-lg md:text-xl lg:text-2xl leading-loose tracking-wide break-words select-none">
      {text.split("").map((char, i) => {
        let cls = "text-muted-foreground/50";
        if (i < input.length) {
          cls = input[i] === char
            ? "text-foreground"
            : char === " "
              ? "bg-destructive/30 text-destructive rounded"
              : "text-destructive bg-destructive/15 rounded-sm";
        } else if (i === input.length) {
          cls = "border-b-2 border-primary text-foreground animate-pulse";
        }
        return (
          <span key={i} className={`transition-colors duration-75 ${cls}`}>
            {char}
          </span>
        );
      })}
    </p>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────
function ResultsScreen({
  wpm, accuracy, duration, levelNumber, targetWpm, passed, nextLevelUnlocked,
  onRetry, onNext, onMenu,
}: {
  wpm: number; accuracy: number; duration: number; levelNumber: number; targetWpm: number;
  passed: boolean; nextLevelUnlocked: boolean;
  onRetry: () => void; onNext: () => void; onMenu: () => void;
}) {
  const grade = wpm >= 80 ? "S" : wpm >= 60 ? "A" : wpm >= 40 ? "B" : wpm >= 25 ? "C" : "D";
  const gradeColor = grade === "S" ? "text-yellow-400" : grade === "A" ? "text-primary" : grade === "B" ? "text-chart-2" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 22 }}
      className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden mx-4"
    >
      <div className={`${passed ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"} border-b px-5 py-4 flex items-center gap-3`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${passed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}>
          <Trophy className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold font-mono">{passed ? "LEVEL CLEARED" : "KEEP TRAINING"}</h2>
          <p className="text-xs text-muted-foreground">Target: {targetWpm} WPM + {MIN_PASSING_ACCURACY}% accuracy</p>
        </div>
        <div className={`text-4xl font-black font-mono ${gradeColor}`}>{grade}</div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "WPM", value: wpm, color: "text-primary", icon: Zap },
            { label: "Accuracy", value: `${accuracy}%`, color: "text-chart-2", icon: Target },
            { label: "Time", value: `${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,"0")}`, color: "text-chart-3", icon: Clock },
          ].map(s => (
            <div key={s.label} className="bg-background rounded-xl border border-border p-3 text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-2.5 text-xs">
          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {!passed
              ? `Reach ${targetWpm} WPM with ${MIN_PASSING_ACCURACY}%+ accuracy to unlock the next level.`
              : accuracy < 95
              ? `Focus on accuracy first — aim for 95%+ before pushing speed.`
              : nextLevelUnlocked
                ? `Level ${levelNumber + 1} unlocked. Keep the streak alive.`
                : levelNumber < 5
                ? `Level ${levelNumber + 1} unlocked — push for ${wpm + 10}+ WPM next!`
                : "All levels complete — challenge your score again!"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onMenu} className="gap-1.5 text-xs">
            <Home className="w-3 h-3" /> Menu
          </Button>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 text-xs">
            <RotateCcw className="w-3 h-3" /> Retry
          </Button>
          <Button size="sm" onClick={onNext} className="gap-1.5 text-xs" disabled={!passed || levelNumber >= 5}>
            Next <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Play page ───────────────────────────────────────────────────────
export default function Play() {
  const { gameId, level } = useParams();
  const levelNumber = parseInt(level || "1");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const isArcade = ARCADE_GAME_IDS.has(gameId ?? "");

  const { data: game } = useGetGame(gameId || "");
  const { data: levelContent } = useGetLevelWords(gameId || "", levelNumber, {
    query: { queryKey: getGetLevelWordsQueryKey(gameId || "", levelNumber), enabled: !!gameId && !!levelNumber }
  });
  const createSession = useCreateSession();
  const currentLevel = game?.levels?.find((l: any) => l.number === levelNumber);
  const targetWpm = currentLevel?.targetWpm ?? 40;
  const levelName = currentLevel?.name ?? "";

  // ── Standard game state ──────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [duration, setDuration] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [levelResult, setLevelResult] = useState<{ passed: boolean; nextLevelUnlocked: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [strictMode, setStrictMode] = useState(() => localStorage.getItem("typeblitz.strictMode") === "true");
  const [audioMuted, setAudioMuted] = useState(() => soundEffects.isMuted());
  const [showKeyboard, setShowKeyboard] = useState(() => localStorage.getItem("typeblitz.showKeyboard") !== "false");
  const [soundTheme, setSoundTheme] = useState(() => soundEffects.getTheme());

  // Industry-standard keystroke accuracy refs (persists even if user backspaces)
  const totalKeystrokesRef = useRef(0);
  const errorKeystrokesRef = useRef(0);

  const toggleStrictMode = () => {
    setStrictMode(prev => {
      const next = !prev;
      localStorage.setItem("typeblitz.strictMode", String(next));
      return next;
    });
  };

  // Ref-based correct chars so the interval always reads the latest value
  // (closures in setInterval would otherwise read stale state)
  const correctCharsRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // ── Arcade reset key ────────────────────────────────────────────────────
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (levelContent && !isArcade) {
      const raw = levelContent.text ? levelContent.text : (levelContent.words ?? []).join(" ");
      setText(raw);
      setInput("");
      setIsFinished(false);
      setStartTime(null);
      startTimeRef.current = null;
      setWpm(0);
      setAccuracy(100);
      setDuration(0);
      setWpmHistory([]);
      setLevelResult(null);
      correctCharsRef.current = 0;
      totalKeystrokesRef.current = 0;
      errorKeystrokesRef.current = 0;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (levelContent && isArcade) {
      setIsFinished(false);
      setLevelResult(null);
      setResetKey(k => k + 1);
    }
  }, [levelContent, isArcade]);

  // Live WPM ticker — uses correctCharsRef so it always has fresh data
  useEffect(() => {
    if (isFinished || isArcade) return;
    const id = setInterval(() => {
      if (!startTimeRef.current) return;
      const secs = (Date.now() - startTimeRef.current) / 1000;
      const mins = secs / 60;
      setDuration(Math.floor(secs));
      if (mins > 0) {
        // Industry-standard WPM: CORRECT chars only / 5 / minutes
        const live = Math.round((correctCharsRef.current / 5) / mins);
        setWpm(live);
        setWpmHistory(h => [...h.slice(-29), live]);
      }
    }, 800);
    return () => clearInterval(id);
  }, [isFinished, isArcade]);

  // Keep focus on the hidden input
  useEffect(() => {
    if (isArcade) return;
    const fn = () => inputRef.current?.focus();
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [isArcade]);

  const saveSession = useCallback((
    finalWpm: number,
    finalAcc: number,
    finalDuration: number,
    typedTextForStats?: string,
  ) => {
    if (user && gameId) {
      const sourceText =
        isArcade
          ? (levelContent?.words ?? levelContent?.text?.split(/\s+/) ?? []).join(" ")
          : text;
      const letterErrors =
        typedTextForStats && sourceText
          ? JSON.stringify(buildLetterStats(sourceText, typedTextForStats))
          : null;

      createSession.mutate({
        data: {
          userId: user.id,
          gameId,
          gameMode: gameId,
          wpm: finalWpm,
          accuracy: finalAcc,
          duration: finalDuration,
          level: levelNumber,
          letterErrors,
        }
      });
    }
  }, [user, gameId, isArcade, levelContent, levelNumber, text, createSession]);

  const finishGame = useCallback((finalInput: string, tStart: number) => {
    const secs = (Date.now() - tStart) / 1000;
    const mins = secs / 60;
    // Count only CORRECTLY typed characters for WPM (industry standard)
    let correct = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === text[i]) correct++;
    }
    const finalWpm = Math.round((correct / 5) / Math.max(mins, 0.01));
    const totalK = totalKeystrokesRef.current;
    const errorK = errorKeystrokesRef.current;
    const finalAcc = totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100;
    
    const progressResult = gameId
      ? recordLevelResult({ gameId, level: levelNumber, wpm: finalWpm, accuracy: finalAcc, targetWpm })
      : { passed: isPassingResult(finalWpm, finalAcc, targetWpm), nextLevelUnlocked: false };
    
    if (progressResult.passed) {
      soundEffects.playVictory();
    } else {
      soundEffects.playDefeat();
    }

    setIsFinished(true);
    setLevelResult({ passed: progressResult.passed, nextLevelUnlocked: progressResult.nextLevelUnlocked });
    setWpm(finalWpm);
    setAccuracy(finalAcc);
    setDuration(Math.floor(secs));
    saveSession(finalWpm, finalAcc, Math.floor(secs), finalInput);
  }, [gameId, levelNumber, targetWpm, text, saveSession]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Start timer on first keystroke
    if (!startTimeRef.current && val.length > 0) {
      const now = Date.now();
      startTimeRef.current = now;
      setStartTime(now);
    }

    if (val.length > input.length) {
      // Keystroke typed
      totalKeystrokesRef.current += 1;
      const typedChar = val[val.length - 1];
      const expectedChar = text[val.length - 1];
      if (typedChar === expectedChar) {
        soundEffects.playClick(typedChar === " ");
      } else {
        errorKeystrokesRef.current += 1;
        soundEffects.playError();
        if (strictMode) {
          // Block input in strict mode
          const totalK = totalKeystrokesRef.current;
          const errorK = errorKeystrokesRef.current;
          setAccuracy(totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100);
          return;
        }
      }
    } else if (val.length < input.length) {
      // Backspace pressed
      soundEffects.playClick(false);
    }

    // Count correct chars in real-time (for live WPM via ref)
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correct++;
    }
    correctCharsRef.current = correct;

    // Real-time Keystroke accuracy
    const totalK = totalKeystrokesRef.current;
    const errorK = errorKeystrokesRef.current;
    setAccuracy(totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100);
    setInput(val);

    // Check completion
    if (val.length >= text.length) {
      finishGame(val, startTimeRef.current ?? Date.now());
    }
  };

  const handleRetry = () => {
    setInput("");
    setIsFinished(false);
    setStartTime(null);
    startTimeRef.current = null;
    setWpm(0);
    setAccuracy(100);
    setDuration(0);
    setWpmHistory([]);
    setLevelResult(null);
    correctCharsRef.current = 0;
    totalKeystrokesRef.current = 0;
    errorKeystrokesRef.current = 0;
    setResetKey(k => k + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const progress = text.length > 0 ? Math.min((input.length / text.length) * 100, 100) : 0;

  if (!game || !levelContent) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-mono text-sm">Loading Arena...</p>
        </div>
      </div>
    );
  }

  // ── ARCADE games ──────────────────────────────────────────────────────────
  if (gameId && !isLevelUnlocked(gameId, levelNumber)) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-5"
        >
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Level Locked</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Clear level {levelNumber - 1} with target WPM and {MIN_PASSING_ACCURACY}%+ accuracy to unlock this task.
            </p>
          </div>
          <Button onClick={() => setLocation("/games")} className="w-full gap-2">
            <Home className="w-4 h-4" />
            Back to Games
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isArcade) {
    const words = levelContent.words ?? levelContent.text?.split(" ") ?? [];
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-3 md:p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/4 rounded-full blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`arcade-${resetKey}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="w-full z-10"
            >
              <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                    {game.name} · Level {levelNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{levelName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/games")}
                  className="text-xs gap-1 text-muted-foreground"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit</span>
                </Button>
              </div>

              <ArcadeArena
                key={resetKey}
                words={words}
                gameId={gameId ?? ""}
                levelNumber={levelNumber}
                targetWpm={targetWpm}
                strictMode={strictMode}
                onComplete={(finalWpm, finalAcc, finalDuration, typedText) => {
                  const progressResult = gameId
                    ? recordLevelResult({ gameId, level: levelNumber, wpm: finalWpm, accuracy: finalAcc, targetWpm })
                    : { passed: isPassingResult(finalWpm, finalAcc, targetWpm), nextLevelUnlocked: false };
                  setWpm(finalWpm);
                  setAccuracy(finalAcc);
                  setDuration(finalDuration);
                  setLevelResult({ passed: progressResult.passed, nextLevelUnlocked: progressResult.nextLevelUnlocked });
                  setIsFinished(true);
                  saveSession(finalWpm, finalAcc, finalDuration, typedText);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="arcade-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="z-10 flex items-center justify-center w-full"
            >
              <ResultsScreen
                wpm={wpm}
                accuracy={accuracy}
                duration={duration}
                levelNumber={levelNumber}
                targetWpm={targetWpm}
                passed={levelResult?.passed ?? isPassingResult(wpm, accuracy, targetWpm)}
                nextLevelUnlocked={levelResult?.nextLevelUnlocked ?? false}
                onRetry={handleRetry}
                onNext={() => setLocation(`/play/${gameId}/${Math.min(levelNumber + 1, 5)}`)}
                onMenu={() => setLocation("/games")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── STANDARD text-stream games ────────────────────────────────────────────
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-3 md:p-6 lg:p-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/5 rounded-full blur-[90px]" />
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="w-full max-w-4xl space-y-4 z-10"
          >
            {/* HUD */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest truncate">
                  {game.name} · Level {levelNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{levelName}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <WpmSparkline data={wpmHistory} />
                {/* Keyboard Visualizer Toggle */}
                <button
                  onClick={() => {
                    setShowKeyboard(prev => {
                      const next = !prev;
                      localStorage.setItem("typeblitz.showKeyboard", String(next));
                      return next;
                    });
                  }}
                  className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold transition-all ${
                    showKeyboard
                      ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                  }`}
                  title="Toggle keyboard visual helper"
                >
                  <span>⌨️ {showKeyboard ? "HELP ON" : "HELP OFF"}</span>
                </button>
                {/* Strict Mode Toggle */}
                <button
                  onClick={toggleStrictMode}
                  className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold transition-all ${
                    strictMode
                      ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/20 shadow-md shadow-red-500/5 animate-pulse"
                      : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                  }`}
                  title="Strict Mode blocks wrong keys and requires immediate correction"
                >
                  <Target className={`w-3.5 h-3.5 ${strictMode ? "text-red-400" : "text-muted-foreground"}`} />
                  <span>{strictMode ? "STRICT ON" : "STRICT OFF"}</span>
                </button>
                {/* Sound Theme Selector */}
                <div className="flex items-center gap-1">
                  <select
                    value={soundTheme}
                    onChange={e => {
                      const nextTheme = e.target.value as "mechanical" | "typewriter" | "cyber";
                      soundEffects.setTheme(nextTheme);
                      setSoundTheme(nextTheme);
                      if (audioMuted) {
                        soundEffects.setMuted(false);
                        setAudioMuted(false);
                      }
                      soundEffects.playClick(false);
                    }}
                    className="bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted transition-all"
                    title="Select sound effects feedback style"
                  >
                    <option value="mechanical">🔊 Mechanical</option>
                    <option value="typewriter">🔊 Typewriter</option>
                    <option value="cyber">🔊 Cyber Synth</option>
                  </select>
                  <button
                    onClick={() => {
                      const next = !audioMuted;
                      soundEffects.setMuted(next);
                      setAudioMuted(next);
                    }}
                    className={`border rounded-xl p-1.5 transition-all ${
                      !audioMuted ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/50 border-border text-muted-foreground"
                    }`}
                    title="Mute/unmute sounds"
                  >
                    {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
                  </button>
                </div>
                {/* WPM */}
                <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono font-bold text-base">{wpm}</span>
                  <span className="text-xs text-muted-foreground">WPM</span>
                </div>
                {/* Accuracy */}
                <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-1.5">
                  <Target className="w-3.5 h-3.5 text-chart-2" />
                  <span className="font-mono font-bold text-base">{accuracy}%</span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-sm">
                    {Math.floor(duration/60)}:{(duration%60).toString().padStart(2,"0")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/games")}
                  className="text-xs text-muted-foreground gap-1 hidden sm:flex"
                >
                  <Home className="w-3.5 h-3.5" /> Exit
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>

            {/* Text display */}
            <div
              className="relative p-4 md:p-6 lg:p-8 bg-card border border-border rounded-2xl shadow-xl cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <TypedText text={text} input={input} />
            </div>

            {/* Visual Keyboard Guide */}
            {showKeyboard && (
              <div className="z-10 relative">
                <VirtualKeyboard nextChar={text[input.length]} />
              </div>
            )}

            {!startTime && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-muted-foreground"
              >
                Click here and start typing — timer starts on first keystroke
              </motion.p>
            )}

            <div className="flex justify-between text-xs text-muted-foreground font-mono px-1">
              <span>{input.length} / {text.length} chars</span>
              <span>Target: {targetWpm} WPM</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-10 flex items-center justify-center w-full"
          >
            <ResultsScreen
              wpm={wpm}
              accuracy={accuracy}
              duration={duration}
              levelNumber={levelNumber}
              targetWpm={targetWpm}
              passed={levelResult?.passed ?? isPassingResult(wpm, accuracy, targetWpm)}
              nextLevelUnlocked={levelResult?.nextLevelUnlocked ?? false}
              onRetry={handleRetry}
              onNext={() => setLocation(`/play/${gameId}/${Math.min(levelNumber + 1, 5)}`)}
              onMenu={() => setLocation("/games")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
