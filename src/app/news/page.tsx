import { Suspense } from "react";
import { NewsFeedClient } from "./client";

export const instant = false;

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto py-12 text-center text-foreground-muted">Loading news feed…</div>}>
      <NewsFeedClient />
    </Suspense>
  );
}
