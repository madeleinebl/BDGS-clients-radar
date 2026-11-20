/**
 * Data access layer
 * =================
 * When Supabase is configured (env vars present), reads from the database.
 * Otherwise falls back to sample-data.ts so the app works without a DB.
 *
 * All data returned represents publicly sourced information only.
 */

import { supabase, isSupabaseConfigured } from "./client";
import {
  companies as sampleCompanies,
  newsArticles as sampleNews,
  deals as sampleDeals,
  opportunities as sampleOpportunities,
  briefings as sampleBriefings,
  watchlistItems as sampleWatchlist,
  getCompanyById as sampleGetCompanyById,
  getCompanyName as sampleGetCompanyName,
  getNewsByCompany as sampleGetNewsByCompany,
  getDealsByCompany as sampleGetDealsByCompany,
  getOpportunitiesByCompany as sampleGetOpportunitiesByCompany,
} from "@/data/sample-data";
import type {
  Company,
  NewsArticle,
  Deal,
  Opportunity,
  Briefing,
  WatchlistItem,
} from "@/data/sample-data";

// Re-export types for convenience
export type { Company, NewsArticle, Deal, Opportunity, Briefing, WatchlistItem };

// ─── Helper: snake_case DB row → camelCase app type ────────────────────────────

function mapCompany(row: Record<string, unknown>): Company {
  return {
    id: row.id as string,
    name: row.name as string,
    sector: row.sector as string,
    country: row.country as string,
    website: (row.website as string) ?? "",
    description: (row.description as string) ?? "",
    isPublic: row.is_public as boolean,
    ticker: row.ticker as string | undefined,
    exchange: row.exchange as string | undefined,
    dealCount: row.deal_count as number,
    latestNewsDate: (row.latest_news_date as string) ?? "",
    watchlisted: row.watchlisted as boolean,
    monitoringStatus: row.monitoring_status as Company["monitoringStatus"],
    priority: row.priority as Company["priority"],
  };
}

function mapNewsArticle(
  row: Record<string, unknown>,
  companyIds: string[] = [],
): NewsArticle {
  return {
    id: row.id as string,
    headline: row.headline as string,
    source: row.source as string,
    sourceUrl: row.source_url as string,
    publishedAt: row.published_at as string,
    companyIds,
    category: row.category as NewsArticle["category"],
    summary: (row.summary as string) ?? "",
    relevanceScore: (row.relevance_override as number) ?? (row.relevance_score as number) ?? 0,
    opportunityScore: (row.opportunity_override as number) ?? (row.opportunity_score as number) ?? 0,
    isRead: row.is_read as boolean,
    watchlisted: row.watchlisted as boolean,
  };
}

function mapDeal(row: Record<string, unknown>): Deal {
  return {
    id: row.id as string,
    name: row.name as string,
    companyId: row.company_id as string,
    dealType: row.deal_type as Deal["dealType"],
    counterparty: row.counterparty as string | undefined,
    amount: row.amount as number | undefined,
    currency: row.currency as string,
    status: row.status as Deal["status"],
    announcementDate: row.announcement_date as string,
    closingDate: row.closing_date as string | undefined,
    lastUpdated: row.last_updated as string,
    source: row.source as string,
    sourceUrl: (row.source_url as string) ?? "",
    summary: (row.summary as string) ?? "",
    buyers: (row.buyers as string[]) ?? [],
    sellers: (row.sellers as string[]) ?? [],
    advisors: (row.advisors as string[]) ?? [],
    watchlisted: false, // Computed from watchlist_items
  };
}

function mapOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    headline: row.headline as string,
    companyId: row.company_id as string,
    sourceArticleId: (row.source_article_id as string) ?? "",
    signalType: row.signal_type as Opportunity["signalType"],
    confidence: row.confidence as Opportunity["confidence"],
    status: row.status as Opportunity["status"],
    detectedAt: row.detected_at as string,
    hypothesis: row.hypothesis as string,
    relevanceScore: 0,
    opportunityScore: (row.opportunity_score as number) ?? 0,
    practiceAreas: (row.practice_areas as string[]) ?? [],
    watchlisted: false,
  };
}

function mapBriefing(row: Record<string, unknown>): Briefing {
  return {
    id: row.id as string,
    type: row.type as Briefing["type"],
    date: (row.generated_at as string).slice(0, 10),
    generatedAt: row.generated_at as string,
    title: row.title as string,
    summary: row.summary as string,
    highlights: (row.highlights as string[]) ?? [],
    articleCount: row.article_count as number,
    highlightCount: ((row.highlights as string[]) ?? []).length,
    dealCount: 0,
    articleIds: (row.article_ids as string[]) ?? [],
  };
}

function mapWatchlistItem(row: Record<string, unknown>): WatchlistItem {
  return {
    id: row.id as string,
    entityType: row.entity_type as WatchlistItem["entityType"],
    entityId: row.entity_id as string,
    label: row.label as string,
    companyId: row.company_id as string | undefined,
    addedAt: row.added_at as string,
    reason: row.reason as string | undefined,
  };
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function fetchCompanies(): Promise<Company[]> {
  if (!isSupabaseConfigured()) return sampleCompanies;

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) {
    console.error("[BDGS] fetchCompanies error:", error.message);
    return sampleCompanies;
  }

  return (data ?? []).map((r) => mapCompany(r as Record<string, unknown>));
}

export async function fetchCompanyById(id: string): Promise<Company | undefined> {
  if (!isSupabaseConfigured()) return sampleGetCompanyById(id);

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return mapCompany(data as Record<string, unknown>);
}

export async function fetchCompanyName(id: string): Promise<string> {
  if (!isSupabaseConfigured()) return sampleGetCompanyName(id);

  const company = await fetchCompanyById(id);
  return company?.name ?? "Unknown";
}

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  if (!isSupabaseConfigured()) return sampleNews;

  const { data, error } = await supabase
    .from("news_articles")
    .select("*, article_companies(company_id)")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[BDGS] fetchNewsArticles error:", error.message);
    return sampleNews;
  }

  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const junctions = (row.article_companies as Array<{ company_id: string }>) ?? [];
    const companyIds = junctions.map((j) => j.company_id);
    return mapNewsArticle(row, companyIds);
  });
}

export async function fetchNewsByCompany(companyId: string): Promise<NewsArticle[]> {
  if (!isSupabaseConfigured()) return sampleGetNewsByCompany(companyId);

  const { data, error } = await supabase
    .from("article_companies")
    .select("article_id, news_articles(*)")
    .eq("company_id", companyId);

  if (error) {
    console.error("[BDGS] fetchNewsByCompany error:", error.message);
    return sampleGetNewsByCompany(companyId);
  }

  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const article = row.news_articles as Record<string, unknown>;
    return mapNewsArticle(article, [companyId]);
  });
}

export async function fetchDeals(): Promise<Deal[]> {
  if (!isSupabaseConfigured()) return sampleDeals;

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("announcement_date", { ascending: false });

  if (error) {
    console.error("[BDGS] fetchDeals error:", error.message);
    return sampleDeals;
  }

  return (data ?? []).map((r) => mapDeal(r as Record<string, unknown>));
}

export async function fetchDealsByCompany(companyId: string): Promise<Deal[]> {
  if (!isSupabaseConfigured()) return sampleGetDealsByCompany(companyId);

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("company_id", companyId)
    .order("announcement_date", { ascending: false });

  if (error) return sampleGetDealsByCompany(companyId);
  return (data ?? []).map((r) => mapDeal(r as Record<string, unknown>));
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (!isSupabaseConfigured()) return sampleOpportunities;

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("detected_at", { ascending: false });

  if (error) {
    console.error("[BDGS] fetchOpportunities error:", error.message);
    return sampleOpportunities;
  }

  return (data ?? []).map((r) => mapOpportunity(r as Record<string, unknown>));
}

export async function fetchOpportunitiesByCompany(
  companyId: string,
): Promise<Opportunity[]> {
  if (!isSupabaseConfigured()) return sampleGetOpportunitiesByCompany(companyId);

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("company_id", companyId)
    .order("detected_at", { ascending: false });

  if (error) return sampleGetOpportunitiesByCompany(companyId);
  return (data ?? []).map((r) => mapOpportunity(r as Record<string, unknown>));
}

export async function fetchBriefings(): Promise<Briefing[]> {
  if (!isSupabaseConfigured()) return sampleBriefings;

  const { data, error } = await supabase
    .from("briefings")
    .select("*")
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("[BDGS] fetchBriefings error:", error.message);
    return sampleBriefings;
  }

  return (data ?? []).map((r) => mapBriefing(r as Record<string, unknown>));
}

export async function fetchWatchlistItems(): Promise<WatchlistItem[]> {
  if (!isSupabaseConfigured()) return sampleWatchlist;

  const { data, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) {
    console.error("[BDGS] fetchWatchlistItems error:", error.message);
    return sampleWatchlist;
  }

  return (data ?? []).map((r) => mapWatchlistItem(r as Record<string, unknown>));
}
