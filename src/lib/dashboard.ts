/**
 * src/lib/dashboard.ts
 *
 * All API fetch functions for the dashboard.
 * Pages import from here — never call apiClient() directly in pages.
 *
 * Endpoint → Backend route mapping:
 *   fetchDashboardSummary  → GET /api/v1/dashboard/summary
 *   fetchTopSkus           → GET /api/v1/dashboard/skus (×2: desc + asc by CM%)
 *   fetchMarginTrend       → GET /api/v1/dashboard/trends
 *   fetchSkuList           → GET /api/v1/dashboard/skus
 *   fetchChannels          → GET /api/v1/channels
 *   fetchSyncStatus        → GET /api/v1/sync/status
 *   triggerSync            → POST /api/v1/sync/trigger
 *   fetchInsights          → GET /api/v1/insights/
 *   dismissInsight         → PATCH /api/v1/insights/{id}/dismiss
 *   fetchCostInputs        → GET /api/v1/tenant/cost-inputs
 *   createCostInput        → POST /api/v1/tenant/cost-inputs
 */

import { apiClient } from "@/lib/api/client";
import type {
  DashboardSummary,
  TopSkus,
  MarginTrend,
  SkuList,
  SkuRow,
  ChannelsList,
  SyncStatus,
  InsightsList,
  CostInputsList,
} from "@/types/api";

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const env = await apiClient<DashboardSummary>("/api/v1/dashboard/summary");
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load summary");
  return env.data;
}

/**
 * Returns top 5 and bottom 5 SKUs by CM% using two parallel calls to
 * GET /api/v1/dashboard/skus (sort_dir=desc and sort_dir=asc).
 * The backend has no dedicated top/bottom endpoint — this is the correct approach.
 */
export async function fetchTopSkus(limit = 5): Promise<TopSkus> {
  const base = `/api/v1/dashboard/skus?sort_by=contribution_margin_pct&limit=${limit}`;
  const [topEnv, bottomEnv] = await Promise.all([
    apiClient<SkuList>(`${base}&sort_dir=desc`),
    apiClient<SkuList>(`${base}&sort_dir=asc`),
  ]);
  if (topEnv.status !== "success" || !topEnv.data) throw new Error(topEnv.error?.message ?? "Failed to load top SKUs");
  if (bottomEnv.status !== "success" || !bottomEnv.data) throw new Error(bottomEnv.error?.message ?? "Failed to load bottom SKUs");
  return {
    top_skus: topEnv.data.skus as SkuRow[],
    bottom_skus: bottomEnv.data.skus as SkuRow[],
  };
}

export async function fetchMarginTrend(): Promise<MarginTrend> {
  const env = await apiClient<MarginTrend>("/api/v1/dashboard/trends");
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load margin trend");
  return env.data;
}

/**
 * Paginated SKU list.
 * sortBy must be one of the backend's allowed columns:
 *   "contribution_margin" | "contribution_margin_pct" | "net_revenue"
 *   | "gross_revenue" | "units_sold" | "return_rate_pct"
 * sortDir: "asc" | "desc"
 */
export async function fetchSkuList(
  cursor?: string,
  sortBy = "contribution_margin_pct",
  sortDir = "asc",
  limit = 20
): Promise<SkuList> {
  const params = new URLSearchParams({
    sort_by: sortBy,
    sort_dir: sortDir,         // ← backend param is sort_dir, not sort_order
    limit: String(limit),
  });
  if (cursor) params.set("cursor", cursor);
  const env = await apiClient<SkuList>(`/api/v1/dashboard/skus?${params.toString()}`);
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load SKUs");
  return env.data;
}

export async function fetchChannels(): Promise<ChannelsList> {
  const env = await apiClient<ChannelsList>("/api/v1/channels");
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load channels");
  return env.data;
}

export async function fetchSyncStatus(): Promise<SyncStatus> {
  const env = await apiClient<SyncStatus>("/api/v1/sync/status");
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load sync status");
  return env.data;
}

export async function triggerSync(channel = "shopify"): Promise<void> {
  await apiClient("/api/v1/sync/trigger", {
    method: "POST",
    body: JSON.stringify({ channel }),
  });
}

/**
 * Trailing slash is required — backend route is @router.get("/") mounted at /insights.
 * Omitting the slash causes a 307 redirect which some fetch clients don't follow with POST.
 */
export async function fetchInsights(isDismissed = false): Promise<InsightsList> {
  const env = await apiClient<InsightsList>(`/api/v1/insights/?is_dismissed=${isDismissed}`);
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load insights");
  return env.data;
}

export async function dismissInsight(insightId: string): Promise<void> {
  await apiClient(`/api/v1/insights/${insightId}/dismiss`, { method: "PATCH" });
}

export async function fetchCostInputs(): Promise<CostInputsList> {
  const env = await apiClient<CostInputsList>("/api/v1/tenant/cost-inputs");
  if (env.status !== "success" || !env.data) throw new Error(env.error?.message ?? "Failed to load cost inputs");
  return env.data;
}

export async function createCostInput(data: {
  cost_type: string;
  value: number;
  channel?: string | null;
  effective_from?: string;
}): Promise<void> {
  const env = await apiClient("/api/v1/tenant/cost-inputs", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (env.status !== "success") {
    throw new Error(env.error?.message ?? `Failed to save ${data.cost_type}`);
  }
}
