// France — NIR (Numéro de Sécurité Sociale / INSEE). 13 digits + a 2-digit key;
// key = 97 − (number mod 97), with the Corsica 2A/2B substitution.
export interface FrNirResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: "FR";
  idType: "NIR (Numéro de Sécurité Sociale)";
  errors: string[];
}

export function validateFrNir(input: string): FrNirResult {
  const s = input.toUpperCase().replace(/\s/g, "");
  const base: FrNirResult = {
    input,
    normalized: s,
    valid: false,
    country: "FR",
    idType: "NIR (Numéro de Sécurité Sociale)",
    errors: [],
  };
  const m = s.match(/^([0-9]{5}[0-9][0-9AB][0-9]{6})([0-9]{2})$/);
  if (!m) return { ...base, errors: ["French NIR must be 13 digits (Corsica 2A/2B allowed) + a 2-digit key."] };
  let body = m[1];
  let corsica = 0;
  if (body.includes("2A")) {
    body = body.replace("2A", "19");
    corsica = 1000000;
  } else if (body.includes("2B")) {
    body = body.replace("2B", "18");
    corsica = 2000000;
  }
  if (!/^[0-9]{13}$/.test(body)) return { ...base, errors: ["Invalid NIR structure."] };
  const key = 97 - ((Number(body) - corsica) % 97);
  const ok = key === Number(m[2]);
  return { ...base, valid: ok, errors: ok ? [] : [`Key failed (mod-97): expected ${String(key).padStart(2, "0")}.`] };
}
