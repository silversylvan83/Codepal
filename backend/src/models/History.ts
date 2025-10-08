// src/models/History.ts
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
    // optional user scoping (enable later if you add auth)
    userId: { type: String },

    // logical linkage (optional): which snippet or review this came from
    snippetId: { type: String },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },

    // snapshot fields (immutable snapshot of what user saw)
    language: { type: String },
    code: { type: String, required: true },

    // raw + parsed review snapshot
    review: { type: String, required: true },      // raw markdown / text
    summary: { type: String },
    comments: { type: [CommentSchema], default: [] },
    improvedSnippet: { type: String },

    // runtime metadata
    provider: { type: String, default: 'gemini' },
    model: { type: String },

    // for UI filtering / bookkeeping
    tags: { type: [String], default: [] },
    // soft-delete support
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Useful indexes
HistorySchema.index({ createdAt: -1 });
HistorySchema.index({ language: 1, createdAt: -1 });
HistorySchema.index({ userId: 1, createdAt: -1 }); // if user scoping later
HistorySchema.index({ snippetId: 1 });
HistorySchema.index({ reviewId: 1 });

export const History =
  mongoose.models.History || mongoose.model('History', HistorySchema);
