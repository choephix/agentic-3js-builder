import * as THREE from "three";
import { createBuilder, countershade, rng, spots } from "../../../../src/index";

export const meta = {
  name: "Red rock crab",
  description: "A feisty brick-red rock crab with one oversized raised claw, eight pointed legs and a barnacle and seaweed on its shell.",
};

const SHELL_BASE = countershade("#a83a2a", "#e6b98a", { level: 0.1, soft: 0.4 });
const SHELL = spots(SHELL_BASE, ["#f08a2c", "#f3e4c4"], { size: 0.07, amount: 0.4, seed: 4 });
const LEG = "#7a2a1e";
const CLAW = "#b5402e";
const DARK = "#2a1410";
const CREAM = "#f3e4c4";
const ORANGE = "#f08a2c";
const WEED = "#4f7a2c";

type V = [number, number, number];

export default function crab() {
  const b = createBuilder({ name: "red-rock-crab", detail: 1 });

  // Body: one root joint so every part rides the body.
  const body = b.joint("body", { at: [0, 0.2, 0] });

  // Shell: a wide squashed dome carrying the speckled paint.
  const shell = b.part(new THREE.SphereGeometry(0.26, b.segments(16), b.segments(10)), SHELL, {
    bone: body,
    at: [0, 0.2, 0],
    scale: [1, 0.38, 0.74],
  });
  const top = b.surface(shell);

  // Knobbly bumps scattered over the upper shell.
  const knobs = top.scatter(16, {
    rng: rng(3),
    minDist: 0.07,
    filter: (h) => h.at.y > 0.22 && h.at.z > -0.12,
  });
  knobs.forEach((h, i) => {
    b.stick(new THREE.SphereGeometry(0.03, b.segments(6), b.segments(4)), i % 2 ? CREAM : ORANGE, h, {
      embed: 0.35,
      name: `knob${i}`,
    });
  });

  // A tiny barnacle on the back of the shell.
  const barnacleSpot = top.nearest([0.06, 0.27, -0.14]);
  b.stick(new THREE.ConeGeometry(0.018, 0.014, b.segments(6)), "#efe6cf", barnacleSpot, {
    embed: 0.3,
    name: "barnacle",
  });

  // A strand of seaweed clinging to the back of the shell, with one frond.
  const weedRoot = top.nearest([-0.1, 0.27, -0.12]);
  b.sweep(
    [weedRoot, [-0.13, 0.36, -0.15], [-0.11, 0.44, -0.2], [-0.16, 0.5, -0.22]],
    (t: number) => 0.009 * (1 - 0.6 * t),
    { color: WEED, caps: { end: "point" }, name: "seaweed" },
  );
  b.slab([weedRoot, [-0.13, 0.36, -0.14], [-0.2, 0.34, -0.14]], {
    color: "#6a9a3a",
    thickness: 0.004,
    name: "frond",
  });

  // Eyes on stalks.
  for (const s of [1, -1]) {
    b.rod([s * 0.08, 0.28, 0.17], [s * 0.09, 0.4, 0.22], 0.012, { color: LEG, name: `stalk${s > 0 ? "L" : "R"}` });
    b.part(new THREE.SphereGeometry(0.035, b.segments(8), b.segments(6)), "#f4efe0", {
      bone: body,
      at: [s * 0.09, 0.42, 0.23],
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.016, b.segments(6), b.segments(4)), "#16100c", {
      bone: body,
      at: [s * 0.09, 0.42, 0.258],
      name: "pupil",
    });
  }

  // Eight jointed walking legs, four a side, each with a pointed tip on the floor.
  const zs = [0.1, 0.0, -0.1, -0.2];
  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;
    zs.forEach((z, i) => {
      const pts: V[] = [
        [0.2, 0.2, z],
        [0.36, 0.3, z * 1.5 + 0.02],
        [0.5, 0.12, z * 1.8],
        [0.56, 0.0, z * 2.0],
      ].map(([x, y, zz]) => [s * x, y, zz] as V);
      const leg = b.chain(`leg${side}${i}`, pts, {
        parent: body,
        names: [`hip${side}${i}`, `knee${side}${i}`, `foot${side}${i}`],
        role: "leg",
        group: "legs",
      });
      b.sweep(leg, (t: number) => 0.03 * (1 - 0.85 * t), {
        color: LEG,
        caps: { end: "point" },
        name: `leg${side}${i}`,
      });
    });
  }

  // Arms with pincers: one oversized raised claw and a small nipper.
  const claw = (side: "L" | "R", s: number, k: number, arm: V[], wristLeft: V) => {
    const mirror = (p: V): V => [s * p[0], p[1], p[2]];
    const q = (o: V): V => mirror([wristLeft[0] + o[0] * k, wristLeft[1] + o[1] * k, wristLeft[2] + o[2] * k]);
    const chain = b.chain(`arm${side}`, arm.map(mirror), {
      parent: body,
      names: [`upperArm${side}`, `forearm${side}`, `wrist${side}`],
      role: "arm",
      group: "arms",
    });
    const wrist = chain.joints[chain.joints.length - 1];
    const radius = (t: number) => (0.035 - 0.02 * t) * k;

    // Upper pincer, with a dark tip on its last stretch.
    const upper: V[] = [q([0, 0, 0]), q([0.06, 0.08, 0.08]), q([0.12, 0.12, 0.14])];
    b.sweep(upper, radius, { color: CLAW, bone: wrist, caps: { end: "point" }, name: `pincerUpper${side}` });
    b.sweep(upper, radius, { color: DARK, bone: wrist, from: 0.7, to: 1, caps: { end: "point" }, name: `tipUpper${side}` });

    // Lower pincer, with a dark tip.
    const lower: V[] = [q([0, 0, 0]), q([0.05, 0.03, 0.1]), q([0.11, 0.06, 0.2])];
    b.sweep(lower, radius, { color: CLAW, bone: wrist, caps: { end: "point" }, name: `pincerLower${side}` });
    b.sweep(lower, radius, { color: DARK, bone: wrist, from: 0.7, to: 1, caps: { end: "point" }, name: `tipLower${side}` });

    // Little teeth on the inner edges of the pincers.
    for (const o of [
      [0.03, 0.04, 0.04],
      [0.09, 0.1, 0.11],
    ] as V[]) {
      const base = q(o);
      b.spike([base[0], base[1] - 0.025 * k, base[2]], [0, -1, 0.3], 0.02 * k, 0.008 * k, { color: DARK, name: "tooth" });
    }
    for (const o of [
      [0.025, 0.015, 0.05],
      [0.08, 0.045, 0.15],
    ] as V[]) {
      const base = q(o);
      b.spike([base[0], base[1] + 0.02 * k, base[2]], [0, 1, 0], 0.02 * k, 0.008 * k, { color: DARK, name: "tooth" });
    }
  };

  claw(
    "L",
    1,
    1,
    [
      [0.2, 0.26, 0.16],
      [0.34, 0.36, 0.26],
      [0.4, 0.55, 0.34],
    ],
    [0.4, 0.55, 0.34],
  );
  claw(
    "R",
    -1,
    0.55,
    [
      [0.2, 0.26, 0.16],
      [0.32, 0.3, 0.28],
      [0.36, 0.34, 0.36],
    ],
    [0.36, 0.34, 0.36],
  );

  return b.root;
}
