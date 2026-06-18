<div align="center">

<img src="docs/logo.svg" width="96" height="96" alt="Qiniso" />

# Qiniso

**The deterministic fact-verification layer for AI agents.**

*Verified, trustworthy data tools for AI agents. "Qiniso" means "truth" in Zulu.*

[Website](https://qinisolabs.github.io/qiniso/) · [MCP endpoint](https://qiniso.qinisolabs.workers.dev/mcp) · [MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=qiniso)

</div>

---

Agents confidently emit IBANs, phone numbers, domains, VAT numbers and crypto addresses that are subtly — and silently — **wrong**. Qiniso checks the structured facts an agent produces against **checksums and curated authoritative data**, so a bad value is caught instead of trusted.

It's the deterministic complement to the guardrail stack: security guardrails check whether output is *safe*, structure guardrails check it's *well-formed*, and hallucination guardrails ask another LLM if it's *faithful to the prompt*. **None of them check whether a structured fact is actually correct against the real world** — because that needs computation or curated data, not another model's opinion. That's Qiniso.

> On arbitrary identifiers, a frontier LLM validates them **wrong ~91% of the time, cold and silently. Qiniso: 0%.**

## Add it to Claude

Settings → Connectors → **Add custom connector**, and paste — no login, no key:

```
https://qiniso.qinisolabs.workers.dev/mcp
```

Stateless, reads no user data, requires no secrets.

## Use it as a library

Every check is also a typed function — no MCP required:

```bash
npm i @qinisolabs/qiniso
```

```ts
import { validateIban, validateVat } from "@qinisolabs/qiniso";

validateIban("GB82 WEST 1234 5698 7654 32");
// { valid: true, country: "United Kingdom", ... }
```

## What it verifies — 37 tools across 8 domains

| Domain | Tools |
| --- | --- |
| **Identifiers** | IBAN, payment card (Luhn + brand), ISBN-13, VIN, GTIN/UPC/EAN barcodes (+ GS1 country) |
| **Web / network** | TLD & domain (IANA root zone), IP, UUID, URL, email |
| **Finance** | ISIN, CUSIP, SEDOL, LEI, US ABA routing |
| **Crypto** | Ethereum (EIP-55), Bitcoin (Base58Check / Bech32) addresses |
| **National & tax IDs** | Brazil CPF/CNPJ, South Africa ID, Spain DNI/NIE, India Aadhaar, EU/UK VAT |
| **Academic** | ISBN-10, ISSN, ORCID |
| **Locale** | Phone (global), date parsing, currency, holidays (~200 countries), UK VAT-by-date |
| **Addresses** | UK/US address parsing |

Each tool wraps an authoritative method — a published checksum standard, an audited library (libphonenumber-js, jsvat, date-holidays, @noble/hashes), or curated reference data (the IANA root zone, UK VAT history).

## What it is *not*

- **Not a live-data provider.** It verifies facts you give it; it does not return the current time, weather, or live exchange rates.
- **Not a credential sink.** It never asks for secrets or API keys. (For JWT signature verification, use a library in your own runtime so the secret never leaves your machine.)
- **Not a registration check.** It validates a VAT number's checksum, not whether it is live-registered (VIES); it confirms a domain's TLD is real, not that the domain is registered.

## Architecture

A TypeScript monorepo. Each domain is a typed library in `packages/*`; the `qiniso` umbrella aggregates them and exposes one MCP server over three transports — **stdio** (local / `npx`), **Streamable HTTP** (self-host), and a **Cloudflare Worker** (the hosted edge endpoint). The same core powers the importable library.

```bash
npm install
npm run build
npm test
```

## License

Apache-2.0
