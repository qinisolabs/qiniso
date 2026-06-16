import assert from "node:assert/strict";
import {
  validateIban,
  ibanCheckDigits,
  validateCard,
  luhnValid,
  luhnCheckDigit,
  detectBrand,
  validateIsbn13,
  isbn13CheckDigit,
  validateVin,
  vinCheckDigit,
} from "../src/index.js";

let pass = 0;
let fail = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    pass++;
  } catch (err) {
    fail++;
    console.error(`✗ ${name}\n    ${(err as Error).message}`);
  }
}

/* ---------- IBAN ---------- */
const validIbans = [
  "GB82WEST12345698765432",
  "DE89370400440532013000",
  "FR1420041010050500013M02606",
  "NL91ABNA0417164300",
  "CH9300762011623852957",
  "ES9121000418450200051332",
];
for (const ib of validIbans) {
  check(`IBAN valid ${ib}`, () => assert.equal(validateIban(ib).valid, true));
}
check("IBAN ignores spaces", () =>
  assert.equal(validateIban("GB82 WEST 1234 5698 7654 32").valid, true)
);
check("IBAN bad checksum", () =>
  assert.equal(validateIban("GB82WEST12345698765433").valid, false)
);
check("IBAN unknown country", () => {
  const r = validateIban("ZZ0012345678901234");
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /country/i);
});
check("IBAN wrong length", () => {
  const r = validateIban("GB82WEST123456987654");
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /length/i);
});
check("IBAN country parsed", () =>
  assert.equal(validateIban("DE89370400440532013000").country, "Germany")
);
check("ibanCheckDigits GB", () =>
  assert.equal(ibanCheckDigits("GB", "WEST12345698765432"), "82")
);
check("ibanCheckDigits DE", () =>
  assert.equal(ibanCheckDigits("DE", "370400440532013000"), "89")
);

/* ---------- CARD ---------- */
check("Luhn valid Visa", () => assert.equal(luhnValid("4111111111111111"), true));
check("Luhn invalid", () => assert.equal(luhnValid("4111111111111112"), false));
check("luhnCheckDigit", () => assert.equal(luhnCheckDigit("411111111111111"), "1"));
check("Card Visa brand", () =>
  assert.equal(validateCard("4111 1111 1111 1111").brand, "Visa")
);
check("Card Mastercard brand", () =>
  assert.equal(validateCard("5555555555554444").brand, "Mastercard")
);
check("Card Mastercard 2-series", () =>
  assert.equal(detectBrand("2223000048410010")?.brand, "Mastercard")
);
check("Card Amex brand+valid", () => {
  const r = validateCard("378282246310005");
  assert.equal(r.brand, "American Express");
  assert.equal(r.valid, true);
});
check("Card Discover brand", () =>
  assert.equal(validateCard("6011111111111117").brand, "Discover")
);
check("Card JCB brand", () => assert.equal(detectBrand("3530111333300000")?.brand, "JCB"));
check("Card invalid Luhn flagged", () => {
  const r = validateCard("4111111111111112");
  assert.equal(r.valid, false);
  assert.equal(r.luhnValid, false);
});
check("Card Amex wrong length invalid", () => {
  const r = validateCard("3782822463100050"); // 16 digits, Amex wants 15
  assert.equal(r.lengthValid, false);
  assert.equal(r.valid, false);
});
check("Card non-digit rejected", () =>
  assert.equal(validateCard("4111-XXXX-1111-1111").valid, false)
);
check("detectBrand rejects non-digits", () => assert.equal(detectBrand("4x"), null));

/* ---------- ISBN-13 ---------- */
check("ISBN valid 1", () => assert.equal(validateIsbn13("9783161484100").valid, true));
check("ISBN valid hyphens", () =>
  assert.equal(validateIsbn13("978-0-306-40615-7").valid, true)
);
check("ISBN bad check", () => assert.equal(validateIsbn13("9783161484101").valid, false));
check("ISBN bad prefix", () => {
  const r = validateIsbn13("1234567890128");
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /978|979/);
});
check("ISBN wrong length", () => assert.equal(validateIsbn13("978316148410").valid, false));
check("isbn13CheckDigit A", () => assert.equal(isbn13CheckDigit("978316148410"), "0"));
check("isbn13CheckDigit B", () => assert.equal(isbn13CheckDigit("978030640615"), "7"));

/* ---------- VIN ---------- */
check("VIN valid", () => assert.equal(validateVin("1HGCM82633A004352").valid, true));
check("VIN bad check digit", () =>
  assert.equal(validateVin("1HGCM82643A004352").valid, false)
);
check("VIN illegal letter", () => {
  const r = validateVin("1HGCM8263IA004352");
  assert.equal(r.valid, false);
  assert.match(r.errors[0], /I, O or Q|alphabet/i);
});
check("VIN wrong length", () => assert.equal(validateVin("1HGCM82633A00435").valid, false));
check("vinCheckDigit", () => assert.equal(vinCheckDigit("1HGCM82633A004352"), "3"));
check("vinCheckDigit throws on bad input", () =>
  assert.throws(() => vinCheckDigit("IIIIIIIIIIIIIIIII"))
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
