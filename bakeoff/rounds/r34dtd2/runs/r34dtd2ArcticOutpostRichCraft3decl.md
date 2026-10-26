```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: red cabin, radio mast, sled, tent and lit windows on a snow mound.",
};

export default function build() {
  const b = createBuilder({ name: "outpost" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(5);

  const SNOW = "#f1e4dc", SNOW2 = "#e3c9c8", ICE = "#8fc0cf", RED = "#c4432f", DRED = "#8e2e26", WOOD = "#5b3a2e",
    DARK = "#2c2230", ORANGE = "#f08a3c", YEL = "#ffd27a", GREY = "#6c6a78", TEAL = "#3f7f86", CREAM = "#f4d9b0";

  const snowPaint = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    const top = mix(SNOW2, SNOW, smoothstep(0.2, 0.9, n.y));
    return mix(top, "#cfa9b5", 0.25 * smoothstep(0.55, 0.8, t) * (1 - n.y));
  });
  const wallPaint = paint((p, n) => {
    const plank = Math.abs(((p.y * 12) % 1)) < 0.06 ? 0.75 : 1;
    const c = mix(DRED, RED, smoothstep(-0.3, 0.8, n.y + p.y * 0.1));
    return [c[0] * plank, c[1] * plank, c[2] * plank];
  });

  // Ground: low-poly snow mound
  b.part(new THREE.CylinderGeometry(2.6, 3.0, 0.5, 9), snowPaint, { bone: base, at: [0, 0.23, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.9, 2.5, 0.2, 9), SNOW, { bone: base, at: [0, 0.5, 0], flat: true });
  // ice pond
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.02, 10), ICE, { bone: base, at: [1.5, 0.61, 0.9] });

  // Cabin
  const cx = -0.3, cz = -0.2, fy = 0.6;
  b.part(new THREE.BoxGeometry(1.8, 1.0, 1.3), wallPaint, { bone: base, at: [cx, fy + 0.5, cz] });
  b.part(new THREE.BoxGeometry(1.9, 0.08, 1.4), WOOD, { bone: base, at: [cx, fy + 0.04, cz] });
  // corner posts
  for (const sx of [1, -1]) for (const sz of [1, -1])
    b.part(new THREE.BoxGeometry(0.1, 1.04, 0.1), WOOD, { bone: base, at: [cx + sx * 0.9, fy + 0.52, cz + sz * 0.65] });
  // roof: two slabs + snow cap
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.05, 0.08, 0.85), DARK, { bone: base, at: [cx, fy + 1.3, cz + s * 0.38], rotation: [s * 28, 0, 0] });
    b.part(new THREE.BoxGeometry(2.0, 0.1, 0.78), SNOW, { bone: base, at: [cx, fy + 1.36, cz + s * 0.38], rotation: [s * 28, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(2.1, 0.08, 0.1), WOOD, { bone: base, at: [cx, fy + 1.58, cz] });
  // chimney with smoke puffs
  b.part(new THREE.BoxGeometry(0.22, 0.6, 0.22), GREY, { bone: base, at: [cx + 0.6, fy + 1.55, cz - 0.2] });
  b.part(new THREE.BoxGeometry(0.28, 0.06, 0.28), SNOW, { bone: base, at: [cx + 0.6, fy + 1.88, cz - 0.2] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.IcosahedronGeometry(0.12 + i * 0.04, 0), "#f6e9e4", { bone: base, at: [cx + 0.6 + i * 0.1, fy + 2.1 + i * 0.22, cz - 0.2 - i * 0.05], flat: true });

  // door
  const doorTex = svg(`<svg viewBox="0 0 40 70"><rect width="40" height="70" fill="#4a2e26"/><rect x="4" y="4" width="32" height="28" fill="#5b3a2e"/><rect x="4" y="38" width="32" height="28" fill="#5b3a2e"/><circle cx="32" cy="38" r="3" fill="#ffd27a"/></svg>`);
  b.part(new THREE.PlaneGeometry(0.4, 0.7), "#ffffff", { bone: base, at: [cx + 0.45, fy + 0.4, cz + 0.66], dir: [0, 0, 1], axis: "z", texture: doorTex });
  // steps + porch
  b.part(new THREE.BoxGeometry(0.7, 0.1, 0.35), WOOD, { bone: base, at: [cx + 0.45, fy + 0.05, cz + 0.85] });
  b.part(new THREE.BoxGeometry(0.7, 0.05, 0.12), SNOW, { bone: base, at: [cx + 0.45, fy + 0.12, cz + 0.85] });

  // windows (glowing)
  const winTex = svg(`<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#ffc15e"/><rect x="18" width="4" height="40" fill="#7a4a30"/><rect y="18" width="40" height="4" fill="#7a4a30"/><rect width="40" height="40" fill="none" stroke="#5b3a2e" stroke-width="5"/></svg>`);
  glow(b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: base, at: [cx - 0.4, fy + 0.6, cz + 0.66], dir: [0, 0, 1], axis: "z", texture: winTex }), 1.3);
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { bone: base, at: [cx + s * 0.91, fy + 0.6, cz], dir: [s, 0, 0], axis: "z", texture: winTex }), 1.3);
  // sign
  const signTex = svg(`<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#f4d9b0"/><text x="50" y="21" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#8e2e26">STATION 7</text></svg>`);
  b.part(new THREE.PlaneGeometry(0.7, 0.21), "#ffffff", { bone: base, at: [cx, fy + 1.05, cz + 0.66], dir: [0, 0, 1], axis: "z", texture: signTex });

  // Radio mast with guy wires
  const mx = 1.0, mz = -0.9;
  b.rod([mx, 0.55, mz], [mx, 3.3, mz], [0.05, 0.025], GREY, { sides: 6 });
  for (let i = 0; i < 5; i++) {
    const y = 1.0 + i * 0.5;
    b.rod([mx - 0.2 + i * 0.03, y, mz], [mx + 0.2 - i * 0.03, y, mz], 0.015, DARK, { sides: 5 });
  }
  b.part(new THREE.SphereGeometry(0.06, 6, 4), "#ff4a3a", { bone: base, at: [mx, 3.35, mz] });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), "#ff4a3a", { bone: base, at: [mx, 3.4, mz] }), 1.5);
  for (const [gx, gz] of [[1.9, -1.6], [0.2, -1.8], [1.9, 0.2]])
    b.rod([mx, 2.7, mz], [gx, 0.6, gz], 0.008, DARK, { sides: 4 });
  // dish
  b.part(new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.4), CREAM, { bone: base, at: [mx, 2.2, mz + 0.1], rotation: [70, 0, 0], flat: true });
  b.rod([mx, 2.2, mz + 0.1], [mx, 2.45, mz + 0.4], 0.01, DARK);

  // Weather station
  b.rod([-1.5, 0.55, 0.9], [-1.5, 1.4, 0.9], 0.025, WOOD);
  b.part(new THREE.BoxGeometry(0.28, 0.28, 0.2), CREAM, { bone: base, at: [-1.5, 1.2, 0.9] });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    b.rod([-1.5, 1.55, 0.9], [-1.5 + Math.cos(a) * 0.2, 1.55, 0.9 + Math.sin(a) * 0.2], 0.01, DARK);
    b.part(new THREE.SphereGeometry(0.06, 6, 4), ORANGE, { bone: base, at: [-1.5 + Math.cos(a) * 0.2, 1.55, 0.9 + Math.sin(a) * 0.2] });
  }

  // Tent
  const tx = -1.6, tz = -0.9;
  const tent = new THREE.ConeGeometry(0.55, 0.7, 4);
  b.part(tent, TEAL, { bone: base, at: [tx, 0.95, tz], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.2, 0.25, 4), SNOW, { bone: base, at: [tx, 1.2, tz], rotation: [0, 45, 0], flat: true });
  b.part(new THREE.PlaneGeometry(0.22, 0.3), DARK, { bone: base, at: [tx + 0.19, 0.76, tz + 0.2], dir: [1, 0, 1], axis: "z" });

  // Sled with crates
  const sx = 0.9, sz = 1.3;
  for (const s of [1, -1]) {
    b.rod([sx + s * 0.2, 0.64, sz - 0.5], [sx + s * 0.2, 0.64, sz + 0.5], 0.03, WOOD, { sides: 5 });
    b.rod([sx + s * 0.2, 0.64, sz + 0.5], [sx + s * 0.2, 0.78, sz + 0.62], 0.03, WOOD, { sides: 5 });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.9), WOOD, { bone: base, at: [sx, 0.72, sz] });
  b.part(new THREE.BoxGeometry(0.35, 0.25, 0.3), ORANGE, { bone: base, at: [sx, 0.87, sz - 0.2] });
  b.part(new THREE.BoxGeometry(0.3, 0.18, 0.25), TEAL, { bone: base, at: [sx, 0.84, sz + 0.2], rotation: [0, 20, 0] });

  // Fuel barrels
  for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8), i === 1 ? RED : ORANGE, { bone: base, at: [1.55 + (i % 2) * 0.32, 0.8, -0.1 + (i > 1 ? 0.15 : -0.1) + i * 0.2] });

  // Pines (stylised, dusk teal-green)
  const pine = (x: number, z: number, h: number) => {
    b.rod([x, 0.5, z], [x, 0.5 + h * 0.3, z], 0.05, WOOD, { sides: 5 });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.4 * h - k * 0.08, 0.55 * h, 6), "#2f5b57", { bone: base, at: [x, 0.7 + h * 0.3 + k * 0.3 * h, z], flat: true });
      b.part(new THREE.ConeGeometry(0.2 * h - k * 0.04, 0.2 * h, 6), SNOW, { bone: base, at: [x, 0.82 + h * 0.3 + k * 0.3 * h, z], flat: true });
    }
  };
  pine(-1.9, 0.2, 1.3);
  pine(-1.3, 1.5, 1.0);
  pine(1.9, -1.2, 1.1);

  // Rocks and snow lumps
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2, d = 1.8 + R() * 0.5;
    b.part(new THREE.DodecahedronGeometry(0.1 + R() * 0.12, 0), i % 2 ? GREY : SNOW2, { bone: base, at: [Math.cos(a) * d, 0.55, Math.sin(a) * d], flat: true });
  }

  // Lantern by door
  glow(b.part(new THREE.BoxGeometry(0.08, 0.1, 0.08), YEL, { bone: base, at: [cx + 0.75, fy + 0.85, cz + 0.7] }), 1.6);

  return b.root;
}
```