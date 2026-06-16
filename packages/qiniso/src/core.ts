// Single source of truth for the umbrella's tools + a minimal, stateless
// JSON-RPC 2.0 handler (the wire format of MCP's Streamable HTTP transport).
// Both the HTTP host and the Cloudflare Worker reuse handleRpc(); the stdio
// server reuses the same TOOLS array via the MCP SDK.
import {
  validateIban,
  validateCard,
  validateIsbn13,
  validateVin,
} from "@qiniso/identifiers";
import {
  validateTld,
  validateDomain,
  validateIp,
  validateUuid,
  validateUrl,
  validateEmail,
} from "@qiniso/network";
import {
  validateIsin,
  validateCusip,
  validateSedol,
  validateLei,
  validateAba,
} from "@qiniso/finance";

export interface ToolSpec {
  name: string;
  description: string;
  argName: string;
  argDescription: string;
  run: (value: string) => unknown;
}

/** Every checkable-fact tool the layer exposes. New modules append here. */
export const TOOLS: ToolSpec[] = [
  {
    name: "validate_iban",
    description:
      "USE THIS to verify an IBAN (international bank account number) before relying on it — instead of guessing whether it looks right. Checks the country, the country-specific length, and the ISO 7064 mod-97 checksum, and returns the country, check digits and BBAN. Call this whenever a user supplies a bank account for a payment, payout or invoice.",
    argName: "iban",
    argDescription: "The IBAN to validate; spaces are ignored.",
    run: (v) => validateIban(v),
  },
  {
    name: "validate_card",
    description:
      "USE THIS to check a payment card number's structure before using it — never assume a card number is valid or guess its brand. Verifies the Luhn checksum, detects the brand (Visa, Mastercard, Amex, Discover, Diners, JCB, UnionPay) from its BIN, and checks the length. Does NOT check whether the card is real, active or has funds.",
    argName: "number",
    argDescription: "The card number; spaces and dashes are ignored.",
    run: (v) => validateCard(v),
  },
  {
    name: "validate_isbn",
    description:
      "USE THIS to verify an ISBN-13 book identifier instead of trusting that 13 digits are correct. Checks the 978/979 prefix and the mod-10 weighted check digit, and returns the expected check digit when it fails.",
    argName: "isbn",
    argDescription: "The ISBN-13; hyphens and spaces are ignored.",
    run: (v) => validateIsbn13(v),
  },
  {
    name: "validate_vin",
    description:
      "USE THIS to verify a vehicle VIN before acting on it — do not assume a 17-character string is a valid VIN. Checks the allowed alphabet (no I/O/Q) and the ISO 3779 transliteration check digit in position 9, and returns the expected check digit when it fails.",
    argName: "vin",
    argDescription: "The 17-character VIN to validate.",
    run: (v) => validateVin(v),
  },
  {
    name: "validate_tld",
    description:
      "USE THIS to check whether a top-level domain is real before trusting a domain or link — do NOT guess whether a TLD like .zip, .corp, .crypto or .web exists. Checks the suffix against the authoritative IANA root-zone list (kept current). Returns valid:false for TLDs that are not actually delegated.",
    argName: "tld",
    argDescription: "The TLD to check, with or without a leading dot (e.g. 'zip' or '.zip').",
    run: (v) => validateTld(v),
  },
  {
    name: "validate_domain",
    description:
      "USE THIS to verify a domain name's structure AND that its TLD is a real IANA-delegated suffix — instead of assuming a domain is legitimate. Catches invalid labels and made-up TLDs (e.g. example.corp). Returns the TLD and whether it is known.",
    argName: "domain",
    argDescription: "The domain name, e.g. 'example.com'.",
    run: (v) => validateDomain(v),
  },
  {
    name: "validate_ip",
    description:
      "USE THIS to verify an IP address before relying on it — do not assume a dotted or colon string is valid. Strictly checks IPv4 (RFC 791, rejects leading zeros / out-of-range octets) and IPv6 (RFC 4291, including '::' compression and embedded IPv4), and returns the version.",
    argName: "ip",
    argDescription: "The IPv4 or IPv6 address to validate.",
    run: (v) => validateIp(v),
  },
  {
    name: "validate_uuid",
    description:
      "USE THIS to verify a UUID and read its version/variant instead of guessing — e.g. to tell a v4 (random) from a v7 (time-ordered) UUID. Checks the canonical 8-4-4-4-12 form and returns version, variant and whether it is the nil UUID.",
    argName: "uuid",
    argDescription: "The UUID string to validate.",
    run: (v) => validateUuid(v),
  },
  {
    name: "validate_url",
    description:
      "USE THIS to verify a URL before fetching or storing it — parses it with the WHATWG URL standard and additionally checks that the host's TLD is a real IANA suffix. Returns protocol, hostname, port, path and whether the TLD is known.",
    argName: "url",
    argDescription: "The absolute URL to validate (e.g. https://example.com/path).",
    run: (v) => validateUrl(v),
  },
  {
    name: "validate_email",
    description:
      "USE THIS to check an email address's syntax AND that its domain TLD is real, before saving or sending — instead of trusting raw input. Validates the local part and domain (RFC 5321/5322 subset) and flags made-up TLDs. Does NOT check deliverability.",
    argName: "email",
    argDescription: "The email address to validate.",
    run: (v) => validateEmail(v),
  },
  {
    name: "validate_isin",
    description:
      "USE THIS to verify an ISIN (international securities identifier) before relying on it — never assume a 12-character code is valid. Checks the format and the ISO 6166 Luhn check digit, and returns the country code. Call this when a user supplies a security/instrument identifier.",
    argName: "isin",
    argDescription: "The 12-character ISIN, e.g. US0378331005.",
    run: (v) => validateIsin(v),
  },
  {
    name: "validate_cusip",
    description:
      "USE THIS to verify a CUSIP (North American securities identifier) instead of trusting 9 characters. Checks the CUSIP mod-10 check digit and returns the expected digit when it fails.",
    argName: "cusip",
    argDescription: "The 9-character CUSIP, e.g. 037833100.",
    run: (v) => validateCusip(v),
  },
  {
    name: "validate_sedol",
    description:
      "USE THIS to verify a SEDOL (LSE securities identifier) before relying on it. Checks the no-vowels alphabet and the weighted mod-10 check digit.",
    argName: "sedol",
    argDescription: "The 7-character SEDOL, e.g. B0YBKJ7.",
    run: (v) => validateSedol(v),
  },
  {
    name: "validate_lei",
    description:
      "USE THIS to verify a Legal Entity Identifier (LEI) before relying on it — do not assume a 20-character code is valid. Checks the ISO 17442 / ISO 7064 MOD 97-10 check digits.",
    argName: "lei",
    argDescription: "The 20-character LEI, e.g. 5493001KJTIIGC8Y1R12.",
    run: (v) => validateLei(v),
  },
  {
    name: "validate_routing",
    description:
      "USE THIS to verify a US bank routing / ABA transit number before relying on it for a payment or direct deposit. Checks the 9-digit weighted (3,7,1) mod-10 checksum. Does NOT check whether the bank or account is real.",
    argName: "routing",
    argDescription: "The 9-digit ABA routing number.",
    run: (v) => validateAba(v),
  },
];

export const SERVER_INFO = { name: "qiniso", version: "0.1.0" } as const;
const DEFAULT_PROTOCOL = "2025-06-18";

function inputSchema(t: ToolSpec) {
  return {
    type: "object",
    properties: { [t.argName]: { type: "string", description: t.argDescription } },
    required: [t.argName],
    additionalProperties: false,
  };
}

export function listTools() {
  return TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: inputSchema(t),
  }));
}

export function callTool(name: string, args: Record<string, unknown> | undefined) {
  const t = TOOLS.find((x) => x.name === name);
  if (!t) {
    const e: any = new Error(`Unknown tool: ${name}`);
    e.code = -32602;
    throw e;
  }
  const value = args?.[t.argName];
  return {
    content: [
      { type: "text", text: JSON.stringify(t.run(String(value ?? "")), null, 2) },
    ],
  };
}

interface JsonRpcMessage {
  jsonrpc?: string;
  id?: string | number;
  method?: string;
  params?: any;
}

/**
 * Handle one JSON-RPC message. Returns the response object, or null for
 * notifications (which must produce no body). Stateless: no sessions.
 */
export function handleRpc(msg: JsonRpcMessage): object | null {
  const { id, method, params } = msg;
  if (id === undefined || method === "notifications/initialized") return null;
  try {
    let result: unknown;
    switch (method) {
      case "initialize":
        result = {
          protocolVersion: params?.protocolVersion ?? DEFAULT_PROTOCOL,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        };
        break;
      case "tools/list":
        result = { tools: listTools() };
        break;
      case "tools/call":
        result = callTool(params?.name, params?.arguments);
        break;
      case "ping":
        result = {};
        break;
      default:
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
    }
    return { jsonrpc: "2.0", id, result };
  } catch (err: any) {
    return { jsonrpc: "2.0", id, error: { code: err?.code ?? -32603, message: err?.message ?? String(err) } };
  }
}
