import type { InvitationMethod } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_ONLY = /^\d+$/;

export type FieldErrors = Record<string, string>;

export function validateEmail(value: string): string | null {
  if (!value || !value.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePhoneOrWhatsApp(value: string): string | null {
  if (!value || !value.trim()) return "This field is required.";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return "Must contain at least 8 digits.";
  return null;
}

export function validateTelegram(value: string): string | null {
  if (!value || !value.trim()) return "Telegram ID is required.";
  return null;
}

export function validateInvitationForm(
  firstName: string,
  lastName: string,
  selectedMethods: InvitationMethod[],
  contactValues: Record<InvitationMethod, string>
): FieldErrors {
  const errors: FieldErrors = {};
  if (!firstName || !firstName.trim()) errors.firstName = "First name is required.";
  if (!lastName || !lastName.trim()) errors.lastName = "Last name is required.";
  if (selectedMethods.length === 0) {
    errors.methods = "Select at least one invitation method.";
  } else {
    if (selectedMethods.includes("EMAIL")) {
      const e = validateEmail(contactValues.EMAIL);
      if (e) errors.email = e;
    }
    if (selectedMethods.includes("WHATSAPP")) {
      const e = validatePhoneOrWhatsApp(contactValues.WHATSAPP);
      if (e) errors.whatsapp = e;
    }
    if (selectedMethods.includes("PHONE")) {
      const e = validatePhoneOrWhatsApp(contactValues.PHONE);
      if (e) errors.phone = e;
    }
    if (selectedMethods.includes("TELEGRAM")) {
      const e = validateTelegram(contactValues.TELEGRAM);
      if (e) errors.telegram = e;
    }
  }
  return errors;
}
