// Romania — CNP (Cod Numeric Personal). 13 digits; weighted mod-11 check digit.
export interface RoCnpResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "RO";
  idType: "CNP";
  errors: string[];
}

export function validateRoCnp(input: string): RoCnpResult {
  const clean = input.replace(/\D/g, "");
  const base: RoCnpResult = { input, normalized: clean, valid: false, country: "RO", idType: "CNP", errors: [] };
  if (clean.length !== 13) return { ...base, errors: ["Romanian CNP must be 13 digits."] };
  const d = clean.split("").map(Number);
  const w = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * w[i];
  let c = sum % 11;
  if (c === 10) c = 1;
  const ok = c === d[12];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (CNP weighted mod-11)."] };
}
