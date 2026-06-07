import { useState, useEffect, useRef, useCallback } from "react";
import { useCreateSession, Game, useGetLevelWords } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

type Zombie = {
  id: number;
  word: string;
  x: number; // 0 to 100
  distance: number; // 0 to 100 (0 = spawn, 100 = reaches player)
  speed: number;
};

export default function ZombieSiegeGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [levelId, setLevelId] = useState(1);
  const { data: levelData } = useGetLevelWords(game.id, levelId, {
    query: { enabled: !!game.id }
  });

  const availableWords = levelData?.words || ["brain", "bite", "run", "dead", "flesh", "crawl", "survive", "night", "horde", "apocalypse"];
  
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [typedValue, setTypedValue] = useState("");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [targetedZombieId, setTargetedZombieId] = useState<number | null>(null);

  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const createSession = useCreateSession();

  const spawnZombie = useCallback(() => {
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    const speed = 0.05 + (Math.random() * 0.05) + (levelId * 0.01);
    const newZombie: Zombie = {
      id: Math.random(),
      word,
      x: 10 + Math.random() * 80, // Safe margins
      distance: 0,
      speed,
    };
    setZombies(prev => [...prev, newZombie]);
  }, [availableWords, levelId]);

  const startGame = () => {
    setIsActive(true);
    setIsFinished(false);
    setZombies([]);
    setTypedValue("");
    setLives(3);
    setScore(0);
    setCorrectChars(0);
    setTotalCharsTyped(0);
    setTargetedZombieId(null);
    setStartTime(Date.now());
    lastSpawnRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 10);
  };

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
          gameMode: "typing-race", // Approximation
          wpm: finalWpm,
          accuracy,
          duration: Math.round(elapsedMinutes * 60),
          level: levelId,
          score,
        }
      });
    }
  }, [correctChars, totalCharsTyped, startTime, user, game.id, levelId, score, createSession]);

  const updateGame = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    const spawnRate = Math.max(1000, 3000 - (levelId * 200));
    
    if (now - lastSpawnRef.current > spawnRate) {
      spawnZombie();
      lastSpawnRef.current = now;
    }

    setZombies(prev => {
      let lostLife = false;
      const next = prev.map(z => ({ ...z, distance: z.distance + z.speed })).filter(z => {
        if (z.distance >= 100) {
          lostLife = true;
          if (targetedZombieId === z.id) {
            setTargetedZombieId(null);
            setTypedValue("");
          }
          return false;
        }
        return true;
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

      return next;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isActive, levelId, targetedZombieId, spawnZombie, endGame]);

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isActive, updateGame]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    const val = e.target.value.toLowerCase().trim();
    
    if (val.length > typedValue.length) {
      setTotalCharsTyped(prev => prev + 1);
    }

    // If no target, find one
    if (!targetedZombieId && val.length > 0) {
      const potentialTargets = zombies.filter(z => z.word.startsWith(val));
      if (potentialTargets.length > 0) {
        // Target closest one
        const target = potentialTargets.reduce((prev, current) => (prev.distance > current.distance) ? prev : current);
        setTargetedZombieId(target.id);
        setCorrectChars(prev => prev + val.length); // Assume all added correct so far
        setTypedValue(val);
      } else {
        // Wrong initial char, ignore or beep
        setTypedValue("");
      }
      return;
    }

    if (targetedZombieId) {
      const targetZombie = zombies.find(z => z.id === targetedZombieId);
      
      if (!targetZombie) {
        setTargetedZombieId(null);
        setTypedValue("");
        return;
      }

      if (targetZombie.word.startsWith(val)) {
        if (val.length > typedValue.length) {
          setCorrectChars(prev => prev + 1);
        }
        setTypedValue(val);

        if (val === targetZombie.word) {
          // Kill zombie
          setZombies(prev => prev.filter(z => z.id !== targetedZombieId));
          setScore(s => s + (targetZombie.word.length * 10));
          setTargetedZombieId(null);
          setTypedValue("");
        }
      } else {
        // Wrong char typed while locked on
        // Doesn't update typedValue, just counts as error (already handled by totalCharsTyped)
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Press Esc or Space to clear target lock if stuck
    if (e.key === "Escape" || e.key === " ") {
      e.preventDefault();
      setTargetedZombieId(null);
      setTypedValue("");
    }
  };

  return (
    <div className="relative w-full h-[80vh] bg-neutral-950 border border-red-900/50 overflow-hidden font-mono selection:bg-red-500/30 rounded-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-950/20 via-neutral-950 to-neutral-950 pointer-events-none z-0" />
      
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10 text-xl text-red-500 font-bold">
        <div>SCORE: {score.toString().padStart(6, '0')}</div>
        <div>LIVES: {'❤'.repeat(lives)}</div>
      </div>

      {!isActive && !isFinished && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <h1 className="text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] tracking-widest">ZOMBIE SIEGE</h1>
          <p className="text-red-400 mb-8 max-w-md text-center">Type words to eliminate zombies before they reach your defenses. Press SPACE to clear target.</p>
          <Button onClick={startGame} className="bg-red-600 hover:bg-red-500 text-white font-bold h-12 px-8 shadow-[0_0_20px_rgba(255,0,0,0.5)]">
            <Play className="w-5 h-5 mr-2" /> DEFEND THE WALL
          </Button>
        </div>
      )}

      {isFinished && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <h2 className="text-5xl font-black text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">YOU DIED</h2>
          <div className="text-2xl text-white mb-8">Final Score: {score}</div>
          <Button onClick={startGame} className="bg-red-600 hover:bg-red-500 text-white h-12 px-8">
            TRY AGAIN
          </Button>
        </div>
      )}

      {isActive && (
        <>
          {zombies.map(zombie => (
            <div 
              key={zombie.id} 
              className="absolute flex flex-col items-center transition-all ease-linear duration-75"
              style={{ left: `${zombie.x}%`, top: `${zombie.distance}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className={cn(
                "px-2 py-1 rounded text-lg font-bold mb-1",
                targetedZombieId === zombie.id ? "bg-red-500/20 text-white border border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "bg-black/50 text-red-400"
              )}>
                {targetedZombieId === zombie.id ? (
                  <>
                    <span className="text-red-500">{typedValue}</span>
                    <span className="opacity-50">{zombie.word.slice(typedValue.length)}</span>
                  </>
                ) : zombie.word}
              </div>
              <div className="text-3xl filter grayscale contrast-125 sepia hover:sepia-0">🧟</div>
            </div>
          ))}

          {/* Defense Wall */}
          <div className="absolute bottom-[60px] w-full h-2 bg-red-900/50 shadow-[0_0_20px_rgba(255,0,0,0.5)] z-0" />
          
          <div className="absolute bottom-10 w-full flex justify-center z-10">
            <input
              ref={inputRef}
              type="text"
              value={typedValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={() => inputRef.current?.focus()}
              className="bg-black/80 border border-red-500 text-white text-2xl px-6 py-3 rounded-md outline-none focus:ring-2 focus:ring-red-500 w-full max-w-sm shadow-[0_0_20px_rgba(255,0,0,0.3)] text-center tracking-widest"
              placeholder="TARGET..."
              autoFocus
            />
          </div>
        </>
      )}
    </div>
  );
}
