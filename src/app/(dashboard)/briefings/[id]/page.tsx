import { Suspense } from "react";
import { BriefingDetailClient } from "./client";
import {
  fetchBriefingById,
  fetchNewsArticleById,
} from "@/lib/supabase/queries";
import type { NewsArticle } from "@/lib/supabase/queries";

export const instant = false;

export default async function BriefingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const briefing = await fetchBriefingById(id);

  let articles: NewsArticle[] = [];
  if (briefing) {
    const fetched = await Promise.all(
      briefing.articleIds.map((aid) => fetchNewsArticleById(aid))
    );
    articles = fetched.filter((a): a is NewsArticle => a !== undefined);
  }

  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading briefing…</div>}>
      <BriefingDetailClient briefing={briefing} articles={articles} />
    </Suspense>
  );
}
