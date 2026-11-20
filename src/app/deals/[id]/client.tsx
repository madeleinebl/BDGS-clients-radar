"use client";

import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Handshake, Calendar,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { sampleDeals, getCompanyName, sampleNewsArticles } from "@/data/sample-data";
import { formatDate, formatCurrency } from "@/lib/utils";

export function DealDetailClient({ dealId }: { dealId: string }) {
  const deal = sampleDeals.find((d) => d.id === dealId);

  if (!deal) {
    return (
      <div className="max-w-[1280px] mx-auto py-12 text-center">
        <Handshake className="h-12 w-12 mx-auto text-foreground-muted/50" />
        <h2 className="mt-4 text-lg font-semibold">Deal not found</h2>
        <Link href="/deals" className="mt-2 text-sm text-primary hover:underline">
          Back to Deal Tracker
        </Link>
      </div>
    );
  }

  const relatedNews = sampleNewsArticles.filter((n) => n.companyIds.includes(deal.companyId)).slice(0, 4);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <Link href="/deals" className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Deal Tracker
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{deal.name}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-foreground-muted">
            <Link href={`/companies/${deal.companyId}`} className="hover:text-primary">
              {getCompanyName(deal.companyId)}
            </Link>
            <span>·</span>
            <span>{deal.dealType}</span>
          </div>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <p className="text-sm text-foreground-muted">{deal.summary}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4">
              <span className="text-xs text-foreground-muted">Amount</span>
              <p className="text-lg font-bold tabular-nums mt-0.5">
                {deal.amount ? formatCurrency(deal.amount, deal.currency) : "Not disclosed"}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <span className="text-xs text-foreground-muted">Currency</span>
              <p className="text-lg font-bold mt-0.5">{deal.currency}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <span className="text-xs text-foreground-muted flex items-center gap-1"><Calendar className="h-3 w-3" /> Announced</span>
              <p className="font-medium mt-0.5">{formatDate(deal.announcementDate)}</p>
            </div>
            {deal.closingDate && (
              <div className="rounded-lg border border-border p-4">
                <span className="text-xs text-foreground-muted flex items-center gap-1"><Calendar className="h-3 w-3" /> Closing</span>
                <p className="font-medium mt-0.5">{formatDate(deal.closingDate)}</p>
              </div>
            )}
          </div>

          {(deal.buyers.length > 0 || deal.sellers.length > 0 || deal.advisors.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Parties</h3>
              {deal.buyers.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-foreground-muted">Buyers</span>
                  <p className="text-sm mt-0.5">{deal.buyers.join(", ")}</p>
                </div>
              )}
              {deal.sellers.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-foreground-muted">Sellers</span>
                  <p className="text-sm mt-0.5">{deal.sellers.join(", ")}</p>
                </div>
              )}
              {deal.advisors.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <span className="text-xs font-medium text-foreground-muted">Advisors (from public sources)</span>
                  <p className="text-sm mt-0.5">{deal.advisors.join(", ")}</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-border p-4 bg-background-subtle">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-foreground-muted">Source</span>
                <p className="text-sm font-medium">{deal.source}</p>
              </div>
              {deal.sourceUrl && (
                <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-3">Related News</h3>
            {relatedNews.length > 0 ? (
              <div className="space-y-3">
                {relatedNews.map((article) => (
                  <div key={article.id} className="rounded-lg border border-border p-3">
                    <span className="text-xs text-foreground-muted">{formatDate(article.publishedAt)} · {article.source}</span>
                    <p className="text-sm font-medium mt-1 line-clamp-2">{article.headline}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">No related articles found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
