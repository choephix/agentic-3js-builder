import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { DEG, rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cells, gradient, mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import type { Chain } from "../src/skeleton";
import { svg } from "../src/texture";
import { frame } from "../src/frame";
import { glow } from "../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A hulking weathered stone gargoyle crouched on a mossy cathedral plinth, claws hooked over the lip, wings half open, a broken shackle chain at its wrist and cyan rune-light in its eyes, chest and tail blade.",
  style: "Blizzard/Overwatch mix",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette: cool violet-grey stone, warm painted highlights, one strong cyan accent, worn bronze trim.
const STONE_MID = "#8793b6";
const STONE_LIT = "#eadfc8";
const STONE_SHADE = "#3a3f70";
const STONE_DEEP = "#222759";
const STONE_WING = "#a8b0cf";
const PL_MID = "#737a8f";
const PL_LIT = "#b4b5bc";
const MOSS = "#6f9446";
const MOSS_D = "#3a5e2c";
const CLAW = "#e8dfc6";
const BRONZE = "#b9863a";
const BRONZE_D = "#6b4519";
const BRONZE_L = "#f0c46c";
const VERDI = "#4f9a86";
const CYAN = "#35e6ff";
const CYAN_HOT = "#e6ffff";
const MAW = "#1a1226";
const INK = "#1b1e30";

function stone(o: { mid: string; lit: string; shade: string; crack?: boolean; seed?: number; moss?: boolean }) {
  const seed = o.seed ?? 1;
  return paint((p, n) => {
    const m = noise(p, 0.3, seed);
    const f = noise(p, 0.07, seed + 5);
    let c = mix(o.mid, o.lit, Math.min(Math.max((m - 0.45) * 1.3 + (f - 0.5) * 0.35, 0), 1) * 0.5);
    c = mix(c, o.shade, smoothstep(0.05, -0.8, n.y) * 0.72);
    c = mix(c, o.lit, smoothstep(0.25, 0.95, n.y) * 0.6);
    c = mix(c, o.lit, smoothstep(0.5, 1, n.z) * 0.12);
    if (o.crack) {
      const cl = cells(p, 0.19, seed + 11);
      const e = cl.d2 - cl.d1;
      if (e < 0.05) c = mix(c, o.shade, 0.7 * (1 - e / 0.05));
      else if (e < 0.11) c = mix(c, o.lit, 0.12);
    }
    if (noise(p, 0.02, seed + 9) > 0.74) c = mix(c, o.shade, 0.28);
    if (o.moss && p.y < 0.62 && n.y > 0.15 && noise(p, 0.1, seed + 3) > 0.68) c = mix(c, MOSS, 0.75);
    return c;
  });
}

const BODY = stone({ mid: STONE_MID, lit: STONE_LIT, shade: STONE_SHADE, crack: true, seed: 3, moss: true });
const LIMB = stone({ mid: "#7f8bb0", lit: STONE_LIT, shade: STONE_SHADE, crack: true, seed: 8, moss: true });
const DARKSTONE = stone({ mid: "#5b6396", lit: "#b8b6c2", shade: STONE_DEEP, seed: 5 });
const WING_PAINT = paint((p, n, s) => {
  let c = mix(STONE_WING, "#d6d6e2", noise(p, 0.25, 31) * 0.55);
  c = mix(c, STONE_SHADE, smoothstep(0.1, -0.8, n.y) * 0.3);
  c = mix(c, STONE_LIT, smoothstep(0.4, 1, n.y) * 0.4);
  c = mix(c, STONE_SHADE, (0.5 + 0.5 * Math.cos(s[1] * Math.PI * 14)) * 0.1);
  if (s[1] < 0.03 || s[1] > 0.97) c = mix(c, STONE_DEEP, 0.55);
  c = mix(c, STONE_SHADE, smoothstep(0.3, 0, s[0]) * 0.4);
  c = mix(c, "#c9b8a0", smoothstep(0.7, 1, s[0]) * 0.2);
  return c;
});

const courses = (base: number, step: number, joint: number) =>
  paint((p, n) => {
    let c = mix(PL_MID, PL_LIT, noise(p, 0.35, 21) * 0.55);
    c = mix(c, "#3f4560", noise(p, 0.05, 23) > 0.7 ? 0.3 : 0);
    if (Math.abs(n.y) < 0.5) {
      const h = (p.y - base) / step;
      const row = Math.floor(h);
      const u = Math.abs(n.x) > 0.5 ? p.z : p.x;
      const j = ((((u / joint + (row % 2) * 0.5) % 1) + 1) % 1);
      if (h - row < 0.05 || j < 0.025) c = mix(c, STONE_DEEP, 0.65);
      else if (h - row > 0.9) c = mix(c, "#2c3148", 0.25);
      else if (h - row < 0.12) c = mix(c, PL_LIT, 0.2);
      if (p.y < base + step * 0.5 && noise(p, 0.12, 6) > 0.52) c = mix(c, MOSS_D, 0.55);
    } else if (n.y > 0.5) {
      const gx = (((p.x / 0.3) % 1) + 1) % 1;
      const gz = (((p.z / 0.3) % 1) + 1) % 1;
      if (gx < 0.02 || gz < 0.02) c = mix(c, STONE_DEEP, 0.5);
      c = mix(c, PL_LIT, 0.25);
      if (noise(p, 0.1, 5) > 0.66) c = mix(c, MOSS, 0.8);
    } else c = mix(c, STONE_DEEP, 0.4);
    return c;
  });

const BRONZE_PAINT = paint((p, n) => {
  let c = mix(BRONZE_D, BRONZE, 0.55 + noise(p, 0.08, 41) * 0.45);
  c = mix(c, BRONZE_L, smoothstep(0.3, 1, n.y) * 0.7);
  c = mix(c, BRONZE_D, smoothstep(0, -0.8, n.y) * 0.6);
  if (noise(p, 0.03, 43) > 0.7) c = mix(c, VERDI, 0.7);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const ARCH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
  <path d="M6 128 V56 Q6 8 50 4 Q94 8 94 56 V128 Z" fill="#a1a8bd" stroke="#1b1e30" stroke-width="5"/>
  <path d="M14 124 V58 Q14 18 50 12 Q86 18 86 58 V124 Z" fill="#454b66" stroke="#2a2f47" stroke-width="4"/>
  <path d="M14 124 V58 Q14 18 50 12" fill="none" stroke="#1b1e30" stroke-width="5"/>
  <path d="M86 124 V58 Q86 18 50 12" fill="none" stroke="#b4bad0" stroke-width="3"/>
  <circle cx="50" cy="44" r="12" fill="#323853" stroke="#1b1e30" stroke-width="3"/>
  <circle cx="38" cy="70" r="12" fill="#323853" stroke="#1b1e30" stroke-width="3"/>
  <circle cx="62" cy="70" r="12" fill="#323853" stroke="#1b1e30" stroke-width="3"/>
  <path d="M50 88 V122 M32 100 H68" stroke="#1b1e30" stroke-width="4"/>
  <path d="M52 90 V120" stroke="#a1a8bd" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);
const RUNES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
  <g fill="none" stroke="#35e6ff" stroke-width="5" stroke-linecap="square">
  <path d="M14 6 V34 M14 12 L30 22 L14 28"/>
  <path d="M52 6 L52 34 M40 14 L64 14 M40 26 L64 26"/>
  <path d="M86 6 L100 20 L86 34 M104 6 V34"/>
  <path d="M122 34 L136 6 L150 34 M126 24 H146"/>
  <path d="M168 6 V34 M168 6 L186 6 M168 20 L184 20"/>
  </g></svg>`,
  { size: 400 },
);
const CRACK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 0 L46 22 L58 40 L44 58 L52 76 L40 100" fill="none" stroke="#1b1e30" stroke-width="3.5" stroke-linejoin="bevel"/>
  <path d="M58 40 L80 48 L92 66 M44 58 L24 64 L14 80 M46 22 L30 16" fill="none" stroke="#1b1e30" stroke-width="2.6"/>
  </svg>`,
  { size: 256 },
);
const GOUGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <path d="M8 4 L14 56 M24 2 L28 58 M40 4 L42 54" fill="none" stroke="#1b1e30" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M11 6 L16 54 M27 4 L30 56 M43 6 L44 52" fill="none" stroke="#9aa1b8" stroke-width="1.6"/>
  </svg>`,
  { size: 192 },
);
const MOSS_TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M10 64 Q10 36 2 14 Q20 32 26 64Z" fill="#3a5e2c"/>
  <path d="M38 64 Q48 36 62 18 Q58 44 50 64Z" fill="#3a5e2c"/>
  <path d="M20 64 Q22 30 30 6 Q38 34 40 64Z" fill="#5f8f3a"/>
  <path d="M30 64 Q34 40 48 26 Q46 48 44 64Z" fill="#7db548"/>
  <path d="M16 64 Q16 44 8 30 Q22 44 24 64Z" fill="#7db548"/>
  <path d="M26 64 Q28 40 32 20 Q34 44 34 64Z" fill="#a6d764"/>
  </svg>`,
  { size: 128 },
);

/** Linear read of a radius key list at t (0..1). */
function keyAt(keys: readonly number[], t: number) {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
}

const GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="none" stroke="#35e6ff" stroke-width="6" stroke-linejoin="miter">
  <circle cx="50" cy="50" r="42"/>
  <path d="M50 14 L82 68 L18 68 Z"/>
  <path d="M50 86 V40 M32 52 L50 40 L68 52"/>
  </g></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cathedralGargoyle" });
  const D = 0.04; // plinth top is 0.40; the gargoyle is laid out in a 0.36 frame
  const P = (x: number, y: number, z: number): V => [x, y + D, z];
  const R = rng(11);

  // ===============================================================================================================
  // Skeleton roots
  const base = b.joint("plinth", { at: [0, 0.2, 0] });
  const hips = b.joint("hips", { parent: base, at: P(0, 0.72, -0.24), role: "spine" });

  // a bronze band hugging a tube at a chain point
  const band = (on: Chain, t: number, keys: readonly number[], grow: number, tube: number, name: string) => {
    const pt = on.at(t);
    b.part(new THREE.CylinderGeometry(keyAt(keys, t) * grow * 1.14, keyAt(keys, t) * grow * 1.1, tube * 2.4, 9), BRONZE_PAINT, { frame: pt, dir: pt.tangent, name });
    return pt;
  };

  // ===============================================================================================================
  // Plinth: stepped masonry, carved panels, bronze plaque, pinnacles, moss, rubble
  const slab = (name: string, y0: number, y1: number, x: number, z0: number, z1: number, bevel: number, paintOf: Paint) =>
    b.extrude(
      [
        [-x, z0],
        [x, z0],
        [x, z1],
        [-x, z1],
      ],
      { at: [0, (y0 + y1) / 2, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: y1 - y0, bevel, color: paintOf, bone: base, name },
    );
  slab("plinthFoot", 0, 0.09, 0.64, -0.8, 0.66, 0.02, courses(0, 0.09, 0.4));
  slab("plinthStep", 0.09, 0.13, 0.58, -0.74, 0.6, 0.012, courses(0.09, 0.04, 0.4));
  slab("plinthDie", 0.13, 0.34, 0.5, -0.66, 0.5, 0.012, courses(0.13, 0.105, 0.42));
  slab("plinthCornice", 0.34, 0.4, 0.57, -0.73, 0.58, 0.018, courses(0.34, 0.06, 0.4));

  // Carved panels on the die: two arches flank a bronze plaque on the front; arches on the sides and back.
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.16, 0.2), "#ffffff", { at: [s * 0.3, 0.235, 0.504], dir: [0, 0, 1], axis: "z", texture: ARCH, bone: base, name: "archFront" });
    for (const z of [-0.4, -0.12, 0.2])
      b.part(new THREE.PlaneGeometry(0.16, 0.2), "#ffffff", { at: [s * 0.504, 0.235, z], dir: [s, 0, 0], axis: "z", texture: ARCH, bone: base, name: "archSide" });
    b.part(new THREE.PlaneGeometry(0.16, 0.2), "#ffffff", { at: [s * 0.3, 0.235, -0.664], dir: [0, 0, -1], axis: "z", texture: ARCH, bone: base, name: "archBack" });
    b.part(new THREE.PlaneGeometry(0.16, 0.2), "#ffffff", { at: [0, 0.235, -0.664], dir: [0, 0, -1], axis: "z", texture: ARCH, bone: base, name: "archBackMid" });
    b.part(new THREE.PlaneGeometry(0.22, 0.08), "#ffffff", { at: [s * 0.583, 0.045, -0.15], dir: [s, 0, 0], axis: "z", texture: CRACK, bone: base, name: "crackFoot" });
  }
  b.part(new THREE.PlaneGeometry(0.17, 0.2), "#ffffff", { at: [0.44, 0.235, 0.504], dir: [0, 0, 1], axis: "z", texture: CRACK, rotation: [0, 0, 8], bone: base, name: "crackFront" });

  // bronze plaque + glowing rune plate
  b.extrude(
    [
      [-0.17, -0.055],
      [0.17, -0.055],
      [0.19, -0.03],
      [0.19, 0.03],
      [0.17, 0.055],
      [-0.17, 0.055],
      [-0.19, 0.03],
      [-0.19, -0.03],
    ],
    { at: [0, 0.235, 0.49], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bevel: 0.006, color: BRONZE_PAINT, bone: base, name: "plaque" },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.3, 0.06), "#ffffff", { at: [0, 0.235, 0.5065], dir: [0, 0, 1], axis: "z", texture: RUNES, bone: base, name: "plaqueRunes" }),
    1.4,
  );
  const rivets: THREE.BufferGeometry[] = [];
  for (const sx of [-0.165, 0.165]) for (const sy of [-0.03, 0.03]) rivets.push(new THREE.SphereGeometry(0.01, 6, 4).translate(sx, 0.235 + sy, 0.508));
  b.part(mergeGeometries(rivets)!, BRONZE_L, { bone: base, at: [0, 0, 0], name: "plaqueRivets" });

  // bronze corner caps with stone pinnacles
  const caps: THREE.BufferGeometry[] = [];
  for (const sx of [-1, 1])
    for (const [cz, sz] of [
      [-0.73, -1],
      [0.58, 1],
    ] as const) {
      caps.push(new THREE.BoxGeometry(0.1, 0.075, 0.1).translate(sx * 0.545, 0.37, cz - sz * 0.02));
      b.lathe(
        [
          [0, 0],
          [0.04, 0],
          [0.04, 0.08],
          [0.05, 0.09],
          [0.05, 0.1],
          [0.03, 0.11],
          [0.026, 0.18 + (sz < 0 ? 0.1 : 0)],
          [0, 0.24 + (sz < 0 ? 0.14 : 0.0)],
        ],
        { at: [sx * 0.545, 0.405, cz - sz * 0.02], segments: 4, spin: 45, color: courses(0.4, 0.12, 0.3), bone: base, name: "pinnacle" },
      );
    }
  b.part(mergeGeometries(caps)!, BRONZE_PAINT, { bone: base, at: [0, 0, 0], name: "corners" });

  // rubble, pebbles and chips on the top and foot
  const rubble: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const sx = (R() - 0.5) * 0.9;
    const sz = -0.55 + R() * 0.95;
    const r = 0.012 + R() * 0.02;
    const g = new THREE.DodecahedronGeometry(r, 0);
    g.scale(1, 0.6, 1);
    g.rotateY(R() * 6);
    rubble.push(g.translate(sx, 0.4 + r * 0.3, sz));
  }
  b.part(mergeGeometries(rubble)!, DARKSTONE, { bone: base, at: [0, 0, 0], name: "rubbleTop", flat: true });
  const footRubble: THREE.BufferGeometry[] = [];
  for (const [fx, fz, fr] of [
    [0.4, 0.74, 0.05],
    [-0.28, 0.72, 0.035],
    [0.62, -0.5, 0.04],
    [-0.5, -0.88, 0.05],
    [0.1, -0.9, 0.03],
  ] as const) {
    const g = new THREE.DodecahedronGeometry(fr, 0);
    g.scale(1.2, 0.7, 1);
    footRubble.push(g.translate(fx, fr * 0.5, fz));
  }
  b.part(mergeGeometries(footRubble)!, DARKSTONE, { bone: base, at: [0, 0, 0], name: "rubbleFoot", flat: true });

  // claw gouges where the hands grip
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { at: [s * 0.2, 0.402, 0.46], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: GOUGE, bone: base, name: "gouge" });

  // moss tufts along the cornice, corners and base
  const mossAt: V[] = [];
  for (let i = 0; i < 12; i++) {
    const side = i % 4;
    const t = R();
    if (side === 0) mossAt.push([-0.5 + t, 0.4, 0.55]);
    else if (side === 1) mossAt.push([-0.53, 0.4, -0.65 + t * 1.2]);
    else if (side === 2) mossAt.push([0.53, 0.4, -0.65 + t * 1.2]);
    else mossAt.push([-0.5 + t, 0.4, -0.7]);
  }
  for (const [mx, my, mz] of [
    [0.6, 0.09, 0.62],
    [-0.62, 0.09, 0.4],
    [-0.6, 0.09, -0.7],
    [0.55, 0.13, -0.3],
    [-0.1, 0.09, 0.64],
  ] as const)
    mossAt.push([mx, my, mz]);
  b.cards(mossAt.map((m) => frame(m, [0, 1, 0])), MOSS_TUFT, { size: [0.075, 0.075], lean: 0, flow: [0, 0, 1], vary: 0.4, spin: 180, rng: rng(5), cross: true, bone: base });

  // ===============================================================================================================
  // Torso, neck, tail
  const spine = b.chain("spine", catmull([P(0, 0.72, -0.24), P(0, 0.84, -0.04), P(0, 1.0, 0.12), P(0, 1.1, 0.26)]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const torsoKeys = [
    [0.26, 0.22],
    [0.22, 0.2],
    [0.36, 0.29],
    [0.31, 0.25],
  ] as const;
  const torso = b.sweep(
    spine,
    (t) => {
      const f = t * (torsoKeys.length - 1);
      const i = Math.min(Math.floor(f), torsoKeys.length - 2);
      const k = f - i;
      return [torsoKeys[i][0] + (torsoKeys[i + 1][0] - torsoKeys[i][0]) * k, torsoKeys[i][1] + (torsoKeys[i + 1][1] - torsoKeys[i][1]) * k];
    },
    { color: BODY, name: "torso" },
  );
  const skin = b.surface(torso);

  const neck = b.chain("neck", catmull([P(0, 1.1, 0.26), P(0, 1.18, 0.35), P(0, 1.26, 0.44)]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, [0.18, 0.17, 0.155], { color: LIMB, name: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: P(0, 1.26, 0.44), dir: [0, -0.12, 1], role: "head" });

  // belly plates and pecs
  for (const yy of [0.78, 0.87, 0.96])
    for (const xx of [-0.085, 0.085]) {
      const h = skin.ray(P(xx, yy, 1.2), [0, 0, -1]);
      if (h) b.stick(new THREE.BoxGeometry(0.12, 0.04, 0.07), LIMB, h, { embed: 0.45, name: "abPlate", flat: true });
    }
  for (const s of [1, -1]) {
    const h = skin.ray(P(s * 0.16, 1.07, 1.2), [0, 0, -1]);
    if (h) b.stick(new THREE.CylinderGeometry(0.115, 0.125, 0.055, 6), LIMB, h, { embed: 0.5, name: "pec", flat: true });
  }
  // sternum gem in a bronze bezel
  const gemHit = skin.ray(P(0, 1.03, 1.2), [0, 0, -1]);
  if (gemHit) {
    b.stick(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 6), BRONZE_PAINT, gemHit, { embed: 0.5, name: "gemBezel", flat: true });
    glow(b.stick(new THREE.OctahedronGeometry(0.06, 0).scale(0.75, 1, 0.6), CYAN, gemHit.moved([0, 0.015, 0]), { embed: 0.0, name: "gem" }), 1.6);
  }
  // belt with studs and buckle
  const belt = skin.loop(spine.joints[1], { lift: 0.014 });
  b.sweep(belt, 0.026, { color: BRONZE_PAINT, name: "belt" });
  const buckle = skin.ray(P(0, 0.87, 1.2), [0, 0, -1]);
  if (buckle) {
    b.stick(new THREE.CylinderGeometry(0.06, 0.065, 0.04, 8), BRONZE_PAINT, buckle, { embed: 0.3, name: "buckle" });
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), BRONZE_D, buckle.moved([0, 0.02, 0]), { embed: 0, name: "buckleBoss" });
  }
  const beltStuds: THREE.BufferGeometry[] = [];
  b.along(belt, 14, (at) => {
    beltStuds.push(new THREE.SphereGeometry(0.014, 6, 4).scale(1, 0.7, 1).translate(at.at.x, at.at.y, at.at.z));
    return at;
  });
  b.part(mergeGeometries(beltStuds)!, BRONZE_L, { bone: spine.joints[1], at: [0, 0, 0], name: "beltStuds" });

  // dorsal spikes along the back
  b.along(torso, 3, (at) => b.spike(at, at, 0.12, 0.045, { color: DARKSTONE, name: "backSpike" }), { from: 0, to: 0.4 });
  b.along(torso, 2, (at) => b.spike(at, at, 0.12, 0.045, { color: DARKSTONE, name: "backSpike" }), { from: 0.8, to: 1 });

  // haunches and rump
  for (const s of [1, -1]) {
    const haunch = b.part(new THREE.SphereGeometry(1, 10, 8), BODY, { at: P(s * 0.27, 0.72, -0.25), scale: [0.17, 0.18, 0.2], bone: hips, name: "haunch", flat: true });
    glow(b.decal(haunch, GLYPH, { at: P(s * 0.43, 0.76, -0.22), dir: [s, 0.15, 0], up: [0, 1, 0], size: [0.11, 0.11], lift: 0.004, mirror: s < 0, name: "haunchRune" }), 1.3);
  }
  glow(b.decal(torso, GLYPH, { at: P(0, 1.0, -0.17), dir: [0, 0.1, -1], size: [0.2, 0.2], lift: 0.004, mirror: true, name: "backRune" }), 1.3);
  // moss creeping over the shoulders and back
  b.cards(
    skin.scatter(10, { rng: rng(21), minDist: 0.14, filter: (h) => h.n.y > 0.45 }),
    MOSS_TUFT,
    { size: [0.06, 0.06], lean: 0, flow: [0, 0, 1], vary: 0.4, spin: 180, rng: rng(6), cross: true },
  );

  // tail curling over the plinth top
  const tailPath = catmull([P(0, 0.7, -0.28), P(0, 0.62, -0.44), P(0, 0.5, -0.55), P(0.13, 0.41, -0.63), P(0.34, 0.405, -0.62), P(0.5, 0.405, -0.52), P(0.6, 0.405, -0.38)]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail" });
  const tailKeys = [0.12, 0.085, 0.06, 0.048, 0.04, 0.034];
  const tailSweep = b.sweep(tail, tailKeys, { color: LIMB, name: "tail" });
  b.along(tailSweep, 5, (at) => b.spike(at, at, 0.1, 0.03, { color: DARKSTONE, name: "tailSpike" }), { from: 0.05, to: 0.7 });
  for (const t of [0.4, 0.62, 0.82]) band(tail, t, tailKeys, 1.12, 0.014, "tailBand");
  const tailTip = tail.tip ?? tail.joints[5];
  const spade = b.extrude(
    [
      [0, -0.035],
      [0.08, -0.07],
      [0.2, 0, "sharp"],
      [0.08, 0.07],
      [0, 0.035],
    ],
    { at: P(0.6, 0.405, -0.38), x: [0.45, 0, 1], y: [1, 0, -0.45], thickness: 0.03, bevel: 0.008, color: BRONZE_PAINT, bone: tailTip, name: "tailSpade" },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0).scale(1.1, 0.5, 0.7), CYAN, { at: spade.local([0.09, 0, 0.016]), dir: [0.45, 0, 1], bone: tailTip, name: "tailGem" }), 1.5);

  // ===============================================================================================================
  // Legs (haunched squat) and feet
  const legKeys = [0.145, 0.11, 0.085, 0.065];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = P(s * 0.26, 0.76, -0.26);
    const ankle = P(s * 0.39, 0.46, -0.2);
    const pts = limb(hip, ankle, [0.37, 0.36], [s * 0.7, 0.25, 0.8]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [ankle[0], 0.4, ankle[2] + 0.1] });
    b.sweep(leg, legKeys, { color: LIMB, name: `leg${side}` });
    const ank = leg.tip ?? leg.joints[2];
    b.spike(leg.joints[1], [s * 0.8, 0.35, 0.5], 0.13, 0.05, { color: DARKSTONE, name: "kneeSpike" });
    b.spike(ank, [s * 0.3, 0.2, -1], 0.13, 0.04, { color: CLAW, name: "heelSpur" });
    band(leg, 0.86, legKeys, 1.15, 0.02, "ankleCuff");
    band(leg, 0.4, legKeys, 1.08, 0.016, "shinStrap");
    band(leg, 0.12, legKeys, 1.05, 0.02, "thighStrap");
    // foot pad
    b.extrude(
      [
        [-0.075, -0.09],
        [0.075, -0.09],
        [0.105, 0.07],
        [0.095, 0.18],
        [-0.095, 0.18],
        [-0.105, 0.07],
      ],
      { at: [ankle[0], 0.41, ankle[2]], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, color: LIMB, bone: ank, name: `footPad${side}` },
    );
    for (const [i, ox] of [-0.07, 0, 0.07].entries()) {
      const tx = ankle[0] + ox;
      const toe = b.chain(`toe${i + 1}${side}`, catmull([[tx, 0.41, ankle[2] + 0.18], [tx, 0.405, ankle[2] + 0.26], [tx, 0.385, ankle[2] + 0.32]]), {
        parent: ank,
        names: [`toe${i + 1}${side}a`, `toe${i + 1}${side}b`, `toe${i + 1}${side}c`],
        role: "digit",
      });
      b.sweep(toe, [0.04, 0.032, 0.026], { color: LIMB, name: "toe" });
      b.spike(toe.at(1), [0, -0.5, 1], 0.1, 0.026, { color: CLAW, name: "toeClaw" });
    }
  }

  // ===============================================================================================================
  // Arms: shoulders, planted forearms, oversized hands gripping the lip
  const chest = spine.joints[2];
  const armKeys = [0.125, 0.115, 0.1, 0.105, 0.125];
  const chainEyes: V[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = P(s * 0.37, 1.0, 0.12);
    const wr = P(s * 0.3, 0.5, 0.21);
    const pts = limb(sh, wr, [0.32, 0.3], [s * 1, 0.4, -0.8]);
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    const armSweep = b.sweep(arm, armKeys, { color: LIMB, name: `arm${side}` });
    const plateHit = b.surface(armSweep).ray(P(s * 1.3, 0.6, 0.15), [-s, 0, 0]);
    if (plateHit) {
      b.stick(new THREE.BoxGeometry(0.08, 0.03, 0.17), BRONZE_PAINT, plateHit, { embed: 0.3, flow: [0, -1, 0], name: "bracer", flat: true });
      for (const dz of [-0.06, 0.06]) b.stick(new THREE.SphereGeometry(0.012, 5, 3), BRONZE_L, plateHit.moved([0, 0.012, dz]), { embed: 0.3, name: "bracerRivet" });
    }
    const wj = arm.tip ?? arm.joints[2];

    // pauldron rocks
    b.part(new THREE.IcosahedronGeometry(1, 0), BODY, { at: P(s * 0.4, 1.14, 0.06), scale: [0.2, 0.15, 0.21], bone: arm.joints[0], name: "pauldron", flat: true });
    b.part(new THREE.IcosahedronGeometry(1, 0), DARKSTONE, { at: P(s * 0.5, 1.07, 0.1), scale: [0.1, 0.09, 0.11], bone: arm.joints[0], name: "pauldronB", flat: true });
    for (const [dx, dz, len] of [
      [0.2, 0.0, 0.16],
      [0.5, -0.5, 0.13],
      [-0.1, -0.8, 0.12],
    ] as const)
      b.spike(P(s * 0.4, 1.2, 0.06), [s * dx, 1, dz], len, 0.04, { color: DARKSTONE, bone: arm.joints[0], name: "pauldronSpike" });
    b.part(new THREE.TorusGeometry(0.17, 0.016, 5, 12), BRONZE_PAINT, { at: P(s * 0.4, 1.09, 0.06), dir: [s * 0.6, 1, 0.3], axis: "z", bone: arm.joints[0], name: "pauldronTrim" });
    // elbow spike, bracer bands and rune gem
    b.spike(arm.joints[1], [s * 0.9, 0.3, -0.8], 0.17, 0.055, { color: DARKSTONE, name: "elbowSpike" });
    const cu = band(arm, 0.86, armKeys, 1.12, 0.026, "wristCuff");
    band(arm, 0.7, armKeys, 1.1, 0.014, "wristCuff2");
    band(arm, 0.2, armKeys, 1.1, 0.016, "upperArmBand");
    const gemAt = cu.at.clone().add(new THREE.Vector3(s * keyAt(armKeys, 0.86) * 1.2, 0, 0));
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0).scale(0.7, 1, 0.7), CYAN, { at: gemAt, bone: wj, name: "cuffGem" }), 1.4);
    chainEyes.push([gemAt.x, gemAt.y, gemAt.z]);

    // palm and fingers
    b.extrude(
      [
        [-0.11, -0.1],
        [0.11, -0.1],
        [0.145, 0.06],
        [0.13, 0.13],
        [-0.13, 0.13],
        [-0.145, 0.06],
      ],
      { at: [wr[0], 0.41, wr[2] + 0.08], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.095, bevel: 0.025, color: LIMB, bone: wj, name: `palm${side}` },
    );
    const hx = wr[0];
    for (const [i, ox] of [-0.09, 0, 0.09].entries()) {
      const fx = hx + ox;
      const fing = b.chain(`finger${i + 1}${side}`, catmull([[fx, 0.41, 0.4], [fx, 0.405, 0.48], [fx, 0.375, 0.545]]), {
        parent: wj,
        names: [`finger${i + 1}${side}a`, `finger${i + 1}${side}b`, `finger${i + 1}${side}c`],
        role: "digit",
      });
      b.sweep(fing, [0.046, 0.04, 0.032], { color: LIMB, name: "finger" });
      b.spike(fing.at(1), [0, -1, 0.35], 0.1, 0.03, { color: CLAW, name: "claw" });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), BRONZE_PAINT, { at: P(fx, 0.45, 0.42), bone: wj, name: "knuckleStud" });
    }
    const thumb = b.chain(`thumb${side}`, catmull([[hx - s * 0.12, 0.41, 0.3], [hx - s * 0.17, 0.4, 0.38], [hx - s * 0.19, 0.38, 0.45]]), {
      parent: wj,
      names: [`thumb${side}a`, `thumb${side}b`, `thumb${side}c`],
      role: "digit",
    });
    b.sweep(thumb, [0.042, 0.036, 0.03], { color: LIMB, name: "thumb" });
    b.spike(thumb.at(1), [0, -0.8, 0.5], 0.1, 0.027, { color: CLAW, name: "thumbClaw" });
  }

  // broken shackle chain from the left wrist cuff, spilling onto the plinth top
  {
    const [ex, ey, ez] = chainEyes[0];
    const links: THREE.BufferGeometry[] = [];
    const link = (x: number, y: number, z: number, rot: V) => {
      const g = new THREE.TorusGeometry(0.03, 0.0085, 4, 8).scale(1.35, 1, 1);
      const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)), new THREE.Vector3(1, 1, 1));
      links.push(g.applyMatrix4(m));
    };
    link(ex + 0.02, ey - 0.05, ez, [0, 90, 0]);
    link(ex + 0.04, ey - 0.1, ez + 0.01, [90, 0, 30]);
    link(ex + 0.06, ey - 0.15, ez + 0.03, [0, 80, 20]);
    link(0.52, 0.41, 0.3, [90, 0, 80]);
    link(0.5, 0.41, 0.36, [90, 0, 100]);
    link(0.47, 0.41, 0.415, [0, 100, 0]);
    link(0.42, 0.41, 0.46, [90, 0, 60]);
    b.part(mergeGeometries(links)!, "#7b8394", { bone: base, at: [0, 0, 0], name: "chainLinks" });
  }

  // ===============================================================================================================
  // Head: skull, brow, muzzle, jaw, fangs, glowing eyes, horns, ears, crest
  const K = 1.2;
  const hr = b.region({ at: head.at, scale: K, bone: head });
  const H = (l: number, u: number, f: number) => hr.p([l, u, f]);
  const sc = (x: number, y: number, z: number): V => [x * K, y * K, z * K];
  b.part(new THREE.SphereGeometry(1, 12, 9), BODY, { at: H(0, 0.05, 0.1), scale: sc(0.18, 0.16, 0.19), bone: head, name: "skull", flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(1, 0), LIMB, { at: H(s * 0.16, -0.05, 0.12), scale: sc(0.055, 0.055, 0.075), bone: head, name: "cheek", flat: true });
    b.sweep(catmull([H(s * 0.02, 0.12, 0.262), H(s * 0.1, 0.14, 0.248), H(s * 0.175, 0.125, 0.165)]), [0.036 * K, 0.034 * K, 0.02 * K], { color: DARKSTONE, bone: head, section: { ngon: 5 }, caps: "flat", name: "brow" });
    // eyes
    b.part(new THREE.SphereGeometry(1, 8, 6), MAW, { at: H(s * 0.12, 0.07, 0.24), scale: sc(0.055, 0.034, 0.026), rotation: [0, 0, s * 22], bone: head, name: "eyeSocket" });
    glow(b.part(new THREE.SphereGeometry(1, 8, 6), CYAN, { at: H(s * 0.12, 0.068, 0.258), scale: sc(0.042, 0.022, 0.014), rotation: [0, 0, s * 22], bone: head, name: "eye" }), 1.6);
    glow(b.part(new THREE.SphereGeometry(1, 6, 4), CYAN_HOT, { at: H(s * 0.118, 0.068, 0.266), scale: sc(0.016, 0.014, 0.007), bone: head, name: "eyeCore" }), 2);
    // nostrils
    b.part(new THREE.SphereGeometry(1, 6, 4), INK, { at: H(s * 0.036, 0.022, 0.43), scale: sc(0.018, 0.013, 0.012), bone: head, name: "nostril" });
    // ears
    const ear = b.extrude(
      (
        [
          [0, -0.06],
          [0.1, 0.0],
          [0.24, 0.2, "sharp"],
          [0.13, 0.17],
          [0.05, 0.12],
          [0, 0.08],
        ] as const
      ).map(([x, y, k]) => (k ? ([x * K, y * K, k] as [number, number, "sharp"]) : ([x * K, y * K] as [number, number]))),
      { at: H(s * 0.17, 0.02, 0.02), x: [s * 0.95, 0.15, -0.3], y: [0, 1, 0], thickness: 0.035 * K, bevel: 0.01, color: LIMB, bone: head, name: "ear" },
    );
    b.part(new THREE.TorusGeometry(0.02, 0.007, 5, 8), BRONZE_PAINT, { at: ear.local([0.14, 0.07, 0.02]), dir: [s * 0.85, 0.1, -0.5], axis: "z", bone: head, name: "earRing" });
    // cheek and jaw spikes
    b.spike(H(s * 0.17, -0.04, 0.08), [s * 0.7, -0.1, -0.7], 0.12 * K, 0.04 * K, { color: DARKSTONE, bone: head, name: "cheekSpike" });
    b.spike(H(s * 0.14, -0.1, 0.1), [s * 0.5, -0.5, -0.7], 0.1 * K, 0.035 * K, { color: DARKSTONE, bone: head, name: "jawSpike" });
    // horns
    const hb = H(s * 0.12, 0.15, 0.06);
    const hm = H(s * 0.24, 0.28, -0.04);
    const ht = H(s * 0.19, 0.46, -0.3);
    const hp = bezier(hb, hm, ht);
    b.sweep(hp, [0.06 * K, 0.01], { color: gradient("#4a4f69", "#d9d0b8", hm, ht), bone: head, caps: { start: "flat", end: "point" }, name: "horn" });
    for (const t of [0.22, 0.42]) {
      b.part(new THREE.TorusGeometry((0.058 - t * 0.06) * K, 0.011 * K, 5, 9), BRONZE_PAINT, { at: hp.at(t), dir: hp.tangentAt(t), axis: "z", bone: head, name: "hornBand" });
    }
  }
  // muzzle
  b.frustumBox(H(0, 0.0, 0.22), H(0, -0.02, 0.4), [0.19 * K, 0.13 * K], [0.16 * K, 0.105 * K], { color: BODY, bone: head, name: "muzzle" });
  b.rod(H(0, 0.1, 0.2), H(0, 0.06, 0.4), [0.034 * K, 0.045 * K], { color: DARKSTONE, bone: head, name: "noseBridge", sides: 5 });
  b.part(new THREE.IcosahedronGeometry(1, 0), BODY, { at: H(0, 0.03, 0.41), scale: sc(0.09, 0.055, 0.05), bone: head, name: "nose", flat: true });
  b.part(new THREE.BoxGeometry(0.2 * K, 0.04 * K, 0.2 * K), MAW, { at: H(0, -0.085, 0.27), bone: head, name: "mouthDark" });
  for (const [f, u, len] of [
    [0.12, 0.2, 0.12],
    [0.0, 0.17, 0.15],
    [-0.07, 0.11, 0.12],
  ] as const)
    b.spike(H(0, u, f), [0, 1, -0.5], len * K, 0.04 * K, { color: DARKSTONE, bone: head, name: "crest" });
  // upper teeth (merged) and fangs
  const upper: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const f of [0.24, 0.28, 0.32, 0.36]) {
      const p = H(s * (0.1 - (f - 0.24) * 0.2), -0.08, f);
      upper.push(new THREE.ConeGeometry(0.014 * K, 0.04 * K, 4).rotateX(Math.PI).translate(p.x, p.y - 0.016 * K, p.z));
    }
  b.part(mergeGeometries(upper)!, CLAW, { bone: head, at: [0, 0, 0], name: "upperTeeth", flat: true });
  for (const s of [1, -1]) b.spike(H(s * 0.08, -0.08, 0.38), [0, -1, 0.1], 0.085 * K, 0.024 * K, { color: CLAW, bone: head, name: "fang" });
  // jaw (separate joint)
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.06, 0.06), aim: H(0, -0.1, 0.37), role: "jaw" });
  const lowerT: THREE.BufferGeometry[] = [];
  b.frustumBox(H(0, -0.105, 0.1), H(0, -0.12, 0.37), [0.21 * K, 0.08 * K], [0.17 * K, 0.075 * K], { color: LIMB, bone: jaw, name: "jawBox" });
  b.part(new THREE.IcosahedronGeometry(1, 0), LIMB, { at: H(0, -0.13, 0.385), scale: sc(0.095, 0.05, 0.06), bone: jaw, name: "chin", flat: true });
  b.spike(H(0, -0.15, 0.37), [0, -1, 0.4], 0.1 * K, 0.04 * K, { color: DARKSTONE, bone: jaw, name: "chinSpike" });
  for (const s of [1, -1]) {
    b.spike(H(s * 0.07, -0.085, 0.35), [s * 0.04, 1, 0.2], 0.13 * K, 0.028 * K, { color: CLAW, bone: jaw, name: "tusk" });
    for (const f of [0.18, 0.23, 0.28]) {
      const p = H(s * 0.08, -0.09, f);
      lowerT.push(new THREE.ConeGeometry(0.012 * K, 0.035 * K, 4).translate(p.x, p.y + 0.014 * K, p.z));
    }
  }
  b.part(mergeGeometries(lowerT)!, CLAW, { bone: jaw, at: [0, 0, 0], name: "lowerTeeth", flat: true });
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  // neck collar
  const neckKeys = [0.18, 0.17, 0.155];
  const nc = band(neck, 0.3, neckKeys, 1.12, 0.03, "collar");
  b.part(new THREE.TorusGeometry(keyAt(neckKeys, 0.3) * 1.16, 0.013, 5, 12), BRONZE_L, { at: nc.at, dir: nc.tangent, axis: "z", bone: neck.joints[0], name: "collarTrim" });

  // ===============================================================================================================
  // Wings, half open
  const wingKeys = [0.09, 0.075, 0.06];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S0 = P(s * 0.22, 1.08, -0.02);
    const E0 = P(s * 0.49, 1.4, -0.14);
    const W0 = P(s * 0.74, 1.56, -0.22);
    const wingArm = b.chain(`wingArm${side}`, catmull([S0, E0, W0]), { parent: chest, names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`], role: "wing" });
    b.sweep(wingArm, wingKeys, { color: LIMB, name: `wingArm${side}` });
    const wrist = wingArm.tip ?? wingArm.joints[2];
    b.part(new THREE.IcosahedronGeometry(0.09, 0), DARKSTONE, { at: E0, bone: wingArm.joints[1], name: "wingElbowRock", flat: true });
    b.spike(E0, [s * 0.2, 0.9, -0.9], 0.16, 0.05, { color: DARKSTONE, bone: wingArm.joints[1], name: "wingElbowSpike" });
    b.part(new THREE.IcosahedronGeometry(0.08, 0), LIMB, { at: W0, bone: wrist, name: "wingWristRock", flat: true });
    b.spike(W0, [s * 0.25, 0.7, 0.8], 0.22, 0.045, { color: CLAW, bone: wrist, name: "wingThumbClaw" });
    band(wingArm, 0.62, wingKeys, 1.12, 0.02, "wingBand");
    band(wingArm, 0.12, wingKeys, 1.12, 0.02, "wingRootBand");
    const tips: V[] = [P(s * 1.38, 1.72, -0.5), P(s * 1.32, 1.34, -0.78), P(s * 1.05, 1.02, -0.94), P(s * 0.68, 0.8, -0.86)];
    const fingers = tips.map((tip, i) => {
      const wv = new THREE.Vector3(...W0);
      const tv = new THREE.Vector3(...tip);
      const mid = wv.clone().lerp(tv, 0.5).add(new THREE.Vector3(s * 0.03, 0.05, 0.03));
      const ch = b.chain(`wingFinger${i + 1}${side}`, catmull([W0, [mid.x, mid.y, mid.z], tip]), {
        parent: wrist,
        names: [`wingF${i + 1}${side}a`, `wingF${i + 1}${side}b`, `wingF${i + 1}${side}c`],
        role: "wing",
      });
      const fk = [0.042 - i * 0.002, 0.026, 0.01];
      b.sweep(ch, fk, { color: LIMB, name: `wingFinger${i + 1}${side}` });
      b.part(new THREE.ConeGeometry(0.02, 0.06, 5), BRONZE_PAINT, { at: tip, dir: [tip[0] - mid.x, tip[1] - mid.y, tip[2] - mid.z], bone: ch.tip ?? ch.joints[2], name: "wingTipCap" });
      band(ch, 0.4, fk, 1.2, 0.01, "fingerBand");
      return ch;
    });
    for (let i = 0; i < 3; i++) b.membrane(fingers[i], fingers[i + 1], { thickness: 0.032, color: WING_PAINT, scallop: 0.16, name: `wingWeb${i}${side}` });
    for (let i = 0; i < 3; i++)
      for (const k of [0.33, 0.66]) {
        const pts = [0.08, 0.35, 0.6, 0.85, 0.97].map((t) => fingers[i].at(t * 0.86).at.clone().lerp(fingers[i + 1].at(t * 0.86).at, k));
        b.sweep(catmull(pts), [0.014, 0.005], { color: DARKSTONE, bone: k < 0.5 ? fingers[i] : fingers[i + 1], caps: { start: "none", end: "point" }, name: "wingRib" });
      }
    const rear = catmull([W0, P(s * 0.5, 1.1, -0.34), P(s * 0.2, 0.84, -0.32)]);
    b.membrane(fingers[3], rear, { thickness: 0.032, color: WING_PAINT, scallop: 0.1, bone: chest, name: `wingWebRear${side}` });
    b.membrane(rear, catmull([W0, E0, S0]), { thickness: 0.03, color: WING_PAINT, bone: chest, name: `wingWebInner${side}` });
  }

  return b.root;
}
