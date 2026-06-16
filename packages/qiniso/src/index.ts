// Library surface: import any Qiniso verifier directly, no MCP required.
//   import { validateIban, validateVat, validatePhone } from "qiniso";
export * from "@qiniso/identifiers";
export * from "@qiniso/network";
export * from "@qiniso/finance";
export * from "@qiniso/crypto";
export * from "@qiniso/national-id";
export * from "@qiniso/academic";
export * from "@qiniso/locale";
export * from "@qiniso/vat";
// MCP plumbing (for embedding the server / introspection):
export { TOOLS, listTools, callTool, handleRpc, SERVER_INFO } from "./core.js";
