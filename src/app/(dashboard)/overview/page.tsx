"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchDashboardSummary,
  fetchChannels,
  fetchTopSkus,
  fetchMarginTrend,
  fetchSyncStatus,
  triggerSync,
  fetchCostInputs,
} from "@/lib/dashboard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MarginChart } from "@/components/dashboard/MarginChart";
import { SKUTable } from "@/components/dashboard/SKUTable";
import { SyncBadge } from "@/components/dashboard/SyncBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatPct } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import type {
  DashboardSummary,
  ChannelsList,
  ChannelStatus,
  TopSkus,
  MarginTrend,
  SyncStatus,
} from "@/types/api";
import { toast } from "sonner";

function ChannelRow({ ch }: { ch: ChannelStatus }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${
            ch.is_connected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
          }`}
        />
        <span className="text-sm font-semibold text-slate-700 capitalize truncate">
          {ch.channel}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-3">
        {ch.is_connected ? (
          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">Connected</span>
        ) : (
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">Not connected</span>
        )}
        {ch.sync_status === "running" && (
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider animate-pulse">syncing...</span>
        )}
        <span className="text-xs text-slate-500 font-medium tabular-nums w-20 text-right">
          {ch.records_in_db > 0 ? `${ch.records_in_db.toLocaleString("en-IN")} rows` : "-"}
        </span>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [channels, setChannels] = useState<ChannelsList | null>(null);
  const [topSkus, setTopSkus] = useState<TopSkus | null>(null);
  const [trend, setTrend] = useState<MarginTrend | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveCosts, setHasActiveCosts] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [s, ch, ts, mt, ss, ci] = await Promise.all([
        fetchDashboardSummary(),
        fetchChannels(),
        fetchTopSkus(),
        fetchMarginTrend(),
        fetchSyncStatus(),
        fetchCostInputs(),
      ]);
      setSummary(s);
      setChannels(ch);
      setTopSkus(ts);
      setTrend(mt);
      setSyncStatus(ss);
      setHasActiveCosts(ci.cost_inputs.length > 0);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await triggerSync();
      toast.success("Sync triggered for all connected channels.");
      setTimeout(() => {
        setIsSyncing(false);
        loadAll();
      }, 3000);
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger sync");
      setIsSyncing(false);
    }
  };

  const lastJob = syncStatus?.sync_jobs?.[0] ?? null;
  const hasWarning = (summary?.skus_with_missing_data ?? 0) > 0;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3 bg-white border border-red-100 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle size={24} />
          </div>
          <p className="text-red-600 text-lg font-bold">Failed to load dashboard</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <p className="text-slate-400 text-xs">Ensure the backend is running on port 8000</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              loadAll();
            }}
            className="mt-4 text-sm font-semibold px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-12">
      {/* Sticky topbar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-200/60 sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          {summary && !isLoading && (
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {summary.date_from} — {summary.date_to}
            </p>
          )}
        </div>
        <SyncBadge
          lastSyncedAt={lastJob?.completed_at ?? null}
          status={lastJob?.status ?? null}
          onSyncNow={handleSyncNow}
          isSyncing={isSyncing}
        />
      </div>

      <div className="p-8 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Missing overall costs warning banner */}
        {!hasActiveCosts && !isLoading && (
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200/60 rounded-xl shadow-sm">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-amber-800 leading-relaxed">
              No cost inputs have been configured. Contribution margins cannot be calculated accurately.{" "}
              <a
                href="/channels"
                className="underline underline-offset-4 font-bold hover:text-amber-900 transition-colors"
              >
                Configure costs on the Channels page.
              </a>
            </p>
          </div>
        )}

        {/* Missing data warning banner */}
        {hasWarning && !isLoading && (
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200/60 rounded-xl shadow-sm">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium text-amber-800 leading-relaxed">
              {summary?.skus_with_missing_data} SKU(s) have missing cost inputs — margins may be overstated.{" "}
              <a
                href="/channels"
                className="underline underline-offset-4 font-bold hover:text-amber-900 transition-colors"
              >
                Add costs on the Channels page.
              </a>
            </p>
          </div>
        )}

        {/* 4 KPI MetricCards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200/60 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                <Skeleton className="h-3 w-24 bg-neutral-100" />
                <Skeleton className="h-10 w-32 bg-neutral-100" />
                <Skeleton className="h-3 w-16 bg-neutral-100" />
              </div>
            ))
          ) : (
            <>
              <MetricCard
                label="Net Revenue"
                value={formatINR(summary?.total_revenue)}
                warning={hasWarning}
              />
              <MetricCard
                label="Contribution Margin"
                value={formatINR(summary?.total_contribution_margin)}
                warning={hasWarning}
              />
              <MetricCard
                label="CM%"
                value={formatPct(summary?.avg_contribution_margin_pct)}
                warning={hasWarning}
              />
              <MetricCard
                label="Return Rate"
                value={formatPct(summary?.return_rate_pct)}
                subtitle={
                  summary
                    ? `${summary.total_units_returned.toLocaleString("en-IN")} units returned`
                    : undefined
                }
                warning={hasWarning}
              />
            </>
          )}
        </div>

        {/* MarginChart (60%) + Channel Status (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Trend chart - 3 cols */}
          <div className="col-span-1 lg:col-span-3 bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm text-slate-500 uppercase tracking-widest font-bold">
                Margin Trend
              </h2>
              {trend && !isLoading && (
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-neutral-100">
                  {trend.date_from} — {trend.date_to}
                </span>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="flex-1 min-h-[250px] w-full bg-neutral-50 rounded-xl" />
            ) : (
              <div className="flex-1 min-h-[250px]">
                <MarginChart series={trend?.series ?? []} />
              </div>
            )}
          </div>

          {/* Channel status - 2 cols */}
          <div className="col-span-1 lg:col-span-2 bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-5">
              Connected Channels
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-12 w-full bg-neutral-50 rounded-lg"
                  />
                ))}
              </div>
            ) : channels?.channels.length ? (
              <div className="space-y-1">
                {channels.channels.map((ch) => (
                  <ChannelRow key={ch.channel} ch={ch} />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <span className="text-slate-400 font-bold">!</span>
                </div>
                <p className="text-slate-900 font-bold text-sm">No channels connected</p>
                <p className="text-slate-500 text-xs mt-1">Connect Shopify to see data.</p>
              </div>
            )}
          </div>
        </div>

        {/* SKUTable */}
        <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm text-slate-500 uppercase tracking-widest font-bold">
              Top & Bottom SKU Performance
            </h2>
            <a
              href="/skus"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View complete list →
            </a>
          </div>
          {isLoading ? (
            <div className="p-6 space-y-4 bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-full bg-neutral-50 rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="bg-white">
              <SKUTable
                topSkus={topSkus?.top_skus ?? []}
                bottomSkus={topSkus?.bottom_skus ?? []}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}