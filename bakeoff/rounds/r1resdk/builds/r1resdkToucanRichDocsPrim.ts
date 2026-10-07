import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/index";
import { createBuilder, rng, catmull, bezier, paint, countershade, mottle, offset } from "../../../../src/index";

export const meta = {
  name: "Keel-billed toucan on a mossy branch",
  description:
    "A rigged keel-billed toucan with a rainbow beak, lemon bib, lime eye rings and blue feet, perched on a mossy branch beside a pink orchid.",
};

const BLACK = "#0b0b10";
const WING = "#13131c";
const WING2 = "#232638";
const LEMON = "#ffe53a";
const RED = "#e5261f";
const LIME = "#8fe022";
const SKY = "#35b4f0";
const ORANGE = "#ff8a1c";
const CHERRY = "#d3102a";
const FOOT = "#2a7fe8";
const CLAW = "#1a1a22";
const EYE = "#150f0c";
const GREEN = "#3f9a3a";
const STEM = "#5aa030";

const rotPts = (pts: any[], deg: number): OutlinePoint[] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return pts.map((q) => {
    const x = q[0] * c - q[1] * sn;
    const y = q[0] * sn + q[1] * c;
    return (q[2] ? [x, y, "sharp"] : [x, y]) as OutlinePoint;
  });
};
const sepalShape = (L: number, W: number) => [
  [0, 0, "sharp"],
  [0.25 * L, 0.5 * W],
  [0.7 * L, 0.45 * W],
  [L, 0, "sharp"],
  [0.7 * L, -0.45 * W],
  [0.25 * L, -0.5 * W],
];
const petalShape = (L: number, W: number) => [
  [0, 0, "sharp"],
  [0.2 * L, 0.42 * W],
  [0.6 * L, 0.5 * W],
  [L, 0.22 * W],
  [L, -0.22 * W],
  [0.6 * L, -0.5 * W],
  [0.2 * L, -0.42 * W],
];

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.05, 0] });
  const branchJ = b.joint("branch", { parent: root, at: [0, 0.045, 0], dir: [1, 0, 0] });

  const P0: [number, number, number] = [0, 0.235, -0.09];
  const P1: [number, number, number] = [0, 0.31, -0.015];
  const P2: [number, number, number] = [0, 0.4, 0.05];
  const P3: [number, number, number] = [0, 0.49, 0.09];

  const hips = b.joint("hips", { parent: root, at: P0, dir: [0, 0.8, 0.5], role: "spine" });
  const spine = b.chain("spine", catmull([P0, P1, P2]), { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const neck = b.chain("neck", catmull([P2, P3]), { parent: spine.joints[1], names: ["neck"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[0], at: P3, dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.495, 0.11], aim: [0, 0.495, 0.3], role: "jaw" });

  // ---------- body ----------
  const bodyPaint = paint((p, n) => {
    if (n.z > 0.3 && p.y > 0.335 && p.y < 0.535) return p.y < 0.35 ? RED : LEMON;
    return BLACK;
  });
  b.sweep(catmull([P0, P1, P2, P3]), [0.05, 0.078, 0.072, 0.055], {
    bone: [spine, neck],
    color: bodyPaint,
    sides: 10,
  });

  // head
  b.part(new THREE.SphereGeometry(0.06, 10, 8), bodyPaint, {
    bone: head,
    at: [0, 0.525, 0.105],
    scale: [1, 1, 1.1],
  });

  // eyes: lime skin ring, dark eye, highlight
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.031, 8, 6), LIME, { bone: head, at: [s * 0.05, 0.543, 0.125], scale: [0.55, 1, 1] });
    b.part(new THREE.SphereGeometry(0.0145, 8, 6), EYE, { bone: head, at: [s * 0.063, 0.543, 0.13] });
    b.part(new THREE.SphereGeometry(0.0045, 5, 4), "#ffffff", { bone: head, at: [s * 0.074, 0.55, 0.136] });
  }

  // ---------- beak ----------
  const upperPaint = paint((_p, n, s) => {
    const t = s[0];
    if (t > 0.86) return CHERRY;
    if (n.y > 0.5) return LIME;
    if (t < 0.18) return SKY;
    return ORANGE;
  });
  const lowerPaint = paint((_p, _n, s) => {
    const t = s[0];
    if (t > 0.86) return CHERRY;
    if (t < 0.5) return SKY;
    return ORANGE;
  });
  const upper = b.sweep(
    bezier([0, 0.535, 0.13], [0, 0.565, 0.22], [0, 0.55, 0.3], [0, 0.49, 0.37]),
    (t) => [0.034 * (1 - t) + 0.01 * t, 0.042 * (1 - Math.pow(t, 1.3)) + 0.01 * Math.pow(t, 1.3)],
    { bone: head, color: upperPaint, sides: 8 },
  );
  b.sweep(upper.line(0, 0.002), 0.005, { bone: head, color: "#e8ff80", sides: 4 });
  b.sweep(
    bezier([0, 0.49, 0.13], [0, 0.485, 0.21], [0, 0.48, 0.29], [0, 0.468, 0.355]),
    (t) => [0.026 * (1 - t) + 0.009 * t, 0.02 * (1 - t) + 0.006 * t],
    { bone: jaw, color: lowerPaint, sides: 8 },
  );
  const upSurf = b.surface(upper);
  for (const s of [1, -1]) {
    const hit = upSurf.nearest([s * 0.04, 0.54, 0.17]);
    b.stick(new THREE.SphereGeometry(0.0075, 6, 4), "#1a1010", hit, { embed: 0.3, bone: head });
  }

  // ---------- wings ----------
  const wingPaint = paint((_p, _n, s) => {
    const ang = Math.atan2(s[1], s[0]);
    return Math.floor(ang * 16) % 2 === 0 ? WING : WING2;
  });
  const wingOutline: OutlinePoint[] = [
    [0.03, -0.02],
    [0.0, 0.03],
    [-0.09, 0.02],
    [-0.2, -0.08],
    [-0.3, -0.24, "sharp"],
    [-0.18, -0.22],
    [-0.06, -0.16],
    [0.02, -0.08],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.074, 0.44, 0.07],
        [s * 0.1, 0.3, -0.12],
        [s * 0.115, 0.2, -0.23],
      ]),
      { parent: spine.joints[1], names: [`wing${S}1`, `wing${S}2`, `wingTip${S}`], role: "wing" },
    );
    b.extrude(wingOutline, {
      at: [s * 0.074, 0.44, 0.07],
      x: [0, 0, 1],
      y: [s * 0.18, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: wingPaint,
      bone: wing.joints[0],
    });
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.25, -0.1],
      [0, 0.17, -0.21],
      [0, 0.09, -0.31],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.04 - 0.01 * t, 0.011], { color: WING, caps: "flat" });
  // scarlet undertail patch
  b.part(new THREE.IcosahedronGeometry(0.042, 1), RED, { bone: hips, at: [0, 0.2, -0.118], scale: [0.95, 0.75, 1.15], flat: true });
  b.part(new THREE.IcosahedronGeometry(0.03, 1), RED, { bone: hips, at: [0, 0.165, -0.165], scale: [1, 0.8, 1], flat: true });

  // ---------- legs and feet ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.04, 0.24, -0.02],
        [s * 0.046, 0.17, -0.025],
        [s * 0.04, 0.092, 0.0],
      ]),
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `ankle${S}`],
        role: "leg",
        contact: [s * 0.04, 0.085, 0],
      },
    );
    b.sweep(leg, [0.021, 0.013], {
      bands: [
        [0.45, BLACK],
        [1, FOOT],
      ],
      sides: 8,
    });
    for (const dz of [1, -1]) {
      for (const k of [-1, 1]) {
        const id = `${dz > 0 ? "F" : "B"}${k > 0 ? "o" : "i"}${S}`;
        const tx = s * 0.04 + k * 0.013;
        const tipPt: [number, number, number] = [tx, 0.066, dz * 0.062];
        const toe = b.chain(
          `toe${id}`,
          catmull([[s * 0.04, 0.092, 0], [tx, 0.092, dz * 0.03], tipPt]),
          { parent: leg.tip!, names: [`toeA${id}`, `toeB${id}`], role: "digit" },
        );
        b.sweep(toe, [0.011, 0.008], { color: FOOT, sides: 6 });
        b.spike(tipPt, [0, -0.5, dz], 0.022, 0.006, { color: CLAW, bone: toe.joints[1], sides: 5 });
      }
    }
  }

  // ---------- branch ----------
  const bark = mottle("#5b4030", "#3a291f", { size: 0.025 });
  const mossP = mottle("#6aa832", "#3f7a28", { size: 0.05 });
  const branchPaint = countershade(mossP, bark, { level: 0.1 });
  const branch = b.sweep(
    catmull([
      [-0.3, 0.043, 0.05],
      [-0.1, 0.044, 0.0],
      [0.15, 0.043, 0.0],
      [0.34, 0.043, 0.04],
    ]),
    [0.043, 0.036],
    { bone: branchJ, color: branchPaint, sides: 9, caps: "round" },
  );
  const mossSpots = b.surface(branch).scatter(18, {
    rng: rng(5),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.1 && Math.abs(h.at.x) > 0.075,
  });
  const mossCols = ["#79bd3b", "#5fa02e", "#8fd04a"];
  mossSpots.forEach((h, i) =>
    b.stick(new THREE.IcosahedronGeometry(0.02, 1), mossCols[i % 3], h, { embed: 0.3, scale: [1.2, 0.6, 1.2], bone: branchJ, flat: true }),
  );

  // side twig with leaves
  b.sweep(
    catmull([
      [0.26, 0.05, 0.02],
      [0.31, 0.13, 0.04],
      [0.38, 0.2, 0.03],
    ]),
    [0.016, 0.004],
    { bone: branchJ, color: bark, sides: 6 },
  );
  const smallLeaf = petalShape(0.08, 0.035);
  b.extrude(rotPts(smallLeaf, 0), {
    at: [0.33, 0.15, 0.04],
    x: [1, 0.5, 0.2],
    y: [0, 0, 1],
    thickness: 0.004,
    smoothing: 1,
    color: GREEN,
    bone: branchJ,
  });
  b.extrude(rotPts(smallLeaf, 0), {
    at: [0.37, 0.2, 0.03],
    x: [0.3, 0.8, 0.6],
    y: [0, 0, 1],
    thickness: 0.004,
    smoothing: 1,
    color: "#58b048",
    bone: branchJ,
  });

  // ---------- orchid ----------
  b.sweep(
    catmull([
      [-0.2, 0.08, 0.0],
      [-0.19, 0.15, -0.015],
      [-0.205, 0.22, 0.0],
      [-0.21, 0.262, 0.02],
    ]),
    [0.006, 0.004],
    { bone: branchJ, color: STEM, sides: 6 },
  );
  const leafShape = petalShape(0.14, 0.045);
  const leafPaint = paint((_p, _n, s) => (Math.abs(s[1]) < 0.003 ? "#7fcf6a" : "#2f8a3a"));
  b.extrude(rotPts(leafShape, 0), {
    at: [-0.2, 0.082, 0.0],
    x: [-1, 0.5, 0.3],
    y: [0, 0, 1],
    thickness: 0.006,
    smoothing: 1,
    color: leafPaint,
    bone: branchJ,
  });
  b.extrude(rotPts(leafShape, 0), {
    at: [-0.2, 0.082, 0.0],
    x: [0.8, 0.45, 0.5],
    y: [0, 0, -1],
    thickness: 0.006,
    smoothing: 1,
    color: leafPaint,
    bone: branchJ,
  });

  const C: [number, number, number] = [-0.21, 0.268, 0.025];
  const T = new THREE.Vector3(0, 0.25, 1).normalize();
  const sepalPaint = paint((_p, _n, s) => {
    const d = Math.hypot(s[0], s[1]);
    return d < 0.012 ? "#e0509e" : d > 0.04 ? "#ffd2ea" : "#ffb0d8";
  });
  const petalPaint = paint((_p, _n, s) => {
    const d = Math.hypot(s[0], s[1]);
    return d < 0.014 ? "#c2185b" : d > 0.04 ? "#ff9fd0" : "#ff7fba";
  });
  const flower = (shape: any[], deg: number, d: number, color: any, th = 0.004) =>
    b.extrude(rotPts(shape, deg), {
      at: offset(C, T, d),
      x: [1, 0, 0],
      y: [0, 1, -0.25],
      thickness: th,
      bevel: 0.0015,
      smoothing: 1,
      color,
      bone: branchJ,
    });
  flower(sepalShape(0.052, 0.028), 90, 0, sepalPaint);
  flower(sepalShape(0.05, 0.026), 215, 0, sepalPaint);
  flower(sepalShape(0.05, 0.026), 325, 0, sepalPaint);
  flower(petalShape(0.056, 0.052), 12, 0.003, petalPaint);
  flower(petalShape(0.056, 0.052), 168, 0.003, petalPaint);
  flower(petalShape(0.034, 0.03), 270, 0.006, "#d81b78", 0.005);
  b.part(new THREE.SphereGeometry(0.007, 6, 5), "#ffe45c", {
    bone: branchJ,
    at: offset(C, T, 0.01),
  });

  return b.root;
}
