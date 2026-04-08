"use client";

import type { SkuListItem } from "@/types/api";
import { formatINR, formatPct, truncate } from "@/lib/format";

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
    <tr className="border-b border-[#161616] hover:bg-[#131313] transition-colors">
      <td className="py-3 px-3">
        <div>
          <p className="text-[12px] text-[#CCC]">
            {truncate(item.product_name, 36)}
          </p>
          {item.canonical_sku_code && (
            <p className="text-[10px] text-[#444] mt-0.5 font-mono">
              {item.canonical_sku_code}
            </p>
          )}
        </div>
      </td>
      <td className="py-3 px-3">
        <span className="text-[10px] text-[#555] uppercase tracking-wide">
          {item.channel}
        </span>
      </td>
      <td className="py-3 px-3 text-[12px] text-[#888] font-mono tabular-nums">
        {formatINR(item.total_net_revenue)}
      </td>
      <td className="py-3 px-3 font-mono tabular-nums">
        <span
          className={`text-[12px] font-semibold ${
            cmPositive ? "text-[#22C55E]" : "text-[#EF4444]"
          }`}
        >
          {formatPct(cmPct)}
        </span>
      </td>
      <td className="py-3 px-3 text-[12px] text-[#888] font-mono tabular-nums">
        {formatPct(item.return_rate_pct)}
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.is_anomaly && (
            <span className="inline-block px-1.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444] text-[9px] rounded font-medium uppercase tracking-wide border border-[#EF4444]/20">
              anomaly
            </span>
          )}
          {item.has_missing_data && (
            <span className="inline-block px-1.5 py-0.5 bg-[#EAB308]/10 text-[#EAB308] text-[9px] rounded font-medium uppercase tracking-wide border border-[#EAB308]/20">
              data missing
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-[#161616]">
      {[36, 16, 20, 16, 20, 20].map((w, i) => (
        <td key={i} className="py-3 px-3">
          <div
            className="h-3 bg-[#1A1A1A] rounded animate-pulse"
            style={{ width: `${w * 3}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

const COLUMNS = [
  "Product",
  "Channel",
  "Revenue",
  "CM%",
  "Return Rate",
  "Flags",
];

export function SKUListTable({
  items,
  onLoadMore,
  hasMore,
  isLoading,
}: SKUListTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1A1A1A]">
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="text-[10px] text-[#444] uppercase tracking-widest font-medium text-left py-2.5 px-3"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && !items.length
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : items.map((item) => (
                <SkuRow key={item.platform_sku_id} item={item} />
              ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="py-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-[12px] px-5 py-2 rounded-lg border border-[#222] text-[#666] hover:text-[#999] hover:border-[#333] transition-all disabled:opacity-40 cursor-pointer"
          >
            {isLoading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {!isLoading && !items.length && (
        <div className="py-12 text-center text-[#333] text-xs">
          No SKUs found
        </div>
      )}
    </div>
  );
}
