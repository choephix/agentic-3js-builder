import * as THREE from "three";
import { createBuilder, rng, stripes, mottle, patches } from "../../../../src/index";

export const meta = {
  name: "Treehouse",
  description: "A stylized treehouse in a big oak with a plank platform, cabin, ladder, rope swing and flag.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);

  const BARK = mottle("#6b4a2f", "#4e3420", { size: 0.25 });
  const LEAF1 = "#3f8f3a", LEAF2 = "#5aa83f", LEAF3 = "#2f7433";
  const WOOD = stripes("#b98a55", "#a07644", { size: 0.12, axis: "x" });
  const PLANK = "#c79a62";
  const ROOF = "#b9473a", ROOF2 = "#8f3329";
  const DARK = "#3a2a1c", WIN = "#9fd8ee", ROPE = "#d9c08a", FLAG = "#f2c230";

  // trunk
  const trunk = b.sweep(
    [[0, 0, 0], [0, 1.5, 0], [0.05, 3, 0], [0, 4.5, 0], [0, 6, 0]],
    [0.85, 0.7, 0.55, 0.45, 0.3],
    { bone: root, color: BARK, sides: 8 },
  );
  // root flares
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.6, 0.35, Math.sin(a) * 0.6], [Math.cos(a), -0.35, Math.sin(a)], 1.1, 0.28, { bone: root, color: BARK, sides: 6 });
  }
  void trunk;

  // branches
  const branches: [number[], number[]][] = [
    [[0, 3.4, 0], [1.9, 4.6, 0.4]],
    [[0, 4.2, 0], [-1.9, 5.4, -0.3]],
    [[0, 4.8, 0], [0.3, 6.4, 1.5]],
    [[0, 4.6, 0], [-0.4, 6.2, -1.6]],
  ];
  for (const [a, c] of branches) b.rod(a, c, [0.22, 0.08], { bone: root, color: BARK, sides: 6 });

  // platform
  const py = 2.6;
  b.part(new THREE.CylinderGeometry(1.9, 1.9, 0.14, 8), PLANK, { bone: root, at: [0, py, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.95, 1.95, 0.08, 8), "#8d6a40", { bone: root, at: [0, py - 0.1, 0], flat: true });
  // support beams
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.rod([Math.cos(a) * 0.5, py - 0.9, Math.sin(a) * 0.5], [Math.cos(a) * 1.6, py - 0.1, Math.sin(a) * 1.6], 0.07, { bone: root, color: "#7b5834", sides: 6 });
  }
  // railing posts and rails
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    if (a > 1.2 && a < 2.0) continue; // gap for ladder (+Z side)
    const x = Math.sin(a) * 1.8, z = Math.cos(a) * 1.8;
    b.part(new THREE.BoxGeometry(0.08, 0.8, 0.08), "#8d6a40", { bone: root, at: [x, py + 0.47, z] });
  }
  const railPts = [];
  for (let i = 0; i <= 12; i++) {
    const a = 2.1 + (i / 12) * (Math.PI * 2 - 1.0);
    railPts.push([Math.sin(a) * 1.8, py + 0.85, Math.cos(a) * 1.8]);
  }
  b.sweep(railPts, 0.04, { bone: root, color: "#a07644", sides: 5 });

  // cabin
  const cy = py + 0.07;
  const cx = -0.2, cz = -0.3;
  b.part(new THREE.BoxGeometry(2.0, 1.5, 1.8), WOOD, { bone: root, at: [cx, cy + 0.75, cz] });
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.BoxGeometry(0.12, 1.55, 0.12), "#6e4e2c", { bone: root, at: [cx + sx * 1.0, cy + 0.77, cz + sz * 0.9] });
  // roof
  const roof = new THREE.CylinderGeometry(0.01, 1.75, 0.9, 4, 1);
  b.part(roof, ROOF, { bone: root, at: [cx, cy + 1.95, cz], rotation: [0, 45, 0], scale: [1.0, 1, 0.9], flat: true });
  b.part(new THREE.CylinderGeometry(0.01, 1.78, 0.12, 4), ROOF2, { bone: root, at: [cx, cy + 1.53, cz], rotation: [0, 45, 0], scale: [1.0, 1, 0.9], flat: true });
  b.part(new THREE.BoxGeometry(0.22, 0.5, 0.22), "#7b7b7b", { bone: root, at: [cx + 0.6, cy + 2.2, cz - 0.3] });
  // door
  b.part(new THREE.BoxGeometry(0.5, 1.0, 0.05), "#5b3a20", { bone: root, at: [cx - 0.4, cy + 0.5, cz + 0.92] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), "#e0b84a", { bone: root, at: [cx - 0.25, cy + 0.5, cz + 0.96] });
  // windows
  const win = (x: number, y: number, z: number, ry: number) => {
    b.part(new THREE.BoxGeometry(0.5, 0.5, 0.05), WIN, { bone: root, at: [x, y, z], rotation: [0, ry, 0] });
    b.part(new THREE.BoxGeometry(0.62, 0.62, 0.04), "#5b3a20", { bone: root, at: [x, y, z], rotation: [0, ry, 0] });
    b.part(new THREE.BoxGeometry(0.52, 0.5, 0.05), WIN, { bone: root, at: [x, y, z], rotation: [0, ry, 0] });
  };
  win(cx + 0.45, cy + 0.85, cz + 0.93, 0);
  win(cx + 1.02, cy + 0.85, cz, 90);
  win(cx - 1.02, cy + 0.85, cz, 90);
  // flower box
  b.part(new THREE.BoxGeometry(0.6, 0.12, 0.14), "#7b5834", { bone: root, at: [cx + 0.45, cy + 0.5, cz + 1.0] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.SphereGeometry(0.06, 6, 4), i % 2 ? "#e85a8a" : "#f5e050", { bone: root, at: [cx + 0.27 + i * 0.12, cy + 0.62, cz + 1.0] });

  // ladder on +Z
  const lx = 0.9, lz = 1.9;
  for (const s of [-1, 1])
    b.rod([lx + s * 0.25, 0, lz + 0.5], [lx + s * 0.25, py + 0.8, lz - 0.05], 0.045, { bone: root, color: "#8d6a40", sides: 5 });
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9.5;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), PLANK, {
      bone: root, at: [lx, t * (py + 0.8), lz + 0.5 - t * 0.55], rotation: [0, 0, 90],
    });
  }

  // rope swing
  b.rod([-1.9, 5.3, -0.3], [-1.9, 5.3, 0.9], 0.02, { bone: root, color: DARK, sides: 4 });
  for (const s of [-1, 1])
    b.rod([-2.6 , 4.9, 0.3 + s * 0.2], [-2.6, 1.0, 0.3 + s * 0.2], 0.018, { bone: root, color: ROPE, sides: 4 });
  b.rod([-1.3, 4.5, 0.2], [-2.6, 4.95, 0.3], 0.001, { bone: root, color: ROPE, sides: 3 });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.6), PLANK, { bone: root, at: [-2.6, 1.0, 0.3] });

  // foliage
  const clumps = [
    [0, 7.0, 0, 1.9], [1.8, 6.2, 0.6, 1.4], [-1.9, 6.6, -0.4, 1.5], [0.4, 7.2, 1.7, 1.3],
    [-0.6, 7.0, -1.8, 1.4], [2.7, 5.4, 0.2, 1.0], [-2.9, 5.6, 0, 1.0], [0.2, 8.0, 0.2, 1.2],
  ];
  clumps.forEach(([x, y, z, r], i) => {
    b.part(new THREE.IcosahedronGeometry(r, 1), i % 3 === 0 ? LEAF1 : i % 3 === 1 ? LEAF2 : LEAF3, { bone: root, at: [x, y, z], flat: true });
  });
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, d = 1.5 + R() * 1.8;
    b.part(new THREE.IcosahedronGeometry(0.5 + R() * 0.3, 0), R() > 0.5 ? LEAF2 : LEAF1, {
      bone: root, at: [Math.cos(a) * d, 5.4 + R() * 2.4, Math.sin(a) * d], flat: true,
    });
  }

  // flag
  b.rod([cx + 0.6, cy + 2.4, cz - 0.3], [cx + 0.6, cy + 3.3, cz - 0.3], 0.02, { bone: root, color: DARK, sides: 4 });
  b.extrude([[0, 0], [0.5, 0.12], [0, 0.3]], { at: [cx + 0.6, cy + 3.0, cz - 0.3], x: [1, 0, 0], thickness: 0.02, color: FLAG, bone: root });

  // ground tufts and stones
  const grass = patches("#5aa83f", "#4a9535", { size: 0.5 });
  b.part(new THREE.CylinderGeometry(4.2, 4.4, 0.1, 10), grass, { bone: root, at: [0, 0.03, 0], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = R() * Math.PI * 2, d = 2 + R() * 1.8;
    b.part(new THREE.DodecahedronGeometry(0.15 + R() * 0.12, 0), "#8d8d8d", { bone: root, at: [Math.cos(a) * d, 0.1, Math.sin(a) * d], flat: true });
  }

  return b.root;
}
