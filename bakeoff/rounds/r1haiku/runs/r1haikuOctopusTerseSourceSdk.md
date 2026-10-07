```ts
import * as THREE from "three";
import { along, catmull, createBuilder, gradient, spots } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description: "A stylised octopus: a rust-and-cream spotted mantle, eight curling arms with sucker rows, and big goggle eyes.",
};

const SKIN = "#a9462e";
const SKIN_DARK = "#8f3a26";
const SUCKER = "#f3d9bd";
const ARM_NAMES = ["armA", "armB", "armC", "armD", "armE", "armF", "armG", "armH"];

/** Arm thickness at source t along the arm: thick at the mantle, a fine tip. */
const armRadius = (t: number) => 0.045 * (1 - t) + 0.008 * t;

/** Control points of one arm: out from under the mantle, down to the floor, curling at the tip. */
function armPoints(i: number) {
  const a = (i / 8) * Math.PI * 2;
  const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
  const tang = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
  const curl = i % 2 === 0 ? 1 : -1;
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 7; k++) {
    const s = k / 7;
    const radial = 0.08 + 0.42 * s - 0.1 * s ** 3;
    const height = 0.2 - 0.17 * s;
    const sway = curl * 0.12 * s * s + 0.04 * Math.sin(s * 4.5 + i * 0.7) * s;
    pts.push(
      dir
        .clone()
        .multiplyScalar(radial)
        .addScaledVector(tang, sway)
        .add(new THREE.Vector3(0, height, 0)),
    );
  }
  return pts;
}

export default function octopus() {
  const b = createBuilder({ name: "octopus", detail: 1, paintSize: 1024 });

  // The body joint sits in the mantle; everything else hangs from it.
  b.joint("body", { at: [0, 0.25, 0] });

  // Mantle: a round sack, spotted in rust and cream.
  b.lathe(
    [
      [0, 0],
      [0.09, 0.01],
      [0.15, 0.06],
      [0.18, 0.16],
      [0.17, 0.28],
      [0.13, 0.37],
      [0.07, 0.44],
      [0, 0.47],
    ],
    {
      name: "mantle",
      color: spots(SKIN, ["#f0b44c", "#f6dca0"], { size: 0.09, amount: 0.35, rosette: true }),
      at: [0, 0.16, 0],
      bone: "body",
      segments: 14,
    },
  );

  // Funnel (siphon) under the front of the mantle.
  b.part(new THREE.ConeGeometry(0.03, 0.08, b.segments(8)), SKIN_DARK, {
    at: [0, 0.17, 0.14],
    dir: [0, -0.4, 1],
    bone: "body",
  });

  // Beak, hidden where the arms meet.
  b.part(new THREE.ConeGeometry(0.02, 0.04, b.segments(6)), "#2b1b17", {
    at: [0, 0.15, 0],
    dir: [0, -1, 0],
    bone: "body",
  });

  // Goggle eyes on the sides of the head: cream whites with dark pupils.
  for (const side of [1, -1]) {
    const eye = [side * 0.13, 0.32, 0.09] as const;
    b.part(new THREE.SphereGeometry(0.045, b.segments(10), b.segments(8)), "#f6f1e4", {
      at: eye,
      bone: "body",
    });
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), "#101010", {
      at: [side * 0.159, 0.32, 0.12],
      bone: "body",
    });
  }

  // Eight arms: each a smooth chain of six joints, swept as one tapering tube, with a row of suckers underneath.
  const sucker = new THREE.CylinderGeometry(0.009, 0.009, 0.005, 8);
  ARM_NAMES.forEach((name, i) => {
    const chain = b.chain(name, catmull(armPoints(i)), {
      parent: "body",
      count: 6,
      role: "tentacle",
    });

    b.sweep(chain, armRadius, {
      name: `${name}.skin`,
      color: gradient(SKIN_DARK, "#e7a46e", [0, 0.2, 0], [0.3, 0.05, 0.3]),
      sides: 8,
      caps: "round",
    });

    along(chain, 12, (pt) => {
      const r = armRadius(pt.t);
      // The side of the arm facing down: the sucker row lies underneath.
      const down = pt.normal.y <= 0 ? pt.normal.clone() : pt.normal.clone().negate();
      const at = pt.at.addScaledVector(down, r);
      b.part(sucker, SUCKER, { frame: pt, at, dir: down });
    }, { from: 0.12, to: 0.95 });
  });

  return b.root;
}
```