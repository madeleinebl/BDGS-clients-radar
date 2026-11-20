import { Suspense } from "react";
import { BriefingDetailClient } from "./client";

export const instant = false;

export default async function BriefingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading briefing…</div>}>
      <BriefingDetailClient briefingId={id} />
    </Suspense>
  );
}
