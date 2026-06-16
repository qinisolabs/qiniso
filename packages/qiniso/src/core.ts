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
import { validateEthAddress, validateBtcAddress } from "@qiniso/crypto";
import {
  validateCpf,
  validateCnpj,
  validateSaId,
  validateDni,
  validateAadhaar,
} from "@qiniso/national-id";
import { validateIsbn10, validateIssn, validateOrcid } from "@qiniso/academic";
import {
  parseDate,
  validatePhone,
  formatMoney,
  isHoliday,
  nextHoliday,
  vatRate,
  parseAddress,
} from "@qiniso/locale";
import { validateVat } from "@qiniso/vat";
import { ICONS, PUBLIC_BASE } from "./branding.js";

export interface ToolArg {
  name: string;
  description: string;
  optional?: boolean;
}

// A tool is EITHER single-arg (argName/argDescription/run) — the original shape,
// left untouched — OR multi-arg (args/runArgs) for tools like locale that need
// several inputs (e.g. a phone number + region).
export interface ToolSpec {
  name: string;
  description: string;
  argName?: string;
  argDescription?: string;
  run?: (value: string) => unknown;
  args?: ToolArg[];
  runArgs?: (a: Record<string, string | undefined>) => unknown;
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
  {
    name: "validate_eth_address",
    description:
      "USE THIS to verify an Ethereum address before sending funds or storing it — never trust that a 0x… string is correct. Validates the format and the EIP-55 mixed-case checksum (catches typos), and returns the correctly-checksummed form. A wrong character makes a different address — funds sent there are lost.",
    argName: "address",
    argDescription: "The Ethereum address (0x + 40 hex chars).",
    run: (v) => validateEthAddress(v),
  },
  {
    name: "validate_btc_address",
    description:
      "USE THIS to verify a Bitcoin address before sending funds or storing it — do not assume it is valid. Checks Base58Check (P2PKH/P2SH, double-SHA256 checksum) and Bech32/Bech32m SegWit (bc1…, incl. Taproot), and returns the address type and network. A bad checksum means a mistyped address.",
    argName: "address",
    argDescription: "The Bitcoin address (legacy 1…/3… or bech32 bc1…).",
    run: (v) => validateBtcAddress(v),
  },
  {
    name: "validate_cpf",
    description:
      "USE THIS to verify a Brazilian CPF (individual taxpayer ID) before relying on it — never assume 11 digits are valid. Checks the two mod-11 check digits and rejects all-identical sentinels. Call this for KYC/onboarding of Brazilian individuals.",
    argName: "cpf",
    argDescription: "The CPF (11 digits; dots and dash are ignored).",
    run: (v) => validateCpf(v),
  },
  {
    name: "validate_cnpj",
    description:
      "USE THIS to verify a Brazilian CNPJ (company registration number) instead of trusting 14 digits. Checks the two mod-11 check digits. Call this for onboarding Brazilian businesses.",
    argName: "cnpj",
    argDescription: "The CNPJ (14 digits; punctuation is ignored).",
    run: (v) => validateCnpj(v),
  },
  {
    name: "validate_sa_id",
    description:
      "USE THIS to verify a South African ID number before relying on it. Checks the Luhn check digit and date-of-birth validity, and returns the date of birth, gender and citizenship status encoded in the number.",
    argName: "id",
    argDescription: "The 13-digit South African ID number.",
    run: (v) => validateSaId(v),
  },
  {
    name: "validate_dni",
    description:
      "USE THIS to verify a Spanish DNI or NIE before relying on it — do not guess the control letter. Checks the mod-23 control letter and returns whether it is a DNI or NIE.",
    argName: "id",
    argDescription: "The Spanish DNI (8 digits + letter) or NIE (X/Y/Z + 7 digits + letter).",
    run: (v) => validateDni(v),
  },
  {
    name: "validate_aadhaar",
    description:
      "USE THIS to verify the format and checksum of an Indian Aadhaar number — never assume 12 digits are valid. Checks the Verhoeff check digit and the leading-digit rule. Validates structure only; does NOT look the number up.",
    argName: "aadhaar",
    argDescription: "The 12-digit Aadhaar number (spaces ignored).",
    run: (v) => validateAadhaar(v),
  },
  {
    name: "validate_isbn10",
    description:
      "USE THIS to verify an ISBN-10 (older book identifier) instead of trusting 10 characters. Checks the mod-11 check digit (which may be 'X'). For 13-digit ISBNs use validate_isbn.",
    argName: "isbn",
    argDescription: "The ISBN-10 (hyphens/spaces ignored).",
    run: (v) => validateIsbn10(v),
  },
  {
    name: "validate_issn",
    description:
      "USE THIS to verify an ISSN (serial/journal identifier) before relying on it. Checks the mod-11 check digit (which may be 'X') and returns the expected digit when it fails.",
    argName: "issn",
    argDescription: "The ISSN (8 chars; hyphen ignored).",
    run: (v) => validateIssn(v),
  },
  {
    name: "validate_orcid",
    description:
      "USE THIS to verify an ORCID researcher identifier instead of trusting 16 digits. Checks the ISO 7064 MOD 11-2 check digit (which may be 'X'); accepts the bare ID or an orcid.org URL.",
    argName: "orcid",
    argDescription: "The ORCID (e.g. 0000-0002-1825-0097, or an orcid.org URL).",
    run: (v) => validateOrcid(v),
  },
  {
    name: "validate_phone",
    description:
      "USE THIS to check a phone number is correctly formatted for its country and normalise it to E.164 before saving, dialling or texting. You MUST pass the ISO country the number ACTUALLY belongs to (e.g. GB, US, ZA) — the result depends on it, so don't reuse an unrelated country field. 'valid' means it conforms to that country's numbering plan (plausible, well-formed), NOT that the line is live or reachable. Returns E.164, national/international formats and line type.",
    args: [
      { name: "number", description: "The phone number to validate." },
      { name: "region", description: "ISO country code the number belongs to (default GB).", optional: true },
    ],
    runArgs: (a) => validatePhone(a.number ?? "", a.region ?? "GB"),
  },
  {
    name: "parse_date",
    description:
      "USE THIS to interpret a human-written date into ISO 8601 (YYYY-MM-DD), especially ambiguous numeric dates like 03/04/2025 which mean different things in the UK (day-first) vs US (month-first). Pass locale 'en-GB' or 'en-US'. Returns valid:false for impossible dates.",
    args: [
      { name: "input", description: "The date text to parse." },
      { name: "locale", description: "'en-GB' (day-first) or 'en-US' (month-first); default en-GB.", optional: true },
    ],
    runArgs: (a) => parseDate(a.input ?? "", a.locale ?? "en-GB"),
  },
  {
    name: "format_currency",
    description:
      "USE THIS to format a money amount the way a reader in a locale expects (symbol position, separators) before showing it in a price, invoice or email. e.g. 1234.5 GBP en-GB → '£1,234.50'.",
    args: [
      { name: "amount", description: "The numeric amount." },
      { name: "currency", description: "ISO 4217 currency code (default GBP).", optional: true },
      { name: "locale", description: "BCP-47 locale (e.g. en-GB). Defaults from the currency.", optional: true },
    ],
    runArgs: (a) => formatMoney(Number(a.amount), a.currency ?? "GBP", a.locale),
  },
  {
    name: "is_holiday",
    description:
      "USE THIS to check whether a date is a public/bank holiday when computing business-day deadlines, delivery SLAs or 'next working day'. Supports ~200 countries (ISO code, e.g. GB, US, ZA, DE, IN); GB defaults to England — pass a subdivision ('SCT'/'WLS'/'NIR', or a US state) to narrow.",
    args: [
      { name: "date", description: "The date (YYYY-MM-DD)." },
      { name: "country", description: "ISO country code (default GB), e.g. GB, US, ZA, DE.", optional: true },
      { name: "subdiv", description: "Subdivision code (e.g. UK nation SCT/WLS/NIR, or a US state).", optional: true },
    ],
    runArgs: (a) => isHoliday(a.date ?? "", a.country ?? "GB", a.subdiv),
  },
  {
    name: "next_holiday",
    description:
      "USE THIS to find the next public/bank holiday on or after a date (default today) — e.g. to find the next working day. Supports ~200 countries (ISO code, e.g. GB, US, ZA, DE); subdivision narrows to a region.",
    args: [
      { name: "country", description: "ISO country code (default GB), e.g. GB, US, ZA, DE.", optional: true },
      { name: "after", description: "Find the next holiday on/after this date (YYYY-MM-DD); default today.", optional: true },
      { name: "subdiv", description: "Subdivision code (e.g. UK nation SCT/WLS/NIR, or a US state).", optional: true },
    ],
    runArgs: (a) => nextHoliday(a.country ?? "GB", a.after, a.subdiv),
  },
  {
    name: "tax_rate",
    description:
      "USE THIS before calculating VAT or sales tax on an invoice/quote — never recall the rate from memory, it is DATE-SENSITIVE. GB returns the UK standard VAT rate that applied on the given date (handles historical/temporary changes). US has no national VAT (returns 0); pass a state code for the state base sales-tax rate. Always pass the invoice date for GB.",
    args: [
      { name: "country", description: "GB or US (default GB).", optional: true },
      { name: "date", description: "The invoice date (YYYY-MM-DD); default today.", optional: true },
      { name: "state", description: "US state code (e.g. CA) for sales tax.", optional: true },
    ],
    runArgs: (a) => vatRate(a.country ?? "GB", a.date, a.state),
  },
  {
    name: "parse_address",
    description:
      "USE THIS to extract structured {country, postcode, city, state} from a free-text UK or US address — when onboarding a user, running a KYC/fraud check, or storing an address — instead of splitting the string yourself. Returns a confidence flag.",
    args: [{ name: "input", description: "The free-text address." }],
    runArgs: (a) => parseAddress(a.input ?? ""),
  },
  {
    name: "validate_vat",
    description:
      "USE THIS to verify an EU/EFTA VAT registration number's format and checksum before invoicing or onboarding a business — instead of trusting it looks right. Covers all EU members plus UK/EFTA. Pass the full number incl. country prefix (e.g. DE136695976) or the digits plus a country code. NOTE: checks format+checksum only; does NOT confirm the number is live-registered (that is a VIES lookup).",
    args: [
      { name: "vat", description: "The VAT number, ideally with its country prefix (e.g. DE136695976)." },
      { name: "country", description: "ISO country code, if the number has no prefix (e.g. DE).", optional: true },
    ],
    runArgs: (a) => validateVat(a.vat ?? "", a.country),
  },
];

export const SERVER_INFO = { name: "qiniso", version: "0.1.0" } as const;
const DEFAULT_PROTOCOL = "2025-06-18";

function argList(t: ToolSpec): ToolArg[] {
  return t.args ?? [{ name: t.argName!, description: t.argDescription! }];
}

function inputSchema(t: ToolSpec) {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const a of argList(t)) {
    properties[a.name] = { type: "string", description: a.description };
    if (!a.optional) required.push(a.name);
  }
  return { type: "object", properties, required, additionalProperties: false };
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
  let result: unknown;
  if (t.args) {
    const a: Record<string, string | undefined> = {};
    for (const arg of t.args) {
      const v = args?.[arg.name];
      a[arg.name] = v === undefined || v === null ? undefined : String(v);
    }
    result = t.runArgs!(a);
  } else {
    result = t.run!(String(args?.[t.argName!] ?? ""));
  }
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
          serverInfo: { ...SERVER_INFO, websiteUrl: PUBLIC_BASE, icons: ICONS },
          instructions:
            "Qiniso deterministically verifies structured facts (identifiers, locale, finance, crypto, national/tax IDs). Each tool validates ONE value per call. " +
            "For validating MANY values (e.g. a CSV or spreadsheet column), looping these tools one-by-one is slow; the same checks are available as the npm library `@qinisolabs/qiniso` (same functions: validateIban, validateVat, validatePhone, …) for one-pass bulk validation in your own environment. " +
            "For phone numbers, pass the number's ACTUAL country in `region` (e.g. GB for a UK number) — never reuse an unrelated country field; 'valid' means well-formed for that country's numbering plan, not that the line is live.",
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
