import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Sky Island Ruins",
  description:
    "A floating sky island with a grassy top, hanging rock underside, ancient ruined arch and pillars, a waterfall spilling off the edge, stylized trees and glowing crystals.",
};

export default function build() {
  const b = createBuilder({ name: "skyIsland", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);

  const GRASS = cel("#7fd857", "#3fa86a");
  const GRASS2 = cel("#a6ec6a", "#55b86a");
  const DIRT = cel("#a97c55", "#6f4a4a");
  const ROCK = cel("#a99dc0", "#6f6590");
  const ROCK2 = cel("#8d82a8", "#5a5280");
  const STONE = cel("#e3d9c4", "#a79bb5");
  const MOSS = cel("#6cc060", "#3b8a5a");
  const WATER = cel("#5ccbea", "#2f8fc8");
  const FOAM = cel("#ffffff", "#c6d8f0");
  const TRUNK = cel("#8a5a4a", "#5a3a4a");
  const PINK = cel("#ffb3d2", "#e0709f");
  const LEAF = cel("#4fc070", "#2a8a68");
  const GOLD = cel("#ffd35a", "#e0952f");

  const tex = (inner: string, vb: string, size = 128) =>
    b.part; // placeholder to keep helper scope tidy
  void tex;

  // Island top: faceted disc
  b.part(new THREE.CylinderGeometry(1.2, 1.1, 0.14, 12), GRASS, { bone: base, at: [0, 1.3, 0] });
  b.part(new THREE.CylinderGeometry(1.1, 1.05, 0.1, 12), DIRT, { bone: base, at: [0, 1.18, 0] });
  // hanging rock underside
  b.part(new THREE.CylinderGeometry(1.05, 0.6, 0.45, 9), ROCK, { bone: base, at: [0, 0.9, 0], rotation: [0, 12, 0] });
  b.part(new THREE.CylinderGeometry(0.6, 0.3, 0.45, 7), ROCK2, { bone: base, at: [0, 0.48, 0] });
  b.part(new THREE.ConeGeometry(0.3, 0.45, 6), ROCK, { bone: base, at: [0, 0.04, 0], rotation: [180, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const h = 0.25 + R() * 0.25;
    b.part(new THREE.ConeGeometry(0.1 + R() * 0.05, h, 5), i % 2 ? ROCK2 : ROCK, {
      bone: base,
      at: [Math.cos(a) * 0.7, 0.62 - h / 2 + 0.1, Math.sin(a) * 0.7],
      rotation: [180, 0, 0],
    });
  }
  // grass tufts mounds
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2;
    const r = 0.5 + R() * 0.6;
    b.part(new THREE.SphereGeometry(0.1, 6, 4), GRASS2, {
      bone: base,
      at: [Math.cos(a) * r, 1.38, Math.sin(a) * r],
      scale: [1.4, 0.5, 1.2],
    });
  }

  // Ruins: pillars and arch
  const pillar = (x: number, z: number, h: number) => {
    b.part(new THREE.CylinderGeometry(0.075, 0.09, h, 6), STONE, { bone: base, at: [x, 1.37 + h / 2, z] });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.2), STONE, { bone: base, at: [x, 1.4, z] });
    b.part(new THREE.BoxGeometry(0.19, 0.05, 0.19), STONE, { bone: base, at: [x, 1.37 + h, z] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6), MOSS, { bone: base, at: [x, 1.37 + h * 0.6, z] });
  };
  pillar(-0.45, -0.25, 0.7);
  pillar(0.1, -0.25, 0.7);
  pillar(-0.8, 0.1, 0.35);
  pillar(0.5, 0.0, 0.25);
  b.part(new THREE.BoxGeometry(0.7, 0.1, 0.2), STONE, { bone: base, at: [-0.175, 2.12, -0.25] });
  b.part(new THREE.BoxGeometry(0.3, 0.07, 0.18), MOSS, { bone: base, at: [-0.2, 2.2, -0.25] });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), "#8be8ff", { bone: base, at: [-0.175, 1.85, -0.25] }), 1.5);
  b.part(new THREE.TorusGeometry(0.075, 0.012, 4, 10), GOLD, { bone: base, at: [-0.175, 1.85, -0.25] });
  // broken blocks
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(0.12, 0.08, 0.1), i % 2 ? STONE : MOSS, {
      bone: base,
      at: [-0.6 + i * 0.25, 1.41, 0.3 + (i % 2) * 0.1],
      rotation: [0, i * 30, 0],
    });
  }
  // altar platform
  b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.06, 8), STONE, { bone: base, at: [-0.2, 1.4, -0.05] });

  // Waterfall: river across the top and sheet over the edge
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.8), WATER, { bone: base, at: [0.7, 1.38, 0.55], rotation: [0, 50, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.9, 0.04), WATER, { bone: base, at: [1.0, 0.9, 0.9], rotation: [0, 35, 0] });
  b.part(new THREE.SphereGeometry(0.14, 6, 4), FOAM, { bone: base, at: [1.0, 1.38, 0.88], scale: [1.2, 0.5, 0.8] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.SphereGeometry(0.07 - i * 0.01, 6, 4), FOAM, { bone: base, at: [1.08 + i * 0.05, 0.42 - i * 0.12, 1.0 + i * 0.05] });

  // Trees
  const tree = (x: number, z: number, s: number, blossom: boolean) => {
    b.sweep(catmull([[x, 1.35, z], [x + 0.03 * s, 1.35 + 0.2 * s, z], [x - 0.02, 1.35 + 0.4 * s, z + 0.02]]), [0.05 * s, 0.025 * s], {
      color: TRUNK, bone: base, sides: 6, caps: "round",
    });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.IcosahedronGeometry((0.2 - k * 0.03) * s, 1), blossom ? (k % 2 ? PINK : cel("#ffd0e4", "#e890b8")) : k % 2 ? LEAF : GRASS, {
        bone: base,
        at: [x + (k - 1) * 0.1 * s, 1.8 * s + 0.0 + (1.35 - 1.8 * s) + 0.1 * k * s, z + (k % 2) * 0.06],
      });
  };
  tree(0.7, -0.5, 1.2, true);
  tree(-0.8, -0.55, 1.0, false);
  tree(0.3, 0.7, 0.8, false);
  tree(-0.5, 0.65, 0.9, true);

  // Floating crystals and small rocks
  [[1.3, 2.0, -0.4], [-1.3, 1.8, 0.5], [0.2, 2.5, 0.2]].forEach(([x, y, z], i) => {
    glow(b.part(new THREE.OctahedronGeometry(0.08 + i * 0.01, 0), "#7fe0ff", { bone: base, at: [x, y, z], scale: [0.7, 1.4, 0.7] }), 1.5);
  });
  [[1.5, 1.5, -0.8, 0.15], [-1.5, 1.0, -0.6, 0.12]].forEach(([x, y, z, r]) => {
    b.part(new THREE.IcosahedronGeometry(r, 0), ROCK, { bone: base, at: [x, y, z] });
    b.part(new THREE.SphereGeometry(r * 0.8, 6, 4), GRASS, { bone: base, at: [x, y + r * 0.7, z], scale: [1, 0.3, 1] });
  });

  return b.root;
}
