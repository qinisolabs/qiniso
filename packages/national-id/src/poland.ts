// Poland — PESEL. 11 digits; weighted mod-10 check digit.
export interface PeselResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "PL";
  idType: "PESEL";
  errors: string[];
}

export function validatePesel(input: string): PeselResult {
  const clean = input.replace(/\D/g, "");
  const base: PeselResult = { input, normalized: clean, valid: false, country: "PL", idType: "PESEL", errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["PESEL must be 11 digits."] };
  const d = clean.split("").map(Number);
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += w[i] * d[i];
  const check = (10 - (sum % 10)) % 10;
  const ok = check === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (PESEL weighted mod-10)."] };
}
