import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/server/db';
import { HistoryModel } from '@/lib/server/models/History';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const doc = await HistoryModel.findById(params.id);
  if (!doc || doc.deletedAt) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    id: String(doc._id),
    language: doc.language,
    code: doc.code,
    review: doc.review,
    summary: doc.summary,
    comments: doc.comments,
    improvedSnippet: doc.improvedSnippet,
    createdAt: doc.createdAt,
    model: doc.model,
    provider: doc.provider,
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const doc = await HistoryModel.findById(params.id);
  if (!doc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  if (!doc.deletedAt) { doc.deletedAt = new Date(); await doc.save(); }
  return NextResponse.json({ ok: true, id: String(doc._id) });
}
