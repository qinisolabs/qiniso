# Qiniso (working name) — verification layer monorepo

The deterministic fact-verification layer for AI agents: it checks the structured facts an agent
emits (identifiers, locale, …) against authoritative ground truth by **exact computation and
curated data — not by asking another LLM.**

> Working name only. The public flagship name is not locked (see project notes: trademark
> clearance pending). Nothing here is published to npm yet.

## Layout

```
packages/
  identifiers/   # IBAN, card (Luhn+BIN), ISBN-13, VIN  (migrated from veridigit)
  qiniso/        # umbrella: aggregates all module tools into one MCP server
                 #   - stdio server (local / npx / .mcpb)
                 #   - Streamable HTTP server (Node host)
                 #   - Cloudflare Worker entry (edge host)
```

Each module is a typed importable library **and** contributes tools to the umbrella MCP server.

## Develop

```bash
npm install          # install workspace deps
npm run build        # tsc build every package
npm test             # run parity tests
```

## Run the umbrella server (stdio)

```bash
node packages/qiniso/dist/server.js
```

## Architecture

One shared core (pure functions in each module) feeds two transport adapters:

- **stdio** (`packages/qiniso/src/server.ts`) — local users, npx, `.mcpb` desktop extension.
- **Streamable HTTP, stateless** (`packages/qiniso/src/http.ts` + `worker.ts`) — hosted/remote
  users across Claude web/desktop/mobile. No sessions, no auth (tools read no user data).

See `../QINISO_BUILD_SEQUENCE.md` for the full plan and parked launch steps.
