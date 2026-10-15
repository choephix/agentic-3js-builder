import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  countershade,
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
} from "../../../../src/index";
import type { Frame, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A Genshin-style phoenix with flame plumage, banded gold ornaments and raised wings, perched on a glowing pyre dais with ember braziers.",
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

type Stops = readonly (readonly [number, string])[];
const RAMP: Record<string, Stops> = {
  primary: [
    [0, "#b3121c"],
    [0.25, "#e0301c"],
    [0.5, "#ff7a1a"],
    [0.78, "#ffb02e"],
    [1, "#fff0a0"],
  ],
  second: [
    [0, "#8e0f20"],
    [0.3, "#c4161c"],
    [0.65, "#ee4a1c"],
    [1, "#ff9a24"],
  ],
  tert: [
    [0, "#6e0c22"],
    [0.5, "#b8171f"],
    [1, "#e8381a"],
  ],
  crest: [
    [0, "#9d1020"],
    [0.35, "#e0301c"],
    [0.7, "#ff8a1a"],
    [1, "#fff0a0"],
  ],
  tail: [
    [0, "#b3121c"],
    [0.3, "#ee3d1a"],
    [0.6, "#ff7a1a"],
    [0.85, "#ffb02e"],
    [1, "#fff0a0"],
  ],
};

function sample(stops: Stops, t: number) {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      return mix(c0, c1, (t - t0) / (t1 - t0));
    }
  }
  const last = stops[stops.length - 1][1];
  return mix(last, last, 0);
}

/** Soft cel banding of a 0..1 ramp value. */
function band(t: number, steps = 6) {
  const k = clamp01(t) * steps;
  const f = k - Math.floor(k);
  return (Math.floor(k) + smoothstep(0.42, 0.58, f)) / steps;
}

const fpCache = new Map<string, ReturnType<typeof paint>>();
/** Root-to-tip banded paint for an extruded feather of length L (extrude surface coords are meters). */
function featherPaint(L: number, ramp: string) {
  const key = `${ramp}${Math.round(L * 25)}`;
  let p = fpCache.get(key);
  if (!p) {
    const stops = RAMP[ramp];
    p = paint((_p, _n, s) => {
      const t = clamp01(s[0] / L);
      const c = sample(stops, band(t));
      if (Math.abs(s[1]) < 0.006 && t > 0.04 && t < 0.92) return mix(c, "#fff4b8", 0.4);
      return c;
    });
    fpCache.set(key, p);
  }
  return p;
}

/** Banded paint for membrane ribbons (surface coords: along, across). */
function ribbonPaint(ramp: string) {
  const stops = RAMP[ramp];
  return paint((_p, _n, s) => {
    const c = sample(stops, band(s[0], 7));
    return Math.abs(s[1] - 0.5) < 0.04 && s[0] > 0.05 && s[0] < 0.9 ? mix(c, "#fff1a8", 0.45) : c;
  });
}

type Corner = [number, number] | [number, number, "sharp"];
/** A flame-blade feather outline: length L along x, width w along y (trailing side is +y), forked tip. */
function bladeOutline(L: number, w: number): Corner[] {
  return [
    [0, -0.24 * w],
    [0.3 * L, -0.5 * w],
    [0.72 * L, -0.4 * w],
    [L, 0, "sharp"],
    [0.82 * L, 0.2 * w, "sharp"],
    [0.92 * L, 0.46 * w, "sharp"],
    [0.5 * L, 0.55 * w],
    [0.2 * L, 0.42 * w],
    [0, 0.24 * w],
  ];
}

// ---------------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix" });
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
      <path d="M29 9 Q44 1 62 11" stroke="#ffb02e" stroke-width="4.6" stroke-linecap="round" fill="none"/>
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
  const FEATHER = svg(
    `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 90 C3 72 0 32 20 0 C40 32 37 72 20 90Z" fill="#ffffff"/>
      <path d="M20 90 L20 6" stroke="#9a9a9a" stroke-width="2" fill="none"/>
      <path d="M20 80 L8 56 M20 80 L32 56 M20 62 L7 38 M20 62 L33 38 M20 44 L10 22 M20 44 L30 22" stroke="#cfcfcf" stroke-width="1.6" fill="none"/>
    </svg>`,
    { size: 192 },
  );
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const a1 = a - 0.16;
    const a2 = a + 0.16;
    const P = (rr: number, aa: number) => `${(100 + rr * Math.sin(aa)).toFixed(1)} ${(100 - rr * Math.cos(aa)).toFixed(1)}`;
    rays += `<path d="M${P(66, a1)} L${P(86, a)} L${P(66, a2)}" />`;
    rays += `<path d="M${P(92, a + 0.39)} L${P(96, a + 0.39)}" stroke-width="4"/>`;
  }
  const EMBLEM = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#ffb347" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="100" cy="100" r="96" stroke-width="4"/>
        <circle cx="100" cy="100" r="88" stroke-width="2"/>
        <circle cx="100" cy="100" r="60" stroke-width="3" stroke-dasharray="10 6"/>
        <g stroke-width="3">${rays}</g>
      </g>
      <path d="M100 52 C86 74 74 86 74 106 C74 124 86 136 100 142 C114 136 126 124 126 106 C126 94 120 88 114 76 C110 86 106 88 104 82 C104 70 102 62 100 52Z" fill="#ff7a1a" stroke="#ffd25a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M100 92 C92 104 90 112 96 124 C98 128 102 128 104 124 C110 112 106 104 100 92Z" fill="#ffe27a"/>
    </svg>`,
    { size: 512 },
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
  const BODY = countershade(
    scales(["#c4161c", "#d6241c", "#b01220"], "#7c0c18", { size: 0.055, width: 0.12 }),
    scales(["#ffb02e", "#ffc247", "#ff9a24"], "#e0701a", { size: 0.055, width: 0.12 }),
    { level: -0.25, soft: 0.45 },
  );
  const HEADP = countershade(
    scales(["#c4161c", "#d6241c"], "#7c0c18", { size: 0.04, width: 0.12 }),
    scales(["#ffe08a", "#ffcf5a"], "#e0901a", { size: 0.04, width: 0.12 }),
    { level: -0.3, soft: 0.35 },
  );
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
    if (e < 0.05 && n.y < 0.7) c = mix(c, "#ff7a1a", 1 - e / 0.05);
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
      [0, 1.12, 0.34],
      [0, 1.28, 0.42],
      [0, 1.44, 0.42],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: [0, -0.04, 1], role: "head", group: "head" });
  const HS = 1.2; // head scale constant
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
  ) => {
    const path = bezier(root, c1, c2, tip);
    const A: V[] = [];
    const B: V[] = [];
    const N = 12;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const c = path.at(t);
      const env = Math.sin(Math.PI * Math.pow(t, 0.6));
      const wA = Math.max(0.006, width * env * (1 + 0.28 * Math.sin(t * 15 + phase)));
      const wB = Math.max(0.006, width * env * (1 + 0.28 * Math.sin(t * 15 + phase + 2.1)));
      A.push(c.clone().addScaledVector(side, wA));
      B.push(c.clone().addScaledVector(side, -wB));
    }
    b.membrane(catmull(A), catmull(B), { color, thickness: 0.01, bone });
    return path;
  };

  // ------------------------------------------------------------------------------------------------- body
  const bodyLoft = b.loft(
    [
      { at: [0, 0.76, -0.42], w: 0.08, h: 0.08 },
      { at: [0, 0.79, -0.26], w: 0.26, h: 0.26 },
      { at: [0, 0.86, -0.04], w: 0.38, h: 0.4 },
      { at: [0, 0.99, 0.17], w: 0.36, h: 0.42 },
      { at: [0, 1.12, 0.3], w: 0.2, h: 0.24 },
      { at: [0, 1.2, 0.35], w: 0.1, h: 0.12 },
    ],
    { bone: [hips, spine, neck], color: BODY },
  );
  const neckTube = b.sweep(neck, [0.1, 0.085, 0.07, 0.062], { color: BODY });
  b.sweep(tail, [0.12, 0.1, 0.06, 0.03], { color: BODY });
  const bodySurf = b.surface(bodyLoft);

  // chest jewel, collar and plumage ruffs
  gemOn(bodySurf.nearest([0, 1.02, 0.6]), 1.6, 1.5);
  const collar = b.surface(neckTube).loop(neck.joints[1], { lift: 0.012 });
  b.sweep(collar, 0.017, { color: GOLDP });
  gemOn(b.surface(neckTube).nearest(neck.joints[1].local({ forward: 0.25 })), 0.8, 1.2);

  const chestHits = bodySurf.scatter(36, {
    rng: r,
    minDist: 0.06,
    filter: (h) => h.n.z > 0.25 && h.at.y > 0.85,
  });
  b.cards(chestHits, FEATHER, {
    size: [0.07, 0.16],
    lean: 75,
    flow: [0, -1, -0.25],
    color: "#ffcf5a",
    vary: 0.2,
    rng: r,
  });
  const backHits = bodySurf.scatter(24, {
    rng: r,
    minDist: 0.09,
    filter: (h) => h.n.y > 0.45 && h.at.z < 0.1,
  });
  glow(
    b.cards(backHits, FLAMES, { size: [0.07, 0.17], lean: 55, flow: [0, 0.2, -1], bend: 30, vary: 0.3, rng: r }),
    0.8,
  );
  for (const [t, rad, cnt] of [
    [0.45, 0.07, 10],
    [0.2, 0.095, 12],
  ] as const) {
    b.cards(b.ring(neck.at(t), { count: cnt, radius: rad }).items, FEATHER, {
      size: [0.07, 0.13],
      lean: 65,
      flow: [0, -1, 0],
      color: "#ffb02e",
      vary: 0.15,
      rng: r,
    });
  }

  // ------------------------------------------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), HEADP, {
    bone: head,
    at: hl(0.05, 0.02),
    scale: [0.1 * HS, 0.092 * HS, 0.115 * HS],
  });
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurf.around(skull.at).at(s * 42, 4);
    if (hit) glow(b.decal(skull, EYE, { at: hit, size: [0.058 * HS * 1.15, 0.08 * HS * 1.15], mirror: s > 0 }), 0.7);
    // cheek tufts
    const cheek = skullSurf.around(skull.at).at(s * 85, -22);
    if (cheek) {
      b.cards([cheek], FEATHER, { size: [0.06, 0.15], lean: 75, flow: [0, -0.3, -1], color: "#ffe08a" });
    }
  }
  gemOn(skullSurf.nearest(hl(0.1, 0.14)), 0.8, 1.4);

  const BEAKP = gradient(GOLD, "#b3501a", hl(0.12, 0), hl(0.3, 0));
  b.sweep(bezier(hl(0.12, 0.005), hl(0.22, 0.012), hl(0.3, -0.055)), (t: number) => [0.04 * (1 - t) + 0.004, 0.034 * (1 - t) + 0.004], {
    bone: head,
    color: BEAKP,
    caps: "point",
    sides: 6,
  });
  b.sweep(bezier(hl(0.1, -0.04), hl(0.2, -0.05), hl(0.262, -0.058)), (t: number) => [0.03 * (1 - t) + 0.004, 0.022 * (1 - t) + 0.004], {
    bone: jaw,
    color: BEAKP,
    caps: "point",
    sides: 6,
  });

  // crest blades
  const crestBlade = (xd: V, L: number, w: number, at: V) => {
    const x = xd.clone().normalize();
    const y = v3(0, 1, 0).addScaledVector(x, -x.y).normalize();
    b.extrude(bladeOutline(L, w), {
      at,
      x,
      y,
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 1,
      color: featherPaint(L, "crest"),
      bone: head,
    });
  };
  crestBlade(v3(0, 0.55, -0.83), 0.36, 0.1, hl(0.0, 0.085));
  crestBlade(v3(0, 0.95, -0.3), 0.2, 0.07, hl(0.06, 0.09));
  for (const s of [1, -1]) {
    crestBlade(v3(s * 0.4, 0.5, -0.76), 0.3, 0.09, hl(-0.01, 0.075, s * 0.03));
    // long trailing streamers
    ribbon(
      hl(-0.03, 0.07, s * 0.05),
      hl(-0.25, 0.2, s * 0.14),
      hl(-0.7, 0.15, s * 0.3),
      hl(-1.0, -0.1, s * 0.38),
      0.05,
      v3(s * 0.4, 1, 0).normalize(),
      head,
      CRESTP,
      s * 1.7,
    );
  }

  // ------------------------------------------------------------------------------------------------- tail
  const tailFlames: Frame[] = [];
  const tailTipFlames: Frame[] = [];
  for (let k = -3; k <= 3; k++) {
    const a = Math.abs(k) / 3;
    const sx = Math.sign(k) * a;
    const path = ribbon(
      v3(sx * 0.08, 0.78 + a * 0.02, -0.4),
      v3(sx * 0.3, 0.64 + 0.05 * a, -0.95),
      v3(sx * 0.7, 1.0 - 0.15 * a, -1.5 + 0.35 * a),
      v3(sx * 1.0, 0.5 + 0.6 * a, -2.25 + 0.7 * a),
      0.15 - 0.035 * a,
      v3(1, 0, 0),
      tail.joints[1],
      TAILP,
      k * 1.3,
    );
    for (const t of [0.4, 0.62, 0.82]) tailFlames.push(frame(path.at(t), [0, 1, 0]));
    tailTipFlames.push(frame(path.at(1), path.tangentAt(1)));
  }
  glow(
    b.cards(tailFlames, FLAMES, {
      size: [0.09, 0.22],
      lean: 20,
      flow: [0, 0, -1],
      bend: 25,
      vary: 0.3,
      rng: r,
      bone: tail.joints[1],
    }),
    0.8,
  );
  glow(
    b.cards(tailTipFlames, FLAMES, {
      size: [0.13, 0.36],
      lean: 0,
      flow: [0, 1, 0],
      bend: 25,
      vary: 0.2,
      rng: r,
      bone: tail.joints[1],
    }),
    1,
  );

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
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      bone: leg.joints[0],
      at: [s * 0.16, 0.64, -0.04],
      scale: [0.09, 0.15, 0.11],
    });
    // anklets
    for (const t of [0.62, 0.78]) {
      const cp = leg.at(t);
      b.part(new THREE.TorusGeometry(t > 0.7 ? 0.034 : 0.04, 0.009, 6, 10), GOLD, {
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
        bone: cp.bone ?? tip,
      });
    }
    b.cards(b.ring(leg.at(0.5), { count: 7, radius: 0.045 }).items, FEATHER, {
      size: [0.05, 0.12],
      lean: 60,
      flow: [0, -1, 0],
      color: "#ff9a24",
      rng: r,
    });
    // toes and talons
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
  const AL = 20 * D2R;
  const BETA = 35 * D2R;
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const U = v3(s * Math.cos(AL), Math.sin(AL), 0);
    const T = v3(0, Math.sin(BETA), -Math.cos(BETA));
    T.addScaledVector(U, -T.dot(U)).normalize();
    const N = U.clone().cross(T).multiplyScalar(s).normalize();
    const dirAt = (phi: number) => U.clone().multiplyScalar(Math.cos(phi * D2R)).addScaledVector(T, Math.sin(phi * D2R));
    const along = (u: number, z: number) => v3(s * 0.2, 1.0, 0.1).addScaledVector(U, u).add(v3(0, 0, z));
    const armPath = catmull([along(0, 0), along(0.45, -0.1), along(0.95, 0.05), along(1.2, 0.06)]);
    const arm = b.chain(`wing${sd}`, armPath, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`],
      role: "wing",
    });
    const ARMP = scales(["#c4161c", "#d6241c", "#e0381c"], "#7c0c18", { size: 0.05, width: 0.12 });
    const armTube = b.sweep(arm, [0.085, 0.07, 0.05, 0.032], { color: ARMP });
    const [shoulder, elbow, wrist] = [arm.joints[0], arm.joints[1], arm.joints[2]];

    const feather = (root: V, d: V, L: number, w: number, ramp: string, bone: Joint, lift: number, band2 = true) => {
      const x = d.clone().normalize();
      const y = N.clone().cross(x).multiplyScalar(s).normalize();
      const at = root.clone().addScaledVector(N, lift);
      b.extrude(bladeOutline(L, w), {
        at,
        x,
        y,
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: featherPaint(L, ramp),
        bone,
      });
      if (band2) {
        b.part(new THREE.BoxGeometry(0.075, 0.035, 0.022), GOLD, {
          at: at.clone().addScaledVector(x, 0.07),
          dir: x,
          up: N,
          bone,
        });
      }
    };

    // primaries
    const PL = [0.7, 0.76, 0.8, 0.78, 0.74, 0.69, 0.64, 0.58, 0.52];
    const tipFrames: Frame[] = [];
    PL.forEach((L, i) => {
      const u = i / (PL.length - 1);
      const root = armPath.at(0.99 - 0.17 * u).clone();
      const d = dirAt(-6 + 8 * i).normalize();
      feather(root, d, L, 0.12, "primary", wrist, i * 0.004);
      tipFrames.push(frame(root.clone().addScaledVector(d, L).addScaledVector(N, i * 0.004), d));
    });
    glow(
      b.cards(tipFrames, FLAMES, { size: [0.11, 0.3], lean: 0, flow: N, bend: 25, vary: 0.2, rng: r, bone: wrist }),
      1,
    );
    // secondaries
    for (let j = 0; j < 9; j++) {
      const root = armPath.at(0.78 - 0.38 * (j / 8)).clone();
      feather(root, dirAt(70 + 3.5 * j), 0.62 - 0.01 * j, 0.115, "second", elbow, -0.016 - 0.004 * j);
    }
    // tertials
    for (let k = 0; k < 4; k++) {
      const root = armPath.at(0.34 - 0.07 * k).clone();
      feather(root, dirAt(96 + 5 * k), 0.34 - 0.02 * k, 0.1, "tert", shoulder, -0.06 - 0.004 * k, false);
    }

    // covert rows (feather cards lying flat on the wing plane)
    const coverRow = (count: number, t0: number, t1: number, p0: number, p1: number, lift: number, size: [number, number], tint: string) => {
      const frames: Frame[] = [];
      const flows: V[] = [];
      for (let i = 0; i < count; i++) {
        const u = i / (count - 1);
        frames.push(frame(armPath.at(t0 + (t1 - t0) * u).clone().addScaledVector(N, lift), N));
        flows.push(dirAt(p0 + (p1 - p0) * u));
      }
      b.cards(frames, FEATHER, { size, lean: 90, flow: (_f: Frame, i: number) => flows[i], color: tint, bone: wrist, vary: 0.08 });
    };
    coverRow(9, 0.82, 0.42, 62, 88, 0.05, [0.1, 0.26], "#e8381c");
    coverRow(8, 0.8, 0.36, 70, 92, 0.065, [0.085, 0.18], "#ff6a1f");
    coverRow(10, 0.95, 0.2, 78, 96, 0.08, [0.07, 0.12], "#ffa22a");

    // flame licks along the arm
    glow(
      b.cards(b.surface(armTube).scatter(10, { rng: r, minDist: 0.1 }), FLAMES, {
        size: [0.07, 0.16],
        lean: 50,
        flow: dirAt(45),
        bend: 25,
        vary: 0.3,
        rng: r,
      }),
      0.8,
    );

    // gold bracers and jewels
    const armSurf = b.surface(armTube);
    for (const jt of [elbow, wrist]) b.sweep(armSurf.loop(jt, { lift: 0.012 }), 0.014, { color: GOLDP });
    for (const t of [0.25, 0.55, 0.78]) {
      gemOn(armSurf.nearest(armPath.at(t).clone().addScaledVector(N, 0.2)), 0.9, 1.2);
    }
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
  tier(1.0, 0.98, 0, 0.07, STONE);
  tier(0.92, 0.9, 0.07, 0.13, STONE);
  tier(0.945, 0.945, 0.105, 0.125, GOLDP);
  tier(0.84, 0.82, 0.13, 0.18, STONE);
  b.part(new THREE.TorusGeometry(0.82, 0.012, 6, 32), GOLD, { at: [0, 0.182, 0], dir: [0, 1, 0], axis: "z", bone: hips });
  glow(
    b.part(new THREE.CircleGeometry(0.78, 40), "#ffffff", {
      at: [0, 0.1835, 0],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture: EMBLEM,
      bone: hips,
    }),
    0.9,
  );

  // ember braziers beside and behind
  const pylonFlames: Frame[] = [];
  for (const [az, rr] of [
    [70, 0.76],
    [-70, 0.76],
    [125, 0.74],
    [-125, 0.74],
  ] as const) {
    const x = Math.sin(az * D2R) * rr;
    const z = Math.cos(az * D2R) * rr;
    const y0 = 0.18;
    const shaft = b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.075, 0.3],
        [0, 0.3],
      ],
      { at: [x, y0, z], axis: [0, 1, 0], segments: 6, color: STONE, bone: hips },
    );
    b.lathe(
      [
        [0, 0.3],
        [0.11, 0.3],
        [0.13, 0.35],
        [0.11, 0.355],
        [0.09, 0.33],
        [0, 0.33],
      ],
      { at: [x, y0, z], axis: [0, 1, 0], segments: 8, color: GOLDP, bone: hips },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.07, 8, 6), EMBER_CORE, {
        at: [x, y0 + 0.335, z],
        scale: [1, 0.7, 1],
        bone: hips,
      }),
      1.3,
    );
    const hit = b.surface(shaft).around([x, y0 + 0.15, z]).at(az, 0);
    if (hit) glow(b.decal(shaft, RUNE, { at: hit, size: [0.07, 0.07], bone: hips }), 1);
    for (const [ox, oz] of [
      [0, 0],
      [0.03, 0.02],
      [-0.03, -0.02],
    ]) {
      pylonFlames.push(frame([x + ox, y0 + 0.34, z + oz], [0, 1, 0]));
    }
  }
  glow(
    b.cards(pylonFlames, FLAMES, {
      size: [0.15, 0.34],
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

  // floating embers
  const emberFrames: Frame[] = [];
  for (let i = 0; i < 70; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.4 + r() * 1.7;
    const y = 0.5 + r() * 1.4;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    if (Math.abs(x) < 0.4 && z > -0.7 && z < 0.55 && y > 0.5 && y < 1.7) continue;
    emberFrames.push(frame([x, y, z], [0, 1, 0]));
  }
  glow(
    b.cards(emberFrames, EMBER, { size: 0.07, vary: 0.6, cross: true, lean: 0, flow: [0, 0, 1], rng: r, bone: hips }),
    1.2,
  );

  // a slightly open beak
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
