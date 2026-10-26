import * as THREE from "three";
import { type Builder, type ColorInput, createBuilder, paint, noise, mix, smoothstep, cells, svg, frame } from "../../../../src/index";

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

// ---------------------------------------------------------------- paints
const SAND = "#d8c28f";
const clothPaint = (base: string, patchy: boolean) =>
  paint((p, _n, s) => {
    let c = mix(base, "#ffffff", 0.12 * smoothstep(0.3, 1.2, s[1]) + 0.05 * noise(p, 0.08, 2));
    if (patchy) {
      const k = cells(p, 0.36, 4);
      if (k.id > 0.55) c = mix(c, SAIL_SHADE, 0.75);
      else if (k.id < 0.15) c = mix(c, "#e9dfc4", 0.6);
      if (k.d2 - k.d1 < 0.05) c = mix(c, "#6b5f48", 0.7);
      if (s[1] > 0.04 && s[1] < 0.1) c = mix(c, ROPE, 0.55);
      if (Math.abs(s[1] - 0.07) < 0.006 && (((s[0] / 0.045) % 1) + 1) % 1 < 0.55) c = mix(c, DARK, 0.9);
    } else {
      c = mix(c, "#c9bea0", 0.45 * smoothstep(0.58, 0.8, noise(p, 0.12, 8)));
      if (s[1] < 0.1) c = mix(c, ROPE, 0.9);
      if (Math.abs(s[1] - 0.1) < 0.004) c = mix(c, "#7a6a48", 0.8);
    }
    return c;
  });
const bottlePaint = (base: string) =>
  paint((p, n, s) => {
    let c = mix(base, WHITE, 0.45 * smoothstep(0.4, 0.8, noise(p, 0.1, 11)));
    if (Math.abs(s[0] - 0.5) < 0.035) c = mix(c, BOTTLE_DARK, 0.9);
    c = mix(c, SAND, 0.55 * smoothstep(0.1, -0.7, n.y) * smoothstep(0.35, 0.6, noise(p, 0.05, 13)));
    return c;
  });
const conduitPaint = paint((p, n) => {
  let c = mix(YELLOW, "#f7dc6a", 0.35 * noise(p, 0.3, 21));
  if (noise(p, 0.012, 23) > 0.74) c = mix(c, YELLOW_DARK, 0.85);
  c = mix(c, SAND, 0.6 * smoothstep(0.62, 0.78, noise(p, 0.1, 25)));
  const m = (((p.z + 1.45) % 0.5) + 0.5) % 0.5;
  if (m < 0.012 && n.y > 0.2) c = mix(c, "#000000", 0.9);
  return c;
});
const snoutPaint = paint((p, n) => {
  let c: ColorInput = mix(BOTTLE, WHITE, 0.3 * noise(p, 0.07, 31));
  const edge = 0.02 * (noise(p, 0.05, 33) - 0.5) * 6;
  if (p.z > 1.74 && p.z < 1.95 + edge && n.y < 0.9) {
    c = p.z > 1.8 && p.z < 1.84 ? WHITE : p.z > 1.88 && p.z < 1.9 ? WHITE : CAP_BLUE;
    if (noise(p, 0.04, 35) > 0.72) c = mix(BOTTLE, WHITE, 0.3);
    else c = mix(c, WHITE, 0.15 * noise(p, 0.02, 37));
  }
  return c;
});

export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const body = b.joint("body", { at: [0, H, 0], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 1.4, 1.6], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.28, 1.65], dir: [0, 0, 1], role: "jaw" });

  const rod = (a: number[], c: number[], r: number, col: any, bone: any, name?: string) =>
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
  for (const s of [1, -1])
    rod([s * 0.5, H, -1.45], [s * 0.5, H, 1.5], 0.02, conduitPaint, body, s > 0 ? "railL" : "railR");
  rod([0, APEX, -1.45], [0, APEX, 1.4], 0.022, YELLOW, body, "spine");

  // ---- bottle bladder on the back
  for (const s of [1, -1])
    for (let k = 0; k < 7; k++) {
      const z = -1.2 + k * 0.42;
      const nm = `bottle${s > 0 ? "L" : "R"}${k}`;
      b.capsule([s * 0.28, 1.3, z - 0.17], [s * 0.28, 1.3, z + 0.17], 0.085, bottlePaint(k % 2 ? BOTTLE : BOTTLE_DARK), {
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
          color: clothPaint(s > 0 ? SAIL : SAIL_SHADE, sl.nm === "sail"),
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
  b.capsule([0, 1.38, 1.62], [0, 1.38, 2.05], 0.12, snoutPaint, { bone: head, name: "snout", sides: 8 });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addCrankDials(b: Builder) {
  const H0 = 0.95;
  const zs = [-1.2, -0.6];
  const NUT = "#6b7078";

  const hexNut = (p: number[], s: number, r: number, h: number) => {
    b.part(new THREE.CylinderGeometry(r, r, h, 6), NUT, {
      at: p,
      bone: "body",
      dir: [1, 0, 0],
      name: "s21nut",
      flat: true,
    });
  };

  const tie = (p: number[], s: number, ang: number, col: string) => {
    // zip tie: flat band looping round the rail + a small head block
    const band = new THREE.TorusGeometry(0.03, 0.0045, 4, 10);
    b.part(band, col, {
      at: [s * 0.5, p[1], p[2]],
      bone: "body",
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 0, ang],
      name: "s21tieband",
    });
    // head block
    const a = (ang * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.014, 0.016, 0.012), col, {
      at: [s * 0.5 + Math.cos(a) * 0.032, p[1] + Math.sin(a) * 0.032, p[2]],
      bone: "body",
      name: "s21tiehead",
    });
    // trimmed tail
    b.rod(
      [s * 0.5 + Math.cos(a) * 0.036, p[1] + Math.sin(a) * 0.036, p[2]],
      [s * 0.5 + Math.cos(a) * 0.075, p[1] + Math.sin(a) * 0.075 + 0.01, p[2]],
      0.004,
      col,
      { bone: "body", sides: 4, name: "s21tietail" },
    );
  };

  for (const s of [1, -1]) {
    zs.forEach((z, i) => {
      const x = s * 0.5;
      const o = s * 0.03;
      // washer, nut and bolt shaft on the outside of the rail
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 12), STEEL, {
        at: [x + o, H0, z],
        bone: "body",
        dir: [1, 0, 0],
        name: "s21washer",
      });
      hexNut([x + s * 0.045, H0, z], s, 0.028, 0.025);
      b.rod([x + s * 0.055, H0, z], [x + s * 0.1, H0, z], 0.01, STEEL, {
        bone: "body",
        sides: 6,
        name: "s21boltend",
      });
      // inner washer on the beam side
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 12), STEEL, {
        at: [x - s * 0.03, H0, z],
        bone: "body",
        dir: [1, 0, 0],
        name: "s21washerIn",
      });
      // two zip ties either side of the pivot
      tie([x, H0, z - 0.09], s, i % 2 ? 40 : 110, DARK);
      tie([x, H0, z + 0.09], s, i % 2 ? 140 : 70, DARK);
      // marker dot
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 6), YELLOW_DARK, {
        at: [x + o + s * 0.003, H0 + 0.02, z],
        bone: "body",
        dir: [1, 0, 0],
        name: "s21dot",
      });
    });
  }
}
    return addCrankDials;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBottleCaps(b: Builder) {
  const S = 1;
  const RIDGE = "#1d4f86";
  const WIRE = "#6f757c";
  for (const s of [1, -1]) {
    for (let k = 0; k < 7; k++) {
      const z = -1.2 + k * 0.42;
      const front = z + 0.17 + 0.12; // front end of the bottle capsule
      const x = s * 0.28;
      const y = 1.3;
      const cap = k % 2 ? CAP_BLUE : CAP_ORANGE;
      const ridge = k % 2 ? RIDGE : "#b8561c";
      // neck collar: a short ring just ahead of the bottle dome
      b.part(new THREE.CylinderGeometry(0.036, 0.042, 0.03, 8), BOTTLE_DARK, {
        at: [x, y, front + 0.02],
        bone: "body",
        dir: [0, 0, 1],
        name: `s22collar${s > 0 ? "L" : "R"}${k}`,
      });
      // cap body
      b.part(new THREE.CylinderGeometry(0.044, 0.048, 0.045, 10), cap, {
        at: [x, y, front + 0.058],
        bone: "body",
        dir: [0, 0, 1],
        name: `s22cap${s > 0 ? "L" : "R"}${k}`,
      });
      // cap top disc
      b.part(new THREE.CylinderGeometry(0.036, 0.044, 0.012, 10), cap, {
        at: [x, y, front + 0.086],
        bone: "body",
        dir: [0, 0, 1],
      });
      // ridges around the cap rim
      for (let r = 0; r < 8; r++) {
        const a = (r / 8) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.008, 0.008, 0.04), ridge, {
          at: [x + Math.cos(a) * 0.047, y + Math.sin(a) * 0.047, front + 0.058],
          bone: "body",
        });
      }
      // tiny tie-wire loop to the A-frame (toward the centre line)
      const ax = s * 0.12;
      b.rod([x - s * 0.04, y, front + 0.02], [ax, y + 0.1, front - 0.12], 0.004, WIRE, { bone: "body", sides: 4 });
      b.part(new THREE.TorusGeometry(0.02, 0.004, 4, 8), WIRE, {
        at: [x - s * 0.04, y, front + 0.02],
        bone: "body",
        dir: [1, 0, 0],
        axis: "z",
      });
      // small wire twist knot
      b.part(new THREE.SphereGeometry(0.008, 5, 4), WIRE, { at: [ax, y + 0.1, front - 0.12], bone: "body" });
    }
  }
}
    return addBottleCaps;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addMastTopFlag(b: Builder) {
  const TIP_Y = 3.05;
  const MZ = -1.2;
  const PENNANT_RED = "#b8321c";

  // ---------------- mast top: weather vane ----------------
  const vaneJoint = b.joint("s23vane", { parent: "body", at: [0, TIP_Y + 0.07, MZ], dir: [0, 1, 0] });

  // finial ball and collar
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.03, 8), STEEL, { at: [0, TIP_Y + 0.04, MZ], bone: "body", name: "s23collar" });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), CAP_ORANGE, { at: [0, TIP_Y + 0.31, MZ], bone: vaneJoint, name: "s23finial" });
  // spindle
  b.rod([0, TIP_Y + 0.05, MZ], [0, TIP_Y + 0.29, MZ], 0.007, STEEL, { bone: vaneJoint, sides: 6, name: "s23spindle" });
  // horizontal arm
  b.rod([0, TIP_Y + 0.2, MZ - 0.24], [0, TIP_Y + 0.2, MZ + 0.24], 0.007, YELLOW, { bone: vaneJoint, sides: 6, name: "s23arm" });
  // arrow head (front) and tail fins (back)
  b.spike([0, TIP_Y + 0.2, MZ + 0.22], [0, 0, 1], 0.12, 0.028, { color: CAP_ORANGE, bone: vaneJoint, sides: 6, name: "s23arrow" });
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.1, 0.07], [0.14, 0.07], [0.07, 0], [0.14, -0.07], [0.1, -0.07]],
      { at: [0, TIP_Y + 0.2, MZ - 0.22], x: [0, 0, -1], thickness: 0.006, color: s > 0 ? CAP_ORANGE : YELLOW_DARK, bone: vaneJoint, name: "s23fin" + (s > 0 ? "A" : "B") },
    );
    break;
  }
  // cardinal cross bar
  b.rod([-0.09, TIP_Y + 0.12, MZ], [0.09, TIP_Y + 0.12, MZ], 0.005, STEEL, { bone: vaneJoint, sides: 6, name: "s23cross" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { at: [s * 0.09, TIP_Y + 0.12, MZ], bone: vaneJoint });

  // ---------------- tattered pennant ----------------
  const streamer = svg(
    `<svg viewBox="0 0 120 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 4 L52 8 L56 14 L84 12 L90 20 L120 24 L92 30 L86 38 L58 34 L52 44 L0 44 Z" fill="${PENNANT_RED}"/>
      <path d="M0 4 L52 8 L56 14 L84 12 L90 20 L120 24 L92 30 L86 38 L58 34 L52 44 L0 44 Z" fill="none" stroke="#6a1a0e" stroke-width="2"/>
      <path d="M0 4 L60 8 L0 18Z" fill="#e8742a"/>
      <circle cx="12" cy="24" r="5" fill="#f7f5ee"/>
      <path d="M26 22 L44 22 M26 28 L40 28" stroke="#f7f5ee" stroke-width="3" stroke-linecap="round"/>
      <path d="M62 18 L74 22 M66 30 L78 28" stroke="#6a1a0e" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  b.cards([frame([0, TIP_Y + 0.02, MZ], [0, 1, 0])], streamer, {
    size: [0.2, 0.55],
    lean: 90,
    flow: [0, 0, -1],
    bend: 0,
    bone: vaneJoint,
  });
  // The streamer hangs from the arm: a flat pennant plane trailing behind
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    at: [0.012, TIP_Y + 0.12, MZ - 0.32],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: streamer,
    bone: vaneJoint,
    name: "s23pennantL",
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    at: [-0.012, TIP_Y + 0.12, MZ - 0.32],
    dir: [-1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: streamer,
    bone: vaneJoint,
    name: "s23pennantR",
  });
  // pennant boom
  b.rod([0, TIP_Y + 0.12, MZ], [0, TIP_Y + 0.12, MZ - 0.56], 0.005, YELLOW, { bone: vaneJoint, sides: 6, name: "s23pBoom" });
  // tied rag loops
  for (let k = 0; k < 3; k++)
    b.part(new THREE.TorusGeometry(0.014, 0.004, 4, 8), DARK, {
      at: [0, TIP_Y + 0.12, MZ - 0.12 - k * 0.16],
      dir: [0, 0, 1],
      axis: "z",
      bone: vaneJoint,
      name: "s23tie" + k,
    });

  // ---------------- sail battens, lashings, grommets ----------------
  const rope = "#9b8660";
  for (const s of [1, -1]) {
    const x = s * 0.062;
    const y0 = APEX + 0.05;
    const z0 = -1.3;
    const tag = s > 0 ? "L" : "R";
    // battens fanning across the sail
    const bats: [number, number, number, number][] = [
      [0.1, 0.12, 0.98, 0.1],
      [0.2, 0.42, 0.88, 0.4],
      [0.3, 0.7, 0.72, 0.66],
      [0.4, 0.95, 0.5, 0.88],
    ];
    bats.forEach(([za, ya, zb, yb], i) => {
      b.rod([x, y0 + ya * 0.9, z0 + za], [x, y0 + yb * 0.9, z0 + zb], 0.008, YELLOW, { bone: "body", sides: 6, name: `s23batten${tag}${i}` });
      // lashings at both ends
      for (const t of [0.12, 0.5, 0.88]) {
        const px = z0 + za + (zb - za) * t;
        const py = y0 + (ya + (yb - ya) * t) * 0.9;
        b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 6), rope, {
          at: [x, py, px],
          dir: [s, 0, 0],
          bone: "body",
          name: `s23lash${tag}${i}`,
        });
      }
    });
    // grommet rings along the leading (mast) edge
    for (let k = 0; k < 6; k++) {
      const y = y0 + 0.12 + k * 0.18;
      b.part(new THREE.TorusGeometry(0.02, 0.006, 4, 8), STEEL, {
        at: [s * 0.054, y, z0 + 0.06],
        dir: [s, 0, 0],
        axis: "z",
        bone: "body",
        name: `s23grom${tag}${k}`,
      });
    }
    // foot rope along the bottom edge
    b.rod([x, y0 + 0.006, z0 + 0.02], [x, y0 + 0.006, z0 + 1.1], 0.007, rope, { bone: "body", sides: 5, name: `s23foot${tag}` });
    // diagonal leech cord
    b.rod([x, y0 + 0.8, z0 + 0.28], [x, y0 + 0.02, z0 + 1.05], 0.005, DARK, { bone: "body", sides: 5, name: `s23leech${tag}` });
  }
}
    return addMastTopFlag;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addRigging(b: Builder) {
  const BODY = "body";
  const TOP: [number, number, number] = [0, 3.05, -1.2];
  const BEAD = "#a9743c";
  const BEAD_DARK = "#6e4824";

  const line = (a: number[], c: number[], r = 0.006, col = ROPE) =>
    b.rod(a, c, r, col, { bone: BODY, sides: 5, name: "s24line" });
  const bead = (p: number[], r: number, col = BEAD) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { at: p, bone: BODY, name: "s24bead" });
  const lerp3 = (a: number[], c: number[], t: number): [number, number, number] => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];

  // Main stays doubled as slightly offset side lines, from mast top to spine front and rear
  const FRONT: [number, number, number] = [0, 1.7, 1.35];
  const REAR: [number, number, number] = [0, 1.7, -1.4];
  for (const s of [1, -1]) {
    const f: [number, number, number] = [s * 0.03, 1.7, 1.2];
    const r: [number, number, number] = [s * 0.03, 1.7, -1.3];
    line([s * 0.012, 3.0, -1.2], f, 0.005);
    line([s * 0.012, 3.0, -1.2], r, 0.005);
    // tension beads along each line
    for (const t of [0.35, 0.62]) {
      const p = lerp3([s * 0.012, 3.0, -1.2], f, t);
      bead(p, 0.02, t < 0.5 ? BEAD : BEAD_DARK);
      bead(lerp3([s * 0.012, 3.0, -1.2], r, t * 0.8), 0.016, BEAD);
    }
    // lashing wraps at spine ends
    b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), ROPE, {
      at: f,
      bone: BODY,
      dir: [0, 0, 1],
      axis: "z",
      name: "s24wrap",
    });
    b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), ROPE, {
      at: r,
      bone: BODY,
      dir: [0, 0, 1],
      axis: "z",
      name: "s24wrap",
    });
  }

  // Shrouds: side lines from mast mid to the rails
  for (const s of [1, -1]) {
    const mid: [number, number, number] = [0, 2.35, -1.23];
    line(mid, [s * 0.5, 0.95, -0.9], 0.005);
    line(mid, [s * 0.5, 0.95, -1.5], 0.005);
    bead(lerp3(mid, [s * 0.5, 0.95, -0.9], 0.55), 0.018, BEAD_DARK);
    bead([s * 0.5, 0.97, -0.9], 0.022, STEEL);
  }

  // Pulley block hanging on the mast at request point
  const blockAt: [number, number, number] = [0, 2.4, -0.2];
  line([0, 2.4, -1.22], [0, 2.52, -0.2], 0.005);
  b.part(new THREE.BoxGeometry(0.07, 0.12, 0.05), BEAD, {
    at: [0, 2.42, -0.2],
    bone: BODY,
    name: "s24block",
  });
  b.part(new THREE.BoxGeometry(0.075, 0.025, 0.055), BEAD_DARK, {
    at: [0, 2.37, -0.2],
    bone: BODY,
    name: "s24blockcap",
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10), STEEL, {
    at: [0, 2.43, -0.2],
    bone: BODY,
    dir: [1, 0, 0],
    name: "s24sheave",
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), DARK, {
    at: [0, 2.43, -0.2],
    bone: BODY,
    dir: [1, 0, 0],
    name: "s24pin",
  });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), STEEL, {
    at: [0, 2.51, -0.2],
    bone: BODY,
    dir: [1, 0, 0],
    axis: "z",
    name: "s24eye",
  });
  // falls: rope from block down to the boom
  line([0.015, 2.36, -0.2], [0.02, 1.76, -0.2], 0.005);
  line([-0.015, 2.36, -0.2], [-0.02, 1.76, -0.2], 0.005);
  bead([0, 2.0, -0.2], 0.022, BEAD);
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.04), BEAD_DARK, {
    at: [0, 1.76, -0.2],
    bone: BODY,
    name: "s24cleat",
  });

  // Mast-top cap and tied knot
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.03, 8), STEEL, {
    at: [0, 3.0, -1.2],
    bone: BODY,
    name: "s24cap",
  });
  // Jib stay from mastJib top to spine front
  line([0, 2.5, 0.12], FRONT, 0.005);
  bead(lerp3([0, 2.5, 0.12], FRONT, 0.5), 0.017, BEAD);
  line([0, 2.5, 0.12], [0, 3.0, -1.2], 0.004);
  void REAR;
}
    return addRigging;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addTeethAndTongue(b: Builder) {
  const CORK = "#c9965a";
  const CORK_DARK = "#a3733d";
  const PINK = "#8a3a4a";

  // Lower jaw: capsule from (0,1.2,1.7) to (0,1.2,2.05), radius 0.065 -> top surface at y~1.265.
  const topY = 1.262;

  // Tongue: flat DARK strip with a tapered tip, lying on the jaw's upper surface.
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.045, 0.22],
      [0.025, 0.3],
      [0, 0.34, "sharp"],
      [-0.025, 0.3],
      [-0.045, 0.22],
    ],
    {
      at: [0, topY, 1.68],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      smoothing: 1,
      color: DARK,
      bone: "jaw",
      name: "tongue",
    },
  );
  // Tongue centre groove and pink tip pad
  b.rod([0, topY + 0.008, 1.72], [0, topY + 0.008, 1.98], 0.004, PINK, { bone: "jaw", name: "tongueGroove", sides: 4 });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), PINK, {
    at: [0, topY + 0.005, 2.0],
    bone: "jaw",
    scale: [1.3, 0.4, 1.6],
    name: "tongueTip",
  });

  // Cork fangs at the lower jaw front, with rings and a small seat plate.
  for (const s of [1, -1]) {
    const x = s * 0.035;
    b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.012, 8), CORK_DARK, {
      at: [x, topY + 0.002, 2.0],
      bone: "jaw",
      name: "fangSeat",
    });
    b.spike([x, topY, 2.0], [0, 1, 0.12], 0.085, 0.019, {
      color: CORK,
      bone: "jaw",
      sides: 7,
      name: s > 0 ? "fangL" : "fangR",
    });
    // cork grain bands
    for (let k = 0; k < 2; k++) {
      b.part(new THREE.TorusGeometry(0.014 - k * 0.004, 0.003, 4, 8), CORK_DARK, {
        at: [x, topY + 0.02 + k * 0.025, 2.0 + 0.003 + k * 0.003],
        bone: "jaw",
        dir: [0, 1, 0.12],
        axis: "z",
        name: "fangBand",
      });
    }
    // little wire tie holding each fang
    b.part(new THREE.TorusGeometry(0.022, 0.003, 4, 10), STEEL, {
      at: [x, topY + 0.006, 2.0],
      bone: "jaw",
      rotation: [90, 0, 0],
      name: "fangWire",
    });
  }

  // Extra: small rear tooth nubs along the lower jaw edges
  for (let k = 0; k < 4; k++) {
    for (const s of [1, -1]) {
      b.spike([s * 0.055, 1.248, 1.76 + k * 0.07], [0, 1, 0], 0.03, 0.01, {
        color: WHITE,
        bone: "jaw",
        sides: 5,
        name: "jawTooth",
      });
    }
  }
}
    return addTeethAndTongue;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addEyeBrows(b: Builder) {
  const tie = (p: number[], bone: string, r = 0.012) =>
    b.part(new THREE.BoxGeometry(r * 2, r * 1.2, r * 2.4), DARK, { at: p, bone, name: "zipKnot" });

  // ---- brows: bent thin yellow tubes, curious (inner low, outer arched)
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.05, 1.605, 1.9],
      [s * 0.09, 1.65, 1.915],
      [s * 0.14, 1.675, 1.9],
      [s * 0.185, 1.64, 1.865],
    ];
    for (let i = 0; i < pts.length - 1; i++)
      b.rod(pts[i], pts[i + 1], 0.011, YELLOW, { bone: "head", sides: 6, name: `brow${s > 0 ? "L" : "R"}${i}` });
    for (const p of pts) b.part(new THREE.SphereGeometry(0.0125, 6, 4), YELLOW, { at: p, bone: "head" });
    // zip-tie knot and tail at outer end
    tie([s * 0.185, 1.645, 1.867], "head");
    b.spike([s * 0.19, 1.645, 1.865], [s * 0.6, 0.5, -0.2], 0.035, 0.006, { color: DARK, bone: "head" });
    // small cable ties anchoring the brow to the head
    tie([s * 0.09, 1.652, 1.912], "head", 0.009);
    b.rod([s * 0.09, 1.64, 1.91], [s * 0.095, 1.58, 1.87], 0.004, ROPE, { bone: "head", sides: 4 });
  }

  // ---- sandal pads under the feet (rear four legs, both sides)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const i of [1, 2, 3, 4]) {
      const joint = `leg${side}${i}`;
      const foot = b.surface(b.root);
      const hit = foot.nearest([s * (0.6 + 0.07 * (i % 2)), 0.0, UNITS_Z[i - 1] + 0.03]);
      const at = hit.at;
      // find the foot lowest point approx: use ball center via nearest hit
      const cx = at.x;
      const cz = at.z;
      b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.02, 10), DARK, {
        at: [cx, 0.012, cz],
        bone: joint,
        name: `sandalPad${side}${i}`,
      });
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.008, 8), DARK, {
        at: [cx, 0.026, cz],
        bone: joint,
        name: `padTop${side}${i}`,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k * Math.PI * 2) / 3 + 0.4;
        b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 6), STEEL, {
          at: [cx + Math.cos(a) * 0.055, 0.034, cz + Math.sin(a) * 0.055],
          bone: joint,
          name: `padBolt${side}${i}${k}`,
        });
      }
    }
  }
}
    return addEyeBrows;
  })(),
);
