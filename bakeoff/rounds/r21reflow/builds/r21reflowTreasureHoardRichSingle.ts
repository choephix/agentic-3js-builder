// Treasure hoard: an open navy-and-gold chest heaped with coins, gems, a royal crown, two goblets, a pearl strand and a
// pendant chain. League of Legends read: chunky gold shapes, hard cel tones, saturated jewel accents that glow.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint, spots } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "An open navy chest with gold trim and a lion plate, spilling coins, glowing gems, a jewelled crown, goblets, pearls and a pendant.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type C = string | Paint;

const GOLD_FLAT = "#f9c02f";
const GOLD_DK = "#b8730f";
const RUBY = "#e0203c";
const SAPH = "#2457e6";
const EMER = "#1fbf5a";
const AMETH = "#9a45e0";

const FLEUR = `<path d="M32 6 C40 16 40 28 32 40 C24 28 24 16 32 6Z"/>
<path d="M28 38 C14 40 8 26 14 16 C14 28 22 30 27 31Z"/>
<path d="M36 38 C50 40 56 26 50 16 C50 28 42 30 37 31Z"/>
<rect x="22" y="40" width="20" height="5" rx="2"/>
<path d="M26 47 H38 L32 58Z"/>`;

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const place = (origin: THREE.Vector3, q: THREE.Quaternion) => (x: number, y: number, z: number) =>
    new THREE.Vector3(x, y, z).applyQuaternion(q).add(origin);
  const S = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---- textures
  const COIN = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#ffd84e" stroke="#b97a10" stroke-width="4"/>
<circle cx="32" cy="32" r="23" fill="#f3b72a" stroke="#c98a14" stroke-width="2.5"/>
<g transform="translate(16 14) scale(0.5)" fill="#9a5c08">${FLEUR}</g></svg>`,
    { size: 128 },
  );
  const FLEUR_TEX = svg(
    `<svg viewBox="0 0 64 64"><g fill="#f5b82e" stroke="#ffe27a" stroke-width="1.6" stroke-linejoin="round">${FLEUR}</g></svg>`,
    { size: 192 },
  );
  const spikePts = Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI) / 16;
    const r = i % 2 === 0 ? 47 : 38;
    return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
  }).join(" ");
  const LION = svg(
    `<svg viewBox="0 0 100 100">
<polygon points="${spikePts}" fill="#e8a519" stroke="#6b3d06" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="50" cy="50" r="35" fill="#f3b82a" stroke="#6b3d06" stroke-width="1.5"/>
<circle cx="29" cy="29" r="8" fill="#e8a519" stroke="#6b3d06" stroke-width="2"/>
<circle cx="71" cy="29" r="8" fill="#e8a519" stroke="#6b3d06" stroke-width="2"/>
<ellipse cx="50" cy="54" rx="24" ry="26" fill="#ffd35c" stroke="#6b3d06" stroke-width="2.5"/>
<path d="M32 42 Q40 38 47 44 M68 42 Q60 38 53 44" stroke="#6b3d06" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<ellipse cx="40" cy="48" rx="3.8" ry="2.8" fill="#3a1f04"/><ellipse cx="60" cy="48" rx="3.8" ry="2.8" fill="#3a1f04"/>
<ellipse cx="50" cy="64" rx="13" ry="9" fill="#ffe9a0" stroke="#6b3d06" stroke-width="1.5"/>
<path d="M43 58 L57 58 L50 66Z" fill="#5a2d05"/>
<path d="M50 66 L50 71 M50 71 Q44 76 38 72 M50 71 Q56 76 62 72" stroke="#5a2d05" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 256 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27Z" fill="#fffbe0"/></svg>`,
    { size: 128 },
  );

  // ---- paints
  const GOLDP = cel(mottle("#ffd447", "#f5b01f", { size: 0.07, seed: 3 }), "#b8700f");
  const woodGrain = grain("#2b4083", "#3552a0", { size: 0.012, axis: "x", seed: 2 });
  const NAVY = cel(
    paint((p) => {
      const k = p.y / 0.1;
      return k - Math.floor(k) < 0.05 ? "#18224b" : woodGrain;
    }),
    "#1b2a5c",
  );
  const lq = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), (-105 * Math.PI) / 180);
  const hinge = V(0, 0.4, -0.26);
  const lid = place(hinge, lq);
  const lidZ = V(0, 0, 1).applyQuaternion(lq);
  const LIDP = cel(
    paint((p) => {
      const k = p.dot(lidZ) / 0.1;
      return k - Math.floor(k) < 0.05 ? "#18224b" : woodGrain;
    }),
    "#1b2a5c",
  );
  const QUILT = cel(
    paint((p) => {
      const z = p.dot(lidZ);
      const a = (p.x + z) / 0.12;
      const c = (p.x - z) / 0.12;
      return Math.abs(a - Math.round(a)) < 0.04 || Math.abs(c - Math.round(c)) < 0.04 ? "#6a0a28" : "#a3153a";
    }),
    "#5a0a26",
  );
  const VEL = cel(mottle("#a3153a", "#8a0f30", { size: 0.03, seed: 5 }), "#5a0a26");

  // ---- merge bag for repeated small parts
  const bag = new Map<string, THREE.BufferGeometry[]>();
  const mg = (key: string, geo: THREE.BufferGeometry, pos: THREE.Vector3, q?: THREE.Quaternion) => {
    geo.applyMatrix4(new THREE.Matrix4().compose(pos, q ?? new THREE.Quaternion(), V(1, 1, 1)));
    const list = bag.get(key) ?? [];
    list.push(geo);
    bag.set(key, list);
  };
  const faces: THREE.BufferGeometry[] = [];
  const addCoin = (x: number, y: number, z: number, ex: number, ey: number, ez: number) => {
    const m = new THREE.Matrix4().compose(
      V(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(ex, ey, ez)),
      V(1, 1, 1),
    );
    const cyl = new THREE.CylinderGeometry(0.035, 0.035, 0.008, 10, 1).applyMatrix4(m);
    const key = R() < 0.5 ? "#ffc83d" : "#e9a528";
    const list = bag.get(key) ?? [];
    list.push(cyl);
    bag.set(key, list);
    faces.push(new THREE.CircleGeometry(0.029, 10).rotateX(-Math.PI / 2).translate(0, 0.0045, 0).applyMatrix4(m));
  };

  const bx = (w: number, h: number, d: number, c: C, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const lb = (g: THREE.BufferGeometry, c: C, x: number, y: number, z: number, q = lq) =>
    b.part(g, c, { at: lid(x, y, z), quat: q });
  const lbox = (w: number, h: number, d: number, c: C, x: number, y: number, z: number) =>
    lb(new THREE.BoxGeometry(w, h, d), c, x, y, z);

  // ---- heights of the heaps
  const topH = (x: number, z: number) =>
    Math.max(0.4, 0.4 + 0.075 * (1 - (x / 0.42) ** 2) * (1 - (z / 0.27) ** 2));
  const floorD = (x: number, z: number) =>
    Math.hypot(Math.max(0, Math.abs(x) - 0.42) / 0.55, Math.max(0, Math.abs(z) - 0.27) / 0.5);
  const floorH = (x: number, z: number) => 0.006 + 0.09 * Math.pow(Math.max(0, 1 - floorD(x, z)), 1.2);

  // ================= CHEST BODY
  bx(0.8, 0.4, 0.5, NAVY, 0, 0.2, 0);
  bx(0.78, 0.004, 0.48, "#3d2a12", 0, 0.402, 0);
  // top rim
  for (const z of [0.26, -0.26]) bx(0.86, 0.035, 0.035, GOLDP, 0, 0.4, z);
  for (const s of [1, -1]) bx(0.035, 0.035, 0.52, GOLDP, s * 0.415, 0.4, 0);
  // base band
  for (const z of [0.26, -0.26]) bx(0.86, 0.05, 0.03, GOLDP, 0, 0.03, z);
  for (const s of [1, -1]) bx(0.03, 0.05, 0.52, GOLDP, s * 0.415, 0.03, 0);
  // corner posts, caps, and straps
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      bx(0.05, 0.42, 0.05, GOLDP, sx * 0.41, 0.21, sz * 0.26);
      b.part(new THREE.ConeGeometry(0.04, 0.055, 4), GOLDP, { at: [sx * 0.41, 0.448, sz * 0.26], rotation: [0, 45, 0] });
      bx(0.07, 0.07, 0.07, GOLD_FLAT, sx * 0.41, 0.045, sz * 0.26);
      mg("#fff0a8", S(0.012, 6, 4), V(sx * 0.41, 0.3, sz * 0.288));
    }
  // rivet rows
  for (let i = 0; i <= 13; i++) {
    const x = -0.34 + i * 0.0523;
    for (const y of [0.35, 0.09]) mg(GOLD_FLAT, S(0.008, 6, 4), V(x, y, 0.253));
  }
  for (let i = 0; i <= 8; i++) {
    const z = -0.2 + i * 0.05;
    for (const s of [1, -1]) for (const y of [0.35, 0.09]) mg(GOLD_FLAT, S(0.008, 6, 4), V(s * 0.403, y, z));
  }
  // fleur decals (front + sides)
  for (const x of [-0.27, 0.27])
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [x, 0.2, 0.2515], dir: [0, 0, 1], axis: "z", texture: FLEUR_TEX });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [s * 0.4015, 0.2, 0.15], dir: [s, 0, 0], axis: "z", texture: FLEUR_TEX });
    b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", { at: [s * 0.4015, 0.2, -0.15], dir: [s, 0, 0], axis: "z", texture: FLEUR_TEX });
    // handle ring
    bx(0.03, 0.06, 0.09, GOLDP, s * 0.415, 0.24, 0);
    b.part(new THREE.TorusGeometry(0.065, 0.011, 6, 16), GOLDP, { at: [s * 0.43, 0.19, 0], dir: [s, 0, 0], axis: "z" });
  }
  // lion plate
  b.extrude(
    [
      [-0.075, 0.075],
      [0.075, 0.075],
      [0.082, -0.01],
      [0, -0.1, "sharp"],
      [-0.082, -0.01],
    ],
    { at: [0, 0.235, 0.253], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, smoothing: 1, color: GOLDP },
  );
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", { at: [0, 0.245, 0.2625], dir: [0, 0, 1], axis: "z", texture: LION });
  b.part(new THREE.TorusGeometry(0.028, 0.006, 6, 14), GOLD_FLAT, { at: [0, 0.145, 0.268], dir: [0, 0, 1], axis: "z" });
  for (const [x, y] of [
    [-0.07, 0.3],
    [0.07, 0.3],
    [-0.075, 0.22],
    [0.075, 0.22],
  ])
    mg("#fff0a8", S(0.007, 6, 4), V(x, y, 0.262));

  // ================= LID (open, hinged at the back)
  lbox(0.84, 0.04, 0.52, LIDP, 0, 0.02, 0.26);
  lbox(0.76, 0.012, 0.44, QUILT, 0, -0.004, 0.26);
  lbox(0.84, 0.032, 0.04, GOLDP, 0, -0.004, 0.5);
  lbox(0.84, 0.032, 0.04, GOLDP, 0, -0.004, 0.02);
  for (const s of [1, -1]) {
    lbox(0.04, 0.032, 0.52, GOLDP, s * 0.42, -0.004, 0.26);
    lbox(0.05, 0.014, 0.52, GOLDP, s * 0.41, 0.046, 0.26);
  }
  lbox(0.88, 0.014, 0.05, GOLDP, 0, 0.046, 0.495);
  lbox(0.88, 0.014, 0.05, GOLDP, 0, 0.046, 0.025);
  for (const z of [0.13, 0.39]) lbox(0.8, 0.014, 0.04, GOLDP, 0, 0.046, z);
  lb(new THREE.CylinderGeometry(0.085, 0.085, 0.016, 4), GOLDP, 0, 0.052, 0.26);
  lb(new THREE.CylinderGeometry(0.06, 0.06, 0.016, 4), "#1a2650", 0, 0.057, 0.26);
  glow(lb(new THREE.OctahedronGeometry(0.035, 0).scale(1, 0.7, 1), SAPH, 0, 0.075, 0.26), 0.5);
  const lqy = lq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 4));
  for (const s of [1, -1])
    for (const z of [0.03, 0.49]) lb(new THREE.ConeGeometry(0.035, 0.045, 4), GOLDP, s * 0.4, 0.07, z, lqy);
  for (const x of [-0.27, -0.09, 0.09, 0.27])
    for (const z of [0.12, 0.26, 0.4]) mg(GOLD_FLAT, S(0.011, 6, 4), lid(x, -0.012, z));
  for (const x of [-0.25, 0.25]) mg("#fff0a8", S(0.009, 6, 4), lid(x, 0.056, 0.26));

  // ================= GEMS
  const gemGeo = (r: number, h: number, seg: number) =>
    new THREE.LatheGeometry(
      [new THREE.Vector2(0.0001, 0), new THREE.Vector2(r, h * 0.5), new THREE.Vector2(r * 0.65, h), new THREE.Vector2(0.0001, h)],
      seg,
    );
  const addGem = (c: string, pos: THREE.Vector3, r: number, h: number, seg: number, rot: number[], str = 0.5) =>
    glow(b.part(gemGeo(r, h, seg), c, { at: pos, rotation: rot, flat: true }), str);

  type Gem = { x: number; z: number; c: string; r: number; h: number; seg: number; rot: number[] };
  const floorGems: Gem[] = [
    { x: 0.12, z: 0.5, c: RUBY, r: 0.058, h: 0.075, seg: 8, rot: [-55, 20, 15] },
    { x: -0.22, z: 0.52, c: EMER, r: 0.04, h: 0.05, seg: 6, rot: [60, 10, -20] },
    { x: -0.62, z: 0.4, c: AMETH, r: 0.04, h: 0.05, seg: 8, rot: [-65, 40, 25] },
    { x: 0.62, z: 0.2, c: EMER, r: 0.036, h: 0.045, seg: 4, rot: [55, 30, 10] },
    { x: 0.78, z: -0.1, c: AMETH, r: 0.035, h: 0.045, seg: 8, rot: [-50, 0, -30] },
    { x: 0.42, z: 0.58, c: SAPH, r: 0.032, h: 0.04, seg: 6, rot: [70, 15, 5] },
    { x: -0.74, z: 0.02, c: RUBY, r: 0.03, h: 0.04, seg: 8, rot: [-60, 5, 20] },
    { x: 0.0, z: 0.66, c: EMER, r: 0.03, h: 0.04, seg: 4, rot: [55, 45, 0] },
    { x: 0.52, z: -0.45, c: SAPH, r: 0.032, h: 0.04, seg: 6, rot: [65, 0, 10] },
    { x: -0.5, z: -0.5, c: EMER, r: 0.03, h: 0.04, seg: 6, rot: [-55, 20, 0] },
  ];
  for (const g of floorGems) addGem(g.c, V(g.x, floorH(g.x, g.z) + 0.012, g.z), g.r, g.h, g.seg, g.rot);
  const topGems: Gem[] = [
    { x: -0.17, z: 0.14, c: SAPH, r: 0.042, h: 0.055, seg: 8, rot: [-60, 20, 10] },
    { x: 0.17, z: 0.17, c: RUBY, r: 0.036, h: 0.05, seg: 8, rot: [55, 30, -10] },
    { x: -0.02, z: 0.2, c: EMER, r: 0.03, h: 0.04, seg: 4, rot: [-65, 0, 0] },
    { x: -0.36, z: 0.12, c: AMETH, r: 0.03, h: 0.04, seg: 6, rot: [60, 0, 20] },
    { x: 0.25, z: -0.1, c: AMETH, r: 0.03, h: 0.04, seg: 8, rot: [-60, 10, -15] },
    { x: -0.12, z: -0.12, c: RUBY, r: 0.032, h: 0.045, seg: 6, rot: [60, 25, 0] },
    { x: 0.05, z: -0.16, c: EMER, r: 0.028, h: 0.04, seg: 6, rot: [-55, 0, 10] },
  ];
  for (const g of topGems) addGem(g.c, V(g.x, topH(g.x, g.z) + 0.016, g.z), g.r, g.h, g.seg, g.rot);
  // sparkles on the big stones
  const sparkle = (x: number, y: number, z: number, s: number) =>
    glow(
      b.part(new THREE.PlaneGeometry(s, s), "#ffffff", { at: [x, y, z], dir: [0.4, 0.3, 1], axis: "z", texture: STAR }),
      1,
    );
  sparkle(0.14, floorH(0.12, 0.5) + 0.1, 0.55, 0.1);
  sparkle(-0.15, topH(-0.17, 0.14) + 0.08, 0.2, 0.08);
  sparkle(0.19, topH(0.17, 0.17) + 0.07, 0.22, 0.07);
  sparkle(-0.2, floorH(-0.22, 0.52) + 0.06, 0.56, 0.055);
  sparkle(-0.6, floorH(-0.62, 0.4) + 0.06, 0.45, 0.055);
  sparkle(0, 0.935, -0.3, 0.07);

  // ================= COINS
  for (let i = 0; i < 190; i++) {
    const x = (R() * 2 - 1) * 0.38;
    const z = (R() * 2 - 1) * 0.23;
    const ex = (R() - 0.5) * 0.9;
    const ez = (R() - 0.5) * 0.9;
    addCoin(x, topH(x, z) + 0.004 + 0.036 * Math.sin(Math.hypot(ex, ez)) + R() * 0.02, z, ex, R() * 6.28, ez);
  }
  let placed = 0;
  for (let tries = 0; tries < 4000 && placed < 300; tries++) {
    const x = (R() * 2 - 1) * 0.98;
    const z = (R() * 2 - 1) * 0.78;
    if (Math.abs(x) < 0.44 && Math.abs(z) < 0.28) continue;
    const d = floorD(x, z);
    if (d > 1 || R() > Math.pow(1 - d, 0.6)) continue;
    const tl = 0.15 + 0.45 * (1 - d);
    const ex = (R() - 0.5) * 2 * tl;
    const ez = (R() - 0.5) * 2 * tl;
    addCoin(x, floorH(x, z) + 0.004 + 0.036 * Math.sin(Math.hypot(ex, ez)) + R() * 0.012, z, ex, R() * 6.28, ez);
    placed++;
  }
  for (const [sx, sz, n] of [
    [0.55, 0.4, 9],
    [0.72, 0.1, 6],
    [-0.3, 0.44, 8],
    [-0.6, 0.25, 5],
    [-0.66, -0.12, 9],
    [0.32, 0.47, 5],
  ])
    for (let k = 0; k < n; k++)
      addCoin(sx + (R() - 0.5) * 0.004, floorH(sx, sz) + 0.004 + k * 0.0082, sz + (R() - 0.5) * 0.004, 0, R() * 6.28, 0);

  // ================= CROWN
  const crQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.05, 0.15, 0.1));
  const cr = place(V(0.04, topH(0.04, 0.02) - 0.02, 0.02), crQ);
  const crAxis = V(0, 1, 0).applyQuaternion(crQ);
  const cpart = (g: THREE.BufferGeometry, c: C, x: number, y: number, z: number, scale?: number[]) =>
    b.part(g, c, { at: cr(x, y, z), quat: crQ, ...(scale ? { scale } : {}) });
  const ring = (r0: number, r1: number, y0: number, y1: number): Array<[number, number]> => [
    [r0, y0],
    [r1, y0],
    [r1, y1],
    [r0, y1],
  ];
  b.lathe(ring(0.097, 0.108, 0, 0.03), {
    at: cr(0, 0, 0),
    axis: crAxis,
    segments: 16,
    color: spots("#f7f3ea", "#2a2530", { size: 0.03, amount: 0.35, seed: 2 }),
  });
  b.lathe(ring(0.096, 0.104, 0.03, 0.075), { at: cr(0, 0, 0), axis: crAxis, segments: 16, color: GOLDP });
  cpart(new THREE.SphereGeometry(0.099, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), VEL, 0, 0.05, 0, [1, 0.85, 1]);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const x = 0.1 * Math.sin(a);
    const z = 0.1 * Math.cos(a);
    const tall = k % 2 === 0;
    const len = tall ? 0.065 : 0.04;
    b.spike(cr(x, 0.07, z), crAxis, len, 0.014, { color: GOLD_FLAT, sides: 6 });
    glow(cpart(S(0.009, 6, 4), tall ? RUBY : SAPH, x, 0.07 + len + 0.004, z), 0.5);
    const a2 = a + Math.PI / 8;
    glow(cpart(S(0.008, 6, 4), k % 2 ? RUBY : SAPH, 0.106 * Math.sin(a2), 0.052, 0.106 * Math.cos(a2)), 0.5);
  }
  for (const phi of [0, 1]) {
    const pts = [-1, -0.5, 0, 0.5, 1].map((s) => {
      const y = 0.075 + 0.105 * (1 - s * s);
      const a = 0.098 * s;
      return phi ? cr(0, y, a) : cr(a, y, 0);
    });
    b.sweep(catmull(pts), 0.006, { color: GOLD_FLAT, sides: 6 });
  }
  cpart(S(0.013, 8, 6), GOLD_FLAT, 0, 0.19, 0);
  cpart(new THREE.BoxGeometry(0.01, 0.045, 0.01), GOLD_FLAT, 0, 0.222, 0);
  cpart(new THREE.BoxGeometry(0.034, 0.01, 0.01), GOLD_FLAT, 0, 0.232, 0);
  glow(cpart(S(0.007, 6, 4), SAPH, 0, 0.24, 0), 0.5);
  glow(cpart(new THREE.SphereGeometry(1, 10, 8), RUBY, 0, 0.052, 0.106, [0.026, 0.034, 0.011]), 0.55);
  cpart(new THREE.TorusGeometry(1, 0.12, 5, 14), GOLD_FLAT, 0, 0.052, 0.106, [0.03, 0.039, 0.03]);

  // ================= GOBLETS
  const GOB: Array<[number, number]> = [
    [0, 0],
    [0.045, 0],
    [0.046, 0.008],
    [0.03, 0.02],
    [0.012, 0.035],
    [0.012, 0.07],
    [0.022, 0.08],
    [0.022, 0.09],
    [0.012, 0.1],
    [0.03, 0.11],
    [0.05, 0.15],
    [0.052, 0.19],
    [0.047, 0.19],
    [0.045, 0.15],
    [0.028, 0.115],
    [0, 0.112],
  ];
  const goblet = (o: THREE.Vector3, q: THREE.Quaternion) => {
    const g = place(o, q);
    const ax = V(0, 1, 0).applyQuaternion(q);
    b.lathe(GOB, { at: o, axis: ax, segments: 12, color: GOLDP });
    const tor = (r: number, y: number, t: number, c: string) =>
      b.part(new THREE.TorusGeometry(r, t, 5, 14), c, { at: g(0, y, 0), dir: ax, axis: "z" });
    tor(0.0497, 0.19, 0.004, GOLD_FLAT);
    tor(0.0508, 0.165, 0.003, GOLD_FLAT);
    tor(0.04, 0.13, 0.003, GOLD_DK);
    tor(0.046, 0.009, 0.004, GOLD_FLAT);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      glow(b.part(S(0.006, 6, 4), RUBY, { at: g(0.023 * Math.cos(a), 0.085, 0.023 * Math.sin(a)) }), 0.45);
      const a2 = a + Math.PI / 6;
      glow(
        b.part(S(0.008, 6, 4), k % 2 ? SAPH : RUBY, { at: g(0.0505 * Math.cos(a2), 0.15, 0.0505 * Math.sin(a2)) }),
        0.45,
      );
    }
  };
  goblet(V(-0.27, topH(-0.27, 0) - 0.006, 0), new THREE.Quaternion());
  goblet(V(0.5, 0.37, 0.08), aim(V(-0.9, 0.38, 0.15).normalize()));

  // ================= PEARLS AND PENDANT
  b.along(
    catmull([
      [-0.15, 0.42, 0.28],
      [-0.15, 0.34, 0.272],
      [-0.15, 0.22, 0.272],
      [-0.14, 0.1, 0.274],
      [-0.13, 0.04, 0.28],
    ]),
    14,
    (at) => b.part(S(0.012, 8, 6), "#f4f1ea", { at }),
  );
  b.along(
    catmull([
      [0.12, 0.42, 0.28],
      [0.14, 0.32, 0.271],
      [0.18, 0.23, 0.271],
      [0.2, 0.2, 0.272],
      [0.22, 0.23, 0.271],
      [0.26, 0.32, 0.271],
      [0.28, 0.42, 0.28],
    ]),
    24,
    (at) => b.part(S(0.007, 6, 4), GOLD_FLAT, { at }),
  );
  b.part(new THREE.TorusGeometry(1, 0.12, 5, 14), GOLD_FLAT, { at: [0.2, 0.165, 0.276], scale: [0.016, 0.026, 0.016] });
  glow(b.part(new THREE.SphereGeometry(1, 10, 8), SAPH, { at: [0.2, 0.165, 0.276], scale: [0.012, 0.021, 0.008] }), 0.55);

  // ---- flush merged parts
  for (const [key, list] of bag) b.part(mergeGeometries(list)!, key, { at: [0, 0, 0], bone: root });
  b.part(mergeGeometries(faces)!, "#ffffff", { at: [0, 0, 0], bone: root, texture: COIN });

  return b.root;
}
