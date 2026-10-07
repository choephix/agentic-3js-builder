```ts
import * as THREE from "three";
import { createBuilder, mottle, paint } from "agentic-3js-builder";

const STEEL = "#aab3bd";
const STEEL_DARK = "#5f6772";
const GOLD = "#d9ab3f";
const RED = "#9a1d1f";
const LEATHER = "#4d3020";
const VISOR = "#101214";

export const meta = {
  name: "Armoured knight",
  description:
    "A stylised plate-armoured knight in a rest pose: octagonal great helm with a red plume, a red tabard with a gold cross, round pauldrons, a heater shield on the left arm and a sword hanging at the right side.",
};

export default function knight() {
  const b = createBuilder({ name: "knight", paintSize: 1024 });

  // Skeleton: pelvis at the root, a two-joint spine, neck and head, then legs and arms as chains.
  b.joint("pelvis", { at: [0, 0.95, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.98, 0],
      [0, 1.14, 0],
      [0, 1.34, 0],
    ],
    { parent: "pelvis", names: ["spine1", "spine2"], role: "spine" },
  );
  b.joint("neck", { parent: "spine2", at: [0, 1.36, 0], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.5, 0], role: "head" });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = 0.13 * s;

    // Legs: hip, knee and ankle, with the tip joint at the ankle.
    const leg = b.chain(
      `leg${L}`,
      [
        [x, 0.95, 0],
        [x, 0.5, 0.02],
        [x, 0.09, 0],
      ],
      { parent: "pelvis", names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(leg, [0.095, 0.075, 0.06], {
      color: (t) => (t < 0.45 ? STEEL_DARK : STEEL),
    });
    b.part(new THREE.SphereGeometry(0.05, b.segments(8), b.segments(6)), GOLD, {
      bone: `knee${L}`,
      at: [x, 0.5, 0.075],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.26), STEEL_DARK, {
      bone: `ankle${L}`,
      at: [x, 0.05, 0.07],
    });

    // Arms: shoulder, elbow and wrist, with the tip joint at the wrist.
    const arm = b.chain(
      `arm${L}`,
      [
        [0.2 * s, 1.34, 0],
        [0.33 * s, 1.1, 0.02],
        [0.4 * s, 0.9, 0.12],
      ],
      { parent: "spine2", names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    b.sweep(arm, [0.068, 0.055, 0.045], {
      color: (t) => (t < 0.5 ? STEEL_DARK : STEEL),
    });
    b.part(new THREE.BoxGeometry(0.1, 0.13, 0.1), STEEL_DARK, {
      bone: `wrist${L}`,
      at: [0.4 * s, 0.84, 0.13],
    });

    // Round pauldron: a half-dome lathed over the shoulder.
    b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.12, 0.03],
        [0.1, 0.08],
        [0.06, 0.11],
        [0, 0.12],
      ],
      { color: STEEL, at: [0.2 * s, 1.3, 0], bone: `shoulder${L}`, segments: 8 },
    );
  }

  // Torso: breastplate lofted over the spine, with a light mottled steel paint.
  b.loft(
    [
      { at: [0, 0.98, 0], w: 0.36, h: 0.22 },
      { at: [0, 1.12, 0], w: 0.44, h: 0.27 },
      { at: [0, 1.26, 0], w: 0.46, h: 0.28 },
      { at: [0, 1.36, 0], w: 0.36, h: 0.22 },
    ],
    { bone: spine, color: mottle(STEEL, "#818a95", { size: 0.35 }), sides: 10 },
  );

  // Faulds: lames of plate hanging from the waist.
  b.loft(
    [
      { at: [0, 0.97, 0], w: 0.42, h: 0.26 },
      { at: [0, 0.86, 0], w: 0.46, h: 0.3 },
      { at: [0, 0.78, 0], w: 0.5, h: 0.32 },
    ],
    { bone: "pelvis", color: STEEL_DARK, sides: 8 },
  );

  // Belt and buckle.
  b.part(new THREE.BoxGeometry(0.4, 0.035, 0.25), LEATHER, { bone: "pelvis", at: [0, 0.97, 0] });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.02), GOLD, { bone: "pelvis", at: [0, 0.97, 0.14] });

  // Red tabard with a gold cross, painted from model-space position.
  b.slab(
    [
      [-0.14, 1.36, 0.15],
      [0.14, 1.36, 0.15],
      [0.16, 1.0, 0.16],
      [0, 0.9, 0.17],
      [-0.16, 1.0, 0.16],
    ],
    {
      color: paint((p) => (Math.abs(p.x) < 0.02 || Math.abs(p.y - 1.18) < 0.025 ? GOLD : RED)),
      thickness: 0.01,
      bone: "spine2",
    },
  );

  // Neck guard and the great helm, an octagonal lathe turned so a flat face looks forward.
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), STEEL_DARK, { bone: "neck", at: [0, 1.4, 0] });
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.13, 0.04],
      [0.13, 0.22],
      [0.1, 0.3],
      [0, 0.32],
    ],
    { color: STEEL, at: [0, 1.43, 0], bone: "head", segments: 8, spin: 22.5 },
  );
  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.025, 8), GOLD, { bone: "head", at: [0, 1.45, 0] });
  b.part(new THREE.BoxGeometry(0.13, 0.025, 0.012), VISOR, { bone: "head", at: [0, 1.6, 0.124] });
  for (const x of [-0.035, 0, 0.035]) {
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.012), VISOR, { bone: "head", at: [x, 1.52, 0.124] });
  }

  // Plume: a red fin rising from the helm's crown.
  b.slab(
    [
      [0, 1.74, -0.04],
      [0, 1.88, -0.1],
      [0, 1.84, -0.26],
      [0, 1.7, -0.2],
    ],
    { color: RED, thickness: 0.025, bone: "head" },
  );

  // Heater shield on the left arm, with a gold cross.
  b.extrude(
    [
      [-0.13, 0.2],
      [0.13, 0.2],
      [0.13, -0.04],
      [0, -0.22, "sharp"],
      [-0.13, -0.04],
    ],
    {
      color: paint((p) => (Math.abs(p.x - 0.4) < 0.02 || Math.abs(p.y - 1.02) < 0.02 ? GOLD : RED)),
      at: [0.4, 1.0, 0.13],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      bone: "elbowL",
    },
  );

  // Sword hanging point-down from the right hand.
  b.part(new THREE.BoxGeometry(0.1, 0.025, 0.03), GOLD, { bone: "wristR", at: [-0.4, 0.765, 0.12] });
  b.frustumBox(
    [-0.4, 0.765, 0.12],
    [-0.41, 0.02, 0.12],
    [0.035, 0.01],
    [0.02, 0.005],
    { color: "#d5dbe2", bone: "wristR" },
  );

  return b.root;
}
```