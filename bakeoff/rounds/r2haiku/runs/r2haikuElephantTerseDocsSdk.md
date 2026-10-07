```ts
import * as THREE from "three";
import {
  createBuilder,
  limb,
  mottle,
  bezier,
  catmull,
  type OutlinePoint,
} from "agentic-3js-builder";

export const meta = {
  name: "elephant",
  description: "A stylized African elephant with a curled trunk, fan ears, ivory tusks and a tufted tail.",
};

const SKIN = mottle("#8a9099", "#666c75", { size: 0.7, contrast: 0.5, seed: 11 });
const EAR = mottle("#c49a98", "#a88083", { size: 0.45, contrast: 0.5, seed: 5 });
const IVORY = "#f2ead6";
const DARK = "#1b1d21";
const NAIL = "#3a3f46";
const TUFT = "#4a3b33";

const EAR_OUTLINE: OutlinePoint[] = [
  [-0.22, 0.3],
  [-0.32, -0.1],
  [-0.2, -0.42],
  [0.02, -0.5],
  [0.22, -0.38],
  [0.3, 0.0],
  [0.26, 0.3],
  [0.02, 0.42],
];

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // ---- Skeleton ----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.45, -0.3] });

  // Barrel body running rump to chest.
  const bodyPath = catmull([
    [0, 2.4, -0.9],
    [0, 2.5, -0.3],
    [0, 2.45, 0.35],
    [0, 2.35, 0.85],
  ]);
  const spine = b.chain("spine", bodyPath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });

  // Thick neck from chest up to the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.35, 0.85],
      [0, 2.7, 1.05],
      [0, 3.0, 1.3],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 3.02, 1.3], dir: [0, 0, 1], role: "head" });

  // Trunk hangs from the front of the head and curls up at the tip.
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.92, 1.6],
      [0, 2.66, 1.84],
      [0, 2.25, 1.94],
      [0, 1.85, 1.82],
      [0, 1.52, 1.6],
      [0, 1.4, 1.36],
    ]),
    { parent: head, role: "tentacle" },
  );

  // Thin tail from the rump.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.4, -1.0],
      [0, 2.18, -1.22],
      [0, 1.78, -1.36],
      [0, 1.32, -1.4],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- Body, neck, head, trunk, tail -------------------------------------
  b.sweep(spine, (t: number): [number, number] => {
    const k = Math.sin(Math.PI * t);
    return [0.5 + 0.12 * k, 0.56 + 0.08 * k];
  }, { color: SKIN });

  b.sweep(neck, [0.42, 0.32], { color: SKIN });

  b.loft(
    [
      { at: [0, 3.05, 1.12], w: 0.62, h: 0.68 },
      { at: [0, 3.12, 1.36], w: 0.72, h: 0.82 },
      { at: [0, 3.1, 1.6], w: 0.5, h: 0.6 },
    ],
    { bone: head, color: SKIN },
  );

  b.sweep(trunk, [0.2, 0.065], { color: SKIN });

  // Two finger lobes at the trunk tip.
  for (const s of [1, -1]) {
    b.spike(trunk.at(1), [s * 0.25, 0, 1], 0.07, 0.022, { color: SKIN });
  }

  b.sweep(tail, [0.06, 0.018], { color: SKIN });
  b.spike(tail.at(1), [0, -1, 0], 0.16, 0.045, { color: TUFT });

  // ---- Head details -------------------------------------------------------
  for (const s of [1, -1]) {
    // Fan ears, flared outward.
    b.extrude(EAR_OUTLINE, {
      at: head.local([s * 0.3, -0.05, 0.05]),
      x: [0, 0, 1],
      y: [s * 0.25, 1, 0],
      thickness: 0.04,
      bevel: 0.01,
      smoothing: 1,
      color: EAR,
      bone: head,
    });

    // Curved ivory tusks.
    b.sweep(
      bezier(
        [s * 0.2, 2.72, 1.5],
        [s * 0.26, 2.5, 1.85],
        [s * 0.34, 2.48, 2.02],
        [s * 0.38, 2.74, 1.95],
      ),
      [0.045, 0.012],
      { bone: head, color: IVORY, caps: { start: "round", end: "point" } },
    );

    // Small dark eyes.
    b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK, {
      bone: head,
      at: head.local([s * 0.33, 0.15, 0.2]),
    });
  }

  // ---- Legs ---------------------------------------------------------------
  type Pt = [number, number, number];

  const leg = (s: number, name: string, hip: Pt, foot: Pt, bend: Pt) => {
    const pts = limb(hip, foot, [0.98, 0.98], bend);
    const chain = b.chain(`leg${name}`, pts, {
      parent: hips,
      names: [`hip${name}`, `knee${name}`, `ankle${name}`],
      role: "leg",
    });
    b.sweep(chain, [0.25, 0.17], { color: SKIN });

    // Toenails along the front of the foot.
    const ankle = chain.joints[chain.joints.length - 1];
    for (const k of [-0.09, -0.03, 0.03, 0.09]) {
      b.part(new THREE.CylinderGeometry(0.028, 0.03, 0.03, 6), NAIL, {
        bone: ankle,
        at: [foot[0] + k, 0.1, foot[2] + 0.16],
        dir: [0, 0, 1],
      });
    }
    return s;
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // Forelegs bend their elbows back, hind legs bend their knees forward.
    leg(s, `F${side}`, [s * 0.38, 2.05, 0.55], [s * 0.36, 0.16, 0.5], [0, 0, -1]);
    leg(s, `H${side}`, [s * 0.38, 2.05, -0.6], [s * 0.36, 0.16, -0.55], [0, 0, 1]);
  }

  return b.root;
}
```