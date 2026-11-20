"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { sampleDeals, getCompanyName } from "@/data/sample-data";
import { formatDate, formatCurrency } from "@/lib/utils";

const dealTypeOptions = [
  "All Types", "M&A", "LBO", "Refinancing", "IPO", "Bond Issuance",
  "Capital Increase", "Asset Sale", "Joint Venture", "Restructuring",
  "Project Finance", "Private Placement",
].map((v) => ({ value: v, label: v }));
const statusOptions = ["All Statuses", "announced", "in_progress", "closed", "cancelled", "rumoured"]
  .map((v) => ({ value: v, label: v }));
const sortOptions = ["Newest First", "Oldest First", "Amount (High)", "Amount (Low)"]
  .map((v) => ({ value: v, label: v }));

export default function DealsPage() {
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
          getCompanyName(d.companyId).toLowerCase().includes(q)
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
        description="Track announced, in-progress, and completed transactions"
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
            <p className="text-sm font-medium">No deals match your filters</p>
            <p className="text-xs text-foreground-muted mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <p className="text-xs text-foreground-muted">
        Showing {filtered.length} of {sampleDeals.length} deals
      </p>
    </div>
  );
}
