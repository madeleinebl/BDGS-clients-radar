import { Suspense } from "react";
import { CompanyProfileClient } from "./client";

export const instant = false;

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading company…</div>}>
      <CompanyProfileClient companyId={id} />
    </Suspense>
  );
}
