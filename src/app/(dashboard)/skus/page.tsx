"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSkuList } from "@/lib/dashboard";
import { SKUListTable } from "@/components/skus/SKUListTable";
import type { SkuListItem } from "@/types/api";

type SortBy = "contribution_margin_pct" | "net_revenue" | "return_rate_pct" | "units_sold";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "contribution_margin_pct", label: "CM%" },
  { value: "net_revenue", label: "Revenue" },
  { value: "return_rate_pct", label: "Return Rate" },
  { value: "units_sold", label: "Units Sold" },
];

export default function SKUsPage() {
  const [skus, setSkus] = useState<SkuListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("contribution_margin_pct");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (appendCursor?: string) => {
      const isAppend = !!appendCursor;
      if (isAppend) setIsLoadingMore(true);
      else setIsLoading(true);

      try {
        const data = await fetchSkuList(appendCursor, sortBy, sortDir, 20);
        if (isAppend) {
          setSkus((prev) => [...prev, ...data.skus]);
        } else {
          setSkus(data.skus);
        }
        setCursor(data.next_cursor);
        setHasMore(data.has_more);
        setTotalCount(data.total_skus);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load SKUs");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sortBy, sortDir]
  );

  // Re-fetch from start on sort change
  useEffect(() => {
    setSkus([]);
    setCursor(null);
    setHasMore(false);
    load();
  }, [load]);

  const handleSortBy = (value: SortBy) => {
    if (value === sortBy) return;
    setSortBy(value);
  };

  const handleSortDir = (value: SortDir) => {
    if (value === sortDir) return;
    setSortDir(value);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky Topbar with sort controls ── */}
      <div className="sticky top-0 bg-[#0A0A0A] z-10 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-sm font-medium text-white">SKUs</h1>
            {!isLoading && totalCount > 0 && (
              <p className="text-[10px] text-[#444] mt-0.5">
                {totalCount.toLocaleString("en-IN")} SKUs total
              </p>
            )}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-3">
            {/* Sort by */}
            <div className="flex items-center gap-1 bg-[#111] border border-[#1E1E1E] rounded-lg p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer
                    ${sortBy === opt.value
                      ? "bg-[#1E1E1E] text-white"
                      : "text-[#555] hover:text-[#888]"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Asc / Desc */}
            <div className="flex items-center gap-1 bg-[#111] border border-[#1E1E1E] rounded-lg p-0.5">
              {(["asc", "desc"] as SortDir[]).map((ord) => (
                <button
                  key={ord}
                  onClick={() => handleSortDir(ord)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer
                    ${sortDir === ord
                      ? "bg-[#1E1E1E] text-white"
                      : "text-[#555] hover:text-[#888]"
                    }`}
                >
                  {ord === "asc" ? "↑ Ascending" : "↓ Descending"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6 max-w-[1280px]">
        {error && (
          <div className="mb-4 px-4 py-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
            <p className="text-[11px] text-[#EF4444]">{error}</p>
          </div>
        )}

        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          <SKUListTable
            items={skus}
            onLoadMore={() => cursor && load(cursor)}
            hasMore={hasMore}
            isLoading={isLoading || isLoadingMore}
          />
        </div>
      </div>
    </div>
  );
}
