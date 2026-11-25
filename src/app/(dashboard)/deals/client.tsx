"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Deal, Company } from "@/data/sample-data";
import { formatDate, formatCurrency } from "@/lib/utils";

const dealTypeOptions = [
  "All Types", "M&A", "LBO", "Refinancing", "Corporate loan",
  "Bond issuance", "Private placement", "Project finance",
  "Infrastructure investment", "Asset disposal", "Capital increase",
  "Joint venture",
].map((v) => ({ value: v, label: v }));
const statusOptions = ["All Statuses", "announced", "in_progress", "closed", "cancelled", "rumoured"]
  .map((v) => ({ value: v, label: v }));
const sortOptions = ["Newest First", "Oldest First", "Amount (High)", "Amount (Low)"]
  .map((v) => ({ value: v, label: v }));

export function DealsClient({ sampleDeals, companies }: { sampleDeals: Deal[]; companies: Company[] }) {
  const companyNameMap = new Map(companies.map((c) => [c.id, c.name]));
  const getCompanyName = (id: string) => companyNameMap.get(id) ?? "Unknown";
  const [search, setSearch] = useState("");
  const [dealType, setDealType] = useState("All Types");
  const [status, setStatus] = useState("All Statuses");
  const [sort, setSort] = useState("Newest First");

  const filtered = useMemo(() => {
    let deals = [...sampleDeals];

    if (search) {
      const q = search.toLowerCase();
      deals = deals.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          getCompanyName(d.companyId).toLowerCase().includes(q) ||
          (d.advisors && d.advisors.some((a) => a.toLowerCase().includes(q)))
      );
    }
    if (dealType !== "All Types") deals = deals.filter((d) => d.dealType === dealType);
    if (status !== "All Statuses") deals = deals.filter((d) => d.status === status);

    deals.sort((a, b) => {
      switch (sort) {
        case "Oldest First":
          return new Date(a.announcementDate).getTime() - new Date(b.announcementDate).getTime();
        case "Amount (High)":
          return (b.amount ?? 0) - (a.amount ?? 0);
        case "Amount (Low)":
          return (a.amount ?? 0) - (b.amount ?? 0);
        default:
          return new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime();
      }
    });
    return deals;
  }, [search, dealType, status, sort]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Deal Tracker"
        description="Suivi des transactions annoncées, en cours et clôturées"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search deals or companies..."
        filters={[
          { key: "type", label: "Type", value: dealType, onChange: setDealType, options: dealTypeOptions },
          { key: "status", label: "Status", value: status, onChange: setStatus, options: statusOptions },
          { key: "sort", label: "Sort", value: sort, onChange: setSort, options: sortOptions },
        ]}
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <th className="px-4 py-3 text-left">Deal</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Conseils</th>
              <th className="px-4 py-3 text-left">Announced</th>
              <th className="px-4 py-3 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal) => (
              <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/deals/${deal.id}`} className="font-medium hover:text-primary">
                    {deal.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${deal.companyId}`} className="text-foreground-muted hover:text-primary">
                    {getCompanyName(deal.companyId)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground-muted">{deal.dealType}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {deal.amount ? formatCurrency(deal.amount, deal.currency) : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                <td className="px-4 py-3 text-xs text-foreground-muted">
                  {deal.advisors && deal.advisors.length > 0
                    ? deal.advisors.join(", ")
                    : <span className="italic text-foreground-muted/50">—</span>}
                </td>
                <td className="px-4 py-3 text-foreground-muted text-xs">{formatDate(deal.announcementDate)}</td>
                <td className="px-4 py-3">
                  {deal.sourceUrl ? (
                    <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      {deal.source}
                    </a>
                  ) : (
                    <span className="text-xs text-foreground-muted">{deal.source}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Handshake className="h-10 w-10 text-foreground-muted/50 mb-3" />
            {sampleDeals.length === 0 ? (
              <>
                <p className="text-sm font-medium">Aucun deal enregistré</p>
                <p className="text-xs text-foreground-muted mt-1 max-w-sm">
                  Les deals apparaîtront ici au fur et à mesure qu&apos;ils seront détectés dans les sources d&apos;actualité ou ajoutés manuellement.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Aucun deal ne correspond à vos filtres</p>
                <p className="text-xs text-foreground-muted mt-1">Essayez d&apos;ajuster votre recherche ou vos filtres</p>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-foreground-muted">
        {filtered.length} sur {sampleDeals.length} deals
      </p>
    </div>
  );
}
