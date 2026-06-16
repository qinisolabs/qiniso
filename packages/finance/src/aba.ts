// ABA / routing transit number — 9 digits, weighted (3,7,1) mod-10 checksum.
export interface AbaResult {
  input: string;
  normalized: string;
  valid: boolean;
  errors: string[];
}

export function validateAba(input: string): AbaResult {
  const s = input.trim().replace(/\s|-/g, "");
  if (!/^\d{9}$/.test(s)) {
    return { input, normalized: s, valid: false, errors: ["Not a routing number (expected 9 digits)."] };
  }
  const d = s.split("").map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);
  const valid = sum % 10 === 0;
  return {
    input,
    normalized: s,
    valid,
    errors: valid ? [] : ["Checksum failed (ABA weighted mod-10): the routing number is not valid."],
  };
}
