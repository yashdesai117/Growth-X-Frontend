/**
 * src/app/(auth)/layout.tsx
 *
 * Layout for auth pages (login + register).
 * Loads Google Fonts via Next.js font optimization.
 * No sidebar — auth pages are standalone.
 */

import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrowthX AI",
  description: "Contribution margin intelligence for D2C brands.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${dmSerifDisplay.variable} bg-[#0A0A0A] min-h-screen font-sans`}
    >
      {children}
    </div>
  );
}
