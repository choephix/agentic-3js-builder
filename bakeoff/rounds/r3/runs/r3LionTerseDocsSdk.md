```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description: "A male African lion standing in a rest pose, with a full mane, a tufted tail and a rigged jaw.",
};

const TAN = "#c9985a";
const TAN2 = "#b9884c";
const CREAM = "#ead6aa";
const MANE_A = "#5a3418";
const MANE_B = "#7d4a20";
const DARK = "#2b1a14";
const AMBER = "#e0a21c";
const PINK = "#b86a60";

const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "lion" });
  const coat = countershade(mottle(TAN, TAN2, { size: 0.25, seed: 3 }), CREAM, { level: -0.35 });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.9, -0.55] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.9, -0.55],
      [0, 0.92, -0.1],
      [0, 0.95, 0.35],
      [0, 1.0, 0.7],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.7],
      [0, 1.07, 0.9],
      [0, 1.08, 1.06],
    ]),
    { parent: spine.joints[spine.joints.length - 1], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: neck.at(1), dir: [0, -0.05, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.15, down: 0.07 }),
    aim: head.local({ forward: 0.4, down: 0.08 }),
    role: "jaw",
  });

  // ---- body ----
  b.sweep(spine, (t) => [0.2 + 0.04 * t, 0.23 + 0.07 * t], { color: coat, shift: [0, -0.04] });
  b.sweep(neck, [0.2, 0.19], { color: coat });

  // ---- tail ----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.65],
      [0, 0.92, -1.0],
      [0, 0.8, -1.35],
      [0, 0.52, -1.5],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.055, 0.035], { color: coat });
  const tailEnd = tail.at(1).at;
  b.part(sph(0.075, 8, 6), DARK, {
    bone: tail.joints[tail.joints.length - 1],
    at: [tailEnd.x, tailEnd.y - 0.07, tailEnd.z - 0.02],
    scale: [0.8, 1.9, 0.9],
  });

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.17, 0.8, 0.62], [s * 0.17, 0.1, 0.66], [0.38, 0.36], [[0, 0, -1]]);
    const fl = b.chain(`legF${S}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
    });
    b.sweep(fl, [0.12, 0.085, 0.07], { color: coat });
    const fTip = fl.joints[fl.joints.length - 1];
    b.part(sph(0.17, 8, 6), coat, { bone: fl.joints[0], at: [s * 0.2, 0.8, 0.6], scale: [0.75, 1.2, 1.1] });
    b.part(sph(0.09, 8, 6), CREAM, { bone: fTip, at: [s * 0.17, 0.065, 0.72], scale: [1, 0.7, 1.4] });
    for (const k of [-1, 0, 1])
      b.part(sph(0.028, 5, 4), TAN2, { bone: fTip, at: [s * 0.17 + k * 0.04, 0.045, 0.81], scale: [1, 0.8, 1.2] });

    // rear
    const rp = limb(
      [s * 0.17, 0.85, -0.5],
      [s * 0.17, 0.1, -0.52],
      [0.38, 0.34, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const rl = b.chain(`legH${S}`, rp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(rl, [0.14, 0.1, 0.065, 0.055], { color: coat });
    const rTip = rl.joints[rl.joints.length - 1];
    b.part(sph(0.2, 8, 6), coat, { bone: rl.joints[0], at: [s * 0.2, 0.78, -0.5], scale: [0.8, 1.2, 1.2] });
    b.part(sph(0.09, 8, 6), CREAM, { bone: rTip, at: [s * 0.17, 0.065, -0.46], scale: [1, 0.7, 1.4] });
    for (const k of [-1, 0, 1])
      b.part(sph(0.028, 5, 4), TAN2, { bone: rTip, at: [s * 0.17 + k * 0.04, 0.045, -0.37], scale: [1, 0.8, 1.2] });
  }

  // ---- head ----
  b.part(sph(0.17, 10, 8), TAN, { bone: head, at: head.local({ forward: 0.12 }), scale: [1.05, 0.95, 1.05] });
  b.frustumBox(head.local({ forward: 0.2, down: 0.0 }), head.local({ forward: 0.4, down: 0.03 }), [0.17, 0.13], [0.14, 0.1], {
    bone: head,
    color: CREAM,
  });
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.035), DARK, { bone: head, at: head.local({ forward: 0.41, up: 0.04 }) });
  b.frustumBox(jaw.at, head.local({ forward: 0.39, down: 0.085 }), [0.12, 0.04], [0.1, 0.035], { bone: jaw, color: CREAM });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.18), PINK, { bone: jaw, at: head.local({ forward: 0.3, down: 0.06 }) });
  for (const s of [1, -1]) {
    const eye = b.part(sph(0.024, 6, 5), AMBER, { bone: head, at: head.local({ forward: 0.23, up: 0.07, left: s * 0.075 }) });
    b.part(sph(0.012, 5, 4), DARK, { bone: head, at: head.local({ forward: 0.25, up: 0.07, left: s * 0.078 }) });
    void eye;
    b.part(new THREE.BoxGeometry(0.07, 0.02, 0.05), TAN2, {
      bone: head,
      at: head.local({ forward: 0.24, up: 0.105, left: s * 0.075 }),
    });
    b.part(sph(0.045, 6, 5), CREAM, { bone: head, at: head.local({ forward: 0.34, down: 0.0, left: s * 0.045 }) });
    // ears
    b.part(sph(0.06, 7, 5), TAN, { bone: head, at: head.local({ forward: 0.02, up: 0.16, left: s * 0.13 }), scale: [1, 1, 0.55] });
    b.part(sph(0.035, 6, 5), DARK, { bone: head, at: head.local({ forward: 0.03, up: 0.16, left: s * 0.13 }), scale: [1, 1, 0.5] });
  }

  // ---- mane ----
  const manes = [
    b.part(sph(0.32, 12, 8), MANE_A, { bone: neck.joints[neck.joints.length - 1], at: [0, 1.05, 0.9], scale: [1.0, 1.05, 0.78] }),
    b.part(sph(0.26, 10, 8), MANE_A, { bone: neck.joints[0], at: [0, 0.85, 0.82], scale: [0.95, 0.9, 1.0] }),
  ];
  const r = rng(11);
  let i = 0;
  for (const m of manes) {
    const hits = b.surface(m).scatter(m === manes[0] ? 70 : 34, {
      rng: r,
      minDist: 0.07,
      filter: (h) => h.n.z < 0.45 && !(h.n.z > 0.2 && h.n.y > -0.2),
    });
    for (const h of hits) {
      b.stick(new THREE.ConeGeometry(0.065, 0.22, 5), i++ % 2 ? MANE_B : MANE_A, h, { embed: 0.25 });
    }
  }

  // belly tuft along the elbows
  for (const s of [1, -1])
    b.part(sph(0.05, 6, 5), MANE_B, { bone: spine.joints[2], at: [s * 0.2, 0.62, 0.45], scale: [0.8, 1, 1.6] });

  return b.root;
}
```