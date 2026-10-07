```ts
import * as THREE from "three";
import { catmull, createBuilder, gradient, mix, paint, rng } from "agentic-3js-builder";
import type { Joint, OutlineInput } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description: "A phoenix rising with wings flung open, feathers blazing from crimson to gold, above a smouldering pyre.",
};

/** A flame-shaped plume: tall, with a sharp tip. Outline x is its width, y its height. */
function plume(len: number, wide: number): OutlineInput {
  return [
    [-0.5 * wide, 0],
    [0.5 * wide, 0.3 * len],
    [0.15 * wide, 0.6 * len],
    [0.5 * wide, len, "sharp"],
    [-0.3 * wide, 0.5 * len],
  ];
}

/** A flight feather or ribbon: rounded at the root, pointed at the tip. Outline x runs along its length. */
function vane(len: number, wide: number): OutlineInput {
  return [
    [0, -0.4 * wide],
    [0.25 * len, 0.5 * wide],
    [0.6 * len, 0.55 * wide],
    [0.85 * len, 0.3 * wide],
    [len, 0, "sharp"],
    [0.85 * len, -0.25 * wide],
    [0.5 * len, -0.4 * wide],
  ];
}

export default function phoenix() {
  const b = createBuilder({ name: "phoenix" });
  const gold = "#f5b10f";

  // Paints: crimson roots blazing to gold tips.
  const bodyPaint = gradient("#7d0f14", "#e0572a", [0, 1.0, -0.4], [0, 1.3, 0.25]);
  const tailPaint = gradient("#b3201a", "#ffd23e", [0, 1.04, -0.34], [0, 0.95, -1.2]);
  const crestPaint = gradient("#e0572a", "#ffd23e", [0, 1.4, 0.2], [0, 1.6, 0.1]);
  // Symmetric over both wings: crimson at the body, gold toward the tips.
  const wingPaint = paint((p) => {
    const t = Math.min(Math.max((Math.abs(p.x) - 0.15) / 0.85 + (p.y - 1.25) * 0.3, 0), 1);
    return mix("#8c1414", "#ffb52e", t);
  });

  // Body: a hip root, a curved spine running forward into the neck and head.
  b.joint("hips", { at: [0, 1.04, -0.36], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.04, -0.36],
      [0, 1.1, -0.12],
      [0, 1.16, 0.08],
      [0, 1.25, 0.2],
      [0, 1.32, 0.25],
    ]),
    { role: "spine", names: ["spine1", "spine2", "spine3", "spine4", "head"] },
  );
  b.sweep(spine, [0.03, 0.1, 0.12, 0.07, 0.085], { color: bodyPaint, name: "body" });

  // Head: amber eyes, a hooked golden beak and a crest of flame-shaped plumes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, b.segments(10), b.segments(8)), "#ffb000", {
      at: [0.065 * s, 1.345, 0.28],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(6), b.segments(5)), "#2a0a02", {
      at: [0.065 * s, 1.345, 0.305],
      bone: "head",
    });
  }
  b.sweep(
    catmull([
      [0, 1.33, 0.28],
      [0, 1.305, 0.345],
      [0, 1.26, 0.37],
      [0, 1.235, 0.335],
    ]),
    [0.035, 0.03, 0.02, 0.012],
    { color: gold, bone: "head", caps: "round", name: "beak" },
  );
  for (let k = 0; k < 5; k++) {
    const scale = [0.8, 1, 1.25, 1, 0.85][k];
    b.extrude(plume(0.22 * scale, 0.07), {
      color: crestPaint,
      at: [(k - 2) * 0.03, 1.38, 0.24 - Math.abs(k - 2) * 0.01],
      x: [1, 0, 0],
      y: [0, 1, -0.5],
      thickness: 0.012,
      bevel: 0.003,
      bone: "head",
      name: "crest",
    });
  }

  // Wings flung open: a jointed arm, a swept bone, primaries and secondaries.
  const wing = (side: 1 | -1) => {
    const S = side > 0 ? "L" : "R";
    const pt = (x: number, y: number, z: number): [number, number, number] => [x * side, y, z];
    const arm = b.chain(
      `wing${S}`,
      catmull([pt(0.1, 1.22, 0.04), pt(0.42, 1.38, 0.0), pt(0.78, 1.46, -0.1), pt(1.02, 1.4, -0.24)]),
      { role: "wing", names: [`wing${S}1`, `wing${S}2`, `wing${S}3`, `wing${S}Tip`] },
    );
    b.sweep(arm, [0.03, 0.025, 0.017, 0.011], { color: wingPaint, name: `arm${S}` });

    const feather = (p: THREE.Vector3, d: THREE.Vector3, len: number, wide: number, bone: Joint) => {
      const x = d.clone().normalize();
      const y = new THREE.Vector3(-x.z, 0.3, x.x).normalize();
      b.extrude(vane(len, wide), {
        color: wingPaint,
        at: p,
        x,
        y,
        thickness: 0.012,
        bevel: 0.004,
        bone,
        name: `feather${S}`,
      });
    };
    // Primaries stream out past the hand.
    for (let i = 0; i < 8; i++) {
      const t = 0.52 + i * 0.06;
      feather(
        arm.at(t).at,
        new THREE.Vector3(side, 0.04, -0.35 - 0.03 * i),
        0.42 - 0.02 * i,
        0.05,
        arm.jointAt(t),
      );
    }
    // Secondaries fan back along the arm.
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.06;
      feather(arm.at(t).at.add(new THREE.Vector3(0, -0.02, 0)), new THREE.Vector3(side * 0.5, 0.02, -1), 0.3, 0.07, arm.jointAt(t));
    }
    return arm;
  };
  const arms = [wing(1), wing(-1)];

  // Tail: a jointed chain of long ribbons of fire trailing behind.
  b.chain(
    "tail",
    catmull([
      [0, 1.04, -0.34],
      [0, 1.0, -0.62],
      [0, 0.96, -0.9],
    ]),
    { role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  for (let k = 0; k < 5; k++) {
    const off = (k - 2) * 0.05;
    const len = k % 2 === 0 ? 1.0 : 0.82;
    b.extrude(vane(len, 0.12), {
      color: tailPaint,
      at: [off, 1.04, -0.34],
      x: [off * 0.8, -0.14, -1],
      y: [0, 1, 0],
      thickness: 0.01,
      bone: "tail1",
      name: "ribbon",
    });
  }

  // Talons tucked under the belly.
  for (const s of [1, -1]) {
    b.capsule([0.06 * s, 1.0, -0.02], [0.08 * s, 0.9, 0.1], 0.018, { color: gold, name: "talon" });
  }

  // The pyre on the ground the phoenix rises from.
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.4, 0.05],
      [0.28, 0.13],
      [0.1, 0.17],
      [0, 0.18],
    ],
    { color: "#2a1610", at: [0, 0, 0], segments: 10, name: "pyre" },
  );
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const h = 0.3 + 0.15 * (i % 3);
    b.part(new THREE.ConeGeometry(0.07, h, b.segments(6)), i % 2 ? "#ff6a1a" : "#ffb83a", {
      at: [Math.sin(a) * 0.2, 0.12 + h / 2, Math.cos(a) * 0.2],
      name: "flame",
    });
  }
  b.part(new THREE.ConeGeometry(0.12, 0.55, b.segments(6)), "#ffc53a", {
    at: [0, 0.12 + 0.275, 0],
    name: "flame",
  });

  // Embers and sparks drifting off the wings.
  const r = rng(7);
  for (let i = 0; i < 30; i++) {
    const arm = arms[i % 2];
    const t = 0.2 + 0.8 * r();
    const p = arm.at(t).at.add(new THREE.Vector3((r() - 0.5) * 0.2, 0.05 + 0.3 * r(), (r() - 0.5) * 0.2));
    b.part(new THREE.SphereGeometry(0.011, b.segments(5), b.segments(4)), i % 3 ? "#ffb23a" : "#ff6a1a", {
      at: p,
      name: "ember",
    });
  }

  return b.root;
}
```