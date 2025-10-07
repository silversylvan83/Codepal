import { Schema, model, Types } from 'mongoose';

const SnippetSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  language: { type: String, index: true },
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

export type SnippetDoc = {
  _id: Types.ObjectId;
  ownerId?: Types.ObjectId;
  language?: string;
  title?: string;
  content: string;
};

export default model('Snippet', SnippetSchema);
