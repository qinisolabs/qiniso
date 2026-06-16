#!/usr/bin/env node
// Streamable-HTTP MCP server for Node hosts (Koyeb/Render/Fly). Stateless:
// each POST /mcp carries a JSON-RPC message; we answer with application/json.
import { createServer } from "node:http";
import { handleRpc } from "./core.js";
import { LOGO_SVG } from "./branding.js";

const PORT = Number(process.env.PORT ?? 8787);

const server = createServer((req, res) => {
  const send = (status: number, body?: string) =>
    res.writeHead(status, { "content-type": "application/json" }).end(body);

  if (req.method === "GET" && req.url === "/health") return send(200, '{"status":"ok"}');
  if (req.method === "GET" && (req.url === "/icon.svg" || req.url === "/favicon.ico")) {
    return res.writeHead(200, { "content-type": "image/svg+xml" }).end(LOGO_SVG);
  }
  if (req.method !== "POST") return send(405, '{"error":"method not allowed"}');

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch {
      return send(400, '{"error":"invalid json"}');
    }
    if (Array.isArray(payload)) {
      const out = payload.map(handleRpc).filter(Boolean);
      return send(200, JSON.stringify(out));
    }
    const r = handleRpc(payload);
    if (r === null) return res.writeHead(202).end();
    return send(200, JSON.stringify(r));
  });
});

server.listen(PORT, () => console.error(`qiniso HTTP MCP listening on :${PORT}/mcp`));
