import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a deal amount for display.
 * All amounts in the system are stored in MILLIONS (e.g. 500 = €500M).
 */
export function formatCurrency(amountInMillions: number, currency: string = "EUR"): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "GBP" ? "£" : `${currency} `;
  if (amountInMillions >= 1_000) {
    const bn = amountInMillions / 1_000;
    return `${symbol}${bn % 1 === 0 ? bn.toFixed(0) : bn.toFixed(1)}Md`;
  }
  if (amountInMillions >= 1) {
    return `${symbol}${amountInMillions % 1 === 0 ? amountInMillions.toFixed(0) : amountInMillions.toFixed(1)}M`;
  }
  if (amountInMillions > 0) {
    return `${symbol}${(amountInMillions * 1_000).toFixed(0)}K`;
  }
  return `${symbol}0`;
}

export function getRelevanceColor(score: number): string {
  if (score >= 75) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-gray-600 bg-gray-50 border-gray-200";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    closed: "text-green-700 bg-green-50",
    active: "text-green-700 bg-green-50",
    announced: "text-blue-700 bg-blue-50",
    in_progress: "text-amber-700 bg-amber-50",
    rumoured: "text-gray-600 bg-gray-100",
    cancelled: "text-red-700 bg-red-50",
    new: "text-blue-700 bg-blue-50",
    under_review: "text-amber-700 bg-amber-50",
    qualified: "text-green-700 bg-green-50",
    dismissed: "text-gray-500 bg-gray-100",
    high: "text-red-700 bg-red-50",
    medium: "text-amber-700 bg-amber-50",
    low: "text-gray-600 bg-gray-100",
  };
  return colors[status] || "text-gray-600 bg-gray-100";
}

export function getPriorityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "HIGH", color: "text-red-700 bg-red-50" };
  if (score >= 60) return { label: "MEDIUM", color: "text-amber-700 bg-amber-50" };
  if (score >= 40) return { label: "LOW", color: "text-blue-700 bg-blue-50" };
  return { label: "INFO", color: "text-gray-600 bg-gray-100" };
}
