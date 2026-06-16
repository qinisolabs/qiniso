// Phone validation + E.164 normalisation via libphonenumber-js.
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export interface PhoneResult {
  valid: boolean;
  e164?: string;
  national?: string;
  international?: string;
  type?: string;
  region: string;
  input: string;
  reason?: string;
}

export function validatePhone(number: string, region = "GB"): PhoneResult {
  region = (region || "GB").toUpperCase();
  let parsed;
  try {
    parsed = parsePhoneNumberFromString(String(number), region as CountryCode);
  } catch {
    parsed = undefined;
  }
  if (!parsed || !parsed.isValid()) {
    return { valid: false, reason: "not a valid number for region", region, input: number };
  }
  return {
    valid: true,
    e164: parsed.number,
    national: parsed.formatNational(),
    international: parsed.formatInternational(),
    type: parsed.getType() ?? "unknown",
    region,
    input: number,
  };
}
