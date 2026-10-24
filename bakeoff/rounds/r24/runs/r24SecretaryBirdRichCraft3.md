```ts
import * as THREE from "three";
import {
  createBuilder,
  aim,
  catmull,
  polyline,
  bezier,
  limb,
  countershade,
  gradient,
  paint,
  scales,
  mottle,
  mix,
  resolve,
  smoothstep,
  rng,
  svg,
  lerp,
  offset,
} from "agentic-3js-builder";
import type { ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Secretary Bird Stomp",
  description:
    "A heroic, painterly secretary bird caught mid-stride, one foot raised and landing on a hissing teal snake. Black feather trousers, quill crest, red-orange face, half-spread wings and a long banded tail.",
};

const D2R = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------------------------------------------------
// Palette
const GREY = "#8da0b6";
const GREY_LIGHT = "#a9b9cc";
const CREAM = "#f3ead6";
const NAVY = "#1d1f2c";
const SLATE = "#454d60";
const HORN = "#e3d8b4";
const CERE = "#f7b52e";
const CLAW = "#2a2832";
const TONGUE = "#e8445e";
const FANG = "#fffaf0";
const WHITE = "#f6f3ea";

// ------------------------------------------------------------------------------------------------------------
// Paint helpers: warm light from above, cool bounce from below, in the spirit of hand-painted hero art.
const lit = (base: ColorInput, k = 1) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const up = smoothstep(-0.7, 0.9, n.y);
    const warm = smoothstep(0.2, 1, n.y) * 0.18 * k;
    const cool = (1 - up) * 0.22 * k;
    const shade = 0.76 + 0.32 * up;
    const shaded: [number, number, number] = [c[0] * shade, c[1] * shade, c[2] * shade];
    return mix(mix(shaded, [1, 0.88, 0.62], warm), [0.26, 0.33, 0.62], cool);
  });

const flightPaint = (L: number, root: string, tip: string) =>
  lit(
    paint((_p, _n, s) => {
      const t = Math.min(Math.max(s[0] / L, 0), 1);
      const c = mix(root, tip, smoothstep(0.1, 0.85, t));
      return Math.abs(s[1]) < 0.0035 ? mix(c, "#a9b4cc", 0.3) : c;
    }),
  );

const tailPaint = (L: number) =>
  lit(
    paint((_p, _n, s) => {
      const t = s[0] / L;
      let c = mix("#93a6bb", "#6b7c95", smoothstep(0, 0.5, t));
      c = mix(c, NAVY, smoothstep(0.5, 0.58, t));
      c = mix(c, WHITE, smoothstep(0.86, 0.9, t));
      return Math.abs(s[1]) < 0.003 ? mix(c, "#ffffff", 0.2) : c;
    }),
  );

const BODY = lit(scales(countershade(GREY, CREAM, { level: -0.1, soft: 0.45 }), "#667a92", { size: 0.045, width: 0.1, seed: 3 }));
const BODY_TINT = lit(countershade(GREY_LIGHT, CREAM, { level: -0.1, soft: 0.45 }));
const WING_COVERT = lit(scales([GREY, "#9aadc2", "#7f93aa"], "#566a82", { size: 0.04, width: 0.12, seed: 9 }));
const THIGH = lit(scales(["#252736", "#2e3144", "#1f212e"], "#0e0f17", { size: 0.04, width: 0.12, seed: 5 }));
const LEGP = lit(scales("#f2cf9e", "#c4895c", { size: 0.022, width: 0.14, seed: 8 }));
const MASK = lit(mottle("#f6642e", "#e03a2b", { size: 0.03, contrast: 0.9, seed: 4 }));
const BEAK_PAINT = (from: THREE.Vector3, to: THREE.Vector3) => lit(gradient(SLATE, HORN, from, to));
const SNAKE = lit(
  paint((_p, _n, s) => {
    const a = ((s[1] % 360) + 360) % 360;
    const d = a > 180 ? 360 - a : a;
    if (d > 118) return mix("#f8e9b4", "#e9c87a", 0.5 * (Math.sin(s[0] * 160) * 0.5 + 0.5));
    const u = (s[0] * 18) % 1;
    const v = d / 55 + Math.abs(u - 0.5) * 1.9;
    if (v < 0.7) return "#ffc03a";
    if (v < 0.95) return "#1b3f52";
    return mix("#2fb89b", "#82e0b0", smoothstep(60, 115, d) * 0.7);
  }),
);
const SNAKE_HEAD = lit(countershade("#27a58c", "#f6e6a8", { level: -0.2, soft: 0.3 }));

// ------------------------------------------------------------------------------------------------------------
// Textures
const FEATHER = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 63 C4 50 2 28 8 14 C10 8 13 3 16 1 C19 3 22 8 24 14 C30 28 28 50 16 63Z" fill="#f4f4f4" stroke="#8a8a8a" stroke-width="2"/>
  <path d="M16 62 L16 6" stroke="#b4b4b4" stroke-width="1.6"/>
  <path d="M16 22 L9 16 M16 32 L8 25 M16 42 L9 35 M16 22 L23 16 M16 32 L24 25 M16 42 L23 35" stroke="#cdcdcd" stroke-width="1.2"/>
</svg>`,
  { size: 128 },
);
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 63 C8 52 5 36 9 22 C10 14 13 7 16 1 C19 7 22 14 23 22 C27 36 24 52 16 63Z" fill="#f0f0f0" stroke="#7d7d7d" stroke-width="2"/>
  <path d="M16 60 L16 8" stroke="#a8a8a8" stroke-width="1.6"/>
  <path d="M9 22 L16 30 M23 22 L16 30 M8 36 L16 44 M24 36 L16 44" stroke="#c4c4c4" stroke-width="1.3"/>
</svg>`,
  { size: 128 },
);
const BIRD_EYE = svg(
  `<svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.45" cy="0.42" r="0.65"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.55" stop-color="#f7a823"/><stop offset="1" stop-color="#c2541a"/></radialGradient></defs>
  <ellipse cx="35" cy="44" rx="31" ry="34" fill="#1a1420"/>
  <ellipse cx="35" cy="44" rx="26" ry="30" fill="url(#i)"/>
  <ellipse cx="36" cy="47" rx="12" ry="15" fill="#140c18"/>
  <ellipse cx="26" cy="33" rx="7.5" ry="9" fill="#ffffff"/>
  <circle cx="44" cy="58" r="3.6" fill="#ffffff" opacity="0.9"/>
  <path d="M1 12 Q35 -3 69 24 L69 36 Q36 21 1 27Z" fill="#241626"/>
  <path d="M9 22 Q2 15 4 5" stroke="#1a1420" stroke-width="3.6" stroke-linecap="round" fill="none"/>
  <path d="M17 17 Q12 9 14 2" stroke="#1a1420" stroke-width="3.6" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);
const SNAKE_EYE = svg(
  `<svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="22" rx="28" ry="20" fill="#16201c"/>
  <ellipse cx="30" cy="22" rx="24" ry="16.5" fill="#ffd23a"/>
  <ellipse cx="30" cy="31" rx="22" ry="8" fill="#ff9a1f" opacity="0.7"/>
  <ellipse cx="31" cy="22" rx="4.2" ry="15" fill="#120d10"/>
  <ellipse cx="22" cy="14" rx="5" ry="3.4" fill="#ffffff"/>
  <path d="M2 12 Q30 -2 58 16 L58 22 Q30 8 2 20Z" fill="#12362f"/>
</svg>`,
  { size: 192 },
);

// ------------------------------------------------------------------------------------------------------------
const featherOutline = (L: number, W: number): [number, number][] => [
  [0, -W * 0.35],
  [L * 0.6, -W * 0.5],
  [L * 0.9, -W * 0.38],
  [L, -W * 0.12],
  [L, W * 0.12],
  [L * 0.9, W * 0.38],
  [L * 0.6, W * 0.5],
  [0, W * 0.35],
];
const paddleOutline = (L: number, W: number): [number, number][] => [
  [0, -W * 0.12],
  [L * 0.35, -W * 0.3],
  [L * 0.7, -W * 0.5],
  [L * 0.95, -W * 0.3],
  [L, 0],
  [L * 0.95, W * 0.3],
  [L * 0.7, W * 0.5],
  [L * 0.35, W * 0.3],
  [0, W * 0.12],
];

export default function build() {
  const b = createBuilder({ name: "secretary_bird", paintSize: 2048 });
  type Jt = ReturnType<typeof b.joint>;
  const R = rng(11);

  // ---------------------------------------------------------------------------------------------------------
  // Helpers
  const blob = (c: THREE.Vector3, sc: number[], color: ColorInput, bone: Jt, q?: THREE.Quaternion, seg = 12, rows = 8) =>
    b.part(new THREE.SphereGeometry(1, seg, rows), color, { bone, at: c, quat: q, scale: sc });

  const feather = (base: THREE.Vector3, d: THREE.Vector3, L: number, W: number, color: ColorInput, bone: Jt, th = 0.007) => {
    const x = d.clone().normalize();
    const y = V(0, 1, 0).cross(x).normalize();
    return b.extrude(featherOutline(L, W), { at: base, x, y, thickness: th, smoothing: 1, color, bone });
  };

  // ---------------------------------------------------------------------------------------------------------
  // Head frame (tilted down to eye the snake)
  const HC = V(0, 1.33, 0.5);
  const HF = V(0, -0.4, 1).normalize();
  const HU = V(0, 1, 0.4).normalize();
  const HQ = aim(HF, HU, "z");
  const hpt = (x: number, u: number, f: number) =>
    HC.clone().addScaledVector(V(1, 0, 0), x).addScaledVector(HU, u).addScaledVector(HF, f);

  // ---------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.86, -0.12] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.12],
      [0, 0.9, 0.05],
      [0, 0.97, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.87, -0.22],
      [0, 0.86, -0.45],
      [0, 0.82, -0.75],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.22],
      [0, 1.08, 0.25],
      [0, 1.19, 0.31],
      [0, 1.28, 0.4],
      [0, 1.32, 0.48],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1), dir: HF, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hpt(0, -0.03, -0.005), aim: hpt(0, -0.04, 0.12), role: "jaw" });

  // ---------------------------------------------------------------------------------------------------------
  // Body
  const body = b.loft(
    [
      { at: [0, 0.86, -0.34], w: 0.1, h: 0.1 },
      { at: [0, 0.88, -0.2], w: 0.26, h: 0.24 },
      { at: [0, 0.92, -0.02], w: 0.34, h: 0.32 },
      { at: [0, 0.99, 0.16], w: 0.32, h: 0.34 },
      { at: [0, 1.04, 0.27], w: 0.2, h: 0.24 },
    ],
    { bone: [tail, hips, spine], color: BODY },
  );
  b.sweep(neck, [0.064, 0.052, 0.044, 0.04, 0.04], { color: BODY });
  b.sweep(tail, [0.045, 0.03, 0.016], { color: BODY });

  const skin = b.surface(body);
  const backHits = skin.scatter(170, { rng: rng(21), minDist: 0.045, filter: (h) => h.n.y > -0.2 && h.at.z < 0.2 });
  b.cards(backHits, FEATHER, {
    size: [0.055, 0.09],
    lean: 68,
    bend: 25,
    vary: 0.25,
    spin: 12,
    rng: rng(22),
    color: BODY_TINT,
    flow: [0, -0.35, -1],
  });
  const chestHits = skin.scatter(70, { rng: rng(23), minDist: 0.04, filter: (h) => h.n.z > 0.35 && h.at.z > 0.05 });
  b.cards(chestHits, FEATHER, {
    size: [0.05, 0.085],
    lean: 62,
    bend: 20,
    vary: 0.2,
    rng: rng(24),
    color: "#f6eedb",
    flow: [0, -1, -0.2],
  });
  // neck ruff and throat fluff
  const ruffs: [number, number, number][] = [
    [0.06, 12, 0.058],
    [0.38, 10, 0.05],
    [0.7, 9, 0.045],
  ];
  ruffs.forEach(([t, count, radius], i) => {
    const items = b.ring(neck.at(t), { count, radius }).items;
    b.cards(items, TUFT, {
      size: [0.055, 0.1 - i * 0.015],
      lean: 62,
      vary: 0.2,
      rng: rng(31 + i),
      color: BODY_TINT,
      flow: [0, -1, -0.15],
    });
  });

  // ---------------------------------------------------------------------------------------------------------
  // Head
  const skull = blob(hpt(0, 0.005, -0.015), [0.062, 0.058, 0.072], BODY, head, HQ);
  const mask = blob(hpt(0, -0.01, 0.04), [0.064, 0.05, 0.062], MASK, head, HQ);
  blob(hpt(0, 0.0, 0.085), [0.034, 0.03, 0.03], CERE, head, HQ, 10, 6);
  for (const s of [1, -1]) blob(hpt(s * 0.016, 0.014, 0.1), [0.007, 0.006, 0.009], NAVY, head, HQ, 6, 4);

  // upper beak (hooked)
  const beakPts = [hpt(0, 0, 0.07), hpt(0, -0.005, 0.115), hpt(0, -0.025, 0.155), hpt(0, -0.062, 0.178), hpt(0, -0.095, 0.176)];
  b.sweep(catmull(beakPts), (t): [number, number] => [0.03 * Math.pow(1 - t, 0.9) + 0.007, 0.032 * Math.pow(1 - t, 0.9) + 0.007], {
    bone: head,
    color: BEAK_PAINT(hpt(0, -0.02, 0.15), hpt(0, -0.09, 0.176)),
    sides: 8,
  });
  // lower beak
  b.sweep(polyline([hpt(0, -0.035, 0.03), hpt(0, -0.04, 0.08), hpt(0, -0.045, 0.125)]), [0.025, 0.008], {
    bone: jaw,
    color: lit(gradient(SLATE, HORN, hpt(0, -0.04, 0.08), hpt(0, -0.045, 0.125))),
    sides: 8,
  });
  blob(hpt(0, -0.022, 0.08), [0.014, 0.006, 0.05], TONGUE, jaw, HQ, 8, 5);

  // eyes + brows
  const maskSurf = b.surface(mask);
  for (const s of [1, -1]) {
    const eyeHit = maskSurf.around(mask.at).at(s * 64, 0)!;
    glow(
      b.decal(maskSurf, BIRD_EYE, { at: eyeHit, size: [0.066, 0.075], mirror: s > 0 }),
      0.55,
    );
    const hin = maskSurf.around(mask.at).at(s * 14, 47)!;
    const hmid = maskSurf.around(mask.at).at(s * 42, 54)!;
    const hout = maskSurf.around(mask.at).at(s * 74, 58)!;
    const pts = [hin, hmid, hout].map((h) => offset(h.at, h.n, 0.004));
    b.sweep(catmull(pts), [0.012, 0.007], { bone: head, color: lit(NAVY), sides: 6 });
  }

  // crest of quill plumes
  const crestN = 9;
  const stemPaint = lit("#6f7e95");
  for (let i = 0; i < crestN; i++) {
    const k = (i / (crestN - 1)) * 2 - 1;
    const c = 1 - Math.abs(k);
    const base = hpt(k * 0.04, 0.03 + 0.015 * c, -0.045);
    const L = 0.2 + 0.1 * c + 0.03 * R();
    const d = V(k * 0.55, 0.38 + 0.45 * c + 0.1 * R(), -1).normalize();
    const p1 = base.clone().addScaledVector(d, L * 0.55).add(V(0, 0.035, 0));
    const p2 = base.clone().addScaledVector(d, L).add(V(0, -0.03 - 0.03 * (1 - c), 0));
    const stem = bezier(base, p1, p2);
    b.sweep(stem, [0.0055, 0.0025], { bone: head, color: stemPaint, sides: 6 });
    const T = stem.tangentAt(1).clone().normalize();
    const tipP = stem.at(1);
    const yAx = V(0, 1, 0).addScaledVector(T, -T.y).normalize();
    b.extrude(paddleOutline(0.11, 0.034), {
      at: tipP.clone().addScaledVector(T, -0.03),
      x: T,
      y: yAx,
      thickness: 0.007,
      smoothing: 1,
      color: flightPaint(0.11, "#2b2e3d", "#0c0d14"),
      bone: head,
    });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Wings (half spread for balance)
  const primPaint = flightPaint(0.38, "#454c63", "#111218");
  const secPaint = flightPaint(0.3, "#5a677f", "#15161f");
  const covPaint = flightPaint(0.17, "#93a7bd", "#4a5870");
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const sh = V(s * 0.16, 1.0, 0.08);
    const el = V(s * 0.33, 1.01, -0.1);
    const wr = V(s * 0.52, 1.03, 0.0);
    const ht = V(s * 0.64, 1.03, 0.1);
    const arm = b.chain(`arm${sd}`, catmull([sh, el, wr, ht]), {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    b.sweep(arm, [0.055, 0.045, 0.036, 0.026, 0.016], { color: WING_COVERT });
    const elbowJ = arm.joints[1];
    const wristJ = arm.joints[2];
    // secondaries and their coverts
    for (let i = 0; i < 8; i++) {
      const u = (i + 0.5) / 8;
      const base = lerp(el, wr, u);
      const d = V(s * (0.15 + 0.25 * u), -0.12, -1);
      const L = 0.26 + 0.05 * Math.sin(u * Math.PI);
      feather(base.clone().add(V(0, i * 0.0015, 0)), d, L, 0.062, secPaint, elbowJ);
      feather(base.clone().add(V(0, 0.012 + i * 0.0015, 0)), d, 0.16 + 0.02 * Math.sin(u * Math.PI), 0.058, covPaint, elbowJ, 0.006);
    }
    // primaries and coverts
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const base = lerp(wr, ht, u);
      const th = (55 + u * 50) * D2R;
      const d = V(s * Math.sin(th), -0.05 - 0.05 * u, -Math.cos(th));
      const L = 0.32 + 0.07 * Math.sin(Math.PI * (0.25 + 0.6 * u));
      feather(base.clone().add(V(0, i * 0.0015, 0)), d, L, 0.055, primPaint, wristJ);
      feather(base.clone().add(V(0, 0.012 + i * 0.0015, 0)), d, 0.16, 0.05, covPaint, wristJ, 0.006);
    }
  }

  // ---------------------------------------------------------------------------------------------------------
  // Tail fan: two long banded central plumes flanked by shorter ones
  const tailBase = V(0, 0.865, -0.3);
  const tailSpec: [number, number][] = [
    [1.5, 0.8],
    [9, 0.66],
    [18, 0.54],
    [28, 0.42],
    [38, 0.3],
  ];
  const tailPaints = new Map<string, ReturnType<typeof tailPaint>>();
  tailSpec.forEach(([yaw, L], idx) => {
    const key = L.toFixed(2);
    if (!tailPaints.has(key)) tailPaints.set(key, tailPaint(L));
    for (const s of [1, -1]) {
      const a = yaw * D2R;
      const d = V(s * Math.sin(a), -0.1, -Math.cos(a));
      const base = tailBase.clone().add(V(s * 0.012, idx * 0.003, 0));
      feather(base, d, L, 0.075 - idx * 0.004, tailPaints.get(key)!, tail.joints[0], 0.008);
    }
  });

  // ---------------------------------------------------------------------------------------------------------
  // Legs: stance leg behind, the left foot landing on the snake
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const stomp = s > 0;
    const hipP = V(s * 0.1, 0.82, -0.04);
    const tgt = stomp ? V(0.1, 0.125, 0.4) : V(-0.1, 0.038, -0.2);
    const pts = limb(hipP, tgt, [0.2, 0.34, 0.32], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${sd}`, polyline(pts), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
      contact: [tgt.x, 0, tgt.z],
    });
    const thigh = b.sweep(leg, [0.065, 0.1, 0.1, 0.082, 0.058, 0.042], { from: 0, to: 0.5, color: THIGH });
    b.sweep(leg, [0.027, 0.021, 0.019, 0.02, 0.022], { from: 0.44, to: 1, color: LEGP, sides: 8 });
    blob(pts[2], [0.03, 0.03, 0.03], LEGP, leg.joints[2], undefined, 8, 6);

    // feather trousers: tufts over the thigh and a fringe at the cuff
    const tHits = b.surface(thigh).scatter(34, { rng: rng(40 + (stomp ? 1 : 2)), minDist: 0.035, filter: (h) => h.n.y > -0.3 });
    b.cards(tHits, FEATHER, { size: [0.055, 0.09], lean: 62, bend: 20, vary: 0.2, rng: rng(44), color: "#23252f", flow: [0, -1, -0.1] });
    const fringe = b.ring(leg.at(0.46), { count: 11, radius: 0.058 }).items;
    b.cards(fringe, TUFT, { size: [0.05, 0.12], lean: 72, vary: 0.2, rng: rng(45), color: "#1a1c26", flow: [0, -1, -0.05] });

    // foot: pad, three front toes, hind toe, claws
    blob(tgt, [0.03, 0.016, 0.03], LEGP, leg.joints[3], undefined, 8, 5);
    const dm = stomp ? 0.014 : 0.012;
    const dt = stomp ? 0.09 : 0.02;
    const toes = [
      { n: 1, yaw: -27, len: 0.15 },
      { n: 2, yaw: 0, len: 0.18 },
      { n: 3, yaw: 27, len: 0.15 },
    ];
    for (const t of toes) {
      const d = V(Math.sin(t.yaw * D2R), 0, Math.cos(t.yaw * D2R));
      const p1 = tgt.clone().addScaledVector(d, t.len * 0.5).add(V(0, -dm, 0));
      const p2 = tgt.clone().addScaledVector(d, t.len).add(V(0, -dt, 0));
      const toe = b.chain(`toe${t.n}${sd}`, polyline([tgt, p1, p2]), {
        parent: leg,
        names: [`toe${t.n}${sd}a`, `toe${t.n}${sd}b`],
        role: "digit",
      });
      b.sweep(toe, [0.019, 0.012], { color: LEGP, sides: 6 });
      const cd = p2.clone().sub(p1).normalize().add(V(0, -0.5, 0)).normalize();
      b.spike(p2, cd, 0.045, 0.011, { color: CLAW, bone: toe.joints[1], sides: 6 });
    }
    {
      const d = V(0, 0, -1);
      const p1 = tgt.clone().addScaledVector(d, 0.045).add(V(0, -dm, 0));
      const p2 = tgt.clone().addScaledVector(d, 0.09).add(V(0, -dt * 0.7 - 0.01, 0));
      const hal = b.chain(`toe4${sd}`, polyline([tgt, p1, p2]), {
        parent: leg,
        names: [`toe4${sd}a`, `toe4${sd}b`],
        role: "digit",
      });
      b.sweep(hal, [0.018, 0.011], { color: LEGP, sides: 6 });
      const cd = p2.clone().sub(p1).normalize().add(V(0, -0.5, 0)).normalize();
      b.spike(p2, cd, 0.04, 0.01, { color: CLAW, bone: hal.joints[1], sides: 6 });
    }
  }

  // ---------------------------------------------------------------------------------------------------------
  // The snake, pinned under the stomping foot and rearing up to hiss
  const snakePts: number[][] = [
    [-0.45, 0.014, 0.4],
    [-0.3, 0.028, 0.6],
    [-0.1, 0.04, 0.52],
    [0.1, 0.046, 0.5],
    [0.27, 0.048, 0.62],
    [0.32, 0.05, 0.82],
    [0.24, 0.1, 0.98],
    [0.16, 0.28, 1.02],
    [0.14, 0.46, 0.97],
    [0.13, 0.55, 0.9],
  ];
  const snake = b.chain("snake", catmull(snakePts), { parent: hips, count: 10, role: "tentacle" });
  b.sweep(snake, (t) => 0.012 + 0.034 * smoothstep(0, 0.3, t) - 0.014 * smoothstep(0.82, 1, t), { color: SNAKE });
  const sh = snake.joints[snake.joints.length - 1];

  const J = V(0.13, 0.55, 0.9);
  const SF = V(-0.15, 0.22, -1).normalize();
  const SU = V(0, 1, 0).addScaledVector(SF, -SF.y).normalize();
  const SQ = aim(SF, SU, "z");
  const SC = J.clone().addScaledVector(SF, 0.05);
  const sHead = blob(SC.clone().addScaledVector(SU, 0.012), [0.04, 0.026, 0.065], SNAKE_HEAD, sh, SQ);
  // roof of the mouth
  blob(SC.clone().addScaledVector(SU, -0.004).addScaledVector(SF, 0.005), [0.03, 0.008, 0.05], "#d8405a", sh, SQ, 8, 5);
  const sjaw = b.joint("snakeJaw", {
    parent: sh,
    at: SC.clone().addScaledVector(SU, -0.012).addScaledVector(SF, -0.03),
    dir: SF,
    role: "jaw",
  });
  blob(SC.clone().addScaledVector(SU, -0.018).addScaledVector(SF, 0.012), [0.033, 0.011, 0.055], SNAKE_HEAD, sjaw, SQ);
  blob(SC.clone().addScaledVector(SU, -0.006).addScaledVector(SF, 0.02), [0.016, 0.005, 0.04], TONGUE, sjaw, SQ, 8, 4);
  // fangs
  for (const s of [1, -1]) {
    const fb = SC.clone().addScaledVector(SU, -0.004).addScaledVector(SF, 0.05).add(V(s * 0.02, 0, 0));
    b.spike(fb, SU.clone().multiplyScalar(-1).addScaledVector(SF, 0.2).normalize(), 0.042, 0.008, { color: FANG, bone: sh, sides: 6 });
  }
  // forked tongue
  const tb = SC.clone().addScaledVector(SF, 0.06).addScaledVector(SU, -0.014);
  const tm = tb.clone().addScaledVector(SF, 0.07);
  b.rod(tb, tm, 0.004, TONGUE, { bone: sjaw, sides: 6 });
  for (const s of [1, -1]) {
    b.spike(tm, SF.clone().add(V(s * 0.5, 0, 0)).normalize(), 0.045, 0.004, { color: TONGUE, bone: sjaw, sides: 6 });
  }
  // eyes and angry ridges
  const sSurf = b.surface(sHead);
  for (const s of [1, -1]) {
    const eh = sSurf.around(sHead.at).at(180 - s * 48, 28)!;
    glow(b.decal(sSurf, SNAKE_EYE, { at: eh, size: [0.04, 0.03], mirror: s > 0 }), 0.5);
    const bi = sSurf.around(sHead.at).at(180 - s * 28, 52)!;
    const bo = sSurf.around(sHead.at).at(180 - s * 72, 40)!;
    b.sweep(catmull([offset(bi.at, bi.n, 0.003), offset(bo.at, bo.n, 0.003)]), [0.007, 0.005], {
      bone: sh,
      color: lit("#16463c"),
      sides: 6,
    });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Final rest-pose touches: both mouths open
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });
  b.pose(sjaw, { axis: [-1, 0, 0], deg: 30 });

  return b.root;
}
```