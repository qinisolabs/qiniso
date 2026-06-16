// ISBN-10 — 9 digits + mod-11 check (which may be 'X' = 10).
export interface Isbn10Result {
  input: string;
  normalized: string;
  valid: boolean;
  expectedCheck: string | null;
  errors: string[];
}

export function validateIsbn10(input: string): Isbn10Result {
  const s = input.replace(/[\s-]/g, "").toUpperCase();
  const base: Isbn10Result = { input, normalized: s, valid: false, expectedCheck: null, errors: [] };
  if (!/^\d{9}[\dX]$/.test(s)) return { ...base, errors: ["Not an ISBN-10 (9 digits + check digit 0-9 or X)."] };
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
  const r = (11 - (sum % 11)) % 11;
  const expected = r === 10 ? "X" : String(r);
  const ok = expected === s[9];
  return { ...base, valid: ok, expectedCheck: expected, errors: ok ? [] : [`Checksum failed (ISBN-10 mod-11): expected '${expected}'.`] };
}
