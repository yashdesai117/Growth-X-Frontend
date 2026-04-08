"use client";

import { formatRelativeTime } from "@/lib/format";

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
    <div className="flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        {isRunning ? (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
            <span className="text-[11px] text-[#EAB308]">Syncing…</span>
          </>
        ) : isFailed ? (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span className="text-[11px] text-[#EF4444]">Sync failed</span>
          </>
        ) : (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            <span className="text-[11px] text-[#555]">
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
        className={`text-[11px] px-2.5 py-1 rounded-md border transition-all
          ${
            isRunning
              ? "text-[#333] border-[#222] cursor-not-allowed"
              : "text-[#888] border-[#2A2A2A] hover:text-white hover:border-[#444] cursor-pointer"
          }`}
      >
        {isRunning ? "Syncing…" : "Sync Now"}
      </button>
    </div>
  );
}
