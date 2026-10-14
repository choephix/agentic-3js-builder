import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden",
  description:
    "A small stroll garden: raked gravel with rocks, a koi pond with an arched red bridge, a stone lantern, a pine, a maple, stepping stones, a bamboo fence and a tsukubai basin.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "japanese_garden" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const P = (g: THREE.BufferGeometry, color: string, at: number[], o: any = {}) =>
    b.part(g, color, { at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(r0, r1, h, seg), c, at, o);
  const rock = (r: number, c: string, at: number[], sc: number[] = [1, 0.7, 1]) =>
    P(new THREE.IcosahedronGeometry(r, 0), c, at, {
      scale: sc,
      flat: true,
      rotation: [R() * 60, R() * 360, R() * 60],
    });

  // ---- ground
  box(8, 0.04, 8, "#5f8a3c", [0, -0.02, 0]);
  box(8.2, 0.08, 0.1, "#4a3a2a", [0, 0.0, 4.05]);
  box(8.2, 0.08, 0.1, "#4a3a2a", [0, 0.0, -4.05]);
  box(0.1, 0.08, 8, "#4a3a2a", [4.05, 0.0, 0]);
  box(0.1, 0.08, 8, "#4a3a2a", [-4.05, 0.0, 0]);
  // moss patches
  for (let i = 0; i < 10; i++) {
    cyl(0.3 + R() * 0.3, 0.3 + R() * 0.3, 0.02, 7, i % 2 ? "#6e9a45" : "#4f7a34", [-3.6 + R() * 7.2, 0.01, -3.5 + R() * 7], { scale: [1, 1, 0.8] });
  }

  // ---- gravel bed with rake lines
  const gx = 1.7, gz = 1.0;
  box(3.4, 0.05, 3.2, "#e4dccb", [gx, 0.025, gz]);
  for (let i = 0; i < 6; i++) {
    const t = new THREE.TorusGeometry(0.45 + i * 0.14, 0.014, 4, 28);
    P(t, i % 2 ? "#cfc6b2" : "#f3eee2", [gx - 0.4, 0.055, gz - 0.2], { rotation: [90, 0, 0] });
  }
  for (let i = 0; i < 6; i++) {
    box(1.3, 0.012, 0.025, "#cfc6b2", [gx + 0.75, 0.056, gz + 1.5 - i * 0.12 - 1.2 + 0.7]);
  }
  rock(0.42, "#7a7d80", [gx - 0.4, 0.2, gz - 0.2], [1.2, 0.9, 1]);
  rock(0.22, "#8b8d8e", [gx - 0.0, 0.1, gz - 0.35], [1, 0.8, 1]);
  rock(0.16, "#6d7073", [gx - 0.75, 0.07, gz + 0.05]);

  // ---- pond
  const pcx = -1.2, pcz = 0.8;
  cyl(1, 1, 0.04, 14, "#2f6f86", [pcx, 0.02, pcz], { scale: [1.5, 1, 1.15] });
  cyl(0.5, 0.5, 0.045, 10, "#3f8aa0", [pcx + 0.6, 0.022, pcz - 0.4], { scale: [1.5, 1, 1] });
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const r = 0.14 + R() * 0.12;
    rock(r, i % 3 ? "#80848a" : "#6b6f73", [pcx + Math.cos(a) * 1.58, r * 0.5, pcz + Math.sin(a) * 1.22], [1.2, 0.7, 1]);
  }
  // lily pads and koi
  for (let i = 0; i < 4; i++) {
    cyl(0.12, 0.12, 0.01, 7, "#3f8f3f", [pcx - 0.5 + i * 0.35, 0.05, pcz + 0.45 - (i % 2) * 0.8]);
  }
  P(new THREE.SphereGeometry(0.1, 6, 4), "#f26a21", [pcx - 0.2, 0.05, pcz - 0.5], { scale: [2.2, 0.5, 1] });
  P(new THREE.ConeGeometry(0.06, 0.12, 4), "#f26a21", [pcx - 0.42, 0.05, pcz - 0.5], { rotation: [0, 0, 90], scale: [1, 1, 0.4] });
  P(new THREE.SphereGeometry(0.09, 6, 4), "#fff2e0", [pcx + 0.8, 0.05, pcz + 0.5], { scale: [2.2, 0.5, 1] });

  // ---- arched bridge along x
  const span = 1.9;
  const arcY = (s: number) => 0.14 + 0.6 * (1 - s * s);
  for (let i = 0; i <= 10; i++) {
    const s = -1 + i / 5;
    const slope = Math.atan((-1.2 * s) / span) * (180 / Math.PI);
    box(0.32, 0.06, 0.95, i % 2 ? "#b8442d" : "#a63a26", [pcx + s * span, arcY(s), pcz], { rotation: [0, 0, slope] });
  }
  // side beams
  for (const side of [-1, 1]) {
    for (let i = 0; i < 10; i++) {
      const s0 = -1 + i / 5, s1 = -1 + (i + 1) / 5;
      b.rod([pcx + s0 * span, arcY(s0) - 0.05, pcz + side * 0.47], [pcx + s1 * span, arcY(s1) - 0.05, pcz + side * 0.47], 0.035, { color: "#7a2a1c", sides: 5 });
    }
    const posts = [-1, -0.5, 0, 0.5, 1];
    posts.forEach((s) => {
      const y = arcY(s);
      b.rod([pcx + s * span, y, pcz + side * 0.45], [pcx + s * span, y + 0.42, pcz + side * 0.45], 0.04, { color: "#c4472c", sides: 6 });
      P(new THREE.SphereGeometry(0.06, 6, 4), "#d9b25b", [pcx + s * span, y + 0.46, pcz + side * 0.45]);
    });
    for (let i = 0; i < posts.length - 1; i++) {
      const s0 = posts[i], s1 = posts[i + 1];
      b.rod([pcx + s0 * span, arcY(s0) + 0.36, pcz + side * 0.45], [pcx + s1 * span, arcY(s1) + 0.36, pcz + side * 0.45], 0.03, { color: "#c4472c", sides: 5 });
      b.rod([pcx + s0 * span, arcY(s0) + 0.2, pcz + side * 0.45], [pcx + s1 * span, arcY(s1) + 0.2, pcz + side * 0.45], 0.022, { color: "#c4472c", sides: 5 });
    }
  }
  box(0.4, 0.1, 1.1, "#8a8d90", [pcx - span - 0.2, 0.05, pcz]);
  box(0.4, 0.1, 1.1, "#8a8d90", [pcx + span + 0.2, 0.05, pcz]);

  // ---- stone lantern (toro)
  const lx = 2.9, lz = -1.9;
  const stone = "#9a9c9a", stoneD = "#7d807e";
  cyl(0.3, 0.34, 0.1, 6, stoneD, [lx, 0.05, lz]);
  cyl(0.1, 0.12, 0.6, 6, stone, [lx, 0.4, lz]);
  cyl(0.28, 0.2, 0.1, 6, stoneD, [lx, 0.75, lz]);
  cyl(0.22, 0.22, 0.3, 6, stone, [lx, 0.95, lz]);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    box(0.02, 0.14, 0.14, "#f6d36b", [lx + Math.sin(a) * 0.2, 0.95, lz + Math.cos(a) * 0.2], { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  cyl(0.12, 0.5, 0.2, 6, stoneD, [lx, 1.2, lz]);
  cyl(0.02, 0.12, 0.12, 6, stone, [lx, 1.36, lz]);
  P(new THREE.SphereGeometry(0.06, 6, 5), stone, [lx, 1.45, lz]);

  // ---- pine tree
  const tx = -2.9, tz = -2.3;
  const bark = "#4a3326";
  b.rod([tx, 0, tz], [tx + 0.1, 0.9, tz + 0.1], [0.17, 0.12], { color: bark, sides: 6 });
  b.rod([tx + 0.1, 0.9, tz + 0.1], [tx - 0.25, 1.7, tz], [0.12, 0.08], { color: bark, sides: 6 });
  b.rod([tx - 0.25, 1.7, tz], [tx + 0.1, 2.5, tz - 0.1], [0.08, 0.04], { color: bark, sides: 6 });
  const pads: number[][] = [[0.8, 1.2, 0.4], [-0.7, 1.7, 0.2], [0.5, 2.1, -0.3], [-0.2, 2.65, 0], [-0.8, 1.2, -0.5]];
  for (const [dx, y, dz] of pads) {
    const sx = tx + dx * 0.4, sz = tz + dz * 0.4;
    b.rod([tx + 0.05 + (dx > 0 ? 0 : -0.15), Math.min(y - 0.3, 2.2), tz], [tx + dx, y - 0.1, tz + dz], [0.04, 0.025], { color: bark, sides: 5 });
    P(new THREE.IcosahedronGeometry(0.55, 0), "#2c5a30", [tx + dx, y + 0.05, tz + dz], { scale: [1.3, 0.4, 1.1], flat: true, rotation: [0, R() * 90, 0] });
    P(new THREE.IcosahedronGeometry(0.4, 0), "#3a7038", [tx + dx, y + 0.22, tz + dz], { scale: [1.2, 0.35, 1], flat: true });
    void sx; void sz;
  }

  // ---- maple
  const mx = 2.7, mz = 2.9;
  b.rod([mx, 0, mz], [mx, 1.0, mz], [0.1, 0.07], { color: "#5a4636", sides: 6 });
  b.rod([mx, 0.9, mz], [mx + 0.4, 1.5, mz - 0.1], 0.04, { color: "#5a4636", sides: 5 });
  b.rod([mx, 0.9, mz], [mx - 0.4, 1.45, mz + 0.1], 0.04, { color: "#5a4636", sides: 5 });
  const mc = ["#c8301f", "#e0572a", "#d4401f", "#e8803a"];
  [[0, 1.6, 0, 0.6], [0.5, 1.5, -0.1, 0.45], [-0.5, 1.5, 0.1, 0.45], [0.1, 1.95, 0.1, 0.4], [0.2, 1.4, 0.4, 0.35]].forEach(([dx, y, dz, r], i) =>
    P(new THREE.IcosahedronGeometry(r, 0), mc[i % 4], [mx + dx, y, mz + dz], { flat: true, scale: [1.1, 0.85, 1.1] })
  );
  for (let i = 0; i < 8; i++)
    box(0.08, 0.01, 0.08, mc[i % 4], [mx - 0.6 + R() * 1.2, 0.015, mz - 0.6 + R() * 1.2], { rotation: [0, R() * 90, 0] });

  // ---- stepping stones from front to bridge/gravel
  const steps: number[][] = [[0.6, 3.5], [0.3, 3.0], [0.55, 2.55], [0.15, 2.1], [-0.2, 1.75]];
  steps.forEach(([x, z], i) => cyl(0.2, 0.22, 0.06, 7, i % 2 ? "#a3a39e" : "#8d8e8a", [x, 0.03, z], { scale: [1.1, 1, 0.9] }));

  // ---- tsukubai water basin
  const wx = -3.2, wz = 2.7;
  rock(0.32, "#777b7d", [wx, 0.2, wz], [1, 0.75, 1]);
  cyl(0.15, 0.15, 0.03, 8, "#2f6f86", [wx, 0.38, wz]);
  b.rod([wx + 0.5, 0.5, wz], [wx + 0.1, 0.5, wz], 0.03, { color: "#b4a35a", sides: 6 });
  b.rod([wx + 0.5, 0, wz], [wx + 0.5, 0.52, wz], 0.04, { color: "#a89a50", sides: 6 });

  // ---- bamboo fence
  for (let i = 0; i < 26; i++) {
    const x = -3.8 + i * 0.3;
    cyl(0.035, 0.035, 1.5 + (i % 3) * 0.06, 6, i % 2 ? "#a8b86a" : "#98aa5a", [x, 0.75, -3.7]);
  }
  for (const y of [0.4, 1.1]) {
    b.rod([-3.9, y, -3.62], [3.9, y, -3.62], 0.03, { color: "#6b5a3a", sides: 6 });
    for (let i = 0; i < 8; i++) P(new THREE.SphereGeometry(0.04, 5, 4), "#3a3020", [-3.5 + i * 1.0, y, -3.6]);
  }

  // ---- tall bamboo clump
  for (let i = 0; i < 6; i++) {
    const x = 3.0 + (i % 3) * 0.25, z = -3.2 + Math.floor(i / 3) * 0.3;
    const h = 2.6 + R() * 0.8;
    cyl(0.035, 0.04, h, 6, "#7fa23d", [x, h / 2, z], { rotation: [R() * 4 - 2, 0, R() * 4 - 2] });
    for (let k = 1; k < 5; k++) cyl(0.045, 0.045, 0.02, 6, "#5d7d2a", [x, (h * k) / 5, z]);
    for (let k = 0; k < 3; k++)
      P(new THREE.ConeGeometry(0.06, 0.45, 4), "#4f8a35", [x + (k - 1) * 0.12, h - 0.1 - k * 0.2, z], { rotation: [0, 0, (k - 1) * 50 + 90], scale: [1, 1, 0.3] });
  }

  return b.root;
}
