import { cn } from "@/lib/utils";

interface RelevanceBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function RelevanceBadge({
  score,
  label,
  size = "sm",
  className,
}: RelevanceBadgeProps) {
  const color =
    score >= 75
      ? "text-success bg-success/10 border-success/20"
      : score >= 50
        ? "text-warning bg-warning/10 border-warning/20"
        : "text-foreground-muted bg-foreground-muted/10 border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        color,
        className
      )}
    >
      {score}
      {label && <span className="text-[0.65rem] opacity-70">{label}</span>}
    </span>
  );
}
