// Parity tests against known-valid EU/EFTA VAT numbers (verified via jsvat-next).
import assert from "node:assert/strict";
import { validateVat } from "../src/index.js";

let pass = 0;
let fail = 0;
function check(name: string, fn: () => void) {
  try { fn(); pass++; } catch (err) { fail++; console.error(`✗ ${name}\n    ${(err as Error).message}`); }
}

const valid: [string, string][] = [
  ["ATU13585627", "Austria"],
  ["BE0411905847", "Belgium"],
  ["LU26375245", "Luxembourg"],
  ["GB980780684", "United Kingdom"],
  ["DE136695976", "Germany"],
  ["FR40303265045", "France"],
  ["IT00743110157", "Italy"],
];
for (const [v, c] of valid) {
  check(`VAT valid ${v} (${c})`, () => {
    const r = validateVat(v);
    assert.equal(r.valid, true);
    assert.equal(r.country, c);
  });
}

check("VAT tampered invalid (DE)", () => assert.equal(validateVat("DE136695977").valid, false));
check("VAT bad checksum invalid (NL)", () => assert.equal(validateVat("NL123456789B01").valid, false));
check("VAT junk invalid", () => assert.equal(validateVat("NOTAVAT").valid, false));
check("VAT ignores spaces/dots", () => assert.equal(validateVat("DE 136 695 976").valid, true));
check("VAT prepends separate country code", () => {
  const r = validateVat("136695976", "DE");
  assert.equal(r.valid, true);
  assert.equal(r.country, "Germany");
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
