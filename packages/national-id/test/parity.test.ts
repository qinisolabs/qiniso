// Parity tests for national/tax IDs. CPF/CNPJ/DNI use well-known valid vectors;
// Aadhaar uses a self-consistent Verhoeff round-trip (real numbers are sensitive PII).
import assert from "node:assert/strict";
import {
  validateCpf,
  validateCnpj,
  validateSaId,
  validateDni,
  validateAadhaar,
  verhoeffGenerate,
  validateCodiceFiscale,
  validatePesel,
  validateBsn,
  validateBeNrn,
  validatePersonnummer,
  validateFodselsnummer,
  validateHetu,
  validateNifPt,
  validateTckn,
  validateChinaRic,
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

/* ---------- Brazil CPF ---------- */
check("CPF valid 111.444.777-35", () => assert.equal(validateCpf("111.444.777-35").valid, true));
check("CPF tampered invalid", () => assert.equal(validateCpf("111.444.777-36").valid, false));
check("CPF all-same rejected", () => assert.equal(validateCpf("111.111.111-11").valid, false));
check("CPF wrong length", () => assert.equal(validateCpf("1234").valid, false));

/* ---------- Brazil CNPJ ---------- */
check("CNPJ valid 11.222.333/0001-81", () => assert.equal(validateCnpj("11.222.333/0001-81").valid, true));
check("CNPJ tampered invalid", () => assert.equal(validateCnpj("11.222.333/0001-82").valid, false));

/* ---------- South Africa ID (Luhn + DOB) ---------- */
check("SA ID valid 8001015009087", () => {
  const r = validateSaId("8001015009087");
  assert.equal(r.valid, true);
  assert.equal(r.dateOfBirth, "1980-01-01");
  assert.equal(r.gender, "male");
});
check("SA ID tampered invalid", () => assert.equal(validateSaId("8001015009088").valid, false));

/* ---------- Spain DNI / NIE ---------- */
check("DNI valid 12345678Z", () => {
  const r = validateDni("12345678Z");
  assert.equal(r.valid, true);
  assert.equal(r.type, "DNI");
});
check("DNI wrong letter invalid", () => assert.equal(validateDni("12345678A").valid, false));
check("NIE valid X1234567L", () => {
  const r = validateDni("X1234567L");
  assert.equal(r.valid, true);
  assert.equal(r.type, "NIE");
});

/* ---------- India Aadhaar (Verhoeff round-trip) ---------- */
check("Aadhaar valid via Verhoeff round-trip", () => {
  const base = "23412341234"; // 11 digits, first digit 2 (cannot be 0/1)
  const full = base + verhoeffGenerate(base);
  assert.equal(validateAadhaar(full).valid, true);
});
check("Aadhaar tampered invalid", () => {
  const base = "23412341234";
  const full = base + verhoeffGenerate(base);
  const tampered = full.slice(0, 5) + ((Number(full[5]) + 1) % 10) + full.slice(6);
  assert.equal(validateAadhaar(tampered).valid, false);
});
check("Aadhaar starting 0/1 rejected", () => assert.equal(validateAadhaar("012345678901").valid, false));

/* ---------- New checksum validators: published valid example vs tampered ---------- */
const VECTORS: Array<[string, (s: string) => { valid: boolean }, string, string]> = [
  ["IT Codice Fiscale", validateCodiceFiscale, "RSSMRA85T10A562S", "RSSMRA85T10A562T"],
  ["PL PESEL", validatePesel, "44051401458", "44051401459"],
  ["NL BSN", validateBsn, "111222333", "111222334"],
  ["BE NRN", validateBeNrn, "93051822361", "93051822362"],
  ["SE personnummer", validatePersonnummer, "8112189876", "8112189875"],
  ["NO fodselsnummer", validateFodselsnummer, "01010100050", "01010100051"],
  ["FI HETU", validateHetu, "131052-308T", "131052-308U"],
  ["PT NIF", validateNifPt, "123456789", "123456788"],
  ["TR TCKN", validateTckn, "10000000146", "10000000145"],
  ["CN Resident ID", validateChinaRic, "11010519491231002X", "11010519491231002Y"],
];
for (const [name, fn, good, bad] of VECTORS) {
  check(`${name} valid (${good})`, () => assert.equal(fn(good).valid, true));
  check(`${name} tampered rejected`, () => assert.equal(fn(bad).valid, false));
}
// Format guards
check("PESEL wrong length rejected", () => assert.equal(validatePesel("123").valid, false));
check("BSN 8-digit form accepted (010000008 -> 10000008)", () => assert.equal(validateBsn("10000008").valid, true));
check("TCKN cannot start with 0", () => assert.equal(validateTckn("01000000146").valid, false));
check("China RIC lowercase x normalised", () => assert.equal(validateChinaRic("11010519491231002x").valid, true));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
