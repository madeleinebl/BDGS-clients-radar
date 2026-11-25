/**
 * Deal Detector
 * =============
 * Analyses ingested news articles to detect potential corporate deals
 * and extract structured deal information.
 *
 * Design constraints (from project rules):
 *  - NEVER invent deal amounts — only extract explicitly stated figures.
 *  - NEVER invent advisors.
 *  - NEVER infer that BDGS is involved.
 *  - NEVER confuse potential opportunities with confirmed transactions.
 *  - Every factual assertion must be traceable to the source article.
 *  - Use null or 'not disclosed' when information is unavailable.
 *
 * This module uses rule-based extraction (no paid LLM API).
 * It matches articles against monitored companies, detects deal-related
 * keywords, extracts amounts when explicitly stated, and classifies
 * deal type and status from linguistic patterns.
 *
 * Advisor extraction: pattern-matches law firm names from article text
 * and law firm deal announcements. Only explicitly mentioned firms are
 * extracted — never invented.
 */

import { extractAdvisors, formatAdvisorForDisplay } from "./advisor-extractor";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface DetectedDeal {
  name: string;
  companyId: string;
  companyName: string;
  dealType: DealType;
  counterparty: string | null;
  amount: number | null;        // In millions EUR — only if explicitly stated
  currency: string;
  status: DealStatus;
  announcementDate: string;     // From article publish date
  summary: string;
  source: string;
  sourceUrl: string;
  buyers: string[];
  sellers: string[];
  advisors: string[];           // Extracted from article text — never invented
  confidence: "high" | "medium" | "low";
  matchReason: string;          // Why this was flagged as a deal
}

type DealType =
  | "M&A"
  | "LBO"
  | "Refinancing"
  | "Corporate loan"
  | "Bond issuance"
  | "Private placement"
  | "Project finance"
  | "Infrastructure investment"
  | "Asset disposal"
  | "Capital increase"
  | "Joint venture";

type DealStatus = "rumoured" | "announced" | "in_progress" | "closed" | "cancelled";

interface CompanyRef {
  id: string;
  name: string;
  aliases: string[]; // lowercase variants for matching
}

// ─── Deal type detection patterns ──────────────────────────────────────────────

interface DealPattern {
  keywords: string[];
  type: DealType;
  weight: number; // Higher = more specific match
}

const DEAL_PATTERNS: DealPattern[] = [
  // LBO — most specific first
  { keywords: ["lbo", "leveraged buyout", "rachat par effet de levier"], type: "LBO", weight: 10 },
  { keywords: ["management buyout", "mbo"], type: "LBO", weight: 10 },

  // Bond issuance
  { keywords: ["émission obligataire", "bond issuance", "émission d'obligations"], type: "Bond issuance", weight: 10 },
  { keywords: ["obligation verte", "green bond"], type: "Bond issuance", weight: 9 },
  { keywords: ["obligation hybride", "hybrid bond"], type: "Bond issuance", weight: 9 },
  { keywords: ["placement obligataire"], type: "Bond issuance", weight: 9 },
  { keywords: ["emtn", "euro medium term"], type: "Bond issuance", weight: 8 },

  // Private placement
  { keywords: ["placement privé", "private placement"], type: "Private placement", weight: 9 },
  { keywords: ["schuldschein"], type: "Private placement", weight: 9 },

  // Refinancing
  { keywords: ["refinancement", "refinancing", "refinance"], type: "Refinancing", weight: 8 },
  { keywords: ["renégociation de dette", "debt renegotiation"], type: "Refinancing", weight: 8 },
  { keywords: ["extension de maturité", "maturity extension"], type: "Refinancing", weight: 8 },

  // Corporate loan
  { keywords: ["crédit syndiqué", "syndicated loan"], type: "Corporate loan", weight: 8 },
  { keywords: ["prêt bancaire", "bank loan", "crédit bancaire"], type: "Corporate loan", weight: 7 },
  { keywords: ["ligne de crédit", "credit facility", "revolving"], type: "Corporate loan", weight: 7 },
  { keywords: ["dette privée", "private debt", "direct lending", "unitranche"], type: "Corporate loan", weight: 7 },

  // Project finance
  { keywords: ["financement de projet", "project finance"], type: "Project finance", weight: 8 },
  { keywords: ["financement d'infrastructure"], type: "Project finance", weight: 7 },

  // Infrastructure investment
  { keywords: ["concession", "partenariat public-privé", "ppp"], type: "Infrastructure investment", weight: 7 },
  { keywords: ["infrastructure investment"], type: "Infrastructure investment", weight: 7 },

  // Capital increase
  { keywords: ["augmentation de capital", "capital increase"], type: "Capital increase", weight: 8 },
  { keywords: ["levée de fonds", "fundraising", "série a", "série b", "série c", "series a", "series b", "series c"], type: "Capital increase", weight: 7 },

  // Asset disposal
  { keywords: ["cession d'actifs", "asset disposal", "cession de"], type: "Asset disposal", weight: 7 },
  { keywords: ["vente de", "désengagement", "divestiture"], type: "Asset disposal", weight: 6 },

  // Joint venture
  { keywords: ["joint venture", "co-entreprise", "joint-venture", "coentreprise"], type: "Joint venture", weight: 8 },

  // M&A — broadest, lowest weight
  { keywords: ["acquisition", "acquiert", "acquis", "rachat de", "rachète"], type: "M&A", weight: 6 },
  { keywords: ["fusion", "merger", "rapprochement"], type: "M&A", weight: 6 },
  { keywords: ["offre publique d'achat", "opa", "takeover bid"], type: "M&A", weight: 7 },
  { keywords: ["offre publique d'échange", "ope"], type: "M&A", weight: 7 },
  { keywords: ["prise de participation", "stake acquisition"], type: "M&A", weight: 5 },
];

// ─── Status detection patterns ─────────────────────────────────────────────────

interface StatusPattern {
  keywords: string[];
  status: DealStatus;
}

const STATUS_PATTERNS: StatusPattern[] = [
  { keywords: ["rumeur", "rumoured", "pourrait", "envisagerait", "serait en discussion", "would consider"], status: "rumoured" },
  { keywords: ["finalisé", "clôturé", "bouclé", "completed", "closed", "a réalisé", "a émis", "a acquis", "a cédé", "a levé", "a signé"], status: "closed" },
  { keywords: ["annulé", "cancelled", "abandonné", "retiré", "withdrawn"], status: "cancelled" },
  { keywords: ["en cours", "in progress", "négociation exclusive", "exclusive negotiations", "discussions avancées", "advanced talks", "en négociation"], status: "in_progress" },
  { keywords: ["annonce", "announced", "confirme", "confirms", "lance", "launches", "propose", "dépose"], status: "announced" },
];

// ─── Amount extraction ─────────────────────────────────────────────────────────
// Only extract amounts that are EXPLICITLY stated in the text.
// Returns amount in millions.

interface ExtractedAmount {
  value: number;      // In millions
  currency: string;
}

function extractAmount(text: string): ExtractedAmount | null {
  const lower = text.toLowerCase();

  // Pattern: X milliard(s) d'euros / X billion euros
  const billionEur = lower.match(
    /(\d[\d,.\s]*)\s*milliards?\s*d['']euros/
  ) ?? lower.match(
    /€\s*(\d[\d,.\s]*)\s*(?:bn|billion|mds|milliards?)/
  ) ?? lower.match(
    /(\d[\d,.\s]*)\s*(?:bn|billion|mds|milliards?)\s*(?:d[''])?€|euros?/
  );
  if (billionEur) {
    const val = parseNumber(billionEur[1]);
    if (val) return { value: val * 1000, currency: "EUR" };
  }

  // Pattern: X million(s) d'euros / €X million / XM€
  const millionEur = lower.match(
    /(\d[\d,.\s]*)\s*millions?\s*d['']euros/
  ) ?? lower.match(
    /€\s*(\d[\d,.\s]*)\s*(?:m|mn|million)/
  ) ?? lower.match(
    /(\d[\d,.\s]*)\s*m€/
  );
  if (millionEur) {
    const val = parseNumber(millionEur[1]);
    if (val) return { value: val, currency: "EUR" };
  }

  // Pattern: €X (bare number, likely millions if > 100)
  const bareEur = lower.match(
    /(\d[\d,.\s]*)\s*(?:euros|€)/
  );
  if (bareEur) {
    const val = parseNumber(bareEur[1]);
    // Only capture if it looks like a deal-sized amount (>= 1M)
    if (val && val >= 1_000_000) return { value: val / 1_000_000, currency: "EUR" };
  }

  // USD patterns
  const billionUsd = lower.match(
    /\$\s*(\d[\d,.\s]*)\s*(?:bn|billion)/
  ) ?? lower.match(
    /(\d[\d,.\s]*)\s*(?:bn|billion)\s*(?:de\s+)?dollars?/
  );
  if (billionUsd) {
    const val = parseNumber(billionUsd[1]);
    if (val) return { value: val * 1000, currency: "USD" };
  }

  const millionUsd = lower.match(
    /\$\s*(\d[\d,.\s]*)\s*(?:m|mn|million)/
  ) ?? lower.match(
    /(\d[\d,.\s]*)\s*millions?\s*(?:de\s+)?dollars?/
  );
  if (millionUsd) {
    const val = parseNumber(millionUsd[1]);
    if (val) return { value: val, currency: "USD" };
  }

  // GBP patterns
  const billionGbp = lower.match(
    /£\s*(\d[\d,.\s]*)\s*(?:bn|billion)/
  );
  if (billionGbp) {
    const val = parseNumber(billionGbp[1]);
    if (val) return { value: val * 1000, currency: "GBP" };
  }

  return null;
}

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  // Handle French format: 1 234,5 or 1.234,5
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3})/g, "")  // Remove thousand separators
    .replace(",", ".");            // French decimal separator
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ─── Counterparty extraction ───────────────────────────────────────────────────

function extractCounterparty(text: string, companyName: string): string | null {
  const lower = text.toLowerCase();
  const compLower = companyName.toLowerCase();

  // Pattern: "[company] acquiert/rachète [counterparty]"
  const acquiresMatch = lower.match(
    new RegExp(`${escapeRegex(compLower)}\\s+(?:acquiert|rachète|reprend|achète|acquires|buys)\\s+([A-ZÀ-Ú][\\w\\s&'-]{2,30})`, "i")
  );
  if (acquiresMatch) return acquiresMatch[1].trim();

  // Pattern: "acquisition de [counterparty] par [company]"
  const acquisitionOfMatch = lower.match(
    /acquisition\s+de\s+([A-ZÀ-Ú][\w\s&'-]{2,30})\s+par/i
  );
  if (acquisitionOfMatch) return acquisitionOfMatch[1].trim();

  // Pattern: "cession de [asset] à [counterparty]"
  const cessionMatch = lower.match(
    /cession\s+(?:de\s+)?[\w\s]+\s+à\s+([A-ZÀ-Ú][\w\s&'-]{2,30})/i
  );
  if (cessionMatch) return cessionMatch[1].trim();

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Main detection logic ──────────────────────────────────────────────────────

export interface ArticleInput {
  headline: string;
  summary: string;
  sourceUrl: string;
  source: string;
  publishedAt: string;
}

/**
 * Analyse a batch of articles against monitored companies.
 * Returns detected deals with confidence levels.
 *
 * @param articles  - Ingested articles to analyse
 * @param companies - Monitored companies from DB (id, name)
 */
export function detectDeals(
  articles: ArticleInput[],
  companies: Array<{ id: string; name: string }>,
): DetectedDeal[] {
  // Build company lookup with name variants
  const companyRefs: CompanyRef[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    aliases: buildAliases(c.name),
  }));

  const detected: DetectedDeal[] = [];

  for (const article of articles) {
    const text = `${article.headline} ${article.summary}`.toLowerCase();

    // 1. Find which monitored companies are mentioned
    const matchedCompanies = companyRefs.filter((c) =>
      c.aliases.some((alias) => text.includes(alias))
    );

    if (matchedCompanies.length === 0) continue;

    // 2. Detect deal type from keywords
    const dealMatch = detectDealType(text);
    if (!dealMatch) continue; // Not a deal article

    // 3. Extract amount (only if explicitly stated)
    const fullText = `${article.headline} ${article.summary}`;
    const amount = extractAmount(fullText);

    // 4. Detect status
    const status = detectStatus(text);

    // 5. Extract counterparty (best effort)
    const counterparty = extractCounterparty(fullText, matchedCompanies[0].name);

    // 6. Extract advisors (only explicitly mentioned in text)
    const extractedAdvisors = extractAdvisors(
      article.headline,
      article.summary,
      article.source,
      article.sourceUrl,
    );
    const advisorNames = extractedAdvisors.map((a) => formatAdvisorForDisplay(a));

    // 7. Determine confidence
    const confidence = determineConfidence(dealMatch.weight, matchedCompanies.length, amount !== null);

    // 8. Build deal name
    const primaryCompany = matchedCompanies[0];
    const dealName = buildDealName(primaryCompany.name, dealMatch.type, counterparty, amount);

    // Create one deal per primary company match
    detected.push({
      name: dealName,
      companyId: primaryCompany.id,
      companyName: primaryCompany.name,
      dealType: dealMatch.type,
      counterparty,
      amount: amount?.value ?? null,
      currency: amount?.currency ?? "EUR",
      status,
      announcementDate: article.publishedAt.slice(0, 10),
      summary: article.summary.slice(0, 500) || article.headline,
      source: article.source,
      sourceUrl: article.sourceUrl,
      buyers: dealMatch.type === "M&A" || dealMatch.type === "LBO"
        ? [primaryCompany.name]
        : [],
      sellers: dealMatch.type === "Asset disposal"
        ? [primaryCompany.name]
        : [],
      advisors: advisorNames, // Extracted from article text — never invented
      confidence,
      matchReason: `Matched "${dealMatch.keyword}" for ${primaryCompany.name}`,
    });
  }

  return detected;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildAliases(name: string): string[] {
  const lower = name.toLowerCase();
  const aliases = [lower];

  // "Groupe ADP" → also match "adp"
  if (lower.startsWith("groupe ")) {
    aliases.push(lower.replace("groupe ", ""));
  }

  // "TotalEnergies" → also match "total energies" and "total"
  // Handle CamelCase company names
  const spaced = lower.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  if (spaced !== lower) aliases.push(spaced);

  // For multi-word names, don't add single common words
  // but do add the first word if it's distinctive (> 4 chars)
  const words = lower.split(/\s+/);
  if (words.length > 1 && words[0].length > 4) {
    aliases.push(words[0]);
  }

  return aliases;
}

function detectDealType(text: string): { type: DealType; weight: number; keyword: string } | null {
  let bestMatch: { type: DealType; weight: number; keyword: string } | null = null;

  for (const pattern of DEAL_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) {
        if (!bestMatch || pattern.weight > bestMatch.weight) {
          bestMatch = { type: pattern.type, weight: pattern.weight, keyword };
        }
      }
    }
  }

  return bestMatch;
}

function detectStatus(text: string): DealStatus {
  for (const pattern of STATUS_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) {
        return pattern.status;
      }
    }
  }
  return "announced"; // Default
}

function determineConfidence(
  patternWeight: number,
  companyMatches: number,
  hasAmount: boolean,
): "high" | "medium" | "low" {
  let score = patternWeight;
  if (companyMatches > 1) score += 2;  // Multiple companies = likely a deal
  if (hasAmount) score += 3;           // Explicit amount = strong signal
  if (score >= 12) return "high";
  if (score >= 8) return "medium";
  return "low";
}

function buildDealName(
  company: string,
  type: DealType,
  counterparty: string | null,
  amount: ExtractedAmount | null,
): string {
  const typeLabel: Record<DealType, string> = {
    "M&A": "Acquisition",
    "LBO": "LBO",
    "Refinancing": "Refinancement",
    "Corporate loan": "Crédit",
    "Bond issuance": "Émission obligataire",
    "Private placement": "Placement privé",
    "Project finance": "Financement de projet",
    "Infrastructure investment": "Investissement infrastructure",
    "Asset disposal": "Cession",
    "Capital increase": "Augmentation de capital",
    "Joint venture": "Joint-venture",
  };

  let name = `${company} — ${typeLabel[type]}`;
  if (amount) {
    const symbol = amount.currency === "EUR" ? "€" : amount.currency === "USD" ? "$" : amount.currency;
    name += ` ${symbol}${amount.value >= 1000 ? `${(amount.value / 1000).toFixed(1)}Mds` : `${amount.value}M`}`;
  }
  if (counterparty) {
    name += ` (${counterparty})`;
  }
  return name;
}
