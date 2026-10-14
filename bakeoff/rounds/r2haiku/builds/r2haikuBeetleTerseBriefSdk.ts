import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Stag beetle",
  description: "Stylised stag beetle: glossy dark elytra, branched mandibles, six jointed legs and clubbed antennae.",
};

const SHELL = "#2a1a0e";
const SHELL_DEEP = "#1d120a";
const MANDIBLE = "#3a2412";
const LEG = "#4a3020";
const CLUB = "#6b4a2a";
const EYE = "#0b0b0b";

export default function build() {
  const b = createBuilder({ name: "stag-beetle" });

  // Skeleton: body root, head child.
  const body = b.joint("body", { at: [0, 0.02, 0] });
  const head = b.joint("head", { at: [0, 0.02, 0.026], parent: body });

  // Helper: a scaled ellipsoid placed in model space on a bone.
  const ellipsoid = (
    r: number,
    scale: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: typeof body,
  ) => {
    const g = new THREE.SphereGeometry(r, 12, 8);
    g.scale(scale[0], scale[1], scale[2]);
    b.part(g, color, { at, bone });
  };

  // Head: a squat block with a brow ridge.
  ellipsoid(0.011, [1.15, 0.8, 0.95], [0, 0.017, 0.026], SHELL, head);
  ellipsoid(0.007, [1.4, 0.45, 0.8], [0, 0.023, 0.03], SHELL_DEEP, head);

  // Thorax (pronotum): a shiny dome with a central ridge.
  ellipsoid(0.012, [1.2, 0.75, 1.1], [0, 0.02, 0.01], SHELL, body);
  ellipsoid(0.004, [0.5, 0.35, 1.6], [0, 0.028, 0.012], SHELL_DEEP, body);

  // Elytra: two glossy wing cases over the abdomen.
  for (const s of [1, -1]) {
    ellipsoid(0.0145, [0.55, 0.55, 1.5], [s * 0.0075, 0.018, -0.02], SHELL, body);
  }
  // Dark seam where the elytra meet.
  ellipsoid(0.0026, [0.35, 0.5, 14], [0, 0.0235, -0.02], SHELL_DEEP, body);

  // Eyes and mandibles, mirrored left and right.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eyes.
    ellipsoid(0.0022, [1, 1, 1], [s * 0.0085, 0.021, 0.031], EYE, head);

    // Mandible: a long curved horn that rises and points inward at the tip.
    const mandible = b.chain(`mand${side}`, [
      [s * 0.005, 0.018, 0.03],
      [s * 0.013, 0.02, 0.046],
      [s * 0.007, 0.019, 0.064],
    ]);
    b.sweep(mandible, 0.0035, { color: MANDIBLE });

    // Inner tooth near the middle of the mandible, angled inward.
    const tooth = new THREE.ConeGeometry(0.0028, 0.008, 6);
    tooth.rotateZ((s * Math.PI) / 4);
    b.part(tooth, MANDIBLE, { at: [s * 0.0105, 0.0205, 0.047], bone: head });

    // Mandible tip cap.
    ellipsoid(0.0028, [1, 1, 1.2], [s * 0.007, 0.019, 0.064], MANDIBLE, head);

    // Antenna: elbowed, ending in a three-plate club.
    const antenna = b.chain(`ant${side}`, [
      [s * 0.004, 0.024, 0.03],
      [s * 0.01, 0.03, 0.04],
      [s * 0.016, 0.03, 0.046],
    ]);
    b.sweep(antenna, 0.0008, { color: LEG });
    ellipsoid(0.0026, [1.1, 1, 1.6], [s * 0.017, 0.03, 0.047], CLUB, head);
  }

  // Six jointed legs: hip, knee, foot, with a small pad at each foot.
  const legZ = [0.016, 0, -0.016];
  const kneeShift = [0.006, 0, -0.006];
  legZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hip: [number, number, number] = [s * 0.014, 0.014, z];
      const knee: [number, number, number] = [s * 0.028, 0.012, z + kneeShift[i]];
      const foot: [number, number, number] = [s * 0.036, 0.002, z * 1.4];

      const leg = b.chain(`leg${side}${i}`, [hip, knee, foot]);
      b.sweep(leg, 0.0022, { color: LEG });

      // Foot pad sitting on the floor (centre at radius height).
      ellipsoid(0.0022, [1.2, 0.8, 1.2], foot, SHELL_DEEP, body);
    }
  });

  return b.root;
}
