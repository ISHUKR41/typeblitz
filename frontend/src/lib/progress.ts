export type LevelAttempt = {
  attempts: number;
  bestWpm: number;
  bestAccuracy: number;
  passed: boolean;
  updatedAt: string;
};

export type GameProgress = {
  unlockedLevel: number;
  levels: Record<number, LevelAttempt>;
};

export type ProgressStore = Record<string, GameProgress>;

export type LevelResultInput = {
  gameId: string;
  level: number;
  wpm: number;
  accuracy: number;
  targetWpm: number;
};

export const MIN_PASSING_ACCURACY = 90;

const STORAGE_KEY = "typeblitz.levelProgress.v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadProgress(): ProgressStore {
  if (!canUseStorage()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressStore): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getGameProgress(gameId: string, store = loadProgress()): GameProgress {
  return store[gameId] ?? { unlockedLevel: 1, levels: {} };
}

export function getUnlockedLevel(gameId: string, store = loadProgress()): number {
  return Math.max(1, getGameProgress(gameId, store).unlockedLevel);
}

export function isLevelUnlocked(gameId: string, level: number, store = loadProgress()): boolean {
  return level <= getUnlockedLevel(gameId, store);
}

export function isPassingResult(wpm: number, accuracy: number, targetWpm: number): boolean {
  return wpm >= targetWpm && accuracy >= MIN_PASSING_ACCURACY;
}

export function recordLevelResult(input: LevelResultInput): {
  progress: ProgressStore;
  passed: boolean;
  nextLevelUnlocked: boolean;
} {
  const progress = loadProgress();
  const current = getGameProgress(input.gameId, progress);
  const previousAttempt = current.levels[input.level];
  const passed = isPassingResult(input.wpm, input.accuracy, input.targetWpm);
  const nextUnlockedLevel = passed
    ? Math.max(current.unlockedLevel, Math.min(input.level + 1, 5))
    : current.unlockedLevel;

  progress[input.gameId] = {
    unlockedLevel: nextUnlockedLevel,
    levels: {
      ...current.levels,
      [input.level]: {
        attempts: (previousAttempt?.attempts ?? 0) + 1,
        bestWpm: Math.max(previousAttempt?.bestWpm ?? 0, input.wpm),
        bestAccuracy: Math.max(previousAttempt?.bestAccuracy ?? 0, input.accuracy),
        passed: Boolean(previousAttempt?.passed || passed),
        updatedAt: new Date().toISOString(),
      },
    },
  };

  saveProgress(progress);

  return {
    progress,
    passed,
    nextLevelUnlocked: passed && nextUnlockedLevel > current.unlockedLevel,
  };
}
