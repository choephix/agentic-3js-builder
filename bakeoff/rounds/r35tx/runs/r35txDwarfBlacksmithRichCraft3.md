```ts
import * as THREE from "three";
import {
  catmull,
  bezier,
  createBuilder,
  grain,
  limb,
  mottle,
  rng,
  stripes,
  svg,
} from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK, inkLines } from "agentic-3js-builder/kits/toon";
import { gearGeometry, gearTexture, metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "dwarf blacksmith at anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a huge braided beard, leather apron, hammer, tongs, glowing billet, and a faceted iron anvil.",
};

const EYE = animeEye({
  iris: "#65c9ff",
  irisLight: "#bcefff",
  irisDark: "#193a72",
  blush: "#d85c60",
  size: 512,
});

const APRON_SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M64 5 L115 25 L104 77 Q93 108 64 123 Q35 108 24 77 L13 25Z"
      fill="#d79a3d" stroke="#24151a" stroke-width="8" stroke-linejoin="round"/>
    <path d="M64 25 L74 51 L102 53 L80 70 L87 98 L64 82 L41 98 L48 70 L26 53 L54 51Z"
      fill="#6f281f" stroke="#f3c66a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M42 40 L64 31 L86 40" fill="none" stroke="#fff1b0" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const ANVIL_RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 80">
    <path d="M18 18 L36 9 L53 18 L70 9 L91 18 L108 10" fill="none"
      stroke="#d7e8f0" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 28 L24 56 M24 42 L48 42 M48 28 L48 60 M76 27 L76 60 M76 44 L104 44 M104 27 L104 60"
      fill="none" stroke="#86a9b9" stroke-width="5" stroke-linecap="square"/>
    <path d="M17 68 Q64 50 111 68" fill="none" stroke="#e3f5ff" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const HAMMER_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64">
    <path d="M14 48 L45 17 L61 33 L30 55Z" fill="#e3b75f" stroke="#201822" stroke-width="6"/>
    <path d="M50 16 L68 7 L88 27 L78 39Z" fill="#f0cc76" stroke="#201822" stroke-width="6"/>
    <path d="M56 38 L74 56" stroke="#a65b29" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const BEARD_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
    <path d="M16 2 Q30 23 23 47 Q20 64 16 94 Q12 64 9 47 Q2 23 16 2Z"
      fill="#ffffff" stroke="#16131a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M16 12 Q22 33 17 77" fill="none" stroke="#9a9a9a" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const FACE = cel(
  mottle("#dc956e", "#be674f", { size: 0.08, contrast: 1.25, seed: 17 }),
  "#873d3d",
);

const BEARD = cel(
  furEdge(
    mottle("#c9612c", "#8e351f", { size: 0.08, contrast: 1.35, seed: 21 }),
    "#612116",
    {
      axis: [0, 1, 0],
      by: "position",
      level: 1.29,
      teeth: 0.045,
      period: 0.045,
      along: [1, 0, 0],
      ink: "#32171a",
      inkWidth: 0.006,
    },
  ),
  "#4a1717",
);

const BEARD_DARK = cel("#78301e", "#34151a");
const HAIR = cel(
  mottle("#5c2b1e", "#30151a", { size: 0.09, contrast: 1.4, seed: 25 }),
  "#24131a",
);

const SHIRT = cel(
  stripes("#3d5261", "#243342", {
    size: 0.19,
    axis: "y",
    width: 0.24,
    wobble: 0.22,
    seed: 8,
  }),
  "#172230",
);

const TROUSERS = cel(
  stripes("#39444e", "#242d38", {
    size: 0.23,
    axis: "z",
    width: 0.24,
    wobble: 0.16,
    seed: 11,
  }),
  "#171e28",
);

const GLOVE = cel(
  grain("#865533", "#4b2a25", { size: 0.035, axis: "y", seed: 41 }),
  "#2d171a",
);

const LEATHER = cel(
  grain("#754329", "#3c211e", { size: 0.045, axis: "y", seed: 44 }),
  "#281619",
);

const APRON = cel(
  inkLines(
    grain("#9a5c31", "#5d3026", { size: 0.055, axis: "y", seed: 48 }),
    { levels: [0.15], axis: [0, 0, 1], width: 0.055, ink: "#2c171a" },
  ),
  "#3b1d1d",
);

const BOOT = cel(
  grain("#493027", "#24181d", { size: 0.05, axis: "z", seed: 53 }),
  "#17131a",
);

const HAT = cel(
  grain("#4a2d35", "#251824", { size: 0.045, axis: "y", seed: 59 }),
  "#18131e",
);

const WOOD = cel(
  grain("#986039", "#4b291f", { size: 0.05, axis: "y", seed: 62 }),
  "#2b1719",
);

const OLD_IRON = panelled(
  metal("iron", {
    tarnish: 0.72,
    verdigris: 0.12,
    polish: 0.2,
    size: 0.12,
    seed: 70,
  }),
  { size: 0.16, aspect: 0.75, rivets: 0.06 },
);

const DARK_IRON = metal("iron", {
  tarnish: 0.52,
  verdigris: 0.08,
  polish: 0.32,
  size: 0.08,
  seed: 72,
});

const BRASS = metal("brass", {
  tarnish: 0.24,
  verdigris: 0.18,
  polish: 0.58,
  size: 0.07,
  seed: 75,
});

const COPPER = metal("copper", {
  tarnish: 0.3,
  verdigris: 0.24,
  polish: 0.42,
  size: 0.06,
  seed: 78,
});

const STEEL = metal("blued", {
  tarnish: 0.28,
  polish: 0.46,
  size: 0.075,
  seed: 83,
});

const IVORY = cel("#fff0c4", "#b98269");
const NOSE = cel("#c56d56", "#773b43");
const SOOT = "#2a1a20";
const HOT = "#ff6b2a";
const HOT_LIGHT = "#ffd35c";

export default function build() {
  const b = createBuilder({
    name: "dwarf-blacksmith",
    detail: 0.9,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first. The dwarf keeps a sturdy neutral stance, with arms separated and all digits exposed for rigging.

  const hips = b.joint("hips", {
    at: [0, 0.79, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.77, 0],
      [0, 1.00, 0.015],
      [0, 1.22, 0.035],
      [0, 1.36, 0.055],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest", "shoulder"],
      role: "spine",
      group: "body",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.35, 0.06],
      [0, 1.47, 0.085],
      [0, 1.56, 0.12],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckMid", "neckTip"],
      role: "neck",
      group: "body",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.60, 0.14],
    dir: [0, 0, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.475, 0.285],
    aim: [0, 1.42, 0.40],
    role: "jaw",
    group: "face",
  });

  const armLPoints = limb(
    [0.30, 1.285, 0.04],
    [0.37, 0.83, 0.44],
    [0.23, 0.24, 0.18],
    [
      [0.7, -0.2, 1],
      [0.25, 0.05, 1],
    ],
  );

  const armRPoints = limb(
    [-0.30, 1.285, 0.04],
    [-0.37, 0.83, 0.45],
    [0.23, 0.24, 0.18],
    [
      [-0.7, -0.2, 1],
      [-0.25, 0.05, 1],
    ],
  );

  const armL = b.chain("armL", armLPoints, {
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
    group: "limbs",
  });

  const armR = b.chain("armR", armRPoints, {
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
    group: "limbs",
  });

  const legLPoints = limb(
    [0.17, 0.77, 0.005],
    [0.18, 0.13, 0.17],
    [0.28, 0.28, 0.18, 0.13],
    [
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, 1],
    ],
    { sole: [0, 0, 1] },
  );

  const legRPoints = limb(
    [-0.17, 0.77, 0.005],
    [-0.18, 0.13, 0.17],
    [0.28, 0.28, 0.18, 0.13],
    [
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, 1],
    ],
    { sole: [0, 0, 1] },
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "heelL", "footL"],
    role: "leg",
    contact: [0.18, 0, 0.22],
    group: "limbs",
  });

  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "heelR", "footR"],
    role: "leg",
    contact: [-0.18, 0, 0.22],
    group: "limbs",
  });

  const fingerChains: Array<{ chain: any; side: number; index: number; thumb?: boolean }> = [];
  for (const side of [1, -1]) {
    const hand = side > 0 ? armL.tip : armR.tip;
    const handPoint = hand.at.clone();

    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.032;
      const root = [handPoint.x + spread, handPoint.y, handPoint.z + 0.012];
      const middle = [handPoint.x + spread * 1.15, handPoint.y - 0.005, handPoint.z + 0.055];
      const tip = [handPoint.x + spread * 1.18, handPoint.y - 0.012, handPoint.z + 0.105];
      const sideName = side > 0 ? "L" : "R";
      const finger = b.chain(
        `finger${sideName}${i + 1}`,
        catmull([root, middle, tip]),
        {
          parent: hand,
          names: [`finger${sideName}${i + 1}`, `finger${sideName}${i + 1}Tip`],
          role: "digit",
          group: "digits",
        },
      );
      fingerChains.push({ chain: finger, side, index: i });
    }

    const thumb = b.chain(
      `thumb${side > 0 ? "L" : "R"}`,
      catmull([
        [handPoint.x + side * 0.025, handPoint.y + 0.015, handPoint.z + 0.01],
        [handPoint.x + side * 0.075, handPoint.y + 0.005, handPoint.z + 0.052],
        [handPoint.x + side * 0.105, handPoint.y - 0.005, handPoint.z + 0.085],
      ]),
      {
        parent: hand,
        names: [`thumb${side > 0 ? "L" : "R"}`, `thumb${side > 0 ? "L" : "R"}Tip`],
        role: "digit",
        group: "digits",
      },
    );
    fingerChains.push({ chain: thumb, side, index: 3, thumb: true });
  }

  const toeChains: Array<{ chain: any; side: number; index: number }> = [];
  for (const side of [1, -1]) {
    const foot = side > 0 ? legL.tip : legR.tip;
    const footPoint = foot.at.clone();

    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.045;
      const toe = b.chain(
        `toe${side > 0 ? "L" : "R"}${i + 1}`,
        catmull([
          [footPoint.x + spread, footPoint.y - 0.015, footPoint.z + 0.035],
          [footPoint.x + spread * 1.1, footPoint.y - 0.02, footPoint.z + 0.095],
          [footPoint.x + spread * 1.18, footPoint.y - 0.02, footPoint.z + 0.165],
        ]),
        {
          parent: foot,
          names: [
            `toe${side > 0 ? "L" : "R"}${i + 1}`,
            `toe${side > 0 ? "L" : "R"}${i + 1}Tip`,
          ],
          role: "digit",
          group: "digits",
        },
      );
      toeChains.push({ chain: toe, side, index: i });
    }
  }

  // A slightly open jaw gives the beard and lower mouth an expressive silhouette.
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });

  // ---------------------------------------------------------------------------------------------------------------
  // Small placement helpers. Every visible piece still enters through the builder.

  const sphere = (
    name: string,
    at: any,
    scale: [number, number, number],
    color: any,
    bone: any,
    segments = 10,
    rings = 7,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, rings), color, {
      at,
      bone,
      scale,
      flat: true,
      group: "character",
      name,
    });

  const box = (
    name: string,
    at: any,
    size: [number, number, number],
    color: any,
    bone: any,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
      group: "character",
      name,
    });

  const rod = (
    name: string,
    a: any,
    z: any,
    radius: number,
    color: any,
    bone?: any,
    caps: "flat" | "round" | "point" = "flat",
  ) =>
    b.rod(a, z, radius, {
      color,
      bone,
      caps,
      section: { ngon: 6 },
      group: "character",
      name,
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Torso, neck, hips, arms, legs, boots, gloves and digits.

  const pelvis = sphere("broadPelvis", hips.at, [0.31, 0.23, 0.27], TROUSERS, hips, 10, 7);

  const torso = b.loft(
    [
      { at: [0, 0.78, 0], w: 0.48, h: 0.34 },
      { at: [0, 0.96, 0.01], w: 0.54, h: 0.39 },
      { at: [0, 1.19, 0.035], w: 0.62, h: 0.43 },
      { at: [0, 1.36, 0.055], w: 0.58, h: 0.35 },
    ],
    {
      bone: spine,
      color: SHIRT,
      group: "character",
      name: "barrelChest",
    },
  );

  const neckTube = b.sweep(neck, [0.145, 0.12], {
    color: FACE,
    section: { ngon: 8 },
    group: "character",
    name: "neckSkin",
  });

  const collarPath = b.surface(neckTube).loop(neck.at(0.55), { lift: 0.008 });
  b.sweep(collarPath, 0.025, {
    color: LEATHER,
    group: "character",
    name: "neckCollar",
  });

  const legLTubes = b.sweep(legL, (t) => (t < 0.55 ? 0.115 : 0.088), {
    color: TROUSERS,
    section: { ngon: 6 },
    group: "character",
    name: "trouserL",
  });

  const legRTubes = b.sweep(legR, (t) => (t < 0.55 ? 0.115 : 0.088), {
    color: TROUSERS,
    section: { ngon: 6 },
    group: "character",
    name: "trouserR",
  });

  sphere("leftKneePad", legL.at(0.38).at, [0.125, 0.105, 0.075], LEATHER, legL.at(0.38).bone, 8, 6);
  sphere("rightKneePad", legR.at(0.38).at, [0.125, 0.105, 0.075], LEATHER, legR.at(0.38).bone, 8, 6);

  const leftBoot = box("leftBoot", [0.18, 0.115, 0.17], [0.21, 0.18, 0.29], BOOT, legL.tip);
  const rightBoot = box("rightBoot", [-0.18, 0.115, 0.17], [0.21, 0.18, 0.29], BOOT, legR.tip);
  box("leftBootSole", [0.18, 0.035, 0.19], [0.235, 0.055, 0.32], "#21171a", legL.tip);
  box("rightBootSole", [-0.18, 0.035, 0.19], [0.235, 0.055, 0.32], "#21171a", legR.tip);

  for (const side of [1, -1]) {
    const leg = side > 0 ? legL : legR;
    const x = side * 0.18;
    box(`bootBuckle${side > 0 ? "L" : "R"}`, [x, 0.135, 0.322], [0.07, 0.055, 0.018], BRASS, leg.tip);
    box(`bootBuckleHole${side > 0 ? "L" : "R"}`, [x, 0.135, 0.334], [0.032, 0.024, 0.006], "#3a2020", leg.tip);
    rod(`bootLaceA${side > 0 ? "L" : "R"}`, [x - 0.055, 0.19, 0.30], [x + 0.055, 0.19, 0.30], 0.008, LEATHER, leg.tip);
    rod(`bootLaceB${side > 0 ? "L" : "R"}`, [x - 0.05, 0.225, 0.31], [x + 0.05, 0.225, 0.31], 0.007, LEATHER, leg.tip);
  }

  const armLTubes = b.sweep(armL, (t) => (t < 0.5 ? 0.10 : 0.075), {
    color: SHIRT,
    section: { ngon: 6 },
    group: "character",
    name: "sleeveL",
  });

  const armRTubes = b.sweep(armR, (t) => (t < 0.5 ? 0.10 : 0.075), {
    color: SHIRT,
    section: { ngon: 6 },
    group: "character",
    name: "sleeveR",
  });

  sphere("leftShoulderPad", [0.31, 1.30, 0.045], [0.16, 0.12, 0.13], LEATHER, armL.joints[0], 8, 6);
  sphere("rightShoulderPad", [-0.31, 1.30, 0.045], [0.16, 0.12, 0.13], LEATHER, armR.joints[0], 8, 6);

  for (const side of [1, -1]) {
    const arm = side > 0 ? armL : armR;
    const cuffFrame = arm.at(0.57);
    b.part(new THREE.TorusGeometry(0.078, 0.016, 6, 10), LEATHER, {
      frame: cuffFrame,
      flat: true,
      group: "character",
      name: `rolledCuff${side > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.TorusGeometry(0.072, 0.008, 6, 10), BRASS, {
      frame: arm.at(0.60),
      flat: true,
      group: "character",
      name: `cuffRivetBand${side > 0 ? "L" : "R"}`,
    });

    sphere(
      `glovedPalm${side > 0 ? "L" : "R"}`,
      arm.tip.at,
      [0.095, 0.085, 0.095],
      GLOVE,
      arm.tip,
      9,
      6,
    );
  }

  for (const digit of fingerChains) {
    const sideName = digit.side > 0 ? "L" : "R";
    const label = digit.thumb ? `thumb${sideName}` : `finger${sideName}${digit.index + 1}`;
    b.sweep(digit.chain, digit.thumb ? [0.033, 0.013] : [0.027, 0.011], {
      color: GLOVE,
      section: { ngon: 5 },
      group: "character",
      name: `${label}Glove`,
    });
    sphere(
      `${label}Knuckle`,
      digit.chain.at(0.48).at,
      digit.thumb ? [0.036, 0.034, 0.034] : [0.031, 0.030, 0.030],
      GLOVE,
      digit.chain.at(0.48).bone,
      7,
      5,
    );
  }

  for (const toe of toeChains) {
    const sideName = toe.side > 0 ? "L" : "R";
    b.sweep(toe.chain, [0.036, 0.012], {
      color: BOOT,
      section: { ngon: 5 },
      group: "character",
      name: `toe${sideName}${toe.index + 1}Boot`,
    });
    sphere(
      `toe${sideName}${toe.index + 1}Cap`,
      toe.chain.at(0.73).at,
      [0.028, 0.025, 0.032],
      BRASS,
      toe.chain.at(0.73).bone,
      7,
      5,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face first: skull, eyes, brows, nose, mouth, ears and cheeks.

  const skull = sphere("largeDwarfSkull", head.at, [0.285, 0.305, 0.255], FACE, head, 14, 10);
  const faceSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const hit = faceSurface.around(head.at).at(side * 28, 5);
    if (hit) {
      b.decal(skull, EYE, {
        at: hit,
        size: [0.108, 0.145],
        lift: 0.004,
        segments: 9,
        mirror: side > 0,
        bone: head,
        group: "face",
        name: `brightEye${side > 0 ? "L" : "R"}`,
      });
    }
  }

  rod("leftBrow", [0.035, 1.735, 0.345], [0.155, 1.715, 0.34], 0.019, HAIR, head, "round");
  rod("rightBrow", [-0.035, 1.735, 0.345], [-0.155, 1.715, 0.34], 0.019, HAIR, head, "round");

  sphere("wideNose", [0, 1.59, 0.405], [0.092, 0.085, 0.09], NOSE, head, 9, 6);
  sphere("noseBridge", [0, 1.635, 0.345], [0.055, 0.08, 0.065], FACE, head, 8, 6);

  sphere("leftCheek", [0.145, 1.515, 0.305], [0.125, 0.13, 0.10], FACE, head, 9, 6);
  sphere("rightCheek", [-0.145, 1.515, 0.305], [0.125, 0.13, 0.10], FACE, head, 9, 6);

  rod("upperMouthLeft", [-0.015, 1.505, 0.408], [-0.105, 1.485, 0.405], 0.012, INK, head, "round");
  rod("upperMouthRight", [0.015, 1.505, 0.408], [0.105, 1.485, 0.405], 0.012, INK, head, "round");
  rod("lowerMouthShadow", [-0.075, 1.462, 0.415], [0.075, 1.462, 0.415], 0.009, SOOT, jaw, "round");

  box("leftTooth", [-0.043, 1.478, 0.424], [0.026, 0.031, 0.014], IVORY, jaw);
  box("rightTooth", [0.043, 1.478, 0.424], [0.026, 0.031, 0.014], IVORY, jaw);

  for (const side of [1, -1]) {
    const earX = side * 0.255;
    b.extrude(
      [
        [-0.085, -0.105],
        [0.035, -0.075],
        [0.13, 0.035],
        [0.07, 0.17],
        [-0.035, 0.13],
      ],
      {
        at: [earX, 1.65, 0.13],
        x: [0, 0, -side],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        smoothing: 1,
        color: FACE,
        bone: head,
        group: "face",
        name: `pointedEar${side > 0 ? "L" : "R"}`,
      },
    );

    b.extrude(
      [
        [-0.05, -0.06],
        [0.025, -0.045],
        [0.082, 0.028],
        [0.04, 0.105],
        [-0.025, 0.075],
      ],
      {
        at: [side * 0.278, 1.65, 0.13],
        x: [0, 0, -side],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.003,
        smoothing: 1,
        color: "#e78273",
        bone: head,
        group: "face",
        name: `innerEar${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // Freckles and little soot flecks make the face read as a working blacksmith rather than a generic dwarf.
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (0.11 + (i % 3) * 0.018);
    const y = 1.545 + ((i * 17) % 5) * 0.012;
    sphere(`freckle${i}`, [x, y, 0.405], [0.008, 0.007, 0.004], SOOT, head, 6, 4);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Beard, moustache, sideburns and braids.

  const jawMass = sphere("lowerJawBeardMass", jaw.at, [0.225, 0.20, 0.15], BEARD, jaw, 11, 8);

  const beardFront = b.extrude(
    [
      [-0.23, 0.08],
      [-0.16, 0.23],
      [-0.08, 0.30],
      [0, 0.34],
      [0.08, 0.30],
      [0.16, 0.23],
      [0.23, 0.08],
      [0.18, -0.10],
      [0.10, -0.25],
      [0, -0.34],
      [-0.10, -0.25],
      [-0.18, -0.10],
    ],
    {
      at: [0, 1.365, 0.365],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.012,
      smoothing: 1,
      color: BEARD,
      bone: jaw,
      group: "beard",
      name: "largeAngularBeard",
    },
  );

  const beardHits = b.surface(beardFront).scatter(23, {
    rng: rng(91),
    minDist: 0.032,
    filter: (hit) => hit.n.z > 0.28 && hit.at.y < 1.58,
  });

  b.cards(beardHits, BEARD_CARD, {
    size: [0.043, 0.105],
    lean: 58,
    bend: 25,
    vary: 0.24,
    sink: 0.12,
    flow: [0, -0.15, 1],
    color: BEARD,
    rng: rng(93),
    group: "beard",
  });

  const mustacheL = b.sweep(
    bezier(
      [-0.01, 1.535, 0.425],
      [-0.07, 1.565, 0.435],
      [-0.15, 1.535, 0.425],
      [-0.205, 1.49, 0.40],
    ),
    [0.042, 0.008],
    {
      color: BEARD_DARK,
      bone: head,
      caps: { start: "round", end: "point" },
      group: "beard",
      name: "moustacheL",
    },
  );

  const mustacheR = b.sweep(
    bezier(
      [0.01, 1.535, 0.425],
      [0.07, 1.565, 0.435],
      [0.15, 1.535, 0.425],
      [0.205, 1.49, 0.40],
    ),
    [0.042, 0.008],
    {
      color: BEARD_DARK,
      bone: head,
      caps: { start: "round", end: "point" },
      group: "beard",
      name: "moustacheR",
    },
  );

  for (const side of [1, -1]) {
    const sideburn = b.sweep(
      catmull([
        [side * 0.205, 1.66, 0.25],
        [side * 0.225, 1.57, 0.285],
        [side * 0.215, 1.49, 0.32],
        [side * 0.18, 1.42, 0.34],
      ]),
      [0.065, 0.025],
      {
        color: BEARD_DARK,
        bone: head,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "beard",
        name: `sideburn${side > 0 ? "L" : "R"}`,
      },
    );

    const braid = b.sweep(
      catmull([
        [side * 0.165, 1.52, 0.35],
        [side * 0.20, 1.42, 0.34],
        [side * 0.18, 1.31, 0.32],
        [side * 0.125, 1.20, 0.28],
        [side * 0.09, 1.12, 0.255],
      ]),
      [0.052, 0.018],
      {
        color: BEARD,
        bone: jaw,
        section: { ngon: 7 },
        caps: { start: "round", end: "point" },
        group: "beard",
        name: `beardBraid${side > 0 ? "L" : "R"}`,
      },
    );

    const braidItems = b.along(braid, 6, () => {});
    braidItems.forEach((at: any, i: number) => {
      b.part(new THREE.TorusGeometry(0.043 - i * 0.003, 0.010, 6, 8), i % 2 ? BRASS : BEARD_DARK, {
        frame: at,
        flat: true,
        group: "beard",
        name: `braidRing${side > 0 ? "L" : "R"}${i}`,
      });
      if (i < 5) {
        sphere(
          `braidBead${side > 0 ? "L" : "R"}${i}`,
          braid.at((i + 0.5) / 6).at,
          [0.035 - i * 0.002, 0.035 - i * 0.002, 0.035 - i * 0.002],
          COPPER,
          braid.at((i + 0.5) / 6).bone,
          7,
          5,
        );
      }
    });
  }

  const beardTufts = [
    [-0.18, 1.39, 0.43, -0.22],
    [-0.105, 1.30, 0.44, -0.28],
    [0, 1.265, 0.445, -0.32],
    [0.105, 1.30, 0.44, -0.28],
    [0.18, 1.39, 0.43, -0.22],
    [-0.06, 1.48, 0.445, -0.18],
    [0.06, 1.48, 0.445, -0.18],
  ];

  beardTufts.forEach(([x, y, z, dy], i) => {
    b.spike(
      [x, y, z],
      [x * 0.2, dy, 0.15],
      Math.abs(dy) * 0.72,
      0.042,
      {
        color: i % 2 ? BEARD : BEARD_DARK,
        bone: jaw,
        caps: "point",
        group: "beard",
        name: `beardBlade${i}`,
      },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Hair, cap and forehead badge.

  sphere("backHair", [0, 1.72, 0.015], [0.29, 0.24, 0.22], HAIR, head, 11, 7);

  for (const side of [1, -1]) {
    b.sweep(
      catmull([
        [side * 0.23, 1.76, 0.10],
        [side * 0.28, 1.67, 0.105],
        [side * 0.255, 1.57, 0.16],
      ]),
      [0.055, 0.022],
      {
        color: HAIR,
        bone: head,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        group: "hair",
        name: `templeLock${side > 0 ? "L" : "R"}`,
      },
    );

    b.spike(
      [side * 0.245, 1.78, 0.08],
      [side * 0.24, 0.24, -0.08],
      0.12,
      0.035,
      {
        color: HAIR,
        bone: head,
        group: "hair",
        name: `hairTuft${side > 0 ? "L" : "R"}`,
      },
    );
  }

  b.lathe(
    [
      [0, 0],
      [0.33, 0],
      [0.345, 0.025],
      [0.28, 0.055],
      [0.235, 0.11],
      [0.22, 0.205],
      [0.15, 0.245],
      [0, 0.255],
    ],
    {
      at: [0, 1.795, 0.045],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: HAT,
      bone: head,
      group: "hat",
      name: "smithCap",
    },
  );

  const hatBandPoints = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return [Math.cos(a) * 0.285, 1.855, 0.045 + Math.sin(a) * 0.285];
  });

  const hatBand = b.sweep(catmull(hatBandPoints, { closed: true }), 0.019, {
    color: BRASS,
    bone: head,
    caps: "none",
    group: "hat",
    name: "brassHatBand",
  });

  const hatStuds = b.along(hatBand, 10, () => {});
  hatStuds.forEach((at: any, i: number) => {
    b.stick(new THREE.SphereGeometry(0.023, 7, 5), i % 3 === 0 ? COPPER : BRASS, at, {
      embed: 0.25,
      group: "hat",
      name: `hatBandStud${i}`,
    });
  });

  b.extrude(
    [
      [-0.055, -0.05],
      [0, -0.075],
      [0.055, -0.05],
      [0.068, 0.045],
      [0, 0.09],
      [-0.068, 0.045],
    ],
    {
      at: [0, 1.96, 0.285],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: BRASS,
      bone: head,
      group: "hat",
      name: "capBadge",
    },
  );

  b.part(new THREE.PlaneGeometry(0.085, 0.075), "#ffffff", {
    at: [0, 1.96, 0.296],
    dir: [0, 0, 1],
    axis: "z",
    texture: HAMMER_MARK,
    bone: head,
    group: "hat",
    name: "capBadgeMark",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Belt, apron, straps, pockets and smithing insignia.

  const beltPath = b.surface(torso).loop(spine.at(0.18), { lift: 0.018 });
  b.sweep(beltPath, 0.032, {
    color: LEATHER,
    group: "clothing",
    name: "wideLeatherBelt",
  });

  const beltItems = b.along(beltPath, 14, () => {});
  beltItems.forEach((at: any, i: number) => {
    b.stick(new THREE.SphereGeometry(0.014, 7, 5), BRASS, at, {
      embed: 0.3,
      group: "clothing",
      name: `beltStud${i}`,
    });
  });

  const apron = b.extrude(
    [
      [-0.30, -0.285],
      [0.30, -0.285],
      [0.29, 0.18],
      [0.25, 0.39],
      [0.19, 0.45],
      [-0.19, 0.45],
      [-0.25, 0.39],
      [-0.29, 0.18],
    ],
    {
      at: [0, 0.91, 0.30],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      smoothing: 1,
      color: APRON,
      bone: spine.tip,
      group: "clothing",
      name: "heavySmithApron",
    },
  );

  rod("apronLeftEdge", [-0.285, 0.64, 0.328], [-0.245, 1.29, 0.328], 0.014, LEATHER, spine.tip);
  rod("apronRightEdge", [0.285, 0.64, 0.328], [0.245, 1.29, 0.328], 0.014, LEATHER, spine.tip);
  rod("apronBottomEdge", [-0.27, 0.635, 0.328], [0.27, 0.635, 0.328], 0.016, LEATHER, spine.tip);

  rod("apronStrapL", [-0.215, 1.29, 0.335], [-0.14, 1.04, 0.345], 0.026, LEATHER, spine.tip);
  rod("apronStrapR", [0.215, 1.29, 0.335], [0.14, 1.04, 0.345], 0.026, LEATHER, spine.tip);
  rod("apronStrapLHighlight", [-0.205, 1.275, 0.353], [-0.14, 1.05, 0.353], 0.006, BRASS, spine.tip);
  rod("apronStrapRHighlight", [0.205, 1.275, 0.353], [0.14, 1.05, 0.353], 0.006, BRASS, spine.tip);

  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
    at: [0, 1.065, 0.33],
    dir: [0, 0, 1],
    axis: "z",
    texture: APRON_SIGIL,
    bone: spine.tip,
    group: "clothing",
    name: "apronHammerSigil",
  });

  for (const side of [1, -1]) {
    b.extrude(
      [
        [-0.095, -0.075],
        [0.095, -0.075],
        [0.095, 0.08],
        [0.06, 0.11],
        [-0.06, 0.11],
        [-0.095, 0.08],
      ],
      {
        at: [side * 0.175, 0.75, 0.345],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.028,
        bevel: 0.006,
        smoothing: 1,
        color: LEATHER,
        bone: spine.tip,
        group: "clothing",
        name: `apronPocket${side > 0 ? "L" : "R"}`,
      },
    );

    rod(
      `pocketFlap${side > 0 ? "L" : "R"}`,
      [side * 0.08, 0.815, 0.365],
      [side * 0.27, 0.815, 0.365],
      0.011,
      BRASS,
      spine.tip,
    );
  }

  const buckleShape = {
    teeth: 12,
    module: 0.0048,
    spokes: 4,
    bore: 0.005,
    thickness: 0.014,
  };

  b.part(gearGeometry(buckleShape), "#d99a3e", {
    at: [0, 0.825, 0.345],
    dir: [0, 0, 1],
    bone: spine.tip,
    texture: gearTexture(buckleShape, { size: 128 }),
    flat: true,
    group: "clothing",
    name: "gearBeltBuckle",
  });

  for (let i = 0; i < 8; i++) {
    const x = -0.20 + i * 0.057;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6), BRASS, {
      at: [x, 0.69, 0.348],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      group: "clothing",
      name: `apronHemRivet${i}`,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Anvil: a compact, exaggerated blacksmith prop sized to the dwarf's footprint.

  const anvilTop = b.extrude(
    [
      [-0.30, -0.16],
      [-0.38, -0.09],
      [-0.34, 0.07],
      [-0.25, 0.16],
      [0.25, 0.16],
      [0.34, 0.07],
      [0.38, -0.09],
      [0.30, -0.16],
    ],
    {
      at: [0, 0.775, 0.59],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.11,
      bevel: 0.018,
      smoothing: 1,
      color: OLD_IRON,
      bone: hips,
      group: "anvil",
      name: "broadAnvilTop",
    },
  );

  b.frustumBox(
    [0, 0.18, 0.59],
    [0, 0.675, 0.59],
    [0.28, 0.20],
    [0.44, 0.29],
    {
      color: OLD_IRON,
      bone: hips,
      section: "box",
      group: "anvil",
      name: "anvilWaist",
    },
  );

  box("anvilFootL", [-0.18, 0.105, 0.59], [0.25, 0.20, 0.34], OLD_IRON, hips);
  box("anvilFootR", [0.18, 0.105, 0.59], [0.25, 0.20, 0.34], OLD_IRON, hips);
  box("anvilFootFront", [0, 0.09, 0.43], [0.48, 0.16, 0.15], OLD_IRON, hips);
  box("anvilFootBack", [0, 0.09, 0.75], [0.48, 0.16, 0.15], OLD_IRON, hips);

  b.spike([0, 0.83, 0.70], [0, 0, 1], 0.36, 0.13, {
    color: OLD_IRON,
    bone: hips,
    caps: "point",
    group: "anvil",
    name: "anvilHorn",
  });

  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), SOOT, {
    at: [0, 0.842, 0.57],
    bone: hips,
    flat: true,
    group: "anvil",
    name: "hardyHole",
  });

  b.part(new THREE.PlaneGeometry(0.19, 0.12), "#ffffff", {
    at: [0, 0.49, 0.756],
    dir: [0, 0, 1],
    axis: "z",
    texture: ANVIL_RUNE,
    bone: hips,
    group: "anvil",
    name: "anvilRune",
  });

  for (const x of [-0.24, 0.24]) {
    for (const z of [0.47, 0.71]) {
      sphere(`anvilRivet${x > 0 ? "L" : "R"}${z > 0.5 ? "Back" : "Front"}`, [x, 0.846, z], [0.025, 0.018, 0.025], BRASS, hips, 7, 5);
    }
  }

  for (let i = 0; i < 5; i++) {
    const x = -0.18 + i * 0.09;
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.025, 6), COPPER, {
      at: [x, 0.695, 0.43],
      bone: hips,
      flat: true,
      group: "anvil",
      name: `anvilFrontBolt${i}`,
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Hot billet, tongs, hammer and small sparks.

  const billet = b.part(new THREE.BoxGeometry(0.14, 0.045, 0.09), HOT, {
    at: [0, 0.855, 0.63],
    bone: hips,
    flat: true,
    group: "smithing",
    name: "glowingHotBillet",
  });
  glow(billet, 2.4);

  const billetCore = b.part(new THREE.BoxGeometry(0.085, 0.052, 0.06), HOT_LIGHT, {
    at: [0, 0.882, 0.63],
    bone: hips,
    flat: true,
    group: "smithing",
    name: "billetWhiteHeat",
  });
  glow(billetCore, 3.2);

  const sparkPositions: Array<[number, number, number, number]> = [
    [-0.08, 0.94, 0.63, 0.020],
    [0.075, 0.975, 0.66, 0.015],
    [0.01, 1.045, 0.64, 0.012],
    [-0.13, 1.01, 0.62, 0.010],
    [0.12, 1.09, 0.67, 0.009],
  ];

  sparkPositions.forEach(([x, y, z, r], i) => {
    const spark = b.part(new THREE.IcosahedronGeometry(r, 0), i % 2 ? HOT_LIGHT : HOT, {
      at: [x, y, z],
      bone: hips,
      flat: true,
      group: "smithing",
      name: `hotSpark${i}`,
    });
    glow(spark, 3.5);
  });

  const tongTarget = [0.01, 0.89, 0.65];
  const tongTarget2 = [0.08, 0.89, 0.66];

  rod("leftTongsArm", armL.tip, tongTarget, 0.014, DARK_IRON, armL.tip, "round");
  rod("leftTongsSecondArm", armL.tip, tongTarget2, 0.012, DARK_IRON, armL.tip, "round");
  rod("tongsJawL", tongTarget, [-0.035, 0.855, 0.675], 0.009, STEEL, hips, "point");
  rod("tongsJawR", tongTarget2, [0.12, 0.855, 0.675], 0.009, STEEL, hips, "point");
  b.part(new THREE.TorusGeometry(0.035, 0.009, 6, 10), BRASS, {
    at: [0.365, 0.83, 0.445],
    dir: [0, 1, 0],
    bone: armL.tip,
    flat: true,
    group: "smithing",
    name: "tongsGripRing",
  });

  const hammerX = armR.tip.at.x;
  const hammerTop: [number, number, number] = [hammerX, 1.275, 0.515];

  const hammerHandle = rod("hammerWoodHandle", armR.tip, hammerTop, 0.028, WOOD, armR.tip, "round");

  for (let i = 0; i < 5; i++) {
    const y = 0.875 + i * 0.073;
    b.part(new THREE.TorusGeometry(0.032, 0.0055, 6, 8), i === 0 ? BRASS : LEATHER, {
      at: [hammerX, y, 0.45 + (y - 0.83) * 0.12],
      bone: armR.tip,
      flat: true,
      group: "smithing",
      name: `hammerGripWrap${i}`,
    });
  }

  const hammerHeadAt = [hammerX, 1.285, 0.515];
  const hammerHead = b.part(new THREE.CylinderGeometry(0.105, 0.115, 0.29, 8, 1), STEEL, {
    at: hammerHeadAt,
    dir: [1, 0, 0],
    bone: armR.tip,
    flat: true,
    group: "smithing",
    name: "heavyHammerHead",
  });

  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.035, 8), DARK_IRON, {
    at: [hammerX - 0.125, 1.285, 0.515],
    dir: [1, 0, 0],
    bone: armR.tip,
    flat: true,
    group: "smithing",
    name: "hammerLeftFace",
  });

  b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.035, 8), DARK_IRON, {
    at: [hammerX + 0.125, 1.285, 0.515],
    dir: [1, 0, 0],
    bone: armR.tip,
    flat: true,
    group: "smithing",
    name: "hammerRightFace",
  });

  b.part(new THREE.PlaneGeometry(0.12, 0.075), "#ffffff", {
    at: [hammerX, 1.285, 0.626],
    dir: [0, 0, 1],
    axis: "z",
    texture: HAMMER_MARK,
    bone: armR.tip,
    group: "smithing",
    name: "hammerFaceMark",
  });

  b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.035, 8), BRASS, {
    at: [hammerX, 1.285, 0.515],
    dir: [1, 0, 0],
    bone: armR.tip,
    flat: true,
    group: "smithing",
    name: "hammerCollar",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // A few final chunky accents: shoulder rivets, apron stitching, leather pouch and metal badges.

  for (const side of [1, -1]) {
    sphere(`shoulderRivet${side > 0 ? "L" : "R"}`, [side * 0.36, 1.325, 0.11], [0.025, 0.025, 0.025], BRASS, side > 0 ? armL.joints[0] : armR.joints[0], 7, 5);
    sphere(`shoulderStud${side > 0 ? "L" : "R"}`, [side * 0.30, 1.265, 0.145], [0.018, 0.018, 0.018], COPPER, side > 0 ? armL.joints[0] : armR.joints[0], 7, 5);
  }

  for (let i = 0; i < 7; i++) {
    const x = -0.18 + i * 0.06;
    rod(`apronStitch${i}`, [x, 0.675, 0.356], [x + 0.018, 0.725, 0.356], 0.0045, BRASS, spine.tip);
  }

  box("leftToolPouch", [0.285, 0.79, 0.08], [0.14, 0.18, 0.13], LEATHER, hips);
  box("toolPouchFlap", [0.285, 0.88, 0.15], [0.15, 0.045, 0.14], LEATHER, hips);
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 7), BRASS, {
    at: [0.285, 0.865, 0.225],
    dir: [0, 0, 1],
    bone: hips,
    flat: true,
    group: "clothing",
    name: "toolPouchButton",
  });

  box("rightToolPouch", [-0.285, 0.79, 0.08], [0.14, 0.18, 0.13], LEATHER, hips);
  box("rightToolPouchFlap", [-0.285, 0.88, 0.15], [0.15, 0.045, 0.14], LEATHER, hips);
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 7), BRASS, {
    at: [-0.285, 0.865, 0.225],
    dir: [0, 0, 1],
    bone: hips,
    flat: true,
    group: "clothing",
    name: "rightToolPouchButton",
  });

  const smallCog = {
    teeth: 10,
    module: 0.0035,
    spokes: 4,
    bore: 0.003,
    thickness: 0.01,
  };

  b.part(gearGeometry(smallCog), "#c9933b", {
    at: [0.285, 0.80, 0.153],
    dir: [0, 0, 1],
    bone: hips,
    texture: gearTexture(smallCog, { size: 96 }),
    flat: true,
    group: "clothing",
    name: "leftPouchCog",
  });

  b.part(gearGeometry(smallCog), "#c9933b", {
    at: [-0.285, 0.80, 0.153],
    dir: [0, 0, 1],
    bone: hips,
    texture: gearTexture(smallCog, { size: 96 }),
    flat: true,
    group: "clothing",
    name: "rightPouchCog",
  });

  // A compact soot-black collar and two brass pins visually connect head, apron and shoulders.
  const upperCollar = b.surface(torso).loop(spine.at(0.83), { lift: 0.014 });
  b.sweep(upperCollar, 0.021, {
    color: DARK_IRON,
    group: "clothing",
    name: "upperLeatherCollar",
  });

  for (const side of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.012, 7), BRASS, {
      at: [side * 0.13, 1.31, 0.36],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      group: "clothing",
      name: `collarPin${side > 0 ? "L" : "R"}`,
    });
  }

  return b.root;
}
```