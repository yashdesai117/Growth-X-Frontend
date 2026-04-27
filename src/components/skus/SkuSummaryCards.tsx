import { CatalogSku } from "@/types/api";

interface Props {
  totalSkus: number;
  items: CatalogSku[];
}

export function SkuSummaryCards({ totalSkus, items }: Props) {
  const onBoth = items.filter(item => item.is_on_shopify && item.is_on_amazon).length;
  const missingCogs = items.filter(item => item.has_missing_data).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Total SKUs</div>
        <div className="text-2xl font-bold mt-1">{totalSkus}</div>
      </div>
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">On Both Channels</div>
        <div className="text-2xl font-bold mt-1">{onBoth}</div>
      </div>
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Missing COGS</div>
        <div className="text-2xl font-bold mt-1 text-red-600">{missingCogs}</div>
      </div>
    </div>
  );
}
