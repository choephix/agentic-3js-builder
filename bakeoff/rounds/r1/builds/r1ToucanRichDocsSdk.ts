import * as THREE from "three";
import { createBuilder, rng, paint, mottle, countershade, limb, catmull } from "../../../../src/index";

export const meta = {
  name: "Keel-billed Toucan on Mossy Branch",
  description:
    "A rigged keel-billed toucan with a rainbow beak, yellow bib, lime eye rings, blue zygodactyl feet and scarlet undertail, perched on a mossy branch beside a pink orchid.",
};

const BLACK = "#101319";
const WING = "#1b2030";
const YELLOW = "#ffe347";
const LIME = "#9be21b";
const SKY = "#35aaff";
const ORANGE = "#ff8a1f";
const RED = "#d1121f";
const SCARLET = "#ff2630";
const FEET = "#1f7cff";
const MOSS = "#5f9e2f";
const MOSS2 = "#3f7a22";
const BARK = "#6b4a2d";
const BARK2 = "#4a3220";
const LEAF = "#2f8f3a";

const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "toucan" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.26, -0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.26, -0.1],
      [0, 0.29, -0.02],
      [0, 0.34, 0.05],
      [0, 0.41, 0.09],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.41, 0.09],
      [0, 0.46, 0.11],
      [0, 0.5, 0.13],
    ]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.5, 0.13],
    dir: [0, 0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.46, 0.15], dir: [0, 0, 1], role: "jaw" });

  // ---------- body ----------
  const bibPaint = paint((p, n) => {
    if (n.z > 0.35 && p.y > 0.355) return YELLOW;
    if (n.z > 0.35 && p.y > 0.343) return RED;
    return BLACK;
  });
  const body = b.sweep(spine, [0.058, 0.072, 0.08, 0.07], { color: bibPaint });
  b.sweep(neck, [0.052, 0.046], { color: bibPaint });

  // head
  const headPart = b.part(ball(0.055, 12, 9), paint((_p, n) => (n.y < -0.1 && n.z > -0.4 ? YELLOW : BLACK)), {
    bone: head,
    at: [0, 0.51, 0.145],
    scale: [0.95, 1, 1.1],
  });

  // ---------- beak ----------
  const beakPaint = paint((_p, _n, s) => {
    const t = s[0];
    const d = ((s[1] % 360) + 360) % 360;
    if (t > 0.9) return RED;
    if (t < 0.26) return BLACK;
    if (d < 60 || d > 300) return LIME;
    if (d > 130 && d < 230) return ORANGE;
    return t < 0.55 ? SKY : ORANGE;
  });
  const upper = b.loft(
    [
      { at: [0, 0.505, 0.16], w: 0.056, h: 0.07 },
      { at: [0, 0.505, 0.24], w: 0.05, h: 0.062 },
      { at: [0, 0.49, 0.31], w: 0.036, h: 0.042 },
      { at: [0, 0.458, 0.36], w: 0.012, h: 0.02 },
    ],
    { bone: head, color: beakPaint },
  );
  b.loft(
    [
      { at: [0, 0.456, 0.16], w: 0.05, h: 0.03 },
      { at: [0, 0.458, 0.22], w: 0.045, h: 0.03 },
      { at: [0, 0.455, 0.29], w: 0.032, h: 0.03 },
      { at: [0, 0.445, 0.335], w: 0.012, h: 0.02 },
    ],
    { bone: jaw, color: beakPaint },
  );
  const upperSurf = b.surface(upper);
  for (const s of [1, -1]) {
    const nh = upperSurf.nearest([s * 0.04, 0.515, 0.2]);
    if (nh) b.stick(ball(0.008, 6, 4), BLACK, nh, { embed: 0.3 });
  }

  // eyes
  const headSurf = b.surface(headPart);
  for (const s of [1, -1]) {
    const h = headSurf.around(headPart.at).at(s * 80, 8);
    if (!h) continue;
    b.stick(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 10), LIME, h, { embed: 0.3, bone: head });
    b.stick(ball(0.014, 8, 6), "#14110f", h.moved([0, 0.004, 0]), { embed: 0.2, bone: head });
    b.stick(ball(0.004, 5, 4), "#ffffff", h.moved([0.004, 0.012, 0.004]), { embed: 0, bone: head });
  }

  // ---------- wings & tail ----------
  const wingOutline: [number, number][] = [
    [0.07, 0.38],
    [-0.02, 0.4],
    [-0.12, 0.34],
    [-0.24, 0.2],
    [-0.27, 0.15],
    [-0.18, 0.17],
    [-0.08, 0.21],
    [0.0, 0.26],
    [0.07, 0.31],
  ];
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.072, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.006,
      smoothing: 1,
      color: WING,
      bone: spine.joints[1],
    });
  }
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.235, -0.12],
      [0, 0.2, -0.2],
      [0, 0.18, -0.3],
    ]),
    { parent: hips, count: 2, role: "tail" },
  );
  b.extrude(
    [
      [0, -0.035],
      [0.1, -0.045],
      [0.2, -0.045],
      [0.21, 0.045],
      [0.1, 0.045],
      [0, 0.035],
    ],
    {
      at: [0, 0.235, -0.12],
      x: [0, -0.3, -1],
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: BLACK,
      bone: tail.joints[0],
    },
  );
  // scarlet undertail patch
  b.part(ball(0.045, 10, 7), SCARLET, {
    bone: hips,
    at: [0, 0.208, -0.13],
    scale: [1, 0.55, 1.35],
  });

  // ---------- branch ----------
  const branchPath = catmull([
    [-0.42, 0.065, 0.01],
    [-0.15, 0.049, -0.01],
    [0.15, 0.049, 0.01],
    [0.44, 0.068, 0],
  ]);
  const barkCoat = countershade(
    mottle(MOSS, MOSS2, { size: 0.04 }),
    mottle(BARK, BARK2, { size: 0.03 }),
    { level: -0.1, soft: 0.3 },
  );
  const branch = b.sweep(branchPath, [0.042, 0.05, 0.05, 0.038], { bone: hips, color: barkCoat });
  const r = rng(3);
  const lumps = b.surface(branch).scatter(16, {
    rng: r,
    minDist: 0.05,
    filter: (h) => h.n.y > 0.3 && Math.abs(h.at.x) > 0.09,
  });
  lumps.forEach((h, i) =>
    b.stick(ball(0.022, 6, 4), i % 2 ? MOSS : MOSS2, h, { embed: 0.4, scale: [1, 0.6, 1], flat: true }),
  );

  // twig with leaves
  b.sweep(
    catmull([
      [0.3, 0.06, 0],
      [0.36, 0.12, 0.03],
      [0.4, 0.19, 0.06],
    ]),
    [0.013, 0.005],
    { bone: hips, color: BARK },
  );
  const leaf: [number, number][] = [
    [0, -0.004],
    [0.03, -0.016],
    [0.065, -0.012],
    [0.085, 0, "sharp"] as unknown as [number, number],
    [0.065, 0.012],
    [0.03, 0.016],
    [0, 0.004],
  ];
  const leafAt: [number[], number[]][] = [
    [[0.37, 0.14, 0.035], [1, 0, 0]],
    [[0.39, 0.18, 0.055], [-1, 0, 0]],
    [[0.4, 0.19, 0.06], [0, 0, 1]],
  ];
  for (const [at, x] of leafAt) {
    b.extrude(leaf, {
      at,
      x,
      y: [0, 1, 0],
      thickness: 0.004,
      smoothing: 1,
      color: LEAF,
      bone: hips,
    });
  }

  // ---------- legs & feet ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.04;
    const pts = limb([x, 0.24, 0], [x, 0.105, 0], [0.07, 0.07], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x, 0.1, 0],
    });
    b.sweep(leg, [0.014, 0.009], { color: FEET });
    b.part(ball(0.036, 8, 6), BLACK, { bone: leg.joints[0], at: [s * 0.045, 0.215, -0.01], scale: [0.9, 1.2, 1] });
    let k = 0;
    for (const dz of [1, -1]) {
      for (const dx of [-0.012, 0.012]) {
        const tp = [0, 25, 55, 85].map((a) => {
          const ar = (a * Math.PI) / 180;
          return [x + dx, 0.05 + 0.056 * Math.cos(ar), dz * 0.056 * Math.sin(ar)];
        });
        const toe = b.chain(`toe${side}${k++}`, catmull(tp), {
          parent: leg.tip ?? leg.joints[leg.joints.length - 1],
          count: 2,
          role: "digit",
        });
        b.sweep(toe, [0.009, 0.006], { color: FEET, sides: 6 });
        const end = toe.at(1);
        b.spike(end, end, 0.016, 0.006, { color: BLACK, sides: 5 });
      }
    }
  }

  // ---------- orchid ----------
  const orchidBase = [-0.27, 0.09, 0.0];
  b.sweep(
    catmull([
      orchidBase,
      [-0.255, 0.17, 0.0],
      [-0.27, 0.24, 0.03],
      [-0.29, 0.28, 0.052],
    ]),
    [0.006, 0.004],
    { bone: hips, color: LEAF, sides: 6 },
  );
  b.sweep(
    catmull([
      [-0.27, 0.24, 0.03],
      [-0.245, 0.25, 0.025],
      [-0.23, 0.245, 0.02],
    ]),
    [0.004, 0.003],
    { bone: hips, color: LEAF, sides: 5 },
  );
  b.part(ball(0.011, 6, 5), "#ff9ac8", { bone: hips, at: [-0.226, 0.243, 0.02], scale: [1, 1.3, 1] });
  b.part(ball(0.008, 6, 5), "#ffb3d6", { bone: hips, at: [-0.215, 0.232, 0.015], scale: [1, 1.2, 1] });

  const orchidLeaf: [number, number][] = [
    [0, -0.004],
    [0.03, -0.02],
    [0.07, -0.017],
    [0.11, 0, "sharp"] as unknown as [number, number],
    [0.07, 0.017],
    [0.03, 0.02],
    [0, 0.004],
  ];
  b.extrude(orchidLeaf, {
    at: [-0.27, 0.09, 0.005],
    x: [-0.8, 0.5, 0],
    y: [0.5, 0.8, 0],
    thickness: 0.005,
    smoothing: 1,
    color: "#2a8a45",
    bone: hips,
  });
  b.extrude(orchidLeaf, {
    at: [-0.27, 0.09, 0.005],
    x: [0.8, 0.5, 0],
    y: [-0.5, 0.8, 0],
    thickness: 0.005,
    smoothing: 1,
    color: "#2a8a45",
    bone: hips,
  });

  const c = [-0.29, 0.285, 0.055];
  const petal = (outline: [number, number][], angle: number, color: string, dz: number) => {
    const a = (angle * Math.PI) / 180;
    b.extrude(outline, {
      at: [c[0], c[1], c[2] + dz],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 1,
      color,
      bone: hips,
    });
  };
  const sepal: [number, number][] = [
    [0, -0.004],
    [0.018, -0.016],
    [0.045, 0],
    [0.018, 0.016],
    [0, 0.004],
  ];
  const wide: [number, number][] = [
    [0, -0.004],
    [0.018, -0.03],
    [0.045, -0.028],
    [0.056, 0],
    [0.045, 0.028],
    [0.018, 0.03],
    [0, 0.004],
  ];
  const lip: [number, number][] = [
    [0, -0.005],
    [0.014, -0.014],
    [0.03, -0.008],
    [0.032, 0.008],
    [0.014, 0.014],
    [0, 0.005],
  ];
  for (const a of [90, 210, 330]) petal(sepal, a, "#ffc2dc", 0);
  for (const a of [8, 172]) petal(wide, a, "#ff8fc0", 0.004);
  petal(lip, 270, "#d6208a", 0.008);
  b.part(ball(0.006, 6, 4), YELLOW, { bone: hips, at: [c[0], c[1], c[2] + 0.011] });

  return b.root;
}
