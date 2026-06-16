// Tax-rate lookups: UK VAT by date, US sales tax by state.
// Curated JSON imported as modules (not node:fs) so this runs on Node and edge runtimes.
import ukData from "./data/uk_vat.json" with { type: "json" };
import usData from "./data/us_sales_tax.json" with { type: "json" };

interface UkBand { from: string; rate: number; note?: string }
interface UkData { standard_rate_history: UkBand[]; source: string; last_verified: string }
interface UsData {
  state_base_rates: Record<string, number>;
  rate_notes: Record<string, string>;
  note: string;
  source: string;
  last_verified: string;
}

const UK: UkData = ukData as UkData;
const US: UsData = usData as UsData;

export interface TaxResult {
  ok: boolean;
  country?: string;
  tax_name?: string;
  rate?: number;
  date?: string;
  effective_from?: string;
  kind?: string;
  note?: string | null;
  national_vat?: number;
  scope?: string;
  state?: string;
  state_note?: string;
  source?: string;
  last_verified?: string;
  reason?: string;
}

function ukVat(date: string): TaxResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, reason: `bad date: ${date}` };
  let applicable: UkBand | null = null;
  for (const band of UK.standard_rate_history) {
    if (band.from <= date) applicable = band;
    else break;
  }
  if (!applicable) {
    return { ok: false, reason: `no UK VAT rate recorded for ${date}` };
  }
  return {
    ok: true,
    country: "GB",
    tax_name: "VAT",
    rate: applicable.rate,
    date,
    effective_from: applicable.from,
    kind: "standard",
    note: applicable.note ?? null,
    source: UK.source,
    last_verified: UK.last_verified,
  };
}

function usTax(date: string, state?: string): TaxResult {
  const base: TaxResult = {
    ok: true,
    country: "US",
    tax_name: "Sales tax",
    national_vat: 0.0,
    date,
    note: US.note,
    source: US.source,
    last_verified: US.last_verified,
  };
  if (!state) {
    return { ...base, rate: 0.0, scope: "national (US has no VAT; supply a state for sales tax)" };
  }
  const st = state.toUpperCase();
  const rate = US.state_base_rates[st];
  if (rate === undefined) return { ok: false, reason: `unknown US state code: ${st}` };
  return {
    ...base,
    rate,
    scope: "state base rate (local taxes add on top)",
    state: st,
    state_note: US.rate_notes[st],
  };
}

export function vatRate(country = "GB", date?: string, state?: string): TaxResult {
  country = (country || "GB").toUpperCase();
  const d = date || new Date().toISOString().slice(0, 10);
  if (country === "GB") return ukVat(d);
  if (country === "US") return usTax(d, state);
  return { ok: false, reason: `country ${country} not supported in v1 (GB, US only)` };
}
