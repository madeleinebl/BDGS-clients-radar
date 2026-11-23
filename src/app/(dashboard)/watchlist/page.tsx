import { Suspense } from "react";
import { connection } from "next/server";
import { WatchlistClient } from "./client";
import { fetchWatchlistItems, fetchCompanies } from "@/lib/supabase/queries";

export const instant = false;

export default async function WatchlistPage() {
  await connection();
  const [items, companies] = await Promise.all([fetchWatchlistItems(), fetchCompanies()]);
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading watchlist…</div>}>
      <WatchlistClient sampleWatchlist={items} companies={companies} />
    </Suspense>
  );
}
