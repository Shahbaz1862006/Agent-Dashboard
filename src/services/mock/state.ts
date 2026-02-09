/**
 * Shared mutable state for mock APIs. Simulates backend state.
 * Only used when VITE_USE_MOCK_API is true.
 */

import type { Invite, Player, PlayerStatus, Payout, PayoutEscalationTicket, PayoutStatus } from "../../types";
import {
  makeAlerts,
  makeGoals,
  makeInvites,
  makeLedger,
  makePlayers,
  makePayouts,
  makePlayerDeposits,
  makeStatements,
  makeWalletSummary,
  makeWars,
} from "../../data/mockData";

const PAYOUTS_LS_KEY = "clazino_payouts_v2";
const ESCALATIONS_LS_KEY = "clazino_payout_escalations_v1";
const PLAYERS_LS_KEY = "clazino_players_v1";

const ALLOWED_PLAYER_STATUSES: PlayerStatus[] = ["Active", "Suspended", "Restricted"];

function migratePlayerStatus(legacy: string | undefined): PlayerStatus {
  if (!legacy) return "Active";
  const s = legacy.trim();
  if (ALLOWED_PLAYER_STATUSES.includes(s as PlayerStatus)) return s as PlayerStatus;
  if (s.toLowerCase() === "frozen") return "Suspended";
  return "Active";
}

function loadPlayers(): Player[] | null {
  try {
    const raw = localStorage.getItem(PLAYERS_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Player[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map((p) => ({
      ...p,
      status: migratePlayerStatus((p as { status?: string }).status),
    }));
  } catch {
    return null;
  }
}

function migratePayoutStatus(legacy: string | undefined): PayoutStatus | undefined {
  if (!legacy) return "Pending";
  const s = legacy.toLowerCase();
  if (["pending"].includes(s)) return "Pending";
  if (["approved", "processing", "paid", "completed"].includes(s)) return "Approved";
  if (["declined", "failed"].includes(s)) return "Declined";
  if (["escalated", "escalate"].includes(s)) return "Escalate";
  return "Pending";
}

function loadPayouts(): Payout[] | null {
  try {
    const raw = localStorage.getItem(PAYOUTS_LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Payout[];
    if (!Array.isArray(parsed)) return null;
    return parsed.map((p) => {
      const status = migratePayoutStatus((p as { status?: string }).status);
      return { ...p, status };
    });
  } catch {
    return null;
  }
}

function loadEscalations(): PayoutEscalationTicket[] {
  try {
    const raw = localStorage.getItem(ESCALATIONS_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PayoutEscalationTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export let players: Player[] = loadPlayers() ?? makePlayers();
export let wallet = makeWalletSummary();
export let ledger = makeLedger();
export let invites = makeInvites();

function getInitialPayouts(): Payout[] {
  const loaded = loadPayouts();
  if (loaded !== null) return loaded;
  const seed = makePayouts(players);
  try {
    localStorage.setItem(PAYOUTS_LS_KEY, JSON.stringify(seed));
  } catch {
    // ignore
  }
  return seed;
}

export let payouts: Payout[] = getInitialPayouts();
export let escalationTickets: PayoutEscalationTicket[] = loadEscalations();
export let playerDeposits = makePlayerDeposits(players);
export let statements = makeStatements();
export let goals = makeGoals();
export let wars = makeWars();
export let alerts = makeAlerts();

export function setPayouts(next: Payout[]) {
  payouts = next;
  try {
    localStorage.setItem(PAYOUTS_LS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function addEscalationTicket(ticket: PayoutEscalationTicket) {
  escalationTickets = [...escalationTickets, ticket];
  try {
    localStorage.setItem(ESCALATIONS_LS_KEY, JSON.stringify(escalationTickets));
  } catch {
    // ignore
  }
}

export function setInvites(next: Invite[]) {
  invites = next;
}

export function setWallet(next: typeof wallet) {
  wallet = next;
}

export function setLedger(next: typeof ledger) {
  ledger = next;
}

export function setWars(next: typeof wars) {
  wars = next;
}

export function setPlayers(next: Player[]) {
  players = next;
  try {
    localStorage.setItem(PLAYERS_LS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
