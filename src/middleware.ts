/**
 * src/middleware.ts
 *
 * Next.js middleware — enforces auth session on protected routes.
 *
 * Rules:
 *   - /dashboard, /settings → require authenticated session → redirect to /login
 *   - /login → if already authenticated → redirect to /dashboard
 *   - Public assets and api routes → no-op (let Next.js handle)
 *
 * Session is managed by @supabase/ssr via cookie.
 * Doc: https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/settings", "/channels", "/skus", "/insights"];
const AUTH_ONLY_PATHS = ["/login", "/register"];




export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars missing, skip middleware — don't crash
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Protected routes — redirect to /login if not authed
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Auth-only routes — redirect to /dashboard if already authed
  if (AUTH_ONLY_PATHS.some((path) => pathname.startsWith(path))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
