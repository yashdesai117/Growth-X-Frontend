"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchChannels,
  fetchSyncStatus,
  fetchCostInputs,
  triggerSync,
  createCostInput,
  deleteCostInput,
} from "@/lib/dashboard";
import { ChannelCard } from "@/components/channels/ChannelCard";
import type { ChannelStatus, SyncStatus, CostInput } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { PlusCircle } from "lucide-react";

const SUPPORTED_CHANNELS = [
  { slug: "shopify",  label: "Shopify" },
  { slug: "amazon",   label: "Amazon" },
  { slug: "flipkart", label: "Flipkart" },
  { slug: "woocommerce", label: "WooCommerce" },
] as const;

type ChannelSlug = typeof SUPPORTED_CHANNELS[number]["slug"];

function getCostValue(inputs: CostInput[], costType: string, channel: string | null = null, sku: string | null = null): string {
  const match = inputs.find((c) => c.cost_type === costType && c.channel === channel && c.sku_identifier === sku);
  return match ? String(match.value) : "";
}

function ChannelsPageContent() {
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
  const [costInputs, setCostInputs] = useState<CostInput[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const liveChannelNames = new Set(channels.map((c) => c.channel));
  const connectedChannels = SUPPORTED_CHANNELS.filter(ch => {
    const liveCh = channels.find(c => c.channel === ch.slug);
    return liveCh?.is_connected;
  });

  const [selectedChannel, setSelectedChannel] = useState<ChannelSlug | null>(null);

  const [platformFee, setPlatformFee] = useState("");
  const [platformFeeSaving, setPlatformFeeSaving] = useState(false);
  const [platformFeeMsg, setPlatformFeeMsg] = useState("");

  const [gatewayFee, setGatewayFee] = useState("");
  const [gatewayFeeSaving, setGatewayFeeSaving] = useState(false);
  const [gatewayFeeMsg, setGatewayFeeMsg] = useState("");

  const [shippingType, setShippingType] = useState<"fixed" | "pct">("fixed");
  const [shippingCost, setShippingCost] = useState("");
  const [shippingCostSaving, setShippingCostSaving] = useState(false);
  const [shippingCostMsg, setShippingCostMsg] = useState("");

  const [adSpend, setAdSpend] = useState("");
  const [adSpendSaving, setAdSpendSaving] = useState(false);
  const [adSpendMsg, setAdSpendMsg] = useState("");

  const [packagingCost, setPackagingCost] = useState("");
  const [packagingCostSaving, setPackagingCostSaving] = useState(false);
  const [packagingCostMsg, setPackagingCostMsg] = useState("");

  const [showSkuForm, setShowSkuForm] = useState(false);
  const [newSkuId, setNewSkuId] = useState("");
  const [newSkuCost, setNewSkuCost] = useState("");
  const [newSkuType, setNewSkuType] = useState<"cogs_per_unit" | "shipping_per_order" | "packaging_per_unit">("cogs_per_unit");
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
    const poll = () => fetchSyncStatus().then(setSyncStatus).catch(() => null);
    poll();
    intervalRef.current = setInterval(poll, 10_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedChannel && connectedChannels.length > 0) {
      setSelectedChannel(connectedChannels[0].slug);
    }
  }, [connectedChannels, selectedChannel]);

  useEffect(() => {
    if (selectedChannel) {
      setPlatformFee(getCostValue(costInputs, "platform_fee_pct", selectedChannel));
      setAdSpend(getCostValue(costInputs, "ad_spend_pct", selectedChannel));
    }
    setGatewayFee(getCostValue(costInputs, "payment_gateway_fee_pct"));
    setPackagingCost(getCostValue(costInputs, "packaging_per_unit"));
    const pctShipping = getCostValue(costInputs, "shipping_pct", selectedChannel);
    if (pctShipping) {
      setShippingType("pct");
      setShippingCost(pctShipping);
    } else {
      setShippingType("fixed");
      setShippingCost(getCostValue(costInputs, "shipping_per_order", selectedChannel));
    }
  }, [selectedChannel, costInputs]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("shopify") !== "connected") return;
    const supabase = createClient();
    let settled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
    return () => { clearTimeout(fallback); subscription.unsubscribe(); };
  }, [searchParams, loadData]);

  const stubsToShow = SUPPORTED_CHANNELS.filter(s => !liveChannelNames.has(s.slug) && s.slug !== 'shopify');
  const allChannels = [
    ...channels,
    ...stubsToShow.map(s => ({
      channel: s.slug, is_connected: false, connected_at: null, last_synced_at: null,
      sync_status: null, records_in_db: 0, next_scheduled_sync_at: null
    }))
  ];

  const enrichedChannels = allChannels.map((ch) => {
    if (syncStatus?.sync_jobs?.length) {
      const job = syncStatus.sync_jobs.find((j) => j.channel === ch.channel);
      if (job) return { ...ch, sync_status: job.status, last_synced_at: job.completed_at };
    }
    return ch;
  });

  const handleSyncNow = async (channel: string) => {
    if (!["shopify", "amazon"].includes(channel)) return;
    setSyncing(channel);
    try {
      await triggerSync(channel);
      setTimeout(() => { setSyncing(null); loadData(); }, 3000);
    } catch { setSyncing(null); }
  };

  const handleSaveField = async (cost_type: string, valueStr: string, channel: string | null, sku_identifier: string | null, setSaving: (v: boolean) => void, setMsg: (v: string) => void) => {
    setSaving(true); setMsg("");
    try {
      const val = parseFloat(valueStr || "0");
      if (isNaN(val) || val < 0) throw new Error("Invalid number");
      const today = new Date().toISOString().slice(0, 10);
      await createCostInput({ cost_type, channel, sku_identifier, value: val, effective_from: today });
      setMsg("✓");
      setTimeout(() => setMsg(""), 2000);
      loadData();
    } catch (err) {
      setMsg(err instanceof Error ? `Error: ${err.message}` : "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDeleteSku = async (id: string) => {
    if (!window.confirm("Delete this override?")) return;
    try {
      await deleteCostInput(id);
      loadData();
    } catch (err) { alert("Failed to delete"); }
  };

  const handleAddSkuOverride = async () => {
    if (!newSkuId || !newSkuCost) return;
    handleSaveField(newSkuType, newSkuCost, selectedChannel, newSkuId, setSkuSaving, setSkuMsg);
    setNewSkuId("");
    setNewSkuCost("");
  };

  const skuOverrides = costInputs.filter(c => c.sku_identifier !== null && c.channel === selectedChannel);

return (
    <div className="flex flex-col min-h-screen pb-12">
      <div className="flex items-center px-8 py-6 border-b border-neutral-200/60 sticky top-0 bg-white/80 backdrop-blur-md z-10 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Channels & Costs</h1>
      </div>

      <div className="p-8 space-y-10 max-w-[1280px] mx-auto w-full">
        {error && (
          <div className="px-5 py-4 bg-red-50 border border-red-200/60 rounded-xl shadow-sm text-sm font-medium text-red-800">{error}</div>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sales Channels</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Shopify is live. Additional channels are coming soon.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {enrichedChannels.map((ch) => {
              const isComingSoon = ["woocommerce", "flipkart"].includes(ch.channel) && !ch.is_connected;
              return (
                <div key={ch.channel} className={isComingSoon ? "relative" : "relative"}>
                  <ChannelCard
                    channel={ch}
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
                          if (envelope.status !== "success") throw new Error(envelope.error?.message || "Failed");
                          if (envelope.data?.redirect_url) {
                            window.location.href = envelope.data.redirect_url;
                          }
                        }).catch((err) => alert("Failed to initiate Shopify connection. " + err.message));
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
                          const envelope = await apiClient("/api/v1/channels/amazon/connect/direct", {
                            method: "POST",
                            body: JSON.stringify({
                              seller_id: sellerId.trim(),
                              refresh_token: refreshToken.trim(),
                            }),
                          });
                          if (envelope.status !== "success") throw new Error(envelope.error?.message || "Failed");
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
                        const envelope = await apiClient(`/api/v1/channels/${ch.channel}/disconnect`, {
                          method: "DELETE",
                        });
                        if (envelope.status !== "success") throw new Error(envelope.error?.message || "Failed to disconnect");
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
                  {isComingSoon && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"><span className="text-xs font-bold text-slate-400 mt-2">Coming soon</span></div>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cost Inputs</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">These values are used for margin calculations. All fields are optional.</p>
          </div>
          <div className="bg-white border border-neutral-200/60 shadow-sm rounded-2xl p-8 space-y-8 max-w-[700px]">
            {connectedChannels.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-neutral-200">Connect a channel to configure cost inputs.</p>
            ) : (
              <>
                {/* GLOBAL COSTS */}
                <div className="space-y-6">
                  <div className="space-y-4 border-b border-neutral-100 pb-6">
                    <label className="text-sm font-extrabold text-slate-900 block">Global Costs</label>
                    <p className="text-xs text-slate-500 font-medium -mt-2 leading-relaxed">These apply to all orders, across all channels.</p>
                    {/* Payment Gateway */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Payment Gateway Fee</label>
                        <div className="relative">
                          <input type="number" step="0.01" min="0" placeholder="2.00" value={gatewayFee} onChange={e => setGatewayFee(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"/>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                        </div>
                      </div>
                      <button onClick={() => handleSaveField("payment_gateway_fee_pct", gatewayFee, null, null, setGatewayFeeSaving, setGatewayFeeMsg)} disabled={gatewayFeeSaving} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all">{gatewayFeeSaving ? "..." : "Save"}{gatewayFeeMsg && <span className="text-xs font-bold text-emerald-600 self-center ml-2">{gatewayFeeMsg}</span>}</button>
                    </div>
                     {/* Packaging Cost */}
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Packaging Cost</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                          <input type="number" step="0.01" min="0" placeholder="0.00" value={packagingCost} onChange={e => setPackagingCost(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-xl pl-8 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"/>
                        </div>
                      </div>
                      <button onClick={() => handleSaveField("packaging_per_unit", packagingCost, null, null, setPackagingCostSaving, setPackagingCostMsg)} disabled={packagingCostSaving} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all">{packagingCostSaving ? "..." : "Save"}{packagingCostMsg && <span className="text-xs font-bold text-emerald-600 self-center ml-2">{packagingCostMsg}</span>}</button>
                    </div>
                  </div>
                </div>
                
                {/* CHANNEL-SPECIFIC COSTS */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-extrabold text-slate-900 block">Channel-Specific Costs</label>
                    <select value={selectedChannel || ""} onChange={(e) => setSelectedChannel(e.target.value as ChannelSlug)} className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:bg-slate-50 cursor-pointer shadow-sm transition-all">
                      {connectedChannels.map(ch => (<option key={ch.slug} value={ch.slug}>{ch.label}</option>))}
                    </select>
                  </div>
                   {/* Platform Fee */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Platform & Referral Fees</label>
                      <div className="relative">
                        <input type="number" step="0.01" min="0" placeholder="2.00" value={platformFee} onChange={e => setPlatformFee(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"/>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                      </div>
                    </div>
                    <button onClick={() => handleSaveField("platform_fee_pct", platformFee, selectedChannel, null, setPlatformFeeSaving, setPlatformFeeMsg)} disabled={platformFeeSaving} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all">{platformFeeSaving ? "..." : "Save"}{platformFeeMsg && <span className="text-xs font-bold text-emerald-600 self-center ml-2">{platformFeeMsg}</span>}</button>
                  </div>
                   {/* Ad Spend */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Blended Ad Spend</label>
                      <div className="relative">
                        <input type="number" step="0.01" min="0" placeholder="10.00" value={adSpend} onChange={e => setAdSpend(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-xl pl-4 pr-8 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all"/>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                      </div>
                    </div>
                    <button onClick={() => handleSaveField("ad_spend_pct", adSpend, selectedChannel, null, setAdSpendSaving, setAdSpendMsg)} disabled={adSpendSaving} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all">{adSpendSaving ? "..." : "Save"}{adSpendMsg && <span className="text-xs font-bold text-emerald-600 self-center ml-2">{adSpendMsg}</span>}</button>
                  </div>
                  {/* Shipping Costs */}
                  <div className="flex items-end gap-3">
                     <div className="flex-1">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Shipping Cost</label>
                        <div className="flex gap-4 mb-3">
                           <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="shippingType" value="fixed" checked={shippingType === "fixed"} onChange={() => setShippingType("fixed")} className="accent-emerald-500 w-4 h-4"/><span className="text-sm font-bold text-slate-700">Per Order (₹)</span></label>
                           <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="shippingType" value="pct" checked={shippingType === "pct"} onChange={() => setShippingType("pct")} className="accent-emerald-500 w-4 h-4"/><span className="text-sm font-bold text-slate-700">% of Revenue</span></label>
                        </div>
                        <div className="relative">
                           {shippingType === "fixed" ? (<span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>) : null}
                           <input type="number" step="0.01" min="0" placeholder="0.00" value={shippingCost} onChange={e => setShippingCost(e.target.value)} className={`w-full bg-white border border-neutral-200 rounded-xl py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all ${shippingType === 'fixed' ? 'pl-8 pr-4' : 'pl-4 pr-8'}`}/>
                           {shippingType === "pct" ? (<span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>) : null}
                        </div>
                     </div>
                     <button onClick={() => { const cType = shippingType === "fixed" ? "shipping_per_order" : "shipping_pct"; handleSaveField(cType, shippingCost, selectedChannel, null, setShippingCostSaving, setShippingCostMsg); }} disabled={shippingCostSaving} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all">{shippingCostSaving ? "..." : "Save"}{shippingCostMsg && <span className="text-xs font-bold text-emerald-600 self-center ml-2">{shippingCostMsg}</span>}</button>
                  </div>
                </div>

                {/* SKU Overrides */}
                <div className="pt-6 border-t border-neutral-100">
                    <h3 className="text-sm font-extrabold text-slate-900 block mb-2">SKU-Specific Cost Overrides</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">For products with unique COGS or shipping (e.g., heavy/bulky items).</p>
                    {skuOverrides.length > 0 && (
                      <div className="mb-4 space-y-2 border border-neutral-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        {skuOverrides.map(o => (
                          <div key={o.input_id} className="flex items-center justify-between p-3 text-sm border-b border-neutral-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-medium w-36 truncate" title={o.cost_type.replace(/_/g, ' ')}>{o.cost_type.replace(/_/g, ' ')}</span>
                              <span className="text-slate-900 font-bold font-mono px-2 py-0.5 bg-slate-100 rounded-md">{o.sku_identifier}</span>
                              <span className="text-emerald-600 font-black font-mono ml-2">₹{Number(o.value).toFixed(2)}</span>
                            </div>
                            <button onClick={() => handleDeleteSku(o.input_id)} className="text-slate-400 hover:text-red-600 px-2 font-bold cursor-pointer transition-colors">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!showSkuForm ? (
                      <button onClick={() => setShowSkuForm(true)} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors"><PlusCircle size={16}/> Add SKU override</button>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-neutral-200/60 rounded-xl mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-900">New SKU Override</span>
                           <button onClick={() => setShowSkuForm(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <select value={newSkuType} onChange={(e) => setNewSkuType(e.target.value as any)} className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm"><option value="cogs_per_unit">COGS (per unit)</option><option value="shipping_per_order">Shipping (per order)</option><option value="packaging_per_unit">Packaging (per unit)</option></select>
                           <input type="text" placeholder="SKU ID (e.g. TS-SUMMER)" value={newSkuId} onChange={e => setNewSkuId(e.target.value)} className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm"/>
                        </div>
                        <div className="flex gap-3">
                           <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                              <input type="number" step="0.01" min="0" placeholder="Cost" value={newSkuCost} onChange={e => setNewSkuCost(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm"/>
                           </div>
                           <button onClick={handleAddSkuOverride} disabled={skuSaving} className="px-6 py-2 bg-emerald-600 border border-emerald-700 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all">{skuSaving ? "..." : "Add"}{skuMsg && <span className="text-xs font-bold text-emerald-100 self-center ml-2">{skuMsg}</span>}</button>
                        </div>
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ChannelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChannelsPageContent />
    </Suspense>
  );
}