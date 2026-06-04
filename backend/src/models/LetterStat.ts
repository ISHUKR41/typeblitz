import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILetterStat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  letter: string;
  attempts: number;
  correct: number;
}

const LetterStatSchema = new Schema<ILetterStat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    letter: { type: String, required: true, maxlength: 1 },
    attempts: { type: Number, required: true, default: 0 },
    correct: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

LetterStatSchema.index({ userId: 1, letter: 1 }, { unique: true });

export const LetterStat: Model<ILetterStat> = mongoose.models.LetterStat ?? mongoose.model<ILetterStat>("LetterStat", LetterStatSchema);
