/**
 * Permission store – role-based access control.
 * Source of truth: PDFs (Agent Dashboard wireframe, Player Management, Wallet, Invite, Payout, etc.)
 * Agent role: assigned players only, invite, earnings, wallet, payouts (read-only), reclaim under rules.
 */

import { defineStore } from "pinia";
import { computed } from "vue";
import { useAuthStore } from "./auth";

/** Permissions derived from PDFs – Agent authority matrix */
export type Permission =
  | "view_dashboard"
  | "view_wallet"
  | "deposit_usdt"
  | "view_ledger"
  | "view_players"
  | "view_player_detail"
  | "reclaim_credit"
  | "view_invites"
  | "create_invite"
  | "resend_invite"
  | "view_payouts"
  | "approve_payout"
  | "decline_payout"
  | "escalate_payout"
  | "view_commissions"
  | "view_clan_goals"
  | "view_clan_wars"
  | "register_war"
  | "cofund_bonus"
  | "view_settings"
  | "view_alerts"
  | "suspend_player"
  | "reactivate_player"
  | "restrict_player"
  | "unrestrict_player";

/** Agent has all dashboard permissions except withdraw (future) and manual credit grant. */
const AGENT_PERMISSIONS: Permission[] = [
  "view_dashboard",
  "view_wallet",
  "deposit_usdt",
  "view_ledger",
  "view_players",
  "view_player_detail",
  "reclaim_credit",
  "view_invites",
  "create_invite",
  "resend_invite",
  "view_payouts",
  "approve_payout",
  "decline_payout",
  "escalate_payout",
  "view_commissions",
  "view_clan_goals",
  "view_clan_wars",
  "register_war",
  "cofund_bonus",
  "view_settings",
  "view_alerts",
  "suspend_player",
  "reactivate_player",
  "restrict_player",
  "unrestrict_player",
];

export const usePermissionStore = defineStore("permission", () => {
  const auth = useAuthStore();

  const permissions = computed<Set<Permission>>(() => {
    if (!auth.token || !auth.user) return new Set();
    return new Set(AGENT_PERMISSIONS);
  });

  function can(permission: Permission): boolean {
    return permissions.value.has(permission);
  }

  function reset() {
    // No local state; permissions derived from auth. Logout clears auth.
  }

  return { permissions, can, reset };
});
