// A koala sitting on a eucalyptus branch, gripping it with all four paws, on a log-slice stand. Pixel art: every
// surface is a hard square texel (kit paints, skin boxes, pixel cards), one texel size for the animal and double for
// the wooden stand.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng, vec } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { noise, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import type { Part } from "../../../../src/parts";
import { catmull, polyline } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, skinBox, skinLayout, snapColor, stepped, tileBox } from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on a Eucalyptus Perch",
  description:
    "A pixel-art koala sitting on a eucalyptus branch, gripping it with hands and feet, on a log-slice stand with peeling gum bark, twine, leaf litter and silver-blue foliage.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.0125; // the animal
const WTEXEL = 0.025; // the stand

const S = (c: string) => snapColor(c, 32);
const ramp = (list: string[]) => list.map(S);

// ---------------------------------------------------------------------------------------------------------------
// Palettes
const FUR = ramp(["#2c2d36", "#454654", "#62636f", "#82838f", "#a6a7b0", "#cbccd2"]);
const CREAM = ramp(["#8f8a80", "#b4aea2", "#d3ccbd", "#ebe6d6", "#f8f4ea"]);
const MUZ = ramp(["#8e857f", "#a89f97", "#beb6ad", "#d3ccc3"]);
const SPOT = ramp(["#4a3b3c", "#6a5750"]);
const PAWR = ramp(["#15131a", "#241f27", "#38323b", "#524a54"]);
const WOOD = ramp(["#3a2515", "#58381f", "#7a5230", "#9a6c40", "#b98a58"]);
const PALE = ramp(["#8f8873", "#b2ab96", "#cfc8b1", "#e5dfc9"]);
const DARKB = ramp(["#3f362c", "#5c4f3e", "#76664f"]);
const ORANGE = ramp(["#9c5636", "#bf7a50", "#dd9d6c"]);
const MOSS = ramp(["#2a4424", "#40642c", "#5f8a38"]);
const TWIGR = ramp(["#46302a", "#6a4636", "#8a5a46", "#a8765c"]);
const TWINE = ramp(["#6b5130", "#8d6e45", "#b8955d"]);
const STONE = ramp(["#4b4c54", "#6a6b74", "#8b8c96", "#aeaeb6"]);
const CLAW = "#d8cdb4";
const NAIL = "#2b2a30";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Paints
const furNoise = (p: THREE.Vector3, seed: number) => noise(V(p.x * 2.4, p.y * 0.6, p.z * 2.4), 0.1, seed);

/** The koala's coat: grey dithered fur with vertical streaks, a cream chest bib and a pale spotted rump. */
const COAT = cellPaint(
  TEXEL,
  (c: Cell) => {
    const p = c.at;
    const streak = furNoise(p, 4) - 0.5;
    const fleck = c.random(1) - 0.5;
    const bib =
      (1 - smoothstep(0.1, 0.18, Math.abs(p.x))) *
      smoothstep(0.58, 0.7, p.y) *
      (1 - smoothstep(0.9, 0.98, p.y)) *
      smoothstep(0.0, 0.5, c.n.z + 0.15);
    if (bib > c.threshold) return c.pick(CREAM, 0.55 + 0.7 * streak + 0.3 * (c.random(2) - 0.5));
    const rump = smoothstep(0.72, 0.56, p.y) * smoothstep(0.02, -0.1, p.z) * smoothstep(0.7, 0.2, c.n.z);
    if (rump > c.threshold) {
      if (noise(p, 0.075, 9) > 0.6) return c.pick(SPOT, 0.5 + 0.8 * fleck);
      return c.pick(FUR, 0.78 + 0.5 * streak + 0.2 * fleck);
    }
    // inner thighs and forearms a touch lighter, tops darker
    const v = 0.5 + 0.2 * c.n.y + 0.7 * streak + 0.18 * fleck + (p.y > 0.95 ? 0.0 : 0.0);
    return c.pick(FUR, v);
  },
  { dither: true },
);

const PAW = cellPaint(TEXEL, (c: Cell) => c.pick(PAWR, 0.35 + 0.5 * c.random(5) + 0.2 * c.n.y), { dither: true });

const TWIG = cellPaint(TEXEL, (c: Cell) => c.pick(TWIGR, 0.4 + 0.6 * noise(c.at, 0.05, 3) + 0.2 * (c.random(2) - 0.5)), {
  dither: true,
});

const TWINEP = cellPaint(TEXEL, (c: Cell) => c.pick(TWINE, 0.3 + 0.7 * c.random(7)), { dither: true });

const barkNoise = (p: THREE.Vector3, size: number, seed: number) =>
  noise(V(p.x * 4, p.y * 0.5, p.z * 4), size, seed);

/** Eucalyptus gum bark: pale cream, salmon patches where it peeled, dark ribbons, moss at the foot. */
const BARK = cellPaint(
  WTEXEL,
  (c: Cell) => {
    const p = c.at;
    const a = barkNoise(p, 0.2, 2);
    const b2 = barkNoise(p, 0.1, 5);
    if (p.y < 0.3 && noise(p, 0.12, 8) > 0.56 - (0.3 - p.y)) return c.pick(MOSS, b2 + 0.2 * (c.random(4) - 0.5));
    if (c.random(3) < 0.035) return DARKB[0];
    if (a > 0.64) return c.pick(ORANGE, b2 + 0.25 * (c.random(1) - 0.5));
    if (a < 0.33) return c.pick(DARKB, b2 * 1.2);
    return c.pick(PALE, 0.25 + 0.75 * b2 + 0.2 * (c.random(6) - 0.5));
  },
  { dither: true },
);

/** The seat branch: the same bark, plus growth rings on its sawn end. */
const BRANCH = cellPaint(
  WTEXEL,
  (c: Cell) => {
    if (c.n.z > 0.85 && c.at.z > 0.3) {
      const r = Math.hypot(c.at.x, c.at.y - 0.47);
      const ring = 0.5 + 0.5 * Math.sin(r * 180 + noise(c.at, 0.04, 1) * 3);
      return c.pick(WOOD, 0.45 + 0.4 * ring);
    }
    const a = barkNoise(c.at, 0.2, 11);
    const b2 = barkNoise(c.at, 0.1, 12);
    if (c.random(3) < 0.04) return DARKB[0];
    if (a > 0.66) return c.pick(ORANGE, b2);
    if (a < 0.36) return c.pick(DARKB, b2 * 1.2);
    return c.pick(PALE, 0.3 + 0.7 * b2 + 0.2 * (c.random(6) - 0.5));
  },
  { dither: true },
);

/** The log-slice base: growth rings on top, bark round the rim. */
const SLICE = cellPaint(
  WTEXEL,
  (c: Cell) => {
    if (c.axis === 1) {
      const r = Math.hypot(c.at.x, c.at.z);
      const ring = 0.5 + 0.5 * Math.sin(r * 55 + noise(c.at, 0.25, 1) * 5);
      if (c.n.y < 0) return c.pick(WOOD, 0.15 + 0.2 * ring);
      return c.pick(WOOD, 0.35 + 0.5 * ring + 0.1 * (c.random(1) - 0.5));
    }
    const a = noise(V(c.at.x * 3, c.at.y * 0.4, c.at.z * 3), 0.18, 6);
    return c.pick(DARKB, 0.15 + 0.9 * a + 0.3 * (c.random(2) - 0.5));
  },
  { dither: true },
);

const PLANK = cellPaint(
  WTEXEL,
  (c: Cell) => {
    const seam = c.v % 3 === 0 ? 0.0 : 0.45;
    return c.pick(WOOD, seam + 0.4 * noise(c.at, 0.2, 3) + 0.2 * c.random(1));
  },
  { dither: true },
);

const STONEP = cellPaint(TEXEL * 2, (c: Cell) => c.pick(STONE, 0.3 + 0.6 * noise(c.at, 0.06, 2) + 0.2 * c.n.y + 0.2 * (c.random(3) - 0.5)), {
  dither: true,
});

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

/** A eucalyptus leaf, tip at the top and a stalk at the bottom, curved like a sickle. */
function longLeaf(pal: { d: string; g: string; l: string; v: string }) {
  const wp = [1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 1, 1];
  const shift = [-2, -2, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  return pixelTexture(5, 16, (g) => {
    wp.forEach((w, y) => {
      const cx = 2 + shift[y];
      if (y >= 14) {
        g.set(cx, y, "#8a7a52");
        return;
      }
      if (w === 1) g.set(cx, y, pal.d);
      if (w === 2) {
        g.set(cx, y, pal.g);
        g.set(cx + 1, y, pal.l);
      }
      if (w === 3) {
        g.set(cx - 1, y, y % 2 ? pal.g : pal.d);
        g.set(cx, y, pal.v);
        g.set(cx + 1, y, pal.l);
      }
    });
  });
}

/** A round juvenile ("silver dollar") leaf. */
function roundLeaf(pal: { d: string; g: string; l: string; v: string }) {
  return pixelTexture(7, 8, (g) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const d = Math.hypot(x - 3, y - 3);
        if (d > 3.3) continue;
        if (d > 2.5) g.set(x, y, pal.d);
        else if (x === 3) g.set(x, y, pal.v);
        else g.set(x, y, (x + y) % 2 ? pal.g : x < 3 ? pal.g : pal.l);
      }
    g.set(3, 7, "#8a7a52");
  });
}

const LEAF_A = longLeaf({ d: "#3d7566", g: "#5f9c86", l: "#86bea6", v: "#cfe6d2" });
const LEAF_B = longLeaf({ d: "#3a6a70", g: "#5a96a0", l: "#82bcbf", v: "#d2ecea" });
const LEAF_C = longLeaf({ d: "#4a7a4a", g: "#6ea35a", l: "#98c777", v: "#d8eab4" });
const LEAF_DRY = longLeaf({ d: "#6a3a22", g: "#92572f", l: "#b9803f", v: "#d9a85a" });
const LEAF_ROUND = roundLeaf({ d: "#5f8f90", g: "#8db9b6", l: "#aad2cb", v: "#d6ece6" });

const TUFT = pixelArt([".W..W.", ".WW.WW", "WWWWWw", "wwwwgg"], { W: "#ffffff", w: "#d8d8d8", g: "#b0b0b0" });

const STRIP = pixelTexture(3, 10, (g) => {
  for (let y = 0; y < 10; y++) {
    g.set(0, y, y % 3 === 0 ? "#8f8266" : "#a89c80");
    g.set(1, y, y < 2 ? "#cfc6ac" : "#e8e1c8");
    g.set(2, y, "#c4b99c");
  }
  g.set(1, 0, "#b4a688");
});

const GRASS = pixelArt([".g..g", ".gg.g", "gGg.g", "gGgGg", "GGGGg", "ddddd"], {
  g: "#7aa83e",
  G: "#9cc752",
  d: "#4a6a2c",
});

const MUSH = pixelArt(["rrwr", "rrrr", "wrrr", "rwrr"], { r: "#c8402e", w: "#f2e6d0" });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "koala" });
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const furParts: Part[] = [];

  /** A world-aligned box on a bone. */
  const box = (w: number, h: number, d: number, at: V3, bone: Joint, color: ColorInput, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, name });

  /** A box between two points, its length along the a→b axis, w across x and d across z. */
  const seg = (a: V3, c: V3, w: number, d: number, color: ColorInput, bone: Joint, name?: string) => {
    const A = vec(a);
    const B = vec(c);
    return b.part(new THREE.BoxGeometry(w, A.distanceTo(B), d), color, {
      bone,
      at: A.clone().lerp(B, 0.5),
      dir: B.clone().sub(A),
      name,
    });
  };

  // =============================================================================================================
  // STAND: log slice, gum trunk, braces, seat branch
  // =============================================================================================================
  const disc = (R: number, cell: number) => {
    const spans: [number, number][] = [];
    for (let i = 0; i < 2 * R; i++) {
      const dy = i + 0.5 - R;
      const hw = Math.max(1, Math.round(Math.sqrt(R * R - dy * dy)));
      spans.push([-hw, hw]);
    }
    return stepped(spans, cell, { rows: true, start: -R });
  };
  b.extrude(disc(20, WTEXEL), {
    at: [0, 0.025, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.05,
    color: SLICE,
    bone: stand,
    name: "slice.low",
  });
  b.extrude(disc(17, WTEXEL), {
    at: [0, 0.075, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.05,
    color: SLICE,
    bone: stand,
    name: "slice.top",
  });

  // Trunk
  const trunkPath = catmull([
    [0.0, 0.08, -0.31],
    [0.012, 0.5, -0.27],
    [-0.012, 0.95, -0.21],
    [0.0, 1.35, -0.17],
    [0.025, 1.6, -0.12],
  ]);
  const trunk = b.sweep(trunkPath, [0.1, 0.085, 0.065, 0.045, 0.018], {
    bone: stand,
    color: BARK,
    caps: "point",
    sides: 8,
    name: "trunk",
  });

  // Twine wraps at the foot of the trunk
  for (const t of [0.07, 0.1, 0.13]) {
    const c = trunkPath.at(t);
    const rad = 0.1 - 0.025 * t * 4 + 0.01;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push(V(c.x + Math.cos(a) * rad, c.y + 0.012 * Math.sin(a * 2), c.z + Math.sin(a) * rad));
    }
    b.sweep(catmull(pts, { closed: true }), 0.0085, { bone: stand, color: TWINEP, sides: 4, name: "twine" });
  }

  // Seat branch (the koala sits on it), with a sawn end
  const seatPath = catmull([
    [0, 0.45, -0.3],
    [0, 0.455, 0.0],
    [0, 0.468, 0.28],
    [0, 0.48, 0.42],
  ]);
  b.sweep(seatPath, [0.054, 0.05, 0.042], {
    bone: stand,
    color: BRANCH,
    caps: "flat",
    sides: 8,
    name: "seat",
  });
  // a broken stub under the seat and a knot ring where it leaves the trunk
  b.rod([0.0, 0.34, -0.3], [0.0, 0.4, -0.12], [0.03, 0.02], BRANCH, { bone: stand, sides: 6, name: "seatProp" });

  // Upper limbs of the tree
  const limbL = catmull([
    [-0.012, 1.0, -0.21],
    [0.11, 1.17, -0.17],
    [0.27, 1.33, -0.1],
    [0.41, 1.5, -0.04],
  ]);
  const limbR = catmull([
    [-0.012, 1.06, -0.21],
    [-0.12, 1.2, -0.15],
    [-0.26, 1.31, -0.06],
    [-0.35, 1.47, 0.01],
  ]);
  b.sweep(limbL, [0.042, 0.03, 0.012], { bone: stand, color: BARK, caps: "point", sides: 6, name: "limbL" });
  b.sweep(limbR, [0.038, 0.026, 0.01], { bone: stand, color: BARK, caps: "point", sides: 6, name: "limbR" });

  // Broken branch stubs on the trunk's back and sides
  for (const [y, x, z, dx, dz] of [
    [0.75, 0.08, -0.28, 0.5, -0.8],
    [1.2, -0.06, -0.24, -0.6, -0.7],
    [0.3, -0.09, -0.36, -0.6, -0.5],
  ]) {
    const base = V(x, y, z);
    b.rod(base, base.clone().add(V(dx * 0.1, 0.03, dz * 0.1)), [0.024, 0.018], BRANCH, {
      bone: stand,
      sides: 6,
      name: "stub",
    });
  }

  // Braces: two planks from the log slice up to the trunk, bolted
  for (const s of [1, -1]) {
    seg([s * 0.27, 0.1, -0.2], [s * 0.05, 0.52, -0.3], 0.07, 0.035, PLANK, stand, "brace");
    for (const [bx, by, bz] of [
      [s * 0.215, 0.2, -0.235],
      [s * 0.105, 0.4, -0.285],
    ] as const)
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.012), "#3a3a42", { bone: stand, at: [bx, by, bz + 0.02], name: "bolt" });
  }

  // Bark strips peeling off the trunk
  {
    const hits = b
      .surface(trunk)
      .scatter(34, { rng: rng(41), minDist: 0.1, filter: (h) => h.at.y > 0.25 && h.at.y < 1.4 && h.n.y > -0.4 });
    b.cards(hits, STRIP, {
      size: [0.0375, 0.14],
      lean: 50,
      bend: 18,
      flow: [0, -1, 0],
      vary: 0.3,
      spin: 25,
      rng: rng(42),
      bone: stand,
      cross: false,
    });
  }

  // Leaf litter, grass, pebbles and mushrooms on the log slice
  {
    const r = rng(77);
    const litter: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2;
      const d = 0.2 + r() * 0.2;
      litter.push(frame([Math.cos(a) * d, 0.1, Math.sin(a) * d], [0, 1, 0]));
    }
    b.cards(litter, [LEAF_DRY, LEAF_A, LEAF_DRY, LEAF_C], {
      size: [0.0625, 0.16],
      lean: 90,
      flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
      mirror: true,
      vary: 0.25,
      rng: rng(78),
      bone: stand,
      sink: 0,
    });
    const tufts: ReturnType<typeof frame>[] = [];
    for (const [x, z] of [
      [0.33, 0.12],
      [-0.32, 0.2],
      [0.12, 0.36],
      [-0.3, -0.22],
      [0.28, -0.25],
      [-0.1, 0.38],
    ])
      tufts.push(frame([x, 0.1, z], [0, 1, 0]), frame([x + 0.03, 0.1, z - 0.02], [0, 1, 0]));
    b.cards(tufts, GRASS, {
      size: [0.0625, 0.0875],
      lean: 6,
      flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
      cross: true,
      vary: 0.3,
      rng: rng(79),
      bone: stand,
    });
    for (const [x, z, w, h, d] of [
      [0.38, 0.0, 0.07, 0.045, 0.06],
      [-0.36, -0.05, 0.06, 0.035, 0.05],
      [0.1, 0.39, 0.05, 0.03, 0.045],
      [-0.2, 0.34, 0.04, 0.025, 0.04],
    ])
      b.part(new THREE.BoxGeometry(w, h, d), STONEP, {
        bone: stand,
        at: [x, 0.1 + h / 2 - 0.006, z],
        rotation: [0, x * 200, 0],
        name: "pebble",
      });
    for (const [x, z, sc] of [
      [0.22, 0.3, 1],
      [-0.4, 0.1, 0.8],
    ] as const) {
      box(0.022 * sc, 0.05 * sc, 0.022 * sc, [x, 0.125, z], stand, "#eadfc8", "mushStem");
      b.part(tileBox([0.06 * sc, 0.022 * sc, 0.06 * sc], MUSH, TEXEL * sc), "#ffffff", {
        bone: stand,
        texture: MUSH,
        at: [x, 0.158 * 1 + (sc - 1) * 0.0, z],
        name: "mushCap",
      });
    }
  }

  // =============================================================================================================
  // KOALA SKELETON
  // =============================================================================================================
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.6, -0.05],
      [0, 0.74, -0.04],
      [0, 0.86, -0.02],
      [0, 0.95, 0.02],
    ]),
    { parent: stand, names: ["hips", "spine1", "spine2", "chest"], role: "spine" },
  );
  const [hips, spine1, spine2] = spine.joints;
  const chest = spine.tip!;
  const neck = b.chain("neck", polyline([[0, 0.95, 0.02], [0, 1.0, 0.05]]), {
    parent: chest,
    names: ["neck"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 1.0, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.025 }),
    dir: [0, 0, 1],
    role: "jaw",
  });

  // =============================================================================================================
  // TORSO
  // =============================================================================================================
  const fur = (p: Part) => {
    furParts.push(p);
    return p;
  };
  fur(box(0.36, 0.19, 0.3, [0, 0.595, -0.05], hips, COAT, "rump"));
  fur(box(0.35, 0.14, 0.28, [0, 0.73, -0.04], spine1, COAT, "belly"));
  fur(box(0.33, 0.14, 0.26, [0, 0.85, -0.02], spine2, COAT, "upper"));
  fur(box(0.32, 0.1, 0.24, [0, 0.93, 0.0], chest, COAT, "shoulders"));
  fur(box(0.3, 0.2, 0.05, [0, 0.74, 0.115], spine1, COAT, "paunch"));
  fur(box(0.26, 0.12, 0.04, [0, 0.89, 0.12], chest, COAT, "bib"));
  fur(box(0.12, 0.1, 0.14, [0, 0.54, -0.18], hips, COAT, "rumpPad"));

  // =============================================================================================================
  // LIMBS
  // =============================================================================================================
  const grip = (
    s: number,
    name: string,
    parent: Joint,
    padC: V3,
    padSize: V3,
    zs: number[],
    drop: [number, number],
    thick: number,
    clawLen: number,
  ) => {
    const px = vec(padC);
    box(padSize[0], padSize[1], padSize[2], padC, parent, PAW, `${name}.pad`);
    zs.forEach((z, i) => {
      const base: V3 = [s * (Math.abs(px.x) + padSize[0] / 2 - 0.002), px.y - 0.006, z];
      const mid: V3 = [s * (Math.abs(px.x) + padSize[0] / 2 + 0.008), px.y - drop[0], z];
      const tip: V3 = [s * (Math.abs(px.x) + padSize[0] / 2 - 0.003), px.y - drop[1], z];
      const ch = b.chain(`${name}${i + 1}`, polyline([base, mid, tip]), {
        parent,
        names: [`${name}${i + 1}a`, `${name}${i + 1}b`],
        role: "digit",
      });
      const [ja, jb] = ch.joints;
      const w = thick;
      seg(base, mid, w, w * 0.88, PAW, ja, `${name}.digit`);
      seg(mid, tip, w * 0.9, w * 0.8, PAW, jb, `${name}.digit`);
      const dirv = vec(tip).sub(vec(mid)).normalize();
      seg(tip, vec(tip).addScaledVector(dirv, clawLen), w * 0.55, w * 0.5, CLAW, jb, `${name}.claw`);
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // ---- legs
    const hip: V3 = [s * 0.12, 0.6, -0.04];
    const knee: V3 = [s * 0.17, 0.66, 0.14];
    const ankle: V3 = [s * 0.065, 0.545, 0.22];
    const leg = b.chain(`leg${side}`, polyline([hip, knee, ankle]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const [hipJ, kneeJ] = leg.joints;
    const foot = leg.tip!;
    fur(seg(hip, knee, 0.15, 0.15, COAT, hipJ, "thigh"));
    fur(box(0.12, 0.12, 0.12, knee, kneeJ, COAT, "knee"));
    fur(seg(knee, ankle, 0.09, 0.09, COAT, kneeJ, "shin"));
    grip(s, `toe${side}`, foot, [s * 0.034, 0.518, 0.28], [0.06, 0.04, 0.1], [0.24, 0.2575, 0.275, 0.2925, 0.31], [0.05, 0.09], 0.017, 0.022);

    // ---- arms
    const shoulder: V3 = [s * 0.165, 0.92, 0.02];
    const elbow: V3 = [s * 0.205, 0.76, 0.08];
    const wrist: V3 = [s * 0.07, 0.545, 0.08];
    const arm = b.chain(`arm${side}`, polyline([shoulder, elbow, wrist]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const [shJ, elJ] = arm.joints;
    const hand = arm.tip!;
    fur(box(0.11, 0.11, 0.11, shoulder, shJ, COAT, "shoulder"));
    fur(seg(shoulder, elbow, 0.09, 0.09, COAT, shJ, "upperArm"));
    fur(box(0.085, 0.085, 0.085, elbow, elJ, COAT, "elbow"));
    fur(seg(elbow, wrist, 0.075, 0.075, COAT, elJ, "forearm"));
    grip(s, `finger${side}`, hand, [s * 0.032, 0.516, 0.12], [0.056, 0.036, 0.085], [0.088, 0.1055, 0.123, 0.1405, 0.158], [0.04, 0.075], 0.0165, 0.02);
  }

  // =============================================================================================================
  // HEAD
  // =============================================================================================================
  const layout = skinLayout({ cranium: [18, 12, 14], muzzle: [8, 5, 6], chin: [7, 3, 6], nose: [6, 4, 3] }, 64);
  const rr = rng(21);
  const furPx = (v: number, x: number, y: number, ramp: readonly string[] = FUR) =>
    pick(ramp, v + (rr() - 0.5) * 0.2, bayer(x, y));
  const EYE = ["wkk", "kkk", "kkk"];
  const SHEET = pixelTexture(layout.size[0], layout.size[1], (g) => {
    const L = layout.faces;
    // cranium
    g.fill((x, y) => furPx(0.7 - 0.1 * (y / 14), x, y), L.cranium.py);
    g.fill((x, y) => furPx(0.35 + 0.1 * (y / 14), x, y, CREAM), L.cranium.ny);
    g.fill((x, y) => furPx(0.42 + 0.12 * (y / 12), x, y), L.cranium.nz);
    for (const key of ["px", "nx"] as const)
      g.fill((x, y, w) => {
        const fx = key === "px" ? x : w - 1 - x;
        const cheek = fx < 7 && y > 5 - fx * 0.3;
        if (cheek) return furPx(0.55 + 0.35 * (1 - fx / 7) + 0.15 * ((y - 5) / 7), x, y, CREAM);
        return furPx(0.45 + 0.2 * (y / 12), x, y);
      }, L.cranium[key]);
    g.fill((x, y, w) => {
      const dx = Math.abs(x - (w - 1) / 2);
      if (y < 3) return furPx(0.34 + 0.05 * y, x, y);
      if (dx < 1.6 && y >= 4) return furPx(0.7 + 0.2 * ((y - 4) / 7), x, y, CREAM);
      if (dx > 5.5 && y > 6) return furPx(0.6 + 0.25 * ((y - 6) / 5), x, y, CREAM);
      return furPx(0.45 + 0.28 * (y / 11), x, y);
    }, L.cranium.pz);
    const f = L.cranium.pz;
    for (const ex of [2, 13]) {
      g.fill((x, y) => (x === 0 || y === 0 || x === 4 || y === 4 ? FUR[1] : ""), [f[0] + ex, f[1] + 4, 5, 5]);
      g.stamp(f[0] + ex + 1, f[1] + 5, EYE, { w: "#ffffff", k: "#0b0a10" });
    }
    // muzzle
    const m = L.muzzle;
    for (const key of ["px", "nx", "py", "ny", "nz"] as const) g.fill((x, y) => furPx(0.55 + 0.1 * (y / 4), x, y, MUZ), m[key]);
    g.fill((x, y, w) => {
      if (y === 4) return "#2a2226";
      if (y === 3 && (x === 0 || x === w - 1)) return "#2a2226";
      if ((x === 3 || x === 4) && y < 3) return "#6e6268";
      if ((x === 0 || x === 7) && y === 1) return "#3a3036";
      return furPx(0.55 + 0.1 * (y / 4), x, y, MUZ);
    }, m.pz);
    // chin
    const c = L.chin;
    for (const key of ["px", "nx", "py", "ny", "nz"] as const) g.fill((x, y) => furPx(0.8, x, y, CREAM), c[key]);
    g.fill((x, y) => (y === 0 ? "#2a2226" : furPx(0.85, x, y, CREAM)), c.pz);
    g.fill((x, y) => (x > 1 && x < 5 && y > 0 && y < 5 ? "#c47a84" : "#2a2226"), c.py);
    // nose
    const n = L.nose;
    const NOSE = ["#0c0b10", "#17161c", "#232128"];
    for (const key of ["px", "nx", "ny", "nz"] as const) g.fill((x, y) => furPx(0.4, x, y, NOSE), n[key]);
    g.fill((x, y) => ((x === 1 || x === 2) && y === 1 ? "#6a6772" : x === 2 && y === 2 ? "#3c3a44" : furPx(0.3, x, y, NOSE)), n.py);
    g.fill((x, y) => (y === 0 && x > 0 && x < 4 ? "#55525d" : (x === 1 || x === 4) && y === 2 ? "#040405" : furPx(0.3, x, y, NOSE)), n.pz);
  });
  const headPart = (key: keyof typeof layout.faces, at: V3, bone: Joint, name: string) =>
    b.part(skinBox(SHEET, layout.faces[key], TEXEL), "#ffffff", { bone, texture: SHEET, at, name });
  headPart("cranium", head.local({ forward: 0.02, up: 0.04 }), head, "cranium");
  headPart("muzzle", head.local({ forward: 0.13 }), head, "muzzle");
  headPart("nose", head.local({ forward: 0.165, up: 0.04 }), head, "nose");
  headPart("chin", head.local({ forward: 0.115, down: 0.045 }), jaw, "chin");

  // cheek fur ruffs: stepped zig-zags either side of the jaw
  for (const s of [1, -1]) {
    const ruff = stepped(
      [
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 4],
        [1, 3],
        [2, 3],
      ],
      TEXEL,
      { rows: true },
    );
    b.extrude(ruff, {
      at: head.local({ left: s * 0.108, down: 0.03, forward: 0.0 }),
      x: [0, 0, 1],
      y: [s * 0.3, -1, 0],
      thickness: 0.02,
      color: CREAM[3],
      bone: head,
      name: "ruff",
    });
  }

  // ears
  const EAR = stepped(
    [2, 3, 4, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]),
    TEXEL,
    { rows: true, start: -4.5 },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eAt = head.local({ left: s * 0.118, up: 0.078, forward: 0.0 });
    const ear = b.joint(`ear${side}`, { parent: head, at: eAt, dir: [s * 0.3, 1, 0], role: "hinge" });
    const earPaint = cellPaint(
      TEXEL,
      (c: Cell) => {
        const d = Math.hypot(c.at.x - eAt.x, c.at.y - eAt.y);
        const n = c.random(2) - 0.5;
        if (c.n.z > 0.35) {
          if (d < 0.026) return c.pick(CREAM, 0.7 + 0.5 * n);
          if (d < 0.046) return c.pick(CREAM, 0.95 + 0.5 * n);
          return c.pick(FUR, 0.45 + 0.5 * n);
        }
        if (c.n.z < -0.35) return c.pick(FUR, 0.42 + 0.3 * furNoise(c.at, 4) + 0.3 * n);
        return c.pick(FUR, 0.4 + 0.3 * n);
      },
      { dither: true },
    );
    const earPart = b.extrude(EAR, {
      at: eAt,
      x: [1, 0, -s * 0.35],
      y: [s * 0.2, 1, 0],
      thickness: 0.035,
      color: earPaint,
      bone: ear,
      name: "ear",
    });
    const tufts = b.surface(earPart).scatter(7, { rng: rng(60 + (s > 0 ? 1 : 2)), minDist: 0.03, filter: (h) => h.n.z > 0.4 });
    b.cards(tufts, TUFT, { size: 0.0375, lean: 50, flow: [0, -1, 0], color: "#f4efe2", rng: rng(66), vary: 0.2, bone: ear });
  }

  // =============================================================================================================
  // FUR TUFTS over the box silhouette
  // =============================================================================================================
  {
    const hits = b
      .surface(furParts)
      .scatter(150, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > -0.25 && h.at.y > 0.5 });
    b.cards(hits, TUFT, {
      size: [0.05, 0.04],
      lean: 62,
      flow: [0, -1, -0.15],
      color: COAT,
      rng: rng(6),
      vary: 0.25,
      spin: 30,
    });
  }

  // =============================================================================================================
  // FOLIAGE
  // =============================================================================================================
  const twig = (pts: V3[], r0: number, n: number, kind: "long" | "round", seed: number, from = 0.2) => {
    const path = catmull(pts);
    b.sweep(path, [r0, r0 * 0.35], { bone: stand, color: TWIG, sides: 4, caps: "point", name: "twig" });
    const r = rng(seed);
    const frames: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < n; i++) {
      const t = from + ((1 - from) * (i + r() * 0.6)) / n;
      const at = path.at(t);
      const tan = path.tangentAt(t);
      const side = new THREE.Vector3().crossVectors(tan, V(0, 1, 0));
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize().multiplyScalar(i % 2 ? 1 : -1);
      const dir = tan.clone().multiplyScalar(0.5).add(side.multiplyScalar(0.8)).add(V(0, r() * 0.5 - 0.1, 0)).normalize();
      frames.push(frame(at, dir));
    }
    const endT = path.tangentAt(1);
    for (let k = 0; k < 3; k++)
      frames.push(frame(path.at(1), endT.clone().add(V((k - 1) * 0.5, 0.2 * k, (k - 1) * 0.3)).normalize()));
    const tex = kind === "long" ? [LEAF_A, LEAF_B, LEAF_A, LEAF_C] : [LEAF_ROUND];
    b.cards(frames, tex, {
      size: kind === "long" ? [0.0625, 0.175] : [0.0875, 0.1],
      lean: kind === "long" ? 35 : 70,
      bend: kind === "long" ? 32 : 12,
      flow: (_f, i) => [Math.sin(i * 2.1) * 0.5, -1, Math.cos(i * 1.7) * 0.5],
      vary: 0.25,
      spin: 30,
      rng: r,
      bone: stand,
      sink: 0.05,
    });
    // gumnuts
    for (let i = 0; i < 2; i++) {
      const t = 0.45 + 0.35 * r() + i * 0.1;
      const p = path.at(t);
      box(0.02, 0.022, 0.02, [p.x, p.y - 0.026, p.z], stand, "#7a5a38", "gumnut");
      box(0.024, 0.008, 0.024, [p.x, p.y - 0.012, p.z], stand, "#4f3a28", "gumcap");
    }
  };
  // crown
  twig([[0.025, 1.55, -0.12], [0.02, 1.68, -0.1], [-0.04, 1.78, -0.05]], 0.012, 8, "long", 101, 0.0);
  twig([[0.27, 1.33, -0.1], [0.38, 1.38, 0.0], [0.5, 1.36, 0.1], [0.58, 1.28, 0.16]], 0.011, 10, "long", 102);
  twig([[0.41, 1.5, -0.04], [0.5, 1.62, -0.02], [0.58, 1.72, 0.02]], 0.01, 8, "long", 103, 0.1);
  twig([[-0.26, 1.31, -0.06], [-0.4, 1.38, 0.04], [-0.5, 1.34, 0.14], [-0.58, 1.26, 0.2]], 0.011, 10, "long", 104);
  twig([[-0.35, 1.47, 0.01], [-0.44, 1.6, 0.04], [-0.5, 1.7, 0.08]], 0.01, 8, "long", 105, 0.1);
  // lower side twigs, round juvenile leaves, beside the koala
  twig([[-0.02, 0.98, -0.2], [-0.16, 1.02, -0.1], [-0.3, 1.0, 0.0], [-0.42, 0.93, 0.1]], 0.016, 12, "round", 106);
  twig([[0.02, 0.9, -0.2], [0.18, 0.92, -0.12], [0.32, 0.86, -0.02], [0.44, 0.78, 0.08]], 0.016, 12, "round", 107);
  // the seat branch's leafy end
  twig([[0.0, 0.48, 0.41], [0.05, 0.56, 0.5], [0.1, 0.66, 0.56], [0.17, 0.74, 0.58]], 0.014, 10, "long", 108, 0.1);
  twig([[0.0, 0.48, 0.41], [-0.05, 0.52, 0.5], [-0.12, 0.6, 0.55], [-0.2, 0.62, 0.6]], 0.013, 10, "round", 109, 0.1);

  return b.root;
}
