import { Router } from "express";
import { getConnectionStatus } from "../lib/db.js";
import { Session } from "../models/index.js";

const router = Router();

const DAILY_CHALLENGES = [
  {
    id: "constitution-fundamentals",
    title: "Constitution Fundamentals",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["UPSC", "SSC", "Polity"],
    text: "The Constitution of India establishes justice, liberty, equality, and fraternity as guiding principles for democratic governance and public administration.",
  },
  {
    id: "banking-operations",
    title: "Banking Operations",
    category: "Govt Exam",
    targetWpm: 38,
    tags: ["Banking", "IBPS", "SBI"],
    text: "A scheduled commercial bank accepts deposits, extends credit, maintains liquidity ratios, manages risk exposure, and follows Reserve Bank of India regulations.",
  },
  {
    id: "railway-technical",
    title: "Railway Technical Terms",
    category: "Govt Exam",
    targetWpm: 34,
    tags: ["Railways", "RRB", "Technical"],
    text: "Railway signalling, traction systems, station yards, freight corridors, and safety protocols support reliable passenger and goods movement across India.",
  },
  {
    id: "typescript-api",
    title: "TypeScript API Drill",
    category: "Code",
    targetWpm: 32,
    tags: ["TypeScript", "API", "Backend"],
    text: "export async function fetchUserStats(userId: string) { const response = await fetch(`/api/users/${userId}/stats`); return response.json(); }",
  },
  {
    id: "python-loop",
    title: "Python Logic Drill",
    category: "Code",
    targetWpm: 30,
    tags: ["Python", "Logic", "Loops"],
    text: "for index, value in enumerate(scores): average += value / len(scores); print(f'Rank {index + 1}: {round(average, 2)}')",
  },
  {
    id: "professional-email",
    title: "Professional Communication",
    category: "Professional",
    targetWpm: 42,
    tags: ["Office", "Email", "Accuracy"],
    text: "Please review the attached report, verify the pending observations, and share a concise update before the scheduled meeting tomorrow morning.",
  },
  {
    id: "public-finance",
    title: "Public Finance",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["Economy", "UPSC", "Finance"],
    text: "Fiscal deficit, revenue expenditure, capital receipts, direct taxes, subsidies, and public debt are central concepts in government budget analysis.",
  },
  {
    id: "ssc-cgl-administration",
    title: "SSC CGL Administration",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["SSC", "CGL", "Administration"],
    text: "The Staff Selection Commission conducts examinations for recruitment to Group B and Group C posts in various ministries, departments, and attached offices of the Government of India.",
  },
  {
    id: "ssc-chsl-clerical",
    title: "SSC CHSL Clerical Skills",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["SSC", "CHSL", "Clerical"],
    text: "Lower Division Clerks maintain official records, handle correspondence, prepare reports, process applications, manage file movements, and assist senior officers in administrative functions.",
  },
  {
    id: "court-stenographer",
    title: "Court Proceedings",
    category: "Govt Exam",
    targetWpm: 40,
    tags: ["Court", "Stenographer", "Legal"],
    text: "The Honourable Court directed that the respondent shall file a written statement within thirty days and the matter shall be listed for hearing on the next date fixed by the registry.",
  },
  {
    id: "police-examination",
    title: "Police Examination Passage",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["Police", "SSC", "CPO"],
    text: "Central Police Organisation recruits Sub-Inspectors through written examination, physical endurance test, and medical examination conducted under the supervision of the commission.",
  },
  {
    id: "ias-governance",
    title: "IAS Governance Concepts",
    category: "Govt Exam",
    targetWpm: 38,
    tags: ["UPSC", "IAS", "Governance"],
    text: "Good governance emphasises transparency, accountability, responsiveness, consensus orientation, equity, inclusiveness, effectiveness, and adherence to the rule of law in public administration.",
  },
  {
    id: "defense-services",
    title: "Defence Services",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["Defense", "NDA", "CDS"],
    text: "The Combined Defence Services Examination selects candidates for admission to the Indian Military Academy, Indian Naval Academy, Air Force Academy, and Officers Training Academy.",
  },
  {
    id: "election-commission",
    title: "Election Commission",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["Polity", "SSC", "Elections"],
    text: "The Election Commission of India is an autonomous constitutional body responsible for administering union and state election processes, ensuring free and fair elections across the country.",
  },
  {
    id: "react-component",
    title: "React Component Pattern",
    category: "Code",
    targetWpm: 30,
    tags: ["React", "JSX", "Frontend"],
    text: "const Dashboard = ({ user, stats }: Props) => { return (<div className='grid gap-4'><Header name={user.name} /><StatsCard data={stats} /></div>); };",
  },
  {
    id: "rti-act",
    title: "Right to Information",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["UPSC", "SSC", "RTI", "Governance"],
    text: "The Right to Information Act of 2005 empowers every citizen to seek information from public authorities, mandating timely responses within thirty days to promote transparency and accountability.",
  },
  {
    id: "rbi-monetary-policy",
    title: "RBI Monetary Policy",
    category: "Govt Exam",
    targetWpm: 38,
    tags: ["Banking", "IBPS", "RBI", "Economy"],
    text: "The Monetary Policy Committee determines the repo rate, reverse repo rate, and cash reserve ratio to control inflation, manage liquidity, and support sustainable economic growth in India.",
  },
  {
    id: "fundamental-rights",
    title: "Fundamental Rights",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["UPSC", "Polity", "Constitution"],
    text: "Fundamental rights guaranteed under Part III of the Constitution include equality before law, freedom of speech, protection from arbitrary arrest, and the right to move the Supreme Court for enforcement.",
  },
  {
    id: "directive-principles",
    title: "Directive Principles",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["UPSC", "Polity", "DPSP"],
    text: "Directive Principles of State Policy, though non-justiciable, guide the government to promote welfare, ensure equitable distribution of wealth, and provide free legal aid to all citizens.",
  },
  {
    id: "sql-joins",
    title: "SQL Joins and Queries",
    category: "Code",
    targetWpm: 28,
    tags: ["SQL", "Database", "Backend"],
    text: "SELECT u.name, COUNT(s.id) AS sessions FROM users u LEFT JOIN sessions s ON u.id = s.user_id GROUP BY u.id ORDER BY sessions DESC LIMIT 10;",
  },
  {
    id: "panchayati-raj",
    title: "Panchayati Raj System",
    category: "Govt Exam",
    targetWpm: 35,
    tags: ["Polity", "SSC", "Governance"],
    text: "The Panchayati Raj system establishes three-tier local self-governance in rural areas comprising gram panchayat at village level, panchayat samiti at block level, and zila parishad at district level.",
  },
  {
    id: "indian-judiciary",
    title: "Indian Judiciary",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["Polity", "UPSC", "Judiciary"],
    text: "The Supreme Court of India, as the apex judicial authority, exercises original jurisdiction in disputes between states, appellate jurisdiction over High Courts, and advisory jurisdiction at presidential request.",
  },
  {
    id: "docker-containerization",
    title: "Docker Containerization",
    category: "Code",
    targetWpm: 28,
    tags: ["DevOps", "Docker", "Cloud"],
    text: "FROM node:20-alpine AS builder; WORKDIR /app; COPY package.json .; RUN npm ci; COPY . .; RUN npm run build; FROM node:20-alpine; COPY --from=builder /app/dist ./dist;",
  },
  {
    id: "census-demography",
    title: "Census and Demography",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["Economy", "SSC", "UPSC", "Statistics"],
    text: "The decennial census records population distribution, literacy rate, sex ratio, urban-rural division, occupational patterns, and housing conditions across all states and union territories of India.",
  },
  {
    id: "income-tax",
    title: "Income Tax Fundamentals",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["Finance", "SSC", "Banking", "Taxation"],
    text: "Income from salary, house property, business, capital gains, and other sources is aggregated under the Income Tax Act to compute total taxable income after permissible deductions under various sections.",
  },
  {
    id: "python-classes",
    title: "Python OOP Pattern",
    category: "Code",
    targetWpm: 30,
    tags: ["Python", "OOP", "Classes"],
    text: "class GameSession: def __init__(self, user_id: str, game: str): self.user_id = user_id; self.game = game; self.wpm = 0; self.accuracy = 0.0; self.started_at = datetime.now()",
  },
  {
    id: "budget-cycle",
    title: "Budget and Fiscal Policy",
    category: "Govt Exam",
    targetWpm: 37,
    tags: ["Economy", "UPSC", "Finance"],
    text: "The Union Budget is presented annually before Parliament, comprising revenue budget and capital budget, detailing receipts, expenditures, taxes, borrowings, and allocations across all central government departments.",
  },
  {
    id: "environmental-law",
    title: "Environment and Law",
    category: "Govt Exam",
    targetWpm: 36,
    tags: ["UPSC", "Environment", "Governance"],
    text: "The Environment Protection Act empowers the central government to protect and improve environmental quality, control pollution, and enforce penalties against industries violating prescribed environmental standards.",
  },
];

router.get("/today", (req, res) => {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const todayChallenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  res.json({
    ...todayChallenge,
    date: now.toISOString().slice(0, 10),
    total: DAILY_CHALLENGES.length,
  });
});

router.get("/", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
  const category = req.query.category as string | undefined;

  let filtered = DAILY_CHALLENGES;
  if (category && category !== "All") {
    filtered = DAILY_CHALLENGES.filter(c => c.category === category);
  }

  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  res.json({
    challenges: slice,
    total: filtered.length,
    page,
    limit,
  });
});

router.get("/:id", (req, res) => {
  const challenge = DAILY_CHALLENGES.find(c => c.id === req.params.id);
  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }
  res.json(challenge);
});

router.post("/:id/scores", async (req, res) => {
  if (!getConnectionStatus()) {
    res.json({ saved: false, reason: "no-db" });
    return;
  }

  const { userId, wpm, accuracy, duration } = req.body;
  if (!userId || wpm == null || accuracy == null) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const session = new Session({
      userId,
      gameId: `challenge:${req.params.id}`,
      levelNumber: 1,
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 10) / 10,
      duration: duration || 0,
      correctWords: 0,
      wrongWords: 0,
      totalWords: 0,
      keystrokes: 0,
      errors: 0,
      letterErrors: [],
    });
    await session.save();
    res.json({ saved: true, sessionId: session._id.toString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
  }
});

export default router;
