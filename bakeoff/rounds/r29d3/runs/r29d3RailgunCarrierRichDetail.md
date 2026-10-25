```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four hydraulic stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = panelled(metal("iron", { tarnish: 0.1, seed: 4 }), { size: 0.9, rivets: 0.25 });
const HULL = panelled("#5a6b48", { size: 0.8, aspect: 0.8, rivets: 0.2 });
const HULL_D = panelled("#46543a", { size: 0.7, rivets: 0.2 });
const DARK = "#24282c";
const STEEL = metal("steel", { tarnish: 0.3 });
const TIRE = "#17181a";
const HAZ = "#f2c230";
const CYAN = "#6eeaff";
const RED = "#d0342c";

const TEX_HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c230"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#1b1b1b"/>`)
    .join("")}</svg>`,
  { size: 128 },
);
const TEX_NUM = svg(
  `<svg viewBox="0 0 96 40"><text x="48" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e8e8d8" stroke="#111" stroke-width="1.5">RG-06</text></svg>`,
  { size: 256 },
);
const TEX_EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1b1f24" stroke="#e8e8d8" stroke-width="3"/><path d="M32 8 L38 26 L56 26 L42 37 L47 55 L32 44 L17 55 L22 37 L8 26 L26 26Z" fill="#d0342c"/><rect x="29" y="12" width="6" height="40" fill="#6eeaff"/></svg>`,
  { size: 128 },
);
const TEX_GLASS = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0e2a3a"/><path d="M0 24 L18 0 L26 0 L8 24Z M30 24 L48 0 L52 0 L34 24Z" fill="#3aa6c8" opacity="0.7"/><rect width="64" height="24" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  { size: 128 },
);
const TEX_GRILLE = svg(
  `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#16191c"/>${[3, 8, 13, 18, 23, 28]
    .map((y) => `<rect x="2" y="${y}" width="28" height="2.5" fill="#4a5058"/>`)
    .join("")}</svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (r: number, h: number, color: any, at: number[], dir: number[], seg = 10, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at: at as any, dir: dir as any, flat: true });
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at: at as any, dir: dir as any, axis: "z", texture: tex });

  // ---------- Chassis ----------
  box(2.5, 0.8, 8.4, HULL_D, 0, 1.15, -0.2); // lower hull
  box(2.7, 0.45, 7.2, HULL, 0, 1.78, -0.6); // upper deck
  box(2.0, 0.12, 8.6, DARK, 0, 0.7, -0.2); // skid plate
  // sloped glacis front
  b.part(new THREE.BoxGeometry(2.6, 0.9, 0.35), HULL, { at: [0, 1.5, 4.15], rotation: [-28, 0, 0] });
  box(2.2, 0.18, 0.25, DARK, 0, 0.95, 4.45); // bumper bar
  for (const s of [1, -1]) {
    box(0.5, 0.2, 0.2, HAZ, s * 0.9, 0.95, 4.5); // bumper stripes
    // side skirts and armour plates
    box(0.14, 0.5, 7.4, HULL, s * 1.35, 1.0, -0.4);
    for (const z of [3.3, 1.2, -0.9, -2.9]) {
      box(0.1, 0.38, 1.4, HULL_D, s * 1.43, 1.35, z);
      for (const dz of [-0.55, 0.55]) cyl(0.04, 0.05, STEEL, [s * 1.5, 1.35, z + dz], [s, 0, 0], 6);
    }
    decal(TEX_EMBLEM, 0.8, 0.8, [s * 1.44, 1.6, 2.5], [s, 0, 0]);
    decal(TEX_NUM, 1.5, 0.62, [s * 1.45, 1.4, -1.6], [s, 0, 0]);
    // fuel/stowage boxes on deck sides
    box(0.5, 0.35, 1.2, DARK, s * 1.1, 2.17, -3.2);
    box(0.52, 0.06, 1.22, HAZ, s * 1.1, 2.37, -3.2);
  }
  // rear
  box(2.4, 0.9, 0.3, HULL_D, 0, 1.35, -4.5);
  decal(TEX_GRILLE, 1.2, 0.5, [0, 1.45, -4.67], [0, 0, -1]);
  box(0.4, 0.15, 0.1, RED, -0.9, 0.95, -4.7);
  glow(box(0.4, 0.15, 0.1, RED, 0.9, 0.95, -4.7), 1.2);
  // tow hooks
  for (const s of [1, -1]) cyl(0.07, 0.4, STEEL, [s * 0.8, 0.85, -4.6], [0, 0, 1], 6);

  // ---------- Cab ----------
  box(2.3, 0.95, 1.9, HULL, 0, 2.5, 3.05);
  b.part(new THREE.BoxGeometry(2.1, 0.12, 1.2), HULL_D, { at: [0, 3.02, 3.5], rotation: [-12, 0, 0] });
  decal(TEX_GLASS, 1.9, 0.62, [0, 2.65, 4.02], [0, -0.3, 1].map((v) => v) as number[]);
  for (const s of [1, -1]) {
    decal(TEX_GLASS, 1.0, 0.5, [s * 1.17, 2.62, 3.0], [s, 0, 0]);
    glow(cyl(0.16, 0.12, "#fff2b0", [s * 0.85, 1.55, 4.25], [0.0, 0.3, 1], 8), 1.6); // headlight
    cyl(0.2, 0.06, DARK, [s * 0.85, 1.55, 4.2], [0, 0.3, 1], 8);
    box(0.5, 0.14, 0.3, DARK, s * 1.0, 3.0, 4.0); // roof lamp housing
    glow(box(0.4, 0.07, 0.05, "#ffe9a0", s * 1.0, 3.0, 4.17), 1.4);
  }
  // sensor mast
  cyl(0.05, 1.0, STEEL, [-0.8, 3.5, 2.4], [0, 1, 0], 6);
  cyl(0.28, 0.06, DARK, [-0.8, 4.0, 2.4], [0, 1, 0.3], 10);
  box(0.06, 0.5, 0.06, STEEL, 0.9, 3.35, 2.4);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0.9, 3.65, 2.4] }), 1.5);

  // ---------- Wheels (three axles) ----------
  const axles = [2.9, 0.5, -1.9];
  const WR = 0.6;
  for (const z of axles) {
    cyl(0.12, 3.4, DARK, [0, WR, z], [1, 0, 0], 8); // axle
    for (const s of [1, -1]) {
      const x = s * 1.6;
      cyl(WR, 0.55, TIRE, [x, WR, z], [1, 0, 0], 12);
      cyl(WR * 0.97, 0.12, "#25272a", [x + s * 0.2, WR, z], [1, 0, 0], 12); // sidewall ring
      cyl(0.38, 0.1, STEEL, [x + s * 0.28, WR, z], [1, 0, 0], 12); // rim
      cyl(0.16, 0.16, DARK, [x + s * 0.32, WR, z], [1, 0, 0], 8); // hub
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.035, 0.06, "#d8d8d0", [x + s * 0.36, WR + Math.cos(a) * 0.26, z + Math.sin(a) * 0.26], [1, 0, 0], 5);
      }
      for (let i = 0; i < 12; i++) {
        // tread blocks
        const a = (i / 12) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.58, 0.07, 0.14), "#0d0d0f", {
          at: [x, WR + Math.cos(a) * WR, z + Math.sin(a) * WR],
          rotation: [(-a * 180) / Math.PI, 0, 0],
        });
      }
      // mudguard
      b.part(new THREE.BoxGeometry(0.75, 0.08, 1.5), HULL, { at: [x, WR * 2 + 0.12, z] });
      box(0.75, 0.3, 0.08, HULL, x, WR * 2 + 0.0, z + 0.7);
    }
  }

  // ---------- Stabiliser legs ----------
  for (const z of [1.9, -3.2]) {
    for (const s of [1, -1]) {
      const root = [s * 1.35, 1.7, z];
      const knee = [s * 2.5, 1.55, z];
      const foot = [s * 2.5, 0.2, z];
      cyl(0.2, 0.4, DARK, [s * 1.4, 1.65, z], [0, 0, 1], 8); // pivot
      b.rod(root, knee, 0.13, HULL_D);
      b.sphere ? 0 : 0;
      b.part(new THREE.SphereGeometry(0.2, 8, 6), STEEL, { at: knee as any });
      b.rod([s * 2.5, 1.5, z], [s * 2.5, 0.8, z], 0.2, HULL); // outer sleeve
      b.rod([s * 2.5, 0.85, z], [s * 2.5, 0.25, z], 0.1, metal("steel", { polish: 0.8 })); // piston
      decal(TEX_HAZARD, 0.5, 0.12, [s * 2.5 + 0.0, 1.2, z + 0.21], [0, 0, 1]);
      b.rod([s * 2.0, 0.9, z], [s * 2.45, 1.35, z], 0.05, STEEL); // brace strut
      // foot pad
      cyl(0.55, 0.16, DARK, [s * 2.5, 0.08, z], [0, 1, 0], 8);
      cyl(0.4, 0.06, HAZ, [s * 2.5, 0.17, z], [0, 1, 0], 8);
      cyl(0.18, 0.1, STEEL, [s * 2.5, 0.2, z], [0, 1, 0], 6);
      glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), CYAN, { at: [s * 2.5 + 0.0, 1.45, z + 0.22] }), 1.5);
    }
  }

  // ---------- Railgun turret ----------
  const TZ = -1.4;
  const TY = 2.0;
  cyl(1.3, 0.18, DARK, [0, TY + 0.1, TZ], [0, 1, 0], 12); // race ring
  cyl(1.15, 0.45, HULL_D, [0, TY + 0.45, TZ], [0, 1, 0], 12);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.05, 0.08, STEEL, [Math.sin(a) * 1.0, TY + 0.7, TZ + Math.cos(a) * 1.0], [0, 1, 0], 5);
  }
  // cradle housing
  box(1.7, 1.0, 3.2, HULL, 0, TY + 1.2, TZ);
  b.part(new THREE.BoxGeometry(1.7, 0.1, 1.2), HULL_D, { at: [0, TY + 1.73, TZ + 0.9], rotation: [10, 0, 0] });
  box(1.2, 0.1, 1.5, DARK, 0, TY + 1.74, TZ - 0.8); // hatch
  cyl(0.3, 0.06, STEEL, [0, TY + 1.8, TZ - 0.8], [0, 1, 0], 8);
  for (const s of [1, -1]) {
    box(0.1, 0.7, 2.4, HULL_D, s * 0.9, TY + 1.2, TZ);
    decal(TEX_HAZARD, 1.8, 0.2, [s * 0.96, TY + 0.95, TZ], [s, 0, 0]);
    // trunnion
    cyl(0.25, 0.3, STEEL, [s * 1.0, TY + 0.6, TZ + 0.2], [s, 0, 0], 8);
  }
  // cooling vents on rear
  decal(TEX_GRILLE, 1.2, 0.6, [0, TY + 1.2, TZ - 1.62], [0, 0, -1]);

  // rails
  const RY = TY + 1.35;
  const R0 = TZ + 1.6;
  const R1 = 8.0;
  const RL = R1 - R0;
  const RC = (R0 + R1) / 2;
  box(1.1, 0.4, RL, DARK, 0, RY - 0.4, RC); // base block under rails
  for (const s of [1, -1]) {
    box(0.26, 0.38, RL, STEEL, s * 0.32, RY, RC);
    glow(box(0.04, 0.2, RL - 0.4, CYAN, s * 0.17, RY, RC), 1.4); // glowing inner face
    box(0.3, 0.06, RL, DARK, s * 0.32, RY + 0.22, RC);
  }
  // coil cages
  for (let i = 0; i < 6; i++) {
    const z = R0 + 0.7 + i * 1.0;
    const w = 1.1;
    box(w + 0.2, 0.12, 0.3, HULL_D, 0, RY + 0.42, z);
    box(w + 0.2, 0.12, 0.3, HULL_D, 0, RY - 0.65, z);
    for (const s of [1, -1]) {
      box(0.12, 1.1, 0.3, HULL_D, s * (w / 2 + 0.04), RY - 0.1, z);
      glow(box(0.05, 0.5, 0.34, CYAN, s * (w / 2 + 0.13), RY - 0.1, z), 1.3);
    }
  }
  // muzzle brake
  box(1.0, 0.7, 0.5, DARK, 0, RY - 0.1, R1 + 0.1);
  box(0.9, 0.08, 0.55, HAZ, 0, RY + 0.3, R1 + 0.1);
  glow(box(0.2, 0.3, 0.05, CYAN, 0, RY, R1 + 0.38), 2);
  // power conduits from housing to rails
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.7, TY + 1.0, TZ + 1.5],
        [s * 0.9, TY + 0.8, TZ + 2.3],
        [s * 0.7, TY + 1.0, TZ + 3.1],
      ],
      0.06,
      { color: DARK },
    );
  }

  // ---------- Capacitor banks & power ----------
  for (const s of [1, -1]) {
    for (const z of [-3.6, -2.9]) {
      cyl(0.28, 1.0, OLIVE, [s * 0.9, 2.65, z + 0.0], [0, 1, 0], 8);
      cyl(0.3, 0.1, HAZ, [s * 0.9, 2.45, z], [0, 1, 0], 8);
      glow(cyl(0.29, 0.1, CYAN, [s * 0.9, 2.78, z], [0, 1, 0], 8), 1.2);
      cyl(0.1, 0.1, STEEL, [s * 0.9, 3.2, z], [0, 1, 0], 6);
    }
    // cable to turret
    b.sweep(
      [
        [s * 0.9, 3.1, -3.3],
        [s * 0.9, 3.5, -2.6],
        [s * 0.7, 3.1, -2.0],
      ],
      0.045,
      { color: "#1a1a1a" },
    );
  }
  // exhaust stacks at rear deck
  for (const s of [1, -1]) {
    cyl(0.12, 0.8, DARK, [s * 1.2, 2.6, -4.2], [0, 1, 0], 6);
    cyl(0.16, 0.08, STEEL, [s * 1.2, 3.02, -4.2], [0, 1, 0], 6);
  }
  // antenna whip
  b.rod([-1.2, 2.0, -4.0], [-1.2, 4.2, -4.1], [0.03, 0.01], { color: STEEL });
  glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), RED, { at: [-1.2, 4.25, -4.1] }), 1.5);

  return b.root;
}
```