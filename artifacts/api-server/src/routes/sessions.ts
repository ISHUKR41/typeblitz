import { Router } from "express";
import { db, sessionsTable, letterStatsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateSessionBody, AnalyzePracticeBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid session data", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [session] = await db.insert(sessionsTable).values({
    userId: data.userId,
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
      const errors = JSON.parse(data.letterErrors) as Record<string, { attempts: number; correct: number }>;
      for (const [letter, stat] of Object.entries(errors)) {
        const existing = await db.select().from(letterStatsTable)
          .where(and(eq(letterStatsTable.userId, data.userId), eq(letterStatsTable.letter, letter)))
          .limit(1);

        if (existing.length > 0) {
          await db.update(letterStatsTable)
            .set({
              attempts: existing[0].attempts + stat.attempts,
              correct: existing[0].correct + stat.correct
            })
            .where(and(eq(letterStatsTable.userId, data.userId), eq(letterStatsTable.letter, letter)));
        } else {
          await db.insert(letterStatsTable).values({
            userId: data.userId,
            letter,
            attempts: stat.attempts,
            correct: stat.correct
          });
        }
      }
    } catch { /* ignore parse errors */ }
  }

  res.status(201).json({
    id: session.id,
    userId: session.userId,
    gameId: session.gameId,
    gameMode: session.gameMode,
    wpm: session.wpm,
    accuracy: session.accuracy,
    duration: session.duration,
    level: session.level,
    score: session.score,
    completedAt: session.completedAt,
    letterErrors: session.letterErrors
  });
});

router.post("/analyze", async (req, res) => {
  const parsed = AnalyzePracticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { originalText, typedText, duration } = parsed.data;

  // Calculate WPM
  const words = typedText.trim().split(/\s+/).length;
  const wpm = Math.round((words / Math.max(duration, 1)) * 60);

  // Calculate accuracy and letter errors
  const letterMap: Record<string, { attempts: number; correct: number }> = {};
  let correctChars = 0;

  const minLen = Math.min(originalText.length, typedText.length);
  for (let i = 0; i < minLen; i++) {
    const orig = originalText[i].toLowerCase();
    const typed = typedText[i].toLowerCase();
    if (/[a-z]/.test(orig)) {
      if (!letterMap[orig]) letterMap[orig] = { attempts: 0, correct: 0 };
      letterMap[orig].attempts++;
      if (orig === typed) {
        letterMap[orig].correct++;
        correctChars++;
      }
    } else if (orig === typed) {
      correctChars++;
    }
  }

  const accuracy = originalText.length > 0
    ? Math.round((correctChars / originalText.length) * 1000) / 10
    : 100;

  const errorCount = minLen - correctChars + Math.abs(originalText.length - typedText.length);

  const letterErrors = Object.entries(letterMap)
    .filter(([, v]) => v.attempts > 0)
    .map(([letter, v]) => ({
      letter,
      attempts: v.attempts,
      correct: v.correct,
      accuracy: Math.round((v.correct / v.attempts) * 1000) / 10
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakLetters = letterErrors.filter(l => l.accuracy < 80).map(l => l.letter);
  const suggestions = weakLetters.length > 0
    ? [`Focus on these keys: ${weakLetters.slice(0, 5).join(", ")}`, "Try the Letter Blaster game to improve specific key accuracy"]
    : ["Great accuracy! Try increasing your speed with Word Sprint."];

  res.json({ wpm, accuracy, errorCount, letterErrors, suggestions });
});

export default router;
