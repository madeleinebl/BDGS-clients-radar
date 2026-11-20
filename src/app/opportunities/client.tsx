"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBadge } from "@/components/shared/relevance-badge";
import type { Opportunity, Company } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";

const statusOptions = ["All Statuses", "new", "under_review", "qualified", "dismissed"]
  .map((v) => ({ value: v, label: v }));
const confidenceOptions = ["All Confidence", "high", "medium", "low"]
  .map((v) => ({ value: v, label: v }));
const signalOptions = [
  "All Signals", "M&A activity", "Refinancing need", "Expansion financing",
  "Restructuring signal", "Capital markets activity", "Regulatory change",
].map((v) => ({ value: v, label: v }));
const sortOptions = ["Newest First", "Oldest First", "Score (High)", "Score (Low)"]
  .map((v) => ({ value: v, label: v }));

export function OpportunitiesClient({ sampleOpportunities, companies }: { sampleOpportunities: Opportunity[]; companies: Company[] }) {
  const companyNameMap = new Map(companies.map((c) => [c.id, c.name]));
  const getCompanyName = (id: string) => companyNameMap.get(id) ?? "Unknown";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [confidence, setConfidence] = useState("All Confidence");
  const [signal, setSignal] = useState("All Signals");
  const [sort, setSort] = useState("Newest First");

  const filtered = useMemo(() => {
    let opps = [...sampleOpportunities];

    if (search) {
      const q = search.toLowerCase();
      opps = opps.filter(
        (o) =>
          o.headline.toLowerCase().includes(q) ||
          getCompanyName(o.companyId).toLowerCase().includes(q) ||
          o.hypothesis.toLowerCase().includes(q)
      );
    }
    if (status !== "All Statuses") opps = opps.filter((o) => o.status === status);
    if (confidence !== "All Confidence") opps = opps.filter((o) => o.confidence === confidence);
    if (signal !== "All Signals") opps = opps.filter((o) => o.signalType === signal);

    opps.sort((a, b) => {
      switch (sort) {
        case "Oldest First":
          return new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime();
        case "Score (High)":
          return b.opportunityScore - a.opportunityScore;
        case "Score (Low)":
          return a.opportunityScore - b.opportunityScore;
        default:
          return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      }
    });
    return opps;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, confidence, signal, sort, sampleOpportunities]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Opportunities"
        description="AI-detected financing signals and potential mandates"
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search opportunities..."
        filters={[
          { key: "status", label: "Status", value: status, onChange: setStatus, options: statusOptions },
          { key: "confidence", label: "Confidence", value: confidence, onChange: setConfidence, options: confidenceOptions },
          { key: "signal", label: "Signal", value: signal, onChange: setSignal, options: signalOptions },
          { key: "sort", label: "Sort", value: sort, onChange: setSort, options: sortOptions },
        ]}
      />

      <div className="space-y-3">
        {filtered.map((opp) => (
          <Link
            key={opp.id}
            href={`/opportunities/${opp.id}`}
            className="block rounded-lg border border-border p-5 hover:bg-background-subtle transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground-muted">{getCompanyName(opp.companyId)}</span>
                <span className="text-xs text-foreground-muted">·</span>
                <span className="text-xs text-foreground-muted">{formatDate(opp.detectedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={opp.confidence} />
                <StatusBadge status={opp.status} />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-foreground">{opp.headline}</h3>
            <p className="mt-1 text-sm text-foreground-muted line-clamp-2">{opp.hypothesis}</p>

            <div className="flex items-center gap-3 mt-3">
              <RelevanceBadge score={opp.opportunityScore} label="OPP" />
              <span className="rounded bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
                {opp.signalType}
              </span>
              {opp.practiceAreas.map((area) => (
                <span key={area} className="text-[10px] text-foreground-muted">{area}</span>
              ))}
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-10 w-10 text-foreground-muted/50 mb-3" />
            <p className="text-sm font-medium">No opportunities match your filters</p>
            <p className="text-xs text-foreground-muted mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <p className="text-xs text-foreground-muted">
        Showing {filtered.length} of {sampleOpportunities.length} opportunities
      </p>
    </div>
  );
}
