```ts
import * as THREE from "three";
import { catmull, createBuilder, spots } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description: "A stylised octopus: a spotted mantle with big eyes, a beak, and eight curling arms resting on the floor.",
};

export default function octopus() {
  const b = createBuilder({ name: "octopus", detail: 1, paintSize: 1024 });

  // Root bone: the mantle's centre, about 0.36 m above the floor.
  b.joint("body", { at: [0, 0.36, 0], dir: [0, 1, 0] });

  // One paint for the whole animal: dark rust body with warm spots.
  const skin = spots("#8a3b2c", ["#f0b43c", "#e89a3a"], { size: 0.1, amount: 0.4, seed: 3 });

  // Mantle: a bulbous lathe, fatter at the top and tapering down to the arm roots.
  b.lathe(
    [
      [0, -0.16],
      [0.08, -0.14],
      [0.14, -0.06],
      [0.16, 0.04],
      [0.14, 0.14],
      [0.09, 0.22],
      [0, 0.25],
    ],
    { name: "mantle", color: skin, at: [0, 0.36, 0], segments: 12 },
  );

  // Big eyes with pupils, set on the front of the mantle.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.04, b.segments(12), b.segments(8)), "#f4f0e4", {
      at: [s * 0.1, 0.39, 0.12],
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.021, b.segments(8), b.segments(6)), "#15100c", {
      at: [s * 0.1, 0.39, 0.155],
      name: `pupil${side}`,
    });
  }

  // Beak, hidden in the middle of the arm roots.
  b.spike([0, 0.225, 0], [0, 0.16, 0], null, 0.022, { color: "#2b1b16", name: "beak" });

  // Eight arms radiating from under the mantle. They drop to the floor and curl, alternating direction.
  const ARMS = 8;
  for (let k = 0; k < ARMS; k++) {
    const theta = (k / ARMS) * Math.PI * 2;
    const curl = k % 2 ? 1 : -1;
    const points = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      const radius = 0.08 + 0.42 * t;
      const angle = theta + curl * 2.2 * t * t;
      const y = 0.012 + 0.223 * (1 - t) * (1 - t);
      return [radius * Math.sin(angle), y, radius * Math.cos(angle)] as [number, number, number];
    });
    const path = catmull(points);
    const chain = b.chain(`arm${k}`, path, {
      count: 4,
      role: "tentacle",
      names: (i: number) => `arm${k}_${i}`,
    });
    b.sweep(chain, (t: number) => 0.045 * (1 - t) + 0.012 * t, {
      name: `arm${k}`,
      color: skin,
      caps: { start: "round", end: "point" },
      sectors: [[120, 240, "#f3dcc0"]],
    });
  }

  return b.root;
}
```