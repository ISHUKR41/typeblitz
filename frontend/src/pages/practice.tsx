import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetLessons, useAnalyzePractice, getGetLessonsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, FileText, Clock, Target,
  CheckCircle2, ArrowRight, Shield, Code2, RotateCcw
} from "lucide-react";
import { soundEffects } from "@/lib/audio";

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
  {
    category: "UPSC",
    title: "Civil Services Examination",
    text: "The Union Public Service Commission conducts the Civil Services Examination to recruit officers for the Indian Administrative Service, Indian Police Service, Indian Foreign Service, and other Group A and Group B Central Services. It is considered one of the most competitive examinations in the country.",
  },
  {
    category: "Polity",
    title: "Fundamental Rights",
    text: "The Fundamental Rights enshrined in Part III of the Constitution of India guarantee civil liberties to all citizens. These include the right to equality, right to freedom, right against exploitation, right to freedom of religion, cultural and educational rights, and the right to constitutional remedies.",
  },
  {
    category: "Polity",
    title: "Directive Principles",
    text: "The Directive Principles of State Policy are contained in Part IV of the Constitution of India. They are non-justiciable guidelines for the governance of the country, aimed at establishing socioeconomic justice and welfare, ensuring equitable distribution of resources and opportunities among all citizens.",
  },
  {
    category: "Economy",
    title: "GST Reform",
    text: "The Goods and Services Tax was introduced in India on the first of July 2017, replacing a complex system of indirect taxes. It is a comprehensive, multi-stage, destination-based tax levied on every value addition, subsuming central excise duty, service tax, value added tax, and several other levies.",
  },
  {
    category: "Banking",
    title: "IBPS Examinations",
    text: "The Institute of Banking Personnel Selection conducts examinations for the recruitment of officers and clerks in public sector banks across India. The selection process consists of a preliminary examination, mains examination, and an interview round for officer-level posts in participating banks.",
  },
  {
    category: "Banking",
    title: "Non-Performing Assets",
    text: "A non-performing asset is a loan or advance for which the principal or interest payment remains overdue for a period of ninety days. Banks are required to classify such assets into substandard, doubtful, and loss categories based on the period and nature of the default by the borrower.",
  },
  {
    category: "Governance",
    title: "Panchayati Raj",
    text: "The Panchayati Raj system provides for a three-tier structure of local self-government in rural areas of India. The seventy-third Constitutional Amendment Act of 1992 gave constitutional status to these institutions and mandated elections, reservation of seats for women and scheduled castes and tribes.",
  },
  {
    category: "Governance",
    title: "E-Governance",
    text: "Electronic governance refers to the use of information and communication technologies by government agencies to transform their relationships with citizens, businesses, and other arms of government. The Digital India initiative aims to ensure government services are made available digitally to empower citizens.",
  },
  {
    category: "SSC",
    title: "Combined Higher Secondary Level",
    text: "The Staff Selection Commission Combined Higher Secondary Level Examination recruits candidates for posts of lower division clerk, junior secretariat assistant, postal assistant, and data entry operators in various central government ministries and departments. The selection is based on a computer-based examination and skill test.",
  },
  {
    category: "Railways",
    title: "RRB NTPC Examination",
    text: "The Railway Recruitment Board conducts the Non-Technical Popular Categories examination to fill vacancies of junior clerk, accounts clerk, junior time keeper, trains clerk, commercial apprentice, station master, and goods guard posts across various railway zones of the Indian Railways network.",
  },
  {
    category: "Police",
    title: "SSC CPO Examination",
    text: "The Staff Selection Commission Central Police Organisations examination recruits sub-inspectors in the Central Armed Police Forces including the Border Security Force, Central Reserve Police Force, and Indo-Tibetan Border Police. Candidates must clear written tests, physical endurance tests, and medical examinations.",
  },
  {
    category: "Judiciary",
    title: "High Court Typing Test",
    text: "High Court stenographer and clerk examinations require candidates to demonstrate proficiency in English typewriting. The prescribed speed is generally forty words per minute with an accuracy of ninety-five percent. Candidates must practice regularly with authentic legal and administrative passage material.",
  },
  {
    category: "Economy",
    title: "NABARD and Agriculture",
    text: "The National Bank for Agriculture and Rural Development was established in 1982 to provide credit and other facilities for the promotion and development of agriculture, small-scale industries, cottage industries, handicrafts, and other rural crafts and industries. It supervises regional rural banks across the country.",
  },
  {
    category: "Polity",
    title: "Parliamentary Procedure",
    text: "The Indian Parliament consists of the President, the Council of States known as the Rajya Sabha, and the House of the People known as the Lok Sabha. Parliament exercises legislative powers, controls the executive, debates national policies, and can pass constitutional amendments with the required majority.",
  },
  {
    category: "Economy",
    title: "Financial Inclusion",
    text: "Financial inclusion aims to ensure that individuals and businesses have access to affordable and useful financial products and services. The Pradhan Mantri Jan Dhan Yojana launched in 2014 opened millions of zero-balance savings accounts for the unbanked population across India, transforming access to banking services.",
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
function countCorrectChars(expected: string, typed: string): number {
  let correct = 0;
  const len = Math.min(expected.length, typed.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === expected[i]) correct++;
  }
  return correct;
}

function calculateWpm(correctChars: number, seconds: number): number {
  return Math.round((correctChars / 5) / (Math.max(seconds, 1) / 60));
}

function calculateAccuracy(expected: string, typed: string): number {
  const correct = countCorrectChars(expected, typed);
  const denominator = Math.max(expected.length, typed.length);
  return denominator > 0 ? Math.round((correct / denominator) * 100) : 100;
}

function TypingDisplay({ text, input }: { text: string; input: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 font-mono text-base md:text-lg leading-loose select-none">
      {text.split("").map((char, i) => {
        let cls: string;
        if (i < input.length)       cls = input[i] === char ? "char-correct" : (char === " " ? "char-wrong-space" : "char-wrong");
        else if (i === input.length) cls = "char-cursor";
        else                         cls = "char-untyped";
        return <span key={i} className={cls}>{char}</span>;
      })}
    </div>
  );
}

// ─── Blind Mode ───────────────────────────────────────────────────────────
const BLIND_WORDS = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes perfect so keep on typing every day",
  "keyboard mastery comes from consistent deliberate repetition",
  "speed follows accuracy focus on correctness first",
  "your fingers know the keys trust your muscle memory",
];

function BlindMode() {
  const [text, setText] = useState(BLIND_WORDS[0]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<{ wpm: number; accuracy: number } | null>(null);
  const [round, setRound] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (!started) { setStarted(true); setStartTime(Date.now()); }
    if (val.length >= text.length) {
      const elapsed = (Date.now() - startTime!) / 60000;
      const correct = val.split("").filter((c, i) => c === text[i]).length;
      const wpm = Math.round((correct / 5) / elapsed);
      const accuracy = Math.round((correct / text.length) * 100);
      setResult({ wpm, accuracy });
      setFinished(true);
      setInput(val.slice(0, text.length));
    } else {
      setInput(val);
    }
  }

  function reset() {
    const next = (round + 1) % BLIND_WORDS.length;
    setRound(next); setText(BLIND_WORDS[next]); setInput("");
    setStarted(false); setFinished(false); setStartTime(null); setResult(null);
    setTimeout(() => ref.current?.focus(), 50);
  }

  const progress = Math.min(100, Math.round((input.length / text.length) * 100));

  return (
    <div className="space-y-5">
      <div className="bg-background/60 border border-border rounded-xl p-4 font-mono text-sm leading-loose select-none">
        {text.split("").map((c, i) => {
          let cls: string;
          if (!started || i >= input.length) cls = i === input.length ? "char-cursor" : "char-untyped";
          else cls = input[i] === c ? "char-correct" : (c === " " ? "char-wrong-space" : "char-wrong");
          return <span key={i} className={cls}>{c}</span>;
        })}
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden progress-neon">
        <motion.div className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
      </div>

      {!finished ? (
        <div className="relative">
          <textarea
            ref={ref}
            value={input}
            onChange={handleChange}
            autoFocus
            autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="Start typing — your input is hidden..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-transparent caret-primary placeholder:text-muted-foreground/60"
            style={{ caretColor: "var(--primary)" }}
          />
          <div className="absolute top-3 right-3 text-xs text-muted-foreground/60 select-none pointer-events-none">
            {input.length}/{text.length}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 border border-primary/25 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold font-mono text-primary">{result?.wpm}</div>
              <div className="text-xs text-muted-foreground mt-1">WPM</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold font-mono text-emerald-400">{result?.accuracy}%</div>
              <div className="text-xs text-muted-foreground mt-1">Accuracy</div>
            </div>
          </div>
          <Button onClick={reset} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" /> Next Passage
          </Button>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Your keystrokes are invisible — this trains pure muscle memory. Round {round + 1}/{BLIND_WORDS.length}
      </p>
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
      const correct = countCorrectChars(text, curr);
      const denominator = Math.max(curr.length, text.length);
      setResult({
        wpm: calculateWpm(correct, duration),
        accuracy: calculateAccuracy(text, curr),
        errors: Math.max(denominator - correct, 0),
      });
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
    const correct = countCorrectChars(customText, val);
    setAccuracy(calculateAccuracy(customText.slice(0, val.length), val));
    const secs = startTime ? (Date.now() - startTime) / 1000 : 1;
    setWpm(calculateWpm(correct, secs));

    if (val.length >= customText.length) {
      const dur = Math.floor(secs);
      const result = await analyzeMutation.mutateAsync({ data: { originalText: customText, typedText: val, duration: dur } });
      setWpm(result.wpm);
      setAccuracy(Math.round(result.accuracy));
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
// ─── Levenshtein Distance & Govt Alignment Evaluation ────────────────────
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

interface ExamResult {
  fullMistakes: number;
  halfMistakes: number;
  totalMistakes: number;
  errorPercentage: number;
  grossWpm: number;
  netWpm: number;
  totalKeystrokes: number;
  totalWordsTyped: number;
  passed: boolean;
}

function evaluateGovtExam(
  masterText: string,
  typedText: string,
  durationMinutes: number,
  examType: string
): ExamResult {
  const masterWords = masterText.trim().split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/);

  let fullMistakes = 0;
  let halfMistakes = 0;

  const maxLen = Math.max(masterWords.length, typedWords.length);
  for (let i = 0; i < maxLen; i++) {
    const mw = masterWords[i];
    const tw = typedWords[i];

    if (!mw) {
      if (tw) fullMistakes++; // extra word typed
    } else if (!tw) {
      fullMistakes++; // word omitted
    } else if (mw === tw) {
      // perfect match
    } else if (mw.toLowerCase() === tw.toLowerCase()) {
      // capitalization error (Half Mistake)
      halfMistakes++;
    } else {
      // spelling or replacement
      const dist = levenshteinDistance(mw, tw);
      if (dist <= Math.max(2, Math.round(mw.length * 0.45))) {
        halfMistakes++; // spelling (Half Mistake)
      } else {
        fullMistakes++; // substitution (Full Mistake)
      }
    }
  }

  const totalMistakes = fullMistakes + (halfMistakes * 0.5);
  const totalKeystrokes = typedText.length;
  const totalWordsTyped = typedWords.length;

  // Gross WPM = keystrokes / 5 / minutes
  const grossWpm = Math.round((totalKeystrokes / 5) / durationMinutes);

  let netWpm = 0;
  let passed = false;
  let errorPercentage = 0;

  if (examType === "ssc") {
    // SSC CHSL/CGL: 1 mistake = 10 depressions penalty
    const penaltyDepressions = totalMistakes * 10;
    const netDepressions = Math.max(0, totalKeystrokes - penaltyDepressions);
    netWpm = Math.round((netDepressions / 5) / durationMinutes);
    errorPercentage = Math.round((totalMistakes / masterWords.length) * 1000) / 10;
    passed = netWpm >= 35 && errorPercentage <= 7.0; // General Category Limit 7%
  } else if (examType === "railway") {
    // Railways NTPC: ignores first 5% mistakes, then penalizes each excess mistake by 10 words (50 depressions)
    const allowedFreeMistakes = Math.round(totalWordsTyped * 0.05);
    const excessMistakes = Math.max(0, totalMistakes - allowedFreeMistakes);
    const penaltyWords = excessMistakes * 10;
    const netWords = Math.max(0, totalWordsTyped - penaltyWords);
    netWpm = Math.round(netWords / durationMinutes);
    errorPercentage = Math.round((totalMistakes / totalWordsTyped) * 1000) / 10;
    passed = netWpm >= 30 && errorPercentage <= 5.0;
  } else {
    // Court Clerk: target 40 WPM, strictly max 3% error
    netWpm = Math.round((totalKeystrokes / 5) / durationMinutes) - Math.round(totalMistakes);
    netWpm = Math.max(0, netWpm);
    errorPercentage = Math.round((totalMistakes / masterWords.length) * 1000) / 10;
    passed = netWpm >= 40 && errorPercentage <= 3.0;
  }

  return {
    fullMistakes,
    halfMistakes,
    totalMistakes,
    errorPercentage,
    grossWpm,
    netWpm,
    totalKeystrokes,
    totalWordsTyped,
    passed,
  };
}

const LONG_GOVT_PASSAGES = [
  {
    category: "SSC CGL Special",
    title: "Administrative Reforms and Digital Governance Mock Test",
    text: "Administrative reforms are an essential element of modern governance. Over the past few decades, the government of India has increasingly shifted towards e-governance systems to deliver services more transparently and effectively. Digital public infrastructure platforms, such as UPI, Aadhaar, and DigiLocker, have simplified interfaces for ordinary citizens and eliminated unnecessary middlemen. This transition to a digital economy has significantly reduced administrative corruption, enhanced fiscal discipline, and speeded up direct benefit transfers to impoverished families. In competitive examinations, aspirants are expected to possess not only general knowledge of these administrative updates but also critical capabilities like high typing speed and error-free execution to perform clerical operations with precision. Rapid digitization has revolutionized operations in municipal boards, state tribunals, and central secretariats alike. Therefore, building standard typing skills has become a mandatory pre-requisite for all major staff recruitments.",
  },
  {
    category: "Railways NTPC Special",
    title: "Indian Railways Infrastructure and Safety Modernization",
    text: "Indian Railways is currently undergoing a massive structural modernization process. Under the new national rail plan, old tracks are being replaced with modern steel routes to handle high-speed trains. Kavach, the indigenous automatic train protection system, is being deployed across thousands of route kilometers to prevent signal passing at danger and head-on collisions. Simultaneously, the station redevelopment program is transforming heritage locations into modern transport hubs. Freight corridors are being electrified to decrease cargo delivery times and improve logistically critical connections between commercial ports and manufacturing zones. Clerical staff in the railways manage crucial operations, including passenger ticketing networks, freight schedules, and cargo rosters. Efficient database entry and error-free typing skills are necessary to prevent logistical delays. The Staff Selection Commission and Railway Recruitment Boards emphasize touch-typing proficiency in skill tests to ensure that candidates can handle heavy administrative databases under tight schedules.",
  },
  {
    category: "UPSC Mains",
    title: "Indian Polity and Constitutional Provisions",
    text: "The Indian Constitution is a living document that has evolved through numerous amendments to address changing socio-political realities. Fundamental Rights guaranteed under Part III protect citizens from arbitrary state action, while Directive Principles of State Policy under Part IV guide the government in formulating welfare legislation. The doctrine of basic structure, established by the Supreme Court, ensures that Parliament cannot destroy the fundamental character of the Constitution even through constitutional amendments. Federal features such as division of powers between the Union and States, independent judiciary, and a bicameral legislature at the centre form the backbone of India's democratic governance framework. The Preamble, often described as the soul of the Constitution, declares India to be a Sovereign, Socialist, Secular, Democratic Republic committed to securing justice, liberty, equality, and fraternity to all its citizens.",
  },
  {
    category: "Banking IBPS",
    title: "Monetary Policy and Reserve Bank of India",
    text: "Monetary policy in India is formulated and implemented by the Reserve Bank of India through its Monetary Policy Committee. The primary objective is to maintain price stability while keeping in mind the goal of growth. The Repo Rate, Reverse Repo Rate, Cash Reserve Ratio, and Statutory Liquidity Ratio are the principal instruments through which the Reserve Bank controls liquidity and credit in the economy. When inflation rises, the central bank typically tightens monetary policy by increasing the repo rate, which raises borrowing costs for commercial banks and thereby reduces money supply in the economy. Conversely, during a slowdown, the RBI reduces rates to stimulate lending, investment, and economic activity. Banking professionals must understand these mechanisms to effectively advise clients, manage interest rate risk, and ensure institutional compliance with regulatory guidelines issued by the Reserve Bank.",
  },
  {
    category: "SSC CPO Police",
    title: "Central Police Organisation and Law Enforcement",
    text: "The Central Police Organisation encompasses a range of paramilitary and specialised forces responsible for internal security, border management, and intelligence operations in India. The Central Reserve Police Force, Border Security Force, Central Industrial Security Force, and the Indo-Tibetan Border Police are among the premier organisations under the Ministry of Home Affairs. Personnel in these forces are recruited through the Staff Selection Commission examinations, which test candidates on general awareness, quantitative aptitude, logical reasoning, and English language proficiency. The Sub-Inspector selection process includes a comprehensive written examination, physical standard test, and a medical examination. Officers must demonstrate not only physical fitness and intelligence but also exceptional integrity, communication skills, and the capacity to handle sensitive administrative functions under considerable pressure.",
  },
  {
    category: "High Court Clerk",
    title: "Judicial Proceedings and Court Administration",
    text: "High Courts in India exercise original and appellate jurisdiction over civil, criminal, and constitutional matters. Court clerks and stenographers play a vital role in maintaining records, preparing cause lists, drafting orders, and managing correspondence between the judiciary and litigants. Accuracy and speed in transcription are essential qualities for court staff. The process of recording evidence, minutes of proceedings, and certified copies of judgments demands meticulous attention to detail and error-free documentation. Legal terminology such as ex-parte proceedings, interlocutory applications, contempt petitions, and writ jurisdiction must be understood and correctly transcribed by court administrative staff. The High Court Stenographer examination conducted by the respective High Court administrations evaluates candidates on English shorthand, transcription accuracy, typing speed, and general English proficiency.",
  },
  {
    category: "UPSC Economics",
    title: "Indian Economy and Planning",
    text: "India's economic planning journey began with the establishment of the Planning Commission in 1950, which formulated Five Year Plans to guide resource allocation and development priorities. The National Institution for Transforming India, popularly known as NITI Aayog, replaced the Planning Commission in 2015, adopting a more consultative and decentralised approach to development policy. India's economy is characterised by its diversity across agriculture, manufacturing, and services sectors. The services sector, which includes information technology, banking, insurance, and telecommunications, contributes over fifty percent of the gross domestic product. Public sector undertakings continue to play a significant role in strategic industries, while liberalisation policies since 1991 have encouraged private investment and foreign direct investment across most sectors of the economy.",
  },
  {
    category: "SSC CHSL",
    title: "Data Entry and Lower Division Clerk Functions",
    text: "Lower Division Clerks and Data Entry Operators form the backbone of government administrative operations. Their primary responsibilities include maintaining official registers, processing applications, entering data into government software systems, preparing letters and reports, managing file movements, and assisting senior officers in day-to-day administrative tasks. The Staff Selection Commission conducts the Combined Higher Secondary Level examination to fill these essential positions across central government ministries and departments. Candidates who qualify the written examination must appear for a skill test that evaluates typing speed at thirty five words per minute on computers. Accuracy is as important as speed because errors in official documents can lead to significant administrative complications and delays in public service delivery.",
  },
];


const ALL_GOVT_PASSAGES = [...GOVT_PASSAGES, ...LONG_GOVT_PASSAGES];

function GovtExamPractice() {
  const [examType, setExamType] = useState("ssc");
  const [testTime, setTestTime] = useState(120); // default 2 minutes (120 seconds) for quick mock
  const [selectedPassage, setSelectedPassage] = useState<typeof ALL_GOVT_PASSAGES[0] | null>(null);

  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [finished, setFinished] = useState(false);
  const [examReport, setExamReport] = useState<ExamResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number | null>(null);

  const CATEGORY_COLORS: Record<string, string> = {
    Polity: "text-primary border-primary/30 bg-primary/10",
    Economy: "text-chart-2 border-chart-2/30 bg-chart-2/10",
    Governance: "text-chart-3 border-chart-3/30 bg-chart-3/10",
    Banking: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    Railways: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    SSC: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    "SSC CGL Special": "text-pink-400 border-pink-400/30 bg-pink-400/10",
    "Railways NTPC Special": "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startExam = (passage: typeof ALL_GOVT_PASSAGES[0]) => {
    setSelectedPassage(passage);
    setInput("");
    setStarted(false);
    setFinished(false);
    setExamReport(null);
    setTimeLeft(testTime);
    startTimeRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            finishExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    setInput(val);

    // Auto finish if they type the entire passage before time runs out
    if (selectedPassage && val.length >= selectedPassage.text.length) {
      finishExam();
    }
  };

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
    setStarted(false);

    setInput(curr => {
      if (selectedPassage) {
        const timeSpentSecs = testTime - timeLeft;
        const timeSpentMins = Math.max(timeSpentSecs, 10) / 60;
        const report = evaluateGovtExam(selectedPassage.text, curr, timeSpentMins, examType);
        setExamReport(report);
      }
      return curr;
    });
  };

  const resetExam = () => {
    setSelectedPassage(null);
    setInput("");
    setStarted(false);
    setFinished(false);
    setExamReport(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 1. SETUP SCREEN
  if (!selectedPassage) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-muted-foreground">SELECT EXAM RULES</label>
            <select
              value={examType}
              onChange={e => setExamType(e.target.value)}
              className="w-full bg-card border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ssc">SSC CGL / CHSL Mock (Target: 35 WPM, Max 7% Error)</option>
              <option value="railway">Railways NTPC Test (Target: 30 WPM, 5% Free Error, 10w penalty)</option>
              <option value="court">High Court Stenographer (Target: 40 WPM, Max 3% Error)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold font-mono text-muted-foreground">SELECT TEST DURATION</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "2 Mins", val: 120 },
                { label: "5 Mins", val: 300 },
                { label: "10 Mins", val: 600 },
              ].map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setTestTime(t.val)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                    testTime === t.val
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold font-mono text-muted-foreground">SELECT TYPING TEST PASSAGE</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ALL_GOVT_PASSAGES.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => startExam(p)}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category] ?? "text-muted-foreground"}`}>
                    {p.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">{Math.round(p.text.length / 5)} words</span>
                </div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{p.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. RESULTS REPORT SCREEN
  if (finished && examReport) {
    const { passed, netWpm, grossWpm, totalKeystrokes, totalMistakes, fullMistakes, halfMistakes, errorPercentage } = examReport;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6 py-4"
      >
        <div className={`p-6 rounded-2xl border text-center space-y-3 ${
          passed
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <div className="text-4xl font-extrabold font-mono tracking-wider">{passed ? "PASS" : "FAIL"}</div>
          <p className="text-sm text-white/85 max-w-md mx-auto">
            {passed
              ? "Congratulations! You cleared the speed and accuracy thresholds for this government skill exam."
              : "Keep practicing! You failed to meet the required speed target or exceeded the permissible mistake rate."}
          </p>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Net Speed", val: `${netWpm} WPM`, color: "text-primary" },
            { label: "Gross Speed", val: `${grossWpm} WPM`, color: "text-white" },
            { label: "Accuracy", val: `${Math.max(0, Math.round(100 - errorPercentage))}%`, color: "text-chart-2" },
            { label: "Total Depressions", val: totalKeystrokes, color: "text-chart-3" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Evaluation details sheet */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h4 className="font-bold text-sm font-mono border-b border-border pb-2">OFFICIAL EVALUATION SHEET</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Full Mistakes:</span>
                <span className="text-red-400 font-bold">{fullMistakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Half Mistakes (×0.5):</span>
                <span className="text-orange-400 font-bold">{halfMistakes}</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2">
                <span className="text-muted-foreground">Total Mistakes Tally:</span>
                <span className="text-red-500 font-extrabold">{totalMistakes}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Error Rate:</span>
                <span className="font-bold">{errorPercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissible Limit:</span>
                <span className="font-bold">
                  {examType === "ssc" ? "7.0% Max" : examType === "railway" ? "5.0% Max" : "3.0% Max"}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2">
                <span className="text-muted-foreground">Speed Target:</span>
                <span className="text-emerald-400 font-bold">
                  {examType === "ssc" ? "35 WPM" : examType === "railway" ? "30 WPM" : "40 WPM"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={resetExam}>Choose Another Test</Button>
          <Button className="flex-1 gap-2" onClick={() => startExam(selectedPassage)}><RotateCcw className="w-4 h-4" /> Retry Test</Button>
        </div>
      </motion.div>
    );
  }

  // 3. EXAM IN PROGRESS
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-muted/15 p-3 rounded-xl border border-border/60">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/25">
            {examType === "ssc" ? "SSC RULES" : examType === "railway" ? "RAILWAY NTPC" : "COURT CLERK"}
          </span>
          <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-none">{selectedPassage.title}</span>
        </div>
        <div className={`font-mono text-3xl font-extrabold tabular-nums ${timeLeft <= 20 ? "text-destructive animate-pulse" : "text-primary"}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Master copy reference passage */}
      <div className="bg-card/70 border border-border rounded-xl p-4 sm:p-5 font-mono text-base md:text-lg leading-relaxed select-none h-44 overflow-y-auto double-spacing-text">
        {selectedPassage.text}
      </div>

      {/* Exam writing pad */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>Keystrokes: {input.length} depressions</span>
          <span>Copy-paste is disabled</span>
        </div>
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onPaste={e => {
            e.preventDefault();
            soundEffects.playError();
          }}
          disabled={finished}
          className="w-full bg-card border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[140px] transition-all leading-relaxed"
          placeholder="Start typing the passage above to trigger the timer..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={resetExam}>← Exit Simulator</Button>
        {started && (
          <Button variant="destructive" size="sm" onClick={finishExam}>Submit Exam Sheet</Button>
        )}
      </div>
    </div>
  );
}

// ─── Code Practice ────────────────────────────────────────────────────────
const CODE_SNIPPETS = [
  {
    lang: "TypeScript",
    icon: "⚡",
    title: "Async API Fetch",
    code: `async function fetchUser(id: string): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) throw new Error("Not found");\n  return res.json();\n}`,
  },
  {
    lang: "TypeScript",
    icon: "⚡",
    title: "React Hook Pattern",
    code: `function useLocalStorage<T>(key: string, init: T) {\n  const [val, setVal] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    return stored ? JSON.parse(stored) : init;\n  });\n  return [val, setVal] as const;\n}`,
  },
  {
    lang: "Python",
    icon: "🐍",
    title: "Class with Methods",
    code: `class Stack:\n    def __init__(self):\n        self.items = []\n    def push(self, item):\n        self.items.append(item)\n    def pop(self):\n        return self.items.pop() if self.items else None\n    def is_empty(self):\n        return len(self.items) == 0`,
  },
  {
    lang: "Python",
    icon: "🐍",
    title: "List Comprehension",
    code: `def process_scores(scores: list[int]) -> dict:\n    passing = [s for s in scores if s >= 40]\n    failing = [s for s in scores if s < 40]\n    return {\n        "average": sum(scores) / len(scores),\n        "passing": len(passing),\n        "failing": len(failing),\n    }`,
  },
  {
    lang: "SQL",
    icon: "🗄️",
    title: "Aggregation Query",
    code: `SELECT u.username,\n       COUNT(s.id) AS sessions,\n       AVG(s.wpm) AS avg_wpm,\n       MAX(s.wpm) AS best_wpm\nFROM users u\nLEFT JOIN sessions s ON u.id = s.user_id\nGROUP BY u.id, u.username\nHAVING COUNT(s.id) > 0\nORDER BY avg_wpm DESC\nLIMIT 10;`,
  },
  {
    lang: "SQL",
    icon: "🗄️",
    title: "Table Creation",
    code: `CREATE TABLE sessions (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    user_id UUID NOT NULL REFERENCES users(id),\n    game_mode VARCHAR(50) NOT NULL,\n    wpm INTEGER NOT NULL CHECK (wpm >= 0),\n    accuracy DECIMAL(5,2) NOT NULL,\n    created_at TIMESTAMPTZ DEFAULT NOW()\n);`,
  },
  {
    lang: "JavaScript",
    icon: "🟨",
    title: "Debounce Utility",
    code: `function debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      fn.apply(this, args);\n    }, delay);\n  };\n}`,
  },
  {
    lang: "Go",
    icon: "🔷",
    title: "HTTP Handler",
    code: `func GetUser(w http.ResponseWriter, r *http.Request) {\n    id := chi.URLParam(r, "id")\n    user, err := db.FindUser(r.Context(), id)\n    if err != nil {\n        http.Error(w, "not found", 404)\n        return\n    }\n    json.NewEncoder(w).Encode(user)\n}`,
  },
];

const LANG_FILTERS = ["All", "TypeScript", "Python", "SQL", "JavaScript", "Go"];

function CodePractice() {
  const [selectedLang, setSelectedLang] = useState("All");
  const [snippet, setSnippet] = useState<typeof CODE_SNIPPETS[0] | null>(null);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; errors: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = selectedLang === "All" ? CODE_SNIPPETS : CODE_SNIPPETS.filter(s => s.lang === selectedLang);

  function startSnippet(s: typeof CODE_SNIPPETS[0]) {
    setSnippet(s);
    setInput("");
    setStartTime(null);
    setResult(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    if (!startTime && val.length > 0) setStartTime(Date.now());
    setInput(val);
    if (snippet && val.length >= snippet.code.length) {
      const elapsed = (Date.now() - (startTime ?? Date.now())) / 60000;
      const correct = countCorrectChars(snippet.code, val);
      const errors = Math.max(0, snippet.code.length - correct);
      const wpm = Math.round((correct / 5) / Math.max(elapsed, 0.001));
      const accuracy = Math.round((correct / snippet.code.length) * 100);
      setResult({ wpm, accuracy, errors });
    }
  }

  if (result && snippet) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto space-y-5 py-4 text-center">
        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-2xl">{snippet.icon}</div>
        <h3 className="text-2xl font-bold">Code Typed!</h3>
        <p className="text-sm text-muted-foreground">{snippet.lang} — {snippet.title}</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "WPM", val: result.wpm, cls: "text-primary" },
            { label: "Accuracy", val: `${result.accuracy}%`, cls: "text-chart-2" },
            { label: "Errors", val: result.errors, cls: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3">
              <div className={`text-2xl font-bold font-mono ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => { setSnippet(null); setResult(null); }}>All Snippets</Button>
          <Button className="flex-1 gap-2" onClick={() => startSnippet(snippet)}><RotateCcw className="w-4 h-4" /> Retry</Button>
        </div>
      </motion.div>
    );
  }

  if (snippet) {
    const progress = snippet.code.length > 0 ? Math.min(100, Math.round((input.length / snippet.code.length) * 100)) : 0;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{snippet.icon}</span>
            <span className="font-bold text-sm">{snippet.lang}</span>
            <span className="text-muted-foreground text-sm">— {snippet.title}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSnippet(null)}>← Back</Button>
        </div>
        <div className="bg-background/60 border border-border rounded-xl p-4 font-mono text-sm leading-loose select-none whitespace-pre-wrap">
          {snippet.code.split("").map((char, i) => {
            let cls: string;
            if (i < input.length)        cls = input[i] === char ? "char-correct" : (char === " " ? "char-wrong-space" : "char-wrong");
            else if (i === input.length)  cls = "char-cursor";
            else                          cls = "char-untyped";
            return <span key={i} className={cls}>{char}</span>;
          })}
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden progress-neon">
          <motion.div className="h-full bg-gradient-to-r from-primary to-chart-4 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          autoFocus
          autoComplete="off" autoCorrect="off" spellCheck={false}
          rows={5}
          className="w-full resize-none rounded-xl border border-border bg-card p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          placeholder="Type the code above..."
        />
        <p className="text-xs text-muted-foreground text-center">{input.length} / {snippet.code.length} characters</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {LANG_FILTERS.map(lang => (
          <button key={lang} onClick={() => setSelectedLang(lang)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedLang === lang ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            {lang}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }} onClick={() => startSnippet(s)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{s.lang}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 ml-auto transition-colors" />
            </div>
            <div className="font-bold text-sm group-hover:text-primary transition-colors mb-1">{s.title}</div>
            <pre className="text-[10px] text-muted-foreground font-mono line-clamp-3 leading-relaxed overflow-hidden">{s.code}</pre>
          </motion.div>
        ))}
      </div>
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/60 p-6 md:p-8">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-40 bg-primary/7 rounded-full blur-[70px]" />
          <div className="absolute bottom-0 right-1/3 w-60 h-32 bg-chart-3/5 rounded-full blur-[55px]" />
        </div>
        <div className="absolute inset-0 neon-grid opacity-25 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Professional Practice</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Structured training for serious typists — lessons, govt exam passages, custom text, and timed tests.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "6 Modes", color: "text-primary border-primary/30 bg-primary/10" },
                { label: "Govt Exam Ready", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
                { label: "Code Typing", color: "text-chart-3 border-chart-3/30 bg-chart-3/10" },
              ].map(({ label, color }) => (
                <span key={label} className={`text-[11px] font-bold px-3 py-1 rounded-full border font-mono ${color}`}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl flex flex-wrap h-auto gap-1">
          {[
            { val: "lessons", icon: GraduationCap, label: "Lessons" },
            { val: "govt",    icon: Shield,         label: "Govt Exam" },
            { val: "code",    icon: Code2,          label: "Code" },
            { val: "custom",  icon: FileText,        label: "Custom" },
            { val: "timed",   icon: Clock,           label: "Timed Test" },
            { val: "blind",   icon: Target,          label: "Blind Mode" },
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
            {(lessons ?? []).map((lesson: any, i: number) => (
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
                        {lesson.targetKeys.slice(0, 6).map((k: string) => (
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

        {/* ─── Code Practice ─── */}
        <TabsContent value="code">
          <div className="bg-card border border-primary/20 rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Code Snippet Practice</h3>
                <p className="text-sm text-muted-foreground">TypeScript · Python · SQL · JavaScript · Go — real code, real speed</p>
              </div>
            </div>
            <CodePractice />
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

        {/* ─── Blind Mode ─── */}
        <TabsContent value="blind">
          <div className="bg-card border border-card-border rounded-2xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-chart-4/15 rounded-xl flex items-center justify-center text-chart-4 border border-chart-4/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Blind Mode</h3>
                <p className="text-sm text-muted-foreground">Type without seeing your input — the ultimate muscle memory trainer</p>
              </div>
            </div>
            <BlindMode />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
