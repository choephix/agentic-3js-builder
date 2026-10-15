import * as THREE from "three";
import { catmull, createBuilder, noise, paint, rng } from "../../../../src/index";
import type { Builder, Joint } from "../../../../src/index";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  tileBox,
} from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dungeon props",
  description:
    "A pixel-art dungeon set: a banded chest with a skull-keyed lock, two iron torches with glowing flames, a stave barrel and a lying cask, a bone pile and a spike trap.",
};

type P3 = [number, number, number];

const TAU = Math.PI * 2;
/** One pixel-art texel in meters: every texture, box and paint in the set is cut to this grid. */
const TEXEL = 0.02;

// ---------------------------------------------------------------------------------------------------------------
// Palettes

const WOOD = ["#1f1009", "#3a2212", "#56331a", "#744621", "#94602e"];
const WOOD_BODY = WOOD.slice(1);
const IRON_RAMP = ["#17161d", "#2a2a35", "#41414f", "#5d5e6c", "#7d7f8c"];
const BONE_RAMP = ["#8f8570", "#b8ad93", "#d9cfb4", "#f2ead2"];
const BONE_FLAT = "#e4dac0";
const GOLD = "#e0b043";
const BLOOD = "#7a0f14";
const INK = "#15100c";

/** A stable hash in [0, 1) for pixel coordinates, so every texel is the same on every run. */
function h2(x: number, y: number, s = 0) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

/** Horizontal planks for the chest body: dark seams, staggered joints, grain in 5-pixel runs. */
const PLANKS = pixelTexture(48, 32, (g) =>
  g.fill((x, y) => {
    const row = Math.floor(y / 8);
    if (y % 8 === 0 || (x + row * 13) % 24 === 0) return WOOD[0];
    return pick(WOOD_BODY, 0.3 + 0.6 * h2(Math.floor(x / 5), y, row), bayer(x, y));
  }),
);

/** The trap plate: iron with riveted seams, a bevelled rim and dried blood. */
const PLATE = pixelTexture(48, 48, (g) =>
  g.fill((x, y) => {
    if (x < 2 || y < 2 || x > 45 || y > 45) return IRON_RAMP[3];
    if (x % 16 === 8 && y % 16 === 8) return "#9aa0b2";
    if (Math.hypot(x - 14, y - 30) < 5 || Math.hypot(x - 34, y - 12) < 3.5)
      return h2(x, y, 6) > 0.35 ? "#6e0c10" : BLOOD;
    if (x % 16 === 0 || y % 16 === 0) return IRON_RAMP[0];
    return pick(IRON_RAMP.slice(1, 4), 0.2 + 0.6 * h2(x, y, 2), bayer(x, y));
  }),
);

/** A lock plate with a keyhole, 8 × 9 pixels. */
const LOCK = pixelArt(
  [
    "kkkkkkkk",
    "kgsssgsk",
    "kgsksgsk",
    "kgssssgk",
    "kgggggsk",
    "kgsssgsk",
    "kgsksgsk",
    "kgssssgk",
    "kkkkkkkk",
  ],
  { k: "#2a1a08", g: GOLD, s: "#b58a33" },
);

/** A skull label for the upright cask, 9 × 9 pixels. */
const LABEL = pixelArt(
  [
    "..wwwww..",
    ".wwwwwww.",
    ".wkkwkkw.",
    ".wkkwkkw.",
    ".wwwwwww.",
    "..wwkww..",
    "..w.w.w..",
    "..wwwww..",
  ],
  { w: "#ece3c6", k: INK },
);

/** Skull and jaw as a Minecraft-style skin sheet, so each face of the box gets its own drawing. */
const BONES = skinLayout({ skull: [8, 8, 8], jaw: [8, 3, 6] }, 64);
const [BONE_W, BONE_H] = BONES.size;
const EYES = [".kk..kk.", ".kk..kk.", "........", "...kk...", "..kkkk..", ".k.kk.k."];
const BONE_SHEET = pixelTexture(BONE_W, BONE_H, (g) => {
  g.fill((x, y) => pick(BONE_RAMP, 0.45 + 0.4 * h2(x, y, 8), bayer(x, y)));
  for (const rect of Object.values(BONES.faces).flatMap((f) => Object.values(f)))
    g.fill((x, y, _w, h) => pick(BONE_RAMP, 0.95 - 0.7 * (y / h), bayer(x, y)), rect);
  const [sx, sy] = BONES.faces.skull.pz;
  g.stamp(sx, sy, EYES, { k: INK });
  const [jx, jy] = BONES.faces.jaw.pz;
  g.stamp(jx, jy, ["w.w.w.w."], { w: "#fbf6e6" });
});

// ---------------------------------------------------------------------------------------------------------------
// Painted surfaces

/** Dark iron with a light from above, dithered between steps and a little tarnish grain. */
const IRON = cellPaint(
  TEXEL,
  (c) => {
    const v = 0.3 + 0.35 * (c.n.y * 0.5 + 0.5) + 0.3 * (noise(c.at, 0.09, 4) - 0.5);
    return c.pick(IRON_RAMP, v);
  },
  { dither: true },
);

/** Spike tips that have been used: the iron turns to blood at the top fifth. */
const SPIKE = paint((_p, _n, s) => (s[0] > 0.72 ? BLOOD : IRON));

/** Chest lid planks: a seam every 0.16 m, speckled grain between. */
const WOOD_LID = cellPaint(
  TEXEL,
  (c) => {
    const seam = ((c.at.y % 0.16) + 0.16) % 0.16 < TEXEL * 0.6;
    if (seam) return WOOD[0];
    return c.pick(WOOD_BODY, 0.35 + 0.5 * c.random(3));
  },
  { dither: true },
);

/** Barrel staves: `count` strips round the axis, a dark seam between each pair, dithered grain. */
function staves(angle: (p: THREE.Vector3) => number, count: number) {
  return cellPaint(
    TEXEL,
    (c) => {
      const f = (angle(c.at) / TAU + 0.5) * count;
      const k = Math.floor(f);
      const edge = f - k;
      if (edge < 0.1 || edge > 0.9) return WOOD[0];
      if (c.axis === 1) return c.pick(WOOD_BODY, 0.5);
      return c.pick(WOOD_BODY, 0.3 + 0.55 * c.random(k));
    },
    { dither: true },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Shapes

/** A barrel profile as [radius, height] in meters: the bulge, the top and bottom, and the axis. */
const BARREL: [number, number][] = [
  [0, 0],
  [0.19, 0],
  [0.25, 0.08],
  [0.29, 0.25],
  [0.3, 0.43],
  [0.29, 0.62],
  [0.25, 0.78],
  [0.19, 0.85],
  [0, 0.85],
];

/** Radius of the barrel profile at a height, for hoops that sit on it. */
function barrelR(y: number) {
  for (let i = 1; i < BARREL.length; i++) {
    const [r0, y0] = BARREL[i - 1];
    const [r1, y1] = BARREL[i];
    if (y0 !== y1 && y >= Math.min(y0, y1) && y <= Math.max(y0, y1))
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

/** Torch foot, a flat stepped disc. */
const FOOT: [number, number][] = [
  [0, 0],
  [0.14, 0],
  [0.14, 0.02],
  [0.05, 0.035],
  [0, 0.035],
];

/** Torch bowl: a cup on the pole, with a cavity for the coals. */
const BOWL: [number, number][] = [
  [0, 0],
  [0.035, 0],
  [0.06, 0.06],
  [0.085, 0.1],
  [0.08, 0.12],
  [0.065, 0.12],
  [0.05, 0.08],
  [0, 0.06],
];

/** The chest lid: a pixel arch, 0.025 m cells, running along z (its width is the chest's depth). */
const LID = stepped(
  [
    [-10, 10],
    [-10, 10],
    [-9, 9],
    [-8, 8],
    [-6, 6],
    [-4, 4],
    [-2, 2],
  ],
  0.025,
  { rows: true },
);

/** Flame layers, outer to inner, each a staircase drawn in 2 cm cells. */
const FLAMES = [
  {
    outline: stepped(
      [
        [-3, 3],
        [-3, 3],
        [-3, 3],
        [-2, 2],
        [-2, 2],
        [-2, 1],
        [-1, 1],
        [0, 1],
      ],
      TEXEL,
      { rows: true },
    ),
    color: "#ff6a1a",
    dz: 0,
    thickness: 0.03,
  },
  {
    outline: stepped(
      [
        [-2, 2],
        [-2, 2],
        [-1, 1],
        [-1, 1],
        [0, 1],
      ],
      TEXEL,
      { rows: true },
    ),
    color: "#ffb42e",
    dz: 0.015,
    thickness: 0.02,
  },
  {
    outline: stepped(
      [
        [-1, 1],
        [-1, 1],
        [0, 1],
      ],
      TEXEL,
      { rows: true },
    ),
    color: "#fff1a6",
    dz: 0.03,
    thickness: 0.016,
  },
];

// ---------------------------------------------------------------------------------------------------------------
// Helpers

/** A closed ring of radius `R` about `c`, in the horizontal plane (axis "y") or the z-facing plane (axis "z"). */
function ring(c: P3, R: number, plane: "y" | "z") {
  const pts: P3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    const u = R * Math.cos(a);
    const v = R * Math.sin(a);
    pts.push(plane === "y" ? [c[0] + u, c[1], c[2] + v] : [c[0] + u, c[1] + v, c[2]]);
  }
  return catmull(pts, { closed: true });
}

/** A rod with a knob at each end: a femur or a long bone lying on the floor. */
function femur(b: Builder, bone: Joint, a: P3, c: P3) {
  b.rod(a, c, 0.012, BONE_FLAT, { bone });
  for (const p of [a, c]) b.part(new THREE.SphereGeometry(0.024, 6, 4), BONE_FLAT, { bone, at: p, flat: true });
}

/** A barrel: staves on a lathe, hoops as tubes, and either a skull label or a bung. */
function cask(b: Builder, floor: Joint, name: string, base: P3, lying: boolean) {
  const [x, , z] = base;
  const bone = b.joint(name, { parent: floor, at: base });
  const axis: P3 = lying ? [0, 0, 1] : [0, 1, 0];
  const at: P3 = lying ? [x, 0.3, z] : [x, 0, z];
  const angle = lying
    ? (p: THREE.Vector3) => Math.atan2(p.x - x, p.y - 0.3)
    : (p: THREE.Vector3) => Math.atan2(p.x - x, p.z - z);
  const body = b.lathe(BARREL, { at, axis, segments: 10, color: staves(angle, 10), bone });

  for (const h of lying ? [0.12, 0.73] : [0.1, 0.75]) {
    const R = barrelR(h) + 0.008;
    const c: P3 = lying ? [x, 0.3, z + h] : [x, h, z];
    b.sweep(ring(c, R, lying ? "z" : "y"), 0.011, { color: IRON, sides: 6, bone });
  }

  if (lying) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), IRON, { bone, at: [x, 0.58, z + 0.42] });
  } else {
    b.decal(body, LABEL, {
      at: [x, 0.42, z + barrelR(0.42) - 0.01],
      dir: [0, 0, 1],
      size: [0.18, 0.18],
      bone,
    });
  }
}

/** A standing torch: a pole on a foot, a collar, a bowl, coals, a three-layer flame and sparks. */
function torch(b: Builder, floor: Joint, name: string, x: number, z: number) {
  const t = b.joint(name, { parent: floor, at: [x, 0, z] });
  b.lathe(FOOT, { at: [x, 0, z], axis: [0, 1, 0], segments: 8, color: IRON, bone: t });
  b.rod([x, 0.03, z], [x, 1.22, z], 0.02, IRON, { bone: t });
  b.sweep(ring([x, 0.72, z], 0.03, "y"), 0.01, { color: IRON, sides: 6, bone: t });
  b.lathe(BOWL, { at: [x, 1.2, z], axis: [0, 1, 0], segments: 8, color: IRON, bone: t });
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.03, 8), "#ff7a1a", { bone: t, at: [x, 1.27, z] }), 1.2);

  for (const layer of FLAMES)
    glow(
      b.extrude(layer.outline, {
        at: [x, 1.32, z + layer.dz],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: layer.thickness,
        color: layer.color,
        bone: t,
      }),
      1.6,
    );

  for (const [dx, dy] of [
    [0.05, 0.1],
    [-0.045, 0.16],
    [0.012, 0.22],
  ])
    glow(b.part(new THREE.BoxGeometry(0.016, 0.016, 0.016), "#ffc857", { bone: t, at: [x + dx, 1.32 + dy, z + 0.02] }), 1.5);
}

// ---------------------------------------------------------------------------------------------------------------
// The set

export default function build() {
  const b = createBuilder({ name: "dungeonProps" });
  const floor = b.joint("floor", { at: [0, 0, 0] });

  // Chest: planked body, arched lid hinged along its back edge, iron straps and a skull-keyed lock.
  const chest = b.joint("chest", { parent: floor, at: [0.75, 0, -0.35] });
  const lid = b.joint("chestLid", { parent: chest, at: [0.75, 0.4, -0.6] });
  b.part(tileBox([0.9, 0.4, 0.5], PLANKS, TEXEL), "#ffffff", {
    bone: chest,
    at: [0.75, 0.2, -0.35],
    texture: PLANKS,
  });
  b.extrude(LID, {
    at: [0.75, 0.4, -0.35],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.9,
    color: WOOD_LID,
    bone: lid,
  });
  for (const s of [-1, 1])
    b.part(new THREE.BoxGeometry(0.05, 0.4, 0.014), IRON, { bone: chest, at: [0.75 + 0.3 * s, 0.2, -0.093] });
  b.part(new THREE.PlaneGeometry(0.16, 0.18), "#ffffff", {
    bone: chest,
    at: [0.75, 0.26, -0.096],
    dir: [0, 0, 1],
    axis: "z",
    texture: LOCK,
  });

  // Coins spilled in front of the chest.
  const coin = rng(7);
  for (let i = 0; i < 9; i++) {
    const tilt: P3 = [coin() * 30 - 15, 0, coin() * 30 - 15];
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 10), GOLD, {
      bone: floor,
      at: [0.5 + coin() * 0.55, 0.004, -0.02 + coin() * 0.16],
      rotation: tilt,
      flat: true,
    });
  }

  // Spike trap: a riveted plate in an iron rim, sixteen square-section spikes, the tips used.
  const trap = b.joint("trap", { parent: floor, at: [-0.1, 0, 0.5] });
  b.part(tileBox([0.9, 0.03, 0.9], PLATE, TEXEL), "#ffffff", {
    bone: trap,
    at: [-0.1, 0.015, 0.5],
    texture: PLATE,
  });
  b.part(new THREE.BoxGeometry(0.96, 0.05, 0.03), IRON, { bone: trap, at: [-0.1, 0.025, 0.035] });
  b.part(new THREE.BoxGeometry(0.96, 0.05, 0.03), IRON, { bone: trap, at: [-0.1, 0.025, 0.965] });
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.9), IRON, { bone: trap, at: [-0.565, 0.025, 0.5] });
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.9), IRON, { bone: trap, at: [0.365, 0.025, 0.5] });
  for (let i = 0; i < 4; i++)
    for (let k = 0; k < 4; k++) {
      const x = -0.1 + (i - 1.5) * 0.18;
      const z = 0.5 + (k - 1.5) * 0.18;
      b.spike([x, 0.03, z], [0, 1, 0], 0.22, 0.028, { color: SPIKE, section: { ngon: 4 }, bone: trap });
    }

  // Bone pile: a skull and jaw from one skin sheet, two femurs and two rib arcs.
  const pile = b.joint("bones", { parent: floor, at: [0.9, 0, 0.5] });
  b.part(skinBox(BONE_SHEET, BONES.faces.skull, TEXEL), "#ffffff", {
    bone: pile,
    at: [0.9, 0.08, 0.5],
    rotation: [0, 20, -6],
    texture: BONE_SHEET,
  });
  b.part(skinBox(BONE_SHEET, BONES.faces.jaw, TEXEL), "#ffffff", {
    bone: pile,
    at: [0.92, 0.03, 0.68],
    rotation: [0, 20, 0],
    texture: BONE_SHEET,
  });
  femur(b, pile, [0.52, 0.022, 0.82], [1.12, 0.022, 0.88]);
  femur(b, pile, [0.66, 0.022, 0.14], [1.1, 0.022, 0.2]);
  for (const cz of [0.4, 0.53]) {
    const pts: P3[] = [];
    for (let k = 0; k <= 6; k++) {
      const a = (0.6 + (0.8 * k) / 6) * Math.PI;
      pts.push([1.2 + 0.1 * Math.cos(a), 0.012 + 0.01 * Math.sin((k / 6) * Math.PI), cz + 0.1 * Math.sin(a)]);
    }
    b.sweep(catmull(pts), 0.009, { color: BONE_FLAT, sides: 6, bone: pile });
  }

  // Two casks: one standing, one on its side at the front left.
  cask(b, floor, "barrelUp", [-0.85, 0, -0.45], false);
  cask(b, floor, "barrelLie", [-1.0, 0, 0.05], true);

  // Two torches on iron stands.
  torch(b, floor, "torchL", -1.45, -0.45);
  torch(b, floor, "torchR", 1.42, -0.45);

  return b.root;
}
