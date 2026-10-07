```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "octopus",
  description: "A mottled plum-and-rose octopus with a bulbous mantle, two round eyes and eight suckered arms curled on the floor.",
};

const PLUM = "#5b2a6e";
const ROSE = "#d9557a";
const PALE = "#f2c9d6";
const WHITE = "#fbf7ef";
const BLACK = "#15101a";
const BEAK = "#3b2a1e";

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const rand = rng(7);

  const coat = countershade(mottle(PLUM, ROSE, { size: 0.12, contrast: 0.6, seed: 4 }), PALE, { level: -0.25 });
  const armPaint = countershade(spots(PLUM, ROSE, { size: 0.07, amount: 0.35, seed: 9 }), PALE, { level: -0.25 });

  // Skeleton: a root at the heart of the body, a mantle chain above it.
  const core = b.joint("core", { at: [0, 0.3, 0] });

  const mantle = b.chain("mantle", catmull([
    [0, 0.22, 0],
    [0, 0.45, 0],
    [0, 0.7, -0.03],
  ]), { parent: core, names: ["mantleLow", "mantleHigh"], role: "spine" });

  // Bulbous mantle: round at the base and dome at the top.
  const body = b.sweep(mantle, (t) => 0.1 + 0.16 * Math.pow(Math.sin(Math.PI * t), 0.6), {
    color: coat,
    caps: "round",
  });

  // Big round eyes on the sides of the mantle.
  for (const s of [1, -1]) {
    const eye = b.surface(body).around([0, 0.42, 0]).at(s * 78, 8);
    if (!eye) continue;
    b.stick(new THREE.SphereGeometry(0.055, 10, 8), WHITE, eye, { embed: 0.4 });
    b.stick(new THREE.SphereGeometry(0.028, 8, 6), BLACK, eye.moved([0, 0.052, 0]), { embed: 0.5 });
  }

  // Small beak tucked under the mantle, between the arm roots.
  const beak = b.surface(body).nearest([0, 0.14, 0]);
  if (beak) b.stick(new THREE.ConeGeometry(0.02, 0.05, 6), BEAK, beak, { embed: 0.2 });

  // Eight arms radiating from the underside, curling up at the tips.
  for (let i = 0; i < 8; i++) {
    const th = ((i * 45 + 22.5) * Math.PI) / 180;
    const dx = Math.sin(th);
    const dz = Math.cos(th);
    const sx = dz;
    const sz = -dx;
    const curl = i % 2 ? 1 : -1;
    const jitter = 0.97 + rand() * 0.06;

    const P = (r: number, y: number, side = 0): [number, number, number] => [
      (dx * r + sx * side) * jitter,
      y,
      (dz * r + sz * side) * jitter,
    ];

    const pts = [
      P(0.08, 0.2),
      P(0.22, 0.1),
      P(0.42, 0.05),
      P(0.6, 0.05),
      P(0.7, 0.06, 0.05 * curl),
      P(0.7, 0.11, (0.13 + rand() * 0.03) * curl),
    ];

    const arm = b.chain(`arm${i}`, catmull(pts), { parent: core, count: 6, role: "arm" });
    const sw = b.sweep(arm, (t) => 0.056 * (1 - t) + 0.012, { color: armPaint });

    // Two rows of suckers on the underside of each arm.
    for (let k = 0; k < 7; k++) {
      const t = 0.14 + k * 0.12;
      for (const deg of [150, 210]) {
        const hit = sw.at(t, deg);
        b.stick(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 7), PALE, hit, { embed: 0.3 });
      }
    }
  }

  return b.root;
}
```