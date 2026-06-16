// Ethereum address validation incl. EIP-55 mixed-case checksum.
// Wraps the audited @noble/hashes keccak-256 (a checksum no LLM can compute by hand).
import { keccak_256 } from "@noble/hashes/sha3";

export interface EthResult {
  input: string;
  valid: boolean;
  checksumStatus: "valid" | "invalid" | "none";
  expected: string | null;
  errors: string[];
}

function toEip55(hexLower: string): string {
  const hash = keccak_256(new TextEncoder().encode(hexLower));
  let out = "";
  for (let i = 0; i < hexLower.length; i++) {
    const c = hexLower[i];
    if (c >= "0" && c <= "9") {
      out += c;
    } else {
      const byte = hash[i >> 1];
      const nibble = i % 2 === 0 ? byte >> 4 : byte & 0x0f;
      out += nibble >= 8 ? c.toUpperCase() : c;
    }
  }
  return out;
}

export function validateEthAddress(input: string): EthResult {
  const s = input.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) {
    return { input, valid: false, checksumStatus: "none", expected: null, errors: ["Not an Ethereum address (expected 0x followed by 40 hex chars)."] };
  }
  const body = s.slice(2);
  const allLower = body === body.toLowerCase();
  const allUpper = body === body.toUpperCase();

  // All-one-case = valid address with no case checksum applied.
  if (allLower || allUpper) {
    return { input, valid: true, checksumStatus: "none", expected: "0x" + toEip55(body.toLowerCase()), errors: [] };
  }

  // Mixed case = EIP-55 checksum must verify, else it's almost certainly a typo.
  const expected = "0x" + toEip55(body.toLowerCase());
  const ok = s === expected;
  return {
    input,
    valid: ok,
    checksumStatus: ok ? "valid" : "invalid",
    expected,
    errors: ok ? [] : ["EIP-55 checksum failed: the mixed-case capitalisation does not match (likely a typo)."],
  };
}
