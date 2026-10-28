```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, paint, mottle, svg, rng, mix } from "agentic-3js-builder";

export const meta = {
  name: "Desert Oasis Diorama",
  description: "A low-poly whimsical desert oasis: round sandstone base, pond, palms, striped tents and camels.",
};

const SAND = "#ecc978", SAND2 = "#dca95a", STONE = "#c98a4a", WATER = "#35c2c8", GRASS = "#5fae3f";
const TRUNK = "#8b5a2b", TRUNK2 = "#6e4220", F1 = "#3f9a3a", F2 = "#2f7d34", RED = "#c8442f", CREAM = "#f6e7c1";
const BLUE = "#2f6fb0", CAM = "#c9975a", CAM2 = "#a8743d", DARK = "#2a1a10", GOLD = "#f2b632";
const TOP = 0.3;

const RUG = svg(
  `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2f6fb0"/><rect x="2" y="2" width="28" height="28" fill="none" stroke="#f2b632" stroke-width="2"/><path d="M16 6 L26 16 L16 26 L6 16Z" fill="#c8442f" stroke="#f6e7c1" stroke-width="1.5"/><circle cx="16" cy="16" r="3" fill="#f2b632"/></svg>`,
  { size: 64 },
);
const FLAG = svg(
  `<svg viewBox="0 0 40 24"><path d="M0 0 H40 L30 12 L40 24 H0Z" fill="#f2b632" stroke="#c8442f" stroke-width="3"/><circle cx="10" cy="12" r="4" fill="#c8442f"/></svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const R = rng(5);

  // ---- base
  const sandPaint = mottle(SAND, SAND2, { size: 0.35, seed: 3 });
  const basePaint = paint((p, n) => {
    if (n.y > 0.7) return sandPaint.at(p, n);
    const band = Math.floor(p.y / 0.045) % 2;
    return band ? STONE : "#b3733a";
  });
  b.lathe(
    [[0, 0], [2.3, 0], [2.36, 0.24], [2.2, TOP], [0, TOP]],
    { at: [0, 0, 0], segments: 20, color: basePaint },
  );
  // dunes
  const dune = (x: number, z: number, rx: number, ry: number, rz: number, c: string) =>
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), c, {
      at: [x, TOP - 0.02, z], scale: [rx, ry, rz], flat: true,
    });
  dune(-0.2, -1.7, 1.2, 0.42, 0.55, SAND2);
  dune(1.2, -1.3, 0.8, 0.3, 0.5, SAND);
  dune(-1.6, -0.9, 0.6, 0.26, 0.7, SAND);
  // grass ring and pond
  b.lathe([[0, 0], [0.95, 0], [0.9, 0.04], [0, 0.05]], { at: [0, TOP, 0.5], segments: 14, color: GRASS });
  b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 14), WATER, { at: [0, TOP + 0.045, 0.5] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.004, 10), "#8fe6e6", { at: [0.1, TOP + 0.063, 0.45] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.09 + R() * 0.05, 0), i % 2 ? "#9a8a7a" : "#b8a58f", {
      at: [Math.cos(a) * 0.66, TOP + 0.05, 0.5 + Math.sin(a) * 0.66], scale: [1, 0.7, 1], flat: true,
    });
  }
  // reeds
  for (let i = 0; i < 9; i++) {
    const a = 2.2 + i * 0.2;
    const x = Math.cos(a) * 0.72, z = 0.5 + Math.sin(a) * 0.72;
    b.spike([x, TOP, z], [0.05, 1, 0.02], 0.3 + R() * 0.15, 0.015, { color: i % 2 ? "#4f9a3a" : "#7bbf4a" });
  }

  // ---- palms
  const trunkPaint = paint((p) => (Math.floor(p.y / 0.07) % 2 ? TRUNK : TRUNK2));
  const palm = (x: number, z: number, h: number, lx: number, lz: number) => {
    const top: [number, number, number] = [x + lx, TOP + h, z + lz];
    const path = catmull([[x, TOP - 0.03, z], [x + lx * 0.2, TOP + h * 0.5, z + lz * 0.2], top]);
    b.sweep(path, (t) => 0.09 - 0.04 * t, { color: trunkPaint, sides: 6 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + x;
      const d = [Math.cos(a), Math.sin(a)];
      const L = 0.85 + R() * 0.2;
      const p0 = top;
      const p1: [number, number, number] = [top[0] + d[0] * L * 0.4, top[1] + 0.28, top[2] + d[1] * L * 0.4];
      const p2: [number, number, number] = [top[0] + d[0] * L * 0.8, top[1] + 0.25, top[2] + d[1] * L * 0.8];
      const p3: [number, number, number] = [top[0] + d[0] * L, top[1] - 0.2, top[2] + d[1] * L];
      b.sweep(bezier(p0, p1, p2, p3), (t) => [0.11 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)) + 0.01, 0.012], {
        section: "box", color: i % 2 ? F1 : F2, caps: "none",
      });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.part(new THREE.SphereGeometry(0.06, 6, 4), "#6b4a1e", {
        at: [top[0] + Math.cos(a) * 0.07, top[1] - 0.07, top[2] + Math.sin(a) * 0.07],
      });
    }
  };
  palm(-0.95, -0.15, 1.6, 0.25, 0.05);
  palm(1.0, -0.55, 1.3, -0.2, 0.1);
  palm(-0.45, -1.0, 1.1, 0.1, 0.15);

  // ---- tents
  const tent = (x: number, z: number, r: number, h: number, a: string, c: string, yaw: number) => {
    const pt = paint((p) => (Math.floor(Math.atan2(p.z - z, p.x - x) / (Math.PI / 6)) % 2 === 0 ? a : c));
    b.part(new THREE.ConeGeometry(r, h, 12, 1), pt, { at: [x, TOP + h / 2 - 0.01, z], rotation: [0, 0, 0] });
    b.part(new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.03, 12), "#7a4a24", { at: [x, TOP + 0.01, z] });
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    b.part(new THREE.ConeGeometry(r * 0.3, h * 0.55, 4), DARK, {
      at: [x + dx * r * 0.62, TOP + h * 0.22, z + dz * r * 0.62], rotation: [0, (yaw * 180) / Math.PI + 45, 0], scale: [0.5, 1, 0.5],
    });
    b.rod([x, TOP + h - 0.02, z], [x, TOP + h + 0.3, z], 0.012, "#5a3a1a");
    b.part(new THREE.PlaneGeometry(0.2, 0.12), "#ffffff", {
      at: [x + 0.1, TOP + h + 0.22, z], dir: [0, 0, 1], axis: "z", texture: FLAG,
    });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { at: [x, TOP + h + 0.31, z] });
  };
  tent(1.3, 0.35, 0.5, 0.75, RED, CREAM, -2.0);
  tent(-1.3, 0.8, 0.42, 0.6, BLUE, CREAM, 2.0);
  // cushions by pond
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), RED, { at: [0.7, TOP + 0.02, 1.0] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), BLUE, { at: [-0.5, TOP + 0.02, 1.2] });

  // ---- camels
  const camel = (cx: number, cz: number, yaw: number, k: number, col: string) => {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const P = (lx: number, ly: number, lz: number): [number, number, number] => [
      cx + (lx * c + lz * s) * k, TOP + ly * k - 0.005, cz + (-lx * s + lz * c) * k,
    ];
    b.capsule(P(0, 0.78, -0.3), P(0, 0.78, 0.3), 0.21 * k, col);
    b.part(new THREE.SphereGeometry(0.17 * k, 8, 6), col, { at: P(0, 1.0, -0.05), scale: [1, 1.1, 1.2] });
    b.part(new THREE.BoxGeometry(0.4 * k, 0.03 * k, 0.34 * k), "#ffffff", {
      at: P(0, 1.1, -0.05), texture: RUG, rotation: [0, (yaw * 180) / Math.PI, 0],
    });
    for (const sx of [1, -1])
      for (const sz of [-1, 1]) {
        const hip = P(sx * 0.14, 0.7, sz * 0.27);
        const knee = P(sx * 0.14, 0.38, sz * 0.27 + (sz > 0 ? 0.04 : -0.05));
        const foot = P(sx * 0.14, 0.02, sz * 0.27);
        b.rod(hip, knee, [0.06 * k, 0.045 * k], col);
        b.rod(knee, foot, [0.04 * k, 0.05 * k], CAM2);
        b.part(new THREE.CylinderGeometry(0.06 * k, 0.065 * k, 0.03 * k, 6), DARK, {
          at: P(sx * 0.14, 0.015, sz * 0.27),
        });
      }
    b.sweep(catmull([P(0, 0.9, 0.3), P(0, 1.15, 0.5), P(0, 1.4, 0.55)]), [0.09 * k, 0.055 * k], { color: col, sides: 6 });
    b.capsule(P(0, 1.45, 0.57), P(0, 1.4, 0.78), 0.065 * k, col);
    b.capsule(P(0, 1.39, 0.7), P(0, 1.37, 0.84), 0.045 * k, "#e0b886");
    for (const sx of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.018 * k, 6, 4), DARK, { at: P(sx * 0.055, 1.48, 0.7) });
      b.spike(P(sx * 0.05, 1.5, 0.55), [sx * 0.6, 1, 0], 0.09 * k, 0.025 * k, { color: CAM2 });
    }
    b.sweep(catmull([P(0, 0.85, -0.3), P(0, 0.7, -0.45), P(0, 0.4, -0.45)]), [0.035 * k, 0.015 * k], { color: CAM2, sides: 5 });
    b.part(new THREE.SphereGeometry(0.035 * k, 6, 4), CAM2, { at: P(0, 0.38, -0.45) });
  };
  camel(-0.2, 1.45, 0.4, 0.55, CAM);
  camel(0.75, 1.3, -0.5, 0.5, "#b88652");

  return b.root;
}
```