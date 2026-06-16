// Best-effort UK/US address parsing into {country, postcode, city}.
const UK_POSTCODE = /\b(GIR ?0AA|[A-PR-UWYZ][A-HK-Y]?[0-9][0-9A-HJKPS-UW]? ?[0-9][ABD-HJLNP-UW-Z]{2})\b/i;
const US_STATE_ZIP = /\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/;
const UK_HINT = /\b(United Kingdom|U\.?K\.?|England|Scotland|Wales|Northern Ireland)\b/i;
const US_HINT = /\b(United States|U\.?S\.?A?\.?)\b/i;
const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
]);

export interface AddressResult {
  ok: boolean;
  input?: string;
  country?: string | null;
  postcode?: string | null;
  state?: string | null;
  city?: string | null;
  confidence?: "none" | "low" | "medium" | "high";
  reason?: string;
}

function normaliseUk(pc: string): string {
  const c = pc.replace(/\s+/g, "").toUpperCase();
  return c.slice(0, -3) + " " + c.slice(-3);
}

function guessCity(raw: string, country: string | null, postcode: string | null, state: string | null): string | null {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  if (country === "US" && state && postcode) {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].includes(state) && parts[i].includes(postcode) && i > 0) return parts[i - 1];
    }
  }
  if (country === "GB" && postcode) {
    const pcKey = postcode.replace(/\s+/g, "").toUpperCase();
    for (const p of parts) {
      if (p.replace(/\s+/g, "").toUpperCase().includes(pcKey)) {
        const cleaned = p.replace(UK_POSTCODE, "").replace(/[,\s]+$/, "").trim();
        if (cleaned) return cleaned;
      }
    }
    return parts.length >= 2 ? parts[parts.length - 2] : null;
  }
  return null;
}

function confidence(country: string | null, postcode: string | null, city: string | null): AddressResult["confidence"] {
  const score = (country ? 1 : 0) + (postcode ? 1 : 0) + (city ? 1 : 0);
  return (["none", "low", "medium", "high"] as const)[score];
}

export function parseAddress(text: string): AddressResult {
  const raw = (text ?? "").trim();
  if (!raw) return { ok: false, reason: "empty input" };

  const ukPc = raw.match(UK_POSTCODE);
  const usSz = raw.match(US_STATE_ZIP);
  const usValid = !!(usSz && US_STATES.has(usSz[1].toUpperCase()));

  let country: string | null = null;
  let postcode: string | null = null;
  let state: string | null = null;

  if (ukPc && !usValid) {
    country = "GB";
    postcode = normaliseUk(ukPc[1]);
  } else if (usValid && usSz) {
    country = "US";
    state = usSz[1].toUpperCase();
    postcode = usSz[2];
  } else if (UK_HINT.test(raw)) {
    country = "GB";
    postcode = ukPc ? normaliseUk(ukPc[1]) : null;
  } else if (US_HINT.test(raw)) {
    country = "US";
  }

  const city = guessCity(raw, country, postcode, state);
  return { ok: true, input: raw, country, postcode, state, city, confidence: confidence(country, postcode, city) };
}
