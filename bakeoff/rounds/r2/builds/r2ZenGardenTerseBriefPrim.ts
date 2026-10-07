import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden",
  description: "A small Zen garden with raked gravel, rocks, a pond with a bridge, a stone lantern, a pine, a maple and a bamboo fence.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "japanese_garden" });
  b.joint("root", { at: [0, 0, 0] });
  const r = rng(7);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (rad: number) => new THREE.IcosahedronGeometry(rad, 1);

  // ground base (moss)
  b.part(box(8, 0.2, 8), "#5f8a4a", { at: [0, -0.01, 0] });
  // gravel bed
  b.part(box(3.6, 0.06, 3.2), "#e6dfcc", { at: [-1.8, 0.12, 1.4] });
  // rake lines
  for (let i = 0; i < 9; i++) {
    b.part(box(3.4, 0.02, 0.04), "#c9c1a8", { at: [-1.8, 0.16, 0.0 + i * 0.35 - 0.0 + 0.0] });
  }
  // stone border
  const gx = -1.8, gz = 1.4;
  b.part(box(3.8, 0.12, 0.12), "#8a8a85", { at: [gx, 0.13, gz - 1.7] });
  b.part(box(3.8, 0.12, 0.12), "#8a8a85", { at: [gx, 0.13, gz + 1.7] });
  b.part(box(0.12, 0.12, 3.4), "#8a8a85", { at: [gx - 1.9, 0.13, gz] });
  b.part(box(0.12, 0.12, 3.4), "#8a8a85", { at: [gx + 1.9, 0.13, gz] });

  // zen rocks
  const rocks: [number, number, number, number][] = [[-2.4, 1.8, 0.35, 0.8], [-1.3, 1.1, 0.25, 1], [-0.9, 2.0, 0.18, 1.2]];
  for (const [x, z, s, h] of rocks) {
    b.part(sph(s), "#6e6e70", { at: [x, 0.15 + s * 0.6, z], scale: [1.2, h, 1], rotation: [r() , r() * 3, 0] } as any);
    b.part(sph(s * 0.5), "#7d7d7f", { at: [x + s * 0.7, 0.15 + s * 0.3, z + s * 0.3] });
  }

  // pond
  const px = 1.8, pz = 1.2;
  b.part(cyl(1.6, 1.7, 0.1, 14), "#7b7b78", { at: [px, 0.06, pz], scale: [1.2, 1, 0.9] } as any);
  b.part(cyl(1.5, 1.5, 0.1, 14), "#3f7fa6", { at: [px, 0.1, pz], scale: [1.2, 1, 0.9] } as any);
  // lily pads
  for (let i = 0; i < 5; i++) {
    const a = r() * 6.28, d = r() * 1.0;
    b.part(cyl(0.14, 0.14, 0.02, 7), "#4e9a45", { at: [px + Math.cos(a) * d * 1.2, 0.17, pz + Math.sin(a) * d * 0.8] });
  }
  b.part(sph(0.07), "#f4a6c0", { at: [px + 0.3, 0.2, pz + 0.1] });
  // koi
  b.part(box(0.28, 0.05, 0.1), "#f07a2a", { at: [px - 0.6, 0.16, pz + 0.3] });
  b.part(box(0.1, 0.04, 0.1), "#f07a2a", { at: [px - 0.8, 0.16, pz + 0.3] });
  b.part(box(0.2, 0.05, 0.09), "#f2f2f2", { at: [px + 0.5, 0.16, pz - 0.4] });

  // arched bridge
  const bx = px, bz = pz;
  for (let i = 0; i < 9; i++) {
    const t = i / 8 * 2 - 1;
    const y = 0.35 + (1 - t * t) * 0.35;
    b.part(box(0.2, 0.08, 0.7), "#a8402e", { at: [bx + t * 1.45, y, bz - 0.0] });
    b.part(box(0.2, 0.06, 0.05), "#7c2b1e", { at: [bx + t * 1.45, y + 0.2, bz + 0.33] });
    b.part(box(0.2, 0.06, 0.05), "#7c2b1e", { at: [bx + t * 1.45, y + 0.2, bz - 0.33] });
    if (i % 2 === 0) {
      b.part(cyl(0.025, 0.025, 0.2, 5), "#7c2b1e", { at: [bx + t * 1.45, y + 0.1, bz + 0.33] });
      b.part(cyl(0.025, 0.025, 0.2, 5), "#7c2b1e", { at: [bx + t * 1.45, y + 0.1, bz - 0.33] });
    }
  }

  // stone lantern
  const lx = 0.5, lz = -1.5;
  b.part(box(0.5, 0.1, 0.5), "#9a9a94", { at: [lx, 0.1, lz] });
  b.part(cyl(0.11, 0.13, 0.5, 6), "#a8a8a2", { at: [lx, 0.4, lz] });
  b.part(box(0.4, 0.08, 0.4), "#9a9a94", { at: [lx, 0.69, lz] });
  b.part(box(0.28, 0.28, 0.28), "#a8a8a2", { at: [lx, 0.87, lz] });
  b.part(box(0.16, 0.2, 0.3), "#ffd77a", { at: [lx, 0.87, lz] });
  b.part(new THREE.ConeGeometry(0.4, 0.2, 4), "#7e7e78", { at: [lx, 1.08, lz], rotation: [0, Math.PI / 4, 0] } as any);
  b.part(sph(0.07), "#9a9a94", { at: [lx, 1.22, lz] });

  // pine tree
  const tx = -2.6, tz = -1.8;
  b.part(cyl(0.12, 0.2, 1.2, 6), "#5b3d28", { at: [tx, 0.6, tz] });
  b.part(cyl(0.07, 0.1, 0.9, 6), "#5b3d28", { at: [tx + 0.3, 1.5, tz], rotation: [0, 0, -0.6] } as any);
  const pads: [number, number, number, number][] = [[0, 1.9, 0, 0.7], [0.7, 1.75, 0.1, 0.55], [-0.5, 1.5, 0.2, 0.5], [0.2, 2.25, -0.1, 0.45]];
  for (const [x, y, z, s] of pads) {
    b.part(sph(s), "#2f6b3a", { at: [tx + x, y, tz + z], scale: [1.3, 0.5, 1.2] } as any);
    b.part(sph(s * 0.7), "#3b7d45", { at: [tx + x, y + 0.15, tz + z], scale: [1.2, 0.4, 1.1] } as any);
  }

  // maple tree
  const mx = 2.8, mz = -1.6;
  b.part(cyl(0.08, 0.14, 1.1, 6), "#4a3426", { at: [mx, 0.55, mz] });
  b.part(cyl(0.04, 0.06, 0.6, 5), "#4a3426", { at: [mx - 0.2, 1.2, mz], rotation: [0, 0, 0.6] } as any);
  b.part(cyl(0.04, 0.06, 0.6, 5), "#4a3426", { at: [mx + 0.2, 1.2, mz], rotation: [0, 0, -0.6] } as any);
  const cols = ["#c8321e", "#e0551f", "#d9402a", "#e87a2a"];
  for (let i = 0; i < 9; i++) {
    const a = r() * 6.28, d = r() * 0.5;
    b.part(sph(0.3 + r() * 0.15), cols[i % 4], { at: [mx + Math.cos(a) * d, 1.5 + r() * 0.5, mz + Math.sin(a) * d] });
  }
  // fallen leaves
  for (let i = 0; i < 10; i++) {
    b.part(box(0.07, 0.01, 0.06), cols[i % 4], { at: [mx + (r() - 0.5) * 1.6, 0.11, mz + 0.3 + r() * 1.0] });
  }

  // bamboo
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + i * 0.35, h = 2 + r() * 0.8;
    b.part(cyl(0.05, 0.05, h, 6), "#7ba84a", { at: [x - 0.0 + 0.6, h / 2, -3.3] });
    for (let k = 1; k < 4; k++) b.part(cyl(0.058, 0.058, 0.03, 6), "#4f7a30", { at: [x + 0.6, k * h / 4, -3.3] });
    b.part(sph(0.18), "#5fa03a", { at: [x + 0.6, h, -3.3], scale: [1, 0.6, 1] } as any);
  }

  // bamboo fence
  for (let i = 0; i < 16; i++) {
    b.part(cyl(0.04, 0.04, 0.8, 6), "#c9b36a", { at: [-3.6 + i * 0.12 * 1.0 + 0, 0.4, 3.7 - 0.0] });
  }
  for (let i = 0; i < 16; i++) {
    b.part(cyl(0.04, 0.04, 0.8, 6), "#c9b36a", { at: [-3.7 + i * 0.1, 0.4, 3.7] });
  }
  b.part(cyl(0.035, 0.035, 1.6, 6), "#7d6a35", { at: [-2.9, 0.55, 3.76], rotation: [0, 0, Math.PI / 2] } as any);
  b.part(cyl(0.035, 0.035, 1.6, 6), "#7d6a35", { at: [-2.9, 0.25, 3.76], rotation: [0, 0, Math.PI / 2] } as any);

  return b.root;
}
