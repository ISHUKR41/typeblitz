export interface Level {
  id: number;
  number: number;
  name: string;
  description: string;
  targetWpm: number;
  targetAccuracy: number;
  duration: number | null;
  wordCount: number | null;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  category: "game" | "professional";
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  levels: Level[];
}

export const GAMES: Game[] = [
  // ──────────────────────────────────────────────────────────────
  // STANDARD GAMES
  // ──────────────────────────────────────────────────────────────
  {
    id: "word-sprint",
    name: "Word Sprint",
    description: "Type common English words as fast as possible. Builds raw speed and muscle memory across 5 difficulty tiers.",
    category: "game",
    icon: "Zap",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Warm Up", description: "Short, simple 3–4 letter words to get your fingers moving.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 2, number: 2, name: "Pick Up the Pace", description: "Common English words, slightly longer. Build your rhythm.", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 30 },
      { id: 3, number: 3, name: "Hitting Stride", description: "Government and professional-grade vocabulary begins here.", targetWpm: 40, targetAccuracy: 90, duration: 60, wordCount: 40 },
      { id: 4, number: 4, name: "Sprint Mode", description: "Administrative and technical terms. Keep your fingers moving.", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: 50 },
      { id: 5, number: 5, name: "Elite Speed", description: "Advanced UPSC-level and programming vocabulary. Prove your mastery.", targetWpm: 70, targetAccuracy: 95, duration: 60, wordCount: 60 },
    ]
  },
  {
    id: "govt-exam-sprint",
    name: "Govt Exam Sprint",
    description: "Master vocabulary from SSC, UPSC, Banking, Railways & Police exams. Essential for government exam aspirants.",
    category: "game",
    icon: "Shield",
    difficulty: "intermediate",
    levels: [
      { id: 26, number: 1, name: "Basic Terms", description: "Fundamental government and administrative words.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 25 },
      { id: 27, number: 2, name: "Administrative", description: "Clerical and administrative office vocabulary.", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 35 },
      { id: 28, number: 3, name: "SSC CGL Level", description: "SSC CGL and banking exam standard vocabulary.", targetWpm: 40, targetAccuracy: 90, duration: 60, wordCount: 40 },
      { id: 29, number: 4, name: "UPSC Level", description: "High-level polity, governance and law vocabulary.", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: 50 },
      { id: 30, number: 5, name: "IAS Mastery", description: "Constitutional, judicial and policy-level vocabulary.", targetWpm: 65, targetAccuracy: 95, duration: 60, wordCount: 55 },
    ]
  },
  {
    id: "sentence-rush",
    name: "Sentence Rush",
    description: "Type full sentences from simple daily language to complex government exam passages and professional writing.",
    category: "game",
    icon: "AlignLeft",
    difficulty: "beginner",
    levels: [
      { id: 6, number: 1, name: "First Words", description: "Simple, short sentences to build your rhythm.", targetWpm: 25, targetAccuracy: 85, duration: null, wordCount: null },
      { id: 7, number: 2, name: "Official Sentences", description: "Government and administrative context sentences.", targetWpm: 35, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 8, number: 3, name: "Exam Paragraphs", description: "Competitive exam-style comprehension paragraphs.", targetWpm: 45, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 9, number: 4, name: "Technical Prose", description: "Complex technical and professional writing.", targetWpm: 60, targetAccuracy: 93, duration: null, wordCount: null },
      { id: 10, number: 5, name: "Expert Writing", description: "Advanced literature and expert-level passages.", targetWpm: 75, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  },
  {
    id: "code-type",
    name: "Code Type",
    description: "Type real code snippets — variables, functions, algorithms and TypeScript. Master brackets, symbols and indentation.",
    category: "game",
    icon: "Code",
    difficulty: "intermediate",
    levels: [
      { id: 11, number: 1, name: "Variables", description: "Basic variable declarations and assignments.", targetWpm: 20, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 12, number: 2, name: "Functions", description: "Function definitions with parameters and closures.", targetWpm: 30, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 13, number: 3, name: "Classes", description: "Object-oriented class structures and interfaces.", targetWpm: 38, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 14, number: 4, name: "Algorithms", description: "Classic algorithms — binary search, merge sort, memoize.", targetWpm: 48, targetAccuracy: 92, duration: null, wordCount: null },
      { id: 15, number: 5, name: "Production Code", description: "Real-world TypeScript with generics, async/await and hooks.", targetWpm: 60, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  },
  {
    id: "code-vocab",
    name: "Code Vocab",
    description: "Type programming keywords, data structures, design patterns and DevOps terms. Built for developers who want fluency.",
    category: "game",
    icon: "Terminal",
    difficulty: "intermediate",
    levels: [
      { id: 31, number: 1, name: "Keywords", description: "Basic programming keywords and primitives.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 25 },
      { id: 32, number: 2, name: "Common Terms", description: "Everyday developer vocabulary.", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 35 },
      { id: 33, number: 3, name: "Dev Vocabulary", description: "Software engineering terms and patterns.", targetWpm: 40, targetAccuracy: 90, duration: 60, wordCount: 40 },
      { id: 34, number: 4, name: "Architecture", description: "Advanced software engineering and system design terms.", targetWpm: 50, targetAccuracy: 92, duration: 60, wordCount: 45 },
      { id: 35, number: 5, name: "Expert DevOps", description: "Full-stack, distributed systems and CI/CD terminology.", targetWpm: 60, targetAccuracy: 95, duration: 60, wordCount: 50 },
    ]
  },
  {
    id: "letter-blaster",
    name: "Letter Blaster",
    description: "Letters and combos appear on screen — type them before they expire. Trains reaction speed and key location mastery.",
    category: "game",
    icon: "Target",
    difficulty: "beginner",
    levels: [
      { id: 16, number: 1, name: "Home Row", description: "Master the home row keys: ASDFGHJKL.", targetWpm: 15, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 17, number: 2, name: "Top Row", description: "Add the top row keys: QWERTYUIOP.", targetWpm: 25, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 18, number: 3, name: "All Keys", description: "All alphabetic keys in combination.", targetWpm: 35, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 19, number: 4, name: "Capitals", description: "Uppercase and lowercase requiring Shift.", targetWpm: 45, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 20, number: 5, name: "Symbols", description: "Numbers, brackets, symbols and special characters.", targetWpm: 55, targetAccuracy: 88, duration: 60, wordCount: null },
    ]
  },
  {
    id: "typing-race",
    name: "Typing Race",
    description: "Race against a ghost typist through passages of increasing complexity. Beat the target WPM to advance.",
    category: "game",
    icon: "Timer",
    difficulty: "intermediate",
    levels: [
      { id: 21, number: 1, name: "Slow Ghost", description: "Beat a 30 WPM ghost. A comfortable warm-up passage.", targetWpm: 30, targetAccuracy: 85, duration: null, wordCount: null },
      { id: 22, number: 2, name: "Steady Ghost", description: "45 WPM ghost through a government context passage.", targetWpm: 45, targetAccuracy: 87, duration: null, wordCount: null },
      { id: 23, number: 3, name: "Fast Ghost", description: "60 WPM ghost through a technical writing passage.", targetWpm: 60, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 24, number: 4, name: "Expert Ghost", description: "80 WPM. Only skilled typists can keep up.", targetWpm: 80, targetAccuracy: 92, duration: null, wordCount: null },
      { id: 25, number: 5, name: "Pro Ghost", description: "100 WPM through expert prose. The ultimate test.", targetWpm: 100, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  }
];

export const getGame = (gameId: string): Game | undefined => GAMES.find(g => g.id === gameId);
export const getGameLevel = (gameId: string, levelNumber: number): Level | undefined => {
  const game = getGame(gameId);
  return game?.levels.find(l => l.number === levelNumber);
};
