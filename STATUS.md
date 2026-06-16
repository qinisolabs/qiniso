# qiniso monorepo — build status (2026-06-16)

First consolidation build. **Working name `qiniso`** — not locked, nothing published, no domain.

## ✅ Done & verified
- **Monorepo scaffolded** — npm workspaces, shared `tsconfig.base.json`, `.gitignore`, README.
- **veridigit migrated** → `packages/identifiers` (IBAN, card+BIN, ISBN-13, VIN). Refactored data
  loading from `node:fs` `readFileSync` to **JSON module imports** so it runs on Node *and*
  Cloudflare Workers. Parity tests: **39/39 pass.**
- **Umbrella `packages/qiniso`** — one source of truth (`core.ts`) feeding three transports:
  - `server.ts` — **stdio** (npx / `.mcpb`). Verified: initialize + tools/list return all 4 tools.
  - `http.ts` — **stateless Streamable HTTP** for Node hosts. Verified end-to-end: initialize,
    tools/list, tools/call (valid + tampered IBAN), /health.
  - `worker.ts` + `wrangler.toml` — **Cloudflare Worker** edge entry (Web-standard fetch).
  - Smoke tests: **9/9 pass.**
- **Library surface** — `import { validateIban } from "qiniso"` works (re-exports the modules).
- `npm install` + `npm run build` + `npm test` all green.

## Verified behaviour (live, compiled server)
- Valid IBAN `GB82 WEST 1234 5698 7654 32` → `valid: true`, country GB.
- Tampered `…7654 33` → `valid: false`, "Checksum failed (ISO 7064 mod-97)". Deterministic, correct.

## ✅ Added 2026-06-16 (cont.) — web/network module
- **Validate-first eval done.** Pure-format checks (IPv4/IPv6/UUID-version) = **0% cold error**
  → thin wedge, NOT the headline. **TLD existence = 10% cold error** (misses `.web`, `.mail` —
  called fake TLDs real, the dangerous direction) → real wedge + curated-data moat (non-memorisable
  1437-entry IANA list that drifts over time). Harness: `/outputs/eval-network/`.
- **`packages/network` built** — vendored authoritative **IANA root-zone TLD list (1437, v2026061500)**.
  Tools: `validate_tld`, `validate_domain` (the wedge), plus `validate_ip` (strict v4/v6),
  `validate_uuid` (+version/variant), `validate_url`, `validate_email` (breadth). All pure /
  Workers-safe. **54/54 parity tests pass** (IPv6 cross-checked against `node:net`).
- **Wired into umbrella** → now **10 tools**. Smoke tests 12/12. Verified live over HTTP:
  `.zip`→valid, `.web`→invalid, `login.microsoft.corp`→invalid (`.corp` not a TLD), UUID v7 detected.

## ✅ Added 2026-06-16 (cont.) — finance module
- **`packages/finance`** — deterministic check-digit validators for securities/financial IDs:
  `validate_isin` (ISO 6166 Luhn, returns country), `validate_cusip` (mod-10), `validate_sedol`
  (weighted mod-10, no-vowel alphabet), `validate_lei` (ISO 17442 / ISO 7064 MOD 97-10),
  `validate_routing` (ABA 3-7-1 mod-10). Same proven wedge as IBAN/VIN (~91% cold error on
  arbitrary check-digit IDs). **24/24 parity tests** against *real* known-valid codes (Apple
  ISIN/CUSIP, real LEIs, real routing numbers) — which also proves the algorithms correct.
- **Wired into umbrella** → now **15 tools**. Smoke tests 13/13. Verified live over HTTP
  (Apple ISIN valid + country US, real LEI valid, tampered routing number rejected).

## ✅ Added 2026-06-16 (cont.) — crypto module
- **`packages/crypto`** — wraps audited `@noble/hashes` + `@scure/base` (per "wrap authoritative
  libraries"): `validate_eth_address` (EIP-55 keccak-256 mixed-case checksum — catches typos),
  `validate_btc_address` (Base58Check P2PKH/P2SH + Bech32/Bech32m SegWit incl. Taproot). Highest-
  stakes wedge: a wrong char = lost funds, and no LLM can compute these checksums. **14/14 parity
  tests** vs real addresses (4 canonical EIP-55 vectors, genesis, taproot, tampered-rejections).
- **Wired into umbrella → now 17 tools.** 15/15 smoke. Verified live over local HTTP (EIP-55
  valid; one-char case-flip → rejected; taproot recognised).

## ✅ Added 2026-06-16 (cont.) — national-id module
- **`packages/national-id`** — deterministic national/tax-ID checksums: `validate_cpf` + `validate_cnpj`
  (Brazil mod-11), `validate_sa_id` (South Africa Luhn + DOB/gender/citizenship extraction),
  `validate_dni` (Spain DNI/NIE mod-23), `validate_aadhaar` (India Verhoeff). KYC/onboarding surface.
  **14/14 parity tests** vs known-valid vectors (CPF 111.444.777-35, CNPJ 11.222.333/0001-81,
  SA ID 8001015009087→1980-01-01, DNI 12345678Z, NIE X1234567L, Aadhaar Verhoeff round-trip).
- **Wired into umbrella → now 22 tools.** 17/17 smoke. Verified on compiled artifact.

## ✅ Added 2026-06-16 (cont.) — academic module
- **`packages/academic`** — `validate_isbn10` (mod-11/X), `validate_issn` (mod-11/X),
  `validate_orcid` (ISO 7064 MOD 11-2; accepts orcid.org URLs). 10/10 parity (canonical ORCID
  0000-0002-1825-0097, X-check ISBN-10, hyphenated forms). Wired → 25 tools; 18/18 smoke.

## ✅ Added 2026-06-16 (cont.) — ToolSpec multi-arg + locale module (localecheck migrated)
- **`ToolSpec` generalised** to support multi-argument tools (additive; 25 single-arg tools untouched).
- **`packages/locale`** — localecheck migrated in (source cloned from its repo): `validate_phone`
  (now GLOBAL via libphonenumber-js — pass any ISO region), `parse_date` (locale day/month order),
  `format_currency`, `is_holiday`, `next_holiday`, `tax_rate` (UK VAT by date — curated history),
  `parse_address`. Refactored `vat.ts` node:fs→JSON import for Workers. **34/34 parity tests.**
- **Wired into umbrella → now 32 tools.** 22/22 smoke (incl. multi-arg path: phone+region,
  date-sensitive VAT, day-first vs month-first dates). Worker dry-run bundles clean (356 KB gz,
  no node:fs). **Qiniso is now a superset of both veridigit AND localecheck** → the two standalone
  connectors can be retired after redeploy.
- ⚠️ date-holidays runtime on Workers: bundles clean; confirm holiday tools live after redeploy.

## Current module map (all built & tested — 211 tests total)
- `identifiers` (4): iban, card, isbn, vin — 39 tests
- `network` (6): tld, domain, ip, uuid, url, email — 54 tests
- `finance` (5): isin, cusip, sedol, lei, routing — 24 tests
- `crypto` (2): eth_address, btc_address — 14 tests
- `national-id` (5): cpf, cnpj, sa_id, dni, aadhaar — 14 tests
- `academic` (3): isbn10, issn, orcid — 10 tests
- `locale` (7): phone, parse_date, format_currency, is_holiday, next_holiday, tax_rate, parse_address — 34 tests
- `qiniso` umbrella: 32 tools over stdio + HTTP + Worker — 22 smoke tests

## ⚠️ Deployed Worker is the 15-tool version — REDEPLOY to publish crypto
The live edge endpoint still runs the pre-crypto build. To push 17 tools live, on your Mac:
```bash
cd "path/to/qiniso"
npm install && npm run build
cd packages/qiniso && npx wrangler deploy
```
Connector tools refresh automatically after redeploy.

## ⛔ Not done — needs you / next session
1. **Migrate `localecheck` → `packages/locale`.** Its TS source isn't in this workspace (only
   the published npm package is). Pull it from the localecheck repo and drop it in as a module;
   it auto-joins the umbrella via `core.ts` (add its tools to the TOOLS array; multi-arg tools
   may need `ToolSpec` extended beyond the current single-string-arg shape).
2. **Next module: web/network** — run the validate-first eval first (email/URL/TLD/IP/UUID), then
   build if the wedge clears.
3. **Deploy** — `npm i -g wrangler` → `wrangler deploy` from `packages/qiniso` → live on
   `*.workers.dev`. Verify `date-holidays` (once locale is added) runs on Workers; if not, host
   that module on a Node platform via `http.js`.
4. **Parked (post name-lock):** trademark register check → buy domain → `npm publish` umbrella →
   MCP Registry → Connectors Directory → multi-model benchmark → launch.

## Architecture note
`ToolSpec` currently models single-string-argument tools (fits all 4 identifier tools). When a
module needs multi-field inputs (e.g. locale date with a locale param), generalise `ToolSpec` to
carry a full input schema + a `run(args)` signature; `core.ts` is the only file to change.

## Commands
```bash
npm install
npm run build
npm test
node packages/qiniso/dist/http.js     # local HTTP MCP on :8787/mcp
node packages/qiniso/dist/server.js    # stdio MCP
```

## Cloudflare deploy (account ready 2026-06-16)
- Account created (brand Gmail); subdomain = **qinisolabs.workers.dev**.
- Dry-run validated: Worker bundles to ~67 KiB (19 KiB gz), TLD data inlined, **no node:fs** — edge-ready.
- Deploy from your machine (sandbox can't auth to your account):
  ```bash
  npm i -g wrangler
  wrangler login                      # browser OAuth into the qinisolabs CF account
  cd packages/qiniso
  wrangler deploy
  ```
- Resulting endpoint: **https://qiniso.qinisolabs.workers.dev/mcp**
- Then add it in Claude: Settings → Connectors → Add custom connector → paste the URL (no OAuth needed).
- The hello-world Worker (`noisy-star-1109`) is a throwaway; safe to delete after.
