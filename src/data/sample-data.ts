/**
 * BDGS Client Radar — Sample Data
 * ================================
 * THIS IS TEST DATA. All companies, deals, and news items below are fictitious
 * or use publicly known information for demonstration purposes only.
 * None of this data represents actual BDGS clients or confidential information.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  sector: string;
  country: string;
  website: string;
  description: string;
  isPublic: boolean;
  ticker?: string;
  exchange?: string;
  dealCount: number;
  latestNewsDate: string;
  watchlisted: boolean;
  monitoringStatus: "active" | "paused" | "archived";
  priority: "high" | "medium" | "low";
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  companyIds: string[];
  category:
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
  summary: string;
  relevanceScore: number;
  opportunityScore: number;
  isRead: boolean;
  watchlisted: boolean;
}

export interface Deal {
  id: string;
  name: string;
  companyId: string;
  dealType:
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
  counterparty?: string;
  amount?: number;
  currency: string;
  status:
    | "rumoured"
    | "announced"
    | "in_progress"
    | "closed"
    | "cancelled";
  announcementDate: string;
  closingDate?: string;
  lastUpdated: string;
  source: string;
  sourceUrl: string;
  summary: string;
  buyers: string[];
  sellers: string[];
  advisors: string[];
  watchlisted: boolean;
}

export interface Opportunity {
  id: string;
  headline: string;
  companyId: string;
  sourceArticleId: string;
  signalType:
    | "acquisition_target"
    | "refinancing_due"
    | "debt_maturity"
    | "capex_announced"
    | "restructuring"
    | "ipo_preparation"
    | "joint_venture"
    | "regulatory_change"
    | "management_change"
    | "asset_disposal"
    | "credit_rating_change";
  confidence: "high" | "medium" | "low";
  status: "new" | "under_review" | "qualified" | "dismissed";
  detectedAt: string;
  hypothesis: string;
  relevanceScore: number;
  opportunityScore: number;
  practiceAreas: string[];
  watchlisted: boolean;
}

export interface Briefing {
  id: string;
  type: "daily" | "weekly";
  date: string;
  generatedAt: string;
  title: string;
  summary: string;
  highlights: string[];
  articleCount: number;
  highlightCount: number;
  dealCount: number;
  articleIds: string[];
}

export interface WatchlistItem {
  id: string;
  entityType: "company" | "deal" | "news" | "opportunity";
  entityId: string;
  label: string;
  companyId?: string;
  addedAt: string;
  reason?: string;
}

// ─── Companies (Test Data) ───────────────────────────────────────────────────

export const companies: Company[] = [
  {
    id: "co-001",
    name: "Meridian Industries SA",
    sector: "Industrials",
    country: "France",
    website: "https://example.com/meridian",
    description:
      "French industrial conglomerate active in aerospace components and defence electronics. Listed on Euronext Paris.",
    isPublic: true,
    ticker: "MRID",
    exchange: "Euronext Paris",
    dealCount: 4,
    latestNewsDate: "2026-11-18",
    watchlisted: true,
    monitoringStatus: "active",
    priority: "high",
  },
  {
    id: "co-002",
    name: "NordStream Logistics GmbH",
    sector: "Transportation & Logistics",
    country: "Germany",
    website: "https://example.com/nordstream-log",
    description:
      "German freight and logistics operator with rail and road networks across Central Europe. Privately held by founding family.",
    isPublic: false,
    dealCount: 2,
    latestNewsDate: "2026-11-17",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "medium",
  },
  {
    id: "co-003",
    name: "Solaris Energy Group",
    sector: "Energy & Utilities",
    country: "Spain",
    website: "https://example.com/solaris",
    description:
      "Spanish renewable energy developer focused on solar PV and onshore wind. IBEX 35 constituent.",
    isPublic: true,
    ticker: "SOLR",
    exchange: "BME",
    dealCount: 3,
    latestNewsDate: "2026-11-19",
    watchlisted: true,
    monitoringStatus: "active",
    priority: "high",
  },
  {
    id: "co-004",
    name: "Château Hospitality SASU",
    sector: "Hospitality & Leisure",
    country: "France",
    website: "https://example.com/chateau-hosp",
    description:
      "French luxury hotel and resort operator. Portfolio of 12 properties across France and Switzerland. PE-backed since 2023.",
    isPublic: false,
    dealCount: 1,
    latestNewsDate: "2026-11-15",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "low",
  },
  {
    id: "co-005",
    name: "Baltic Pharma AS",
    sector: "Healthcare & Pharma",
    country: "Denmark",
    website: "https://example.com/baltic-pharma",
    description:
      "Danish pharmaceutical company specialising in generic oncology drugs. Listed on Nasdaq Copenhagen.",
    isPublic: true,
    ticker: "BPHA",
    exchange: "Nasdaq Copenhagen",
    dealCount: 2,
    latestNewsDate: "2026-11-16",
    watchlisted: true,
    monitoringStatus: "active",
    priority: "medium",
  },
  {
    id: "co-006",
    name: "Atlas Digital SAS",
    sector: "Technology",
    country: "France",
    website: "https://example.com/atlas-digital",
    description:
      "French enterprise SaaS company providing compliance and regulatory technology solutions to financial institutions.",
    isPublic: false,
    dealCount: 1,
    latestNewsDate: "2026-11-18",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "medium",
  },
  {
    id: "co-007",
    name: "PanEuropean Infrastructure Fund",
    sector: "Financial Services",
    country: "Luxembourg",
    website: "https://example.com/peif",
    description:
      "Luxembourg-domiciled infrastructure fund investing in transport, energy, and digital infrastructure across the EU.",
    isPublic: false,
    dealCount: 5,
    latestNewsDate: "2026-11-19",
    watchlisted: true,
    monitoringStatus: "active",
    priority: "high",
  },
  {
    id: "co-008",
    name: "Valterra Mining Plc",
    sector: "Mining & Metals",
    country: "United Kingdom",
    website: "https://example.com/valterra",
    description:
      "UK-listed mining company with copper and lithium assets in Chile and Portugal.",
    isPublic: true,
    ticker: "VLTR",
    exchange: "LSE",
    dealCount: 2,
    latestNewsDate: "2026-11-14",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "low",
  },
  {
    id: "co-009",
    name: "Riviera Telecom SA",
    sector: "Telecommunications",
    country: "Italy",
    website: "https://example.com/riviera-tel",
    description:
      "Italian mobile and fibre broadband operator serving southern Italy and Sardinia.",
    isPublic: true,
    ticker: "RVTL",
    exchange: "Borsa Italiana",
    dealCount: 3,
    latestNewsDate: "2026-11-17",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "medium",
  },
  {
    id: "co-010",
    name: "GreenPort Terminals BV",
    sector: "Infrastructure",
    country: "Netherlands",
    website: "https://example.com/greenport",
    description:
      "Dutch port logistics and terminal operator. Active in Rotterdam and Antwerp container terminals.",
    isPublic: false,
    dealCount: 2,
    latestNewsDate: "2026-11-18",
    watchlisted: false,
    monitoringStatus: "active",
    priority: "medium",
  },
];

// ─── News (Test Data) ────────────────────────────────────────────────────────

export const newsArticles: NewsArticle[] = [
  {
    id: "news-001",
    headline:
      "Meridian Industries considers acquisition of UK defence electronics firm",
    source: "Les Echos",
    sourceUrl: "https://example.com/article/meridian-uk-acquisition",
    publishedAt: "2026-11-18T08:30:00Z",
    companyIds: ["co-001"],
    category: "M&A",
    summary:
      "Meridian Industries SA is reportedly in advanced discussions to acquire Sentinel Electronics Ltd, a UK-based defence electronics maker, in a deal valued at approximately €850M. Sources close to the matter indicate financing is being arranged.",
    relevanceScore: 92,
    opportunityScore: 88,
    isRead: false,
    watchlisted: true,
  },
  {
    id: "news-002",
    headline:
      "Solaris Energy secures €500M project finance for Andalusian solar farm",
    source: "Reuters",
    sourceUrl: "https://example.com/article/solaris-andalusia",
    publishedAt: "2026-11-19T06:15:00Z",
    companyIds: ["co-003"],
    category: "Financing",
    summary:
      "Solaris Energy Group announced a €500M project finance facility for its 400MW solar PV installation in Andalusia. The syndicate is led by BNP Paribas and Santander, with documentation expected by Q1 2027.",
    relevanceScore: 95,
    opportunityScore: 82,
    isRead: false,
    watchlisted: false,
  },
  {
    id: "news-003",
    headline:
      "PanEuropean Infrastructure Fund closes €2.1B fundraise ahead of target",
    source: "Private Equity International",
    sourceUrl: "https://example.com/article/peif-fundraise",
    publishedAt: "2026-11-19T10:00:00Z",
    companyIds: ["co-007"],
    category: "Financing",
    summary:
      "PanEuropean Infrastructure Fund has completed final close of its latest vehicle at €2.1B, exceeding its €1.8B target. The fund plans to deploy capital across EU transport and energy transition assets over the next 3 years.",
    relevanceScore: 87,
    opportunityScore: 78,
    isRead: false,
    watchlisted: false,
  },
  {
    id: "news-004",
    headline:
      "Baltic Pharma receives EMA approval for generic oncology treatment",
    source: "FT",
    sourceUrl: "https://example.com/article/baltic-ema",
    publishedAt: "2026-11-16T14:20:00Z",
    companyIds: ["co-005"],
    category: "Regulatory",
    summary:
      "Baltic Pharma AS has obtained European Medicines Agency approval for its generic version of a widely prescribed oncology drug. The approval is expected to open a €300M+ annual European market for the company.",
    relevanceScore: 72,
    opportunityScore: 55,
    isRead: true,
    watchlisted: false,
  },
  {
    id: "news-005",
    headline:
      "NordStream Logistics announces management overhaul as CEO steps down",
    source: "Handelsblatt",
    sourceUrl: "https://example.com/article/nordstream-ceo",
    publishedAt: "2026-11-17T09:45:00Z",
    companyIds: ["co-002"],
    category: "Management",
    summary:
      "NordStream Logistics CEO Hans Weber is stepping down after 15 years, to be replaced by former DHL executive Maria Hoffmann. The transition signals a potential strategic shift toward pan-European expansion.",
    relevanceScore: 65,
    opportunityScore: 42,
    isRead: true,
    watchlisted: false,
  },
  {
    id: "news-006",
    headline:
      "Atlas Digital raises €40M Series C to expand regtech platform",
    source: "TechCrunch",
    sourceUrl: "https://example.com/article/atlas-series-c",
    publishedAt: "2026-11-18T12:00:00Z",
    companyIds: ["co-006"],
    category: "Financing",
    summary:
      "Atlas Digital SAS has closed a €40M Series C round led by Eurazeo Growth, bringing total funding to €72M. The capital will fund expansion into UK and DACH markets.",
    relevanceScore: 68,
    opportunityScore: 60,
    isRead: false,
    watchlisted: false,
  },
  {
    id: "news-007",
    headline:
      "Riviera Telecom to refinance €1.2B senior debt facility maturing in 2027",
    source: "Bloomberg",
    sourceUrl: "https://example.com/article/riviera-refi",
    publishedAt: "2026-11-17T16:30:00Z",
    companyIds: ["co-009"],
    category: "Financing",
    summary:
      "Riviera Telecom SA has mandated JPMorgan and Mediobanca to arrange the refinancing of its €1.2B senior secured credit facility, due to mature in September 2027. The company is seeking improved terms amid falling interest rates.",
    relevanceScore: 90,
    opportunityScore: 85,
    isRead: false,
    watchlisted: true,
  },
  {
    id: "news-008",
    headline:
      "GreenPort Terminals plans €350M expansion of Rotterdam container hub",
    source: "Lloyd's List",
    sourceUrl: "https://example.com/article/greenport-expansion",
    publishedAt: "2026-11-18T07:00:00Z",
    companyIds: ["co-010"],
    category: "Infrastructure",
    summary:
      "GreenPort Terminals BV has unveiled plans for a €350M expansion of its Rotterdam container terminal, increasing annual throughput by 30%. The company is exploring a mix of project finance and infrastructure fund investment.",
    relevanceScore: 83,
    opportunityScore: 76,
    isRead: false,
    watchlisted: false,
  },
  {
    id: "news-009",
    headline:
      "Château Hospitality explores sale of Swiss resort portfolio",
    source: "Le Figaro",
    sourceUrl: "https://example.com/article/chateau-swiss-sale",
    publishedAt: "2026-11-15T11:00:00Z",
    companyIds: ["co-004"],
    category: "M&A",
    summary:
      "PE-backed Château Hospitality SASU is reportedly exploring the sale of its three Swiss luxury resort properties, valued at an estimated €200M. The disposal would fund its expansion into Côte d'Azur properties.",
    relevanceScore: 60,
    opportunityScore: 48,
    isRead: true,
    watchlisted: false,
  },
  {
    id: "news-010",
    headline:
      "Valterra Mining reports strong Q3 lithium output, considers bond issuance",
    source: "Mining Weekly",
    sourceUrl: "https://example.com/article/valterra-q3",
    publishedAt: "2026-11-14T08:15:00Z",
    companyIds: ["co-008"],
    category: "Earnings",
    summary:
      "Valterra Mining Plc reported a 25% increase in lithium concentrate output for Q3. Management indicated they may issue a €200M green bond to fund further capacity expansion at their Portuguese operation.",
    relevanceScore: 58,
    opportunityScore: 52,
    isRead: true,
    watchlisted: false,
  },
  {
    id: "news-011",
    headline:
      "PanEuropean Infrastructure Fund acquires 30% stake in Baltic wind portfolio",
    source: "Infrastructure Investor",
    sourceUrl: "https://example.com/article/peif-baltic-wind",
    publishedAt: "2026-11-19T09:00:00Z",
    companyIds: ["co-007"],
    category: "Infrastructure",
    summary:
      "PanEuropean Infrastructure Fund has agreed to acquire a 30% stake in a 1.2GW Baltic offshore wind portfolio from a Nordic developer. The transaction values the portfolio at approximately €3.5B.",
    relevanceScore: 88,
    opportunityScore: 80,
    isRead: false,
    watchlisted: false,
  },
  {
    id: "news-012",
    headline:
      "EU antitrust probe into Meridian Industries' proposed UK acquisition",
    source: "Financial Times",
    sourceUrl: "https://example.com/article/meridian-antitrust",
    publishedAt: "2026-11-19T14:30:00Z",
    companyIds: ["co-001"],
    category: "Regulatory",
    summary:
      "The European Commission has opened a preliminary investigation into Meridian Industries' proposed acquisition of Sentinel Electronics, citing potential market concentration concerns in defence electronics components.",
    relevanceScore: 85,
    opportunityScore: 35,
    isRead: false,
    watchlisted: false,
  },
];

// ─── Deals (Test Data) ──────────────────────────────────────────────────────

export const deals: Deal[] = [
  {
    id: "deal-001",
    name: "Meridian / Sentinel Electronics Acquisition",
    companyId: "co-001",
    dealType: "M&A",
    counterparty: "Sentinel Electronics Ltd",
    amount: 850,  // in millions
    currency: "EUR",
    status: "in_progress",
    announcementDate: "2026-11-10",
    lastUpdated: "2026-11-19",
    source: "Les Echos",
    sourceUrl: "https://example.com/article/meridian-uk-acquisition",
    summary: "Meridian Industries announces strategic acquisition of UK-based Sentinel Electronics for €850M.",
    buyers: ["Meridian Industries SA"],
    sellers: ["Sentinel Electronics Ltd shareholders"],
    advisors: ["Rothschild & Co (financial adviser to Meridian)"],
    watchlisted: true,
  },
  {
    id: "deal-002",
    name: "Solaris Andalusia Solar PV Project Finance",
    companyId: "co-003",
    dealType: "Project finance",
    amount: 500,  // in millions
    currency: "EUR",
    status: "announced",
    announcementDate: "2026-11-19",
    lastUpdated: "2026-11-19",
    source: "Reuters",
    sourceUrl: "https://example.com/article/solaris-andalusia",
    summary: "Solaris Energy secures €500M project finance package for 800MW Andalusia solar PV development.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-003",
    name: "PanEuropean Fund IV Final Close",
    companyId: "co-007",
    dealType: "Capital increase",
    amount: 2_100,  // in millions
    currency: "EUR",
    status: "closed",
    announcementDate: "2026-10-15",
    lastUpdated: "2026-11-19",
    source: "Bloomberg",
    sourceUrl: "https://example.com/article/peif-fundraise",
    summary: "PanEuropean Infrastructure Fund reaches final close of Fund IV at €2.1B, exceeding target.",
    buyers: [],
    sellers: [],
    advisors: ["Evercore (placement agent)"],
    watchlisted: true,
  },
  {
    id: "deal-004",
    name: "Riviera Telecom Senior Debt Refinancing",
    companyId: "co-009",
    dealType: "Refinancing",
    amount: 1_200,  // in millions
    currency: "EUR",
    status: "announced",
    announcementDate: "2026-11-17",
    lastUpdated: "2026-11-17",
    source: "Financial Times",
    sourceUrl: "https://example.com/article/riviera-refi",
    summary: "Riviera Telecom launches €1.2B senior debt refinancing to extend maturity profile.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: true,
  },
  {
    id: "deal-005",
    name: "Atlas Digital Series C",
    companyId: "co-006",
    dealType: "Private placement",
    amount: 40,  // in millions
    currency: "EUR",
    status: "closed",
    announcementDate: "2026-11-18",
    lastUpdated: "2026-11-18",
    source: "TechCrunch",
    sourceUrl: "https://example.com/article/atlas-series-c",
    summary: "Atlas Digital closes €40M Series C round led by Accel Partners.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-006",
    name: "GreenPort Rotterdam Terminal Expansion",
    companyId: "co-010",
    dealType: "Project finance",
    amount: 350,  // in millions
    currency: "EUR",
    status: "rumoured",
    announcementDate: "2026-11-18",
    lastUpdated: "2026-11-18",
    source: "Infrastructure Investor",
    sourceUrl: "https://example.com/article/greenport-expansion",
    summary: "Reports suggest GreenPort is exploring €350M project finance for Rotterdam terminal expansion.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-007",
    name: "PanEuropean Baltic Wind Portfolio Acquisition",
    companyId: "co-007",
    dealType: "Infrastructure investment",
    counterparty: "Nordic Wind Holdings",
    amount: 1_050,  // in millions
    currency: "EUR",
    status: "announced",
    announcementDate: "2026-11-19",
    lastUpdated: "2026-11-19",
    source: "Bloomberg",
    sourceUrl: "https://example.com/article/peif-baltic-wind",
    summary: "PanEuropean Fund announces €1.05B acquisition of Baltic offshore wind portfolio.",
    buyers: ["PanEuropean Infrastructure Fund"],
    sellers: ["Nordic Wind Holdings"],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-008",
    name: "Château Hospitality Swiss Portfolio Disposal",
    companyId: "co-004",
    dealType: "Asset disposal",
    amount: 200,  // in millions
    currency: "EUR",
    status: "rumoured",
    announcementDate: "2026-11-15",
    lastUpdated: "2026-11-15",
    source: "Le Figaro",
    sourceUrl: "https://example.com/article/chateau-swiss-sale",
    summary: "Reports indicate Château Hospitality may divest its Swiss hotel portfolio valued at ~€200M.",
    buyers: [],
    sellers: ["Château Hospitality Group"],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-009",
    name: "Meridian Industries Aerospace Division Bond",
    companyId: "co-001",
    dealType: "Bond issuance",
    amount: 300,  // in millions
    currency: "EUR",
    status: "closed",
    announcementDate: "2026-09-20",
    closingDate: "2026-10-05",
    lastUpdated: "2026-10-05",
    source: "Les Echos",
    sourceUrl: "https://example.com/article/meridian-bond",
    summary: "Meridian Industries successfully prices €300M bond issuance for aerospace division expansion.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-010",
    name: "Valterra Green Bond for Portuguese Operations",
    companyId: "co-008",
    dealType: "Bond issuance",
    amount: 200,  // in millions
    currency: "EUR",
    status: "rumoured",
    announcementDate: "2026-11-14",
    lastUpdated: "2026-11-14",
    source: "Mining Weekly",
    sourceUrl: "https://example.com/article/valterra-q3",
    summary: "Valterra Mining reportedly exploring €200M green bond issuance for Portuguese lithium operations.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-011",
    name: "Baltic Pharma Oncology Licensing Agreement",
    companyId: "co-005",
    dealType: "Joint venture",
    counterparty: "Genova BioSciences",
    currency: "EUR",
    status: "in_progress",
    announcementDate: "2026-10-25",
    lastUpdated: "2026-11-10",
    source: "FT",
    sourceUrl: "https://example.com/article/baltic-licensing",
    summary: "Baltic Pharma enters oncology licensing agreement with Genova BioSciences.",
    buyers: [],
    sellers: [],
    advisors: [],
    watchlisted: false,
  },
  {
    id: "deal-012",
    name: "Solaris Energy Greek Wind Acquisition",
    companyId: "co-003",
    dealType: "M&A",
    counterparty: "Hellenic Wind SA",
    amount: 180,  // in millions
    currency: "EUR",
    status: "closed",
    announcementDate: "2026-08-12",
    closingDate: "2026-10-30",
    lastUpdated: "2026-10-30",
    source: "Reuters",
    sourceUrl: "https://example.com/article/solaris-greece",
    summary: "Solaris Energy completes €180M acquisition of Hellenic Wind SA Greek wind assets.",
    buyers: ["Solaris Energy Group"],
    sellers: ["Hellenic Wind SA"],
    advisors: [],
    watchlisted: false,
  },
];

// ─── Opportunities (Test Data) ───────────────────────────────────────────────

export const opportunities: Opportunity[] = [
  {
    id: "opp-001",
    headline: "Meridian acquisition financing likely to require €600M+ debt package",
    companyId: "co-001",
    sourceArticleId: "news-001",
    signalType: "acquisition_target",
    confidence: "high",
    status: "new",
    detectedAt: "2026-11-18T10:00:00Z",
    hypothesis: "Meridian is pursuing an €850M acquisition. At this scale, the company will likely require a combination of term loan and bridge financing. Given the defence sector angle, documentation may need to address export control and security clearance conditions.",
    relevanceScore: 92,
    opportunityScore: 88,
    practiceAreas: ["Leveraged lending", "M&A finance"],
    watchlisted: true,
  },
  {
    id: "opp-002",
    headline: "Riviera Telecom €1.2B refinancing represents significant mandate",
    companyId: "co-009",
    sourceArticleId: "news-007",
    signalType: "refinancing_due",
    confidence: "high",
    status: "under_review",
    detectedAt: "2026-11-17T17:00:00Z",
    hypothesis: "A €1.2B senior secured credit facility refinancing for a telecom operator is a substantial mandate. The company is seeking improved terms, suggesting appetite for competitive proposals from additional lenders or advisors.",
    relevanceScore: 90,
    opportunityScore: 85,
    practiceAreas: ["Refinancing", "Leveraged lending"],
    watchlisted: true,
  },
  {
    id: "opp-003",
    headline: "Solaris €500M project finance may need additional structuring support",
    companyId: "co-003",
    sourceArticleId: "news-002",
    signalType: "capex_announced",
    confidence: "medium",
    status: "qualified",
    detectedAt: "2026-11-19T08:00:00Z",
    hypothesis: "The €500M Andalusia project finance is led by BNP Paribas and Santander. Additional tranches or mezzanine layers may require specialist structuring. Solar PV project finance in Spain involves complex regulatory and permitting documentation.",
    relevanceScore: 95,
    opportunityScore: 72,
    practiceAreas: ["Project finance", "Green finance"],
    watchlisted: false,
  },
  {
    id: "opp-004",
    headline: "Château Hospitality disposal may require acquisition finance for buyer",
    companyId: "co-004",
    sourceArticleId: "news-009",
    signalType: "asset_disposal",
    confidence: "low",
    status: "new",
    detectedAt: "2026-11-15T13:00:00Z",
    hypothesis: "If the Swiss portfolio is sold, the acquirer will likely need hospitality-sector acquisition financing. The €200M valuation makes this a mid-market deal. PE-backed seller suggests structured sale process with vendor due diligence.",
    relevanceScore: 60,
    opportunityScore: 48,
    practiceAreas: ["Restructuring", "Distressed debt"],
    watchlisted: false,
  },
  {
    id: "opp-005",
    headline: "PanEuropean Fund deployment will generate co-investment lending opportunities",
    companyId: "co-007",
    sourceArticleId: "news-003",
    signalType: "capex_announced",
    confidence: "high",
    status: "qualified",
    detectedAt: "2026-11-19T11:00:00Z",
    hypothesis: "A newly closed €2.1B infrastructure fund will deploy capital over 3 years. Each portfolio investment will likely require acquisition financing and project-level debt structures. This is a recurring source of mandates.",
    relevanceScore: 87,
    opportunityScore: 78,
    practiceAreas: ["Project finance", "Acquisition finance"],
    watchlisted: true,
  },
  {
    id: "opp-006",
    headline: "Valterra may need green bond structuring for Portuguese mine expansion",
    companyId: "co-008",
    sourceArticleId: "news-010",
    signalType: "debt_maturity",
    confidence: "medium",
    status: "new",
    detectedAt: "2026-11-14T09:00:00Z",
    hypothesis: "Management has indicated a potential €200M green bond issuance. Green bond documentation for mining operations requires specialist ESG covenant structuring.",
    relevanceScore: 58,
    opportunityScore: 52,
    practiceAreas: ["Green finance", "Bond issuance"],
    watchlisted: false,
  },
  {
    id: "opp-007",
    headline: "Baltic Pharma EMA approval may trigger growth financing",
    companyId: "co-005",
    sourceArticleId: "news-004",
    signalType: "regulatory_change",
    confidence: "medium",
    status: "dismissed",
    detectedAt: "2026-11-16T15:00:00Z",
    hypothesis: "EMA approval opens a €300M+ market. Baltic Pharma may seek growth financing for manufacturing scale-up and European distribution. However, the company has historically self-funded expansion.",
    relevanceScore: 72,
    opportunityScore: 55,
    practiceAreas: ["Growth financing", "Leveraged lending"],
    watchlisted: false,
  },
];

// ─── Briefings (Test Data) ───────────────────────────────────────────────────

export const briefings: Briefing[] = [
  {
    id: "brief-001",
    type: "daily",
    date: "2026-11-19",
    generatedAt: "2026-11-19T07:00:00Z",
    title: "Daily Intelligence Brief — 19 November 2026",
    summary: "Active day across the portfolio. Solaris Energy announced a major €500M project finance for its Andalusia solar development. PanEuropean Fund closed Fund IV at €2.1B, immediately deploying capital via a Baltic wind acquisition. EU regulatory scrutiny increases on the Meridian / Sentinel deal.",
    highlights: [
      "Solaris Energy announces €500M Andalusia project finance",
      "PanEuropean Fund closes €2.1B, acquires Baltic wind stake",
      "EU opens antitrust probe into Meridian / Sentinel deal",
    ],
    articleCount: 4,
    highlightCount: 3,
    dealCount: 3,
    articleIds: ["news-002", "news-003", "news-011", "news-012"],
  },
  {
    id: "brief-002",
    type: "daily",
    date: "2026-11-18",
    generatedAt: "2026-11-18T07:00:00Z",
    title: "Daily Intelligence Brief — 18 November 2026",
    summary: "Meridian Industries emerged as the top story with advanced acquisition talks for a UK defence electronics firm valued at €850M. Atlas Digital completed its Series C, while GreenPort Terminals unveiled ambitious expansion plans for Rotterdam.",
    highlights: [
      "Meridian Industries in advanced talks for UK acquisition",
      "Atlas Digital closes €40M Series C",
      "GreenPort unveils €350M Rotterdam expansion plans",
    ],
    articleCount: 3,
    highlightCount: 3,
    dealCount: 2,
    articleIds: ["news-001", "news-006", "news-008"],
  },
  {
    id: "brief-003",
    type: "weekly",
    date: "2026-11-17",
    generatedAt: "2026-11-17T08:00:00Z",
    title: "Weekly Intelligence Summary — W/C 11 November 2026",
    summary: "Busy week with 5 new deals tracked. Riviera Telecom mandated a €1.2B senior debt refinancing. Château Hospitality is exploring disposal of its Swiss hotel portfolio. Baltic Pharma received EMA approval for its oncology treatment, which may trigger growth financing needs.",
    highlights: [
      "5 new deals tracked across monitored companies",
      "Riviera Telecom mandates €1.2B refinancing",
      "Château Hospitality exploring Swiss portfolio disposal",
      "Baltic Pharma receives EMA approval — monitor for financing needs",
    ],
    articleCount: 12,
    highlightCount: 4,
    dealCount: 5,
    articleIds: ["news-004", "news-005", "news-009", "news-010"],
  },
  {
    id: "brief-004",
    type: "weekly",
    date: "2026-11-10",
    generatedAt: "2026-11-10T08:00:00Z",
    title: "Weekly Intelligence Summary — W/C 4 November 2026",
    summary: "Quieter week centred on closing activity. Meridian's €300M aerospace bond issuance closed successfully. PanEuropean Fund approaches its final close at a figure above target. NordStream Logistics rumoured to be considering UK market entry.",
    highlights: [
      "Meridian bond issuance successfully closes at €300M",
      "PanEuropean Fund approaches final close",
      "NordStream Logistics rumoured to be exploring UK market entry",
    ],
    articleCount: 8,
    highlightCount: 3,
    dealCount: 3,
    articleIds: ["news-001", "news-003"],
  },
];

// ─── Watchlist (Test Data) ───────────────────────────────────────────────────

export const watchlistItems: WatchlistItem[] = [
  {
    id: "wl-001",
    entityType: "company",
    entityId: "co-001",
    label: "Meridian Industries SA",
    companyId: "co-001",
    addedAt: "2026-10-01",
    reason: "Monitor acquisition financing angle",
  },
  {
    id: "wl-002",
    entityType: "deal",
    entityId: "deal-004",
    label: "Riviera Telecom Senior Debt Refinancing",
    companyId: "co-009",
    addedAt: "2026-11-17",
    reason: "€1.2B refi — significant mandate potential",
  },
  {
    id: "wl-003",
    entityType: "news",
    entityId: "news-001",
    label: "Meridian considers acquisition of UK defence electronics firm",
    companyId: "co-001",
    addedAt: "2026-11-18",
  },
  {
    id: "wl-004",
    entityType: "opportunity",
    entityId: "opp-005",
    label: "PanEuropean Fund deployment — co-investment lending opportunities",
    companyId: "co-007",
    addedAt: "2026-11-19",
    reason: "Recurring mandate source — track portfolio investments",
  },
  {
    id: "wl-005",
    entityType: "company",
    entityId: "co-003",
    label: "Solaris Energy Group",
    companyId: "co-003",
    addedAt: "2026-09-15",
  },
  {
    id: "wl-006",
    entityType: "company",
    entityId: "co-005",
    label: "Baltic Pharma AS",
    companyId: "co-005",
    addedAt: "2026-10-20",
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getCompanyById(id: string): Company | undefined {
  return companies.find((c) => c.id === id);
}

export function getCompanyName(id: string): string {
  return getCompanyById(id)?.name ?? "Unknown Company";
}

export function getNewsByCompany(companyId: string): NewsArticle[] {
  return newsArticles.filter((n) => n.companyIds.includes(companyId));
}

export function getDealsByCompany(companyId: string): Deal[] {
  return deals.filter((d) => d.companyId === companyId);
}

export function getOpportunitiesByCompany(companyId: string): Opportunity[] {
  return opportunities.filter((o) => o.companyId === companyId);
}

// ─── Export aliases ──────────────────────────────────────────────────────────
// Pages use these names for clarity
export const sampleCompanies = companies;
export const sampleNewsArticles = newsArticles;
export const sampleDeals = deals;
export const sampleOpportunities = opportunities;
export const sampleBriefings = briefings;
export const sampleWatchlist = watchlistItems;
