// Data is imported as a JSON module (not read from disk) so this runs unchanged
// on Node *and* in edge runtimes like Cloudflare Workers (no node:fs dependency).
import registry from "./data/iban-countries.json" with { type: "json" };

export interface IbanCountry {
  length: number;
  name: string;
}

const REGISTRY = registry as Record<string, IbanCountry>;

export interface IbanResult {
  input: string;
  normalized: string;
  valid: boolean;
  countryCode: string | null;
  country: string | null;
  checkDigits: string | null;
  bban: string | null;
  errors: string[];
}

/** ISO 7064 mod-97-10 over an IBAN already rearranged (BBAN + country + check). */
function mod97(rearranged: string): number {
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    // A-Z -> 10..35, 0-9 -> 0..9
    const value = code >= 65 && code <= 90 ? code - 55 : code - 48;
    remainder = value > 9 ? (remainder * 100 + value) % 97 : (remainder * 10 + value) % 97;
  }
  return remainder;
}

/** Normalize: strip spaces and uppercase. */
export function normalizeIban(input: string): string {
  return input.replace(/[\s]/g, "").toUpperCase();
}

/**
 * Validate an IBAN: known country, correct length for that country, and a passing
 * ISO 7064 mod-97 checksum. Returns the parsed parts and any structured errors.
 */
export function validateIban(input: string): IbanResult {
  const normalized = normalizeIban(input);
  const result: IbanResult = {
    input,
    normalized,
    valid: false,
    countryCode: null,
    country: null,
    checkDigits: null,
    bban: null,
    errors: [],
  };

  if (!/^[A-Z0-9]+$/.test(normalized)) {
    result.errors.push("IBAN contains characters other than letters and digits.");
    return result;
  }
  if (normalized.length < 4) {
    result.errors.push("IBAN is too short to contain a country code and check digits.");
    return result;
  }

  const cc = normalized.slice(0, 2);
  const checkDigits = normalized.slice(2, 4);
  const bban = normalized.slice(4);
  result.countryCode = cc;
  result.checkDigits = checkDigits;
  result.bban = bban;

  const spec = REGISTRY[cc];
  if (!spec) {
    result.errors.push(`Unknown or unsupported IBAN country code "${cc}".`);
    return result;
  }
  result.country = spec.name;

  if (!/^[A-Z]{2}[0-9]{2}/.test(normalized)) {
    result.errors.push("Country code must be 2 letters followed by 2 check digits.");
    return result;
  }
  if (normalized.length !== spec.length) {
    result.errors.push(
      `Wrong length for ${spec.name}: expected ${spec.length}, got ${normalized.length}.`
    );
    return result;
  }

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  if (mod97(rearranged) !== 1) {
    result.errors.push("Checksum failed (ISO 7064 mod-97): the IBAN is not valid.");
    return result;
  }

  result.valid = true;
  return result;
}

/** Compute the two check digits for a country code + BBAN (positions 3-4). */
export function ibanCheckDigits(countryCode: string, bban: string): string {
  const cc = countryCode.toUpperCase();
  const rearranged = bban.toUpperCase() + cc + "00";
  const remainder = mod97(rearranged);
  return String(98 - remainder).padStart(2, "0");
}

/** List of supported IBAN country codes. */
export function supportedIbanCountries(): string[] {
  return Object.keys(REGISTRY);
}
