```ts
import * as THREE from "three";
import { createBuilder, paint, noise, mix, rng, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Warhauler 2077",
  description: "Low-poly cyberpunk armored military truck with turret, missile rack, neon underglow and six wheels.",
};

export default function build() {
  const b = createBuilder({ name: "warhauler" });
  const R = rng(77);

  // ---------- palette ----------
  const DARK = "#14161d";
  const STEEL = "#6b7387";
  const CYAN = "#19f2ff";
  const MAG = "#ff2bd6";
  const AMBER = "#ffb02e";
  const RED = "#ff2a3c";
  const LIME = "#9dff3a";

  // ---------- paints ----------
  const HULL = paint((p, n) => {
    const f = noise(p, 0.6, 3);
    let c = mix("#262c3a", "#454e63", f);
    if (noise(p, 0.9, 11) > 0.62) c = mix(c, "#3b2c52", 0.6);
    const u = Math.abs(n.x) > 0.5 ? p.z : p.x;
    const du = (((u / 0.8) % 1) + 1) % 1;
    const dv = (((p.y / 0.55) % 1) + 1) % 1;
    if (du < 0.02 || dv < 0.03) c = mix(c, "#07080c", 0.85);
    else if (du < 0.04 || dv < 0.06) c = mix(c, "#9aa6c4", 0.2);
    if (n.y > 0.5) c = mix(c, "#7d86a0", 0.15);
    return c;
  });
  const PLATE = paint((p) => mix("#1b1f2b", "#2e3547", noise(p, 0.3, 5)));
  const TIRE = paint((p, n) => {
    const a = Math.atan2(p.y - 0.62, p.z);
    const lug = Math.abs(n.x) < 0.5 && Math.sin(a * 18) > 0.3;
    return lug ? "#0a0a0d" : "#1a1b21";
  });

  // ---------- textures ----------
  const HUD = svg(
    `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#06141c"/>
    <path d="M0 0 L100 0 L100 8 L0 20Z" fill="#0d3a4a"/>
    <path d="M10 40 H90 M10 30 H60 M70 30 H90" stroke="#19f2ff" stroke-width="1.5"/>
    <circle cx="50" cy="25" r="10" fill="none" stroke="#ff2bd6" stroke-width="1.5"/>
    <path d="M50 12 V38 M37 25 H63" stroke="#ff2bd6" stroke-width="1"/>
    <text x="6" y="12" font-size="6" fill="#9dff3a" font-family="monospace">TGT LOCK 0042</text></svg>`,
    { size: 256 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#08202a"/>
    <path d="M0 32 L20 0 L28 0 L8 32Z M34 32 L54 0 L58 0 L38 32Z" fill="#19f2ff" opacity="0.35"/>
    <rect width="64" height="32" fill="none" stroke="#111" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 20"><rect width="64" height="20" fill="#0b0c10"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${3 + i * 5}" y="3" width="3" height="14" fill="${i % 3 === 0 ? "#ff2bd6" : "#394055"}"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#10131b" opacity="0.9"/>
    <rect x="1" y="1" width="78" height="48" fill="none" stroke="#19f2ff" stroke-width="1.5"/>
    <path d="M18 38 L30 10 L42 38 L36 38 L30 22 L24 38Z" fill="#ff2bd6"/>
    <circle cx="58" cy="24" r="12" fill="none" stroke="#ffb02e" stroke-width="3"/>
    <path d="M50 24 H66 M58 16 V32" stroke="#ffb02e" stroke-width="2"/>
    <text x="8" y="47" font-size="8" fill="#9dff3a" font-family="monospace">NX-2077 // ARES</text></svg>`,
    { size: 256 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 80 10"><rect width="80" height="10" fill="#f4c20d"/>
    ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 10} 10 L${i * 10 + 5} 0 L${i * 10 + 10} 0 L${i * 10 + 5} 10Z" fill="#111"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#232a3a"/>
    <rect x="3" y="3" width="94" height="54" fill="none" stroke="#0a0b10" stroke-width="2"/>
    <path d="M50 3 V57" stroke="#0a0b10" stroke-width="2"/>
    <rect x="42" y="26" width="6" height="8" fill="#ff2a3c"/><rect x="52" y="26" width="6" height="8" fill="#ff2a3c"/>
    <text x="8" y="14" font-size="7" fill="#19f2ff" font-family="monospace">CAUTION: HOT PAYLOAD</text></svg>`,
    { size: 256 },
  );
  const DOORLINE = svg(
    `<svg viewBox="0 0 60 40"><rect x="1" y="1" width="58" height="38" fill="#1c2230" stroke="#080a0f" stroke-width="2"/>
    <rect x="42" y="16" width="12" height="3" fill="#19f2ff"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (r0: number, r1: number, len: number, seg: number, at: number[], dir: number[], color: any) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { at, dir });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: THREE.Texture, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex });
  const lamp = (w: number, h: number, d: number, at: number[], color: string, s = 1.5) =>
    glow(box(w, h, d, at, color), s);

  // ---------- chassis ----------
  box(1.9, 0.3, 6.8, [0, 0.95, 0], DARK);
  box(1.0, 0.18, 6.4, [0, 0.76, 0], "#0b0c10");
  const wheelZ = [2.5, -1.3, -2.7];
  for (const z of wheelZ) {
    cyl(0.1, 0.1, 2.8, 8, [0, 0.62, z], [1, 0, 0], STEEL);
    b.part(new THREE.SphereGeometry(0.28, 8, 6), "#2a2f3c", { at: [0, 0.62, z] });
  }
  cyl(0.09, 0.09, 5.2, 8, [0, 0.7, -0.1], [0, 0, 1], "#3a4052");

  // ---------- wheels ----------
  for (const s of [1, -1]) {
    for (const z of wheelZ) {
      const x = s * 1.3;
      cyl(0.62, 0.62, 0.5, 12, [x, 0.62, z], [1, 0, 0], TIRE);
      cyl(0.34, 0.34, 0.54, 10, [x + s * 0.02, 0.62, z], [1, 0, 0], STEEL);
      glow(cyl(0.47, 0.47, 0.54, 12, [x + s * 0.03, 0.62, z], [1, 0, 0], MAG), 1.4);
      cyl(0.38, 0.38, 0.1, 10, [x + s * 0.28, 0.62, z], [1, 0, 0], "#222733");
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.06, 6, [x + s * 0.34, 0.62 + Math.sin(a) * 0.25, z + Math.cos(a) * 0.25], [1, 0, 0], "#c7cfe0");
      }
      // fender
      box(0.62, 0.1, 1.5, [s * 1.3, 1.3, z], PLATE);
      box(0.06, 0.28, 1.5, [s * 1.6, 1.2, z], PLATE);
    }
  }

  // ---------- cargo container ----------
  box(2.5, 1.2, 4.0, [0, 1.75, -1.4], HULL);
  box(2.54, 0.12, 4.1, [0, 1.17, -1.4], PLATE);
  box(2.54, 0.1, 4.1, [0, 2.38, -1.4], PLATE);
  box(1.6, 0.3, 0.5, [0, 1.5, 0.7], DARK); // coupling
  for (const s of [1, -1]) {
    lamp(0.03, 0.05, 3.8, [s * 1.27, 1.22, -1.4], MAG, 1.6);
    plane(1.7, 1.06, [s * 1.256, 1.85, -1.1], [s, 0, 0], EMBLEM);
    plane(1.7, 0.2, [s * 1.256, 2.22, -1.1], [s, 0, 0], HAZARD);
    for (let i = 0; i < 8; i++) {
      const z = -3.1 + i * 0.55;
      box(0.08, 1.15, 0.08, [s * 1.28, 1.75, z], "#171a24");
      if (i % 2 === 0) lamp(0.04, 0.1, 0.1, [s * 1.31, 1.4, z + 0.27], i % 4 === 0 ? CYAN : LIME, 1.3);
    }
    // fuel tanks
    cyl(0.22, 0.22, 1.2, 8, [s * 1.3, 1.05, 0.3], [0, 0, 1], "#3d4558");
    box(0.06, 0.06, 1.3, [s * 1.3, 1.05, 0.3], "#c7a02e");
    // exhaust
    cyl(0.1, 0.12, 2.0, 8, [s * 1.05, 2.1, 0.55], [0, 1, 0], "#2b2f3b");
    glow(cyl(0.09, 0.09, 0.05, 8, [s * 1.05, 3.12, 0.55], [0, 1, 0], AMBER), 1.6);
    // mirrors
    box(0.05, 0.4, 0.2, [s * 1.45, 2.1, 3.0], DARK);
    lamp(0.03, 0.34, 0.16, [s * 1.425, 2.1, 3.0], CYAN, 1.2);
    // cab windows & door
    plane(1.3, 0.6, [s * 1.108, 2.2, 2.0], [s, 0, 0], SIDEWIN);
    plane(1.5, 0.9, [s * 1.104, 1.55, 2.0], [s, 0, 0], DOORLINE);
    // side armor skirts
    box(0.08, 0.3, 2.0, [s * 1.12, 1.1, 1.9], PLATE);
    // headlight pods
    box(0.5, 0.3, 0.2, [s * 0.85, 1.6, 3.45], DARK);
    lamp(0.4, 0.18, 0.05, [s * 0.85, 1.6, 3.57], AMBER, 1.8);
    // tail lights
    lamp(0.3, 0.14, 0.05, [s * 0.9, 1.35, -3.42], RED, 1.8);
    // antennae
    cyl(0.015, 0.015, 1.4, 5, [s * 0.95, 3.4, 1.0], [0, 1, 0], "#999fb0");
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? LIME : MAG, { at: [s * 0.95, 4.1, 1.0] }), 2);
    // ram spikes
    for (let i = 0; i < 3; i++)
      b.part(new THREE.ConeGeometry(0.09, 0.45, 6), "#aab3c8", { at: [s * (0.3 + i * 0.4), 0.85, 3.8], dir: [0, 0, 1] });
  }

  // ---------- cab ----------
  b.extrude(
    [
      [0.8, 1.0],
      [3.2, 1.0],
      [3.4, 1.35],
      [3.4, 1.9],
      [2.6, 2.65],
      [1.0, 2.75],
      [0.8, 2.6],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, color: HULL },
  );
  const wn = new THREE.Vector3(0, 0.8, 0.75).normalize();
  plane(1.9, 1.0, [0, 2.275 + wn.y * 0.02, 3.0 + wn.z * 0.02], [wn.x, wn.y, wn.z], HUD);
  glow(plane(1.7, 0.28, [0, 1.52, 3.405], [0, 0, 1], GRILLE), 0.8);
  lamp(2.0, 0.07, 0.04, [0, 1.8, 3.41], CYAN, 2);
  lamp(1.6, 0.07, 0.12, [0, 2.78, 2.3], MAG, 2);
  box(2.7, 0.35, 0.5, [0, 0.82, 3.45], PLATE);
  plane(2.5, 0.25, [0, 0.82, 3.705], [0, 0, 1], HAZARD);
  box(2.3, 0.2, 0.9, [0, 1.0, 3.05], DARK);
  box(0.1, 0.12, 1.2, [0, 2.8, 1.9], PLATE);

  // sensor dome on cab roof
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.3, 0.06],
      [0.18, 0.2],
      [0, 0.26],
    ],
    { at: [0.5, 2.78, 1.5], color: "#2a3040", segments: 8 },
  );
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [0.5, 3.0, 1.62] }), 2);

  // ---------- turret ----------
  cyl(0.75, 0.8, 0.22, 10, [0, 2.5, -0.9], [0, 1, 0], "#242a38");
  box(1.2, 0.5, 1.4, [0, 2.88, -0.9], HULL);
  box(0.9, 0.3, 0.6, [0, 3.2, -0.8], PLATE);
  lamp(0.5, 0.06, 0.04, [0, 3.2, -0.49], RED, 2);
  for (const s of [1, -1]) {
    const dir = [0, 0.12, 1];
    cyl(0.08, 0.08, 1.8, 8, [s * 0.3, 2.95, 0.15], dir, "#313849");
    cyl(0.12, 0.12, 0.4, 8, [s * 0.3, 2.93, -0.25], dir, "#586079");
    glow(cyl(0.06, 0.06, 0.05, 8, [s * 0.3, 3.16, 1.05], dir, CYAN), 2);
    box(0.3, 0.3, 0.4, [s * 0.75, 2.85, -0.9], DARK);
  }

  // ---------- missile rack ----------
  box(1.8, 0.2, 1.4, [0, 2.5, -2.8], DARK);
  box(1.8, 0.7, 0.1, [0, 2.85, -3.45], PLATE);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = -0.55 + c * 0.55;
      const z = -3.0 + r * 0.5;
      cyl(0.17, 0.17, 1.2, 8, [x, 3.0, z], [0, 1, 0.5], "#3a4256");
      cyl(0.12, 0.12, 0.05, 8, [x, 3.0 + 0.54, z + 0.27], [0, 1, 0.5], "#111");
      glow(cyl(0.1, 0.1, 0.04, 8, [x, 3.0 + 0.57, z + 0.285], [0, 1, 0.5], RED), 1.8);
    }

  // ---------- rear door ----------
  plane(2.3, 1.1, [0, 1.75, -3.405], [0, 0, -1], DOOR);
  plane(2.4, 0.16, [0, 1.07, -3.41], [0, 0, -1], HAZARD);
  box(2.7, 0.3, 0.4, [0, 0.85, -3.55], PLATE);

  // ---------- roof greebles ----------
  const cols = ["#2a3040", "#3b4358", "#23273a", "#4a3a5e"];
  let placed = 0;
  while (placed < 38) {
    const x = (R() - 0.5) * 2.0;
    const z = -3.2 + R() * 3.6;
    if (Math.abs(z + 0.9) < 0.95 || Math.abs(z + 2.8) < 0.95) continue;
    const w = 0.12 + R() * 0.3;
    const h = 0.08 + R() * 0.25;
    const d = 0.12 + R() * 0.3;
    box(w, h, d, [x, 2.43 + h / 2, z], cols[Math.floor(R() * cols.length)]);
    if (R() < 0.3) lamp(w * 0.5, 0.03, 0.03, [x, 2.43 + h + 0.015, z + d / 2], R() < 0.5 ? CYAN : LIME, 1.5);
    placed++;
  }

  // ---------- underglow ----------
  lamp(1.4, 0.03, 5.8, [0, 0.64, 0], CYAN, 1.8);

  return b.root;
}
```