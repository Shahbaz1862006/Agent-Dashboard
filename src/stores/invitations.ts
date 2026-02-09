import { defineStore } from "pinia";
import type { CreateInvitationPayload, Invitation, InvitationDraft } from "../types";
import { api } from "../services/client";

export const useInvitationsStore = defineStore("invitations", {
  state: (): {
    invitations: Invitation[];
    draftInvite: InvitationDraft | null;
    loading: boolean;
    error: string | null;
  } => ({
    invitations: [],
    draftInvite: null,
    loading: false,
    error: null,
  }),

  getters: {
    pendingCount(): number {
      return this.invitations.filter((i) => i.status === "PENDING").length;
    },
    completedCount(): number {
      return this.invitations.filter((i) => i.status === "COMPLETED").length;
    },
    getInvitationById(): (id: string) => Invitation | undefined {
      return (id: string) => this.invitations.find((i) => i.id === id);
    },
    existingInvitationCodes(): string[] {
      return this.invitations.map((i) => i.invitationCode).filter(Boolean);
    },
  },

  actions: {
    setDraft(draft: InvitationDraft | null) {
      this.draftInvite = draft;
    },
    clearDraft() {
      this.draftInvite = null;
    },

    async fetchInvitations() {
      this.loading = true;
      this.error = null;
      try {
        this.invitations = await api.getInvitations();
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to load invitations";
      } finally {
        this.loading = false;
      }
    },

    async createInvitation(payload: CreateInvitationPayload): Promise<Invitation | null> {
      this.loading = true;
      this.error = null;
      try {
        const invitation = await api.createInvitation(payload);
        this.invitations = [invitation, ...this.invitations];
        return invitation;
      } catch (e) {
        this.error = e instanceof Error ? e.message : "Failed to create invitation";
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
