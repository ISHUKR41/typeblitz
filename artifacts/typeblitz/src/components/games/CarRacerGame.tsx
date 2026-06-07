import { useState, useEffect, useRef, useCallback } from "react";
import { useCreateSession, Game, useGetLevelWords } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CarRacerGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [levelId, setLevelId] = useState(1);
  const { data: levelData } = useGetLevelWords(game.id, levelId, {
    query: { enabled: !!game.id }
  });

  const words = levelData?.words || ["the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog"];
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const [isError, setIsError] = useState(false);
  
  const [playerSpeed, setPlayerSpeed] = useState(0);
  const [playerDistance, setPlayerDistance] = useState(0);
  const [rivalDistance, setRivalDistance] = useState(0);
  
  const [correctChars, setCorrectChars] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<number>();
  const createSession = useCreateSession();

  const startGame = useCallback(() => {
    setIsActive(true);
    setIsFinished(false);
    setCurrentWordIndex(0);
    setTypedValue("");
    setIsError(false);
    setCorrectChars(0);
    setTotalCharsTyped(0);
    setPlayerSpeed(0);
    setPlayerDistance(0);
    setRivalDistance(0);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 10);
  }, []);

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    cancelAnimationFrame(requestRef.current!);
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const finalWpm = Math.round((correctChars / 5) / (elapsedMinutes || 1));
    const accuracy = totalCharsTyped > 0 ? Math.round((correctChars / totalCharsTyped) * 100) : 0;

    if (user) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId: game.id,
          gameMode: "typing-race",
          wpm: finalWpm,
          accuracy,
          duration: Math.round(elapsedMinutes * 60),
          level: levelId,
        }
      });
    }
  }, [correctChars, totalCharsTyped, startTime, user, game.id, levelId, createSession]);

  const updateGame = useCallback(() => {
    if (!isActive) return;
    
    setPlayerDistance(prev => {
      const next = prev + (playerSpeed * 0.05);
      if (next >= 100) {
        setTimeout(endGame, 0);
        return 100;
      }
      return next;
    });

    setRivalDistance(prev => {
      const rivalSpeed = 40 + (levelId * 10); // Rival gets faster each level
      const next = prev + (rivalSpeed * 0.05);
      return Math.min(next, 100);
    });
    
    // Friction
    setPlayerSpeed(prev => Math.max(0, prev - 0.5));
    
    requestRef.current = requestAnimationFrame(updateGame);
  }, [isActive, playerSpeed, levelId, endGame]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isActive, updateGame]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    const val = e.target.value;
    const targetWord = words[currentWordIndex % words.length];
    
    if (val.length > typedValue.length) {
      setTotalCharsTyped(prev => prev + 1);
      if (targetWord.startsWith(val)) {
        setCorrectChars(prev => prev + 1);
        setIsError(false);
        // Boost speed on correct char
        setPlayerSpeed(prev => Math.min(100, prev + 15));
      } else {
        setIsError(true);
        // Penalty on error
        setPlayerSpeed(prev => Math.max(0, prev - 30));
      }
    } else {
      if (targetWord.startsWith(val)) {
        setIsError(false);
      }
    }
    
    setTypedValue(val);

    if (val === targetWord || val === targetWord + " ") {
      setTypedValue("");
      setIsError(false);
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isError && e.key === " ") {
      e.preventDefault();
      setTypedValue("");
      setIsError(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white">{game.name}</h1>
        <p className="text-muted-foreground">Type to accelerate. Errors slow you down.</p>
      </div>

      {!isActive && !isFinished && (
        <Button size="lg" onClick={startGame} className="h-16 px-12 text-xl">
          <Play className="w-6 h-6 mr-2" /> Start Race
        </Button>
      )}

      {isFinished && (
        <div className="text-center animate-in zoom-in space-y-6">
          <h2 className="text-4xl font-bold text-primary">
            {playerDistance >= 100 ? "You Win!" : "Race Over"}
          </h2>
          <Button onClick={() => setLevelId(prev => playerDistance >= 100 ? prev + 1 : prev)} size="lg" onClickCapture={startGame}>
            {playerDistance >= 100 ? "Next Race" : "Try Again"}
          </Button>
        </div>
      )}

      {isActive && (
        <div className="w-full flex flex-col items-center gap-12">
          {/* Race Track */}
          <div className="w-full bg-secondary/30 rounded-xl p-4 border border-border relative overflow-hidden h-40 flex flex-col justify-around">
            {/* Finish line */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] opacity-50 z-0" />
            
            {/* Rival Car */}
            <div className="relative h-10 w-[90%] z-10 transition-all duration-75 ease-linear border-b border-border/50" style={{ transform: `translateX(${rivalDistance}%)` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl filter grayscale opacity-50">🏎️</div>
            </div>

            {/* Player Car */}
            <div className="relative h-10 w-[90%] z-10 transition-all duration-75 ease-linear border-b border-border/50" style={{ transform: `translateX(${playerDistance}%)` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]">🏎️</div>
              {playerSpeed > 50 && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-8 h-2 bg-gradient-to-r from-transparent to-blue-500 rounded-full blur-[2px]" />
              )}
            </div>
          </div>

          <div className="flex flex-col items-center w-full max-w-lg">
            <div className="text-4xl md:text-5xl font-mono font-black mb-6 h-16 flex items-center text-white">
              {words[currentWordIndex % words.length]}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={() => inputRef.current?.focus()}
              className={`w-full bg-card border-2 h-16 px-6 text-2xl font-mono rounded-xl shadow-lg focus:outline-none transition-colors ${isError ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary/50 text-white focus:border-primary'}`}
              autoFocus
              autoComplete="off"
            />
          </div>
          
          <div className="flex gap-8 font-mono text-muted-foreground">
            <div>Speed: {Math.round(playerSpeed)} km/h</div>
          </div>
        </div>
      )}
    </div>
  );
}
