// Bitcoin address validation: Base58Check (P2PKH/P2SH, double-SHA256 checksum)
// and Bech32/Bech32m SegWit (bc1…). Wraps audited @scure/base + @noble/hashes.
import { base58check, bech32, bech32m } from "@scure/base";
import { sha256 } from "@noble/hashes/sha256";

const b58c = base58check(sha256);

export interface BtcResult {
  input: string;
  valid: boolean;
  type: string | null;
  network: string | null;
  errors: string[];
}

// Base58Check version byte → address type/network.
const BASE58_VERSIONS: Record<number, { type: string; network: string }> = {
  0x00: { type: "P2PKH", network: "mainnet" },
  0x05: { type: "P2SH", network: "mainnet" },
  0x6f: { type: "P2PKH", network: "testnet" },
  0xc4: { type: "P2SH", network: "testnet" },
};

const HRP: Record<string, string> = { bc: "mainnet", tb: "testnet", bcrt: "regtest" };

export function validateBtcAddress(input: string): BtcResult {
  const s = input.trim();
  const fail = (msg: string): BtcResult => ({ input, valid: false, type: null, network: null, errors: [msg] });

  // --- SegWit (bech32 / bech32m) ---
  if (/^(bc1|tb1|bcrt1)/i.test(s)) {
    const lower = s.toLowerCase();
    const hrp = lower.startsWith("bcrt1") ? "bcrt" : lower.slice(0, 2);
    for (const [coder, isM] of [[bech32, false], [bech32m, true]] as const) {
      try {
        const dec = coder.decode(lower as `${string}1${string}`, 90);
        const version = dec.words[0];
        // SegWit rule: v0 uses bech32; v1+ (e.g. Taproot) uses bech32m.
        if ((version === 0) === isM) continue;
        const type = version === 0 ? "SegWit v0 (P2WPKH/P2WSH)" : version === 1 ? "Taproot (P2TR)" : `SegWit v${version}`;
        return { input, valid: true, type, network: HRP[hrp] ?? null, errors: [] };
      } catch {
        /* try the other encoding */
      }
    }
    return fail("Invalid SegWit (bech32/bech32m) address — checksum or format failed.");
  }

  // --- Legacy / P2SH (Base58Check) ---
  try {
    const data = b58c.decode(s);
    const version = data[0];
    const info = BASE58_VERSIONS[version];
    if (!info) return fail(`Valid Base58Check, but unknown version byte 0x${version.toString(16)}.`);
    return { input, valid: true, type: info.type, network: info.network, errors: [] };
  } catch {
    return fail("Not a valid Bitcoin address (Base58Check checksum or format failed).");
  }
}
