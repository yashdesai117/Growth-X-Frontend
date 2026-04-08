"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutBrand } from "@/lib/auth";

const navItems = [
  { label: "Overview", href: "/overview", icon: "overview" },
  { label: "Channels", href: "/channels", icon: "channels" },
  { label: "SKUs", href: "/skus", icon: "skus" },
  { label: "Insights", href: "/insights", icon: "insights" },
];

function NavIcon({ name }: { name: string }) {
  if (name === "overview") {
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="0" width="7" height="7" rx="1.5" />
        <rect x="9" y="0" width="7" height="7" rx="1.5" />
        <rect x="0" y="9" width="7" height="7" rx="1.5" />
        <rect x="9" y="9" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (name === "channels") {
    return (
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="3" cy="8" r="2" />
        <circle cx="13" cy="3" r="2" />
        <circle cx="13" cy="13" r="2" />
        <line x1="5" y1="7" x2="11" y2="4" />
        <line x1="5" y1="9" x2="11" y2="12" />
      </svg>
    );
  }
  if (name === "skus") {
    return (
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="1" y="2" width="14" height="3" rx="1" />
        <rect x="1" y="7" width="9" height="3" rx="1" />
        <rect x="1" y="12" width="11" height="2" rx="1" />
      </svg>
    );
  }
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="6" r="3" />
      <path d="M8 9v4M5 13h6" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutBrand();
    router.push("/login");
  };

  return (
    <aside className="w-[200px] bg-[#0C0C0C] border-r border-[#1A1A1A] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1A1A1A]">
        <span className="text-[#22C55E] font-semibold text-sm tracking-tight">
          GrowthX AI
        </span>
        <p className="text-[#3A3A3A] text-[10px] mt-0.5 font-medium">
          D2C Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/overview" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-all
                border-l-2
                ${
                  isActive
                    ? "text-[#F0F0F0] bg-[#171717] border-[#22C55E]"
                    : "text-[#555] hover:text-[#888] hover:bg-[#141414] border-transparent"
                }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-[#1A1A1A]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/25 flex items-center justify-center text-[9px] text-[#22C55E] font-bold">
            GX
          </div>
          <span className="text-[#444] text-[11px]">Your Brand</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#3A3A3A] text-[11px] hover:text-[#666] transition-colors w-full text-left cursor-pointer"
        >
          Log out →
        </button>
      </div>
    </aside>
  );
}
