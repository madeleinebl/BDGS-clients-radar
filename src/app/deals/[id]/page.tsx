import { Suspense } from "react";
import { DealDetailClient } from "./client";
import {
  fetchDealById,
  fetchCompanyName,
  fetchNewsByCompany,
} from "@/lib/supabase/queries";

export const instant = false;

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await fetchDealById(id);

  let companyName = "Unknown";
  let relatedNews: Awaited<ReturnType<typeof fetchNewsByCompany>> = [];

  if (deal) {
    [companyName, relatedNews] = await Promise.all([
      fetchCompanyName(deal.companyId),
      fetchNewsByCompany(deal.companyId),
    ]);
  }

  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading deal…</div>}>
      <DealDetailClient
        deal={deal}
        companyName={companyName}
        relatedNews={relatedNews.slice(0, 4)}
      />
    </Suspense>
  );
}
