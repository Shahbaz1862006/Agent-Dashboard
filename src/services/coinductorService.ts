/**
 * Coinductor wallet connection. Mock implementation — replace with real integration later.
 * Isolated so Coinductor SDK can be swapped in without touching deposit UI.
 */

export type CoinductorConnectResult = {
  address: string;
  verified: true;
};

export const coinductorService = {
  async connect(): Promise<CoinductorConnectResult> {
    await new Promise((r) => setTimeout(r, 600));
    const r = Math.random().toString(36).slice(2, 10);
    const address = ("T" + "CoinductorMock" + r + "TRC20").padEnd(34, "X").slice(0, 34);
    return { address, verified: true };
  },
};
