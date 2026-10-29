import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Nostromo Galley",
  "description": "A cramped, greasy, lived-in 1979 Nostromo-style spaceship galley: fridge, prep counter with CRT, cooking range under a hood, a bolted mess table with stools and a cat, all in a beige-and-grey utilitarian shell with amber and fluorescent lights."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  deck: "#3a3d40",
  deckLight: "#575b5e",
  deckGrate: "#25272a",
  panelCream: "#cfc6a8",
  panelShade: "#b3aa8c",
  panelOlive: "#8c8a5a",
  panelDark: "#4a4d4f",
  steel: "#a9afb3",
  steelDark: "#6c7378",
  black: "#16181a",
  rust: "#c4571f",
  pipeCopper: "#a4602f",
  hazardYellow: "#e0b81c",
  warnRed: "#b3261e",
  amber: "#ffb347",
  lampWhite: "#f4f0d8",
  crtGreen: "#6dff9a",
  crtDark: "#0c2a18",
  grime: "#6b5a3e",
  ceramic: "#e8e2cc",
  coffee: "#4a2a1c",
  blueGrey: "#5d7380",
  catOrange: "#d9822b",
  catCream: "#f1d9a8",
};
const M = {
  deckTop: [0, 0.08, 0] as [number, number, number],
  wallFace: [0, 1.2, -1.4] as [number, number, number],
  counterTop: [0, 0.92, -1.1] as [number, number, number],
  ceilingUnderside: [0, 2.2, 0] as [number, number, number],
  fridgeCenter: [-1.375, 0.08, -1.05] as [number, number, number],
  fridgeFront: [-1.375, 1, -0.7] as [number, number, number],
  prepCounterCenter: [-0.175, 0.08, -1.1] as [number, number, number],
  sinkCenter: [-0.45, 0.92, -1.1] as [number, number, number],
  crtCenter: [0.25, 1.3, -1.12] as [number, number, number],
  overheadCabinets: [-0.175, 1.65, -1.22] as [number, number, number],
  rangeCenter: [1.2, 0.08, -1.1] as [number, number, number],
  rangeTop: [1.2, 0.92, -1.1] as [number, number, number],
  hoodBase: [1.2, 1.55, -1.1] as [number, number, number],
  bulkheadFace: [1.8, 1.2, -0.8] as [number, number, number],
  tableTop: [0, 0.78, 0.35] as [number, number, number],
  stoolFrontLeft: [0.35, 0.08, 1.1] as [number, number, number],
  stoolFrontRight: [-0.35, 0.08, 1.1] as [number, number, number],
  stoolSideLeft: [1, 0.08, 0.35] as [number, number, number],
  stoolSideRight: [-1, 0.08, 0.35] as [number, number, number],
  floorFrontEdge: [0, 0.08, 1.55] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // shell
  (() => {
function buildShell({ b, P }: { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> }) {
  const r = rng(1979);
  const PI = Math.PI;
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  const _p = new THREE.Vector3();
  const _s = new THREE.Vector3(1, 1, 1);

  // Collector: merges every piece of one colour into a single part.
  function coll(strength?: number) {
    const map = new Map<string, THREE.BufferGeometry[]>();
    const put = (c: string, geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
      _e.set(rx, ry, rz);
      _q.setFromEuler(_e);
      _m.compose(_p.set(x, y, z), _q, _s);
      geo.applyMatrix4(_m);
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(geo);
    };
    const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
      put(c, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
    const cyl = (c: string, rad: number, h: number, x: number, y: number, z: number, ax: "x" | "y" | "z" = "y", seg = 8) => {
      const g = new THREE.CylinderGeometry(rad, rad, h, seg);
      if (ax === "x") put(c, g, x, y, z, 0, 0, PI / 2);
      else if (ax === "z") put(c, g, x, y, z, PI / 2, 0, 0);
      else put(c, g, x, y, z);
    };
    const flush = () => {
      for (const [c, list] of map) {
        const merged = mergeGeometries(list);
        if (!merged) continue;
        const part = b.part(merged, c, { at: [0, 0, 0], flat: true });
        if (strength) glow(part, strength);
      }
    };
    return { put, box, cyl, flush };
  }
  const S = coll();
  const G = coll(1.25);

  // ---------------- DECK ----------------
  S.box(P.deck, 3.9, 0.08, 3.1, 0, 0.04, 0);
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 9; j++) {
      const c = (i + j) % 2 ? P.deckLight : P.deckGrate;
      S.box(c, 0.26, 0.016, 0.26, -1.65 + 0.3 * i, 0.088, -1.2 + 0.3 * j);
    }
  for (let i = 0; i < 11; i++)
    for (let j = 0; j < 8; j++) S.box(P.steelDark, 0.034, 0.012, 0.034, -1.5 + 0.3 * i, 0.098, -1.05 + 0.3 * j);
  // side trims
  for (const s of [1, -1]) S.box(P.panelDark, 0.04, 0.035, 2.85, s * 1.93, 0.0975, -0.03);
  // hazard band
  S.box(P.black, 3.9, 0.012, 0.15, 0, 0.086, 1.475);
  for (let i = 0; i < 25; i++) S.box(P.hazardYellow, 0.07, 0.014, 0.13, -1.92 + 0.16 * i, 0.09, 1.475, 0, 0.6, 0);
  S.box(P.steelDark, 3.9, 0.02, 0.025, 0, 0.09, 1.395);
  // drain grate
  S.box(P.black, 0.42, 0.02, 0.32, -0.5, 0.098, 0.9);
  for (let i = 0; i < 7; i++) S.box(P.steelDark, 0.02, 0.016, 0.26, -0.65 + 0.05 * i, 0.112, 0.9);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) S.box(P.steel, 0.03, 0.01, 0.03, -0.5 + sx * 0.19, 0.112, 0.9 + sz * 0.14);
  // grime patches
  const stains: [number, number, number, number, number][] = [
    [-0.3, -0.95, 0.7, 0.28, 0], [0.2, -1.0, 0.4, 0.2, 0.3], [1.15, -0.85, 0.7, 0.3, -0.2],
    [1.4, -1.15, 0.3, 0.2, 0.5], [-1.4, -0.85, 0.5, 0.3, 0.1], [-0.6, -1.2, 0.3, 0.12, 0.4],
    [0.1, 0.35, 0.3, 0.22, 0.7], [-1.0, 0.5, 0.25, 0.2, 0.2],
  ];
  for (const [x, z, w, d, a] of stains) S.box(P.grime, w, 0.004, d, x, 0.1, z, 0, a, 0);
  for (let i = 0; i < 9; i++) {
    const x = -1.6 + r() * 3.2, z = -1.0 + r() * 2.0;
    S.box(P.grime, 0.25 + r() * 0.3, 0.004, 0.035, x, 0.101, z, 0, r() * PI, 0);
  }

  // ---------------- BACK WALL ----------------
  S.box(P.panelCream, 3.9, 2.32, 0.15, 0, 1.24, -1.475);
  S.box(P.panelDark, 3.9, 0.14, 0.03, 0, 0.15, -1.385);
  S.box(P.panelShade, 3.9, 0.06, 0.015, 0, 2.37, -1.3925);
  for (const x of [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5]) {
    S.box(P.panelShade, 0.03, 2.12, 0.012, x, 1.28, -1.394);
    for (let y = 0.35; y < 2.3; y += 0.25)
      for (const sx of [-1, 1]) S.box(P.steelDark, 0.013, 0.013, 0.012, x + sx * 0.032, y, -1.394);
  }
  // wall base grime
  S.box(P.grime, 0.08, 0.3, 0.004, -1.87, 0.4, -1.4);
  S.box(P.grime, 0.05, 0.22, 0.004, -1.78, 0.35, -1.4);
  // stencilled labels
  const glyphs = (c: string, x0: number, y: number, n: number, z: number) => {
    for (let k = 0; k < n; k++) {
      const x = x0 + k * 0.045;
      S.box(c, 0.008, 0.06, 0.004, x - 0.013, y, z);
      S.box(c, 0.008, 0.06, 0.004, x + 0.013, y, z);
      S.box(c, 0.034, 0.008, 0.004, x, y + (r() > 0.5 ? 0.026 : -0.026), z);
      if (r() > 0.55) S.box(c, 0.03, 0.008, 0.004, x, y, z);
    }
  };
  S.box(P.black, 0.32, 0.12, 0.01, -1.55, 2.17, -1.395);
  glyphs(P.hazardYellow, -1.675, 2.17, 6, -1.388);
  S.box(P.hazardYellow, 0.22, 0.11, 0.01, -1.2, 2.17, -1.395);
  glyphs(P.black, -1.28, 2.17, 4, -1.388);
  S.box(P.warnRed, 0.04, 0.04, 0.01, -1.03, 2.2, -1.395);
  S.box(P.black, 0.1, 0.03, 0.008, -1.03, 2.13, -1.395);
  for (let k = 0; k < 4; k++) S.box(P.hazardYellow, 0.012, 0.022, 0.004, -1.065 + 0.02 * k, 2.13, -1.39);
  // conduit run
  S.cyl(P.steelDark, 0.025, 2.18, -1.9, 1.31, -1.35, "y", 8);
  S.cyl(P.pipeCopper, 0.018, 2.0, -1.86, 1.2, -1.375, "y", 8);
  S.cyl(P.black, 0.04, 0.04, -1.9, 0.24, -1.35);
  for (let y = 0.4; y < 2.3; y += 0.35) S.box(P.steel, 0.1, 0.035, 0.03, -1.88, y, -1.375);
  S.box(P.panelDark, 0.1, 0.14, 0.1, -1.9, 2.25, -1.35);
  for (const sx of [-1, 1]) S.box(P.steel, 0.012, 0.012, 0.012, -1.9 + sx * 0.035, 2.25, -1.3);
  // posts
  for (const [x, z] of [[-1.9, -0.9], [-1.9, 0.9], [1.88, 0.9]] as [number, number][]) {
    S.box(P.panelDark, 0.07, 2.12, 0.07, x, 1.14, z);
    S.box(P.steel, 0.16, 0.02, 0.16, x, 0.09, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) S.box(P.steelDark, 0.02, 0.014, 0.02, x + sx * 0.06, 0.105, z + sz * 0.06);
    S.box(P.steelDark, 0.1, 0.03, 0.1, x, 2.185, z);
  }

  // ---------------- BULKHEAD ----------------
  S.box(P.panelOlive, 0.15, 2.32, 1.45, 1.875, 1.24, -0.825);
  S.box(P.panelDark, 0.03, 0.14, 1.45, 1.785, 0.15, -0.825);
  S.box(P.panelDark, 0.03, 0.06, 1.45, 1.785, 2.37, -0.825);
  for (const y of [0.5, 1.0, 1.5, 2.0]) {
    S.box(P.panelShade, 0.012, 0.03, 1.38, 1.794, y, -0.81);
    for (let z = -1.45; z < -0.1; z += 0.15) S.box(P.steelDark, 0.012, 0.014, 0.014, 1.792, y + 0.028, z);
  }
  for (const z of [-1.15, -0.2]) {
    S.box(P.panelShade, 0.012, 2.12, 0.03, 1.794, 1.28, z);
    for (let y = 0.3; y < 2.3; y += 0.2) S.box(P.steelDark, 0.012, 0.014, 0.014, 1.792, y, z + 0.028);
  }
  // hatch
  const hz = -0.65, hy = 1.1;
  S.box(P.panelDark, 0.05, 1.6, 0.07, 1.775, hy, -0.965);
  S.box(P.panelDark, 0.05, 1.6, 0.07, 1.775, hy, -0.335);
  S.box(P.panelDark, 0.05, 0.07, 0.56, 1.775, 0.335, hz);
  S.box(P.panelDark, 0.05, 0.07, 0.56, 1.775, 1.865, hz);
  for (const cz of [-0.93, -0.37]) for (const cy of [0.4, 1.8]) S.box(P.panelDark, 0.05, 0.08, 0.08, 1.775, cy, cz, PI / 4);
  S.box(P.steel, 0.03, 1.46, 0.56, 1.78, hy, hz);
  for (const y of [0.8, 1.4]) S.box(P.steelDark, 0.012, 0.03, 0.5, 1.762, y, hz);
  for (const y of [0.42, 1.78]) for (const dz of [-0.24, 0.24]) S.box(P.steelDark, 0.014, 0.022, 0.022, 1.762, y, hz + dz);
  // bolts on frame
  for (let y = 0.4; y < 1.85; y += 0.28) for (const z of [-0.965, -0.335]) S.cyl(P.steel, 0.011, 0.012, 1.748, y, z, "x", 6);
  // wheel lock
  S.cyl(P.steelDark, 0.05, 0.05, 1.745, hy, hz, "x", 8);
  S.put(P.steel, new THREE.TorusGeometry(0.1, 0.013, 5, 14), 1.74, hy, hz, 0, PI / 2, 0);
  for (let k = 0; k < 3; k++) S.box(P.steel, 0.014, 0.2, 0.016, 1.74, hy, hz, (k * PI) / 3);
  S.cyl(P.warnRed, 0.016, 0.03, 1.72, hy, hz, "x", 6);
  // hinges + latch
  for (const y of [0.55, 1.1, 1.65]) {
    S.box(P.steelDark, 0.06, 0.14, 0.05, 1.77, y, -1.03);
    S.cyl(P.steel, 0.012, 0.16, 1.742, y, -1.03, "y", 6);
  }
  S.box(P.steel, 0.06, 0.12, 0.04, 1.77, 1.35, -0.285);
  // amber lamp over hatch
  S.cyl(P.steelDark, 0.045, 0.04, 1.775, 2.04, hz, "x", 8);
  G.put(P.amber, new THREE.SphereGeometry(0.03, 8, 6), 1.745, 2.04, hz);
  // lever box
  S.box(P.warnRed, 0.1, 0.16, 0.09, 1.75, 1.55, -0.2);
  S.box(P.hazardYellow, 0.012, 0.03, 0.09, 1.698, 1.62, -0.2);
  S.box(P.black, 0.02, 0.1, 0.02, 1.69, 1.52, -0.2, 0, 0, 0.5);
  S.box(P.black, 0.02, 0.03, 0.03, 1.7, 1.46, -0.2);
  // extinguisher
  S.cyl(P.warnRed, 0.07, 0.5, 1.7, 0.75, -0.2, "y", 10);
  S.put(P.warnRed, new THREE.SphereGeometry(0.07, 10, 5, 0, PI * 2, 0, PI / 2), 1.7, 1.0, -0.2);
  S.cyl(P.steel, 0.03, 0.06, 1.7, 1.06, -0.2);
  S.box(P.black, 0.09, 0.05, 0.05, 1.7, 1.1, -0.2);
  S.box(P.black, 0.1, 0.012, 0.02, 1.7, 1.14, -0.2, 0, 0, 0.2);
  S.cyl(P.black, 0.03, 0.01, 1.7, 0.51, -0.2);
  S.box(P.black, 0.07, 0.06, 0.07, 1.7, 0.86, -0.2);
  S.box(P.warnRed, 0.07, 0.07, 0.01, 1.7, 0.74, -0.268);
  for (const y of [0.62, 0.9]) {
    S.cyl(P.steelDark, 0.076, 0.03, 1.7, y, -0.2, "y", 10);
    S.box(P.steelDark, 0.04, 0.05, 0.06, 1.78, y, -0.2);
  }
  b.sweep(
    catmull([[1.7, 1.1, -0.2], [1.73, 1.12, -0.14], [1.755, 0.98, -0.135], [1.76, 0.85, -0.145], [1.74, 0.74, -0.14]]),
    0.011,
    { color: P.black },
  );

  // ---------------- CEILING ----------------
  for (const z of [-0.9, 0.9]) {
    S.box(P.panelDark, 3.9, 0.03, 0.16, 0, 2.215, z);
    S.box(P.panelDark, 3.9, 0.03, 0.16, 0, 2.385, z);
    S.box(P.panelDark, 3.9, 0.14, 0.03, 0, 2.3, z);
    for (let x = -1.6; x < 1.7; x += 0.65) S.box(P.steelDark, 0.03, 0.14, 0.1, x, 2.3, z);
    for (let x = -1.8; x < 1.9; x += 0.3)
      for (const sz of [-1, 1]) S.box(P.steel, 0.02, 0.012, 0.02, x, 2.196, z + sz * 0.055);
    for (const x of [-0.65, 0.65]) S.box(P.steelDark, 0.22, 0.016, 0.14, x, 2.19, z);
    for (const x of [-1.94, 1.94]) S.box(P.steelDark, 0.02, 0.2, 0.2, x, 2.3, z);
  }
  // duct
  S.box(P.steel, 3.9, 0.18, 0.26, 0, 2.29, 0);
  for (const x of [-1.3, -0.4, 0.5, 1.4]) {
    S.box(P.steelDark, 0.04, 0.22, 0.3, x, 2.29, 0);
    for (const sy of [-1, 1]) for (const sz of [-1, 1]) S.box(P.steel, 0.05, 0.016, 0.016, x, 2.29 + sy * 0.09, sz * 0.13);
  }
  for (const x of [-0.85, 0.05, 0.95]) S.box(P.panelShade, 0.06, 0.2, 0.28, x, 2.29, 0);
  S.box(P.black, 0.5, 0.02, 0.2, -0.0, 2.195, 0);
  for (let i = 0; i < 6; i++) S.box(P.steelDark, 0.46, 0.008, 0.018, 0, 2.185, -0.075 + 0.03 * i, 0.5, 0, 0);
  // pipes
  const pipes: [string, number, number][] = [[P.pipeCopper, -1.35, 2.27], [P.rust, -1.28, 2.27], [P.steel, -1.315, 2.325]];
  pipes.forEach(([c, z, y], i) => {
    S.cyl(c, 0.033, 3.8, 0, y, z, "x", 8);
    for (let x = -1.5 + i * 0.25; x < 1.9; x += 0.75) S.cyl(P.steelDark, 0.043, 0.05, x, y, z, "x", 8);
  });
  for (const x of [-1.6, -0.3, 0.9, 1.7]) {
    S.box(P.steelDark, 0.025, 0.14, 0.17, x, 2.31, -1.315);
    S.box(P.steel, 0.03, 0.012, 0.012, x, 2.38, -1.315);
  }
  for (const x of [-0.2, 1.2]) {
    S.box(P.steelDark, 0.08, 0.08, 0.07, x, 2.27, -1.28);
    S.cyl(P.steel, 0.01, 0.1, x, 2.27, -1.21, "z", 6);
    S.cyl(P.warnRed, 0.05, 0.012, x, 2.27, -1.15, "z", 10);
    S.cyl(P.warnRed, 0.014, 0.025, x, 2.27, -1.14, "z", 6);
  }
  S.box(P.steelDark, 0.07, 0.04, 0.07, 0.3, 2.35, -1.315);
  S.cyl(P.steel, 0.01, 0.04, 0.3, 2.37, -1.315);
  S.cyl(P.warnRed, 0.04, 0.012, 0.3, 2.388, -1.315, "y", 10);
  // strip fluorescents
  for (const z of [-0.4, 0.9])
    for (const x of [-0.8, 0.8]) {
      S.box(P.panelDark, 0.95, 0.04, 0.14, x, 2.175, z);
      S.box(P.panelDark, 0.95, 0.012, 0.016, x, 2.152, z - 0.065);
      S.box(P.panelDark, 0.95, 0.012, 0.016, x, 2.152, z + 0.065);
      G.box(P.lampWhite, 0.88, 0.02, 0.09, x, 2.145, z);
      for (const sx of [-1, 1]) S.box(P.black, 0.025, 0.03, 0.12, x + sx * 0.46, 2.155, z);
      if (z < 0) for (const sx of [-1, 1]) {
        S.cyl(P.steelDark, 0.009, 0.205, x + sx * 0.38, 2.3, z, "y", 6);
      }
    }
  // cable loops
  const loop = (x0: number, dip: number, z: number) => {
    b.sweep(
      catmull([
        [x0, 2.2, z], [x0 + 0.08, 2.2 - dip * 0.6, z + 0.02], [x0 + 0.25, 2.2 - dip, z + 0.03],
        [x0 + 0.42, 2.2 - dip * 0.6, z + 0.02], [x0 + 0.5, 2.2, z],
      ]),
      0.012,
      { color: P.black },
    );
    S.box(P.steelDark, 0.03, 0.04, 0.03, x0, 2.19, z);
    S.box(P.steelDark, 0.03, 0.04, 0.03, x0 + 0.5, 2.19, z);
  };
  loop(-1.2, 0.28, 0.99);
  loop(-0.4, 0.18, 0.99);
  loop(0.9, 0.32, 0.99);
  loop(-1.5, 0.22, -0.99);
  // amber caged lamps
  for (const z of [-0.45, 0.45]) {
    const x = 1.6;
    S.box(P.steel, 0.16, 0.02, 0.16, x, 2.39, z);
    S.cyl(P.steelDark, 0.025, 0.05, x, 2.355, z);
    G.put(P.amber, new THREE.SphereGeometry(0.06, 8, 6), x, 2.3, z);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2;
      S.cyl(P.black, 0.006, 0.16, x + Math.cos(a) * 0.075, 2.3, z + Math.sin(a) * 0.075, "y", 5);
    }
    for (const y of [2.23, 2.37]) S.put(P.black, new THREE.TorusGeometry(0.075, 0.006, 4, 12), x, y, z, PI / 2, 0, 0);
    S.cyl(P.steelDark, 0.04, 0.02, x, 2.215, z);
  }

  S.flush();
  G.flush();
}
    return buildShell;
  })(),
  // coldStorage
  (() => {
function buildColdStorage({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x: number, y: number, z: number, sx: number, sy: number, sz: number, c: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), c, { at: [x, y, z], rotation: rot });
  // cylinder along an axis: "x" | "y" | "z"
  const cyl = (x: number, y: number, z: number, r: number, len: number, c: string, axis: "x" | "y" | "z" = "y", seg = 10) => {
    const dir: [number, number, number] = axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], dir });
  };

  const CX = -1.315; // cabinet centre x
  const FZ = -0.74; // cabinet front face
  const DF = FZ + 0.02; // door centre z
  // ---- plinth and body
  box(CX, 0.14, -1.07, 0.7, 0.12, 0.62, P.panelDark);
  box(CX, 1.075, -1.07, 0.73, 1.75, 0.66, P.panelCream);
  // side shading strip and top cap
  box(CX, 1.96, -1.07, 0.75, 0.03, 0.68, P.steelDark);
  box(-1.685, 1.075, -1.07, 0.02, 1.75, 0.66, P.panelShade);
  // vertical seam strips on front corners
  box(-1.675, 1.075, FZ + 0.005, 0.02, 1.75, 0.012, P.steel);
  box(-0.955, 1.075, FZ + 0.005, 0.02, 1.75, 0.012, P.steel);

  // ---- doors
  const door = (y0: number, y1: number, withGasket: boolean) => {
    const h = y1 - y0, cy = (y0 + y1) / 2;
    box(CX, cy, FZ - 0.005, 0.7, h + 0.03, 0.02, P.panelShade);
    box(CX, cy, DF - 0.005, 0.66, h, 0.03, P.panelCream);
    box(CX, cy, DF + 0.012, 0.6, h - 0.06, 0.006, P.panelShade);
    if (withGasket) {
      const gz = FZ - 0.012;
      box(CX, y0 - 0.005, gz, 0.7, 0.014, 0.012, P.black);
      box(CX, y1 + 0.005, gz, 0.7, 0.014, 0.012, P.black);
      box(CX - 0.345, cy, gz, 0.014, h, 0.012, P.black);
      box(CX + 0.345, cy, gz, 0.014, h, 0.012, P.black);
    }
    // hinges on right edge (model right = -x)
    for (const f of [0.15, 0.85]) {
      cyl(CX - 0.345, y0 + h * f, DF + 0.005, 0.014, 0.07, P.steelDark, "y", 8);
      box(CX - 0.335, y0 + h * f, DF + 0.02, 0.04, 0.07, 0.02, P.steelDark);
    }
    // latch on left edge
    box(CX + 0.31, cy + h * 0.18, DF + 0.025, 0.03, 0.05, 0.02, P.steel);
    box(CX + 0.31, cy + h * 0.18 - 0.04, DF + 0.03, 0.012, 0.03, 0.012, P.black);
    // recessed bar handle on brackets, left side
    const hx = CX + 0.26;
    const hlen = Math.min(0.42, h * 0.6);
    box(hx, cy, DF + 0.018, 0.045, hlen + 0.04, 0.012, P.black);
    cyl(hx, cy, DF + 0.04, 0.012, hlen, P.steel, "y", 8);
    for (const s of [-1, 1]) box(hx, cy + s * hlen * 0.45, DF + 0.03, 0.02, 0.022, 0.026, P.steelDark);
  };
  door(1.14, 1.77, true);
  door(0.3, 1.11, false);

  // frost blocks around the freezer gasket
  for (let i = 0; i < 16; i++) {
    const side = R();
    let x = CX, y = 1.14;
    if (side < 0.4) { x = CX - 0.33 + R() * 0.66; y = 1.14 + (R() < 0.5 ? 0 : 0.63); }
    else { x = CX + (R() < 0.5 ? -0.34 : 0.34); y = 1.14 + R() * 0.63; }
    box(x, y, FZ - 0.016, 0.02 + R() * 0.03, 0.015 + R() * 0.025, 0.014, P.ceramic);
  }

  // ---- control strip
  box(CX, 1.875, FZ + 0.004, 0.68, 0.14, 0.012, P.panelDark);
  box(CX, 1.875, FZ - 0.003, 0.7, 0.01, 0.01, P.steel);
  for (let i = 0; i < 3; i++) {
    const x = CX + 0.22 + i * 0.075;
    box(x, 1.875, FZ - 0.006, 0.05, 0.075, 0.008, P.black);
    b.part(new THREE.CylinderGeometry(0.006, 0.008, 0.05, 6), P.steel, { at: [x, 1.885 - (i === 1 ? 0.0 : -0.0), FZ - 0.025], rotation: [i === 1 ? -40 : 40, 0, 0] });
    cyl(x, 1.875, FZ - 0.011, 0.01, 0.008, P.steelDark, "z", 8);
  }
  for (let i = 0; i < 2; i++) {
    const x = CX - 0.05 - i * 0.09;
    cyl(x, 1.875, FZ - 0.015, 0.027, 0.03, P.black, "z", 12);
    cyl(x, 1.875, FZ - 0.032, 0.022, 0.006, P.steel, "z", 12);
    box(x, 1.887, FZ - 0.036, 0.004, 0.016, 0.004, P.lampWhite);
  }
  glow(cyl(CX - 0.24, 1.9, FZ - 0.012, 0.014, 0.012, P.amber, "z", 10), 1.6);
  glow(cyl(CX - 0.24, 1.855, FZ - 0.012, 0.01, 0.012, P.crtGreen, "z", 10), 1.6);
  box(CX - 0.24, 1.9, FZ - 0.006, 0.04, 0.04, 0.004, P.black);
  // stencilled temperature plate
  box(CX - 0.22, 1.815, FZ - 0.005, 0.12, 0.025, 0.006, P.black);
  for (let i = 0; i < 5; i++) box(CX - 0.265 + i * 0.022, 1.815, FZ - 0.01, 0.012, 0.012, 0.003, P.hazardYellow);
  // warning triangle
  b.part(new THREE.ConeGeometry(0.02, 0.012, 3), P.hazardYellow, { at: [CX + 0.05, 1.73, FZ - 0.018], dir: [0, 0, -1] });

  // bolt rows on the doors
  for (const y of [1.17, 1.74, 0.33, 1.08]) for (let i = 0; i < 6; i++)
    cyl(CX - 0.3 + i * 0.12, y, DF + 0.017, 0.007, 0.006, P.steelDark, "z", 6);

  // ---- vent grille with louvres
  box(CX, 0.25, FZ - 0.002, 0.5, 0.075, 0.01, P.black);
  for (let i = 0; i < 4; i++) box(CX, 0.222 + i * 0.019, FZ - 0.01, 0.48, 0.008, 0.012, P.steelDark, [25, 0, 0]);
  box(CX, 0.25, FZ - 0.016, 0.52, 0.01, 0.006, P.steel);

  // ---- grime & scuffs
  box(CX - 0.1, 0.33, DF + 0.016, 0.22, 0.03, 0.004, P.grime);
  box(CX + 0.2, 0.31, DF + 0.016, 0.12, 0.02, 0.004, P.grime);
  box(CX + 0.26, 0.9, DF + 0.017, 0.03, 0.16, 0.004, P.grime);
  box(CX + 0.26, 1.45, DF + 0.017, 0.03, 0.12, 0.004, P.grime);
  box(CX - 0.2, 0.55, DF + 0.016, 0.02, 0.2, 0.004, P.grime);
  box(CX, 0.17, FZ - 0.005, 0.5, 0.02, 0.004, P.grime);
  box(CX - 0.1, 0.72, DF + 0.016, 0.1, 0.012, 0.004, P.panelDark);

  // ---- clipboard
  const cbx = CX - 0.12, cby = 1.44;
  box(cbx, cby, DF + 0.02, 0.15, 0.2, 0.006, P.ceramic);
  for (let i = 0; i < 6; i++) box(cbx - 0.01 + (i % 2) * 0.01, cby - 0.07 + i * 0.026, DF + 0.0235, 0.09 - (i % 3) * 0.015, 0.006, 0.002, P.black);
  box(cbx, cby + 0.105, DF + 0.026, 0.06, 0.025, 0.012, P.steel);
  cyl(cbx, cby + 0.11, DF + 0.034, 0.008, 0.02, P.steelDark, "x", 6);

  // ---- coolant pipes rising to the ceiling
  const pipeTop = 2.2;
  for (const [px, pz] of [[-1.4, -1.28], [-1.52, -1.3]] as number[][]) {
    cyl(px, (1.96 + pipeTop) / 2, pz, 0.026, pipeTop - 1.96, P.pipeCopper, "y", 8);
    for (let k = 0; k < 3; k++) {
      cyl(px, 2.0 + k * 0.06, pz, 0.036, 0.045, P.panelShade, "y", 8);
    }
    cyl(px, 2.19, pz, 0.04, 0.02, P.steelDark, "y", 8);
    cyl(px, 1.975, pz, 0.04, 0.02, P.steelDark, "y", 8);
  }
  // gauge
  cyl(-1.4, 2.1, -1.2, 0.006, 0.1, P.steelDark, "z", 6);
  cyl(-1.28, 2.1, -1.17, 0.052, 0.03, P.steel, "z", 14);
  cyl(-1.28, 2.1, -1.153, 0.042, 0.006, P.black, "z", 14);
  b.part(new THREE.BoxGeometry(0.004, 0.036, 0.003), P.warnRed, { at: [-1.28, 2.1, -1.148], rotation: [0, 0, 35] });
  cyl(-1.28, 2.1, -1.146, 0.005, 0.004, P.steel, "z", 6);
  for (let i = 0; i < 5; i++) {
    const a = ((-120 + i * 60) * Math.PI) / 180;
    box(-1.28 + Math.sin(a) * 0.034, 2.1 + Math.cos(a) * 0.034, -1.149, 0.004, 0.008, 0.002, P.lampWhite, [0, 0, (-a * 180) / Math.PI]);
  }
  box(-1.28, 2.15, -1.17, 0.01, 0.045, 0.015, P.steelDark);

  // ---- ration dispenser on the right (-x) side
  const DX = -1.74;
  box(DX, 1.15, -0.9, 0.12, 0.62, 0.3, P.blueGrey);
  box(DX - 0.062, 1.15, -0.9, 0.01, 0.6, 0.28, P.panelDark);
  box(DX - 0.067, 1.32, -0.9, 0.005, 0.18, 0.2, P.black); // window
  glow(box(DX - 0.07, 1.32, -0.9, 0.003, 0.14, 0.16, P.crtDark), 0.4);
  const btn = [P.amber, P.warnRed, P.ceramic, P.crtGreen];
  btn.forEach((c, i) => {
    const bz = -0.97 + i * 0.047;
    cyl(DX - 0.07, 1.14, bz, 0.016, 0.012, c, "x", 10);
    cyl(DX - 0.066, 1.14, bz, 0.021, 0.006, P.black, "x", 10);
  });
  // chute and tray
  box(DX - 0.02, 0.95, -0.9, 0.08, 0.08, 0.16, P.steelDark, [0, 0, 0]);
  box(DX - 0.04, 0.88, -0.9, 0.1, 0.012, 0.2, P.steel);
  box(DX - 0.085, 0.9, -0.9, 0.012, 0.04, 0.2, P.steel);
  box(DX - 0.04, 0.9, -1.0, 0.1, 0.04, 0.01, P.steel);
  box(DX - 0.04, 0.9, -0.8, 0.1, 0.04, 0.01, P.steel);
  box(DX, 0.78, -0.9, 0.12, 0.25, 0.3, P.blueGrey); // support lower box
  box(DX - 0.062, 0.78, -0.9, 0.006, 0.2, 0.26, P.panelDark);
  for (let i = 0; i < 4; i++) box(DX - 0.067, 0.68 + i * 0.012, -0.9, 0.004, 0.006, 0.2, P.black);
  box(DX, 1.51, -0.9, 0.125, 0.04, 0.31, P.steelDark);
  glow(cyl(DX - 0.067, 1.46, -1.02, 0.008, 0.008, P.warnRed, "x", 8), 1.4);
  for (const z of [-1.03, -0.77]) for (const y of [0.7, 1.43])
    cyl(DX - 0.064, y, z, 0.007, 0.006, P.steel, "x", 6);
  box(DX - 0.067, 0.98, -0.9, 0.003, 0.02, 0.1, P.hazardYellow);
}
    return buildColdStorage;
  })(),
  // prepCounter
  (() => {
function buildPrepCounter({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = -0.95, X1 = 0.6, ZB = -1.4, ZF = -0.75;
  const cx = (X0 + X1) / 2;
  const own = ["#8a7a52", "#2a2a2c"]; // wood board, dark stain

  // box helper: min/max corners
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], ...opt,
    });
  const cyl = (x: number, y: number, z: number, rt: number, rb: number, h: number, color: string, seg = 10, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, dir ? { at: [x, y, z], dir, axis: "y" } : { at: [x, y, z] });
  const front = [0, 0, 1];
  const rivet = (x: number, y: number, z: number, c = P.steelDark) =>
    b.part(new THREE.SphereGeometry(0.007, 5, 4), c, { at: [x, y, z] });
  const handleBar = (x: number, y: number, z: number, w: number, c = P.steel) => {
    box(x - w / 2, y - 0.006, z, x + w / 2, y + 0.006, z + 0.02, c);
    box(x - w / 2, y - 0.01, z - 0.004, x - w / 2 + 0.01, y + 0.01, z + 0.004, c);
    box(x + w / 2 - 0.01, y - 0.01, z - 0.004, x + w / 2, y + 0.01, z + 0.004, c);
  };

  // ---------- COUNTER BODY ----------
  box(X0, 0.08, ZB, X1, 0.16, ZF - 0.04, P.panelDark); // plinth
  box(X0, 0.16, ZB, X1, 0.9, ZF, P.panelOlive);
  // worktop
  box(X0, 0.9, ZB, X1, 0.94, ZF + 0.03, P.steel);
  box(X0, 0.9, ZF + 0.03, X1, 0.945, ZF + 0.045, P.steelDark);
  // 4 fronts
  const fw = (X1 - X0 - 0.1) / 4;
  for (let i = 0; i < 4; i++) {
    const x0 = X0 + 0.025 + i * (fw + 0.017);
    const x1 = x0 + fw;
    const drawer = i % 2 === 0;
    box(x0 - 0.01, 0.2, ZF, x1 + 0.01, 0.86, ZF + 0.008, P.panelShade);
    box(x0, 0.21, ZF + 0.008, x1, 0.85, ZF + 0.022, P.panelCream);
    if (drawer) box(x0 + 0.02, 0.4, ZF + 0.022, x1 - 0.02, 0.402, ZF + 0.026, P.panelShade);
    handleBar((x0 + x1) / 2, drawer ? 0.78 : 0.55, ZF + 0.022, 0.12);
    for (const [rx, ry] of [[x0 + 0.015, 0.225], [x1 - 0.015, 0.225], [x0 + 0.015, 0.835], [x1 - 0.015, 0.835]])
      rivet(rx, ry, ZF + 0.024);
    box(x0 + 0.03, 0.24, ZF + 0.022, x0 + 0.08, 0.265, ZF + 0.026, P.black);
    box(x0 + 0.035, 0.246, ZF + 0.026, x0 + 0.075, 0.249, ZF + 0.028, P.hazardYellow);
    // grime scuff at foot
    box(x0 + R() * 0.05, 0.21, ZF + 0.022, x0 + 0.1 + R() * 0.1, 0.235, ZF + 0.0235, P.grime);
  }
  box(X0, 0.0, 0, X0, 0, 0, P.black, { visible: false });

  // ---------- SINK ----------
  const sx = M.sinkCenter[0], sz = -1.1;
  box(sx - 0.2, 0.935, sz - 0.17, sx + 0.2, 0.945, sz + 0.17, P.steelDark);
  box(sx - 0.17, 0.93, sz - 0.14, sx + 0.17, 0.95, sz + 0.14, P.black);
  const wall = (x0: number, z0: number, x1: number, z1: number) => box(x0, 0.935, z0, x1, 0.96, z1, P.steel);
  wall(sx - 0.2, sz - 0.17, sx + 0.2, sz - 0.14);
  wall(sx - 0.2, sz + 0.14, sx + 0.2, sz + 0.17);
  wall(sx - 0.2, sz - 0.14, sx - 0.17, sz + 0.14);
  wall(sx + 0.17, sz - 0.14, sx + 0.2, sz + 0.14);
  cyl(sx, 0.952, sz, 0.02, 0.02, 0.006, P.steelDark, 8);
  // tap
  const tapPts = [[sx, 0.94, sz - 0.2], [sx, 1.1, sz - 0.2], [sx, 1.17, sz - 0.17], [sx, 1.14, sz - 0.08], [sx, 1.1, sz - 0.05]];
  b.sweep(tapPts, 0.012, { color: P.steel, caps: "round", sides: 8 });
  cyl(sx, 0.95, sz - 0.2, 0.025, 0.03, 0.02, P.steelDark, 8);
  cyl(sx - 0.07, 0.975, sz - 0.2, 0.012, 0.012, 0.04, P.steel, 6);
  cyl(sx + 0.07, 0.975, sz - 0.2, 0.012, 0.012, 0.04, P.steel, 6);
  cyl(sx - 0.07, 1.0, sz - 0.2, 0.03, 0.03, 0.01, P.warnRed, 8);
  cyl(sx + 0.07, 1.0, sz - 0.2, 0.03, 0.03, 0.01, P.blueGrey, 8);
  box(sx - 0.1, 1.0, sz - 0.205, sx - 0.04, 1.004, sz - 0.195, P.warnRed);
  // draining rack beside sink (to the left on worktop)
  const rx = X0 + 0.13, rz = -1.1;
  box(rx - 0.11, 0.94, rz - 0.15, rx + 0.11, 0.955, rz + 0.15, P.steelDark);
  for (let i = 0; i < 3; i++) {
    box(rx - 0.1, 0.955, rz - 0.13 + i * 0.045, rx + 0.1, 0.965 + 0.1, rz - 0.125 + i * 0.045, P.steel);
    cyl(rx, 1.0, rz - 0.13 + i * 0.045 + 0.0025, 0.075, 0.075, 0.004, P.ceramic, 14, [0, 0, 1]);
  }
  for (const k of [0, 1]) {
    cyl(rx - 0.05 + k * 0.1, 0.99, rz + 0.1, 0.025, 0.022, 0.06, P.ceramic, 8);
    cyl(rx - 0.05 + k * 0.1, 1.018, rz + 0.1, 0.021, 0.021, 0.004, P.coffee, 8);
  }

  // ---------- RIGHT SIDE ITEMS ----------
  // toaster
  const tx = 0.38;
  box(tx - 0.09, 0.94, -1.2, tx + 0.09, 1.04, -1.0, P.steel);
  box(tx - 0.09, 1.04, -1.2, tx + 0.09, 1.05, -1.0, P.steelDark);
  box(tx - 0.07, 1.05, -1.17, tx - 0.01, 1.052, -1.03, P.black);
  box(tx + 0.01, 1.05, -1.17, tx + 0.07, 1.052, -1.03, P.black);
  cyl(tx, 0.99, -0.995, 0.014, 0.014, 0.012, P.black, 8, front);
  box(tx + 0.095, 0.98, -1.12, tx + 0.105, 1.0, -1.08, P.black);
  box(tx - 0.08, 0.96, -1.0, tx + 0.08, 0.975, -0.995, P.panelDark);
  // hot plate + coffee pot
  const hx = 0.12, hz = -1.0;
  cyl(hx, 0.955, hz, 0.075, 0.08, 0.03, P.panelDark, 12);
  glow(b.part(new THREE.TorusGeometry(0.05, 0.007, 5, 14), P.amber, { at: [hx, 0.972, hz], dir: [0, 1, 0], axis: "z" }), 1.4);
  cyl(hx, 0.99, hz, 0.055, 0.06, 0.03, P.steel, 10);
  cyl(hx, 1.07, hz, 0.052, 0.058, 0.13, P.black, 10);
  cyl(hx, 1.136, hz, 0.047, 0.047, 0.004, P.coffee, 10);
  cyl(hx, 1.14, hz, 0.056, 0.056, 0.015, P.steel, 10);
  cyl(hx, 1.155, hz, 0.012, 0.012, 0.012, P.black, 6);
  b.sweep([[hx + 0.055, 1.12, hz], [hx + 0.1, 1.11, hz], [hx + 0.1, 1.03, hz], [hx + 0.056, 1.02, hz]], 0.007, { color: P.black, sides: 6 });
  // cutting board, knife, trays
  const bx = -0.2, bz = -1.0;
  box(bx - 0.14, 0.94, bz - 0.09, bx + 0.14, 0.96, bz + 0.09, own[0]);
  box(bx - 0.12, 0.96, bz - 0.07, bx - 0.08, 0.961, bz + 0.05, own[1]);
  box(bx - 0.0, 0.962, bz + 0.0, bx + 0.12, 0.966, bz + 0.02, P.steel);
  box(bx + 0.12, 0.962, bz - 0.005, bx + 0.19, 0.972, bz + 0.025, P.black);
  for (let i = 0; i < 3; i++) box(bx - 0.17, 0.94 + i * 0.012, bz - 0.18, bx + 0.0, 0.95 + i * 0.012, bz - 0.06, P.steel);
  box(bx - 0.16, 0.975, bz - 0.17, bx - 0.01, 0.98, bz - 0.07, P.steelDark);
  // cans
  const cans = [[0.2, -0.88], [0.3, -0.9], [0.5, -0.86], [0.46, -1.2], [0.24, -1.25]];
  cans.forEach(([x, z], i) => {
    const h = i % 2 ? 0.1 : 0.12;
    cyl(x, 0.94 + h / 2, z, 0.035, 0.035, h, [P.panelCream, P.rust, P.hazardYellow][i % 3], 10);
    cyl(x, 0.94 + h * 0.5, z, 0.0365, 0.0365, 0.025, [P.rust, P.hazardYellow, P.warnRed][i % 3], 10);
    cyl(x, 0.94 + h + 0.002, z, 0.03, 0.03, 0.004, P.steelDark, 10);
  });
  // spice rack on wall shelf over backsplash
  box(0.4, 1.12, -1.4 + 0.0, 0.58, 1.135, -1.28, P.panelDark);
  for (let i = 0; i < 5; i++) {
    const x = 0.425 + i * 0.033;
    cyl(x, 1.17, -1.34, 0.013, 0.013, 0.05, P.ceramic, 6);
    cyl(x, 1.2, -1.34, 0.014, 0.014, 0.012, [P.rust, P.hazardYellow, P.warnRed, P.panelOlive, P.black][i], 6);
  }

  // ---------- BACKSPLASH ----------
  box(X0, 0.94, ZB, X1, 1.5, ZB + 0.02, P.steel);
  for (let i = 1; i < 4; i++) box(X0 + i * 0.3875 - 0.005, 0.94, ZB + 0.02, X0 + i * 0.3875 + 0.005, 1.5, ZB + 0.024, P.steelDark);
  box(X0, 1.0, ZB + 0.02, X1, 1.006, ZB + 0.024, P.steelDark);
  for (let i = 0; i < 20; i++) { rivet(X0 + 0.04 + i * 0.0775, 0.97, ZB + 0.026); rivet(X0 + 0.04 + i * 0.0775, 1.48, ZB + 0.026); }
  // grime splashes behind sink
  for (let i = 0; i < 6; i++) {
    const x = sx - 0.18 + R() * 0.36;
    box(x, 0.96 + R() * 0.1, ZB + 0.02, x + 0.015, 1.1 + R() * 0.2, ZB + 0.0215, P.grime);
  }
  box(sx - 0.15, 1.0, ZB + 0.02, sx + 0.12, 1.04, ZB + 0.0215, P.grime);

  // ---------- CRT ----------
  const cxm = 0.25;
  box(0.1, 1.09, ZB + 0.02, 0.4, 1.11, -1.0, P.panelDark); // shelf
  box(0.1, 1.09, -1.0, 0.4, 1.11, -0.98, P.steelDark);
  box(0.12, 1.11, -1.2, 0.38, 1.125, -1.0 - 0.0, P.panelDark);
  b.sweep([[cxm, 1.2, ZB + 0.02], [cxm, 1.26, ZB + 0.12], [cxm, 1.3, -1.2]], 0.015, { color: P.steel, sides: 6 });
  box(cxm - 0.05, 1.18, ZB + 0.02, cxm + 0.05, 1.34, ZB + 0.04, P.steelDark);
  box(0.1, 1.16, -1.3, 0.4, 1.42, -1.17, P.panelCream);
  box(0.13, 1.19, -1.17, 0.37, 1.4, -1.07, P.panelShade);
  box(0.15, 1.2, -1.07, 0.35, 1.39, -1.05, P.panelShade);
  box(0.15, 1.2, -1.05, 0.35, 1.215, -1.04, P.panelShade);
  box(0.15, 1.375, -1.05, 0.35, 1.39, -1.04, P.panelShade);
  box(0.15, 1.2, -1.05, 0.165, 1.39, -1.04, P.panelShade);
  box(0.335, 1.2, -1.05, 0.35, 1.39, -1.04, P.panelShade);
  const tex = new THREE.CanvasTexture((() => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 128;
    const g = c.getContext("2d")!; g.fillStyle = "#0c2a18"; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#6dff9a"; g.font = "bold 11px monospace";
    ["MOTHER", "GALLEY MENU", "1 RATION A", "2 RATION B", "3 COFFEE", "> READY_"].forEach((t, i) => g.fillText(t, 10, 22 + i * 16));
    g.fillStyle = "rgba(0,0,0,0.35)"; for (let y = 0; y < 128; y += 4) g.fillRect(0, y, 128, 1);
    return c;
  })());
  glow(b.part(new THREE.PlaneGeometry(0.17, 0.15), "#ffffff", { at: [cxm, 1.295, -1.039], dir: [0, 0, 1], axis: "z", texture: tex }), 1);
  box(0.2, 1.16, -1.05, 0.26, 1.18, -1.04, P.black);
  box(0.215, 1.163, -1.04, 0.245, 1.17, -1.038, P.hazardYellow);
  cyl(0.31, 1.17, -1.04, 0.013, 0.013, 0.02, P.steel, 8, front);
  cyl(0.345, 1.17, -1.04, 0.013, 0.013, 0.02, P.steel, 8, front);
  // keyboard
  box(0.14, 1.125, -1.1, 0.36, 1.14, -0.98, P.panelDark);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++)
    box(0.15 + k * 0.026, 1.14, -1.08 + r * 0.035, 0.17 + k * 0.026, 1.147, -1.055 + r * 0.035, r === 2 && k > 1 && k < 6 ? P.steel : P.panelShade);

  // ---------- OVERHEAD CABINETS ----------
  const cw = (1.45 - 0.1) / 3 ;
  const CZ0 = ZB, CZ1 = -1.05;
  for (let i = 0; i < 3; i++) {
    const x0 = -0.9 + i * (cw + 0.025), x1 = x0 + cw;
    box(x0, 1.5, CZ0, x1, 2.25, CZ1, P.panelCream);
    box(x0 - 0.005, 1.5, CZ1 - 0.003, x1 + 0.005, 1.52, CZ1 + 0.012, P.panelOlive);
    box(x0 - 0.005, 2.23, CZ1 - 0.003, x1 + 0.005, 2.25, CZ1 + 0.012, P.panelOlive);
    box(x0 + 0.01, 1.52, CZ1, x1 - 0.01, 2.23, CZ1 + 0.008, P.panelShade);
    box(x0 + 0.02, 1.54, CZ1 + 0.008, x1 - 0.02, 2.21, CZ1 + 0.016, P.panelCream);
    const hx2 = i === 1 ? x1 - 0.04 : x0 + 0.04;
    box(hx2 - 0.007, 1.62, CZ1 + 0.016, hx2 + 0.007, 1.8, CZ1 + 0.03, P.steel);
    for (const hy of [1.6, 2.15]) box(i === 1 ? x0 + 0.01 : x1 - 0.03, hy, CZ1 + 0.012, i === 1 ? x0 + 0.03 : x1 - 0.01, hy + 0.04, CZ1 + 0.02, P.steelDark);
    box(x0 + 0.06, 2.1, CZ1 + 0.016, x0 + 0.06 + 0.1, 2.14, CZ1 + 0.02, P.black);
    box(x0 + 0.065, 2.107, CZ1 + 0.02, x0 + 0.145, 2.113, CZ1 + 0.022, P.hazardYellow);
    box(x0 + 0.065, 2.12, CZ1 + 0.02, x0 + 0.12, 2.126, CZ1 + 0.022, P.hazardYellow);
    box(x0 + 0.04 + R() * 0.1, 1.54, CZ1 + 0.016, x0 + 0.1 + R() * 0.12, 1.57 + R() * 0.1, CZ1 + 0.0175, P.grime);
    rivet(x0 + 0.03, 1.56, CZ1 + 0.018); rivet(x1 - 0.03, 1.56, CZ1 + 0.018);
    rivet(x0 + 0.03, 2.19, CZ1 + 0.018); rivet(x1 - 0.03, 2.19, CZ1 + 0.018);
  }
  // under cabinet strip light
  box(-0.88, 1.465, -1.3, 0.52, 1.5, -1.12, P.panelDark);
  glow(box(-0.86, 1.455, -1.27, 0.5, 1.465, -1.15, P.lampWhite), 1.3);
  // ladle rack
  const lx = -0.2, lz = -1.18;
  box(lx - 0.2, 1.43, lz - 0.015, lx + 0.2, 1.45, lz + 0.015, P.steelDark);
  for (const e of [-0.19, 0.19]) box(lx + e - 0.01, 1.45, lz - 0.01, lx + e + 0.01, 1.5, lz + 0.01, P.steelDark);
  const tools = [
    () => { b.sweep([[lx - 0.14, 1.43, lz], [lx - 0.14, 1.28, lz]], 0.005, { color: P.steel, sides: 5 }); cyl(lx - 0.14, 1.25, lz, 0.03, 0.02, 0.04, P.steel, 8); },
    () => { b.sweep([[lx - 0.05, 1.43, lz], [lx - 0.05, 1.3, lz]], 0.004, { color: P.black, sides: 5 }); box(lx - 0.07, 1.22, lz - 0.01, lx - 0.03, 1.3, lz + 0.01, P.steel); },
    () => { b.sweep([[lx + 0.05, 1.43, lz], [lx + 0.05, 1.28, lz]], 0.004, { color: P.steelDark, sides: 5 }); box(lx + 0.04, 1.2, lz - 0.005, lx + 0.06, 1.28, lz + 0.005, P.steel); box(lx + 0.03, 1.2, lz - 0.005, lx + 0.07, 1.24, lz + 0.005, P.steel); },
    () => { b.sweep([[lx + 0.14, 1.43, lz], [lx + 0.14, 1.3, lz]], 0.005, { color: P.black, sides: 5 }); box(lx + 0.13, 1.2, lz - 0.004, lx + 0.15, 1.3, lz + 0.004, P.steel); box(lx + 0.12, 1.2, lz - 0.004, lx + 0.18, 1.25, lz + 0.004, P.steel); },
  ];
  tools.forEach((t) => t());
  // side stain strips on counter ends
  box(X0, 0.17, ZB, X0 + 0.01, 0.3, ZF, P.grime);
  box(X1 - 0.01, 0.17, ZF - 0.3, X1, 0.3, ZF, P.grime);
}
    return buildPrepCounter;
  })(),
  // cookingStation
  (() => {
function buildCookingStation({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = 0.6, X1 = 1.8, CX = 1.2, ZB = -1.4, ZF = -0.7;
  const EXTRA = { oven: "#1a1a1c", bright: "#d8dde0" };

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: number[], c: string, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, dir ? { at: at as any, dir: dir as any } : { at: at as any });
  const alongZ = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, c: string) =>
    cyl(rt, rb, h, seg, [x, y, z], c, [0, 0, 1]);
  const alongX = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, c: string) =>
    cyl(rt, rb, h, seg, [x, y, z], c, [1, 0, 0]);
  const lamp = (r: number, at: number[], c: string, s = 1.2) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: at as any }), s);

  const FZ = ZF; // front plane

  // ---- Range body
  box(1.2, 0.12, 0.7, CX, 0.14, -1.05, P.panelDark);
  box(1.2, 0.7, 0.66, CX, 0.55, -1.07, P.panelCream);
  box(1.2, 0.04, 0.7, CX, 0.92, -1.05, P.black); // cooktop plate
  box(1.22, 0.03, 0.02, CX, 0.905, FZ + 0.005, P.steel); // front lip
  // side steel trims
  for (const x of [X0 + 0.01, X1 - 0.01]) box(0.02, 0.7, 0.66, x, 0.55, -1.07, P.steel);
  // oven door
  box(0.8, 0.46, 0.03, CX, 0.43, FZ + 0.0, P.steel);
  box(0.64, 0.3, 0.02, CX, 0.46, FZ + 0.02, EXTRA.oven);
  glow(box(0.56, 0.025, 0.01, CX, 0.4, FZ + 0.032, P.amber), 0.8);
  // handle bar
  alongX(0.015, 0.015, 0.7, 8, CX, 0.66, FZ + 0.07, P.steelDark);
  for (const dx of [-0.32, 0.32]) box(0.025, 0.025, 0.06, CX + dx, 0.66, FZ + 0.04, P.steelDark);
  // thermometer dial
  alongZ(0.035, 0.035, 0.015, 12, CX + 0.33, 0.28, FZ + 0.025, P.steel);
  alongZ(0.028, 0.028, 0.005, 12, CX + 0.33, 0.28, FZ + 0.032, P.lampWhite);
  box(0.004, 0.025, 0.003, CX + 0.33, 0.285, FZ + 0.036, P.warnRed);
  // drawer
  box(1.1, 0.14, 0.03, CX, 0.17 + 0.0, FZ + 0.0, P.panelShade);
  box(1.1, 0.01, 0.035, CX, 0.245, FZ + 0.0, P.black);
  alongX(0.012, 0.012, 0.4, 8, CX, 0.17, FZ + 0.05, P.steel);
  for (const dx of [-0.18, 0.18]) box(0.02, 0.02, 0.04, CX + dx, 0.17, FZ + 0.03, P.steelDark);
  // control panel
  box(1.12, 0.17, 0.06, CX, 0.795, FZ - 0.0, P.panelDark);
  for (let i = 0; i < 4; i++) {
    const x = X0 + 0.13 + i * 0.13;
    alongZ(0.035, 0.04, 0.04, 10, x, 0.82, FZ + 0.045, P.steel);
    box(0.006, 0.03, 0.006, x, 0.835, FZ + 0.068, P.lampWhite);
  }
  for (let i = 0; i < 5; i++) {
    const x = X0 + 0.66 + i * 0.045;
    box(0.025, 0.03, 0.012, x, 0.76, FZ + 0.035, P.black);
    alongZ(0.005, 0.005, 0.035, 6, x, 0.765, FZ + 0.055, P.steel);
  }
  alongZ(0.04, 0.04, 0.02, 12, X0 + 0.9, 0.83, FZ + 0.04, P.steel);
  box(0.005, 0.03, 0.004, X0 + 0.9, 0.84, FZ + 0.052, P.black);
  [[P.warnRed, 0], [P.amber, 1], [P.crtGreen, 2]].forEach(([c, i]: any) =>
    glow(b.part(new THREE.SphereGeometry(0.01, 8, 6), c, { at: [X0 + 0.7 + i * 0.05, 0.83, FZ + 0.035] }), 1.3),
  );
  box(0.2, 0.025, 0.006, X0 + 0.2, 0.745, FZ + 0.032, P.hazardYellow);
  box(0.14, 0.012, 0.004, X0 + 0.2, 0.745, FZ + 0.036, P.black);
  // rivet rows
  for (let i = 0; i < 14; i++) {
    const x = X0 + 0.06 + i * 0.077;
    b.part(new THREE.SphereGeometry(0.007, 5, 4), P.steelDark, { at: [x, 0.88, FZ + 0.03] });
  }
  // grime
  for (let i = 0; i < 12; i++) {
    const x = X0 + 0.1 + R() * 1.0, y = 0.55 + R() * 0.35;
    box(0.04 + R() * 0.08, 0.02 + R() * 0.06, 0.004, x, y, FZ + 0.036 + R() * 0.004, P.grime);
  }
  box(1.0, 0.02, 0.004, CX, 0.13, FZ + 0.0, P.grime);

  // ---- Cooktop burners
  const bp: number[][] = [[0.95, -0.92], [1.45, -0.92], [0.95, -1.2], [1.45, -1.2]];
  bp.forEach(([x, z], i) => {
    cyl(0.085, 0.09, 0.012, 14, [x, 0.946, z], P.steelDark);
    cyl(0.055, 0.055, 0.016, 12, [x, 0.95, z], P.black);
    cyl(0.025, 0.025, 0.02, 8, [x, 0.955, z], P.steel);
    box(0.2, 0.012, 0.012, x, 0.97, z, P.black);
    box(0.012, 0.012, 0.2, x, 0.97, z, P.black);
    if (i === 0) glow(cyl(0.07, 0.07, 0.004, 14, [x, 0.955, z], P.amber), 0.7);
  });

  // ---- Stockpot (back right)
  cyl(0.13, 0.13, 0.28, 14, [1.45, 1.1, -1.2], P.steel);
  cyl(0.135, 0.135, 0.02, 14, [1.45, 1.25, -1.2], P.steelDark);
  cyl(0.133, 0.133, 0.015, 14, [1.45, 1.245, -1.2], P.steel);
  cyl(0.136, 0.136, 0.02, 14, [1.45, 0.97, -1.2], P.steelDark);
  cyl(0.136, 0.136, 0.02, 14, [1.45, 1.3, -1.2], P.steelDark);
  cyl(0.136, 0.14, 0.02, 14, [1.45, 1.245, -1.2], P.steelDark);
  cyl(0.136, 0.136, 0.03, 14, [1.45, 1.25, -1.2], P.steel);
  cyl(0.02, 0.02, 0.03, 8, [1.45, 1.285, -1.2], P.black);
  for (const s of [1, -1]) {
    box(0.07, 0.025, 0.025, 1.45 + s * 0.16, 1.18, -1.2, P.steelDark);
    for (const dz of [-0.008, 0.008]) b.part(new THREE.SphereGeometry(0.007, 5, 4), P.steel, { at: [1.45 + s * 0.13, 1.18, -1.2 + dz * 3] });
  }
  box(0.1, 0.03, 0.004, 1.45, 1.05, -1.065, P.hazardYellow);
  box(0.2, 0.05, 0.004, 1.45, 1.0, -1.065, P.grime);

  // ---- Frying pan with food
  cyl(0.11, 0.09, 0.04, 14, [0.95, 0.99, -0.92], P.black);
  cyl(0.095, 0.095, 0.004, 14, [0.95, 1.005, -0.92], P.grime);
  [[-0.03, 0.02, P.coffee], [0.03, 0.03, P.catCream], [0.0, -0.04, P.grime]].forEach(([dx, dz, c]: any) =>
    cyl(0.025, 0.025, 0.01, 8, [0.95 + dx, 1.012, -0.92 + dz], c),
  );
  box(0.04, 0.015, 0.22, 0.95, 1.0, -0.74, P.black);
  box(0.03, 0.012, 0.04, 0.95, 1.0, -0.62 + -0.0, P.black);
  cyl(0.008, 0.008, 0.02, 6, [0.95, 1.012, -0.75], P.steel);

  // ---- Kettle (front right)
  cyl(0.09, 0.1, 0.16, 12, [1.45, 1.02, -0.92], P.steelDark);
  cyl(0.06, 0.09, 0.05, 12, [1.45, 1.13, -0.92], P.steelDark);
  cyl(0.015, 0.015, 0.03, 6, [1.45, 1.17, -0.92], P.black);
  alongX(0.012, 0.012, 0.1, 6, 1.45, 1.2, -0.92, P.black);
  cyl(0.012, 0.025, 0.1, 6, [1.54, 1.1, -0.92], P.steelDark, [1, 1, 0]);
  box(0.02, 0.08, 0.03, 1.36, 1.1, -0.92, P.black);

  // ---- Spoon rest, spatula, ladle
  box(0.14, 0.02, 0.05, 1.45, 0.96, -1.2 + 0.48, P.steelDark);
  cyl(0.005, 0.005, 0.2, 6, [1.43, 0.99, -0.72 - 0.0], P.steel, [0.1, 0.1, 1]);
  box(0.05, 0.004, 0.06, 1.43, 0.985, -0.62 - 0.0 - 0.06, P.steel);
  cyl(0.005, 0.005, 0.2, 6, [1.48, 0.99, -0.75], P.black, [-0.1, 0.1, 1]);

  // ---- Tins and foil packs (left of rear)
  for (let i = 0; i < 4; i++) {
    const x = 0.7 + (i % 2) * 0.09, z = -1.3 + Math.floor(i / 2) * 0.09;
    cyl(0.035, 0.035, 0.07, 10, [x, 0.995, z], i % 2 ? P.rust : P.steel);
    cyl(0.036, 0.036, 0.015, 10, [x, 0.995, z], P.hazardYellow);
  }
  cyl(0.032, 0.032, 0.07, 10, [0.745, 1.065, -1.26], P.panelOlive);
  box(0.12, 0.03, 0.08, 0.7, 0.955, -1.0 + 0.0, P.steel);
  box(0.1, 0.02, 0.07, 0.7, 0.98, -1.0, P.steelDark);

  // ---- Backsplash
  box(1.2, 0.56, 0.02, CX, 1.22, -1.385, P.steel);
  for (let i = 1; i < 4; i++) box(0.012, 0.56, 0.006, X0 + i * 0.3, 1.22, -1.372, P.steelDark);
  box(1.2, 0.012, 0.006, CX, 1.22, -1.372, P.steelDark);
  for (let i = 0; i < 24; i++) {
    const x = X0 + 0.03 + i * 0.05;
    b.part(new THREE.SphereGeometry(0.006, 5, 4), P.steelDark, { at: [x, 0.97, -1.372] });
  }
  for (let i = 0; i < 9; i++) {
    const x = X0 + 0.1 + R() * 1.0;
    box(0.015 + R() * 0.02, 0.1 + R() * 0.25, 0.004, x, 1.1 + R() * 0.2, -1.372, P.grime);
  }

  // ---- Hood
  box(1.2, 0.05, 0.56, CX, 1.57, -1.12, P.panelDark);
  // tapering hood via frustum cylinder (4-sided)
  b.part(new THREE.CylinderGeometry(0.35, 0.8, 0.5, 4, 1).rotateY(Math.PI / 4).scale(1.05, 1, 0.62), P.steel, { at: [CX, 1.85, -1.12] });
  // flatten check: width ~1.2 at bottom, depth ~0.5
  box(1.2, 0.03, 0.04, CX, 1.6, -0.85, P.panelDark);
  box(1.14, 0.02, 0.5, CX, 1.54, -1.12, P.steelDark);
  for (let i = 0; i < 9; i++) box(0.1, 0.012, 0.46, X0 + 0.1 + i * 0.125, 1.52, -1.12, P.black);
  for (const s of [-1, 1]) {
    const x = CX + s * 0.4;
    cyl(0.04, 0.04, 0.05, 8, [x, 1.5, -0.95], P.black);
    glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), P.amber, { at: [x, 1.49, -0.95] }), 1.4);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      box(0.005, 0.06, 0.005, x + Math.cos(a) * 0.04, 1.49, -0.95 + Math.sin(a) * 0.04, P.black);
    }
  }
  // chimney
  box(0.3, 0.45, 0.3, CX, 2.0, -1.2, P.steel);
  box(0.4, 0.04, 0.4, CX, 2.2, -1.2, P.steelDark);
  box(0.36, 0.03, 0.36, CX, 2.26, -1.2, P.steelDark);
  box(0.4, 0.04, 0.4, CX, 1.78, -1.2, P.steelDark);
  for (const dx of [-0.17, 0.17]) for (const dz of [-0.17, 0.17]) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), P.black, { at: [CX + dx, 2.225, -1.2 + dz] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), P.black, { at: [CX + dx, 1.805, -1.2 + dz] });
  }
  // emergency stop
  box(0.1, 0.1, 0.03, 1.62, 1.62, -0.85, P.hazardYellow);
  alongZ(0.025, 0.025, 0.03, 10, 1.62, 1.62, -0.82, P.warnRed);
  box(0.12, 0.012, 0.04, 1.62, 1.68, -0.82, P.black);
  // fire suppression nozzle
  cyl(0.003, 0.025, 0.06, 8, [0.85, 1.47, -1.1], P.rust);
  cyl(0.01, 0.01, 0.05, 6, [0.85, 1.52, -1.1], P.steel);
  // hood grease
  for (let i = 0; i < 6; i++) box(0.02, 0.1 + R() * 0.1, 0.004, X0 + 0.2 + R() * 0.9, 1.85, -0.9 + 0.0 - 0.0 + 0.0 - 0.0 * i - 0.0, P.grime).visible = false;

  // ---- Utensil rail
  alongX(0.01, 0.01, 1.0, 6, 1.2, 1.45, -1.33, P.steel);
  for (const x of [0.7, 1.7]) box(0.02, 0.03, 0.06, x, 1.45, -1.36, P.steelDark);
  const hang = (x: number, len: number, c: string, head: [number, number, number, string]) => {
    cyl(0.005, 0.005, 0.03, 4, [x, 1.46, -1.33], P.steel);
    cyl(0.006, 0.006, len, 6, [x, 1.45 - len / 2, -1.31], c);
    box(head[0], head[1], head[2], x, 1.45 - len - head[1] / 2, -1.31, head[3]);
  };
  hang(0.78, 0.2, P.steel, [0.07, 0.06, 0.02, P.steel]); // ladle
  hang(0.98, 0.2, P.steel, [0.05, 0.08, 0.02, P.steelDark]); // whisk
  hang(1.2, 0.22, P.steelDark, [0.03, 0.06, 0.012, P.steel]); // tongs
  hang(1.45, 0.14, P.black, [0.1, 0.08, 0.012, P.steel]); // chopper
  hang(1.65, 0.16, P.steel, [0.06, 0.05, 0.02, P.steel]);

  // ---- Side pipe from range to wall
  alongX(0.02, 0.02, 0.2, 8, 1.7, 0.6, -1.3, P.steelDark);
  cyl(0.02, 0.02, 0.15, 8, [1.7, 0.62, -1.33], P.steel, [0, 0, 1]);
  for (const y of [0.55, 0.7]) cyl(0.028, 0.028, 0.015, 8, [1.7, y, -1.3], P.steelDark, [0, 0, 1]);
  cyl(0.022, 0.022, 0.5, 8, [1.72, 0.68, -1.2], P.steel);
  cyl(0.03, 0.03, 0.02, 8, [1.72, 0.45, -1.2], P.steelDark);
  cyl(0.03, 0.03, 0.02, 8, [1.72, 0.85, -1.2], P.steelDark);
}
    return buildCookingStation;
  })(),
  // messTable
  (() => {
function buildMessTable({ b, P, M }: Ctx) {
  const R = rng(11);
  const DECK = M.deckTop[1]; // 0.08
  const TOP = 0.78;
  const TCZ = 0.35;

  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
    rot?: [number, number, number],
    scale?: [number, number, number],
  ) => b.part(geo, color, { at: [x, y, z], rotation: rot, scale, flat: true });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    put(new THREE.BoxGeometry(w, h, d), c, x, y, z, rot);
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10, rot?: [number, number, number]) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, rot);
  const ball = (r: number, c: string, x: number, y: number, z: number, s: [number, number, number] = [1, 1, 1], seg = 8) =>
    put(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), c, x, y, z, undefined, s);
  const torus = (R0: number, r: number, c: string, x: number, y: number, z: number, arc = Math.PI * 2, rot: [number, number, number] = [90, 0, 0]) =>
    put(new THREE.TorusGeometry(R0, r, 5, 14, arc), c, x, y, z, rot);

  // ---------- TABLE ----------
  box(1.4, 0.04, 0.8, P.steel, 0, 0.76, TCZ);
  // raised rim
  box(1.4, 0.025, 0.025, P.steelDark, 0, 0.79, TCZ - 0.388);
  box(1.4, 0.025, 0.025, P.steelDark, 0, 0.79, TCZ + 0.388);
  box(0.025, 0.025, 0.75, P.steelDark, -0.688, 0.79, TCZ);
  box(0.025, 0.025, 0.75, P.steelDark, 0.688, 0.79, TCZ);
  // chamfer corner blocks
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.07, 0.045, 0.035, P.steelDark, sx * 0.67, 0.775, TCZ + sz * 0.37, [0, sx * sz * 45, 0]);
      box(0.03, 0.02, 0.03, P.black, sx * 0.67, 0.805, TCZ + sz * 0.37, [0, 45, 0]);
    }
  // underside frame
  box(1.3, 0.05, 0.04, P.panelDark, 0, 0.72, TCZ - 0.34);
  box(1.3, 0.05, 0.04, P.panelDark, 0, 0.72, TCZ + 0.34);
  box(0.04, 0.05, 0.68, P.panelDark, -0.62, 0.72, TCZ);
  box(0.04, 0.05, 0.68, P.panelDark, 0.62, 0.72, TCZ);
  box(1.2, 0.05, 0.05, P.panelDark, 0, 0.72, TCZ);
  box(0.05, 0.05, 0.64, P.panelDark, 0, 0.72, TCZ);
  // pedestal
  cyl(0.09, 0.1, 0.62, P.steel, 0, 0.41, TCZ, 12);
  cyl(0.1, 0.26, 0.1, P.steel, 0, 0.14, TCZ, 12);
  cyl(0.28, 0.28, 0.03, P.steelDark, 0, DECK + 0.015, TCZ, 12);
  cyl(0.105, 0.115, 0.05, P.hazardYellow, 0, 0.23, TCZ, 12);
  cyl(0.103, 0.105, 0.02, P.black, 0, 0.28, TCZ, 12);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    cyl(0.016, 0.016, 0.02, P.black, Math.cos(a) * 0.23, DECK + 0.04, TCZ + Math.sin(a) * 0.23, 6);
  }

  // ---------- TABLE TOP ITEMS ----------
  const Y = TOP;
  const settings: [number, number, number][] = [
    [-0.42, 0.55, 1],
    [0.38, 0.55, 1],
    [-0.42, 0.15, -1],
    [0.38, 0.15, -1],
  ];
  const foods = [P.catCream, P.grime, "#7a8048"];
  settings.forEach(([x, z, dirz], i) => {
    // tray + compartments
    box(0.26, 0.012, 0.19, P.steel, x, Y + 0.006, z);
    box(0.26, 0.008, 0.01, P.steelDark, x, Y + 0.016, z - 0.0);
    box(0.01, 0.008, 0.09, P.steelDark, x + 0.03, Y + 0.016, z + 0.045);
    ball(0.032, foods[i % 3], x - 0.07, Y + 0.02, z + 0.04, [1, 0.45, 1], 6);
    ball(0.028, foods[(i + 1) % 3], x + 0.08, Y + 0.02, z - 0.04, [1, 0.45, 1], 6);
    // cutlery
    box(0.012, 0.004, 0.13, P.steel, x - 0.17, Y + 0.002, z + 0.0 * dirz);
    ball(0.012, P.steel, x - 0.2, Y + 0.004, z, [1, 0.3, 1.6], 5);
    // mug
    const mx = x + 0.19 * (x > 0 ? 1 : 1);
    const mz = z - 0.08 * dirz;
    const mc = i === 3 ? P.rust : P.ceramic;
    cyl(0.032, 0.03, 0.07, mc, mx, Y + 0.035, mz, 8);
    cyl(0.028, 0.028, 0.004, P.coffee, mx, Y + 0.068, mz, 8);
    torus(0.02, 0.005, mc, mx + 0.035, Y + 0.035, mz, Math.PI * 2, [0, 90, 0]);
  });
  // coffee flask
  cyl(0.04, 0.042, 0.2, P.steel, 0.0, Y + 0.1, TCZ, 10);
  cyl(0.036, 0.04, 0.045, P.black, 0.0, Y + 0.222, TCZ, 10);
  box(0.03, 0.015, 0.012, P.black, 0.052, Y + 0.12, TCZ, [0, 0, 0]);
  // ration packs
  box(0.14, 0.04, 0.09, P.panelOlive, 0.0, Y + 0.02, TCZ - 0.25);
  box(0.13, 0.035, 0.085, P.panelOlive, 0.005, Y + 0.0575, TCZ - 0.25, [0, 8, 0]);
  box(0.12, 0.035, 0.08, P.panelOlive, -0.005, Y + 0.093, TCZ - 0.25, [0, -6, 0]);
  box(0.06, 0.003, 0.03, P.hazardYellow, 0.0, Y + 0.112, TCZ - 0.25, [0, -6, 0]);
  box(0.03, 0.025, 0.003, P.hazardYellow, 0.0, Y + 0.02, TCZ - 0.204);
  // salt and pepper
  cyl(0.014, 0.016, 0.055, P.ceramic, -0.06, Y + 0.0275, TCZ + 0.2, 6);
  cyl(0.014, 0.016, 0.055, P.black, -0.02, Y + 0.0275, TCZ + 0.2, 6);
  cyl(0.012, 0.012, 0.012, P.steel, -0.06, Y + 0.06, TCZ + 0.2, 6);
  cyl(0.012, 0.012, 0.012, P.steel, -0.02, Y + 0.06, TCZ + 0.2, 6);
  // log tablet
  box(0.13, 0.012, 0.18, P.panelDark, 0.5, Y + 0.006, TCZ - 0.12, [0, 15, 0]);
  box(0.1, 0.004, 0.13, P.ceramic, 0.5, Y + 0.014, TCZ - 0.12, [0, 15, 0]);
  for (let i = 0; i < 3; i++) box(0.07, 0.002, 0.005, P.black, 0.5 + i * 0.002, Y + 0.017, TCZ - 0.16 + i * 0.04, [0, 15, 0]);
  // napkin
  put(new THREE.DodecahedronGeometry(0.03, 0), P.ceramic, -0.5, Y + 0.025, TCZ - 0.02, [10, 20, 0], [1.3, 0.7, 1]);
  // communicator
  box(0.05, 0.02, 0.1, P.panelDark, 0.2, Y + 0.01, TCZ + 0.1, [0, -20, 0]);
  glow(b.part(new THREE.BoxGeometry(0.012, 0.006, 0.012), P.amber, { at: [0.2, Y + 0.023, TCZ + 0.13], rotation: [0, -20, 0] }), 1.6);
  box(0.03, 0.004, 0.025, P.black, 0.2, Y + 0.022, TCZ + 0.085, [0, -20, 0]);
  // grime rings and spills
  for (const [gx, gz] of [[-0.2, 0.3], [0.62, 0.62]] as [number, number][])
    put(new THREE.RingGeometry(0.03, 0.038, 10), P.grime, gx, Y + 0.0015, gz, [-90, 0, 0]);
  put(new THREE.CircleGeometry(0.05, 7), P.grime, 0.25, Y + 0.0012, 0.6, [-90, 0, 0], [1.6, 0.8, 1]);
  put(new THREE.CircleGeometry(0.04, 7), P.coffee, -0.55, Y + 0.0012, 0.7, [-90, 0, 0], [1, 1.4, 1]);

  // ---------- STOOLS ----------
  const stool = (x: number, z: number) => {
    cyl(0.16, 0.16, 0.03, P.steelDark, x, DECK + 0.015, z, 12);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      cyl(0.012, 0.012, 0.015, P.black, x + Math.cos(a) * 0.12, DECK + 0.036, z + Math.sin(a) * 0.12, 6);
    }
    cyl(0.035, 0.05, 0.4, P.steel, x, 0.3, z, 8);
    torus(0.14, 0.012, P.steel, x, 0.25, z, Math.PI * 2, [90, 0, 0]);
    box(0.14, 0.02, 0.02, P.steel, x + 0.07, 0.25, z);
    box(0.14, 0.02, 0.02, P.steel, x - 0.07, 0.25, z);
    cyl(0.14, 0.15, 0.04, P.panelDark, x, 0.48, z, 12);
    cyl(0.17, 0.165, 0.05, P.blueGrey, x, 0.525, z, 12);
    torus(0.13, 0.004, P.panelDark, x, 0.552, z, Math.PI * 2, [90, 0, 0]);
    put(new THREE.CircleGeometry(0.05, 7), P.panelDark, x + 0.06, 0.5515, z + 0.04, [-90, 0, 0], [1, 1.3, 1]);
  };
  stool(0.35, 1.1);
  stool(-1.0, 0.35);
  stool(1.0, 0.35);
  stool(-0.35, 1.1);

  // ---------- JONES THE CAT (on stool -0.35, 1.1) ----------
  const cx = -0.35, cz = 1.1, sy = 0.55;
  ball(0.12, P.catOrange, cx, sy + 0.13, cz - 0.01, [1, 1.15, 1], 10);
  ball(0.075, P.catCream, cx, sy + 0.14, cz + 0.07, [1, 1.3, 0.7], 8);
  // haunches
  ball(0.07, P.catOrange, cx - 0.09, sy + 0.07, cz + 0.0, [0.8, 1, 1.3], 7);
  ball(0.07, P.catOrange, cx + 0.09, sy + 0.07, cz + 0.0, [0.8, 1, 1.3], 7);
  // front legs and paws
  for (const s of [-1, 1]) {
    cyl(0.025, 0.028, 0.14, P.catOrange, cx + s * 0.045, sy + 0.09, cz + 0.09, 6);
    ball(0.03, P.catCream, cx + s * 0.045, sy + 0.02, cz + 0.115, [1, 0.6, 1.4], 6);
    ball(0.028, P.catCream, cx + s * 0.09, sy + 0.015, cz - 0.02, [1, 0.6, 1.5], 6);
  }
  // stripes
  for (let i = 0; i < 4; i++) {
    const yy = sy + 0.09 + i * 0.045;
    box(0.04, 0.01, 0.02, P.rust, cx - 0.11 + (R() - 0.5) * 0.01, yy, cz - 0.02, [0, 0, 25]);
    box(0.04, 0.01, 0.02, P.rust, cx + 0.11, yy, cz - 0.02, [0, 0, -25]);
    box(0.09, 0.01, 0.02, P.rust, cx, yy + 0.015, cz - 0.11, [0, 0, 0]);
  }
  // head
  const hy = sy + 0.3;
  const hz = cz + 0.05;
  ball(0.08, P.catOrange, cx, hy, hz, [1.15, 1, 1], 10);
  ball(0.04, P.catCream, cx, hy - 0.03, hz + 0.06, [1.3, 0.8, 0.8], 7);
  // ears
  for (const s of [-1, 1]) {
    put(new THREE.ConeGeometry(0.03, 0.06, 4), P.catOrange, cx + s * 0.055, hy + 0.08, hz - 0.005, [0, 45, s * -15]);
    put(new THREE.ConeGeometry(0.018, 0.04, 4), "#e8a8a0", cx + s * 0.055, hy + 0.075, hz + 0.012, [0, 45, s * -15]);
    // eyes
    cyl(0.02, 0.02, 0.006, P.amber, cx + s * 0.04, hy + 0.012, hz + 0.075, 8, [90, 0, 0]);
    box(0.006, 0.026, 0.004, P.black, cx + s * 0.04, hy + 0.012, hz + 0.08);
    // whiskers
    for (const dy of [-0.004, 0.012]) box(0.06, 0.002, 0.002, P.lampWhite, cx + s * 0.1, hy - 0.025 + dy, hz + 0.07, [0, s * -10, s * (dy > 0 ? -8 : 8)]);
  }
  // forehead stripes
  for (const dx of [-0.02, 0, 0.02]) box(0.008, 0.002, 0.03, P.rust, cx + dx, hy + 0.078, hz + 0.01);
  // nose
  put(new THREE.ConeGeometry(0.012, 0.014, 3), "#c46a6a", cx, hy - 0.012, hz + 0.082, [180, 0, 0]);
  // tail wrapping around the front
  torus(0.15, 0.02, P.catOrange, cx, sy + 0.03, cz, Math.PI * 1.1, [90, 0, 0]);
  box(0.025, 0.04, 0.02, P.rust, cx + 0.05, sy + 0.03, cz + 0.14);
  box(0.025, 0.04, 0.02, P.rust, cx - 0.06, sy + 0.03, cz + 0.135);
  ball(0.022, P.catCream, cx - 0.145, sy + 0.03, cz - 0.0, [1, 1, 1], 6);

  // ---------- CAT BOWL ----------
  const bx = 0.62, bz = 0.92;
  cyl(0.085, 0.06, 0.05, P.ceramic, bx, DECK + 0.025, bz, 10);
  torus(0.085, 0.01, P.blueGrey, bx, DECK + 0.05, bz, Math.PI * 2, [90, 0, 0]);
  cyl(0.07, 0.07, 0.006, P.catCream, bx, DECK + 0.04, bz, 10);
  ball(0.012, P.grime, bx + 0.02, DECK + 0.046, bz, [1, 0.6, 1], 5);
}
    return buildMessTable;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "nostromoGalley" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
