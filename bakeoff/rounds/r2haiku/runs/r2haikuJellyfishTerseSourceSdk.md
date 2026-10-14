```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, gradient, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Jellyfish",
  description: "A stylised moon-jelly: a glowing domed bell with spotted paint, a pink core, a ring of nerve beads, ten trailing tentacles and four frilly oral arms. About 0.82 m tall.",
};

export default function jellyfish() {
  const b = createBuilder({ name: "jellyfish", paintSize: 1024 });
  const random = rng(7);

  // Root joint: the bell's centre, at the rim height.
  const bell = b.joint("bell", { at: [0, 0.62, 0], dir: [0, 1, 0] });

  // Bell: a translucent-looking dome, cyan at the rim to violet at the crown, dotted with yellow spots.
  const bellPaint = spots(
    gradient("#7fe3ff", "#c58bff", [0, 0.62, 0], [0, 0.84, 0]),
    "#fff07a",
    { size: 0.07, amount: 0.3, seed: 3 },
  );
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.165, 0.03],
      [0.15, 0.09],
      [0.11, 0.15],
      [0.06, 0.19],
      [0, 0.2],
    ],
    { color: bellPaint, at: [0, 0.62, 0], axis: [0, 1, 0], segments: 16, bone: bell, name: "bell" },
  );

  // Pink gonads: a flat disc tucked under the crown of the bell.
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.11, 0.012],
      [0, 0.012],
    ],
    { color: "#ff7ab8", at: [0, 0.612, 0], axis: [0, 1, 0], segments: 16, bone: bell, name: "gonads" },
  );

  // Nerve ring: a ring of small glowing beads round the rim.
  b.ring(frame([0, 0.618, 0], [0, 1, 0]), { count: 16, radius: 0.158 }, (item) => {
    b.stick(new THREE.SphereGeometry(0.011, 8, 6), "#fff6b0", item, { embed: 0.5, bone: bell });
  });

  // Tentacles: ten trailing strands, each a chain of joints swept into a tapering tube.
  const tentaclePaint = gradient("#c8f6ff", "#6a7bff", [0, 0.6, 0], [0, 0.02, 0]);
  const count = 10;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.2;
    const reach = 0.14 + random() * 0.05;
    const sway = (random() - 0.5) * 0.05;
    const sx = Math.sin(a);
    const sz = Math.cos(a);
    const at = (r: number, y: number, s = 0): [number, number, number] => [sx * r - sz * s, y, sz * r + sx * s];
    const pts = [
      at(0.13, 0.6),
      at(0.17, 0.44),
      at(reach * 0.9, 0.28, sway),
      at(reach, 0.12, sway * 2),
      at(reach + 0.035, 0.0, sway * 3),
    ];
    const chain = b.chain(`tent${i}`, catmull(pts), { parent: bell, role: "tentacle" });
    b.sweep(chain, { radius: (t: number) => 0.012 - 0.008 * t, color: tentaclePaint, sides: 8 });
  }

  // Oral arms: four frilly ribbons hanging from the mouth under the bell.
  const oralPaint = gradient("#ffd0ec", "#ff5fa2", [0, 0.56, 0], [0, 0.04, 0]);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const pts: Array<[number, number, number]> = [
      [dx * 0.02, 0.57, dz * 0.02],
      [dx * 0.06, 0.4, dz * 0.06],
      [dx * 0.08, 0.2, dz * 0.08],
      [dx * 0.09, 0.0, dz * 0.09],
    ];
    const chain = b.chain(`oral${k}`, catmull(pts), { parent: bell, role: "tentacle" });
    b.sweep(chain, { radius: (t: number) => 0.02 - 0.008 * t, color: oralPaint, sides: 8 });
  }

  return b.root;
}
```