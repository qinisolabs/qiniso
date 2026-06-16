// EU/EFTA VAT-number validation (format + checksum) by wrapping the audited
// `jsvat-next` library. This is OFFLINE/deterministic — it does NOT check whether
// the number is actually registered (that is VIES, a live lookup = hosted tier).
import { checkVAT, countries } from "jsvat-next";

export interface VatResult {
  input: string;
  normalized: string;
  valid: boolean;
  country: string | null;
  countryCode: string | null;
  errors: string[];
}

export function validateVat(input: string, country?: string): VatResult {
  let raw = String(input ?? "")
    .toUpperCase()
    .replace(/[\s.\-]/g, "");
  // If a separate country code is supplied and the number has no 2-letter prefix, prepend it.
  if (country && !/^[A-Z]{2}/.test(raw)) {
    raw = country.toUpperCase().slice(0, 2) + raw;
  }
  const r = checkVAT(raw, countries);
  const cc = (r.country as any)?.isoCode?.short ?? null;
  return {
    input,
    normalized: raw,
    valid: !!r.isValid,
    country: r.country?.name ?? null,
    countryCode: cc,
    errors: r.isValid
      ? []
      : ["Invalid VAT number — format or checksum failed (NOTE: this does not check VIES registration)."],
  };
}
