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
import { detectDeals, type ArticleInput } from "@/lib/deal-detector";
import { insertDetectedDeals } from "@/lib/deal-inserter";
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

    // ── Phase 2: Detect deals from newly ingested articles ──────────────
    let dealResult = { inserted: 0, skipped: 0, updated: 0, details: [] as string[] };

    try {
      // Fetch monitored companies
      const { data: companiesRaw } = await db.from("companies").select("*");
      const companies = (companiesRaw ?? []) as Array<{ id: string; name: string }>;

      if (companies.length > 0 && articles.length > 0) {
        // Convert ingested articles to ArticleInput format
        const articleInputs: ArticleInput[] = articles.map((a) => ({
          headline: a.headline,
          summary: a.summary || "",
          sourceUrl: a.sourceUrl,
          source: a.source,
          publishedAt: a.publishedAt,
        }));

        const detectedDeals = detectDeals(articleInputs, companies);
        console.log(`[BDGS] Deal detection: ${detectedDeals.length} deals detected from ${articles.length} articles`);

        if (detectedDeals.length > 0) {
          dealResult = await insertDetectedDeals(db, detectedDeals);
          console.log(`[BDGS] Deal insertion: ${dealResult.inserted} new, ${dealResult.updated} updated, ${dealResult.skipped} skipped`);
        }
      }
    } catch (dealErr) {
      console.error("[BDGS] Deal detection error:", dealErr);
      // Don't fail the whole ingest — article ingestion already succeeded
    }

    return NextResponse.json({
      status: "ok",
      fetched: articles.length,
      articles_inserted: inserted,
      articles_skipped: skipped,
      deals_detected: dealResult.inserted + dealResult.updated + dealResult.skipped,
      deals_inserted: dealResult.inserted,
      deals_updated: dealResult.updated,
      deals_skipped: dealResult.skipped,
      deal_details: dealResult.details,
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
