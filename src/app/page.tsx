/**
 * src/app/page.tsx — Root route
 *
 * Redirects to /login. Middleware (src/middleware.ts) intercepts:
 * - Authenticated users → /dashboard/overview
 * - Unauthenticated users → /login (stays at /login)
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/login");
}
