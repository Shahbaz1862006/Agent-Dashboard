/**
 * Payouts API service. Used when VITE_USE_MOCK_API is false.
 */

import type { Payout } from "../../types";
import { get, post } from "./http.client";

export const payoutsService = {
  getPayouts(): Promise<Payout[]> {
    return get<Payout[]>("/api/payouts");
  },
  approvePayout(id: string): Promise<Payout> {
    return post<Payout>(`/api/payouts/${id}/approve`, {});
  },
  declinePayout(id: string, reason: string): Promise<Payout> {
    return post<Payout>(`/api/payouts/${id}/decline`, { reason });
  },
  escalatePayout(id: string, payload: { notes: string; category?: string }): Promise<Payout> {
    return post<Payout>(`/api/payouts/${id}/escalate`, payload);
  },
};
