```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mix, smoothstep, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup truck converted to four ducted hover thrusters, low-poly cyberpunk with neon trim and a bed-mounted gun.",
};

export default function build() {
  const b = createBuilder({ name: "hover_pickup" });

  // ---------- palette ----------
  const DARK = "#14121c", STEEL = "#3b3f4e", STEEL2 = "#555a6e", GLASS = "#10203a";
  const CYAN = "#19f0ff", MAG = "#ff2bb8", AMBER = "#ffb02e", RED = "#ff2a3c", BLUE = "#2a5cff";
  const OLIVE = "#55603c", SAND = "#8d8260", RUBBER = "#1b1b20";

  const camo = patches("#4a5a34", ["#3a4628", "#7a7050", "#2f3a2a", "#59653f"], { size: 0.55, gap: 0.03, seed: 4 });
  const BODY = paint((p, n) => {
    let c = camo.at(p, n);
    if (p.y < 1.0) c = mix(c, "#4a3f30", 0.55 * smoothstep(1.0, 0.7, p.y) + 0.2 * noise(p, 0.1, 2));
    if (n.y > 0.7) c = mix(c, "#b9c08a", 0.15);
    if (n.y < -0.5) c = mix(c, "#111", 0.5);
    return c;
  });
  const PLATE = paint((p, n) => mix(mix("#2c303c", "#5a6074", noise(p, 0.12, 9)), "#0c0c10", n.y < -0.4 ? 0.5 : 0));

  // ---------- textures ----------
  const GRILLE = svg(
    `<svg viewBox="0 0 120 30"><rect width="120" height="30" rx="3" fill="#0d0c14" stroke="#19f0ff" stroke-width="1.5"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${8 + i * 10.4}" y="4" width="6" height="22" fill="#262a3c"/>`).join("")}
    <path d="M44 22 L60 6 L76 22" stroke="#ff2bb8" stroke-width="3" fill="none"/>
    <rect x="3" y="26" width="114" height="1.5" fill="#19f0ff"/></svg>`, { size: 256 });
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#0d0c14" stroke="#19f0ff" stroke-width="3"/>
    <polygon points="32,10 38,26 55,26 41,36 46,53 32,43 18,53 23,36 9,26 26,26" fill="#ff2bb8" stroke="#fff" stroke-width="1.5"/>
    <path d="M6 32 H18 M46 32 H58" stroke="#19f0ff" stroke-width="2"/></svg>`, { size: 128 });
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e8b81c"/>
    ${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 10 - 6},16 ${i * 10 + 1},16 ${i * 10 + 9},0 ${i * 10 + 2},0" fill="#15131a"/>`).join("")}</svg>`, { size: 256 });
  const NUM = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8f4ff" stroke="#0d0c14" stroke-width="1.2">HV-07</text></svg>`, { size: 256 });
  const HUD = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#031418"/>
    <path d="M2 18 L8 10 L14 14 L20 5 L30 9" stroke="#19f0ff" stroke-width="1.5" fill="none"/>
    <circle cx="24" cy="16" r="4" stroke="#ff2bb8" stroke-width="1.2" fill="none"/><rect x="2" y="21" width="20" height="1.5" fill="#19f0ff"/></svg>`, { size: 128 });

  // ---------- helpers ----------
  type O = Record<string, unknown>;
  const B = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: O = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const C = (r1: number, r2: number, h: number, c: any, x: number, y: number, z: number, o: O = {}, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), c, { at: [x, y, z], ...o });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", up: [0, 1, 0], texture: tex });
  const side = { z: [0, 0, 1], y: [0, 1, 0] };
  void side;

  // ---------- main body (side-profile extrusions) ----------
  b.extrude(
    [[-2.6, 0.7], [2.55, 0.7], [2.6, 1.1, "sharp"], [2.2, 1.35], [0.9, 1.45], [-2.6, 1.45]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.0, bevel: 0.03, color: BODY });
  // cab
  b.extrude(
    [[-0.95, 1.45], [0.95, 1.45], [0.35, 2.05], [-0.7, 2.05], [-0.95, 1.9]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.8, bevel: 0.03, color: BODY });
  // side glass
  b.extrude(
    [[-0.75, 1.62], [0.15, 1.62], [0.32, 1.95], [-0.6, 1.95], [-0.8, 1.8]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.86, color: GLASS });
  // windshield
  glow(B(1.7, 0.03, 0.85, "#1d4a7a", 0, 1.78, 0.66, { rotation: [45, 0, 0] }), 0.5);
  // rear window
  B(1.4, 0.3, 0.03, GLASS, 0, 1.78, -0.96);
  // pillars and roof
  B(1.82, 0.06, 1.15, STEEL, 0, 2.07, -0.17);
  for (const s of [1, -1]) {
    B(0.06, 0.45, 0.07, STEEL, s * 0.93, 1.78, 0.0);
    B(0.06, 0.4, 0.06, STEEL, s * 0.93, 1.78, -0.78);
  }

  // underbody + skirts
  B(1.7, 0.2, 4.8, PLATE, 0, 0.62, -0.05);
  for (const s of [1, -1]) {
    B(0.1, 0.22, 3.2, PLATE, s * 1.04, 0.85, -0.2);
    for (let i = 0; i < 6; i++) B(0.03, 0.05, 0.12, GLASS, s * 1.1, 0.85, -1.3 + i * 0.5); // vents
    // neon strips
    glow(B(0.03, 0.04, 4.9, CYAN, s * 1.012, 0.78, 0.0), 1.6);
    glow(B(0.03, 0.03, 4.4, MAG, s * 1.0, 0.66, 0.0), 1.4);
    // door seams, handles
    for (const z of [-0.55, 0.05, 0.85]) B(0.02, 0.8, 0.02, DARK, s * 0.905, 1.9 - 0.4 + 0.05, z - 0.0, { scale: [1, 0.6, 1] });
    B(0.04, 0.04, 0.18, STEEL2, s * 1.02, 1.3, -0.45);
    B(0.04, 0.04, 0.18, STEEL2, s * 1.02, 1.3, 0.2);
    // mirrors
    B(0.05, 0.05, 0.25, DARK, s * 0.99, 1.68, 0.4, { rotation: [0, 0, 0] });
    B(0.07, 0.18, 0.22, STEEL, s * 1.1, 1.72, 0.4);
    glow(B(0.01, 0.12, 0.17, CYAN, s * 1.0 + s * 0.135, 1.72, 0.4), 0.8);
    // emblem + number
    decal(EMBLEM, 0.5, 0.5, [s * 1.008, 1.07, -0.35], [s, 0, 0]);
    decal(NUM, 0.72, 0.36, [s * 1.008, 1.07, 0.5], [s, 0, 0]);
    // fender plates with bolts
    B(0.06, 0.28, 1.0, STEEL, s * 1.03, 1.2, 1.7);
    for (let i = 0; i < 4; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), STEEL2, { at: [s * 1.065, 1.2 + (i % 2 ? 0.08 : -0.08), 1.35 + i * 0.22] });
    // bed walls
    B(0.1, 0.42, 1.65, BODY, s * 0.95, 1.66, -1.775);
    B(0.12, 0.05, 1.7, STEEL, s * 0.95, 1.9, -1.775);
    // roll hoop
    C(0.035, 0.035, 0.8, STEEL2, s * 0.85, 1.85, -1.1);
  }
  B(1.8, 0.42, 0.1, BODY, 0, 1.66, -2.55); // tailgate
  B(1.8, 0.05, 0.12, STEEL, 0, 1.9, -2.55);
  B(1.8, 0.35, 0.1, BODY, 0, 1.62, -1.0 - 0.02);
  C(0.035, 0.035, 1.75, STEEL2, 0, 2.25, -1.1, { rotation: [0, 0, 90] });
  decal(HAZARD, 1.6, 0.2, [0, 1.0, -2.605], [0, 0, -1]);
  for (const s of [1, -1]) glow(B(0.35, 0.16, 0.05, RED, s * 0.72, 1.2, -2.62), 1.6);
  glow(B(1.1, 0.04, 0.04, RED, 0, 1.2, -2.62), 1.2);

  // ---------- hood ----------
  B(1.6, 0.05, 1.2, PLATE, 0, 1.42, 1.55, { rotation: [4.4, 0, 0] });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) b.part(new THREE.SphereGeometry(0.022, 5, 4), STEEL2, { at: [s * 0.74, 1.46 - i * 0.012, 1.1 + i * 0.3] });
    for (let i = 0; i < 3; i++) B(0.35, 0.02, 0.05, DARK, s * 0.45, 1.46, 1.4 + i * 0.12, { rotation: [4.4, 0, 0] });
    glow(B(0.02, 0.02, 1.0, CYAN, s * 0.82, 1.45, 1.55, { rotation: [4.4, 0, 0] }), 1.3);
  }
  // scoop
  B(0.5, 0.12, 0.45, DARK, 0, 1.5, 1.8, { rotation: [4.4, 0, 0] });
  B(0.4, 0.06, 0.05, MAG, 0, 1.46, 2.03);

  // ---------- front end ----------
  B(2.1, 0.34, 0.24, STEEL, 0, 0.86, 2.62);
  decal(GRILLE, 1.3, 0.33, [0, 0.95, 2.752], [0, 0, 1]);
  B(2.2, 0.1, 0.3, PLATE, 0, 0.64, 2.6);
  for (const s of [1, -1]) {
    glow(B(0.42, 0.13, 0.08, "#fff2c8", s * 0.75, 1.17, 2.58), 2);
    B(0.5, 0.05, 0.1, DARK, s * 0.75, 1.27, 2.55);
    B(0.12, 0.28, 0.22, STEEL2, s * 1.05, 0.88, 2.55);
    glow(B(0.2, 0.05, 0.03, AMBER, s * 0.95, 0.68, 2.76), 1.6);
    B(0.25, 0.04, 0.3, STEEL2, s * 0.35, 0.58, 2.7);
  }
  glow(B(1.9, 0.03, 0.03, MAG, 0, 1.05, 2.745), 1.5);
  // tow hooks / winch
  C(0.07, 0.07, 0.25, DARK, 0, 0.72, 2.8, { rotation: [0, 0, 90] });

  // ---------- roof gear ----------
  B(1.1, 0.08, 0.22, DARK, 0, 2.15, -0.2);
  for (let i = 0; i < 6; i++) glow(B(0.16, 0.08, 0.2, i < 3 ? RED : BLUE, -0.4 + i * 0.16, 2.2, -0.2), 1.8);
  B(0.5, 0.22, 0.6, OLIVE, 0.45, 2.21, 0.0); // missile pod
  for (let i = 0; i < 6; i++) b.part(new THREE.CircleGeometry(0.05, 8), "#0a0a0c", { at: [0.45 - 0.14 + (i % 3) * 0.14, 2.17 + Math.floor(i / 3) * 0.1 + 0.02, 0.305], dir: [0, 0, 1], axis: "z" });
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [-0.5, 2.1, 0.15] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [-0.5, 2.2, 0.28] }), 2);
  C(0.012, 0.006, 1.1, DARK, -0.8, 2.6, -0.85, { rotation: [0, 0, 4] }, 5);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { at: [-0.85, 3.15, -0.85] }), 2);

  // ---------- bed cargo & gun ----------
  const crate = B(0.5, 0.35, 0.4, SAND, 0.55, 1.63, -2.25);
  void crate;
  decal(HAZARD, 0.5, 0.1, [0.55, 1.7, -2.05], [0, 0, 1]);
  for (let i = 0; i < 2; i++) {
    B(0.28, 0.4, 0.14, OLIVE, -0.65 + i * 0.32, 1.65, -2.3);
    B(0.1, 0.05, 0.05, DARK, -0.65 + i * 0.32, 1.88, -2.3);
  }
  // turret
  C(0.2, 0.26, 0.3, STEEL, 0, 1.6, -1.65, {}, 10);
  b.part(new THREE.TorusGeometry(0.24, 0.025, 4, 12), MAG, { at: [0, 1.75, -1.65], rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.24, 0.02, 4, 12), MAG, { at: [0, 1.77, -1.65], rotation: [90, 0, 0] }), 1.5);
  B(0.4, 0.3, 0.55, STEEL2, 0, 1.97, -1.6);
  B(0.46, 0.1, 0.3, PLATE, 0, 2.15, -1.7);
  for (const s of [1, -1]) {
    C(0.04, 0.04, 0.85, DARK, s * 0.11, 1.98, -1.45, { rotation: [90, 0, 0] }, 6);
    C(0.06, 0.05, 0.1, STEEL, s * 0.11, 1.98, -1.04, { rotation: [90, 0, 0] }, 6);
    B(0.12, 0.2, 0.25, OLIVE, s * 0.3, 1.9, -1.8); // ammo box
  }
  b.part(new THREE.PlaneGeometry(0.3, 0.22), "#ffffff", { at: [0, 2.0, -1.31], dir: [0, 0, 1], axis: "z", texture: HUD });
  glow(b.part(new THREE.PlaneGeometry(0.3, 0.22), "#ffffff", { at: [0, 2.0, -1.312], dir: [0, 0, 1], axis: "z", texture: HUD }), 1.3);
  B(0.5, 0.3, 0.04, PLATE, 0, 2.0, -1.3); // gun shield

  // ---------- hover thrusters ----------
  const duct: any = [[0.38, 0.02], [0.52, 0], [0.56, 0.25], [0.5, 0.55], [0, 0.55], [0, 0.4], [0.38, 0.4]];
  for (const sx of [1, -1]) {
    for (const z of [1.65, -1.55]) {
      const x = sx * 1.45;
      B(0.6, 0.16, 0.5, STEEL, sx * 1.22, 0.6, z); // pylon
      B(0.3, 0.06, 0.3, MAG, sx * 1.22, 0.69, z);
      b.lathe(duct, { at: [x, 0, z], axis: [0, 1, 0], segments: 10, color: STEEL2 });
      C(0.36, 0.36, 0.03, "#0a2a3a", x, 0.2, z, {}, 12);
      glow(C(0.34, 0.34, 0.02, CYAN, x, 0.16, z, {}, 12), 1.8);
      for (let i = 0; i < 6; i++)
        B(0.34, 0.02, 0.07, DARK, x + Math.cos((i * Math.PI) / 3) * 0.17, 0.25, z + Math.sin((i * Math.PI) / 3) * 0.17, { rotation: [0, -i * 60, 12] });
      C(0.06, 0.06, 0.1, STEEL, x, 0.26, z, {}, 6);
      glow(b.part(new THREE.TorusGeometry(0.43, 0.025, 4, 14), MAG, { at: [x, 0.04, z], rotation: [90, 0, 0] }), 1.6);
      glow(C(0.575, 0.575, 0.03, MAG, x, 0.45, z, {}, 14), 1.4);
      C(0.3, 0.3, 0.06, DARK, x, 0.58, z, {}, 8); // intake
      for (let i = 0; i < 4; i++) B(0.5, 0.02, 0.03, STEEL, x, 0.62, z - 0.12 + i * 0.08);
      B(0.1, 0.14, 0.1, DARK, x + sx * 0.4, 0.65, z + 0.2); // small vernier
    }
  }
  // central belly pad
  glow(C(0.45, 0.45, 0.04, MAG, 0, 0.58, 0.0, {}, 10), 1.4);
  C(0.5, 0.5, 0.04, DARK, 0, 0.56, 0.0, {}, 10);
  // rear exhaust cooling stacks
  for (const s of [1, -1]) {
    C(0.07, 0.09, 0.4, DARK, s * 0.6, 1.5, -2.45, { rotation: [0, 0, 0] }, 6);
    glow(C(0.05, 0.05, 0.02, AMBER, s * 0.6, 1.71, -2.45, {}, 6), 1.5);
  }
  void RUBBER;
  return b.root;
}
```