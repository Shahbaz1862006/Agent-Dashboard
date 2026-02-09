import { defineStore } from "pinia";
import { authApi } from "../services/authClient";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  agentId: string;
  clanName: string;
};

const LS_KEY = "clazino_agent_auth_v1";
const EXPIRES_KEY = "clazino_agent_expires_v1";

function load(): { user: AuthUser | null; token: string | null; expiresAt: string | null } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { user: null, token: null, expiresAt: null };
    const parsed = JSON.parse(raw) as { user: AuthUser; token: string; expiresAt?: string };
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      expiresAt: parsed.expiresAt ?? null,
    };
  } catch {
    return { user: null, token: null, expiresAt: null };
  }
}

function save(user: AuthUser | null, token: string | null, expiresAt: string | null) {
  try {
    if (!user || !token) {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify({ user, token, expiresAt: expiresAt ?? undefined }));
    if (expiresAt) localStorage.setItem(EXPIRES_KEY, expiresAt);
  } catch {
    // ignore
  }
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  try {
    return new Date(expiresAt).getTime() <= Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    const loaded = load();
    if (loaded.token && loaded.expiresAt && isExpired(loaded.expiresAt)) {
      save(null, null, null);
      return { user: null, token: null, expiresAt: null };
    }
    return { user: loaded.user, token: loaded.token, expiresAt: loaded.expiresAt };
  },
  actions: {
    async login(credentials: { email: string; password: string }) {
      const session = await authApi.login(credentials);
      save(session.user, session.token, session.expiresAt ?? null);
      this.user = session.user;
      this.token = session.token;
      this.expiresAt = session.expiresAt ?? null;
    },
    logout() {
      authApi.logout().catch(() => {});
      save(null, null, null);
      this.user = null;
      this.token = null;
      this.expiresAt = null;
    },
  },
  getters: {
    isExpired(): boolean {
      return isExpired(this.expiresAt);
    },
  },
});
