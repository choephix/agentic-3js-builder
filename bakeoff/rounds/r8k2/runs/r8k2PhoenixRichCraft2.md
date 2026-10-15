1. **Wing leading edges:** the arm radii are now `[0.06, 0.05, 0.035, 0.025]`. A new `layFeather` helper lays solid curved extruded feathers on the arm, rooted 20% inside the tube. There are three rows per wing: leading edge, top face and underside. Their length tapers from 0.20 to 0.14 m and their width from 0.125 to 0.095 m. A five-feather shoulder cap covers the body junction, and the bracer is refitted to the thin arm. I also lowered the wing pitch slightly and shortened the arm to 1.1 m.
2. **Head:** `HS` is 1.5 and the eye decals are `[0.085, 0.11]`. Each cheek gets two swept 0.11–0.14 m feathers along the jaw. The neck base is 20% wider and the upper neck curves forward. The crown is a narrower, rearward-leaning fan with shorter streamers, kept clear of the inner wing.
3. **Tail:** there are five dominant plumes (centre, x ±0.58, x ±1.15) and two shorter underlayers (x ±0.3). Each has its own descending-then-lifted arc, all above y = 0.4, with widths 0.09–0.15 and about 20° face twists between neighbours. The centre plume now reaches z = −1.95, and ten rump coverts sit over the tail sweep.
4. **Breast and thighs:** three overlapping rows of embedded solid feathers (0.13–0.17 m long) run down the breast, skipping anything over the jewel. The neck rings, chest cards and leg fringe cards are gone. Each thigh sphere is now orange and has a nine-feather rearward fan over its upper half.
5. **Framing:** I can't change the harness camera from the module. Instead the wing span is about 8% shorter, the tail is shorter, and the crown is compact.
6. **Feather paint:** `featherPaint` is rebuilt on the extrude coordinates. It has three or four hard broad bands, with crimson at the root, orange in the middle and pale gold only at the last 18%. A single continuous shaft line follows the curved shaft at about 3.4% of the width, and gold is one narrow root mark. Undersides are lightened toward warm orange.
7. **Fire feathers:** outlines now have a curved shaft, a single asymmetric notch on every third primary, and a split tip on one in three. Primaries 1, 2, 4 and 5 are built as two pieces, with the outer third bent 12–16°. Wing and tail flame cards lie along the feather direction with 30% of their length sunk into the blade.
8. **Colour hierarchy:** new `BODY`, `HEADP` and `NECKP` paints use burnt orange and burgundy shadows instead of olive gold, with pale amber on the face and throat and crimson on the crown and back. The eye glow is 0.25, the gem is 1.8, the emblem is 0.35, and the dais and embers are unchanged.

```ts
import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  frame,
  gradient,
  limb,
  mix,
  noise,
  paint,
  rng,
  scales,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Frame, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A Genshin-style phoenix with feathered burning wings, a regal flame crown, layered breast plumage and separated flame-plume tail, perched on a low gilded dais with two ember braziers.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and small helpers

const GOLD = "#f2b134";
const RUBY = "#ff3b3b";
const TOE = "#b8641a";
const CLAW = "#3a1a24";
const EMBER_CORE = "#ff8a24";
const D2R = Math.PI / 180;

type V = THREE.Vector3;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

/** Hard colour bands: [upper bound of t, colour]. */
type Stops = readonly (readonly [number, string])[];
const RAMP: Record<string, Stops> = {
  primary: [
    [0.34, "#b3121e"],
    [0.66, "#f2561a"],
    [0.82, "#ffa42a"],
    [1.01, "#ffe27a"],
  ],
  second: [
    [0.4, "#a8141f"],
    [0.78, "#e8401c"],
    [1.01, "#ff8a24"],
  ],
  tert: [
    [0.55, "#8e1020"],
    [1.01, "#d02a1c"],
  ],
  crest: [
    [0.35, "#a8141f"],
    [0.7, "#f2561a"],
    [1.01, "#ffc03a"],
  ],
  breast: [
    [0.4, "#e8761c"],
    [0.8, "#ffb43a"],
    [1.01, "#ffe08a"],
  ],
  tail: [
    [0.3, "#b3121e"],
    [0.62, "#ee3d1a"],
    [0.84, "#ff8a1e"],
    [1.01, "#ffe27a"],
  ],
};
function bandColor(stops: Stops, t: number): string {
  for (const [e, c] of stops) if (t < e) return c;
  return stops[stops.length - 1][1];
}

const fpCache = new Map<string, ReturnType<typeof paint>>();
/** Root-to-tip banded paint for an extruded feather (extrude surface coords are meters). */
function featherPaint(L: number, w: number, ramp: string, gold = false, curl = 0, t0 = 0) {
  const key = `${ramp}|${L.toFixed(2)}|${w.toFixed(3)}|${curl}|${gold ? 1 : 0}|${t0}`;
  let p = fpCache.get(key);
  if (!p) {
    const stops = RAMP[ramp];
    p = paint((_p, n, s) => {
      const t = clamp01(t0 + s[0] / L);
      let c: string | readonly [number, number, number] = bandColor(stops, t);
      const off = curl * w * 1.2 * (t * t - t0 * t0);
      if (gold && t > 0.1 && t < 0.15) c = GOLD;
      else if (t > 0.2 && t < 0.84 && Math.abs(s[1] - off) < 0.017 * w) c = mix(c, "#fff0b8", 0.45);
      const under = smoothstep(0.1, -0.6, n.y);
      return mix(c, "#ff9a5a", 0.22 * under);
    });
    fpCache.set(key, p);
  }
  return p;
}

/** Banded paint for membrane ribbons (surface coords: along, across). */
function ribbonPaint(ramp: string) {
  const stops = RAMP[ramp];
  return paint((_p, n, s) => {
    const c = bandColor(stops, clamp01(s[0]));
    return mix(c, "#ff9a5a", 0.2 * smoothstep(0.1, -0.6, n.y));
  });
}

type Corner = [number, number] | [number, number, "sharp"];
const LOW: [number, number][] = [
  [0, -0.24],
  [0.3, -0.5],
  [0.7, -0.4],
  [1, -0.04],
];
const UPP: [number, number][] = [
  [0, 0.24],
  [0.2, 0.42],
  [0.5, 0.55],
  [0.86, 0.3],
  [1, 0.06],
];
function prof(a: [number, number][], t: number) {
  for (let i = 1; i < a.length; i++) {
    if (t <= a[i][0]) {
      const k = (t - a[i - 1][0]) / (a[i][0] - a[i - 1][0]);
      return a[i - 1][1] + (a[i][1] - a[i - 1][1]) * k;
    }
  }
  return a[a.length - 1][1];
}

/**
 * A flame-blade feather outline: length L along x, width w along y, with a curved shaft (curl).
 * variant 0 plain, 1 one asymmetric notch, 2 split tip. [t0, t1] clips a piece for bent tips.
 */
function bladeOutline(L: number, w: number, variant = 0, curl = 0, t0 = 0, t1 = 1): Corner[] {
  const X = (t: number) => (t - t0) * L;
  const O = (t: number) => curl * w * 1.2 * (t * t - t0 * t0);
  const P = (t: number, v: number, sharp = false): Corner =>
    sharp ? [X(t), v * w + O(t), "sharp"] : [X(t), v * w + O(t)];
  const cutStart = t0 > 0;
  const out: Corner[] = [];
  [t0, 0.3, 0.7].forEach((t, i) => {
    if (i === 0 || (t > t0 + 0.04 && t < t1 - 0.04)) out.push(P(t, prof(LOW, t), i === 0 && cutStart));
  });
  if (t1 < 1) {
    out.push(P(t1, prof(LOW, t1), true), P(t1, prof(UPP, t1), true));
  } else {
    out.push(P(1, 0, true));
    if (variant === 2) out.push(P(0.82, 0.2, true), P(0.92, 0.46, true));
  }
  const ups = [0.86, 0.5, 0.2].filter(
    (t) => t > t0 + 0.04 && t < t1 - 0.04 && !(variant === 2 && t1 === 1 && t > 0.8),
  );
  let notched = false;
  for (const t of ups) {
    if (variant === 1 && t1 === 1 && t0 === 0 && t < 0.8 && !notched) {
      out.push(P(0.72, prof(UPP, 0.72)), P(0.66, 0.16, true), P(0.6, prof(UPP, 0.6)));
      notched = true;
    }
    out.push(P(t, prof(UPP, t)));
  }
  out.push(P(t0, prof(UPP, t0), cutStart));
  return out;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const r = rng(2024);

  // ------------------------------------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 70 96" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="c"><ellipse cx="39" cy="52" rx="22" ry="29"/></clipPath>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8e1020"/><stop offset="0.35" stop-color="#ff6a1a"/>
          <stop offset="0.75" stop-color="#ffb52e"/><stop offset="1" stop-color="#fff0a0"/>
        </linearGradient>
      </defs>
      <ellipse cx="39" cy="50" rx="27" ry="35" fill="#2a0c18"/>
      <g clip-path="url(#c)"><rect width="70" height="96" fill="url(#g)"/></g>
      <ellipse cx="39" cy="52" rx="22" ry="29" fill="none" stroke="#2a0c18" stroke-width="2.4"/>
      <ellipse cx="39" cy="54" rx="8" ry="18" fill="#2a0c18"/>
      <ellipse cx="29" cy="37" rx="8.5" ry="10.5" fill="#ffffff"/>
      <circle cx="48" cy="67" r="4.4" fill="#ffffff"/>
      <circle cx="52" cy="57" r="2" fill="#ffffff"/>
      <path d="M14 30 Q6 22 2 11" stroke="#ffb02e" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M13 43 Q6 42 1 37" stroke="#ffb02e" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const flameGrad = `<defs><linearGradient id="a" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#b3121c"/><stop offset="0.45" stop-color="#ff5a1a"/>
      <stop offset="0.8" stop-color="#ffb02e"/><stop offset="1" stop-color="#fff0a0"/></linearGradient></defs>`;
  const FLAME1 = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">${flameGrad}
      <path d="M20 80 C5 74 0 58 9 42 C12 50 15 51 18 46 C14 30 21 14 27 0 C28 17 40 30 38 50 C37 66 32 76 20 80Z" fill="url(#a)"/>
      <path d="M20 76 C12 70 11 60 16 52 C18 57 21 57 22 53 C22 44 25 36 28 28 C30 42 33 52 30 62 C28 70 25 74 20 76Z" fill="#ffd05a"/>
      <path d="M20 72 C16 67 17 61 20 57 C22 61 25 62 24 67 C23 70 22 71 20 72Z" fill="#fff4b8"/>
    </svg>`,
    { size: 192 },
  );
  const FLAME2 = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">${flameGrad}
      <path d="M20 80 C4 72 0 52 6 34 C9 40 12 40 14 36 C12 22 16 10 20 0 C21 14 24 22 24 32 C26 26 28 24 30 20 C30 30 40 44 38 56 C36 68 30 76 20 80Z" fill="url(#a)"/>
      <path d="M20 76 C11 70 10 58 15 48 C17 52 19 52 20 49 C21 56 24 50 27 46 C30 56 30 66 20 76Z" fill="#ffd05a"/>
    </svg>`,
    { size: 192 },
  );
  const FLAME3 = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">${flameGrad}
      <path d="M18 80 C2 72 2 56 12 46 C20 38 14 24 22 14 C26 9 28 5 32 0 C32 12 38 24 34 36 C30 48 36 60 30 70 C27 76 23 79 18 80Z" fill="url(#a)"/>
      <path d="M19 75 C10 68 11 58 17 52 C21 47 19 38 24 30 C26 42 30 50 28 60 C26 68 23 73 19 75Z" fill="#ffd05a"/>
    </svg>`,
    { size: 192 },
  );
  let rays = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const a1 = a - 0.2;
    const a2 = a + 0.2;
    const P = (rr: number, aa: number) => `${(100 + rr * Math.sin(aa)).toFixed(1)} ${(100 - rr * Math.cos(aa)).toFixed(1)}`;
    rays += `<path d="M${P(62, a1)} L${P(84, a)} L${P(62, a2)}" />`;
  }
  const EMBLEM = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#b9772f" stroke-opacity="0.7" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="100" cy="100" r="94" stroke-width="4"/>
        <g stroke-width="3">${rays}</g>
      </g>
      <path d="M100 56 C88 76 78 88 78 106 C78 122 88 134 100 140 C112 134 122 122 122 106 C122 96 118 90 112 78 C109 86 105 88 103 83 C103 72 102 64 100 56Z" fill="#c9622a" fill-opacity="0.85"/>
      <path d="M100 96 C93 106 92 114 97 124 C99 127 101 127 103 124 C108 114 106 106 100 96Z" fill="#f0b45a" fill-opacity="0.85"/>
    </svg>`,
    { size: 384 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4 L16 28 M8 10 L16 16 L24 10 M8 22 L16 16 L24 22" stroke="#ffb347" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="16" cy="16" r="3" fill="#ffe27a"/>
    </svg>`,
    { size: 128 },
  );
  const EMBER = svg(
    `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="e"><stop offset="0" stop-color="#fff6c0"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient></defs>
      <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6Z" fill="url(#e)"/>
    </svg>`,
    { size: 64 },
  );
  const FLAMES = [FLAME1, FLAME2, FLAME3];

  // -------------------------------------------------------------------------------------------------- paints
  const BODY = paint((p, n) => {
    let c = mix("#e2641c", "#f58a22", smoothstep(-0.7, -0.15, n.y));
    c = mix(c, mix("#b3121e", "#d8261c", smoothstep(0.3, 1, n.y)), smoothstep(0.0, 0.35, n.y));
    const cl = cells(p, 0.13, 7);
    if (cl.id > 0.8 && cl.d1 < 0.3 && n.y > 0.1) c = mix(c, "#7c0c18", 0.7);
    return c;
  });
  const HEADP = paint((_p, n) => {
    const crown = smoothstep(0.25, 0.6, n.y);
    const front = smoothstep(0.2, 0.6, n.z) * (1 - crown);
    const under = smoothstep(-0.25, -0.7, n.y);
    let c = mix("#f27a1e", "#c4161c", crown);
    c = mix(c, "#ffd27a", front * 0.85);
    return mix(c, "#a8203a", under * 0.9);
  });
  const NECKP = paint((_p, n) => {
    let c = mix("#f27d20", "#bd1a1e", smoothstep(0.0, 0.8, -n.z));
    c = mix(c, "#ffd27a", smoothstep(0.15, 0.65, n.z));
    return mix(c, "#a8203a", 0.6 * smoothstep(-0.2, -0.8, n.y));
  });
  const ARMP = paint((_p, n) => mix("#e8541c", "#c4161c", smoothstep(-0.3, 0.6, n.y)));
  const THIGHP = paint((_p, n) => mix("#e8681c", "#ffb43a", smoothstep(-0.7, -0.1, n.y)));
  const GOLDP = paint((p, n) => {
    const m = noise(p, 0.08, 4);
    const lit = smoothstep(-0.3, 0.9, n.y);
    return mix(mix("#a8661a", "#e8a82c", m), "#ffe69a", lit * 0.55);
  });
  const STONE = paint((p, n) => {
    const m = noise(p, 0.22, 3);
    let c = mix("#2f2640", "#4d3f5c", m);
    c = mix(c, "#7b6a8a", smoothstep(0.55, 1, n.y) * 0.5);
    const cell = cells(p, 0.26, 5);
    const e = cell.d2 - cell.d1;
    if (e < 0.035 && n.y < 0.7) c = mix(c, "#ff7a1a", 0.7 * (1 - e / 0.035));
    return c;
  });
  const LEGP = scales(["#e8a02a", "#f2b54a", "#d8901f"], "#7a3a0a", { size: 0.03, width: 0.16 });
  const TAILP = ribbonPaint("tail");
  const CRESTP = ribbonPaint("crest");

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.78, -0.12] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.12],
      [0, 0.88, 0.06],
      [0, 0.98, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.2],
      [0, 1.1, 0.32],
      [0, 1.24, 0.35],
      [0, 1.4, 0.42],
      [0, 1.54, 0.54],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3", "neck4"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[3], at: neck.at(1), dir: [0, -0.04, 1], role: "head", group: "head" });
  const HS = 1.5; // head scale constant
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f * HS, up: u * HS, left: l * HS });
  const jaw = b.joint("jaw", { parent: head, at: hl(0.06, -0.04), aim: hl(0.2, -0.045), role: "jaw", group: "head" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.12],
      [0, 0.76, -0.4],
      [0, 0.74, -0.7],
      [0, 0.78, -1.0],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ------------------------------------------------------------------------------------------------- helpers
  const gemOn = (hit: Frame, size = 1, strength = 1.3) => {
    b.stick(new THREE.CylinderGeometry(0.036 * size, 0.044 * size, 0.014 * size, 8), GOLD, hit, { embed: 0.3 });
    const gem = b.stick(new THREE.OctahedronGeometry(0.03 * size, 0), RUBY, hit.moved([0, 0.008 * size, 0]), {
      embed: 0.1,
      scale: [1, 1.4, 1],
    });
    glow(gem, strength);
  };

  /** A solid feather lying on a surface: point p, outward normal n, preferred flow direction. */
  const layFeather = (
    p: V,
    n: V,
    flow: V,
    L: number,
    w: number,
    ramp: string,
    bone: Joint,
    o: { lean?: number; variant?: number; curl?: number; embed?: number; thick?: number } = {},
  ) => {
    const nn = n.clone().normalize();
    const f = flow.clone().addScaledVector(nn, -flow.dot(nn));
    if (f.lengthSq() < 1e-6) f.copy(nn.clone().cross(v3(1, 0, 0)));
    f.normalize();
    const lean = (o.lean ?? 12) * D2R;
    const x = f.multiplyScalar(Math.cos(lean)).addScaledVector(nn, Math.sin(lean)).normalize();
    const y = nn.clone().cross(x).normalize();
    const at = p.clone().addScaledVector(x, -(o.embed ?? 0.18) * L).addScaledVector(nn, 0.003);
    const curl = o.curl ?? 0.3;
    b.extrude(bladeOutline(L, w, o.variant ?? 0, curl), {
      at,
      x,
      y,
      thickness: o.thick ?? 0.008,
      smoothing: 1,
      color: featherPaint(L, w, ramp, false, curl, 0),
      bone,
    });
  };

  /** A flowing flame ribbon: its width vector is kept perpendicular to the path and twisted along it. */
  const ribbon = (
    root: V,
    c1: V,
    c2: V,
    tip: V,
    width: number,
    side: V,
    bone: Joint,
    color: ReturnType<typeof paint>,
    phase = 0,
    tw: [number, number] = [0, 0],
    thickness = 0.01,
  ) => {
    const path = bezier(root, c1, c2, tip);
    const A: V[] = [];
    const B: V[] = [];
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const c = path.at(t);
      const T = path.tangentAt(t).clone().normalize();
      const sv = side
        .clone()
        .addScaledVector(T, -side.dot(T))
        .normalize()
        .applyAxisAngle(T, (tw[0] + (tw[1] - tw[0]) * t) * D2R);
      const env = Math.sin(Math.PI * Math.pow(t, 0.6));
      const wA = Math.max(0.006, width * env * (1 + 0.28 * Math.sin(t * 15 + phase)));
      const wB = Math.max(0.006, width * env * (1 + 0.28 * Math.sin(t * 15 + phase + 2.1)));
      A.push(c.clone().addScaledVector(sv, wA));
      B.push(c.clone().addScaledVector(sv, -wB));
    }
    b.membrane(catmull(A), catmull(B), { color, thickness, bone });
    return path;
  };

  // ------------------------------------------------------------------------------------------------- body
  const bodyLoft = b.loft(
    [
      { at: [0, 0.76, -0.42], w: 0.08, h: 0.08 },
      { at: [0, 0.79, -0.26], w: 0.26, h: 0.26 },
      { at: [0, 0.86, -0.04], w: 0.38, h: 0.4 },
      { at: [0, 0.99, 0.17], w: 0.36, h: 0.42 },
      { at: [0, 1.12, 0.3], w: 0.26, h: 0.28 },
      { at: [0, 1.2, 0.35], w: 0.16, h: 0.16 },
    ],
    { bone: [hips, spine, neck], color: BODY },
  );
  const neckTube = b.sweep(neck, [0.145, 0.115, 0.095, 0.085], { color: NECKP });
  const tailTube = b.sweep(tail, [0.12, 0.1, 0.06, 0.03], { color: BODY });
  const bodySurf = b.surface(bodyLoft);

  // chest jewel and collar
  const jewel = bodySurf.nearest([0, 1.02, 0.6]);
  gemOn(jewel, 1.6, 1.8);
  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.017, { color: GOLDP });

  // three overlapping rows of solid breast feathers, clear of the jewel
  const breastRows = [
    { y: 1.13, xs: [-0.14, -0.1, 0.1, 0.14], L: 0.13, w: 0.075 },
    { y: 1.0, xs: [-0.17, -0.1, 0.1, 0.17], L: 0.15, w: 0.085 },
    { y: 0.87, xs: [-0.16, -0.08, 0, 0.08, 0.16], L: 0.17, w: 0.095 },
  ];
  for (const row of breastRows) {
    for (const x of row.xs) {
      const h = bodySurf.ray([x, row.y, 1.3], [0, 0, -1]);
      if (!h) continue;
      if (h.at.y > jewel.at.y - 0.01 && Math.abs(h.at.x - jewel.at.x) < 0.09) continue;
      if (h.at.distanceTo(jewel.at) < 0.1) continue;
      layFeather(h.at, h.n, v3(0, -1, -0.1), row.L, row.w, "breast", h.bone ?? chest, { lean: 16 });
    }
  }
  const backHits = bodySurf.scatter(5, {
    rng: r,
    minDist: 0.14,
    filter: (h) => h.n.y > 0.45 && h.at.z < 0.1,
  });
  glow(
    b.cards(backHits, FLAMES, { size: [0.06, 0.14], lean: 55, flow: [0, 0.2, -1], bend: 30, vary: 0.3, rng: r }),
    0.8,
  );

  // ------------------------------------------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    at: hl(0.05, 0.03),
    scale: [0.1 * HS, 0.115 * HS, 0.115 * HS],
  });
  const skullSurf = b.surface(skull);
  const lifted = (h: { at: V; n: V }) => h.at.clone().addScaledVector(h.n, 0.012);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(skull.at).at(s * 45, 6);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.085, 0.11], mirror: s > 0 }), 0.25);
    const bA = skullSurf.around(skull.at).at(s * 30, 36);
    const bM = skullSurf.around(skull.at).at(s * 58, 38);
    const bC = skullSurf.around(skull.at).at(s * 88, 30);
    if (bA && bM && bC) {
      b.sweep(catmull([lifted(bA), lifted(bM), lifted(bC)]), [0.018, 0.004], {
        bone: head,
        color: "#ffb02e",
        caps: { start: "flat", end: "point" },
        sides: 6,
      });
    }
    // two swept cheek feathers along the jaw
    for (const [el, L] of [
      [-6, 0.14],
      [-24, 0.11],
    ] as const) {
      const cheek = skullSurf.around(skull.at).at(s * 100, el);
      if (cheek) layFeather(cheek.at, cheek.n, v3(0, -0.25, -1), L, 0.065, "breast", head, { lean: 14, curl: 0.3 * s });
    }
  }

  const BEAKP = gradient(GOLD, "#b3501a", hl(0.12, 0), hl(0.22, -0.05));
  b.sweep(
    bezier(hl(0.11, 0.005), hl(0.18, 0.012), hl(0.225, -0.05)),
    (t: number) => [0.04 * HS * (1 - t) + 0.004, 0.034 * HS * (1 - t) + 0.004],
    { bone: head, color: BEAKP, caps: "point", sides: 6 },
  );
  b.sweep(
    bezier(hl(0.1, -0.04), hl(0.17, -0.05), hl(0.2, -0.05)),
    (t: number) => [0.03 * HS * (1 - t) + 0.004, 0.022 * HS * (1 - t) + 0.004],
    { bone: jaw, color: BEAKP, caps: "point", sides: 6 },
  );

  // flame crown: a compact fan leaning back, kept narrow so it stays clear of the inner wings
  const crestBlade = (xd: V, L: number, w: number, at: V, variant: number, curl: number) => {
    const x = xd.clone().normalize();
    const y = v3(1, 0, 0).addScaledVector(x, -x.x).normalize();
    b.extrude(bladeOutline(L, w, variant, curl), {
      at,
      x,
      y,
      thickness: 0.014,
      bevel: 0.003,
      detail: 0.5,
      smoothing: 1,
      color: featherPaint(L, w, "crest", false, curl, 0),
      bone: head,
    });
  };
  crestBlade(v3(0, 1, -0.35), 0.42, 0.14, hl(0.0, 0.1), 2, 0);
  for (const s of [1, -1]) {
    crestBlade(v3(s * 0.28, 1, -0.45), 0.32, 0.11, hl(0.0, 0.095, s * 0.04), 0, 0.4 * s);
    crestBlade(v3(s * 0.6, 0.9, -0.55), 0.24, 0.09, hl(-0.01, 0.085, s * 0.07), 0, 0.4 * s);
    ribbon(
      hl(-0.02, 0.08, s * 0.04),
      hl(-0.12, 0.2, s * 0.08),
      hl(-0.24, 0.26, s * 0.1),
      hl(-0.34, 0.2, s * 0.12),
      0.035,
      v3(s * 0.4, 1, 0).normalize(),
      head,
      CRESTP,
      s * 1.7,
    );
  }

  // ------------------------------------------------------------------------------------------------- tail
  type Plume = { x: number; ty: number; tz: number; my: number; w: number; tw: [number, number]; flame?: number };
  const plumes: Plume[] = [{ x: 0, ty: 0.95, tz: -1.95, my: 0.42, w: 0.15, tw: [0, 10], flame: 0 }];
  for (const s of [1, -1]) {
    plumes.push({ x: s * 0.58, ty: 0.72, tz: -1.8, my: 0.46, w: 0.13, tw: [s * 18, s * 30], flame: 1 });
    plumes.push({ x: s * 1.15, ty: 0.85, tz: -1.5, my: 0.5, w: 0.11, tw: [s * 38, s * 54] });
    plumes.push({ x: s * 0.3, ty: 0.55, tz: -1.4, my: 0.36, w: 0.09, tw: [s * 8, s * 16] });
  }
  plumes.forEach((p, k) => {
    const dz = p.tz + 0.4;
    const path = ribbon(
      v3(p.x * 0.05, 0.78, -0.4),
      v3(p.x * 0.25, 0.6, -0.4 + dz * 0.35),
      v3(p.x * 0.7, p.my, -0.4 + dz * 0.75),
      v3(p.x, p.ty, p.tz),
      p.w,
      v3(1, 0, 0),
      tail.joints[1],
      TAILP,
      k * 1.3,
      p.tw,
      0.02,
    );
    if (p.flame !== undefined) {
      glow(
        b.cards([frame(path.at(0.9), path.tangentAt(0.9))], FLAMES[p.flame], {
          size: [0.12, 0.3],
          lean: 0,
          flow: [0, 1, 0],
          bend: 20,
          sink: 0.3,
          bone: tail.joints[1],
        }),
        1,
      );
    }
  });
  // rump coverts over the tail sweep
  const rump = [
    [0.08, [-55, -20, 20, 55]],
    [0.28, [-40, 0, 40]],
    [0.5, [-24, 24]],
    [0.7, [0]],
  ] as const;
  for (const [t, angs] of rump) {
    for (const a of angs) {
      const h = tailTube.at(t, a);
      layFeather(h.at, h.n, v3(h.n.x * 0.6, -0.1, -1), 0.24 - 0.12 * t, 0.1 - 0.04 * t, "second", h.bone ?? tail.joints[0], {
        lean: 9,
        curl: 0.25 * (a >= 0 ? 1 : -1),
      });
    }
  }

  // ------------------------------------------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip = v3(s * 0.14, 0.7, -0.07);
    const foot = v3(s * 0.16, 0.205, 0.1);
    const pts = limb(hip, foot, [0.18, 0.24, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`],
      role: "leg",
      contact: [s * 0.16, 0.18, 0.1],
    });
    b.sweep(leg, [0.055, 0.03, 0.024, 0.022], { color: LEGP });
    const tip = leg.joints[leg.joints.length - 1];
    const c0 = v3(s * 0.16, 0.64, -0.04);
    const A = 0.09;
    const B = 0.15;
    const C = 0.11;
    b.part(new THREE.SphereGeometry(1, 8, 6), THIGHP, { bone: leg.joints[0], at: c0, scale: [A, B, C] });
    // rearward feather fan over the upper half of the thigh
    const fan = [
      [28, [90], 0.12],
      [50, [60, 120], 0.14],
      [72, [40, 90, 140], 0.16],
    ] as const;
    for (const [th, psis, L] of fan) {
      for (const psi of psis) {
        const T = th * D2R;
        const P = psi * D2R;
        const u = v3(s * Math.sin(T) * Math.sin(P), Math.cos(T), Math.sin(T) * Math.cos(P));
        const p = c0.clone().add(v3(A * u.x, B * u.y, C * u.z));
        const n = v3(u.x / A, u.y / B, u.z / C).normalize();
        layFeather(p, n, v3(s * 0.25, -0.4, -1), L, 0.075, "second", leg.joints[0], { lean: 12, curl: 0.3 * s });
      }
    }
    for (const t of [0.62, 0.78]) {
      const cp = leg.at(t);
      b.part(new THREE.TorusGeometry(t > 0.7 ? 0.034 : 0.04, 0.009, 6, 10), GOLD, {
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
        bone: cp.bone ?? tip,
      });
    }
    for (const a of [-30, 0, 30]) {
      const dx = Math.sin(a * D2R);
      const dz = Math.cos(a * D2R);
      const end = foot.clone().add(v3(dx * 0.2, 0, dz * 0.2));
      b.capsule(foot, end, [0.026, 0.017], { color: TOE, bone: tip });
      b.spike(end, [dx * 0.8, -0.5, dz * 0.8], 0.055, 0.016, { color: CLAW, bone: tip });
    }
    const back = foot.clone().add(v3(0, 0, -0.12));
    b.capsule(foot, back, [0.024, 0.016], { color: TOE, bone: tip });
    b.spike(back, [0, -0.5, -0.8], 0.05, 0.015, { color: CLAW, bone: tip });
  }

  // ------------------------------------------------------------------------------------------------- wings
  const AL = 30 * D2R;
  const BETA = 58 * D2R;
  const CURL = 0.4;
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const U = v3(s * Math.cos(AL), Math.sin(AL), 0);
    const T = v3(0, Math.sin(BETA), -Math.cos(BETA));
    T.addScaledVector(U, -T.dot(U)).normalize();
    const N = U.clone().cross(T).multiplyScalar(s).normalize();
    const dirAt = (phi: number) => U.clone().multiplyScalar(Math.cos(phi * D2R)).addScaledVector(T, Math.sin(phi * D2R));
    const along = (u: number, z: number, y = 0) => v3(s * 0.24, 1.0 + y, 0.1).addScaledVector(U, u).add(v3(0, 0, z));
    const armPath = catmull([along(0, 0), along(0.42, 0.04), along(0.88, 0.02, 0.1), along(1.1, 0.0, 0.12)]);
    const arm = b.chain(`wing${sd}`, armPath, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    const armTube = b.sweep(arm, [0.06, 0.05, 0.035, 0.025], { color: ARMP });
    const [shoulder, elbow, wrist] = [arm.joints[0], arm.joints[1], arm.joints[2]];

    /** A big wing feather; `bend` makes the outer third a second piece curled toward +N. */
    const wFeather = (
      root: V,
      d: V,
      L: number,
      w: number,
      ramp: string,
      bone: Joint,
      lift: number,
      variant: number,
      gold: boolean,
      bend = 0,
    ) => {
      const x = d.clone().normalize();
      const y = N.clone().cross(x).multiplyScalar(s).normalize();
      const at = root.clone().addScaledVector(N, lift);
      const t1 = bend ? 0.68 : 1;
      b.extrude(bladeOutline(L, w, variant, CURL, 0, t1), {
        at,
        x,
        y,
        thickness: 0.012,
        bevel: 0.003,
        detail: 0.5,
        smoothing: 1,
        color: featherPaint(L, w, ramp, gold, CURL, 0),
        bone,
      });
      let p = at.clone().addScaledVector(x, 0.8 * L).addScaledVector(y, CURL * w * 1.2 * 0.64);
      let dir = x.clone();
      if (bend) {
        const a = bend * D2R;
        const x2 = x.clone().multiplyScalar(Math.cos(a)).addScaledVector(N, Math.sin(a)).normalize();
        const at2 = at.clone().addScaledVector(x, 0.66 * L).addScaledVector(y, CURL * w * 1.2 * 0.66 * 0.66);
        b.extrude(bladeOutline(L, w, variant, CURL, 0.66, 1), {
          at: at2,
          x: x2,
          y,
          thickness: 0.012,
          bevel: 0.003,
          detail: 0.5,
          smoothing: 1,
          color: featherPaint(L, w, ramp, gold, CURL, 0.66),
          bone,
        });
        p = at2.clone().addScaledVector(x2, 0.14 * L);
        dir = x2;
      }
      return { p, dir };
    };

    // primaries fanned over the hand; every third notched, every third split, a few with curled tips
    const PL = [0.78, 0.84, 0.88, 0.88, 0.84, 0.78, 0.72, 0.66, 0.6];
    const flameIdx = new Set([0, 2, 5]);
    PL.forEach((L, i) => {
      const u = i / (PL.length - 1);
      const root = armPath.at(0.99 - 0.3 * u).clone();
      const variant = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 0;
      const bend = [1, 2, 4, 5].includes(i) ? (i % 2 ? 16 : 12) : 0;
      const f = wFeather(root, dirAt(-8 + 9 * i), L, 0.13, "primary", wrist, i * 0.004, variant, true, bend);
      if (flameIdx.has(i)) {
        glow(
          b.cards([frame(f.p, f.dir)], FLAMES[i % 3], {
            size: [0.11, 0.3],
            lean: 0,
            flow: N,
            bend: 20,
            sink: 0.3,
            bone: wrist,
          }),
          1,
        );
      }
    });
    // secondaries
    for (let j = 0; j < 10; j++) {
      const root = armPath.at(0.78 - 0.4 * (j / 9)).clone();
      wFeather(root, dirAt(72 + 3.4 * j), 0.82 - 0.011 * j, 0.17, "second", elbow, -0.016 - 0.004 * j, j % 3 === 0 ? 1 : 0, false);
    }
    // tertials
    for (let k = 0; k < 4; k++) {
      const root = armPath.at(0.34 - 0.07 * k).clone();
      wFeather(root, dirAt(98 + 5 * k), 0.4 - 0.03 * k, 0.12, "tert", shoulder, -0.06 - 0.004 * k, 0, false);
    }

    // feathered arm: coverts wrap the leading edge, top and underside
    const rAt = (t: number) => 0.06 - 0.035 * t;
    const boneAt = (t: number): Joint => (arm.at(t).bone as Joint | null) ?? shoulder;
    for (let i = 0; i < 9; i++) {
      const t = 0.04 + (0.88 * i) / 8;
      const pt = armPath.at(t).clone();
      const rr = rAt(t);
      const L = 0.2 - 0.06 * t;
      const w = 0.125 - 0.03 * t;
      const nL = T.clone().multiplyScalar(-1);
      layFeather(pt.clone().addScaledVector(nL, rr * 0.9), nL, dirAt(12), L, w, "tert", boneAt(t), {
        lean: 14,
        curl: 0.3,
        embed: 0.2,
      });
    }
    for (let i = 0; i < 7; i++) {
      const t = 0.05 + (0.7 * i) / 6;
      const pt = armPath.at(t).clone();
      const rr = rAt(t);
      const L = 0.2 - 0.06 * t;
      const w = 0.125 - 0.03 * t;
      for (const sign of [1, -1]) {
        const n = N.clone().multiplyScalar(sign);
        const at = pt.clone().addScaledVector(n, rr * 0.8).addScaledVector(T, -rr * 0.3);
        layFeather(at, n, dirAt(80), L, w, "second", boneAt(t), { lean: 8, curl: 0.3, embed: 0.2 });
      }
    }
    // broad shoulder cap over the wing-to-body junction
    const sh = armPath.at(0.03).clone();
    const capN = v3(s * 0.35, 1, 0.25).normalize();
    const capFlows = [
      v3(-s * 0.9, -0.4, 0.4),
      v3(-s * 0.8, -0.5, -0.1),
      v3(-s * 0.5, -0.5, -0.7),
      v3(-s * 0.1, -0.4, -1),
      v3(s * 0.5, -0.2, -0.8),
    ];
    for (const fl of capFlows) {
      layFeather(sh.clone().addScaledVector(capN, 0.05), capN, fl, 0.24, 0.15, "tert", shoulder, {
        lean: 14,
        curl: 0.3 * s,
        embed: 0.2,
      });
    }

    // bracer fitted to the slim wrist
    b.sweep(b.surface(armTube).loop(wrist, { lift: 0.008 }), 0.011, { color: GOLDP });
  }

  // ------------------------------------------------------------------------------------------------- base
  const tier = (r0: number, r1: number, y0: number, y1: number, color: ReturnType<typeof paint> | string) =>
    b.lathe(
      [
        [0, y0],
        [r0, y0],
        [r1, y1],
        [0, y1],
      ],
      { at: [0, 0, 0], axis: [0, 1, 0], segments: 8, spin: 22.5, color, bone: hips },
    );
  const TOP = 0.175;
  tier(1.0, 0.98, 0, 0.08, STONE);
  tier(0.92, 0.88, 0.08, TOP, STONE);
  b.lathe(
    [
      [0.84, 0.15],
      [0.92, 0.15],
      [0.9, 0.195],
      [0.84, 0.195],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 8, spin: 22.5, color: GOLDP, bone: hips },
  );
  glow(
    b.part(new THREE.CircleGeometry(0.76, 40), "#ffffff", {
      at: [0, TOP + 0.0025, 0],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: EMBLEM,
      bone: hips,
    }),
    0.35,
  );

  // two rear ember braziers
  const SH = 0.18;
  const pylonFlames: Frame[] = [];
  for (const az of [125, -125]) {
    const x = Math.sin(az * D2R) * 0.7;
    const z = Math.cos(az * D2R) * 0.7;
    const y0 = TOP;
    const shaft = b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.075, SH],
        [0, SH],
      ],
      { at: [x, y0, z], axis: [0, 1, 0], segments: 6, color: STONE, bone: hips },
    );
    b.lathe(
      [
        [0, SH],
        [0.11, SH],
        [0.13, SH + 0.05],
        [0.11, SH + 0.055],
        [0.09, SH + 0.03],
        [0, SH + 0.03],
      ],
      { at: [x, y0, z], axis: [0, 1, 0], segments: 8, color: GOLDP, bone: hips },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.07, 8, 6), EMBER_CORE, {
        at: [x, y0 + SH + 0.035, z],
        scale: [1, 0.7, 1],
        bone: hips,
      }),
      1.3,
    );
    const hit = b.surface(shaft).around([x, y0 + SH / 2, z]).at(az, 0);
    if (hit) glow(b.decal(shaft, RUNE, { at: hit, size: [0.06, 0.06], bone: hips }), 1);
    for (const [ox, oz] of [
      [0, 0],
      [0.03, 0.02],
      [-0.03, -0.02],
    ]) {
      pylonFlames.push(frame([x + ox, y0 + SH + 0.04, z + oz], [0, 1, 0]));
    }
  }
  glow(
    b.cards(pylonFlames, FLAMES, {
      size: [0.14, 0.3],
      lean: 0,
      flow: [0, 0, 1],
      cross: true,
      bend: 15,
      vary: 0.2,
      rng: r,
      bone: hips,
    }),
    1,
  );

  // a handful of low embers
  const emberFrames: Frame[] = [];
  let guard = 0;
  while (emberFrames.length < 14 && guard++ < 200) {
    const a = r() * Math.PI * 2;
    const rad = 0.9 + r() * 0.7;
    const y = 0.3 + r() * 0.7;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    if (z < -0.2) continue;
    emberFrames.push(frame([x, y, z], [0, 1, 0]));
  }
  glow(
    b.cards(emberFrames, EMBER, { size: 0.05, vary: 0.6, cross: true, lean: 0, flow: [0, 0, 1], rng: r, bone: hips }),
    1.2,
  );

  // a barely open beak
  b.pose(jaw, { axis: [1, 0, 0], deg: 2.5 });

  return b.root;
}
```