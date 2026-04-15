"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchChannels,
  fetchSyncStatus,
  fetchCostInputs,
  triggerSync,
  createCostInput,
} from "@/lib/dashboard";
import { ChannelCard } from "@/components/channels/ChannelCard";
import type { ChannelStatus, SyncStatus, CostInput } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
// ─── Cost input form ──────────────────────────────────────────────────────────

type CostFormState = {
  packaging_cost: string;
  payment_gateway_fee: string;
};

function getCostValue(inputs: CostInput[], costType: string): string {
  const match = inputs.find((c) => c.cost_type === costType);
  return match ? String(match.value) : "";
}

// ─── Channel list with "coming soon" stubs ────────────────────────────────────

const STUB_CHANNELS: ChannelStatus[] = [
  {
    channel: "amazon",
    is_connected: false,
    connected_at: null,
    last_synced_at: null,
    sync_status: null,
    records_in_db: 0,
    next_scheduled_sync_at: null,
  },
  {
    channel: "flipkart",
    is_connected: false,
    connected_at: null,
    last_synced_at: null,
    sync_status: null,
    records_in_db: 0,
    next_scheduled_sync_at: null,
  },
  {
    channel: "woocommerce",
    is_connected: false,
    connected_at: null,
    last_synced_at: null,
    sync_status: null,
    records_in_db: 0,
    next_scheduled_sync_at: null,
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

function ChannelsPageContent() {
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [costInputs, setCostInputs] = useState<CostInput[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cost form state
  const [form, setForm] = useState<CostFormState>({
    packaging_cost: "",
    payment_gateway_fee: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial data load
  const loadData = useCallback(async () => {
    try {
      const [ch, ci] = await Promise.all([fetchChannels(), fetchCostInputs()]);
      setChannels(ch.channels);
      setCostInputs(ci.cost_inputs);
      setForm({
        packaging_cost: getCostValue(ci.cost_inputs, "packaging_cost"),
        payment_gateway_fee: getCostValue(ci.cost_inputs, "payment_gateway_fee"),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll sync status every 10 seconds
  useEffect(() => {
    const poll = () =>
      fetchSyncStatus()
        .then(setSyncStatus)
        .catch(() => null);
    poll();
    intervalRef.current = setInterval(poll, 10_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Re-fetch when Shopify OAuth redirects back with ?shopify=connected.
  // We MUST wait for Supabase to rehydrate the session from cookies after the
  // full-page OAuth redirect — calling loadData() immediately races against
  // getSession() returning null, which sends an unauthenticated request and
  // causes 'Failed to fetch' on the CORS preflight of the backend's 401.
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("shopify") !== "connected") return;

    const supabase = createClient();
    let settled = false;

    // Wait for the session to be confirmed, then refresh channel data
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && !settled) {
          settled = true;
          subscription.unsubscribe();
          loadData();
        }
      }
    );

    // Safety fallback: if auth event never fires in 3s, try anyway
    const fallback = setTimeout(() => {
      if (!settled) {
        settled = true;
        subscription.unsubscribe();
        loadData();
      }
    }, 3000);

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [searchParams, loadData]);

  // Merge real channels with stubs (show stubs for unconnected channels not in API response)
  const liveChannelNames = new Set(channels.map((c) => c.channel));
  const stubsToShow = STUB_CHANNELS.filter((s) => !liveChannelNames.has(s.channel));
  const allChannels = [...channels, ...stubsToShow];

  // Enrich Shopify with live sync status
  const enrichedChannels = allChannels.map((ch) => {
    if (ch.channel === "shopify" && syncStatus?.sync_jobs?.length) {
      const job = syncStatus.sync_jobs[0];
      return { ...ch, sync_status: job.status, last_synced_at: job.completed_at };
    }
    return ch;
  });

  const handleSyncNow = async (channel: string) => {
    if (channel !== "shopify") return;
    setSyncing(channel);
    try {
      await triggerSync(channel);
      setTimeout(() => { setSyncing(null); loadData(); }, 3000);
    } catch {
      setSyncing(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const inputs = [
        { cost_type: "packaging_cost", value: parseFloat(form.packaging_cost || "0"), channel: "shopify", effective_from: today },
        { cost_type: "payment_gateway_fee", value: parseFloat(form.payment_gateway_fee || "0"), channel: "shopify", effective_from: today },
      ].filter((i) => !isNaN(i.value) && i.value >= 0);

      await Promise.all(inputs.map(createCostInput));
      setSaveMessage("Recomputing margins…");
      setTimeout(() => { setSaveMessage("Margins updated. Refresh to see new data."); loadData(); }, 3000);
    } catch {
      setSaveMessage("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="flex items-center px-6 py-4 border-b border-[#1A1A1A] sticky top-0 bg-[#0A0A0A] z-10">
        <h1 className="text-sm font-medium text-white">Channels</h1>
      </div>

      <div className="p-6 space-y-8 max-w-[1000px]">
        {error && (
          <div className="px-4 py-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg">
            <p className="text-[11px] text-[#EF4444]">{error}</p>
          </div>
        )}

        {/* ── Connected Channels ── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-[12px] font-medium text-[#888]">Sales Channels</h2>
            <p className="text-[11px] text-[#444] mt-0.5">
              Shopify is live. Additional channels coming in future releases.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#1E1E1E] rounded-xl h-36 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichedChannels.map((ch) => {
                const isComingSoon = ["woocommerce", "flipkart"].includes(ch.channel) && !ch.is_connected;
                return (
                  <div key={ch.channel} className={isComingSoon ? "opacity-50 pointer-events-none" : ""}>
                    <ChannelCard
                      channel={
                        ch.channel === "shopify" && syncing === "shopify"
                          ? { ...ch, sync_status: "running" }
                          : ch
                      }
                      onConnect={async () => {
                        if (ch.channel === "shopify") {
                          const domain = window.prompt(
                            "Enter your Shopify store domain",
                            "yourstore.myshopify.com"
                          );
                          if (!domain) return;
                          apiClient<{ redirect_url: string }>(
                            "/api/v1/channels/shopify/connect/initiate",
                            {
                              method: "POST",
                              body: JSON.stringify({ shop_domain: domain }),
                            }
                          ).then((envelope) => {
                            if (envelope.data?.redirect_url) {
                              window.location.href = envelope.data.redirect_url;
                            }
                          }).catch(() => alert("Failed to initiate Shopify connection. Try again."));
                        }

                        if (ch.channel === "amazon") {
                          const sellerId = window.prompt(
                            "Step 1 of 2\n\nEnter your Amazon Seller ID (Merchant Token)\n\nFind it in: Seller Central → Settings → Account Info → Merchant Token\n\nFormat: A2XXXXXXXXXXX"
                          );
                          if (!sellerId || !sellerId.trim()) return;

                          const refreshToken = window.prompt(
                            "Step 2 of 2\n\nEnter your Amazon Refresh Token\n\nYou received this from your Solution Provider Portal app authorization."
                          );
                          if (!refreshToken || !refreshToken.trim()) return;

                          try {
                            await apiClient("/api/v1/channels/amazon/connect/direct", {
                              method: "POST",
                              body: JSON.stringify({
                                seller_id: sellerId.trim(),
                                refresh_token: refreshToken.trim(),
                              }),
                            });
                            await loadData();
                          } catch (err) {
                            alert(
                              err instanceof Error
                                ? `Failed to connect Amazon: ${err.message}`
                                : "Failed to connect Amazon. Please try again."
                            );
                          }
                        }
                      }}
                      onDisconnect={() => alert(`Disconnect ${ch.channel} — coming soon`)}
                      onSyncNow={() => handleSyncNow(ch.channel)}
                    />
                    {isComingSoon && (
                      <p className="text-center text-[10px] text-[#333] mt-1.5">Coming soon</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Manual Cost Inputs ── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-[12px] font-medium text-[#888]">Manual Cost Inputs</h2>
            <p className="text-[11px] text-[#444] mt-0.5">
              These apply to all Shopify orders for contribution margin calculation.
            </p>
          </div>

          <form
            onSubmit={handleSave}
            className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5 space-y-5 max-w-[480px]"
          >
            {/* Packaging cost */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#666] font-medium block" htmlFor="packaging_cost">
                Packaging cost per unit (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">₹</span>
                <input
                  id="packaging_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.packaging_cost}
                  onChange={(e) => setForm((f) => ({ ...f, packaging_cost: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-7 pr-3 py-2.5
                    text-[13px] text-white placeholder-[#333] outline-none focus:border-[#3A3A3A]
                    focus:ring-1 focus:ring-[#22C55E]/20 transition-all"
                />
              </div>
            </div>

            {/* Payment gateway fee */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-[#666] font-medium block" htmlFor="payment_gateway_fee">
                Payment gateway fee % (Shopify Payments)
              </label>
              <div className="relative">
                <input
                  id="payment_gateway_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="2.00"
                  value={form.payment_gateway_fee}
                  onChange={(e) => setForm((f) => ({ ...f, payment_gateway_fee: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-3 pr-7 py-2.5
                    text-[13px] text-white placeholder-[#333] outline-none focus:border-[#3A3A3A]
                    focus:ring-1 focus:ring-[#22C55E]/20 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">%</span>
              </div>
            </div>

            {/* Save button + feedback */}
            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]
                  text-[12px] font-medium rounded-lg hover:bg-[#22C55E]/20 transition-all
                  disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save & Recompute"}
              </button>
              {saveMessage && (
                <span className="text-[11px] text-[#EAB308]">{saveMessage}</span>
              )}
            </div>
          </form>

          {/* Existing cost inputs summary */}
          {costInputs.length > 0 && (
            <div className="max-w-[480px]">
              <p className="text-[10px] text-[#333] uppercase tracking-widest mb-2">
                Current saved inputs
              </p>
              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg divide-y divide-[#161616]">
                {costInputs.map((ci) => (
                  <div key={ci.input_id} className="flex justify-between px-3 py-2">
                    <span className="text-[11px] text-[#555] capitalize">
                      {ci.cost_type.replace(/_/g, " ")}
                      {ci.channel && <span className="text-[#333] ml-1">· {ci.channel}</span>}
                    </span>
                    <span className="text-[11px] text-[#777] font-mono">
                      {ci.value}{ci.cost_type.includes("fee") || ci.cost_type.includes("pct") ? "%" : " ₹/unit"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Suspense wrapper (required by Next.js 14 for useSearchParams) ────────────

export default function ChannelsPage() {
  return (
    <Suspense fallback={null}>
      <ChannelsPageContent />
    </Suspense>
  );
}
