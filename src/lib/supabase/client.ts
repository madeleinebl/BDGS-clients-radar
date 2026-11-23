import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ─── Environment ───────────────────────────────────────────────────────────────
// These are read at build-time (NEXT_PUBLIC_ prefix) so the browser client
// can reach Supabase directly.  The anon key is safe to expose — RLS policies
// control what it can touch.  The service-role key stays server-side only.

// Read env vars dynamically so they are never captured at build time.
function getUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}
function getAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}

// ─── Helper: is Supabase configured? ──────────────────────────────────────────
export function isSupabaseConfigured(): boolean {
  const url = getUrl();
  const key = getAnonKey();
  const configured = Boolean(url && key);
  if (!configured) {
    console.warn("[BDGS] Supabase NOT configured — using sample data. URL:", url ? "set" : "MISSING", "Key:", key ? "set" : "MISSING");
  }
  return configured;
}

// ─── Lazy singleton (avoids crash when env vars are missing at build) ──────────
let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_client) {
    const url = getUrl();
    const key = getAnonKey();
    if (!url || !key) {
      throw new Error(
        "[BDGS] Cannot create Supabase client — env vars missing.",
      );
    }
    _client = createClient<Database>(url, key);
  }
  return _client;
}

/**
 * @deprecated Use getSupabase() instead — kept for existing imports.
 * Returns a dummy-safe reference that will throw at call time if not configured.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient<Database>];
  },
});
