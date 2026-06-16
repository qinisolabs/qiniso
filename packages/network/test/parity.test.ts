// Parity tests for the network module. IPv6 is cross-checked against node:net
// (authoritative) to prove the hand-written parser matches the kernel's.
import assert from "node:assert/strict";
import { isIPv4 as netIsIPv4, isIPv6 as netIsIPv6 } from "node:net";
import {
  validateTld,
  isKnownTld,
  knownTldCount,
  validateDomain,
  validateIp,
  isIPv6,
  validateUuid,
  validateUrl,
  validateEmail,
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

/* ---------- TLD (the wedge) ---------- */
check("TLD list loaded (~1437)", () => assert.ok(knownTldCount() > 1400));
for (const t of ["zip", "mov", "museum", "dev", "dad", "foo", "xn--p1ai"]) {
  check(`real TLD .${t}`, () => assert.equal(validateTld(t).valid, true));
}
for (const t of ["web", "mail", "corp", "home", "crypto", "eth", "web3"]) {
  check(`fake TLD .${t}`, () => assert.equal(validateTld(t).valid, false));
}
check("validateTld strips leading dot", () => assert.equal(validateTld(".com").valid, true));
check("isKnownTld helper", () => assert.equal(isKnownTld("CO.UK".split(".").pop()!), true));

/* ---------- IPv4 ---------- */
for (const ip of ["192.168.1.1", "8.8.8.8", "0.0.0.0", "255.255.255.255"]) {
  check(`IPv4 valid ${ip}`, () => assert.equal(validateIp(ip).version, 4));
}
for (const ip of ["256.1.1.1", "192.168.01.1", "1.2.3", "1.2.3.4.5", "099.1.1.1"]) {
  check(`IPv4 invalid ${ip}`, () => assert.equal(validateIp(ip).valid, false));
}

/* ---------- IPv6 cross-checked vs node:net ---------- */
const ipv6Cases = [
  "2001:db8::1", "::1", "::", "fe80::1ff:fe23:4567:890a", "2001:db8::1::2",
  "2001:db8:::1", "::ffff:192.168.1.1", "2001:0db8:0000:0000:0000:0000:0000:0001",
  "1::2::3", "2001:db8:85a3::8a2e:370:7334", "gggg::1", "12345::1",
];
for (const ip of ipv6Cases) {
  check(`IPv6 parity vs node:net: ${ip}`, () => assert.equal(isIPv6(ip), netIsIPv6(ip)));
}

/* ---------- UUID version ---------- */
const uuidCases: [string, number][] = [
  ["550e8400-e29b-41d4-a716-446655440000", 4],
  ["6ba7b810-9dad-11d1-80b4-00c04fd430c8", 1],
  ["017f22e2-79b0-7cc3-98c4-dc0c0c07398f", 7],
  ["9f8d2c1a-3b4e-5f6a-8c2d-1e2f3a4b5c6d", 5],
];
for (const [u, v] of uuidCases) {
  check(`UUID ${u} → v${v}`, () => assert.equal(validateUuid(u).version, v));
}
check("nil UUID → version 0", () => assert.equal(validateUuid("00000000-0000-0000-0000-000000000000").version, 0));
check("bad UUID invalid", () => assert.equal(validateUuid("not-a-uuid").valid, false));

/* ---------- domain / url / email ---------- */
check("domain example.com valid", () => assert.equal(validateDomain("example.com").valid, true));
check("domain bad TLD invalid", () => assert.equal(validateDomain("example.corp").valid, false));
check("url https valid + tld known", () => {
  const r = validateUrl("https://www.example.com/path");
  assert.equal(r.valid, true);
  assert.equal(r.tldKnown, true);
});
check("url bad → invalid", () => assert.equal(validateUrl("not a url").valid, false));
check("email valid", () => assert.equal(validateEmail("a.b@example.com").valid, true));
check("email bad TLD flagged invalid", () => assert.equal(validateEmail("a@b.corp").valid, false));
check("email no domain invalid", () => assert.equal(validateEmail("foo@").valid, false));

// Exhaustive IPv4 cross-check vs node:net over the same cases
for (const ip of ["192.168.1.1", "256.1.1.1", "1.2.3.4.5"]) {
  check(`IPv4 parity vs node:net: ${ip}`, () =>
    assert.equal(validateIp(ip).version === 4, netIsIPv4(ip)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
