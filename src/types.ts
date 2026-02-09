export type Money = number;

export type KycTier = "Tier A" | "Tier B" | "Tier C";
/** Player account status. Only these 3 values allowed in Players section. */
export type PlayerStatus = "Active" | "Suspended" | "Restricted";
export type InviteStatus = "Pending" | "Accepted" | "Expired" | "Failed";
/** Payout Requests: only these four statuses. No other values allowed. */
export type PayoutStatus = "Pending" | "Approved" | "Declined" | "Escalate";
export type PayoutMethod = "Crypto" | "Fiat";
export type LedgerType =
  | "Agent Deposit"
  | "Agent Withdrawal"
  | "Commission Credit"
  | "Player Deposit Conversion"
  | "Credit Reclaim"
  | "War Entry Lock"
  | "War Entry Release"
  | "Bonus Pool Co-fund";

export type Player = {
  id: string;
  name: string;
  username: string;
  kycTier: KycTier;
  status: PlayerStatus;
  riskScore: number; // 0-100
  lastActive: string;
  balanceAvailable: Money;
  balancePending: Money;
  balanceLocked: Money;
  /** Audit: last suspend/reactivate reason and meta */
  lastStatusChangeReason?: string;
  lastStatusChangedAt?: string;
  lastStatusChangedBy?: string;
};

export type Invite = {
  id: string;
  label?: string;
  channel: "Email" | "WhatsApp" | "Telegram" | "SMS" | "Copy";
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
  acceptedByPlayerId?: string;
  link: string;
};

export type Payout = {
  id: string;
  playerId: string;
  playerName: string;
  amount: Money;
  method: PayoutMethod;
  /** Pending = awaiting decision. New requests start as Pending. */
  status?: PayoutStatus;
  requestedAt: string;
  destinationMasked: string;
  txHash?: string;
  timeline: { at: string; status: string; note?: string }[];
  /** Message to user when agent declines (required for Declined). */
  declineMessage?: string;
};

export type LedgerEntry = {
  id: string;
  at: string;
  type: LedgerType;
  description: string;
  amount: Money; // + credit / - debit
  balanceAfter?: Money;
  refId: string;
};

export type Statement = {
  id: string;
  weekLabel: string;
  status: "Paid" | "Pending" | "Adjusted";
  ggr: Money;
  ngr: Money;
  commissionRate: number;
  adjustments: Money;
  finalPayout: Money;
  paidAt?: string;
  ledgerRefId: string;
};

export type WalletSummary = {
  available: Money;
  locked: Money;
  total: Money;
};

/** Source wallet for agent deposit: manual entry or Coinductor-connected */
export type SourceWalletType = "MANUAL" | "COINDUCTOR";

export type SourceWalletInfo = {
  address: string;
  type: SourceWalletType;
  verified: boolean;
};

/** Status of a deposit attempt (existing logic) */
export type DepositAttemptStatus = "PENDING" | "CONFIRMED" | "FAILED";

/** Each deposit attempt records declared source wallet + casino address */
export type DepositAttempt = {
  id: string;
  agentId: string;
  sourceWalletAddress: string;
  sourceWalletType: SourceWalletType;
  sourceWalletVerified: boolean;
  casinoDepositAddress: string;
  status: DepositAttemptStatus;
  createdAt: string;
  needsManualReview?: boolean;
  actualSenderWallet?: string;
};

/** Per-agent trusted wallet (saved for quick reuse) */
export type TrustedWallet = {
  address: string;
  verified: boolean;
  firstUsedAt: string;
  lastUsedAt: string;
};

export type Goal = {
  id: string;
  type: "Individual" | "Clan-wide" | "All-member";
  title: string;
  description: string;
  progress: number; // 0-100
  remainingLabel: string;
};

export type War = {
  id: string;
  name: string;
  status: "Upcoming" | "Active" | "Past";
  startsAt: string;
  endsAt: string;
  entryFee: Money;
  opponent: string;
  registered: boolean;
  scoreYou: number;
  scoreThem: number;
};

export type Alert = {
  id: string;
  severity: "High" | "Medium" | "Low";
  title: string;
  description: string;
  deepLink: string;
};

/** Player fiat deposit (Fiat→USDT) for Deposits Summary widget. */
export type PlayerFiatDeposit = {
  id: string;
  playerId: string;
  playerName: string;
  fiatAmount: string;
  usdtAmount: Money;
  status: "Pending" | "Completed" | "Failed";
  at: string;
};

// --- Invitations module (firstName, lastName, multi-method contacts) ---
export type InvitationStatus = "PENDING" | "COMPLETED";
export type InvitationMethod = "EMAIL" | "WHATSAPP" | "PHONE" | "TELEGRAM";

export type InvitationContact = {
  method: InvitationMethod;
  value: string;
};

export type Invitation = {
  id: string;
  firstName: string;
  lastName: string;
  contacts: InvitationContact[];
  status: InvitationStatus;
  invitationCode: string;
  createdAt: string;
  expiresAt: string;
};

export type CreateInvitationPayload = {
  firstName: string;
  lastName: string;
  contacts: InvitationContact[];
  invitationCode: string;
};

/** Support ticket created when a payout is escalated. */
export type PayoutEscalationTicket = {
  id: string;
  payoutId: string;
  notes: string;
  category?: string;
  createdAt: string;
};

/** Draft invite shown in confirmation dialog before final POST. */
export type InvitationDraft = {
  firstName: string;
  lastName: string;
  contacts: InvitationContact[];
  invitationCode: string;
  createdAt: string;
  expiresAt: string;
};
