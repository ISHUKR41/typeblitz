import { Router } from "express";
import { User } from "../models/index.js";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "../lib/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || typeof username !== "string" || username.length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await User.findOne({ username: username.trim() }).lean();
  if (existing) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username: username.trim(), passwordHash });

  const token = generateToken(user._id.toString(), user.username);
  res.status(201).json({
    user: { id: user._id.toString(), username: user.username, createdAt: user.createdAt },
    token,
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const user = await User.findOne({ username: username.trim() });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user._id.toString(), user.username);
  res.json({
    user: { id: user._id.toString(), username: user.username, createdAt: user.createdAt },
    token,
  });
});

router.post("/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const user = await User.findById(payload.userId).lean();
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({ id: user._id.toString(), username: user.username, createdAt: user.createdAt });
});

export default router;
