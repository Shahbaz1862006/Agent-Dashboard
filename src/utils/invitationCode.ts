/**
 * Generates a unique invitation code: INV-XXXX-XXXX-XXXX (12 chars) or INV-XXXX-XXXX-XXXX-XXXX (16 chars).
 * Uppercase alphanumeric, human-readable. Regenerates if collision with existingCodes.
 */
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,O,1,I for readability
const SEGMENT_LENGTH = 4;
const SEGMENTS = 4; // INV-XXXX-XXXX-XXXX-XXXX = 16 chars

function randomSegment(): string {
  let s = "";
  for (let i = 0; i < SEGMENT_LENGTH; i++) {
    s += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return s;
}

export function generateInvitationCode(existingCodes: string[]): string {
  const set = new Set(existingCodes.map((c) => c.toUpperCase()));
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;
  do {
    const parts = ["INV", ...Array.from({ length: SEGMENTS }, randomSegment)];
    code = parts.join("-");
    if (++attempts > maxAttempts) break;
  } while (set.has(code));
  return code;
}
