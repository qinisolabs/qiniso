// URL validation via the WHATWG URL parser (global on Node 18+ and Workers),
// enriched with an authoritative TLD check on the host.
import { isKnownTld } from "./tld.js";

export interface UrlResult {
  input: string;
  valid: boolean;
  protocol: string | null;
  hostname: string | null;
  tld: string | null;
  tldKnown: boolean;
  port: string | null;
  path: string | null;
  errors: string[];
}

export function validateUrl(input: string): UrlResult {
  const s = input.trim();
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return {
      input,
      valid: false,
      protocol: null,
      hostname: null,
      tld: null,
      tldKnown: false,
      port: null,
      path: null,
      errors: ["Not a parseable absolute URL (needs a scheme, e.g. https://…)."],
    };
  }
  const host = u.hostname;
  const tld = host.includes(".") ? host.split(".").pop()!.toLowerCase() : null;
  const tldKnown = tld ? isKnownTld(tld) : false;
  const errors: string[] = [];
  if (tld && !tldKnown) errors.push(`Host TLD ".${tld}" is not in the IANA root zone.`);
  return {
    input,
    valid: true,
    protocol: u.protocol.replace(":", ""),
    hostname: host,
    tld,
    tldKnown,
    port: u.port || null,
    path: u.pathname || null,
    errors,
  };
}
