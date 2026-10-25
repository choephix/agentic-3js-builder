```ts
import * as THREE from "three";
import { createBuilder, rng, svg, metal, panelled, mottle, coil, catmull, glow } from "agentic-3js-builder";

export const meta = {
  name: "Ares-77 Armored Hauler",
  description:
    "Low-poly cyberpunk militarized 6x6 truck from 2077: riveted armor, neon underglow, rocket pod, remote turret, radar and drone pad.",
};

type P = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "ares77" });
  const r = rng(77);

  // ---------- palette ----------
  const HULL = panelled(mottle("#2b3442", "#3a4760", { size: 0.5 }), { size: 0.4, rivets: 0.07 });
  const HULL2 = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.3, rivets: 0.06 });
  const STEEL = metal("steel", { tarnish: 0.45 });
  const BRASS = metal("brass", { tarnish: 0.6 });
  const DARK = "#12141a";
  const TIRE = "#181a20";
  const TIRE2 = "#0d0e12";
  const CYAN = "#19f0ff";
  const MAG = "#ff2d9c";
  const ORANGE = "#ff7a1a";
  const YEL = "#ffd21f";
  const RED = "#ff2a2a";
  const WARM = "#fff2c0";

  // ---------- textures ----------
  let stripes = "";
  for (let i = -1; i < 5; i++)
    stripes += `<polygon points="${i * 16},16 ${i * 16 + 8},16 ${i * 16 + 16},0 ${i * 16 + 8},0"/>`;
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffd21f"/><g fill="#15151a">${stripes}</g><rect width="64" height="16" fill="none" stroke="#15151a" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#10131c" stroke="#19f0ff" stroke-width="4"/>
    <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="none" stroke="#ff2d9c" stroke-width="2"/>
    <path d="M30 34 L50 24 L70 34 L70 44 L50 36 L30 44Z" fill="#ff2d9c"/>
    <path d="M30 52 L50 44 L70 52 L70 62 L50 54 L30 62Z" fill="#19f0ff"/>
    <path d="M44 66 L56 66 L50 80Z" fill="#ffd21f"/></svg>`,
    { size: 256 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 160 60"><rect width="160" height="60" rx="4" fill="#0b0d14" stroke="#19f0ff" stroke-width="3"/>
    <text x="80" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#19f0ff">ARES-77</text>
    <text x="80" y="47" text-anchor="middle" font-family="monospace" font-size="11" fill="#ff2d9c">ORBITAL DEFENSE DIV.</text>
    <path d="M6 54 H40 M120 54 H154" stroke="#ffd21f" stroke-width="2"/></svg>`,
    { size: 512 },
  );
  const WIN = svg(
    `<svg viewBox="0 0 100 50"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c3a52"/><stop offset="1" stop-color="#05121c"/></linearGradient></defs>
    <rect width="100" height="50" fill="url(#g)"/>
    <polygon points="10,50 22,0 32,0 20,50" fill="#9fefff" opacity="0.22"/><polygon points="40,50 48,0 52,0 44,50" fill="#9fefff" opacity="0.15"/>
    <path d="M6 42 H34 M6 38 H24" stroke="#19f0ff" stroke-width="1.2" opacity="0.7"/><circle cx="88" cy="40" r="3" fill="none" stroke="#ff2d9c" stroke-width="1"/>
    <rect width="100" height="50" fill="none" stroke="#050608" stroke-width="4"/></svg>`,
    { size: 512 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 80 30"><rect width="80" height="30" rx="3" fill="#e8e8d0" stroke="#111" stroke-width="2"/>
    <text x="40" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#111">N-2077</text></svg>`,
    { size: 256 },
  );
  const PAD = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0c0f16" stroke="#ffd21f" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="#19f0ff" stroke-width="2" stroke-dasharray="6 4"/>
    <path d="M36 28 V72 M64 28 V72 M36 50 H64" stroke="#ffd21f" stroke-width="7"/></svg>`,
    { size: 256 },
  );
  const RADAR = svg(
    `<svg viewBox="0 0 80 80"><rect width="80" height="80" fill="#04100a" stroke="#2cff7a" stroke-width="3"/>
    <circle cx="40" cy="40" r="30" fill="none" stroke="#2cff7a" stroke-width="1.5"/><circle cx="40" cy="40" r="18" fill="none" stroke="#2cff7a" stroke-width="1"/><circle cx="40" cy="40" r="8" fill="none" stroke="#2cff7a" stroke-width="1"/>
    <path d="M40 8 V72 M8 40 H72" stroke="#2cff7a" stroke-width="1"/><path d="M40 40 L64 22 A30 30 0 0 0 40 10Z" fill="#2cff7a" opacity="0.35"/>
    <circle cx="55" cy="30" r="2.5" fill="#ff2a2a"/><circle cx="26" cy="52" r="2" fill="#ffd21f"/></svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const B = (w: number, h: number, d: number, color: any, at: P, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const Cy = (rt: number, rb: number, h: number, seg: number, color: any, at: P, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
  const L = (part: any, s = 1.2) => glow(part, s);
  const decal = (w: number, h: number, tex: any, at: P, dir: P, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const bolts = (pts: P[], dir: P, rad = 0.025, color: any = STEEL) =>
    pts.forEach((p) => Cy(rad, rad, 0.03, 6, color, p, { dir }));

  const R = 0.65;
  const axleZ = [2.3, -1.6, -2.9];

  // ---------- chassis ----------
  B(2.0, 0.5, 7.4, HULL2, [0, 0.95, -0.5]);
  for (const s of [1, -1]) {
    B(0.1, 0.18, 7.2, DARK, [s * 0.75, 0.62, -0.5]); // frame rails
    L(B(0.05, 0.05, 6.6, CYAN, [s * 1.0, 0.68, -0.5]), 1.6); // underglow
    L(B(0.05, 0.05, 6.6, MAG, [s * 0.9, 0.58, -0.5]), 1.0);
  }
  B(0.18, 0.18, 7.0, STEEL, [0, 0.62, -0.5]); // drive shaft
  for (const z of axleZ) {
    Cy(0.1, 0.1, 2.9, 8, STEEL, [0, R, z], { rotation: [0, 0, 90] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), STEEL, { at: [0, R, z] });
    Cy(0.2, 0.2, 0.12, 8, BRASS, [0, R, z + 0.28], { rotation: [90, 0, 0] });
  }

  // ---------- wheels ----------
  function wheel(s: number, z: number) {
    const X = s * 1.35;
    Cy(R, R, 0.5, 16, TIRE, [X, R, z], { rotation: [0, 0, 90] });
    for (let k = 0; k < 16; k++) {
      const a = (k * 360) / 16;
      const rad = (a * Math.PI) / 180;
      const dx = (k % 2 ? 1 : -1) * 0.13;
      B(0.24, 0.1, 0.22, TIRE2, [X + dx, R + (R + 0.01) * Math.cos(rad), z + (R + 0.01) * Math.sin(rad)], {
        rotation: [a, 0, 0],
      });
    }
    Cy(0.43, 0.43, 0.54, 12, STEEL, [X, R, z], { rotation: [0, 0, 90] });
    Cy(0.3, 0.34, 0.08, 12, HULL2, [X + s * 0.27, R, z], { rotation: [0, 0, 90] });
    const t = b.part(new THREE.TorusGeometry(0.37, 0.022, 5, 20), CYAN, {
      at: [X + s * 0.28, R, z],
      rotation: [0, 90, 0],
    });
    L(t, 1.8);
    Cy(0.1, 0.1, 0.1, 8, BRASS, [X + s * 0.33, R, z], { rotation: [0, 0, 90] });
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI * 2) / 6;
      Cy(0.035, 0.035, 0.06, 6, STEEL, [X + s * 0.33, R + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], {
        rotation: [0, 0, 90],
      });
    }
    // fender + mud flap
    B(0.75, 0.08, 1.7, HULL2, [s * 1.35, 1.42, z]);
    B(0.75, 0.08, 0.5, HULL2, [s * 1.35, 1.32, z + 0.95], { rotation: [-35, 0, 0] });
    B(0.75, 0.08, 0.5, HULL2, [s * 1.35, 1.32, z - 0.95], { rotation: [35, 0, 0] });
    B(0.05, 0.14, 1.7, ORANGE, [s * 1.72, 1.42, z]);
    B(0.55, 0.4, 0.05, DARK, [s * 1.35, 0.4, z - 0.85]);
    L(B(0.5, 0.04, 0.06, YEL, [s * 1.35, 0.22, z - 0.82]), 0.9);
    // shock absorber coil
    b.sweep(coil([s * 0.95, 0.78, z + 0.32], [s * 0.95, 1.2, z + 0.32], 0.07, 6), 0.012, { color: ORANGE });
    b.rod([s * 0.95, 0.75, z + 0.32], [s * 0.95, 1.22, z + 0.32], 0.02, { color: STEEL });
  }
  for (const s of [1, -1]) for (const z of axleZ) wheel(s, z);

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [0.8, 1.2],
    [3.3, 1.2],
    [3.3, 1.8],
    [2.9, 2.2],
    [2.3, 2.9],
    [0.8, 2.9],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.03, color: HULL });
  B(2.0, 0.12, 1.3, HULL2, [0, 2.96, 1.5]); // roof plate
  bolts(
    [
      [0.9, 3.03, 0.95],
      [-0.9, 3.03, 0.95],
      [0.9, 3.03, 2.05],
      [-0.9, 3.03, 2.05],
    ],
    [0, 1, 0],
  );
  // windshield
  B(1.9, 0.9, 0.03, "#ffffff", [0, 2.57, 2.623], { rotation: [-40.6, 0, 0], texture: WIN });
  L(B(1.9, 0.04, 0.05, CYAN, [0, 2.2, 2.93], { rotation: [-40.6, 0, 0] }), 1.2);
  for (const s of [1, -1]) {
    B(0.03, 0.7, 1.2, "#ffffff", [s * 1.112, 2.35, 1.6], { texture: WIN });
    B(0.03, 0.04, 1.3, DARK, [s * 1.113, 1.98, 1.6]);
    // door seams, handle, step
    for (const z of [1.0, 2.25]) B(0.02, 1.6, 0.025, DARK, [s * 1.105, 2.0, z]);
    B(0.02, 0.05, 0.22, STEEL, [s * 1.12, 1.9, 1.15]);
    B(0.4, 0.06, 1.3, HULL2, [s * 1.3, 1.05, 1.6]);
    decal(0.55, 0.55, EMBLEM, [s * 1.12, 1.55, 1.6], [s, 0, 0]);
    L(decal(0.7, 0.28, HAZ, [s * 1.12, 1.25, 2.6], [s, 0, 0]), 0.2);
    // mirrors
    b.rod([s * 1.12, 2.4, 2.4], [s * 1.5, 2.65, 2.55], 0.02, { color: STEEL });
    B(0.1, 0.38, 0.22, HULL2, [s * 1.55, 2.65, 2.6]);
    L(B(0.02, 0.3, 0.16, CYAN, [s * 1.6, 2.65, 2.6]), 0.8);
    // headlight
    L(B(0.4, 0.22, 0.06, WARM, [s * 0.85, 1.52, 3.31]), 2);
    B(0.46, 0.28, 0.05, DARK, [s * 0.85, 1.52, 3.29]);
    // front armor corner wedges
    B(0.3, 0.7, 0.3, HULL2, [s * 1.1, 1.55, 3.2], { rotation: [0, s * 35, 0] });
    // exhaust stacks
    Cy(0.09, 0.09, 2.2, 8, STEEL, [s * 0.95, 2.3, 0.6]);
    L(Cy(0.1, 0.1, 0.06, 8, ORANGE, [s * 0.95, 3.4, 0.6]), 1.6);
    for (const y of [1.6, 2.3, 3.0]) Cy(0.12, 0.12, 0.05, 8, BRASS, [s * 0.95, y, 0.6]);
    B(0.04, 1.5, 0.3, HULL2, [s * 1.08, 2.3, 0.6]); // heat shield
    // fuel tanks
    Cy(0.38, 0.38, 1.6, 12, HULL2, [s * 1.2, 0.95, 0.4], { rotation: [90, 0, 0] });
    for (const z of [-0.2, 0.4, 1.0]) Cy(0.4, 0.4, 0.06, 12, STEEL, [s * 1.2, 0.95, z], { rotation: [90, 0, 0] });
    L(B(0.05, 0.05, 1.0, ORANGE, [s * 1.59, 0.95, 0.4]), 0.9);
  }
  // grille
  B(0.95, 0.42, 0.06, DARK, [0, 1.5, 3.31]);
  for (let i = 0; i < 4; i++) L(B(0.8, 0.03, 0.04, ORANGE, [0, 1.38 + i * 0.1, 3.34]), 1.2);
  L(B(2.0, 0.07, 0.07, CYAN, [0, 1.72, 3.32]), 2);
  // roof light bar
  for (let i = 0; i < 6; i++)
    L(B(0.28, 0.1, 0.14, i % 2 ? MAG : CYAN, [-0.7 + i * 0.28, 3.07, 2.12]), 2);

  // bumper
  B(2.7, 0.5, 0.45, HULL2, [0, 0.85, 3.45]);
  decal(2.5, 0.4, HAZ, [0, 0.85, 3.686], [0, 0, 1]);
  for (let i = 0; i < 5; i++) b.spike([-1.0 + i * 0.5, 1.12, 3.5], [0, 0.25, 1], 0.32, 0.07, { color: STEEL });
  Cy(0.12, 0.12, 0.8, 8, STEEL, [0, 0.55, 3.6], { rotation: [0, 0, 90] }); // winch
  L(B(0.5, 0.06, 0.06, RED, [0, 0.55, 3.72]), 1);
  B(2.4, 0.16, 0.5, DARK, [0, 0.55, 3.4]);

  // ---------- turret ----------
  Cy(0.36, 0.42, 0.22, 10, HULL2, [0, 3.13, 1.3]);
  Cy(0.3, 0.3, 0.06, 10, BRASS, [0, 3.26, 1.3]);
  B(0.7, 0.4, 0.9, HULL, [0, 3.5, 1.35]);
  B(0.5, 0.2, 0.4, HULL2, [0, 3.75, 1.2], { rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.17, 3.5, 1.7], [s * 0.17, 3.5, 3.4], 0.055, { color: STEEL });
    Cy(0.09, 0.09, 0.22, 8, DARK, [s * 0.17, 3.5, 3.45], { rotation: [90, 0, 0] });
    Cy(0.08, 0.08, 0.5, 8, HULL2, [s * 0.17, 3.5, 2.1], { rotation: [90, 0, 0] }); // shroud
    B(0.3, 0.3, 0.4, YEL, [s * 0.58, 3.45, 1.3]); // ammo box
    B(0.32, 0.05, 0.1, DARK, [s * 0.58, 3.45, 1.1]);
    L(B(0.04, 0.04, 0.5, ORANGE, [s * 0.17, 3.5, 3.3]), 1.6);
  }
  B(0.26, 0.24, 0.3, DARK, [0, 3.85, 1.55]);
  L(b.part(new THREE.SphereGeometry(0.07, 6, 4), RED, { at: [0, 3.85, 1.72] }), 2.2);

  // ---------- container (cargo) ----------
  B(2.3, 1.3, 3.0, HULL, [0, 1.85, -2.5]);
  B(2.4, 0.08, 3.1, HULL2, [0, 2.54, -2.5]);
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) B(0.07, 1.25, 0.1, HULL2, [s * 1.17, 1.85, -3.9 + i * 0.58]);
    L(B(0.04, 0.04, 3.0, CYAN, [s * 1.12, 2.5, -2.5]), 1.8);
    L(B(0.04, 0.04, 3.0, MAG, [s * 1.12, 1.25, -2.5]), 1.2);
    decal(1.5, 0.56, SIGN, [s * 1.2, 2.0, -2.0], [s, 0, 0]);
    L(decal(0.7, 0.7, RADAR, [s * 1.2, 1.9, -3.2], [s, 0, 0]), 0.9);
    decal(1.3, 0.3, HAZ, [s * 1.2, 1.4, -2.5], [s, 0, 0]);
    // vents
    for (let i = 0; i < 4; i++) B(0.04, 0.05, 0.5, DARK, [s * 1.17, 2.3 - i * 0.07, -1.35]);
    // bolts on ribs
    bolts([-3.9, -3.32, -2.74, -2.16, -1.58].map((z) => [s * 1.215, 1.4, z] as P), [s, 0, 0]);
    bolts([-3.9, -3.32, -2.74, -2.16, -1.58].map((z) => [s * 1.215, 2.3, z] as P), [s, 0, 0]);
    // side tool lockers
    B(0.2, 0.3, 0.7, HULL2, [s * 1.22, 1.05, -2.6]);
    B(0.2, 0.3, 0.7, HULL2, [s * 1.22, 1.05, -3.5]);
  }
  // rear door
  B(2.3, 1.25, 0.06, HULL2, [0, 1.85, -4.02]);
  B(0.03, 1.2, 0.03, DARK, [0, 1.85, -4.06]);
  for (const s of [1, -1]) {
    L(B(0.2, 0.14, 0.05, RED, [s * 0.95, 1.4, -4.07]), 2);
    B(0.06, 0.4, 0.06, STEEL, [s * 0.1, 1.85, -4.08]);
    for (const y of [1.45, 2.25]) Cy(0.05, 0.05, 0.14, 6, STEEL, [s * 1.1, y, -4.06], { rotation: [0, 0, 90] });
  }
  decal(1.0, 0.18, HAZ, [0, 1.3, -4.06], [0, 0, -1]);
  decal(0.5, 0.19, PLATE, [0, 1.12, -4.1], [0, 0, -1]);
  decal(0.7, 0.7, EMBLEM, [0, 1.95, -4.065], [0, 0, -1]);
  // rear bumper & hitch
  B(2.4, 0.3, 0.3, HULL2, [0, 0.8, -4.1]);
  decal(2.2, 0.22, HAZ, [0, 0.8, -4.26], [0, 0, -1]);
  B(0.3, 0.2, 0.4, DARK, [0, 0.7, -4.4]);
  Cy(0.08, 0.08, 0.1, 8, STEEL, [0, 0.82, -4.45]);
  // roof: drone pad, radar, antennas, greebles
  decal(1.5, 1.5, PAD, [0, 2.585, -3.0], [0, 1, 0], { up: [0, 0, 1] });
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.32, 0.06],
      [0.2, 0.22],
      [0, 0.28],
    ],
    { at: [0.6, 2.58, -1.5], segments: 8, color: STEEL },
  );
  Cy(0.03, 0.03, 0.4, 6, STEEL, [0.6, 2.85, -1.5]);
  b.part(new THREE.SphereGeometry(0.18, 8, 6), HULL, { at: [0.6, 3.1, -1.5], scale: [1.6, 0.4, 0.8], rotation: [0, 30, 0] });
  for (const [x, z, h] of [
    [-0.9, -3.8, 1.8],
    [0.9, -3.85, 1.3],
    [-0.95, -1.2, 1.0],
  ] as number[][]) {
    b.rod([x, 2.58, z], [x * 1.1, 2.58 + h, z], 0.012, { color: STEEL });
    L(b.part(new THREE.SphereGeometry(0.04, 5, 4), RED, { at: [x * 1.1, 2.6 + h, z] }), 2);
  }
  for (let i = 0; i < 7; i++) {
    const x = (r() - 0.5) * 1.8;
    const z = -1.3 - r() * 0.5 - (i % 2) * 0.1;
    B(0.1 + r() * 0.2, 0.08 + r() * 0.12, 0.1 + r() * 0.2, i % 2 ? HULL2 : STEEL, [x, 2.62, z - 2.2 * (i % 3 === 0 ? 0 : 0)]);
  }

  // ---------- rocket pod ----------
  const ang = (30 * Math.PI) / 180;
  const F: P = [0, Math.sin(ang), Math.cos(ang)];
  const U: P = [0, Math.cos(ang), -Math.sin(ang)];
  const C: P = [0, 2.15, -0.2];
  B(1.3, 0.3, 0.9, HULL2, [0, 1.35, -0.2]); // base
  Cy(0.12, 0.15, 0.5, 8, STEEL, [0, 1.65, -0.2]);
  b.part(new THREE.BoxGeometry(1.25, 0.75, 1.1), HULL, { at: C, dir: F, axis: "z" });
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++) {
      const o: P = [(i - 1.5) * 0.28, 0, 0];
      const st: P = [
        C[0] + o[0] + U[0] * (j - 0.5) * 0.28 - F[0] * 0.2,
        C[1] + U[1] * (j - 0.5) * 0.28 - F[1] * 0.2,
        C[2] + U[2] * (j - 0.5) * 0.28 - F[2] * 0.2,
      ];
      const en: P = [st[0], st[1] + F[1] * 1.1, st[2] + F[2] * 1.1];
      b.rod(st, en, 0.1, { color: DARK });
      L(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 8), ORANGE, { at: en, dir: F }), 1.8);
      Cy(0.115, 0.115, 0.05, 8, STEEL, [en[0], en[1] - 0.1 * F[1], en[2] - 0.1 * F[2]], { dir: F });
    }
  decal(0.9, 0.22, HAZ, [0, C[1] + 0.42, C[2] - 0.2], [0, 0.866, -0.5], { up: [0, 0.5, 0.866] });
  L(B(1.3, 0.04, 0.05, MAG, [0, C[1] - 0.2, C[2] + 0.55]), 1.5);

  // cable run
  b.sweep(
    catmull([
      [0.7, 2.9, 0.85],
      [0.9, 2.95, 0.3],
      [0.8, 2.6, -0.6],
      [0.6, 2.58, -1.3],
    ]),
    0.025,
    { color: DARK },
  );

  return b.root;
}
```