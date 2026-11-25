/**
 * GET /api/notifications
 * ======================
 * Returns recent activity items for the notification bell:
 * - New deals detected in the last 7 days
 * - New articles ingested in the last 24 hours
 *
 * All data comes from public sources only.
 */

import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { connection } from "next/server";

export async function GET() {
  await connection();

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ notifications: [], count: 0 });
  }

  try {
    const { createServerClient } = await import("@/lib/supabase/server");
    const db = createServerClient();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Parallel fetch: recent deals + recent articles count
    const [dealsResult, articlesResult] = await Promise.all([
      db
        .from("deals")
        .select("id, name, deal_type, status, announcement_date, company_id, source")
        .gte("announcement_date", sevenDaysAgo.toISOString().slice(0, 10))
        .order("announcement_date", { ascending: false })
        .limit(10),
      db
        .from("news_articles")
        .select("*", { count: "exact", head: true })
        .gte("published_at", oneDayAgo.toISOString()),
    ]);

    const deals = (dealsResult.data ?? []) as Array<{
      id: string;
      name: string;
      deal_type: string;
      status: string;
      announcement_date: string;
      company_id: string;
      source: string;
    }>;

    const recentArticleCount = articlesResult.count ?? 0;

    // Build notification items
    interface Notification {
      id: string;
      type: "deal" | "articles";
      title: string;
      subtitle: string;
      timestamp: string;
      href: string;
    }

    const notifications: Notification[] = [];

    // Deal notifications
    for (const deal of deals) {
      const typeLabels: Record<string, string> = {
        "M&A": "M&A",
        "LBO": "LBO",
        "Refinancing": "Refinancement",
        "Corporate loan": "Crédit",
        "Bond issuance": "Émission obligataire",
        "Private placement": "Placement privé",
        "Project finance": "Financement de projet",
        "Infrastructure investment": "Investissement infra",
        "Asset disposal": "Cession",
        "Capital increase": "Augmentation de capital",
        "Joint venture": "Joint-venture",
      };
      const statusLabels: Record<string, string> = {
        rumoured: "Rumeur",
        announced: "Annoncé",
        in_progress: "En cours",
        closed: "Clôturé",
        cancelled: "Annulé",
      };

      notifications.push({
        id: `deal-${deal.id}`,
        type: "deal",
        title: deal.name,
        subtitle: `${typeLabels[deal.deal_type] ?? deal.deal_type} · ${statusLabels[deal.status] ?? deal.status}`,
        timestamp: deal.announcement_date,
        href: `/deals/${deal.id}`,
      });
    }

    // Articles summary notification
    if (recentArticleCount > 0) {
      notifications.push({
        id: "articles-today",
        type: "articles",
        title: `${recentArticleCount} article${recentArticleCount > 1 ? "s" : ""} ingéré${recentArticleCount > 1 ? "s" : ""}`,
        subtitle: "Dernières 24 heures",
        timestamp: new Date().toISOString().slice(0, 10),
        href: "/news",
      });
    }

    return NextResponse.json({
      notifications,
      count: notifications.length,
    });
  } catch (err) {
    console.error("[BDGS] Notifications error:", err);
    return NextResponse.json({ notifications: [], count: 0 });
  }
}
