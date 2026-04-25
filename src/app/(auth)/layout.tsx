/**
 * src/app/(auth)/layout.tsx
 *
 * Layout for auth pages (login + register).
 * Loads Google Fonts via Next.js font optimization.
 * No sidebar - auth pages are standalone.
 */

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { InfiniteGridBackground } from "@/components/ui/infinite-grid";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrowthX AI | Auth",
  description: "Sign in to GrowthX AI",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${font.className} bg-[#fafafa] min-h-screen text-slate-900 selection:bg-emerald-100 flex flex-col`}
    >
      <InfiniteGridBackground className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </InfiniteGridBackground>
    </div>
  );
}
