"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Calendar, Loader2, Plus, Check, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import type { Briefing } from "@/data/sample-data";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const tabs = ["All", "Daily", "Weekly"] as const;
type TabType = (typeof tabs)[number];

export function BriefingsClient({ sampleBriefings }: { sampleBriefings: Briefing[] }) {
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [briefings, setBriefings] = useState<Briefing[]>(sampleBriefings);
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  async function handleGenerate(type: "daily" | "weekly") {
    setGenerating(true);
    setGenSuccess(null);
    setGenError(null);
    try {
      const res = await fetch("/api/generate-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        setGenSuccess(data.title || "Briefing généré");
        // Refresh the list
        const listRes = await fetch("/api/briefings");
        if (listRes.ok) {
          const listData = await listRes.json();
          if (listData.briefings) setBriefings(listData.briefings);
        }
      } else {
        setGenError(data.message || data.error || "Erreur lors de la génération");
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setGenerating(false);
    }
  }

  const filtered = useMemo(() => {
    if (activeTab === "All") return briefings;
    return briefings.filter((b) => b.type === activeTab.toLowerCase());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, briefings]);

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Briefings"
          description="Synthèses quotidiennes et hebdomadaires générées par IA"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleGenerate("daily")}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Quotidien
          </button>
          <button
            onClick={() => handleGenerate("weekly")}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-md border border-primary text-primary px-3 py-2 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Hebdomadaire
          </button>
        </div>
      </div>

      {/* Generation feedback */}
      {genSuccess && (
        <div className="rounded-md border border-success/30 bg-success/5 p-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-success shrink-0" />
          <span className="text-sm text-success">{genSuccess}</span>
        </div>
      )}
      {genError && (
        <div className="rounded-md border border-danger/30 bg-danger/5 p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-danger shrink-0" />
          <span className="text-sm text-danger">{genError}</span>
        </div>
      )}

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
          <p className="text-sm font-medium">Aucun briefing disponible</p>
          <p className="text-xs text-foreground-muted mt-1 max-w-sm">
            Cliquez sur un bouton ci-dessus pour générer votre premier briefing
            à partir des articles et deals récents.
          </p>
          <button
            onClick={() => handleGenerate("daily")}
            disabled={generating}
            className="mt-4 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Générer un briefing quotidien
          </button>
        </div>
      )}
    </div>
  );
}
