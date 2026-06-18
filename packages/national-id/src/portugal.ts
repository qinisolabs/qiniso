// Portugal — NIF (Número de Identificação Fiscal). 9 digits; mod-11 check digit.
export interface NifPtResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "PT";
  idType: "NIF";
  errors: string[];
}

export function validateNifPt(input: string): NifPtResult {
  const clean = input.replace(/\D/g, "");
  const base: NifPtResult = { input, normalized: clean, valid: false, country: "PT", idType: "NIF", errors: [] };
  if (clean.length !== 9) return { ...base, errors: ["Portuguese NIF must be 9 digits."] };
  const d = clean.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += d[i] * (9 - i);
  const r = sum % 11;
  const check = r < 2 ? 0 : 11 - r;
  const ok = check === d[8];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (NIF mod-11)."] };
}
