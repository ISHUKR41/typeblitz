import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, comparePassword, signToken } from "../lib/auth.js";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existing.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ username, passwordHash }).returning();
  const token = signToken({ userId: user.id, username: user.username });
  res.status(201).json({
    token,
    user: {
      id: String(user.id),
      username: user.username,
      createdAt: user.createdAt,
      totalSessions: 0,
      bestWpm: null,
      currentLevel: 1,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ userId: user.id, username: user.username });
  res.json({
    token,
    user: {
      id: String(user.id),
      username: user.username,
      createdAt: user.createdAt,
      totalSessions: null,
      bestWpm: null,
      currentLevel: null,
    },
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ success: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { verifyToken } = await import("../lib/auth.js");
    const payload = verifyToken(authHeader.slice(7));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({
      id: String(user.id),
      username: user.username,
      createdAt: user.createdAt,
      totalSessions: null,
      bestWpm: null,
      currentLevel: null,
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
