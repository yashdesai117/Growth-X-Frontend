"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerBrand, isAuthError } from "@/lib/auth";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Image from "next/image";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col items-center justify-center w-full max-w-[440px] relative z-10 mx-auto mt-12 md:mt-0">
      <Link href="/" className="fixed top-8 left-6 md:top-10 md:left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-semibold transition-colors z-50">
        <ArrowLeft size={16} /> Back to home
      </Link>

      {/* Logo */}
      <div className="mb-8 text-center flex flex-col items-center">
        <Image
          src="/growthx-full-logo.png"
          alt="GrowthX"
          width={98}
          height={28}
          className="mb-6 object-contain"
          priority
        />
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
          Get Started
        </h1>
        <p className="text-slate-500 font-medium">Create your GrowthX account</p>
      </div>

      {/* Card */}
      <SpotlightCard className="w-full p-8 md:p-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 relative z-10">
          {/* Company Name */}
          <div>
            <label htmlFor="company-name" className="block text-sm font-bold text-slate-700 mb-1.5">
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
                w-full rounded-xl bg-white border px-4 py-3 text-sm text-slate-900
                placeholder:text-slate-400 outline-none transition-all duration-200
                shadow-sm disabled:opacity-50
                ${companyError
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-neutral-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                }
              `}
            />
            {companyError && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{companyError}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
              Email address
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
                w-full rounded-xl bg-white border px-4 py-3 text-sm text-slate-900
                placeholder:text-slate-400 outline-none transition-all duration-200
                shadow-sm disabled:opacity-50
                ${emailError
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-neutral-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                }
              `}
            />
            {emailError && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Min. 8 characters"
                disabled={isLoading}
                className={`
                  w-full rounded-xl bg-white border px-4 py-3 pr-10 text-sm text-slate-900
                  placeholder:text-slate-400 outline-none transition-all duration-200
                  shadow-sm disabled:opacity-50
                  ${passwordError
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-neutral-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  }
                `}
              />
              <button
                type="button"
                id="toggle-password-visibility"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordError}</p>
            )}
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
            id="register-submit"
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
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </SpotlightCard>

      {/* Footer link */}
      <p className="mt-8 text-sm font-medium text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors duration-150">
          Sign in
        </Link>
      </p>
    </div>
  );
}