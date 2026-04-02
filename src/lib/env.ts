/**
 * src/lib/env.ts
 *
 * Typed wrapper for all frontend environment variables.
 *
 * Rules (Domain 2):
 *   - All components must import from here — never use process.env.VARIABLE inline
 *   - Variables throw at module load time if missing (fail fast)
 *   - Service role key is NEVER here — backend only
 */

function requireEnv(key: string): string {
  const value = process.env[key];
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
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),

  /** Supabase anon/public key — safe to expose in browser */
  supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

  /** FastAPI backend base URL e.g. http://localhost:8000 */
  apiBaseUrl: requireEnv("NEXT_PUBLIC_API_BASE_URL"),
} as const;
