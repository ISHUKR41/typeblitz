import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetLessons, useAnalyzePractice, getGetLessonsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, FileText, Clock, Zap, Target,
  CheckCircle2, ArrowRight, BookOpen, Shield, Code2, RotateCcw
} from "lucide-react";

// ─── Govt exam practice passages ─────────────────────────────────────────
const GOVT_PASSAGES = [
  {
    category: "Polity",
    title: "Indian Constitution",
    text: "The Constitution of India is the supreme law of the land. It came into effect on the 26th of January 1950, replacing the Government of India Act. The Constitution establishes India as a sovereign, socialist, secular, democratic republic and guarantees fundamental rights to all citizens.",
  },
  {
    category: "Economy",
    title: "Union Budget",
    text: "The Union Budget is presented annually by the Finance Minister in Parliament. It outlines the government's financial plan for the upcoming fiscal year, detailing revenue receipts, capital receipts, and planned expenditures across all ministries and departments of the central government.",
  },
  {
    category: "Governance",
    title: "Right to Information",
    text: "The Right to Information Act of 2005 empowers every citizen to seek information from public authorities. It mandates timely responses within thirty days and has been instrumental in promoting transparency, reducing corruption, and strengthening accountability in government functioning at all levels.",
  },
  {
    category: "Banking",
    title: "Reserve Bank of India",
    text: "The Reserve Bank of India was established in 1935 under the Reserve Bank of India Act. It functions as the central bank responsible for monetary policy, currency issuance, regulation of banks, management of foreign exchange, and maintaining financial stability across the Indian economy.",
  },
  {
    category: "Railways",
    title: "Indian Railways",
    text: "Indian Railways is one of the world's largest railway networks, operating over seventy thousand kilometres of track. It is managed by the Ministry of Railways and provides passenger and freight services across the entire country, playing a vital role in national integration and economic development.",
  },
  {
    category: "SSC",
    title: "Staff Selection Commission",
    text: "The Staff Selection Commission conducts Combined Graduate Level and Combined Higher Secondary Level examinations to recruit staff for various posts in ministries, departments, and organisations of the Government of India. Candidates are selected based on written examinations followed by skill tests and document verification.",
  },
];

// ─── Timed test passages ─────────────────────────────────────────────────
const TIMED_PASSAGES = [
  "The quick brown fox jumps over the lazy dog. Programming requires patience, precision, and persistence. Practice makes perfect and perfect practice makes champions.",
  "In software engineering, clean code matters as much as working code. Readability, maintainability, and simplicity are the hallmarks of professional craftsmanship in any discipline.",
  "The Union Public Service Commission conducts examinations for recruitment to the All India Services. Candidates must demonstrate proficiency in general awareness, reasoning, and English language skills to qualify.",
  "Success comes from consistent effort over time. Every session builds neural pathways that make typing more automatic, fluid, and fast. Keep pushing your limits every single day.",
  "Government examinations test a wide range of skills including quantitative aptitude, logical reasoning, English comprehension, and general awareness of current affairs and the Indian Constitution.",
];

// ─── Shared typing display ────────────────────────────────────────────────
function TypingDisplay({ text, input }: { text: string; input: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 font-mono text-base md:text-lg leading-relaxed select-none">
      {text.split("").map((char, i) => {
        let cls = "text-muted-foreground/60";
        if (i < input.length)      cls = input[i] === char ? "text-foreground" : "text-destructive bg-destructive/15 rounded-sm";
        else if (i === input.length) cls = "bg-primary/20 border-b-2 border-primary text-foreground";
        return <span key={i} className={cls}>{char}</span>;
      })}
    </div>
  );
}

// ─── Timed Test ───────────────────────────────────────────────────────────
function TimedTest() {
  const [duration, setDuration] = useState(60);
  const [passageIdx] = useState(() => Math.floor(Math.random() * TIMED_PASSAGES.length));
  const text = TIMED_PASSAGES[passageIdx];
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; errors: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setTimeLeft(duration); setInput(""); setStarted(false); setFinished(false); setResult(null); }, [duration]);

  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); doFinish(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [started, finished]);

  const doFinish = () => {
    setFinished(true);
    setInput(curr => {
      const words = curr.trim().split(/\s+/).filter(Boolean).length;
      const wpm = Math.round((words / duration) * 60);
      let correct = 0;
      const len = Math.min(curr.length, text.length);
      for (let i = 0; i < len; i++) if (curr[i] === text[i]) correct++;
      const accuracy = curr.length > 0 ? Math.round((correct / curr.length) * 100) : 100;
      setResult({ wpm, accuracy, errors: len - correct });
      return curr;
    });
  };

  const reset = () => { setInput(""); setStarted(false); setFinished(false); setResult(null); setTimeLeft(duration); setTimeout(() => inputRef.current?.focus(), 100); };
  const minutes = Math.floor(timeLeft / 60), seconds = timeLeft % 60;

  if (finished && result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-sm mx-auto text-center space-y-5 py-4">
        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-bold">Test Complete!</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "WPM", val: result.wpm, cls: "text-primary" },
            { label: "Accuracy", val: `${result.accuracy}%`, cls: "text-chart-2" },
            { label: "Errors", val: result.errors, cls: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="bg-background border border-border rounded-xl p-3">
              <div className={`text-2xl font-bold font-mono ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <Button onClick={reset} className="w-full gap-2"><RotateCcw className="w-4 h-4" /> Try Again</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        {[60, 120, 300].map(d => (
          <button key={d} onClick={() => !started && setDuration(d)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all
              ${duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}
              ${started ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
            {d === 60 ? "1 min" : d === 120 ? "2 min" : "5 min"}
          </button>
        ))}
        <div className={`ml-auto font-mono text-4xl font-bold tabular-nums ${timeLeft <= 10 ? "text-destructive animate-pulse" : "text-primary"}`}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <TypingDisplay text={text} input={input} />

      <textarea ref={inputRef} value={input} onChange={e => { if (!started && e.target.value) setStarted(true); if (!finished) setInput(e.target.value); }}
        disabled={finished}
        className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] transition-colors"
        placeholder="Start typing to begin the test..." autoFocus autoComplete="off" autoCorrect="off" spellCheck={false} />
    </div>
  );
}

// ─── Custom Practice ──────────────────────────────────────────────────────
function CustomPractice() {
  const [customText, setCustomText] = useState("");
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const analyzeMutation = useAnalyzePractice();
  const [analysis, setAnalysis] = useState<any>(null);
  const [step, setStep] = useState<"setup" | "typing" | "results">("setup");

  const handleInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);
    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === customText[i]) correct++;
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);
    const secs = startTime ? (Date.now() - startTime) / 1000 : 1;
    setWpm(Math.round((val.length / 5) / (secs / 60)));

    if (val.length >= customText.length) {
      const dur = Math.floor(secs);
      const finalWpm = Math.round((val.trim().split(/\s+/).length / Math.max(dur, 1)) * 60);
      setWpm(finalWpm);
      const result = await analyzeMutation.mutateAsync({ data: { originalText: customText, typedText: val, duration: dur } });
      setAnalysis(result);
      setStep("results");
    }
  };

  if (step === "setup") return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Paste any text — articles, code, exam passages, emails — and practice it.</p>
      <textarea value={customText} onChange={e => setCustomText(e.target.value)}
        className="w-full bg-background border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px]"
        placeholder="Paste your text here (minimum 10 characters)..." />
      <Button onClick={() => { setInput(""); setStartTime(null); setStep("typing"); }} disabled={customText.trim().length < 10} className="gap-2">
        Start Practicing <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );

  if (step === "typing") return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 font-mono text-sm">
        <span className="text-primary font-bold">{wpm} WPM</span>
        <span className="text-chart-2">{accuracy}% accuracy</span>
        <Button variant="outline" size="sm" onClick={() => setStep("setup")} className="ml-auto">Cancel</Button>
      </div>
      <TypingDisplay text={customText} input={input} />
      <textarea value={input} onChange={handleInput} autoFocus autoComplete="off" autoCorrect="off" spellCheck={false}
        className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
        placeholder="Type here..." />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "WPM", val: analysis?.wpm ?? wpm, cls: "text-primary" },
          { label: "Accuracy", val: `${analysis?.accuracy ?? accuracy}%`, cls: "text-chart-2" },
          { label: "Errors", val: analysis?.errorCount ?? 0, cls: "text-destructive" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold font-mono ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      {analysis?.suggestions?.length > 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-sm">AI Suggestions</h4>
          {analysis.suggestions.map((s: string, i: number) => (
            <p key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />{s}
            </p>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => { setStep("setup"); setCustomText(""); }}>New Text</Button>
        <Button className="flex-1 gap-2" onClick={() => { setStep("typing"); setInput(""); setStartTime(null); }}>
          <RotateCcw className="w-4 h-4" /> Retry
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Govt Exam Practice ───────────────────────────────────────────────────
function GovtExamPractice() {
  const [selected, setSelected] = useState<typeof GOVT_PASSAGES[0] | null>(null);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [finished, setFinished] = useState(false);

  const CATEGORY_COLORS: Record<string, string> = {
    Polity: "text-primary border-primary/30 bg-primary/10",
    Economy: "text-chart-2 border-chart-2/30 bg-chart-2/10",
    Governance: "text-chart-3 border-chart-3/30 bg-chart-3/10",
    Banking: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    Railways: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    SSC: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  };

  if (!selected) return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Practice passages drawn from actual government exam topics — Constitution, Banking, Railways, SSC, UPSC, and more.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOVT_PASSAGES.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={() => setSelected(p)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all group"
          >
            <div className="flex items-start gap-3 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category] ?? "text-muted-foreground"}`}>
                {p.category}
              </span>
            </div>
            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{p.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);
    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === selected.text[i]) correct++;
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);
    const secs = startTime ? (Date.now() - startTime) / 1000 : 1;
    setWpm(Math.round((val.length / 5) / (secs / 60)));
    if (val.length >= selected.text.length) setFinished(true);
  };

  if (finished) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-4">
      <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
      <h3 className="text-2xl font-bold">Passage Complete!</h3>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold font-mono text-primary">{wpm}</div>
          <div className="text-xs text-muted-foreground">WPM</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold font-mono text-chart-2">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => { setSelected(null); setInput(""); setStartTime(null); setFinished(false); setWpm(0); setAccuracy(100); }}>
          Choose Another
        </Button>
        <Button onClick={() => { setInput(""); setStartTime(null); setFinished(false); setWpm(0); setAccuracy(100); }} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Retry
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[selected.category] ?? ""}`}>{selected.category}</span>
        <span className="font-bold">{selected.title}</span>
        <div className="ml-auto flex items-center gap-4 font-mono text-sm">
          <span className="text-primary font-bold">{wpm} WPM</span>
          <span className="text-chart-2">{accuracy}% acc</span>
        </div>
      </div>
      <TypingDisplay text={selected.text} input={input} />
      <textarea value={input} onChange={handleInput} autoFocus autoComplete="off" autoCorrect="off" spellCheck={false}
        className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
        placeholder="Type the passage above..." />
      <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setInput(""); setStartTime(null); setWpm(0); setAccuracy(100); }}>
        ← Choose Different Passage
      </Button>
    </div>
  );
}

// ─── Lesson category colours ──────────────────────────────────────────────
const LESSON_CAT_COLORS: Record<string, string> = {
  "home-row": "text-primary",
  "top-row": "text-chart-2",
  "bottom-row": "text-chart-3",
  "numbers": "text-chart-4",
  "symbols": "text-chart-5",
  "capitalization": "text-yellow-400",
  "punctuation": "text-purple-400",
};

// ─── Page ─────────────────────────────────────────────────────────────────
export default function Practice() {
  const { data: lessons } = useGetLessons({ query: { queryKey: getGetLessonsQueryKey() } });

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-7">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Professional Practice</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Structured training for serious typists — lessons, govt exam passages, custom text, and timed tests.
        </p>
      </motion.div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl flex flex-wrap h-auto gap-1">
          {[
            { val: "lessons", icon: GraduationCap, label: "Lessons" },
            { val: "govt",    icon: Shield,         label: "Govt Exam" },
            { val: "custom",  icon: FileText,        label: "Custom" },
            { val: "timed",   icon: Clock,           label: "Timed Test" },
          ].map(t => (
            <TabsTrigger key={t.val} value={t.val}
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-sm flex-1 min-w-[100px]">
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── Structured Lessons ─── */}
        <TabsContent value="lessons" className="space-y-5">
          <p className="text-sm text-muted-foreground">
            12 progressive lessons covering every key group. Master the fundamentals, then build speed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(lessons ?? []).map((lesson, i) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/lessons/${lesson.id}`}>
                  <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/50 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`text-xs font-mono font-bold uppercase tracking-wider ${LESSON_CAT_COLORS[lesson.category] ?? "text-muted-foreground"}`}>
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

        {/* ─── Govt Exam ─── */}
        <TabsContent value="govt">
          <div className="bg-card border border-blue-400/20 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-400/15 rounded-xl flex items-center justify-center text-blue-400 border border-blue-400/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Government Exam Practice</h3>
                <p className="text-sm text-muted-foreground">SSC · UPSC · Banking · Railways · Police</p>
              </div>
            </div>
            <GovtExamPractice />
          </div>
        </TabsContent>

        {/* ─── Custom Practice ─── */}
        <TabsContent value="custom">
          <div className="bg-card border border-card-border rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-chart-2/15 rounded-xl flex items-center justify-center text-chart-2 border border-chart-2/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Custom Text Practice</h3>
                <p className="text-sm text-muted-foreground">Type any text — code, articles, notes, passages</p>
              </div>
            </div>
            <CustomPractice />
          </div>
        </TabsContent>

        {/* ─── Timed Test ─── */}
        <TabsContent value="timed">
          <div className="bg-card border border-card-border rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary border border-primary/20">
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
