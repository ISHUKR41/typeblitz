import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetLesson, getGetLessonQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, Target } from "lucide-react";

export default function Lesson() {
  const { lessonId } = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(lessonId || "1");

  const { data: lesson } = useGetLesson(id, {
    query: { enabled: !!id, queryKey: getGetLessonQueryKey(id) }
  });

  const [lineIndex, setLineIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [errors, setErrors] = useState(0);
  const [completedLines, setCompletedLines] = useState(0);
  const [completedChars, setCompletedChars] = useState(0);
  const lineMistakesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setLineIndex(0);
    setInput("");
    setIsFinished(false);
    setErrors(0);
    setCompletedLines(0);
    setCompletedChars(0);
    lineMistakesRef.current = new Set();
  }, [id]);

  if (!lesson) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading lesson...</div>;
  }

  const totalLines = lesson.content.length;
  const currentLine = lesson.content[lineIndex] ?? "";

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // Track mistakes even if the user corrects them before finishing the line.
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== currentLine[i]) lineMistakesRef.current.add(i);
    }

    if (val === currentLine) {
      setErrors(prev => prev + lineMistakesRef.current.size);
      setCompletedLines(prev => prev + 1);
      setCompletedChars(prev => prev + currentLine.length);
      lineMistakesRef.current = new Set();
      if (lineIndex + 1 >= totalLines) {
        setIsFinished(true);
      } else {
        setLineIndex(prev => prev + 1);
        setInput("");
      }
    }
  };

  const accuracy = completedChars > 0
    ? Math.max(0, Math.round(((completedChars - errors) / completedChars) * 100))
    : 100;

  if (isFinished) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-card-border rounded-2xl p-8 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Lesson Complete!</h2>
          <p className="text-muted-foreground text-sm">{lesson.title}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border border-border rounded-xl p-4">
              <div className="text-3xl font-bold font-mono text-primary">{accuracy}%</div>
              <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
            </div>
            <div className="bg-background border border-border rounded-xl p-4">
              <div className="text-3xl font-bold font-mono text-chart-2">{errors}</div>
              <div className="text-xs text-muted-foreground mt-1">Errors</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setLocation("/practice")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button className="flex-1 gap-2" onClick={() => {
              setLineIndex(0);
              setInput("");
              setIsFinished(false);
              setErrors(0);
              setCompletedLines(0);
            }}>
              Again <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-5 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card/60 p-5 md:p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/3 w-60 h-28 bg-primary/6 rounded-full blur-[55px]" />
        </div>
        <div className="absolute inset-0 neon-grid opacity-20 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setLocation("/practice")} className="gap-1 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-primary font-mono font-bold uppercase tracking-wider mb-0.5">{lesson.category.replace(/-/g, " ")}</div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight truncate">{lesson.title}</h1>
          </div>
          <div className="flex-shrink-0 text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Line {lineIndex + 1}/{totalLines}</div>
            <div className="text-sm font-bold font-mono text-primary">{Math.round((lineIndex / totalLines) * 100)}%</div>
          </div>
        </div>
      </div>

      <Progress value={(lineIndex / totalLines) * 100} className="h-1.5 bg-muted [&>div]:bg-primary" />

      {lesson.targetKeys && lesson.targetKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-2 self-center">Focus keys:</span>
          {lesson.targetKeys.map((k: string) => (
            <span key={k} className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-lg font-mono text-sm font-bold">
              {k.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      <div className="bg-card border border-card-border rounded-2xl p-8 space-y-6">
        <div className="font-mono text-2xl leading-relaxed tracking-widest text-center py-4">
          {currentLine.split("").map((char: string, i: number) => {
            let cls = "char-untyped";
            if (i < input.length) cls = input[i] === char ? "char-correct" : (char === " " ? "char-wrong-space" : "char-wrong");
            else if (i === input.length) cls = "char-cursor";
            return <span key={i} className={cls}>{char}</span>;
          })}
        </div>

        <input
          data-testid="lesson-input"
          type="text"
          value={input}
          onChange={handleInput}
          className="w-full rounded-xl p-4 font-mono text-base text-center focus:outline-none transition"
          style={{
            background: "rgba(14,14,18,0.7)",
            border: "1px solid rgba(0,245,255,0.2)",
          }}
          onFocus={e => { e.currentTarget.style.border = "1px solid rgba(0,245,255,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,245,255,0.07)"; }}
          onBlur={e => { e.currentTarget.style.border = "1px solid rgba(0,245,255,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type the text above..."
        />
      </div>

      <div className="flex gap-6 justify-center font-mono text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Target className="w-4 h-4 text-chart-2" /> {accuracy}% accuracy</span>
        <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-primary" /> {errors} errors</span>
      </div>
    </div>
  );
}
