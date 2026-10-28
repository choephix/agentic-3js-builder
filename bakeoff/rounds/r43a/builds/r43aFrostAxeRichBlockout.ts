import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description: "Blockout of a double-bladed frost battle axe standing upright on a floor contact point, with a long haft, crystal blades and a pommel.",
};

export default function build() {
  const b = createBuilder({ name: "frostAxe" });

  const STEEL = "#5a6f8f";
  const ICE = "#9fe3ff";
  const DARK = "#2a3550";
  const LEATHER = "#4a3426";

  // Haft: vertical pole standing on the floor, length 1.5 m
  b.rod([0, 0.04, 0], [0, 1.5, 0], 0.025, DARK);
  // Floor-touching butt cap
  b.part(new THREE.ConeGeometry(0.035, 0.1, 6), STEEL, { at: [0, 0.05, 0], dir: [0, -1, 0] });
  // Grip wrap
  b.rod([0, 0.3, 0], [0, 0.85, 0], 0.032, LEATHER);

  // Collar and head hub
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), STEEL, { at: [0, 1.3, 0] });
  b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 8), STEEL, { at: [0, 1.16, 0] });

  // Double blades, one each side, facing outward along X
  for (const s of [1, -1]) {
    const blade = b.extrude(
      [
        [0.04, -0.15],
        [0.1, -0.2],
        [0.3, -0.3, "sharp"],
        [0.32, -0.05, "sharp"],
        [0.3, 0.2, "sharp"],
        [0.12, 0.2],
        [0.04, 0.12],
      ],
      { at: [0, 1.3, 0], x: [s, 0, 0], thickness: [0.05, 0.015], color: STEEL },
    );
    void blade;
    // Icy inner crystal edge
    b.extrude(
      [
        [0.2, -0.25],
        [0.31, -0.27, "sharp"],
        [0.3, 0.15, "sharp"],
        [0.2, 0.1],
      ],
      { at: [0, 1.3, 0.0], x: [s, 0, 0], thickness: [0.03, 0.01], color: ICE },
    );
  }

  // Top spike
  b.spike([0, 1.4, 0], [0, 1, 0], 0.25, 0.04, { color: ICE });

  // Frost crystals at the base of the head
  b.spike([0.05, 1.12, 0.03], [0.4, -1, 0.2], 0.15, 0.025, { color: ICE });
  b.spike([-0.05, 1.12, 0.03], [-0.4, -1, 0.2], 0.15, 0.025, { color: ICE });

  return b.root;
}
