```ts
import * as THREE from "three";
import { createBuilder, mottle, stripes, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier with raised accelerator rails, deployed on four stabiliser outriggers.",
};

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- palette ----------
  const OLIVE = mottle("#5a6a40", "#46532f", { size: 0.9, seed: 3 });
  const MUD = mottle("#4a3f2c", "#352c1e", { size: 0.25, seed: 8 });
  const HULL = paint((p, n) => {
    const f = (((p.z / 1.5) % 1) + 1) % 1;
    if (f < 0.012 && Math.abs(n.x) > 0.5) return "#2a3322";
    if (p.y < 1.15 && n.y < 0.5) return MUD;
    return OLIVE;
  });
  const DARK = "#23262a";
  const STEEL = "#6d737c";
  const GUN = "#3b4048";
  const GUNLIGHT = "#59606b";
  const RUBBER = "#17181a";
  const CYAN = "#52e6ff";
  const HAZARD = stripes("#e8b400", "#1a1a1a", { size: 0.18, axis: "x", width: 0.5, wobble: 0 });

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const box = (size: [number, number, number], color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, ...o });
  const cyl = (r: number, h: number, color: any, at: number[], dir: number[], seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, ...o });
  const beam = (size: [number, number, number], color: any, at: THREE.Vector3 | number[], dir: THREE.Vector3 | number[]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, dir, axis: "z" });

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1d2430" stroke="#e9e3c9" stroke-width="3"/>
    <path d="M32 9 L38 26 L56 26 L42 37 L47 55 L32 44 L17 55 L22 37 L8 26 L26 26Z" fill="#e9e3c9"/>
    <circle cx="32" cy="32" r="6" fill="#d2402e"/></svg>`,
    { size: 128 },
  );
  const MARK = svg(
    `<svg viewBox="0 0 128 40"><text x="64" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e9e3c9">RG-6</text></svg>`,
    { size: 256 },
  );
  const GLASS = svg(
    `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd2e6"/><stop offset="1" stop-color="#1c3a4c"/></linearGradient></defs>
    <rect width="100" height="40" fill="#10171c"/><rect x="3" y="3" width="94" height="34" rx="3" fill="url(#g)"/>
    <path d="M12 37 L30 3 L40 3 L22 37Z M50 37 L68 3 L74 3 L56 37Z" fill="#ffffff" opacity="0.28"/><rect x="48" y="3" width="4" height="34" fill="#10171c"/></svg>`,
    { size: 256 },
  );
  const CELLS = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#0b1318"/>
    ${[0, 1, 2, 3]
      .map((i) => `<rect x="${4 + i * 19}" y="5" width="15" height="30" rx="2" fill="#35d8ff"/><rect x="${4 + i * 19}" y="${5 + 8 * (i % 3)}" width="15" height="${6}" fill="#c8f6ff"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const BOLTS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#8a9099" stroke="#2a2d32" stroke-width="3"/>
    <circle cx="32" cy="32" r="10" fill="#3a3f46"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<circle cx="${32 + 20 * Math.cos((i * Math.PI) / 3)}" cy="${32 + 20 * Math.sin((i * Math.PI) / 3)}" r="3.5" fill="#2a2d32"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 H4Z" fill="#e8b400" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
    <path d="M32 22 V40" stroke="#111" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.5" fill="#111"/></svg>`,
    { size: 128 },
  );

  const decal = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], color = "#ffffff", up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", texture: tex, up });

  // ---------- hull ----------
  const hullProfile: [number, number][] = [
    [-4.6, 0], [4.2, 0], [4.75, 0.3], [4.75, 0.8], [3.9, 0.95], [-4.6, 0.95],
  ];
  b.extrude(hullProfile, { at: [0, 0.95, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: HULL });
  // belly armour plate
  box([2.2, 0.15, 8.6], DARK, [0, 0.9, -0.2]);
  // front bumper + tow hooks
  box([2.7, 0.4, 0.3], DARK, [0, 1.15, 4.78]);
  for (const s of [1, -1]) {
    box([0.2, 0.2, 0.3], STEEL, [s * 0.9, 1.0, 4.98]);
    glow(box([0.5, 0.2, 0.08], "#ffe9a8", [s * 0.8, 1.55, 4.78]), 1.4);
    glow(box([0.4, 0.14, 0.06], "#ff3a2a", [s * 1.0, 1.55, -4.62]), 1.2);
    // side vents & tool boxes
    for (let i = 0; i < 4; i++) box([0.06, 0.3, 0.1], DARK, [s * 1.27, 1.7, -3.9 + i * 0.22]);
    box([0.18, 0.4, 1.0], "#3d4a2c", [s * 1.32, 1.5, 0.8]);
    // fenders over wheels
    for (const z of [-3.2, -0.2, 2.8]) {
      box([0.8, 0.1, 1.6], "#3c4a2d", [s * 1.5, 1.36, z]);
      box([0.1, 0.25, 1.6], "#3c4a2d", [s * 1.86, 1.28, z]);
    }
    // emblem + marking
    decal(0.8, 0.8, EMBLEM, [s * 1.27, 1.4, 1.6], [s, 0, 0]);
    decal(1.2, 0.38, MARK, [s * 1.27, 1.55, -1.6], [s, 0, 0]);
    decal(0.4, 0.4, WARN, [s * 1.27, 1.55, 0.0], [s, 0, 0]);
  }

  // ---------- cab ----------
  const cabProfile: [number, number][] = [[0, 0], [1.7, 0], [1.7, 0.55], [1.1, 1.0], [0.2, 1.0], [0, 0.8]];
  b.extrude(cabProfile, { at: [0, 1.9, 2.5], x: [0, 0, 1], thickness: 2.2, bevel: 0.04, color: HULL });
  const wn = V(0, 0.8, 0.6).normalize();
  decal(1.9, 0.76, GLASS, [0, 2.675, 3.9].map((v, i) => v + [0, 0.8, 0.6][i] * 0.03), [wn.x, wn.y, wn.z]);
  for (const s of [1, -1]) {
    decal(1.0, 0.4, GLASS, [s * 1.11, 2.55, 3.2], [s, 0, 0]);
    // mirrors
    box([0.08, 0.35, 0.2], DARK, [s * 1.2, 2.5, 4.05]);
  }
  // roof gear
  b.lathe([[0, 0], [0.3, 0.07], [0.42, 0.2], [0.38, 0.2], [0.28, 0.1], [0, 0.03]], {
    at: [0.5, 3.15, 3.0], axis: [0, 0.8, 0.6], color: GUNLIGHT, segments: 8,
  });
  cyl(0.04, 0.3, STEEL, [0.5, 3.0, 3.0], [0, 1, 0], 6);
  b.part(new THREE.SphereGeometry(0.22, 8, 6), DARK, { at: [-0.5, 3.05, 2.8] });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [-0.5, 3.05, 3.0] }), 1.5);
  for (const s of [1, -1]) {
    cyl(0.015, 1.6, STEEL, [s * 0.9, 3.5, 2.7], [s * 0.05, 1, -0.1], 5);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ff4030", { at: [s * 0.9, 4.3, 2.65] }), 1.5);
  }
  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    cyl(0.14, 0.9, DARK, [s * 1.0, 2.35, 2.2], [0, 1, 0], 8);
    cyl(0.17, 0.12, STEEL, [s * 1.0, 2.82, 2.2], [0, 1, 0], 8);
  }

  // ---------- wheels ----------
  for (const z of [-3.2, -0.2, 2.8]) {
    cyl(0.1, 3.2, DARK, [0, 0.62, z], [1, 0, 0], 6); // axle
    box([0.5, 0.3, 0.5], DARK, [0, 0.8, z]);
    for (const s of [1, -1]) {
      cyl(0.62, 0.5, RUBBER, [s * 1.5, 0.62, z], [1, 0, 0], 12, { flat: true });
      cyl(0.36, 0.54, STEEL, [s * 1.5, 0.62, z], [1, 0, 0], 8);
      // tyre lugs
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.26;
        box([0.52, 0.1, 0.16], "#0d0e10", [s * 1.5, 0.62 + Math.sin(a) * 0.63, z + Math.cos(a) * 0.63], {
          rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        });
      }
      b.part(new THREE.CircleGeometry(0.32, 8), "#ffffff", {
        at: [s * 1.77, 0.62, z], dir: [s, 0, 0], axis: "z", texture: BOLTS,
      });
    }
  }
  cyl(0.12, 6.8, DARK, [0, 0.95, 0], [0, 0, 1], 6); // drive shaft

  // ---------- stabiliser legs ----------
  for (const z of [-4.1, 1.4]) {
    for (const s of [1, -1]) {
      box([1.9, 0.32, 0.4], GUN, [s * 2.0, 1.2, z]); // arm
      box([0.5, 0.5, 0.6], DARK, [s * 1.25, 1.2, z]); // hinge block
      cyl(0.2, 0.6, STEEL, [s * 2.9, 0.95, z], [0, 1, 0], 8); // sleeve
      cyl(0.11, 0.75, "#c8ccd2", [s * 2.9, 0.55, z], [0, 1, 0], 6); // piston
      b.rod(V(s * 1.35, 0.95, z), V(s * 2.8, 0.45, z), 0.07, GUNLIGHT); // diagonal brace
      b.part(new THREE.CylinderGeometry(0.58, 0.68, 0.22, 10), HAZARD, { at: [s * 2.9, 0.11, z] });
      box([0.3, 0.3, 0.3], DARK, [s * 2.9, 0.33, z]);
      glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), "#ffb020", { at: [s * 2.9, 1.1, z + 0.22] }), 1.5);
    }
  }

  // ---------- railgun ----------
  const P = V(0, 3.25, -1.2);
  const pitch = (13 * Math.PI) / 180;
  const D = V(0, Math.sin(pitch), Math.cos(pitch));
  const at = (d: number, x = 0, y = 0) => P.clone().addScaledVector(D, d).add(V(x, y, 0));
  // pedestal & trunnions
  box([1.8, 1.0, 2.6], HULL, [0, 2.4, -1.2]);
  box([2.0, 0.15, 2.8], DARK, [0, 1.95, -1.2]);
  for (const s of [1, -1]) {
    box([0.25, 0.9, 1.4], GUN, [s * 0.62, 3.3, -1.2]);
    cyl(0.25, 0.4, STEEL, [s * 0.8, 3.25, -1.2], [1, 0, 0], 8);
    // elevation ram
    b.rod(V(s * 0.6, 2.3, -2.3), at(0.2, s * 0.5, -0.45), 0.09, "#c8ccd2");
  }
  // rails
  for (const s of [1, -1]) {
    beam([0.3, 0.38, 10], GUN, at(3.5, s * 0.3), D);
    beam([0.12, 0.12, 10], GUNLIGHT, at(3.5, s * 0.3, 0.22), D);
  }
  glow(beam([0.18, 0.05, 9.4], CYAN, at(3.5), D), 1.6);
  // breech block and muzzle block
  beam([0.95, 0.85, 1.3], DARK, at(-1.1), D);
  beam([0.95, 0.7, 0.5], DARK, at(8.7), D);
  glow(beam([0.4, 0.06, 0.04], CYAN, at(8.97, 0, 0.0), D), 1.5);
  // accelerator coils
  for (let i = 0; i < 9; i++) {
    const d = 0.3 + i * 0.95;
    b.part(new THREE.TorusGeometry(0.62, 0.1, 5, 10), GUN, { at: at(d), dir: [D.x, D.y, D.z], axis: "z" });
    glow(
      b.part(new THREE.TorusGeometry(0.62, 0.035, 4, 10), CYAN, { at: at(d + 0.12), dir: [D.x, D.y, D.z], axis: "z" }),
      1.8,
    );
    for (const s of [1, -1]) box([0.14, 0.14, 0.14], STEEL, at(d, s * 0.66, 0.0));
  }
  // top cable run and sensor
  beam([0.14, 0.14, 8], DARK, at(3.8, 0, 0.78), D);
  // ---------- capacitor bank ----------
  box([2.2, 0.95, 1.7], GUN, [0, 2.38, -3.7]);
  box([2.3, 0.1, 1.8], DARK, [0, 2.9, -3.7]);
  for (const s of [1, -1]) decal(1.5, 0.75, CELLS, [s * 1.11, 2.4, -3.7], [s, 0, 0]);
  glow(decal(1.7, 0.75, CELLS, [0, 2.4, -4.56], [0, 0, -1]), 1.3);
  for (const s of [1, -1]) {
    glow(decal(1.5, 0.75, CELLS, [s * 1.115, 2.4, -3.7], [s, 0, 0]), 1.3);
    cyl(0.07, 1.9, DARK, [s * 0.5, 2.8, -2.4], [0, 0.3, 1], 6); // feeder to breech
  }
  // roof hatch + ammo crates
  box([0.7, 0.08, 0.7], DARK, [0.5, 1.94, 0.9]);
  cyl(0.28, 0.08, STEEL, [0.5, 1.99, 0.9], [0, 1, 0], 8);
  box([0.7, 0.4, 0.5], "#3d4a2c", [-0.6, 2.1, 0.8]);
  box([0.7, 0.4, 0.5], "#3d4a2c", [-0.6, 2.1, 0.2]);

  return b.root;
}
```