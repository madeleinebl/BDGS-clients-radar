"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Star, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FilterBar } from "@/components/shared/filter-bar";
import { ScoreBadgePair, ScoreBreakdown } from "@/components/shared/score-breakdown";
import { newsArticles, getCompanyName, companies } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  scoreArticle,
  extractArticleInput,
  type ScoringOutput,
} from "@/lib/scoring-engine";

const categoryOptions = [
  "M&A", "Financing", "Regulatory", "Earnings", "Management",
  "Restructuring", "IPO", "Infrastructure", "Credit", "Other",
].map((c) => ({ value: c, label: c }));

const sortOptions = [
  { value: "date", label: "By Date" },
  { value: "relevance", label: "By News Relevance" },
  { value: "opportunity", label: "By Opportunity Score" },
];

const priorityFilterOptions = [
  { value: "HIGH", label: "HIGH (80–100)" },
  { value: "MEDIUM", label: "MEDIUM (60–79)" },
  { value: "LOW", label: "LOW (40–59)" },
  { value: "INFORMATIONAL", label: "INFO (0–39)" },
];

export function NewsFeedClient() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [nrPriorityFilter, setNrPriorityFilter] = useState("");
  const [foPriorityFilter, setFoPriorityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Score every article once and cache
  const scoredArticles = useMemo(() => {
    return newsArticles.map((article) => {
      const input = extractArticleInput({
        headline: article.headline,
        summary: article.summary,
        category: article.category,
        source: article.source,
        publishedAt: article.publishedAt,
        companyIds: article.companyIds,
      });
      const scoring = scoreArticle(input);
      return { ...article, scoring };
    });
  }, []);

  const filtered = scoredArticles
    .filter((n) => {
      if (
        search &&
        !n.headline.toLowerCase().includes(search.toLowerCase()) &&
        !n.summary.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (categoryFilter && n.category !== categoryFilter) return false;
      if (companyFilter && !n.companyIds.includes(companyFilter)) return false;
      if (nrPriorityFilter && n.scoring.newsRelevance.priority !== nrPriorityFilter)
        return false;
      if (
        foPriorityFilter &&
        n.scoring.financeOpportunity.priority !== foPriorityFilter
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "relevance")
        return b.scoring.newsRelevance.total - a.scoring.newsRelevance.total;
      if (sortBy === "opportunity")
        return (
          b.scoring.financeOpportunity.total - a.scoring.financeOpportunity.total
        );
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="News Feed"
        description={`${newsArticles.length} articles from monitored sources`}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search headlines and summaries..."
        filters={[
          {
            key: "category",
            label: "All Categories",
            options: categoryOptions,
            value: categoryFilter,
            onChange: setCategoryFilter,
          },
          {
            key: "company",
            label: "All Companies",
            options: companies.map((c) => ({ value: c.id, label: c.name })),
            value: companyFilter,
            onChange: setCompanyFilter,
          },
          {
            key: "nrPriority",
            label: "News Relevance",
            options: priorityFilterOptions,
            value: nrPriorityFilter,
            onChange: setNrPriorityFilter,
          },
          {
            key: "foPriority",
            label: "Opportunity Score",
            options: priorityFilterOptions,
            value: foPriorityFilter,
            onChange: setFoPriorityFilter,
          },
          {
            key: "sort",
            label: "Sort",
            options: sortOptions,
            value: sortBy,
            onChange: setSortBy,
          },
        ]}
      />

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-background p-8 text-center text-sm text-foreground-muted">
            No articles match the current filters.
          </div>
        )}
        {filtered.map((article) => (
          <div
            key={article.id}
            className={cn(
              "rounded-lg border border-border bg-background transition-colors",
              !article.isRead && "border-l-2 border-l-primary"
            )}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-foreground-muted mb-1.5">
                    <span className="font-medium">{article.source}</span>
                    <span>·</span>
                    <span>{formatDate(article.publishedAt)}</span>
                    <span className="rounded bg-primary-light px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {article.category}
                    </span>
                    {!article.isRead && (
                      <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">
                        NEW
                      </span>
                    )}
                  </div>

                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-foreground hover:text-primary"
                  >
                    {article.headline}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                  </a>

                  <p className="mt-1.5 text-sm text-foreground-muted line-clamp-2">
                    {article.summary}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {article.companyIds.map((cid) => (
                      <Link
                        key={cid}
                        href={`/companies/${cid}`}
                        className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        {getCompanyName(cid)}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ScoreBadgePair
                    newsRelevance={article.scoring.newsRelevance.total}
                    financeOpportunity={article.scoring.financeOpportunity.total}
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === article.id ? null : article.id
                        )
                      }
                      className="p-1 hover:text-primary text-foreground-muted transition-colors"
                      title="Score breakdown"
                    >
                      {expandedId === article.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button className="p-1 hover:text-accent text-foreground-muted transition-colors">
                      <Star
                        className={cn(
                          "h-4 w-4",
                          article.watchlisted && "fill-accent text-accent"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable score breakdown */}
            {expandedId === article.id && (
              <div className="border-t border-border px-4 py-4">
                <ScoreBreakdown
                  scoring={article.scoring}
                  articleId={article.id}
                  onOverride={(id, scoreType, score, reason) => {
                    // TODO: persist override when Supabase is connected
                    console.log("Override:", { id, scoreType, score, reason });
                  }}
                  onFlag={(id, scoreType, reason, suggested) => {
                    // TODO: persist flag when Supabase is connected
                    console.log("Flag:", {
                      id,
                      scoreType,
                      reason,
                      suggested,
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
