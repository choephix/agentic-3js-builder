```ts
import * as THREE from "three";
import { createBuilder, spots } from "agentic-3js-builder";

export const meta = {
  name: "Giraffe",
  description: "A stylised giraffe in a rest pose: long neck and legs, rosette-patched coat, dark ossicones and mane, a hinged jaw.",
};

export default function giraffe() {
  const b = createBuilder({ name: "giraffe", detail: 1, paintSize: 1024 });

  const coat = spots("#e8b95c", "#7a4520", { size: 0.45, amount: 0.55, rosette: true, seed: 3 });
  const legCoat = spots("#f1dca0", "#8a5326", { size: 0.35, amount: 0.4, rosette: false, seed: 9 });
  const mane = "#5b3217";
  const hoof = "#2b1d12";
  const cream = "#f1dca0";

  // Body: a tapered barrel of four stations, one bone.
  b.joint("body", { at: [0, 2.8, 0] });
  b.loft(
    [
      { at: [0, 2.72, -1.0], w: 0.55, h: 0.7 },
      { at: [0, 2.82, -0.3], w: 0.75, h: 0.9 },
      { at: [0, 2.88, 0.35], w: 0.7, h: 0.85 },
      { at: [0, 2.8, 0.75], w: 0.5, h: 0.7 },
    ],
    { color: coat, name: "torso" },
  );

  // Four long legs, each a three-joint chain with a hoof on its ankle.
  const legs: Array<[string, number, number]> = [
    ["FL", 0.24, 0.55],
    ["FR", -0.24, 0.55],
    ["HL", 0.24, -0.55],
    ["HR", -0.24, -0.55],
  ];
  for (const [k, x, z] of legs) {
    const leg = b.chain(
      `leg${k}`,
      [
        [x, 2.5, z],
        [x, 1.35, z],
        [x, 0.3, z],
      ],
      { parent: "body", role: "leg", names: [`hip${k}`, `knee${k}`, `ankle${k}`] },
    );
    b.sweep(leg, (t: number) => 0.12 - 0.035 * t, { color: legCoat, extend: [0, 0.2] });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.12, b.segments(8)), hoof, {
      bone: `ankle${k}`,
      at: [x, 0.06, z],
    });
  }

  // Long neck rising forward from the chest, with a dark mane along the top.
  const neck = b.chain(
    "neck",
    [
      [0, 3.0, 0.5],
      [0, 3.7, 0.85],
      [0, 4.3, 1.25],
    ],
    { parent: "body", role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  b.sweep(neck, (t: number) => 0.2 - 0.06 * t, {
    color: coat,
    sectors: [[-35, 35, mane]],
  });

  // Head, with a separate lower jaw so the mouth can open.
  b.joint("head", { parent: "neck3", at: [0, 4.4, 1.45], dir: [0, 0.3, 1], role: "head" });
  b.part(new THREE.BoxGeometry(0.26, 0.26, 0.32), coat, { bone: "head" });
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.36), coat, { bone: "head", at: [0, 4.36, 1.79] });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.04), "#3c2414", { bone: "head", at: [0, 4.37, 1.97] });

  b.joint("jaw", { parent: "head", at: [0, 4.3, 1.6], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.16, 0.06, 0.3), cream, { bone: "jaw", at: [0, 4.3, 1.75] });

  // Eyes, ears and ossicones (the short horns, dark tipped).
  for (const x of [0.13, -0.13]) {
    b.part(new THREE.SphereGeometry(0.04, b.segments(8), b.segments(6)), "#1a1008", {
      bone: "head",
      at: [x, 4.47, 1.5],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.05, 0.05), coat, {
      bone: "head",
      at: [x * 1.1, 4.38, 1.4],
    });
  }
  for (const x of [0.07, -0.07]) {
    b.spike([x, 4.5, 1.36], [0, 1, 0.18], 0.22, 0.035, { color: mane, bone: "head", name: "ossicone" });
  }

  // Tail hanging from the rump, with a dark tuft.
  const tail = b.chain(
    "tail",
    [
      [0, 2.9, -1.0],
      [0, 2.7, -1.4],
      [0, 2.0, -1.55],
    ],
    { parent: "body", role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  b.sweep(tail, (t: number) => 0.045 - 0.02 * t, { color: mane });
  b.part(new THREE.SphereGeometry(0.08, b.segments(8), b.segments(6)), mane, { bone: "tail3" });

  return b.root;
}
```