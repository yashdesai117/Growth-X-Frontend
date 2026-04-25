"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutBrand } from "@/lib/auth";
import { LayoutDashboard, Link2, Package, Sparkles, LogOut, TrendingUp } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Channels", href: "/channels", icon: Link2 },
  { label: "SKUs", href: "/skus", icon: Package },
  { label: "Insights", href: "/insights", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutBrand();
    router.push("/login");
  };

  return (
    <aside className="w-[240px] bg-white border-r border-neutral-200/60 flex flex-col h-screen sticky top-0 shrink-0 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-neutral-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center shadow-sm">
          <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
        <div>
          <span className="text-slate-900 font-extrabold text-lg tracking-tight leading-none">
            GrowthX
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/overview" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all
                ${
                  isActive
                    ? "text-emerald-700 bg-emerald-50 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-emerald-600" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-neutral-100 bg-slate-50/50 m-3 rounded-xl border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs text-slate-600 font-bold shadow-inner">
            GX
          </div>
          <span className="text-slate-700 text-sm font-bold">Your Brand</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 text-xs font-semibold hover:text-slate-900 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  );
}