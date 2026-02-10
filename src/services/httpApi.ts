import type { Api } from "./api";
import type { PlayerActionPayload } from "./api";
import type {
  Alert,
  CreateInvitationPayload,
  Goal,
  Invitation,
  Invite,
  LedgerEntry,
  Payout,
  Player,
  PlayerFiatDeposit,
  Statement,
  WalletSummary,
  War,
} from "../types";

const getBaseUrl = (): string => {
  const env = import.meta.env?.VITE_API_BASE_URL;
  if (typeof env === "string" && env.trim()) return env.replace(/\/$/, "");
  return "";
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

/** HTTP API client. Set VITE_API_BASE_URL to your backend (or mock server). */
export function createHttpApi(basePath = "/api"): Api {
  const p = (path: string) => `${basePath}${path}`;

  return {
    getWalletSummary(): Promise<WalletSummary> {
      return get<WalletSummary>(p("/wallet/summary"));
    },
    getLedger(): Promise<LedgerEntry[]> {
      return get<LedgerEntry[]>(p("/ledger"));
    },
    getPlayers(): Promise<Player[]> {
      return get<Player[]>(p("/players"));
    },
    getPlayer(id: string): Promise<Player | null> {
      return get<Player | null>(p(`/players/${encodeURIComponent(id)}`));
    },
    suspendPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
      return post<Player>(p(`/players/${encodeURIComponent(id)}/suspend`), payload);
    },
    reactivatePlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
      return post<Player>(p(`/players/${encodeURIComponent(id)}/reactivate`), payload);
    },
    restrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
      return post<Player>(p(`/players/${encodeURIComponent(id)}/restrict`), payload);
    },
    unrestrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player> {
      return post<Player>(p(`/players/${encodeURIComponent(id)}/unrestrict`), payload);
    },
    getInvites(): Promise<Invite[]> {
      return get<Invite[]>(p("/invites"));
    },
    createInvite(input: {
      channel: Invite["channel"];
      label?: string;
      expiryDays?: number;
    }): Promise<Invite> {
      return post<Invite>(p("/invites"), input);
    },
    resendInvite(inviteId: string): Promise<Invite> {
      return post<Invite>(p(`/invites/${encodeURIComponent(inviteId)}/resend`));
    },
    getInvitations(): Promise<Invitation[]> {
      return get<Invitation[]>(p("/invitations"));
    },
    createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
      return post<Invitation>(p("/invitations"), payload);
    },
    getPayouts(): Promise<Payout[]> {
      return get<Payout[]>(p("/payouts"));
    },
    approvePayout(id: string): Promise<Payout> {
      return post<Payout>(p(`/payouts/${encodeURIComponent(id)}/approve`));
    },
    declinePayout(id: string, reason: string): Promise<Payout> {
      return post<Payout>(p(`/payouts/${encodeURIComponent(id)}/decline`), { reason });
    },
    escalatePayout(id: string, payload: { notes: string; category?: string }): Promise<Payout> {
      return post<Payout>(p(`/payouts/${encodeURIComponent(id)}/escalate`), payload);
    },
    getPlayerDepositsSummary(): Promise<PlayerFiatDeposit[]> {
      return get<PlayerFiatDeposit[]>(p("/player-deposits-summary"));
    },
    getStatements(): Promise<Statement[]> {
      return get<Statement[]>(p("/statements"));
    },
    getStatement(id: string): Promise<Statement | null> {
      return get<Statement | null>(p(`/statements/${encodeURIComponent(id)}`));
    },
    getGoals(): Promise<Goal[]> {
      return get<Goal[]>(p("/goals"));
    },
    getWars(): Promise<War[]> {
      return get<War[]>(p("/wars"));
    },
    registerWar(warId: string): Promise<War | null> {
      return post<War | null>(p(`/wars/${encodeURIComponent(warId)}/register`));
    },
    getAlerts(): Promise<Alert[]> {
      return get<Alert[]>(p("/alerts"));
    },
  };
}
