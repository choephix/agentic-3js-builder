```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  paint,
  noise,
  mix,
  smoothstep,
  resolve,
  grain,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Plague Doctor",
  description:
    "A Darkest Dungeon style plague doctor: bone-leather beaked mask with glowing glass lenses, wide-brimmed hat with crimson band and crow feathers, tattered greatcoat and capelet, bandolier of glowing tinctures, satchel with an alchemical sigil, and an iron lantern hung from the left hand. Rigged in an A-pose with an opening beak.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small vector helpers

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const walk = (base: THREE.Vector3, d: THREE.Vector3, k: number) => base.clone().addScaledVector(d, k);
const frac = (x: number) => x - Math.floor(x);
const zigzag = (x: number) => Math.abs(frac(x) * 2 - 1);
function must<T>(x: T | null | undefined, what: string): T {
  if (x === null || x === undefined) throw new Error(`plague doctor: could not place ${what}`);
  return x;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette: Darkest Dungeon is near-black wool, bone leather, dried crimson, tarnished brass, sickly light.

const INK = "#0d0908";
const WARM = "#ead39c";
const COOL = "#1a2030";
const GRIME = "#1b120c";
const MUD = "#3a2c1c";
const BONE = "#cdbd98";
const STITCH = "#2a1810";
const THREAD = "#8f7d5e";
const TWINE = "#6d5634";
const CORK = "#6b4a2b";
const PARCH = "#d6c39a";
const SOLE = "#1a1210";

const LIGHT = new THREE.Vector3(0.35, 0.8, 0.45).normalize();

type Shade = { grime?: number; hatch?: number; seed?: number };

/** The house style: warm key light on top, cool blue shadow below, grime blotches and inked hatching in shade. */
function dd(base: ColorInput, o: Shade = {}) {
  const grime = o.grime ?? 0.28;
  const k = o.hatch ?? 0.016;
  const seed = o.seed ?? 3;
  return paint((p, n) => {
    const l = n.dot(LIGHT);
    let c = resolve(base, p, n);
    c = mix(c, WARM, 0.24 * smoothstep(0.45, 0.95, l));
    c = mix(c, COOL, 0.42 * smoothstep(0.1, -0.75, l));
    c = mix(c, GRIME, grime * smoothstep(0.52, 0.82, noise(p, 0.07, seed)));
    if (l < 0.02) {
      const h = (p.x * 0.55 + p.y - p.z * 0.45) / k;
      const f = h - Math.floor(h);
      const w = 0.1 + 0.32 * smoothstep(0.02, -0.8, l);
      if (f < w) c = mix(c, INK, 0.62);
    }
    return c;
  });
}

// Base materials
const COAT = dd(grain("#27231f", "#352e28", { size: 0.012, axis: "y", seed: 2 }), { grime: 0.25 });
const CAPE_BASE = dd(grain("#211d1c", "#2e2826", { size: 0.01, axis: "y", seed: 21 }), { hatch: 0.015 });
const CRIMSON = dd(mottle("#7b1d18", "#561310", { size: 0.03, seed: 12 }), { grime: 0.15 });
const LEATHER = dd(mottle("#5a3420", "#40251a", { size: 0.03, seed: 11 }));
const LEATHER_DK = dd(mottle("#2e1e16", "#3c281c", { size: 0.025, seed: 14 }));
const GLOVE = dd(mottle("#2b1f19", "#3a2a20", { size: 0.025, seed: 13 }), { hatch: 0.012 });
const TROUSER = dd(grain("#2a2726", "#36312f", { size: 0.015, axis: "y", seed: 15 }));
const HAT = dd(mottle("#17151a", "#26222b", { size: 0.03, seed: 8 }), { grime: 0.15, hatch: 0.014 });
const BONE_P = dd(mottle("#ded2b4", "#bfae88", { size: 0.02, seed: 30 }), { hatch: 0.008, grime: 0.35 });
const BRASS = metal("brass", { tarnish: 0.55, verdigris: 0.35, polish: 0.25 });
const IRON = metal("iron", { tarnish: 0.45 });
const BOOT_BASE = dd(mottle("#2e211a", "#3f2d21", { size: 0.03, seed: 16 }), { hatch: 0.012 });

const BOOT = paint((p, n) => {
  const c = resolve(BOOT_BASE, p, n);
  const m = smoothstep(0.14, 0.02, p.y) * (0.55 + 0.45 * noise(p, 0.03, 17));
  return mix(c, MUD, 0.75 * m);
});

const MASK_BASE = dd(mottle("#dccdaa", "#b8a47e", { size: 0.035, seed: 4 }), { hatch: 0.012, grime: 0.2 });
const MASK = paint((p, n) => {
  // a stitched seam running up the brow
  if (p.z > 0.06 && p.y > 1.722 && Math.abs(p.x) < 0.0024) return frac(p.y / 0.009) < 0.55 ? STITCH : MASK_BASE;
  // cheek seams curving round under the lenses
  const cheek = Math.abs(Math.abs(p.x) - (0.082 - (1.66 - p.y) * 0.4));
  if (p.y < 1.66 && p.y > 1.58 && p.z > 0.04 && cheek < 0.0022) return frac(p.y / 0.008) < 0.5 ? STITCH : MASK_BASE;
  return resolve(MASK_BASE, p, n);
});

const HOOD_BASE = dd(grain("#1f1b1c", "#2c2627", { size: 0.01, axis: "y", seed: 19 }), { hatch: 0.013 });
const HOOD = paint((p, n) => {
  if (p.z < -0.08 && Math.abs(p.x) < 0.003 && frac(p.y / 0.011) < 0.5) return THREAD;
  return resolve(HOOD_BASE, p, n);
});

const CAPE = paint((p, n) => {
  if (p.y < 1.3) {
    const ang = Math.atan2(p.x, p.z) * 0.3;
    if (Math.abs(p.y - 1.288) < 0.0026 && frac(ang / 0.012) < 0.55) return BONE;
    return resolve(CRIMSON, p, n);
  }
  return resolve(CAPE_BASE, p, n);
});

const SKIRT = paint((p, n) => {
  if (p.z > 0 && Math.abs(p.x) < 0.0045) return INK; // front opening
  const ang = Math.atan2(p.x, p.z) * 0.27;
  if (p.y < 0.352 && p.y > 0.308) {
    const zz = 0.326 + 0.012 * zigzag(ang / 0.035);
    if (Math.abs(p.y - zz) < 0.0028) return BONE;
    return resolve(CRIMSON, p, n);
  }
  let c = resolve(COAT, p, n);
  const m = smoothstep(0.62, 0.3, p.y) * (0.45 + 0.55 * noise(p, 0.05, 23));
  c = mix(c, MUD, 0.55 * m);
  // a few dried stains
  c = mix(c, "#3a0d0a", 0.6 * smoothstep(0.7, 0.8, noise(p, 0.04, 29)));
  return c;
});

/** Beak leather: stitched seams along the top and bottom, a darkened tip spattered with dried blood. */
function beakPaint(seed: number) {
  const base = dd(mottle("#d6c59e", "#ad9770", { size: 0.03, seed }), { hatch: 0.011, seed, grime: 0.22 });
  return paint((p, n, s) => {
    const d = ((s[1] % 360) + 360) % 360;
    const top = Math.min(d, 360 - d);
    const bottom = Math.abs(d - 180);
    const seam = Math.min(top, bottom);
    if (seam < 2.5) return STITCH;
    if (seam < 9 && frac(s[0] * 34) < 0.3) return STITCH;
    let c = resolve(base, p, n);
    c = mix(c, "#5a4430", 0.55 * smoothstep(0.62, 1, s[0]));
    const blood = smoothstep(0.6, 0.74, noise(p, 0.012, seed + 40)) * smoothstep(0.5, 0.9, s[0]);
    c = mix(c, "#4a0e0b", 0.85 * blood);
    return c;
  });
}

function featherPaint(dark: string, light: string, sheen: string) {
  return paint((_p, n, s) => {
    const w = Math.abs(s[1]);
    if (w < 0.0016) return BONE;
    let c = mix(dark, light, smoothstep(0.0, 0.03, w));
    if (frac((s[0] * 0.5 + w) / 0.006) < 0.25) c = mix(c, "#000000", 0.5);
    c = mix(c, sheen, 0.45 * smoothstep(0.3, 1, n.y));
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const LENS = svg(
  `<svg viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="0.45" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#fbffc6"/><stop offset="0.4" stop-color="#c2e65c"/>
      <stop offset="0.82" stop-color="#456320"/><stop offset="1" stop-color="#16200c"/></radialGradient></defs>
    <circle cx="32" cy="32" r="32" fill="#120a06"/>
    <circle cx="32" cy="32" r="29" fill="url(#g)"/>
    <circle cx="32" cy="32" r="21" fill="none" stroke="#2c3d14" stroke-width="2"/>
    <circle cx="33" cy="34" r="6" fill="#1e2a0e"/>
    <path d="M13 27 Q19 12 36 9" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="45" cy="45" r="3.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

function glassMarkup() {
  let panes = "";
  for (let i = 0; i < 6; i++) {
    const x = i * 50;
    const cx = x + 25;
    panes += `<rect x="${x}" y="0" width="50" height="100" fill="url(#amb)"/>
      <path d="M${cx} 24 Q${cx + 13} 52 ${cx + 9} 68 Q${cx} 84 ${cx - 9} 68 Q${cx - 13} 52 ${cx} 24Z" fill="#ffab38"/>
      <path d="M${cx} 40 Q${cx + 6} 58 ${cx + 4} 68 Q${cx} 76 ${cx - 4} 68 Q${cx - 6} 58 ${cx} 40Z" fill="#fffbe2"/>
      <rect x="${cx - 2}" y="74" width="4" height="16" fill="#e8dcc0"/>
      <rect x="${x}" y="0" width="4" height="100" fill="#120c08"/>
      <rect x="${x + 46}" y="0" width="4" height="100" fill="#120c08"/>`;
  }
  return `<svg viewBox="0 0 300 100">
    <defs>
      <linearGradient id="amb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b85e16"/><stop offset="0.5" stop-color="#ffd36a"/><stop offset="1" stop-color="#d9832a"/></linearGradient>
      <linearGradient id="soot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000000" stop-opacity="0.85"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient>
    </defs>
    ${panes}
    <rect x="0" y="0" width="300" height="32" fill="url(#soot)"/>
    <rect x="0" y="0" width="300" height="6" fill="#120c08"/>
    <rect x="0" y="94" width="300" height="6" fill="#120c08"/>
    <rect x="0" y="17" width="300" height="3" fill="#1c140e"/>
  </svg>`;
}
const GLASS = svg(glassMarkup(), { size: 512 });

const TATTER = svg(
  `<svg viewBox="0 0 40 64">
    <path d="M1 64 L39 64 L38 44 L35 24 L32 34 L29 9 L24 26 L20 3 L16 22 L12 12 L9 32 L5 19 L2 44 Z" fill="#9a9a9a"/>
    <path d="M11 64 L11 34 M20 64 L20 16 M29 64 L29 26" stroke="#6c6c6c" stroke-width="3" fill="none"/>
    <rect x="1" y="56" width="38" height="8" fill="#7a7a7a"/>
    <path d="M3 58 L37 58" stroke="#b4b4b4" stroke-width="1.6" stroke-dasharray="2.5 2.5"/>
  </svg>`,
  { size: 128 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 64 64">
    <rect width="64" height="64" rx="6" fill="#3a2418"/>
    <rect x="4" y="4" width="56" height="56" rx="4" fill="none" stroke="#c9b48a" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="32" cy="32" r="19" fill="none" stroke="#8c1f1a" stroke-width="4"/>
    <path d="M32 15 L48 44 L16 44 Z" fill="none" stroke="#d8c7a0" stroke-width="3" stroke-linejoin="round"/>
    <path d="M32 10 L32 54 M22 26 L42 26" stroke="#d8c7a0" stroke-width="3"/>
    <circle cx="32" cy="35" r="4" fill="#8c1f1a"/>
    <path d="M22 50 Q27 44 32 50 Q37 56 42 50" stroke="#8c1f1a" stroke-width="2.5" fill="none"/>
  </svg>`,
  { size: 256 },
);

const LABEL = svg(
  `<svg viewBox="0 0 32 48">
    <rect x="1" y="1" width="30" height="46" rx="2" fill="#dccba0" stroke="#3a2416" stroke-width="2"/>
    <circle cx="16" cy="18" r="8" fill="#2a1a10"/>
    <rect x="11" y="23" width="10" height="6" fill="#2a1a10"/>
    <circle cx="13" cy="17" r="2.4" fill="#dccba0"/><circle cx="19" cy="17" r="2.4" fill="#dccba0"/>
    <path d="M7 36 L25 36 M9 41 L23 41" stroke="#7a1e1a" stroke-width="2"/>
  </svg>`,
  { size: 96 },
);

const HERB = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 64 L16 6 M16 42 L7 22 M16 34 L25 14 M16 52 L8 38 M16 48 L25 32" stroke="#5a4a24" stroke-width="2.4" fill="none"/>
    <g fill="#7d8540">
      <ellipse cx="16" cy="8" rx="3" ry="6"/><ellipse cx="8" cy="22" rx="3" ry="5" transform="rotate(-30 8 22)"/>
      <ellipse cx="24" cy="15" rx="3" ry="5" transform="rotate(30 24 15)"/><ellipse cx="9" cy="37" rx="2.6" ry="4.6" transform="rotate(-35 9 37)"/>
      <ellipse cx="24" cy="31" rx="2.6" ry="4.6" transform="rotate(35 24 31)"/>
    </g>
    <g fill="#a8a35c">
      <ellipse cx="13" cy="28" rx="2" ry="4" transform="rotate(-20 13 28)"/><ellipse cx="19" cy="22" rx="2" ry="4" transform="rotate(20 19 22)"/>
      <circle cx="20" cy="9" r="2"/><circle cx="11" cy="13" r="2"/>
    </g>
    <rect x="11" y="53" width="10" height="5" fill="#7a1e1a"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "plague-doctor", paintSize: 2048 });

  // =============================================================================================================
  // Skeleton: hips, spine, neck, head with a hinged lower beak.

  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 1.02, 0],
      [0, 1.22, 0.005],
      [0, 1.42, -0.005],
    ],
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.47, -0.005], aim: [0, 1.58, 0.005], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.58, 0.005], dir: [0, 1, 0], role: "head" });

  // Beak centrelines: the upper beak rides the head, the lower beak rides the jaw.
  const UP0 = V(0, 1.61, 0.09);
  const upperPath = bezier(UP0, V(0, 1.615, 0.24), V(0, 1.57, 0.35), V(0, 1.49, 0.41));
  const J0 = V(0, 1.585, 0.09);
  const J3 = V(0, 1.475, 0.375);
  const jawPath = bezier(J0, V(0, 1.565, 0.22), V(0, 1.52, 0.32), J3);
  const jaw = b.joint("jaw", { parent: head, at: J0, aim: J3, role: "jaw" });

  // =============================================================================================================
  // Torso: a heavy greatcoat body, long flared skirt and a shoulder capelet.

  const torso = b.loft(
    [
      { at: [0, 0.86, 0], w: 0.32, h: 0.235 },
      { at: [0, 1.0, 0.005], w: 0.34, h: 0.25 },
      { at: [0, 1.2, 0.012], w: 0.36, h: 0.25 },
      { at: [0, 1.37, 0], w: 0.41, h: 0.235 },
      { at: [0, 1.5, -0.005], w: 0.18, h: 0.15 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  const torsoSurf = b.surface(torso);

  b.rod([0, 1.47, -0.005], [0, 1.6, 0.01], 0.05, HOOD, { bone: neck, sides: 8 });

  // Long coat skirt: an elliptical shell turned from a profile, tucked under the belt.
  const skirtProfile = [
    [0.3, 0],
    [0.268, 0.2],
    [0.225, 0.42],
    [0.18, 0.6],
    [0.168, 0.69],
    [0.148, 0.69],
    [0.16, 0.6],
    [0.205, 0.42],
    [0.248, 0.2],
    [0.28, 0],
    [0.3, 0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const skirt = b.part(new THREE.LatheGeometry(skirtProfile, 18), SKIRT, {
    bone: hips,
    at: [0, 0.3, 0],
    scale: [1, 1, 0.74],
    flat: true,
    name: "skirt",
  });
  const skirtSurf = b.surface(skirt);
  const waistSurf = b.surface([skirt, torso]);

  // Shoulder capelet, flattened front to back, with a crimson stitched hem.
  const capeProfile = [
    [0.32, 0],
    [0.31, 0.03],
    [0.25, 0.15],
    [0.16, 0.25],
    [0.095, 0.3],
    [0.075, 0.3],
    [0.14, 0.25],
    [0.23, 0.15],
    [0.29, 0.03],
    [0.3, 0],
    [0.32, 0],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  b.part(new THREE.LatheGeometry(capeProfile, 18), CAPE, {
    bone: chest,
    at: [0, 1.27, 0],
    scale: [1, 1, 0.66],
    flat: true,
    name: "capelet",
  });

  // Tattered hems: hanging cloth strips round the capelet and the skirt.
  function hem(y: number, r: number, zScale: number, count: number, skipFront: number) {
    const frames = [];
    const flows: number[][] = [];
    for (let i = 0; i < count; i++) {
      const th = (i / count) * Math.PI * 2 + 0.13;
      const deg = ((th * 180) / Math.PI) % 360;
      if (Math.min(deg, 360 - deg) < skipFront) continue;
      const x = Math.sin(th) * r;
      const z = Math.cos(th) * r * zScale;
      frames.push(frame([x, y, z], [0, 1, 0]));
      flows.push([Math.sin(th), 0, Math.cos(th) * zScale]);
    }
    return { frames, flows };
  }
  const capeHem = hem(1.276, 0.305, 0.66, 22, 0);
  b.cards(capeHem.frames, TATTER, {
    size: [0.075, 0.09],
    lean: 180,
    flow: (_f, i) => capeHem.flows[i],
    vary: 0.3,
    rng: rng(5),
    color: "#5e4038",
    bone: chest,
  });
  const skirtHem = hem(0.31, 0.29, 0.74, 24, 14);
  b.cards(skirtHem.frames, TATTER, {
    size: [0.08, 0.11],
    lean: 180,
    flow: (_f, i) => skirtHem.flows[i],
    vary: 0.3,
    rng: rng(6),
    color: "#6a5c50",
    bone: hips,
  });

  // Capelet clasp: two brass discs and a sagging chain under the beak.
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 10), BRASS, {
      bone: chest,
      at: [s * 0.05, 1.5, 0.118],
      dir: [0, 0.3, 1],
    });
  b.sweep(bezier([0.05, 1.5, 0.123], [0, 1.465, 0.135], [-0.05, 1.5, 0.123]), 0.0032, {
    color: BRASS,
    bone: chest,
    sides: 4,
  });

  // =============================================================================================================
  // Belt, straps, buttons, tinctures.

  const belt = torsoSurf.loop([0, 1.0, 0], { lift: 0.012 });
  b.sweep(belt, 0.021, { color: LEATHER, sides: 6, bone: hips });

  // Brass buckle with a little bone skull.
  const front = must(torsoSurf.ray([0, 1.0, 0.5], [0, 0, -1]), "buckle");
  const bn = front.n.clone();
  const buckleAt = walk(front.at, bn, 0.03);
  b.part(new THREE.BoxGeometry(0.074, 0.062, 0.01), BRASS, { bone: hips, at: buckleAt, dir: bn, axis: "z" });
  b.part(new THREE.BoxGeometry(0.048, 0.038, 0.012), LEATHER_DK, { bone: hips, at: buckleAt, dir: bn, axis: "z" });
  const skullAt = walk(buckleAt, bn, 0.01);
  b.part(new THREE.SphereGeometry(0.014, 8, 6), BONE_P, { bone: hips, at: skullAt, scale: [1, 1.05, 0.8] });
  b.part(new THREE.BoxGeometry(0.014, 0.008, 0.01), BONE_P, { bone: hips, at: walk(skullAt, V(0, -1, 0), 0.013) });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0042, 6, 4), INK, {
      bone: hips,
      at: skullAt.clone().add(V(s * 0.0055, 0.002, 0.011)),
    });

  // Crossed straps: a bandolier (right shoulder to left hip) and a satchel strap (left shoulder to right hip).
  const bandolier = torsoSurf.drape(
    catmull(
      [
        [-0.17, 1.44, 0.05],
        [0, 1.22, 0.16],
        [0.17, 1.0, 0.1],
        [0.19, 0.98, -0.05],
        [0, 1.2, -0.16],
        [-0.19, 1.45, -0.03],
      ],
      { closed: true },
    ),
    { lift: 0.012 },
  );
  b.sweep(bandolier, 0.012, { color: LEATHER, sides: 6, bone: chest });
  const satchelStrap = torsoSurf.drape(
    catmull(
      [
        [0.17, 1.44, 0.05],
        [0, 1.2, 0.16],
        [-0.2, 0.95, 0.1],
        [-0.21, 0.96, -0.05],
        [0, 1.18, -0.16],
        [0.19, 1.45, -0.03],
      ],
      { closed: true },
    ),
    { lift: 0.018 },
  );
  b.sweep(satchelStrap, 0.01, { color: LEATHER_DK, sides: 6, bone: chest });

  // Glowing tinctures on the bandolier, each with cork, brass collar, holster band and a skull label.
  const VIALS = ["#a6ff4d", "#ff4a2e", "#8dff9a", "#d7ff3a", "#ff4a2e"];
  for (let i = 0; i < 5; i++) {
    const f = 0.48 + i * 0.1;
    const x = -0.17 + 0.34 * f;
    const y = 1.44 - 0.44 * f;
    const vh = must(torsoSurf.ray([x, y, 0.5], [0, 0, -1]), "vial");
    const n = vh.n.clone();
    n.y = 0;
    n.normalize();
    const c = walk(vh.at, n, 0.026);
    const bone = vh.bone ?? spine.joints[0];
    glow(b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.056, 6), VIALS[i], { bone, at: c }), 1.4);
    b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.006, 6), BRASS, { bone, at: c.clone().add(V(0, 0.029, 0)) });
    b.part(new THREE.CylinderGeometry(0.0085, 0.0075, 0.014, 6), CORK, { bone, at: c.clone().add(V(0, 0.038, 0)) });
    b.part(new THREE.BoxGeometry(0.032, 0.011, 0.026), LEATHER_DK, {
      bone,
      at: walk(c, n, -0.004).add(V(0, -0.016, 0)),
    });
    b.part(new THREE.PlaneGeometry(0.018, 0.024), "#ffffff", {
      bone,
      at: walk(c, n, 0.0128).add(V(0, 0.004, 0)),
      dir: n,
      axis: "z",
      texture: LABEL,
    });
  }

  // Coat buttons: two short rows on the chest, a double row down the skirt.
  for (const s of [1, -1]) {
    for (const y of [1.08, 1.15]) {
      const h = torsoSurf.ray([s * 0.05, y, 0.5], [0, 0, -1]);
      if (h) b.stick(new THREE.SphereGeometry(0.0095, 6, 4), BRASS, h, { embed: 0.4 });
    }
    for (const y of [0.46, 0.58, 0.7, 0.82]) {
      const h = skirtSurf.ray([s * 0.034, y, 0.6], [0, 0, -1]);
      if (h) b.stick(new THREE.SphereGeometry(0.009, 6, 4), BRASS, h, { embed: 0.4, bone: hips });
    }
  }

  // Belt pouches hanging on the skirt, each with a flap and a brass stud.
  for (const az of [40, -40, 165]) {
    const h = must(waistSurf.around([0, 0.935, 0]).at(az, 0), "pouch");
    const pouch = b.stick(new THREE.BoxGeometry(0.085, 0.045, 0.095), LEATHER, h, {
      flow: [0, 1, 0],
      embed: 0.25,
      bone: hips,
    });
    b.part(new THREE.BoxGeometry(0.091, 0.012, 0.046), LEATHER_DK, {
      frame: pouch,
      at: pouch.local([0, 0.026, 0.027]),
      bone: hips,
    });
    b.part(new THREE.SphereGeometry(0.0075, 6, 4), BRASS, { at: pouch.local([0, 0.033, 0.01]), bone: hips });
  }

  // Satchel at the right hip, flap embroidered with an alchemical sigil, a scroll poking out behind.
  const SX = -0.235;
  b.part(new THREE.BoxGeometry(0.075, 0.17, 0.23), LEATHER, { bone: hips, at: [SX, 0.86, 0] });
  b.part(new THREE.BoxGeometry(0.082, 0.086, 0.236), LEATHER_DK, { bone: hips, at: [SX - 0.002, 0.912, 0] });
  b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
    bone: hips,
    at: [SX - 0.0445, 0.885, 0],
    dir: [-1, 0, 0],
    axis: "z",
    texture: SIGIL,
  });
  for (const z of [0.065, -0.065]) {
    b.part(new THREE.BoxGeometry(0.008, 0.06, 0.018), LEATHER_DK, { bone: hips, at: [SX - 0.04, 0.85, z] });
    b.part(new THREE.BoxGeometry(0.008, 0.022, 0.024), BRASS, { bone: hips, at: [SX - 0.043, 0.826, z] });
  }
  b.rod([SX + 0.005, 0.93, -0.075], [SX + 0.015, 1.03, -0.125], 0.015, PARCH, { bone: hips, sides: 7 });
  b.rod([SX + 0.008, 0.975, -0.097], [SX + 0.009, 0.983, -0.101], 0.0165, CRIMSON, { bone: hips, sides: 7 });

  // A bird-skull charm swinging from the belt.
  const charm = must(torsoSurf.around([0, 1.0, 0]).at(16, 0), "charm");
  const a0 = walk(charm.at, charm.n, 0.03);
  const skullC = a0.clone().add(V(0, -0.115, 0.04));
  b.rod(a0, skullC.clone().add(V(0, 0.018, 0)), 0.0025, TWINE, { bone: hips, sides: 4 });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), BONE_P, { bone: hips, at: skullC, scale: [1, 0.9, 1.1] });
  const beakDir = V(0, -0.55, 1).normalize();
  b.spike(walk(skullC, beakDir, 0.016), beakDir, 0.06, 0.01, { color: BONE_P, bone: hips, sides: 5 });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.0062, 6, 4), INK, { bone: hips, at: skullC.clone().add(V(s * 0.013, 0.004, 0.015)) });

  // A dried herb bundle hanging upside down at the left hip.
  const herbHit = must(torsoSurf.around([0, 1.0, 0]).at(78, 0), "herbs");
  const herbAt = walk(herbHit.at, herbHit.n, 0.04);
  b.cards(
    [-0.015, 0, 0.015].map((dz) => frame(herbAt.clone().add(V(0, -0.005, dz)), [0, 1, 0])),
    HERB,
    { size: [0.075, 0.15], lean: 180, flow: herbHit.n, cross: true, vary: 0.2, rng: rng(9), bone: hips },
  );
  b.rod(walk(herbAt, V(0, 1, 0), 0.01), walk(herbAt, V(0, -1, 0), 0.012), 0.012, CRIMSON, { bone: hips, sides: 6 });

  // =============================================================================================================
  // Arms in an A-pose: greatcoat sleeves, crimson turned-back cuffs, chunky gloves with five fingers.

  const hands: { s: number; wrist: Joint; pc: THREE.Vector3; dir: THREE.Vector3 }[] = [];
  const FINGERS = ["pinky", "ring", "middle", "index"];
  const FZ = [-0.034, -0.0115, 0.0115, 0.034];
  const FLEN = [0.062, 0.078, 0.084, 0.076];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const dir = V(s * 0.77, -0.64, 0).normalize();
    const upv = V(0, 1, 0).addScaledVector(dir, -dir.y).normalize();
    const sh = V(s * 0.19, 1.43, -0.01);
    const el = walk(sh, dir, 0.29).add(V(0, 0, 0.02));
    const wr = walk(el, dir, 0.27);
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const wrist = must(arm.tip, "wrist");
    const elbow = arm.joints[1];

    b.sweep(arm, [0.07, 0.06, 0.054], { color: COAT, sides: 8 });

    // elbow patch
    b.part(new THREE.SphereGeometry(0.045, 8, 6), LEATHER_DK, {
      bone: elbow,
      at: walk(el, V(0, 0, -1), 0.022),
      scale: [1, 1, 0.5],
    });

    // turned-back cuff with bone trim and brass buttons
    const cuff = b.sweep([walk(wr, dir, -0.075), walk(wr, dir, 0.012)], [0.062, 0.084], {
      color: CRIMSON,
      caps: "flat",
      sides: 8,
      bone: elbow,
    });
    b.sweep([walk(wr, dir, 0.004), walk(wr, dir, 0.013)], 0.087, { color: BONE_P, caps: "flat", sides: 8, bone: elbow });
    for (const deg of [-20, 20]) b.stick(new THREE.SphereGeometry(0.008, 6, 4), BRASS, cuff.at(0.4, deg), { embed: 0.3 });

    // glove
    const pc = walk(wr, dir, 0.05);
    b.part(new THREE.BoxGeometry(0.046, 0.1, 0.095), GLOVE, { bone: wrist, at: pc, dir, up: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.05, 0.024, 0.1), LEATHER_DK, {
      bone: wrist,
      at: walk(wr, dir, 0.012),
      dir,
      up: [0, 0, 1],
    });
    for (const k of [-0.026, 0, 0.026])
      b.part(new THREE.SphereGeometry(0.0055, 6, 4), BRASS, {
        bone: wrist,
        at: walk(walk(pc, upv, 0.024), dir, 0.012).add(V(0, 0, k)),
      });

    FINGERS.forEach((fn, i) => {
      const kb = walk(wr, dir, 0.088).add(V(0, 0, FZ[i]));
      const fd = dir.clone().add(V(0, 0, FZ[i] * 3)).normalize();
      const tipDir = fd.clone().addScaledVector(upv, -0.12).normalize();
      const mid = walk(kb, fd, FLEN[i] * 0.5);
      const tip = walk(mid, tipDir, FLEN[i] * 0.5);
      const f = b.chain(`${fn}${S}`, [kb, mid, tip], {
        parent: wrist,
        names: [`${fn}1${S}`, `${fn}2${S}`],
        role: "digit",
      });
      b.sweep(f, [0.0165, 0.014], { color: GLOVE, sides: 6 });
    });
    const tb = walk(wr, dir, 0.035).add(V(0, 0, 0.038));
    const td = dir.clone().multiplyScalar(0.55).add(V(0, 0, 0.8)).addScaledVector(upv, -0.15).normalize();
    const thumb = b.chain(`thumb${S}`, [tb, walk(tb, td, 0.036), walk(tb, td, 0.07)], {
      parent: wrist,
      names: [`thumb1${S}`, `thumb2${S}`],
      role: "digit",
    });
    b.sweep(thumb, [0.0185, 0.015], { color: GLOVE, sides: 6 });

    hands.push({ s, wrist, pc, dir });
  }

  // =============================================================================================================
  // Legs: dark breeches and heavy buckled boots.

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip = V(s * 0.1, 0.93, 0);
    const knee = V(s * 0.115, 0.53, 0.03);
    const ankle = V(s * 0.125, 0.12, -0.01);
    const toe = V(s * 0.13, 0.05, 0.16);
    const leg = b.chain(`leg${S}`, [hip, knee, ankle, toe], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.05],
    });
    const tK = leg.ts[1];
    const tA = leg.ts[2];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];

    b.sweep(leg, [0.074, 0.064, 0.056], { to: tA, color: TROUSER, sides: 8 });
    b.sweep(leg, [0.07, 0.066, 0.064], {
      from: tK + 0.02,
      to: tA,
      color: BOOT,
      sides: 8,
      caps: { start: "flat", end: "round" },
    });

    // two buckled straps round the boot shaft
    for (const y of [0.25, 0.17]) {
      const t = leg.path.closestT(V(s * 0.122, y, 0.0));
      b.sweep(leg, 0.072, { from: t - 0.008, to: t + 0.008, caps: "flat", color: LEATHER_DK, sides: 8 });
      const lp = leg.at(t).at;
      b.part(new THREE.BoxGeometry(0.03, 0.026, 0.012), BRASS, { bone: kneeJ, at: [lp.x, lp.y, lp.z + 0.072] });
      b.part(new THREE.BoxGeometry(0.016, 0.012, 0.014), LEATHER_DK, { bone: kneeJ, at: [lp.x, lp.y, lp.z + 0.073] });
    }

    // foot, sole, heel and a scuffed toe cap
    b.loft(
      [
        { at: [s * 0.125, 0.066, -0.05], w: 0.105, h: 0.11 },
        { at: [s * 0.128, 0.058, 0.04], w: 0.115, h: 0.1 },
        { at: [s * 0.132, 0.048, 0.13], w: 0.1, h: 0.075 },
      ],
      { bone: ankleJ, color: BOOT },
    );
    b.part(new THREE.BoxGeometry(0.12, 0.022, 0.29), SOLE, { bone: ankleJ, at: [s * 0.128, 0.011, 0.04] });
    b.part(new THREE.BoxGeometry(0.105, 0.032, 0.075), SOLE, { bone: ankleJ, at: [s * 0.125, 0.016, -0.065] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), LEATHER_DK, {
      bone: ankleJ,
      at: [s * 0.132, 0.05, 0.145],
      scale: [1, 0.72, 0.9],
    });
  }

  // =============================================================================================================
  // Head: a bone-leather beaked mask inside a dark cowl, glowing glass lenses, wide-brimmed hat.

  const mask = b.part(new THREE.SphereGeometry(1, 14, 10), MASK, {
    bone: head,
    at: [0, 1.665, 0.03],
    scale: [0.105, 0.12, 0.1],
    name: "mask",
  });
  const hood = b.part(new THREE.SphereGeometry(1, 12, 9), HOOD, {
    bone: head,
    at: [0, 1.67, -0.055],
    scale: [0.14, 0.155, 0.13],
    name: "hood",
  });
  b.part(new THREE.TorusGeometry(0.108, 0.022, 6, 16), HOOD, {
    bone: head,
    at: [0, 1.665, 0.045],
    dir: [0, 0, 1],
    axis: "z",
    scale: [1, 1.1, 1],
    name: "hoodRim",
  });
  const maskSurf = b.surface(mask);

  // Leather head strap round the cowl, buckled at the back.
  const strap = b.surface(hood).loop([0, 1.7, 0], { lift: 0.005 });
  b.sweep(strap, 0.008, { color: LEATHER, sides: 5, bone: head });
  b.part(new THREE.BoxGeometry(0.03, 0.026, 0.008), BRASS, { bone: head, at: [0, 1.7, -0.19] });

  // Lenses: leather cup, brass rim, glowing glass, a ring of rivets seated on the mask.
  for (const s of [1, -1]) {
    const hit = must(maskSurf.ray([s * 0.05, 1.697, 0.5], [0, 0, -1]), "eye");
    const n = hit.n.clone();
    b.part(new THREE.CylinderGeometry(0.04, 0.043, 0.012, 12), LEATHER_DK, {
      bone: head,
      at: walk(hit.at, n, -0.002),
      dir: n,
    });
    glow(
      b.part(new THREE.CircleGeometry(0.031, 16), "#ffffff", {
        bone: head,
        at: walk(hit.at, n, 0.0065),
        dir: n,
        axis: "z",
        texture: LENS,
      }),
      1.3,
    );
    const rimAt = walk(hit.at, n, 0.007);
    b.part(new THREE.TorusGeometry(0.034, 0.0095, 6, 16), BRASS, { bone: head, at: rimAt, dir: n, axis: "z" });
    b.ring(frame(rimAt, n), { count: 8, radius: 0.051 }, (it) => {
      const h = maskSurf.nearest(it.at);
      b.stick(new THREE.SphereGeometry(0.0055, 6, 4), BRASS, h, { embed: 0.4, bone: head });
    });
    // a scowling leather brow plate
    const browHit = must(maskSurf.ray([s * 0.05, 1.748, 0.5], [0, 0, -1]), "brow");
    b.stick(new THREE.BoxGeometry(0.072, 0.014, 0.018), LEATHER_DK, browHit, { spin: s * 14, embed: 0.3, bone: head });
  }

  // Upper beak on the head, lower beak on the jaw: one stitched leather beak that opens.
  const upper = b.sweep(
    upperPath,
    (t: number): [number, number] => [0.048 * Math.pow(1 - t, 0.9) + 0.003, 0.044 * (1 - t) + 0.003],
    { bone: head, color: beakPaint(31), caps: { start: "round", end: "point" }, sides: 10, name: "beakUpper" },
  );
  b.sweep(jawPath, (t: number): [number, number] => [0.04 * (1 - t) + 0.003, 0.03 * (1 - t) + 0.003], {
    bone: jaw,
    color: beakPaint(37),
    caps: { start: "round", end: "point" },
    sides: 8,
    name: "beakLower",
  });

  // Brass band round the beak, riveted.
  const bt = 0.2;
  const bandLoop = b.surface(upper).loop(frame(upperPath.at(bt), upperPath.tangentAt(bt)), { lift: 0.001 });
  b.sweep(bandLoop, 0.0055, { color: BRASS, bone: head, sides: 6 });
  b.along(bandLoop, 6, (at) => {
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), BRASS, { bone: head, at: at.at });
  });

  // Breathing vents on top of the beak.
  for (const s of [1, -1]) {
    const sp = upper.at(0.34, s * 30);
    b.stick(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), BRASS, sp, { embed: 0.4, bone: head });
    b.stick(new THREE.CylinderGeometry(0.0068, 0.0068, 0.005, 8), INK, sp, { embed: 0.3, bone: head });
  }

  // Wide-brimmed hat with a crimson band, brass buckle, crow feathers and a tuck of dried herbs.
  const HAT_AT = V(0, 1.775, -0.03);
  b.lathe(
    [
      [0, 0],
      [0.25, 0],
      [0.268, 0.006],
      [0.262, 0.017],
      [0.132, 0.024],
      [0.122, 0.15],
      [0.108, 0.168],
      [0, 0.172],
    ],
    { at: HAT_AT, segments: 18, color: HAT, bone: head, name: "hat" },
  );
  b.lathe(
    [
      [0.12, 0.024],
      [0.137, 0.024],
      [0.133, 0.072],
      [0.118, 0.072],
    ],
    { at: HAT_AT, segments: 18, color: CRIMSON, bone: head, name: "hatBand" },
  );
  // brim edge binding
  b.lathe(
    [
      [0.255, 0.001],
      [0.272, 0.004],
      [0.27, 0.014],
      [0.255, 0.012],
    ],
    { at: HAT_AT, segments: 18, color: LEATHER_DK, bone: head, name: "brimBinding" },
  );
  const buckleY = HAT_AT.y + 0.048;
  const buckleZ = HAT_AT.z + 0.137;
  b.part(new THREE.BoxGeometry(0.054, 0.046, 0.008), BRASS, { bone: head, at: [0, buckleY, buckleZ] });
  b.part(new THREE.BoxGeometry(0.034, 0.028, 0.01), HAT, { bone: head, at: [0, buckleY, buckleZ] });
  b.part(new THREE.BoxGeometry(0.006, 0.032, 0.012), BRASS, { bone: head, at: [0, buckleY, buckleZ + 0.001] });

  const plume = (at: number[], x: THREE.Vector3, yHint: THREE.Vector3, len: number, color: ColorInput) => {
    const xd = x.clone().normalize();
    const yd = yHint.clone().addScaledVector(xd, -yHint.dot(xd)).normalize();
    const k = len / 0.32;
    b.extrude(
      [
        [0, 0],
        [0.04 * k, 0.012 * k],
        [0.14 * k, 0.028 * k],
        [0.25 * k, 0.024 * k],
        [0.32 * k, 0, "sharp"],
        [0.25 * k, -0.018 * k],
        [0.14 * k, -0.024 * k],
        [0.04 * k, -0.01 * k],
      ],
      { at, x: xd, y: yd, thickness: 0.004, smoothing: 1, color, bone: head },
    );
  };
  plume([0.128, 1.815, -0.055], V(0.25, 0.62, -0.74), V(0.95, -0.1, 0.2), 0.34, featherPaint("#121016", "#2b2a38", "#3e4f66"));
  plume([0.13, 1.81, -0.035], V(0.45, 0.45, -0.77), V(0.85, -0.3, 0.3), 0.24, featherPaint("#3a0c0a", "#7b1d18", "#a8483c"));
  plume([0.125, 1.812, -0.075], V(0.15, 0.72, -0.68), V(0.98, 0, 0.2), 0.26, featherPaint("#121016", "#24232e", "#4a5a70"));
  b.cards([frame([-0.13, 1.812, -0.05], [-0.35, 1, -0.45])], HERB, {
    size: [0.06, 0.12],
    cross: true,
    bone: head,
  });

  // =============================================================================================================
  // The lantern: a hexagonal iron lantern hung by a leather loop and chain from the left glove.

  const lh = must(
    hands.find((h) => h.s > 0),
    "left hand",
  );
  const dn = V(0, -1, 0);
  dn.addScaledVector(lh.dir, -dn.dot(lh.dir)).normalize();
  const H = walk(lh.pc, dn, 0.06);
  const lantern = b.joint("lantern", { parent: lh.wrist, at: H, dir: [0, -1, 0] });
  const L = (dx: number, dy: number, dz: number) => H.clone().add(V(dx, dy, dz));

  b.part(new THREE.TorusGeometry(0.06, 0.007, 5, 14), LEATHER, { bone: lh.wrist, at: lh.pc, dir: lh.dir, axis: "z" });

  for (let i = 0; i < 3; i++)
    b.part(new THREE.TorusGeometry(0.012, 0.0032, 4, 8), IRON, {
      bone: lantern,
      at: L(0, -0.015 - i * 0.019, 0),
      dir: i % 2 ? [1, 0, 0] : [0, 0, 1],
      axis: "z",
    });

  b.sweep(
    catmull([L(0.09, -0.2, 0), L(0.082, -0.12, 0), L(0, -0.066, 0), L(-0.082, -0.12, 0), L(-0.09, -0.2, 0)]),
    0.005,
    { color: IRON, bone: lantern, sides: 5 },
  );
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.009, 6, 4), IRON, { bone: lantern, at: L(s * 0.09, -0.2, 0) });

  const roof = [
    [0, 0],
    [0.094, 0],
    [0.094, 0.012],
    [0.058, 0.045],
    [0.024, 0.062],
    [0.024, 0.075],
    [0, 0.075],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  b.part(new THREE.LatheGeometry(roof, 6), IRON, { bone: lantern, at: L(0, -0.2, 0), flat: true, name: "lanternRoof" });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), BRASS, { bone: lantern, at: L(0, -0.118, 0) });

  glow(
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.13, 6, 1), "#ffffff", {
      bone: lantern,
      at: L(0, -0.27, 0),
      texture: GLASS,
      name: "lanternGlass",
    }),
    1.6,
  );
  for (const y of [-0.206, -0.334])
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 6), IRON, { bone: lantern, at: L(0, y, 0), flat: true });
  for (let k = 0; k < 6; k++) {
    const th = (k / 6) * Math.PI * 2;
    const x = Math.sin(th) * 0.072;
    const z = Math.cos(th) * 0.072;
    b.rod(L(x, -0.334, z), L(x, -0.206, z), 0.0055, IRON, { bone: lantern, sides: 4 });
  }
  const base = [
    [0, 0],
    [0.062, 0],
    [0.088, 0.022],
    [0.088, 0.04],
    [0, 0.04],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  b.part(new THREE.LatheGeometry(base, 6), IRON, { bone: lantern, at: L(0, -0.38, 0), flat: true, name: "lanternBase" });
  b.part(new THREE.ConeGeometry(0.025, 0.04, 6), BRASS, { bone: lantern, at: L(0, -0.4, 0), dir: [0, -1, 0] });

  return b.root;
}
```