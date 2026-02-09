/**
 * Mock payouts API. Only four statuses: Pending, Approved, Declined, Escalate.
 * Actions available only when status is Pending.
 */

import type { Payout, PayoutStatus } from "../../types";
import * as state from "./state";
import { delay } from "./delay";

function isActionable(p: Payout): boolean {
  return p.status === undefined || p.status === "Pending";
}

export const payoutsMock = {
  async getPayouts(): Promise<Payout[]> {
    await delay(350);
    return state.payouts;
  },

  async approvePayout(id: string): Promise<Payout> {
    await delay(400);
    const list = state.payouts.slice();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = list[idx];
    if (!isActionable(p)) throw new Error("Payout cannot be approved");
    const now = new Date().toISOString();
    const timeline = [...(p.timeline || []), { at: now, status: "Approved", note: "Agent approved; payout executed" }];
    list[idx] = {
      ...p,
      status: "Approved" as PayoutStatus,
      timeline,
      txHash: p.txHash ?? "0x" + Math.random().toString(16).slice(2, 18),
    };
    state.setPayouts(list);
    return list[idx];
  },

  async declinePayout(id: string, reason: string): Promise<Payout> {
    await delay(400);
    const list = state.payouts.slice();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = list[idx];
    if (!isActionable(p)) throw new Error("Payout cannot be declined");
    const now = new Date().toISOString();
    const timeline = [...(p.timeline || []), { at: now, status: "Declined", note: reason }];
    list[idx] = {
      ...p,
      status: "Declined" as PayoutStatus,
      timeline,
      declineMessage: reason,
      actedAt: now,
      actedBy: "agent_mock",
    };
    state.setPayouts(list);
    return list[idx];
  },

  async escalatePayout(id: string, payload: { notes: string; category?: string }): Promise<Payout> {
    await delay(400);
    const list = state.payouts.slice();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = list[idx];
    if (!isActionable(p)) throw new Error("Payout cannot be escalated");
    const now = new Date().toISOString();
    const ticketId = "TKT-" + Date.now();
    state.addEscalationTicket({
      id: ticketId,
      payoutId: id,
      notes: payload.notes,
      category: payload.category,
      createdAt: now,
    });
    const timeline = [...(p.timeline || []), { at: now, status: "Escalate", note: `Support ticket ${ticketId}: ${payload.notes}` }];
    list[idx] = { ...p, status: "Escalate" as PayoutStatus, timeline };
    state.setPayouts(list);
    return list[idx];
  },
};
