"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Globe, Star, Edit, ExternalLink, Building2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBadge } from "@/components/shared/relevance-badge";
import {
  getCompanyById, getNewsByCompany, getDealsByCompany,
  getOpportunitiesByCompany, getCompanyName,
} from "@/data/sample-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Deals", "News", "Opportunities", "Notes"] as const;
type Tab = (typeof tabs)[number];

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;
  const company = getCompanyById(companyId);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  if (!company) {
    return (
      <div className="max-w-[1280px] mx-auto py-12 text-center">
        <Building2 className="h-12 w-12 mx-auto text-foreground-muted/50" />
        <h2 className="mt-4 text-lg font-semibold">Company not found</h2>
        <Link href="/companies" className="mt-2 text-sm text-primary hover:underline">
          Back to Companies
        </Link>
      </div>
    );
  }

  const companyNews = getNewsByCompany(companyId);
  const companyDeals = getDealsByCompany(companyId);
  const companyOpps = getOpportunitiesByCompany(companyId);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Companies
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
            {company.ticker && (
              <span className="rounded bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
                {company.ticker} · {company.exchange}
              </span>
            )}
            <StatusBadge status={company.priority} />
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-foreground-muted">
            <span>{company.sector}</span>
            <span>·</span>
            <span>{company.country}</span>
            <span>·</span>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
              <Globe className="h-3.5 w-3.5" /> Website
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-background-subtle">
            <Star className={cn("h-4 w-4", company.watchlisted && "fill-accent text-accent")} />
            {company.watchlisted ? "Watching" : "Watch"}
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-background-subtle">
            <Edit className="h-4 w-4" /> Edit
          </button>
        </div>
      </div>

      <p className="text-sm text-foreground-muted">{company.description}</p>

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
              {tab === "Deals" && <span className="ml-1 text-xs opacity-60">({companyDeals.length})</span>}
              {tab === "News" && <span className="ml-1 text-xs opacity-60">({companyNews.length})</span>}
              {tab === "Opportunities" && <span className="ml-1 text-xs opacity-60">({companyOpps.length})</span>}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Key Facts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-foreground-muted">Type</span>
                <p className="font-medium">{company.isPublic ? "Public" : "Private"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-foreground-muted">Deals Tracked</span>
                <p className="font-medium">{company.dealCount}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-foreground-muted">Monitoring</span>
                <p className="font-medium capitalize">{company.monitoringStatus}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <span className="text-xs text-foreground-muted">Last News</span>
                <p className="font-medium">{formatDate(company.latestNewsDate)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">Recent Activity</h3>
            {companyNews.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-lg border border-border p-3">
                <span className="text-xs text-foreground-muted">{formatDate(n.publishedAt)} · {n.source}</span>
                <p className="text-sm font-medium mt-1 line-clamp-2">{n.headline}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Deals" && (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-subtle text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <th className="px-4 py-3 text-left">Deal</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {companyDeals.map((deal) => (
                <tr key={deal.id} className="border-b border-border last:border-0 hover:bg-background-subtle">
                  <td className="px-4 py-3">
                    <Link href={`/deals/${deal.id}`} className="font-medium hover:text-primary">{deal.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{deal.dealType}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{deal.amount ? formatCurrency(deal.amount, deal.currency) : "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={deal.status} /></td>
                  <td className="px-4 py-3 text-foreground-muted text-xs">{formatDate(deal.announcementDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "News" && (
        <div className="space-y-3">
          {companyNews.map((article) => (
            <div key={article.id} className="rounded-lg border border-border p-4 hover:bg-background-subtle transition-colors">
              <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1">
                <span className="font-medium">{article.source}</span>
                <span>·</span>
                <span>{formatDate(article.publishedAt)}</span>
                <span className="rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary">{article.category}</span>
              </div>
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary">
                {article.headline} <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </a>
              <p className="mt-1.5 text-sm text-foreground-muted">{article.summary}</p>
              <div className="flex gap-2 mt-2">
                <RelevanceBadge score={article.relevanceScore} label="REL" />
                <RelevanceBadge score={article.opportunityScore} label="OPP" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Opportunities" && (
        <div className="space-y-3">
          {companyOpps.map((opp) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`} className="block rounded-lg border border-border p-4 hover:bg-background-subtle transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground-muted">{formatDate(opp.detectedAt)}</span>
                <div className="flex gap-2">
                  <StatusBadge status={opp.confidence} />
                  <StatusBadge status={opp.status} />
                </div>
              </div>
              <p className="text-sm font-semibold">{opp.headline}</p>
              <p className="mt-1.5 text-sm text-foreground-muted line-clamp-2">{opp.hypothesis}</p>
              <RelevanceBadge score={opp.opportunityScore} label="OPP" className="mt-2" />
            </Link>
          ))}
          {companyOpps.length === 0 && (
            <p className="text-center text-sm text-foreground-muted py-8">No opportunities detected for this company.</p>
          )}
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="space-y-4">
          <textarea
            placeholder="Add private notes about this company..."
            className="w-full min-h-[200px] rounded-lg border border-border bg-background-subtle p-4 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            Save Notes
          </button>
        </div>
      )}
    </div>
  );
}
