```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  arc,
  catmull,
  cells,
  countershade,
  createBuilder,
  frame,
  grain,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description:
    "A stylised hero-shooter kraken surging out of a summoning-circle sea: eight spread tentacles with glowing nodules and suckers, amber slit eyes, a hooked beak, relic bands and a shipwreck on a small plinth.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const INDIGO = "#2a2766";
const VIOLET = "#5b45b8";
const ORCHID = "#8f6bdc";
const TEAL = "#1fb7b0";
const AQUA = "#5ff0e0";
const CORAL = "#ff8f66";
const PEACH = "#ffc7a0";
const AMBER = "#ffc23a";
const NAVY = "#12163a";
const SEA = "#1b8fa8";
const DEEPSEA = "#0d3a5e";
const FOAM = "#e8fbff";
const GOLD = "#e8b84a";
const GOLD_D = "#a8742a";
const BONE = "#ffdcb0";
const IRON = "#3a3d52";
const PLUM = "#1a0b2a";

const D2R = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Smoothly interpolated profile through [t, value] keys. */
const keyCurve = (keys: number[][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return v0 + (v1 - v0) * smoothstep(t0, t1, t);
  }
  return keys[keys.length - 1][1];
};

const circlePts = (r: number, y: number, n = 16, cx = 0, cz = 0) =>
  Array.from({ length: n }, (_, i) => V(cx + Math.sin((i / n) * Math.PI * 2) * r, y, cz + Math.cos((i / n) * Math.PI * 2) * r));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.5" cy="0.45" r="0.55">
    <stop offset="0" stop-color="#fff3a8"/><stop offset="0.55" stop-color="#ffa51f"/><stop offset="1" stop-color="#c8431a"/>
  </radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="#2a0f1e"/>
  <circle cx="50" cy="50" r="42" fill="url(#i)"/>
  <circle cx="50" cy="50" r="42" fill="none" stroke="#7a2a12" stroke-width="3"/>
  <path d="M50 10 L50 22 M50 78 L50 90 M10 50 L22 50 M78 50 L90 50" stroke="#c8431a" stroke-width="3" stroke-linecap="round"/>
  <rect x="20" y="39" width="60" height="22" rx="10" fill="#120818"/>
  <ellipse cx="34" cy="33" rx="9" ry="5.5" fill="#ffffff"/>
  <circle cx="68" cy="67" r="3.6" fill="#ffffff" opacity="0.9"/>
</svg>`,
  { size: 256 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#7ffcf0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 34 Q50 -6 82 34"/>
    <path d="M50 12 L50 50"/>
    <circle cx="50" cy="62" r="12"/>
    <path d="M38 72 Q18 94 30 114 Q36 126 22 132"/>
    <path d="M62 72 Q82 94 70 114 Q64 126 78 132"/>
    <path d="M50 76 L50 118 Q50 132 40 134"/>
    <path d="M14 62 L28 62 M72 62 L86 62"/>
  </g>
  <g fill="#7ffcf0"><circle cx="50" cy="62" r="4"/><circle cx="22" cy="134" r="3"/><circle cx="78" cy="134" r="3"/><circle cx="40" cy="136" r="3"/></g>
</svg>`,
  { size: 256 },
);

const RUNE_A = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#6ffff0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 6 L32 58 M32 20 L50 36 M32 34 L16 20"/><circle cx="32" cy="58" r="1"/></g></svg>`,
  { size: 192 },
);
const RUNE_B = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#6ffff0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="32" cy="32" r="18"/><path d="M32 4 L32 14 M32 50 L32 60 M14 32 L50 32"/></g></svg>`,
  { size: 192 },
);
const RUNE_C = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#6ffff0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 54 L32 8 L52 54 M20 38 L44 38 M32 8 L32 30"/></g></svg>`,
  { size: 192 },
);

const SAIL = svg(
  `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <g transform="rotate(180 60 50)">
    <path d="M0 0 H120 L116 22 L120 40 L112 64 L116 80 L100 92 L92 80 L78 98 L66 82 L52 100 L40 84 L26 96 L14 78 L4 84 L8 56 L0 40 L6 20 Z"
      fill="#e6d9b8" stroke="#6b4a2a" stroke-width="3" stroke-linejoin="round"/>
    <rect x="84" y="24" width="22" height="22" fill="#b8553c" stroke="#6b4a2a" stroke-width="2"/>
    <path d="M14 14 L40 20 M80 10 L100 14 M20 60 L36 52" stroke="#b9a57e" stroke-width="2.5" fill="none"/>
    <ellipse cx="58" cy="38" rx="17" ry="15" fill="#3a2c58"/>
    <rect x="48" y="46" width="20" height="10" rx="2" fill="#3a2c58"/>
    <circle cx="51" cy="37" r="5" fill="#e6d9b8"/><circle cx="65" cy="37" r="5" fill="#e6d9b8"/>
    <path d="M58 44 L55 50 L61 50 Z" fill="#e6d9b8"/>
    <path d="M36 66 Q48 76 40 88 M80 66 Q68 76 76 88 M58 60 Q58 76 52 84" stroke="#3a2c58" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const BODY_TOP = paint((p, n) => {
  let c = mix(INDIGO, VIOLET, smoothstep(-0.3, 0.9, n.y) * 0.7 + smoothstep(0.5, 3.0, p.y) * 0.3);
  c = mix(c, ORCHID, 0.45 * smoothstep(0.58, 0.8, noise(p, 0.45, 2)));
  const cl = cells(p, 0.26, 5);
  if (cl.d1 < 0.055 && cl.id > 0.35) c = mix(c, AQUA, 0.85);
  return c;
});
const BODY_BELLY = paint((p) => mix("#c3a6ee", PEACH, noise(p, 0.4, 8)));
const BODY = countershade(BODY_TOP, BODY_BELLY, { level: -0.6, soft: 0.25 });

const ARM_TOP = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  const t = smoothstep(0.8, 3.0, r);
  let c = mix(mix(INDIGO, VIOLET, 0.6), mix(VIOLET, TEAL, 0.7), t);
  c = mix(INDIGO, c, smoothstep(0.5, 1.3, r));
  const band = Math.abs(((r * 7 + noise(p, 0.4, 3) * 1.5) % 1) - 0.5);
  if (band < 0.05 && n.y > -0.2) c = mix(c, AQUA, 0.7);
  return c;
});
const ARM_BELLY = paint((p) => mix(CORAL, PEACH, smoothstep(0.7, 2.8, Math.hypot(p.x, p.z)) * 0.8 + noise(p, 0.3, 4) * 0.2));
const ARM = countershade(ARM_TOP, ARM_BELLY, { level: -0.2, soft: 0.25 });

const WEB = paint((_p, _n, s) => {
  let c = mix(VIOLET, ORCHID, smoothstep(0.1, 0.9, s[0]));
  const edge = Math.min(s[1], 1 - s[1]);
  c = mix(INDIGO, c, smoothstep(0, 0.2, edge));
  if (Math.abs(Math.sin(s[1] * 9.4)) > 0.96) c = mix(c, AQUA, 0.5);
  return c;
});

const FINP = paint((_p, _n, s) => {
  let c = mix(VIOLET, AQUA, smoothstep(0.35, 1.05, s[0]) * 0.8);
  if (Math.abs(Math.sin(s[1] * 16 + s[0] * 4)) > 0.93) c = mix(c, FOAM, 0.4);
  return c;
});

const BEAKP = paint((_p, _n, s) => mix("#2a1b45", "#e9c9a0", smoothstep(0.12, 0.3, s[0]) * 0.9));

const WATER = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  if (n.y < 0.4) return mix(DEEPSEA, SEA, smoothstep(0.1, 0.38, p.y));
  let c = mix(SEA, "#3fc3cf", smoothstep(0.35, 0.75, noise(p, 0.7, 11)));
  c = mix(DEEPSEA, c, smoothstep(0.2, 1.3, r) * 0.6 + 0.4);
  const ripple = Math.abs(Math.sin(r * 7 + noise(p, 0.8, 4) * 4));
  if (ripple > 0.94) c = mix(c, FOAM, 0.6);
  if (r > 3.1) c = mix(c, FOAM, smoothstep(3.1, 3.28, r));
  return c;
});

const PLINTH = paint((p, n) => {
  const ang = Math.atan2(p.x, p.z);
  const seg = ((((ang / (Math.PI * 2)) * 16) % 1) + 1) % 1;
  let c = mix(NAVY, "#2c3f7a", noise(p, 0.5, 6));
  if (n.y < 0.5) {
    if (seg < 0.05) c = mix(c, "#0a0c20", 0.9);
    if (p.y > 0.095 && p.y < 0.118) c = mix(c, GOLD, 0.9);
  }
  return c;
});

const SPLASH = paint((p) => mix("#7fe0f0", "#f2ffff", smoothstep(0.4, 0.95, p.y)));
const WOOD = grain("#8a5a34", "#5a3820", { size: 0.03, axis: "y", seed: 3 });
const PLANK = grain("#7a4e2d", "#4a2d1a", { size: 0.025, axis: "x", seed: 7 });

// ---------------------------------------------------------------------------------------------------------------
type Key = number[];
// Tentacle routes as [radius from axis, height, lateral sweep]
const UPF: Key[] = [[0.4, 1.02, 0], [0.9, 1.12, 0], [1.4, 1.5, 0.05], [1.8, 2.0, 0.15], [2.1, 2.5, 0.3], [2.4, 2.85, 0.45], [2.75, 2.95, 0.6], [3.0, 2.75, 0.7], [3.05, 2.45, 0.7]];
const UPB: Key[] = [[0.4, 1.05, 0], [0.9, 1.2, 0], [1.4, 1.65, 0.05], [1.75, 2.25, 0.15], [1.95, 2.85, 0.3], [2.2, 3.35, 0.4], [2.55, 3.6, 0.35], [2.9, 3.5, 0.25], [3.05, 3.2, 0.1]];
const DOWNM: Key[] = [[0.4, 1.0, 0], [0.9, 1.08, 0], [1.45, 1.4, -0.1], [2.0, 1.5, -0.25], [2.45, 1.15, -0.4], [2.75, 0.75, -0.55], [2.9, 0.45, -0.7], [2.85, 0.37, -1.0], [2.65, 0.36, -1.25], [2.45, 0.37, -1.2]];
const DOWNR: Key[] = [[0.4, 1.0, 0], [0.9, 1.05, 0], [1.5, 1.2, 0.15], [2.1, 1.1, 0.35], [2.55, 0.8, 0.6], [2.8, 0.5, 0.85], [2.82, 0.37, 1.1], [2.7, 0.36, 1.4], [2.45, 0.37, 1.45]];

const DEFS = [
  { n: "FR", az: -48, keys: UPF },
  { n: "MR", az: -92, keys: DOWNM },
  { n: "BR", az: -132, keys: UPB },
  { n: "RR", az: -164, keys: DOWNR },
  { n: "RL", az: 164, keys: DOWNR },
  { n: "BL", az: 132, keys: UPB },
  { n: "ML", az: 92, keys: DOWNM },
  { n: "FL", az: 48, keys: UPF },
];

const armPts = (az: number, keys: Key[]) => {
  const a = az * D2R;
  const sg = Math.sign(az);
  return keys.map(([r, y, l]) => V(Math.sin(a) * r + Math.cos(a) * l * sg, y, Math.cos(a) * r - Math.sin(a) * l * sg));
};
const armR = (t: number) => 0.25 * Math.pow(1 - t, 1.5) + 0.032;
const bodyR = keyCurve([[0, 0.78], [0.19, 0.8], [0.39, 0.84], [0.6, 0.72], [0.82, 0.5], [0.94, 0.3], [1, 0.08]]);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });

  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const SPH8 = new THREE.SphereGeometry(1, 8, 6);
  const SUCKER = new THREE.LatheGeometry(
    [new THREE.Vector2(0, -0.2), new THREE.Vector2(0.55, -0.2), new THREE.Vector2(0.5, 0.18), new THREE.Vector2(0.3, 0.2), new THREE.Vector2(0.2, 0.05), new THREE.Vector2(0, 0.12)],
    7,
  );
  const SPIKE = new THREE.ConeGeometry(0.06, 0.3, 5);

  // ---- Skeleton -------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.3, 0.08], dir: [0, 1, 0] });
  const spineCurve = catmull([[0, 0.3, 0.08], [0, 0.9, 0.08], [0, 1.5, 0], [0, 2.1, -0.25], [0, 2.7, -0.6], [0, 3.15, -0.95]]);
  const spine = b.chain("spine", spineCurve, { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3", "spine4", "spine5"] });
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 1.5, 0.04], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.0, 0.8], aim: [0, 0.98, 1.1], role: "jaw" });

  // ---- Stage: plinth, sea, rim -----------------------------------------------------------------------------
  b.lathe([[0, 0], [3.5, 0], [3.5, 0.1], [3.38, 0.14], [0, 0.14]], { at: [0, 0, 0], bone: root, segments: 28, color: PLINTH });
  b.lathe([[0, 0.1], [3.28, 0.1], [3.3, 0.28], [3.2, 0.36], [2.2, 0.37], [1.2, 0.4], [0, 0.4]], { at: [0, 0, 0], bone: root, segments: 28, color: WATER });
  b.sweep(catmull(circlePts(3.42, 0.15, 28), { closed: true }), 0.05, { color: GOLD, sides: 6, bone: root });
  b.sweep(catmull(circlePts(0.95, 0.4, 14), { closed: true }), 0.07, { color: FOAM, sides: 6, bone: root });

  // splash crowns
  b.ring(frame([0, 0.4, 0.08], [0, 1, 0]), { count: 14, radius: 1.02, tilt: 62 }, (it) =>
    b.spike(it, it, 0.5, 0.1, { color: SPLASH, sides: 5 }),
  );
  b.ring(frame([0, 0.39, 0.08], [0, 1, 0]), { count: 10, radius: 1.4, tilt: 70 }, (it) =>
    b.spike(it, it, 0.3, 0.07, { color: SPLASH, sides: 5 }),
  );

  // summoning-circle arcs on the water
  for (const [r, y, n, len, off] of [[1.55, 0.392, 4, 52, 10], [2.25, 0.375, 5, 42, 30]] as const) {
    for (let i = 0; i < n; i++) {
      const a0 = (off + (i * 360) / n) * D2R;
      glow(b.sweep(arc([0, y, 0], [r * Math.sin(a0), y, r * Math.cos(a0)], [0, 1, 0], len), 0.03, { color: AQUA, sides: 5, bone: root }), 1.3);
    }
  }
  // rune cards
  const runeAz = [0, 22, -22, 112, -112, 148, -148].map((a) => a * D2R);
  glow(
    b.cards(
      runeAz.map((a) => frame([Math.sin(a) * 3.02, 0.372, Math.cos(a) * 3.02], [0, 1, 0])),
      [RUNE_A, RUNE_B, RUNE_C],
      {
        size: 0.34,
        lean: 90,
        mirror: true,
        rng: rng(5),
        bone: root,
        flow: (_f, i) => [Math.sin(runeAz[i]), 0, Math.cos(runeAz[i])],
      },
    ),
    1.2,
  );

  // ---- Body (mantle) ----------------------------------------------------------------------------------------
  const body = b.sweep(spine, bodyR, { color: BODY, sides: 10, smooth: false, caps: { start: "flat", end: "round" } });
  const skin = b.surface(body);

  // fins
  const FIN_OUT: (number[] | [number, number, "sharp"])[] = [[0, 0], [0.6, 0.05], [1.05, 0.35, "sharp"], [0.8, 0.75], [0.4, 1.0], [0, 0.9]];
  const fc = spineCurve.at(0.58);
  for (const s of [1, -1]) {
    b.extrude(FIN_OUT as [number, number][], {
      at: V(fc.x + s * 0.5, fc.y - 0.05, fc.z - 0.05),
      x: [s, 0, 0],
      y: [0, 0.92, -0.4],
      thickness: [0.07, 0.02],
      bevel: 0.01,
      smoothing: 1,
      color: FINP,
      bone: spine.joints[3],
    });
  }

  // dorsal spikes
  for (let i = 0; i < 7; i++) {
    const t = 0.3 + i * 0.1;
    const c = spineCurve.at(t);
    const hit = skin.nearest(V(0, c.y, c.z - 2.5));
    const k = 1.3 - i * 0.12;
    b.stick(SPIKE, BONE, hit, { embed: 0.2, scale: [k, k, k], flat: true });
  }
  for (const s of [1, -1])
    for (const t of [0.4, 0.55, 0.7]) {
      const c = spineCurve.at(t);
      const hit = skin.nearest(V(s * 1.3, c.y, c.z - 1.6));
      b.stick(SPIKE, BONE, hit, { embed: 0.2, scale: [0.8, 0.8, 0.8], flat: true });
    }

  // bioluminescent flank orbs
  for (const s of [1, -1])
    for (const [t, k] of [[0.3, 0], [0.42, 1], [0.5, 0], [0.62, 1], [0.72, 0], [0.82, 1]]) {
      const c = spineCurve.at(t);
      const hit = skin.nearest(V(s * 2.5, c.y, c.z + (k ? 0.3 : -0.15)));
      const r = k ? 0.06 : 0.045;
      glow(b.stick(SPH, AQUA, hit, { embed: 0.3, scale: [r, r, r] }), 1.3);
    }

  // sigil on the brow of the mantle
  const sg = skin.nearest(V(0, spineCurve.at(0.66).y, spineCurve.at(0.66).z + 2.2));
  glow(b.decal(body, SIGIL, { at: sg.at, dir: sg.n, size: [0.5, 0.7], up: [0, 1, 0], segments: 10 }), 1.2);

  // relic bands
  for (const [jt, r] of [[spine.joints[3], 0.04], [spine.joints[4], 0.03]] as const) {
    const loop = skin.loop(jt, { lift: 0.02 });
    b.sweep(loop, r, { color: GOLD, sides: 6 });
    b.along(loop, 12, (at) => b.part(SPH, GOLD_D, { frame: at, scale: [r * 1.5, r * 1.5, r * 1.5] }));
  }

  // ---- Face -------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const az = s * 31 * D2R;
    const el = 4 * D2R;
    const g = V(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const E = V(0, 1.5, 0.04).addScaledVector(g, 0.76);
    const ball = glow(b.part(new THREE.SphereGeometry(0.26, 12, 8), "#ffe9a0", { bone: head, at: E }), 0.8);
    b.decal(ball, EYE, { at: E.clone().addScaledVector(g, 0.26), dir: g, size: [0.36, 0.36], segments: 8, bone: head });
    // angry brow
    const browAt = E.clone().add(V(0, 0.17, 0)).addScaledVector(g, 0.05);
    b.part(SPH8, "#3a2f8a", { bone: head, at: browAt, dir: g, axis: "z", up: [-0.5 * s, 1, 0], scale: [0.31, 0.1, 0.25] });
    b.spike(browAt.clone().add(V(s * 0.26, 0.02, 0)), [s * 0.7, 0.8, 0.2], 0.3, 0.05, { color: BONE, sides: 5 });
    // cheek stud
    b.part(SPH, GOLD, { bone: head, at: E.clone().add(V(s * 0.12, -0.3, 0.02)), scale: [0.05, 0.05, 0.05] });
  }

  // mouth
  b.part(SPH8, PLUM, { bone: head, at: [0, 1.0, 0.84], scale: [0.3, 0.24, 0.12] });
  b.part(new THREE.TorusGeometry(0.27, 0.07, 6, 12), CORAL, { bone: head, at: [0, 1.0, 0.86], dir: [0, 0, 1], axis: "z" });
  const Y0 = 1.03;
  const Z0 = 0.82;
  b.extrude(
    [[0, 0.17], [0.16, 0.16], [0.27, 0.06], [0.31, -0.12, "sharp"], [0.2, -0.04], [0.08, -0.03], [0, -0.02]],
    { at: [0, Y0, Z0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.22, bevel: 0.03, smoothing: 1, color: BEAKP, bone: head },
  );
  b.extrude(
    [[0, -0.01], [0.07, 0.02], [0.2, 0.03], [0.24, 0.11, "sharp"], [0.22, -0.05], [0.1, -0.12], [0, -0.1]],
    { at: [0, Y0 - 0.065, Z0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.2, bevel: 0.025, smoothing: 1, color: BEAKP, bone: jaw },
  );
  b.ring(frame([0, 1.0, 0.9], [0, 0, 1]), { count: 12, radius: 0.31, tilt: 55 }, (it) =>
    b.spike(it, it, 0.13, 0.035, { color: BONE, sides: 5 }),
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  // ---- Tentacles --------------------------------------------------------------------------------------------
  const paths: ReturnType<typeof catmull>[] = [];
  for (const def of DEFS) {
    const path = catmull(armPts(def.az, def.keys));
    paths.push(path);
    const chain = b.chain(`tentacle${def.n}`, path, { parent: hips, role: "tentacle" });
    const tube = b.sweep(chain, armR, { color: ARM, sides: 8, caps: "round" });
    const armSkin = b.surface(tube);
    const a = def.az * D2R;
    const d = V(Math.sin(a), 0, Math.cos(a));
    const belly = V(-d.x * 0.6, -1, -d.z * 0.6).normalize();
    const topDir = V(d.x * 0.5, 1, d.z * 0.5).normalize();

    // suckers on the underside, two staggered rows
    for (let k = 0; k < 9; k++)
      for (const sgn of [-1, 1]) {
        const t = 0.1 + k * 0.09 + (sgn > 0 ? 0.045 : 0);
        const c = chain.at(t);
        const probe = c.at.clone().addScaledVector(belly, 0.9).addScaledVector(c.binormal, sgn * 0.45);
        const hit = armSkin.nearest(probe);
        const sz = armR(t) * 0.95;
        b.stick(SUCKER, CORAL, hit, { embed: 0.3, scale: [sz, sz, sz], flat: true });
      }
    // glowing nodules on the back
    for (const t of [0.2, 0.34, 0.48, 0.62, 0.76]) {
      const c = chain.at(t);
      const hit = armSkin.nearest(c.at.clone().addScaledVector(topDir, 0.9));
      const sz = armR(t) * 0.5;
      glow(b.stick(SPH, AQUA, hit, { embed: 0.3, scale: [sz, sz, sz] }), 1.3);
    }
    // tip lamp
    glow(b.part(SPH, AQUA, { bone: chain.joints[chain.joints.length - 1], at: path.at(1), scale: [0.075, 0.075, 0.075] }), 1.5);

    // foam rings where low tentacles meet the sea
    if (def.keys === DOWNM || def.keys === DOWNR) {
      const tp = path.at(1);
      for (const r of [0.22, 0.34]) b.sweep(catmull(circlePts(r, 0.385, 10, tp.x, tp.z), { closed: true }), 0.022, { color: FOAM, sides: 5, bone: root });
    }
  }

  // webbing between neighbouring arms (leaves the front open for the maw)
  const order = [0, 1, 2, 3, 4, 5, 6, 7];
  const sorted = order.slice().sort((p, q) => DEFS[p].az - DEFS[q].az);
  const pairs: [number, number][] = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [7, 0]];
  for (const [i, j] of pairs) {
    const A = paths[sorted[i]];
    const B = paths[sorted[j]];
    b.membrane(A.slice(0, 0.28), B.slice(0, 0.28), { color: WEB, thickness: 0.025, rows: 4, bone: hips });
  }

  // ---- Props: shipwreck, lantern ----------------------------------------------------------------------------
  const prop = (
    geo: THREE.BufferGeometry,
    color: Parameters<typeof b.part>[1],
    at: number[],
    extra: { dir?: number[]; axis?: "x" | "y" | "z"; rotation?: [number, number, number]; scale?: [number, number, number] } = {},
  ) => b.part(geo, color, { bone: root, at, ...extra });

  // broken mast, yard and sail
  const B0 = V(-2.07, 0.3, 1.1);
  const T0 = V(-2.37, 2.3, 1.38);
  b.rod(B0, T0, [0.09, 0.06], WOOD, { bone: root, sides: 6 });
  b.spike(T0, [0.2, 1, 0.1], 0.22, 0.045, { color: "#b98a58", sides: 5, bone: root });
  b.spike(T0.clone().add(V(0.04, -0.05, 0)), [-0.5, 1, 0.2], 0.16, 0.035, { color: "#b98a58", sides: 5, bone: root });
  const C0 = B0.clone().lerp(T0, 0.68);
  b.rod(C0.clone().add(V(-0.7, 0.05, 0)), C0.clone().add(V(0.7, -0.05, 0)), 0.04, WOOD, { bone: root, sides: 6 });
  b.cards([frame([C0.x, C0.y, C0.z], [0, 1, 0])], SAIL, { size: [1.2, 0.8], lean: 180, flow: [0, 0, 1], bone: root });
  for (const sx of [-0.7, 0.7]) b.rod(C0.clone().add(V(sx, 0, 0)), V(C0.x + sx * 1.5, 0.4, C0.z + 0.35), 0.012, "#c9b38a", { bone: root, sides: 4 });

  // ship's wheel half sunk in the sea
  const wheelParts: THREE.BufferGeometry[] = [new THREE.TorusGeometry(0.3, 0.035, 6, 14), new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8).rotateX(Math.PI / 2)];
  for (let i = 0; i < 4; i++) wheelParts.push(new THREE.BoxGeometry(0.72, 0.04, 0.04).rotateZ((i * Math.PI) / 4));
  for (let i = 0; i < 8; i++) {
    const ph = (i * Math.PI) / 4;
    wheelParts.push(new THREE.CylinderGeometry(0.02, 0.025, 0.16, 5).rotateZ(ph - Math.PI / 2).translate(Math.cos(ph) * 0.38, Math.sin(ph) * 0.38, 0));
  }
  const wheel = mergeGeometries(wheelParts);
  if (wheel) prop(wheel, WOOD, [1.76, 0.7, 1.48], { dir: [0.55, 0.35, 0.75], axis: "z" });
  prop(new THREE.SphereGeometry(0.05, 6, 4), GOLD, [1.76, 0.7, 1.48], { dir: [0.55, 0.35, 0.75], axis: "z", scale: [1, 1, 1.2] });

  // floating planks
  for (const [x, z, ang, tilt] of [[0.4, 2.75, 25, 3], [-0.25, 2.95, -40, -4], [1.2, 2.55, 70, 2]] as const)
    prop(new THREE.BoxGeometry(0.9, 0.05, 0.18), PLANK, [x, 0.385, z], { rotation: [tilt, ang, 0] });

  // lantern buoy
  const LX = [-0.8, 0.4, 2.4];
  prop(new THREE.CylinderGeometry(0.11, 0.13, 0.08, 8), IRON, [LX[0], 0.42, LX[2]]);
  glow(prop(new THREE.BoxGeometry(0.15, 0.17, 0.15), "#ffb347", [LX[0], 0.55, LX[2]]), 1.5);
  prop(new THREE.ConeGeometry(0.12, 0.1, 8), IRON, [LX[0], 0.69, LX[2]]);
  prop(new THREE.TorusGeometry(0.05, 0.012, 5, 8), IRON, [LX[0], 0.78, LX[2]], { dir: [1, 0, 0], axis: "z" });
  for (const cx of [-1, 1] as const)
    for (const cz of [-1, 1] as const) b.rod([LX[0] + cx * 0.07, 0.47, LX[2] + cz * 0.07], [LX[0] + cx * 0.07, 0.63, LX[2] + cz * 0.07], 0.008, IRON, { bone: root, sides: 4 });

  return b.root;
}
```