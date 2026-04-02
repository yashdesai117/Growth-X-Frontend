/**
 * src/app/page.tsx — Root route
 *
 * Redirects unauthenticated users to /login.
 * Authenticated users are redirected to /dashboard.
 *
 * Middleware (src/middleware.ts) handles session-based routing.
 * This page acts as a fallback redirect only.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
