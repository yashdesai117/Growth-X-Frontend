"use client";

import { useState, useEffect, useCallback } from "react";
import { CatalogSku } from "@/types/api";
import { SkuSummaryCards } from "@/components/skus/SkuSummaryCards";
import { SkuTable } from "@/components/skus/SkuTable";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SkusPage() {
  const [items, setItems] = useState<CatalogSku[]>([]);
  const [totalSkus, setTotalSkus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [channel, setChannel] = useState<string>("all");
  const [showMissingData, setShowMissingData] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        page_size: "50"
      });
      if (channel !== "all") q.append("channel", channel);
      if (showMissingData) q.append("has_missing_data", "true");

      const res = await apiClient<{ items: CatalogSku[]; total: number; page_size: number }>(`/api/v1/skus/?${q}`);

      if (res.status === "success" && res.data) {
        setItems(res.data.items);
        setTotalSkus(res.data.total);
        setTotalPages(Math.ceil(res.data.total / res.data.page_size) || 1);
      }
    } catch (e) {
      toast.error("Failed to load SKUs");
    } finally {
      setIsLoading(false);
    }
  }, [channel, showMissingData, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncSkus = async () => {
    setIsSyncing(true);
    try {
      const res = await apiClient<{ sync_job_ids: string[] }>("/api/v1/skus/trigger-sku-sync", {
        method: 'POST'
      });
      if (res.status === "success") {
        toast.success("SKU sync triggered. This may take a few minutes.");
      } else {
        toast.error(res.error?.message || "Failed to trigger SKU sync");
      }
    } catch (e) {
      toast.error("Network error triggering sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSku = (updatedSku: CatalogSku) => {
    setItems(items.map(sku => sku.catalog_sku_id === updatedSku.catalog_sku_id ? updatedSku : sku));
    // Optionally update summary cards data but the re-fetch will do it or we can keep it simple
  };

  const filteredItems = items.filter(item => 
    item.canonical_sku_code?.toLowerCase().includes(search.toLowerCase()) || 
    item.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">SKU Catalog</h1>
        <button
          onClick={handleSyncSkus}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSyncing && <Loader2 className="animate-spin" size={16} />}
          {isSyncing ? "Syncing..." : "Sync SKUs"}
        </button>
      </div>

      <SkuSummaryCards items={items} totalSkus={totalSkus} />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search SKUs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
        />
        <select
          value={channel}
          onChange={(e) => { setChannel(e.target.value); setPage(1); }}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Channels</option>
          <option value="shopify">Shopify Only</option>
          <option value="amazon">Amazon Only</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border rounded px-3 py-2 cursor-pointer hover:bg-slate-100">
          <input
            type="checkbox"
            checked={showMissingData}
            onChange={(e) => { setShowMissingData(e.target.checked); setPage(1); }}
            className="rounded text-emerald-600 focus:ring-emerald-500"
          />
          Missing COGS
        </label>
      </div>

      <SkuTable items={filteredItems} isLoading={isLoading} onUpdateSku={handleUpdateSku} />

      {!isLoading && items.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
