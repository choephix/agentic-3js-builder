import * as THREE from "three";
import type { OutlinePoint } from "../src/builder";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import type { Paint } from "../src/paint";
import { countershade, mix, mottle, paint, scales, smoothstep } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Thunderbird",
  description:
    "A giant storm eagle, indigo plumage and cream breastplate, gold beak and talons, every flight feather tipped with crackling cyan lightning.",
  style: "Overwatch/League mix",
  commit: "88fc1f0",
};

// Palette: storm indigo plumage, cream chest, warm gold trim, one electric cyan accent.
const NIGHT = "#12163a";
const INDIGO_D = "#1f2557";
const INDIGO = "#2d3a8c";
const INDIGO_L = "#4656c8";
const LAV = "#8d97e6";
const CREAM = "#fbf0d2";
const CREAM_D = "#e0d0a2";
const IVORY = "#fffaea";
const GOLD = "#f2b73c";
const GOLD_D = "#b97a1e";
const GOLD_L = "#ffd96a";
const TALON = "#262a45";
const CYAN = "#37e8ff";
const CYAN_W = "#d6fcff";
const EYE = "#ffe45c";
const MOUTH = "#5a1630";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const DEGR = Math.PI / 180;

// Feather outlines: [u along length, lead half-width, trail half-width] as shares of the feather width.
type Row = [number, number, number];
const FLIGHT: Row[] = [
  [0, 0.1, 0.1],
  [0.16, 0.38, 0.6],
  [0.7, 0.4, 0.62],
  [0.9, 0.26, 0.42],
  [1, 0, 0],
];
const COVERT: Row[] = [
  [0, 0.1, 0.1],
  [0.16, 0.5, 0.5],
  [0.75, 0.5, 0.5],
  [0.93, 0.3, 0.3],
  [1, 0, 0],
];
const TAILF: Row[] = [
  [0, 0.14, 0.14],
  [0.1, 0.5, 0.5],
  [0.78, 0.5, 0.5],
  [0.92, 0.36, 0.36],
  [1, 0, 0],
];

function rowAt(rows: Row[], u: number): [number, number] {
  for (let i = 1; i < rows.length; i++) {
    if (u <= rows[i][0]) {
      const f = (u - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return [
        rows[i - 1][1] + (rows[i][1] - rows[i - 1][1]) * f,
        rows[i - 1][2] + (rows[i][2] - rows[i - 1][2]) * f,
      ];
    }
  }
  return [0, 0];
}

function outline(rows: Row[], L: number, W: number, u0 = 0): OutlinePoint[] {
  const [l0, t0] = rowAt(rows, u0);
  const pts: Row[] = [[u0, l0, t0], ...rows.filter((r) => r[0] > u0)];
  const out: OutlinePoint[] = pts.map((r, i): OutlinePoint => (i === pts.length - 1 ? [L, 0, "sharp"] : [r[0] * L, r[1] * W]));
  for (let i = pts.length - 2; i >= 0; i--) out.push([pts[i][0] * L, -pts[i][2] * W]);
  return out;
}

const FEATHER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 1 L27 22 L24 44 L16 63 L8 44 L5 22 Z" fill="#ececec"/><path d="M16 4 L16 62" stroke="#a4a4a4" stroke-width="2"/><path d="M16 16 L25 30 M16 28 L23 42 M16 16 L7 30 M16 28 L9 42" stroke="#c2c2c2" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);

const MASK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><path d="M0 12 L22 6 L58 10 L64 14 L52 20 L30 19 L24 28 L18 20 L0 18Z" fill="${NIGHT}"/><path d="M28 17 L35 12 L39 16 L48 11 L56 14" stroke="${CYAN}" stroke-width="2" fill="none"/></svg>`,
  { size: 256 },
);

const BOLT_OUTLINE: OutlinePoint[] = [
  [0.62, 1],
  [0.22, 0.5],
  [0.46, 0.5],
  [0.3, 0],
  [0.82, 0.58],
  [0.56, 0.58],
  [0.84, 1],
];

const keyed =
  (keys: [number, number, number][]) =>
  (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const f = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return [
          keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * f,
          keys[i - 1][2] + (keys[i][2] - keys[i - 1][2]) * f,
        ];
      }
    }
    const last = keys[keys.length - 1];
    return [last[1], last[2]];
  };

export default function build() {
  const b = createBuilder({ name: "thunderbird", paintSize: 2048 });
  const rand = rng(2024);

  // ---------- helpers ----------
  type PlateOpts = {
    root: THREE.Vector3;
    dir: THREE.Vector3;
    normal: THREE.Vector3;
    ref: THREE.Vector3;
    rows: Row[];
    L: number;
    W: number;
    thick: number;
    color: string | Paint;
    bone: Joint;
    lift?: number;
    u0?: number;
    name?: string;
  };
  const plate = (o: PlateOpts) => {
    const dir = o.dir.clone().normalize();
    const y = new THREE.Vector3().crossVectors(o.normal, dir).normalize();
    if (y.dot(o.ref) < 0) y.negate();
    const at = o.root.clone().addScaledVector(o.normal, o.lift ?? 0);
    return b.extrude(outline(o.rows, o.L, o.W, o.u0 ?? 0), {
      at,
      x: dir,
      y,
      thickness: o.thick,
      bevel: o.thick * 0.3,
      detail: 0.34,
      color: o.color,
      bone: o.bone,
      name: o.name,
    });
  };

  const featherPaint = (L: number, dark: string, base: string, light: string, band: string | null) =>
    paint((_p, n, s) => {
      const u = s[0] / L;
      const shaft = Math.abs(s[1]) < 0.0065 && u > 0.04 && u < 0.97;
      if (n.y < -0.4) {
        if (shaft) return CREAM;
        return u > 0.7 && u < 0.78 && band ? CREAM : mix(base, LAV, 0.55);
      }
      if (shaft) return light;
      if (band && u > 0.69 && u < 0.77) return band;
      const col = mix(dark, base, smoothstep(0.02, 0.55, u));
      return s[1] > 0 ? mix(col, light, 0.22 * smoothstep(0.1, 0.9, u)) : col;
    });

  const bolt = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    o: { bone: Joint; seg?: number; amp?: number; r?: number; seed?: number },
  ) => {
    const seg = o.seg ?? 5;
    const amp = o.amp ?? 0.08;
    const r = rng(o.seed ?? 1);
    const dir = c.clone().sub(a);
    const ref = Math.abs(dir.clone().normalize().y) > 0.9 ? V(1, 0, 0) : UP;
    const p1 = new THREE.Vector3().crossVectors(dir, ref).normalize();
    const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= seg; i++) {
      const q = a.clone().lerp(c, i / seg);
      if (i > 0 && i < seg) q.addScaledVector(p1, (r() - 0.5) * 2 * amp).addScaledVector(p2, (r() - 0.5) * 2 * amp);
      pts.push(q);
    }
    const rad = o.r ?? 0.016;
    glow(b.sweep(pts, [rad, rad * 0.5], { bone: o.bone, color: CYAN, section: { ngon: 4 }, caps: "flat" }), 1.4);
    glow(
      b.sweep(pts, [rad * 0.45, rad * 0.25], { bone: o.bone, color: CYAN_W, section: { ngon: 4 }, caps: "flat" }),
      1.8,
    );
    return pts;
  };

  // ---------- skeleton: spine and neck ----------
  const hips = b.joint("hips", { at: [0, 1.2, -0.2], dir: [0, 0.6, 0.4], role: "spine" });
  const bodyPath = catmull([
    [0, 1.2, -0.2],
    [0, 1.42, 0.02],
    [0, 1.72, 0.25],
    [0, 2.0, 0.42],
    [0, 2.22, 0.52],
    [0, 2.38, 0.66],
  ]);
  const tN = bodyPath.closestT([0, 2.0, 0.42]);
  const spine = b.chain("spine", bodyPath.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const spineTop = spine.spanJoints[2];
  const neck = b.chain("neck", bodyPath.slice(tN, 1), { parent: spineTop, count: 3, role: "neck" });
  const head = b.joint("head", { parent: neck.spanJoints[2], at: bodyPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.08 }),
    aim: head.local({ forward: 0.3, up: -0.09 }),
    role: "jaw",
  });
  const crest = b.joint("crest", {
    parent: head,
    at: head.local({ forward: -0.05, up: 0.12 }),
    aim: head.local({ forward: -0.25, up: 0.25 }),
    role: "hinge",
  });

  // ---------- body ----------
  const bodyPaint = countershade(
    scales([INDIGO, INDIGO_L, INDIGO], NIGHT, { size: 0.1, width: 0.1 }),
    scales(CREAM, CREAM_D, { size: 0.075, width: 0.1 }),
    { level: -0.1, soft: 0.3 },
  );
  const body = b.sweep(bodyPath, keyed([
    [0, 0.29, 0.26],
    [0.21, 0.4, 0.33],
    [0.47, 0.49, 0.4],
    [0.62, 0.44, 0.37],
    [0.7, 0.35, 0.3],
    [0.86, 0.24, 0.22],
    [1, 0.17, 0.16],
  ]), {
    bone: [spine, neck],
    color: paint((_p, _n, s) => (s[0] > 0.78 ? IVORY : bodyPaint)),
    name: "body",
  });
  const skin = b.surface(body);

  // collar and chest gem
  const collarLoop = skin.loop(neck.spanJoints[0], { lift: 0.012 });
  b.sweep(collarLoop, [0.03, 0.012], { section: "box", color: GOLD, name: "collar" });
  b.sweep(skin.loop(neck.spanJoints[0], { lift: 0.014 }), [0.008, 0.014], {
    section: "box",
    color: GOLD_D,
    shift: [0, 0],
    name: "collarEdge",
  });
  const chestHit = skin.ray([0, 1.78, 2], [0, 0, -1]);
  if (chestHit) {
    b.stick(new THREE.CylinderGeometry(0.1, 0.115, 0.04, 8), GOLD, chestHit, { embed: 0.45, name: "gemBase" });
    glow(b.stick(new THREE.OctahedronGeometry(0.075), CYAN, chestHit.moved([0, 0.04, 0]), { embed: 0.2, name: "gem" }), 1.6);
  }
  for (const s of [1, -1]) {
    const rough = catmull([
      [s * 0.2, 2.02, 0.7],
      [s * 0.27, 1.86, 0.78],
      [s * 0.25, 1.62, 0.68],
      [s * 0.15, 1.42, 0.5],
    ]);
    glow(b.sweep(skin.drape(rough, { lift: 0.012 }), 0.011, { color: CYAN, section: { ngon: 4 }, name: "conduit" }), 1.3);
  }

  // feather cards: neck ruff, breast fringe, mantle
  b.cards(
    skin.scatter(80, {
      rng: rng(11),
      minDist: 0.085,
      filter: (h) => h.at.y > 2.06 && h.at.y < 2.36 && h.n.y > -0.3,
    }),
    FEATHER,
    { size: [0.12, 0.21], lean: 50, flow: [0, -1, -0.35], bend: 20, vary: 0.25, rng: rng(12), color: IVORY },
  );
  b.cards(
    skin.scatter(170, {
      rng: rng(13),
      minDist: 0.08,
      filter: (h) => h.at.y > 1.32 && h.at.y < 2.0 && h.n.z > 0.1 && h.n.y > -0.75,
    }),
    FEATHER,
    { size: [0.13, 0.21], lean: 58, flow: [0, -1, -0.1], bend: 18, vary: 0.2, rng: rng(14), color: CREAM },
  );
  b.cards(
    skin.scatter(110, {
      rng: rng(15),
      minDist: 0.09,
      filter: (h) => h.at.y > 1.5 && h.n.y > 0.4 && h.n.z < 0.2,
    }),
    FEATHER,
    { size: [0.14, 0.24], lean: 62, flow: [0, -0.3, -1], bend: 16, vary: 0.25, rng: rng(16), color: INDIGO_L },
  );

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), IVORY, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0.01 }),
    scale: [0.172, 0.16, 0.21],
    name: "skull",
  });
  // beak
  const bk0 = head.local({ forward: 0.15, up: -0.015 });
  const upperPath = bezier(
    bk0,
    head.local({ forward: 0.27, up: 0.03 }),
    head.local({ forward: 0.375, up: -0.01 }),
    head.local({ forward: 0.37, up: -0.17 }),
  );
  b.sweep(upperPath, (t) => [0.085 * (1 - t) ** 0.8 + 0.006, 0.1 * (1 - t) ** 0.7 + 0.006], {
    bone: head,
    color: (t) => (t > 0.84 ? TALON : GOLD),
    sectors: [[-28, 28, GOLD_L]],
    sides: 8,
    name: "upperBeak",
  });
  b.sweep(
    [
      head.local({ forward: 0.08, up: -0.075 }),
      head.local({ forward: 0.2, up: -0.088 }),
      head.local({ forward: 0.31, up: -0.082 }),
      head.local({ forward: 0.345, up: -0.062 }),
    ],
    [0.065, 0.014],
    { bone: jaw, color: (t) => (t > 0.86 ? TALON : GOLD_D), sides: 8, name: "lowerBeak" },
  );
  b.sweep(
    [head.local({ forward: 0.12, up: -0.052 }), head.local({ forward: 0.33, up: -0.058 })],
    0.028,
    { bone: head, color: MOUTH, sides: 6, name: "mouth" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), GOLD_D, {
    bone: head,
    at: head.local({ forward: 0.15, up: 0.0 }),
    scale: [0.085, 0.075, 0.07],
    name: "cere",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), NIGHT, {
      bone: head,
      at: head.local({ left: s * 0.032, forward: 0.2, up: 0.032 }),
      name: "nostril",
    });
    // eye
    const E = head.local({ left: s * 0.122, up: 0.06, forward: 0.115 });
    const out = V(s * 0.7, 0.1, 0.7).normalize();
    b.part(new THREE.TorusGeometry(0.054, 0.013, 5, 10), GOLD, { bone: head, at: E, dir: out, axis: "z", name: "eyeRing" });
    glow(b.part(new THREE.SphereGeometry(0.046, 8, 6), EYE, { bone: head, at: E, name: "eye" }), 1.5);
    b.part(new THREE.SphereGeometry(1, 6, 4), NIGHT, {
      bone: head,
      at: E.clone().addScaledVector(out, 0.043),
      scale: [0.011, 0.028, 0.011],
      name: "pupil",
    });
    glow(
      b.part(new THREE.SphereGeometry(0.009, 5, 4), IVORY, {
        bone: head,
        at: E.clone().addScaledVector(out, 0.041).add(V(-s * 0.013, 0.024, 0.004)),
        name: "glint",
      }),
      1.5,
    );
    // brow plate
    b.sweep(
      [
        head.local({ left: s * 0.065, up: 0.128, forward: 0.2 }),
        head.local({ left: s * 0.14, up: 0.125, forward: 0.12 }),
        head.local({ left: s * 0.165, up: 0.095, forward: 0.0 }),
      ],
      [0.038, 0.018],
      { bone: head, color: INDIGO_D, sides: 6, name: "brow" },
    );
    b.decal(skull, MASK, {
      at: head.local({ left: s * 0.16, up: 0.04, forward: 0.04 }),
      dir: [s, 0, 0.1],
      size: [0.3, 0.15],
      mirror: s > 0,
      lift: 0.003,
      name: "mask",
    });
  }
  // crest of ivory blades with lightning tips
  for (const s of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const e = (12 + k * 14) * DEGR;
      const dir = V(s * 0.28, Math.sin(e), -Math.cos(e));
      const L = 0.34 + 0.06 * Math.sin((k / 4) * Math.PI);
      const root = head.local({ left: s * 0.045, up: 0.115, forward: -0.03 - k * 0.012 });
      plate({
        root,
        dir,
        normal: V(1, 0, 0),
        ref: UP,
        rows: FLIGHT,
        L,
        W: 0.13,
        thick: 0.014,
        color: k % 2 ? CREAM : IVORY,
        bone: crest,
        lift: s * 0.002 * k,
        name: "crestBlade",
      });
      glow(
        plate({
          root,
          dir,
          normal: V(1, 0, 0),
          ref: UP,
          rows: FLIGHT,
          L,
          W: 0.13,
          thick: 0.018,
          color: CYAN,
          bone: crest,
          lift: s * 0.002 * k,
          u0: 0.8,
          name: "crestTip",
        }),
        1.4,
      );
    }
  }
  // lightning mane: three glowing bolts rising behind the head
  for (const [k, ang] of [
    [0, 14],
    [1, 38],
    [2, -38],
  ] as [number, number][]) {
    const a = ang * DEGR;
    glow(
      b.extrude(
        BOLT_OUTLINE.map((p): OutlinePoint => [p[0] * (k === 0 ? 0.7 : 0.5), p[1] * (k === 0 ? 0.6 : 0.42)]),
        {
          at: head.local({ forward: -0.17, up: 0.1, left: Math.sin(a) * 0.1 }),
          x: V(Math.sin(a), 0, -Math.cos(a)),
          y: V(0, 0.95, -0.25),
          thickness: 0.03,
          bevel: 0.006,
          detail: 0.34,
          color: k === 0 ? CYAN_W : CYAN,
          bone: crest,
          name: "maneBolt",
        },
      ),
      1.6,
    );
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.12, -0.36],
      [0, 0.98, -0.7],
      [0, 0.8, -1.0],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, [0.15, 0.08], { color: INDIGO_D, name: "tailBase" });
  const d0 = V(0, -0.5, -0.9).normalize();
  const tailN = new THREE.Vector3().crossVectors(V(1, 0, 0), d0).normalize();
  const tailBase = V(0, 0.99, -0.58);
  const tailBone = tail.spanJoints[1];
  for (let layer = 0; layer < 2; layer++) {
    const n = layer === 0 ? 9 : 8;
    for (let i = 0; i < n; i++) {
      const k = layer === 0 ? i - 4 : i - 3.5;
      const dir = d0.clone().applyAxisAngle(tailN, k * 8.8 * DEGR * (layer === 0 ? 1 : 1.0));
      const L = (layer === 0 ? 1.32 : 1.18) - 0.012 * k * k;
      const root = tailBase.clone().addScaledVector(V(1, 0, 0), k * 0.018);
      const lift = layer === 0 ? 0.012 + 0.004 * (4 - Math.abs(k)) : -0.03;
      const col = featherPaint(L, NIGHT, layer === 0 ? INDIGO : INDIGO_D, INDIGO_L, CREAM);
      plate({ root, dir, normal: tailN, ref: V(1, 0, 0), rows: TAILF, L, W: 0.24, thick: 0.014, color: col, bone: tailBone, lift, name: "tailFeather" });
      glow(
        plate({
          root,
          dir,
          normal: tailN,
          ref: V(1, 0, 0),
          rows: TAILF,
          L,
          W: 0.24,
          thick: 0.018,
          color: CYAN,
          bone: tailBone,
          lift,
          u0: 0.84,
          name: "tailTip",
        }),
        1.3,
      );
    }
  }
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const dir = d0.clone().applyAxisAngle(tailN, k * 11 * DEGR);
    plate({
      root: tailBase.clone().addScaledVector(V(1, 0, 0), k * 0.03).addScaledVector(d0, -0.1),
      dir,
      normal: tailN,
      ref: V(1, 0, 0),
      rows: COVERT,
      L: 0.5 - 0.02 * Math.abs(k),
      W: 0.22,
      thick: 0.016,
      color: featherPaint(0.5, INDIGO_D, INDIGO_L, LAV, null),
      bone: tailBone,
      lift: 0.045,
      name: "tailCovert",
    });
  }

  // ---------- legs ----------
  const FLOOR = 0;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos = V(s * 0.22, 1.12, -0.1);
    const foot = V(s * 0.3, 0.24, 0.32);
    const pts = limb(hipPos, foot, [0.42, 0.52, 0.38], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
    });
    const trouser = mottle(CREAM, CREAM_D, { size: 0.12 });
    const scutes = scales(GOLD, GOLD_D, { size: 0.045, width: 0.14 });
    const legSweep = b.sweep(
      leg,
      keyed([
        [0, 0.2, 0.2],
        [0.3, 0.14, 0.14],
        [0.5, 0.115, 0.115],
        [0.7, 0.085, 0.085],
        [0.76, 0.058, 0.058],
        [1, 0.052, 0.052],
      ]),
      { color: paint((_p, _n, t) => (t[0] > 0.74 ? scutes : trouser)), sides: 8, name: "leg" },
    );
    b.cards(
      b.surface(legSweep).scatter(44, {
        rng: rng(30 + (s > 0 ? 1 : 2)),
        minDist: 0.08,
        filter: (h) => h.at.y > 0.62,
      }),
      FEATHER,
      { size: [0.12, 0.2], lean: 55, flow: [0, -1, 0], bend: 15, vary: 0.2, rng: rng(33), color: CREAM },
    );
    // anklet
    const ank = leg.at(0.86);
    b.lathe(
      [
        [0.058, -0.045],
        [0.088, -0.045],
        [0.088, 0.045],
        [0.058, 0.045],
      ],
      { at: ank, axis: ank, bone: leg.spanJoints[2], color: GOLD, segments: 8, name: "anklet" },
    );
    glow(
      b.lathe(
        [
          [0.058, -0.012],
          [0.095, -0.012],
          [0.095, 0.012],
          [0.058, 0.012],
        ],
        { at: ank, axis: ank, bone: leg.spanJoints[2], color: CYAN, segments: 8, name: "ankletGlow" },
      ),
      1.4,
    );
    const ankleJ = leg.tip as Joint;
    // toes
    const toeDirs: [string, number][] = [
      ["A", -30],
      ["B", 0],
      ["C", 30],
    ];
    for (const [tag, ang] of toeDirs) {
      const a = (ang + s * 4) * DEGR;
      const dir = V(Math.sin(a), 0, Math.cos(a));
      const p0 = foot.clone();
      const p1 = foot.clone().addScaledVector(dir, 0.17).add(V(0, -0.13, 0));
      const p2 = p1.clone().addScaledVector(dir, 0.17).add(V(0, -0.06, 0));
      const toe = b.chain(`toe${tag}${side}`, [p0, p1, p2], {
        parent: ankleJ,
        names: [`toe${tag}${side}1`, `toe${tag}${side}2`, `toe${tag}${side}3`],
        role: "digit",
      });
      b.sweep(toe, [0.058, 0.044], {
        color: paint(() => scutes),
        sides: 6,
        name: "toe",
      });
      b.part(new THREE.SphereGeometry(0.056, 6, 4), GOLD_D, { bone: toe.spanJoints[0], at: p1, name: "knuckle" });
      const tip = p2.clone().addScaledVector(dir, 0.11).add(V(0, -0.05 - 0.0, 0));
      b.sweep(bezier(p2, p2.clone().addScaledVector(dir, 0.08).add(V(0, 0.01, 0)), tip), [0.044, 0], {
        bone: toe.tip as Joint,
        color: TALON,
        sides: 6,
        name: "claw",
      });
      // scorch spark running off each claw along the floor
      bolt(V(tip.x, FLOOR + 0.014, tip.z), V(tip.x + dir.x * 0.4, FLOOR + 0.014, tip.z + dir.z * 0.4), {
        bone: toe.tip as Joint,
        seg: 3,
        amp: 0.05,
        r: 0.01,
        seed: 100 + Math.round(ang) + (s > 0 ? 7 : 0),
      });
    }
    // hallux
    const h0 = foot.clone().add(V(-s * 0.01, -0.03, -0.02));
    const h1 = foot.clone().add(V(0, -0.1, -0.13));
    const h2 = h1.clone().add(V(0, -0.075, -0.1));
    const hal = b.chain(`hallux${side}`, [h0, h1, h2], {
      parent: ankleJ,
      names: [`hallux${side}1`, `hallux${side}2`, `hallux${side}3`],
      role: "digit",
    });
    b.sweep(hal, [0.06, 0.045], { color: paint(() => scutes), sides: 6, name: "hallux" });
    b.sweep(bezier(h2, h2.clone().add(V(0, 0, -0.06)), h2.clone().add(V(0, -0.075, -0.05))), [0.05, 0], {
      bone: hal.tip as Joint,
      color: TALON,
      sides: 6,
      name: "halluxClaw",
    });
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.3, 1.95, 0.22],
        [s * 1.4, 2.02, 0.04],
        [s * 2.35, 2.1, 0.2],
        [s * 3.05, 2.15, 0.1],
      ]),
      {
        parent: spineTop,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "wing",
      },
    );
    b.sweep(arm, (t): [number, number] => [0.125 - 0.065 * t, 0.062 - 0.03 * t], { color: CREAM, sides: 8, name: "armTube" });
    for (const t of [0.12, 0.4]) {
      const bf = arm.at(t);
      b.lathe(
        [
          [0.07, -0.032],
          [0.14, -0.032],
          [0.14, 0.032],
          [0.07, 0.032],
        ],
        { at: bf, axis: bf, bone: arm.jointAt(t), color: GOLD, segments: 8, name: "armBand" },
      );
      glow(
        b.lathe(
          [
            [0.07, -0.008],
            [0.146, -0.008],
            [0.146, 0.008],
            [0.07, 0.008],
          ],
          { at: bf, axis: bf, bone: arm.jointAt(t), color: CYAN, segments: 8, name: "armBandGlow" },
        ),
        1.4,
      );
    }
    // pauldron cap over the shoulder: indigo dome, gold rim, cyan core
    const pd = V(s * 0.45, 1.97, 0.2);
    b.lathe(
      [
        [0, 0],
        [0.19, 0],
        [0.19, 0.03],
        [0.155, 0.09],
        [0.08, 0.135],
        [0, 0.15],
      ],
      { at: pd, axis: [s, 0, 0], bone: arm.spanJoints[0], color: INDIGO_L, segments: 10, name: "pauldron" },
    );
    b.lathe(
      [
        [0.185, -0.012],
        [0.215, -0.012],
        [0.215, 0.034],
        [0.185, 0.034],
      ],
      { at: pd, axis: [s, 0, 0], bone: arm.spanJoints[0], color: GOLD, segments: 10, name: "pauldronRim" },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.05), CYAN, {
        bone: arm.spanJoints[0],
        at: pd.clone().add(V(s * 0.15, 0.02, 0)),
        name: "pauldronGem",
      }),
      1.6,
    );
    const ts = arm.ts;
    const R = V(s, 0, 0);
    const dirOf = (aDeg: number) => V(s * Math.sin(aDeg * DEGR), -0.04, -Math.cos(aDeg * DEGR)).normalize();

    type Fe = { t: number; bone: Joint; a: number; L: number; W: number; k: number; tips: boolean };
    const feathers: Fe[] = [];
    // tertials
    for (let i = 0; i < 7; i++) {
      const f = i / 6;
      feathers.push({ t: ts[1] * (0.3 + 0.68 * f), bone: arm.spanJoints[0], a: -16 + 14 * f, L: 0.8 + 0.4 * f, W: 0.23, k: i, tips: false });
    }
    // secondaries
    for (let i = 0; i < 10; i++) {
      const f = i / 9;
      feathers.push({ t: ts[1] + (ts[2] - ts[1]) * (0.04 + 0.92 * f), bone: arm.spanJoints[1], a: -2 + 14 * f, L: 1.28 - 0.1 * f, W: 0.2, k: i, tips: true });
    }
    // primaries
    const primL = [1.42, 1.48, 1.52, 1.52, 1.47, 1.4, 1.3, 1.17, 1.02, 0.86];
    for (let i = 0; i < 10; i++) {
      const f = i / 9;
      feathers.push({ t: ts[2] + (1 - ts[2]) * (0.05 + 0.9 * f), bone: arm.spanJoints[2], a: 28 + 66 * f, L: primL[i], W: 0.17, k: i, tips: true });
    }
    const primaryTips: THREE.Vector3[] = [];
    for (const fe of feathers) {
      const root = arm.path.at(fe.t);
      const dir = dirOf(fe.a);
      const lift = -0.025 + 0.004 * fe.k;
      plate({
        root,
        dir,
        normal: UP,
        ref: V(0, 0, 1),
        rows: FLIGHT,
        L: fe.L,
        W: fe.W,
        thick: 0.013,
        color: featherPaint(fe.L, NIGHT, INDIGO, INDIGO_L, CREAM),
        bone: fe.bone,
        lift,
        name: "flight",
      });
      if (fe.tips) {
        glow(
          plate({
            root,
            dir,
            normal: UP,
            ref: V(0, 0, 1),
            rows: FLIGHT,
            L: fe.L,
            W: fe.W,
            thick: 0.017,
            color: CYAN,
            bone: fe.bone,
            lift,
            u0: 0.84,
            name: "flightTip",
          }),
          1.3,
        );
      }
      if (fe.bone === arm.spanJoints[2]) primaryTips.push(root.clone().addScaledVector(dir, fe.L));
      // greater coverts
      plate({
        root: root.clone().addScaledVector(dir, 0.05),
        dir,
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.42 * fe.L + 0.1,
        W: fe.W * 1.05,
        thick: 0.013,
        color: featherPaint(0.42 * fe.L + 0.1, INDIGO, INDIGO_L, "#7a89f0", CREAM),
        bone: fe.bone,
        lift: 0.03 + 0.003 * fe.k,
        name: "covertA",
      });
      // median coverts, offset between the greater ones
      plate({
        root: root.clone().addScaledVector(dir, 0.0).addScaledVector(R, 0.04),
        dir: dirOf(fe.a + 3),
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.24 * fe.L + 0.06,
        W: fe.W,
        thick: 0.013,
        color: featherPaint(0.24 * fe.L + 0.06, INDIGO_L, "#6a7af0", CREAM, null),
        bone: fe.bone,
        lift: 0.055 + 0.003 * fe.k,
        name: "covertB",
      });
    }
    // leading-edge cream coverts along the arm
    for (let i = 0; i < 14; i++) {
      const t = 0.04 + 0.93 * (i / 13);
      const bone = arm.jointAt(t);
      plate({
        root: arm.path.at(t).add(V(0, 0, 0.02)),
        dir: dirOf(20 + 62 * (i / 13)),
        normal: UP,
        ref: V(0, 0, 1),
        rows: COVERT,
        L: 0.2,
        W: 0.15,
        thick: 0.014,
        color: featherPaint(0.2, CREAM_D, CREAM, IVORY, null),
        bone,
        lift: 0.085 + 0.002 * i,
        name: "covertC",
      });
    }
    // gold wrist guard, gem and claw
    const wf = arm.at(ts[2] + 0.05);
    b.lathe(
      [
        [0.06, -0.07],
        [0.13, -0.07],
        [0.13, 0.07],
        [0.06, 0.07],
      ],
      { at: wf, axis: wf, bone: arm.spanJoints[2], color: GOLD, segments: 8, name: "wristGuard" },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.055), CYAN, {
        bone: arm.spanJoints[2],
        at: wf.at.clone().add(V(0, 0.1, 0.04)),
        name: "wristGem",
      }),
      1.6,
    );
    b.spike(wf.at.clone().add(V(0, 0.02, 0.1)), V(0, 0.1, 1), 0.16, 0.035, {
      bone: arm.spanJoints[2],
      color: TALON,
      sides: 6,
      name: "wristClaw",
    });

    // lightning crackling over the wing
    const wr = arm.spanJoints[2];
    bolt(V(s * 2.45, 2.28, 0.3), V(s * 3.4, 2.3, 0.12), { bone: wr, seg: 6, amp: 0.07, seed: 40 + (s > 0 ? 0 : 50) });
    bolt(V(s * 1.5, 2.2, 0.12), V(s * 2.3, 2.3, 0.28), { bone: arm.spanJoints[1], seg: 5, amp: 0.06, seed: 41 + (s > 0 ? 0 : 50) });
    // spanwise lightning veins lying on the coverts
    bolt(V(s * 0.55, 2.24, -0.42), V(s * 1.45, 2.26, -0.46), { bone: arm.spanJoints[0], seg: 5, amp: 0.045, r: 0.02, seed: 120 + (s > 0 ? 0 : 50) });
    bolt(V(s * 1.5, 2.26, -0.46), V(s * 2.35, 2.32, -0.4), { bone: arm.spanJoints[1], seg: 5, amp: 0.045, r: 0.02, seed: 121 + (s > 0 ? 0 : 50) });
    bolt(V(s * 2.4, 2.32, -0.42), V(s * 3.2, 2.32, -0.5), { bone: wr, seg: 5, amp: 0.045, r: 0.02, seed: 122 + (s > 0 ? 0 : 50) });
    for (const [i, j] of [
      [2, 4],
      [5, 7],
      [7, 9],
    ] as [number, number][]) {
      bolt(primaryTips[i].clone().add(V(0, 0.01, 0)), primaryTips[j].clone().add(V(0, 0.01, 0)), {
        bone: wr,
        seg: 4,
        amp: 0.09,
        r: 0.014,
        seed: 60 + i + (s > 0 ? 0 : 50),
      });
    }
    bolt(primaryTips[9].clone().add(V(0, 0.02, 0)), primaryTips[9].clone().add(V(s * 0.45, 0.55, 0.15)), {
      bone: wr,
      seg: 5,
      amp: 0.08,
      seed: 80 + (s > 0 ? 0 : 50),
    });
    // spark shards drifting off the wing
    for (let i = 0; i < 9; i++) {
      const tipOf = primaryTips[i];
      const p = tipOf.clone().add(V(s * 0.08 + (rand() - 0.5) * 0.3, 0.1 + rand() * 0.35, (rand() - 0.5) * 0.3));
      glow(
        b.part(new THREE.OctahedronGeometry(0.018 + rand() * 0.02), i % 3 ? CYAN : CYAN_W, { bone: wr, at: p, name: "shard" }),
        1.6,
      );
    }
  }

  // body-hugging arcs and ground sparks
  bolt(V(0.5, 1.95, 0.55), V(0.95, 1.35, 0.7), { bone: spineTop, seg: 5, amp: 0.07, seed: 7 });
  bolt(V(-0.5, 1.95, 0.55), V(-0.95, 1.4, 0.65), { bone: spineTop, seg: 5, amp: 0.07, seed: 8 });
  bolt(V(0.0, 2.55, 0.35), V(0.35, 2.85, -0.05), { bone: head, seg: 4, amp: 0.06, seed: 9 });
  bolt(V(0.0, 0.5, -1.35), V(0.3, 0.2, -1.6), { bone: tail.spanJoints[1], seg: 4, amp: 0.06, seed: 10 });

  return b.root;
}
