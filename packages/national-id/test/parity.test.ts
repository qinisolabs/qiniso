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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
