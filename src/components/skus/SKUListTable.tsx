"use client";

import type { SkuListItem } from "@/types/api";
import { formatINR, formatPct, truncate } from "@/lib/format";
import { AlertCircle } from "lucide-react";

interface SKUListTableProps {
  items: SkuListItem[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

function SkuRow({ item }: { item: SkuListItem }) {
  const cmPct = item.avg_contribution_margin_pct;
  const cmPositive = cmPct !== null && cmPct >= 0;

  return (
    <tr className="border-b border-neutral-100 hover:bg-slate-50 transition-colors">
      <td className="py-4 px-6">
        <div>
          <p className="text-sm font-bold text-slate-800">
            {truncate(item.product_name, 36)}
          </p>
          {item.canonical_sku_code && (
            <p className="text-xs text-slate-400 mt-1 font-mono font-medium">
              {item.canonical_sku_code}
            </p>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
          {item.channel}
        </span>
      </td>
      <td className="py-4 px-6 text-sm font-bold text-slate-600 font-mono">
        {formatINR(item.net_revenue)}
      </td>
      <td className="py-4 px-6 text-sm font-black font-mono">
        <span className={cmPositive ? "text-emerald-600" : "text-red-600"}>
          {formatPct(cmPct)}
        </span>
      </td>
      <td className="py-4 px-6 text-sm font-bold text-slate-500 font-mono">
        {formatPct(item.return_rate_pct)}
      </td>
      <td className="py-4 px-6">
        {item.has_missing_data && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] rounded-md font-bold uppercase tracking-wider border border-amber-100">
            <AlertCircle size={10} /> missing cost
          </span>
        )}
      </td>
    </tr>
  );
}

export function SKUListTable({
  items,
  onLoadMore,
  hasMore,
  isLoading,
}: SKUListTableProps) {
  if (!items.length && !isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 font-semibold text-sm bg-white rounded-2xl border border-neutral-200/60 shadow-sm">
        No SKUs found
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-slate-50">
              {["Product", "Channel", "Revenue", "CM%", "Return Rate", "Flags"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-[11px] text-slate-500 uppercase tracking-widest font-extrabold text-left py-4 px-6"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((item) => (
              <SkuRow key={item.platform_sku_id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {hasMore && (
        <div className="p-6 border-t border-neutral-100 text-center bg-slate-50/50">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-sm px-6 py-2 bg-white border border-neutral-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer font-bold shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load more SKUs"}
          </button>
        </div>
      )}
    </div>
  );
}