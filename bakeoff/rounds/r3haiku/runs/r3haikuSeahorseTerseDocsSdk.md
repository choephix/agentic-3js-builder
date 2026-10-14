This seahorse has a curled tail, a boxy bony trunk with rows of armour studs, a horse-like head with a jaw and a coronet, and small fins. It's sized at roughly 0.2 m tall, and the tail coil keeps its lowest point just above the floor.

```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, spots } from "agentic-3js-builder";

export const meta = {
  name: "seahorse",
  description: "A gold-orange seahorse with a curled tail, bony trunk plates, a coronet and small fins.",
};

const BODY = "#e8952f";
const SPOT = "#a4461f";
const BELLY = "#f8dc8e";
const ARMOR = "#c77a2c";
const FIN = "#fde3a0";
const EYE = "#1d1a2e";
const WHITE = "#fff8e6";

export default function build() {
  const b = createBuilder({ name: "seahorse" });
  const coat = countershade(spots(BODY, SPOT, { size: 0.03, amount: 0.35, seed: 4 }), BELLY, { level: -0.2 });

  // Skeleton: hips at the root, trunk and neck as one chain, head and jaw on top.
  const hips = b.joint("hips", { at: [0, 0.05, 0] });

  // Tail: a coil in the Y/Z plane that tightens inward and tucks under the trunk.
  const tailPts: number[][] = [[0, 0.05, -0.005]];
  const cy = 0.03;
  const cz = -0.01;
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const a = Math.PI * 0.9 + u * Math.PI * 1.1;
    const r = 0.022 - 0.01 * u;
    tailPts.push([0, cy + r * Math.sin(a), cz + r * Math.cos(a)]);
  }
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 7, role: "tail" });
  b.sweep(tail, (t: number) => 0.0085 - 0.0035 * t, { color: coat });
  for (let i = 0; i < 6; i++) {
    b.ring(tail.at(0.15 + i * 0.13), { count: 5, radius: 0.0075 }, (it) =>
      b.stick(new THREE.BoxGeometry(0.0045, 0.0025, 0.006), ARMOR, it),
    );
  }

  // Trunk and neck: a boxy tube that bulges at the chest and narrows at the neck.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.05, 0],
      [0, 0.085, 0.01],
      [0, 0.12, 0.03],
      [0, 0.15, 0.055],
      [0, 0.172, 0.085],
    ]),
    { parent: hips, role: "spine" },
  );
  b.sweep(
    spine,
    (t: number) => [
      0.011 + 0.004 * Math.sin(Math.PI * t) - 0.003 * t,
      0.013 + 0.003 * Math.sin(Math.PI * t) - 0.003 * t,
    ],
    { section: "box", color: coat },
  );

  // Armour: rings of small plates studding the trunk.
  for (let i = 0; i < 8; i++) {
    b.ring(spine.at(0.12 + i * 0.1), { count: 6, radius: 0.0125 }, (it) =>
      b.stick(new THREE.BoxGeometry(0.0065, 0.0035, 0.008), ARMOR, it),
    );
  }

  // Head: a long tilted snout, a separate lower jaw, big eyes and a coronet.
  const head = b.joint("head", { parent: spine, at: [0, 0.172, 0.085], dir: [0, -0.35, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.0155, 10, 7), coat, {
    bone: head,
    at: head.local({ forward: 0.004, up: 0.012 }),
  });
  b.capsule(
    head.local({ forward: 0.006, up: 0.008 }),
    head.local({ forward: 0.052, up: -0.004 }),
    [0.0095, 0.0068],
    { bone: head, color: coat },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.004 }),
    dir: head.dir([0, 1, 0]),
    role: "jaw",
  });
  b.capsule(
    head.local({ forward: 0.02, up: -0.004 }),
    head.local({ forward: 0.05, up: -0.008 }),
    [0.0065, 0.005],
    { bone: jaw, color: coat },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.0125, up: 0.015, forward: 0 }),
    });
    b.part(new THREE.SphereGeometry(0.0045, 7, 5), EYE, {
      bone: head,
      at: head.local({ left: s * 0.0165, up: 0.015, forward: 0.001 }),
    });
  }

  b.spike(head.local({ forward: -0.002, up: 0.014 }), [0, 0.93, -0.37], 0.014, 0.0035, {
    bone: head,
    color: ARMOR,
  });

  // Fins: a small dorsal fin on the back of the trunk and a pair of pectorals.
  b.extrude(
    [
      [-0.004, 0],
      [0.012, 0.006],
      [0.02, 0.022, "sharp"],
      [0, 0.026],
      [-0.005, 0.012],
    ],
    {
      at: spine.at(0.42).moved({ back: 0.008 }),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.003,
      color: FIN,
    },
  );
  for (const s of [1, -1]) {
    const pc = spine.at(0.74);
    b.extrude(
      [
        [-0.006, 0],
        [0.014, 0.008],
        [0.022, 0.02, "sharp"],
        [-0.002, 0.024],
      ],
      {
        at: pc.moved({ left: s * 0.011 }),
        x: [0, 0, 1],
        y: [s * 0.3, 1, 0],
        thickness: 0.003,
        color: FIN,
      },
    );
  }

  return b.root;
}
```