/**
 * src/app/layout.tsx — Root layout
 *
 * Wraps all pages. Sets font, standard metadata, and the middleware-driven
 * auth check (see src/middleware.ts).
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowthX AI",
  description: "Contribution margin intelligence for D2C brands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
