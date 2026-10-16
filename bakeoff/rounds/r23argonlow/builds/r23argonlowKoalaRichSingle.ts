import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { noise } from "../../../../src/paint";
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
  name: "Koala on Eucalyptus Stand",
  description:
    "Pixel-art koala with plush silver-grey fur, oversized fluffy ears, leathery oval nose, zygodactyl climbing paws, and a cute joey peeking from its back, gripping a peeling ribbon-gum eucalyptus branch stand.",
  style: "pixel art",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "koala", detail: 0.75, paintSize: 2048 });
  const rand = rng(4207);

  // Unified pixel-art texel grid: 1.5 cm per pixel across boxes, skin sheets, stepped outlines and cellPaints
  const TEXEL = 0.015;

  // ---------------------------------------------------------------------------
  // Colour Ramps (snapped to 64-level VGA-style DAC steps for crisp pixel art)
  // ---------------------------------------------------------------------------
  const snapRamp = (colors: string[]) => colors.map((c) => snapColor(c, 64));

  // Koala cool ash/silver-grey coat ramp (dark shadow -> silver highlight)
  const FUR_GREY = snapRamp(["#262933", "#3a3f4d", "#52586b", "#6e768c", "#8c95ab", "#aeb7cc"]);
  // Warm brownish-grey ramp for rump, shoulders and lower back
  const FUR_WARM = snapRamp(["#2b2628", "#423a3d", "#5c5256", "#786b70", "#96888d", "#b5a7ac"]);
  // Cream / white chest bib, chin, inner ear fluff and belly
  const FUR_CREAM = snapRamp(["#827e78", "#9e9a93", "#bab6ae", "#d6d2c9", "#ebe7df", "#fcfaf5"]);
  // Leathery black-charcoal nose & paw pads
  const NOSE_RAMP = snapRamp(["#0f0f14", "#1b1b24", "#292936", "#3b3b4d", "#525269"]);
  // Pinkish lip / inner ear skin accent
  const PINK_RAMP = snapRamp(["#5e3440", "#824959", "#a86476", "#cc8597"]);
  // Claw horn ramp
  const CLAW_RAMP = snapRamp(["#1a1715", "#2e2925", "#474039", "#665c52", "#877b6e"]);

  // Eucalyptus smooth pale ghost-gum bark + peeling terracotta/cinnamon ribbons
  const BARK_PALE = snapRamp(["#5c5850", "#757166", "#918c7e", "#ada899", "#c9c4b5", "#e0dcd0"]);
  const BARK_RIBBON = snapRamp(["#382017", "#523022", "#6e422f", "#8c563e", "#ab6d50", "#c78667"]);
  const HEARTWOOD = snapRamp(["#4f3424", "#6b4732", "#875c42", "#a67556", "#c28f6d"]);
  // Blue-green glaucous eucalyptus foliage + young ruby tips
  const LEAF_SAGE = snapRamp(["#1b332e", "#284a42", "#38665b", "#4b8275", "#639e8f", "#82bdb0"]);
  const LEAF_RUBY = snapRamp(["#4a1c24", "#6e2a35", "#943b49", "#ba5262"]);
  const MOSS_RAMP = snapRamp(["#1e3618", "#2f5225", "#447034", "#5d9146", "#7cb060"]);
  const STONE_RAMP = snapRamp(["#2b2d33", "#3f424a", "#575b66", "#717682", "#8e94a1"]);
  const GOLD_FLOWER = snapRamp(["#8c6218", "#b58424", "#dbab35", "#f5cc56", "#fae38c"]);

  const FLAT_DARK = FUR_GREY[0];
  const FLAT_NOSE = NOSE_RAMP[1];
  const FLAT_CLAW = CLAW_RAMP[1];
  const FLAT_CREAM = FUR_CREAM[4];
  const FLAT_BARK = BARK_PALE[2];
  const FLAT_RIBBON = BARK_RIBBON[2];
  const FLAT_LEAF = LEAF_SAGE[2];

  // ---------------------------------------------------------------------------
  // Quantized Cell Paints (1.5 cm square pixel cells with ordered Bayer dither)
  // ---------------------------------------------------------------------------

  // Main koala body & limb coat: countershaded silver-grey with warm rump/shoulder mottling and cream bib/belly
  const koalaCoatPaint = cellPaint(
    TEXEL,
    (c) => {
      const p = c.at;
      const n = c.n;
      const m1 = noise(p, 0.14, 11);
      const m2 = noise(p, 0.06, 23);
      const speck = (c.random(7) - 0.5) * 0.16;

      // Chest & belly cream bib (faces +Z and inward toward the branch on the front torso)
      const chestMask =
        p.y > 0.36 &&
        p.y < 0.78 &&
        p.z > 0.03 &&
        Math.abs(p.x) < 0.115 - (p.y - 0.55) * 0.12 &&
        n.z > 0.15;
      const throatMask = p.y >= 0.74 && p.y < 0.84 && p.z > 0.06 && Math.abs(p.x) < 0.065;

      const shade = Math.min(Math.max(0.46 + 0.34 * n.y + 0.12 * Math.abs(n.x) + 0.25 * (m1 - 0.5) + speck, 0.04), 0.98);

      if (chestMask || throatMask) {
        return c.pick(FUR_CREAM, shade + 0.1);
      }

      // Rump dapple patches (koalas have characteristic dappled white/brownish markings on their rump)
      if (p.y < 0.52 && p.z < -0.04) {
        const dapple = noise(p, 0.055, 91);
        if (dapple > 0.66) return c.pick(FUR_CREAM, shade * 0.9);
        return c.pick(FUR_WARM, shade);
      }

      // Warm brownish-grey saddle over shoulders and mid-back
      const warmMix = noise(p, 0.11, 37) + (p.z < -0.02 ? 0.18 : -0.1);
      if (warmMix > 0.58) {
        return c.pick(FUR_WARM, shade);
      }

      // White wrist/ankle cuffs and ear rims
      if (m2 > 0.78 && n.y > 0.2) {
        return c.pick(FUR_GREY, Math.min(1, shade + 0.18));
      }
      return c.pick(FUR_GREY, shade);
    },
    { dither: true },
  );

  // Cream fluffy fur paint for ear tufts, chest ruff, cheek beards
  const creamFluffPaint = cellPaint(
    TEXEL,
    (c) => {
      const n = c.n;
      const m = noise(c.at, 0.06, 53);
      const shade = 0.52 + 0.32 * n.y + 0.22 * (m - 0.5) + (c.random(13) - 0.5) * 0.15;
      return c.pick(FUR_CREAM, shade);
    },
    { dither: true },
  );

  // Dark leathery nose & paw-pad paint with subtle specular sheen at top
  const leatherNosePaint = cellPaint(
    TEXEL * 0.75,
    (c) => {
      const n = c.n;
      const p = c.at;
      // Nostrils dark slots on lower-outer front of nose
      const nostril =
        p.z > 0.18 &&
        p.y > 0.84 &&
        p.y < 0.885 &&
        Math.abs(Math.abs(p.x) - 0.018) < 0.01 &&
        n.z > 0.4;
      if (nostril) return NOSE_RAMP[0];
      const highlight = 0.32 + 0.42 * Math.max(0, n.y) + 0.25 * Math.max(0, n.z) + (c.random(19) - 0.5) * 0.12;
      return c.pick(NOSE_RAMP, highlight);
    },
    { dither: true },
  );

  // Ghost-gum / Ribbon-gum eucalyptus bark paint: smooth silvery-cream bark with diagonal peeling cinnamon ribbons
  const eucalyptusBarkPaint = cellPaint(
    TEXEL,
    (c) => {
      const p = c.at;
      const n = c.n;
      // Diagonal ribbon bands wrapping the trunk
      const spiralWave = Math.sin(p.y * 14 + Math.atan2(p.x, p.z - 0.14) * 2.0 + noise(p, 0.12, 71) * 3.2);
      const patchNoise = noise(p, 0.09, 83);
      const shade = 0.48 + 0.32 * n.y + 0.16 * n.z + (c.random(29) - 0.5) * 0.14;

      // Mossy base near the ground
      if (p.y < 0.16 + 0.06 * patchNoise && n.y > -0.1) {
        if (p.y < 0.1 + 0.05 * patchNoise || c.random(31) < 0.55) {
          return c.pick(MOSS_RAMP, shade);
        }
      }

      // Exposed cinnamon-red ribbon strips where outer pale bark has shed
      if (spiralWave > 0.38 || (patchNoise > 0.68 && spiralWave > -0.1)) {
        return c.pick(BARK_RIBBON, shade);
      }
      // Subtle bluish-grey weathered patches on smooth gum bark
      if (patchNoise < 0.34) {
        return c.pick(FUR_GREY, shade * 0.85 + 0.1);
      }
      return c.pick(BARK_PALE, shade);
    },
    { dither: true },
  );

  // Peeling bark curls paint
  const peelingRibbonPaint = cellPaint(
    TEXEL,
    (c) => {
      const shade = 0.45 + 0.35 * c.n.y + (c.random(41) - 0.5) * 0.18;
      return c.pick(BARK_RIBBON, shade);
    },
    { dither: true },
  );

  // Eucalyptus leaf paint: glaucous sage-teal with pale midrib and occasional ruby-tinted young tips
  const leafPaint = cellPaint(
    TEXEL * 0.8,
    (c) => {
      const s = c.s; // extrude [x, y] in meters
      const shade = 0.5 + 0.35 * c.n.y + (c.random(59) - 0.5) * 0.14;
      // Central midrib vein along x ≈ 0
      if (Math.abs(s[0]) < 0.006 && s[1] > -0.16 && s[1] < 0.01) {
        return BARK_PALE[4];
      }
      // Young leaf tips tinged ruby-red
      if (s[1] < -0.14 && c.random(61) < 0.65) {
        return c.pick(LEAF_RUBY, shade);
      }
      return c.pick(LEAF_SAGE, shade);
    },
    { dither: true },
  );

  // Forest floor mossy earth & stone base paint
  const moundPaint = cellPaint(
    TEXEL,
    (c) => {
      const p = c.at;
      const n = c.n;
      const r = Math.hypot(p.x, p.z - 0.06);
      const m = noise(p, 0.1, 107);
      const shade = 0.45 + 0.38 * n.y + (c.random(67) - 0.5) * 0.15;
      if (n.y > 0.45 && r < 0.28 + 0.05 * m) {
        return c.pick(MOSS_RAMP, shade);
      }
      return c.pick(BARK_RIBBON, shade * 0.8);
    },
    { dither: true },
  );

  const rockPaint = cellPaint(
    TEXEL,
    (c) => {
      const shade = 0.42 + 0.4 * c.n.y + (c.random(73) - 0.5) * 0.14;
      if (c.n.y > 0.65 && c.random(79) < 0.45) return c.pick(MOSS_RAMP, shade);
      return c.pick(STONE_RAMP, shade);
    },
    { dither: true },
  );

  // ---------------------------------------------------------------------------
  // Pixel Textures & Skin Sheets (kits/pixel)
  // ---------------------------------------------------------------------------

  // 1. Skin sheet for structured voxel head blocks (adult skull, snout, nose, lower jaw, joey head, tree base slab)
  const layout = skinLayout(
    {
      skull: [16, 13, 14], // 0.24 x 0.195 x 0.21 m wide round-cheeked koala head
      snout: [10, 8, 7], // 0.15 x 0.12 x 0.105 m broad muzzle
      nose: [6, 8, 4], // 0.09 x 0.12 x 0.06 m iconic black spoon-shaped koala nose
      jaw: [8, 3, 6], // 0.12 x 0.045 x 0.09 m lower jaw & pink/cream chin
      joeyHead: [9, 8, 8], // 0.135 x 0.12 x 0.12 m baby joey head on back
      plinthSign: [12, 5, 2], // little wooden nature plaque on the base
    },
    96,
  );

  const SKIN_SHEET = pixelTexture(...layout.size, (g) => {
    // Helper to fill a box's 6 faces with shaded pixel fur
    const fillFurBox = (faces: (typeof layout.faces)["skull"], baseRamp: string[]) => {
      for (const [faceName, rect] of Object.entries(faces)) {
        const lightBias = faceName === "py" ? 0.2 : faceName === "ny" ? -0.22 : faceName === "pz" ? 0.08 : 0;
        g.fill((x, y, _w, h) => {
          const v = 0.58 - (y / Math.max(1, h)) * 0.28 + lightBias;
          return pick(baseRamp, v, bayer(x, y));
        }, rect);
      }
    };

    fillFurBox(layout.faces.skull, FUR_GREY);
    fillFurBox(layout.faces.snout, FUR_GREY);
    fillFurBox(layout.faces.jaw, FUR_CREAM);
    fillFurBox(layout.faces.joeyHead, FUR_GREY);

    // --- Adult Skull Face Details (pz = 16x13) ---
    const skF = layout.faces.skull.pz;
    // Pale cream cheek tufts at lower left & right corners of skull front
    g.fill((x, y, w, h) => {
      const edgeDist = Math.min(x, w - 1 - x);
      if (y >= h - 6 && edgeDist < 4) return pick(FUR_CREAM, 0.72 - (y - (h - 6)) * 0.05, bayer(x, y));
      if (y < 3 && Math.abs(x - w / 2) < 5) return pick(FUR_GREY, 0.78, bayer(x, y));
      return undefined;
    }, skF);

    // Warm dark-amber koala eyes with vertical slit pupil & crisp pixel catchlight on skull front
    // Left and right eye stamps (each 3x4 pixels)
    const eyeRows = ["kbbk", "bdkb", "bwkb", "kbbk"];
    const eyePal = {
      k: "#141217",
      b: "#4a3219",
      d: "#7a5428",
      w: "#fffdf5",
    };
    g.stamp(skF[0] + 1, skF[1] + 4, eyeRows, eyePal);
    g.stamp(skF[0] + 11, skF[1] + 4, eyeRows, eyePal);

    // Expressive sleepy/gentle pale brow arches above eyes
    g.stamp(
      skF[0] + 1,
      skF[1] + 2,
      ["ccccc....ccccc", "cc..........cc"],
      { c: FUR_CREAM[4] },
    );

    // Skull back (nz): warm grey-brown nape patch
    const skB = layout.faces.skull.nz;
    g.fill((x, y, w, h) => {
      if (Math.abs(x - w / 2) < 5 && y > 3 && y < h - 2) return pick(FUR_WARM, 0.55, bayer(x, y));
      return undefined;
    }, skB);

    // --- Snout Details (pz = 10x8) ---
    const snF = layout.faces.snout.pz;
    g.fill((x, y, w, h) => {
      if (y >= h - 3) return pick(FUR_CREAM, 0.75, bayer(x, y));
      if (Math.abs(x - (w - 1) / 2) < 2.5) return pick(FUR_GREY, 0.35, bayer(x, y));
      return undefined;
    }, snF);

    // --- Iconic Koala Leathery Nose Block (6x8x4) ---
    for (const [faceName, rect] of Object.entries(layout.faces.nose)) {
      const bias = faceName === "py" ? 0.25 : faceName === "ny" ? -0.2 : 0.05;
      g.fill((x, y, _w, h) => pick(NOSE_RAMP, 0.45 - (y / h) * 0.25 + bias, bayer(x, y)), rect);
    }
    const noF = layout.faces.nose.pz; // 6x8
    g.stamp(
      noF[0],
      noF[1],
      [
        ".hhhh.",
        "hwwwwh",
        "hddddh",
        "dddddd",
        "dddddd",
        "dkddkd",
        "dkddkd",
        ".kkkk.",
      ],
      {
        h: NOSE_RAMP[3],
        w: NOSE_RAMP[4],
        d: NOSE_RAMP[2],
        k: NOSE_RAMP[0],
      },
    );

    // --- Lower Jaw Details (8x3x6) ---
    const jwF = layout.faces.jaw.pz;
    g.stamp(
      jwF[0],
      jwF[1],
      [
        "kppppppk",
        "cccccccc",
        ".cccccc.",
      ],
      {
        k: NOSE_RAMP[0],
        p: PINK_RAMP[2],
        c: FUR_CREAM[4],
      },
    );
    const jwTop = layout.faces.jaw.py;
    g.fill((x, y, w, h) => {
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) return PINK_RAMP[1];
      return FUR_CREAM[3];
    }, jwTop);

    // --- Baby Joey Head Details (9x8x8) ---
    const jyF = layout.faces.joeyHead.pz;
    g.stamp(
      jyF[0],
      jyF[1],
      [
        "..ggggg..",
        ".ggggggg.",
        "gccc.cccg",
        "gkwc.cwkg",
        "gkkknkkkg",
        "gccnnnccg",
        ".ccnnncc.",
        "..ccccc..",
      ],
      {
        g: FUR_GREY[3],
        c: FUR_CREAM[4],
        k: "#141217",
        w: "#ffffff",
        n: NOSE_RAMP[1],
      },
    );

    // --- Wooden Plaque on Base (12x5x2) ---
    for (const rect of Object.values(layout.faces.plinthSign)) {
      g.fill((x, y) => pick(HEARTWOOD, 0.45 + 0.15 * ((x + y) % 2), bayer(x, y)), rect);
    }
    const sgF = layout.faces.plinthSign.pz;
    g.stamp(
      sgF[0],
      sgF[1],
      [
        "bbbbbbbbbbbb",
        "b.k.k.kk.k.b",
        "b.kk..kk.k.b",
        "b.k.k.kk.k.b",
        "bbbbbbbbbbbb",
      ],
      {
        b: BARK_RIBBON[1],
        k: FUR_CREAM[4],
      },
    );
  });

  // 2. Pixel-art Fur Tuft Card Textures (for fluffy ears, cheek ruffs, rump & chest fur)
  const CREAM_TUFT_TEX = pixelArt(
    [
      "...ww..ww...",
      "..wwwwwwww..",
      ".wwwwwwwwww.",
      ".wwwccccwww.",
      "wwwwccccwwww",
      "wwwccccccwww",
      ".wwccccccww.",
      ".wccccccccw.",
    ],
    {
      w: FUR_CREAM[5],
      c: FUR_CREAM[3],
    },
  );

  const GREY_TUFT_TEX = pixelArt(
    [
      "..ll...ll..",
      ".llll.llll.",
      "lllllllllll",
      "lllmmmmmlll",
      "llmmmmmmmll",
      ".lmmdddmml.",
      ".lmdddddml.",
    ],
    {
      l: FUR_GREY[4],
      m: FUR_GREY[3],
      d: FUR_GREY[1],
    },
  );

  // 3. Pixel-art Eucalyptus Leaf Cluster & Gum-Blossom Card Texture
  const FOLIAGE_CARD_TEX = pixelArt(
    [
      ".....ll....ll.....",
      "....llll..llll....",
      "...llllll.lllll...",
      "..llllvlllllvlll..",
      "..lllvlllllllvll..",
      ".llllvlllllllvlll.",
      ".lllvllllbblllvll.",
      "..llvlllbbbbllvl..",
      "...lvllbbffbbll...",
      "....v..bffffb.....",
    ],
    {
      l: LEAF_SAGE[3],
      v: LEAF_SAGE[5],
      b: BARK_RIBBON[2],
      f: GOLD_FLOWER[3],
    },
  );

  // 4. Tree Ring / Cut Heartwood Tile for Branch Ends & Base Timber Blocks
  const BARK_TILE = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const strip = (x + Math.floor(y / 3)) % 9;
      if (strip < 2) return pick(BARK_RIBBON, 0.45 + 0.25 * ((y % 5) / 5), bayer(x, y));
      return pick(BARK_PALE, 0.55 + 0.2 * ((x % 4) / 4), bayer(x, y));
    });
  });

  // ---------------------------------------------------------------------------
  // Staircase Pixel Outlines (stepped) for Ears & Eucalyptus Leaves
  // ---------------------------------------------------------------------------

  // Big round fluffy koala outer ear silhouette (rows from bottom to top, in TEXEL cells)
  const OUTER_EAR_OUTLINE = stepped(
    [
      [-2, 3],
      [-3, 5],
      [-4, 6],
      [-4, 7],
      [-4, 7],
      [-4, 7],
      [-3, 6],
      [-2, 5],
      [-1, 3],
    ],
    TEXEL,
    { rows: true, start: -4 },
  );

  // Pinkish/cream inner ear recess
  const INNER_EAR_OUTLINE = stepped(
    [
      [-1, 2],
      [-2, 4],
      [-2, 5],
      [-2, 5],
      [-2, 4],
      [-1, 3],
    ],
    TEXEL,
    { rows: true, start: -2 },
  );

  // Long, sickle-curved lanceolate eucalyptus leaf outline (rows from tip at bottom to petiole at top)
  const EUCALYPTUS_LEAF_OUTLINE = stepped(
    [
      [0, 1],
      [0, 2],
      [-1, 2],
      [-1, 3],
      [-2, 3],
      [-2, 3],
      [-2, 3],
      [-2, 2],
      [-2, 2],
      [-1, 2],
      [-1, 1],
      [0, 1],
    ],
    TEXEL,
    { rows: true, start: -11 },
  );

  // Smaller broad juvenile eucalyptus leaf outline
  const JUVENILE_LEAF_OUTLINE = stepped(
    [
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-3, 3],
      [-3, 3],
      [-2, 2],
      [-1, 1],
    ],
    TEXEL,
    { rows: true, start: -6 },
  );

  // ---------------------------------------------------------------------------
  // 1. Skeleton — Full Creature Rig + Branch Stand Hierarchy
  // ---------------------------------------------------------------------------
  // Root pelvis joint of the koala (climber seated against the eucalyptus fork)
  const hips = b.joint("hips", {
    at: [0, 0.42, -0.02],
    dir: [0, 1, 0.08],
    role: "spine",
    group: "koala_body",
  });

  // Eucalyptus branch stand joint parented to root so the entire model is a single valid tree
  const standRoot = b.joint("standRoot", {
    parent: hips,
    at: [0, 0.0, 0.14],
    dir: [0, 1, 0],
    group: "stand",
  });

  // Spine chain curving up the koala's plump arched back
  const spinePath = catmull([
    [0, 0.42, -0.02],
    [0, 0.54, -0.045],
    [0, 0.67, -0.02],
    [0, 0.77, 0.025],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest", "neck"],
    role: "spine",
    group: "koala_body",
  });
  const chestJoint = spine.joints[2];
  const neckJoint = spine.joints[3];

  // Head & Jaw joints
  const head = b.joint("head", {
    parent: neckJoint,
    at: [0, 0.84, 0.06],
    dir: [0, 0.12, 1],
    role: "head",
    group: "koala_head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.78, 0.11],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "koala_head",
  });

  // Large iconic round ears (left +X, right -X)
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.12, 0.91, 0.04],
      dir: [s * 0.92, 0.32, 0.15],
      role: "fan",
      group: `ear_${side}`,
    });
  }

  // Vestigial koala rump-tail joint (koalas have a tiny round cushion tail stub)
  const tail = b.joint("tail", {
    parent: hips,
    at: [0, 0.37, -0.15],
    dir: [0, -0.35, -0.94],
    role: "tail",
    group: "koala_body",
  });

  // Baby Joey joint riding high on the mother's back
  const joeyJoint = b.joint("joey", {
    parent: spine.joints[1],
    at: [0, 0.63, -0.15],
    dir: [0, 0.55, 0.83],
    role: "hinge",
    group: "joey",
  });

  // Forelimbs (arms reaching forward and around the vertical eucalyptus trunk at z ≈ 0.15)
  // Separated and clearly readable from every angle, with zygodactyl climbing digits (2 thumbs + 3 fingers)
  const armChains: Record<number, ReturnType<typeof b.chain>> = {};
  const legChains: Record<number, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const yOff = s > 0 ? 0.035 : -0.025; // slight natural climbing stagger so left/right hands grip at offset heights

    const armPts = [
      [s * 0.135, 0.72, 0.01], // shoulder
      [s * 0.215, 0.69 + yOff * 0.5, 0.11], // elbow bowed outward for readable silhouette
      [s * 0.115, 0.71 + yOff, 0.185], // wrist gripping trunk side
      [s * 0.055, 0.72 + yOff, 0.225], // hand palm
    ];
    const arm = b.chain(`arm${side}`, polyline(armPts), {
      parent: chestJoint,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      group: `arm_${side}`,
    });
    armChains[s] = arm;
    const handJoint = arm.tip!;

    // Zygodactyl forepaw digits: 2 opposable inner thumbs gripping down/around + 3 outer fingers gripping around
    const fingerSpecs = [
      { name: `thumbA${side}`, tip: [s * 0.015, 0.685 + yOff, 0.235] },
      { name: `thumbB${side}`, tip: [s * 0.01, 0.71 + yOff, 0.245] },
      { name: `index${side}`, tip: [s * 0.01, 0.74 + yOff, 0.245] },
      { name: `middle${side}`, tip: [s * 0.015, 0.76 + yOff, 0.238] },
      { name: `ring${side}`, tip: [s * 0.025, 0.775 + yOff, 0.225] },
    ];
    for (const fg of fingerSpecs) {
      b.joint(fg.name, {
        parent: handJoint,
        at: handJoint.at,
        aim: fg.tip,
        role: "digit",
        group: `arm_${side}`,
      });
    }

    // Hindlimbs (strong thighs braced on the lower trunk & fork branch)
    const legYOff = s > 0 ? 0.02 : -0.02;
    const legPts = [
      [s * 0.125, 0.43, -0.01], // hip
      [s * 0.21, 0.45 + legYOff * 0.5, 0.11], // knee bowed out
      [s * 0.12, 0.37 + legYOff, 0.175], // ankle against trunk
      [s * 0.065, 0.36 + legYOff, 0.22], // foot
    ];
    const leg = b.chain(`leg${side}`, polyline(legPts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.065, 0.36 + legYOff, 0.22],
      group: `leg_${side}`,
    });
    legChains[s] = leg;
    const footJoint = leg.tip!;

    // Hindpaw digits: opposable clawless hallux (inner thumb) + syndactyl inner toe + 2 outer clawed toes
    const toeSpecs = [
      { name: `hallux${side}`, tip: [s * 0.02, 0.325 + legYOff, 0.225] },
      { name: `toeInner${side}`, tip: [s * 0.015, 0.355 + legYOff, 0.24] },
      { name: `toeMid${side}`, tip: [s * 0.015, 0.38 + legYOff, 0.24] },
      { name: `toeOuter${side}`, tip: [s * 0.025, 0.40 + legYOff, 0.228] },
    ];
    for (const td of toeSpecs) {
      b.joint(td.name, {
        parent: footJoint,
        at: footJoint.at,
        aim: td.tip,
        role: "digit",
        group: `leg_${side}`,
      });
    }
  }

  // Slight natural head turn/tilt for life & charm
  b.pose(head, { axis: [0, 1, 0], deg: -6 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });

  // ---------------------------------------------------------------------------
  // 2. Eucalyptus Branch Stand & Forest Floor Base (Grounded on y = 0)
  // ---------------------------------------------------------------------------

  // Stepped pixel-art forest floor mound (touches y = 0 cleanly across a 0.64 m base)
  const baseSlabs: Array<{ size: [number, number, number]; at: [number, number, number] }> = [
    { size: [0.58, 0.045, 0.54], at: [0, 0.0225, 0.06] },
    { size: [0.48, 0.045, 0.44], at: [0, 0.06, 0.07] },
    { size: [0.36, 0.045, 0.34], at: [0, 0.095, 0.09] },
  ];
  for (const [idx, s] of baseSlabs.entries()) {
    b.part(new THREE.BoxGeometry(...s.size), moundPaint, {
      bone: standRoot,
      at: s.at,
      flat: true,
      group: "stand_base",
      name: `baseSlab${idx + 1}`,
    });
  }

  // Corner pixel rocks & mossy boulders around the base perimeter (grounded at y = 0)
  const rockPlacements: Array<{ at: [number, number, number]; size: [number, number, number]; rot: number }> = [
    { at: [0.24, 0.035, 0.22], size: [0.09, 0.07, 0.08], rot: 15 },
    { at: [0.27, 0.025, 0.15], size: [0.06, 0.05, 0.06], rot: -20 },
    { at: [-0.23, 0.04, 0.20], size: [0.10, 0.08, 0.09], rot: -12 },
    { at: [-0.26, 0.025, -0.12], size: [0.075, 0.05, 0.075], rot: 28 },
    { at: [0.22, 0.03, -0.15], size: [0.08, 0.06, 0.08], rot: 8 },
    { at: [-0.14, 0.03, -0.19], size: [0.09, 0.06, 0.07], rot: -32 },
  ];
  for (const [i, rk] of rockPlacements.entries()) {
    b.part(new THREE.BoxGeometry(...rk.size), rockPaint, {
      bone: standRoot,
      at: rk.at,
      rotation: [0, rk.rot, 0],
      flat: true,
      group: "stand_base",
      name: `baseRock${i + 1}`,
    });
  }

  // Small wooden nature plaque on the front-right of the plinth
  b.part(skinBox(SKIN_SHEET, layout.faces.plinthSign, TEXEL), FLAT_BARK, {
    bone: standRoot,
    at: [0.16, 0.06, 0.29],
    rotation: [-12, 18, 0],
    texture: SKIN_SHEET,
    group: "stand_base",
    name: "plinthSign",
  });

  // Gnarled buttress roots flaring from the trunk down into the mossy mound
  const rootPaths: number[][][] = [
    [
      [0.02, 0.22, 0.14],
      [0.12, 0.12, 0.22],
      [0.22, 0.035, 0.28],
    ],
    [
      [-0.02, 0.22, 0.14],
      [-0.13, 0.11, 0.21],
      [-0.22, 0.035, 0.26],
    ],
    [
      [0.03, 0.20, 0.10],
      [0.14, 0.10, -0.02],
      [0.21, 0.035, -0.14],
    ],
    [
      [-0.03, 0.20, 0.10],
      [-0.13, 0.10, -0.04],
      [-0.20, 0.035, -0.15],
    ],
  ];
  for (const [i, rp] of rootPaths.entries()) {
    b.sweep(catmull(rp), [0.055, 0.022], {
      bone: standRoot,
      section: { ngon: 6 },
      smooth: false,
      color: eucalyptusBarkPaint,
      group: "stand_trunk",
      name: `buttressRoot${i + 1}`,
    });
  }

  // Main Eucalyptus Trunk (rises from base at z=0.12, leans slightly so the koala hugs it between z=0.14..0.18,
  // then curves up into a high canopy crown at y=1.18)
  const mainTrunkPath = catmull([
    [0, 0.02, 0.12],
    [0.01, 0.26, 0.14],
    [0.0, 0.52, 0.165],
    [-0.01, 0.78, 0.155],
    [-0.03, 1.02, 0.11],
    [-0.06, 1.18, 0.05],
  ]);
  const mainTrunk = b.sweep(mainTrunkPath, [0.095, 0.078, 0.068, 0.062, 0.052, 0.038], {
    bone: standRoot,
    section: { ngon: 8 },
    smooth: false,
    caps: "flat",
    color: eucalyptusBarkPaint,
    group: "stand_trunk",
    name: "mainTrunk",
  });

  // Heartwood top cap & growth rings on main trunk cut end
  const topStubFrame = mainTrunk.at(1, 0);
  b.part(tileBox([0.058, 0.015, 0.058], BARK_TILE, TEXEL, { rand }), HEARTWOOD[2], {
    bone: standRoot,
    at: mainTrunkPath.at(1),
    dir: mainTrunkPath.tangentAt(1),
    texture: BARK_TILE,
    group: "stand_trunk",
    name: "trunkTopCap",
  });
  void topStubFrame;

  // Lower Seat Branch (forks backward under the koala's rump at y ≈ 0.31 so the koala sits securely in the fork!)
  const seatBranchPath = catmull([
    [0.0, 0.30, 0.145],
    [0.0, 0.31, 0.01],
    [0.02, 0.34, -0.14],
    [0.09, 0.42, -0.27],
    [0.16, 0.50, -0.34],
  ]);
  b.sweep(seatBranchPath, [0.062, 0.056, 0.048, 0.036, 0.024], {
    bone: standRoot,
    section: { ngon: 7 },
    smooth: false,
    caps: { start: "none", end: "flat" },
    color: eucalyptusBarkPaint,
    group: "stand_trunk",
    name: "seatBranch",
  });

  // Upper Right Lateral Bough (curves out to -X and forward, framing the koala with hanging foliage)
  const rightBoughPath = catmull([
    [-0.01, 0.64, 0.16],
    [-0.14, 0.72, 0.17],
    [-0.27, 0.82, 0.13],
    [-0.36, 0.90, 0.06],
  ]);
  b.sweep(rightBoughPath, [0.048, 0.038, 0.028, 0.018], {
    bone: standRoot,
    section: { ngon: 6 },
    smooth: false,
    caps: { start: "none", end: "flat" },
    color: eucalyptusBarkPaint,
    group: "stand_trunk",
    name: "rightBough",
  });

  // Upper Left Canopy Bough (splits from high trunk at y=0.96 toward +X)
  const leftBoughPath = catmull([
    [-0.02, 0.95, 0.13],
    [0.12, 1.04, 0.11],
    [0.25, 1.12, 0.06],
    [0.33, 1.17, 0.0],
  ]);
  b.sweep(leftBoughPath, [0.042, 0.032, 0.024, 0.016], {
    bone: standRoot,
    section: { ngon: 6 },
    smooth: false,
    caps: { start: "none", end: "flat" },
    color: eucalyptusBarkPaint,
    group: "stand_trunk",
    name: "leftBough",
  });

  // Front Snack Twig (sprouts from trunk near chest height so a fresh eucalyptus sprig hangs near the koala's mouth)
  const snackTwigPath = catmull([
    [0.02, 0.75, 0.17],
    [-0.06, 0.78, 0.24],
    [-0.11, 0.81, 0.27],
  ]);
  b.sweep(snackTwigPath, [0.016, 0.012, 0.008], {
    bone: standRoot,
    section: { ngon: 5 },
    smooth: false,
    color: FLAT_RIBBON,
    group: "stand_trunk",
    name: "snackTwig",
  });

  // Peeling Ribbon-Gum Bark Curls hanging from the trunk & fork (signature eucalyptus detail)
  const barkCurls: Array<{ start: [number, number, number]; mid: [number, number, number]; tip: [number, number, number] }> = [
    { start: [0.065, 0.56, 0.16], mid: [0.10, 0.50, 0.18], tip: [0.08, 0.44, 0.21] },
    { start: [-0.06, 0.48, 0.15], mid: [-0.10, 0.42, 0.16], tip: [-0.08, 0.36, 0.19] },
    { start: [0.02, 0.88, 0.16], mid: [0.06, 0.83, 0.20], tip: [0.04, 0.78, 0.22] },
    { start: [0.04, 0.36, -0.18], mid: [0.08, 0.30, -0.20], tip: [0.06, 0.25, -0.17] },
    { start: [-0.20, 0.77, 0.15], mid: [-0.22, 0.71, 0.17], tip: [-0.19, 0.66, 0.19] },
  ];
  for (const [i, bc] of barkCurls.entries()) {
    b.sweep(bezier(bc.start, bc.mid, bc.tip), [0.014, 0.004], {
      bone: standRoot,
      section: "box",
      smooth: false,
      color: peelingRibbonPaint,
      group: "stand_bark",
      name: `barkRibbon${i + 1}`,
    });
  }

  // Stepped Pixel-Art Eucalyptus Leaves & Gum Nuts in Canopy Clusters
  const leafClusters: Array<{
    anchor: [number, number, number];
    leaves: Array<{ dir: [number, number, number]; rotY: number; juvenile?: boolean }>;
    gumnuts?: boolean;
    blossom?: boolean;
  }> = [
    // Top central canopy crown
    {
      anchor: [-0.06, 1.18, 0.05],
      gumnuts: true,
      blossom: true,
      leaves: [
        { dir: [0.3, 0.1, 0.8], rotY: 15 },
        { dir: [-0.5, 0.0, 0.6], rotY: -35 },
        { dir: [0.6, -0.1, -0.4], rotY: 65 },
        { dir: [-0.3, -0.15, -0.7], rotY: 140 },
        { dir: [0.0, 0.2, -0.8], rotY: 180, juvenile: true },
      ],
    },
    // High left bough tip (+X)
    {
      anchor: [0.33, 1.17, 0.0],
      gumnuts: true,
      leaves: [
        { dir: [0.7, -0.1, 0.4], rotY: 25 },
        { dir: [0.3, -0.2, 0.8], rotY: -15 },
        { dir: [0.6, -0.15, -0.5], rotY: 85 },
        { dir: [-0.2, 0.1, 0.7], rotY: -50, juvenile: true },
      ],
    },
    // Mid-left bough cluster
    {
      anchor: [0.16, 1.07, 0.09],
      blossom: true,
      leaves: [
        { dir: [0.5, -0.1, 0.7], rotY: 10 },
        { dir: [0.2, -0.2, -0.7], rotY: 120 },
        { dir: [0.8, 0.0, 0.2], rotY: 55, juvenile: true },
      ],
    },
    // Right lateral bough tip (-X)
    {
      anchor: [-0.36, 0.90, 0.06],
      gumnuts: true,
      blossom: true,
      leaves: [
        { dir: [-0.7, -0.1, 0.5], rotY: -25 },
        { dir: [-0.3, -0.15, 0.8], rotY: 15 },
        { dir: [-0.6, -0.1, -0.6], rotY: -110 },
        { dir: [0.1, -0.2, 0.7], rotY: 45, juvenile: true },
      ],
    },
    // Mid-right bough cluster
    {
      anchor: [-0.22, 0.78, 0.15],
      leaves: [
        { dir: [-0.5, -0.15, 0.7], rotY: -18 },
        { dir: [-0.6, -0.1, -0.5], rotY: -95 },
        { dir: [-0.2, 0.1, 0.8], rotY: 30, juvenile: true },
      ],
    },
    // Back seat branch tip (-Z)
    {
      anchor: [0.16, 0.50, -0.34],
      gumnuts: true,
      leaves: [
        { dir: [0.5, -0.1, -0.7], rotY: 135 },
        { dir: [-0.4, -0.15, -0.8], rotY: -145 },
        { dir: [0.7, 0.0, -0.3], rotY: 95 },
        { dir: [0.1, 0.15, -0.9], rotY: 175, juvenile: true },
      ],
    },
    // Snack twig right by the koala's mouth!
    {
      anchor: [-0.11, 0.81, 0.27],
      leaves: [
        { dir: [-0.4, -0.1, 0.6], rotY: -20, juvenile: true },
        { dir: [0.3, -0.15, 0.7], rotY: 25, juvenile: true },
        { dir: [-0.6, -0.2, 0.2], rotY: -65 },
      ],
    },
  ];

  const foliageCardFrames: ReturnType<typeof frame>[] = [];

  for (const [ci, cl] of leafClusters.entries()) {
    const [ax, ay, az] = cl.anchor;
    foliageCardFrames.push(frame([ax, ay + 0.01, az], [0, 1, 0]));

    for (const [li, lf] of cl.leaves.entries()) {
      const rad = (lf.rotY * Math.PI) / 180;
      const xDir: [number, number, number] = [Math.cos(rad), 0.15, Math.sin(rad)];
      const yDir: [number, number, number] = [lf.dir[0] * 0.25, 0.92, lf.dir[2] * 0.25];
      const outline = lf.juvenile ? JUVENILE_LEAF_OUTLINE : EUCALYPTUS_LEAF_OUTLINE;
      b.extrude(outline, {
        bone: standRoot,
        at: [ax + lf.dir[0] * 0.02, ay + lf.dir[1] * 0.02, az + lf.dir[2] * 0.02],
        x: xDir,
        y: yDir,
        thickness: 0.012,
        color: leafPaint,
        group: "stand_foliage",
        name: `leaf_${ci}_${li}`,
      });
    }

    // Woody cup-shaped Eucalyptus Gum Nuts (capsules) hanging in clusters of 2
    if (cl.gumnuts) {
      for (const s of [-1, 1]) {
        const nutAt: [number, number, number] = [ax + s * 0.022, ay - 0.035, az + s * 0.012];
        b.lathe(
          [
            [0, 0, "sharp"],
            [0.008, 0, "sharp"],
            [0.018, 0.018, "sharp"],
            [0.02, 0.034, "sharp"],
            [0.014, 0.038, "sharp"],
            [0, 0.034, "sharp"],
          ],
          {
            bone: standRoot,
            at: nutAt,
            axis: [s * 0.25, -0.95, 0.15],
            segments: 6,
            color: FLAT_RIBBON,
            group: "stand_foliage",
            name: `gumNut_${ci}_${s > 0 ? "L" : "R"}`,
          },
        );
      }
    }

    // Golden-cream eucalyptus gum blossom puff
    if (cl.blossom) {
      const blAt: [number, number, number] = [ax, ay + 0.03, az + 0.015];
      b.part(new THREE.BoxGeometry(0.032, 0.032, 0.032), GOLD_FLOWER[3], {
        bone: standRoot,
        at: blAt,
        rotation: [25, 35, 15],
        flat: true,
        group: "stand_foliage",
        name: `blossomCore_${ci}`,
      });
      b.part(new THREE.BoxGeometry(0.042, 0.018, 0.042), GOLD_FLOWER[4], {
        bone: standRoot,
        at: blAt,
        rotation: [0, 20, 0],
        flat: true,
        group: "stand_foliage",
        name: `blossomStamens_${ci}`,
      });
    }
  }

  // Add crossed pixel-art foliage cards at cluster anchors for extra lushness
  b.cards(foliageCardFrames, FOLIAGE_CARD_TEX, {
    bone: standRoot,
    size: [0.13, 0.09],
    lean: 25,
    cross: true,
    vary: 0.15,
    spin: 45,
    rng: rng(88),
    group: "stand_foliage",
    name: "foliageCards",
  });

  // Small fallen eucalyptus leaves & woody gum-nuts on the mossy base
  const groundLeaves: Array<{ at: [number, number, number]; rot: number }> = [
    { at: [0.14, 0.052, 0.19], rot: 35 },
    { at: [-0.15, 0.052, 0.16], rot: -50 },
    { at: [-0.08, 0.052, -0.14], rot: 110 },
  ];
  for (const [i, gl] of groundLeaves.entries()) {
    const rad = (gl.rot * Math.PI) / 180;
    b.extrude(JUVENILE_LEAF_OUTLINE, {
      bone: standRoot,
      at: gl.at,
      x: [Math.cos(rad), 0, Math.sin(rad)],
      y: [-Math.sin(rad), 0.12, Math.cos(rad)],
      thickness: 0.009,
      color: leafPaint,
      group: "stand_base",
      name: `fallenLeaf${i + 1}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Koala Body — Plump Pear-Shaped Marsupial Torso, Chest Ruff & Rump Stub
  // ---------------------------------------------------------------------------

  // Main torso loft over the spine chain: wide, round-bottomed pear silhouette (faceted 8-gon for crisp low-poly/pixel look)
  const torsoStations = [
    { at: [0, 0.36, -0.04], w: 0.25, h: 0.22 }, // broad seated rump cushion
    { at: [0, 0.46, -0.04], w: 0.31, h: 0.27 }, // round lower belly & hips
    { at: [0, 0.59, -0.03], w: 0.29, h: 0.25 }, // plump midsection
    { at: [0, 0.71, 0.0], w: 0.25, h: 0.22 }, // sturdy shoulders
    { at: [0, 0.80, 0.035], w: 0.18, h: 0.17 }, // thick neck base
  ];
  const bodySweep = b.loft(torsoStations, {
    bone: spine,
    sides: 8,
    smooth: false,
    color: koalaCoatPaint,
    group: "koala_body",
    name: "torsoLoft",
  });

  // Plush Cream Chest Bib / Sternum Fur Shield on the front of the chest
  const chestBibStations = [
    { at: [0, 0.49, 0.08], w: 0.15, h: 0.06 },
    { at: [0, 0.61, 0.085], w: 0.17, h: 0.07 },
    { at: [0, 0.73, 0.095], w: 0.14, h: 0.065 },
  ];
  b.loft(chestBibStations, {
    bone: spine,
    sides: 6,
    smooth: false,
    color: creamFluffPaint,
    group: "koala_body",
    name: "chestBib",
  });

  // Vestigial round rump tail cushion
  b.capsule(tail.at, offset(tail.at, [0, -0.3, -1], 0.035), [0.045, 0.032], {
    bone: tail,
    sides: 6,
    smooth: false,
    color: koalaCoatPaint,
    group: "koala_body",
    name: "tailStub",
  });

  // ---------------------------------------------------------------------------
  // 4. Koala Head — Oversized Blocky Pixel-Art Head, Broad Snout, Spoon Nose & Fluffy Ears
  // ---------------------------------------------------------------------------

  // Main skull skinBox (16x13x14 pixels = 0.24 x 0.195 x 0.21 m) with drawn pixel eyes, brows & cheek markings
  b.part(skinBox(SKIN_SHEET, layout.faces.skull, TEXEL), FLAT_CREAM, {
    bone: head,
    at: head.local([0, 0.055, 0.015]),
    dir: head.dir([0, 0, 1]),
    up: head.dir([0, 1, 0]),
    axis: "z",
    texture: SKIN_SHEET,
    group: "koala_head",
    name: "skullBox",
  });

  // Fluffy rounded jowl / cheek puffs on left and right sides of the head
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.06, 0.09, 0.12), creamFluffPaint, {
      bone: head,
      at: head.local([s * -0.115, 0.035, -0.025]),
      dir: head.dir([s * -0.25, 0.05, 1]),
      up: head.dir([0, 1, 0]),
      axis: "z",
      flat: true,
      group: "koala_head",
      name: `cheekPuff${side}`,
    });

    // Pixel-art brow ridge block above each eye for strong 3D silhouette
    b.part(new THREE.BoxGeometry(0.06, 0.022, 0.03), creamFluffPaint, {
      bone: head,
      at: head.local([s * -0.065, 0.118, 0.045]),
      dir: head.dir([0, 0, 1]),
      up: head.dir([0, 1, s * -0.12]),
      axis: "z",
      flat: true,
      group: "koala_head",
      name: `browRidge${side}`,
    });
  }

  // Broad muzzle / snout skinBox protruding from the front of the skull
  b.part(skinBox(SKIN_SHEET, layout.faces.snout, TEXEL), FLAT_CREAM, {
    bone: head,
    at: head.local([0, 0.085, -0.01]),
    dir: head.dir([0, 0, 1]),
    up: head.dir([0, 1, 0]),
    axis: "z",
    texture: SKIN_SHEET,
    group: "koala_head",
    name: "snoutBox",
  });

  // Iconic prominent koala black leathery nose (skinBox + slightly arched top bridge)
  b.part(skinBox(SKIN_SHEET, layout.faces.nose, TEXEL), FLAT_NOSE, {
    bone: head,
    at: head.local([0, 0.135, 0.0]),
    dir: head.dir([0, 0, 1]),
    up: head.dir([0, 1, 0]),
    axis: "z",
    texture: SKIN_SHEET,
    group: "koala_head",
    name: "noseBox",
  });

  // Arched leathery nasal bridge cap on top of nose
  b.part(new THREE.BoxGeometry(0.072, 0.045, 0.055), leatherNosePaint, {
    bone: head,
    at: head.local([0, 0.115, 0.038]),
    dir: head.dir([0, 0.25, 1]),
    up: head.dir([0, 1, -0.25]),
    axis: "z",
    flat: true,
    group: "koala_head",
    name: "noseBridge",
  });

  // Separate Hinged Lower Jaw (skinBox with pink lip & white chin beard)
  b.part(skinBox(SKIN_SHEET, layout.faces.jaw, TEXEL), FLAT_CREAM, {
    bone: jaw,
    at: jaw.local([0, 0.055, -0.005]),
    dir: jaw.dir([0, 0, 1]),
    up: jaw.dir([0, 1, 0]),
    axis: "z",
    texture: SKIN_SHEET,
    group: "koala_head",
    name: "jawBox",
  });

  // Cute eucalyptus leaf sprig held in the corner of the koala's mouth!
  b.rod(jaw.local([-0.03, 0.08, 0.01]), jaw.local([-0.09, 0.06, 0.04]), 0.005, FLAT_RIBBON, {
    bone: jaw,
    sides: 4,
    smooth: false,
    group: "koala_head",
    name: "mouthStem",
  });
  b.extrude(JUVENILE_LEAF_OUTLINE, {
    bone: jaw,
    at: jaw.local([-0.075, 0.065, 0.035]),
    x: [0.4, 0.2, 0.9],
    y: [-0.85, -0.35, 0.4],
    thickness: 0.009,
    color: leafPaint,
    group: "koala_head",
    name: "mouthLeaf",
  });

  // Large Round Fluffy Ears with Stepped Pixel Silhouettes & Long White Ear Fringe Tufts
  const earCardFrames: ReturnType<typeof frame>[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[s];

    // Outer grey-fur ear disc (stepped pixel outline)
    b.extrude(OUTER_EAR_OUTLINE, {
      bone: earJ,
      at: earJ.at,
      x: [s * 0.94, 0.18, -0.28],
      y: [-s * 0.18, 0.98, 0.05],
      thickness: 0.038,
      color: koalaCoatPaint,
      group: `ear_${side}`,
      name: `outerEar${side}`,
    });

    // Inner cream/pink ear recess shifted slightly forward
    b.extrude(INNER_EAR_OUTLINE, {
      bone: earJ,
      at: offset(earJ.at, [-s * 0.18, 0.05, 0.95], 0.015),
      x: [s * 0.94, 0.18, -0.28],
      y: [-s * 0.18, 0.98, 0.05],
      thickness: 0.022,
      color: creamFluffPaint,
      group: `ear_${side}`,
      name: `innerEar${side}`,
    });

    // Chunky 3D stepped white fur tufts fanning out from the lower & outer rim of each ear
    const tuftOffsets: Array<[number, number, number]> = [
      [s * 0.085, -0.035, 0.015],
      [s * 0.10, 0.0, 0.01],
      [s * 0.095, 0.04, 0.005],
      [s * 0.065, -0.06, 0.02],
    ];
    for (const [ti, toff] of tuftOffsets.entries()) {
      const basePt = offset(earJ.at, toff, 1);
      const outDir: [number, number, number] = [s * 0.85, -0.35 + ti * 0.22, 0.25];
      b.spike(basePt, outDir, 0.048, 0.022, {
        bone: earJ,
        sides: 4,
        smooth: false,
        color: creamFluffPaint,
        group: `ear_${side}`,
        name: `earTuftSpike_${side}_${ti}`,
      });
      earCardFrames.push(frame(basePt, outDir));
    }
  }

  // Pixel-art fur tuft cards on ears for unmistakable fluffy koala ear fringes
  b.cards(earCardFrames, CREAM_TUFT_TEX, {
    size: [0.065, 0.055],
    lean: 15,
    cross: true,
    vary: 0.15,
    rng: rng(123),
    group: "koala_head",
    name: "earFluffCards",
  });

  // ---------------------------------------------------------------------------
  // 5. Koala Limbs, Zygodactyl Paws, Leathery Pads & Curved Climbing Claws
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[s];
    const leg = legChains[s];

    // Muscular forelimb sweep (thick furry upper arm & forearm)
    b.sweep(arm, [0.062, 0.055, 0.046, 0.038], {
      sides: 6,
      smooth: false,
      color: koalaCoatPaint,
      group: `arm_${side}`,
      name: `armSweep${side}`,
    });

    // Forepaw palm & leathery dark pad gripping the trunk
    const handJ = arm.tip!;
    b.part(new THREE.BoxGeometry(0.056, 0.064, 0.045), koalaCoatPaint, {
      bone: handJ,
      at: handJ.at,
      dir: handJ.axis,
      flat: true,
      group: `arm_${side}`,
      name: `handPalm${side}`,
    });
    b.part(new THREE.BoxGeometry(0.038, 0.052, 0.032), leatherNosePaint, {
      bone: handJ,
      at: offset(handJ.at, [-s * 0.7, 0, -0.4], 0.015),
      flat: true,
      group: `arm_${side}`,
      name: `handPad${side}`,
    });

    // Zygodactyl forepaw fingers + long curved climbing claws biting into the eucalyptus bark
    const yOff = s > 0 ? 0.035 : -0.025;
    const foreDigits: Array<{ name: string; tip: [number, number, number]; clawDir: [number, number, number] }> = [
      { name: `thumbA${side}`, tip: [s * 0.015, 0.685 + yOff, 0.235], clawDir: [-s * 0.85, -0.25, -0.45] },
      { name: `thumbB${side}`, tip: [s * 0.01, 0.71 + yOff, 0.245], clawDir: [-s * 0.85, -0.1, -0.5] },
      { name: `index${side}`, tip: [s * 0.01, 0.74 + yOff, 0.245], clawDir: [-s * 0.85, 0.05, -0.5] },
      { name: `middle${side}`, tip: [s * 0.015, 0.76 + yOff, 0.238], clawDir: [-s * 0.85, 0.15, -0.48] },
      { name: `ring${side}`, tip: [s * 0.025, 0.775 + yOff, 0.225], clawDir: [-s * 0.85, 0.2, -0.4] },
    ];
    for (const fd of foreDigits) {
      b.capsule(handJ.at, fd.tip, [0.016, 0.013], {
        bone: fd.name,
        sides: 5,
        smooth: false,
        color: koalaCoatPaint,
        group: `arm_${side}`,
        name: `${fd.name}_tube`,
      });
      b.spike(fd.tip, fd.clawDir, 0.028, 0.008, {
        bone: fd.name,
        sides: 4,
        smooth: false,
        color: FLAT_CLAW,
        group: `arm_${side}`,
        name: `${fd.name}_claw`,
      });
    }

    // Hindlimb sweep (round furry haunch & calf)
    b.sweep(leg, [0.076, 0.064, 0.050, 0.042], {
      sides: 6,
      smooth: false,
      color: koalaCoatPaint,
      group: `leg_${side}`,
      name: `legSweep${side}`,
    });

    // Hindfoot & leathery sole pad
    const footJ = leg.tip!;
    b.part(new THREE.BoxGeometry(0.06, 0.056, 0.052), koalaCoatPaint, {
      bone: footJ,
      at: footJ.at,
      dir: footJ.axis,
      flat: true,
      group: `leg_${side}`,
      name: `footBase${side}`,
    });
    b.part(new THREE.BoxGeometry(0.042, 0.045, 0.038), leatherNosePaint, {
      bone: footJ,
      at: offset(footJ.at, [-s * 0.7, -0.2, -0.3], 0.016),
      flat: true,
      group: `leg_${side}`,
      name: `footPad${side}`,
    });

    // Hindpaw toes (hallux is broad & clawless in real koalas; outer 3 digits carry climbing claws)
    const legYOff = s > 0 ? 0.02 : -0.02;
    const hindDigits: Array<{
      name: string;
      tip: [number, number, number];
      r: [number, number];
      clawDir?: [number, number, number];
    }> = [
      { name: `hallux${side}`, tip: [s * 0.02, 0.325 + legYOff, 0.225], r: [0.019, 0.016] }, // clawless opposable big toe
      {
        name: `toeInner${side}`,
        tip: [s * 0.015, 0.355 + legYOff, 0.24],
        r: [0.016, 0.013],
        clawDir: [-s * 0.85, -0.1, -0.5],
      },
      {
        name: `toeMid${side}`,
        tip: [s * 0.015, 0.38 + legYOff, 0.24],
        r: [0.016, 0.013],
        clawDir: [-s * 0.85, 0.0, -0.5],
      },
      {
        name: `toeOuter${side}`,
        tip: [s * 0.025, 0.40 + legYOff, 0.228],
        r: [0.015, 0.012],
        clawDir: [-s * 0.85, 0.1, -0.45],
      },
    ];
    for (const hd of hindDigits) {
      b.capsule(footJ.at, hd.tip, hd.r, {
        bone: hd.name,
        sides: 5,
        smooth: false,
        color: koalaCoatPaint,
        group: `leg_${side}`,
        name: `${hd.name}_tube`,
      });
      if (hd.clawDir) {
        b.spike(hd.tip, hd.clawDir, 0.026, 0.008, {
          bone: hd.name,
          sides: 4,
          smooth: false,
          color: FLAT_CLAW,
          group: `leg_${side}`,
          name: `${hd.name}_claw`,
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Baby Joey Clinging to the Mother Koala's Back (Story & Silhouette Detail!)
  // ---------------------------------------------------------------------------
  // Plump little joey body nestled against the upper-mid back
  b.capsule([0, 0.56, -0.155], [0, 0.67, -0.14], [0.068, 0.058], {
    bone: joeyJoint,
    sides: 6,
    smooth: false,
    color: koalaCoatPaint,
    group: "joey",
    name: "joeyBody",
  });

  // Joey head skinBox peeking over mother's shoulder/back
  b.part(skinBox(SKIN_SHEET, layout.faces.joeyHead, TEXEL), FLAT_CREAM, {
    bone: joeyJoint,
    at: [0, 0.725, -0.125],
    rotation: [-10, 12, 0],
    texture: SKIN_SHEET,
    group: "joey",
    name: "joeyHeadBox",
  });

  // Joey miniature round ears & tiny clinging arms/legs hugging mother's shoulders
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.048, 0.052, 0.024), koalaCoatPaint, {
      bone: joeyJoint,
      at: [s * 0.072, 0.755, -0.12],
      rotation: [0, s * -15, s * 18],
      flat: true,
      group: "joey",
      name: `joeyEar${side}`,
    });
    b.part(new THREE.BoxGeometry(0.028, 0.032, 0.015), creamFluffPaint, {
      bone: joeyJoint,
      at: [s * 0.072, 0.755, -0.106],
      rotation: [0, s * -15, s * 18],
      flat: true,
      group: "joey",
      name: `joeyInnerEar${side}`,
    });

    // Joey little arms reaching around mother's upper back
    b.capsule([s * 0.055, 0.67, -0.13], [s * 0.095, 0.70, -0.05], [0.024, 0.02], {
      bone: joeyJoint,
      sides: 5,
      smooth: false,
      color: koalaCoatPaint,
      group: "joey",
      name: `joeyArm${side}`,
    });
    // Joey little hind legs tucked onto mother's lower back
    b.capsule([s * 0.055, 0.56, -0.145], [s * 0.095, 0.55, -0.075], [0.028, 0.022], {
      bone: joeyJoint,
      sides: 5,
      smooth: false,
      color: koalaCoatPaint,
      group: "joey",
      name: `joeyLeg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Surface Fur Tuft Cards on Body, Cheeks & Haunches
  // ---------------------------------------------------------------------------
  const bodySurface = b.surface(bodySweep);
  const bodyTuftHits = bodySurface.scatter(42, {
    rng: rng(303),
    minDist: 0.055,
    filter: (h) => h.n.y > -0.25 && h.at.z < 0.08,
  });
  b.cards(bodyTuftHits, [GREY_TUFT_TEX, GREY_TUFT_TEX, CREAM_TUFT_TEX], {
    size: [0.05, 0.042],
    lean: 45,
    vary: 0.2,
    spin: 20,
    rng: rng(404),
    group: "koala_body",
    name: "bodyFurCards",
  });

  // Extra fluffy white chest-ruff cards along the bib
  const chestRuffFrames = [
    frame([0.04, 0.68, 0.115], [0.25, 0.2, 0.95]),
    frame([-0.04, 0.68, 0.115], [-0.25, 0.2, 0.95]),
    frame([0.0, 0.63, 0.12], [0, 0.15, 0.98]),
    frame([0.05, 0.57, 0.115], [0.3, 0.1, 0.95]),
    frame([-0.05, 0.57, 0.115], [-0.3, 0.1, 0.95]),
  ];
  b.cards(chestRuffFrames, CREAM_TUFT_TEX, {
    bone: chestJoint,
    size: [0.055, 0.048],
    lean: 30,
    cross: true,
    vary: 0.12,
    rng: rng(505),
    group: "koala_body",
    name: "chestRuffCards",
  });

  // Unused colour constants referenced so typecheck is 100% clean
  void FLAT_DARK;
  void FLAT_LEAF;

  return b.root;
}
