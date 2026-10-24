```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, limb, paint, svg } from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird",
  description:
    "A plump songbird perched on a wooden branch, built from Bauhaus primary-colour geometry: a blue egg body, a yellow head with a black diagonal cap, quarter-disc wings in nested red, yellow and blue, a triangle crest, a fan of tail plates and a pyramid beak. The branch carries triangle, square and disc leaves.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: primary colours, black, and paper cream.
const RED = "#d62a1f";
const BLUE = "#1f48b8";
const YELLOW = "#f6c80f";
const BLACK = "#15151a";
const CREAM = "#f3ead2";

// Branch and perch geometry (meters).
const BR = 0.014; // branch radius at the perch
const TOP = 2 * BR; // top of the branch where the feet stand
const TR = 0.0026; // toe radius
const FOOT_Y = TOP + TR;

// Head scale constants.
const HC = new THREE.Vector3(0, 0.145, 0.058);
const HR = 0.027;

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="38" fill="${CREAM}"/>
    <circle cx="50" cy="50" r="27" fill="${BLUE}"/>
    <path d="M50 23 A27 27 0 0 0 50 77 Z" fill="${RED}"/>
    <circle cx="50" cy="50" r="13" fill="${BLACK}"/>
    <rect x="57" y="33" width="10" height="10" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="${BLACK}"/>
    <circle cx="50" cy="50" r="41" fill="${CREAM}"/>
    <circle cx="50" cy="50" r="32" fill="${RED}"/>
    <path d="M50 22 L77 70 L23 70 Z" fill="${YELLOW}"/>
    <circle cx="50" cy="57" r="7" fill="${BLACK}"/>
  </svg>`,
  { size: 160 },
);

const SADDLE = svg(
  `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2 L38 29 L2 29 Z" fill="${RED}" stroke="${BLACK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 32 L38 59 L2 59 Z" fill="${YELLOW}" stroke="${BLACK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 62 L38 88 L2 88 Z" fill="${BLACK}"/>
  </svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const WOOD = grain("#6b4426", "#a8703c", { size: 0.012, axis: "x", seed: 4 });
const HEAD_PAINT = paint((p) => (p.y - HC.y + 0.5 * (p.z - HC.z) > 0.011 ? BLACK : YELLOW));
const TAIL_PAINT = paint((_p, _n, s) => (s[1] > 0.074 ? YELLOW : BLACK));

const splitCache = new Map<string, Paint>();
function splitPaint(a: string, c: string): Paint {
  const key = `${a}|${c}`;
  let p = splitCache.get(key);
  if (!p) {
    p = paint((_p, _n, s) => (s[0] > 0 ? a : c));
    splitCache.set(key, p);
  }
  return p;
}

type Pt2 = [number, number];
const rot2 = (pts: Pt2[], a: number, k: number): Pt2[] =>
  pts.map(([x, y]) => [k * (x * Math.cos(a) - y * Math.sin(a)), k * (x * Math.sin(a) + y * Math.cos(a))]);

const LEAF_SHAPES: Record<"tri" | "sq" | "disc", Pt2[]> = {
  tri: [
    [-0.5, -0.4],
    [0.5, -0.4],
    [0, 0.6],
  ],
  sq: [
    [-0.4, -0.4],
    [0.4, -0.4],
    [0.4, 0.4],
    [-0.4, 0.4],
  ],
  disc: Array.from({ length: 14 }, (_, i) => [0.5 * Math.cos((i / 14) * Math.PI * 2), 0.5 * Math.sin((i / 14) * Math.PI * 2)] as Pt2),
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "songbird" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- Skeleton ------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.07, -0.02] });

  const P = [
    [0, 0.062, -0.045],
    [0, 0.078, -0.005],
    [0, 0.1, 0.025],
    [0, 0.122, 0.042],
    [0, 0.136, 0.052],
  ];
  const spine = b.chain("spine", catmull([P[0], P[1], P[2]]), { parent: hips, role: "spine" });
  const neck = b.chain("neck", catmull([P[2], P[3], P[4]]), { parent: spine.joints[1], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: P[4], dir: [0, 0.1, 1], role: "head" });

  const lowerTip = V(0, HC.y - 0.0115, HC.z + 0.045);
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, HC.y - 0.008, HC.z + 0.012],
    aim: lowerTip,
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.066, -0.04],
      [0, 0.061, -0.07],
      [0, 0.055, -0.1],
      [0, 0.05, -0.135],
    ]),
    { parent: hips, role: "tail" },
  );

  const branchJ = b.joint("branch", { parent: hips, at: [0, BR, 0], group: "branch" });

  // ---- Body: blue back, cream belly, yellow rump --------------------------------------------------------------
  const body = b.sweep(catmull(P), [0.011, 0.023, 0.03, 0.033, 0.029, 0.022, 0.018], {
    bone: [spine, neck],
    color: BLUE,
    bands: [
      [0.22, YELLOW],
      [1, BLUE],
    ],
    sectors: [[125, 235, CREAM, 0.22, 1]],
    sides: 10,
    name: "body",
  });
  const bodySkin = b.surface(body);

  // Chest emblem and back saddle.
  const chest = bodySkin.around([0, 0.1, 0.02]).at(0, -28);
  if (chest) b.decal(bodySkin, EMBLEM, { at: chest, size: [0.04, 0.04], name: "emblem" });
  const top = bodySkin.ray([0, 0.25, -0.005], [0, -1, 0]);
  if (top) b.decal(bodySkin, SADDLE, { at: top, up: [0, 0, 1], size: [0.026, 0.06], name: "saddle" });

  // ---- Head ---------------------------------------------------------------------------------------------------
  const headPart = b.part(new THREE.SphereGeometry(HR, 12, 9), HEAD_PAINT, {
    bone: head,
    at: HC,
    flat: true,
    name: "skull",
  });
  const headSkin = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSkin.around(HC).at(s * 60, -2);
    if (hit) b.decal(headSkin, EYE, { at: hit, size: [0.021, 0.021], name: s > 0 ? "eyeL" : "eyeR" });
  }

  // Crest: two overlapping triangles.
  const crestAt = V(0, HC.y + 0.019, HC.z + 0.016);
  b.extrude(
    [
      [-0.004, 0],
      [0.034, 0],
      [0.022, 0.042],
    ],
    { at: crestAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.006, color: RED, bone: head, name: "crestRed" },
  );
  b.extrude(
    [
      [-0.002, 0],
      [0.022, 0],
      [0.014, 0.027],
    ],
    {
      at: crestAt.clone().add(V(0, 0.002, 0.003)),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.009,
      color: YELLOW,
      bone: head,
      name: "crestYellow",
    },
  );

  // Beak: a square pyramid above, a smaller one below on the jaw.
  const cone = (base: THREE.Vector3, tip: THREE.Vector3, r: number, sides: number, color: string, bone: Joint, name: string) => {
    const d = tip.clone().sub(base);
    return b.part(new THREE.ConeGeometry(r, d.length(), sides, 1), color, {
      bone,
      at: base.clone().add(tip).multiplyScalar(0.5),
      dir: d.clone().normalize(),
      flat: true,
      name,
    });
  };
  cone(V(0, HC.y - 0.003, HC.z + 0.019), V(0, HC.y - 0.008, HC.z + 0.054), 0.0125, 4, RED, head, "beakUpper");
  cone(V(0, HC.y - 0.0085, HC.z + 0.016), lowerTip, 0.0085, 4, BLACK, jaw, "beakLower");

  // ---- Tail: a fan of three plates ----------------------------------------------------------------------------
  const T0 = V(0, 0.066, -0.04);
  const back0 = V(0, -0.17, -1).normalize();
  const plates: { phi: number; dy: number; outline: Pt2[]; color: string | Paint }[] = [
    {
      phi: 0,
      dy: 0,
      outline: [
        [-0.012, 0],
        [0.012, 0],
        [0.013, 0.078],
        [0, 0.1],
        [-0.013, 0.078],
      ],
      color: TAIL_PAINT,
    },
    {
      phi: 0.3,
      dy: -0.0035,
      outline: [
        [-0.011, 0],
        [0.011, 0],
        [0, 0.082],
      ],
      color: RED,
    },
    {
      phi: -0.3,
      dy: -0.0035,
      outline: [
        [-0.011, 0],
        [0.011, 0],
        [0, 0.082],
      ],
      color: RED,
    },
  ];
  for (const pl of plates) {
    const x = V(1, 0, 0).applyAxisAngle(V(0, 1, 0), pl.phi);
    const y = back0.clone().applyAxisAngle(V(0, 1, 0), pl.phi);
    b.extrude(pl.outline, {
      at: T0.clone().add(V(0, pl.dy, 0)),
      x,
      y,
      thickness: 0.003,
      color: pl.color,
      bone: tail.joints[0],
      name: "tailPlate",
    });
  }

  // ---- Wings: nested quarter-discs with a row of dots ---------------------------------------------------------
  const layers: [number, string][] = [
    [1, RED],
    [0.72, YELLOW],
    [0.46, BLUE],
    [0.22, BLACK],
  ];
  const RX = 0.1;
  const RY = 0.042;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const xd = V(0.3 * s, -0.3, -1).normalize();
    const yd = V(0, 1, 0).addScaledVector(xd, -xd.y).normalize();
    const out = new THREE.Vector3().crossVectors(xd, yd).multiplyScalar(s);
    const A = V(s * 0.026, 0.103, 0.032);
    const wp = (u: number, v: number, w: number) =>
      A.clone().addScaledVector(xd, u).addScaledVector(yd, v).addScaledVector(out, w);

    const wing = b.chain(`wing${side}`, [A.clone(), wp(RX * 0.5, 0, 0), wp(RX, 0, 0)], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
    });
    const sh = wing.joints[0];

    const quarter = (k: number): Pt2[] => {
      const pts: Pt2[] = [[0, 0]];
      const a0 = (25 * Math.PI) / 180;
      for (let i = 0; i <= 8; i++) {
        const th = a0 + (i / 8) * (Math.PI / 2 - a0);
        pts.push([RX * k * Math.sin(th), -RY * k * Math.cos(th)]);
      }
      return pts;
    };
    layers.forEach(([k, color], i) => {
      b.extrude(quarter(k), {
        at: wp(0, 0, i * 0.0035),
        x: xd,
        y: yd,
        thickness: 0.004,
        color,
        bone: sh,
        name: `wingLayer${side}`,
      });
    });
    for (const deg of [42, 58, 74]) {
      const th = (deg * Math.PI) / 180;
      const u = RX * 0.86 * Math.sin(th);
      const v = -RY * 0.86 * Math.cos(th);
      b.part(new THREE.CylinderGeometry(0.0038, 0.0038, 0.002, 10), BLACK, {
        bone: sh,
        at: wp(u, v, 0.0022),
        dir: out,
        name: `wingDot${side}`,
      });
    }
  }

  // ---- Legs and toes -------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.017;
    const pts = limb([x, 0.056, 0.004], [x, FOOT_Y, 0], [0.018, 0.018], [0, 0, -1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [x, TOP, 0],
    });
    b.sweep(leg, 0.0032, { color: BLACK, name: `leg${side}` });
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];

    const toes: { dx: number; dz: number }[] = [
      { dx: 0, dz: 1 },
      { dx: 0.0085, dz: 1 },
      { dx: -0.0085, dz: 1 },
      { dx: 0, dz: -1 },
    ];
    toes.forEach((t, i) => {
      const tip = V(x + t.dx, 0.0245, t.dz * 0.0125);
      const mid = V(x + t.dx * 0.5, FOOT_Y - 0.0012, t.dz * 0.0075);
      const tj = b.joint(`toe${i + 1}${side}`, { parent: foot, at: [x, FOOT_Y, 0], aim: tip, role: "digit" });
      b.sweep(catmull([[x, FOOT_Y, 0], mid, tip]), TR, { bone: tj, color: BLACK, name: `toe${side}` });
    });
  }

  // ---- Branch --------------------------------------------------------------------------------------------------
  b.sweep(
    catmull([
      [-0.28, 0.026, 0],
      [-0.14, 0.017, 0.004],
      [0, BR, 0],
      [0.14, 0.016, -0.004],
      [0.28, 0.03, 0],
    ]),
    [0.01, 0.0125, BR, 0.0135, 0.009],
    { bone: branchJ, color: WOOD, caps: "flat", name: "branch" },
  );
  // Cut ends: a cream disc with a red heart.
  const endDisc = (at: THREE.Vector3, dir: THREE.Vector3, r: number) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.003, 10), CREAM, { bone: branchJ, at, dir, flat: true, name: "cutEnd" });
    b.part(new THREE.CylinderGeometry(r * 0.55, r * 0.55, 0.0036, 10), RED, {
      bone: branchJ,
      at: at.clone().addScaledVector(dir, 0.0002),
      dir,
      flat: true,
      name: "cutHeart",
    });
  };
  const dl = V(1, -0.07, 0).normalize();
  endDisc(V(-0.28, 0.026, 0).addScaledVector(dl, -0.0013), dl, 0.0101);
  const dr = V(1, 0.1, 0).normalize();
  endDisc(V(0.28, 0.03, 0).addScaledVector(dr, 0.0013), dr, 0.0091);

  // Twigs with Bauhaus leaves.
  const leaf = (kind: "tri" | "sq" | "disc", at: THREE.Vector3, size: number, rot: number, a: string, c: string) =>
    b.extrude(rot2(LEAF_SHAPES[kind], rot, size), {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      color: splitPaint(a, c),
      bone: branchJ,
      name: `leaf_${kind}`,
    });

  const twig1 = [V(-0.13, 0.016, 0), V(-0.158, 0.05, -0.01), V(-0.2, 0.082, -0.02)];
  b.sweep(catmull(twig1), [0.0045, 0.002], { bone: branchJ, color: WOOD, name: "twig" });
  leaf("tri", twig1[2].clone().add(V(-0.012, 0.016, 0)), 0.042, 0.35, RED, YELLOW);
  leaf("disc", twig1[1].clone().add(V(0.022, 0.008, 0.004)), 0.028, 0, BLUE, CREAM);
  leaf("sq", twig1[1].clone().add(V(-0.022, 0.012, 0.004)), 0.03, 0.6, YELLOW, BLACK);

  const twig2 = [V(0.12, 0.018, 0), V(0.15, 0.045, 0.008), V(0.2, 0.07, 0), V(0.228, 0.104, -0.01)];
  b.sweep(catmull(twig2), [0.0045, 0.0018], { bone: branchJ, color: WOOD, name: "twig" });
  leaf("disc", twig2[3].clone().add(V(0.008, 0.018, 0)), 0.034, 0, YELLOW, RED);
  leaf("tri", twig2[2].clone().add(V(0.022, -0.004, 0.003)), 0.04, -0.9, BLUE, BLACK);
  leaf("sq", twig2[1].clone().add(V(-0.02, 0.014, 0.004)), 0.028, 0.3, RED, CREAM);

  // Rest pose: beak slightly open.
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
```