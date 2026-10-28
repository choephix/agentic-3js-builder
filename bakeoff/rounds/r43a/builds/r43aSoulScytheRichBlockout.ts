import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description: "Blockout of a tall dragonbone scythe with a curved bone blade, skull ornament and soul gem, standing upright on its butt spike.",
};

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const BONE = "#d9d0b8";
  const DARK = "#2a2438";
  const GOLD = "#c9a24a";
  const SOUL = "#4be0c8";

  b.joint("root", { at: [0, 0, 0] });

  // Shaft, slightly tilted for a standing prop
  b.rod([0, 0.0, 0], [0, 1.9, 0], 0.025, DARK);
  // Butt spike
  b.spike([0, 0.12, 0], [0, -1, 0], 0.12, 0.03, { color: GOLD });
  // Grip wraps
  b.rod([0, 0.7, 0], [0, 1.1, 0], 0.032, GOLD);
  b.rod([0, 1.1, 0], [0, 1.2, 0], 0.04, DARK);

  // Head collar
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 8), GOLD, { at: [0, 1.88, 0] });

  // Dragon skull ornament at top
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.16), BONE, { at: [0, 1.99, 0.04] });
  b.frustumBox([0, 1.98, 0.12], [0, 1.96, 0.24], [0.08, 0.07], [0.04, 0.04], { color: BONE });
  // Lower jaw
  b.frustumBox([0, 1.93, 0.1], [0, 1.92, 0.22], [0.06, 0.02], [0.03, 0.015], { color: BONE });
  // Horns
  for (const s of [1, -1]) {
    b.spike([s * 0.05, 2.02, 0.0], [s * 0.4, 0.5, -0.8], 0.16, 0.02, { color: BONE });
  }

  // Soul gem
  b.part(new THREE.OctahedronGeometry(0.05), SOUL, { at: [0, 1.76, 0.06] });

  // Blade: curved sweep of bone arcing forward and down
  const blade = catmull([
    [0, 2.0, 0.05],
    [0, 2.12, 0.35],
    [0, 2.1, 0.7],
    [0, 1.95, 1.0],
    [0, 1.7, 1.15],
  ]);
  b.sweep(blade, [0.07, 0.01], { color: BONE, section: "box", caps: "point" });

  // Dark spine edge along the blade's back
  const back = catmull([
    [0, 2.06, 0.05],
    [0, 2.18, 0.35],
    [0, 2.17, 0.7],
    [0, 2.02, 1.0],
    [0, 1.8, 1.14],
  ]);
  b.sweep(back, 0.018, { color: DARK });

  // Rib spikes on the blade's back
  for (let i = 0; i < 3; i++) {
    const p = blade.at(0.25 + i * 0.25);
    b.spike(p, [0, 1, -0.2], 0.12, 0.02, { color: BONE });
  }

  // Secondary lower claw blade
  const claw = catmull([
    [0, 1.82, -0.02],
    [0, 1.7, -0.2],
    [0, 1.5, -0.3],
  ]);
  b.sweep(claw, [0.04, 0], { color: BONE, caps: "point" });

  return b.root;
}
