import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCreateSession, useAnalyzePractice } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RotateCcw, Activity, Target, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_TEXTS = {
  30: "The quick brown fox jumps over the lazy dog. Programming requires patience and practice. Every day is a new opportunity to learn something new and improve your skills. Typing fast is a matter of muscle memory and consistent training over time.",
  60: "The quick brown fox jumps over the lazy dog. Programming requires patience and practice. Every day is a new opportunity to learn something new and improve your skills. Typing fast is a matter of muscle memory and consistent training over time. Whether you are a developer, a writer, or just someone who spends a lot of time on a computer, improving your typing speed can save you hundreds of hours every year. The key is to focus on accuracy first, and let the speed come naturally.",
  120: "The quick brown fox jumps over the lazy dog. Programming requires patience and practice. Every day is a new opportunity to learn something new and improve your skills. Typing fast is a matter of muscle memory and consistent training over time. Whether you are a developer, a writer, or just someone who spends a lot of time on a computer, improving your typing speed can save you hundreds of hours every year. The key is to focus on accuracy first, and let the speed come naturally. Don't look at the keyboard, keep your eyes on the screen, and trust your fingers to find the right keys. Practice makes perfect, and with dedication, you can achieve speeds you never thought possible."
};

export default function SpeedTest() {
  const { user } = useAuth();
  const [duration, setDuration] = useState<30 | 60 | 120>(30);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [typedText, setTypedText] = useState("");
  const [targetText, setTargetText] = useState(SAMPLE_TEXTS[30]);
  
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const createSession = useCreateSession();

  const startGame = useCallback(() => {
    setIsActive(true);
    setIsFinished(false);
    setTypedText("");
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalChars(0);
    setTimeLeft(duration);
    setTargetText(SAMPLE_TEXTS[duration]);
    inputRef.current?.focus();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration]);

  const endGame = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedMinutes = duration / 60;
    const finalWpm = Math.round((correctChars / 5) / elapsedMinutes);
    const finalAccuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

    if (user && totalChars > 0) {
      createSession.mutate({
        data: {
          userId: user.id,
          gameId: "speed-test",
          gameMode: "timed-test",
          wpm: finalWpm,
          accuracy: finalAccuracy,
          duration: duration,
          level: 1,
        }
      });
    }
  }, [correctChars, totalChars, duration, user, createSession]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    if (!isActive) startGame();

    const value = e.target.value;
    
    // Prevent skipping ahead if previous char was wrong
    if (value.length > typedText.length) {
      const addedChar = value.slice(-1);
      const targetChar = targetText[value.length - 1];
      
      setTotalChars(prev => prev + 1);
      
      if (addedChar === targetChar) {
        setCorrectChars(prev => prev + 1);
      } else {
        setIncorrectChars(prev => prev + 1);
      }
    }
    
    setTypedText(value);
    
    // Auto end if text completed
    if (value.length === targetText.length) {
      endGame();
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsFinished(false);
    setTypedText("");
    setTimeLeft(duration);
    setCorrectChars(0);
    setIncorrectChars(0);
    setTotalChars(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Real-time stats
  const elapsedMinutes = (duration - timeLeft) / 60;
  const currentWpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;
  const currentAccuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4 tracking-tight">Professional Speed Test</h1>
        <p className="text-muted-foreground">Find out your true WPM under pressure.</p>
      </div>

      {!isActive && !isFinished && (
        <div className="flex justify-center gap-4 mb-8">
          {[30, 60, 120].map((t) => (
            <Button
              key={t}
              variant={duration === t ? "default" : "outline"}
              onClick={() => {
                setDuration(t as any);
                setTimeLeft(t);
                setTargetText(SAMPLE_TEXTS[t as keyof typeof SAMPLE_TEXTS]);
              }}
              className={duration === t ? "bg-primary text-primary-foreground" : "border-border"}
            >
              {t} Seconds
            </Button>
          ))}
        </div>
      )}

      {isFinished ? (
        <Card className="bg-card border-primary/20 backdrop-blur-sm shadow-[0_0_30px_rgba(var(--primary),0.1)]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-8">Test Complete</h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Speed
                </div>
                <div className="text-6xl font-black text-primary font-mono">{currentWpm}</div>
                <div className="text-sm mt-1">WPM</div>
              </div>
              <div className="p-6 rounded-xl bg-secondary/50 border border-border">
                <div className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Accuracy
                </div>
                <div className="text-6xl font-black text-accent font-mono">{currentAccuracy}%</div>
                <div className="text-sm mt-1">Correct Keystrokes</div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button onClick={handleReset} size="lg" className="w-full max-w-xs gap-2">
                <RotateCcw className="w-5 h-5" /> Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg border border-border">
            <div className="text-2xl font-mono font-bold text-primary">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase">WPM</div>
                <div className="text-xl font-bold font-mono">{currentWpm}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase">Accuracy</div>
                <div className="text-xl font-bold font-mono">{currentAccuracy}%</div>
              </div>
            </div>
          </div>

          <div 
            className="relative p-8 rounded-xl bg-card border border-border shadow-lg font-mono text-xl md:text-2xl leading-relaxed cursor-text min-h-[300px]"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Hidden Input for Mobile/Desktop Typing */}
            <input
              ref={inputRef}
              type="text"
              className="absolute opacity-0 -z-10 w-0 h-0"
              value={typedText}
              onChange={handleInput}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            <div className="flex flex-wrap select-none">
              {targetText.split('').map((char, index) => {
                const isTyped = index < typedText.length;
                const isCorrect = isTyped && typedText[index] === char;
                const isCurrent = index === typedText.length;
                
                return (
                  <span
                    key={index}
                    className={cn(
                      "relative transition-colors",
                      !isTyped && "text-muted-foreground/40",
                      isCorrect && "text-white",
                      isTyped && !isCorrect && "text-destructive bg-destructive/20 rounded-sm",
                      isCurrent && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-primary after:animate-pulse text-white"
                    )}
                  >
                    {char === ' ' && isTyped && !isCorrect ? '_' : char}
                  </span>
                );
              })}
            </div>
            
            {!isActive && typedText.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
                <div className="text-xl font-bold animate-pulse text-primary flex items-center gap-2">
                  <Keyboard className="w-6 h-6" />
                  Start typing to begin
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-white">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Test
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
