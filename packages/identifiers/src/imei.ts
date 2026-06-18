import { luhnValid, luhnCheckDigit } from "./card.js";

export type ImeiType = "IMEI" | "IMEISV";

export interface ImeiResult {
  input: string;
  normalized: string;
  valid: boolean;
  type: ImeiType | null;
  /** Type Allocation Code — the first 8 digits, identifying the device model. */
  tac: string | null;
  checkDigit: string | null;
  expectedCheckDigit: string | null;
  note?: string;
  errors: string[];
}

/**
 * Validate an IMEI (15 digits, Luhn check digit) or recognise an IMEISV
 * (16 digits, software-version variant, which has NO check digit).
 * Validates the number's structure/checksum — not whether the device is real,
 * stolen, or blocklisted.
 */
export function validateImei(input: string): ImeiResult {
  const normalized = (input ?? "").replace(/[\s-]/g, "");
  const result: ImeiResult = {
    input,
    normalized,
    valid: false,
    type: null,
    tac: null,
    checkDigit: null,
    expectedCheckDigit: null,
    errors: [],
  };

  if (!/^\d+$/.test(normalized)) {
    result.errors.push("An IMEI must contain digits only (spaces and dashes are ignored).");
    return result;
  }

  if (normalized.length === 16) {
    // IMEISV: 14-digit TAC+serial + 2-digit software version, no check digit.
    result.type = "IMEISV";
    result.tac = normalized.slice(0, 8);
    result.valid = true;
    result.note = "IMEISV (software-version form) has no check digit; format validated only.";
    return result;
  }

  if (normalized.length !== 15) {
    result.errors.push(`An IMEI must be 15 digits (or 16 for IMEISV); got ${normalized.length}.`);
    return result;
  }

  result.type = "IMEI";
  result.tac = normalized.slice(0, 8);
  const expected = luhnCheckDigit(normalized.slice(0, 14));
  result.checkDigit = normalized[14];
  result.expectedCheckDigit = expected;
  if (!luhnValid(normalized)) {
    result.errors.push(`Luhn check digit failed: expected ${expected}, got ${normalized[14]}.`);
    return result;
  }
  result.valid = true;
  return result;
}
