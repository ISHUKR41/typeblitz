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
    description: "Type common English words as fast as possible. Builds raw speed and muscle memory across 8 progressive levels.",
    category: "game",
    icon: "Zap",
    difficulty: "beginner",
    levels: [
      { id: 1, number: 1, name: "Warm Up", description: "Short, simple 3–4 letter words to get your fingers moving.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 2, number: 2, name: "Pick Up the Pace", description: "Common English words, slightly longer. Build your rhythm.", targetWpm: 30, targetAccuracy: 88, duration: 60, wordCount: 30 },
      { id: 3, number: 3, name: "Hitting Stride", description: "Government and professional-grade vocabulary begins here.", targetWpm: 40, targetAccuracy: 90, duration: 60, wordCount: 40 },
      { id: 4, number: 4, name: "Sprint Mode", description: "Administrative and technical terms. Keep your fingers moving.", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: 50 },
      { id: 5, number: 5, name: "Elite Speed", description: "Advanced UPSC-level and programming vocabulary. Prove your mastery.", targetWpm: 70, targetAccuracy: 95, duration: 60, wordCount: 60 },
      { id: 106, number: 6, name: "Velocity Surge", description: "Expert vocabulary at sustained high speed. No room for errors.", targetWpm: 85, targetAccuracy: 95, duration: 60, wordCount: 65 },
      { id: 107, number: 7, name: "Supersonic", description: "IAS-level complex vocabulary. Elite typists only.", targetWpm: 100, targetAccuracy: 96, duration: 60, wordCount: 70 },
      { id: 108, number: 8, name: "Transcendent", description: "Maximum difficulty. Top 1% worldwide speed with expert vocabulary.", targetWpm: 120, targetAccuracy: 97, duration: 60, wordCount: 75 },
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
      { id: 109, number: 6, name: "IPS Command", description: "Police, defence and national security vocabulary.", targetWpm: 78, targetAccuracy: 95, duration: 60, wordCount: 60 },
      { id: 110, number: 7, name: "IFS Diplomat", description: "Foreign service, international law and treaty vocabulary.", targetWpm: 92, targetAccuracy: 96, duration: 60, wordCount: 65 },
      { id: 111, number: 8, name: "Secretary-Level", description: "Cabinet secretary grade vocabulary. The pinnacle of govt mastery.", targetWpm: 108, targetAccuracy: 97, duration: 60, wordCount: 70 },
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
      { id: 112, number: 6, name: "Academic Flow", description: "Research papers and scholarly prose at high velocity.", targetWpm: 88, targetAccuracy: 95, duration: null, wordCount: null },
      { id: 113, number: 7, name: "Legal Drafting", description: "Legal and judicial documents with complex clause structures.", targetWpm: 102, targetAccuracy: 96, duration: null, wordCount: null },
      { id: 114, number: 8, name: "Master Scribe", description: "The hardest passages ever assembled. Elite typists only.", targetWpm: 118, targetAccuracy: 97, duration: null, wordCount: null },
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
      { id: 115, number: 6, name: "System Design", description: "Distributed systems, microservices and infrastructure code.", targetWpm: 72, targetAccuracy: 95, duration: null, wordCount: null },
      { id: 116, number: 7, name: "Compiler Level", description: "Parser, lexer and compiler implementation code snippets.", targetWpm: 85, targetAccuracy: 96, duration: null, wordCount: null },
      { id: 117, number: 8, name: "OS Kernel", description: "Low-level kernel, memory manager and syscall code. Peak difficulty.", targetWpm: 100, targetAccuracy: 97, duration: null, wordCount: null },
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
      { id: 118, number: 6, name: "Platform Engineering", description: "Kubernetes, Terraform, service mesh and cloud-native terms.", targetWpm: 72, targetAccuracy: 95, duration: 60, wordCount: 55 },
      { id: 119, number: 7, name: "Security Ops", description: "Cryptography, pen-testing, CVE and zero-trust vocabulary.", targetWpm: 85, targetAccuracy: 96, duration: 60, wordCount: 60 },
      { id: 120, number: 8, name: "Core Algorithms", description: "Complexity theory, graph algorithms and formal CS vocabulary.", targetWpm: 100, targetAccuracy: 97, duration: 60, wordCount: 65 },
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
      { id: 121, number: 6, name: "Combos", description: "Letter + number + symbol combos. Full keyboard mastery.", targetWpm: 65, targetAccuracy: 89, duration: 60, wordCount: null },
      { id: 122, number: 7, name: "Speed Drill", description: "Randomised full-keyboard bursts. No patterns to predict.", targetWpm: 78, targetAccuracy: 90, duration: 60, wordCount: null },
      { id: 123, number: 8, name: "Reflex Mode", description: "Maximum reaction speed. Every key, any combination, no mercy.", targetWpm: 92, targetAccuracy: 90, duration: 60, wordCount: null },
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
      { id: 124, number: 6, name: "Champion Ghost", description: "115 WPM. Ultra-dense expert passage. Nearly unbeatable.", targetWpm: 115, targetAccuracy: 95, duration: null, wordCount: null },
      { id: 125, number: 7, name: "Legend Ghost", description: "130 WPM. The ghost is a world-record holder. Can you keep up?", targetWpm: 130, targetAccuracy: 96, duration: null, wordCount: null },
      { id: 126, number: 8, name: "Immortal Ghost", description: "150 WPM ghost. Achieved by fewer than 0.01% of typists worldwide.", targetWpm: 150, targetAccuracy: 97, duration: null, wordCount: null },
    ]
  },

  // ──────────────────────────────────────────────────────────────
  // ARCADE GAMES — Visual typing games
  // ──────────────────────────────────────────────────────────────
  {
    id: "turbo-race",
    name: "Turbo Race",
    description: "Type words to accelerate your car! Race the ghost car to the finish line. Faster typing = faster car. Beat the ghost to win.",
    category: "game",
    icon: "CarFront",
    difficulty: "beginner",
    levels: [
      { id: 41, number: 1, name: "Rookie Track", description: "Short easy words. Get the feel for the road.", targetWpm: 25, targetAccuracy: 85, duration: 60, wordCount: 30 },
      { id: 42, number: 2, name: "Street Circuit", description: "Mixed vocabulary at medium pace.", targetWpm: 35, targetAccuracy: 87, duration: 60, wordCount: 35 },
      { id: 43, number: 3, name: "City Sprint", description: "Govt exam & coding words. Maintain momentum.", targetWpm: 45, targetAccuracy: 89, duration: 60, wordCount: 40 },
      { id: 44, number: 4, name: "Highway Dash", description: "Professional vocabulary at high speed.", targetWpm: 58, targetAccuracy: 91, duration: 60, wordCount: 45 },
      { id: 45, number: 5, name: "Grand Prix", description: "Expert words. Beat the champion ghost car.", targetWpm: 70, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 127, number: 6, name: "Turbo Blitz", description: "Nitro boost activated. Elite vocabulary at race pace.", targetWpm: 83, targetAccuracy: 94, duration: 60, wordCount: 55 },
      { id: 128, number: 7, name: "Warp Speed", description: "Ghost is undefeated. IAS-level vocabulary at warp pace.", targetWpm: 98, targetAccuracy: 95, duration: 60, wordCount: 60 },
      { id: 129, number: 8, name: "F1 Legend", description: "Maximum velocity. The fastest race on the planet.", targetWpm: 115, targetAccuracy: 96, duration: 60, wordCount: 65 },
    ]
  },
  {
    id: "word-fighter",
    name: "Word Fighter",
    description: "Type attack words to defeat your opponent! Each correct word is a combo strike. Miss a word and take damage. Defeat all enemies to win.",
    category: "game",
    icon: "Sword",
    difficulty: "intermediate",
    levels: [
      { id: 46, number: 1, name: "Training Dojo", description: "Basic words. Learn the fighting mechanics.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 25 },
      { id: 47, number: 2, name: "Street Brawl", description: "Administrative & coding vocabulary.", targetWpm: 30, targetAccuracy: 87, duration: 60, wordCount: 30 },
      { id: 48, number: 3, name: "Tournament", description: "SSC/Banking level words. Build combos.", targetWpm: 42, targetAccuracy: 90, duration: 60, wordCount: 35 },
      { id: 49, number: 4, name: "Championship", description: "UPSC level vocabulary. Hit your combos.", targetWpm: 55, targetAccuracy: 92, duration: 60, wordCount: 40 },
      { id: 50, number: 5, name: "World Final", description: "IAS-level expert vocabulary. Prove mastery.", targetWpm: 65, targetAccuracy: 94, duration: 60, wordCount: 45 },
      { id: 130, number: 6, name: "Cyber Kombat", description: "Elite vocabulary. Combo streaks decide the match.", targetWpm: 78, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 131, number: 7, name: "Dark Arts", description: "Maximum technique. Expert CS + governance combo war.", targetWpm: 92, targetAccuracy: 95, duration: 60, wordCount: 55 },
      { id: 132, number: 8, name: "Street God", description: "Undefeated champion level. Fastest fingers on the planet.", targetWpm: 108, targetAccuracy: 96, duration: 60, wordCount: 60 },
    ]
  },
  {
    id: "zombie-hunt",
    name: "Zombie Hunt",
    description: "Waves of zombies approach — type their words to eliminate them before they reach you! Mistype and lose HP. Survive all waves to win.",
    category: "game",
    icon: "Skull",
    difficulty: "intermediate",
    levels: [
      { id: 51, number: 1, name: "Graveyard", description: "Slow zombies with easy words.", targetWpm: 22, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 52, number: 2, name: "City Outbreak", description: "More zombies, administrative vocabulary.", targetWpm: 32, targetAccuracy: 87, duration: 60, wordCount: 28 },
      { id: 53, number: 3, name: "Horde Attack", description: "Fast zombie waves with SSC-level words.", targetWpm: 44, targetAccuracy: 90, duration: 60, wordCount: 35 },
      { id: 54, number: 4, name: "Apocalypse", description: "Relentless waves. UPSC vocabulary.", targetWpm: 56, targetAccuracy: 92, duration: 60, wordCount: 40 },
      { id: 55, number: 5, name: "Final Stand", description: "Unstoppable horde. Only experts survive.", targetWpm: 68, targetAccuracy: 94, duration: 60, wordCount: 45 },
      { id: 133, number: 6, name: "Necrosis", description: "Zombie super-strain. Elite vocabulary. Pure survival.", targetWpm: 80, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 134, number: 7, name: "Extinction", description: "Worldwide zombie storm. IAS-level expert vocab only.", targetWpm: 94, targetAccuracy: 95, duration: 60, wordCount: 55 },
      { id: 135, number: 8, name: "Patient Zero", description: "The original. Infinite horde. Type or die.", targetWpm: 110, targetAccuracy: 96, duration: 60, wordCount: 60 },
    ]
  },
  {
    id: "galaxy-blitz",
    name: "Galaxy Blitz",
    description: "Alien ships descend from space — type their words to fire your laser and destroy them! Miss a shot and your shield takes damage. Defend Earth!",
    category: "game",
    icon: "Rocket",
    difficulty: "advanced",
    levels: [
      { id: 56, number: 1, name: "Scout Wave", description: "Small alien scouts with short code keywords.", targetWpm: 25, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 57, number: 2, name: "Invasion Force", description: "Larger wave. Programming terms.", targetWpm: 35, targetAccuracy: 87, duration: 60, wordCount: 25 },
      { id: 58, number: 3, name: "Armada", description: "Full fleet. Dev vocabulary + govt terms.", targetWpm: 48, targetAccuracy: 90, duration: 60, wordCount: 30 },
      { id: 59, number: 4, name: "Mothership", description: "Elite fleet with architecture terms.", targetWpm: 60, targetAccuracy: 92, duration: 60, wordCount: 35 },
      { id: 60, number: 5, name: "Galactic Boss", description: "The final invasion. Expert-level vocabulary.", targetWpm: 72, targetAccuracy: 94, duration: 60, wordCount: 40 },
      { id: 136, number: 6, name: "Dark Matter", description: "Alien superships with elite governance vocabulary.", targetWpm: 85, targetAccuracy: 94, duration: 60, wordCount: 45 },
      { id: 137, number: 7, name: "Void Fleet", description: "Trans-dimensional fleet. IAS + expert CS vocabulary.", targetWpm: 100, targetAccuracy: 95, duration: 60, wordCount: 50 },
      { id: 138, number: 8, name: "Omega Armada", description: "The final Galactic invasion. No mercy. Type or be destroyed.", targetWpm: 118, targetAccuracy: 96, duration: 60, wordCount: 55 },
    ]
  },
  {
    id: "meteor-storm",
    name: "Meteor Storm",
    description: "Meteors hurtle toward Earth — type each word before impact to fire your laser cannon and destroy them! Build combos for bonus points. Protect the city!",
    category: "game",
    icon: "Flame",
    difficulty: "intermediate",
    levels: [
      { id: 61, number: 1, name: "Shower", description: "Slow meteors with simple words. Learn to aim.", targetWpm: 22, targetAccuracy: 85, duration: 60, wordCount: 22 },
      { id: 62, number: 2, name: "Storm Front", description: "Faster meteors with govt admin vocabulary.", targetWpm: 32, targetAccuracy: 87, duration: 60, wordCount: 28 },
      { id: 63, number: 3, name: "Meteor Blitz", description: "Multiple simultaneous meteors. SSC-level words.", targetWpm: 44, targetAccuracy: 89, duration: 60, wordCount: 34 },
      { id: 64, number: 4, name: "Extinction Wave", description: "High-speed barrage. UPSC vocabulary.", targetWpm: 56, targetAccuracy: 91, duration: 60, wordCount: 40 },
      { id: 65, number: 5, name: "Armageddon", description: "Relentless meteor swarm. Expert-level vocab.", targetWpm: 68, targetAccuracy: 94, duration: 60, wordCount: 45 },
      { id: 139, number: 6, name: "Deep Impact", description: "Hypersonic meteors. Elite vocabulary barrage.", targetWpm: 80, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 140, number: 7, name: "Cataclysm", description: "City-killer swarm. IAS + expert CS terms. No respite.", targetWpm: 95, targetAccuracy: 95, duration: 60, wordCount: 55 },
      { id: 141, number: 8, name: "Extinction Protocol", description: "Planet-ending impact. Fastest possible target WPM.", targetWpm: 112, targetAccuracy: 96, duration: 60, wordCount: 60 },
    ]
  },
  {
    id: "neon-runner",
    name: "Neon Runner",
    description: "Sprint through a neon city skyline — type words to jump over walls, dash through gates and land on platforms. Build your combo and survive the endless run!",
    category: "game",
    icon: "Play",
    difficulty: "intermediate",
    levels: [
      { id: 66, number: 1, name: "First Block", description: "Wide obstacles, slow scroll, easy words.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 67, number: 2, name: "City Sprint", description: "Faster scroll with administrative vocab.", targetWpm: 30, targetAccuracy: 87, duration: 60, wordCount: 26 },
      { id: 68, number: 3, name: "Neon Rush", description: "Mixed wall and gate obstacles. Coding terms.", targetWpm: 42, targetAccuracy: 89, duration: 60, wordCount: 32 },
      { id: 69, number: 4, name: "Hyper Drive", description: "High-speed run with professional vocabulary.", targetWpm: 54, targetAccuracy: 91, duration: 60, wordCount: 38 },
      { id: 70, number: 5, name: "Cyberpunk Final", description: "Maximum speed obstacle course. Expert vocab.", targetWpm: 66, targetAccuracy: 94, duration: 60, wordCount: 44 },
      { id: 142, number: 6, name: "Turbo Corridor", description: "Laser-thin gaps. IAS-level precision typing.", targetWpm: 78, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 143, number: 7, name: "Quantum Dash", description: "Obstacles at light speed. Expert vocabulary avalanche.", targetWpm: 92, targetAccuracy: 95, duration: 60, wordCount: 56 },
      { id: 144, number: 8, name: "Neon God", description: "Infinite city, zero mercy. The fastest runner in the matrix.", targetWpm: 108, targetAccuracy: 96, duration: 60, wordCount: 62 },
    ]
  },
  {
    id: "snake-typer",
    name: "Snake Typer",
    description: "Classic snake reimagined — type words to feed your neon snake as it glides through the grid. Correct words grow your snake; miss the timer and it starves. Build the longest snake!",
    category: "game",
    icon: "Gamepad2",
    difficulty: "beginner",
    levels: [
      { id: 71, number: 1, name: "Hatchling", description: "Short 3-4 letter words. Slow snake. Learn the grid.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 22 },
      { id: 72, number: 2, name: "Growing", description: "4-5 letter words. Moderate pace. Snake gets longer.", targetWpm: 28, targetAccuracy: 87, duration: 60, wordCount: 28 },
      { id: 73, number: 3, name: "Serpent", description: "Govt + coding mixed vocabulary. Multiple food items.", targetWpm: 38, targetAccuracy: 89, duration: 60, wordCount: 34 },
      { id: 74, number: 4, name: "Anaconda", description: "Advanced vocab. Fast snake. Three simultaneous foods.", targetWpm: 50, targetAccuracy: 91, duration: 60, wordCount: 40 },
      { id: 75, number: 5, name: "King Cobra", description: "Expert words. Maximum speed. Only the fastest survive.", targetWpm: 62, targetAccuracy: 94, duration: 60, wordCount: 48 },
      { id: 145, number: 6, name: "Leviathan", description: "Snake fills the grid. Elite vocabulary at extreme pace.", targetWpm: 74, targetAccuracy: 94, duration: 60, wordCount: 54 },
      { id: 146, number: 7, name: "World Serpent", description: "Mythological length. IAS + expert CS vocab. Near impossible.", targetWpm: 88, targetAccuracy: 95, duration: 60, wordCount: 60 },
      { id: 147, number: 8, name: "Ouroboros", description: "The infinite snake. The hardest grid challenge on earth.", targetWpm: 105, targetAccuracy: 96, duration: 60, wordCount: 66 },
    ]
  },
  {
    id: "word-invaders",
    name: "Word Invaders",
    description: "Alien ships descend in formation — each carrying a word. Type the target alien's word to fire your laser and blast it! Watch out as the fleet descends faster with each wave.",
    category: "game",
    icon: "Crosshair",
    difficulty: "intermediate",
    levels: [
      { id: 76, number: 1, name: "Scout Wave", description: "Slow descent. Short words. Learn to aim.", targetWpm: 22, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 77, number: 2, name: "Invasion Force", description: "Faster aliens. 4-5 letter words. Stay calm.", targetWpm: 32, targetAccuracy: 87, duration: 60, wordCount: 26 },
      { id: 78, number: 3, name: "Armada", description: "Full fleet. Govt exam vocabulary. Multiple waves.", targetWpm: 44, targetAccuracy: 89, duration: 60, wordCount: 32 },
      { id: 79, number: 4, name: "Mothership", description: "Elite descent. Architecture and policy terms.", targetWpm: 58, targetAccuracy: 91, duration: 60, wordCount: 38 },
      { id: 80, number: 5, name: "Galactic Siege", description: "Relentless fleet. Expert vocabulary. Final stand.", targetWpm: 72, targetAccuracy: 94, duration: 60, wordCount: 44 },
      { id: 148, number: 6, name: "Dreadnought", description: "Armored super-invaders. Elite typing or game over.", targetWpm: 85, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 149, number: 7, name: "Sector Annihilator", description: "Entire galaxy under siege. IAS + CS expert vocab.", targetWpm: 100, targetAccuracy: 95, duration: 60, wordCount: 56 },
      { id: 150, number: 8, name: "Universe Destroyer", description: "The final invasion. Endless fleet. Type faster than thought.", targetWpm: 118, targetAccuracy: 96, duration: 60, wordCount: 62 },
    ]
  },
  {
    id: "code-rain",
    name: "Code Rain",
    description: "The matrix falls — cascading code rains down every column. Hidden words glow gold in the stream. Type them to decrypt and collapse the column in a burst of light!",
    category: "game",
    icon: "Cpu",
    difficulty: "intermediate",
    levels: [
      { id: 81, number: 1, name: "Initialization", description: "1 target word. Short keywords. Matrix awakens.", targetWpm: 20, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 82, number: 2, name: "Compilation", description: "Moderate code terms. 1-2 simultaneous targets.", targetWpm: 30, targetAccuracy: 87, duration: 60, wordCount: 26 },
      { id: 83, number: 3, name: "Runtime", description: "Developer vocabulary. 2 targets. Rain speeds up.", targetWpm: 42, targetAccuracy: 89, duration: 60, wordCount: 32 },
      { id: 84, number: 4, name: "Deep Decrypt", description: "Architecture terms. 2-3 targets. Fast cascade.", targetWpm: 55, targetAccuracy: 91, duration: 60, wordCount: 38 },
      { id: 85, number: 5, name: "Zero Day", description: "3 simultaneous targets. Expert CS + governance vocab.", targetWpm: 68, targetAccuracy: 94, duration: 60, wordCount: 44 },
      { id: 151, number: 6, name: "Root Kit", description: "4 simultaneous matrix targets. Elite CS vocabulary.", targetWpm: 80, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 152, number: 7, name: "Neural Hack", description: "AI-encrypted words. Max rain speed. IAS + CS master vocab.", targetWpm: 95, targetAccuracy: 95, duration: 60, wordCount: 56 },
      { id: 153, number: 8, name: "God Mode", description: "5 targets. Fastest rain. Decrypting at this speed is legendary.", targetWpm: 112, targetAccuracy: 96, duration: 60, wordCount: 62 },
    ]
  },
  {
    id: "cyber-heist",
    name: "Cyber Heist",
    description: "A network of secured nodes stands between you and the mainframe. Type each node's passkey to hack it. Matrix rain, animated packet data, and a glitching terminal make this the most atmospheric typing game yet.",
    category: "game",
    icon: "Terminal",
    difficulty: "intermediate",
    levels: [
      { id: 86, number: 1, name: "Proxy Breach",      description: "7 nodes, short words. Infiltrate the outer network.",  targetWpm: 22, targetAccuracy: 85, duration: 75, wordCount: 24 },
      { id: 87, number: 2, name: "Firewall Bypass",   description: "Longer words. Faster node respawn. Govt vocab begins.", targetWpm: 34, targetAccuracy: 87, duration: 75, wordCount: 30 },
      { id: 88, number: 3, name: "Data Exfil",        description: "Mixed code and govt keywords. Mainframe in range.",     targetWpm: 46, targetAccuracy: 89, duration: 75, wordCount: 36 },
      { id: 89, number: 4, name: "Root Access",       description: "Architecture terms. Glitch overlay increases.",         targetWpm: 58, targetAccuracy: 91, duration: 75, wordCount: 42 },
      { id: 90, number: 5, name: "Zero Day Exploit",  description: "Expert CS + governance vocab. Full network assault.",   targetWpm: 72, targetAccuracy: 94, duration: 75, wordCount: 48 },
      { id: 154, number: 6, name: "Deep Web",         description: "Dark net heist. Elite vocabularly at warp speed.",      targetWpm: 85, targetAccuracy: 94, duration: 75, wordCount: 54 },
      { id: 155, number: 7, name: "Shadow Protocol",  description: "Government classified systems. Max glitch. No mercy.",  targetWpm: 100, targetAccuracy: 95, duration: 75, wordCount: 60 },
      { id: 156, number: 8, name: "Ghost in Shell",   description: "Full AI encryption. The hardest heist ever attempted.", targetWpm: 118, targetAccuracy: 96, duration: 75, wordCount: 66 },
    ]
  },
  {
    id: "arena-blitz",
    name: "Arena Blitz",
    description: "You are a weapons platform at the center of a circular arena. Enemy units spiral inward from the edges — type their code-word to fire and destroy them before they breach your shield ring. Faster typing = faster bullets.",
    category: "game",
    icon: "Crosshair",
    difficulty: "advanced",
    levels: [
      { id: 91, number: 1, name: "Scout Skirmish",   description: "3 slow grunt enemies. Short words. Learn the arena.",  targetWpm: 25, targetAccuracy: 85, duration: 60, wordCount: 24 },
      { id: 92, number: 2, name: "Tank Rush",         description: "Tanks require 2 hits. 4-5 letter words.",              targetWpm: 36, targetAccuracy: 87, duration: 60, wordCount: 30 },
      { id: 93, number: 3, name: "Speeder Wave",      description: "Fast diamond enemies + tanks. Govt vocabulary.",       targetWpm: 48, targetAccuracy: 89, duration: 60, wordCount: 36 },
      { id: 94, number: 4, name: "Siege Mode",        description: "Mixed enemy types. Architecture and policy terms.",    targetWpm: 62, targetAccuracy: 91, duration: 60, wordCount: 42 },
      { id: 95, number: 5, name: "Omega Protocol",    description: "Relentless assault. Expert CS + governance vocab.",    targetWpm: 76, targetAccuracy: 94, duration: 60, wordCount: 48 },
      { id: 157, number: 6, name: "Death Squadron",   description: "6 simultaneous enemy types. Elite vocabulary barrage.", targetWpm: 90, targetAccuracy: 94, duration: 60, wordCount: 54 },
      { id: 158, number: 7, name: "Apocalypse Class", description: "Endless swarm. IAS + expert CS vocabulary. Pure chaos.", targetWpm: 106, targetAccuracy: 95, duration: 60, wordCount: 60 },
      { id: 159, number: 8, name: "Singularity",      description: "Maximum difficulty. The arena never ends. Type forever.", targetWpm: 124, targetAccuracy: 96, duration: 60, wordCount: 66 },
    ]
  },
  {
    id: "bubble-pop",
    name: "Bubble Pop",
    description: "Colorful word-bubbles float upward — type each word before the bubble drifts off screen! Build combos for bonus points. Relax, focus, and pop your way through all 8 levels.",
    category: "game",
    icon: "Target",
    difficulty: "beginner",
    levels: [
      { id: 96, number: 1, name: "Soap Bubbles",    description: "Large slow bubbles with 3-4 letter words.",          targetWpm: 18, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 97, number: 2, name: "Rising Fast",     description: "Faster drift. Common 4-5 letter words.",              targetWpm: 28, targetAccuracy: 87, duration: 60, wordCount: 26 },
      { id: 98, number: 3, name: "Bubble Storm",    description: "Multiple simultaneous bubbles. Govt vocabulary.",     targetWpm: 38, targetAccuracy: 89, duration: 60, wordCount: 32 },
      { id: 99, number: 4, name: "Ultra Pop",       description: "High-speed bubbles. Professional vocabulary.",        targetWpm: 50, targetAccuracy: 91, duration: 60, wordCount: 38 },
      { id: 100, number: 5, name: "Pop Champion",   description: "Max speed. Expert vocab. Only the best survive.",    targetWpm: 62, targetAccuracy: 94, duration: 60, wordCount: 44 },
      { id: 160, number: 6, name: "Bubble Blizzard", description: "Screen full of bubbles. Elite vocabulary explodes.", targetWpm: 74, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 161, number: 7, name: "Hyperpop",        description: "Bubbles at warp speed. IAS + CS expert terms.", targetWpm: 88, targetAccuracy: 95, duration: 60, wordCount: 56 },
      { id: 162, number: 8, name: "Pop God",         description: "Infinite bubbles. Maximum velocity. The bubble master.", targetWpm: 104, targetAccuracy: 96, duration: 60, wordCount: 62 },
    ]
  },
  {
    id: "fruit-blitz",
    name: "Fruit Blitz",
    description: "Fruits fly through the air — type their word to slice them in half before they fall! Miss one and lose a life. Build your highest combo for the ultimate slice master score.",
    category: "game",
    icon: "Zap",
    difficulty: "beginner",
    levels: [
      { id: 101, number: 1, name: "Easy Slice",     description: "Slow fruits with short 3-letter words.",             targetWpm: 18, targetAccuracy: 85, duration: 60, wordCount: 20 },
      { id: 102, number: 2, name: "Fruit Rush",     description: "Faster arc. Common English words.",                  targetWpm: 28, targetAccuracy: 87, duration: 60, wordCount: 26 },
      { id: 103, number: 3, name: "Blitz Mode",     description: "Multiple flying fruits. Govt vocabulary.",           targetWpm: 38, targetAccuracy: 89, duration: 60, wordCount: 32 },
      { id: 104, number: 4, name: "Master Slicer",  description: "High-speed fruits. Professional terms.",             targetWpm: 50, targetAccuracy: 91, duration: 60, wordCount: 38 },
      { id: 105, number: 5, name: "Fruit Ninja Pro", description: "Max speed, expert vocabulary. Ultimate challenge.", targetWpm: 62, targetAccuracy: 94, duration: 60, wordCount: 44 },
      { id: 163, number: 6, name: "Lightning Blade", description: "Hypersonic fruits. Elite typing precision.", targetWpm: 74, targetAccuracy: 94, duration: 60, wordCount: 50 },
      { id: 164, number: 7, name: "Katana Master",   description: "Fruits at terminal velocity. IAS + CS vocab.", targetWpm: 88, targetAccuracy: 95, duration: 60, wordCount: 56 },
      { id: 165, number: 8, name: "Sword Saint",     description: "The hardest fruit challenge. Slice or be sliced.", targetWpm: 104, targetAccuracy: 96, duration: 60, wordCount: 62 },
    ]
  },
];

export const getGame = (gameId: string): Game | undefined => GAMES.find(g => g.id === gameId);
export const getGameLevel = (gameId: string, levelNumber: number): Level | undefined => {
  const game = getGame(gameId);
  return game?.levels.find(l => l.number === levelNumber);
};
