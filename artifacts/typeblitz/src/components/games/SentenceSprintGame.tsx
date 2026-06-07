import { useState, useEffect, useRef, useCallback } from "react";
import { useCreateSession, Game } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Placeholder sentence since we don't have a specific endpoint for sentences, 
// or we can use level words joined together.
const SENTENCE = "The true test of a developer is not just typing speed, but accuracy and consistency under pressure. In this arena, every mistake costs you momentum.";

export default function SentenceSprintGame({ game }: { game: Game }) {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [typedText, setTypedText] = useState("");
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const createSession = useCreateSession();

  const startGame = () => {
    setIsActive(true);
    setIsFinished(false);
    setTypedText("");
    setErrors(0);
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const totalChars = SENTENCE.length;
    const correctChars = totalChars; // All must be typed correctly to finish
    const finalWpm = Math.round((correctChars / 5) / (elapsedMinutes || 1));
    const accuracy = Math.max(0, Math.min(100, Math.round((correctChars / (correctChars + errors)) * 100)));

    if (user) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId: game.id,
          gameMode: "sentence-rush",
          wpm: finalWpm,
          accuracy,
          duration: Math.round(elapsedMinutes * 60),
          level: 1,
        }
      });
    }
  }, [startTime, errors, user, game.id, createSession]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    const val = e.target.value;
    
    // Prevent skipping ahead if wrong
    if (val.length > typedText.length) {
      const addedChar = val.slice(-1);
      const expectedChar = SENTENCE[val.length - 1];
      
      if (addedChar !== expectedChar) {
        setErrors(prev => prev + 1);
      }
    }
    
    setTypedText(val);
    
    if (val === SENTENCE) {
      endGame();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[70vh] flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-2">{game.name}</h1>
        <p className="text-muted-foreground">{game.description}</p>
      </div>

      {!isActive && !isFinished ? (
        <Button size="lg" onClick={startGame} className="h-16 px-12 text-xl">
          <Play className="w-6 h-6 mr-2" /> Start Sprint
        </Button>
      ) : isFinished ? (
        <div className="text-center animate-in zoom-in space-y-6">
          <h2 className="text-4xl font-bold text-primary">Sprint Complete!</h2>
          <Button onClick={startGame} size="lg" variant="outline">Play Again</Button>
        </div>
      ) : (
        <div 
          className="w-full bg-card border border-border rounded-xl p-8 shadow-xl cursor-text min-h-[250px] text-2xl md:text-3xl font-mono leading-relaxed relative"
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            type="text"
            className="absolute opacity-0 -z-10 w-0 h-0"
            value={typedText}
            onChange={handleInput}
            onBlur={() => inputRef.current?.focus()}
          />
          
          <div className="flex flex-wrap relative select-none">
            {SENTENCE.split('').map((char, index) => {
              const isTyped = index < typedText.length;
              const isCorrect = isTyped && typedText[index] === char;
              const isWrong = isTyped && !isCorrect;
              const isCurrent = index === typedText.length;
              
              return (
                <span
                  key={index}
                  className={cn(
                    "relative transition-colors",
                    !isTyped && "text-muted-foreground/40",
                    isCorrect && "text-white",
                    isWrong && "text-destructive bg-destructive/20 rounded-sm",
                    isCurrent && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-primary after:animate-pulse text-white"
                  )}
                >
                  {char === ' ' ? (isWrong ? '_' : '\u00A0') : char}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
