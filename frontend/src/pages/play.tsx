import React, { useState, useEffect, useRef, useCallback } from "react";
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

const ARCADE_GAME_IDS = new Set(["turbo-race", "word-fighter", "zombie-hunt", "galaxy-blitz", "meteor-storm", "neon-runner", "snake-typer", "word-invaders", "code-rain", "cyber-heist", "arena-blitz", "bubble-pop", "fruit-blitz"]);

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

// ─── Render typed text word-by-word with char-level accuracy + auto-scroll ──
function TypedText({ text, input }: { text: string; input: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorSpanRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll: keep cursor roughly in the second visible line
  useEffect(() => {
    const container = containerRef.current;
    const cursor = cursorSpanRef.current;
    if (!container || !cursor) return;
    const lineH = cursor.offsetHeight || 36;
    const targetScrollTop = Math.max(0, cursor.offsetTop - lineH * 1.1);
    container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
  }, [input.length]);

  // Pre-compute word start indices and submitted word correctness
  const textWords = text.split(" ");
  const inputParts = input.split(" ");
  const submittedCount = inputParts.length - 1; // words submitted by pressing space

  const wordStarts: number[] = [];
  let ci = 0;
  for (let wi = 0; wi < textWords.length; wi++) {
    wordStarts.push(ci);
    ci += textWords[wi].length + (wi < textWords.length - 1 ? 1 : 0);
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden select-none"
      style={{ height: "6.2em" }}
    >
      <p
        className="text-lg md:text-xl lg:text-2xl leading-loose break-words"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", letterSpacing: "0.025em" }}
      >
        {textWords.map((word, wi) => {
          const start = wordStarts[wi];
          const isSubmitted = wi < submittedCount;
          const wordWrong = isSubmitted && (inputParts[wi] ?? "") !== word;

          // Char-level spans for this word
          const charSpans = word.split("").map((char, ci2) => {
            const idx = start + ci2;
            let cls = "char-untyped";
            if (idx < input.length) cls = input[idx] === char ? "char-correct" : "char-wrong";
            else if (idx === input.length) cls = "char-cursor";
            return (
              <span key={idx} className={cls} ref={idx === input.length ? cursorSpanRef : undefined}>
                {char}
              </span>
            );
          });

          // Space char after each word except the last
          const spaceIdx = start + word.length;
          const spaceEl = wi < textWords.length - 1 ? (() => {
            let spaceCls = "char-untyped";
            if (spaceIdx < input.length) spaceCls = input[spaceIdx] === " " ? "char-correct" : "char-wrong-space";
            else if (spaceIdx === input.length) spaceCls = "char-cursor";
            return (
              <span key={`s${spaceIdx}`} className={spaceCls} ref={spaceIdx === input.length ? cursorSpanRef : undefined}>{" "}</span>
            );
          })() : null;

          const wordCorrect = isSubmitted && !wordWrong;

          return (
            <React.Fragment key={wi}>
              {wordWrong
                ? <span className="word-wrong-submitted">{charSpans}</span>
                : wordCorrect
                ? <span className="word-correct-submitted">{charSpans}</span>
                : charSpans}
              {spaceEl}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}

// ─── Results screen ───────────────────────────────────────────────────────
function ResultsScreen({
  wpm, accuracy, duration, levelNumber, targetWpm, passed, nextLevelUnlocked,
  wordBreakdown, onRetry, onNext, onMenu,
}: {
  wpm: number; accuracy: number; duration: number; levelNumber: number; targetWpm: number;
  passed: boolean; nextLevelUnlocked: boolean;
  wordBreakdown?: { total: number; correct: number; wrong: number };
  onRetry: () => void; onNext: () => void; onMenu: () => void;
}) {
  const grade = wpm >= 80 ? "S" : wpm >= 60 ? "A" : wpm >= 40 ? "B" : wpm >= 25 ? "C" : "D";
  const gradeColor = grade === "S" ? "text-yellow-400" : grade === "A" ? "text-primary" : grade === "B" ? "text-chart-2" : "text-muted-foreground";

  const passedGlow = passed
    ? "0 0 60px rgba(0,245,255,0.18), 0 8px 40px rgba(0,0,0,0.7)"
    : "0 0 40px rgba(255,32,121,0.12), 0 8px 32px rgba(0,0,0,0.7)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.90, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 280 }}
      className="max-w-lg w-full overflow-hidden mx-4"
      style={{
        background: "rgb(20,20,24)",
        border: passed ? "1px solid rgba(0,245,255,0.22)" : "1px solid rgba(255,32,121,0.22)",
        borderRadius: "28px",
        boxShadow: passedGlow,
      }}
    >
      {/* Pass/Fail banner */}
      <div
        className="px-6 py-5 flex items-center gap-4 relative overflow-hidden"
        style={{
          background: passed
            ? "linear-gradient(135deg, rgba(0,245,255,0.14) 0%, rgba(57,255,20,0.06) 100%)"
            : "linear-gradient(135deg, rgba(255,32,121,0.14) 0%, rgba(255,0,0,0.05) 100%)",
          borderBottom: passed ? "1px solid rgba(0,245,255,0.15)" : "1px solid rgba(255,32,121,0.15)",
        }}
      >
        <div className="absolute right-6 top-1/2 -translate-y-1/2"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "72px", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, opacity: 0.12, color: passed ? "#00F5FF" : "#FF2079" }}>
          {grade}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0`}
          style={{ background: passed ? "rgba(0,245,255,0.18)" : "rgba(255,32,121,0.18)" }}>
          <Trophy className="w-6 h-6" style={{ color: passed ? "#00F5FF" : "#FF2079" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", color: passed ? "#00F5FF" : "#FF2079" }}>
            {passed ? "LEVEL CLEARED" : "KEEP TRAINING"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Target: {targetWpm} WPM + {MIN_PASSING_ACCURACY}% accuracy</p>
        </div>
        <div className={`text-5xl font-black relative z-10 ${gradeColor}`}
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.04em" }}>{grade}</div>
      </div>

      <div className="p-5 space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "WPM", value: wpm, rawColor: "#00F5FF", shadow: "rgba(0,245,255,0.5)", icon: Zap },
            { label: "Accuracy", value: `${accuracy}%`, rawColor: accuracy >= 95 ? "#39FF14" : accuracy >= 80 ? "#FFB800" : "#FF2079", shadow: accuracy >= 95 ? "rgba(57,255,20,0.5)" : accuracy >= 80 ? "rgba(255,184,0,0.5)" : "rgba(255,32,121,0.5)", icon: Target },
            { label: "Time", value: `${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,"0")}`, rawColor: "#a78bfa", shadow: "rgba(167,139,250,0.4)", icon: Clock },
          ].map(s => (
            <div key={s.label} className="rounded-[14px] border border-border/60 p-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
              <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.rawColor }} />
              <div className="text-xl font-black font-mono" style={{ color: s.rawColor, textShadow: `0 0 8px ${s.shadow}` }}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Word breakdown — shows exactly which words counted toward WPM */}
        {wordBreakdown && wordBreakdown.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2">
              <div className="text-lg font-black font-mono text-emerald-400">{wordBreakdown.correct}</div>
              <div className="text-emerald-400/70 font-semibold">correct words</div>
              <div className="text-muted-foreground/60 text-[10px]">counted in WPM</div>
            </div>
            <div className={`${wordBreakdown.wrong > 0 ? "bg-red-500/10 border-red-500/25" : "bg-muted/30 border-border"} border rounded-xl py-2`}>
              <div className={`text-lg font-black font-mono ${wordBreakdown.wrong > 0 ? "text-red-400" : "text-muted-foreground"}`}>{wordBreakdown.wrong}</div>
              <div className={`font-semibold ${wordBreakdown.wrong > 0 ? "text-red-400/70" : "text-muted-foreground"}`}>wrong words</div>
              <div className="text-muted-foreground/60 text-[10px]">contributed 0 WPM</div>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl py-2">
              <div className="text-lg font-black font-mono">{wordBreakdown.total}</div>
              <div className="text-muted-foreground font-semibold">total words</div>
              <div className="text-muted-foreground/60 text-[10px]">
                {wordBreakdown.total > 0 ? `${Math.round((wordBreakdown.correct / wordBreakdown.total) * 100)}% word accuracy` : ""}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-2.5 text-xs">
          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {!passed
              ? `Reach ${targetWpm} WPM with ${MIN_PASSING_ACCURACY}%+ accuracy to unlock the next level.`
              : accuracy < 95
              ? `Focus on accuracy first — aim for 95%+ before pushing speed.`
              : nextLevelUnlocked
                ? `Level ${levelNumber + 1} unlocked. Keep the streak alive.`
                : levelNumber < 8
                ? `Level ${levelNumber + 1} unlocked — push for ${wpm + 10}+ WPM next!`
                : "All 8 levels complete — you are a TypeBlitz master!"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onMenu} className="gap-1.5 text-xs">
            <Home className="w-3 h-3" /> Menu
          </Button>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 text-xs">
            <RotateCcw className="w-3 h-3" /> Retry
          </Button>
          <Button size="sm" onClick={onNext} className="gap-1.5 text-xs" disabled={!passed || levelNumber >= 8}>
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

  // Word-level accuracy tracking (live HUD display)
  const [wordStats, setWordStats] = useState({ total: 0, correct: 0, wrong: 0 });
  // Final word breakdown stored on game completion for the results screen
  const [finalWordBreakdown, setFinalWordBreakdown] = useState<{ total: number; correct: number; wrong: number } | undefined>(undefined);

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
      setWordStats({ total: 0, correct: 0, wrong: 0 });
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
    // ▶ STRICT word-based WPM — only fully correct words contribute
    // char-position matching inflates WPM when a wrong word happens to align; word-split prevents this
    const _textWords  = text.trim().split(/\s+/);
    const _typedWords = finalInput.trim().split(/\s+/);
    let correctChars = 0;
    for (let i = 0; i < _textWords.length; i++) {
      if ((_typedWords[i] ?? "") === _textWords[i]) {
        correctChars += _textWords[i].length + (i < _textWords.length - 1 ? 1 : 0);
      }
    }
    const finalWpm = Math.round((correctChars / 5) / Math.max(mins, 0.01));
    const totalK = totalKeystrokesRef.current;
    const errorK = errorKeystrokesRef.current;
    const finalAcc = totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100;

    // Compute word-level breakdown for the results screen
    let correctWordCount = 0;
    let wrongWordCount = 0;
    for (let i = 0; i < _textWords.length; i++) {
      if ((_typedWords[i] ?? "") === _textWords[i]) correctWordCount++;
      else wrongWordCount++;
    }
    setFinalWordBreakdown({ total: _textWords.length, correct: correctWordCount, wrong: wrongWordCount });

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

    // ▶ STRICT live WPM — word-by-word, only fully correct words (submitted via space) count
    // Wrong words contribute ZERO — consistent with arcade mode and monkeytype standard
    const _tWords = text.split(" ");
    const _iParts = val.split(" ");
    let correct = 0;
    let correctWordCount = 0;
    const totalSubmitted = Math.max(0, _iParts.length - 1);
    for (let wi = 0; wi < totalSubmitted; wi++) {
      if ((_iParts[wi] ?? "") === (_tWords[wi] ?? "")) {
        correct += (_tWords[wi]?.length ?? 0) + 1; // +1 for space
        correctWordCount++;
      }
    }
    // Current word: count sequential chars from start up to first mismatch
    const _cwi = _iParts.length - 1;
    const _curr = _iParts[_cwi] ?? "";
    const _exp  = _tWords[_cwi] ?? "";
    for (let ci = 0; ci < _curr.length; ci++) {
      if (ci >= _exp.length || _curr[ci] !== _exp[ci]) break;
      correct++;
    }
    correctCharsRef.current = correct;
    // Update live word stats for HUD display
    setWordStats({ total: totalSubmitted, correct: correctWordCount, wrong: totalSubmitted - correctWordCount });

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
    setWordStats({ total: 0, correct: 0, wrong: 0 });
    setFinalWordBreakdown(undefined);
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
                onNext={() => setLocation(`/play/${gameId}/${Math.min(levelNumber + 1, 8)}`)}
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
                {/* Word accuracy — shows correct vs wrong words clearly */}
                {wordStats.total > 0 && (
                  <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2.5 py-1.5" title="Correct words / Total words typed">
                    <CheckCircle className={`w-3.5 h-3.5 ${wordStats.wrong > 0 ? "text-orange-400" : "text-emerald-400"}`} />
                    <span className={`font-mono font-bold text-sm ${wordStats.wrong > 0 ? "text-orange-400" : "text-emerald-400"}`}>{wordStats.correct}</span>
                    <span className="text-xs text-muted-foreground">/{wordStats.total}</span>
                    {wordStats.wrong > 0 && <span className="text-xs text-red-400 font-mono ml-0.5">✗{wordStats.wrong}</span>}
                  </div>
                )}
                {/* WPM — color-coded vs target */}
                {(() => {
                  const wpmColor = startTime
                    ? wpm >= targetWpm ? "#39FF14"
                    : wpm >= targetWpm * 0.75 ? "#FFB800"
                    : "#00F5FF"
                    : "#00F5FF";
                  const wpmBorder = startTime
                    ? wpm >= targetWpm ? "rgba(57,255,20,0.35)"
                    : wpm >= targetWpm * 0.75 ? "rgba(255,184,0,0.35)"
                    : "rgba(0,245,255,0.3)"
                    : "rgba(0,245,255,0.3)";
                  const wpmGlow = wpmColor === "#39FF14" ? "0 0 8px rgba(57,255,20,0.15)" : wpmColor === "#FFB800" ? "0 0 8px rgba(255,184,0,0.12)" : "0 0 8px rgba(0,245,255,0.08)";
                  return (
                    <div
                      className="flex items-center gap-1.5 bg-card border rounded-xl px-3 py-1.5 cursor-help transition-all duration-300"
                      style={{ borderColor: wpmBorder, boxShadow: wpmGlow }}
                      title={`${wpm} WPM — target: ${targetWpm} WPM. Only correct words count.`}
                    >
                      <Zap className="w-3.5 h-3.5 transition-colors duration-300" style={{ color: wpmColor }} />
                      <span className="font-mono font-extrabold text-base transition-all duration-300" style={{ color: wpmColor, textShadow: `0 0 8px ${wpmColor}99` }}>{wpm}</span>
                      <span className="text-xs text-muted-foreground">WPM</span>
                      {startTime && wpm >= targetWpm && <span className="text-[10px] font-bold" style={{ color: "#39FF14" }}>✓</span>}
                    </div>
                  );
                })()}
                {/* Accuracy */}
                <div
                  className="flex items-center gap-1.5 bg-card border rounded-xl px-3 py-1.5 transition-all duration-200"
                  style={{
                    borderColor: accuracy >= 95 ? "rgba(57,255,20,0.35)" : accuracy >= 80 ? "rgba(255,184,0,0.35)" : "rgba(255,32,121,0.35)",
                    boxShadow: accuracy >= 95 ? "0 0 8px rgba(57,255,20,0.1)" : accuracy >= 80 ? "0 0 8px rgba(255,184,0,0.1)" : "0 0 8px rgba(255,32,121,0.1)"
                  }}
                  title="Keystroke accuracy — every wrong key press permanently lowers this"
                >
                  <Target className="w-3.5 h-3.5" style={{ color: accuracy >= 95 ? "#39FF14" : accuracy >= 80 ? "#FFB800" : "#FF2079" }} />
                  <span
                    className="font-mono font-extrabold text-base"
                    style={{
                      color: accuracy >= 95 ? "#39FF14" : accuracy >= 80 ? "#FFB800" : "#FF2079",
                      textShadow: accuracy >= 95 ? "0 0 6px rgba(57,255,20,0.6)" : accuracy >= 80 ? "0 0 6px rgba(255,184,0,0.6)" : "0 0 6px rgba(255,32,121,0.6)"
                    }}
                  >{accuracy}%</span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-sm tabular-nums">
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
            <div className="relative h-1.5 bg-muted/40 rounded-full overflow-hidden progress-neon">
              <motion.div
                className="absolute left-0 top-0 h-full typing-progress-bar rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.12 }}
              />
            </div>

            {/* Text display */}
            <div
              className={`relative p-5 md:p-7 lg:p-9 bg-card rounded-2xl shadow-xl cursor-text transition-all duration-500 word-stream-container${startTime ? " neon-border-animated" : ""}`}
              style={{
                border: startTime ? "1px solid rgba(0,245,255,0.35)" : "1px solid rgba(0,245,255,0.12)",
                boxShadow: startTime
                  ? "0 0 40px rgba(0,0,0,0.7), 0 0 18px rgba(0,245,255,0.08), inset 0 0 32px rgba(0,245,255,0.03)"
                  : "0 0 32px rgba(0,0,0,0.7), inset 0 0 32px rgba(0,245,255,0.01)"
              }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* Focus indicator — subtle scan line when active */}
              {startTime && !isFinished && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              )}
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
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                Target: <span className="text-primary font-bold">{targetWpm}</span> WPM
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400/70">Only correct words count</span>
              </span>
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
              wordBreakdown={finalWordBreakdown}
              onRetry={handleRetry}
              onNext={() => setLocation(`/play/${gameId}/${Math.min(levelNumber + 1, 8)}`)}
              onMenu={() => setLocation("/games")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
