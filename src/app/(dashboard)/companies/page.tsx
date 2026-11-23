import { Suspense } from "react";
import { connection } from "next/server";
import { CompaniesClient } from "./client";
import { fetchCompanies } from "@/lib/supabase/queries";

export const instant = false;

export default async function CompaniesPage() {
  await connection();
  const companies = await fetchCompanies();
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading companies…</div>}>
      <CompaniesClient companies={companies} />
    </Suspense>
  );
}
