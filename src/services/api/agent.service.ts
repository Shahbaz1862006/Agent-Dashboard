/**
 * Agent/domain API service (wallet, ledger, invites, statements, goals, wars, alerts).
 * Used when VITE_USE_MOCK_API is false.
 */

import type { WithdrawalPayload, WithdrawalResult } from "../api";
import type { Alert, Goal, Invite, LedgerEntry, PlayerFiatDeposit, Statement, WalletSummary, War } from "../../types";
import { get, post } from "./http.client";

const BASE = "/api";

export const agentService = {
  getWalletSummary(): Promise<WalletSummary> {
    return get<WalletSummary>(`${BASE}/wallet/summary`);
  },
  requestWithdrawal(payload: WithdrawalPayload): Promise<WithdrawalResult> {
    return post<WithdrawalResult>(`${BASE}/agent/wallet/withdraw`, {
      ...payload,
      network: payload.network ?? "TRON_TR20",
      createdAt: new Date().toISOString(),
    });
  },
  getLedger(): Promise<LedgerEntry[]> {
    return get<LedgerEntry[]>(`${BASE}/ledger`);
  },
  getPlayerDepositsSummary(): Promise<PlayerFiatDeposit[]> {
    return get<PlayerFiatDeposit[]>(`${BASE}/player-deposits-summary`);
  },
  getInvites(): Promise<Invite[]> {
    return get<Invite[]>(`${BASE}/invites`);
  },
  createInvite(input: { channel: Invite["channel"]; label?: string; expiryDays?: number }): Promise<Invite> {
    return post<Invite>(`${BASE}/invites`, input);
  },
  resendInvite(inviteId: string): Promise<Invite> {
    return post<Invite>(`${BASE}/invites/${encodeURIComponent(inviteId)}/resend`);
  },
  getStatements(): Promise<Statement[]> {
    return get<Statement[]>(`${BASE}/statements`);
  },
  getStatement(id: string): Promise<Statement | null> {
    return get<Statement | null>(`${BASE}/statements/${encodeURIComponent(id)}`);
  },
  getGoals(): Promise<Goal[]> {
    return get<Goal[]>(`${BASE}/goals`);
  },
  getWars(): Promise<War[]> {
    return get<War[]>(`${BASE}/wars`);
  },
  registerWar(warId: string): Promise<War | null> {
    return post<War | null>(`${BASE}/wars/${encodeURIComponent(warId)}/register`);
  },
  getAlerts(): Promise<Alert[]> {
    return get<Alert[]>(`${BASE}/alerts`);
  },
};
