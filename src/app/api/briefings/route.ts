import { NextResponse } from "next/server";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  await connection();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ briefings: [] });
  }

  try {
    const { createServerClient } = await import("@/lib/supabase/server");
    const db = createServerClient();

    const { data, error } = await db
      .from("briefings")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const briefings = (data ?? []).map((b: Record<string, unknown>) => ({
      id: b.id,
      title: b.title,
      type: b.type,
      summary: b.summary,
      highlights: b.highlights ?? [],
      articleIds: b.article_ids ?? [],
      articleCount: b.article_count ?? 0,
      highlightCount: Array.isArray(b.highlights) ? (b.highlights as unknown[]).length : 0,
      generatedAt: b.generated_at,
      createdAt: b.created_at,
    }));

    return NextResponse.json({ briefings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
