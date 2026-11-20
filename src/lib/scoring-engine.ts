/**
 * BDGS Client Radar — Transparent Scoring Engine
 * ================================================
 * Two independent scores, each with visible sub-factor breakdowns.
 *
 * IMPORTANT DISCLAIMERS:
 * - Scores are ESTIMATES derived from automated text analysis.
 * - They are NOT objective certainty and should not be treated as such.
 * - Every score includes an explanation of how it was derived.
 * - Users can override scores manually and flag incorrect assessments.
 * - The engine does NOT simply match financial keywords.
 *   It evaluates materiality, strategic context, deal characteristics,
 *   and relevance to structured finance / leveraged lending practice.
 *
 * Methodology version is stored with every scored item so that
 * scores can be recalculated when the methodology changes.
 */

// ─── Methodology Version ────────────────────────────────────────────────────

export const SCORING_METHODOLOGY = {
  version: "1.0.0",
  lastUpdated: "2026-11-20",
  description:
    "Rule-based scoring with weighted sub-factors. News Relevance evaluates materiality and strategic importance to the company. BDGS Finance Opportunity evaluates potential for structured finance / leveraged lending work.",
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

/** Individual factor contributing to a score */
export interface ScoreFactor {
  name: string;
  maxPoints: number;
  points: number;
  reasoning: string;
}

/** Complete score result for one dimension */
export interface ScoreResult {
  total: number;
  factors: ScoreFactor[];
  priority: "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  disclaimer: string;
  methodologyVersion: string;
}

/** Combined scoring output for a news article */
export interface ScoringOutput {
  newsRelevance: ScoreResult;
  financeOpportunity: ScoreResult;
  scoredAt: string;
  methodologyVersion: string;
}

/** Manual override record */
export interface ScoreOverride {
  id: string;
  articleId: string;
  scoreType: "newsRelevance" | "financeOpportunity";
  originalScore: number;
  overrideScore: number;
  reason: string;
  overriddenBy: string;
  overriddenAt: string;
}

/** Flag-as-incorrect record */
export interface ScoreFlag {
  id: string;
  articleId: string;
  scoreType: "newsRelevance" | "financeOpportunity";
  currentScore: number;
  suggestedScore?: number;
  reason: string;
  flaggedBy: string;
  flaggedAt: string;
  status: "pending" | "reviewed" | "resolved";
}

// ─── Input type for the scoring engine ──────────────────────────────────────

export interface ArticleInput {
  headline: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  /** Extracted or estimated deal/event value in EUR */
  estimatedValue?: number;
  /** Whether an explicit financing need is mentioned */
  financingMentioned: boolean;
  /** Whether specific lenders/advisors are named */
  advisorsNamed: boolean;
  /** Whether a timeline or deadline is mentioned */
  timelineMentioned: boolean;
  /** The type of event (maps to news categories) */
  eventType: string;
  /** Whether the article mentions the company as a primary actor */
  companyIsPrimaryActor: boolean;
  /** Whether the event represents a change in company strategy */
  strategicChange: boolean;
  /** Number of companies involved */
  companiesInvolved: number;
}

// ─── Priority label mapping ─────────────────────────────────────────────────

export function getPriorityFromScore(
  score: number
): "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL" {
  if (score >= 80) return "HIGH";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "LOW";
  return "INFORMATIONAL";
}

// ─── Score 1: News Relevance (0–100) ────────────────────────────────────────
//
// Measures how important the news is to the monitored company.
// Five factors, each scored independently:
//   - Materiality (0–25)
//   - Strategic importance (0–25)
//   - Size of event (0–20)
//   - Recency (0–15)
//   - Impact on the company (0–15)

function scoreMateriality(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // Categories with inherently high materiality
  const highMateriality = ["M&A", "Financing", "Restructuring", "IPO"];
  const mediumMateriality = [
    "Regulatory",
    "Infrastructure",
    "Credit",
    "Management",
  ];

  if (highMateriality.includes(input.category)) {
    points += 12;
    reasons.push(`${input.category} events are inherently material`);
  } else if (mediumMateriality.includes(input.category)) {
    points += 7;
    reasons.push(`${input.category} events have moderate materiality`);
  } else {
    points += 3;
    reasons.push(`${input.category} events have lower default materiality`);
  }

  // Financial magnitude
  if (input.estimatedValue) {
    if (input.estimatedValue >= 1_000_000_000) {
      points += 10;
      reasons.push("Event involves €1B+ — very high financial magnitude");
    } else if (input.estimatedValue >= 500_000_000) {
      points += 8;
      reasons.push("Event involves €500M+ — high financial magnitude");
    } else if (input.estimatedValue >= 100_000_000) {
      points += 5;
      reasons.push("Event involves €100M+ — significant financial magnitude");
    } else if (input.estimatedValue >= 10_000_000) {
      points += 3;
      reasons.push("Event involves €10M+ — moderate financial magnitude");
    } else {
      points += 1;
      reasons.push("Event involves a smaller financial amount");
    }
  } else {
    // No value disclosed — doesn't necessarily mean immaterial
    if (highMateriality.includes(input.category)) {
      points += 3;
      reasons.push(
        "No value disclosed, but event type suggests material amounts"
      );
    }
  }

  // Source credibility boost
  const topSources = [
    "Financial Times",
    "FT",
    "Reuters",
    "Bloomberg",
    "Les Echos",
    "Wall Street Journal",
    "WSJ",
    "Private Equity International",
    "Infrastructure Investor",
  ];
  const lowSources = ["Company press release", "press release"];
  if (topSources.some((s) => input.source.includes(s))) {
    points += 3;
    reasons.push(`Reported by ${input.source} (high-credibility source)`);
  } else if (lowSources.some((s) => input.source.toLowerCase().includes(s.toLowerCase()))) {
    points += 0;
    reasons.push("Company press release — lower independent credibility");
  }

  return {
    name: "Materiality",
    maxPoints: 25,
    points: Math.min(points, 25),
    reasoning: reasons.join(". ") + ".",
  };
}

function scoreStrategicImportance(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  if (input.strategicChange) {
    points += 12;
    reasons.push("Event represents a change in company strategy");
  }

  if (input.companyIsPrimaryActor) {
    points += 8;
    reasons.push("Company is the primary actor (not a bystander)");
  } else {
    points += 3;
    reasons.push("Company is indirectly involved or mentioned");
  }

  // M&A, restructuring, and large financings are almost always strategic
  if (["M&A", "Restructuring", "IPO"].includes(input.category)) {
    points += 5;
    reasons.push(`${input.category} typically has strategic significance`);
  } else if (["Financing", "Credit"].includes(input.category)) {
    // Financing is strategic when it's large
    if (input.estimatedValue && input.estimatedValue >= 500_000_000) {
      points += 5;
      reasons.push("Large-scale financing with strategic significance");
    } else if (input.estimatedValue && input.estimatedValue >= 100_000_000) {
      points += 3;
      reasons.push("Significant financing event");
    } else {
      points += 1;
      reasons.push("Financing event of moderate strategic importance");
    }
  }

  // Multi-party events signal strategic complexity
  if (input.companiesInvolved > 1) {
    points += Math.min(input.companiesInvolved - 1, 3);
    reasons.push(
      `${input.companiesInvolved} companies involved — cross-company strategic implications`
    );
  }

  return {
    name: "Strategic importance",
    maxPoints: 25,
    points: Math.min(points, 25),
    reasoning: reasons.join(". ") + ".",
  };
}

function scoreSizeOfEvent(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  if (input.estimatedValue) {
    if (input.estimatedValue >= 2_000_000_000) {
      points += 20;
      reasons.push("€2B+ — exceptionally large event");
    } else if (input.estimatedValue >= 1_000_000_000) {
      points += 16;
      reasons.push("€1B+ — very large event");
    } else if (input.estimatedValue >= 500_000_000) {
      points += 12;
      reasons.push("€500M+ — large event");
    } else if (input.estimatedValue >= 200_000_000) {
      points += 8;
      reasons.push("€200M+ — mid-market event");
    } else if (input.estimatedValue >= 50_000_000) {
      points += 5;
      reasons.push("€50M+ — moderate size");
    } else {
      points += 2;
      reasons.push("Sub-€50M — smaller transaction");
    }
  } else {
    // No disclosed value — estimate from context
    if (["M&A", "Restructuring", "IPO"].includes(input.category)) {
      points += 6;
      reasons.push("No value disclosed, but event type suggests significant scale");
    } else if (
      ["Financing", "Infrastructure", "Credit"].includes(input.category)
    ) {
      points += 4;
      reasons.push("No value disclosed; moderate assumed scale for this event type");
    } else {
      points += 1;
      reasons.push("No value disclosed; event type does not imply large scale");
    }
  }

  return {
    name: "Size of event",
    maxPoints: 20,
    points: Math.min(points, 20),
    reasoning: reasons.join(". ") + ".",
  };
}

function scoreRecency(input: ArticleInput): ScoreFactor {
  const now = new Date();
  const published = new Date(input.publishedAt);
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  let points = 0;
  let reasoning = "";

  if (hoursAgo <= 24) {
    points = 15;
    reasoning = "Published within the last 24 hours — maximum recency.";
  } else if (hoursAgo <= 72) {
    points = 12;
    reasoning = "Published within the last 3 days — very recent.";
  } else if (hoursAgo <= 168) {
    points = 8;
    reasoning = "Published within the last week — recent.";
  } else if (hoursAgo <= 720) {
    points = 4;
    reasoning = "Published within the last month — moderately recent.";
  } else {
    points = 1;
    reasoning = "Published over a month ago — lower recency weight.";
  }

  return {
    name: "Recency",
    maxPoints: 15,
    points,
    reasoning,
  };
}

function scoreCompanyImpact(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // Primary actor gets more points
  if (input.companyIsPrimaryActor) {
    points += 6;
    reasons.push("Company is the primary subject of the article");
  } else {
    points += 2;
    reasons.push("Company is mentioned but not the primary subject");
  }

  // Events that directly change company financials
  const highImpactCategories = [
    "M&A",
    "Financing",
    "Restructuring",
    "IPO",
    "Credit",
  ];
  if (highImpactCategories.includes(input.category)) {
    points += 5;
    reasons.push(
      `${input.category} events directly affect company financial position`
    );
  } else if (input.category === "Regulatory") {
    // Regulatory probes on existing deals are very impactful
    if (input.strategicChange || input.estimatedValue) {
      points += 5;
      reasons.push("Regulatory event affecting an existing strategic transaction");
    } else {
      points += 3;
      reasons.push("Regulatory events can materially affect operations");
    }
  } else if (input.category === "Management") {
    points += 2;
    reasons.push("Management changes may signal strategic shifts");
  }

  // Large events have more impact
  if (input.estimatedValue && input.estimatedValue >= 500_000_000) {
    points += 4;
    reasons.push("Event size likely to have material impact on the company");
  }

  return {
    name: "Impact on the company",
    maxPoints: 15,
    points: Math.min(points, 15),
    reasoning: reasons.join(". ") + ".",
  };
}

export function scoreNewsRelevance(input: ArticleInput): ScoreResult {
  const factors = [
    scoreMateriality(input),
    scoreStrategicImportance(input),
    scoreSizeOfEvent(input),
    scoreRecency(input),
    scoreCompanyImpact(input),
  ];

  const total = factors.reduce((sum, f) => sum + f.points, 0);

  return {
    total: Math.min(total, 100),
    factors,
    priority: getPriorityFromScore(total),
    disclaimer:
      "This score is an automated estimate of how important this news is to the monitored company. It is not a definitive assessment. Factors are weighted heuristics, not certainties.",
    methodologyVersion: SCORING_METHODOLOGY.version,
  };
}

// ─── Score 2: BDGS Finance Opportunity Score (0–100) ────────────────────────
//
// Measures how potentially relevant the event is to a finance law practice.
// Five weighted sub-components:
//   - Financing need (0–30)
//   - Transaction likelihood (0–25)
//   - Potential deal size (0–20)
//   - Relevance to BDGS Finance expertise (0–15)
//   - Actionability / timing (0–10)

function scoreFinancingNeed(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // Explicit financing mention is the strongest signal
  if (input.financingMentioned) {
    points += 15;
    reasons.push("Article explicitly mentions financing needs or arrangements");
  }

  // Event types that inherently create financing needs
  const highFinancingNeed = ["M&A", "LBO", "Restructuring", "Infrastructure"];
  const mediumFinancingNeed = ["IPO", "Credit"];

  if (highFinancingNeed.includes(input.eventType)) {
    points += 10;
    reasons.push(
      `${input.eventType} events typically require significant financing`
    );
  } else if (mediumFinancingNeed.includes(input.eventType)) {
    points += 6;
    reasons.push(`${input.eventType} events often involve financing elements`);
  } else if (input.eventType === "Financing") {
    // Already a financing event — but need to distinguish new vs existing
    points += 12;
    reasons.push("Event is directly about financing");
  } else if (input.eventType === "Regulatory") {
    // Regulatory changes don't inherently create financing needs
    // UNLESS they affect an ongoing deal
    if (input.estimatedValue && input.estimatedValue >= 100_000_000) {
      points += 5;
      reasons.push(
        "Regulatory event affecting a large transaction — may impact financing terms or structure"
      );
    } else {
      points += 2;
      reasons.push(
        "Regulatory events rarely create direct financing needs on their own"
      );
    }
  } else if (input.eventType === "Earnings") {
    // Earnings alone don't create financing needs
    // but may signal future needs
    if (input.financingMentioned) {
      points += 3;
      reasons.push(
        "Earnings report mentions potential financing, but this is forward-looking"
      );
    } else {
      points += 1;
      reasons.push(
        "Earnings reports do not directly indicate a financing need"
      );
    }
  } else if (input.eventType === "Management") {
    points += 1;
    reasons.push(
      "Management changes do not directly create financing needs, though they may precede strategic shifts"
    );
  } else {
    points += 1;
    reasons.push(`${input.eventType} events have limited financing implications`);
  }

  // Large values suggest larger financing packages
  if (input.estimatedValue && input.estimatedValue >= 500_000_000) {
    points += 5;
    reasons.push(
      "Large transaction size typically requires structured financing"
    );
  }

  return {
    name: "Financing need",
    maxPoints: 30,
    points: Math.min(points, 30),
    reasoning: reasons.join(". ") + ".",
  };
}

function scoreTransactionLikelihood(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // Categories where transactions are already happening
  const transactionInProgress = ["M&A", "Financing", "Restructuring", "IPO"];
  const potentialTransaction = ["Infrastructure", "Credit"];

  if (transactionInProgress.includes(input.category)) {
    points += 12;
    reasons.push(`${input.category} — a transaction is already in progress or imminent`);
  } else if (potentialTransaction.includes(input.category)) {
    points += 7;
    reasons.push(`${input.category} — a transaction is plausible but not confirmed`);
  } else if (input.category === "Regulatory" && input.estimatedValue) {
    points += 6;
    reasons.push("Regulatory event references a transaction — deal is likely underway");
  } else {
    points += 2;
    reasons.push(`${input.category} — no clear transaction underway`);
  }

  // Advisors named = deal is real
  if (input.advisorsNamed) {
    points += 8;
    reasons.push(
      "Specific advisors/lenders are named — indicates an active process"
    );
  }

  // Timeline mentioned = deal has momentum
  if (input.timelineMentioned) {
    points += 5;
    reasons.push("A specific timeline or deadline is mentioned — deal has momentum");
  }

  return {
    name: "Transaction likelihood",
    maxPoints: 25,
    points: Math.min(points, 25),
    reasoning: reasons.join(". ") + ".",
  };
}

function scorePotentialDealSize(input: ArticleInput): ScoreFactor {
  let points = 0;
  let reasoning = "";

  if (input.estimatedValue) {
    if (input.estimatedValue >= 2_000_000_000) {
      points = 20;
      reasoning = "€2B+ — represents a very significant potential mandate.";
    } else if (input.estimatedValue >= 1_000_000_000) {
      points = 17;
      reasoning = "€1B+ — large-scale financing likely needed.";
    } else if (input.estimatedValue >= 500_000_000) {
      points = 14;
      reasoning = "€500M+ — substantial potential deal size.";
    } else if (input.estimatedValue >= 200_000_000) {
      points = 10;
      reasoning = "€200M+ — mid-market deal size.";
    } else if (input.estimatedValue >= 50_000_000) {
      points = 6;
      reasoning = "€50M+ — moderate deal size.";
    } else if (input.estimatedValue >= 10_000_000) {
      points = 3;
      reasoning = "€10M+ — smaller deal size, may not justify full advisory.";
    } else {
      points = 1;
      reasoning = "Very small potential deal — limited mandate potential.";
    }
  } else {
    // No disclosed value
    if (["M&A", "Restructuring", "IPO"].includes(input.category)) {
      points = 5;
      reasoning =
        "No value disclosed, but event type often involves significant amounts.";
    } else {
      points = 2;
      reasoning =
        "No value disclosed and event type does not strongly imply a large deal.";
    }
  }

  return {
    name: "Potential deal size",
    maxPoints: 20,
    points: Math.min(points, 20),
    reasoning,
  };
}

function scoreBDGSExpertiseRelevance(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // BDGS Finance practice areas: structured finance, leveraged lending,
  // LBO documentation, project finance, security interests, cross-border
  const corePractice = [
    "M&A",
    "Financing",
    "Restructuring",
    "Infrastructure",
    "Credit",
  ];
  const adjacentPractice = ["IPO"];

  if (corePractice.includes(input.category)) {
    points += 10;
    reasons.push(
      `${input.category} is a core BDGS Finance practice area (structured finance, leveraged lending, project finance)`
    );
  } else if (adjacentPractice.includes(input.category)) {
    points += 5;
    reasons.push(
      `${input.category} is adjacent to BDGS Finance practice but may involve financing elements`
    );
  } else if (input.category === "Regulatory") {
    // Regulatory matters can be relevant if they affect financing
    if (input.financingMentioned) {
      points += 4;
      reasons.push(
        "Regulatory event with financing implications — moderately relevant to practice"
      );
    } else {
      points += 1;
      reasons.push(
        "Regulatory event without clear financing implications — limited practice relevance"
      );
    }
  } else if (input.category === "Earnings") {
    if (input.financingMentioned) {
      points += 3;
      reasons.push(
        "Earnings with financing signals — some relevance to practice"
      );
    } else {
      points += 0;
      reasons.push(
        "Earnings reports without financing signals are not directly relevant to finance law practice"
      );
    }
  } else if (input.category === "Management") {
    points += 1;
    reasons.push(
      "Management changes have limited direct relevance to finance law practice"
    );
  } else {
    points += 1;
    reasons.push(`${input.category} has limited relevance to BDGS Finance practice`);
  }

  // Cross-border transactions are a BDGS strength
  if (input.companiesInvolved > 1) {
    points += 3;
    reasons.push(
      "Multi-party / cross-border element — relevant to BDGS cross-border transaction expertise"
    );
  }

  // Financing explicitly mentioned boosts relevance
  if (input.financingMentioned && !corePractice.includes(input.category)) {
    points += 2;
    reasons.push(
      "Financing mentioned in a non-finance article — additional practice relevance"
    );
  }

  return {
    name: "Relevance to BDGS Finance expertise",
    maxPoints: 15,
    points: Math.min(points, 15),
    reasoning: reasons.join(". ") + ".",
  };
}

function scoreActionabilityTiming(input: ArticleInput): ScoreFactor {
  let points = 0;
  const reasons: string[] = [];

  // Recency matters for actionability
  const now = new Date();
  const published = new Date(input.publishedAt);
  const hoursAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60);

  if (hoursAgo <= 48) {
    points += 4;
    reasons.push("Recent news — window for action is open");
  } else if (hoursAgo <= 168) {
    points += 2;
    reasons.push("Published within a week — some time sensitivity remaining");
  } else if (hoursAgo <= 720) {
    points += 1;
    reasons.push("Published over a week ago — reduced actionability");
  } else {
    points += 0;
    reasons.push("Published over a month ago — actionability window has largely passed");
  }

  // Timeline/deadline mentioned = clear action window
  if (input.timelineMentioned) {
    points += 3;
    reasons.push("Specific timeline mentioned — creates a clear action window");
  }

  // Advisors named but potentially room for more
  if (input.advisorsNamed) {
    points += 2;
    reasons.push(
      "Advisors named — process is live and may have room for additional counsel"
    );
  }

  // Events in early stages are more actionable
  if (["M&A", "Financing", "Infrastructure"].includes(input.category)) {
    points += 1;
    reasons.push("Event type often involves an extended advisory process");
  }

  return {
    name: "Actionability / timing",
    maxPoints: 10,
    points: Math.min(points, 10),
    reasoning: reasons.join(". ") + ".",
  };
}

export function scoreFinanceOpportunity(input: ArticleInput): ScoreResult {
  const factors = [
    scoreFinancingNeed(input),
    scoreTransactionLikelihood(input),
    scorePotentialDealSize(input),
    scoreBDGSExpertiseRelevance(input),
    scoreActionabilityTiming(input),
  ];

  const total = factors.reduce((sum, f) => sum + f.points, 0);

  return {
    total: Math.min(total, 100),
    factors,
    priority: getPriorityFromScore(total),
    disclaimer:
      "This score estimates potential relevance to BDGS Finance practice. It does NOT mean BDGS is involved in this transaction, nor that the opportunity has been verified. Every hypothesis must be validated against the source article before any action.",
    methodologyVersion: SCORING_METHODOLOGY.version,
  };
}

// ─── Main scoring function ──────────────────────────────────────────────────

export function scoreArticle(input: ArticleInput): ScoringOutput {
  return {
    newsRelevance: scoreNewsRelevance(input),
    financeOpportunity: scoreFinanceOpportunity(input),
    scoredAt: new Date().toISOString(),
    methodologyVersion: SCORING_METHODOLOGY.version,
  };
}

// ─── Helper: Extract ArticleInput from a news article + summary text ────────
//
// In a real implementation, this would be done by the AI analysis layer
// parsing the article text. For now, we provide a heuristic extractor.

export function extractArticleInput(article: {
  headline: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  companyIds: string[];
}): ArticleInput {
  const text = `${article.headline} ${article.summary}`.toLowerCase();

  // Extract estimated value from text
  // Patterns ordered from most specific to least; first match wins.
  let estimatedValue: number | undefined;
  const valuePatterns: { regex: RegExp; multiplier: number }[] = [
    // €2.3B, €1B, €3.5B
    { regex: /€(\d+(?:\.\d+)?)\s*b(?:n|illion)?\b/i, multiplier: 1_000_000_000 },
    // €850M, €500M, €40M
    { regex: /€(\d+(?:,\d+)?(?:\.\d+)?)\s*m(?:n|illion)?\b/i, multiplier: 1_000_000 },
    // 2.3 billion euros, 1 billion €
    { regex: /(\d+(?:\.\d+)?)\s*billion\s*(?:euros?|€)/i, multiplier: 1_000_000_000 },
    // 500 million euros
    { regex: /(\d+(?:,\d+)?(?:\.\d+)?)\s*million\s*(?:euros?|€)/i, multiplier: 1_000_000 },
    // "valued at approximately €3.5B" — already covered above
  ];

  for (const { regex, multiplier } of valuePatterns) {
    const match = text.match(regex);
    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ""));
      estimatedValue = num * multiplier;
      break;
    }
  }

  // Check for financing mentions
  const financingKeywords = [
    "financ",
    "loan",
    "debt",
    "credit facilit",
    "bond",
    "refinanc",
    "lending",
    "syndicate",
    "project finance",
    "green bond",
    "senior secured",
    "mezzanine",
    "bridge",
    "term loan",
    "fundrais",
  ];
  const financingMentioned = financingKeywords.some((kw) =>
    text.includes(kw)
  );

  // Check for advisors/lenders named
  const advisorKeywords = [
    "mandated",
    "arranged by",
    "led by",
    "advised by",
    "appointed",
    "placement agent",
    "bookrunner",
    "jpmorgan",
    "goldman",
    "rothschild",
    "lazard",
    "mediobanca",
    "bnp paribas",
    "santander",
    "evercore",
  ];
  const advisorsNamed = advisorKeywords.some((kw) => text.includes(kw));

  // Check for timeline mentions
  const timelineKeywords = [
    "q1",
    "q2",
    "q3",
    "q4",
    "2027",
    "2028",
    "by year",
    "by end",
    "deadline",
    "matur",
    "expected by",
    "over the next",
    "within",
  ];
  const timelineMentioned = timelineKeywords.some((kw) =>
    text.includes(kw)
  );

  // Check if company is primary actor
  const companyIsPrimaryActor = article.companyIds.length <= 2;

  // Check for strategic change signals
  const strategyKeywords = [
    "acquisition",
    "acquir",
    "merger",
    "takeover",
    "divest",
    "dispos",
    "restructur",
    "overhaul",
    "strategic shift",
    "expansion",
    "new market",
    "ipo",
    "listing",
    "delist",
    "spinoff",
    "spin-off",
  ];
  const strategicChange = strategyKeywords.some((kw) =>
    text.includes(kw)
  );

  return {
    headline: article.headline,
    summary: article.summary,
    category: article.category,
    source: article.source,
    publishedAt: article.publishedAt,
    estimatedValue,
    financingMentioned,
    advisorsNamed,
    timelineMentioned,
    eventType: article.category,
    companyIsPrimaryActor,
    strategicChange,
    companiesInvolved: article.companyIds.length,
  };
}
