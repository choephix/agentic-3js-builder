import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "armored knight",
  description: "A stylized armored knight in a rest pose: segmented steel plate, a red tabard, a heater shield and a sword.",
};

const STEEL = "#a9b3c1";
const STEEL_DARK = "#4d5663";
const GOLD = "#d9a441";
const RED = "#9b2226";
const LEATHER = "#5b3b24";
const VISOR = "#0b0d10";
const PLUME = "#c8242b";

export default function build() {
  const random = rng(7);
  const b = createBuilder({ name: "armored knight" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.95, 0] });

  // Spine: hips -> waist -> chest
  const spine = b.chain("spine", [hips, [0, 1.15, 0], [0, 1.4, 0]], { role: "spine" });

  // Neck and head hang off the chest
  const chest = b.joint("chest", { at: [0, 1.4, 0], parent: hips });
  const neck = b.chain("neck", [chest, [0, 1.5, 0], [0, 1.58, 0]], { role: "neck" });
  const head = b.joint("head", { at: [0, 1.6, 0], parent: chest });

  // Legs
  const hipL = b.joint("hipL", { at: [0.12, 0.95, 0], parent: hips });
  const hipR = b.joint("hipR", { at: [-0.12, 0.95, 0], parent: hips });
  const legL = b.chain("legL", [hipL, [0.12, 0.5, 0.02], [0.12, 0.08, 0]], { role: "leg" });
  const legR = b.chain("legR", [hipR, [-0.12, 0.5, 0.02], [-0.12, 0.08, 0]], { role: "leg" });
  const footL = b.joint("footL", { at: [0.12, 0.04, 0.08], parent: legL });
  const footR = b.joint("footR", { at: [-0.12, 0.04, 0.08], parent: legR });

  // Arms
  const shoulderL = b.joint("shoulderL", { at: [0.26, 1.36, 0], parent: chest });
  const shoulderR = b.joint("shoulderR", { at: [-0.26, 1.36, 0], parent: chest });
  const armL = b.chain("armL", [shoulderL, [0.3, 1.1, 0.05], [0.3, 0.92, 0.2]], { role: "arm" });
  const armR = b.chain("armR", [shoulderR, [-0.3, 1.1, 0.05], [-0.3, 0.92, 0.2]], { role: "arm" });
  const handL = b.joint("handL", { at: [0.3, 0.9, 0.22], parent: armL });
  const handR = b.joint("handR", { at: [-0.3, 0.9, 0.22], parent: armR });

  // ---- Body: torso plate, tabard and waist --------------------------------
  const torso = b.loft([
    { at: [0, 0.95, 0], r: 0.16 },
    { at: [0, 1.15, 0], r: 0.19 },
    { at: [0, 1.4, 0], r: 0.22 },
  ], { color: STEEL });

  const tabard = b.extrude(
    [[-0.13, 0], [0.13, 0], [0.11, -0.5], [0, -0.6], [-0.11, -0.5]],
    { at: [0, 1.15, 0.2], x: [1, 0, 0], y: [0, 1, 0] },
    { color: RED },
  );

  const belt = b.sweep(spine, { radius: 0.2, color: LEATHER });
  const buckle = b.stick(new THREE.BoxGeometry(0.06, 0.05, 0.02), GOLD, b.surface(torso).nearest([0, 1.08, 0.19]));

  // Gorget (neck guard) and chest ornament
  const gorget = b.lathe(
    [[0.14, 0], [0.16, 0.06], [0.12, 0.1], [0, 0.1]],
    { at: [0, 1.46, 0], axis: [0, 1, 0] },
    { color: STEEL_DARK },
  );
  const crest = b.stick(new THREE.BoxGeometry(0.1, 0.06, 0.02), GOLD, b.surface(torso).nearest([0, 1.3, 0.22]));

  // ---- Head: great helm with visor --------------------------------------
  const helm = b.lathe(
    [[0, 0.22], [0.1, 0.2], [0.15, 0.1], [0.16, 0], [0, 0]],
    { at: [0, 1.6, 0], axis: [0, 1, 0] },
    { color: STEEL },
  );
  const visor = b.stick(new THREE.BoxGeometry(0.2, 0.025, 0.02), VISOR, b.surface(helm).nearest([0, 1.62, 0.16]));
  const breathHoles = b.along(
    [[0.04, 1.55, 0.155], [-0.04, 1.55, 0.155]],
    2,
    (at: any) => b.stick(new THREE.SphereGeometry(0.008, 4, 3), VISOR, at),
  );
  const plume = b.spike([0, 1.78, 0], [0, 0.4, -1], 0.3, 0.05);
  const plumeMesh = b.stick(new THREE.ConeGeometry(0.05, 0.3, 4), PLUME, b.surface(helm).nearest([0, 1.8, 0]));

  // ---- Limbs: pauldrons, arms, gauntlets, legs, greaves --------------------
  const pauldronL = b.stick(new THREE.SphereGeometry(0.1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, b.surface(torso).nearest([0.26, 1.4, 0]));
  const pauldronR = b.stick(new THREE.SphereGeometry(0.1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, b.surface(torso).nearest([-0.26, 1.4, 0]));

  const armSleeveL = b.sweep(armL, { radius: 0.06, color: STEEL });
  const armSleeveR = b.sweep(armR, { radius: 0.06, color: STEEL });
  const gauntletL = b.stick(new THREE.BoxGeometry(0.08, 0.1, 0.08), STEEL_DARK, b.surface(handL).nearest([0.3, 0.9, 0.22]));
  const gauntletR = b.stick(new THREE.BoxGeometry(0.08, 0.1, 0.08), STEEL_DARK, b.surface(handR).nearest([-0.3, 0.9, 0.22]));

  const legSweepL = b.sweep(legL, { radius: 0.07, color: STEEL });
  const legSweepR = b.sweep(legR, { radius: 0.07, color: STEEL });
  const kneeL = b.stick(new THREE.SphereGeometry(0.07, 6, 4), GOLD, b.surface(legL).nearest([0.12, 0.5, 0.02]));
  const kneeR = b.stick(new THREE.SphereGeometry(0.07, 6, 4), GOLD, b.surface(legR).nearest([-0.12, 0.5, 0.02]));
  const bootL = b.stick(new THREE.BoxGeometry(0.12, 0.08, 0.22), LEATHER, b.surface(footL).nearest([0.12, 0.04, 0.08]));
  const bootR = b.stick(new THREE.BoxGeometry(0.12, 0.08, 0.22), LEATHER, b.surface(footR).nearest([-0.12, 0.04, 0.08]));

  // ---- Props: heater shield and sword ------------------------------------
  const shield = b.extrude(
    [[-0.14, 0.2], [0.14, 0.2], [0.14, -0.05], [0, -0.22], [-0.14, -0.05]],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0] },
    { color: STEEL_DARK },
  );
  const shieldEmblem = b.stick(new THREE.BoxGeometry(0.1, 0.12, 0.02), RED, b.surface(shield).nearest([0, 0, 0.03]));

  const sword = b.rod([0, 0, 0], [0, 1, 0], 0.02, { color: STEEL });
  const hilt = b.stick(new THREE.BoxGeometry(0.1, 0.02, 0.03), GOLD, b.surface(handR).nearest([-0.3, 0.9, 0.24]));

  return b.root;
}
