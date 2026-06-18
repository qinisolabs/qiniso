import { gtinCheckDigit, gs1Country } from "./gtin.js";

export interface GlnResult {
  input: string;
  normalized: string;
  valid: boolean;
  checkDigit: string | null;
  /** GS1 prefix (first 3 digits) and the issuing organisation/country. */
  gs1Prefix: string | null;
  gs1Country: string | null;
  errors: string[];
}

/**
 * Validate a GLN (Global Location Number) — 13 digits with a GS1 mod-10 check
 * digit, used to identify a company, site, or location in supply chains/EDI.
 * Validates structure/checksum, not whether the location is registered.
 */
export function validateGln(input: string): GlnResult {
  const normalized = (input ?? "").replace(/[\s-]/g, "");
  const result: GlnResult = {
    input,
    normalized,
    valid: false,
    checkDigit: null,
    gs1Prefix: null,
    gs1Country: null,
    errors: [],
  };

  if (!/^\d+$/.test(normalized)) {
    result.errors.push("A GLN must contain digits only (spaces and dashes are ignored).");
    return result;
  }
  if (normalized.length !== 13) {
    result.errors.push(`A GLN must be 13 digits; got ${normalized.length}.`);
    return result;
  }

  const prefix3 = normalized.slice(0, 3);
  result.gs1Prefix = prefix3;
  result.gs1Country = gs1Country(prefix3);

  const expected = gtinCheckDigit(normalized.slice(0, 12));
  result.checkDigit = expected;
  if (expected !== normalized[12]) {
    result.errors.push(`Check digit failed: expected ${expected}, got ${normalized[12]}.`);
    return result;
  }
  result.valid = true;
  return result;
}
