import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { cells, noise, paint, scales } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Lava Golem",
  description:
    "A towering basalt golem built from hexagonal columns and cracked plates, with molten seams, a glowing pyro core, gold filigree trim, tassels and rising flames.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// Palette
const LAVA_CORE = "#ffe066";
const LAVA = "#ff7a1a";
const EMBER = "#d4380f";
const HOT = "#ffb02e";
const SPARK = "#ffd34a";
const MOUTH = "#ff5a14";
const EYE_GLOW = "#ffe9a0";

const ROCK = cel(scales(["#46415e", "#4f4a69", "#3c3852"], "#241f2f", { size: 0.22, width: 0.1, seed: 3 }));
const PLATE = cel(scales(["#5d5878", "#665f82", "#544f70"], "#2a2538", { size: 0.12, width: 0.12, seed: 9 }));
const GOLD = cel("#f7cf62", "#c8872a");
const OBS = cel("#2b2538", "#16101f");
const TOOTH = cel("#f2e2bd", "#c9b08a");

/** Basalt with glowing cracks on a cellular pattern (cell borders where a noise mask is high). */
function cracked(seed: number, size: number, mask: number) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    if (noise(p, 0.6, seed + 5) > mask) {
      if (e < 0.03) return LAVA_CORE;
      if (e < 0.07) return LAVA;
      if (e < 0.12) return EMBER;
    }
    if (e < 0.1) return "#1c1824";
    return n.y > 0.55 ? PLATE : ROCK;
  });
}
const CRACK_A = cracked(21, 0.36, 0.42);
const CRACK_B = cracked(47, 0.26, 0.46);

// Drawings
const FLAME = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M16 2 C20 16 30 26 29 42 C28 56 22 62 16 62 C10 62 4 56 3 42 C2 30 10 24 12 14 C13 20 15 22 16 2 Z" fill="#ff7a1a"/>
    <path d="M16 22 C19 30 25 36 24 46 C23 56 20 60 16 60 C12 60 8 56 8 46 C8 38 13 34 16 22 Z" fill="#ffc83a"/>
    <path d="M16 38 C18 44 20 48 19 54 C18 58 17 59 16 59 C15 59 14 58 13 54 C12 48 14 44 16 38 Z" fill="#fff4b0"/>
  </svg>`,
  { size: 128 },
);

// Drawn upside down: the card hangs with its drawing bottom (the gold cap) at the belt.
const TASSEL = svg(
  `<svg viewBox="0 0 16 48">
    <path d="M8 36 C2 28 2 14 3 3 M8 36 C6 26 6 12 6 3 M8 36 C10 26 10 12 10 3 M8 36 C14 28 14 14 13 3" stroke="#ff7a1a" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M8 36 L8 30" stroke="#ffd34a" stroke-width="1.6" fill="none"/>
    <rect x="4" y="36" width="8" height="5" rx="1.5" fill="#f7cf62"/>
    <rect x="5" y="41" width="6" height="5" rx="2" fill="#c8872a"/>
  </svg>`,
  { size: 128 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke-linecap="round">
      <circle cx="50" cy="50" r="44" stroke="#5b3410" stroke-width="6"/>
      <circle cx="50" cy="50" r="44" stroke="#f6cf6a" stroke-width="2.6"/>
      <circle cx="50" cy="50" r="30" stroke="#5b3410" stroke-width="5"/>
      <circle cx="50" cy="50" r="30" stroke="#f6cf6a" stroke-width="2.2"/>
      <g id="a" transform="rotate(0 50 50)"><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#5b3410" stroke-width="6"/><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#f6cf6a" stroke-width="2.4"/></g>
      <g transform="rotate(90 50 50)"><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#5b3410" stroke-width="6"/><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#f6cf6a" stroke-width="2.4"/></g>
      <g transform="rotate(180 50 50)"><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#5b3410" stroke-width="6"/><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#f6cf6a" stroke-width="2.4"/></g>
      <g transform="rotate(270 50 50)"><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#5b3410" stroke-width="6"/><path d="M50 20 C64 20 72 32 64 42 C58 48 50 44 52 38" stroke="#f6cf6a" stroke-width="2.4"/></g>
    </g>
    <polygon points="50,38 60,50 50,62 40,50" fill="#5b3410"/>
    <polygon points="50,41 57,50 50,59 43,50" fill="#f6cf6a"/>
    <circle cx="50" cy="50" r="4" fill="#ff7a1a"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="29" fill="#5b3410"/>
    <circle cx="32" cy="32" r="26" fill="#f7cf62"/>
    <circle cx="32" cy="32" r="21" fill="#3a1608"/>
    <path d="M32 11 C36 20 45 26 44 38 C43 48 38 53 32 53 C26 53 21 48 20 38 C19 30 26 26 28 19 C29 24 31 26 32 11 Z" fill="#ff7a1a"/>
    <path d="M32 28 C35 34 39 38 38 44 C37 49 35 51 32 51 C29 51 27 49 26 44 C26 39 30 36 32 28 Z" fill="#ffd34a"/>
  </svg>`,
  { size: 128 },
);

const BROW: OutlinePoint[] = [
  [-0.02, 0],
  [0.17, 0.035],
  [0.18, 0.09],
  [-0.02, 0.06],
];
const EYE: OutlinePoint[] = [
  [-0.075, -0.02],
  [0.0, 0.015],
  [0.085, 0.05],
  [0.07, -0.005],
  [0.0, -0.03],
];
const CLOTH: OutlinePoint[] = [
  [-0.08, 0],
  [0.08, 0],
  [0.07, -0.34],
  [0, -0.41],
  [-0.07, -0.34],
];

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const rand = rng(11);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, 0],
      [0, 1.5, 0.04],
      [0, 2.0, 0.08],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const torsoBone = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.15, 0.1],
      [0, 2.3, 0.17],
      [0, 2.45, 0.26],
    ]),
    { parent: chest, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.42, 0.3], aim: [0, 2.36, 0.62], role: "jaw" });

  // helper: hexagonal basalt column with an optional lava pool on top
  const col = (bone: Joint, base: number[], dir: number[], len: number, r: number, color: Fill, pool = true) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const c = new THREE.Vector3(base[0], base[1], base[2]).addScaledVector(d, len / 2);
    b.part(new THREE.CylinderGeometry(r * 0.9, r, len, 6), color, { at: c, dir: d, bone, flat: true });
    if (pool) {
      const top = new THREE.Vector3(base[0], base[1], base[2]).addScaledVector(d, len + 0.004);
      glow(b.part(new THREE.CylinderGeometry(r * 0.68, r * 0.68, 0.012, 6), LAVA, { at: top, dir: d, bone, flat: true }));
    }
  };

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.95, 0], w: 0.8, h: 0.55 },
      { at: [0, 1.3, 0.02], w: 0.72, h: 0.55 },
      { at: [0, 1.7, 0.06], w: 1.3, h: 0.85 },
      { at: [0, 2.05, 0.08], w: 1.45, h: 0.8 },
      { at: [0, 2.25, 0.08], w: 1.0, h: 0.6 },
    ],
    { bone: [hips, spine], caps: "flat", color: CRACK_A, sides: 10 },
  );
  const skin = b.surface(torso);

  // chest core
  glow(b.part(new THREE.SphereGeometry(0.16, 8, 6), HOT, { at: [0, 1.78, 0.47], bone: torsoBone }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), LAVA_CORE, { at: [0, 1.78, 0.58], bone: torsoBone }), 2);
  b.part(new THREE.TorusGeometry(0.2, 0.03, 5, 12), GOLD, { at: [0, 1.78, 0.5], bone: torsoBone });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    b.spike([dx * 0.21, 1.78 + dy * 0.21, 0.5], [dx, dy, 0.25], 0.1, 0.028, { color: GOLD, bone: torsoBone });
  }
  // pectorals
  for (const s of [1, -1]) {
    b.part(new THREE.IcosahedronGeometry(0.26, 0), CRACK_B, {
      at: [s * 0.4, 1.96, 0.38],
      bone: torsoBone,
      scale: [1, 0.75, 0.65],
      flat: true,
    });
  }
  // lava veins draped over the chest
  for (const s of [1, -1]) {
    const veins = [
      [[s * 0.12, 1.8, 0.52], [s * 0.35, 1.9, 0.47], [s * 0.6, 2.05, 0.35], [s * 0.7, 2.15, 0.15]],
      [[s * 0.1, 1.65, 0.5], [s * 0.25, 1.4, 0.38], [s * 0.3, 1.15, 0.3]],
      [[s * 0.05, 1.95, 0.5], [s * 0.12, 2.15, 0.4], [s * 0.2, 2.3, 0.3]],
      [[s * 0.15, 1.7, 0.5], [s * 0.5, 1.6, 0.42], [s * 0.64, 1.45, 0.3]],
    ];
    for (const v of veins)
      glow(b.sweep(skin.drape(catmull(v), { lift: 0.012 }), [0.026, 0.012], { color: LAVA, sides: 5 }), 1.3);
  }
  // abdominal plates with a molten gap
  for (const s of [1, -1])
    for (let r = 0; r < 3; r++)
      b.part(new THREE.BoxGeometry(0.26, 0.11, 0.08), PLATE, { at: [s * 0.14, 1.2 + r * 0.14, 0.27], bone: torsoBone, flat: true });
  glow(b.rod([0, 1.13, 0.28], [0, 1.55, 0.29], 0.02, { color: LAVA, sides: 5, bone: torsoBone }), 1.2);

  // gold bands round the torso
  b.sweep(skin.loop([0, 1.12, 0], { lift: 0.03 }), 0.05, { color: GOLD, sides: 6 });
  glow(b.sweep(skin.loop([0, 1.2, 0], { lift: 0.012 }), 0.02, { color: LAVA, sides: 5 }), 1.2);
  b.sweep(skin.loop([0, 1.55, 0], { lift: 0.02 }), 0.03, { color: GOLD, sides: 6 });
  b.sweep(skin.loop([0, 2.18, 0], { lift: 0.025 }), 0.04, { color: GOLD, sides: 6 });

  // belt buckle with emblem, loincloth plates, tassels
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.04), GOLD, { at: [0, 1.12, 0.32], bone: hips, rotation: [0, 0, 45] });
  b.part(new THREE.PlaneGeometry(0.19, 0.19), "#ffffff", { at: [0, 1.12, 0.345], bone: hips, texture: EMBLEM });
  for (const x of [-0.17, 0, 0.17]) {
    const z = x === 0 ? 0.33 : 0.3;
    b.extrude(CLOTH, { at: [x, 1.06, z], x: [1, 0, 0], thickness: 0.04, color: CRACK_B, bone: hips });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), GOLD, { at: [x, 1.04, z + 0.03], bone: hips });
  }
  for (const x of [-0.17, 0, 0.17])
    b.extrude(CLOTH, { at: [x, 1.06, -0.3], x: [-1, 0, 0], thickness: 0.04, color: CRACK_B, bone: hips });
  const tasselFrames = [
    frame([0.4, 1.08, 0.12], [0, 1, 0]),
    frame([-0.4, 1.08, 0.12], [0, 1, 0]),
    frame([0.32, 1.08, 0.24], [0, 1, 0]),
    frame([-0.32, 1.08, 0.24], [0, 1, 0]),
  ];
  b.cards(tasselFrames, TASSEL, { size: [0.09, 0.34], lean: 180, flow: [0, 0, 1], bone: hips });

  // armour studs
  for (const hit of skin.scatter(26, { rng: rand, minDist: 0.17, filter: (h) => h.n.y > -0.4 }))
    b.stick(new THREE.CylinderGeometry(0.07, 0.085, 0.07, 6), PLATE, hit, { embed: 0.35 });

  // dorsal basalt columns
  const backYs = [1.35, 1.6, 1.85, 2.1];
  const backZs = [-0.2, -0.28, -0.3, -0.26];
  const backLens = [0.22, 0.3, 0.36, 0.3];
  const backRs = [0.08, 0.1, 0.11, 0.09];
  backYs.forEach((y, i) => col(torsoBone, [0, y, backZs[i]], [0, 0.6, -0.8], backLens[i], backRs[i], CRACK_B));
  for (const s of [1, -1]) {
    col(torsoBone, [s * 0.3, 1.8, -0.27], [s * 0.4, 0.6, -0.8], 0.26, 0.08, CRACK_B);
    col(torsoBone, [s * 0.34, 2.05, -0.22], [s * 0.5, 0.7, -0.6], 0.24, 0.07, CRACK_B);
  }
  b.cards(
    [frame([0, 2.3, -0.22], [0, 1, 0]), frame([0.3, 2.3, -0.18], [0, 1, 0]), frame([-0.3, 2.3, -0.18], [0, 1, 0])],
    FLAME,
    { size: [0.22, 0.6], lean: 8, flow: [0, 0, -1], bend: 20, cross: true, vary: 0.25, spin: 15, rng: rand, bone: torsoBone },
  );

  // ---------------------------------------------------------------- neck & head
  b.sweep(neck, [0.19, 0.16, 0.16], { color: CRACK_A });
  b.part(new THREE.TorusGeometry(0.21, 0.035, 5, 12), GOLD, { at: [0, 2.22, 0.13], dir: [0, 1, 0], axis: "z", bone: neck.joints[0] });

  b.part(new THREE.BoxGeometry(0.6, 0.38, 0.52), CRACK_B, { at: [0, 2.58, 0.33], bone: head, flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.08, 0.4), PLATE, { at: [0, 2.79, 0.27], bone: head, rotation: [-10, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.64, 0.04, 0.56), GOLD, { at: [0, 2.725, 0.33], bone: head });
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), EMBER, { at: [0, 2.725, 0.62], bone: head, scale: [0.8, 1.3, 0.5] }), 1.6);
  for (const s of [1, -1]) {
    glow(
      b.extrude(EYE, { at: [s * 0.13, 2.54, 0.6], x: [s, 0, 0], thickness: 0.02, color: EYE_GLOW, bone: head }),
      1.6,
    );
    b.extrude(BROW, { at: [0, 2.6, 0.585], x: [s, 0, 0], thickness: 0.07, color: OBS, bone: head });
    col(head, [s * 0.3, 2.55, 0.3], [s, 0.3, -0.5], 0.26, 0.07, CRACK_B);
    col(head, [s * 0.25, 2.7, 0.2], [s * 0.4, 1, -0.3], 0.2, 0.05, CRACK_B);
    // horns with gold rings
    const horn = bezier([s * 0.2, 2.7, 0.3], [s * 0.45, 2.8, 0.2], [s * 0.5, 2.95, -0.1]);
    b.sweep(horn, [0.08, 0], { bone: head, color: OBS, caps: { start: "flat", end: "point" }, sides: 6 });
    for (const t of [0.2, 0.4]) {
      b.part(new THREE.TorusGeometry(0.075 * (1 - t * 0.8), 0.016, 4, 8), GOLD, {
        at: horn.at(t),
        dir: horn.tangentAt(t),
        axis: "z",
        bone: head,
      });
    }
  }

  // jaw with teeth, tusks and a molten mouth
  b.part(new THREE.BoxGeometry(0.54, 0.14, 0.42), CRACK_B, { at: [0, 2.32, 0.49], bone: jaw, flat: true });
  glow(b.part(new THREE.BoxGeometry(0.44, 0.03, 0.36), MOUTH, { at: [0, 2.385, 0.47], bone: jaw }), 1.4);
  for (let i = 0; i < 6; i++) {
    const x = -0.2 + i * 0.08;
    b.spike([x, 2.39, 0.57], [0, -1, 0], 0.07, 0.025, { color: TOOTH, bone: head, sides: 5 });
    b.spike([x + 0.04, 2.392, 0.65], [0, 1, 0], 0.06, 0.022, { color: TOOTH, bone: jaw, sides: 5 });
  }
  for (const s of [1, -1]) b.spike([s * 0.2, 2.3, 0.66], [s * 0.1, 1, 0.2], 0.22, 0.045, { color: TOOTH, bone: jaw, sides: 6 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = [s * 0.72, 2.0, 0.0];
    const el = [s * 1.08, 1.42, 0.06];
    const wr = [s * 1.28, 0.86, 0.18];
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const hand = arm.tip!;
    const armTube = b.sweep(arm, [0.2, 0.2, 0.18, 0.28, 0.3], { color: CRACK_A });
    glow(b.sweep(armTube.line(0, 0.01), 0.018, { color: LAVA, bone: arm, sides: 5 }), 1.3);
    for (const hit of b.surface(armTube).scatter(12, { rng: rand, minDist: 0.15, filter: (h) => h.n.y > -0.5 }))
      b.stick(new THREE.CylinderGeometry(0.06, 0.075, 0.06, 6), PLATE, hit, { embed: 0.35 });

    // pauldron: rock mass, column fan, gold ring, filigree
    const pauldron = b.part(new THREE.IcosahedronGeometry(0.36, 0), CRACK_B, {
      at: [s * 0.8, 2.12, 0],
      bone: shoulder,
      scale: [1.15, 0.85, 1.0],
      flat: true,
    });
    const fan: Array<[number[], number[], number, number]> = [
      [[s * 0.62, 2.36, 0.0], [s * 0.1, 1, 0], 0.3, 0.08],
      [[s * 0.8, 2.38, 0.12], [s * 0.2, 1, 0.2], 0.24, 0.07],
      [[s * 0.8, 2.38, -0.12], [s * 0.2, 1, -0.2], 0.26, 0.07],
      [[s * 0.98, 2.3, 0.0], [s * 0.5, 1, 0], 0.26, 0.07],
      [[s * 0.72, 2.36, 0.0], [0, 1, 0], 0.4, 0.09],
    ];
    for (const [base, dir, len, r] of fan) col(shoulder, base, dir, len, r, CRACK_B);
    b.part(new THREE.TorusGeometry(0.36, 0.035, 5, 12), GOLD, { at: [s * 0.8, 2.3, 0], dir: [0, 1, 0], axis: "z", bone: shoulder });
    b.decal(pauldron, FILIGREE, { at: [s * 1.2, 2.14, 0], dir: [s, 0, 0], size: [0.4, 0.4], segments: 8 });
    b.cards(
      [frame([s * 0.7, 2.5, 0.05], [0, 1, 0]), frame([s * 0.9, 2.45, -0.05], [0, 1, 0]), frame([s * 0.8, 2.5, 0.15], [0, 1, 0])],
      FLAME,
      { size: [0.2, 0.5], lean: 6, flow: [0, 0, -1], bend: 15, cross: true, vary: 0.3, spin: 20, rng: rand, bone: shoulder },
    );

    // elbow spike, wrist cuff
    b.spike([el[0] + s * 0.1, el[1], el[2] - 0.1], [s * 0.7, 0.2, -1], 0.3, 0.09, { color: OBS, bone: elbow, sides: 6 });
    const fa = new THREE.Vector3(wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]).normalize();
    b.part(new THREE.TorusGeometry(0.32, 0.04, 5, 12), GOLD, { at: [s * 1.26, 0.95, 0.17], dir: fa, axis: "z", bone: elbow });
    b.part(new THREE.TorusGeometry(0.26, 0.03, 5, 12), GOLD, { at: [s * 1.17, 1.15, 0.12], dir: fa, axis: "z", bone: elbow });

    // fist
    b.part(new THREE.IcosahedronGeometry(0.27, 0), CRACK_B, { at: [s * 1.3, 0.7, 0.2], bone: hand, scale: [0.9, 1.0, 1.15], flat: true });
    col(hand, [s * 1.45, 0.8, 0.12], [s, 0.4, 0], 0.18, 0.06, CRACK_B);
    col(hand, [s * 1.45, 0.78, 0.3], [s, 0.4, 0], 0.18, 0.06, CRACK_B);
    for (let i = 0; i < 4; i++) {
      const z = 0.2 - 0.15 + 0.1 * i;
      const f = b.chain(
        `finger${S}${i}`,
        polyline([
          [s * 1.3, 0.5, z],
          [s * 1.28, 0.38, z + 0.01],
          [s * 1.24, 0.27, z + 0.05],
        ]),
        { parent: hand, names: [`finger${S}${i}a`, `finger${S}${i}b`, `finger${S}${i}c`], role: "digit" },
      );
      b.sweep(f, [0.06, 0.052, 0.045], { color: CRACK_B, sides: 6 });
    }
    const th = b.chain(
      `thumb${S}`,
      polyline([
        [s * 1.12, 0.66, 0.3],
        [s * 1.08, 0.58, 0.4],
        [s * 1.06, 0.5, 0.47],
      ]),
      { parent: hand, names: [`thumb${S}a`, `thumb${S}b`, `thumb${S}c`], role: "digit" },
    );
    b.sweep(th, [0.07, 0.055, 0.045], { color: CRACK_B, sides: 6 });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.3, 1.0, 0], [s * 0.36, 0.2, 0.02], [0.46, 0.46], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.36, 0, 0.1],
    });
    const knee = leg.joints[1];
    const foot = leg.tip!;
    const legTube = b.sweep(leg, [0.26, 0.21, 0.2], { color: CRACK_A });
    glow(b.sweep(legTube.line(0, 0.01), 0.02, { color: LAVA, bone: leg, sides: 5 }), 1.3);
    for (const hit of b.surface(legTube).scatter(10, { rng: rand, minDist: 0.16, filter: (h) => h.n.y > -0.5 }))
      b.stick(new THREE.CylinderGeometry(0.06, 0.075, 0.06, 6), PLATE, hit, { embed: 0.35 });
    const kp = pts[1];
    b.part(new THREE.IcosahedronGeometry(0.17, 0), CRACK_B, { at: [kp.x, kp.y, kp.z + 0.14], bone: knee, scale: [1, 0.9, 0.8], flat: true });
    b.spike([kp.x, kp.y, kp.z + 0.26], [0, 0.2, 1], 0.14, 0.05, { color: OBS, bone: knee, sides: 6 });
    b.part(new THREE.TorusGeometry(0.22, 0.035, 5, 12), GOLD, { at: [s * 0.36, 0.34, 0.01], dir: [0, 1, 0], axis: "z", bone: knee });

    b.part(new THREE.BoxGeometry(0.36, 0.18, 0.56), CRACK_B, { at: [s * 0.36, 0.085, 0.1], bone: foot, flat: true });
    for (const i of [-1, 0, 1])
      b.part(new THREE.CylinderGeometry(0.07, 0.075, 0.2, 6), CRACK_B, {
        at: [s * 0.36 + i * 0.12, 0.07, 0.42],
        dir: [0, 0, 1],
        bone: foot,
        flat: true,
      });
    glow(b.rod([s * 0.36, 0.185, 0.0], [s * 0.36, 0.175, 0.45], 0.012, { color: LAVA, bone: foot, sides: 5 }), 1.2);
    b.spike([s * 0.36, 0.14, -0.15], [0, 0.4, -1], 0.14, 0.06, { color: OBS, bone: foot, sides: 6 });
  }

  // ---------------------------------------------------------------- floating embers
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const r = 1.5 + rand() * 0.5;
    const y = 0.8 + rand() * 2.1;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03 + rand() * 0.02, 0), SPARK, {
        at: [Math.cos(a) * r, y, Math.sin(a) * r],
        bone: hips,
        rotation: [rand() * 90, rand() * 90, 0],
      }),
      1.5,
    );
  }

  return b.root;
}
