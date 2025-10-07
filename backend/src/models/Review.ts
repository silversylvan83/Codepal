import { Schema, model, Types } from 'mongoose';

const ReviewSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  snippetId: { type: Schema.Types.ObjectId, ref: 'Snippet', index: true },
  language: String,
  model: String,
  summary: String,
  comments: [{ line: Number, level: { type: String, enum: ['info','warn','error'], default: 'info' }, message: String }],
  patch: String,
  createdAt: { type: Date, default: Date.now }
});

export type ReviewDoc = {
  _id: Types.ObjectId;
  snippetId?: Types.ObjectId;
  language?: string;
  model: string;
  summary: string;
  comments: { line: number; level: 'info'|'warn'|'error'; message: string }[];
  patch: string;
};

export default model('Review', ReviewSchema);
