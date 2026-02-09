/**
 * Mock agent API (wallet, ledger, invites, statements, goals, wars, alerts).
 * Returns Promises with latency; matches real API response structures.
 */

import type { Invite, LedgerEntry } from "../../types";
import * as state from "./state";
import { delay } from "./delay";

export const agentMock = {
  async getWalletSummary() {
    await delay(320);
    return state.wallet;
  },

  /** Simulate deposit credited (for conversion health refresh after "I have sent USDT"). */
  async creditAgentDeposit(amount: number) {
    await delay(200);
    state.setWallet({
      ...state.wallet,
      available: state.wallet.available + amount,
      total: state.wallet.total + amount,
    });
  },

  async requestWithdrawal(payload: { toAddress: string; amount: number; note?: string; agentId?: string; network?: string }) {
    await delay(400);
    const { toAddress, amount, note } = payload;
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (amount > state.wallet.available) throw new Error("Insufficient available balance");
    const refId = "wd_" + Math.random().toString(36).slice(2, 10);
    const newAvailable = Math.round((state.wallet.available - amount) * 100) / 100;
    const newTotal = Math.round((state.wallet.total - amount) * 100) / 100;
    state.setWallet({
      ...state.wallet,
      available: newAvailable,
      total: newTotal,
    });
    const entry: LedgerEntry = {
      id: "led_" + Math.random().toString(36).slice(2, 8),
      at: new Date().toISOString(),
      type: "Agent Withdrawal",
      description: note?.trim() ? `Agent Withdrawal to ${toAddress.slice(0, 8)}… – ${note.trim()}` : `Agent Withdrawal to ${toAddress.slice(0, 8)}…`,
      amount: -amount,
      balanceAfter: newAvailable,
      refId,
    };
    state.setLedger([entry, ...state.ledger]);
    return { withdrawalId: refId, reference: refId, status: "Submitted" };
  },

  async getLedger() {
    await delay(350);
    return state.ledger;
  },

  async getInvites() {
    await delay(300);
    return state.invites;
  },

  async createInvite(input: { channel: Invite["channel"]; label?: string; expiryDays?: number }) {
    await delay(350);
    const newInv: Invite = {
      id: "inv_" + Math.random().toString(36).slice(2, 6),
      channel: input.channel,
      label: input.label,
      status: "Pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (input.expiryDays ?? 7) * 86400000).toISOString(),
      link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2),
    };
    state.setInvites([newInv, ...state.invites]);
    return newInv;
  },

  async resendInvite(inviteId: string) {
    await delay(300);
    const inv = state.invites.find((i) => i.id === inviteId);
    if (!inv) throw new Error("Invite not found");
    const updated = {
      ...inv,
      status: "Pending" as const,
      link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2),
    };
    state.setInvites(state.invites.map((i) => (i.id === inviteId ? updated : i)));
    return updated;
  },

  async getPlayerDepositsSummary() {
    await delay(280);
    return state.playerDeposits;
  },

  async getStatements() {
    await delay(300);
    return state.statements;
  },

  async getStatement(id: string) {
    await delay(250);
    return state.statements.find((s) => s.id === id) ?? null;
  },

  async getGoals() {
    await delay(280);
    return state.goals;
  },

  async getWars() {
    await delay(280);
    return state.wars;
  },

  async registerWar(warId: string) {
    await delay(350);
    const w = state.wars.find((x) => x.id === warId);
    if (!w) return null;
    if (w.registered) return w;
    const updated = { ...w, registered: true };
    state.setWars(state.wars.map((x) => (x.id === warId ? updated : x)));
    state.setWallet({
      ...state.wallet,
      available: state.wallet.available - w.entryFee,
      locked: state.wallet.locked + w.entryFee,
      total: state.wallet.total,
    });
    state.setLedger([
      {
        id: "led_" + Math.random().toString(36).slice(2, 8),
        at: new Date().toISOString(),
        type: "War Entry Lock",
        description: `War Entry Lock – ${w.name}`,
        amount: -w.entryFee,
        balanceAfter: state.wallet.available,
        refId: w.id,
      },
      ...state.ledger,
    ]);
    return updated;
  },

  async getAlerts() {
    await delay(200);
    return state.alerts;
  },
};
