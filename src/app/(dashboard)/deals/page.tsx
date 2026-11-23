import { Suspense } from "react";
import { DealsClient } from "./client";
import { fetchDeals, fetchCompanies } from "@/lib/supabase/queries";

export const instant = false;

export default async function DealsPage() {
  const [deals, companies] = await Promise.all([fetchDeals(), fetchCompanies()]);
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading deals…</div>}>
      <DealsClient sampleDeals={deals} companies={companies} />
    </Suspense>
  );
}
