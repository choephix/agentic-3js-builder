import * as THREE from "three";
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
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, lerp, offset, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import { bezier, catmull, polyline } from "../../../../src/path";

export const meta = {
  name: "Koala",
  description:
    "Pixel-art koala gripping a forked eucalyptus branch stand with zygodactyl climbing paws, fluffy fringed ears, gumnuts, blossoms, and ribbon bark.",
  style: "pixel art",
  commit: "88fc1f0",
};

// Master texel size in meters (1.5 cm squares across the ~1.02 m model)
const TEXEL = 0.015;
const FINE_TEXEL = 0.0075;

// Quantized 6-bit DAC pixel-art colour ramps
const ASH_FUR = ["#232730", "#363c48", "#4d5566", "#687285", "#8590a3", "#a5b0c2"].map((c) => snapColor(c, 64));
const WARM_FUR = ["#2e2623", "#453a35", "#5e5049", "#7a6960", "#96857b"].map((c) => snapColor(c, 64));
const CREAM_FUR = ["#7d7a74", "#9e9b93", "#bfbcb2", "#dedbd0", "#f5f2e8"].map((c) => snapColor(c, 64));
const NOSE_RAMP = ["#110f14", "#211d26", "#342e3b", "#4c4454"].map((c) => snapColor(c, 64));
const PINK_EAR = ["#5e353b", "#824c54", "#ab6b74", "#d18e97"].map((c) => snapColor(c, 64));
const PAW_RAMP = ["#17151c", "#292530", "#3d3845", "#544e5e"].map((c) => snapColor(c, 64));
const CLAW_RAMP = ["#141218", "#26232c", "#3b3642"].map((c) => snapColor(c, 64));

const EUC_BARK = ["#4a3b30", "#6b5646", "#8f7762", "#b39f88", "#cfc2ae", "#e3dac8"].map((c) => snapColor(c, 64));
const ROUGH_BARK = ["#211812", "#33261d", "#47362a", "#5e4838", "#755c49"].map((c) => snapColor(c, 64));
const MOSS_RAMP = ["#1d381e", "#2e5429", "#467536", "#689948", "#8cbd5c"].map((c) => snapColor(c, 64));
const LEAF_BLUE = ["#162e2a", "#22453f", "#316158", "#468074", "#639e90", "#89bfb0"].map((c) => snapColor(c, 64));
const YOUNG_LEAF = ["#593624", "#7d4b32", "#688238", "#8fad4c"].map((c) => snapColor(c, 64));
const GUMNUT_RAMP = ["#291b13", "#402b1f", "#593d2c", "#75523c"].map((c) => snapColor(c, 64));
const BLOSSOM_RAMP = ["#b39642", "#d4b85a", "#edda82", "#fcf6c4"].map((c) => snapColor(c, 64));
const EARTH_RAMP = ["#241b15", "#362920", "#4a392c", "#614c3b"].map((c) => snapColor(c, 64));

export default function build() {
  const b = createBuilder({ name: "koala", detail: 0.75, paintSize: 2048 });
  const rand = rng(4209);

  // ---------------------------------------------------------------------------
  // Quantized pixel paints (cellPaint with Bayer 4x4 ordered dithering)
  // ---------------------------------------------------------------------------

  // Koala body, head, and limb fur paint with cream chest bib & dappled rump
  const koalaCoatPaint = cellPaint(
    TEXEL,
    (c) => {
      const n1 = noise(c.at, 0.11, 11);
      const n2 = noise(c.at, 0.055, 23);
      const light = 0.52 + 0.3 * c.n.y + 0.1 * c.n.z + 0.22 * (n1 - 0.5);

      // Front throat, chest and belly cream bib
      const chestZone =
        c.at.y > 0.34 &&
        c.at.y < 0.72 &&
        c.at.z > -0.04 &&
        Math.abs(c.at.x) < 0.115 - 0.03 * Math.abs(c.at.y - 0.52);
      const chinZone = c.at.y > 0.66 && c.at.y < 0.75 && c.at.z > 0.01 && Math.abs(c.at.x) < 0.075;
      if (chestZone || chinZone) {
        const edgeDist = (0.115 - Math.abs(c.at.x)) / 0.035;
        if (edgeDist > c.threshold) {
          return c.pick(CREAM_FUR, light + 0.12 + 0.15 * (n2 - 0.5));
        }
      }

      // Characteristic warm brownish-grey dappled patches on the lower rump
      const rumpZone = c.at.y < 0.49 && c.at.z < -0.04;
      if (rumpZone && n1 + 0.25 * (0.49 - c.at.y) > 0.48) {
        if (n2 > 0.66 && c.random(5) > 0.45) {
          return c.pick(CREAM_FUR, light - 0.05);
        }
        return c.pick(WARM_FUR, light + 0.1 * (n2 - 0.5));
      }

      // Occasional pale silver-ash guard hair fleck
      if (c.random(19) < 0.06) {
        return ASH_FUR[ASH_FUR.length - 1];
      }
      return c.pick(ASH_FUR, light);
    },
    { dither: true },
  );

  // Inner ear soft rose-pink skin with cream fur border
  const innerEarPaint = cellPaint(
    FINE_TEXEL,
    (c) => {
      const n1 = noise(c.at, 0.04, 31);
      const shade = 0.48 + 0.25 * c.n.z + 0.2 * c.n.y + 0.2 * (n1 - 0.5);
      return c.pick(PINK_EAR, shade);
    },
    { dither: true },
  );

  // Leathery black-plum spoon nose with specular pixel highlight on upper bridge
  const nosePaint = cellPaint(
    FINE_TEXEL,
    (c) => {
      const shine = c.n.y * 0.45 + c.n.z * 0.35 + (c.at.y - 0.74) * 3.5;
      const nost =
        c.at.y < 0.742 &&
        c.at.z > 0.155 &&
        Math.abs(Math.abs(c.at.x) - 0.019) < 0.01 &&
        Math.abs(c.at.y - 0.728) < 0.012;
      if (nost) return NOSE_RAMP[0];
      return c.pick(NOSE_RAMP, 0.28 + 0.45 * shine + 0.12 * (noise(c.at, 0.03, 41) - 0.5));
    },
    { dither: true },
  );

  // Australian eucalyptus ribbon-gum mottled bark with rough basal stocking
  const eucBarkPaint = cellPaint(
    TEXEL,
    (c) => {
      const nBroad = noise(c.at, 0.16, 71);
      const nStreak = noise(new THREE.Vector3(c.at.x * 2.4, c.at.y * 0.45, c.at.z * 2.4), 0.08, 83);
      const light = 0.48 + 0.28 * c.n.y + 0.16 * c.n.z;

      // Rough dark basal bark collar near the ground
      if (c.at.y < 0.16 + 0.06 * (nBroad - 0.5)) {
        if (c.at.y < 0.09 && nBroad > 0.58 && c.n.y > 0.25) {
          return c.pick(MOSS_RAMP, light);
        }
        return c.pick(ROUGH_BARK, light + 0.25 * (nStreak - 0.5));
      }

      // Mottled ghost-gum / scribbly-gum smooth bark with vertical shed ribbons
      const band = (nStreak * 0.65 + nBroad * 0.35 - 0.5) * 0.7;
      return c.pick(EUC_BARK, light + band);
    },
    { dither: true },
  );

  // Dark rough bark & burl paint
  const roughBarkPaint = cellPaint(
    TEXEL,
    (c) => {
      const nv = noise(c.at, 0.06, 97);
      return c.pick(ROUGH_BARK, 0.42 + 0.32 * c.n.y + 0.35 * (nv - 0.5));
    },
    { dither: true },
  );

  // Glaucous blue-green eucalyptus leaf paint with bronze-red young tips
  const eucLeafPaint = cellPaint(
    FINE_TEXEL,
    (c) => {
      const nv = noise(c.at, 0.05, 109);
      const light = 0.5 + 0.34 * c.n.y + 0.22 * (nv - 0.5);
      if (c.random(13) < 0.08) {
        return c.pick(YOUNG_LEAF, light);
      }
      return c.pick(LEAF_BLUE, light);
    },
    { dither: true },
  );

  // Woody gumnut capsule paint
  const gumnutPaint = cellPaint(
    FINE_TEXEL,
    (c) => {
      const nv = noise(c.at, 0.03, 127);
      return c.pick(GUMNUT_RAMP, 0.44 + 0.35 * c.n.y + 0.25 * (nv - 0.5));
    },
    { dither: true },
  );

  // ---------------------------------------------------------------------------
  // Pixel textures (pixelArt & pixelTexture) for tiles, skinBoxes, and cards
  // ---------------------------------------------------------------------------

  // Tileable rough bark & moss plinth texture for ground base blocks
  const BASE_BARK_TILE = pixelTexture(24, 24, (g) => {
    const r = rng(301);
    g.fill((x, y) => {
      const moss = y < 5 && (x + y) % 3 !== 0;
      if (moss) return pick(MOSS_RAMP, 0.45 + 0.35 * r(), bayer(x, y));
      const groove = x % 4 === 0;
      const v = groove ? 0.18 : 0.42 + 0.35 * r();
      return pick(ROUGH_BARK, v, bayer(x, y));
    });
  });

  // Tileable mossy bushland stone texture for base rocks
  const STONE_TILE = pixelTexture(16, 16, (g) => {
    const r = rng(307);
    g.fill((x, y) => {
      if (y < 4 && r() > 0.35) return pick(MOSS_RAMP, 0.5 + 0.3 * r(), bayer(x, y));
      return pick(ASH_FUR, 0.22 + 0.35 * r(), bayer(x, y));
    });
  });

  // Skin-box layout for koala's head details: nose block, eyes, and brow tufts
  const headSkin = skinLayout(
    {
      nose: [6, 8, 5],
      eyeL: [3, 3, 2],
      eyeR: [3, 3, 2],
      tag: [6, 4, 2],
    },
    64,
  );

  const HEAD_SHEET = pixelTexture(...headSkin.size, (g) => {
    // Fill nose faces with leathery dark charcoal & nostrils on front (pz)
    for (const rect of Object.values(headSkin.faces.nose)) {
      g.fill((x, y, _w, h) => pick(NOSE_RAMP, 0.72 - (y / h) * 0.55, bayer(x, y)), rect);
    }
    const npz = headSkin.faces.nose.pz;
    g.stamp(
      npz[0],
      npz[1],
      [
        "dbbbbd",
        "bhhhhb",
        "bhhhhb",
        "bbbbbb",
        "bddddb",
        "bknnkb",
        "bknnkb",
        "dkkkkd",
      ],
      {
        k: NOSE_RAMP[0],
        d: NOSE_RAMP[1],
        b: NOSE_RAMP[2],
        h: NOSE_RAMP[3],
        n: "#08070a",
      },
    );

    // Fill left & right eyes with warm dark iris and crisp pixel catchlights
    for (const side of ["eyeL", "eyeR"] as const) {
      for (const rect of Object.values(headSkin.faces[side])) {
        g.fill(() => NOSE_RAMP[0], rect);
      }
      const epz = headSkin.faces[side].pz;
      g.stamp(
        epz[0],
        epz[1],
        [
          "kwb",
          "kdk",
          "kkk",
        ],
        {
          k: "#0e0c12",
          d: "#3b281e",
          b: "#5c3f2e",
          w: "#f5f2e8",
        },
      );
    }

    // Sanctuary wooden identification plaque on the stand base
    for (const rect of Object.values(headSkin.faces.tag)) {
      g.fill((x, y) => pick(EUC_BARK, 0.35 + 0.2 * ((x + y) % 2), bayer(x, y)), rect);
    }
    const tpz = headSkin.faces.tag.pz;
    g.stamp(
      tpz[0],
      tpz[1],
      [
        "dddddd",
        "dlllld",
        "dlkkld",
        "dddddd",
      ],
      {
        d: ROUGH_BARK[1],
        l: EUC_BARK[4],
        k: ROUGH_BARK[0],
      },
    );
  });

  // Fluffy cream ear-fringe pixel card texture (12x12)
  const EAR_FRINGE_TEX = pixelArt(
    [
      "..ll....ll..",
      ".lwwl..lwwl.",
      ".lwwl.llwwl.",
      "llwwwllwwwll",
      "lwwwwwwwwwll",
      "lcccwwwwcccl",
      "lccccccccccd",
      "dccccccccccd",
      "ddccccccccdd",
      ".ddccccccdd.",
      ".dddddddddd.",
      "..dddddddd..",
    ],
    {
      w: CREAM_FUR[4],
      l: CREAM_FUR[3],
      c: CREAM_FUR[2],
      d: ASH_FUR[3],
    },
  );

  // Cheek & chest cream fur tuft pixel card texture (10x10)
  const CHEEK_TUFT_TEX = pixelArt(
    [
      "...ll.ll..",
      "..lwwlwwl.",
      ".lwwwwwwwl",
      "llwwwwwwwl",
      "lcccwwwccl",
      "lccccccccd",
      "ddccccccdd",
      ".ddccccdd.",
      ".dddddddd.",
      "..dddddd..",
    ],
    {
      w: CREAM_FUR[4],
      l: CREAM_FUR[3],
      c: CREAM_FUR[2],
      d: CREAM_FUR[1],
    },
  );

  // Ash-grey dorsal & shoulder fur tuft pixel card texture (8x8)
  const GREY_TUFT_TEX = pixelArt(
    [
      "..l..l..",
      ".lhl.lhl",
      ".lhhllhl",
      "lhhhhhhl",
      "lmmmmmml",
      "dmmmmmmk",
      "ddmmmmkk",
      ".ddkkkk.",
    ],
    {
      h: ASH_FUR[5],
      l: ASH_FUR[4],
      m: ASH_FUR[3],
      d: ASH_FUR[2],
      k: ASH_FUR[1],
    },
  );

  // Eucalyptus leaf spray pixel texture (16x16) for lush canopy cards
  const LEAF_SPRAY_TEX = pixelTexture(16, 16, (g) => {
    g.stamp(
      0,
      0,
      [
        "......bb........",
        ".....bllb...yy..",
        "....bllllb.yllb.",
        "...bllllllbllllb",
        "...bllmllllllllb",
        "..bllmmllbllllb.",
        "..bllmmllbllmb..",
        "...blmmllblmmb..",
        "...bdmmllbdmb...",
        "....bdmmlbdsb...",
        "....bddmmbds....",
        ".....bddmbs.....",
        "......bdds......",
        ".......ss.......",
        ".......ss.......",
        ".......ss.......",
      ],
      {
        b: LEAF_BLUE[1],
        d: LEAF_BLUE[2],
        m: LEAF_BLUE[3],
        l: LEAF_BLUE[4],
        y: LEAF_BLUE[5],
        s: ROUGH_BARK[3],
      },
    );
  });

  // Young bronze-tipped eucalyptus leaf spray pixel texture (14x14)
  const YOUNG_SPRAY_TEX = pixelTexture(14, 14, (g) => {
    g.stamp(
      0,
      0,
      [
        ".....rr.......",
        "....ryyr..rr..",
        "...ryggyrryyr.",
        "..ryggggryggyr",
        "..bgggggbggggb",
        "..bggmggbggmgb",
        "...bgmmggbmmb.",
        "...bdmmggbdmb.",
        "....bdmmgbdub.",
        ".....bddmbdu..",
        "......bddbu...",
        ".......suu....",
        ".......ss.....",
        ".......ss.....",
      ],
      {
        r: YOUNG_LEAF[0],
        y: YOUNG_LEAF[1],
        g: YOUNG_LEAF[3],
        m: LEAF_BLUE[4],
        d: LEAF_BLUE[2],
        b: LEAF_BLUE[1],
        u: ROUGH_BARK[3],
        s: ROUGH_BARK[2],
      },
    );
  });

  // Creamy eucalyptus stamen blossom pixel texture (10x10)
  const BLOSSOM_TEX = pixelArt(
    [
      "..w..w..w.",
      ".wyw.wywy.",
      "wyyywyyyyw",
      ".yyyyyyyy.",
      "wyyggggyyw",
      "wyygccgyyw",
      ".yyyyyyyy.",
      "wyyyyyyyyw",
      ".wyw..wyw.",
      "..w....w..",
    ],
    {
      w: BLOSSOM_RAMP[3],
      y: BLOSSOM_RAMP[2],
      g: BLOSSOM_RAMP[1],
      c: GUMNUT_RAMP[2],
    },
  );

  // ---------------------------------------------------------------------------
  // 1. SKELETON: Root at hips, spine, neck, head, jaw, ears, tail, arms & legs
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.36, -0.055],
    dir: [0, 1, 0.08],
    group: "torso",
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.055],
      [0, 0.45, -0.06],
      [0, 0.55, -0.045],
      [0, 0.63, -0.02],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      group: "torso",
      role: "spine",
    },
  );
  const chest = spine.joints[2];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.67, -0.01],
    dir: [0, 0.92, 0.38],
    group: "head",
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.725, 0.015],
    dir: [0, 0.12, 1],
    up: [0, 1, 0],
    group: "head",
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.688, 0.045],
    dir: [0, -0.18, 1],
    up: [0, 1, 0],
    group: "head",
    role: "jaw",
  });

  // Vestigial stub tail chain on the rump
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.34, -0.145],
      [0, 0.32, -0.175],
      [0, 0.305, -0.195],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2"],
      group: "tail",
      role: "tail",
    },
  );

  // Store bilateral joints by side
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  const armChains: Record<number, ReturnType<typeof b.chain>> = {};
  const legChains: Record<number, ReturnType<typeof b.chain>> = {};
  const handDigits: Record<number, ReturnType<typeof b.chain>[]> = { 1: [], [-1]: [] };
  const footDigits: Record<number, ReturnType<typeof b.chain>[]> = { 1: [], [-1]: [] };

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Large mobile ear joints
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.092, 0.795, -0.005],
      dir: [s * 0.92, 0.32, -0.15],
      up: [0, 1, 0],
      group: `ear${side}`,
      role: "hinge",
    });

    // Forelimbs (arms) reaching forward and around the left/right eucalyptus fork
    const armPath = polyline([
      [s * 0.105, 0.605, -0.015],
      [s * 0.188, 0.565, 0.055],
      [s * 0.132, 0.585, 0.138],
    ]);
    const arm = b.chain(`arm${side}`, armPath, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      group: `arm${side}`,
      role: "arm",
    });
    armChains[s] = arm;
    const wrist = arm.joints[2];

    // Koala zygodactyl hand: 2 opposable inner thumbs + 3 outer fingers wrapping the bough
    const handSpecs: Array<{ name: string; p0: [number, number, number]; p1: [number, number, number]; p2: [number, number, number] }> = [
      {
        name: `thumbIn${side}`,
        p0: [s * 0.105, 0.572, 0.148],
        p1: [s * 0.078, 0.558, 0.158],
        p2: [s * 0.062, 0.548, 0.142],
      },
      {
        name: `thumbOut${side}`,
        p0: [s * 0.108, 0.596, 0.152],
        p1: [s * 0.082, 0.592, 0.168],
        p2: [s * 0.066, 0.584, 0.152],
      },
      {
        name: `index${side}`,
        p0: [s * 0.142, 0.612, 0.152],
        p1: [s * 0.155, 0.622, 0.172],
        p2: [s * 0.135, 0.618, 0.186],
      },
      {
        name: `middle${side}`,
        p0: [s * 0.152, 0.592, 0.15],
        p1: [s * 0.168, 0.595, 0.172],
        p2: [s * 0.148, 0.59, 0.186],
      },
      {
        name: `ring${side}`,
        p0: [s * 0.148, 0.57, 0.144],
        p1: [s * 0.162, 0.568, 0.165],
        p2: [s * 0.142, 0.562, 0.178],
      },
    ];
    for (const spec of handSpecs) {
      const dc = b.chain(spec.name, polyline([spec.p0, spec.p1, spec.p2]), {
        parent: wrist,
        names: [`${spec.name}1`, `${spec.name}2`],
        group: `hand${side}`,
        role: "digit",
      });
      handDigits[s].push(dc);
    }

    // Hindlimbs (legs) flexed and planted on the lower supporting eucalyptus forks
    const legPath = polyline([
      [s * 0.098, 0.375, -0.05],
      [s * 0.182, 0.395, 0.035],
      [s * 0.142, 0.305, 0.065],
    ]);
    const leg = b.chain(`leg${side}`, legPath, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      group: `leg${side}`,
      role: "leg",
      contact: [s * 0.135, 0.285, 0.085],
    });
    legChains[s] = leg;
    const ankle = leg.joints[2];

    // Koala syndactyl/opposable foot: 1 opposable inner hallux + 3 outer toes
    const footSpecs: Array<{ name: string; p0: [number, number, number]; p1: [number, number, number]; p2: [number, number, number] }> = [
      {
        name: `hallux${side}`,
        p0: [s * 0.108, 0.302, 0.072],
        p1: [s * 0.082, 0.292, 0.085],
        p2: [s * 0.068, 0.278, 0.078],
      },
      {
        name: `toeIn${side}`,
        p0: [s * 0.132, 0.302, 0.088],
        p1: [s * 0.128, 0.294, 0.115],
        p2: [s * 0.118, 0.276, 0.122],
      },
      {
        name: `toeMid${side}`,
        p0: [s * 0.15, 0.3, 0.084],
        p1: [s * 0.152, 0.292, 0.112],
        p2: [s * 0.144, 0.274, 0.12],
      },
      {
        name: `toeOut${side}`,
        p0: [s * 0.166, 0.296, 0.074],
        p1: [s * 0.172, 0.288, 0.098],
        p2: [s * 0.165, 0.27, 0.106],
      },
    ];
    for (const spec of footSpecs) {
      const fc = b.chain(spec.name, polyline([spec.p0, spec.p1, spec.p2]), {
        parent: ankle,
        names: [`${spec.name}1`, `${spec.name}2`],
        group: `foot${side}`,
        role: "digit",
      });
      footDigits[s].push(fc);
    }
  }

  // Slight natural rest pose on jaw so mouth seam is visible and ready to hinge
  b.pose(jaw, { axis: [1, 0, 0], deg: 4 });

  // ---------------------------------------------------------------------------
  // 2. EUCALYPTUS BRANCH STAND (Grounded at y = 0, Y-fork cradle around koala)
  // ---------------------------------------------------------------------------

  // Stepped voxel-style bushland earth & bark plinth resting flat on y = 0
  b.part(tileBox([0.48, 0.045, 0.44], BASE_BARK_TILE, TEXEL, { rand, step: 2 }), ROUGH_BARK[1], {
    texture: BASE_BARK_TILE,
    bone: hips,
    at: [0, 0.0225, 0.01],
    group: "standBase",
    name: "plinthLower",
  });
  b.part(tileBox([0.39, 0.045, 0.36], BASE_BARK_TILE, TEXEL, { rand, step: 2 }), ROUGH_BARK[2], {
    texture: BASE_BARK_TILE,
    bone: hips,
    at: [0, 0.06, 0.02],
    group: "standBase",
    name: "plinthUpper",
  });

  // Stepped moss & stone border blocks around the base (all resting at or above y = 0)
  const baseBlocks: Array<{ size: [number, number, number]; at: [number, number, number]; moss?: boolean }> = [
    { size: [0.12, 0.045, 0.12], at: [0.21, 0.0225, 0.16], moss: true },
    { size: [0.1, 0.06, 0.11], at: [-0.2, 0.03, 0.15] },
    { size: [0.13, 0.045, 0.11], at: [0.2, 0.0225, -0.15] },
    { size: [0.11, 0.05, 0.12], at: [-0.21, 0.025, -0.14], moss: true },
    { size: [0.14, 0.035, 0.09], at: [0.02, 0.0175, 0.22], moss: true },
    { size: [0.12, 0.04, 0.09], at: [-0.03, 0.02, -0.2], moss: true },
    { size: [0.09, 0.035, 0.09], at: [0.14, 0.092, 0.11], moss: true },
    { size: [0.09, 0.035, 0.08], at: [-0.13, 0.092, 0.1], moss: true },
  ];
  baseBlocks.forEach((blk, idx) => {
    const tex = blk.moss ? BASE_BARK_TILE : STONE_TILE;
    b.part(tileBox(blk.size, tex, TEXEL, { rand, step: 2 }), EARTH_RAMP[2], {
      texture: tex,
      bone: hips,
      at: blk.at,
      group: "standBase",
      name: `baseBlock${idx + 1}`,
    });
  });

  // Wooden sanctuary identification plaque on the front of the plinth
  b.part(skinBox(HEAD_SHEET, headSkin.faces.tag, TEXEL), "#ffffff", {
    texture: HEAD_SHEET,
    bone: hips,
    at: [0, 0.052, 0.21],
    rotation: [-10, 0, 0],
    group: "standBase",
    name: "standPlaque",
  });

  // Gnarled buttress roots radiating from the lower trunk into the plinth
  const rootPaths: Array<[number, number, number][]> = [
    [
      [0.04, 0.16, 0.05],
      [0.14, 0.08, 0.13],
      [0.22, 0.03, 0.18],
    ],
    [
      [-0.04, 0.16, 0.05],
      [-0.14, 0.08, 0.12],
      [-0.21, 0.03, 0.17],
    ],
    [
      [0.05, 0.15, 0.01],
      [0.16, 0.075, -0.08],
      [0.22, 0.03, -0.15],
    ],
    [
      [-0.05, 0.15, 0.01],
      [-0.15, 0.075, -0.08],
      [-0.21, 0.03, -0.14],
    ],
    [
      [0, 0.14, -0.02],
      [0.01, 0.07, -0.13],
      [0.02, 0.03, -0.2],
    ],
  ];
  rootPaths.forEach((pts, i) => {
    b.sweep(catmull(pts), [0.046, 0.032, 0.02], {
      bone: hips,
      sides: 6,
      smooth: false,
      caps: "flat",
      color: roughBarkPaint,
      group: "standBase",
      name: `buttressRoot${i + 1}`,
    });
  });

  // Main lower eucalyptus trunk rising from the plinth to the Y-fork junction
  const mainTrunkPath = catmull([
    [0, 0.04, 0.025],
    [0.01, 0.15, 0.045],
    [0, 0.25, 0.07],
    [0, 0.34, 0.095],
  ]);
  b.sweep(mainTrunkPath, [0.095, 0.078, 0.068, 0.064], {
    bone: hips,
    sides: 7,
    smooth: false,
    caps: "flat",
    color: eucBarkPaint,
    group: "standTrunk",
    name: "trunkLower",
  });

  // Rear sitting saddle branch fork cradling the koala's rump and tail pad
  const rearSeatPath = catmull([
    [0, 0.23, 0.065],
    [0, 0.27, -0.02],
    [0, 0.305, -0.11],
    [0, 0.34, -0.185],
  ]);
  b.sweep(rearSeatPath, [0.056, 0.052, 0.046, 0.034], {
    bone: hips,
    sides: 6,
    smooth: false,
    caps: "flat",
    color: eucBarkPaint,
    group: "standTrunk",
    name: "branchSeatCenter",
  });

  // Left and right lower perch forks supporting the koala's feet & ankles
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const perchPath = catmull([
      [s * 0.02, 0.255, 0.07],
      [s * 0.1, 0.27, 0.085],
      [s * 0.165, 0.268, 0.08],
      [s * 0.235, 0.285, 0.055],
    ]);
    b.sweep(perchPath, [0.046, 0.04, 0.034, 0.024], {
      bone: hips,
      sides: 6,
      smooth: false,
      caps: "flat",
      color: eucBarkPaint,
      group: "standTrunk",
      name: `branchPerch${side}`,
    });

    // Woody burl collar at each lower perch junction
    b.part(new THREE.BoxGeometry(0.06, 0.048, 0.06), roughBarkPaint, {
      bone: hips,
      at: [s * 0.08, 0.265, 0.08],
      rotation: [8, s * 18, s * -12],
      group: "standTrunk",
      name: `perchBurl${side}`,
    });
  }

  // Left & Right ascending Y-fork boughs (framing the koala so face & chest stay open in front view,
  // while passing right through the grip of the koala's hands at [±0.12, 0.59, 0.16])
  const upperBranchPaths: Record<number, ReturnType<typeof catmull>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const boughPath = catmull([
      [s * 0.015, 0.31, 0.09],
      [s * 0.085, 0.44, 0.135],
      [s * 0.118, 0.585, 0.162],
      [s * 0.165, 0.74, 0.115],
      [s * 0.235, 0.89, 0.04],
      [s * 0.295, 0.98, -0.02],
    ]);
    upperBranchPaths[s] = boughPath;
    b.sweep(boughPath, [0.054, 0.046, 0.042, 0.036, 0.028, 0.018], {
      bone: hips,
      sides: 6,
      smooth: false,
      caps: "flat",
      color: eucBarkPaint,
      group: "standTrunk",
      name: `boughMain${side}`,
    });

    // Secondary rear/side canopy branch arching behind the koala's ears
    const canopyBack = catmull([
      [s * 0.155, 0.71, 0.12],
      [s * 0.22, 0.79, 0.01],
      [s * 0.25, 0.86, -0.11],
      [s * 0.19, 0.94, -0.18],
    ]);
    b.sweep(canopyBack, [0.03, 0.025, 0.02, 0.014], {
      bone: hips,
      sides: 5,
      smooth: false,
      caps: "flat",
      color: eucBarkPaint,
      group: "standTrunk",
      name: `boughBack${side}`,
    });

    // Outward lateral twig near wrist height (giving the koala a natural fork under its grip)
    const wristFork = catmull([
      [s * 0.115, 0.54, 0.155],
      [s * 0.195, 0.57, 0.165],
      [s * 0.265, 0.62, 0.14],
    ]);
    b.sweep(wristFork, [0.028, 0.022, 0.015], {
      bone: hips,
      sides: 5,
      smooth: false,
      caps: "flat",
      color: eucBarkPaint,
      group: "standTrunk",
      name: `boughWristFork${side}`,
    });
  }

  // Central stub knot at the Y-fork crotch (touches koala's lower belly so torso and stand are solidly joined)
  b.sweep(
    catmull([
      [0, 0.32, 0.09],
      [0, 0.39, 0.04],
      [0, 0.44, -0.01],
    ]),
    [0.052, 0.045, 0.038],
    {
      bone: hips,
      sides: 6,
      smooth: false,
      caps: "flat",
      color: roughBarkPaint,
      group: "standTrunk",
      name: "forkHeartKnot",
    },
  );

  // Peeling eucalyptus ribbon-bark strips hanging along the trunk & boughs (stepped pixel extrudes)
  const BARK_RIBBON = stepped(
    [
      [-1, 1],
      [-2, 1],
      [-2, 2],
      [-1, 2],
      [-1, 2],
      [0, 2],
      [0, 1],
    ],
    FINE_TEXEL,
    { rows: true },
  );
  const barkRibbons: Array<{ at: [number, number, number]; x: [number, number, number]; y: [number, number, number] }> = [
    { at: [0.065, 0.17, 0.075], x: [1, 0, 0.3], y: [0.1, -1, 0.15] },
    { at: [-0.065, 0.21, 0.07], x: [-1, 0, 0.3], y: [-0.1, -1, 0.15] },
    { at: [0.11, 0.46, 0.155], x: [1, 0, -0.2], y: [0.2, -1, 0.1] },
    { at: [-0.105, 0.48, 0.15], x: [-1, 0, -0.2], y: [-0.2, -1, 0.1] },
    { at: [0.18, 0.75, 0.11], x: [1, 0, 0.2], y: [0.15, -1, 0] },
    { at: [-0.175, 0.73, 0.11], x: [-1, 0, 0.2], y: [-0.15, -1, 0] },
  ];
  barkRibbons.forEach((rb, i) => {
    b.extrude(BARK_RIBBON, {
      at: rb.at,
      x: rb.x,
      y: rb.y,
      thickness: 0.012,
      color: i % 2 === 0 ? ROUGH_BARK[2] : EUC_BARK[1],
      bone: hips,
      group: "standBark",
      name: `barkRibbon${i + 1}`,
    });
  });

  // ---------------------------------------------------------------------------
  // 3. KOALA BODY, RUMP, CHEST BIB & VESTIGIAL TAIL
  // ---------------------------------------------------------------------------

  // Plump pear-shaped koala torso lofted along the spine chain
  const torsoLoft = b.loft(
    [
      { at: [0, 0.31, -0.075], w: 0.25, h: 0.22 },
      { at: [0, 0.39, -0.065], w: 0.28, h: 0.25 },
      { at: [0, 0.49, -0.055], w: 0.26, h: 0.23 },
      { at: [0, 0.58, -0.035], w: 0.23, h: 0.21 },
      { at: [0, 0.65, -0.015], w: 0.19, h: 0.18 },
      { at: [0, 0.705, 0.005], w: 0.15, h: 0.15 },
    ],
    {
      bone: [hips, spine, neck],
      sides: 8,
      smooth: false,
      caps: "round",
      color: koalaCoatPaint,
      group: "torso",
      name: "torsoBody",
    },
  );

  // Broad fluffy chest bib plate in stepped pixel art on the front of the chest
  const CHEST_BIB_OUTLINE = stepped(
    [
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-6, 6],
      [-5, 5],
      [-5, 5],
      [-4, 4],
      [-3, 3],
    ],
    TEXEL,
    { rows: true, start: -4 },
  );
  b.extrude(CHEST_BIB_OUTLINE, {
    at: [0, 0.54, 0.062],
    x: [1, 0, 0],
    y: [0, 1, 0.12],
    thickness: 0.028,
    color: koalaCoatPaint,
    bone: chest,
    group: "torso",
    name: "chestBibPlate",
  });

  // Thick cartilaginous sitting pad / rump cushions on the lower back
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.11, 0.095, 0.095), koalaCoatPaint, {
      bone: hips,
      at: [s * 0.065, 0.345, -0.115],
      rotation: [12, s * 10, s * -6],
      group: "torso",
      name: `rumpCushion${side}`,
    });
  }

  // Vestigial stub tail sweep over the tail chain
  b.sweep(tail, [0.038, 0.032, 0.022], {
    sides: 6,
    smooth: false,
    caps: "round",
    color: koalaCoatPaint,
    group: "tail",
    name: "tailStub",
  });

  // ---------------------------------------------------------------------------
  // 4. KOALA HEAD, JAW, SPOON NOSE, EYES & HUGE FRINGED EARS
  // ---------------------------------------------------------------------------

  // Broad, slightly blocky pixel-art cranium & cheeks
  const craniumLoft = b.loft(
    [
      { at: head.local([0, -0.03, -0.06]), w: 0.175, h: 0.155 },
      { at: head.local([0, 0.01, -0.02]), w: 0.215, h: 0.185 },
      { at: head.local([0, 0.045, 0.03]), w: 0.2, h: 0.175 },
      { at: head.local([0, 0.08, 0.015]), w: 0.15, h: 0.135 },
    ],
    {
      bone: head,
      sides: 8,
      smooth: false,
      caps: "round",
      color: koalaCoatPaint,
      group: "head",
      name: "cranium",
    },
  );

  // Upper muzzle / snout bridge supporting the iconic spoon nose
  b.frustumBox(
    head.local([0, 0.005, 0.02]),
    head.local([0, 0.078, 0.012]),
    [0.145, 0.105],
    [0.105, 0.085],
    {
      bone: head,
      color: koalaCoatPaint,
      group: "head",
      name: "upperMuzzle",
    },
  );

  // Fluffy cheek jowl blocks on left and right of the head
  const CHEEK_RUFF = stepped(
    [
      [-2, 2],
      [-3, 3],
      [-3, 4],
      [-2, 4],
      [-1, 3],
    ],
    TEXEL,
    { rows: true, start: -2 },
  );
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(CHEEK_RUFF, {
      at: head.local([s * 0.088, 0.005, -0.01]),
      x: [s, 0, -0.25],
      y: [0, 1, 0],
      thickness: 0.032,
      color: koalaCoatPaint,
      bone: head,
      group: "head",
      name: `cheekRuff${side}`,
    });
  }

  // Iconic dark leathery spoon-shaped koala nose (layered skinBox + sculpted upper bridge)
  b.part(skinBox(HEAD_SHEET, headSkin.faces.nose, [0.066, 0.088, 0.048]), "#ffffff", {
    texture: HEAD_SHEET,
    bone: head,
    at: head.local([0, 0.09, 0.012]),
    rotation: [8, 0, 0],
    group: "head",
    name: "spoonNoseMain",
  });
  b.part(new THREE.BoxGeometry(0.054, 0.042, 0.036), nosePaint, {
    bone: head,
    at: head.local([0, 0.072, 0.042]),
    rotation: [-18, 0, 0],
    group: "head",
    name: "spoonNoseBridge",
  });
  // Flared nostril wing blocks on each side of the lower nose
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.BoxGeometry(0.022, 0.028, 0.026), nosePaint, {
      bone: head,
      at: head.local([s * 0.028, 0.095, -0.006]),
      rotation: [5, s * -12, s * 8],
      group: "head",
      name: `nostrilWing${side}`,
    });
  }

  // Left and right pixel-art eyes & expressive brow ridges
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const eyeFaces = s > 0 ? headSkin.faces.eyeL : headSkin.faces.eyeR;
    b.part(skinBox(HEAD_SHEET, eyeFaces, [0.026, 0.026, 0.02]), "#ffffff", {
      texture: HEAD_SHEET,
      bone: head,
      at: head.local([s * 0.056, 0.068, 0.028]),
      rotation: [0, s * -22, 0],
      group: "head",
      name: `eye${side}`,
    });

    // Pale fur lower eyelid cushion
    b.part(new THREE.BoxGeometry(0.03, 0.014, 0.02), CREAM_FUR[3], {
      bone: head,
      at: head.local([s * 0.056, 0.065, 0.012]),
      rotation: [0, s * -22, s * 6],
      group: "head",
      name: `eyelidLower${side}`,
    });

    // Heavy sleepy koala brow ridge above each eye
    b.part(new THREE.BoxGeometry(0.038, 0.016, 0.026), ASH_FUR[4], {
      bone: head,
      at: head.local([s * 0.054, 0.072, 0.046]),
      rotation: [6, s * -20, s * -14],
      group: "head",
      name: `browRidge${side}`,
    });
  }

  // Articulated lower jaw with dark lip, pink tongue, and fluffy white chin beard
  b.frustumBox(
    jaw.local([0, 0, 0]),
    jaw.local([0, 0.068, 0.004]),
    [0.095, 0.042],
    [0.068, 0.03],
    {
      bone: jaw,
      color: koalaCoatPaint,
      group: "head",
      name: "lowerJaw",
    },
  );
  // Dark lower lip plate & pink inner mouth floor
  b.part(new THREE.BoxGeometry(0.056, 0.014, 0.052), PAW_RAMP[0], {
    bone: jaw,
    at: jaw.local([0, 0.036, 0.014]),
    group: "head",
    name: "lowerLip",
  });
  b.part(new THREE.BoxGeometry(0.04, 0.012, 0.04), PINK_EAR[2], {
    bone: jaw,
    at: jaw.local([0, 0.038, 0.019]),
    group: "head",
    name: "tongue",
  });
  // Fluffy stepped white chin tuft under the jaw
  const CHIN_BEARD = stepped(
    [
      [-2, 2],
      [-3, 3],
      [-3, 3],
      [-2, 2],
    ],
    FINE_TEXEL,
    { rows: true, start: -2 },
  );
  b.extrude(CHIN_BEARD, {
    at: jaw.local([0, 0.048, -0.016]),
    x: [1, 0, 0],
    y: [0, 0.3, -1],
    thickness: 0.022,
    color: CREAM_FUR[4],
    bone: jaw,
    group: "head",
    name: "chinBeard",
  });

  // Huge round fluffy koala ears on earL / earR joints
  const EAR_OUTER_OUTLINE = stepped(
    [
      [-2, 4],
      [-3, 6],
      [-4, 7],
      [-4, 8],
      [-4, 8],
      [-3, 8],
      [-2, 7],
      [-1, 5],
    ],
    TEXEL,
    { rows: true, start: -4 },
  );
  const EAR_INNER_OUTLINE = stepped(
    [
      [-1, 3],
      [-2, 5],
      [-2, 6],
      [-2, 6],
      [-1, 6],
      [0, 4],
    ],
    TEXEL,
    { rows: true, start: -3 },
  );
  const EAR_PLUME_OUTLINE = stepped(
    [
      [0, 4],
      [-1, 6],
      [1, 7],
      [2, 7],
      [3, 6],
    ],
    TEXEL,
    { rows: true, start: -3 },
  );

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[s];

    // Main outer rounded ear shell
    b.extrude(EAR_OUTER_OUTLINE, {
      at: earJ.at,
      x: [s * 0.94, 0.15, -0.28],
      y: [-s * 0.15, 0.98, 0.08],
      thickness: 0.036,
      color: koalaCoatPaint,
      bone: earJ,
      group: `ear${side}`,
      name: `earOuter${side}`,
    });

    // Concave rose-pink inner ear pocket shifted slightly forward
    b.extrude(EAR_INNER_OUTLINE, {
      at: offset(earJ.at, [s * 0.12, 0.05, 1], 0.015),
      x: [s * 0.94, 0.15, -0.28],
      y: [-s * 0.15, 0.98, 0.08],
      thickness: 0.018,
      color: innerEarPaint,
      bone: earJ,
      group: `ear${side}`,
      name: `earInner${side}`,
    });

    // Stepped cream fur plume spilling from the lower/outer ear margin
    b.extrude(EAR_PLUME_OUTLINE, {
      at: offset(earJ.at, [s * 0.85, -0.35, 0.25], 0.025),
      x: [s * 0.92, -0.2, -0.32],
      y: [s * 0.2, 0.96, 0.12],
      thickness: 0.024,
      color: CREAM_FUR[4],
      bone: earJ,
      group: `ear${side}`,
      name: `earPlume${side}`,
    });

    // Radiant ring of pixel-art white/cream ear fringe cards around the outer ear rim
    const earRimLine = frame(
      offset(earJ.at, [s * 0.94, 0.18, -0.22], 0.048),
      [s * 0.25, 0.08, 0.96],
    );
    const fringeRing = b.ring(earRimLine, {
      count: 10,
      radius: 0.052,
      fromDeg: s > 0 ? -150 : -30,
      toDeg: s > 0 ? 30 : 150,
      tilt: 18,
      parent: earJ,
      group: `ear${side}`,
    });
    b.cards(fringeRing.items, EAR_FRINGE_TEX, {
      size: [0.058, 0.068],
      lean: 20,
      flow: [0, 0, 1],
      vary: 0.15,
      rng: rng(s > 0 ? 501 : 502),
      bone: earJ,
      group: `ear${side}`,
      name: `earFringeCards${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 5. FORELIMBS, HINDLIMBS, ZYGODACTYL PAWS & CURVED PIXEL CLAWS
  // ---------------------------------------------------------------------------

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[s];
    const leg = legChains[s];
    const wrist = arm.joints[2];
    const ankle = leg.joints[2];

    // Muscular climbing arm sweep
    b.sweep(arm, [0.064, 0.056, 0.046], {
      sides: 7,
      smooth: false,
      caps: "round",
      color: koalaCoatPaint,
      group: `arm${side}`,
      name: `armTube${side}`,
    });

    // Fluffy elbow fur fringe plate on the back of each arm
    const ELBOW_TUFT = stepped(
      [
        [-2, 2],
        [-3, 3],
        [-2, 3],
        [-1, 2],
      ],
      FINE_TEXEL,
      { rows: true, start: -2 },
    );
    b.extrude(ELBOW_TUFT, {
      at: offset(arm.joints[1].at, [s * 0.5, -0.3, -0.8], 0.025),
      x: [s * 0.4, 0, -0.9],
      y: [0, 1, 0],
      thickness: 0.022,
      color: ASH_FUR[4],
      bone: arm.joints[1],
      group: `arm${side}`,
      name: `elbowTuft${side}`,
    });

    // Broad palm & dark leathery palmar pad on wrist
    b.part(new THREE.BoxGeometry(0.058, 0.054, 0.046), koalaCoatPaint, {
      bone: wrist,
      at: [s * 0.128, 0.588, 0.145],
      rotation: [0, s * -18, 0],
      group: `hand${side}`,
      name: `palmBack${side}`,
    });
    b.part(new THREE.BoxGeometry(0.046, 0.044, 0.024), PAW_RAMP[1], {
      bone: wrist,
      at: [s * 0.118, 0.585, 0.154],
      rotation: [0, s * -18, 0],
      group: `hand${side}`,
      name: `palmPad${side}`,
    });

    // Sweep each of the 5 zygodactyl hand digits + add a curved pixel-art claw box/spike at its tip
    handDigits[s].forEach((dc, dIdx) => {
      b.sweep(dc, [0.017, 0.015, 0.012], {
        sides: 5,
        smooth: false,
        caps: "round",
        color: PAW_RAMP[2],
        group: `hand${side}`,
        name: `handDigit${side}${dIdx + 1}`,
      });
      const tipJoint = dc.joints[1];
      const tipPt = dc.at(1).at;
      const clawDir: [number, number, number] =
        dIdx < 2 ? [s * 0.35, -0.35, -0.85] : [-s * 0.55, -0.25, -0.75];
      b.spike(tipPt, clawDir, 0.026, 0.01, {
        bone: tipJoint,
        section: "box",
        caps: { start: "flat", end: "point" },
        color: CLAW_RAMP[0],
        group: `hand${side}`,
        name: `handClaw${side}${dIdx + 1}`,
      });
    });

    // Sturdy climbing hindleg sweep (haunch, knee, calf)
    b.sweep(leg, [0.078, 0.064, 0.048], {
      sides: 7,
      smooth: false,
      caps: "round",
      color: koalaCoatPaint,
      group: `leg${side}`,
      name: `legTube${side}`,
    });

    // Broad hind foot dorsum & dark leathery sole pad planted on the lower perch branch
    b.part(new THREE.BoxGeometry(0.064, 0.036, 0.062), koalaCoatPaint, {
      bone: ankle,
      at: [s * 0.138, 0.305, 0.075],
      rotation: [10, s * -12, 0],
      group: `foot${side}`,
      name: `footBack${side}`,
    });
    b.part(new THREE.BoxGeometry(0.054, 0.022, 0.054), PAW_RAMP[1], {
      bone: ankle,
      at: [s * 0.136, 0.292, 0.076],
      rotation: [10, s * -12, 0],
      group: `foot${side}`,
      name: `footSolePad${side}`,
    });

    // Sweep each of the 4 hind foot digits + add curved climbing claws (hallux is wide & clawless/pad-tipped in real koalas, outer toes strongly clawed)
    footDigits[s].forEach((fc, fIdx) => {
      b.sweep(fc, fIdx === 0 ? [0.02, 0.018, 0.015] : [0.016, 0.014, 0.012], {
        sides: 5,
        smooth: false,
        caps: "round",
        color: PAW_RAMP[2],
        group: `foot${side}`,
        name: `footDigit${side}${fIdx + 1}`,
      });
      const tipJoint = fc.joints[1];
      const tipPt = fc.at(1).at;
      if (fIdx === 0) {
        // Opposable hallux has a broad gripping pad
        b.part(new THREE.BoxGeometry(0.022, 0.018, 0.022), PAW_RAMP[0], {
          bone: tipJoint,
          at: tipPt,
          group: `foot${side}`,
          name: `halluxPad${side}`,
        });
      } else {
        // Syndactyl & outer climbing toes carry long curved dark claws
        b.spike(tipPt, [0, -0.75, -0.65], 0.028, 0.01, {
          bone: tipJoint,
          section: "box",
          caps: { start: "flat", end: "point" },
          color: CLAW_RAMP[0],
          group: `foot${side}`,
          name: `footClaw${side}${fIdx}`,
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 6. PIXEL FUR TUFT CARDS ON CHEEKS, CHEST BIB, SHOULDERS & RUMP
  // ---------------------------------------------------------------------------

  const torsoSurf = b.surface([torsoLoft, craniumLoft]);
  const greyFurHits = torsoSurf.scatter(42, {
    rng: rng(611),
    minDist: 0.055,
    filter: (h) => h.at.z < 0.03 && h.n.y > -0.25,
  });
  b.cards(greyFurHits, GREY_TUFT_TEX, {
    size: [0.044, 0.052],
    lean: 52,
    flow: [0, -0.4, -0.9],
    vary: 0.2,
    spin: 18,
    rng: rng(613),
    group: "furCards",
    name: "dorsalFurCards",
  });

  const creamFurHits = torsoSurf.scatter(24, {
    rng: rng(617),
    minDist: 0.045,
    filter: (h) => h.at.z >= -0.01 && Math.abs(h.at.x) < 0.12 && h.at.y > 0.38 && h.at.y < 0.78,
  });
  b.cards(creamFurHits, CHEEK_TUFT_TEX, {
    size: [0.046, 0.054],
    lean: 45,
    flow: [0, -0.6, 0.8],
    vary: 0.18,
    spin: 15,
    rng: rng(619),
    group: "furCards",
    name: "chestFurCards",
  });

  // ---------------------------------------------------------------------------
  // 7. EUCALYPTUS FOLIAGE: STEPPED SICKLE LEAVES, LEAF SPRAYS, GUMNUTS & BLOSSOMS
  // ---------------------------------------------------------------------------

  // Stepped pixel-staircase sickle leaf outline for 3D hero leaves
  const EUC_LEAF_OUTLINE = stepped(
    [
      [-1, 1],
      [-1, 2],
      [-2, 2],
      [-2, 3],
      [-2, 3],
      [-1, 3],
      [-1, 3],
      [0, 3],
      [0, 2],
      [0, 1],
    ],
    FINE_TEXEL,
    { rows: true, start: 0 },
  );

  // Place sculpted stepped 3D eucalyptus leaves + pixel-art leaf spray cards on upper & side branches
  const foliageClusters: Array<{
    center: [number, number, number];
    stemFrom: [number, number, number];
    side: number;
    young?: boolean;
    hasBlossom?: boolean;
    hasGumnuts?: boolean;
  }> = [
    // Left upper canopy clusters
    {
      center: [0.28, 0.92, 0.03],
      stemFrom: [0.22, 0.86, 0.05],
      side: 1,
      hasBlossom: true,
      hasGumnuts: true,
    },
    {
      center: [0.33, 1.0, -0.03],
      stemFrom: [0.28, 0.95, 0.0],
      side: 1,
      young: true,
    },
    {
      center: [0.22, 0.95, -0.17],
      stemFrom: [0.21, 0.89, -0.13],
      side: 1,
      hasGumnuts: true,
    },
    // Right upper canopy clusters
    {
      center: [-0.27, 0.9, 0.03],
      stemFrom: [-0.21, 0.84, 0.05],
      side: -1,
      hasBlossom: true,
      hasGumnuts: true,
    },
    {
      center: [-0.32, 0.99, -0.03],
      stemFrom: [-0.27, 0.94, 0.0],
      side: -1,
      young: true,
    },
    {
      center: [-0.21, 0.94, -0.17],
      stemFrom: [-0.2, 0.88, -0.13],
      side: -1,
      hasGumnuts: true,
    },
    // Mid-level lateral wrist twigs & snack shoot near koala's mouth
    {
      center: [0.29, 0.64, 0.14],
      stemFrom: [0.24, 0.6, 0.15],
      side: 1,
      young: true,
      hasBlossom: true,
    },
    {
      center: [-0.28, 0.63, 0.13],
      stemFrom: [-0.23, 0.59, 0.14],
      side: -1,
      hasGumnuts: true,
    },
    // Lower perch twigs
    {
      center: [0.26, 0.3, 0.05],
      stemFrom: [0.21, 0.28, 0.06],
      side: 1,
    },
    {
      center: [-0.25, 0.29, 0.05],
      stemFrom: [-0.2, 0.275, 0.06],
      side: -1,
      young: true,
    },
  ];

  foliageClusters.forEach((cl, idx) => {
    const s = cl.side;
    // Woody twig stem connecting cluster to branch
    b.rod(cl.stemFrom, cl.center, [0.015, 0.01], {
      bone: hips,
      sides: 5,
      smooth: false,
      color: ROUGH_BARK[3],
      group: "foliage",
      name: `twigStem${idx + 1}`,
    });

    // 3 hanging stepped 3D sickle leaves per cluster
    const leafDirs: Array<[[number, number, number], [number, number, number]]> = [
      [
        [s * 0.85, 0.15, 0.48],
        [0.12, -0.95, 0.22],
      ],
      [
        [s * 0.45, 0.2, -0.86],
        [-0.15, -0.94, -0.25],
      ],
      [
        [s * 0.92, -0.1, -0.35],
        [s * 0.25, -0.92, 0.15],
      ],
    ];
    leafDirs.forEach(([lx, ly], lIdx) => {
      const leafRoot = lerp(cl.stemFrom, cl.center, 0.55 + 0.22 * lIdx);
      b.extrude(EUC_LEAF_OUTLINE, {
        at: leafRoot,
        x: lx,
        y: ly,
        thickness: 0.01,
        color: cl.young && lIdx === 0 ? YOUNG_LEAF[2] : eucLeafPaint,
        bone: hips,
        group: "foliage",
        name: `sickleLeaf${idx + 1}_${lIdx + 1}`,
      });
    });

    // Crossed pixel-art leaf spray cards for rich silhouette from all angles
    const sprayFrames = [
      frame(cl.center, [s * 0.55, 0.75, 0.35]),
      frame(offset(cl.center, [s, -0.3, -0.4], 0.025), [s * 0.7, 0.5, -0.5]),
    ];
    b.cards(sprayFrames, cl.young ? [YOUNG_SPRAY_TEX, LEAF_SPRAY_TEX] : LEAF_SPRAY_TEX, {
      size: [0.115, 0.125],
      lean: 35,
      flow: [s * 0.4, -0.8, 0.2],
      cross: true,
      vary: 0.15,
      spin: 25,
      rng: rng(700 + idx),
      bone: hips,
      group: "foliage",
      name: `leafSprayCards${idx + 1}`,
    });

    // Woody cup-shaped gumnut capsules (honky nuts) hanging in triples
    if (cl.hasGumnuts) {
      const nutBase = lerp(cl.stemFrom, cl.center, 0.45);
      for (let gIdx = 0; gIdx < 2; gIdx++) {
        const angle = (gIdx - 0.5) * 0.8;
        const nutTip: [number, number, number] = [
          nutBase.x + s * 0.022 * Math.cos(angle),
          nutBase.y - 0.032,
          nutBase.z + 0.022 * Math.sin(angle),
        ];
        b.frustumBox(nutBase, nutTip, [0.014, 0.014], [0.026, 0.026], {
          bone: hips,
          color: gumnutPaint,
          group: "foliage",
          name: `gumnutCup${idx + 1}_${gIdx + 1}`,
        });
        // Rim disk on the open end of the gumnut capsule
        b.part(new THREE.BoxGeometry(0.02, 0.008, 0.02), BLOSSOM_RAMP[0], {
          bone: hips,
          at: nutTip,
          quat: aim([0, -1, 0]),
          group: "foliage",
          name: `gumnutRim${idx + 1}_${gIdx + 1}`,
        });
      }
    }

    // Creamy-yellow stamen eucalyptus blossoms
    if (cl.hasBlossom) {
      const blossomPos = offset(cl.center, [s * 0.3, 0.85, 0.4], 0.022);
      b.cards([frame(blossomPos, [0, 1, 0.3])], BLOSSOM_TEX, {
        size: [0.056, 0.056],
        lean: 15,
        flow: [s * 0.5, 0.2, 0.8],
        cross: true,
        bone: hips,
        group: "foliage",
        name: `blossomCard${idx + 1}`,
      });
    }
  });

  // Tender leafy snack sprig tucked right by the koala's right paw and mouth
  const snackTwig = bezier(
    [0.115, 0.605, 0.165],
    [0.085, 0.655, 0.185],
    [0.048, 0.682, 0.175],
  );
  b.sweep(snackTwig, [0.012, 0.008], {
    bone: hips,
    sides: 5,
    smooth: false,
    caps: "flat",
    color: ROUGH_BARK[3],
    group: "foliage",
    name: "snackTwig",
  });
  b.extrude(EUC_LEAF_OUTLINE, {
    at: [0.055, 0.678, 0.176],
    x: [0.85, -0.2, 0.45],
    y: [0.35, -0.88, -0.25],
    thickness: 0.01,
    color: YOUNG_LEAF[3],
    bone: hips,
    group: "foliage",
    name: "snackLeaf1",
  });
  b.extrude(EUC_LEAF_OUTLINE, {
    at: [0.078, 0.658, 0.18],
    x: [0.65, 0.3, 0.68],
    y: [0.55, -0.78, 0.25],
    thickness: 0.01,
    color: eucLeafPaint,
    bone: hips,
    group: "foliage",
    name: "snackLeaf2",
  });

  // Fallen eucalyptus leaves & gumnuts resting on top of the stand plinth
  const fallenLeaves: Array<{ at: [number, number, number]; x: [number, number, number] }> = [
    { at: [0.11, 0.088, 0.12], x: [0.8, 0, 0.6] },
    { at: [-0.12, 0.088, -0.09], x: [-0.7, 0, 0.7] },
    { at: [0.16, 0.05, -0.04], x: [0.5, 0, -0.86] },
  ];
  fallenLeaves.forEach((fl, i) => {
    b.extrude(EUC_LEAF_OUTLINE, {
      at: fl.at,
      x: fl.x,
      y: [-fl.x[2], 0, fl.x[0]],
      thickness: 0.009,
      color: i === 1 ? YOUNG_LEAF[1] : eucLeafPaint,
      bone: hips,
      group: "standBase",
      name: `fallenLeaf${i + 1}`,
    });
  });

  // Pair of fallen woody gumnuts on the plinth
  b.frustumBox([0.08, 0.092, 0.14], [0.105, 0.098, 0.155], [0.014, 0.014], [0.024, 0.024], {
    bone: hips,
    color: gumnutPaint,
    group: "standBase",
    name: "fallenGumnut1",
  });
  b.frustumBox([-0.09, 0.092, 0.13], [-0.115, 0.096, 0.115], [0.014, 0.014], [0.024, 0.024], {
    bone: hips,
    color: gumnutPaint,
    group: "standBase",
    name: "fallenGumnut2",
  });

  return b.root;
}
