"use client";

import type { SkuSummary } from "@/types/api";
import { formatINR, formatPct, truncate } from "@/lib/format";
import { AlertCircle } from "lucide-react";

interface SKUTableProps {
  topSkus: SkuSummary[];
  bottomSkus: SkuSummary[];
}

function SkuRow({ sku }: { sku: SkuSummary }) {
  const cmPct = sku.avg_contribution_margin_pct;
  const cmPositive = cmPct !== null && cmPct >= 0;

  return (
    <tr className="border-b border-neutral-100 hover:bg-slate-50/80 transition-colors">
      <td className="py-3 px-6 text-sm font-semibold text-slate-800">
        {truncate(sku.product_name, 40)}
      </td>
      <td className="py-3 px-6">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
          {sku.channel}
        </span>
      </td>
      <td className="py-3 px-6 text-sm font-bold text-slate-600 font-mono">
        {formatINR(sku.total_net_revenue)}
      </td>
      <td className="py-3 px-6 text-sm font-black font-mono">
        <span className={cmPositive ? "text-emerald-600" : "text-red-600"}>
          {formatPct(cmPct)}
        </span>
      </td>
      <td className="py-3 px-6 text-sm font-bold text-slate-500 font-mono">
        {formatPct(sku.return_rate_pct)}
      </td>
      <td className="py-3 px-6">
        {sku.has_missing_data && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] rounded-md font-bold uppercase tracking-wider border border-amber-100">
            <AlertCircle size={10} /> missing cost
          </span>
        )}
      </td>
    </tr>
  );
}

function SKUSection({
  title,
  skus,
}: {
  title: string;
  skus: SkuSummary[];
}) {
  if (!skus.length) return null;
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold px-6 py-3 border-b border-neutral-100 bg-white">
        {title}
      </p>
      <table className="w-full">
        <tbody>
          {skus.map((sku) => (
            <SkuRow key={sku.platform_sku_id} sku={sku} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SKUTable({ topSkus, bottomSkus }: SKUTableProps) {
  if (!topSkus.length && !bottomSkus.length) {
    return (
      <div className="py-12 text-center text-slate-400 font-semibold text-sm">
        No SKU data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      {/* Column headers */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200/80 bg-slate-50">
            {["Product", "Channel", "Revenue", "CM%", "Return Rate", "Flags"].map(
              (h) => (
                <th
                  key={h}
                  className="text-[11px] text-slate-500 uppercase tracking-widest font-extrabold text-left py-3 px-6"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
      </table>
      <SKUSection title="Top Performing" skus={topSkus} />
      <SKUSection title="Needs Attention" skus={bottomSkus} />
    </div>
  );
}
