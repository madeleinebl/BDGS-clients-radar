"use client";

import Link from "next/link";
import {
  ArrowLeft, Lightbulb, ExternalLink, CheckCircle, XCircle, AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RelevanceBadge } from "@/components/shared/relevance-badge";
import type { Opportunity, NewsArticle } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/utils";

interface Props {
  opp: Opportunity | undefined;
  companyName: string;
  sourceArticle: NewsArticle | undefined;
}

export function OpportunityDetailClient({ opp, companyName, sourceArticle }: Props) {
  if (!opp) {
    return (
      <div className="max-w-[1280px] mx-auto py-12 text-center">
        <Lightbulb className="h-12 w-12 mx-auto text-foreground-muted/50" />
        <h2 className="mt-4 text-lg font-semibold">Opportunity not found</h2>
        <Link href="/opportunities" className="mt-2 text-sm text-primary hover:underline">
          Back to Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Opportunities
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{opp.headline}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-foreground-muted">
            <Link href={`/companies/${opp.companyId}`} className="hover:text-primary">
              {companyName}
            </Link>
            <span>·</span>
            <span>{opp.signalType}</span>
            <span>·</span>
            <span>Detected {formatDate(opp.detectedAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={opp.confidence} />
          <StatusBadge status={opp.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-2">AI Hypothesis</h3>
            <p className="text-sm">{opp.hypothesis}</p>
            <p className="mt-3 text-xs text-foreground-muted italic">
              This is an AI-generated hypothesis based on public news analysis. It does not represent confirmed information or BDGS involvement.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-2">Relevant Practice Areas</h3>
            <div className="flex flex-wrap gap-2">
              {opp.practiceAreas.map((area) => (
                <span key={area} className="rounded-md bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-3">Opportunity Score</h3>
            <RelevanceBadge score={opp.opportunityScore} label="OPP" />
            <p className="mt-3 text-xs text-foreground-muted">
              Score components: Financing need, Transaction likelihood, Deal size potential, Relevance to expertise, Actionability.
              Full scoring methodology is available in Settings.
            </p>
          </div>

          {sourceArticle && (
            <div className="rounded-lg border border-border p-5 bg-background-subtle">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-2">Source Article</h3>
              <p className="text-sm font-medium">{sourceArticle.headline}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted">
                <span>{sourceArticle.source}</span>
                <span>·</span>
                <span>{formatDate(sourceArticle.publishedAt)}</span>
              </div>
              <p className="mt-2 text-sm text-foreground-muted">{sourceArticle.summary}</p>
              <a href={sourceArticle.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                Read full article <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 rounded-md bg-success px-4 py-2 text-sm font-medium text-white hover:bg-success/90">
              <CheckCircle className="h-4 w-4" /> Qualify
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-background-subtle">
              <AlertTriangle className="h-4 w-4" /> Flag for Review
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-danger text-danger px-4 py-2 text-sm font-medium hover:bg-danger/5">
              <XCircle className="h-4 w-4" /> Dismiss
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-foreground-muted">Signal Type</dt>
                <dd className="font-medium">{opp.signalType}</dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Confidence</dt>
                <dd className="font-medium capitalize">{opp.confidence}</dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Detected</dt>
                <dd className="font-medium">{formatDate(opp.detectedAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-foreground-muted">Status</dt>
                <dd className="capitalize">{opp.status.replace("-", " ")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
