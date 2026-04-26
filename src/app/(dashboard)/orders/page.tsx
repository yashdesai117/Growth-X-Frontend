"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderRecord, OrdersSummary } from "@/types/api";
import { OrderSummaryCards } from "@/components/orders/OrderSummaryCards";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Assume fetchOrders and fetchOrdersSummary are defined in a lib or defined here
// For this challenge, we will just define inline fetch functions if not in lib/api.
// Actually I'll just write inline fetch functions.

export default function OrdersPage() {
  const [items, setItems] = useState<OrderRecord[]>([]);
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [channel, setChannel] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dates
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };
      
      const q = new URLSearchParams({
        page: page.toString(),
        page_size: "50"
      });
      if (channel !== "all") q.append("channel", channel);
      if (dateFrom) q.append("date_from", dateFrom);
      if (dateTo) q.append("date_to", dateTo);

      const [ordersRes, summaryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/orders/?${q}`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/orders/summary`, { headers })
      ]);

      const ordersJson = await ordersRes.json();
      const summaryJson = await summaryRes.json();

      if (ordersJson.success) {
        setItems(ordersJson.data.items);
        setTotalPages(Math.ceil(ordersJson.data.total / ordersJson.data.page_size) || 1);
      }
      if (summaryJson.success) {
        setSummary(summaryJson.data);
      }
    } catch (e) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [channel, page, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <OrderSummaryCards summary={summary} />

      <Tabs value={channel} onValueChange={(val) => { setChannel(val); setPage(1); }} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Channels</TabsTrigger>
          <TabsTrigger value="shopify">Shopify</TabsTrigger>
          <TabsTrigger value="amazon">Amazon</TabsTrigger>
        </TabsList>
      </Tabs>

      <OrdersTable items={items} isLoading={isLoading} />

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
