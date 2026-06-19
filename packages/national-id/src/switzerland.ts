// Switzerland — AHV/AVS social-insurance number. 13 digits starting 756; an EAN-13
// mod-10 check digit.
export interface ChAhvResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "CH";
  idType: "AHV/AVS";
  errors: string[];
}

export function validateChAhv(input: string): ChAhvResult {
  const clean = input.replace(/\D/g, "");
  const base: ChAhvResult = { input, normalized: clean, valid: false, country: "CH", idType: "AHV/AVS", errors: [] };
  if (clean.length !== 13) return { ...base, errors: ["Swiss AHV/AVS number must be 13 digits."] };
  if (!clean.startsWith("756")) return { ...base, errors: ["Swiss AHV/AVS number must start with 756."] };
  const d = clean.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += d[i] * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  const ok = check === d[12];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (EAN-13 mod-10)."] };
}
