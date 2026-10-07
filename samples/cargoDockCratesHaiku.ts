import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { mix, noise, paint, Paint, smoothstep } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Dockside cargo",
  description:
    "A loading-dock cluster in Overwatch style: an open cargo crate with its lid thrown back, closed crates on pallets with a stacked container, steel drums, a traffic cone, a gantry crane with a swinging hook and a hanging hazard sign, and a pallet jack with a tiller handle.",
  style: "Overwatch",
  commit: "b816db2",
};

type V3 = [number, number, number];
type Col = string | Paint;

const HULL = "#e7ecf2";
const HULL_LOW = "#aab5c3";
const SEAM = "#8d99ab";
const NAVY = "#243450";
const CHAR = "#161c29";
const ORANGE = "#ff7a1f";
const STEEL = "#8e9aac";
const SLATE = "#5b6a82";
const CONC = "#7d8592";
const CONC_DARK = "#596170";
const FLOOR_LINE = "#d5dce6";
const TIRE = "#1d222c";
const CASE = "#c9d2dd";

const gridDist = (x: number, cell: number) => {
  const r = x / cell;
  return Math.abs(r - Math.round(r)) * cell;
};

const floorPaint = paint((p, n) => {
  if (n.y < 0.5) return CONC_DARK;
  if (p.z > 1.78) return (Math.floor((p.x + p.z) / 0.09) & 1) === 1 ? CHAR : ORANGE;
  const bay = p.x > -0.45 && p.x < 0.27 && p.z > 0.38 && p.z < 1.7;
  if (bay && Math.min(p.x + 0.45, 0.27 - p.x, p.z - 0.38, 1.7 - p.z) < 0.025) return FLOOR_LINE;
  if (Math.min(gridDist(p.x, 1), gridDist(p.z, 1)) < 0.012) return FLOOR_LINE;
  return mix(CONC, CONC_DARK, smoothstep(0.3, 0.7, noise(p, 0.8, 5)));
});

const hazardPaint = paint((p) => ((Math.floor((p.x + p.y) / 0.06) & 1) === 1 ? CHAR : ORANGE));

// Hull skin: panel seams on a grid measured from the crate centre, grime at the base, an optional hazard band on the front.
const skin = (c: V3, y0: number, cell: number, band: boolean) =>
  paint((p, n) => {
    if (band && n.z > 0.5 && p.y > y0 + 0.1 && p.y < y0 + 0.2)
      return (Math.floor((p.x + p.y) / 0.06) & 1) === 1 ? CHAR : ORANGE;
    let u: number;
    let v: number;
    if (Math.abs(n.x) > Math.abs(n.y) && Math.abs(n.x) > Math.abs(n.z)) {
      u = p.z - c[2];
      v = p.y - c[1];
    } else if (Math.abs(n.y) > Math.abs(n.z)) {
      u = p.x - c[0];
      v = p.z - c[2];
    } else {
      u = p.x - c[0];
      v = p.y - c[1];
    }
    if (Math.min(gridDist(u, cell), gridDist(v, cell)) < 0.008) return SEAM;
    return mix(HULL_LOW, HULL, smoothstep(y0, y0 + 0.35, p.y));
  });

const DRUM: [number, number][] = [
  [0, 0],
  [0.22, 0],
  [0.27, 0.02],
  [0.3, 0.1],
  [0.31, 0.3],
  [0.31, 0.6],
  [0.3, 0.8],
  [0.27, 0.88],
  [0.2, 0.9],
  [0, 0.9],
];

export default function build() {
  const PLACARD = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <rect x="2" y="2" width="116" height="66" fill="#f3f6fa" stroke="#1b2538" stroke-width="4"/>
  <rect x="2" y="2" width="116" height="15" fill="#ff7a1f"/>
  <text x="10" y="13.5" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#1b2538">HANDLE CARE</text>
  <text x="10" y="52" font-family="Arial, sans-serif" font-weight="bold" font-size="26" fill="#1b2538">A-17</text>
  <text x="10" y="62" font-family="Arial, sans-serif" font-size="7" fill="#1b2538">DK 04   2.4 T</text>
  <g fill="#1b2538">
    <rect x="80" y="30" width="2" height="26"/><rect x="84" y="30" width="1" height="26"/>
    <rect x="87" y="30" width="3" height="26"/><rect x="92" y="30" width="1" height="26"/>
    <rect x="94" y="30" width="2" height="26"/><rect x="98" y="30" width="1" height="26"/>
    <rect x="101" y="30" width="3" height="26"/><rect x="106" y="30" width="1" height="26"/>
    <rect x="109" y="30" width="2" height="26"/>
  </g>
</svg>`,
    { size: 256 },
  );
  const DRUM_LABEL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
  <rect x="3" y="3" width="94" height="74" rx="6" fill="#f3f6fa" stroke="#1b2538" stroke-width="5"/>
  <polygon points="50,12 84,64 16,64" fill="#ff7a1f" stroke="#1b2538" stroke-width="5" stroke-linejoin="round"/>
  <rect x="46.5" y="30" width="7" height="18" fill="#1b2538"/>
  <circle cx="50" cy="56" r="3.6" fill="#1b2538"/>
  <text x="50" y="74" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#1b2538">DRUM 07</text>
</svg>`,
    { size: 256 },
  );
  const HOOK_SIGN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 125">
  <rect width="200" height="125" fill="#243450"/>
  <rect width="200" height="12" fill="#ff7a1f"/>
  <rect y="113" width="200" height="12" fill="#ff7a1f"/>
  <polygon points="38,32 72,92 4,92" fill="#ff7a1f" stroke="#f3f6fa" stroke-width="5" stroke-linejoin="round"/>
  <rect x="35.5" y="48" width="5" height="22" fill="#243450"/>
  <circle cx="38" cy="81" r="3" fill="#243450"/>
  <text x="88" y="66" font-family="Arial, sans-serif" font-weight="bold" font-size="30" fill="#f3f6fa">HOOK</text>
  <text x="88" y="90" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#ff7a1f">KEEP CLEAR</text>
</svg>`,
    { size: 256 },
  );
  const JACK_TAG = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40">
  <rect x="1.5" y="1.5" width="77" height="37" fill="#f3f6fa" stroke="#1b2538" stroke-width="3"/>
  <rect x="1.5" y="1.5" width="77" height="8" fill="#ff7a1f"/>
  <text x="40" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="#1b2538">MAX 2000 KG</text>
</svg>`,
    { size: 256 },
  );

  const b = createBuilder({ name: "dockCargo", paintSize: 2048 });
  const ROOT = b.joint("dock", { at: [0, 0, 0] });
  const FY = 0.08; // top of the floor pad
  type Bone = Joint;
  type Opts = { r?: number; seg?: number; bone?: Bone };

  const add = (geo: THREE.BufferGeometry, color: Col, bone: Bone = ROOT) =>
    b.part(geo, color, { bone, at: [0, 0, 0] });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: Col, o: Opts = {}) => {
    const g: THREE.BufferGeometry = o.r
      ? new RoundedBoxGeometry(w, h, d, o.seg ?? 1, o.r)
      : new THREE.BoxGeometry(w, h, d);
    return add(g.translate(x, y, z), color, o.bone ?? ROOT);
  };

  const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, color: Col, axis: "x" | "y" | "z" = "y") => {
    const g = new THREE.CylinderGeometry(rt, rb, h, 12);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    return add(g.translate(x, y, z), color);
  };

  // Torus ring: "y" lies flat, "z" stands in the XY plane, "x" stands in the ZY plane.
  const ring = (R: number, tube: number, x: number, y: number, z: number, color: Col, axis: "x" | "y" | "z" = "z") => {
    const g = new THREE.TorusGeometry(R, tube, 6, 16);
    if (axis === "y") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateY(Math.PI / 2);
    return add(g.translate(x, y, z), color);
  };

  const label = (tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number, facing: V3 = [0, 0, 1], bone: Bone = ROOT) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at: [x, y, z], dir: facing, axis: "z", texture: tex });

  const corners = (cx: number, y0: number, cz: number, w: number, h: number, d: number) => {
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        box(0.07, h, 0.07, cx + sx * (w / 2 - 0.02), y0 + h / 2, cz + sz * (d / 2 - 0.02), NAVY, { r: 0.012 });
  };

  const crate = (cx: number, y0: number, cz: number, w: number, h: number, d: number, cell: number) => {
    add(
      new RoundedBoxGeometry(w, h, d, 2, 0.03).translate(cx, y0 + h / 2, cz),
      skin([cx, y0 + h / 2, cz], y0, cell, true),
    );
    corners(cx, y0, cz, w, h, d);
  };

  const openCrate = (lidName: string, cx: number, y0: number, cz: number, w: number, h: number, d: number, cell: number) => {
    const t = 0.06;
    const top = y0 + h;
    const sk = skin([cx, y0 + h / 2, cz], y0, cell, true);
    const wall = { r: 0.015, seg: 2 };
    box(w, 0.05, d, cx, y0 + 0.025, cz, CHAR);
    box(w, h, t, cx, y0 + h / 2, cz + d / 2 - t / 2, sk, wall);
    box(w, h, t, cx, y0 + h / 2, cz - d / 2 + t / 2, sk, wall);
    box(t, h, d, cx - w / 2 + t / 2, y0 + h / 2, cz, sk, wall);
    box(t, h, d, cx + w / 2 - t / 2, y0 + h / 2, cz, sk, wall);
    corners(cx, y0, cz, w, h, d);
    box(w + 0.03, 0.04, 0.07, cx, top - 0.02, cz + d / 2 - 0.035, NAVY, { r: 0.012 });
    box(w + 0.03, 0.04, 0.07, cx, top - 0.02, cz - d / 2 + 0.035, NAVY, { r: 0.012 });
    box(0.07, 0.04, d, cx - w / 2 + 0.035, top - 0.02, cz, NAVY, { r: 0.012 });
    box(0.07, 0.04, d, cx + w / 2 - 0.035, top - 0.02, cz, NAVY, { r: 0.012 });

    // Contents: two canisters and two cases with tape.
    cyl(0.12, 0.12, 0.5, cx - 0.38, y0 + 0.3, cz + 0.12, SLATE);
    cyl(0.125, 0.125, 0.03, cx - 0.38, y0 + 0.565, cz + 0.12, ORANGE);
    cyl(0.12, 0.12, 0.5, cx - 0.05, y0 + 0.3, cz - 0.2, SLATE);
    cyl(0.125, 0.125, 0.03, cx - 0.05, y0 + 0.565, cz - 0.2, ORANGE);
    for (const dz of [0.22, -0.22]) {
      box(0.32, 0.22, 0.28, cx + 0.3, y0 + 0.16, cz + dz, CASE, { r: 0.012 });
      box(0.05, 0.005, 0.28, cx + 0.3, y0 + 0.273, cz + dz, ORANGE);
    }

    // Lid on a hinge along its back edge, thrown back about 105 degrees.
    const lid = b.joint(lidName, { parent: ROOT, at: [cx, top, cz - d / 2], role: "hinge" });
    add(
      new RoundedBoxGeometry(w, 0.05, d, 2, 0.012)
        .translate(0, 0.025, d / 2)
        .rotateX((-105 * Math.PI) / 180)
        .translate(cx, top, cz - d / 2),
      skin([cx, top, cz], y0, cell, false),
      lid,
    );
    for (const sx of [-1, 1]) cyl(0.02, 0.02, 0.12, cx + sx * (w / 2 - 0.15), top, cz - d / 2, NAVY, "x");
  };

  const pallet = (cx: number, cz: number, w: number, d: number, y0 = FY) => {
    for (const k of [-1, 0, 1]) box(w, 0.025, 0.13, cx, y0 + 0.0125, cz + (k * (d - 0.13)) / 2, SLATE, { r: 0.005 });
    for (const k of [-1, 0, 1]) box(0.1, 0.07, d, cx + (k * (w - 0.12)) / 2, y0 + 0.06, cz, SLATE, { r: 0.012 });
    for (let i = 0; i < 5; i++)
      box(w, 0.025, 0.13, cx, y0 + 0.1075, cz - d / 2 + 0.065 + (i * (d - 0.13)) / 4, SLATE, { r: 0.005 });
  };

  const strap = (cx: number, y: number, cz: number, w: number, d: number) => {
    box(w + 0.02, 0.025, 0.012, cx, y, cz + d / 2 + 0.004, STEEL);
    box(w + 0.02, 0.025, 0.012, cx, y, cz - d / 2 - 0.004, STEEL);
    box(0.012, 0.025, d + 0.02, cx - w / 2 - 0.004, y, cz, STEEL);
  };

  // Floor pad with painted grid and hazard edge.
  box(4.0, 0.08, 3.5, 0, 0.04, 0.25, floorPaint);

  // Gantry: twin posts, rails, runway beam, trolley and beacons.
  for (const sx of [-1, 1]) {
    box(0.16, 4.02, 0.2, sx * 1.8, FY + 2.01, -1.2, NAVY, { r: 0.02 });
    box(0.18, 0.5, 0.22, sx * 1.8, FY + 0.25, -1.2, hazardPaint, { r: 0.02 });
    box(0.36, 0.03, 0.36, sx * 1.8, FY + 0.015, -1.2, SLATE, { r: 0.008 });
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) cyl(0.016, 0.016, 0.02, sx * 1.8 + dx * 0.13, FY + 0.04, -1.2 + dz * 0.13, STEEL);
    cyl(0.06, 0.07, 0.1, sx * 1.8, 4.18, -1.2, ORANGE);
  }
  box(3.7, 0.12, 0.03, 0, 4.04, -1.2, STEEL);
  box(3.7, 0.03, 0.2, 0, 4.115, -1.2, STEEL, { r: 0.008 });
  box(3.7, 0.03, 0.2, 0, 3.965, -1.2, STEEL, { r: 0.008 });
  box(3.4, 0.02, 0.012, 0, 3.965, -1.094, ORANGE);
  b.rod([-1.72, 0.95, -1.2], [1.72, 0.95, -1.2], 0.022, { color: STEEL });
  b.rod([-1.72, 1.45, -1.2], [1.72, 1.45, -1.2], 0.022, { color: STEEL });
  box(0.36, 0.15, 0.3, 0.45, 3.875, -1.2, NAVY, { r: 0.02 });

  // Crane hook on a swivel block, with a chain up to the trolley.
  const hook = b.joint("hook", { parent: ROOT, at: [0.45, 2.22, -1.2], role: "hinge" });
  box(0.16, 0.22, 0.16, 0.45, 2.22, -1.2, ORANGE, { r: 0.03, bone: hook });
  b.sweep(
    catmull([
      [0.45, 2.12, -1.2],
      [0.45, 1.98, -1.2],
      [0.45, 1.86, -1.19],
      [0.45, 1.78, -1.12],
      [0.45, 1.74, -1.02],
      [0.45, 1.76, -0.92],
      [0.45, 1.84, -0.9],
    ]),
    [0.022, 0.013],
    { color: STEEL, bone: hook },
  );
  for (let i = 0; i <= 20; i++) ring(0.04, 0.011, 0.45, 3.78 - i * 0.072, -1.2, STEEL, i % 2 === 0 ? "z" : "x");

  // Hanging hazard sign on two rods from a hinge under the runway beam.
  const sign = b.joint("sign", { parent: ROOT, at: [-0.8, 3.95, -1.2], role: "hinge" });
  box(0.8, 0.5, 0.03, -0.8, 3.22, -1.05, NAVY, { r: 0.02, bone: sign });
  label(HOOK_SIGN, -0.8, 3.22, -1.03, 0.8, 0.5, [0, 0, 1], sign);
  b.rod([-0.8, 3.95, -1.2], [-1.15, 3.47, -1.05], 0.008, { color: STEEL, bone: sign });
  b.rod([-0.8, 3.95, -1.2], [-0.45, 3.47, -1.05], 0.008, { color: STEEL, bone: sign });

  // Pallets and crates.
  pallet(-1.0, 0.35, 1.2, 1.0);
  openCrate("lidA", -1.0, FY + 0.12, 0.35, 1.2, 0.9, 1.0, 0.6);
  label(PLACARD, -0.7, 0.78, 0.856, 0.36, 0.21);
  label(PLACARD, -1.606, 0.6, 0.35, 0.36, 0.21, [-1, 0, 0]);
  label(PLACARD, -1.0, 0.7, -0.156, 0.36, 0.21, [0, 0, -1]);

  pallet(-1.15, -0.75, 0.8, 0.8);
  crate(-1.15, FY + 0.12, -0.75, 0.7, 0.6, 0.7, 0.35);
  strap(-1.15, 0.7, -0.75, 0.7, 0.7);
  label(PLACARD, -1.15, 0.55, -0.394, 0.26, 0.152);
  crate(-1.2, 0.8, -0.8, 0.5, 0.45, 0.5, 0.25);
  label(PLACARD, -1.2, 1.1, -0.544, 0.2, 0.117);

  pallet(0.85, 0.35, 1.2, 1.0);
  crate(0.85, FY + 0.12, 0.35, 1.1, 0.85, 1.0, 0.55);
  strap(0.85, 0.62, 0.35, 1.1, 1.0);
  label(PLACARD, 0.55, 0.83, 0.856, 0.36, 0.21);
  label(PLACARD, 1.406, 0.6, 0.35, 0.36, 0.21, [1, 0, 0]);
  label(PLACARD, 0.85, 0.8, -0.156, 0.36, 0.21, [0, 0, -1]);
  crate(0.7, 1.05, 0.25, 0.6, 0.45, 0.55, 0.3);
  label(PLACARD, 0.7, 1.36, 0.532, 0.22, 0.128);
  pallet(0.7, 1.3, 0.8, 0.8);
  pallet(0.7, 1.3, 0.8, 0.8, FY + 0.12);

  // Drums: two upright with decals, one thrown on its side.
  for (const [x, z] of [
    [1.55, -0.6],
    [0.9, -0.62],
  ] as const) {
    const drum = b.lathe(DRUM, { at: [x, FY, z], bone: ROOT, smoothing: 1, segments: 16, color: NAVY });
    ring(0.302, 0.014, x, FY + 0.18, z, ORANGE, "y");
    ring(0.302, 0.014, x, FY + 0.72, z, ORANGE, "y");
    cyl(0.22, 0.22, 0.02, x, FY + 0.89, z, CHAR);
    ring(0.27, 0.018, x, FY + 0.885, z, CHAR, "y");
    b.decal(drum, DRUM_LABEL, { at: [x, FY + 0.45, z + 0.31], dir: [0, 0, 1], size: [0.26, 0.21] });
  }
  b.lathe(DRUM, { at: [-0.05, FY + 0.3, -1.35], axis: [0, 0, 1], bone: ROOT, smoothing: 1, segments: 16, color: NAVY });
  ring(0.302, 0.014, -0.05, FY + 0.3, -1.35 + 0.18, ORANGE, "z");
  ring(0.302, 0.014, -0.05, FY + 0.3, -1.35 + 0.72, ORANGE, "z");

  // Traffic cones and a loose tyre with a cable run.
  for (const [x, z] of [
    [1.72, 1.25],
    [1.4, 1.62],
  ]) {
    box(0.36, 0.02, 0.36, x, FY + 0.01, z, CHAR, { r: 0.006 });
    cyl(0.025, 0.17, 0.5, x, FY + 0.25, z, ORANGE);
    cyl(0.09, 0.09, 0.07, x, FY + 0.3, z, HULL);
  }
  ring(0.2, 0.07, -1.7, FY + 0.07, 1.35, TIRE, "y");
  ring(0.13, 0.012, -1.7, FY + 0.075, 1.35, ORANGE, "y");
  b.sweep(
    catmull([
      [-1.4, FY + 0.012, 1.2],
      [-1.3, FY + 0.012, 1.5],
      [-1.0, FY + 0.012, 1.85],
      [-0.6, FY + 0.012, 1.95],
    ]),
    0.012,
    { color: CHAR },
  );

  // Pallet jack parked on the floor: forks, heel pump, casters, tiller handle.
  const jx = -0.07;
  for (const s of [-1, 1]) box(0.1, 0.05, 1.1, jx + s * 0.2, FY + 0.045, 1.0, CHAR, { r: 0.012 });
  box(0.36, 0.24, 0.22, jx, FY + 0.14, 1.5, NAVY, { r: 0.03 });
  box(0.2, 0.03, 0.2, jx, FY + 0.275, 1.5, CHAR, { r: 0.01 });
  for (const s of [-1, 1]) cyl(0.035, 0.035, 0.04, jx + s * 0.14, FY + 0.035, 1.5, TIRE, "x");
  for (const s of [-1, 1]) cyl(0.04, 0.04, 0.05, jx + s * 0.2, FY + 0.04, 0.5, TIRE, "x");
  label(JACK_TAG, jx + 0.184, FY + 0.14, 1.5, 0.14, 0.07, [1, 0, 0]);
  const tiller = b.joint("tiller", { parent: ROOT, at: [jx, FY + 0.28, 1.58], role: "hinge" });
  b.sweep(
    catmull([
      [jx, FY + 0.28, 1.58],
      [jx, FY + 0.52, 1.64],
      [jx, FY + 0.8, 1.74],
      [jx, FY + 1.02, 1.84],
    ]),
    [0.022, 0.018],
    { color: CHAR, bone: tiller },
  );
  b.capsule([jx, FY + 0.9, 1.78], [jx, FY + 1.08, 1.87], 0.032, { color: ORANGE, bone: tiller });

  return b.root;
}
