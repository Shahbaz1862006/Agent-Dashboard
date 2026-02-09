/**
 * Mock auth API. Returns Promises with latency; matches real API response shape.
 */

import { AGENT_PERSONA } from "../../data/agentPersona";
import { delay } from "./delay";

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

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export const authMock = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await delay(400);
    if (!credentials.email?.trim()) {
      throw new Error("Email is required");
    }
    const user: AuthUser = {
      id: AGENT_PERSONA.id,
      name: AGENT_PERSONA.name,
      email: (credentials.email || AGENT_PERSONA.email).toLowerCase(),
      agentId: AGENT_PERSONA.agentId,
      clanName: AGENT_PERSONA.clanName,
    };
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
    return {
      user,
      token: "mock_token_" + Math.random().toString(36).slice(2, 12),
      expiresAt,
    };
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async getSession(): Promise<AuthSession | null> {
    await delay(100);
    return null; // Mock does not persist server-side; client uses localStorage
  },
};
