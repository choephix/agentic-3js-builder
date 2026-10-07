```ts
import * as THREE from "three";
import { catmull, createBuilder, line, paint, spots } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Lined seahorse",
  description:
    "A sunny yellow lined seahorse with a crown of spikes, a long tube snout, a fluttering dorsal fin and big curious eyes, curled round a seagrass strand.",
};

type P = [number, number, number];

// Palette
const YELLOW = "#f4c430";
const LINE = "#4b3414";
const FRECKLE = "#fffaf0";
const RIDGE = "#d48f1a";
const CROWN = "#ef7c2e";
const JAW = "#e3a52c";
const FIN = "#fff2cc";
const RAY = "#f2a33a";
const EYE = "#fffdf6";
const PUPIL = "#1d140a";
const GLINT = "#ffffff";
const GRASS = "#3e8a3b";
const LEAF = "#6cb050";

// Body paint: thin dark lines running along the length, white freckles between them.
const freckles = spots(YELLOW, FRECKLE, { size: 0.016, amount: 0.12, seed: 4 });
const coat = paint((_p, _n, s) => {
  for (const deg of [60, 120, 240, 300]) {
    const d = Math.abs(((((s[1] - deg) % 360) + 540) % 360) - 180);
    if (d < 1.8) return LINE;
  }
  return freckles;
});

// Fin paint: pale membrane with warm rays fanning out from its root.
const finPaint = paint((_p, _n, s) =>
  Math.abs(Math.sin(Math.atan2(s[1], s[0]) * 11)) > 0.98 ? RAY : FIN,
);

// Piecewise-linear profile over t in [0, 1].
function ramp(t: number, keys: number[]): number {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
}
const pair = (a: number, b: number): [number, number] => [a, b];
const trunkR = (t: number): [number, number] =>
  pair(ramp(t, [0.0135, 0.0215, 0.0195, 0.0125]), ramp(t, [0.0155, 0.0225, 0.021, 0.0135]));
const neckR = (t: number): [number, number] =>
  pair(ramp(t, [0.0118, 0.0105]), ramp(t, [0.0125, 0.0115]));

// Dorsal fin outline: x runs back from its root, y up. Scalloped, sharp tips.
const fin: OutlinePoint[] = [
  [0, 0],
  [0.0034, 0.03],
  [0.0077, 0.042, "sharp"],
  [0.0162, 0.045, "sharp"],
  [0.023, 0.038],
  [0.0298, 0.04, "sharp"],
  [0.0349, 0.031],
  [0.0408, 0.03, "sharp"],
  [0.0442, 0.02],
  [0.0476, 0.018, "sharp"],
  [0.0306, 0.007],
  [0.0102, 0.003],
];

// Seagrass leaf blade, u along its length, v across it.
function leaf(len: number, wid: number): OutlinePoint[] {
  return [
    [0, -wid],
    [len * 0.3, -wid * 1.2],
    [len * 0.7, -wid * 0.9],
    [len, 0, "sharp"],
    [len * 0.7, wid * 0.9],
    [len * 0.3, wid * 1.2],
    [0, wid],
  ];
}

// Seagrass strand, rooted on the floor, with the tail coiled round it.
const STEM_Z = -0.048;
const stemPath: P[] = [
  [0, 0, STEM_Z],
  [0, 0.12, STEM_Z],
  [0.003, 0.24, STEM_Z - 0.004],
  [0.001, 0.34, STEM_Z - 0.006],
];

// Tail: drops from the hips and coils 1.125 turns round the stem, snug to its radius.
const tailPts: P[] = [
  [0, 0.096, 0],
  [0, 0.092, -0.026],
];
for (let k = 0; k <= 10; k++) {
  const phi = (k / 10) * 2.25 * Math.PI;
  const R = 0.0142 - 0.0014 * (k / 10);
  tailPts.push([R * Math.sin(phi), 0.086 - 0.011 * (phi / (2 * Math.PI)), STEM_Z + R * Math.cos(phi)]);
}

export default function build() {
  const b = createBuilder({ name: "lined seahorse" });

  // ---- Skeleton ----------------------------------------------------------
  // The trunk starts at the hips (the root), the neck and head follow, the jaw
  // hinges under the snout, and the tail hangs from the hips.
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.108, 0.01],
      [0, 0.13, 0.034],
      [0, 0.157, 0.03],
      [0, 0.178, 0.013],
    ]),
    { names: ["hips", "belly", "chest"], role: "spine" },
  );
  const hips = trunk.joints[0];
  const chest = trunk.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.178, 0.013],
      [0, 0.2, 0.006],
      [0, 0.226, 0.002],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.226, 0.002],
    aim: [0, 0.193, 0.0964],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.2331, 0.0186],
    aim: [0, 0.2041, 0.0986],
    role: "jaw",
  });
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 8, role: "tail" });

  // ---- Trunk and neck: box-section tubes, ridged with rings ----------------
  b.sweep(trunk, (t) => trunkR(t), { section: "box", color: coat });
  b.along(
    trunk,
    5,
    (at) => {
      const [rx, ry] = trunkR(at.t);
      b.part(new THREE.TorusGeometry(Math.max(rx, ry) + 0.0016, 0.0022, 4, 12), RIDGE, {
        at,
        dir: at,
        axis: "z",
      });
    },
    { from: 0.14, to: 0.9 },
  );

  b.sweep(neck, (t) => neckR(t), { section: "box", color: coat });
  b.along(
    neck,
    2,
    (at) => {
      const [rx, ry] = neckR(at.t);
      b.part(new THREE.TorusGeometry(Math.max(rx, ry) + 0.0016, 0.002, 4, 10), RIDGE, {
        at,
        dir: at,
        axis: "z",
      });
    },
    { from: 0.25, to: 0.85 },
  );

  // ---- Head: freckled cranium, snout on the head, lower jaw on its own joint
  b.part(new THREE.SphereGeometry(0.022, 10, 8).scale(0.95, 1, 1.12), coat, {
    bone: head,
    at: [0, 0.242, 0.006],
    flat: true,
  });
  b.capsule([0, 0.237, 0.02], [0, 0.208, 0.1], [0.0072, 0.0055], { bone: head, color: coat });
  b.rod([0, 0.2331, 0.0186], [0, 0.20405, 0.09857], [0.0036, 0.0031], { bone: jaw, color: JAW });

  // Crown: a ring of six spikes round the top of the head.
  b.ring(line([0, 0.259, 0.006], [0, 0.289, 0.006]), { count: 6, radius: 0.0145, tilt: 35 }, (it) => {
    b.spike(it, it, 0.02, 0.0042, { color: CROWN, bone: head });
  });

  // Big curious eyes: cream sclera, dark pupil, catch-light.
  for (const s of [1, -1]) {
    const eye = new THREE.Vector3(s * 0.019, 0.246, 0.018);
    const out = new THREE.Vector3(