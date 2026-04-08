"use client";

import type { ChannelStatus } from "@/types/api";
import { formatRelativeTime, formatNumber } from "@/lib/format";

interface ChannelCardProps {
  channel: ChannelStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSyncNow: () => void;
}

const CHANNEL_LABELS: Record<string, { label: string; color: string }> = {
  shopify: { label: "Shopify", color: "#96BF48" },
  amazon: { label: "Amazon", color: "#FF9900" },
  flipkart: { label: "Flipkart", color: "#2874F0" },
  meta: { label: "Meta Ads", color: "#0668E1" },
  google_ads: { label: "Google Ads", color: "#4285F4" },
};

function StatusDot({ status }: { status: string | null }) {
  if (status === "running") {
    return (
      <span className="inline-block w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
    );
  }
  if (status === "failed") {
    return <span className="inline-block w-2 h-2 rounded-full bg-[#EF4444]" />;
  }
  if (status === "completed") {
    return <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E]" />;
  }
  return <span className="inline-block w-2 h-2 rounded-full bg-[#333]" />;
}

export function ChannelCard({
  channel,
  onConnect,
  onDisconnect,
  onSyncNow,
}: ChannelCardProps) {
  const meta = CHANNEL_LABELS[channel.channel] ?? {
    label: channel.channel.charAt(0).toUpperCase() + channel.channel.slice(1),
    color: "#555",
  };

  return (
    <div
      className={`bg-[#111] rounded-xl border transition-all p-4 flex flex-col gap-3
        ${channel.is_connected ? "border-l-2 border-[#22C55E] border-r border-t border-b border-r-[#1E1E1E] border-t-[#1E1E1E] border-b-[#1E1E1E]" : "border-[#1E1E1E]"}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Channel avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
          >
            <span style={{ color: meta.color }}>
              {meta.label.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#DDD]">{meta.label}</p>
            <p className="text-[10px] text-[#444] mt-0.5">
              {channel.is_connected ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>
        <StatusDot status={channel.sync_status} />
      </div>

      {/* Stats (connected only) */}
      {channel.is_connected && (
        <div className="grid grid-cols-2 gap-2 bg-[#0D0D0D] rounded-lg p-2.5">
          <div>
            <p className="text-[9px] text-[#444] uppercase tracking-widest">Last sync</p>
            <p className="text-[11px] text-[#888] mt-0.5">
              {formatRelativeTime(channel.last_synced_at)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-[#444] uppercase tracking-widest">Records</p>
            <p className="text-[11px] text-[#888] mt-0.5">
              {formatNumber(channel.records_in_db)}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {channel.is_connected ? (
          <>
            <button
              onClick={onSyncNow}
              className="text-[11px] px-3 py-1.5 rounded-md bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/25 hover:bg-[#22C55E]/20 transition-all cursor-pointer"
            >
              Sync Now
            </button>
            <button
              onClick={onDisconnect}
              className="text-[11px] px-3 py-1.5 rounded-md text-[#555] border border-[#222] hover:text-[#888] hover:border-[#333] transition-all cursor-pointer"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            className="text-[11px] px-3 py-1.5 rounded-md bg-[#1A1A1A] text-[#888] border border-[#2A2A2A] hover:text-white hover:border-[#444] transition-all cursor-pointer"
          >
            Connect →
          </button>
        )}
      </div>
    </div>
  );
}
