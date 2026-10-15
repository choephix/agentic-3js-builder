import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, countershade, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wraithfang, the Dragonbone Soul Scythe",
  description:
    "A 2.2 m dragonbone war scythe on a violet stone plinth: a vertebra-spine snath with leather grip and soul-lantern rib cage, a horned dragon skull whose open jaws give birth to a crescent blade of bone and violet glass edged in spectral teal fire.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone, violet obsidian, gold trim, one strong spectral-teal accent.
const BONE = "#f1e6c9";
const BONE_SH = "#cdb994";
const BONE_DK = "#8a7456";
const INK = "#150d27";
const VIO_DK = "#1f1239";
const VIO = "#33206a";
const VIO_LT = "#7a45e0";
const GOLD = "#f4bb3e";
const GOLD_DK = "#a86c1c";
const TEAL = "#27f2d2";
const TEAL_DK = "#0c8e8a";
const MINT = "#d9fff7";
const LEATH_A = "#2a1946";
const LEATH_B = "#4a2c7c";

const DX = -0.3; // design x -> model x, centres the whole piece on x = 0
const SX = -0.12; // snath axis (design x)
const S = (x: number, y: number, z = 0): [number, number, number] => [x + DX, y, z];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const FLAME = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 126 C6 104 4 72 24 46 C28 34 22 18 30 2 C36 22 54 38 56 70 C58 98 48 114 32 126Z" fill="#0fb7a8"/>
    <path d="M32 120 C14 102 12 76 28 54 C31 44 28 32 32 20 C38 38 50 52 50 74 C50 98 42 110 32 120Z" fill="#27f2d2"/>
    <path d="M32 112 C22 100 22 82 32 66 C36 78 44 86 42 98 C40 106 36 110 32 112Z" fill="#aaffee"/>
    <path d="M32 106 C27 98 28 88 32 80 C36 88 37 98 32 106Z" fill="#f2fffb"/>
  </svg>`,
  { size: 192 },
);

const WISP = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 94 C26 80 36 72 28 62 C14 58 10 40 14 28 C18 10 46 10 50 28 C54 40 50 58 38 62 C42 72 34 82 32 94Z" fill="#27f2d2"/>
    <path d="M32 86 C28 76 36 68 30 58 C20 54 18 40 20 30 C24 16 42 16 44 30 C46 40 42 54 36 58 C40 68 34 78 32 86Z" fill="#aaffee"/>
    <ellipse cx="24" cy="32" rx="5" ry="7" fill="#0b2b3a"/>
    <ellipse cx="40" cy="32" rx="5" ry="7" fill="#0b2b3a"/>
    <ellipse cx="32" cy="46" rx="4" ry="6" fill="#0b2b3a"/>
  </svg>`,
  { size: 192 },
);

const RUNE_COL = svg(
  `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#27f2d2" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 6 V34 M8 16 L20 6 L32 16 M10 28 L20 36 L30 26"/>
    <circle cx="20" cy="60" r="10"/>
    <path d="M20 44 V76 M10 66 L30 54"/>
    <path d="M8 88 L20 82 L32 88 M20 82 V112 M10 104 L20 112 L30 104"/>
  </svg>`,
  { size: 256 },
);

const RUNE_RING = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#27f2d2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="128" cy="128" r="122"/>
    <circle cx="128" cy="128" r="110" stroke-width="1.6"/>
    <circle cx="128" cy="128" r="70"/>
    <polygon points="128,64 183,160 73,160" stroke-width="2"/>
    <polygon points="128,192 73,96 183,96" stroke-width="2"/>
    ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 128 128)"><path d="M128 20 V44 M120 28 L128 20 L136 28 M121 38 L128 44 L135 38"/></g>`).join("")}
    ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30 + 15} 128 128)"><path d="M128 78 V92 M124 84 H132"/></g>`).join("")}
  </svg>`,
  { size: 512 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="118" height="18" rx="3" fill="#1b0f33" stroke="#f4bb3e" stroke-width="2"/>
    <g fill="none" stroke="#27f2d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 10 H34 M18 5 L12 10 L18 15"/>
      <path d="M86 10 H108 M102 5 L108 10 L102 15"/>
      <path d="M60 3 L66 10 L60 17 L54 10 Z"/>
      <path d="M44 6 V14 M76 6 V14"/>
    </g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
type G = THREE.BufferGeometry;
type V = [number, number, number];

const cone = (base: V, dir: V, len: number, r: number, sides = 5): G =>
  new THREE.ConeGeometry(r, len, sides, 1)
    .translate(0, len / 2, 0)
    .applyQuaternion(aim(dir))
    .translate(base[0], base[1], base[2]);
const cyl = (c: V, rTop: number, rBot: number, h: number, sides = 8): G =>
  new THREE.CylinderGeometry(rTop, rBot, h, sides, 1).translate(c[0], c[1], c[2]);
const ball = (c: V, r: number, w = 8, h = 6): G => new THREE.SphereGeometry(r, w, h).translate(c[0], c[1], c[2]);
const ringH = (c: V, R: number, t: number): G =>
  new THREE.TorusGeometry(R, t, 5, 12).rotateX(Math.PI / 2).translate(c[0], c[1], c[2]);
const gem = (c: V, r: number): G => new THREE.OctahedronGeometry(r, 0).translate(c[0], c[1], c[2]);
const merge = (gs: G[]) => mergeGeometries(gs, false) as G;

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const BONEP = countershade(mottle(BONE, BONE_SH, { size: 0.07, contrast: 1.5, seed: 2 }), BONE_DK, {
    level: -0.15,
  });
  const STONE = paint((p, n) => {
    if (n.y > 0.6) return mix(VIO, VIO_DK, noise(p, 0.1, 4));
    const a = (Math.atan2(p.x - (SX + DX), p.z) * 180) / Math.PI;
    const f = Math.abs((((a + 22.5) % 45) + 45) % 45 - 22.5) / 22.5;
    const base = mix(VIO_DK, VIO, noise(p, 0.09, 7));
    return f > 0.9 ? mix(base, VIO_LT, 0.6) : base;
  });

  const place = (g: G, color: string | ReturnType<typeof paint>, opts: { name?: string } = {}) =>
    b.part(g, color, { bone: root, at: [0, 0, 0], flat: true, ...opts });

  // ---- plinth ----------------------------------------------------------------------------------------------
  const PC = S(SX, 0, 0);
  const tier = (y0: number, y1: number, r: number, color: string | ReturnType<typeof paint>, name: string) =>
    b.part(new THREE.CylinderGeometry(r, r, y1 - y0, 8, 1), color, {
      at: [PC[0], (y0 + y1) / 2, 0],
      rotation: [0, 22.5, 0],
      bone: root,
      flat: true,
      name,
    });
  tier(0, 0.05, 0.58, STONE, "plinthBase");
  tier(0.05, 0.068, 0.54, GOLD_DK, "plinthTrimLow");
  tier(0.068, 0.118, 0.52, STONE, "plinthBody");
  tier(0.118, 0.15, 0.56, STONE, "plinthCap");
  tier(0.146, 0.152, 0.545, GOLD, "plinthTrimTop");

  // body plaques
  for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI) / 4;
    const rr = 0.52 * Math.cos(Math.PI / 8) + 0.004;
    glow(
      b.part(new THREE.PlaneGeometry(0.27, 0.045), "#ffffff", {
        at: [PC[0] + rr * Math.sin(th), 0.093, rr * Math.cos(th)],
        dir: [Math.sin(th), 0, Math.cos(th)],
        axis: "z",
        texture: PLAQUE,
        bone: root,
      }),
      0.8,
    );
  }
  // corner fangs on the cap
  const fangs: G[] = [];
  const fangTips: G[] = [];
  for (let k = 0; k < 8; k++) {
    const th = (k * Math.PI) / 4 + Math.PI / 8;
    const c: V = [PC[0] + 0.545 * Math.sin(th), 0.148, 0.545 * Math.cos(th)];
    fangs.push(cone(c, [Math.sin(th) * 0.35, 1, Math.cos(th) * 0.35], 0.1, 0.028, 5));
    fangTips.push(ringH([c[0], c[1] + 0.012, c[2]], 0.024, 0.008));
  }
  place(merge(fangs), BONEP, { name: "plinthFangs" });
  place(merge(fangTips), GOLD, { name: "plinthFangRings" });

  // rune circle
  glow(
    b.part(new THREE.CircleGeometry(0.4, 32), "#ffffff", {
      at: [PC[0], 0.1535, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNE_RING,
      bone: root,
    }),
    1,
  );

  // ---- snath ---------------------------------------------------------------------------------------------------
  b.sweep([S(SX, 0.15), S(SX, 1.9)], 0.026, { color: BONE_DK, bone: root, caps: "flat", sides: 8, name: "snathCore" });

  // lower dragon spine (vertebrae) and talon clasp
  const vert: G[] = [];
  const spin: G[] = [];
  const side: G[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 0.215 + i * 0.056;
    const r = 0.042 - i * 0.0012;
    vert.push(cyl(S(SX, y), r, r * 1.04, 0.044, 8));
    spin.push(cone(S(SX - 0.025, y, 0), [-0.55, 0.85, 0], 0.08 - i * 0.004, 0.015, 5));
  }
  for (let i = 0; i < 7; i++) {
    const y = 1.47 + i * 0.054;
    const r = 0.04 + i * 0.0015;
    vert.push(cyl(S(SX, y), r, r * 1.04, 0.044, 8));
    spin.push(cone(S(SX - 0.025, y, 0), [-0.6, 0.8, 0], 0.075 + (i % 2) * 0.025, 0.014, 5));
    for (const s of [1, -1]) side.push(cone(S(SX, y, s * 0.03), [0, 0.35, s], 0.062, 0.011, 5));
  }
  place(merge(vert), BONEP, { name: "vertebrae" });
  place(merge(spin), BONEP, { name: "vertebraeSpines" });
  place(merge(side), BONEP, { name: "vertebraeWings" });

  // talons clutching the lower snath
  for (const phi of [30, 150, 270]) {
    const a = (phi * Math.PI) / 180;
    const pts = (
      [
        [0.36, 0.12],
        [0.32, 0.22],
        [0.22, 0.38],
        [0.1, 0.5],
        [0.056, 0.55],
      ] as [number, number][]
    ).map(([r, y]) => S(SX + r * Math.cos(a), y, r * Math.sin(a)));
    b.sweep(catmull(pts), [0.045, 0.012], {
      color: BONEP,
      bone: root,
      caps: { start: "flat", end: "point" },
      sides: 6,
      name: "talon",
    });
  }

  // gold hardware on the snath
  const goldBits: G[] = [];
  const tealGems: G[] = [];
  const band = (y: number, r: number, h: number) => {
    goldBits.push(cyl(S(SX, y), r, r, h, 10));
    goldBits.push(ringH(S(SX, y + h / 2), r, 0.007));
    goldBits.push(ringH(S(SX, y - h / 2), r, 0.007));
  };
  band(0.57, 0.05, 0.03);
  band(0.6, 0.042, 0.012);
  band(1.05, 0.05, 0.03);
  band(1.08, 0.056, 0.016);
  band(1.43, 0.056, 0.016);
  band(1.455, 0.05, 0.03);
  band(1.86, 0.062, 0.03);
  band(1.89, 0.05, 0.016);
  // gold ferrule where the talons meet the snath
  band(0.545, 0.05, 0.014);
  for (const [y, s] of [
    [1.05, 1],
    [1.455, -1],
    [1.86, 1],
  ] as [number, number][]) {
    tealGems.push(gem(S(SX, y + 0.0, 0.052 * s + (s > 0 ? 0.004 : -0.004)), 0.013));
  }
  tealGems.push(gem(S(SX, 0.57, 0.052), 0.012));
  place(merge(goldBits), GOLD, { name: "snathGold" });
  glow(place(merge(tealGems), TEAL, { name: "snathGems" }), 1.2);

  // leather grip
  const WRAP = paint((_p, _n, s) => {
    const w = (((s[1] / 360 + s[0] * 9) % 1) + 1) % 1;
    if (w < 0.06) return GOLD;
    if (w < 0.1) return INK;
    return w < 0.55 ? LEATH_A : LEATH_B;
  });
  b.sweep([S(SX, 0.62), S(SX, 1.04)], 0.034, { color: WRAP, bone: root, caps: "flat", sides: 8, name: "grip" });

  // nib handle
  b.sweep(catmull([S(SX, 0.86), S(SX - 0.11, 0.885), S(SX - 0.21, 0.82), S(SX - 0.245, 0.67)]), [0.026, 0.019], {
    color: WRAP,
    bone: root,
    caps: "flat",
    sides: 8,
    name: "nib",
  });
  place(
    merge([
      cyl(S(SX - 0.016, 0.866), 0.036, 0.036, 0.03, 10).rotateZ(0),
      ball(S(SX - 0.248, 0.64), 0.03, 8, 6),
      ringH(S(SX - 0.246, 0.685), 0.027, 0.008),
    ]),
    GOLD,
    { name: "nibGold" },
  );
  glow(place(gem(S(SX - 0.25, 0.612), 0.017), TEAL, { name: "nibGem" }), 1.2);

  // soul-lantern rib cage
  for (let k = 0; k < 5; k++) {
    const a = ((k * 72 + 18) * Math.PI) / 180;
    const pts = (
      [
        [0.05, 1.085],
        [0.118, 1.17],
        [0.125, 1.25],
        [0.118, 1.33],
        [0.05, 1.42],
      ] as [number, number][]
    ).map(([r, y]) => S(SX + r * Math.cos(a), y, r * Math.sin(a)));
    b.sweep(catmull(pts), [0.014, 0.019, 0.014], { color: BONEP, bone: root, caps: "flat", sides: 6, name: "rib" });
    // rib claws tipping the cage outward
    const tip = pts[2];
    b.sweep(
      [
        [tip[0] + 0.01 * Math.cos(a), tip[1], tip[2] + 0.01 * Math.sin(a)],
        [tip[0] + 0.04 * Math.cos(a), tip[1] + 0.005, tip[2] + 0.04 * Math.sin(a)],
      ],
      [0.016, 0],
      { color: GOLD, bone: root, caps: "point", sides: 5, name: "ribKnob" },
    );
  }
  glow(place(new THREE.IcosahedronGeometry(0.07, 1).translate(...S(SX, 1.25)), TEAL, { name: "soulOrb" }), 1.4);
  glow(place(new THREE.IcosahedronGeometry(0.038, 0).translate(...S(SX, 1.25, 0.04)), MINT, { name: "soulCore" }), 1.6);

  // ---- skull -------------------------------------------------------------------------------------------------
  const skull = b.loft(
    [
      { at: S(-0.2, 1.97), w: 0.1, h: 0.12 },
      { at: S(-0.12, 2.0), w: 0.19, h: 0.2 },
      { at: S(0.0, 2.0), w: 0.19, h: 0.19 },
      { at: S(0.1, 1.975), w: 0.13, h: 0.13 },
      { at: S(0.22, 1.955), w: 0.1, h: 0.095 },
      { at: S(0.33, 1.945), w: 0.09, h: 0.075 },
    ],
    { color: BONEP, bone: root, sides: 8, name: "skull" },
  );

  // lower jaw, hinged open at 34 degrees
  const H: [number, number] = [-0.02, 1.885];
  const dj: [number, number] = [Math.cos((34 * Math.PI) / 180), -Math.sin((34 * Math.PI) / 180)];
  const nj: [number, number] = [-dj[1], dj[0]]; // up-ish normal
  const jp = (u: number): V => S(H[0] + dj[0] * u, H[1] + dj[1] * u);
  b.loft(
    [
      { at: jp(0), w: 0.13, h: 0.065 },
      { at: jp(0.11), w: 0.105, h: 0.06 },
      { at: jp(0.23), w: 0.085, h: 0.05 },
      { at: jp(0.35), w: 0.07, h: 0.042 },
    ],
    { color: BONEP, bone: root, sides: 8, name: "jaw" },
  );

  // teeth
  const teeth: G[] = [];
  const widthAt = (x: number) => (x < 0.1 ? 0.065 : 0.065 - ((x - 0.1) / 0.23) * 0.02);
  for (let i = 0; i < 7; i++) {
    const x = 0.04 + i * 0.045;
    const big = i === 5;
    for (const s of [1, -1])
      teeth.push(
        cone(S(x, 1.915, s * (widthAt(x) - 0.012)), [0, -1, s * 0.12], big ? 0.085 : 0.045 + (i % 2) * 0.01, big ? 0.018 : 0.012, 5),
      );
  }
  for (let i = 0; i < 6; i++) {
    const u = 0.08 + i * 0.05;
    const topc = jp(u);
    const hw = 0.045 - u * 0.05;
    for (const s of [1, -1])
      teeth.push(
        cone(
          [topc[0] + nj[0] * 0.02, topc[1] + nj[1] * 0.02, s * hw],
          [0.15, 1, s * 0.08],
          i === 3 ? 0.08 : 0.045,
          i === 3 ? 0.017 : 0.011,
          5,
        ),
      );
  }
  place(merge(teeth), BONE, { name: "teeth" });

  // soul glow in the throat
  glow(place(new THREE.IcosahedronGeometry(0.032, 0).translate(...S(0.0, 1.88)), TEAL, { name: "throatSoul" }), 1.5);

  // eyes
  const sockets: G[] = [];
  const eyes: G[] = [];
  const noses: G[] = [];
  for (const s of [1, -1]) {
    sockets.push(new THREE.SphereGeometry(0.042, 8, 6).scale(1.35, 0.85, 0.7).translate(...S(0.055, 1.99, s * 0.082)));
    eyes.push(new THREE.SphereGeometry(0.024, 6, 5).scale(1.4, 0.8, 0.6).translate(...S(0.065, 1.99, s * 0.09)));
    noses.push(new THREE.SphereGeometry(0.014, 6, 4).translate(...S(0.31, 1.962, s * 0.026)));
  }
  place(merge(sockets), INK, { name: "eyeSockets" });
  glow(place(merge(eyes), MINT, { name: "eyes" }), 1.6);
  place(merge(noses), INK, { name: "nostrils" });

  // brow ridges, nose horn, crest, cheek spikes
  const hornBits: G[] = [];
  for (const s of [1, -1]) {
    hornBits.push(cone(S(0.02, 2.06, s * 0.075), [0.35, 0.8, s * 0.6], 0.11, 0.022, 5));
    hornBits.push(cone(S(0.11, 2.03, s * 0.055), [0.5, 0.7, s * 0.4], 0.075, 0.017, 5));
    hornBits.push(cone(S(-0.03, 1.935, s * 0.1), [-0.3, 0.1, s], 0.1, 0.02, 5));
    hornBits.push(cone(S(0.0, 1.915, s * 0.095), [0.2, -0.5, s * 0.9], 0.065, 0.015, 5));
  }
  hornBits.push(cone(S(0.24, 1.995, 0), [0.4, 1, 0], 0.095, 0.026, 5));
  [
    [-0.16, 2.08, 0.1],
    [-0.09, 2.105, 0.09],
    [-0.02, 2.1, 0.07],
    [0.05, 2.08, 0.055],
  ].forEach(([x, y, l]) => hornBits.push(cone(S(x, y, 0), [-0.55, 0.85, 0], l, 0.02, 5)));
  place(merge(hornBits), BONEP, { name: "skullSpikes" });

  // big swept horns, gold collared
  for (const s of [1, -1]) {
    const p0 = S(-0.1, 2.07, s * 0.07);
    const horn = b.sweep(bezier(p0, S(-0.34, 2.28, s * 0.17), S(-0.58, 2.2, s * 0.24), S(-0.66, 1.98, s * 0.2)), [0.036, 0.004], {
      bands: [
        [0.1, GOLD],
        [0.14, GOLD_DK],
        [1, BONEP],
      ],
      bone: root,
      caps: "point",
      sides: 6,
      name: "horn",
    });
    const hb = horn.at(0.5);
    void hb;
    // little secondary horn
    b.sweep(bezier(S(-0.13, 2.0, s * 0.09), S(-0.3, 2.06, s * 0.19), S(-0.4, 1.99, s * 0.24), S(-0.42, 1.88, s * 0.24)), [0.024, 0.003], {
      color: BONEP,
      bone: root,
      caps: "point",
      sides: 6,
      name: "hornLow",
    });
    // soul frill
    b.extrude(
      [
        [-0.06, 1.97],
        [-0.25, 2.04, "sharp"],
        [-0.14, 1.955],
        [-0.34, 1.92, "sharp"],
        [-0.14, 1.9],
        [-0.28, 1.82, "sharp"],
        [-0.05, 1.87],
      ],
      { at: [DX, 0, s * 0.105], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, color: VIO_LT, bone: root, name: "frill" },
    );
  }
  place(merge([cyl(S(-0.12, 1.84), 0.052, 0.05, 0.03, 10), ringH(S(-0.12, 1.825), 0.052, 0.008)]), GOLD, { name: "neckCap" });

  // ---- blade -------------------------------------------------------------------------------------------------
  const centre = catmull(
    [
      S(0.12, 1.855),
      S(0.4, 1.865),
      S(0.74, 1.965),
      S(1.02, 1.905),
      S(1.2, 1.72),
      S(1.28, 1.5),
    ],
    {},
  );
  const NS = 44;
  const half = (t: number) => {
    const ramp = smoothstep(0, 0.34, t);
    const taper = Math.pow(1 - t, 0.75);
    return { e: (0.03 + 0.135 * ramp) * taper, sp: (0.026 + 0.034 * ramp) * Math.pow(1 - t, 0.8) };
  };
  const frameAt = (t: number) => {
    const P = centre.at(t);
    const T = centre.tangentAt(t);
    const l = Math.hypot(T.x, T.y) || 1;
    return { P, tx: T.x / l, ty: T.y / l, nx: T.y / l, ny: -T.x / l }; // N points to the cutting edge (down/in)
  };
  const spine2: [number, number][] = [];
  const edge2: [number, number][] = [];
  for (let i = 0; i <= NS; i++) {
    const t = i / NS;
    const f = frameAt(t);
    const w = half(t);
    spine2.push([f.P.x - f.nx * w.sp, f.P.y - f.ny * w.sp]);
    edge2.push([f.P.x + f.nx * w.e, f.P.y + f.ny * w.e]);
  }
  const dseg = (x: number, y: number, pts: [number, number][]) => {
    let best = 1e9;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(x - (ax + dx * t), y - (ay + dy * t)));
    }
    return best;
  };
  const BLADE = paint((p, n) => {
    if (Math.abs(n.z) < 0.6) return mix(BONE, BONE_SH, 0.4);
    const ds = dseg(p.x, p.y, spine2);
    const de = dseg(p.x, p.y, edge2);
    if (ds < 0.022) return mix(BONE, BONE_SH, noise(p, 0.05, 3));
    if (de < 0.016) return mix(BONE, BONE_SH, noise(p, 0.05, 5) * 0.7);
    if (de < 0.024) return TEAL;
    const base = mix(VIO_DK, VIO, noise(p, 0.12, 9));
    const veins = cells(p, 0.13, 5);
    if (veins.d2 - veins.d1 < 0.05) return mix(base, VIO_LT, 0.75);
    if (de < 0.06) return mix(base, "#14a89f", smoothstep(0.06, 0.024, de) * 0.8);
    return mix(base, VIO_LT, smoothstep(0.04, 0.0, Math.abs(ds - 0.04)) * 0.35);
  });
  const outline: ([number, number] | [number, number, "sharp"])[] = [];
  for (let i = 0; i < NS; i++) outline.push(spine2[i]);
  outline.push([edge2[NS][0], edge2[NS][1], "sharp"]);
  for (let i = NS - 1; i >= 0; i--) outline.push(edge2[i]);
  const blade = b.extrude(outline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    bevel: 0.008,
    detail: 1,
    color: BLADE,
    bone: root,
    name: "blade",
  });

  // spectral flame edge: sawtooth tongues swept toward the tip
  const flame: [number, number][] = [];
  const TEETH = 10;
  const t0 = 0.26;
  for (let j = 0; j <= TEETH; j++) {
    const ta = t0 + ((0.97 - t0) * j) / TEETH;
    const fa = frameAt(ta);
    const wa = half(ta);
    flame.push([fa.P.x + fa.nx * (wa.e + 0.006), fa.P.y + fa.ny * (wa.e + 0.006)]);
    if (j < TEETH) {
      const tb = ta + ((0.97 - t0) / TEETH) * 0.8;
      const fb = frameAt(tb);
      const wb = half(tb);
      const out = 0.075 * Math.pow(1 - tb, 0.55) + 0.02;
      flame.push([fb.P.x + fb.nx * (wb.e + out), fb.P.y + fb.ny * (wb.e + out)]);
    }
  }
  const tipP = frameAt(1);
  flame.push([tipP.P.x + tipP.tx * 0.03, tipP.P.y + tipP.ty * 0.03]);
  for (let j = TEETH; j >= 0; j--) {
    const ta = t0 + ((0.97 - t0) * j) / TEETH;
    const fa = frameAt(ta);
    const wa = half(ta);
    flame.push([fa.P.x + fa.nx * wa.e * 0.55, fa.P.y + fa.ny * wa.e * 0.55]);
  }
  glow(
    b.extrude(flame, {
      at: [0, 0, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: TEAL,
      bone: root,
      name: "soulEdge",
    }),
    1.4,
  );

  // gold spine cap and bone teeth along the spine
  const spine3 = spine2.slice(8, NS - 1).map(([x, y]): [number, number, number] => [x, y, 0]);
  b.sweep(catmull(spine3), [0.021, 0.008], { color: GOLD, bone: root, caps: "round", sides: 6, name: "spineTrim" });
  const spikes: G[] = [];
  for (let k = 0; k < 10; k++) {
    const t = 0.2 + k * 0.07;
    const f = frameAt(t);
    const w = half(t);
    const sx = f.P.x - f.nx * (w.sp + 0.012);
    const sy = f.P.y - f.ny * (w.sp + 0.012);
    const len = 0.1 * Math.pow(1 - t, 0.5) + 0.03;
    spikes.push(cone([sx, sy, 0], [-f.nx * 0.75 + f.tx * 0.65, -f.ny * 0.75 + f.ty * 0.65, 0], len, 0.017 * (1.1 - t), 5));
  }
  place(merge(spikes), BONEP, { name: "spineTeeth" });

  // soul rune decals, both faces
  const RUNES = [0.36, 0.5, 0.64, 0.78];
  for (const t of RUNES) {
    const f = frameAt(t);
    const w = half(t);
    const off = (w.e - w.sp) / 2;
    for (const s of [1, -1])
      glow(
        b.decal(blade, RUNE_COL, {
          at: [f.P.x + f.nx * off, f.P.y + f.ny * off, s * 0.016],
          dir: [0, 0, s],
          up: [f.tx, f.ty, 0],
          size: [0.04 * (1.1 - t), 0.12 * (1.15 - t)],
          segments: 8,
          mirror: s < 0,
          bone: root,
        }),
        1.3,
      );
  }

  // gold clamp where the blade leaves the jaws
  place(
    merge([
      cyl(S(0.355, 1.86), 0.045, 0.045, 0.022, 8).rotateZ(0),
    ]).rotateZ(0),
    GOLD,
    { name: "bladeClampDummy" },
  );

  // ---- soul fire: flames along the spine, skull and plinth; wisps around the blade ----------------------------
  const flameFrames = [];
  for (let k = 0; k < 9; k++) {
    const t = 0.18 + k * 0.085;
    const f = frameAt(t);
    const w = half(t);
    const sx = f.P.x - f.nx * (w.sp + 0.02);
    const sy = f.P.y - f.ny * (w.sp + 0.02);
    flameFrames.push(frame([sx, sy, 0], [-f.nx * 0.6 + f.tx * 0.5, -f.ny * 0.6 + f.ty * 0.5 + 0.2, 0]));
  }
  glow(
    b.cards(flameFrames, FLAME, { size: [0.07, 0.17], flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(5), sink: 0.2 }),
    1.3,
  );
  const skullFlames = [
    frame(S(0.07, 2.025, 0.09), [-0.3, 1, 0.3]),
    frame(S(0.07, 2.025, -0.09), [-0.3, 1, -0.3]),
    frame(S(0.31, 1.99, 0), [0.4, 1, 0]),
    frame(S(-0.1, 2.12, 0), [-0.2, 1, 0]),
  ];
  glow(b.cards(skullFlames, FLAME, { size: [0.05, 0.14], flow: [0, 0, 1], cross: true, vary: 0.2, rng: rng(6) }), 1.3);
  const plinthFlames: ReturnType<typeof frame>[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    plinthFlames.push(frame([PC[0] + 0.31 * Math.sin(a), 0.15, 0.31 * Math.cos(a)], [Math.sin(a) * 0.2, 1, Math.cos(a) * 0.2]));
  }
  glow(b.cards(plinthFlames, FLAME, { size: [0.06, 0.15], flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(8) }), 1.2);

  const wispPts: [number, number, number][] = [
    S(1.06, 1.62, 0.07),
    S(0.92, 1.58, -0.08),
    S(1.18, 1.36, 0.0),
    S(0.78, 1.7, 0.1),
    S(0.6, 1.62, -0.05),
    S(0.5, 1.75, 0.08),
  ];
  const wisps = b.cards(
    wispPts.map((p, i) => frame(p, [0.1 * (i % 2 ? 1 : -1), 1, 0])),
    WISP,
    { size: [0.1, 0.15], flow: [0, 0, 1], cross: true, vary: 0.3, rng: R, sink: 0 },
  );
  glow(wisps, 1.2);

  return b.root;
}
