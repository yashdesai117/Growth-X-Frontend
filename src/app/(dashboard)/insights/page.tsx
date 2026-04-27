"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchInsights, dismissInsight } from "@/lib/dashboard";
import { InsightCard } from "@/components/insights/InsightCard";
import type { InsightsList, InsightItem } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";

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
      const data = await fetchInsights();
      setInsights(data);
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
    <div className="flex flex-col min-h-screen pb-12">
      {/* Sticky Topbar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-neutral-200/60 shadow-sm">
        <div className="flex items-center justify-between px-8 py-5">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            AI Insights <Sparkles size={18} className="text-emerald-500" />
          </h1>

          {/* Severity count badges */}
          {!isLoading && insights && (
            <div className="flex items-center gap-3">
              {counts.high > 0 && (
                <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-md border border-red-200 font-bold shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  {counts.high} High
                </span>
              )}
              {counts.medium > 0 && (
                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md border border-amber-200 font-bold shadow-sm">
                  {counts.medium} Medium
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-8 pt-2 pb-0">
          {TABS.map((tab) => {
            const count = counts[tab.value];
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all relative cursor-pointer border-b-2 
                  ${isActive
                    ? "text-emerald-600 border-emerald-500"
                    : "text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200"
                  }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold
                      ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-[1000px] mx-auto w-full space-y-4">
        {error && (
          <div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200/60 rounded-xl shadow-sm">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200/60 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16 bg-neutral-100 rounded-md" />
                  <Skeleton className="h-6 w-24 bg-neutral-100 rounded-md" />
                </div>
                <Skeleton className="h-5 w-3/4 bg-neutral-100 rounded" />
                <Skeleton className="h-4 w-full bg-neutral-50 rounded" />
                <Skeleton className="h-4 w-5/6 bg-neutral-50 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && visibleItems.length === 0 && (
          <div className="py-24 flex flex-col items-center gap-4 text-center bg-white border border-neutral-200/60 rounded-3xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-neutral-100 flex items-center justify-center text-emerald-500">
              {activeTab === "dismissed" ? <CheckCircle2 size={32} className="text-slate-300" /> : <Sparkles size={32} />}
            </div>
            <div>
              <p className="text-slate-900 text-xl font-bold tracking-tight mb-2">
                {activeTab === "dismissed"
                  ? "No dismissed insights"
                  : activeTab === "all"
                  ? "You're all caught up!"
                  : `No ${activeTab} severity insights`}
              </p>
              <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                {activeTab === "all" || activeTab === "dismissed"
                  ? "Insights are generated automatically after each data sync. Check back soon for new recommendations."
                  : "Change the filter or wait for the next computation run."}
              </p>
            </div>
          </div>
        )}

        {/* Insight cards */}
        {!isLoading && visibleItems.length > 0 && (
          <>
            {activeTab === "dismissed" && (
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pb-2 px-2">
                Dismissed — {dismissed.length} item{dismissed.length !== 1 ? "s" : ""}
              </p>
            )}
            <div className="space-y-5">
              {visibleItems.map((insight) => (
                <InsightCard
                  key={insight.insight_id}
                  insight={insight}
                  onDismiss={activeTab === "dismissed" ? () => {} : handleDismiss}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}