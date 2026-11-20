"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { sampleBriefings } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tabs = ["All", "Daily", "Weekly"] as const;
type TabType = (typeof tabs)[number];

export default function BriefingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const filtered = useMemo(() => {
    if (activeTab === "All") return sampleBriefings;
    return sampleBriefings.filter((b) => b.type === activeTab.toLowerCase());
  }, [activeTab]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Briefings"
        description="AI-generated daily and weekly intelligence summaries"
      />

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "text-primary"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Briefing cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((briefing) => (
          <Link
            key={briefing.id}
            href={`/briefings/${briefing.id}`}
            className="rounded-lg border border-border p-5 hover:bg-background-subtle transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase",
                briefing.type === "daily"
                  ? "bg-info/10 text-info"
                  : "bg-accent/10 text-accent"
              )}>
                {briefing.type}
              </span>
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <Calendar className="h-3 w-3" />
                {formatDate(briefing.generatedAt)}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-foreground">{briefing.title}</h3>
            <p className="mt-1 text-sm text-foreground-muted line-clamp-3">{briefing.summary}</p>

            <div className="flex items-center gap-4 mt-3 text-xs text-foreground-muted">
              <span>{briefing.articleCount} articles analysed</span>
              <span>{briefing.highlightCount} highlights</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-10 w-10 text-foreground-muted/50 mb-3" />
          <p className="text-sm font-medium">No briefings yet</p>
          <p className="text-xs text-foreground-muted mt-1">Briefings will be generated once AI analysis is configured</p>
        </div>
      )}
    </div>
  );
}
