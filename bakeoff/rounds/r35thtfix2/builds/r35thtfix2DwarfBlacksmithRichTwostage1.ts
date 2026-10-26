import * as THREE from "three";
import { createBuilder, catmull, type Builder } from "../../../../src/index";

const SKIN = "#b96f4d";
const SKIN_LIGHT = "#df9a68";
const SKIN_SHADOW = "#81402f";
const HAIR = "#702719";
const HAIR_LIGHT = "#a84325";
const BEARD = "#5a2118";
const BEARD_LIGHT = "#873522";
const CLOTH = "#3f5663";
const CLOTH_LIGHT = "#627887";
const CLOTH_DARK = "#253440";
const LEATHER = "#513021";
const LEATHER_LIGHT = "#855033";
const APRON = "#70442b";
const APRON_LIGHT = "#a46b3b";
const IRON = "#292d32";
const IRON_LIGHT = "#59616a";
const IRON_DARK = "#17191d";
const ANVIL = "#25292d";
const ANVIL_LIGHT = "#4b5258";
const BRASS = "#c18a32";
const BRASS_LIGHT = "#edc15c";
const GOLD = "#e6ad3e";
const WOOD = "#704225";
const WOOD_LIGHT = "#a36835";
const EYE = "#d9f0cf";
const EYE_GREEN = "#70b878";
const INK = "#21171a";
const COAL = "#16171a";
const EMBER = "#e35b24";

export const meta = {
  name: "Dwarf Blacksmith at the Anvil",
  description:
    "A stout Warcraft-inspired dwarf blacksmith in a neutral rigging pose, with a huge braided beard, leather apron, hammer, tongs, and a chunky low-poly anvil.",
};

export const REQUESTS = [
  {
    id: "forgeSparks",
    kind: "add",
    part: "anvilTop",
    what:
      "A vivid cluster of stylized forge sparks bursting upward from the anvil: orange and yellow glowing angular embers, a few tiny star-shaped flashes, and short hot streaks. Keep it centered above the front half of the anvil and do not obscure the dwarf's face.",
    at: [0, 0.98, 1.12],
    normal: [0, 1, 0],
    bone: "hips",
    room: [0.55, 0.5, 0.55],
  },
  {
    id: "hammerRunes",
    kind: "add",
    part: "hammerHead",
    what:
      "Small glowing orange runes and brass rivets on the iron hammer head. Add three chunky angular rune marks on the broad front face and a brass collar around the wooden haft. Use EMBER, GOLD, BRASS, and IRON.",
    at: [-0.29, 1.34, 0.58],
    normal: [0, 0, 1],
    bone: "handR",
    room: [0.4, 0.22, 0.2],
  },
  {
    id: "beltBuckle",
    kind: "add",
    part: "belt",
    what:
      "A large Warcraft-style forged brass belt buckle on the apron front: thick octagonal frame, dark inset center, a tiny crossed-hammers emblem, and two side rivets. Use BRASS, GOLD, and IRON.",
    at: [0, 1.07, 0.31],
    normal: [0, 0, 1],
    bone: "chest",
    room: [0.23, 0.2, 0.08],
  },
  {
    id: "shoulderPauldrons",
    kind: "add",
    part: "torso",
    what:
      "Two broad asymmetrical blacksmith shoulder pauldrons, one on each shoulder. They should be layered iron plates with brass rim trim, four rivets per side, and a slightly battered silhouette. Keep the neck and beard unobstructed.",
    at: [0.31, 1.39, 0.03],
    normal: [0, 1, 0],
    bone: "chest",
    room: [0.62, 0.28, 0.35],
  },
  {
    id: "beardClasps",
    kind: "add",
    part: "beard",
    what:
      "Two decorative brass beard clasps at the ends of the dwarf's braids, each with a small red enamel inset and three tiny rivets. They must sit visibly on the front of the beard without changing its silhouette.",
    at: [0.18, 1.24, 0.37],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.42, 0.22, 0.08],
  },
  {
    id: "helmetCrest",
    kind: "add",
    part: "helmet",
    what:
      "A short swept iron mohawk crest on the leather forge cap, made from three overlapping dark metal plates with brass edge studs. Strong chunky silhouette, no tall spikes.",
    at: [0, 1.97, 0.09],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.28, 0.18, 0.24],
  },
  {
    id: "anvilRivets",
    kind: "add",
    part: "anvilBody",
    what:
      "Heavy brass rivets and small iron corner plates on the anvil's base and waist. Add four large rounded rivets on the front and two on each side, keeping the top striking face plain.",
    at: [0, 0.43, 0.6],
    normal: [0, 0, 1],
    bone: "hips",
    room: [0.58, 0.38, 0.08],
  },
  {
    id: "tongsGrip",
    kind: "add",
    part: "tongs",
    what:
      "A wrapped leather grip around the tongs in the dwarf's left hand, with two brass bands and a small hanging leather loop. Use LEATHER_LIGHT, APRON_LIGHT, and BRASS.",
    at: [0.27, 0.88, 0.52],
    normal: [0, 0, 1],
    bone: "handL",
    room: [0.18, 0.22, 0.18],
  },
  {
    id: "bootBuckles",
    kind: "add",
    part: "bootL",
    what:
      "Matching chunky brass buckles and dark iron toe caps on both boots, mirrored across the centerline. The buckles should sit on the outer front faces and leave the soles clear.",
    at: [0.18, 0.14, 0.29],
    normal: [0, 0, 1],
    bone: "footL",
    room: [0.4, 0.2, 0.2],
  },
  {
    id: "apronTexture",
    kind: "texture",
    part: "apron",
    what:
      "Paint the leather apron with broad warm brown leather panels, darker vertical wear bands, pale stitch lines along the edge, and a few soot-black scorch marks near the bottom. Keep the colors flat and Warcraft graphic: APRON, APRON_LIGHT, LEATHER, and INK.",
  },
  {
    id: "beardTexture",
    kind: "texture",
    part: "beard",
    what:
      "Give the entire beard and mustache layered copper-red and deep auburn flat-color streaks following the hair direction. Add subtle darker roots and pale orange edge highlights without making it realistic or noisy. Use BEARD, BEARD_LIGHT, HAIR, and HAIR_LIGHT.",
  },
  {
    id: "anvilTexture",
    kind: "texture",
    part: "anvilTop",
    what:
      "Paint the anvil striking face as worn blue-black iron: a broad lighter central wear patch, darker edges, simple hammer dents, and a faint warm reflection beneath the future sparks. Use ANVIL, ANVIL_LIGHT, IRON_DARK, and EMBER.",
  },
  {
    id: "clothTexture",
    kind: "texture",
    part: "torso",
    what:
      "Add broad dark teal-blue cloth paneling to the tunic and sleeves, with simple angular woven bands at the cuffs and hem. Keep all facial and apron surfaces untouched. Use CLOTH, CLOTH_LIGHT, and CLOTH_DARK.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one stout central spine, a neutral readable arm pose, and planted legs.

  const hips = b.joint("hips", {
    at: [0, 0.91, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.91, 0],
    [0, 1.08, 0.005],
    [0, 1.29, 0.015],
    [0, 1.39, 0.025],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "chest", "neckBase", "chestTip"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    [0, 1.39, 0.025],
    [0, 1.50, 0.045],
    [0, 1.58, 0.075],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck", "neckUpper", "neckTip"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.63, 0.10],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.535, 0.255],
    dir: [0, -0.04, 1],
    role: "jaw",
    group: "head",
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.29, 1.36, 0.02],
      [0.42, 1.20, 0.12],
      [0.39, 1.03, 0.30],
      [0.28, 0.89, 0.51],
    ]),
    {
      parent: spine.tip!,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      group: "arms",
    },
  );

  const armR = b.chain(
    "armR",
    catmull([
      [-0.29, 1.36, 0.02],
      [-0.42, 1.20, 0.12],
      [-0.39, 1.03, 0.30],
      [-0.28, 0.89, 0.52],
    ]),
    {
      parent: spine.tip!,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      group: "arms",
    },
  );

  const legL = b.chain(
    "legL",
    catmull([
      [0.17, 0.88, -0.01],
      [0.19, 0.58, 0.06],
      [0.18, 0.29, 0.10],
      [0.18, 0.14, 0.17],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0, 0.20],
      group: "legs",
    },
  );

  const legR = b.chain(
    "legR",
    catmull([
      [-0.17, 0.88, -0.01],
      [-0.19, 0.58, 0.06],
      [-0.18, 0.29, 0.10],
      [-0.18, 0.14, 0.17],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0, 0.20],
      group: "legs",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small placement helpers. Every visible piece enters through the builder.

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name,
      at,
      bone,
      rotation,
    });

  const sphere = (
    name: string,
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone: any,
    segments = 10,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, Math.max(6, Math.floor(segments * 0.75))), color, {
      name,
      at,
      bone,
      scale,
    });

  const cylinder = (
    name: string,
    radius: number,
    length: number,
    at: [number, number, number],
    color: string,
    bone: any,
    dir: [number, number, number] = [0, 1, 0],
    sides = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      name,
      at,
      bone,
      dir,
    });

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone?: any,
  ) => b.rod(a, c, radius, { color, bone, name });

  // ---------------------------------------------------------------------------------------------------------------
  // Torso, tunic and leather apron.

  b.loft(
    [
      { at: [0, 0.91, 0], w: 0.44, h: 0.28 },
      { at: [0, 1.10, 0.01], w: 0.53, h: 0.35 },
      { at: [0, 1.31, 0.025], w: 0.62, h: 0.27 },
      { at: [0, 1.40, 0.025], w: 0.48, h: 0.22 },
    ],
    {
      bone: spine,
      color: CLOTH,
      section: "box",
      name: "torso",
    },
  );

  box("tunicHem", [0.50, 0.10, 0.30], [0, 0.91, 0.03], CLOTH_DARK, hips);
  box("tunicChestPanel", [0.32, 0.28, 0.025], [0, 1.27, 0.275], CLOTH_LIGHT, spine.tip);

  const beltPath = catmull(
    [
      [-0.28, 1.075, 0.00],
      [0, 1.075, 0.225],
      [0.28, 1.075, 0.00],
      [0, 1.075, -0.225],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.035, {
    color: LEATHER,
    bone: spine.joints[1],
    name: "belt",
    caps: "none",
  });

  box("beltFrontBacking", [0.22, 0.17, 0.035], [0, 1.075, 0.246], LEATHER_LIGHT, spine.joints[1]);
  box("beltBuckleBase", [0.18, 0.14, 0.045], [0, 1.075, 0.275], BRASS, spine.joints[1]);
  box("beltBuckleInset", [0.105, 0.065, 0.014], [0, 1.075, 0.301], IRON_DARK, spine.joints[1]);

  for (const s of [-1, 1]) {
    box(`beltPouch${s}`, [0.13, 0.16, 0.11], [s * 0.29, 1.02, 0.02], LEATHER, spine.joints[1]);
    box(`beltPouchFlap${s}`, [0.14, 0.045, 0.12], [s * 0.29, 1.105, 0.025], LEATHER_LIGHT, spine.joints[1]);
    cylinder(`beltPouchStud${s}`, 0.014, 0.018, [s * 0.29, 1.105, 0.091], BRASS, spine.joints[1], [0, 0, 1], 8);
  }

  b.extrude(
    [
      [-0.27, 0],
      [0.27, 0],
      [0.25, 0.40],
      [0.18, 0.52],
      [-0.18, 0.52],
      [-0.25, 0.40],
    ],
    {
      name: "apron",
      at: [0, 0.84, 0.285],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: APRON,
      bone: spine.joints[0],
    },
  );

  rod("apronTopSeam", [-0.22, 1.34, 0.31], [0.22, 1.34, 0.31], 0.012, APRON_LIGHT, spine.tip);
  rod("apronLeftSeam", [-0.25, 0.86, 0.31], [-0.18, 1.34, 0.31], 0.009, APRON_LIGHT, spine.joints[0]);
  rod("apronRightSeam", [0.25, 0.86, 0.31], [0.18, 1.34, 0.31], 0.009, APRON_LIGHT, spine.joints[0]);
  rod("apronBottomSeam", [-0.26, 0.86, 0.31], [0.26, 0.86, 0.31], 0.012, LEATHER_LIGHT, spine.joints[0]);

  // Apron straps cross the shoulders and leave a broad clear front panel.
  rod("apronStrapL", [0.23, 1.39, 0.16], [0.13, 1.16, 0.305], 0.022, LEATHER_LIGHT, spine.tip);
  rod("apronStrapR", [-0.23, 1.39, 0.16], [-0.13, 1.16, 0.305], 0.022, LEATHER_LIGHT, spine.tip);
  for (const s of [-1, 1]) {
    box(`strapRivet${s}`, [0.035, 0.035, 0.012], [s * 0.205, 1.35, 0.185], BRASS, spine.tip);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs, trousers, cuffs and planted boots.

  b.sweep(legL, (t) => 0.105 - 0.025 * t, {
    color: CLOTH_DARK,
    name: "trouserL",
    section: { ngon: 6 },
  });
  b.sweep(legR, (t) => 0.105 - 0.025 * t, {
    color: CLOTH_DARK,
    name: "trouserR",
    section: { ngon: 6 },
  });

  for (const s of [-1, 1]) {
    const legBone = s > 0 ? legL : legR;
    box(`kneePatch${s}`, [0.14, 0.12, 0.035], [s * 0.18, 0.57, 0.135], CLOTH_LIGHT, legBone);
    box(`ankleCuff${s}`, [0.17, 0.105, 0.19], [s * 0.18, 0.245, 0.12], LEATHER, legBone);
    box(`boot${s > 0 ? "L" : "R"}`, [0.22, 0.27, 0.37], [s * 0.18, 0.135, 0.20], LEATHER, legBone);
    box(`bootToe${s}`, [0.23, 0.13, 0.12], [s * 0.18, 0.11, 0.355], LEATHER_LIGHT, legBone);
    box(`bootSole${s}`, [0.245, 0.045, 0.39], [s * 0.18, 0.022, 0.20], IRON_DARK, legBone);
    box(`bootStrap${s}`, [0.23, 0.045, 0.045], [s * 0.18, 0.18, 0.325], LEATHER_LIGHT, legBone);
    box(`bootStrapBuckle${s}`, [0.055, 0.065, 0.018], [s * 0.25, 0.18, 0.35], BRASS, legBone);
    cylinder(`bootRivetOuter${s}`, 0.015, 0.02, [s * 0.275, 0.18, 0.33], BRASS, legBone, [1, 0, 0], 8);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Arms: broad sleeves, leather cuffs, oversized hands and separated fingers.

  b.sweep(armL, (t) => 0.095 - 0.026 * t, {
    color: CLOTH,
    name: "sleeveL",
    section: { ngon: 7 },
  });
  b.sweep(armR, (t) => 0.095 - 0.026 * t, {
    color: CLOTH,
    name: "sleeveR",
    section: { ngon: 7 },
  });

  for (const s of [-1, 1]) {
    const armBone = s > 0 ? armL : armR;
    box(`shoulderCloth${s}`, [0.22, 0.18, 0.24], [s * 0.32, 1.34, 0.03], CLOTH_LIGHT, armBone);
    b.sweep(
      catmull([
        [s * 0.37, 1.19, 0.12],
        [s * 0.41, 1.08, 0.23],
        [s * 0.38, 1.00, 0.33],
      ]),
      0.108,
      { color: CLOTH_DARK, bone: armBone, name: `sleevePanel${s}` },
    );
    rod(`cuff${s}`, [s * 0.34, 0.965, 0.38], [s * 0.31, 0.905, 0.48], 0.041, LEATHER, armBone);
    sphere(`hand${s}`, [s * 0.28, 0.885, 0.515], [0.105, 0.11, 0.105], SKIN, armBone);
    sphere(`thumb${s}`, [s * 0.205, 0.87, 0.50], [0.045, 0.06, 0.055], SKIN_LIGHT, armBone);
    for (let i = 0; i < 3; i++) {
      const x = s * (0.245 + i * 0.035);
      rod(
        `finger${s}_${i}`,
        [x, 0.86 - i * 0.008, 0.54],
        [x + s * 0.012, 0.81 - i * 0.008, 0.57],
        0.018,
        SKIN_LIGHT,
        armBone,
      );
    }
    box(`cuffBuckle${s}`, [0.055, 0.07, 0.025], [s * 0.34, 0.96, 0.43], BRASS, armBone);
  }

  // Shoulder pads are deliberately broad but still leave the head and beard silhouette clear.
  for (const s of [-1, 1]) {
    sphere(`pauldronBase${s}`, [s * 0.35, 1.405, 0.025], [0.18, 0.11, 0.18], IRON, spine.tip!);
    box(`pauldronPlate${s}`, [0.22, 0.045, 0.20], [s * 0.35, 1.47, 0.02], IRON_LIGHT, spine.tip);
    rod(`pauldronRim${s}`, [s * 0.25, 1.46, 0.10], [s * 0.45, 1.46, 0.10], 0.014, BRASS, spine.tip);
    for (let i = 0; i < 3; i++) {
      sphere(`pauldronRivet${s}_${i}`, [s * (0.29 + i * 0.06), 1.48, 0.105], [0.018, 0.018, 0.012], BRASS_LIGHT, spine.tip, 7);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head, ears, nose, eyes and eyebrows.

  sphere("skull", [0, 1.64, 0.105], [0.285, 0.285, 0.265], SKIN, head, 14);
  sphere("cheekL", [0.18, 1.57, 0.235], [0.13, 0.14, 0.11], SKIN_LIGHT, head);
  sphere("cheekR", [-0.18, 1.57, 0.235], [0.13, 0.14, 0.11], SKIN_LIGHT, head);

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.055, -0.08],
        [0.055, -0.06],
        [0.075, 0.04],
        [0.015, 0.125],
        [-0.06, 0.07],
      ],
      {
        name: `ear${s}`,
        at: [s * 0.255, 1.66, 0.085],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        color: SKIN,
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.032, -0.035],
        [0.035, -0.025],
        [0.045, 0.035],
        [0.005, 0.075],
        [-0.03, 0.045],
      ],
      {
        name: `earInner${s}`,
        at: [s * 0.276, 1.66, 0.088],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.012,
        color: SKIN_SHADOW,
        bone: head,
      },
    );
  }

  sphere("nose", [0, 1.65, 0.373], [0.095, 0.105, 0.105], SKIN_LIGHT, head);
  sphere("noseTip", [0, 1.625, 0.438], [0.052, 0.045, 0.035], SKIN_SHADOW, head);
  sphere("nostrilL", [0.037, 1.625, 0.462], [0.016, 0.011, 0.008], INK, head, 7);
  sphere("nostrilR", [-0.037, 1.625, 0.462], [0.016, 0.011, 0.008], INK, head, 7);

  for (const s of [-1, 1]) {
    sphere(`eyeWhite${s}`, [s * 0.105, 1.705, 0.331], [0.072, 0.078, 0.034], EYE, head, 10);
    sphere(`iris${s}`, [s * 0.105, 1.702, 0.360], [0.041, 0.052, 0.010], EYE_GREEN, head, 9);
    sphere(`pupil${s}`, [s * 0.105, 1.702, 0.369], [0.017, 0.036, 0.006], INK, head, 8);
    sphere(`eyeGlint${s}`, [s * 0.090, 1.728, 0.377], [0.009, 0.012, 0.004], "#ffffff", head, 6);
    rod(`brow${s}`, [s * 0.17, 1.79, 0.325], [s * 0.045, 1.775, 0.35], 0.023, BEARD, head);
    rod(`eyeLower${s}`, [s * 0.165, 1.672, 0.354], [s * 0.052, 1.668, 0.37], 0.009, SKIN_SHADOW, head);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Lower jaw and the large signature beard.

  b.sweep(
    catmull([
      [0, 1.54, 0.22],
      [0, 1.51, 0.31],
      [0, 1.53, 0.40],
    ]),
    [0.17, 0.12],
    {
      color: SKIN_SHADOW,
      bone: jaw,
      name: "lowerJaw",
      section: { ngon: 7 },
    },
  );

  b.extrude(
    [
      [-0.235, 0.17],
      [-0.16, 0.29],
      [-0.085, 0.34],
      [0, 0.31],
      [0.085, 0.34],
      [0.16, 0.29],
      [0.235, 0.17],
      [0.19, 0.045],
      [0.11, -0.10],
      [0.055, -0.24],
      [0, -0.32, "sharp"],
      [-0.055, -0.24],
      [-0.11, -0.10],
      [-0.19, 0.045],
    ],
    {
      name: "beard",
      at: [0, 1.50, 0.34],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.085,
      bevel: 0.012,
      color: BEARD,
      bone: head,
    },
  );

  // Layered cheek ruffs give the beard a chunky Warcraft silhouette.
  for (const s of [-1, 1]) {
    sphere(`beardCheek${s}`, [s * 0.195, 1.54, 0.325], [0.105, 0.16, 0.075], BEARD_LIGHT, head);
    sphere(`beardFlare${s}`, [s * 0.205, 1.43, 0.345], [0.09, 0.16, 0.065], BEARD, head);
    rod(`beardEdge${s}`, [s * 0.22, 1.61, 0.39], [s * 0.17, 1.34, 0.405], 0.018, BEARD_LIGHT, head);
  }

  // Broad curled mustache pieces sit in front of the upper beard.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [0, 1.61, 0.405],
        [s * 0.075, 1.595, 0.425],
        [s * 0.17, 1.62, 0.395],
        [s * 0.205, 1.59, 0.37],
      ]),
      [0.041, 0.012],
      {
        color: HAIR,
        bone: head,
        name: `mustache${s}`,
        caps: { start: "round", end: "point" },
      },
    );
  }

  // Two long braids are separated from the beard and gain repeated bead geometry.
  for (const s of [-1, 1]) {
    const braid = catmull([
      [s * 0.16, 1.49, 0.36],
      [s * 0.20, 1.38, 0.38],
      [s * 0.21, 1.25, 0.37],
      [s * 0.17, 1.13, 0.34],
    ]);
    b.sweep(braid, (t) => 0.043 - t * 0.018, {
      color: HAIR,
      bone: head,
      name: `braid${s}`,
      section: { ngon: 6 },
    });
    b.along(braid, 5, (at) => {
      sphere(`braidBead${s}_${at.t.toFixed(2)}`, [at.at.x, at.at.y, at.at.z], [0.052, 0.025, 0.052], HAIR_LIGHT, head, 7);
    });
    sphere(`braidTip${s}`, [s * 0.17, 1.105, 0.34], [0.05, 0.055, 0.05], BRASS, head, 8);
  }

  // Forge cap, hairline, sideburns and a short blocky top knot.
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.255, 0.045],
      [0.245, 0.095],
      [0.205, 0.15],
      [0.12, 0.19],
      [0, 0.20],
    ],
    {
      name: "helmet",
      at: [0, 1.79, 0.08],
      axis: [0, 1, 0],
      segments: 10,
      color: LEATHER,
      bone: head,
    },
  );
  b.sweep(
    catmull([
      [-0.22, 1.80, 0.20],
      [-0.16, 1.84, 0.29],
      [0, 1.87, 0.31],
      [0.16, 1.84, 0.29],
      [0.22, 1.80, 0.20],
    ]),
    0.025,
    { color: LEATHER_LIGHT, bone: head, name: "helmetBand" },
  );
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.21, 1.77, 0.22],
        [s * 0.25, 1.69, 0.28],
        [s * 0.22, 1.61, 0.31],
      ]),
      [0.035, 0.012],
      { color: HAIR, bone: head, name: `sideburn${s}`, caps: { end: "point" } },
    );
  }
  b.extrude(
    [
      [-0.13, 0],
      [-0.08, 0.10],
      [0, 0.18, "sharp"],
      [0.08, 0.10],
      [0.13, 0],
      [0.06, -0.035],
      [-0.06, -0.035],
    ],
    {
      name: "helmetTopKnot",
      at: [0, 1.97, 0.08],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      color: HAIR,
      bone: head,
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Anvil: a simple, oversized stage prop with a readable striking face and horn.

  box("anvilBase", [0.52, 0.28, 0.34], [0, 0.14, 0.82], ANVIL, hips);
  box("anvilFootFront", [0.20, 0.18, 0.18], [-0.19, 0.09, 0.68], ANVIL_LIGHT, hips);
  box("anvilFootFrontR", [0.20, 0.18, 0.18], [0.19, 0.09, 0.68], ANVIL_LIGHT, hips);
  box("anvilFootBack", [0.20, 0.18, 0.18], [-0.19, 0.09, 0.96], ANVIL, hips);
  box("anvilFootBackR", [0.20, 0.18, 0.18], [0.19, 0.09, 0.96], ANVIL, hips);

  b.frustumBox(
    [0, 0.30, 0.82],
    [0, 0.67, 0.82],
    [0.27, 0.30],
    [0.19, 0.22],
    { name: "anvilBody", color: ANVIL, bone: hips, section: { ngon: 6 } },
  );
  box("anvilShoulder", [0.55, 0.16, 0.34], [0, 0.70, 0.82], ANVIL_LIGHT, hips);
  box("anvilTop", [0.68, 0.13, 0.34], [0, 0.81, 0.82], ANVIL, hips);
  box("anvilTopWear", [0.47, 0.018, 0.25], [0, 0.881, 0.82], ANVIL_LIGHT, hips);
  box("anvilHeel", [0.26, 0.12, 0.22], [0, 0.82, 0.62], ANVIL_LIGHT, hips);

  b.spike([0, 0.82, 0.96], [0, 0, 1], 0.38, 0.14, {
    name: "anvilHorn",
    color: ANVIL,
    bone: hips,
    caps: { start: "flat", end: "point" },
  });
  box("anvilHornCollar", [0.27, 0.12, 0.09], [0, 0.82, 0.98], ANVIL_LIGHT, hips);

  for (const s of [-1, 1]) {
    box(`anvilSidePlate${s}`, [0.035, 0.24, 0.24], [s * 0.29, 0.48, 0.82], IRON_LIGHT, hips);
    for (let i = 0; i < 2; i++) {
      sphere(`anvilSideRivet${s}_${i}`, [s * 0.315, 0.42 + i * 0.13, 0.82], [0.022, 0.022, 0.022], BRASS, hips, 7);
    }
  }
  for (const x of [-0.20, 0.20]) {
    sphere(`anvilFrontRivet${x}`, [x, 0.46, 0.66], [0.027, 0.027, 0.018], BRASS, hips, 7);
    sphere(`anvilFrontRivetTop${x}`, [x, 0.59, 0.66], [0.027, 0.027, 0.018], BRASS_LIGHT, hips, 7);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hammer in the right hand and tongs in the left.

  rod("hammerShaft", [-0.28, 0.88, 0.52], [-0.29, 1.29, 0.56], 0.025, WOOD, armR.tip);
  rod("hammerShaftHighlight", [-0.295, 0.90, 0.545], [-0.30, 1.28, 0.585], 0.008, WOOD_LIGHT, armR.tip);
  box("hammerHead", [0.34, 0.13, 0.16], [-0.29, 1.34, 0.57], IRON, armR.tip);
  box("hammerFaceL", [0.075, 0.18, 0.19], [-0.47, 1.34, 0.57], IRON_LIGHT, armR.tip);
  box("hammerFaceR", [0.075, 0.18, 0.19], [-0.11, 1.34, 0.57], IRON_DARK, armR.tip);
  cylinder("hammerCollar", 0.044, 0.055, [-0.29, 1.275, 0.56], BRASS, armR.tip, [0, 1, 0], 8);

  rod("tongsA", [0.28, 0.88, 0.52], [0.08, 0.86, 0.91], 0.014, IRON_LIGHT, armL.tip);
  rod("tongsB", [0.25, 0.90, 0.54], [0.06, 0.84, 0.91], 0.014, IRON, armL.tip);
  rod("tongsJawA", [0.08, 0.86, 0.91], [0.02, 0.82, 1.02], 0.012, IRON_LIGHT, armL.tip);
  rod("tongsJawB", [0.06, 0.84, 0.91], [-0.015, 0.82, 1.02], 0.012, IRON, armL.tip);
  sphere("tongsPivot", [0.07, 0.85, 0.91], [0.032, 0.032, 0.032], BRASS, armL.tip, 8);
  rod("tongsGripWrap1", [0.255, 0.88, 0.53], [0.285, 0.91, 0.56], 0.034, LEATHER_LIGHT, armL.tip);
  rod("tongsGripWrap2", [0.27, 0.895, 0.55], [0.30, 0.925, 0.58], 0.009, BRASS, armL.tip);

  // ---------------------------------------------------------------------------------------------------------------
  // A few final broad silhouette accents and soot marks, all still flat-colored stage-one geometry.

  box("neckCloth", [0.31, 0.18, 0.24], [0, 1.43, 0.055], CLOTH_DARK, neck.joints[0]);
  box("collarFront", [0.27, 0.07, 0.04], [0, 1.49, 0.245], LEATHER, neck.joints[0]);

  for (const s of [-1, 1]) {
    sphere(`hairTuft${s}`, [s * 0.245, 1.82, 0.12], [0.075, 0.12, 0.09], HAIR_LIGHT, head, 8);
    box(`elbowGuard${s}`, [0.13, 0.10, 0.12], [s * 0.40, 1.16, 0.18], LEATHER, s > 0 ? armL : armR);
    sphere(`handKnuckle${s}`, [s * 0.28, 0.93, 0.57], [0.08, 0.05, 0.035], SKIN_LIGHT, s > 0 ? armL : armR, 8);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
