import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/server/db";
import { HistoryModel } from "@/lib/server/models/History";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewLevel = "bug" | "performance" | "readability" | "security" | "info";

type HistoryComment = {
  line: number;
  level: ReviewLevel;
  message: string;
};

type HistoryLean = {
  _id: unknown;
  language?: string | null;
  code?: string | null;
  review?: string | null;
  summary?: string | null;
  comments?: HistoryComment[];
  improvedSnippet?: string | null;
  createdAt: Date;
  model?: string | null;
  provider?: string | null;
  deletedAt?: Date | null;
};

type Params = { id: string };

// GET /api/history/:id
export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params; // Next 15: params is a Promise
  await connectDB();

  const doc = await HistoryModel.findById(id).lean<HistoryLean>().exec();
  if (!doc || doc.deletedAt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: String(doc._id),
    language: doc.language ?? null,
    code: doc.code ?? null,
    review: doc.review ?? null,
    summary: doc.summary ?? null,
    comments: Array.isArray(doc.comments) ? doc.comments : [],
    improvedSnippet: doc.improvedSnippet ?? null,
    createdAt: doc.createdAt,
    model: doc.model ?? null,
    provider: doc.provider ?? null,
  });
}

// DELETE /api/history/:id
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;
  await connectDB();

  const doc = await HistoryModel.findById(id).exec();
  if (!doc) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }

  if (!doc.get("deletedAt")) {
    doc.set("deletedAt", new Date());
    await doc.save();
  }

  return NextResponse.json({ ok: true, id: String(doc._id) });
}
