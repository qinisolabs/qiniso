// Nordics — Sweden personnummer (Luhn), Norway fødselsnummer (two mod-11 control
// digits), Finland henkilötunnus / HETU (mod-31 check character).

export interface PersonnummerResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "SE";
  idType: "Personnummer";
  errors: string[];
}

export function validatePersonnummer(input: string): PersonnummerResult {
  const digits = input.replace(/[+\-\s]/g, "");
  const base: PersonnummerResult = {
    input,
    normalized: digits,
    valid: false,
    country: "SE",
    idType: "Personnummer",
    errors: [],
  };
  if (!/^\d{10}$|^\d{12}$/.test(digits)) return { ...base, errors: ["Personnummer must be 10 or 12 digits."] };
  const ten = digits.length === 12 ? digits.slice(2) : digits; // Luhn runs over the 10-digit form
  const d = ten.split("").map(Number);
  let sum = 0;
  let dbl = true; // leftmost of the 10 digits is doubled
  for (let i = 0; i < 10; i++) {
    let x = d[i];
    if (dbl) {
      x *= 2;
      if (x > 9) x -= 9;
    }
    sum += x;
    dbl = !dbl;
  }
  const ok = sum % 10 === 0;
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (Luhn)."] };
}

export interface FodselsnummerResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "NO";
  idType: "Fødselsnummer";
  errors: string[];
}

export function validateFodselsnummer(input: string): FodselsnummerResult {
  const clean = input.replace(/\D/g, "");
  const base: FodselsnummerResult = {
    input,
    normalized: clean,
    valid: false,
    country: "NO",
    idType: "Fødselsnummer",
    errors: [],
  };
  if (clean.length !== 11) return { ...base, errors: ["Fødselsnummer must be 11 digits."] };
  const d = clean.split("").map(Number);
  const w1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
  let s1 = 0;
  for (let i = 0; i < 9; i++) s1 += w1[i] * d[i];
  let k1 = 11 - (s1 % 11);
  if (k1 === 11) k1 = 0;
  if (k1 === 10 || k1 !== d[9]) return { ...base, errors: ["First control digit failed (mod-11)."] };
  const w2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let s2 = 0;
  for (let i = 0; i < 9; i++) s2 += w2[i] * d[i];
  s2 += w2[9] * k1;
  let k2 = 11 - (s2 % 11);
  if (k2 === 11) k2 = 0;
  const ok = k2 !== 10 && k2 === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Second control digit failed (mod-11)."] };
}

const HETU = "0123456789ABCDEFHJKLMNPRSTUVWXY";

export interface HetuResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "FI";
  idType: "Henkilötunnus";
  errors: string[];
}

export function validateHetu(input: string): HetuResult {
  const s = input.toUpperCase().trim();
  const base: HetuResult = { input, normalized: s, valid: false, country: "FI", idType: "Henkilötunnus", errors: [] };
  const m = s.match(/^(\d{6})([+\-A-FYXWVU])(\d{3})([0-9A-Y])$/);
  if (!m) return { ...base, errors: ["HETU must be DDMMYY + century sign + 3 digits + check character."] };
  const num = Number(m[1] + m[3]);
  const expected = HETU[num % 31];
  const ok = expected === m[4];
  return { ...base, valid: ok, errors: ok ? [] : [`Check character failed (mod-31): expected '${expected}'.`] };
}
