// Germany — Steuer-Identifikationsnummer (tax ID / IdNr). 11 digits; ISO 7064-style
// "product method" check digit.
export interface DeSteuerIdResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "DE";
  idType: "Steuer-IdNr";
  errors: string[];
}

export function validateDeSteuerId(input: string): DeSteuerIdResult {
  const clean = input.replace(/\D/g, "");
  const base: DeSteuerIdResult = { input, normalized: clean, valid: false, country: "DE", idType: "Steuer-IdNr", errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["German tax ID must be 11 digits."] };
  if (clean[0] === "0") return { ...base, errors: ["German tax ID cannot start with 0."] };
  const d = clean.split("").map(Number);
  let product = 10;
  for (let i = 0; i < 10; i++) {
    let sum = (d[i] + product) % 10;
    if (sum === 0) sum = 10;
    product = (sum * 2) % 11;
  }
  const check = (11 - product) % 10;
  const ok = check === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (Steuer-IdNr product method)."] };
}
