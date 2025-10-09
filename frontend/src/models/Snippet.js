// src/models/Snippet.js
import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    language: { type: String },
    code: { type: String, required: true },
    title: { type: String },
  },
  { timestamps: true }
);

// Hot-reload safe export (prevents OverwriteModelError)
export const Snippet =
  mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);
