// Czech Republic / Slovakia — rodné číslo (birth number). The modern 10-digit form is
// divisible by 11. (Pre-1954 9-digit numbers have no check digit and are not accepted here.)
export interface CzRodneCisloResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "CZ";
  idType: "Rodné číslo";
  errors: string[];
}

export function validateCzRodneCislo(input: string): CzRodneCisloResult {
  const clean = input.replace(/\D/g, "");
  const base: CzRodneCisloResult = { input, normalized: clean, valid: false, country: "CZ", idType: "Rodné číslo", errors: [] };
  if (clean.length !== 10) return { ...base, errors: ["Modern rodné číslo must be 10 digits (9-digit pre-1954 numbers are not checkable)."] };
  const ok = Number(clean) % 11 === 0;
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (must be divisible by 11)."] };
}
