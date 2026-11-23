import { Suspense } from "react";
import { CompanyProfileClient } from "./client";
import {
  fetchCompanyById,
  fetchNewsByCompany,
  fetchDealsByCompany,
  fetchOpportunitiesByCompany,
} from "@/lib/supabase/queries";

export const instant = false;

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [company, news, deals, opportunities] = await Promise.all([
    fetchCompanyById(id),
    fetchNewsByCompany(id),
    fetchDealsByCompany(id),
    fetchOpportunitiesByCompany(id),
  ]);

  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading company…</div>}>
      <CompanyProfileClient
        company={company}
        companyNews={news}
        companyDeals={deals}
        companyOpps={opportunities}
      />
    </Suspense>
  );
}
