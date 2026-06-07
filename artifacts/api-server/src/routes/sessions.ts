import { Router } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, sessionsTable, letterStatsTable } from "@workspace/db";
import { CreateSessionBody } from "@workspace/api-zod";

const router = Router();

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const userId = parseInt(data.userId, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const [session] = await db.insert(sessionsTable).values({
    userId,
    gameId: data.gameId,
    gameMode: data.gameMode,
    wpm: data.wpm,
    accuracy: data.accuracy,
    duration: data.duration,
    level: data.level,
    score: data.score ?? null,
    letterErrors: data.letterErrors ?? null,
  }).returning();

  // Update letter stats if provided
  if (data.letterErrors) {
    try {
      const errors: Record<string, { attempts: number; correct: number }> = JSON.parse(data.letterErrors);
      for (const [letter, stats] of Object.entries(errors)) {
        const existing = await db.select().from(letterStatsTable)
          .where(and(eq(letterStatsTable.userId, userId), eq(letterStatsTable.letter, letter)));

        if (existing.length > 0) {
          await db.update(letterStatsTable)
            .set({
              attempts: existing[0].attempts + stats.attempts,
              correct: existing[0].correct + stats.correct,
            })
            .where(and(eq(letterStatsTable.userId, userId), eq(letterStatsTable.letter, letter)));
        } else {
          await db.insert(letterStatsTable).values({
            userId,
            letter,
            attempts: stats.attempts,
            correct: stats.correct,
          });
        }
      }
    } catch {
      // ignore invalid JSON
    }
  }

  res.status(201).json({
    id: String(session.id),
    userId: String(session.userId),
    gameId: session.gameId,
    gameMode: session.gameMode,
    wpm: session.wpm,
    accuracy: session.accuracy,
    duration: session.duration,
    level: session.level,
    score: session.score ?? null,
    letterErrors: session.letterErrors ?? null,
    completedAt: session.completedAt,
  });
});

export default router;
