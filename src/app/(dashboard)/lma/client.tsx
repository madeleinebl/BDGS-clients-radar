"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ExternalLink,
  FileText,
  Calendar,
  Filter,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Scale,
  Landmark,
  Building2,
  Leaf,
  ArrowLeftRight,
  Globe,
  Briefcase,
  RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  LMA Documentation Data                                            */
/*  Source: lma.eu.com — public documentation updates                  */
/*  Last refreshed: November 2026                                      */
/* ------------------------------------------------------------------ */

interface LmaDocument {
  id: string;
  title: string;
  category: LmaCategory;
  date: string; // YYYY-MM or YYYY-MM-DD
  description: string;
  status: "new" | "updated" | "recommended";
  url: string;
  tags: string[];
}

type LmaCategory =
  | "leveraged"
  | "investment_grade"
  | "real_estate"
  | "sustainable"
  | "secondary"
  | "developing_markets"
  | "fund_finance"
  | "rfr"
  | "general";

const CATEGORY_META: Record<
  LmaCategory,
  { label: string; icon: React.ElementType; color: string }
> = {
  leveraged: {
    label: "Leveraged Finance",
    icon: Scale,
    color: "var(--primary)",
  },
  investment_grade: {
    label: "Investment Grade",
    icon: Landmark,
    color: "var(--info)",
  },
  real_estate: {
    label: "Real Estate Finance",
    icon: Building2,
    color: "var(--warning)",
  },
  sustainable: {
    label: "Sustainable Finance",
    icon: Leaf,
    color: "var(--success)",
  },
  secondary: {
    label: "Secondary Trading",
    icon: ArrowLeftRight,
    color: "var(--accent)",
  },
  developing_markets: {
    label: "Developing Markets & Export",
    icon: Globe,
    color: "var(--danger)",
  },
  fund_finance: {
    label: "Fund Finance",
    icon: Briefcase,
    color: "#7C3AED",
  },
  rfr: {
    label: "RFR / IBOR Transition",
    icon: RefreshCw,
    color: "#0891B2",
  },
  general: {
    label: "General / Cross-Cutting",
    icon: BookOpen,
    color: "var(--foreground-muted)",
  },
};

const LMA_DOCUMENTS: LmaDocument[] = [
  // ── Leveraged Finance ──
  {
    id: "lev-super-senior-2026",
    title: "Super Senior Revolving Facility Agreement (Leveraged Acquisition Finance)",
    category: "leveraged",
    date: "2026",
    description:
      "New recommended form for super senior/senior revolving credit facility documentation in leveraged acquisition finance structures.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["LBO", "super senior", "RCF", "acquisition finance"],
  },
  {
    id: "lev-npl-2026",
    title: "NPL / Leveraged Lending — Guidance Paper",
    category: "leveraged",
    date: "2026-11",
    description:
      "Paper on non-performing loans and leveraged lending topics, including credit risk transfer transactions.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["NPL", "credit risk transfer", "CRT"],
  },
  {
    id: "lev-market-disruption-2026",
    title: "Market Disruption Clauses and Lender Defaults",
    category: "leveraged",
    date: "2026",
    description:
      "LMA insights paper examining market disruption clause mechanics and lender default scenarios in syndicated lending.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["market disruption", "lender default", "syndicated"],
  },
  // ── Investment Grade ──
  {
    id: "ig-crd-vi-2026",
    title: "CRD VI Article 21c — Cross-Border Lending Paper",
    category: "investment_grade",
    date: "2026",
    description:
      "Analysis of CRD VI Article 21c implications for cross-border lending, including third-country branch requirements.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["CRD VI", "cross-border", "regulatory"],
  },
  {
    id: "ig-lme-insights-2026",
    title: "LME Insights Paper",
    category: "investment_grade",
    date: "2026",
    description:
      "Insights on the loan market environment covering key trends, regulatory developments, and market conditions.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["market environment", "trends"],
  },
  // ── Real Estate Finance ──
  {
    id: "ref-update-2026",
    title: "Real Estate Finance Facility Agreement — Updated",
    category: "real_estate",
    date: "2026-08",
    description:
      "Updated REF facilities agreement including extension option, covenant cure rider, optional riders for ratings, cash trap, and interest reserve account.",
    status: "updated",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["REF", "facility agreement", "covenant cure", "extension option"],
  },
  // ── Sustainable Finance ──
  {
    id: "sf-sll-update-2026",
    title: "Sustainability Linked Loan (SLL) Draft Provisions — Comprehensive Review",
    category: "sustainable",
    date: "2026-08",
    description:
      "Comprehensive update to the SLL draft provisions reflecting market practice evolution, enhanced KPI and SPT frameworks.",
    status: "updated",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["SLL", "sustainability", "KPI", "SPT"],
  },
  {
    id: "sf-sfdr-2026",
    title: "SFDR 2.0 — Position Paper",
    category: "sustainable",
    date: "2026-02",
    description:
      "LMA position paper on the Sustainable Finance Disclosure Regulation 2.0 proposals and their implications for the loan market.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["SFDR", "disclosure", "ESG", "regulatory"],
  },
  {
    id: "sf-transition-loans-2025",
    title: "Transition Loans Guide (joint LMA/LSTA/APLMA)",
    category: "sustainable",
    date: "2025-10",
    description:
      "Joint guide with LSTA and APLMA on transition loan products, supporting borrowers' climate transition strategies.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["transition loans", "climate", "LSTA", "APLMA"],
  },
  // ── Secondary Trading ──
  {
    id: "st-stcs-2026",
    title: "Secondary Trading Standard Terms & Conditions (STCs) — Updated",
    category: "secondary",
    date: "2026-03",
    description:
      "Updated STCs effective 17 March 2026: removed LIBOR references, new participation agreement forms, modernised settlement procedures.",
    status: "updated",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["STCs", "secondary trading", "participation", "settlement"],
  },
  // ── Developing Markets ──
  {
    id: "dm-sanctioned-lenders-2026",
    title: "Guidance on Sanctioned Lenders in Developing Markets",
    category: "developing_markets",
    date: "2026-02",
    description:
      "Practical guidance on handling sanctioned lenders in developing market transactions, including transfer and voting mechanics.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["sanctions", "developing markets", "compliance"],
  },
  {
    id: "dm-eca-2026",
    title: "Export Credit Agencies — Guidance Paper",
    category: "developing_markets",
    date: "2026",
    description:
      "Paper on export credit agency documentation, risk mitigation, and structuring considerations.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["ECA", "export credit", "risk mitigation"],
  },
  {
    id: "dm-securitisation-2026",
    title: "EU Securitisation Review — Trilogue Agreement Outcomes",
    category: "developing_markets",
    date: "2026-10",
    description:
      "Analysis of outcomes from the EU securitisation review trilogue agreement, including revised STS criteria and due diligence requirements.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["securitisation", "STS", "EU regulation"],
  },
  // ── Fund Finance ──
  {
    id: "ff-cfo-insights-2026",
    title: "Fund Finance CFO Insights",
    category: "fund_finance",
    date: "2026-04",
    description:
      "Insights paper on fund finance from the CFO perspective, including subscription line facilities, NAV lending, and hybrid structures.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["fund finance", "subscription line", "NAV", "CFO"],
  },
  {
    id: "ff-borrowing-base-2026",
    title: "Borrowing Base Facility Agreement — Updated",
    category: "fund_finance",
    date: "2026-03",
    description:
      "Updated borrowing base facility agreement reflecting market developments in asset-backed lending structures.",
    status: "updated",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["borrowing base", "asset-backed"],
  },
  // ── RFR / IBOR Transition ──
  {
    id: "rfr-euribor-2025",
    title: "EURIBOR Fallbacks — Single Currency Euro Recommended Forms",
    category: "rfr",
    date: "2025-07",
    description:
      "Recommended forms for EURIBOR fallback provisions in single currency euro facility agreements.",
    status: "recommended",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["EURIBOR", "fallbacks", "euro", "RFR"],
  },
  {
    id: "rfr-zaronia-2026",
    title: "South African ZARONIA Facility Agreement — Recommended Form",
    category: "rfr",
    date: "2026-04",
    description:
      "ZARONIA-based facility agreement elevated to recommended form status, including rate switch agreement.",
    status: "recommended",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["ZARONIA", "South Africa", "RFR", "rate switch"],
  },
  // ── General ──
  {
    id: "gen-crt-2026",
    title: "Credit Risk Transfer Transactions — Guidance Note + Insights",
    category: "general",
    date: "2026-11",
    description:
      "Guidance note and insights paper on credit risk transfer transaction structures, documentation, and market trends.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["CRT", "credit risk transfer", "significant risk transfer"],
  },
  {
    id: "gen-confidentiality-2025",
    title: "Confidentiality and Mandate Documentation — Updated",
    category: "general",
    date: "2025-10",
    description:
      "Updates to confidentiality agreements and mandate letter documentation for syndicated lending transactions.",
    status: "updated",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["confidentiality", "mandate", "syndicated"],
  },
  {
    id: "gen-benchmarks-2026",
    title: "Joint Response to HMT Benchmarks Consultation",
    category: "general",
    date: "2026-03",
    description:
      "Joint response to HM Treasury consultation on benchmark reform, covering transition timelines and market impact.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["benchmarks", "HMT", "regulatory"],
  },
  {
    id: "gen-roe-guidance-2025",
    title: "Register of Overseas Entities — Guidance",
    category: "general",
    date: "2025-10",
    description:
      "Guidance on the UK Register of Overseas Entities and its implications for real estate and lending transactions.",
    status: "new",
    url: "https://www.lma.eu.com/documents-guidelines/documents",
    tags: ["ROE", "overseas entities", "UK", "real estate"],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  if (/^\d{4}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-");
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  const month = months[parseInt(m, 10) - 1] ?? m;
  return d ? `${parseInt(d, 10)} ${month} ${y}` : `${month} ${y}`;
}

function statusBadge(status: LmaDocument["status"]) {
  const styles = {
    new: "bg-[var(--success)]/10 text-[var(--success)]",
    updated: "bg-[var(--info)]/10 text-[var(--info)]",
    recommended: "bg-[var(--accent)]/10 text-[var(--accent)]",
  };
  const labels = {
    new: "Nouveau",
    updated: "Mis à jour",
    recommended: "Recommandé",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LmaClient() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    LmaCategory | "all"
  >("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(Object.keys(CATEGORY_META))
  );
  const [selectedStatus, setSelectedStatus] = useState<
    LmaDocument["status"] | "all"
  >("all");

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const filtered = useMemo(() => {
    return LMA_DOCUMENTS.filter((doc) => {
      if (selectedCategory !== "all" && doc.category !== selectedCategory)
        return false;
      if (selectedStatus !== "all" && doc.status !== selectedStatus)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q) ||
          doc.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, selectedCategory, selectedStatus]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<LmaCategory, LmaDocument[]>();
    for (const doc of filtered) {
      const list = map.get(doc.category) ?? [];
      list.push(doc);
      map.set(doc.category, list);
    }
    // Sort documents within each category by date descending
    for (const [, docs] of map) {
      docs.sort((a, b) => b.date.localeCompare(a.date));
    }
    return map;
  }, [filtered]);

  // Category order for display
  const categoryOrder: LmaCategory[] = [
    "leveraged",
    "investment_grade",
    "real_estate",
    "sustainable",
    "secondary",
    "developing_markets",
    "fund_finance",
    "rfr",
    "general",
  ];

  const totalNew = LMA_DOCUMENTS.filter((d) => d.status === "new").length;
  const totalUpdated = LMA_DOCUMENTS.filter(
    (d) => d.status === "updated"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Documentation LMA
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Dernières mises à jour de la documentation Loan Market Association —
          financement, prêts syndiqués, documentation de marché.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-2xl font-bold text-foreground">
            {LMA_DOCUMENTS.length}
          </div>
          <div className="text-xs text-foreground-muted">Documents référencés</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-2xl font-bold text-[var(--success)]">
            {totalNew}
          </div>
          <div className="text-xs text-foreground-muted">Nouveaux</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-2xl font-bold text-[var(--info)]">
            {totalUpdated}
          </div>
          <div className="text-xs text-foreground-muted">Mis à jour</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="text-2xl font-bold text-foreground">
            {Object.keys(CATEGORY_META).length}
          </div>
          <div className="text-xs text-foreground-muted">Catégories</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Rechercher (ex: SLL, LBO, EURIBOR...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as LmaCategory | "all")
            }
            className="appearance-none rounded-md border border-border bg-background py-2 pl-10 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Toutes catégories</option>
            {categoryOrder.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_META[cat].label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(
              e.target.value as LmaDocument["status"] | "all"
            )
          }
          className="appearance-none rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tous statuts</option>
          <option value="new">Nouveau</option>
          <option value="updated">Mis à jour</option>
          <option value="recommended">Recommandé</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-foreground-muted">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""}{" "}
        {search || selectedCategory !== "all" || selectedStatus !== "all"
          ? "trouvé(s)"
          : ""}
      </div>

      {/* Document list grouped by category */}
      <div className="space-y-4">
        {categoryOrder
          .filter((cat) => grouped.has(cat))
          .map((cat) => {
            const meta = CATEGORY_META[cat];
            const docs = grouped.get(cat)!;
            const Icon = meta.icon;
            const isExpanded = expandedCategories.has(cat);

            return (
              <div
                key={cat}
                className="rounded-lg border border-border bg-background overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-background-subtle transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground-muted shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground-muted shrink-0" />
                  )}
                  <Icon
                    className="h-5 w-5 shrink-0"
                    style={{ color: meta.color }}
                  />
                  <span className="font-semibold text-foreground">
                    {meta.label}
                  </span>
                  <span className="ml-auto rounded-full bg-background-muted px-2 py-0.5 text-xs font-medium text-foreground-muted">
                    {docs.length}
                  </span>
                </button>

                {/* Documents */}
                {isExpanded && (
                  <div className="divide-y divide-border">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="px-4 py-3 pl-12 hover:bg-background-subtle transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-medium text-foreground">
                                {doc.title}
                              </h3>
                              {statusBadge(doc.status)}
                            </div>
                            <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                              {doc.description}
                            </p>
                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                                <Calendar className="h-3 w-3" />
                                {formatDate(doc.date)}
                              </span>
                              {doc.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded bg-background-muted px-1.5 py-0.5 text-xs text-foreground-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md p-2 text-foreground-muted hover:bg-primary-light hover:text-primary transition-colors"
                            title="Voir sur lma.eu.com"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-border bg-background p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-foreground-muted/30" />
          <p className="mt-4 text-sm text-foreground-muted">
            Aucun document ne correspond à vos critères.
          </p>
        </div>
      )}

      {/* Footer note */}
      <div className="rounded-lg border border-border bg-background-subtle p-4">
        <p className="text-xs text-foreground-muted">
          <strong>Source :</strong> Loan Market Association (
          <a
            href="https://www.lma.eu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            lma.eu.com
          </a>
          ). Les documents complets nécessitent un accès membre LMA. Cette page
          référence les mises à jour publiques pour faciliter la veille
          documentaire de l&apos;équipe financement. Dernière mise à jour : novembre
          2026.
        </p>
      </div>
    </div>
  );
}
