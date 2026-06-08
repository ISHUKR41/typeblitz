import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import gamesRouter from "./games.js";
import sessionsRouter from "./sessions.js";
import lessonsRouter from "./lessons.js";
import leaderboardRouter from "./leaderboard.js";
import challengeRouter from "./challenge.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/games", gamesRouter);
router.use("/sessions", sessionsRouter);
router.use("/lessons", lessonsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/challenge", challengeRouter);
router.use("/practice", sessionsRouter);

export default router;
