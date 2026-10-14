```ts
import * as THREE from "three";
import { createBuilder, spots } from "agentic-3js-builder";

export const meta = {
  name: "octopus",
  description: "A coral-red octopus with a bulbous mantle, big white eyes, a beak and eight curling arms lined with suckers.",
};

const SKIN = "#e0603a";
const SPOT = "#9e2f1c";
const WHITE = "#f6f1e6";
const INK = "#15110f";
const SUCKER = "#f2c7a6";
const BEAK = "#3b2a26";

export default function build() {
  const b = createBuilder({ name: "octopus" });

  // Shared paint: coral skin with darker spots, in meters.
  const skin = spots(SKIN, SPOT, { size: 0.16, amount: 0.35, seed: 5 });

  // Root bone: the mantle sits above the floor, arms hang from its underside.
  const MANTLE_AT: [number, number, number] = [0, 0.45, 0];
  const mantle = b.joint("mantle", { at: MANTLE_AT, role: "spine" });

  // Bulbous mantle, a solid of revolution about the vertical axis.
  const mantleOutline: [number, number][] = [
    [0, -0.12],
    [0.12, -0.12],
    [0.2, -0.08],
    [0.24, 0.02],
    [0.24, 0.14],
    [0.2, 0.26],
    [0.12, 0.34],
    [0, 0.36],
  ];
  const body = b.lathe(mantleOutline, {
    at: MANTLE_AT,
    bone: mantle,
    smoothing: 1,
    segments: 12,
    color: skin,
    name: "mantle",
  });

  // Beak tucked under the centre of the arms.
  b.spike([0, 0.36, 0.02], [0, -1, 0], 0.05, 0.02, { bone: mantle, color: BEAK, name: "beak" });

  // Big eyes on the upper flanks: a white ball with a flat black pupil.
  for (const s of [1, -1]) {
    const eyeHit = b.surface(body).around(MANTLE_AT).at(s * 58, 12);
    if (!eyeHit) continue;
    b.stick(new THREE.SphereGeometry(0.07, 12, 8), WHITE, eyeHit, { embed: 0.5, name: "eye" });
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), INK, eyeHit.moved([0, 0.066, 0]), {
      embed: 0.5,
      name: "pupil",
    });
  }

  // Eight arms: each one reaches out over the floor, then curls its tip up.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const curl = i % 2 === 0 ? 1 : -1;

    const path = [
      [0.1 * s, 0.36, 0.1 * c],
      [0.28 * s, 0.16, 0.28 * c],
      [0.5 * s, 0.04, 0.5 * c],
      [0.66 * s - 0.07 * curl * c, 0.05, 0.66 * c + 0.07 * curl * s],
      [0.62 * s - 0.1 * curl * c, 0.2, 0.62 * c + 0.1 * curl * s],
    ] as [number, number, number][];

    const armPath = catmullPath(path);
    const arm = b.chain(`arm${i}`, armPath, { parent: mantle, count: 5, role: "tentacle" });

    const sw = b.sweep(arm, (t: number) => 0.072 * (1 - t) + 0.014, {
      color: skin,
      caps: { end: "point" },
      name: `arm${i}`,
    });

    // Suckers along the underside edges of the arm.
    for (const t of [0.42, 0.56, 0.7, 0.82]) {
      for (const deg of [125, 235]) {
        b.stick(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 6), SUCKER, sw.at(t, deg), {
          embed: 0.3,
          name: "sucker",
        });
      }
    }
  }

  return b.root;
}

// Local helper: a smooth curve through the given points.
import { catmull } from "agentic-3js-builder";
function catmullPath(points: [number, number, number][]) {
  return catmull(points);
}
```