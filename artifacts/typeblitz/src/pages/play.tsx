import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useGetGame, useGetLevelWords, useCreateSession, getGetLevelWordsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, ArrowRight, Zap, RotateCcw, BarChart2, Home, CheckCircle } from "lucide-react";
import { ArcadeArena } from "@/components/games/ArcadeArena";

const ARCADE_GAME_IDS = new Set(["turbo-race", "word-fighter", "zombie-hunt", "galaxy-blitz"]);

// ─── WPM sparkline ────────────────────────────────────────────────────────
function WpmSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 120, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

// ─── Render typed text char-by-char ──────────────────────────────────────
function TypedText({ text, input }: { text: string; input: string }) {
  return (
    <p className="font-mono text-xl md:text-2xl leading-loose tracking-wide break-words select-none">
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
  wpm, accuracy, duration, gameId, levelNumber,
  onRetry, onNext, onMenu,
}: {
  wpm: number; accuracy: number; duration: number;
  gameId: string; levelNumber: number;
  onRetry: () => void; onNext: () => void; onMenu: () => void;
}) {
  const grade = wpm >= 80 ? "S" : wpm >= 60 ? "A" : wpm >= 40 ? "B" : wpm >= 25 ? "C" : "D";
  const gradeColor = grade === "S" ? "text-yellow-400" : grade === "A" ? "text-primary" : grade === "B" ? "text-chart-2" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 22 }}
      className="max-w-lg w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-primary/10 border-b border-primary/20 px-6 py-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
          <Trophy className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold font-mono">LEVEL CLEARED</h2>
          <p className="text-sm text-muted-foreground">Level {levelNumber} complete!</p>
        </div>
        <div className={`ml-auto text-5xl font-black font-mono ${gradeColor}`}>{grade}</div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "WPM", value: wpm, color: "text-primary", icon: Zap },
            { label: "Accuracy", value: `${accuracy}%`, color: "text-chart-2", icon: Target },
            { label: "Time", value: `${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,"0")}`, color: "text-chart-3", icon: Clock },
          ].map(s => (
            <div key={s.label} className="bg-background rounded-xl border border-border p-3 text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5 text-sm">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">
            {levelNumber < 5
              ? `Level ${levelNumber + 1} unlocked — target ${wpm + 10}+ WPM`
              : "All levels complete — challenge your score!"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onMenu} className="gap-1.5">
            <Home className="w-3.5 h-3.5" /> Menu
          </Button>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </Button>
          <Button size="sm" onClick={onNext} className="gap-1.5" disabled={levelNumber >= 5}>
            Next <ArrowRight className="w-3.5 h-3.5" />
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

  // ── Standard game state ──────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [duration, setDuration] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Arcade / standard shared reset key ──────────────────────────────────
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (levelContent && !isArcade) {
      setText(levelContent.text ? levelContent.text : (levelContent.words ?? []).join(" "));
      setInput(""); setIsFinished(false); setStartTime(null);
      setWpm(0); setAccuracy(100); setDuration(0); setWpmHistory([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (levelContent && isArcade) {
      setIsFinished(false);
      setResetKey(k => k + 1);
    }
  }, [levelContent, isArcade]);

  useEffect(() => {
    if (isFinished || !startTime || isArcade) return;
    const id = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      const mins = secs / 60;
      setDuration(Math.floor(secs));
      if (mins > 0) {
        const live = Math.round((input.length / 5) / mins);
        setWpm(live);
        setWpmHistory(h => [...h.slice(-29), live]);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isFinished, startTime, input.length, isArcade]);

  useEffect(() => {
    if (isArcade) return;
    const fn = () => inputRef.current?.focus();
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, [isArcade]);

  const saveSession = useCallback((finalWpm: number, finalAcc: number, finalDuration: number) => {
    if (user && gameId) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId,
          gameMode: gameId,
          wpm: finalWpm,
          accuracy: finalAcc,
          duration: finalDuration,
          level: levelNumber,
        }
      });
    }
  }, [user, gameId, levelNumber, createSession]);

  const finishGame = useCallback((finalInput: string, finalTime: number) => {
    const secs = (Date.now() - finalTime) / 1000;
    const mins = secs / 60;
    const finalWpm = Math.round((finalInput.length / 5) / Math.max(mins, 0.01));
    let correct = 0;
    for (let i = 0; i < finalInput.length; i++) if (finalInput[i] === text[i]) correct++;
    const finalAcc = finalInput.length > 0 ? Math.round((correct / finalInput.length) * 100) : 100;
    setIsFinished(true);
    setWpm(finalWpm);
    setAccuracy(finalAcc);
    setDuration(Math.floor(secs));
    saveSession(finalWpm, finalAcc, Math.floor(secs));
  }, [text, saveSession]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);
    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === text[i]) correct++;
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);
    if (val.length >= text.length) finishGame(val, startTime ?? Date.now());
  };

  const handleRetry = () => {
    setInput(""); setIsFinished(false); setStartTime(null);
    setWpm(0); setAccuracy(100); setDuration(0); setWpmHistory([]);
    setResetKey(k => k + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const progress = text.length > 0 ? Math.min((input.length / text.length) * 100, 100) : 0;

  if (!game || !levelContent) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-mono text-sm">Loading Arena...</p>
        </div>
      </div>
    );
  }

  const targetWpm = game.levels?.find((l: any) => l.number === levelNumber)?.targetWpm ?? 40;

  // ── ARCADE games ──────────────────────────────────────────────────────────
  if (isArcade) {
    const words = levelContent.words ?? levelContent.text?.split(" ") ?? [];
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[120px]" />
        </div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`arcade-${resetKey}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full z-10"
            >
              {/* Mini HUD header */}
              <div className="max-w-4xl mx-auto mb-3 flex items-center justify-between px-2">
                <div>
                  <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                    {game.name} · Level {levelNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {game.levels?.find((l: any) => l.number === levelNumber)?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/games")}
                  className="text-xs gap-1 text-muted-foreground"
                >
                  <Home className="w-3.5 h-3.5" /> Exit
                </Button>
              </div>

              <ArcadeArena
                key={resetKey}
                words={words}
                gameId={gameId ?? ""}
                levelNumber={levelNumber}
                targetWpm={targetWpm}
                onComplete={(finalWpm, finalAcc, finalDuration) => {
                  setWpm(finalWpm);
                  setAccuracy(finalAcc);
                  setDuration(finalDuration);
                  setIsFinished(true);
                  saveSession(finalWpm, finalAcc, finalDuration);
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
                gameId={gameId ?? ""}
                levelNumber={levelNumber}
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
    <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="w-full max-w-4xl space-y-5 z-10"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                  {game.name} · Level {levelNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {game.levels?.find((l: any) => l.number === levelNumber)?.name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <WpmSparkline data={wpmHistory} />
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-lg">{wpm}</span>
                  <span className="text-xs text-muted-foreground">WPM</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
                  <Target className="w-4 h-4 text-chart-2" />
                  <span className="font-mono font-bold text-lg">{accuracy}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-base">
                    {Math.floor(duration/60)}:{(duration%60).toString().padStart(2,"0")}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-primary rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div
              className="relative p-5 md:p-8 bg-card border border-border rounded-2xl shadow-xl cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
                autoFocus autoComplete="off" autoCorrect="off"
                autoCapitalize="off" spellCheck={false}
              />
              <TypedText text={text} input={input} />
            </div>

            {!startTime && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-muted-foreground"
              >
                Click the text area and start typing to begin
              </motion.p>
            )}

            <div className="flex justify-between text-xs text-muted-foreground font-mono px-1">
              <span>{input.length} / {text.length} chars</span>
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
              gameId={gameId ?? ""}
              levelNumber={levelNumber}
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
