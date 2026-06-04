import { Router, type IRouter } from "express";
import { getConnectionStatus } from "../lib/db.js";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", db: getConnectionStatus() ? "connected" : "disconnected" });
});

export default router;
