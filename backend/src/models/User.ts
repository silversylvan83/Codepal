import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    // hash, roles, etc.
  },
  { timestamps: true }
);

export type IUser = mongoose.InferSchemaType<typeof UserSchema>;
export const User = mongoose.model('User', UserSchema);
