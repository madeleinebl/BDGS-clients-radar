/**
 * RSS Feed Configuration
 * ======================
 * Free, public RSS feeds for French and European corporate/finance news.
 * All sources are publicly available — no API keys required.
 */

export interface FeedConfig {
  /** Display name */
  name: string;
  /** RSS/Atom feed URL */
  url: string;
  /** Default category for articles from this feed */
  defaultCategory:
    | "M&A"
    | "Financing"
    | "Regulatory"
    | "Earnings"
    | "Management"
    | "Restructuring"
    | "IPO"
    | "Infrastructure"
    | "Credit"
    | "Other";
  /** Language hint */
  lang: "fr" | "en";
  /** Whether this feed is enabled */
  enabled: boolean;
}

export const feeds: FeedConfig[] = [
  // ─── French business / finance ───────────────────────────────────────────────
  {
    name: "Les Échos — Entreprises",
    url: "https://syndication.lesechos.fr/rss/rss_entreprises.xml",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Les Échos — Finance & Marchés",
    url: "https://syndication.lesechos.fr/rss/rss_finance_marches.xml",
    defaultCategory: "Financing",
    lang: "fr",
    enabled: true,
  },
  {
    name: "BFM Business",
    url: "https://bfmbusiness.bfmtv.com/rss/info/flux-rss/flux-toutes-les-depeches/",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Capital.fr — Entreprises",
    url: "https://www.capital.fr/entreprises-marches/rss",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  // ─── European / international ────────────────────────────────────────────────
  {
    name: "Reuters — Business",
    url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best",
    defaultCategory: "Other",
    lang: "en",
    enabled: true,
  },
  {
    name: "Financial Times — Companies",
    url: "https://www.ft.com/companies?format=rss",
    defaultCategory: "Other",
    lang: "en",
    enabled: true,
  },
  // ─── Deal-specific ───────────────────────────────────────────────────────────
  {
    name: "Mergermarket (free headlines)",
    url: "https://www.mergermarket.com/info/rss-feeds",
    defaultCategory: "M&A",
    lang: "en",
    enabled: false, // Often requires login; keep as placeholder
  },
];

/** Only return feeds that are enabled */
export function getActiveFeeds(): FeedConfig[] {
  return feeds.filter((f) => f.enabled);
}
