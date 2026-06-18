// China — Resident Identity Card number (居民身份证). 18 chars; ISO 7064 MOD 11-2
// check character over the first 17 digits (the check may be 'X' = 10).
export interface ChinaRicResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "CN";
  idType: "Resident Identity Card";
  errors: string[];
}

export function validateChinaRic(input: string): ChinaRicResult {
  const s = input.toUpperCase().replace(/\s/g, "");
  const base: ChinaRicResult = {
    input,
    normalized: s,
    valid: false,
    country: "CN",
    idType: "Resident Identity Card",
    errors: [],
  };
  if (!/^\d{17}[0-9X]$/.test(s)) {
    return { ...base, errors: ["Chinese ID must be 17 digits followed by a check character (0-9 or X)."] };
  }
  const w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const map = "10X98765432";
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += w[i] * (s.charCodeAt(i) - 48);
  const expected = map[sum % 11];
  const ok = expected === s[17];
  return { ...base, valid: ok, errors: ok ? [] : [`Check character failed (ISO 7064 MOD 11-2): expected '${expected}'.`] };
}
