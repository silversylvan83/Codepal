import { Schema, model, Types } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, index: true },
  name: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

export type UserDoc = {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  passwordHash?: string;
};

export default model('User', UserSchema);
