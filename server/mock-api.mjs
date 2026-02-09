/**
 * Mock API server – serves the same mock data as the app via real HTTP.
 * Run: npm run mock-api  (or npx tsx server/mock-api.mjs)
 * Set VITE_API_BASE_URL=http://localhost:3001 in .env so the app calls this server.
 * For production, set VITE_API_BASE_URL to your real backend URL.
 */

import { createServer } from "http";
import { parse as parseUrl } from "url";

const PORT = Number(process.env.MOCK_API_PORT) || 3001;
const BASE = "/api";

// In-memory state (same shape as src/data/mockData). We load it from a CJS/JSON
// to avoid pulling in the Vue app's TS. Alternatively run with: npx tsx server/mock-api.mjs
// and use dynamic import of mockData. For simplicity we use inline minimal state here.
function getInitialState() {
  const daysAgo = (d) => {
    const x = new Date();
    x.setDate(x.getDate() - d);
    return x.toISOString();
  };
  const hoursAgo = (h) => {
    const x = new Date();
    x.setHours(x.getHours() - h);
    return x.toISOString();
  };
  return {
    wallet: { available: 12450.25, locked: 980, total: 13430.25 },
    alerts: [
      { id: "al1", severity: "High", title: "Low wallet balance", description: "Prefunding may block new player deposits.", deepLink: "/dashboard/wallet" },
      { id: "al2", severity: "Medium", title: "1 failed fiat payout", description: "Review payout details.", deepLink: "/dashboard/payouts" },
      { id: "al3", severity: "Low", title: "Invite quota running low", description: "You have fewer than 10 invites remaining.", deepLink: "/dashboard/invites" },
      { id: "al6", severity: "Low", title: "Weekly statement ready", description: "Week 06 commission has been paid.", deepLink: "/dashboard/commissions" },
    ],
    statements: [
      { id: "stmt_current", weekLabel: "Week 06 (Mon–Sun)", status: "Paid", ggr: 14200, ngr: 12400, commissionRate: 0.035, adjustments: -32.5, finalPayout: 401.25, paidAt: daysAgo(0), ledgerRefId: "ref_stmt_current" },
      { id: "stmt_02", weekLabel: "Week 02 (Mon–Sun)", status: "Paid", ggr: 12800, ngr: 11200, commissionRate: 0.035, adjustments: -45.5, finalPayout: 346.5, paidAt: daysAgo(1), ledgerRefId: "ref_stmt_02" },
    ],
    goals: [
      { id: "g1", type: "Clan-wide", title: "Active Sessions", description: "Reach 220 total play sessions.", progress: 68, remainingLabel: "3d 14h remaining" },
      { id: "g2", type: "All-member", title: "All Members Participate", description: "Every clan member plays at least once.", progress: 82, remainingLabel: "3d 14h remaining" },
    ],
    wars: [
      { id: "war_12", name: "Weekend Sprint", status: "Active", startsAt: hoursAgo(0), endsAt: hoursAgo(-24), entryFee: 50, opponent: "Clan Orion", registered: true, scoreYou: 1120, scoreThem: 980 },
      { id: "war_13", name: "Midweek Clash", status: "Upcoming", startsAt: hoursAgo(48), endsAt: hoursAgo(24), entryFee: 35, opponent: "Clan Nova", registered: false, scoreYou: 0, scoreThem: 0 },
    ],
    invites: [
      { id: "inv_1", channel: "WhatsApp", label: "Main", status: "Pending", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), link: "https://clazino.app/invite?token=abc" },
    ],
    payouts: [
      { id: "pay_1", playerName: "Player One", method: "Bank", status: "Completed", amount: 150, requestedAt: hoursAgo(2) },
      { id: "pay_2", playerName: "Player Two", method: "USDT", status: "Pending", amount: 80, requestedAt: hoursAgo(5) },
    ],
    players: Array.from({ length: 10 }, (_, i) => ({
      id: "pl_" + (1000 + i),
      name: "Player " + (i + 1),
      username: "player" + (i + 1),
      kycTier: ["Tier A", "Tier B", "Tier C"][i % 3],
      status: "Active",
      riskScore: Math.min(90, 20 + i * 8),
      lastActive: hoursAgo(i * 2),
      balanceAvailable: 100 + i * 50,
      balancePending: i % 2 === 0 ? 0 : 20,
      balanceLocked: i % 3 === 0 ? 10 : 0,
    })),
    ledger: [
      { id: "led_1", at: hoursAgo(1), type: "Agent Deposit", description: "Agent Deposit – 500 USDT", amount: 500, balanceAfter: 13430.25, refId: "tx_1" },
      { id: "led_2", at: hoursAgo(24), type: "Commission Credit", description: "Weekly Commission – Statement Wk 06", amount: 401.25, balanceAfter: 12930.25, refId: "ref_stmt_current" },
    ],
  };
}

let state = getInitialState();

function send(res, statusCode, data) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (ch) => (body += ch));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

const routes = {
  "GET /api/wallet/summary": () => state.wallet,
  "GET /api/ledger": () => state.ledger,
  "GET /api/players": () => state.players,
  "GET /api/alerts": () => state.alerts,
  "GET /api/statements": () => state.statements,
  "GET /api/goals": () => state.goals,
  "GET /api/wars": () => state.wars,
  "GET /api/invites": () => state.invites,
  "GET /api/payouts": () => state.payouts,
};

async function handler(req, res) {
  const pathname = parseUrl(req.url).pathname || "";
  const method = req.method || "GET";

  // GET /api/players/:id
  const playerMatch = pathname.match(/^\/api\/players\/([^/]+)$/);
  if (method === "GET" && playerMatch) {
    const id = decodeURIComponent(playerMatch[1]);
    const p = state.players.find((x) => x.id === id) ?? null;
    return send(res, 200, p);
  }

  // GET /api/statements/:id
  const stmtMatch = pathname.match(/^\/api\/statements\/([^/]+)$/);
  if (method === "GET" && stmtMatch) {
    const id = decodeURIComponent(stmtMatch[1]);
    const s = state.statements.find((x) => x.id === id) ?? null;
    return send(res, 200, s);
  }

  // POST /api/invites
  if (method === "POST" && pathname === "/api/invites") {
    const body = await parseBody(req);
    const inv = {
      id: "inv_" + Math.random().toString(36).slice(2, 6),
      channel: body.channel || "WhatsApp",
      label: body.label,
      status: "Pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (body.expiryDays ?? 7) * 86400000).toISOString(),
      link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2),
    };
    state.invites = [inv, ...state.invites];
    return send(res, 200, inv);
  }

  // POST /api/invites/:id/resend
  const resendMatch = pathname.match(/^\/api\/invites\/([^/]+)\/resend$/);
  if (method === "POST" && resendMatch) {
    const id = decodeURIComponent(resendMatch[1]);
    const inv = state.invites.find((i) => i.id === id);
    if (!inv) return send(res, 404, { error: "Invite not found" });
    const updated = { ...inv, status: "Pending", link: "https://clazino.app/invite?token=" + Math.random().toString(36).slice(2) };
    state.invites = state.invites.map((i) => (i.id === id ? updated : i));
    return send(res, 200, updated);
  }

  // POST /api/wars/:id/register
  const warRegMatch = pathname.match(/^\/api\/wars\/([^/]+)\/register$/);
  if (method === "POST" && warRegMatch) {
    const id = decodeURIComponent(warRegMatch[1]);
    const w = state.wars.find((x) => x.id === id);
    if (!w) return send(res, 200, null);
    if (w.registered) return send(res, 200, w);
    const updated = { ...w, registered: true };
    state.wars = state.wars.map((x) => (x.id === id ? updated : x));
    state.wallet = { ...state.wallet, available: state.wallet.available - w.entryFee, locked: state.wallet.locked + w.entryFee, total: state.wallet.total };
    return send(res, 200, updated);
  }

  const key = `${method} ${pathname}`;
  const fn = routes[key];
  if (fn) {
    return send(res, 200, fn());
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
}

const server = createServer(handler);
server.listen(PORT, () => {
  console.log(`Mock API server: http://localhost:${PORT}${BASE}`);
  console.log(`Set VITE_API_BASE_URL=http://localhost:${PORT} in .env to use this server.`);
});
