import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";
import { connectDB } from "@/lib/server/db";
import { reviewCodeLLM } from "@/lib/server/llm";
import { improveCodeLLM } from "@/lib/server/llm/improve";
import { parseGeminiReview } from "@/lib/server/utils/parseGeminiReview";
import { ReviewModel } from "@/lib/server/models/Review";
import { HistoryModel } from "@/lib/server/models/History";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// Types to avoid `any`
type ReviewLevel = "bug" | "performance" | "readability" | "security" | "info";
type ReviewComment = { line: number; level: ReviewLevel; message: string };

// Narrowing helper for error objects
function errorMessage(e: unknown): string {
  if (typeof e === "string") return e;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      code?: string;
      language?: string;
      snippetId?: string;
      save?: boolean;
    };

    const { code, language, snippetId, save = true } = body ?? {};
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: 'Missing "code"' }, { status: 400 });
    }

    // Start an improvement in parallel; fall back to original code on error.
    const improvePromise = improveCodeLLM({
      code,
      language,
      model: env.LLM_MODEL,
      apiKey: env.GEMINI_API_KEY,
    }).catch(() => code);

    // Primary review (may timeout/throw)
    let reviewText = "";
    try {
      reviewText = await reviewCodeLLM({ code, language });
    } catch {
      const improved = await improvePromise;
      return NextResponse.json({
        review: "Timed out; returning improved snippet.",
        summary: "",
        comments: [] as ReviewComment[],
        improvedSnippet: improved,
        id: null,
        saved: false,
      });
    }

    // Parse the review to summary/comments/snippet (best-effort)
    let summary = "";
    let comments: ReviewComment[] = [];
    let improvedSnippet = "";
    try {
      const parsed = parseGeminiReview(reviewText);
      summary = parsed.summary ?? "";

      // Normalize & validate comments
      if (Array.isArray(parsed.comments)) {
        const allowed: ReadonlyArray<ReviewLevel> = [
          "bug",
          "performance",
          "readability",
          "security",
          "info",
        ];
        comments = parsed.comments.map((c) => {
          const line = Number((c as { line?: unknown })?.line ?? 0);
          const levelRaw = String(
            (c as { level?: unknown })?.level ?? "info"
          ).toLowerCase();
          const level = (
            allowed.includes(levelRaw as ReviewLevel) ? levelRaw : "info"
          ) as ReviewLevel;
          const message = String(
            (c as { message?: unknown })?.message ?? ""
          ).trim();
          return { line: Number.isFinite(line) ? line : 0, level, message };
        });
      }

      improvedSnippet = parsed.improvedSnippet ?? "";
    } catch {
      // ignore parse failures; we’ll still return reviewText + improved snippet
    }

    if (!improvedSnippet) {
      improvedSnippet = await improvePromise;
    }

    // Optional persistence
    let reviewDocId: string | null = null;
    if (save) {
      await connectDB();

      const reviewDoc = await new ReviewModel({
        snippetId: snippetId || undefined,
        language,
        code,
        review: reviewText,
        summary,
        comments,
        improvedSnippet,
        provider: env.LLM_PROVIDER,
        model: env.LLM_MODEL,
      }).save();

      reviewDocId = reviewDoc._id.toString();

      // best-effort history save (don't block user response if it fails)
      try {
        await new HistoryModel({
          snippetId: snippetId || undefined,
          reviewId: reviewDocId || undefined,
          language,
          code,
          review: reviewText,
          summary,
          comments,
          improvedSnippet,
          provider: env.LLM_PROVIDER,
          model: env.LLM_MODEL,
        }).save();
      } catch {
        // log if you want, but don't fail the request
      }
    }

    return NextResponse.json({
      review: reviewText,
      summary,
      comments,
      improvedSnippet,
      id: reviewDocId,
      saved: Boolean(reviewDocId),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Failed to review code", details: errorMessage(e) },
      { status: 500 }
    );
  }
}
