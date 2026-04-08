"use client";

/**
 * src/app/(auth)/login/page.tsx
 *
 * Login page.
 *
 * Flow (per domain_06 Section 4):
 * 1. Brand enters email + password
 * 2. loginBrand() → supabase.auth.signInWithPassword()
 * 3. Session stored in httpOnly cookie automatically by Supabase SSR
 * 4. On success: redirect to /dashboard/overview
 *
 * Error handling:
 * - Wrong credentials → "Incorrect email or password"
 * - Network error → "Something went wrong — please try again"
 * - All errors inline, never alert()
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginBrand, isAuthError } from "@/lib/auth";

// Eye icon SVGs — no icon library needed
function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitDisabled = isLoading || !email || !password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) return;

    setIsLoading(true);
    const result = await loginBrand(email, password);
    setIsLoading(false);

    if (isAuthError(result)) {
      setError(result.message);
      return;
    }

    router.push("/overview");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <h1
          className="text-3xl text-[#22C55E] tracking-tight mb-2"
          style={{ fontFamily: "var(--font-dm-serif)" }}
        >
          GrowthX AI
        </h1>
        <p className="text-zinc-400 text-sm font-sans">Welcome back</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-[#141414] border border-[#1F1F1F] rounded-xl p-8">
        <h2 className="text-white text-xl font-semibold mb-6">
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={isLoading}
              className="
                w-full rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] px-3.5 py-2.5
                text-sm text-white placeholder:text-zinc-600 outline-none
                transition-all duration-150 focus:border-[#22C55E] focus:ring-1
                focus:ring-[#22C55E]/20 disabled:opacity-50
              "
            />
          </div>

          {/* Password with show/hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <a
                href="#"
                id="forgot-password-link"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
                tabIndex={-1}
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={isLoading}
                className="
                  w-full rounded-lg bg-[#0D0D0D] border border-[#2A2A2A] px-3.5 py-2.5 pr-10
                  text-sm text-white placeholder:text-zinc-600 outline-none
                  transition-all duration-150 focus:border-[#22C55E] focus:ring-1
                  focus:ring-[#22C55E]/20 disabled:opacity-50
                "
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword((v) => !v)}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-zinc-500 hover:text-zinc-300 transition-colors duration-150
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submission error */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-2.5">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={submitDisabled}
            className={`
              w-full rounded-lg py-2.5 text-sm font-semibold text-black
              transition-all duration-150 mt-2
              ${submitDisabled
                ? "bg-[#22C55E]/40 cursor-not-allowed"
                : "bg-[#22C55E] hover:bg-[#16A34A] active:scale-[0.98]"
              }
            `}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-6 text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#22C55E] hover:text-[#16A34A] transition-colors duration-150"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
