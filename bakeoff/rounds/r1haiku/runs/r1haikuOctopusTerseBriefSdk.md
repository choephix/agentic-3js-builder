```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { paint } from "agentic-3js-builder";

export const meta = {
  name: "octopus",
  description: "A stylized octopus: bulbous mantle, big eyes, eight curling arms resting on the floor with suckers.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const r = rng(11);

  const BODY = "#c9566b";
  const BODY_DARK = "#8e3446";
  const EYE_WHITE = "#f4efe6";
  const PUPIL = "#16121a";
  const SUCKER = "#f2c4cf";
  const BEAK = "#3b2a33";

  // Skeleton root: the mantle sits high, arms reach down to the floor.
  const mantleJoint = b.joint("mantle", { at: [0, 0.4, 0] });

  // Mantle: a bulbous sack, stacked stations so it reads as one stylised head.
  const mantle = b.loft([
    { at: [0, 0.22, 0], radius: 0.12 },
    { at: [0, 0.3, 0], radius: 0.18 },
    { at: [0, 0.42, 0], radius: 0.2 },
    { at: [0, 0.54, 0], radius: 0.17 },
    { at: [0, 0.62, 0], radius: 0.08 },
  ]);

  // Bold dark-blotch decals scattered across the mantle surface.
  const mantleSurface = b.surface(mantle);
  const blotches = mantleSurface.scatter(14);
  for (const hit of blotches) {
    b.stick(new THREE.SphereGeometry(0.035 + r() * 0.02, 6, 4), BODY_DARK, hit);
  }

  // Eyes: big white orbs with a dark pupil stuck on the front of each.
  for (const side of [1, -1]) {
    const eyeHit = mantleSurface.nearest([side * 0.1, 0.4, 0.13]);
    b.stick(new THREE.SphereGeometry(0.06, 10, 8), EYE_WHITE, eyeHit);
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), PUPIL, eyeHit);
  }

  // Beak: a small dark cone hidden under the arms' root, at the mantle base.
  b.spike([0, 0.2, 0.06], [0, -0.3, 0.6], 0.06, 0.03);

  // Eight arms: a splayed rest pose that curls at the tips and lies on the floor.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const jitter = 0.9 + r() * 0.2;
    const reach = 0.5 * jitter;
    const base: [number, number, number] = [dx * 0.1, 0.24, dz * 0.1];
    const pts: [number, number, number][] = [
      base,
      [dx * 0.2, 0.14, dz * 0.2],
      [dx * 0.36 * jitter, 0.06, dz * 0.36 * jitter],
      [dx * reach, 0.03, dz * reach],
      [dx * (reach + 0.1), 0.035, dz * (reach + 0.1) + 0.05 * Math.sign(dz || 1)],
      [dx * (reach + 0.12), 0.07, dz * (reach + 0.08)],
    ];

    const arm = b.chain(`arm${i}`, pts);
    const armBody = b.sweep(arm, {
      radius: (t: number) => 0.055 * (1 - 0.8 * t) + 0.008,
    });

    // Suckers in a row along the underside of each arm.
    const suckerPath = arm;
    b.along(suckerPath, 12, (at: any) => {
      b.stick(new THREE.SphereGeometry(0.012, 6, 4), SUCKER, at);
    });
  }

  return b.root;
}
```