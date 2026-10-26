```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest Wind-Walker",
  description:
    "A Theo Jansen style beach creature: yellow conduit frame, Jansen-linkage legs, a bottle-bladder back, cloth sails and a jawed bottle head.",
};

// ---------------------------------------------------------------- palette (stage 2 may use these names)
export const YELLOW = "#f2c316";
export const YELLOW_DARK = "#c99a0c";
export const BOTTLE = "#cfe8ee";
export const BOTTLE_DARK = "#9cc4cf";
export const CAP_BLUE = "#2a6fb8";
export const CAP_ORANGE = "#e8742a";
export const SAIL = "#efe8d4";
export const SAIL_SHADE = "#d8cdb0";
export const ROPE = "#b9a27a";
export const STEEL = "#8d949c";
export const DARK = "#2b2a2e";
export const WHITE = "#f7f5ee";

export const REQUESTS = [
  {
    id: "sailStitching",
    kind: "texture",
    part: "sailL",
    what: "Patchwork cloth on both main sails (this part sailL and its twin sailR): SAIL base with a few SAIL_SHADE patches, visible dark seams, sun-bleached edges and a row of sewn reinforcement stitches along the lower edge.",
  },
  {
    id: "jibCloth",
    kind: "texture",
    part: "jibL",
    what: "Same weathered cloth for the two small front sails (jibL and jibR): SAIL with faint salt stains and a tan ROPE-coloured hem band along the bottom edge.",
  },
  {
    id: "bottleFog",
    kind: "texture",
    part: "bottleL0",
    what: "Translucent-looking plastic on every back bottle (parts named bottleL0..bottleL6 and bottleR0..bottleR6): BOTTLE with paler fogging, a BOTTLE_DARK ring seam in the middle, and a faint sand dusting near the bottom.",
  },
  {
    id: "conduitWear",
    kind: "texture",
    part: "railL",
    what: "Sun-faded, scuffed yellow conduit on the side rails (railL and railR): YELLOW with YELLOW_DARK scratches, sand scuffs and the odd black marker tick every half metre.",
  },
  {
    id: "snoutMark",
    kind: "texture",
    part: "snout",
    what: "Bottle upper jaw: BOTTLE plastic with a faded printed label band in CAP_BLUE and WHITE, ragged and peeled at one edge.",
  },
  {
    id: "crankDials",
    kind: "add",
    part: "axle",
    what: "Cable-tie and bolt clusters where the leg pivots meet the side rail: a washer, nut and two zip ties in DARK and STEEL. Repeat on the first leg unit each side.",
    at: [0.5, 0.95, -1.2],
    normal: [1, 0, 0],
    bone: "body",
    room: [0.2, 0.2, 0.2],
  },
  {
    id: "bottleCaps",
    kind: "add",
    part: "bottleR0",
    what: "A screw-cap with ridged collar on the front end of each back bottle, alternating CAP_BLUE and CAP_ORANGE, plus tiny tie wire loops to the A-frames.",
    at: [0.28, 1.3, 1.36],
    normal: [0, 0, 1],
    bone: "body",
    room: [0.7, 0.3, 0.2],
  },
  {
    id: "mastTopFlag",
    kind: "add",
    part: "mast",
    what: "A tattered wind-streamer and weather-vane arrow on top of the main mast: a thin tube arm, a CAP_ORANGE pennant and a small ball finial.",
    at: [0, 3.0, -1.2],
    normal: [0, 1, 0],
    bone: "body",
    room: [0.5, 0.5, 0.5],
  },
  {
    id: "sailBattens",
    kind: "add",
    part: "sailL",
    what: "Thin YELLOW batten rods and rope lashings across both main sails, with grommet rings along the leading edge.",
    at: [0.1, 2.3, -0.8],
    normal: [1, 0, 0],
    bone: "body",
    room: [0.1, 1.2, 1.1],
  },
  {
    id: "rigging",
    kind: "add",
    part: "mast",
    what: "Rope rigging: tensioned ROPE lines from mast top to the front and rear of the spine, with small wooden-bead tensioners and a pulley block.",
    at: [0, 2.4, -0.2],
    normal: [0, 1, 0],
    bone: "body",
    room: [0.3, 1.2, 2.4],
  },
  {
    id: "teethAndTongue",
    kind: "add",
    part: "jaw",
    what: "Inside the mouth: a flat DARK fabric tongue strip on the lower jaw and two small cork 'fangs' at the lower jaw front.",
    at: [0, 1.24, 1.9],
    normal: [0, 1, 0],
    bone: "jaw",
    room: [0.15, 0.1, 0.35],
  },
  {
    id: "eyeBrows",
    kind: "add",
    part: "eyeL",
    what: "Expressive brows over both eyes: bent thin yellow tubes with a zip-tie knot on the outer end, giving a curious look.",
    at: [0.11, 1.6, 1.85],
    normal: [0, 1, 0.3],
    bone: "head",
    room: [0.35, 0.1, 0.15],
  },
  {
    id: "feetSandPads",
    kind: "add",
    part: "foot",
    what: "Flat sandal-like pads under the leg feet: DARK rubber discs with three small STEEL bolts, one per foot, on the rear four legs.",
    at: [0.6, 0.05, -0.6],
    normal: [0, -1, 0],
    bone: "legL1",
    room: [0.15, 0.1, 0.15],
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

// ---------------------------------------------------------------- linkage maths
type P2 = [number, number];
function X(p: P2, r0: number, q: P2, r1: number, pick: (a: P2, b: P2) => P2): P2 {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r0 * r0 - a * a, 0));
  const mx = p[0] + (dx * a) / d;
  const my = p[1] + (dy * a) / d;
  return pick([mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]);
}
const higher = (a: P2, b: P2) => (a[1] > b[1] ? a : b);
const lower = (a: P2, b: P2) => (a[1] < b[1] ? a : b);

type Nodes = { A: P2; C: P2; K: P2; B: P2; D: P2; E: P2; F: P2 };
function legNodes(deg: number): Nodes {
  const A: P2 = [0, 0];
  const C: P2 = [38, 7.8];
  const r = (deg * Math.PI) / 180;
  const K: P2 = [C[0] + 15 * Math.cos(r), C[1] + 15 * Math.sin(r)];
  const B = X(K, 41.5, A, 50, higher);
  const D = X(A, 40.1, B, 55.8, lower);
  const E = X(K, 39.3, D, 36.7, lower);
  const F = X(D, 65.7, E, 49, lower);
  return { A, C, K, B, D, E, F };
}

// ---------------------------------------------------------------- layout constants
const H = 0.95; // hip / rail height
const APEX = 1.7; // spine height
const FOOT_R = 0.045;
const UNITS_Z = [-1.2, -0.6, 0, 0.6, 1.2];

export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const body = b.joint("body", { at: [0, H, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 1.4, 1.6], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.28, 1.65], dir: [0, 0, 1], role: "jaw" });

  const rod = (a: number[], c: number[], r: number, col: string, bone: any, name?: string) =>
    b.rod(a, c, r, col, { bone, name, sides: 6 });
  const ball = (p: number[], r: number, col: string, bone: any, name?: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { at: p, bone, name });
  const cyl = (p: number[], r: number, h: number, col: string, bone: any, dir: number[], name?: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 8), col, { at: p, bone, dir, name });

  // ---- leg scale: lowest node of every leg lands on the floor
  const legDefs: { s: number; i: number; phi: number; n: Nodes }[] = [];
  let minV = 0;
  for (const s of [1, -1])
    UNITS_Z.forEach((_, i) => {
      const phi = i * 72 + (s > 0 ? 0 : 180);
      const n = legNodes(phi);
      legDefs.push({ s, i, phi, n });
      for (const p of Object.values(n)) minV = Math.min(minV, p[1]);
    });
  const S = (H - FOOT_R) / -minV;

  // ---- legs
  for (const d of legDefs) {
    const { s, i, n } = d;
    const z0 = UNITS_Z[i];
    const xp = s * (0.6 + 0.07 * (i % 2));
    const w = (p: P2) => [xp, H + p[1] * S, z0 + p[0] * S];
    const side = s > 0 ? "L" : "R";
    const joint = b.joint(`leg${side}${i + 1}`, { parent: body, at: w(n.A), dir: [0, -1, 0], role: "leg" });
    const nm = (t: string) => `${t}${side}${i + 1}`;
    // pivot stub to rail
    rod([s * 0.5, H, z0], w(n.A), 0.016, YELLOW, body, nm("stub"));
    const edges: [P2, P2, string][] = [
      [n.K, n.B, "kb"],
      [n.A, n.B, "ab"],
      [n.A, n.D, "ad"],
      [n.B, n.D, "bd"],
      [n.K, n.E, "ke"],
      [n.D, n.E, "de"],
      [n.D, n.F, "df"],
      [n.E, n.F, "ef"],
    ];
    for (const [p, q, t] of edges) rod(w(p), w(q), 0.014, i % 2 ? YELLOW : YELLOW_DARK, joint, nm(t));
    rod(w(n.C), w(n.K), 0.012, DARK, joint, nm("crank"));
    for (const k of ["A", "B", "D", "E", "K"] as const) ball(w(n[k]), 0.024, STEEL, joint);
    ball(w(n.F), FOOT_R, DARK, joint, nm("foot"));
    ball(w(n.F), 0.022, YELLOW, joint);
  }

  // ---- crank axles, pivot beams, frames
  UNITS_Z.forEach((z0, i) => {
    rod([-0.76, H + 7.8 * S, z0 + 38 * S], [0.76, H + 7.8 * S, z0 + 38 * S], 0.018, STEEL, body, `axle${i + 1}`);
    rod([-0.5, H, z0], [0.5, H, z0], 0.018, YELLOW, body, `beam${i + 1}`);
    for (const s of [1, -1]) {
      rod([s * 0.5, H, z0], [0, APEX, z0], 0.016, YELLOW, body, `aframe${s > 0 ? "L" : "R"}${i + 1}`);
      ball([s * 0.5, H, z0], 0.026, STEEL, body);
      if (i < UNITS_Z.length - 1)
        rod([s * 0.5, H, z0], [0, APEX, UNITS_Z[i + 1]], 0.012, YELLOW_DARK, body, `diag${s > 0 ? "L" : "R"}${i + 1}`);
    }
    ball([0, APEX, z0], 0.03, STEEL, body);
  });
  for (const s of [1, -1]) rod([s * 0.5, H, -1.45], [s * 0.5, H, 1.5], 0.02, YELLOW, body, s > 0 ? "railL" : "railR");
  rod([0, APEX, -1.45], [0, APEX, 1.4], 0.022, YELLOW, body, "spine");

  // ---- bottle bladder on the back
  for (const s of [1, -1])
    for (let k = 0; k < 7; k++) {
      const z = -1.2 + k * 0.42;
      const nm = `bottle${s > 0 ? "L" : "R"}${k}`;
      b.capsule([s * 0.28, 1.3, z - 0.17], [s * 0.28, 1.3, z + 0.17], 0.085, k % 2 ? BOTTLE : BOTTLE_DARK, {
        bone: body,
        name: nm,
        sides: 8,
      });
      ball([s * 0.28, 1.3, z + 0.29], 0.04, k % 2 ? CAP_BLUE : CAP_ORANGE, body);
    }

  // ---- masts & sails
  rod([0, APEX, -1.3], [0, 3.05, -1.2], 0.022, YELLOW, body, "mast");
  rod([0, APEX, 0.05], [0, 2.5, 0.12], 0.018, YELLOW, body, "mastJib");
  const sails: { z: number; y: number; k: number; nm: string }[] = [
    { z: -1.3, y: APEX + 0.05, k: 1, nm: "sail" },
    { z: 0.1, y: APEX + 0.05, k: 0.6, nm: "jib" },
  ];
  for (const sl of sails)
    for (const s of [1, -1]) {
      const k = sl.k;
      b.extrude(
        [
          [0, 0],
          [1.1 * k, 0],
          [0.8 * k, 0.9 * k],
          [0.15 * k, 1.25 * k],
        ],
        {
          at: [s * 0.045, sl.y, sl.z],
          x: [0, 0, 1],
          thickness: 0.012,
          smoothing: 1,
          color: s > 0 ? SAIL : SAIL_SHADE,
          bone: body,
          name: `${sl.nm}${s > 0 ? "L" : "R"}`,
        },
      );
    }
  rod([0, APEX + 0.05, -1.3], [0, APEX + 0.05, -0.2], 0.014, YELLOW, body, "boom");
  rod([0, APEX + 0.05, 0.1], [0, APEX + 0.05, 0.76], 0.012, YELLOW, body, "boomJib");
  rod([0, 3.05, -1.2], [0, APEX, 1.35], 0.006, ROPE, body, "stayFront");
  rod([0, 3.05, -1.2], [0, APEX, -1.45], 0.006, ROPE, body, "stayBack");
  ball([0, 3.07, -1.2], 0.03, CAP_ORANGE, body);

  // ---- head
  rod([0, APEX, 1.4], [0, 1.45, 1.65], 0.02, YELLOW, body, "neck");
  for (const s of [1, -1]) {
    rod([s * 0.5, H, 1.5], [s * 0.1, 1.33, 1.65], 0.016, YELLOW, body, "neckStrut");
    rod([s * 0.5, H, 1.5], [s * 0.5, H, 1.5 - 0.0001 - 0.1], 0.016, YELLOW, body);
  }
  b.capsule([0, 1.38, 1.62], [0, 1.38, 2.05], 0.12, BOTTLE, { bone: head, name: "snout", sides: 8 });
  ball([0, 1.38, 2.2], 0.05, CAP_BLUE, head, "nose");
  b.capsule([0, 1.2, 1.7], [0, 1.2, 2.05], 0.065, BOTTLE_DARK, { bone: jaw, name: "lowerJaw", sides: 8 });
  for (let k = 0; k < 5; k++) {
    const z = 1.75 + k * 0.08;
    for (const s of [1, -1]) b.spike([s * 0.08, 1.28, z], [0, -1, 0], 0.05, 0.012, { color: WHITE, bone: head });
  }
  for (const s of [1, -1]) {
    const nm = s > 0 ? "eyeL" : "eyeR";
    ball([s * 0.11, 1.52, 1.82], 0.065, WHITE, head, nm);
    ball([s * 0.11, 1.52, 1.875], 0.04, CAP_BLUE, head, nm + "Iris");
    ball([s * 0.11, 1.52, 1.905], 0.022, DARK, head, nm + "Pupil");
  }
  cyl([0, 1.32, 1.62], 0.1, 0.03, YELLOW, head, [0, 0, 1], "headRing");

  for (const add of STAGE2) add(b);
  return b.root;
}
```