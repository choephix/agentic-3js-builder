```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Grimbar Emberhand, Dwarven Blacksmith",
  description:
    "A stout Warcraft-inspired dwarf blacksmith with a braided beard, riveted helmet, leather apron, raised hammer, glowing billet, and a heavy low-poly anvil.",
};

const SKIN = cel("#c98252", "#8f442f");
const SKIN_LIGHT = cel("#e4a06d", "#a9583c");
const BEARD = furEdge("#6c4030", "#2e1b1a", {
  axis: [0, 1, 0],
  by: "position",
  level: 1.15,
  teeth: 0.045,
  period: 0.055,
  along: [1, 0, 0],
  ink: "#211516",
  inkWidth: 0.009,
});
const BEARD_DARK = "#301b1a";
const HAIR = "#241718";
const TUNIC = cel("#31526a", "#182c40");
const TUNIC_LIGHT = "#52748b";
const LEATHER = cel("#704329", "#351c1e");
const LEATHER_LIGHT = "#9a6339";
const APRON = cel("#95603a", "#4b2a24");
const APRON_LIGHT = "#bb7d47";
const IRON = cel("#4c5660", "#202936");
const IRON_DARK = "#1d2630";
const IRON_LIGHT = "#77828a";
const STEEL_BLUE = "#587b91";
const BRASS = cel("#d49635", "#74431f");
const BRASS_LIGHT = "#efbb55";
const GOLD = "#f0c768";
const BOOT = "#2c2022";
const BOOT_LIGHT = "#513337";
const EYE_WHITE = "#f2dfbd";
const NOSE = "#562c27";
const MOUTH = "#160e13";
const HOT = "#ff6a28";
const HOT_YELLOW = "#ffd05a";
const COAL = "#241416";
const WOOD = "#6f4127";
const CLOTH_EDGE = "#b7c7c0";

const EYE_TEXTURE = animeEye({
  iris: "#4ea9d2",
  irisLight: "#a7e8ee",
  irisDark: "#1c466d",
  ink: "#201524",
  blush: "#bf5f65",
  brow: false,
  size: 256,
});

const APRON_EMBLEM = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M63 12 L75 43 L108 46 L82 67 L90 101 L63 83 L36 101 L44 67 L18 46 L51 43 Z"
      fill="#d9a13e" stroke="#281a1d" stroke-width="7" stroke-linejoin="round"/>
    <path d="M38 61 L88 61 L80 78 L47 78 Z" fill="#5c7180" stroke="#281a1d" stroke-width="6"/>
    <path d="M49 42 L77 42 L72 61 L54 61 Z" fill="#86939a" stroke="#281a1d" stroke-width="6"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "grimbar-emberhand", detail: 1 });

  const hips = b.joint("hips", {
    at: [0, 0.66, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, 0],
      [0, 0.88, 0.015],
      [0, 1.10, 0.035],
      [0, 1.23, 0.045],
    ]),
    {
      parent: hips,
      names: ["pelvis", "spineMid", "chest", "neckBase"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      spine.tip.at,
      [0, 1.29, 0.05],
      [0, 1.36, 0.065],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.43, 0.085],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.145, -0.095]),
    dir: head.local([0, 0.34, -0.16]),
    role: "jaw",
    group: "face",
  });

  const leftLegPts = [
    [0.17, 0.65, 0.0],
    [0.19, 0.40, 0.015],
    [0.16, 0.19, 0.045],
    [0.16, 0.12, 0.17],
  ] as [number, number, number][];

  const rightLegPts = [
    [-0.17, 0.65, 0.0],
    [-0.19, 0.40, 0.015],
    [-0.16, 0.19, 0.045],
    [-0.16, 0.12, 0.17],
  ] as [number, number, number][];

  const legL = b.chain("legL", catmull(leftLegPts), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.16, 0, 0.19],
  });

  const legR = b.chain("legR", catmull(rightLegPts), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.16, 0, 0.19],
  });

  const armLPts = [
    [0.255, 1.105, 0.03],
    [0.34, 1.00, 0.15],
    [0.425, 0.865, 0.31],
    [0.47, 0.825, 0.405],
  ] as [number, number, number][];

  const armRPts = [
    [-0.255, 1.105, 0.03],
    [-0.36, 1.215, 0.13],
    [-0.425, 1.36, 0.245],
    [-0.43, 1.405, 0.265],
  ] as [number, number, number][];

  const armL = b.chain("armL", catmull(armLPts), {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });

  const armR = b.chain("armR", catmull(armRPts), {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const fingersL = [
    b.chain(
      "fingerLIndex",
      catmull([
        [0.47, 0.825, 0.405],
        [0.505, 0.82, 0.445],
        [0.535, 0.82, 0.47],
      ]),
      {
        parent: armL.tip,
        names: ["fingerLIndex", "fingerLIndexTip"],
        role: "digit",
      },
    ),
    b.chain(
      "fingerLMiddle",
      catmull([
        [0.47, 0.825, 0.405],
        [0.49, 0.815, 0.45],
        [0.51, 0.815, 0.485],
      ]),
      {
        parent: armL.tip,
        names: ["fingerLMiddle", "fingerLMiddleTip"],
        role: "digit",
      },
    ),
    b.chain(
      "fingerLRing",
      catmull([
        [0.465, 0.825, 0.405],
        [0.472, 0.81, 0.447],
        [0.482, 0.81, 0.478],
      ]),
      {
        parent: armL.tip,
        names: ["fingerLRing", "fingerLRingTip"],
        role: "digit",
      },
    ),
  ];

  const fingersR = [
    b.chain(
      "fingerRIndex",
      catmull([
        [-0.43, 1.405, 0.265],
        [-0.465, 1.43, 0.285],
        [-0.49, 1.46, 0.30],
      ]),
      {
        parent: armR.tip,
        names: ["fingerRIndex", "fingerRIndexTip"],
        role: "digit",
      },
    ),
    b.chain(
      "fingerRMiddle",
      catmull([
        [-0.43, 1.405, 0.265],
        [-0.445, 1.445, 0.285],
        [-0.46, 1.485, 0.30],
      ]),
      {
        parent: armR.tip,
        names: ["fingerRMiddle", "fingerRMiddleTip"],
        role: "digit",
      },
    ),
    b.chain(
      "fingerRThumb",
      catmull([
        [-0.43, 1.405, 0.265],
        [-0.465, 1.405, 0.25],
        [-0.50, 1.42, 0.25],
      ]),
      {
        parent: armR.tip,
        names: ["fingerRThumb", "fingerRThumbTip"],
        role: "digit",
      },
    ),
  ];

  const sphere = (
    radius: number,
    color: any,
    at: any,
    scale?: [number, number, number],
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      name,
    });

  const box = (
    size: [number, number, number],
    color: any,
    at: any,
    bone?: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: any,
    at: any,
    bone?: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      bone,
      rotation,
      name,
    });

  const stud = (at: any, color = BRASS, bone?: any, radius = 0.018, name?: string) =>
    sphere(radius, color, at, undefined, bone, name);

  b.sweep(spine, (t) => [0.285 - 0.045 * t, 0.205 - 0.02 * t], {
    color: TUNIC,
    section: "box",
    sides: 8,
    name: "quiltedTunic",
  });

  b.sweep(neck, [0.13, 0.125], {
    color: SKIN,
    section: "circle",
    sides: 8,
    name: "neckSkin",
  });

  b.sweep(legL, (t) => [0.105 - 0.018 * t, 0.09 - 0.012 * t], {
    color: TUNIC,
    section: "box",
    name: "trouserL",
  });

  b.sweep(legR, (t) => [0.105 - 0.018 * t, 0.09 - 0.012 * t], {
    color: TUNIC,
    section: "box",
    name: "trouserR",
  });

  b.sweep(armL, (t) => [0.075 - 0.018 * t, 0.07 - 0.014 * t], {
    color: TUNIC,
    section: "circle",
    sides: 8,
    name: "sleeveL",
  });

  b.sweep(armR, (t) => [0.075 - 0.018 * t, 0.07 - 0.014 * t], {
    color: TUNIC,
    section: "circle",
    sides: 8,
    name: "sleeveR",
  });

  for (const digit of fingersL) {
    b.sweep(digit, [0.027, 0.018], {
      color: SKIN_LIGHT,
      sides: 6,
      caps: "round",
      name: digit.joints[0].name,
    });
  }

  for (const digit of fingersR) {
    b.sweep(digit, [0.027, 0.018], {
      color: SKIN_LIGHT,
      sides: 6,
      caps: "round",
      name: digit.joints[0].name,
    });
  }

  sphere(0.22, SKIN, head.at, [1.0, 1.0, 0.91], head, "skull");

  const skullSurface = b.surface(b.root);
  const eyeR = skullSurface.around(head.at).at(-34, 5)!;
  const eyeL = skullSurface.around(head.at).at(34, 5)!;

  b.decal(b.root, EYE_TEXTURE, {
    at: eyeR,
    size: [0.085, 0.108],
    mirror: false,
    lift: 0.004,
    name: "eyeR",
    group: "face",
  });

  b.decal(b.root, EYE_TEXTURE, {
    at: eyeL,
    size: [0.085, 0.108],
    mirror: true,
    lift: 0.004,
    name: "eyeL",
    group: "face",
  });

  sphere(
    0.048,
    NOSE,
    head.local([0, 0.225, -0.025]),
    [1.0, 0.8, 0.9],
    head,
    "broadNose",
  );

  sphere(
    0.018,
    EYE_WHITE,
    head.local([0.0, 0.245, -0.005]),
    [1.0, 0.7, 0.6],
    head,
    "noseHighlight",
  );

  for (const side of [1, -1]) {
    const earX = side * 0.19;

    sphere(
      0.1,
      SKIN,
      head.local([-earX, 0.025, 0.02]),
      [0.78, 1.05, 0.38],
      head,
      side > 0 ? "earL" : "earR",
    );

    sphere(
      0.064,
      SKIN_LIGHT,
      head.local([-earX, 0.045, 0.02]),
      [0.72, 0.9, 0.28],
      head,
      side > 0 ? "earInnerL" : "earInnerR",
    );

    b.sweep(
      catmull([
        head.local([-side * 0.18, 0.04, 0.05]),
        head.local([-side * 0.23, 0.01, 0.12]),
        head.local([-side * 0.20, -0.04, 0.18]),
      ]),
      [0.026, 0.01],
      {
        color: HAIR,
        bone: head,
        caps: "round",
        name: side > 0 ? "sideburnL" : "sideburnR",
      },
    );

    b.extrude(
      [
        [-0.08, 0.02],
        [0.08, 0.02],
        [0.06, -0.015],
        [-0.06, -0.015],
      ],
      {
        at: head.local([-side * 0.105, 0.105, 0.105]),
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.004,
        color: HAIR,
        bone: head,
        name: side > 0 ? "browL" : "browR",
      },
    );
  }

  b.extrude(
    [
      [-0.18, 0.065],
      [-0.10, 0.11],
      [0, 0.075],
      [0.10, 0.11],
      [0.18, 0.065],
      [0.16, 0.0],
      [0, -0.035],
      [-0.16, 0.0],
    ],
    {
      at: head.local([0, 0.185, 0.08]),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.006,
      smoothing: 1,
      color: BEARD,
      bone: head,
      name: "upperBeard",
    },
  );

  b.sweep(
    catmull([
      head.local([0.0, 0.19, 0.055]),
      head.local([0.08, 0.22, 0.025]),
      head.local([0.155, 0.20, 0.0]),
      head.local([0.19, 0.17, -0.02]),
    ]),
    [0.034, 0.012],
    {
      color: BEARD_DARK,
      bone: head,
      caps: { start: "round", end: "point" },
      name: "moustacheR",
    },
  );

  b.sweep(
    catmull([
      head.local([0.0, 0.19, 0.055]),
      head.local([-0.08, 0.22, 0.025]),
      head.local([-0.155, 0.20, 0.0]),
      head.local([-0.19, 0.17, -0.02]),
    ]),
    [0.034, 0.012],
    {
      color: BEARD_DARK,
      bone: head,
      caps: { start: "round", end: "point" },
      name: "moustacheL",
    },
  );

  b.extrude(
    [
      [-0.17, 0.055],
      [-0.22, 0.0],
      [-0.19, -0.15],
      [-0.12, -0.27],
      [0, -0.38],
      [0.12, -0.27],
      [0.19, -0.15],
      [0.22, 0.0],
      [0.17, 0.055],
    ],
    {
      at: jaw.local([0, 0.02, -0.005]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.008,
      smoothing: 1,
      color: BEARD,
      bone: jaw,
      name: "greatBeard",
    },
  );

  b.sweep(
    catmull([
      jaw.local([0, 0.03, -0.02]),
      jaw.local([0, 0.055, -0.15]),
      jaw.local([0, 0.04, -0.30]),
      jaw.local([0, 0.02, -0.40]),
    ]),
    [0.052, 0.022],
    {
      color: BEARD_DARK,
      bone: jaw,
      caps: "round",
      name: "beardBraid",
    },
  );

  const braidBeads = [
    [0, 1.285, 0.265],
    [0, 1.235, 0.275],
    [0, 1.185, 0.275],
    [0, 1.135, 0.27],
    [0, 1.085, 0.255],
    [0, 1.04, 0.24],
  ];

  braidBeads.forEach((p, i) => {
    sphere(0.037, i % 2 ? BRASS : LEATHER_LIGHT, p, [1, 0.72, 0.8], jaw, `beardBead${i}`);
    if (i < braidBeads.length - 1) {
      b.sweep(
        [
          [p[0] - 0.017, p[1] - 0.016, p[2] - 0.005],
          [p[0] + 0.017, p[1] - 0.032, p[2] + 0.008],
        ],
        0.009,
        {
          color: BEARD,
          bone: jaw,
          name: `braidCross${i}`,
        },
      );
    }
  });

  b.lathe(
    [
      [0, 0],
      [0.235, 0],
      [0.25, 0.035],
      [0.22, 0.10],
      [0.17, 0.17],
      [0.08, 0.205],
      [0, 0.215],
    ],
    {
      at: head.local([0, 0.005, 0.08]),
      axis: [0, 1, 0],
      segments: 12,
      color: IRON,
      bone: head,
      name: "helmetDome",
    },
  );

  cylinder(
    0.255,
    0.038,
    IRON_DARK,
    head.local([0, -0.005, 0.075]),
    head,
    [90, 0, 0],
    "helmetRim",
  );

  box([0.06, 0.20, 0.035], IRON_LIGHT, head.local([0, 0.14, 0.09]), head, undefined, "helmetNoseGuard");
  box([0.115, 0.035, 0.045], BRASS, head.local([0, 0.16, 0.17]), head, undefined, "helmetBrowTrim");

  for (const side of [1, -1]) {
    const x = side * 0.215;
    box([0.035, 0.18, 0.095], IRON_DARK, [x, 1.48, 0.05], head, [0, 0, side * 8], side > 0 ? "helmGuardL" : "helmGuardR");
    stud([x + side * 0.018, 1.52, 0.10], BRASS_LIGHT, head, 0.021, side > 0 ? "helmRivetL" : "helmRivetR");
    b.spike(
      [x, 1.59, 0.04],
      [side * 0.7, 0.15, -0.1],
      0.09,
      0.025,
      {
        color: IRON_LIGHT,
        bone: head,
        name: side > 0 ? "helmHornL" : "helmHornR",
      },
    );
  }

  box([0.42, 0.05, 0.05], CLOTH_EDGE, [0, 1.195, 0.255], spine.joints[2], undefined, "neckScarf");
  box([0.35, 0.035, 0.035], BRASS, [0, 1.165, 0.265], spine.joints[2], undefined, "scarfTrim");

  const beltPath = polyline(
    [
      [-0.25, 0.74, -0.14],
      [0.25, 0.74, -0.14],
      [0.29, 0.74, 0.09],
      [0.20, 0.74, 0.22],
      [-0.20, 0.74, 0.22],
      [-0.29, 0.74, 0.09],
    ],
    { closed: true },
  );

  b.sweep(beltPath, 0.032, {
    color: LEATHER,
    bone: hips,
    section: "box",
    name: "wideBelt",
  });

  box([0.12, 0.13, 0.045], BRASS, [0, 0.75, 0.255], hips, undefined, "beltBuckle");
  box([0.07, 0.065, 0.015], GOLD, [0, 0.75, 0.282], hips, undefined, "buckleInset");

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      stud([side * (0.12 + i * 0.065), 0.752, 0.255], BRASS_LIGHT, hips, 0.014, `beltStud${side > 0 ? "L" : "R"}${i}`);
    }
  }

  b.extrude(
    [
      [-0.25, 0.22],
      [-0.22, 0.45],
      [-0.17, 0.55],
      [0.17, 0.55],
      [0.22, 0.45],
      [0.25, 0.22],
      [0.16, 0.15],
      [-0.16, 0.15],
    ],
    {
      at: [0, 0.76, 0.245],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.009,
      color: APRON,
      bone: spine.joints[2],
      name: "leatherApron",
    },
  );

  box([0.025, 0.43, 0.018], APRON_LIGHT, [0.205, 0.98, 0.27], spine.joints[2], undefined, "apronEdgeL");
  box([0.025, 0.43, 0.018], APRON_LIGHT, [-0.205, 0.98, 0.27], spine.joints[2], undefined, "apronEdgeR");
  box([0.39, 0.022, 0.018], APRON_LIGHT, [0, 1.025, 0.27], spine.joints[2], undefined, "apronTopStitch");
  box([0.32, 0.018, 0.015], LEATHER_LIGHT, [0, 0.815, 0.274], spine.joints[2], undefined, "apronBottomStitch");

  b.part(new THREE.PlaneGeometry(0.145, 0.145), "#ffffff", {
    at: [0, 1.01, 0.267],
    dir: [0, 0, 1],
    axis: "z",
    texture: APRON_EMBLEM,
    bone: spine.joints[2],
    name: "apronAnvilEmblem",
  });

  const shoulderL = sphere(0.11, IRON, [0.255, 1.115, 0.035], [1.15, 0.7, 1.05], spine.joints[2], "shoulderPadL");
  const shoulderR = sphere(0.11, IRON, [-0.255, 1.115, 0.035], [1.15, 0.7, 1.05], spine.joints[2], "shoulderPadR");

  box([0.12, 0.028, 0.09], BRASS, [0.265, 1.145, 0.07], spine.joints[2], [0, 0, -12], "shoulderTrimL");
  box([0.12, 0.028, 0.09], BRASS, [-0.265, 1.145, 0.07], spine.joints[2], [0, 0, 12], "shoulderTrimR");

  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      stud(
        [side * (0.235 + i * 0.025), 1.13 + i * 0.012, 0.102],
        BRASS_LIGHT,
        spine.joints[2],
        0.014,
        `shoulderRivet${side > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  b.rod([0.355, 0.99, 0.18], [0.445, 0.86, 0.33], 0.084, {
    color: LEATHER,
    bone: armL.joints[1],
    name: "leftBracer",
  });

  b.rod([-0.38, 1.23, 0.15], [-0.425, 1.35, 0.24], 0.081, {
    color: LEATHER,
    bone: armR.joints[1],
    name: "rightBracer",
  });

  b.rod([0.398, 0.955, 0.235], [0.455, 0.88, 0.34], 0.012, {
    color: BRASS,
    bone: armL.joints[1],
    name: "leftBracerBand",
  });

  b.rod([-0.395, 1.26, 0.17], [-0.43, 1.33, 0.235], 0.012, {
    color: BRASS,
    bone: armR.joints[1],
    name: "rightBracerBand",
  });

  sphere(0.075, SKIN_LIGHT, [0.47, 0.825, 0.405], [1.2, 0.8, 1.1], armL.tip, "handL");
  sphere(0.075, SKIN_LIGHT, [-0.43, 1.405, 0.265], [1.2, 0.8, 1.1], armR.tip, "handR");

  for (const side of [1, -1]) {
    const x = side * 0.16;
    box([0.17, 0.20, 0.27], BOOT, [x, 0.105, 0.12], side > 0 ? legL.tip : legR.tip, undefined, side > 0 ? "bootL" : "bootR");
    box([0.18, 0.035, 0.285], BOOT_LIGHT, [x, 0.19, 0.13], side > 0 ? legL.tip : legR.tip, undefined, side > 0 ? "bootCuffL" : "bootCuffR");
    box([0.18, 0.035, 0.03], BRASS, [x, 0.145, 0.265], side > 0 ? legL.tip : legR.tip, undefined, side > 0 ? "bootToeL" : "bootToeR");
    box([0.185, 0.025, 0.028], LEATHER_LIGHT, [x, 0.11, 0.13], side > 0 ? legL.tip : legR.tip, undefined, side > 0 ? "bootStrapL" : "bootStrapR");
    stud([x - side * 0.064, 0.115, 0.145], BRASS_LIGHT, side > 0 ? legL.tip : legR.tip, 0.014, side > 0 ? "bootRivetL" : "bootRivetR");
    stud([x + side * 0.064, 0.115, 0.145], BRASS_LIGHT, side > 0 ? legL.tip : legR.tip, 0.014, side > 0 ? "bootRivetL2" : "bootRivetR2");
  }

  const hammerHandle = b.rod(
    [-0.43, 1.405, 0.265],
    [-0.43, 1.665, 0.29],
    0.026,
    {
      color: WOOD,
      bone: armR.tip,
      name: "hammerHandle",
    },
  );

  box([0.235, 0.105, 0.115], IRON, [-0.43, 1.69, 0.29], armR.tip, [0, 0, 4], "hammerHead");
  box([0.075, 0.125, 0.13], IRON_LIGHT, [-0.43, 1.69, 0.29], armR.tip, [0, 0, 4], "hammerFace");
  box([0.026, 0.13, 0.14], BRASS, [-0.43, 1.69, 0.29], armR.tip, [0, 0, 4], "hammerCollar");
  stud([-0.43, 1.746, 0.29], BRASS_LIGHT, armR.tip, 0.015, "hammerTopRivet");

  const anvilX = 0.56;
  const anvilZ = 0.53;

  b.frustumBox(
    [anvilX, 0.27, anvilZ],
    [anvilX, 0.67, anvilZ],
    [0.25, 0.18],
    [0.43, 0.21],
    {
      color: IRON_DARK,
      section: "box",
      name: "anvilBody",
    },
  );

  box([0.50, 0.12, 0.29], IRON, [anvilX, 0.735, anvilZ], undefined, undefined, "anvilTop");
  box([0.44, 0.035, 0.25], IRON_LIGHT, [anvilX, 0.81, anvilZ], undefined, undefined, "anvilTopFace");

  b.sweep(
    bezier(
      [anvilX, 0.79, 0.64],
      [anvilX, 0.80, 0.72],
      [anvilX, 0.79, 0.84],
      [anvilX, 0.77, 0.94],
    ),
    [0.105, 0.012],
    {
      color: IRON,
      caps: { start: "flat", end: "point" },
      name: "anvilHorn",
    },
  );

  box([0.18, 0.10, 0.16], IRON_DARK, [anvilX, 0.18, anvilZ], undefined, undefined, "anvilFootBlock");
  box([0.16, 0.075, 0.12], IRON, [anvilX, 0.095, anvilZ], undefined, undefined, "anvilFootBase");

  for (const side of [1, -1]) {
    box([0.12, 0.10, 0.16], IRON_DARK, [anvilX + side * 0.16, 0.20, anvilZ - 0.08], undefined, undefined, `anvilFoot${side > 0 ? "L" : "R"}`);
    box([0.13, 0.045, 0.18], IRON, [anvilX + side * 0.16, 0.115, anvilZ - 0.08], undefined, undefined, `anvilFootPad${side > 0 ? "L" : "R"}`);
  }

  box([0.34, 0.018, 0.028], IRON_LIGHT, [anvilX, 0.825, anvilZ], undefined, undefined, "anvilFrontHighlight");
  for (const side of [1, -1]) {
    stud([anvilX + side * 0.18, 0.82, anvilZ + 0.12], BRASS, undefined, 0.018, `anvilRivetFront${side}`);
    stud([anvilX + side * 0.18, 0.82, anvilZ - 0.12], BRASS, undefined, 0.018, `anvilRivetBack${side}`);
  }

  box([0.12, 0.035, 0.10], HOT, [anvilX, 0.85, anvilZ + 0.01], undefined, [0, 8, 0], "hotBillet");
  box([0.085, 0.018, 0.075], HOT_YELLOW, [anvilX, 0.878, anvilZ + 0.015], undefined, [0, 8, 0], "hotBilletGlow");

  const coalPositions = [
    [anvilX - 0.13, 0.85, anvilZ - 0.02],
    [anvilX + 0.13, 0.85, anvilZ + 0.01],
    [anvilX - 0.10, 0.85, anvilZ + 0.09],
    [anvilX + 0.09, 0.85, anvilZ - 0.09],
  ];

  coalPositions.forEach((p, i) => {
    const coal = sphere(0.028, i % 2 ? HOT : HOT_YELLOW, p, [1.0, 0.65, 0.8], undefined, `ember${i}`);
    glow(coal, i % 2 ? 1.6 : 2.3);
  });

  const anvilRunes = [
    [anvilX - 0.105, 0.77, anvilZ + 0.15],
    [anvilX - 0.035, 0.77, anvilZ + 0.15],
    [anvilX + 0.035, 0.77, anvilZ + 0.15],
    [anvilX + 0.105, 0.77, anvilZ + 0.15],
  ];

  anvilRunes.forEach((p, i) => {
    box([0.018, 0.012, 0.04], BRASS_LIGHT, p, undefined, [0, i % 2 ? -22 : 22, 0], `anvilRune${i}`);
  });

  box([0.085, 0.09, 0.13], LEATHER, [0.30, 0.76, 0.12], undefined, undefined, "toolPouch");
  box([0.095, 0.018, 0.018], BRASS, [0.30, 0.81, 0.19], undefined, undefined, "toolPouchLatch");
  stud([0.30, 0.805, 0.205], BRASS_LIGHT, undefined, 0.014, "toolPouchStud");

  b.rod([0.34, 0.77, 0.13], [0.36, 0.77, 0.45], 0.018, {
    color: WOOD,
    name: "tongsHandleA",
  });
  b.rod([0.385, 0.77, 0.13], [0.36, 0.77, 0.45], 0.018, {
    color: WOOD,
    name: "tongsHandleB",
  });
  b.rod([0.36, 0.77, 0.43], [0.36, 0.77, 0.58], 0.009, {
    color: IRON,
    name: "tongsJawA",
  });
  b.rod([0.36, 0.77, 0.43], [0.40, 0.77, 0.57], 0.009, {
    color: IRON,
    name: "tongsJawB",
  });

  box([0.12, 0.07, 0.055], IRON, [0.74, 0.055, 0.21], undefined, undefined, "looseMetalBar");
  box([0.10, 0.035, 0.065], IRON_LIGHT, [0.74, 0.108, 0.21], undefined, undefined, "looseMetalBarEdge");
  stud([0.70, 0.11, 0.21], BRASS, undefined, 0.013, "looseBarRivet");
  stud([0.78, 0.11, 0.21], BRASS, undefined, 0.013, "looseBarRivet2");

  const forgeBack = [0.91, 0.0, -0.08] as [number, number, number];
  box([0.34, 0.42, 0.28], IRON_DARK, [forgeBack[0], 0.25, forgeBack[2]], undefined, undefined, "smallForge");
  box([0.27, 0.18, 0.035], IRON, [forgeBack[0], 0.47, forgeBack[2] + 0.15], undefined, undefined, "forgeLip");
  box([0.23, 0.11, 0.025], HOT, [forgeBack[0], 0.43, forgeBack[2] + 0.17], undefined, undefined, "forgeFire");
  box([0.16, 0.05, 0.018], HOT_YELLOW, [forgeBack[0], 0.465, forgeBack[2] + 0.18], undefined, undefined, "forgeFireCore");

  for (let i = 0; i < 5; i++) {
    const ember = sphere(
      0.019,
      i % 2 ? HOT_YELLOW : HOT,
      [0.84 + (i % 3) * 0.07, 0.48 + (i % 2) * 0.035, -0.01 + (i % 2) * 0.035],
      [0.8, 1.3, 0.8],
      undefined,
      `forgeEmber${i}`,
    );
    glow(ember, 1.8);
  }

  b.sweep(
    catmull([
      [0.91, 0.47, -0.02],
      [0.91, 0.72, -0.01],
      [0.91, 0.98, 0.0],
      [0.91, 1.17, 0.01],
    ]),
    [0.065, 0.055],
    {
      color: IRON_DARK,
      caps: "round",
      name: "forgeChimney",
    },
  );

  box([0.25, 0.04, 0.035], BRASS, [0.91, 0.61, 0.0], undefined, undefined, "forgeBand");
  box([0.29, 0.035, 0.03], IRON_LIGHT, [0.91, 1.12, 0.01], undefined, undefined, "chimneyCap");

  const beardTufts = [
    [0.14, 1.285, 0.285],
    [-0.14, 1.285, 0.285],
    [0.11, 1.205, 0.30],
    [-0.11, 1.205, 0.30],
    [0.075, 1.12, 0.29],
    [-0.075, 1.12, 0.29],
  ];

  beardTufts.forEach((p, i) => {
    b.spike(
      p,
      [0, -1, 0.08],
      0.105 + (i % 2) * 0.025,
      0.037,
      {
        color: i % 2 ? BEARD_DARK : BEARD,
        bone: jaw,
        name: `beardTuft${i}`,
      },
    );
  });

  for (const side of [1, -1]) {
    b.rod(
      [side * 0.19, 1.34, 0.13],
      [side * 0.22, 1.24, 0.16],
      0.018,
      {
        color: HAIR,
        bone: head,
        name: side > 0 ? "hairLockL" : "hairLockR",
      },
    );
    stud([side * 0.22, 1.245, 0.17], BRASS, head, 0.016, side > 0 ? "hairBeadL" : "hairBeadR");
  }

  for (let i = 0; i < 6; i++) {
    const x = -0.18 + i * 0.072;
    box([0.022, 0.022, 0.025], APRON_LIGHT, [x, 0.845, 0.279], spine.joints[2], undefined, `apronStitch${i}`);
  }

  for (const side of [1, -1]) {
    b.rod([side * 0.20, 1.12, 0.21], [side * 0.26, 0.96, 0.27], 0.012, {
      color: APRON_LIGHT,
      bone: spine.joints[2],
      name: side > 0 ? "apronStrapL" : "apronStrapR",
    });

    for (let i = 0; i < 4; i++) {
      stud(
        [side * (0.215 + i * 0.014), 1.09 - i * 0.04, 0.29],
        BRASS,
        spine.joints[2],
        0.011,
        `${side > 0 ? "apronRivetL" : "apronRivetR"}${i}`,
      );
    }
  }

  const shoulderCloth = [
    [0.29, 1.07, 0.12],
    [0.32, 1.04, 0.16],
    [-0.29, 1.07, 0.12],
    [-0.32, 1.04, 0.16],
  ];

  shoulderCloth.forEach((p, i) => {
    box([0.055, 0.11, 0.07], TUNIC_LIGHT, p, spine.joints[2], undefined, `shoulderCloth${i}`);
  });

  const floorMarks = [
    [0.12, 0.006, -0.04],
    [0.28, 0.006, 0.02],
    [0.44, 0.006, -0.08],
    [0.70, 0.006, 0.03],
    [0.84, 0.006, -0.12],
  ];

  floorMarks.forEach((p, i) => {
    box([0.11, 0.012, 0.035], IRON_DARK, p, undefined, [0, (i % 2 ? 15 : -15), 0], `floorScrap${i}`);
  });

  return b.root;
}
```