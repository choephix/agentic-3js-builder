import * as THREE from "three";
import { createBuilder, grain, mottle, paint, scales } from "../../../../src/index";

export const meta = {
  name: "Treehouse diorama",
  description: "A cozy treehouse cabin in an old oak on a grassy round base, with a swing, rope ladder, lantern, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });

  // Materials: one paint per surface kind, all painted into the shared sheet.
  const grass = mottle("#63b043", "#4a9a33", { size: 0.25 });
  const soil = mottle("#7a5233", "#55371f", { size: 0.2 });
  const ground = paint((_p, n) => (n.y > 0.5 ? grass : soil));
  const bark = grain("#7a5636", "#4f351e", { size: 0.12, axis: "y" });
  const leaf = mottle("#3f8f35", "#7cc24a", { size: 0.5 });
  const leafDeep = mottle("#2f7a2b", "#5aa83c", { size: 0.35 });
  const plank = grain("#ecc690", "#cf9d62", { size: 0.06, axis: "y" });
  const deck = grain("#b07a45", "#8a5a2e", { size: 0.08, axis: "x" });
  const shingle = scales(["#c0392b", "#b03a2e", "#a93226"], "#6e1f17", { size: 0.16 });
  const rope = "#c8a46a";
  const dark = "#3b2a1c";
  const door = "#5b3a22";
  const glow = "#ffd45e";
  const pennant = "#f2c230";

  // Ground: a round grassy base, grass on top and soil at the rim.
  b.part(new THREE.CylinderGeometry(2, 2.1, 0.3, 40), ground, { at: [0, 0.15, 0] });

  // Oak trunk: a tapering tube with bark grain, then branches.
  b.sweep(
    [
      [0, 0.1, 0],
      [0.04, 1.8, 0.02],
      [0.02, 3.4, 0.05],
      [0.1, 4.6, 0.0],
    ],
    (t: number) => 0.42 - 0.2 * t,
    { color: bark, sides: 10, caps: "flat" },
  );
  b.rod([0, 4.0, 0], [-1.3, 4.9, 0.4], [0.12, 0.05], { color: bark });
  b.rod([0, 4.4, 0], [0.9, 5.6, -0.4], [0.12, 0.05], { color: bark });
  // Branch carrying the swing.
  b.rod([0.02, 3.3, -0.05], [1.95, 3.95, -0.35], [0.1, 0.05], { color: bark });

  // Wide leafy crown: a cluster of low-poly leaf masses.
  const crown: Array<[number, number, number, number, boolean]> = [
    [0, 5.6, 0, 1.25, false],
    [-1.3, 5.0, 0.2, 1.0, false],
    [1.3, 5.1, 0.1, 1.05, false],
    [-0.5, 6.1, 0.2, 0.95, true],
    [0.9, 6.0, -0.7, 0.95, true],
    [-1.2, 4.6, -0.9, 0.9, false],
    [1.4, 4.6, -0.9, 0.85, true],
    [0.2, 4.9, -1.2, 0.9, false],
  ];
  for (const [x, y, z, r, deep] of crown)
    b.part(new THREE.IcosahedronGeometry(r, 1), deep ? leafDeep : leaf, { at: [x, y, z] });

  // Treehouse platform, held up by posts.
  b.part(new THREE.BoxGeometry(2.8, 0.12, 2.4), deck, { at: [0, 2.96, 0.9] });
  b.rod([1.3, 0.3, 2.0], [1.3, 2.96, 2.0], 0.05, { color: deck });
  b.rod([-1.7, 0.3, 1.9], [-1.7, 2.96, 1.9], 0.05, { color: deck });

  // Cabin walls with plank grain.
  b.part(new THREE.BoxGeometry(2.0, 1.4, 1.6), plank, { at: [0, 3.72, 0.9] });

  // Gable ends (front and back), triangles in the xy plane.
  const gable: Array<[number, number, number]> = [
    [0, 4.42, 1.7],
    [0, 4.42, 0.1],
  ];
  for (const [x, y, z] of gable)
    b.extrude(
      [
        [-1.0, 0],
        [1.0, 0],
        [0, 0.78],
      ],
      { color: plank, at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12 },
    );

  // Red shingle roof: two slopes meeting at a ridge that runs front to back.
  b.part(new THREE.BoxGeometry(1.45, 0.1, 2.5), shingle, { at: [0.56, 4.8, 0.9], rotation: [0, 0, -35] });
  b.part(new THREE.BoxGeometry(1.45, 0.1, 2.5), shingle, { at: [-0.56, 4.8, 0.9], rotation: [0, 0, 35] });

  // Door and round window on the front.
  b.part(new THREE.BoxGeometry(0.5, 0.92, 0.06), door, { at: [-0.35, 3.48, 1.72] });
  b.part(new THREE.TorusGeometry(0.24, 0.04, 8, 16), door, { at: [0.5, 3.95, 1.74] });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), "#ffe08a", {
    at: [0.5, 3.95, 1.72],
    rotation: [90, 0, 0],
  });

  // Lantern by the door, on a bracket.
  b.rod([-0.95, 3.95, 1.72], [-0.95, 3.95, 1.95], 0.025, { color: dark });
  b.rod([-0.95, 3.95, 1.95], [-0.95, 3.86, 1.95], 0.01, { color: dark });
  b.part(new THREE.CylinderGeometry(0.13, 0.11, 0.04, 6), dark, { at: [-0.95, 3.87, 1.95] });
  b.part(new THREE.IcosahedronGeometry(0.1, 1), glow, { at: [-0.95, 3.74, 1.95] });
  b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.04, 6), dark, { at: [-0.95, 3.6, 1.95] });

  // Pennant flag on the roof ridge.
  b.rod([0, 5.19, 0.9], [0, 5.95, 0.9], 0.02, { color: deck });
  b.extrude(
    [
      [0, 0],
      [0.9, 0.12],
      [0, 0.26],
    ],
    { color: pennant, at: [0, 5.62, 0.92], thickness: 0.015 },
  );

  // Rope ladder hanging from the platform's front edge.
  const ladderTop = 3.0;
  const ladderBottom = 0.5;
  b.rod([-1.25, ladderTop, 2.3], [-1.25, ladderBottom, 2.3], 0.025, { color: rope });
  b.rod([-0.75, ladderTop, 2.3], [-0.75, ladderBottom, 2.3], 0.025, { color: rope });
  for (let i = 0; i < 9; i++) {
    const y = ladderBottom + ((ladderTop - ladderBottom) * (i + 0.5)) / 9;
    b.rod([-1.25, y, 2.3], [-0.75, y, 2.3], 0.022, { color: rope });
  }

  // Wooden swing hanging from the side branch.
  const anchorA: [number, number, number] = [1.45, 3.78, -0.27];
  const anchorB: [number, number, number] = [1.75, 3.88, -0.32];
  b.rod(anchorA, [1.4, 2.33, -0.3], 0.02, { color: rope });
  b.rod(anchorB, [1.8, 2.33, -0.3], 0.02, { color: rope });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.25), deck, { at: [1.6, 2.3, -0.3] });

  // Mushrooms at the foot of the tree.
  const mushroom = (x: number, z: number, s: number, cap: string) => {
    b.part(new THREE.CylinderGeometry(0.03 * s, 0.04 * s, 0.08 * s, 8), "#f4ecd8", {
      at: [x, 0.3 + 0.04 * s, z],
    });
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.07, 0.02],
        [0.08, 0.05],
        [0.05, 0.07],
        [0, 0.075],
      ],
      { color: cap, at: [x, 0.3 + 0.06 * s, z], segments: 10 },
    );
    for (const [dx, dz] of [
      [0.03, 0.01],
      [-0.02, -0.03],
    ]) {
      b.part(new THREE.SphereGeometry(0.018 * s, 6, 4), "#fff6e0", {
        at: [x + dx * s, 0.3 + 0.12 * s, z + dz * s],
      });
    }
  };
  mushroom(0.9, 0.6, 1.0, "#e74c3c");
  mushroom(1.08, 0.42, 0.7, "#d35400");
  mushroom(0.72, 0.36, 0.5, "#e74c3c");

  // Bicycle leaning on the back side of the tree, wheels in the xy plane (moving along +Z).
  const wheelR = 0.3;
  const rear: [number, number, number] = [-0.9, 0.3 + 0.33, -1.5];
  const front: [number, number, number] = [-0.9, 0.3 + 0.33, -0.5];
  b.part(new THREE.TorusGeometry(wheelR, 0.03, 6, 16), "#2b2b2b", { at: rear });
  b.part(new THREE.TorusGeometry(wheelR, 0.03, 6, 16), "#2b2b2b", { at: front });
  const frame = "#d64541";
  b.rod([-0.9, 0.63, -1.0], [-0.9, 1.0, -1.15], 0.025, { color: frame });
  b.rod([-0.9, 1.0, -1.15], [-0.9, 1.05, -0.55], 0.025, { color: frame });
  b.rod([-0.9, 0.63, -1.0], [-0.9, 1.05, -0.55], 0.03, { color: frame });
  b.rod([-0.9, 0.63, -1.0], [-0.9, 0.63, -1.5], 0.02, { color: frame });
  b.rod([-0.9, 1.05, -0.55], [-0.9, 0.63, -0.5], 0.02, { color: frame });
  b.rod([-0.9, 1.05, -0.55], [-0.9, 1.12, -0.6], 0.02, { color: frame });
  b.rod([-0.98, 1.12, -0.6], [-0.82, 1.12, -0.6], 0.018, { color: "#222" });
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.18), "#222", { at: [-0.9, 1.02, -1.2] });

  // A few low bushes around the rim.
  for (const [x, z, r] of [
    [1.7, 0.2, 0.3],
    [-1.75, 0.1, 0.25],
    [1.2, -1.4, 0.25],
  ] as const)
    b.part(new THREE.IcosahedronGeometry(r, 1), leafDeep, { at: [x, 0.3 + r * 0.6, z] });

  return b.root;
}
