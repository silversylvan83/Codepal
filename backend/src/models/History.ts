import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    line: { type: Number, default: 0 },
    level: { type: String, enum: ['bug','performance','readability','security','info'], default: 'info' },
    message: { type: String, required: true },
  },
  { _id: false }
);

const HistorySchema = new mongoose.Schema(
  {
    userId: { type: String },
    snippetId: { type: String },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    language: { type: String },
    code: { type: String, required: true },
    review: { type: String, required: true },      
    summary: { type: String },
    comments: { type: [CommentSchema], default: [] },
    improvedSnippet: { type: String },
    provider: { type: String, default: 'gemini' },
    model: { type: String },
    tags: { type: [String], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Useful indexes
HistorySchema.index({ createdAt: -1 });
HistorySchema.index({ language: 1, createdAt: -1 });
HistorySchema.index({ userId: 1, createdAt: -1 }); 
HistorySchema.index({ snippetId: 1 });
HistorySchema.index({ reviewId: 1 });

export const History =
  mongoose.models.History || mongoose.model('History', HistorySchema);
