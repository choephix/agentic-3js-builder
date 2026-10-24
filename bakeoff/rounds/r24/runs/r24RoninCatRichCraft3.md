```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  limb,
  countershade,
  stripes,
  grain,
  mottle,
  paint,
  mix,
  smoothstep,
  noise,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ronin Cat",
  description:
    "A scarred ginger tabby ronin in a faded indigo kimono and patched hakama, a straw kasa with his ears poking through, a katana at his hip, a red scarf, and a glowing paper lantern. Redwall storybook style.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GINGER = "#d98a3a";
const GINGER_D = "#8c4b1f";
const GINGER_L = "#f0b867";
const CREAM = "#f6e3bd";
const PINK = "#e58f8f";
const NOSEC = "#b4505a";
const BROW = "#6e3814";
const CLAW = "#efe4cc";
const SASH = "#7d2a27";
const SASH2 = "#9a3b32";
const SCARF = "#b8372f";
const LEATHER = "#5a3a22";
const LEATHER_D = "#3c2616";
const GOLD = "#d9a93b";
const CORD = "#a8322a";
const TRIM = "#d8c9a0";
const STRAW_D = "#8b6a2e";

// ---------------------------------------------------------------------------------------------------------------
// Helpers
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function keyed(keys: [number, number][], t: number) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------------------------------------------------------
// Paints
const FUR_ARM = countershade(stripes(GINGER, GINGER_D, { size: 0.05, axis: "y", width: 0.3, wobble: 0.7, seed: 3 }), CREAM, {
  level: -0.6,
  soft: 0.3,
});
const FUR_HEAD = countershade(mottle(GINGER, GINGER_L, { size: 0.08, seed: 5 }), CREAM, { level: -0.5, soft: 0.22 });
const FUR_NECK = countershade(GINGER, CREAM, { level: -0.2, soft: 0.3 });

const CLOTH = grain("#2b3862", "#37467a", { size: 0.02, axis: "y", seed: 2 });
const KIMONO = paint((p, n) => {
  const base = CLOTH.at(p, n);
  if (n.z > 0.1 && p.y > 0.6) {
    const e = (p.y - 0.6) * 0.2 - Math.abs(p.x);
    if (e > 0) return mix("#e0c28f", CREAM, smoothstep(0, 0.02, e));
  }
  return base;
});

const HAK_BASE = stripes(mottle("#55506a", "#615b78", { size: 0.07, seed: 11 }), "#3e3a50", {
  size: 0.05,
  axis: "x",
  width: 0.25,
  wobble: 0.15,
  seed: 12,
});
const HAKAMA = paint((p, n) => mix(HAK_BASE.at(p, n), "#5b4630", 0.8 * smoothstep(0.22, 0.04, p.y)));

const STRAW = paint((p, _n, s) => {
  const a = (((s[1] / 7) % 1) + 1) % 1;
  const h = (s[0] / 0.014) % 1;
  const weave = Math.abs(a - 0.5) * 2;
  let c = mix("#dcb865", "#b98f43", Math.min(1, weave * 0.6 + (h < 0.14 ? 0.45 : 0)));
  c = mix(c, "#7c5b2a", 0.55 * smoothstep(0.55, 0.85, noise(p, 0.07, 9)));
  return s[0] < 0.012 ? mix(c, "#6b4c22", 0.6) : c;
});

const TAILP = paint((p, n, s) => {
  const t = s[0];
  let c = GINGER;
  if (t > 0.88) c = CREAM;
  else if (t > 0.04 && (t * 13) % 1 < 0.38) c = GINGER_D;
  return mix(c, CREAM, 0.45 * smoothstep(0.2, -0.8, n.y) * (t > 0.88 ? 0 : 1));
});

const LACP = paint((_p, n) => mix("#1b1822", "#4a4660", 0.8 * smoothstep(0.4, 1, n.y)));
const SCARFP = grain(SCARF, "#9a2d27", { size: 0.015, axis: "x", seed: 4 });
const SCARF_TAIL = paint((_p, _n, s) => (s[1] < -0.04 && s[1] > -0.055 ? TRIM : SCARF));

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = svg(
  `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="i" cx="0.5" cy="0.65" r="0.7"><stop offset="0" stop-color="#ffe27a"/><stop offset="0.6" stop-color="#f0a81c"/><stop offset="1" stop-color="#b9660f"/></radialGradient>
    <clipPath id="c"><path d="M5 44 Q7 10 34 8 Q59 10 61 44 Q59 74 34 74 Q7 72 5 44Z"/></clipPath>
  </defs>
  <path d="M5 44 Q7 10 34 8 Q59 10 61 44 Q59 74 34 74 Q7 72 5 44Z" fill="#f7efd4"/>
  <g clip-path="url(#c)">
    <ellipse cx="35" cy="44" rx="27" ry="36" fill="url(#i)"/>
    <ellipse cx="35" cy="44" rx="7" ry="28" fill="#1a0f0a"/>
    <ellipse cx="26" cy="30" rx="6" ry="8" fill="#ffffff"/>
    <circle cx="45" cy="62" r="3.2" fill="#ffffff" opacity="0.9"/>
    <path d="M0 0 L64 0 L64 40 Q36 36 3 20 Z" fill="#e09a48"/>
    <path d="M3 20 Q36 36 64 40" stroke="#2a1a14" stroke-width="5" fill="none"/>
  </g>
  <path d="M5 44 Q7 10 34 8 Q59 10 61 44 Q59 74 34 74 Q7 72 5 44Z" fill="none" stroke="#2a1a14" stroke-width="4"/>
</svg>`,
  { size: 256 },
);

const MARK = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#7a3f19" stroke-width="5.5" stroke-linecap="round" fill="none">
    <path d="M32 40 L31 8"/><path d="M21 40 Q16 22 11 12"/><path d="M43 40 Q48 22 53 12"/>
  </g></svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 4 L38 92" stroke="#8d4a3d" stroke-width="9" stroke-linecap="round"/>
  <path d="M10 4 L38 92" stroke="#f2dcc0" stroke-width="4.5" stroke-linecap="round"/>
  <g stroke="#3a2018" stroke-width="2.6" stroke-linecap="round">
    <path d="M6 26 L18 30"/><path d="M12 46 L24 50"/><path d="M19 66 L31 70"/>
  </g></svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#2a1a14" stroke-width="2.8" stroke-linecap="round" fill="none">
    <path d="M32 1 L32 10"/><path d="M32 10 Q27 20 13 15"/><path d="M32 10 Q37 20 51 15"/>
  </g></svg>`,
  { size: 256 },
);

const CREST = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <circle cx="48" cy="48" r="44" fill="none" stroke="#e8dcc0" stroke-width="5"/>
  <g fill="#e8dcc0">
    <ellipse cx="48" cy="62" rx="18" ry="14"/>
    <ellipse cx="22" cy="44" rx="7.5" ry="10" transform="rotate(-25 22 44)"/>
    <ellipse cx="37" cy="27" rx="8" ry="11" transform="rotate(-8 37 27)"/>
    <ellipse cx="59" cy="27" rx="8" ry="11" transform="rotate(8 59 27)"/>
    <ellipse cx="74" cy="44" rx="7.5" ry="10" transform="rotate(25 74 44)"/>
  </g></svg>`,
  { size: 192 },
);

const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c9772f"/><stop offset="0.6" stop-color="#e9a95a"/><stop offset="1" stop-color="#f6e3bd"/></linearGradient></defs>
  <path d="M16 64 C4 46 8 22 16 0 C24 22 28 46 16 64Z" fill="url(#g)" stroke="#8c4b1f" stroke-width="2"/>
  <path d="M16 60 L16 14" stroke="#8c4b1f" stroke-width="1.6" opacity="0.6"/></svg>`,
  { size: 128 },
);

const STRAWTEX = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#caa24d" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M4 48 Q2 24 5 3"/><path d="M8 48 Q9 26 7 2"/><path d="M12 48 Q14 24 11 5"/>
  </g></svg>`,
  { size: 128 },
);

const FRAY = svg(
  `<svg viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 40 H24 V12 L20 0 L16 10 L12 0 L8 10 L4 0 L0 12Z" fill="#4d485f" stroke="#2f2b3c" stroke-width="1.5"/>
  <path d="M0 33 H24" stroke="#6b6580" stroke-width="1.2" stroke-dasharray="3 2"/></svg>`,
  { size: 96 },
);

const OFUDA = svg(
  `<svg viewBox="0 0 24 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="20" height="52" fill="#efe6c8" stroke="#8a6a3a" stroke-width="1.6"/>
  <g stroke="#b3261e" stroke-width="2.4" stroke-linecap="round" fill="none">
    <path d="M12 10 V46"/><path d="M6 17 H18"/><path d="M7 27 H17"/><path d="M8 37 H16"/>
  </g>
  <circle cx="12" cy="6" r="1.8" fill="#b3261e"/></svg>`,
  { size: 128 },
);

const PATCH = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="28" height="28" rx="2" fill="#7a5a3a"/>
  <rect x="5" y="5" width="22" height="22" fill="none" stroke="#d8c9a0" stroke-width="1.6" stroke-dasharray="3 2.4"/>
  <path d="M5 5 L27 27" stroke="#5a4028" stroke-width="1.2" opacity="0.6"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "roninCat" });
  const R = rng(11);

  // ===== Skeleton: spine, neck, head ================================================================================
  const hips = b.joint("hips", { at: [0, 0.5, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, 0],
      [0, 0.62, 0.004],
      [0, 0.76, 0.012],
      [0, 0.88, 0.016],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.88, 0.016],
      [0, 0.95, 0.04],
      [0, 1.02, 0.06],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const HEAD_AT = V(0, 1.02, 0.06);
  const head = b.joint("head", { parent: neck, at: HEAD_AT, dir: [0, 1, 0.3], role: "head" });
  const hp = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.02, 0.05), aim: hp(0, 0.01, 0.17), role: "jaw" });

  // ===== Torso (kimono) =============================================================================================
  const TRX: [number, number][] = [[0, 0.115], [0.25, 0.095], [0.55, 0.105], [0.8, 0.125], [1, 0.105]];
  const TRY: [number, number][] = [[0, 0.09], [0.25, 0.075], [0.55, 0.08], [0.8, 0.09], [1, 0.08]];
  const torso = b.sweep(spine, (t) => [keyed(TRX, t), keyed(TRY, t)], { color: KIMONO, sides: 12 });
  const skin = b.surface(torso);

  // neck, scarf ring
  b.sweep(neck, [0.058, 0.05], { color: FUR_NECK });
  const scarfPts = Array.from({ length: 14 }, (_, k) => {
    const a = (k / 14) * Math.PI * 2;
    return V(Math.sin(a) * 0.088, 0.945 - 0.012 * Math.cos(a), 0.035 + Math.cos(a) * 0.08);
  });
  b.sweep(catmull(scarfPts, { closed: true }), 0.03, { color: SCARFP, bone: neck, sides: 8 });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), SCARF, { bone: neck, at: V(0.05, 0.92, 0.1), scale: [1, 1, 0.9] });
  const scarfTail = (len: number): [number, number][] => [
    [-0.037, 0],
    [0.037, 0],
    [0.042, -len],
    [0, -len + 0.035],
    [-0.042, -len],
  ];
  for (const [x, len, tilt] of [
    [0.06, 0.27, 0.32],
    [-0.04, 0.2, 0.22],
  ] as const) {
    b.extrude(scarfTail(len), {
      at: V(x, 0.925, -0.08),
      x: [1, 0, 0],
      y: [0, 1, tilt],
      thickness: 0.012,
      color: SCARF_TAIL,
      bone: neck,
    });
  }
  b.extrude(scarfTail(0.13), {
    at: V(0.055, 0.9, 0.11),
    x: [1, 0, 0],
    y: [-0.1, 1, -0.2],
    thickness: 0.012,
    color: SCARF_TAIL,
    bone: neck,
  });

  // kimono collar lapels
  for (const s of [1, -1]) {
    const lap = skin.drape(
      catmull([
        V(s * 0.064, 0.918, 0.058),
        V(s * 0.042, 0.82, 0.09),
        V(s * 0.02, 0.7, 0.1),
        V(0, 0.6, 0.105),
      ]),
      { lift: 0.004 },
    );
    b.sweep(lap, 0.011, { color: TRIM, sides: 6 });
  }

  // crests
  const chestHit = skin.ray([0.092, 0.77, 0.5], [0, 0, -1]);
  if (chestHit) b.decal(torso, CREST, { at: chestHit, size: [0.065, 0.065] });
  const backHit = skin.ray([0, 0.66, -0.5], [0, 0, 1]);
  if (backHit) b.decal(torso, CREST, { at: backHit, size: [0.13, 0.13] });

  // obi sashes and knot
  b.sweep(skin.loop([0, 0.565, 0], { lift: 0.01 }), 0.027, { color: SASH, sides: 8 });
  b.sweep(skin.loop([0, 0.605, 0], { lift: 0.008 }), 0.02, { color: SASH2, sides: 8 });
  b.part(new THREE.SphereGeometry(0.03, 8, 6), SASH2, { bone: hips, at: V(0, 0.578, 0.128), scale: [1.4, 0.95, 0.8] });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.016, 0],
        [0.016, 0],
        [0.02, -0.15 + 0.03 * s],
        [0, -0.12 + 0.03 * s],
        [-0.02, -0.15 + 0.03 * s],
      ],
      {
        at: V(s * 0.02, 0.57, 0.132),
        x: [1, 0, 0],
        y: [-s * 0.12, 1, -0.14],
        thickness: 0.01,
        color: SASH,
        bone: hips,
      },
    );
  }

  // ===== Katana =====================================================================================================
  const H = V(0.15, 0.6, 0.2);
  const T = V(0.24, 0.42, -0.5);
  const D = T.clone().sub(H).normalize();
  const sw = (d: number) => H.clone().addScaledVector(D, d);
  const WRAP = stripes("#e9e0c8", "#8f2a26", { size: 0.022, axis: D, width: 0.45, wobble: 0 });
  b.rod(sw(0), sw(0.18), 0.0165, WRAP, { bone: hips, sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: hips, at: sw(-0.002) });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 8), "#4a3a22", { bone: hips, at: sw(0.185), dir: D });
  b.part(new THREE.TorusGeometry(0.04, 0.004, 4, 8), GOLD, { bone: hips, at: sw(0.185), dir: D, axis: "z" });
  b.rod(sw(0.19), T, [0.025, 0.019], LACP, { bone: hips, sides: 8 });
  b.rod(sw(0.19), sw(0.22), 0.027, GOLD, { bone: hips, sides: 8 });
  for (const d of [0.34, 0.37]) {
    b.part(new THREE.TorusGeometry(0.0245, 0.004, 4, 10), CORD, { bone: hips, at: sw(d), dir: D, axis: "z" });
  }
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD, { bone: hips, at: T, scale: [1, 1, 1.3] });
  // sageo cord with bead and tassel
  const sageo = b.sweep(
    catmull([sw(0.25), V(0.215, 0.5, 0.0), V(0.2, 0.45, 0.06), V(0.195, 0.4, 0.085)]),
    0.004,
    { color: CORD, bone: hips, sides: 4 },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 5), GOLD, { bone: hips, at: V(0.195, 0.395, 0.085) });
  for (let i = 0; i < 3; i++) {
    b.rod(V(0.195, 0.39, 0.085), V(0.195 + (i - 1) * 0.012, 0.335, 0.085 + (i - 1) * 0.006), 0.004, CORD, {
      bone: hips,
      sides: 4,
    });
  }
  void sageo;
  // ofuda charm at the pommel
  b.rod(sw(0), V(0.15, 0.575, 0.205), 0.003, CORD, { bone: hips, sides: 4 });
  b.cards([frame(V(0.15, 0.575, 0.205), [0, 1, 0])], OFUDA, {
    size: [0.045, 0.1],
    lean: 180,
    flow: [0, 0, 1],
    bone: hips,
  });

  // ===== Lantern (right hip, back) ==================================================================================
  b.rod(V(-0.09, 0.565, -0.085), V(-0.12, 0.5, -0.16), 0.004, LEATHER_D, { bone: hips, sides: 4 });
  glow(
    b.lathe(
      [
        [0, 0],
        [0.03, 0.0],
        [0.047, 0.025],
        [0.05, 0.05],
        [0.047, 0.075],
        [0.03, 0.095],
        [0, 0.095],
      ],
      { at: V(-0.12, 0.405, -0.16), segments: 10, color: "#ffb347", bone: hips },
    ),
    1.3,
  );
  for (const [y, r] of [
    [0.4, 0.034],
    [0.4275, 0.048],
    [0.4525, 0.05],
    [0.4775, 0.047],
    [0.5, 0.032],
  ] as const) {
    b.part(new THREE.TorusGeometry(r, 0.0035, 4, 10), "#2a1a14", {
      bone: hips,
      at: V(-0.12, y + 0.005, -0.16),
      dir: [0, 1, 0],
      axis: "z",
    });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.014, 8), "#2a1a14", { bone: hips, at: V(-0.12, 0.402, -0.16) });
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.014, 8), "#2a1a14", { bone: hips, at: V(-0.12, 0.503, -0.16) });

  // ===== Tail =======================================================================================================
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.5, -0.1],
      [0, 0.47, -0.26],
      [0, 0.52, -0.42],
      [0, 0.67, -0.52],
      [0, 0.85, -0.5],
      [0, 1.0, -0.42],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  const tailMesh = b.sweep(tail, (t) => keyed([[0, 0.05], [0.4, 0.058], [0.8, 0.05], [1, 0.034]], t), {
    color: TAILP,
    sides: 8,
  });
  const tailHits = b.surface(tailMesh).scatter(34, { rng: rng(31), minDist: 0.04 });
  b.cards(tailHits, TUFT, { size: [0.035, 0.055], lean: 55, bend: 20, vary: 0.3, rng: rng(32) });

  // ===== Arms and hands =============================================================================================
  const ARM_R: [number, number][] = [[0, 0.052], [0.4, 0.046], [0.75, 0.036], [0.9, 0.045], [1, 0.032]];
  const SLEEVE_R: [number, number][] = [[0, 0.07], [0.2, 0.078], [0.44, 0.105]];
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const sh = V(s * 0.14, 0.84, 0);
    const el = V(s * 0.235, 0.68, 0.012);
    const wr = V(s * 0.29, 0.53, 0.07);
    const hd = V(s * 0.315, 0.45, 0.092);
    const arm = b.chain(`arm${N}`, catmull([sh, el, wr, hd]), {
      parent: chest,
      names: [`shoulder${N}`, `elbow${N}`, `wrist${N}`, `hand${N}`],
      role: "arm",
    });
    const wrist = arm.joints[2];
    const hand = arm.joints[3];
    b.sweep(arm, (t) => keyed(ARM_R, t), {
      bands: [
        [0.84, FUR_ARM],
        [1, CREAM],
      ],
    });
    // sleeve with cuff trim
    b.sweep(arm, (t) => keyed(SLEEVE_R, t), { to: 0.44, color: KIMONO, caps: { start: "round", end: "flat" } });
    b.sweep(arm, (t) => keyed(SLEEVE_R, t) + 0.004, { from: 0.4, to: 0.44, color: TRIM, caps: "flat" });
    // leather bracer with straps
    b.sweep(arm, 0.05, { from: 0.5, to: 0.76, color: LEATHER, caps: "flat" });
    for (const [a, c] of [[0.53, 0.55], [0.71, 0.73]] as const) {
      b.sweep(arm, 0.055, { from: a, to: c, color: LEATHER_D, caps: "flat" });
    }
    // wrist fluff
    b.cards(b.ring(wrist, { count: 7, radius: 0.034 }).items, TUFT, {
      size: [0.03, 0.05],
      lean: 70,
      flow: [0, -1, 0],
      vary: 0.25,
      rng: rng(40 + s),
    });

    // paw
    const d = hd.clone().sub(wr).normalize();
    for (let i = 0; i < 3; i++) {
      const base = hd.clone().addScaledVector(d, -0.025).add(V(0, 0, (i - 1) * 0.022));
      const fd = d.clone().add(V(0, 0, (i - 1) * 0.18)).normalize();
      const p1 = base.clone().addScaledVector(fd, 0.03);
      const p2 = p1.clone().addScaledVector(fd, 0.028);
      const fc = b.chain(`finger${i + 1}${N}`, polyline([base, p1, p2]), {
        parent: hand,
        names: [`finger${i + 1}a${N}`, `finger${i + 1}b${N}`],
        role: "digit",
      });
      b.sweep(fc, [0.0165, 0.012], { color: CREAM, sides: 6 });
      b.spike(p2, fd, 0.024, 0.0065, { color: CLAW, bone: fc.joints[1], sides: 5 });
    }
    {
      const tb = wr.clone().addScaledVector(d, 0.05).add(V(-s * 0.03, 0, 0.012));
      const td = d.clone().multiplyScalar(0.4).add(V(-s * 0.5, 0, 0.7)).normalize();
      const t1 = tb.clone().addScaledVector(td, 0.028);
      const t2 = t1.clone().addScaledVector(td, 0.024);
      const tc = b.chain(`thumb${N}`, polyline([tb, t1, t2]), {
        parent: hand,
        names: [`thumb1${N}`, `thumb2${N}`],
        role: "digit",
      });
      b.sweep(tc, [0.016, 0.012], { color: CREAM, sides: 6 });
      b.spike(t2, td, 0.022, 0.006, { color: CLAW, bone: tc.joints[1], sides: 5 });
    }
    b.part(new THREE.SphereGeometry(0.02, 6, 5), PINK, {
      bone: hand,
      at: hd.clone().addScaledVector(d, -0.012).add(V(-s * 0.031, 0, 0)),
      scale: [0.4, 1, 0.9],
    });

    // left-shoulder lacquered sode (pauldron)
    if (s > 0) {
      const ax = el.clone().sub(sh).normalize();
      const sho = arm.joints[0];
      for (let i = 0; i < 3; i++) {
        const r = 0.088 + 0.009 * i;
        b.lathe(
          [
            [r - 0.012, 0],
            [r, 0],
            [r + 0.012, 0.05],
            [r, 0.05],
          ],
          {
            at: sh.clone().addScaledVector(ax, 0.005 + 0.04 * i),
            axis: ax,
            segments: 12,
            color: i === 1 ? "#6b2a2a" : LACP,
            bone: sho,
          },
        );
      }
      b.part(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LACP, {
        bone: sho,
        at: sh.clone().add(V(0.01, 0, 0)),
        dir: [0.5, 1, 0],
      });
      b.part(new THREE.TorusGeometry(0.1, 0.005, 4, 14), GOLD, {
        bone: sho,
        at: sh.clone().add(V(0.01, 0, 0)),
        dir: [0.5, 1, 0],
        axis: "z",
      });
    }
  }

  // ===== Legs, hakama, sandals ======================================================================================
  const HAK_R: [number, number][] = [[0, 0.105], [0.5, 0.088], [0.93, 0.1]];
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const lp = limb(V(s * 0.075, 0.5, 0), V(s * 0.095, 0.07, 0.02), [0.23, 0.23], [0, 0, 1]);
    const leg = b.chain(`leg${N}`, catmull(lp), {
      parent: hips,
      names: [`hip${N}`, `knee${N}`, `ankle${N}`],
      role: "leg",
      contact: [s * 0.095, 0, 0.05],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.sweep(leg, 0.036, { color: CREAM });
    const hak = b.sweep(leg, (t) => keyed(HAK_R, t), {
      to: 0.93,
      color: HAKAMA,
      caps: { start: "round", end: "flat" },
      sides: 10,
    });
    b.sweep(leg, (t) => keyed(HAK_R, t) + 0.004, { from: 0.89, to: 0.93, color: "#2f2b3c", caps: "flat", sides: 10 });
    if (s > 0) {
      const hit = b.surface(hak).ray([knee.at.x, knee.at.y, knee.at.z + 0.4], [0, 0, -1]);
      if (hit) b.decal(hak, PATCH, { at: hit, size: [0.07, 0.07], roll: 12 });
    }
    // ragged hem strips
    const hemY = 0.105;
    const hemPts = Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * Math.PI * 2;
      return frame(V(s * 0.093 + Math.sin(a) * 0.092, hemY, 0.02 + Math.cos(a) * 0.092), [0, 1, 0]);
    });
    b.cards(hemPts, FRAY, { size: [0.032, 0.05], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: R, bone: ankle });

    // foot
    b.capsule(V(s * 0.092, 0.055, -0.03), V(s * 0.097, 0.04, 0.15), 0.036, CREAM, { bone: ankle });
    b.extrude(
      [
        [-0.045, -0.07],
        [0.045, -0.07],
        [0.052, 0],
        [0.05, 0.09],
        [0.035, 0.15],
        [0, 0.168],
        [-0.035, 0.15],
        [-0.05, 0.09],
        [-0.052, 0],
      ],
      {
        at: V(s * 0.095, 0.011, 0),
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.022,
        smoothing: 1,
        color: grain("#cdb06a", "#8f7438", { size: 0.01, axis: "z", seed: 6 }),
        bone: ankle,
      },
    );
    const strap = catmull([
      V(s * 0.095 - 0.05, 0.022, 0.04),
      V(s * 0.095 - 0.03, 0.078, 0.06),
      V(s * 0.095, 0.088, 0.075),
      V(s * 0.095 + 0.03, 0.078, 0.06),
      V(s * 0.095 + 0.05, 0.022, 0.04),
    ]);
    b.sweep(strap, 0.0075, { color: CORD, bone: ankle, sides: 5 });
    b.rod(V(s * 0.095, 0.024, 0.145), V(s * 0.095, 0.082, 0.085), 0.0065, CORD, { bone: ankle, sides: 5 });

    const toe = b.joint(`toe${N}`, {
      parent: ankle,
      at: V(s * 0.095, 0.04, 0.12),
      aim: V(s * 0.095, 0.035, 0.2),
      role: "digit",
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.02, 6, 5), CREAM, {
        bone: toe,
        at: V(s * 0.095 + (i - 1) * 0.027, 0.038, i === 1 ? 0.172 : 0.162),
        scale: [1, 0.9, 1.1],
      });
    }
  }

  // ===== Head =======================================================================================================
  const HC = hp(0, 0.09, 0.02);
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), FUR_HEAD, {
    bone: head,
    at: HC,
    scale: [0.15, 0.13, 0.14],
  });
  const sk = b.surface(skull);

  // muzzle
  const muzzles = [1, -1].map((s) =>
    b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
      bone: head,
      at: hp(s * 0.027, 0.04, 0.125),
      scale: [0.05, 0.036, 0.05],
    }),
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSEC, { bone: head, at: hp(0, 0.068, 0.172), scale: [0.022, 0.014, 0.014] });
  b.part(new THREE.SphereGeometry(1, 10, 7), CREAM, { bone: jaw, at: hp(0, -0.004, 0.115), scale: [0.045, 0.02, 0.052] });
  const mHit = b.surface(muzzles).ray(hp(0, 0.03, 0.4), [0, 0, -1]);
  if (mHit) b.decal(muzzles, MOUTH, { at: mHit, size: [0.085, 0.045], lift: 0.003 });
  // straw stalk at the mouth corner
  b.rod(hp(0.05, 0.022, 0.14), hp(0.15, 0.075, 0.26), 0.0038, "#d8c070", { bone: head, sides: 4 });

  // eyes, scar, brows, forehead mark
  let leftEye = null as ReturnType<typeof sk.nearest> | null;
  for (const s of [1, -1]) {
    const hit = sk.around(HC).at(s * 31, 5)!;
    b.decal(skull, EYE, { at: hit, size: [0.07, 0.088], mirror: s > 0 });
    if (s > 0) leftEye = hit;
    const a = sk.around(HC).at(s * 12, 25)!;
    const c = sk.around(HC).at(s * 52, 31)!;
    b.capsule(a, c, 0.011, { color: BROW });
  }
  if (leftEye) b.decal(skull, SCAR, { at: leftEye, size: [0.045, 0.115], roll: -18, lift: 0.004 });
  const mk = sk.around(HC).at(0, 34)!;
  b.decal(skull, MARK, { at: mk, size: [0.085, 0.05], lift: 0.003 });

  // cheek ruff
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const hit = sk.around(HC).at(s * (88 - i * 6), -10 - i * 12)!;
      b.spike(hit, [s * 0.55, -0.3 - 0.2 * i, -0.6], 0.09 - 0.012 * i, 0.022, { color: CREAM, sides: 5 });
    }
  }
  const ruff = sk.scatter(40, {
    rng: rng(21),
    minDist: 0.022,
    filter: (h) => Math.abs(h.at.x) > 0.09 && h.at.y < 1.12 && h.at.z < 0.13,
  });
  b.cards(ruff, TUFT, { size: [0.04, 0.07], lean: 65, bend: 25, vary: 0.3, rng: rng(22) });

  // whiskers
  for (const s of [1, -1]) {
    for (let j = 0; j < 3; j++) {
      const p0 = hp(s * 0.05, 0.03 + j * 0.012, 0.15);
      const p1 = hp(s * 0.1, 0.03 + (j - 1) * 0.022 + j * 0.012, 0.16);
      const p2 = hp(s * 0.17, 0.03 + (j - 1) * 0.05 - 0.01, 0.13);
      b.sweep(catmull([p0, p1, p2]), [0.0035, 0.001], { color: "#f6efe0", bone: head, sides: 4 });
    }
  }

  // ears (left one torn), with inner ear
  const EAR: [number, number][] = [[-0.05, 0], [0.05, 0], [0, 0.19]];
  const EAR_N: Array<[number, number] | [number, number, "sharp"]> = [
    [-0.05, 0],
    [0.05, 0],
    [0.034, 0.08],
    [0.013, 0.09],
    [0.024, 0.12],
    [0, 0.19, "sharp"],
  ];
  const EAR_IN: [number, number][] = [[-0.03, 0.012], [0.03, 0.012], [0, 0.135]];
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const ej = b.joint(`ear${N}`, { parent: head, at: hp(s * 0.09, 0.17, -0.01), dir: [s * 0.28, 1, 0], role: "hinge" });
    b.extrude(s > 0 ? EAR_N : EAR, {
      at: hp(s * 0.09, 0.17, -0.01),
      x: [s, 0, 0],
      y: [s * 0.28, 1, 0],
      thickness: 0.026,
      color: GINGER,
      bone: ej,
    });
    b.extrude(EAR_IN, {
      at: hp(s * 0.09, 0.17, -0.002),
      x: [s, 0, 0],
      y: [s * 0.28, 1, 0],
      thickness: 0.02,
      color: PINK,
      bone: ej,
    });
  }

  // ===== Straw kasa =================================================================================================
  const HN = V(0, 1, 0.08).normalize();
  const HX = V(1, 0, 0);
  const HZ = V(0, -0.08, 1).normalize();
  const HATC = hp(0, 0.185, 0.02);
  const HR = 0.31;
  const HH = 0.14;
  const hh = (r: number) => HH * Math.pow(Math.max(0, 1 - r / HR), 1.25);
  const hatPt = (x: number, z: number, lift = 0) =>
    HATC.clone()
      .addScaledVector(HX, x)
      .addScaledVector(HZ, z)
      .addScaledVector(HN, hh(Math.hypot(x, z)) + lift);
  const rs = [0, 0.08, 0.16, 0.24, 0.31];
  const hatOutline: [number, number][] = [
    ...rs.map((r) => [r, hh(r) + 0.005] as [number, number]),
    ...[...rs].reverse().map((r) => [r, hh(r) - 0.006] as [number, number]),
  ];
  b.lathe(hatOutline, { at: HATC, axis: HN, segments: 14, color: STRAW, bone: head });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), STRAW_D, { bone: head, at: hatPt(0, 0, 0.012) });
  for (const r of [0.17, 0.25]) {
    const ringPts = Array.from({ length: 16 }, (_, k) => {
      const a = (k / 16) * Math.PI * 2;
      return hatPt(Math.cos(a) * r, Math.sin(a) * r, 0.004);
    });
    b.sweep(catmull(ringPts, { closed: true }), 0.006, { color: CORD, bone: head, sides: 6 });
  }
  // straw fringe along the brim
  const rim = Array.from({ length: 46 }, (_, k) => {
    const a = (k / 46) * Math.PI * 2;
    return frame(hatPt(Math.cos(a) * 0.305, Math.sin(a) * 0.305, -0.004), [0, 1, 0]);
  });
  b.cards(rim, STRAWTEX, { size: [0.03, 0.07], lean: 180, flow: [0, 0, 1], vary: 0.4, rng: R, bone: head });
  // straw rings around the ear holes
  for (const s of [1, -1]) {
    const ex = s * 0.112;
    const ez = -0.03;
    const rv = HX.clone().multiplyScalar(ex).addScaledVector(HZ, ez).normalize();
    const nrm = rv.multiplyScalar(HH / HR).add(HN).normalize();
    b.part(new THREE.TorusGeometry(0.036, 0.008, 5, 10), STRAW_D, {
      bone: head,
      at: hatPt(ex, ez, 0.002),
      dir: nrm,
      axis: "z",
    });
  }
  // chin cord
  b.sweep(
    catmull([
      hatPt(0.17, 0, -0.01),
      hp(0.165, 0.07, 0.03),
      hp(0.11, -0.03, 0.08),
      hp(0.05, -0.055, 0.13),
      hp(0, -0.058, 0.15),
      hp(-0.05, -0.055, 0.13),
      hp(-0.11, -0.03, 0.08),
      hp(-0.165, 0.07, 0.03),
      hatPt(-0.17, 0, -0.01),
    ]),
    0.005,
    { color: CORD, bone: head, sides: 5 },
  );

  return b.root;
}
```