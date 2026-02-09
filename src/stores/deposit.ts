import { defineStore } from "pinia";
import type { DepositAttempt, SourceWalletInfo, SourceWalletType, TrustedWallet } from "../types";
import { coinductorService } from "../services/coinductorService";

const DEPOSIT_ATTEMPTS_KEY = "clazino_deposit_attempts_v1";
const TRUSTED_WALLETS_KEY = "clazino_trusted_wallets_v1";

function loadAttempts(): DepositAttempt[] {
  try {
    const raw = localStorage.getItem(DEPOSIT_ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DepositAttempt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAttempts(attempts: DepositAttempt[]) {
  try {
    localStorage.setItem(DEPOSIT_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

function loadTrustedWallets(agentId: string): TrustedWallet[] {
  try {
    const raw = localStorage.getItem(TRUSTED_WALLETS_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, TrustedWallet[]>;
    return Array.isArray(all[agentId]) ? all[agentId] : [];
  } catch {
    return [];
  }
}

function saveTrustedWallets(agentId: string, wallets: TrustedWallet[]) {
  try {
    const raw = localStorage.getItem(TRUSTED_WALLETS_KEY);
    const all: Record<string, TrustedWallet[]> = raw ? JSON.parse(raw) : {};
    all[agentId] = wallets;
    localStorage.setItem(TRUSTED_WALLETS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/** Lightweight TRON (TRC-20) address check: starts with T, length 34 */
export function isValidTronAddress(address: string): boolean {
  const trimmed = (address || "").trim();
  return trimmed.startsWith("T") && trimmed.length >= 33 && trimmed.length <= 35;
}

export const useDepositStore = defineStore("deposit", {
  state: (): {
    depositPopupOpen: boolean;
    sourceWallet: SourceWalletInfo | null;
    attempts: DepositAttempt[];
    connectLoading: boolean;
  } => ({
    depositPopupOpen: false,
    sourceWallet: null,
    attempts: loadAttempts(),
    connectLoading: false,
  }),

  getters: {
    hasValidSourceWallet(state): boolean {
      if (!state.sourceWallet || !state.sourceWallet.address.trim()) return false;
      return isValidTronAddress(state.sourceWallet.address);
    },
    trustedWallets(): (agentId: string) => TrustedWallet[] {
      return (agentId: string) => loadTrustedWallets(agentId);
    },
    pendingDeposits(state): DepositAttempt[] {
      return state.attempts.filter((a) => a.status === "PENDING");
    },
    confirmedDeposits(state): DepositAttempt[] {
      return state.attempts.filter((a) => a.status === "CONFIRMED");
    },
  },

  actions: {
    setManualSourceWallet(address: string) {
      const trimmed = (address || "").trim();
      this.sourceWallet = trimmed
        ? { address: trimmed, type: "MANUAL", verified: false }
        : null;
    },
    setSourceWalletFromCoinductor(address: string) {
      this.sourceWallet = { address: address.trim(), type: "COINDUCTOR", verified: true };
    },
    clearSourceWallet() {
      this.sourceWallet = null;
    },
    async connectCoinductorWallet(): Promise<{ address: string; verified: true } | null> {
      this.connectLoading = true;
      try {
        const result = await coinductorService.connect();
        this.setSourceWalletFromCoinductor(result.address);
        return result;
      } catch {
        return null;
      } finally {
        this.connectLoading = false;
      }
    },
    createDepositAttempt(payload: {
      agentId: string;
      casinoDepositAddress: string;
    }): DepositAttempt | null {
      if (!this.sourceWallet || !isValidTronAddress(this.sourceWallet.address)) return null;
      const attempt: DepositAttempt = {
        id: "dep_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9),
        agentId: payload.agentId,
        sourceWalletAddress: this.sourceWallet.address,
        sourceWalletType: this.sourceWallet.type as SourceWalletType,
        sourceWalletVerified: this.sourceWallet.verified,
        casinoDepositAddress: payload.casinoDepositAddress,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        needsManualReview: false,
      };
      this.attempts = [...this.attempts, attempt];
      saveAttempts(this.attempts);
      this.addToTrustedWallets(payload.agentId, this.sourceWallet.address, this.sourceWallet.verified);
      return attempt;
    },
    addToTrustedWallets(agentId: string, address: string, verified: boolean) {
      const list = loadTrustedWallets(agentId);
      const now = new Date().toISOString();
      const existing = list.find((w) => w.address.toLowerCase() === address.toLowerCase());
      if (existing) {
        const next = list.map((w) =>
          w.address.toLowerCase() === address.toLowerCase() ? { ...w, lastUsedAt: now } : w
        );
        saveTrustedWallets(agentId, next);
      } else {
        saveTrustedWallets(agentId, [...list, { address, verified, firstUsedAt: now, lastUsedAt: now }]);
      }
    },
    updateDepositStatus(id: string, status: DepositAttempt["status"]) {
      const idx = this.attempts.findIndex((a) => a.id === id);
      if (idx === -1) return;
      const next = [...this.attempts];
      next[idx] = { ...next[idx], status };
      this.attempts = next;
      saveAttempts(this.attempts);
    },
    markNeedsManualReview(id: string, actualSenderWallet?: string) {
      const idx = this.attempts.findIndex((a) => a.id === id);
      if (idx === -1) return;
      const next = [...this.attempts];
      next[idx] = { ...next[idx], needsManualReview: true, actualSenderWallet };
      this.attempts = next;
      saveAttempts(this.attempts);
    },
    fetchDeposits() {
      this.attempts = loadAttempts();
    },
  },
});
