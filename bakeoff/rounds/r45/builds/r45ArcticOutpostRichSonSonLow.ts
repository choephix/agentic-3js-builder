import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Polar Dusk Outpost",
  "description": "A Firewatch-style diorama of a red-timbered arctic research station on stilts, with a radome, wind turbine, weather mast and a snowmobile yard, under a flat layered sunset of purple ridges and a huge orange sun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skyTop: "#2b1d4a",
  skyMid: "#8a3b6e",
  skyGlow: "#e8604c",
  sunOrange: "#ff9a3c",
  sunYellow: "#ffd37a",
  ridgeFar: "#c4506a",
  ridgeMid: "#7a3a6a",
  ridgeNear: "#3e2a5c",
  snowLit: "#fbe3d4",
  snowShadow: "#b9a3c9",
  snowDeep: "#8b7bb0",
  iceBlue: "#7fc4d9",
  iceDark: "#3f7f9c",
  rock: "#5a4258",
  cabinRed: "#c8402f",
  cabinDark: "#8f2b2a",
  trimCream: "#f4d9a8",
  wood: "#7a4a32",
  woodDark: "#4a2c26",
  roofDark: "#3a2a40",
  windowGlow: "#ffc65a",
  metal: "#6b6275",
  metalLight: "#a89bb0",
  ink: "#261a2e",
};
const M = {
  ground: [0, 0.4, 0] as [number, number, number],
  cabinCenter: [0, 0.95, 0.25] as [number, number, number],
  cabinDeck: [0, 0.95, 0.25] as [number, number, number],
  porchEdge: [0.6, 0.95, 1.9] as [number, number, number],
  doorCenter: [0.6, 1.65, 0.7] as [number, number, number],
  stairFoot: [0.6, 0.4, 2.7] as [number, number, number],
  roofRidge: [0, 3, -0.35] as [number, number, number],
  chimneyTop: [-1, 3.5, -0.6] as [number, number, number],
  radomeBase: [-2.3, 0.4, -2.3] as [number, number, number],
  turbineBase: [2.4, 0.4, -2.2] as [number, number, number],
  turbineHub: [2.4, 3.4, -1.95] as [number, number, number],
  mastBase: [0.2, 0.4, -2.4] as [number, number, number],
  mastTop: [0.2, 4.5, -2.4] as [number, number, number],
  snowmobilePad: [-2.6, 0.4, 0.6] as [number, number, number],
  cratePad: [2.6, 0.4, 0.3] as [number, number, number],
  flagPad: [-0.9, 0.4, 3] as [number, number, number],
  tentPad: [-2.3, 0.4, 2.7] as [number, number, number],
  pondCenter: [2.35, 0.4, 2.55] as [number, number, number],
  backdropFront: [0, 0.4, -2.95] as [number, number, number],
  sunCenter: [1.2, 3.3, -3.45] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // snowBase
  (() => {
function buildSnowBase({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });

  // plinth
  box(7.2, 0.36, 7.2, P.snowDeep, 0, 0.18, 0);
  box(7.2, 0.04, 7.2, P.ink, 0, 0.02, 0);
  box(7.2, 0.1, 7.2, P.snowShadow, 0, 0.35, 0);
  // strata lines on sides
  for (const y of [0.14, 0.26]) {
    box(7.22, 0.018, 7.22 - 0.0, P.iceBlue, 0, y, 0).scale.set(1, 1, 0.9999);
  }
  // top slab
  box(7.2, 0.05, 7.2, P.snowLit, 0, 0.375, 0);
  // fix strata so they read: shallow slices
  for (const [x, z, w] of [[-1.5, 3.605, 1.6], [1.8, 3.605, 1.2], [3.605, -1, 1.4]] as number[][]) {
    if (x > 3) box(0.01, 0.03, w, P.iceBlue, x, 0.2, z);
    else box(w, 0.03, 0.01, P.iceBlue, x, 0.2, z);
  }

  // drifts (away from cabin)
  const drifts: [number, number, number, number][] = [
    [-3.0, 1.9, 0.7, 0.3], [3.0, -0.8, 0.6, 0.4], [-3.0, -1.6, 0.8, 0.3],
    [0.2, 3.2, 0.5, 0.5], [3.0, -2.5, 0.5, 0.3], [-1.6, 3.2, 0.5, 0.3],
  ];
  for (const [x, z, r, s] of drifts) {
    const g = new THREE.CylinderGeometry(r * 0.7, r, 0.07, 7);
    b.part(g, P.snowShadow, { bone, at: [x + 0.06, 0.41, z + 0.05], flat: true });
    b.part(new THREE.CylinderGeometry(r * 0.5, r * 0.75, 0.06, 7), P.snowLit, { bone, at: [x, 0.43, z], flat: true });
  }

  // pond
  const [px, , pz] = M.pondCenter;
  cyl(0.88, 0.9, 0.04, 14, P.iceDark, px, 0.405, pz);
  cyl(0.78, 0.78, 0.04, 14, P.iceBlue, px, 0.415, pz);
  for (const [dx, dz, w, a] of [[-0.2, 0.1, 0.9, 20], [0.2, -0.3, 0.6, -50], [0.3, 0.35, 0.5, 70]] as number[][])
    box(w, 0.01, 0.025, P.trimCream, px + dx, 0.438, pz + dz, a * Math.PI / 180);
  cyl(0.12, 0.12, 0.02, 10, P.iceDark, px - 0.25, 0.44, pz - 0.3);
  cyl(0.08, 0.08, 0.02, 10, P.ink, px - 0.25, 0.45, pz - 0.3);

  // path stairFoot to front edge
  const [sx, , sz] = M.stairFoot;
  for (let i = 0; i < 4; i++) box(0.5, 0.02, 0.28, P.snowShadow, sx + (i % 2) * 0.05, 0.405, sz + 0.15 + i * 0.2);
  for (let i = 0; i < 5; i++) {
    const s = i % 2 ? 1 : -1;
    const f = b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 8), P.snowDeep, { bone, at: [sx + s * 0.12, 0.42, sz + 0.05 + i * 0.17] });
    f.mesh.scale.set(1, 1, 1.6);
  }
  // sled tracks to snowmobile pad
  const [tx, , tz] = M.snowmobilePad;
  for (const dx of [-0.2, 0.2]) {
    box(0.04, 0.012, 2.4, P.snowDeep, tx + dx, 0.41, tz + 1.2 + 0.9 * 0, 0);
    box(0.04, 0.012, 1.6, P.snowDeep, tx + dx - 0.1, 0.41, tz - 1.6);
  }

  // rocks
  const rocks: [number, number, number][] = [[-3.2, 3.2, 0.3], [3.3, 3.3, 0.25], [-3.3, -2.0, 0.28], [3.3, -3.0, 0.3], [-0.3, 3.4, 0.18]];
  for (const [x, z, r] of rocks) {
    b.part(new THREE.DodecahedronGeometry(r, 0), P.rock, { bone, at: [x, 0.42 + r * 0.4, z], rotation: [R() * 40, R() * 90, 0], flat: true });
    b.part(new THREE.ConeGeometry(r * 0.6, r * 0.35, 5), P.snowLit, { bone, at: [x, 0.42 + r * 0.95, z], flat: true });
  }

  // ice crystals
  for (const [x, z] of [[-3.1, 0.3], [1.0, 3.35], [3.35, 1.0]]) {
    b.part(new THREE.ConeGeometry(0.07, 0.3, 5), P.iceBlue, { bone, at: [x, 0.55, z], flat: true });
    b.part(new THREE.ConeGeometry(0.05, 0.2, 5), P.iceDark, { bone, at: [x + 0.1, 0.5, z + 0.05], rotation: [0, 0, 12], flat: true });
  }
}
    return buildSnowBase;
  })(),
  // mainCabin
  (() => {
function buildMainCabin({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const R = rng(5);
  // box helper: center x,y,z, size w,h,d
  const box = (c: number[], s: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c, ...(rot ? { rotation: rot } : {}) });
  const cyl = (c: number[], r: number, h: number, col: string, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at: c, ...(rot ? { rotation: rot } : {}) });
  const g = (p: any, s = 1) => glow(p, s);

  const G = 0.4, DECK = 0.95;
  // stilts: 4 x 2
  for (const x of [-1.6, -0.55, 0.55, 1.6]) for (const z of [-1.1, 0.5]) {
    box([x, (G + DECK) / 2, z], [0.14, DECK - G, 0.14], R() > 0.5 ? P.wood : P.woodDark);
    box([x, G + 0.03, z], [0.34, 0.07, 0.34], P.snowLit);
    box([x, G + 0.01, z], [0.4, 0.03, 0.4], P.snowShadow);
  }
  // cross braces
  for (const z of [-1.1, 0.5]) for (const x of [-1.075, 0, 1.075]) {
    const a = x === 0 ? 1.1 : 1.05;
    box([x, 0.67, z + 0.09], [a, 0.06, 0.04], P.woodDark, [0, 0, x === 0 ? 0.4 : -0.4]);
  }
  // deck
  box([0, DECK - 0.06, -0.3], [3.8, 0.12, 2.1], P.woodDark);
  box([0, DECK - 0.14, -0.3], [3.9, 0.04, 2.2], P.ink);
  // walls
  box([0, 1.65, -0.3], [3.4, 1.4, 2.0], P.cabinRed);
  // plank seams on front/back
  for (let i = 0; i < 7; i++) {
    const y = 1.05 + i * 0.2;
    box([0, y + 0.1, 0.705], [3.4, 0.025, 0.012], P.cabinDark);
    box([0, y + 0.1, -1.305], [3.4, 0.025, 0.012], P.cabinDark);
  }
  // corner posts
  for (const x of [-1.72, 1.72]) for (const z of [-1.32, 0.72]) box([x, 1.65, z], [0.1, 1.44, 0.1], P.cabinDark);
  // eave shadow band
  box([0, 2.3, 0.72], [3.5, 0.08, 0.04], P.ink);
  // windows
  const win = (c: number[], face: "f" | "s", w = 0.5, h = 0.5) => {
    const d = face === "f" ? [w, h] : [0.0, h];
    const sz = face === "f" ? [w + 0.14, h + 0.14, 0.05] : [0.05, h + 0.14, w + 0.14];
    box(c, sz, P.trimCream);
    const o = face === "f" ? [0, 0, 0.02] : [0.02 * Math.sign(c[0]), 0, 0];
    const psz = face === "f" ? [w, h, 0.05] : [0.05, h, w];
    g(box([c[0] + o[0], c[1], c[2] + o[2]], psz, P.windowGlow));
    const msz1 = face === "f" ? [w, 0.03, 0.06] : [0.06, 0.03, w];
    const msz2 = face === "f" ? [0.03, h, 0.06] : [0.06, h, 0.03];
    const k = face === "f" ? [0, 0, 0.03] : [0.03 * Math.sign(c[0]), 0, 0];
    box([c[0] + k[0], c[1], c[2] + k[2]], msz1, P.trimCream);
    box([c[0] + k[0], c[1], c[2] + k[2]], msz2, P.trimCream);
    // awning
    const asz = face === "f" ? [w + 0.3, 0.05, 0.22] : [0.22, 0.05, w + 0.3];
    const ao = face === "f" ? [0, h / 2 + 0.12, 0.12] : [0.12 * Math.sign(c[0]), h / 2 + 0.12, 0];
    box([c[0] + ao[0], c[1] + ao[1], c[2] + ao[2]], asz, P.roofDark);
  };
  win([-1.2, 1.7, 0.73], "f"); win([0, 1.7, 0.73], "f"); // third front window beside door
  win([1.3, 1.9, 0.73], "f", 0.4, 0.4);
  for (const z of [-0.8, 0.2]) { win([1.73, 1.7, z], "s"); win([-1.73, 1.7, z], "s"); }
  for (const x of [-0.9, 0.9]) win([x, 1.7, -1.33], "f");
  // porch deck
  box([0.65, DECK - 0.06, 1.3], [1.7, 0.12, 1.2], P.wood);
  box([0.65, DECK - 0.14, 1.3], [1.75, 0.04, 1.25], P.ink);
  for (const x of [-0.15, 1.45]) box([x, 0.65, 1.8], [0.12, 0.5, 0.12], P.woodDark);
  // railing
  const post = (x: number, z: number) => box([x, 1.25, z], [0.08, 0.6, 0.08], P.wood);
  for (const x of [-0.2, 1.5]) for (const z of [0.8, 1.9]) post(x, z);
  box([-0.2, 1.52, 1.35], [0.07, 0.07, 1.1], P.wood);
  box([1.5, 1.52, 1.35], [0.07, 0.07, 1.1], P.wood);
  box([0.65, 1.52, 1.9], [0.37, 0.07, 0.07], P.wood);
  box([-0.2, 1.3, 1.35], [0.04, 0.04, 1.1], P.woodDark);
  box([1.5, 1.3, 1.35], [0.04, 0.04, 1.1], P.woodDark);
  // door
  box([0.6, 1.65, 0.72], [0.8, 1.3, 0.05], P.trimCream);
  box([0.6, 1.62, 0.76], [0.66, 1.2, 0.04], P.wood);
  for (const x of [0.45, 0.6, 0.75]) box([x, 1.5, 0.785], [0.012, 1.0, 0.01], P.woodDark);
  cyl([0.6, 1.95, 0.8], 0.14, 0.03, P.trimCream, 10, [90, 0, 0]);
  g(cyl([0.6, 1.95, 0.82], 0.1, 0.03, P.windowGlow, 10, [90, 0, 0]));
  box([0.93, 1.68, 0.78], [0.05, 0.05, 0.04], P.metal);
  box([1.05, 1.85, 0.8], [0.12, 0.18, 0.12], P.ink);
  g(box([1.05, 1.85, 0.8], [0.09, 0.14, 0.09], P.windowGlow), 1.5);
  // sign
  box([0.6, 2.15, 0.74], [0.8, 0.22, 0.04], P.trimCream);
  box([0.6, 2.15, 0.77], [0.74, 0.16, 0.02], P.cabinRed);
  box([0.6, 2.15, 0.79], [0.3, 0.04, 0.01], P.trimCream);
  box([0.6, 2.15, 0.79], [0.04, 0.12, 0.01], P.trimCream);
  // stairs: from porch edge z~1.9 y .95 to z 2.7 y .4
  for (let i = 0; i < 6; i++) {
    const y = DECK - (i + 1) * 0.0917;
    const z = 2.0 + i * 0.13;
    box([0.6, y - 0.03, z], [0.7, 0.06, 0.16], P.wood);
    box([0.6, y, z + 0.01], [0.6, 0.015, 0.1], P.snowLit);
  }
  for (const x of [0.25, 0.95]) box([x, 0.72, 2.35], [0.06, 0.1, 1.0], P.woodDark, [-0.62, 0, 0]);
  box([0.6, 0.45, 2.72], [0.8, 0.03, 0.15], P.snowShadow);
  // roof: two slopes
  const ang = Math.atan2(0.65, 1.0);
  for (const s of [1, -1]) {
    box([0, 2.67, -0.3 + s * 0.55], [3.9, 0.1, 1.35], P.roofDark, [-s * ang, 0, 0]);
    box([0, 2.78, -0.3 + s * 0.6], [3.7, 0.06, 0.85], P.snowLit, [-s * ang, 0, 0]);
    box([0, 2.5, -0.3 + s * 1.15], [3.9, 0.07, 0.06], P.ink);
    for (let i = 0; i < 6; i++) box([-1.6 + i * 0.64, 2.52, -0.3 + s * 1.2], [0.2, 0.12, 0.08], P.snowLit);
  }
  box([0, 3.0, -0.3], [3.95, 0.1, 0.12], P.snowLit);
  box([0, 2.33, 0.76], [3.9, 0.06, 0.04], P.trimCream);
  box([0, 2.33, -1.36], [3.9, 0.06, 0.04], P.trimCream);
  // gable fascia
  for (const x of [-1.95, 1.95]) box([x, 2.65, -0.3], [0.05, 0.3, 2.0], P.cabinDark);
  // chimney
  box([-1.0, 3.15, -0.6], [0.34, 0.9, 0.34], P.metal);
  box([-1.0, 3.62, -0.6], [0.44, 0.1, 0.44], P.rock);
  box([-1.0, 3.5, -0.43], [0.3, 0.05, 0.02], P.metalLight);
  b.part(new THREE.IcosahedronGeometry(0.18, 0), P.snowShadow, { bone, at: [-1.0, 3.8, -0.6] });
  b.part(new THREE.IcosahedronGeometry(0.14, 0), P.snowLit, { bone, at: [-0.9, 3.98, -0.55] });
  // vent box + firewood on left wall
  box([-1.8, 1.4, 0.2], [0.16, 0.3, 0.3], P.cabinDark);
  for (let i = 0; i < 4; i++) box([-1.8, 1.4 + (i - 1.5) * 0.04, 0.2], [0.18, 0.02, 0.26], P.ink);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4 - r; c++) {
    const z = -1.0 + c * 0.2 + r * 0.1, y = 1.1 + r * 0.17;
    cyl([-1.95, y, z], 0.08, 0.28, P.wood, 7, [0, 0, 90]);
    cyl([-2.1, y, z], 0.065, 0.02, P.trimCream, 7, [0, 0, 90]);
  }
  box([-1.9, 0.98, -0.6], [0.3, 0.06, 0.9], P.woodDark);
  // generator shed on right wall
  box([2.1, 1.3, -0.5], [0.8, 0.8, 0.9], P.cabinDark);
  box([2.1, 1.74, -0.5], [0.9, 0.08, 1.0], P.roofDark);
  box([2.1, 1.8, -0.5], [0.8, 0.04, 0.9], P.snowLit);
  box([2.1, 0.88, -0.5], [0.9, 0.1, 1.0], P.woodDark);
  box([2.51, 1.3, -0.5], [0.03, 0.4, 0.5], P.cabinRed);
  cyl([2.3, 2.0, -0.8], 0.04, 0.5, P.metal, 8);
  cyl([2.3, 2.27, -0.8], 0.06, 0.05, P.metalLight, 8);
  box([1.6, 2.2, -0.5], [0.04, 0.04, 0.04], P.ink);
}
    return buildMainCabin;
  })(),
  // instrumentField
  (() => {
function buildInstrumentField({ b, J, P, M }: any) {
  const root = J.outpost;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at, ...o });
  const cyl = (r0: number, r1: number, h: number, c: string, at: number[], o: any = {}, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), c, { bone: root, at, ...o });
  const rod = (a: number[], c2: number[], r: number, c: string, bone: any = root) =>
    b.rod(a, c2, r, c, { bone, sides: 5 });
  const drift = (x: number, z: number, s: number) => {
    b.part(new THREE.SphereGeometry(1, 7, 4), P.snowShadow, { bone: root, at: [x, 0.4, z], scale: [s, s * 0.22, s * 0.8] });
    b.part(new THREE.SphereGeometry(1, 7, 4), P.snowLit, { bone: root, at: [x - 0.03, 0.42, z + 0.03], scale: [s * 0.7, s * 0.16, s * 0.55] });
  };

  // Radome
  const [rx, , rz] = M.radomeBase;
  const legs: number[][] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const bot = [rx + Math.sin(a) * 0.55, 0.4, rz + Math.cos(a) * 0.55];
    const top = [rx + Math.sin(a) * 0.3, 1.8, rz + Math.cos(a) * 0.3];
    legs.push(bot, top);
    rod(bot, top, 0.025, P.metalLight);
    cyl(0.07, 0.07, 0.03, P.ink, [bot[0], 0.41, bot[2]]);
  }
  for (const y of [0.8, 1.2, 1.6]) {
    const t = (y - 0.4) / 1.4;
    for (let i = 0; i < 3; i++) {
      const a1 = legs[i * 2], b1 = legs[i * 2 + 1];
      const a2 = legs[((i + 1) % 3) * 2], b2 = legs[((i + 1) % 3) * 2 + 1];
      const p1 = [a1[0] + (b1[0] - a1[0]) * t, y, a1[2] + (b1[2] - a1[2]) * t];
      const p2 = [a2[0] + (b2[0] - a2[0]) * t, y, a2[2] + (b2[2] - a2[2]) * t];
      rod(p1, p2, 0.014, P.metal);
    }
  }
  cyl(0.38, 0.38, 0.1, P.metal, [rx, 1.85, rz], {}, 6);
  b.part(new THREE.SphereGeometry(0.45, 8, 6), P.trimCream, { bone: root, at: [rx, 2.4, rz], flat: true });
  b.part(new THREE.SphereGeometry(0.455, 8, 6, 0, Math.PI * 2, 1.2, 0.5), P.snowLit, { bone: root, at: [rx, 2.4, rz], flat: true });
  for (const y of [2.25, 2.5]) b.part(new THREE.TorusGeometry(Math.sqrt(0.2025 - (y - 2.4) ** 2) + 0.004, 0.006, 4, 16), P.snowShadow, { bone: root, at: [rx, y, rz], rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    b.part(new THREE.BoxGeometry(0.01, 0.9, 0.01), P.snowShadow, { bone: root, at: [rx, 2.4, rz], rotation: [0, (a * 180) / Math.PI, 0] });
  }
  cyl(0.04, 0.04, 0.08, P.cabinRed, [rx, 2.88, rz]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.cabinRed, { bone: root, at: [rx, 2.94, rz] });
  box(0.16, 0.2, 0.03, P.metal, [rx, 2.3, rz + 0.43], { rotation: [-8, 0, 0] });
  box(0.1, 0.14, 0.02, P.snowShadow, [rx, 2.3, rz + 0.45]);
  drift(rx, rz, 0.8);

  // Turbine
  const [tx, , tz] = M.turbineBase;
  const hub = M.turbineHub;
  b.part(new THREE.CylinderGeometry(0.06, 0.13, 3.0, 8), P.trimCream, { bone: root, at: [tx, 1.9, tz] });
  cyl(0.15, 0.15, 0.05, P.ink, [tx, 0.43, tz]);
  box(0.2, 0.2, 0.5, P.snowLit, [tx, 3.4, tz + 0.1]);
  box(0.21, 0.04, 0.5, P.snowShadow, [tx, 3.3, tz + 0.1]);
  b.part(new THREE.ConeGeometry(0.13, 0.2, 8), P.cabinRed, { bone: J.turbineRotor, at: [hub[0], hub[1], hub[2] + 0.1], rotation: [90, 0, 0] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 360;
    const ang = (a * Math.PI) / 180;
    const dir = [-Math.sin(ang), Math.cos(ang), 0];
    const base = [hub[0] + dir[0] * 0.1, hub[1] + dir[1] * 0.1, hub[2] + 0.05];
    const tip = [hub[0] + dir[0] * 1.1, hub[1] + dir[1] * 1.1, hub[2] + 0.05];
    const mid = [hub[0] + dir[0] * 0.8, hub[1] + dir[1] * 0.8, hub[2] + 0.05];
    b.rod(base, tip, [0.06, 0.02], P.snowLit, { bone: J.turbineRotor, section: "box" });
    b.rod(mid, tip, [0.05, 0.018], P.sunOrange ?? "#ff9a3c", { bone: J.turbineRotor, section: "box" });
  }
  drift(tx, tz, 0.7);

  // Mast
  const [mx, , mz] = M.mastBase;
  rod([mx, 0.4, mz], [mx, 4.4, mz], 0.03, P.metal);
  for (const y of [3.3, 3.9]) box(0.7, 0.04, 0.04, P.metalLight, [mx, y, mz]);
  box(0.22, 0.2, 0.14, P.trimCream, [mx, 2.4, mz + 0.1]);
  box(0.16, 0.05, 0.02, P.windowGlow, [mx, 2.42, mz + 0.18]);
  for (const [gx, gz] of [[-0.9, -0.2], [0.9, -0.2], [0.1, 0.9]]) {
    rod([mx, 3.6, mz], [mx + gx, 0.42, mz + gz], 0.006, P.ink);
    cyl(0.06, 0.06, 0.04, P.rock, [mx + gx, 0.42, mz + gz]);
  }
  const an = J.anemometer;
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), P.metalLight, { bone: an, at: [mx, 4.5, mz] });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const e = [mx + Math.cos(a) * 0.17, 4.55, mz + Math.sin(a) * 0.17];
    b.rod([mx, 4.55, mz], e, 0.01, P.metal, { bone: an, sides: 4 });
    b.part(new THREE.SphereGeometry(0.05, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2 + 0.3), P.sunOrange ?? "#ff9a3c", { bone: an, at: e });
  }
  drift(mx, mz, 0.6);

  // Solar rack
  for (let i = 0; i < 2; i++) {
    const x = 1.1 + i * 0.4;
    box(0.36, 0.03, 0.55, P.metal, [x, 1.0, -2.2], { rotation: [-35, 0, 0] });
    box(0.32, 0.02, 0.5, P.iceDark, [x, 1.01, -2.2], { rotation: [-35, 0, 0] });
    for (const k of [-1, 0, 1]) box(0.005, 0.005, 0.5, P.iceBlue, [x + k * 0.1, 1.025, -2.2], { rotation: [-35, 0, 0] });
    box(0.32, 0.005, 0.005, P.iceBlue, [x, 1.03, -2.2], { rotation: [-35, 0, 0] });
  }
  for (const x of [0.95, 1.55]) {
    rod([x, 0.4, -2.05], [x, 0.9, -2.1], 0.02, P.metal);
    rod([x, 0.4, -2.45], [x, 1.2, -2.35], 0.02, P.metal);
  }
  drift(1.3, -2.2, 0.55);

  // Stevenson screen
  for (const [dx, dz] of [[-0.12, -0.1], [0.12, -0.1], [-0.12, 0.1], [0.12, 0.1]])
    rod([-0.9 + dx, 0.4, -1.9 + dz], [-0.9 + dx, 0.85, -1.9 + dz], 0.015, P.wood);
  box(0.4, 0.3, 0.3, P.trimCream, [-0.9, 1.0, -1.9]);
  box(0.46, 0.04, 0.36, P.snowLit, [-0.9, 1.17, -1.9]);
  for (let i = 0; i < 4; i++) box(0.34, 0.015, 0.01, P.snowShadow, [-0.9, 0.9 + i * 0.06, -1.74]);
  drift(-0.9, -1.9, 0.4);

  // Cable
  b.sweep([[mx, 0.42, mz + 0.05], [0.2, 0.43, -2.0], [0.1, 0.6, -1.6], [0, 1.1, -1.4]], 0.012, { color: P.ink, bone: root });
}
    return buildInstrumentField;
  })(),
  // yardGear
  (() => {
function buildYardGear({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const G = M.ground[1];
  const R = rng(5);

  // Box helper: centre x,y,z; size w,h,d
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const cyl = (x: number, y: number, z: number, rt: number, rb: number, h: number, c: string, seg = 8, rot: [number, number, number] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], rotation: rot });
  const drift = (x: number, z: number, rx: number, rz: number, h = 0.07) => {
    b.part(new THREE.CylinderGeometry(1, 1.15, h, 8), P.snowShadow, { bone, at: [x, G + h / 2 - 0.01, z], scale: [rx, 1, rz] });
    b.part(new THREE.CylinderGeometry(0.7, 0.9, h * 0.5, 8), P.snowLit, { bone, at: [x, G + h * 0.9, z + rz * 0.05], scale: [rx * 0.8, 1, rz * 0.8] });
  };

  // ---------- Snowmobile ----------
  const [sx, , sz] = M.snowmobilePad;
  drift(sx, sz, 0.75, 0.55);
  // skis
  for (const s of [1, -1]) {
    box(sx + s * 0.28, G + 0.05, sz + 0.4, 0.1, 0.04, 0.55, P.metal);
    box(sx + s * 0.28, G + 0.03, sz + 0.7, 0.1, 0.04, 0.1, P.metal, [-30, 0, 0]);
    box(sx + s * 0.28, G + 0.04, sz + 0.4, 0.12, 0.012, 0.5, P.ink);
    box(sx + s * 0.25, G + 0.2, sz + 0.35, 0.04, 0.3, 0.04, P.metal, [0, 0, s * 8]);
  }
  // body
  box(sx, G + 0.28, sz + 0.3, 0.55, 0.22, 0.5, P.cabinRed);
  box(sx, G + 0.22, sz + 0.28, 0.58, 0.07, 0.55, P.cabinDark);
  box(sx, G + 0.43, sz + 0.42, 0.45, 0.12, 0.28, P.cabinRed, [-12, 0, 0]);
  box(sx, G + 0.54, sz + 0.45, 0.04, 0.003 + 0.1, 0.01, P.trimCream);
  box(sx, G + 0.56, sz + 0.5, 0.4, 0.2, 0.03, P.trimCream, [-35, 0, 0]);
  box(sx, G + 0.45, sz + 0.57, 0.12, 0.07, 0.04, P.windowGlow);
  box(sx, G + 0.46, sz + 0.2, 0.28, 0.1, 0.4, P.ink);
  box(sx, G + 0.46, sz + 0.0, 0.3, 0.08, 0.1, P.ink, [10, 0, 0]);
  box(sx, G + 0.41, sz + 0.3, 0.1, 0.02, 0.55, P.sunOrange);
  box(sx, G + 0.34, sz + 0.56, 0.4, 0.06, 0.03, P.cabinDark);
  // handlebar
  box(sx, G + 0.58, sz + 0.28, 0.4, 0.03, 0.03, P.metal);
  // track block
  box(sx, G + 0.14, sz - 0.12, 0.34, 0.2, 0.6, P.ink);
  box(sx, G + 0.06, sz - 0.12, 0.38, 0.05, 0.62, P.rock);
  for (let i = 0; i < 5; i++) box(sx, G + 0.26, sz - 0.34 + i * 0.12, 0.36, 0.015, 0.05, P.snowLit);
  box(sx, G + 0.27, sz - 0.1, 0.3, 0.05, 0.5, P.snowShadow);

  // ---------- Sled ----------
  const sledZ = sz - 0.95;
  for (const s of [1, -1]) {
    box(sx + s * 0.22, G + 0.04, sledZ, 0.05, 0.05, 0.8, P.woodDark);
    box(sx + s * 0.22, G + 0.07, sledZ + 0.42, 0.05, 0.05, 0.1, P.woodDark, [-35, 0, 0]);
  }
  box(sx, G + 0.1, sledZ, 0.5, 0.05, 0.75, P.wood);
  for (let i = 0; i < 4; i++) box(sx, G + 0.135, sledZ - 0.28 + i * 0.19, 0.5, 0.012, 0.03, P.woodDark);
  box(sx, G + 0.22, sledZ + 0.05, 0.4, 0.18, 0.4, P.sunOrange);
  box(sx, G + 0.32, sledZ + 0.05, 0.3, 0.04, 0.3, P.sunOrange);
  for (const dz of [-0.1, 0.1]) box(sx, G + 0.23, sledZ + 0.05 + dz, 0.42, 0.04, 0.02, P.trimCream);
  box(sx - 0.1, G + 0.18, sledZ - 0.28, 0.16, 0.12, 0.14, P.wood);
  box(sx + 0.1, G + 0.17, sledZ - 0.28, 0.14, 0.1, 0.14, P.cabinDark);
  box(sx, G + 0.1, sz - 0.5, 0.03, 0.03, 0.2, P.woodDark);

  // ---------- Cargo ----------
  const [cx, , cz] = M.cratePad;
  drift(cx, cz, 0.95, 0.75);
  const crate = (x: number, y: number, z: number, s: number) => {
    box(x, y, z, s, s, s, P.wood);
    for (const dy of [-1, 1]) box(x, y + dy * s * 0.4, z + s * 0.5 + 0.004, s * 1.02, s * 0.1, 0.012, P.woodDark);
    for (const dx of [-1, 1]) box(x + dx * s * 0.4, y, z + s * 0.5 + 0.005, s * 0.1, s, 0.012, P.woodDark);
    box(x, y, z + s * 0.5 + 0.012, s * 0.2, s * 0.04, 0.01, P.trimCream);
    box(x, y, z + s * 0.5 + 0.012, s * 0.04, s * 0.2, 0.01, P.trimCream);
  };
  crate(cx - 0.25, G + 0.2, cz - 0.1, 0.4);
  crate(cx + 0.2, G + 0.2, cz - 0.1, 0.4);
  crate(cx + 0.65, G + 0.17, cz - 0.15, 0.34);
  crate(cx - 0.02, G + 0.58, cz - 0.1, 0.36);
  crate(cx + 0.45, G + 0.5, cz - 0.15, 0.3);
  box(cx, G + 0.78, cz - 0.1, 0.4, 0.05, 0.4, P.snowLit);
  const drum = (x: number, z: number, c: string) => {
    cyl(x, G + 0.22, z, 0.15, 0.15, 0.44, c, 10);
    for (const y of [0.1, 0.34]) cyl(x, G + y, z, 0.16, 0.16, 0.035, P.ink, 10);
    cyl(x, G + 0.45, z, 0.14, 0.14, 0.02, P.metal, 10);
    cyl(x + 0.06, G + 0.47, z + 0.04, 0.025, 0.025, 0.02, P.ink, 6);
  };
  drum(cx - 0.35, cz + 0.4, P.sunOrange);
  drum(cx + 0.0, cz + 0.45, P.cabinDark);
  drum(cx + 0.35, cz + 0.4, P.sunOrange);
  cyl(cx - 0.35, G + 0.48, cz + 0.4, 0.1, 0.12, 0.03, P.snowLit, 8);

  // ---------- Flag pole ----------
  const [fx, , fz] = M.flagPad;
  drift(fx, fz, 0.4, 0.35);
  cyl(fx, G + 0.9, fz, 0.025, 0.03, 1.8, P.metal, 6);
  cyl(fx, G + 1.82, fz, 0.04, 0.04, 0.05, P.metalLight, 6);
  box(fx + 0.3, G + 1.55, fz, 0.55, 0.32, 0.015, P.cabinRed);
  box(fx + 0.3, G + 1.55, fz + 0.01, 0.55, 0.07, 0.01, P.trimCream);
  box(fx + 0.62, G + 1.55, fz, 0.1, 0.2, 0.012, P.cabinRed, [0, 0, 10]);

  // ---------- Ice-core rack ----------
  const rx = 0.2, rz = 2.8;
  drift(rx, rz, 0.65, 0.35);
  for (const s of [1, -1]) {
    box(rx + s * 0.4, G + 0.4, rz, 0.05, 0.9, 0.05, P.wood, [0, 0, s * -10]);
    box(rx + s * 0.4, G + 0.02, rz, 0.1, 0.04, 0.3, P.ink);
  }
  box(rx, G + 0.84, rz, 0.8, 0.05, 0.06, P.woodDark);
  for (let i = 0; i < 6; i++) {
    const y = G + 0.18 + (i % 3) * 0.2;
    const z = rz + (i < 3 ? 0.08 : -0.08);
    cyl(rx, y, z, 0.04, 0.04, 0.82, P.iceBlue, 6, [0, 0, 90]);
    cyl(rx - 0.42, y, z, 0.045, 0.045, 0.015, P.iceDark, 6, [0, 0, 90]);
  }
  box(rx, G + 0.1, rz, 0.7, 0.03, 0.04, P.woodDark);

  // ---------- Survey tent ----------
  const [tx, , tz] = M.tentPad;
  drift(tx, tz, 1.0, 0.9, 0.09);
  b.part(new THREE.ConeGeometry(0.78, 0.8, 4), P.sunOrange, { bone, at: [tx, G + 0.4, tz], rotation: [0, 45, 0], scale: [1, 1, 0.85] });
  b.part(new THREE.ConeGeometry(0.4, 0.45, 4), P.cabinRed, { bone, at: [tx, G + 0.6, tz], rotation: [0, 45, 0], scale: [1.1, 1, 0.9] });
  box(tx, G + 0.22, tz + 0.5, 0.26, 0.38, 0.03, P.roofDark, [18, 0, 0]);
  box(tx, G + 0.04, tz + 0.7, 0.9, 0.06, 0.12, P.snowLit);
  cyl(tx, G + 0.84, tz, 0.012, 0.012, 0.12, P.metal, 5);
  for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const ex = tx + dx * 0.95, ez = tz + dz * 0.8;
    b.rod([tx + dx * 0.3, G + 0.3, tz + dz * 0.25], [ex, G + 0.04, ez], 0.008, P.trimCream, { bone });
    box(ex, G + 0.05, ez, 0.04, 0.1, 0.04, P.wood);
  }

  // ---------- Skis & poles at stair rail ----------
  const kx = -2.1, kz = 1.9;
  drift(kx, kz, 0.3, 0.25, 0.05);
  for (const s of [1, -1]) {
    box(kx + s * 0.07, G + 0.65, kz, 0.06, 1.3, 0.015, s > 0 ? P.cabinRed : P.iceDark, [8, 0, s * 3]);
    box(kx + s * 0.07, G + 0.1, kz + 0.12, 0.06, 0.03, 0.02, P.ink);
    b.rod([kx + s * 0.18, G + 0.04, kz + 0.15], [kx + s * 0.14, G + 1.0, kz - 0.03], 0.008, P.metalLight, { bone });
    cyl(kx + s * 0.18, G + 0.04, kz + 0.15, 0.04, 0.04, 0.01, P.ink, 6);
  }

  // ---------- Ice axe in drift ----------
  const ax = -1.5, az = 3.0;
  drift(ax, az, 0.3, 0.25, 0.06);
  b.rod([ax, G + 0.04, az], [ax + 0.05, G + 0.62, az - 0.04], 0.018, P.wood, { bone });
  box(ax + 0.07, G + 0.64, az - 0.04, 0.2, 0.04, 0.03, P.metalLight, [0, 0, 8]);
  box(ax + 0.17, G + 0.6, az - 0.04, 0.06, 0.08, 0.03, P.metalLight, [0, 0, -30]);

  // few footprints of scattered snow chunks
  for (let i = 0; i < 4; i++) {
    const x = -3 + R() * 2.5, z = 1.2 + R() * 2;
    box(x, G + 0.015, z, 0.12, 0.03, 0.12, P.snowShadow, [0, R() * 90, 0]);
  }
}
    return buildYardGear;
  })(),
  // sunsetBackdrop
  (() => {
function buildSunsetBackdrop({ b, J, P, M }: Ctx) {
  const bone = J.outpost;
  const X: [number, number, number] = [1, 0, 0];
  const slab = (
    outline: [number, number][],
    z: number,
    th: number,
    color: string,
    ox = 0,
    oy = 0,
  ) =>
    b.extrude(outline, {
      at: [ox, oy, z],
      x: X,
      thickness: th,
      color,
      bone,
    });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone });

  // Layer 1: sky bands (y 0.4..5.0)
  const bands: [number, number, string][] = [
    [0.4, 1.4, P.skyGlow],
    [1.4, 1.5, P.sunOrange],
    [1.5, 2.6, P.skyGlow],
    [2.6, 3.8, P.skyMid],
    [3.8, 5.0, P.skyTop],
  ];
  for (const [y0, y1, c] of bands) box(7.2, y1 - y0, 0.06, c, 0, (y0 + y1) / 2, -3.55);

  // Layer 2: sun and halos
  const [sx, sy] = [M.sunCenter[0], M.sunCenter[1]];
  const disc = (r: number, c: string, z: number, seg = 28) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.03, seg), c, {
      at: [sx, sy, z],
      dir: [0, 0, 1],
      bone,
    });
  disc(1.55, P.skyMid, -3.5);
  disc(1.2, P.skyGlow, -3.48);
  disc(0.9, P.sunOrange, -3.46);
  disc(0.75, P.sunOrange, -3.45);
  disc(0.64, P.sunYellow, -3.43);

  // clouds
  const clouds: [number, number, number, number, string][] = [
    [-2.3, 3.1, 1.4, 0.07, P.ridgeFar],
    [-1.6, 2.7, 1.9, 0.06, P.skyMid],
    [2.4, 2.4, 1.3, 0.06, P.ridgeFar],
    [-0.4, 3.6, 1.0, 0.05, P.ridgeFar],
    [2.5, 3.9, 1.1, 0.05, P.skyMid],
  ];
  for (const [x, y, w, h, c] of clouds) box(w, h, 0.03, c, x, y, -3.5);

  // Layer 3: aurora ribbons
  const ribbon = (y: number, amp: number, c: string, z: number) => {
    const top: [number, number][] = [];
    const bot: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const x = -3.4 + (6.8 * i) / 12;
      const w = y + Math.sin(i * 0.8) * amp;
      top.push([x, w + 0.08]);
      bot.push([x, w - 0.08]);
    }
    slab([...top, ...bot.reverse()], z, 0.03, c);
  };
  ribbon(4.4, 0.15, P.iceBlue, -3.52);
  ribbon(4.1, 0.12, P.trimCream, -3.51);
  ribbon(4.7, 0.1, P.iceBlue, -3.5);

  // Ridges
  const ridge = (
    peaks: [number, number][],
    z: number,
    c: string,
    th: number,
  ) => {
    const o: [number, number, "sharp"?][] = [[-3.5, 0.4]];
    for (const [x, y] of peaks) o.push([x, y, "sharp"]);
    o.push([3.5, 0.4]);
    slab(o as [number, number][], z, th, c);
  };
  const far: [number, number][] = [[-3.5, 1.6], [-2.8, 2.5], [-2.2, 1.7], [-1.4, 2.8], [-0.6, 1.8], [0.4, 2.4], [1.4, 1.7], [2.3, 2.7], [3.0, 1.9], [3.5, 2.2]];
  const mid: [number, number][] = [[-3.5, 1.3], [-2.5, 2.1], [-1.7, 1.2], [-0.8, 2.2], [0.2, 1.3], [1.2, 2.0], [2.2, 1.2], [3.0, 1.9], [3.5, 1.4]];
  const near: [number, number][] = [[-3.5, 1.0], [-2.7, 1.5], [-1.8, 0.9], [-0.9, 1.4], [0.1, 0.8], [1.0, 1.4], [2.0, 0.9], [2.9, 1.5], [3.5, 1.0]];
  ridge(far, -3.4, P.ridgeFar, 0.06);
  ridge(mid, -3.3, P.ridgeMid, 0.06);
  ridge(near, -3.15, P.ridgeNear, 0.08);

  // snow caps on mid peaks
  for (const [x, y] of mid.filter((p) => p[1] > 1.9))
    slab([[-0.2, -0.32], [0, 0, ] as any, [0.2, -0.32], [0.08, -0.22], [-0.08, -0.38]].slice(0, 3) as [number, number][], -3.27, 0.03, P.snowLit, x, y);
  // highlights on near ridge sunward slopes
  for (const [x, y] of near.filter((p) => p[1] > 1.3))
    slab([[0, 0], [0.14, -0.2], [0.02, -0.2]], -3.1, 0.03, P.snowLit, x - 0.02, y - 0.02);

  // Frame
  const f = 0.08;
  box(7.2, f, 0.12, P.ink, 0, 5.0 - f / 2, -3.5);
  box(7.2, f, 0.12, P.ink, 0, 0.4 + f / 2, -3.5);
  box(f, 4.6, 0.12, P.ink, -3.6 + f / 2, 2.7, -3.5);
  box(f, 4.6, 0.12, P.ink, 3.6 - f / 2, 2.7, -3.5);

  // Rear braces
  for (const s of [-1, 1]) {
    b.rod([s * 2.6, 0.4, -3.95], [s * 2.6, 3.6, -3.6], 0.05, P.woodDark, { bone });
    box(0.3, 0.05, 0.4, P.ink, s * 2.6, 0.42, -3.85);
  }
}
    return buildSunsetBackdrop;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "arcticResearchOutpost" });
  const J: Record<string, Joint> = {};
  J["outpost"] = b.joint("outpost", { at: [0,0.4,0], dir: [0,1,0], role: "spine" });
  J["turbineRotor"] = b.joint("turbineRotor", { parent: J["outpost"], at: [2.4,3.4,-1.95], dir: [0,0,1], role: "hinge", group: "instruments" });
  J["anemometer"] = b.joint("anemometer", { parent: J["outpost"], at: [0.2,4.5,-2.4], dir: [0,1,0], role: "hinge", group: "instruments" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
