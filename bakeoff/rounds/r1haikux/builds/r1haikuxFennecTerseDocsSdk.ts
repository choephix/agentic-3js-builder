import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  gradient,
  grain,
  limb,
  mix,
  paint,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

type Vec3 = [number, number, number];

export const meta = {
  name: "Fennec fox",
  description:
    "A fennec fox in rest pose: oversized ears, sandy fawn coat, cream face and belly, dark-tipped bushy tail.",
};

// Palette
const FUR = "#e3ab73";
const FUR_DEEP = "#c48650";
const CREAM = "#f8ebd8";
const EAR_IN = "#f7ddbb";
const DARK = "#2b1d16";
const NOSE = "#17110e";
const INK = "#1d1411";

// Skeleton points, metres, +Y up, faces +Z
const HIPS: Vec3 = [0, 0.178, -0.086];
const SPINE: Vec3[] = [HIPS, [0, 0.184, -0.02], [0, 0.189, 0.034], [0, 0.196, 0.086]];
const NECK: Vec3[] = [
  [0, 0.196, 0.086],
  [0, 0.22, 0.125],
  [0, 0.238, 0.16],
];
const HEAD: Vec3 = [0, 0.238, 0.16];
const TAIL: Vec3[] = [HIPS, [0, 0.19, -0.16], [0, 0.195, -0.235], [0, 0.16, -0.3]];

// Ear drawing in its own plane: u runs forward-up, v runs up-and-back
const EAR: OutlinePoint[] = [
  [-0.045, -0.021, "sharp"],
  [-0.042, 0.04],
  [-0.027, 0.094],
  [0.002, 0.12],
  [0.029, 0.096],
  [0.046, 0.036],
  [0.05, -0.021, "sharp"],
];

const tailRadius = (t: number) => 0.034 * (1 - 0.55 * t) + 0.02 * Math.sin(Math.PI * t);

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 36">
<path d="M2 18C14 3 50 3 62 18C50 33 14 33 2 18Z" fill="#17100c"/>
<ellipse cx="34" cy="18" rx="12" ry="9" fill="#6b4527"/>
<ellipse cx="34" cy="18.5" rx="6" ry="7.5" fill="#0c0806"/>
<ellipse cx="39.5" cy="13.5" rx="3.6" ry="3.2" fill="#fffaf2"/>
<circle cx="29.5" cy="22.5" r="1.4" fill="#fffaf2"/>
</svg>`;

const TUFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
<path d="M16 1C22 16 28 34 27 63L16 55L5 63C4 34 10 16 16 1Z" fill="#ffffff"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "fennec" });

  // ---- paints and textures
  const coat = countershade(grain(FUR, FUR_DEEP, { size: 0.014, axis: "z" }), CREAM, { soft: true });
  const legCoat = gradient(FUR, CREAM, [0, 0.17, 0], [0, 0.03, 0]);
  const tailCoat = gradient(coat, DARK, [0, 0.195, -0.235], [0, 0.16, -0.3]);
  const headCoat = paint((p, n) =>
    mix(FUR, CREAM, smoothstep(0.25, 0.55, -n.y + Math.max(0, p.z - 0.22) * 6)),
  );
  const earPaint = (s: number) =>
    paint((_p, n) => (n.x * s > 0.3 ? FUR : n.x * s < -0.3 ? EAR_IN : FUR_DEEP));
  const eyeTex = svg(EYE_SVG, { size: 256 });
  const tuft = svg(TUFT_SVG, { size: 128 });

  // ---- skeleton
  const hips = b.joint("hips", { at: HIPS, aim: [0, 0.178, 0], role: "spine" });
  const spine = b.chain("spine", catmull(SPINE), { parent: hips, role: "spine" });
  const neck = b.chain("neck", catmull(NECK), { parent: spine.joints[2], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: HEAD, aim: [0, 0.228, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.205, 0.2], aim: [0, 0.2, 0.27], role: "jaw" });
  const tail = b.chain("tail", catmull(TAIL), { parent: hips, role: "tail" });

  // ---- torso and neck
  const body = b.loft(
    [
      { at: HIPS, w: 0.08, h: 0.086 },
      { at: [0, 0.184, -0.02], w: 0.1, h: 0.1 },
      { at: [0, 0.189, 0.034], w: 0.106, h: 0.1 },
      { at: [0, 0.196, 0.086], w: 0.092, h: 0.092 },
    ],
    { bone: spine, color: coat },
  );
  b.sweep(neck, [0.04, 0.032], { color: coat });

  // ---- head: skull loft, separate lower jaw
  const skull = b.loft(
    [
      { at: [0, 0.243, 0.14], w: 0.085, h: 0.08 },
      { at: [0, 0.25, 0.18], w: 0.09, h: 0.085 },
      { at: [0, 0.246, 0.218], w: 0.082, h: 0.076 },
      { at: [0, 0.238, 0.25], w: 0.054, h: 0.05 },
      { at: [0, 0.23, 0.28], w: 0.024, h: 0.024 },
    ],
    { bone: head, color: headCoat },
  );
  b.loft(
    [
      { at: [0, 0.2, 0.2], w: 0.05, h: 0.026 },
      { at: [0, 0.2, 0.245], w: 0.036, h: 0.02 },
      { at: [0, 0.205, 0.275], w: 0.016, h: 0.014 },
    ],
    { bone: jaw, color: CREAM },
  );

  // ---- ears: flat drawn slabs, each on its own hinge joint
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base: Vec3 = [s * 0.034, 0.275, 0.195];
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: base,
      aim: [s * 0.034, 0.388, 0.154],
      role: "hinge",
    });
    b.extrude(EAR, {
      at: base,
      x: [0, 0.342, 0.94],
      y: [0, 0.94, -0.342],
      thickness: [0.01, 0.003],
      smoothing: 2,
      color: earPaint(s),
      bone: ear,
      name: `ear${side}`,
    });
  }

  // ---- face details
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: [s * 0.027, 0.254, 0.228],
      dir: [s * 0.3, 0.1, 0.95],
      size: [0.034, 0.02],
      mirror: s < 0,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
  }
  const noseHit = b.surface(skull).nearest([0, 0.23, 0.29]);
  b.stick(new THREE.SphereGeometry(0.015, 10, 8), NOSE, noseHit, { embed: 0.35, name: "nose" });
  for (const s of [1, -1]) {
    b.rod([s * 0.016, 0.228, 0.258], [s * 0.078, 0.221, 0.322], 0.0007, { color: INK, bone: head });
    b.rod([s * 0.018, 0.221, 0.256], [s * 0.072, 0.208, 0.31], 0.0007, { color: INK, bone: head });
  }

  // ---- tail: bushy, dark tip, fur tufts
  const tailBody = b.sweep(tail, tailRadius, { color: tailCoat });
  const tailTufts = b.surface(tailBody).scatter(120, {
    rng: rng(5),
    minDist: 0.016,
    filter: (h) => h.n.y > -0.6,
  });
  b.cards(tailTufts, tuft, {
    size: [0.026, 0.044],
    lean: 55,
    bend: 20,
    vary: 0.25,
    rng: rng(6),
    color: tailCoat,
  });

  // ---- paws and toes (digits are joints under each foot)
  const paw = (tip: ReturnType<typeof b.joint>, x: number, z: number, tag: string) => {
    b.capsule([x, 0.014, z], [x, 0.014, z + 0.03], 0.014, { bone: tip, color: CREAM });
    [-0.0075, 0, 0.0075].forEach((o, i) => {
      const toe = b.joint(`toe${tag}${i + 1}`, {
        parent: tip,
        at: [x + o, 0.014, z + 0.024],
        aim: [x + o, 0.008, z + 0.046],
        role: "digit",
      });
      b.capsule(toe, [x + o, 0.008, z + 0.044], 0.0055, { bone: toe, color: CREAM });
    });
  };

  // ---- front legs: shoulder, elbow (bends back), wrist
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.042, 0.17, 0.05], [s * 0.042, 0.014, 0.07], [0.085, 0.085], [[0, 0, -1]]);
    const leg = b.chain(`legF${side}`, pts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.024, 0.014], { color: legCoat });
    paw(leg.tip!, s * 0.042, 0.07, `F${side}`);
  }

  // ---- hind legs: digitigrade, knee forward, hock back
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.042, 0.17, -0.07],
      [s * 0.042, 0.014, -0.08],
      [0.09, 0.085, 0.05],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`legH${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.027 - 0.011 * t, { color: legCoat });
    paw(leg.tip!, s * 0.042, -0.08, `H${side}`);
  }

  // ---- cream ruff on the chest and tufts on the cheeks
  const chestTufts = b.surface(body).scatter(40, {
    rng: rng(8),
    minDist: 0.02,
    filter: (h) => h.n.z > 0.35,
  });
  b.cards(chestTufts, tuft, { size: [0.022, 0.034], lean: 40, vary: 0.2, rng: rng(9), color: CREAM });

  const cheekTufts = b.surface(skull).scatter(30, {
    rng: rng(10),
    minDist: 0.016,
    filter: (h) => h.n.y < 0.1 && h.n.z > 0.1 && Math.abs(h.n.x) > 0.25,
  });
  b.cards(cheekTufts, tuft, { size: [0.018, 0.028], lean: 60, vary: 0.2, rng: rng(11), color: CREAM });

  return b.root;
}
