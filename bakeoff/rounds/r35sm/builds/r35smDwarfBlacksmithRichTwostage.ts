import * as THREE from "three";
import { type Builder, createBuilder, catmull, bezier, paint, noise, mix, smoothstep, grain, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

const _LEATHER_PAINT = paint((p, n, s) => {
  let c = mix(LEATHER, LEATHER_DARK, 0.25 * noise(p, 0.05, 3));
  const sootAmt = smoothstep(0.75, 0.42, p.y) * 0.8 * (0.5 + noise(p, 0.07, 5));
  c = mix(c, "#2a1a10", Math.min(sootAmt, 0.9));
  c = mix(c, "#1c1410", 0.6 * smoothstep(0.62, 0.8, noise(p, 0.035, 8)) * 0.6);
  c = mix(c, "#8a5a36", 0.25 * smoothstep(0.6, 0.8, noise(p, 0.1, 11)));
  const edge = Math.abs(n.z) > 0.5 ? 0 : 1;
  if (edge) c = mix(c, LEATHER_DARK, 0.5);
  const sx = Math.abs(s[0]);
  const stitch = (Math.abs(((p.x * 100) % 2.4) - 1.2) < 0.7) && (Math.abs(Math.abs(p.x) - 0.2) < 0.004 || Math.abs(Math.abs(p.x) - 0.23) < 0.002 || sx < 0);
  if (stitch && Math.abs(n.z) > 0.5) c = mix(c, "#d8b878", 0.7);
  return c;
});

const _BEARD_PAINT = paint((p, n) => {
  const strand = noise({ x: p.x * 6, y: p.y * 0.4, z: p.z * 6 } as any, 0.03, 2);
  const stripe = Math.sin(p.x * 160 + noise(p, 0.1, 4) * 6) * 0.5 + 0.5;
  let c = mix(BEARD, BEARD_LIGHT, smoothstep(0.55, 0.9, stripe) * 0.7 + 0.2 * strand);
  c = mix(c, BEARD_DARK, smoothstep(1.12, 1.3, p.y) * 0.8 + 0.25 * smoothstep(0.4, 0.2, stripe));
  const grey = smoothstep(1.06, 0.98, p.y) * smoothstep(0.7, 0.9, noise(p, 0.04, 6));
  c = mix(c, "#d8d2c6", grey * 0.8);
  return mix(c, mix(c, "#000000", 0.25), smoothstep(0.2, -0.8, n.y) * 0.5);
});

const _ANVIL_PAINT = paint((p, n) => {
  let c = mix(STEEL, STEEL_LIGHT, 0.5 + 0.5 * smoothstep(0.3, 0.7, noise(p, 0.06, 4)));
  const dx = Math.abs(p.x);
  c = mix(c, STEEL_DARK, smoothstep(0.2, 0.36, dx) * 0.9);
  c = mix(c, STEEL_DARK, smoothstep(0.1, 0.13, Math.abs(p.z - 0.72)) * 0.7);
  const dent = smoothstep(0.72, 0.8, noise(p, 0.025, 9));
  c = mix(c, STEEL_DARK, dent * 0.5 * (n.y > 0.5 ? 1 : 0));
  const heat = smoothstep(0.14, 0.0, Math.hypot(p.x - 0.05, p.z - 0.72));
  c = mix(c, "#d98a4a", heat * 0.3 * (n.y > 0.5 ? 1 : 0));
  return c;
});

const _STUMP_PAINT = paint((p, n) => {
  if (n.y > 0.7) {
    const r = Math.hypot(p.x, p.z - 0.72);
    const ring = Math.sin(r * 90 + noise(p, 0.05, 3) * 3) * 0.5 + 0.5;
    let c = mix("#2a1a10", WOOD_DARK, ring * 0.6);
    c = mix(c, "#0e0a08", smoothstep(0.1, 0.28, r) * 0.5 + 0.3 * smoothstep(0.7, 0.85, noise(p, 0.03, 7)));
    return c;
  }
  const g = Math.sin((p.x + p.z) * 140 + noise(p, 0.08, 2) * 5) * 0.5 + 0.5;
  let c = mix(WOOD, WOOD_DARK, g * 0.55 + 0.25 * noise(p, 0.1, 5));
  const crack = smoothstep(0.03, 0.0, Math.abs(noise(p, 0.12, 12) - 0.5)) * smoothstep(0.35, 0.5, noise(p, 0.5, 13));
  c = mix(c, "#2a170a", crack * 0.9);
  return c;
});

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
    { at: [0, 0, 0.3], x: [1, 0, 0], thickness: 0.03, bevel: 0.006, color: _LEATHER_PAINT, bone: spine, name: "apron" },
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
  b.part(sph(1, 12, 9), _BEARD_PAINT, { bone: jaw, at: [0, 1.14, 0.15], scale: [0.2, 0.17, 0.13], name: "beardMain", flat: true });
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
  b.part(cyl(0.3, 0.33, 0.5, 10), _STUMP_PAINT, { bone: hips, at: [0, 0.25, AZ], name: "stump", flat: true });
  for (const y of [0.1, 0.4]) b.part(cyl(0.325, 0.325, 0.03, 10), STEEL_DARK, { bone: hips, at: [0, y, AZ], flat: true });
  b.part(cyl(0.3, 0.3, 0.012, 10), WOOD_DARK, { bone: hips, at: [0, 0.502, AZ] });
  b.part(box(0.36, 0.1, 0.3), STEEL_DARK, { bone: hips, at: [0, 0.55, AZ], name: "anvilBase" });
  b.part(box(0.2, 0.14, 0.2), STEEL, { bone: hips, at: [0, 0.67, AZ], name: "anvilWaist" });
  b.part(box(0.72, 0.09, 0.26), _ANVIL_PAINT, { bone: hips, at: [0, 0.785, AZ], name: "anvilTop" });
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

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addAnvilMakerMark(b: Builder) {
  const bone = "hips";
  const Z = 0.82; // front face of anvil waist (center z 0.72 + half depth 0.1)
  const Y = 0.67;

  const crest = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 3 L60 12 L60 42 Q60 66 32 77 Q4 66 4 42 L4 12 Z" fill="#c9973a" stroke="#4f5662" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 9 L54 16 L54 42 Q54 62 32 71 Q10 62 10 42 L10 16 Z" fill="#e0b24f" stroke="#7a5a1e" stroke-width="1.5"/>
      <path d="M17 33 L17 21 L24 27 L32 17 L40 27 L47 21 L47 33 Z" fill="#4f5662" stroke="#2b2f36" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="16" y="33" width="32" height="4" fill="#4f5662"/>
      <rect x="29.5" y="40" width="5" height="26" rx="2" fill="#4f5662"/>
      <rect x="20" y="40" width="24" height="10" rx="2" fill="#4f5662" stroke="#2b2f36" stroke-width="1.5"/>
      <circle cx="24" cy="26" r="1.8" fill="#e0b24f"/><circle cx="32" cy="22" r="1.8" fill="#e0b24f"/><circle cx="40" cy="26" r="1.8" fill="#e0b24f"/>
    </svg>`,
    { size: 192 },
  );

  // backing plate
  b.part(new THREE.BoxGeometry(0.15, 0.115, 0.012), "#4f5662", { bone, at: [0, Y, Z + 0.004] });
  // shield with drawing
  b.part(new THREE.PlaneGeometry(0.11, 0.1375), "#ffffff", {
    bone,
    at: [0, Y, Z + 0.012],
    dir: [0, 0, 1],
    axis: "z",
    texture: crest,
  });
  // raised rim
  const rim = new THREE.BoxGeometry(0.15, 0.008, 0.018);
  b.part(rim, "#c9973a", { bone, at: [0, Y + 0.0575, Z + 0.006] });
  b.part(rim, "#c9973a", { bone, at: [0, Y - 0.0575, Z + 0.006] });
  const side = new THREE.BoxGeometry(0.008, 0.115, 0.018);
  b.part(side, "#c9973a", { bone, at: [0.075, Y, Z + 0.006] });
  b.part(side, "#c9973a", { bone, at: [-0.075, Y, Z + 0.006] });
  // rivets
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#c9973a", { bone, at: [sx * 0.064, Y + sy * 0.046, Z + 0.016] });
      b.part(new THREE.SphereGeometry(0.0035, 5, 3), "#4f5662", { bone, at: [sx * 0.064, Y + sy * 0.046, Z + 0.024] });
    }
  // small raised crown nubs and wear scratches at the base of the waist
  for (let i = -2; i <= 2; i++)
    b.part(new THREE.BoxGeometry(0.012, 0.004, 0.003), "#4f5662", { bone, at: [i * 0.03, Y - 0.085, Z + 0.002] });
}
    return addAnvilMakerMark;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addApronPocket(b: Builder) {
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------- apron pocket (apron front face is at z ~ 0.315) ----------
  const px = -0.1;
  const pz = 0.33;
  const POCKET = "#53321c";
  const stitch = svg(
    `<svg viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="3" fill="none" stroke="#e6dcc0" stroke-width="3" stroke-dasharray="6 5"/></svg>`,
    { size: 128 },
  );
  // pouch body
  b.part(box(0.17, 0.15, 0.025), POCKET, { bone: "spine", at: [px, 0.55, pz], name: "pocketBody" });
  // stitch decal on pouch
  b.part(new THREE.PlaneGeometry(0.155, 0.135), "#ffffff", {
    bone: "spine",
    at: [px, 0.55, pz + 0.0135],
    dir: [0, 0, 1],
    axis: "z",
    texture: stitch,
  });
  // flap
  b.part(box(0.18, 0.06, 0.016), LEATHER_DARK, { bone: "spine", at: [px, 0.615, pz + 0.018], name: "pocketFlap" });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.016, 3, 1), LEATHER_DARK, {
    bone: "spine",
    at: [px, 0.585, pz + 0.018],
    rotation: [90, 0, 180],
    scale: [1, 1, 0.35],
  });
  for (const s of [1, -1]) b.part(sph(0.01), BRASS, { bone: "spine", at: [px + s * 0.07, 0.62, pz + 0.03] });
  b.part(sph(0.012), BRASS, { bone: "spine", at: [px, 0.57, pz + 0.032] });
  // tool handles poking out the top
  b.rod([px - 0.04, 0.6, pz], [px - 0.05, 0.71, pz + 0.01], 0.011, WOOD, { bone: "spine" });
  b.part(cyl(0.014, 0.014, 0.03, 6), BRASS, { bone: "spine", at: [px - 0.04, 0.605, pz + 0.002] });
  b.part(sph(0.014), WOOD_DARK, { bone: "spine", at: [px - 0.05, 0.715, pz + 0.01] });
  b.rod([px + 0.035, 0.6, pz], [px + 0.05, 0.69, pz + 0.005], 0.009, WOOD_DARK, { bone: "spine" });
  b.part(box(0.022, 0.02, 0.01), STEEL, { bone: "spine", at: [px + 0.05, 0.7, pz + 0.005] });
  b.part(box(0.03, 0.006, 0.012), STEEL_LIGHT, { bone: "spine", at: [px - 0.02, 0.56, pz + 0.03] });

  // ---------- hammer (head centred at [-0.4, 1.14, 0.55], on handR) ----------
  const hx = -0.4;
  const hy = 1.14;
  const hz = 0.55;
  const rune = svg(
    `<svg viewBox="0 0 64 32"><g fill="none" stroke="#ff7a1a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 4 V28 M8 8 L16 16 L8 20"/><path d="M26 4 L34 16 L26 28 M34 16 H28"/><path d="M44 4 V28 M44 8 H54 L44 18"/></g></svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.2, 0.09), "#ffffff", {
        bone: "handR",
        at: [hx, hy, hz + s * 0.0615],
        dir: [0, 0, s],
        axis: "z",
        texture: rune,
      }),
      1.6,
    );
  }
  // brass bands at ends
  for (const s of [1, -1]) {
    b.part(box(0.022, 0.126, 0.126), BRASS, { bone: "handR", at: [hx + s * 0.1, hy, hz] });
    b.part(sph(0.01), BRASS, { bone: "handR", at: [hx + s * 0.1, hy + 0.045, hz + 0.065] });
    b.part(sph(0.01), BRASS, { bone: "handR", at: [hx + s * 0.1, hy - 0.045, hz + 0.065] });
  }
  // handle collar below head
  b.part(cyl(0.034, 0.034, 0.03, 8), BRASS, { bone: "handR", at: [hx, 1.09, 0.535], dir: [0, 0.7, 0.24] });
  // wrapped leather grip
  const a: [number, number, number] = [-0.4, 0.8, 0.31];
  const d: [number, number, number] = [0, 0.34, 0.24];
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.08;
    b.part(cyl(0.03, 0.03, 0.026, 8), i % 2 ? LEATHER_DARK : LEATHER, {
      bone: "handR",
      at: [a[0], a[1] + d[1] * t, a[2] + d[2] * t],
      dir: d,
    });
  }
  // pommel cap
  b.part(sph(0.036, 8, 6), BRASS, { bone: "handR", at: [-0.4, 0.765, 0.285] });
  b.part(cyl(0.012, 0.012, 0.02, 6), STEEL_DARK, { bone: "handR", at: [-0.4, 0.74, 0.268], dir: d });
}
    return addApronPocket;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addPauldronSpikes(b: Builder) {
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const GOLD_DK = "#8a6420";

  // ---- pauldron ornaments (both shoulders) ----
  for (const s of [1, -1]) {
    const cx = s * 0.37;
    const tilt = -s * 20;
    // brass trim band around the rim
    b.part(new THREE.TorusGeometry(0.152, 0.009, 5, 16), BRASS, {
      bone: "chest",
      at: [cx, 1.222, 0],
      rotation: [90, 0, tilt],
    });
    // rivet studs around rim
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const lx = Math.cos(a) * 0.15;
      const lz = Math.sin(a) * 0.15;
      b.part(sph(0.011), STEEL_LIGHT, {
        bone: "chest",
        at: [cx + lx * Math.cos((tilt * Math.PI) / 180), 1.236 + lx * Math.sin((-tilt * Math.PI) / 180) * -1 * 0 + 0.0, lz],
      });
    }
    // central cap plate
    b.part(cyl(0.05, 0.065, 0.02, 8), BRASS, { bone: "chest", at: [cx, 1.335, 0], rotation: [0, 0, tilt] });
    // ring of cone spikes
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / 4;
      const rx = Math.cos(a) * 0.075;
      const rz = Math.sin(a) * 0.075;
      b.part(cyl(0.001, 0.02, 0.1, 6), STEEL_LIGHT, {
        bone: "chest",
        at: [cx + rx, 1.37, rz],
        dir: [Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35],
        flat: true,
      });
      b.part(cyl(0.024, 0.024, 0.012, 6), BRASS, {
        bone: "chest",
        at: [cx + rx, 1.325, rz],
        dir: [Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35],
      });
    }
    b.part(cyl(0.001, 0.025, 0.13, 6), STEEL_LIGHT, { bone: "chest", at: [cx, 1.4, 0], flat: true });
  }

  // ---- belt buckle ----
  const emblem = svg(
    `<svg viewBox="0 0 64 64">
      <rect x="2" y="2" width="60" height="60" rx="5" fill="#c9973a" stroke="#5a3d10" stroke-width="4"/>
      <rect x="9" y="9" width="46" height="46" rx="3" fill="none" stroke="#8a6420" stroke-width="2.5"/>
      <path d="M14 26 H48 Q52 26 54 22 L54 30 Q46 32 42 36 L42 42 H46 V48 H18 V42 H22 V36 Q20 32 14 30Z" fill="#3f2616" stroke="#2a1a0c" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M17 28 H44" stroke="#c3a060" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const BZ = 0.352;
  b.part(box(0.15, 0.115, 0.014), BRASS, { bone: "hips", at: [0, 0.76, BZ - 0.004] });
  b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    bone: "hips",
    at: [0, 0.76, BZ + 0.004],
    dir: [0, 0, 1],
    axis: "z",
    texture: emblem,
  });
  for (const [x, y] of [[-0.062, 0.8], [0.062, 0.8], [-0.062, 0.72], [0.062, 0.72]]) {
    b.part(sph(0.007), GOLD_DK, { bone: "hips", at: [x, y, BZ + 0.007] });
  }
  // prong
  b.part(box(0.012, 0.012, 0.02), STEEL_DARK, { bone: "hips", at: [0, 0.76, BZ + 0.012] });

  for (const s of [1, -1]) {
    // belt loop / D-ring
    b.part(new THREE.TorusGeometry(0.022, 0.005, 5, 10), STEEL, {
      bone: "hips",
      at: [s * 0.22, 0.745, 0.23],
      rotation: [0, 90, 0],
    });
    b.part(box(0.03, 0.09, 0.012), LEATHER, { bone: "hips", at: [s * 0.22, 0.76, 0.23] });
  }
  // pouch on left
  b.part(box(0.09, 0.09, 0.05), LEATHER, { bone: "hips", at: [0.27, 0.68, 0.17], rotation: [0, 35, 0], flat: true });
  b.part(box(0.095, 0.035, 0.055), LEATHER_DARK, { bone: "hips", at: [0.27, 0.715, 0.17], rotation: [0, 35, 0] });
  b.part(sph(0.01), BRASS, { bone: "hips", at: [0.295, 0.7, 0.2] });
  // key on right
  b.part(new THREE.TorusGeometry(0.018, 0.005, 5, 10), BRASS, { bone: "hips", at: [-0.26, 0.69, 0.19], rotation: [0, 60, 0] });
  b.part(cyl(0.004, 0.004, 0.08, 5), BRASS, { bone: "hips", at: [-0.26, 0.63, 0.19] });
  b.part(box(0.02, 0.012, 0.006), BRASS, { bone: "hips", at: [-0.26, 0.595, 0.19] });
}
    return addPauldronSpikes;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addHelmCrest(b: Builder) {
  const r = rng(24);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const sph = (rad: number) => new THREE.SphereGeometry(rad, 6, 4);

  // ---- helm crest: brass cap plate + bristle fin front to back ----
  const CY = 1.655; // top of helmet dome
  b.part(box(0.07, 0.016, 0.3), BRASS, { bone: "head", at: [0, CY + 0.004, 0.05], name: "crestPlate" });
  b.part(box(0.085, 0.01, 0.06), STEEL_DARK, { bone: "head", at: [0, CY + 0.012, 0.19] });
  b.part(box(0.085, 0.01, 0.06), STEEL_DARK, { bone: "head", at: [0, CY + 0.012, -0.09] });
  // rivets along the base
  for (let i = 0; i < 7; i++) {
    const z = -0.07 + i * 0.043;
    for (const s of [1, -1])
      b.part(sph(0.007), STEEL_LIGHT, { bone: "head", at: [s * 0.03, CY + 0.014, z] });
  }
  // bristle blades: tall in the middle, tapering to ends, arching backwards
  const N = 16;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const z = 0.17 - t * 0.3;
    const h = 0.06 + 0.1 * Math.sin(Math.PI * (0.1 + 0.8 * t)) + r() * 0.02;
    const col = i % 3 === 0 ? BEARD : BEARD_DARK;
    const lean = -0.05 - 0.04 * r();
    b.spike([0, CY + 0.014, z], [0, 1, lean * 3], h, 0.02, col, { bone: "head", sides: 5 } as any);
  }
  // central ridge band
  b.sweep(
    catmull([
      [0, CY + 0.025, 0.17],
      [0, CY + 0.06, 0.05],
      [0, CY + 0.06, -0.06],
      [0, CY + 0.03, -0.14],
    ]),
    [0.012, 0.012],
    { color: BEARD_DARK, bone: "head" },
  );
  // front brass crest stud
  b.part(sph(0.018), BRASS, { bone: "head", at: [0, CY + 0.03, 0.2] });

  // ---- tongs jaws at ingot ----
  const ZA = 0.72;
  for (const dz of [-0.022, 0.022]) {
    // flattened gripping jaws on each side of the ingot
    b.part(box(0.1, 0.02, 0.014), STEEL_DARK, { bone: "handL", at: [0.15, 0.874, ZA + dz * 1.5], name: "tongJaw" });
    // curved down-turned tips
    b.part(box(0.025, 0.03, 0.012), STEEL_DARK, { bone: "handL", at: [0.095, 0.862, ZA + dz * 1.3], rotation: [0, 0, 20] });
    // inner teeth
    for (let i = 0; i < 3; i++)
      b.part(box(0.01, 0.008, 0.008), STEEL_LIGHT, {
        bone: "handL",
        at: [0.12 + i * 0.03, 0.866, ZA + dz * 0.75],
      });
  }
  // pivot rivet and reinforcement collar
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 8), BRASS, { bone: "handL", at: [0.26, 0.85, 0.5], rotation: [90, 0, 0] });
  b.part(sph(0.016), STEEL_LIGHT, { bone: "handL", at: [0.26, 0.85, 0.54] });
  b.part(box(0.04, 0.03, 0.06), LEATHER_DARK, { bone: "handL", at: [0.36, 0.84, 0.33] });

  // extra sparks drifting above the ingot
  for (let i = 0; i < 9; i++) {
    const p: [number, number, number] = [0.05 + (r() - 0.5) * 0.4, 0.92 + r() * 0.32, ZA + (r() - 0.5) * 0.3];
    glow(b.part(sph(0.006 + r() * 0.007), i % 3 ? HOT : EMBER, { bone: "hips", at: p }), 2);
  }
  // heat glow wisp on anvil face
  glow(b.part(box(0.1, 0.004, 0.05), EMBER, { bone: "hips", at: [0.05, 0.834, ZA] }), 1.2);
}
    return addHelmCrest;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addStumpHoopsAxe(b: Builder) {
  const R = rng(25);
  const AZ = 0.72;
  const ASH = "#2a211b";
  const CHIP = "#a9733f";
  const NAILC = "#2e3138";
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- stump: scorch paint patches (thin discs on the surface) ----------
  const scorch = paint((p, n) => {
    const t = noise(p, 0.09, 4);
    return t > 0.58 ? mix(WOOD_DARK, ASH, Math.min(1, (t - 0.58) * 6)) : WOOD;
  });
  // thin scorch decals on front of stump
  for (const [x, y, sz] of [
    [-0.12, 0.28, 0.1],
    [0.14, 0.2, 0.08],
    [0.04, 0.38, 0.07],
  ] as [number, number, number][]) {
    const ang = Math.atan2(x, 0.3);
    const r = 0.3 + 0.03 * (0.5 - y);
    b.part(new THREE.CircleGeometry(sz, 7), scorch, {
      bone: "hips",
      at: [Math.sin(ang) * (r + 0.003), y, AZ + Math.cos(ang) * (r + 0.003)],
      dir: [Math.sin(ang), 0, Math.cos(ang)],
      axis: "z",
      name: "scorch",
    });
  }

  // ---------- nails on hoops ----------
  for (const y of [0.1, 0.4]) {
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.4;
      const r = 0.329;
      b.part(sph(0.011, 5, 4), NAILC, {
        bone: "hips",
        at: [Math.sin(a) * r, y, AZ + Math.cos(a) * r],
        scale: [1, 1, 1],
        name: "nail",
      });
      b.part(box(0.006, 0.003, 0.02), STEEL_DARK, {
        bone: "hips",
        at: [Math.sin(a) * (r + 0.008), y, AZ + Math.cos(a) * (r + 0.008)],
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
      });
    }
  }

  // ---------- chisel nicks on the front ----------
  for (let i = 0; i < 6; i++) {
    const a = -0.7 + i * 0.28 + R() * 0.1;
    const y = 0.15 + R() * 0.2;
    const r = 0.316;
    b.part(box(0.035, 0.006, 0.006), WOOD_DARK, {
      bone: "hips",
      at: [Math.sin(a) * r, y, AZ + Math.cos(a) * r],
      dir: [Math.sin(a), 0, Math.cos(a)],
      axis: "z",
      rotation: [0, 0, (R() - 0.5) * 90],
    });
  }

  // ---------- hatchet buried in top edge ----------
  const hx = -0.19;
  const hz = AZ + 0.2;
  const tilt = 22;
  b.part(new THREE.CylinderGeometry(0.014, 0.017, 0.38, 6), WOOD, {
    bone: "hips",
    at: [hx, 0.7, hz],
    rotation: [-30, 0, tilt],
    name: "axeHandle",
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), LEATHER_DARK, {
    bone: "hips",
    at: [hx + 0.086, 0.86, hz - 0.05],
    rotation: [-30, 0, tilt],
  });
  // head: wedge blade extruded
  const axe = b.extrude(
    [
      [0, 0],
      [0.1, -0.05],
      [0.12, 0.08],
      [0, 0.04],
    ],
    {
      at: [hx - 0.02, 0.52, hz - 0.12],
      x: [0, 0, 1],
      y: [-0.2, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: STEEL,
      bone: "hips",
      name: "axeBlade",
    },
  );
  b.part(box(0.04, 0.05, 0.04), STEEL_DARK, { bone: "hips", at: [hx - 0.01, 0.53, hz - 0.14], rotation: [-30, 0, tilt] });
  b.part(box(0.012, 0.012, 0.012), STEEL_LIGHT, { bone: "hips", at: [hx - 0.01, 0.56, hz - 0.14] });
  void axe;

  // splintered cut in the top where the axe bites
  for (let i = 0; i < 4; i++) {
    b.part(box(0.03, 0.006, 0.012), CHIP, {
      bone: "hips",
      at: [hx + (i - 1.5) * 0.03, 0.508, hz - 0.18 + R() * 0.03],
      rotation: [0, R() * 180, (R() - 0.5) * 20],
    });
  }

  // ---------- wood chips on the ground ----------
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 1.3 - 0.65;
    const d = 0.42 + R() * 0.2;
    b.part(box(0.04 + R() * 0.03, 0.008, 0.02 + R() * 0.02), i % 3 ? CHIP : WOOD_DARK, {
      bone: "hips",
      at: [Math.sin(a) * d, 0.004, AZ + Math.cos(a) * d],
      rotation: [0, R() * 360, (R() - 0.5) * 12],
      name: "chip",
    });
  }

  // ---------- boot straps and cuffs ----------
  const buckle = svg(
    `<svg viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="3" fill="none" stroke="#c9973a" stroke-width="5"/><rect x="13" y="3" width="6" height="26" fill="#c9973a"/><rect x="2" y="14" width="28" height="4" fill="#8a6420"/></svg>`,
    { size: 64 },
  );
  for (const s of [1, -1]) {
    const bone = s > 0 ? "ankleL" : "ankleR";
    const x = s * 0.15;
    // two straps wrapping over the boot top
    for (const [z, y] of [
      [0.12, 0.14],
      [0.02, 0.15],
    ] as [number, number][]) {
      b.part(box(0.19, 0.03, 0.035), LEATHER_DARK, { bone, at: [x, y, z], name: "strap" });
      b.part(box(0.19, 0.012, 0.03), BRASS, { bone, at: [x, y + 0.016, z] });
      b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
        bone,
        at: [x + s * 0.0, y, z + 0.0205 + (z > 0.1 ? 0.0 : 0)],
        dir: [0, 0, 1],
        axis: "z",
        texture: buckle,
        name: "buckle",
      });
      b.part(box(0.04, 0.02, 0.02), LEATHER_DARK, { bone, at: [x + s * 0.06, y - 0.03, z + 0.01] });
    }
    // folded cuff with stitching
    b.part(new THREE.CylinderGeometry(0.118, 0.112, 0.045, 10), LEATHER, {
      bone,
      at: [x, 0.235, 0.02],
      flat: true,
      name: "cuff",
    });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.008, 10), LEATHER_DARK, { bone, at: [x, 0.26, 0.02] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(box(0.008, 0.012, 0.004), BONE, {
        bone,
        at: [x + Math.sin(a) * 0.12, 0.236, 0.02 + Math.cos(a) * 0.12],
        dir: [Math.sin(a), 0, Math.cos(a)],
        axis: "z",
      });
    }
    // toe cap and sole stitch
    b.part(box(0.15, 0.05, 0.07), LEATHER_DARK, { bone, at: [x, 0.07, 0.21] });
    b.part(box(0.15, 0.012, 0.012), BRASS, { bone, at: [x, 0.1, 0.245] });
  }
}
    return addStumpHoopsAxe;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBeardRings(b: Builder) {
  const sph = (r: number, w = 6, h = 5) => new THREE.SphereGeometry(r, w, h);
  const R = rng(26);

  // ---------- beard rings, beads and extra braids ----------
  const ring = (at: [number, number, number], r: number, color: string, bone: string) =>
    b.part(new THREE.TorusGeometry(r, r * 0.3, 5, 10), color, { bone, at, dir: [0, 1, 0], axis: "z" });

  for (const s of [1, -1]) {
    // rings clasping the main braids (braid path from stage 1)
    const br = catmull([
      [s * 0.11, 1.12, 0.26],
      [s * 0.13, 1.02, 0.3],
      [s * 0.12, 0.92, 0.335],
      [s * 0.12, 0.84, 0.34],
    ]);
    const p1 = br.at(0.3);
    const p2 = br.at(0.62);
    const p3 = br.at(0.9);
    for (const [p, c, r] of [
      [p1, "#c9973a", 0.043],
      [p2, "#8d96a3", 0.041],
      [p3, "#c9973a", 0.042],
    ] as const) {
      b.part(new THREE.CylinderGeometry(r, r, 0.018, 8), c, { bone: "jaw", at: p, dir: br.tangentAt(0.5) });
    }
    // bone bead on each braid
    b.part(sph(0.024, 7, 5), "#e6dcc0", { bone: "jaw", at: [s * 0.123, 0.975, 0.322] });
    b.part(sph(0.01, 5, 4), "#c9973a", { bone: "jaw", at: [s * 0.123, 0.975, 0.342] });

    // thin extra braids beside the mouth
    const thin = catmull([
      [s * 0.12, 1.28, 0.2],
      [s * 0.16, 1.2, 0.24],
      [s * 0.165, 1.11, 0.27],
      [s * 0.16, 1.03, 0.285],
    ]);
    b.sweep(thin, [0.02, 0.014], { color: "#c0622a", bone: "jaw" });
    for (let i = 0; i < 4; i++) {
      b.part(sph(0.018, 5, 4), i % 2 ? "#7a3516" : "#e8903f", { bone: "jaw", at: thin.at(0.1 + i * 0.25) });
    }
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.016, 8), "#8d96a3", { bone: "jaw", at: thin.at(0.97), dir: [0, -1, 0.1] });
    b.spike(thin.at(0.99), [s * 0.01, -1, 0.1], 0.05, 0.02, "#7a3516", { bone: "jaw" });
  }

  // beard tip rings on the front spikes
  for (const i of [-2, 0, 2]) {
    const a = Math.abs(i);
    ring([i * 0.05, 0.9 + a * 0.03, 0.22 - a * 0.01], 0.034, i === 0 ? "#c9973a" : "#8d96a3", "jaw");
  }
  // small chin bead
  b.part(sph(0.02, 6, 5), "#e6dcc0", { bone: "jaw", at: [0, 0.86, 0.2] });
  // grey streaks on the beard
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045 + (R() - 0.5) * 0.01;
    b.spike([x, 1.2, 0.27], [x * 0.5, -1, 0.1], 0.09, 0.008, "#f4efe4", { bone: "jaw" });
  }

  // ---------- goggles polish ----------
  // strap round the helm
  const strap = catmull(
    [
      [0.07, 1.59, 0.19],
      [0.17, 1.585, 0.14],
      [0.2, 1.58, 0.04],
      [0.15, 1.58, -0.1],
      [0, 1.58, -0.14],
      [-0.15, 1.58, -0.1],
      [-0.2, 1.58, 0.04],
      [-0.17, 1.585, 0.14],
      [-0.07, 1.59, 0.19],
    ],
    { closed: false },
  );
  b.sweep(strap, 0.014, { color: "#3f2616", bone: "head", sides: 4 });
  for (const s of [1, -1]) {
    const x = s * 0.07;
    // wing-nuts
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), "#c9973a", { bone: "head", at: [s * 0.12, 1.625, 0.205], dir: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.03, 0.008, 0.008), "#c9973a", { bone: "head", at: [s * 0.12, 1.625, 0.216] });
    // outer brass rim ring
    b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 12), "#e0b048", { bone: "head", at: [x, 1.59, 0.222], dir: [0, 0.15, 1], axis: "z" });
    // glints
    b.part(new THREE.CircleGeometry(0.009, 6), "#ffffff", { bone: "head", at: [x - s * 0.014, 1.603, 0.2285], dir: [0, 0.15, 1], axis: "z" });
    b.part(new THREE.CircleGeometry(0.0045, 5), "#ffffff", { bone: "head", at: [x + s * 0.015, 1.577, 0.2285], dir: [0, 0.15, 1], axis: "z" });
    // rivets on the strap mount
    b.part(sph(0.006, 5, 4), "#c9973a", { bone: "head", at: [s * 0.115, 1.59, 0.19] });
  }
  // crack across the right lens corner
  const crack = (x0: number, y0: number, x1: number, y1: number) =>
    b.rod([x0, y0, 0.2295], [x1, y1, 0.2295], 0.0014, "#1c1410", { bone: "head" });
  crack(-0.045, 1.612, -0.066, 1.595);
  crack(-0.066, 1.595, -0.058, 1.58);
  crack(-0.066, 1.595, -0.09, 1.59);
  // lens tint highlight
  glow(b.part(new THREE.CircleGeometry(0.014, 6), "#5fd0ff", { bone: "head", at: [0.07, 1.59, 0.2285], dir: [0, 0.15, 1], axis: "z" }), 0.5);
}
    return addBeardRings;
  })(),
);
