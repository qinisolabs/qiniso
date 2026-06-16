// CUSIP — 8 alphanumeric chars + 1 mod-10 check digit (North American securities).
export interface CusipResult {
  input: string;
  normalized: string;
  valid: boolean;
  checkDigit: string | null;
  expectedCheckDigit: string | null;
  errors: string[];
}

function charValue(c: string): number {
  if (/[0-9]/.test(c)) return Number(c);
  if (/[A-Z]/.test(c)) return c.charCodeAt(0) - 55; // A=10 … Z=35
  return { "*": 36, "@": 37, "#": 38 }[c] ?? -1;
}

export function validateCusip(input: string): CusipResult {
  const s = input.trim().toUpperCase().replace(/\s/g, "");
  const base: CusipResult = {
    input,
    normalized: s,
    valid: false,
    checkDigit: null,
    expectedCheckDigit: null,
    errors: [],
  };
  if (!/^[0-9A-Z*@#]{8}[0-9]$/.test(s)) {
    return { ...base, errors: ["Not a CUSIP (expected 8 alphanumeric chars + 1 check digit)."] };
  }
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    let v = charValue(s[i]);
    if (i % 2 === 1) v *= 2; // double every second char (positions 2,4,6,8)
    sum += Math.floor(v / 10) + (v % 10);
  }
  const expected = (10 - (sum % 10)) % 10;
  const actual = Number(s[8]);
  return {
    ...base,
    valid: expected === actual,
    checkDigit: s[8],
    expectedCheckDigit: String(expected),
    errors: expected === actual ? [] : [`Checksum failed (CUSIP mod-10): expected check digit ${expected}.`],
  };
}
