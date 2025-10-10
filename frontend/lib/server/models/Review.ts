import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    line: { type: Number, default: 0 },
    level: { type: String, enum: ['bug','performance','readability','security','info'], default: 'info' },
    message: { type: String, required: true },
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    snippetId: { type: String },
    language: { type: String },
    code: { type: String, required: true },
    review: { type: String, required: true },
    summary: { type: String },
    comments: { type: [CommentSchema], default: [] },
    improvedSnippet: { type: String },
    provider: { type: String, default: 'gemini' },
    model: { type: String },
  },
  { timestamps: true }
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model('Review', ReviewSchema);
