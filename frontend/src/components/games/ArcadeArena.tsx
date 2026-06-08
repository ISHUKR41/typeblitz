import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RacingGame } from "./RacingGame";
import { FighterGame } from "./FighterGame";
import { ZombieGame } from "./ZombieGame";
import { GalaxyGame } from "./GalaxyGame";
import { MeteorGame } from "./MeteorGame";
import { NeonRunnerGame } from "./NeonRunnerGame";
import { SnakeTyperGame } from "./SnakeTyperGame";
import { WordInvadersGame } from "./WordInvadersGame";
import { CodeRainGame } from "./CodeRainGame";
import { CyberHeistGame } from "./CyberHeistGame";
import { ArenaBlitzGame } from "./ArenaBlitzGame";
import { BubblePopGame } from "./BubblePopGame";
import { FruitBlitzGame } from "./FruitBlitzGame";
import { soundEffects } from "@/lib/audio";
import { VirtualKeyboard } from "../VirtualKeyboard";

export interface ArcadeProps {
  words: string[];
  wordIndex: number;
  currentInput: string;
  wpm: number;
  wpmHistory: number[];
  accuracy: number;
  progress: number;
  levelNumber: number;
  targetWpm: number;
  startTime: number | null;
  lastWordCorrect: boolean | null;
  elapsedSeconds: number;
  comboStreak: number;
  mistakeCount: number;
  submissionCount: number;
}

interface ArcadeArenaProps {
  words: string[];
  gameId: string;
  levelNumber: number;
  targetWpm: number;
  strictMode?: boolean;
  onComplete: (wpm: number, accuracy: number, duration: number, typedText: string) => void;
}

export function ArcadeArena({ words, gameId, levelNumber, targetWpm, strictMode, onComplete }: ArcadeArenaProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [lastWordCorrect, setLastWordCorrect] = useState<boolean | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [comboVisible, setComboVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typedWordsRef = useRef<string[]>([]);

  // Keystroke metrics (for accuracy calculation)
  const totalKeystrokesRef = useRef(0);
  const errorKeystrokesRef = useRef(0);

  // WPM is based ONLY on exact-correct words — wrong words contribute zero
  // This prevents inflating WPM by typing fast but incorrectly
  const correctCharsRef = useRef(0);

  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  const [liveAccuracy, setLiveAccuracy] = useState(100);

  // ── Live WPM ticker — recalculates every 400ms ─────────────────────────
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      setElapsed(secs);
      const mins = secs / 60;
      if (mins > 0) {
        // ▶ STRICT: only count characters from EXACTLY matched words
        // Wrong words contribute 0 correct chars to WPM
        let correct = 0;
        for (let i = 0; i < wordIndex; i++) {
          const w   = typedWordsRef.current[i] ?? "";
          const exp = words[i] ?? "";
          if (w === exp) {
            correct += exp.length + 1; // all chars + space separator
          }
        }
        // Current (unsubmitted) word: SEQUENTIAL correct chars only.
        // Break at FIRST mismatch — prevents scrambled chars from inflating WPM.
        const currExp = words[wordIndex] ?? "";
        for (let i = 0; i < Math.min(currentInput.length, currExp.length); i++) {
          if (currentInput[i] !== currExp[i]) break;
          correct++;
        }
        correctCharsRef.current = correct;

        const live = Math.round((correct / 5) / mins);
        setWpm(live);
        setWpmHistory(h => [...h.slice(-29), live]);
      }
    }, 400);
    return () => clearInterval(id);
  }, [startTime, wordIndex, currentInput, words]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Show combo popup when a streak of 3+ is achieved
  useEffect(() => {
    if (!lastWordCorrect || comboStreak < 3) return;
    setComboVisible(true);
    const t = setTimeout(() => setComboVisible(false), 900);
    return () => clearTimeout(t);
  }, [submissionCount, lastWordCorrect, comboStreak]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    if (val.length > currentInput.length) {
      // Key pressed
      totalKeystrokesRef.current += 1;
      const expectedWord = words[wordIndex] ?? "";

      if (val.endsWith(" ")) {
        // Space submitted the word
        const typedWord = val.trim();
        if (typedWord === expectedWord) {
          soundEffects.playClick(true);
        } else {
          errorKeystrokesRef.current += 1;
          soundEffects.playError();
          if (strictMode) {
            updateAccuracyState();
            return;
          }
        }
      } else {
        // Typing a character in the current word
        const idx      = val.length - 1;
        const typedCh  = val[idx];
        const expectCh = expectedWord[idx];

        if (typedCh === expectCh) {
          soundEffects.playClick(false);
        } else {
          errorKeystrokesRef.current += 1;
          soundEffects.playError();
          if (strictMode) {
            updateAccuracyState();
            return;
          }
        }
      }
    } else if (val.length < currentInput.length) {
      soundEffects.playClick(false);
    }

    updateAccuracyState();

    if (val.endsWith(" ")) {
      const typed    = val.trim();
      const expected = words[wordIndex] ?? "";
      const isCorrect = typed === expected;

      typedWordsRef.current = [...typedWordsRef.current, typed];

      // ▶ Only add chars to correctCharsRef when EXACTLY correct
      if (isCorrect) {
        correctCharsRef.current += expected.length + 1;
      }
      // Wrong word → contributes ZERO correct chars (no WPM padding for errors)

      if (soundEffects.getTheme() === "typewriter") {
        soundEffects.playTypewriterBell();
      }

      setLastWordCorrect(isCorrect);
      setComboStreak(streak => isCorrect ? streak + 1 : 0);
      setSubmissionCount(count => count + 1);
      if (!isCorrect) setMistakeCount(count => count + 1);
      setCurrentInput("");

      const next = wordIndex + 1;
      if (next >= words.length) {
        const secs = (Date.now() - (startTime ?? Date.now())) / 1000;
        const mins = secs / 60;

        // ▶ Final WPM: same rule — only exact-match words count
        let finalCorrect = 0;
        for (let i = 0; i < words.length; i++) {
          const w   = typedWordsRef.current[i] ?? "";
          const exp = words[i] ?? "";
          if (w === exp) {
            // last word doesn't get a space
            finalCorrect += exp.length + (i < words.length - 1 ? 1 : 0);
          }
        }

        const finalWpm = Math.round((finalCorrect / 5) / Math.max(mins, 0.01));
        const totalK   = totalKeystrokesRef.current;
        const errorK   = errorKeystrokesRef.current;
        const finalAcc = totalK > 0
          ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100)))
          : 100;

        onComplete(finalWpm, finalAcc, Math.max(1, Math.floor(secs)), typedWordsRef.current.join(" "));
      } else {
        setWordIndex(next);
      }
    } else {
      setCurrentInput(val);
    }
  };

  const updateAccuracyState = () => {
    const totalK = totalKeystrokesRef.current;
    const errorK = errorKeystrokesRef.current;
    const acc = totalK > 0
      ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100)))
      : 100;
    setLiveAccuracy(acc);
  };

  const showKeyboard = typeof window !== "undefined" && localStorage.getItem("typeblitz.showKeyboard") !== "false";

  const props: ArcadeProps = {
    words,
    wordIndex,
    currentInput,
    wpm,
    wpmHistory,
    accuracy: liveAccuracy,
    progress,
    levelNumber,
    targetWpm,
    startTime,
    lastWordCorrect,
    elapsedSeconds: elapsed,
    comboStreak,
    mistakeCount,
    submissionCount,
  };

  return (
    <div className="w-full h-full space-y-4 relative" onClick={() => inputRef.current?.focus()}>
      {/* Combo streak popup */}
      <AnimatePresence>
        {comboVisible && comboStreak >= 3 && (
          <motion.div
            key={submissionCount}
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: -10 }}
            exit={{ opacity: 0, scale: 1.4, y: -50 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
          >
            <div className={`text-center px-5 py-2.5 rounded-2xl border backdrop-blur-sm shadow-2xl ${
              comboStreak >= 15 ? "bg-yellow-500/25 border-yellow-400/60 shadow-yellow-400/20" :
              comboStreak >= 10 ? "bg-orange-500/25 border-orange-400/60 shadow-orange-400/20" :
              comboStreak >= 5  ? "bg-chart-2/25  border-chart-2/60  shadow-chart-2/20"  :
                                  "bg-primary/20  border-primary/50  shadow-primary/20"
            }`}>
              <div className={`text-3xl font-black font-mono ${
                comboStreak >= 15 ? "text-yellow-400" :
                comboStreak >= 10 ? "text-orange-400" :
                comboStreak >= 5  ? "text-chart-2"    :
                                    "text-primary"
              }`}>
                {comboStreak >= 15 ? "🔥🔥" : comboStreak >= 10 ? "🔥" : comboStreak >= 5 ? "⚡" : "✓"} {comboStreak}×
              </div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-widest mt-0.5">COMBO!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={inputRef}
        type="text"
        value={currentInput}
        onChange={handleInput}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus
      />
      {gameId === "turbo-race"    && <RacingGame      {...props} />}
      {gameId === "word-fighter"  && <FighterGame     {...props} />}
      {gameId === "zombie-hunt"   && <ZombieGame      {...props} />}
      {gameId === "galaxy-blitz"  && <GalaxyGame      {...props} />}
      {gameId === "meteor-storm"  && <MeteorGame      {...props} />}
      {gameId === "neon-runner"   && <NeonRunnerGame  {...props} />}
      {gameId === "snake-typer"   && <SnakeTyperGame  {...props} />}
      {gameId === "word-invaders" && <WordInvadersGame {...props} />}
      {gameId === "code-rain"     && <CodeRainGame    {...props} />}
      {gameId === "cyber-heist"   && <CyberHeistGame  {...props} />}
      {gameId === "arena-blitz"   && <ArenaBlitzGame  {...props} />}
      {gameId === "bubble-pop"    && <BubblePopGame   {...props} />}
      {gameId === "fruit-blitz"   && <FruitBlitzGame  {...props} />}

      {showKeyboard && (
        <div className="z-20 relative">
          <VirtualKeyboard nextChar={words[wordIndex]?.[currentInput.length]} />
        </div>
      )}
    </div>
  );
}
