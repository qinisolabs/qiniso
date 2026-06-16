// SEDOL — 6 alphanumeric (no vowels) + weighted mod-10 check digit (LSE).
export interface SedolResult {
  input: string;
  normalized: string;
  valid: boolean;
  checkDigit: string | null;
  expectedCheckDigit: string | null;
  errors: string[];
}

const WEIGHTS = [1, 3, 1, 7, 3, 9];

function charValue(c: string): number {
  return /[0-9]/.test(c) ? Number(c) : c.charCodeAt(0) - 55; // B=11 … Z=35
}

export function validateSedol(input: string): SedolResult {
  const s = input.trim().toUpperCase().replace(/\s/g, "");
  const base: SedolResult = {
    input,
    normalized: s,
    valid: false,
    checkDigit: null,
    expectedCheckDigit: null,
    errors: [],
  };
  // SEDOLs exclude vowels (A, E, I, O, U).
  if (!/^[0-9BCDFGHJKLMNPQRSTVWXYZ]{6}[0-9]$/.test(s)) {
    return { ...base, errors: ["Not a SEDOL (expected 6 alphanumeric chars, no vowels, + 1 check digit)."] };
  }
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += charValue(s[i]) * WEIGHTS[i];
  const expected = (10 - (sum % 10)) % 10;
  const actual = Number(s[6]);
  return {
    ...base,
    valid: expected === actual,
    checkDigit: s[6],
    expectedCheckDigit: String(expected),
    errors: expected === actual ? [] : [`Checksum failed (SEDOL weighted mod-10): expected check digit ${expected}.`],
  };
}
