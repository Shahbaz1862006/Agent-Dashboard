/**
 * Auth API service. Used when VITE_USE_MOCK_API is false.
 */

import { get, post } from "./http.client";

export type LoginCredentials = { email: string; password: string };

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  agentId: string;
  clanName: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  expiresAt?: string;
};

const BASE = "/api/auth";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return post<AuthSession>(`${BASE}/login`, credentials);
  },

  async logout(): Promise<void> {
    return post<void>(`${BASE}/logout`);
  },

  async getSession(): Promise<AuthSession | null> {
    return get<AuthSession | null>(`${BASE}/session`);
  },
};
