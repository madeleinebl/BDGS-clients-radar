import { Suspense } from "react";
import { connection } from "next/server";
import { NewsFeedClient } from "./client";
import { fetchNewsArticles, fetchCompanies } from "@/lib/supabase/queries";

export const instant = false;

export default async function NewsPage() {
  await connection();
  const [articles, companies] = await Promise.all([fetchNewsArticles(), fetchCompanies()]);
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading news feed…</div>}>
      <NewsFeedClient newsArticles={articles} companies={companies} />
    </Suspense>
  );
}
