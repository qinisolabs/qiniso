// Parity tests against real, known crypto addresses. These double as proof the
// checksum logic is correct (real addresses must pass; tampered ones must fail).
import assert from "node:assert/strict";
import { validateEthAddress, validateBtcAddress } from "../src/index.js";

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

/* ---------- Ethereum EIP-55 (canonical spec vectors) ---------- */
const eip55Valid = [
  "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
  "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
  "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb",
];
for (const a of eip55Valid) check(`ETH EIP-55 valid ${a.slice(0, 10)}…`, () => assert.equal(validateEthAddress(a).valid, true));
check("ETH all-lowercase → valid, checksum none", () => {
  const r = validateEthAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed");
  assert.equal(r.valid, true);
  assert.equal(r.checksumStatus, "none");
});
check("ETH wrong mixed-case checksum → invalid", () =>
  assert.equal(validateEthAddress("0x5AAeb6053F3E94C9b9A09f33669435E7Ef1BeAed").valid, false));
check("ETH bad length → invalid", () => assert.equal(validateEthAddress("0x1234").valid, false));

/* ---------- Bitcoin ---------- */
check("BTC P2PKH genesis valid", () => {
  const r = validateBtcAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
  assert.equal(r.valid, true);
  assert.equal(r.type, "P2PKH");
});
check("BTC P2SH valid", () => {
  const r = validateBtcAddress("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy");
  assert.equal(r.valid, true);
  assert.equal(r.type, "P2SH");
});
check("BTC bech32 v0 valid", () => {
  const r = validateBtcAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4");
  assert.equal(r.valid, true);
});
check("BTC taproot (bech32m) valid", () => {
  const r = validateBtcAddress("bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0");
  assert.equal(r.valid, true);
});
check("BTC tampered base58 → invalid", () =>
  assert.equal(validateBtcAddress("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb").valid, false));
check("BTC tampered bech32 → invalid", () =>
  assert.equal(validateBtcAddress("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5").valid, false));
check("BTC garbage → invalid", () => assert.equal(validateBtcAddress("notanaddress").valid, false));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
