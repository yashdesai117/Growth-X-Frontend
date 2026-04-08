"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchInsights, dismissInsight } from "@/lib/dashboard";
import { InsightCard } from "@/components/insights/InsightCard";
import type { InsightsList, InsightItem } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

type TabValue = "all" | "high" | "medium" | "low" | "dismissed";

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "dismissed", label: "Dismissed" },
];

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsList | null>(null);
  const [dismissed, setDismissed] = useState<InsightItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [active, disc] = await Promise.all([
        fetchInsights(false),
        fetchInsights(true),
      ]);
      setInsights(active);
      // dismissed items are those in disc but not in active
      const activeIds = new Set(active.items.map((i) => i.insight_id));
      setDismissed(disc.items.filter((i) => !activeIds.has(i.insight_id)));
    } catch {
      setError("Failed to load insights");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic dismiss
  const handleDismiss = async (id: string) => {
    if (!insights) return;
    const dismissedItem = insights.items.find((i) => i.insight_id === id);
    // Remove from active list immediately
    setInsights((prev) => {
      if (!prev) return prev;
      const updated = prev.items.filter((i) => i.insight_id !== id);
      const removedSeverity = dismissedItem?.severity;
      return {
        ...prev,
        items: updated,
        total_count: prev.total_count - 1,
        high_count: removedSeverity === "high" ? prev.high_count - 1 : prev.high_count,
        medium_count: removedSeverity === "medium" ? prev.medium_count - 1 : prev.medium_count,
        low_count: removedSeverity === "low" ? prev.low_count - 1 : prev.low_count,
      };
    });
    if (dismissedItem) {
      setDismissed((prev) => [...prev, { ...dismissedItem, is_dismissed: true }]);
    }
    try {
      await dismissInsight(id);
    } catch {
      // Rollback on failure
      load();
    }
  };

  // Client-side filter
  const visibleItems: InsightItem[] = (() => {
    if (activeTab === "dismissed") return dismissed;
    if (!insights) return [];
    const filtered =
      activeTab === "all"
        ? insights.items
        : insights.items.filter((i) => i.severity === activeTab);
    return [...filtered].sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );
  })();

  const counts = {
    high: insights?.high_count ?? 0,
    medium: insights?.medium_count ?? 0,
    low: insights?.low_count ?? 0,
    all: insights?.total_count ?? 0,
    dismissed: dismissed.length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky Topbar ── */}
      <div className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-sm font-medium text-white">Insights</h1>

          {/* Severity count badges */}
          {!isLoading && insights && (
            <div className="flex items-center gap-2">
              {counts.high > 0 && (
                <span className="text-[10px] px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] rounded border border-[#EF4444]/20 font-medium tabular-nums">
                  {counts.high} high
                </span>
              )}
              {counts.medium > 0 && (
                <span className="text-[10px] px-2 py-1 bg-[#EAB308]/10 text-[#EAB308] rounded border border-[#EAB308]/20 font-medium tabular-nums">
                  {counts.medium} medium
                </span>
              )}
              {counts.low > 0 && (
                <span className="text-[10px] px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded border border-[#22C55E]/20 font-medium tabular-nums">
                  {counts.low} low
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-0 px-6 border-t border-[#111]">
          {TABS.map((tab) => {
            const count = counts[tab.value];
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-medium transition-colors relative cursor-pointer
                  ${isActive
                    ? "text-white border-b-2 border-[#22C55E] -mb-px"
                    : "text-[#444] hover:text-[#777] border-b-2 border-transparent -mb-px"
                  }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold tabular-nums
                      ${isActive ? "bg-[#22C55E]/15 text-[#22C55E]" : "bg-[#1A1A1A] text-[#444]"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 max-w-[800px] space-y-3">
        {error && (
          <div className="px-4 py-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
            <p className="text-[11px] text-[#EF4444]">{error}</p>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12 bg-[#1A1A1A] rounded" />
                  <Skeleton className="h-4 w-20 bg-[#1A1A1A] rounded" />
                </div>
                <Skeleton className="h-4 w-3/4 bg-[#1A1A1A] rounded" />
                <Skeleton className="h-3 w-full bg-[#1A1A1A] rounded" />
                <Skeleton className="h-3 w-5/6 bg-[#1A1A1A] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && visibleItems.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-[#111] border border-[#1E1E1E] flex items-center justify-center text-[#333] text-lg">
              {activeTab === "dismissed" ? "✓" : "·"}
            </div>
            <div>
              <p className="text-[#555] text-sm font-medium">
                {activeTab === "dismissed"
                  ? "No dismissed insights"
                  : activeTab === "all"
                  ? "No insights yet"
                  : `No ${activeTab} severity insights`}
              </p>
              <p className="text-[#333] text-xs mt-1 leading-relaxed max-w-[260px]">
                {activeTab === "all" || activeTab === "dismissed"
                  ? "Insights are generated automatically after each sync. Check back soon."
                  : "Change the filter or wait for the next computation run."}
              </p>
            </div>
          </div>
        )}

        {/* Insight cards */}
        {!isLoading && visibleItems.length > 0 && (
          <>
            {activeTab === "dismissed" && (
              <p className="text-[10px] text-[#333] uppercase tracking-widest pb-1">
                Dismissed — {dismissed.length} item{dismissed.length !== 1 ? "s" : ""}
              </p>
            )}
            {visibleItems.map((insight) => (
              <InsightCard
                key={insight.insight_id}
                insight={insight}
                onDismiss={activeTab === "dismissed" ? () => {} : handleDismiss}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
