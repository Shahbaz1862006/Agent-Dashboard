import type { Alert, CreateInvitationPayload, Goal, Invitation, Invite, LedgerEntry, Payout, Player, PlayerFiatDeposit, Statement, WalletSummary, War } from "../types";

/** Payload for suspend/reactivate player actions (reason + audit). */
export type PlayerActionPayload = { reason: string; actedBy: string; actedAt: string };

export type WithdrawalPayload = {
  toAddress: string;
  amount: number;
  note?: string;
  agentId?: string;
  network?: string;
};

export type WithdrawalResult = {
  withdrawalId: string;
  reference: string;
  status: string;
};

export type Api = {
  getWalletSummary(): Promise<WalletSummary>;
  /** Mock only: simulate deposit credited to wallet (no-op in real API). */
  creditAgentDeposit?(amount: number): Promise<void>;
  requestWithdrawal?(payload: WithdrawalPayload): Promise<WithdrawalResult>;
  getLedger(): Promise<LedgerEntry[]>;
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  suspendPlayer(id: string, payload: PlayerActionPayload): Promise<Player>;
  reactivatePlayer(id: string, payload: PlayerActionPayload): Promise<Player>;
  restrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player>;
  unrestrictPlayer(id: string, payload: PlayerActionPayload): Promise<Player>;
  getInvites(): Promise<Invite[]>;
  createInvite(input: { channel: Invite["channel"]; label?: string; expiryDays?: number }): Promise<Invite>;
  resendInvite(inviteId: string): Promise<Invite>;
  getInvitations(): Promise<Invitation[]>;
  createInvitation(payload: CreateInvitationPayload): Promise<Invitation>;
  getPayouts(): Promise<Payout[]>;
  approvePayout(id: string): Promise<Payout>;
  declinePayout(id: string, reason: string): Promise<Payout>;
  escalatePayout(id: string, payload: { notes: string; category?: string }): Promise<Payout>;
  getPlayerDepositsSummary(): Promise<PlayerFiatDeposit[]>;
  getStatements(): Promise<Statement[]>;
  getStatement(id: string): Promise<Statement | null>;
  getGoals(): Promise<Goal[]>;
  getWars(): Promise<War[]>;
  registerWar(warId: string): Promise<War | null>;
  getAlerts(): Promise<Alert[]>;
};
