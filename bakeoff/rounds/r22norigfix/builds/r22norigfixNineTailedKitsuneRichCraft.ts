import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Builder, OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng, toPoint } from "../../../../src/math";
import { gradient, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "A noble white spirit fox with nine fanned tails tipped in blue spirit fire, shrine rope collar, gold rings and drifting hitodama flames.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const COAT = cel("#f6eedc");
const BELLY = cel("#fffaf0");
const RED = cel("#d93a45");
const SOCK = cel("#3a2a4a", INK);
const EARIN = cel("#f08a96");
const NOSE = "#2a1830";
const GOLD = "#f2bf4a";
const GOLD2 = "#c98f22";
const ROPE = "#e8d9a8";
const PAPER = "#ffffff";
const FIRE = "#58e0ff";
const FIRE_IN = "#e8fdff";

const FLAME: OutlinePoint[] = [
  [0, 0],
  [0.05, 0.03],
  [0.06, 0.1],
  [0.03, 0.18],
  [0.005, 0.32, "sharp"],
  [-0.02, 0.2],
  [-0.06, 0.1],
  [-0.05, 0.03],
];

function flame(b: Builder, at: number[], k: number, spin: number): void {
  const outer = FLAME.map((p) => (p.length === 3 ? ([p[0] * k, p[1] * k, "sharp"] as OutlinePoint) : ([p[0] * k, p[1] * k] as OutlinePoint)));
  const inner = outer.map((p) => (p.length === 3 ? ([p[0] * 0.5, p[1] * 0.6 + 0.01 * k, "sharp"] as OutlinePoint) : ([p[0] * 0.5, p[1] * 0.6 + 0.01 * k] as OutlinePoint)));
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const x: [number, number, number] = [c, 0, s];
  glow(b.extrude(outer, { at, x, thickness: 0.014 * k * 10, smoothing: 1, color: FIRE }), 1.4);
  glow(b.extrude(inner, { at: [at[0], at[1], at[2]], x, thickness: 0.02 * k * 10, smoothing: 1, color: FIRE_IN }), 1.8);
}

function ringPath(center: THREE.Vector3, axis: THREE.Vector3, r: number, n: number): THREE.Vector3[] {
  const a = axis.clone().normalize();
  const ref = Math.abs(a.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = ref.clone().cross(a).normalize();
  const v = a.clone().cross(u).normalize();
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push(center.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(v, Math.sin(t) * r));
  }
  return pts;
}

const SEAL = svg(
  `<svg viewBox="0 0 200 200">
  <g fill="none" stroke="#58e0ff" stroke-width="2.4" stroke-linecap="round">
    <circle cx="100" cy="100" r="96"/>
    <circle cx="100" cy="100" r="88" stroke-width="1.2"/>
    <circle cx="100" cy="100" r="60"/>
    <polygon points="100,40 147,127 53,127" stroke-width="1.6"/>
    <polygon points="100,160 53,73 147,73" stroke-width="1.6"/>
    <circle cx="100" cy="100" r="22" stroke-width="1.6"/>
  </g>
  <g stroke="#e8fdff" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M100 8 v8 M100 184 v8 M8 100 h8 M184 100 h8 M33 33 l6 6 M161 161 l6 6 M33 167 l6 -6 M161 39 l6 -6"/>
    <path d="M94 76 l6 -10 l6 10 M94 124 l6 10 l6 -10 M76 94 l-10 6 l10 6 M124 94 l10 6 l-10 6"/>
  </g>
  <circle cx="100" cy="100" r="6" fill="#e8fdff"/>
  </svg>`,
  { size: 512 },
);

const FOREHEAD = svg(
  `<svg viewBox="0 0 64 64"><g fill="#d93a45" stroke="#7a1c2c" stroke-width="2.5" stroke-linejoin="round">
  <path d="M32 6 L44 30 L32 58 L20 30 Z"/></g>
  <path d="M32 18 L38 30 L32 44 L26 30 Z" fill="#ffd36a"/>
  <path d="M10 32 Q20 24 24 34 M54 32 Q44 24 40 34" stroke="#d93a45" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 64 64"><g fill="#d93a45" stroke="#7a1c2c" stroke-width="1.6" stroke-linejoin="round">
  <path d="M4 20 Q30 24 58 8 Q36 34 8 34 Z"/><path d="M6 40 Q30 44 52 36 Q34 56 10 52 Z"/></g></svg>`,
  { size: 128 },
);

const SHIDE = svg(
  `<svg viewBox="0 0 32 64"><path d="M8 2 L24 2 L22 14 L28 22 L20 30 L26 40 L18 48 L22 62 L10 62 L12 48 L6 40 L14 30 L6 22 L12 14 Z" fill="#ffffff" stroke="#cfd6e6" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const rand = rng(11);

  // Spirit seal on the floor
  glow(b.part(new THREE.PlaneGeometry(2.5, 2.5), "#ffffff", { at: [0, 0.006, 0.1], dir: [0, 1, 0], axis: "z", texture: SEAL, up: [0, 0, -1] }), 1);

  // Painted coat
  const bodyPaint = paint((p, n) => {
    if (n.y < -0.4) return BELLY;
    const band = (((p.z + 0.5) % 0.1) + 0.1) % 0.1 < 0.022;
    if (n.y > 0.25 && band && Math.abs(p.x) < 0.1 && p.z < 0.15 && p.z > -0.45) return RED;
    return COAT;
  });
  const legPaint = paint((p) => (p.y < 0.2 ? SOCK : COAT));
  const headPaint = paint((p, n) => (n.y < -0.3 || (n.z > 0.5 && p.y < 0.93) ? BELLY : COAT));

  // Torso
  const torso = b.sweep(
    catmull([
      [0, 0.69, -0.46],
      [0, 0.72, -0.12],
      [0, 0.74, 0.22],
    ]),
    [0.12, 0.155, 0.135],
    { color: bodyPaint, sides: 10 },
  );
  b.part(new THREE.SphereGeometry(1, 10, 8), bodyPaint, { at: [0, 0.7, 0.23], scale: [0.14, 0.17, 0.15] });
  b.part(new THREE.SphereGeometry(1, 10, 8), bodyPaint, { at: [0, 0.69, -0.42], scale: [0.14, 0.15, 0.15] });

  // Neck
  const neck = b.sweep(
    catmull([
      [0, 0.72, 0.24],
      [0, 0.86, 0.36],
      [0, 0.95, 0.44],
    ]),
    [0.105, 0.085, 0.075],
    { color: headPaint, sides: 9 },
  );

  // Head
  const HC: [number, number, number] = [0, 0.99, 0.52];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), headPaint, { at: HC, scale: [0.115, 0.1, 0.11] });
  b.sweep(
    catmull([
      [0, 0.97, 0.58],
      [0, 0.95, 0.7],
      [0, 0.935, 0.79],
    ]),
    [0.075, 0.05, 0.03],
    { color: headPaint, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [0, 0.94, 0.83], scale: [0.026, 0.02, 0.024] });
  b.rod([0, 0.915, 0.8], [0, 0.915, 0.72], 0.004, INK);
  // mouth line
  for (const s of [1, -1]) {
    b.sweep(catmull([[0, 0.915, 0.76], [s * 0.025, 0.905, 0.73], [s * 0.05, 0.915, 0.69]]), 0.004, INK, { sides: 4 });
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.045, 0.93 - i * 0.008, 0.74], [s * 0.2, 0.96 - i * 0.03, 0.76 - i * 0.03], 0.0025, "#fffdf0", { sides: 4 });
    }
  }

  // Eyes and face marks
  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#ffc21a", irisLight: "#fff08a", blush: false });
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 34, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.052, 0.07], mirror: s > 0 });
    const ch = skin.around(HC).at(s * 62, -14);
    if (ch) b.decal(skin, CHEEK, { at: ch, size: [0.07, 0.07], mirror: s < 0, roll: s * 10 });
  }
  const fh = skin.around(HC).at(0, 55);
  if (fh) b.decal(skin, FOREHEAD, { at: fh, size: [0.06, 0.06] });

  // Cheek ruffs
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.09, 0.95 - i * 0.012, 0.5 - i * 0.02], [s * 0.7, -0.25 - i * 0.08, -0.45], 0.1 - i * 0.008, 0.028, COAT, { sides: 5 });
    }
  }

  // Ears
  for (const s of [1, -1]) {
    const earOut: OutlinePoint[] = [
      [-0.06, 0],
      [0.06, 0],
      [0.012, 0.25, "sharp"],
    ];
    const ear = b.extrude(earOut, { at: [s * 0.075, 1.065, 0.47], x: [1, 0, 0], y: [s * 0.28, 1, -0.1], thickness: 0.03, bevel: 0.008, smoothing: 1, color: COAT });
    const earIn: OutlinePoint[] = [
      [-0.035, 0.012],
      [0.035, 0.012],
      [0.008, 0.17, "sharp"],
    ];
    b.extrude(earIn, { at: ear.local([0, 0.0, 0.0]), x: [1, 0, 0], y: [s * 0.28, 1, -0.1], thickness: 0.036, bevel: 0.004, smoothing: 1, color: EARIN });
    b.extrude(
      [
        [-0.06, 0.18],
        [0.06, 0.18],
        [0.012, 0.25, "sharp"],
      ],
      { at: [s * 0.075, 1.065, 0.47], x: [1, 0, 0], y: [s * 0.28, 1, -0.1], thickness: 0.034, smoothing: 1, color: SOCK },
    );
    // gold ear ring
    b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 10), GOLD, { at: [s * (0.075 + 0.054), 1.07, 0.47], dir: [1, 0, 0], axis: "z" });
  }

  // Shrine rope collar with shide and bell
  const cc = new THREE.Vector3(0, 0.865, 0.37);
  const ax = new THREE.Vector3(0, 0.6, 0.45);
  const rp = ringPath(cc, ax, 0.105, 12);
  const collar = b.sweep(catmull(rp.map((v) => [v.x, v.y, v.z]), { closed: true }), 0.022, ROPE, { sides: 6 });
  const rp2 = ringPath(cc.clone().add(new THREE.Vector3(0, 0, 0.001)), ax, 0.106, 12);
  b.sweep(catmull(rp2.map((v) => [v.x, v.y, v.z]), { closed: true }), 0.006, RED, { sides: 4, extend: 0 });
  const front = rp.reduce((a, c) => (c.z > a.z ? c : a));
  const fr = rp.filter((v) => v.y < cc.y).reduce((a, c) => (c.z > a.z ? c : a), front);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { at: [fr.x, fr.y - 0.03, fr.z + 0.02] });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD2, { at: [fr.x, fr.y - 0.03, fr.z + 0.02], dir: [0, 0, 1], axis: "z" });
  b.rod([fr.x, fr.y - 0.058, fr.z + 0.02], [fr.x, fr.y - 0.064, fr.z + 0.02], 0.006, INK);
  const shideFrames = rp.filter((_v, i) => i % 3 === 0 && i > 0).map((v) => ({ at: [v.x, v.y - 0.01, v.z] }));
  for (const f of shideFrames) {
    b.cards([{ at: new THREE.Vector3(...f.at), axis: new THREE.Vector3(0, 1, 0) } as never], SHIDE, { size: [0.045, 0.09], lean: 180, flow: [0, 0, 1], color: PAPER });
  }
  void collar;

  // Chest and neck fur tufts
  const furHits = b.surface(neck).scatter(30, { rng: rand, minDist: 0.04, filter: (h) => h.n.z > -0.2 });
  for (const h of furHits) {
    b.stick(new THREE.ConeGeometry(0.022, 0.08, 5).translate(0, 0.036, 0), BELLY, h);
  }
  const chestHits = b.surface(torso).scatter(36, { rng: rand, minDist: 0.05, filter: (h) => h.n.y < 0.2 && toPoint(h).z > 0.1 });
  for (const h of chestHits) {
    b.stick(new THREE.ConeGeometry(0.025, 0.09, 5).translate(0, 0.04, 0), BELLY, h);
  }

  // Legs
  const legs: Array<{ path: ReturnType<typeof catmull>; s: number }> = [];
  for (const s of [1, -1]) {
    const x = s * 0.095;
    const front = catmull([
      [x, 0.66, 0.22],
      [x, 0.38, 0.2],
      [x, 0.12, 0.24],
      [x, 0.04, 0.26],
    ]);
    b.sweep(front, [0.065, 0.042, 0.03, 0.028], { color: legPaint, sides: 8, caps: "round" });
    legs.push({ path: front, s });
    const hx = s * 0.11;
    b.part(new THREE.SphereGeometry(1, 9, 7), COAT, { at: [hx, 0.62, -0.4], scale: [0.095, 0.15, 0.17] });
    const hind = catmull([
      [hx, 0.6, -0.4],
      [hx, 0.4, -0.5],
      [hx, 0.2, -0.43],
      [hx, 0.04, -0.4],
    ]);
    b.sweep(hind, [0.07, 0.045, 0.032, 0.028], { color: legPaint, sides: 8, caps: "round" });
    legs.push({ path: hind, s });
    // paws
    for (const [pz, px] of [[0.275, x], [-0.385, hx]] as const) {
      b.part(new THREE.SphereGeometry(1, 8, 6), SOCK, { at: [px, 0.03, pz], scale: [0.042, 0.03, 0.065] });
      for (const k of [-1, 0, 1]) b.spike([px + k * 0.016, 0.02, pz + 0.05], [k * 0.15, -0.2, 1], 0.025, 0.006, "#fff4e0", { sides: 4 });
    }
  }
  // gold anklets
  for (const l of legs) {
    const p = l.path.at(0.7);
    b.part(new THREE.TorusGeometry(0.04, 0.009, 5, 10), GOLD, { at: p, dir: [0, 1, 0], axis: "z" });
  }

  // Nine tails
  const base = new THREE.Vector3(0, 0.74, -0.5);
  const tipPts: Array<{ p: THREE.Vector3; t: THREE.Vector3 }> = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i - 4) / 4) * 1.15;
    const lift = 0.55 + 0.45 * Math.cos(a * 0.9);
    const L = 1.05 + 0.12 * Math.cos(a);
    const pts: number[][] = [];
    for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      pts.push([
        base.x + Math.sin(a) * L * 0.85 * t,
        base.y + 0.05 + L * lift * 0.78 * t + 0.18 * Math.sin(t * Math.PI * 0.9),
        base.z - Math.cos(a) * L * 0.55 * t - 0.06 * t,
      ]);
    }
    const path = catmull(pts);
    const tailPaint = cel(gradient(gradient("#f6eedc", "#f6eedc", path.at(0), path.at(0.5)), "#e8505a", path.at(0.55), path.at(0.95)));
    b.sweep(path, [0.04, 0.09, 0.125, 0.085, 0.012], { color: tailPaint, sides: 8, caps: "round" });
    b.part(new THREE.TorusGeometry(0.092, 0.011, 5, 10), GOLD, { at: path.at(0.2), dir: path.tangentAt(0.2), axis: "z" });
    const tip = path.at(1);
    const tan = path.tangentAt(1);
    tipPts.push({ p: tip, t: tan });
    flame(b, [tip.x, tip.y + 0.0, tip.z], 1.0, i * 0.55);
    flame(b, [tip.x, tip.y + 0.0, tip.z], 1.0, i * 0.55 + Math.PI / 2);
  }

  // Hitodama: drifting spirit flames
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const r = 0.95 + 0.25 * Math.sin(i * 2.1);
    const px = Math.sin(a) * r;
    const pz = Math.cos(a) * r * 0.85 + 0.1;
    const py = 0.3 + ((i * 0.37) % 1) * 0.95;
    glow(b.part(new THREE.SphereGeometry(0.035, 7, 5), FIRE_IN, { at: [px, py, pz] }), 2);
    flame(b, [px, py + 0.01, pz], 0.9, i * 0.8);
    flame(b, [px, py + 0.01, pz], 0.9, i * 0.8 + Math.PI / 2);
    b.part(new THREE.RingGeometry(0.05, 0.056, 12), FIRE, { at: [px, py, pz], dir: [0, 1, 0], axis: "z" });
  }

  // Forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.014), "#ff6a7a", { at: [0, 1.065, 0.605], scale: [1, 1.5, 1] }), 1.2);

  return b.root;
}
