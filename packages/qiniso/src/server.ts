#!/usr/bin/env node
// stdio MCP server — the local path (npx / .mcpb desktop extension).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TOOLS, SERVER_INFO } from "./core.js";

const server = new McpServer({ name: SERVER_INFO.name, version: SERVER_INFO.version });

for (const t of TOOLS) {
  server.tool(
    t.name,
    t.description,
    { [t.argName]: z.string().describe(t.argDescription) },
    async (args: Record<string, string>) => ({
      content: [
        { type: "text" as const, text: JSON.stringify(t.run(args[t.argName]), null, 2) },
      ],
    })
  );
}

async function main() {
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  console.error("qiniso MCP server failed to start:", err);
  process.exit(1);
});
