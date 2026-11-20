/**
 * POST /api/ingest
 * ================
 * Triggers RSS feed ingestion.
 *
 * When Supabase is configured: fetches articles, scores them, and upserts
 * into the database (skipping duplicates via external_id).
 *
 * When Supabase is not configured: returns the ingested articles as JSON
 * for preview / debugging purposes.
 *
 * This endpoint is designed to be called by a cron job (e.g. Vercel Cron)
 * or manually from the Settings page.
 */

import { NextResponse } from "next/server";
import { ingestAllFeeds } from "@/lib/rss/ingest";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

export async function POST() {
  try {
    const articles = await ingestAllFeeds();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        status: "preview",
        message:
          "Supabase not configured — showing ingested articles without saving.",
        count: articles.length,
        articles: articles.slice(0, 20), // Limit preview
      });
    }

    // When Supabase IS configured, upsert articles
    const { createServerClient } = await import("@/lib/supabase/server");
    const db = createServerClient();

    type NewsInsert = Database["public"]["Tables"]["news_articles"]["Insert"];
    const rows: NewsInsert[] = articles.map((article) => ({
      external_id: article.externalId,
      headline: article.headline,
      source: article.source,
      source_url: article.sourceUrl,
      published_at: article.publishedAt,
      category: article.category as "M&A" | "Financing" | "Regulatory" | "Earnings" | "Management" | "Restructuring" | "IPO" | "Infrastructure" | "Credit" | "Other",
      summary: article.summary || null,
      feed_source: article.feedSource,
      scoring_version: "1.0.0",
    }));

    // Batch upsert in chunks of 50
    let inserted = 0;
    let skipped = 0;
    const CHUNK = 50;

    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error, count } = await (db.from("news_articles") as any)
        .upsert(chunk, { onConflict: "external_id", ignoreDuplicates: true });

      if (error) {
        console.warn(`[BDGS] Upsert chunk error: ${error.message}`);
        skipped += chunk.length;
      } else {
        inserted += count ?? chunk.length;
      }
    }

    return NextResponse.json({
      status: "ok",
      fetched: articles.length,
      inserted,
      skipped,
    });
  } catch (err) {
    console.error("[BDGS] Ingestion error:", err);
    return NextResponse.json(
      { status: "error", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// Also support GET for easy browser / cron testing
export async function GET() {
  return POST();
}
