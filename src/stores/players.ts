/**
 * Players store – list, fetch, and status actions (suspend, reactivate, restrict, unrestrict).
 * Used by Players page; updates UI immediately after each action.
 */

import { defineStore } from "pinia";
import type { Player } from "../types";
import { api } from "../services/client";
import { useAuthStore } from "./auth";

export const usePlayersStore = defineStore("players", {
  state: (): { list: Player[]; loading: boolean; error: string | null; actionLoading: boolean } => ({
    list: [],
    loading: false,
    error: null,
    actionLoading: false,
  }),

  actions: {
    async fetchPlayers() {
      this.loading = true;
      this.error = null;
      try {
        this.list = await api.getPlayers();
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load players";
      } finally {
        this.loading = false;
      }
    },

    buildPayload(reason: string) {
      const auth = useAuthStore();
      return {
        reason: reason.trim(),
        actedBy: auth.user?.name ?? auth.user?.id ?? "Agent",
        actedAt: new Date().toISOString(),
      };
    },

    setPlayer(updated: Player) {
      const idx = this.list.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        const next = [...this.list];
        next[idx] = updated;
        this.list = next;
      }
    },

    async suspendPlayer(id: string, reason: string): Promise<Player | null> {
      this.actionLoading = true;
      try {
        const payload = this.buildPayload(reason);
        const updated = await api.suspendPlayer(id, payload);
        this.setPlayer(updated);
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },

    async reactivatePlayer(id: string, reason: string): Promise<Player | null> {
      this.actionLoading = true;
      try {
        const payload = this.buildPayload(reason);
        const updated = await api.reactivatePlayer(id, payload);
        this.setPlayer(updated);
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },

    async restrictPlayer(id: string, reason: string): Promise<Player | null> {
      this.actionLoading = true;
      try {
        const payload = this.buildPayload(reason);
        const updated = await api.restrictPlayer(id, payload);
        this.setPlayer(updated);
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },

    async unrestrictPlayer(id: string, reason: string): Promise<Player | null> {
      this.actionLoading = true;
      try {
        const payload = this.buildPayload(reason);
        const updated = await api.unrestrictPlayer(id, payload);
        this.setPlayer(updated);
        return updated;
      } catch (e) {
        throw e;
      } finally {
        this.actionLoading = false;
      }
    },
  },
});
