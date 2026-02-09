/**
 * Invitations API service (firstName, lastName, multi-method contacts).
 * Used when VITE_USE_MOCK_API is false.
 */

import type { Invitation, CreateInvitationPayload } from "../../types";
import { get, post } from "./http.client";

const BASE = "/api";

export const invitationsService = {
  getInvitations(): Promise<Invitation[]> {
    return get<Invitation[]>(`${BASE}/invitations`);
  },

  createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
    return post<Invitation>(`${BASE}/invitations`, payload);
  },
};
