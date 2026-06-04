import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useGetGame, useGetLevelWords, useCreateSession } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Target, ArrowRight, Zap } from "lucide-react";

export default function Play() {
  const { gameId, level } = useParams();
  const levelNumber = parseInt(level || "1");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: game } = useGetGame(gameId || "");
  const { data: levelContent } = useGetLevelWords(gameId || "", levelNumber, { query: { enabled: !!gameId && !!levelNumber } });
  const createSession = useCreateSession();

  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [duration, setDuration] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (levelContent) {
      if (levelContent.text) {
        setText(levelContent.text);
      } else if (levelContent.words) {
        setText(levelContent.words.join(" "));
      }
      setInput("");
      setIsFinished(false);
      setStartTime(null);
      setWpm(0);
      setAccuracy(100);
      setDuration(0);
    }
  }, [levelContent]);

  useEffect(() => {
    if (!isFinished && startTime) {
      const interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 60000; // in minutes
        setDuration(Math.floor((Date.now() - startTime) / 1000));
        
        if (timeElapsed > 0) {
          const wordsTyped = input.length / 5;
          setWpm(Math.round(wordsTyped / timeElapsed));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isFinished, startTime, input]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setInput(val);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === text[i]) correctChars++;
    }
    setAccuracy(val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100);

    // Check completion
    if (val.length === text.length && val === text) {
      setIsFinished(true);
      if (user && gameId) {
        createSession.mutate({
          data: {
            userId: user.id,
            gameId,
            gameMode: gameId,
            wpm: wpm || Math.round((text.length / 5) / ((Date.now() - (startTime || Date.now())) / 60000)),
            accuracy,
            duration: Math.floor((Date.now() - (startTime || Date.now())) / 1000),
            level: levelNumber,
          }
        });
      }
    }
  };

  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!game || !levelContent) {
    return <div className="p-8 text-center font-mono">Loading Arena...</div>;
  }

  const renderText = () => {
    return text.split('').map((char, index) => {
      let colorClass = "text-muted-foreground";
      if (index < input.length) {
        colorClass = input[index] === char ? "text-primary" : "text-destructive bg-destructive/20";
      } else if (index === input.length) {
        colorClass = "text-foreground bg-primary/20 animate-pulse border-b-2 border-primary";
      }
      return (
        <span key={index} className={`font-mono text-3xl transition-colors ${colorClass}`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
      
      {!isFinished ? (
        <div className="w-full max-w-4xl space-y-8 z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-sm text-primary font-mono font-bold mb-1 uppercase tracking-widest">{game.name} • LEVEL {levelNumber}</h2>
              <div className="text-4xl font-bold font-mono text-foreground flex gap-8">
                <div className="flex items-center gap-2"><Zap className="w-8 h-8 text-primary"/> {wpm} <span className="text-sm text-muted-foreground">WPM</span></div>
                <div className="flex items-center gap-2"><Target className="w-8 h-8 text-chart-2"/> {accuracy}% <span className="text-sm text-muted-foreground">ACC</span></div>
              </div>
            </div>
            <div className="text-2xl font-mono text-muted-foreground flex items-center gap-2">
              <Clock className="w-6 h-6" />
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <Progress value={(input.length / text.length) * 100} className="h-2 bg-muted [&>div]:bg-primary" />

          <div className="relative p-8 bg-card border border-border rounded-2xl shadow-2xl leading-relaxed tracking-wide mt-8">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              className="absolute opacity-0 pointer-events-none"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {renderText()}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-card p-8 rounded-2xl border border-border shadow-2xl text-center space-y-6 z-10"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary mb-4">
              <Trophy className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold font-mono">LEVEL CLEARED</h2>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground font-mono">FINAL WPM</div>
                <div className="text-4xl font-bold text-primary">{wpm}</div>
              </div>
              <div className="bg-background p-4 rounded-xl border border-border">
                <div className="text-sm text-muted-foreground font-mono">ACCURACY</div>
                <div className="text-4xl font-bold text-chart-2">{accuracy}%</div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setLocation("/games")}>
                Menu
              </Button>
              <Button className="flex-1 gap-2" onClick={() => setLocation(`/play/${gameId}/${levelNumber + 1}`)}>
                Next Level <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
