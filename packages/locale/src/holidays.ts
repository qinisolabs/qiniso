// Public-holiday checks via date-holidays.
import Holidays from "date-holidays";

const SUPPORTED = new Set(["GB", "US"]);
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

export interface HolidayResult {
  ok: boolean;
  date?: string;
  country?: string;
  subdiv?: string | null;
  is_holiday?: boolean;
  name?: string | null;
  reason?: string;
}

export function isHoliday(date: string, country = "GB", subdiv?: string): HolidayResult {
  country = (country || "GB").toUpperCase();
  if (!SUPPORTED.has(country)) return { ok: false, reason: `country ${country} not supported in v1` };
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
  };
}

export interface NextHolidayResult {
  ok: boolean;
  country?: string;
  subdiv?: string | null;
  date?: string;
  name?: string;
  reason?: string;
}

export function nextHoliday(country = "GB", after?: string, subdiv?: string): NextHolidayResult {
  country = (country || "GB").toUpperCase();
  if (!SUPPORTED.has(country)) return { ok: false, reason: `country ${country} not supported in v1` };
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
      return { ok: true, country, subdiv: used ?? null, date: all[0].iso, name: all[0].name };
    }
  }
  return { ok: false, reason: "none found in window" };
}
