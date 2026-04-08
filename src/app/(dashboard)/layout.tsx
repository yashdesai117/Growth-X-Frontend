/**
 * src/app/(dashboard)/layout.tsx
 *
 * Dashboard layout shell.
 * Session 07 scope: auth check only. Full sidebar built in Session 08.
 * If no session: middleware handles redirect — layout assumes authed.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {children}
    </div>
  );
}
