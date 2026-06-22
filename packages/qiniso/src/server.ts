#!/usr/bin/env node
// stdio MCP server — the local path (npx / .mcpb desktop extension).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TOOLS, SERVER_INFO, toolAnnotations } from "./core.js";

const server = new McpServer({ name: SERVER_INFO.name, version: SERVER_INFO.version });

for (const t of TOOLS) {
  // Build the zod shape from either the single-arg or multi-arg spec.
  const specArgs = t.args ?? [{ name: t.argName!, description: t.argDescription!, optional: false }];
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const a of specArgs) {
    const base = z.string().describe(a.description);
    shape[a.name] = a.optional ? base.optional() : base;
  }
  server.tool(t.name, t.description, shape, toolAnnotations(t.name), async (args: Record<string, string | undefined>) => {
    const result = t.args ? t.runArgs!(args) : t.run!(args[t.argName!] ?? "");
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      structuredContent: result as Record<string, unknown>,
    };
  });
}

async function main() {
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error("qiniso MCP server failed to start:", err);
  process.exit(1);
});
