The module below builds the forest spirit from primitives: a stone body with moss, a wooden mask face with glowing eyes, branching antlers with flowers and leaves, slender wooden legs ending in hooves, and fireflies around the head.

```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mottle, noise, paint, rng } from "agentic-3js-builder";

export const meta = {
  name: "Forest spirit",
  description:
    "A small deer-like forest spirit: a river-stone body under soft moss, slender wooden legs and hooves, " +
    "antlers sprouting white flowers and leaves, a pale wooden mask with glowing green eyes, and fireflies.",
};

const LEAF = [
  [0, 0, "sharp"],
  [0.035, 0.014],
  [0.07, 0],
  [0.035, -0.014],
];

export default function build() {
  const b = createBuilder({ name: "forest-spirit", paintSize: 1024 });

  // Paints
  const stone = mottle("#6f756f", "#8d9289", { size: 0.2, seed: 2 });
  const moss = mottle("#3d7a36", "#7bb34a", { size: 0.09, seed: 5, contrast: 1.4 });
  const bodyPaint = paint((p, n) =>
    n.y + 0.4 * (noise(p, 0.25, 8) - 0.5) > 0.15 ? moss : stone,
  );
  const bark = grain("#b08f62", "#7d5f3c", { size: 0.03, axis: "y", seed: 3 });
  const mask = grain("#ecdcbc", "#c9b28a", { size: 0.03, axis: "y", seed: 4 });
  const hoof = "#2e241c";
  const eyeGlow = "#a6ff6e";
  const white = "#fbf7ee";
  const tuftGreen = "#4f8f3a";
  const leafGreen = "#6fb34f";
  const fly = "#f2ff8a";

  // Skeleton: hips root, spine to chest, neck to head
  const hips = b.joint("hips", { at: [0, 0.98, -0.42] });
  const spine = b.chain("spine", [[0, 0.98, -0.42], [0, 1.02, 0.0], [0, 1.04, 0.4]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 1.04, 0.4], [0, 1.22, 0.5], [0, 1.4, 0.6]], {
    parent: "chest",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const head = b.joint("head", { at: [0, 1.4, 0.6] });

  // Body: a stone barrel with a rounded bulge
  const bulge = (t: number) => {
    const k = Math.sin(Math.PI * Math.min(Math.max(t, 0), 1));
    return [0.15 + 0.06 * k, 0.16 + 0.07 * k] as [number, number];
  };
  const body = b.sweep(spine, bulge, { color: bodyPaint, name: "body", sides: 10 });

  // Neck and head
  b.sweep(neck, [0.1, 0.085, 0.07], { color: bodyPaint, name: "neck", sides: 8 });
  b.part(new THREE.SphereGeometry(0.12, b.segments(12), b.segments(8)), bodyPaint, {
    at: [0, 1.4, 0.6],
    bone: "head",
    scale: [0.95, 1.05, 1.05],
    name: "skull",
  });

  // Pale wooden mask with glowing eyes
  b.part(new THREE.SphereGeometry(0.1, b.segments(12), b.segments(10)), mask, {
    at: [0, 1.4, 0.7],
    bone: "head",
    scale: [0.95, 1.1, 0.55],
    name: "mask",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), eyeGlow, {
      at: [s * 0.04, 1.41, 0.735],
      bone: "head",
      name: s > 0 ? "eyeL" : "eyeR",
    });
  }

  // Antlers: a beam from the head, two tines each, flowers and leaves
  const antler = (s: number, tag: string) => {
    const beamPath = catmull([
      [s * 0.06, 1.5, 0.62],
      [s * 0.12, 1.64, 0.62],
      [s * 0.22, 1.76, 0.56],
    ]);
    const beam = b.sprout(`antler${tag}`, head, beamPath, [0.024, 0.013, 0.006], {
      color: bark,
      sides: 6,
    });
    b.stick(new THREE.SphereGeometry(0.016, b.segments(6), b.segments(4)), white, beam.sweep.at(0.3, 200), {
      embed: 0.3,
    });
    b.stick(new THREE.SphereGeometry(0.014, b.segments(6), b.segments(4)), white, beam.sweep.at(0.65, 20), {
      embed: 0.3,
    });

    const tines: Array<[number, number, number]> = [
      [0.45, 90, 0.12],
      [0.85, -70, 0.1],
    ];
    tines.forEach(([t, deg, len], k) => {
      const base = beam.sweep.at(t, deg);
      const tip = base.moved({ up: len, left: s * 0.04 });
      b.sprout(`tine${tag}${k + 1}`, base, tip, 0.011, { color: bark, sides: 6 });
      b.stick(new THREE.SphereGeometry(0.016, b.segments(6), b.segments(4)), white, tip, { embed: 0.2 });
      b.extrude(LEAF, {
        color: leafGreen,
        at: tip.moved({ up: 0.01 }),
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.004,
        smoothing: 1,
        name: `leaf${tag}${k + 1}`,
      });
    });
  };
  antler(1, "L");
  antler(-1, "R");

  // Legs: slender wooden legs with hooves
  const leg = (name: string, pts: number[][], parent: string) => {
    const chain = b.chain(name, pts, {
      parent,
      names: [`${name}1`, `${name}2`, `${name}3`, `${name}Hoof`],
      role: "leg",
    });
    b.sweep(chain, [0.045, 0.03, 0.022, 0.02], { color: bark, sides: 6, name: name });
    const end = pts[pts.length - 1];
    b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.05, b.segments(6)), hoof, {
      at: [end[0], 0.025, end[2]],
      bone: `${name}Hoof`,
      name: `hoof${name}`,
    });
  };
  leg("legFL", [[0.12, 0.98, 0.22], [0.12, 0.52, 0.3], [0.12, 0.16, 0.3], [0.12, 0.05, 0.3]], "chest");
  leg("legFR", [[-0.12, 0.98, 0.22], [-0.12, 0.52, 0.3], [-0.12, 0.16, 0.3], [-0.12, 0.05, 0.3]], "chest");
  leg("legHL", [[0.13, 0.98, -0.4], [0.13, 0.56, -0.32], [0.13, 0.3, -0.5], [0.13, 0.05, -0.42]], "hips");
  leg("legHR", [[-0.13, 0.98, -0.4], [-0.13, 0.56, -0.32], [-0.13, 0.3, -0.5], [-0.13, 0.05, -0.42]], "hips");

  // Moss tufts and small white flowers scattered over the body
  const hits = b.surface(body).scatter(18, {
    rng: rng(7),
    minDist: 0.09,
    filter: (h) => h.n.y > -0.3,
  });
  hits.forEach((h, i) => {
    if (i % 3 === 0)
      b.stick(new THREE.SphereGeometry(0.02, b.segments(6), b.segments(4)), white, h, { embed: 0.4 });
    else b.stick(new THREE.ConeGeometry(0.03, 0.08, b.segments(5)), tuftGreen, h, { embed: 0.3 });
  });

  // Fireflies circling the head
  const flies: number[][] = [
    [0.2, 1.55, 0.8],
    [-0.22, 1.42, 0.85],
    [0.1, 1.7, 0.9],
    [-0.15, 1.62, 0.45],
    [0.3, 1.3, 0.7],
  ];
  flies.forEach((at, i) =>
    b.part(new THREE.SphereGeometry(0.014, b.segments(6), b.segments(4)), fly, {
      at,
      bone: "head",
      name: `firefly${i + 1}`,
    }),
  );

  return b.root;
}
```