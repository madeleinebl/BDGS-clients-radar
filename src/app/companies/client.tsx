"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Upload, Download, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Company } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CompaniesClient({ companies }: { companies: Company[] }) {
  const sectors = [...new Set(companies.map((c) => c.sector))].map((s) => ({
    value: s,
    label: s,
  }));
  const countries = [...new Set(companies.map((c) => c.country))].map((c) => ({
    value: c,
    label: c,
  }));
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const filtered = companies
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (sectorFilter && c.sector !== sectorFilter) return false;
      if (countryFilter && c.country !== countryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "deals") return b.dealCount - a.dealCount;
      if (sortBy === "activity") return new Date(b.latestNewsDate).getTime() - new Date(a.latestNewsDate).getTime();
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Companies"
        description={`${companies.length} monitored companies`}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background-subtle transition-colors">
              <Upload className="h-3.5 w-3.5" /> Import CSV
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background-subtle transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Company
            </button>
          </div>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search companies..."
        filters={[
          {
            key: "sector",
            label: "All Sectors",
            options: sectors,
            value: sectorFilter,
            onChange: setSectorFilter,
          },
          {
            key: "country",
            label: "All Countries",
            options: countries,
            value: countryFilter,
            onChange: setCountryFilter,
          },
          {
            key: "sort",
            label: "Sort",
            options: [
              { value: "name", label: "Alphabetical" },
              { value: "deals", label: "By Deal Count" },
              { value: "activity", label: "By Latest Activity" },
            ],
            value: sortBy,
            onChange: setSortBy,
          },
        ]}
      />

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background-subtle text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Sector</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-center">Deals</th>
              <th className="px-4 py-3 text-left">Latest News</th>
              <th className="px-4 py-3 text-center">Priority</th>
              <th className="px-4 py-3 text-center w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr
                key={company.id}
                className="border-b border-border last:border-0 hover:bg-background-subtle transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${company.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {company.name}
                  </Link>
                  {company.ticker && (
                    <span className="ml-2 text-xs text-foreground-muted">
                      {company.ticker}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {company.sector}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {company.country}
                </td>
                <td className="px-4 py-3 text-center tabular-nums font-medium">
                  {company.dealCount}
                </td>
                <td className="px-4 py-3 text-foreground-muted text-xs">
                  {formatDate(company.latestNewsDate)}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={company.priority} />
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="p-1 hover:text-accent text-foreground-muted transition-colors">
                    <Star
                      className={cn(
                        "h-4 w-4",
                        company.watchlisted && "fill-accent text-accent"
                      )}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
