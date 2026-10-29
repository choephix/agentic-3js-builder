import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Bloc Sauvage",
  "description": "A raw-concrete brutalist housing block: a deep pilotis plinth, a repetitive slab tower of recessed window boxes and cantilevered balcony bands, a taller stair core of vertical fins at the back, and a cluttered mechanical roofscape."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  concreteLight: "#a6a69b",
  concrete: "#8d8d83",
  concreteShade: "#6b6b62",
  concreteDeep: "#4c4c45",
  glass: "#3d4d5c",
  glassDark: "#242e38",
  amberLit: "#d9a13b",
  doorRust: "#93402a",
  railingSteel: "#3a3f42",
  roofMetal: "#5a5f63",
  ventRust: "#7a4426",
  signCream: "#e5e0d3",
};
const M = {
  plinthTop: [0, 1.6, 0] as [number, number, number],
  coreSeam: [-1.9, 6, -2.6] as [number, number, number],
  towerRoof: [0, 12, 0.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // plinth
  (() => {
function buildPlinth({ b, J, P, M }: Ctx) {
  const MUSTARD = "#c9a227";
  const CONC2 = "#85857b";
  const CONC3 = "#96968b";
  const LAMP = "#f0d9a0";
  const BZ = -4.15; // back face of the main slab

  const bx = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  // chamfered mass: a chamfered rectangle in XY pushed through Z
  const cb = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string, ch = 0.04) => {
    const w = x1 - x0;
    const h = y1 - y0;
    const c = Math.min(ch, w / 2 - 0.001, h / 2 - 0.001);
    return b.extrude(
      [
        [c, 0], [w - c, 0], [w, c], [w, h - c], [w - c, h], [c, h], [0, h - c], [0, c],
      ],
      { at: [x0, y0, (z0 + z1) / 2], x: [1, 0, 0], thickness: z1 - z0, color },
    );
  };
  const cyl = (x: number, y: number, z: number, r: number, h: number, color: string, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: [x, y, z] });

  // ---------- ground slab and podium ----------
  cb(-3, 0, BZ, 2.1, 1.2, 3.0, P.concrete, 0.06);
  cb(2.1, 0, BZ, 3, 1.2, -1.5, P.concreteShade, 0.06);
  // apron in front of the colonnade
  bx(-3, 0, 3.0, 3, 0.12, 3.9, P.concreteShade);
  // podium deck under the tower
  cb(-2.8, 1.2, -2.6, 2.8, 1.6, 3.2, CONC3, 0.04);
  // back strip under the core
  cb(-3, 1.2, BZ, -0.8, 1.6, -2.6, P.concreteLight, 0.04);
  // landing at the top of the ramp
  cb(2.1, 1.2, -2.6, 2.8, 1.6, -1.5, CONC3, 0.03);

  // drip grooves along the slab top edge
  bx(-3, 1.1, BZ - 0.012, 3, 1.15, BZ, P.concreteDeep);
  bx(-3.012, 1.1, BZ, -3, 1.15, 3.0, P.concreteDeep);
  bx(3, 1.1, BZ, 3.012, 1.15, -1.5, P.concreteDeep);

  // board-form joint lines
  for (const y of [0.3, 0.55, 0.8, 1.0]) {
    bx(-3, y, BZ - 0.012, 3, y + 0.025, BZ, P.concreteShade);
    bx(-3.012, y, BZ, -3, y + 0.025, 3.0, P.concreteShade);
    bx(3, y, BZ, 3.012, y + 0.025, -1.5, P.concreteShade);
  }
  for (const y of [0.35, 0.65, 0.95]) {
    bx(-3, y, 3.0, -0.65, y + 0.025, 3.012, P.concreteShade);
    bx(0.65, y, 3.0, 2.1, y + 0.025, 3.012, P.concreteShade);
  }
  // vertical form-tie seams on the back
  for (let i = -2; i <= 2; i++) bx(i * 1.1 - 0.012, 0.05, BZ - 0.01, i * 1.1 + 0.012, 1.1, BZ, P.concreteShade);
  // tonal panels on back wall
  bx(-2.2, 0.12, BZ - 0.008, -1.1, 1.05, BZ, CONC2);
  bx(0.0, 0.12, BZ - 0.008, 1.1, 1.05, BZ, P.concreteLight);
  bx(2.2, 0.12, BZ - 0.008, 3, 1.05, BZ, CONC2);

  // ---------- colonnade ----------
  const colX = [-2.7, -1.7, -0.9, 0.9, 1.7, 2.7];
  const CZ = 3.55;
  for (const x of colX) {
    cb(x - 0.375, 0.12, CZ - 0.375, x + 0.375, 0.28, CZ + 0.375, P.concreteShade, 0.04);
    cb(x - 0.275, 0.28, CZ - 0.275, x + 0.275, 1.2, CZ + 0.275, P.concreteLight, 0.04);
    bx(x - 0.02, 0.3, CZ + 0.275, x + 0.02, 1.15, CZ + 0.29, P.concreteShade);
    bx(x - 0.31, 1.12, CZ - 0.31, x + 0.31, 1.2, CZ + 0.31, CONC3);
  }
  // deep cast lintel band
  cb(-3, 1.2, 3.2, 3, 1.6, 3.8, P.concrete, 0.05);
  bx(-3, 1.2, 3.2, 3, 1.23, 3.8, P.concreteDeep);
  for (const x of [-2.2, -1.2, 0, 1.2, 2.2]) bx(x - 0.012, 1.25, 3.8, x + 0.012, 1.58, 3.812, P.concreteShade);
  bx(-3, 1.55, 3.8, 3, 1.58, 3.815, P.concreteShade);

  // ---------- entrance ----------
  bx(-0.62, 0.12, 3.0, 0.62, 1.12, 3.03, P.concreteDeep);
  bx(-0.62, 0.12, 3.03, -0.57, 1.12, 3.07, P.concreteShade);
  bx(0.57, 0.12, 3.03, 0.62, 1.12, 3.07, P.concreteShade);
  bx(-0.62, 1.07, 3.03, 0.62, 1.12, 3.07, P.concreteShade);
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -0.55 : 0.02;
    const x1 = s < 0 ? -0.02 : 0.55;
    bx(x0, 0.12, 3.04, x1, 1.07, 3.1, P.doorRust);
    bx(x0 + 0.05, 0.2, 3.1, x1 - 0.05, 0.55, 3.115, P.ventRust);
    bx(x0 + 0.05, 0.65, 3.1, x1 - 0.05, 0.98, 3.115, P.ventRust);
    bx(x0 + 0.1, 0.72, 3.115, x1 - 0.1, 0.92, 3.125, P.glassDark);
    // mustard push bar
    const px = s < 0 ? x1 - 0.1 : x0 + 0.1;
    b.rod([x0 + 0.08, 0.57, 3.15], [x1 - 0.08, 0.57, 3.15], 0.016, MUSTARD);
    bx(x0 + 0.06, 0.55, 3.1, x0 + 0.08, 0.59, 3.15, MUSTARD);
    bx(x1 - 0.08, 0.55, 3.1, x1 - 0.06, 0.59, 3.15, MUSTARD);
    void px;
  }
  bx(-0.01, 0.12, 3.1, 0.01, 1.07, 3.12, P.railingSteel);
  // enamel plaque with B-7
  bx(-0.42, 1.29, 3.8, 0.42, 1.51, 3.83, P.signCream);
  const L = (x0: number, y0: number, x1: number, y1: number) =>
    bx(x0, y0, 3.83, x1, y1, 3.85, P.railingSteel);
  const yc = 1.4;
  L(-0.175, yc - 0.08, -0.15, yc + 0.08); // B stem
  L(-0.175, yc + 0.065, -0.095, yc + 0.08);
  L(-0.175, yc - 0.0075, -0.095, yc + 0.0075);
  L(-0.175, yc - 0.08, -0.095, yc - 0.065);
  L(-0.105, yc + 0.0075, -0.085, yc + 0.08);
  L(-0.105, yc - 0.08, -0.085, yc - 0.0075);
  L(-0.03, yc - 0.01, 0.03, yc + 0.01); // dash
  L(0.07, yc + 0.065, 0.16, yc + 0.08); // 7
  b.rod([0.145, yc + 0.07, 3.84], [0.1, yc - 0.08, 3.84], 0.011, P.railingSteel);
  // bulkhead lamp on the inner face of the right column
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), P.railingSteel, {
    at: [0.64, 0.95, CZ], rotation: [0, 0, 90],
  });
  glow(
    b.part(new THREE.SphereGeometry(0.075, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), LAMP, {
      at: [0.62, 0.95, CZ], rotation: [0, 0, 90],
    }),
    1.4,
  );
  // canopy
  cb(-1.5, 1.95, 2.85, 1.5, 2.2, 3.9, P.concrete, 0.05);
  bx(-1.5, 1.92, 2.85, 1.5, 1.95, 3.9, P.concreteDeep);
  for (const s of [-1, 1]) {
    bx(s * 1.3 - 0.06, 1.6, 3.0, s * 1.3 + 0.06, 1.95, 3.7, P.concreteShade);
    cyl(s * 1.3, 1.05, 3.86, 0.045, 1.85, P.railingSteel, 8);
    for (const y of [0.4, 1.0, 1.6]) cyl(s * 1.3, y, 3.86, 0.062, 0.04, P.railingSteel, 8);
  }
  bx(-1.5, 2.2, 2.85, 1.5, 2.23, 3.9, P.concreteShade).position.y += 0;

  // ---------- ramp ----------
  b.extrude([[0, 0], [4.5, 0], [4.5, 1.6]], {
    at: [2.55, 0, 3.0], x: [0, 0, -1], thickness: 0.9, color: P.concrete,
  });
  const th = (Math.atan2(1.6, 4.5) * 180) / Math.PI;
  for (let i = 1; i <= 8; i++) {
    const xp = i * 0.52;
    b.part(new THREE.BoxGeometry(0.86, 0.015, 0.05), P.concreteShade, {
      at: [2.55, (1.6 * xp) / 4.5 + 0.004, 3.0 - xp], rotation: [th, 0, 0],
    });
  }
  b.extrude([[0, 0], [4.5, 1.6], [4.5, 1.75], [0, 0.15]], {
    at: [2.96, 0, 3.0], x: [0, 0, -1], thickness: 0.08, color: P.concreteLight,
  });
  bx(2.92, 1.2, -2.6, 3.0, 1.75, -1.5, P.concreteLight);
  const slopeY = (xp: number) => (1.6 * xp) / 4.5 + 0.15;
  for (const xp of [0.2, 1.1, 2.0, 2.9, 3.8, 4.5]) {
    b.rod([2.96, slopeY(xp) , 3.0 - xp], [2.96, slopeY(xp) + 0.45, 3.0 - xp], 0.02, P.railingSteel);
  }
  for (const z of [-2.0, -2.55]) b.rod([2.96, 1.75, z], [2.96, 2.2, z], 0.02, P.railingSteel);
  const rail = (h: number) => {
    b.rod([2.96, slopeY(0.2) + h, 2.8], [2.96, slopeY(4.5) + h, -1.5], 0.017, P.railingSteel);
    b.rod([2.96, slopeY(4.5) + h, -1.5], [2.96, slopeY(4.5) + h, -2.55], 0.017, P.railingSteel);
  };
  rail(0.45);
  rail(0.22);

  // ---------- service door, back right (-X) ----------
  bx(-2.4, 0.0, BZ - 0.05, -1.4, 1.05, BZ, MUSTARD);
  bx(-2.3, 0.0, BZ - 0.05, -1.5, 0.98, BZ - 0.01, P.concreteDeep);
  bx(-2.3, 0.0, BZ - 0.04, -1.5, 0.98, BZ - 0.02, P.doorRust);
  bx(-2.22, 0.12, BZ - 0.048, -1.58, 0.45, BZ - 0.04, P.ventRust);
  bx(-2.22, 0.55, BZ - 0.048, -1.58, 0.9, BZ - 0.04, P.ventRust);
  bx(-1.65, 0.45, BZ - 0.07, -1.6, 0.52, BZ - 0.04, MUSTARD);
  bx(-2.5, 0.0, BZ - 0.12, -1.3, 0.04, BZ - 0.02, P.concreteShade);

  // ---------- grilles ----------
  const grille = (x: number, y: number, z: number, axis: "z" | "x", s: number) => {
    const w = 0.34;
    if (axis === "z") {
      bx(x - w / 2, y - w / 2, z, x + w / 2, y + w / 2, z + s * 0.03, P.concreteDeep);
      for (let i = -2; i <= 2; i++) bx(x - w / 2 + 0.02, y + i * 0.06 - 0.01, z, x + w / 2 - 0.02, y + i * 0.06 + 0.01, z + s * 0.05, P.railingSteel);
      bx(x - w / 2 - 0.02, y + w / 2, z, x + w / 2 + 0.02, y + w / 2 + 0.02, z + s * 0.04, P.railingSteel);
      bx(x - w / 2 - 0.02, y - w / 2 - 0.02, z, x + w / 2 + 0.02, y - w / 2, z + s * 0.04, P.railingSteel);
    } else {
      bx(x, y - w / 2, z - w / 2, x + s * 0.03, y + w / 2, z + w / 2, P.concreteDeep);
      for (let i = -2; i <= 2; i++) bx(x, y + i * 0.06 - 0.01, z - w / 2 + 0.02, x + s * 0.05, y + i * 0.06 + 0.01, z + w / 2 - 0.02, P.railingSteel);
    }
  };
  grille(0.8, 0.4, BZ, "z", -1);
  grille(2.0, 0.4, BZ, "z", -1);
  grille(-3, 0.4, 0.5, "x", -1);
  grille(-3, 0.4, -1.6, "x", -1);
  grille(3, 0.4, -3.2, "x", 1);
  grille(-2.1, 0.32, 3.0, "z", 1);

  // ---------- bollards ----------
  for (const x of [-2.2, 0.0, 2.2]) {
    cyl(x, 0.39, 3.78, 0.12, 0.54, P.concrete, 8);
    cyl(x, 0.68, 3.78, 0.13, 0.05, P.concreteLight, 8);
    cyl(x, 0.5, 3.78, 0.125, 0.06, P.signCream, 8);
  }

  // tower seat joint line on podium
  bx(-2.8, 1.58, 3.2, 2.8, 1.6, 3.22, P.concreteDeep);
}
    return buildPlinth;
  })(),
  // towerBody
  (() => {
function buildTowerBody({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const MUSTARD = "#c9962e";
  const X0 = -2.8, X1 = 2.8, Z0 = -2.6, Z1 = 3.4, Y0 = 1.6, SH = 1.3;

  // main mass
  box(5.6, 10.4, 6.0, 0, 6.8, 0.4, P.concrete);
  // slightly inset corner chamfer strips
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(0.12, 10.4, 0.12, sx * 2.76, 6.8, sz === 1 ? 3.36 : -2.56, P.concreteShade);

  // floor lintel bands on front, back
  for (let s = 0; s < 8; s++) {
    const y0 = Y0 + s * SH;
    const bandC = s % 2 ? P.concreteLight : P.concreteLight;
    box(5.64, 0.16, 0.1, 0, y0 + SH - 0.08, Z1 + 0.04, bandC);
    box(5.64, 0.16, 0.1, 0, y0 + SH - 0.08, Z0 - 0.04, bandC);
    // board-form slab joint
    box(5.62, 0.03, 6.02, 0, y0 + 0.02, 0.4, P.concreteShade);
  }

  // window helper on an arbitrary facade; face: 'f','b' (z) or 'r' (x)
  const win = (face: string, u: number, y: number, w: number, h: number, glassC: string) => {
    const d = 0.25;
    if (face === "f" || face === "b") {
      const zf = face === "f" ? Z1 : Z0;
      const n = face === "f" ? 1 : -1;
      box(w, h, 0.04, u, y, zf - n * d, glassC);
      box(0.1, h + 0.1, 0.22, u - w / 2 - 0.05, y, zf - n * 0.11, P.concreteShade);
      box(0.1, h + 0.1, 0.22, u + w / 2 + 0.05, y, zf - n * 0.11, P.concreteShade);
      box(w + 0.2, 0.1, 0.22, u, y + h / 2 + 0.05, zf - n * 0.11, P.concreteShade);
      box(w + 0.3, 0.07, 0.3, u, y - h / 2 - 0.04, zf - n * 0.06, P.concreteShade);
      box(w + 0.1, 0.03, 0.03, u, y, zf - n * (d - 0.03), P.railingSteel);
    } else {
      box(0.04, h, w, X1 - d, y, u, glassC);
      box(0.22, h + 0.1, 0.1, X1 - 0.11, y, u - w / 2 - 0.05, P.concreteShade);
      box(0.22, h + 0.1, 0.1, X1 - 0.11, y, u + w / 2 + 0.05, P.concreteShade);
      box(0.22, 0.1, w + 0.2, X1 - 0.11, y + h / 2 + 0.05, u, P.concreteShade);
      box(0.3, 0.07, w + 0.3, X1 - 0.06, y - h / 2 - 0.04, u, P.concreteShade);
    }
  };

  const amber = new Set(["0,3", "1,2", "2,4", "4,1"]);
  for (let s = 0; s < 8; s++) {
    const y = Y0 + s * SH + 0.62;
    // front: central bay paired windows + flanking
    for (const x of [-1.5, -0.75, 0, 0.75, 1.5, 2.15]) {
      if (x === 2.15 && s % 2) continue;
      const g = R() < 0.25 ? P.glassDark : P.glass;
      win("f", x - (x === 2.15 ? 0 : 0), y, x === 2.15 ? 0.3 : 0.5, 0.7, g);
    }
    // back
    for (const x of [-2, -1, 0, 1, 2]) win("b", x, y, 0.55, 0.7, R() < 0.3 ? P.glassDark : P.glass);
    // right facade: one column of small windows
    for (const z of [-0.3, 2.2]) win("r", z, y, 0.4, 0.4, P.glass);
    // stair slot (left)
    box(0.5, SH - 0.08, 0.1, -2.3, y, Z1 - 0.03, P.concreteDeep);
    const lit = s === 0 || s === 2 || s === 5;
    box(0.14, 0.55, 0.05, -2.3, y, Z1 - 0.1, lit ? P.amberLit : P.glassDark);
    if (lit) b.part(new THREE.BoxGeometry(0.2, 0.62, 0.02), P.amberLit, { at: [-2.3, y, Z1 - 0.13] });
  }
  // stair slot frame
  box(0.06, 10.4, 0.14, -2.58, 6.8, Z1 + 0.02, P.concreteShade);
  box(0.06, 10.4, 0.14, -2.02, 6.8, Z1 + 0.02, P.concreteShade);
  // mustard plaque + floor number
  box(0.3, 0.2, 0.03, -2.3, Y0 + 1.15, Z1 + 0.03, P.signCream);
  box(0.04, 0.12, 0.03, -2.35, Y0 + 1.15, Z1 + 0.05, P.railingSteel);
  box(0.1, 0.03, 0.03, -2.27, Y0 + 1.15, Z1 + 0.05, P.railingSteel);

  // blind piers on front
  for (const x of [-1.9, 1.95]) for (let s = 0; s < 8; s++)
    box(0.3, SH - 0.2, 0.06, x, Y0 + s * SH + 0.62, Z1 + 0.03, P.concreteShade);

  // balconies at storeys 3 and 6 (index 2 and 5)
  [2, 5].forEach((s, i) => {
    const y0 = Y0 + s * SH;
    box(4.8, 0.35, 0.6, 0, y0 + 0.175, Z1 + 0.3, P.concreteLight);
    box(4.8, 0.06, 0.06, 0, y0 + 0.35 + 1.0, Z1 + 0.57, P.railingSteel);
    for (let k = 0; k <= 24; k++) box(0.03, 0.95, 0.03, -2.3 + k * 0.1917, y0 + 0.83, Z1 + 0.57, P.railingSteel);
    for (const sx of [-1, 1]) box(0.06, 1.0, 0.6, sx * 2.37, y0 + 0.85, Z1 + 0.3, P.railingSteel);
    if (i === 0) box(1.6, 0.9, 0.06, 1.3, y0 + 0.8, Z1 + 0.54, P.doorRust);
    // mustard door frames
    for (const x of [-1.5, 0.75]) {
      box(0.5, 0.06, 0.06, x, y0 + 1.1, Z1 + 0.02, MUSTARD);
      box(0.06, 0.7, 0.06, x - 0.25, y0 + 0.82, Z1 + 0.02, MUSTARD);
      box(0.06, 0.7, 0.06, x + 0.25, y0 + 0.82, Z1 + 0.02, MUSTARD);
    }
  });

  // right facade ribbed precast panels
  for (let s = 0; s < 8; s++)
    for (let k = 0; k < 8; k++) {
      const z = -2.3 + k * 0.4 + 0.2;
      if (k === 4 || k === 5 || k === 6) { if (k===5) continue; }
      if (Math.abs(z + 0.3) < 0.35 || Math.abs(z - 2.2) < 0.35) continue;
      b.extrude([[0, 0], [0.32, 0], [0.32, SH - 0.2], [0, SH - 0.2]], {
        at: [X1, Y0 + s * SH + 0.05, z - 0.16], x: [0, 0, 1], thickness: 0.08,
        color: k % 2 ? P.concreteShade : P.concreteLight,
      });
    }

  // drainage pipes down a front pier
  for (const x of [1.9, 2.05]) b.rod([x, Y0 + 0.2, Z1 + 0.09], [x, 11.9, Z1 + 0.09], 0.035, P.railingSteel);
  for (let s = 0; s < 8; s++) box(0.2, 0.05, 0.06, 1.975, Y0 + s * SH + 0.1, Z1 + 0.09, P.railingSteel);

  // top parapet cap lip
  box(5.7, 0.1, 6.1, 0, 12.0 - 0.05, 0.4, P.concreteShade);
  // base shadow gap
  box(5.5, 0.08, 5.9, 0, Y0 + 0.04, 0.4, P.concreteDeep);
}
    return buildTowerBody;
  })(),
  // serviceCore
  (() => {
function buildServiceCore({ b, J, P, M }: Ctx) {
  const X0 = -2.9, X1 = -0.9, Z0 = -4.2, Z1 = -2.6;
  const CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;
  const Y0 = 1.6, Y1 = 13.0;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // Main core mass (slightly inset so fins sit proud)
  box(X1 - X0 - 0.1, Y1 - Y0, Z1 - Z0 - 0.1, P.concreteShade, CX, (Y0 + Y1) / 2, CZ);
  // Base plinth course
  box(X1 - X0, 0.3, Z1 - Z0, P.concreteDeep, CX, Y0 + 0.15, CZ);

  // Front fins (facing +Z), 10 fins across the width
  const nF = 10;
  const pitch = (X1 - X0 - 0.2) / nF;
  const fx: number[] = [];
  for (let i = 0; i < nF; i++) {
    const x = X0 + 0.1 + pitch * (i + 0.5);
    fx.push(x);
    box(pitch * 0.62, Y1 - Y0 - 0.3, 0.17, i % 2 ? P.concrete : P.concreteLight, x, (Y0 + Y1) / 2 - 0.0, Z1 + 0.04);
  }
  // Dark slots behind fins
  for (let i = 0; i < nF; i++) {
    box(pitch * 0.3, Y1 - Y0 - 0.6, 0.04, P.concreteDeep, fx[i] + pitch * 0.5, (Y0 + Y1) / 2, Z1 - 0.02);
  }
  // Slit windows in slots: every other storey (1.3 m)
  let k = 0;
  for (let y = Y0 + 1.0; y < Y1 - 0.8; y += 2.6) {
    const lit = k === 1 || k === 3;
    for (const i of [2, 7]) {
      box(0.07, 0.8, 0.05, lit ? P.amberLit : P.glassDark, fx[i] + pitch * 0.5, y, Z1 + 0.02);
    }
    k++;
  }

  // Side fins on both flanks
  for (const s of [1, -1]) {
    const x = s > 0 ? X1 : X0;
    for (let i = 0; i < 6; i++) {
      const z = Z0 + 0.2 + i * ((Z1 - Z0 - 0.4) / 5);
      box(0.15, Y1 - Y0 - 0.3, 0.14, i % 2 ? P.concrete : P.concreteLight, x - s * 0.02, (Y0 + Y1) / 2, z);
    }
  }

  // Buttress pier at tower seam
  box(0.5, 10.4, 0.35, P.concreteLight, -1.9, 6.8, -2.45);
  box(0.62, 0.2, 0.45, P.concrete, -1.9, 1.9, -2.42);
  box(0.62, 0.2, 0.45, P.concrete, -1.9, 11.9, -2.42);

  // Back face (-Z): blind, two rows of tiny vents, service door
  const bz = Z0 - 0.02;
  for (const y of [7.5, 9.5]) {
    for (let i = 0; i < 6; i++) {
      const x = X0 + 0.3 + i * 0.28;
      box(0.12, 0.12, 0.05, P.railingSteel, x, y, bz);
      box(0.08, 0.02, 0.01, P.concreteDeep, x, y, bz - 0.03);
    }
  }
  // board-form joint lines
  for (let y = Y0 + 1.2; y < Y1 - 1; y += 1.3) box(1.9, 0.025, 0.02, P.concreteDeep, CX, y, bz - 0.005);
  // service door
  box(0.8, 1.3, 0.06, P.ventRust, CX + 0.25, Y0 + 0.75, bz);
  box(0.92, 0.1, 0.07, "#c9a227", CX + 0.25, Y0 + 1.45, bz);
  box(0.06, 1.3, 0.07, "#c9a227", CX + 0.25 - 0.43, Y0 + 0.75, bz);
  box(0.06, 1.3, 0.07, "#c9a227", CX + 0.25 + 0.43, Y0 + 0.75, bz);
  box(0.06, 0.06, 0.06, P.railingSteel, CX + 0.55, Y0 + 0.75, bz - 0.05);

  // Crown slab with chamfer feel
  box(X1 - X0 + 0.4, 0.4, Z1 - Z0 + 0.4, P.concrete, CX, 13.2, CZ);
  box(X1 - X0 + 0.5, 0.08, Z1 - Z0 + 0.5, P.concreteShade, CX, 12.96, CZ);
  // Parapet kerb
  const kt = 13.4 + 0.07;
  box(X1 - X0 + 0.4, 0.14, 0.1, P.concreteShade, CX, kt, Z1 + 0.15);
  box(X1 - X0 + 0.4, 0.14, 0.1, P.concreteShade, CX, kt, Z0 - 0.15);
  box(0.1, 0.14, Z1 - Z0 + 0.4, P.concreteShade, X0 - 0.15, kt, CZ);
  box(0.1, 0.14, Z1 - Z0 + 0.4, P.concreteShade, X1 + 0.15, kt, CZ);
  // Mechanical housing — keep top under 13.4: low box sits in the kerb
  box(0.8, 0.12, 0.6, P.concreteLight, CX - 0.2, 13.46, CZ);
  box(0.5, 0.1, 0.1, P.roofMetal, CX - 0.2, 13.5, CZ + 0.2);

  // Sign plate
  box(0.5, 0.18, 0.03, P.signCream, CX, 12.7, Z1 + 0.15);
  box(0.3, 0.03, 0.01, P.concreteDeep, CX, 12.72, Z1 + 0.17);
  box(0.2, 0.03, 0.01, P.concreteDeep, CX, 12.66, Z1 + 0.17);

  // Steel ladder on front face from tower roof (y 12) up to crown
  const lx = X1 - 0.35;
  for (const dx of [-0.17, 0.17]) {
    b.rod([lx + dx, 12.0, Z1 + 0.3], [lx + dx, 12.95, Z1 + 0.3], 0.018, P.railingSteel);
  }
  for (let y = 12.1; y < 12.95; y += 0.2) {
    b.rod([lx - 0.17, y, Z1 + 0.3], [lx + 0.17, y, Z1 + 0.3], 0.012, P.railingSteel);
  }
  for (const y of [12.15, 12.8]) {
    for (const dx of [-0.17, 0.17]) b.rod([lx + dx, y, Z1 + 0.3], [lx + dx, y, Z1 + 0.1], 0.012, P.railingSteel);
  }

  // Weathering streaks under crown
  for (let i = 0; i < 5; i++) {
    const x = X0 + 0.25 + R() * (X1 - X0 - 0.5);
    box(0.05, 0.5 + R() * 0.6, 0.02, P.concreteDeep, x, 12.6 - R() * 0.2, Z1 + 0.14);
  }
}
    return buildServiceCore;
  })(),
  // roofPlant
  (() => {
function buildRoofPlant({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const Y0 = 11.9;
  const DECK = 12.0;
  const MUSTARD = "#c9993a";

  // box helper: center-based, sizes full
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // ---- Parapet kerb around the roof edge (x -2.8..2.8, z -2.6..3.4)
  const kH = 0.35, kT = 0.18;
  const kY = DECK + kH / 2 - 0.05;
  box(5.8, kH, kT, P.concreteLight, 0, kY, 3.4 - kT / 2 + 0.05); // front
  box(5.8, kH, kT, P.concreteLight, 0, kY, -2.6 + kT / 2); // back
  box(kT, kH, 6.0, P.concreteLight, 2.8 - kT / 2 + 0.05, kY, 0.4); // right (+x)
  box(kT, kH, 6.0, P.concreteLight, -2.8 + kT / 2 - 0.05, kY, 0.4);
  // coping slabs
  box(5.9, 0.05, 0.26, P.concrete, 0, DECK + kH - 0.02, 3.4 - 0.08);
  box(0.26, 0.05, 6.1, P.concrete, 2.75, DECK + kH - 0.02, 0.4);
  box(0.26, 0.05, 6.1, P.concrete, -2.75, DECK + kH - 0.02, 0.4);

  // scuppers + rain stains
  const scup: [number, number, number, number][] = [
    [-1.6, 3.5, 0, 1], [1.5, 3.5, 0, 1], [2.9, 1.2, 1, 0], [-2.9, 0.4, -1, 0], [2.9, -1.4, 1, 0],
  ];
  scup.forEach(([x, z, dx, dz], i) => {
    const w = dz ? 0.22 : 0.3, d = dz ? 0.3 : 0.22;
    box(w, 0.14, d, P.ventRust, x, DECK + 0.12, z);
    box(w * 0.6, 0.08, d * 0.5, P.glassDark, x, DECK + 0.12, z + dz * 0.1 * 0 + (dz ? 0.1 : 0));
    if (i < 2) box(0.16, 0.0, 0.0, P.concreteShade, x, DECK, z); // placeholder zero-size avoided below
  });
  for (const x of [-1.6, 1.5]) box(0.18, 0.02, 0.01, P.concreteShade, x, DECK - 0.1, 3.5); // thin stains seated on the parapet face
  // stains on the front face of the tower beneath scuppers
  box(0.14, 0.7, 0.02, P.concreteShade, -1.6, DECK - 0.45, 3.43);
  box(0.12, 0.55, 0.02, P.concreteShade, 1.5, DECK - 0.4, 3.43);

  // ---- Penthouse (back-left, clear of core column z<-2.6)
  const px = -0.6, pz = -1.1, pw = 2.6, pd = 1.9, ph = 1.1;
  box(pw, ph, pd, P.concrete, px, DECK + ph / 2, pz);
  box(pw + 0.2, 0.12, pd + 0.2, P.concreteLight, px, DECK + ph + 0.06, pz); // roof slab
  box(pw + 0.05, 0.06, pd + 0.05, P.concreteShade, px, DECK + 0.03, pz); // plinth shadow
  // vertical ribs on front (+z) face and right face
  const fz = pz + pd / 2;
  for (let i = 0; i < 9; i++) {
    const x = px - pw / 2 + 0.2 + i * ((pw - 0.4) / 8);
    if (Math.abs(x - (px + 0.55)) < 0.4) continue; // leave door zone
    box(0.07, ph - 0.2, 0.05, P.roofMetal, x, DECK + ph / 2, fz + 0.03);
  }
  // door w/ mustard frame
  const dx = px + 0.55;
  box(0.62, 0.86, 0.05, MUSTARD, dx, DECK + 0.43, fz + 0.03);
  box(0.5, 0.78, 0.06, P.doorRust, dx, DECK + 0.41, fz + 0.045);
  box(0.04, 0.1, 0.05, P.signCream, dx + 0.17, DECK + 0.4, fz + 0.09);
  // grille
  box(0.5, 0.3, 0.05, P.railingSteel, px - 0.65, DECK + 0.7, fz + 0.03);
  for (let i = 0; i < 5; i++) box(0.5, 0.02, 0.03, P.glassDark, px - 0.65, DECK + 0.6 + i * 0.06, fz + 0.06);
  // '08' on right wall (+x face), built from bars
  const wx = px + pw / 2 + 0.03;
  const seg = (y: number, z: number, h: number, w: number) => box(0.02, h, w, P.signCream, wx, y, z);
  const digit = (cz: number, d: 0 | 8) => {
    const cy = DECK + 0.6;
    seg(cy + 0.18, cz, 0.04, 0.16);
    seg(cy - 0.18, cz, 0.04, 0.16);
    seg(cy, cz - 0.08, 0.4, 0.04);
    seg(cy, cz + 0.08, 0.4, 0.04);
    if (d === 8) seg(cy, cz, 0.04, 0.16);
  };
  digit(pz - 0.2, 0);
  digit(pz + 0.2, 8);
  // flue
  cyl(0.11, 0.11, 0.7, P.railingSteel, px - 0.7, DECK + ph + 0.12 + 0.35, pz - 0.4, 8);
  cyl(0.2, 0.02, 0.1, P.railingSteel, px - 0.7, DECK + ph + 0.12 + 0.77, pz - 0.4, 8);
  cyl(0.15, 0.15, 0.03, P.roofMetal, px - 0.7, DECK + ph + 0.12 + 0.68, pz - 0.4, 8);
  // vent grille frame on roof
  box(0.6, 0.05, 0.5, P.railingSteel, px + 0.6, DECK + ph + 0.14, pz + 0.3);
  box(0.46, 0.06, 0.36, P.glassDark, px + 0.6, DECK + ph + 0.15, pz + 0.3);

  // ---- Water tank (right-back), on 4 legs
  const tx = 1.7, tz = -1.2, tr = 0.6, th = 0.9, legH = 0.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(0.14, legH, 0.14, P.concrete, tx + sx * 0.4, DECK + legH / 2, tz + sz * 0.4);
  }
  box(1.2, 0.06, 1.2, P.concreteShade, tx, DECK + legH + 0.03, tz);
  cyl(tr, tr, th, P.concreteShade, tx, DECK + legH + 0.06 + th / 2, tz, 12);
  for (const hy of [0.25, 0.7]) cyl(tr + 0.03, tr + 0.03, 0.07, P.ventRust, tx, DECK + legH + 0.06 + hy, tz, 12);
  const topY = DECK + legH + 0.06 + th;
  cyl(0.03, tr + 0.04, 0.3, P.concreteShade, tx, topY + 0.15, tz, 12);
  box(0.22, 0.08, 0.22, P.roofMetal, tx + 0.12, topY + 0.26, tz + 0.05);
  box(0.14, 0.03, 0.14, P.railingSteel, tx + 0.12, topY + 0.31, tz + 0.05);

  // ---- Mushroom vent stacks near front-left parapet + pipe run
  const vents: [number, number][] = [[-2.2, 0.9], [-1.5, 1.9], [-2.2, 2.7], [0.9, 2.5]];
  vents.forEach(([x, z], i) => {
    const h = 0.45 + (i % 2) * 0.15;
    cyl(0.1, 0.12, h, P.concreteLight, x, DECK + h / 2, z, 8);
    cyl(0.1, 0.24, 0.12, P.roofMetal, x, DECK + h + 0.06, z, 8);
    cyl(0.26, 0.26, 0.03, P.roofMetal, x, DECK + h + 0.13, z, 8);
    cyl(0.16, 0.16, 0.05, P.concrete, x, DECK + 0.025, z, 8);
  });
  for (let i = 0; i < vents.length - 1; i++) {
    const [ax, az] = vents[i], [bx, bz] = vents[i + 1];
    b.rod([ax, DECK + 0.1, az], [ax, DECK + 0.1, bz], 0.035, P.railingSteel);
    b.rod([ax, DECK + 0.1, bz], [bx, DECK + 0.1, bz], 0.035, P.railingSteel);
  }
  // pipe supports
  for (const [x, z] of [[-2.2, 1.4], [-1.85, 1.9], [-2.2, 2.2]]) box(0.06, 0.1, 0.06, P.concreteShade, x, DECK + 0.05, z);

  // ---- Antenna mast on base (back-left of penthouse but on right of core column)
  const ax = 0.2, az = -0.1;
  const baseTop = DECK + 0.3;
  box(0.4, 0.3, 0.4, P.concrete, ax, DECK + 0.15, az);
  box(0.46, 0.05, 0.46, P.concreteLight, ax, baseTop + 0.02, az);
  // mast above penthouse roof top ~ y 13.0
  const mastBottom = baseTop;
  const mastTop = 14.0;
  b.rod([ax, mastBottom, az], [ax, mastTop, az], 0.025, P.railingSteel);
  for (const [cy, len] of [[13.2, 0.7], [13.6, 0.5]] as [number, number][]) {
    box(len, 0.03, 0.03, P.railingSteel, ax, cy, az);
    box(0.03, 0.03, len * 0.6, P.railingSteel, ax, cy - 0.12, az);
  }
  // stays
  for (const [sx, sz] of [[0.6, 0.5], [-0.5, 0.6], [0.2, -0.6]]) {
    b.rod([ax, 13.0, az], [ax + sx, DECK + 0.3, az + sz], 0.008, P.railingSteel);
  }
  cyl(0.06, 0.06, 0.04, P.railingSteel, ax, mastTop, az, 8);
  glow(b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 10), P.amberLit, { at: [ax, mastTop + 0.05, az] }), 1.6);
  b.spike([ax, mastTop + 0.07, az], [0, 1, 0], 0.13, 0.015, { color: P.railingSteel });

  // ---- small rubble/ junction boxes for clutter
  for (let i = 0; i < 3; i++) {
    const x = 0.9 + R() * 1.3, z = 1.2 + R() * 1.6;
    box(0.25, 0.2, 0.2, P.concreteShade, x, DECK + 0.1, z);
    box(0.27, 0.03, 0.22, P.roofMetal, x, DECK + 0.21, z);
  }
}
    return buildRoofPlant;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "brutalistBlock" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
