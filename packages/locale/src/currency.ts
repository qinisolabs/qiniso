// Locale-correct currency formatting via the native Intl API (ICU/CLDR).
const DEFAULT_LOCALE: Record<string, string> = { GBP: "en-GB", USD: "en-US" };

export interface CurrencyResult {
  ok: boolean;
  formatted?: string;
  amount: number;
  currency: string;
  locale: string;
  reason?: string;
}

export function formatMoney(amount: number, currency = "GBP", locale?: string): CurrencyResult {
  currency = (currency || "GBP").toUpperCase();
  const loc = locale || DEFAULT_LOCALE[currency] || "en-US";
  try {
    const formatted = new Intl.NumberFormat(loc, { style: "currency", currency }).format(amount);
    return { ok: true, formatted, amount, currency, locale: loc };
  } catch (e) {
    return { ok: false, reason: String(e), amount, currency, locale: loc };
  }
}
