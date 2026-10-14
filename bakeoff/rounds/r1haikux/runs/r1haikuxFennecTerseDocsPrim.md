```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  grain,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description:
    "A standing fennec fox in rest pose: oversized ears, sand coat, cream face and belly, black nose and tail tip, cheek and tail tufts.",
};

const SAND = "#e9bd88";
const SAND_DEEP = "#cf9459";
const CREAM = "#fcf1e0";
const EAR_OUT = "#d69b63";
const EAR_TIP = "#4a2c1b";
const SOCK = "#6b4229";
const NOSE = "#1d1310";
const TAIL_TIP = "#2a1b14";
const WHISKER = "#3a2a21";

// Tall, pointed fennec ear, drawn in metres: x across the ear, y up from its base.
const EAR: OutlinePoint[] = [
  [-0.036, 0],
  [0.036, 0],
  [0.03, 0.07],
  [0.014, 0.125],
  [0, 0.138, "sharp"],
  [-0.014, 0.125],
  [-0.03, 0.07],
];

// Almond eye: dark rim, amber iris, black pupil, catch-light.
const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
<path d="M2 20 Q32 -6 62 20 Q32 46 2 20 Z" fill="#1b110c"/>
<path d="M8 20 Q32 3 56 20 Q32 37 8 20 Z" fill="#c4863a"/>
<circle cx="32" cy="20" r="9" fill="#5e3a1a"/>
<circle cx="32" cy="20" r="4.6" fill="#120a06"/>
<circle cx="28.5" cy="16.5" r="2.4" fill="#ffffff"/>
</svg>`;

// Fur tuft: two overlapping strands, wide at the root, pointed at the tip.
const tuftSvg = (dark: string, light: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<path d="M3 64 Q5 24 16 0 Q14 34 29 64 Z" fill="${light}"/>
<path d="M11 64 Q12 36 18 16 Q20 42 22 64 Z" fill="${dark}"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "fennec-fox" });

  // ---------- paint ----------
  const coat = countershade(grain(SAND, SAND_DEEP, { size: 0.02, axis: "z", seed: 3 }), CREAM, { level: -0.2 });
  const torsoPaint = paint((p, n) => (p.z > 0.075 && n.z > 0.3 && n.y < 0.6 ? CREAM : coat));
  const legPaint = gradient(coat, SOCK, [0, 0.1, 0], [0, 0.03, 0]);
  const headPaint = paint((_p, n, s) => (s[0] > 0.78 || n.y < -0.35 ? CREAM : coat));
  const tailPaint = paint((_p, _n, s) => (s[0] > 0.84 ? TAIL_TIP : coat));
  const earPaint = (sd: number) =>
    paint((_p, n, q) => (q[1] > 0.1 ? EAR_TIP : n.z * sd > 0.35 ? CREAM : EAR_OUT));

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.255, -0.12], aim: [0, 0.258, -0.02], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.255, -0.12],
      [0, 0.258, -0.03],
      [0, 0.263, 0.05],
      [0, 0.272, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.272, 0.12],
      [0, 0.315, 0.17],
      [0, 0.345, 0.215],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.345, 0.215],
    aim: [0, 0.352, 0.33],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: -0.02, up: -0.045 }),
    aim: head.local({ forward: 0.12, up: -0.065 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.255, -0.12],
      [0, 0.25, -0.22],
      [0, 0.238, -0.31],
      [0, 0.21, -0.37],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.05;

    const front = b.chain(
      `legF${L}`,
      catmull([
        [x, 0.25, 0.08],
        [x, 0.13, 0.07],
        [x, 0.045, 0.095],
        [x, 0.016, 0.135],
      ]),
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `pawF${L}`], role: "leg" },
    );
    b.sweep(front, [0.03, 0.017], { color: legPaint });

    const hind = b.chain(
      `legH${L}`,
      catmull([
        [x, 0.255, -0.11],
        [x * 1.1, 0.14, -0.07],
        [x, 0.055, -0.15],
        [x, 0.016, -0.12],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `hock${L}`, `pawH${L}`], role: "leg" },
    );
    b.sweep(hind, [0.036, 0.017], { color: legPaint });
  }

  // ---------- body ----------
  b.sweep(
    spine,
    (t) => {
      const w = 0.066 + 0.006 * Math.sin(Math.PI * t);
      return [w, w * 0.9];
    },
    { color: torsoPaint, detail: 1.25 },
  );
  b.sweep(neck, [0.056, 0.044], { color: torsoPaint, detail: 1.25 });
  const tailTube = b.sweep(tail, [0.04, 0.056, 0.05, 0.024], { color: tailPaint, detail: 1.25 });

  // ---------- head ----------
  const skull = b.loft(
    [
      { at: head.local({ forward: -0.045, up: 0 }), w: 0.1, h: 0.1 },
      { at: head.local({ forward: 0, up: 0.005 }), w: 0.11, h: 0.105 },
      { at: head.local({ forward: 0.06, up: -0.005 }), w: 0.092, h: 0.08 },
      { at: head.local({ forward: 0.105, up: -0.02 }), w: 0.05, h: 0.048 },
      { at: head.local({ forward: 0.135, up: -0.03 }), w: 0.024, h: 0.024 },
    ],
    { bone: head, color: headPaint, detail: 1.25 },
  );

  b.loft(
    [
      { at: jaw.local({ forward: 0, up: 0 }), w: 0.072, h: 0.034 },
      { at: jaw.local({ forward: 0.075, up: -0.006 }), w: 0.05, h: 0.028 },
      { at: jaw.local({ forward: 0.12, up: -0.01 }), w: 0.022, h: 0.02 },
    ],
    { bone: jaw, color: CREAM },
  );

  b.part(new THREE.SphereGeometry(0.021, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.137, up: -0.03 }),
  });

  // Eyes: drawn decals placed on the skull with the outward hit normal.
  const skin = b.surface(skull);
  const eyeTex = svg(EYE_SVG, { size: 128 });
  const core = head.local({ forward: 0.02 });
  for (const s of [1, -1]) {
    const hit = skin.around(core).at(s * 36, 8);
    if (hit) b.decal(skull, eyeTex, { at: hit, size: [0.042, 0.026], mirror: s < 0 });
  }

  // ---------- ears (hinge joints, flat extruded blades) ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const base = head.local({ left: s * 0.03, up: 0.03, forward: -0.025 });
    const earJoint = b.joint(`ear${L}`, {
      parent: head,
      at: base,
      aim: head.local({ left: s * 0.066, up: 0.15, forward: -0.05 }),
      role: "hinge",
    });
    b.extrude(EAR, {
      at: base,
      x: [s, 0, 0],
      y: [s * 0.28, 0.94, -0.2],
      thickness: [0.016, 0.004],
      bevel: 0.004,
      smoothing: 1,
      color: earPaint(s),
      bone: earJoint,
    });
  }

  // ---------- whiskers ----------
  for (const s of [1, -1]) {
    for (const k of [-1, 0, 1]) {
      b.rod(
        head.local({ left: s * 0.03, up: -0.016 + k * 0.007, forward: 0.1 }),
        head.local({ left: s * 0.13, up: -0.03 + k * 0.02, forward: 0.2 }),
        [0.0022, 0.0007],
        { color: WHISKER },
      );
    }
  }

  // ---------- fur: cheek ruff and tail tufts ----------
  const cheekTex = svg(tuftSvg("#ead2ad", "#fff4e4"), { size: 128 });
  b.cards(
    skin.scatter(48, {
      rng: rng(31),
      minDist: 0.022,
      filter: (h) => Math.abs(h.n.x) > 0.6 && h.at.y < 0.35,
    }),
    cheekTex,
    { size: [0.03, 0.045], lean: 70, bend: 20, vary: 0.2, rng: rng(32) },
  );

  const tailTex = svg(tuftSvg("#c48a58", "#e6b98a"), { size: 128 });
  b.cards(
    b.surface(tailTube).scatter(110, { rng: rng(21), minDist: 0.028 }),
    tailTex,
    { size: [0.045, 0.08], lean: 55, bend: 25, vary: 0.25, rng: rng(22) },
  );

  return b.root;
}
```