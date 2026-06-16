// Brazil CPF (individuals) and CNPJ (companies) — mod-11 check digits.

export interface CpfResult {
  input: string;
  normalized: string;
  valid: boolean;
  errors: string[];
}

function digits(s: string): number[] {
  return s.replace(/\D/g, "").split("").map(Number);
}

export function validateCpf(input: string): CpfResult {
  const clean = input.replace(/\D/g, "");
  const base: CpfResult = { input, normalized: clean, valid: false, errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["CPF must have 11 digits."] };
  if (/^(\d)\1{10}$/.test(clean)) return { ...base, errors: ["Invalid CPF (all digits identical)."] };
  const d = digits(clean);

  const check = (len: number): number => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += d[i] * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const ok = check(9) === d[9] && check(10) === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (CPF mod-11)."] };
}

export interface CnpjResult {
  input: string;
  normalized: string;
  valid: boolean;
  errors: string[];
}

export function validateCnpj(input: string): CnpjResult {
  const clean = input.replace(/\D/g, "");
  const base: CnpjResult = { input, normalized: clean, valid: false, errors: [] };
  if (clean.length !== 14) return { ...base, errors: ["CNPJ must have 14 digits."] };
  if (/^(\d)\1{13}$/.test(clean)) return { ...base, errors: ["Invalid CNPJ (all digits identical)."] };
  const d = digits(clean);

  const check = (len: number): number => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += d[i] * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const ok = check(12) === d[12] && check(13) === d[13];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (CNPJ mod-11)."] };
}
