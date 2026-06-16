// Parity tests against real, known-valid financial identifiers. These double as
// correctness proof for the check-digit algorithms (if a real code fails, the algo is wrong).
import assert from "node:assert/strict";
import { validateIsin, validateCusip, validateSedol, validateLei, validateAba } from "../src/index.js";

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

/* ---------- ISIN (real, known-valid) ---------- */
const validIsins = [
  "US0378331005", // Apple
  "US5949181045", // Microsoft
  "GB0002634946", // BAE Systems
  "DE000BAY0017", // Bayer
  "NL0000009165", // Heineken
];
for (const i of validIsins) check(`ISIN valid ${i}`, () => assert.equal(validateIsin(i).valid, true));
check("ISIN tampered invalid", () => assert.equal(validateIsin("US0378331006").valid, false));
check("ISIN returns country", () => assert.equal(validateIsin("US0378331005").countryCode, "US"));

/* ---------- CUSIP (real, known-valid) ---------- */
const validCusips = ["037833100" /* Apple */, "594918104" /* Microsoft */, "38259P508" /* Google */];
for (const c of validCusips) check(`CUSIP valid ${c}`, () => assert.equal(validateCusip(c).valid, true));
check("CUSIP tampered invalid", () => assert.equal(validateCusip("037833101").valid, false));

/* ---------- SEDOL (real, known-valid) ---------- */
const validSedols = ["0263494", "B0YBKJ7", "0540528", "2936921"];
for (const s of validSedols) check(`SEDOL valid ${s}`, () => assert.equal(validateSedol(s).valid, true));
check("SEDOL tampered invalid", () => assert.equal(validateSedol("0263495").valid, false));

/* ---------- LEI (real, known-valid) ---------- */
const validLeis = ["5493001KJTIIGC8Y1R12", "213800WSGIIZCXF1P572", "HWUPKR0MPOU8FGXBT394"];
for (const l of validLeis) check(`LEI valid ${l}`, () => assert.equal(validateLei(l).valid, true));
check("LEI tampered invalid", () => assert.equal(validateLei("5493001KJTIIGC8Y1R13").valid, false));

/* ---------- ABA routing (real, known-valid) ---------- */
const validAbas = ["011000015", "121000358", "026009593"];
for (const a of validAbas) check(`ABA valid ${a}`, () => assert.equal(validateAba(a).valid, true));
check("ABA tampered invalid", () => assert.equal(validateAba("011000016").valid, false));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
