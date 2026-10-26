```ts
import * as THREE from "three";
import { createBuilder, svg, rng, paint, mix, smoothstep, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "1980s upright arcade cabinet with neon synthwave marquee, sunset side art, CRT screen, joystick and buttons.",
};

export default function build() {
  const b = createBuilder({ name: "arcade" });
  b.joint("base", { at: [0, 0, 0] });

  const W = 0.68, D = 0.85;
  const BLACK = "#14101f", PURPLE = "#2a1348", PINK = "#ff3fa4", CYAN = "#33e6ff", YEL = "#ffd23f";

  const sideArt = paint((p, n) => {
    const base = mix("#1b0d38", "#4b1a7a", smoothstep(0, 1.8, p.y));
    if (Math.abs(n.x) < 0.5) return mix(BLACK, PURPLE, noise(p, 0.1, 2));
    // sunset stripes + grid on side
    const sunC = [0, 1.05];
    const d = Math.hypot(p.z * 1 - sunC[0] - 0.05, p.y - sunC[1]);
    if (d < 0.26) {
      const band = Math.floor((p.y - 0.8) / 0.03);
      if (p.y < 0.98 && band % 2 === 0) return base;
      return mix(YEL, PINK, smoothstep(1.3, 0.8, p.y));
    }
    if (p.y < 0.55 && Math.abs(((p.z * 6) % 1)) < 0.06) return CYAN;
    if (p.y < 0.55 && Math.abs(((p.y * 12) % 1)) < 0.06) return CYAN;
    return base;
  });

  // Side panels
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 1.8, D), sideArt, { at: [s * (W / 2 - 0.02), 0.9, 0] });
    b.part(new THREE.BoxGeometry(0.05, 0.02, D + 0.02), CYAN, { at: [s * (W / 2 - 0.02), 1.0, 0] });
    glow(b.part(new THREE.BoxGeometry(0.02, 1.8, 0.02), PINK, { at: [s * (W / 2), 0.9, D / 2] }), 1.2);
  }
  // Back and base
  b.part(new THREE.BoxGeometry(W, 1.8, 0.03), BLACK, { at: [0, 0.9, -D / 2 + 0.015] });
  b.part(new THREE.BoxGeometry(W - 0.08, 0.08, D - 0.02), BLACK, { at: [0, 0.04, 0] });
  // Front lower panel with coin door
  b.part(new THREE.BoxGeometry(W - 0.08, 0.5, 0.04), "#241040", { at: [0, 0.33, D / 2 - 0.03] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.09, 0.14, 0.02), "#0a0812", { at: [s * 0.1, 0.4, D / 2 - 0.005] });
    glow(b.part(new THREE.BoxGeometry(0.03, 0.05, 0.01), s > 0 ? PINK : CYAN, { at: [s * 0.1, 0.4, D / 2 + 0.008] }), 1.4);
  }
  glow(b.part(new THREE.BoxGeometry(W - 0.1, 0.012, 0.01), PINK, { at: [0, 0.6, D / 2 - 0.005] }), 1.3);

  // Control panel (angled)
  const cp = b.part(new THREE.BoxGeometry(W - 0.04, 0.05, 0.3), "#1c1030", { at: [0, 0.95, D / 2 - 0.05], rotation: [-12, 0, 0] });
  b.part(new THREE.BoxGeometry(W - 0.04, 0.012, 0.3), CYAN, { at: [0, 0.975, D / 2 - 0.055], rotation: [-12, 0, 0] });
  void cp;
  const cpY = 0.985, cpZ = D / 2 - 0.055;
  // joystick
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), "#999", { at: [-0.12, cpY + 0.06, cpZ] });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), PINK, { at: [-0.12, cpY + 0.13, cpZ] });
  b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.01, 10), BLACK, { at: [-0.12, cpY + 0.005, cpZ] });
  // buttons
  const cols = [PINK, CYAN, YEL, "#7dff6a"];
  cols.forEach((c, i) => {
    const x = 0.04 + (i % 2 === 0 ? 0 : 0.03) + i * 0.06;
    glow(b.part(new THREE.CylinderGeometry(0.025, 0.027, 0.02, 10), c, { at: [x, cpY + 0.01, cpZ + (i % 2 ? -0.03 : 0.01)] }), 1);
  });

  // Monitor bezel + screen
  b.part(new THREE.BoxGeometry(W - 0.1, 0.55, 0.05), BLACK, { at: [0, 1.38, D / 2 - 0.18], rotation: [-8, 0, 0] });
  const screenTex = svg(`<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0840"/><stop offset="0.6" stop-color="#ff3fa4"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#s)"/>
    <circle cx="32" cy="26" r="11" fill="#ffd23f"/>
    <rect x="20" y="28" width="24" height="1.5" fill="#ff3fa4"/><rect x="20" y="32" width="24" height="2" fill="#ff3fa4"/>
    <rect x="0" y="34" width="64" height="14" fill="#14062e"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${i * 8} 48 L32 34" stroke="#33e6ff" stroke-width="0.6"/>`).join("")}
    ${[36, 39, 43].map((y) => `<path d="M0 ${y} H64" stroke="#33e6ff" stroke-width="0.6"/>`).join("")}
    <text x="32" y="9" text-anchor="middle" font-family="monospace" font-size="6" fill="#33e6ff">1UP 008800</text>
    <path d="M26 20 L32 8 L38 20 Z" fill="#fff" opacity="0"/>
  </svg>`, { size: 256 });
  glow(
    b.part(new THREE.PlaneGeometry(W - 0.2, 0.44), "#ffffff", {
      at: [0, 1.38, D / 2 - 0.152], dir: [0, 0.14, 1], axis: "z", texture: screenTex,
    }),
    0.9,
  );

  // Marquee
  b.part(new THREE.BoxGeometry(W, 0.2, 0.4), BLACK, { at: [0, 1.82, 0.0] });
  const marq = svg(`<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="30" fill="#1a0838"/>
    <rect x="2" y="2" width="116" height="26" fill="none" stroke="#33e6ff" stroke-width="1.5"/>
    <text x="60" y="21" text-anchor="middle" font-family="Impact, sans-serif" font-size="18" fill="#ff3fa4" stroke="#ffd23f" stroke-width="0.8">NEON RUNNER</text>
    <path d="M6 26 H114" stroke="#ffd23f" stroke-width="1"/>
  </svg>`, { size: 512 });
  glow(
    b.part(new THREE.PlaneGeometry(W - 0.06, 0.17), "#ffffff", {
      at: [0, 1.82, 0.201], dir: [0, 0, 1], axis: "z", texture: marq,
    }),
    1.3,
  );
  // Top cap and trim
  b.part(new THREE.BoxGeometry(W + 0.02, 0.03, 0.42), PURPLE, { at: [0, 1.935, 0] });
  glow(b.part(new THREE.BoxGeometry(W + 0.02, 0.015, 0.015), CYAN, { at: [0, 1.715, 0.205] }), 1.4);
  // Neon edge strips along front uprights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.012, 0.55, 0.012), CYAN, { at: [s * (W / 2 - 0.05), 1.38, D / 2 - 0.14] }), 1.2);
  }
  // Feet
  const r = rng(3);
  for (const s of [1, -1]) for (const z of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.02, 6), "#222", { at: [s * 0.28, 0.0, z * 0.35] });
    void r;
  }
  return b.root;
}
```