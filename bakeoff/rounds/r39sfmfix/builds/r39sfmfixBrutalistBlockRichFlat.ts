import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow as glowKit } from "../../../../kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw-concrete slab block on pilotis with deep balconies, rear access decks, a slit-windowed stair tower and a roof of plant and tanks.",
};

const CONC = "#8d8b85";
const CONC_L = "#a29f98";
const CONC_D = "#6f6d69";
const CONC_STAIN = "#5f5e5b";
const SEAM = "#5a5955";
const GLASS = "#1d2328";
const GLASS_B = "#2c3a44";
const LIT = "#ffcf7a";
const CURT = "#7d8d96";
const RUST = "#b5562f";
const MUSTARD = "#c79a2e";
const TEAL = "#3f7f7a";
const DOOR = "#3b2f28";
const METAL = "#4a5056";
const MOSS = "#566248";

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block" });
  const R = rng(11);

  // Box helper: size w,h,d centred at x,y,z.
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  // Box sitting on a base y.
  const boxB = (w: number, h: number, d: number, x: number, y0: number, z: number, color: string) =>
    box(w, h, d, x, y0 + h / 2, z, color);
  const cyl = (r: number, h: number, x: number, y0: number, z: number, color: string, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at: [x, y0 + h / 2, z] });

  // ---------- dimensions ----------
  const L = 48; // slab length
  const D = 12; // slab depth
  const HX = L / 2;
  const HZ = D / 2;
  const PIL = 4.2; // pilotis height
  const FL = 3; // floor height
  const FLOORS = 10;
  const BAYS = 12;
  const BAY = L / BAYS;
  const TOP = PIL + FL * FLOORS;

  // ---------- plinth & ground floor ----------
  boxB(L + 14, 0.3, D + 10, 2, -0.02, 0, CONC_D);
  // slab underside soffit with beams
  boxB(L, 0.9, D, 0, PIL - 0.9, 0, CONC_D);
  for (let i = 0; i <= BAYS; i++) boxB(0.5, 0.5, D, -HX + i * BAY, PIL - 1.4, 0, CONC);

  // pilotis columns: two rows, flared capitals
  for (let i = 0; i <= BAYS; i++) {
    const x = -HX + i * BAY;
    for (const z of [-HZ + 1.2, HZ - 1.2]) {
      boxB(1.1, PIL - 1.4, 1.1, x, 0, z, CONC);
      boxB(1.5, 0.5, 1.5, x, PIL - 1.9, z, CONC_L);
      boxB(1.4, 0.3, 1.4, x, 0, z, CONC_D);
    }
  }
  // recessed ground-floor lobby/shops
  boxB(BAY * 3, 3.2, 0.3, -HX + BAY * 4.5, 0, -1, GLASS);
  boxB(BAY * 3 + 0.4, 0.3, 0.5, -HX + BAY * 4.5, 3.2, -0.9, CONC_L);
  for (let k = 0; k < 6; k++) boxB(0.12, 3.2, 0.12, -HX + BAY * 3 + 0.2 + k * 2, 0, -0.8, METAL);
  boxB(BAY * 2, 3.0, 0.3, -HX + BAY * 9.5, 0, -1, GLASS_B);
  boxB(2.4, 2.4, 0.2, -HX + BAY * 9.5, 0, -0.8, RUST);
  // entrance canopy
  boxB(7, 0.35, 3, -HX + BAY * 4.5, 3.4, 2.6, CONC_L);
  boxB(0.4, 3.4, 0.4, -HX + BAY * 3.1, 0, 3.9, CONC);
  boxB(0.4, 3.4, 0.4, -HX + BAY * 5.9, 0, 3.9, CONC);
  // steps
  for (let s = 0; s < 4; s++) boxB(6, 0.15, 0.4, -HX + BAY * 4.5, s * 0.15, 4.4 - s * 0.4 + 0.8, CONC_L);

  // ---------- main slab body ----------
  boxB(L, FL * FLOORS, D - 0.01, 0, PIL, 0, CONC);
  // board-formed seams on end walls
  for (const sx of [-1, 1])
    for (let y = PIL + 0.75; y < TOP; y += 1.5) boxB(0.06, 0.07, D - 0.3, sx * (HX + 0.01), y, 0, SEAM);
  // big end-wall recessed panels
  for (const sx of [-1, 1]) {
    boxB(0.2, FL * 4, 5, sx * (HX + 0.05), PIL + 3, 0, CONC_D);
    boxB(0.2, 1.2, 8, sx * (HX + 0.05), PIL + FL * 7, 0, CONC_STAIN);
  }
  // floor-line bands on rear + front slab edges
  const front = HZ;
  const back = -HZ;

  const lit = (mesh: any, s = 1.2) => glowKit(mesh, s);

  for (let f = 0; f < FLOORS; f++) {
    const y = PIL + f * FL;
    // ---- FRONT: deep balconies ----
    boxB(L, 0.28, 1.5, 0, y, front + 0.75, CONC_L); // continuous balcony slab
    boxB(L, 0.2, 0.12, 0, y + 0.28, front + 1.45, CONC_D); // handrail lip shadow
    for (let k = 0; k < BAYS; k++) {
      const x = -HX + BAY / 2 + k * BAY;
      // parapet panel colour
      const rr = R();
      const pc = rr < 0.1 ? RUST : rr < 0.17 ? MUSTARD : rr < 0.22 ? TEAL : rr < 0.5 ? CONC : CONC_L;
      boxB(BAY - 0.6, 1.0, 0.22, x, y + 0.28, front + 1.4, pc);
      boxB(BAY - 0.5, 0.1, 0.3, x, y + 1.28, front + 1.4, CONC_D);
      // window recess
      const wl = R() < 0.3;
      const wc = wl ? LIT : R() < 0.35 ? GLASS_B : GLASS;
      const win = boxB(2.2, 1.7, 0.12, x - 0.5, y + 0.8, front + 0.05, wc);
      if (wl) lit(win);
      boxB(2.4, 0.12, 0.2, x - 0.5, y + 0.7, front + 0.1, CONC_D); // sill
      boxB(2.4, 0.12, 0.25, x - 0.5, y + 2.5, front + 0.1, CONC_D); // lintel
      if (R() < 0.35) boxB(0.8, 1.6, 0.06, x - 0.1, y + 0.85, front + 0.13, CURT);
      // balcony door
      boxB(0.9, 2.1, 0.12, x + 1.3, y + 0.28, front + 0.05, DOOR);
      // occasional planter
      if (R() < 0.25) boxB(1.2, 0.35, 0.35, x + 0.3, y + 0.28, front + 1.15, MOSS);
    }
    // party fins between bays
    for (let k = 0; k <= BAYS; k++) {
      const x = -HX + k * BAY;
      boxB(0.4, FL, 1.5, x, y, front + 0.75, CONC);
    }

    // ---- REAR: access gallery ----
    boxB(L, 0.28, 1.8, 0, y, back - 0.9, CONC_L);
    boxB(L, 1.0, 0.18, 0, y + 0.28, back - 1.7, CONC);
    for (let k = 0; k < BAYS; k++) {
      const x = -HX + BAY / 2 + k * BAY;
      boxB(0.95, 2.1, 0.1, x - 1.0, y + 0.28, back - 0.03, R() < 0.3 ? RUST : DOOR);
      const wl = R() < 0.25;
      const w = boxB(1.2, 0.8, 0.1, x + 0.8, y + 1.2, back - 0.03, wl ? LIT : GLASS);
      if (wl) lit(w);
      boxB(0.5, 0.5, 0.1, x + 1.9, y + 1.6, back - 0.03, GLASS_B);
    }
    // concrete fins on rear
    for (let k = 0; k <= BAYS; k += 1) boxB(0.3, FL, 1.8, -HX + k * BAY, y, back - 0.9, CONC_D);
  }

  // roof slab & parapet
  boxB(L + 0.6, 0.5, D + 0.6, 0, TOP, 0, CONC_L);
  boxB(L + 0.6, 0.9, 0.3, 0, TOP + 0.5, front + 0.15, CONC);
  boxB(L + 0.6, 0.9, 0.3, 0, TOP + 0.5, back - 0.15, CONC);
  boxB(0.3, 0.9, D, -HX - 0.15, TOP + 0.5, 0, CONC);
  boxB(0.3, 0.9, D, HX + 0.15, TOP + 0.5, 0, CONC);

  // ---------- stair / lift tower ----------
  const TX = HX + 4.2;
  const TH = TOP + 5;
  boxB(6, TH, 7, TX, 0, -1.5, CONC);
  // board seams
  for (let y = 1; y < TH; y += 1.5) {
    boxB(6.04, 0.07, 7.04, TX, y, -1.5, SEAM);
  }
  // slit windows front and outer face
  for (let f = 0; f < FLOORS + 1; f++) {
    const y = 1.8 + f * FL + 0.5;
    const wl = R() < 0.3;
    const w1 = boxB(0.5, 1.8, 0.15, TX - 1.4, y, 2.0, wl ? LIT : GLASS);
    const w2 = boxB(0.5, 1.8, 0.15, TX + 1.4, y, 2.0, GLASS);
    const w3 = boxB(0.15, 1.8, 0.5, TX + 3.0, y, -1.5, wl ? LIT : GLASS);
    if (wl) {
      lit(w1);
      lit(w3);
    }
    boxB(0.8, 0.15, 0.3, TX - 1.4, y + 1.8, 2.0, CONC_D);
  }
  // tower crown: cantilevered cap and louvres
  boxB(6.8, 0.8, 7.8, TX, TH, -1.5, CONC_L);
  boxB(4, 2, 4, TX, TH + 0.8, -1.5, CONC_D);
  for (let k = 0; k < 5; k++) boxB(3.4, 0.1, 0.1, TX, TH + 1.0 + k * 0.35, 0.55, METAL);
  // link bridges tower <-> slab each 3 floors
  for (let f = 1; f < FLOORS; f += 3) {
    boxB(3, 0.28, 2.4, HX + 1.4, PIL + f * FL, -1.5, CONC_L);
    boxB(3, 1.0, 0.15, HX + 1.4, PIL + f * FL + 0.28, -2.7, CONC);
    boxB(3, 1.0, 0.15, HX + 1.4, PIL + f * FL + 0.28, -0.3, CONC);
  }
  // tower base buttress
  boxB(1.2, 5, 1.2, TX + 3.3, 0, 2.4, CONC_D);
  boxB(1.2, 5, 1.2, TX - 3.3, 0, 2.4, CONC_D);

  // ---------- roof plant ----------
  boxB(10, 2.6, 5, -10, TOP + 0.5, 0, CONC);
  boxB(10.4, 0.3, 5.4, -10, TOP + 3.1, 0, CONC_L);
  for (let k = 0; k < 6; k++) boxB(0.1, 1.6, 0.1, -14 + k * 1.6, TOP + 0.5, 2.55, METAL);
  boxB(6, 1.4, 0.1, -10, TOP + 1.2, 2.55, GLASS);
  // water tanks
  for (const [x, z] of [
    [8, 0.5],
    [12, -1.5],
    [14, 1.5],
  ] as [number, number][]) {
    cyl(1.4, 2.6, x, TOP + 0.5, z, CONC_STAIN, 12);
    cyl(1.55, 0.3, x, TOP + 3.1, z, CONC_D, 12);
    cyl(1.55, 0.2, x, TOP + 0.5, z, CONC_D, 12);
  }
  // chimney stacks
  for (let k = 0; k < 4; k++) {
    boxB(1.2, 4.5, 1.2, -2 + k * 2.2 - 17, TOP + 0.5, -3.5, CONC_D);
    boxB(1.5, 0.3, 1.5, -2 + k * 2.2 - 17, TOP + 5, -3.5, CONC_L);
  }
  // roof fins / sunscreen pergola
  for (let k = 0; k < 8; k++) boxB(0.35, 2.4, 6, 17 + k * 0.9 - 4, TOP + 0.5, 1.5, CONC);
  boxB(8, 0.3, 6.4, 17, TOP + 2.9, 1.5, CONC_L);

  // ---------- staining / weathering streaks ----------
  for (let k = 0; k < 28; k++) {
    const x = -HX + 1 + R() * (L - 2);
    const h = 2 + R() * 5;
    const f = Math.floor(R() * (FLOORS - 1)) + 1;
    boxB(0.15 + R() * 0.25, h, 0.04, x, PIL + f * FL - h + 0.2, front + 1.52, CONC_STAIN);
  }
  for (let k = 0; k < 14; k++) {
    const x = -HX + 1 + R() * (L - 2);
    const h = 2 + R() * 4;
    boxB(0.3, h, 0.04, x, PIL - 0.1 + FL * (1 + Math.floor(R() * 8)) - h, back - 1.82, CONC_STAIN);
  }
  // moss at base
  for (let k = 0; k < 10; k++) boxB(0.8 + R(), 0.3, 0.3, -HX + R() * L, 0.3, front + 3 + R() * 2, MOSS);

  // small forecourt lamps
  for (const x of [-18, -6, 6, 18]) {
    cyl(0.07, 3.2, x, 0.3, front + 5.5, METAL, 6);
    lit(b.part(new THREE.BoxGeometry(0.4, 0.2, 0.4), LIT, { at: [x, 3.6, front + 5.5] }), 1.5);
  }

  return b.root;
}
