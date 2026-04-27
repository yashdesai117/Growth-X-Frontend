/**
 * src/lib/env.ts
 *
 * Typed wrapper for all frontend environment variables.
 *
 * IMPORTANT: Next.js replaces NEXT_PUBLIC_* variables at BUILD TIME via static
 * string substitution. Dynamic bracket access (process.env[key]) is NOT analyzed
 * by the Next.js compiler and returns undefined in the browser. Each variable
 * MUST be read with its literal name using static dot notation.
 *
 * Rules (Domain 2):
 *   - All components must import from here — never use process.env.VARIABLE inline
 *   - Variables throw at access time if missing (not at module load — avoids SSR init crash)
 *   - Service role key is NEVER here — backend only
 */

function assertDefined(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Add it to .env.local (see .env.local.example).`
    );
  }
  return value;
}

export const env = {
  /** Supabase project URL — used for Supabase client initialisation */
  get supabaseUrl() {
    // Static access required — Next.js cannot inline dynamic process.env[key]
    return assertDefined(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  },

  /** Supabase anon/public key — safe to expose in browser */
  get supabaseAnonKey() {
    return assertDefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  },

  /** FastAPI backend base URL e.g. http://localhost:8000 */
  get apiBaseUrl() {
    return assertDefined(process.env.NEXT_PUBLIC_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL");
  },
} as const;

