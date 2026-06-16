// Parity tests against canonical academic identifiers (incl. the famous
// Josiah Carberry ORCID 0000-0002-1825-0097 and X-check vectors).
import assert from "node:assert/strict";
import { validateIsbn10, validateIssn, validateOrcid } from "../src/index.js";

let pass = 0;
let fail = 0;
function check(name: string, fn: () => void) {
  try { fn(); pass++; } catch (err) { fail++; console.error(`✗ ${name}\n    ${(err as Error).message}`); }
}

/* ---------- ISBN-10 ---------- */
check("ISBN-10 valid 0306406152", () => assert.equal(validateIsbn10("0306406152").valid, true));
check("ISBN-10 valid with X check 080442957X", () => assert.equal(validateIsbn10("080442957X").valid, true));
check("ISBN-10 hyphenated 0-19-852663-6", () => assert.equal(validateIsbn10("0-19-852663-6").valid, true));
check("ISBN-10 tampered invalid", () => assert.equal(validateIsbn10("0306406153").valid, false));

/* ---------- ISSN ---------- */
check("ISSN valid 0378-5955", () => assert.equal(validateIssn("0378-5955").valid, true));
check("ISSN valid 2049-3630", () => assert.equal(validateIssn("2049-3630").valid, true));
check("ISSN tampered invalid", () => assert.equal(validateIssn("0378-5954").valid, false));

/* ---------- ORCID ---------- */
check("ORCID valid 0000-0002-1825-0097", () => assert.equal(validateOrcid("0000-0002-1825-0097").valid, true));
check("ORCID valid as URL", () => assert.equal(validateOrcid("https://orcid.org/0000-0002-1825-0097").valid, true));
check("ORCID tampered invalid", () => assert.equal(validateOrcid("0000-0002-1825-0098").valid, false));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
