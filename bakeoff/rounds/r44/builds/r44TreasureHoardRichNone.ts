import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, noise, mix, smoothstep, grain, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description: "Hextech-flavoured treasure hoard: open chest, coin mounds, gems, crown and goblets.",
};

export default function build() {
  const b = createBuilder({ name: "hoard" });
  const R = rng(11);

  // ---------- palette & paints ----------
  const GOLD = paint((p, n) =>
    mix("#b87a1c", "#ffd95e", Math.min(1, smoothstep(0.3, 0.7, noise(p, 0.09, 3)) * 0.55 + Math.max(n.y, 0) * 0.45)),
  );
  const WOOD = grain("#3f2214", "#6a3d20", { size: 0.025, axis: "x" });
  const DARKGOLD = "#8a5a14";
  const GOLDS = ["#e8b73a", "#ffd24d", "#c98f26"];
  const BLUE = "#3fd8ff";
  const RED = "#e0245e";
  const GREEN = "#2fe08a";
  const PURPLE = "#9a52ff";

  const crest = svg(
    `<svg viewBox="0 0 64 76"><path d="M4 6 H60 V42 Q60 66 32 74 Q4 66 4 42Z" fill="#1c1030" stroke="#ffd24d" stroke-width="4"/>
    <path d="M14 46 L14 26 L24 36 L32 18 L40 36 L50 26 L50 46Z" fill="#ffd24d" stroke="#8a5a14" stroke-width="2"/>
    <rect x="14" y="48" width="36" height="6" fill="#ffd24d"/><circle cx="32" cy="38" r="4" fill="#3fd8ff"/>
    <path d="M10 12 H54" stroke="#3fd8ff" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const coinFace = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffd24d" stroke="#8a5a14" stroke-width="4"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#b87a1c" stroke-width="3"/>
    <path d="M32 14 L44 32 L32 50 L20 32Z" fill="#b87a1c" stroke="#8a5a14" stroke-width="2"/><circle cx="32" cy="32" r="4" fill="#3fd8ff"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, c: any, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at });

  const coinLists: THREE.BufferGeometry[][] = [[], [], []];
  const addCoin = (x: number, y: number, z: number, tx: number, tz: number, ry: number, r = 0.042) => {
    const g = new THREE.CylinderGeometry(r, r, 0.009, 10);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(tx, ry, tz)),
      new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    coinLists[Math.floor(R() * 3)].push(g);
  };

  const gem = (x: number, y: number, z: number, color: string, s = 0.035, strength = 0.7) => {
    const g = new THREE.IcosahedronGeometry(s, 0);
    const p = b.part(g, color, { at: [x, y, z], rotation: [R() * 60, R() * 360, R() * 60], scale: [1, 1.25, 1], flat: true });
    glow(p, strength);
    return p;
  };

  // ---------- chest ----------
  const CZ = -0.2;
  box(0.9, 0.5, 0.55, WOOD, [0, 0.25, CZ]);
  box(0.94, 0.07, 0.59, GOLD, [0, 0.035, CZ]);
  for (const s of [1, -1]) {
    box(0.08, 0.5, 0.57, GOLD, [s * 0.3, 0.25, CZ]);
    box(0.04, 0.04, 0.59, GOLD, [s * 0.45, 0.48, CZ]);
    for (const t of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { at: [s * 0.45, 0.03, CZ + t * 0.295] });
      b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, { at: [s * 0.3, 0.46, CZ + t * 0.29] });
    }
  }
  box(0.94, 0.04, 0.04, GOLD, [0, 0.48, CZ + 0.275]);
  box(0.94, 0.04, 0.04, GOLD, [0, 0.48, CZ - 0.275]);
  // crest + lock
  b.part(new THREE.PlaneGeometry(0.2, 0.24), "#ffffff", {
    at: [0, 0.22, CZ + 0.2825], dir: [0, 0, 1], axis: "z", texture: crest,
  });
  box(0.12, 0.13, 0.03, GOLD, [0, 0.43, CZ + 0.29]);
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), BLUE, { at: [0, 0.43, CZ + 0.315], scale: [1, 1.3, 0.6], flat: true }), 1.2);

  // lid (open ~110 deg), profile in (z, y) about the hinge
  const phi = (112 * Math.PI) / 180;
  const lidProfile = (k: number): [number, number][] => {
    const pts: [number, number][] = [];
    const cz = 0.275;
    pts.push([cz + (0 - cz) * k, 0]);
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI - (i / 8) * Math.PI;
      pts.push([cz + 0.275 * k * Math.cos(a), 0.275 * k * Math.sin(a)]);
    }
    return pts;
  };
  const rot = (pts: [number, number][]) =>
    pts.map(([z, y]) => [z * Math.cos(phi) - y * Math.sin(phi), z * Math.sin(phi) + y * Math.cos(phi)] as [number, number]);
  const hinge = [0, 0.5, CZ - 0.275];
  b.extrude(rot(lidProfile(1)), { at: hinge, x: [0, 0, 1], thickness: 0.9, color: WOOD });
  for (const s of [1, -1])
    b.extrude(rot(lidProfile(1.05)), { at: [s * 0.3, 0.5, CZ - 0.275], x: [0, 0, 1], thickness: 0.08, color: GOLD });

  // ---------- coin mound in chest ----------
  b.lathe([[0, 0], [0.4, 0], [0.34, 0.05], [0.18, 0.11], [0, 0.14]], { at: [0, 0.47, CZ], segments: 10, color: GOLD });
  for (let i = 0; i < 26; i++) {
    const a = R() * 6.28, r = R() * 0.34;
    addCoin(Math.sin(a) * r, 0.47 + 0.14 * (1 - r / 0.42) + 0.01, CZ + Math.cos(a) * r, (R() - 0.5) * 0.9, (R() - 0.5) * 0.9, R() * 6);
  }
  gem(0.12, 0.64, CZ + 0.05, RED, 0.04);
  gem(-0.15, 0.6, CZ - 0.05, GREEN, 0.035);
  gem(0.0, 0.64, CZ - 0.12, BLUE, 0.04);

  // ---------- floor mound ----------
  const PX = 0.15, PZ = 0.75;
  const hAt = (r: number) => 0.33 * Math.pow(Math.max(0, 1 - r / 0.95), 0.7);
  b.lathe([[0, 0], [0.95, 0], [0.82, 0.08], [0.5, 0.22], [0.25, 0.3], [0, 0.33]], { at: [PX, -0.005, PZ], segments: 12, color: GOLD });
  for (let i = 0; i < 150; i++) {
    const a = R() * 6.28, r = Math.sqrt(R()) * 0.95;
    const x = PX + Math.sin(a) * r, z = PZ + Math.cos(a) * r;
    addCoin(x, hAt(r) + 0.012, z, (R() - 0.5) * 1.1, (R() - 0.5) * 1.1, R() * 6);
  }
  // stacks
  const stack = (x: number, z: number, n: number, y0: number) => {
    for (let i = 0; i < n; i++) addCoin(x + (R() - 0.5) * 0.008, y0 + 0.005 + i * 0.0095, z + (R() - 0.5) * 0.008, 0, 0, R() * 6, 0.044);
  };
  stack(-0.7, 0.75, 9, 0);
  stack(-0.62, 0.84, 5, 0);
  stack(1.2, 0.9, 7, 0);
  // spilled coins on floor
  for (let i = 0; i < 14; i++) addCoin(0.7 + R() * 0.7, 0.005, 1.1 + R() * 0.3, 0, 0, R() * 6);
  coinLists.forEach((l, i) => b.part(mergeGeometries(l)!, GOLDS[i], { at: [0, 0, 0] }));

  // hero coin standing against pile
  const hy = hAt(0.42) + 0.06;
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 14), "#d89a2a", { at: [0.5, hy, 0.97], dir: [0, 0.2, 1] });
  b.part(new THREE.CircleGeometry(0.052, 14), "#ffffff", { at: [0.5, hy + 0.0013, 0.977], dir: [0, 0.2, 1], axis: "z", texture: coinFace });

  // gems on pile
  const gemCols = [RED, BLUE, GREEN, PURPLE, "#ffb02e", RED, BLUE];
  gemCols.forEach((c, i) => {
    const a = R() * 6.28, r = 0.1 + R() * 0.65;
    gem(PX + Math.sin(a) * r, hAt(r) + 0.035, PZ + Math.cos(a) * r, c, 0.03 + R() * 0.025);
  });
  gem(PX + 0.1, hAt(0.1) + 0.06, PZ - 0.05, BLUE, 0.07, 1.1); // big hextech crystal
  gem(PX - 0.3, hAt(0.32) + 0.05, PZ + 0.1, RED, 0.055);

  // ---------- crown ----------
  const cx = -0.4, cz = 0.55, cy = hAt(Math.hypot(cx - PX, cz - PZ)) + 0.03;
  b.lathe([[0.16, 0], [0.18, 0], [0.18, 0.08], [0.16, 0.08]], { at: [cx, cy, cz], segments: 12, color: GOLD });
  b.lathe([[0.17, 0.0], [0.19, 0.0], [0.19, 0.012], [0.17, 0.012]], { at: [cx, cy, cz], segments: 12, color: DARKGOLD });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * 6.28;
    const tall = i % 2 === 0;
    const h = tall ? 0.13 : 0.08;
    const x = cx + Math.sin(a) * 0.175, z = cz + Math.cos(a) * 0.175;
    b.part(new THREE.ConeGeometry(0.03, h, 5), GOLD, { at: [x, cy + 0.08 + h / 2 - 0.005, z] });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), tall ? "#ffffff" : "#ffe9a0", { at: [x, cy + 0.08 + h + 0.005, z] });
    if (tall) gem(cx + Math.sin(a) * 0.19, cy + 0.04, cz + Math.cos(a) * 0.19, [RED, BLUE, GREEN, PURPLE][(i / 2) | 0], 0.026);
  }

  // ---------- goblets ----------
  const goblet = (at: number[], axis: number[], gc: string) => {
    b.lathe(
      [[0, 0], [0.07, 0], [0.07, 0.015], [0.022, 0.035], [0.02, 0.12], [0.045, 0.14], [0.065, 0.18], [0.08, 0.26], [0, 0.235]],
      { at, axis, segments: 10, color: GOLD },
    );
    // knop & rim rings
    const ax = new THREE.Vector3(...axis).normalize();
    const place = (h: number) => new THREE.Vector3(...at).addScaledVector(ax, h).toArray();
    b.part(new THREE.SphereGeometry(0.03, 8, 6), DARKGOLD, { at: place(0.08), scale: [1, 0.7, 1] });
    glow(b.part(new THREE.OctahedronGeometry(0.02, 0), gc, { at: place(0.18) , flat: true }), 0.9);
  };
  goblet([-0.78, 0, 0.15], [0, 1, 0], RED);
  goblet([-0.95, 0, 0.55], [0, 1, 0], GREEN);
  goblet([1.15, 0.085, 0.35], [-0.95, 0.05, 0.3], BLUE);
  for (let i = 0; i < 5; i++) addCoin(0.82 + i * 0.02, 0.006 + i * 0.001, 0.52 + R() * 0.2, 0, 0, R() * 6);

  return b.root;
}
