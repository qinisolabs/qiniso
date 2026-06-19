// Croatia — OIB (Osobni identifikacijski broj). 11 digits; ISO 7064 MOD 11,10 check.
export interface HrOibResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "HR";
  idType: "OIB";
  errors: string[];
}

export function validateHrOib(input: string): HrOibResult {
  const clean = input.replace(/\D/g, "");
  const base: HrOibResult = { input, normalized: clean, valid: false, country: "HR", idType: "OIB", errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["Croatian OIB must be 11 digits."] };
  const d = clean.split("").map(Number);
  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = (a + d[i]) % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  const check = (11 - a) % 10;
  const ok = check === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (ISO 7064 MOD 11,10)."] };
}
