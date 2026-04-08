/**
 * src/lib/api/client.ts
 *
 * Typed async fetch wrapper for all FastAPI backend calls.
 *
 * Rules (Domain 2):
 *   - Prepends NEXT_PUBLIC_API_BASE_URL to every path
 *   - Includes Authorization: Bearer <token> from the current Supabase session
 *   - Returns ResponseEnvelope<T> — never raw JSON
 *   - Never imports a service role key
 */

import { createClient } from "@/lib/supabase/client";
import type { ResponseEnvelope } from "@/types/api";
import { env } from "@/lib/env";

/**
 * Make a typed HTTP request to the FastAPI backend.
 *
 * @param path   API path (e.g. '/api/v1/sync/trigger') — must start with '/'
 * @param init   Standard RequestInit options (method, body, headers, etc.)
 * @returns      Parsed ResponseEnvelope<T>
 * @throws       Error if the network request itself fails (not for API-level errors)
 *
 * Usage:
 *   const envelope = await apiClient<{ job_id: string }>('/api/v1/sync/trigger', {
 *     method: 'POST',
 *     body: JSON.stringify({ channel: 'amazon' }),
 *   });
 *   if (envelope.status === 'success') { ... }
 */
export async function apiClient<T>(
  path: string,
  init: RequestInit = {}
): Promise<ResponseEnvelope<T>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Build headers — explicit headers from caller take priority over session token.
  // This is important for fresh signUp flows where we pass the token directly
  // before it propagates to getSession().
  const callerHeaders = (init.headers as Record<string, string>) ?? {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add session token only if caller didn't already provide Authorization
  if (session?.access_token && !callerHeaders["Authorization"]) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  // Caller headers always win (including Authorization if explicitly passed)
  Object.assign(headers, callerHeaders);

  const url = `${env.apiBaseUrl}${path}`;

  // 10-second timeout — prevents hanging if the backend is down
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const envelope = (await response.json()) as ResponseEnvelope<T>;
    return envelope;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out — backend may be offline");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
