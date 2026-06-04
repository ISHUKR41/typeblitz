import { useState, useEffect, useRef } from "react";
import { RacingGame } from "./RacingGame";
import { FighterGame } from "./FighterGame";
import { ZombieGame } from "./ZombieGame";
import { GalaxyGame } from "./GalaxyGame";
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

  // Keystroke metrics
  const totalKeystrokesRef = useRef(0);
  const errorKeystrokesRef = useRef(0);
  const correctCharsRef = useRef(0);

  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;

  // Live real-time accuracy percentage
  const [liveAccuracy, setLiveAccuracy] = useState(100);

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      setElapsed(secs);
      const mins = secs / 60;
      if (mins > 0) {
        // Calculate correct characters dynamically (completed words + current input)
        let correct = 0;
        for (let i = 0; i < wordIndex; i++) {
          const w = typedWordsRef.current[i] ?? "";
          const exp = words[i] ?? "";
          for (let j = 0; j < Math.min(w.length, exp.length); j++) {
            if (w[j] === exp[j]) correct++;
          }
          if (w === exp) correct++; // space character
        }
        const currExpected = words[wordIndex] ?? "";
        for (let i = 0; i < currentInput.length; i++) {
          if (currentInput[i] === currExpected[i]) correct++;
        }
        correctCharsRef.current = correct;

        // WPM = correct chars / 5 / minutes
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
        // User typed space to submit word
        const typedWord = val.trim();
        if (typedWord === expectedWord) {
          soundEffects.playClick(true);
        } else {
          errorKeystrokesRef.current += 1;
          soundEffects.playError();
          if (strictMode) {
            // Block spacebar in strict mode
            updateAccuracyState();
            return;
          }
        }
      } else {
        // Typing character in the current word
        const idx = val.length - 1;
        const typedChar = val[idx];
        const expectedChar = expectedWord[idx];

        if (typedChar === expectedChar) {
          soundEffects.playClick(false);
        } else {
          errorKeystrokesRef.current += 1;
          soundEffects.playError();
          if (strictMode) {
            // Block wrong character in strict mode
            updateAccuracyState();
            return;
          }
        }
      }
    } else if (val.length < currentInput.length) {
      // Backspace typed
      soundEffects.playClick(false);
    }

    updateAccuracyState();

    if (val.endsWith(" ")) {
      const typed = val.trim();
      const expected = words[wordIndex] ?? "";
      const isCorrect = typed === expected;
      
      // Calculate how many characters in this word were actually typed correctly
      let charsOk = 0;
      for (let i = 0; i < Math.min(typed.length, expected.length); i++) {
        if (typed[i] === expected[i]) charsOk++;
      }
      
      typedWordsRef.current = [...typedWordsRef.current, typed];
      correctCharsRef.current += charsOk + (isCorrect ? 1 : 0);

      // Play vintage typewriter bell sound
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
        
        // Final correct characters calculation
        let finalCorrect = 0;
        for (let i = 0; i < words.length; i++) {
          const w = typedWordsRef.current[i] ?? "";
          const exp = words[i] ?? "";
          for (let j = 0; j < Math.min(w.length, exp.length); j++) {
            if (w[j] === exp[j]) finalCorrect++;
          }
          if (i < words.length - 1 && w === exp) finalCorrect++; // space character
        }
        
        const finalWpm = Math.round((finalCorrect / 5) / Math.max(mins, 0.01));
        const totalK = totalKeystrokesRef.current;
        const errorK = errorKeystrokesRef.current;
        const finalAcc = totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100;
        
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
    const acc = totalK > 0 ? Math.max(0, Math.min(100, Math.round(((totalK - errorK) / totalK) * 100))) : 100;
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
      {gameId === "turbo-race"   && <RacingGame  {...props} />}
      {gameId === "word-fighter" && <FighterGame {...props} />}
      {gameId === "zombie-hunt"  && <ZombieGame  {...props} />}
      {gameId === "galaxy-blitz" && <GalaxyGame  {...props} />}

      {showKeyboard && (
        <div className="z-20 relative">
          <VirtualKeyboard nextChar={words[wordIndex]?.[currentInput.length]} />
        </div>
      )}
    </div>
  );
}
