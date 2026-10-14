```ts
import * as THREE from "three";
import { catmull, createBuilder, rng, spots } from "agentic-3js-builder";

export const meta = {
  name: "Red rock crab",
  description: "A feisty brick-red rock crab with knobbly speckled shell, eyes on stalks, eight pointed walking legs and one oversized claw raised in challenge.",
};

const BRICK = "#9b3a24";
const ORANGE = "#e27a3a";
const CREAM = "#efdcb4";
const LEG = "#8a2f1c";
const CLAW = "#a8402a";
const DARK = "#2a1812";
const TEETH = "#3b2a22";
const WEED = "#5b8f3c";

// Carapace: an ellipsoid centred on (0, SH.c, 0), half-sizes rx, ry, rz.
const SH = { c: 0.07, rx: 0.138, ry: 0.05, rz: 0.094 };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerp = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** A point on the carapace: th from the top, ph round from the front (0) toward the sides. */
const onShell = (th: number, ph: number) =>
  V(SH.rx * Math.sin(th) * Math.sin(ph), SH.c + SH.ry * Math.cos(th), SH.rz * Math.sin(th) * Math.cos(ph));

export default function crab() {
  const b = createBuilder({ name: "rock-crab", paintSize: 1024 });

  // Skeleton root, under the shell.
  b.joint("body", { at: [0, 0.07, 0] });

  // Carapace: a wide flattened dome, speckled in orange and cream.
  b.part(
    new THREE.SphereGeometry(0.12, b.segments(18), b.segments(12)),
    spots(BRICK, [ORANGE, CREAM], { size: 0.04, amount: 0.4, seed: 4 }),
    { bone: "body", at: [0, SH.c, 0], scale: [1.15, 0.42, 0.78] },
  );
  // Pale underside peeking out below the shell.
  b.part(new THREE.SphereGeometry(0.09, b.segments(12), b.segments(8)), "#b5603a", {
    bone: "body",
    at: [0, 0.05, 0],
    scale: [1.1, 0.3, 0.8],
  });

  // Knobs across the shell.
  const knobs = rng(7);
  for (let k = 0; k < 16; k++) {
    const th = 0.3 + knobs() * 0.9;
    const ph = (knobs() - 0.5) * 2.6;
    const size = 0.009 + knobs() * 0.008;
    const colour = knobs() < 0.5 ? ORANGE : CREAM;
    b.part(new THREE.SphereGeometry(size, b.segments(6), b.segments(4)), colour, {
      bone: "body",
      at: onShell(th, ph),
    });
  }

  // Front spines on the carapace edge.
  const centre = V(0, SH.c, 0);
  for (const [th, ph] of [
    [1.45, 0.9],
    [1.45, -0.9],
    [1.25, 1.6],
    [1.25, -1.6],
  ]) {
    const base = onShell(th, ph);
    const dir = base.clone().sub(centre).normalize();
    b.spike(base, dir, 0.028, 0.011, { color: "#d8b98a", bone: "body" });
  }

  // Mouth.
  b.part(new THREE.SphereGeometry(0.035, b.segments(8), b.segments(6)), "#d69a6c", {
    bone: "body",
    at: [0, 0.04, 0.085],
    scale: [1.4, 0.45, 0.7],
  });

  // Eyes on stalks.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const stalkBase = [0.05 * s, 0.1, 0.1];
    const stalkTip = [0.07 * s, 0.17, 0.13];
    b.joint(`eye${side}`, { parent: "body", at: stalkBase, aim: stalkTip });
    b.rod(stalkBase, stalkTip, [0.011, 0.009], { color: CLAW, bone: `eye${side}` });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), "#f3ead2", {
      bone: `eye${side}`,
      at: [0.07 * s, 0.178, 0.135],
    });
    b.part(new THREE.SphereGeometry(0.009, b.segments(6), b.segments(5)), "#15100d", {
      bone: `eye${side}`,
      at: [0.075 * s, 0.185, 0.15],
    });
  }

  // Eight walking legs, four per side, each a three-joint chain ending in a pointed tip.
  const hips = [0.05, 0.0, -0.05, -0.095];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    hips.forEach((hz, i) => {
      const hip = [0.085 * s, 0.06, hz];
      const knee = [0.2 * s, 0.135 - 0.005 * i, hz + 0.02];
      const tip = [(0.28 + 0.02 * (i % 2)) * s, 0.006, hz - 0.06];
      const name = `leg${side}${i + 1}`;
      const leg = b.chain(name, [hip, knee, tip], {
        parent: "body",
        names: [`${name}A`, `${name}K`, `${name}T`],
        role: "leg",
      });
      b.sweep(leg, (t: number) => 0.0135 - 0.0065 * t, {
        color: LEG,
        caps: { start: "round", end: "point" },
      });
    });
  }

  // The raised claw arm: shoulder, elbow, wrist.
  const shoulder = [0.12, 0.09, 0.08];
  const elbow = [0.22, 0.2, 0.16];
  const wrist = [0.2, 0.3, 0.28];
  const arm = b.chain("clawArm", [shoulder, elbow, wrist], {
    parent: "body",
    names: ["armS", "armE", "armW"],
    role: "arm",
  });
  b.sweep(arm, (t: number) => 0.022 - 0.007 * t, { color: CLAW });

  // Palm.
  b.part(new THREE.SphereGeometry(0.05, b.segments(14), b.segments(10)), CLAW, {
    bone: "armW",
    at: [0.2, 0.3, 0.31],
    scale: [1.0, 0.9, 1.15],
  });

  // Pincers: upper and lower fingers, each with a dark tip and little teeth on the inner edge.
  const UP_A = [0.2, 0.33, 0.34];
  const UP_T = [0.21, 0.37, 0.5];
  const LO_A = [0.2, 0.27, 0.34];
  const LO_T = [0.205, 0.24, 0.5];
  b.joint("pinchU", { parent: "armW", at: UP_A, aim: UP_T });
  b.joint("pinchL", { parent: "armW", at: LO_A, aim: LO_T });
  b.rod(UP_A, UP_T, [0.03, 0.01], {
    bands: [
      [0.7, CLAW],
      [1, DARK],
    ],
    bone: "pinchU",
    caps: { start: "round", end: "point" },
  });
  b.rod(LO_A, LO_T, [0.03, 0.01], {
    bands: [
      [0.7, CLAW],
      [1, DARK],
    ],
    bone: "pinchL",
    caps: { start: "round", end: "point" },
  });
  for (const t of [0.25, 0.45, 0.65]) {
    const r = 0.03 - 0.02 * t;
    for (const [A, T, bone, sign] of [
      [UP_A, UP_T, "pinchU", -1],
      [LO_A, LO_T, "pinchL", 1],
    ] as const) {
      const base = lerp(A, T, t).map((v, i) => (i === 1 ? v + sign * 0.9 * r : v));
      const tip = base.map((v, i) => (i === 1 ? v + sign * 0.012 : i === 2 ? v + 0.01 : v));
      b.spike(base, tip, null, 0.0065, { color: TEETH, bone });
    }
  }

  // A tiny barnacle on the back of the shell.
  b.part(new THREE.SphereGeometry(0.012, b.segments(6), b.segments(4)), "#ebe5d0", {
    bone: "body",
    at: onShell(0.95, Math.PI - 0.3),
    scale: [1, 0.6, 1],
  });

  // A strand of seaweed clinging to the back, with one leaf.
  const start = onShell(1.0, Math.PI - 0.45);
  const at = (d: number[]) => start.clone().add(V(d[0], d[1], d[2]));
  const weed = catmull([
    start,
    at([0.012, 0.035, -0.012]),
    at([0.02, 0.075, -0.03]),
    at([0.032, 0.12, -0.05]),
    at([0.028, 0.155, -0.07]),
  ]);
  b.sweep(weed, (t: number) => 0.0055 - 0.0025 * t, { color: WEED, bone: "body" });
  const q = at([0.012, 0.06, -0.035]);
  b.slab(
    [
      q,
      q.clone().add(V(0.03, 0.012, -0.012)),
      q.clone().add(V(0.04, 0.035, -0.02)),
      q.clone().add(V(0.02, 0.05, -0.024)),
    ],
    { color: "#6aa046", thickness: 0.002, bone: "body" },
  );

  return b.root;
}
```