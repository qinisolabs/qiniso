// Netherlands — BSN (burgerservicenummer). 8–9 digits; the "11-test" (elfproef).
export interface BsnResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "NL";
  idType: "BSN";
  errors: string[];
}

export function validateBsn(input: string): BsnResult {
  let clean = input.replace(/\D/g, "");
  if (clean.length === 8) clean = "0" + clean; // BSNs may be written with a leading zero dropped
  const base: BsnResult = { input, normalized: clean, valid: false, country: "NL", idType: "BSN", errors: [] };
  if (!/^\d{9}$/.test(clean)) return { ...base, errors: ["BSN must be 8 or 9 digits."] };
  const d = clean.split("").map(Number);
  if (d.every((x) => x === 0)) return { ...base, errors: ["Invalid BSN (all zeros)."] };
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += (9 - i) * d[i];
  sum -= d[8];
  const ok = sum % 11 === 0;
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (BSN 11-test)."] };
}
