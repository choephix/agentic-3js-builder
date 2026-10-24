// STYLE: "Cloisonné reliquary bird". The phoenix is built like a piece of gold-wire enamel jewellery.
// Every plume, scale and wing feather is a field of jewel-coloured enamel cells (ruby, amber, turquoise,
// cobalt, emerald) divided by raised gold wire. It rises from a bed of glowing ember-stones and flame
// tongues drawn in the same gold-outlined enamel language. Gems, the eyes, the sun medallion and the embers glow.
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  lerp,
  vec,
  DEG,
  bezier,
  catmull,
  polyline,
  limb,
  countershade,
  paint,
  scales,
  mottle,
  mix,
  noise,
  cells,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cloisonné Phoenix",
  description:
    "A phoenix rising from an ember bed, rendered as gold-wire cloisonné enamel: jewel-cell plumage, glowing gems, eyes, sun medallion and flame tongues.",
};

// ---------------------------------------------------------------- palette
const GOLD = "#e9b53c";
const GOLD_D = "#9a6a1c";
const GOLD_L = "#ffe08a";
const INK = "#2a1020";
const RUBY = "#c8173c";
const CRIM = "#ff4a2a";
const AMBER = "#ff9a1f";
const YELLOW = "#ffd54a";
const TEAL = "#12a79d";
const COBALT = "#1e5fb0";
const EMERALD = "#0f8a5f";
const MAGENTA = "#c2237f";
const VIOLET = "#5b2a86";
const CHAR = "#241a1c";
const TALON = "#f3e6c0";

type Pt = Array<[number, number] | [number, number, "sharp"]>;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const frac = (x: number) => x - Math.floor(x);
const jit = (k: number) => frac(Math.sin(k * 12.9898 + 1.7) * 43758.5453);
const shade = (c: readonly [number, number, number], k: number): [number, number, number] => [
  Math.min(c[0] * k, 1),
  Math.min(c[1] * k, 1),
  Math.min(c[2] * k, 1),
];

// A feather painted as enamel: gold quill, gold chevron barb wires, jewel cells shifting root -> tip.
const featherPaint = (len: number, c0: string, c1: string, c2: string, seed = 0) =>
  paint((_p, _n, s) => {
    const x = s[0];
    const y = Math.abs(s[1]);
    const t = Math.min(Math.max(x / len, 0), 1);
    if (y < 0.0045) return GOLD_L;
    if (t > 0.965) return GOLD;
    const q = (x - y * 1.8) / (len * 0.15);
    const k = Math.floor(q);
    if (q - k < 0.1) return GOLD;
    const base = t < 0.5 ? mix(c0, c1, t / 0.5) : mix(c1, c2, (t - 0.5) / 0.5);
    return shade(base, 0.86 + 0.28 * jit(k + seed));
  });

const plumeW = (a: number, W: number) => Math.max(W * Math.sin(Math.PI * Math.pow(Math.max(a, 0.001), 0.85)), 0.004);

// Long ribbon plume with an eye-spot (ocellus) of concentric enamel rings near the tip.
const plumePaint = (len: number, W: number, c0: string, c1: string, c2: string, ring: [string, string, string]) =>
  paint((_p, _n, s) => {
    const a = s[0];
    const c = s[1] - 0.5;
    const w = plumeW(a, W);
    const dc = c * 2 * w;
    if (Math.abs(c) > 0.43) return GOLD;
    if (Math.abs(c) < 0.02) return GOLD_L;
    const da = (a - 0.78) * len;
    const r = Math.hypot(da * 0.8, dc) / (W * 0.5);
    if (a > 0.5 && r < 1) {
      if (r < 0.3) return ring[0];
      if (r < 0.48) return GOLD_L;
      if (r < 0.72) return ring[1];
      if (r < 0.86) return GOLD;
      return ring[2];
    }
    const q = (a * len - Math.abs(dc) * 1.5) / 0.1;
    const k = Math.floor(q);
    if (q - k < 0.11) return GOLD;
    const base = a < 0.5 ? mix(c0, c1, a / 0.5) : mix(c1, c2, (a - 0.5) / 0.5);
    return shade(base, 0.86 + 0.28 * jit(k));
  });

// ---------------------------------------------------------------- textures
const eyeTex = () =>
  svg(
    `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="i" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff1a0"/><stop offset="0.55" stop-color="#ff9a1f"/><stop offset="1" stop-color="#c8173c"/></radialGradient></defs>
  <path d="M4 56 Q48 4 97 38 Q54 96 4 56Z" fill="${INK}"/>
  <path d="M11 55 Q48 15 90 39 Q54 84 11 55Z" fill="${GOLD_L}"/>
  <circle cx="52" cy="50" r="23" fill="url(#i)" stroke="${INK}" stroke-width="3.5"/>
  <ellipse cx="52" cy="50" rx="7" ry="19" fill="${INK}"/>
  <circle cx="44" cy="41" r="5.5" fill="#ffffff"/><circle cx="60" cy="60" r="2.6" fill="#ffffff"/>
  <path d="M8 56 Q2 48 4 36" stroke="${GOLD}" stroke-width="4" stroke-linecap="round" fill="none"/>
  <path d="M30 28 Q50 18 76 28" stroke="${GOLD}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </svg>`,
    { size: 256 },
  );

const flameTex = () =>
  svg(
    `<svg viewBox="0 0 64 100">
  <path d="M32 98 C6 96 2 70 14 52 C18 62 22 62 24 56 C22 36 30 18 36 2 C42 22 58 40 54 66 C60 60 60 58 58 52 C64 80 56 98 32 98Z" fill="#ff3a1c" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 94 C16 92 14 74 24 62 C26 70 30 70 32 64 C30 50 36 40 40 30 C44 46 52 58 48 72 C46 84 42 94 32 94Z" fill="#ff9a1f" stroke="${GOLD}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M32 90 C24 88 24 78 30 70 C32 76 36 74 38 68 C42 76 42 88 32 90Z" fill="#ffe04a" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,
    { size: 256 },
  );

const sparkTex = () =>
  svg(
    `<svg viewBox="0 0 32 32"><path d="M16 1 L21 11 L31 16 L21 21 L16 31 L11 21 L1 16 L11 11Z" fill="${GOLD_L}" stroke="#ff9a1f" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
    { size: 64 },
  );

const sunTex = () => {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const a0 = a - 0.16;
    const a1 = a + 0.16;
    const pt = (r: number, t: number) => `${(50 + r * Math.sin(t)).toFixed(1)} ${(50 - r * Math.cos(t)).toFixed(1)}`;
    rays += `<path d="M${pt(30, a0)} L${pt(47, a)} L${pt(30, a1)}Z" fill="${i % 2 ? AMBER : CRIM}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="${GOLD}" stroke="${GOLD_D}" stroke-width="2"/>
  ${rays}
  <circle cx="50" cy="50" r="29" fill="${RUBY}" stroke="${GOLD_L}" stroke-width="3.5"/>
  <circle cx="50" cy="50" r="19" fill="${AMBER}" stroke="${GOLD}" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="9" fill="#fff0a0" stroke="${GOLD}" stroke-width="2"/>
  </svg>`,
    { size: 256 },
  );
};

// small scalloped breast/back feather with gold wire, in two enamel colours
const featherTex = (outer: string, inner: string) =>
  svg(
    `<svg viewBox="0 0 40 64">
  <path d="M20 62 C2 50 0 22 20 2 C40 22 38 50 20 62Z" fill="${outer}" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 18 C9 28 10 40 20 46 C30 40 31 28 20 18Z" fill="${inner}" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M20 58 L20 8" stroke="${GOLD_L}" stroke-width="2.4"/>
  </svg>`,
    { size: 128 },
  );

// ---------------------------------------------------------------- the model
export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  type Bone = ReturnType<typeof b.joint>;

  const EYE = eyeTex();
  const FLAME = flameTex();
  const SPARK = sparkTex();
  const SUN = sunTex();
  const FT_TEAL = featherTex(TEAL, COBALT);
  const FT_COBALT = featherTex(COBALT, VIOLET);
  const FT_EMER = featherTex(EMERALD, TEAL);
  const FT_RUBY = featherTex(RUBY, AMBER);
  const FT_AMBER = featherTex(AMBER, YELLOW);

  // ---- skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.8, -0.3], dir: [0, 0.5, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.22],
      [0, 1.0, -0.08],
      [0, 1.2, 0.1],
      [0, 1.4, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.4, 0.22],
      [0, 1.55, 0.32],
      [0, 1.75, 0.35],
      [0, 1.93, 0.42],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const HD = V(0, 1.93, 0.42);
  const head = b.joint("head", { parent: neck.joints[2], at: HD, dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.945, 0.5], aim: [0, 1.9, 0.74], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.36],
      [0, 0.72, -0.7],
      [0, 0.55, -1.1],
      [0, 0.38, -1.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- body paints ----------------------------------------------------
  const backCells = scales([TEAL, COBALT, EMERALD], GOLD, { size: 0.06, width: 0.16, seed: 2 });
  const bellyCells = scales([RUBY, CRIM, AMBER], GOLD, { size: 0.05, width: 0.16, seed: 3 });
  const bodyPaint = paint((_p, n) => {
    const v = n.z * 0.75 - n.y * 0.45;
    if (Math.abs(v - 0.15) < 0.035) return GOLD;
    return v > 0.15 ? bellyCells : backCells;
  });
  const headPaint = scales([TEAL, COBALT, EMERALD], GOLD, { size: 0.035, width: 0.2, seed: 4 });

  // ---- body, neck, tail root -----------------------------------------
  const bodyR = (t: number): [number, number] => {
    const k = 0.115 + 0.105 * Math.sin(Math.PI * (0.15 + 0.75 * t));
    return [k, k * 1.04];
  };
  const bodySweep = b.sweep(spine, bodyR, { color: bodyPaint, group: "body" });
  const neckSweep = b.sweep(neck, (t: number) => 0.11 - 0.035 * t, { color: bodyPaint, group: "body" });
  b.sweep(tail, [0.11, 0.03], { color: bodyPaint, group: "body" });

  const bodySkin = b.surface(bodySweep);
  const neckSkin = b.surface(neckSweep);

  // ---- head -----------------------------------------------------------
  const HC = V(0, 1.97, 0.49);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), headPaint, {
    bone: head,
    at: HC,
    scale: [0.1, 0.105, 0.125],
    group: "head",
  });
  const skullSkin = b.surface(skull);

  // beak: upper hooked, lower on the jaw joint
  b.sweep(bezier([0, 1.985, 0.54], [0, 1.99, 0.68], [0, 1.89, 0.8]), (t: number) => [0.05 * (1 - t) + 0.002, 0.046 * (1 - t) + 0.002], {
    bone: head,
    color: countershade(GOLD_L, GOLD_D),
    caps: "point",
    sides: 6,
    group: "head",
  });
  b.sweep(bezier([0, 1.945, 0.52], [0, 1.93, 0.64], [0, 1.9, 0.74]), [0.04, 0.003], {
    bone: jaw,
    color: countershade(GOLD, GOLD_D),
    caps: "point",
    sides: 6,
    group: "head",
  });

  // eyes + gold brows
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 58, 8)!;
    glow(
      b.decal(skull, EYE, { at: hit, size: [0.085, 0.085], mirror: s > 0, bone: head, name: `eye${s > 0 ? "L" : "R"}` }),
      1.1,
    );
    const o = hit.at;
    const brow = skullSkin.drape(
      catmull([
        [o.x - s * 0.005, o.y + 0.045, o.z - 0.05],
        [o.x + s * 0.005, o.y + 0.062, o.z - 0.005],
        [o.x - s * 0.005, o.y + 0.048, o.z + 0.045],
      ]),
      { lift: 0.008 },
    );
    b.sweep(brow, 0.011, { color: GOLD, bone: head, sides: 5 });
    // cheek plume sweeping back
    const cd = V(s * 0.5, -0.1, -0.85).normalize();
    const cl = 0.3;
    b.extrude(
      [
        [0, -0.02],
        [cl * 0.4, -0.04],
        [cl * 0.8, -0.02],
        [cl, 0.0, "sharp"],
        [cl * 0.7, 0.025],
        [0, 0.02],
      ] as Pt,
      {
        at: V(s * 0.09, 1.95, 0.47),
        x: cd,
        y: V(0, 1, 0).addScaledVector(cd, -cd.y).normalize(),
        thickness: 0.008,
        smoothing: 1,
        color: featherPaint(cl, TEAL, COBALT, VIOLET, 3),
        bone: head,
        group: "head",
      },
    );
  }

  // crown: gold circlet, forehead gem, flame crest
  const circlet = skullSkin.loop(V(0, HC.y + 0.045, HC.z), { dir: [0, 1, 0.2], lift: 0.006 });
  b.sweep(circlet, 0.011, { color: GOLD, bone: head, sides: 5 });
  const fore = skullSkin.around(HC).at(0, 52)!;
  glow(b.stick(new THREE.OctahedronGeometry(0.03), "#ff3050", fore, { embed: 0.3, flat: true, bone: head }), 1.3);

  for (let i = -3; i <= 3; i++) {
    const k = 3 - Math.abs(i);
    const a = (60 - k * 8) * DEG;
    const L = 0.2 + k * 0.07;
    const d = V(i * 0.16, Math.cos(a), -Math.sin(a)).normalize();
    const y = new THREE.Vector3().crossVectors(d, V(1, 0, 0)).normalize();
    const o = HC.clone().add(V(i * 0.028, 0.09 - Math.abs(i) * 0.012, -0.05 - Math.abs(i) * 0.01));
    b.extrude(
      [
        [0, -0.03],
        [L * 0.4, -0.045],
        [L * 0.75, -0.02],
        [L, 0.03, "sharp"],
        [L * 0.72, 0.028],
        [L * 0.35, 0.042],
        [0, 0.03],
      ] as Pt,
      {
        at: o,
        x: d,
        y,
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: featherPaint(L, CRIM, AMBER, YELLOW, i + 9),
        bone: head,
        group: "crest",
      },
    );
    const tip = o.clone().addScaledVector(d, L).addScaledVector(y, 0.03);
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), "#fff0a0", { at: tip, bone: head, group: "crest" }), 1.6);
  }

  // gold gorget with ruby gems around the neck
  const collar = neckSkin.loop(neck.joints[1], { lift: 0.014 });
  b.sweep(collar, 0.02, { color: GOLD, sides: 6, bone: neck.joints[1], group: "body" });
  b.along(collar, 8, (at) => {
    const hit = neckSkin.nearest(at.at);
    glow(b.stick(new THREE.OctahedronGeometry(0.026), "#ff3050", hit, { embed: 0.15, flat: true, bone: neck.joints[1] }), 1.2);
  });

  // chest sun medallion
  const chestHit = bodySkin.around(V(0, 1.12, 0.0)).at(0, -12)!;
  glow(b.decal(bodySweep, SUN, { at: chestHit, size: [0.19, 0.19], name: "sun" }), 1.0);
  const medRing = b.ring(chestHit, { count: 14, radius: 0.108 });
  b.sweep(bodySkin.drape(catmull(medRing.items, { closed: true }), { lift: 0.006 }), 0.011, { color: GOLD, sides: 5 });

  // ---- plumage cards on body and neck ---------------------------------
  const backHits = bodySkin.scatter(80, { rng: rng(11), minDist: 0.055, filter: (h) => h.n.y > 0.3 });
  b.cards(backHits, [FT_TEAL, FT_TEAL, FT_COBALT, FT_EMER], {
    size: [0.075, 0.11],
    lean: 62,
    bend: 20,
    flow: [0, -0.4, -1],
    vary: 0.25,
    rng: rng(12),
    spin: 12,
  });
  const chestHits = bodySkin.scatter(70, {
    rng: rng(13),
    minDist: 0.045,
    filter: (h) => h.n.z > 0.35 && h.at.distanceTo(chestHit.at) > 0.13,
  });
  b.cards(chestHits, [FT_RUBY, FT_AMBER, FT_RUBY], {
    size: [0.075, 0.115],
    lean: 58,
    bend: 18,
    flow: [0, -1, -0.15],
    vary: 0.25,
    rng: rng(14),
  });
  const neckHits = neckSkin.scatter(36, { rng: rng(15), minDist: 0.05 });
  b.cards(neckHits, [FT_TEAL, FT_RUBY, FT_AMBER], {
    size: [0.06, 0.09],
    lean: 60,
    bend: 15,
    flow: [0, -1, -0.2],
    vary: 0.25,
    rng: rng(16),
  });

  // ---- feather helper -------------------------------------------------
  type PaintT = ReturnType<typeof paint>;
  const feather = (
    bone: Bone,
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    normal: THREE.Vector3,
    len: number,
    wid: number,
    color: PaintT,
    group: string,
  ) => {
    const n = normal.clone().normalize();
    const d = dir.clone();
    d.addScaledVector(n, -d.dot(n)).normalize();
    const y = new THREE.Vector3().crossVectors(n, d).normalize();
    const w = wid / 2;
    const outline: Pt = [
      [0, -w * 0.25],
      [len * 0.3, -w * 0.9],
      [len * 0.7, -w],
      [len * 0.92, -w * 0.55],
      [len, 0, "sharp"],
      [len * 0.92, w * 0.55],
      [len * 0.7, w],
      [len * 0.3, w * 0.9],
      [0, w * 0.25],
    ];
    return b.extrude(outline, { at: origin, x: d, y, thickness: 0.007, bevel: 0.002, smoothing: 1, color, bone, group });
  };
  const dirFrom = (s: number, phi: number, el: number) => {
    const f = phi * DEG;
    const e = el * DEG;
    return V(s * Math.cos(f) * Math.cos(e), Math.sin(e), -Math.sin(f) * Math.cos(e));
  };

  // ---- wings ----------------------------------------------------------
  const PL = [0.78, 0.92, 1.04, 1.1, 1.1, 1.04, 0.96, 0.88, 0.8];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.2, 1.3, 0.0],
      [s * 0.7, 1.5, -0.1],
      [s * 1.15, 1.72, -0.2],
    ];
    const arm = b.chain(`wing${S}`, catmull(pts), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "wing",
    });
    const wrist = arm.joints[arm.joints.length - 1];
    const W = vec(pts[2]);
    const nrm = V(-s * Math.sin(24 * DEG), Math.cos(24 * DEG), 0);
    const prim = [1, 2, 3].map((g) =>
      b.joint(`primary${g}${S}`, { parent: wrist, at: W, dir: dirFrom(s, 5 + (g * 3 - 2) * 7.2, 24), role: "digit" }),
    );

    b.sweep(arm, [0.105, 0.04], {
      color: scales([RUBY, CRIM, MAGENTA], GOLD, { size: 0.045, width: 0.18, seed: 6 }),
      group: "wing",
    });
    b.spike(W, [s * 0.5, 0.3, 0.8], 0.11, 0.022, { color: GOLD, bone: wrist, sides: 6, group: "wing" });

    // secondaries along the arm (below), then primaries, then covert rows on top
    for (let i = 0; i < 9; i++) {
      const t = 0.92 - i * 0.09;
      const o = arm.at(t).at.clone().addScaledVector(nrm, -0.02 - 0.004 * i);
      const L = 0.85 - i * 0.035;
      const d = dirFrom(s, 58 + i * 5.2, 10 - i * 0.8);
      const bone = arm.joints[t < 0.5 ? 0 : 1];
      feather(bone, o, d, nrm, L, 0.15, featherPaint(L, VIOLET, COBALT, TEAL, i), "wing");
      const L2 = L * 0.42;
      feather(
        bone,
        arm.at(t).at.clone().addScaledVector(nrm, 0.016 + 0.004 * i),
        d,
        nrm,
        L2,
        0.14,
        featherPaint(L2, MAGENTA, RUBY, CRIM, i + 20),
        "wing",
      );
    }
    for (let i = 0; i < 9; i++) {
      const d = dirFrom(s, 5 + i * 7.2, 30 - i * 2.4);
      const bone = prim[Math.floor(i / 3)];
      feather(bone, W.clone().addScaledVector(nrm, 0.006 * i), d, nrm, PL[i], 0.15, featherPaint(PL[i], RUBY, AMBER, YELLOW, i), "wing");
      const c1 = PL[i] * 0.45;
      feather(
        bone,
        W.clone().addScaledVector(nrm, 0.016 + 0.006 * i).addScaledVector(d, 0.02),
        d,
        nrm,
        c1,
        0.15,
        featherPaint(c1, MAGENTA, RUBY, CRIM, i + 40),
        "wing",
      );
      const c2 = PL[i] * 0.22;
      feather(
        bone,
        W.clone().addScaledVector(nrm, 0.026 + 0.006 * i).addScaledVector(d, 0.02),
        d,
        nrm,
        c2,
        0.12,
        featherPaint(c2, AMBER, YELLOW, GOLD_L, i + 60),
        "wing",
      );
    }
    // wing-bend gem
    glow(b.part(new THREE.OctahedronGeometry(0.035), "#ff3050", { at: vec(pts[1]).add(V(0, 0.09, 0)), bone: arm.joints[1], flat: true, group: "wing" }), 1.2);
  }

  // ---- tail plumes ----------------------------------------------------
  const base = V(0, 0.79, -0.36);
  const angles = [-58, -40, -24, -10, 0, 10, 24, 40, 58];
  const tipsY = [0.5, 0.06, 0.34, 0.05, 0.42, 0.05, 0.34, 0.06, 0.5];
  angles.forEach((a, i) => {
    const L = 1.55 - Math.abs(a) * 0.004 + (i % 2) * 0.12;
    const W = 0.13;
    const h = V(Math.sin(a * DEG), 0, -Math.cos(a * DEG));
    const ty = tipsY[i];
    const o = base.clone().add(V(0, (i - 4) * 0.004, 0));
    const p1 = o.clone().addScaledVector(h, 0.3 * L).add(V(0, 0.04, 0));
    const p2 = o.clone().addScaledVector(h, 0.65 * L);
    p2.y = o.y * 0.4 + ty * 0.6 - 0.05;
    const p3 = o.clone().addScaledVector(h, 0.95 * L);
    p3.y = ty;
    const curve = bezier(o, p1, p2, p3);
    const A: THREE.Vector3[] = [];
    const B: THREE.Vector3[] = [];
    const N = 16;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const pt = curve.at(t);
      const tan = curve.tangentAt(t);
      let side = new THREE.Vector3().crossVectors(tan, V(0, 1, 0));
      if (side.lengthSq() < 1e-6) side = V(1, 0, 0);
      side.normalize();
      const w = plumeW(t, W);
      A.push(pt.clone().addScaledVector(side, w));
      B.push(pt.clone().addScaledVector(side, -w));
    }
    const warm = i % 2 === 1;
    const pnt = warm
      ? plumePaint(L, W, RUBY, CRIM, AMBER, [COBALT, TEAL, EMERALD])
      : plumePaint(L, W, EMERALD, TEAL, COBALT, [RUBY, AMBER, CRIM]);
    b.membrane(catmull(A), catmull(B), {
      color: pnt,
      thickness: 0.006,
      cols: 14,
      rows: 3,
      bone: Math.abs(a) < 5 ? tail : tail.joints[1],
      group: "tail",
    });
  });

  // ---- legs and feet --------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const F = V(s * 0.16, 0.33, 0.14);
    const pts = limb(V(s * 0.14, 0.78, -0.05), F, [0.26, 0.27, 0.2], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, polyline(pts), {
      parent: hips,
      names: [`thigh${S}`, `shin${S}`, `tarsus${S}`, `foot${S}`],
      role: "leg",
      contact: [F.x, 0.3, F.z],
    });
    const thighP = scales([RUBY, CRIM, AMBER], GOLD, { size: 0.04, width: 0.18, seed: 7 });
    const tarsusP = scales([GOLD, GOLD_L, "#d9a02f"], GOLD_D, { size: 0.03, width: 0.2, seed: 8 });
    const legSweep = b.sweep(leg, [0.085, 0.06, 0.04, 0.03, 0.03], {
      color: thighP,
      bands: [
        [0.42, thighP],
        [1, tarsusP],
      ],
      sides: 7,
      group: "legs",
    });
    b.cards(
      b.surface(legSweep).scatter(10, { rng: rng(30 + (s > 0 ? 0 : 1)), minDist: 0.04, filter: (h) => h.at.y > 0.6 }),
      [FT_RUBY, FT_AMBER],
      { size: [0.06, 0.1], lean: 60, flow: [0, -1, -0.1], rng: rng(31), vary: 0.2 },
    );
    const ankleDir = pts[3].clone().sub(pts[2]);
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 10), GOLD, {
      at: lerp(pts[2], pts[3], 0.4),
      dir: ankleDir,
      axis: "z",
      bone: leg.joints[2],
      group: "legs",
    });
    const foot = leg.joints[3];
    [-34, 0, 34, 180].forEach((a, k) => {
      const L = a === 180 ? 0.12 : 0.2;
      const d = V(Math.sin(a * DEG), 0, Math.cos(a * DEG));
      const tipP = F.clone().addScaledVector(d, L).add(V(0, -0.035, 0));
      const toe = b.chain(
        `toe${k}${S}`,
        polyline([F, F.clone().addScaledVector(d, L * 0.5).add(V(0, -0.012, 0)), tipP]),
        { parent: foot, names: [`toe${k}${S}a`, `toe${k}${S}b`, `toe${k}${S}c`], role: "digit" },
      );
      b.sweep(toe, [0.03, 0.016], { color: tarsusP, sides: 6, group: "legs" });
      b.spike(tipP, d.clone().multiplyScalar(0.9).add(V(0, -0.45, 0)), 0.08, 0.018, {
        color: TALON,
        bone: toe.joints[2],
        sides: 5,
        group: "legs",
      });
    });
  }

  // ---- ember bed ------------------------------------------------------
  const ASH = paint((p, n) => {
    const c = cells(p, 0.16, 3);
    const e = c.d2 - c.d1;
    const baseC = mix("#201718", "#4a3b3c", noise(p, 0.1, 2));
    if (e < 0.14 && n.y > 0) return mix("#ff6a1a", "#ffb03a", noise(p, 0.05, 4));
    if (e < 0.24) return mix(baseC, "#b8431c", 0.5);
    return baseC;
  });
  const mound = b.lathe(
    [
      [0, 0],
      [0.9, 0],
      [0.92, 0.05],
      [0.7, 0.16],
      [0.48, 0.26],
      [0.22, 0.3],
      [0, 0.3],
    ],
    { at: [0, 0, 0], bone: hips, color: ASH, segments: 10, group: "embers" },
  );
  const rr = rng(21);
  const EMBER_COLS = ["#ff5a1f", "#ff8a1f", "#ffc23a", "#ff3a1a"];
  for (const hit of b.surface(mound).scatter(44, { rng: rng(22), minDist: 0.1, filter: (h) => h.n.y > 0.15 })) {
    const r = 0.035 + rr() * 0.04;
    const col = EMBER_COLS[Math.floor(rr() * EMBER_COLS.length)];
    glow(b.stick(new THREE.DodecahedronGeometry(r, 0), col, hit, { embed: 0.45, flat: true, bone: hips, group: "embers" }), 1.4);
  }
  // charred logs around the base
  const LOG = mottle(CHAR, "#5a4036", { size: 0.06, seed: 5 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    b.rod(
      V(Math.cos(a) * 1.0, 0.06, Math.sin(a) * 1.0),
      V(Math.cos(a + 0.12) * 0.55, 0.2, Math.sin(a + 0.12) * 0.55),
      0.05,
      LOG,
      { sides: 6, bone: hips, group: "embers" },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.04, 6, 4), "#ff7a1f", {
        at: V(Math.cos(a) * 1.0, 0.06, Math.sin(a) * 1.0),
        bone: hips,
        group: "embers",
      }),
      1.4,
    );
  }
  // flame tongues licking around the mound
  const rf = rng(23);
  const flameFrames = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + rf() * 0.3;
    const r = 0.55 + rf() * 0.3;
    flameFrames.push(frame(V(Math.cos(a) * r, Math.max(0.05, 0.34 - 0.3 * r), Math.sin(a) * r), [0, 1, 0]));
  }
  glow(
    b.cards(flameFrames, FLAME, {
      size: [0.22, 0.4],
      lean: 15,
      bend: 20,
      flow: (f) => V(f.at.x, 0, f.at.z),
      cross: true,
      vary: 0.3,
      rng: rng(24),
      bone: hips,
    }),
    1.2,
  );
  // rising sparks
  const rs = rng(25);
  const sparkFrames = [];
  for (let i = 0; i < 22; i++) {
    const front = rs() > 0.45;
    const x = (rs() - 0.5) * 3.0;
    const z = front ? 0.6 + rs() * 0.8 : -1.9 + rs() * 0.7;
    let y = front ? 0.5 + rs() * 1.9 : 0.9 + rs() * 1.5;
    if (front && Math.abs(x) < 0.4 && y > 1.7) y = 1.2;
    sparkFrames.push(frame(V(x, y, z), [0, 1, 0]));
  }
  glow(b.cards(sparkFrames, SPARK, { size: 0.07, cross: true, vary: 0.4, rng: rng(26), bone: hips }), 1.4);

  return b.root;
}
