import { defineStore } from "pinia";
import type { WithdrawalPayload } from "../services/api";
import { api } from "../services/client";

const REQUIRED_PREFUND_USDT = 2000;

export type WalletHealthStatus = "HEALTHY" | "BLOCKED";

export const useWalletHealthStore = defineStore("walletHealth", {
  state: (): {
    availableBalanceUSDT: number;
    lockedBalanceUSDT: number;
    requiredPrefundUSDT: number;
    blockedConversionsCount: number;
    pendingPlayerDepositsCount: number;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
  } => ({
    availableBalanceUSDT: 0,
    lockedBalanceUSDT: 0,
    requiredPrefundUSDT: REQUIRED_PREFUND_USDT,
    blockedConversionsCount: 0,
    pendingPlayerDepositsCount: 0,
    loading: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    isConversionBlocked(state): boolean {
      return state.blockedConversionsCount > 0;
    },
    topUpRequiredUSDT(state): number {
      const gap = state.requiredPrefundUSDT - state.availableBalanceUSDT;
      return Math.max(0, gap);
    },
    healthStatus(state): WalletHealthStatus {
      return state.blockedConversionsCount > 0 ? "BLOCKED" : "HEALTHY";
    },
  },

  actions: {
    async fetchWalletHealth() {
      this.loading = true;
      this.error = null;
      try {
        const summary = await api.getWalletSummary();
        this.availableBalanceUSDT = summary.available;
        this.lockedBalanceUSDT = summary.locked;
        this.requiredPrefundUSDT = REQUIRED_PREFUND_USDT;
        this.blockedConversionsCount = summary.available < REQUIRED_PREFUND_USDT ? 1 : 0;
        this.pendingPlayerDepositsCount = this.blockedConversionsCount > 0 ? 1 : 0;
        this.lastUpdated = new Date().toISOString();
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load wallet health";
      } finally {
        this.loading = false;
      }
    },
    async refreshWalletAfterDeposit() {
      await this.fetchWalletHealth();
    },

    async requestWithdrawal(payload: WithdrawalPayload) {
      if (typeof api.requestWithdrawal !== "function") throw new Error("Withdrawal not available");
      const result = await api.requestWithdrawal(payload);
      await this.fetchWalletHealth();
      return result;
    },
  },
});
