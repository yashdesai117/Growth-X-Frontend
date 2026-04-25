"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginBrand, isAuthError } from "@/lib/auth";
import { Eye, EyeOff, Sparkles, ArrowLeft } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

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
    <div className="flex flex-col items-center justify-center w-full max-w-[440px] relative z-10 mx-auto mt-12 md:mt-0">
      <Link href="/" className="fixed top-8 left-6 md:top-10 md:left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-semibold transition-colors z-50">
        <ArrowLeft size={16} /> Back to home
      </Link>

      {/* Wordmark */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
          <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-500 font-medium">Log in to your GrowthX account</p>
      </div>

      {/* Card */}
      <SpotlightCard className="w-full p-8 md:p-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-700 mb-1.5"
            >
              Email address
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
                w-full rounded-xl bg-white border border-neutral-200 px-4 py-3
                text-sm text-slate-900 placeholder:text-slate-400 outline-none
                transition-all duration-200 focus:border-emerald-500 focus:ring-4
                focus:ring-emerald-500/10 shadow-sm disabled:opacity-50
              "
            />
          </div>

          {/* Password with show/hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700"
              >
                Password
              </label>
              <a
                href="#"
                id="forgot-password-link"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-150"
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
                placeholder="••••••••"
                disabled={isLoading}
                className="
                  w-full rounded-xl bg-white border border-neutral-200 px-4 py-3 pr-10
                  text-sm text-slate-900 placeholder:text-slate-400 outline-none
                  transition-all duration-200 focus:border-emerald-500 focus:ring-4
                  focus:ring-emerald-500/10 shadow-sm disabled:opacity-50
                "
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword((v) => !v)}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2
                  text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1
                "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submission error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            disabled={submitDisabled}
            className={`
              w-full rounded-xl py-3.5 text-sm font-bold text-white
              transition-all duration-200 mt-4 shadow-md
              ${submitDisabled
                ? "bg-emerald-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 hover:bg-slate-800 active:scale-[0.98] shadow-slate-900/10"
              }
            `}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </SpotlightCard>

      {/* Footer link */}
      <p className="mt-8 text-sm font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors duration-150"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}