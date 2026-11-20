import { Suspense } from "react";
import { BriefingsClient } from "./client";
import { fetchBriefings } from "@/lib/supabase/queries";

export const instant = false;

export default async function BriefingsPage() {
  const briefings = await fetchBriefings();
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading briefings…</div>}>
      <BriefingsClient sampleBriefings={briefings} />
    </Suspense>
  );
}
