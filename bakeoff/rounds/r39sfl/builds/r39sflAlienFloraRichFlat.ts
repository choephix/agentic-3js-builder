import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description: "Pandora-style glowing plant: curled fronds, glowing bulbs, helicoradian spirals and a glowing flower.",
};

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const r = rng(11);
  const root = b.joint("root", { at: [0, 0.05, 0] });

  const STEM = "#2a1f4a", STEM2 = "#3a2a6a";
  const CYAN = "#3ff2ff", MAG = "#ff5ad8", GREEN = "#7dffb0", VIO = "#8a5cff", DARK = "#150f2b";

  // Ground mound
  b.part(new THREE.CylinderGeometry(0.28, 0.4, 0.1, 8), "#1c1633", { bone: root, at: [0, 0.03, 0] });
  b.part(new THREE.CylinderGeometry(0.2, 0.28, 0.06, 8), "#241b44", { bone: root, at: [0, 0.1, 0] });

  // Main stalk
  const mainPts: number[][] = [[0, 0.05, 0], [0.04, 0.5, 0.02], [-0.05, 1.0, 0.0], [0.05, 1.45, 0.03], [0.1, 1.75, 0.08]];
  const mainPath = catmull(mainPts);
  const main = b.chain("stalk", mainPath, { parent: root, count: 4, role: "spine" });
  b.sweep(main, (t: number) => 0.09 * (1 - t) + 0.025, { color: STEM, sides: 6 });
  glow(b.sweep(main, (t: number) => 0.092 * (1 - t) + 0.027, {
    sides: 6, color: STEM2,
    sectors: [[-20, 20, CYAN]],
  }), 1);

  // Glowing nodes along stalk
  b.along(mainPath, 6, (at) => {
    glow(b.part(new THREE.IcosahedronGeometry(0.035 + 0.01 * r(), 0), GREEN, { at: at.at, bone: main.joints[1] }), 1.4);
  });

  // Curled fronds (spiral tendrils) radiating
  const fronds = 7;
  for (let i = 0; i < fronds; i++) {
    const a = (i / fronds) * Math.PI * 2 + 0.3;
    const h = 0.3 + (i % 4) * 0.28;
    const len = 0.55 + 0.2 * r();
    const dx = Math.sin(a), dz = Math.cos(a);
    const base = [dx * 0.04, h, dz * 0.04];
    const pts = [
      base,
      [dx * len * 0.5, h + 0.18, dz * len * 0.5],
      [dx * len, h + 0.1, dz * len],
      [dx * len * 1.1, h - 0.15, dz * len * 1.1],
      [dx * len * 0.95, h - 0.25, dz * len * 0.95],
    ];
    const col = i % 2 ? MAG : CYAN;
    const p = catmull(pts);
    b.sweep(p, [0.03, 0.008], { bone: main.joints[Math.min(3, Math.floor(h / 0.45))], color: STEM2, sides: 6, caps: { end: "point" } });
    const last = pts[4];
    glow(b.part(new THREE.IcosahedronGeometry(0.05, 1), col, { at: last, bone: main.joints[2] }), 1.6);
    // leaf blades along frond
    for (let k = 1; k <= 3; k++) {
      const q = p.at(k / 4);
      for (const s of [1, -1]) {
        const blade = b.extrude([[0, 0], [0.06, 0.04], [0.16, 0], [0.06, -0.04]], {
          at: [q.x, q.y, q.z], x: [dx * 0.6 + s * dz * 0.8, 0.2, dz * 0.6 - s * dx * 0.8], y: [0, 1, 0],
          thickness: 0.006, color: k % 2 ? VIO : STEM2, bone: main.joints[2],
        });
        void blade;
        glow(b.part(new THREE.SphereGeometry(0.01, 5, 4), col, {
          at: [q.x + (dx * 0.6 + s * dz * 0.8) * 0.1, q.y + 0.01, q.z + (dz * 0.6 - s * dx * 0.8) * 0.1], bone: main.joints[2],
        }), 1.5);
      }
    }
  }

  // Flower at the top: layered petals around a glowing core
  const top = [0.1, 1.78, 0.08];
  const topJ = main.joints[3];
  for (let layer = 0; layer < 2; layer++) {
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + layer * 0.5;
      const dx = Math.sin(a), dz = Math.cos(a);
      const L = layer ? 0.2 : 0.28;
      b.sweep(
        catmull([
          top,
          [top[0] + dx * L * 0.5, top[1] + 0.05 + layer * 0.08, top[2] + dz * L * 0.5],
          [top[0] + dx * L, top[1] + 0.02 + layer * 0.14, top[2] + dz * L],
        ]),
        [0.05, 0.006], { bone: topJ, color: layer ? MAG : VIO, sides: 5, caps: { end: "point" },
          shift: [0, 0] },
      );
    }
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.09, 1), CYAN, { at: [top[0], top[1] + 0.06, top[2]], bone: topJ }), 2);
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8;
    glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), "#ffffff", {
      at: [top[0] + Math.sin(a) * 0.06, top[1] + 0.2 + 0.05 * (i % 3), top[2] + Math.cos(a) * 0.06], bone: topJ }), 1.8);
  }

  // Ground bulbs and small sprouts
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.2, d = 0.28 + 0.18 * r();
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    const hgt = 0.12 + 0.15 * r();
    b.sweep([[x, 0.08, z], [x * 1.05, 0.08 + hgt * 0.6, z * 1.05], [x * 1.15, 0.08 + hgt, z * 1.15]], [0.015, 0.006], { bone: root, color: STEM2, sides: 5 });
    glow(b.part(new THREE.IcosahedronGeometry(0.03 + 0.015 * r(), 0), i % 2 ? GREEN : MAG, { at: [x * 1.15, 0.1 + hgt, z * 1.15], bone: root }), 1.5);
  }
  // Dark accent roots
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    b.spike([Math.sin(a) * 0.2, 0.08, Math.cos(a) * 0.2], [Math.sin(a), 0.05, Math.cos(a)], 0.25, 0.03, { color: DARK, bone: root });
  }

  return b.root;
}
