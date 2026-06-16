// Spain DNI / NIE — control letter via mod-23.
const LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export interface DniResult {
  input: string;
  normalized: string;
  valid: boolean;
  type: "DNI" | "NIE" | null;
  errors: string[];
}

export function validateDni(input: string): DniResult {
  const s = input.toUpperCase().replace(/[\s-]/g, "");
  const base: DniResult = { input, normalized: s, valid: false, type: null, errors: [] };

  // DNI: 8 digits + letter.  NIE: [XYZ] + 7 digits + letter.
  let numberPart: string;
  let type: "DNI" | "NIE";
  if (/^[0-9]{8}[A-Z]$/.test(s)) {
    numberPart = s.slice(0, 8);
    type = "DNI";
  } else if (/^[XYZ][0-9]{7}[A-Z]$/.test(s)) {
    const prefix = { X: "0", Y: "1", Z: "2" }[s[0]]!;
    numberPart = prefix + s.slice(1, 8);
    type = "NIE";
  } else {
    return { ...base, errors: ["Not a valid DNI (8 digits + letter) or NIE (X/Y/Z + 7 digits + letter)."] };
  }

  const expected = LETTERS[Number(numberPart) % 23];
  const ok = s[s.length - 1] === expected;
  return {
    ...base,
    valid: ok,
    type,
    errors: ok ? [] : [`Control letter failed (mod-23): expected '${expected}'.`],
  };
}
