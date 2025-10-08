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

export type ISnippet = mongoose.InferSchemaType<typeof SnippetSchema>;
export const Snippet = mongoose.model('Snippet', SnippetSchema);
