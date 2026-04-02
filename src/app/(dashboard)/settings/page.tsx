/**
 * src/app/(dashboard)/settings/page.tsx  [STUB]
 *
 * Settings page — channel connections, credentials, manual cost inputs.
 * Route: /settings
 * Auth: Protected — middleware redirects to /login if unauthenticated.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — GrowthX AI",
  description: "Manage channel connections and cost inputs.",
};

export default function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      {/* TODO (Session 02+): Channel connect/disconnect cards, manual cost form */}
      <p>Settings stub — implement in Session 02</p>
    </main>
  );
}
