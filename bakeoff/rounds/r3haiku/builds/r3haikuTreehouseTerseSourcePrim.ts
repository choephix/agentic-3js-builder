import * as THREE from "three";
import { createBuilder, grain, mottle, scales, slab } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description:
    "A small plank cabin high in an oak: wood-grain walls, shingled pyramid roof, railed platform, ladder, lit window, flag and a leafy crown.",
};

type V = [number, number, number];

export default function treehouse() {
  const b = createBuilder({ name: "treehouse", paintSize: 1024 });

  // One root joint: every part is rigid on the ground, so the tree and the house move as one.
  b.joint("base", { at: [0, 0, 0] });

  const bark = mottle("#7a5234", "#4a3220", { size: 0.5, seed: 3, contrast: 1.2 });
  const planks = grain("#d7a46c", "#a86f3d", { size: 0.18, seed: 4 });
  const floorWood = grain("#c58d55", "#8f5c33", { size: 0.14, seed: 8 });
  const shingles = scales(["#9b4a32", "#8a3f2a", "#a65a3a"], "#4a2418", { size: 0.35, seed: 2 });
  const leaves = mottle("#2f6b2a", "#7ab84a", { size: 0.5, seed: 7, contrast: 1.4 });
  const seg = (n: number) => b.segments(n);

  const box = (w: number, h: number, d: number, at: V, color: string | ReturnType<typeof mottle>) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at });

  // ---- Tree -----------------------------------------------------------------------------------
  // Trunk: tapered, from the ground to inside the cabin.
  b.part(new THREE.CylinderGeometry(0.3, 0.55, 6.2, seg(10)), bark, { at: [0, 3.1, 0] });

  // Branches holding up the platform: a tapered rod from the trunk to the platform's underside.
  b.rod([0, 2.6, 0], [-1.9, 3.4, -1.9], [0.2, 0.08], { color: bark });
  b.rod([0, 2.6, 0], [1.9, 3.4, -1.9], [0.2, 0.08], { color: bark });
  b.rod([0, 2.9, 0], [-1.9, 3.4, 1.9], [0.18, 0.07], { color: bark });

  // Canopy branches, mostly hidden behind the cabin.
  b.rod([0, 5.0, 0], [-2.8, 7.2, -2.6], [0.18, 0.06], { color: bark });
  b.rod([0, 5.2, 0], [2.9, 7.6, -2.2], [0.16, 0.05], { color: bark });
  b.rod([0, 5.0, 0], [0.2, 7.0, -3.4], [0.14, 0.05], { color: bark });

  // Leafy crown: low-poly spheres, a few tones, clustered around the branch tips.
  const crown: Array<[number, number, number, number]> = [
    [-3.2, 7.6, -2.8, 1.1],
    [2.9, 8.0, -2.4, 1.2],
    [0.2, 8.6, -3.6, 1.3],
    [-1.2, 8.3, -4.2, 0.9],
    [3.6, 6.9, -0.8, 1.0],
    [-3.6, 6.6, 0.8, 0.95],
    [-2.2, 8.9, -1.0, 1.0],
    [1.2, 9.0, -1.8, 0.8],
  ];
  for (const [x, y, z, r] of crown)
    b.part(new THREE.SphereGeometry(r, seg(10), seg(7)), leaves, { at: [x, y, z] });

  // ---- Platform -------------------------------------------------------------------------------
  box(4.0, 0.2, 4.0, [0, 3.5, 0], floorWood);

  // Railing: posts at the corners, top rails on three sides with a gap at the ladder.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.1, 0.8, 0.1, [sx * 1.9, 4.0, sz * 1.9], planks);
  box(1.4, 0.08, 0.08, [-1.2, 4.4, 1.9], planks);
  box(1.4, 0.08, 0.08, [1.2, 4.4, 1.9], planks);
  box(3.8, 0.08, 0.08, [0, 4.4, -1.9], planks);
  box(0.08, 0.08, 3.8, [-1.9, 4.4, 0], planks);
  box(0.08, 0.08, 3.8, [1.9, 4.4, 0], planks);

  // ---- Cabin ----------------------------------------------------------------------------------
  // Walls: 3.2 square, 1.9 tall, standing on the platform (top at y 5.5).
  box(3.2, 1.9, 0.12, [0, 4.55, -1.6], planks); // back
  box(0.12, 1.9, 3.2, [-1.6, 4.55, 0], planks); // left
  box(0.12, 1.9, 3.2, [1.6, 4.55, 0], planks); // right
  // Front wall with a door opening (x −0.4..0.4, y 3.6..5.0).
  box(1.2, 1.9, 0.12, [-1.0, 4.55, 1.6], planks);
  box(1.2, 1.9, 0.12, [1.0, 4.55, 1.6], planks);
  box(0.8, 0.5, 0.12, [0, 5.25, 1.6], planks);
  // The dark doorway and the warm interior behind it.
  box(0.8, 1.4, 0.04, [0, 4.3, 1.56], "#3b2a1a");
  box(0.6, 0.5, 0.04, [0, 4.4, -1.56], "#ffcf6a");

  // Side windows: a glowing pane with a trim frame, on each side wall.
  for (const s of [-1, 1]) {
    const x = s * 1.7;
    box(0.06, 0.7, 0.9, [s * 1.72, 4.8, 0], "#ffd27a");
    box(0.08, 0.1, 1.1, [x, 5.15, 0], "#5a3a20");
    box(0.08, 0.1, 1.1, [x, 4.45, 0], "#5a3a20");
    box(0.08, 0.8, 0.1, [x, 4.8, 0.55], "#5a3a20");
    box(0.08, 0.8, 0.1, [x, 4.8, -0.55], "#5a3a20");
  }

  // Lantern beside the door.
  box(0.22, 0.3, 0.22, [1.0, 5.25, 1.7], "#ffb347");

  // Roof: a four-sided cone turned to sit square on the walls.
  b.part(new THREE.ConeGeometry(2.3, 1.8, 4), shingles, {
    at: [0, 6.4, 0],
    rotation: [0, 45, 0],
  });

  // ---- Ladder ---------------------------------------------------------------------------------
  for (const x of [-0.35, 0.35]) box(0.08, 3.6, 0.08, [x, 1.8, 2.15], planks);
  for (let i = 0; i < 8; i++) box(0.7, 0.07, 0.07, [0, 0.35 + i * 0.4, 2.15], planks);

  // ---- Flag on the roof -----------------------------------------------------------------------
  b.rod([0, 7.3, 0], [0, 8.6, 0], 0.04, { color: "#5a3a20" });
  slab(
    [
      [0, 8.55, 0.0],
      [0, 8.55, 0.9],
      [0, 8.2, 0.0],
    ],
    { color: "#d64c3c", thickness: 0.03, name: "flag" },
  );

  return b.root;
}
