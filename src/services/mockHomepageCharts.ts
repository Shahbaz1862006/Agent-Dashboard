/**
 * Mock homepage chart data (Deposits vs Withdrawals + GGR Trends).
 * Replace this module with a real API client when backend is ready.
 */

export type DepositsWithdrawalsPoint = {
  date: string;
  deposits: number;
  withdrawals: number;
};

export type GgrPoint = {
  date: string;
  ggr: number;
};

const DAY_MS = 86400000;

/** Deterministic pseudo-random-ish value for consistent mock across refresh. */
function seeded(dayIndex: number, seed: number): number {
  const x = Math.sin(dayIndex * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Generate Deposits vs Withdrawals series for the last N days.
 * Realistic variation: deposits usually higher than withdrawals, some daily variance.
 */
export function generateDepositsWithdrawalsSeries(days: number): DepositsWithdrawalsPoint[] {
  const now = Date.now();
  const result: DepositsWithdrawalsPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS);
    const dayIndex = Math.floor((now - d.getTime()) / DAY_MS);
    const baseDep = 1200 + seeded(dayIndex, 1) * 800;
    const baseWith = 600 + seeded(dayIndex, 2) * 400;
    const deposits = Math.round(baseDep + (seeded(dayIndex, 3) - 0.5) * 300);
    const withdrawals = Math.round(baseWith + (seeded(dayIndex, 4) - 0.5) * 150);
    result.push({
      date: formatDate(d),
      deposits: Math.max(0, deposits),
      withdrawals: Math.max(0, withdrawals),
    });
  }
  return result;
}

/**
 * Generate GGR trend series for the last N days.
 * GGR grows with some weekly pattern and noise.
 */
export function generateGgrSeries(days: number): GgrPoint[] {
  const now = Date.now();
  const result: GgrPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS);
    const dayIndex = Math.floor((now - d.getTime()) / DAY_MS);
    const trend = 8000 + dayIndex * 80;
    const wave = Math.sin((dayIndex / 7) * Math.PI * 2) * 1200;
    const noise = (seeded(dayIndex, 5) - 0.5) * 800;
    const ggr = Math.round(trend + wave + noise);
    result.push({
      date: formatDate(d),
      ggr: Math.max(0, ggr),
    });
  }
  return result;
}

export type HomepageChartsPayload = {
  depositsWithdrawals: DepositsWithdrawalsPoint[];
  ggr: GgrPoint[];
};

/**
 * Fetch homepage chart data. In production, replace with API call.
 */
export async function fetchHomepageChartsData(days: number = 30): Promise<HomepageChartsPayload> {
  const { delay } = await import("./mock/delay");
  await delay(280);
  const count = Math.min(90, Math.max(1, days));
  return {
    depositsWithdrawals: generateDepositsWithdrawalsSeries(count),
    ggr: generateGgrSeries(count),
  };
}
