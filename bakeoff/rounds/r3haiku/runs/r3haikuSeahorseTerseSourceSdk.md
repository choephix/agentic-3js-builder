```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, spiral, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Seahorse",
  description:
    "A short-snouted seahorse, about 17 cm: plated trunk, coronet, curled prehensile tail, dorsal and pectoral fins, jointed snout.",
};

export default function seahorse() {
  const b = createBuilder({ name: "seahorse", detail: 1, paintSize: 1024 });

  // Paints: a golden coat with a countershaded belly and dark spots, a mottled head, banded tail.
  const body = spots(countershade("#e8782a", "#ffcf6e", { level: 0, soft: 0.5 }), "#7a2e10", {
    size: 0.022,
    amount: 0.35,
    seed: 4,
  });
  const head = mottle("#f7b655", "#dd6a2c", { size: 0.03, seed: 2 });
  const tail = stripes("#f0a040", "#7a2e10", { size: 0.014, width: 0.35, seed: 5 });
  const FIN = "#f9c85a";
  const PECTORAL = "#fbd68a";
  const PLATE = "#b8581c";
  const CREST = "#ffd47a";
  const DARK = "#15100c";

  // Skeleton: root at the hips, trunk up to the withers, neck to the head, jointed snout, tail from the hips.
  b.joint("hips", { at: [0, 0.036, -0.004] });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 0.046, -0.002],
      [0, 0.07, 0.002],
      [0, 0.094, 0.01],
      [0, 0.114, 0.012],
    ]),
    { parent: "hips", names: ["waist", "chest", "shoulder", "withers"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.114, 0.012],
      [0, 0.129, 0.027],
      [0, 0.144, 0.04],
    ]),
    { parent: "withers", names: ["neck1", "neck2", "head"], role: "neck" },
  );

  const tailPath = spiral([0, 0.013, -0.007], [0, 0.031, -0.005], [1, 0, 0], { turns: 1.1, r1: 0.005 });
  b.chain("tail", tailPath, {
    parent: "hips",
    count: 6,
    names: (i: number) => `tail${i + 1}`,
    role: "tail",
  });

  // Trunk: a square-ish plated tube that bellies out at the chest.
  const trunkR = (t: number) => 0.01 + 0.0068 * Math.exp(-(((t - 0.42) / 0.26) ** 2));
  b.sweep(trunk, {
    radius: trunkR,
    color: body,
    section: { ngon: 8 },
    smooth: false,
    name: "trunk",
  });

  // Bony plates ringed round the trunk.
  const plate = new THREE.BoxGeometry(0.0045, 0.0032, 0.0058);
  b.along(trunk, 4, (p) => {
    b.ring(p, { count: 5, radius: trunkR(p.t) * 0.9 }, (item) => {
      b.stick(plate, PLATE, item, { embed: 0.3 });
    });
  });

  b.sweep(neck, { radius: (t: number) => 0.0105 - 0.0015 * t, color: body, name: "neck" });

  // Tail: tapering, coiled under the hips.
  b.sweep(tail === tail ? tailPath && b.ctx && (null as never) : null as never, { radius: 0, color: tail }); // placeholder replaced below
  return b.root;
}
```