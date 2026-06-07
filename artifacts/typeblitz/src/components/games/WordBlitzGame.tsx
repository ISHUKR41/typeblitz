import { useState, useEffect, useRef, useCallback } from "react";
import { useGetLevelWords, useCreateSession, Game } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, AlertTriangle } from "lucide-react";

export default function WordBlitzGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [levelId, setLevelId] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const { data: levelData, isLoading } = useGetLevelWords(game.id, levelId, {
    query: { enabled: !!game.id }
  });

  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const [isError, setIsError] = useState(false);
  
  const [correctChars, setCorrectChars] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const createSession = useCreateSession();

  useEffect(() => {
    if (levelData && levelData.words) {
      setWords(levelData.words);
    }
  }, [levelData]);

  const startGame = useCallback(() => {
    setIsActive(true);
    setIsFinished(false);
    setCurrentWordIndex(0);
    setTypedValue("");
    setIsError(false);
    setCorrectChars(0);
    setTotalCharsTyped(0);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const finalWpm = Math.round((correctChars / 5) / (elapsedMinutes || 1));
    const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 0;

    if (user) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId: game.id,
          gameMode: "word-sprint",
          wpm: finalWpm,
          accuracy,
          duration: Math.round(elapsedMinutes * 60),
          level: levelId,
        }
      });
    }
  }, [correctChars, totalCharsTyped, startTime, user, game.id, levelId, createSession]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    const val = e.target.value;
    const targetWord = words[currentWordIndex];
    
    // Check if adding char or deleting
    if (val.length > typedValue.length) {
      setTotalCharsTyped(prev => prev + 1);
      // Check if current string matches target prefix
      if (targetWord.startsWith(val)) {
        setCorrectChars(prev => prev + 1);
        setIsError(false);
      } else {
        setIsError(true);
      }
    } else {
      // Deleting
      if (targetWord.startsWith(val)) {
        setIsError(false);
      }
    }
    
    setTypedValue(val);

    // If word is complete and correct (either followed by space or full length)
    if (val === targetWord || val === targetWord + " ") {
      setTypedValue("");
      setIsError(false);
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        endGame();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If error, force full word clear on Space or backspace until clean
    if (isError && e.key === " ") {
      e.preventDefault();
      setTypedValue("");
      setIsError(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white">{game.name}</h1>
        <p className="text-muted-foreground">Level {levelId}</p>
      </div>

      {!isActive && !isFinished && (
        <Button size="lg" onClick={startGame} className="h-16 px-12 text-xl bg-primary text-primary-foreground">
          <Play className="w-6 h-6 mr-2" /> Start Level
        </Button>
      )}

      {isFinished && (
        <div className="text-center animate-in fade-in zoom-in space-y-6">
          <h2 className="text-3xl font-bold text-primary">Level Complete!</h2>
          <Button onClick={() => setLevelId(prev => prev + 1)} size="lg" className="h-14 px-8">
            Next Level <Play className="w-5 h-5 ml-2" />
          </Button>
          <div className="mt-4">
            <Button variant="ghost" onClick={startGame} className="text-muted-foreground">
              <RotateCcw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        </div>
      )}

      {isActive && (
        <div className="w-full flex flex-col items-center">
          <div className="text-5xl md:text-7xl font-mono font-black mb-8 h-24 flex items-center transition-colors text-white">
            {words[currentWordIndex]}
          </div>
          
          <div className="relative w-full max-w-lg">
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={() => inputRef.current?.focus()}
              className={`w-full bg-card border-2 h-20 px-6 text-3xl font-mono rounded-xl shadow-lg focus:outline-none transition-colors ${isError ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary/50 text-white focus:border-primary'}`}
              autoFocus
              autoComplete="off"
            />
            {isError && (
              <div className="absolute -bottom-8 left-0 w-full text-center text-destructive text-sm flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Press Space to clear word
              </div>
            )}
          </div>
          
          <div className="flex gap-4 mt-12 text-muted-foreground font-mono">
            <div>Word: {currentWordIndex + 1} / {words.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
