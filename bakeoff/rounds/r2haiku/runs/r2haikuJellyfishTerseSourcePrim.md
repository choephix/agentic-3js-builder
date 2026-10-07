```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Jellyfish",
  description: "A translucent spotted bell with a glowing core, a rim of sixteen tentacles and four frilled oral arms.",
};

export default function jellyfish() {
  const b = createBuilder({ name: "jellyfish", detail: 1, paintSize: 1024 });
  const random = rng(7);

  // Bell origin sits at the rim. The bell rises from y = BELL_Y, tentacles hang from it to the floor.
  const BELL_Y = 0.2;
  const bell = b.joint("bell", { at: [0, BELL_Y, 0] });

  // Bell: pink spotted crown fading to a cool blue rim.
  const bellPaint = gradient(
    spots("#ffd6ef", ["#ff6fb5", "#8fe7ff", "#fff1a8"], { size: 0.045, amount: 0.35, rosette: true, seed: 3 }),
    "#7fd3ff",
    [0, BELL_Y + 0.13, 0],
    [0, BELL_Y + 0.01, 0],
  );
  const tentaclePaint = gradient("#ffe6f4", "#ff4fa0", [0, BELL_Y, 0], [0, 0.02, 0]);

  // The dome: a lathe of a half-profile (x = distance from the axis, y = height above the rim).
  b.lathe(
    [
      [0, 0],
      [0.135, 0],
      [0.13, 0.04],
      [0.1, 0.09],
      [0.05, 0.12],
      [0, 0.13],
    ],
    { name: "bell", color: bellPaint, at: [0, BELL_Y, 0], axis: [0, 1, 0], segments: 16, bone: bell },
  );

  // Glowing core inside the crown.
  b.part(new THREE.SphereGeometry(0.035, b.segments(10), b.segments(7)), "#fff4b0", {
    name: "core",
    at: [0, BELL_Y + 0.07, 0],
    bone: bell,
  });

  // Ruffled rim lip.
  b.part(new THREE.TorusGeometry(0.135, 0.008, 6, b.segments(20)), "#ff8fd0", {
    name: "rim",
    at: [0, BELL_Y, 0],
    rotation: [90, 0, 0],
    bone: bell,
  });

  // Sixteen tentacles, each a four-joint chain that tapers to a fine tip on the floor.
  const count = 16;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.2;
    const reach = 0.13 + random() * 0.035;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Lateral sway: a little sideways drift grows toward the tip.
    const at = (r: number, y: number, k: number) => {
      const w = (random() - 0.5) * 0.035 * k;
      return [cos * r - sin * w, y, sin * r + cos * w] as [number, number, number];
    };
    const path = catmull([
      at(0.09, BELL_Y - 0.01, 0),
      at(0.14, BELL_Y - 0.07, 1),
      at(reach, 0.12, 2),
      at(reach * 1.04, 0.06, 3),
      at(reach * 1.08, 0.003, 4),
    ]);
    const chain = b.chain(`tent${i}`, path, {
      parent: bell,
      count: 4,
      names: (k: number) => `t${i}j${k}`,
      role: "tentacle",
    });
    b.sweep(chain, (t: number) => 0.011 * (1 - 0.75 * t) + 0.0025, {
      name: `tentacle${i}`,
      color: tentaclePaint,
      sides: 6,
    });
  }

  // Four frilly oral arms under the crown, reaching down to the floor.
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + (i * Math.PI) / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const path = catmull([
      [cos * 0.03, BELL_Y - 0.01, sin * 0.03],
      [cos * 0.05, BELL_Y - 0.09, sin * 0.05],
      [cos * 0.075, BELL_Y - 0.14, sin * 0.075],
      [cos * 0.09, 0.003, sin * 0.09],
    ]);
    const chain = b.chain(`oral${i}`, path, {
      parent: bell,
      count: 3,
      names: (k: number) => `o${i}j${k}`,
      role: "tentacle",
    });
    b.sweep(
      chain,
      (t: number) => 0.02 - 0.011 * t + 0.0035 * Math.max(0, Math.sin(t * Math.PI * 5)),
      { name: `oral${i}`, color: "#ffa6d6", sides: 8 },
    );
  }

  return b.root;
}
```