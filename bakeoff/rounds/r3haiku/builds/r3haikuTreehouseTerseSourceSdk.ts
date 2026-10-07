import * as THREE from "three";
import { createBuilder, grain, mottle, scales, stripes } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description: "A wooden treehouse on a tall oak: plank cabin, shingled gable roof, railed deck, ladder and lantern.",
};

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", detail: 1, paintSize: 2048 });

  // One root joint carries every part; this is a prop, so nothing needs to bend.
  b.joint("trunk", { at: [0, 0, 0], dir: [0, 1, 0] });

  // Paints: bark, planks, decking, shingles, leaves, grass and ladder wood.
  const bark = grain("#8a5f3a", "#5a3b22", { size: 0.3, axis: "y" });
  const plank = stripes("#d9a86f", "#b07a48", { size: 0.2, axis: "y", width: 0.45, wobble: 0.15 });
  const deck = grain("#c9925a", "#9c6a3c", { size: 0.2, axis: "x" });
  const shingle = scales(["#8c3f2c", "#7a3424", "#943f2b"], "#4f2119", { size: 0.22 });
  const leaves = mottle("#3f7d2f", "#7cb944", { size: 0.7, seed: 3 });
  const grass = mottle("#5f9a3c", "#89c255", { size: 0.5, seed: 9 });

  const trim = "#f4e7c5";
  const glass = "#9ddcff";
  const shutter = "#3f7d4a";
  const door = "#6b3d22";
  const ladderWood = "#7a4f2b";
  const lantern = "#ffd166";
  const flagRed = "#d64933";

  // Ground patch and low bushes that sit into the floor a touch.
  b.part(new THREE.CylinderGeometry(1.7, 1.9, 0.12, b.segments(12)), grass, { at: [0, 0, 0], name: "lawn" });
  b.part(new THREE.SphereGeometry(0.6, b.segments(9), b.segments(6)), leaves, { at: [2.2, 0.5, 1.5] });
  b.part(new THREE.SphereGeometry(0.5, b.segments(9), b.segments(6)), leaves, { at: [-2.3, 0.45, 1.2] });

  // Trunk: a tapered lathe from the roots up to the crown.
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.42, 1],
      [0.3, 3],
      [0.2, 5],
      [0.1, 6.6],
      [0, 7],
    ],
    { name: "trunk", color: bark, at: [0, 0, 0], segments: 10 },
  );

  // Branches: tapered rods, two above the cabin, one low under the deck.
  b.rod([0, 6.3, 0], [1.9, 6.9, -0.3], [0.2, 0.05], { color: bark, name: "branch" });
  b.rod([0, 6.5, 0.2], [-1.6, 6.7, 0.9], [0.18, 0.05], { color: bark, name: "branch" });
  b.rod([-0.1, 2.4, -0.1], [-1.6, 2.2, -1.5], [0.14, 0.05], { color: bark, name: "branch" });

  // Crown: low-poly leaf clumps.
  const crown: Array<[number, number, number, number]> = [
    [0, 7.5, 0, 1.5],
    [-1.9, 6.6, 0.5, 1.25],
    [2.0, 6.9, -0.2, 1.3],
    [0.6, 8.3, -0.6, 1.0],
    [-1.1, 6.2, -1.6, 1.1],
    [-2.1, 2.8, -1.6, 0.9],
  ];
  for (const [x, y, z, r] of crown)
    b.part(new THREE.SphereGeometry(r, b.segments(10), b.segments(7)), leaves, { at: [x, y, z] });

  // Deck and the braces that hold it out from the trunk.
  b.part(new THREE.BoxGeometry(3.2, 0.12, 2.6), deck, { at: [0, 3.2, 0], name: "deck" });
  for (const [sx, sz] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ] as const)
    b.rod([0.15 * sx, 2.3, 0.15 * sz], [1.3 * sx, 3.12, 0.95 * sz], 0.07, { color: bark, name: "brace" });

  // Railings: a full back rail and sides, a front rail that leaves the ladder gap.
  b.part(new THREE.BoxGeometry(3.2, 0.06, 0.05), deck, { at: [0, 3.8, -1.3], name: "rail" });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.06, 2.6), deck, { at: [1.55 * sx, 3.8, 0], name: "rail" });
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.05, 0.55, 0.05), deck, { at: [1.55 * sx, 3.5, 1.3 * sz], name: "post" });
    b.part(new THREE.BoxGeometry(0.05, 0.55, 0.05), deck, { at: [1.55 * sx, 3.5, 0], name: "post" });
  }
  b.part(new THREE.BoxGeometry(1.2, 0.06, 0.05), deck, { at: [1.0, 3.8, 1.3], name: "rail" });
  for (const x of [0.4, 1.6]) b.part(new THREE.BoxGeometry(0.05, 0.55, 0.05), deck, { at: [x, 3.5, 1.3], name: "post" });

  // Cabin: plank walls, gable ends, shingled roof.
  b.part(new THREE.BoxGeometry(2.6, 1.8, 2.2), plank, { at: [0, 4.16, 0], name: "wall" });
  b.extrude(
    [
      [-1.3, 0],
      [1.3, 0],
      [0, 0.95],
    ],
    { color: plank, at: [0, 5.06, 1.06], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, name: "gable" },
  );
  b.extrude(
    [
      [-1.3, 0],
      [1.3, 0],
      [0, 0.95],
    ],
    { color: plank, at: [0, 5.06, -1.06], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, name: "gable" },
  );
  b.part(new THREE.BoxGeometry(3.5, 0.12, 2.25), shingle, { at: [0, 5.45, 0.95], rotation: [30, 0, 0], name: "roof" });
  b.part(new THREE.BoxGeometry(3.5, 0.12, 2.25), shingle, { at: [0, 5.45, -0.95], rotation: [-30, 0, 0], name: "roof" });

  // Door and front window, with mullions and shutters.
  b.part(new THREE.BoxGeometry(0.7, 1.35, 0.06), door, { at: [-0.5, 3.94, 1.13], name: "door" });
  b.part(new THREE.BoxGeometry(0.62, 0.62, 0.05), trim, { at: [0.7, 4.5, 1.13], name: "windowFrame" });
  b.part(new THREE.BoxGeometry(0.48, 0.48, 0.03), glass, { at: [0.7, 4.5, 1.18], name: "glass" });
  b.part(new THREE.BoxGeometry(0.05, 0.48, 0.04), trim, { at: [0.7, 4.5, 1.2], name: "mullion" });
  b.part(new THREE.BoxGeometry(0.48, 0.05, 0.04), trim, { at: [0.7, 4.5, 1.2], name: "mullion" });
  for (const sx of [1, -1])
    b.part(new THREE.BoxGeometry(0.14, 0.62, 0.05), shutter, { at: [0.7 + 0.42 * sx, 4.5, 1.13], name: "shutter" });

  // Side window on the right wall.
  b.part(new THREE.BoxGeometry(0.05, 0.62, 0.62), trim, { at: [1.33, 4.5, 0], name: "windowFrame" });
  b.part(new THREE.BoxGeometry(0.03, 0.48, 0.48), glass, { at: [1.36, 4.5, 0], name: "glass" });

  // Lantern on a bracket beside the door.
  b.rod([-1.0, 4.62, 1.14], [-1.0, 4.62, 1.36], 0.02, { color: bark, name: "bracket" });
  b.part(new THREE.SphereGeometry(0.1, b.segments(8), b.segments(6)), lantern, { at: [-1.0, 4.5, 1.38], name: "lantern" });

  // Flag on a pole at the roof.
  b.rod([-0.9, 5.85, -0.3], [-0.9, 6.9, -0.3], 0.025, { color: bark, name: "pole" });
  b.part(new THREE.BoxGeometry(0.55, 0.34, 0.02), flagRed, { at: [-0.62, 6.6, -0.3], name: "flag" });

  // Rope-free ladder from the lawn up to the front rail gap.
  for (const x of [-1.2, -0.8])
    b.rod([x, 0, 2.0], [x, 3.1, 1.3], 0.04, { color: ladderWood, name: "ladderRail" });
  for (let i = 1; i <= 8; i++) {
    const t = i / 9;
    const y = 3.1 * t;
    const z = 2.0 + (1.3 - 2.0) * t;
    b.rod([-1.2, y, z], [-0.8, y, z], 0.03, { color: ladderWood, name: "rung" });
  }

  return b.root;
}
