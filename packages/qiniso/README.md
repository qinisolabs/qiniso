<div align="center">

<img src="https://qinisolabs.github.io/qiniso/logo.svg" width="96" height="96" alt="Qiniso" />

# Qiniso

**The deterministic fact-verification layer for AI agents.**

*Verified, trustworthy data tools for AI agents. "Qiniso" means "truth" in Zulu.*

[Website](https://qinisolabs.github.io/qiniso/) · [npm](https://www.npmjs.com/package/@qinisolabs/qiniso) · [GitHub](https://github.com/qinisolabs/qiniso) · [MCP Registry](https://registry.modelcontextprotocol.io/v0/servers?search=qiniso)

</div>

---

Agents confidently emit IBANs, phone numbers, domains, VAT numbers and crypto addresses that are subtly — and silently — **wrong**. Qiniso checks the structured facts an agent produces against **checksums and curated authoritative data**, so a bad value is caught instead of trusted.

> On arbitrary identifiers, a frontier LLM validates them **wrong ~91% of the time, cold and silently. Qiniso: 0%.**

## Install

```bash
npm i @qinisolabs/qiniso
```

## Use as a library

Every check is a typed function — validate locally in one pass, no MCP required:

```ts
import { validateIban, validateVat, validatePhone } from "@qinisolabs/qiniso";

validateIban("GB82 WEST 1234 5698 7654 32");
// { valid: true, country: "United Kingdom", checkDigits: "82", ... }

validateVat("DE136695976");          // { valid: true, country: "Germany", ... }
validatePhone("020 7946 0123", "GB"); // { valid: true, e164: "+442079460123", ... }
```

## Use as an MCP server (in Claude and other agents)

No install needed — add the hosted endpoint as a custom connector:

```
https://qiniso.qinisolabs.workers.dev/mcp
```

Or run it locally over stdio. Add this to your client's MCP config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "qiniso": {
      "command": "npx",
      "args": ["-y", "-p", "@qinisolabs/qiniso", "qiniso-mcp"]
    }
  }
}
```

## What it verifies — 56 tools across 8 domains

| Domain | Checks |
| --- | --- |
| **Identifiers** | IBAN, payment card (Luhn + brand), ISBN-13, VIN, GTIN/UPC/EAN barcodes (+ GS1 country) |
| **Web / network** | TLD & domain (IANA root zone), IP, UUID, URL, email |
| **Finance** | ISIN, CUSIP, SEDOL, LEI, US ABA routing |
| **Crypto** | Ethereum (EIP-55), Bitcoin (Base58Check / Bech32) addresses |
| **National & tax IDs** | Brazil CPF/CNPJ, South Africa ID, Spain DNI/NIE, India Aadhaar, Italy, Poland, Netherlands, Belgium, Nordics, Portugal, Turkey, China, Germany Steuer-IdNr, France NIR, Switzerland AHV, Mexico CURP, Croatia OIB, Romania CNP, Bulgaria EGN, Estonia, Czech/Slovak rodné číslo, EU/UK VAT |
| **Academic** | ISBN-10, ISSN, ORCID |
| **Locale** | Phone (global), date parsing, currency, holidays (~200 countries), UK VAT-by-date |
| **Addresses** | UK/US address parsing |

## What it is *not*

- **Not a live-data provider** — it verifies facts you give it; it does not return the current time, weather, or live FX.
- **Not a credential sink** — it never asks for secrets or keys.
- **Not a registration check** — it validates a VAT number's checksum, not whether it is live-registered (VIES); it confirms a TLD is real, not that a domain is registered.

## Privacy

This tool runs locally on your machine and is built not to collect, store, or transmit your data — no analytics, no telemetry, no account. All reference data is bundled — no network calls, and nothing leaves your device. Full policy: <https://qinisolabs.github.io/privacy.html>.

## License

Apache-2.0
