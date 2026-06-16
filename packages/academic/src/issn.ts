// ISSN — 7 digits + mod-11 check (which may be 'X' = 10).
export interface IssnResult {
  input: string;
  normalized: string;
  valid: boolean;
  expectedCheck: string | null;
  errors: string[];
}

export function validateIssn(input: string): IssnResult {
  const s = input.replace(/[\s-]/g, "").toUpperCase();
  const base: IssnResult = { input, normalized: s, valid: false, expectedCheck: null, errors: [] };
  if (!/^\d{7}[\dX]$/.test(s)) return { ...base, errors: ["Not an ISSN (7 digits + check digit 0-9 or X)."] };
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += Number(s[i]) * (8 - i);
  const r = (11 - (sum % 11)) % 11;
  const expected = r === 10 ? "X" : String(r);
  const ok = expected === s[7];
  return { ...base, valid: ok, expectedCheck: expected, errors: ok ? [] : [`Checksum failed (ISSN mod-11): expected '${expected}'.`] };
}
