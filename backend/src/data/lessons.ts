export interface Lesson {
  id: number;
  title: string;
  description: string;
  category: "home-row" | "top-row" | "bottom-row" | "numbers" | "symbols" | "capitalization" | "punctuation";
  order: number;
  estimatedMinutes: number;
  targetKeys: string[];
  content: string[];
  completedBy?: number;
}

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "Home Row Left Hand",
    description: "Master the left-hand home row keys: A, S, D, F. These are the foundation of touch typing.",
    category: "home-row",
    order: 1,
    estimatedMinutes: 5,
    targetKeys: ["a", "s", "d", "f"],
    content: [
      "aaa sss ddd fff",
      "as sad fads dads",
      "fads adds sass dads",
      "a sad fad adds",
      "dad adds fads fast",
      "safe dads fade sand",
      "dad fades as fast",
      "add safe fads dads",
      "sad fads fade fast",
      "fast fads add sass"
    ]
  },
  {
    id: 2,
    title: "Home Row Right Hand",
    description: "Master the right-hand home row keys: J, K, L, ;. Mirror your left-hand practice.",
    category: "home-row",
    order: 2,
    estimatedMinutes: 5,
    targetKeys: ["j", "k", "l", ";"],
    content: [
      "jjj kkk lll ;;;",
      "jk kl lj jkl",
      "kjl ljk jkl kl",
      "lk jk kl jkl",
      "jkl lkj kjl ljk",
      "klj jlk lkj kjl",
      "jl lk kj jkl lkj",
      "lkj kjl jkl lk",
      "jkl kl jl lk",
      "kj jl lk kjl"
    ]
  },
  {
    id: 3,
    title: "Full Home Row",
    description: "Combine both hands on the home row: ASDF JKL;. This is where touch typing begins.",
    category: "home-row",
    order: 3,
    estimatedMinutes: 8,
    targetKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    content: [
      "as df jk l; asdf jkl;",
      "fall jads kafk sald",
      "asks flask flak jalls",
      "dads fads jabs skills",
      "flask flaks jabs dads",
      "flag fall silk disk",
      "dial fail lads skill",
      "flask jails fads disk",
      "fall flag jails dads",
      "silk disk flag fall"
    ]
  },
  {
    id: 4,
    title: "Top Row Left Hand",
    description: "Learn Q, W, E, R, T — the left side of the QWERTY top row.",
    category: "top-row",
    order: 4,
    estimatedMinutes: 8,
    targetKeys: ["q", "w", "e", "r", "t"],
    content: [
      "qqq www eee rrr ttt",
      "qwer wert ertq rtqw",
      "tree were three wet",
      "write sweet refer tree",
      "tweet street twerp",
      "where wetter treet",
      "sweet street write",
      "ether tweet water",
      "sweet refer three",
      "where twerp write"
    ]
  },
  {
    id: 5,
    title: "Top Row Right Hand",
    description: "Learn Y, U, I, O, P — the right side of the QWERTY top row.",
    category: "top-row",
    order: 5,
    estimatedMinutes: 8,
    targetKeys: ["y", "u", "i", "o", "p"],
    content: [
      "yyy uuu iii ooo ppp",
      "yuio uiop iopy opyu",
      "your pour upon opus",
      "puppy tippy hippy",
      "upon your poopy",
      "tippy hippy yuppie",
      "opium pouty tippy",
      "hippy yuppy uptown",
      "pour upon opium",
      "tippy hippy pouty"
    ]
  },
  {
    id: 6,
    title: "Full Top Row",
    description: "Master the complete top row QWERTYUIOP combined with home row practice.",
    category: "top-row",
    order: 6,
    estimatedMinutes: 10,
    targetKeys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    content: [
      "qwerty yuiop proper",
      "write your report today",
      "type every word quickly",
      "pretty quiet people type",
      "write poetry quite well",
      "your quote works properly",
      "the quick write question",
      "pretty people write poetry",
      "quite proper writing style",
      "type every question well"
    ]
  },
  {
    id: 7,
    title: "Bottom Row",
    description: "Learn the bottom row: Z, X, C, V, B, N, M. Complete your full keyboard knowledge.",
    category: "bottom-row",
    order: 7,
    estimatedMinutes: 10,
    targetKeys: ["z", "x", "c", "v", "b", "n", "m"],
    content: [
      "zzz xxx ccc vvv bbb nnn mmm",
      "zxcv cvbn vbnm",
      "zinc exam cave vibe",
      "venom brain claim",
      "bronze venom cabin",
      "Mexico cabin venom",
      "clam zombie venom",
      "cabin zinc bronze",
      "venom cabin Mexico",
      "zombie venom bronze"
    ]
  },
  {
    id: 8,
    title: "Number Row",
    description: "Practice the number row: 1234567890. Essential for coding and data entry.",
    category: "numbers",
    order: 8,
    estimatedMinutes: 8,
    targetKeys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    content: [
      "1234 5678 90 1234567890",
      "pin 1234 code 5678",
      "version 2.0 update 3.1",
      "100 200 300 400 500",
      "order 1001 total 5678",
      "year 2024 month 12",
      "score 9876 rank 1",
      "items 42 total 100",
      "port 3000 api 8080",
      "level 5 score 10000"
    ]
  },
  {
    id: 9,
    title: "Shift Key and Capitals",
    description: "Learn to use Shift for capital letters. Critical for proper typing.",
    category: "capitalization",
    order: 9,
    estimatedMinutes: 8,
    targetKeys: ["Shift"],
    content: [
      "The Quick Brown Fox",
      "Hello World Program",
      "TypeBlitz Professional",
      "JavaScript TypeScript",
      "New York Los Angeles",
      "Monday Tuesday Wednesday",
      "January February March",
      "Alpha Beta Gamma Delta",
      "React Vue Angular Next",
      "GitHub GitLab Bitbucket"
    ]
  },
  {
    id: 10,
    title: "Common Symbols",
    description: "Practice commonly used symbols: @, #, $, %, &, *. Essential for coding.",
    category: "symbols",
    order: 10,
    estimatedMinutes: 10,
    targetKeys: ["@", "#", "$", "%", "&", "*"],
    content: [
      "user@email.com send@now.io",
      "#hashtag #trending #viral",
      "$100 $250 $999 $1000",
      "50% off 25% discount",
      "Tom & Jerry Ben & Jerry",
      "const x = a * b + c",
      "a@b.com #tag $100 25%",
      "price: $499 save: 30%",
      "email: admin@site.com",
      "array[0] * factor = total"
    ]
  },
  {
    id: 11,
    title: "Punctuation Mastery",
    description: "Master all punctuation marks: period, comma, colon, semicolon, quotes, brackets.",
    category: "punctuation",
    order: 11,
    estimatedMinutes: 10,
    targetKeys: [".", ",", ":", ";", "\"", "'", "(", ")", "[", "]"],
    content: [
      "Hello, World! How are you?",
      "function foo(x, y): number;",
      "['apple', 'banana', 'cherry']",
      "key: value, other: true",
      "if (x > 0) { return x; }",
      "console.log('Hello, World!');",
      "const arr = [1, 2, 3, 4, 5];",
      "{ name: 'TypeBlitz', version: '1.0' }",
      "He said, \"Hello there.\"",
      "import { useState } from 'react';"
    ]
  },
  {
    id: 12,
    title: "Speed Training",
    description: "High-speed practice with common word combinations. Push your WPM to the limit.",
    category: "home-row",
    order: 12,
    estimatedMinutes: 15,
    targetKeys: [],
    content: [
      "the quick brown fox jumps over the lazy dog",
      "pack my box with five dozen liquor jugs",
      "how quickly daft jumping zebras vex",
      "the five boxing wizards jump quickly",
      "sphinx of black quartz judge my vow",
      "two driven jocks help fax my big quiz",
      "five quacking zephyrs jolt my wax bed",
      "the jay pig fox zebra and my wolves quack",
      "blowzy night frumps vex squat djinn",
      "glum schwartzkopf vex'd by jittery quins"
    ]
  }
];

export const getLesson = (id: number): Lesson | undefined => LESSONS.find(l => l.id === id);
