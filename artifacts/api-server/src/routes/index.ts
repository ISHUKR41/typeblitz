import { Router } from "express";
import authRouter from "./auth.js";
import gamesRouter from "./games.js";
import sessionsRouter from "./sessions.js";
import usersRouter from "./users.js";
import lessonsRouter from "./lessons.js";
import leaderboardRouter from "./leaderboard.js";
import practiceRouter from "./practice.js";

const router = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

router.use(authRouter);
router.use(gamesRouter);
router.use(sessionsRouter);
router.use(usersRouter);
router.use(lessonsRouter);
router.use(leaderboardRouter);
router.use(practiceRouter);

export default router;
