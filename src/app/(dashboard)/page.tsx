import { connection } from "next/server";
import Link from "next/link";
import {
  Building2,
  Handshake,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { fetchDashboardData } from "@/lib/supabase/queries";
import { formatCurrency } from "@/lib/utils";

export const instant = false;

export default async function DashboardPage() {
  await connection();

  const stats = await fetchDashboardData();

  const companyNameMap = new Map(stats.companies.map((c) => [c.id, c.name]));
  const getCompanyName = (id: string) => companyNameMap.get(id) ?? "Unknown";

  return (
    <div className="max-w-[1280px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Vue d&apos;ensemble — activité des clients monitorés
        </p>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Sociétés actives"
          value={stats.activeCompanies}
          icon={Building2}
        />
        <StatCard
          label="Deals actifs"
          value={stats.activeDeals}
          icon={Handshake}
        />
        <StatCard
          label="Total deals"
          value={stats.totalDeals}
          icon={Handshake}
        />
        <StatCard
          label="Opportunités ouvertes"
          value={stats.totalOpportunities}
          icon={Lightbulb}
        />
      </div>

      {/* Recent deals */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Dernières transactions
          </h2>
          <Link
            href="/deals"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Voir tout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-subtle text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <th className="px-3 py-2.5 text-left">Deal</th>
                <th className="px-3 py-2.5 text-left">Type</th>
                <th className="px-3 py-2.5 text-right">Montant</th>
                <th className="px-3 py-2.5 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentDeals.map((deal) => (
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
              {stats.recentDeals.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-foreground-muted">
                    Aucune transaction récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
