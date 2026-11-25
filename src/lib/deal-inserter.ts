/**
 * Deal Inserter
 * =============
 * Takes DetectedDeal objects from deal-detector and inserts them into
 * the Supabase deals table, with deduplication.
 *
 * Dedup strategy:
 *  - Generate a fingerprint from: companyId + dealType + month of announcement
 *  - Before inserting, check if a deal with same company + type already exists
 *    within ±30 days → skip (same deal, multiple articles)
 *  - If amount is provided and an existing deal has no amount → update it
 */

import type { DetectedDeal } from "./deal-detector";

interface SupabaseClient {
  from(table: string): any;
}

interface InsertResult {
  inserted: number;
  skipped: number;
  updated: number;
  details: string[];
}

export async function insertDetectedDeals(
  db: SupabaseClient,
  deals: DetectedDeal[],
): Promise<InsertResult> {
  const result: InsertResult = { inserted: 0, skipped: 0, updated: 0, details: [] };

  if (deals.length === 0) return result;

  // Fetch existing deals for dedup comparison (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: existingDeals } = await db
    .from("deals")
    .select("*")
    .gte("announcement_date", ninetyDaysAgo.toISOString().slice(0, 10));

  const existing = (existingDeals ?? []) as Array<{
    id: string;
    company_id: string;
    deal_type: string;
    name: string;
    amount: number | null;
    announcement_date: string;
    advisors: string[];
  }>;

  for (const deal of deals) {
    // Skip low confidence deals
    if (deal.confidence === "low") {
      result.skipped++;
      result.details.push(`Skipped (low confidence): ${deal.name}`);
      continue;
    }

    // Check for duplicate: same company + same deal type within ±30 days
    const dealDate = new Date(deal.announcementDate);
    const duplicate = existing.find((e) => {
      if (e.company_id !== deal.companyId) return false;
      if (e.deal_type !== deal.dealType) return false;
      const existDate = new Date(e.announcement_date);
      const daysDiff = Math.abs(dealDate.getTime() - existDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    if (duplicate) {
      // Check if we can enrich the existing deal
      const updates: Record<string, unknown> = {};
      const updateReasons: string[] = [];

      // If new article has an amount and existing deal doesn't → update
      if (deal.amount && !duplicate.amount) {
        updates.amount = deal.amount;
        updates.currency = deal.currency;
        updates.summary = deal.summary;
        updates.source_url = deal.sourceUrl;
        updateReasons.push(`amount → ${deal.currency} ${deal.amount}M`);
      }

      // Merge advisors: add any new advisors not already in the existing list
      if (deal.advisors.length > 0) {
        const existingAdvisors = new Set(duplicate.advisors ?? []);
        const newAdvisors = deal.advisors.filter((a) => !existingAdvisors.has(a));
        if (newAdvisors.length > 0) {
          updates.advisors = [...(duplicate.advisors ?? []), ...newAdvisors];
          updateReasons.push(`advisors +${newAdvisors.length}: ${newAdvisors.join(", ")}`);
        }
      }

      if (Object.keys(updates).length > 0) {
        updates.last_updated = new Date().toISOString();
        const { error } = await db
          .from("deals")
          .update(updates)
          .eq("id", duplicate.id);

        if (!error) {
          result.updated++;
          result.details.push(`Updated "${duplicate.name}": ${updateReasons.join("; ")}`);
          // Update in-memory copy for intra-batch merging
          if (updates.advisors) duplicate.advisors = updates.advisors as string[];
        }
      } else {
        result.skipped++;
        result.details.push(`Skipped (duplicate of "${duplicate.name}"): ${deal.name}`);
      }
      continue;
    }

    // Insert new deal
    const now = new Date().toISOString();
    const { error } = await (db.from("deals") as any).insert({
      name: deal.name,
      company_id: deal.companyId,
      deal_type: deal.dealType,
      counterparty: deal.counterparty,
      amount: deal.amount,
      currency: deal.currency,
      status: deal.status,
      announcement_date: deal.announcementDate,
      last_updated: now,
      source: deal.source,
      source_url: deal.sourceUrl,
      summary: deal.summary,
      buyers: deal.buyers,
      sellers: deal.sellers,
      advisors: deal.advisors, // Extracted from article text — never invented
    });

    if (error) {
      result.skipped++;
      result.details.push(`Insert failed (${error.message}): ${deal.name}`);
    } else {
      result.inserted++;
      result.details.push(`Inserted: ${deal.name} [${deal.confidence}]`);
      // Add to existing array for intra-batch dedup
      existing.push({
        id: "new",
        company_id: deal.companyId,
        deal_type: deal.dealType,
        name: deal.name,
        amount: deal.amount,
        announcement_date: deal.announcementDate,
        advisors: deal.advisors,
      });
    }
  }

  return result;
}
