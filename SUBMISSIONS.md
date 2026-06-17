# Qiniso (umbrella) — distribution & submission tracker

Status of every place `@qinisolabs/qiniso` should appear, plus ready-to-paste copy. Verify live
listings — don't assume. Update Status + Checked as things land. (Now at **v0.2.0**, 34 tools.)

**Reusable copy** — note the deliberate barcode/UPC/EAN keywords so "barcode" searches match,
since `validate_gtin` lives inside the umbrella rather than a standalone repo.
- One-liner: *Deterministic fact verification for AI agents — verify IBANs, cards, VAT/tax IDs, product barcodes (GTIN/UPC/EAN), crypto addresses, domains, securities, phones & dates against checksums and curated data, not guesses.*
- Connector URL: `https://qiniso.qinisolabs.workers.dev/mcp`
- Repo: `https://github.com/qinisolabs/qiniso` · Site: `https://qinisolabs.github.io/qiniso`
- npm: `@qinisolabs/qiniso`

| Channel | Type | Status | Checked | Notes |
| --- | --- | --- | --- | --- |
| npm | publish | ✅ live (0.2.0) | 2026-06-17 | @qinisolabs/qiniso |
| GitHub repo + Pages | publish | ✅ live | 2026-06-17 | |
| Official MCP Registry | publish | ✅ live (0.2.0, isLatest) | 2026-06-17 | io.github.qinisolabs/qiniso |
| Cloudflare Worker | deploy | ✅ live | 2026-06-17 | /mcp verified incl. validate_gtin |
| Glama | auto-ingest / claim | ⏳ pending — verify | — | claim via qinisolabs GitHub, **no billing** |
| mcp.so | submit / auto-ingest | ⏳ pending — verify | — | |
| PulseMCP | auto-ingest | ⏳ pending — verify | — | |
| awesome-mcp-servers | **manual PR** | ⏳ to do | — | the one truly manual step |
| Launch post | manual | ⏳ when ready | — | |

Legend: ✅ done & verified · ⏳ pending · ➖ skip.

## Ready-to-paste directory descriptions (barcode-forward)

**Glama / mcp.so description (1–2 sentences):**
> Qiniso is the deterministic fact-verification layer for AI agents: 34 tools that verify IBANs, payment cards, VAT & national tax IDs, **product barcodes (GTIN / UPC-A / EAN-13 / EAN-8, with GS1 issuing country)**, crypto addresses, domains/emails, securities & academic IDs, phone numbers and dates/holidays — against checksums and curated authoritative data, not guesses. Hosted (no key) or as a typed npm library.

**mcp.so server config:**
```json
{"mcpServers":{"qiniso":{"command":"npx","args":["-y","@qinisolabs/qiniso"]}}}
```

**awesome-mcp-servers line** (place under the best category; confirm the current emoji legend):
```
- [qinisolabs/qiniso](https://github.com/qinisolabs/qiniso) 📇 ☁️ 🏠 - Deterministic fact verification: validate IBANs, cards, VAT/tax IDs, barcodes (GTIN/UPC/EAN), crypto addresses, domains, securities & dates against checksums and curated data.
```

**Tags/keywords to use on any directory that takes them:**
`mcp, ai-agents, validation, verification, barcode, gtin, upc, ean, iban, vat, isin, crypto, checksum, deterministic`

**Next actions:** open the awesome-mcp-servers PR; ~1 week post-launch verify Glama / mcp.so /
PulseMCP listings and mark them ✅.
