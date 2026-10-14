import * as THREE from "three";
import { createBuilder, rng, spots, catmull, offset } from "../../../../src/index";

export const meta = {
  name: "Red rock crab",
  description: "A feisty red rock crab with one oversized raised claw, eyes on stalks, eight walking legs and a barnacle and seaweed on its shell.",
};

// Palette
const BRICK = "#9e3b26";
const RED = "#b8432c";
const ORANGE = "#e0792b";
const CREAM = "#f1e2c2";
const DARK = "#2a1a14";
const LEG = "#7a2f20";
const GREEN = "#4f7a2e";
const BARNACLE = "#d9d0bd";
const EYE = "#fbf7ea";

export default function build() {
  const b = createBuilder({ name: "red_rock_crab" });
  const rand = rng(11);

  // Body root, sitting just above the floor on its legs
  const body = b.joint("body", { at: [0, 0.12, 0], role: "spine" });

  // Wide knobbly shell, speckled with a paint
  const shellPaint = spots(BRICK, ORANGE, { size: 0.05, amount: 0.35, seed: 4 });
  const shell = b.part(new THREE.SphereGeometry(0.18, 14, 9), shellPaint, {
    bone: body,
    at: [0, 0.12, 0],
    scale: [1.1, 0.42, 0.95],
  });

  // Brow ridge across the front of the shell
  b.part(new THREE.BoxGeometry(0.12, 0.04, 0.05), RED, {
    bone: body,
    at: [0, 0.15, 0.16],
  });

  // Knobs scattered over the shell in cream and orange
  const shellSurface = b.surface(shell);
  const bumps = shellSurface.scatter(36, {
    rng: rand,
    minDist: 0.035,
    filter: (h) => h.n.y > -0.25,
  });
  bumps.forEach((hit, i) => {
    const colour = i % 3 === 0 ? CREAM : ORANGE;
    b.stick(new THREE.SphereGeometry(0.016, 6, 4), colour, hit, { embed: 0.4 });
  });

  // Tiny barnacle on the back of the shell
  const barnHit = shellSurface.around([0, 0.12, 0]).at(180, 50);
  if (barnHit) {
    b.stick(new THREE.ConeGeometry(0.018, 0.016, 6), BARNACLE, barnHit, { embed: 0.3 });
    const barn2 = shellSurface.around([0, 0.12, 0]).at(168, 58);
    if (barn2) b.stick(new THREE.SphereGeometry(0.011, 6, 4), BARNACLE, barn2, { embed: 0.4 });
  }

  // Seaweed strand clinging to the back
  const weedHit = shellSurface.around([0, 0.12, 0]).at(205, 52);
  if (weedHit) {
    const mid = weedHit.moved([0, 0.06, 0]).at;
    const tip = weedHit.moved([0, 0.12, 0.03]).at;
    b.sprout("seaweed", weedHit, catmull([weedHit.at, mid, tip]), [0.009, 0.003], {
      count: 0,
      color: GREEN,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GREEN, { bone: body, at: tip });
  }

  // Eyes on stalks
  for (const s of [1, -1]) {
    const base = [s * 0.05, 0.16, 0.12];
    const top = [s * 0.065, 0.25, 0.15];
    b.rod(base, top, 0.012, { color: LEG, bone: body });
    b.part(new THREE.SphereGeometry(0.03, 10, 8), EYE, {
      bone: body,
      at: [s * 0.065, 0.262, 0.16],
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), DARK, {
      bone: body,
      at: [s * 0.065, 0.262, 0.184],
    });
  }

  // Eight jointed walking legs with pointed tips
  const tipDz = [0.1, 0.04, -0.02, -0.09];
  const legZ = [0.08, 0.03, -0.03, -0.09];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = legZ[i];
      const dz = tipDz[i];
      const n = `leg${side}${i + 1}`;
      const path = catmull([
        [s * 0.12, 0.12, z],
        [s * 0.26, 0.15, z + dz * 0.3],
        [s * 0.34, 0.06, z + dz * 0.7],
        [s * 0.4, 0.012, z + dz],
      ]);
      const leg = b.chain(n, path, {
        parent: body,
        names: [`${n}Hip`, `${n}Knee`, `${n}Ankle`, `${n}Tip`],
        role: "leg",
      });
      b.sweep(leg, [0.024, 0.009], {
        color: LEG,
        caps: { start: "round", end: "point" },
      });
    }
  }

  // Oversized raised claw on the left (+X)
  const armL = b.chain(
    "armL",
    catmull([
      [0.13, 0.14, 0.12],
      [0.25, 0.2, 0.2],
      [0.2, 0.3, 0.34],
    ]),
    { parent: body, names: ["armL1", "armL2", "wristL"], role: "arm" },
  );
  const wristL = armL.joints[armL.joints.length - 1];
  b.sweep(armL, [0.03, 0.022], { color: RED });

  // Palm of the big claw
  b.part(new THREE.SphereGeometry(0.065, 10, 8), RED, {
    bone: wristL,
    at: [0.2, 0.31, 0.4],
    scale: [0.95, 0.8, 1.15],
  });

  // Upper and lower pincers with dark tips
  const upperPath = catmull([
    [0.2, 0.33, 0.38],
    [0.25, 0.37, 0.5],
    [0.22, 0.37, 0.62],
    [0.15, 0.34, 0.7],
  ]);
  const lowerPath = catmull([
    [0.2, 0.28, 0.38],
    [0.24, 0.26, 0.5],
    [0.2, 0.27, 0.62],
    [0.14, 0.31, 0.7],
  ]);
  b.sweep(upperPath, [0.028, 0.008], {
    bone: wristL,
    bands: [
      [0.6, RED],
      [1, DARK],
    ],
    caps: { end: "point" },
  });
  b.sweep(lowerPath, [0.026, 0.007], {
    bone: wristL,
    bands: [
      [0.6, RED],
      [1, DARK],
    ],
    caps: { end: "point" },
  });

  // Little teeth on the inner edges of the pincers
  b.along(upperPath, 4, (at) => {
    b.spike(offset(at, [0, -1, 0], 0.022), [0, -1, 0], 0.022, 0.007, {
      color: CREAM,
      bone: wristL,
    });
  }, { from: 0.3, to: 0.85 });
  b.along(lowerPath, 4, (at) => {
    b.spike(offset(at, [0, 1, 0], 0.02), [0, 1, 0], 0.02, 0.006, {
      color: CREAM,
      bone: wristL,
    });
  }, { from: 0.3, to: 0.85 });

  // Smaller claw on the right (-X), held low
  const armR = b.chain(
    "armR",
    catmull([
      [-0.13, 0.14, 0.12],
      [-0.22, 0.12, 0.22],
      [-0.24, 0.08, 0.34],
    ]),
    { parent: body, names: ["armR1", "armR2", "wristR"], role: "arm" },
  );
  const wristR = armR.joints[armR.joints.length - 1];
  b.sweep(armR, [0.022, 0.016], { color: RED });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), RED, {
    bone: wristR,
    at: [-0.24, 0.08, 0.36],
    scale: [0.95, 0.8, 1.1],
  });
  b.sweep(
    catmull([
      [-0.24, 0.1, 0.34],
      [-0.25, 0.11, 0.42],
      [-0.22, 0.11, 0.47],
    ]),
    [0.012, 0.005],
    { bone: wristR, bands: [[0.6, RED], [1, DARK]], caps: { end: "point" } },
  );
  b.sweep(
    catmull([
      [-0.24, 0.06, 0.34],
      [-0.25, 0.05, 0.42],
      [-0.22, 0.05, 0.46],
    ]),
    [0.011, 0.004],
    { bone: wristR, bands: [[0.6, RED], [1, DARK]], caps: { end: "point" } },
  );

  return b.root;
}
