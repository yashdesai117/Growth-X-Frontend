"use client";
/**
 * src/lib/supabase/client.ts
 *
 * Browser-side Supabase client (for use in Client Components).
 *
 * Uses the anon key only — never the service role key.
 * All data fetching goes through the FastAPI backend, not this client directly.
 * This client is only used for Auth flows (sign in, sign up, sign out, get session).
 */

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
