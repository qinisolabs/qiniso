// Italy — Codice Fiscale (personal tax code). 16 chars; the final letter is an
// ISO-style mod-26 check character computed over the first 15 characters.
const ODD = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
const cval = (c: string): number => (c >= "0" && c <= "9" ? c.charCodeAt(0) - 48 : c.charCodeAt(0) - 65);

export interface CodiceFiscaleResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "IT";
  idType: "Codice Fiscale";
  errors: string[];
}

export function validateCodiceFiscale(input: string): CodiceFiscaleResult {
  const s = input.toUpperCase().replace(/\s/g, "");
  const base: CodiceFiscaleResult = {
    input,
    normalized: s,
    valid: false,
    country: "IT",
    idType: "Codice Fiscale",
    errors: [],
  };
  if (!/^[A-Z0-9]{15}[A-Z]$/.test(s)) {
    return { ...base, errors: ["Codice Fiscale must be 15 alphanumerics followed by a letter check character."] };
  }
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const v = cval(s[i]);
    sum += i % 2 === 0 ? ODD[v] : v; // position 1 (i=0) is "odd"
  }
  const expected = String.fromCharCode(65 + (sum % 26));
  const ok = expected === s[15];
  return { ...base, valid: ok, errors: ok ? [] : [`Check character failed (mod-26): expected '${expected}'.`] };
}
