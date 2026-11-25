"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Handshake,
  Newspaper,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  BarChart3,
  Activity,
} from "lucide-react";
import type { DashboardStats } from "@/lib/supabase/queries";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Quick Stats — large coloured numbers, PitchBook style              */
/* ------------------------------------------------------------------ */

function QuickStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5 rounded-lg border border-border bg-background px-4 py-3">
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-foreground-muted">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini bar chart (pure CSS, no chart library)                        */
/* ------------------------------------------------------------------ */

function BarChartMini({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height: 120 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full min-w-[18px] rounded-t transition-all"
            style={{
              height: `${(d.value / max) * 100}px`,
              backgroundColor: color,
              opacity: 0.85,
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-foreground-muted truncate max-w-full">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Companies to Watch — card row                                      */
/* ------------------------------------------------------------------ */

function CompanyCard({
  name,
  sector,
  dealCount,
  priority,
  id,
}: {
  name: string;
  sector: string;
  dealCount: number;
  priority: string;
  id: string;
}) {
  const priorityColors: Record<string, string> = {
    high: "var(--danger)",
    medium: "var(--warning)",
    low: "var(--foreground-muted)",
  };
  return (
    <Link
      href={`/companies/${id}`}
      className="flex flex-col rounded-lg border border-border bg-background p-4 hover:border-primary/40 hover:shadow-sm transition-all min-w-[180px]"
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
          style={{ backgroundColor: "var(--primary)" }}
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {name}
          </div>
          <div className="text-xs text-foreground-muted truncate">{sector}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-foreground-muted">
          {dealCount} deal{dealCount !== 1 ? "s" : ""}
        </span>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: priorityColors[priority] ?? "var(--foreground-muted)" }}
          title={`Priorité: ${priority}`}
        />
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */

type WatchTab = "most_deals" | "high_priority" | "recent_news";

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const [watchTab, setWatchTab] = useState<WatchTab>("most_deals");

  const companyNameMap = useMemo(
    () => new Map(stats.companies.map((c) => [c.id, c.name])),
    [stats.companies],
  );
  const getCompanyName = (id: string) => companyNameMap.get(id) ?? "—";

  // ── Deal type breakdown ──
  const dealsByType = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of stats.allDeals) {
      counts.set(d.dealType, (counts.get(d.dealType) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));
  }, [stats.allDeals]);

  // ── Deals by month (last 6 months) ──
  const dealsByMonth = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      months.push({ key, label });
    }
    const counts = new Map<string, number>();
    for (const deal of stats.allDeals) {
      const m = deal.announcementDate?.slice(0, 7);
      if (m) counts.set(m, (counts.get(m) ?? 0) + 1);
    }
    return months.map((m) => ({ label: m.label, value: counts.get(m.key) ?? 0 }));
  }, [stats.allDeals]);

  // ── Sector breakdown ──
  const sectorBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of stats.companies) {
      if (c.monitoringStatus === "active") {
        counts.set(c.sector, (counts.get(c.sector) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
  }, [stats.companies]);

  // ── Deal status breakdown ──
  const dealStatusData = useMemo(() => {
    const counts = { announced: 0, in_progress: 0, closed: 0, rumoured: 0, cancelled: 0 };
    for (const d of stats.allDeals) {
      if (d.status in counts) counts[d.status as keyof typeof counts]++;
    }
    return counts;
  }, [stats.allDeals]);

  // ── Companies to Watch ──
  const companiesForTab = useMemo(() => {
    const active = stats.companies.filter((c) => c.monitoringStatus === "active");
    switch (watchTab) {
      case "most_deals":
        return [...active].sort((a, b) => b.dealCount - a.dealCount).slice(0, 6);
      case "high_priority":
        return active
          .filter((c) => c.priority === "high")
          .sort((a, b) => b.dealCount - a.dealCount)
          .slice(0, 6);
      case "recent_news":
        return [...active]
          .sort((a, b) => (b.latestNewsDate ?? "").localeCompare(a.latestNewsDate ?? ""))
          .slice(0, 6);
    }
  }, [stats.companies, watchTab]);

  // ── Format large deal value ──
  function fmtLargeValue(val: number): string {
    if (val >= 1_000) return `€${(val / 1_000).toFixed(1)}Md`;
    return `€${val.toFixed(0)}M`;
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Companies & Deals Overview
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {stats.totalCompanies} sociétés monitorées · données temps réel
        </p>
      </div>

      {/* ── Quick Stats row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <QuickStat
          label="Sociétés"
          value={stats.totalCompanies}
          color="var(--primary)"
        />
        <QuickStat
          label="Deals"
          value={stats.totalDeals}
          color="var(--success)"
        />
        <QuickStat
          label="Deals actifs"
          value={stats.activeDeals}
          color="var(--info)"
        />
        <QuickStat
          label="Deals clôturés"
          value={stats.closedDeals}
          color="var(--foreground-muted)"
        />
        <QuickStat
          label="Opportunités"
          value={stats.totalOpportunities}
          color="var(--warning)"
        />
        <QuickStat
          label="Volume total"
          value={stats.totalDealValue > 0 ? fmtLargeValue(stats.totalDealValue) : "—"}
          color="var(--accent)"
        />
        <QuickStat
          label="Plus gros deal"
          value={
            stats.largestDeal
              ? formatCurrency(stats.largestDeal.amount, stats.largestDeal.currency)
              : "—"
          }
          color="var(--danger)"
        />
      </div>

      {/* ── Main grid: charts left, companies to watch right ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* LEFT column */}
        <div className="space-y-6">
          {/* Deals Over Time */}
          <section className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-foreground-muted" />
              <h2 className="text-sm font-semibold text-foreground">
                Activité deals — 6 derniers mois
              </h2>
            </div>
            <BarChartMini data={dealsByMonth} color="var(--primary)" />
          </section>

          {/* Two mini charts side by side */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Deals by Type */}
            <section className="rounded-lg border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-foreground-muted" />
                <h2 className="text-sm font-semibold text-foreground">
                  Deals par type
                </h2>
              </div>
              <div className="space-y-2">
                {dealsByType.slice(0, 7).map((d) => {
                  const pct =
                    stats.totalDeals > 0
                      ? Math.round((d.value / stats.totalDeals) * 100)
                      : 0;
                  return (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="w-28 text-xs text-foreground-muted truncate">
                        {d.label}
                      </span>
                      <div className="flex-1 h-4 rounded bg-background-muted overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: "var(--primary)",
                            opacity: 0.75,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-foreground w-8 text-right">
                        {d.value}
                      </span>
                    </div>
                  );
                })}
                {dealsByType.length === 0 && (
                  <p className="text-xs text-foreground-muted">Aucun deal</p>
                )}
              </div>
            </section>

            {/* Deal status breakdown */}
            <section className="rounded-lg border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-foreground-muted" />
                <h2 className="text-sm font-semibold text-foreground">
                  Statuts des deals
                </h2>
              </div>
              <div className="space-y-3">
                {(
                  [
                    { key: "announced", label: "Annoncés", color: "var(--info)" },
                    { key: "in_progress", label: "En cours", color: "var(--warning)" },
                    { key: "closed", label: "Clôturés", color: "var(--success)" },
                    { key: "rumoured", label: "Rumeurs", color: "var(--foreground-muted)" },
                    { key: "cancelled", label: "Annulés", color: "var(--danger)" },
                  ] as const
                ).map((s) => {
                  const val = dealStatusData[s.key];
                  const pct =
                    stats.totalDeals > 0
                      ? Math.round((val / stats.totalDeals) * 100)
                      : 0;
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="flex-1 text-xs text-foreground-muted">
                        {s.label}
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {val}
                      </span>
                      <span className="text-[10px] tabular-nums text-foreground-muted w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Recent deals table */}
          <section className="rounded-lg border border-border bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-foreground-muted" />
                <h2 className="text-sm font-semibold text-foreground">
                  Dernières transactions
                </h2>
              </div>
              <Link
                href="/deals"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-subtle text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                  <th className="px-4 py-2 text-left">Deal</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Montant</th>
                  <th className="px-4 py-2 text-left">Statut</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium text-foreground hover:text-primary line-clamp-1"
                      >
                        {deal.name}
                      </Link>
                      <div className="text-[11px] text-foreground-muted">
                        {getCompanyName(deal.companyId)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-background-muted px-1.5 py-0.5 text-[11px] text-foreground-muted">
                        {deal.dealType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {deal.amount
                        ? formatCurrency(deal.amount, deal.currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={deal.status} />
                    </td>
                    <td className="px-4 py-2.5 text-xs text-foreground-muted tabular-nums">
                      {deal.announcementDate
                        ? new Date(deal.announcementDate).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" },
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
                {stats.recentDeals.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-foreground-muted"
                    >
                      Aucune transaction récente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>

        {/* RIGHT column */}
        <div className="space-y-6">
          {/* Companies to Watch */}
          <section className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-foreground-muted" />
              <h2 className="text-sm font-semibold text-foreground">
                Companies to Watch
              </h2>
            </div>
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              {(
                [
                  { key: "most_deals", label: "Plus de deals" },
                  { key: "high_priority", label: "Priorité haute" },
                  { key: "recent_news", label: "Dernières news" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setWatchTab(tab.key)}
                  className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    watchTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {companiesForTab.map((c) => (
                <CompanyCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  sector={c.sector}
                  dealCount={c.dealCount}
                  priority={c.priority}
                />
              ))}
            </div>
            <Link
              href="/companies"
              className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Voir toutes les sociétés <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          {/* Top Sectors */}
          <section className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-foreground-muted" />
              <h2 className="text-sm font-semibold text-foreground">
                Top secteurs
              </h2>
            </div>
            <div className="space-y-2">
              {sectorBreakdown.map((s, i) => {
                const max = sectorBreakdown[0]?.value ?? 1;
                const pct = Math.round((s.value / max) * 100);
                return (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-xs text-foreground-muted w-5 text-right tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-foreground truncate">
                        {s.label}
                      </div>
                      <div className="mt-0.5 h-1.5 rounded bg-background-muted overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: "var(--accent)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground w-6 text-right">
                      {s.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recent articles */}
          <section className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-foreground-muted" />
                <h2 className="text-sm font-semibold text-foreground">
                  Dernières actualités
                </h2>
              </div>
              <Link
                href="/news"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentArticles.slice(0, 6).map((article) => (
                <div key={article.id} className="group">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-foreground group-hover:text-primary line-clamp-2 transition-colors"
                  >
                    {article.headline}
                  </a>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-foreground-muted">
                    <span>{article.source}</span>
                    <span>·</span>
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                    <span className="rounded bg-background-muted px-1 py-0.5">
                      {article.category}
                    </span>
                  </div>
                </div>
              ))}
              {stats.recentArticles.length === 0 && (
                <p className="text-xs text-foreground-muted">
                  Aucun article récent
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
