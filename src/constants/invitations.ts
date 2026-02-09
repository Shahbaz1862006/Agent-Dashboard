import type { InvitationMethod } from "../types";

export const INVITATION_EXPIRY_DAYS = 7;

export const INVITATION_STATUS = {
  PENDING: "PENDING" as const,
  COMPLETED: "COMPLETED" as const,
};

export const INVITATION_METHODS: InvitationMethod[] = ["EMAIL", "WHATSAPP", "PHONE", "TELEGRAM"];

export const INVITATION_METHOD_LABELS: Record<InvitationMethod, string> = {
  EMAIL: "Email",
  WHATSAPP: "WhatsApp",
  PHONE: "Phone Number",
  TELEGRAM: "Telegram ID",
};

export const INVITATION_METHOD_PLACEHOLDERS: Record<InvitationMethod, string> = {
  EMAIL: "e.g. user@example.com",
  WHATSAPP: "e.g. +923001234567",
  PHONE: "e.g. +923001234567",
  TELEGRAM: "e.g. @username or 123456789",
};
