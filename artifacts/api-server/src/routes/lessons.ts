import { Router } from "express";
import { LESSONS, getLesson } from "../data/lessons.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(LESSONS);
});

router.get("/:lessonId", (req, res) => {
  const id = parseInt(req.params.lessonId);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid lessonId" }); return; }
  const lesson = getLesson(id);
  if (!lesson) { res.status(404).json({ error: "Lesson not found" }); return; }
  res.json(lesson);
});

export default router;
