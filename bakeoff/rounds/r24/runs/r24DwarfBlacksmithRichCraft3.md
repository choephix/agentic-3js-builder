```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  aim,
  catmull,
  createBuilder,
  frame,
  grain,
  limb,
  mix,
  mottle,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
  vec,
} from "agentic-3js-builder";
import type { ColorInput, DirectionInput, Joint, PointInput } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "A stout Ironforge-style dwarf smith in blue-and-gold plate pauldrons and a sooty leather apron, braided ginger beard, goggles on his brow, hammer raised over a glowing billet gripped in tongs on a runed anvil.",
};

type Tup = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const SIDES = [1, -1] as const;

// ---------------------------------------------------------------------------------------------------------------
// Paints

const SKIN = paint((p, n) => {
  const base = mix("#cc8760", "#e3a37c", smoothstep(0.3, 0.7, noise(p, 0.06, 1)));
  const shade = mix(base, "#935240", 0.38 * smoothstep(0.2, -0.8, n.y));
  return mix(shade, "#3a2a22", 0.22 * smoothstep(0.55, 0.78, noise(p, 0.04, 7)));
});
const RUDDY = paint((p) => mix("#d9735a", "#c25c48", noise(p, 0.03, 3)));
const GINGER = paint((p, n) => {
  const base = mix("#9a3a14", "#e8802c", smoothstep(0.25, 0.75, noise(p, 0.035, 21)));
  const hi = mix(base, "#ffc274", 0.3 * smoothstep(0.4, 1, n.y));
  return mix(hi, "#5a1c0a", 0.35 * smoothstep(0.3, -0.9, n.y));
});
const BLUE = paint((p, n) => {
  const base = mix("#1f3f8c", "#3566bf", smoothstep(0.3, 0.75, noise(p, 0.06, 11)));
  const lit = mix(base, "#8fb2f2", 0.4 * smoothstep(0.55, 1, n.y));
  return mix(lit, "#0e1b44", 0.4 * smoothstep(0.1, -0.8, n.y));
});
const CLOTH = mottle("#2d539f", "#233f80", { size: 0.07, seed: 3 });
const PANTS = mottle("#5b4331", "#47321f", { size: 0.06, seed: 4 });
const WOOL = mottle("#eadfc2", "#cfc19f", { size: 0.03, seed: 5 });
const LEATHER = paint((p, n) => {
  const c = mix("#6b4326", "#8a5a34", noise(p, 0.03, 5));
  return mix(c, "#c08a52", 0.2 * smoothstep(0.6, 1, n.y));
});
const LEATHER_D = "#3b2414";
const APRON = paint((p, n) => {
  let c = mix("#6e4526", "#93602f", noise(p, 0.05, 4));
  c = mix(c, "#2b1a10", 0.55 * smoothstep(0.75, 0.3, p.y) * smoothstep(0.35, 0.7, noise(p, 0.07, 8)));
  c = mix(c, "#1a0f0a", 0.35 * smoothstep(0.58, 0.64, noise(p, 0.025, 15)));
  return mix(c, "#b88650", 0.18 * smoothstep(0.7, 1, n.y));
});
const BOOT = paint((p) => {
  const c = mix("#4a2c18", "#6a4326", noise(p, 0.04, 6));
  return mix(c, "#1c1008", 0.55 * smoothstep(0.18, 0.0, p.y));
});
const WOOD = grain("#5e3d20", "#8a5e33", { size: 0.025, axis: "y", seed: 2 });
const HANDLE = grain("#6a4424", "#9a6c3a", { size: 0.012, axis: "y", seed: 8 });
const GOLD = metal("gilt");
const BRASS = metal("brass", { tarnish: 0.35 });
const STEEL = metal("steel", { polish: 0.6 });
const IRON = metal("iron", { tarnish: 0.5 });
const DARKIRON = metal("iron", { polish: 0.1, tarnish: 0.7, seed: 9 });

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 64 40">
  <defs><clipPath id="a"><path d="M4 22 Q32 2 60 22 Q32 38 4 22Z"/></clipPath>
  <radialGradient id="i" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stop-color="#8fd4ff"/><stop offset="0.7" stop-color="#2f78b8"/><stop offset="1" stop-color="#15375e"/></radialGradient></defs>
  <path d="M1 22 Q32 -2 63 22 Q32 41 1 22Z" fill="#2a160d"/>
  <path d="M4 22 Q32 2 60 22 Q32 38 4 22Z" fill="#f4e8d0"/>
  <g clip-path="url(#a)"><circle cx="32" cy="21" r="13" fill="url(#i)"/><circle cx="32" cy="21" r="13" fill="none" stroke="#10243f" stroke-width="2"/>
  <circle cx="32" cy="21" r="6" fill="#0a0604"/><path d="M0 0 H64 V15 Q32 6 0 15Z" fill="#000" opacity="0.3"/></g>
  <circle cx="27" cy="16" r="3.4" fill="#ffffff"/><circle cx="37" cy="26" r="1.6" fill="#ffffff"/>
  <path d="M2 22 Q32 -1 62 22" fill="none" stroke="#2a160d" stroke-width="4.5" stroke-linecap="round"/></svg>`,
  { size: 256 },
);
const STRAND = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#7a2c10"/><stop offset="0.55" stop-color="#d4601f"/><stop offset="1" stop-color="#ffb55a"/></linearGradient></defs>
  <path d="M3 64 C4 40 10 18 16 0 C22 18 28 40 29 64Z" fill="url(#g)"/>
  <path d="M16 60 C15 40 16 20 16 6 M9 62 C10 44 13 28 15 14 M23 62 C22 44 19 28 17 14" stroke="#ffd69a" stroke-width="1.6" fill="none" opacity="0.7"/>
  <path d="M3 64 C4 40 10 18 16 0" stroke="#5a1c08" stroke-width="1.5" fill="none"/></svg>`,
  { size: 128 },
);
const rivetDots = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return `<circle cx="${(50 + 42 * Math.cos(a)).toFixed(1)}" cy="${(50 + 42 * Math.sin(a)).toFixed(1)}" r="1.8" fill="#8a5a14"/>`;
}).join("");
const CREST = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#8a5a14"/><circle cx="50" cy="50" r="45" fill="#f0c04e"/>${rivetDots}
  <circle cx="50" cy="50" r="36" fill="#1f3f8c"/><circle cx="50" cy="50" r="36" fill="none" stroke="#0e1f55" stroke-width="2"/>
  <g stroke="#5a5f78" stroke-width="1.4" stroke-linejoin="round">
   <g transform="rotate(-35 50 40)"><rect x="47" y="14" width="6" height="36" fill="#c9d3e6"/><rect x="38" y="12" width="24" height="10" rx="2" fill="#eef2fb"/></g>
   <g transform="rotate(35 50 40)"><rect x="47" y="14" width="6" height="36" fill="#c9d3e6"/><rect x="38" y="12" width="24" height="10" rx="2" fill="#eef2fb"/></g></g>
  <path d="M24 54 H62 Q70 54 76 48 L78 56 Q72 62 64 62 H58 L60 70 H68 V76 H32 V70 H40 L42 62 H34 Q26 62 24 54Z" fill="#f6d36a" stroke="#6a4610" stroke-width="1.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);
const GLYPHS = [
  "M10 6 V34 M10 12 L22 22 L10 22",
  "M6 8 L20 20 L6 32 M22 8 V32",
  "M8 34 L14 6 L20 34 M9 22 H19",
  "M8 6 H20 L8 20 H20 L8 34",
  "M14 6 V34 M6 14 L14 20 L22 14 M6 28 L14 22 L22 28",
];
const glyphSvg = (d: string, i: number, color: string, w: number) =>
  `<path transform="translate(${6 + i * 30} 0)" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const RUNE = svg(
  `<svg viewBox="0 0 160 40">${GLYPHS.map((d, i) => glyphSvg(d, i, "#ff8a1c", 6.5)).join("")}${GLYPHS.map((d, i) => glyphSvg(d, i, "#fff0b0", 2.6)).join("")}
  <path d="M2 2 H158 M2 38 H158" stroke="#ff8a1c" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 512 },
);
const LENS = svg(
  `<svg viewBox="0 0 64 64"><defs><radialGradient id="l" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#b8f2ff"/><stop offset="0.6" stop-color="#3aa6c8"/><stop offset="1" stop-color="#14506c"/></radialGradient></defs>
  <circle cx="32" cy="32" r="31" fill="url(#l)"/><path d="M12 24 Q18 10 34 8" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>
  <circle cx="44" cy="46" r="3" fill="#ffffff" opacity="0.8"/></svg>`,
  { size: 128 },
);
const SPARK = svg(
  `<svg viewBox="0 0 16 32"><path d="M8 32 C2 22 6 10 8 0 C10 10 14 22 8 32Z" fill="#ff9a24"/><path d="M8 30 C5 22 7 12 8 6 C9 12 11 22 8 30Z" fill="#fff2a8"/></svg>`,
  { size: 64 },
);
const TATTOO = svg(
  `<svg viewBox="0 0 80 40"><path d="M4 20 H20 L26 8 L34 32 L42 8 L50 32 L56 20 H76" stroke="#25489a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="8" cy="9" r="2.4" fill="#25489a"/><circle cx="72" cy="31" r="2.4" fill="#25489a"/><circle cx="40" cy="36" r="2" fill="#25489a"/><circle cx="40" cy="4" r="2" fill="#25489a"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith" });
  const R = rng(7);

  // ---- helpers ----------------------------------------------------------------------------------------------
  type Opt = { rotation?: Tup; dir?: DirectionInput; flat?: boolean };
  const ell = (color: ColorInput, at: PointInput, rad: Tup, bone: Joint, o: Opt = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { bone, at, scale: rad, ...o });
  const box = (color: ColorInput, at: PointInput, size: Tup, bone: Joint, o: Opt = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...o });
  const studs = (pts: THREE.Vector3[], r: number, color: ColorInput, bone: Joint) => {
    const geos = pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p.x, p.y, p.z));
    return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const circlePts = (center: THREE.Vector3, axis: THREE.Vector3, radius: number, n: number, lift = 0) => {
    const q = aim(axis);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * radius, lift, Math.sin(a) * radius).applyQuaternion(q).add(center);
    });
  };
  const linkGeo = new THREE.SphereGeometry(1, 6, 5).scale(0.034, 0.03, 0.034);
  const ringGeo = new THREE.TorusGeometry(0.036, 0.008, 5, 9).rotateX(Math.PI / 2);
  const braid = (pts: number[][], links: number, rings: number[]) => {
    const path = catmull(pts);
    let k = 0;
    b.along(path, links, (at) => {
      const t = 1 - 0.35 * (k / links);
      const sc: Tup = [t, 1, t];
      b.part(linkGeo, k % 2 ? "#b24a1c" : "#e28a34", { frame: at, scale: sc, flat: true });
      if (rings.includes(k)) b.part(ringGeo, GOLD, { frame: at, scale: sc });
      k++;
    });
    b.spike(path.at(1), [0, -1, 0], 0.07, 0.024, { color: GOLD });
    b.spike(path.at(1), [0, -1, 0], 0.11, 0.012, { color: "#e28a34" });
  };

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.52, 0], dir: [0, 1, 0], role: "spine" });
  const TORSO = [
    [0, 0.56, 0],
    [0, 0.72, 0.03],
    [0, 0.88, 0.02],
    [0, 1.0, 0],
  ];
  const spine = b.chain("spine", catmull(TORSO), { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const spine1 = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.98, 0.0],
      [0, 1.1, 0.05],
    ],
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.1, 0.05], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.15, 0.0], aim: [0, 1.1, 0.2], role: "jaw" });
  const prop = b.joint("anvil", { parent: hips, at: [0, 0.4, 0.55], dir: [0, 1, 0] });

  // ---- torso ------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.56, 0], w: 0.42, h: 0.3 },
      { at: [0, 0.72, 0.03], w: 0.54, h: 0.4 },
      { at: [0, 0.88, 0.02], w: 0.6, h: 0.36 },
      { at: [0, 1.0, 0], w: 0.52, h: 0.28 },
    ],
    { bone: spine, color: CLOTH },
  );
  const yoke = ell(CLOTH, [0, 1.0, -0.01], [0.27, 0.09, 0.17], chest);
  ell(PANTS, [0, 0.53, 0], [0.21, 0.11, 0.16], hips);
  const patch = ell(SKIN, [0, 0.995, 0.12], [0.1, 0.07, 0.05], chest);
  b.cards(b.surface(patch).scatter(34, { rng: rng(21), minDist: 0.02, filter: (h) => h.n.z > 0.2 }), STRAND, {
    size: [0.028, 0.055],
    lean: 50,
    flow: [0, -1, 0.3],
    vary: 0.3,
    rng: rng(22),
  });
  b.part(new THREE.TorusGeometry(0.115, 0.032, 6, 12).rotateX(Math.PI / 2), CLOTH, {
    bone: chest,
    at: [0, 1.04, 0.015],
    scale: [1, 1, 0.9],
  });
  // apron
  const apron = b.loft(
    [
      { at: [0, 0.95, 0.19], w: 0.3, h: 0.03 },
      { at: [0, 0.88, 0.235], w: 0.38, h: 0.03 },
      { at: [0, 0.72, 0.265], w: 0.42, h: 0.03 },
      { at: [0, 0.6, 0.238], w: 0.42, h: 0.03 },
      { at: [0, 0.46, 0.222], w: 0.4, h: 0.03 },
      { at: [0, 0.33, 0.212], w: 0.38, h: 0.03 },
    ],
    { bone: hips, color: APRON, section: "box" },
  );
  b.decal(apron, CREST, { at: [0, 0.76, 0.3], dir: [0, 0, 1], size: [0.17, 0.17] });
  b.extrude(
    [
      [-0.1, 0],
      [0.1, 0],
      [0.1, 0.1],
      [0.06, 0.12],
      [0, 0.105],
      [-0.06, 0.12],
      [-0.1, 0.1],
    ],
    { at: [0, 0.44, 0.246], x: [1, 0, 0], thickness: 0.012, color: LEATHER, bone: hips },
  );
  studs(
    [V(-0.095, 0.54, 0.255), V(0.095, 0.54, 0.255), V(-0.095, 0.45, 0.25), V(0.095, 0.45, 0.25)],
    0.008,
    GOLD,
    hips,
  );
  for (const [x, top, c] of [
    [-0.05, 0.57, BRASS],
    [0.0, 0.58, "#3b2a1a"],
    [0.05, 0.56, STEEL],
  ] as const)
    b.rod([x, 0.47, 0.25], [x * 1.3, top, 0.252], 0.008, c, { bone: hips });
  // straps over the shoulders
  const upper = b.surface([torso, yoke]);
  for (const s of SIDES) {
    const path = upper.drape(
      catmull([
        [s * 0.14, 0.95, 0.2],
        [s * 0.12, 1.06, 0.12],
        [s * 0.1, 1.1, 0.0],
        [s * 0.09, 1.07, -0.12],
      ]),
      { lift: 0.01 },
    );
    b.sweep(path, 0.015, { color: LEATHER_D });
  }
  // belt
  const beltPts = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [0.255 * Math.sin(a), 0.62, 0.04 + 0.225 * Math.cos(a)];
  });
  b.sweep(catmull(beltPts, { closed: true }), (): [number, number] => [0.014, 0.04], {
    color: LEATHER_D,
    bone: spine1,
  });
  box(GOLD, [0, 0.62, 0.283], [0.115, 0.09, 0.02], spine1);
  box(DARKIRON, [0, 0.62, 0.29], [0.08, 0.058, 0.01], spine1);
  b.part(new THREE.CircleGeometry(0.034, 14), "#ffffff", {
    bone: spine1,
    at: [0, 0.62, 0.2965],
    dir: [0, 0, 1],
    axis: "z",
    texture: CREST,
  });
  const beltStuds: THREE.Vector3[] = [];
  for (const s of SIDES)
    for (let d = 28; d <= 160; d += 22) {
      const a = (d * Math.PI) / 180;
      beltStuds.push(V(s * 0.27 * Math.sin(a), 0.62, 0.04 + 0.238 * Math.cos(a)));
    }
  studs(beltStuds, 0.009, GOLD, spine1);
  // belt gear: pouch, hammer, rag
  box(LEATHER, [0.275, 0.54, 0.08], [0.07, 0.1, 0.1], hips);
  box(LEATHER_D, [0.275, 0.585, 0.08], [0.076, 0.03, 0.106], hips);
  b.sphereless = undefined as never;
  b.rod([-0.285, 0.61, 0.12], [-0.285, 0.4, 0.12], 0.013, HANDLE, { bone: hips });
  box(STEEL, [-0.285, 0.38, 0.12], [0.05, 0.045, 0.1], hips);
  box("#c9bfa6", [0.17, 0.52, -0.2], [0.08, 0.13, 0.012], hips);
  // back satchel and bedroll
  box(LEATHER, [0, 0.62, -0.24], [0.28, 0.2, 0.1], hips);
  box(LEATHER_D, [0, 0.69, -0.245], [0.29, 0.07, 0.11], hips);
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 8), WOOL, {
    bone: chest,
    at: [0, 0.8, -0.235],
    dir: [1, 0, 0],
  });
  for (const x of [-0.1, 0.1]) b.part(new THREE.TorusGeometry(0.057, 0.008, 5, 9), LEATHER_D, {
    bone: chest,
    at: [x, 0.8, -0.235],
    dir: [1, 0, 0],
    axis: "z",
  });

  // ---- head -------------------------------------------------------------------------------------------------
  b.sweep(neck, [0.105, 0.095], { color: SKIN });
  const skull = ell(SKIN, [0, 1.2, 0.07], [0.165, 0.15, 0.16], head);
  ell(RUDDY, [0, 1.165, 0.235], [0.05, 0.048, 0.055], head);
  for (const s of SIDES) {
    ell(SKIN, [s * 0.07, 1.248, 0.21], [0.075, 0.025, 0.04], head, { rotation: [0, 0, s * 14] });
    ell(RUDDY, [s * 0.1, 1.15, 0.18], [0.065, 0.055, 0.06], head);
    ell(RUDDY, [s * 0.03, 1.15, 0.268], [0.022, 0.02, 0.022], head);
    b.decal(skull, EYE, { at: [s * 0.068, 1.212, 0.215], dir: [0, 0, 1], size: [0.072, 0.045] });
    b.sweep(
      [
        [s * 0.015, 1.25, 0.245],
        [s * 0.07, 1.263, 0.238],
        [s * 0.125, 1.272, 0.2],
      ],
      [0.022, 0.012],
      { color: GINGER, bone: head },
    );
    ell(SKIN, [s * 0.165, 1.19, 0.04], [0.025, 0.045, 0.035], head);
    b.part(new THREE.TorusGeometry(0.017, 0.005, 5, 8).rotateY(Math.PI / 2), GOLD, {
      bone: head,
      at: [s * 0.175, 1.145, 0.04],
    });
    // mustache
    b.sweep(
      [
        [s * 0.01, 1.14, 0.247],
        [s * 0.08, 1.125, 0.243],
        [s * 0.14, 1.1, 0.205],
        [s * 0.16, 1.05, 0.18],
        [s * 0.19, 1.0, 0.2],
      ],
      [0.04, 0.03, 0.016],
      { color: GINGER, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 8).rotateX(Math.PI / 2), GOLD, {
      bone: head,
      at: [s * 0.16, 1.06, 0.185],
    });
    // sideburns / hair
    ell(GINGER, [s * 0.15, 1.17, 0.0], [0.035, 0.08, 0.09], head);
    // goggles
    const lensC = V(s * 0.062, 1.298, 0.205);
    const nrm = V(0, 0.35, 1).normalize();
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 10), BRASS, { bone: head, at: lensC, dir: nrm });
    b.part(new THREE.CircleGeometry(0.036, 12), "#ffffff", {
      bone: head,
      at: lensC.clone().addScaledVector(nrm, 0.0165),
      dir: nrm,
      axis: "z",
      texture: LENS,
    });
  }
  ell("#2a0f0a", [0, 1.108, 0.205], [0.045, 0.012, 0.025], head);
  b.rod([-0.02, 1.3, 0.222], [0.02, 1.3, 0.222], 0.008, BRASS, { bone: head });
  const strapPts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [0.152 * Math.sin(a), 1.285, 0.07 + 0.15 * Math.cos(a)];
  });
  b.sweep(catmull(strapPts, { closed: true }), 0.009, { color: LEATHER_D, bone: head });
  const hairBack = ell(GINGER, [0, 1.22, -0.06], [0.15, 0.11, 0.11], head);
  b.cards(b.surface(hairBack).scatter(30, { rng: rng(31), minDist: 0.03, filter: (h) => h.n.z < 0.3 }), STRAND, {
    size: [0.04, 0.09],
    lean: 50,
    flow: [0, -1, -0.2],
    bend: 20,
    vary: 0.3,
    rng: rng(32),
  });
  // jaw and beard
  ell(SKIN, [0, 1.1, 0.12], [0.1, 0.05, 0.1], jaw);
  ell("#9c4a3a", [0, 1.118, 0.205], [0.04, 0.012, 0.02], jaw);
  const beard = b.loft(
    [
      { at: [0, 1.12, 0.1], w: 0.3, h: 0.22 },
      { at: [0, 1.03, 0.17], w: 0.3, h: 0.16 },
      { at: [0, 0.93, 0.23], w: 0.26, h: 0.1 },
      { at: [0, 0.84, 0.245], w: 0.18, h: 0.08 },
      { at: [0, 0.76, 0.25], w: 0.08, h: 0.05 },
    ],
    { bone: jaw, color: GINGER },
  );
  b.cards(b.surface(beard).scatter(70, { rng: rng(41), minDist: 0.035, filter: (h) => h.n.z > -0.3 }), STRAND, {
    size: [0.04, 0.1],
    lean: 55,
    flow: [0, -1, 0.25],
    bend: 25,
    vary: 0.3,
    rng: rng(42),
  });
  for (const s of SIDES)
    braid(
      [
        [s * 0.11, 1.02, 0.19],
        [s * 0.115, 0.92, 0.265],
        [s * 0.12, 0.8, 0.295],
        [s * 0.115, 0.68, 0.29],
        [s * 0.11, 0.62, 0.278],
      ],
      11,
      [3, 7, 10],
    );
  braid(
    [
      [0, 1.19, -0.16],
      [0, 1.1, -0.21],
      [0, 0.98, -0.25],
      [0, 0.86, -0.22],
    ],
    8,
    [2, 6],
  );

  // ---- arms -------------------------------------------------------------------------------------------------
  const DOME: [number, number][] = [
    [0, 0],
    [0.17, 0],
    [0.175, 0.02],
    [0.16, 0.055],
    [0.12, 0.09],
    [0.065, 0.115],
    [0, 0.125],
  ];
  const fist = (bone: Joint, C: THREE.Vector3, g: THREE.Vector3) => {
    const u = g.clone().cross(V(0, 1, 0)).normalize();
    ell(SKIN, C, [0.05, 0.062, 0.046], bone, { dir: g.clone() });
    for (let i = 0; i < 4; i++) {
      const c = C.clone().addScaledVector(g, (i - 1.5) * 0.03);
      b.capsule(c.clone().addScaledVector(u, -0.045), c.clone().addScaledVector(u, 0.045), 0.021, SKIN, { bone });
    }
    b.capsule(
      C.clone().addScaledVector(g, -0.035).addScaledVector(u, 0.05),
      C.clone().addScaledVector(g, 0.05).addScaledVector(u, 0.03),
      0.019,
      SKIN,
      { bone },
    );
    return u;
  };
  const buildArm = (s: number, target: THREE.Vector3, bend: number[]) => {
    const n = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.3, 0.99, 0), target, [0.24, 0.22], bend).map((p) => vec(p));
    const arm = b.chain(`arm${n}`, pts, {
      parent: chest,
      names: [`shoulder${n}`, `elbow${n}`, `hand${n}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const hand = arm.joints[arm.joints.length - 1];
    const tube = b.sweep(arm, [0.078, 0.088, 0.068, 0.078, 0.056], { color: SKIN });
    ell(SKIN, pts[0], [0.095, 0.09, 0.095], sh);
    b.sweep(arm, [0.094, 0.1, 0.098], { from: 0, to: 0.3, color: CLOTH, caps: "flat" });
    b.sweep(arm, [0.075, 0.07, 0.065], { from: 0.64, to: 0.93, color: LEATHER_D, caps: "flat" });
    for (const t of [0.7, 0.86])
      b.ring(arm.at(t), { count: 7, radius: 0.074 }, (item) =>
        b.stick(new THREE.SphereGeometry(0.009, 5, 4), GOLD, item, { embed: 0.4 }),
      );
    const hit = b.surface(tube).around(arm.at(0.42).at).at(s * 90, 10);
    if (hit) b.decal(tube, TATTOO, { at: hit, size: [0.09, 0.045] });
    // pauldron
    for (let k = 0; k < 3; k++) {
      const c = V(s * 0.335, 1.06, 0).add(V(s * 0.035 * k, -0.045 * k, 0));
      const ax = V(s * (0.5 + 0.35 * k), 1, -0.05).normalize();
      const sc = 1 + 0.17 * k;
      const outline = DOME.map(([x, y]) => [x * sc, y * (1 - 0.1 * k)] as [number, number]);
      const lame = b.lathe(outline, { at: c, axis: ax, segments: 10, color: BLUE, bone: sh });
      b.part(new THREE.TorusGeometry(0.172 * sc, 0.009, 5, 14), GOLD, { bone: sh, at: c, dir: ax, axis: "z" });
      studs(circlePts(c, ax, 0.15 * sc, 8, 0.03), 0.011, GOLD, sh);
      if (k === 0) {
        b.spike(c.clone().addScaledVector(ax, 0.12), ax, 0.1, 0.032, { color: GOLD, bone: sh });
        const ch = b.surface(lame).around(c).at(s * 90, 30);
        if (ch) b.decal(lame, CREST, { at: ch, size: [0.1, 0.1] });
      }
    }
    const fdir = pts[2].clone().sub(pts[1]).normalize();
    const C = pts[2].clone().addScaledVector(fdir, 0.05);
    return { hand, C };
  };

  // ---- anvil & blade ----------------------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.45, 10), WOOD, { bone: prop, at: [0, 0.225, 0.55] });
  for (const y of [0.08, 0.37]) {
    const rad = 0.24 - 0.04 * (y / 0.45) + 0.008;
    b.part(new THREE.TorusGeometry(rad, 0.012, 5, 12).rotateX(Math.PI / 2), IRON, { bone: prop, at: [0, y, 0.55] });
  }
  box(IRON, [0, 0.48, 0.55], [0.42, 0.06, 0.28], prop);
  b.lathe(
    [
      [0, 0.51],
      [0.13, 0.51],
      [0.09, 0.59],
      [0.09, 0.63],
      [0.125, 0.69],
      [0, 0.69],
    ],
    { at: [0, 0, 0.55], segments: 6, color: IRON, bone: prop },
  );
  box(DARKIRON, [0, 0.7275, 0.55], [0.56, 0.075, 0.22], prop);
  box(STEEL, [0, 0.7725, 0.55], [0.56, 0.015, 0.22], prop);
  b.spike([0.28, 0.71, 0.55], [1, 0, 0], 0.36, 0.07, { color: DARKIRON, bone: prop });
  box(DARKIRON, [-0.34, 0.7375, 0.55], [0.12, 0.055, 0.17], prop);
  box("#15100d", [-0.2, 0.781, 0.55], [0.04, 0.006, 0.04], prop);
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.065), "#ffffff", {
      bone: prop,
      at: [0, 0.727, 0.6615],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE,
    }),
    1.1,
  );

  const T = V(-0.3, 0.786, 0.62);
  const xd = V(0.97, 0, -0.25).normalize();
  const yd = V(0.25, 0, 0.97).normalize();
  const segs = [
    [0, 0.11, 0, 0.026, "#fff1a8", 1.7],
    [0.11, 0.2, 0.026, 0.0295, "#ffc247", 1.5],
    [0.2, 0.29, 0.0295, 0.0338, "#ff7a1e", 1.3],
    [0.29, 0.37, 0.0338, 0.036, "#c93a14", 1.1],
    [0.37, 0.5, 0.013, 0.013, "#5b4f50", 0],
  ] as const;
  for (const [q0, q1, w0, w1, col, gl] of segs) {
    const seg = b.extrude(
      [
        [q0, w0],
        [q1, w1],
        [q1, -w1],
        [q0, -w0],
      ],
      { at: T, x: xd, y: yd, thickness: 0.012, color: col, bone: prop },
    );
    if (gl > 0) glow(seg, gl);
  }
  // sparks
  const P0 = T.clone().addScaledVector(xd, 0.14).add(V(0, 0.015, 0));
  const sparkFrames = Array.from({ length: 16 }, () => {
    const d = V(R() * 2 - 1, 0.4 + R() * 1.2, R() * 2 - 1).normalize();
    return frame(P0.clone().addScaledVector(d, 0.02 + R() * 0.08), d);
  });
  glow(b.cards(sparkFrames, SPARK, { size: [0.012, 0.035], cross: true, sink: 0, bone: prop }), 1.6);

  // ---- left arm: tongs ----------------------------------------------------------------------------------------
  const left = buildArm(1, V(0.36, 0.87, 0.26), [0.7, -0.5, -0.3]);
  const Jg = T.clone().addScaledVector(xd, 0.44);
  Jg.y = 0.797;
  const gT = Jg.clone().sub(left.C).normalize();
  const uT = fist(left.hand, left.C, gT);
  const E = Jg.clone().add(left.C.clone().sub(Jg).multiplyScalar(1.5));
  for (const k of SIDES) {
    b.rod(Jg.clone().addScaledVector(uT, k * 0.009), E.clone().addScaledVector(uT, k * 0.02), 0.01, STEEL, {
      bone: left.hand,
    });
    ell(STEEL, Jg.clone().addScaledVector(uT, k * 0.012), [0.008, 0.02, 0.02], left.hand, { dir: gT.clone() });
    ell(BRASS, E.clone().addScaledVector(uT, k * 0.02), [0.014, 0.014, 0.014], left.hand);
  }
  ell(GOLD, Jg.clone().add(left.C.clone().sub(Jg).multiplyScalar(0.2)), [0.016, 0.016, 0.016], left.hand);

  // ---- right arm: hammer ------------------------------------------------------------------------------------
  const right = buildArm(-1, V(-0.27, 1.1, 0.32), [-0.6, -0.8, -0.3]);
  const gR = V(0.1, 0.55, 0.82).normalize();
  fist(right.hand, right.C, gR);
  const CR = right.C;
  const hb = right.hand;
  b.rod(CR.clone().addScaledVector(gR, -0.13), CR.clone().addScaledVector(gR, 0.4), 0.018, HANDLE, { bone: hb });
  ell(BRASS, CR.clone().addScaledVector(gR, -0.14), [0.026, 0.026, 0.026], hb, { flat: true });
  b.part(new THREE.TorusGeometry(0.022, 0.006, 5, 8), GOLD, {
    bone: hb,
    at: CR.clone().addScaledVector(gR, 0.1),
    dir: gR,
    axis: "z",
  });
  const hc = CR.clone().addScaledVector(gR, 0.37);
  const hd = V(0, gR.z, -gR.y).normalize();
  b.part(new THREE.BoxGeometry(0.09, 0.2, 0.09), STEEL, { bone: hb, at: hc, dir: hd });
  b.part(new THREE.BoxGeometry(0.104, 0.03, 0.104), GOLD, { bone: hb, at: hc, dir: hd });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.03, 8), STEEL, {
    bone: hb,
    at: hc.clone().addScaledVector(hd, -0.115),
    dir: hd,
  });
  b.spike(hc.clone().addScaledVector(hd, 0.1), hd, 0.09, 0.04, { color: STEEL, bone: hb });
  glow(
    b.part(new THREE.PlaneGeometry(0.12, 0.03), "#ffffff", {
      bone: hb,
      at: hc.clone().add(V(-0.0465, 0, 0)),
      dir: [-1, 0, 0],
      axis: "z",
      up: gR,
      texture: RUNE,
    }),
    1.2,
  );

  // ---- legs -------------------------------------------------------------------------------------------------
  for (const s of SIDES) {
    const n = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.12, 0.52, 0), V(s * 0.17, 0.085, 0.04), [0.27, 0.26], [0, 0, 1]).map((p) => vec(p));
    const leg = b.chain(`leg${n}`, pts, {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.08],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.sweep(leg, [0.108, 0.1, 0.088, 0.082, 0.07], { color: PANTS });
    b.sweep(leg, [0.098, 0.09, 0.085], { from: 0.62, to: 1, color: BOOT, caps: "flat" });
    b.sweep(leg, 0.108, { from: 0.58, to: 0.66, color: WOOL, caps: "flat" });
    ell(LEATHER, pts[1].clone().add(V(0, 0.01, 0.075)), [0.07, 0.06, 0.04], knee);
    ell(GOLD, pts[1].clone().add(V(0, 0.01, 0.112)), [0.015, 0.015, 0.01], knee);
    const x = s * 0.17;
    b.sweep(
      [
        [x, 0.06, -0.02],
        [x, 0.06, 0.13],
      ],
      (): [number, number] => [0.075, 0.06],
      { color: BOOT, bone: ankle },
    );
    b.sweep(
      [
        [x, 0.055, 0.09],
        [x, 0.055, 0.12],
      ],
      (): [number, number] => [0.079, 0.064],
      { color: DARKIRON, bone: ankle },
    );
    box("#1d130c", [x, 0.01, 0.055], [0.165, 0.02, 0.31], ankle);
    b.part(new THREE.TorusGeometry(0.09, 0.009, 5, 10).rotateX(Math.PI / 2), LEATHER_D, {
      bone: ankle,
      at: [x, 0.17, 0.035],
    });
    box(GOLD, [x, 0.17, 0.126], [0.03, 0.03, 0.012], ankle);
  }

  return b.root;
}
```