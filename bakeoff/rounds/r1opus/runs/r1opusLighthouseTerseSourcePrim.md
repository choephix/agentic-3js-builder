```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle, cells } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island",
  description:
    "A red-and-white striped lighthouse with a glowing lantern and light beams, a keeper's cottage, stone steps, a little dock with a rowboat, and boulders, all on a tiny grassy island in a turquoise sea.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse_island", paintSize: 1024 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const D = Math.PI / 180;

  type V = [number, number, number];
  const P = (geo: THREE.BufferGeometry, color: any, at: V, opts: Record<string, unknown> = {}) =>
    b.part(geo, color, { at, ...opts });

  // ---------- palette & paints ----------
  const WHITE = "#f6f1e7";
  const RED = "#d23b2f";
  const TRIM = "#24352e";
  const WOOD = "#8a5a35";
  const WOOD2 = "#a06b40";
  const STONE = "#8e8f8c";

  const glow = new THREE.MeshStandardMaterial({
    color: "#ffe48a",
    emissive: "#ffc93a",
    emissiveIntensity: 1.1,
    roughness: 0.35,
  });
  const beamMat = new THREE.MeshBasicMaterial({
    color: "#fff3b0",
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const grassBase = mottle("#6aa83c", "#85c04c", { size: 2.2, seed: 3 });
  const grass = paint((p) => {
    const c = cells(p, 0.55, 5);
    if (c.d1 < 0.12 && c.id < 0.18) return c.id < 0.09 ? "#fff6d8" : "#f2c23a";
    return grassBase;
  });
  const rockM = mottle("#8d9196", "#6b7178", { size: 1.4, seed: 8 });
  const rock = paint((p) => (p.y < 0.75 ? "#3d434a" : p.y > 2.25 ? "#6f8a4c" : rockM));
  const plinthStone = mottle("#bdb6aa", "#9a948a", { size: 0.5, seed: 2 });
  const stripes = paint((p) => (Math.max(0, Math.floor((p.y - 4.8) / 2.8)) % 2 === 0 ? WHITE : RED));
  const shingles = paint((p) => (Math.floor(p.y / 0.28) % 2 ? "#3e5476" : "#32455f"));
  const hullPaint = paint((p) => (p.y > 0.24 ? WHITE : "#c8432e"));
  const cottageWall = mottle("#f3ead2", "#e9dcbd", { size: 0.8, seed: 4 });

  // ---------- sea ----------
  P(new THREE.CylinderGeometry(17, 17, 0.3, 22), "#2e7fb8", [0, 0.15, 0], { flat: true });
  P(new THREE.CylinderGeometry(13.6, 13.9, 0.06, 22), "#4cb8c8", [0, 0.33, 0], { rotation: [0, 8, 0], flat: true });
  P(new THREE.TorusGeometry(10.9, 0.22, 4, 20), "#ffffff", [0, 0.36, 0], { rotation: [90, 0, 0], flat: true });
  P(new THREE.TorusGeometry(12.4, 0.07, 3, 24), "#d6f3f7", [0, 0.36, 0], { rotation: [90, 0, 0] });
  // little wave crests on the open water
  for (let i = 0; i < 12; i++) {
    const a = R() * 360;
    const d = 14.3 + R() * 2.2;
    P(new THREE.TorusGeometry(0.55 + R() * 0.3, 0.06, 3, 7, Math.PI), "#e8f8fb",
      [Math.sin(a * D) * d, 0.31, Math.cos(a * D) * d], { rotation: [-90, 0, a + 90] });
  }

  // ---------- island ----------
  P(new THREE.CylinderGeometry(9.2, 11, 2.6, 11), rock, [0, 1.3, 0], { flat: true });
  P(new THREE.CylinderGeometry(8.6, 9.3, 0.5, 11), grass, [0, 2.75, 0], { rotation: [0, 16, 0], flat: true });

  const rockCols = ["#7d8288", "#6a7077", "#959a9e", "#5d636a"];
  for (let i = 0; i < 24; i++) {
    const a = R() * 360;
    if (Math.abs(((a - 40 + 540) % 360) - 180) < 14) continue; // keep dock clear
    const d = 10.1 + R() * 1.6;
    const s = 0.55 + R() * 0.9;
    P(new THREE.DodecahedronGeometry(1, 0), rockCols[i % 4], [Math.sin(a * D) * d, s * 0.35, Math.cos(a * D) * d], {
      scale: [s * 1.25, s * 0.85, s],
      rotation: [R() * 40, R() * 360, R() * 30],
      flat: true,
    });
  }

  // ---------- lighthouse ----------
  const LX = -2;
  const LZ = -1.5;
  P(new THREE.CylinderGeometry(4.0, 5.2, 1.0, 9), grass, [LX, 3.5, LZ], { flat: true });
  P(new THREE.CylinderGeometry(2.6, 2.8, 0.8, 8), plinthStone, [LX, 4.4, LZ], { rotation: [0, 22.5, 0], flat: true });
  P(new THREE.CylinderGeometry(2.75, 2.75, 0.1, 8), "#7f7a70", [LX, 4.82, LZ], { rotation: [0, 22.5, 0], flat: true });
  P(new THREE.CylinderGeometry(1.5, 2.2, 14, 14), stripes, [LX, 11.8, LZ], { flat: true });

  // door
  P(new THREE.BoxGeometry(1.25, 2.0, 0.3), TRIM, [LX, 5.85, LZ + 2.08]);
  P(new THREE.CylinderGeometry(0.63, 0.63, 0.3, 10), TRIM, [LX, 6.85, LZ + 2.08], { rotation: [90, 0, 0] });
  P(new THREE.BoxGeometry(1.0, 1.8, 0.4), "#7a4a2a", [LX, 5.75, LZ + 2.15]);
  P(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 10), "#7a4a2a", [LX, 6.65, LZ + 2.15], { rotation: [90, 0, 0] });
  for (const dx of [-0.25, 0.0, 0.25])
    P(new THREE.BoxGeometry(0.03, 2.2, 0.03), "#4f2f1a", [LX + dx, 5.95, LZ + 2.36]);
  P(new THREE.SphereGeometry(0.06, 6, 4), "#e3b23c", [LX + 0.35, 5.7, LZ + 2.38]);

  // steps
  P(new THREE.BoxGeometry(1.4, 0.8, 0.45), STONE, [LX, 4.4, LZ + 2.55], { flat: true });
  P(new THREE.BoxGeometry(1.4, 0.4, 0.45), STONE, [LX, 4.2, LZ + 3.0], { flat: true });
  P(new THREE.BoxGeometry(1.3, 0.67, 0.5), STONE, [LX, 3.33, LZ + 4.2], { flat: true });
  P(new THREE.BoxGeometry(1.3, 0.33, 0.5), STONE, [LX, 3.17, LZ + 4.7], { flat: true });

  // tower windows
  const towerR = (y: number) => 2.2 - (0.7 * (y - 4.8)) / 14;
  for (const w of [
    { y: 9.0, a: 25 },
    { y: 12.4, a: -35 },
    { y: 15.6, a: 15 },
  ]) {
    const r = towerR(w.y);
    const dir = [Math.sin(w.a * D), 0, Math.cos(w.a * D)];
    const at = (k: number, dy = 0): V => [LX + dir[0] * (r + k), w.y + dy, LZ + dir[2] * (r + k)];
    P(new THREE.BoxGeometry(0.8, 1.1, 0.25), TRIM, at(-0.05), { rotation: [0, w.a, 0] });
    const g = P(new THREE.BoxGeometry(0.55, 0.85, 0.25), "#ffe48a", at(0.0), { rotation: [0, w.a, 0] });
    g.mesh.material = glow;
    P(new THREE.BoxGeometry(0.05, 0.85, 0.28), TRIM, at(0.0), { rotation: [0, w.a, 0] });
    P(new THREE.BoxGeometry(0.95, 0.1, 0.4), WHITE, at(0.05, -0.6), { rotation: [0, w.a, 0] });
  }

  // gallery
  P(new THREE.CylinderGeometry(2.4, 2.2, 0.35, 16), TRIM, [LX, 18.975, LZ], { flat: true });
  for (let k = 0; k < 12; k++) {
    const a = k * 30;
    P(new THREE.BoxGeometry(0.25, 0.5, 0.45), TRIM, [LX + Math.sin(a * D) * 1.65, 18.55, LZ + Math.cos(a * D) * 1.65], {
      rotation: [0, a, 0],
    });
  }
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5;
    P(new THREE.BoxGeometry(0.07, 0.9, 0.07), TRIM, [LX + Math.sin(a * D) * 2.25, 19.6, LZ + Math.cos(a * D) * 2.25]);
  }
  P(new THREE.TorusGeometry(2.25, 0.05, 4, 24), TRIM, [LX, 20.05, LZ], { rotation: [90, 0, 0] });
  P(new THREE.TorusGeometry(2.25, 0.035, 4, 24), TRIM, [LX, 19.6, LZ], { rotation: [90, 0, 0] });

  // lantern room
  P(new THREE.CylinderGeometry(1.3, 1.3, 0.6, 8), WHITE, [LX, 19.45, LZ], { flat: true });
  const glass = P(new THREE.CylinderGeometry(1.15, 1.15, 1.8, 8), "#ffe48a", [LX, 20.65, LZ], { flat: true });
  glass.mesh.material = glow;
  for (let k = 0; k < 8; k++) {
    const a = k * 45;
    P(new THREE.BoxGeometry(0.1, 1.8, 0.1), TRIM, [LX + Math.sin(a * D) * 1.17, 20.65, LZ + Math.cos(a * D) * 1.17], {
      rotation: [0, a, 0],
    });
  }
  P(new THREE.CylinderGeometry(1.45, 1.45, 0.12, 8), TRIM, [LX, 21.61, LZ], { flat: true });
  P(new THREE.ConeGeometry(1.55, 1.3, 8), RED, [LX, 22.32, LZ], { flat: true });
  P(new THREE.SphereGeometry(0.22, 8, 6), TRIM, [LX, 23.1, LZ]);
  P(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 4), TRIM, [LX, 23.7, LZ]);
  P(new THREE.ConeGeometry(0.1, 0.25, 4), TRIM, [LX + 0.3, 23.95, LZ], { rotation: [0, 0, -90] });
  P(new THREE.BoxGeometry(0.6, 0.03, 0.03), TRIM, [LX, 23.95, LZ]);
  P(new THREE.BoxGeometry(0.03, 0.2, 0.18), TRIM, [LX - 0.3, 23.95, LZ]);

  // light beams
  for (const a of [60, 240]) {
    const dir: V = [Math.sin(a * D), -0.04, Math.cos(a * D)];
    const beam = P(new THREE.ConeGeometry(2.2, 11, 16, 1, true), "#fff3b0",
      [LX + dir[0] * 5.6, 20.65 + dir[1] * 5.6, LZ + dir[2] * 5.6], { dir: [-dir[0], -dir[1], -dir[2]] });
    beam.mesh.material = beamMat;
  }

  // ---------- keeper's cottage ----------
  const CX = 4.2;
  const CZ = 1.8;
  P(new THREE.BoxGeometry(3.35, 0.3, 2.75), STONE, [CX, 3.15, CZ], { flat: true });
  P(new THREE.BoxGeometry(3.2, 2.2, 2.6), cottageWall, [CX, 4.1, CZ]);
  P(new THREE.CylinderGeometry(2.08, 2.08, 3.0, 3), shingles, [CX, 5.772, CZ], {
    rotation: [-90, 0, 0],
    scale: [1, 1, 0.55],
    flat: true,
  });
  P(new THREE.BoxGeometry(0.5, 1.3, 0.5), "#a8553c", [CX + 0.8, 6.4, CZ - 0.5], { flat: true });
  P(new THREE.BoxGeometry(0.65, 0.12, 0.65), "#5a5a5a", [CX + 0.8, 7.11, CZ - 0.5]);
  // door
  P(new THREE.BoxGeometry(0.95, 1.6, 0.08), WHITE, [CX - 0.6, 4.1, CZ + 1.3]);
  P(new THREE.BoxGeometry(0.8, 1.5, 0.12), "#2f8f8a", [CX - 0.6, 4.05, CZ + 1.32]);
  P(new THREE.SphereGeometry(0.05, 6, 4), "#e3b23c", [CX - 0.35, 4.0, CZ + 1.4]);
  // windows
  const cottageWindow = (at: V, rotY: number, out: V) => {
    const o = (k: number): V => [at[0] + out[0] * k, at[1], at[2] + out[2] * k];
    P(new THREE.BoxGeometry(0.95, 0.95, 0.08), WHITE, o(0.02), { rotation: [0, rotY, 0] });
    const g = P(new THREE.BoxGeometry(0.75, 0.75, 0.08), "#ffe48a", o(0.05), { rotation: [0, rotY, 0] });
    g.mesh.material = glow;
    P(new THREE.BoxGeometry(0.06, 0.75, 0.06), WHITE, o(0.1), { rotation: [0, rotY, 0] });
    P(new THREE.BoxGeometry(0.75, 0.06, 0.06), WHITE, o(0.1), { rotation: [0, rotY, 0] });
    P(new THREE.BoxGeometry(0.95, 0.2, 0.28), WOOD, [o(0.14)[0], at[1] - 0.6, o(0.14)[2]], { rotation: [0, rotY, 0] });
    for (let k = -1; k <= 1; k++) {
      const side: V = [out[2], 0, -out[0]];
      P(new THREE.IcosahedronGeometry(0.11, 0), k === 0 ? "#f2c23a" : "#e2445c",
        [o(0.14)[0] + side[0] * k * 0.28, at[1] - 0.45, o(0.14)[2] + side[2] * k * 0.28], { flat: true });
    }
  };
  cottageWindow([CX + 0.7, 4.3, CZ + 1.3], 0, [0, 0, 1]);
  cottageWindow([CX + 1.6, 4.3, CZ], 90, [1, 0, 0]);

  // path stones
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9;
    const x = -2 + (3.6 - -2) * t;
    const z = 3.8 + (3.6 - 3.8) * t + Math.sin(Math.PI * t) * 0.9;
    P(new THREE.CylinderGeometry(0.32, 0.36, 0.1, 6), "#a9a49a", [x, 3.03, z], { rotation: [0, R() * 60, 0], flat: true });
  }

  // bushes & grass rocks
  const greens = ["#3f7f34", "#4f9a3a", "#2f6b2e"];
  let placed = 0;
  for (let i = 0; i < 80 && placed < 11; i++) {
    const a = R() * 360;
    const d = 2 + R() * 6;
    const x = Math.sin(a * D) * d;
    const z = Math.cos(a * D) * d;
    if (Math.hypot(x - LX, z - LZ) < 5.6) continue;
    if (Math.abs(x - CX) < 2.4 && Math.abs(z - CZ) < 2.2) continue;
    if (z > 2.8 && z < 5.2 && x > -2.5 && x < 4.2) continue;
    if (Math.abs(((a - 40 + 540) % 360) - 180) < 15 && d > 6) continue;
    const s = 0.45 + R() * 0.4;
    P(new THREE.IcosahedronGeometry(1, 0), greens[placed % 3], [x, 3.0 + s * 0.45, z], {
      scale: [s, s * 0.8, s],
      rotation: [0, R() * 360, 0],
      flat: true,
    });
    placed++;
  }
  for (let i = 0; i < 6; i++) {
    const a = 100 + i * 45 + R() * 20;
    const d = 7.4 + R() * 0.9;
    const s = 0.35 + R() * 0.35;
    P(new THREE.DodecahedronGeometry(1, 0), rockCols[i % 4], [Math.sin(a * D) * d, 3.0 + s * 0.2, Math.cos(a * D) * d], {
      scale: [s * 1.2, s * 0.7, s],
      rotation: [R() * 30, R() * 360, 0],
      flat: true,
    });
  }

  // ---------- dock & rowboat ----------
  const A = 40;
  const u: V = [Math.sin(A * D), 0, Math.cos(A * D)];
  const v: V = [Math.cos(A * D), 0, -Math.sin(A * D)];
  const at = (d: number, s: number, y: number): V => [u[0] * d + v[0] * s, y, u[2] * d + v[2] * s];
  for (let i = 0; i < 5; i++) {
    const top = 2.95 - i * 0.38;
    P(new THREE.BoxGeometry(1.2, top - 0.3, 0.45), STONE, at(8.4 + i * 0.42, 0, (top + 0.3) / 2), {
      rotation: [0, A, 0],
      flat: true,
    });
  }
  for (let i = 0; i < 14; i++)
    P(new THREE.BoxGeometry(1.7, 0.12, 0.36), i % 2 ? WOOD : WOOD2, at(10.4 + i * 0.4, 0, 1.15), {
      rotation: [0, A + (R() - 0.5) * 2, 0],
    });
  for (const d of [10.6, 13.1, 15.6])
    for (const s of [-0.9, 0.9])
      P(new THREE.CylinderGeometry(0.12, 0.12, 1.55, 6), "#5e3d24", at(d, s, 0.78));
  P(new THREE.TorusGeometry(0.2, 0.06, 4, 8), "#d8c08a", at(15.0, -0.4, 1.26), { rotation: [90, 0, 0] });

  const boat: V = at(13.2, 2.0, 0.4);
  P(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hullPaint, boat, {
    scale: [0.75, 0.42, 1.9],
    rotation: [0, A, 4],
    flat: true,
  });
  P(new THREE.CylinderGeometry(1, 1, 0.04, 10), WOOD, [boat[0], 0.36, boat[2]], {
    scale: [0.68, 1, 1.75],
    rotation: [0, A, 4],
  });
  P(new THREE.BoxGeometry(1.3, 0.06, 0.3), WOOD2, [boat[0], 0.36, boat[2]], { rotation: [0, A, 4] });
  P(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 4), WOOD2, [boat[0], 0.45, boat[2]], {
    dir: [u[0] + v[0] * 0.3, 0.05, u[2] + v[2] * 0.3],
  });
  P(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 3), "#d8c08a", at(12.4, 1.3, 0.8), { dir: [v[0], 0.4, v[2]] });

  return b.root;
}
```