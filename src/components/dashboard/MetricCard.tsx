"use client";

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
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-4 flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-[#555] uppercase tracking-widest font-medium">
          {label}
        </span>
        {warning && (
          <span
            title="Some data is incomplete for this metric"
            className="inline-block w-1.5 h-1.5 rounded-full bg-[#EAB308] shrink-0"
          />
        )}
      </div>

      {/* Value */}
      <span className="text-xl font-semibold text-white leading-none">{value}</span>

      {/* Delta + subtitle */}
      <div className="flex items-center gap-2 min-h-[16px]">
        {delta && (
          <span
            className={`text-[11px] font-medium ${
              deltaPositive ? "text-[#22C55E]" : "text-[#EF4444]"
            }`}
          >
            {delta}
          </span>
        )}
        {subtitle && (
          <span className="text-[11px] text-[#444]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
