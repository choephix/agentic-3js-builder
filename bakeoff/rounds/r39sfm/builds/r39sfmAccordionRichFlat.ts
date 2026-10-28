import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Piano Accordion",
  description:
    "Italian mother-of-pearl piano accordion: a pearl-tiled body with iridescent inlay, gold trim, a 23-key piano keyboard, a 6x14 bass button board, a red-and-black pleated bellows, a gold treble grille with an abalone medallion, register switches, leather straps and a brand badge.",
};

// ---------- palette ----------
const BASE = "#ece0d6";
const PEARL_W = "#f8f3ec";
const CREAM = "#eadfcd";
const PINK = "#f0d1d6";
const AQUA = "#bfe4df";
const LILAC = "#d3c6ea";
const PEACH = "#f4d9c0";
const ABALONE = "#6fc2ba";
const ABALONE_D = "#2f8c92";
const GOLD = "#d9a93b";
const GOLD_D = "#a97d22";
const EBONY = "#201922";
const KEYBED = "#2a2230";
const BELLOW_OUT = "#241821";
const BELLOW_IN = "#8c1a2a";
const LEATHER = "#18141a";
const KEY_W = "#fbf6ea";
const SLOT = "#2b1c14";
const TILES = [PEARL_W, CREAM, PINK, AQUA, LILAC, PEACH, PEARL_W, PINK, ABALONE];

// ---------- dimensions (meters) ----------
const H = 0.42; // body height
const D = 0.1; // half depth
const TX0 = 0.15; // treble box x range
const TX1 = 0.35;
const BX0 = -0.35; // bass box x range
const BX1 = -0.15;

export default function build() {
  const b = createBuilder({ name: "accordion" });
  const R = rng(11);

  // ----- merged-geometry bins: one part per colour -----
  const bins = new Map<string, THREE.BufferGeometry[]>();
  function put(color: string, geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) {
    if (rx) geo.rotateX(rx);
    if (ry) geo.rotateY(ry);
    if (rz) geo.rotateZ(rz);
    geo.translate(x, y, z);
    if (!bins.has(color)) bins.set(color, []);
    bins.get(color)!.push(geo);
  }
  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number) =>
    put(c, new THREE.BoxGeometry(w, h, d), x, y, z);
  // cylinder with axis along X / Y / Z
  const cylX = (c: string, r: number, len: number, seg: number, x: number, y: number, z: number) =>
    put(c, new THREE.CylinderGeometry(r, r, len, seg), x, y, z, 0, 0, Math.PI / 2);
  const cylY = (c: string, r: number, len: number, seg: number, x: number, y: number, z: number) =>
    put(c, new THREE.CylinderGeometry(r, r, len, seg), x, y, z);
  const cylZ = (c: string, r: number, len: number, seg: number, x: number, y: number, z: number) =>
    put(c, new THREE.CylinderGeometry(r, r, len, seg), x, y, z, Math.PI / 2);

  // ----- mosaic of mother-of-pearl tiles on a Z-facing face -----
  function mosaicZ(
    cx: number, cy: number, z: number, sign: number,
    nu: number, nv: number, tw: number, th: number,
    skip?: (x: number, y: number) => boolean,
  ) {
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const x = cx + (i - (nu - 1) / 2) * tw;
        const y = cy + (j - (nv - 1) / 2) * th;
        if (skip && skip(x, y)) continue;
        const c = TILES[Math.floor(R() * TILES.length)];
        box(c, tw - 0.003, th - 0.003, 0.003, x, y, z + sign * 0.0015);
      }
  }

  // ===== main boxes =====
  box(BASE, TX1 - TX0, H, 2 * D, (TX0 + TX1) / 2, H / 2, 0); // treble box
  box(BASE, BX1 - BX0, H, 2 * D, (BX0 + BX1) / 2, H / 2, 0); // bass box

  // gold edge bars on every edge of both boxes
  for (const [x0, x1] of [[TX0, TX1], [BX0, BX1]]) {
    const cx = (x0 + x1) / 2;
    const w = x1 - x0;
    for (const sx of [x0, x1]) for (const sz of [-D, D]) box(GOLD, 0.01, H, 0.01, sx, H / 2, sz);
    for (const y of [0.005, H - 0.005]) {
      for (const sz of [-D, D]) box(GOLD, w, 0.01, 0.01, cx, y, sz);
      for (const sx of [x0, x1]) box(GOLD, 0.01, 0.01, 2 * D, sx, y, 0);
    }
  }
  // gold frame plates where the bellows meet the boxes
  box(GOLD_D, 0.008, H - 0.02, 2 * D - 0.02, TX0 - 0.002, H / 2, 0);
  box(GOLD_D, 0.008, H - 0.02, 2 * D - 0.02, BX1 + 0.002, H / 2, 0);

  // ===== bellows =====
  const N = 16;
  const span = TX0 - BX1;
  const pitch = span / N;
  for (let i = 0; i < N; i++) {
    const x = BX1 + (i + 0.5) * pitch;
    if (i % 2 === 0) box(BELLOW_OUT, pitch * 0.62, H - 0.012, 2 * D - 0.012, x, H / 2, 0);
    else box(BELLOW_IN, pitch * 0.62, H - 0.05, 2 * D - 0.05, x, H / 2, 0);
  }
  // paper-like pearl tabs on the outer ridges (front and back)
  for (let i = 0; i < N; i += 2) {
    const x = BX1 + (i + 0.5) * pitch;
    for (const s of [1, -1]) {
      box(PEARL_W, pitch * 0.5, 0.02, 0.002, x, H - 0.03, s * (D - 0.005));
      box(PEARL_W, pitch * 0.5, 0.02, 0.002, x, 0.03, s * (D - 0.005));
    }
  }
  // gold bellows corner protectors
  for (const y of [0.013, H - 0.013]) for (const s of [1, -1]) box(GOLD, span, 0.014, 0.014, (BX1 + TX0) / 2, y, s * (D - 0.012));

  // ===== treble keyboard (+Z face) =====
  const KX = 0.2255;
  box(KEYBED, 0.13, 0.38, 0.008, 0.226, H / 2, D + 0.004 - 0.004 + 0.004);
  box(AQUA, 0.012, 0.38, 0.028, 0.158, H / 2, D + 0.014);
  box(PEARL_W, 0.012, 0.38, 0.028, 0.292, H / 2, D + 0.014);
  for (const y of [0.016, H - 0.016]) box(GOLD, 0.15, 0.012, 0.03, 0.226, y, D + 0.015);
  const NK = 23;
  const kp = 0.0155;
  const y0 = (H - NK * kp) / 2 + kp / 2;
  for (let i = 0; i < NK; i++) {
    const y = y0 + i * kp;
    box(KEY_W, 0.115, kp - 0.0012, 0.012, KX, y, D + 0.014);
    const n = i % 7;
    if (i < NK - 1 && [0, 1, 3, 4, 5].includes(n)) {
      const by = y + kp / 2;
      box(EBONY, 0.06, 0.0092, 0.012, 0.2525, by, D + 0.025);
      box(ABALONE_D, 0.012, 0.0035, 0.0015, 0.2725, by, D + 0.0313);
    }
  }
  // mosaic strip beside the keyboard and on the back
  mosaicZ(0.324, H / 2, D, 1, 2, 17, 0.0215, 0.0247);
  mosaicZ(0.25, H / 2, -D, -1, 8, 16, 0.025, 0.0262);

  // ===== bass box mosaics + badge region =====
  const badge = (x: number, y: number) => Math.abs(x + 0.25) < 0.062 && Math.abs(y - H / 2) < 0.03;
  mosaicZ(-0.25, H / 2, D, 1, 8, 16, 0.025, 0.0262, badge);
  mosaicZ(-0.25, H / 2, -D, -1, 8, 16, 0.025, 0.0262);

  // ===== treble grille (+X end) =====
  box(GOLD, 0.006, 0.38, 0.17, TX1 + 0.003, H / 2, 0);
  for (const yc of [0.3425, 0.0775])
    for (let i = 0; i < 7; i++) box(SLOT, 0.002, 0.085, 0.009, TX1 + 0.0065, yc, (i - 3) * 0.02);
  cylX(GOLD_D, 0.0055, 0.002, 6, TX1 + 0.0065, 0.21, 0);
  // register switches on the top
  box(KEYBED, 0.05, 0.004, 0.16, 0.25, H + 0.002, 0);
  for (let i = 0; i < 5; i++)
    box(i % 2 ? PINK : PEARL_W, 0.022, 0.006, 0.02, 0.25, H + 0.007, (i - 2) * 0.03);

  // ===== bass buttons (-X end) =====
  box(KEYBED, 0.006, 0.38, 0.178, BX0 - 0.003, H / 2, 0);
  for (const s of [1, -1]) box(GOLD, 0.01, 0.38, 0.008, BX0 - 0.004, H / 2, s * 0.09);
  for (const y of [0.016, H - 0.016]) box(GOLD, 0.01, 0.008, 0.18, BX0 - 0.004, y, 0);
  for (let r = 0; r < 14; r++)
    for (let c = 0; c < 6; c++) {
      const col = c < 2 ? ABALONE : r % 4 === 0 ? EBONY : r % 4 === 2 ? PINK : PEARL_W;
      cylX(col, 0.0078, 0.008, 8, BX0 - 0.009, 0.045 + r * 0.0235, (c - 2.5) * 0.025);
      cylX(GOLD_D, 0.0036, 0.002, 6, BX0 - 0.0135, 0.045 + r * 0.0235, (c - 2.5) * 0.025);
    }

  // ===== straps, buckle, air button =====
  box(LEATHER, 0.14, 0.005, 0.03, -0.235, H + 0.0025, 0.02);
  box(GOLD, 0.03, 0.007, 0.036, -0.185, H + 0.0035, 0.02);
  box(LEATHER, 0.02, 0.008, 0.026, -0.185, H + 0.005, 0.02);
  cylY(GOLD, 0.011, 0.006, 8, -0.3, H + 0.003, -0.04);
  cylY(PEARL_W, 0.007, 0.008, 8, -0.3, H + 0.005, -0.04);
  for (const x of [0.25, -0.25]) {
    box(LEATHER, 0.04, 0.3, 0.007, x, H / 2, -D - 0.0055);
    for (const y of [0.1, 0.32]) cylZ(GOLD, 0.0045, 0.004, 8, x, y, -D - 0.01);
    box(GOLD, 0.05, 0.008, 0.01, x, 0.075, -D - 0.006);
    box(GOLD, 0.05, 0.008, 0.01, x, 0.345, -D - 0.006);
  }

  // flush all merged bins as one part per colour
  for (const [color, geos] of bins) {
    const merged = mergeGeometries(geos, false);
    if (merged) b.part(merged, color, { at: [0, 0, 0], flat: true });
  }

  // ===== medallion on the grille (extrudes) =====
  const diamond = (r: number, rh: number): [number, number, "sharp"][] => [
    [0, rh, "sharp"], [r, 0, "sharp"], [0, -rh, "sharp"], [-r, 0, "sharp"],
  ];
  b.extrude(diamond(0.055, 0.078), { at: [TX1 + 0.008, 0.21, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: ABALONE });
  b.extrude(diamond(0.044, 0.063), { at: [TX1 + 0.0105, 0.21, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: PEARL_W });
  b.extrude(diamond(0.026, 0.037), { at: [TX1 + 0.013, 0.21, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: PINK });
  b.extrude(diamond(0.012, 0.017), { at: [TX1 + 0.0155, 0.21, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: GOLD });

  // ===== brand badge (textured plane) on bass +Z face =====
  const tex = svg(
    `<svg viewBox="0 0 220 90" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="45" rx="106" ry="41" fill="#d9a93b" stroke="#7a5516" stroke-width="4"/>
      <ellipse cx="110" cy="45" rx="94" ry="31" fill="#2a1c24" stroke="#f5e1a0" stroke-width="2"/>
      <text x="110" y="44" text-anchor="middle" font-family="serif" font-style="italic" font-weight="bold" font-size="25" fill="#f8f3ec">Perla Bella</text>
      <text x="110" y="62" text-anchor="middle" font-family="serif" font-size="11" fill="#bfe4df">FISARMONICA · ITALIA</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.11, 0.045), "#ffffff", {
    at: [-0.25, H / 2, D + 0.004],
    dir: [0, 0, 1],
    axis: "z",
    texture: tex,
  });

  return b.root;
}
