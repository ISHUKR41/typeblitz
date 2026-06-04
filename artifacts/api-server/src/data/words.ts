// ─────────────────────────────────────────────────────────────────────────────
// Word & content database for all TypeBlitz games
// Covers: Common English, Government Exam vocabulary (SSC/UPSC/Banking/Railways),
// and Programming / Coding vocabulary
// ─────────────────────────────────────────────────────────────────────────────

export const wordLists: Record<string, string[][]> = {
  // ═══════════════════════════════════════════════════════════════
  // WORD SPRINT — Progressive English vocabulary
  // ═══════════════════════════════════════════════════════════════
  "word-sprint": [
    // Level 1 — Beginner (3-4 letter simple words)
    ["the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use", "aim", "act", "age", "ask", "due", "end", "few", "key", "law", "pay", "run", "set", "top", "try", "win"],
    // Level 2 — Easy (4-6 letter common words)
    ["about", "after", "again", "could", "every", "first", "found", "great", "hands", "heard", "house", "large", "learn", "level", "light", "might", "never", "often", "other", "place", "point", "power", "right", "shall", "small", "sound", "still", "think", "three", "under", "water", "where", "which", "while", "world", "would", "write", "years", "clear", "drive", "found", "grade", "human", "judge", "local", "money", "north", "order", "plant", "quite", "reach", "state", "trade", "value"],
    // Level 3 — Intermediate (common + govt vocabulary)
    ["action", "always", "amount", "annual", "appeal", "around", "before", "behalf", "budget", "bureau", "census", "charge", "circle", "clause", "create", "decree", "deputy", "direct", "domain", "during", "employ", "ensure", "estate", "except", "formal", "future", "govern", "happen", "import", "income", "inland", "intent", "island", "issued", "justice", "labour", "launch", "leader", "listen", "master", "merger", "method", "motion", "nation", "notice", "object", "office", "permit", "policy", "portal", "public", "record", "relief", "report", "result", "review", "scheme", "sector", "simple", "single", "social", "source", "status", "survey", "system", "taking", "tenure", "toward", "travel", "treaty", "trying", "turned", "update", "vision", "welfare"],
    // Level 4 — Advanced (govt exam & professional words)
    ["accountability", "achievement", "acquisition", "administration", "amendment", "applicant", "appointment", "assembly", "assessment", "authority", "benchmark", "candidate", "capability", "commission", "committee", "compliance", "compulsory", "constituency", "corporation", "credential", "cumulative", "department", "designation", "detention", "directory", "discharge", "disclosure", "document", "domicile", "electoral", "eligible", "empanelled", "empowered", "encumbrance", "enforcement", "enterprise", "enumerate", "essential", "exemption", "expedition", "extension", "facilitate", "financial", "franchise", "government", "grievance", "guarantee", "guideline", "hierarchy", "immediate", "implement", "inaugural", "incentive", "incumbent", "inspector", "integrity", "judiciary", "knowledge", "legislation", "legitimate", "liability", "licensing", "magistrate", "mandatory", "mechanism", "memorandum", "municipal", "nominated", "objection", "occupancy", "ordinance", "oversight", "ownership", "parliament", "pensioner", "personnel", "precedent", "principal", "privilege", "procedure", "promotion", "provision", "publicity", "quarterly", "recipient", "recommend", "recruitment", "regulation", "resolution", "retirement", "sanction", "secretary", "selection", "sovereign", "statutory", "subsequent", "subsidiary", "succession", "supersede", "supervisory", "temporary", "testimony", "trademark", "tribunal", "unanimous", "undertaking", "vacancy", "valuation", "violation", "withdrawal"],
    // Level 5 — Expert (technical, UPSC-level, coding vocabulary)
    ["accountability", "adjudication", "administrative", "affidavit", "algorithm", "allocation", "ambiguous", "applicability", "appropriation", "arbitration", "authentication", "authorization", "bifurcation", "bureaucratic", "calibration", "categorization", "centralization", "circumvention", "classification", "codification", "collaboration", "commandant", "commencement", "commissioner", "communication", "compensation", "competency", "compilation", "computation", "concatenation", "conciliation", "confidentiality", "configuration", "consolidation", "constitutional", "contemplation", "contingency", "coordination", "corroboration", "counterproductive", "declaration", "decomposition", "decentralization", "deliberation", "demographic", "denomination", "depreciation", "derivative", "determination", "digitization", "disbursement", "documentation", "encapsulation", "enumeration", "equivalence", "establishment", "expropriation", "facilitation", "falsification", "formalization", "functionality", "geopolitical", "globalization", "gubernatorial", "hierarchical", "humanitarian", "hypothetically", "identification", "immovable", "impersonation", "implementation", "inconsistency", "infrastructure", "inheritance", "initialization", "integration", "interrogation", "investigation", "jurisdiction", "justification", "legitimately", "liberalization", "manifestation", "methodology", "misappropriation", "mobilization", "modernization", "nationalization", "normalization", "notification", "parliamentary", "participation", "perpetration", "placeholder", "privatization", "proliferation", "proportional", "proportionate", "prosecution", "rationalization", "reconciliation", "rectification", "redistribution", "reimbursement", "reintegration", "remuneration", "representation", "restructuring", "revalidation", "standardization", "subordination", "substantiation", "superintendent", "supplementary", "transportation", "unambiguous", "unconstitutional", "underutilization", "validation", "verification", "vulnerability"]
  ],

  // ═══════════════════════════════════════════════════════════════
  // GOVT EXAM SPRINT — SSC / UPSC / Banking / Railways vocabulary
  // ═══════════════════════════════════════════════════════════════
  "govt-exam-sprint": [
    // Level 1 — Basic government terms
    ["act", "bill", "law", "vote", "fund", "levy", "bond", "cash", "debt", "duty", "earn", "edit", "exam", "fact", "file", "form", "free", "gain", "give", "head", "hold", "item", "join", "keep", "land", "link", "loan", "loss", "note", "open", "pass", "plan", "post", "rank", "rate", "role", "rule", "seal", "send", "sign", "site", "slip", "sort", "suit", "term", "text", "time", "type", "unit", "visa"],
    // Level 2 — Common administrative terms
    ["abide", "accrue", "admit", "agent", "allot", "annex", "apply", "audit", "bench", "bribe", "bylaw", "cadre", "claim", "clerk", "court", "dated", "debar", "defer", "depot", "draft", "elect", "entry", "error", "evade", "exact", "field", "files", "final", "fixed", "forum", "fraud", "funds", "grace", "grade", "grant", "guard", "guilty", "heads", "hence", "honor", "index", "infer", "issue", "judge", "junta", "legal", "lodge", "marks", "merit", "minor", "modus", "named", "nodal", "notary", "panel", "party", "payee", "peace", "peons", "pilot", "plead", "power", "press", "prime", "prior", "probe", "purse", "query", "quota", "raise", "ranks", "ratio", "reach", "refer", "remit", "repay", "reply", "roles", "royal", "rules", "score", "scrutiny", "serve", "state", "steel", "steps", "stock", "study", "taxes", "terms", "title", "token", "tally", "typed", "union", "until", "upper", "upset", "urban", "usage", "valid", "value", "voter", "wages", "waive", "works", "write", "zones"],
    // Level 3 — SSC CGL / Banking level terms
    ["abeyance", "absolute", "abstract", "accused", "accrual", "acquit", "adherence", "adjunct", "adoption", "adverse", "advisory", "aggrieve", "allocate", "ambiguity", "amortize", "analogy", "annexure", "apostille", "arbitrate", "archives", "arrear", "articulate", "ascertain", "assemble", "assessee", "assurance", "attestation", "auditor", "autonomy", "awarded", "balance", "banking", "baseline", "bonafide", "bounty", "cabinet", "cadre", "canvass", "capital", "caption", "cardinal", "central", "century", "certified", "charity", "charter", "citizen", "civilian", "cognizable", "collect", "communal", "compound", "consent", "consular", "contempt", "contract", "convene", "council", "criminal", "custody", "customs", "decision", "deficit", "delegate", "denote", "deposit", "describe", "deviate", "dialogue", "director", "dispute", "district", "dividend", "domicile", "drawback", "durable", "economic", "election", "eligible", "embezzle", "emission", "enacted", "equitable", "evaluate", "evidence", "examiner", "exchequer", "exclude", "execute", "execute", "exempted", "exhibit", "expedite", "expunge", "extended", "external", "facility", "fiduciary", "finance", "forfeiture", "gazette", "general", "governor", "grievance", "habitual", "heritage", "honorary", "impeach", "imposed", "incident", "insolvent", "internal", "judicial", "judicature", "tribunal"],
    // Level 4 — UPSC / High-level competitive exam vocabulary
    ["abrogation", "absolutism", "acclamation", "adjudication", "affirmative", "agrarianism", "alienation", "allegiance", "allocation", "amentment", "antecedent", "apparatchik", "approbation", "appropriation", "arbitration", "aristocracy", "arraignment", "assemblage", "assimilation", "attestation", "bicameral", "bureaucracy", "capitulation", "centralization", "certification", "circumvention", "civil disobedience", "codification", "collective", "colonialism", "commissioner", "commutation", "competency", "compliance", "compulsory", "conciliation", "confederation", "consignment", "constitutional", "contingency", "conviction", "corporatism", "councillor", "counterpart", "cumulative", "debenture", "decentralization", "defamation", "deferment", "deliberate", "democracy", "deportation", "derogation", "designation", "detainee", "devolution", "directive", "dissolution", "distribution", "domiciliary", "electorate", "emoluments", "encumbrance", "enforcement", "entitlement", "enumeration", "equalization", "expeditious", "expropriation", "extradition", "facilitation", "federalism", "forfeiture", "formulation", "fundamental", "governance", "gubernatorial", "humanitarian", "hypothecation", "impartially", "incarceration", "indemnification", "indemnity", "indigent", "inquisition", "insolvency", "interjection", "intimidation", "irreversible", "jurisdiction", "justiciable", "legislative", "legitimacy", "liberalization", "litigation", "magistracy", "maladministration", "mandatory", "meritocracy", "misappropriation", "mobilization", "nationalization", "ombudsman", "ordinance", "oversight", "plenipotentiary", "pluralism", "prerogative", "proclamation", "prohibition", "promulgation", "proportional", "provisional", "ratification", "reimbursement", "remonstration", "repatriation", "representation", "requisition", "retrospective", "separation", "sovereignty", "statutory", "superintendent", "supersession", "supplementary", "taxation", "testimony", "transparency", "unanimity", "unconstitutional", "undertaking", "unilateral", "usurpation", "valedictory", "verification", "vicarious", "victimization", "vigilance", "violation", "waiver", "warrant"],
    // Level 5 — IAS/IPS/IFS Level — Advanced polity & economics
    ["abrogation", "accountability", "adjudicative", "administrative", "adversarial", "affirmative action", "alienability", "annihilation", "antidisestablishmentarianism", "appropriateness", "argumentation", "assimilation", "authentication", "benchmarking", "bicameralism", "bureaucratization", "centralization", "circumscription", "collectivization", "commissioning", "communicability", "compensatory discrimination", "compulsory acquisition", "conciliationism", "confidentiality", "constitutionalism", "contemporaneous", "contractualism", "counterbalancing", "decentralization", "democratization", "denominational", "depoliticization", "deregulation", "developmental", "devolutionary", "disenfranchisement", "disinvestment", "distributive justice", "documentation", "egalitarianism", "emancipatory", "empowerment", "encroachment", "establishment", "exceptionalism", "expropriation", "extraterritoriality", "federalization", "fragmentation", "fundamental rights", "gerrymandering", "globalization", "gubernatorial", "homogenization", "humanitarian law", "hypothecation", "identification", "impersonation", "implementation", "incontrovertible", "independence", "indeterminate", "individualism", "institutionalization", "instrumentalism", "insurrection", "interdepartmental", "intergovernmental", "interpretation", "intragovernmental", "irrevocability", "justiciability", "liberalization", "majoritarianism", "manifestation", "marginalization", "meritocracy", "mobilization", "modernization", "multipartitism", "nationalization", "nongovernmental", "normalization", "obstructionism", "ombudsmanship", "ordinance", "paternalism", "pluralization", "politicization", "postcolonialism", "privatization", "proportionality", "provisional", "ratification", "reapportionment", "reintegration", "representational", "restructuring", "retrospectivity", "secularization", "separation of powers", "sovereignty", "standardization", "subordination", "substantiation", "supremacy", "transformative", "transparency", "tribunalization", "unilateralism", "universalization", "victimization", "vulnerability", "whistleblowing"]
  ],

  // ═══════════════════════════════════════════════════════════════
  // CODE VOCAB — Programming terminology typing practice
  // ═══════════════════════════════════════════════════════════════
  "code-vocab": [
    // Level 1 — Basic programming keywords
    ["int", "var", "let", "for", "if", "do", "new", "try", "get", "set", "map", "key", "val", "ref", "obj", "arr", "str", "num", "any", "nil", "null", "void", "true", "bool", "else", "from", "type", "base", "bind", "call", "cast", "char", "copy", "data", "date", "emit", "enum", "eval", "exit", "find", "flag", "func", "goto", "hash", "heap", "hook", "init", "iter", "json", "list", "load", "lock", "loop", "meta", "mode", "move", "next", "node", "open", "path", "pipe", "pool", "port", "prop", "push", "read", "rest", "root", "safe", "save", "scan", "send", "size", "skip", "slot", "sort", "span", "spec", "swap", "sync", "task", "test", "then", "this", "tick", "tree", "trim", "unit", "uses", "wait", "wrap", "yaml", "zero"],
    // Level 2 — Common programming terms
    ["array", "async", "await", "break", "cache", "catch", "class", "clone", "close", "const", "count", "debug", "defer", "delta", "event", "every", "false", "fetch", "final", "first", "float", "frame", "index", "input", "inner", "inode", "joins", "layer", "match", "merge", "model", "mount", "mutex", "never", "order", "outer", "panic", "parse", "patch", "pixel", "proxy", "query", "queue", "range", "ratio", "regex", "reset", "retry", "route", "rules", "scope", "slice", "stack", "state", "store", "style", "super", "table", "throw", "token", "trace", "tuple", "typed", "union", "valid", "value", "watch", "where", "while", "write", "yield"],
    // Level 3 — Developer vocabulary
    ["abstract", "adapter", "algorithm", "argument", "backend", "boolean", "callback", "channel", "closure", "cluster", "codegen", "compile", "connect", "context", "contract", "control", "declare", "default", "defined", "delete", "deploy", "derived", "element", "execute", "extends", "extract", "factory", "feature", "flatten", "foreach", "format", "frontend", "function", "generic", "handler", "hashmap", "headers", "hosting", "imports", "include", "inherit", "install", "integer", "iterate", "joining", "library", "literal", "logging", "mapping", "message", "methods", "migrate", "missing", "modules", "network", "nothing", "nullable", "objects", "operate", "package", "payload", "pointer", "process", "promise", "provide", "publish", "purpose", "reduces", "refresh", "release", "renders", "replace", "request", "resolve", "returns", "runtime", "schemas", "semver", "service", "session", "setting", "signals", "sorting", "streams", "string", "struct", "testing", "timeout", "trigger", "typedef", "updates", "utility", "version", "virtual", "without", "wrapper"],
    // Level 4 — Advanced software engineering terms
    ["abstraction", "accumulate", "algorithm", "allocation", "annotation", "antipattern", "assertion", "asynchronous", "atomicity", "authentication", "authorization", "benchmarking", "bootstrapping", "breadcrumb", "bytecode", "codebase", "cohesion", "compilation", "complexity", "composition", "concurrency", "constructor", "convention", "coroutine", "datastore", "deadlock", "decorator", "dependency", "deprecated", "deserialization", "determinism", "dispatcher", "encapsulation", "environment", "expression", "extensible", "filesystem", "formatting", "framework", "functional", "generics", "granularity", "hardcoded", "idempotent", "immutable", "inheritance", "initialize", "integration", "interface", "introspect", "invariant", "iteration", "lazy loading", "lifecycle", "linting", "marshaling", "middleware", "migration", "modularity", "multithread", "namespace", "obfuscation", "observable", "optimistic", "orchestrate", "pagination", "parameter", "persistent", "polymorphism", "predicate", "primitive", "profiling", "propagation", "prototype", "recursion", "refactoring", "replication", "repository", "resilience", "responsive", "routing", "sanitization", "scaffolding", "serialization", "side effects", "singleton", "stateless", "streaming", "structured", "templating", "throttling", "transient", "transpiler", "traversal", "typescript", "undefined", "validation", "versioning", "virtualization", "websocket"],
    // Level 5 — Expert CS / Architecture / DevOps terms
    ["accessibility", "agile methodology", "architectural pattern", "asynchronous messaging", "blue-green deployment", "canary release", "circuit breaker pattern", "code coupling", "cognitive complexity", "command query separation", "compositional API", "continuous delivery", "continuous integration", "declarative programming", "dependency injection", "distributed systems", "domain driven design", "dynamic dispatch", "eventual consistency", "event sourcing", "feature flagging", "finite state machine", "functional programming", "garbage collection", "horizontal scaling", "idempotency guarantee", "immutable infrastructure", "imperative programming", "inversion of control", "lazy evaluation", "load balancing", "memoization technique", "message queueing", "microservices architecture", "monadic composition", "monorepo structure", "observer pattern", "optimistic locking", "pessimistic concurrency", "polymorphic dispatch", "reactive programming", "repository pattern", "service locator antipattern", "service mesh architecture", "sharding strategy", "singleton antipattern", "strangler fig pattern", "tail call optimization", "twelve factor application", "type inference engine", "vertical scaling limits", "zero downtime deployment"]
  ],

  // ═══════════════════════════════════════════════════════════════
  // SENTENCE RUSH — Sentences from easy to expert
  // ═══════════════════════════════════════════════════════════════
  "sentence-rush": [
    // Level 1 — Simple sentences
    [
      "The cat sat on the mat.",
      "She opened the door slowly.",
      "He ran fast today.",
      "The sun is bright and warm.",
      "I love to read books every day.",
      "The dog barked at the stranger.",
      "She ate the red apple.",
      "He went to the market.",
      "The bird sang a sweet song.",
      "We played cricket in the park.",
      "The train arrived at the station.",
      "She submitted the form online.",
      "He passed the entrance exam.",
      "The office opens at nine.",
      "I need to renew my licence."
    ],
    // Level 2 — Compound sentences with govt/everyday context
    [
      "The candidate submitted all required documents before the deadline.",
      "She passed the written test and qualified for the interview round.",
      "He applied for the government job, but the vacancy was already filled.",
      "The district magistrate reviewed the complaint and ordered an inquiry.",
      "They studied all night and finally cleared the competitive exam.",
      "The bank sanctioned the loan after verifying all the credentials.",
      "She received the appointment letter and joined the department.",
      "The railway reservation counter closes at midnight every day.",
      "He filed the income tax return before the due date this year.",
      "The principal secretary issued a circular to all departmental heads.",
      "The recruitment board announced the results on its official portal.",
      "She requested a transfer to her home district citing personal reasons."
    ],
    // Level 3 — Govt exam style paragraphs
    [
      "The Constitution of India came into force on 26 January 1950, replacing the Government of India Act as the governing document of the nation. It established India as a sovereign, socialist, secular, democratic republic.",
      "The Union Public Service Commission conducts examinations for recruitment to the All India Services and Central Services. Candidates must qualify through multiple stages including a preliminary test, a main examination, and a personality test.",
      "The Right to Information Act of 2005 empowers citizens to request information from public authorities. It promotes transparency and accountability in the working of every public authority under the Government of India.",
      "The Comptroller and Auditor General of India audits the receipts and expenditure of the Union and State governments. This constitutional authority ensures that public money is spent in accordance with the law.",
      "Panchayati Raj institutions form the backbone of rural local governance in India. The 73rd Constitutional Amendment granted constitutional status to these bodies and mandated elections every five years."
    ],
    // Level 4 — Technical and professional prose
    [
      "The implementation of a robust continuous integration pipeline requires careful consideration of build artifacts, testing strategies, and deployment workflows to ensure zero-downtime releases.",
      "Database normalization is the process of organizing relational data to eliminate redundancy and improve integrity by systematically applying a series of formal rules known as normal forms.",
      "Microservices architecture decomposes a monolithic application into small, independently deployable services that communicate via well-defined APIs, enabling teams to scale and iterate autonomously.",
      "The agile methodology emphasizes iterative development cycles, cross-functional collaboration, and the continuous delivery of working software increments in response to changing business requirements.",
      "Blockchain technology enables distributed ledger systems where transactions are immutably recorded across a peer-to-peer network, eliminating the need for a central trusted authority to validate entries."
    ],
    // Level 5 — Advanced literature and expert writing
    [
      "It was the best of times, it was the worst of times; it was the age of wisdom, it was the age of foolishness — an epoch of belief and an epoch of incredulity, a season of Light and a season of Darkness.",
      "The universe is under no obligation to make sense to you, yet the relentlessly curious human mind persists in seeking patterns, causality, and meaning from the beautiful chaos of observable existence.",
      "Programming is the art of instructing a machine to perform tasks that the human mind devised — a discipline demanding both the precision of a mathematician and the creative intuition of an architect.",
      "Good governance requires not merely the formulation of sound policies but their faithful implementation, consistent monitoring, transparent reporting, and the political will to hold every stakeholder accountable.",
      "The measure of a civilization is not the grandeur of its monuments but the justice of its institutions, the equity of its laws, and the dignity it affords to the least privileged among its people."
    ]
  ],

  // ═══════════════════════════════════════════════════════════════
  // CODE TYPE — Real code snippets to type out
  // ═══════════════════════════════════════════════════════════════
  "code-type": [
    // Level 1 — Basic variable declarations
    [
      "const name = 'TypeBlitz';",
      "let score = 0;",
      "const isActive = true;",
      "let count = 42;",
      "const pi = 3.14159;",
      "let items = [];",
      "const user = null;",
      "let message = 'Hello, World!';",
      "const MAX_LEVEL = 5;",
      "let isPlaying = false;",
      "const BASE_URL = '/api';",
      "let retries = 3;",
      "const VERSION = '2.0.0';",
      "let isLoading = true;",
      "const TIMEOUT_MS = 5000;"
    ],
    // Level 2 — Functions
    [
      "function calculateWpm(chars, seconds) {\n  return Math.round((chars / 5 / seconds) * 60);\n}",
      "const greet = (name) => `Hello, ${name}!`;",
      "function isValidEmail(email) {\n  return email.includes('@') && email.includes('.');\n}",
      "const clamp = (value, min, max) => Math.min(Math.max(value, min), max);",
      "function shuffle(array) {\n  return array.sort(() => Math.random() - 0.5);\n}",
      "const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};",
      "function formatTime(seconds) {\n  const m = Math.floor(seconds / 60);\n  const s = seconds % 60;\n  return `${m}:${s.toString().padStart(2, '0')}`;\n}"
    ],
    // Level 3 — Classes and interfaces
    [
      "class Player {\n  constructor(name, level = 1) {\n    this.name = name;\n    this.level = level;\n    this.score = 0;\n    this.accuracy = 100;\n  }\n  levelUp() {\n    this.level += 1;\n  }\n}",
      "interface UserStats {\n  userId: string;\n  username: string;\n  averageWpm: number;\n  bestWpm: number;\n  totalSessions: number;\n  accuracy: number;\n  streak: number;\n}",
      "class EventEmitter {\n  private listeners = new Map();\n  on(event, fn) {\n    if (!this.listeners.has(event))\n      this.listeners.set(event, []);\n    this.listeners.get(event).push(fn);\n  }\n  emit(event, data) {\n    this.listeners.get(event)?.forEach(fn => fn(data));\n  }\n}"
    ],
    // Level 4 — Algorithms
    [
      "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    arr[mid] < target ? left = mid + 1 : right = mid - 1;\n  }\n  return -1;\n}",
      "function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(a, b) {\n  const result = [];\n  while (a.length && b.length)\n    result.push(a[0] <= b[0] ? a.shift() : b.shift());\n  return [...result, ...a, ...b];\n}",
      "function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}"
    ],
    // Level 5 — Production-grade TypeScript
    [
      "async function fetchWithRetry<T>(\n  url: string,\n  options: RequestInit = {},\n  retries = 3\n): Promise<T> {\n  for (let attempt = 0; attempt < retries; attempt++) {\n    try {\n      const res = await fetch(url, options);\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      return res.json() as T;\n    } catch (err) {\n      if (attempt === retries - 1) throw err;\n      await new Promise(r => setTimeout(r, 2 ** attempt * 100));\n    }\n  }\n  throw new Error('Unreachable');\n}",
      "const useTypingGame = (words: string[]) => {\n  const [index, setIndex] = useState(0);\n  const [typed, setTyped] = useState('');\n  const [errors, setErrors] = useState(0);\n  const [startTime, setStartTime] = useState<number | null>(null);\n  const wpm = useMemo(() => {\n    if (!startTime) return 0;\n    const mins = (Date.now() - startTime) / 60000;\n    return Math.round((typed.length / 5) / mins);\n  }, [typed, startTime]);\n  return { index, typed, errors, wpm, setTyped, setErrors, setStartTime };\n};"
    ]
  ],

  // ═══════════════════════════════════════════════════════════════
  // LETTER BLASTER — Key-group drills
  // ═══════════════════════════════════════════════════════════════
  "letter-blaster": [
    // Level 1 — Home row only (asdfghjkl;)
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "as", "sd", "df", "fg", "gh", "hj", "jk", "kl", "asd", "sdf", "dfg", "fgh", "ghj", "hjk", "jkl", "asdf", "hjkl", "fdsa", "lkjh", "gfds", "hjkl"],
    // Level 2 — Top row (qwertyuiop)
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "qw", "we", "er", "rt", "ty", "yu", "ui", "io", "op", "qwe", "wer", "ert", "rty", "tyu", "yui", "uio", "iop", "qwer", "wert", "erty", "rtyuiop"],
    // Level 3 — All alpha + common bigrams
    ["ab", "cd", "ef", "gh", "ij", "kl", "mn", "op", "qr", "st", "uv", "wx", "yz", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu", "vwx", "xyz", "abcd", "efgh", "ijkl", "mnop", "qrst", "uvwx"],
    // Level 4 — Capitals (Shift practice)
    ["The", "And", "For", "Are", "But", "Not", "You", "All", "Can", "Has", "His", "How", "New", "Now", "Old", "See", "Two", "Way", "Who", "Did", "Let", "Put", "Say", "She", "Act", "Law", "Pay", "Run", "Set", "Top", "Try", "Win", "God", "Sir", "Mr", "Ms", "Dr", "Ltd", "Inc"],
    // Level 5 — Symbols, numbers, special chars
    ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j0", "key!", "fun@", "win#", "top$", "ace%", "hit^", "run&", "fly*", "zap(", "max)", "set+", "go=", "var{}", "arr[]", "fn()", "x=>y", "!==", "===", "&&", "||", "?."]
  ],

  // ═══════════════════════════════════════════════════════════════
  // TYPING RACE — Race passages of increasing complexity
  // ═══════════════════════════════════════════════════════════════
  "typing-race": [
    // Level 1 — Easy warmup
    ["The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How quickly daft jumping zebras vex!"],
    // Level 2 — Government context
    ["In India, competitive examinations are held by bodies such as the Union Public Service Commission and the Staff Selection Commission. Candidates must demonstrate proficiency in general awareness, reasoning, and English language skills."],
    // Level 3 — Technical/CS
    ["The fundamental theorem of software engineering states that any problem can be solved by adding a layer of indirection. This principle underlies much of modern architecture, from object-oriented patterns to serverless microservices."],
    // Level 4 — Advanced
    ["Asynchronous programming has become indispensable in modern web development. Promises, async-await syntax, and event-driven architectures allow developers to write non-blocking code that handles concurrent operations with clarity and efficiency."],
    // Level 5 — Expert
    ["The philosophy of test-driven development asserts that writing tests before implementation leads to superior software design. By defining expected behavior upfront through executable specifications, developers build a safety net that enables confident refactoring, promotes loosely coupled modular architecture, and ultimately accelerates delivery without sacrificing correctness."]
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Get the word/content list for a given game + level
// ─────────────────────────────────────────────────────────────────────────────
export const getWordsForLevel = (gameId: string, level: number): string[] => {
  const gameLists = wordLists[gameId];
  if (!gameLists) return wordLists["word-sprint"][0];
  const levelIndex = Math.min(level - 1, gameLists.length - 1);
  return gameLists[levelIndex];
};
