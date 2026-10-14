import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V3 = [number, number, number];

export const meta = {
  name: "Lighthouse Island",
  description:
    "A tiny rocky island on a round walnut base: a red-and-white striped lighthouse with a glowing lantern room and iron balcony, a keeper's cottage with a crooked chimney and blue door, a wooden jetty with a rowboat, two gulls, grass and wildflowers, and turquoise water ringed with foam.",
};

const TAU = Math.PI * 2;

const COL = {
  walnut: "#7a5230",
  walnutDark: "#4f3420",
  brass: "#c9a24e",
  deep: "#1fb5ad",
  shallow: "#63dccf",
  foam: "#f7fbfb",
  slate: "#6c7779",
  rock2: "#8a857a",
  rock3: "#a79f8f",
  boulder: "#8c8577",
  boulderLight: "#aaa395",
  grass: "#72b04a",
  blade: "#4f9a2f",
  stem: "#3f8a2e",
  stone: "#bfb8a6",
  red: "#d62828",
  white: "#f6f4ee",
  iron: "#1f2227",
  glass: "#ffe27a",
  gold: "#f2c14e",
  doorDark: "#3a2418",
  slit: "#1d2b3a",
  cream: "#f3e6c8",
  roof: "#4b5563",
  blue: "#1f6fd1",
  brick: "#b5543c",
  pane: "#ffd76a",
  yellow: "#ffd23f",
  pink: "#ff6fa5",
  purple: "#9b6bd6",
  smoke: "#e9edf0",
  plankA: "#b98a52",
  plankB: "#a67545",
  piling: "#5b3d24",
  rope: "#c9a66b",
  hull: "#2b6cb0",
  gullGrey: "#a7b3bf",
  tipBlack: "#2a2e35",
  beak: "#f2a92a",
  legs: "#e8a33d",
} as const;

// Geometry helpers. Every geometry is centred on its own origin; the `at`
// handed to b.part is where that origin sits in model space.
const cyl = (rTop: number, rBottom: number, h: number, seg = 8) =>
  new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1);

const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

const block = (w: number, h: number, d: number, rot: V3 = [0, 0, 0]) => {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rot[0] || rot[1] || rot[2]) {
    g.applyMatrix4(
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])),
    );
  }
  return g;
};

// Torus lying flat in the XZ plane.
const flatRing = (R: number, tube: number, seg = 24) => {
  const g = new THREE.TorusGeometry(R, tube, 4, seg);
  g.rotateX(Math.PI / 2);
  return g;
};

// Tapered cylinder from a to c (radius rA at a, rC at c), centred on its midpoint.
const link = (a: V3, c: V3, rA: number, rC: number, seg = 6) => {
  const dx = c[0] - a[0];
  const dy = c[1] - a[1];
  const dz = c[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const nx = dx / len;
  const ny = dy / len;
  const nz = dz / len;
  const theta = Math.atan2(Math.hypot(nx, nz), ny);
  const phi = Math.atan2(nx, nz);
  const geo = new THREE.CylinderGeometry(rC, rA, len, seg, 1);
  geo.applyMatrix4(
    new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(theta, phi, 0, "YXZ")),
  );
  const at: V3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  return { geo, at };
};

// Pointed bow or stern: a four-sided pyramid squashed to the hull's section, apex along z.
const wedge = (sign: number) => {
  const g = new THREE.ConeGeometry(0.156, 0.06, 4, 1);
  g.rotateY(Math.PI / 4);
  g.scale(1, 1, 0.364);
  g.rotateX((sign * Math.PI) / 2);
  return g;
};

// One piece of a gull wing (root 0..0.7S or tip 0.7S..S), swept back, centred on mid-span.
const wingPiece = (sd: number, S: number, part: "root" | "tip") => {
  const sweep = (s: number) => -0.22 * s;
  const s0 = part === "root" ? 0 : 0.7 * S;
  const s1 = part === "root" ? 0.7 * S : S;
  const pts: [number, number][] =
    part === "root"
      ? [
          [0, 0.035],
          [sd * s1, 0.024 + sweep(s1)],
          [sd * s1, -0.024 + sweep(s1)],
          [0, -0.035],
        ]
      : [
          [sd * s0, 0.024 + sweep(s0)],
          [sd * s1, 0.004 + sweep(s1)],
          [sd * s1, -0.012 + sweep(s1)],
          [sd * s0, -0.024 + sweep(s0)],
        ];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false });
  g.translate(0, 0, -0.004);
  g.rotateX(Math.PI / 2); // chord runs along z, thickness along y
  g.translate((-sd * S) / 2, 0, (0.22 * S) / 2);
  return g;
};

export default function build() {
  const b = createBuilder({ name: "lighthouse-island" });

  const put = (geo: THREE.BufferGeometry, color: string, at: V3 = [0, 0, 0]) => {
    b.part(geo, color, { at });
  };
  const rod = (a: V3, c: V3, rA: number, rC: number, color: string, seg = 6) => {
    const s = link(a, c, rA, rC, seg);
    put(s.geo, color, s.at);
  };

  const W = 0.16; // water surface height
  const TOP = 0.44; // top of the grassy cap
  const G = 0.43; // grass roots sink slightly into the cap

  const island = b.joint("island", { at: [0, 0, 0] });

  // ---- round walnut display base with brass band and turquoise pool
  put(cyl(1.52, 1.52, 0.02, 40), COL.walnutDark, [0, 0.01, 0]);
  put(cyl(1.6, 1.6, 0.12, 40), COL.walnut, [0, 0.08, 0]);
  put(cyl(1.61, 1.61, 0.02, 40), COL.brass, [0, 0.1, 0]);
  put(cyl(1.5, 1.5, 0.06, 40), COL.deep, [0, 0.13, 0]);
  put(cyl(1.2, 1.2, 0.01, 40), COL.shallow, [0, 0.165, 0]);
  put(flatRing(1.33, 0.006), COL.foam, [0, W + 0.008, 0]);
  put(flatRing(1.43, 0.006), COL.foam, [0, W + 0.008, 0]);
  put(flatRing(1.03, 0.03, 40), COL.foam, [0, W + 0.004, 0]);
  for (let k = 0; k < 40; k++) {
    const t = (k / 40) * TAU;
    const r = 1.075 + 0.03 * Math.sin(t * 3) + 0.02 * Math.cos(t * 5);
    const size = 0.026 + 0.01 * ((k * 7) % 3);
    put(ball(size, 6, 4), COL.foam, [r * Math.cos(t), W + 0.005, r * Math.sin(t)]);
  }

  // ---- island: stacked faceted rock layers topped with grass
  const layer = (
    rb: number,
    rt: number,
    y0: number,
    y1: number,
    seg: number,
    turn: number,
    color: string,
  ) => {
    const g = new THREE.CylinderGeometry(rt, rb, y1 - y0, seg, 1);
    g.rotateY(turn);
    put(g, color, [0, (y0 + y1) / 2, 0]);
  };
  layer(1.0, 0.95, 0.1, 0.2, 10, 0.2, COL.slate);
  layer(0.95, 0.84, 0.2, 0.3, 9, 0.9, COL.rock2);
  layer(0.84, 0.7, 0.3, 0.38, 10, 0.5, COL.rock3);
  layer(0.7, 0.62, 0.38, TOP, 10, 0.1, COL.grass);

  const rock = (
    x: number,
    y: number,
    z: number,
    r: number,
    sy: number,
    turn: number,
    color: string,
  ) => {
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.scale(1.1, sy, 1);
    g.rotateY(turn);
    put(g, color, [x, y, z]);
  };
  rock(0.66, 0.31, -0.5, 0.1, 0.8, 0.4, COL.boulder);
  rock(-0.74, 0.27, 0.3, 0.1, 0.8, 1.1, COL.boulderLight);
  rock(-0.62, 0.34, -0.56, 0.12, 0.75, 2.0, COL.boulderLight);
  rock(0.12, 0.17, -0.9, 0.09, 0.8, 0.7, COL.boulder);
  rock(-0.9, 0.17, -0.2, 0.09, 0.8, 0.3, COL.boulder);
  rock(0.9, 0.2, 0.22, 0.1, 0.8, 1.6, COL.boulderLight);

  // ---- grass tufts and wildflowers on the cap
  const BLADES: [number, number, number, number, number][] = [
    // root dx, dz, tip lean x, z, height
    [0, 0, 0.02, 0.01, 0.11],
    [0.02, 0.01, -0.01, 0.02, 0.13],
    [-0.015, 0.015, -0.03, -0.01, 0.09],
    [0.01, -0.02, 0.015, -0.03, 0.1],
    [-0.02, -0.01, -0.025, 0.0, 0.08],
  ];
  const tuft = (x: number, z: number) => {
    for (const [dx, dz, lx, lz, h] of BLADES) {
      rod([x + dx, G, z + dz], [x + dx + lx, TOP + h, z + dz + lz], 0.012, 0.002, COL.blade, 3);
    }
  };
  const flower = (x: number, z: number, h: number, head: string) => {
    rod([x, G, z], [x + 0.008, TOP + h, z], 0.005, 0.004, COL.stem, 5);
    put(ball(0.028, 7, 5), head, [x + 0.008, TOP + h + 0.02, z]);
  };
  const tufts: [number, number][] = [
    [-0.48, 0.24],
    [-0.2, 0.36],
    [0.0, 0.34],
    [0.42, 0.36],
    [0.55, 0.12],
    [0.44, -0.36],
    [0.12, -0.36],
    [-0.12, -0.46],
    [0.2, -0.24],
  ];
  for (const [x, z] of tufts) tuft(x, z);
  flower(-0.3, 0.42, 0.13, COL.yellow);
  flower(0.3, 0.44, 0.11, COL.pink);
  flower(0.48, 0.26, 0.12, COL.white);
  flower(0.28, -0.4, 0.1, COL.purple);
  flower(-0.06, -0.3, 0.12, COL.yellow);
  flower(-0.08, 0.3, 0.11, COL.white);

  // stepping stones from the cottage door toward the jetty
  for (const [x, z] of [
    [0.2, 0.3],
    [0.14, 0.4],
    [0.08, 0.5],
  ]) {
    put(cyl(0.045, 0.05, 0.02, 7), COL.stone, [x, TOP + 0.01, z]);
  }

  // ---- lighthouse
  const LX = -0.3;
  const LZ = -0.12;
  const TY0 = 0.47;
  const TY1 = 2.0;
  const rAt = (y: number) => 0.2 + (0.13 - 0.2) * ((y - TY0) / (TY1 - TY0));

  put(cyl(0.25, 0.26, 0.03, 12), COL.stone, [LX, 0.455, LZ]);

  const N = 8;
  const bh = (TY1 - TY0) / N;
  for (let k = 0; k < N; k++) {
    const y0 = TY0 + k * bh;
    const y1 = y0 + bh;
    put(cyl(rAt(y1), rAt(y0), bh, 10), k % 2 === 0 ? COL.red : COL.white, [LX, (y0 + y1) / 2, LZ]);
  }
  for (const k of [3, 5]) {
    const y = TY0 + (k + 0.5) * bh;
    put(block(0.03, 0.07, 0.012), COL.slit, [LX, y, LZ + rAt(y) + 0.004]);
  }
  put(block(0.08, 0.13, 0.02), COL.doorDark, [LX, 0.535, LZ + rAt(0.5) + 0.004]);
  put(block(0.1, 0.02, 0.025), COL.white, [LX, 0.61, LZ + rAt(0.5) + 0.006]);

  // iron gallery and railing
  put(cyl(0.22, 0.22, 0.04, 12), COL.iron, [LX, 2.02, LZ]);
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * TAU;
    put(cyl(0.008, 0.008, 0.16, 5), COL.iron, [LX + 0.215 * Math.sin(t), 2.12, LZ + 0.215 * Math.cos(t)]);
  }
  put(flatRing(0.215, 0.008, 24), COL.iron, [LX, 2.2, LZ]);
  put(flatRing(0.215, 0.007, 24), COL.iron, [LX, 2.12, LZ]);

  // lantern room: glowing glass, iron mullions, red dome and gold finial
  put(cyl(0.12, 0.11, 0.3, 8), COL.glass, [LX, 2.19, LZ]);
  for (let i = 0; i < 8; i++) {
    const t = (i / 8) * TAU;
    put(block(0.016, 0.3, 0.016), COL.iron, [LX + 0.12 * Math.sin(t), 2.19, LZ + 0.12 * Math.cos(t)]);
  }
  put(cyl(0.14, 0.12, 0.03, 8), COL.iron, [LX, 2.355, LZ]);
  put(new THREE.SphereGeometry(0.14, 10, 5, 0, TAU, 0, Math.PI / 2), COL.red, [LX, 2.37, LZ]);
  put(ball(0.024, 6, 4), COL.gold, [LX, 2.53, LZ]);
  rod([LX, 2.55, LZ], [LX, 2.62, LZ], 0.006, 0.006, COL.gold, 5);

  // ---- keeper's cottage
  const CX = 0.27;
  const CZ = 0.02;
  const FZ = CZ + 0.17; // front wall plane
  put(block(0.44, 0.32, 0.34), COL.cream, [CX, 0.6, CZ]); // walls 0.44..0.76

  const gableShape = new THREE.Shape([
    new THREE.Vector2(-0.22, 0),
    new THREE.Vector2(0.22, 0),
    new THREE.Vector2(0, 0.13),
  ]);
  const gable = new THREE.ExtrudeGeometry(gableShape, { depth: 0.34, bevelEnabled: false });
  gable.translate(0, 0, -0.17);
  put(gable, COL.cream, [CX, 0.76, CZ]);

  // gabled slate roof
  const RIDGE = 0.895;
  const E = 0.3;
  const RISE = 0.16;
  const ang = Math.atan2(RISE, E);
  const slope = Math.hypot(E, RISE);
  for (const side of [1, -1]) {
    put(block(slope + 0.01, 0.035, 0.42, [0, 0, -side * ang]), COL.roof, [
      CX + (side * E) / 2,
      RIDGE - RISE / 2,
      CZ,
    ]);
  }
  put(block(0.04, 0.04, 0.44), COL.roof, [CX, RIDGE + 0.01, CZ]);

  // crooked brick chimney with a drifting puff of smoke
  const LEAN: V3 = [0, 0, -0.18];
  put(block(0.07, 0.26, 0.07, LEAN), COL.brick, [CX + 0.1, 0.9, CZ - 0.08]);
  put(block(0.09, 0.03, 0.09, LEAN), COL.iron, [CX + 0.123, 1.04, CZ - 0.08]);
  put(ball(0.05, 7, 5), COL.smoke, [CX + 0.16, 1.14, CZ - 0.1]);
  put(ball(0.065, 7, 5), COL.smoke, [CX + 0.2, 1.25, CZ - 0.13]);
  put(ball(0.075, 7, 5), COL.smoke, [CX + 0.26, 1.37, CZ - 0.17]);

  // blue door with white frame and gold knob
  put(block(0.12, 0.22, 0.012), COL.white, [CX, 0.55, FZ - 0.002]);
  put(block(0.1, 0.2, 0.024), COL.blue, [CX, 0.54, FZ + 0.008]);
  put(ball(0.012, 5, 4), COL.gold, [CX + 0.035, 0.52, FZ + 0.02]);

  // windows with mullions and flower boxes
  for (const sx of [-0.15, 0.15]) {
    put(block(0.12, 0.12, 0.012), COL.white, [CX + sx, 0.62, FZ - 0.002]);
    put(block(0.09, 0.09, 0.02), COL.pane, [CX + sx, 0.62, FZ + 0.005]);
    put(block(0.09, 0.008, 0.024), COL.white, [CX + sx, 0.62, FZ + 0.008]);
    put(block(0.008, 0.09, 0.024), COL.white, [CX + sx, 0.62, FZ + 0.008]);
    put(block(0.13, 0.03, 0.05), COL.walnut, [CX + sx, 0.545, FZ + 0.02]);
    for (const fx of [-0.045, 0, 0.045]) {
      put(ball(0.022, 6, 4), fx === 0 ? COL.yellow : COL.pink, [CX + sx + fx, 0.57, FZ + 0.02]);
    }
  }

  // ---- jetty of planks on pilings, reaching out from the rock
  const DECK_Y = 0.26;
  const planks = [-0.025, 0.025, 0.075, 0.125];
  planks.forEach((x, i) => {
    put(block(0.046, 0.04, 0.52), i % 2 === 0 ? COL.plankA : COL.plankB, [x, DECK_Y, 1.16]);
  });
  for (const [x, z] of [
    [-0.02, 0.95],
    [0.12, 0.95],
    [-0.02, 1.36],
    [0.12, 1.36],
  ]) {
    put(cyl(0.014, 0.014, 0.2, 6), COL.piling, [x, 0.14, z]);
  }
  put(cyl(0.014, 0.016, 0.1, 6), COL.piling, [0.05, 0.31, 1.36]); // mooring post

  // ---- rowboat tied alongside the jetty
  const BX = 0.36;
  const BZ = 1.22;
  put(block(0.22, 0.08, 0.32), COL.hull, [BX, 0.2, BZ]);
  put(block(0.23, 0.02, 0.33), COL.white, [BX, 0.25, BZ]); // gunwale
  put(wedge(1), COL.hull, [BX, 0.2, BZ + 0.19]);
  put(wedge(-1), COL.hull, [BX, 0.2, BZ - 0.19]);
  put(block(0.012, 0.012, 0.46), COL.walnut, [BX - 0.06, 0.27, BZ]); // oar
  rod([0.05, 0.34, 1.36], [0.15, 0.2, 1.34], 0.005, 0.005, COL.rope, 4);
  rod([0.15, 0.2, 1.34], [0.25, 0.25, 1.3], 0.005, 0.005, COL.rope, 4);

  // ---- two gulls on rigged skeletons, wings spread
  const gull = (tag: string, B: V3) => {
    const body = b.joint(`${tag}_body`, { at: B, parent: island });
    b.joint(`${tag}_head`, { at: [B[0], B[1] + 0.035, B[2] + 0.1], parent: body });
    b.joint(`${tag}_tail`, { at: [B[0], B[1], B[2] - 0.13], parent: body });

    const bodyG = ball(0.06, 10, 7);
    bodyG.scale(0.85, 0.8, 1.6);
    put(bodyG, COL.white, B);
    put(ball(0.04, 8, 6), COL.white, [B[0], B[1] + 0.035, B[2] + 0.1]);

    const beak = new THREE.ConeGeometry(0.011, 0.05, 4, 1);
    beak.rotateX(Math.PI / 2);
    put(beak, COL.beak, [B[0], B[1] + 0.03, B[2] + 0.165]);
    for (const s of [-1, 1]) {
      put(ball(0.007, 5, 4), COL.iron, [B[0] + s * 0.026, B[1] + 0.045, B[2] + 0.125]);
    }
    put(block(0.07, 0.01, 0.07), COL.gullGrey, [B[0], B[1] + 0.004, B[2] - 0.13]);
    for (const s of [-1, 1]) {
      rod(
        [B[0] + s * 0.015, B[1] - 0.045, B[2]],
        [B[0] + s * 0.015, B[1] - 0.08, B[2] - 0.02],
        0.005,
        0.005,
        COL.legs,
        4,
      );
    }

    const S = 0.26;
    for (const sd of [1, -1]) {
      const side = sd > 0 ? "L" : "R";
      const sh: V3 = [B[0] + sd * 0.03, B[1] + 0.02, B[2] + 0.03];
      const tip: V3 = [sh[0] + sd * S, sh[1], sh[2] - 0.22 * S];
      const mid: V3 = [sh[0] + (sd * S) / 2, sh[1], sh[2] - 0.11 * S];
      const wing = b.joint(`${tag}_wing${side}`, { at: sh, parent: body });
      b.joint(`${tag}_wing${side}Tip`, { at: tip, parent: wing });
      put(wingPiece(sd, S, "root"), COL.gullGrey, mid);
      put(wingPiece(sd, S, "tip"), COL.tipBlack, mid);
    }
  };
  gull("gullA", [0.72, 2.25, -0.15]);
  gull("gullB", [-0.78, 1.92, 0.3]);

  return b.root;
}
