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

function getCostValue(inputs: CostInput[], costType: string, channel: string | null = null, sku: string | null = null): string {
  const match = inputs.find((c) => c.cost_type === costType && c.channel === channel && c.sku_identifier === sku);
  return match ? String(match.value) : "";
}

// ─── Supported Channels ───────────────────────────────────────────────────────
const SUPPORTED_CHANNELS = [
  { slug: "shopify", label: "Shopify" },
  { slug: "amazon", label: "Amazon" },
  { slug: "flipkart", label: "Flipkart" },
] as const;

type ChannelSlug = typeof SUPPORTED_CHANNELS[number]["slug"];

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

  // Deriving connected channels
  const liveChannelNames = new Set(channels.map((c) => c.channel));
  const connectedChannels = SUPPORTED_CHANNELS.filter(ch => {
    const liveCh = channels.find(c => c.channel === ch.slug);
    return liveCh?.is_connected;
  });

  const [selectedChannel, setSelectedChannel] = useState<ChannelSlug | null>(null);

  // Field states
  const [platformFee, setPlatformFee] = useState("");
  const [platformFeeSaving, setPlatformFeeSaving] = useState(false);
  const [platformFeeMsg, setPlatformFeeMsg] = useState("");

  const [gatewayFee, setGatewayFee] = useState("");
  const [gatewayFeeSaving, setGatewayFeeSaving] = useState(false);
  const [gatewayFeeMsg, setGatewayFeeMsg] = useState("");

  const [logisticsType, setLogisticsType] = useState<"per_order" | "pct">("per_order");
  const [logisticsVal, setLogisticsVal] = useState("");
  const [logisticsSaving, setLogisticsSaving] = useState(false);
  const [logisticsMsg, setLogisticsMsg] = useState("");

  const [adSpend, setAdSpend] = useState("");
  const [adSpendSaving, setAdSpendSaving] = useState(false);
  const [adSpendMsg, setAdSpendMsg] = useState("");

  const [packagingCost, setPackagingCost] = useState("");
  const [packagingCostSaving, setPackagingCostSaving] = useState(false);
  const [packagingCostMsg, setPackagingCostMsg] = useState("");

  const [skuOverridesExpanded, setSkuOverridesExpanded] = useState(false);
  const [newSkuId, setNewSkuId] = useState("");
  const [newSkuCost, setNewSkuCost] = useState("");
  const [newSkuType, setNewSkuType] = useState<"logistics_per_order" | "logistics_pct">("logistics_per_order");
  const [skuSaving, setSkuSaving] = useState(false);
  const [skuMsg, setSkuMsg] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [ch, ci] = await Promise.all([fetchChannels(), fetchCostInputs()]);
      setChannels(ch.channels);
      setCostInputs(ci.cost_inputs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Set default selected channel
  useEffect(() => {
    if (!selectedChannel && connectedChannels.length > 0) {
      setSelectedChannel(connectedChannels[0].slug);
    }
  }, [connectedChannels, selectedChannel]);

  useEffect(() => {
    if (selectedChannel) {
      setPlatformFee(getCostValue(costInputs, "platform_fee_pct", selectedChannel, null));
      setAdSpend(getCostValue(costInputs, "ad_spend_pct", selectedChannel, null));
    }

    setGatewayFee(getCostValue(costInputs, "payment_gateway_fee_pct", null, null));
    setPackagingCost(getCostValue(costInputs, "packaging_per_unit", null, null));

    const pctLogistics = getCostValue(costInputs, "logistics_pct", null, null);
    if (pctLogistics) {
      setLogisticsType("pct");
      setLogisticsVal(pctLogistics);
    } else {
      const flatLogistics = getCostValue(costInputs, "logistics_per_order", null, null);
      setLogisticsType("per_order");
      setLogisticsVal(flatLogistics);
    }
  }, [selectedChannel, costInputs]);

  // Auth Re-hydrate Waiter
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("shopify") !== "connected") return;

    const supabase = createClient();
    let settled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && !settled) {
          settled = true;
          subscription.unsubscribe();
          loadData();
        }
      }
    );

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

  const stubsToShow = STUB_CHANNELS.filter((s) => !liveChannelNames.has(s.channel));
  const allChannels = [...channels, ...stubsToShow];

  const enrichedChannels = allChannels.map((ch) => {
    if (syncStatus?.sync_jobs?.length) {
      const job = syncStatus.sync_jobs.find((j) => j.channel === ch.channel);
      if (job) {
        return { ...ch, sync_status: job.status, last_synced_at: job.completed_at };
      }
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

  const handleSaveField = async (
    cost_type: string,
    valueStr: string,
    channel: string | null,
    sku_identifier: string | null,
    setSaving: (v: boolean) => void,
    setMsg: (v: string) => void
  ) => {
    setSaving(true);
    setMsg("");
    try {
      const val = parseFloat(valueStr || "0");
      if (isNaN(val) || val < 0) throw new Error("Invalid number");
      const today = new Date().toISOString().slice(0, 10);

      await createCostInput({
        cost_type,
        channel,
        sku_identifier,
        value: val,
        effective_from: today
      });
      setMsg("✅");
      setTimeout(() => setMsg(""), 3000);
      loadData();
    } catch (err) {
      setMsg(err instanceof Error ? `Error: ${err.message}` : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSku = async (id: string) => {
    if (!window.confirm("Delete this override?")) return;
    try {
      await apiClient(`/api/v1/tenant/cost-inputs/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleAddSkuOverride = async () => {
    if (!newSkuId || !newSkuCost) return;
    handleSaveField(newSkuType, newSkuCost, null, newSkuId, setSkuSaving, setSkuMsg);
    setNewSkuId("");
    setNewSkuCost("");
  };

  return (
    <div className="flex flex-col min-h-screen">
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
                        // if (ch.channel === "amazon") {
                        //   try {
                        //     const envelope = await apiClient<{ redirect_url: string }>(
                        //       "/api/v1/channels/amazon/connect/initiate",
                        //       { method: "POST" }
                        //     );
                        //     if (envelope.data?.redirect_url) {
                        //       window.location.href = envelope.data.redirect_url;
                        //     }
                        //   } catch (err) {
                        //     alert(
                        //       err instanceof Error
                        //         ? `Failed to initiate Amazon connection: ${err.message}`
                        //         : "Failed to connect Amazon. Please try again."
                        //     );
                        //   }
                        // }
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
                      onDisconnect={async () => {
                        const confirmed = window.confirm(
                          `Disconnect ${ch.channel}?\n\nYour historical data will be preserved, but future syncs will stop.`
                        );
                        if (!confirmed) return;
                        try {
                          await apiClient(`/api/v1/channels/${ch.channel}/disconnect`, {
                            method: "DELETE",
                          });
                          await loadData();
                        } catch (err) {
                          alert(
                            err instanceof Error
                              ? `Failed to disconnect: ${err.message}`
                              : "Failed to disconnect. Please try again."
                          );
                        }
                      }}
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
            <h2 className="text-[12px] font-medium text-[#888]">Cost Inputs</h2>
            <p className="text-[11px] text-[#444] mt-0.5">
              These apply to your orders for contribution margin calculation.
            </p>
          </div>

          <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-5 space-y-6 max-w-[480px]">

            {connectedChannels.length === 0 ? (
              <p className="text-[12px] text-[#888]">Connect a channel above to configure its cost inputs.</p>
            ) : (
              <>
                {/* Channel Selector */}
                <div className="space-y-1.5 border-b border-[#1E1E1E] pb-4">
                  <label className="text-[11px] text-[#666] font-medium block">Channel</label>
                  <select
                    value={selectedChannel || ""}
                    onChange={(e) => setSelectedChannel(e.target.value as ChannelSlug)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5
                    text-[13px] text-white outline-none focus:border-[#3A3A3A] hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    {connectedChannels.map(ch => (
                      <option key={ch.slug} value={ch.slug}>{ch.label}</option>
                    ))}
                  </select>
                </div>

                {/* SECTION 1: Platform & Referral Fees */}
                <div className="space-y-1.5 border-b border-[#1E1E1E] pb-4">
                  <label className="text-[11px] text-white font-medium block">Platform & Referral Fees</label>
                  <p className="text-[10px] text-[#666] mb-2 leading-relaxed">
                    Shopify: ~2% | Amazon: 5–15% (varies by category) | Flipkart: 10–20%
                  </p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number" step="0.01" min="0" placeholder="2.00"
                        value={platformFee} onChange={e => setPlatformFee(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-3 pr-7 py-2 text-[13px] text-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">%</span>
                    </div>
                    <button onClick={() => handleSaveField("platform_fee_pct", platformFee, selectedChannel, null, setPlatformFeeSaving, setPlatformFeeMsg)} disabled={platformFeeSaving} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[12px] text-white hover:bg-[#222]">
                      {platformFeeSaving ? "Saving..." : "Save"}
                    </button>
                    {platformFeeMsg && <span className="text-[11px] text-[#EF4444] self-center">{platformFeeMsg}</span>}
                  </div>
                </div>

                {/* SECTION 4: Ad Spend */}
                <div className="space-y-1.5 border-b border-[#1E1E1E] pb-4">
                  <label className="text-[11px] text-white font-medium block">Ad Spend</label>
                  <p className="text-[10px] text-[#666] mb-2 leading-relaxed">
                    Enter your blended ad spend for {connectedChannels.find(c => c.slug === selectedChannel)?.label} — include Meta, Google, and any marketplace ads attributed to this channel. Per-SKU attribution is not supported.
                  </p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number" step="0.01" min="0" placeholder="10.00"
                        value={adSpend} onChange={e => setAdSpend(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-3 pr-7 py-2 text-[13px] text-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">%</span>
                    </div>
                    <button onClick={() => handleSaveField("ad_spend_pct", adSpend, selectedChannel, null, setAdSpendSaving, setAdSpendMsg)} disabled={adSpendSaving} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[12px] text-white hover:bg-[#222]">
                      {adSpendSaving ? "Saving..." : "Save"}
                    </button>
                    {adSpendMsg && <span className="text-[11px] text-[#EF4444] self-center">{adSpendMsg}</span>}
                  </div>
                </div>
              </>
            )}

            {/* SECTION 2: Payment Gateway Fee (Global) */}
            <div className="space-y-1.5 border-b border-[#1E1E1E] pb-4">
              <label className="text-[11px] text-white font-medium block">Payment Gateway Fee</label>
              <p className="text-[10px] text-[#666] mb-2 leading-relaxed">
                Razorpay: 2% | PayU: 1.9% | Cashfree: 1.75%
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="number" step="0.01" min="0" placeholder="2.00"
                    value={gatewayFee} onChange={e => setGatewayFee(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-3 pr-7 py-2 text-[13px] text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">%</span>
                </div>
                <button onClick={() => handleSaveField("payment_gateway_fee_pct", gatewayFee, null, null, setGatewayFeeSaving, setGatewayFeeMsg)} disabled={gatewayFeeSaving} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[12px] text-white hover:bg-[#222]">
                  {gatewayFeeSaving ? "Saving..." : "Save"}
                </button>
                {gatewayFeeMsg && <span className="text-[11px] text-[#EF4444] self-center">{gatewayFeeMsg}</span>}
              </div>
            </div>

            {/* SECTION 5: Packaging Cost (Global) */}
            <div className="space-y-1.5 border-b border-[#1E1E1E] pb-4">
              <label className="text-[11px] text-white font-medium block">Packaging Cost</label>
              <div className="flex gap-3 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">₹</span>
                  <input
                    type="number" step="0.01" min="0" placeholder="0.00"
                    value={packagingCost} onChange={e => setPackagingCost(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg pl-7 pr-3 py-2 text-[13px] text-white"
                  />
                </div>
                <button onClick={() => handleSaveField("packaging_per_unit", packagingCost, null, null, setPackagingCostSaving, setPackagingCostMsg)} disabled={packagingCostSaving} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[12px] text-white hover:bg-[#222]">
                  {packagingCostSaving ? "Saving..." : "Save"}
                </button>
                {packagingCostMsg && <span className="text-[11px] text-[#EF4444] self-center">{packagingCostMsg}</span>}
              </div>
            </div>

            {/* SECTION 3: Logistics / Shipping Costs */}
            <div className="space-y-2">
              <label className="text-[11px] text-white font-medium block">Logistics / Shipping Costs</label>
              <p className="text-[10px] text-[#666] mb-2 leading-relaxed">
                Typical range for Indian D2C: 8–15% of revenue
              </p>
              <div className="flex gap-4 mb-3">
                <label className="text-[11px] text-white flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={logisticsType === "per_order"} onChange={() => setLogisticsType("per_order")} className="accent-[#22C55E]" />
                  Per Order (₹)
                </label>
                <label className="text-[11px] text-white flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={logisticsType === "pct"} onChange={() => setLogisticsType("pct")} className="accent-[#22C55E]" />
                  % of Revenue
                </label>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  {logisticsType === "per_order" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">₹</span>}
                  <input
                    type="number" step="0.01" min="0" placeholder={logisticsType === "per_order" ? "0.00" : "15.00"}
                    value={logisticsVal} onChange={e => setLogisticsVal(e.target.value)}
                    className={`w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg py-2 text-[13px] text-white ${logisticsType === "per_order" ? "pl-7 pr-3" : "pl-3 pr-7"}`}
                  />
                  {logisticsType === "pct" && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] text-sm">%</span>}
                </div>
                <button
                  onClick={() => handleSaveField(logisticsType === "per_order" ? "logistics_per_order" : "logistics_pct", logisticsVal, null, null, setLogisticsSaving, setLogisticsMsg)}
                  disabled={logisticsSaving} className="px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[12px] text-white hover:bg-[#222]">
                  {logisticsSaving ? "Saving..." : "Save"}
                </button>
                {logisticsMsg && <span className="text-[11px] text-[#EF4444] self-center">{logisticsMsg}</span>}
              </div>

              {/* 3b SKU overrides */}
              <div className="pt-2">
                <button onClick={() => setSkuOverridesExpanded(!skuOverridesExpanded)} className="text-[11px] text-[#22C55E] hover:underline">
                  {skuOverridesExpanded ? "− Hide SKU-specific overrides" : "＋ Add SKU-specific override"}
                </button>

                {skuOverridesExpanded && (
                  <div className="mt-3 bg-[#0D0D0D] p-3 rounded-lg border border-[#1E1E1E]">
                    <p className="text-[10px] text-[#666] mb-3">Use this for heavy or bulky SKUs where shipping cost differs from your average.</p>

                    {costInputs.filter(c => c.sku_identifier !== null && ["logistics_per_order", "logistics_pct"].includes(c.cost_type)).length > 0 && (
                      <div className="divide-y divide-[#1A1A1A] mb-3">
                        {costInputs.filter(c => c.sku_identifier !== null && ["logistics_per_order", "logistics_pct"].includes(c.cost_type)).map(c => (
                          <div key={c.input_id} className="flex justify-between items-center py-2 text-[11px]">
                            <span className="text-white font-mono">{c.sku_identifier}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#888]">{c.value} {c.cost_type === 'logistics_pct' ? '%' : '₹'}</span>
                              <button onClick={() => handleDeleteSku(c.input_id)} className="text-[#EF4444] hover:underline">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input placeholder="SKU ID" value={newSkuId} onChange={e => setNewSkuId(e.target.value)} className="flex-1 bg-[#111] border border-[#2A2A2A] rounded md:px-2 py-1 text-[11px] text-white" />
                      <input placeholder="Cost" type="number" step="0.01" value={newSkuCost} onChange={e => setNewSkuCost(e.target.value)} className="w-16 bg-[#111] border border-[#2A2A2A] rounded md:px-2 py-1 text-[11px] text-white" />
                      <select value={newSkuType} onChange={(e: any) => setNewSkuType(e.target.value)} className="bg-[#111] border border-[#2A2A2A] rounded cursor-pointer text-[11px] text-white px-1">
                        <option value="logistics_per_order">₹</option>
                        <option value="logistics_pct">%</option>
                      </select>
                      <button onClick={handleAddSkuOverride} disabled={skuSaving} className="px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded text-[11px]">
                        {skuSaving ? "..." : "Add"}
                      </button>
                    </div>
                    {skuMsg && <p className="text-[10px] text-[#EF4444] mt-1">{skuMsg}</p>}
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  return (
    <Suspense fallback={null}>
      <ChannelsPageContent />
    </Suspense>
  );
}
