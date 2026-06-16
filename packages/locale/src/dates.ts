// Locale-aware date parsing -> ISO 8601, or {valid:false}.
const DAYFIRST: Record<string, boolean> = { "en-GB": true, "en-US": false };
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const NUMERIC = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Build an ISO date only if (y,m,d) is a real calendar date (no overflow).
function buildIso(y: number, m: number, d: number): string | null {
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d) {
    return `${y}-${pad(m)}-${pad(d)}`;
  }
  return null;
}

export interface DateResult {
  valid: boolean;
  iso?: string;
  locale: string;
  dayfirst?: boolean;
  input?: string;
  reason?: string;
}

export function parseDate(text: string, locale = "en-GB"): DateResult {
  locale = locale || "en-GB";
  let dayfirst = DAYFIRST[locale] ?? true;
  const s = (text ?? "").trim();
  if (!s) return { valid: false, reason: "empty input", locale };

  // ISO dates are unambiguous: never reorder
  if (ISO.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const iso = buildIso(y, m, d);
    return iso
      ? { valid: true, iso, locale, dayfirst: false, input: text }
      : { valid: false, reason: "impossible date", locale, input: text };
  }

  // Ambiguous numeric dates: apply locale day/month ordering
  const num = s.match(NUMERIC);
  if (num) {
    const a = Number(num[1]);
    const b = Number(num[2]);
    const y = Number(num[3]);
    const day = dayfirst ? a : b;
    const month = dayfirst ? b : a;
    const iso = buildIso(y, month, day);
    return iso
      ? { valid: true, iso, locale, dayfirst, input: text }
      : { valid: false, reason: "unparseable or impossible date", locale, input: text };
  }

  // Written forms (e.g. "1st February 2025", "Jan 2, 2025")
  const cleaned = s.replace(/(\d+)(st|nd|rd|th)\b/gi, "$1");
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    const iso = buildIso(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
    if (iso) return { valid: true, iso, locale, dayfirst, input: text };
  }
  return { valid: false, reason: "unparseable or impossible date", locale, input: text };
}
