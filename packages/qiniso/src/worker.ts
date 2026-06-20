// Cloudflare Worker entry — the edge host (free tier). Web-standard fetch
// handler over the same stateless JSON-RPC core. Deploy with `wrangler deploy`.
import { handleRpc } from "./core.js";
import { LOGO_SVG, FAVICON_PNG_B64 } from "./branding.js";

// The connector directory fetches a server's logo via Google's favicon service, which needs a
// real raster favicon (not SVG) discoverable from an HTML page. So "/" is HTML that links the
// PNG favicon, and /favicon.ico is served as PNG.
const FAVICON_PNG = Uint8Array.from(atob(FAVICON_PNG_B64), (c) => c.charCodeAt(0));

const LANDING_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Qiniso — deterministic fact verification for AI agents</title>
<link rel="icon" type="image/png" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
<link rel="apple-touch-icon" href="/favicon.ico" />
<meta name="description" content="Qiniso is the deterministic fact-verification layer for AI agents — checksums and curated data, not guesses." />
<style>body{margin:0;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0b1220;background:#fff;text-align:center;padding:64px 24px}img{width:84px;height:84px}h1{font-size:2rem;margin:18px 0 6px}p{color:#5b6472;max-width:560px;margin:0 auto 10px}code{background:#eef2f0;padding:2px 7px;border-radius:6px;font-family:ui-monospace,Menlo,monospace}a{color:#047857}</style>
</head><body>
<img src="/icon.svg" alt="Qiniso" />
<h1>Qiniso</h1>
<p>The deterministic fact-verification layer for AI agents — it checks the structured facts an agent emits (IBAN, VAT, IDs, crypto addresses, dates and more) against checksums and curated data.</p>
<p>MCP endpoint: <code>/mcp</code> · <a href="https://qinisolabs.github.io/qiniso/">Docs</a> · <a href="https://github.com/qinisolabs/qiniso">GitHub</a></p>
</body></html>`;

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
    if (request.method === "GET" && (url.pathname === "/favicon.ico" || url.pathname === "/favicon.png")) {
      return new Response(FAVICON_PNG, {
        headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" },
      });
    }
    if (request.method === "GET" && url.pathname === "/icon.svg") {
      return new Response(LOGO_SVG, {
        headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400" },
      });
    }
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(LANDING_HTML, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" },
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
