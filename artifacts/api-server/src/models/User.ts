import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
