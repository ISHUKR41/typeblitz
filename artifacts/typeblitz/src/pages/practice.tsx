import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetLessons, useAnalyzePractice, getGetLessonsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileText, Clock, Zap, Target, CheckCircle2, ArrowRight } from "lucide-react";

const TIMED_PASSAGES = [
  "The quick brown fox jumps over the lazy dog. Programming requires patience, precision, and persistence. Practice makes perfect.",
  "In software engineering, clean code matters as much as working code. Readability, maintainability, and simplicity are the hallmarks of professional craftsmanship.",
  "Success comes from consistent effort over time. Every session builds neural pathways that make typing more automatic, fluid, and fast. Keep pushing your limits.",
];

function TimedTest() {
  const [duration, setDuration] = useState(60);
  const [text] = useState(() => TIMED_PASSAGES[Math.floor(Math.random() * TIMED_PASSAGES.length)]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; errorCount: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const analyzeMutation = useAnalyzePractice();

  useEffect(() => {
    setTimeLeft(duration);
    setInput("");
    setStarted(false);
    setFinished(false);
    setResult(null);
  }, [duration]);

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  const handleFinish = async () => {
    setFinished(true);
    const words = input.trim().split(/\s+/).length;
    const wpm = Math.round((words / duration) * 60);
    let correct = 0;
    const len = Math.min(input.length, text.length);
    for (let i = 0; i < len; i++) if (input[i] === text[i]) correct++;
    const accuracy = input.length > 0 ? Math.round((correct / input.length) * 1000) / 10 : 100;
    setResult({ wpm, accuracy, errorCount: len - correct });
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!started && e.target.value.length > 0) setStarted(true);
    if (!finished) setInput(e.target.value);
  };

  const reset = () => {
    setInput("");
    setStarted(false);
    setFinished(false);
    setResult(null);
    setTimeLeft(duration);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (finished && result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center space-y-6 py-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">Test Complete!</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="text-3xl font-bold font-mono text-primary">{result.wpm}</div>
            <div className="text-xs text-muted-foreground mt-1">WPM</div>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="text-3xl font-bold font-mono text-chart-2">{result.accuracy}%</div>
            <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
          </div>
          <div className="bg-card border border-card-border rounded-xl p-4">
            <div className="text-3xl font-bold font-mono text-chart-4">{result.errorCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Errors</div>
          </div>
        </div>
        <Button onClick={reset} className="w-full gap-2">Try Again <ArrowRight className="w-4 h-4" /></Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {[60, 120, 300].map(d => (
          <button
            key={d}
            data-testid={`timed-test-duration-${d}`}
            onClick={() => !started && setDuration(d)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
            } ${started ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {d === 60 ? "1 min" : d === 120 ? "2 min" : "5 min"}
          </button>
        ))}
        <div className={`ml-auto font-mono text-3xl font-bold ${timeLeft <= 10 ? "text-destructive" : "text-primary"}`}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 font-mono text-lg leading-relaxed text-muted-foreground relative">
        {text.split("").map((char, i) => {
          let cls = "text-muted-foreground";
          if (i < input.length) cls = input[i] === char ? "text-primary" : "text-destructive bg-destructive/20";
          else if (i === input.length) cls = "bg-primary/20 border-b-2 border-primary text-foreground";
          return <span key={i} className={cls}>{char}</span>;
        })}
      </div>

      <textarea
        ref={inputRef}
        data-testid="timed-test-input"
        value={input}
        onChange={handleInput}
        disabled={finished}
        className="w-full bg-card border border-border rounded-xl p-4 font-mono text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
        placeholder={started ? "" : "Click here and start typing to begin the test..."}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  );
}

function CustomPractice() {
  const [customText, setCustomText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const analyzeMutation = useAnalyzePractice();
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMutation.data>>(null);

  const [step, setStep] = useState<"setup" | "typing" | "results">("setup");

  const handleStart = () => {
    if (customText.trim().length < 10) return;
    setInput("");
    setStartTime(null);
    setIsFinished(false);
    setStep("typing");
  };

  const handleInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);

    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === customText[i]) correct++;
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    if (val.length >= customText.length) {
      const dur = Math.floor((Date.now() - (startTime ?? Date.now())) / 1000);
      const words = val.trim().split(/\s+/).length;
      const finalWpm = Math.round((words / Math.max(dur, 1)) * 60);
      setWpm(finalWpm);
      const result = await analyzeMutation.mutateAsync({ data: { originalText: customText, typedText: val, duration: dur } });
      setAnalysis(result);
      setStep("results");
    }
  };

  if (step === "setup") {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Paste any text you want to practice — articles, code, emails, anything.</p>
        <textarea
          data-testid="custom-practice-textarea"
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[160px]"
          placeholder="Paste your text here (min 10 characters)..."
        />
        <Button onClick={handleStart} disabled={customText.trim().length < 10} className="gap-2">
          Start Practicing <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (step === "typing") {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-card-border rounded-2xl p-6 font-mono text-base leading-relaxed">
          {customText.split("").map((char, i) => {
            let cls = "text-muted-foreground";
            if (i < input.length) cls = input[i] === char ? "text-primary" : "text-destructive bg-destructive/20";
            else if (i === input.length) cls = "bg-primary/20 border-b-2 border-primary";
            return <span key={i} className={cls}>{char}</span>;
          })}
        </div>
        <textarea
          data-testid="custom-practice-input"
          value={input}
          onChange={handleInput}
          className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Type here..."
        />
        <div className="flex items-center gap-6 font-mono text-sm text-muted-foreground">
          <span className="text-primary font-bold">{wpm} WPM</span>
          <span>{accuracy}% accuracy</span>
          <Button variant="outline" size="sm" onClick={() => setStep("setup")}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-primary">{analysis?.wpm ?? wpm}</div>
          <div className="text-xs text-muted-foreground mt-1">WPM</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-chart-2">{analysis?.accuracy ?? accuracy}%</div>
          <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-chart-4">{analysis?.errorCount ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">Errors</div>
        </div>
      </div>
      {analysis?.suggestions && analysis.suggestions.length > 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-sm">Suggestions</h4>
          {analysis.suggestions.map((s, i) => <p key={i} className="text-sm text-muted-foreground">{s}</p>)}
        </div>
      )}
      <div className="flex gap-3">
        <Button onClick={() => { setStep("setup"); setCustomText(""); }} variant="outline" className="flex-1">New Text</Button>
        <Button onClick={() => { setStep("typing"); setInput(""); setStartTime(null); }} className="flex-1 gap-2">Try Again <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}

export default function Practice() {
  const { data: lessons } = useGetLessons({ query: { queryKey: getGetLessonsQueryKey() } });

  const CATEGORY_COLORS: Record<string, string> = {
    "home-row": "text-primary",
    "top-row": "text-chart-2",
    "bottom-row": "text-chart-3",
    "numbers": "text-chart-4",
    "symbols": "text-chart-5",
    "capitalization": "text-yellow-400",
    "punctuation": "text-purple-400",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Professional Practice</h1>
        <p className="text-muted-foreground mt-1">Structured training for serious typists. No games, just precision.</p>
      </motion.div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="lessons" data-testid="tab-lessons" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <GraduationCap className="w-4 h-4" /> Structured Lessons
          </TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <FileText className="w-4 h-4" /> Custom Practice
          </TabsTrigger>
          <TabsTrigger value="timed" data-testid="tab-timed" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <Clock className="w-4 h-4" /> Timed Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-6">
          <p className="text-muted-foreground text-sm">12 progressive lessons covering every key group. Master the fundamentals, then build speed.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(lessons ?? []).map((lesson, i) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/lessons/${lesson.id}`}>
                  <div
                    data-testid={`lesson-card-${lesson.id}`}
                    className="bg-card border border-card-border rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-xs font-mono font-bold uppercase tracking-wider ${CATEGORY_COLORS[lesson.category] ?? "text-muted-foreground"}`}>
                        {lesson.category.replace(/-/g, " ")}
                      </div>
                      <span className="text-xs text-muted-foreground">{lesson.estimatedMinutes} min</span>
                    </div>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                    {lesson.targetKeys && lesson.targetKeys.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {lesson.targetKeys.slice(0, 6).map(k => (
                          <span key={k} className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{k.toUpperCase()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-chart-2/20 rounded-xl flex items-center justify-center text-chart-2">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Custom Text Practice</h3>
                <p className="text-sm text-muted-foreground">Type any text — code, articles, notes</p>
              </div>
            </div>
            <CustomPractice />
          </div>
        </TabsContent>

        <TabsContent value="timed">
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Timed Typing Test</h3>
                <p className="text-sm text-muted-foreground">Race against the clock — pure WPM benchmark</p>
              </div>
            </div>
            <TimedTest />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
