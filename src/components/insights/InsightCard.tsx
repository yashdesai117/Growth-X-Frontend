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
} as const;

const CONFIDENCE_STYLES = {
  high: "text-[#22C55E] bg-[#22C55E]/8 border-[#22C55E]/20",
  medium: "text-[#888] bg-[#1A1A1A] border-[#222]",
} as const;

const INSIGHT_TYPE_LABEL: Record<string, string> = {
  margin_leak: "Margin Leak",
  channel_efficiency: "Channel Efficiency",
  sku_action: "SKU Action",
  strategic_tension: "Strategic Tension",
  anomaly_alert: "Anomaly",
};

const DOMAIN_LABEL: Record<string, string> = {
  margin: "Margin",
  ad_spend: "Ad Spend",
  returns: "Returns",
  inventory: "Inventory",
  discounts: "Discounts",
};

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const styles = SEVERITY_STYLES[insight.severity];
  const confidenceStyle = CONFIDENCE_STYLES[insight.confidence] ?? CONFIDENCE_STYLES.medium;
  const typeLabel = INSIGHT_TYPE_LABEL[insight.insight_type] ?? insight.insight_type;

  return (
    <div
      className={`bg-[#111] rounded-xl border border-[#1E1E1E] border-l-2 ${styles.border} p-4 flex flex-col gap-3`}
    >
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity */}
          <span
            className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-semibold uppercase tracking-wider border ${styles.badge}`}
          >
            {insight.severity}
          </span>

          {/* Insight type */}
          <span className="inline-block px-1.5 py-0.5 text-[9px] text-[#555] bg-[#151515] rounded border border-[#1E1E1E] uppercase tracking-wide">
            {typeLabel}
          </span>

          {/* Channel */}
          {insight.affected_channel && (
            <span className="inline-block px-1.5 py-0.5 text-[9px] text-[#555] bg-[#1A1A1A] rounded border border-[#222] uppercase tracking-wide">
              {insight.affected_channel}
            </span>
          )}

          {/* Conflict resolution badge */}
          {insight.is_conflict_resolution && (
            <span className="inline-block px-1.5 py-0.5 text-[9px] text-[#A78BFA] bg-[#A78BFA]/8 rounded border border-[#A78BFA]/20 uppercase tracking-wide">
              Multi-domain
            </span>
          )}

          <span className="text-[10px] text-[#444]">
            {formatRelativeTime(insight.generated_at)}
          </span>
        </div>

        {/* Confidence */}
        <span
          className={`flex-shrink-0 inline-block px-1.5 py-0.5 text-[9px] rounded border uppercase tracking-wider font-medium ${confidenceStyle}`}
        >
          {insight.confidence} confidence
        </span>
      </div>

      {/* ── Title + Description ── */}
      <div className="space-y-1">
        <p className="text-[13px] font-semibold text-[#E0E0E0] leading-snug">
          {insight.title}
        </p>
        <p className="text-[12px] text-[#666] leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* ── Reason chain ── */}
      {insight.reason_chain && (
        <div className="bg-[#0C0C0C] border border-[#181818] rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">
            Why this matters
          </p>
          <p className="text-[11px] text-[#555] leading-relaxed">
            {insight.reason_chain}
          </p>
        </div>
      )}

      {/* ── Action recommendation ── */}
      {insight.action_recommendation && (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-[#444] uppercase tracking-widest mb-1">
            Recommended Action
          </p>
          <p className="text-[12px] text-[#888] leading-relaxed">
            {insight.action_recommendation}
          </p>

          {/* Impact badge */}
          {insight.recommendation_impact && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`text-[10px] font-semibold tabular-nums ${
                  insight.recommendation_impact.direction === "increase"
                    ? "text-[#22C55E]"
                    : "text-[#EF4444]"
                }`}
              >
                {insight.recommendation_impact.direction === "increase" ? "↑" : "↓"}{" "}
                {insight.recommendation_impact.unit}{" "}
                {insight.recommendation_impact.value.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-[#383838]">
                /{insight.recommendation_impact.time_to_impact.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Source domains ── */}
      {insight.source_domains && insight.source_domains.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-[#333] uppercase tracking-widest mr-1">
            Domains:
          </span>
          {insight.source_domains.map((d) => (
            <span
              key={d}
              className="text-[9px] px-1.5 py-0.5 bg-[#151515] text-[#444] rounded border border-[#1A1A1A]"
            >
              {DOMAIN_LABEL[d] ?? d}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer: View SKU + Dismiss ── */}
      <div className="flex items-center justify-between pt-0.5">
        {/* Deep link — computed server-side */}
        {insight.sku_deep_link ? (
          <a
            href={insight.sku_deep_link.route}
            className="text-[11px] text-[#555] hover:text-[#888] transition-colors underline underline-offset-2"
          >
            View SKU →
          </a>
        ) : (
          <span />
        )}

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
