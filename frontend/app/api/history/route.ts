import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/server/db';
import { HistoryModel } from '@/lib/server/models/History';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
  const skip = Math.max(Number(searchParams.get('skip') ?? 0), 0);
  const language = searchParams.get('language')?.trim() || '';
  const includeCode = searchParams.get('includeCode') === '1';

  const filter: Record<string, unknown> = { deletedAt: null };
  if (language) filter.language = language;

  const [items, total] = await Promise.all([
    HistoryModel.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .select(['_id','language', includeCode ? 'code' : undefined,
               'summary','review','createdAt','model','provider']
        .filter(Boolean).join(' '))
      .lean(),
    HistoryModel.countDocuments(filter),
  ]);

  return NextResponse.json({
    total,
    count: items.length,
    items: items.map((h) => ({
      id: String(h._id),
      language: h.language,
      summary: h.summary || h.review?.slice(0, 200) || '',
      code: includeCode ? h.code : undefined,
      createdAt: h.createdAt,
      model: h.model,
      provider: h.provider,
    })),
  });
}

export async function DELETE() {
  await connectDB();
  const r = await HistoryModel.updateMany({ deletedAt: null }, { $set: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true, updated: r.modifiedCount ?? 0 });
}
