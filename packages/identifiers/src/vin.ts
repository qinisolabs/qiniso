export interface VinResult {
  input: string;
  normalized: string;
  valid: boolean;
  checkDigit: string | null;
  expectedCheckDigit: string | null;
  errors: string[];
}

// Transliteration values for VIN characters (I, O, Q are not allowed).
const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** Compute the VIN check digit (position 9) for a 17-char VIN; pos 9 is ignored. */
export function vinCheckDigit(vin: string): string {
  const v = vin.toUpperCase();
  if (v.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) {
    throw new Error("vinCheckDigit expects 17 chars from the VIN alphabet (no I/O/Q).");
  }
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue; // the check-digit position itself
    sum += TRANSLIT[v[i]] * WEIGHTS[i];
  }
  const r = sum % 11;
  return r === 10 ? "X" : String(r);
}

/**
 * Validate a 17-character VIN (ISO 3779): allowed alphabet (no I/O/Q) and a
 * correct transliteration check digit in position 9.
 */
export function validateVin(input: string): VinResult {
  const normalized = input.trim().toUpperCase();
  const result: VinResult = {
    input,
    normalized,
    valid: false,
    checkDigit: null,
    expectedCheckDigit: null,
    errors: [],
  };

  if (normalized.length !== 17) {
    result.errors.push(`VIN must be exactly 17 characters (got ${normalized.length}).`);
    return result;
  }
  if (/[IOQ]/.test(normalized)) {
    result.errors.push("VIN must not contain the letters I, O or Q.");
    return result;
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) {
    result.errors.push("VIN contains characters outside the allowed alphabet.");
    return result;
  }

  const expected = vinCheckDigit(normalized);
  result.checkDigit = normalized[8];
  result.expectedCheckDigit = expected;
  if (expected !== normalized[8]) {
    result.errors.push(
      `Check digit (position 9) failed: expected ${expected}, got ${normalized[8]}.`
    );
    return result;
  }

  result.valid = true;
  return result;
}
