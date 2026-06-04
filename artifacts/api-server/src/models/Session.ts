import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  gameId: string;
  gameMode: string;
  wpm: number;
  accuracy: number;
  duration: number;
  level: number;
  score: number | null;
  letterErrors: string | null;
  completedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gameId: { type: String, required: true },
    gameMode: { type: String, required: true },
    wpm: { type: Number, required: true, min: 0 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    duration: { type: Number, required: true, min: 0 },
    level: { type: Number, required: true, default: 1 },
    score: { type: Number, default: null },
    letterErrors: { type: String, default: null },
    completedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

SessionSchema.index({ userId: 1, completedAt: -1 });
SessionSchema.index({ wpm: -1 });

export const Session: Model<ISession> = mongoose.models.Session ?? mongoose.model<ISession>("Session", SessionSchema);
