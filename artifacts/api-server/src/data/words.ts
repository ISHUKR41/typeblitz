export const wordLists: Record<string, string[][]> = {
  "word-sprint": [
    // Level 1 - beginner (3-4 letter simple words)
    ["the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let", "put", "say", "she", "too", "use"],
    // Level 2 - easy (4-5 letter common words)
    ["about", "after", "again", "could", "every", "first", "found", "great", "hands", "heard", "house", "large", "learn", "level", "light", "might", "never", "often", "other", "place", "point", "power", "right", "shall", "small", "sound", "still", "think", "three", "under", "water", "where", "which", "while", "world", "would", "write", "years"],
    // Level 3 - intermediate (5-7 letter words)
    ["action", "always", "around", "before", "behind", "better", "better", "change", "create", "during", "family", "follow", "future", "growth", "happen", "height", "inside", "island", "listen", "master", "mother", "nation", "number", "object", "others", "person", "planet", "player", "pretty", "really", "reason", "result", "school", "simple", "single", "social", "source", "system", "taking", "toward", "travel", "trying", "turned"],
    // Level 4 - advanced (6-8 letter complex words)
    ["achieve", "another", "because", "between", "brought", "carried", "century", "chapter", "collect", "command", "company", "complete", "concern", "contain", "control", "correct", "country", "culture", "current", "decided", "develop", "discuss", "example", "explore", "express", "failure", "finally", "flowers", "forward", "general", "history", "however", "imagine", "improve", "include", "instead", "journey", "justice", "machine", "measure", "message", "million", "nothing", "outside", "perhaps", "picture", "popular", "present", "problem", "produce"],
    // Level 5 - expert (technical/rare/long words)
    ["accomplish", "adventure", "algorithm", "ambiguous", "benchmark", "calculate", "challenge", "cognitive", "commerce", "component", "configure", "consensus", "construct", "continue", "dashboard", "debugging", "dedicated", "developer", "different", "duplicate", "efficient", "elaborate", "encounter", "execution", "frequency", "functions", "implement", "important", "interface", "iteration", "javascript", "knowledge", "legitimate", "middleware", "namespace", "objective", "parameter", "performance", "persistent", "procedure", "prototype", "recursion", "refactor", "repository", "responsive", "structure", "typescript", "variable", "visibility"]
  ],
  "sentence-rush": [
    // Level 1 - simple sentences
    [
      "The cat sat on the mat.",
      "She opened the door.",
      "He ran fast today.",
      "The sun is bright.",
      "I love to read books.",
      "The dog barked loudly.",
      "She ate the apple.",
      "He went to the store.",
      "The bird sang a song.",
      "We played in the park."
    ],
    // Level 2 - compound sentences
    [
      "The rain was falling hard, but we decided to go outside anyway.",
      "She finished her work early, and then she went for a walk.",
      "He wanted to learn piano, so he signed up for classes.",
      "The project was complex, yet the team completed it on time.",
      "I made a cup of coffee, but it turned out to be too hot.",
      "They studied all night, and finally passed the exam.",
      "She loves reading books, especially mystery novels.",
      "The concert was amazing, and the crowd cheered loudly."
    ],
    // Level 3 - complex paragraphs
    [
      "Learning to type faster is a skill that takes consistent practice and patience. The key is to focus on accuracy first, then gradually increase your speed over time.",
      "Technology has transformed the way we communicate and work. Modern software development relies heavily on efficient typing skills to write clean, readable code.",
      "The history of the typewriter dates back to the 19th century, when inventors sought to create machines that could produce written text mechanically.",
      "Developing good keyboard habits early in your career can have a significant impact on your overall productivity and efficiency in the workplace."
    ],
    // Level 4 - technical/business text
    [
      "The implementation of a robust continuous integration pipeline requires careful consideration of build artifacts, testing strategies, and deployment workflows.",
      "Database normalization is the process of organizing data to reduce redundancy and improve data integrity by applying a series of formal rules called normal forms.",
      "Microservices architecture decomposes an application into small, loosely coupled services that communicate through well-defined APIs, enabling independent deployment.",
      "The agile methodology emphasizes iterative development, cross-functional collaboration, and continuous delivery of working software in short development cycles."
    ],
    // Level 5 - literature/advanced
    [
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief.",
      "In the beginning was the Word, and the Word was with God, and these ancient texts have shaped civilization for thousands of years.",
      "The universe is under no obligation to make sense to you, yet the human mind persistently seeks patterns, meaning, and order in the chaos of existence.",
      "Programming is the art of telling another human what one wants the computer to do — a discipline requiring both precision and creative problem-solving."
    ]
  ],
  "code-type": [
    // Level 1 - basic variable declarations
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
      "let isPlaying = false;"
    ],
    // Level 2 - functions
    [
      "function calculateWpm(words, seconds) {\n  return Math.round((words / seconds) * 60);\n}",
      "const greet = (name) => {\n  return `Hello, ${name}!`;\n};",
      "function isValidEmail(email) {\n  return email.includes('@');\n}",
      "const sum = (a, b) => a + b;",
      "function getRandomWord(words) {\n  return words[Math.floor(Math.random() * words.length)];\n}"
    ],
    // Level 3 - class definitions
    [
      "class Player {\n  constructor(name, level) {\n    this.name = name;\n    this.level = level;\n    this.score = 0;\n  }\n}",
      "class GameSession {\n  constructor(userId, gameId) {\n    this.userId = userId;\n    this.gameId = gameId;\n    this.startTime = Date.now();\n  }\n}",
      "interface UserStats {\n  userId: number;\n  averageWpm: number;\n  bestWpm: number;\n  totalSessions: number;\n}"
    ],
    // Level 4 - algorithms
    [
      "function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
      "function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[arr.length - 1];\n  const left = arr.filter(x => x < pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}"
    ],
    // Level 5 - real-world code
    [
      "async function fetchUserData(userId: number): Promise<User> {\n  const response = await fetch(`/api/users/${userId}`);\n  if (!response.ok) throw new Error('Failed to fetch user');\n  return response.json();\n}",
      "const useTypingGame = (words: string[]) => {\n  const [currentIndex, setCurrentIndex] = useState(0);\n  const [typed, setTyped] = useState('');\n  const [errors, setErrors] = useState(0);\n  const [startTime, setStartTime] = useState<number | null>(null);\n  return { currentIndex, typed, errors, startTime };\n};"
    ]
  ],
  "letter-blaster": [
    // Level 1 - home row only (asdfghjkl;)
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "a", "s", "d", "f", "g", "h", "j", "k", "l", "as", "sd", "df", "fg", "gh", "hj", "jk", "kl", "asd", "sdf", "dfg", "fgh", "ghj", "hjk", "jkl"],
    // Level 2 - top row (qwertyuiop)
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "qw", "we", "er", "rt", "ty", "yu", "ui", "io", "op", "qwe", "wer", "ert", "rty", "tyu", "yui", "uio", "iop"],
    // Level 3 - all alpha keys
    ["ab", "cd", "ef", "gh", "ij", "kl", "mn", "op", "qr", "st", "uv", "wx", "yz", "abc", "def", "ghi", "jkl", "mno", "pqr", "stu", "vwx", "xyz", "abcd", "efgh", "ijkl", "mnop"],
    // Level 4 - with capital letters
    ["The", "And", "For", "Are", "But", "Not", "You", "All", "Can", "Has", "His", "How", "New", "Now", "Old", "See", "Two", "Way", "Who", "Did", "Let", "Put", "Say", "She"],
    // Level 5 - with symbols and numbers
    ["a1", "b2", "c3", "d4", "e5", "f6", "g7", "h8", "i9", "j0", "key!", "fun@", "win#", "top$", "ace%", "hit^", "run&", "fly*", "zap(", "max)", "set+", "go="]
  ],
  "typing-race": [
    // Level 1-5: passages of varying complexity for race mode
    [
      "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How quickly daft jumping zebras vex!",
    ],
    [
      "In the world of programming, the ability to type quickly and accurately can make a significant difference in your daily productivity. Developers who type faster can iterate on ideas more quickly and spend less time on mechanical tasks.",
    ],
    [
      "The fundamental theorem of software engineering states that any problem can be solved by adding a layer of indirection. This principle underlies much of modern software architecture, from object-oriented design patterns to microservices.",
    ],
    [
      "Asynchronous programming has become essential in modern web development. Using promises, async/await syntax, and event-driven architectures allows developers to write non-blocking code that handles concurrent operations efficiently.",
    ],
    [
      "The philosophy of test-driven development suggests that writing tests before implementation leads to better software design. By defining expected behavior upfront, developers create a safety net that enables confident refactoring and promotes modular, loosely coupled code.",
    ]
  ]
};

export const getWordsForLevel = (gameId: string, level: number): string[] => {
  const gameLists = wordLists[gameId];
  if (!gameLists) return wordLists["word-sprint"][0];
  const levelIndex = Math.min(level - 1, gameLists.length - 1);
  return gameLists[levelIndex];
};
