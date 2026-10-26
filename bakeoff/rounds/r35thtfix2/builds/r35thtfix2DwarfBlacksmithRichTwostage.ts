import * as THREE from "three";
import { type Builder, createBuilder, catmull, paint, svg, spiral } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

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

const APRON_PAINT = paint((p, _n, s) => {
  const x = s[0];
  const y = s[1];

  if (y < 0.055) return INK;
  if (y < 0.09) return APRON_LIGHT;
  if (y > 0.47) return APRON_LIGHT;

  const panel = Math.floor((x + 0.28) / 0.14);
  const panelTone = panel % 2 === 0 ? APRON : LEATHER;
  const seamX = Math.abs(((x + 0.28) % 0.14) - 0.07);
  if (seamX < 0.006) return APRON_LIGHT;

  const sootWave = Math.sin(p.x * 62 + p.y * 17) * 0.5 + 0.5;
  if (y < 0.13 && sootWave > 0.84) return INK;
  if (y < 0.17 && sootWave > 0.93) return LEATHER;

  return panelTone;
});

const BEARD_PAINT = paint((p, _n, s) => {
  const flow = p.y + p.x * 0.42 + s[0] * 0.025;
  const stripe = Math.sin(flow * 105);
  const roots = p.y > 1.585;

  if (roots && stripe < -0.12) return HAIR;
  if (stripe > 0.72) return HAIR_LIGHT;
  if (stripe > 0.18) return BEARD_LIGHT;
  if (stripe < -0.78) return HAIR;
  return roots ? BEARD : BEARD_LIGHT;
});

const ANVIL_PAINT = paint((_p, n, s) => {
  if (n.y < 0.45) return ANVIL;

  const u = s[0];
  const v = s[1];
  const edge = Math.min(u, 1 - u, v, 1 - v);

  if (edge < 0.09) return IRON_DARK;

  const centralWear =
    Math.abs(u - 0.5) < 0.31 &&
    v > 0.18 &&
    v < 0.87;

  if (centralWear) {
    const dent =
      Math.sin(u * 73.0 + v * 19.0) +
      Math.sin(u * 131.0 - v * 47.0);
    if (dent > 1.48) return IRON_DARK;
    if (v > 0.69 && dent > 0.15) return EMBER;
    return ANVIL_LIGHT;
  }

  return ANVIL;
});

const CLOTH_PAINT = paint((p, n, _s) => {
  const hem = Math.abs(p.y - 0.92) < 0.045;
  const lowerBand = Math.abs(p.y - 1.02) < 0.025;
  const upperBand = Math.abs(p.y - 1.39) < 0.035;
  const cuff = Math.abs(p.y - 0.96) < 0.052;

  if (hem || lowerBand || upperBand || cuff) {
    const weave = Math.sin((p.x + p.z) * 75) + Math.sin((p.x - p.z) * 48);
    return weave > 0.7 ? CLOTH_LIGHT : CLOTH_DARK;
  }

  if (n.y > 0.45) return CLOTH_LIGHT;
  if (n.y < -0.3) return CLOTH_DARK;
  return CLOTH;
});

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
    [0, 1.5, 0.045],
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
    at: [0, 1.63, 0.1],
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
      [0.42, 1.2, 0.12],
      [0.39, 1.03, 0.3],
      [0.28, 0.89, 0.51],
    ]),
    {
      parent: spine.tip,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      group: "arms",
    },
  );

  const armR = b.chain(
    "armR",
    catmull([
      [-0.29, 1.36, 0.02],
      [-0.42, 1.2, 0.12],
      [-0.39, 1.03, 0.3],
      [-0.28, 0.89, 0.52],
    ]),
    {
      parent: spine.tip,
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
      [0.18, 0.29, 0.1],
      [0.18, 0.14, 0.17],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.18, 0, 0.2],
      group: "legs",
    },
  );

  const legR = b.chain(
    "legR",
    catmull([
      [-0.17, 0.88, -0.01],
      [-0.19, 0.58, 0.06],
      [-0.18, 0.29, 0.1],
      [-0.18, 0.14, 0.17],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.18, 0, 0.2],
      group: "legs",
    },
  );

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string | ReturnType<typeof paint>,
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
    color: string | ReturnType<typeof paint>,
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

  b.loft(
    [
      { at: [0, 0.91, 0], w: 0.44, h: 0.28 },
      { at: [0, 1.08, 0.01], w: 0.53, h: 0.35 },
      { at: [0, 1.29, 0.025], w: 0.62, h: 0.27 },
      { at: [0, 1.4, 0.025], w: 0.48, h: 0.22 },
    ],
    {
      bone: spine,
      color: CLOTH_PAINT,
      section: "box",
      name: "torso",
    },
  );

  box("tunicHem", [0.5, 0.1, 0.3], [0, 0.91, 0.03], CLOTH_PAINT, hips);
  box("tunicChestPanel", [0.32, 0.28, 0.025], [0, 1.27, 0.275], CLOTH_PAINT, spine.tip);

  const beltPath = catmull(
    [
      [-0.28, 1.075, 0],
      [0, 1.075, 0.225],
      [0.28, 1.075, 0],
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
      [0.25, 0.4],
      [0.18, 0.52],
      [-0.18, 0.52],
      [-0.25, 0.4],
    ],
    {
      name: "apron",
      at: [0, 0.84, 0.285],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: APRON_PAINT,
      bone: spine.joints[0],
    },
  );

  rod("apronTopSeam", [-0.22, 1.34, 0.31], [0.22, 1.34, 0.31], 0.012, APRON_LIGHT, spine.tip);
  rod("apronLeftSeam", [-0.25, 0.86, 0.31], [-0.18, 1.34, 0.31], 0.009, APRON_LIGHT, spine.joints[0]);
  rod("apronRightSeam", [0.25, 0.86, 0.31], [0.18, 1.34, 0.31], 0.009, APRON_LIGHT, spine.joints[0]);
  rod("apronBottomSeam", [-0.26, 0.86, 0.31], [0.26, 0.86, 0.31], 0.012, LEATHER_LIGHT, spine.joints[0]);

  rod("apronStrapL", [0.23, 1.39, 0.16], [0.13, 1.16, 0.305], 0.022, LEATHER_LIGHT, spine.tip);
  rod("apronStrapR", [-0.23, 1.39, 0.16], [-0.13, 1.16, 0.305], 0.022, LEATHER_LIGHT, spine.tip);
  for (const s of [-1, 1]) {
    box(`strapRivet${s}`, [0.035, 0.035, 0.012], [s * 0.205, 1.35, 0.185], BRASS, spine.tip);
  }

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
    box(`boot${s > 0 ? "L" : "R"}`, [0.22, 0.27, 0.37], [s * 0.18, 0.135, 0.2], LEATHER, legBone);
    box(`bootToe${s}`, [0.23, 0.13, 0.12], [s * 0.18, 0.11, 0.355], LEATHER_LIGHT, legBone);
    box(`bootSole${s}`, [0.245, 0.045, 0.39], [s * 0.18, 0.022, 0.2], IRON_DARK, legBone);
    box(`bootStrap${s}`, [0.23, 0.045, 0.045], [s * 0.18, 0.18, 0.325], LEATHER_LIGHT, legBone);
    box(`bootStrapBuckle${s}`, [0.055, 0.065, 0.018], [s * 0.25, 0.18, 0.35], BRASS, legBone);
    cylinder(`bootRivetOuter${s}`, 0.015, 0.02, [s * 0.275, 0.18, 0.33], BRASS, legBone, [1, 0, 0], 8);
  }

  b.sweep(armL, (t) => 0.095 - 0.026 * t, {
    color: CLOTH_PAINT,
    name: "sleeveL",
    section: { ngon: 7 },
  });
  b.sweep(armR, (t) => 0.095 - 0.026 * t, {
    color: CLOTH_PAINT,
    name: "sleeveR",
    section: { ngon: 7 },
  });

  for (const s of [-1, 1]) {
    const armBone = s > 0 ? armL : armR;
    box(`shoulderCloth${s}`, [0.22, 0.18, 0.24], [s * 0.32, 1.34, 0.03], CLOTH_PAINT, armBone);
    b.sweep(
      catmull([
        [s * 0.37, 1.19, 0.12],
        [s * 0.41, 1.08, 0.23],
        [s * 0.38, 1, 0.33],
      ]),
      0.108,
      { color: CLOTH_PAINT, bone: armBone, name: `sleevePanel${s}` },
    );
    rod(`cuff${s}`, [s * 0.34, 0.965, 0.38], [s * 0.31, 0.905, 0.48], 0.041, LEATHER, armBone);
    sphere(`hand${s}`, [s * 0.28, 0.885, 0.515], [0.105, 0.11, 0.105], SKIN, armBone);
    sphere(`thumb${s}`, [s * 0.205, 0.87, 0.5], [0.045, 0.06, 0.055], SKIN_LIGHT, armBone);
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

  for (const s of [-1, 1]) {
    sphere(`pauldronBase${s}`, [s * 0.35, 1.405, 0.025], [0.18, 0.11, 0.18], IRON, spine.tip);
    box(`pauldronPlate${s}`, [0.22, 0.045, 0.2], [s * 0.35, 1.47, 0.02], IRON_LIGHT, spine.tip);
    rod(`pauldronRim${s}`, [s * 0.25, 1.46, 0.1], [s * 0.45, 1.46, 0.1], 0.014, BRASS, spine.tip);
    for (let i = 0; i < 3; i++) {
      sphere(`pauldronRivet${s}_${i}`, [s * (0.29 + i * 0.06), 1.48, 0.105], [0.018, 0.018, 0.012], BRASS_LIGHT, spine.tip, 7);
    }
  }

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
    sphere(`iris${s}`, [s * 0.105, 1.702, 0.36], [0.041, 0.052, 0.01], EYE_GREEN, head, 9);
    sphere(`pupil${s}`, [s * 0.105, 1.702, 0.369], [0.017, 0.036, 0.006], INK, head, 8);
    sphere(`eyeGlint${s}`, [s * 0.09, 1.728, 0.377], [0.009, 0.012, 0.004], "#ffffff", head, 6);
    rod(`brow${s}`, [s * 0.17, 1.79, 0.325], [s * 0.045, 1.775, 0.35], 0.023, BEARD, head);
    rod(`eyeLower${s}`, [s * 0.165, 1.672, 0.354], [s * 0.052, 1.668, 0.37], 0.009, SKIN_SHADOW, head);
  }

  b.sweep(
    catmull([
      [0, 1.54, 0.22],
      [0, 1.51, 0.31],
      [0, 1.53, 0.4],
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
      [0.11, -0.1],
      [0.055, -0.24],
      [0, -0.32, "sharp"],
      [-0.055, -0.24],
      [-0.11, -0.1],
      [-0.19, 0.045],
    ],
    {
      name: "beard",
      at: [0, 1.5, 0.34],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.085,
      bevel: 0.012,
      color: BEARD_PAINT,
      bone: head,
    },
  );

  for (const s of [-1, 1]) {
    sphere(`beardCheek${s}`, [s * 0.195, 1.54, 0.325], [0.105, 0.16, 0.075], BEARD_PAINT, head);
    sphere(`beardFlare${s}`, [s * 0.205, 1.43, 0.345], [0.09, 0.16, 0.065], BEARD_PAINT, head);
    rod(`beardEdge${s}`, [s * 0.22, 1.61, 0.39], [s * 0.17, 1.34, 0.405], 0.018, BEARD_LIGHT, head);
  }

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
        color: BEARD_PAINT,
        bone: head,
        name: `mustache${s}`,
        caps: { start: "round", end: "point" },
      },
    );
  }

  for (const s of [-1, 1]) {
    const braid = catmull([
      [s * 0.16, 1.49, 0.36],
      [s * 0.2, 1.38, 0.38],
      [s * 0.21, 1.25, 0.37],
      [s * 0.17, 1.13, 0.34],
    ]);
    b.sweep(braid, (t) => 0.043 - t * 0.018, {
      color: BEARD_PAINT,
      bone: head,
      name: `braid${s}`,
      section: { ngon: 6 },
    });
    b.along(braid, 5, (at) => {
      sphere(`braidBead${s}_${at.t.toFixed(2)}`, [at.at.x, at.at.y, at.at.z], [0.052, 0.025, 0.052], HAIR_LIGHT, head, 7);
    });
    sphere(`braidTip${s}`, [s * 0.17, 1.105, 0.34], [0.05, 0.055, 0.05], BRASS, head, 8);
  }

  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.255, 0.045],
      [0.245, 0.095],
      [0.205, 0.15],
      [0.12, 0.19],
      [0, 0.2],
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
      [-0.22, 1.8, 0.2],
      [-0.16, 1.84, 0.29],
      [0, 1.87, 0.31],
      [0.16, 1.84, 0.29],
      [0.22, 1.8, 0.2],
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
      [-0.08, 0.1],
      [0, 0.18, "sharp"],
      [0.08, 0.1],
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

  box("anvilBase", [0.52, 0.28, 0.34], [0, 0.14, 0.82], ANVIL, hips);
  box("anvilFootFront", [0.2, 0.18, 0.18], [-0.19, 0.09, 0.68], ANVIL_LIGHT, hips);
  box("anvilFootFrontR", [0.2, 0.18, 0.18], [0.19, 0.09, 0.68], ANVIL_LIGHT, hips);
  box("anvilFootBack", [0.2, 0.18, 0.18], [-0.19, 0.09, 0.96], ANVIL, hips);
  box("anvilFootBackR", [0.2, 0.18, 0.18], [0.19, 0.09, 0.96], ANVIL, hips);

  b.frustumBox(
    [0, 0.3, 0.82],
    [0, 0.67, 0.82],
    [0.27, 0.3],
    [0.19, 0.22],
    { name: "anvilBody", color: ANVIL, bone: hips, section: { ngon: 6 } },
  );

  box("anvilShoulder", [0.55, 0.16, 0.34], [0, 0.7, 0.82], ANVIL_LIGHT, hips);
  box("anvilTop", [0.68, 0.13, 0.34], [0, 0.81, 0.82], ANVIL_PAINT, hips);
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

  for (const x of [-0.2, 0.2]) {
    sphere(`anvilFrontRivet${x}`, [x, 0.46, 0.66], [0.027, 0.027, 0.018], BRASS, hips, 7);
    sphere(`anvilFrontRivetTop${x}`, [x, 0.59, 0.66], [0.027, 0.027, 0.018], BRASS_LIGHT, hips, 7);
  }

  rod("hammerShaft", [-0.28, 0.88, 0.52], [-0.29, 1.29, 0.56], 0.025, WOOD, armR.tip);
  rod("hammerShaftHighlight", [-0.295, 0.9, 0.545], [-0.3, 1.28, 0.585], 0.008, WOOD_LIGHT, armR.tip);
  box("hammerHead", [0.34, 0.13, 0.16], [-0.29, 1.34, 0.57], IRON, armR.tip);
  box("hammerFaceL", [0.075, 0.18, 0.19], [-0.47, 1.34, 0.57], IRON_LIGHT, armR.tip);
  box("hammerFaceR", [0.075, 0.18, 0.19], [-0.11, 1.34, 0.57], IRON_DARK, armR.tip);
  cylinder("hammerCollar", 0.044, 0.055, [-0.29, 1.275, 0.56], BRASS, armR.tip, [0, 1, 0], 8);

  rod("tongsA", [0.28, 0.88, 0.52], [0.08, 0.86, 0.91], 0.014, IRON_LIGHT, armL.tip);
  rod("tongsB", [0.25, 0.9, 0.54], [0.06, 0.84, 0.91], 0.014, IRON, armL.tip);
  rod("tongsJawA", [0.08, 0.86, 0.91], [0.02, 0.82, 1.02], 0.012, IRON_LIGHT, armL.tip);
  rod("tongsJawB", [0.06, 0.84, 0.91], [-0.015, 0.82, 1.02], 0.012, IRON, armL.tip);
  sphere("tongsPivot", [0.07, 0.85, 0.91], [0.032, 0.032, 0.032], BRASS, armL.tip, 8);
  rod("tongsGripWrap1", [0.255, 0.88, 0.53], [0.285, 0.91, 0.56], 0.034, LEATHER_LIGHT, armL.tip);
  rod("tongsGripWrap2", [0.27, 0.895, 0.55], [0.3, 0.925, 0.58], 0.009, BRASS, armL.tip);

  box("neckCloth", [0.31, 0.18, 0.24], [0, 1.43, 0.055], CLOTH_PAINT, neck.joints[0]);
  box("collarFront", [0.27, 0.07, 0.04], [0, 1.49, 0.245], LEATHER, neck.joints[0]);

  for (const s of [-1, 1]) {
    sphere(`hairTuft${s}`, [s * 0.245, 1.82, 0.12], [0.075, 0.12, 0.09], HAIR_LIGHT, head, 8);
    box(`elbowGuard${s}`, [0.13, 0.1, 0.12], [s * 0.4, 1.16, 0.18], LEATHER, s > 0 ? armL : armR);
    sphere(`handKnuckle${s}`, [s * 0.28, 0.93, 0.57], [0.08, 0.05, 0.035], SKIN_LIGHT, s > 0 ? armL : armR, 8);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addForgeSparks(b: Builder) {
  const bone = "hips";
  const HOT_WHITE = "#fff7c4";
  const HOT_YELLOW = "#ffd447";
  const HOT_ORANGE = "#ff6d22";

  type P3 = [number, number, number];
  type Rot = [number, number, number];

  const anchor: P3 = [0, 0.98, 1.12];

  const flat = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: P3,
    rotation?: Rot,
    scale?: P3,
  ) =>
    b.part(geometry, color, {
      name: `s21_${name}`,
      bone,
      at,
      rotation,
      scale,
    });

  const hotPart = (
    name: string,
    geometry: THREE.BufferGeometry,
    color: string,
    at: P3,
    rotation?: Rot,
    scale?: P3,
    strength = 1.6,
  ) => glow(flat(name, geometry, color, at, rotation, scale), strength);

  const hotRod = (
    name: string,
    a: P3,
    c: P3,
    radius: number,
    color: string,
    strength = 1.5,
  ) =>
    glow(
      b.rod(a, c, radius, {
        name: `s21_${name}`,
        bone,
        color,
        caps: "round",
      }),
      strength,
    );

  const hotSpike = (
    name: string,
    base: P3,
    direction: P3,
    length: number,
    radius: number,
    color: string,
    strength = 1.5,
  ) =>
    glow(
      b.spike(base, direction, length, radius, {
        name: `s21_${name}`,
        bone,
        color,
        caps: { start: "round", end: "point" },
      }),
      strength,
    );

  // A low, faceted impact halo makes the burst feel seated on the striking face.
  hotPart(
    "impactRing",
    new THREE.TorusGeometry(0.095, 0.009, 5, 14),
    HOT_ORANGE,
    [anchor[0], anchor[1] - 0.018, anchor[2]],
    [Math.PI / 2, 0, 0],
    undefined,
    1.8,
  );

  hotPart(
    "impactCore",
    new THREE.CylinderGeometry(0.058, 0.07, 0.026, 8),
    HOT_YELLOW,
    [anchor[0], anchor[1] - 0.006, anchor[2]],
    undefined,
    undefined,
    2.0,
  );

  hotPart(
    "impactWhiteCore",
    new THREE.SphereGeometry(1, 8, 5),
    HOT_WHITE,
    [anchor[0], anchor[1] + 0.012, anchor[2]],
    undefined,
    [0.035, 0.022, 0.035],
    2.4,
  );

  // Short angular rays rise from the impact point in a readable fan.
  const rays: {
    base: P3;
    dir: P3;
    length: number;
    radius: number;
    color: string;
    strength: number;
  }[] = [
    { base: [-0.025, 0.995, 1.105], dir: [-0.32, 1, 0.05], length: 0.205, radius: 0.012, color: HOT_ORANGE, strength: 1.45 },
    { base: [0.020, 0.995, 1.115], dir: [0.22, 1, 0.08], length: 0.245, radius: 0.011, color: HOT_YELLOW, strength: 1.7 },
    { base: [-0.045, 0.992, 1.135], dir: [-0.10, 1, 0.30], length: 0.185, radius: 0.010, color: EMBER, strength: 1.5 },
    { base: [0.035, 0.994, 1.145], dir: [0.34, 1, 0.18], length: 0.17, radius: 0.010, color: HOT_ORANGE, strength: 1.4 },
    { base: [-0.015, 0.996, 1.16], dir: [-0.25, 1, -0.18], length: 0.14, radius: 0.009, color: HOT_WHITE, strength: 2.0 },
    { base: [0.010, 0.997, 1.095], dir: [0.12, 1, -0.32], length: 0.16, radius: 0.009, color: GOLD, strength: 1.45 },
    { base: [-0.075, 0.998, 1.12], dir: [-0.55, 1, 0.02], length: 0.105, radius: 0.008, color: HOT_YELLOW, strength: 1.45 },
    { base: [0.075, 0.998, 1.13], dir: [0.55, 1, 0.10], length: 0.12, radius: 0.008, color: EMBER, strength: 1.4 },
    { base: [-0.025, 1.00, 1.085], dir: [-0.20, 1, -0.55], length: 0.115, radius: 0.008, color: GOLD, strength: 1.5 },
    { base: [0.030, 1.00, 1.17], dir: [0.18, 1, 0.55], length: 0.13, radius: 0.008, color: HOT_WHITE, strength: 1.8 },
  ];

  for (let i = 0; i < rays.length; i++) {
    const r = rays[i];
    hotSpike(`burstRay${i}`, r.base, r.dir, r.length, r.radius, r.color, r.strength);
  }

  // A few two-tone streaks add hot cores to the thicker orange rays.
  hotRod(
    "coreStreakL",
    [-0.075, 1.018, 1.125],
    [-0.128, 1.155, 1.131],
    0.0045,
    HOT_WHITE,
    2.0,
  );
  hotRod(
    "coreStreakR",
    [0.068, 1.018, 1.132],
    [0.116, 1.13, 1.146],
    0.0045,
    HOT_YELLOW,
    1.9,
  );
  hotRod(
    "coreStreakBack",
    [-0.02, 1.018, 1.16],
    [-0.043, 1.115, 1.21],
    0.004,
    HOT_WHITE,
    2.0,
  );
  hotRod(
    "sideStreak",
    [0.045, 1.02, 1.095],
    [0.13, 1.078, 1.06],
    0.004,
    GOLD,
    1.55,
  );
  hotRod(
    "lowStreak",
    [-0.08, 1.002, 1.11],
    [-0.17, 1.045, 1.09],
    0.0035,
    HOT_ORANGE,
    1.45,
  );

  // Floating faceted embers sit at the ends and bends of the trails.
  const embers: {
    at: P3;
    scale: P3;
    color: string;
    rotation: Rot;
  }[] = [
    { at: [-0.132, 1.155, 1.132], scale: [0.018, 0.023, 0.016], color: HOT_YELLOW, rotation: [14, 21, 33] },
    { at: [0.118, 1.138, 1.148], scale: [0.014, 0.021, 0.014], color: HOT_WHITE, rotation: [-18, 12, -26] },
    { at: [-0.045, 1.12, 1.215], scale: [0.016, 0.024, 0.014], color: HOT_ORANGE, rotation: [20, -28, 18] },
    { at: [0.132, 1.08, 1.06], scale: [0.015, 0.019, 0.012], color: GOLD, rotation: [-25, 13, 42] },
    { at: [-0.175, 1.05, 1.09], scale: [0.013, 0.018, 0.012], color: HOT_YELLOW, rotation: [16, 30, -15] },
    { at: [0.018, 1.17, 1.215], scale: [0.012, 0.019, 0.012], color: HOT_WHITE, rotation: [32, -11, 22] },
    { at: [-0.11, 1.09, 1.19], scale: [0.011, 0.016, 0.011], color: EMBER, rotation: [-15, 25, 9] },
    { at: [0.17, 1.14, 1.17], scale: [0.012, 0.017, 0.010], color: HOT_ORANGE, rotation: [22, 14, -34] },
  ];

  for (let i = 0; i < embers.length; i++) {
    const e = embers[i];
    hotPart(
      `emberShard${i}`,
      new THREE.BoxGeometry(1, 1, 1),
      e.color,
      e.at,
      e.rotation,
      e.scale,
      e.color === HOT_WHITE ? 2.1 : 1.5,
    );
  }

  // Tiny round embers give the cluster a few softer punctuation points.
  const roundEmbers: { at: P3; radius: number; color: string }[] = [
    { at: [-0.095, 1.075, 1.155], radius: 0.012, color: HOT_YELLOW },
    { at: [0.090, 1.105, 1.095], radius: 0.010, color: HOT_WHITE },
    { at: [-0.025, 1.135, 1.205], radius: 0.009, color: HOT_ORANGE },
    { at: [0.155, 1.055, 1.115], radius: 0.008, color: GOLD },
    { at: [-0.16, 1.12, 1.065], radius: 0.008, color: EMBER },
    { at: [0.045, 1.21, 1.18], radius: 0.007, color: HOT_YELLOW },
  ];

  for (let i = 0; i < roundEmbers.length; i++) {
    const e = roundEmbers[i];
    hotPart(
      `roundEmber${i}`,
      new THREE.SphereGeometry(1, 7, 5),
      e.color,
      e.at,
      undefined,
      [e.radius, e.radius * 1.15, e.radius],
      e.color === HOT_WHITE ? 2.0 : 1.45,
    );
  }

  // Reusable angular star flash outline, kept as a chunky low-poly silhouette.
  const starOutline = (radius: number, inner: number): [number, number, "sharp"][] => {
    const points: [number, number, "sharp"][] = [];
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : inner;
      points.push([Math.cos(angle) * r, Math.sin(angle) * r, "sharp"]);
    }
    return points;
  };

  const star = (
    name: string,
    at: P3,
    radius: number,
    inner: number,
    color: string,
    rotation: Rot,
    strength: number,
  ) =>
    glow(
      b.extrude(starOutline(radius, inner), {
        name: `s21_${name}`,
        bone,
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        color,
      }),
      strength,
    );

  star("starFlashCenter", [0.005, 1.115, 1.105], 0.058, 0.017, HOT_WHITE, [0, 0, 5], 2.2);
  star("starFlashLeft", [-0.17, 1.175, 1.105], 0.043, 0.013, HOT_YELLOW, [0, 0, -13], 1.8);
  star("starFlashRight", [0.18, 1.075, 1.18], 0.050, 0.015, HOT_ORANGE, [0, 0, 18], 1.65);

  // Narrow cross-shaped glints layered over the star centers make the brightest sparks read at a distance.
  hotRod(
    "centerGlintVertical",
    [0.005, 1.065, 1.108],
    [0.005, 1.165, 1.108],
    0.004,
    HOT_WHITE,
    2.2,
  );
  hotRod(
    "centerGlintHorizontal",
    [-0.045, 1.115, 1.108],
    [0.055, 1.115, 1.108],
    0.004,
    HOT_WHITE,
    2.2,
  );
  hotRod(
    "leftGlint",
    [-0.202, 1.175, 1.105],
    [-0.138, 1.175, 1.105],
    0.003,
    HOT_WHITE,
    1.9,
  );
  hotRod(
    "rightGlint",
    [0.18, 1.038, 1.18],
    [0.18, 1.112, 1.18],
    0.003,
    HOT_YELLOW,
    1.75,
  );

  // Three small faceted hot fragments hover between the rays, adding depth without reaching the face.
  hotPart(
    "upperChunk",
    new THREE.TetrahedronGeometry(0.018, 0),
    HOT_ORANGE,
    [-0.075, 1.245, 1.155],
    [0.3, 0.4, 0.1],
    undefined,
    1.55,
  );
  hotPart(
    "upperChunkBright",
    new THREE.OctahedronGeometry(0.014, 0),
    HOT_WHITE,
    [0.075, 1.215, 1.10],
    [0.4, 0.1, 0.5],
    undefined,
    2.0,
  );
  hotPart(
    "upperChunkGold",
    new THREE.TetrahedronGeometry(0.015, 0),
    GOLD,
    [0.02, 1.265, 1.18],
    [0.2, 0.6, 0.2],
    undefined,
    1.55,
  );
}
    return addForgeSparks;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addHammerRunes(b: Builder) {
  const hammerBone = "handR";
  const chestBone = "chest";

  const part = (
    name: string,
    geometry: THREE.BufferGeometry,
    at: [number, number, number],
    color: string,
    bone: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      name: `s22_${name}`,
      at,
      bone,
      rotation,
    });

  const box = (
    name: string,
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: string,
    rotation?: [number, number, number],
  ) => part(name, new THREE.BoxGeometry(size[0], size[1], size[2]), at, color, bone, rotation);

  const sphere = (
    name: string,
    radius: number,
    color: string,
    at: [number, number, number],
    bone: string,
    scale: [number, number, number] = [1, 1, 1],
  ) => {
    const p = part(
      name,
      new THREE.SphereGeometry(radius, 8, 6),
      at,
      color,
      bone,
    );
    p.mesh.scale.set(scale[0], scale[1], scale[2]);
    return p;
  };

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    bone: string,
  ) => b.rod(a, c, radius, { name: `s22_${name}`, color, bone });

  const octagon = (rx: number, ry: number): [number, number, "sharp"][] =>
    Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      return [Math.cos(a) * rx, Math.sin(a) * ry, "sharp"];
    });

  // ---------------------------------------------------------------------------------------------------------------
  // HAMMER RUNES
  //
  // The hammer's broad front face is rebuilt as a dark inset plate. It remains within the clear hammer-head room
  // and gives the glowing glyphs a clean, graphic silhouette.

  box(
    "hammerFrontInset",
    [0.285, 0.094, 0.012],
    IRON_DARK,
    [-0.29, 1.34, 0.658],
    hammerBone,
  );

  box(
    "hammerFrontTopTrim",
    [0.29, 0.013, 0.016],
    BRASS,
    [-0.29, 1.393, 0.66],
    hammerBone,
  );

  box(
    "hammerFrontBottomTrim",
    [0.29, 0.013, 0.016],
    BRASS,
    [-0.29, 1.287, 0.66],
    hammerBone,
  );

  // Three broad, deliberately angular forge glyphs.
  const runeA = b.extrude(
    [
      [-0.020, -0.034, "sharp"],
      [0.006, -0.034, "sharp"],
      [0.018, -0.006, "sharp"],
      [0.006, 0.008, "sharp"],
      [0.020, 0.034, "sharp"],
      [-0.006, 0.034, "sharp"],
      [-0.018, 0.008, "sharp"],
      [-0.006, -0.006, "sharp"],
    ],
    {
      name: "hammerRuneLeft",
      at: [-0.388, 1.34, 0.669],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: EMBER,
      bone: hammerBone,
    },
  );
  glow(runeA, 2.4);

  const runeB = b.extrude(
    [
      [-0.026, -0.034, "sharp"],
      [0.026, -0.034, "sharp"],
      [0.026, -0.010, "sharp"],
      [0.006, -0.010, "sharp"],
      [0.006, 0.010, "sharp"],
      [0.026, 0.010, "sharp"],
      [0.026, 0.034, "sharp"],
      [-0.026, 0.034, "sharp"],
      [-0.026, 0.010, "sharp"],
      [-0.006, 0.010, "sharp"],
      [-0.006, -0.010, "sharp"],
      [-0.026, -0.010, "sharp"],
    ],
    {
      name: "hammerRuneCenter",
      at: [-0.29, 1.34, 0.67],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: EMBER,
      bone: hammerBone,
    },
  );
  glow(runeB, 2.4);

  const runeC = b.extrude(
    [
      [-0.020, -0.034, "sharp"],
      [0.006, -0.034, "sharp"],
      [0.018, -0.006, "sharp"],
      [0.006, 0.008, "sharp"],
      [0.020, 0.034, "sharp"],
      [-0.006, 0.034, "sharp"],
      [-0.018, 0.008, "sharp"],
      [-0.006, -0.006, "sharp"],
    ],
    {
      name: "hammerRuneRight",
      at: [-0.192, 1.34, 0.669],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: EMBER,
      bone: hammerBone,
    },
  );
  glow(runeC, 2.4);

  // Small inset gold cores make the orange marks read as engraved magical metal rather than flat decals.
  const runeCoreL = box(
    "runeLeftCore",
    [0.010, 0.033, 0.004],
    GOLD,
    [-0.388, 1.34, 0.676],
    hammerBone,
    [0, 0, 42],
  );
  const runeCoreR = box(
    "runeRightCore",
    [0.010, 0.033, 0.004],
    GOLD,
    [-0.192, 1.34, 0.676],
    hammerBone,
    [0, 0, -42],
  );
  glow(runeCoreL, 1.2);
  glow(runeCoreR, 1.2);

  // Four chunky brass rivets sit outside the glyph field.
  for (const x of [-0.414, -0.166]) {
    for (const y of [1.304, 1.376]) {
      const rivet = sphere(
        `hammerRivet_${x}_${y}`,
        0.013,
        BRASS_LIGHT,
        [x, y, 0.678],
        hammerBone,
        [1, 1, 0.55],
      );
      glow(rivet, 0.55);
    }
  }

  // A forged brass collar, plus two narrow raised bands, locks the wooden haft into the hammer head.
  part(
    "hammerCollarMain",
    new THREE.CylinderGeometry(0.050, 0.050, 0.044, 8),
    [-0.29, 1.268, 0.56],
    BRASS,
    hammerBone,
  );
  part(
    "hammerCollarUpperBand",
    new THREE.CylinderGeometry(0.055, 0.055, 0.010, 8),
    [-0.29, 1.294, 0.56],
    GOLD,
    hammerBone,
  );
  part(
    "hammerCollarLowerBand",
    new THREE.CylinderGeometry(0.053, 0.053, 0.010, 8),
    [-0.29, 1.242, 0.56],
    BRASS_LIGHT,
    hammerBone,
  );
  sphere(
    "hammerCollarRivet",
    0.010,
    GOLD,
    [-0.337, 1.271, 0.56],
    hammerBone,
    [0.75, 1, 0.65],
  );

  // ---------------------------------------------------------------------------------------------------------------
  // BELT BUCKLE
  //
  // A raised octagonal brass plate, dark inset, segmented gold rim, and a tiny crossed-hammers emblem.

  b.extrude(octagon(0.108, 0.078), {
    name: "buckleOuterForging",
    at: [0, 1.07, 0.316],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.020,
    bevel: 0.004,
    color: BRASS,
    bone: chestBone,
  });

  b.extrude(octagon(0.068, 0.043), {
    name: "buckleDarkInset",
    at: [0, 1.07, 0.330],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.010,
    bevel: 0.002,
    color: IRON_DARK,
    bone: chestBone,
  });

  // Raised segmented rim. The bars follow the eight sides of the octagon, producing a forged, layered edge.
  const rimRx = 0.091;
  const rimRy = 0.062;
  const rimPts = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return new THREE.Vector2(Math.cos(a) * rimRx, Math.sin(a) * rimRy);
  });

  for (let i = 0; i < rimPts.length; i++) {
    const a = rimPts[i];
    const c = rimPts[(i + 1) % rimPts.length];
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const length = Math.sqrt(dx * dx + dy * dy) + 0.012;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const mx = (a.x + c.x) * 0.5;
    const my = (a.y + c.y) * 0.5;

    box(
      `buckleRimSegment${i}`,
      [length, 0.021, 0.016],
      [mx, 1.07 + my, 0.344],
      i % 2 === 0 ? GOLD : BRASS_LIGHT,
      chestBone,
      [0, 0, angle],
    );
  }

  // Four small rim studs reinforce the corners without obscuring the emblem.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    sphere(
      `buckleCornerStud${i}`,
      0.010,
      BRASS_LIGHT,
      [Math.cos(a) * 0.088, 1.07 + Math.sin(a) * 0.060, 0.356],
      chestBone,
      [1, 1, 0.6],
    );
  }

  // Crossed-hammers emblem in the dark center.
  rod(
    "buckleHammerHandleA",
    [-0.038, 1.040, 0.354],
    [0.038, 1.100, 0.354],
    0.006,
    GOLD,
    chestBone,
  );
  rod(
    "buckleHammerHandleB",
    [-0.038, 1.100, 0.354],
    [0.038, 1.040, 0.354],
    0.006,
    GOLD,
    chestBone,
  );

  box(
    "buckleHammerHeadA",
    [0.030, 0.010, 0.010],
    [0.040, 1.100, 0.358],
    BRASS_LIGHT,
    chestBone,
    [0, 0, 38],
  );
  box(
    "buckleHammerHeadB",
    [0.030, 0.010, 0.010],
    [-0.040, 1.100, 0.358],
    BRASS_LIGHT,
    chestBone,
    [0, 0, -38],
  );

  // Tiny dark center rivet and two side-mounted buckle rivets give the emblem depth.
  sphere(
    "buckleEmblemCenter",
    0.008,
    IRON,
    [0, 1.07, 0.361],
    chestBone,
    [1, 1, 0.45],
  );
  sphere(
    "buckleSideRivetL",
    0.014,
    BRASS_LIGHT,
    [-0.094, 1.07, 0.350],
    chestBone,
    [0.72, 1, 0.55],
  );
  sphere(
    "buckleSideRivetR",
    0.014,
    BRASS_LIGHT,
    [0.094, 1.07, 0.350],
    chestBone,
    [0.72, 1, 0.55],
  );

  // Short leather keeper tabs visibly anchor the buckle to the belt.
  box(
    "buckleKeeperL",
    [0.040, 0.112, 0.024],
    [-0.125, 1.07, 0.305],
    LEATHER_LIGHT,
    chestBone,
  );
  box(
    "buckleKeeperR",
    [0.040, 0.112, 0.024],
    [0.125, 1.07, 0.305],
    LEATHER_LIGHT,
    chestBone,
  );
  sphere(
    "buckleKeeperStudL",
    0.009,
    BRASS,
    [-0.125, 1.107, 0.322],
    chestBone,
    [1, 1, 0.55],
  );
  sphere(
    "buckleKeeperStudR",
    0.009,
    BRASS,
    [0.125, 1.107, 0.322],
    chestBone,
    [1, 1, 0.55],
  );
}
    return addHammerRunes;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addShoulderPauldrons(b: Builder) {
  const IRON_PAINT = panelled(metal("iron", { tarnish: 0.48, polish: 0.22, seed: 23 }), {
    size: 0.075,
    aspect: 0.72,
    rivets: 0.035,
    seam: "#17191d",
  });
  const BRASS_PAINT = metal("brass", { tarnish: 0.22, polish: 0.62, seed: 24 });

  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M16 12 L27 23 L21 29 L10 18 Z" fill="#d9a63b" stroke="#21171a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M27 23 L49 45" stroke="#d9a63b" stroke-width="7" stroke-linecap="round"/>
      <path d="M42 39 L54 27 L58 31 L47 44 Z" fill="#d9a63b" stroke="#21171a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M13 49 L51 11" stroke="#ee6a2c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#21171a" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );

  const plate = (
    name: string,
    outline: [number, number, ...any][],
    at: [number, number, number],
    color: any,
    thickness: number,
  ) =>
    b.extrude(outline, {
      name,
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: Math.min(thickness * 0.3, 0.008),
      smoothing: 1,
      color,
      bone: "chest",
    });

  const rivet = (name: string, at: [number, number, number], large = false) => {
    b.part(
      new THREE.SphereGeometry(large ? 0.022 : 0.017, 8, 5),
      large ? BRASS_LIGHT : BRASS,
      {
        name,
        at,
        bone: "chest",
        scale: [1, 0.72, 0.62],
      },
    );
    b.part(
      new THREE.TorusGeometry(large ? 0.025 : 0.020, 0.0035, 5, 8),
      "#704619",
      {
        name: `${name}Socket`,
        at: [at[0], at[1], at[2] + 0.002],
        bone: "chest",
        dir: [0, 0, 1],
        axis: "z",
      },
    );
  };

  const trim = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.009,
  ) =>
    b.rod(a, c, radius, {
      name,
      color: BRASS_PAINT,
      bone: "chest",
      caps: "round",
    });

  const sides = [
    {
      s: 1,
      x: 0.355,
      y: 1.385,
      radius: 0.166,
      width: 0.305,
      height: 0.17,
      frontZ: 0.166,
      lift: 0.012,
    },
    {
      s: -1,
      x: -0.345,
      y: 1.395,
      radius: 0.153,
      width: 0.282,
      height: 0.155,
      frontZ: 0.158,
      lift: -0.004,
    },
  ];

  for (const side of sides) {
    const { s, x, y, radius, width, height, frontZ, lift } = side;

    // Low-poly domed shoulder shell, with a forged brass collar seated around its lower edge.
    b.lathe(
      [
        [0, 0],
        [radius * 0.83, 0],
        [radius, 0.028],
        [radius * 1.02, 0.065],
        [radius * 0.91, 0.112],
        [radius * 0.66, 0.145 + lift],
        [radius * 0.28, 0.162 + lift],
        [0, 0.148 + lift],
      ],
      {
        name: `s23PauldronShell${s}`,
        at: [x, y - 0.045, 0.025],
        axis: [0, 1, 0],
        segments: 10,
        smoothing: 0,
        color: IRON_PAINT,
        bone: "chest",
      },
    );

    b.part(
      new THREE.TorusGeometry(radius * 0.88, 0.010, 6, 12),
      BRASS_PAINT,
      {
        name: `s23PauldronCollar${s}`,
        at: [x, y - 0.045, 0.025],
        bone: "chest",
        dir: [0, 1, 0],
        axis: "z",
      },
    );

    // Irregular outer plate: the uneven top edge gives the armor a battered silhouette.
    const outer: [number, number, ...any][] = [
      [-width * 0.52, -0.060],
      [-width * 0.22, -0.076],
      [width * 0.23, -height * 0.44],
      [width * 0.51, -0.014],
      [width * 0.45, height * 0.30],
      [width * 0.25, height * 0.54, "sharp"],
      [-width * 0.08, height * 0.47],
      [-width * 0.36, height * 0.55],
      [-width * 0.53, height * 0.16],
    ];
    plate(
      `s23OuterShoulderPlate${s}`,
      outer,
      [x, y + 0.005, frontZ],
      IRON_PAINT,
      0.029,
    );

    // A raised inner lamella sits above the broad plate, like overlapping Warcraft armor scales.
    const innerW = width * 0.66;
    const innerH = height * 0.63;
    const inner: [number, number, ...any][] = [
      [-innerW * 0.48, -innerH * 0.44],
      [innerW * 0.38, -innerH * 0.43],
      [innerW * 0.50, -innerH * 0.06],
      [innerW * 0.30, innerH * 0.43],
      [-innerW * 0.12, innerH * 0.52],
      [-innerW * 0.49, innerH * 0.20],
    ];
    plate(
      `s23InnerShoulderLamella${s}`,
      inner,
      [x + s * 0.004, y + 0.016, frontZ + 0.022],
      "#59616a",
      0.018,
    );

    // Narrow brass edge strips emphasize the plate's silhouette without hiding the iron.
    trim(
      `s23PauldronBottomTrim${s}`,
      [x - width * 0.43, y - 0.055, frontZ + 0.022],
      [x + width * 0.40, y - 0.060, frontZ + 0.022],
      0.010,
    );
    trim(
      `s23PauldronTopTrim${s}`,
      [x - width * 0.34, y + height * 0.42, frontZ + 0.024],
      [x + width * 0.28, y + height * 0.39, frontZ + 0.024],
      0.008,
    );

    // A dark outer flange makes each shoulder read as a separate heavy armor assembly.
    b.part(
      new THREE.BoxGeometry(0.035, height * 0.58, 0.13),
      "#17191d",
      {
        name: `s23OuterShoulderFlange${s}`,
        at: [x + s * width * 0.475, y + 0.008, frontZ - 0.030],
        bone: "chest",
        rotation: [0, 0, s * 0.11],
      },
    );
    b.part(
      new THREE.BoxGeometry(0.020, height * 0.43, 0.08),
      BRASS_PAINT,
      {
        name: `s23OuterShoulderFlangeTrim${s}`,
        at: [x + s * width * 0.495, y + 0.012, frontZ + 0.005],
        bone: "chest",
        rotation: [0, 0, s * 0.11],
      },
    );

    // Four large forged rivets per side, arranged as a deliberately readable diamond.
    const rivetZ = frontZ + 0.048;
    rivet(`s23PauldronRivet${s}_A`, [x - width * 0.34, y - height * 0.22, rivetZ], true);
    rivet(`s23PauldronRivet${s}_B`, [x + width * 0.32, y - height * 0.24, rivetZ], false);
    rivet(`s23PauldronRivet${s}_C`, [x - width * 0.27, y + height * 0.29, rivetZ], false);
    rivet(`s23PauldronRivet${s}_D`, [x + width * 0.28, y + height * 0.27, rivetZ], true);

    // One small impact scar and one brass repair staple on the older, smaller pauldron.
    if (s < 0) {
      trim(
        "s23BatteredShoulderScar",
        [x - 0.055, y + 0.018, frontZ + 0.045],
        [x + 0.025, y + 0.055, frontZ + 0.045],
        0.005,
      );
      trim(
        "s23BatteredShoulderScarCross",
        [x - 0.005, y - 0.005, frontZ + 0.047],
        [x + 0.050, y + 0.067, frontZ + 0.047],
        0.004,
      );
    }

    // A tiny blacksmith emblem gives the flat front plate a focal detail.
    b.part(
      new THREE.PlaneGeometry(0.072, 0.072),
      "#ffffff",
      {
        name: `s23ShoulderHammerEmblem${s}`,
        at: [x + s * 0.004, y + 0.012, frontZ + 0.053],
        bone: "chest",
        dir: [0, 0, 1],
        axis: "z",
        texture: emblem,
      },
    );

    // Small lower hanging plate, layered beneath the main guard and useful against the apron silhouette.
    plate(
      `s23ShoulderLowerLug${s}`,
      [
        [-width * 0.27, -0.045],
        [width * 0.27, -0.045],
        [width * 0.22, 0.045],
        [0, 0.075, "sharp"],
        [-width * 0.22, 0.045],
      ],
      [x, y - height * 0.40, frontZ - 0.015],
      "#292d32",
      0.022,
    );
    trim(
      `s23ShoulderLowerLugTrim${s}`,
      [x - width * 0.21, y - height * 0.39, frontZ + 0.006],
      [x + width * 0.21, y - height * 0.39, frontZ + 0.006],
      0.006,
    );
  }
}
    return addShoulderPauldrons;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addBeardClasps(b: Builder) {
  const head = "head";

  const addBeardClasp = (s: number) => {
    const cx = s * 0.18;
    const cy = 1.24;
    const braidZ = 0.372;

    // A low-profile leather backing keeps the ornament visually seated in the braid.
    b.part(new THREE.BoxGeometry(0.075, 0.085, 0.018), LEATHER, {
      name: `s24BeardClaspBacking${s}`,
      bone: head,
      at: [cx, cy, 0.382],
    });

    // A toroidal brass band wraps around the mostly vertical braid.
    b.part(new THREE.TorusGeometry(0.040, 0.007, 6, 10), BRASS, {
      name: `s24BeardBand${s}`,
      bone: head,
      at: [cx, cy, braidZ],
      dir: [0, 1, 0],
      axis: "z",
    });

    // Faceted front medallion, seated just proud of the beard.
    b.part(new THREE.CylinderGeometry(0.050, 0.046, 0.022, 8), BRASS_LIGHT, {
      name: `s24BeardClasp${s}`,
      bone: head,
      at: [cx, cy, 0.394],
      dir: [0, 0, 1],
    });

    // Dark inset makes the red enamel read as a jewel rather than a flat dot.
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 8), IRON_DARK, {
      name: `s24BeardClaspInset${s}`,
      bone: head,
      at: [cx, cy, 0.410],
      dir: [0, 0, 1],
    });

    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.007, 6), EMBER, {
      name: `s24BeardClaspEnamel${s}`,
      bone: head,
      at: [cx, cy, 0.417],
      dir: [0, 0, 1],
    });

    // Three tiny forged rivets form a triangular motif on each clasp.
    const rivets = [
      [-0.024, -0.020],
      [0.024, -0.020],
      [0, 0.025],
    ] as const;

    rivets.forEach(([dx, dy], i) => {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, {
        name: `s24BeardClaspRivet${s}_${i}`,
        bone: head,
        at: [cx + dx, cy + dy, 0.423],
        scale: [1, 1, 0.45],
      });
    });

    // A short brass tail tab follows the braid below the clasp.
    b.part(new THREE.BoxGeometry(0.045, 0.038, 0.016), BRASS, {
      name: `s24BeardClaspTail${s}`,
      bone: head,
      at: [cx, cy - 0.055, 0.389],
    });
  };

  addBeardClasp(-1);
  addBeardClasp(1);

  // ---------------------------------------------------------------------------------------------------------------
  // Three overlapping iron plates make a short, swept-back forge-cap mohawk.
  // The tallest plate is toward the back, while the progressively shorter front
  // plates create a chunky stepped silhouette instead of thin spikes.

  const crestPlate = (
    index: number,
    z: number,
    width: number,
    height: number,
    color: string,
  ) => {
    const outline: [number, number, "sharp"][] = [
      [-width, 0, "sharp"],
      [width, 0, "sharp"],
      [width * 0.90, height * 0.28, "sharp"],
      [width * 0.66, height * 0.68, "sharp"],
      [width * 0.22, height, "sharp"],
      [-width * 0.38, height * 0.84, "sharp"],
      [-width * 0.78, height * 0.40, "sharp"],
    ];

    b.extrude(outline, {
      name: `s24HelmetCrestPlate${index}`,
      bone: head,
      at: [0, 1.895, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.006,
      color,
    });

    // Brass lower edge catches the light and visually locks the plate to the cap.
    b.rod(
      [-width * 0.82, 1.902, z + 0.021],
      [width * 0.82, 1.902, z + 0.021],
      0.007,
      BRASS,
      {
        name: `s24HelmetCrestLowerRim${index}`,
        bone: head,
      },
    );

    // Two rivets on each lateral edge, plus a central crest stud.
    const studs = [
      [-width * 0.78, 1.935],
      [width * 0.78, 1.935],
      [0, 1.895 + height * 0.74],
    ] as const;

    studs.forEach(([x, y], i) => {
      b.part(new THREE.SphereGeometry(0.011, 6, 4), BRASS_LIGHT, {
        name: `s24HelmetCrestStud${index}_${i}`,
        bone: head,
        at: [x, y, z + 0.024],
        scale: [1, 1, 0.7],
      });
    });
  };

  // Back plate is tallest and sits slightly farther back, producing the swept profile.
  crestPlate(0, -0.018, 0.105, 0.145, IRON_DARK);
  crestPlate(1, 0.043, 0.092, 0.120, IRON);
  crestPlate(2, 0.103, 0.078, 0.095, IRON_LIGHT);

  // A low iron mounting bar grounds the crest into the leather cap.
  b.part(new THREE.BoxGeometry(0.235, 0.042, 0.19), IRON_DARK, {
    name: "s24HelmetCrestMount",
    bone: head,
    at: [0, 1.902, 0.078],
  });

  // Small brass side tabs peek out beneath the layered plates without enlarging the silhouette.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.026, 0.050, 0.045), BRASS, {
      name: `s24HelmetCrestSideTab${s}`,
      bone: head,
      at: [s * 0.115, 1.917, 0.075],
    });
  }
}
    return addBeardClasps;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAnvilRivets(b: Builder) {
  const surface = b.surface(b.root);
  const bone = "hips";

  const hitAt = (p: [number, number, number]) => surface.nearest(p);

  const washer = (
    name: string,
    p: [number, number, number],
    radius: number,
    color: string,
  ) => {
    const hit = hitAt(p);
    return b.stick(
      new THREE.CylinderGeometry(radius, radius * 0.94, 0.018, 10),
      color,
      hit,
      {
        name,
        bone,
        embed: 0.48,
      },
    );
  };

  const roundedRivet = (
    name: string,
    p: [number, number, number],
    radius: number,
  ) => {
    const hit = hitAt(p);
    const outer = hit.moved([0, 0.008, 0]);
    const part = b.stick(
      new THREE.SphereGeometry(1, 9, 6),
      BRASS,
      outer,
      {
        name,
        bone,
        embed: 0.42,
        scale: [radius, radius, radius * 0.76],
      },
    );

    // A tiny warm highlight makes each rivet read as convex forged metal.
    b.stick(
      new THREE.SphereGeometry(1, 6, 4),
      BRASS_LIGHT,
      outer.moved([-radius * 0.28, radius * 0.48, radius * 0.2]),
      {
        name: `${name}Highlight`,
        bone,
        embed: 0.2,
        scale: [radius * 0.22, radius * 0.18, radius * 0.12],
      },
    );
    return part;
  };

  const frontPlate = (
    name: string,
    p: [number, number, number],
    width: number,
    height: number,
  ) => {
    const hit = hitAt(p);
    const plate = b.stick(
      new THREE.BoxGeometry(width, 0.022, height),
      IRON_DARK,
      hit,
      {
        name,
        bone,
        embed: 0.4,
      },
    );

    // Raised inner face gives the simple iron plate a battered, layered edge.
    b.stick(
      new THREE.BoxGeometry(width * 0.68, 0.012, height * 0.72),
      ANVIL_LIGHT,
      hit.moved([0, 0.016, 0]),
      {
        name: `${name}Inset`,
        bone,
        embed: 0.3,
      },
    );
    return plate;
  };

  const sidePlate = (
    name: string,
    p: [number, number, number],
    width: number,
    height: number,
  ) => {
    const hit = hitAt(p);
    const plate = b.stick(
      new THREE.BoxGeometry(width, 0.022, height),
      IRON_DARK,
      hit,
      {
        name,
        bone,
        embed: 0.4,
      },
    );

    b.stick(
      new THREE.BoxGeometry(width * 0.72, 0.012, height * 0.64),
      ANVIL_LIGHT,
      hit.moved([0, 0.016, 0]),
      {
        name: `${name}Inset`,
        bone,
        embed: 0.3,
      },
    );
    return plate;
  };

  // A dark waist rail runs behind the decoration and visually joins the two sides.
  b.rod(
    [-0.245, 0.425, 0.665],
    [0.245, 0.425, 0.665],
    0.009,
    {
      name: "s25AnvilFrontWaistRail",
      color: IRON_DARK,
      bone,
      caps: "round",
    },
  );

  // Four large rounded brass rivets on the front face, arranged as a strong blacksmith
  // maker's plate rather than a random scatter.
  const frontRivets: [number, number, number][] = [
    [-0.18, 0.335, 0.665],
    [0.18, 0.335, 0.665],
    [-0.18, 0.535, 0.665],
    [0.18, 0.535, 0.665],
  ];

  for (let i = 0; i < frontRivets.length; i++) {
    const p = frontRivets[i];
    washer(`s25FrontWasher${i}`, p, 0.042, IRON_DARK);
    roundedRivet(`s25FrontRivet${i}`, p, 0.031);
  }

  // Small vertical iron corner plates sit between the front rivets and carry their
  // own tiny brass fasteners.
  for (const s of [-1, 1]) {
    const x = s * 0.245;
    const p: [number, number, number] = [x, 0.435, 0.665];
    frontPlate(`s25FrontCornerPlate${s}`, p, 0.042, 0.18);

    const upper: [number, number, number] = [x, 0.505, 0.685];
    const lower: [number, number, number] = [x, 0.365, 0.685];
    washer(`s25FrontCornerWasherUpper${s}`, upper, 0.021, IRON_DARK);
    washer(`s25FrontCornerWasherLower${s}`, lower, 0.021, IRON_DARK);
    roundedRivet(`s25FrontCornerRivetUpper${s}`, upper, 0.015);
    roundedRivet(`s25FrontCornerRivetLower${s}`, lower, 0.015);
  }

  // Two rivets on each side of the anvil waist. Their positions are deliberately
  // spread vertically so the side silhouette reads from a three-quarter view.
  for (const s of [-1, 1]) {
    const x = s * 0.285;
    const sideRivets: [number, number, number][] = [
      [x, 0.355, 0.815],
      [x, 0.545, 0.815],
    ];

    for (let i = 0; i < sideRivets.length; i++) {
      const p = sideRivets[i];
      washer(`s25SideWasher${s}_${i}`, p, 0.040, IRON_DARK);
      roundedRivet(`s25SideRivet${s}_${i}`, p, 0.029);
    }

    const platePoint: [number, number, number] = [x, 0.45, 0.815];
    sidePlate(`s25SideCornerPlate${s}`, platePoint, 0.12, 0.045);

    // Two small plate studs reinforce the waist detail without crowding the striking face.
    const studA: [number, number, number] = [x, 0.405, 0.815];
    const studB: [number, number, number] = [x, 0.495, 0.815];
    washer(`s25SidePlateWasherA${s}`, studA, 0.017, IRON_DARK);
    washer(`s25SidePlateWasherB${s}`, studB, 0.017, IRON_DARK);
    roundedRivet(`s25SidePlateRivetA${s}`, studA, 0.012);
    roundedRivet(`s25SidePlateRivetB${s}`, studB, 0.012);
  }

  // Squared iron corner shoes at the lower front corners make the base feel heavy
  // and visually connect the decorative waist to the four-footed silhouette.
  for (const s of [-1, 1]) {
    const p: [number, number, number] = [s * 0.205, 0.285, 0.665];
    const hit = hitAt(p);

    b.stick(
      new THREE.BoxGeometry(0.075, 0.055, 0.025),
      IRON_DARK,
      hit,
      {
        name: `s25BaseCornerShoe${s}`,
        bone,
        embed: 0.36,
      },
    );

    b.stick(
      new THREE.BoxGeometry(0.035, 0.018, 0.012),
      BRASS,
      hit.moved([0, 0.017, 0]),
      {
        name: `s25BaseCornerShoeStud${s}`,
        bone,
        embed: 0.25,
      },
    );
  }
}
    return addAnvilRivets;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTongsGrip(b: Builder) {
  // ---------------------------------------------------------------------------------------------------------------
  // Tongs: a thick leather-wrapped handle, raised spiral stitching, forged bands, and a hanging keeper loop.

  const gripA = new THREE.Vector3(0.27, 0.88, 0.52);
  const gripB = new THREE.Vector3(0.195, 0.865, 0.69);
  const gripAxis = gripB.clone().sub(gripA);
  const gripLength = gripAxis.length();
  const gripDir = gripAxis.clone().normalize();

  b.sweep(
    catmull([
      gripA,
      new THREE.Vector3(0.252, 0.878, 0.565),
      new THREE.Vector3(0.222, 0.872, 0.625),
      gripB,
    ]),
    [0.041, 0.035],
    {
      name: "s26_tongsLeatherGrip",
      bone: "handL",
      color: LEATHER_LIGHT,
      section: { ngon: 8 },
      caps: "round",
    },
  );

  // A raised diagonal wrap gives the grip a clearly hand-made leather texture.
  let wrapSide = new THREE.Vector3(0, 1, 0).cross(gripDir);
  if (wrapSide.lengthSq() < 0.01) wrapSide = new THREE.Vector3(1, 0, 0);
  wrapSide.normalize();

  const wrapPath = spiral(
    gripA.clone().addScaledVector(gripDir, -0.004),
    gripA.clone().addScaledVector(wrapSide, 0.038),
    gripAxis,
    {
      turns: 4.5,
      pitch: gripLength / 4.5,
    },
  );

  b.sweep(wrapPath, 0.0065, {
    name: "s26_tongsLeatherWrap",
    bone: "handL",
    color: APRON_LIGHT,
    section: { ngon: 6 },
    caps: "round",
  });

  for (const [i, t] of [0.20, 0.79].entries()) {
    const p = gripA.clone().lerp(gripB, t);
    b.part(new THREE.TorusGeometry(0.041, 0.007, 6, 12), BRASS, {
      name: `s26_tongsBrassBand${i}`,
      bone: "handL",
      at: p,
      dir: gripDir,
      axis: "z",
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.033, 0.0028, 5, 12), BRASS_LIGHT, {
      name: `s26_tongsBandHighlight${i}`,
      bone: "handL",
      at: p.clone().addScaledVector(gripDir, 0.0015),
      dir: gripDir,
      axis: "z",
      flat: true,
    });
  }

  // The loop hangs below the handle but remains tucked inside the reserved clear area.
  const loopPath = catmull([
    new THREE.Vector3(0.236, 0.852, 0.592),
    new THREE.Vector3(0.222, 0.812, 0.620),
    new THREE.Vector3(0.228, 0.775, 0.600),
    new THREE.Vector3(0.268, 0.775, 0.558),
    new THREE.Vector3(0.291, 0.818, 0.545),
    new THREE.Vector3(0.278, 0.853, 0.565),
  ]);

  b.sweep(loopPath, 0.009, {
    name: "s26_tongsHangingLoop",
    bone: "handL",
    color: APRON_LIGHT,
    section: { ngon: 6 },
    caps: "round",
  });

  for (const [i, p] of [
    [new THREE.Vector3(0.236, 0.852, 0.592), [0.236, 0.852, 0.592]],
    [new THREE.Vector3(0.278, 0.853, 0.565), [0.278, 0.853, 0.565]],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.014, 7, 5), BRASS, {
      name: `s26_tongsLoopRivet${i}${p}`,
      bone: "handL",
      at: p,
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Boot details: mirrored front buckles, side hardware, toe caps, and forged rivets.

  for (const s of [-1, 1]) {
    const footBone = s > 0 ? "footL" : "footR";
    const sideName = s > 0 ? "L" : "R";

    // A dark iron toe shell sits only on the front of the boot, well above the sole.
    b.extrude(
      [
        [-0.095, -0.045],
        [0.095, -0.045],
        [0.105, 0.005],
        [0.085, 0.065],
        [-0.085, 0.065],
        [-0.105, 0.005],
      ],
      {
        name: `s26_ironToeCap${sideName}`,
        bone: footBone,
        at: [s * 0.18, 0.12, 0.414],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.006,
        color: IRON_DARK,
      },
    );

    // A smaller upper plane catches the light and makes the cap read as layered metal.
    b.part(new THREE.BoxGeometry(0.15, 0.025, 0.018), IRON_LIGHT, {
      name: `s26_toeCapRidge${sideName}`,
      bone: footBone,
      at: [s * 0.18, 0.177, 0.426],
      flat: true,
    });

    // Brass studs across the iron toe shell.
    for (const [i, x] of [-0.052, 0.052].entries()) {
      b.part(new THREE.SphereGeometry(0.014, 7, 5), BRASS_LIGHT, {
        name: `s26_toeCapRivet${sideName}${i}`,
        bone: footBone,
        at: [s * (0.18 + x), 0.145, 0.431],
        flat: true,
      });
    }

    // The buckle is on the outer half of the front face, mirrored in both x and ordering.
    const buckleCenterX = s * 0.225;
    const buckleZ = 0.423;
    const buckleY = 0.188;

    // Dark inset beneath the brass frame.
    b.part(new THREE.BoxGeometry(0.088, 0.045, 0.012), IRON_DARK, {
      name: `s26_buckleInset${sideName}`,
      bone: footBone,
      at: [buckleCenterX, buckleY, buckleZ - 0.006],
      flat: true,
    });

    // Four chunky frame bars form a real open buckle rather than a painted rectangle.
    b.part(new THREE.BoxGeometry(0.112, 0.013, 0.020), BRASS, {
      name: `s26_buckleTop${sideName}`,
      bone: footBone,
      at: [buckleCenterX, buckleY + 0.032, buckleZ],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.112, 0.013, 0.020), BRASS, {
      name: `s26_buckleBottom${sideName}`,
      bone: footBone,
      at: [buckleCenterX, buckleY - 0.032, buckleZ],
      flat: true,
    });
    for (const [i, dx] of [-0.050, 0.050].entries()) {
      b.part(new THREE.BoxGeometry(0.013, 0.058, 0.020), BRASS_LIGHT, {
        name: `s26_buckleSide${sideName}${i}`,
        bone: footBone,
        at: [buckleCenterX + dx, buckleY, buckleZ],
        flat: true,
      });
    }

    // A tiny crossed-hammer mark is embossed over the dark inset.
    const emblemZ = buckleZ + 0.013;
    const emblemX = buckleCenterX;
    b.rod(
      [emblemX - 0.018, buckleY - 0.017, emblemZ],
      [emblemX + 0.018, buckleY + 0.017, emblemZ],
      0.004,
      BRASS_LIGHT,
      { name: `s26_buckleEmblemA${sideName}`, bone: footBone },
    );
    b.rod(
      [emblemX + 0.018, buckleY - 0.017, emblemZ],
      [emblemX - 0.018, buckleY + 0.017, emblemZ],
      0.004,
      BRASS_LIGHT,
      { name: `s26_buckleEmblemB${sideName}`, bone: footBone },
    );

    // Outer-side hinge rivets make the buckle feel mounted through the leather.
    const outerX = s * 0.307;
    for (const [i, y] of [0.162, 0.214].entries()) {
      b.part(new THREE.SphereGeometry(0.014, 7, 5), BRASS, {
        name: `s26_buckleOuterRivet${sideName}${i}`,
        bone: footBone,
        at: [outerX, y, 0.350],
        flat: true,
      });
    }

    // A short leather keeper crosses the top of the buckle and visually connects it to the boot strap.
    b.part(new THREE.BoxGeometry(0.026, 0.082, 0.025), LEATHER_LIGHT, {
      name: `s26_buckleKeeper${sideName}`,
      bone: footBone,
      at: [s * 0.255, 0.188, 0.382],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.031, 0.014, 0.029), BRASS, {
      name: `s26_buckleKeeperBand${sideName}`,
      bone: footBone,
      at: [s * 0.255, 0.220, 0.382],
      flat: true,
    });
  }
}
    return addTongsGrip;
  })(),
);
