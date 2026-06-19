// Estonia — isikukood (personal identification code). 11 digits; two-stage mod-11 check.
export interface EeIsikukoodResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "EE";
  idType: "Isikukood";
  errors: string[];
}

export function validateEeIsikukood(input: string): EeIsikukoodResult {
  const clean = input.replace(/\D/g, "");
  const base: EeIsikukoodResult = { input, normalized: clean, valid: false, country: "EE", idType: "Isikukood", errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["Estonian isikukood must be 11 digits."] };
  const d = clean.split("").map(Number);
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  let s1 = 0;
  for (let i = 0; i < 10; i++) s1 += d[i] * w1[i];
  let c = s1 % 11;
  if (c === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
    let s2 = 0;
    for (let i = 0; i < 10; i++) s2 += d[i] * w2[i];
    c = s2 % 11;
    if (c === 10) c = 0;
  }
  const ok = c === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (two-stage mod-11)."] };
}
