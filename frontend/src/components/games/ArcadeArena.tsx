import { useState, useEffect, useRef } from "react";
import { RacingGame } from "./RacingGame";
import { FighterGame } from "./FighterGame";
import { ZombieGame } from "./ZombieGame";
import { GalaxyGame } from "./GalaxyGame";

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
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [lastWordCorrect, setLastWordCorrect] = useState<boolean | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const typedWordsRef = useRef<string[]>([]);

  const progress = words.length > 0 ? (wordIndex / words.length) * 100 : 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      const secs = (Date.now() - startTime) / 1000;
      setElapsed(secs);
      const mins = secs / 60;
      if (mins > 0) {
        // WPM counts ONLY correctly-typed characters (standard WPM definition)
        const live = Math.round((correctChars / 5) / mins);
        setWpm(live);
        setWpmHistory(h => [...h.slice(-29), live]);
      }
    }, 500);
    return () => clearInterval(id);
  }, [startTime, correctChars]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());

    // Strict Mode: Block on Error
    if (strictMode && val.length > currentInput.length) {
      const expected = words[wordIndex] ?? "";
      if (val.endsWith(" ")) {
        if (val.trim() !== expected) {
          setTotalChars(prev => prev + 1);
          return;
        }
      } else {
        const idx = val.length - 1;
        if (val[idx] !== expected[idx]) {
          setTotalChars(prev => prev + 1);
          return;
        }
      }
    }

    if (val.endsWith(" ")) {
      const typed = val.trim();
      const expected = words[wordIndex] ?? "";
      const isCorrect = typed === expected;
      const charsTyped = typed.length;
      let charsOk = 0;
      for (let i = 0; i < Math.min(typed.length, expected.length); i++) {
        if (typed[i] === expected[i]) charsOk++;
      }
      const newTotal = totalChars + charsTyped;
      const newCorrect = correctChars + charsOk;
      typedWordsRef.current = [...typedWordsRef.current, typed];

      setTotalChars(newTotal);
      setCorrectChars(newCorrect);
      setLastWordCorrect(isCorrect);
      setComboStreak(streak => isCorrect ? streak + 1 : 0);
      setSubmissionCount(count => count + 1);
      if (!isCorrect) setMistakeCount(count => count + 1);
      setCurrentInput("");

      const next = wordIndex + 1;
      if (next >= words.length) {
        const secs = (Date.now() - (startTime ?? Date.now())) / 1000;
        const mins = secs / 60;
        // WPM = correct chars only / 5 / minutes (industry standard)
        const finalWpm = Math.round((newCorrect / 5) / Math.max(mins, 0.01));
        const finalAcc = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 100;
        onComplete(finalWpm, finalAcc, Math.floor(secs), typedWordsRef.current.join(" "));
      } else {
        setWordIndex(next);
      }
    } else {
      setCurrentInput(val);
    }
  };

  const props: ArcadeProps = {
    words, wordIndex, currentInput, wpm, wpmHistory,
    accuracy, progress, levelNumber, targetWpm, startTime,
    lastWordCorrect, elapsedSeconds: elapsed, comboStreak, mistakeCount, submissionCount,
  };

  return (
    <div className="w-full h-full" onClick={() => inputRef.current?.focus()}>
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
    </div>
  );
}
