import * as THREE from "three";
import { catmull, createBuilder, spiral, spots, stripes } from "../../../../src/index";

export const meta = {
  name: "Lined seahorse",
  description:
    "A sunny yellow seahorse with a ridged, dark-lined body, white freckles, a crown of spikes, a tube snout and a fluttering dorsal fin, its curled tail holding a seagrass blade.",
};

const SUN = "#ffc72c";
const LINE = "#6a4707";
const FRECKLE = "#fff8dc";
const CROWN = "#ff9f1c";
const FIN = "#ffe9a0";
const GRASS = "#3d9a48";
const GRASS_DARK = "#2a7038";
const EYE = "#ffffff";
const PUPIL = "#1b130a";

export default function seahorse() {
  const b = createBuilder({ name: "seahorse" });

  // Surface: dark ridge lines across the body, white freckles over both.
  const skin = spots(stripes(SUN, LINE, { size: 0.02, axis: "y", width: 0.14, wobble: 0.25 }), FRECKLE, {
    size: 0.03,
    amount: 0.2,
  });

  // Skeleton: hips, then the curved torso chain, then the head and jaw.
  const hips = b.joint("hips", { at: [0, 0.11, 0], dir: [0, 1, 0], role: "spine" });
  const spinePath = catmull([
    [0, 0.11, 0],
    [0, 0.165, 0.004],
    [0, 0.215, 0.014],
    [0, 0.25, 0.034],
  ]);
  const spine = b.chain("spine", spinePath, { role: "spine", parent: hips });

  // Torso: an eight-sided section, so the flat faces read as ridges.
  b.sweep(spine, [0.02, 0.03, 0.03, 0.022], {
    color: skin,
    section: { ngon: 8 },
    smooth: false,
    name: "body",
  });

  // Head, snout and the lower jaw on its own hinge.
  const head = b.joint("head", { parent: spine, at: [0, 0.255, 0.04], dir: [0, 1, 0.2], role: "head" });
  b.capsule([0, 0.248, 0.034], [0, 0.282, 0.05], 0.027, { color: skin, name: "head" });
  b.rod([0, 0.272, 0.05], [0, 0.28, 0.18], [0.014, 0.008], { color: skin, name: "snout" });

  const jaw = b.joint("jaw", { parent: head, at: [0, 0.262, 0.05], dir: [0, 0, 1], role: "jaw" });
  b.rod([0, 0.262, 0.05], [0, 0.262, 0.17], [0.009, 0.005], { color: skin, name: "jawPiece", bone: jaw });

  // Crown of spikes on top of the head.
  const crown: Array<[[number, number, number], [number, number, number]]> = [
    [[-0.012, 0.283, 0.02], [-0.5, 1, -0.6]],
    [[0, 0.29, 0.026], [0, 1, -0.5]],
    [[0.012, 0.283, 0.02], [0.5, 1, -0.6]],
    [[-0.02, 0.275, 0.008], [-1, 0.6, -0.2]],
    [[0.02, 0.275, 0.008], [1, 0.6, -0.2]],
  ];
  for (const [base, dir] of crown) {
    b.spike(base, dir, 0.03, 0.005, { color: CROWN, bone: head, name: "crownSpike" });
  }

  // Big curious eyes with dark pupils, mirrored on both sides.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.015, b.segments(12), b.segments(8)), EYE, {
      at: [s * 0.023, 0.27, 0.056],
      bone: head,
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.008, b.segments(10), b.segments(6)), PUPIL, {
      at: [s * 0.033, 0.272, 0.066],
      bone: head,
      name: "pupil",
    });
  }

  // Delicate dorsal fin on the back, with a scalloped, fluttering edge.
  const finPts: Array<[number, number, number]> = [
    [0, 0.13, -0.018],
    [0, 0.18, -0.02],
    [0, 0.24, -0.02],
  ];
  for (let k = 0; k <= 6; k++) {
    const y = 0.24 - (0.11 * k) / 6;
    const z = -0.045 - (k % 2 ? 0.02 : 0) - (k === 3 ? 0.008 : 0);
    finPts.push([0, y, z]);
  }
  b.slab(finPts, { color: FIN, thickness: 0.002, name: "dorsalFin" });

  // Small pectoral fins on each side.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.02, 0.165, 0.008],
        [s * 0.045, 0.175, 0.012],
        [s * 0.05, 0.16, 0.02],
        [s * 0.03, 0.15, 0.018],
      ],
      { color: FIN, thickness: 0.002, name: "pectoralFin" },
    );
  }

  // Curled tail: a lead-in from the hips, then a helix round the seagrass blade at x = 0.045.
  const lead = catmull([
    [0, 0.112, -0.004],
    [0.035, 0.09, -0.008],
    [0.08, 0.1, 0],
  ]);
  const coil = spiral([0.045, 0.1, 0], [0.08, 0.1, 0], [0, 1, 0], { turns: 1.6, pitch: 0.035 });
  const tailPath = lead.concat(coil);
  const tail = b.chain("tail", tailPath, { role: "tail", parent: hips, count: 5 });
  b.sweep(tail, [0.011, 0.012, 0.01, 0.008, 0.005, 0.003], { color: skin, name: "tail" });

  // Seagrass: two flat tapered blades standing on the floor.
  const blade = (x: number, z: number, height: number, width: number, color: string) =>
    b.extrude(
      [
        [-width, 0],
        [width, 0],
        [width * 0.8, height * 0.5],
        [width * 0.35, height * 0.9],
        [0, height, "sharp"],
        [-width * 0.35, height * 0.9],
        [-width * 0.8, height * 0.5],
      ],
      { color, at: [x, 0, z], thickness: 0.005, bevel: 0.0015, name: "seagrass" },
    );
  blade(0.045, 0, 0.42, 0.009, GRASS);
  blade(0.095, -0.045, 0.32, 0.008, GRASS_DARK);

  return b.root;
}
