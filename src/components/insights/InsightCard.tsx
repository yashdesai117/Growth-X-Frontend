"use client";

import type { InsightItem } from "@/types/api";
import { formatRelativeTime } from "@/lib/format";
import { Check, Info, AlertTriangle, X } from "lucide-react";

interface InsightCardProps {
  insight: InsightItem;
  onDismiss: (id: string) => void;
}

const SEVERITY_STYLES = {
  high: {
    badge: "bg-red-50 text-red-600 border-red-200",
    icon: <AlertTriangle size={14} className="text-red-500" />,
    border: "border-l-red-500",
    bg: "bg-white",
  },
  medium: {
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    icon: <Info size={14} className="text-amber-500" />,
    border: "border-l-amber-500",
    bg: "bg-white",
  },
  low: {
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: <Check size={14} className="text-emerald-500" />,
    border: "border-l-emerald-500",
    bg: "bg-white",
  },
} as const;

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const styles = SEVERITY_STYLES[insight.severity];

  return (
    <div
      className={`rounded-2xl border border-neutral-200/60 border-l-4 ${styles.border} ${styles.bg} p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-wider border ${styles.badge}`}
          >
            {styles.icon}
            {insight.severity}
          </span>
          {insight.affected_channel && (
            <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md border border-neutral-200/60 uppercase tracking-wider">
              {insight.affected_channel}
            </span>
          )}
          <span className="text-xs font-medium text-slate-400">
            {formatRelativeTime(insight.generated_at)}
          </span>
        </div>
        
        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(insight.insight_id)}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Dismiss insight"
        >
          <X size={16} />
        </button>
      </div>

      {/* Title + Description */}
      <div className="space-y-1.5">
        <p className="text-base font-extrabold text-slate-900 leading-snug">
          {insight.title}
        </p>
        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-3xl">
          {insight.description}
        </p>
      </div>

      {/* Action recommendation */}
      {insight.action_recommendation && (
        <div className="bg-slate-50 border border-neutral-200/60 rounded-xl px-4 py-3 mt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <SparklesIcon size={12} className="text-emerald-500" />
            Recommended Action
          </p>
          <p className="text-sm font-semibold text-slate-700 leading-relaxed">
            {insight.action_recommendation}
          </p>
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  );
}
