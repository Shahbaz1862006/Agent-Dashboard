import { defineStore } from "pinia";
import type { Payout } from "../types";
import { api } from "../services/client";

export const usePayoutsStore = defineStore("payouts", {
  state: (): { list: Payout[]; loading: boolean; error: string | null; actionLoading: string | null } => ({
    list: [],
    loading: false,
    error: null,
    actionLoading: null,
  }),

  actions: {
    /** Fetches all payout requests (Pending, Approved, Declined, Escalate). Do not filter out Pending. */
    async fetchPayouts() {
      this.loading = true;
      this.error = null;
      try {
        this.list = await api.getPayouts();
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load payouts";
      } finally {
        this.loading = false;
      }
    },

    async approvePayout(id: string): Promise<Payout | null> {
      this.actionLoading = id;
      try {
        const updated = await api.approvePayout(id);
        await this.fetchPayouts();
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = null;
      }
    },

    async declinePayout(id: string, reason: string): Promise<Payout | null> {
      this.actionLoading = id;
      try {
        const updated = await api.declinePayout(id, reason);
        await this.fetchPayouts();
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = null;
      }
    },

    async escalatePayout(id: string, payload: { notes: string; category?: string }): Promise<Payout | null> {
      this.actionLoading = id;
      try {
        const updated = await api.escalatePayout(id, payload);
        await this.fetchPayouts();
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = null;
      }
    },
  },
});
