import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { rng } from "../src/math";
import { arc, polyline } from "../src/path";
import { cellPaint, pixelArt, pixelTexture, stepped } from "../kits/pixel";
import { glow } from "../kits/glow";

export const meta = {
  name: "Dungeon props: chest, torches, barrels, bones and a spike trap",
  description:
    "A pixel-art dungeon floor vignette on a flagstone slab: a banded treasure chest with a hinged arched lid and a gold heap, two tripod torches with glowing flames, three staved barrels, a bone pile with a skull, and a brick-rimmed spike pit with a propped hatch and a riveted pressure plate.",
  style: "pixel art",
  commit: "b816db2",
};

// One texel size per family: 2 cm for big surfaces, 1 cm for small parts (the kit's half-size rule).
const TEXEL = 0.02;
const FINE = 0.01;

const INK = "#16110f";
const SHADOW = "#0c0a0e";
const WOOD = ["#2b1a0e", "#4a2b16", "#6a3f20", "#87562c", "#a46d3a", "#c18a4e"];
const WOOD_SEAM = "#1d1109";
const WEATHERED = ["#1d2620", "#2c3a2d", "#42533c", "#596f4c", "#758a62", "#93a57c"];
const IRON = ["#1b1e24", "#2d323b", "#464d58", "#687280", "#8f98a4", "#bcc4cd"];
const GOLD = ["#5c3509", "#8f5a12", "#c07f1c", "#e7a631", "#ffd766"];
const STONE = ["#15141a", "#222129", "#302f39", "#41414c", "#53535e", "#66666f"];
const MOSS = ["#17250f", "#263d19", "#3a5a25", "#4f7532"];
const BONE = ["#6e6450", "#968a70", "#b9ad8f", "#d6caa8", "#ece3c8"];
const BLOOD = ["#3d0a0e", "#6e1116", "#9c1c20"];
const CLOTH = ["#3a1420", "#5e1f2c", "#842c3c"];
const ROPE = ["#3f2f1b", "#6a5030", "#8e6e44", "#b08e5c"];

/** A fixed pseudo-random value in [0, 1) for two integers: one per plank, flag, brick, stave or texel. */
function hash(a: number, b: number) {
  const s = Math.sin(a * 127.1 + b * 311.7 + 17.3) * 43758.5453;
  return s - Math.floor(s);
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Boards `width` wide across `across`, running along the other in-face axis, with dark seams and knots. */
function planks(across: "x" | "y" | "z", width: number, cell = TEXEL) {
  const AX = ["x", "y", "z"] as const;
  return cellPaint(cell, (c) => {
    const q = c.at[across] / width;
    const k = Math.floor(q);
    const f = q - k;
    if (f < 0.08 || f > 0.92) return WOOD_SEAM;
    const along = AX.find((a) => a !== across && a !== AX[c.axis]) ?? "x";
    const streak = hash(k, Math.floor(c.at[along] / (cell * 4)));
    const knot = hash(k * 7 + 3, Math.floor(c.at[along] / (cell * 8))) > 0.94;
    return c.pick(WOOD, clamp01(0.2 + 0.55 * hash(k, 2) + 0.25 * (streak - 0.5) - (knot ? 0.3 : 0)));
  });
}

/** Staves round an upright axis (`around: "y"`, centre [x, z]) or a lying one along z (centre [x, y]). */
function staves(around: "y" | "z", at: [number, number], n: number, ramp: readonly string[] = WOOD, cell = TEXEL) {
  return cellPaint(cell, (c) => {
    const u = c.at.x - at[0];
    const v = around === "y" ? c.at.z - at[1] : c.at.y - at[1];
    const seg = ((Math.atan2(v, u) + Math.PI) / (2 * Math.PI)) * n;
    const k = Math.floor(seg);
    if (seg - k < 0.12) return WOOD_SEAM;
    return c.pick(ramp, clamp01(0.3 + 0.5 * hash(k, 5) + 0.1 * (c.random(6) - 0.5)));
  });
}

/** Flagstones 40 cm across with one-cell grout, a few dark pits and moss patches on the top faces. */
const FLAGS = cellPaint(TEXEL, (c) => {
  const fx = c.at.x / 0.4;
  const fz = c.at.z / 0.4;
  const gx = fx - Math.floor(fx);
  const gz = fz - Math.floor(fz);
  if (gx < 0.05 || gz < 0.05) return SHADOW;
  if (c.random(9) < 0.03) return SHADOW;
  const patch = hash(Math.floor(c.at.x / 0.13), Math.floor(c.at.z / 0.13));
  if (c.axis === 1 && patch > 0.8) return c.pick(MOSS, clamp01(0.2 + 0.6 * c.random(3)));
  return c.pick(STONE, clamp01(0.25 + 0.55 * hash(Math.floor(fx), Math.floor(fz)) + 0.12 * (c.random(4) - 0.5)));
});

/** The pit floor: black with dried blood flecks. */
const PIT_FLOOR = cellPaint(TEXEL, (c) => (c.random(4) < 0.2 ? BLOOD[0] : c.random(5) < 0.3 ? "#1a1419" : SHADOW));

/** Running-bond masonry, 10 cm courses, for the spike pit rim. */
const BRICKS = cellPaint(TEXEL, (c) => {
  const row = Math.floor(c.at.y / 0.1);
  const h = c.axis === 0 ? c.at.z : c.at.x;
  const bx = (h + (row % 2 ? 0.14 : 0)) / 0.28;
  const gx = bx - Math.floor(bx);
  const gy = c.at.y / 0.1 - row;
  if (gx < 0.07 || gy < 0.1) return SHADOW;
  return c.pick(STONE, clamp01(0.3 + 0.5 * hash(Math.floor(bx), row) + 0.12 * (c.random(4) - 0.5)));
});

const IRON_P = cellPaint(FINE, (c) =>
  c.pick(IRON, clamp01(0.3 + 0.45 * (c.n.y * 0.5 + 0.5) + 0.1 * (c.random(8) - 0.5))),
);

/** Iron pressure plate: a rivet every 8 cells. */
const IRON_PLATE = cellPaint(FINE, (c) => {
  const rivet = Math.abs(c.u) % 8 === 2 && Math.abs(c.v) % 8 === 2;
  return rivet ? IRON[5] : c.pick(IRON, clamp01(0.35 + 0.25 * c.random(2)));
});

const GOLD_P = cellPaint(FINE, (c) =>
  c.random(3) < 0.08 ? "#fff3b0" : c.pick(GOLD, clamp01(0.4 + 0.4 * (c.n.y * 0.5 + 0.5))),
);

const BONE_P = cellPaint(FINE, (c) => {
  if (c.random(2) < 0.04) return BONE[0];
  return c.pick(BONE, clamp01(0.35 + 0.45 * (c.n.y * 0.5 + 0.5) + 0.15 * (c.random(5) - 0.5)));
});

const CLOTH_P = cellPaint(FINE, (c) => c.pick(CLOTH, clamp01(0.3 + 0.6 * c.random(3))));

/** A cranium: eye sockets and a nose on the +z face, bone elsewhere. */
function skullPaint(cx: number, cy: number) {
  return cellPaint(FINE, (c) => {
    const lx = c.at.x - cx;
    const ly = c.at.y - cy;
    if (c.n.z > 0.5) {
      if (Math.hypot(Math.abs(lx) - 0.035, ly - 0.012) < 0.024) return SHADOW;
      if (Math.abs(lx) < 0.008 && ly < -0.005 && ly > -0.03) return SHADOW;
    }
    return c.pick(BONE, clamp01(0.4 + 0.4 * (c.n.y * 0.5 + 0.5) + 0.12 * (c.random(6) - 0.5)));
  });
}

/** A jaw front: alternating teeth and gaps on the +z face. */
function jawPaint(cx: number) {
  return cellPaint(FINE, (c) => {
    if (c.n.z > 0.5) {
      const k = Math.floor((c.at.x - cx + 0.06) / 0.016);
      return Math.abs(k) % 2 === 0 ? BONE[3] : SHADOW;
    }
    return BONE[2];
  });
}

/** A splatter of blood on the floor: a rough disc with drips. */
const BLOOD_TEX = pixelTexture(16, 16, (g) => {
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5) + (hash(x, y) - 0.5) * 3.2;
      if (d < 4.4) g.set(x, y, d < 2.4 ? BLOOD[2] : BLOOD[1]);
    }
  for (const [x, y] of [
    [4, 14],
    [11, 13],
    [13, 4],
  ])
    g.set(x, y, BLOOD[1]);
});

/** A skull-and-cross label, painted cream on the barrel. */
const LABEL = pixelArt(
  [
    "............",
    "..kkkkkkkk..",
    ".kwwwwwwwwk.",
    "kwwwwwwwwwwk",
    "kwkkwwwwkkwk",
    "kwkkwwwwkkwk",
    "kwwwwkkwwwwk",
    "kwwwwkkwwwwk",
    ".kwwwkkwwwk.",
    "..kwkwwkwk..",
    "..kwwwwwwk..",
    "...kkkkkk...",
  ],
  { k: INK, w: BONE[4] },
);

/** A pixel cobweb: eight spokes and three partial rings. */
const COBWEB_TEX = pixelTexture(24, 24, (g) => {
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    for (let s = 1; s <= 11; s++) g.set(Math.round(12 + Math.cos(a) * s), Math.round(12 + Math.sin(a) * s), "#d4d8e2");
  }
  for (const r of [4, 7, 10])
    for (let k = 0; k < 96; k++) {
      if (hash(k, r) < 0.3) continue;
      const a = (k / 96) * Math.PI * 2;
      g.set(Math.round(12 + Math.cos(a) * r), Math.round(12 + Math.sin(a) * r), "#d4d8e2");
    }
});

/** Rope: cords of tone, rough at the cell level. */
const ROPE_P = cellPaint(FINE, (c) => c.pick(ROPE, clamp01(0.3 + 0.6 * c.random(3))));

/** Barrel radius at height fraction t: bellied in the middle, tapered to both ends. */
const bulge = (R: number, t: number) => R * (0.84 + 0.16 * Math.sin(Math.PI * t));

/** A barrel's solid cross-section, from the axis, out along the belly and back to the axis. */
function barrelProfile(R: number, L: number): [number, number][] {
  const pts: [number, number][] = [[0, 0]];
  for (let k = 0; k <= 6; k++) pts.push([bulge(R, k / 6), (L * k) / 6]);
  pts.push([0, L]);
  return pts;
}

function merge(geos: THREE.BufferGeometry[]) {
  const g = mergeGeometries(geos);
  if (!g) throw new Error("mergeGeometries: the pieces' attributes differ");
  return g;
}

export default function build() {
  const b = createBuilder({ name: "dungeonProps", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);

  // Geometry built in model space, placed on a bone with at [0, 0, 0] so the vertices stay where they are.
  const put = (geo: THREE.BufferGeometry, fill: Fill, bone: JointRef = root) =>
    b.part(geo, fill, { bone, at: [0, 0, 0] });
  const boxAt = (size: [number, number, number], at: [number, number, number], fill: Fill, bone: JointRef = root) =>
    put(new THREE.BoxGeometry(...size).translate(...at), fill, bone);

  // Floor: a 3.2 × 2.6 m flagstone slab, 4 cm thick, standing on y = 0.
  boxAt([3.2, 0.04, 2.6], [0, 0.02, 0], FLAGS);

  // ---- Treasure chest: back edge (hinge) at z = 0, front at z = 0.5, body 0.9 × 0.45 m, lid arch 0.14 m.
  const CX = -0.7;
  const CW = 0.9;
  const CH = 0.45;
  const CD = 0.5;
  const ZB = 0;
  const zc = ZB + CD / 2;
  boxAt([CW, CH, CD], [CX, CH / 2, zc], planks("y", 0.09));
  boxAt([CW - 0.08, 0.01, CD - 0.08], [CX, CH + 0.002, zc], SHADOW); // dark interior, seen when the lid is up
  for (const dx of [-0.3, 0.3]) {
    boxAt([0.045, CH, 0.012], [CX + dx, CH / 2, CD + 0.006], IRON_P); // front straps
    boxAt([0.045, CH, 0.012], [CX + dx, CH / 2, ZB - 0.006], IRON_P); // back straps
  }
  for (const dx of [-0.43, 0.43]) boxAt([0.05, CH, 0.012], [CX + dx, CH / 2, CD + 0.006], IRON_P); // corner caps
  for (const dx of [-0.38, 0.38])
    for (const dz of [0.19, zc - ZB - 0.19]) boxAt([0.07, 0.03, 0.07], [CX + dx, 0.015, ZB + dz], IRON_P); // feet
  boxAt([0.13, 0.15, 0.014], [CX, 0.27, CD + 0.007], GOLD_P); // lock plate
  boxAt([0.024, 0.07, 0.016], [CX, 0.26, CD + 0.008], SHADOW); // keyhole
  for (const [dx, dy] of [
    [-0.055, 0.065],
    [0.055, 0.065],
    [-0.055, -0.065],
    [0.055, -0.065],
  ])
    boxAt([0.014, 0.014, 0.016], [CX + dx, 0.27 + dy, CD + 0.008], IRON_P); // lock rivets
  b.rod([CX - 0.45, CH, ZB], [CX + 0.45, CH, ZB], 0.012, { color: IRON_P, bone: root }); // hinge pin
  // Rivets down each strap and corner cap, one merged iron part.
  const rivets: THREE.BufferGeometry[] = [];
  for (const dx of [-0.43, -0.3, 0.3, 0.43])
    for (const y of [0.05, 0.15, 0.25, 0.35, 0.42])
      rivets.push(new THREE.SphereGeometry(0.008, 4, 3).translate(CX + dx, y, CD + 0.014));
  put(merge(rivets), IRON_P);

  // Gold heap inside, domed toward the middle.
  const heap: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 52; i++) {
    const u = rand() * 2 - 1;
    const w = rand() * 2 - 1;
    const dome = Math.max(0, 1 - (u * u + w * w));
    const x = CX + u * 0.33;
    const z = zc + w * 0.18;
    const y = CH + 0.004 + 0.07 * dome * dome + rand() * 0.012;
    heap.push(
      new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8)
        .rotateY(rand() * 3)
        .rotateX((rand() - 0.5) * 0.5)
        .translate(x, y, z),
    );
  }
  put(merge(heap), GOLD_P);
  for (const [dx, dz, dy, colour] of [
    [-0.1, 0.02, 0.075, "#c42a3e"],
    [0.12, -0.04, 0.07, "#2fae62"],
    [0.02, 0.07, 0.09, "#3d7be0"],
  ] as const)
    put(new THREE.OctahedronGeometry(0.016).translate(CX + dx, CH + dy, zc + dz), colour);

  // The lid: a stepped (pixel) arch hinged on the back edge, with two iron bands riding its top.
  const lid = b.joint("chestLid", { parent: root, at: [CX, CH, ZB], role: "hinge" });
  const LID_H = 0.14;
  const cols = 25;
  const cell = CD / cols;
  const archH = (u: number) => LID_H * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
  const cells = (i: number) => Math.max(1, Math.round(archH((i + 0.5) / cols) / cell));
  const spans = Array.from({ length: cols }, (_, i) => [0, cells(i)] as [number, number]);
  b.extrude(stepped(spans, cell), {
    at: [CX, CH, ZB],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: CW,
    color: planks("x", 0.1),
    bone: lid,
  });
  for (const dx of [-0.3, 0.3]) {
    const band = Array.from(
      { length: cols },
      (_, i) => [CX + dx, CH + cells(i) * cell + 0.002, ZB + (i + 0.5) * cell] as [number, number, number],
    );
    b.sweep(polyline(band), 0.009, { color: IRON_P, bone: lid, section: "box" });
  }

  // Coins scattered on the floor in front of the chest.
  const scatter: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++)
    scatter.push(
      new THREE.CylinderGeometry(0.02, 0.02, 0.005, 8)
        .rotateY(rand() * 3)
        .translate(-0.62 + rand() * 0.17, 0.0445, 0.6 + rand() * 0.25),
    );
  put(merge(scatter), GOLD_P);

  // ---- Torches: tripod iron feet, a wrapped wooden pole, an iron cresset and a four-tongue flame.
  const torch = (x: number, z: number) => {
    const hub: [number, number, number] = [x, 0.26, z];
    for (const deg of [90, 210, 330]) {
      const a = (deg * Math.PI) / 180;
      b.rod(hub, [x + 0.2 * Math.cos(a), 0, z + 0.2 * Math.sin(a)], 0.011, { color: IRON_P, bone: root });
    }
    const feet: THREE.BufferGeometry[] = [];
    for (const deg of [90, 210, 330]) {
      const a = (deg * Math.PI) / 180;
      feet.push(new THREE.CylinderGeometry(0.028, 0.03, 0.01, 8).translate(x + 0.2 * Math.cos(a), 0.005, z + 0.2 * Math.sin(a)));
    }
    put(merge(feet), IRON_P);
    put(new THREE.SphereGeometry(0.034, 8, 6).translate(...hub), IRON_P);
    b.rod([x, 0.26, z], [x, 1.2, z], 0.025, { color: staves("y", [x, z], 6, WOOD, FINE), bone: root });
    for (const y of [0.55, 0.92])
      put(new THREE.TorusGeometry(0.03, 0.008, 6, 12).rotateX(Math.PI / 2).translate(x, y, z), IRON_P);
    put(new THREE.CylinderGeometry(0.036, 0.033, 0.12, 8).translate(x, 1.1, z), CLOTH_P);
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.1, 0.05],
        [0.115, 0.13],
        [0.095, 0.13],
        [0.08, 0.06],
        [0, 0.06],
      ],
      { at: [x, 1.2, z], segments: 10, color: IRON_P, bone: root },
    );
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      b.rod(
        [x + 0.11 * Math.cos(a), 1.25, z + 0.11 * Math.sin(a)],
        [x + 0.1 * Math.cos(a), 1.37, z + 0.1 * Math.sin(a)],
        0.007,
        { color: IRON_P, bone: root },
      );
    }
    put(new THREE.TorusGeometry(0.105, 0.007, 6, 16).rotateX(Math.PI / 2).translate(x, 1.37, z), IRON_P);
    // Pixel flame: stepped tongues, each narrower and taller than the one outside it, drawn in two crossed planes
    // so the flame has volume from every side. Each plane is a glowing extrude.
    const CELL = 0.02;
    const flame = (heights: number[], colour: string) => {
      const w = heights.length * CELL;
      const outline = stepped(
        heights.map((h) => [0, h] as [number, number]),
        CELL,
      );
      for (const crossed of [false, true])
        glow(
          b.extrude(outline, {
            at: crossed ? [x, 1.26, z - w / 2] : [x - w / 2, 1.26, z],
            x: crossed ? [0, 0, 1] : [1, 0, 0],
            y: [0, 1, 0],
            thickness: 0.03,
            color: colour,
            bone: root,
          }),
          1.2,
        );
    };
    flame([4, 8, 11, 13, 11, 8, 4], "#d8431b");
    flame([7, 11, 14, 11, 7], "#f47a1f");
    flame([8, 15, 8], "#fff0a0");
  };
  torch(-1.35, -0.95);
  torch(1.35, -1.0);

  // ---- Barrels: staves, iron hoops, lids. Two stand, one lies along z.
  const barrel = (x: number, z: number, R: number, H: number, label: boolean, ramp: readonly string[] = WOOD) => {
    const body = b.lathe(barrelProfile(R, H), {
      at: [x, 0, z],
      segments: 12,
      color: staves("y", [x, z], 12, ramp),
      bone: root,
    });
    for (const t of [0.1, 0.5, 0.9])
      put(new THREE.TorusGeometry(bulge(R, t) + 0.005, 0.011, 6, 16).rotateX(Math.PI / 2).translate(x, H * t, z), IRON_P);
    put(
      new THREE.CylinderGeometry(bulge(R, 1) - 0.008, bulge(R, 1) - 0.008, 0.02, 12).translate(x, H - 0.002, z),
      planks("x", 0.07),
    );
    const studs: THREE.BufferGeometry[] = [];
    for (const t of [0.1, 0.5, 0.9])
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        const r = bulge(R, t) + 0.006;
        studs.push(new THREE.SphereGeometry(0.009, 4, 3).translate(x + r * Math.cos(a), H * t, z + r * Math.sin(a)));
      }
    put(merge(studs), IRON_P);
    if (label) b.decal(body, LABEL, { at: [x, H * 0.5, z + R], dir: [0, 0, 1], size: [0.16, 0.16], lift: 0.003 });
  };
  const lying = (x: number, z: number, R: number, L: number) => {
    b.lathe(barrelProfile(R, L), {
      at: [x, R, z - L / 2],
      axis: [0, 0, 1],
      segments: 12,
      color: staves("z", [x, R], 12),
      bone: root,
    });
    for (const t of [0.1, 0.5, 0.9])
      put(new THREE.TorusGeometry(bulge(R, t) + 0.005, 0.011, 6, 16).translate(x, R, z - L / 2 + L * t), IRON_P);
    const studs: THREE.BufferGeometry[] = [];
    for (const t of [0.1, 0.5, 0.9])
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        const r = bulge(R, t) + 0.006;
        studs.push(new THREE.SphereGeometry(0.009, 4, 3).translate(x + r * Math.cos(a), R + r * Math.sin(a), z - L / 2 + L * t));
      }
    put(merge(studs), IRON_P);
    for (const sign of [-1, 1])
      put(
        new THREE.CylinderGeometry(bulge(R, 1) - 0.008, bulge(R, 1) - 0.008, 0.02, 12)
          .rotateX(Math.PI / 2)
          .translate(x, R, z + (sign * (L - 0.02)) / 2),
        planks("y", 0.07),
      );
  };
  barrel(0.5, -0.5, 0.27, 0.8, true);
  barrel(1.15, -0.45, 0.25, 0.72, false, WEATHERED);
  lying(1.2, 0.85, 0.27, 0.8);

  // ---- Bone pile: a skull with its jaw, femurs with knobbed ends, a flat rib set, finger bones.
  const SX = -0.78;
  const SY = 0.11;
  const SZ = 0.7;
  boxAt([0.15, 0.14, 0.15], [SX, SY, SZ], skullPaint(SX, SY));
  boxAt([0.12, 0.04, 0.09], [SX, 0.06, SZ + 0.05], jawPaint(SX));
  const femur = (p: [number, number, number], q: [number, number, number]) =>
    b.sweep(polyline([p, q]), (t) => 0.014 + 0.02 * Math.pow(Math.abs(2 * t - 1), 8), {
      color: BONE_P,
      bone: root,
    });
  femur([-1.3, 0.075, 0.62], [-0.9, 0.075, 0.92]);
  femur([-0.9, 0.105, 0.58], [-1.12, 0.105, 0.98]);
  femur([-0.75, 0.13, 1.16], [-1.16, 0.13, 1.2]);
  for (let k = 0; k < 4; k++) {
    const z = 0.14 + k * 0.12;
    b.sweep(arc([-1.42, 0.055, z], [-1.29, 0.055, z], [0, 1, 0], 165), 0.011, { color: BONE_P, bone: root });
  }
  for (const [p, q] of [
    [
      [-0.95, 0.05, 1.2],
      [-0.88, 0.05, 1.22],
    ],
    [
      [-1.5, 0.05, 1.02],
      [-1.46, 0.05, 1.07],
    ],
    [
      [-1.45, 0.05, 0.92],
      [-1.41, 0.05, 0.96],
    ],
  ] as const)
    b.sweep(polyline([p, q]), 0.008, { color: BONE_P, bone: root });

  // ---- Spike trap: a brick pit 0.9 × 0.7 m with a rim 10 cm high, square spikes, a hatch and a plate.
  const PX0 = -0.18;
  const PX1 = 0.88;
  const PZ0 = -0.08;
  const PZ1 = 0.78;
  const WALL = 0.08;
  const RIM = 0.1;
  const PXc = (PX0 + PX1) / 2;
  const PZc = (PZ0 + PZ1) / 2;
  boxAt([PX1 - PX0, RIM, WALL], [PXc, RIM / 2, PZ0 + WALL / 2], BRICKS);
  boxAt([PX1 - PX0, RIM, WALL], [PXc, RIM / 2, PZ1 - WALL / 2], BRICKS);
  boxAt([WALL, RIM, PZ1 - PZ0 - 2 * WALL], [PX0 + WALL / 2, RIM / 2, PZc], BRICKS);
  boxAt([WALL, RIM, PZ1 - PZ0 - 2 * WALL], [PX1 - WALL / 2, RIM / 2, PZc], BRICKS);
  boxAt([PX1 - PX0 - 2 * WALL, 0.004, PZ1 - PZ0 - 2 * WALL], [PXc, 0.042, PZc], PIT_FLOOR);
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 5; i++) {
      const x = 0.35 + (i - 2) * 0.16 + (j % 2 ? 0.08 : 0);
      const z = 0.12 + j * 0.165;
      const h = 0.2 + 0.07 * hash(i, j);
      b.spike([x, 0.042, z], [0, 1, 0], h, 0.024, { section: { ngon: 4 }, color: IRON_P, bone: root });
      if ((i + j) % 3 === 0)
        b.spike([x, 0.042 + h * 0.7, z], [0, 1, 0], h * 0.3, 0.008, {
          section: { ngon: 4 },
          color: BLOOD[2],
          bone: root,
        });
    }
  // The hatch, propped open at 40° on its back hinge, with two straps, a ring handle and a pin.
  const hatch = b.joint("trapHatch", { parent: root, at: [0.35, RIM, PZ0 + WALL / 2], role: "hinge" });
  boxAt([0.9, 0.03, 0.78], [0.35, RIM + 0.015, 0.35], planks("x", 0.15), hatch);
  for (const z of [0.2, 0.55]) boxAt([0.92, 0.008, 0.03], [0.35, RIM + 0.034, z], IRON_P, hatch);
  put(new THREE.TorusGeometry(0.035, 0.008, 6, 12).translate(0.35, RIM + 0.05, 0.5), IRON_P, hatch);
  b.rod([0.35 - 0.46, RIM, PZ0 + WALL / 2], [0.35 + 0.46, RIM, PZ0 + WALL / 2], 0.01, {
    color: IRON_P,
    bone: root,
  });
  // A pressure plate in front of the pit, riveted.
  boxAt([0.5, 0.02, 0.36], [0.35, 0.052, 0.98], IRON_PLATE);

  // Blood on the flagstones, and rubble.
  for (const [x, z, s] of [
    [-0.36, 0.72, 0.24],
    [0.1, -0.2, 0.2],
  ] as const)
    b.part(new THREE.PlaneGeometry(s, s).rotateX(-Math.PI / 2).translate(x, 0.0425, z), "#ffffff", {
      bone: root,
      at: [0, 0, 0],
      texture: BLOOD_TEX,
    });
  for (const [x, z, s] of [
    [-0.12, -0.4, 0.09],
    [0.02, -0.6, 0.07],
    [-0.4, -0.38, 0.1],
    [0.98, -0.1, 0.06],
  ] as const)
    put(new THREE.BoxGeometry(s, s * 0.7, s * 0.9).rotateY(rand() * 3).translate(x, s * 0.35, z), FLAGS);
  // Pebbles of fallen masonry on the open floor.
  const pebbles: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-1.5, -0.45],
    [-1.25, -0.25],
    [-0.55, -0.2],
    [-0.3, -0.25],
    [0.1, -0.95],
    [0.7, -0.95],
    [0.7, 1.12],
    [-0.35, 1.2],
  ] as const) {
    const s = 0.025 + 0.02 * rand();
    pebbles.push(new THREE.BoxGeometry(s, s * 0.6, s * 0.8).rotateY(rand() * 3).translate(x, s * 0.3, z));
  }
  put(merge(pebbles), FLAGS);

  // A coil of rope on the floor by the pit, a cobweb laid over barrel B's lid, and two more bones.
  for (let i = 0; i < 6; i++)
    put(
      new THREE.TorusGeometry(0.085, 0.012, 6, 16)
        .rotateX(Math.PI / 2)
        .translate(-0.05 + (i % 2 ? 0.012 : -0.012), 0.052 + i * 0.024, 1.15),
      ROPE_P,
    );
  b.part(new THREE.PlaneGeometry(0.34, 0.34).rotateX(-Math.PI / 2).translate(1.15, 0.735, -0.45), "#ffffff", {
    bone: root,
    at: [0, 0, 0],
    texture: COBWEB_TEX,
  });
  b.sweep(polyline([[-1.3, 0.05, 1.12], [-1.22, 0.05, 1.14]]), 0.011, { color: BONE_P, bone: root });
  b.sweep(polyline([[-0.55, 0.05, 0.95], [-0.45, 0.05, 0.98]]), 0.012, { color: BONE_P, bone: root });
  b.pose(lid, { axis: [1, 0, 0], deg: -62 });
  b.pose(hatch, { axis: [1, 0, 0], deg: -40 });
  return b.root;
}
