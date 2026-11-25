/**
 * Advisor Extractor
 * =================
 * Extracts law firm / advisor names from article text using pattern matching.
 *
 * Design constraints:
 *  - NEVER invent advisors — only extract explicitly mentioned firms.
 *  - Every advisor attribution must be traceable to the source article.
 *  - If a firm is mentioned in context unrelated to advisory, skip it.
 *
 * Sources: article headlines, summaries, and law firm deal announcements.
 */

// ─── Known law firms dictionary ─────────────────────────────────────────────
// Major firms active in French structured finance / M&A / LBO market.
// Each entry has canonical name + aliases for fuzzy matching.

export interface LawFirmRef {
  name: string;         // Canonical display name
  aliases: string[];    // Lowercase variants for matching
  category: "magic_circle" | "us_elite" | "french_top" | "mid_market" | "big4" | "other";
}

export const LAW_FIRMS: LawFirmRef[] = [
  // ─── Magic Circle ─────────────────────────────────────────────────────
  { name: "Clifford Chance", aliases: ["clifford chance"], category: "magic_circle" },
  { name: "Linklaters", aliases: ["linklaters"], category: "magic_circle" },
  { name: "Allen & Overy (A&O Shearman)", aliases: ["allen & overy", "allen and overy", "a&o shearman", "a&o"], category: "magic_circle" },
  { name: "Freshfields Bruckhaus Deringer", aliases: ["freshfields", "freshfields bruckhaus"], category: "magic_circle" },
  { name: "Slaughter and May", aliases: ["slaughter and may", "slaughter & may"], category: "magic_circle" },

  // ─── US Elite ─────────────────────────────────────────────────────────
  { name: "Latham & Watkins", aliases: ["latham & watkins", "latham and watkins", "latham"], category: "us_elite" },
  { name: "Davis Polk & Wardwell", aliases: ["davis polk", "davis polk & wardwell"], category: "us_elite" },
  { name: "Sullivan & Cromwell", aliases: ["sullivan & cromwell", "sullivan and cromwell"], category: "us_elite" },
  { name: "Skadden, Arps, Slate, Meagher & Flom", aliases: ["skadden", "skadden arps"], category: "us_elite" },
  { name: "Weil, Gotshal & Manges", aliases: ["weil gotshal", "weil, gotshal"], category: "us_elite" },
  { name: "Simpson Thacher & Bartlett", aliases: ["simpson thacher"], category: "us_elite" },
  { name: "Kirkland & Ellis", aliases: ["kirkland & ellis", "kirkland and ellis", "kirkland"], category: "us_elite" },
  { name: "White & Case", aliases: ["white & case", "white and case"], category: "us_elite" },
  { name: "Milbank", aliases: ["milbank"], category: "us_elite" },
  { name: "Cleary Gottlieb Steen & Hamilton", aliases: ["cleary gottlieb", "cleary"], category: "us_elite" },
  { name: "Cravath, Swaine & Moore", aliases: ["cravath"], category: "us_elite" },
  { name: "Paul, Weiss, Rifkind, Wharton & Garrison", aliases: ["paul weiss", "paul, weiss"], category: "us_elite" },
  { name: "Gibson, Dunn & Crutcher", aliases: ["gibson dunn"], category: "us_elite" },
  { name: "Willkie Farr & Gallagher", aliases: ["willkie farr", "willkie"], category: "us_elite" },

  // ─── Major international (Paris presence) ─────────────────────────────
  { name: "Hogan Lovells", aliases: ["hogan lovells"], category: "other" },
  { name: "Baker McKenzie", aliases: ["baker mckenzie", "baker & mckenzie"], category: "other" },
  { name: "Norton Rose Fulbright", aliases: ["norton rose", "norton rose fulbright"], category: "other" },
  { name: "Herbert Smith Freehills", aliases: ["herbert smith", "herbert smith freehills"], category: "other" },
  { name: "Ashurst", aliases: ["ashurst"], category: "other" },
  { name: "CMS Francis Lefebvre", aliases: ["cms francis lefebvre", "cms"], category: "other" },
  { name: "DLA Piper", aliases: ["dla piper"], category: "other" },
  { name: "Mayer Brown", aliases: ["mayer brown"], category: "other" },
  { name: "Orrick, Herrington & Sutcliffe", aliases: ["orrick"], category: "other" },
  { name: "Shearman & Sterling", aliases: ["shearman & sterling", "shearman and sterling"], category: "other" },
  { name: "McDermott Will & Emery", aliases: ["mcdermott will", "mcdermott"], category: "other" },
  { name: "Jones Day", aliases: ["jones day"], category: "other" },
  { name: "Morgan, Lewis & Bockius", aliases: ["morgan lewis"], category: "other" },
  { name: "Sidley Austin", aliases: ["sidley austin", "sidley"], category: "other" },

  // ─── French top-tier ──────────────────────────────────────────────────
  { name: "Gide Loyrette Nouel", aliases: ["gide loyrette", "gide"], category: "french_top" },
  { name: "Bredin Prat", aliases: ["bredin prat"], category: "french_top" },
  { name: "Darrois Villey Maillot Brochier", aliases: ["darrois villey", "darrois"], category: "french_top" },
  { name: "De Pardieu Brocas Maffei", aliases: ["de pardieu", "pardieu brocas"], category: "french_top" },
  { name: "Lacourte Raquin Tatar", aliases: ["lacourte raquin"], category: "french_top" },
  { name: "Weil & Associés", aliases: ["weil & associés", "weil et associés"], category: "french_top" },
  { name: "August Debouzy", aliases: ["august debouzy", "august & debouzy"], category: "french_top" },
  { name: "BDGS Associés", aliases: ["bdgs associés", "bdgs", "bdgs associes"], category: "french_top" },
  { name: "Racine", aliases: ["racine avocats", "cabinet racine"], category: "french_top" },
  { name: "Lamy Lexel", aliases: ["lamy lexel"], category: "french_top" },

  // ─── French mid-market / boutique finance ─────────────────────────────
  { name: "Goodwin Procter", aliases: ["goodwin procter", "goodwin"], category: "mid_market" },
  { name: "Dechert", aliases: ["dechert"], category: "mid_market" },
  { name: "Proskauer Rose", aliases: ["proskauer rose", "proskauer"], category: "mid_market" },
  { name: "Fried, Frank, Harris, Shriver & Jacobson", aliases: ["fried frank"], category: "mid_market" },
  { name: "Dentons", aliases: ["dentons"], category: "mid_market" },
  { name: "Eversheds Sutherland", aliases: ["eversheds sutherland", "eversheds"], category: "mid_market" },
  { name: "Linklaters (Luxembourg)", aliases: ["linklaters luxembourg"], category: "mid_market" },
  { name: "Arendt & Medernach", aliases: ["arendt & medernach", "arendt"], category: "mid_market" },
  { name: "Loyens & Loeff", aliases: ["loyens & loeff", "loyens"], category: "mid_market" },
  { name: "NautaDutilh", aliases: ["nautadutilh", "nauta dutilh"], category: "mid_market" },
  { name: "Osborne Clarke", aliases: ["osborne clarke"], category: "mid_market" },
  { name: "Fieldfisher", aliases: ["fieldfisher"], category: "mid_market" },
  { name: "Taylor Wessing", aliases: ["taylor wessing"], category: "mid_market" },
  { name: "Bird & Bird", aliases: ["bird & bird"], category: "mid_market" },
  { name: "Stephenson Harwood", aliases: ["stephenson harwood"], category: "mid_market" },
  { name: "Simmons & Simmons", aliases: ["simmons & simmons", "simmons and simmons"], category: "mid_market" },
  { name: "Addleshaw Goddard", aliases: ["addleshaw goddard"], category: "mid_market" },
  { name: "Lexance", aliases: ["lexance"], category: "mid_market" },
  { name: "Kramer Levin Naftalis & Frankel", aliases: ["kramer levin"], category: "mid_market" },

  // ─── Big 4 legal/advisory ─────────────────────────────────────────────
  { name: "EY Société d'Avocats", aliases: ["ey avocats", "ey société d'avocats", "ernst & young avocats"], category: "big4" },
  { name: "PwC Société d'Avocats", aliases: ["pwc avocats", "pwc société d'avocats"], category: "big4" },
  { name: "Deloitte Société d'Avocats", aliases: ["deloitte avocats", "deloitte société d'avocats"], category: "big4" },
  { name: "KPMG Avocats", aliases: ["kpmg avocats"], category: "big4" },

  // ─── Investment banks (financial advisors) ─────────────────────────────
  { name: "Rothschild & Co", aliases: ["rothschild & co", "rothschild"], category: "other" },
  { name: "Lazard", aliases: ["lazard"], category: "other" },
  { name: "Messier & Associés", aliases: ["messier & associés", "messier et associés", "messier maris"], category: "other" },
  { name: "Leonardo & Co", aliases: ["leonardo & co"], category: "other" },
  { name: "DC Advisory", aliases: ["dc advisory"], category: "other" },
  { name: "Accuracy", aliases: ["accuracy"], category: "other" },
  { name: "Eight Advisory", aliases: ["eight advisory"], category: "other" },
];

// ─── Advisory role patterns ─────────────────────────────────────────────────
// These patterns indicate a firm is acting as advisor on the deal described.

const ADVISORY_PATTERNS_FR = [
  /(?:conseillée?s?\s+par)\s+(.+?)(?:\.|,\s*(?:et|ainsi que|tandis que)|$)/gi,
  /(?:avec\s+(?:le\s+)?(?:concours|conseil)\s+(?:de|du cabinet|d[ue]))\s+(.+?)(?:\.\s|$)/gi,
  /(?:assistée?s?\s+par)\s+(.+?)(?:\.|,|$)/gi,
  /(?:accompagnée?s?\s+par)\s+(.+?)(?:\.|,|$)/gi,
  /(?:représentée?s?\s+par)\s+(.+?)(?:\.|,|$)/gi,
  // "[firm] a conseillé [company]"
  /(.+?)\s+(?:a\s+conseillé|a\s+assisté|a\s+accompagné|a\s+représenté)\s+/gi,
  // "les conseils juridiques étaient [firm]"
  /(?:conseils?\s+juridiques?\s*:?\s*)\s+(.+?)(?:\.|,|$)/gi,
];

const ADVISORY_PATTERNS_EN = [
  /(?:advised\s+by)\s+(.+?)(?:\.|,\s*(?:and|while|with)|$)/gi,
  /(?:with\s+(?:legal\s+)?(?:advice|counsel)\s+from)\s+(.+?)(?:\.|,|$)/gi,
  /(.+?)\s+(?:advised|acted\s+(?:as\s+)?(?:legal\s+)?(?:counsel|advisor))\s+/gi,
  /(?:legal\s+advisor[s]?\s*:?\s*)\s*(.+?)(?:\.|,|$)/gi,
  /(.+?)\s+(?:is\s+acting|are\s+acting|acted)\s+(?:as\s+)?(?:legal\s+)?(?:counsel|advisor)/gi,
];

// ─── Role classification ────────────────────────────────────────────────────

export interface ExtractedAdvisor {
  firmName: string;       // Canonical law firm name
  role: AdvisorRole;
  side: AdvisorSide;
  source: string;         // Where was this found
  sourceUrl: string;
}

type AdvisorRole = "legal_counsel" | "financial_advisor" | "tax_advisor" | "unknown";
type AdvisorSide = "buyer" | "seller" | "borrower" | "lender" | "issuer" | "unknown";

const SIDE_PATTERNS: Array<{ keywords: string[]; side: AdvisorSide }> = [
  { keywords: ["acquéreur", "acheteur", "buyer", "sponsor", "investisseur"], side: "buyer" },
  { keywords: ["vendeur", "cédant", "seller"], side: "seller" },
  { keywords: ["emprunteur", "borrower", "émetteur", "issuer"], side: "borrower" },
  { keywords: ["prêteur", "lender", "banque", "arrangeur", "arranger"], side: "lender" },
];

// ─── Main extraction function ───────────────────────────────────────────────

/**
 * Extract advisor mentions from an article's text.
 * Only returns firms that are explicitly named in advisory context.
 */
export function extractAdvisors(
  headline: string,
  summary: string,
  source: string,
  sourceUrl: string,
): ExtractedAdvisor[] {
  const fullText = `${headline} ${summary}`;
  const lower = fullText.toLowerCase();
  const advisors: ExtractedAdvisor[] = [];
  const seen = new Set<string>(); // Dedup by canonical name

  // Strategy 1: Pattern-based extraction
  // Look for advisory phrases and extract the firm name from the match
  const allPatterns = [...ADVISORY_PATTERNS_FR, ...ADVISORY_PATTERNS_EN];

  for (const pattern of allPatterns) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      const candidateText = match[1]?.trim();
      if (!candidateText) continue;

      // Split on " et " / " and " to handle "FirmA et FirmB" in one capture
      const segments = candidateText.split(/\s+(?:et|and|ainsi que|,)\s+/);
      for (const segment of segments) {
        const firm = matchFirmInText(segment.trim());
        if (firm && !seen.has(firm.name)) {
          seen.add(firm.name);
          advisors.push({
            firmName: firm.name,
            role: classifyRole(firm),
            side: detectSide(lower, firm.name),
            source,
            sourceUrl,
          });
        }
      }
    }
  }

  // Strategy 2: Direct firm mention detection
  // If the article is FROM a law firm website (deal announcement),
  // the firm itself is the advisor
  const sourceFirm = detectSourceFirm(source, sourceUrl);
  if (sourceFirm && !seen.has(sourceFirm.name)) {
    seen.add(sourceFirm.name);
    advisors.push({
      firmName: sourceFirm.name,
      role: "legal_counsel",
      side: detectSide(lower, sourceFirm.name),
      source,
      sourceUrl,
    });
  }

  // Strategy 3: Co-occurrence — firm name appears near advisory keywords
  // in the same sentence, even without matching a pattern
  for (const firm of LAW_FIRMS) {
    if (seen.has(firm.name)) continue;

    for (const alias of firm.aliases) {
      if (!lower.includes(alias)) continue;

      // Check if firm appears near advisory keywords in the same context
      const idx = lower.indexOf(alias);
      const window = lower.slice(Math.max(0, idx - 120), Math.min(lower.length, idx + alias.length + 120));

      const hasAdvisoryContext = /conseil|advis|assist|accompagn|représent|acted|counsel|legal/.test(window);
      if (hasAdvisoryContext) {
        seen.add(firm.name);
        advisors.push({
          firmName: firm.name,
          role: classifyRole(firm),
          side: detectSide(lower, firm.name),
          source,
          sourceUrl,
        });
        break;
      }
    }
  }

  return advisors;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function matchFirmInText(text: string): LawFirmRef | null {
  const lower = text.toLowerCase();
  // Try longer aliases first (more specific)
  const sorted = [...LAW_FIRMS].sort(
    (a, b) => Math.max(...b.aliases.map(al => al.length)) - Math.max(...a.aliases.map(al => al.length))
  );
  for (const firm of sorted) {
    for (const alias of firm.aliases) {
      if (lower.includes(alias)) return firm;
    }
  }
  return null;
}

function detectSourceFirm(sourceName: string, sourceUrl: string): LawFirmRef | null {
  const urlLower = sourceUrl.toLowerCase();
  const srcLower = sourceName.toLowerCase();

  // Map known domains to firms
  const domainMap: Array<{ domain: string; firm: string }> = [
    { domain: "cliffordchance.com", firm: "Clifford Chance" },
    { domain: "linklaters.com", firm: "Linklaters" },
    { domain: "lw.com", firm: "Latham & Watkins" },
    { domain: "allenovery.com", firm: "Allen & Overy (A&O Shearman)" },
    { domain: "freshfields.com", firm: "Freshfields Bruckhaus Deringer" },
    { domain: "davispolk.com", firm: "Davis Polk & Wardwell" },
    { domain: "gide.com", firm: "Gide Loyrette Nouel" },
    { domain: "bredinprat.com", firm: "Bredin Prat" },
    { domain: "darroisvilley.com", firm: "Darrois Villey Maillot Brochier" },
    { domain: "whitecase.com", firm: "White & Case" },
    { domain: "herbertsmithfreehills.com", firm: "Herbert Smith Freehills" },
    { domain: "hoganlovells.com", firm: "Hogan Lovells" },
    { domain: "nortonrosefulbright.com", firm: "Norton Rose Fulbright" },
    { domain: "bakermckenzie.com", firm: "Baker McKenzie" },
    { domain: "cms.law", firm: "CMS Francis Lefebvre" },
    { domain: "dlapiper.com", firm: "DLA Piper" },
    { domain: "mayerbrown.com", firm: "Mayer Brown" },
    { domain: "orrick.com", firm: "Orrick, Herrington & Sutcliffe" },
    { domain: "kirkland.com", firm: "Kirkland & Ellis" },
    { domain: "skadden.com", firm: "Skadden, Arps, Slate, Meagher & Flom" },
    { domain: "weil.com", firm: "Weil, Gotshal & Manges" },
    { domain: "simpsonthacher.com", firm: "Simpson Thacher & Bartlett" },
    { domain: "milbank.com", firm: "Milbank" },
    { domain: "clearygottlieb.com", firm: "Cleary Gottlieb Steen & Hamilton" },
    { domain: "willkie.com", firm: "Willkie Farr & Gallagher" },
    { domain: "goodwinlaw.com", firm: "Goodwin Procter" },
    { domain: "dechert.com", firm: "Dechert" },
    { domain: "augustdebouzy.com", firm: "August Debouzy" },
    { domain: "depardieu.com", firm: "De Pardieu Brocas Maffei" },
    { domain: "arendt.com", firm: "Arendt & Medernach" },
    { domain: "simmons-simmons.com", firm: "Simmons & Simmons" },
    { domain: "ashurst.com", firm: "Ashurst" },
    { domain: "dentons.com", firm: "Dentons" },
    { domain: "twobirds.com", firm: "Bird & Bird" },
    { domain: "osborneclarke.com", firm: "Osborne Clarke" },
    { domain: "fieldfisher.com", firm: "Fieldfisher" },
    { domain: "taylorwessing.com", firm: "Taylor Wessing" },
    { domain: "shlegal.com", firm: "Stephenson Harwood" },
    { domain: "jonesday.com", firm: "Jones Day" },
    { domain: "morganlewis.com", firm: "Morgan, Lewis & Bockius" },
    { domain: "sidley.com", firm: "Sidley Austin" },
    { domain: "gibsondunn.com", firm: "Gibson, Dunn & Crutcher" },
    { domain: "paulweiss.com", firm: "Paul, Weiss, Rifkind, Wharton & Garrison" },
    { domain: "friedfrank.com", firm: "Fried, Frank, Harris, Shriver & Jacobson" },
    { domain: "proskauer.com", firm: "Proskauer Rose" },
    { domain: "kramerlevin.com", firm: "Kramer Levin Naftalis & Frankel" },
  ];

  for (const { domain, firm } of domainMap) {
    if (urlLower.includes(domain) || srcLower.includes(domain)) {
      return LAW_FIRMS.find((f) => f.name === firm) ?? null;
    }
  }

  return null;
}

function classifyRole(firm: LawFirmRef): AdvisorRole {
  if (firm.category === "big4") return "tax_advisor";
  if (firm.name === "Rothschild & Co" || firm.name === "Lazard" ||
      firm.name === "Messier & Associés" || firm.name === "DC Advisory" ||
      firm.name === "Leonardo & Co" || firm.name === "Accuracy" ||
      firm.name === "Eight Advisory") {
    return "financial_advisor";
  }
  return "legal_counsel";
}

function detectSide(textLower: string, firmName: string): AdvisorSide {
  // Find the firm in text using any alias
  const firm = LAW_FIRMS.find((f) => f.name === firmName);
  const allNames = firm ? [firmName.toLowerCase(), ...firm.aliases] : [firmName.toLowerCase()];
  let idx = -1;
  for (const name of allNames) {
    idx = textLower.indexOf(name);
    if (idx !== -1) break;
  }
  if (idx === -1) return "unknown";

  // Look at context around the firm mention
  const matchedLength = (allNames.find((n) => textLower.indexOf(n) === idx) ?? firmName).length;
  const before = textLower.slice(Math.max(0, idx - 150), idx);
  const after = textLower.slice(idx, Math.min(textLower.length, idx + matchedLength + 150));
  const context = before + " " + after;

  for (const { keywords, side } of SIDE_PATTERNS) {
    for (const kw of keywords) {
      if (context.includes(kw)) return side;
    }
  }

  return "unknown";
}

// ─── Format for display ─────────────────────────────────────────────────────

export function formatAdvisorForDisplay(advisor: ExtractedAdvisor): string {
  const roleFr: Record<AdvisorRole, string> = {
    legal_counsel: "Conseil juridique",
    financial_advisor: "Conseil financier",
    tax_advisor: "Conseil fiscal",
    unknown: "Conseil",
  };
  const sideFr: Record<AdvisorSide, string> = {
    buyer: "acquéreur",
    seller: "vendeur",
    borrower: "emprunteur",
    lender: "prêteurs",
    issuer: "émetteur",
    unknown: "",
  };

  let display = `${advisor.firmName} (${roleFr[advisor.role]}`;
  if (advisor.side !== "unknown") {
    display += ` — côté ${sideFr[advisor.side]}`;
  }
  display += ")";
  return display;
}
