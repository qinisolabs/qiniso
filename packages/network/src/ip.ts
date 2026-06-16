// Strict, dependency-free IPv4/IPv6 validators (RFC 791 / RFC 4291).
// Pure functions — run on Node and edge runtimes (no node:net).

export function isIPv4(s: string): boolean {
  const parts = s.split(".");
  if (parts.length !== 4) return false;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return false;
    if (p.length > 1 && p[0] === "0") return false; // no leading zeros
    if (Number(p) > 255) return false;
  }
  return true;
}

export function isIPv6(s: string): boolean {
  if (s.includes("%")) return false; // reject zone IDs for strictness
  const parts = s.split("::");
  if (parts.length > 2) return false; // at most one "::"

  const groups = (seg: string): string[] => (seg === "" ? [] : seg.split(":"));
  const all = parts.length === 2 ? [...groups(parts[0]), ...groups(parts[1])] : groups(parts[0]);

  let count = 0;
  for (let i = 0; i < all.length; i++) {
    const g = all[i];
    if (g === "") return false; // empty group, e.g. ":::"
    const isFinal = i === all.length - 1;
    if (isFinal && g.includes(".")) {
      if (!isIPv4(g)) return false;
      count += 2; // embedded IPv4 counts as two 16-bit groups
    } else {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return false;
      count += 1;
    }
  }
  return parts.length === 2 ? count <= 7 : count === 8;
}

export interface IpResult {
  input: string;
  valid: boolean;
  version: 4 | 6 | null;
  errors: string[];
}

export function validateIp(input: string): IpResult {
  const s = input.trim();
  if (isIPv4(s)) return { input, valid: true, version: 4, errors: [] };
  if (isIPv6(s)) return { input, valid: true, version: 6, errors: [] };
  return { input, valid: false, version: null, errors: ["Not a valid IPv4 or IPv6 address."] };
}
