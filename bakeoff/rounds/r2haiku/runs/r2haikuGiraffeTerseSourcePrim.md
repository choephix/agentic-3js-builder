```ts
import * as THREE from "three";
import { createBuilder, patches } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "A stylised giraffe in a rest pose: blocky body, long neck, patched coat, ossicones, rigged legs, neck, jaw and tail.",
};

export default function giraffe() {
  const b = createBuilder({ name: "giraffe" });

  const coat = patches("#f2d68c", ["#8c4a1e", "#74391a", "#9c5526"], { size: 0.5, gap: 0.12, seed: 7 });
  const cream = "#f6e2a6";
  const dark = "#2a1a0e";
  const hoof = "#2b1b10";
  const ossicone = "#3b2415";

  // Torso: the root joint, at the middle of the body.
  const torso = b.joint("torso", { at: [0, 2.3, 0], dir: [0, 0, 1] });

  // Body: a smooth loft from rump to chest, bending on the torso.
  b.loft(
    [
      { at: [0, 2.3, -0.9], w: 0.5, h: 0.55 },
      { at: [0, 2.3, -0.2], w: 0.62, h: 0.72 },
      { at: [0, 2.25, 0.45], w: 0.6, h: 0.78 },
    ],
    { color: coat, bone: torso, name: "body" },
  );

  // Neck: one chain whose tip joint is the head.
  const neck = b.chain(
    "neck",
    [
      [0, 2.45, 0.45],
      [0, 3.1, 0.8],
      [0, 3.8, 1.0],
      [0, 4.5, 1.12],
    ],
    { parent: torso, names: ["neckA", "neckB", "neckC", "head"], role: "neck" },
  );
  b.sweep(neck, (t: number) => 0.2 - 0.08 * t, { color: coat, name: "neck" });

  // Head: a blocky block on the tip joint, with a cream muzzle, eyes, ears and ossicones.
  const head = neck.tip!;
  b.part(new THREE.BoxGeometry(0.22, 0.5, 0.3).translate(0, 0.25, 0), coat, { frame: head, name: "head" });
  b.part(new THREE.BoxGeometry(0.2, 0.14, 0.2).translate(0, 0.45, 0), cream, { frame: head, name: "muzzle" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), dark, {
      bone: "head",
      at: head.local([s * 0.118, 0.32, 0]),
      name: "eye",
    });
    b.part(new THREE.BoxGeometry(0.12, 0.04, 0.06).translate(s * 0.15, 0.36, 0), coat, {
      frame: head,
      name: "ear",
    });
    b.rod(head.local([s * 0.07, 0.45, 0]), head.local([s * 0.07, 0.62, -0.02]), 0.028, {
      color: ossicone,
      bone: "head",
      name: "ossicone",
    });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), ossicone, {
      bone: "head",
      at: head.local([s * 0.07, 0.62, -0.02]),
      name: "ossiconeTip",
    });
  }

  // Lower jaw: its own joint, hinged at the back of the head.
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.02, -0.14]), role: "jaw" });
  b.part(new THREE.BoxGeometry(0.16, 0.42, 0.08).translate(0, 0.21, -0.04), cream, { frame: jaw, name: "jawBox" });

  // Tail: a thin rope ending in a dark tuft.
  const tail = b.chain(
    "tail",
    [
      [0, 2.25, -0.85],
      [0, 1.9, -1.05],
      [0, 1.45, -1.2],
      [0, 1.0, -1.25],
    ],
    { parent: torso, names: ["tailA", "tailB", "tailC", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.04 - 0.025 * t, { color: coat, name: "tail" });
  b.part(new THREE.SphereGeometry(0.08, 10, 8), dark, { bone: "tailTip", at: [0, 1.0, -1.25], name: "tuft" });

  // Legs: four chains of hip, knee, ankle and hoof, each tapered and capped with a hoof.
  const leg = (prefix: "fore" | "hind", side: "L" | "R", pts: number[][]) => {
    const names = [`${prefix}Hip${side}`, `${prefix}Knee${side}`, `${prefix}Ankle${side}`, `${prefix}Hoof${side}`];
    const chain = b.chain(`${prefix}Leg${side}`, pts, { parent: torso, names, role: "leg" });
    b.sweep(chain, (t: number) => 0.1 - 0.035 * t, { color: coat, name: `${prefix}Leg${side}` });
    b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.09, 10), hoof, {
      bone: names[3],
      at: pts[3],
      name: `${prefix}Hoof${side}`,
    });
  };
  for (const [side, x] of [
    ["L", 0.22],
    ["R", -0.22],
  ] as const) {
    leg("fore", side, [
      [x, 2.15, 0.35],
      [x, 1.2, 0.42],
      [x, 0.3, 0.44],
      [x, 0.045, 0.47],
    ]);
    leg("hind", side, [
      [x, 2.1, -0.6],
      [x, 1.25, -0.72],
      [x, 0.35, -0.84],
      [x, 0.045, -0.86],
    ]);
  }

  return b.root;
}
```