import { Router } from "express";
import mongoose from "mongoose";
import { Session, User } from "../models/index.js";
import { getConnectionStatus } from "../lib/db.js";

const router = Router();

router.get("/", async (req, res) => {
  const gameId = typeof req.query.gameId === "string" ? req.query.gameId : undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

  if (!getConnectionStatus()) {
    res.json([]);
    return;
  }

  const matchStage: Record<string, any> = {
    accuracy: { $gte: 90 }
  };
  if (gameId) matchStage.gameId = gameId;

  // Get best session per user (or per user+game if filtered)
  const pipeline: mongoose.PipelineStage[] = [
    { $match: matchStage },
    { $sort: { wpm: -1 } },
    {
      $group: {
        _id: gameId ? { userId: "$userId", gameId: "$gameId" } : "$userId",
        userId: { $first: "$userId" },
        gameId: { $first: "$gameId" },
        wpm: { $max: "$wpm" },
        accuracy: { $first: "$accuracy" },
        completedAt: { $first: "$completedAt" },
      }
    },
    { $sort: { wpm: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      }
    },
    { $unwind: "$user" },
  ];

  const results = await Session.aggregate(pipeline);

  const entries = results.map((r, i) => ({
    rank: i + 1,
    userId: r.userId.toString(),
    username: r.user.username,
    wpm: r.wpm,
    accuracy: r.accuracy,
    gameId: r.gameId,
    achievedAt: r.completedAt,
  }));

  res.json(entries);
});

export default router;
