```ts
import * as THREE from "three";
import { catmull, createBuilder, polyline } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Armored knight",
  description: "A plate-armoured knight in a red tabard with a heater shield, drawn sword and crested great helm.",
};

const STEEL = "#aab3bd";
const STEEL_DK = "#616a75";
const STEEL_LT = "#e2e8ee";
const GOLD = "#d8ab45";
const RED = "#9c1d24";
const LEATHER = "#4a2e1c";
const DARK = "#1b1d22";

/** A plus-shaped outline: arm half-width w, arm half-length l. */
function cross(w: number, l: number): OutlinePoint[] {
  return [
    [-w, l],
    [w, l],
    [w, w],
    [l, w],
    [l, -w],
    [w, -w],
    [w, -l],
    [-w, -l],
    [-w, -w],
    [-l, -w],
    [-l, w],
    [-w, w],
  ];
}

export default function build() {
  const b = createBuilder({ name: "knight" });

  // ---- Skeleton: hips, torso, head ----------------------------------------
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "torso",
    polyline([
      [0, 0.95, 0],
      [0, 1.12, 0],
      [0, 1.33, 0],
      [0, 1.46, 0.01],
    ]),
    { parent: hips, names: ["waist", "chest", "neck"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 1.47, 0], dir: [0, 1, 0], role: "head" });

  // ---- Torso: a faceted octagonal breastplate ------------------------------
  b.sweep(spine, (t: number): [number, number] => [0.14 + 0.03 * Math.sin(Math.PI * t), 0.11 + 0.02 * Math.sin(Math.PI * t)], {
    sides: 8,
    color: STEEL,
  });

  // Gorget collar and gold waist belt with a buckle.
  b.part(new THREE.CylinderGeometry(0.115, 0.135, 0.09, 10), STEEL_DK, { bone: chest, at: [0, 1.42, 0] });
  b.part(new THREE.TorusGeometry(0.165, 0.014, 6, 16).rotateX(Math.PI / 2).scale(1, 1, 0.78), GOLD, {
    bone: hips,
    at: [0, 1.0, 0],
  });
  b.part(new THREE.BoxGeometry(0.05, 0.045, 0.012), GOLD, { bone: hips, at: [0, 1.0, 0.135] });

  // Lamellar skirt (faulds) hanging from the hips.
  b.lathe(
    [
      [0.11, 0],
      [0.13, 0],
      [0.19, 0.22],
      [0.17, 0.22],
    ],
    { at: [0, 0.97, 0], axis: [0, -1, 0], segments: 12, color: STEEL_DK, bone: hips },
  );

  // Red tabard over the chest with a gold cross.
  const tabard: OutlinePoint[] = [
    [-0.13, 0.46],
    [0.13, 0.46],
    [0.13, 0.08],
    [0, -0.02, "sharp"],
    [-0.13, 0.08],
  ];
  b.extrude(tabard, {
    at: [0, 0.8, 0.134],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: RED,
    bone: chest,
  });
  b.extrude(cross(0.03, 0.12), {
    at: [0, 1.0, 0.142],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: GOLD,
    bone: chest,
  });

  // ---- Great helm -----------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.13, 0],
      [0.145, 0.05],
      [0.14, 0.16],
      [0.1, 0.24],
      [0.04, 0.275],
      [0, 0.28],
    ],
    { at: [0, 1.47, 0], bone: head, segments: 10, color: STEEL },
  );
  // Visor slit, nasal bar and gold crown ring.
  b.part(new THREE.BoxGeometry(0.15, 0.02, 0.02), DARK, { bone: head, at: [0, 1.62, 0.14] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.025), STEEL_DK, { bone: head, at: [0, 1.55, 0.15] });
  b.part(new THREE.TorusGeometry(0.095, 0.012, 6, 12).rotateX(Math.PI / 2), GOLD, {
    bone: head,
    at: [0, 1.72, 0],
  });
  // Plume streaming back from the crest.
  b.sweep(
    catmull([
      [0, 1.7, 0],
      [0, 1.82, -0.04],
      [0, 1.86, -0.2],
      [0, 1.78, -0.36],
    ]),
    [0.045, 0.012],
    { bone: head, color: RED, sides: 6 },
  );

  // ---- Limbs, pauldrons, gauntlets, greaves, sabatons -----------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Arm: shoulder, elbow, wrist, hand.
    const arm = b.chain(
      `arm${L}`,
      polyline([
        [s * 0.23, 1.38, 0],
        [s * 0.29, 1.12, 0.07],
        [s * 0.3, 0.92, 0.22],
        [s * 0.3, 0.88, 0.3],
      ]),
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`], role: "arm" },
    );
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const hand = arm.joints[3];

    b.sweep(arm, [0.058, 0.047], { from: 0, to: 0.44, skin: "rigid", sides: 8, color: STEEL });
    b.sweep(arm, [0.05, 0.042], { from: 0.46, to: 0.84, skin: "rigid", sides: 8, color: STEEL_DK });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), STEEL_LT, { bone: elbow, at: [s * 0.29, 1.12, 0.07] });

    // Stacked pauldron lames with a gold rim.
    b.part(new THREE.SphereGeometry(0.125, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.5, 1), STEEL, {
      bone: shoulder,
      at: [s * 0.23, 1.4, 0],
    });
    b.part(new THREE.SphereGeometry(0.14, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.3, 1), STEEL_DK, {
      bone: shoulder,
      at: [s * 0.23, 1.36, 0],
    });
    b.part(new THREE.TorusGeometry(0.12, 0.01, 6, 12).rotateX(Math.PI / 2), GOLD, {
      bone: shoulder,
      at: [s * 0.23, 1.4, 0],
    });

    // Gauntlet.
    b.part(new THREE.SphereGeometry(0.056, 8, 6).scale(0.9, 0.8, 1.2), STEEL, {
      bone: hand,
      at: [s * 0.3, 0.88, 0.3],
    });

    // Leg: hip, knee, ankle, foot.
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [s * 0.11, 0.96, 0],
        [s * 0.12, 0.52, 0.02],
        [s * 0.12, 0.1, 0],
        [s * 0.12, 0.06, 0.17],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.088, 0.074], { from: 0, to: 0.43, skin: "rigid", sides: 8, color: STEEL });
    b.sweep(leg, [0.072, 0.052], { from: 0.44, to: 0.82, skin: "rigid", sides: 8, color: STEEL_DK });
    b.part(new THREE.SphereGeometry(0.078, 10, 8).scale(1, 0.9, 0.85), STEEL_LT, {
      bone: leg.joints[1],
      at: [s * 0.12, 0.52, 0.02],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.24), STEEL_DK, {
      bone: leg.joints[2],
      at: [s * 0.12, 0.06, 0.1],
    });

    if (s > 0) {
      // Left arm carries the heater shield.
      const heater: OutlinePoint[] = [
        [-0.19, 0.26],
        [0.19, 0.26],
        [0.19, -0.04],
        [0, -0.28, "sharp"],
        [-0.19, -0.04],
      ];
      b.extrude(heater, {
        at: [0.27, 1.05, 0.33],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.008,
        smoothing: 1,
        color: RED,
        bone: hand,
      });
      b.extrude(cross(0.025, 0.12), {
        at: [0.27, 1.07, 0.35],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: GOLD,
        bone: hand,
      });
      b.part(new THREE.SphereGeometry(0.034, 8, 6), GOLD, { bone: hand, at: [0.27, 1.05, 0.37] });
    } else {
      // Right hand holds the sword upright.
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.13, 6), LEATHER, { bone: hand, at: [-0.3, 0.88, 0.3] });
      b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: hand, at: [-0.3, 0.81, 0.3] });
      b.part(new THREE.BoxGeometry(0.13, 0.022, 0.03), GOLD, { bone: hand, at: [-0.3, 0.955, 0.3] });
      b.part(new THREE.BoxGeometry(0.034, 0.64, 0.008), STEEL_LT, { bone: hand, at: [-0.3, 1.28, 0.3] });
    }
  }

  return b.root;
}
```