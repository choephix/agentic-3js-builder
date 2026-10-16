import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  tileBox,
} from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Dungeon Props",
  description:
    "Retro pixel-art dungeon prop cluster: iron-bound treasure chest with hinged lid and gold hoard, bloodied spike trap plate, wooden barrels with iron hoops, skeletal remains with skull and ribcage, and flaming iron torch sconces on mossy dungeon flagstones.",
  style: "pixel art",
  commit: "88fc1f0",
};

const TEXEL = 0.015;

// Snap ramps to 64-level VGA DAC palette for crisp retro pixel-art fidelity
const snapRamp = (colors: readonly string[]) => colors.map((c) => snapColor(c, 64));

const STONE_RAMP = snapRamp(["#171820", "#232533", "#323648", "#444a60", "#5a627a", "#737d98"]);
const MOSS_RAMP = snapRamp(["#142416", "#1e3a1f", "#2d5728", "#437a32", "#629e3e"]);
const WOOD_RAMP = snapRamp(["#221209", "#381e0f", "#522d17", "#6e3e20", "#8c522b", "#ab6a3c"]);
const BARREL_RAMP = snapRamp(["#28180d", "#422715", "#5c381f", "#784b2a", "#966138", "#b47848"]);
const IRON_RAMP = snapRamp(["#12141c", "#1f2330", "#303748", "#465066", "#626e88", "#8492b0"]);
const STEEL_RAMP = snapRamp(["#222634", "#373e52", "#525c75", "#73809c", "#99a7c4", "#c4d0e8"]);
const GOLD_RAMP = snapRamp(["#472808", "#75460d", "#a86b14", "#d9971c", "#f5c736", "#fff078"]);
const BONE_RAMP = snapRamp(["#463e39", "#695e55", "#8f8274", "#b5a795", "#d9ccb8", "#f2eadb"]);
const BLOOD_RAMP = snapRamp(["#29060a", "#4d0b11", "#781118", "#a61920", "#cc292b"]);
const RUBY_RAMP = snapRamp(["#380614", "#6e0d25", "#ad1737", "#e62e4d", "#ff758f"]);
const EMERALD_RAMP = snapRamp(["#07331e", "#0e5e36", "#199452", "#2bd173", "#7dffb3"]);
const SAPPHIRE_RAMP = snapRamp(["#091d42", "#123b7a", "#1e64b8", "#3694f0", "#85caff"]);
const TORCH_WOOD_RAMP = snapRamp(["#1a0f08", "#2b190d", "#402614", "#57351d"]);
const COAL_RAMP = snapRamp(["#120907", "#26110c", "#471a0e", "#782810", "#b84314", "#f06e18"]);
const POTION_RAMP = snapRamp(["#2b0938", "#4c1261", "#751c94", "#a330c9", "#d466f5"]);

// Flat snapped accent colours (stay well under 64 flat colour limit)
const C_IRON_DARK = IRON_RAMP[1];
const C_IRON_MID = IRON_RAMP[2];
const C_IRON_LIGHT = IRON_RAMP[4];
const C_GOLD_MID = GOLD_RAMP[3];
const C_GOLD_BRIGHT = GOLD_RAMP[4];
const C_BONE_LIGHT = BONE_RAMP[4];
const C_BONE_MID = BONE_RAMP[3];
const C_BLOOD = BLOOD_RAMP[2];
const C_EMERALD = EMERALD_RAMP[3];
const C_RUBY = RUBY_RAMP[3];
const C_SAPPHIRE = SAPPHIRE_RAMP[3];
const C_FLAME_CORE = snapColor("#fff394", 64);
const C_FLAME_MID = snapColor("#ff9914", 64);
const C_FLAME_TIP = snapColor("#eb3b14", 64);
const C_EMBER = snapColor("#ff6614", 64);

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps", detail: 0.75, paintSize: 2048 });
  const rand = rng(421337);

  // ============================================================================
  // PIXEL PAINTS (quantized to TEXEL square cells in model space)
  // ============================================================================

  const stonePaint = cellPaint(
    TEXEL,
    (c) => {
      const n1 = noise(c.at, 0.22, 11);
      const n2 = noise(c.at, 0.08, 23);
      // Flagstone mortar grid lines on top surfaces
      const gx = Math.abs(((c.u % 14) + 14) % 14);
      const gz = Math.abs(((c.v % 14) + 14) % 14);
      const isMortar = c.axis === 1 && (gx === 0 || gz === 0);
      if (isMortar) return STONE_RAMP[0];
      // Moss patches creeping in crevices and corners
      const mossVal = noise(c.at, 0.26, 77) + (c.at.length() > 0.55 ? 0.12 : -0.05);
      if (mossVal > 0.66 && c.n.y > 0.2) {
        return c.pick(MOSS_RAMP, (mossVal - 0.62) * 2.4 + 0.2 * c.n.y);
      }
      const shade = 0.28 + 0.32 * c.n.y + 0.28 * (n1 - 0.5) + 0.2 * (n2 - 0.5) + (c.random(3) - 0.5) * 0.12;
      return c.pick(STONE_RAMP, shade);
    },
    { dither: true },
  );

  const darkStonePaint = cellPaint(
    TEXEL,
    (c) => {
      const n1 = noise(c.at, 0.16, 31);
      const shade = 0.18 + 0.25 * c.n.y + 0.3 * (n1 - 0.5) + (c.random(5) - 0.5) * 0.1;
      return c.pick(STONE_RAMP, shade);
    },
    { dither: true },
  );

  const ironPaint = cellPaint(
    TEXEL,
    (c) => {
      if (c.random(19) < 0.06) return IRON_RAMP[5]; // specular pixel glint
      if (c.random(29) < 0.07) return IRON_RAMP[0]; // pitted rust/wear pixel
      const shade = 0.35 + 0.35 * c.n.y + 0.15 * c.n.z + (noise(c.at, 0.1, 41) - 0.5) * 0.3;
      return c.pick(IRON_RAMP, shade);
    },
    { dither: true },
  );

  const spikeSteelPaint = cellPaint(
    TEXEL,
    (c) => {
      // Blood-stained spike tips above trap base
      const relH = c.at.y - 0.075;
      if (relH > 0.12 && (relH > 0.165 || c.random(91) < 0.55)) {
        const bShade = 0.35 + 0.35 * c.n.y + (c.random(93) - 0.5) * 0.25;
        return c.pick(BLOOD_RAMP, bShade);
      }
      const shade = 0.4 + 0.35 * c.n.y + 0.2 * Math.abs(c.n.x) + (c.random(43) - 0.5) * 0.15;
      return c.pick(STEEL_RAMP, shade);
    },
    { dither: true },
  );

  const goldHoardPaint = cellPaint(
    TEXEL * 0.75,
    (c) => {
      const r = c.random(61);
      if (r < 0.045) return C_RUBY;
      if (r < 0.085) return C_EMERALD;
      if (r < 0.12) return C_SAPPHIRE;
      if (r < 0.2) return GOLD_RAMP[5]; // bright coin edge glint
      if (r < 0.3) return GOLD_RAMP[1]; // shadow between coins
      const shade = 0.48 + 0.35 * c.n.y + (noise(c.at, 0.06, 67) - 0.5) * 0.4;
      return c.pick(GOLD_RAMP, shade);
    },
    { dither: true },
  );

  const goldTrimPaint = cellPaint(
    TEXEL,
    (c) => {
      if (c.random(71) < 0.1) return GOLD_RAMP[5];
      const shade = 0.45 + 0.38 * c.n.y + 0.15 * c.n.z + (c.random(73) - 0.5) * 0.15;
      return c.pick(GOLD_RAMP, shade);
    },
    { dither: true },
  );

  const bonePaint = cellPaint(
    TEXEL * 0.75,
    (c) => {
      const n = noise(c.at, 0.09, 83);
      const shade = 0.48 + 0.35 * c.n.y + 0.25 * (n - 0.5) + (c.random(89) - 0.5) * 0.12;
      return c.pick(BONE_RAMP, shade);
    },
    { dither: true },
  );

  const woodPaint = cellPaint(
    TEXEL,
    (c) => {
      const streak = noise(new THREE.Vector3(c.at.x * 2.5, c.at.y * 0.5, c.at.z * 2.5), 0.08, 101);
      const shade = 0.38 + 0.28 * c.n.y + 0.32 * (streak - 0.5) + (c.random(103) - 0.5) * 0.1;
      return c.pick(WOOD_RAMP, shade);
    },
    { dither: true },
  );

  const barrelWoodPaint = cellPaint(
    TEXEL,
    (c) => {
      // Stave seam lines around barrel circumference
      const angleSteps = Math.floor(((c.s[1] + 360) % 360) / 30);
      const angleFrac = ((c.s[1] + 360) % 30) / 30;
      if (angleFrac < 0.09) return BARREL_RAMP[0];
      const staveVar = ((angleSteps * 37) % 5) * 0.04 - 0.08;
      const shade = 0.42 + 0.28 * c.n.y + staveVar + (noise(c.at, 0.09, 107) - 0.5) * 0.25;
      return c.pick(BARREL_RAMP, shade);
    },
    { dither: true },
  );

  const torchWoodPaint = cellPaint(
    TEXEL * 0.75,
    (c) => {
      const shade = 0.32 + 0.3 * c.n.y + (c.random(113) - 0.5) * 0.2;
      return c.pick(TORCH_WOOD_RAMP, shade);
    },
    { dither: true },
  );

  const coalPaint = cellPaint(
    TEXEL * 0.75,
    (c) => {
      const hot = 0.35 + 0.4 * c.n.y + (c.random(127) - 0.5) * 0.45;
      return c.pick(COAL_RAMP, hot);
    },
    { dither: true },
  );

  const rubyPaint = cellPaint(
    TEXEL * 0.5,
    (c) => c.pick(RUBY_RAMP, 0.45 + 0.4 * c.n.y + (c.random(131) - 0.5) * 0.3),
    { dither: false },
  );

  const emeraldPaint = cellPaint(
    TEXEL * 0.5,
    (c) => c.pick(EMERALD_RAMP, 0.45 + 0.4 * c.n.y + (c.random(137) - 0.5) * 0.3),
    { dither: false },
  );

  const sapphirePaint = cellPaint(
    TEXEL * 0.5,
    (c) => c.pick(SAPPHIRE_RAMP, 0.45 + 0.4 * c.n.y + (c.random(139) - 0.5) * 0.3),
    { dither: false },
  );

  const potionPaint = cellPaint(
    TEXEL * 0.5,
    (c) => c.pick(POTION_RAMP, 0.45 + 0.4 * c.n.y + (c.random(149) - 0.5) * 0.25),
    { dither: true },
  );

  // ============================================================================
  // PIXEL TEXTURES (tiles, skin sheets, sprites & cards)
  // ============================================================================

  // 1. Dungeon Planks Tile (for chest, planks, debris)
  const PLANKS_TILE = pixelTexture(32, 24, (g) => {
    const r = rng(501);
    g.fill((x, y) => {
      const row = y % 6;
      const plankIdx = Math.floor(y / 6);
      const jointX = (plankIdx * 13 + 7) % 32;
      if (row === 0 || x === jointX) return WOOD_RAMP[0];
      if (row === 1) return pick(WOOD_RAMP, 0.68, bayer(x, y));
      if (row === 5) return pick(WOOD_RAMP, 0.25, bayer(x, y));
      const grainWave = Math.sin((x + plankIdx * 9) * 0.45) * 0.08;
      const v = 0.44 + grainWave + (r() - 0.5) * 0.14;
      return pick(WOOD_RAMP, v, bayer(x, y));
    });
    // Pixel nail heads near plank joints
    for (let p = 0; p < 4; p++) {
      const jx = (p * 13 + 7) % 32;
      const py = p * 6 + 3;
      g.set((jx + 2) % 32, py, IRON_RAMP[1]);
      g.set((jx + 3) % 32, py, IRON_RAMP[4]);
      g.set((jx + 29) % 32, py, IRON_RAMP[1]);
    }
  });

  // 2. Dungeon Flagstone Tile (for stepped plinth slabs & stone blocks)
  const STONE_TILE = pixelTexture(32, 32, (g) => {
    const r = rng(601);
    g.fill((x, y) => {
      const border = x === 0 || y === 0 || x === 15 || y === 15;
      const offsetBorder = (x === 8 && y > 15) || (y === 23 && x < 16);
      if (border || offsetBorder) return STONE_RAMP[0];
      const highlight = x === 1 || y === 1 || x === 16 || y === 16;
      if (highlight && r() < 0.7) return pick(STONE_RAMP, 0.72, bayer(x, y));
      // Occasional moss pixel in cracks
      if ((x <= 2 || y <= 2) && r() < 0.18) return MOSS_RAMP[2];
      const v = 0.42 + (r() - 0.5) * 0.22;
      return pick(STONE_RAMP, v, bayer(x, y));
    });
  });

  // 3. Iron Plate Tile (for spike trap frame, chest brackets, iron bands)
  const IRON_TILE = pixelTexture(24, 24, (g) => {
    const r = rng(701);
    g.fill((x, y) => {
      const edgeDark = x === 0 || y === 0 || x === 23 || y === 23;
      if (edgeDark) return IRON_RAMP[0];
      const edgeLight = x === 1 || y === 1;
      if (edgeLight) return IRON_RAMP[4];
      const v = 0.42 + (r() - 0.5) * 0.16;
      return pick(IRON_RAMP, v, bayer(x, y));
    });
    // Corner rivets
    for (const [rx, ry] of [
      [3, 3],
      [19, 3],
      [3, 19],
      [19, 19],
    ]) {
      g.stamp(rx, ry, ["lh", "dd"], {
        l: IRON_RAMP[5],
        h: IRON_RAMP[3],
        d: IRON_RAMP[0],
      });
    }
  });

  // 4. Spike Trap Floor Grate Tile (dark slots, rivets, blood splatters)
  const TRAP_GRATE_TILE = pixelTexture(32, 32, (g) => {
    const r = rng(801);
    g.fill((x, y) => {
      if (x <= 1 || y <= 1 || x >= 30 || y >= 30) return IRON_RAMP[0];
      if (x === 2 || y === 2) return IRON_RAMP[4];
      // 3x3 grid of dark spike socket holes
      for (const cx of [7, 16, 25]) {
        for (const cy of [7, 16, 25]) {
          const dx = Math.abs(x - cx);
          const dy = Math.abs(y - cy);
          if (dx <= 1 && dy <= 1) return "#08080c";
          if (dx <= 2 && dy <= 2) return IRON_RAMP[1];
          if (dx === 3 && dy <= 2 && x < cx) return IRON_RAMP[4];
        }
      }
      // Bloodstains near spike sockets
      const bNoise = (Math.sin(x * 0.55) + Math.cos(y * 0.45)) * 0.5;
      if (bNoise > 0.35 && r() < 0.45) return pick(BLOOD_RAMP, 0.4 + r() * 0.4, bayer(x, y));
      return pick(IRON_RAMP, 0.38 + (r() - 0.5) * 0.15, bayer(x, y));
    });
  });

  // 5. Skin sheet for Pixel Skull, Jaw, Padlock, Chest Lockplate, and Barrel Bung
  const skinSpec = skinLayout(
    {
      skull: [12, 10, 12],
      jaw: [10, 4, 9],
      lockplate: [6, 8, 2],
      padlock: [5, 6, 3],
    },
    64,
  );

  const SKIN_SHEET = pixelTexture(skinSpec.size[0], skinSpec.size[1], (g) => {
    const r = rng(901);

    // Fill skull faces with dithered bone shading
    for (const [faceName, rect] of Object.entries(skinSpec.faces.skull)) {
      g.fill((x, y, w, h) => {
        const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        const base = faceName === "py" ? 0.78 : faceName === "ny" ? 0.25 : 0.58 - (y / h) * 0.22;
        const v = (edge ? base - 0.14 : base) + (r() - 0.5) * 0.08;
        return pick(BONE_RAMP, v, bayer(x, y));
      }, rect);
    }

    // Draw pixel skull face on pz (12x10)
    const sf = skinSpec.faces.skull.pz;
    g.stamp(
      sf[0],
      sf[1],
      [
        ".llbbbbbbll.",
        "lbbbbbbbbbb.",
        "bbdcbbbbbbbb",
        "bdddd..ddddb",
        "bdggd..dggdb",
        "bdddd..ddddb",
        "bbbb.nn.bbbb",
        ".bbbnnnnbbb.",
        ".bwbwbwbwbb.",
        "..dwdwdwdw..",
      ],
      {
        l: BONE_RAMP[5],
        b: BONE_RAMP[4],
        c: BONE_RAMP[2],
        d: "#110f14",
        g: "#ff3b1f", // faint eerie dungeon eye socket ember
        n: "#18151c",
        w: BONE_RAMP[5],
      },
    );

    // Skull temple cracks on px & nx (12x10)
    const spx = skinSpec.faces.skull.px;
    g.stamp(
      spx[0],
      spx[1],
      [
        "............",
        "..c.........",
        "...cc.......",
        "....c.c.....",
        ".....cc.....",
        "..dd........",
        ".dddd..ccc..",
        "..dd..c...c.",
        "............",
        "............",
      ],
      { c: BONE_RAMP[1], d: BONE_RAMP[0] },
    );

    // Skull crown suture crack on py (12x12)
    const spy = skinSpec.faces.skull.py;
    g.stamp(
      spy[0],
      spy[1],
      [
        "............",
        ".....c......",
        "....c.c.....",
        ".....c......",
        "...cc.cc....",
        ".....c......",
        "....c.c.....",
        ".....c......",
        "............",
        "............",
        "............",
        "............",
      ],
      { c: BONE_RAMP[1] },
    );

    // Fill jaw faces
    for (const [faceName, rect] of Object.entries(skinSpec.faces.jaw)) {
      g.fill((x, y, w, h) => {
        const base = faceName === "ny" ? 0.25 : 0.48 - (y / h) * 0.15;
        return pick(BONE_RAMP, base + (r() - 0.5) * 0.08, bayer(x, y));
      }, rect);
    }
    const jf = skinSpec.faces.jaw.pz;
    g.stamp(
      jf[0],
      jf[1],
      [
        ".wdwdwdwdw.",
        "bbbbbbbbbb",
        "bccccccccb",
        ".dddddddd.",
      ],
      {
        w: BONE_RAMP[5],
        d: "#18151c",
        b: BONE_RAMP[3],
        c: BONE_RAMP[2],
      },
    );

    // Fill lockplate faces (gold & keyhole)
    for (const rect of Object.values(skinSpec.faces.lockplate)) {
      g.fill((x, y, w, h) => {
        const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        return border ? GOLD_RAMP[1] : pick(GOLD_RAMP, 0.72 - (y / h) * 0.3, bayer(x, y));
      }, rect);
    }
    const lpf = skinSpec.faces.lockplate.pz;
    g.stamp(
      lpf[0],
      lpf[1],
      [
        "hlllld",
        "lggggd",
        "lgkkgd",
        "lgkkgd",
        "l.kk.d",
        "l.kk.d",
        "lggggd",
        "dddddd",
      ],
      {
        h: GOLD_RAMP[5],
        l: GOLD_RAMP[4],
        g: GOLD_RAMP[3],
        d: GOLD_RAMP[1],
        k: "#0e0c12",
      },
    );

    // Fill padlock faces
    for (const rect of Object.values(skinSpec.faces.padlock)) {
      g.fill((x, y, w, h) => {
        const border = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        return border ? IRON_RAMP[0] : pick(GOLD_RAMP, 0.65 - (y / h) * 0.28, bayer(x, y));
      }, rect);
    }
    const plf = skinSpec.faces.padlock.pz;
    g.stamp(
      plf[0],
      plf[1],
      [
        "lllll",
        "lgggd",
        "lgkgd",
        "lgkgd",
        "lgggd",
        "ddddd",
      ],
      {
        l: GOLD_RAMP[4],
        g: GOLD_RAMP[3],
        d: GOLD_RAMP[1],
        k: "#0b0a0f",
      },
    );
  });

  // 6. Torch Flame Pixel Art Card (vibrant pixel fire sprite)
  const FLAME_CARD = pixelArt(
    [
      ".......rr.......",
      "......rrrr......",
      ".....rroorr.....",
      "....rrooorrr....",
      "....rooooorr....",
      "...rooyyyoorr...",
      "..rooyyyyyoorr..",
      "..royyywyyyoor..",
      ".rooyywwwyyoorr.",
      ".royywwwwwyyoor.",
      ".roywwwwwwwyoor.",
      "..oywwwwwwwyoo..",
      "..oyywwwwwyyoo..",
      "...oyyyyyyyoo...",
      "....oooooooo....",
      ".....rrrrrr.....",
    ],
    {
      r: C_FLAME_TIP,
      o: C_FLAME_MID,
      y: snapColor("#ffd426", 64),
      w: C_FLAME_CORE,
    },
  );

  // 7.Dungeon Floor Cobweb / Moss / Gold Coin Cards
  const GOLD_COIN_CARD = pixelArt(
    [
      "..llll..",
      ".lwwwwl.",
      "lwggggwl",
      "lwgddgwl",
      "lwgddgwl",
      "lwggggwl",
      ".lddddl.",
      "..dddd..",
    ],
    {
      w: GOLD_RAMP[5],
      l: GOLD_RAMP[4],
      g: GOLD_RAMP[3],
      d: GOLD_RAMP[1],
    },
  );

  const BLOOD_DECAL_CARD = pixelArt(
    [
      "....ddd.....",
      "..ddbbbbd...",
      ".dbbbllbbd..",
      "dbbbllllbbd.",
      "dbblbblbbbd.",
      ".dbbbbbbbdd.",
      "..ddbbbddd.d",
      "....ddd...dd",
    ],
    {
      d: BLOOD_RAMP[0],
      b: BLOOD_RAMP[2],
      l: BLOOD_RAMP[3],
    },
  );

  const MOSS_TUFT_CARD = pixelArt(
    [
      "..l...l...",
      ".lll.lll..",
      ".lmlmlmll.",
      "lmmmdmmmll",
      "mmdddddmmd",
      "dddddddddd",
    ],
    {
      l: MOSS_RAMP[4],
      m: MOSS_RAMP[3],
      d: MOSS_RAMP[1],
    },
  );

  // ============================================================================
  // ROOT SKELETON & MOVING JOINTS (hinge roles for moving prop parts)
  // ============================================================================

  const root = b.joint("root", { at: [0, 0, 0] });

  // ============================================================================
  // 1. STEPPED PIXEL-ART DUNGEON FLAGSTONE BASE & RUBBLE
  // ============================================================================

  // Main stepped stone base slabs resting flat at y = 0
  // Using two interlocking flagstone platforms so the whole prop cluster sits on cohesive dungeon floor tiles
  b.part(tileBox([1.74, 0.06, 1.32], STONE_TILE, TEXEL, { rand, step: [4, 4] }), "#ffffff", {
    texture: STONE_TILE,
    bone: root,
    at: [0, 0.03, 0],
    group: "base",
    name: "flagstoneMain",
  });

  // Slightly raised rear sanctuary tier for the chest and torch pillars
  b.part(tileBox([1.56, 0.045, 0.66], STONE_TILE, TEXEL, { rand, step: [4, 4] }), "#ffffff", {
    texture: STONE_TILE,
    bone: root,
    at: [0, 0.0825, -0.27],
    group: "base",
    name: "flagstoneRearTier",
  });

  // Stepped corner trim stones and broken border flagstones around y = 0
  const borderStones: Array<{ size: [number, number, number]; at: [number, number, number]; rot?: number }> = [
    { size: [0.36, 0.06, 0.27], at: [-0.78, 0.03, 0.54] },
    { size: [0.33, 0.06, 0.27], at: [0.78, 0.03, 0.54] },
    { size: [0.3, 0.075, 0.24], at: [-0.81, 0.0375, -0.52] },
    { size: [0.3, 0.075, 0.24], at: [0.81, 0.0375, -0.52] },
    { size: [0.42, 0.045, 0.24], at: [-0.48, 0.0225, 0.66] },
    { size: [0.39, 0.045, 0.21], at: [0.45, 0.0225, 0.66] },
    // Individual raised floor tiles for depth
    { size: [0.36, 0.02, 0.36], at: [-0.45, 0.07, 0.21] },
    { size: [0.33, 0.02, 0.33], at: [0.48, 0.07, 0.24] },
    { size: [0.48, 0.02, 0.39], at: [0, 0.115, -0.22] },
  ];

  borderStones.forEach((st, i) => {
    b.part(new THREE.BoxGeometry(...st.size), stonePaint, {
      bone: root,
      at: st.at,
      rotation: st.rot ? [0, st.rot, 0] : undefined,
      group: "base",
      name: `borderStone${i + 1}`,
    });
  });

  // Low ruined dungeon wall pillar stumps at the back-left and back-right to mount the wall torches
  for (const s of [-1, 1] as const) {
    const sideTag = s < 0 ? "R" : "L";
    const px = s * 0.66;
    const pz = -0.44;

    // Pillar plinth base
    b.part(new THREE.BoxGeometry(0.3, 0.15, 0.27), darkStonePaint, {
      bone: root,
      at: [px, 0.18, pz],
      group: `pillar${sideTag}`,
      name: `pillarBase${sideTag}`,
    });
    // Pillar main shaft
    b.part(tileBox([0.24, 0.72, 0.21], STONE_TILE, TEXEL, { rand, step: [2, 2] }), "#ffffff", {
      texture: STONE_TILE,
      bone: root,
      at: [px, 0.615, pz],
      group: `pillar${sideTag}`,
      name: `pillarShaft${sideTag}`,
    });
    // Stepped stone capital / broken top blocks
    b.part(new THREE.BoxGeometry(0.27, 0.09, 0.24), stonePaint, {
      bone: root,
      at: [px, 1.02, pz],
      group: `pillar${sideTag}`,
      name: `pillarCap${sideTag}`,
    });
    b.part(new THREE.BoxGeometry(0.15, 0.075, 0.15), stonePaint, {
      bone: root,
      at: [px - s * 0.04, 1.1, pz - 0.02],
      group: `pillar${sideTag}`,
      name: `pillarCrown${sideTag}`,
    });
    // Buttress stone blocks flanking pillar
    b.part(new THREE.BoxGeometry(0.12, 0.36, 0.18), darkStonePaint, {
      bone: root,
      at: [px - s * 0.16, 0.285, pz + 0.02],
      group: `pillar${sideTag}`,
      name: `pillarButtress${sideTag}`,
    });
  }

  // ============================================================================
  // 2. HERO TREASURE CHEST (Center-Rear Tier, Open Hinged Lid, Gold & Gems Hoard)
  // ============================================================================

  const chestX = 0;
  const chestY = 0.125; // Top of raised central flagstone
  const chestZ = -0.22;
  const chestW = 0.6;
  const chestH = 0.3;
  const chestD = 0.39;
  const wallT = 0.045;

  // Chest base box (hollowed top with 4 walls so the interior gold hoard sits deep inside)
  // Bottom floor slab of chest
  b.part(tileBox([chestW, 0.06, chestD], PLANKS_TILE, TEXEL, { rand, step: [1, 6] }), "#ffffff", {
    texture: PLANKS_TILE,
    bone: root,
    at: [chestX, chestY + 0.03, chestZ],
    group: "chest",
    name: "chestFloor",
  });
  // Front & back wooden walls
  for (const [zf, zSign] of [
    ["Front", 1],
    ["Back", -1],
  ] as const) {
    b.part(tileBox([chestW, chestH - 0.06, wallT], PLANKS_TILE, TEXEL, { rand, step: [1, 6] }), "#ffffff", {
      texture: PLANKS_TILE,
      bone: root,
      at: [chestX, chestY + 0.06 + (chestH - 0.06) / 2, chestZ + zSign * (chestD / 2 - wallT / 2)],
      group: "chest",
      name: `chestWall${zf}`,
    });
  }
  // Left & right wooden side walls
  for (const [xf, xSign] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    b.part(
      tileBox([wallT, chestH - 0.06, chestD - wallT * 2], PLANKS_TILE, TEXEL, { rand, step: [1, 6] }),
      "#ffffff",
      {
        texture: PLANKS_TILE,
        bone: root,
        at: [chestX + xSign * (chestW / 2 - wallT / 2), chestY + 0.06 + (chestH - 0.06) / 2, chestZ],
        group: "chest",
        name: `chestWall${xf}`,
      },
    );
  }

  // Heavy Iron Corner Posts & Straps on Chest Base
  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      // Corner iron feet
      b.part(new THREE.BoxGeometry(0.09, 0.045, 0.09), ironPaint, {
        bone: root,
        at: [chestX + sx * (chestW / 2 - 0.03), chestY + 0.0225, chestZ + sz * (chestD / 2 - 0.03)],
        group: "chest",
        name: `chestFoot_${sx > 0 ? "L" : "R"}_${sz > 0 ? "F" : "B"}`,
      });
      // Vertical corner iron bindings
      b.part(new THREE.BoxGeometry(0.06, chestH + 0.015, 0.06), ironPaint, {
        bone: root,
        at: [chestX + sx * (chestW / 2 - 0.015), chestY + chestH / 2, chestZ + sz * (chestD / 2 - 0.015)],
        group: "chest",
        name: `chestCornerBand_${sx > 0 ? "L" : "R"}_${sz > 0 ? "F" : "B"}`,
      });
    }
    // Inner vertical iron ribs (front & back)
    for (const sz of [-1, 1] as const) {
      b.part(new THREE.BoxGeometry(0.045, chestH, 0.024), ironPaint, {
        bone: root,
        at: [chestX + sx * 0.165, chestY + chestH / 2, chestZ + sz * (chestD / 2 + 0.006)],
        group: "chest",
        name: `chestInnerStrap_${sx > 0 ? "L" : "R"}_${sz > 0 ? "F" : "B"}`,
      });
    }
    // Side iron carry handles on left & right walls
    const hx = chestX + sx * (chestW / 2 + 0.015);
    const hy = chestY + chestH * 0.58;
    b.part(new THREE.BoxGeometry(0.03, 0.045, 0.12), ironPaint, {
      bone: root,
      at: [hx, hy + 0.02, chestZ],
      group: "chest",
      name: `chestHandleMount_${sx > 0 ? "L" : "R"}`,
    });
    // Pixel-stepped iron ring handle
    b.part(new THREE.BoxGeometry(0.024, 0.075, 0.15), C_IRON_DARK, {
      bone: root,
      at: [hx + sx * 0.018, hy - 0.015, chestZ],
      group: "chest",
      name: `chestHandleRing_${sx > 0 ? "L" : "R"}`,
    });
  }

  // Horizontal iron rim band around top of chest base
  b.part(new THREE.BoxGeometry(chestW + 0.03, 0.045, 0.024), goldTrimPaint, {
    bone: root,
    at: [chestX, chestY + chestH - 0.0225, chestZ + chestD / 2 + 0.008],
    group: "chest",
    name: "chestRimFront",
  });
  b.part(new THREE.BoxGeometry(chestW + 0.03, 0.045, 0.024), ironPaint, {
    bone: root,
    at: [chestX, chestY + chestH - 0.0225, chestZ - chestD / 2 - 0.008],
    group: "chest",
    name: "chestRimBack",
  });

  // Ornate Pixel Lockplate on Chest Front
  b.part(skinBox(SKIN_SHEET, skinSpec.faces.lockplate, TEXEL), "#ffffff", {
    texture: SKIN_SHEET,
    bone: root,
    at: [chestX, chestY + chestH - 0.045, chestZ + chestD / 2 + 0.022],
    group: "chest",
    name: "chestLockplate",
  });

  // Gold rivets along chest straps
  const chestRivetCoords: Array<[number, number, number]> = [
    [-0.285, chestY + 0.09, chestZ + chestD / 2 + 0.018],
    [-0.285, chestY + 0.21, chestZ + chestD / 2 + 0.018],
    [0.285, chestY + 0.09, chestZ + chestD / 2 + 0.018],
    [0.285, chestY + 0.21, chestZ + chestD / 2 + 0.018],
    [-0.165, chestY + 0.09, chestZ + chestD / 2 + 0.02],
    [-0.165, chestY + 0.21, chestZ + chestD / 2 + 0.02],
    [0.165, chestY + 0.09, chestZ + chestD / 2 + 0.02],
    [0.165, chestY + 0.21, chestZ + chestD / 2 + 0.02],
  ];
  chestRivetCoords.forEach((rc, i) => {
    b.part(new THREE.BoxGeometry(0.022, 0.022, 0.018), C_GOLD_BRIGHT, {
      bone: root,
      at: rc,
      group: "chest",
      name: `chestRivet${i + 1}`,
    });
  });

  // Overflowing Gold Hoard, Ingots, Gems, Chalice & Potion inside the Chest
  // Stepped voxel mound of gold coins filling chest interior
  const hoardLayers: Array<{ size: [number, number, number]; at: [number, number, number] }> = [
    { size: [0.5, 0.14, 0.29], at: [chestX, chestY + 0.2, chestZ] },
    { size: [0.44, 0.06, 0.24], at: [chestX - 0.02, chestY + 0.29, chestZ + 0.01] },
    { size: [0.32, 0.045, 0.18], at: [chestX + 0.04, chestY + 0.33, chestZ - 0.01] },
    { size: [0.22, 0.045, 0.15], at: [chestX - 0.08, chestY + 0.335, chestZ + 0.02] },
  ];
  hoardLayers.forEach((hl, i) => {
    b.part(new THREE.BoxGeometry(...hl.size), goldHoardPaint, {
      bone: root,
      at: hl.at,
      group: "chestHoard",
      name: `goldMound${i + 1}`,
    });
  });

  // Gold bars / ingots stacked atop the coin pile
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.105, 0.036, 0.052), goldTrimPaint, {
      bone: root,
      at: [chestX - 0.12 + i * 0.03, chestY + 0.35 + (i === 2 ? 0.032 : 0), chestZ - 0.02 + (i % 2) * 0.055],
      rotation: [4, -18 + i * 22, -6],
      group: "chestHoard",
      name: `goldIngot${i + 1}`,
    });
  }

  // Golden Pixel Goblet / Chalice sticking out of the hoard on the right
  const chaliceAt: [number, number, number] = [chestX + 0.14, chestY + 0.34, chestZ + 0.02];
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.06), goldTrimPaint, {
    bone: root,
    at: chaliceAt,
    rotation: [12, 15, -18],
    group: "chestHoard",
    name: "chaliceBase",
  });
  b.part(new THREE.BoxGeometry(0.028, 0.06, 0.028), goldTrimPaint, {
    bone: root,
    at: [chaliceAt[0] + 0.012, chaliceAt[1] + 0.035, chaliceAt[2] + 0.008],
    rotation: [12, 15, -18],
    group: "chestHoard",
    name: "chaliceStem",
  });
  b.part(new THREE.BoxGeometry(0.075, 0.065, 0.075), goldTrimPaint, {
    bone: root,
    at: [chaliceAt[0] + 0.025, chaliceAt[1] + 0.08, chaliceAt[2] + 0.015],
    rotation: [12, 15, -18],
    group: "chestHoard",
    name: "chaliceCup",
  });

  // Glowing Cut Gems (Ruby, Emerald, Sapphire) nestled in the chest hoard and spilled on the floor
  const gems: Array<{ at: [number, number, number]; size: [number, number, number]; paint: typeof rubyPaint; glowCol: string; rot: [number, number, number] }> = [
    { at: [chestX + 0.02, chestY + 0.365, chestZ + 0.06], size: [0.055, 0.045, 0.055], paint: rubyPaint, glowCol: C_RUBY, rot: [15, 35, -10] },
    { at: [chestX - 0.17, chestY + 0.33, chestZ + 0.07], size: [0.048, 0.048, 0.048], paint: emeraldPaint, glowCol: C_EMERALD, rot: [-12, 20, 25] },
    { at: [chestX + 0.19, chestY + 0.32, chestZ - 0.05], size: [0.05, 0.042, 0.05], paint: sapphirePaint, glowCol: C_SAPPHIRE, rot: [20, -40, 12] },
    // Spilled gems on the flagstones in front of the chest
    { at: [-0.14, 0.142, 0.04], size: [0.045, 0.036, 0.045], paint: rubyPaint, glowCol: C_RUBY, rot: [0, 28, 0] },
    { at: [0.18, 0.14, 0.06], size: [0.042, 0.034, 0.042], paint: emeraldPaint, glowCol: C_EMERALD, rot: [0, -52, 0] },
    { at: [0.08, 0.08, 0.15], size: [0.04, 0.032, 0.04], paint: sapphirePaint, glowCol: C_SAPPHIRE, rot: [0, 19, 0] },
  ];
  gems.forEach((gm, i) => {
    b.part(new THREE.BoxGeometry(...gm.size), gm.paint, {
      bone: root,
      at: gm.at,
      rotation: gm.rot,
      group: "chestHoard",
      name: `gemStone${i + 1}`,
    });
    glow(
      b.part(new THREE.BoxGeometry(gm.size[0] * 0.6, gm.size[1] * 0.6, gm.size[2] * 0.6), gm.glowCol, {
        bone: root,
        at: [gm.at[0], gm.at[1] + 0.012, gm.at[2]],
        rotation: gm.rot,
        group: "chestHoard",
        name: `gemCore${i + 1}`,
      }),
      1.2,
    );
  });

  // Hinged Chest Lid (with `role: "hinge"` joint at rear edge, posed open at -52 degrees so hoard shines out)
  const hingeY = chestY + chestH;
  const hingeZ = chestZ - chestD / 2 + 0.02;
  const chestLidJoint = b.joint("chestLid", {
    parent: root,
    at: [chestX, hingeY, hingeZ],
    dir: [0, 1, 0],
    role: "hinge",
    group: "chestLid",
  });

  // Rear iron hinge knuckles
  for (const sx of [-0.21, 0.21]) {
    b.part(new THREE.BoxGeometry(0.06, 0.045, 0.045), C_IRON_DARK, {
      bone: root,
      at: [chestX + sx, hingeY, hingeZ - 0.01],
      group: "chest",
      name: `chestHingeKnuckle_${sx < 0 ? "R" : "L"}`,
    });
  }

  // Pixel-stepped barrel-vaulted lid built in closed position, then posed open via `b.pose`
  const lidDCells = 26; // 26 * 0.015 = 0.39m
  const LID_PROFILE = stepped(
    [
      [0, 26],
      [0, 26],
      [1, 25],
      [1, 25],
      [2, 24],
      [3, 23],
      [4, 22],
      [6, 20],
      [8, 18],
    ],
    TEXEL,
    { rows: true },
  );

  // Main wooden vaulted lid body
  b.extrude(LID_PROFILE, {
    bone: chestLidJoint,
    at: [chestX, hingeY, hingeZ - 0.02],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: chestW - 0.03,
    color: woodPaint,
    group: "chestLid",
    name: "chestLidVault",
  });

  // Heavy Iron Arched Straps over the Vaulted Chest Lid (left, right, and two inner straps)
  const LID_IRON_PROFILE = stepped(
    [
      [0, 26],
      [0, 26],
      [0, 26],
      [1, 25],
      [2, 24],
      [3, 23],
      [4, 22],
      [6, 20],
      [7, 19],
    ],
    TEXEL,
    { rows: true },
  );

  for (const [tag, xOff, strapW, strapPaint] of [
    ["OuterR", -(chestW / 2 - 0.015), 0.055, ironPaint],
    ["InnerR", -0.165, 0.045, ironPaint],
    ["Center", 0, 0.065, goldTrimPaint],
    ["InnerL", 0.165, 0.045, ironPaint],
    ["OuterL", chestW / 2 - 0.015, 0.055, ironPaint],
  ] as const) {
    b.extrude(LID_IRON_PROFILE, {
      bone: chestLidJoint,
      at: [chestX + xOff, hingeY - 0.004, hingeZ - 0.024],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: strapW,
      color: strapPaint,
      group: "chestLid",
      name: `chestLidStrap_${tag}`,
    });
  }

  // Hanging golden latch clasp on the front of the lid
  b.part(new THREE.BoxGeometry(0.055, 0.07, 0.03), goldTrimPaint, {
    bone: chestLidJoint,
    at: [chestX, hingeY - 0.015, hingeZ - 0.02 + lidDCells * TEXEL + 0.012],
    group: "chestLid",
    name: "chestLidLatch",
  });

  // Pose chest lid open (-50 degrees about world X so the interior treasure is revealed)
  b.pose(chestLidJoint, { axis: [1, 0, 0], deg: -50 });

  // Heavy Padlock lying unlatched on the stone slab next to the chest
  b.part(skinBox(SKIN_SHEET, skinSpec.faces.padlock, TEXEL), "#ffffff", {
    texture: SKIN_SHEET,
    bone: root,
    at: [0.28, 0.145, -0.02],
    rotation: [-90, 28, 0],
    group: "chest",
    name: "unlatchedPadlock",
  });
  b.part(new THREE.BoxGeometry(0.045, 0.018, 0.05), C_IRON_LIGHT, {
    bone: root,
    at: [0.26, 0.142, -0.065],
    rotation: [0, 28, 0],
    group: "chest",
    name: "padlockShackle",
  });

  // Spilled Gold Coins & Coin Stacks around the front of the chest
  const coinStacks: Array<[number, number, number, number]> = [
    [-0.22, 0.125, 0.02, 4],
    [-0.18, 0.125, 0.05, 2],
    [0.14, 0.125, 0.03, 5],
    [0.21, 0.125, 0.02, 3],
    [-0.06, 0.06, 0.14, 3],
    [0.03, 0.06, 0.17, 2],
  ];
  coinStacks.forEach(([cx, cy, cz, count], idx) => {
    for (let c = 0; c < count; c++) {
      b.part(new THREE.BoxGeometry(0.042, 0.012, 0.042), c % 2 === 0 ? C_GOLD_BRIGHT : C_GOLD_MID, {
        bone: root,
        at: [cx + (c % 2) * 0.004, cy + 0.006 + c * 0.012, cz - (c % 2) * 0.003],
        rotation: [0, idx * 23 + c * 17, 0],
        group: "chestHoard",
        name: `coinStack_${idx}_${c}`,
      });
    }
  });

  // Scattered flat gold coin cards on the stone floor
  b.cards(
    [
      frame([-0.26, 0.127, 0.06], [0, 1, 0]),
      frame([-0.09, 0.127, 0.05], [0, 1, 0]),
      frame([0.09, 0.127, 0.06], [0, 1, 0]),
      frame([-0.14, 0.062, 0.18], [0, 1, 0]),
      frame([0.14, 0.062, 0.19], [0, 1, 0]),
    ],
    GOLD_COIN_CARD,
    {
      size: 0.048,
      lean: 90,
      flow: [0, 0, 1],
      mirror: true,
      spin: 90,
      rng: rng(199),
      bone: root,
      group: "chestHoard",
      name: "scatteredCoins",
    },
  );

  // ============================================================================
  // 3. WOODEN DUNGEON BARRELS (Left Cluster: Standing Sealed Barrel + Canted Barrel + Potion)
  // ============================================================================

  const buildBarrel = (
    namePrefix: string,
    centerAt: [number, number, number],
    height: number,
    rEnd: number,
    rMid: number,
    tiltRot: [number, number, number],
    openTop = false,
  ) => {
    const barrelJoint = b.joint(`${namePrefix}Joint`, {
      parent: root,
      at: centerAt,
      dir: [0, 1, 0],
      group: namePrefix,
    });

    // Main bulged wooden stave body (10-sided faceted octagon/decagon for chunky pixel-art silhouette)
    const pBot: [number, number, number] = [centerAt[0], centerAt[1], centerAt[2]];
    const pMid1: [number, number, number] = [centerAt[0], centerAt[1] + height * 0.28, centerAt[2]];
    const pMid2: [number, number, number] = [centerAt[0], centerAt[1] + height * 0.72, centerAt[2]];
    const pTop: [number, number, number] = [centerAt[0], centerAt[1] + height, centerAt[2]];

    b.sweep([pBot, pMid1, pMid2, pTop], [rEnd, rMid, rMid, rEnd], {
      bone: barrelJoint,
      sides: 10,
      smooth: false,
      caps: "flat",
      color: barrelWoodPaint,
      group: namePrefix,
      name: `${namePrefix}Body`,
    });

    // Four forged iron hoops ringing the barrel (bottom, lower-belly, upper-belly, top)
    const hoopHeights = [0.08, 0.32, 0.68, 0.92];
    const hoopRadii = [rEnd + 0.011, rMid + 0.012, rMid + 0.012, rEnd + 0.011];
    hoopHeights.forEach((hf, hi) => {
      const hy = centerAt[1] + height * hf;
      const hr = hoopRadii[hi];
      b.rod([centerAt[0], hy - 0.018, centerAt[2]], [centerAt[0], hy + 0.018, centerAt[2]], hr, {
        bone: barrelJoint,
        sides: 10,
        smooth: false,
        color: ironPaint,
        group: namePrefix,
        name: `${namePrefix}Hoop${hi + 1}`,
      });
    });

    // Recessed wooden lid plank disk on top (or dark liquid/grain interior if open)
    b.rod(
      [centerAt[0], centerAt[1] + height - 0.01, centerAt[2]],
      [centerAt[0], centerAt[1] + height + 0.012, centerAt[2]],
      rEnd - 0.018,
      {
        bone: barrelJoint,
        sides: 10,
        smooth: false,
        color: openTop ? coalPaint : woodPaint,
        group: namePrefix,
        name: `${namePrefix}TopHead`,
      },
    );

    // Raised wooden chime rim segments around top edge
    b.ring(
      frame([centerAt[0], centerAt[1] + height + 0.008, centerAt[2]], [0, 1, 0]),
      { count: 10, radius: rEnd - 0.009, bone: barrelJoint, group: namePrefix },
      (seg) => {
        b.part(new THREE.BoxGeometry(0.042, 0.028, 0.018), woodPaint, {
          frame: seg,
          bone: barrelJoint,
          group: namePrefix,
        });
      },
    );

    // Cork bung stopper + wooden spigot tap on the front of the barrel
    b.part(new THREE.BoxGeometry(0.036, 0.036, 0.03), C_IRON_DARK, {
      bone: barrelJoint,
      at: [centerAt[0], centerAt[1] + height * 0.5, centerAt[2] + rMid + 0.008],
      group: namePrefix,
      name: `${namePrefix}BungMount`,
    });
    b.part(new THREE.BoxGeometry(0.024, 0.024, 0.042), BONE_RAMP[2], {
      bone: barrelJoint,
      at: [centerAt[0], centerAt[1] + height * 0.5, centerAt[2] + rMid + 0.024],
      group: namePrefix,
      name: `${namePrefix}CorkStopper`,
    });

    if (tiltRot[0] !== 0 || tiltRot[1] !== 0 || tiltRot[2] !== 0) {
      b.pose(barrelJoint, {
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler((tiltRot[0] * Math.PI) / 180, (tiltRot[1] * Math.PI) / 180, (tiltRot[2] * Math.PI) / 180),
        ),
      });
    }
    return barrelJoint;
  };

  // Large upright barrel on the left rear
  buildBarrel("barrelTall", [-0.52, 0.08, -0.02], 0.51, 0.165, 0.2, [0, 18, 0], false);

  // Smaller stout barrel in front-left
  buildBarrel("barrelStout", [-0.58, 0.06, 0.36], 0.39, 0.145, 0.175, [0, -25, 0], true);

  // Broken barrel staves & iron hoop lying beside the barrels
  b.part(tileBox([0.24, 0.022, 0.055], PLANKS_TILE, TEXEL, { rand }), "#ffffff", {
    texture: PLANKS_TILE,
    bone: root,
    at: [-0.34, 0.072, 0.39],
    rotation: [0, 32, 4],
    group: "barrelDebris",
    name: "brokenStave1",
  });
  b.part(tileBox([0.21, 0.022, 0.05], PLANKS_TILE, TEXEL, { rand }), "#ffffff", {
    texture: PLANKS_TILE,
    bone: root,
    at: [-0.31, 0.088, 0.44],
    rotation: [6, -14, -8],
    group: "barrelDebris",
    name: "brokenStave2",
  });

  // Glowing Pixel Potion Flask & Mug sitting on top of the tall barrel
  const flaskX = -0.5;
  const flaskY = 0.602;
  const flaskZ = -0.01;
  b.part(new THREE.BoxGeometry(0.075, 0.075, 0.075), potionPaint, {
    bone: root,
    at: [flaskX, flaskY + 0.0375, flaskZ],
    rotation: [0, 22, 0],
    group: "barrelProps",
    name: "potionFlaskBody",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.055, 0.045, 0.055), POTION_RAMP[4], {
      bone: root,
      at: [flaskX, flaskY + 0.03, flaskZ],
      rotation: [0, 22, 0],
      group: "barrelProps",
      name: "potionGlowLiquid",
    }),
    1.1,
  );
  b.part(new THREE.BoxGeometry(0.032, 0.035, 0.032), STONE_RAMP[4], {
    bone: root,
    at: [flaskX, flaskY + 0.088, flaskZ],
    rotation: [0, 22, 0],
    group: "barrelProps",
    name: "potionNeck",
  });
  b.part(new THREE.BoxGeometry(0.026, 0.024, 0.026), BARREL_RAMP[4], {
    bone: root,
    at: [flaskX, flaskY + 0.112, flaskZ],
    rotation: [0, 22, 0],
    group: "barrelProps",
    name: "potionCork",
  });

  // ============================================================================
  // 4. FLOOR SPIKE TRAP (Center-Front Mechanical Pressure Plate & Hinged Spikes)
  // ============================================================================

  const trapX = 0.06;
  const trapY = 0.06;
  const trapZ = 0.34;
  const trapW = 0.54;
  const trapD = 0.48;
  const trapH = 0.045;

  // Heavy bolted iron trap housing frame
  b.part(tileBox([trapW, trapH, trapD], TRAP_GRATE_TILE, TEXEL), "#ffffff", {
    texture: TRAP_GRATE_TILE,
    bone: root,
    at: [trapX, trapY + trapH / 2, trapZ],
    group: "spikeTrap",
    name: "trapPlate",
  });

  // Beveled iron border curbs around the spike trap
  for (const [tag, sz, pos] of [
    ["Front", [trapW + 0.04, 0.055, 0.04] as [number, number, number], [trapX, trapY + 0.0275, trapZ + trapD / 2 + 0.01] as [number, number, number]],
    ["Back", [trapW + 0.04, 0.055, 0.04] as [number, number, number], [trapX, trapY + 0.0275, trapZ - trapD / 2 - 0.01] as [number, number, number]],
    ["Left", [0.04, 0.055, trapD] as [number, number, number], [trapX + trapW / 2 + 0.01, trapY + 0.0275, trapZ] as [number, number, number]],
    ["Right", [0.04, 0.055, trapD] as [number, number, number], [trapX - trapW / 2 - 0.01, trapY + 0.0275, trapZ] as [number, number, number]],
  ]) {
    b.part(tileBox(sz, IRON_TILE, TEXEL, { rand }), "#ffffff", {
      texture: IRON_TILE,
      bone: root,
      at: pos,
      group: "spikeTrap",
      name: `trapCurb${tag}`,
    });
  }

  // Corner iron bolts on the trap frame
  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      b.part(new THREE.BoxGeometry(0.036, 0.025, 0.036), C_IRON_LIGHT, {
        bone: root,
        at: [trapX + sx * (trapW / 2 - 0.02), trapY + 0.055, trapZ + sz * (trapD / 2 - 0.02)],
        group: "spikeTrap",
        name: `trapCornerBolt_${sx > 0 ? "L" : "R"}_${sz > 0 ? "F" : "B"}`,
      });
    }
  }

  // Spring-loaded Spike Array Joint (role: "hinge" so the trap mechanism can actuate)
  const trapMechanismJoint = b.joint("spikeTrapMechanism", {
    parent: root,
    at: [trapX, trapY + 0.02, trapZ],
    dir: [0, 1, 0],
    role: "hinge",
    group: "spikeTrap",
  });

  // 3x3 Grid of Stepped Pixel-Art Iron Spikes (some fully sprung upright, some half-cocked with bloodied tips)
  const SPIKE_BLADE = stepped(
    [
      [-3, 3],
      [-3, 3],
      [-2, 2],
      [-2, 2],
      [-2, 2],
      [-2, 2],
      [-1, 1],
      [-1, 1],
      [-1, 1],
    ],
    TEXEL * 0.75,
    { rows: true },
  );

  const spikeOffsetsX = [-0.165, 0, 0.165];
  const spikeOffsetsZ = [-0.14, 0, 0.14];

  spikeOffsetsX.forEach((ox, ix) => {
    spikeOffsetsZ.forEach((oz, iz) => {
      const sx = trapX + ox;
      const sz = trapZ + oz;
      const baseH = trapY + trapH;

      // Dark iron socket collar ring
      b.part(new THREE.BoxGeometry(0.072, 0.024, 0.072), C_IRON_DARK, {
        bone: trapMechanismJoint,
        at: [sx, baseH + 0.008, sz],
        group: "spikeTrap",
        name: `spikeCollar_${ix}_${iz}`,
      });

      // Vary spike height slightly so the trap looks dynamically sprung
      const isShort = (ix === 0 && iz === 2) || (ix === 2 && iz === 0);
      const yLift = isShort ? -0.035 : 0;

      // Crossed stepped pixel blades for a sharp 3D voxel spike silhouette from every angle
      b.extrude(SPIKE_BLADE, {
        bone: trapMechanismJoint,
        at: [sx, baseH + yLift, sz],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.022,
        color: spikeSteelPaint,
        group: "spikeTrap",
        name: `spikeBladeX_${ix}_${iz}`,
      });
      b.extrude(SPIKE_BLADE, {
        bone: trapMechanismJoint,
        at: [sx, baseH + yLift, sz],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.022,
        color: spikeSteelPaint,
        group: "spikeTrap",
        name: `spikeBladeZ_${ix}_${iz}`,
      });
    });
  });

  // Impaled bone shard & blood splatter card on the spike trap
  b.cards([frame([trapX + 0.06, trapY + trapH + 0.003, trapZ + 0.05], [0, 1, 0])], BLOOD_DECAL_CARD, {
    size: 0.18,
    lean: 90,
    flow: [1, 0, 0.3],
    mirror: true,
    bone: root,
    group: "spikeTrap",
    name: "trapBloodSplatter",
  });

  // ============================================================================
  // 5. SKELETAL REMAINS & BONES (Right Foreground & Draped Near Trap)
  // ============================================================================

  // Main Pixel Skull with hinged jaw resting on the right flagstones, facing three-quarter front-left
  const skullPos: [number, number, number] = [0.54, 0.145, 0.24];
  const skullJoint = b.joint("skullJoint", {
    parent: root,
    at: skullPos,
    dir: [0, 1, 0],
    group: "bones",
  });
  const skullJawJoint = b.joint("skullJaw", {
    parent: skullJoint,
    at: [skullPos[0], skullPos[1] - 0.035, skullPos[2] - 0.02],
    dir: [0, 0, 1],
    role: "jaw",
    group: "bones",
  });

  // Cranium skinBox (12x10x12 texels)
  b.part(skinBox(SKIN_SHEET, skinSpec.faces.skull, TEXEL), "#ffffff", {
    texture: SKIN_SHEET,
    bone: skullJoint,
    at: [skullPos[0], skullPos[1] + 0.03, skullPos[2]],
    group: "bones",
    name: "skullCranium",
  });

  // Cheekbone voxel accents on skull
  for (const s of [-1, 1] as const) {
    b.part(new THREE.BoxGeometry(0.024, 0.032, 0.045), bonePaint, {
      bone: skullJoint,
      at: [skullPos[0] + s * 0.088, skullPos[1] + 0.005, skullPos[2] + 0.045],
      group: "bones",
      name: `skullCheek_${s > 0 ? "L" : "R"}`,
    });
  }

  // Lower jaw skinBox (10x4x9 texels)
  b.part(skinBox(SKIN_SHEET, skinSpec.faces.jaw, TEXEL), "#ffffff", {
    texture: SKIN_SHEET,
    bone: skullJawJoint,
    at: [skullPos[0], skullPos[1] - 0.042, skullPos[2] + 0.015],
    group: "bones",
    name: "skullMandible",
  });

  // Pose jaw slightly agape and tilt the skull naturally on the stone slab
  b.pose(skullJawJoint, { axis: [1, 0, 0], deg: 18 });
  b.pose(skullJoint, {
    quat: new THREE.Quaternion().setFromEuler(
      new THREE.Euler((-12 * Math.PI) / 180, (-32 * Math.PI) / 180, (10 * Math.PI) / 180),
    ),
  });

  // Skeletal Ribcage & Vertebrae Spine Column behind the skull
  const spinePoints: Array<[number, number, number]> = [
    [0.44, 0.095, -0.02],
    [0.49, 0.115, 0.04],
    [0.54, 0.125, 0.1],
    [0.58, 0.11, 0.16],
    [0.62, 0.09, 0.21],
  ];
  spinePoints.forEach((sp, idx) => {
    // Vertebra block
    b.part(new THREE.BoxGeometry(0.048, 0.045, 0.048), bonePaint, {
      bone: root,
      at: sp,
      rotation: [10, -28, 8],
      group: "bones",
      name: `vertebra${idx + 1}`,
    });
    // Dorsal spinous process nub
    b.part(new THREE.BoxGeometry(0.022, 0.036, 0.024), C_BONE_LIGHT, {
      bone: root,
      at: [sp[0] + 0.008, sp[1] + 0.03, sp[2]],
      rotation: [10, -28, 8],
      group: "bones",
      name: `vertebraSpine${idx + 1}`,
    });

    // Curved pixel-stepped ribs arching out from the first 4 vertebrae
    if (idx < 4) {
      for (const side of [-1, 1] as const) {
        const ribSpan = 0.095 - idx * 0.008;
        b.part(new THREE.BoxGeometry(ribSpan, 0.024, 0.024), bonePaint, {
          bone: root,
          at: [sp[0] + side * (ribSpan * 0.55), sp[1] + 0.018, sp[2] + side * 0.015],
          rotation: [0, -28, side * 24],
          group: "bones",
          name: `ribUpper_${idx + 1}_${side > 0 ? "L" : "R"}`,
        });
        b.part(new THREE.BoxGeometry(0.024, 0.068, 0.024), C_BONE_MID, {
          bone: root,
          at: [sp[0] + side * (ribSpan * 0.95), sp[1] - 0.012, sp[2] + side * 0.028],
          rotation: [12, -28, -side * 18],
          group: "bones",
          name: `ribTip_${idx + 1}_${side > 0 ? "L" : "R"}`,
        });
      }
    }
  });

  // Helper to build a classic pixel-art long bone (femur / humerus / tibia) with double condyle knobs at each end
  const buildLongBone = (
    name: string,
    at: [number, number, number],
    len: number,
    rotDeg: [number, number, number],
  ) => {
    const g = new THREE.Euler((rotDeg[0] * Math.PI) / 180, (rotDeg[1] * Math.PI) / 180, (rotDeg[2] * Math.PI) / 180);
    const q = new THREE.Quaternion().setFromEuler(g);
    const center = new THREE.Vector3(...at);

    // Shaft
    b.part(new THREE.BoxGeometry(len, 0.032, 0.032), bonePaint, {
      bone: root,
      at: center,
      quat: q,
      group: "bones",
      name: `${name}Shaft`,
    });

    // Double condyle knobs at both ends
    for (const endSign of [-1, 1] as const) {
      for (const knobZ of [-0.016, 0.016] as const) {
        const localOff = new THREE.Vector3(endSign * (len / 2 + 0.008), 0.004, knobZ).applyQuaternion(q);
        b.part(new THREE.BoxGeometry(0.036, 0.038, 0.032), C_BONE_LIGHT, {
          bone: root,
          at: center.clone().add(localOff),
          quat: q,
          group: "bones",
          name: `${name}Knob_${endSign > 0 ? "A" : "B"}_${knobZ > 0 ? "1" : "2"}`,
        });
      }
    }
  };

  // Scattered long bones around the skeleton and spike trap edge
  buildLongBone("femurRight", [0.42, 0.095, 0.44], 0.24, [0, 38, 4]);
  buildLongBone("tibiaRight", [0.64, 0.082, 0.41], 0.21, [0, -52, -3]);
  buildLongBone("humerusTrap", [-0.28, 0.082, 0.48], 0.19, [0, 22, 2]);
  buildLongBone("ulnaChest", [0.35, 0.145, -0.14], 0.18, [0, -64, 0]);

  // Rusted Dungeon Adventurer's Dagger lying near the skeleton hand bones
  const daggerAt: [number, number, number] = [0.48, 0.078, 0.54];
  b.part(new THREE.BoxGeometry(0.08, 0.024, 0.028), woodPaint, {
    bone: root,
    at: daggerAt,
    rotation: [0, 24, 0],
    group: "bones",
    name: "daggerGrip",
  });
  b.part(new THREE.BoxGeometry(0.024, 0.032, 0.095), goldTrimPaint, {
    bone: root,
    at: [daggerAt[0] - 0.036, daggerAt[1] + 0.002, daggerAt[2] + 0.016],
    rotation: [0, 24, 0],
    group: "bones",
    name: "daggerGuard",
  });
  b.part(new THREE.BoxGeometry(0.16, 0.016, 0.042), spikeSteelPaint, {
    bone: root,
    at: [daggerAt[0] - 0.11, daggerAt[1], daggerAt[2] + 0.05],
    rotation: [0, 24, 0],
    group: "bones",
    name: "daggerBlade",
  });

  // ============================================================================
  // 6. FLAMING DUNGEON TORCHES (Wall Sconces on Pillars + Standing Iron Brazier Torch)
  // ============================================================================

  const buildTorch = (
    namePrefix: string,
    mountAt: [number, number, number],
    tiltDeg: [number, number, number],
    withWallBracket: boolean,
  ) => {
    const torchJoint = b.joint(`${namePrefix}Joint`, {
      parent: root,
      at: mountAt,
      dir: [0, 1, 0],
      role: "hinge",
      group: namePrefix,
    });

    if (withWallBracket) {
      // Heavy iron wall backplate bolted to the stone pillar
      b.part(tileBox([0.105, 0.18, 0.03], IRON_TILE, TEXEL, { rand }), "#ffffff", {
        texture: IRON_TILE,
        bone: root,
        at: [mountAt[0], mountAt[1] - 0.02, mountAt[2] - 0.075],
        group: namePrefix,
        name: `${namePrefix}WallPlate`,
      });
      // Angled iron strut arm supporting the torch ring
      b.part(new THREE.BoxGeometry(0.042, 0.042, 0.11), ironPaint, {
        bone: root,
        at: [mountAt[0], mountAt[1] - 0.03, mountAt[2] - 0.02],
        rotation: [-22, 0, 0],
        group: namePrefix,
        name: `${namePrefix}BracketArm`,
      });
      // Iron sconce ring collar
      b.part(new THREE.BoxGeometry(0.095, 0.045, 0.095), C_IRON_DARK, {
        bone: torchJoint,
        at: [mountAt[0], mountAt[1] + 0.02, mountAt[2]],
        group: namePrefix,
        name: `${namePrefix}SconceCollar`,
      });
    } else {
      // Freestanding wrought-iron floor tripod stand for the foreground torch
      b.part(new THREE.BoxGeometry(0.18, 0.03, 0.18), ironPaint, {
        bone: root,
        at: [mountAt[0], mountAt[1] - 0.165, mountAt[2]],
        group: namePrefix,
        name: `${namePrefix}FloorStandBase`,
      });
      for (const [lx, lz] of [
        [-0.075, -0.075],
        [0.075, -0.075],
        [-0.075, 0.075],
        [0.075, 0.075],
      ]) {
        b.part(new THREE.BoxGeometry(0.042, 0.16, 0.042), ironPaint, {
          bone: root,
          at: [mountAt[0] + lx * 0.65, mountAt[1] - 0.09, mountAt[2] + lz * 0.65],
          rotation: [lz * 180, 0, -lx * 180],
          group: namePrefix,
          name: `${namePrefix}StandLeg_${lx < 0 ? "R" : "L"}_${lz < 0 ? "B" : "F"}`,
        });
      }
    }

    // Tapered square-section wooden torch shaft
    b.frustumBox(
      [mountAt[0], mountAt[1] - 0.14, mountAt[2]],
      [mountAt[0], mountAt[1] + 0.24, mountAt[2]],
      [0.048, 0.048],
      [0.072, 0.072],
      {
        bone: torchJoint,
        color: torchWoodPaint,
        group: namePrefix,
        name: `${namePrefix}WoodenShaft`,
      },
    );

    // Iron cage basket prongs around the torch head
    const headY = mountAt[1] + 0.255;
    b.part(new THREE.BoxGeometry(0.11, 0.036, 0.11), ironPaint, {
      bone: torchJoint,
      at: [mountAt[0], headY - 0.02, mountAt[2]],
      group: namePrefix,
      name: `${namePrefix}BasketLowerBand`,
    });
    b.part(new THREE.BoxGeometry(0.135, 0.03, 0.135), ironPaint, {
      bone: torchJoint,
      at: [mountAt[0], headY + 0.055, mountAt[2]],
      group: namePrefix,
      name: `${namePrefix}BasketUpperBand`,
    });
    for (const [px, pz] of [
      [-0.052, -0.052],
      [0.052, -0.052],
      [-0.052, 0.052],
      [0.052, 0.052],
    ]) {
      b.part(new THREE.BoxGeometry(0.024, 0.11, 0.024), C_IRON_DARK, {
        bone: torchJoint,
        at: [mountAt[0] + px, headY + 0.025, mountAt[2] + pz],
        group: namePrefix,
        name: `${namePrefix}CageProng_${px < 0 ? "R" : "L"}_${pz < 0 ? "B" : "F"}`,
      });
    }

    // Pitch-soaked ember coal bed inside the basket
    b.part(new THREE.BoxGeometry(0.095, 0.075, 0.095), coalPaint, {
      bone: torchJoint,
      at: [mountAt[0], headY + 0.03, mountAt[2]],
      group: namePrefix,
      name: `${namePrefix}PitchHead`,
    });

    // Multi-tiered self-lit 3D Voxel Flame + Crossed Pixel Flame Cards
    const fy = headY + 0.075;
    glow(
      b.part(new THREE.BoxGeometry(0.09, 0.075, 0.09), C_FLAME_TIP, {
        bone: torchJoint,
        at: [mountAt[0], fy + 0.03, mountAt[2]],
        group: namePrefix,
        name: `${namePrefix}FlameOuter`,
      }),
      1.2,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.068, 0.09, 0.068), C_FLAME_MID, {
        bone: torchJoint,
        at: [mountAt[0], fy + 0.065, mountAt[2]],
        rotation: [0, 45, 0],
        group: namePrefix,
        name: `${namePrefix}FlameMid`,
      }),
      1.5,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.042, 0.075, 0.042), C_FLAME_CORE, {
        bone: torchJoint,
        at: [mountAt[0], fy + 0.095, mountAt[2]],
        group: namePrefix,
        name: `${namePrefix}FlameCore`,
      }),
      1.8,
    );
    // Floating pixel sparks above the flame tip
    glow(
      b.part(new THREE.BoxGeometry(0.024, 0.032, 0.024), C_FLAME_TIP, {
        bone: torchJoint,
        at: [mountAt[0] + 0.012, fy + 0.165, mountAt[2] - 0.008],
        group: namePrefix,
        name: `${namePrefix}FlameSpark1`,
      }),
      1.4,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.018, 0.018, 0.018), C_FLAME_CORE, {
        bone: torchJoint,
        at: [mountAt[0] - 0.018, fy + 0.205, mountAt[2] + 0.01],
        group: namePrefix,
        name: `${namePrefix}FlameSpark2`,
      }),
      1.6,
    );

    // Crossed pixel-art flame cards wrapping the voxel core
    glow(
      b.cards([frame([mountAt[0], fy - 0.01, mountAt[2]], [0, 1, 0])], FLAME_CARD, {
        size: [0.18, 0.22],
        cross: true,
        sink: 0.05,
        bone: torchJoint,
        group: namePrefix,
        name: `${namePrefix}FlameCards`,
      }),
      1.5,
    );

    if (tiltDeg[0] !== 0 || tiltDeg[1] !== 0 || tiltDeg[2] !== 0) {
      b.pose(torchJoint, {
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler((tiltDeg[0] * Math.PI) / 180, (tiltDeg[1] * Math.PI) / 180, (tiltDeg[2] * Math.PI) / 180),
        ),
      });
    }
  };

  // Left & Right Wall Sconce Torches mounted on the stone pillars
  buildTorch("torchWallR", [-0.66, 0.72, -0.3], [16, 12, -4], true);
  buildTorch("torchWallL", [0.66, 0.72, -0.3], [16, -12, 4], true);

  // Third Freestanding Iron Tripod Torch next to the barrels & chest
  buildTorch("torchStand", [-0.34, 0.24, -0.22], [6, 20, -4], false);

  // Fallen smoldering hand-torch near the skeleton on the right
  const fallenPos: [number, number, number] = [0.68, 0.088, 0.02];
  b.part(new THREE.BoxGeometry(0.24, 0.042, 0.042), torchWoodPaint, {
    bone: root,
    at: fallenPos,
    rotation: [0, -35, 6],
    group: "fallenTorch",
    name: "fallenTorchShaft",
  });
  b.part(new THREE.BoxGeometry(0.068, 0.06, 0.068), coalPaint, {
    bone: root,
    at: [fallenPos[0] + 0.095, fallenPos[1] + 0.008, fallenPos[2] + 0.065],
    rotation: [0, -35, 6],
    group: "fallenTorch",
    name: "fallenTorchHead",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.036, 0.036, 0.036), C_EMBER, {
      bone: root,
      at: [fallenPos[0] + 0.105, fallenPos[1] + 0.032, fallenPos[2] + 0.072],
      rotation: [0, -35, 6],
      group: "fallenTorch",
      name: "fallenTorchEmber",
    }),
    1.3,
  );

  // ============================================================================
  // 7. DUNGEON CLUTTER: IRON CHAINS, MOSS TUFTS & STONE RUBBLE
  // ============================================================================

  // Heavy Iron Shackle Chains hanging from the right pillar base toward the skeleton
  const chainLinks: Array<{ at: [number, number, number]; rot: [number, number, number] }> = [
    { at: [0.66, 0.42, -0.32], rot: [15, 0, 10] },
    { at: [0.65, 0.36, -0.29], rot: [25, 45, 10] },
    { at: [0.63, 0.3, -0.25], rot: [35, 0, 15] },
    { at: [0.61, 0.24, -0.2], rot: [45, 45, 15] },
    { at: [0.58, 0.18, -0.14], rot: [55, 0, 20] },
    { at: [0.55, 0.14, -0.07], rot: [82, 35, 10] },
  ];
  chainLinks.forEach((cl, i) => {
    b.part(new THREE.BoxGeometry(0.042, 0.068, 0.022), C_IRON_MID, {
      bone: root,
      at: cl.at,
      rotation: cl.rot,
      group: "dungeonClutter",
      name: `shackleChainLink${i + 1}`,
    });
  });

  // Pixel moss tuft cards growing in the flagstone crevices
  b.cards(
    [
      frame([-0.68, 0.06, 0.16], [0, 1, 0]),
      frame([-0.42, 0.06, -0.52], [0, 1, 0]),
      frame([0.46, 0.06, -0.52], [0, 1, 0]),
      frame([0.72, 0.06, 0.18], [0, 1, 0]),
      frame([-0.24, 0.06, 0.56], [0, 1, 0]),
      frame([0.36, 0.06, 0.54], [0, 1, 0]),
    ],
    MOSS_TUFT_CARD,
    {
      size: [0.09, 0.055],
      cross: true,
      sink: 0.12,
      spin: 45,
      rng: rng(303),
      bone: root,
      group: "dungeonClutter",
      name: "dungeonMossTufts",
    },
  );

  return b.root;
}
