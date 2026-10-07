```ts
import * as THREE from "three";
import { catmull, createBuilder, grain, mottle, scales, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A wooden treehouse in an old oak: a plank deck on the trunk and braces, a cream-trimmed cabin with a red roof and round window, a lantern, a ladder, a swing and a flag.",
};

const CREAM = "#f4e7c9";
const WOOD = "#8c5b34";
const BLUE = "#3f75a8";
const GLASS = "#a6dcec";
const SHUTTER = "#3f7a4b";
const ROOF = "#b5472f";
const RIDGE = "#8a3324";
const GOLD = "#e9b64a";
const ROPE = "#d9b779";
const POLE = "#f2e4c4";
const FLAG = "#f0633f";
const LAMP = "#ffd76a";
const DARK = "#4b3428";
const STONE = "#5b4a43";
const PINK = "#f28bb0";
const YELLOW = "#ffd84a";
const WHITE = "#fff6e4";
const MUSH = "#d9472f";

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", paintSize: 2048 });
  b.joint("tree", { at: [0, 0, 0] });

  // Paints: bark streaks, grass, siding and decking planks, shingles, brick and layered leaves.
  const bark = grain("#7d5535", "#4a301b", { size: 0.08, axis: "y", seed: 2 });
  const grass = mottle("#84c456", "#4c8f36", { size: 0.45, contrast: 1.3, seed: 5 });
  const siding = stripes("#e9b872", "#c2834a", { size: 0.17, axis: "y", width: 0.46, wobble: 0.03, seed: 1 });
  const deck = stripes("#cf9758", "#a66f3a", { size: 0.2, axis: "z", width: 0.5, wobble: 0.02, seed: 4 });
  const shingles = scales(["#c85c3d", "#b84c33", "#d46d45"], "#7a2c1f", { size: 0.2, width: 0.2, seed: 7 });
  const brick = stripes("#a86350", "#8a4b3b", { size: 0.1, axis: "y", width: 0.5, wobble: 0.05, seed: 6 });
  const leaves = [
    spots("#2e7233", ["#86c74e", "#a6d861", "#5ea946"], { size: 0.24, amount: 0.55, seed: 9 }),
    spots("#3a8a3c", ["#6fb845", "#c2dd6a", "#4f9e41"], { size: 0.2, amount: 0.5, seed: 13 }),
  ];

  // Ground: a grassy mound that the trunk, roots and mushrooms stand in.
  b.lathe([[0, -0.03], [2.7, -0.03], [2.8, 0.03], [2.5, 0.08], [1.6, 0.12], [0, 0.14]], {
    color: grass,
    at: [0, 0, 0],
    segments: 14,
    name: "mound",
  });

  // Roots, trunk with a flared base, and the braces and limbs that hold the deck and canopy.
  b.capsule([-0.1, 0.1, -1.2], [0.9, 0.06, -0.9], [0.17, 0.07], { color: bark, name: "root" });
  b.capsule([-0.1, 0.1, -1.2], [-0.95, 0.06, -1.1], [0.16, 0.06], { color: bark, name: "root" });
  b.capsule([-0.1, 0.1, -1.2], [0.15, 0.06, -0.2], [0.14, 0.05], { color: bark, name: "root" });

  const trunk = catmull([
    [-0.1, -0.02, -1.2],
    [-0.12, 0.9, -1.3],
    [-0.18, 2.0, -1.4],
    [-0.24, 3.2, -1.5],
    [-0.3, 4.4, -1.6],
    [-0.35, 5.2, -1.5],
  ]);
  b.sweep(trunk, (t: number) => 0.17 + 0.1 * (1 - t) + 0.22 * (1 - t) ** 10, {
    color: bark,
    name: "trunk",
    caps: { start: "flat", end: "round" },
  });

  b.rod([-0.2, 2.1, -1.4], [-1.1, 2.44, -0.95], [0.12, 0.06], { color: bark, name: "brace" });
  b.rod([-0.2, 2.1, -1.4], [1.1, 2.44, -0.95], [0.12, 0.06], { color: bark, name: "brace" });
  b.rod([-0.2, 2.0, -1.4], [0.2, 2.44, 1.0], [0.11, 0.06], { color: bark, name: "brace" });
  b.rod([-0.35, 4.55, -1.5], [-1.5, 5.45, -1.8], [0.13, 0.05], { color: bark, name: "limb" });
  b.rod([-0.36, 4.85, -1.55], [0.4, 5.75, -1.95], [0.12, 0.05], { color: bark, name: "limb" });
  b.rod([-0.28, 3.55, -1.5], [2.05, 3.8, -1.45], [0.1, 0.045], { color: bark, name: "swing limb" });

  // Deck: planks on the trunk and braces.
  b.part(new THREE.BoxGeometry(2.6, 0.14, 2.6), deck, { at: [0, 2.55, 0], name: "deck" });

  // Railing: cream posts, rails and balusters on three sides, with gaps for the trunk and the ladder.
  const RAIL = 3.38;
  const post = (x: number, z: number) =>
    b.part(new THREE.BoxGeometry(0.08, 0.84, 0.08), CREAM, { at: [x, 3.04, z], name: "post" });
  const rail = (w: number, d: number, x: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, 0.07, d), CREAM, { at: [x, RAIL, z], name: "rail" });
  const baluster = (x: number, z: number) =>
    b.part(new THREE.BoxGeometry(0.04, 0.76, 0.04), CREAM, { at: [x, 3.0, z], name: "baluster" });
  post(-1.24, -1.24);
  post(1.24, -1.24);
  post(1.24, 1.24);
  post(-1.24, 1.24);
  post(-0.45, 1.24);
  rail(0.8, 0.07, -0.9, -1.24);
  rail(1.25, 0.07, 0.675, -1.24);
  rail(0.07, 2.6, 1.24, 0);
  rail(0.07, 2.6, -1.24, 0);
  rail(1.69, 0.07, 0.395, 1.24);
  for (let x = -1.1; x < 1.2; x += 0.22) if (x < -0.5 || x > 0.1) baluster(x, -1.24);
  for (let z = -1.1; z < 1.2; z += 0.22) {
    baluster(-1.24, z);
    baluster(1.24, z);
  }
  for (let x = -0.23; x < 1.2; x += 0.22) baluster(x, 1.24);

  // Ladder: two rails and six rungs from the grass up to the front-left of the deck.
  const railAt = (x: number, t: number) => [x, 0.04 + 2.62 * t, 2.5 - 1.25 * t];
  b.rod(railAt(-1.0, 0), railAt(-1.0, 1), 0.032, { color: WOOD, name: "ladder rail" });
  b.rod(railAt(-0.6, 0), railAt(-0.6, 1), 0.032, { color: WOOD, name: "ladder rail" });
  for (let k = 1; k <= 6; k++) {
    const t = k / 7;
    b.rod(railAt(-1.0, t), railAt(-0.6, t), 0.022, { color: WOOD, name: "rung" });
  }

  // Cabin: one pentagon, extruded through the walls and into the gables.
  b.extrude(
    [
      [-1, 0],
      [1, 0],
      [1, 1.8],
      [0, 2.56],
      [-1, 1.8],
    ],
    { color: siding, at: [0, 2.62, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 2, name: "cabin" },
  );

  // Roof: two shingled panels meeting at a ridge, cream fascias at the eaves, a brick chimney.
  const pitch = (Math.atan2(0.9, 1.2) * 180) / Math.PI;
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(1.52, 0.1, 2.66), shingles, {
      at: [0.6 * s, 4.77, 0],
      rotation: [0, 0, -s * pitch],
      name: "roof",
    });
  b.part(new THREE.BoxGeometry(0.16, 0.1, 2.72), RIDGE, { at: [0, 5.26, 0], name: "ridge" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.08, 0.24, 2.72), CREAM, { at: [1.2 * s, 4.2, 0], name: "fascia" });
  b.part(new THREE.BoxGeometry(0.34, 1.1, 0.34), brick, { at: [0.75, 4.86, -0.55], name: "chimney" });
  b.part(new THREE.BoxGeometry(0.44, 0.08, 0.44), STONE, { at: [0.75, 5.44, -0.55] });

  // Front: round gable window, door with a cream frame and awning, a lantern on a bracket, a knob.
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 14), CREAM, {
    at: [0, 4.55, 1.04],
    rotation: [90, 0, 0],
    name: "round window",
  });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 14), GLASS, { at: [0, 4.55, 1.1], rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.38, 0.035, 0.035), CREAM, { at: [0, 4.55, 1.12] });
  b.part(new THREE.BoxGeometry(0.035, 0.38, 0.035), CREAM, { at: [0, 4.55, 1.12] });

  b.part(new THREE.BoxGeometry(0.62, 1.1, 0.06), CREAM, { at: [-0.35, 3.17, 1.03], name: "door frame" });
  b.part(new THREE.BoxGeometry(0.5, 1.0, 0.05), BLUE, { at: [-0.35, 3.12, 1.085], name: "door" });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), GOLD, { at: [-0.2, 3.1, 1.13], name: "knob" });
  b.part(new THREE.BoxGeometry(0.92, 0.07, 0.36), ROOF, { at: [-0.35, 3.8, 1.2], name: "awning" });

  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.2), DARK, { at: [0.55, 3.8, 1.1], name: "lantern arm" });
  b.rod([0.55, 3.8, 1.1], [0.55, 3.62, 1.1], 0.01, { color: DARK, name: "lantern chain" });
  b.part(new THREE.BoxGeometry(0.14, 0.2, 0.14), LAMP, { at: [0.55, 3.5, 1.1], name: "lantern" });
  b.part(new THREE.BoxGeometry(0.17, 0.03, 0.17), DARK, { at: [0.55, 3.615, 1.1] });
  b.part(new THREE.BoxGeometry(0.16, 0.03, 0.16), DARK, { at: [0.55, 3.385, 1.1] });

  // Sides: a window with mullions, green shutters, a flower box with blooms.
  for (const s of [1, -1]) {
    const x = s * 1.0;
    b.part(new THREE.BoxGeometry(0.05, 0.62, 0.86), CREAM, { at: [x + s * 0.025, 3.35, 0], name: "window frame" });
    b.part(new THREE.BoxGeometry(0.03, 0.5, 0.74), GLASS, { at: [x + s * 0.05, 3.35, 0] });
    b.part(new THREE.BoxGeometry(0.02, 0.5, 0.03), CREAM, { at: [x + s * 0.07, 3.35, 0] });
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.74), CREAM, { at: [x + s * 0.07, 3.35, 0] });
    for (const z of [-0.56, 0.56])
      b.part(new THREE.BoxGeometry(0.03, 0.56, 0.2), SHUTTER, { at: [x + s * 0.03, 3.35, z], name: "shutter" });
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.9), WOOD, { at: [x + s * 0.1, 2.98, 0], name: "flower box" });
    for (let k = -4; k <= 4; k++)
      b.part(new THREE.IcosahedronGeometry(0.06, 0), k % 2 ? PINK : YELLOW, {
        at: [x + s * 0.1, 3.12, k * 0.1],
        name: "flower",
      });
  }

  // Back: a smaller window, facing the trunk.
  b.part(new THREE.BoxGeometry(0.66, 0.62, 0.05), CREAM, { at: [0.4, 3.35, -1.025], name: "window frame" });
  b.part(new THREE.BoxGeometry(0.5, 0.5, 0.03), GLASS, { at: [0.4, 3.35, -1.05] });
  b.part(new THREE.BoxGeometry(0.02, 0.5, 0.03), CREAM, { at: [0.4, 3.35, -1.07] });
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.03), CREAM, { at: [0.4, 3.35, -1.07] });

  // Flag: a pole on the ridge with a swallowtail pennant.
  b.rod([0, 5.0, -0.5], [0, 6.25, -0.5], 0.022, { color: POLE, name: "flag pole" });
  b.extrude(
    [
      [0, 0],
      [0.75, -0.08],
      [0.6, -0.2],
      [0.75, -0.32],
      [0, -0.4],
    ],
    { color: FLAG, at: [0, 6.2, -0.5], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, name: "flag" },
  );

  // Swing hanging from the limb beside the deck.
  b.rod([1.95, 3.78, -1.45], [1.95, 1.35, -1.45], 0.012, { color: ROPE, name: "swing rope" });
  b.rod([2.15, 3.78, -1.45], [2.15, 1.35, -1.45], 0.012, { color: ROPE, name: "swing rope" });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.24), WOOD, { at: [2.05, 1.32, -1.45], name: "swing seat" });

  // Canopy: clumps of faceted leaves round the top of the trunk, the limbs and the swing.
  const canopy: Array<[number, number, number, number, number]> = [
    [-2.0, 3.35, -1.4, 0.5, 0],
    [-2.2, 4.45, -1.35, 0.66, 1],
    [-1.55, 5.45, -1.95, 0.8, 0],
    [-0.45, 5.98, -2.05, 0.9, 1],
    [0.85, 5.65, -1.95, 0.76, 0],
    [1.95, 4.5, -1.8, 0.75, 1],
    [2.5, 3.25, -1.05, 0.55, 0],
    [0.25, 6.4, -1.5, 0.55, 1],
    [-0.95, 4.8, -2.25, 0.6, 0],
  ];
  for (const [x, y, z, r, k] of canopy) {
    b.part(new THREE.IcosahedronGeometry(r, 1), leaves[k], { at: [x, y, z], flat: true, name: "leaves" });
    b.part(new THREE.IcosahedronGeometry(r * 0.7, 1), leaves[1 - k], {
      at: [x + r * 0.55, y - r * 0.2, z + r * 0.3],
      flat: true,
      name: "leaves",
    });
  }

  // Ground: bushes at the deck's corners and two mushrooms at the roots.
  b.part(new THREE.IcosahedronGeometry(0.38, 1), leaves[1], { at: [1.85, 0.34, 1.6], flat: true, name: "bush" });
  b.part(new THREE.IcosahedronGeometry(0.34, 1), leaves[0], { at: [-1.95, 0.32, 0.9], flat: true, name: "bush" });

  const mushroom = (x: number, z: number, s: number) => {
    b.lathe(
      [
        [0, 0],
        [0.045 * s, 0],
        [0.05 * s, 0.06 * s],
        [0.04 * s, 0.12 * s],
        [0, 0.12 * s],
      ],
      { color: CREAM, at: [x, 0, z], segments: 8, name: "mushroom stem" },
    );
    b.lathe(
      [
        [0, 0.08 * s],
        [0.12 * s, 0.08 * s],
        [0.14 * s, 0.1 * s],
        [0.12 * s, 0.13 * s],
        [0.06 * s, 0.15 * s],
        [0, 0.155 * s],
      ],
      { color: MUSH, at: [x, 0, z], segments: 8, name: "mushroom cap" },
    );
    for (const [dx, dy, dz] of [
      [0.05, 0.14, 0.02],
      [-0.04, 0.13, 0.06],
      [0.0, 0.15, -0.06],
    ])
      b.part(new THREE.IcosahedronGeometry(0.022 * s, 0), WHITE, { at: [x + dx * s, dy * s, z + dz * s] });
  };
  mushroom(-0.6, -0.5, 1.0);
  mushroom(-0.4, -0.22, 0.7);

  return b.root;
}
```