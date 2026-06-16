// JSON module import (not node:fs) → runs on Node and edge runtimes alike.
import cardBins from "./data/card-bins.json" with { type: "json" };

interface BinRule {
  min: number;
  max: number;
  len: number;
}
interface BrandSpec {
  brand: string;
  rules: BinRule[];
  lengths: number[];
}

const BRANDS = (cardBins as { brands: BrandSpec[] }).brands;

export interface CardResult {
  input: string;
  normalized: string;
  valid: boolean;
  luhnValid: boolean;
  brand: string | null;
  lengthValid: boolean | null;
  errors: string[];
}

/** Luhn (ISO/IEC 7812) checksum over a digit string. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** The single check digit that, appended to `partial`, makes it Luhn-valid. */
export function luhnCheckDigit(partial: string): string {
  let sum = 0;
  let double = true; // the appended digit is at an even position from the right
  for (let i = partial.length - 1; i >= 0; i--) {
    let d = partial.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Detect card brand using longest-prefix-wins over the BIN ranges. */
export function detectBrand(digits: string): { brand: string; lengths: number[] } | null {
  if (!/^\d+$/.test(digits)) return null;
  let best: { brand: string; lengths: number[]; len: number } | null = null;
  for (const spec of BRANDS) {
    for (const rule of spec.rules) {
      if (digits.length < rule.len) continue;
      const prefix = Number(digits.slice(0, rule.len));
      if (prefix >= rule.min && prefix <= rule.max) {
        if (!best || rule.len > best.len) {
          best = { brand: spec.brand, lengths: spec.lengths, len: rule.len };
        }
      }
    }
  }
  return best ? { brand: best.brand, lengths: best.lengths } : null;
}

/**
 * Validate a card number: passes the Luhn check, and (if the brand is recognised)
 * has a length the brand permits. Spaces and dashes are ignored.
 */
export function validateCard(input: string): CardResult {
  const normalized = input.replace(/[\s-]/g, "");
  const result: CardResult = {
    input,
    normalized,
    valid: false,
    luhnValid: false,
    brand: null,
    lengthValid: null,
    errors: [],
  };

  if (!/^\d+$/.test(normalized)) {
    result.errors.push("Card number contains non-digit characters.");
    return result;
  }
  if (normalized.length < 12 || normalized.length > 19) {
    result.errors.push("Card number length is outside the valid 12-19 digit range.");
    return result;
  }

  result.luhnValid = luhnValid(normalized);
  if (!result.luhnValid) result.errors.push("Luhn checksum failed.");

  const detected = detectBrand(normalized);
  if (detected) {
    result.brand = detected.brand;
    result.lengthValid = detected.lengths.includes(normalized.length);
    if (!result.lengthValid) {
      result.errors.push(
        `Length ${normalized.length} is not valid for ${detected.brand} (expected ${detected.lengths.join("/")}).`
      );
    }
  }

  result.valid = result.luhnValid && result.lengthValid !== false;
  return result;
}
