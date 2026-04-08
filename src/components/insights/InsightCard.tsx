"use client";

import type { InsightItem } from "@/types/api";
import { formatRelativeTime } from "@/lib/format";

interface InsightCardProps {
  insight: InsightItem;
  onDismiss: (id: string) => void;
}

const SEVERITY_STYLES = {
  high: {
    badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25",
    dot: "bg-[#EF4444]",
    border: "border-l-[#EF4444]/60",
  },
  medium: {
    badge: "bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/25",
    dot: "bg-[#EAB308]",
    border: "border-l-[#EAB308]/60",
  },
  low: {
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25",
    dot: "bg-[#22C55E]",
    border: "border-l-[#22C55E]/60",
  },
} as const;

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const styles = SEVERITY_STYLES[insight.severity];

  return (
    <div
      className={`bg-[#111] rounded-xl border border-[#1E1E1E] border-l-2 ${styles.border} p-4 flex flex-col gap-3`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-semibold uppercase tracking-wider border ${styles.badge}`}
          >
            {insight.severity}
          </span>
          {insight.affected_channel && (
            <span className="inline-block px-1.5 py-0.5 text-[9px] text-[#555] bg-[#1A1A1A] rounded border border-[#222] uppercase tracking-wide">
              {insight.affected_channel}
            </span>
          )}
          <span className="text-[10px] text-[#444]">
            {formatRelativeTime(insight.generated_at)}
          </span>
        </div>
      </div>

      {/* Title + Description */}
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-[#E0E0E0] leading-snug">
          {insight.title}
        </p>
        <p className="text-[12px] text-[#666] leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* Action recommendation */}
      {insight.action_recommendation && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">
            Recommended Action
          </p>
          <p className="text-[12px] text-[#888] leading-relaxed">
            {insight.action_recommendation}
          </p>
        </div>
      )}

      {/* Dismiss */}
      <div className="flex justify-end">
        <button
          onClick={() => onDismiss(insight.insight_id)}
          className="text-[11px] text-[#333] hover:text-[#666] transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
