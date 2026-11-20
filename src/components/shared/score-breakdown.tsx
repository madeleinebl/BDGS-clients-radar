"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Flag,
  Edit3,
  Info,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ScoreResult,
  ScoringOutput,
  ScoreFactor,
} from "@/lib/scoring-engine";
import { getPriorityFromScore, SCORING_METHODOLOGY } from "@/lib/scoring-engine";

// ─── Priority colours aligned with design tokens ───────────────────────────

function getPriorityStyle(priority: string) {
  switch (priority) {
    case "HIGH":
      return "text-danger bg-danger/10 border-danger/20";
    case "MEDIUM":
      return "text-warning bg-warning/10 border-warning/20";
    case "LOW":
      return "text-info bg-info/10 border-info/20";
    default:
      return "text-foreground-muted bg-foreground-muted/10 border-border";
  }
}

// ─── Factor bar ────────────────────────────────────────────────────────────

function FactorBar({ factor }: { factor: ScoreFactor }) {
  const pct = factor.maxPoints > 0 ? (factor.points / factor.maxPoints) * 100 : 0;
  const barColor =
    pct >= 75
      ? "bg-success"
      : pct >= 50
        ? "bg-warning"
        : pct >= 25
          ? "bg-info"
          : "bg-foreground-muted/30";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{factor.name}</span>
        <span className="tabular-nums text-foreground-muted">
          {factor.points}/{factor.maxPoints}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-background-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] leading-snug text-foreground-muted">
        {factor.reasoning}
      </p>
    </div>
  );
}

// ─── Single score card ─────────────────────────────────────────────────────

function ScoreCard({
  title,
  result,
  scoreType,
  onOverride,
  onFlag,
}: {
  title: string;
  result: ScoreResult;
  scoreType: "newsRelevance" | "financeOpportunity";
  onOverride?: (scoreType: string, newScore: number, reason: string) => void;
  onFlag?: (scoreType: string, reason: string, suggestedScore?: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [overrideScore, setOverrideScore] = useState(result.total.toString());
  const [overrideReason, setOverrideReason] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [flagSuggested, setFlagSuggested] = useState("");

  const priorityStyle = getPriorityStyle(result.priority);

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header — always visible */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              {title}
            </h4>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                priorityStyle
              )}
            >
              {result.priority}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {result.total}
            </span>
            <span className="text-xs text-foreground-muted">/100</span>
          </div>
        </div>

        {/* Summary bar showing all factors */}
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-background-muted">
          {result.factors.map((f, i) => {
            const totalMax = result.factors.reduce((s, fac) => s + fac.maxPoints, 0);
            const widthPct = (f.maxPoints / totalMax) * 100;
            const fillPct = f.maxPoints > 0 ? (f.points / f.maxPoints) * 100 : 0;
            const color =
              fillPct >= 75
                ? "bg-success"
                : fillPct >= 50
                  ? "bg-warning"
                  : fillPct >= 25
                    ? "bg-info"
                    : "bg-foreground-muted/30";
            return (
              <div
                key={i}
                className="relative h-full"
                style={{ width: `${widthPct}%` }}
              >
                <div
                  className={cn(
                    "absolute inset-y-0 left-0",
                    color,
                    i === 0 && "rounded-l-full",
                    i === result.factors.length - 1 && "rounded-r-full"
                  )}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Action row */}
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {expanded ? (
              <>
                Hide factors <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show factors <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowOverride(!showOverride);
                setShowFlag(false);
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
              title="Override this score"
            >
              <Edit3 className="h-3 w-3" />
              Override
            </button>
            <button
              onClick={() => {
                setShowFlag(!showFlag);
                setShowOverride(false);
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-foreground-muted hover:bg-background-muted hover:text-foreground transition-colors"
              title="Flag this score as incorrect"
            >
              <Flag className="h-3 w-3" />
              Flag
            </button>
          </div>
        </div>
      </div>

      {/* Expanded factor breakdown */}
      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-3">
          {result.factors.map((f, i) => (
            <FactorBar key={i} factor={f} />
          ))}

          <div className="mt-2 flex items-start gap-1.5 rounded bg-background-subtle p-2">
            <Info className="h-3 w-3 mt-0.5 shrink-0 text-foreground-muted" />
            <p className="text-[10px] leading-relaxed text-foreground-muted italic">
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Override form */}
      {showOverride && (
        <div className="border-t border-border px-3 py-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Edit3 className="h-3.5 w-3.5" />
            Manual Score Override
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground-muted">New score:</label>
            <input
              type="number"
              min={0}
              max={100}
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
              className="w-16 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums focus:border-primary focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Reason for override (required)..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs resize-none h-16 focus:border-primary focus:outline-none"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowOverride(false)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-foreground-muted hover:bg-background-muted"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={() => {
                const score = parseInt(overrideScore, 10);
                if (score >= 0 && score <= 100 && overrideReason.trim()) {
                  onOverride?.(scoreType, score, overrideReason.trim());
                  setShowOverride(false);
                  setOverrideReason("");
                }
              }}
              disabled={!overrideReason.trim()}
              className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-3 w-3" /> Apply Override
            </button>
          </div>
        </div>
      )}

      {/* Flag form */}
      {showFlag && (
        <div className="border-t border-border px-3 py-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Flag Score as Incorrect
          </div>
          <textarea
            placeholder="Why does this score seem incorrect? (required)"
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs resize-none h-16 focus:border-primary focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground-muted">
              Suggested score (optional):
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={flagSuggested}
              onChange={(e) => setFlagSuggested(e.target.value)}
              placeholder="—"
              className="w-16 rounded border border-border bg-background px-2 py-1 text-sm tabular-nums focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowFlag(false)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-foreground-muted hover:bg-background-muted"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              onClick={() => {
                if (flagReason.trim()) {
                  const suggested = flagSuggested
                    ? parseInt(flagSuggested, 10)
                    : undefined;
                  onFlag?.(scoreType, flagReason.trim(), suggested);
                  setShowFlag(false);
                  setFlagReason("");
                  setFlagSuggested("");
                }
              }}
              disabled={!flagReason.trim()}
              className="inline-flex items-center gap-1 rounded bg-warning px-2 py-1 text-xs text-white hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Flag className="h-3 w-3" /> Submit Flag
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Full score breakdown panel ────────────────────────────────────────────

interface ScoreBreakdownProps {
  scoring: ScoringOutput;
  articleId: string;
  onOverride?: (
    articleId: string,
    scoreType: string,
    newScore: number,
    reason: string
  ) => void;
  onFlag?: (
    articleId: string,
    scoreType: string,
    reason: string,
    suggestedScore?: number
  ) => void;
  className?: string;
}

export function ScoreBreakdown({
  scoring,
  articleId,
  onOverride,
  onFlag,
  className,
}: ScoreBreakdownProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Score Analysis
        </h3>
        <span className="text-[10px] text-foreground-muted tabular-nums">
          Methodology v{scoring.methodologyVersion} · Scored{" "}
          {new Date(scoring.scoredAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreCard
          title="News Relevance"
          result={scoring.newsRelevance}
          scoreType="newsRelevance"
          onOverride={(st, score, reason) =>
            onOverride?.(articleId, st, score, reason)
          }
          onFlag={(st, reason, suggested) =>
            onFlag?.(articleId, st, reason, suggested)
          }
        />
        <ScoreCard
          title="Finance Opportunity"
          result={scoring.financeOpportunity}
          scoreType="financeOpportunity"
          onOverride={(st, score, reason) =>
            onOverride?.(articleId, st, score, reason)
          }
          onFlag={(st, reason, suggested) =>
            onFlag?.(articleId, st, reason, suggested)
          }
        />
      </div>

      <p className="text-[10px] text-foreground-muted text-center italic">
        Scores are automated estimates, not objective assessments. Always verify
        with professional judgment before acting.
      </p>
    </div>
  );
}

// ─── Compact inline score display ──────────────────────────────────────────

interface ScoreBadgePairProps {
  newsRelevance: number;
  financeOpportunity: number;
  size?: "sm" | "md";
  className?: string;
}

export function ScoreBadgePair({
  newsRelevance,
  financeOpportunity,
  size = "sm",
  className,
}: ScoreBadgePairProps) {
  const nrPriority = getPriorityFromScore(newsRelevance);
  const foPriority = getPriorityFromScore(financeOpportunity);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-medium tabular-nums",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          getPriorityStyle(nrPriority)
        )}
      >
        {newsRelevance}
        <span className="text-[0.65rem] opacity-70">NR</span>
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-medium tabular-nums",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          getPriorityStyle(foPriority)
        )}
      >
        {financeOpportunity}
        <span className="text-[0.65rem] opacity-70">FO</span>
      </span>
    </div>
  );
}
