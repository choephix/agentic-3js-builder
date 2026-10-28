import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "dungeon props",
  description: "Blockout of a dungeon prop group: treasure chest, two wall torches on posts, barrels, bones and a spike trap on a stone floor slab.",
};

export default function build() {
  const b = createBuilder({ name: "dungeonProps" });
  const base = b.joint("base", { at: [0, 0, 0] });

  const STONE = "#5a5868";
  const WOOD = "#7a4a26";
  const DARK = "#4a2c16";
  const IRON = "#3a3c48";
  const GOLD = "#d9a82e";
  const BONE = "#e8e0c8";
  const FIRE = "#ff9a2a";
  const SPIKE = "#a8aebb";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: base, at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: base, at: [x, y, z] });

  // floor slab (top at y=0.1, sunk slightly)
  box(3.2, 0.1, 2.4, STONE, 0, 0.04, 0);

  // chest at left-back
  box(0.8, 0.4, 0.5, WOOD, 0.8, 0.3, -0.5);
  cyl(0.25, 0.25, 0.8, 8, DARK, 0.8, 0.5, -0.5).mesh.rotation.z = Math.PI / 2;
  box(0.84, 0.08, 0.54, IRON, 0.8, 0.36, -0.5);
  box(0.1, 0.12, 0.04, GOLD, 0.8, 0.4, -0.26);

  // barrels
  cyl(0.26, 0.26, 0.7, 8, WOOD, -0.9, 0.45, -0.5);
  cyl(0.27, 0.27, 0.06, 8, IRON, -0.9, 0.3, -0.5);
  cyl(0.27, 0.27, 0.06, 8, IRON, -0.9, 0.6, -0.5);
  cyl(0.22, 0.22, 0.55, 8, DARK, -0.4, 0.38, -0.8);
  cyl(0.23, 0.23, 0.05, 8, IRON, -0.4, 0.5, -0.8);

  // torches on posts
  for (const s of [1, -1]) {
    box(0.1, 1.3, 0.1, DARK, s * 1.4, 0.7, -0.9);
    box(0.14, 0.1, 0.14, IRON, s * 1.4, 1.38, -0.9);
    b.part(new THREE.ConeGeometry(0.1, 0.28, 6), FIRE, { bone: base, at: [s * 1.4, 1.57, -0.9] });
    box(0.08, 0.12, 0.08, "#ffe070", s * 1.4, 1.55, -0.9);
  }

  // spike trap: plate with spikes
  box(0.8, 0.04, 0.8, IRON, 0.3, 0.11, 0.65);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      b.part(new THREE.ConeGeometry(0.05, 0.28, 4), SPIKE, {
        bone: base,
        at: [0.08 + i * 0.22, 0.27, 0.43 + j * 0.22],
      });

  // bones: skull and scattered long bones
  b.part(new THREE.SphereGeometry(0.13, 6, 5), BONE, { bone: base, at: [-0.9, 0.2, 0.6] });
  box(0.14, 0.06, 0.1, BONE, -0.9, 0.12, 0.72);
  const bone1 = b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), BONE, { bone: base, at: [-0.4, 0.13, 0.7] });
  bone1.mesh.rotation.z = Math.PI / 2;
  bone1.mesh.rotation.x = 0.4;
  const bone2 = b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 5), BONE, { bone: base, at: [-1.2, 0.13, 0.2] });
  bone2.mesh.rotation.z = Math.PI / 2;
  bone2.mesh.rotation.y = 0.8;

  return b.root;
}
