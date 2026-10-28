```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  polyline,
  catmull,
  spiral,
  paint,
  mottle,
  grain,
  noise,
  cells,
  mix,
  smoothstep,
  svg,
  offset,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cardboard Robo-Kid",
  description:
    "A seven-year-old in a homemade cardboard-box robot costume: kraft torso box with taped flaps, marker-drawn control panel with bottle-cap knobs and glowing LEDs, foil-wrapped sleeves, shin boxes, paper-tube jetpack with tissue flames and a box helmet with a face window and antennae. Rigged humanoid with hands, fingers and jaw.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours)
const WHITE = "#f6f1e3";
const BLACK = "#26242a";
const RED = "#d6362b";
const YELLOW = "#f2c230";
const GREEN = "#43b05c";
const BLUE = "#3a78c9";
const ORANGE = "#ff8a2a";
const FLAME_Y = "#ffd84a";
const HOLE = "#2b1d14";
const BROW = "#4a2e1a";
const NOSE = "#eaa886";
const SOLE = "#f4efe0";
const CAPRED = "#c9382c";
const LED_R = "#ff3b30";
const LED_Y = "#ffd23a";
const LED_G = "#3ddc6a";
const PUPIL = "#111111";
const KRAFT_FLAT = "#c99b62";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const shade = (c: readonly number[], k: number): [number, number, number] => [
  clamp01(c[0] * k),
  clamp01(c[1] * k),
  clamp01(c[2] * k),
];

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Corrugated kraft board: tone drift, fine flute shading, grime and scuffs gathering near the floor. */
function kraft(seed: number, tone = 1) {
  return paint((p, n) => {
    const big = noise(p, 0.2, seed);
    const small = noise(p, 0.045, seed + 3);
    const flute = Math.abs(n.y) > 0.7 ? p.x : p.y;
    const f = 0.5 + 0.5 * Math.sin((flute / 0.0062) * Math.PI * 2);
    let c = mix("#dcb077", "#b98449", smoothstep(0.25, 0.75, big));
    const grime = smoothstep(0.3, 0.08, p.y) * (0.3 + 0.5 * small) * 0.6;
    c = mix(c, "#4b3320", Math.min(0.7, grime + 0.14 * smoothstep(0.62, 0.8, small)));
    return shade(c, (1 - 0.06 * f) * tone);
  });
}
const KRAFT = kraft(3);
const KRAFT_IN = kraft(8, 0.9);

/** The cut edge of corrugated board: alternating light and dark flutes. */
const CORR = paint((p) => {
  const w = (p.x + p.y * 1.3 + p.z * 0.7) / 0.0055;
  return w - Math.floor(w) < 0.5 ? "#e5c48e" : "#b78647";
});

/** Crinkled aluminium foil: facets shaded by cell, sky-lit on top. */
const FOIL = paint((p, n) => {
  const c = cells(p, 0.022, 5);
  const c2 = cells(p, 0.011, 9);
  const sh = 0.74 + 0.3 * c.id + 0.12 * (c2.id - 0.5) - 0.12 * Math.min(c.d1, 1);
  const base = mix("#9aa3b4", "#f3f6fb", clamp01(0.2 + 0.6 * (0.5 + 0.5 * n.y)));
  const edge = smoothstep(0, 0.07, c.d2 - c.d1);
  return shade(base, sh * (0.78 + 0.22 * edge));
});

const DUCT = grain("#a9b0ba", "#d8dee6", { size: 0.01, axis: "x", seed: 2 });
const PBLUE = grain("#3b6f9c", "#4a86b4", { size: 0.012, axis: "x", seed: 6 });
const HAZARD = paint((p) => {
  const k = Math.floor((p.x + p.y + p.z) / 0.018);
  return (((k % 2) + 2) % 2 === 0 ? YELLOW : BLACK) as string;
});
const SKINP = mottle("#f0b896", "#f7caa8", { size: 0.05, contrast: 0.6, seed: 4 });
const HAIRP = mottle("#6d4527", "#4e2f1a", { size: 0.03, seed: 9 });
const SHOEP = mottle("#d8453a", "#bd352c", { size: 0.03, seed: 12 });
const JEAN = grain("#3a5f98", "#4a74b0", { size: 0.01, axis: "y", seed: 14 });
const DENIM = paint((p) => (p.y < 0.118 ? SOLE : JEAN));
const SLEEVE = paint((p) => {
  const d = Math.abs(p.x) * 0.866 - p.y * 0.5;
  return Math.floor(d / 0.03) % 2 === 0 ? WHITE : RED;
});
const STRAW = paint((_p, _n, s) => (Math.floor(s[0] * 26 + s[1] / 180) % 2 === 0 ? RED : WHITE));
const SPRING = grain("#2e9a4e", "#57cc78", { size: 0.006, axis: "y", seed: 21 });

// ---------------------------------------------------------------------------------------------------------------
// Textures (marker drawings, labels, face)

const EYE = svg(
  `<svg viewBox="0 0 60 70">
    <ellipse cx="30" cy="36" rx="26" ry="31" fill="#fffdf6" stroke="#3a2418" stroke-width="3.5"/>
    <circle cx="31" cy="39" r="20" fill="#7b4a22"/>
    <circle cx="31" cy="39" r="20" fill="none" stroke="#4d2c12" stroke-width="3"/>
    <path d="M13 44 Q31 62 49 44 Q44 58 31 59 Q18 58 13 44Z" fill="#b57a3c"/>
    <circle cx="31" cy="39" r="10" fill="#150c07"/>
    <circle cx="22" cy="29" r="6.5" fill="#ffffff"/>
    <circle cx="39" cy="48" r="3" fill="#ffffff"/>
    <path d="M4 26 Q30 -2 56 26" stroke="#2a170c" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 80 40">
    <path d="M5 8 Q40 3 75 8 Q68 36 40 36 Q12 36 5 8Z" fill="#7a2326" stroke="#4d1517" stroke-width="3" stroke-linejoin="round"/>
    <path d="M9 9.5 Q40 5.5 71 9.5 Q69 19 40 19 Q11 19 9 9.5Z" fill="#fffaf0"/>
    <path d="M22 31 Q40 22 58 31 Q50 36 40 36 Q30 36 22 31Z" fill="#e87a80"/>
  </svg>`,
  { size: 160 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="22" fill="#f6b3a1"/>
    <circle cx="30" cy="30" r="14" fill="#f59d8e"/>
    <g fill="#a8623a"><circle cx="20" cy="26" r="2.2"/><circle cx="30" cy="21" r="2.2"/><circle cx="39" cy="27" r="2.2"/><circle cx="26" cy="35" r="2"/><circle cx="35" cy="37" r="2"/></g>
  </svg>`,
  { size: 96 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 64 C4 48 6 22 16 2 C28 20 28 46 16 64Z" fill="#6b4427"/>
    <path d="M16 58 C11 44 12 26 16 10" stroke="#93663a" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 96 },
);

const CHEST = svg(
  `<svg viewBox="0 0 170 110">
    <rect x="4" y="4" width="162" height="102" rx="6" fill="none" stroke="#f2d04a" stroke-width="2.4" stroke-dasharray="7 4"/>
    <circle cx="36" cy="40" r="29" fill="none" stroke="#f4f1e6" stroke-width="2"/>
    <text x="36" y="79" text-anchor="middle" font-family="Comic Sans MS, cursive" font-weight="bold" font-size="8" fill="#f4f1e6">ENERGY</text>
    <path d="M10 86 H62 M10 92 H62 M10 98 H62" stroke="#f4f1e6" stroke-width="2.6" stroke-linecap="round"/>
    <g stroke="#f4f1e6" stroke-width="3" stroke-linecap="round">
      <path d="M88 34 H160 M88 50 H160 M88 66 H160"/>
    </g>
    <g stroke="#f4f1e6" stroke-width="1.6" stroke-linecap="round">
      <path d="M94 30 v8 M106 30 v8 M118 30 v8 M130 30 v8 M142 30 v8 M154 30 v8"/>
      <path d="M94 46 v8 M106 46 v8 M118 46 v8 M130 46 v8 M142 46 v8 M154 46 v8"/>
      <path d="M94 62 v8 M106 62 v8 M118 62 v8 M130 62 v8 M142 62 v8 M154 62 v8"/>
    </g>
    <g font-family="Comic Sans MS, cursive" font-weight="bold" font-size="6.5" fill="#f2d04a">
      <text x="88" y="28">VOL</text><text x="88" y="44">SPD</text><text x="88" y="60">PWR</text>
    </g>
    <g fill="none" stroke="#f2d04a" stroke-width="1.8">
      <circle cx="96" cy="14" r="9"/><circle cx="114" cy="14" r="9"/><circle cx="132" cy="14" r="9"/>
    </g>
    <g fill="none" stroke="#f4f1e6" stroke-width="1.6" stroke-dasharray="2 3">
      <circle cx="84" cy="90" r="14"/><circle cx="108" cy="90" r="14"/>
    </g>
    <circle cx="142" cy="92" r="16" fill="none" stroke="#ff7b6e" stroke-width="2.4"/>
    <text x="142" y="76" text-anchor="middle" font-family="Comic Sans MS, cursive" font-weight="bold" font-size="7.5" fill="#ff7b6e">PUSH!</text>
  </svg>`,
  { size: 768 },
);

const TITLE = svg(
  `<svg viewBox="0 0 200 40">
    <text x="100" y="28" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="26" fill="#2b2a33" textLength="186" lengthAdjust="spacingAndGlyphs">ROBO-KID 3000</text>
    <path d="M6 36 Q50 32 100 36 T194 35" stroke="#d6362b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M4 12 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1z" fill="#d6362b"/>
    <path d="M196 12 l2 5 5 1 -4 3 1 5 -4 -3 -4 3 1 -5 -4 -3 5 -1z" fill="#d6362b"/>
  </svg>`,
  { size: 768 },
);

const gaugePt = (r: number, deg: number) =>
  `${(50 + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)} ${(50 - r * Math.cos((deg * Math.PI) / 180)).toFixed(1)}`;
let gaugeTicks = "";
for (let i = 0; i <= 10; i++) {
  const a = -135 + i * 27;
  gaugeTicks += `<path d="M${gaugePt(42, a)} L${gaugePt(i % 2 ? 36 : 33, a)}" stroke="#26242a" stroke-width="${i % 2 ? 2 : 3.2}" stroke-linecap="round"/>`;
}
const GAUGE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill="#f6edcf" stroke="#2a2830" stroke-width="3"/>
    <path d="M${gaugePt(44, 81)} A44 44 0 0 1 ${gaugePt(44, 135)}" stroke="#d6362b" stroke-width="5" fill="none"/>
    ${gaugeTicks}
    <text x="50" y="76" text-anchor="middle" font-family="serif" font-weight="bold" font-size="11" fill="#2a2830">PSI</text>
    <path d="M50 50 L${gaugePt(34, 35)}" stroke="#d6362b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="5" fill="#2a2830"/>
  </svg>`,
  { size: 256 },
);

const barcode = Array.from(
  { length: 22 },
  (_, i) => `<rect x="${(14 + i * 4.4).toFixed(1)}" y="118" width="${(i * 7) % 3 + 1.4}" height="12"/>`,
).join("");
const BACKLABEL = svg(
  `<svg viewBox="0 0 120 140">
    <rect x="4" y="4" width="112" height="132" rx="4" fill="#f4efe2" stroke="#2b2a33" stroke-width="3"/>
    <g fill="#2b2a33">
      <path d="M35 14 L56 40 L42 40 L42 70 L28 70 L28 40 L14 40Z"/>
      <path d="M85 14 L106 40 L92 40 L92 70 L78 70 L78 40 L64 40Z"/>
      <g>${barcode}</g>
    </g>
    <text x="60" y="87" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#2b2a33">THIS SIDE UP</text>
    <rect x="4" y="94" width="112" height="19" fill="#d6362b"/>
    <text x="60" y="108" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#ffffff">FRAGILE</text>
  </svg>`,
  { size: 256 },
);

const STICKER = svg(
  `<svg viewBox="0 0 90 60">
    <rect x="2" y="2" width="86" height="56" rx="7" fill="#f7f2e4" stroke="#b3281f" stroke-width="3"/>
    <path d="M2 9 a7 7 0 0 1 7 -7 h72 a7 7 0 0 1 7 7 v16 h-86Z" fill="#d6362b"/>
    <text x="45" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#ffffff">HELLO</text>
    <text x="45" y="33" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#d6362b">my name is</text>
    <text x="45" y="52" text-anchor="middle" font-family="Comic Sans MS, cursive" font-weight="bold" font-size="17" fill="#2457b8">ROBO</text>
  </svg>`,
  { size: 256 },
);

const DOODLE = svg(
  `<svg viewBox="0 0 100 90">
    <path d="M54 4 L26 48 H46 L36 86 L76 36 H56 L68 4Z" fill="#f2c230" stroke="#2b2a33" stroke-width="4" stroke-linejoin="round"/>
    <text x="76" y="84" text-anchor="middle" font-family="Comic Sans MS, cursive" font-weight="bold" font-size="17" fill="#d6362b" transform="rotate(-8 76 84)">ZAP!</text>
    <path d="M10 20 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1z" fill="none" stroke="#2b2a33" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M80 30 q8 -6 12 2 t-4 12" stroke="#2b6ccc" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SHIN = svg(
  `<svg viewBox="0 0 100 140">
    <rect x="7" y="7" width="86" height="126" rx="8" fill="none" stroke="#2b2a33" stroke-width="4" stroke-dasharray="12 6"/>
    <g fill="#cfd3dc" stroke="#2b2a33" stroke-width="3"><circle cx="19" cy="19" r="5.5"/><circle cx="81" cy="19" r="5.5"/><circle cx="19" cy="121" r="5.5"/><circle cx="81" cy="121" r="5.5"/></g>
    <g stroke="#d6362b" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 56 L36 42 L50 56 L64 42 L78 56"/><path d="M22 76 L36 62 L50 76 L64 62 L78 76"/>
    </g>
    <circle cx="50" cy="106" r="16" fill="none" stroke="#2b2a33" stroke-width="4"/>
    <path d="M42 106 H58 M50 98 V114" stroke="#2b2a33" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SPEAKER = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill="#c9ced9"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#2b2a33" stroke-width="3"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#2b2a33" stroke-width="3" stroke-dasharray="4 4"/>
    <circle cx="50" cy="50" r="18" fill="none" stroke="#2b2a33" stroke-width="3"/>
    <circle cx="50" cy="50" r="9" fill="#d6362b" stroke="#2b2a33" stroke-width="3"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);
const ball = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);

function gearOutline(teeth: number, rIn: number, rOut: number): [number, number][] {
  const pts: [number, number][] = [];
  const st = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * st;
    for (const [da, r] of [
      [-0.27, rIn],
      [-0.14, rOut],
      [0.14, rOut],
      [0.27, rIn],
    ] as const)
      pts.push([Math.cos(a + da * st) * r, Math.sin(a + da * st) * r]);
  }
  return pts;
}

const SOLE_OUTLINE: [number, number][] = [
  [-0.03, -0.075],
  [0.03, -0.075],
  [0.043, -0.02],
  [0.045, 0.04],
  [0.035, 0.09],
  [0, 0.105],
  [-0.035, 0.09],
  [-0.045, 0.04],
  [-0.043, -0.02],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "robo-kid", paintSize: 2048 });
  const rand = rng(5);

  // helpers bound to the builder
  const part = (geo: THREE.BufferGeometry, color: any, bone: any, at: [number, number, number], extra: any = {}) =>
    b.part(geo, color, { bone, at, ...extra });
  const plane = (tex: any, w: number, h: number, at: [number, number, number], dir: [number, number, number], bone: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ===== Skeleton ===========================================================================================
  const hips = b.joint("hips", { at: [0, 0.55, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.55, 0],
      [0, 0.78, 0],
      [0, 1.0, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.0, 0],
      [0, 1.1, 0.01],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.1, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.165, 0.01], aim: [0, 1.13, 0.1], role: "jaw" });

  // pelvis (jeans) hidden under the box
  part(ball(1, 10, 8), DENIM, hips, [0, 0.56, 0], { scale: [0.15, 0.08, 0.1] });

  // neck + striped collar
  b.sweep(neck, 0.04, { color: SKINP });
  b.sweep(neck, 0.05, { to: 0.3, color: SLEEVE, caps: "flat" });

  // ===== Torso: the cardboard box ============================================================================
  const T = (geo: THREE.BufferGeometry, color: any, at: [number, number, number], extra: any = {}) =>
    part(geo, color, chest, at, extra);

  T(box(0.46, 0.48, 0.34), KRAFT, [0, 0.78, 0]);
  T(box(0.468, 0.04, 0.348), RED, [0, 0.58, 0]); // red tape band
  T(box(0.468, 0.03, 0.348), DUCT, [0, 1.005, 0]); // silver tape band

  // top flaps, folded open at odd angles
  for (const s of [1, -1]) {
    const th = (18 * Math.PI) / 180;
    const len = 0.12;
    T(box(len, 0.008, 0.34), KRAFT_IN, [s * (0.23 + (Math.cos(th) * len) / 2), 1.024 + (Math.sin(th) * len) / 2, 0], {
      rotation: [0, 0, s * 18],
    });
  }
  {
    const thF = (25 * Math.PI) / 180;
    const lF = 0.11;
    T(box(0.46, 0.008, lF), KRAFT_IN, [0, 1.024 + (Math.sin(thF) * lF) / 2, 0.17 + (Math.cos(thF) * lF) / 2], {
      rotation: [-25, 0, 0],
    });
    const thB = (12 * Math.PI) / 180;
    const lB = 0.12;
    T(box(0.46, 0.008, lB), KRAFT_IN, [0, 1.024 + (Math.sin(thB) * lB) / 2, -0.17 - (Math.cos(thB) * lB) / 2], {
      rotation: [12, 0, 0],
    });
    // corrugated cut edges at the flap tips
    T(box(0.46, 0.0085, 0.006), CORR, [0, 1.024 + Math.sin(thF) * lF, 0.17 + Math.cos(thF) * lF], { rotation: [-25, 0, 0] });
    T(box(0.46, 0.0085, 0.006), CORR, [0, 1.024 + Math.sin(thB) * lB, -0.17 - Math.cos(thB) * lB], { rotation: [12, 0, 0] });
  }

  // title and panel
  plane(TITLE, 0.25, 0.05, [0, 0.96, 0.1735], [0, 0, 1], chest);
  T(box(0.34, 0.22, 0.024), PBLUE, [0, 0.8, 0.182]);
  plane(CHEST, 0.34, 0.22, [0, 0.8, 0.1965], [0, 0, 1], chest);

  // gauge on a paper plate
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.062, 0.011],
      [0.062, 0.0135],
      [0.05, 0.0035],
      [0, 0.0035],
    ],
    { at: [-0.098, 0.83, 0.194], axis: [0, 0, 1], bone: chest, color: WHITE, segments: 16 },
  );
  b.part(new THREE.CircleGeometry(0.048, 20), "#ffffff", {
    bone: chest,
    at: [-0.098, 0.83, 0.1985],
    dir: [0, 0, 1],
    axis: "z",
    texture: GAUGE,
  });

  // LEDs
  [
    [0.022, LED_R],
    [0.058, LED_Y],
    [0.094, LED_G],
  ].forEach(([x, c]) => {
    T(cyl(0.014, 0.014, 0.008, 10), BLACK, [x as number, 0.882, 0.198], { dir: [0, 0, 1] });
    glow(T(ball(0.0105, 8, 6), c as string, [x as number, 0.882, 0.202]), 1.6);
  });

  // slider tabs
  [
    [0.05, 0.842, RED],
    [0.106, 0.81, YELLOW],
    [0.03, 0.778, WHITE],
  ].forEach(([x, y, c]) => T(box(0.018, 0.024, 0.01), c as string, [x as number, y as number, 0.2]));

  // bottle-cap knobs
  [
    [-0.002, BLUE],
    [0.046, GREEN],
  ].forEach(([x, c], i) => {
    T(cyl(0.02, 0.02, 0.012, 14), c as string, [x as number, 0.73, 0.2], { dir: [0, 0, 1] });
    T(cyl(0.015, 0.015, 0.004, 14), "#e8e4d6", [x as number, 0.73, 0.2065], { dir: [0, 0, 1] });
    T(box(0.004, 0.016, 0.004), BLACK, [x as number, 0.738, 0.209], { rotation: [0, 0, i ? -35 : 40] });
  });

  // big red button
  T(cyl(0.028, 0.028, 0.01, 14), BLACK, [0.114, 0.726, 0.199], { dir: [0, 0, 1] });
  T(ball(1, 12, 8), RED, [0.114, 0.726, 0.203], { dir: [0, 0, 1], scale: [0.024, 0.012, 0.024] });

  // rivet caps under the panel
  for (let i = 0; i < 7; i++)
    T(cyl(0.0065, 0.0065, 0.005, 8), DUCT, [-0.12 + i * 0.04, 0.645, 0.1725], { dir: [0, 0, 1] });

  // pipe-cleaner wires
  b.sweep(
    catmull([
      [-0.14, 0.69, 0.178],
      [-0.17, 0.665, 0.176],
      [-0.2, 0.64, 0.176],
      [-0.205, 0.605, 0.176],
    ]),
    0.0045,
    { color: RED, bone: chest, sides: 5 },
  );
  b.sweep(
    catmull([
      [0.15, 0.69, 0.178],
      [0.19, 0.67, 0.176],
      [0.203, 0.64, 0.176],
      [0.19, 0.605, 0.176],
    ]),
    0.0045,
    { color: BLUE, bone: chest, sides: 5 },
  );

  // sides: arm holes, stickers, gears
  const outline = gearOutline(10, 0.042, 0.054);
  for (const s of [1, -1]) {
    T(cyl(0.062, 0.062, 0.005, 14), CORR, [s * 0.2325, 0.865, 0], { dir: [s, 0, 0] });
    T(cyl(0.05, 0.05, 0.008, 14), HOLE, [s * 0.2325, 0.865, 0], { dir: [s, 0, 0] });
    b.extrude(outline, {
      at: [s * 0.2365, 0.7, -0.07],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.01,
      color: s > 0 ? CAPRED : FOIL,
      bone: chest,
    });
    T(cyl(0.012, 0.012, 0.008, 10), s > 0 ? DUCT : RED, [s * 0.2445, 0.7, -0.07], { dir: [s, 0, 0] });
    plane(s > 0 ? STICKER : DOODLE, s > 0 ? 0.12 : 0.11, s > 0 ? 0.08 : 0.1, [s * 0.2335, 0.69, 0.065], [s, 0, 0], chest);
  }

  // back: label and jetpack of paper tubes
  plane(BACKLABEL, 0.12, 0.14, [0, 0.79, -0.1725], [0, 0, -1], chest);
  for (const s of [1, -1]) {
    const x = s * 0.115;
    const z = -0.22;
    T(cyl(0.045, 0.045, 0.34, 14), FOIL, [x, 0.79, z]);
    T(cyl(0.046, 0.046, 0.014, 14), CORR, [x, 0.963, z]);
    T(cyl(0.04, 0.058, 0.07, 12), CAPRED, [x, 0.585, z]);
    T(cyl(0.059, 0.059, 0.008, 12), WHITE, [x, 0.552, z]);
    glow(b.spike([x, 0.551, z], [0, -1, 0], 0.15, 0.045, { color: ORANGE, bone: chest, sides: 6, caps: { start: "flat", end: "point" } }), 1.3);
    glow(b.spike([x, 0.551, z], [0, -1, 0], 0.09, 0.026, { color: FLAME_Y, bone: chest, sides: 6, caps: { start: "flat", end: "point" } }), 1.5);
  }
  T(box(0.318, 0.03, 0.1), DUCT, [0, 0.88, -0.22]);
  T(box(0.318, 0.03, 0.1), DUCT, [0, 0.7, -0.22]);

  // ===== Head ===============================================================================================
  const H = (geo: THREE.BufferGeometry, color: any, at: [number, number, number], extra: any = {}) =>
    part(geo, color, head, at, extra);

  const skull = H(ball(1, 16, 12), SKINP, [0, 1.215, 0.025], { scale: [0.095, 0.105, 0.1] });
  const jawPart = part(ball(1, 12, 8), SKINP, jaw, [0, 1.145, 0.06], { scale: [0.072, 0.042, 0.062] });
  const hair = H(ball(1, 12, 8), HAIRP, [0, 1.28, 0.01], { scale: [0.1, 0.075, 0.1] });

  const face = b.surface([skull, jawPart]);
  const faceHit = (x: number, y: number) => face.ray([x, y, 0.6], [0, 0, -1])!;

  for (const s of [1, -1]) {
    b.decal(face, EYE, { at: [s * 0.042, 1.215, 0.12], dir: [0, 0, 1], size: [0.046, 0.054], segments: 8, lift: 0.002 });
    b.decal(face, CHEEK, {
      at: [s * 0.065, 1.172, 0.1],
      dir: [s * 0.45, 0, 1],
      size: [0.04, 0.04],
      segments: 6,
      lift: 0.001,
    });
    const brow = [
      [0.02, 1.255],
      [0.045, 1.264],
      [0.072, 1.255],
    ].map(([x, y]) => {
      const h = faceHit(s * x, y);
      return offset(h, h, 0.0035);
    });
    b.sweep(catmull(brow), [0.0045, 0.0028], { color: BROW, bone: head, sides: 5 });
  }
  b.decal(face, MOUTH, { at: [0, 1.148, 0.115], dir: [0, 0, 1], size: [0.066, 0.034], segments: 8, lift: 0.002 });
  b.stick(ball(0.014, 8, 6), NOSE, faceHit(0, 1.188), { embed: 0.35 });

  // fringe and tufts
  const hairSkin = b.surface(hair);
  const fringe = hairSkin.scatter(60, { rng: rand, minDist: 0.016, filter: (h) => h.at.y > 1.275 && h.at.z > 0.0 });
  b.cards(fringe, TUFT, { size: [0.026, 0.024], lean: 75, flow: [0, -1, 0.25], bend: 25, vary: 0.2, spin: 12, rng: rand });

  // ===== Helmet box =========================================================================================
  H(box(0.34, 0.01, 0.31), KRAFT, [0, 1.385, 0.005]);
  H(box(0.34, 0.33, 0.01), KRAFT, [0, 1.225, -0.145]);
  for (const s of [1, -1]) {
    H(box(0.01, 0.33, 0.31), KRAFT, [s * 0.165, 1.225, 0.005]);
    H(box(0.07, 0.22, 0.01), KRAFT, [s * 0.135, 1.2, 0.155]);
  }
  H(box(0.34, 0.08, 0.01), KRAFT, [0, 1.35, 0.155]);
  H(box(0.34, 0.04, 0.01), KRAFT, [0, 1.08, 0.155]);
  H(box(0.352, 0.034, 0.318), HAZARD, [0, 1.08, 0.005]);
  H(box(0.07, 0.004, 0.33), DUCT, [0, 1.392, 0.005]);

  // top-bar LEDs
  [
    [-0.045, LED_R],
    [0, LED_Y],
    [0.045, LED_G],
  ].forEach(([x, c]) => {
    H(cyl(0.011, 0.011, 0.006, 10), BLACK, [x as number, 1.352, 0.162], { dir: [0, 0, 1] });
    glow(H(ball(0.0085, 8, 6), c as string, [x as number, 1.352, 0.166]), 1.6);
  });

  // toilet-roll speakers
  for (const s of [1, -1]) {
    H(cyl(0.05, 0.05, 0.07, 14), KRAFT, [s * 0.205, 1.22, 0.01], { dir: [s, 0, 0] });
    H(cyl(0.052, 0.052, 0.01, 14), FOIL, [s * 0.243, 1.22, 0.01], { dir: [s, 0, 0] });
    b.part(new THREE.CircleGeometry(0.05, 18), "#ffffff", {
      bone: head,
      at: [s * 0.2485, 1.22, 0.01],
      dir: [s, 0, 0],
      axis: "z",
      texture: SPEAKER,
    });
  }

  // antenna left: bendy straw + foil ball + LED
  H(cyl(0.02, 0.02, 0.01, 10), RED, [0.09, 1.394, -0.05]);
  const straw = [
    [0.09, 1.39, -0.05],
    [0.09, 1.48, -0.05],
    [0.1, 1.53, -0.045],
    [0.14, 1.56, -0.04],
    [0.17, 1.55, -0.04],
  ];
  b.sweep(catmull(straw), 0.0065, { color: STRAW, bone: head, sides: 6 });
  H(ball(0.022, 7, 5), FOIL, [0.185, 1.545, -0.04], { flat: true });
  glow(H(ball(0.009, 6, 4), LED_R, [0.185, 1.568, -0.04]), 1.8);

  // antenna right: coiled pipe-cleaner spring + googly ping-pong ball
  H(cyl(0.02, 0.02, 0.01, 10), BLUE, [-0.09, 1.394, -0.05]);
  b.sweep(spiral([-0.09, 1.395, -0.05], [-0.076, 1.395, -0.05], [0, 1, 0], { turns: 7, pitch: 0.018 }), 0.0035, {
    color: SPRING,
    bone: head,
    sides: 5,
  });
  H(ball(0.026, 10, 8), WHITE, [-0.09, 1.55, -0.05]);
  H(ball(0.012, 8, 6), PUPIL, [-0.09, 1.55, -0.026]);
  H(ball(0.004, 6, 4), WHITE, [-0.094, 1.555, -0.0145]);

  // ===== Arms ===============================================================================================
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const sh: [number, number, number] = [s * 0.17, 0.9, 0];
    const el: [number, number, number] = [s * 0.3432, 0.8, 0];
    const wr: [number, number, number] = [s * 0.5083, 0.705, 0];
    const arm = b.chain(`arm${L}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.038, 0.034], { color: SLEEVE });
    b.sweep(arm, 0.047, { from: 0.56, to: 0.96, color: FOIL, caps: "flat", sides: 10 });
    b.sweep(arm, 0.0495, { from: 0.56, to: 0.6, color: RED, caps: "flat", sides: 10 });
    b.sweep(arm, 0.0495, { from: 0.92, to: 0.96, color: RED, caps: "flat", sides: 10 });

    const wrist = arm.tip!;
    const W = new THREE.Vector3(...wr);
    const D = new THREE.Vector3(s * 0.866, -0.5, 0);
    const U = new THREE.Vector3(s * 0.5, 0.866, 0);
    const palm = W.clone().addScaledVector(D, 0.04);
    b.part(ball(1, 8, 6), SKINP, {
      bone: wrist,
      at: palm,
      dir: D,
      up: U,
      scale: [0.03, 0.04, 0.015],
    });

    const fingers: [string, number, number][] = [
      ["index", 0.02, 0.04],
      ["middle", 0.007, 0.045],
      ["ring", -0.007, 0.041],
      ["pinky", -0.02, 0.032],
    ];
    for (const [name, zoff, len] of fingers) {
      const dir = D.clone().add(new THREE.Vector3(0, 0, zoff * 2.5)).normalize();
      const p0 = W.clone().addScaledVector(D, 0.075).add(new THREE.Vector3(0, 0, zoff));
      const p1 = p0.clone().addScaledVector(dir, len * 0.5);
      const p2 = p0.clone().addScaledVector(dir, len);
      const f = b.chain(`${name}${L}`, polyline([p0, p1, p2]), {
        parent: wrist,
        names: [`${name}${L}1`, `${name}${L}2`, `${name}${L}3`],
        role: "digit",
      });
      b.sweep(f, [0.0085, 0.0062], { color: SKINP, sides: 6 });
    }
    const tdir = D.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, -0.1, 0.85)).normalize();
    const t0 = W.clone().addScaledVector(D, 0.03).add(new THREE.Vector3(0, 0, 0.028));
    const thumb = b.chain(
      `thumb${L}`,
      polyline([t0, t0.clone().addScaledVector(tdir, 0.021), t0.clone().addScaledVector(tdir, 0.042)]),
      { parent: wrist, names: [`thumb${L}1`, `thumb${L}2`, `thumb${L}3`], role: "digit" },
    );
    b.sweep(thumb, [0.0095, 0.007], { color: SKINP, sides: 6 });
  }

  // ===== Legs ===============================================================================================
  const laces = (x: number) => {
    const top = (z: number) => 0.04 + 0.034 * Math.sqrt(Math.max(0, 1 - ((z - 0.03) / 0.075) ** 2));
    return [0.035, 0.055, 0.075].map((z) => [x, top(z) + 0.001, z] as [number, number, number]);
  };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.1;
    const leg = b.chain(
      `leg${L}`,
      polyline([
        [x, 0.56, 0],
        [x, 0.3, 0.012],
        [x, 0.085, 0],
        [x, 0.045, 0.15],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `ankle${L}`, `toe${L}`],
        role: "leg",
        contact: [x, 0, 0.04],
      },
    );
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.sweep(leg, [0.056, 0.05, 0.045, 0.04, 0.034], { to: leg.span(1)[1], color: DENIM });

    // shin box with foil cap and tape
    part(box(0.125, 0.2, 0.125), KRAFT, knee, [x, 0.21, 0.005]);
    part(box(0.133, 0.028, 0.133), FOIL, knee, [x, 0.3, 0.005]);
    part(box(0.13, 0.02, 0.13), RED, knee, [x, 0.12, 0.005]);
    plane(SHIN, 0.1, 0.14, [x, 0.205, 0.0705], [0, 0, 1], knee);

    // sneaker
    b.extrude(SOLE_OUTLINE, { at: [x, 0.011, 0.04], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, color: SOLE, bone: ankle });
    part(ball(1, 10, 8), SHOEP, ankle, [x, 0.04, 0.03], { scale: [0.042, 0.034, 0.075] });
    part(ball(1, 8, 6), SOLE, ankle, [x, 0.036, 0.1], { scale: [0.041, 0.03, 0.04] });
    part(cyl(0.041, 0.043, 0.035, 10), SHOEP, ankle, [x, 0.078, 0]);
    laces(x).forEach((at) => part(box(0.044, 0.004, 0.008), WHITE, ankle, at));
  }

  return b.root;
}
```