// Email-address syntax validation (practical RFC 5321/5322 subset) plus an
// authoritative TLD check on the domain. Does NOT check deliverability.
import { isKnownTld } from "./tld.js";

const LOCAL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

export interface EmailResult {
  input: string;
  valid: boolean;
  local: string | null;
  domain: string | null;
  tld: string | null;
  tldKnown: boolean;
  errors: string[];
}

export function validateEmail(input: string): EmailResult {
  const s = input.trim();
  const at = s.lastIndexOf("@");
  const errors: string[] = [];
  if (at <= 0 || at === s.length - 1) {
    return { input, valid: false, local: null, domain: null, tld: null, tldKnown: false, errors: ["Missing local part or domain around '@'."] };
  }
  const local = s.slice(0, at);
  const domain = s.slice(at + 1);

  if (local.length > 64 || !LOCAL_RE.test(local)) errors.push("Invalid local part (before '@').");

  const labels = domain.split(".");
  if (labels.length < 2) errors.push("Domain must have at least one dot.");
  if (!labels.every((l) => LABEL_RE.test(l))) errors.push("Invalid domain label.");
  if (domain.length > 253) errors.push("Domain exceeds 253 characters.");

  const tld = labels.length >= 2 ? labels[labels.length - 1].toLowerCase() : null;
  const tldKnown = tld ? isKnownTld(tld) : false;
  if (tld && !tldKnown) errors.push(`Domain TLD ".${tld}" is not in the IANA root zone.`);

  return { input, valid: errors.length === 0, local, domain, tld, tldKnown, errors };
}
