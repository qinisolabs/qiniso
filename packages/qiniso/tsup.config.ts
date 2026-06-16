import { defineConfig } from "tsup";

// Bundle the umbrella for npm/.mcpb: inline the unpublished @qiniso/* workspace
// packages (and their JSON data), but keep the real npm deps external so the
// published library stays slim and lets npm dedupe them.
export default defineConfig({
  entry: {
    index: "src/index.ts", // library surface
    server: "src/server.ts", // stdio MCP bin
    http: "src/http.ts", // Node HTTP host
  },
  format: ["esm"],
  platform: "node",
  target: "node18",
  dts: true, // roll up declarations (no dangling @qiniso/* re-exports)
  clean: true,
  sourcemap: false,
  shims: false,
  // Force the workspace packages to be inlined; everything else (real npm
  // deps listed in `dependencies`) stays external by tsup's default.
  noExternal: [/^@qiniso\//],
});
