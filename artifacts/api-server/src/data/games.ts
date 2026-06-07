export interface GameLevel {
  id: number;
  number: number;
  name: string;
  description: string;
  targetWpm: number;
  targetAccuracy: number;
  duration: number | null;
  wordCount: number | null;
  words: string[];
  text?: string;
}

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  category: "game" | "professional";
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  levels: GameLevel[];
}

const govtExamWords = [
  // SSC/UPSC common terms
  "constitution", "parliament", "sovereignty", "judiciary", "legislature",
  "executive", "fundamental", "directive", "amendment", "preamble",
  "citizenship", "federalism", "secularism", "democracy", "republic",
  "governance", "administration", "bureaucracy", "referendum", "ordinance",
  "legislation", "promulgation", "dissolution", "incumbent", "manifesto",
  "coalition", "constituency", "electorate", "franchise", "suffrage",
  "appropriation", "allocation", "expenditure", "revenue", "fiscal",
  "monetary", "inflation", "deflation", "recession", "GDP",
  "census", "demographic", "population", "urbanization", "migration",
  "reservation", "quota", "affirmative", "tribunal", "arbitration",
  "jurisdiction", "appellate", "litigant", "plaintiff", "defendant",
  "magistrate", "advocate", "prosecution", "acquittal", "conviction",
  "infrastructure", "irrigation", "agriculture", "cultivation", "harvest",
  "procurement", "subsidies", "fertilizer", "pesticide", "horticulture",
  "autonomy", "referendum", "ratification", "multilateral", "bilateral",
  "diplomatic", "ambassador", "consulate", "embassy", "extradition",
  "sanction", "treaty", "protocol", "convention", "declaration",
  // Banking terms
  "transaction", "liability", "collateral", "mortgage", "amortization",
  "depreciation", "appreciation", "portfolio", "dividend", "debenture",
  "liquidity", "solvency", "insolvency", "bankruptcy", "receivership",
  "repository", "custodian", "fiduciary", "regulatory", "compliance",
  // RRB terms
  "locomotive", "traction", "pantograph", "overhead", "electrification",
  "signal", "semaphore", "interlocking", "marshalling", "shunting",
  "gauge", "coupler", "axle", "bogie", "derailment",
];

const codeWords = [
  "function", "variable", "constant", "return", "import",
  "export", "interface", "abstract", "extends", "implements",
  "constructor", "prototype", "inheritance", "polymorphism", "encapsulation",
  "asynchronous", "callback", "promise", "async", "await",
  "component", "render", "useState", "useEffect", "useRef",
  "middleware", "endpoint", "request", "response", "payload",
  "algorithm", "recursion", "iteration", "complexity", "optimization",
  "database", "query", "schema", "migration", "transaction",
  "authentication", "authorization", "encryption", "decryption", "hashing",
  "repository", "dependency", "module", "package", "library",
  "deployment", "containerize", "kubernetes", "microservice", "API",
  "refactor", "debugging", "breakpoint", "stacktrace", "exception",
  "boolean", "integer", "string", "array", "object",
  "null", "undefined", "typeof", "instanceof", "prototype",
  "closure", "scope", "hoisting", "lexical", "context",
  "dispatch", "reducer", "selector", "mutation", "subscriber",
  "webhook", "pipeline", "CI/CD", "version", "repository",
  "gradient", "tensor", "neural", "inference", "regression",
];

const codeSnippets = [
  "const result = arr.filter(x => x > 0).map(x => x * 2)",
  "async function fetchData(url) { const res = await fetch(url); return res.json(); }",
  "const [state, setState] = useState(initialValue)",
  "useEffect(() => { return () => cleanup(); }, [dependency])",
  "const sorted = [...items].sort((a, b) => a.value - b.value)",
  "export default function Component({ children, className }) {}",
  "db.select().from(table).where(eq(table.id, id)).limit(10)",
  "router.get('/users/:id', async (req, res) => { res.json(user); })",
  "const schema = z.object({ name: z.string().min(1), age: z.number() })",
  "Promise.all([fetchUsers(), fetchPosts()]).then(([users, posts]) => {})",
  "git commit -m 'feat: add user authentication with JWT'",
  "npm install --save-dev @types/node typescript ts-node",
  "SELECT * FROM users WHERE created_at > NOW() - INTERVAL '7 days'",
  "docker build -t app:latest . && docker run -p 3000:3000 app:latest",
];

const easyWords = [
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
  "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
  "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
  "its", "let", "put", "say", "she", "too", "use", "run", "sit", "big",
  "box", "cat", "dog", "fly", "got", "had", "hot", "job", "key", "log",
  "map", "met", "mix", "mud", "net", "nod", "odd", "off", "opt", "own",
  "pay", "pen", "pop", "pot", "raw", "red", "rid", "rip", "rob", "rod",
  "row", "rub", "rug", "rum", "run", "sad", "sap", "sat", "saw", "set",
];

const mediumWords = [
  "about", "above", "after", "again", "along", "among", "below", "bring",
  "build", "carry", "cause", "clean", "clear", "close", "comes", "cover",
  "could", "cross", "drive", "early", "earth", "eight", "every", "exact",
  "false", "field", "first", "fixed", "flame", "flash", "float", "floor",
  "force", "found", "front", "fruit", "fully", "given", "glass", "going",
  "grace", "grade", "grain", "grand", "grant", "grass", "great", "green",
  "group", "guard", "guide", "heart", "heavy", "hence", "house", "human",
  "image", "index", "inner", "input", "issue", "judge", "keeps", "known",
  "large", "later", "layer", "learn", "least", "leave", "level", "light",
  "limit", "local", "logic", "lower", "major", "maker", "match", "means",
  "media", "minor", "model", "money", "month", "moral", "moved", "music",
  "named", "night", "north", "noted", "novel", "nurse", "offer", "often",
  "other", "owned", "panel", "paper", "party", "peace", "phase", "place",
  "plain", "plane", "plant", "plate", "plays", "point", "power", "press",
  "price", "prime", "prior", "prize", "proof", "prove", "queen", "quick",
  "quiet", "quite", "radio", "raise", "range", "rapid", "ratio", "reach",
  "ready", "realm", "refer", "reset", "right", "river", "round", "route",
  "royal", "rules", "scale", "scene", "score", "sense", "serve", "setup",
  "share", "sharp", "shift", "short", "since", "skill", "small", "solar",
  "solid", "solve", "sound", "space", "speed", "spend", "spoke", "stage",
  "stand", "start", "state", "steel", "still", "stock", "stone", "store",
  "storm", "story", "study", "style", "sugar", "suite", "super", "swift",
  "table", "taken", "terms", "there", "thing", "think", "those", "three",
  "throw", "timer", "title", "today", "token", "total", "touch", "track",
  "trade", "train", "trust", "truth", "twice", "typed", "under", "union",
  "units", "until", "upper", "urban", "usage", "users", "usual", "value",
  "video", "visit", "vital", "voice", "voter", "waste", "watch", "water",
  "while", "white", "whole", "width", "world", "worth", "would", "write",
  "wrong", "yield", "young", "youth", "zones",
];

const hardWords = [
  "abbreviation", "acceleration", "accommodation", "acknowledgment",
  "administration", "advertisement", "aforementioned", "approximately",
  "architecture", "assassination", "authentication", "authorization",
  "bureaucracy", "circumstantial", "collaboration", "commemoration",
  "communication", "compassionate", "comprehensive", "concentration",
  "configuration", "congratulation", "consciousness", "consideration",
  "constitutional", "contemporary", "controversial", "correspondent",
  "crystallization", "decentralization", "deliberation", "determination",
  "differentiation", "disorganization", "documentation", "electromagnetic",
  "encouragement", "enlightenment", "establishment", "exaggeration",
  "examination", "experimentation", "extraordinary", "facilitation",
  "familiarization", "functionality", "generalization", "globalization",
  "hospitalization", "identification", "implementation", "infrastructure",
  "initialization", "institutionalization", "interpretation", "investigation",
  "justification", "knowledgeable", "liberalization", "manifestation",
  "microcontroller", "modernization", "multiplication", "nationalization",
  "normalization", "organizational", "parliamentary", "participation",
  "pharmaceutical", "photographers", "predominantly", "prioritization",
  "privatization", "professionalism", "psychological", "qualification",
  "recommendation", "regularization", "rehabilitation", "reimbursement",
  "reinforcement", "representation", "responsibility", "reverberation",
  "sophistication", "standardization", "subordination", "summarization",
  "supplementary", "technological", "telecommunication", "transmission",
  "understanding", "unfortunately", "urbanization", "visualization",
  "vulnerability", "worthwhileness",
];

const sentences = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "She sells seashells by the seashore every day.",
    "Pack my box with five dozen liquor jugs.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood.",
    "All good things must come to an end eventually.",
    "Practice makes perfect when learning new skills.",
    "The sun rises in the east and sets in the west.",
    "Every cloud has a silver lining in the sky.",
    "A journey of a thousand miles begins with a single step.",
    "Actions speak louder than words in every situation.",
  ],
  medium: [
    "The government has announced a new policy for infrastructure development across all states.",
    "Technology has revolutionized the way we communicate and share information globally.",
    "The Supreme Court delivered a landmark judgment on fundamental rights today.",
    "Climate change poses a significant threat to biodiversity and ecosystems worldwide.",
    "Financial inclusion remains a key priority for the Reserve Bank of India.",
    "The parliament passed the new amendment with a two-thirds majority vote.",
    "Artificial intelligence is transforming industries from healthcare to transportation.",
    "The census data reveals significant changes in population distribution patterns.",
    "Digital literacy programs are essential for empowering rural communities nationwide.",
    "Economic reforms have accelerated growth in the manufacturing and services sectors.",
  ],
  hard: [
    "The constitutional amendment requires ratification by at least two-thirds of the state legislatures to become law.",
    "Macroeconomic stabilization policies must balance inflationary pressures with the need for sustainable economic growth.",
    "The judiciary plays a crucial role in upholding democratic values and ensuring the rule of law prevails.",
    "Decentralization of administrative powers empowers local governance structures to address community-specific challenges effectively.",
    "The proliferation of misinformation necessitates comprehensive media literacy education across all demographics.",
    "Geopolitical realignments in the Indo-Pacific region have significant implications for multilateral trade agreements.",
    "Environmental sustainability and economic development must be harmonized through evidence-based policymaking frameworks.",
    "The implementation of blockchain technology in public administration promises enhanced transparency and accountability.",
    "Neuroplasticity research demonstrates that consistent cognitive training can significantly improve memory and processing speed.",
    "Quantum computing represents a paradigm shift that will fundamentally alter cybersecurity and cryptographic protocols.",
  ],
};

export const GAMES: GameDefinition[] = [
  {
    id: "word-blitz",
    name: "Word Blitz",
    description: "Type words as fast as you can before they disappear. Build speed and vocabulary simultaneously.",
    category: "game",
    icon: "⚡",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Warm Up", description: "Short common words to get started", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20, words: easyWords.slice(0, 40) },
      { id: 2, number: 2, name: "Picking Up Speed", description: "More words, faster pace", targetWpm: 30, targetAccuracy: 87, duration: 60, wordCount: 25, words: easyWords.concat(mediumWords.slice(0, 20)) },
      { id: 3, number: 3, name: "Medium Challenge", description: "5-letter words with higher targets", targetWpm: 40, targetAccuracy: 88, duration: 60, wordCount: 30, words: mediumWords.slice(0, 60) },
      { id: 4, number: 4, name: "Advanced Blitz", description: "Complex words, strict timing", targetWpm: 50, targetAccuracy: 90, duration: 60, wordCount: 35, words: mediumWords.concat(hardWords.slice(0, 15)) },
      { id: 5, number: 5, name: "Expert Mode", description: "Only the hardest words under pressure", targetWpm: 65, targetAccuracy: 92, duration: 60, wordCount: 40, words: hardWords },
    ],
  },
  {
    id: "sentence-sprint",
    name: "Sentence Sprint",
    description: "Race through full sentences. Every character counts — accuracy is everything here.",
    category: "game",
    icon: "🏃",
    difficulty: "intermediate",
    levels: [
      { id: 1, number: 1, name: "Easy Sentences", description: "Short, simple sentences to build flow", targetWpm: 25, targetAccuracy: 88, duration: 120, wordCount: null, words: [], text: sentences.easy.join(" ") },
      { id: 2, number: 2, name: "Moderate Flow", description: "Longer sentences with punctuation", targetWpm: 35, targetAccuracy: 90, duration: 120, wordCount: null, words: [], text: sentences.medium.slice(0, 5).join(" ") },
      { id: 3, number: 3, name: "Complex Sentences", description: "Government and current affairs vocabulary", targetWpm: 45, targetAccuracy: 90, duration: 120, wordCount: null, words: [], text: sentences.medium.join(" ") },
      { id: 4, number: 4, name: "Advanced Prose", description: "Dense, formal writing with technical terms", targetWpm: 55, targetAccuracy: 92, duration: 120, wordCount: null, words: [], text: sentences.hard.slice(0, 5).join(" ") },
      { id: 5, number: 5, name: "Expert Sprint", description: "Academic and legal language at high speed", targetWpm: 70, targetAccuracy: 95, duration: 120, wordCount: null, words: [], text: sentences.hard.join(" ") },
    ],
  },
  {
    id: "code-rain",
    name: "Code Rain",
    description: "Type programming keywords and code snippets. Perfect for developers who want to code faster.",
    category: "game",
    icon: "💻",
    difficulty: "intermediate",
    levels: [
      { id: 1, number: 1, name: "Keywords", description: "Common programming keywords and terms", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 25, words: codeWords.slice(0, 30) },
      { id: 2, number: 2, name: "Variables & Types", description: "Data types and variable names", targetWpm: 40, targetAccuracy: 89, duration: 60, wordCount: 30, words: codeWords.slice(0, 50) },
      { id: 3, number: 3, name: "Snippets", description: "Short code expressions and statements", targetWpm: 35, targetAccuracy: 90, duration: 90, wordCount: null, words: [], text: codeSnippets.slice(0, 5).join(". ") },
      { id: 4, number: 4, name: "Full Statements", description: "Complete code lines and expressions", targetWpm: 45, targetAccuracy: 90, duration: 90, wordCount: null, words: [], text: codeSnippets.slice(0, 8).join(" ") },
      { id: 5, number: 5, name: "Expert Dev", description: "All code types at maximum difficulty", targetWpm: 55, targetAccuracy: 92, duration: 90, wordCount: null, words: [], text: codeSnippets.join(" ") },
    ],
  },
  {
    id: "govt-exam-prep",
    name: "Govt Exam Prep",
    description: "Master vocabulary from UPSC, SSC, RRB, and Banking exams. Type your way to success.",
    category: "game",
    icon: "🏛️",
    difficulty: "advanced",
    levels: [
      { id: 1, number: 1, name: "Basic Terms", description: "Common government exam vocabulary", targetWpm: 25, targetAccuracy: 85, duration: 90, wordCount: 30, words: govtExamWords.slice(0, 30) },
      { id: 2, number: 2, name: "Constitutional Terms", description: "Indian constitution and governance", targetWpm: 35, targetAccuracy: 87, duration: 90, wordCount: 35, words: govtExamWords.slice(0, 50) },
      { id: 3, number: 3, name: "Economics & Banking", description: "Financial terms for banking exams", targetWpm: 40, targetAccuracy: 88, duration: 90, wordCount: 40, words: govtExamWords.slice(30, 80) },
      { id: 4, number: 4, name: "International Relations", description: "Diplomatic and foreign policy terms", targetWpm: 45, targetAccuracy: 90, duration: 90, wordCount: 45, words: govtExamWords.slice(40, 90) },
      { id: 5, number: 5, name: "Full Exam Mode", description: "Complete government exam vocabulary", targetWpm: 55, targetAccuracy: 92, duration: 90, wordCount: 50, words: govtExamWords },
    ],
  },
  {
    id: "car-racer",
    name: "Car Racer",
    description: "Your typing speed IS your car speed. Type fast to win the race against AI opponents.",
    category: "game",
    icon: "🚗",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Practice Circuit", description: "Easy track, slow competitors", targetWpm: 20, targetAccuracy: 80, duration: 120, wordCount: null, words: [], text: sentences.easy.slice(0, 3).join(" ") },
      { id: 2, number: 2, name: "City Sprint", description: "Medium difficulty, medium speed rivals", targetWpm: 35, targetAccuracy: 85, duration: 120, wordCount: null, words: [], text: sentences.easy.join(" ") },
      { id: 3, number: 3, name: "Highway Race", description: "Fast track, tough competitors", targetWpm: 45, targetAccuracy: 87, duration: 120, wordCount: null, words: [], text: sentences.medium.slice(0, 5).join(" ") },
      { id: 4, number: 4, name: "Championship", description: "Elite racers, long track", targetWpm: 55, targetAccuracy: 90, duration: 120, wordCount: null, words: [], text: sentences.medium.join(" ") },
      { id: 5, number: 5, name: "Grand Prix", description: "Maximum speed, ultimate challenge", targetWpm: 70, targetAccuracy: 92, duration: 120, wordCount: null, words: [], text: sentences.hard.slice(0, 5).join(" ") },
    ],
  },
  {
    id: "zombie-siege",
    name: "Zombie Siege",
    description: "Words appear above approaching zombies. Type them to eliminate the horde before they reach you.",
    category: "game",
    icon: "🧟",
    difficulty: "intermediate",
    levels: [
      { id: 1, number: 1, name: "Day One", description: "Slow zombies, easy words, 3 lives", targetWpm: 20, targetAccuracy: 80, duration: 120, wordCount: 20, words: easyWords.slice(0, 40) },
      { id: 2, number: 2, name: "Night Falls", description: "Faster zombies, medium words", targetWpm: 30, targetAccuracy: 83, duration: 120, wordCount: 25, words: mediumWords.slice(0, 40) },
      { id: 3, number: 3, name: "Horde Mode", description: "Multiple zombies at once", targetWpm: 40, targetAccuracy: 85, duration: 120, wordCount: 30, words: mediumWords },
      { id: 4, number: 4, name: "Boss Wave", description: "Boss zombies with long words", targetWpm: 50, targetAccuracy: 87, duration: 120, wordCount: 35, words: hardWords.slice(0, 30) },
      { id: 5, number: 5, name: "Apocalypse", description: "Endless waves, maximum difficulty", targetWpm: 60, targetAccuracy: 90, duration: 120, wordCount: 40, words: hardWords },
    ],
  },
  {
    id: "letter-blaster",
    name: "Letter Blaster",
    description: "Single letters pop up at random. Hit the right key to blast them. Great for reaction and accuracy.",
    category: "game",
    icon: "🎯",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Home Row", description: "Only A S D F J K L keys", targetWpm: 0, targetAccuracy: 80, duration: 60, wordCount: null, words: ["a","s","d","f","j","k","l","a","s","d","f","j","k","l","a","s","d","f","g","h"] },
      { id: 2, number: 2, name: "Top Row", description: "Q W E R T Y U I O P keys", targetWpm: 0, targetAccuracy: 82, duration: 60, wordCount: null, words: ["q","w","e","r","t","y","u","i","o","p","q","w","e","r","t","y","u","i","o","p"] },
      { id: 3, number: 3, name: "All Letters", description: "Full alphabet, random order", targetWpm: 0, targetAccuracy: 85, duration: 60, wordCount: null, words: "abcdefghijklmnopqrstuvwxyz".split("").flatMap(l => [l,l,l]) },
      { id: 4, number: 4, name: "With Numbers", description: "Letters and numbers combined", targetWpm: 0, targetAccuracy: 87, duration: 60, wordCount: null, words: "abcdefghij0123456789klmnop".split("").flatMap(l => [l,l]) },
      { id: 5, number: 5, name: "Speed Demon", description: "Fast, all characters, max accuracy required", targetWpm: 0, targetAccuracy: 90, duration: 60, wordCount: null, words: "abcdefghijklmnopqrstuvwxyz0123456789".split("").flatMap(l => [l,l]) },
    ],
  },
  {
    id: "speed-test",
    name: "Speed Test",
    description: "Professional timed typing tests. 30, 60, or 120 second modes with detailed analytics.",
    category: "professional",
    icon: "⏱️",
    difficulty: "intermediate",
    levels: [
      { id: 1, number: 1, name: "30 Second Test", description: "Quick burst typing assessment", targetWpm: 30, targetAccuracy: 85, duration: 30, wordCount: null, words: [], text: mediumWords.slice(0, 60).join(" ") },
      { id: 2, number: 2, name: "60 Second Test", description: "Standard WPM benchmark", targetWpm: 40, targetAccuracy: 87, duration: 60, wordCount: null, words: [], text: mediumWords.join(" ") },
      { id: 3, number: 3, name: "120 Second Test", description: "Endurance and consistency test", targetWpm: 45, targetAccuracy: 89, duration: 120, wordCount: null, words: [], text: [...mediumWords, ...mediumWords].join(" ") },
      { id: 4, number: 4, name: "Advanced 60s", description: "Harder words, strict accuracy", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: null, words: [], text: hardWords.join(" ") },
      { id: 5, number: 5, name: "Pro Benchmark", description: "Elite typing challenge", targetWpm: 70, targetAccuracy: 95, duration: 60, wordCount: null, words: [], text: sentences.hard.join(" ") },
    ],
  },
];

export function getGame(gameId: string): GameDefinition | undefined {
  return GAMES.find(g => g.id === gameId);
}

export function getLevel(gameId: string, levelId: number): GameLevel | undefined {
  const game = getGame(gameId);
  return game?.levels.find(l => l.id === levelId);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
