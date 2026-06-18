import { gtinCheckDigit, gs1Country } from "./gtin.js";

export interface SsccResult {
  input: string;
  normalized: string;
  valid: boolean;
  /** Extension digit (first digit), assigned by the company to expand capacity. */
  extensionDigit: string | null;
  checkDigit: string | null;
  /** GS1 prefix (digits 2–4) and issuing organisation/country. */
  gs1Prefix: string | null;
  gs1Country: string | null;
  errors: string[];
}

/**
 * Validate an SSCC (Serial Shipping Container Code) — 18 digits with a GS1
 * mod-10 check digit, identifying an individual logistics unit (pallet/carton).
 * Validates structure/checksum, not whether the unit exists.
 */
export function validateSscc(input: string): SsccResult {
  const normalized = (input ?? "").replace(/[\s-]/g, "");
  const result: SsccResult = {
    input,
    normalized,
    valid: false,
    extensionDigit: null,
    checkDigit: null,
    gs1Prefix: null,
    gs1Country: null,
    errors: [],
  };

  if (!/^\d+$/.test(normalized)) {
    result.errors.push("An SSCC must contain digits only (spaces and dashes are ignored).");
    return result;
  }
  if (normalized.length !== 18) {
    result.errors.push(`An SSCC must be 18 digits; got ${normalized.length}.`);
    return result;
  }

  result.extensionDigit = normalized[0];
  // The GS1 company prefix follows the extension digit; its first 3 digits give the prefix.
  const prefix3 = normalized.slice(1, 4);
  result.gs1Prefix = prefix3;
  result.gs1Country = gs1Country(prefix3);

  const expected = gtinCheckDigit(normalized.slice(0, 17));
  result.checkDigit = expected;
  if (expected !== normalized[17]) {
    result.errors.push(`Check digit failed: expected ${expected}, got ${normalized[17]}.`);
    return result;
  }
  result.valid = true;
  return result;
}
