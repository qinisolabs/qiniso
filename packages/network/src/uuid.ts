// UUID validation + version/variant extraction (RFC 4122 / RFC 9562).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_RE = /^0{8}-0{4}-0{4}-0{4}-0{12}$/;

export interface UuidResult {
  input: string;
  valid: boolean;
  version: number | null;
  variant: string | null;
  isNil: boolean;
  errors: string[];
}

export function validateUuid(input: string): UuidResult {
  const s = input.trim();
  if (!UUID_RE.test(s)) {
    return {
      input,
      valid: false,
      version: null,
      variant: null,
      isNil: false,
      errors: ["Not a canonical UUID (expected 8-4-4-4-12 hex digits)."],
    };
  }
  const isNil = NIL_RE.test(s);
  const version = isNil ? 0 : parseInt(s[14], 16);
  const v = parseInt(s[19], 16);
  let variant = "reserved";
  if ((v & 0b1000) === 0) variant = "NCS (legacy)";
  else if ((v & 0b1100) === 0b1000) variant = "RFC 4122";
  else if ((v & 0b1110) === 0b1100) variant = "Microsoft (legacy)";
  return { input, valid: true, version, variant, isNil, errors: [] };
}
