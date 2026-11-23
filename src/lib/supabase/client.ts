import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ─── Environment ───────────────────────────────────────────────────────────────
// These are read at build-time (NEXT_PUBLIC_ prefix) so the browser client
// can reach Supabase directly.  The anon key is safe to expose — RLS policies
// control what it can touch.  The service-role key stays server-side only.

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

// ─── Helper: is Supabase configured? ──────────────────────────────────────────
export function isSupabaseConfigured(): boolean {
  const configured = Boolean(supabaseUrl && supabaseAnonKey);
  if (!configured) {
    console.warn("[BDGS] Supabase NOT configured — using sample data. URL:", supabaseUrl ? "set" : "MISSING", "Key:", supabaseAnonKey ? "set" : "MISSING");
  }
  return configured;
}

// ─── Lazy singleton (avoids crash when env vars are missing at build) ──────────
let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_client) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "[BDGS] Cannot create Supabase client — env vars missing.",
      );
    }
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
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
