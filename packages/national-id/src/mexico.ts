// Mexico — CURP (Clave Única de Registro de Población). 18 chars; a base-37
// weighted check digit over the first 17 characters.
const DICT = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export interface MxCurpResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "MX";
  idType: "CURP";
  errors: string[];
}

export function validateMxCurp(input: string): MxCurpResult {
  const s = input.toUpperCase().replace(/\s/g, "");
  const base: MxCurpResult = { input, normalized: s, valid: false, country: "MX", idType: "CURP", errors: [] };
  if (!/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(s)) {
    return { ...base, errors: ["Not a well-formed CURP (18 chars: 4 letters, 6 digits, sex, 5 letters, 1 alphanumeric, 1 check digit)."] };
  }
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += DICT.indexOf(s[i]) * (18 - i);
  const check = (10 - (sum % 10)) % 10;
  const ok = check === Number(s[17]);
  return { ...base, valid: ok, errors: ok ? [] : [`Check digit failed: expected ${check}.`] };
}
