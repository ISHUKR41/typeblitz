import { Router } from "express";
import { eq, desc, avg, max, count, sum } from "drizzle-orm";
import { db, sessionsTable, letterStatsTable, usersTable } from "@workspace/db";
import { GAMES } from "../data/games.js";

const router = Router();

router.get("/users/:userId/stats", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId));
  const totalSessions = sessions.length;
  const bestWpm = sessions.length > 0 ? Math.max(...sessions.map(s => s.wpm)) : 0;
  const averageWpm = sessions.length > 0 ? sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length : 0;
  const averageAccuracy = sessions.length > 0 ? sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length : 0;
  const totalTimeMinutes = sessions.reduce((a, s) => a + s.duration, 0) / 60;

  // Calculate streak
  let currentStreak = 0;
  if (sessions.length > 0) {
    const sortedDates = [...new Set(sessions.map(s => s.completedAt.toISOString().split("T")[0]))].sort().reverse();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (Math.round(diff) === 1) currentStreak++;
        else break;
      }
    }
  }

  // Global rank by best WPM
  const allBestWpms = await db.select({ userId: sessionsTable.userId, best: max(sessionsTable.wpm) })
    .from(sessionsTable)
    .groupBy(sessionsTable.userId)
    .orderBy(desc(max(sessionsTable.wpm)));

  const rank = allBestWpms.findIndex(r => r.userId === userId) + 1;

  const wordsTyped = sessions.reduce((a, s) => a + Math.round((s.wpm * s.duration) / 60), 0);

  res.json({
    userId: String(userId),
    username: user.username,
    averageWpm: Math.round(averageWpm * 10) / 10,
    bestWpm,
    totalSessions,
    totalTimeMinutes: Math.round(totalTimeMinutes * 10) / 10,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    currentStreak,
    wordsTyped,
    rank: rank > 0 ? rank : null,
  });
});

router.get("/users/:userId/letter-accuracy", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const stats = await db.select().from(letterStatsTable).where(eq(letterStatsTable.userId, userId));

  const result = stats.map(s => ({
    letter: s.letter,
    attempts: s.attempts,
    correct: s.correct,
    accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 1000) / 10 : 100,
  }));

  // Fill in missing letters with 100% accuracy (no data = never missed)
  const allLetters = "abcdefghijklmnopqrstuvwxyz".split("");
  for (const letter of allLetters) {
    if (!result.find(r => r.letter === letter)) {
      result.push({ letter, attempts: 0, correct: 0, accuracy: 100 });
    }
  }

  result.sort((a, b) => a.letter.localeCompare(b.letter));
  res.json(result);
});

router.get("/users/:userId/sessions", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const sessions = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .orderBy(desc(sessionsTable.completedAt))
    .limit(50);

  res.json(sessions.map(s => ({
    id: String(s.id),
    userId: String(s.userId),
    gameId: s.gameId,
    gameMode: s.gameMode,
    wpm: s.wpm,
    accuracy: s.accuracy,
    duration: s.duration,
    level: s.level,
    score: s.score ?? null,
    letterErrors: s.letterErrors ?? null,
    completedAt: s.completedAt,
  })));
});

router.get("/users/:userId/progress", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const sessions = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .orderBy(desc(sessionsTable.completedAt));

  // Group by date
  const byDate = new Map<string, { wpmSum: number; accuracySum: number; count: number }>();
  for (const s of sessions) {
    const date = s.completedAt.toISOString().split("T")[0];
    const existing = byDate.get(date) ?? { wpmSum: 0, accuracySum: 0, count: 0 };
    existing.wpmSum += s.wpm;
    existing.accuracySum += s.accuracy;
    existing.count++;
    byDate.set(date, existing);
  }

  const result = [...byDate.entries()]
    .map(([date, data]) => ({
      date,
      wpm: Math.round((data.wpmSum / data.count) * 10) / 10,
      accuracy: Math.round((data.accuracySum / data.count) * 10) / 10,
      sessionCount: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Last 30 days

  res.json(result);
});

router.get("/users/:userId/level-progress", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const userId = parseInt(raw, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const sessions = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.userId, userId));

  const result = GAMES.map(game => {
    const gameSessions = sessions.filter(s => s.gameId === game.id);
    const completedLevels = new Set(
      gameSessions
        .filter(s => {
          const level = game.levels.find(l => l.number === s.level);
          return level && s.wpm >= level.targetWpm && s.accuracy >= level.targetAccuracy;
        })
        .map(s => s.level)
    );

    const currentLevel = Math.min(
      game.levels.length,
      completedLevels.size + 1
    );
    const bestWpm = gameSessions.length > 0 ? Math.max(...gameSessions.map(s => s.wpm)) : null;

    return {
      gameId: game.id,
      gameName: game.name,
      currentLevel,
      totalLevels: game.levels.length,
      completed: completedLevels.size >= game.levels.length,
      bestWpm,
    };
  });

  res.json(result);
});

export default router;
