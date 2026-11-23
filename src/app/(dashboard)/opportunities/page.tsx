import { Suspense } from "react";
import { connection } from "next/server";
import { OpportunitiesClient } from "./client";
import { fetchOpportunities, fetchCompanies } from "@/lib/supabase/queries";

export const instant = false;

export default async function OpportunitiesPage() {
  await connection();
  const [opps, companies] = await Promise.all([fetchOpportunities(), fetchCompanies()]);
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading opportunities…</div>}>
      <OpportunitiesClient sampleOpportunities={opps} companies={companies} />
    </Suspense>
  );
}
