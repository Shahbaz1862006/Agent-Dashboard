import type { Api } from "./api";
import type { PlayerActionPayload } from "./api";
import type { Invitation, Invite, PlayerFiatDeposit } from "../types";
import type { CreateInvitationPayload } from "../types";
import {
  makeAlerts,
  makeGoals,
  makeInvites,
  makeLedger,
  makePlayers,
  makePayouts,
  makeStatements,
  makeWalletSummary,
  makeWars,
} from "../data/mockData";

let players = makePlayers();
let wallet = makeWalletSummary();
let ledger = makeLedger();
let invites = makeInvites();
let payouts = makePayouts(players);
let statements = makeStatements();
let goals = makeGoals();
let wars = makeWars();
let alerts = makeAlerts();

function sleep(ms = 350) {
  return new Promise((r) => setTimeout(r, ms));
}

export const mockApi: Api = {
  async getWalletSummary() {
    await sleep();
    return wallet;
  },
  async getLedger() {
    await sleep();
    return ledger;
  },
  async getPlayers() {
    await sleep();
    return players;
  },
  async getPlayer(id: string) {
    await sleep();
    return players.find((p) => p.id === id) ?? null;
  },
  async suspendPlayer(id: string, payload: PlayerActionPayload) {
    await sleep();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const updated = { ...players[idx], status: "Suspended" as const, lastStatusChangeReason: payload.reason, lastStatusChangedAt: payload.actedAt, lastStatusChangedBy: payload.actedBy };
    players = players.map((p) => (p.id === id ? updated : p));
    return updated;
  },
  async reactivatePlayer(id: string, payload: PlayerActionPayload) {
    await sleep();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const updated = { ...players[idx], status: "Active" as const, lastStatusChangeReason: payload.reason, lastStatusChangedAt: payload.actedAt, lastStatusChangedBy: payload.actedBy };
    players = players.map((p) => (p.id === id ? updated : p));
    return updated;
  },
  async restrictPlayer(id: string, payload: PlayerActionPayload) {
    await sleep();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const updated = { ...players[idx], status: "Restricted" as const, lastStatusChangeReason: payload.reason, lastStatusChangedAt: payload.actedAt, lastStatusChangedBy: payload.actedBy };
    players = players.map((p) => (p.id === id ? updated : p));
    return updated;
  },
  async unrestrictPlayer(id: string, payload: PlayerActionPayload) {
    await sleep();
    const idx = players.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Player not found");
    const updated = { ...players[idx], status: "Active" as const, lastStatusChangeReason: payload.reason, lastStatusChangedAt: payload.actedAt, lastStatusChangedBy: payload.actedBy };
    players = players.map((p) => (p.id === id ? updated : p));
    return updated;
  },
  async getInvites() {
    await sleep();
    return invites;
  },
  async createInvite(input) {
    await sleep();
    const newInv: Invite = {
      id: "inv_" + Math.random().toString(36).slice(2, 6),
      channel: input.channel,
      label: input.label,
      status: "Pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (input.expiryDays ?? 7) * 86400000).toISOString(),
      link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2),
    };
    invites = [newInv, ...invites];
    return newInv;
  },
  async resendInvite(inviteId: string) {
    await sleep();
    const inv = invites.find((i) => i.id === inviteId);
    if (!inv) throw new Error("Invite not found");
    const updated = { ...inv, status: "Pending" as const, link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2) };
    invites = invites.map((i) => (i.id === inviteId ? updated : i));
    return updated;
  },
  async getInvitations() {
    await sleep();
    return [];
  },
  async createInvitation(payload: CreateInvitationPayload) {
    await sleep();
    const inv: Invitation = {
      id: "invitation_" + Math.random().toString(36).slice(2, 8),
      firstName: payload.firstName,
      lastName: payload.lastName,
      contacts: payload.contacts,
      status: "PENDING",
      invitationCode: payload.invitationCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    return inv;
  },
  async getPayouts() {
    await sleep();
    return payouts;
  },
  async approvePayout(id: string) {
    await sleep();
    const idx = payouts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = payouts[idx];
    const updated = { ...p, status: "Approved" as const, timeline: [...(p.timeline || []), { at: new Date().toISOString(), status: "Approved", note: "Approved" }] };
    payouts = payouts.map((x) => (x.id === id ? updated : x));
    return updated;
  },
  async declinePayout(id: string, reason: string) {
    await sleep();
    const idx = payouts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = payouts[idx];
    const updated = { ...p, status: "Declined" as const, declineMessage: reason, timeline: [...(p.timeline || []), { at: new Date().toISOString(), status: "Declined", note: reason }] };
    payouts = payouts.map((x) => (x.id === id ? updated : x));
    return updated;
  },
  async escalatePayout(id: string, payload: { notes: string; category?: string }) {
    await sleep();
    const idx = payouts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Payout not found");
    const p = payouts[idx];
    const updated = { ...p, status: "Escalate" as const, timeline: [...(p.timeline || []), { at: new Date().toISOString(), status: "Escalated", note: payload.notes }] };
    payouts = payouts.map((x) => (x.id === id ? updated : x));
    return updated;
  },
  async getPlayerDepositsSummary(): Promise<PlayerFiatDeposit[]> {
    await sleep();
    return [];
  },
  async getStatements() {
    await sleep();
    return statements;
  },
  async getStatement(id: string) {
    await sleep();
    return statements.find((s) => s.id === id) ?? null;
  },
  async getGoals() {
    await sleep();
    return goals;
  },
  async getWars() {
    await sleep();
    return wars;
  },
  async registerWar(warId: string) {
    await sleep();
    const w = wars.find((x) => x.id === warId);
    if (!w) return null;
    if (w.registered) return w;
    const updated = { ...w, registered: true };
    wars = wars.map((x) => (x.id === warId ? updated : x));
    // lock wallet and ledger
    wallet = { ...wallet, available: wallet.available - w.entryFee, locked: wallet.locked + w.entryFee, total: wallet.total };
    ledger = [
      {
        id: "led_" + Math.random().toString(36).slice(2, 8),
        at: new Date().toISOString(),
        type: "War Entry Lock",
        description: `War Entry Lock – ${w.name}`,
        amount: -w.entryFee,
        balanceAfter: wallet.available,
        refId: w.id,
      },
      ...ledger,
    ];
    return updated;
  },
  async getAlerts() {
    await sleep(200);
    return alerts;
  },
};
