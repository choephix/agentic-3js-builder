import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Duskwatch Station",
  "description": "A stylized arctic research outpost at dusk: an amber-windowed hut on stilts, an elevated boardwalk, a radar tower and a lattice antenna mast, all in flat Firewatch colour."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  snow: "#eef3f6",
  snowShade: "#cddbe6",
  ice: "#9fb8cc",
  wood: "#c9713d",
  woodDark: "#8a4526",
  plank: "#e0a266",
  roof: "#3e4a5e",
  roofTrim: "#e8b34a",
  door: "#2f6d6a",
  trimTeal: "#3f8f8a",
  metal: "#7d8896",
  metalDark: "#39414e",
  windowGlow: "#ffd27d",
  beaconRed: "#d94a3a",
  flagRed: "#d95d39",
  flagCream: "#f2ede2",
  ink: "#241b2e",
};
const M = {
  snowTop: [0, 0.45, 0] as [number, number, number],
  hutFloor: [-1.2, 1.05, -0.5] as [number, number, number],
  hutDoor: [-1.2, 1.05, 0.65] as [number, number, number],
  walkDeck: [-1.2, 1.05, 1.55] as [number, number, number],
  towerBase: [1.5, 0.45, -0.3] as [number, number, number],
  roofRidge: [-1.2, 2.5, -0.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // snowBase
  (() => {
function buildSnowBase({ b, J, P, M }: Ctx) {
  const bone = J.site;
  const r = rng(11);
  const TOP = M.snowTop[1]; // 0.45

  // Place a box by min/max corners.
  const slab = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string, tilt?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      bone,
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      rotation: tilt,
      flat: true,
    });

  // Cut-face core: wide, cliffy shade body from y=0 up to just under the top.
  slab(-2.1, 0, -2.5, 2.1, TOP - 0.06, 2.5, P.snowShade);
  // Stepped lower tiers give the blocky irregular outline
  slab(-2.2, 0, -1.6, -2.05, 0.3, 1.2, P.snowShade);
  slab(2.05, 0, -2.0, 2.2, 0.32, 1.8, P.snowShade);
  slab(-1.4, 0, 2.45, 1.6, 0.28, 2.6, P.snowShade);
  slab(-1.0, 0, -2.6, 1.2, 0.3, -2.45, P.snowShade);

  // Flat snow top at y = 0.45 (thin slabs, top face exactly at TOP)
  slab(-2.1, TOP - 0.08, -2.5, 2.1, TOP, 2.5, P.snow);
  slab(-2.2, TOP - 0.2, -1.4, -2.0, TOP - 0.02, 1.0, P.snow);
  slab(2.0, TOP - 0.2, -1.8, 2.2, TOP - 0.02, 1.5, P.snow);
  slab(-1.2, TOP - 0.2, 2.5, 1.3, TOP - 0.02, 2.6, P.snow);

  // Drift lip along the north (-Z) side: shaded strip with a snow cap
  slab(-2.0, TOP - 0.02, -2.5, 2.0, TOP + 0.0, -2.1, P.snowShade);
  slab(-1.9, TOP - 0.3, -2.58, 1.6, TOP - 0.1, -2.5, P.snowShade);

  // Exposed ice ledges, angled
  slab(-0.9, 0.12, 2.5, 0.2, 0.34, 2.68, P.ice, [0.25, 0, 0.05]);
  slab(2.1, 0.1, -0.9, 2.28, 0.34, 0.3, P.ice, [0, 0, -0.3]);
  slab(-2.28, 0.14, -2.2, -2.1, 0.36, -1.0, P.ice, [0, 0, 0.25]);
  slab(0.4, 0.05, -2.68, 1.4, 0.26, -2.5, P.ice, [-0.3, 0, 0]);

  // Packed-snow patches (thin, just above top) under landings
  const patch = (x: number, z: number, w: number, d: number) =>
    b.part(new THREE.BoxGeometry(w, 0.02, d), P.snowShade, { bone, at: [x, TOP + 0.005, z], flat: true });
  // hut stilts: 2 rows x 3
  for (const x of [-1.95, -1.2, -0.45])
    for (const z of [-1.5, 0.5]) patch(x, z, 0.3, 0.3);
  // boardwalk posts
  for (const x of [-1.6, -0.8])
    for (const z of [1.0, 1.7, 2.3]) patch(x, z, 0.22, 0.22);
  // tower feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) patch(1.5 + sx * 0.6, -0.3 + sz * 0.6, 0.36, 0.36);
  // path of trodden snow in front of the steps
  patch(-1.2, 2.9 - 0.5, 1.2, 0.3);

  // Small snow lumps (low-poly spheres) at edges
  const lumps: [number, number, number, number][] = [
    [1.6, 1.8, 0.3, 0.6],
    [-1.8, 1.9, 0.26, 0.5],
    [0.3, -2.0, 0.34, 0.6],
    [2.0, -1.9, 0.22, 0.5],
  ];
  for (const [x, z, rad, sy] of lumps) {
    b.part(new THREE.IcosahedronGeometry(rad, 0), P.snow, {
      bone,
      at: [x, TOP + rad * sy * 0.5, z],
      scale: [1, sy, 1],
      rotation: [0, r() * 90, 0],
      flat: true,
    });
  }
  // lump shadow base
  b.part(new THREE.IcosahedronGeometry(0.28, 0), P.snowShade, {
    bone,
    at: [-1.0, TOP + 0.04, -2.2],
    scale: [1.4, 0.4, 0.8],
    flat: true,
  });
}
    return buildSnowBase;
  })(),
  // mainHut
  (() => {
function buildMainHut({ b, J, P, M }: Ctx) {
  const bone = J.site;
  // box helper: center, size, color
  const box = (c: number[], s: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at: c as any, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (c: number[], r: number, h: number, color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: c as any });

  const CX = -1.2, FZ = 0.7, BZ = -1.7; // hut center x, front z, back z
  const FLOOR = M.hutFloor[1]; // 1.05
  const W = 2.0, D = 2.4; // walls width (x) 
  const wallH = 1.0;
  const cz = (FZ + BZ) / 2; // -0.5
  const depth = FZ - BZ; // 2.4 -> spec says 1.6 deep but box is 2.4; use box
  const hw = 0.95; // half width of walls

  // Stilts
  for (const sx of [-0.85, 0, 0.85])
    for (const sz of [-1.45, 0.45]) {
      cyl([CX + sx, (0.3 + FLOOR) / 2, sz], 0.07, FLOOR - 0.3 + 0.0, P.woodDark);
      box([CX + sx, 0.62, sz], [0.2, 0.06, 0.2], P.snowShade);
    }
  // floor slab + joist beams
  box([CX, FLOOR - 0.06, cz], [2.1, 0.12, depth - 0.1], P.woodDark);
  box([CX, FLOOR - 0.15, -1.45], [2.0, 0.08, 0.1], P.woodDark);
  box([CX, FLOOR - 0.15, 0.45], [2.0, 0.08, 0.1], P.woodDark);
  // skirt boards
  for (let i = 0; i < 7; i++) {
    const x = CX - 0.9 + i * 0.3;
    box([x, 0.82, FZ - 0.08], [0.27, 0.34, 0.03], P.snowShade);
  }
  box([CX, 0.82, BZ + 0.08], [2.0, 0.34, 0.03], P.snowShade);
  for (const s of [1, -1]) box([CX + s * 1.02, 0.82, cz], [0.03, 0.34, depth - 0.2], P.snowShade);

  // walls
  const wy = FLOOR + wallH / 2;
  box([CX, wy, cz], [W, wallH, depth - 0.2], P.wood);
  // plank courses on sides and back
  for (let i = 0; i < 5; i++) {
    const y = FLOOR + 0.1 + i * 0.2;
    for (const s of [1, -1]) box([CX + s * 1.005, y, cz], [0.012, 0.025, depth - 0.25], P.plank);
    box([CX, y, BZ + 0.105], [W - 0.1, 0.025, 0.012], P.plank);
    // front courses split around door/windows: left of door and right
    box([CX + 0.62, y, FZ - 0.095], [0.6, 0.025, 0.012], P.plank);
  }
  // corner boards
  for (const sx of [1, -1])
    for (const sz of [BZ + 0.1, FZ - 0.1])
      box([CX + sx * 1.02, wy, sz], [0.09, wallH + 0.02, 0.09], P.roofTrim);
  // base trim and top trim
  box([CX, FLOOR + 0.03, FZ - 0.09], [W + 0.04, 0.06, 0.04], P.woodDark);
  box([CX, FLOOR + wallH - 0.02, FZ - 0.09], [W + 0.04, 0.05, 0.04], P.roofTrim);

  // door (left side on front, viewer sees +X on right; put door at x = CX-0.55)
  const fz = FZ - 0.09;
  const dx = CX - 0.5;
  box([dx, FLOOR + 0.43, fz + 0.01], [0.62, 0.86, 0.03], P.roofTrim); // frame
  box([dx, FLOOR + 0.41, fz + 0.03], [0.5, 0.78, 0.03], P.door);
  box([dx + 0.14, FLOOR + 0.4, fz + 0.06], [0.04, 0.04, 0.03], P.roofTrim); // knob
  box([dx, FLOOR + 0.4, fz + 0.05], [0.04, 0.7, 0.012], P.trimTeal);
  // porthole
  const ph = b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), P.roofTrim, { bone, at: [dx, FLOOR + 0.62, fz + 0.065], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12), P.windowGlow, { bone, at: [dx, FLOOR + 0.62, fz + 0.08], rotation: [90, 0, 0] }), 1.2);
  // window band
  const wx = CX + 0.5;
  box([wx, FLOOR + 0.6, fz + 0.015], [1.0, 0.34, 0.03], P.roofTrim);
  for (const s of [-1, 1])
    glow(box([wx + s * 0.235, FLOOR + 0.6, fz + 0.04], [0.43, 0.26, 0.03], P.windowGlow), 1.2);
  box([wx, FLOOR + 0.6, fz + 0.065], [0.04, 0.28, 0.02], P.ink);
  box([wx, FLOOR + 0.6, fz + 0.065], [0.9, 0.025, 0.02], P.ink);
  box([wx, FLOOR + 0.5, fz + 0.06], [1.06, 0.04, 0.06], P.woodDark); // sill
  // side windows
  for (const s of [1, -1]) {
    box([CX + s * 1.0, FLOOR + 0.6, cz], [0.03, 0.32, 0.5], P.roofTrim);
    glow(box([CX + s * 1.03, FLOOR + 0.6, cz], [0.02, 0.24, 0.4], P.windowGlow), 1.2);
    box([CX + s * 1.04, FLOOR + 0.6, cz], [0.02, 0.24, 0.03], P.ink);
  }
  // emblem plate right of window band
  box([CX + 0.93, FLOOR + 0.3, fz + 0.02], [0.2, 0.2, 0.02], P.flagCream);
  const mk = (rot: number) =>
    b.part(new THREE.BoxGeometry(0.16, 0.018, 0.01), P.ink, { bone, at: [CX + 0.93, FLOOR + 0.3, fz + 0.04], rotation: [0, 0, rot] });
  [0, 60, 120].forEach(mk);
  box([CX + 0.93, FLOOR + 0.3, fz + 0.045], [0.035, 0.035, 0.01], P.beaconRed);

  // threshold step + ladder steps at door
  box([dx, FLOOR - 0.02, FZ + 0.03], [0.7, 0.05, 0.12], P.plank);
  for (const s of [-1, 1]) box([dx + s * 0.3, 0.7, FZ + 0.08], [0.05, 0.7, 0.05], P.woodDark);
  for (let i = 0; i < 4; i++) box([dx, 0.55 + i * 0.16, FZ + 0.08], [0.55, 0.04, 0.07], P.woodDark);

  // roof: gable, ridge along z
  const eaveY = FLOOR + wallH;
  const roofRise = 0.85, half = 1.2;
  const ang = Math.atan2(roofRise, half) * 180 / Math.PI;
  const slopeLen = Math.hypot(half, roofRise);
  const rlen = depth + 0.2;
  for (const s of [1, -1]) {
    const px = CX + s * (half / 2 - 0.05 * 0), py = eaveY + roofRise / 2 + 0.03;
    box([px, py, cz], [slopeLen + 0.1, 0.07, rlen], P.roof, [0, 0, -s * ang]);
    // eave trim
    box([CX + s * (half + 0.03), eaveY - 0.02, cz], [0.08, 0.06, rlen + 0.02], P.roofTrim);
    // roof battens
    for (let i = 1; i < 5; i++) {
      const t = i / 5;
      const bx = CX + s * (half * (1 - t) + 0.0), by = eaveY + roofRise * t + 0.08;
      box([bx, by, cz], [0.04, 0.025, rlen - 0.02], P.metalDark, [0, 0, -s * ang]);
    }
  }
  // ridge cap
  box([CX, eaveY + roofRise + 0.07, cz], [0.14, 0.09, rlen + 0.04], P.roofTrim);
  // gable triangles front/back (wood)
  const tri = new THREE.Shape();
  tri.moveTo(-1.0, 0); tri.lineTo(1.0, 0); tri.lineTo(0, roofRise - 0.02); tri.closePath();
  for (const [z, off] of [[FZ - 0.2, 0], [BZ + 0.2, 0]] as number[][]) {
    const g = new THREE.ExtrudeGeometry(tri, { depth: 0.1, bevelEnabled: false });
    b.part(g, P.wood, { bone, at: [CX, eaveY, z - 0.05] });
  }
  // gable vent
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), P.windowGlow, { bone, at: [CX, eaveY + 0.3, FZ - 0.08], rotation: [90, 0, 0] }), 1.2);
  b.part(new THREE.TorusGeometry(0.11, 0.025, 4, 10), P.roofTrim, { bone, at: [CX, eaveY + 0.3, FZ - 0.08] });
  // bargeboards along front/back edges
  for (const z of [FZ + 0.1, BZ - 0.1])
    for (const s of [1, -1])
      box([CX + s * (half / 2), eaveY + roofRise / 2 + 0.05, z], [slopeLen + 0.1, 0.06, 0.04], P.roofTrim, [0, 0, -s * ang]);

  // stovepipe on the right-rear slope
  const spx = CX + 0.55, spz = -1.1;
  const baseY = eaveY + roofRise * (1 - 0.55 / half) + 0.05;
  box([spx, baseY, spz], [0.26, 0.05, 0.26], P.metalDark);
  cyl([spx, baseY + 0.3, spz], 0.07, 0.6, P.metalDark);
  cyl([spx, baseY + 0.62, spz], 0.1, 0.05, P.metal, 8);
  b.part(new THREE.ConeGeometry(0.11, 0.1, 8), P.metalDark, { bone, at: [spx, baseY + 0.7, spz] });
  cyl([spx, baseY + 0.12, spz], 0.095, 0.05, P.roofTrim);
}
    return buildMainHut;
  })(),
  // boardwalk
  (() => {
function buildBoardwalk({ b, J, P, M }: Ctx) {
  const bone = J.site;
  const R = rng(11);
  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (c: string, rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });

  const cx = -1.2;
  const deckY = M.walkDeck[1]; // 1.05
  const z0 = M.hutDoor[2];
  const z1 = 2.4;
  const half = 0.45;
  const len = z1 - z0;
  const zc = (z0 + z1) / 2;

  // deck: joists, planks
  for (const s of [-1, 1]) box(P.woodDark, 0.08, 0.12, len, cx + s * (half - 0.08), deckY - 0.12, zc);
  box(P.woodDark, 0.08, 0.12, len, cx, deckY - 0.12, zc);
  const nPl = 14;
  const pl = len / nPl;
  for (let i = 0; i < nPl; i++) {
    const z = z0 + pl * (i + 0.5);
    box(i % 2 ? P.plank : "#d6934f", half * 2, 0.06, pl - 0.018, cx, deckY - 0.03, z);
  }
  // cross beams
  for (let i = 0; i < 4; i++) box(P.woodDark, half * 2 + 0.1, 0.08, 0.08, cx, deckY - 0.2, z0 + 0.1 + i * (len - 0.2) / 3);

  // landing widening
  box(P.plank, 1.3, 0.06, 0.4, cx, deckY - 0.03, 2.2);
  for (let i = 0; i < 4; i++) box(i % 2 ? P.plank : "#d6934f", 1.3, 0.062, 0.095, cx, deckY - 0.03, 2.03 + i * 0.1);
  box(P.woodDark, 1.3, 0.1, 0.06, cx, deckY - 0.1, 2.38);

  // posts
  const postZ = [0.8, 1.35, 1.9, 2.35];
  for (const s of [-1, 1]) {
    const x = cx + s * (half + 0.04);
    for (const z of postZ) {
      const top = deckY + 0.55;
      box(P.woodDark, 0.07, top - 0.45, 0.07, x, (top + 0.45) / 2, z);
      box(P.snowShade, 0.16, 0.03, 0.16, x, 0.46, z);
    }
    box(P.roofTrim, 0.07, 0.04, 1.65, x, deckY + 0.57, 1.58);
    box(P.metalDark, 0.03, 0.03, 1.6, x, deckY + 0.3, 1.58);
    // diagonal brace
    b.rod([x, deckY + 0.05, 1.9], [x, deckY + 0.5, 2.35], 0.02, P.woodDark, { bone });
  }
  // front rail across landing (partial)
  box(P.roofTrim, 0.9, 0.04, 0.05, cx, deckY + 0.57, 2.38);
  box(P.metalDark, 0.9, 0.03, 0.03, cx, deckY + 0.3, 2.38);
  // landing-side extra posts
  for (const s of [-1, 1]) {
    box(P.woodDark, 0.07, 0.6, 0.07, cx + s * 0.62, deckY + 0.25, 2.2);
  }

  // stair: two steps down on the +x side toward snow
  box(P.plank, 0.5, 0.05, 0.22, cx + 0.85, deckY - 0.2, 2.2);
  box(P.woodDark, 0.5, 0.2, 0.04, cx + 0.85, deckY - 0.33, 2.3);
  box(P.plank, 0.5, 0.05, 0.22, cx + 0.85, deckY - 0.42, 2.0 + 0.4);
  box(P.woodDark, 0.5, 0.2, 0.04, cx + 0.85, deckY - 0.52, 2.5);
  for (const s of [-1, 1]) b.rod([cx + 0.85 + s * 0.22, deckY - 0.17, 2.3], [cx + 0.85 + s * 0.22, deckY - 0.5, 2.5], 0.015, P.woodDark, { bone });

  // crates
  const crate = (x: number, y: number, z: number, s: number, rot: number) => {
    const g = new THREE.BoxGeometry(s, s, s);
    b.part(g, P.plank, { bone, at: [x, y, z], rotation: [0, rot, 0] });
    for (const d of [-1, 1]) {
      b.part(new THREE.BoxGeometry(s * 1.04, s * 0.1, s * 1.04), P.woodDark, { bone, at: [x, y + d * s * 0.32, z], rotation: [0, rot, 0] });
    }
    b.part(new THREE.BoxGeometry(s * 0.34, s * 0.34, 0.012), P.flagCream, {
      bone, at: [x + Math.sin(rot * Math.PI / 180) * s * 0.51, y, z + Math.cos(rot * Math.PI / 180) * s * 0.51], rotation: [0, rot, 0],
    });
    b.part(new THREE.BoxGeometry(s * 0.18, s * 0.06, 0.014), P.ink, {
      bone, at: [x + Math.sin(rot * Math.PI / 180) * s * 0.515, y, z + Math.cos(rot * Math.PI / 180) * s * 0.515], rotation: [0, rot, 0],
    });
  };
  crate(cx - 0.22, deckY + 0.16, 2.05, 0.32, 8);
  crate(cx - 0.2, deckY + 0.48, 2.06, 0.26, -14);
  crate(cx - 0.3, deckY + 0.13, 1.68, 0.26, 20);

  // drums
  for (const [x, z] of [[cx + 0.28, 2.18], [cx + 0.08, 1.9]]) {
    cyl(P.trimTeal, 0.12, 0.12, 0.36, x, deckY + 0.18, z, 12);
    cyl(P.beaconRed, 0.125, 0.125, 0.04, x, deckY + 0.33, z, 12);
    cyl(P.beaconRed, 0.125, 0.125, 0.03, x, deckY + 0.05, z, 12);
    cyl(P.metalDark, 0.045, 0.045, 0.02, x + 0.04, deckY + 0.375, z, 8);
  }
  // propane
  cyl(P.metal, 0.08, 0.08, 0.26, cx + 0.3, deckY + 0.13, 1.7, 10);
  b.part(new THREE.SphereGeometry(0.08, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.metal, { bone, at: [cx + 0.3, deckY + 0.26, 1.7] });
  cyl(P.beaconRed, 0.02, 0.02, 0.06, cx + 0.3, deckY + 0.34, 1.7, 6);
  box(P.beaconRed, 0.08, 0.02, 0.02, cx + 0.3, deckY + 0.37, 1.7);

  // flagpole at landing railing, left front corner
  const fx = cx - 0.5, fz = 2.38;
  cyl(P.metal, 0.015, 0.02, 1.1, fx, deckY + 0.55, fz, 6);
  box(P.metalDark, 0.07, 0.04, 0.07, fx, deckY + 0.45, fz);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.roofTrim, { bone, at: [fx, deckY + 1.12, fz] });
  const fy = deckY + 0.98;
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.34), P.flagRed, { bone, at: [fx, fy, fz + 0.2] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.34), P.flagCream, { bone, at: [fx, fy - 0.1, fz + 0.2] });
  b.part(new THREE.BoxGeometry(0.018, 0.2, 0.14), P.flagCream, { bone, at: [fx, fy - 0.05, fz + 0.45], rotation: [0, -15, 0] });
  b.part(new THREE.BoxGeometry(0.019, 0.1, 0.14), P.flagRed, { bone, at: [fx, fy, fz + 0.45], rotation: [0, -15, 0] });

  // small lamp on rail glow
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.windowGlow, { bone, at: [cx + 0.49, deckY + 0.64, 0.8] }), 1.2);
  R();
}
    return buildBoardwalk;
  })(),
  // instrumentTower
  (() => {
function buildInstrumentTower({ b, J, P, M }: Ctx) {
  const site = J.site;
  const yaw = J.radarYaw;
  const [bx, by, bz] = M.towerBase;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: string, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: site, at, ...opts });

  const topY = 2.55;
  const legR = 0.035;
  // four splayed legs
  const sx = 0.55, sz = 0.55; // foot offsets
  const tx = 0.2, tz = 0.2; // top offsets
  const feet: number[][] = [];
  const tops: number[][] = [];
  for (const sxn of [1, -1]) {
    for (const szn of [1, -1]) {
      const foot = [bx + sxn * sx, by + 0.08, bz + szn * sz];
      const top = [bx + sxn * tx, topY - 0.1, bz + szn * tz];
      feet.push(foot);
      tops.push(top);
      b.rod(foot, top, legR, P.metalDark, { bone: site, caps: "flat" });
      // ice footpad
      b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 6), P.ice, {
        bone: site,
        at: [foot[0], by + 0.04, foot[2]],
      });
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.1), P.metalDark, {
        bone: site,
        at: [foot[0], by + 0.095, foot[2]],
      });
    }
  }
  // cross-bracing: horizontal rings and X braces at levels
  const lerp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);
  const level = (t: number) => feet.map((f, i) => lerp(f, tops[i], t));
  const pairs = [[0, 1], [1, 3], [3, 2], [2, 0]];
  for (const t of [0.3, 0.62, 0.95]) {
    const L = level(t);
    for (const [i, j] of pairs) b.rod(L[i], L[j], 0.016, P.metalDark, { bone: site, caps: "flat" });
  }
  for (const [t0, t1] of [[0.0, 0.3], [0.3, 0.62], [0.62, 0.95]]) {
    const A = level(t0), B = level(t1);
    for (const [i, j] of pairs) {
      b.rod(A[i], B[j], 0.012, P.metalDark, { bone: site, caps: "flat" });
    }
  }
  // top platform
  box(0.55, 0.06, 0.55, P.metalDark, [bx, topY - 0.07, bz]);
  box(0.6, 0.02, 0.6, P.metal, [bx, topY - 0.03, bz]);

  // ladder on one leg (front-left, +x +z side)
  const lf = feet[0], lt = tops[0];
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1;
    const p = lerp(lf, lt, t);
    b.rod([p[0] - 0.09, p[1], p[2] + 0.04], [p[0] + 0.09, p[1], p[2] + 0.04], 0.009, P.roofTrim, {
      bone: site,
      caps: "flat",
    });
  }

  // instrument shelter box mid-height
  const sy = 1.35;
  box(0.5, 0.42, 0.4, P.metal, [bx, sy, bz]);
  box(0.54, 0.05, 0.44, P.metalDark, [bx, sy + 0.235, bz]); // roof
  box(0.52, 0.045, 0.42, P.roofTrim, [bx, sy + 0.1, bz], {}); // trim band
  box(0.5, 0.045, 0.4, P.roofTrim, [bx, sy - 0.18, bz]);
  // door on +Z face
  box(0.22, 0.3, 0.012, P.door, [bx - 0.08, sy - 0.02, bz + 0.206]);
  box(0.25, 0.33, 0.008, P.ink, [bx - 0.08, sy - 0.02, bz + 0.2]);
  b.part(new THREE.SphereGeometry(0.014, 6, 4), P.roofTrim, { bone: site, at: [bx - 0.0, sy - 0.02, bz + 0.216] });
  // vents / louvres on side
  for (let i = 0; i < 4; i++)
    box(0.012, 0.015, 0.2, P.metalDark, [bx + 0.256, sy - 0.1 + i * 0.07, bz]);
  // blinking marker light on roof
  const lamp = b.part(new THREE.SphereGeometry(0.035, 8, 6), P.beaconRed, {
    bone: site,
    at: [bx + 0.15, sy + 0.29, bz - 0.1],
  });
  glow(lamp, 1.4);
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.03, 8), P.metalDark, {
    bone: site,
    at: [bx + 0.15, sy + 0.275, bz - 0.1],
  });

  // yoke (rigid on site) : two arms + base
  const yokeY = topY;
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 8), P.metalDark, { bone: site, at: [bx, yokeY + 0.03, bz] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8), P.metal, { bone: site, at: [bx, yokeY + 0.1, bz] });

  // everything on radarYaw: pivot at (bx, 2.55, bz)
  const py = yaw.at.y;
  const px = yaw.at.x;
  const pz = yaw.at.z;
  const Y = (v: number) => py + v;
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8), P.metalDark, { bone: yaw, at: [px, Y(0.16), pz] });
  // yoke arms
  for (const s of [1, -1]) {
    box(0.04, 0.34, 0.06, P.metalDark, [px + s * 0.27, Y(0.36), pz], { bone: yaw });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), P.metal, {
      bone: yaw,
      at: [px + s * 0.27, Y(0.42), pz],
      dir: [1, 0, 0],
    });
  }
  box(0.58, 0.04, 0.08, P.metalDark, [px, Y(0.2), pz], { bone: yaw });

  // dish: lathe, faces +Z, tilted up
  const dishC = [px, Y(0.45), pz + 0.02];
  const dishDir = new THREE.Vector3(0, 0.35, 1).normalize();
  const dishOutline: [number, number][] = [
    [0, 0],
    [0.12, 0.012],
    [0.24, 0.045],
    [0.34, 0.1],
    [0.34, 0.115],
    [0.24, 0.062],
    [0.12, 0.03],
    [0, 0.02],
  ];
  b.lathe(dishOutline, { at: dishC, axis: dishDir.toArray() as number[], segments: 16, bone: yaw, color: P.metal });
  // snowShade back
  b.part(new THREE.CylinderGeometry(0.1, 0.03, 0.1, 8), P.snowShade, {
    bone: yaw,
    at: [dishC[0] - dishDir.x * 0.05, dishC[1] - dishDir.y * 0.05, dishC[2] - dishDir.z * 0.05],
    dir: dishDir.toArray(),
  });
  b.part(new THREE.CylinderGeometry(0.2, 0.12, 0.03, 12), P.snowShade, {
    bone: yaw,
    at: [dishC[0] - dishDir.x * 0.01, dishC[1] - dishDir.y * 0.01, dishC[2] - dishDir.z * 0.01],
    dir: dishDir.toArray(),
  });
  // rim ring trim
  b.part(new THREE.TorusGeometry(0.335, 0.012, 4, 16), P.roofTrim, {
    bone: yaw,
    at: [dishC[0] + dishDir.x * 0.105, dishC[1] + dishDir.y * 0.105, dishC[2] + dishDir.z * 0.105],
    dir: dishDir.toArray(),
    axis: "z",
  });
  // feed horn + struts
  const horn = [dishC[0] + dishDir.x * 0.3, dishC[1] + dishDir.y * 0.3, dishC[2] + dishDir.z * 0.3];
  b.spike(
    [horn[0] - dishDir.x * 0.1, horn[1] - dishDir.y * 0.1, horn[2] - dishDir.z * 0.1],
    dishDir.toArray(),
    0.16,
    0.04,
    { bone: yaw, color: P.metalDark },
  );
  for (const [ox, oy] of [[0.25, 0], [-0.25, 0], [0, 0.22]]) {
    b.rod(
      [dishC[0] + ox, dishC[1] + oy + 0.05, dishC[2] + 0.1],
      [horn[0] - dishDir.x * 0.06, horn[1] - dishDir.y * 0.06, horn[2] - dishDir.z * 0.06],
      0.006,
      P.metalDark,
      { bone: yaw, caps: "flat" },
    );
  }

  // whip antenna above dish
  const wx = px + 0.1, wz = pz - 0.08;
  b.rod([wx, Y(0.2), wz], [wx, Y(0.88), wz], [0.012, 0.005], P.metal, { bone: yaw, caps: "flat" });
  const tip = b.part(new THREE.SphereGeometry(0.03, 8, 6), P.beaconRed, { bone: yaw, at: [wx, Y(0.9), wz] });
  glow(tip, 1.5);
  b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 6), P.metalDark, { bone: yaw, at: [wx, Y(0.24), wz] });

  // weather vane
  const vx = px - 0.22, vz = pz - 0.12;
  b.rod([vx, Y(0.2), vz], [vx, Y(0.6), vz], 0.01, P.beaconRed, { bone: yaw, caps: "flat" });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), P.beaconRed, { bone: yaw, at: [vx, Y(0.6), vz] });
  b.extrude(
    [
      [-0.2, -0.015],
      [0.1, -0.015],
      [0.1, -0.05],
      [0.22, 0],
      [0.1, 0.05],
      [0.1, 0.015],
      [-0.2, 0.015],
      [-0.24, 0.07],
      [-0.28, 0.07],
      [-0.26, 0],
      [-0.28, -0.07],
      [-0.24, -0.07],
    ].map(([x, y]) => [x, y] as [number, number]),
    { at: [vx, Y(0.64), vz], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bone: yaw, color: P.metalDark },
  );
  void R;
  void frame;
}
    return buildInstrumentTower;
  })(),
  // antennaMast
  (() => {
function buildAntennaMast({ b, J, P, M }: Ctx) {
  const bone = J.site;
  const R = rng(11);
  const base = M.roofRidge;
  const bx = base[0], by = base[1], bz = base[2];
  const H = 2.0;

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone, at, ...extra });

  // Mast geometry: triangular lattice tapering with height
  const radiusAt = (y: number) => 0.2 - 0.09 * (y / H);
  const ang = [90, 210, 330].map((d) => (d * Math.PI) / 180);
  const corner = (i: number, y: number): number[] => {
    const r = radiusAt(y);
    return [bx + Math.cos(ang[i]) * r, by + y, bz + Math.sin(ang[i]) * r];
  };

  // Base collar (amber) and plate
  put(new THREE.CylinderGeometry(0.27, 0.3, 0.08, 6), P.roofTrim, [bx, by + 0.04, bz]);
  put(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 6), P.woodDark, [bx, by + 0.11, bz]);

  // Corner rods
  for (let i = 0; i < 3; i++) {
    b.rod(corner(i, 0.1), corner(i, H), 0.018, P.metalDark, { bone, sides: 6 });
  }

  // Cross braces at levels, plus diagonals
  const levels = [0.1, 0.7, 1.3, 1.9];
  levels.forEach((y, li) => {
    if (li > 0) {
      for (let i = 0; i < 3; i++) {
        b.rod(corner(i, y), corner((i + 1) % 3, y), 0.012, P.metal, { bone, sides: 5 });
      }
    }
    if (li < levels.length - 1) {
      const y2 = levels[li + 1];
      for (let i = 0; i < 3; i++) {
        const j = (i + (li % 2 ? 2 : 1)) % 3;
        b.rod(corner(i, y), corner(j, y2), 0.01, P.metal, { bone, sides: 5 });
      }
    }
  });
  // joint bolts at corners of levels
  levels.forEach((y) => {
    for (let i = 0; i < 3; i++) {
      put(new THREE.SphereGeometry(0.024, 6, 4), P.metal, corner(i, y));
    }
  });

  // Top head
  const topY = by + H;
  put(new THREE.CylinderGeometry(0.05, 0.075, 0.1, 6), P.metalDark, [bx, topY + 0.03, bz]);
  // central top pole
  b.rod([bx, topY, bz], [bx, topY + 0.38, bz], 0.014, P.metal, { bone, sides: 6 });

  // Crossbars with insulator beads
  const bars: [number, number, number][] = [
    [topY + 0.1, 0.34, 0],
    [topY + 0.26, 0.24, 90],
  ];
  bars.forEach(([y, len, rotDeg]) => {
    const rad = (rotDeg * Math.PI) / 180;
    const dx = Math.cos(rad) * len / 2, dz = Math.sin(rad) * len / 2;
    b.rod([bx - dx, y, bz - dz], [bx + dx, y, bz + dz], 0.012, P.metalDark, { bone, sides: 5 });
    for (const s of [-1, 1]) {
      const ex = bx + s * dx, ez = bz + s * dz;
      put(new THREE.SphereGeometry(0.03, 6, 4), P.flagCream, [ex, y, ez], { scale: [1, 1.3, 1] });
      put(new THREE.SphereGeometry(0.03, 6, 4), P.flagCream, [bx + s * dx * 0.7, y, bz + s * dz * 0.7], { scale: [0.8, 1, 0.8] });
    }
  });

  // Small dish angled to the sky, mounted on a side arm toward +Z
  const dishC = [bx, topY - 0.22, bz + 0.2];
  b.rod([bx, topY - 0.22, bz + 0.02], dishC, 0.016, P.metalDark, { bone, sides: 5 });
  const tilt = new THREE.Vector3(0, 0.8, 0.6).normalize(); // dish axis, skyward and slightly forward
  const dishQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tilt);
  const dishAt = (d: number) => new THREE.Vector3(...dishC).addScaledVector(tilt, d).toArray();
  b.lathe(
    [[0, 0], [0.13, 0.05], [0.14, 0.065], [0.125, 0.07], [0.0, 0.025]],
    { at: dishC, axis: tilt.toArray(), bone, color: P.metal, segments: 10 },
  );
  b.lathe(
    [[0, -0.012], [0.12, 0.035], [0.13, 0.05], [0.0, -0.004]],
    { at: dishC, axis: tilt.toArray(), bone, color: P.snowShade, segments: 10 },
  );
  // feed horn
  b.spike(dishAt(0.02), tilt.toArray(), 0.16, 0.014, { bone, color: P.metalDark });
  // snow cap on the rim (upper edge of the dish)
  const rimUp = new THREE.Vector3(0, 0, 1).cross(tilt).cross(tilt).negate();
  const sideVec = new THREE.Vector3(1, 0, 0);
  const rimTop = new THREE.Vector3(...dishC).addScaledVector(tilt, 0.068).addScaledVector(new THREE.Vector3(0, 1, 0).sub(tilt.clone().multiplyScalar(tilt.y)).normalize(), 0.135);
  put(new THREE.SphereGeometry(0.05, 6, 4), P.snowShade, rimTop.toArray(), { scale: [1.5, 0.45, 0.8] });
  put(new THREE.SphereGeometry(0.035, 6, 4), P.snow, rimTop.clone().add(new THREE.Vector3(0.02, 0.012, 0)).toArray(), { scale: [1.3, 0.5, 0.8] });

  // Beacon on tip
  const tipY = topY + 0.4;
  put(new THREE.CylinderGeometry(0.03, 0.025, 0.03, 6), P.metalDark, [bx, tipY - 0.01, bz]);
  glow(put(new THREE.SphereGeometry(0.055, 8, 6), P.beaconRed, [bx, tipY + 0.04, bz]), 1.5);

  // Guy wires to roof anchors
  const anchors: number[][] = [
    [bx - 0.5, by - 0.2, bz + 0.38],
    [bx + 0.5, by - 0.2, bz + 0.38],
    [bx, by - 0.2, bz - 0.5],
  ];
  anchors.forEach((a, i) => {
    const top = corner(i === 2 ? 0 : i === 0 ? 1 : 2, 1.6);
    const ax = a[0], az = a[2];
    put(new THREE.BoxGeometry(0.12, 0.03, 0.12), P.metalDark, [ax, a[1] + 0.015, az]);
    put(new THREE.TorusGeometry(0.025, 0.007, 4, 8), P.metal, [ax, a[1] + 0.045, az], { rotation: [90, 0, 0] });
    b.rod([ax, a[1] + 0.05, az], [top[0], top[1], top[2]], 0.006, P.ink, { bone, sides: 4 });
    // turnbuckle bead partway
    const t = 0.25;
    put(new THREE.BoxGeometry(0.02, 0.05, 0.02), P.metal, [
      ax + (top[0] - ax) * t,
      a[1] + 0.05 + (top[1] - a[1] - 0.05) * t,
      az + (top[2] - az) * t,
    ], { scale: [1, 1, 1] });
  });

  // little rung on mast for detail: tiny plate with ink mark
  put(new THREE.BoxGeometry(0.06, 0.04, 0.005), P.roofTrim, [bx, by + 0.45, bz + radiusAt(0.45) * 0.5 + 0.02]);
  void R; void frame;
}
    return buildAntennaMast;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "arcticOutpost" });
  const J: Record<string, Joint> = {};
  J["site"] = b.joint("site", { at: [0,0,0], dir: [0,1,0], role: "spine" });
  J["radarYaw"] = b.joint("radarYaw", { parent: J["site"], at: [1.5,2.55,-0.3], dir: [0,1,0], role: "hinge", group: "radar" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
