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
    <div className="bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-[11px]">
      <p className="text-[#555] mb-1">{d.date}</p>
      <p className="text-[#22C55E] font-semibold">
        CM%: {d.contribution_margin_pct != null ? d.contribution_margin_pct.toFixed(1) : "—"}%
      </p>
      <p className="text-[#888]">
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
      <div className="h-40 flex items-center justify-center text-[#333] text-xs">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={series} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(val: string, i: number) =>
            formatXAxis(val, i, series)
          }
          tick={{ fill: "#444", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          dataKey="contribution_margin_pct"
          tick={{ fill: "#444", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="contribution_margin_pct"
          stroke="#22C55E"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "#22C55E", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
