import { useState, useEffect, useRef, useCallback } from "react";
import { useGetLevelWords, useCreateSession, Game } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal Matrix effect styling in index.css would be ideal, 
// but we'll use inline Tailwind and local state to simulate words falling.

type FallingWord = {
  id: number;
  text: string;
  x: number;
  y: number;
  speed: number;
  isMatched: boolean;
};

export default function CodeRainGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [levelId, setLevelId] = useState(1);
  const [typedValue, setTypedValue] = useState("");
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: levelData } = useGetLevelWords(game.id, levelId, {
    query: { enabled: !!game.id }
  });

  const availableWords = levelData?.words || ["const", "let", "var", "function", "return", "if", "else", "for", "while"];
  
  const startGame = () => {
    setIsActive(true);
    setScore(0);
    setLives(3);
    setFallingWords([]);
    setTypedValue("");
    lastSpawnRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const endGame = () => {
    setIsActive(false);
    cancelAnimationFrame(requestRef.current!);
    // TODO: Create session
  };

  const spawnWord = () => {
    const text = availableWords[Math.floor(Math.random() * availableWords.length)];
    const newWord: FallingWord = {
      id: Math.random(),
      text,
      x: Math.random() * 80 + 10, // 10% to 90% width
      y: -10,
      speed: 0.1 + Math.random() * 0.1 + (levelId * 0.05), // speed increases with level
      isMatched: false
    };
    setFallingWords(prev => [...prev, newWord]);
  };

  const updateGame = useCallback(() => {
    if (!isActive) return;
    
    const now = Date.now();
    if (now - lastSpawnRef.current > 2000 - (levelId * 100)) {
      spawnWord();
      lastSpawnRef.current = now;
    }

    setFallingWords(prev => {
      let lostLife = false;
      const updated = prev.map(w => ({ ...w, y: w.y + w.speed })).filter(w => {
        if (w.y > 100 && !w.isMatched) {
          lostLife = true;
          return false;
        }
        return !w.isMatched; // Keep unmatched words that are still on screen
      });
      
      if (lostLife) {
        setLives(l => {
          if (l <= 1) {
            setTimeout(endGame, 0);
            return 0;
          }
          return l - 1;
        });
      }
      
      return updated;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isActive, levelId, availableWords]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isActive, updateGame]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setTypedValue(val);

    // Check if any word matches
    const matchedIndex = fallingWords.findIndex(w => w.text === val);
    if (matchedIndex !== -1) {
      setFallingWords(prev => {
        const next = [...prev];
        next[matchedIndex].isMatched = true; // Mark to be removed next frame
        return next;
      });
      setScore(s => s + val.length * 10);
      setTypedValue("");
    }
  };

  return (
    <div className="relative w-full h-[80vh] bg-black border border-green-900 overflow-hidden font-mono selection:bg-green-500/30 text-green-500 rounded-xl">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none z-0" />
      
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10 text-xl text-green-400">
        <div>SCORE: {score.toString().padStart(6, '0')}</div>
        <div>LIVES: {'❤'.repeat(lives)}</div>
      </div>

      {!isActive ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <h1 className="text-5xl font-black text-green-500 mb-2 drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">CODE_RAIN</h1>
          <p className="text-green-700 mb-8">Type the keywords before they breach the firewall.</p>
          <Button onClick={startGame} className="bg-green-600 hover:bg-green-500 text-black font-bold h-12 px-8">
            <Play className="w-5 h-5 mr-2" /> INITIALIZE
          </Button>
        </div>
      ) : (
        <>
          {fallingWords.map(word => (
            <div 
              key={word.id} 
              className={cn(
                "absolute text-xl font-bold transition-colors",
                typedValue && word.text.startsWith(typedValue) ? "text-white drop-shadow-[0_0_8px_#fff]" : "text-green-500 drop-shadow-[0_0_5px_#0f0]"
              )}
              style={{ left: `${word.x}%`, top: `${word.y}%` }}
            >
              {word.text}
            </div>
          ))}
          
          <div className="absolute bottom-10 w-full flex justify-center z-10">
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleInput}
              onBlur={() => inputRef.current?.focus()}
              className="bg-black/50 border border-green-500 text-white text-2xl px-6 py-3 rounded-none outline-none focus:ring-2 focus:ring-green-500 w-full max-w-md shadow-[0_0_15px_rgba(0,255,0,0.2)] text-center"
              placeholder=">_"
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
}
