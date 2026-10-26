```ts
import * as THREE from "three";
import { createBuilder, paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "A 1980s upright arcade cabinet with neon synthwave side art, glowing marquee and screen, joystick and buttons.",
};

export default function build() {
  const b = createBuilder({ name: "arcade" });
  const body = b.joint("cabinet", { at: [0, 0, 0], dir: [0, 1, 0] });

  const NAVY = "#150a2e";
  const PINK = "#ff2ea6";
  const CYAN = "#22e6ff";
  const PURPLE = "#6a2cff";
  const BLACK = "#0a0614";

  const cab = paint((p, n) => {
    const base = mix("#1b0c3a", "#2b1160", smoothstep(0, 1.8, p.y));
    const g = 0.04 * noise(p, 0.05, 3);
    return [base[0] + g, base[1] + g, base[2] + g];
  });

  // side panel art texture
  const sideArt = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="160" fill="#1b0c3a"/>
    <circle cx="50" cy="70" r="34" fill="#ff2ea6"/>
    <circle cx="50" cy="70" r="34" fill="#ffb347" opacity="0.5"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="10" y="${72 + i * 6}" width="80" height="${1 + i * 0.8}" fill="#1b0c3a"/>`).join("")}
    <path d="M0 100 H100 M0 112 H100 M0 128 H100 M0 150 H100" stroke="#22e6ff" stroke-width="1.5"/>
    <path d="M50 100 L-40 160 M50 100 L10 160 M50 100 L90 160 M50 100 L140 160 M50 100 L50 160" stroke="#22e6ff" stroke-width="1.2"/>
    <rect x="0" y="0" width="100" height="4" fill="#22e6ff"/>
    <rect x="0" y="156" width="100" height="4" fill="#ff2ea6"/>
    </svg>`,
    { size: 256 },
  );

  const marquee = svg(
    `<svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="50" fill="#1a0838"/>
    <rect x="3" y="3" width="194" height="44" fill="none" stroke="#22e6ff" stroke-width="2"/>
    <text x="100" y="33" text-anchor="middle" font-family="Impact, sans-serif" font-weight="bold" font-size="26" fill="#ff2ea6" stroke="#22e6ff" stroke-width="1">NEON RUNNER</text>
    </svg>`,
    { size: 512 },
  );

  const screenTex = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0a5e"/><stop offset="0.5" stop-color="#ff2ea6"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs>
    <rect width="100" height="80" fill="url(#s)"/>
    <circle cx="50" cy="40" r="16" fill="#ffe14d"/>
    <rect y="40" width="100" height="40" fill="#0a0620"/>
    <path d="M0 48 H100 M0 58 H100 M0 72 H100 M50 40 L-30 80 M50 40 L20 80 M50 40 L80 80 M50 40 L130 80" stroke="#22e6ff" stroke-width="0.8"/>
    <path d="M10 40 L25 28 L38 40 M62 40 L78 24 L92 40" fill="#0a0620"/>
    <rect x="44" y="64" width="12" height="6" fill="#ff2ea6"/>
    <text x="50" y="10" text-anchor="middle" font-family="monospace" font-size="7" fill="#22e6ff">SCORE 0042069</text>
    </svg>`,
    { size: 256 },
  );

  const W = 0.68, D = 0.8;
  // main body: lower box, control panel slope, upper box
  b.part(new THREE.BoxGeometry(W, 0.9, D), cab, { bone: body, at: [0, 0.45, 0] });
  b.part(new THREE.BoxGeometry(W, 0.85, 0.6), cab, { bone: body, at: [0, 1.33, -0.1] });
  // control deck sloped
  b.part(new THREE.BoxGeometry(W + 0.04, 0.06, 0.34), "#2a1260", { bone: body, at: [0, 0.97, 0.3], rotation: [-12, 0, 0] });
  // marquee head
  b.part(new THREE.BoxGeometry(W, 0.24, 0.5), cab, { bone: body, at: [0, 1.88, -0.12] });
  glow(
    b.part(new THREE.PlaneGeometry(W - 0.06, 0.17), "#ffffff", {
      bone: body, at: [0, 1.88, 0.14], dir: [0, 0, 1], axis: "z", texture: marquee,
    }),
    1.3,
  );
  // screen bezel and screen
  b.part(new THREE.BoxGeometry(W - 0.1, 0.5, 0.05), BLACK, { bone: body, at: [0, 1.38, 0.2], rotation: [-8, 0, 0] });
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.4), "#ffffff", {
      bone: body, at: [0, 1.38, 0.228], dir: [0, 0.14, 1], axis: "z", texture: screenTex,
    }),
    1,
  );
  // coin door
  b.part(new THREE.BoxGeometry(0.2, 0.26, 0.02), "#3b3b4a", { bone: body, at: [0, 0.6, D / 2 + 0.005] });
  for (const y of [0.64, 0.56]) {
    glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 0.015), PINK, { bone: body, at: [-0.04, y, D / 2 + 0.02] }), 1.2);
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.01), BLACK, { bone: body, at: [0.05, y, D / 2 + 0.02] });
  }
  // kick plate / base
  b.part(new THREE.BoxGeometry(W + 0.02, 0.08, D + 0.02), BLACK, { bone: body, at: [0, 0.04, 0] });
  // side art, trim
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(D - 0.1, 1.6 * 0.8), "#ffffff", {
      bone: body, at: [s * (W / 2 + 0.002), 0.9, 0], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: sideArt,
    });
    glow(b.part(new THREE.BoxGeometry(0.01, 2.0, 0.015), CYAN, { bone: body, at: [s * (W / 2 + 0.004), 1.0, D / 2 - 0.02] }), 1.2);
    glow(b.part(new THREE.BoxGeometry(0.012, 0.012, 0.5), PINK, { bone: body, at: [s * (W / 2 + 0.004), 2.0, -0.12] }), 1.3);
  }
  // joystick
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 10), BLACK, { bone: body, at: [-0.15, 1.01, 0.3] });
  b.rod([-0.15, 1.01, 0.3], [-0.15, 1.13, 0.29], 0.008, "#999aa8", { bone: body });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), "#ff2e3a", { bone: body, at: [-0.15, 1.14, 0.29] });
  // buttons
  const cols = [PINK, CYAN, "#ffe14d", "#7dff5a"];
  cols.forEach((c, i) => {
    const x = 0.04 + (i % 2) * 0.08 + Math.floor(i / 2) * 0.05;
    const z = 0.34 - Math.floor(i / 2) * 0.07;
    b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.015, 10), BLACK, { bone: body, at: [x, 1.0, z] });
    glow(b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 10), c, { bone: body, at: [x, 1.012, z] }), 1);
  });
  // start buttons
  for (const x of [0.2, 0.26]) glow(b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.015, 8), PURPLE, { bone: body, at: [x, 1.0, 0.4] }), 1);
  // speaker grille slots in marquee underside
  for (let i = 0; i < 5; i++) b.part(new THREE.BoxGeometry(0.4, 0.008, 0.01), NAVY, { bone: body, at: [0, 1.72 - i * 0.0, 0.18], scale: [1, 1, 1], });

  return b.root;
}
```