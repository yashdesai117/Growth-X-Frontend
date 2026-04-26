import { OrdersSummary } from "@/types/api";

interface Props {
  summary: OrdersSummary | null;
}

export function OrderSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Total Orders (30d)</div>
        <div className="text-2xl font-bold mt-1">{summary?.total_orders_30d || 0}</div>
      </div>
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Total GMV (30d)</div>
        <div className="text-2xl font-bold mt-1">
          ₹{(summary?.total_gmv_30d || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Total Returns (30d)</div>
        <div className="text-2xl font-bold mt-1">{summary?.total_returns_30d || 0}</div>
      </div>
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="text-sm font-medium text-slate-500">Return Rate</div>
        <div className="text-2xl font-bold mt-1">{summary?.return_rate_pct || 0}%</div>
      </div>
    </div>
  );
}
