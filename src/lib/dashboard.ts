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
 *   deleteCostInput        → DELETE /api/v1/tenant/cost-inputs/{id}
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
 */
export async function fetchSkuList(params: {
  limit: number;
  cursor?: string;
  sort_by: string;
  sort_dir: string;
}): Promise<SkuList> {
  const query = new URLSearchParams({
    sort_by: params.sort_by,
    sort_dir: params.sort_dir,
    limit: String(params.limit),
  });
  if (params.cursor) query.set("cursor", params.cursor);
  const env = await apiClient<SkuList>(`/api/v1/dashboard/skus?${query.toString()}`);
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
  sku_identifier?: string | null;
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

export async function deleteCostInput(inputId: string): Promise<void> {
  const env = await apiClient(`/api/v1/tenant/cost-inputs/${inputId}`, {
    method: "DELETE",
  });
  if (env.status !== "success") {
    throw new Error(env.error?.message ?? "Failed to delete cost input");
  }
}
