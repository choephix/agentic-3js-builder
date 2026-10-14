This is a stylized giraffe about 5 m tall, with a long neck, ossicones, a tufted tail, and brown patches stuck onto the body and neck. It uses the SDK's chain, sweep, surface, stick and part helpers. I haven't run it, so treat the exact helper signatures as best-effort.

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "giraffe",
  description: "Stylized giraffe: long neck, ossicones, patched coat, tufted tail. About 5 m tall.",
};

const COAT = "#dcae4f";
const PATCH = "#7a4a22";
const HOOF = "#2b2118";
const OSSICONE = "#5b3a1e";
const TIP = "#2a1a0e";
const EYE = "#111111";
const MUZZLE = "#e8c58c";

export default function build() {
  const b = createBuilder({ name: "giraffe" });
  const r = rng(7);

  // ---- Torso skeleton and skin --------------------------------------------
  const spine = b.chain(
    "spine",
    [
      [0, 2.35, -0.75],
      [0, 2.4, 0],
      [0, 2.45, 0.7],
    ],
    { role: "spine" },
  );
  const torso = b.sweep(spine, 0.36, { color: COAT });
  const torsoSkin = b.surface(torso);

  // ---- Neck -----------------------------------------------------------------
  const neck = b.chain(
    "neck",
    [
      [0, 2.7, 0.85],
      [0, 3.3, 1.05],
      [0, 3.9, 1.2],
      [0, 4.45, 1.35],
    ],
    { role: "neck" },
  );
  const neckMesh = b.sweep(neck, 0.19, { color: COAT });
  const neckSkin = b.surface(neckMesh);

  // ---- Legs (chains with hooves) -------------------------------------------
  const legs: [string, number, number][] = [
    ["legFL", 0.2, 0.5],
    ["legFR", -0.2, 0.5],
    ["legBL", 0.2, -0.55],
    ["legBR", -0.2, -0.55],
  ];
  for (const [name, x, z] of legs) {
    const leg = b.chain(
      name,
      [
        [x, 2.3, z],
        [x, 1.2, z + 0.02],
        [x, 0.14, z],
      ],
      { role: "leg" },
    );
    b.sweep(leg, 0.095, { color: COAT });
    b.part(new THREE.BoxGeometry(0.15, 0.12, 0.17), HOOF, {
      at: [x, 0.06, z + 0.02],
    });
  }

  // ---- Tail -------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    [
      [0, 2.4, -0.85],
      [0, 2.0, -1.1],
      [0, 1.7, -1.2],
    ],
    { role: "tail" },
  );
  b.sweep(tail, 0.035, { color: COAT });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), HOOF, { at: [0, 1.62, -1.22] });

  // ---- Head -------------------------------------------------------------------
  const head = b.joint("head", { at: [0, 4.62, 1.6] });
  b.part(new THREE.BoxGeometry(0.3, 0.28, 0.5), COAT, { at: [0, 4.62, 1.72], bone: head });
  // Muzzle: a lighter, slightly lower block
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.18), MUZZLE, { at: [0, 4.56, 1.98], bone: head });
  // Nostrils and eyes
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), TIP, { at: [-0.06, 4.6, 2.08], bone: head });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), TIP, { at: [0.06, 4.6, 2.08], bone: head });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), EYE, { at: [-0.16, 4.7, 1.76], bone: head });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), EYE, { at: [0.16, 4.7, 1.76], bone: head });

  // Ears: flat blocks angled out from the sides of the skull
  b.part(new THREE.BoxGeometry(0.22, 0.08, 0.1), COAT, {
    at: [-0.24, 4.66, 1.56],
    bone: head,
  });
  b.part(new THREE.BoxGeometry(0.22, 0.08, 0.1), COAT, {
    at: [0.24, 4.66, 1.56],
    bone: head,
  });

  // Ossicones: short horns with dark tips
  for (const side of [-1, 1]) {
    const x = side * 0.07;
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.24, 6), OSSICONE, {
      at: [x, 4.86, 1.6],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), TIP, {
      at: [x, 4.99, 1.6],
      bone: head,
    });
  }

  // ---- Coat patches on body and neck -----------------------------------------
  const patchGeo = new THREE.BoxGeometry(0.16, 0.12, 0.05);
  const patchGeoSmall = new THREE.BoxGeometry(0.1, 0.08, 0.04);

  for (let i = 0; i < 46; i++) {
    const p: [number, number, number] = [
      (r() - 0.5) * 0.5,
      2.4 + (r() - 0.5) * 0.45,
      (r() - 0.5) * 1.3,
    ];
    const hit = torsoSkin.nearest(p);
    b.stick(i % 3 === 0 ? patchGeoSmall : patchGeo, PATCH, hit);
  }

  for (let i = 0; i < 22; i++) {
    const p: [number, number, number] = [
      (r() - 0.5) * 0.3,
      2.9 + r() * 1.5,
      0.95 + r() * 0.4,
    ];
    const hit = neckSkin.nearest(p);
    b.stick(patchGeoSmall, PATCH, hit);
  }

  return b.root;
}
```