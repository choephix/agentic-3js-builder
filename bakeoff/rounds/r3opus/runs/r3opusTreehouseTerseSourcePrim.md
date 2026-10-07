```ts
import * as THREE from "three";
import { createBuilder, rng, paint, grain, mottle, noise, mix, svg } from "agentic-3js-builder";
import type { Fill, Part } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A stylized low-poly treehouse: a teal board cabin with a shingled roof grows around an old trunk, with a plank porch, railing, bunting, lantern, ladder, rope swing, pulley bucket and an apple-dotted canopy.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  // ---------- palette ----------
  const CREAM = "#f1e3c4";
  const RAIL = "#8a5a34";
  const RAIL_TOP = "#a46e3e";
  const BEAM = "#7a4f2c";
  const PLANKS = ["#b07a48", "#a46e3e", "#bd8753", "#9c6a3c"];
  const DOOR = "#e8a93a";
  const GLASS = "#9fd6e8";
  const BRASS = "#d9b44a";
  const ROOF_RED = "#d0603f";
  const ROPE = "#d8c49a";
  const DARK = "#3b3b3b";

  const bark = grain("#6b4a2f", "#463020", { size: 0.05, axis: "y", seed: 2 });
  const walls = paint((p, n) => {
    const u = Math.abs(n.z) >= Math.abs(n.x) ? p.x : p.z;
    const k = Math.floor(u / 0.17);
    const f = u / 0.17 - k;
    if (f < 0.09) return "#2f5d5e";
    const v = (((k * 37) % 7) + 7) % 7;
    return mix("#4a938f", "#5fb0a9", v / 6);
  });
  const shingles = paint((p, n) => {
    if (n.y < -0.2) return "#5a3a26";
    const row = Math.floor(p.y / 0.12);
    const fy = p.y / 0.12 - row;
    const x = p.x / 0.22 + (row % 2 ? 0.5 : 0);
    const col = Math.floor(x);
    const fx = x - col;
    if (fy < 0.14 || fx < 0.07) return "#7a2e22";
    const v = (((row * 13 + col * 7) % 5) + 5) % 5;
    return ["#c4513a", "#b8472f", "#d0603f", "#c95a3c", "#a94431"][v];
  });
  const leaves = paint((p, n) => {
    const t = 0.38 + 0.38 * n.y + 0.6 * (noise(p, 0.9, 3) - 0.5);
    return mix("#3a6f30", "#97cf5e", t);
  });
  const grass = mottle("#6aa84f", "#55923f", { size: 0.6, seed: 4 });

  const box = (size: [number, number, number], color: Fill, at: number[], rotation?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation });

  // ---------- ground ----------
  b.part(new THREE.CylinderGeometry(3.4, 3.6, 0.12, 14), grass, { at: [0, 0.06, 0] });
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.0 + R() * 2.2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (x < -0.8 && x > -1.7 && z > 2.2) continue; // ladder foot
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.ConeGeometry(0.04, 0.2 + R() * 0.1, 4), k % 2 ? "#4f8a3c" : "#7bb661", {
        at: [x + (R() - 0.5) * 0.12, 0.2, z + (R() - 0.5) * 0.12],
        rotation: [(R() - 0.5) * 25, 0, (R() - 0.5) * 25],
      });
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.4 + R() * 1.8;
    b.part(new THREE.DodecahedronGeometry(0.12 + R() * 0.08), i % 2 ? "#9a9a92" : "#b3b2a8", {
      at: [Math.cos(a) * r, 0.1, Math.sin(a) * r],
      scale: [1, 0.6, 1],
      flat: true,
    });
  }
  // daisies
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const r = 1.3 + R() * 1.8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    b.rod([x, 0.1, z], [x, 0.26, z], 0.01, { color: "#4f8a3c" });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 6), "#ffffff", { at: [x, 0.27, z] });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), "#f2c230", { at: [x, 0.28, z] });
  }

  // ---------- trunk & roots ----------
  b.lathe(
    [
      [0, 0],
      [0.78, 0],
      [0.52, 0.45],
      [0.44, 3],
      [0.37, 6],
      [0.26, 9.3],
      [0, 9.3],
    ],
    { color: bark, at: [0, 0, 0], segments: 9 },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.capsule([c * 0.3, 0.4, s * 0.3], [c * (1.05 + R() * 0.3), 0.02, s * (1.05 + R() * 0.3)], [0.2, 0.07], {
      color: bark,
    });
  }
  // knot hole
  b.part(new THREE.SphereGeometry(0.1, 8, 6), "#2a1a10", { at: [0.12, 2.35, 0.42], scale: [1, 1.5, 0.5] });
  b.part(new THREE.TorusGeometry(0.11, 0.03, 4, 8), "#5a3c25", { at: [0.12, 2.35, 0.43], scale: [1, 1.5, 1] });
  // mushrooms
  for (let i = 0; i < 3; i++) {
    const a = 1.9 + i * 0.5;
    const r = 0.75 + i * 0.12;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const h = 0.14 + i * 0.04;
    b.part(new THREE.CylinderGeometry(0.03, 0.04, h, 6), "#f4ecd8", { at: [x, 0.1 + h / 2, z] });
    b.part(new THREE.SphereGeometry(0.09, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), "#d9412e", {
      at: [x, 0.1 + h, z],
    });
    b.part(new THREE.SphereGeometry(0.014, 4, 3), "#ffffff", { at: [x + 0.04, 0.1 + h + 0.06, z] });
    b.part(new THREE.SphereGeometry(0.014, 4, 3), "#ffffff", { at: [x - 0.03, 0.1 + h + 0.07, z + 0.03] });
  }
  // sign on the trunk
  const signTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80"><rect width="220" height="80" fill="#c99a62"/><rect x="4" y="4" width="212" height="72" fill="none" stroke="#8a5a34" stroke-width="4"/><circle cx="14" cy="40" r="4" fill="#555"/><circle cx="206" cy="40" r="4" fill="#555"/><text x="110" y="51" font-family="Georgia, serif" font-size="26" font-weight="bold" text-anchor="middle" fill="#5a2e1a">CLUBHOUSE</text></svg>`,
    { size: 512 },
  );
  box([0.72, 0.28, 0.04], "#8a5a34", [0, 1.7, 0.5], [0, 0, -4]);
  b.part(new THREE.PlaneGeometry(0.68, 0.25), "#ffffff", { at: [0, 1.7, 0.523], rotation: [0, 0, -4], texture: signTex });

  // ---------- platform ----------
  const DECK = 3.0;
  for (let i = 0; i < 16; i++) {
    const z = -1.5 + 0.105 + i * 0.21;
    box([3.6, 0.08, 0.19], PLANKS[Math.floor(R() * PLANKS.length)], [(R() - 0.5) * 0.04, DECK - 0.04 + (R() - 0.5) * 0.01, z]);
  }
  for (const x of [-1.7, -0.6, 0.6, 1.7]) box([0.12, 0.18, 3.5], BEAM, [x, DECK - 0.17, 0.2]);
  for (const z of [-1.5, 1.9]) box([3.7, 0.2, 0.12], BEAM, [0, DECK - 0.16, z]);
  for (const [sx, sz] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    b.rod([sx * 0.25, 1.85, sz * 0.2], [sx * 1.68, DECK - 0.24, sz > 0 ? 1.7 : -1.35], 0.06, { color: BEAM });
  }

  // ---------- railing ----------
  const post = (x: number, z: number, tall = false) =>
    box([0.08, tall ? 1.75 : 0.95, 0.08], RAIL, [x, DECK + (tall ? 0.875 : 0.475), z]);
  const FZ = 1.86;
  const BZ = -1.46;
  const SX = 1.76;
  for (let i = 0; i <= 10; i++) {
    const x = -SX + i * 0.352;
    if (i === 0 || i === 10) post(x, FZ, true);
    else if (x > -0.75) post(x, FZ);
    post(x, BZ);
  }
  for (let i = 1; i < 10; i++) {
    const z = BZ + i * 0.332;
    post(SX, z);
    post(-SX, z);
  }
  const rails = (y: number, h: number, w: number, color: string) => {
    box([2.464, h, w], color, [0.528, y, FZ]);
    box([3.6, h, w], color, [0, y, BZ]);
    box([w, h, 3.4], color, [SX, y, 0.2]);
    box([w, h, 3.4], color, [-SX, y, 0.2]);
  };
  rails(DECK + 0.97, 0.06, 0.13, RAIL_TOP);
  rails(DECK + 0.5, 0.04, 0.05, RAIL);

  // bunting between the tall corner posts
  const sagY = (x: number) => DECK + 1.72 - 0.32 * (1 - (x / SX) ** 2);
  const stringPts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -SX + (i / 8) * 2 * SX;
    stringPts.push([x, sagY(x), FZ]);
  }
  b.sweep(stringPts, { radius: 0.012, color: CREAM, sides: 4 });
  const FLAGS = ["#e8a93a", "#d0603f", "#4f9a96", CREAM, "#7bb661"];
  for (let i = 0; i < 11; i++) {
    const x = -SX + ((i + 0.75) / 11.5) * 2 * SX;
    const y = sagY(x) - 0.01;
    b.slab(
      [
        [x - 0.09, y, FZ],
        [x, y - 0.2, FZ],
        [x + 0.09, y, FZ],
      ],
      { color: FLAGS[i % FLAGS.length], thickness: 0.01 },
    );
  }

  // ---------- cabin ----------
  const HZ = -0.2;
  const TOP = DECK + 1.9;
  const RISE = 0.85;
  const RIDGE = TOP + RISE;
  box([2.4, 1.9, 2.0], walls, [0, DECK + 0.95, HZ]);
  for (const x of [-1.2, 1.2]) for (const z of [0.8, -1.2]) box([0.1, 1.9, 0.1], CREAM, [x, DECK + 0.95, z]);
  for (const z of [0.8 - 0.04, -1.2 + 0.04]) {
    b.extrude(
      [
        [-1.2, 0],
        [1.2, 0],
        [0, RISE],
      ],
      { color: walls, at: [0, TOP, z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08 },
    );
  }
  // roof
  const a = Math.atan2(RISE, 1.0);
  const aDeg = (a * 180) / Math.PI;
  const len = 1.3 / Math.cos(a) + 0.06;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.9, 0.1, len), shingles, {
      at: [0, RIDGE - 0.65 * RISE + 0.06 * Math.cos(a), HZ + s * (0.65 + 0.06 * Math.sin(a))],
      rotation: [s * aDeg, 0, 0],
    });
  }
  box([2.96, 0.17, 0.17], "#7a2e22", [0, RIDGE + 0.08, HZ], [45, 0, 0]);
  // attic porthole
  b.part(new THREE.TorusGeometry(0.14, 0.035, 5, 10), CREAM, { at: [0, TOP + 0.33, 0.82] });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 10), GLASS, { at: [0, TOP + 0.33, 0.81], rotation: [90, 0, 0] });

  // door
  const DX = 0.55;
  box([0.86, 1.55, 0.05], CREAM, [DX, DECK + 0.775, 0.82]);
  box([0.7, 1.42, 0.06], DOOR, [DX, DECK + 0.71, 0.85]);
  for (const y of [0.35, 1.05]) box([0.66, 0.08, 0.03], "#c98a2a", [DX, DECK + y, 0.885]);
  b.part(new THREE.SphereGeometry(0.04, 6, 5), BRASS, { at: [DX - 0.25, DECK + 0.72, 0.9] });
  b.part(new THREE.TorusGeometry(0.11, 0.025, 4, 10), CREAM, { at: [DX, DECK + 1.15, 0.885] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10), GLASS, { at: [DX, DECK + 1.15, 0.88], rotation: [90, 0, 0] });

  // front window with shutters and a flower box
  const WX = -0.55;
  const WY = DECK + 1.05;
  box([0.84, 0.74, 0.05], CREAM, [WX, WY, 0.82]);
  box([0.66, 0.56, 0.04], GLASS, [WX, WY, 0.84]);
  box([0.05, 0.56, 0.03], CREAM, [WX, WY, 0.865]);
  box([0.66, 0.05, 0.03], CREAM, [WX, WY, 0.865]);
  for (const s of [-1, 1]) {
    box([0.28, 0.68, 0.04], ROOF_RED, [WX + s * 0.58, WY, 0.83]);
    for (const dy of [-0.18, 0, 0.18]) box([0.22, 0.03, 0.02], "#a94431", [WX + s * 0.58, WY + dy, 0.855]);
  }
  box([0.82, 0.16, 0.18], "#8a5a34", [WX, WY - 0.45, 0.92]);
  const BLOOMS = ["#f28ab2", "#ffffff", "#f2c230", "#e0573f"];
  for (let i = 0; i < 6; i++) {
    const x = WX - 0.32 + i * 0.128;
    b.part(new THREE.SphereGeometry(0.055, 6, 4), "#4f8a3c", { at: [x, WY - 0.34, 0.93], flat: true });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BLOOMS[i % BLOOMS.length], { at: [x + 0.02, WY - 0.28, 0.96] });
  }

  // side windows
  b.part(new THREE.TorusGeometry(0.22, 0.045, 5, 12), CREAM, { at: [1.22, DECK + 1.1, HZ], rotation: [0, 90, 0] });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), GLASS, { at: [1.21, DECK + 1.1, HZ], rotation: [0, 0, 90] });
  box([0.06, 0.62, 0.62], CREAM, [-1.22, DECK + 1.1, HZ]);
  box([0.04, 0.5, 0.5], GLASS, [-1.24, DECK + 1.1, HZ]);
  box([0.03, 0.5, 0.04], CREAM, [-1.26, DECK + 1.1, HZ]);

  // stovepipe
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.95, 8), "#5b5f66", { at: [-0.8, RIDGE - 0.2, HZ - 0.55] });
  b.part(new THREE.TorusGeometry(0.085, 0.02, 4, 8), "#3f4247", { at: [-0.8, RIDGE + 0.05, HZ - 0.55], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.16, 0.12, 8), "#3f4247", { at: [-0.8, RIDGE + 0.36, HZ - 0.55] });

  // lantern
  const LX = 1.06;
  b.rod([LX, 4.62, 1.0], [LX, 4.48, 1.0], 0.01, { color: DARK });
  b.part(new THREE.ConeGeometry(0.11, 0.08, 4), DARK, { at: [LX, 4.46, 1.0], rotation: [0, 45, 0] });
  box([0.13, 0.17, 0.13], "#ffd66b", [LX, 4.34, 1.0]);
  for (const [dx, dz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    box([0.02, 0.18, 0.02], DARK, [LX + dx * 0.07, 4.34, 1.0 + dz * 0.07]);
  box([0.16, 0.03, 0.16], DARK, [LX, 4.24, 1.0]);

  // ---------- ladder ----------
  for (const x of [-1.4, -1.0]) b.rod([x, 0, 2.75], [x, 3.4, 1.94], 0.045, { color: RAIL });
  for (let i = 0; i < 11; i++) {
    const y = 0.3 * (i + 1);
    const z = 2.75 - 0.81 * (y / 3.4);
    b.rod([-1.43, y, z], [-0.97, y, z], 0.03, { color: RAIL_TOP });
  }

  // ---------- pulley bucket ----------
  const PZ = BZ + 8 * 0.332;
  box([0.5, 0.06, 0.06], RAIL, [1.98, DECK + 1.03, PZ]);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), "#5b5f66", { at: [2.15, DECK + 0.97, PZ], rotation: [90, 0, 0] });
  b.rod([2.21, DECK + 0.97, PZ], [2.21, 1.55, PZ], 0.01, { color: ROPE, sides: 4 });
  b.part(new THREE.CylinderGeometry(0.17, 0.13, 0.28, 10), "#4f7fa8", { at: [2.21, 1.25, PZ] });
  b.part(new THREE.TorusGeometry(0.17, 0.015, 4, 12), "#3a5f80", { at: [2.21, 1.39, PZ], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.16, 0.012, 4, 10, Math.PI), "#5b5f66", { at: [2.21, 1.39, PZ] });

  // ---------- branches, swing ----------
  b.capsule([0.2, 5.9, 0.08], [2.9, 6.9, 0.5], [0.15, 0.06], { color: bark });
  const swingTop = [2.3, 6.62, 0.41];
  b.rod(swingTop, [2.3, 0.58, 0.16], 0.012, { color: ROPE, sides: 4 });
  b.rod(swingTop, [2.3, 0.58, 0.66], 0.012, { color: ROPE, sides: 4 });
  box([0.24, 0.05, 0.62], ROOF_RED, [2.3, 0.55, 0.41]);

  // ---------- canopy ----------
  const blobs: Array<[number, number, number, number]> = [
    [0, 8.6, 0, 2.0],
    [1.5, 8.0, 0.6, 1.5],
    [-1.5, 8.1, 0.3, 1.55],
    [0.4, 8.2, -1.4, 1.5],
    [-0.6, 9.6, -0.3, 1.4],
    [0.8, 9.4, 0.9, 1.25],
    [2.6, 7.4, 0.5, 1.0],
    [-0.4, 7.7, 1.4, 1.2],
  ];
  const canopy: Part[] = [];
  for (const [x, y, z, r] of blobs) {
    if (Math.hypot(x, z) > 0.5)
      b.capsule([0, Math.min(y - 1.2, 8.0), 0], [x * 0.65, y - 0.2, z * 0.65], [0.13, 0.06], { color: bark });
    canopy.push(
      b.part(new THREE.IcosahedronGeometry(r, 1), leaves, {
        at: [x, y, z],
        scale: [1, 0.85, 1],
        rotation: [R() * 40, R() * 90, R() * 40],
        flat: true,
      }),
    );
  }
  const hits = b.surface(canopy).scatter(18, {
    rng: rng(5),
    minDist: 0.5,
    filter: (h) => h.n.y < 0.55 && h.n.y > -0.6,
  });
  for (const h of hits) {
    const apple = h.moved([0, 0.06, 0]);
    b.part(new THREE.SphereGeometry(0.1, 7, 5), "#d9412e", { at: apple });
    b.part(new THREE.SphereGeometry(0.03, 4, 3), "#f08a6e", { at: h.moved([0.04, 0.12, 0.04]) });
  }

  return b.root;
}
```