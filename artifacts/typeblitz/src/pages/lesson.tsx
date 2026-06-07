import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useGetLesson, useCreateSession } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { cn } from "@/lib/utils";

export default function Lesson() {
  const [, params] = useRoute("/lessons/:id");
  const lessonId = parseInt(params?.id || "0", 10);
  
  const { user } = useAuth();
  const { data: lesson, isLoading } = useGetLesson(lessonId, {
    query: { enabled: !!lessonId }
  });
  const createSession = useCreateSession();

  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input automatically
    if (!isFinished && lesson) {
      inputRef.current?.focus();
    }
  }, [currentStep, isFinished, lesson]);

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  }

  if (!lesson) return <div className="text-center py-24 text-muted-foreground">Lesson not found.</div>;

  const targetText = lesson.content[currentStep] || "";

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    
    if (!startTime) setStartTime(Date.now());
    
    const value = e.target.value;
    
    // Prevent skipping ahead if wrong
    if (value.length > typedText.length) {
      const addedChar = value.slice(-1);
      const expectedChar = targetText[value.length - 1];
      
      if (addedChar !== expectedChar) {
        setErrors(prev => prev + 1);
      }
    }
    
    setTypedText(value);
    
    // Step complete
    if (value === targetText) {
      if (currentStep < lesson.content.length - 1) {
        // Next step
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setTypedText("");
        }, 300);
      } else {
        // Finish lesson
        setIsFinished(true);
        const elapsedMinutes = (Date.now() - (startTime || Date.now())) / 60000;
        const totalChars = lesson.content.join("").length;
        const correctChars = totalChars; // Simplified for lessons since we force correct typing eventually
        const finalWpm = Math.round((correctChars / 5) / (elapsedMinutes || 1)); // avoid div by 0
        const accuracy = Math.max(0, Math.min(100, Math.round(((totalChars) / (totalChars + errors)) * 100)));
        
        if (user) {
          createSession.mutate({
            data: {
              userId: user.id,
              gameId: `lesson-${lesson.id}`,
              gameMode: "lesson",
              wpm: finalWpm,
              accuracy: accuracy,
              duration: Math.round(elapsedMinutes * 60),
              level: lesson.id,
            }
          });
        }
      }
    }
  };

  const nextChar = targetText[typedText.length];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl flex flex-col min-h-[calc(100vh-160px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      {isFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in">
          <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold">Module Complete!</h2>
          <div className="flex gap-8 justify-center mb-8">
            <div>
              <div className="text-sm text-muted-foreground uppercase">Errors</div>
              <div className="text-3xl font-bold text-destructive font-mono">{errors}</div>
            </div>
            {/* WPM/Accuracy could be shown here too if we tracked it precisely over the whole lesson */}
          </div>
          <Button asChild size="lg">
            <a href="/lessons">
              Return to Modules <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>Step {currentStep + 1} of {lesson.content.length}</div>
            <div>Errors: <span className="text-destructive font-mono">{errors}</span></div>
          </div>

          <div 
            className="p-8 rounded-xl bg-card border border-border shadow-lg font-mono text-3xl md:text-4xl leading-relaxed text-center mb-12 cursor-text select-none min-h-[160px] flex items-center justify-center"
            onClick={() => inputRef.current?.focus()}
          >
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
            
            <div className="flex flex-wrap justify-center relative">
              {targetText.split('').map((char, index) => {
                const isTyped = index < typedText.length;
                const isCorrect = isTyped && typedText[index] === char;
                const isCurrent = index === typedText.length;
                const isWrong = isTyped && !isCorrect;
                
                return (
                  <span
                    key={index}
                    className={cn(
                      "relative transition-colors",
                      !isTyped && "text-muted-foreground/30",
                      isCorrect && "text-primary font-bold",
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

          <div className="mt-auto flex justify-center">
            <VirtualKeyboard targetKey={nextChar} />
          </div>
        </div>
      )}
    </div>
  );
}
