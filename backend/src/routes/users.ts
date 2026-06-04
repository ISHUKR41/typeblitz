import { Router } from "express";
import mongoose from "mongoose";
import { User, Session, LetterStat } from "../models/index.js";
import { GAMES } from "../data/games.js";

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

router.get("/:userId/stats", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const user = await User.findById(userId).lean();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const sessions = await Session.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();

  const totalSessions = sessions.length;
  const validSessions = sessions.filter(s => s.accuracy >= 90);
  const validSessionsCount = validSessions.length;
  const averageWpm = validSessionsCount > 0 ? validSessions.reduce((s, r) => s + r.wpm, 0) / validSessionsCount : 0;
  const bestWpm = validSessionsCount > 0 ? Math.max(...validSessions.map(s => s.wpm)) : 0;
  const totalTimeMinutes = sessions.reduce((s, r) => s + r.duration, 0) / 60;
  const averageAccuracy = totalSessions > 0 ? sessions.reduce((s, r) => s + r.accuracy, 0) / totalSessions : 0;

  // rank calculation
  let rank: number | null = null;
  if (bestWpm > 0) {
    try {
      const rankResult = await Session.aggregate([
        { $match: { accuracy: { $gte: 90 } } },
        { $group: { _id: "$userId", maxWpm: { $max: "$wpm" } } },
        { $match: { maxWpm: { $gte: bestWpm } } },
        { $count: "count" }
      ]);
      if (rankResult.length > 0) {
        rank = rankResult[0].count;
      }
    } catch (err) {
      // fallback
    }
  }

  // streak calculation
  let currentStreak = 0;
  if (sessions.length > 0) {
    const sortedDates = [...new Set(sessions.map(s => new Date(s.completedAt).toDateString()))].sort().reverse();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      let checkDate = new Date(sortedDates[0]);
      for (const dateStr of sortedDates) {
        if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else break;
      }
    }
  }

  const wordsTyped = sessions.reduce((s, r) => s + Math.round((r.wpm * r.duration) / 60), 0);

  res.json({
    userId,
    username: user.username,
    averageWpm: Math.round(averageWpm),
    bestWpm,
    totalSessions,
    totalTimeMinutes: Math.round(totalTimeMinutes * 10) / 10,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    currentStreak,
    wordsTyped,
    rank,
  });
});

router.get("/:userId/letter-accuracy", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const stats = await LetterStat.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();

  const result = stats.map(s => ({
    letter: s.letter,
    attempts: s.attempts,
    correct: s.correct,
    accuracy: s.attempts > 0 ? Math.round((s.correct / s.attempts) * 1000) / 10 : 100,
  }));

  res.json(result);
});

router.get("/:userId/sessions", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const sessions = await Session.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ completedAt: -1 })
    .limit(50)
    .lean();

  res.json(sessions.map(s => ({
    id: s._id.toString(),
    userId: s.userId.toString(),
    gameId: s.gameId,
    gameMode: s.gameMode,
    wpm: s.wpm,
    accuracy: s.accuracy,
    duration: s.duration,
    level: s.level,
    score: s.score,
    completedAt: s.completedAt,
    letterErrors: s.letterErrors,
  })));
});

router.get("/:userId/progress", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const sessions = await Session.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ completedAt: 1 })
    .lean();

  const byDate: Record<string, { wpms: number[]; accs: number[]; count: number }> = {};
  for (const s of sessions) {
    const date = new Date(s.completedAt).toISOString().slice(0, 10);
    if (!byDate[date]) byDate[date] = { wpms: [], accs: [], count: 0 };
    byDate[date].wpms.push(s.wpm);
    byDate[date].accs.push(s.accuracy);
    byDate[date].count++;
  }

  const result = Object.entries(byDate).map(([date, d]) => ({
    date,
    wpm: Math.round(d.wpms.reduce((a, b) => a + b, 0) / d.wpms.length),
    accuracy: Math.round((d.accs.reduce((a, b) => a + b, 0) / d.accs.length) * 10) / 10,
    sessionCount: d.count,
  }));

  res.json(result);
});

router.get("/:userId/level-progress", async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const sessions = await Session.find({ userId: new mongoose.Types.ObjectId(userId) }).lean();

  const result = GAMES.map(game => {
    const gameSessions = sessions.filter(s => s.gameId === game.id);
    const maxLevel = gameSessions.length > 0 ? Math.max(...gameSessions.map(s => s.level)) : 0;
    const validGameSessions = gameSessions.filter(s => s.accuracy >= 90);
    const bestWpm = validGameSessions.length > 0 ? Math.max(...validGameSessions.map(s => s.wpm)) : null;
    return {
      gameId: game.id,
      gameName: game.name,
      currentLevel: maxLevel,
      totalLevels: game.levels.length,
      completed: maxLevel >= game.levels.length,
      bestWpm,
    };
  });

  res.json(result);
});

export default router;
