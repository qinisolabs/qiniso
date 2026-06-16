// India Aadhaar — 12 digits, final digit is a Verhoeff check. First digit is 2–9.
import { verhoeffValid } from "./verhoeff.js";

export interface AadhaarResult {
  input: string;
  normalized: string;
  valid: boolean;
  errors: string[];
}

export function validateAadhaar(input: string): AadhaarResult {
  const clean = input.replace(/\s/g, "");
  const base: AadhaarResult = { input, normalized: clean, valid: false, errors: [] };
  if (!/^\d{12}$/.test(clean)) return { ...base, errors: ["Aadhaar must be 12 digits."] };
  if (clean[0] === "0" || clean[0] === "1") return { ...base, errors: ["Aadhaar cannot start with 0 or 1."] };
  const ok = verhoeffValid(clean);
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (Verhoeff)."] };
}
