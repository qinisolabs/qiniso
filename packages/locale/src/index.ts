// Library entry point — import these directly in your own code:
//   import { vatRate, parseDate } from "localecheck";
// (The MCP server lives in ./server.ts and is exposed via the `localecheck-mcp` bin.)
export { parseDate } from "./dates.js";
export type { DateResult } from "./dates.js";
export { validatePhone } from "./phone.js";
export type { PhoneResult } from "./phone.js";
export { formatMoney } from "./currency.js";
export type { CurrencyResult } from "./currency.js";
export { isHoliday, nextHoliday } from "./holidays.js";
export type { HolidayResult, NextHolidayResult } from "./holidays.js";
export { vatRate } from "./vat.js";
export type { TaxResult } from "./vat.js";
export { parseAddress } from "./address.js";
export type { AddressResult } from "./address.js";
