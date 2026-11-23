import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

// Browser client for auth — uses cookies for session management
export function createAuthClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
