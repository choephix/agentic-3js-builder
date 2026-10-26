```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith",
  description:
    "Warcraft-style stocky dwarf smith in a horned iron helm with a braided auburn beard, leather apron and pauldrons, hammer and tongs at a stump-mounted anvil with a glowing ingot.",
};

// Palette (top level so stage 2 can use it by name)
export const SKIN = "#d9936a";
export const SKIN_DARK = "#b9714f";
export const BLUSH = "#e47a5e";
export const BEARD = "#c0622a";
export const BEARD_LIGHT = "#e8903f";
export const BEARD_DARK = "#7a3516";
export const SHIRT = "#3d5a80";
export const SHIRT_DARK = "#2b405e";
export const PANTS = "#4a3a2e";
export const LEATHER = "#6b4226";
export const LEATHER_DARK = "#3f2616";
export const STEEL = "#8d96a3";
export const STEEL_DARK = "#4f5662";
export const STEEL_LIGHT = "#c3cad4";
export const BRASS = "#c9973a";
export const WOOD = "#8a5a30";
export const WOOD_DARK = "#5e3b1e";
export const EMBER = "#ff7a1a";
export const HOT = "#ffcf5a";
export const BONE = "#e6dcc0";
export const WHITE = "#f4efe4";
export const DARK = "#1c1410";
export const LENS = "#5fd0ff";

export const REQUESTS = [
  {
    id: "anvilMakerMark",
    kind: "add",
    part: "anvilWaist",
    what: "Maker's emblem on the anvil's front waist: a raised brass hammer-and-crown crest in a small shield plate, with four rivets. Colours BRASS, STEEL_DARK.",
    at: [0, 0.67, 0.82],
    normal: [0, 0, 1],
    bone: "hips",
    room: [0.16, 0.12, 0.04],
  },
  {
    id: "apronPocket",
    kind: "add",
    part: "apron",
    what: "Tool pocket on the lower apron: a stitched LEATHER_DARK pouch with flap, brass rivets, and the handles of a small chisel and file poking out.",
    at: [-0.1, 0.58, 0.33],
    normal: [0, 0, 1],
    bone: "spine",
    room: [0.18, 0.18, 0.06],
  },
  {
    id: "hammerRunes",
    kind: "add",
    part: "hammerHead",
    what: "Glowing EMBER dwarven runes inlaid on both faces of the hammer head, a brass band at each end, and a wrapped leather grip with a pommel cap on the handle.",
    at: [-0.4, 1.14, 0.55],
    normal: [0, 0, 1],
    bone: "handR",
    room: [0.3, 0.16, 0.16],
  },
  {
    id: "pauldronSpikes",
    kind: "add",
    part: "pauldronL",
    what: "Ornament for both pauldrons: a ring of three or four STEEL_LIGHT cone spikes, rivet studs round the rim and a brass trim band.",
    at: [0.37, 1.31, 0],
    normal: [0, 1, 0],
    bone: "chest",
    room: [0.28, 0.14, 0.28],
  },
  {
    id: "beltBuckle",
    kind: "add",
    part: "belt",
    what: "Big square brass belt buckle with an embossed anvil emblem, plus small hanging pouch, ring and key on the belt sides.",
    at: [0, 0.76, 0.34],
    normal: [0, 0, 1],
    bone: "hips",
    room: [0.18, 0.14, 0.05],
  },
  {
    id: "helmCrest",
    kind: "add",
    part: "helmet",
    what: "Crest on top of the helm: a ridge fin of BEARD_DARK bristles from front to back, with a brass cap plate and rivets along its base.",
    at: [0, 1.66, 0.05],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.1, 0.14, 0.36],
  },
  {
    id: "tongsJaws",
    kind: "add",
    part: "ingot",
    what: "Tongs detail where the tongs grip the ingot: shaped STEEL_DARK jaws, a pivot rivet and curved ends. Plus a few extra glowing HOT sparks drifting above.",
    at: [0.12, 0.87, 0.72],
    normal: [0, 1, 0],
    bone: "handL",
    room: [0.2, 0.1, 0.12],
  },
  {
    id: "stumpHoopsAxe",
    kind: "add",
    part: "stump",
    what: "Details on the anvil stump front: a hatchet buried in the top edge, wood chips and chisel nicks, scorch-black patches, and iron nails on the hoops.",
    at: [0, 0.3, 1.02],
    normal: [0, 0, 1],
    bone: "hips",
    room: [0.5, 0.5, 0.2],
  },
  {
    id: "bootBuckles",
    kind: "add",
    part: "bootL",
    what: "Straps on both boots: two BRASS buckled straps across the ankle and a folded leather cuff with stitching at the top.",
    at: [0.15, 0.17, 0.08],
    normal: [0, 0, 1],
    bone: "ankleL",
    room: [0.2, 0.12, 0.3],
  },
  {
    id: "beardRings",
    kind: "add",
    part: "beardMain",
    what: "Brass and steel beard rings clasping the braids and the tips of the beard, with a small bone bead on each braid, and two thin extra braids beside the mouth.",
    at: [0, 1.0, 0.25],
    normal: [0, 0, 1],
    bone: "jaw",
    room: [0.4, 0.3, 0.12],
  },
  {
    id: "goggleDetail",
    kind: "add",
    part: "goggles",
    what: "Goggles polish: leather strap round the helm, small brass wing-nuts, lens glass glints and a cracked corner.",
    at: [0, 1.59, 0.2],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.26, 0.1, 0.08],
  },
  {
    id: "apronLeather",
    kind: "texture",
    part: "apron",
    what: "Worn leather: darker scorch and soot blotches near the bottom, hammered grease stains, stitched seams at edges, in LEATHER and LEATHER_DARK.",
  },
  {
    id: "beardHair",
    kind: "texture",
    part: "beardMain",
    what: "Beard hair: long vertical strands in BEARD, BEARD_LIGHT streaks and BEARD_DARK roots, with a few grey-white streaks near the chin.",
  },
  {
    id: "anvilSteel",
    kind: "texture",
    part: "anvilTop",
    what: "Hammered steel face: bright polished centre with dents, dark scorch edges and faint orange heat tint near the middle, in STEEL, STEEL_LIGHT, STEEL_DARK.",
  },
  {
    id: "stumpWood",
    kind: "texture",
    part: "stump",
    what: "Stump: bark grain on the sides in WOOD and WOOD_DARK with moss-free cracks, charred top with ring pattern and hammer dents.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.76, 0], dir: [0, 1, 0.05], role: "spine" });
  const chest = b.joint("chest", { parent: spine, at: [0, 1.0, 0.02], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.25, 0.03], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.3, 0.04], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.34, 0.05], aim: [0, 1.3, 0.2], role: "jaw" });

  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    arms[L] = b.chain(
      `arm${L}`,
      catmull([
        [s * 0.34, 1.18, 0.02],
        [s * 0.46, 1.0, 0.1],
        [s * 0.4, 0.82, 0.3],
      ]),
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" },
    );
    legs[L] = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.14, 0.64, 0],
        [s * 0.15, 0.36, 0.05],
        [s * 0.15, 0.12, 0.02],
        [s * 0.15, 0.06, 0.1],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `toe${L}`], role: "leg" },
    );
  }

  // ---------- torso ----------
  b.part(sph(1, 12, 9), SHIRT, { bone: chest, at: [0, 1.07, 0.02], scale: [0.33, 0.3, 0.26], flat: true });
  b.part(sph(1, 12, 9), SHIRT_DARK, { bone: spine, at: [0, 0.85, 0.04], scale: [0.3, 0.26, 0.27], flat: true });
  b.part(sph(1, 10, 8), PANTS, { bone: hips, at: [0, 0.66, 0], scale: [0.27, 0.15, 0.2], flat: true });
  b.part(cyl(1, 1, 0.07, 14), LEATHER_DARK, { bone: hips, at: [0, 0.76, 0.03], scale: [0.31, 1, 0.3], name: "belt" });
  b.part(box(0.1, 0.08, 0.025), BRASS, { bone: hips, at: [0, 0.76, 0.335], name: "buckle" });
  b.part(box(0.06, 0.04, 0.012), STEEL_DARK, { bone: hips, at: [0, 0.76, 0.35] });
  // apron
  b.extrude(
    [
      [-0.2, 0.42],
      [0.2, 0.42],
      [0.25, 0.8],
      [0.16, 1.0],
      [0.12, 1.15],
      [-0.12, 1.15],
      [-0.16, 1.0],
      [-0.25, 0.8],
    ],
    { at: [0, 0, 0.3], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: LEATHER, bone: spine, name: "apron" },
  );
  b.part(box(0.4, 0.015, 0.04), LEATHER_DARK, { bone: spine, at: [0, 0.43, 0.3] });
  for (const s of [1, -1]) {
    b.rod([s * 0.11, 1.15, 0.3], [s * 0.2, 1.3, 0.04], 0.022, LEATHER_DARK, { bone: chest });
    for (const y of [0.55, 0.8]) b.part(sph(0.012, 6, 4), BRASS, { bone: spine, at: [s * 0.2, y, 0.32] });
  }
  b.part(sph(0.014, 6, 4), BRASS, { bone: chest, at: [0.11, 1.14, 0.32] });
  b.part(sph(0.014, 6, 4), BRASS, { bone: chest, at: [-0.11, 1.14, 0.32] });

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, [0.105, 0.085, 0.07], {
      color: SHIRT,
      bands: [
        [0.5, SHIRT],
        [1, SKIN],
      ],
    });
    // bracer
    b.rod(arm.at(0.68).at, arm.at(0.97).at, 0.085, LEATHER_DARK, { bone: arm.joints[1] });
    b.rod(arm.at(0.68).at, arm.at(0.72).at, 0.092, BRASS, { bone: arm.joints[1] });
    // pauldron
    b.part(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
      bone: chest,
      at: [s * 0.37, 1.24, 0],
      scale: [0.15, 0.1, 0.15],
      rotation: [0, 0, -s * 20],
      name: `pauldron${L}`,
    });
    b.part(cyl(1, 1, 0.025, 12), STEEL_DARK, {
      bone: chest,
      at: [s * 0.37, 1.235, 0],
      scale: [0.155, 1, 0.155],
      rotation: [0, 0, -s * 20],
    });
    // fist
    const w = arm.tip!;
    b.part(sph(0.07, 8, 6), SKIN, { bone: w, at: [s * 0.4, 0.8, 0.31], flat: true });
    b.part(sph(0.03, 6, 4), SKIN_DARK, { bone: w, at: [s * 0.36, 0.82, 0.36] });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, [0.125, 0.105, 0.1, 0.095], {
      color: PANTS,
      bands: [
        [0.55, PANTS],
        [1, LEATHER_DARK],
      ],
    });
    b.part(box(0.17, 0.11, 0.32), LEATHER, { bone: leg.joints[2], at: [s * 0.15, 0.085, 0.06], name: `boot${L}`, flat: true });
    b.part(box(0.18, 0.03, 0.33), DARK, { bone: leg.joints[2], at: [s * 0.15, 0.015, 0.06] });
    b.part(cyl(0.105, 0.11, 0.07, 10), LEATHER, { bone: leg.joints[2], at: [s * 0.15, 0.2, 0.02], flat: true });
    b.part(box(0.13, 0.06, 0.05), STEEL_DARK, { bone: leg.joints[2], at: [s * 0.15, 0.1, 0.23] });
  }

  // ---------- head ----------
  const HC: [number, number, number] = [0, 1.4, 0.06];
  b.part(cyl(0.09, 0.11, 0.08, 8), SKIN_DARK, { bone: neck, at: [0, 1.27, 0.04] });
  b.part(sph(1, 14, 10), SKIN, { bone: head, at: HC, scale: [0.17, 0.16, 0.16], name: "skull", flat: true });
  b.part(sph(1, 10, 8), BEARD_DARK, { bone: head, at: [0, 1.42, -0.06], scale: [0.16, 0.14, 0.12] });
  for (const s of [1, -1]) {
    b.part(sph(1, 8, 6), BLUSH, { bone: head, at: [s * 0.1, 1.35, 0.15], scale: [0.05, 0.04, 0.04] });
    b.part(sph(1, 8, 6), SKIN, { bone: head, at: [s * 0.17, 1.4, 0.04], scale: [0.03, 0.05, 0.04] });
    // eyes
    b.part(sph(0.032, 8, 6), WHITE, { bone: head, at: [s * 0.07, 1.41, 0.195] });
    b.part(sph(0.017, 6, 5), DARK, { bone: head, at: [s * 0.07, 1.41, 0.225] });
    b.part(sph(0.006, 5, 4), WHITE, { bone: head, at: [s * 0.065, 1.418, 0.238] });
    // brows
    b.part(box(0.09, 0.025, 0.035), BEARD_DARK, { bone: head, at: [s * 0.075, 1.46, 0.205], rotation: [0, 0, s * 14] });
  }
  b.part(sph(1, 8, 6), SKIN_DARK, { bone: head, at: [0, 1.365, 0.215], scale: [0.05, 0.045, 0.05], flat: true });
  // helmet
  b.part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    bone: head,
    at: [0, 1.5, 0.05],
    scale: [0.185, 0.16, 0.18],
    name: "helmet",
    flat: true,
  });
  b.part(cyl(1, 1, 0.045, 14), STEEL_DARK, { bone: head, at: [0, 1.495, 0.05], scale: [0.195, 1, 0.19] });
  b.part(cyl(1, 1, 0.012, 14), BRASS, { bone: head, at: [0, 1.52, 0.05], scale: [0.19, 1, 0.185] });
  for (let i = 0; i < 9; i++) {
    const a = (i / 8 - 0.5) * Math.PI * 1.5;
    b.part(sph(0.012, 5, 4), BRASS, { bone: head, at: [Math.sin(a) * 0.19, 1.52, 0.05 + Math.cos(a) * 0.185] });
  }
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.17, 1.52, 0.05], [s * 0.33, 1.52, 0.05], [s * 0.3, 1.72, 0.05]), [0.045, 0.004], {
      color: BONE,
      bone: head,
      caps: { start: "flat", end: "point" },
    });
    b.part(cyl(0.05, 0.05, 0.03, 8), BRASS, { bone: head, at: [s * 0.18, 1.52, 0.05], rotation: [0, 0, 90] });
  }
  // goggles
  for (const s of [1, -1]) {
    b.part(cyl(0.05, 0.05, 0.035, 10), BRASS, { bone: head, at: [s * 0.07, 1.59, 0.2], dir: [0, 0.15, 1], name: "goggles" });
    b.part(cyl(0.036, 0.036, 0.01, 10), LENS, { bone: head, at: [s * 0.07, 1.59, 0.22], dir: [0, 0.15, 1] });
  }
  b.part(box(0.06, 0.015, 0.02), LEATHER_DARK, { bone: head, at: [0, 1.59, 0.19] });

  // mouth, jaw and beard
  b.part(box(0.14, 0.05, 0.14), SKIN_DARK, { bone: jaw, at: [0, 1.31, 0.14], name: "lowerJaw" });
  b.part(box(0.09, 0.02, 0.03), "#7a2a2a", { bone: jaw, at: [0, 1.3, 0.205] });
  b.part(box(0.07, 0.008, 0.012), BONE, { bone: jaw, at: [0, 1.312, 0.215] });
  b.part(sph(1, 12, 9), BEARD, { bone: jaw, at: [0, 1.14, 0.15], scale: [0.2, 0.17, 0.13], name: "beardMain", flat: true });
  for (const s of [1, -1]) {
    b.part(sph(1, 8, 6), BEARD, { bone: jaw, at: [s * 0.13, 1.31, 0.1], scale: [0.06, 0.09, 0.08] });
    b.part(sph(1, 8, 6), BEARD_LIGHT, { bone: jaw, at: [s * 0.09, 1.2, 0.26], scale: [0.04, 0.09, 0.03] });
    b.sweep(
      catmull([
        [0, 1.325, 0.225],
        [s * 0.08, 1.31, 0.235],
        [s * 0.15, 1.33, 0.2],
        [s * 0.19, 1.37, 0.16],
      ]),
      [0.035, 0.01],
      { color: BEARD_LIGHT, bone: head },
    );
    // braids
    const br = catmull([
      [s * 0.11, 1.12, 0.26],
      [s * 0.13, 1.02, 0.3],
      [s * 0.12, 0.92, 0.335],
      [s * 0.12, 0.84, 0.34],
    ]);
    b.sweep(br, [0.038, 0.03], { color: BEARD, bone: jaw });
    for (let i = 0; i < 6; i++) {
      const p = br.at(0.08 + i * 0.16);
      b.part(sph(0.032, 6, 5), i % 2 ? BEARD_DARK : BEARD_LIGHT, { bone: jaw, at: p });
    }
    b.part(cyl(0.04, 0.04, 0.025, 8), BRASS, { bone: jaw, at: [s * 0.12, 0.83, 0.34] });
    b.part(cyl(0.012, 0.03, 0.05, 6), BEARD_DARK, { bone: jaw, at: [s * 0.12, 0.79, 0.34] });
  }
  for (let i = -3; i <= 3; i++) {
    const a = Math.abs(i);
    b.spike([i * 0.05, 1.0 + a * 0.035, 0.2 - a * 0.01], [i * 0.1, -1, 0.4], 0.17 - a * 0.015, 0.045, i % 2 ? BEARD_LIGHT : BEARD, {
      bone: jaw,
    });
  }

  // ---------- stump and anvil ----------
  const AZ = 0.72;
  b.part(cyl(0.3, 0.33, 0.5, 10), WOOD, { bone: hips, at: [0, 0.25, AZ], name: "stump", flat: true });
  for (const y of [0.1, 0.4]) b.part(cyl(0.325, 0.325, 0.03, 10), STEEL_DARK, { bone: hips, at: [0, y, AZ], flat: true });
  b.part(cyl(0.3, 0.3, 0.012, 10), WOOD_DARK, { bone: hips, at: [0, 0.502, AZ] });
  b.part(box(0.36, 0.1, 0.3), STEEL_DARK, { bone: hips, at: [0, 0.55, AZ], name: "anvilBase" });
  b.part(box(0.2, 0.14, 0.2), STEEL, { bone: hips, at: [0, 0.67, AZ], name: "anvilWaist" });
  b.part(box(0.72, 0.09, 0.26), STEEL, { bone: hips, at: [0, 0.785, AZ], name: "anvilTop" });
  b.part(box(0.5, 0.014, 0.25), STEEL_LIGHT, { bone: hips, at: [0.03, 0.832, AZ] });
  b.part(box(0.04, 0.006, 0.04), DARK, { bone: hips, at: [-0.22, 0.836, AZ] });
  b.part(box(0.14, 0.06, 0.22), STEEL_DARK, { bone: hips, at: [-0.4, 0.79, AZ] });
  b.spike([0.34, 0.785, AZ], [1, 0.04, 0], 0.32, 0.055, STEEL, { bone: hips });

  // ingot (glowing), tongs, sparks
  glow(b.part(box(0.24, 0.035, 0.07), EMBER, { bone: hips, at: [0.05, 0.85, AZ], name: "ingot" }), 1.6);
  glow(b.part(box(0.1, 0.037, 0.05), HOT, { bone: hips, at: [0.08, 0.851, AZ] }), 2);
  const tl = arms.L.tip!;
  for (const dz of [-0.018, 0.018]) {
    b.rod([0.4, 0.84, 0.3 + dz], [0.15, 0.872, AZ + dz], 0.012, STEEL_DARK, { bone: tl });
    b.rod([0.4, 0.84, 0.3 + dz], [0.34, 0.84, 0.3 + dz], 0.016, LEATHER_DARK, { bone: tl });
  }
  b.part(sph(0.014, 6, 4), BRASS, { bone: tl, at: [0.3, 0.855, 0.45] });
  const sparks: [number, number, number][] = [
    [0.0, 0.95, 0.68],
    [0.12, 1.02, 0.76],
    [-0.1, 1.08, 0.7],
    [0.2, 0.93, 0.66],
  ];
  sparks.forEach((p, i) => glow(b.part(sph(0.012 + (i % 2) * 0.004, 5, 4), HOT, { bone: hips, at: p }), 2));

  // hammer in right hand
  const hr = arms.R.tip!;
  b.rod([-0.4, 0.78, 0.3], [-0.4, 1.12, 0.54], 0.024, WOOD, { bone: hr });
  b.part(sph(0.03, 6, 4), WOOD_DARK, { bone: hr, at: [-0.4, 0.77, 0.295] });
  b.part(box(0.26, 0.12, 0.12), STEEL, { bone: hr, at: [-0.4, 1.14, 0.55], name: "hammerHead", flat: true });
  for (const s of [1, -1]) {
    b.part(cyl(0.06, 0.07, 0.03, 8), STEEL_DARK, { bone: hr, at: [-0.4 + s * 0.145, 1.14, 0.55], rotation: [0, 0, 90] });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```