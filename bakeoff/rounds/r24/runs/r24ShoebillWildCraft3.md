```ts
// STYLE: "Gilded Tomb Painting". The shoebill of the Nile papyrus swamps is rendered as a
// funerary-art statuette from ancient Egypt. It has flat lapis, turquoise, red-ochre and gold pigment
// on slate-blue "rishi" scale plumage, kohl outlines, a gilded bill with painted chevron bands,
// a broad beaded usekh collar with a winged-scarab pectoral, a wedjat-style kohl-lined eye,
// a lotus on the crown, and a hieroglyph cartouche on each flank. Wing feathers are painted in
// rows (slate, lapis, turquoise, gold-tipped lapis) as in a tomb ceiling.
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  paint,
  scales,
  countershade,
  noise,
  svg,
} from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Shoebill Stork, Gilded Tomb Painting",
  description:
    "A shoebill stork as an Egyptian funerary-art statuette: slate scale plumage, gilded striped bill, beaded usekh collar with a winged scarab, lotus crown, kohl-lined eyes and painted lapis/turquoise/gold wing rows.",
};

// ------------------------------------------------------------------ palette
const KOHL = "#17131c";
const KOHL_SOFT = "#2b2f45";
const LAPIS = "#2a4a96";
const LAPIS_DK = "#1b2f66";
const TURQ = "#27b3a4";
const RED = "#b8412b";
const GOLD = "#e0a826";
const GOLD_LT = "#f6d46a";
const GOLD_DK = "#9a6c1a";
const CREAM = "#efe4c4";
const BONE = "#e9dcb4";
const SLATE = "#6f87a3";
const SLATE_DK = "#4e6584";
const SLATE_LT = "#93a9bf";
const CLOUD = "#cfd6dc";
const LEG = "#2b2733";
const HOOK = "#3a2414";
const RUST = "#9b4a22";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ paints
const GILT = metal("gilt", { size: 0.05, polish: 0.35 });
const SLATE_SCALES = scales([SLATE, SLATE_DK, "#7c93ad"], KOHL_SOFT, { size: 0.05, width: 0.09, seed: 3 });
const PALE_SCALES = scales([CLOUD, "#c1c9d2", "#d9d8cf"], KOHL_SOFT, { size: 0.05, width: 0.09, seed: 3 });
const PLUMAGE = countershade(SLATE_SCALES, PALE_SCALES, { level: -0.45, soft: 0.25 });
const HEADP = countershade(
  scales([SLATE_LT, SLATE, "#a7b8c9"], KOHL_SOFT, { size: 0.03, width: 0.1, seed: 8 }),
  scales([CLOUD, "#d9d8cf"], KOHL_SOFT, { size: 0.03, width: 0.1, seed: 8 }),
  { level: -0.3, soft: 0.3 },
);
const LEG_SCALES = scales(["#2c2834", "#3b3646", "#241f2b"], "#0e0b12", { size: 0.022, width: 0.12, seed: 5 });
const LEGP = paint((p, n, _s) => (p.y > 0.44 + 0.02 * Math.abs(Math.sin((p.x + p.z) * 140)) ? PLUMAGE : LEG_SCALES));

// Gilded bill: gold, painted chevron band near the base, rusty streaks along the length.
const BILLP = paint((p, n, s) => {
  const t = s[0];
  if (t > 0.27 && t < 0.285) return KOHL;
  if (t >= 0.285 && t < 0.34) {
    const k = Math.floor((s[1] + 720) / 18);
    return k % 2 ? TURQ : CREAM;
  }
  if (t >= 0.34 && t < 0.355) return KOHL;
  const q = new THREE.Vector3(p.x * 5, p.y * 5, p.z * 0.8);
  const st = noise(q, 0.06, 4);
  if (st > 0.72) return HOOK;
  if (st > 0.62) return RUST;
  return n.y < -0.6 ? GOLD_DK : GILT;
});

// ------------------------------------------------------------------ textures
const stroke2 = (d: string, c: string, w: number) =>
  `<path d="${d}" fill="none" stroke="${KOHL}" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// A wedjat-like eye: pale yellow staring iris, kohl cosmetic line, lapis brow, falcon-mark tear.
// Drawn as the model's LEFT eye (outer corner on the right).
const EYE = svg(
  `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 30 Q50 -2 114 20 L114 32 Q56 14 10 44Z" fill="${LAPIS}" stroke="${KOHL}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M10 56 Q55 28 100 54 Q55 84 10 56Z" fill="${CREAM}" stroke="${KOHL}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M100 54 Q110 56 118 62" fill="none" stroke="${KOHL}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="55" cy="55" r="21" fill="#f4e06a" stroke="${KOHL}" stroke-width="3.5"/>
    <circle cx="55" cy="55" r="13" fill="${GOLD}" opacity="0.55"/>
    <circle cx="55" cy="55" r="9" fill="${KOHL}"/>
    <circle cx="48" cy="48" r="4.2" fill="#ffffff"/>
    <path d="M52 77 L48 90 Q46 98 54 98 Q61 98 61 91" fill="none" stroke="${KOHL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const CARTOUCHE = svg(
  `<svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="54" height="134" rx="27" fill="${CREAM}" stroke="${KOHL}" stroke-width="3"/>
    <rect x="8" y="8" width="44" height="124" rx="22" fill="none" stroke="${RED}" stroke-width="2.5"/>
    <circle cx="30" cy="27" r="9" fill="${RED}" stroke="${KOHL}" stroke-width="2.5"/>
    <circle cx="30" cy="27" r="2.6" fill="${GOLD}"/>
    ${stroke2("M16 50l7-5 7 5 7-5 7 5", LAPIS, 3)}
    ${stroke2("M16 60l7-5 7 5 7-5 7 5", LAPIS, 3)}
    <ellipse cx="30" cy="82" rx="6" ry="8" fill="none" stroke="${KOHL}" stroke-width="7"/>
    <ellipse cx="30" cy="82" rx="6" ry="8" fill="none" stroke="${TURQ}" stroke-width="3.5"/>
    ${stroke2("M30 90V116", TURQ, 3.5)}
    ${stroke2("M20 100H40", TURQ, 3.5)}
    <path d="M22 128h16" stroke="${KOHL}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const LOTUS = svg(
  `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 84 Q2 66 6 30 Q34 48 40 84Z" fill="${TURQ}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M42 84 Q78 66 74 30 Q46 48 40 84Z" fill="${TURQ}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M36 86 Q20 60 28 20 Q44 52 41 86Z" fill="${LAPIS}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M44 86 Q60 60 52 20 Q36 52 39 86Z" fill="${LAPIS}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M40 86 Q22 50 40 6 Q58 50 40 86Z" fill="${LAPIS_DK}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M40 80 Q34 50 40 16" fill="none" stroke="${GOLD_LT}" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M26 90 Q40 98 54 90" fill="none" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const SCARAB = svg(
  `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg">
    <g id="w"><path d="M45 36 Q30 14 4 22 Q14 27 8 32 Q18 33 14 41 Q30 42 45 42Z" fill="${GOLD}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M42 36 Q28 24 12 28 M42 40 Q26 36 16 38" fill="none" stroke="${LAPIS}" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(100 0) scale(-1 1)"><path d="M45 36 Q30 14 4 22 Q14 27 8 32 Q18 33 14 41 Q30 42 45 42Z" fill="${GOLD}" stroke="${KOHL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M42 36 Q28 24 12 28 M42 40 Q26 36 16 38" fill="none" stroke="${LAPIS}" stroke-width="2.4" stroke-linecap="round"/></g>
    <ellipse cx="50" cy="40" rx="9" ry="13" fill="${LAPIS}" stroke="${KOHL}" stroke-width="2.5"/>
    <path d="M50 28V53" stroke="${KOHL}" stroke-width="2"/>
    <circle cx="50" cy="15" r="9" fill="${RED}" stroke="${KOHL}" stroke-width="2.5"/>
    <circle cx="50" cy="15" r="2.8" fill="${GOLD_LT}"/>
  </svg>`,
  { size: 192 },
);

const plume = (fill: string, hi: string) =>
  svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 C34 14 38 38 30 50 Q20 63 20 63 Q20 63 10 50 C2 38 6 14 20 2Z" fill="${fill}" stroke="${KOHL}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M20 9 C28 19 30 36 25 48" fill="none" stroke="${hi}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M20 12 L20 60" stroke="${KOHL}" stroke-width="1.8"/>
    </svg>`,
    { size: 128 },
  );
const PLUME_A = plume(SLATE_DK, SLATE_LT);
const PLUME_B = plume(LAPIS, TURQ);

// ------------------------------------------------------------------ helpers
const keyed = (k: number[][]) => (t: number) => {
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const a = k[i - 1];
      const c = k[i];
      const u = (t - a[0]) / (c[0] - a[0]);
      return a[1] + (c[1] - a[1]) * (u * u * (3 - 2 * u));
    }
  }
  return k[k.length - 1][1];
};

const outlineCache = new Map<string, [number, number][]>();
function leaf(L: number, W: number): [number, number][] {
  const key = `${L.toFixed(3)}/${W.toFixed(3)}`;
  let o = outlineCache.get(key);
  if (!o)
    outlineCache.set(
      key,
      (o = [
        [0, -0.22 * W],
        [0.3 * L, -0.5 * W],
        [0.82 * L, -0.48 * W],
        [L, -0.18 * W],
        [L, 0.18 * W],
        [0.82 * L, 0.48 * W],
        [0.3 * L, 0.5 * W],
        [0, 0.22 * W],
      ]),
    );
  return o;
}

const fpCache = new Map<string, ReturnType<typeof paint>>();
// A painted feather: base colour, kohl-edged band, kohl divider and a coloured tip, with a cream quill line.
function featherPaint(L: number, base: string, tip: string, band: string) {
  const key = `${Math.round(L * 50)}${base}${tip}${band}`;
  let p = fpCache.get(key);
  if (!p) {
    p = paint((_p, _n, s) => {
      const u = s[0] / L;
      if (Math.abs(s[1]) < 0.0028 && u > 0.1 && u < 0.95) return CREAM;
      if (u > 0.86) return tip;
      if (u > 0.81) return KOHL;
      if (u > 0.7 && u < 0.73) return KOHL;
      if (u > 0.62 && u <= 0.7) return band;
      if (u > 0.59 && u <= 0.62) return KOHL;
      return base;
    });
    fpCache.set(key, p);
  }
  return p;
}

// ------------------------------------------------------------------ model
export default function build() {
  const b = createBuilder({ name: "shoebill", paintSize: 2048 });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.64, -0.14], dir: [0, 0.3, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.64, -0.14],
      [0, 0.75, 0.0],
      [0, 0.87, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.87, 0.12],
      [0, 0.97, 0.1],
      [0, 1.07, 0.12],
      [0, 1.14, 0.18],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neck.at(1),
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });
  const hq = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hq(0.035, -0.05),
    aim: hq(0.3, -0.14),
    role: "jaw",
    group: "head",
  });

  const tailPath = catmull([
    [0, 0.62, -0.22],
    [0, 0.57, -0.36],
    [0, 0.5, -0.5],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // ---------------------------------------------------------------- torso, neck, tail
  const torsoPath = catmull([
    [0, 0.6, -0.27],
    [0, 0.66, -0.12],
    [0, 0.76, 0.02],
    [0, 0.88, 0.12],
  ]);
  const rx = keyed([[0, 0.045], [0.2, 0.1], [0.5, 0.125], [0.8, 0.115], [1, 0.078]]);
  const ry = keyed([[0, 0.05], [0.2, 0.1], [0.5, 0.125], [0.8, 0.12], [1, 0.085]]);
  const torso = b.sweep(torsoPath, (t) => [rx(t), ry(t)], { bone: [tail, hips, spine], color: PLUMAGE, group: "body" });
  const neckTube = b.sweep(neck, (t) => 0.075 - 0.02 * t, { color: PLUMAGE, group: "body" });
  b.sweep(tail, (t) => 0.055 * (1 - t) + 0.02, { color: PLUMAGE, group: "tail" });

  // plume cards break the silhouette with painted rishi feathers
  const bodySkin = b.surface(torso);
  b.cards(
    bodySkin.scatter(90, { rng: rng(11), minDist: 0.04, filter: (h) => h.n.y > -0.2 && h.at.z < 0.16 }),
    [PLUME_A, PLUME_B, PLUME_A],
    { size: [0.045, 0.075], lean: 62, bend: 20, vary: 0.25, spin: 10, rng: rng(5) },
  );
  b.cards(
    b.surface(neckTube).scatter(34, { rng: rng(12), minDist: 0.035, filter: (h) => h.n.y > -0.3 }),
    [PLUME_A, PLUME_A, PLUME_B],
    { size: [0.04, 0.065], lean: 60, bend: 20, vary: 0.2, spin: 10, rng: rng(6) },
  );

  // ---------------------------------------------------------------- feather helper
  function feather(
    bone: any,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    L: number,
    W: number,
    color: any,
    o: { lift?: number; wide?: THREE.Vector3; thick?: number } = {},
  ) {
    const x = dir.clone().normalize();
    const w = o.wide ?? V(0, 1, 0).cross(x);
    const y = w.clone().addScaledVector(x, -w.dot(x)).normalize();
    const at = base.clone();
    at.y += o.lift ?? 0;
    const th = o.thick ?? 0.006;
    return b.extrude(leaf(L, W), {
      at,
      x,
      y,
      thickness: th,
      bevel: th * 0.3,
      smoothing: 1,
      color,
      bone,
    });
  }

  // ---------------------------------------------------------------- tail fan
  for (let i = 0; i < 7; i++) {
    const phi = ((i - 3) / 3) * 36 * (Math.PI / 180);
    const L = 0.3 - 0.02 * Math.abs(i - 3);
    const base = tailPath.at(0.42);
    feather(
      tail.joints[1],
      base,
      V(Math.sin(phi), -0.3, -Math.cos(phi)),
      L,
      0.08,
      featherPaint(L, i % 2 ? LAPIS : LAPIS_DK, GOLD, TURQ),
      { lift: (i % 3) * 0.007 },
    );
  }

  // ---------------------------------------------------------------- head
  const C = hq(0.03, 0.035);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    at: C,
    scale: [0.082, 0.078, 0.092],
    group: "head",
    name: "skull",
  });
  const skullSkin = b.surface(skull);

  // gilded bill: upper mandible on the head, lower mandible on the jaw
  const upperSt: number[][] = [
    [0.05, -0.012, 0.1, 0.09],
    [0.11, -0.022, 0.12, 0.105],
    [0.18, -0.045, 0.125, 0.115],
    [0.24, -0.075, 0.1, 0.095],
    [0.29, -0.108, 0.062, 0.062],
    [0.315, -0.13, 0.03, 0.03],
  ];
  const lowerSt: number[][] = [
    [0.05, -0.062, 0.09, 0.04],
    [0.12, -0.082, 0.1, 0.05],
    [0.19, -0.1, 0.095, 0.055],
    [0.25, -0.128, 0.07, 0.05],
    [0.29, -0.152, 0.04, 0.035],
  ];
  const upper = b.loft(
    upperSt.map(([f, u, w, h]) => ({ at: hq(f, u), w, h })),
    { bone: head, color: BILLP, group: "bill", name: "billUpper" },
  );
  b.loft(
    lowerSt.map(([f, u, w, h]) => ({ at: hq(f, u), w, h })),
    { bone: jaw, color: BILLP, group: "bill", name: "billLower" },
  );
  // culmen ridge and the dark hooked nail
  b.sweep(
    catmull(upperSt.slice(1, 5).map(([f, u, _w, h]) => hq(f, u + h * 0.5 - 0.004))),
    [0.011, 0.006],
    { bone: head, color: GOLD_LT, caps: { start: "flat", end: "point" }, group: "bill" },
  );
  b.spike(hq(0.283, -0.112), hq(0.312, -0.192), null, 0.032, { bone: head, color: HOOK, group: "bill" });
  // painted seam where the mandibles meet
  for (const s of [1, -1]) {
    const pts = upperSt.slice(1).map(([f, u, w, h]) => hq(f, u - h * 0.17, s * w * 0.46));
    b.sweep(catmull(pts), [0.006, 0.004], { bone: head, color: KOHL, group: "bill" });
    // nostril slit
    const nh = b.surface(upper).nearest(hq(0.1, 0.045, s * 0.03));
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), KOHL, nh, { embed: 0.3, scale: [1.2, 0.5, 2.4] });
  }

  // eyes: a forward stare under a lapis brow
  for (const s of [1, -1]) {
    const hit = skullSkin.around(C).at(s * 48, 38)!;
    const eye = b.decal(skull, EYE, {
      at: hit,
      dir: [s * 0.35, 0.15, 0.92],
      size: [0.062, 0.052],
      mirror: s < 0,
      roll: s * -6,
      group: "head",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    glow(eye, 0.55);
  }
  // lotus on the crown
  const crown = skullSkin.around(C).at(0, 76)!;
  b.decal(skull, LOTUS, { at: crown, up: [0, 0, 1], size: [0.05, 0.06], group: "head", name: "lotus" });

  // nape crest: a few broad painted blades
  for (let i = -2; i <= 2; i++) {
    const L = 0.14 - 0.014 * Math.abs(i);
    feather(
      head,
      hq(-0.06, 0.07 - 0.004 * Math.abs(i), 0),
      V(i * 0.3, 0.42 - 0.08 * Math.abs(i), -1),
      L,
      0.036,
      featherPaint(L, i % 2 ? LAPIS : LAPIS_DK, GOLD, TURQ),
      { wide: V(0, 1, 0), thick: 0.005 },
    );
  }

  // ---------------------------------------------------------------- usekh collar
  const K = 0.72;
  const collarC = V(0, 0.875, 0.135);
  const collarAxis = V(0, 0.8, 0.6).normalize();
  const cu = V(1, 0, 0);
  const cv = collarAxis.clone().cross(cu).normalize();
  const COLLAR = paint((p, n) => {
    if (n.dot(collarAxis) < -0.2) return GOLD_DK;
    const d = p.clone().sub(collarC);
    const x = d.dot(cu);
    const y = d.dot(cv);
    const r = Math.hypot(x, y) / K;
    const k = Math.floor(((Math.atan2(y, x) + Math.PI) / (Math.PI * 2)) * 36);
    if (r < 0.072) return GOLD;
    if (r < 0.08) return GOLD_LT;
    if (r < 0.084) return KOHL;
    if (r < 0.112) return k % 2 ? TURQ : LAPIS;
    if (r < 0.117) return KOHL;
    if (r < 0.14) return k % 2 ? RED : GOLD;
    if (r < 0.145) return KOHL;
    if (r < 0.176) return k % 2 ? LAPIS : TURQ;
    if (r < 0.182) return KOHL;
    if (r < 0.205) return GOLD;
    return TURQ;
  });
  const collar = b.lathe(
    [
      [0.064 * K, 0.03 * K],
      [0.1 * K, 0.018 * K],
      [0.16 * K, -0.025 * K],
      [0.21 * K, -0.085 * K],
      [0.222 * K, -0.105 * K],
      [0.205 * K, -0.112 * K],
      [0.15 * K, -0.065 * K],
      [0.09 * K, -0.012 * K],
      [0.064 * K, -0.004 * K],
    ],
    { at: collarC, axis: collarAxis, bone: neck.joints[0], segments: 16, color: COLLAR, group: "collar" },
  );
  const DROP: [number, number][] = [
    [0, -0.011],
    [0.022, -0.016],
    [0.042, -0.009],
    [0.056, 0],
    [0.042, 0.009],
    [0.022, 0.016],
    [0, 0.011],
  ];
  const dropColors = [LAPIS, TURQ, RED];
  for (let k = 0; k < 18; k++) {
    const ang = (k / 18) * Math.PI * 2 + Math.PI / 18;
    const rad = cu.clone().multiplyScalar(Math.cos(ang)).addScaledVector(cv, Math.sin(ang));
    const tan = cu.clone().multiplyScalar(-Math.sin(ang)).addScaledVector(cv, Math.cos(ang));
    const base = collarC.clone().addScaledVector(rad, 0.205 * K).addScaledVector(collarAxis, -0.108 * K);
    const x = rad.clone().multiplyScalar(0.76).addScaledVector(collarAxis, -0.65).normalize();
    b.extrude(DROP, {
      at: base,
      x,
      y: tan,
      thickness: 0.007,
      smoothing: 1,
      color: dropColors[k % 3],
      bone: neck.joints[0],
      group: "collar",
    });
  }
  const pend = b.surface(collar).around(collarC).at(0, -32);
  if (pend) b.decal(collar, SCARAB, { at: pend, size: [0.085, 0.055], group: "collar", name: "scarab" });

  // ---------------------------------------------------------------- wings
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const Sh = V(s * 0.12, 0.84, -0.01);
    const E = V(s * 0.33, 0.84, -0.16);
    const W = V(s * 0.62, 0.8, -0.05);
    const H = V(s * 0.82, 0.72, 0.07);
    const armPath = catmull([Sh, E, W, H]);
    const arm = b.chain(`arm${sd}`, armPath, {
      parent: spine.joints[1],
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    b.sweep(arm, (t) => 0.045 - 0.027 * t, { color: LAPIS_DK, group: "wing" });
    const elbowJ = arm.joints[1];
    const wristJ = arm.joints[2];
    const boneAt = (u: number) => (u < 0.33 ? arm.joints[0] : u < 0.72 ? elbowJ : wristJ);

    // secondaries along elbow -> wrist
    for (let i = 0; i < 8; i++) {
      const u = 0.08 + (0.9 * i) / 7;
      const L = 0.42 + 0.04 * (i % 2);
      feather(
        elbowJ,
        E.clone().lerp(W, u),
        V(s * 0.1, -0.1, -1),
        L,
        0.095,
        featherPaint(L, LAPIS, TURQ, GOLD),
        { lift: (i % 3) * 0.007 },
      );
    }
    // primaries fanning off the hand
    for (let i = 0; i < 9; i++) {
      const th = ((10 + (68 * i) / 8) * Math.PI) / 180;
      const L = 0.36 + 0.2 * Math.sin(Math.PI * (0.15 + (0.7 * i) / 8));
      feather(
        wristJ,
        W.clone().lerp(H, 0.1 + (0.8 * i) / 8),
        V(s * Math.sin(th), -0.12, -Math.cos(th)),
        L,
        0.075,
        featherPaint(L, i % 2 ? LAPIS : LAPIS_DK, GOLD, TURQ),
        { lift: -0.005 + (i % 4) * 0.0065 },
      );
    }
    // primary coverts
    for (let i = 0; i < 6; i++) {
      const th = ((14 + (60 * i) / 5) * Math.PI) / 180;
      feather(
        wristJ,
        W.clone().lerp(H, 0.12 + (0.7 * i) / 5),
        V(s * Math.sin(th), -0.1, -Math.cos(th)),
        0.2,
        0.06,
        featherPaint(0.2, LAPIS, TURQ, CREAM),
        { lift: 0.026 + (i % 2) * 0.007 },
      );
    }
    // covert rows over the arm: greater, middle, lesser
    const rows: [number, number, number, number, string, string, string, number][] = [
      // n, L, W, lift, base, tip, band, forward shift
      [9, 0.22, 0.075, 0.016, TURQ, GOLD_LT, LAPIS, 0],
      [9, 0.15, 0.065, 0.028, LAPIS, TURQ, GOLD, 0.02],
      [8, 0.1, 0.06, 0.04, SLATE, LAPIS_DK, SLATE_LT, 0.045],
    ];
    rows.forEach(([n, L, Wd, lift, base, tip, band, fwd], r) => {
      for (let i = 0; i < n; i++) {
        const u = 0.1 + (0.78 * i) / (n - 1);
        const th = ((5 + 40 * u * u) * Math.PI) / 180;
        const p0 = armPath.at(u).clone();
        p0.z += fwd;
        feather(
          boneAt(u),
          p0,
          V(s * Math.sin(th), -0.05, -Math.cos(th)),
          L,
          Wd,
          featherPaint(L, base, tip, band),
          { lift: lift + (i % 2) * 0.006 + r * 0.001 },
        );
      }
    });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = limb(
      V(s * 0.085, 0.6, -0.04),
      V(s * 0.085, 0.0125, 0.0),
      [0.17, 0.25, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.085, 0, 0.08],
    });
    const legR = (t: number) =>
      t < 0.27 ? 0.05 - 0.02 * (t / 0.27) : t < 0.67 ? 0.03 - 0.011 * ((t - 0.27) / 0.4) : 0.018;
    const legTube = b.sweep(leg, legR, { color: LEGP, group: "leg", name: `legTube${sd}` });
    b.cards(
      b.surface(legTube).scatter(26, { rng: rng(20 + (s > 0 ? 1 : 2)), minDist: 0.03, filter: (h) => h.at.y > 0.48 }),
      [PLUME_A, PLUME_B],
      { size: [0.04, 0.07], lean: 55, bend: 20, vary: 0.2, rng: rng(8) },
    );
    // heel joint and gilded anklets
    b.part(new THREE.SphereGeometry(0.026, 7, 5), LEG, { bone: leg.joints[2], at: pts[2] });
    for (const [t, col] of [[0.76, GOLD], [0.83, RED], [0.9, GOLD]] as [number, string][]) {
      const pt = leg.at(t);
      b.part(new THREE.TorusGeometry(0.02, 0.005, 5, 10), col, {
        at: pt.at,
        dir: pt.tangent,
        axis: "z",
        bone: pt.bone,
        group: "leg",
      });
    }
    // very long toes, three forward and a short hallux behind
    const foot = pts[3];
    const toes: [string, number, number][] = [
      ["In", -1, 0.17],
      ["Mid", 0, 0.2],
      ["Out", 1, 0.17],
      ["Back", 0, -0.08],
    ];
    for (const [n, k, len] of toes) {
      const a = (k * s * 30 * Math.PI) / 180;
      const back = len < 0;
      const dv = back ? V(0, 0, -1) : V(Math.sin(a), 0, Math.cos(a));
      const L = Math.abs(len);
      const toe = b.chain(
        `toe${n}${sd}`,
        [foot.clone(), foot.clone().addScaledVector(dv, L * 0.5), foot.clone().addScaledVector(dv, L)],
        { parent: leg.joints[leg.joints.length - 1], names: [`toe${n}${sd}A`, `toe${n}${sd}B`, `toe${n}${sd}C`], role: "digit" },
      );
      b.sweep(toe, (t) => [0.014 - 0.005 * t, 0.0125 - 0.004 * t], { color: LEG, sides: 6, group: "foot" });
      const tip = foot.clone().addScaledVector(dv, L);
      b.spike(tip, tip.clone().addScaledVector(dv, back ? -0.0 + 0.0 : 0.0).add(dv.clone().multiplyScalar(back ? 0.03 : 0.05)).add(V(0, -0.007, 0)), null, 0.011, {
        color: BONE,
        bone: toe.joints[toe.joints.length - 1],
        group: "foot",
      });
    }
  }

  // ---------------------------------------------------------------- flank cartouches
  for (const s of [1, -1]) {
    const hit = bodySkin.around(V(0, 0.72, -0.02)).at(s * 90, -8);
    if (hit)
      b.decal(torso, CARTOUCHE, {
        at: hit,
        dir: [s, 0, 0],
        size: [0.07, 0.163],
        mirror: s < 0,
        group: "body",
        name: `cartouche${s > 0 ? "L" : "R"}`,
      });
  }

  return b.root;
}
```