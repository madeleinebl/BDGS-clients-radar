"use client";

import { useState } from "react";
import { Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search companies, deals, news..."
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
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-background-subtle transition-colors">
          <Bell className="h-4 w-4 text-foreground-muted" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-medium">
          M
        </button>
      </div>
    </header>
  );
}
