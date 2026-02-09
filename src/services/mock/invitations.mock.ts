/**
 * Mock Invitations API (firstName, lastName, contacts[]).
 * Uses localStorage for persistence. Simulates latency and matches real API shape.
 */

import type { Invitation, CreateInvitationPayload } from "../../types";
import { delay } from "./delay";
import { INVITATION_EXPIRY_DAYS } from "../../constants/invitations";

const STORAGE_KEY = "clazino_agent_invitations";

function loadFromStorage(): Invitation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Invitation[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return getSeedInvitations();
}

function saveToStorage(list: Invitation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function getSeedInvitations(): Invitation[] {
  const now = new Date();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return [
    {
      id: "inv_01",
      firstName: "Ali",
      lastName: "Khan",
      contacts: [{ method: "EMAIL", value: "ali@example.com" }, { method: "WHATSAPP", value: "+923001234567" }],
      status: "PENDING",
      invitationCode: "INV-8K3D-2P9Q-M4N7",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + sevenDays).toISOString(),
    },
    {
      id: "inv_02",
      firstName: "Sara",
      lastName: "Ahmed",
      contacts: [{ method: "PHONE", value: "+971501234567" }],
      status: "COMPLETED",
      invitationCode: "INV-A1B2-C3D4-E5F6",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + sevenDays).toISOString(),
    },
    {
      id: "inv_03",
      firstName: "Omar",
      lastName: "Hassan",
      contacts: [{ method: "TELEGRAM", value: "@omar_dev" }, { method: "EMAIL", value: "omar@test.com" }],
      status: "PENDING",
      invitationCode: "INV-X7Y2-Z9W4-K3R8",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + sevenDays).toISOString(),
    },
  ];
}

export const invitationsMock = {
  async getInvitations(): Promise<Invitation[]> {
    await delay(400);
    return loadFromStorage();
  },

  async createInvitation(payload: CreateInvitationPayload): Promise<Invitation> {
    await delay(500);
    const list = loadFromStorage();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const invitation: Invitation = {
      id: "inv_" + Math.random().toString(36).slice(2, 10),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      contacts: payload.contacts.map((c) => ({ method: c.method, value: c.value.trim() })),
      status: "PENDING",
      invitationCode: payload.invitationCode?.trim() || "INV-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    list.unshift(invitation);
    saveToStorage(list);
    return invitation;
  },
};
