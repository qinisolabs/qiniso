// Belgium — National Register Number (Rijksregisternummer / Numéro de Registre National).
// 11 digits; a mod-97 check over the first 9, with a "20" prefix for people born from 2000.
export interface BeNrnResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "BE";
  idType: "National Register Number";
  errors: string[];
}

export function validateBeNrn(input: string): BeNrnResult {
  const clean = input.replace(/\D/g, "");
  const base: BeNrnResult = {
    input,
    normalized: clean,
    valid: false,
    country: "BE",
    idType: "National Register Number",
    errors: [],
  };
  if (clean.length !== 11) return { ...base, errors: ["Belgian NRN must be 11 digits."] };
  const d = clean.split("").map(Number);
  const last2 = d[9] * 10 + d[10];
  const baseNum = Number(clean.slice(0, 9));
  const c19 = 97 - (baseNum % 97); // born before 2000
  const c20 = 97 - ((2_000_000_000 + baseNum) % 97); // born 2000 or later
  const ok = last2 === c19 || last2 === c20;
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (NRN mod-97)."] };
}
