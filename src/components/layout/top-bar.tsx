"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, TrendingUp, Newspaper, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "deal" | "articles";
  title: string;
  subtitle: string;
  timestamp: string;
  href: string;
}

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !hasLoaded) {
      fetchNotifications();
    }
  };

  // Relative date label
  function relativeDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Rechercher sociétés, deals, actualités..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-background-subtle pl-9 pr-3 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border border-border bg-background-muted px-1.5 text-[10px] font-medium text-foreground-muted">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleToggle}
            className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-background-subtle transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-foreground-muted" />
            {(!hasLoaded || notifications.length > 0) && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            )}
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {hasLoaded && (
                  <button
                    onClick={fetchNotifications}
                    className="text-xs text-primary hover:underline"
                  >
                    Actualiser
                  </button>
                )}
              </div>

              {/* Content */}
              {loading ? (
                <div className="px-4 py-8 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-xs text-foreground-muted mt-2">Chargement…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-foreground-muted/30" />
                  <p className="text-sm text-foreground-muted mt-2">Aucune notification récente</p>
                  <p className="text-xs text-foreground-muted/60 mt-1">
                    Les deals détectés et articles ingérés apparaîtront ici.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-background-subtle transition-colors"
                      >
                        {/* Icon */}
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light">
                          {n.type === "deal" ? (
                            <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Newspaper className="h-3.5 w-3.5 text-primary" />
                          )}
                        </span>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug line-clamp-2">
                            {n.title}
                          </p>
                          <p className="text-xs text-foreground-muted mt-0.5">
                            {n.subtitle}
                          </p>
                        </div>

                        {/* Date */}
                        <span className="shrink-0 text-[10px] text-foreground-muted/60 mt-0.5">
                          {relativeDate(n.timestamp)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2">
                  <Link
                    href="/deals"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                  >
                    Voir tous les deals
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
          M
        </button>
      </div>
    </header>
  );
}
