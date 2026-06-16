// Cloudflare Worker entry — the edge host (free tier). Web-standard fetch
// handler over the same stateless JSON-RPC core. Deploy with `wrangler deploy`.
import { handleRpc } from "./core.js";
import { LOGO_SVG } from "./branding.js";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok" });
    }
    if (request.method === "GET" && (url.pathname === "/icon.svg" || url.pathname === "/favicon.ico")) {
      return new Response(LOGO_SVG, {
        headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
      });
    }
    if (request.method === "GET" && url.pathname === "/") {
      return json({
        name: "Qiniso",
        description: "The deterministic fact-verification layer for AI agents.",
        mcp: "/mcp",
        icon: "/icon.svg",
      });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid json" }, 400);
    }

    if (Array.isArray(payload)) {
      const out = payload.map(handleRpc).filter(Boolean);
      return json(out);
    }
    const r = handleRpc(payload);
    if (r === null) return new Response(null, { status: 202 });
    return json(r);
  },
};
