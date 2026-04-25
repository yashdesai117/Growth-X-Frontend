/**
 * src/types/api.ts
 *
 * Standard response types for all FastAPI backend API calls.
 * Field names MUST exactly match the JSON keys returned by the backend.
 *
 * Rules (Domain 2):
 *   - All API response types imported from here — never inline at the call site
 *   - Must exactly match the Python ResponseEnvelope in app/modules/api/schemas.py
 */

export interface ErrorDetail {
  /** Machine-readable error code e.g. "SYNC_ALREADY_RUNNING" */
  code: string;
  /** Human-readable description for display */
  message: string;
}

export interface ResponseEnvelope<T> {
  status: "success" | "error";
  /** The actual payload on success, null on error */
  data: T | null;
  /** Error detail on failure, null on success */
  error: ErrorDetail | null;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** UUID generated per request by the backend */
  request_id: string;
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────
// GET /api/v1/dashboard/summary
// Returns aggregate totals for the date range. No prior-period deltas.

export interface DashboardSummary {
  total_revenue: number;
  total_costs: number;
  total_contribution_margin: number;
  /** Revenue-weighted average CM%. Null if no revenue in range. */
  avg_contribution_margin_pct: number | null;
  total_units_sold: number;
  total_units_returned: number;
  return_rate_pct: number;
  anomaly_count: number;
  skus_with_missing_data: number;
  date_from: string;
  date_to: string;
  channel: string | null;
}

// ─── Margin Trend ─────────────────────────────────────────────────────────────
// GET /api/v1/dashboard/trends
// Returns daily aggregated CM time-series for charting.

export interface TrendPoint {
  date: string;
  net_revenue: number;
  total_costs: number;
  contribution_margin: number;
  /** Null if net_revenue for that day is 0. */
  contribution_margin_pct: number | null;
  units_sold: number;
  anomaly_count: number;
}

export interface MarginTrend {
  series: TrendPoint[];
  date_from: string;
  date_to: string;
  channel: string | null;
}

// ─── SKU Row (shared shape for /dashboard/skus response items) ────────────────
// Used by both TopSkus (overview) and SkuList (skus page).
// Field names match backend exactly — note "total_" prefix and "avg_" prefix.

export interface SkuRow {
  platform_sku_id: string;
  canonical_sku_code: string | null;
  product_name: string | null;
  channel: string;
  total_units_sold: number;
  total_units_returned: number;
  return_rate_pct: number;
  total_gross_revenue: number;
  total_net_revenue: number;
  total_contribution_margin: number;
  /** Revenue-weighted average CM%. Null if total_net_revenue is 0. */
  avg_contribution_margin_pct: number | null;
  has_missing_data: boolean;
  is_anomaly: boolean;
}

// Keep SkuSummary as alias for overview SKUTable component
export type SkuSummary = SkuRow;

// Keep SkuListItem as alias for skus page SKUListTable component
export type SkuListItem = SkuRow;

// ─── Top SKUs ─────────────────────────────────────────────────────────────────
// Built client-side from 2 calls to GET /api/v1/dashboard/skus

export interface TopSkus {
  top_skus: SkuRow[];
  bottom_skus: SkuRow[];
}

// ─── SKU List (paginated) ─────────────────────────────────────────────────────
// GET /api/v1/dashboard/skus

export interface SkuList {
  skus: SkuRow[];
  next_cursor: string | null;
  has_more: boolean;
  total_skus: number;
  date_from: string;
  date_to: string;
  channel: string | null;
}

// ─── Channels ─────────────────────────────────────────────────────────────────
// GET /api/v1/channels

export interface ChannelStatus {
  channel: string;
  is_connected: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  sync_status: string | null;
  records_in_db: number;
  next_scheduled_sync_at: string | null;
}

export interface ChannelsList {
  channels: ChannelStatus[];
}

// ─── Sync ─────────────────────────────────────────────────────────────────────
// GET /api/v1/sync/status
// POST /api/v1/sync/trigger

export interface SyncJob {
  sync_job_id: string;
  channel: string;
  status: string;
  records_fetched: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string | null;
}

export interface SyncStatus {
  sync_jobs: SyncJob[];
}

// ─── Insights ─────────────────────────────────────────────────────────────────
// GET /api/v1/insights/
// PATCH /api/v1/insights/{insight_id}/dismiss

export interface InsightItem {
  insight_id: string;
  insight_type: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  action_recommendation: string | null;
  affected_channel: string | null;
  affected_sku_id: string | null;
  is_dismissed: boolean;
  generated_at: string;
}

export interface InsightsList {
  items: InsightItem[];
  next_cursor: string | null;
  total_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

// ─── Cost Inputs ──────────────────────────────────────────────────────────────
// GET /api/v1/tenant/cost-inputs
// POST /api/v1/tenant/cost-inputs

export interface CostInput {
  input_id: string;
  channel: string | null;
  sku_identifier: string | null;
  cost_type: string;
  value: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
}

export interface CostInputsList {
  cost_inputs: CostInput[];
}
