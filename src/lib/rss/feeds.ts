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
  {
    name: "Le Figaro — Économie",
    url: "http://www.lefigaro.fr/rss/figaro_economie.xml",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Le Figaro — Sociétés",
    url: "http://www.lefigaro.fr/rss/figaro_societes.xml",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  {
    name: "La Tribune — Entreprises",
    url: "https://www.latribune.fr/feeds/entreprises.html",
    defaultCategory: "Other",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Zonebourse — Actualités France",
    url: "https://www.zonebourse.com/flux-rss/news/",
    defaultCategory: "Financing",
    lang: "fr",
    enabled: true,
  },
  // ─── French deal / M&A focused (Google News) ───────────────────────────────
  // Google News RSS captures articles from CFNews, L'AGEFI, Décideurs, Magazine
  // des Affaires, Option Finance and other French deal sources that lack native RSS
  {
    name: "Google News — LBO France",
    url: "https://news.google.com/rss/search?q=LBO+France+financement&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "Financing",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Google News — M&A France",
    url: "https://news.google.com/rss/search?q=acquisition+cession+entreprise+France&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "M&A",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Google News — Refinancement obligataire",
    url: "https://news.google.com/rss/search?q=refinancement+OR+%22%C3%A9mission+obligataire%22+OR+%22dette+priv%C3%A9e%22+France&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "Financing",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Google News — Project Finance France",
    url: "https://news.google.com/rss/search?q=%22financement+de+projet%22+OR+%22project+finance%22+France+infrastructure&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "Infrastructure",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Google News — Restructuration France",
    url: "https://news.google.com/rss/search?q=restructuration+OR+%22plan+de+sauvegarde%22+OR+%22retournement%22+entreprise+France&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "Restructuring",
    lang: "fr",
    enabled: true,
  },
  {
    name: "Google News — IPO France",
    url: "https://news.google.com/rss/search?q=introduction+bourse+OR+IPO+OR+%22entr%C3%A9e+en+bourse%22+France&hl=fr&gl=FR&ceid=FR:fr",
    defaultCategory: "IPO",
    lang: "fr",
    enabled: true,
  },
  // ─── French deal press (native RSS when available, disabled if paywall) ─────
  {
    name: "L'AGEFI",
    url: "https://www.agefi.fr/rss",
    defaultCategory: "Financing",
    lang: "fr",
    enabled: false, // No confirmed public RSS; enable if URL works
  },
  {
    name: "CFNews",
    url: "https://www.cfnews.net/rss",
    defaultCategory: "M&A",
    lang: "fr",
    enabled: false, // No confirmed public RSS; enable if URL works
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
  {
    name: "FT — M&A",
    url: "https://www.ft.com/mergers-acquisitions?format=rss",
    defaultCategory: "M&A",
    lang: "en",
    enabled: true,
  },
  // ─── AMF (regulatory filings) ───────────────────────────────────────────────
  {
    name: "AMF — Communiqués",
    url: "https://www.amf-france.org/fr/flux-rss/display/23",
    defaultCategory: "Regulatory",
    lang: "fr",
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
