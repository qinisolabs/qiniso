// Parity smoke tests — mirror the Python test suite to confirm identical behaviour.
import { parseDate } from "../src/dates.js";
import { validatePhone } from "../src/phone.js";
import { formatMoney } from "../src/currency.js";
import { isHoliday, nextHoliday } from "../src/holidays.js";
import { vatRate } from "../src/vat.js";
import { parseAddress } from "../src/address.js";

let passed = 0;
let failed = 0;

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${name}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`);
  }
}

// dates
check("date GB dayfirst", parseDate("03/04/2025", "en-GB").iso, "2025-04-03");
check("date US monthfirst", parseDate("03/04/2025", "en-US").iso, "2025-03-04");
check("date GB 12/01", parseDate("12/01/2024", "en-GB").iso, "2024-01-12");
check("date ordinal", parseDate("1st February 2025", "en-GB").iso, "2025-02-01");
check("date US written", parseDate("Jan 2, 2025", "en-US").iso, "2025-01-02");
check("date ISO not reordered", parseDate("2025-09-08", "en-GB").iso, "2025-09-08");
check("date leap valid", parseDate("29/02/2024", "en-GB").valid, true);
check("date leap invalid", parseDate("29/02/2023", "en-GB").valid, false);
check("date 31 Apr invalid", parseDate("31/04/2025", "en-GB").valid, false);
check("date 13/13 invalid", parseDate("13/13/2025", "en-GB").valid, false);

// phone
check("phone GB landline", validatePhone("020 7946 0958", "GB").e164, "+442079460958");
check("phone GB mobile", validatePhone("07911 123456", "GB").e164, "+447911123456");
check("phone US", validatePhone("(212) 555-0199", "US").e164, "+12125550199");
check("phone invalid", validatePhone("123", "GB").valid, false);

// currency
check("currency GBP", formatMoney(1234.5, "GBP", "en-GB").formatted, "£1,234.50");
check("currency USD", formatMoney(1234.5, "USD", "en-US").formatted, "$1,234.50");

// VAT / sales tax
check("UK VAT current", vatRate("GB", "2025-06-01").rate, 20.0);
check("UK VAT temp 2009", vatRate("GB", "2009-06-01").rate, 15.0);
check("UK VAT 17.5 era", vatRate("GB", "2010-06-01").rate, 17.5);
check("US national zero", vatRate("US", "2025-06-01").rate, 0.0);
check("US CA state", vatRate("US", "2025-06-01", "CA").rate, 7.25);

// holidays
check("UK Boxing Day", isHoliday("2025-12-26", "GB").is_holiday, true);
check("UK Easter Monday default", isHoliday("2025-04-21", "GB").is_holiday, true);
check("UK Summer BH default", isHoliday("2025-08-25", "GB").is_holiday, true);
check("US July4 not UK", isHoliday("2025-07-04", "GB").is_holiday, false);
check("US July4", isHoliday("2025-07-04", "US").is_holiday, true);
check("Scotland 2 Jan", isHoliday("2025-01-02", "GB", "SCT").is_holiday, true);
check("England 2 Jan not", isHoliday("2025-01-02", "GB", "ENG").is_holiday, false);
check("next holiday exists", typeof nextHoliday("US", "2025-06-14").date, "string");

// address
const ukA = parseAddress("221B Baker Street, London NW1 6XE, United Kingdom");
check("addr UK country", ukA.country, "GB");
check("addr UK postcode", ukA.postcode, "NW1 6XE");
const usA = parseAddress("1600 Amphitheatre Parkway, Mountain View, CA 94043, USA");
check("addr US country", usA.country, "US");
check("addr US postcode", usA.postcode, "94043");
check("addr US city", usA.city, "Mountain View");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
