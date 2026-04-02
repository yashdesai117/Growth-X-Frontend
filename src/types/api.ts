/**
 * src/types/api.ts
 *
 * Standard response types for all FastAPI backend API calls.
 *
 * Rules (Domain 2):
 *   - All API response types imported from here — never inline the shape at the call site
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
