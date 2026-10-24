import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  polyline,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  svg,
  offset,
} from "../../../../src/index";
import type { Rgb, Joint } from "../../../../src/index";

export const meta = {
  name: "Urushi Stag Beetle",
  description:
    "A male stag beetle in black urushi lacquer with gold maki-e: pine, sun, clouds and seigaiha waves on the wing cases, a chrysanthemum crest on the pronotum, a mitsudomoe on the head, vermilion lacquer eyes, belly, knees and antenna fans. Rigged in rest pose with hinged wing cases and separate mandibles and lower jaw.",
};

// ------------------------------------------------------------------------------------------------
// Units: authored in centimetres, built in metres.
const S = 0.01;
type V3t = [number, number, number];
const P = (x: number, y: number, z: number): V3t => [x * S, y * S, z * S];

// ------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#e0aa3a";
const GOLD_HI = "#f6d77a";
const VERM = "#bf2a1c";
const VERM_EYE = "#a81d14";
const GOLD_DK = "#4a2806";
const INK_HEX = "#0d0b10";

const LIGHT = new THREE.Vector3(0.35, 0.85, 0.4).normalize();

/** Black urushi: glossy blue-black with a baked highlight, red-brown undertone below and nashiji gold dust. */
function lacquer(seed: number, dust: number, tint: Rgb = [0.22, 0.05, 0.04]) {
  return paint((p, n) => {
    const lit = Math.max(0, n.dot(LIGHT));
    const wob = noise(p, 0.012, seed);
    let c: Rgb = mix([0.025, 0.023, 0.032], [0.11, 0.11, 0.16], Math.min(1, lit * 0.6 + wob * 0.25));
    const under = smoothstep(0.1, -0.8, n.y);
    c = mix(c, tint, under * 0.5 * smoothstep(0.35, 0.75, noise(p, 0.02, seed + 2)));
    c = mix(c, [0.66, 0.7, 0.86], Math.pow(lit, 16) * 0.6);
    if (dust > 0) {
      const q = cells(p, 0.0024, seed + 7);
      const gate = dust * (0.2 + 1.6 * smoothstep(0.3, 0.8, noise(p, 0.03, seed + 4)));
      if (q.id < gate && q.d1 < 0.34) c = mix(c, [0.95, 0.74, 0.3], 0.9);
    }
    return c;
  });
}

/** Burnished gold maki-e. */
const GOLDP = paint((p, n) => {
  const lit = Math.max(0, n.dot(LIGHT));
  const f = noise(p, 0.004, 11);
  let c: Rgb = mix("#8c5a14", "#eab84c", Math.min(1, 0.3 + 0.45 * lit + 0.25 * f));
  c = mix(c, "#fff0b0", Math.pow(lit, 10) * 0.7);
  return c;
});

/** Vermilion shu-nuri lacquer. */
const SHU = paint((p, n) => {
  const lit = Math.max(0, n.dot(LIGHT));
  let c: Rgb = mix("#6e100c", "#d83a24", Math.min(1, 0.25 + 0.5 * lit + 0.2 * noise(p, 0.01, 5)));
  c = mix(c, "#ffc9a0", Math.pow(lit, 14) * 0.5);
  return c;
});

const LQ_BODY = lacquer(3, 0.05);
const LQ_ELY = lacquer(8, 0.08);
const LQ_HEAD = lacquer(5, 0.06);
const LQ_LEG = lacquer(13, 0.04);
const LQ_MAND = lacquer(17, 0.03);

/** Abdomen: black flanks, vermilion belly with gold segment lines. */
const ABD = paint((p, n) => {
  if (n.y < -0.35) {
    const f = (((p.z / 0.0055) % 1) + 1) % 1;
    if (f < 0.1) return GOLDP;
  }
  return n.y < -0.2 ? SHU : LQ_BODY;
});

/** Legs: gold rings at hip, knee and ankle, red bands beside them, fine rings on the foot. */
function legPaint(k1: number, k2: number) {
  return paint((_p, _n, s) => {
    const t = s[0];
    const near = (a: number, w: number) => Math.abs(t - a) < w;
    if (near(k1, 0.012) || near(k2, 0.012) || t < 0.02) return GOLDP;
    if (near(k1, 0.026) || near(k2, 0.026) || (t > 0.02 && t < 0.04)) return SHU;
    if (t > k2 + 0.02) {
      const f = ((t - k2) / (1 - k2)) * 4;
      if (Math.abs((f % 1) - 0.5) > 0.4) return GOLDP;
    }
    return LQ_LEG;
  });
}

// ------------------------------------------------------------------------------------------------
// SVG maki-e drawings
const gd = (w: number, h: number) =>
  `<defs><linearGradient id="gd" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}"><stop offset="0" stop-color="#fff2b0"/><stop offset="0.45" stop-color="#e3ad3a"/><stop offset="1" stop-color="#946014"/></linearGradient></defs>`;

const fan = (cx: number, cy: number, aimDeg: number, spread: number, len: number, n: number) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = ((aimDeg + (i / (n - 1) - 0.5) * spread) * Math.PI) / 180;
    d += `M${cx} ${cy}L${(cx + Math.cos(a) * len).toFixed(1)} ${(cy + Math.sin(a) * len).toFixed(1)}`;
  }
  return d;
};

function elytraSvg(): string {
  const nodes: [number, number][] = [
    [30, 70],
    [48, 64],
    [60, 50],
    [74, 36],
    [86, 20],
  ];
  let needles = "";
  for (const [x, y] of nodes) needles += fan(x, y, -95, 120, 13, 7) + fan(x, y, 15, 90, 10, 5);
  const branch = "M14 82 C28 66 46 70 58 52 S78 30 88 18";
  const cloud = (x: number, y: number, sc: number) =>
    `<path transform="translate(${x} ${y}) scale(${sc})" d="M0 22 C0 12 10 6 18 10 C22 0 36 -2 42 6 C50 -2 64 2 66 12 C76 8 88 12 88 22 Z" fill="url(#gd)" stroke="${GOLD_DK}" stroke-width="1.3"/>` +
    `<path transform="translate(${x} ${y}) scale(${sc})" d="M10 22 C14 16 20 16 24 20 M34 18 C38 12 46 12 50 18 M58 20 C62 16 70 16 74 20" fill="none" stroke="${GOLD_DK}" stroke-width="1"/>`;
  let waves = "";
  for (let r = 0; r < 6; r++)
    for (let c = -1; c < 5; c++) {
      const cx = c * 26 + (r % 2 ? 13 : 0);
      const cy = 158 + r * 10;
      waves +=
        `<circle cx="${cx}" cy="${cy}" r="13" fill="${INK_HEX}" stroke="url(#gd)" stroke-width="1.7"/>` +
        `<circle cx="${cx}" cy="${cy}" r="9.4" fill="none" stroke="url(#gd)" stroke-width="1.4"/>` +
        `<circle cx="${cx}" cy="${cy}" r="5.8" fill="none" stroke="url(#gd)" stroke-width="1.2"/>` +
        `<circle cx="${cx}" cy="${cy}" r="2.4" fill="${VERM}"/>`;
    }
  return `<svg viewBox="0 0 100 220" xmlns="http://www.w3.org/2000/svg">${gd(100, 220)}
    <circle cx="30" cy="98" r="13" fill="${VERM}" stroke="url(#gd)" stroke-width="2.2"/>
    <path d="${branch}" fill="none" stroke="${GOLD_DK}" stroke-width="6.4" stroke-linecap="round"/>
    <path d="${branch}" fill="none" stroke="url(#gd)" stroke-width="4" stroke-linecap="round"/>
    <path d="${needles}" fill="none" stroke="${GOLD_DK}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="${needles}" fill="none" stroke="url(#gd)" stroke-width="1.6" stroke-linecap="round"/>
    ${cloud(6, 100, 1)}
    ${cloud(16, 122, 0.8)}
    <clipPath id="tail"><path d="M0 144 H100 V172 C100 198 80 214 50 220 C20 214 0 198 0 172 Z"/></clipPath>
    <g clip-path="url(#tail)">${waves}</g>
  </svg>`;
}

function kikuSvg(): string {
  let outer = "";
  let inner = "";
  for (let i = 0; i < 16; i++) {
    outer += `<ellipse cx="50" cy="21" rx="6.5" ry="16" transform="rotate(${i * 22.5} 50 50)" fill="url(#gd)" stroke="${GOLD_DK}" stroke-width="1"/>`;
    inner += `<ellipse cx="50" cy="29" rx="4.4" ry="10.5" transform="rotate(${i * 22.5 + 11.25} 50 50)" fill="${GOLD_HI}" stroke="${GOLD_DK}" stroke-width="0.8"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${gd(100, 100)}
    <circle cx="50" cy="50" r="48.5" fill="none" stroke="url(#gd)" stroke-width="2"/>
    ${outer}${inner}
    <circle cx="50" cy="50" r="11" fill="${VERM}" stroke="url(#gd)" stroke-width="2.4"/>
    <circle cx="50" cy="50" r="4" fill="url(#gd)"/>
  </svg>`;
}

function tomoeSvg(): string {
  const comma = [0, 120, 240]
    .map(
      (a) =>
        `<g transform="rotate(${a} 50 50)"><circle cx="50" cy="24" r="10" fill="url(#gd)" stroke="${GOLD_DK}" stroke-width="1"/>` +
        `<path d="M60 26 C58 40 64 52 78 56 C60 60 46 48 42 32 Z" fill="url(#gd)" stroke="${GOLD_DK}" stroke-width="1"/></g>`,
    )
    .join("");
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${gd(100, 100)}
    <circle cx="50" cy="50" r="47" fill="none" stroke="url(#gd)" stroke-width="3"/>
    <circle cx="50" cy="50" r="41" fill="none" stroke="url(#gd)" stroke-width="1.2"/>
    ${comma}
  </svg>`;
}

function eyeSvg(): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${gd(100, 100)}
    <defs><radialGradient id="rg" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#ff6a4a"/><stop offset="0.5" stop-color="#c4281c"/><stop offset="1" stop-color="#7a0f0b"/></radialGradient></defs>
    <circle cx="50" cy="50" r="47" fill="url(#rg)"/>
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gd)" stroke-width="5"/>
    <ellipse cx="50" cy="52" rx="21" ry="29" fill="${INK_HEX}"/>
    <ellipse cx="50" cy="52" rx="21" ry="29" fill="none" stroke="url(#gd)" stroke-width="2"/>
    <ellipse cx="41" cy="39" rx="7" ry="10" fill="#ffffff"/>
    <circle cx="60" cy="65" r="3.6" fill="#ffffff"/>
  </svg>`;
}

function asanohaSvg(): string {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${gd(100, 100)}
    <defs><pattern id="pt" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M0 0L20 20M20 0L0 20M10 0V20M0 10H20" stroke="url(#gd)" stroke-width="1.1" fill="none"/>
      <path d="M10 0L20 10L10 20L0 10Z" stroke="url(#gd)" stroke-width="0.8" fill="none"/>
    </pattern></defs>
    <rect x="3" y="3" width="94" height="94" rx="6" fill="url(#pt)" stroke="url(#gd)" stroke-width="3"/>
  </svg>`;
}

function vineSvg(): string {
  const d = "M4 42 C18 6 42 8 48 30 S72 54 80 36 C84 26 76 20 70 26 C66 30 70 36 74 34";
  const leaves = [
    [30, 14, -30],
    [60, 46, 40],
    [90, 30, 70],
    [18, 30, -70],
  ]
    .map(
      ([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="9" ry="4.5" transform="rotate(${r} ${x} ${y})" fill="url(#gd)" stroke="${GOLD_DK}" stroke-width="1"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">${gd(100, 60)}
    <path d="${d}" fill="none" stroke="${GOLD_DK}" stroke-width="6.5" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#gd)" stroke-width="3.6" stroke-linecap="round"/>
    ${leaves}
  </svg>`;
}

const TEX_ELY = svg(elytraSvg(), { size: 640 });
const TEX_KIKU = svg(kikuSvg(), { size: 384 });
const TEX_TOMOE = svg(tomoeSvg(), { size: 256 });
const TEX_EYE = svg(eyeSvg(), { size: 256 });
const TEX_ASANOHA = svg(asanohaSvg(), { size: 256 });
const TEX_VINE = svg(vineSvg(), { size: 256 });

// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "urushiStagBeetle" });
  const rnd = rng(11);

  // ---- skeleton ----------------------------------------------------------------------------
  const hips = b.joint("hips", { at: P(0, 1.8, -0.6), dir: [0, 0, 1], role: "spine" });
  const abdomenJ = b.joint("abdomen", { parent: hips, at: P(0, 1.6, -1.6), dir: [0, 0, -1], role: "spine" });
  const thorax = b.joint("thorax", { parent: hips, at: P(0, 2.0, 0.8), dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: P(0, 2.0, 2.8), dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.55, 3.7), dir: [0, 0, 1], role: "jaw" });

  // ---- abdomen -----------------------------------------------------------------------------
  const abd = b.loft(
    [
      { at: P(0, 1.4, 0.9), w: 2.2 * S, h: 0.95 * S },
      { at: P(0, 1.35, -0.6), w: 2.6 * S, h: 1.0 * S },
      { at: P(0, 1.35, -2.2), w: 2.6 * S, h: 1.0 * S },
      { at: P(0, 1.35, -3.4), w: 2.1 * S, h: 0.85 * S },
      { at: P(0, 1.3, -4.1), w: 1.2 * S, h: 0.6 * S },
    ],
    { bone: abdomenJ, color: ABD, sides: 12 },
  );
  b.decal(abd, TEX_ASANOHA, {
    at: P(0, 0.85, -1.4),
    dir: [0, -1, 0],
    up: [0, 0, 1],
    size: [2.0 * S, 4.4 * S],
    segments: 14,
    lift: 0.0012,
  });

  // ---- pronotum ----------------------------------------------------------------------------
  const pron = b.loft(
    [
      { at: P(0, 1.95, 0.35), w: 3.1 * S, h: 1.5 * S },
      { at: P(0, 2.0, 1.0), w: 3.45 * S, h: 1.8 * S },
      { at: P(0, 2.0, 2.0), w: 3.3 * S, h: 1.8 * S },
      { at: P(0, 1.95, 2.6), w: 2.7 * S, h: 1.5 * S },
      { at: P(0, 1.9, 2.95), w: 2.1 * S, h: 1.2 * S },
    ],
    { bone: thorax, color: LQ_BODY, sides: 14 },
  );
  b.decal(pron, TEX_KIKU, {
    at: P(0, 3.0, 1.55),
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [1.95 * S, 1.95 * S],
    segments: 18,
    lift: 0.0012,
  });
  const bead = new THREE.SphereGeometry(0.085 * S, 6, 4);
  for (const s of [1, -1]) {
    b.sweep(pron.line(s * 78, 0.0006), 0.05 * S, { bone: thorax, color: GOLDP });
    const lower = pron.line(s * 120, 0.0004);
    b.sweep(lower, 0.04 * S, { bone: thorax, color: SHU });
    b.along(lower.slice(0.08, 0.95), 8, (at) => b.stick(bead, GOLD, at, { embed: 0.3 }));
  }

  // ---- head --------------------------------------------------------------------------------
  const headC = P(0, 2.0, 3.5);
  const skull = b.loft(
    [
      { at: P(0, 2.0, 2.7), w: 2.2 * S, h: 1.3 * S },
      { at: P(0, 2.0, 3.4), w: 2.7 * S, h: 1.25 * S },
      { at: P(0, 1.95, 4.0), w: 2.4 * S, h: 1.05 * S },
      { at: P(0, 1.85, 4.35), w: 1.5 * S, h: 0.8 * S },
    ],
    { bone: head, color: LQ_HEAD, sides: 12 },
  );
  b.decal(skull, TEX_TOMOE, {
    at: P(0, 2.7, 3.45),
    dir: [0, 1, 0.1],
    up: [0, 0, 1],
    size: [0.95 * S, 0.95 * S],
    segments: 10,
    lift: 0.001,
  });
  b.frustumBox(P(0, 1.95, 4.55), P(0, 1.9, 4.85), [1.2 * S, 0.7 * S], [0.7 * S, 0.5 * S], {
    bone: head,
    color: LQ_HEAD,
  });
  b.rod(P(-0.35, 2.12, 4.84), P(0.35, 2.12, 4.84), 0.04 * S, { bone: head, color: GOLDP });

  const hs = b.surface(skull);
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // brow horns
    const hit = hs.around(headC).at(s * 55, 32);
    if (hit) b.stick(new THREE.ConeGeometry(0.2 * S, 0.6 * S, 6), LQ_HEAD, hit, { embed: 0.25 });
    // vermilion lacquer eyes with gold rims
    const ec = P(s * 1.08, 2.08, 3.7);
    const eye = b.part(new THREE.SphereGeometry(1, 10, 8), VERM_EYE, {
      at: ec,
      bone: head,
      scale: [0.36 * S, 0.38 * S, 0.4 * S],
    });
    const edir = new THREE.Vector3(s * 0.62, 0.12, 0.78).normalize();
    b.decal(eye, TEX_EYE, {
      at: offset(ec, edir, 0.36 * S),
      dir: edir,
      up: [0, 1, 0],
      size: [0.64 * S, 0.64 * S],
      segments: 10,
      mirror: s < 0,
      lift: 0.0008,
    });
    // palps on the lower jaw
    b.capsule(P(s * 0.4, 1.5, 4.5), P(s * 0.45, 1.52, 4.95), 0.07 * S, { bone: jaw, color: GOLDP });

    // ---- mandibles ----
    const mp = catmull([
      P(s * 0.7, 1.95, 3.95),
      P(s * 1.1, 2.0, 4.8),
      P(s * 1.2, 2.05, 5.8),
      P(s * 0.9, 2.1, 6.7),
      P(s * 0.35, 2.1, 7.2),
    ]);
    const mj = b.joint(`mandible${sd}`, { parent: head, at: mp.at(0), aim: mp.at(1), role: "jaw" });
    const sec: [number, number] = s > 0 ? [55, 125] : [-125, -55];
    const mand = b.sweep(
      mp,
      (t) => [S * (0.42 * Math.pow(1 - t, 0.85) + 0.05), S * (0.5 * Math.pow(1 - t, 0.85) + 0.05)],
      {
        bone: mj,
        caps: { start: "flat", end: "point" },
        sides: 10,
        bands: [
          [0.84, LQ_MAND],
          [1, GOLDP],
        ],
        sectors: [[sec[0], sec[1], SHU, 0.06, 0.84]],
      },
    );
    const teeth: [number, number, number][] = [
      [0.16, 0.2, 0.55],
      [0.38, 0.14, 0.36],
      [0.55, 0.12, 0.3],
      [0.72, 0.1, 0.24],
    ];
    for (const [t, r, h] of teeth) {
      const j = 1 + (rnd() - 0.5) * 0.12;
      b.stick(new THREE.ConeGeometry(r * S * j, h * S * j, 6), LQ_MAND, mand.at(t, s * 90), { embed: 0.25 });
    }
    b.sweep(mand.line(0, 0.0006).slice(0.08, 0.8), [0.05 * S, 0.02 * S], { bone: mj, color: GOLDP });
    const op = mand.at(0.2, -s * 90);
    b.decal(mand, TEX_VINE, {
      at: op,
      dir: op.n,
      up: [0, 1, 0],
      size: [1.1 * S, 0.66 * S],
      segments: 8,
      mirror: s < 0,
      lift: 0.0008,
    });

    // ---- antennae with lamella fans ----
    const ant = b.chain(
      `antenna${sd}`,
      polyline([P(s * 0.55, 2.2, 4.0), P(s * 0.95, 2.9, 4.7), P(s * 1.5, 3.1, 5.35), P(s * 1.95, 3.1, 5.9)]),
      {
        parent: head,
        role: "tentacle",
        names: [`antenna${sd}1`, `antenna${sd}2`, `antenna${sd}3`],
      },
    );
    b.sweep(ant, [0.1 * S, 0.07 * S], { color: LQ_LEG, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2 * S, 8, 6), GOLDP, { at: ant.at(0).at, bone: ant.joints[0] });
    b.part(new THREE.SphereGeometry(0.15 * S, 8, 6), SHU, { at: ant.at(0.36).at, bone: ant.joints[1] });
    [0.66, 0.76, 0.86, 0.96].forEach((t, i) => {
      const cp = ant.at(t);
      b.part(new THREE.BoxGeometry(0.22 * S, (0.66 - i * 0.08) * S, 0.05 * S), VERM, {
        at: offset(cp.at, cp.binormal, 0.22 * S),
        dir: cp.binormal,
        up: cp.tangent,
        bone: ant.joints[2],
      });
    });
  }

  // lower mouth parts
  b.frustumBox(P(0, 1.5, 3.7), P(0, 1.45, 4.55), [1.3 * S, 0.3 * S], [0.9 * S, 0.28 * S], {
    bone: jaw,
    color: SHU,
  });
  b.rod(P(-0.4, 1.46, 4.55), P(0.4, 1.46, 4.55), 0.05 * S, { bone: jaw, color: GOLDP });

  // ---- elytra (hinged wing cases) -------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hinge = b.joint(`elytra${sd}`, {
      parent: hips,
      at: P(s * 0.8, 2.75, 0.7),
      dir: [0, 0, -1],
      role: "hinge",
    });
    const st: [number, number, number, number, number][] = [
      [0.8, 2.05, 0.6, 1.45, 1.2],
      [0.8, 2.15, -0.4, 1.6, 1.5],
      [0.8, 2.12, -2.0, 1.6, 1.5],
      [0.75, 1.95, -3.5, 1.35, 1.2],
      [0.6, 1.75, -4.5, 0.7, 0.6],
    ];
    const ely = b.loft(
      st.map(([x, y, z, w, h]) => ({ at: P(s * x, y, z), w: w * S, h: h * S })),
      { bone: hinge, color: LQ_ELY, sides: 14 },
    );
    b.decal(ely, TEX_ELY, {
      at: P(s * 0.8, 2.9, -2.1),
      dir: [s * 0.18, 1, 0],
      up: [0, 0, 1],
      size: [1.35 * S, 4.5 * S],
      segments: 30,
      mirror: s < 0,
      lift: 0.0012,
    });
    // trims: gold shoulder line, red lacquer seam with gold rivets, gold suture
    b.sweep(ely.line(s * 80, 0.0006), 0.05 * S, { bone: hinge, color: GOLDP });
    const redLine = ely.line(s * 122, 0.0004);
    b.sweep(redLine, 0.04 * S, { bone: hinge, color: SHU });
    b.along(redLine.slice(0.1, 0.92), 10, (at) => b.stick(bead, GOLD, at, { embed: 0.3 }));
    b.sweep(ely.line(-s * 86, 0.0006), 0.05 * S, { bone: hinge, color: GOLDP });
  }

  // ---- legs ------------------------------------------------------------------------------------
  type LegDef = {
    tag: string;
    parent: Joint;
    fwd: number;
    hip: V3t;
    knee: V3t;
    ankle: V3t;
    toe: V3t;
    wide: number;
  };
  const LEGS: LegDef[] = [
    {
      tag: "F",
      parent: thorax,
      fwd: 1,
      hip: [0.95, 1.25, 2.3],
      knee: [2.7, 1.95, 3.4],
      ankle: [3.8, 0.72, 4.1],
      toe: [4.35, 0.07, 4.5],
      wide: 1.25,
    },
    {
      tag: "M",
      parent: hips,
      fwd: 0,
      hip: [1.1, 1.25, 0.4],
      knee: [3.0, 1.95, 0.9],
      ankle: [4.1, 0.72, 1.05],
      toe: [4.7, 0.07, 1.1],
      wide: 1.0,
    },
    {
      tag: "H",
      parent: hips,
      fwd: -1,
      hip: [1.0, 1.2, -1.7],
      knee: [2.9, 1.85, -2.9],
      ankle: [3.9, 0.72, -3.9],
      toe: [4.4, 0.07, -4.5],
      wide: 1.0,
    },
  ];
  const spineGeo = new THREE.ConeGeometry(0.075 * S, 0.38 * S, 5);
  const kneeGeo = new THREE.SphereGeometry(0.28 * S, 8, 6);
  const ankleGeo = new THREE.SphereGeometry(0.17 * S, 8, 6);
  const coxaGeo = new THREE.SphereGeometry(0.43 * S, 8, 6);

  for (const L of LEGS) {
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const pts = [L.hip, L.knee, L.ankle, L.toe].map(([x, y, z]) => P(s * x, y, z));
      const path = polyline(pts);
      const k1 = path.closestT(pts[1]);
      const k2 = path.closestT(pts[2]);
      const chain = b.chain(`leg${L.tag}${sd}`, path, {
        parent: L.parent,
        role: "leg",
        names: [`hip${L.tag}${sd}`, `knee${L.tag}${sd}`, `ankle${L.tag}${sd}`, `foot${L.tag}${sd}`],
        contact: P(s * L.toe[0], 0, L.toe[2]),
      });
      const wide = L.wide;
      const rad = (t: number) => {
        let r: number;
        if (t < k1) r = 0.36 - 0.06 * (t / k1);
        else if (t < k2) {
          const u = (t - k1) / (k2 - k1);
          r = 0.2 + 0.07 * wide * Math.sin(Math.PI * u) - 0.04 * u;
        } else r = 0.085 - 0.015 * ((t - k2) / (1 - k2));
        return r * S;
      };
      const leg = b.sweep(chain, rad, { color: legPaint(k1, k2), sides: 8 });

      b.part(coxaGeo, LQ_LEG, { at: pts[0], bone: chain.joints[0] });
      b.part(kneeGeo, SHU, { at: pts[1], bone: chain.joints[1] });
      b.part(ankleGeo, GOLDP, { at: pts[2], bone: chain.joints[2] });

      // tibial spines
      const edges =
        L.fwd === 1 ? [s * 90] : L.fwd === -1 ? [-s * 90] : [s * 90, -s * 90];
      for (const ang of edges)
        for (const u of [0.35, 0.6, 0.85]) {
          b.stick(spineGeo, LQ_LEG, leg.at(k1 + (k2 - k1) * u, ang), { embed: 0.25 });
        }
      // claws
      const toeP = pts[3];
      const foot = chain.tip ?? chain.joints[2];
      const fz = L.fwd >= 0 ? 0.6 : 0.35;
      for (const spread of [-0.45, 0.45]) {
        b.spike(toeP, [s * 0.5, -0.15, fz + spread], 0.3 * S, 0.05 * S, { color: GOLD, bone: foot });
      }
    }
  }

  return b.root;
}
