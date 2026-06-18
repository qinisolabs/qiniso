// Turkey — T.C. Kimlik No (TCKN). 11 digits; two algorithmic check digits.
export interface TcknResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "TR";
  idType: "TCKN";
  errors: string[];
}

export function validateTckn(input: string): TcknResult {
  const clean = input.replace(/\D/g, "");
  const base: TcknResult = { input, normalized: clean, valid: false, country: "TR", idType: "TCKN", errors: [] };
  if (clean.length !== 11) return { ...base, errors: ["TCKN must be 11 digits."] };
  const d = clean.split("").map(Number);
  if (d[0] === 0) return { ...base, errors: ["TCKN cannot start with 0."] };
  const odd = d[0] + d[2] + d[4] + d[6] + d[8];
  const even = d[1] + d[3] + d[5] + d[7];
  const d10 = (((odd * 7 - even) % 10) + 10) % 10;
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += d[i];
  const d11 = sum % 10;
  const ok = d10 === d[9] && d11 === d[10];
  return { ...base, valid: ok, errors: ok ? [] : ["Checksum failed (TCKN check digits)."] };
}
