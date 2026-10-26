import * as THREE from "three";
import { createBuilder, svg, paint, mix, smoothstep, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Synthwave Arcade Cabinet",
  description: "1980s upright arcade cabinet with neon synthwave marquee, sunset side art, CRT screen, joystick and buttons.",
};

const BODY = "#1b1038";
const BODY2 = "#2a1560";
const PINK = "#ff2e9a";
const CYAN = "#22e6ff";
const YEL = "#ffd23f";
const DARK = "#0a0616";
const CHROME = "#b8b8d0";

export default function build() {
  const b = createBuilder({ name: "arcade" });
  b.joint("root", { at: [0, 0, 0] });

  const W = 0.68; // width
  const D = 0.8;
  const side = paint((p, n) => {
    const base = mix(BODY, BODY2, smoothstep(0, 1.8, p.y));
    if (Math.abs(n.x) > 0.7) {
      const sunY = 1.0, d = Math.hypot(p.z + 0.05, p.y - sunY);
      if (d < 0.22) {
        const stripe = p.y < sunY && Math.floor((sunY - p.y) / 0.025) % 2 === 0 && p.y < sunY - 0.04;
        if (!stripe) return mix(YEL, PINK, smoothstep(sunY + 0.2, sunY - 0.2, p.y));
      }
      const line = Math.abs(((p.y * 8) % 1) - 0.5) < 0.03 && p.y < 0.6;
      if (line) return CYAN;
      if (p.y < 0.45) return mix(base, "#3a1a80", noise(p, 0.1, 3) * 0.5);
    }
    return base;
  });

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: "root" });

  // Base
  box(W, 0.12, D, DARK, 0, 0.06, 0);
  // Side panels (profile extrudes)
  const prof: [number, number][] = [
    [-0.4, 0.12], [0.4, 0.12], [0.4, 0.8], [0.2, 0.95], [0.2, 1.3], [0.34, 1.35], [0.34, 1.72], [-0.3, 1.78], [-0.4, 1.7],
  ];
  for (const s of [1, -1]) {
    b.extrude(prof, { at: [s * (W / 2 - 0.015), 0, 0], x: [0, 0, 1], thickness: 0.03, color: side, bone: "root" });
  }
  // Back
  box(W - 0.06, 1.6, 0.03, BODY, 0, 0.9, -0.39);
  // Control deck (angled)
  b.part(new THREE.BoxGeometry(W - 0.06, 0.06, 0.4), BODY2, { at: [0, 0.95, 0.2], rotation: [-15, 0, 0], bone: "root" });
  box(W - 0.06, 0.55, 0.03, DARK, 0, 0.55, 0.3);
  // Coin door
  box(0.2, 0.2, 0.01, "#333344", 0, 0.5, 0.32);
  for (const s of [-1, 1]) {
    box(0.04, 0.05, 0.015, PINK, s * 0.05, 0.52, 0.325);
    glow(box(0.02, 0.03, 0.01, YEL, s * 0.05, 0.47, 0.327), 1.2);
  }
  // Screen bezel + lower
  b.part(new THREE.BoxGeometry(W - 0.06, 0.55, 0.04), DARK, { at: [0, 1.4, 0.19], rotation: [-8, 0, 0], bone: "root" });
  const scr = svg(`<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#12062e"/>
<circle cx="32" cy="26" r="11" fill="#ff7a2e"/><circle cx="32" cy="26" r="7" fill="#ffd23f"/>
<rect y="26" width="64" height="22" fill="#2a0a5e"/>
${[...Array(8)].map((_, i) => `<path d="M0 ${27 + i * 3}H64" stroke="#ff2e9a" stroke-width="0.6"/>`).join("")}
${[...Array(9)].map((_, i) => `<path d="M32 26L${i * 8} 48" stroke="#22e6ff" stroke-width="0.5"/>`).join("")}
<path d="M0 26L10 20L18 25L28 16L36 24L46 18L64 26Z" fill="#12062e"/>
<text x="32" y="9" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="7" fill="#22e6ff">NEON RUN</text>
<text x="32" y="45" text-anchor="middle" font-family="monospace" font-size="4" fill="#ffd23f">INSERT COIN</text></svg>`, { size: 256 });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.375), "#ffffff", { at: [0, 1.4, 0.214], dir: [0, 0.14, 1], axis: "z", texture: scr, bone: "root" }), 1.1);

  // Marquee
  box(W - 0.06, 0.2, 0.3, BODY2, 0, 1.72, 0.12);
  const mq = svg(`<svg viewBox="0 0 100 24"><rect width="100" height="24" fill="#16062e"/>
<text x="50" y="17" text-anchor="middle" font-family="Impact,sans-serif" font-weight="bold" font-size="17" fill="#ff2e9a" stroke="#22e6ff" stroke-width="1">NEON RUN</text>
<path d="M2 2H98M2 22H98" stroke="#ffd23f" stroke-width="1"/></svg>`, { size: 512 });
  glow(b.part(new THREE.PlaneGeometry(0.58, 0.14), "#ffffff", { at: [0, 1.72, 0.272], texture: mq, bone: "root" }), 1.3);

  // Neon edge trim
  for (const s of [1, -1]) {
    glow(box(0.015, 1.5, 0.015, CYAN, s * (W / 2 + 0.002), 0.9, 0.39), 1.5);
    glow(box(0.015, 0.2, 0.32, PINK, s * (W / 2 - 0.02), 1.72, 0.12), 1.2);
  }
  glow(box(W - 0.06, 0.015, 0.015, PINK, 0, 0.13, 0.4), 1.5);
  glow(box(W - 0.06, 0.015, 0.015, CYAN, 0, 1.12, 0.38), 1.5);

  // Joystick
  const jx = -0.14, jy = 0.97, jz = 0.24;
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.015, 12), DARK, { at: [jx, jy, jz], rotation: [-15, 0, 0], bone: "root" });
  b.rod([jx, jy + 0.01, jz], [jx, jy + 0.12, jz + 0.02], 0.008, CHROME, { bone: "root" });
  b.part(new THREE.SphereGeometry(0.03, 10, 8), PINK, { at: [jx, jy + 0.14, jz + 0.025], bone: "root" });
  // Buttons
  const cols = [PINK, CYAN, YEL, PINK, CYAN, YEL];
  cols.forEach((c, i) => {
    const x = 0.05 + (i % 3) * 0.075, z = 0.2 + Math.floor(i / 3) * 0.07;
    b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.02, 10), DARK, { at: [x, 0.965 - (z - 0.2) * 0.2, z], bone: "root" });
    glow(b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 10), c, { at: [x, 0.98 - (z - 0.2) * 0.2, z], bone: "root" }), 1);
  });
  // Start buttons
  for (const s of [-1, 1]) glow(b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.015, 8), s > 0 ? CYAN : PINK, { at: [s * 0.2, 0.985, 0.33], bone: "root" }), 1);
  // Feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.06, 0.02, 0.06, CHROME, sx * 0.3, 0.0, sz * 0.34);

  return b.root;
}
