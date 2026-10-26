```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: cabin, radio mast, weather station, sled and tents on a snowy base.",
};

export default function build() {
  const b = createBuilder({ name: "outpost" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);

  const SNOW = "#f3dcd0", SNOW2 = "#e8c4b8", ICE = "#9fc4d6", ROCK = "#6b5560";
  const RED = "#c8412e", RED2 = "#9c2f26", WOOD = "#7a4a34", DARK = "#2e2230";
  const ORANGE = "#f08a3c", YEL = "#ffd36b", ROOF = "#3a4a5a", WHITE = "#f7ece4", TEAL = "#3f8a8c";

  const snowPaint = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    const c = mix(SNOW, SNOW2, smoothstep(0.35, 0.7, t) * 0.7 + (n.y < 0.5 ? 0.3 : 0));
    return c;
  });
  const woodPaint = paint((p, _n) => mix(WOOD, "#5c3626", smoothstep(0.4, 0.6, Math.sin(p.y * 60 + noise(p, 0.2, 1) * 4) * 0.5 + 0.5)));
  const redPaint = paint((p, _n) => mix(RED, RED2, smoothstep(0.45, 0.55, Math.sin(p.y * 45) * 0.5 + 0.5)));

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // Base: ice slab with snow cap
  b.part(new THREE.CylinderGeometry(3.4, 3.2, 0.3, 9), snowPaint, { at: [0, 0.1, 0] , flat: true});
  b.part(new THREE.CylinderGeometry(3.45, 3.45, 0.12, 9), ICE, { at: [0, -0.04, 0], flat: true });
  // snow mounds
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, d = 1.2 + R() * 1.9, s = 0.2 + R() * 0.3;
    b.part(new THREE.SphereGeometry(s, 7, 5), SNOW, { at: [Math.cos(a) * d, 0.22, Math.sin(a) * d], scale: [1.4, 0.45, 1.2], flat: true });
  }
  // rocks
  for (const [x, z, s] of [[-2.6, -1.4, 0.4], [2.5, -1.8, 0.5], [-2.2, 1.9, 0.3]]) {
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK, { at: [x, 0.3 + s * 0.4, z], flat: true });
    b.part(new THREE.ConeGeometry(s * 0.8, s * 0.4, 6), SNOW, { at: [x, 0.3 + s * 0.95, z], flat: true });
  }

  // Main cabin
  const cx = -0.4, cz = -0.2;
  box(2.2, 1.1, 1.6, redPaint, cx, 0.95, cz);
  box(2.3, 0.1, 1.7, DARK, cx, 0.4, cz);
  // roof: two slabs
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.5, 0.1, 1.05), ROOF, { at: [cx, 1.85, cz + s * 0.45], rotation: [-s * 32, 0, 0] });
    b.part(new THREE.BoxGeometry(2.45, 0.08, 1.0), SNOW, { at: [cx, 1.93, cz + s * 0.45], rotation: [-s * 32, 0, 0] });
  }
  // gable triangles
  for (const s of [1, -1]) {
    b.extrude([[-0.8, 0], [0.8, 0], [0, 0.7]], { at: [cx + s * 1.1, 1.5, cz], x: [0, 0, 1], thickness: 0.06, color: RED2 });
  }
  // chimney with smoke
  box(0.25, 0.6, 0.25, ROCK, cx + 0.6, 2.2, cz - 0.3);
  glow(box(0.2, 0.04, 0.2, ORANGE, cx + 0.6, 2.52, cz - 0.3), 1.2);
  for (let i = 0; i < 4; i++) b.part(new THREE.IcosahedronGeometry(0.12 + i * 0.05, 0), "#d9ccd0", { at: [cx + 0.6 + i * 0.1, 2.8 + i * 0.25, cz - 0.3], flat: true });
  // door + window
  box(0.45, 0.8, 0.06, WOOD, cx - 0.6, 0.85, cz + 0.83);
  b.part(new THREE.SphereGeometry(0.03, 5, 4), YEL, { at: [cx - 0.47, 0.85, cz + 0.88] });
  const win = svg(`<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#ffc25a"/><rect x="18" width="4" height="40" fill="#5a3a2a"/><rect y="18" width="40" height="4" fill="#5a3a2a"/><rect width="40" height="40" fill="none" stroke="#5a3a2a" stroke-width="4"/></svg>`);
  for (const x of [0.2, 0.75]) glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { at: [cx + x, 1.05, cz + 0.82], dir: [0, 0, 1], axis: "z", texture: win }), 1);
  // steps and porch
  box(0.8, 0.12, 0.5, WOOD, cx - 0.6, 0.45, cz + 1.1);
  box(0.8, 0.12, 0.2, WOOD, cx - 0.6, 0.33, cz + 1.4);
  // wood stack
  for (let i = 0; i < 3; i++) for (let j = 0; j <= 2 - i; j++)
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 6), woodPaint, { at: [cx + 0.9 + j * 0.15 + i * 0.075, 0.5 + i * 0.13, cz + 1.0], rotation: [0, 0, 90] });

  // Lab container (teal)
  const lx = 1.6, lz = 0.6;
  box(1.6, 0.9, 0.9, TEAL, lx, 0.75, lz, 0.2);
  box(1.66, 0.08, 0.96, SNOW, lx, 1.24, lz, 0.2);
  for (let i = 0; i < 5; i++) box(0.04, 0.8, 0.02, "#2d6668", lx - 0.6 + i * 0.3, 0.75, lz + 0.46 - i * 0.0, 0.2);
  glow(box(0.3, 0.2, 0.04, YEL, lx + 0.1, 0.9, lz + 0.5), 1);

  // Radio mast
  const mx = 1.8, mz = -1.4;
  b.part(new THREE.CylinderGeometry(0.03, 0.06, 3.4, 6), WHITE, { at: [mx, 1.9, mz] });
  for (let i = 0; i < 4; i++) b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), i % 2 ? RED : WHITE, { at: [mx, 1.0 + i * 0.7, mz] });
  for (let i = 0; i < 3; i++) box(0.9 - i * 0.2, 0.04, 0.04, WHITE, mx, 2.6 + i * 0.35, mz);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), "#ff4a3a", { at: [mx, 3.65, mz] }), 2);
  // guy wires
  for (const [ex, ez] of [[mx + 1.0, mz - 0.4], [mx - 0.9, mz - 0.7], [mx + 0.3, mz + 1.0]])
    b.rod([mx, 3.0, mz], [ex, 0.3, ez], 0.008, DARK);
  // dish
  b.part(new THREE.SphereGeometry(0.35, 8, 4, 0, 6.28, 0, 1.2), WHITE, { at: [mx, 2.4, mz + 0.1], rotation: [90, 0, 0], flat: true });

  // Weather station: tripod + anemometer
  const wx = -2.0, wz = 0.9;
  for (let i = 0; i < 3; i++) {
    const a = i * 2.09;
    b.rod([wx, 1.1, wz], [wx + Math.cos(a) * 0.4, 0.25, wz + Math.sin(a) * 0.4], 0.02, WOOD);
  }
  box(0.3, 0.3, 0.3, WHITE, wx, 1.2, wz);
  for (let i = 0; i < 4; i++) b.part(new THREE.BoxGeometry(0.02, 0.02, 0.5), ORANGE, { at: [wx, 1.45, wz], rotation: [0, i * 45, 0] });
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57;
    b.part(new THREE.SphereGeometry(0.06, 5, 4), ORANGE, { at: [wx + Math.cos(a) * 0.25, 1.45, wz + Math.sin(a) * 0.25] });
  }
  // snow stakes
  for (let i = 0; i < 5; i++) {
    cyl(0.015, 0.015, 0.7, i % 2 ? RED : DARK, 2.3 - i * 0.2, 0.65, 2.0, 5);
  }

  // Tent
  const tx = -1.9, tz = -1.9;
  b.part(new THREE.ConeGeometry(0.7, 0.8, 4), ORANGE, { at: [tx, 0.65, tz], rotation: [0, 45, 0], flat: true });
  box(0.02, 0.4, 0.3, DARK, tx + 0.28, 0.5, tz + 0.28, 0.8);

  // Sled with crates
  const sx = 0.6, sz = 1.8;
  for (const s of [1, -1]) {
    box(0.07, 0.04, 1.1, WOOD, sx + s * 0.25, 0.4, sz);
    b.part(new THREE.TorusGeometry(0.1, 0.025, 4, 6, 1.6), WOOD, { at: [sx + s * 0.25, 0.48, sz + 0.55], rotation: [0, 90, 90] });
  }
  box(0.6, 0.04, 0.9, WOOD, sx, 0.46, sz);
  box(0.4, 0.3, 0.4, RED, sx, 0.65, sz - 0.15);
  box(0.3, 0.2, 0.3, YEL, sx + 0.05, 0.9, sz - 0.15, 0.4);
  // fuel barrels
  for (let i = 0; i < 3; i++) {
    cyl(0.17, 0.17, 0.5, i === 1 ? TEAL : ORANGE, 1.0 + i * 0.38, 0.6, -0.1 - (i % 2) * 0.1, 8);
    cyl(0.175, 0.175, 0.04, DARK, 1.0 + i * 0.38, 0.65, -0.1 - (i % 2) * 0.1, 8);
  }
  // flag
  b.rod([-1.5, 0.3, 1.6], [-1.5, 2.0, 1.6], 0.02, WHITE);
  b.extrude([[0, 0], [0.5, 0.05], [0.5, 0.35], [0, 0.4]], { at: [-1.5, 1.6, 1.6], x: [1, 0, 0], thickness: 0.02, color: RED });
  // lamp post glowing
  b.rod([2.6, 0.3, 1.2], [2.6, 1.5, 1.2], 0.025, DARK);
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 5), YEL, { at: [2.6, 1.6, 1.2] }), 1.8);
  // icicles on roof edge
  for (let i = 0; i < 7; i++) b.part(new THREE.ConeGeometry(0.03, 0.15 + R() * 0.1, 4), ICE, { at: [cx - 1.0 + i * 0.33, 1.57, cz + 0.97], rotation: [180, 0, 0] });

  return b.root;
}
```