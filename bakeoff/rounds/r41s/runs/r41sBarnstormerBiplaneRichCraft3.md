```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, svg, paint, countershade, mottle, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Barnstormer Biplane",
  description: "A chubby, whimsical red-and-cream barnstormer biplane with a grinning engine cowling, a scarfed pilot and bunting.",
};

const RED = "#d8342c";
const CREAM = "#f6e8c8";
const UNDER = "#d9cdb0";
const GOLD = "#e9b13c";
const WOOD = "#8a5a32";
const DARK = "#2b2024";
const LEATHER = "#5a3a22";
const RIB = "#b9a98a";
const TEAL = "#3ab5b0";

export default function build() {
  const b = createBuilder({ name: "biplane" });
  const body = b.joint("body", { at: [0, 1.5, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.55, 1.9], dir: [0, 0, 1] });
  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: body, ...o });
  const rod = (a: number[], c: number[], r: number, col: string) => b.rod(a, c, r, col, { bone: body });

  // ---- Fuselage
  const FUS_BASE = countershade(RED, CREAM, { level: -0.35 });
  const FUS = paint((p, n) => (Math.abs(p.y - 1.64) < 0.025 && Math.abs(n.y) < 0.6 ? GOLD : FUS_BASE));
  const fus = b.loft(
    [
      { at: [0, 1.78, -3.4], w: 0.1, h: 0.15 },
      { at: [0, 1.72, -2.4], w: 0.3, h: 0.42 },
      { at: [0, 1.6, -1.0], w: 0.7, h: 0.75 },
      { at: [0, 1.55, 0.4], w: 0.95, h: 0.95 },
      { at: [0, 1.55, 1.3], w: 1.0, h: 1.0 },
    ],
    { color: FUS, bone: body },
  );

  // ---- Cowling and nose
  const cowl = b.lathe(
    [[0, 0], [0.52, 0], [0.58, 0.08], [0.58, 0.6], [0.47, 0.78], [0, 0.8]],
    { at: [0, 1.55, 1.1], axis: [0, 0, 1], color: mottle("#e6ae42", "#c58a2a", { size: 0.3 }), bone: body },
  );
  const FACE = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#e9b13c" stroke="#7a4f14" stroke-width="3"/>
    <circle cx="50" cy="50" r="22" fill="#c98a24"/>
    <g fill="#fff" stroke="#2b2024" stroke-width="3"><circle cx="30" cy="32" r="12"/><circle cx="70" cy="32" r="12"/></g>
    <circle cx="33" cy="34" r="5" fill="#2b2024"/><circle cx="67" cy="34" r="5" fill="#2b2024"/>
    <path d="M22 68 Q50 96 78 68 Z" fill="#7a1f1a" stroke="#2b2024" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 72 h8 v8 h-8z M46 76 h8 v10 h-8z M60 72 h8 v8 h-8z" fill="#fff"/></svg>`,
    { size: 256 },
  );
  b.decal(cowl, FACE, { at: [0, 1.55, 1.9], dir: [0, 0, 1], size: [0.92, 0.92] });
  b.ring(frame([0, 1.55, 1.15], [0, 0, 1]), { count: 12, radius: 0.58 }, (it) =>
    b.part(new THREE.SphereGeometry(0.03, 5, 4), "#7a4f14", { bone: body, frame: it }),
  );
  b.part(new THREE.ConeGeometry(0.17, 0.32, 8), RED, { bone: prop, at: [0, 1.55, 2.06], dir: [0, 0, 1] });
  for (const k of [1, -1])
    b.extrude([[-0.08, 0], [0.08, 0], [0.12, 0.7], [0, 0.98], [-0.12, 0.7]], {
      at: [0, 1.55, 1.93], x: [k, 0, 0], y: [0, k, 0], thickness: 0.035, bevel: 0.01, color: WOOD, bone: prop,
    });

  // ---- Wings
  const rrect = (hw: number, hh: number, r: number): [number, number][] => {
    const pts: [number, number][] = [];
    const cs: [number, number, number][] = [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]];
    for (const [sx, sy, a0] of cs)
      for (let i = 0; i <= 3; i++) {
        const a = ((a0 + i * 30) * Math.PI) / 180;
        pts.push([sx * (hw - r) + Math.cos(a) * r, sy * (hh - r) + Math.sin(a) * r]);
      }
    return pts;
  };
  const WING = paint((_p, n, s) => {
    const ax = Math.abs(s[0]);
    if (ax > 3.55 || s[1] > 0.58) return RED;
    if (Math.abs(n.y) > 0.5 && ax % 0.65 < 0.04) return RIB;
    return n.y > 0 ? CREAM : UNDER;
  });
  const wing = (y: number, z: number, hh: number) =>
    b.extrude(rrect(4.2, hh, 0.5), { at: [0, y, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bevel: 0.03, color: WING, bone: body });
  wing(1.2, 0.3, 0.65);
  wing(2.75, 0.6, 0.75);

  const SUN = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#d8342c" stroke="#2b2024" stroke-width="3"/>
    <circle cx="50" cy="50" r="36" fill="#f6e8c8"/>
    <g stroke="#e9b13c" stroke-width="6" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315]
      .map((a) => `<path d="M50 50 L${50 + 33 * Math.sin((a * Math.PI) / 180)} ${50 - 33 * Math.cos((a * Math.PI) / 180)}"/>`)
      .join("")}</g>
    <circle cx="50" cy="50" r="19" fill="#ffd23f" stroke="#2b2024" stroke-width="3"/>
    <circle cx="43" cy="46" r="2.8" fill="#2b2024"/><circle cx="57" cy="46" r="2.8" fill="#2b2024"/>
    <path d="M41 55 Q50 64 59 55" stroke="#2b2024" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { bone: body, at: [s * 2.2, 2.806, 0.6], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: SUN });

  // ---- Struts, wires, cabane
  for (const s of [1, -1]) {
    for (const dz of [0.4, -0.35]) rod([s * 2.4, 1.2, 0.3 + dz], [s * 2.4, 2.75, 0.6 + dz], 0.035, WOOD);
    rod([s * 2.4, 1.22, 0.65], [s * 2.4, 2.72, 0.25], 0.009, "#3a3a3a");
    rod([s * 2.4, 1.22, -0.05], [s * 2.4, 2.72, 1.0], 0.009, "#3a3a3a");
    rod([s * 3.8, 1.2, 0.5], [s * 3.8, 2.75, 0.8], 0.03, WOOD);
    rod([s * 0.35, 2.0, 0.9], [s * 0.55, 2.74, 0.95], 0.04, WOOD);
    rod([s * 0.35, 2.0, 0.1], [s * 0.55, 2.74, 0.2], 0.04, WOOD);
    rod([s * 0.35, 1.1, 0.4], [s * 2.4, 2.72, 1.0], 0.008, "#3a3a3a");
  }
  P(new THREE.CapsuleGeometry(0.17, 0.5, 4, 8), RED, { at: [0, 2.98, 0.6], dir: [1, 0, 0] });

  // ---- Tail
  const FIN = paint((_p, _n, s) => (s[0] < 0.55 ? CREAM : RED));
  b.extrude([[0, 0], [1.1, 0], [1.2, 0.45], [0.95, 0.95], [0.25, 0.85]], {
    at: [0, 1.78, -2.0], x: [0, 0, -1], thickness: 0.08, bevel: 0.02, color: FIN, bone: body,
  });
  b.extrude(rrect(1.2, 0.35, 0.3).map(([x, y]) => [x, y + 0.35] as [number, number]), {
    at: [0, 1.72, -2.3], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.07, bevel: 0.02, color: RED, bone: body,
  });
  rod([0.6, 1.68, -2.4], [0.1, 1.5, -2.2], 0.02, WOOD);
  rod([-0.6, 1.68, -2.4], [-0.1, 1.5, -2.2], 0.02, WOOD);
  rod([0, 1.65, -2.5], [0, 0.12, -3.05], 0.04, WOOD);
  P(new THREE.SphereGeometry(0.11, 8, 6), DARK, { at: [0, 0.11, -3.05] });

  // ---- Landing gear
  for (const s of [1, -1]) {
    const hub = [s * 0.85, 0.44, 0.9];
    P(new THREE.TorusGeometry(0.33, 0.11, 6, 14), DARK, { at: hub, dir: [1, 0, 0], axis: "z" });
    P(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 10), CREAM, { at: hub, dir: [1, 0, 0] });
    P(new THREE.SphereGeometry(0.1, 6, 5), RED, { at: [s * 0.95, 0.44, 0.9] });
    rod([s * 0.3, 1.15, 0.55], hub, 0.035, WOOD);
    rod([s * 0.3, 1.15, 1.25], hub, 0.035, WOOD);
  }
  rod([-0.85, 0.44, 0.9], [0.85, 0.44, 0.9], 0.03, "#555");

  // ---- Cockpits
  for (const z of [0.55, -0.5]) {
    P(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 14), DARK, { at: [0, 2.0, z] });
    P(new THREE.TorusGeometry(0.3, 0.04, 6, 14), LEATHER, { at: [0, 2.02, z], dir: [0, 1, 0], axis: "z" });
  }
  P(new THREE.BoxGeometry(0.55, 0.3, 0.03), "#bfe8f5", { at: [0, 2.2, 0.92], rotation: [-35, 0, 0] });
  P(new THREE.SphereGeometry(0.2, 8, 6), "#d8b673", { at: [0, 2.05, 0.55], scale: [1, 0.9, 1] });
  P(new THREE.ConeGeometry(0.06, 0.12, 5), RED, { at: [0, 2.27, 0.55] });

  // ---- Pilot
  const head = [0, 2.38, -0.5];
  P(new THREE.SphereGeometry(0.24, 10, 8), "#7a4a2a", { at: [0, 1.98, -0.5], scale: [1, 1.1, 0.9] });
  P(new THREE.SphereGeometry(0.17, 10, 8), "#f1be96", { at: head });
  P(new THREE.SphereGeometry(0.185, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER, { at: [0, 2.4, -0.5] });
  P(new THREE.SphereGeometry(0.035, 6, 4), "#e88f8f", { at: [0, 2.36, -0.34] });
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8), GOLD, { at: [s * 0.08, 2.43, -0.35], dir: [0, 0, 1] });
    P(new THREE.CylinderGeometry(0.045, 0.045, 0.055, 8), "#9fe3ff", { at: [s * 0.08, 2.43, -0.345], dir: [0, 0, 1] });
  }
  P(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 8), DARK, { at: [0, 2.43, -0.5] });
  b.sweep(catmull([[0, 2.22, -0.55], [0.05, 2.3, -0.95], [-0.05, 2.34, -1.2], [0.06, 2.42, -1.55]]), (t: number) => [0.08 * (1 - 0.3 * t), 0.012], {
    section: "box", color: stripes(RED, CREAM, { size: 0.1, axis: "z", wobble: 0 }), bone: body, caps: "flat",
  });
  P(new THREE.TorusGeometry(0.15, 0.05, 5, 10), RED, { at: [0, 2.2, -0.5], dir: [0, 1, 0], axis: "z" });

  // ---- Name decal
  const NAME = svg(
    `<svg viewBox="0 0 200 60"><text x="100" y="42" text-anchor="middle" font-family="serif" font-weight="bold" font-size="38" fill="#f6e8c8" stroke="#2b2024" stroke-width="3" paint-order="stroke">SKYLARK</text></svg>`,
    { size: 512 },
  );
  for (const s of [1, -1])
    b.decal(fus, NAME, { at: [s * 0.3, 1.62, -1.2], dir: [s, 0, 0], size: [1.2, 0.36] });

  // ---- Bunting
  const line = catmull([[-4.0, 2.78, 1.35], [-2, 2.45, 1.5], [0, 2.35, 1.55], [2, 2.45, 1.5], [4.0, 2.78, 1.35]]);
  b.sweep(line, 0.008, { color: "#333", bone: body, caps: "none" });
  const cols = [RED, GOLD, TEAL, CREAM];
  let i = 0;
  b.along(line, 16, (at: any) => {
    const p = at.at.clone();
    p.y -= 0.12;
    return b.part(new THREE.ConeGeometry(0.09, 0.26, 3), cols[i++ % cols.length], { bone: body, at: p, dir: [0, -1, 0] });
  });

  return b.root;
}
```