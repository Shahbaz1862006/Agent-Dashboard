/**
 * Auth API client – switches between mock and real based on VITE_USE_MOCK_API.
 * Used by useAuthStore for login/logout/session.
 */

import { authMock } from "./mock/auth.mock";
import { authService } from "./api/auth.service";

const useMock =
  typeof import.meta.env?.VITE_USE_MOCK_API !== "string" ||
  import.meta.env.VITE_USE_MOCK_API.toLowerCase() !== "false";

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

export const authApi = useMock
  ? {
      login: (c: LoginCredentials) => authMock.login(c),
      logout: () => authMock.logout(),
      getSession: () => authMock.getSession(),
    }
  : {
      login: (c: LoginCredentials) => authService.login(c),
      logout: () => authService.logout(),
      getSession: () => authService.getSession(),
    };
