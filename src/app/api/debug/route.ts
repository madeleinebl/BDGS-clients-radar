/**
 * GET /api/debug
 * Diagnostic endpoint — shows env var status and tests Supabase connection.
 * DELETE THIS FILE once the issue is resolved.
 */

import { NextResponse } from "next/server";

export async function GET() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `set (${url.slice(0, 30)}...)` : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `set (${anonKey.slice(0, 10)}...)` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey ? `set (${serviceKey.slice(0, 10)}...)` : "MISSING",
    NODE_ENV: process.env.NODE_ENV ?? "unknown",
  };

  // Try connecting with service key
  let dbTest: unknown = "skipped";
  if (url && serviceKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { data, error, count } = await db
        .from("companies")
        .select("name", { count: "exact" })
        .limit(5);

      if (error) {
        dbTest = { error: error.message, code: error.code };
      } else {
        dbTest = {
          success: true,
          totalCompanies: count,
          first5: (data ?? []).map((r: { name: string }) => r.name),
        };
      }
    } catch (e) {
      dbTest = { error: String(e) };
    }
  }

  // Try connecting with anon key
  let anonTest: unknown = "skipped";
  if (url && anonKey) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(url, anonKey);
      const { data, error, count } = await db
        .from("companies")
        .select("name", { count: "exact" })
        .limit(3);

      if (error) {
        anonTest = { error: error.message, code: error.code };
      } else {
        anonTest = {
          success: true,
          totalCompanies: count,
          first3: (data ?? []).map((r: { name: string }) => r.name),
        };
      }
    } catch (e) {
      anonTest = { error: String(e) };
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    envStatus,
    serviceKeyTest: dbTest,
    anonKeyTest: anonTest,
  }, { status: 200 });
}
