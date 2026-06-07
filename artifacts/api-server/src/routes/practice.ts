import { Router } from "express";
import { AnalyzePracticeBody } from "@workspace/api-zod";

const router = Router();

router.post("/practice/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzePracticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { originalText, typedText, duration } = parsed.data;

  // Calculate character-by-character accuracy
  const letterErrors: Record<string, { attempts: number; correct: number }> = {};
  let correctChars = 0;
  let totalTyped = typedText.length;

  for (let i = 0; i < Math.min(originalText.length, typedText.length); i++) {
    const expected = originalText[i].toLowerCase();
    const typed = typedText[i].toLowerCase();

    if (/[a-z]/.test(expected)) {
      if (!letterErrors[expected]) {
        letterErrors[expected] = { attempts: 0, correct: 0 };
      }
      letterErrors[expected].attempts++;
      if (expected === typed) {
        letterErrors[expected].correct++;
        correctChars++;
      }
    } else if (expected === typed) {
      correctChars++;
    }
  }

  const durationMinutes = duration / 60;
  const wpm = durationMinutes > 0 ? Math.round((correctChars / 5) / durationMinutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 1000) / 10 : 0;
  const errorCount = totalTyped - correctChars;

  const letterAccuracyList = Object.entries(letterErrors)
    .map(([letter, stats]) => ({
      letter,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 1000) / 10 : 100,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Generate suggestions based on problem letters
  const suggestions: string[] = [];
  const problemLetters = letterAccuracyList.filter(l => l.accuracy < 80 && l.attempts >= 3);
  if (problemLetters.length > 0) {
    suggestions.push(`Focus on these letters: ${problemLetters.slice(0, 5).map(l => l.letter.toUpperCase()).join(", ")}`);
  }
  if (accuracy < 90) {
    suggestions.push("Slow down slightly and prioritize accuracy over speed");
  }
  if (wpm < 30) {
    suggestions.push("Practice home row position daily to build muscle memory");
  }
  if (wpm >= 60 && accuracy >= 95) {
    suggestions.push("Excellent work! Try harder texts to push your limits");
  }
  if (errorCount > 10) {
    suggestions.push("Use the lessons module to practice problem key combinations");
  }

  res.json({ wpm, accuracy, errorCount, letterErrors: letterAccuracyList, suggestions });
});

export default router;
