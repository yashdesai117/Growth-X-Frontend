"use client";

import type { ChannelStatus } from "@/types/api";
import { formatRelativeTime, formatNumber } from "@/lib/format";
import { Unplug, RefreshCw, Link2 } from "lucide-react";

interface ChannelCardProps {
  channel: ChannelStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSyncNow: () => void;
}

const CHANNEL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  shopify: { label: "Shopify", color: "#16a34a", bg: "bg-green-50" }, // emerald/green
  amazon: { label: "Amazon", color: "#ea580c", bg: "bg-orange-50" },
  flipkart: { label: "Flipkart", color: "#2563eb", bg: "bg-blue-50" },
  woocommerce: { label: "WooCommerce", color: "#9333ea", bg: "bg-purple-50" },
  meta: { label: "Meta Ads", color: "#2563eb", bg: "bg-blue-50" },
  google_ads: { label: "Google Ads", color: "#ea4335", bg: "bg-red-50" },
};

function StatusDot({ status }: { status: string | null }) {
  if (status === "running") {
    return (
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
    );
  }
  if (status === "failed") {
    return <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />;
  }
  if (status === "completed") {
    return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />;
  }
  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300" />;
}

export function ChannelCard({
  channel,
  onConnect,
  onDisconnect,
  onSyncNow,
}: ChannelCardProps) {
  const meta = CHANNEL_LABELS[channel.channel] || {
    label: channel.channel,
    color: "#64748b",
    bg: "bg-slate-50",
  };
  const isSyncing = channel.sync_status === "running";

  return (
    <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all">
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${meta.bg}`}
              style={{ color: meta.color }}
            >
              {meta.label.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {meta.label}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {channel.is_connected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <StatusDot status={channel.is_connected ? channel.sync_status : null} />
        </div>

        {channel.is_connected && (
          <div className="space-y-2.5 mb-6">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Last sync</span>
              <span className="text-slate-900">
                {channel.last_synced_at
                  ? formatRelativeTime(channel.last_synced_at)
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Records</span>
              <span className="text-slate-900">
                {formatNumber(channel.records_in_db)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto">
        {channel.is_connected ? (
          <div className="flex gap-2">
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg border transition-all active:scale-95 shadow-sm
                ${
                  isSyncing
                    ? "bg-slate-50 border-neutral-200 text-slate-400 cursor-not-allowed"
                    : "bg-white border-neutral-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                }`}
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} strokeWidth={2.5}/>
              {isSyncing ? "Syncing..." : "Sync"}
            </button>
            <button
              onClick={onDisconnect}
              className="px-3 py-2 bg-white border border-neutral-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
              title="Disconnect"
            >
              <Unplug size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm shadow-slate-900/10 active:scale-95"
          >
            <Link2 size={14} strokeWidth={2.5} /> Connect
          </button>
        )}
      </div>
    </div>
  );
}