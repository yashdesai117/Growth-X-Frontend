"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/types/api";

interface MarginChartProps {
  series: TrendPoint[];
}

interface TooltipPayloadItem {
  payload: TrendPoint;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-neutral-200/80 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-slate-500 text-xs font-semibold mb-1.5">{d.date}</p>
      <p className="text-emerald-600 font-bold text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Margin: {d.contribution_margin_pct != null ? d.contribution_margin_pct.toFixed(1) : "-"}%
      </p>
      <p className="text-slate-600 text-xs font-semibold mt-1 pl-4">
        ₹{(d.net_revenue / 1000).toFixed(1)}K revenue
      </p>
    </div>
  );
}

function formatXAxis(date: string, index: number, all: TrendPoint[]) {
  // Show every 7th label to avoid crowding
  const step = Math.max(1, Math.floor(all.length / 6));
  if (index % step !== 0) return "";
  return date.slice(5); // MM-DD
}

export function MarginChart({ series }: MarginChartProps) {
  if (!series.length) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-xl border border-dashed border-neutral-200">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(val: string, i: number) =>
            formatXAxis(val, i, series)
          }
          tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="contribution_margin_pct"
          tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }} />
        <Line
          type="monotone"
          dataKey="contribution_margin_pct"
          stroke="#10b981"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}