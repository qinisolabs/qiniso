// LEI (ISO 17442) — 20 chars; last 2 are ISO 7064 MOD 97-10 check digits.
export interface LeiResult {
  input: string;
  normalized: string;
  valid: boolean;
  errors: string[];
}

export function validateLei(input: string): LeiResult {
  const s = input.trim().toUpperCase().replace(/\s/g, "");
  if (!/^[0-9A-Z]{18}[0-9]{2}$/.test(s)) {
    return { input, normalized: s, valid: false, errors: ["Not an LEI (expected 20 chars: 18 alphanumeric + 2 check digits)."] };
  }
  // Expand letters to digits, then compute mod 97 incrementally (must equal 1).
  let rem = 0;
  for (const c of s) {
    const part = /[0-9]/.test(c) ? c : (c.charCodeAt(0) - 55).toString();
    for (const d of part) rem = (rem * 10 + (d.charCodeAt(0) - 48)) % 97;
  }
  const valid = rem === 1;
  return {
    input,
    normalized: s,
    valid,
    errors: valid ? [] : ["Checksum failed (ISO 7064 MOD 97-10): the LEI is not valid."],
  };
}
