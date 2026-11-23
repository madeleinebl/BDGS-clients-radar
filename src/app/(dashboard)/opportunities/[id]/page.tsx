import { Suspense } from "react";
import { OpportunityDetailClient } from "./client";
import {
  fetchOpportunityById,
  fetchCompanyName,
  fetchNewsArticleById,
} from "@/lib/supabase/queries";

export const instant = false;

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await fetchOpportunityById(id);

  let companyName = "Unknown";
  let sourceArticle: Awaited<ReturnType<typeof fetchNewsArticleById>> = undefined;

  if (opp) {
    [companyName, sourceArticle] = await Promise.all([
      fetchCompanyName(opp.companyId),
      opp.sourceArticleId ? fetchNewsArticleById(opp.sourceArticleId) : Promise.resolve(undefined),
    ]);
  }

  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading opportunity…</div>}>
      <OpportunityDetailClient
        opp={opp}
        companyName={companyName}
        sourceArticle={sourceArticle}
      />
    </Suspense>
  );
}
