import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";

export const meta = {
  name: "Orc Berserker · Astra",
  description: "A hulking green orc berserker with war paint, fur, leather, and a one-handed battle axe.",
};

const SKIN = "#4f7d45";
const SKIN_DARK = "#2d4a31";
const SKIN_LIGHT = "#7fa65a";
const HAIR = "#211815";
const LEATHER = "#573524";
const LEATHER_DARK = "#2c1b16";
const FUR = "#76553a";
const METAL = "#969b94";
const METAL_DARK = "#4a514c";
const BONE = "#dac28b";
const EYE = "#161516";
const PAINT = "#8e2e2b";
const BRASS = "#b9823a";
const WOOD = "#6e4022";

export default function build() {
  const b = createBuilder({ name: "orcBerserkerAstra", detail: 0.85 });
  const random = rng(1701);

  // Skeleton first: compact legs, a deep chest, broad outstretched arms, and a hinged jaw.
  const hips = b.joint("hips", { at: [0, 0.94, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.94, 0],
      [0, 1.25, 0.01],
      [0, 1.52, 0.02],
    ]),
    { parent: hips, names: ["waist", "chest", "shoulderLine"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: chest, at: [0, 1.72, 0.06], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 0.2], dir: [0, -0.35, 0.9], role: "jaw" });

  const armL = b.chain(
    "armL",
    polyline([
      [0.36, 1.48, 0.02],
      [0.67, 1.41, 0.03],
      [0.93, 1.34, 0.08],
      [1.07, 1.32, 0.13],
    ]),
    { parent: chest, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    polyline([
      [-0.36, 1.48, 0.02],
      [-0.67, 1.41, 0.03],
      [-0.93, 1.34, 0.08],
      [-1.07, 1.32, 0.13],
    ]),
    { parent: chest, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );
  const legL = b.chain(
    "legL",
    polyline([
      [0.2, 0.88, 0],
      [0.22, 0.49, 0.01],
      [0.22, 0.13, 0.02],
      [0.22, 0.09, 0.18],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg" },
  );
  const legR = b.chain(
    "legR",
    polyline([
      [-0.2, 0.88, 0],
      [-0.22, 0.49, 0.01],
      [-0.22, 0.13, 0.02],
      [-0.22, 0.09, 0.18],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg" },
  );

  // Main skin volumes. Low-sided sections keep the puppet-like facets visible.
  const torso = b.sweep(spine, (t) => [0.29 + 0.1 * t, 0.19 + 0.045 * t], {
    section: { ngon: 8 },
    smooth: false,
    color: SKIN,
    caps: "round",
  });
  b.sweep(armL, (t) => 0.115 - 0.038 * t, { section: { ngon: 7 }, smooth: false, color: SKIN });
  b.sweep(armR, (t) => 0.115 - 0.038 * t, { section: { ngon: 7 }, smooth: false, color: SKIN });
  b.sweep(legL, (t) => 0.15 - 0.055 * t, { section: { ngon: 7 }, smooth: false, color: SKIN_DARK });
  b.sweep(legR, (t) => 0.15 - 0.055 * t, { section: { ngon: 7 }, smooth: false, color: SKIN_DARK });

  b.part(new THREE.SphereGeometry(0.34, b.segments(10), b.segments(7)), SKIN, {
    bone: hips,
    at: [0, 1.02, 0],
    scale: [1.05, 0.78, 0.82],
    flat: true,
    name: "pelvisMass",
  });
  b.part(new THREE.CapsuleGeometry(0.16, 0.16, b.segments(5), b.segments(7)), SKIN_DARK, {
    bone: chest,
    at: [0, 1.58, 0.02],
    scale: [1.1, 1, 0.95],
    flat: true,
    name: "neck",
  });

  // Head, heavy brow, separate jaw, ears, and upward tusks.
  b.part(new THREE.SphereGeometry(0.265, b.segments(10), b.segments(7)), SKIN, {
    bone: head,
    at: [0, 1.81, 0.08],
    scale: [1.05, 1.12, 0.98],
    flat: true,
    name: "cranium",
  });
  b.part(new THREE.BoxGeometry(0.37, 0.14, 0.22), SKIN_DARK, {
    bone: head,
    at: [0, 1.93, 0.265],
    scale: [1, 1, 0.8],
    flat: true,
    name: "browRidge",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.13, 0.24), SKIN_DARK, {
    bone: jaw,
    at: [0, 1.69, 0.22],
    flat: true,
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.22, 1.84, 0.08],
        [s * 0.42, 1.9, 0.03],
        [s * 0.22, 1.96, 0.08],
      ],
      { bone: head, color: SKIN_DARK, thickness: 0.035, name: s > 0 ? "earL" : "earR" },
    );
    b.part(new THREE.SphereGeometry(0.027, b.segments(6), b.segments(4)), EYE, {
      bone: head,
      at: [s * 0.105, 1.875, 0.318],
      scale: [1.1, 0.65, 0.7],
      flat: true,
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.rod([s * 0.08, 1.86, 0.327], [s * 0.17, 1.77, 0.302], 0.014, { color: PAINT, bone: head });
    b.rod([s * 0.16, 1.885, 0.33], [s * 0.21, 1.82, 0.31], 0.011, { color: PAINT, bone: head });
    b.spike([s * 0.115, 1.72, 0.34], [0, 1, 0.15], 0.12, 0.036, { color: BONE, bone: jaw });
  }

  // Topknot and two short, bead-bound braids.
  b.capsule([0, 1.99, -0.01], [0, 2.075, -0.025], 0.095, { color: HAIR, bone: head, section: { ngon: 7 } });
  for (const s of [1, -1]) {
    const braid = b.chain(
      s > 0 ? "braidL" : "braidR",
      polyline([
        [s * 0.075, 2.0, -0.03],
        [s * 0.105, 1.94, -0.045],
        [s * 0.09, 1.875, -0.015],
      ]),
      { parent: head, names: s > 0 ? ["braidL1", "braidL2"] : ["braidR1", "braidR2"], role: "fan" },
    );
    b.sweep(braid, 0.026, { section: { ngon: 6 }, color: HAIR, skin: "rigid" });
    for (const p of [1.94, 1.88]) {
      b.part(new THREE.SphereGeometry(0.034, b.segments(6), b.segments(4)), BRASS, {
        bone: s > 0 ? braid.joints[0] : braid.joints[0],
        at: [s * (p > 1.9 ? 0.105 : 0.09), p, -0.045 + (p < 1.9 ? 0.03 : 0)],
        flat: true,
      });
    }
  }

  // Bracers and empty left fist; the right fist wraps the axe handle.
  for (const s of [1, -1]) {
    const wrist = s > 0 ? armL.joints[2] : armR.joints[2];
    b.part(new THREE.CylinderGeometry(0.105, 0.09, 0.19, b.segments(8)), LEATHER_DARK, {
      bone: wrist,
      at: [s * 0.91, 1.34, 0.09],
      dir: [s, -0.1, 0],
      axis: "y",
      flat: true,
      name: s > 0 ? "bracerL" : "bracerR",
    });
    b.part(new THREE.SphereGeometry(0.105, b.segments(8), b.segments(6)), SKIN_LIGHT, {
      bone: s > 0 ? armL.joints[armL.joints.length - 1] : armR.joints[armR.joints.length - 1],
      at: [s * 1.075, 1.32, 0.13],
      scale: [1.05, 0.78, 0.9],
      flat: true,
      name: s > 0 ? "fistL" : "fistR",
    });
    for (let finger = 0; finger < 3; finger++) {
      const z = 0.08 + finger * 0.035;
      b.spike([s * 1.1, 1.285, z], [s * 0.9, -0.12, 0], 0.07, 0.018, {
        color: SKIN_DARK,
        bone: s > 0 ? armL.joints[armL.joints.length - 1] : armR.joints[armR.joints.length - 1],
      });
    }
  }

  // A hammered shoulder guard, only on the axe arm, with three blunt spikes.
  b.part(new THREE.SphereGeometry(0.19, b.segments(8), b.segments(5)), METAL_DARK, {
    bone: armR.joints[0],
    at: [-0.39, 1.5, 0.02],
    scale: [1.2, 0.72, 1.12],
    flat: true,
    name: "spikedShoulderGuard",
  });
  for (const [x, y, z] of [
    [-0.5, 1.6, 0.06],
    [-0.53, 1.53, 0.13],
    [-0.48, 1.62, -0.08],
  ] as const) {
    b.spike([x, y, z], [-0.7, 0.4, z > 0 ? 0.4 : -0.2], 0.15, 0.032, { color: METAL, bone: armR.joints[0] });
  }

  // Belts, bandolier, pouches, and fur loincloth.
  const torsoSurface = b.surface(torso);
  b.sweep(torsoSurface.loop(hips, { lift: 0.025 }), 0.028, { color: LEATHER_DARK, section: { ngon: 6 } });
  b.sweep(torsoSurface.loop(chest, { lift: 0.02 }), 0.022, { color: LEATHER, section: { ngon: 6 } });
  b.rod([-0.31, 1.56, 0.235], [0.28, 1.08, 0.25], 0.026, { color: LEATHER, bone: chest });
  for (const [x, y, z] of [
    [-0.2, 0.94, 0.24],
    [0.2, 0.94, 0.24],
    [-0.24, 1.05, 0.25],
  ] as const) {
    b.part(new THREE.BoxGeometry(0.11, 0.12, 0.05), LEATHER, { bone: hips, at: [x, y, z], flat: true, name: "beltPouch" });
  }
  b.extrude(
    [
      [-0.26, 0.08],
      [0.26, 0.08],
      [0.23, -0.2],
      [0.09, -0.14],
      [0, -0.24],
      [-0.09, -0.14],
      [-0.23, -0.2],
    ],
    { at: [0, 0.86, 0.26], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.012, color: FUR, bone: hips },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 0.69, 0.28], [s * 0.2, -0.8, 0.1], 0.13, 0.026, { color: FUR, bone: hips });
  }

  // Heavy boots make the floor contact unambiguous.
  for (const s of [1, -1]) {
    const foot = s > 0 ? legL.joints[legL.joints.length - 1] : legR.joints[legR.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.23, 0.13, 0.36), LEATHER_DARK, {
      bone: foot,
      at: [s * 0.22, 0.08, 0.19],
      flat: true,
      name: s > 0 ? "bootL" : "bootR",
    });
    b.part(new THREE.BoxGeometry(0.24, 0.035, 0.37), METAL_DARK, {
      bone: foot,
      at: [s * 0.22, 0.02, 0.19],
      flat: true,
      name: "bootSole",
    });
  }

  // One-handed, oversized axe: wood haft in the right fist and a broad, chipped blade.
  b.rod([-1.07, 1.32, 0.14], [-0.92, 1.9, 0.14], 0.032, {
    color: WOOD,
    bone: armR.joints[armR.joints.length - 1],
    section: { ngon: 7 },
  });
  b.extrude(
    [
      [-0.01, 0.18],
      [0.17, 0.14],
      [0.28, 0.03, "sharp"],
      [0.22, -0.1],
      [0.09, -0.18],
      [-0.02, -0.1],
      [-0.08, 0.03, "sharp"],
    ],
    {
      at: [-0.92, 1.9, 0.14],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.018,
      color: METAL,
      bone: armR.joints[armR.joints.length - 1],
      name: "axeBlade",
    },
  );
  b.part(new THREE.BoxGeometry(0.11, 0.12, 0.12), BRASS, {
    bone: armR.joints[armR.joints.length - 1],
    at: [-0.92, 1.9, 0.14],
    flat: true,
    name: "axeSocket",
  });
  // A few deterministic fur/metal nicks break up the repeated silhouette.
  for (let i = 0; i < 4; i++) {
    const x = -0.88 + random() * 0.18;
    const y = 1.84 + random() * 0.1;
    b.part(new THREE.BoxGeometry(0.025, 0.012, 0.004), METAL_DARK, {
      bone: armR.joints[armR.joints.length - 1],
      at: [x, y, 0.14],
      flat: true,
      name: "axeNick",
    });
  }

  return b.root;
}
