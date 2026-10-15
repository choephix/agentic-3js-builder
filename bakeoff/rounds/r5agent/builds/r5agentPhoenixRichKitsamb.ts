// Ember Phoenix: a giant fire bird, wings spread, in a Genshin-style cel-shaded look (kits/toon) with gold filigree
// jewellery and glowing flame wisps (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { gradient, mix, paint, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

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

/** A flame-feather outline: root at x = 0, tip at x = L, teeth on the trailing (+y) edge. */
function flame(L: number, W: number, o: FlameOpts = {}) {
  const n = o.n ?? 8;
  const curl = o.curl ?? 0;
  const trail = o.trail ?? 0.5;
  const depth = o.depth ?? 0.3;
  const base = o.base ?? 0.4;
  const peak = o.peak ?? 0.3;
  const taper = o.taper ?? 1.5;
  const flick = o.flick ?? 0;
  const wave = o.wave ?? 0;
  const waves = o.waves ?? 1;
  const mid = (u: number) => curl * L * u * u + wave * Math.sin(u * Math.PI * 2 * waves);
  const env = (u: number) => {
    const head = base + (1 - base) * smoothstep(0, peak, u);
    return u > peak ? head * (1 - Math.pow((u - peak) / (1 - peak), taper)) : head;
  };
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const odd = o.both === true && i % 2 === 1;
    const y = mid(u) - (1 - trail) * env(u) * W * (odd ? 1 - depth : 1);
    pts.push(odd ? [u * L, y, "sharp"] : [u * L, y]);
  }
  pts.push([L + flick, mid(1) + flick * curl * 2, "sharp"]);
  for (let i = n - 1; i >= 0; i--) {
    const u = i / n;
    const odd = i % 2 === 1;
    const y = mid(u) + trail * env(u) * W * (odd ? 1 - depth : 1);
    pts.push(odd ? [u * L, y, "sharp"] : [u * L, y]);
  }
  return { pts, mid };
}

/** Cel-shaded flame-feather colouring: gradient bands with zig-zag edges, a pale shaft, dark rim walls. */
function featherPaint(
  L: number,
  mid: (u: number) => number,
  stops: Stops,
  thick: THREE.Vector3,
  ocelli?: number,
): ColorInput {
  return cel(
    paint((_p, n, s) => {
      if (Math.abs(n.dot(thick)) < 0.55) return EDGE;
      const u = s[0] / L;
      const y = s[1] - mid(u);
      if (u > 0.04 && u < 0.97 && Math.abs(y) < 0.0048 * (1.25 - u)) return RACHIS;
      if (ocelli !== undefined) {
        const d = Math.hypot((s[0] - ocelli * L) * 0.75, y);
        if (d < 0.026) return CREAM;
        if (d < 0.05) return RUBY;
        if (d < 0.075) return GOLD;
        if (d < 0.095) return RED;
      }
      const v = u + 0.05 * zigzag(y / 0.055);
      let c = stops[0][1];
      for (const [at, col] of stops) if (v >= at) c = col;
      return c;
    }),
  );
}

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const r = rng(11);

  // =============================================================================================================
  // Skeleton: hips at the body's heart, spine and tail cut from one curve, S-neck, head and jaw.
  const bodyPath = catmull([
    [0, 0.8, -0.8],
    [0, 0.8, -0.5],
    [0, 0.84, -0.12],
    [0, 0.93, 0.16],
    [0, 1.03, 0.34],
  ]);
  const core = b.joint("hips", { at: [0, 0.84, -0.12] });
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
    [0, 1.03, 0.34],
    [0, 1.14, 0.5],
    [0, 1.36, 0.52],
    [0, 1.56, 0.64],
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
  const COAT = cel(
    furEdge(
      gradient(RED, ORANGE, [0, 0, -0.6], [0, 0, 0.35]),
      gradient(GOLD, CREAM, [0, 0, -0.3], [0, 0, 0.35]),
      { level: -0.12, teeth: 0.24, period: 0.04, ink: "#a02a2e", inkWidth: 0.05 },
    ),
  );
  const NECKP = cel(
    furEdge(CREAM, ORANGE, { axis: [0, 0.25, 1], level: 0.12, teeth: 0.34, period: 0.045, along: [1, 0, 0] }),
  );
  const bodyW = keyed([[0, 0.02], [0.1, 0.04], [0.25, 0.075], [0.42, 0.16], [0.58, 0.205], [0.76, 0.215], [0.9, 0.185], [1, 0.14]]);
  const bodyH = keyed([[0, 0.02], [0.1, 0.045], [0.25, 0.085], [0.42, 0.18], [0.58, 0.25], [0.76, 0.28], [0.9, 0.235], [1, 0.16]]);
  const bodySweep = b.sweep(bodyPath, (t) => [bodyW(t), bodyH(t)], {
    bone: [tail, core, spine],
    color: COAT,
    sides: 10,
    name: "body",
  });
  const neckR = keyed([[0, 0.14], [0.35, 0.095], [1, 0.072]]);
  const neckSweep = b.sweep(neck, neckR, { color: NECKP, sides: 8, name: "neck" });
  const bodySkin = b.surface(bodySweep);
  const neckSkin = b.surface(neckSweep);

  // Fluffy contour feathers over the body.
  const CARDTINT = paint((p, n) => {
    if (n.y < -0.25) return mix(GOLD, CREAM, smoothstep(-0.3, 0.35, p.z));
    return mix(RED, ORANGE, smoothstep(-0.5, 0.3, p.z));
  });
  const bodyHits = bodySkin.scatter(230, { rng: r, minDist: 0.052, filter: (h) => h.at.z > -0.6 });
  b.cards(bodyHits, [TUFT, TUFT, TUFT3], {
    size: [0.085, 0.12],
    lean: 58,
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
    scale: [0.098, 0.092, 0.108],
    name: "skull",
  });
  const skullSkin = b.surface(skull);
  // Beak: hooked upper, lower on the jaw.
  const BB = head.local({ forward: 0.14, up: -0.012 });
  b.sweep(
    bezier(BB, head.local({ forward: 0.27, up: 0.012 }), head.local({ forward: 0.335, down: 0.05 })),
    (t) => [0.046 * (1 - Math.pow(t, 1.4)) + 0.004, 0.043 * (1 - t) + 0.004],
    { bone: head, color: BEAKP, bands: [[0.8, BEAKP], [1, BEAKTIP]], caps: { start: "flat", end: "point" }, sides: 6, name: "beakUpper" },
  );
  b.rod(head.local({ forward: 0.07, down: 0.04 }), head.local({ forward: 0.29, down: 0.062 }), [0.036, 0.005], {
    bone: jaw,
    color: BEAKP,
    sides: 6,
    name: "beakLower",
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#b3521c", {
      bone: head,
      at: head.local({ left: s * 0.016, forward: 0.185, up: 0.016 }),
    });
  // Eyes.
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 55, 6)!;
    b.decal(skullSkin, EYE, { at: hit, size: [0.066, 0.09], mirror: s > 0, name: s > 0 ? "eyeL" : "eyeR" });
  }
  // Cheek ruff and ear plumes.
  const cheekHits = skullSkin.scatter(36, {
    rng: r,
    minDist: 0.03,
    filter: (h) => h.n.z < 0.15 && h.at.y < HC.y + 0.05 && Math.abs(h.n.x) > 0.3,
  });
  b.cards(cheekHits, [TUFT3, TUFT], { size: [0.045, 0.085], lean: 62, bend: 16, flow: [0, -0.2, -1], vary: 0.2, rng: r, color: AMBER });

  const crestFlames: ReturnType<typeof frame>[] = [];
  // Crest: five flame plumes, each on its own joint.
  for (const k of [-2, -1, 0, 1, 2]) {
    const yaw = k * 20 * DEG;
    const pitch = (26 - Math.abs(k) * 5) * DEG;
    const dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    const base = head.local({ up: 0.085 - Math.abs(k) * 0.012, left: k * 0.03, back: 0.012 * Math.abs(k) });
    const L = [0.7, 0.56, 0.44][Math.abs(k)];
    const out = feather({
      name: `crest${k + 2}`,
      base,
      dir,
      L,
      W: 0.085,
      stops: CREST,
      bone: head,
      joint: true,
      bank: 90,
      flame: { curl: 0.2, both: true, depth: 0.35, n: 8, flick: 0.04 },
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
      W: 0.065,
      stops: CREST,
      bone: head,
      joint: true,
      sign: s,
      flame: { curl: 0.2, both: true, depth: 0.35, flick: 0.03 },
    });
    crestFlames.push(frame(attach(out.fj, out.tip), out.x));
  }
  glow(b.cards(crestFlames, [FLAME_A, FLAME_B], { size: [0.06, 0.17], bend: 25, flow: [0, 1, 0], cross: true, vary: 0.2, rng: r }), 1);

  // Circlet with a ruby, and tasselled gold earrings.
  const crownAt = head.local({ forward: 0.14, up: 0.062 });
  b.extrude(
    [[-0.075, 0], [-0.055, 0.02], [-0.032, 0.026], [-0.016, 0.05], [0, 0.082, "sharp"], [0.016, 0.05], [0.032, 0.026], [0.055, 0.02], [0.075, 0], [0.045, -0.012], [0, -0.022], [-0.045, -0.012]],
    { at: crownAt, x: [1, 0, 0], y: [0, 1, 0.55], thickness: 0.012, bevel: 0.004, color: GOLDP, bone: head, name: "circlet" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), GEM, { bone: head, at: head.local({ forward: 0.153, up: 0.083 }), scale: [1, 1.3, 0.8] }),
    1.4,
  );
  for (const s of [1, -1]) {
    const ringAt = head.local({ left: s * 0.1, forward: 0.0, down: 0.035 });
    b.part(new THREE.TorusGeometry(0.03, 0.0075, 5, 10), GOLDP, { bone: head, at: ringAt, dir: [s, 0, 0], axis: "z" });
    glow(b.part(new THREE.OctahedronGeometry(0.016), GEM, { bone: head, at: head.local({ left: s * 0.1, forward: 0.0, down: 0.072 }), scale: [0.8, 1.3, 0.8] }), 1.3);
    b.cards([frame(head.local({ left: s * 0.1, forward: 0.0, down: 0.085 }), [0, 1, 0])], TASSEL, {
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
  const breastHit = bodySkin.around([0, 0.92, 0.1]).at(0, 8)!;
  b.decal(bodySkin, FILIGREE, { at: breastHit, dir: [0, 0.18, 1], size: [0.3, 0.25], segments: 14, name: "gorget" });

  // =============================================================================================================
  // Tail: seven ocellated flame streamers
  const tailFlames: ReturnType<typeof frame>[] = [];
  const tailBase = tail.joints[2];
  for (const k of [-3, -2, -1, 0, 1, 2, 3]) {
    const a = k * 8.5 * DEG;
    const pitch = [14, 8, -2, -10, -2, 8, 14][k + 3] * DEG;
    const dir = V(Math.sin(a) * Math.cos(pitch), Math.sin(pitch), -Math.cos(a) * Math.cos(pitch));
    const L = [1.5, 1.85, 2.15, 2.4, 2.15, 1.85, 1.5][k + 3];
    const bank = Math.sign(k) * [12, 28, 42, 55][Math.abs(k)] || 14;
    const out = feather({
      name: `tailFeather${k + 3}`,
      base: V(k * 0.032, 0.83 - Math.abs(k) * 0.008, -0.52),
      dir,
      L,
      W: 0.2,
      stops: TAILS,
      bone: tailBase,
      joint: true,
      bank,
      lift: 0.003 * (3 - Math.abs(k)),
      ocelli: 0.58,
      flame: { n: 16, both: true, depth: 0.32, wave: 0.075 * (k % 2 === 0 ? 1 : -1), waves: 1.2, base: 0.18, peak: 0.3, taper: 1.2, flick: 0.1 },
      thick: 0.012,
    });
    tailFlames.push(frame(attach(out.fj, out.tip), out.x));
  }
  glow(b.cards(tailFlames, [FLAME_A, FLAME_B], { size: [0.12, 0.34], bend: 28, flow: [0, 1, 0], cross: true, vary: 0.15, rng: r }), 1);
  // Gold tail ring and rump tufts.
  b.rod(tail.at(0.18), tail.at(0.3), 0.06, { color: GOLDP, name: "tailRing" });
  b.along(tail, 5, (at) => glow(b.part(new THREE.OctahedronGeometry(0.014), GEM, { at: at.moved({ up: 0.05 }) }), 1.2), { from: 0.16, to: 0.32 });
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
  const legR = keyed([[0, 0.115], [0.18, 0.1], [0.31, 0.062], [0.4, 0.048], [0.62, 0.038], [0.7, 0.036], [0.95, 0.028], [1, 0.026]]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = V(s * 0.16, 0.77, -0.1);
    const heel = V(s * 0.16, 0.04, 0.03);
    const pts = limb(hip, heel, [0.28, 0.34, 0.3], [[0, 0, 1], [0, 0, -1]]);
    if (pts[pts.length - 1].distanceTo(heel) > 1e-3) throw new Error("leg too short for its foot");
    const leg = b.chain(`leg${side}`, pts, {
      parent: core,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const legSweep = b.sweep(leg, legR, { color: THIGHP, bands: [[0.33, THIGHP], [1, SCUTE]], sides: 8, name: `leg${side}` });
    const thighHits = b.surface(legSweep).scatter(26, { rng: r, minDist: 0.05, filter: (h) => h.at.y > 0.5 });
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
  const wingFlames: ReturnType<typeof frame>[] = [];
  const wingGlowFrames: ReturnType<typeof frame>[] = [];
  const ARMP = cel(gradient(RUBY, ORANGE, V(0.2, 1, 0.1), V(1.4, 1.4, 0.1)));
  const ARMPR = cel(gradient(RUBY, ORANGE, V(-0.2, 1, 0.1), V(-1.4, 1.4, 0.1)));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number) => V(s * x, y, z);
    const sh = P(0.2, 1.02, 0.18);
    const el = P(0.62, 1.18, 0.04);
    const wr = P(1.02, 1.34, 0.2);
    const ha = P(1.36, 1.42, 0.14);
    const arm = b.chain(`wing${side}`, catmull([sh, el, wr, ha]), {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    const [jShoulder, jElbow, , jHand] = arm.joints;
    const armSweep = b.sweep(arm, [0.09, 0.072, 0.05, 0.034], { color: s > 0 ? ARMP : ARMPR, sides: 8, name: `arm${side}` });
    const dirOf = (yaw: number, pitch: number) =>
      V(s * Math.cos(pitch * DEG) * Math.cos(yaw * DEG), Math.sin(pitch * DEG), -Math.cos(pitch * DEG) * Math.sin(yaw * DEG));
    const lerp3 = (a: THREE.Vector3, c: THREE.Vector3, t: number) => new THREE.Vector3().lerpVectors(a, c, t);
    const armLine = (t: number) => (t < 0.5 ? lerp3(sh, el, t * 2) : t < 0.8 ? lerp3(el, wr, (t - 0.5) / 0.3) : lerp3(wr, ha, (t - 0.8) / 0.2));
    void armLine;

    // Primaries (hand): inner to outer.
    const primL = [0.84, 0.94, 1.0, 1.03, 1.02, 0.96, 0.88, 0.78, 0.66];
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const out = feather({
        name: `primary${side}${i + 1}`,
        base: lerp3(wr, ha, u).add(V(0, -0.012, -0.035)),
        dir: dirOf(64 - 58 * Math.pow(u, 0.9), 8 + 12 * u),
        L: primL[i],
        W: 0.15 - 0.025 * u,
        stops: PRIMARY,
        bone: jHand,
        joint: true,
        sign: s,
        lift: i * 0.0045,
        flame: { curl: 0.06 + 0.04 * u, trail: 0.6, both: false, depth: 0.4, n: 8, flick: 0.05 },
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
        dir: dirOf(68 + 34 * u, 10 - 6 * u),
        L: secL[i],
        W: 0.19,
        stops: SECONDARY,
        bone: jElbow,
        joint: true,
        sign: s,
        lift: 0.045 + i * 0.0045,
        flame: { curl: 0.04, trail: 0.62, both: false, depth: 0.4, n: 8, flick: 0.04 },
      });
      wingFlames.push(frame(attach(out.fj, out.tip), out.x));
    }
    // Tertials (upper arm).
    for (let i = 0; i < 3; i++) {
      const out = feather({
        name: `tertial${side}${i + 1}`,
        base: lerp3(el, sh, 0.1 + i * 0.2).add(V(0, -0.012, -0.045)),
        dir: dirOf(102 + 8 * i, 4),
        L: 0.72 - 0.08 * i,
        W: 0.21,
        stops: TERTIAL,
        bone: jShoulder,
        joint: true,
        sign: s,
        lift: 0.085 + i * 0.0045,
        flame: { curl: 0.03, trail: 0.62, depth: 0.4, n: 8, flick: 0.03 },
      });
      wingFlames.push(frame(attach(out.fj, out.tip), out.x));
    }
    // Coverts: three rows, then hand coverts and the alula.
    for (let i = 0; i < 9; i++) {
      const u = (i + 0.5) / 9;
      feather({
        name: `covertA${side}${i}`,
        base: lerp3(wr, el, u).add(V(0, 0, 0)),
        dir: dirOf(68 + 34 * u, 10 - 6 * u),
        L: 0.5,
        W: 0.15,
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
        dir: dirOf(112 - 46 * u, 6 + 4 * u),
        L: 0.27 + 0.07 * Math.sin(Math.PI * u),
        W: 0.11,
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
        dir: dirOf(64 - 54 * u, 8 + 12 * u),
        L: 0.46 - 0.12 * u,
        W: 0.11,
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
        dir: dirOf(60 - 50 * u, 10 + 12 * u),
        L: 0.27 - 0.06 * u,
        W: 0.085,
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
        dir: dirOf(-8 - i * 10, 20 + i * 4),
        L: 0.24 - i * 0.03,
        W: 0.07,
        stops: ALULA,
        bone: jHand,
        sign: s,
        lift: 0.17 + i * 0.002,
        flame: { curl: -0.05, trail: 0.55, depth: 0.4, n: 6, flick: 0.02 },
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
    for (const [t, rad] of [[0.34, 0.084], [0.68, 0.058]] as const) {
      b.rod(arm.at(t - 0.03), arm.at(t + 0.03), rad, { color: GOLDP, name: `bracer${side}${t}` });
      glow(b.part(new THREE.OctahedronGeometry(rad * 0.3), GEM, { at: arm.at(t).moved({ up: rad + 0.004 }), scale: [1, 0.8, 1.3] }), 1.3);
    }
    b.extrude(
      [[0, -0.05], [0.12, -0.07], [0.2, -0.03], [0.26, 0.04, "sharp"], [0.16, 0.06], [0.06, 0.07], [-0.02, 0.05]],
      { at: V(s * 0.1, 1.2, 0.17), x: [s, 0, 0], y: [0, 0, -s], thickness: 0.016, bevel: 0.005, color: GOLDP, bone: jShoulder, name: `pauldron${side}` },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.026), GEM, { at: V(s * 0.17, 1.225, 0.17), scale: [1, 0.8, 1.2], bone: jShoulder }), 1.4);
  }
  glow(b.cards(wingFlames, [FLAME_A, FLAME_B], { size: [0.075, 0.22], bend: 28, flow: [0, 1, 0], cross: true, vary: 0.2, rng: r }), 1);
  glow(b.cards(wingGlowFrames, [FLAME_A, FLAME_B], { size: [0.06, 0.19], lean: 50, bend: 20, flow: [0, 0.4, -1], vary: 0.25, rng: r, cross: true }), 1);

  // Flame wisps rising from the back.
  const backHits = bodySkin.scatter(26, { rng: r, minDist: 0.1, filter: (h) => h.n.y > 0.35 && h.at.z > -0.5 });
  glow(b.cards(backHits, [FLAME_A, FLAME_B], { size: [0.07, 0.22], lean: 40, bend: 25, flow: [0, 0.3, -1], vary: 0.3, rng: r, cross: true }), 1);

  // Floating embers.
  const emberGeo = new THREE.OctahedronGeometry(1, 0);
  for (let i = 0; i < 18; i++) {
    const x = (r() * 2 - 1) * 2.1;
    const high = i % 2 === 0;
    const y = high ? 2.05 + r() * 0.3 : 0.45 + r() * 0.5;
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
  };

  /** One flat flame feather on its own joint (or rigid on `bone`). Returns its tip, direction and joint. */
  function feather(sp: FeatherSpec) {
    const x = sp.dir.clone().normalize();
    const yH = new THREE.Vector3().crossVectors(UP, x).multiplyScalar(sp.sign ?? 1).normalize();
    let y = yH;
    if (sp.bank) {
      const yV = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
      const a = sp.bank * DEG;
      y = yH.clone().multiplyScalar(Math.cos(a)).addScaledVector(yV, Math.sin(a)).normalize();
    }
    const f = flame(sp.L, sp.W, sp.flame);
    const thick = new THREE.Vector3().crossVectors(x, y).normalize();
    const base = sp.base.clone();
    base.y += sp.lift ?? 0;
    let bone = sp.bone;
    if (sp.joint) bone = b.joint(sp.name, { parent: sp.bone, at: base, dir: x, role: "fan" });
    b.extrude(f.pts, {
      at: base,
      x,
      y,
      thickness: sp.thick ?? 0.011,
      bevel: 0.0035,
      detail: 0.5,
      color: featherPaint(sp.L, f.mid, sp.stops, thick, sp.ocelli),
      bone,
      name: `f.${sp.name}`,
    });
    const tip = base.clone().addScaledVector(x, sp.L + (sp.flame?.flick ?? 0)).addScaledVector(y, f.mid(1));
    return { tip, x, fj: bone };
  }
}
