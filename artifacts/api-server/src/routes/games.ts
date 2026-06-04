import { Router } from "express";
import { GAMES, getGame } from "../data/games.js";
import { getWordsForLevel } from "../data/words.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(GAMES);
});

router.get("/:gameId", (req, res) => {
  const game = getGame(req.params.gameId);
  if (!game) { res.status(404).json({ error: "Game not found" }); return; }
  res.json(game);
});

router.get("/:gameId/levels/:levelId/words", (req, res) => {
  const gameId = req.params.gameId;
  const levelId = parseInt(req.params.levelId);
  if (isNaN(levelId)) { res.status(400).json({ error: "Invalid levelId" }); return; }

  const game = getGame(gameId);
  if (!game) { res.status(404).json({ error: "Game not found" }); return; }

  const level = game.levels.find(l => l.id === levelId || l.number === levelId);
  if (!level) { res.status(404).json({ error: "Level not found" }); return; }

  const words = getWordsForLevel(gameId, level.number);

  const text = Array.isArray(words) && words.length > 0 && words[0].includes(" ")
    ? words[0]
    : null;

  res.json({
    levelId: level.id,
    gameId,
    words: Array.isArray(words) ? words : [words],
    text
  });
});

export default router;
