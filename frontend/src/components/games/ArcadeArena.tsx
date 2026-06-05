import { useState, useEffect, useRef } from "react";
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
        // Current (unsubmitted) word: count matching chars so the display
        // isn't frozen while typing, but ONLY up to correct position
        const currExp = words[wordIndex] ?? "";
        for (let i = 0; i < currentInput.length; i++) {
          if (currentInput[i] === currExp[i]) correct++;
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
    <div className="w-full h-full space-y-4" onClick={() => inputRef.current?.focus()}>
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

      {showKeyboard && (
        <div className="z-20 relative">
          <VirtualKeyboard nextChar={words[wordIndex]?.[currentInput.length]} />
        </div>
      )}
    </div>
  );
}
