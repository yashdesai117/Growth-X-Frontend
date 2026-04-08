"use client";

import type { SkuSummary } from "@/types/api";
import { formatINR, formatPct, truncate } from "@/lib/format";

interface SKUTableProps {
  topSkus: SkuSummary[];
  bottomSkus: SkuSummary[];
}

function SkuRow({ sku }: { sku: SkuSummary }) {
  const cmPct = sku.avg_contribution_margin_pct;
  const cmPositive = cmPct !== null && cmPct >= 0;

  return (
    <tr className="border-b border-[#161616] hover:bg-[#141414] transition-colors">
      <td className="py-2.5 px-3 text-[12px] text-[#CCC]">
        {truncate(sku.product_name, 32)}
      </td>
      <td className="py-2.5 px-3">
        <span className="text-[10px] text-[#555] uppercase tracking-wide">
          {sku.channel}
        </span>
      </td>
      <td className="py-2.5 px-3 text-[12px] text-[#888] font-mono">
        {formatINR(sku.total_net_revenue)}
      </td>
      <td className="py-2.5 px-3 text-[12px] font-semibold font-mono">
        <span className={cmPositive ? "text-[#22C55E]" : "text-[#EF4444]"}>
          {formatPct(cmPct)}
        </span>
      </td>
      <td className="py-2.5 px-3 text-[12px] text-[#888] font-mono">
        {formatPct(sku.return_rate_pct)}
      </td>
      <td className="py-2.5 px-3">
        {sku.has_missing_data && (
          <span className="inline-block px-1.5 py-0.5 bg-[#EAB308]/10 text-[#EAB308] text-[9px] rounded-sm font-medium uppercase tracking-wide">
            data missing
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
      <p className="text-[10px] text-[#444] uppercase tracking-widest font-medium px-3 py-2 border-b border-[#161616]">
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
      <div className="py-8 text-center text-[#333] text-xs">
        No SKU data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Column headers */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1A1A1A]">
            {["Product", "Channel", "Revenue", "CM%", "Return Rate", "Flags"].map(
              (h) => (
                <th
                  key={h}
                  className="text-[10px] text-[#444] uppercase tracking-widest font-medium text-left py-2 px-3"
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
