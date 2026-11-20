import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ─── Server-only client (service role key — bypasses RLS) ─────────────────────
// Use this ONLY in API routes and Server Components where you need full access.
// Never import this file from a Client Component.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "[BDGS] Server Supabase client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
