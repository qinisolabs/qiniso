// ISIN (ISO 6166) — 2-letter country + 9 alphanumeric NSIN + Luhn check digit.
export interface IsinResult {
  input: string;
  normalized: string;
  valid: boolean;
  countryCode: string | null;
  checkDigit: string | null;
  expectedCheckDigit: string | null;
  errors: string[];
}

function expand(body: string): string {
  let out = "";
  for (const c of body) {
    out += /[0-9]/.test(c) ? c : (c.charCodeAt(0) - 55).toString(); // A=10 … Z=35
  }
  return out;
}

// Luhn over the digit string; returns the check digit that makes it divisible by 10.
function luhnCheckDigit(digits: string): number {
  let sum = 0;
  let dbl = true; // rightmost converted digit is doubled (check digit sits to its right)
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return (10 - (sum % 10)) % 10;
}

export function validateIsin(input: string): IsinResult {
  const s = input.trim().toUpperCase().replace(/\s/g, "");
  const base: IsinResult = {
    input,
    normalized: s,
    valid: false,
    countryCode: null,
    checkDigit: null,
    expectedCheckDigit: null,
    errors: [],
  };
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(s)) {
    return { ...base, errors: ["Not an ISIN (expected 2-letter country + 9 alphanumeric + 1 check digit)."] };
  }
  const expected = luhnCheckDigit(expand(s.slice(0, 11)));
  const actual = Number(s[11]);
  return {
    ...base,
    valid: expected === actual,
    countryCode: s.slice(0, 2),
    checkDigit: s[11],
    expectedCheckDigit: String(expected),
    errors: expected === actual ? [] : [`Checksum failed (ISO 6166 Luhn): expected check digit ${expected}.`],
  };
}
