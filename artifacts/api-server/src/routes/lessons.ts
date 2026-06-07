import { Router } from "express";
import { eq, count } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";
import { LESSONS, getLesson } from "../data/lessons.js";

const router = Router();

router.get("/lessons", async (req, res): Promise<void> => {
  const result = await Promise.all(
    LESSONS.map(async lesson => {
      const completedCount = await db.select({ cnt: count() })
        .from(sessionsTable)
        .where(eq(sessionsTable.gameId, `lesson-${lesson.id}`));

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        order: lesson.order,
        estimatedMinutes: lesson.estimatedMinutes,
        targetKeys: lesson.targetKeys,
        content: lesson.content,
        completedBy: completedCount[0]?.cnt ?? 0,
      };
    })
  );

  res.json(result);
});

router.get("/lessons/:lessonId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
  const lessonId = parseInt(raw, 10);
  if (isNaN(lessonId)) {
    res.status(400).json({ error: "Invalid lessonId" });
    return;
  }

  const lesson = getLesson(lessonId);
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const completedCount = await db.select({ cnt: count() })
    .from(sessionsTable)
    .where(eq(sessionsTable.gameId, `lesson-${lesson.id}`));

  res.json({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    order: lesson.order,
    estimatedMinutes: lesson.estimatedMinutes,
    targetKeys: lesson.targetKeys,
    content: lesson.content,
    completedBy: completedCount[0]?.cnt ?? 0,
  });
});

export default router;
