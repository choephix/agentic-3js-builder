import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import {
  pixelArt,
  pixelTexture,
  tileBox,
  cellPaint,
  pick,
  bayer,
  snapColor,
} from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Monster Truck",
  description:
    "A bright red pixel-art monster truck on four giant tyres with live axles, coilover shocks, a flame-decalled cab, roll cage, light bar and exhaust stacks.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.04;
const FINE = 0.02;

// ---------- palette ----------
const P = (c: string) => snapColor(c, 64);
const RED = ["#3a0710", "#6e0c1c", "#a81428", "#d92034", "#f2503c", "#ff8a64"].map(P);
const STEEL = ["#14161e", "#2a2e3c", "#444a5e", "#656d86", "#8f98b4", "#c4cbe0"].map(P);
const RUBBER = ["#07070a", "#101014", "#1a1a22", "#272732", "#363644"].map(P);
const YELLOW = ["#7a4a00", "#c48a0c", "#ffc41e", "#ffe466"].map(P);
const GLASS = ["#0b2a44", "#14507c", "#2a86b8", "#7cd0e8", "#d4f6ff"].map(P);
const ORANGE = ["#8c2a06", "#d4520c", "#ff8a1c", "#ffc83c"].map(P);
const WHITE = P("#f4f4ee");
const BLACK = P("#0a0a10");
const CHROME = P("#c4cbe0");
const LAMP = P("#fff2a8");
const BEDLINER = ["#15161c", "#22242e", "#30333f"].map(P);
const MUD = ["#2a1a0e", "#4a2e18", "#6e4a28", "#8c6a3c"].map(P);

// ---------- textures ----------
const TREAD_TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => {
    const lug = (x + (y >> 3) * 4) % 8 < 5;
    if (y % 8 === 0) return RUBBER[0];
    return lug ? pick(RUBBER, 0.55 + 0.1 * bayer(x, y), bayer(x, y)) : RUBBER[1];
  });
});

const PANEL_TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => {
    const v = 0.62 + 0.12 * Math.sin(y * 0.4) + (bayer(x, y) - 0.5) * 0.15;
    return pick(RED, v, bayer(x, y));
  });
  g.fill((x, y) => (x === 15 || y === 15 ? RED[1] : undefined));
  g.fill((x, y) => (y === 0 ? RED[5] : undefined));
});

const BED_TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => (x % 4 === 0 ? BEDLINER[0] : pick(BEDLINER, 0.45 + 0.2 * ((y >> 1) % 2), bayer(x, y))));
});

const PLATE_TILE = pixelTexture(16, 16, (g) => {
  g.fill((x, y) => pick(STEEL, 0.45 + 0.22 * bayer(x, y) + (y < 2 ? 0.2 : 0) - (y > 13 ? 0.2 : 0), bayer(x, y)));
  for (const [x, y] of [[1, 1], [14, 1], [1, 14], [14, 14]] as const) g.set(x, y, STEEL[5]);
});

const FLAME = pixelArt(
  [
    "................................",
    "................................",
    "................................",
    "..y.............................",
    "..yo.....y..............y.......",
    ".yoo....yo.......y.....yo.......",
    ".yoor...yor.....yo....yoor......",
    ".yoorr..yorr...yoor..yoorrr.....",
    "yyoorrrryoorr.yyoorryyoorrrr.y..",
    "yooorrrrooorrryooorrooorrrrrryo.",
    "oooorrrrrooorrooorrrrooorrrrrroo",
    "rooorrrrrrooooooorrrrroorrrrrrrr",
    "rrooorrrrrrooooorrrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  ],
  { y: YELLOW[3], o: ORANGE[2], r: P("#c8141c") },
);

const FLAME_BACK = pixelArt(
  [
    "................",
    "..y.....y.......",
    ".yo....yo..y....",
    ".yor..yor.yo....",
    "yoorryoorryorr..",
    "oorrrorrrrorrrr.",
    "rrrrrrrrrrrrrrrr",
  ],
  { y: YELLOW[3], o: ORANGE[2], r: P("#c8141c") },
);

const GRILLE = pixelArt(
  [
    "kkkkkkkkkkkkkkkk",
    "kcccccccccccccck",
    "kkkkkkkkkkkkkkkk",
    "kcccccccccccccck",
    "kkkkkkkkkkkkkkkk",
    "kcccccccccccccck",
    "kkkkkkkkkkkkkkkk",
    "kcccccccccccccck",
    "kkkkkkkkkkkkkkkk",
  ],
  { k: STEEL[0], c: STEEL[4] },
);

const SKULL = pixelArt(
  [
    "..wwwwwwww..",
    ".wwwwwwwwww.",
    "wwwwwwwwwwww",
    "wkkkwwwwkkkw",
    "wkkkwwwwkkkw",
    "wwwwwkkwwwww",
    ".wwwwkkwwww.",
    "..wkwkwkwk..",
    "..wkwkwkwk..",
  ],
  { w: WHITE, k: BLACK },
);

const NUM = pixelArt(
  [
    "..wwww..",
    ".wwwwww.",
    "ww....ww",
    "......ww",
    "....www.",
    "..wwww..",
    ".www....",
    "ww......",
    "wwwwwwww",
    "wwwwwwww",
  ],
  { w: WHITE },
);

const STRIPE = pixelArt(
  ["yyyyyyyyyyyyyyyy", "wwwwwwwwwwwwwwww", "kkkkkkkkkkkkkkkk"],
  { y: YELLOW[2], w: WHITE, k: BLACK },
);

const CHECKER = pixelArt(
  [
    "wkwkwkwk",
    "kwkwkwkw",
    "wkwkwkwk",
    "kwkwkwkw",
  ],
  { w: WHITE, k: BLACK },
);

const HEADLIGHT = pixelArt(
  [
    ".wwww.",
    "wyyyyw",
    "wyyyyw",
    "wyyyyw",
    ".wwww.",
  ],
  { w: CHROME, y: LAMP },
);

const TAILLIGHT = pixelArt(
  [
    "kkkkkk",
    "krrrrk",
    "krhhrk",
    "krrrrk",
    "kkkkkk",
  ],
  { k: STEEL[0], r: P("#e0141c"), h: P("#ff8a78") },
);

const HUBCAP = pixelArt(
  [
    "....kkkk....",
    "..kkssssk k..".replace(" ", "k").replace(" ", "k"),
    ".ksssssssssk.",
    ".ksskkkkssck".padEnd(13, "k").slice(0, 13),
    "kssk.ww.kssk".padEnd(13, "k").slice(0, 13),
  ].length
    ? [
        "....kkkkkk....",
        "..kkssssssk k.".replace(/ /g, "k"),
        ".kssssssssssk.",
        ".ksskkkkkkssk.",
        "kssksyyyyksssk",
        "kssksyrryksssk",
        "kssksyrryksssk",
        "kssksyyyyksssk",
        ".ksskkkkkkssk.",
        ".kssssssssssk.",
        "..kkssssssk k.".replace(/ /g, "k"),
        "....kkkkkk....",
      ]
    : [],
  { k: STEEL[0], s: STEEL[3], y: YELLOW[2], r: P("#c8141c") },
);

const WINDOW_TEX = pixelArt(
  [
    "kkkkkkkkkkkkkkkk",
    "kddddddddddddddk",
    "kdmmddddddddddkk",
    "kdmmmdddddddddkk",
    "kddmmmmddddddddk",
    "kdddmmmmdddddddk",
    "kdddddmmmmddddkk",
    "kddddddddmmmmddk",
    "kddddddddddmmddk",
    "kddddddddddddddk",
    "kkkkkkkkkkkkkkkk",
  ],
  { k: STEEL[0], d: GLASS[1], m: GLASS[3] },
);

const LIGHTBAR_LENS = pixelArt(
  [
    "kkkkkkkk",
    "kwwhhwwk",
    "kwhhhhwk",
    "kwwhhwwk",
    "kkkkkkkk",
  ],
  { k: STEEL[0], w: LAMP, h: WHITE },
);

// ---------- paints ----------
const BODY_RED = cellPaint(
  TEXEL,
  (c) => {
    const v = 0.5 + 0.32 * c.n.y + 0.16 * (noise(c.at, 0.4, 3) - 0.5) + (c.random(9) < 0.04 ? 0.15 : 0);
    return c.pick(RED, Math.min(0.95, v + 0.1));
  },
  { dither: true },
);

const STEEL_PAINT = cellPaint(
  FINE * 1.5,
  (c) => c.pick(STEEL, 0.4 + 0.25 * c.n.y + 0.25 * (noise(c.at, 0.15, 5) - 0.5) + (c.random(4) < 0.06 ? 0.2 : 0)),
  { dither: true },
);

const DARK_STEEL = cellPaint(
  FINE * 1.5,
  (c) => c.pick(STEEL, 0.12 + 0.22 * c.n.y + 0.2 * (noise(c.at, 0.12, 6) - 0.5)),
  { dither: true },
);

const MUDDY = cellPaint(
  TEXEL,
  (c) => {
    const mud = 0.9 - c.at.y * 1.4 + 0.5 * (noise(c.at, 0.25, 8) - 0.5);
    if (mud > 0.5 + 0.2 * c.random(2)) return c.pick(MUD, 0.3 + 0.5 * noise(c.at, 0.1, 1));
    return c.pick(RUBBER, 0.35 + 0.2 * c.n.y + 0.2 * c.random(1));
  },
  { dither: true },
);

const COIL_PAINT = cellPaint(FINE, (c) => c.pick(YELLOW, 0.3 + 0.5 * ((c.u + c.v + c.depth) % 2 === 0 ? 1 : 0.4) + 0.1 * c.n.y));

const BLACK_TRIM = cellPaint(FINE * 1.5, (c) => c.pick(STEEL, 0.05 + 0.12 * c.n.y + 0.1 * c.random(1)), { dither: true });

const GLASS_PAINT = cellPaint(
  TEXEL / 2,
  (c) => c.pick(GLASS, 0.35 + 0.3 * c.n.y + 0.25 * Math.max(0, Math.sin((c.u + c.v) * 0.7)) * (c.n.y > 0.2 ? 0 : 1)),
  { dither: true },
);

const GROUND_FLOOR = P("#1c1c24");
void GROUND_FLOOR;

// ---------- dimensions ----------
const TYRE_R = 0.84; // tyre radius -> 1.68 m diameter
const TYRE_W = 0.62;
const TRACK = 2.7; // centre-to-centre of the wheels laterally
const WB = 1.5; // half wheelbase (z of axles = +-WB)
const AXLE_Y = TYRE_R;
const FRAME_Y = 1.18;
const BODY_Y = 1.5;

type B = ReturnType<typeof createBuilder>;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "monsterTruck", paintSize: 2048 });
  const rand = rng(11);

  // =========================================================
  // TYRES
  // =========================================================
  const tyre = (cx: number, cz: number, s: number) => {
    const half = TYRE_W / 2;
    const out = s; // outward direction
    // main tread/carcass: lathe around X axis. Outline x = radius, y = along axis.
    b.lathe(
      [
        [0, -half],
        [TYRE_R * 0.7, -half],
        [TYRE_R * 0.93, -half * 0.92],
        [TYRE_R, -half * 0.62],
        [TYRE_R, half * 0.62],
        [TYRE_R * 0.93, half * 0.92],
        [TYRE_R * 0.7, half],
        [0, half],
      ],
      { at: [cx, TYRE_R, cz], axis: "x" as never, segments: 16, color: MUDDY } as never,
    );
  };
  void tyre;

  const wheel = (cx: number, cz: number, s: number) => {
    const half = TYRE_W / 2;
    const c: [number, number, number] = [cx, AXLE_Y, cz];
    // carcass (lathe axis along X: outline y is along the axis)
    b.lathe(
      [
        [0, -half],
        [TYRE_R * 0.66, -half],
        [TYRE_R * 0.92, -half * 0.88],
        [TYRE_R, -half * 0.55],
        [TYRE_R, half * 0.55],
        [TYRE_R * 0.92, half * 0.88],
        [TYRE_R * 0.66, half],
        [0, half],
      ],
      { at: c, axis: [1, 0, 0], segments: 16, color: MUDDY },
    );
    // tread lugs: chunky blocks ringed on the circumference
    const lugs = 16;
    const blocks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < lugs; i++) {
      const a = ((i + 0.5) / lugs) * Math.PI * 2;
      for (const k of [-1, 1]) {
        const g = new THREE.BoxGeometry(TYRE_W * 0.42, 0.1, 0.2);
        g.rotateX(a + (k * 0.0));
        g.translate(k * TYRE_W * 0.22, Math.cos(a) * (TYRE_R + 0.03), Math.sin(a) * (TYRE_R + 0.03));
        blocks.push(g);
      }
    }
    b.part(mergeBoxes(blocks), RUBBER[2], { at: c });

    // sidewall detail: concentric ring plates on outer face
    const faceX = cx + s * (half + 0.004);
    // sidewall lettering ring (tileBox-ish): yellow stripes
    b.part(
      new THREE.RingGeometry(TYRE_R * 0.72, TYRE_R * 0.76, 16),
      YELLOW[2],
      { at: [faceX, AXLE_Y, cz], dir: [s, 0, 0], axis: "z" },
    );
    b.part(
      new THREE.RingGeometry(TYRE_R * 0.84, TYRE_R * 0.86, 16),
      RUBBER[4],
      { at: [faceX + s * 0.001, AXLE_Y, cz], dir: [s, 0, 0], axis: "z" },
    );
    // sidewall studs
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.05, 0.07, 0.07), RUBBER[3], {
        at: [faceX + s * 0.01, AXLE_Y + Math.cos(a) * TYRE_R * 0.9, cz + Math.sin(a) * TYRE_R * 0.9],
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }
    // beadlock wheel: dark steel disc with bolts
    b.lathe(
      [
        [0, 0],
        [TYRE_R * 0.5, 0],
        [TYRE_R * 0.5, 0.05],
        [TYRE_R * 0.44, 0.07],
        [TYRE_R * 0.3, 0.05],
        [TYRE_R * 0.16, 0.1],
        [0, 0.1],
      ],
      { at: [cx + s * (half - 0.02), AXLE_Y, cz], axis: [s, 0, 0], segments: 12, color: STEEL_PAINT },
    );
    // beadlock ring bolts
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 6), CHROME, {
        at: [faceX + s * 0.025, AXLE_Y + Math.cos(a) * TYRE_R * 0.47, cz + Math.sin(a) * TYRE_R * 0.47],
        dir: [s, 0, 0],
        axis: "y",
      });
    }
    // hub cap decal
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      at: [faceX + s * 0.115, AXLE_Y, cz],
      dir: [s, 0, 0],
      axis: "z",
      texture: HUBCAP,
    });
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), CHROME, {
        at: [faceX + s * 0.12, AXLE_Y + Math.cos(a) * 0.15, cz + Math.sin(a) * 0.15],
        dir: [s, 0, 0],
        axis: "y",
      });
    }
    // centre cone cap
    b.part(new THREE.CylinderGeometry(0.05, 0.1, 0.07, 8), CHROME, {
      at: [faceX + s * 0.14, AXLE_Y, cz],
      dir: [s, 0, 0],
      axis: "y",
    });
  };

  for (const s of [1, -1])
    for (const z of [WB, -WB]) wheel(s * TRACK / 2, z, s);

  // =========================================================
  // AXLES, DIFFS, LINKS
  // =========================================================
  for (const z of [WB, -WB]) {
    b.rod([-TRACK / 2 + 0.2, AXLE_Y, z], [TRACK / 2 - 0.2, AXLE_Y, z], 0.1, { color: DARK_STEEL, sides: 8 });
    // portal gear boxes at the hubs
    for (const s of [1, -1]) {
      b.part(tileBox([0.44, 0.5, 0.34], PLATE_TILE, FINE), STEEL[2], {
        texture: PLATE_TILE,
        at: [s * (TRACK / 2 - 0.45), AXLE_Y + 0.08, z],
      });
      // steering knuckle
      b.part(new THREE.BoxGeometry(0.2, 0.26, 0.24), STEEL[1], { at: [s * (TRACK / 2 - 0.26), AXLE_Y, z] });
    }
    // diff pumpkin
    b.part(new THREE.SphereGeometry(0.26, 8, 6), STEEL_PAINT, { at: [0, AXLE_Y, z + (z > 0 ? 0.08 : -0.08)], scale: [1.1, 0.95, 0.8] });
    b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 8), STEEL[3], {
      at: [0, AXLE_Y, z + (z > 0 ? 0.28 : -0.28)],
      dir: [0, 0, 1],
      axis: "y",
    });
    // diff cover bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), CHROME, {
        at: [Math.cos(a) * 0.14, AXLE_Y + Math.sin(a) * 0.14, z + (z > 0 ? 0.35 : -0.35)],
      });
    }
    // pinion yoke
    b.rod([0, AXLE_Y, z + (z > 0 ? -0.1 : 0.1)], [0, AXLE_Y + 0.25, z + (z > 0 ? -0.4 : 0.4)], 0.06, { color: STEEL[2], sides: 6 });
  }

  // driveshafts
  b.rod([0, AXLE_Y + 0.3, -WB + 0.4], [0, AXLE_Y + 0.28, WB - 0.4], 0.06, { color: STEEL[3], sides: 6 });
  b.part(new THREE.BoxGeometry(0.16, 0.16, 0.16), STEEL[1], { at: [0, AXLE_Y + 0.3, 0] });

  // four-link bars and coilover shocks (4 per axle side pair)
  for (const z of [WB, -WB]) {
    for (const s of [1, -1]) {
      const xo = s * 0.75;
      // trailing arms
      b.rod([xo, AXLE_Y + 0.12, z], [xo * 0.9, FRAME_Y - 0.12, z - Math.sign(z) * 0.9], 0.04, { color: STEEL[2], sides: 6 });
      b.rod([xo * 0.7, AXLE_Y + 0.22, z], [xo * 0.85, FRAME_Y - 0.05, z - Math.sign(z) * 0.8], 0.035, { color: STEEL[2], sides: 6 });
      // coilover: shock body + spring + mount
      const x2 = s * 0.95;
      const lo: [number, number, number] = [x2, AXLE_Y + 0.12, z + Math.sign(z) * 0.0];
      const hi: [number, number, number] = [x2 * 0.78, FRAME_Y + 0.62, z - Math.sign(z) * 0.1];
      b.rod(lo, hi, 0.05, { color: STEEL[4], sides: 6 });
      // spring: stacked yellow rings on the shock
      const rings = 9;
      for (let i = 0; i < rings; i++) {
        const t = 0.1 + (i / (rings - 1)) * 0.65;
        const p: [number, number, number] = [lo[0] + (hi[0] - lo[0]) * t, lo[1] + (hi[1] - lo[1]) * t, lo[2] + (hi[2] - lo[2]) * t];
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 8), COIL_PAINT, { at: p, dir: [0, 1, 0], axis: "y" });
      }
      // reservoir
      b.rod([hi[0] + s * 0.14, hi[1] - 0.05, hi[2]], [hi[0] + s * 0.14, hi[1] - 0.3, hi[2]], 0.04, { color: ORANGE[2], sides: 6 });
      b.rod(hi, [hi[0] + s * 0.14, hi[1] - 0.05, hi[2]], 0.015, { color: BLACK, sides: 4 });
      // top mount
      b.part(new THREE.BoxGeometry(0.16, 0.08, 0.16), STEEL[1], { at: [hi[0], hi[1] + 0.05, hi[2]] });
      b.part(new THREE.SphereGeometry(0.04, 6, 4), CHROME, { at: [lo[0], lo[1] - 0.04, lo[2]] });
    }
  }

  // steering link front
  b.rod([-0.9, AXLE_Y + 0.15, WB - 0.28], [0.9, AXLE_Y + 0.15, WB - 0.28], 0.03, { color: STEEL[3], sides: 6 });

  // =========================================================
  // LADDER FRAME
  // =========================================================
  const FRAME_LEN = 4.1;
  for (const s of [1, -1]) {
    b.part(tileBox([0.14, 0.26, FRAME_LEN], PLATE_TILE, FINE, { rand }), STEEL[2], {
      texture: PLATE_TILE,
      at: [s * 0.52, FRAME_Y, 0.0],
    });
  }
  const crossZ = [-1.9, -1.1, -0.2, 0.7, 1.45, 1.95];
  for (const z of crossZ) {
    b.part(tileBox([1.16, 0.18, 0.14], PLATE_TILE, FINE), STEEL[1], { texture: PLATE_TILE, at: [0, FRAME_Y - 0.03, z] });
  }
  // rear bumper / tow hook & front bumper
  b.part(tileBox([1.7, 0.26, 0.2], PLATE_TILE, FINE), STEEL[2], { texture: PLATE_TILE, at: [0, FRAME_Y - 0.02, 2.2] });
  b.part(tileBox([1.7, 0.26, 0.2], PLATE_TILE, FINE), STEEL[2], { texture: PLATE_TILE, at: [0, FRAME_Y - 0.02, -2.2] });
  for (const s of [1, -1]) {
    b.rod([s * 0.52, FRAME_Y, 2.0], [s * 0.82, FRAME_Y - 0.02, 2.2], 0.06, { color: STEEL[2], sides: 6 });
    b.rod([s * 0.52, FRAME_Y, -2.0], [s * 0.82, FRAME_Y - 0.02, -2.2], 0.06, { color: STEEL[2], sides: 6 });
    // tow hook loop
    b.part(new THREE.TorusGeometry(0.07, 0.02, 4, 8), YELLOW[2], { at: [s * 0.3, FRAME_Y - 0.02, 2.33], rotation: [0, 0, 0] });
  }
  // front bumper bull bar
  b.part(tileBox([1.5, 0.12, 0.14], PLATE_TILE, FINE), STEEL[3], { texture: PLATE_TILE, at: [0, FRAME_Y + 0.3, 2.28] });
  for (const s of [1, -1]) {
    b.rod([s * 0.7, FRAME_Y - 0.02, 2.24], [s * 0.7, FRAME_Y + 0.34, 2.24], 0.05, { color: STEEL[3], sides: 6 });
  }
  b.rod([-0.7, FRAME_Y + 0.3, 2.28], [0.7, FRAME_Y + 0.3, 2.28], 0.05, { color: CHROME, sides: 6 });

  // engine block & radiator under hood
  b.part(tileBox([0.9, 0.55, 1.1], PLATE_TILE, FINE), STEEL[1], { texture: PLATE_TILE, at: [0, FRAME_Y + 0.4, 1.3] });
  // fuel tank rear
  b.part(tileBox([0.9, 0.34, 0.7], PLATE_TILE, FINE), STEEL[2], { texture: PLATE_TILE, at: [0, FRAME_Y + 0.25, -1.45] });
  // exhaust headers
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.5, FRAME_Y + 0.35, 1.0],
        [s * 0.62, FRAME_Y + 0.2, 0.6],
        [s * 0.64, FRAME_Y + 0.1, -0.2],
        [s * 0.64, FRAME_Y + 0.1, -1.6],
      ],
      0.05,
      { color: STEEL[4], sides: 6, caps: "flat" },
    );
  }

  // =========================================================
  // BODY: hood, cab, bed
  // =========================================================
  // lower body tub
  const bodyBox = (size: [number, number, number], at: [number, number, number]) =>
    b.part(tileBox(size, PANEL_TILE, TEXEL, { rand }), "#ffffff", { texture: PANEL_TILE, at });

  // floor pan
  b.part(tileBox([1.9, 0.12, 2.8], PANEL_TILE, TEXEL), RED[1], { texture: PANEL_TILE, at: [0, BODY_Y - 0.24, 0.1] });

  // hood (sloped via extrude profile): side profile drawn front-to-back, thickness across X
  const hood = b.extrude(
    [
      [0, 0],
      [1.35, 0],
      [1.4, 0.22],
      [1.3, 0.5],
      [0.2, 0.62],
      [0, 0.5],
    ],
    { at: [0, BODY_Y - 0.2, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.9, bevel: 0.05, color: BODY_RED } as never,
  );
  void hood;
  // hood centre: raised power bulge + scoop
  b.part(tileBox([0.7, 0.24, 0.9], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [0, BODY_Y + 0.5, 1.55] });
  b.part(tileBox([0.5, 0.2, 0.36], PLATE_TILE, FINE), STEEL[0], { texture: PLATE_TILE, at: [0, BODY_Y + 0.72, 1.7] });
  b.part(new THREE.BoxGeometry(0.42, 0.04, 0.26), BLACK, { at: [0, BODY_Y + 0.83, 1.7] });
  for (let i = 0; i < 5; i++) b.part(new THREE.BoxGeometry(0.4, 0.015, 0.02), STEEL[3], { at: [0, BODY_Y + 0.845, 1.6 + i * 0.05] });
  // blower stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 8), CHROME, { at: [s * 0.18, BODY_Y + 0.96, 1.56] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), STEEL[1], { at: [s * 0.18, BODY_Y + 1.13, 1.56] });
  }

  // front fenders / lower grille body
  b.part(tileBox([1.92, 0.42, 0.28], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [0, BODY_Y + 0.05, 2.12] });
  // grille
  b.part(new THREE.PlaneGeometry(1.0, 0.36), "#ffffff", { at: [0, BODY_Y + 0.04, 2.272], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  // headlights
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.26), "#ffffff", { at: [s * 0.74, BODY_Y + 0.08, 2.273], dir: [0, 0, 1], axis: "z", texture: HEADLIGHT });
    glow(b.part(new THREE.BoxGeometry(0.16, 0.12, 0.02), LAMP, { at: [s * 0.74, BODY_Y + 0.08, 2.285] }), 1.4);
    // turn signal
    b.part(new THREE.BoxGeometry(0.12, 0.06, 0.02), ORANGE[2], { at: [s * 0.74, BODY_Y - 0.15, 2.275] });
  }
  // front lip splitter
  b.part(tileBox([1.7, 0.08, 0.3], PLATE_TILE, FINE), STEEL[0], { texture: PLATE_TILE, at: [0, BODY_Y - 0.2, 2.18] });

  // cab main box
  bodyBox([1.9, 0.72, 1.5], [0, BODY_Y + 0.38, 0.0]);
  // cab roof (slimmer greenhouse)
  const CAB_Y = BODY_Y + 0.74;
  // pillars
  for (const s of [1, -1]) {
    for (const [px, pz] of [[0.86, 0.64], [0.86, -0.62]] as const) {
      b.part(new THREE.BoxGeometry(0.1, 0.7, 0.1), RED[3], { at: [s * px, CAB_Y + 0.35, pz] });
    }
  }
  // roof
  b.part(tileBox([1.86, 0.1, 1.36], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [0, CAB_Y + 0.74, 0.0] });
  // roof stripe
  b.part(new THREE.PlaneGeometry(0.8, 0.1), "#ffffff", { at: [0, CAB_Y + 0.795, 0.0], dir: [0, 1, 0], axis: "z", texture: CHECKER, rotation: [-90, 0, 0] } as never);

  // windshield: sloped glass
  const wsA = new THREE.Vector3(0, BODY_Y + 0.74, 0.74);
  const wsB = new THREE.Vector3(0, CAB_Y + 0.72, 0.52);
  b.slab(
    [
      [-0.84, wsA.y, wsA.z],
      [0.84, wsA.y, wsA.z],
      [0.84, wsB.y, wsB.z],
      [-0.84, wsB.y, wsB.z],
    ],
    { thickness: 0.04, color: GLASS_PAINT } as never,
  );
  // side windows
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.1, 0.56), "#ffffff", {
      at: [s * 0.955, CAB_Y + 0.38, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: WINDOW_TEX,
    });
    // door seam, handle, mirror
    b.part(new THREE.BoxGeometry(0.02, 0.8, 0.03), RED[1], { at: [s * 0.955, BODY_Y + 0.35, -0.38] });
    b.part(new THREE.BoxGeometry(0.02, 0.8, 0.03), RED[1], { at: [s * 0.955, BODY_Y + 0.35, 0.55] });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.16), CHROME, { at: [s * 0.97, BODY_Y + 0.5, 0.35] });
    b.rod([s * 0.95, CAB_Y + 0.25, 0.56], [s * 1.12, CAB_Y + 0.3, 0.6], 0.015, { color: STEEL[1], sides: 4 });
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.14), STEEL[1], { at: [s * 1.14, CAB_Y + 0.3, 0.6] });
  }
  // rear window
  b.part(new THREE.PlaneGeometry(1.3, 0.44), "#ffffff", { at: [0, CAB_Y + 0.4, -0.688], dir: [0, 0, -1], axis: "z", texture: WINDOW_TEX });

  // side flames + number on doors
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(2.9, 0.88), "#ffffff", {
      at: [s * 0.962, BODY_Y + 0.18, 0.32],
      dir: [s, 0, 0],
      axis: "z",
      texture: FLAME,
      up: [0, 1, 0],
      mirror: undefined,
    } as never);
  }
  // door number plates
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.32, 0.4), "#ffffff", {
      at: [s * 0.966, CAB_Y + 0.08, -0.12],
      dir: [s, 0, 0],
      axis: "z",
      texture: NUM,
    });
  }
  // skull decal on hood
  b.part(new THREE.PlaneGeometry(0.48, 0.36), "#ffffff", { at: [0, BODY_Y + 0.55, 1.2], dir: [0, 1, 0], axis: "z", texture: SKULL, rotation: [-90, 0, 0] } as never);

  // bed
  const BED_Z = -1.2;
  // bed floor
  b.part(tileBox([1.7, 0.1, 1.0], BED_TILE, FINE), "#ffffff", { texture: BED_TILE, at: [0, BODY_Y - 0.02, BED_Z] });
  for (const s of [1, -1]) {
    b.part(tileBox([0.1, 0.5, 1.1], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [s * 0.9, BODY_Y + 0.22, BED_Z] });
    // bed side rail cap
    b.part(new THREE.BoxGeometry(0.16, 0.05, 1.14), STEEL[4], { at: [s * 0.9, BODY_Y + 0.5, BED_Z] });
    // bed side flame stripe
    b.part(new THREE.PlaneGeometry(1.0, 0.2), "#ffffff", { at: [s * 0.955, BODY_Y + 0.22, BED_Z], dir: [s, 0, 0], axis: "z", texture: STRIPE });
  }
  b.part(tileBox([1.9, 0.5, 0.1], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [0, BODY_Y + 0.22, BED_Z - 0.55] });
  b.part(new THREE.BoxGeometry(1.94, 0.05, 0.16), STEEL[4], { at: [0, BODY_Y + 0.5, BED_Z - 0.55] });
  // tail gate stripe + tail lights
  b.part(new THREE.PlaneGeometry(1.2, 0.2), "#ffffff", { at: [0, BODY_Y + 0.22, BED_Z - 0.606], dir: [0, 0, -1], axis: "z", texture: STRIPE });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.22, 0.18), "#ffffff", { at: [s * 0.78, BODY_Y + 0.28, BED_Z - 0.607], dir: [0, 0, -1], axis: "z", texture: TAILLIGHT });
    glow(b.part(new THREE.BoxGeometry(0.1, 0.06, 0.01), P("#ff3030"), { at: [s * 0.78, BODY_Y + 0.29, BED_Z - 0.62] }), 1.1);
  }
  // front bed wall (behind cab)
  b.part(tileBox([1.7, 0.5, 0.08], PANEL_TILE, TEXEL), "#ffffff", { texture: PANEL_TILE, at: [0, BODY_Y + 0.22, BED_Z + 0.56] });

  // roll bar over the bed
  for (const s of [1, -1]) {
    b.rod([s * 0.8, BODY_Y + 0.05, BED_Z + 0.35], [s * 0.8, BODY_Y + 1.15, BED_Z + 0.3], 0.05, { color: CHROME, sides: 6 });
    b.rod([s * 0.8, BODY_Y + 1.15, BED_Z + 0.3], [s * 0.7, BODY_Y + 1.15, BED_Z - 0.4], 0.045, { color: CHROME, sides: 6 });
    b.rod([s * 0.7, BODY_Y + 1.15, BED_Z - 0.4], [s * 0.8, BODY_Y + 0.5, BED_Z - 0.5], 0.045, { color: CHROME, sides: 6 });
  }
  b.rod([-0.8, BODY_Y + 1.15, BED_Z + 0.3], [0.8, BODY_Y + 1.15, BED_Z + 0.3], 0.05, { color: CHROME, sides: 6 });
  b.rod([-0.7, BODY_Y + 0.8, BED_Z + 0.3], [0.7, BODY_Y + 0.8, BED_Z + 0.3], 0.04, { color: CHROME, sides: 6 });
  b.rod([-0.8, BODY_Y + 1.15, BED_Z - 0.1], [0.8, BODY_Y + 1.15, BED_Z - 0.1], 0.04, { color: CHROME, sides: 6 });

  // light bar on the cab roof
  b.part(tileBox([1.5, 0.14, 0.18], PLATE_TILE, FINE), STEEL[0], { texture: PLATE_TILE, at: [0, CAB_Y + 0.88, 0.25] });
  for (let i = 0; i < 6; i++) {
    const x = -0.6 + i * 0.24;
    b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { at: [x, CAB_Y + 0.88, 0.341], dir: [0, 0, 1], axis: "z", texture: LIGHTBAR_LENS });
    glow(b.part(new THREE.BoxGeometry(0.12, 0.06, 0.01), LAMP, { at: [x, CAB_Y + 0.88, 0.352] }), 1.3);
  }
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.16, 0.06), STEEL[2], { at: [s * 0.7, CAB_Y + 0.82, 0.25] });

  // antenna with flag
  b.rod([0.8, BODY_Y + 0.5, BED_Z + 0.55], [0.8, BODY_Y + 1.7, BED_Z + 0.55], 0.012, { color: STEEL[1], sides: 4 });
  b.part(new THREE.BoxGeometry(0.01, 0.16, 0.26), ORANGE[2], { at: [0.8, BODY_Y + 1.62, BED_Z + 0.43] });
  b.part(new THREE.SphereGeometry(0.025, 5, 4), YELLOW[2], { at: [0.8, BODY_Y + 1.72, BED_Z + 0.55] });

  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    b.rod([s * 0.97, BODY_Y + 0.2, 0.6], [s * 1.02, BODY_Y + 1.0, 0.7], 0.06, { color: CHROME, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.08, 0.06, 0.1, 6), STEEL[1], { at: [s * 1.02, BODY_Y + 1.04, 0.7] });
    glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), ORANGE[2], { at: [s * 1.02, BODY_Y + 1.1, 0.7] }), 1.2);
    // clamp bands
    for (const t of [0.25, 0.6]) {
      b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6), STEEL[3], { at: [s * (0.97 + 0.05 * t), BODY_Y + 0.2 + 0.8 * t, 0.6 + 0.1 * t] });
    }
  }

  // wheel arch trims / flares + mud flaps
  for (const s of [1, -1]) {
    for (const z of [WB, -WB]) {
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.9), STEEL[1], { at: [s * 1.05, BODY_Y - 0.02, z] });
      // mud flap
    }
    b.part(new THREE.BoxGeometry(0.03, 0.34, 0.3), RUBBER[1], { at: [s * 0.92, BODY_Y - 0.4, -2.0] });
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.12), YELLOW[2], { at: [s * 0.935, BODY_Y - 0.34, -2.0] });
    // side steps
    b.part(tileBox([0.18, 0.05, 1.2], PLATE_TILE, FINE), STEEL[3], { texture: PLATE_TILE, at: [s * 0.98, BODY_Y - 0.24, 0.1] });
  }

  // bolts on bumpers
  for (const x of [-0.7, -0.35, 0, 0.35, 0.7]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), CHROME, { at: [x, FRAME_Y - 0.02, 2.31], dir: [0, 0, 1], axis: "y" });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), CHROME, { at: [x, FRAME_Y - 0.02, -2.31], dir: [0, 0, 1], axis: "y" });
  }

  // number plate, front
  b.part(new THREE.PlaneGeometry(0.42, 0.2), "#ffffff", { at: [0, FRAME_Y + 0.02, 2.311], dir: [0, 0, 1], axis: "z", texture: pixelArt(["wwwwwwwwww", "wkwkkwkkkw", "wkkwkwkwkw", "wkwkkwkkkw", "wwwwwwwwww"], { w: WHITE, k: P("#1c3a8c") }) });

  // flame decal on the hood edges (front face of fenders)
  b.part(new THREE.PlaneGeometry(1.8, 0.22), "#ffffff", { at: [0, BODY_Y - 0.06, 2.275], dir: [0, 0, 1], axis: "z", texture: FLAME_BACK });

  // splash of mud on the lower body: dark blobs
  const mudGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const g = new THREE.BoxGeometry(0.06 + rand() * 0.08, 0.05 + rand() * 0.06, 0.02);
    const side = rand() < 0.5 ? 1 : -1;
    g.translate(side * 0.97, BODY_Y - 0.1 + rand() * 0.3, -1.6 + rand() * 3.0);
    g.rotateY(0);
    mudGeos.push(g);
  }
  b.part(mergeBoxes(mudGeos), MUD[1], { at: [0, 0, 0] });

  return b.root;
}

function mergeBoxes(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  let off = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
    }
    const ix = g.getIndex();
    if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setIndex(idx);
  return out;
}
