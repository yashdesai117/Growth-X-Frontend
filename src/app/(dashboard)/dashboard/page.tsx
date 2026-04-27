/**
 * src/app/(dashboard)/dashboard/page.tsx  [STUB]
 *
 * Main dashboard — shows margin summary across all connected channels.
 * Route: /dashboard
 * Auth: Protected — middleware redirects to /login if unauthenticated.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — GrowthX AI",
  description: "Contribution margin overview across all connected channels.",
};

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      {/* TODO (Session 02+): Render margin summary cards, channel breakdown chart */}
      <p>Dashboard stub — implement in Session 02</p>
    </main>
  );
}
