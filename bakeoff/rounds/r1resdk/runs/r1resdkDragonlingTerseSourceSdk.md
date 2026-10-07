```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, scales } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby, big-eyed baby dragon with scaly green skin and a cream belly. It has stubby horns, little wings, dorsal spikes and a spade-tipped tail. It stands in a rest pose with a rigged spine, neck, jaw, four legs, wings, fingers and tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "baby dragon", paintSize: 2048 });

  const skin = countershade(
    scales(["#3da35d", "#35935a", "#48b066"], "#2a7048", { size: 0.03, width: 0.14, seed: 3 }),
    "#f2d98d",
    { level: -0.1, soft: 0.3 },
  );
  const AMBER = "#f0a53a";
  const CREAM = "#f4e6c4";
  const WING = "#e8793a";
  const GREEN = "#3a9a58";

  // ---------- skeleton core ----------
  b.joint("hips", { at: [0, 0.3, -0.08], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.3, -0.08],
      [0, 0.32, 0.05],
      [0, 0.34, 0.17],
    ]),
    { names: ["spine1", "spine2", "chest"], role: "spine", parent: "hips" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.34, 0.17],
      [0, 0.41, 0.25],
      [0, 0.47, 0.29],
    ]),
    { names: ["neck1", "neck2"], role: "neck", parent: "chest" },
  );
  b.joint("head", { parent: "neck2", at: [0, 0.47, 0.29], dir: [0, 0.1, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.472, 0.345], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.3, -0.08],
      [0, 0.27, -0.25],
      [0, 0.2, -0.42],
      [0, 0.17, -0.58],
      [0, 0.2, -0.7],
    ]),
    { names: ["tail1", "tail2", "tail3", "tail4"], role: "tail", parent: "hips" },
  );

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t) => [0.085 + 0.02 * Math.sin(Math.PI * t), 0.092 + 0.02 * Math.sin(Math.PI * t)],
    { color: skin, name: "body" },
  );
  const neckSw = b.sweep(neck, (t) => 0.056 - 0.014 * t, { color: skin, name: "neck" });
  const tailSw = b.sweep(tail, (t) => 0.062 * (1 - t) + 0.01, { color: skin, name: "tail" });

  // dorsal spikes
  b.along(body, 5, (p) => {
    const k = p.t;
    b.stick(new THREE.ConeGeometry(0.014, 0.045, 4), AMBER, p, { scale: 1.1 - 0.3 * k });
  });
  b.along(neckSw, 3, (p) => {
    b.stick(new THREE.ConeGeometry(0.012, 0.038, 4), AMBER, p, { scale: 1 - 0.2 * p.t });
  });
  b.along(tailSw, 8, (p) => {
    b.stick(new THREE.ConeGeometry(0.014, 0.045, 4), AMBER, p, { scale: 1 - 0.8 * p.t });
  });

  // tail spade
  b.slab(
    [
      [0, 0.205, -0.69],
      [0.045, 0.215, -0.74],
      [0, 0.235, -0.82],
      [-0.045, 0.215, -0.74],
    ],
    { color: AMBER, thickness: 0.008, bone: "tail4", name: "spade" },
  );

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.075, 9, 7), skin, { at: [0, 0.51, 0.335], scale: [1, 0.88, 1.08], bone: "head", name: "skull" });
  b.frustumBox([0, 0.505, 0.37], [0, 0.498, 0.465], [0.09, 0.07], [0.06, 0.045], {
    color: skin,
    bone: "head",
    name: "snout",
  });
  b.frustumBox([0, 0.468, 0.355], [0, 0.466, 0.45], [0.078, 0.026], [0.046, 0.02], {
    color: skin,
    bone: "jaw",
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), "#e86a6a", { at: [0, 0.472, 0.4], scale: [1.3, 0.35, 2], bone: "jaw", name: "tongue" });

  for (const s of [1, -1]) {
    // eyes
    b.part(new THREE.SphereGeometry(0.026, 8, 6), "#ffd23f", { at: [0.052 * s, 0.538, 0.355], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), "#1b1020", {
      at: [0.052 * s + 0.008 * s, 0.539, 0.355 + 0.0165],
      scale: [0.6, 1.3, 0.8],
      bone: "head",
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), "#ffffff", {
      at: [0.052 * s + 0.003 * s, 0.546, 0.355 + 0.025],
      bone: "head",
      name: "glint",
    });
    // nostrils
    b.part(new THREE.SphereGeometry(0.006, 5, 4), "#24402c", { at: [0.014 * s, 0.516, 0.455], bone: "head", name: "nostril" });
    // horns
    b.spike([0.04 * s, 0.565, 0.31], [0.25 * s, 0.5, -0.8], 0.1, 0.017, { color: CREAM, bone: "head", name: "horn" });
    // ear fins
    b.spike([0.07 * s, 0.515, 0.3], [1.0 * s, 0.3, -0.6], 0.075, 0.02, { color: WING, bone: "head", name: "earFin" });
    // cheek spikes
    b.spike([0.062 * s, 0.49, 0.35], [1.0 * s, -0.2, -0.3], 0.03, 0.01, { color: AMBER, bone: "head", name: "cheek" });
    // upper teeth
    for (const z of [0.4, 0.43, 0.455]) {
      b.part(new THREE.ConeGeometry(0.0055, 0.016, 4), "#fff4d6", {
        at: [0.026 * s * (1 - (z - 0.4) * 3), 0.468, z],
        rotation: [180, 0, 0],
        bone: "head",
        name: "tooth",
      });
    }
    // lower teeth
    b.part(new THREE.ConeGeometry(0.005, 0.014, 4), "#fff4d6", { at: [0.02 * s, 0.482, 0.425], bone: "jaw", name: "toothLow" });
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const suf = s > 0 ? "L" : "R";
    const raw = front
      ? [
          [0.09, 0.27, 0.12],
          [0.115, 0.17, 0.1],
          [0.115, 0.07, 0.15],
          [0.115, 0.015, 0.19],
        ]
      : [
          [0.09, 0.27, -0.1],
          [0.12, 0.19, -0.04],
          [0.11, 0.08, -0.13],
          [0.115, 0.015, -0.07],
        ];
    const pts = raw.map(([x, y, z]) => [x * s, y, z]);
    const names = front
      ? [`shoulder${suf}`, `elbow${suf}`, `wrist${suf}`, `paw${suf}`]
      : [`hip${suf}`, `knee${suf}`, `ankle${suf}`, `toe${suf}`];
    const chain = b.chain(front ? `legF${suf}` : `legH${suf}`, catmull(pts), {
      names,
      role: "leg",
      parent: front ? "spine2" : "hips",
    });
    const [r0, r1] = front ? [0.04, 0.022] : [0.05, 0.022];
    b.sweep(chain, (t) => r0 - (r0 - r1) * t, { color: skin, name: front ? "foreleg" : "hindleg" });
    const bulge = front ? [0.095 * s, 0.27, 0.12] : [0.1 * s, 0.26, -0.1];
    b.part(new THREE.SphereGeometry(front ? 0.052 : 0.065, 8, 6), skin, {
      at: bulge,
      scale: front ? [0.8, 1, 1] : [0.8, 1, 1.1],
      bone: names[0],
      name: "joint",
    });
    const cz = front ? 0.2 : -0.045;
    b.part(new THREE.SphereGeometry(0.04, 8, 6), skin, {
      at: [0.115 * s, 0.022, cz],
      scale: [1, 0.55, 1.4],
      bone: names[3],
      name: "paw",
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([0.115 * s + dx, 0.02, cz + 0.05], [dx * 4, -0.1, 1], 0.03, 0.008, {
        color: CREAM,
        bone: names[3],
        name: "claw",
      });
    }
  };
  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---------- wings ----------
  const wing = (s: number) => {
    const suf = s > 0 ? "L" : "R";
    const arm = [
      [0.05, 0.38, 0.03],
      [0.16, 0.5, 0.0],
      [0.28, 0.56, -0.04],
    ].map(([x, y, z]) => [x * s, y, z]);
    const names = [`wingArm${suf}`, `wingFore${suf}`, `wingHand${suf}`];
    const wc = b.chain(`wing${suf}`, catmull(arm), { names: names.slice(0, 2), role: "wing", parent: "spine2" });
    b.sweep(wc, (t) => 0.016 - 0.007 * t, { color: GREEN, name: "wingArm" });
    const wrist = arm[2];
    const tips = [
      [0.38, 0.52, -0.13],
      [0.34, 0.46, -0.2],
      [0.24, 0.4, -0.2],
    ].map(([x, y, z]) => [x * s, y, z]);
    b.joint(names[2], { parent: names[1], at: wrist, dir: [s, 0.1, -0.3] });
    tips.forEach((tip, k) => {
      const fc = b.chain(`finger${k}${suf}`, [wrist, tip], { parent: names[2], role: "digit" });
      b.sweep(fc, [0.008, 0.003], { color: GREEN, name: "finger" });
    });
    b.slab(
      [
        [0.05 * s, 0.37, -0.06],
        wrist,
        tips[0],
        tips[1],
        tips[2],
        [0.06 * s, 0.33, -0.1],
      ],
      { color: WING, thickness: 0.004, bone: names[1], name: "wingMembrane" },
    );
    // little claw on wrist
    b.spike(wrist, [s * 0.3, 0.5, 0.8], 0.03, 0.008, { color: CREAM, bone: names[2], name: "wingClaw" });
  };
  wing(1);
  wing(-1);

  return b.root;
}
```