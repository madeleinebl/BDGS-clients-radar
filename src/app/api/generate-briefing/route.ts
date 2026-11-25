/**
 * POST /api/generate-briefing
 * ===========================
 * Generates a daily briefing by synthesizing:
 * - Articles ingested in the last 24h (or 7 days for weekly)
 * - Deals detected/updated recently
 *
 * No LLM required — this is a structured summary built from DB data.
 * All information comes from public sources only.
 */

import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { connection } from "next/server";

export async function POST(request: Request) {
  await connection();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase non configuré" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const type: "daily" | "weekly" = body.type === "weekly" ? "weekly" : "daily";

    const { createServerClient } = await import("@/lib/supabase/server");
    const db = createServerClient();

    // Date range based on briefing type
    const since = new Date();
    since.setDate(since.getDate() - (type === "weekly" ? 7 : 1));
    const sinceISO = since.toISOString();

    // Fetch recent articles and deals in parallel
    const [articlesResult, dealsResult] = await Promise.all([
      db
        .from("news_articles")
        .select("id, headline, source, category, published_at, summary")
        .gte("published_at", sinceISO)
        .order("published_at", { ascending: false })
        .limit(50),
      db
        .from("deals")
        .select("id, name, deal_type, status, company_id, amount, currency, announcement_date")
        .gte("announcement_date", since.toISOString().slice(0, 10))
        .order("announcement_date", { ascending: false })
        .limit(20),
    ]);

    const articles = (articlesResult.data ?? []) as Array<{
      id: string;
      headline: string;
      source: string;
      category: string;
      published_at: string;
      summary: string | null;
    }>;

    const deals = (dealsResult.data ?? []) as Array<{
      id: string;
      name: string;
      deal_type: string;
      status: string;
      company_id: string;
      amount: number | null;
      currency: string;
      announcement_date: string;
    }>;

    if (articles.length === 0 && deals.length === 0) {
      return NextResponse.json({
        status: "empty",
        message: "Aucun article ni deal récent à synthétiser.",
      });
    }

    // Build category breakdown
    const catCounts: Record<string, number> = {};
    for (const a of articles) {
      const cat = a.category || "Other";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    const catSummary = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat} (${count})`)
      .join(", ");

    // Build deal type breakdown
    const dealTypeCounts: Record<string, number> = {};
    for (const d of deals) {
      dealTypeCounts[d.deal_type] = (dealTypeCounts[d.deal_type] || 0) + 1;
    }

    // Generate title
    const now = new Date();
    const dateLabel = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const title = type === "daily"
      ? `Briefing quotidien — ${dateLabel}`
      : `Briefing hebdomadaire — Semaine du ${since.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;

    // Generate summary
    const summaryParts: string[] = [];
    if (articles.length > 0) {
      summaryParts.push(
        `${articles.length} article${articles.length > 1 ? "s" : ""} ingéré${articles.length > 1 ? "s" : ""} : ${catSummary}.`,
      );
    }
    if (deals.length > 0) {
      const dealTypeStr = Object.entries(dealTypeCounts)
        .map(([t, c]) => `${c} ${t}`)
        .join(", ");
      summaryParts.push(
        `${deals.length} deal${deals.length > 1 ? "s" : ""} détecté${deals.length > 1 ? "s" : ""} : ${dealTypeStr}.`,
      );
    }

    // Generate highlights
    const highlights: string[] = [];

    // Top deal highlights
    for (const d of deals.slice(0, 5)) {
      const statusLabels: Record<string, string> = {
        rumoured: "Rumeur",
        announced: "Annoncé",
        in_progress: "En cours",
        closed: "Clôturé",
        cancelled: "Annulé",
      };
      let hl = `${d.name}`;
      if (d.amount) {
        const symbol = d.currency === "EUR" ? "€" : d.currency === "USD" ? "$" : d.currency;
        hl += ` — ${symbol}${d.amount}M`;
      }
      hl += ` (${statusLabels[d.status] ?? d.status})`;
      highlights.push(hl);
    }

    // Top article headlines by category
    const seenCats = new Set<string>();
    for (const a of articles) {
      if (highlights.length >= 10) break;
      const cat = a.category || "Other";
      if (!seenCats.has(cat)) {
        seenCats.add(cat);
        highlights.push(`[${cat}] ${a.headline}`);
      }
    }

    // Insert briefing
    const articleIds = articles.slice(0, 30).map((a) => a.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (db.from("briefings") as any).insert({
      title,
      type,
      summary: summaryParts.join(" "),
      highlights,
      article_ids: articleIds,
      article_count: articles.length,
      generated_at: now.toISOString(),
    }).select("id").single();

    if (insertError) {
      console.error("[BDGS] Insert briefing error:", insertError);
      return NextResponse.json(
        { error: `Erreur lors de la création du briefing: ${insertError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      briefingId: inserted?.id,
      title,
      articleCount: articles.length,
      dealCount: deals.length,
      highlightCount: highlights.length,
    });
  } catch (err) {
    console.error("[BDGS] Generate briefing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return POST(new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({ type: "daily" }),
  }));
}
