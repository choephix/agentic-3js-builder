```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, spiral } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A Pandora-style glowing flora: a ringed stalk with drooping veined fronds, a petalled bell bloom with a glowing core, hanging tendrils, helicopter spirals and glowing ground bulbs.",
};

const STALK = "#1a2a52";
const STALK_HI = "#2c4a86";
const LEAF_DARK = "#12334f";
const LEAF = "#1d6b8c";
const LEAF_TIP = "#2bb0c0";
const CYAN = "#4ff2ff";
const AQUA = "#7dffd8";
const MAG = "#e04bd8";
const VIOL = "#7a4bff";
const PINK = "#ff8ae6";
const SOIL = "#0f1a2c";
const MOSS = "#1b4d57";
const PETAL_A = "#8a3fd8";
const PETAL_B = "#c23fc4";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "alienPlant" });
  const rand = rng(11);

  // ---- helpers ---------------------------------------------------------
  const orb = (p: THREE.Vector3 | number[], r: number, color: string, strength = 1.4) => {
    const at = Array.isArray(p) ? V(p[0], p[1], p[2]) : p;
    return glow(b.part(new THREE.IcosahedronGeometry(r, 1), color, { at, flat: true }), strength);
  };
  const glowRod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, s = 1.3) =>
    glow(b.rod(a, c, r, color, { sides: 5 }), s);

  // ---- stalk -----------------------------------------------------------
  const stalk = catmull([
    [0, 0, 0],
    [0.04, 0.5, 0.03],
    [-0.03, 1.0, 0.0],
    [0.03, 1.5, 0.04],
    [0, 1.85, 0],
  ]);
  const stalkR = (t: number) => 0.085 * (1 - t) + 0.032;
  b.sweep(stalk, stalkR, {
    sides: 8,
    caps: "flat",
    bands: [
      [0.3, STALK],
      [0.7, STALK_HI],
      [1, STALK],
    ],
    sectors: [[150, 210, "#122040"]],
  });
  // glowing rings
  for (let i = 0; i < 9; i++) {
    const t = 0.1 + i * 0.1;
    const p = stalk.at(t);
    const tg = stalk.tangentAt(t);
    glow(
      b.part(new THREE.TorusGeometry(stalkR(t) + 0.004, 0.008, 4, 10), i % 2 ? AQUA : CYAN, {
        at: p,
        dir: tg,
        axis: "z",
        flat: true,
      }),
      1.2,
    );
  }
  // spiral of glowing dots
  for (let i = 0; i < 26; i++) {
    const t = 0.08 + i * 0.034;
    const a = i * 0.9;
    const p = stalk.at(t);
    const r = stalkR(t) + 0.003;
    orb(V(p.x + Math.cos(a) * r, p.y, p.z + Math.sin(a) * r), 0.011, i % 3 ? CYAN : PINK, 1.5);
  }

  // ---- base ------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.36, 0.05],
      [0.2, 0.1],
      [0.1, 0.16],
      [0, 0.18],
    ],
    { at: [0, -0.01, 0], segments: 10, color: SOIL },
  );
  b.lathe(
    [
      [0, 0.1],
      [0.3, 0.06],
      [0.22, 0.11],
      [0.1, 0.17],
      [0, 0.19],
    ],
    { at: [0, 0, 0], segments: 9, color: MOSS },
  );
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.3;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const path = catmull([
      [d.x * 0.03, 0.4, d.z * 0.03],
      [d.x * 0.14, 0.22, d.z * 0.14],
      [d.x * 0.36, 0.06, d.z * 0.36],
      [d.x * 0.62, 0.0, d.z * 0.62],
    ]);
    b.sweep(path, [0.06, 0.016], { sides: 6, color: i % 2 ? STALK : STALK_HI, caps: "round" });
    glowRod(V(d.x * 0.2, 0.17, d.z * 0.2), V(d.x * 0.48, 0.04, d.z * 0.48), 0.007, CYAN, 1.0);
  }

  // ---- fronds ----------------------------------------------------------
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4;
    const t = 0.2 + i * 0.12;
    const base = stalk.at(t);
    const d = V(Math.sin(a), 0, Math.cos(a));
    const L = 0.95 - 0.09 * i;
    const pts = [
      V(base.x, base.y, base.z),
      V(base.x + d.x * 0.3 * L, base.y + 0.1 * L, base.z + d.z * 0.3 * L),
      V(base.x + d.x * 0.7 * L, base.y + 0.16 * L, base.z + d.z * 0.7 * L),
      V(base.x + d.x * L, base.y + 0.05 - 0.33 * L, base.z + d.z * L),
    ];
    const path = catmull(pts);
    const w = 0.1 * (L / 0.95) + 0.03;
    b.sweep(path, (u) => [Math.max(0.008, w * Math.pow(Math.sin(Math.PI * Math.min(0.98, u + 0.05)), 0.7)), 0.011], {
      up: [0, 1, 0],
      sides: 4,
      caps: "point",
      bands: [
        [0.3, LEAF_DARK],
        [0.7, LEAF],
        [1, LEAF_TIP],
      ],
    });
    // mid vein
    const vein = catmull(pts.map((p) => V(p.x, p.y + 0.014, p.z)));
    glow(b.sweep(vein.slice(0.05, 0.95), [0.008, 0.003], { sides: 5, color: CYAN, caps: "round" }), 1.3);
    // side veins
    for (let k = 0; k < 6; k++) {
      const u = 0.18 + k * 0.12;
      const p = path.at(u);
      const tg = path.tangentAt(u);
      const side = new THREE.Vector3().crossVectors(tg, V(0, 1, 0)).normalize();
      const sw = w * Math.pow(Math.sin(Math.PI * u), 0.7) * 0.8;
      for (const s of [1, -1]) {
        const a0 = V(p.x, p.y + 0.014, p.z);
        const a1 = V(
          p.x + side.x * s * sw + tg.x * 0.07,
          p.y + 0.012 + tg.y * 0.07,
          p.z + side.z * s * sw + tg.z * 0.07,
        );
        glowRod(a0, a1, 0.0035, AQUA, 1.1);
        if (k % 2 === 0) orb(V(a1.x, a1.y + 0.008, a1.z), 0.01, PINK, 1.5);
      }
    }
    // tip orb
    const tip = path.at(1);
    orb(V(tip.x, tip.y + 0.01, tip.z), 0.025, MAG, 1.6);
  }

  // ---- bloom -----------------------------------------------------------
  const top = V(0, 1.86, 0);
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.18, 0.12],
      [0.2, 0.24],
      [0.17, 0.24],
      [0.15, 0.12],
      [0, 0.07],
    ],
    { at: top, segments: 9, color: "#3a2a7a" },
  );
  b.lathe(
    [
      [0.17, 0.23],
      [0.205, 0.23],
      [0.205, 0.25],
      [0.17, 0.25],
    ],
    { at: top, segments: 9, color: PINK },
  );
  orb(V(0, 2.01, 0), 0.1, CYAN, 1.8);
  orb(V(0, 2.04, 0), 0.055, "#d8ffff", 2.2);
  const petal: [number, number, "sharp"?][] = [
    [0, 0],
    [0.055, 0.1],
    [0.045, 0.3],
    [0, 0.44, "sharp"],
    [-0.045, 0.3],
    [-0.055, 0.1],
  ];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const at = V(dx * 0.17, 1.86 + 0.18, dz * 0.17);
    const col = i % 2 ? PETAL_A : PETAL_B;
    b.extrude(petal as any, {
      at,
      x: [-dz, 0, dx],
      y: [dx * 0.45, 1, dz * 0.45],
      thickness: [0.012, 0.004],
      smoothing: 1,
      color: col,
    });
    // glowing stripe in petal
    const yd = V(dx * 0.45, 1, dz * 0.45).normalize();
    glowRod(
      V(at.x + yd.x * 0.06, at.y + yd.y * 0.06, at.z + yd.z * 0.06).add(V(dx, 0, dz).multiplyScalar(0.01)),
      V(at.x + yd.x * 0.36, at.y + yd.y * 0.36, at.z + yd.z * 0.36).add(V(dx, 0, dz).multiplyScalar(0.01)),
      0.004,
      PINK,
      1.2,
    );
    orb(V(at.x + yd.x * 0.45, at.y + yd.y * 0.45, at.z + yd.z * 0.45), 0.02, AQUA, 1.6);
  }
  // stamens
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.2;
    const r = 0.04 + 0.02 * (i % 3);
    const base = V(Math.sin(a) * r * 0.4, 2.0, Math.cos(a) * r * 0.4);
    const tip = V(Math.sin(a) * r, 2.2 + 0.07 * (i % 3), Math.cos(a) * r);
    glowRod(base, tip, 0.004, VIOL, 1.2);
    orb(tip, 0.016, i % 2 ? PINK : CYAN, 1.8);
  }
  // hanging tendrils
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const len = 0.28 + 0.12 * (i % 3);
    const path = catmull([
      [dx * 0.12, 1.9, dz * 0.12],
      [dx * 0.2, 1.8, dz * 0.2],
      [dx * 0.24, 1.8 - len * 0.6, dz * 0.24],
      [dx * 0.22, 1.8 - len, dz * 0.22],
    ]);
    b.sweep(path, [0.014, 0.005], { sides: 5, color: i % 2 ? VIOL : MAG, caps: "round" });
    const e = path.at(1);
    orb(V(e.x, e.y - 0.015, e.z), 0.026, i % 2 ? CYAN : PINK, 1.7);
  }

  // ---- helicopter spirals ----------------------------------------------
  const spirals: [number, number, number, number][] = [
    [0.62, 0.35, 0.5, 1],
    [-0.55, -0.4, 0.38, 0.8],
    [-0.3, 0.7, 0.3, 0.7],
  ];
  spirals.forEach(([x, z, h, sc], i) => {
    const stem = catmull([
      [x, 0, z],
      [x * 1.03, h * 0.5, z * 1.03],
      [x * 1.05, h, z * 1.05],
    ]);
    b.sweep(stem, [0.022, 0.012], { sides: 6, color: STALK_HI, caps: "round" });
    const c = V(x * 1.05, h, z * 1.05);
    const coil = spiral(c, V(c.x + 0.11 * sc, c.y, c.z), [0, 1, 0], { turns: 2.2, r1: 0.025 * sc, pitch: 0.05 * sc });
    glow(b.sweep(coil, [0.014, 0.006], { sides: 5, color: i % 2 ? PINK : VIOL, caps: "round" }), 1.2);
    orb(V(c.x, c.y + 0.05, c.z), 0.018, CYAN, 1.7);
  });

  // ---- ground bulbs ----------------------------------------------------
  for (let i = 0; i < 11; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.35 + rand() * 0.55;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const h = 0.08 + rand() * 0.14;
    b.part(new THREE.CylinderGeometry(0.008, 0.014, h + 0.02, 5), STALK_HI, { at: [x, h / 2 - 0.01, z], flat: true });
    orb(V(x, h + 0.015, z), 0.022 + rand() * 0.014, i % 3 === 0 ? PINK : i % 3 === 1 ? CYAN : AQUA, 1.6);
    b.part(new THREE.ConeGeometry(0.03, 0.025, 6, 1, true), LEAF, { at: [x, h - 0.005, z], flat: true });
  }

  // ---- floating spores -------------------------------------------------
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.25 + rand() * 0.55;
    orb(V(Math.sin(a) * r, 0.8 + rand() * 1.6, Math.cos(a) * r), 0.008 + rand() * 0.008, i % 2 ? AQUA : PINK, 1.8);
  }

  return b.root;
}
```