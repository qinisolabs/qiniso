// Smoke test for the umbrella: exercises the JSON-RPC core end to end
// (initialize, tools/list, tools/call valid + invalid) without a transport.
import assert from "node:assert/strict";
import { handleRpc } from "../src/core.js";

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

function rpc(method: string, params?: unknown, id: number | string = 1) {
  return handleRpc({ jsonrpc: "2.0", id, method, params }) as any;
}

check("initialize returns serverInfo + tools capability", () => {
  const r = rpc("initialize", { protocolVersion: "2025-06-18" });
  assert.equal(r.result.serverInfo.name, "qiniso");
  assert.ok(r.result.capabilities.tools);
});

check("tools/list returns all 22 tools with schemas", () => {
  const r = rpc("tools/list");
  const names = r.result.tools.map((t: any) => t.name).sort();
  assert.deepEqual(names, [
    "validate_aadhaar", "validate_btc_address", "validate_card", "validate_cnpj",
    "validate_cpf", "validate_cusip", "validate_dni", "validate_domain",
    "validate_email", "validate_eth_address", "validate_iban", "validate_ip",
    "validate_isbn", "validate_isin", "validate_lei", "validate_routing",
    "validate_sa_id", "validate_sedol", "validate_tld", "validate_url",
    "validate_uuid", "validate_vin",
  ]);
  for (const t of r.result.tools) {
    assert.equal(t.inputSchema.type, "object");
    assert.ok(Array.isArray(t.inputSchema.required));
  }
});

check("tools/call validate_iban — valid", () => {
  const r = rpc("tools/call", { name: "validate_iban", arguments: { iban: "GB82 WEST 1234 5698 7654 32" } });
  const payload = JSON.parse(r.result.content[0].text);
  assert.equal(payload.valid, true);
  assert.equal(payload.countryCode, "GB");
});

check("tools/call validate_iban — tampered fails checksum", () => {
  const r = rpc("tools/call", { name: "validate_iban", arguments: { iban: "GB82 WEST 1234 5698 7654 33" } });
  assert.equal(JSON.parse(r.result.content[0].text).valid, false);
});

check("tools/call validate_card — Visa test number", () => {
  const r = rpc("tools/call", { name: "validate_card", arguments: { number: "4111 1111 1111 1111" } });
  const payload = JSON.parse(r.result.content[0].text);
  assert.equal(payload.valid, true);
  assert.equal(payload.brand, "Visa");
});

check("tools/call validate_vin — valid check digit", () => {
  const r = rpc("tools/call", { name: "validate_vin", arguments: { vin: "1HGBH41JXMN109186" } });
  assert.equal(JSON.parse(r.result.content[0].text).valid, true);
});

check("tools/call validate_tld — real .zip vs fake .corp", () => {
  const real = rpc("tools/call", { name: "validate_tld", arguments: { tld: "zip" } });
  const fake = rpc("tools/call", { name: "validate_tld", arguments: { tld: "corp" } });
  assert.equal(JSON.parse(real.result.content[0].text).valid, true);
  assert.equal(JSON.parse(fake.result.content[0].text).valid, false);
});

check("tools/call validate_ip — IPv6 vs bad IPv4", () => {
  const ok = rpc("tools/call", { name: "validate_ip", arguments: { ip: "2001:db8::1" } });
  const bad = rpc("tools/call", { name: "validate_ip", arguments: { ip: "256.1.1.1" } });
  assert.equal(JSON.parse(ok.result.content[0].text).version, 6);
  assert.equal(JSON.parse(bad.result.content[0].text).valid, false);
});

check("tools/call validate_uuid — version 7", () => {
  const r = rpc("tools/call", { name: "validate_uuid", arguments: { uuid: "017f22e2-79b0-7cc3-98c4-dc0c0c07398f" } });
  assert.equal(JSON.parse(r.result.content[0].text).version, 7);
});

check("tools/call validate_isin — Apple valid vs tampered", () => {
  const ok = rpc("tools/call", { name: "validate_isin", arguments: { isin: "US0378331005" } });
  const bad = rpc("tools/call", { name: "validate_isin", arguments: { isin: "US0378331006" } });
  assert.equal(JSON.parse(ok.result.content[0].text).valid, true);
  assert.equal(JSON.parse(bad.result.content[0].text).valid, false);
});

check("tools/call validate_eth_address — EIP-55 valid vs tampered", () => {
  const ok = rpc("tools/call", { name: "validate_eth_address", arguments: { address: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" } });
  const bad = rpc("tools/call", { name: "validate_eth_address", arguments: { address: "0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" } });
  assert.equal(JSON.parse(ok.result.content[0].text).valid, true);
  assert.equal(JSON.parse(bad.result.content[0].text).valid, false);
});

check("tools/call validate_btc_address — genesis valid", () => {
  const r = rpc("tools/call", { name: "validate_btc_address", arguments: { address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" } });
  assert.equal(JSON.parse(r.result.content[0].text).valid, true);
});

check("tools/call validate_cpf — valid vs tampered", () => {
  const ok = rpc("tools/call", { name: "validate_cpf", arguments: { cpf: "111.444.777-35" } });
  const bad = rpc("tools/call", { name: "validate_cpf", arguments: { cpf: "111.444.777-36" } });
  assert.equal(JSON.parse(ok.result.content[0].text).valid, true);
  assert.equal(JSON.parse(bad.result.content[0].text).valid, false);
});

check("tools/call validate_sa_id — extracts DOB", () => {
  const r = rpc("tools/call", { name: "validate_sa_id", arguments: { id: "8001015009087" } });
  const p = JSON.parse(r.result.content[0].text);
  assert.equal(p.valid, true);
  assert.equal(p.dateOfBirth, "1980-01-01");
});

check("unknown tool → JSON-RPC error", () => {
  const r = rpc("tools/call", { name: "nope", arguments: {} });
  assert.ok(r.error);
});

check("unknown method → method not found", () => {
  const r = rpc("frobnicate");
  assert.equal(r.error.code, -32601);
});

check("notifications/initialized → no response body", () => {
  const r = handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" });
  assert.equal(r, null);
});

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
