import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep, spots } from "../src/paint";
import { svg } from "../src/texture";
import { cel, furEdge, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Giant Pacific Octopus",
  description:
    "A sprawled giant Pacific octopus draped over a mossy tide-pool rock, eight arms spread and curling, in cel-shaded anime colours with hydro-blue glowing veins, gold filigree, armbands and tassels.",
  style: "Genshin/anime mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#ea4a3e";
const RED_DEEP = "#bd2c48";
const PAPILLA = "#ff9068";
const SPECKLE = "#ffe3d2";
const TIP_PINK = "#ff5f93";
const BELLY = "#ffd2c2";
const BELLY_TIP = "#ff9db0";
const LINE = "#6e1a3e";
const GOLD = "#ffcf48";
const GOLD_DK = "#b8791a";
const CYAN = "#4fe6ff";
const CYAN_LT = "#b6fbff";
const SUCKER = "#ffe9df";
const BEAK = "#3a2233";
const BARNACLE = "#f1e8d4";
const PEBBLE = "#b4b3d2";
const CRYSTAL = "#3fd8ff";
const SAND_LIGHT = "#f6dfaa";
const SAND_DARK = "#e6c27f";
const SAND_TOP = 0.045;

const DORSAL = paint((p, _n, s) => {
  const deep = noise(p, 0.22, 3);
  let c = mix(RED, RED_DEEP, smoothstep(0.45, 0.8, deep) * 0.8);
  c = mix(c, TIP_PINK, smoothstep(0.55, 1.0, s[0]) * 0.55);
  const cell = cells(p, 0.05, 11);
  if (cell.d1 < 0.2) c = mix(c, PAPILLA, 0.65);
  else if (cell.id > 0.93 && cell.d1 < 0.4) c = mix(c, SPECKLE, 0.8);
  return c;
});
const SKIN = cel(DORSAL);

const BODY_PAINT = cel(
  furEdge(DORSAL, paint((p) => mix(BELLY, BELLY_TIP, smoothstep(0.1, 0.5, noise(p, 0.3, 4)) * 0.4)), {
    axis: [0, 1, 0],
    level: -0.55,
    teeth: 0.16,
    period: 0.04,
    ink: LINE,
    inkWidth: 0.05,
  }),
);

const armPaint = (len: number) =>
  cel(
    paint((_p, _n, s) => {
      const t = s[0];
      const a = ((s[1] % 360) + 360) % 360;
      const d = Math.abs(a - 180);
      const edge = 60 + 12 * zigzag((t * len) / 0.05);
      if (d < edge - 3.5) return mix(BELLY, BELLY_TIP, smoothstep(0.35, 1, t) * 0.8);
      if (d < edge) return LINE;
      return DORSAL;
    }),
  );

const ROCK_A = "#9aa6d2";
const ROCK_B = "#7c86bb";
const ROCK_C = "#aab7dc";
const CRACK = "#464a7c";
const MOSS = "#6fd9a6";
const MOSS_DK = "#3aa88a";
const ROCK_PAINT = cel(
  paint((p, n) => {
    const c = cells(p, 0.24, 4);
    if (c.d2 - c.d1 < 0.016) return CRACK;
    let base = mix(mix(ROCK_A, ROCK_B, c.id), ROCK_C, noise(p, 0.35, 2) * 0.5);
    const m = noise(p, 0.18, 9);
    if (n.y > 0.55 && m > 0.6) base = mix(MOSS, MOSS_DK, noise(p, 0.07, 5));
    else if (p.y < 0.1 && m > 0.52) base = mix(base, MOSS_DK, 0.55);
    return base;
  }),
);
const SAND_PAINT = cel(
  paint((p) => {
    const w = Math.sin((p.x * 0.9 + p.z * 1.7) * 16 + noise(p, 0.5, 6) * 7);
    if (Math.abs(w) > 0.93) return SAND_DARK;
    return mix(SAND_LIGHT, SAND_DARK, noise(p, 0.3, 8) * 0.5);
  }),
);

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c2561a"/><stop offset="0.45" stop-color="#ffa72e"/><stop offset="1" stop-color="#fff2a0"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="#2a1230"/>
  <circle cx="50" cy="50" r="42" fill="url(#iris)"/>
  <path d="M14 62 Q50 96 86 62 Q76 82 50 86 Q24 82 14 62Z" fill="#7ff3ff" opacity="0.65"/>
  <path d="M8 40 Q50 -2 92 40 Q50 22 8 40Z" fill="#2a1230"/>
  <rect x="17" y="43" width="66" height="15" rx="7.5" fill="#2a1230"/>
  <ellipse cx="33" cy="33" rx="11" ry="9" fill="#ffffff"/>
  <circle cx="68" cy="66" r="5.5" fill="#ffffff"/>
  <path d="M46 70 l3 -7 l3 7 l-3 7z" fill="#ffffff" opacity="0.9"/>
</svg>`,
  { size: 256 },
);

const BLUSH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
  <ellipse cx="50" cy="30" rx="46" ry="26" fill="#ff7aa6" opacity="0.85"/>
  <path d="M28 20 L22 42 M46 16 L40 44 M64 20 L58 42" stroke="#ff4f8a" stroke-width="4" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 128 },
);

const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 160">
  <defs>
    <g id="half" fill="none" stroke="#ffd45a" stroke-width="2.6" stroke-linecap="round">
      <path d="M50 152 C30 134 16 122 22 102 C27 86 44 88 40 72 C36 58 20 62 18 46 C16 32 30 20 50 8"/>
      <path d="M22 102 c-10 -5 -15 6 -8 11 c6 3 11 -3 6 -6"/>
      <path d="M18 46 c-9 -4 -13 7 -6 10 c6 2 9 -3 5 -5"/>
      <path d="M40 72 c8 -2 12 -10 8 -16"/>
      <path d="M44 120 C34 112 32 104 36 98"/>
      <path d="M50 150 C42 144 38 138 36 130"/>
      <path d="M30 20 c-6 -3 -10 2 -8 6"/>
      <path d="M46 36 c-8 2 -10 8 -8 14"/>
      <path d="M33 92 C40 98 44 96 46 92"/>
      <path d="M46 62 C50 66 50 70 47 72"/>
      <circle cx="12" cy="76" r="2.4" fill="#ffd45a" stroke="none"/>
      <circle cx="30" cy="130" r="2.4" fill="#ffd45a" stroke="none"/>
      <circle cx="26" cy="36" r="2.4" fill="#ffd45a" stroke="none"/>
      <circle cx="12" cy="30" r="2.4" fill="#ffd45a" stroke="none"/>
      <path d="M28 122 q-12 -2 -15 -14 q12 1 15 14z" fill="#ffd45a" stroke="#b8791a" stroke-width="1.4"/>
      <path d="M34 66 q-10 -6 -9 -18 q11 5 9 18z" fill="#ffd45a" stroke="#b8791a" stroke-width="1.4"/>
    </g>
  </defs>
  <use xlink:href="#half"/>
  <use xlink:href="#half" transform="translate(100,0) scale(-1,1)"/>
  <path d="M50 54 L60 80 L50 106 L40 80Z" fill="#7ff3ff" stroke="#ffd45a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 62 L54 80 L50 98 L46 80Z" fill="#e8ffff"/>
  <circle cx="50" cy="44" r="4" fill="#ffd45a"/><circle cx="50" cy="118" r="4" fill="#ffd45a"/>
  <circle cx="50" cy="132" r="2.6" fill="#ffd45a"/>
</svg>`,
  { size: 512 },
);

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 130">
  <path d="M8 4 L32 4 L36 92 L4 92Z" fill="#ffd45a" stroke="#b8791a" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M12 4 L12 92 M20 4 L20 92 M28 4 L28 92" stroke="#e0a52d" stroke-width="2"/>
  <path d="M5 40 L35 40" stroke="#ff5f93" stroke-width="5"/>
  <rect x="11" y="92" width="18" height="8" rx="4" fill="#ffe98a" stroke="#b8791a" stroke-width="1.6"/>
  <rect x="17" y="100" width="6" height="14" fill="#ffd45a" stroke="#b8791a" stroke-width="1.4"/>
  <circle cx="20" cy="119" r="9" fill="#ffd45a" stroke="#b8791a" stroke-width="1.8"/>
  <circle cx="17" cy="116" r="2.6" fill="#fff6c0"/>
</svg>`,
  { size: 192 },
);

const KELP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120">
  <defs><linearGradient id="k" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#1f8f86"/><stop offset="0.6" stop-color="#3fd0a4"/><stop offset="1" stop-color="#9af0b8"/>
  </linearGradient></defs>
  <path d="M16 118 C6 96 28 88 18 66 C8 44 30 34 22 12 C21 6 22 2 24 0 C30 10 36 26 30 42 C24 60 36 72 30 90 C26 102 24 112 24 118Z" fill="url(#k)" stroke="#16716e" stroke-width="2"/>
  <path d="M20 114 C14 92 30 84 22 64 C14 44 28 32 24 8" stroke="#c8ffe0" stroke-width="2" fill="none" opacity="0.8"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Rock

type Lump = { x: number; z: number; y: number; rx: number; ry: number; rz: number; seed: number };
const LUMPS: Lump[] = [
  { x: 0, z: 0, y: 0, rx: 0.96, ry: 0.3, rz: 0.88, seed: 3 },
  { x: 0.5, z: -0.12, y: 0.06, rx: 0.46, ry: 0.2, rz: 0.42, seed: 5 },
  { x: -0.46, z: -0.18, y: 0.06, rx: 0.5, ry: 0.22, rz: 0.42, seed: 8 },
  { x: 0.06, z: -0.52, y: 0.08, rx: 0.5, ry: 0.22, rz: 0.4, seed: 12 },
  { x: 0.1, z: 0.7, y: 0, rx: 0.46, ry: 0.12, rz: 0.32, seed: 14 },
  { x: 1.05, z: 0.3, y: 0, rx: 0.3, ry: 0.15, rz: 0.27, seed: 21 },
  { x: -1.02, z: 0.22, y: 0, rx: 0.32, ry: 0.17, rz: 0.28, seed: 22 },
  { x: 0.9, z: -0.62, y: 0, rx: 0.32, ry: 0.15, rz: 0.28, seed: 23 },
  { x: -0.82, z: -0.66, y: 0, rx: 0.3, ry: 0.18, rz: 0.27, seed: 24 },
  { x: 0.05, z: -1.05, y: 0, rx: 0.46, ry: 0.2, rz: 0.32, seed: 25 },
  { x: -0.55, z: 0.92, y: 0, rx: 0.22, ry: 0.09, rz: 0.18, seed: 26 },
];

function lumpGeometry(l: Lump) {
  const g = new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = g.getAttribute("position");
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 0.84 + 0.32 * noise(v.clone().multiplyScalar(1.7).add(new THREE.Vector3(l.seed, 0, 0)), 0.9, l.seed);
    const flare = 1 + 0.1 * (1 - v.y) * (1 - v.y);
    const horizontal = v.y > 0.999 ? 1 : k * flare;
    v.set(v.x * horizontal * l.rx, v.y * (v.y > 0.999 ? 1 : 0.9 + 0.2 * k) * l.ry, v.z * horizontal * l.rz);
    pos.setXYZ(i, v.x + l.x, v.y + l.y, v.z + l.z);
  }
  g.computeVertexNormals();
  return g;
}

const rockMeshes = LUMPS.map((l) => new THREE.Mesh(lumpGeometry(l), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })));
const caster = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
function rockTop(x: number, z: number) {
  caster.set(new THREE.Vector3(x, 3, z), DOWN);
  const hit = caster.intersectObjects(rockMeshes, false)[0];
  return hit ? hit.point.y : 0;
}
/** Height an arm centre line must clear: the highest rock under a 6 cm neighbourhood, never below the sand. */
function ground(x: number, z: number) {
  let top = rockTop(x, z);
  for (const [dx, dz] of [
    [0.06, 0],
    [-0.06, 0],
    [0, 0.06],
    [0, -0.06],
  ])
    top = Math.max(top, rockTop(x + dx, z + dz));
  return Math.max(SAND_TOP, top);
}

// ---------------------------------------------------------------------------------------------------------------
// Arms

const armRx = (t: number) => 0.014 + 0.098 * Math.pow(1 - t, 0.95);
const armRy = (t: number) => armRx(t) * 0.82;

type ArmSpec = { side: 1 | -1; n: number; az: number; len: number; wob: number; ph: number; curl: number; lift: number };
const ARMS: ArmSpec[] = [
  { side: 1, n: 1, az: 22, len: 1.55, wob: 0.55, ph: 0.1, curl: 2.6, lift: 0.25 },
  { side: 1, n: 2, az: 64, len: 1.7, wob: 0.6, ph: 0.5, curl: -2.4, lift: 0 },
  { side: 1, n: 3, az: 106, len: 1.75, wob: 0.55, ph: 0.8, curl: 3.0, lift: 0.16 },
  { side: 1, n: 4, az: 150, len: 1.5, wob: 0.5, ph: 0.3, curl: -2.4, lift: 0.32 },
  { side: -1, n: 1, az: -26, len: 1.6, wob: 0.55, ph: 0.6, curl: -2.8, lift: 0 },
  { side: -1, n: 2, az: -66, len: 1.65, wob: 0.6, ph: 0.2, curl: 2.6, lift: 0.22 },
  { side: -1, n: 3, az: -110, len: 1.8, wob: 0.55, ph: 0.95, curl: -2.4, lift: 0.28 },
  { side: -1, n: 4, az: -152, len: 1.45, wob: 0.5, ph: 0.55, curl: 2.5, lift: 0 },
];

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function armPoints(sp: ArmSpec) {
  const N = 15;
  const az = (sp.az * Math.PI) / 180;
  const ringR = 0.19;
  let x = Math.sin(az) * ringR;
  let z = 0.1 + Math.cos(az) * ringR;
  const pts: THREE.Vector3[] = [];
  const ds = sp.len / (N - 1);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const lift = sp.lift * Math.pow(smoothstep(0.6, 1, u), 1.6);
    pts.push(V(x, ground(x, z) + armRy(u) * 0.9 + lift, z));
    const theta =
      az + sp.wob * Math.sin(2 * Math.PI * (1.25 * u + sp.ph)) + sp.curl * Math.pow(smoothstep(0.5, 1, u), 1.2);
    x += Math.sin(theta) * ds;
    z += Math.cos(theta) * ds;
  }
  return pts;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "giantPacificOctopus" });
  const rand = rng(77);
  const armPts = ARMS.map(armPoints);

  // Body landmarks, from the rock under the octopus.
  const gHead = Math.max(ground(0, 0.12), ground(0, -0.1));
  const hy = gHead + 0.2;
  const H = V(0, hy, 0.06);
  const tip = V(0, ground(0, -0.78) + 0.14, -0.78);
  const m2 = V(0, ground(0, -0.55) + 0.23, -0.55);
  const m3 = V(0, Math.max(hy + 0.03, ground(0, -0.34) + 0.24), -0.34);
  const neck = V(0, hy + 0.03, -0.13);
  const crown = V(0, hy - 0.1, 0.25);
  const bodyPath = catmull([tip, m2, m3, neck, H, crown]);
  const tNeck = bodyPath.closestT(neck);
  const tM3 = bodyPath.closestT(m3);
  const tH = bodyPath.closestT(H);

  const core = b.joint("body", { at: H, role: "spine" });
  const rootT = bodyPath.closestT(H);
  const head = b.chain("headBone", bodyPath.slice(rootT, 1), { parent: core, count: 1, names: ["head"], role: "head" });
  const mantle = b.chain("mantle", bodyPath.slice(rootT, 0), { parent: core, count: 3, role: "spine" });
  const headJoint = head.joints[0];

  // Rock and sand
  const sand = b.lathe(
    [
      [0, 0],
      [1.72, 0],
      [1.78, 0.02],
      [1.74, SAND_TOP],
      [0, SAND_TOP],
    ],
    { at: [0, 0, 0], segments: 30, color: SAND_PAINT, bone: core, name: "sand" },
  );
  const rockParts = LUMPS.map((l, i) =>
    b.part(lumpGeometry(l), ROCK_PAINT, { bone: core, at: [0, 0, 0], flat: true, name: `rock${i}` }),
  );
  const rockSkin = b.surface(rockParts);

  // Barnacles, merged into one part
  {
    const hits = rockSkin.scatter(70, {
      rng: rng(31),
      minDist: 0.13,
      filter: (h) => h.n.y > 0.15 && h.at.y < 0.42 && h.at.y > 0.05 && Math.hypot(h.at.x, h.at.z - 0.1) > 0.35,
    });
    const geos = hits.map((h) => {
      const s = 0.7 + rand() * 0.8;
      const cone = new THREE.ConeGeometry(0.028 * s, 0.04 * s, 6, 1, true);
      const m = new THREE.Matrix4().compose(h.at.clone().addScaledVector(h.n, -0.008), aim(h.n), V(1, 1, 1));
      return cone.applyMatrix4(m);
    });
    if (geos.length) b.part(mergeGeometries(geos), BARNACLE, { bone: core, at: [0, 0, 0], flat: true, name: "barnacles" });
  }

  // Pebbles on the sand, merged
  {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.95 + rand() * 0.7;
      const s = 0.018 + rand() * 0.035;
      const g = new THREE.IcosahedronGeometry(s, 0);
      g.scale(1, 0.6, 1);
      g.rotateY(rand() * 3);
      g.translate(Math.sin(a) * r, SAND_TOP + s * 0.2, Math.cos(a) * r);
      geos.push(g);
    }
    b.part(mergeGeometries(geos), PEBBLE, { bone: core, at: [0, 0, 0], flat: true, name: "pebbles" });
  }

  // Hydro crystals growing on the rear boulders
  for (const [cx, cz, lx, lz, len, r] of [
    [-0.78, -0.62, -0.25, -0.1, 0.3, 0.032],
    [-0.7, -0.55, 0.15, 0.2, 0.2, 0.026],
    [-0.84, -0.54, -0.5, 0.35, 0.16, 0.022],
    [-0.62, -0.66, 0.3, -0.35, 0.14, 0.02],
    [0.9, -0.62, 0.2, -0.2, 0.22, 0.026],
    [0.8, -0.66, -0.3, 0.1, 0.15, 0.02],
  ]) {
    const hit = rockSkin.ray([cx, 3, cz], [0, -1, 0]);
    if (!hit) continue;
    const dir: [number, number, number] = [lx + hit.n.x, hit.n.y * 2, lz + hit.n.z];
    glow(
      b.spike(hit.moved([0, -0.02, 0]), dir, len, r, {
        color: CRYSTAL,
        section: { ngon: 6 },
        caps: { start: "flat", end: "point" },
        bone: core,
      }),
      1.2,
    );
  }

  // Kelp behind the rock
  {
    const spots3: [number, number][] = [
      [0.55, -1.12],
      [0.68, -1.04],
      [-0.2, -1.22],
      [0.28, -1.26],
      [-0.45, -1.12],
      [1.2, -0.55],
      [-1.2, -0.3],
      [1.22, -0.48],
    ];
    const fr = spots3.flatMap(([x, z]) =>
      [0, 1, 2, 3].map(() => frame([x + (rand() - 0.5) * 0.14, SAND_TOP, z + (rand() - 0.5) * 0.14], [0, 1, 0])),
    );
    b.cards(fr, KELP, { size: [0.13, 0.42], lean: 10, bend: 28, vary: 0.35, spin: 180, rng: rng(5), bone: core });
  }

  // Sand details placed where no arm lies
  const freeSpots = (
    [
      [-1.28, 0.88],
      [1.15, 1.12],
      [0.2, 1.45],
      [-1.5, -0.25],
      [1.5, -0.1],
      [-1.1, -1.1],
      [1.1, -1.15],
      [-0.55, 1.35],
      [0.85, 1.45],
      [-1.55, 0.4],
      [1.45, 0.6],
      [-0.9, -1.4],
      [0.6, 1.1],
      [-0.6, 1.05],
    ] as [number, number][]
  ).filter(([x, z]) => rockTop(x, z) < 0.02 && armPts.every((a) => a.every((p) => Math.hypot(p.x - x, p.z - z) > 0.3)));

  // Starfish
  freeSpots.slice(0, 2).forEach(([sx, sz], col) => {
    const out: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      const r = i % 2 ? 0.038 : 0.115;
      out.push([Math.sin(a) * r, Math.cos(a) * r]);
    }
    const ang = 0.6 + col * 1.5;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    b.extrude(out, {
      at: [sx, SAND_TOP + 0.012, sz],
      x: [ca, 0, sa],
      y: [-sa, 0, ca],
      thickness: 0.024,
      bevel: 0.008,
      smoothing: 1,
      color: cel(spots(col ? "#ff6f8a" : "#ff9448", col ? "#ffd1a8" : "#ffe0a3", { size: 0.026, amount: 0.3, seed: 2 + col })),
      bone: core,
      name: `starfish${col}`,
    });
  });

  // Scallop shells, each holding a glowing pearl
  freeSpots.slice(2, 4).forEach(([sx, sz], k) => {
    const out: [number, number][] = [[0, 0]];
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI * (0.9 - (0.8 * i) / 8)) as number;
      const r = i % 2 ? 0.105 : 0.115;
      out.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    const ang = 1.2 + k * 2.3;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    b.extrude(out, {
      at: [sx, SAND_TOP + 0.016, sz],
      x: [ca, 0, sa],
      y: [-sa, 0.0, ca],
      thickness: 0.026,
      bevel: 0.01,
      smoothing: 1,
      color: cel(
        paint((_p, _n, s) => {
          const a = Math.atan2(s[1], s[0]);
          const rib = Math.sin(a * 24) > 0;
          return mix(rib ? "#ffd7e6" : "#ffb3cf", "#ff8fb8", smoothstep(0.03, 0.12, Math.hypot(s[0], s[1])) * 0.6);
        }),
      ),
      bone: core,
      name: `scallop${k}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.024, 8, 6), "#e8ffff", {
        at: [sx + ca * 0.0 - sa * 0.05, SAND_TOP + 0.04, sz + sa * 0.0 + ca * 0.05],
        bone: core,
        name: `pearl${k}`,
      }),
      1.1,
    );
  });

  // Hydro ring glowing on the sand around the rock
  {
    const ticks = Array.from({ length: 36 }, (_, i) => {
      const a = (i * Math.PI * 2) / 36;
      const r0 = i % 3 === 0 ? 76 : 80;
      return `<line x1="${100 + Math.sin(a) * r0}" y1="${100 + Math.cos(a) * r0}" x2="${100 + Math.sin(a) * 86}" y2="${100 + Math.cos(a) * 86}" stroke="#8ff3ff" stroke-width="${i % 3 === 0 ? 2.2 : 1.4}"/>`;
    }).join("");
    const drops = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3 + 0.5;
      const cx = 100 + Math.sin(a) * 70;
      const cy = 100 + Math.cos(a) * 70;
      return `<path d="M${cx} ${cy - 5} Q${cx + 4.5} ${cy + 1} ${cx} ${cy + 4.5} Q${cx - 4.5} ${cy + 1} ${cx} ${cy - 5}Z" fill="#8ff3ff"/>`;
    }).join("");
    const RING = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="95" fill="none" stroke="#8ff3ff" stroke-width="2.6"/>
      <circle cx="100" cy="100" r="88" fill="none" stroke="#8ff3ff" stroke-width="1.4"/>
      <circle cx="100" cy="100" r="64" fill="none" stroke="#8ff3ff" stroke-width="1.6" stroke-dasharray="7 5"/>
      ${ticks}${drops}
    </svg>`,
      { size: 1024 },
    );
    glow(b.decal(sand, RING, { at: [0, SAND_TOP, 0], dir: [0, 1, 0], up: [0, 0, -1], size: [3.3, 3.3], segments: 20, lift: 0.002, bone: core }), 0.55);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Body
  const profile = (t: number): [number, number] => {
    const k: [number, number][] = [
      [0, 0.1],
      [tM3, 0.235],
      [tNeck, 0.17],
      [tH, 0.225],
      [1, 0.15],
    ];
    let r = k[k.length - 1][1];
    for (let i = 1; i < k.length; i++)
      if (t <= k[i][0]) {
        const u = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        r = k[i - 1][1] + (k[i][1] - k[i - 1][1]) * u * u * (3 - 2 * u);
        break;
      }
    return [r, r * (t < tNeck ? 0.9 : 1)];
  };
  const body = b.sweep(bodyPath, profile, { bone: [mantle, core, head], color: BODY_PAINT, sides: 12, name: "bodySkin" });
  const skin = b.surface(body);

  // Eyes
  const Hc = V(0, hy, 0.06);
  for (const s of [1, -1]) {
    const hit = skin.around(Hc).at(s * 54, 22);
    if (!hit) continue;
    const ball = b.part(new THREE.SphereGeometry(0.076, 10, 8), "#ffb938", {
      frame: hit.moved([0, -0.024, 0]),
      bone: headJoint,
      scale: [1, 0.85, 1],
      name: s > 0 ? "eyeballL" : "eyeballR",
    });
    b.decal(ball, EYE, { at: hit.moved([0, 0.04, 0]), dir: hit.n, size: [0.122, 0.122], bone: headJoint });
    const lid = new THREE.TorusGeometry(0.079, 0.016, 5, 14);
    lid.rotateX(Math.PI / 2);
    b.stick(lid, SKIN, hit.moved([0, -0.006, 0]), { embed: 0.3, bone: headJoint, name: s > 0 ? "lidL" : "lidR" });
    b.ring(hit, { count: 3, radius: 0.088, fromDeg: -45, toDeg: 45 }, (lash) =>
      b.spike(lash, lash, 0.032, 0.0045, { color: INK, bone: headJoint }),
    );
    const blush = skin.around(Hc).at(s * 62, -14);
    if (blush) b.decal(skin, BLUSH, { at: blush, dir: blush.n, size: [0.085, 0.05], up: [0, 1, 0], bone: headJoint });
    b.joint(s > 0 ? "eyeL" : "eyeR", { parent: headJoint, at: hit.moved([0, -0.01, 0]), dir: hit.n });
  }

  // Forehead circlet: gold ring and a glowing gem
  {
    const top = skin.around(Hc).at(0, 80);
    if (top) {
      const ring = new THREE.TorusGeometry(0.03, 0.007, 5, 12);
      ring.rotateX(Math.PI / 2);
      b.stick(ring, GOLD, top, { embed: 0.2, bone: headJoint, name: "circlet" });
      glow(b.stick(new THREE.OctahedronGeometry(0.02, 0), CYAN, top.moved([0, 0.008, 0]), { embed: 0.2, bone: headJoint, name: "foreheadGem" }), 1.4);
    }
  }

  // Funnel
  {
    const f = skin.around(Hc).at(-104, -8);
    if (f)
      b.sprout("funnel", f, V(f.at.x - 0.07, f.at.y - 0.05, f.at.z + 0.09), [0.034, 0.024], {
        count: 1,
        color: BODY_PAINT,
        caps: { end: "flat" },
      });
  }

  // Beak: separate upper and lower jaw between the arm bases
  const jaw = b.joint("jaw", { parent: headJoint, at: V(0, gHead + 0.08, 0.17), aim: V(0, gHead + 0.05, 0.25), role: "jaw" });
  b.spike(V(0, gHead + 0.1, 0.14), V(0, gHead + 0.035, 0.24), null, 0.034, { color: BEAK, bone: headJoint, name: "beakUpper" });
  b.spike(V(0, gHead + 0.07, 0.15), V(0, gHead + 0.02, 0.235), null, 0.026, { color: BEAK, bone: jaw, name: "beakLower" });

  // Dorsal gold filigree on the mantle
  {
    const top = skin.ray([0, 3, -0.3], [0, -1, 0]);
    if (top) b.decal(body, FILIGREE, { at: top, dir: [0, 1, 0], up: [0, 0, -1], size: [0.3, 0.5], segments: 16, bone: mantle.joints[1] });
  }

  // Hydro veins and beads on the mantle
  for (const s of [1, -1]) {
    const vein = body.line(s * 38, 0.003).slice(0.03, tNeck * 0.9);
    glow(b.sweep(vein, [0.008, 0.004], { color: CYAN, sides: 5, bone: [mantle, core], name: "mantleVein" }), 1);
  }
  const mantleHits = skin.scatter(26, {
    rng: rng(41),
    minDist: 0.1,
    filter: (h) => h.n.y > 0.3 && h.at.z < -0.14 && Math.abs(h.at.x) > 0.06,
  });
  mantleHits.forEach((h, i) => {
    const r = 0.011 + 0.008 * ((i * 37) % 5) / 4;
    glow(b.stick(new THREE.SphereGeometry(r, 6, 4), i % 3 ? CYAN : CYAN_LT, h, { embed: 0.4, name: "mantleBead" }), 1);
  });

  // Gold collar at the neck, gems, hanging tassels
  {
    const neckLine = frame(bodyPath.at(tNeck), bodyPath.tangentAt(tNeck));
    for (const [dt, rr] of [
      [0, 0.0125],
      [0.07, 0.008],
    ]) {
      const l = bodyPath.at(Math.max(0.01, tNeck - dt));
      const ln = dt ? frame(l, bodyPath.tangentAt(tNeck - dt)) : neckLine;
      b.sweep(skin.loop(ln, { lift: 0.004 }), rr, { color: GOLD, sides: 6, name: dt ? "collarThin" : "collar" });
    }
    const gems = [0, 100, -100].map((deg) => body.at(tNeck, deg));
    gems.forEach((g, i) => {
      glow(b.stick(new THREE.OctahedronGeometry(i ? 0.02 : 0.026, 0), CYAN, g, { embed: 0.2, name: "collarGem" }), 1.3);
      b.stick(new THREE.SphereGeometry(i ? 0.014 : 0.018, 6, 4), GOLD, g.moved([0, -0.008, 0]), { embed: 0.5, name: "collarBead" });
    });
    b.cards(
      [118, -118].map((deg) => {
        const g = body.at(tNeck, deg);
        return frame(g.moved([0, 0.016, 0]).at, [0, 1, 0]);
      }),
      TASSEL,
      { size: [0.05, 0.14], lean: 180, flow: [0, 0, 1], sink: 0, cross: true, bone: mantle.joints[0] },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Arms
  const suckerGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.001, 0.1),
      new THREE.Vector2(0.45, 0.28),
      new THREE.Vector2(0.72, 0.55),
      new THREE.Vector2(1, 0.45),
      new THREE.Vector2(1.05, 0.1),
      new THREE.Vector2(0.9, -0.3),
      new THREE.Vector2(0.001, -0.3),
    ],
    7,
  );
  const armBuilt = ARMS.map((sp, i) => {
    const nm = `arm${sp.side > 0 ? "L" : "R"}${sp.n}`;
    const path = catmull(armPts[i]);
    const chain = b.chain(nm, path, { parent: headJoint, count: 8, names: (i) => `${nm}_${i + 1}`, role: "tentacle" });
    const sweep = b.sweep(chain, (t) => [armRx(t), armRy(t)], { color: armPaint(sp.len), sides: 8, name: `${nm}Skin` });
    return { sp, nm, chain, sweep };
  });

  for (const { nm, chain, sweep } of armBuilt) {
    // suckers on both lower flanks
    const COUNT = 18;
    for (const row of [1, -1]) {
      for (let k = 0; k < COUNT; k++) {
        const t = 0.07 + 0.86 * ((k + (row > 0 ? 0 : 0.5)) / COUNT);
        const at = sweep.at(t, 180 + row * 64);
        b.stick(suckerGeo, SUCKER, at, { embed: 0.42, scale: armRx(t) * 0.58, name: `${nm}Sucker` });
      }
    }
    // glowing dorsal vein and beads
    const vein = sweep.line(0, 0.004).slice(0.08, 0.93);
    glow(b.sweep(vein, [0.0065, 0.0025], { color: CYAN, sides: 5, name: `${nm}Vein` }), 1);
    for (let k = 0; k < 6; k++) {
      const t = 0.12 + 0.135 * k;
      const r = armRx(t) * 0.3;
      glow(b.stick(new THREE.SphereGeometry(r, 6, 4), k % 2 ? CYAN_LT : CYAN, sweep.at(t, 0), { embed: 0.4, name: `${nm}Bead` }), 1.1);
    }
    // gold armband and gem
    const bandT = 0.2;
    b.sweep(b.surface(sweep).loop(chain.at(bandT), { lift: 0.003 }), 0.0095, { color: GOLD, sides: 6, name: `${nm}Band` });
    b.sweep(b.surface(sweep).loop(chain.at(bandT + 0.035), { lift: 0.002 }), 0.0055, { color: GOLD_DK, sides: 5, name: `${nm}BandThin` });
    glow(
      b.stick(new THREE.OctahedronGeometry(armRx(bandT) * 0.36, 0), CYAN, sweep.at(bandT, 0), { embed: 0.2, name: `${nm}Gem` }),
      1.3,
    );
    glow(b.stick(new THREE.OctahedronGeometry(0.016, 0), CYAN_LT, sweep.at(0.97, 0), { embed: 0.3, name: `${nm}TipSpark` }), 1.4);
  }

  // Webbing between neighbouring arms
  const edge = (c: (typeof armBuilt)[number]) => {
    const out = [];
    for (let i = 0; i <= 8; i++) {
      const t = 0.02 + i * 0.045;
      out.push(c.chain.at(t).moved({ down: armRy(t) * 0.72 }));
    }
    return catmull(out);
  };
  const L = armBuilt.filter((a) => a.sp.side > 0);
  const R = armBuilt.filter((a) => a.sp.side < 0);
  const pairs: [(typeof armBuilt)[number], (typeof armBuilt)[number]][] = [];
  for (const side of [L, R]) for (let i = 0; i < 3; i++) pairs.push([side[i], side[i + 1]]);
  pairs.push([R[0], L[0]]);
  for (const [a, c] of pairs)
    b.membrane(edge(a), edge(c), { thickness: 0.012, color: SKIN, name: `web${a.nm}${c.nm}` });

  return b.root;
}
