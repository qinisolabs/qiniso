// Domain-name structural validation + authoritative TLD existence check.
import { isKnownTld } from "./tld.js";

const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export interface DomainResult {
  input: string;
  normalized: string;
  valid: boolean;
  tld: string | null;
  tldKnown: boolean;
  errors: string[];
}

export function validateDomain(input: string): DomainResult {
  const normalized = input.trim().toLowerCase().replace(/\.$/, "");
  const labels = normalized.split(".");
  const errors: string[] = [];

  if (labels.length < 2) errors.push("A domain needs at least a name and a TLD.");
  if (!labels.every((l) => LABEL_RE.test(l))) errors.push("Contains an invalid label.");
  if (normalized.length > 253) errors.push("Domain exceeds 253 characters.");

  const tld = labels.length >= 2 ? labels[labels.length - 1] : null;
  const tldKnown = tld ? isKnownTld(tld) : false;
  if (tld && !tldKnown) errors.push(`TLD ".${tld}" is not in the IANA root zone.`);

  return { input, normalized, valid: errors.length === 0, tld, tldKnown, errors };
}
