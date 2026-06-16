// Brand assets served by the hosted endpoint. The SVG is inlined (Workers can't
// read files from disk) so it ships inside the Worker bundle.
export const PUBLIC_BASE = "https://qiniso.qinisolabs.workers.dev";

export const LOGO_SVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Qiniso">
  <defs>
    <linearGradient id="emerald" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10b981"/>
      <stop offset="1" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#emerald)"/>
  <circle cx="236" cy="252" r="120" fill="none" stroke="#ffffff" stroke-width="42"/>
  <path d="M238 300 L300 366 L420 190" fill="none" stroke="#ffffff" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// MCP Implementation icons (spec-aligned). Clients/directories that render server
// icons will pick this up; harmless to those that don't.
export const ICONS = [
  { src: `${PUBLIC_BASE}/icon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
];
