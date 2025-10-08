import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    snippetId: { type: String },
    language: { type: String },
    code: { type: String, required: true },
    review: { type: String, required: true },
    provider: { type: String },
    model: { type: String },
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', ReviewSchema);
