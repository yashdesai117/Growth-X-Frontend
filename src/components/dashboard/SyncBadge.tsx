"use client";

import { formatRelativeTime } from "@/lib/format";
import { RefreshCw } from "lucide-react";

interface SyncBadgeProps {
  lastSyncedAt: string | null;
  status: string | null;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export function SyncBadge({
  lastSyncedAt,
  status,
  onSyncNow,
  isSyncing,
}: SyncBadgeProps) {
  const isRunning = isSyncing || status === "running";
  const isFailed = status === "failed";

  return (
    <div className="flex items-center gap-4">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {isRunning ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-xs font-bold text-blue-600">Syncing...</span>
          </>
        ) : isFailed ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-xs font-bold text-red-600">Sync failed</span>
          </>
        ) : (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-semibold text-slate-500">
              {lastSyncedAt
                ? `Synced ${formatRelativeTime(lastSyncedAt)}`
                : "Never synced"}
            </span>
          </>
        )}
      </div>

      {/* Sync Now button */}
      <button
        onClick={onSyncNow}
        disabled={isRunning}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all shadow-sm
          ${
            isRunning
              ? "text-slate-400 border-neutral-200 bg-neutral-50 cursor-not-allowed"
              : "text-slate-700 border-neutral-200 bg-white hover:bg-slate-50 hover:text-slate-900 cursor-pointer active:scale-95"
          }`}
      >
        <RefreshCw size={12} className={isRunning ? "animate-spin" : ""} strokeWidth={2.5} />
        {isRunning ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}