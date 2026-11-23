import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createAuthServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard after auth
  return NextResponse.redirect(`${origin}/`);
}
