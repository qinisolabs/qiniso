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

## Current module map (all built & tested — 130 tests total)
- `identifiers` (4): iban, card, isbn, vin — 39 tests
- `network` (6): tld, domain, ip, uuid, url, email — 54 tests
- `finance` (5): isin, cusip, sedol, lei, routing — 24 tests
- `qiniso` umbrella: 15 tools over stdio + HTTP + Worker — 13 smoke tests

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
