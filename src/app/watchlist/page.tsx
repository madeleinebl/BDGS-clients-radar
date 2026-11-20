"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { sampleWatchlist, getCompanyName } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tabs = ["All", "Companies", "Deals", "News", "Opportunities"] as const;
type TabType = (typeof tabs)[number];

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const filtered = useMemo(() => {
    if (activeTab === "All") return sampleWatchlist;
    const type = activeTab.toLowerCase().slice(0, -1) as string; // "companies" -> "company"
    return sampleWatchlist.filter((item) => item.entityType === type);
  }, [activeTab]);

  const getEntityLink = (item: (typeof sampleWatchlist)[0]) => {
    switch (item.entityType) {
      case "company": return `/companies/${item.entityId}`;
      case "deal": return `/deals/${item.entityId}`;
      case "news": return `/news`;
      case "opportunity": return `/opportunities/${item.entityId}`;
      default: return "#";
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Watchlist"
        description="Items you're tracking for updates"
      />

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const count = tab === "All"
              ? sampleWatchlist.length
              : sampleWatchlist.filter((w) => w.entityType === tab.toLowerCase().slice(0, -1)).length;
            return (
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
                <span className="ml-1 text-xs opacity-60">({count})</span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-background-subtle transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Star className="h-4 w-4 fill-accent text-accent shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={getEntityLink(item)} className="text-sm font-medium hover:text-primary truncate">
                    {item.label}
                  </Link>
                  <span className="rounded bg-background-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-foreground-muted">
                    {item.entityType}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-foreground-muted">
                  {item.companyId && <span>{getCompanyName(item.companyId)}</span>}
                  <span>Added {formatDate(item.addedAt)}</span>
                  {item.reason && (
                    <>
                      <span>·</span>
                      <span className="truncate">{item.reason}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button className="rounded p-1.5 text-foreground-muted hover:text-primary hover:bg-primary-light transition-colors" title="View">
                <Eye className="h-4 w-4" />
              </button>
              <button className="rounded p-1.5 text-foreground-muted hover:text-danger hover:bg-danger/5 transition-colors" title="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="h-10 w-10 text-foreground-muted/50 mb-3" />
            <p className="text-sm font-medium">No items in this category</p>
            <p className="text-xs text-foreground-muted mt-1">Star items from other pages to add them here</p>
          </div>
        )}
      </div>
    </div>
  );
}
