// Data is imported as a JSON module (not read from disk) so this runs unchanged
// on Node *and* in edge runtimes like Cloudflare Workers (no node:fs dependency).
import prefixes from "./data/gs1-prefixes.json" with { type: "json" };

const RANGES = (prefixes as { ranges: { start: number; end: number; country: string }[] }).ranges;

export type GtinType = "GTIN-8" | "GTIN-12" | "GTIN-13" | "GTIN-14";

export interface GtinResult {
  input: string;
  normalized: string;
  valid: boolean;
  type: GtinType | null;
  /** The check digit the number should end with. */
  checkDigit: string | null;
  /** The GS1 prefix (first 3 digits of the GTIN-13 form), when determinable. */
  gs1Prefix: string | null;
  /** Issuing organisation / country for that prefix, when known. */
  gs1Country: string | null;
  errors: string[];
}

const LENGTH_TYPE: Record<number, GtinType> = {
  8: "GTIN-8",
  12: "GTIN-12",
  13: "GTIN-13",
  14: "GTIN-14",
};

/**
 * Compute the GS1 mod-10 check digit for the data digits (everything except the
 * final check digit). Weights alternate 3,1,3,1… from the RIGHTMOST data digit.
 * Works for every GTIN length (EAN-8, UPC-A, EAN-13, GTIN-14).
 */
export function gtinCheckDigit(dataDigits: string): string {
  if (!/^\d+$/.test(dataDigits)) {
    throw new Error("gtinCheckDigit expects digits only.");
  }
  let sum = 0;
  for (let i = 0; i < dataDigits.length; i++) {
    const d = dataDigits.charCodeAt(dataDigits.length - 1 - i) - 48;
    sum += i % 2 === 0 ? d * 3 : d;
  }
  return String((10 - (sum % 10)) % 10);
}

/** GTIN-13 representation used for prefix lookup, given a normalized GTIN of any length. */
function toBase13Prefix(normalized: string): string {
  const len = normalized.length;
  if (len === 14) return normalized.slice(1, 4); // drop the indicator digit
  if (len === 13) return normalized.slice(0, 3);
  if (len === 12) return ("0" + normalized).slice(0, 3); // UPC-A → 0-padded EAN-13
  return normalized.slice(0, 3); // GTIN-8: its own leading digits are the prefix
}

/** Look up the issuing organisation / country for a 3-digit GS1 prefix. */
export function gs1Country(prefix3: string): string | null {
  const n = Number(prefix3);
  if (!Number.isInteger(n)) return null;
  for (const r of RANGES) if (n >= r.start && n <= r.end) return r.country;
  return null;
}

/**
 * Validate a GTIN / barcode number — EAN-8, UPC-A (12), EAN-13, or GTIN-14.
 * Checks the GS1 mod-10 check digit and returns the type, expected check digit,
 * and the GS1 prefix's issuing country. Validates STRUCTURE only — it does not
 * confirm the barcode maps to a real, registered product.
 */
export function validateGtin(input: string): GtinResult {
  const normalized = input.replace(/[\s-]/g, "");
  const result: GtinResult = {
    input,
    normalized,
    valid: false,
    type: null,
    checkDigit: null,
    gs1Prefix: null,
    gs1Country: null,
    errors: [],
  };

  if (!/^\d+$/.test(normalized)) {
    result.errors.push("A GTIN/barcode must contain digits only (after removing spaces/hyphens).");
    return result;
  }
  const type = LENGTH_TYPE[normalized.length];
  if (!type) {
    result.errors.push(
      `Length ${normalized.length} is not a GTIN — expected 8 (EAN-8), 12 (UPC-A), 13 (EAN-13) or 14 (GTIN-14) digits.`
    );
    return result;
  }
  result.type = type;

  const prefix3 = toBase13Prefix(normalized);
  result.gs1Prefix = prefix3;
  result.gs1Country = gs1Country(prefix3);

  const expected = gtinCheckDigit(normalized.slice(0, -1));
  result.checkDigit = expected;
  const actual = normalized[normalized.length - 1];
  if (expected !== actual) {
    result.errors.push(`Check digit failed: expected ${expected}, got ${actual}.`);
    return result;
  }

  result.valid = true;
  return result;
}
