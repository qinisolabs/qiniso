// TLD verification against the authoritative IANA root-zone list (curated moat).
// JSON module import → runs on Node and Cloudflare Workers (no node:fs).
import tlds from "./data/tlds.json" with { type: "json" };

const SET = new Set((tlds as string[]).map((t) => t.toLowerCase()));

export function isKnownTld(tld: string): boolean {
  return SET.has(tld.toLowerCase().replace(/^\./, ""));
}

export function knownTldCount(): number {
  return SET.size;
}

export interface TldResult {
  input: string;
  tld: string;
  valid: boolean;
  isIdn: boolean;
  errors: string[];
}

export function validateTld(input: string): TldResult {
  const tld = input.trim().toLowerCase().replace(/^\./, "");
  const valid = SET.has(tld);
  return {
    input,
    tld,
    valid,
    isIdn: tld.startsWith("xn--"),
    errors: valid ? [] : [`".${tld}" is not a delegated TLD in the IANA root zone.`],
  };
}
