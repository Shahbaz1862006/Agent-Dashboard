import type { Alert, Goal, Invite, LedgerEntry, Payout, Player, PlayerFiatDeposit, Statement, WalletSummary, War } from "../types";

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursAgo(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function id(prefix: string) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

const FIRST_NAMES = [
  "Adeel", "Hassan", "Zara", "Hira", "Ali", "Saad", "Mariam", "Usman", "Ayesha", "Bilal",
  "Fatima", "Omar", "Sana", "Khalid", "Layla", "Yusuf", "Nadia", "Ibrahim", "Amina", "Tariq",
  "Sara", "Rashid", "Leila", "Hamza", "Zainab", "Faisal", "Noor", "Asad", "Hana", "Jamil",
];

export function makePlayers(count = 55): Player[] {
  const tiers: Player["kycTier"][] = ["Tier A", "Tier B", "Tier C"];
  const statuses: Player["status"][] = ["Active", "Active", "Suspended", "Restricted"];
  return Array.from({ length: count }).map((_, i) => {
    const name = FIRST_NAMES[i % FIRST_NAMES.length] + " " + (i + 1);
    const status = statuses[i % statuses.length];
    const riskScore = Math.min(100, Math.max(0, (i * 7) % 98));
    const balanceAvailable = Math.round((150 + (i * 37) % 2200) * 100) / 100;
    const balancePending = i % 7 === 0 ? Math.round((50 + (i % 5) * 30) * 100) / 100 : 0;
    const balanceLocked = i % 11 === 0 ? Math.round((80 + (i % 4) * 60) * 100) / 100 : 0;
    return {
      id: "pl_" + (1000 + i),
      name,
      username: "player" + (i + 1),
      kycTier: tiers[i % tiers.length],
      status,
      riskScore,
      lastActive: hoursAgo((i * 2) % 72),
      balanceAvailable,
      balancePending,
      balanceLocked,
    };
  });
}

/** Mock wallet for Wallet Health widget (homepage). */
export function makeWalletSummary(): WalletSummary {
  return {
    available: 12_450.25,
    locked: 980.0,
    total: 13_430.25,
  };
}

export function makeLedger(): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  let balance = 11800;
  const now = new Date();

  // Player deposit conversions (last 2 weeks)
  const conversions = [
    { player: "player1010", fiat: "5,000 PKR", usdt: 18 },
    { player: "player1015", fiat: "2,500 AED", usdt: 680 },
    { player: "player1022", fiat: "100 GBP", usdt: 127 },
    { player: "player1008", fiat: "15,000 PKR", usdt: 54 },
    { player: "player1033", fiat: "200 USD", usdt: 200 },
    { player: "player1019", fiat: "8,000 INR", usdt: 96 },
    { player: "player1041", fiat: "500 AED", usdt: 136 },
    { player: "player1003", fiat: "3,000 PKR", usdt: 10.8 },
    { player: "player1027", fiat: "50 GBP", usdt: 63.5 },
    { player: "player1038", fiat: "1,200 AED", usdt: 327 },
  ];
  conversions.forEach((c, i) => {
    balance -= c.usdt;
    entries.push({
      id: id("led"),
      at: hoursAgo(4 + i * 8),
      type: "Player Deposit Conversion",
      description: `Player Deposit Conversion: ${c.player} – ${c.fiat} → ${c.usdt.toFixed(2)} USDT`,
      amount: -c.usdt,
      balanceAfter: Math.round(balance * 100) / 100,
      refId: "ref_dep_" + Math.random().toString(36).slice(2, 8),
    });
  });

  // Agent deposits
  entries.push({
    id: id("led"),
    at: hoursAgo(12),
    type: "Agent Deposit",
    description: "Agent Deposit (USDT TRC-20) – 500.00 USDT",
    amount: 500,
    balanceAfter: 13430.25,
    refId: "tx_mwf2ayeh",
  });
  entries.push({
    id: id("led"),
    at: hoursAgo(36),
    type: "Agent Deposit",
    description: "Agent Deposit (USDT TRC-20) – 1,000.00 USDT",
    amount: 1000,
    balanceAfter: 12930.25,
    refId: "tx_k8j2bxfi",
  });

  // Commission credits
  entries.push({
    id: id("led"),
    at: daysAgo(1),
    type: "Commission Credit",
    description: "Weekly Commission Credit – Statement Wk 02",
    amount: 346.5,
    balanceAfter: 11930.25,
    refId: "stmt_02",
  });
  entries.push({
    id: id("led"),
    at: daysAgo(8),
    type: "Commission Credit",
    description: "Weekly Commission Credit – Statement Wk 01",
    amount: 298.2,
    balanceAfter: 10930.25,
    refId: "stmt_01",
  });

  // War entry lock & release
  entries.push({
    id: id("led"),
    at: daysAgo(2),
    type: "War Entry Lock",
    description: "War Entry Lock – Clan War #CW-12",
    amount: -50,
    balanceAfter: 10609.7,
    refId: "war_12",
  });
  entries.push({
    id: id("led"),
    at: daysAgo(10),
    type: "War Entry Release",
    description: "War Entry Release – Clan War #CW-11 (Settled)",
    amount: 50,
    balanceAfter: 10659.7,
    refId: "war_11",
  });

  // Bonus pool co-fund
  entries.push({
    id: id("led"),
    at: daysAgo(3),
    type: "Bonus Pool Co-fund",
    description: "Clan Goals – Bonus pool co-fund 100 USDT",
    amount: -100,
    balanceAfter: 10559.7,
    refId: "cofund_01",
  });

  // Credit reclaim
  entries.push({
    id: id("led"),
    at: daysAgo(5),
    type: "Credit Reclaim",
    description: "Credit Reclaim – pl_1022 eligible locked balance released",
    amount: 85,
    balanceAfter: 10644.7,
    refId: "reclaim_01",
  });

  // Sort by date descending (newest first) and reconcile balance after
  entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  let running = 13430.25;
  for (let i = 0; i < entries.length; i++) {
    entries[i].balanceAfter = Math.round(running * 100) / 100;
    running -= entries[i].amount;
  }
  return entries;
}

export function makeInvites(): Invite[] {
  const channels: Invite["channel"][] = ["WhatsApp", "Telegram", "Email", "SMS", "Copy"];
  const statuses: Invite["status"][] = ["Pending", "Pending", "Accepted", "Accepted", "Failed", "Expired"];
  const invites: Invite[] = [];
  const labels = ["VIP Referral", "Q1 Campaign", "Partner Link", "Community", "Support", "inv_03 Copy", "inv_03 Telegram", "inv_03 Whatsapp", "Beta Tester", "Influencer", "Event 2026", "Regional PK"];

  for (let i = 0; i < 14; i++) {
    const created = new Date();
    created.setDate(created.getDate() - (i % 14));
    const expires = new Date(created);
    expires.setDate(expires.getDate() + (i % 3 === 0 ? 7 : 3));
    const status = statuses[i % statuses.length];
    const channel = channels[i % channels.length];
    invites.push({
      id: "inv_" + String(i + 1).padStart(2, "0"),
      label: labels[i % labels.length],
      channel,
      status,
      createdAt: created.toISOString(),
      expiresAt: expires.toISOString(),
      acceptedByPlayerId: status === "Accepted" ? "pl_" + (1005 + i) : undefined,
      link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2, 11),
    });
  }
  return invites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Realistic pending payout seed: exactly 3 with explicit ids (po_2001–po_2003). New requests default to Pending. */
export function makePayouts(players: Player[]): Payout[] {
  const payouts: Payout[] = [];
  const requestedBase = new Date();
  requestedBase.setHours(requestedBase.getHours() - 2);

  const pendingSeed: Array<{ id: string; amount: number; method: Payout["method"]; destSuffix: string }> = [
    { id: "po_2001", amount: 125.5, method: "Crypto", destSuffix: "8F2A" },
    { id: "po_2002", amount: 88, method: "Crypto", destSuffix: "1A7C" },
    { id: "po_2003", amount: 250, method: "Fiat", destSuffix: "1122" },
  ];

  pendingSeed.forEach((seed, i) => {
    const p = players[i % players.length];
    const requestedAt = new Date(requestedBase);
    requestedAt.setMinutes(requestedAt.getMinutes() - i * 15);
    payouts.push({
      id: seed.id,
      playerId: p.id,
      playerName: p.name,
      amount: seed.amount,
      method: seed.method,
      status: "Pending",
      requestedAt: requestedAt.toISOString(),
      destinationMasked: seed.method === "Crypto" ? "TRC20 •••• " + seed.destSuffix : "Bank •••• " + seed.destSuffix.slice(0, 4),
      timeline: [{ at: requestedAt.toISOString(), status: "Withdrawal requested", note: "Request submitted" }],
    });
  });

  const methods: Payout["method"][] = ["Crypto", "Fiat", "Crypto"];
  const statuses: Payout["status"][] = ["Approved", "Declined", "Escalate", "Approved", "Declined"];
  const amounts = [75, 200, 150, 95, 180];

  for (let i = 0; i < 8; i++) {
    const p = players[(i + 3) % players.length];
    const status = statuses[i % statuses.length];
    const reqHours = 8 + i * 6;
    const requestedAt = hoursAgo(reqHours);
    payouts.push({
      id: "po_" + (1001 + i),
      playerId: p.id,
      playerName: p.name,
      amount: amounts[i % amounts.length],
      method: methods[i % methods.length],
      status,
      requestedAt,
      destinationMasked: methods[i % methods.length] === "Crypto" ? "TRC20 •••• " + ["8F2A", "1A7C", "9B3E"][i % 3] : "Bank •••• " + (1120 + i),
      txHash: status === "Approved" ? "0x" + Math.random().toString(16).slice(2, 18) : undefined,
      timeline: [
        { at: requestedAt, status: "Withdrawal requested", note: "Request submitted" },
        { at: hoursAgo(reqHours - 1), status, note: status === "Approved" ? "Payout executed" : status === "Declined" ? "Declined by agent" : "Escalated to support" },
      ],
    });
  }

  return payouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

/** Mock statements for Commission Snapshot widget (homepage) and Commissions page. First item = latest/current. */
export function makeStatements(): Statement[] {
  return [
    { id: "stmt_current", weekLabel: "Week 06 (Mon–Sun)", status: "Paid", ggr: 14_200, ngr: 12_400, commissionRate: 0.035, adjustments: -32.5, finalPayout: 401.25, paidAt: daysAgo(0), ledgerRefId: "ref_stmt_current" },
    { id: "stmt_02", weekLabel: "Week 02 (Mon–Sun)", status: "Paid", ggr: 12_800, ngr: 11_200, commissionRate: 0.035, adjustments: -45.5, finalPayout: 346.5, paidAt: daysAgo(1), ledgerRefId: "ref_stmt_02" },
    { id: "stmt_03", weekLabel: "Week 03 (Mon–Sun)", status: "Pending", ggr: 9_400, ngr: 8_600, commissionRate: 0.03, adjustments: 0, finalPayout: 258, ledgerRefId: "ref_stmt_03" },
    { id: "stmt_01", weekLabel: "Week 01 (Mon–Sun)", status: "Paid", ggr: 10_200, ngr: 9_100, commissionRate: 0.032, adjustments: 12, finalPayout: 303.2, paidAt: daysAgo(8), ledgerRefId: "ref_stmt_01" },
    { id: "stmt_04", weekLabel: "Week 04 (Mon–Sun)", status: "Adjusted", ggr: 11_500, ngr: 10_000, commissionRate: 0.035, adjustments: -20, finalPayout: 330, paidAt: daysAgo(-5), ledgerRefId: "ref_stmt_04" },
    { id: "stmt_00", weekLabel: "Week 52 (Mon–Sun)", status: "Paid", ggr: 8_900, ngr: 7_800, commissionRate: 0.03, adjustments: 0, finalPayout: 234, paidAt: daysAgo(15), ledgerRefId: "ref_stmt_00" },
  ];
}

export function makeGoals(): Goal[] {
  return [
    { id: "g1", type: "Clan-wide", title: "Active Sessions", description: "Reach 220 total play sessions across the clan.", progress: 68, remainingLabel: "3d 14h remaining" },
    { id: "g2", type: "All-member", title: "All Members Participate", description: "Every clan member plays at least once this week.", progress: 82, remainingLabel: "3d 14h remaining" },
    { id: "g3", type: "Individual", title: "Consistency Streaks", description: "10 players hit a 3-day activity streak.", progress: 54, remainingLabel: "3d 14h remaining" },
    { id: "g4", type: "Clan-wide", title: "Weekly GGR Target", description: "Clan-wide GGR exceeds 15,000 USDT this week.", progress: 71, remainingLabel: "3d 14h remaining" },
    { id: "g5", type: "Individual", title: "New Player Onboarding", description: "5 new players complete first deposit.", progress: 80, remainingLabel: "3d 14h remaining" },
  ];
}

export function makeWars(): War[] {
  return [
    { id: "war_12", name: "Weekend Sprint", status: "Active", startsAt: daysAgo(0), endsAt: daysAgo(-1), entryFee: 50, opponent: "Clan Orion", registered: true, scoreYou: 1120, scoreThem: 980 },
    { id: "war_13", name: "Midweek Clash", status: "Upcoming", startsAt: daysAgo(-2), endsAt: daysAgo(-3), entryFee: 35, opponent: "Clan Nova", registered: false, scoreYou: 0, scoreThem: 0 },
    { id: "war_11", name: "Last Week Finals", status: "Past", startsAt: daysAgo(8), endsAt: daysAgo(7), entryFee: 50, opponent: "Clan Vega", registered: true, scoreYou: 780, scoreThem: 820 },
    { id: "war_10", name: "January Cup", status: "Past", startsAt: daysAgo(15), endsAt: daysAgo(14), entryFee: 50, opponent: "Clan Sirius", registered: true, scoreYou: 950, scoreThem: 890 },
    { id: "war_14", name: "Spring Showdown", status: "Upcoming", startsAt: daysAgo(-5), endsAt: daysAgo(-6), entryFee: 75, opponent: "Clan Phoenix", registered: false, scoreYou: 0, scoreThem: 0 },
  ];
}

/** Last 5–10 player fiat deposits (Fiat→USDT) for Deposits Summary widget. */
export function makePlayerDeposits(players: Player[]): PlayerFiatDeposit[] {
  const fiatPairs = [
    { fiat: "5,000 PKR", usdt: 18 },
    { fiat: "2,500 AED", usdt: 680 },
    { fiat: "100 GBP", usdt: 127 },
    { fiat: "15,000 PKR", usdt: 54 },
    { fiat: "200 USD", usdt: 200 },
    { fiat: "8,000 INR", usdt: 96 },
    { fiat: "500 AED", usdt: 136 },
    { fiat: "3,000 PKR", usdt: 10.8 },
    { fiat: "50 GBP", usdt: 63.5 },
    { fiat: "1,200 AED", usdt: 327 },
  ];
  const statuses: PlayerFiatDeposit["status"][] = ["Completed", "Completed", "Pending", "Completed", "Failed", "Completed", "Pending", "Completed", "Completed", "Completed"];
  return fiatPairs.map((fp, i) => {
    const p = players[i % players.length];
    return {
      id: "pdep_" + (i + 1),
      playerId: p.id,
      playerName: p.name,
      fiatAmount: fp.fiat,
      usdtAmount: fp.usdt,
      status: statuses[i],
      at: hoursAgo(2 + i * 6),
    };
  });
}

/** Mock alerts for Alerts widget (homepage). */
export function makeAlerts(): Alert[] {
  return [
    { id: "al1", severity: "High", title: "Low wallet balance", description: "Prefunding may block new player deposits. Top up to avoid pending conversions.", deepLink: "/dashboard/wallet" },
    { id: "al2", severity: "Medium", title: "1 failed fiat payout", description: "Review payout details and confirm settlement externally.", deepLink: "/dashboard/payouts" },
    { id: "al3", severity: "Low", title: "Invite quota running low", description: "You have fewer than 10 invites remaining.", deepLink: "/dashboard/invites" },
    { id: "al4", severity: "Low", title: "2 pending player conversions", description: "Player deposits awaiting wallet prefund. Add funds to clear.", deepLink: "/dashboard/wallet" },
    { id: "al5", severity: "Medium", title: "Clan War registration closes in 24h", description: "Weekend Sprint entry closes soon. Register to lock fee.", deepLink: "/dashboard/clan/wars" },
    { id: "al6", severity: "Low", title: "Weekly statement ready", description: "Week 06 commission has been paid to your wallet.", deepLink: "/dashboard/commissions" },
  ];
}
