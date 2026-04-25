"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSkuList } from "@/lib/dashboard";
import { SKUListTable } from "@/components/skus/SKUListTable";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { SkuList, SkuListItem } from "@/types/api";

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
      if (appendCursor) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const data: SkuList = await fetchSkuList({
          limit: 20,
          cursor: appendCursor,
          sort_by: sortBy,
          sort_dir: sortDir,
        });

        if (appendCursor) {
          setSkus((prev) => [...prev, ...data.items]);
        } else {
          setSkus(data.items);
        }
        setCursor(data.next_cursor);
        setHasMore(data.has_more);
        setTotalCount(data.total_count);
      } catch {
        setError("Failed to load SKUs");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sortBy, sortDir]
  );

  // Initial load or sort change
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col min-h-screen pb-12">
      {/* Topbar */}
      <div className="px-8 py-6 border-b border-neutral-200/60 sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">SKU Performance</h1>
          {!isLoading && totalCount > 0 && (
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {totalCount} SKUs
            </span>
          )}
        </div>

        {/* Filters / Sorts */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-neutral-200/60">
            {SORT_OPTIONS.map((opt) => {
              const isActive = sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer
                    ${
                      isActive
                        ? "bg-white text-slate-900 shadow-sm border border-neutral-200/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-neutral-200/60">
            {(["asc", "desc"] as SortDir[]).map((ord) => (
              <button
                key={ord}
                onClick={() => setSortDir(ord)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer
                  ${
                    sortDir === ord
                      ? "bg-white text-slate-900 shadow-sm border border-neutral-200/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
              >
                {ord === "asc" ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                {ord === "asc" ? "Ascending" : "Descending"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-[1280px] mx-auto w-full">
        {error && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200/60 rounded-xl shadow-sm text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <SKUListTable
          items={skus}
          onLoadMore={() => cursor && load(cursor)}
          hasMore={hasMore}
          isLoading={isLoading || isLoadingMore}
        />
      </div>
    </div>
  );
}