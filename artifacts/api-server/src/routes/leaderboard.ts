import { Router } from "express";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, desc, max } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

  // Get all sessions, join with users, get best WPM per user (optionally per game)
  const allSessions = await db.select({
    sessionId: sessionsTable.id,
    userId: sessionsTable.userId,
    gameId: sessionsTable.gameId,
    wpm: sessionsTable.wpm,
    accuracy: sessionsTable.accuracy,
    completedAt: sessionsTable.completedAt,
  }).from(sessionsTable).orderBy(desc(sessionsTable.wpm));

  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.username]));

  // Best WPM per user (and per game if filtered)
  const bestByUser = new Map<string, typeof allSessions[0]>();
  for (const s of allSessions) {
    if (gameId && s.gameId !== gameId) continue;
    const key = gameId ? `${s.userId}:${s.gameId}` : `${s.userId}`;
    if (!bestByUser.has(key)) bestByUser.set(key, s);
  }

  const entries = [...bestByUser.values()]
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, limit)
    .map((s, i) => ({
      rank: i + 1,
      userId: s.userId,
      username: userMap.get(s.userId) ?? "Unknown",
      wpm: s.wpm,
      accuracy: s.accuracy,
      gameId: s.gameId,
      achievedAt: s.completedAt
    }));

  res.json(entries);
});

export default router;
