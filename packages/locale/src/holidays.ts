// Public-holiday checks via date-holidays.
import Holidays from "date-holidays";

// Supported countries come from date-holidays itself (~200), not a hardcoded allowlist.
const COUNTRIES: Record<string, string> = new Holidays().getCountries();
function supported(country: string): boolean {
  return Object.prototype.hasOwnProperty.call(COUNTRIES, country);
}
// The bare GB calendar omits some England bank holidays; default to England.
const DEFAULT_SUBDIV: Record<string, string> = { GB: "ENG" };
// Holiday types that count as "is it a day off / bank holiday".
const COUNT_TYPES = new Set(["public", "bank"]);

function makeCal(country: string, subdiv?: string): Holidays {
  if (subdiv) {
    try {
      return new Holidays(country, subdiv);
    } catch {
      /* fall through to country-only */
    }
  }
  return new Holidays(country);
}

function isoOf(h: { date: string }): string {
  return h.date.slice(0, 10);
}

// Public/bank holidays only; one-off and some regional holidays are not covered.
const HOLIDAY_DISCLAIMER =
  "Public and bank holidays only; excludes most one-off and some regional holidays. Reference data, not legal advice — verify locally before relying on this for payroll or compliance.";

export interface HolidayResult {
  ok: boolean;
  date?: string;
  country?: string;
  subdiv?: string | null;
  is_holiday?: boolean;
  name?: string | null;
  disclaimer?: string;
  reason?: string;
}

export function isHoliday(date: string, country = "GB", subdiv?: string): HolidayResult {
  country = (country || "GB").toUpperCase();
  if (!supported(country)) return { ok: false, reason: `country ${country} not supported` };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: `bad date: ${date}` };
  const used = subdiv || DEFAULT_SUBDIV[country] || undefined;
  const cal = makeCal(country, used);
  const res = cal.isHoliday(new Date(`${date}T12:00:00`));
  const matches = Array.isArray(res) ? res.filter((h) => COUNT_TYPES.has(h.type)) : [];
  const hit = matches[0];
  return {
    ok: true,
    date,
    country,
    subdiv: used ?? null,
    is_holiday: matches.length > 0,
    name: hit ? hit.name : null,
    disclaimer: HOLIDAY_DISCLAIMER,
  };
}

export interface NextHolidayResult {
  ok: boolean;
  country?: string;
  subdiv?: string | null;
  date?: string;
  name?: string;
  disclaimer?: string;
  reason?: string;
}

export function nextHoliday(country = "GB", after?: string, subdiv?: string): NextHolidayResult {
  country = (country || "GB").toUpperCase();
  if (!supported(country)) return { ok: false, reason: `country ${country} not supported` };
  const start = after && /^\d{4}-\d{2}-\d{2}$/.test(after) ? after : new Date().toISOString().slice(0, 10);
  const used = subdiv || DEFAULT_SUBDIV[country] || undefined;
  const cal = makeCal(country, used);
  const startYear = Number(start.slice(0, 4));
  for (const yr of [startYear, startYear + 1]) {
    const all = (cal.getHolidays(yr) || [])
      .filter((h) => COUNT_TYPES.has(h.type))
      .map((h) => ({ iso: isoOf(h), name: h.name }))
      .filter((h) => h.iso >= start)
      .sort((a, b) => a.iso.localeCompare(b.iso));
    if (all.length) {
      return { ok: true, country, subdiv: used ?? null, date: all[0].iso, name: all[0].name, disclaimer: HOLIDAY_DISCLAIMER };
    }
  }
  return { ok: false, reason: "none found in window" };
}
