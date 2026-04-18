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
import type {
  DashboardSummary,
  ChannelsList,
  ChannelStatus,
  TopSkus,
  MarginTrend,
  SyncStatus,
} from "@/types/api";

// ─── Channel connection status row (no revenue — not in /channels endpoint) ───

function ChannelRow({ ch }: { ch: ChannelStatus }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#161616] last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
            ch.is_connected ? "bg-[#22C55E]" : "bg-[#333]"
          }`}
        />
        <span className="text-[12px] text-[#AAA] capitalize truncate">
          {ch.channel}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {ch.is_connected ? (
          <span className="text-[10px] text-[#22C55E] font-medium">Connected</span>
        ) : (
          <span className="text-[10px] text-[#444]">Not connected</span>
        )}
        {ch.sync_status === "running" && (
          <span className="text-[9px] text-[#3B82F6] uppercase tracking-wide">syncing…</span>
        )}
        <span className="text-[10px] text-[#333] tabular-nums">
          {ch.records_in_db > 0 ? `${ch.records_in_db.toLocaleString("en-IN")} rows` : "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

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
      await triggerSync("shopify");
      setTimeout(() => {
        setIsSyncing(false);
        loadAll();
      }, 3000);
    } catch {
      setIsSyncing(false);
    }
  };

  const lastJob = syncStatus?.sync_jobs?.[0] ?? null;
  // Backend returns flat fields — no nested current_period or deltas
  const hasWarning = (summary?.skus_with_missing_data ?? 0) > 0;

  // ── Error state ──
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-[#EF4444] text-sm font-medium">
            Failed to load dashboard
          </p>
          <p className="text-[#444] text-xs">{error}</p>
          <p className="text-[#333] text-xs">
            Ensure the backend is running on port 8000
          </p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              loadAll();
            }}
            className="mt-3 text-[11px] px-4 py-1.5 border border-[#2A2A2A] text-[#666]
              rounded-lg hover:text-white hover:border-[#444] transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Sticky topbar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A] sticky top-0 bg-[#0A0A0A] z-10">
        <div>
          <h1 className="text-sm font-medium text-white">Dashboard Overview</h1>
          {summary && !isLoading && (
            <p className="text-[10px] text-[#444] mt-0.5">
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

      <div className="p-6 space-y-5 max-w-[1280px]">
        {/* ── Missing overall costs warning banner ── */}
        {!hasActiveCosts && !isLoading && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[#EAB308]/5 border border-[#EAB308]/20 rounded-lg">
            <span className="text-[#EAB308] text-sm mt-0.5 shrink-0">⚠</span>
            <p className="text-[11px] text-[#EAB308] leading-relaxed">
              No cost inputs have been configured. Contribution margins cannot be calculated accurately.{" "}
              <a
                href="/channels"
                className="underline underline-offset-2 hover:text-[#FBBF24] transition-colors"
              >
                Configure costs on the Channels page.
              </a>
            </p>
          </div>
        )}

        {/* ── Missing data warning banner ── */}
        {hasWarning && !isLoading && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[#EAB308]/5 border border-[#EAB308]/20 rounded-lg">
            <span className="text-[#EAB308] text-sm mt-0.5 shrink-0">⚠</span>
            <p className="text-[11px] text-[#EAB308] leading-relaxed">
              {summary?.skus_with_missing_data} SKU(s) have missing cost inputs — margins may be overstated.{" "}
              <a
                href="/channels"
                className="underline underline-offset-2 hover:text-[#FBBF24] transition-colors"
              >
                Add costs on the Channels page.
              </a>
            </p>
          </div>
        )}

        {/* ── 4 KPI MetricCards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#1E1E1E] rounded-xl p-4 space-y-2.5"
              >
                <Skeleton className="h-2.5 w-20 bg-[#1A1A1A]" />
                <Skeleton className="h-7 w-28 bg-[#1A1A1A]" />
                <Skeleton className="h-2.5 w-16 bg-[#1A1A1A]" />
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
                    ? `${summary.total_units_returned.toLocaleString("en-IN")} returned`
                    : undefined
                }
                warning={hasWarning}
              />
            </>
          )}
        </div>

        {/* ── MarginChart (60%) + Channel Status (40%) ── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Trend chart — 3 cols */}
          <div className="col-span-3 bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] text-[#555] uppercase tracking-widest font-medium">
                Margin Trend
              </h2>
              {trend && !isLoading && (
                <span className="text-[10px] text-[#333]">
                  {trend.date_from} – {trend.date_to}
                </span>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="h-40 w-full bg-[#0D0D0D] rounded-lg" />
            ) : (
              <MarginChart series={trend?.series ?? []} />
            )}
          </div>

          {/* Channel status — 2 cols */}
          <div className="col-span-2 bg-[#111] border border-[#1E1E1E] rounded-xl p-4">
            <h2 className="text-[11px] text-[#555] uppercase tracking-widest font-medium mb-3">
              Channels
            </h2>
            {isLoading ? (
              <div className="space-y-3 mt-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-full bg-[#0D0D0D] rounded"
                  />
                ))}
              </div>
            ) : channels?.channels.length ? (
              <div>
                {channels.channels.map((ch) => (
                  <ChannelRow key={ch.channel} ch={ch} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#333] text-xs">
                No channels connected
              </div>
            )}
          </div>
        </div>

        {/* ── SKUTable ── */}
        <div className="bg-[#111] border border-[#1E1E1E] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between">
            <h2 className="text-[11px] text-[#555] uppercase tracking-widest font-medium">
              SKU Performance
            </h2>
            <a
              href="/skus"
              className="text-[11px] text-[#444] hover:text-[#888] transition-colors"
            >
              View all →
            </a>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-full bg-[#0D0D0D] rounded"
                />
              ))}
            </div>
          ) : (
            <SKUTable
              topSkus={topSkus?.top_skus ?? []}
              bottomSkus={topSkus?.bottom_skus ?? []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
