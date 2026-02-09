/**
 * Single source of truth for ALL badges/chips across the dashboard.
 * Same status → same variant + label everywhere. Use getStatusVariant + getStatusLabel only.
 */

export type BadgeVariant = "success" | "warning" | "danger" | "default" | "info";

/** Same shape for ALL badges: pill, same padding, same typography */
export const BADGE_BASE_CLASS =
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium";

/** Normalize backend/case variations to a canonical key for lookup */
export function normalizeStatus(value: string): string {
  const s = String(value).trim();
  if (!s) return "Unknown";
  const upper = s.toUpperCase();
  const lower = s.toLowerCase();
  const map: Record<string, string> = {
    APPROVED: "Approved",
    DECLINED: "Declined",
    ESCALATE: "Escalate",
    ESCALATED: "Escalate",
    ACTIVE: "Active",
    FROZEN: "Frozen",
    INACTIVE: "Inactive",
    PAST: "Past",
    REJECTED: "Rejected",
    BLOCKED: "Blocked",
    SUCCESS: "Success",
    QUEUED: "Queued",
    NEW: "New",
    DRAFT: "Draft",
    DISABLED: "Disabled",
    ENABLED: "Enabled",
    REGISTERED: "Registered",
    CONFIRMED: "Confirmed",
    HEALTHY: "Healthy",
    "LOW BALANCE": "Low balance",
    "TIER A": "Tier A",
    "TIER B": "Tier B",
    "TIER C": "Tier C",
    "NOT REGISTERED": "Not registered",
    COMPLETED: "Completed",
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    PROCESSING: "Processing",
    RESTRICTED: "Restricted",
    SUSPENDED: "Suspended",
  };
  return map[upper] ?? map[lower] ?? s;
}

/** One global status → variant mapping. Same status = same color everywhere. */
export function getStatusVariant(status: string): BadgeVariant {
  const n = normalizeStatus(status);
  const success = ["Completed", "Paid", "Active", "Success", "Approved", "Healthy", "Registered", "Enabled", "Confirmed", "Tier A"];
  const warning = ["Pending", "Processing", "Inactive", "Draft", "Low balance", "Not registered", "Tier B", "Restricted"];
  const danger = ["Failed", "Frozen", "Rejected", "Blocked", "Tier C", "Declined", "Suspended"];
  const info = ["New", "Queued", "Escalate"];
  if (success.includes(n)) return "success";
  if (warning.includes(n)) return "warning";
  if (danger.includes(n)) return "danger";
  if (info.includes(n)) return "info";
  return "default";
}

/** Human-readable label for display. Always include text; do not rely on color only. */
export function getStatusLabel(status: string): string {
  return normalizeStatus(status);
}

/** For numeric thresholds (e.g. risk score): variant by value */
export function getNumericVariant(value: number, thresholds: { danger: number; warning: number }): BadgeVariant {
  if (value >= thresholds.danger) return "danger";
  if (value >= thresholds.warning) return "warning";
  return "success";
}

/** Consistent gap between multiple badges/chips in one cell (e.g. table) */
export const BADGE_GROUP_GAP = "gap-1.5";
