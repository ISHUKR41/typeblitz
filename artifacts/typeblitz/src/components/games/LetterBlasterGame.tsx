import { useState, useEffect, useRef, useCallback } from "react";
import { useCreateSession, Game } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type Letter = {
  id: number;
  char: string;
  x: number; // 0-100
  y: number; // 0-100
  size: number;
  createdAt: number;
};

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

export default function LetterBlasterGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [letters, setLetters] = useState<Letter[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const createSession = useCreateSession();

  const spawnLetter = useCallback(() => {
    const char = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const newLetter: Letter = {
      id: Math.random(),
      char,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 1 + Math.random() * 1.5,
      createdAt: Date.now()
    };
    setLetters(prev => [...prev, newLetter]);
  }, []);

  const startGame = () => {
    setIsActive(true);
    setIsFinished(false);
    setLetters([]);
    setScore(0);
    setMisses(0);
    setHits(0);
    setTimeLeft(60);
    lastSpawnRef.current = Date.now();
    
    setTimeout(() => inputRef.current?.focus(), 10);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    const finalWpm = Math.round((hits / 5)); // Over 1 minute, so divide by 1

    if (user) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId: game.id,
          gameMode: "letter-blaster",
          wpm: finalWpm,
          accuracy,
          duration: 60,
          level: 1,
          score,
        }
      });
    }
  }, [hits, misses, score, user, game.id, createSession]);

  const updateGame = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    
    // Spawn new letters
    if (now - lastSpawnRef.current > 800 - Math.min(600, hits * 5)) { // gets faster as you hit more
      spawnLetter();
      lastSpawnRef.current = now;
    }

    // Remove expired letters
    setLetters(prev => {
      let expiredCount = 0;
      const next = prev.filter(l => {
        const age = now - l.createdAt;
        if (age > 3000) { // letters disappear after 3s
          expiredCount++;
          return false;
        }
        return true;
      });
      
      if (expiredCount > 0) {
        setMisses(m => m + expiredCount);
      }
      
      return next;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isActive, spawnLetter, hits]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, updateGame]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;
    
    // Ignore meta keys
    if (e.key.length > 1) return;
    
    const char = e.key.toLowerCase();
    
    setLetters(prev => {
      // Find oldest matching letter
      const matchingIndices = prev.map((l, i) => l.char === char ? i : -1).filter(i => i !== -1);
      
      if (matchingIndices.length > 0) {
        // Hit
        const targetIndex = matchingIndices[0]; // target oldest
        setHits(h => h + 1);
        setScore(s => s + 10);
        return prev.filter((_, i) => i !== targetIndex);
      } else {
        // Miss (wrong key)
        setScore(s => Math.max(0, s - 5));
        return prev;
      }
    });
  };

  return (
    <div className="relative w-full h-[80vh] bg-blue-950/20 border border-blue-500/30 overflow-hidden font-mono rounded-xl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a22_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a22_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10 text-xl font-bold">
        <div className="text-blue-400">SCORE: {score.toString().padStart(6, '0')}</div>
        <div className="text-yellow-400">TIME: {timeLeft}s</div>
        <div className="text-red-400">MISSES: {misses}</div>
      </div>

      {!isActive && !isFinished && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <h1 className="text-5xl font-black text-blue-400 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] tracking-widest">LETTER BLASTER</h1>
          <p className="text-blue-300 mb-8 text-center max-w-md">Letters will appear randomly. Press the corresponding key before they disappear.</p>
          <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Play className="w-5 h-5 mr-2" /> WARM UP
          </Button>
        </div>
      )}

      {isFinished && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <h2 className="text-5xl font-black text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">TIME UP</h2>
          <div className="grid grid-cols-2 gap-8 mb-8 text-center">
            <div>
              <div className="text-sm text-blue-300 mb-1">FINAL SCORE</div>
              <div className="text-4xl text-white font-bold">{score}</div>
            </div>
            <div>
              <div className="text-sm text-blue-300 mb-1">ACCURACY</div>
              <div className="text-4xl text-white font-bold">{hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%</div>
            </div>
          </div>
          <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-8">
            PLAY AGAIN
          </Button>
        </div>
      )}

      {isActive && (
        <>
          {letters.map(letter => {
            const age = Date.now() - letter.createdAt;
            const urgency = Math.min(1, age / 3000); // 0 to 1
            
            return (
              <div 
                key={letter.id} 
                className="absolute flex items-center justify-center rounded-full font-bold uppercase transition-all duration-300"
                style={{ 
                  left: `${letter.x}%`, 
                  top: `${letter.y}%`, 
                  transform: `translate(-50%, -50%) scale(${letter.size})`,
                  width: '3rem',
                  height: '3rem',
                  backgroundColor: `rgba(${59 + urgency * 196}, ${130 - urgency * 130}, ${246 - urgency * 246}, ${0.2 + urgency * 0.5})`,
                  color: `rgb(255, ${255 - urgency * 255}, ${255 - urgency * 255})`,
                  border: `2px solid rgba(${59 + urgency * 196}, ${130 - urgency * 130}, ${246 - urgency * 246}, 0.8)`,
                  boxShadow: `0 0 ${10 + urgency * 20}px rgba(${59 + urgency * 196}, ${130 - urgency * 130}, ${246 - urgency * 246}, 0.6)`
                }}
              >
                {letter.char}
              </div>
            );
          })}
          
          {/* Hidden input to capture keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value=""
            onChange={() => {}}
            onKeyDown={handleKeyDown}
            onBlur={() => inputRef.current?.focus()}
            className="absolute opacity-0 pointer-events-none"
            autoFocus
          />
        </>
      )}
    </div>
  );
}
