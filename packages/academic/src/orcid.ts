// ORCID — 16 chars (15 digits + ISO 7064 MOD 11-2 check, 0-9 or X).
export interface OrcidResult {
  input: string;
  normalized: string;
  valid: boolean;
  expectedCheck: string | null;
  errors: string[];
}

function mod11_2(first15: string): string {
  let total = 0;
  for (const c of first15) total = ((total + Number(c)) * 2) % 11;
  const result = (12 - (total % 11)) % 11;
  return result === 10 ? "X" : String(result);
}

export function validateOrcid(input: string): OrcidResult {
  const s = input.replace(/[\s-]/g, "").replace(/^https?:\/\/orcid\.org\//i, "").toUpperCase();
  const base: OrcidResult = { input, normalized: s, valid: false, expectedCheck: null, errors: [] };
  if (!/^\d{15}[\dX]$/.test(s)) return { ...base, errors: ["Not an ORCID (16 chars: 15 digits + check digit 0-9 or X)."] };
  const expected = mod11_2(s.slice(0, 15));
  const ok = expected === s[15];
  return { ...base, valid: ok, expectedCheck: expected, errors: ok ? [] : [`Checksum failed (ISO 7064 MOD 11-2): expected '${expected}'.`] };
}
