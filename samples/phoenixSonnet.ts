// Ember Phoenix: a giant fire bird, wings spread, in a Genshin-style cel-shaded look (kits/toon) with gold filigree
// jewellery and glowing flame wisps (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Spot } from "../src/frame";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { gradient, mix, paint, resolve, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK, KEY_LIGHT, shadowOf, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A giant cel-shaded phoenix standing with wings spread: layered flame feathers fading from ruby to gold, a trailing ocellated tail, big anime eyes, a gold filigree circlet, gorget, bracers and tassels, and glowing flame wisps.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RUBY = "#b8142e";
const RED = "#ee3b27";
const ORANGE = "#ff7a1f";
const AMBER = "#ffab2b";
const GOLD = "#ffd23f";
const CREAM = "#fff2bd";
const EDGE = "#7b1230";
const RACHIS = "#fff0b0";
const GEM = "#ff3347";
const GOLDP = cel("#ffd75e", "#df9328");
const BEAKP = cel("#ffe9a8", "#f0ab55");
const BEAKTIP = cel("#ff9a2a", "#d1541c");
const TALON = cel("#fff0c4", "#e0a45e");

const UP = new THREE.Vector3(0, 1, 0);
const LIGHT = new THREE.Vector3(...KEY_LIGHT).normalize();
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

type Stops = readonly (readonly [number, string])[];
const PRIMARY: Stops = [[0, RED], [0.2, ORANGE], [0.48, AMBER], [0.72, GOLD], [0.9, CREAM]];
const SECONDARY: Stops = [[0, RUBY], [0.18, RED], [0.42, ORANGE], [0.68, AMBER], [0.88, GOLD]];
const TERTIAL: Stops = [[0, RUBY], [0.3, RED], [0.58, ORANGE], [0.82, AMBER]];
const COVERT1: Stops = [[0, RUBY], [0.32, RED], [0.65, ORANGE], [0.88, AMBER]];
const COVERT2: Stops = [[0, RUBY], [0.45, RED], [0.8, ORANGE]];
const ALULA: Stops = [[0, ORANGE], [0.4, AMBER], [0.75, GOLD]];
const TAILS: Stops = [[0, RED], [0.22, ORANGE], [0.45, AMBER], [0.7, GOLD], [0.9, CREAM]];
const CREST: Stops = [[0, RED], [0.2, ORANGE], [0.5, AMBER], [0.78, GOLD], [0.92, CREAM]];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = animeEye({ iris: "#ff6a1f", irisLight: "#ffd24a", irisDark: "#b3122b", blush: "#ff8a5c" });

const TUFT = svg(
  `<svg viewBox="0 0 40 64">
    <path d="M20 62 C4 50 2 26 20 2 C38 26 36 50 20 62Z" fill="#ffffff"/>
    <path d="M20 62 C4 50 2 26 20 2 L20 62Z" fill="#dcdcdc"/>
    <path d="M20 60 L20 10" stroke="#bdbdbd" stroke-width="2.6" fill="none"/>
    <path d="M20 62 C4 50 2 26 20 2 C38 26 36 50 20 62Z" fill="none" stroke="#a6a6a6" stroke-width="2.4"/>
  </svg>`,
  { size: 128 },
);
const TUFT3 = svg(
  `<svg viewBox="0 0 40 64">
    <path d="M20 62 C10 52 5 40 7 22 C10 30 13 32 14 35 C12 20 16 8 20 2 C24 8 28 20 26 35 C27 32 30 30 33 22 C35 40 30 52 20 62Z" fill="#ffffff"/>
    <path d="M20 62 C10 52 5 40 7 22 C10 30 13 32 14 35 C12 20 16 8 20 2 L20 62Z" fill="#dcdcdc"/>
    <path d="M20 60 L20 12" stroke="#bdbdbd" stroke-width="2.6" fill="none"/>
    <path d="M20 62 C10 52 5 40 7 22 C10 30 13 32 14 35 C12 20 16 8 20 2 C24 8 28 20 26 35 C27 32 30 30 33 22 C35 40 30 52 20 62Z" fill="none" stroke="#a6a6a6" stroke-width="2.4"/>
  </svg>`,
  { size: 128 },
);

const flameDrawing = (flip: boolean) => `<svg viewBox="0 0 32 72">
  <g ${flip ? 'transform="translate(32 0) scale(-1 1)"' : ""}>
    <path d="M16 71 C3 58 3 42 11 31 C9 22 14 12 19 2 C21 14 29 22 26 34 C32 46 29 60 16 71Z" fill="#ff4a1c"/>
    <path d="M16 66 C8 56 8 44 14 35 C13 28 17 20 19 13 C21 24 25 30 23 38 C27 47 24 58 16 66Z" fill="#ff9a2a"/>
    <path d="M16 61 C12 54 12 47 16 41 C17 37 18 34 19 30 C20 38 22 42 21 47 C22 53 20 58 16 61Z" fill="#ffe27a"/>
    <path d="M16 56 C14 52 14 49 17 46 C18 44 18 43 18.5 41 C19 46 19 50 16 56Z" fill="#fffbe0"/>
  </g></svg>`;
const FLAME_A = svg(flameDrawing(false), { size: 128 });
const FLAME_B = svg(flameDrawing(true), { size: 128 });

// Hanging tassel: the drawing's bottom edge is the attachment (cards hang upside down), strands run up the drawing.
const TASSEL = svg(
  `<svg viewBox="0 0 24 64">
    <path d="M12 52 C8 40 4 26 3 8" stroke="#e8263a" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <path d="M12 52 C10 40 8 24 8 4" stroke="#ff7a1f" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <path d="M12 52 L12 2" stroke="#ffd23f" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <path d="M12 52 C14 40 16 24 16 4" stroke="#ff7a1f" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <path d="M12 52 C16 40 20 26 21 8" stroke="#e8263a" stroke-width="4.4" fill="none" stroke-linecap="round"/>
    <rect x="6" y="46" width="12" height="9" rx="2" fill="#ffd45c" stroke="#8a4a12" stroke-width="1.6"/>
    <circle cx="12" cy="59" r="4.6" fill="#ffd45c" stroke="#8a4a12" stroke-width="1.6"/>
  </svg>`,
  { size: 160 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 120 100">
    <path d="M60 98 C34 90 8 64 6 30 C20 38 40 36 60 20 C80 36 100 38 114 30 C112 64 86 90 60 98Z" fill="#ffd45c" stroke="#8a4a12" stroke-width="3"/>
    <path d="M60 89 C40 81 20 63 16 43 C30 47 46 45 60 31 C74 45 90 47 104 43 C100 63 80 81 60 89Z" fill="#ffb92e" stroke="#8a4a12" stroke-width="2"/>
    <path d="M60 31 C56 40 46 46 34 46 C26 46 24 54 30 56 M60 31 C64 40 74 46 86 46 C94 46 96 54 90 56" stroke="#8a4a12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M60 86 C50 78 38 70 30 60 M60 86 C70 78 82 70 90 60" stroke="#8a4a12" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="36" r="3.4" fill="#fff2bd" stroke="#8a4a12" stroke-width="1.6"/>
    <circle cx="106" cy="36" r="3.4" fill="#fff2bd" stroke="#8a4a12" stroke-width="1.6"/>
    <circle cx="36" cy="38" r="2.6" fill="#fff2bd" stroke="#8a4a12" stroke-width="1.4"/>
    <circle cx="84" cy="38" r="2.6" fill="#fff2bd" stroke="#8a4a12" stroke-width="1.4"/>
    <circle cx="60" cy="56" r="15" fill="#8a4a12"/>
    <circle cx="60" cy="56" r="12.5" fill="#d71f35"/>
    <path d="M60 46 L69 56 L60 66 L51 56Z" fill="#ff5a6a"/>
    <ellipse cx="55" cy="50" rx="3.6" ry="2.4" fill="#ffffff" opacity="0.9"/>
  </svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** Smooth 1D profile through [t, value] keys (cubic Hermite, finite-difference tangents). */
function keyed(keys: readonly (readonly [number, number])[]) {
  const n = keys.length;
  const tan = keys.map((_, i) => {
    const a = keys[Math.max(0, i - 1)];
    const c = keys[Math.min(n - 1, i + 1)];
    return c[0] === a[0] ? 0 : (c[1] - a[1]) / (c[0] - a[0]);
  });
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < n - 1; i++) {
      const [t0, v0] = keys[i];
      const [t1, v1] = keys[i + 1];
      if (t <= t1) {
        const h = t1 - t0;
        const u = (t - t0) / h;
        const u2 = u * u;
        const u3 = u2 * u;
        return (
          (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * tan[i] + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * h * tan[i + 1]
        );
      }
    }
    return keys[n - 1][1];
  };
}

type FlameOpts = {
  curl?: number; // tip sweep toward +y, share of length
  trail?: number; // share of the width on the +y side
  depth?: number; // tooth depth, share of the half width
  base?: number; // width at the root, share of W
  peak?: number; // where the width peaks
  taper?: number; // taper exponent
  n?: number; // points per edge
  flick?: number; // tip lick beyond L
  both?: boolean; // teeth on both edges
  wave?: number; // centreline S-wave amplitude, meters
  waves?: number; // S-wave cycles
};

/**
 * A flame-feather outline: root at x = 0, tip at x = L, teeth on the trailing (+y) edge. `i0`..`i1` (point indices,
 * even) cut out one stretch of it, re-centred on its first station, so a curved feather can be built from flat parts.
 */
function flame(L: number, W: number, o: FlameOpts = {}, i0 = 0, i1?: number) {
  const n = o.n ?? 8;
  const end = i1 ?? n;
  const curl = o.curl ?? 0;
  const trail = o.trail ?? 0.5;
  const depth = o.depth ?? 0.3;
  const base = o.base ?? 0.4;
  const peak = o.peak ?? 0.35;
  const taper = o.taper ?? 2.6;
  const flick = o.flick ?? 0;
  const wave = o.wave ?? 0;
  const waves = o.waves ?? 1;
  const mid = (u: number) => curl * L * u * u + wave * Math.sin(u * Math.PI * 2 * waves);
  const env = (u: number) => {
    const head = base + (1 - base) * smoothstep(0, peak, u);
    return u > peak ? head * (1 - Math.pow((u - peak) / (1 - peak), taper)) : head;
  };
  const x0 = (i0 / n) * L;
  const y0 = mid(i0 / n);
  const last = Math.min(end, n - 1);
  const pts: OutlinePoint[] = [];
  for (let i = i0; i <= last; i++) {
    const u = i / n;
    const odd = o.both === true && i % 2 === 1;
    const y = mid(u) - (1 - trail) * env(u) * W * (odd ? 1 - depth : 1) - y0;
    pts.push(odd ? [u * L - x0, y, "sharp"] : [u * L - x0, y]);
  }
  if (end >= n) pts.push([L + flick - x0, mid(1) + flick * curl * 2 - y0, "sharp"]);
  for (let i = last; i >= i0; i--) {
    const u = i / n;
    const odd = i % 2 === 1;
    const y = mid(u) + trail * env(u) * W * (odd ? 1 - depth : 1) - y0;
    pts.push(odd ? [u * L - x0, y, "sharp"] : [u * L - x0, y]);
  }
  return { pts, mid };
}

/**
 * Cel-shaded flame-feather colouring: gradient bands with zig-zag edges, a pale shaft, dark rim walls (not at the
 * seams between the flat parts of a curved feather). `u0` is where this part starts along the whole feather and
 * `segLen` its length in meters.
 */
function featherPaint(
  L: number,
  mid: (u: number) => number,
  stops: Stops,
  thick: THREE.Vector3,
  ocelli: number | undefined,
  u0: number,
  segLen: number,
): Paint {
  const lit = paint((_p, n, s) => {
      if (Math.abs(n.dot(thick)) < 0.55 && s[0] > 0.004 && s[0] < segLen - 0.004) return EDGE;
      const u = u0 + s[0] / L;
      const y = s[1] - (mid(u) - mid(u0));
      if (u > 0.04 && u < 0.97 && Math.abs(y) < 0.0075 * (1.3 - u)) return RACHIS;
      if (ocelli !== undefined) {
        const d = Math.hypot((u - ocelli) * L * 0.75, y);
        if (d < 0.026) return CREAM;
        if (d < 0.05) return RUBY;
        if (d < 0.075) return GOLD;
        if (d < 0.095) return RED;
      }
      const v = u + 0.05 * zigzag(y / 0.055);
      let c = stops[0][1];
      for (const [at, col] of stops) if (v >= at) c = col;
      return c;
  });
  // Cel shading with a glowing shadow tone: fire feathers never go muddy on their undersides.
  return paint((p, n) => {
    if (n.dot(LIGHT) > 0.1) return lit;
    const c = resolve(lit, p, n);
    return mix(shadowOf(c), c, 0.45);
  });
}

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const r = rng(11);

  // =============================================================================================================
  // Skeleton: hips at the body's heart, spine and tail cut from one curve, S-neck, head and jaw.
  const bodyPath = catmull([
    [0, 0.65, -0.8],
    [0, 0.65, -0.5],
    [0, 0.69, -0.12],
    [0, 0.78, 0.16],
    [0, 0.88, 0.34],
  ]);
  const core = b.joint("hips", { at: [0, 0.69, -0.12] });
  const rootT = bodyPath.closestT(core.at);
  const spine = b.chain("spine", bodyPath.slice(rootT, 1), {
    parent: core,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const tail = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: core,
    count: 3,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });
  const chest = spine.joints[2];

  const neckPath = catmull([
    [0, 0.88, 0.34],
    [0, 0.99, 0.5],
    [0, 1.21, 0.52],
    [0, 1.41, 0.64],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, count: 3, names: ["neck1", "neck2", "neck3"], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[2], at: neckPath.at(1), dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.03 }),
    aim: head.local({ forward: 0.27, down: 0.05 }),
    role: "jaw",
  });

  // =============================================================================================================
  // Body and neck
  // Chevron feather rows over a base paint: V-shaped lines pointing at the underside / front of a tube.
  const chevrons = (base: Paint, line: string, length: number, pitch: number, width: number, only: (n: THREE.Vector3) => boolean) =>
    paint((_p, n, s) => {
      if (!only(n)) return base;
      const d = Math.abs((((s[1] - 180) % 360) + 540) % 360 - 180) / 180;
      return (s[0] * length) / pitch + d * 0.9 - Math.floor((s[0] * length) / pitch + d * 0.9) < width ? line : base;
    });
  const COAT = cel(
    chevrons(
      furEdge(
        gradient(RED, ORANGE, [0, 0, -0.6], [0, 0, 0.35]),
        gradient(GOLD, CREAM, [0, 0, -0.3], [0, 0, 0.35]),
        { level: -0.12, teeth: 0.24, period: 0.04, ink: "#a02a2e", inkWidth: 0.05 },
      ),
      AMBER,
      bodyPath.length,
      0.075,
      0.16,
      (n) => n.y < 0.15,
    ),
  );
  const neckLength = neckPath.length;
  const NECKP = cel(
    chevrons(
      furEdge(CREAM, ORANGE, { axis: [0, 0.25, 1], level: 0.12, teeth: 0.34, period: 0.045, along: [1, 0, 0] }),
      GOLD,
      neckLength,
      0.055,
      0.2,
      (n) => n.z > 0.1,
    ),
  );
  const bodyW = keyed([[0, 0.02], [0.1, 0.04], [0.25, 0.075], [0.42, 0.16], [0.58, 0.205], [0.76, 0.215], [0.9, 0.185], [1, 0.14]]);
  const bodyH = keyed([[0, 0.02], [0.1, 0.045], [0.25, 0.085], [0.42, 0.18], [0.58, 0.25], [0.76, 0.28], [0.9, 0.235], [1, 0.16]]);
  const bodySweep = b.sweep(bodyPath, (t) => [bodyW(t) * 1.1, bodyH(t) * 1.1], {
    bone: [tail, core, spine],
    color: COAT,
    sides: 10,
    name: "body",
  });
  const neckR = keyed([[0, 0.15], [0.35, 0.102], [1, 0.078]]);
  const neckSweep = b.sweep(neck, neckR, { color: NECKP, sides: 8, name: "neck" });
  const bodySkin = b.surface(bodySweep);
  const neckSkin = b.surface(neckSweep);

  // Fluffy contour feathers over the body.
  const CARDTINT = paint((p, n) => {
    if (n.y < -0.25) return mix(AMBER, CREAM, smoothstep(-0.3, 0.35, p.z));
    return mix(RED, ORANGE, smoothstep(-0.4, 0.3, p.z));
  });
  const bodyHits = bodySkin.scatter(300, { rng: r, minDist: 0.045, filter: (h) => h.at.z > -0.6 && h.n.y > -0.2 && !(h.at.z > 0.2 && h.at.y < 0.85 && h.at.y > 0.55 && Math.abs(h.at.x) < 0.14 && h.n.z > 0.3) });
  b.cards(bodyHits, [TUFT, TUFT, TUFT3], {
    size: [0.095, 0.125],
    lean: 52,
    bend: 16,
    flow: [0, -0.3, -1],
    vary: 0.25,
    spin: 10,
    rng: r,
    color: CARDTINT,
  });
  // Neck ruffs: two rings of gold-orange tufts.
  for (const [t, count, size] of [[0.1, 11, 0.16], [0.3, 9, 0.13], [0.55, 8, 0.1]] as const) {
    const ring = b.ring(neck.at(t), { count, radius: neckR(t) * 0.9 });
    b.cards(ring.items, [TUFT3, TUFT], {
      size: [size * 0.6, size],
      lean: 48,
      bend: 14,
      flow: [0, -0.45, -1],
      vary: 0.2,
      rng: r,
      color: t < 0.2 ? ORANGE : AMBER,
    });
  }

  // =============================================================================================================
  // Head
  const HC = head.local({ forward: 0.06 });
  const HEADP = cel(
    furEdge(gradient(RED, ORANGE, head.local({ up: -0.1, back: 0.1 }), head.local({ up: 0.1, forward: 0.1 })), CREAM, {
      by: "position",
      level: HC.y + 0.012,
      teeth: 0.022,
      period: 0.04,
      along: [1, 0, 0],
      ink: "#a02a2e",
    }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEADP, {
    bone: head,
    at: HC,
    scale: [0.108, 0.1, 0.118],
    name: "skull",
  });
  const skullSkin = b.surface(skull);
  // Beak: hooked upper, lower on the jaw.
  const BB = head.local({ forward: 0.14, up: -0.012 });
  b.sweep(
    bezier(BB, head.local({ forward: 0.255, up: 0.012 }), head.local({ forward: 0.31, down: 0.045 })),
    (t) => [0.038 * (1 - Math.pow(t, 1.4)) + 0.004, 0.036 * (1 - t) + 0.004],
    { bone: head, color: BEAKP, bands: [[0.8, BEAKP], [1, BEAKTIP]], caps: { start: "flat", end: "point" }, sides: 6, name: "beakUpper" },
  );
  b.rod(head.local({ forward: 0.07, down: 0.04 }), head.local({ forward: 0.272, down: 0.058 }), [0.03, 0.005], {
    bone: jaw,
    color: BEAKP,
    sides: 6,
    name: "beakLower",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 5, 4), INK, {
      bone: head,
      at: head.local({ left: s * 0.016, forward: 0.185, up: 0.016 }),
    });
  // Eyes.
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 52, 8)!;
    b.decal(skullSkin, EYE, { at: hit, size: [0.1, 0.137], mirror: s > 0, name: s > 0 ? "eyeL" : "eyeR" });
  }
  // Cheek ruff and ear plumes.
  const cheekHits = skullSkin.scatter(36, {
    rng: r,
    minDist: 0.03,
    filter: (h) => h.n.z < 0.15 && h.at.y < HC.y + 0.05 && Math.abs(h.n.x) > 0.3,
  });
  b.cards(cheekHits, [TUFT3, TUFT], { size: [0.045, 0.085], lean: 62, bend: 16, flow: [0, -0.2, -1], vary: 0.2, rng: r, color: AMBER });

  const crestFlames: Spot[] = [];
  // Crest: five flame plumes, each on its own joint.
  for (const k of [-2, -1, 0, 1, 2]) {
    const yaw = k * 20 * DEG;
    const pitch = (26 - Math.abs(k) * 5) * DEG;
    const dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    const base = head.local({ up: 0.085 - Math.abs(k) * 0.012, left: k * 0.03, back: 0.012 * Math.abs(k) });
    const L = [0.5, 0.6, 0.46][Math.abs(k)];
    const out = feather({
      name: `crest${k + 2}`,
      base,
      dir,
      L,
      W: 0.12,
      stops: CREST,
      bone: head,
      joint: true,
      bank: k === 0 ? 55 : 90,
      flame: { curl: 0.2, both: true, depth: 0.35, n: 8, flick: 0.04, taper: 2.2 },
    });
    crestFlames.push(frame(attach(out.fj, out.tip), out.x));
  }
  for (const s of [1, -1]) {
    const dir = V(s * 0.72, 0.1, -0.68);
    const out = feather({
      name: `earPlume${s > 0 ? "L" : "R"}`,
      base: head.local({ left: s * 0.085, back: 0.035, up: 0.015 }),
      dir,
      L: 0.4,
      W: 0.09,
      stops: CREST,
      bone: head,
      joint: true,
      sign: s,
      flame: { curl: 0.2, both: true, depth: 0.35, flick: 0.03, taper: 2.2 },
    });
    crestFlames.push(frame(attach(out.fj, out.tip), out.x));
  }
  glow(b.cards(crestFlames, [FLAME_A, FLAME_B], { size: [0.06, 0.17], bend: 25, flow: [0, 1, 0], cross: true, vary: 0.2, rng: r }), 1);

  // Neck mane of flame wisps, rising behind the head.
  const mane = b.ring(neck.at(0.22), { count: 9, radius: neckR(0.22) * 0.8, fromDeg: 110, toDeg: 250 });
  glow(b.cards(mane.items, [FLAME_A, FLAME_B], { size: [0.06, 0.2], lean: 40, bend: 22, flow: [0, 0.5, -1], vary: 0.2, rng: r, cross: true }), 1);

  // Circlet with a ruby, and tasselled gold earrings.
  const crownAt = head.local({ forward: 0.152, up: 0.068 });
  b.extrude(
    [[-0.075, 0], [-0.055, 0.02], [-0.032, 0.026], [-0.016, 0.05], [0, 0.082, "sharp"], [0.016, 0.05], [0.032, 0.026], [0.055, 0.02], [0.075, 0], [0.045, -0.012], [0, -0.022], [-0.045, -0.012]],
    { at: crownAt, x: [1, 0, 0], y: [0, 1, 0.55], thickness: 0.012, bevel: 0.004, color: GOLDP, bone: head, name: "circlet" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), GEM, { bone: head, at: head.local({ forward: 0.166, up: 0.089 }), scale: [1, 1.3, 0.8] }),
    1.4,
  );
  for (const s of [1, -1]) {
    const ringAt = head.local({ left: s * 0.11, forward: 0.0, down: 0.035 });
    b.part(new THREE.TorusGeometry(0.03, 0.0075, 5, 10), GOLDP, { bone: head, at: ringAt, dir: [s, 0, 0], axis: "z" });
    glow(b.part(new THREE.OctahedronGeometry(0.016), GEM, { bone: head, at: head.local({ left: s * 0.11, forward: 0.0, down: 0.072 }), scale: [0.8, 1.3, 0.8] }), 1.3);
    b.cards([frame(head.local({ left: s * 0.11, forward: 0.0, down: 0.085 }), [0, 1, 0])], TASSEL, {
      size: [0.034, 0.13],
      lean: 180,
      flow: [0, 0, 1],
      bone: head,
    });
  }

  // =============================================================================================================
  // Gold gorget: collar, pendant, filigree breastplate
  const collar = neckSkin.loop(neck.at(0.14), { lift: 0.013 });
  b.sweep(collar, 0.018, { color: GOLDP, sides: 6, name: "collar" });
  b.along(collar, 8, (at) => glow(b.part(new THREE.OctahedronGeometry(0.018), GEM, { at }), 1.2));
  const pendantHit = neckSkin.around(neck.at(0.14).at).at(0, -18)!;
  const pendantAt = pendantHit.moved({ forward: 0.012 }).at;
  b.extrude(
    [[0, 0], [0.026, -0.018], [0.03, -0.05], [0, -0.092, "sharp"], [-0.03, -0.05], [-0.026, -0.018]],
    { at: pendantAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.005, color: GOLDP, bone: neck.joints[0], name: "pendant" },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.02), GEM, { at: V(pendantAt.x, pendantAt.y - 0.042, pendantAt.z + 0.012), scale: [0.9, 1.3, 0.8], bone: neck.joints[0] }), 1.4);
  b.cards([frame(V(pendantAt.x, pendantAt.y - 0.09, pendantAt.z + 0.005), [0, 1, 0])], TASSEL, {
    size: [0.04, 0.16],
    lean: 180,
    flow: [0, 0, 1],
    bone: neck.joints[0],
  });
  const breastHit = bodySkin.around([0, 0.77, 0.1]).at(0, -10)!;
  b.decal(bodySkin, FILIGREE, { at: breastHit, dir: [0, 0.1, 1], size: [0.2, 0.17], segments: 14, lift: 0.008, name: "gorget" });

  // =============================================================================================================
  // Tail: seven ocellated flame streamers
  const tailFlames: Spot[] = [];
  const tailBase = tail.joints[2];
  for (const k of [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]) {
    const m = Math.abs(k);
    const a = k * 6.5 * DEG;
    const pitch = [-10, -6, -1, 4, 9, 14][m] * DEG;
    const dir = V(Math.sin(a) * Math.cos(pitch), Math.sin(pitch), -Math.cos(a) * Math.cos(pitch));
    const out = feather({
      name: `tailFeather${k + 5}`,
      base: V(k * 0.026, 0.68 - m * 0.006, -0.52),
      dir,
      L: [2.45, 2.25, 2.0, 1.75, 1.5, 1.2][m],
      W: 0.3 - 0.02 * m,
      stops: TAILS,
      bone: tailBase,
      joint: true,
      bank: Math.sign(k) * [5, 10, 16, 22, 28, 34][m] || 5,
      lift: 0.003 * (5 - m),
      ocelli: 0.58,
      flame: { n: 16, both: true, depth: 0.32, wave: 0.07 * (k % 2 === 0 ? 1 : -1), waves: 1.2, base: 0.18, peak: 0.3, taper: 2.2, flick: 0.1 },
      thick: 0.012,
      cuts: [6, 12],
      bend: [10 - m, 16 - m * 2],
    });
    tailFlames.push(frame(attach(out.fj, out.tip), out.x));
  }
  glow(b.cards(tailFlames, [FLAME_A, FLAME_B], { size: [0.12, 0.34], bend: 28, flow: [0, 1, 0], cross: true, vary: 0.15, rng: r }), 1);
  // Gold tail ring and rump tufts.
  b.part(new THREE.TorusGeometry(0.09, 0.014, 5, 12), GOLDP, { bone: tail.joints[1], at: [0, 0.66, -0.56], dir: [0, 0, 1], axis: "z", name: "tailRing" });
  for (const [dy, dz] of [[0.09, 0], [-0.09, 0]] as const)
    glow(b.part(new THREE.OctahedronGeometry(0.02), GEM, { bone: tail.joints[1], at: [0, 0.66 + dy, -0.56 + dz], scale: [0.9, 1, 1.3] }), 1.3);
  b.cards([frame([0.0, 0.57, -0.56], [0, 1, 0])], TASSEL, { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], bone: tail.joints[1] });
  const rumpHits = bodySkin.scatter(60, { rng: r, minDist: 0.04, filter: (h) => h.at.z < -0.3 && h.n.y > -0.3 });
  b.cards(rumpHits, [TUFT3, TUFT], { size: [0.07, 0.15], lean: 66, bend: 18, flow: [0, -0.15, -1], vary: 0.25, rng: r, color: CARDTINT });

  // =============================================================================================================
  // Legs: digitigrade, feather trousers, scaled tarsus, gold anklets with tassels, four toes with talons
  const THIGHP = cel(furEdge(RED, ORANGE, { level: 0.1, teeth: 0.3, period: 0.04, along: [1, 0, 0], ink: "#a02a2e" }));
  const SCUTE = cel(
    paint((_p, _n, s) => {
      const f = (s[0] * 30) % 1;
      if (f < 0.1) return "#a8431a";
      return Math.floor(s[0] * 30) % 2 ? AMBER : ORANGE;
    }),
  );
  const legR = keyed([[0, 0.125], [0.18, 0.11], [0.31, 0.07], [0.4, 0.054], [0.62, 0.044], [0.7, 0.042], [0.95, 0.034], [1, 0.032]]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = V(s * 0.16, 0.62, -0.1);
    const heel = V(s * 0.16, 0.04, 0.03);
    const pts = limb(hip, heel, [0.25, 0.3, 0.26], [[0, 0, 1], [0, 0, -1]]);
    if (pts[pts.length - 1].distanceTo(heel) > 1e-3) throw new Error("leg too short for its foot");
    const leg = b.chain(`leg${side}`, pts, {
      parent: core,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const legSweep = b.sweep(leg, legR, { color: THIGHP, bands: [[0.33, THIGHP], [1, SCUTE]], sides: 8, name: `leg${side}` });
    const thighHits = b.surface(legSweep).scatter(26, { rng: r, minDist: 0.05, filter: (h) => h.at.y > 0.36 });
    b.cards(thighHits, [TUFT3, TUFT], { size: [0.07, 0.12], lean: 55, bend: 14, flow: [0, -1, -0.3], vary: 0.2, rng: r, color: ORANGE });
    // Anklet.
    b.rod(leg.at(0.8), leg.at(0.87), 0.044, { color: GOLDP, name: `anklet${side}` });
    glow(b.part(new THREE.OctahedronGeometry(0.017), GEM, { at: leg.at(0.835).moved({ forward: 0.044 }), scale: [0.9, 1.2, 0.8] }), 1.3);
    b.cards([frame(leg.at(0.8).moved({ left: s * 0.04, down: 0.005 }), [0, 1, 0])], TASSEL, {
      size: [0.034, 0.13],
      lean: 180,
      flow: [0, 0, 1],
    });
    // Toes.
    const foot = leg.tip!;
    const ankle = V(heel.x, 0.029, heel.z);
    for (const [k, yaw, len] of [[0, -34, 0.2], [1, 0, 0.26], [2, 34, 0.2], [3, 180, 0.15]] as const) {
      const d = V(Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG));
      const p1 = ankle.clone().addScaledVector(d, len * 0.5);
      const p2 = ankle.clone().addScaledVector(d, len);
      const toe = b.chain(`toe${side}${k}`, polyline([ankle, p1, p2]), {
        parent: foot,
        names: [`toe${side}${k}a`, `toe${side}${k}b`],
        role: "digit",
      });
      b.sweep(toe, [0.027, 0.019], { color: SCUTE, sides: 6, name: `toe${side}${k}` });
      b.sweep(
        bezier(p2, p2.clone().addScaledVector(d, 0.045).add(V(0, 0.01, 0)), p2.clone().addScaledVector(d, 0.082).add(V(0, -0.022, 0))),
        [0.02, 0.002],
        { bone: toe.joints[1], color: TALON, sides: 5, name: `talon${side}${k}` },
      );
    }
  }

  // =============================================================================================================
  // Wings
  const wingFlames: Spot[] = [];
  const wingGlowFrames: Spot[] = [];
  const ARMP = cel(gradient(RUBY, ORANGE, V(0.2, 0.9, 0.1), V(1.4, 1.5, 0.1)));
  const ARMPR = cel(gradient(RUBY, ORANGE, V(-0.2, 0.9, 0.1), V(-1.4, 1.5, 0.1)));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => V(s * x, y, z);
    const sh = P(0.2, 0.87, 0.18);
    const el = P(0.62, 1.03, 0.04);
    const wr = P(1.0, 1.28, 0.2);
    const ha = P(1.3, 1.5, 0.14);
    const arm = b.chain(`wing${side}`, catmull([sh, el, wr, ha]), {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    const [jShoulder, jElbow, , jHand] = arm.joints;
    const armSweep = b.sweep(arm, [0.04, 0.034, 0.028, 0.02], { color: s > 0 ? ARMP : ARMPR, sides: 8, name: `arm${side}` });
    const dirOf = (yaw: number, pitch: number) =>
      V(s * Math.cos(pitch * DEG) * Math.cos(yaw * DEG), Math.sin(pitch * DEG), -Math.cos(pitch * DEG) * Math.sin(yaw * DEG));
    const lerp3 = (a: THREE.Vector3, c: THREE.Vector3, t: number) => new THREE.Vector3().lerpVectors(a, c, t);

    // Primaries (hand): inner to outer.
    const primL = [0.84, 0.94, 1.0, 1.03, 1.02, 0.96, 0.88, 0.78, 0.66];
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const out = feather({
        name: `primary${side}${i + 1}`,
        base: lerp3(wr, ha, u).add(V(0, -0.012, -0.035)),
        dir: dirOf(64 - 58 * Math.pow(u, 0.9), 18 + 14 * u),
        L: primL[i],
        W: 0.2 - 0.03 * u,
        stops: PRIMARY,
        bone: jHand,
        joint: true,
        sign: s,
        lift: i * 0.0045,
        flame: { curl: 0.1 + 0.06 * u, trail: 0.6, both: false, depth: 0.4, n: 12, flick: 0.05 },
        cuts: [4, 8],
        bend: [8, 14],
      });
      wingFlames.push(frame(attach(out.fj, out.tip), out.x));
    }
    // Secondaries (forearm).
    const secL = [0.92, 0.9, 0.88, 0.85, 0.82, 0.78, 0.74, 0.7];
    for (let i = 0; i < 8; i++) {
      const u = (i + 0.5) / 8;
      const out = feather({
        name: `secondary${side}${i + 1}`,
        base: lerp3(wr, el, u).add(V(0, -0.012, -0.04)),
        dir: dirOf(68 + 34 * u, 14 - 4 * u),
        L: secL[i],
        W: 0.25,
        stops: SECONDARY,
        ocelli: 0.6,
        bone: jElbow,
        joint: true,
        sign: s,
        lift: 0.045 + i * 0.0045,
        flame: { curl: 0.04, trail: 0.62, both: false, depth: 0.4, n: 8, flick: 0.04 },
        cuts: [4],
        bend: [10],
      });
      wingFlames.push(frame(attach(out.fj, out.tip), out.x));
    }
    // Tertials (upper arm).
    for (let i = 0; i < 3; i++) {
      const out = feather({
        name: `tertial${side}${i + 1}`,
        base: lerp3(el, sh, 0.1 + i * 0.2).add(V(0, -0.012, -0.045)),
        dir: dirOf(102 + 8 * i, 7),
        L: 0.72 - 0.08 * i,
        W: 0.27,
        stops: TERTIAL,
        ocelli: 0.6,
        bone: jShoulder,
        joint: true,
        sign: s,
        lift: 0.085 + i * 0.0045,
        flame: { curl: 0.03, trail: 0.62, depth: 0.4, n: 8, flick: 0.03 },
        cuts: [4],
        bend: [8],
      });
      wingFlames.push(frame(attach(out.fj, out.tip), out.x));
    }
    // Coverts: three rows, then hand coverts and the alula.
    for (let i = 0; i < 9; i++) {
      const u = (i + 0.5) / 9;
      feather({
        name: `covertA${side}${i}`,
        base: lerp3(wr, el, u).add(V(0, 0, 0)),
        dir: dirOf(68 + 34 * u, 14 - 4 * u),
        L: 0.56,
        W: 0.2,
        stops: COVERT1,
        bone: jElbow,
        sign: s,
        lift: 0.1 + i * 0.002,
        flame: { curl: 0.04, trail: 0.62, depth: 0.4, n: 6, flick: 0.02 },
      });
    }
    for (let i = 0; i < 12; i++) {
      const u = (i + 0.5) / 12;
      const bone = u < 0.45 ? jShoulder : jElbow;
      feather({
        name: `covertB${side}${i}`,
        base: (u < 0.5 ? lerp3(sh, el, u * 2) : lerp3(el, wr, (u - 0.5) * 2)).add(V(0, 0, 0.035)),
        dir: dirOf(112 - 46 * u, 12 + 4 * u),
        L: 0.27 + 0.07 * Math.sin(Math.PI * u),
        W: 0.15,
        stops: COVERT2,
        bone,
        sign: s,
        lift: 0.15 + i * 0.002,
        flame: { curl: 0.05, trail: 0.6, depth: 0.4, n: 6, flick: 0.02 },
      });
    }
    for (let i = 0; i < 7; i++) {
      const u = (i + 0.5) / 7;
      feather({
        name: `covertH${side}${i}`,
        base: lerp3(wr, ha, u).add(V(0, 0, 0.01)),
        dir: dirOf(64 - 54 * u, 18 + 14 * u),
        L: 0.5 - 0.12 * u,
        W: 0.15,
        stops: COVERT1,
        bone: jHand,
        sign: s,
        lift: 0.09 + i * 0.002,
        flame: { curl: 0.06, trail: 0.6, depth: 0.4, n: 6, flick: 0.02 },
      });
    }
    for (let i = 0; i < 5; i++) {
      const u = (i + 0.5) / 5;
      feather({
        name: `covertH2${side}${i}`,
        base: lerp3(wr, ha, u).add(V(0, 0, 0.03)),
        dir: dirOf(60 - 50 * u, 20 + 14 * u),
        L: 0.27 - 0.06 * u,
        W: 0.11,
        stops: COVERT2,
        bone: jHand,
        sign: s,
        lift: 0.14 + i * 0.002,
        flame: { curl: 0.06, trail: 0.6, depth: 0.4, n: 6, flick: 0.015 },
      });
    }
    for (let i = 0; i < 3; i++) {
      feather({
        name: `alula${side}${i}`,
        base: lerp3(wr, ha, 0.05 + i * 0.1).add(V(0, 0.02, 0.07)),
        dir: dirOf(-8 - i * 10, 26 + i * 4),
        L: 0.24 - i * 0.03,
        W: 0.09,
        stops: ALULA,
        bone: jHand,
        sign: s,
        lift: 0.17 + i * 0.002,
        flame: { curl: -0.05, trail: 0.55, depth: 0.4, n: 6, flick: 0.02 },
      });
    }
    // Leading-edge covert row hiding the arm tube.
    const armPts = [sh, el, wr, ha];
    for (let i = 0; i < 15; i++) {
      const u = (i + 0.3) / 15;
      const seg = Math.min(2, Math.floor(u * 3));
      const a0 = armPts[seg];
      const a1 = armPts[seg + 1];
      const f = u * 3 - seg;
      const along = lerp3(a0, a1, f);
      const tan = a1.clone().sub(a0).normalize();
      tan.add(V(0, 0, -0.25)).normalize();
      feather({
        name: `edge${side}${i}`,
        base: along.add(V(0, 0.0, 0.01)),
        dir: tan,
        L: 0.36,
        W: 0.12,
        stops: COVERT1,
        bone: seg === 0 ? jShoulder : seg === 1 ? jElbow : jHand,
        sign: s,
        lift: 0.05 + (i % 2) * 0.004,
        flame: { curl: -0.05, trail: 0.5, depth: 0.4, n: 6, flick: 0.02 },
      });
    }
    // Flame wisps off the leading edge and shoulder.
    for (const t of [0.12, 0.3, 0.46, 0.62, 0.78, 0.92]) wingGlowFrames.push(frame(arm.at(t).moved({ up: 0.02, forward: 0.03 }), [s * 0.2, 1, 0.1]));
    b.cards(
      b.surface(armSweep).scatter(26, { rng: r, minDist: 0.06, filter: (h) => h.n.y > -0.2 }),
      [TUFT3, TUFT],
      { size: [0.06, 0.1], lean: 66, bend: 14, flow: [0, -0.2, -1], vary: 0.2, rng: r, color: ORANGE },
    );
    // Gold bracers and shoulder plate.
    for (const [t, rad] of [[0.34, 0.05], [0.68, 0.04]] as const) {
      b.rod(arm.at(t - 0.03), arm.at(t + 0.03), rad, { color: GOLDP, name: `bracer${side}${t}` });
      glow(b.part(new THREE.OctahedronGeometry(rad * 0.3), GEM, { at: arm.at(t).moved({ up: rad + 0.004 }), scale: [1, 0.8, 1.3] }), 1.3);
      b.cards([frame(arm.at(t).moved({ down: rad * 0.9, back: 0.01 }), [0, 1, 0])], TASSEL, { size: [0.04, 0.16], lean: 180, flow: [0, 0, 1] });
    }
    const shoulderDir = el.clone().sub(sh).normalize();
    const plateAt = sh.clone().add(V(0, 0.07, 0.02));
    b.extrude(
      [[0, -0.05], [0.1, -0.07], [0.18, -0.04], [0.25, 0, "sharp"], [0.17, 0.045], [0.07, 0.07], [-0.02, 0.05]],
      { at: plateAt, x: shoulderDir, y: [0, 0, -1], thickness: 0.016, bevel: 0.005, color: GOLDP, bone: jShoulder, name: `pauldron${side}` },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.024), GEM, { at: plateAt.clone().addScaledVector(shoulderDir, 0.1).add(V(0, 0.022, 0)), scale: [1, 0.8, 1.2], bone: jShoulder }), 1.4);
  }
  glow(b.cards(wingFlames, [FLAME_A, FLAME_B], { size: [0.075, 0.22], bend: 28, flow: [0, 1, 0], cross: true, vary: 0.2, rng: r }), 1);
  glow(b.cards(wingGlowFrames, [FLAME_A, FLAME_B], { size: [0.06, 0.19], lean: 50, bend: 20, flow: [0, 0.4, -1], vary: 0.25, rng: r, cross: true }), 1);

  // Flame wisps rising from the back.
  const backHits = bodySkin.scatter(40, { rng: r, minDist: 0.085, filter: (h) => h.n.y > 0.35 && h.at.z > -0.5 });
  glow(b.cards(backHits, [FLAME_A, FLAME_B], { size: [0.07, 0.22], lean: 40, bend: 25, flow: [0, 0.3, -1], vary: 0.3, rng: r, cross: true }), 1);

  // Floating embers.
  const emberGeo = new THREE.OctahedronGeometry(1, 0);
  for (let i = 0; i < 18; i++) {
    const x = (r() * 2 - 1) * 2.1;
    const high = i % 2 === 0;
    const y = high ? 1.95 + r() * 0.3 : 0.35 + r() * 0.5;
    const z = -1.9 + r() * 2.6;
    if (!high && Math.abs(x) < 0.7) continue;
    const size = 0.018 + r() * 0.022;
    glow(b.part(emberGeo, i % 3 === 0 ? GOLD : AMBER, { at: [x, y, z], scale: size, rotation: [r() * 90, r() * 90, 0] }), 1.2);
  }

  return b.root;

  // -------------------------------------------------------------------------------------------------------------
  /** A frame at the model-space point `p` that moves with `joint`. */
  function attach(joint: Joint, p: THREE.Vector3) {
    return joint.moved({ left: p.x - joint.at.x, up: p.y - joint.at.y, forward: p.z - joint.at.z });
  }

  type FeatherSpec = {
    name: string;
    base: THREE.Vector3;
    dir: THREE.Vector3;
    L: number;
    W: number;
    stops: Stops;
    bone: Joint;
    joint?: boolean;
    sign?: number;
    bank?: number;
    lift?: number;
    ocelli?: number;
    thick?: number;
    flame?: FlameOpts;
    /** Outline point indices (even) where the feather bends, and the degrees it lifts at each. */
    cuts?: readonly number[];
    bend?: readonly number[];
  };

  /**
   * One flame feather on its own joint (or rigid on `bone`), built from flat extruded parts that lift at each cut
   * so the feather sweeps up like a sickle. Returns its tip, final direction and joint.
   */
  function feather(sp: FeatherSpec) {
    let x = sp.dir.clone().normalize();
    const yH = new THREE.Vector3().crossVectors(UP, x).multiplyScalar(sp.sign ?? 1).normalize();
    let y = yH;
    if (sp.bank) {
      const yV = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
      const a = sp.bank * DEG;
      y = yH.clone().multiplyScalar(Math.cos(a)).addScaledVector(yV, Math.sin(a)).normalize();
    }
    const fo = sp.flame ?? {};
    const n = fo.n ?? 8;
    const bounds = [0, ...(sp.cuts ?? []), n];
    const f = flame(sp.L, sp.W, fo);
    let p = sp.base.clone();
    p.y += sp.lift ?? 0;
    let bone = sp.bone;
    if (sp.joint) bone = b.joint(sp.name, { parent: sp.bone, at: p, dir: x, role: "fan" });
    const flick = fo.flick ?? 0;
    let tip = p;
    for (let k = 0; k < bounds.length - 1; k++) {
      const i0 = bounds[k];
      const i1 = bounds[k + 1];
      const u0 = i0 / n;
      if (k > 0) {
        const uPrev = bounds[k - 1] / n;
        p = p.clone().addScaledVector(x, sp.L * (u0 - uPrev)).addScaledVector(y, f.mid(u0) - f.mid(uPrev));
        const a = (sp.bend?.[k - 1] ?? 0) * DEG;
        const prevThick = new THREE.Vector3().crossVectors(x, y).normalize();
        x = x.clone().multiplyScalar(Math.cos(a)).addScaledVector(prevThick, (prevThick.y >= 0 ? 1 : -1) * Math.sin(a)).normalize();
      }
      const thick = new THREE.Vector3().crossVectors(x, y).normalize();
      const last = i1 >= n;
      const segLen = last ? sp.L + flick - u0 * sp.L : sp.L * (i1 - i0) / n;
      const seg = flame(sp.L, sp.W, fo, i0, i1);
      b.extrude(seg.pts, {
        at: p,
        x,
        y,
        thickness: sp.thick ?? 0.011,
        bevel: 0.0035,
        detail: 0.5,
        color: featherPaint(sp.L, f.mid, sp.stops, thick, sp.ocelli, u0, segLen),
        bone,
        name: `f.${sp.name}${k > 0 ? `.${k}` : ""}`,
      });
      if (last) tip = p.clone().addScaledVector(x, segLen).addScaledVector(y, f.mid(1) + flick * (fo.curl ?? 0) * 2 - f.mid(u0));
    }
    return { tip, x, fj: bone };
  }
}
