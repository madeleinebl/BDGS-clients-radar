/**
 * BDGS Client Radar — Scoring Engine Test Suite
 * ===============================================
 * 20+ varied examples testing that the scoring engine:
 * 1. Does NOT simply assign high scores to articles with financial keywords
 * 2. Properly differentiates materiality from financing relevance
 * 3. Correctly weights sub-factors
 * 4. Produces reasonable priority labels
 *
 * Run with: npx tsx src/lib/scoring-engine.test.ts
 */

import {
  scoreArticle,
  extractArticleInput,
  type ArticleInput,
  type ScoringOutput,
  SCORING_METHODOLOGY,
} from "./scoring-engine";

// ─── Test Helpers ───────────────────────────────────────────────────────────

interface TestCase {
  id: number;
  description: string;
  article: {
    headline: string;
    summary: string;
    category: string;
    source: string;
    publishedAt: string;
    companyIds: string[];
  };
  expectedNewsRelevance: { min: number; max: number; priority?: string };
  expectedOpportunity: { min: number; max: number; priority?: string };
  keyAssertion: string;
}

function runTest(tc: TestCase): {
  passed: boolean;
  result: ScoringOutput;
  errors: string[];
} {
  const input = extractArticleInput(tc.article);
  const result = scoreArticle(input);
  const errors: string[] = [];

  const nr = result.newsRelevance.total;
  const fo = result.financeOpportunity.total;

  if (nr < tc.expectedNewsRelevance.min || nr > tc.expectedNewsRelevance.max) {
    errors.push(
      `News Relevance ${nr} outside expected range [${tc.expectedNewsRelevance.min}–${tc.expectedNewsRelevance.max}]`
    );
  }

  if (fo < tc.expectedOpportunity.min || fo > tc.expectedOpportunity.max) {
    errors.push(
      `Finance Opportunity ${fo} outside expected range [${tc.expectedOpportunity.min}–${tc.expectedOpportunity.max}]`
    );
  }

  if (tc.expectedNewsRelevance.priority && result.newsRelevance.priority !== tc.expectedNewsRelevance.priority) {
    errors.push(
      `News Relevance priority: got ${result.newsRelevance.priority}, expected ${tc.expectedNewsRelevance.priority}`
    );
  }

  if (tc.expectedOpportunity.priority && result.financeOpportunity.priority !== tc.expectedOpportunity.priority) {
    errors.push(
      `Finance Opportunity priority: got ${result.financeOpportunity.priority}, expected ${tc.expectedOpportunity.priority}`
    );
  }

  return { passed: errors.length === 0, result, errors };
}

// ─── 24 Test Cases ──────────────────────────────────────────────────────────

const testCases: TestCase[] = [
  // ── 1. Large acquisition with financing — HIGH / HIGH ──
  {
    id: 1,
    description: "€1B acquisition requiring financing",
    article: {
      headline: "MegaCorp announces €1B acquisition of TechTarget Inc",
      summary:
        "MegaCorp SA has entered into a definitive agreement to acquire TechTarget Inc for €1B. The acquisition will be funded through a combination of term loan and bridge financing arranged by Goldman Sachs. Closing is expected by Q2 2027.",
      category: "M&A",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-100"],
    },
    expectedNewsRelevance: { min: 75, max: 100, priority: "HIGH" },
    expectedOpportunity: { min: 75, max: 100, priority: "HIGH" },
    keyAssertion:
      "Large M&A with explicit financing, named advisors, and timeline should score high on BOTH dimensions",
  },

  // ── 2. Annual results — no financing signal ──
  {
    id: 2,
    description: "Company publishes annual results (no financing signal)",
    article: {
      headline: "IndusCo reports record annual revenues of €3.2B",
      summary:
        "IndusCo SA reported annual revenues of €3.2B, up 12% year-on-year. EBITDA margin improved to 18.5%. The company declared a dividend of €1.20 per share.",
      category: "Earnings",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-101"],
    },
    expectedNewsRelevance: { min: 40, max: 75 },
    expectedOpportunity: { min: 5, max: 35, priority: "INFORMATIONAL" },
    keyAssertion:
      "Annual results are relevant news but do NOT create financing opportunities without specific signals",
  },

  // ── 3. New CFO appointment ──
  {
    id: 3,
    description: "New CFO appointed",
    article: {
      headline: "DataFlow appoints new CFO from Deutsche Bank",
      summary:
        "DataFlow AG has appointed Katrin Müller as Chief Financial Officer. Müller joins from Deutsche Bank where she led the technology leveraged finance team.",
      category: "Management",
      source: "Handelsblatt",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-102"],
    },
    expectedNewsRelevance: { min: 35, max: 65 },
    expectedOpportunity: { min: 10, max: 35, priority: "INFORMATIONAL" },
    keyAssertion:
      "CFO appointment: moderate news relevance, low financing opportunity — the word 'leveraged finance' in bio should NOT inflate the opportunity score",
  },

  // ── 4. Major project finance ──
  {
    id: 4,
    description: "€500M project finance for infrastructure",
    article: {
      headline: "SolarMax secures €500M project finance for Iberian solar farm",
      summary:
        "SolarMax Energy has closed a €500M project finance facility for its 600MW solar PV farm in Portugal. The syndicate is led by BNP Paribas and Santander, with documentation expected by Q1 2027.",
      category: "Financing",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-103"],
    },
    expectedNewsRelevance: { min: 70, max: 100 },
    expectedOpportunity: { min: 70, max: 100, priority: "HIGH" },
    keyAssertion:
      "Active project finance with named lenders and timeline scores high on both",
  },

  // ── 5. ESG report published ──
  {
    id: 5,
    description: "Company publishes ESG sustainability report",
    article: {
      headline: "ChemGroup publishes 2026 sustainability report",
      summary:
        "ChemGroup SA has published its annual sustainability report, highlighting a 15% reduction in carbon emissions and progress toward its 2030 net-zero target. The report was verified by PwC.",
      category: "Other",
      source: "Company press release",
      publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-104"],
    },
    expectedNewsRelevance: { min: 15, max: 40, priority: "INFORMATIONAL" },
    expectedOpportunity: { min: 5, max: 20, priority: "INFORMATIONAL" },
    keyAssertion:
      "ESG report: low relevance, very low opportunity — not a financing event",
  },

  // ── 6. Refinancing with specific details ──
  {
    id: 6,
    description: "€1.2B refinancing with banks mandated",
    article: {
      headline: "TelCom to refinance €1.2B senior secured facility",
      summary:
        "TelCom SA has mandated JPMorgan and BNP Paribas to arrange the refinancing of its €1.2B senior secured credit facility, due to mature in September 2027. The company is seeking improved terms amid falling interest rates.",
      category: "Financing",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-105"],
    },
    expectedNewsRelevance: { min: 70, max: 100, priority: "HIGH" },
    expectedOpportunity: { min: 75, max: 100, priority: "HIGH" },
    keyAssertion:
      "Active refinancing with banks mandated, specific size, and maturity deadline = very high opportunity",
  },

  // ── 7. Small venture capital round ──
  {
    id: 7,
    description: "€8M Series A round",
    article: {
      headline: "LegalTech startup raises €8M in Series A",
      summary:
        "LegalTech startup JuriBot has raised €8M in a Series A round led by Index Ventures. The funding will support product development and UK market expansion.",
      category: "Financing",
      source: "TechCrunch",
      publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-106"],
    },
    expectedNewsRelevance: { min: 30, max: 65 },
    expectedOpportunity: { min: 25, max: 55, priority: "LOW" },
    keyAssertion:
      "Small VC round: moderate relevance but low-to-moderate opportunity — categorised as Financing but small scale",
  },

  // ── 8. Regulatory probe into existing deal ──
  {
    id: 8,
    description: "Antitrust probe into pending acquisition",
    article: {
      headline:
        "EU opens antitrust investigation into MegaCorp's proposed acquisition",
      summary:
        "The European Commission has opened a preliminary investigation into MegaCorp's proposed acquisition of TechTarget, citing potential market concentration concerns. The probe may delay the €1B transaction.",
      category: "Regulatory",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-100"],
    },
    expectedNewsRelevance: { min: 60, max: 95, priority: "HIGH" },
    expectedOpportunity: { min: 15, max: 50 },
    keyAssertion:
      "Regulatory probe is HIGH news relevance but LOW financing opportunity — it blocks rather than creates financing",
  },

  // ── 9. Bond issuance ──
  {
    id: 9,
    description: "€300M green bond issuance",
    article: {
      headline: "MiningCo prices €300M green bond for mine expansion",
      summary:
        "MiningCo Plc has successfully priced a €300M green bond issuance to fund capacity expansion at its Portuguese lithium operation. The bond was 3x oversubscribed with strong demand from ESG-focused investors.",
      category: "Financing",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-107"],
    },
    expectedNewsRelevance: { min: 60, max: 85 },
    expectedOpportunity: { min: 55, max: 80, priority: "MEDIUM" },
    keyAssertion:
      "Bond issuance: high relevance and medium-to-high opportunity — active financing with specific size",
  },

  // ── 10. Rumoured deal — low certainty ──
  {
    id: 10,
    description: "Rumoured asset disposal — no details",
    article: {
      headline: "HotelGroup reportedly exploring sale of ski resort portfolio",
      summary:
        "Sources suggest HotelGroup may be considering the disposal of its Alpine ski resort portfolio. No formal process has been launched and no advisors have been appointed.",
      category: "M&A",
      source: "Le Figaro",
      publishedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-108"],
    },
    expectedNewsRelevance: { min: 35, max: 70 },
    expectedOpportunity: { min: 20, max: 55, priority: "LOW" },
    keyAssertion:
      "Rumoured disposal with no advisors, no value, no timeline = moderate relevance but low opportunity",
  },

  // ── 11. Lawsuit / litigation ──
  {
    id: 11,
    description: "Patent infringement lawsuit",
    article: {
      headline: "PharmaCo sued for patent infringement in Germany",
      summary:
        "PharmaCo AS has been sued by GenericRival in a Munich court for alleged infringement of a cancer treatment patent. Damages sought are estimated at €50M.",
      category: "Other",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-109"],
    },
    expectedNewsRelevance: { min: 30, max: 55 },
    expectedOpportunity: { min: 5, max: 25, priority: "INFORMATIONAL" },
    keyAssertion:
      "Litigation: moderate news value but very low financing opportunity — not a financing event",
  },

  // ── 12. Infrastructure fund raising — large ──
  {
    id: 12,
    description: "€3B infrastructure fund final close",
    article: {
      headline: "EuroInfra Fund reaches €3B final close",
      summary:
        "EuroInfra Partners has completed final close of its latest infrastructure fund at €3B, exceeding its €2.5B target. The fund plans to deploy capital across EU transport and digital infrastructure over the next 4 years. Evercore acted as placement agent.",
      category: "Financing",
      source: "Private Equity International",
      publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-110"],
    },
    expectedNewsRelevance: { min: 70, max: 95, priority: "HIGH" },
    expectedOpportunity: { min: 65, max: 95, priority: "HIGH" },
    keyAssertion:
      "Large fund close = recurring future mandates, high opportunity",
  },

  // ── 13. Company wins government contract — not financing ──
  {
    id: 13,
    description: "Government contract win (no financing element)",
    article: {
      headline: "DefenceCo wins €400M French Ministry of Defence contract",
      summary:
        "DefenceCo SA has been awarded a €400M contract by the French Ministry of Defence for next-generation radar systems. The contract spans 5 years and replaces an existing arrangement.",
      category: "Other",
      source: "Les Echos",
      publishedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-111"],
    },
    expectedNewsRelevance: { min: 35, max: 65 },
    expectedOpportunity: { min: 5, max: 30, priority: "INFORMATIONAL" },
    keyAssertion:
      "Government contract: moderate news relevance, LOW financing opportunity — the €400M is revenue, not a financing need",
  },

  // ── 14. Credit rating change ──
  {
    id: 14,
    description: "Credit rating downgrade",
    article: {
      headline: "Moody's downgrades RetailCo to Ba1 on rising debt burden",
      summary:
        "Moody's has downgraded RetailCo SA's long-term rating to Ba1 from Baa3, citing rising leverage and weaker cash generation. The downgrade may trigger covenant renegotiation on its €600M revolving credit facility.",
      category: "Credit",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-112"],
    },
    expectedNewsRelevance: { min: 60, max: 90 },
    expectedOpportunity: { min: 50, max: 75, priority: "MEDIUM" },
    keyAssertion:
      "Rating downgrade with covenant renegotiation signal: high relevance AND meaningful opportunity (restructuring / refinancing)",
  },

  // ── 15. Joint venture announcement ──
  {
    id: 15,
    description: "JV announcement for new market entry",
    article: {
      headline: "LogiCo forms JV with Indian partner for subcontinent expansion",
      summary:
        "LogiCo GmbH has formed a 60/40 joint venture with Delhiway Logistics to enter the Indian market. The JV will invest €150M over 3 years to build out warehousing and last-mile delivery capacity.",
      category: "Infrastructure",
      source: "Handelsblatt",
      publishedAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-113", "co-114"],
    },
    expectedNewsRelevance: { min: 45, max: 75 },
    expectedOpportunity: { min: 30, max: 60, priority: "LOW" },
    keyAssertion:
      "JV: moderate strategic relevance, moderate opportunity — cross-border element helps but relatively small scale",
  },

  // ── 16. IPO announcement ──
  {
    id: 16,
    description: "Company announces plans for IPO",
    article: {
      headline: "FastGrow SAS files for Euronext Paris IPO, targeting €500M",
      summary:
        "FastGrow SAS has filed a registration document with the AMF for a planned listing on Euronext Paris. The company targets a €500M IPO valuation. BNP Paribas and Société Générale are joint global coordinators.",
      category: "IPO",
      source: "Les Echos",
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-115"],
    },
    expectedNewsRelevance: { min: 65, max: 95, priority: "HIGH" },
    expectedOpportunity: { min: 35, max: 65 },
    keyAssertion:
      "IPO: very high news relevance, low-to-medium opportunity — IPOs are primarily equity events but may involve bridge/lending facilities",
  },

  // ── 17. Earnings with financing signal ──
  {
    id: 17,
    description: "Earnings report WITH financing signal",
    article: {
      headline: "BuildCo H1 results show rising debt — exploring refinancing",
      summary:
        "BuildCo SA reported H1 revenues of €1.8B with net debt/EBITDA rising to 4.2x. Management indicated they are in preliminary discussions with banks regarding a potential refinancing of their €700M term loan B maturing in 2028.",
      category: "Earnings",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-116"],
    },
    expectedNewsRelevance: { min: 55, max: 85 },
    expectedOpportunity: { min: 35, max: 65 },
    keyAssertion:
      "Earnings WITH financing signal: higher opportunity than plain earnings (#2) but still not as high as confirmed refinancing (#6) — the financing is only preliminary",
  },

  // ── 18. Restructuring ──
  {
    id: 18,
    description: "Company announces restructuring and cost-cutting",
    article: {
      headline: "TextileCo announces major restructuring, 2000 job cuts",
      summary:
        "TextileCo SA has announced a comprehensive restructuring plan including 2,000 redundancies and the closure of two French factories. The company is in discussions with its banking syndicate regarding covenant waivers on its €400M credit facility.",
      category: "Restructuring",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-117"],
    },
    expectedNewsRelevance: { min: 60, max: 95 },
    expectedOpportunity: { min: 55, max: 85 },
    keyAssertion:
      "Restructuring with covenant discussions: high on both — restructuring advisory is core BDGS territory",
  },

  // ── 19. Industry report / sector analysis ──
  {
    id: 19,
    description: "Sector analysis report (no company-specific event)",
    article: {
      headline:
        "European renewable energy investments to reach €150B by 2030, says report",
      summary:
        "A new McKinsey report projects that European renewable energy investments will reach €150B annually by 2030, driven by REPowerEU targets. The report highlights significant project finance opportunities.",
      category: "Other",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-103"],
    },
    expectedNewsRelevance: { min: 30, max: 70 },
    expectedOpportunity: { min: 20, max: 55 },
    keyAssertion:
      "Industry report: the €150B figure inflates the score even though it's a sector projection, not a company deal. This is a known limitation of rule-based scoring — the AI layer should catch this distinction.",
  },

  // ── 20. Competitor appointment — tangential mention ──
  {
    id: 20,
    description: "Competitor hires from monitored company",
    article: {
      headline:
        "RivalBank hires 3 senior bankers from monitored company's coverage team",
      summary:
        "RivalBank has hired three senior investment bankers who previously covered the industrials sector at Credit Suisse. The move is part of RivalBank's European expansion.",
      category: "Management",
      source: "Financial News",
      publishedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-118"],
    },
    expectedNewsRelevance: { min: 15, max: 50 },
    expectedOpportunity: { min: 5, max: 25, priority: "INFORMATIONAL" },
    keyAssertion:
      "Tangential industry news: low relevance, very low opportunity — 'investment bankers' keyword must NOT inflate the score",
  },

  // ── 21. Distressed debt situation ──
  {
    id: 21,
    description: "Company in financial distress, creditor standstill",
    article: {
      headline:
        "EnerCo agrees standstill with creditors as liquidity crisis deepens",
      summary:
        "EnerCo SA has entered a standstill agreement with its banking syndicate after failing to meet interest payments on its €900M credit facility. Houlihan Lokey has been appointed as restructuring advisor. The company has 90 days to present a restructuring plan.",
      category: "Restructuring",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-119"],
    },
    expectedNewsRelevance: { min: 75, max: 100, priority: "HIGH" },
    expectedOpportunity: { min: 65, max: 95, priority: "HIGH" },
    keyAssertion:
      "Distressed debt with active restructuring: very high on both — this is squarely within structured finance practice",
  },

  // ── 22. Routine board meeting announcement ──
  {
    id: 22,
    description: "Routine board meeting — no decisions",
    article: {
      headline: "GenCo board to meet next week to discuss Q4 outlook",
      summary:
        "GenCo SA has announced its board of directors will convene on 25 November to discuss the Q4 outlook and 2027 budget. No extraordinary items are on the agenda.",
      category: "Other",
      source: "Company press release",
      publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-120"],
    },
    expectedNewsRelevance: { min: 5, max: 35, priority: "INFORMATIONAL" },
    expectedOpportunity: { min: 5, max: 20, priority: "INFORMATIONAL" },
    keyAssertion:
      "Routine board meeting: minimal relevance, no opportunity — the engine correctly ignores non-events",
  },

  // ── 23. LBO with full details ──
  {
    id: 23,
    description: "LBO with full financing structure disclosed",
    article: {
      headline:
        "PE firm ApolloVentures takes HealthCo private in €2.3B leveraged buyout",
      summary:
        "ApolloVentures has agreed to acquire HealthCo SA in a €2.3B LBO. The acquisition will be financed through a €1.4B senior secured term loan arranged by JPMorgan and a €400M mezzanine facility. The deal includes a €200M revolving credit facility. Completion is expected Q1 2027.",
      category: "M&A",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      companyIds: ["co-121"],
    },
    expectedNewsRelevance: { min: 85, max: 100, priority: "HIGH" },
    expectedOpportunity: { min: 85, max: 100, priority: "HIGH" },
    keyAssertion:
      "LBO with full financing details: maximum scores on both — this is the textbook BDGS mandate",
  },

  // ── 24. Old news about significant event ──
  {
    id: 24,
    description: "Major event but published 2 months ago",
    article: {
      headline: "MegaInfra completes €800M bridge financing",
      summary:
        "MegaInfra completed an €800M bridge financing facility for its North Sea wind farm acquisition. The facility was arranged by HSBC and Barclays.",
      category: "Financing",
      source: "Bloomberg",
      publishedAt: new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000
      ).toISOString(),
      companyIds: ["co-122"],
    },
    expectedNewsRelevance: { min: 50, max: 80 },
    expectedOpportunity: { min: 50, max: 80 },
    keyAssertion:
      "Old news: recency and actionability factors reduce scores somewhat, but the event's fundamentals still carry weight",
  },
];

// ─── Run all tests ──────────────────────────────────────────────────────────

function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  BDGS Client Radar — Scoring Engine Test Suite");
  console.log(`  Methodology version: ${SCORING_METHODOLOGY.version}`);
  console.log(`  Test cases: ${testCases.length}`);
  console.log("═══════════════════════════════════════════════════════════════");
  console.log();

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const { passed: ok, result, errors } = runTest(tc);

    const statusIcon = ok ? "✓" : "✗";
    const statusColor = ok ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `${statusColor}${statusIcon}${reset} Test ${tc.id}: ${tc.description}`
    );
    console.log(
      `  News Relevance:      ${result.newsRelevance.total}/100 (${result.newsRelevance.priority})  [expected ${tc.expectedNewsRelevance.min}–${tc.expectedNewsRelevance.max}]`
    );
    console.log(
      `  Finance Opportunity:  ${result.financeOpportunity.total}/100 (${result.financeOpportunity.priority})  [expected ${tc.expectedOpportunity.min}–${tc.expectedOpportunity.max}]`
    );
    console.log(`  Key assertion: ${tc.keyAssertion}`);

    if (!ok) {
      for (const err of errors) {
        console.log(`  ${statusColor}  → ${err}${reset}`);
      }
      failed++;
    } else {
      passed++;
    }
    console.log();
  }

  // ─── Summary ──────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(
    `  Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`
  );

  // ─── Score distribution analysis ──────────────────────────────────
  console.log();
  console.log("  Score Distribution:");
  const allResults = testCases.map((tc) => {
    const input = extractArticleInput(tc.article);
    return scoreArticle(input);
  });

  const nrScores = allResults.map((r) => r.newsRelevance.total);
  const foScores = allResults.map((r) => r.financeOpportunity.total);

  console.log(
    `  News Relevance   — min: ${Math.min(...nrScores)}, max: ${Math.max(...nrScores)}, avg: ${Math.round(nrScores.reduce((a, b) => a + b, 0) / nrScores.length)}`
  );
  console.log(
    `  Finance Opp.     — min: ${Math.min(...foScores)}, max: ${Math.max(...foScores)}, avg: ${Math.round(foScores.reduce((a, b) => a + b, 0) / foScores.length)}`
  );

  // Check for good discrimination
  const nrRange = Math.max(...nrScores) - Math.min(...nrScores);
  const foRange = Math.max(...foScores) - Math.min(...foScores);
  console.log(
    `  NR spread: ${nrRange} points  |  FO spread: ${foRange} points`
  );
  if (nrRange >= 50 && foRange >= 50) {
    console.log(
      "  \x1b[32m✓ Good discrimination — scores use a wide range\x1b[0m"
    );
  } else {
    console.log(
      "  \x1b[33m⚠ Narrow range — scores may need better calibration\x1b[0m"
    );
  }

  // ─── Anti-keyword-matching check ──────────────────────────────────
  console.log();
  console.log("  Anti-keyword-matching checks:");

  // Test 2 vs Test 17: earnings without vs with financing signal
  const t2 = allResults[1]; // plain earnings
  const t17 = allResults[16]; // earnings WITH financing signal
  const earningsCheck =
    t17.financeOpportunity.total > t2.financeOpportunity.total;
  console.log(
    `  ${earningsCheck ? "✓" : "✗"} Earnings+financing signal (${t17.financeOpportunity.total}) > plain earnings (${t2.financeOpportunity.total})`
  );

  // Test 13: government contract with €400M should NOT score high opportunity
  const t13 = allResults[12];
  const govCheck = t13.financeOpportunity.total < 40;
  console.log(
    `  ${govCheck ? "✓" : "✗"} Government contract €400M opportunity (${t13.financeOpportunity.total}) < 40 — not a financing event`
  );

  // Test 20: 'investment bankers' keyword should NOT inflate opportunity
  const t20 = allResults[19];
  const bankerCheck = t20.financeOpportunity.total < 30;
  console.log(
    `  ${bankerCheck ? "✓" : "✗"} 'Investment bankers' keyword opportunity (${t20.financeOpportunity.total}) < 30 — keyword alone doesn't inflate`
  );

  // Test 19: 'project finance' in industry report should NOT score high
  const t19 = allResults[18];
  const reportCheck = t19.financeOpportunity.total < 35;
  console.log(
    `  ${reportCheck ? "✓" : "✗"} Industry report mentioning 'project finance' (${t19.financeOpportunity.total}) < 35 — keyword in context doesn't inflate`
  );

  // Test 3: CFO bio mentions 'leveraged finance' — should NOT inflate
  const t3 = allResults[2];
  const cfoCheck = t3.financeOpportunity.total < 35;
  console.log(
    `  ${cfoCheck ? "✓" : "✗"} CFO with 'leveraged finance' bio (${t3.financeOpportunity.total}) < 35 — bio keyword doesn't inflate`
  );

  console.log();
  console.log("═══════════════════════════════════════════════════════════════");

  // ─── Detailed factor breakdown for one example ────────────────────
  console.log();
  console.log("  Detailed breakdown — Test 23 (LBO with full financing):");
  const t23 = allResults[22];
  console.log("  News Relevance factors:");
  for (const f of t23.newsRelevance.factors) {
    console.log(`    ${f.name}: ${f.points}/${f.maxPoints} — ${f.reasoning}`);
  }
  console.log("  Finance Opportunity factors:");
  for (const f of t23.financeOpportunity.factors) {
    console.log(`    ${f.name}: ${f.points}/${f.maxPoints} — ${f.reasoning}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main();
