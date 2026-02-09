/** Simulates API latency. Mock services use this to behave like a real backend. */
export function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
