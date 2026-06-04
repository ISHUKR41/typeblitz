import { Router } from "express";
import mongoose from "mongoose";
import { Session, LetterStat } from "../models/index.js";

const router = Router();

router.post("/", async (req, res) => {
  const data = req.body;
  if (!data?.userId || !data?.gameId || !data?.gameMode || data?.wpm == null || data?.accuracy == null) {
    res.status(400).json({ error: "Invalid session data" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(data.userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  const session = await Session.create({
    userId: new mongoose.Types.ObjectId(data.userId),
    gameId: data.gameId,
    gameMode: data.gameMode,
    wpm: Math.round(data.wpm),
    accuracy: data.accuracy,
    duration: data.duration ?? 0,
    level: data.level ?? 1,
    score: data.score ?? null,
    letterErrors: data.letterErrors ?? null,
  });

  // Update letter stats if provided
  if (data.letterErrors) {
    try {
      const errors = JSON.parse(data.letterErrors) as Record<string, { attempts: number; correct: number }>;
      for (const [letter, stat] of Object.entries(errors)) {
        await LetterStat.findOneAndUpdate(
          { userId: session.userId, letter },
          { $inc: { attempts: stat.attempts, correct: stat.correct } },
          { upsert: true }
        );
      }
    } catch { /* ignore parse errors */ }
  }

  res.status(201).json({
    id: session._id.toString(),
    userId: session.userId.toString(),
    gameId: session.gameId,
    gameMode: session.gameMode,
    wpm: session.wpm,
    accuracy: session.accuracy,
    duration: session.duration,
    level: session.level,
    score: session.score,
    completedAt: session.completedAt,
    letterErrors: session.letterErrors,
  });
});

router.post("/analyze", async (req, res) => {
  const { originalText, typedText, duration } = req.body ?? {};

  if (!originalText || !typedText || duration == null) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const words = typedText.trim().split(/\s+/).length;
  const wpm = Math.round((words / Math.max(duration, 1)) * 60);

  const letterMap: Record<string, { attempts: number; correct: number }> = {};
  let correctChars = 0;

  const minLen = Math.min(originalText.length, typedText.length);
  for (let i = 0; i < minLen; i++) {
    const orig = originalText[i].toLowerCase();
    const typed = typedText[i].toLowerCase();
    if (/[a-z]/.test(orig)) {
      if (!letterMap[orig]) letterMap[orig] = { attempts: 0, correct: 0 };
      letterMap[orig].attempts++;
      if (orig === typed) { letterMap[orig].correct++; correctChars++; }
    } else if (orig === typed) { correctChars++; }
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
      accuracy: Math.round((v.correct / v.attempts) * 1000) / 10,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakLetters = letterErrors.filter(l => l.accuracy < 80).map(l => l.letter);
  const suggestions = weakLetters.length > 0
    ? [`Focus on these keys: ${weakLetters.slice(0, 5).join(", ")}`, "Try the Letter Blaster game to improve specific key accuracy"]
    : ["Great accuracy! Try increasing your speed with Word Sprint."];

  res.json({ wpm, accuracy, errorCount, letterErrors, suggestions });
});

export default router;
