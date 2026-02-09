/**
 * API client – switches between Mock API and Real API based on VITE_USE_MOCK_API.
 * - VITE_USE_MOCK_API=true  → use mock services (Promises, latency, no HTTP).
 * - VITE_USE_MOCK_API=false → use real HTTP client (VITE_API_BASE_URL).
 * Components and stores use this single `api`; no direct mock data imports in UI.
 */

import type { Api } from "./api";
import { createApi } from "./api/index";
import { createMockApi } from "./mock/index";

const useMock =
  typeof import.meta.env?.VITE_USE_MOCK_API !== "string" ||
  import.meta.env.VITE_USE_MOCK_API.toLowerCase() !== "false";

export const api: Api = useMock ? createMockApi() : createApi();
