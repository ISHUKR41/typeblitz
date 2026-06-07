import { Router } from "express";
import { GAMES, getGame, getLevel, shuffleArray } from "../data/games.js";

const router = Router();

router.get("/games", async (_req, res): Promise<void> => {
  const games = GAMES.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    icon: g.icon,
    difficulty: g.difficulty,
    levels: g.levels.map(l => ({
      id: l.id,
      number: l.number,
      name: l.name,
      description: l.description,
      targetWpm: l.targetWpm,
      targetAccuracy: l.targetAccuracy,
      duration: l.duration,
      wordCount: l.wordCount,
    })),
  }));
  res.json(games);
});

router.get("/games/:gameId", async (req, res): Promise<void> => {
  const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
  const game = getGame(gameId);
  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return;
  }
  res.json({
    id: game.id,
    name: game.name,
    description: game.description,
    category: game.category,
    icon: game.icon,
    difficulty: game.difficulty,
    levels: game.levels.map(l => ({
      id: l.id,
      number: l.number,
      name: l.name,
      description: l.description,
      targetWpm: l.targetWpm,
      targetAccuracy: l.targetAccuracy,
      duration: l.duration,
      wordCount: l.wordCount,
    })),
  });
});

router.get("/games/:gameId/levels/:levelId/words", async (req, res): Promise<void> => {
  const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
  const rawId = Array.isArray(req.params.levelId) ? req.params.levelId[0] : req.params.levelId;
  const levelId = parseInt(rawId, 10);

  if (isNaN(levelId)) {
    res.status(400).json({ error: "Invalid level ID" });
    return;
  }

  const level = getLevel(gameId, levelId);
  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  const words = level.words.length > 0 ? shuffleArray(level.words) : [];

  res.json({
    levelId: level.id,
    gameId,
    words,
    text: level.text ?? null,
  });
});

export default router;
