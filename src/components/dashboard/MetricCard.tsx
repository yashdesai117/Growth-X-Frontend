"use client";

import { AlertTriangle } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
  warning?: boolean;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaPositive,
  subtitle,
  warning,
}: MetricCardProps) {
  return (
    <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 flex flex-col gap-2 shadow-sm transition-all hover:shadow-md">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
          {label}
        </span>
        {warning && (
          <div title="Some data is incomplete for this metric">
            <AlertTriangle
              size={14}
              className="text-amber-500 shrink-0"
            />
          </div>
        )}
      </div>

      {/* Value */}
      <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</span>

      {/* Delta + subtitle */}
      <div className="flex items-center gap-2 min-h-[16px] mt-1">
        {delta && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              deltaPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {delta}
          </span>
        )}
        {subtitle && (
          <span className="text-xs font-semibold text-slate-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
