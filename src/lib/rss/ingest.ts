/**
 * RSS News Ingestion
 * ==================
 * Fetches articles from configured public RSS feeds, deduplicates them,
 * categorises them with keyword matching, and returns structured items
 * ready for the scoring engine and database.
 *
 * Design constraints:
 *  - No paid APIs.
 *  - Every article must be traceable to its source URL.
 *  - Never fabricate missing information — use null when unavailable.
 *  - Article links are always preserved and visible.
 */

import Parser from "rss-parser";
import { getActiveFeeds, type FeedConfig } from "./feeds";
import { createHash } from "crypto";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface IngestedArticle {
  externalId: string;         // SHA-256 of the link (dedupe key)
  headline: string;
  source: string;             // Feed name
  sourceUrl: string;          // Original article URL
  publishedAt: string;        // ISO 8601
  category: FeedConfig["defaultCategory"];
  summary: string;
  feedSource: string;         // Feed URL for auditing
  lang: "fr" | "en";
}

// ─── Category detection from headline / summary keywords ───────────────────────

const CATEGORY_KEYWORDS: Record<string, FeedConfig["defaultCategory"]> = {
  // M&A
  acquisition: "M&A",
  acquiert: "M&A",
  rachat: "M&A",
  merger: "M&A",
  fusion: "M&A",
  takeover: "M&A",
  "offre publique": "M&A",
  opa: "M&A",
  cession: "M&A",

  // Financing
  financement: "Financing",
  emprunt: "Financing",
  loan: "Financing",
  credit: "Financing",
  "dette privée": "Financing",
  refinancing: "Financing",
  refinancement: "Financing",
  "bond issuance": "Financing",
  obligation: "Financing",
  "levée de fonds": "Financing",

  // Regulatory
  régulation: "Regulatory",
  réglementation: "Regulatory",
  regulatory: "Regulatory",
  amf: "Regulatory",
  compliance: "Regulatory",
  sanction: "Regulatory",

  // Earnings
  résultats: "Earnings",
  bénéfice: "Earnings",
  chiffre: "Earnings",
  earnings: "Earnings",
  revenue: "Earnings",
  "quarterly results": "Earnings",
  profit: "Earnings",

  // Management
  "directeur général": "Management",
  ceo: "Management",
  nomination: "Management",
  "board of directors": "Management",
  "conseil d'administration": "Management",
  démission: "Management",

  // Restructuring
  restructuration: "Restructuring",
  restructuring: "Restructuring",
  "plan social": "Restructuring",
  sauvegarde: "Restructuring",
  redressement: "Restructuring",
  insolvency: "Restructuring",

  // IPO
  introduction: "IPO",
  ipo: "IPO",
  "entrée en bourse": "IPO",

  // Infrastructure
  infrastructure: "Infrastructure",
  concession: "Infrastructure",
  "projet d'investissement": "Infrastructure",

  // Credit
  notation: "Credit",
  rating: "Credit",
  "credit rating": "Credit",
  downgrade: "Credit",
  upgrade: "Credit",
};

function detectCategory(
  text: string,
  defaultCat: FeedConfig["defaultCategory"],
): FeedConfig["defaultCategory"] {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  return defaultCat;
}

// ─── Dedupe key ────────────────────────────────────────────────────────────────

function makeExternalId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 32);
}

// ─── Main ingestion ────────────────────────────────────────────────────────────

const parser = new Parser({
  timeout: 10_000,
  headers: {
    "User-Agent": "BDGS-ClientRadar/1.0 (news aggregator)",
  },
});

/**
 * Fetch articles from all active RSS feeds.
 * Returns deduplicated articles sorted by date (newest first).
 * Silently skips feeds that fail (logs a warning).
 */
export async function ingestAllFeeds(): Promise<IngestedArticle[]> {
  const activeFeeds = getActiveFeeds();
  const seen = new Set<string>();
  const articles: IngestedArticle[] = [];

  const results = await Promise.allSettled(
    activeFeeds.map((feed) => ingestOneFeed(feed)),
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const article of result.value) {
        if (!seen.has(article.externalId)) {
          seen.add(article.externalId);
          articles.push(article);
        }
      }
    }
    // Rejected feeds are already logged inside ingestOneFeed
  }

  // Sort newest first
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return articles;
}

async function ingestOneFeed(feed: FeedConfig): Promise<IngestedArticle[]> {
  try {
    const rss = await parser.parseURL(feed.url);
    const items: IngestedArticle[] = [];

    for (const item of rss.items ?? []) {
      const link = item.link ?? item.guid;
      if (!link) continue; // Skip items without a source URL

      const headline = item.title?.trim();
      if (!headline) continue;

      const publishedAt = item.isoDate ?? item.pubDate ?? null;
      if (!publishedAt) continue;

      const summary =
        item.contentSnippet?.trim() ??
        item.content?.replace(/<[^>]+>/g, "").trim().slice(0, 500) ??
        "";

      const textForCategorisation = `${headline} ${summary}`;

      items.push({
        externalId: makeExternalId(link),
        headline,
        source: feed.name,
        sourceUrl: link,
        publishedAt: new Date(publishedAt).toISOString(),
        category: detectCategory(textForCategorisation, feed.defaultCategory),
        summary: summary.slice(0, 500),
        feedSource: feed.url,
        lang: feed.lang,
      });
    }

    return items;
  } catch (err) {
    console.warn(
      `[BDGS] Failed to fetch feed "${feed.name}" (${feed.url}):`,
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
