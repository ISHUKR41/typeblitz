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
  {
    id: "word-sprint",
    name: "Word Sprint",
    description: "Type words as fast as you can before they disappear. Race against time and build your vocabulary.",
    category: "game",
    icon: "Zap",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Warm Up", description: "Short, simple words to get you started.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 2, number: 2, name: "Pick Up the Pace", description: "Common English words at a faster clip.", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 30 },
      { id: 3, number: 3, name: "Hitting Stride", description: "Medium-length words with higher targets.", targetWpm: 40, targetAccuracy: 90, duration: 60, wordCount: 40 },
      { id: 4, number: 4, name: "Sprint Mode", description: "Longer, less common words. Keep your fingers moving.", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: 50 },
      { id: 5, number: 5, name: "Elite Speed", description: "Technical and advanced vocabulary. Prove your mastery.", targetWpm: 70, targetAccuracy: 95, duration: 60, wordCount: 60 },
    ]
  },
  {
    id: "sentence-rush",
    name: "Sentence Rush",
    description: "Type full sentences and paragraphs accurately. Context and rhythm matter here.",
    category: "game",
    icon: "AlignLeft",
    difficulty: "beginner",
    levels: [
      { id: 6, number: 1, name: "First Words", description: "Simple, short sentences to build your rhythm.", targetWpm: 25, targetAccuracy: 85, duration: null, wordCount: null },
      { id: 7, number: 2, name: "Full Sentences", description: "Compound sentences with punctuation.", targetWpm: 35, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 8, number: 3, name: "Paragraphs", description: "Multi-sentence paragraphs on various topics.", targetWpm: 45, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 9, number: 4, name: "Technical Prose", description: "Complex technical and business writing.", targetWpm: 60, targetAccuracy: 93, duration: null, wordCount: null },
      { id: 10, number: 5, name: "Literature", description: "Excerpts from classic literature and expert writing.", targetWpm: 75, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  },
  {
    id: "code-type",
    name: "Code Type",
    description: "Type real code snippets. Master brackets, semicolons, and special characters.",
    category: "game",
    icon: "Code",
    difficulty: "intermediate",
    levels: [
      { id: 11, number: 1, name: "Variables", description: "Basic variable declarations and assignments.", targetWpm: 20, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 12, number: 2, name: "Functions", description: "Function definitions with parameters and return values.", targetWpm: 30, targetAccuracy: 88, duration: null, wordCount: null },
      { id: 13, number: 3, name: "Classes", description: "Object-oriented class structures and interfaces.", targetWpm: 38, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 14, number: 4, name: "Algorithms", description: "Classic algorithms with complex logic flow.", targetWpm: 48, targetAccuracy: 92, duration: null, wordCount: null },
      { id: 15, number: 5, name: "Production Code", description: "Real-world TypeScript/JavaScript code snippets.", targetWpm: 60, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  },
  {
    id: "letter-blaster",
    name: "Letter Blaster",
    description: "Letters and combos appear on screen. Type them before they expire. Trains reaction speed.",
    category: "game",
    icon: "Target",
    difficulty: "beginner",
    levels: [
      { id: 16, number: 1, name: "Home Row", description: "Master the home row keys: ASDFGHJKL.", targetWpm: 15, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 17, number: 2, name: "Top Row", description: "Add the top row keys: QWERTYUIOP.", targetWpm: 25, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 18, number: 3, name: "All Keys", description: "All alphabetic keys combined.", targetWpm: 35, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 19, number: 4, name: "Capitals", description: "Mix of uppercase and lowercase requiring Shift.", targetWpm: 45, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 20, number: 5, name: "Symbols", description: "Numbers, symbols, and special characters.", targetWpm: 55, targetAccuracy: 88, duration: 60, wordCount: null },
    ]
  },
  {
    id: "typing-race",
    name: "Typing Race",
    description: "Race against a ghost typist. Beat the target WPM to advance. Pure speed competition.",
    category: "game",
    icon: "Timer",
    difficulty: "intermediate",
    levels: [
      { id: 21, number: 1, name: "Slow Ghost", description: "Beat a 30 WPM ghost. A comfortable warm-up.", targetWpm: 30, targetAccuracy: 85, duration: null, wordCount: null },
      { id: 22, number: 2, name: "Steady Ghost", description: "The ghost types at 45 WPM. Keep up!", targetWpm: 45, targetAccuracy: 87, duration: null, wordCount: null },
      { id: 23, number: 3, name: "Fast Ghost", description: "60 WPM ghost. You need to be consistent.", targetWpm: 60, targetAccuracy: 90, duration: null, wordCount: null },
      { id: 24, number: 4, name: "Expert Ghost", description: "80 WPM. Only skilled typists can win.", targetWpm: 80, targetAccuracy: 92, duration: null, wordCount: null },
      { id: 25, number: 5, name: "Pro Ghost", description: "100 WPM. The final boss. Are you ready?", targetWpm: 100, targetAccuracy: 95, duration: null, wordCount: null },
    ]
  }
];

export const getGame = (gameId: string): Game | undefined => GAMES.find(g => g.id === gameId);
export const getGameLevel = (gameId: string, levelNumber: number): Level | undefined => {
  const game = getGame(gameId);
  return game?.levels.find(l => l.number === levelNumber);
};
