import mongoose from "mongoose";
import { logger } from "./logger.js";

const MONGODB_URI = process.env.MONGODB_URI || "";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  if (!MONGODB_URI) {
    logger.warn("MONGODB_URI not set — running without database. Set MONGODB_URI to enable persistence.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
