"use client";

/**
 * src/app/(auth)/register/page.tsx
 *
 * Registration page.
 *
 * Flow (per domain_06 Section 3):
 * 1. Brand fills: company_name, email, password
 * 2. registerBrand() → supabase.auth.signUp() + POST /auth/complete-registration
 * 3. On success: redirect to /dashboard/overview
 *
 * Error handling:
 * - Email already registered → show specific message
 * - Weak password → show Supabase message
 * - Backend failure → show retry message
 * - All errors inline — never alert()
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerBrand, isAuthError } from "@/lib/auth";

function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

function validateCompanyName(name: string): string | null {
  if (!name.trim()) return "Company name is required";
  if (name.trim().length > 100) return "Company name must be 100 characters or less";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track which fields have been blurred for per-field validation
  const [touched, setTouched] = useState({
    companyName: false,
    email: false,
    password: false,
  });

  const companyError = touched.companyName ? validateCompanyName(companyName) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const hasFieldErrors = !!companyError || !!emailError || !!passwordError;
  const isEmpty = !companyName.trim() || !email || !password;
  const submitDisabled = isLoading || isEmpty || hasFieldErrors;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Touch all fields to surface any hidden errors
    setTouched({ companyName: true, email: true, password: true });

    if (validateCompanyName(companyName) || validateEmail(email) || validatePassword(password)) {
      return;
    }

    setIsLoading(true);
    const result = await registerBrand(email, password, companyName.trim());
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
        <p className="text-zinc-400 text-sm font-sans">
          Start understanding your margins
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px] bg-[#141414] border border-[#1F1F1F] rounded-xl p-8">
        <h2 className="text-white text-xl font-semibold mb-6">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Company Name */}
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Company name
            </label>
            <input
              id="company-name"
              type="text"
              autoComplete="organization"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, companyName: true }))}
              placeholder="e.g. Acme Brands"
              disabled={isLoading}
              className={`
                w-full rounded-lg bg-[#0D0D0D] border px-3.5 py-2.5 text-sm text-white
                placeholder:text-zinc-600 outline-none transition-all duration-150
                focus:ring-1 disabled:opacity-50
                ${companyError
                  ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                  : "border-[#2A2A2A] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                }
              `}
            />
            {companyError && (
              <p className="mt-1 text-xs text-red-400">{companyError}</p>
            )}
          </div>

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
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@company.com"
              disabled={isLoading}
              className={`
                w-full rounded-lg bg-[#0D0D0D] border px-3.5 py-2.5 text-sm text-white
                placeholder:text-zinc-600 outline-none transition-all duration-150
                focus:ring-1 disabled:opacity-50
                ${emailError
                  ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                  : "border-[#2A2A2A] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                }
              `}
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-400">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Min. 8 characters"
              disabled={isLoading}
              className={`
                w-full rounded-lg bg-[#0D0D0D] border px-3.5 py-2.5 text-sm text-white
                placeholder:text-zinc-600 outline-none transition-all duration-150
                focus:ring-1 disabled:opacity-50
                ${passwordError
                  ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30"
                  : "border-[#2A2A2A] focus:border-[#22C55E] focus:ring-[#22C55E]/20"
                }
              `}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-400">{passwordError}</p>
            )}
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
            id="register-submit"
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-6 text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#22C55E] hover:text-[#16A34A] transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
