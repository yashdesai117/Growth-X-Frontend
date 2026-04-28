"use client";

import { useState, useEffect, useCallback } from "react";
import { RawListing, CatalogListingsResponse } from "@/types/api";
import { SkuTable } from "@/components/skus/SkuTable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function SkusPage() {
  const [items, setItems] = useState<RawListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [channel, setChannel] = useState<string>("all");
  
  // Pagination
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const currentCursor = pageIndex === 0 ? null : cursorHistory[pageIndex - 1];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams({
        limit: "6"
      });
      if (channel !== "all") q.append("channel", channel);
      if (currentCursor) q.append("cursor", currentCursor);

      const res = await apiClient<CatalogListingsResponse>(`/api/v1/catalog/listings?${q}`);
      
      if (res.status === "success" && res.data) {
        setItems(res.data.listings);
        setNextCursor(res.data.next_cursor);
        setHasMore(res.data.has_more);
      }
    } catch (e) {
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  }, [channel, currentCursor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSyncSkus = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/skus/trigger-sku-sync`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Sync triggered. This may take a few minutes.");
      } else {
        toast.error(json.error?.message || "Failed to trigger sync");
      }
    } catch (e) {
      toast.error("Network error triggering sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNextPage = () => {
    if (!hasMore || !nextCursor) return;
    setCursorHistory(prev => {
      const newHist = [...prev];
      newHist[pageIndex] = nextCursor;
      return newHist;
    });
    setPageIndex(p => p + 1);
  };

  const handlePrevPage = () => {
    setPageIndex(p => Math.max(0, p - 1));
  };

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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={channel}
          onChange={(e) => { 
            setChannel(e.target.value); 
            setPageIndex(0); 
            setCursorHistory([]); 
          }}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Channels</option>
          <option value="shopify">Shopify Only</option>
          <option value="amazon">Amazon Only</option>
        </select>
      </div>

      <SkuTable items={items} isLoading={isLoading} />

      {!isLoading && (pageIndex > 0 || hasMore) && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {pageIndex + 1}</span>
          <button
            onClick={handleNextPage}
            disabled={!hasMore}
            className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
