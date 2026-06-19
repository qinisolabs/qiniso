// Bulgaria — EGN (Единен граждански номер). 10 digits; weighted mod-11 check digit.
export interface BgEgnResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "BG";
  idType: "EGN";
  errors: string[];
}

export function validateBgEgn(input: string): BgEgnResult {
  const clean = input.replace(/\D/g, "");
  const base: BgEgnResult = { input, normalized: clean, valid: false, country: "BG", idType: "EGN", errors: [] };
  if (clean.length !== 10) return { ...base, errors: ["Bulgarian EGN must be 10 digits."] };
  const d = clean.split("").map(Number);
  const w = [2, 4, 8, 5, 10, 9, 7, 3, 6];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += d[i] * w[i];
  let c = sum % 11;
  if (c === 10) c = 0;
  const ok = c === d[9];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (EGN weighted mod-11)."] };
}
