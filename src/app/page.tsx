import Link from "next/link";
import {
  Building2,
  Newspaper,
  Handshake,
  Lightbulb,
  Star,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBadge } from "@/components/shared/relevance-badge";
import {
  companies,
  newsArticles,
  deals,
  opportunities,
  watchlistItems,
  getCompanyName,
} from "@/data/sample-data";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const topStories = [...newsArticles]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  const recentDeals = [...deals]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, 5);

  const latestOpportunities = [...opportunities]
    .filter((o) => o.status !== "dismissed")
    .sort(
      (a, b) =>
        new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    )
    .slice(0, 3);

  const watchlistAlerts = [...watchlistItems]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 4);

  const todayArticles = newsArticles.filter((n) =>
    n.publishedAt.startsWith("2026-11-19")
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Morning brief — overview of monitored activity
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Monitored Companies"
          value={companies.filter((c) => c.monitoringStatus === "active").length}
          icon={Building2}
        />
        <StatCard
          label="New Articles Today"
          value={todayArticles.length}
          icon={Newspaper}
          trend={{ value: "+3 vs yesterday", positive: true }}
        />
        <StatCard
          label="Active Deals"
          value={
            deals.filter(
              (d) => d.status === "announced" || d.status === "in_progress"
            ).length
          }
          icon={Handshake}
        />
        <StatCard
          label="Open Opportunities"
          value={
            opportunities.filter(
              (o) => o.status === "new" || o.status === "under_review"
            ).length
          }
          icon={Lightbulb}
        />
        <StatCard
          label="Watchlist Alerts"
          value={watchlistAlerts.length}
          icon={Star}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top stories — 2 cols */}
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Today&apos;s Top Stories
            </h2>
            <Link
              href="/news"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {topStories.map((article) => (
              <div
                key={article.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 hover:bg-background-subtle transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
                    <span className="font-medium">{article.source}</span>
                    <span>·</span>
                    <span>{formatDate(article.publishedAt)}</span>
                    <span className="rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {article.category}
                    </span>
                  </div>
                  <Link
                    href="/news"
                    className="text-sm font-medium text-foreground hover:text-primary line-clamp-1"
                  >
                    {article.headline}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {article.companyIds.map((cid) => (
                      <Link
                        key={cid}
                        href={`/companies/${cid}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {getCompanyName(cid)}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <RelevanceBadge score={article.relevanceScore} label="REL" />
                  <RelevanceBadge score={article.opportunityScore} label="OPP" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Watchlist alerts — 1 col */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Watchlist Alerts
            </h2>
            <Link
              href="/watchlist"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {watchlistAlerts.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <span className="text-xs text-foreground-muted">
                    {item.companyId ? getCompanyName(item.companyId) : item.entityType}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {item.label}
                </p>
                <p className="text-xs text-foreground-muted mt-1">
                  {formatDate(item.addedAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent deals & Opportunity signals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Deal Activity
            </h2>
            <Link
              href="/deals"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-subtle text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  <th className="px-3 py-2.5 text-left">Deal</th>
                  <th className="px-3 py-2.5 text-left">Type</th>
                  <th className="px-3 py-2.5 text-right">Amount</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="font-medium text-foreground hover:text-primary line-clamp-1"
                      >
                        {deal.name}
                      </Link>
                      <div className="text-xs text-foreground-muted">
                        {getCompanyName(deal.companyId)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-foreground-muted text-xs">
                      {deal.dealType}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                      {deal.amount
                        ? formatCurrency(deal.amount, deal.currency)
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={deal.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Opportunity Signals
            </h2>
            <Link
              href="/opportunities"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {latestOpportunities.map((opp) => (
              <Link
                key={opp.id}
                href={`/opportunities/${opp.id}`}
                className="block rounded-lg border border-border bg-background p-3 hover:bg-background-subtle transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">
                    {getCompanyName(opp.companyId)}
                  </span>
                  <StatusBadge status={opp.confidence} />
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {opp.headline}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <RelevanceBadge score={opp.opportunityScore} label="OPP" />
                  <span className="text-xs text-foreground-muted">
                    {formatDate(opp.detectedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
