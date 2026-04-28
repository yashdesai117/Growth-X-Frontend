"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderRecord, CatalogOrdersResponse } from "@/types/api";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export default function OrdersPage() {
  const [items, setItems] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        limit: "10"
      });
      if (channel !== "all") q.append("channel", channel);
      if (currentCursor) q.append("cursor", currentCursor);

      const res = await apiClient<CatalogOrdersResponse>(`/api/v1/catalog/orders?${q}`);

      if (res.status === "success" && res.data) {
        setItems(res.data.orders);
        setNextCursor(res.data.next_cursor);
        setHasMore(res.data.has_more);
      }
    } catch (e) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [channel, currentCursor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      </div>

      <Tabs value={channel} onValueChange={(val) => { 
        setChannel(val); 
        setPageIndex(0); 
        setCursorHistory([]); 
      }} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Channels</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="amazon">Amazon</TabsTrigger>
        </TabsList>
      </Tabs>

      <OrdersTable items={items} isLoading={isLoading} />

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
