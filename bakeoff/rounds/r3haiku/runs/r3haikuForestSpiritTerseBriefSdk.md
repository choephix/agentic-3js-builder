This is a 2.1 m forest spirit: a bark-bodied, moss-cloaked figure with an antler crown, a glowing face, and a lantern-seed in one hand. Its roots sink into the ground and its hair trails behind. I wrote it against the SDK reference as given, but I haven't run it, so some helper option names (such as `parent`, `role`, and the membrane colour option) are inferred from the description.

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description: "A bark-bodied forest spirit with an antler crown, moss cloak, glowing eyes and a lantern seed.",
};

const C = {
  bark: "#5b3d26",
  barkDark: "#33221a",
  moss: "#4f8a3a",
  mossLight: "#86bd4f",
  leaf: "#a8d860",
  antler: "#e2d3a8",
  glow: "#ffd54a",
  eye: "#fff6b0",
  stone: "#7d857a",
};

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const rand = rng(11);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const chest = b.joint("chest", { at: [0, 1.6, 0], parent: hips });
  const head = b.joint("head", { at: [0, 2.1, 0.05], parent: chest });

  const spine = b.chain(
    "spine",
    [
      [0, 1.0, 0],
      [0, 1.3, 0.02],
      [0, 1.6, 0.0],
      [0, 1.85, 0.02],
    ],
    { role: "spine", parent: hips },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 1.85, 0.02],
      [0, 2.0, 0.04],
      [0, 2.1, 0.05],
    ],
    { role: "neck", parent: chest },
  );

  // Arms (left is +X)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.chain(
      `arm${side}`,
      [
        [0.24 * s, 1.8, 0.0],
        [0.42 * s, 1.5, 0.06],
        [0.5 * s, 1.2, 0.14],
      ],
      { role: "arm", parent: chest },
    );
  }

  // Root-legs sinking into the ground
  const rootPaths: [number, number][] = [
    [0.0, 0.0],
    [0.5, 0.2],
    [-0.5, 0.2],
  ];
  rootPaths.forEach(([dx, dz], i) => {
    b.chain(
      `root${i}`,
      [
        [0.0, 1.0, 0.0],
        [dx * 0.12, 0.55, dz * 0.12],
        [dx * 0.3, 0.12, dz * 0.3 + 0.05],
        [dx * 0.4, 0.01, dz * 0.4 + 0.1],
      ],
      { role: "leg", parent: hips },
    );
  });

  // Trailing hair tendrils from the back of the head
  for (const s of [1, -1, 0]) {
    b.chain(
      `hair${s + 1}`,
      [
        [s * 0.05, 2.08, -0.02],
        [s * 0.2, 1.92, -0.2],
        [s * 0.3, 1.62, -0.32],
        [s * 0.32, 1.3, -0.36],
      ],
      { role: "tentacle", parent: head },
    );
  }

  // ---- Body ----------------------------------------------------------------
  const spineChain = spine;
  b.sweep(spineChain, 0.2, { color: C.bark });

  // Chest knot and hips: faceted bulges
  b.part(new THREE.DodecahedronGeometry(0.27, 0), C.bark, {
    at: [0, 1.5, 0.02],
    bone: chest,
  });
  b.part(new THREE.DodecahedronGeometry(0.22, 0), C.barkDark, {
    at: [0, 1.0, 0.0],
    bone: hips,
  });

  // Moss cloak: membrane between two hanging edges
  b.membrane(
    [
      [0.26, 1.82, -0.04],
      [0.36, 1.35, -0.1],
      [0.42, 0.7, -0.08],
    ],
    [
      [-0.26, 1.82, -0.04],
      [-0.36, 1.35, -0.1],
      [-0.42, 0.7, -0.08],
    ],
    { color: C.moss },
  );

  // Moss ridges on the torso
  const torsoSurface = b.surface(spineChain);
  const ridgeGeo = new THREE.DodecahedronGeometry(0.05, 0);
  ridgeGeo.scale(1, 0.5, 1.4);
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const hit = torsoSurface.nearest([
      Math.sin(i * 2.4) * 0.2,
      1.1 + t * 0.7,
      Math.cos(i * 2.4) * 0.2,
    ]);
    b.stick(ridgeGeo, i % 2 ? C.moss : C.mossLight, hit);
  }

  // ---- Head ----------------------------------------------------------------
  const headGeo = new THREE.DodecahedronGeometry(0.2, 0);
  headGeo.scale(1, 1.1, 0.95);
  const headPart = b.part(headGeo, C.bark, { at: [0, 2.1, 0.05], bone: head });

  const headSurface = b.surface(headPart);

  // Glowing eyes seated on the face
  const eyeGeo = new THREE.SphereGeometry(0.035, 6, 4);
  for (const s of [1, -1]) {
    const eyeHit = headSurface.nearest([s * 0.075, 2.12, 0.19]);
    b.stick(eyeGeo, C.eye, eyeHit);
  }

  // Carved mouth: a small dark slit
  const mouthGeo = new THREE.BoxGeometry(0.08, 0.02, 0.02);
  b.stick(mouthGeo, C.barkDark, headSurface.nearest([0, 2.02, 0.2]));

  // Antler crown: sprouted branches with tines
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSurface.nearest([s * 0.12, 2.26, 0.02]);
    b.sprout(`antler${side}`, hit, [s * 0.32, 2.62, -0.06], 0.03);
    b.spike([s * 0.22, 2.42, -0.02], [s * 0.4, 0.5, 0.0], 0.14, 0.012);
    b.spike([s * 0.3, 2.56, -0.04], [s * 0.3, 0.8, 0.1], 0.1, 0.01);
  }

  // Leaves and moss tufts scattered across the head
  const leafGeo = new THREE.DodecahedronGeometry(0.06, 0);
  leafGeo.scale(1, 0.35, 1.5);
  const leafHits = headSurface.scatter(26);
  leafHits.forEach((hit: any, i: number) => {
    if (rand() < 0.35) return;
    b.stick(leafGeo, i % 3 === 0 ? C.leaf : C.moss, hit);
  });

  // ---- Arms and hands ------------------------------------------------------
  // Lantern seed held in the left hand
  const seedGeo = new THREE.IcosahedronGeometry(0.1, 0);
  b.part(seedGeo, C.glow, { at: [0.5, 1.2, 0.14], bone: chest });

  // Small stone-like bracelet at the right wrist
  b.part(new THREE.DodecahedronGeometry(0.05, 0), C.stone, {
    at: [-0.46, 1.32, 0.12],
    bone: chest,
  });

  // ---- Roots and ground ----------------------------------------------------
  const rootTuftGeo = new THREE.DodecahedronGeometry(0.07, 0);
  rootTuftGeo.scale(1.2, 0.5, 1);
  for (const at of [
    [0.0, 0.03, 0.0],
    [0.2, 0.03, 0.12],
    [-0.2, 0.03, 0.14],
  ] as [number, number, number][]) {
    b.part(rootTuftGeo, C.moss, { at, bone: hips });
  }

  return b.root;
}
```