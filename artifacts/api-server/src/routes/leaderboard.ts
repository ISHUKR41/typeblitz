import { Router } from "express";
import { eq, desc, max, sql } from "drizzle-orm";
import { db, sessionsTable, usersTable } from "@workspace/db";

const router = Router();

router.get("/leaderboard", async (req, res): Promise<void> => {
  const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
  const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;
  const safeLimit = isNaN(limit) ? 50 : Math.min(limit, 100);

  // Get best WPM per user (optionally filtered by game)
  const filtered = gameId
    ? await db.select({
        userId: sessionsTable.userId,
        wpm: sessionsTable.wpm,
        accuracy: sessionsTable.accuracy,
        gameId: sessionsTable.gameId,
        achievedAt: sessionsTable.completedAt,
      })
        .from(sessionsTable)
        .where(eq(sessionsTable.gameId, gameId))
        .orderBy(desc(sessionsTable.wpm))
    : await db.select({
        userId: sessionsTable.userId,
        wpm: sessionsTable.wpm,
        accuracy: sessionsTable.accuracy,
        gameId: sessionsTable.gameId,
        achievedAt: sessionsTable.completedAt,
      })
        .from(sessionsTable)
        .orderBy(desc(sessionsTable.wpm));

  // Deduplicate: keep best session per user
  const seen = new Set<number>();
  const best = filtered.filter(row => {
    if (seen.has(row.userId)) return false;
    seen.add(row.userId);
    return true;
  }).slice(0, safeLimit);

  // Fetch usernames
  const userIds = best.map(r => r.userId);
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, username: usersTable.username })
        .from(usersTable)
        .where(sql`${usersTable.id} = ANY(${userIds})`)
    : [];

  const usernameMap = new Map(users.map(u => [u.id, u.username]));

  const result = best.map((row, index) => ({
    rank: index + 1,
    userId: String(row.userId),
    username: usernameMap.get(row.userId) ?? "Unknown",
    wpm: row.wpm,
    accuracy: row.accuracy,
    gameId: row.gameId,
    achievedAt: row.achievedAt,
  }));

  res.json(result);
});

export default router;
