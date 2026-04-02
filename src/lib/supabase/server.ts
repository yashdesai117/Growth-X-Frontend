/**
 * src/lib/supabase/server.ts
 *
 * Server-side Supabase client (for use in Server Components, Route Handlers).
 *
 * Reads cookies via Next.js cookies() API for SSR session handling.
 * Uses the anon key only — never the service role key.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
