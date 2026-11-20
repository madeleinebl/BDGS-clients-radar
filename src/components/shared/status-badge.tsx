import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Deal statuses
  closed: { label: "Closed", className: "bg-success/10 text-success border-success/20" },
  announced: { label: "Announced", className: "bg-info/10 text-info border-info/20" },
  in_progress: { label: "In Progress", className: "bg-warning/10 text-warning border-warning/20" },
  rumoured: { label: "Rumoured", className: "bg-foreground-muted/10 text-foreground-muted border-border" },
  cancelled: { label: "Cancelled", className: "bg-danger/10 text-danger border-danger/20" },
  // Opportunity statuses
  new: { label: "New", className: "bg-info/10 text-info border-info/20" },
  under_review: { label: "Under Review", className: "bg-warning/10 text-warning border-warning/20" },
  qualified: { label: "Qualified", className: "bg-success/10 text-success border-success/20" },
  dismissed: { label: "Dismissed", className: "bg-foreground-muted/10 text-foreground-muted border-border" },
  // Priority
  high: { label: "High", className: "bg-danger/10 text-danger border-danger/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", className: "bg-foreground-muted/10 text-foreground-muted border-border" },
  // Confidence
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-foreground-muted/10 text-foreground-muted border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
