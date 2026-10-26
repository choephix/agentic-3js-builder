```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  paint,
  mottle,
  stripes,
  grain,
  countershade,
  svg,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";
import { metal, coil } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, riveted leather apron, raised hammer, glowing billet, and a broad low-poly anvil.",
};

const SKIN = cel(
  mottle("#a9653c", "#75402c", { size: 0.11, contrast: 1.35, seed: 12 }),
  "#623322",
);
const SKIN_LIGHT = cel("#d68a55", "#8d4a31");
const BEARD = cel(
  stripes("#4e281e", ["#6d3825", "#351b19"], {
    size: 0.055,
    axis: "y",
    width: 0.46,
    wobble: 0.25,
    seed: 18,
  }),
  "#24151a",
);
const HAIR = cel("#3c211c", "#1e1418");
const LEATHER = cel(
  grain("#713b25", "#351b1b", { size: 0.045, axis: "y", seed: 5 }),
  "#32191a",
);
const DARK_LEATHER = cel("#4a241e", "#21141a");
const APRON = cel(
  furEdge("#8a4b2c", "#4a241e", {
    by: "position",
    axis: [0, 0, 1],
    level: 0.18,
    teeth: 0.035,
    period: 0.045,
    along: [1, 0, 0],
    ink: INK,
    inkWidth: 0.008,
  }),
  "#3b1c1c",
);
const CLOTH = cel("#6d3028", "#351b25");
const BOOT = cel("#342126", "#17131a");
const STEEL = metal("iron", {
  polish: 0.34,
  tarnish: 0.48,
  verdigris: 0.12,
  size: 0.09,
  seed: 23,
});
const DARK_STEEL = metal("blued", {
  polish: 0.28,
  tarnish: 0.42,
  size: 0.07,
  seed: 31,
});
const BRASS = metal("brass", {
  polish: 0.52,
  tarnish: 0.2,
  verdigris: 0.08,
  size: 0.065,
  seed: 44,
});
const COPPER = metal("copper", {
  polish: 0.42,
  tarnish: 0.28,
  verdigris: 0.18,
  size: 0.055,
  seed: 51,
});
const WOOD = cel(
  grain("#9a5c2e", "#43221d", { size: 0.035, axis: "y", seed: 71 }),
  "#2d191b",
);
const ANVIL_IRON = metal("iron", {
  polish: 0.18,
  tarnish: 0.66,
  verdigris: 0.16,
  size: 0.12,
  seed: 80,
});
const HOT_METAL = "#ff5424";
const HOT_CORE = "#ffd36a";

const EYE = animeEye({
  iris: "#57c9d7",
  irisLight: "#b8ffff",
  irisDark: "#176279",
  blush: "#9e3f4e",
  size: 384,
});

const APRON_BADGE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="43" fill="#d99945" stroke="#26151b" stroke-width="7"/>
    <path d="M31 29 L69 67 M69 29 L31 67" stroke="#4d211b" stroke-width="10" stroke-linecap="round"/>
    <path d="M50 20 L50 80 M20 50 L80 50" stroke="#f8d27e" stroke-width="4" opacity=".8"/>
  </svg>`,
  { size: 192 },
);

const HAMMER_RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 49 Q30 26 53 13 M27 17 Q40 11 54 17 Q45 27 33 27"
      fill="none" stroke="#f5d06a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="12" cy="51" r="4" fill="#fff1a4"/>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  color: any,
  at: any,
  scale: [number, number, number] = [1, 1, 1],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    scale,
    bone,
    name,
    flat: true,
  });
}

function cyl(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  color: any,
  at: any,
  bone?: any,
  name?: string,
  sides = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function rod(
  b: ReturnType<typeof createBuilder>,
  a: any,
  z: any,
  radius: number,
  color: any,
  bone?: any,
  name?: string,
) {
  return b.rod(a, z, radius, { color, bone, name, section: { ngon: 7 } });
}

function braid(
  b: ReturnType<typeof createBuilder>,
  points: any[],
  bone: any,
  radius = 0.026,
  color: any = BEARD,
  name = "braid",
) {
  const path = bezier(points[0], points[1], points[2], points[3]);
  const tube = b.sweep(path, [radius, radius * 0.58], {
    color,
    bone,
    caps: { start: "round", end: "point" },
    name,
    section: { ngon: 7 },
  });
  for (let i = 1; i <= 3; i++) {
    const p = path.at(i / 4);
    sphere(b, radius * 1.18, BRASS, p, [1, 0.72, 1], bone, `${name}Bead${i}`);
  }
  return tube;
}

function rivetRow(
  b: ReturnType<typeof createBuilder>,
  points: any[],
  color: any,
  bone: any,
  radius = 0.012,
  prefix = "rivet",
) {
  points.forEach((p, i) => sphere(b, radius, color, p, [1, 1, 1], bone, `${prefix}${i}`));
}

function tassel(
  b: ReturnType<typeof createBuilder>,
  base: any,
  bone: any,
  color: any,
  prefix: string,
) {
  sphere(b, 0.025, BRASS, base, [1, 1, 1], bone, `${prefix}Cap`);
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 0.012;
    const top = new THREE.Vector3(base.x + x, base.y - 0.015, base.z);
    const bottom = new THREE.Vector3(base.x + x * 1.35, base.y - 0.105 - (i % 2) * 0.012, base.z + 0.012);
    rod(b, top, bottom, 0.006, color, bone, `${prefix}Thread${i}`);
  }
}

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1, paintSize: 2048 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: broad, sturdy dwarf proportions, with named chains for animation.

  const hips = b.joint("hips", {
    at: [0, 0.76, -0.02],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.02],
      [0, 0.98, 0],
      [0, 1.16, 0.015],
      [0, 1.29, 0.03],
    ]),
    {
      parent: hips,
      names: ["spine1", "chest", "neckBase"],
      role: "spine",
    },
  );

  const neck = b.joint("neck", {
    parent: spine.joints[2],
    at: [0, 1.29, 0.03],
    dir: [0, 0.25, 1],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.405, 0.055],
    dir: [0, 0.12, 1],
    group: "head",
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.375, 0.205],
    aim: [0, 1.34, 0.39],
    group: "face",
    role: "jaw",
  });

  const leftFoot = [0.17, 0.08, 0.18];
  const rightFoot = [-0.17, 0.08, 0.18];

  const legL = b.chain(
    "legL",
    catmull([
      [0.16, 0.76, -0.01],
      [0.18, 0.47, 0.025],
      [0.16, 0.21, 0.045],
      leftFoot,
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: leftFoot,
    },
  );

  const legR = b.chain(
    "legR",
    catmull([
      [-0.16, 0.76, -0.01],
      [-0.18, 0.47, 0.025],
      [-0.16, 0.21, 0.045],
      rightFoot,
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: rightFoot,
    },
  );

  const leftArm = b.chain(
    "armL",
    catmull([
      [0.255, 1.165, 0.02],
      [0.42, 1.01, 0.15],
      [0.31, 0.865, 0.34],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wristL"],
      role: "arm",
    },
  );

  const rightArm = b.chain(
    "armR",
    catmull([
      [-0.255, 1.165, 0.02],
      [-0.40, 1.04, 0.14],
      [-0.29, 1.145, 0.35],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wristR"],
      role: "arm",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main body and limbs.

  const body = b.sweep(spine, (t) => 0.24 + 0.045 * Math.sin(t * Math.PI), {
    color: countershade(CLOTH, "#3a1d25", { level: -0.2, soft: 0.3 }),
    section: { ngon: 8 },
    caps: "round",
    name: "dwarfBody",
  });

  b.sweep(legL, [0.105, 0.075], {
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    name: "legSkinL",
  });
  b.sweep(legR, [0.105, 0.075], {
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    name: "legSkinR",
  });

  b.sweep(leftArm, [0.085, 0.065], {
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    name: "armSkinL",
  });
  b.sweep(rightArm, [0.085, 0.065], {
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    name: "armSkinR",
  });

  // Heavy boots, soles, toe caps, and heel plates.
  for (const side of [1, -1]) {
    const foot = side > 0 ? leftFoot : rightFoot;
    const leg = side > 0 ? legL : legR;
    box(b, [0.19, 0.14, 0.28], BOOT, [foot[0], 0.08, 0.105], leg.tip, `${side > 0 ? "bootL" : "bootR"}`);
    box(b, [0.20, 0.035, 0.30], DARK_STEEL, [foot[0], 0.012, 0.105], leg.tip, `${side > 0 ? "soleL" : "soleR"}`);
    box(b, [0.20, 0.075, 0.06], BRASS, [foot[0], 0.115, 0.235], leg.tip, `${side > 0 ? "toeGuardL" : "toeGuardR"}`);
    box(b, [0.175, 0.065, 0.045], BRASS, [foot[0], 0.09, -0.025], leg.tip, `${side > 0 ? "heelL" : "heelR"`);
    rod(
      b,
      [foot[0] - 0.08, 0.12, 0.12],
      [foot[0] + 0.08, 0.12, 0.12],
      0.012,
      BRASS,
      leg.tip,
      `${side > 0 ? "bootStrapL" : "bootStrapR"}`,
    );
  }

  // Belt, buckle, apron, apron bib, and crossed shoulder straps.
  const beltPath = polyline(
    [
      [-0.235, 0.895, 0.005],
      [-0.17, 0.895, 0.19],
      [0.17, 0.895, 0.19],
      [0.235, 0.895, 0.005],
      [0.17, 0.895, -0.19],
      [-0.17, 0.895, -0.19],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.025, {
    color: DARK_LEATHER,
    bone: hips,
    caps: "round",
    name: "waistBelt",
  });
  box(b, [0.11, 0.11, 0.035], BRASS, [0, 0.90, 0.215], hips, "beltBuckle");
  box(b, [0.075, 0.07, 0.043], DARK_STEEL, [0, 0.90, 0.237], hips, "buckleInset");

  box(b, [0.37, 0.43, 0.055], APRON, [0, 1.04, 0.205], spine.joints[1], "leatherApron");
  box(b, [0.30, 0.19, 0.065], DARK_LEATHER, [0, 0.86, 0.205], hips, "apronLower");
  rod(b, [-0.17, 1.24, 0.15], [0.17, 1.08, 0.22], 0.018, LEATHER, spine.joints[1], "apronStrapL");
  rod(b, [0.17, 1.24, 0.15], [-0.17, 1.08, 0.22], 0.018, LEATHER, spine.joints[1], "apronStrapR");

  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [0, 1.055, 0.241],
    dir: [0, 0, 1],
    axis: "z",
    texture: APRON_BADGE,
    bone: spine.joints[1],
    name: "apronEmblem",
  });

  const apronRivets = [
    [-0.145, 1.19, 0.244],
    [0.145, 1.19, 0.244],
    [-0.145, 1.06, 0.244],
    [0.145, 1.06, 0.244],
    [-0.13, 0.92, 0.244],
    [0.13, 0.92, 0.244],
  ];
  rivetRow(b, apronRivets, BRASS, spine.joints[1], 0.012, "apronRivet");

  // Shoulder pauldrons and small metal collar.
  for (const side of [1, -1]) {
    const shoulder = side > 0 ? leftArm.joints[0] : rightArm.joints[0];
    sphere(
      b,
      0.11,
      LEATHER,
      [side * 0.285, 1.185, 0.02],
      [1.25, 0.72, 1.05],
      shoulder,
      `${side > 0 ? "pauldronL" : "pauldronR"}`,
    );
    sphere(
      b,
      0.075,
      BRASS,
      [side * 0.34, 1.19, 0.055],
      [1.15, 0.68, 0.8],
      shoulder,
      `${side > 0 ? "pauldronRimL" : "pauldronRimR"}`,
    );
    sphere(
      b,
      0.022,
      BRASS,
      [side * 0.36, 1.21, 0.11],
      [1, 1, 1],
      shoulder,
      `${side > 0 ? "shoulderStudL" : "shoulderStudR"}`,
    );
  }

  b.sweep(
    polyline(
      [
        [-0.14, 1.29, 0.04],
        [-0.08, 1.33, 0.13],
        [0.08, 1.33, 0.13],
        [0.14, 1.29, 0.04],
      ],
      { closed: false },
    ),
    0.026,
    { color: BRASS, bone: neck, caps: "round", name: "collarTrim" },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Hands, cuffs, fingers, and left-hand tongs.

  for (const side of [1, -1]) {
    const arm = side > 0 ? leftArm : rightArm;
    const wrist = side > 0 ? [0.31, 0.865, 0.34] : [-0.29, 1.145, 0.35];
    sphere(b, 0.073, SKIN, wrist, [1.18, 0.95, 1.0], arm.tip, `${side > 0 ? "handL" : "handR"}`);

    const cuffA = side > 0 ? [0.34, 0.91, 0.29] : [-0.31, 1.10, 0.31];
    const cuffB = side > 0 ? [0.30, 0.85, 0.37] : [-0.27, 1.18, 0.37];
    rod(b, cuffA, cuffB, 0.062, DARK_LEATHER, arm.tip, `${side > 0 ? "cuffL" : "cuffR"}`);

    for (let i = 0; i < 3; i++) {
      const f0 = new THREE.Vector3(wrist[0] + side * (i - 1) * 0.024, wrist[1] - 0.035, wrist[2] + 0.045);
      const f1 = new THREE.Vector3(
        wrist[0] + side * (i - 1) * 0.031,
        wrist[1] - 0.07 - (i % 2) * 0.012,
        wrist[2] + 0.075,
      );
      rod(b, f0, f1, 0.017, SKIN_LIGHT, arm.tip, `${side > 0 ? "fingerL" : "fingerR"}${i}`);
    }
  }

  // Tongs held in the left hand, with a forked business end resting above the anvil.
  rod(b, [0.30, 0.87, 0.40], [0.10, 0.79, 0.47], 0.012, DARK_STEEL, leftArm.tip, "tongsHandle");
  rod(b, [0.10, 0.79, 0.47], [0.025, 0.78, 0.56], 0.009, DARK_STEEL, leftArm.tip, "tongsJawL");
  rod(b, [0.10, 0.79, 0.47], [0.075, 0.78, 0.57], 0.009, DARK_STEEL, leftArm.tip, "tongsJawR");
  sphere(b, 0.022, BRASS, [0.10, 0.79, 0.47], [1, 1, 1], leftArm.tip, "tongsPivot");
  rod(b, [0.22, 0.86, 0.42], [0.08, 0.79, 0.49], 0.019, LEATHER, leftArm.tip, "tongsGrip");

  // ---------------------------------------------------------------------------------------------------------------
  // Head, ears, face, beard, and helmet.

  const skull = sphere(
    b,
    1,
    SKIN,
    [0, 1.43, 0.055],
    [0.225, 0.245, 0.215],
    head,
    "roundDwarfSkull",
  );

  // Broad ears with inset copper-colored inner planes.
  for (const side of [1, -1]) {
    sphere(b, 0.095, SKIN, [side * 0.205, 1.47, 0.045], [0.72, 1.2, 0.42], head, `${side > 0 ? "earL" : "earR"}`);
    sphere(
      b,
      0.055,
      COPPER,
      [side * 0.232, 1.47, 0.065],
      [0.65, 1.12, 0.28],
      head,
      `${side > 0 ? "earInnerL" : "earInnerR"}`,
    );
  }

  // Eyes are large enough to survive the stylized silhouette.
  for (const side of [1, -1]) {
    b.decal(skull, EYE, {
      at: [side * 0.088, 1.492, 0.247],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.087, 0.112],
      mirror: side > 0,
      lift: 0.004,
      name: `${side > 0 ? "eyeL" : "eyeR"}Decal`,
    });
  }

  sphere(b, 0.058, SKIN_LIGHT, [0, 1.435, 0.265], [0.9, 0.78, 1.12], head, "bulbousNose");
  sphere(b, 0.019, INK, [-0.022, 1.445, 0.313], [1, 0.8, 0.55], head, "nostrilL");
  sphere(b, 0.019, INK, [0.022, 1.445, 0.313], [1, 0.8, 0.55], head, "nostrilR");

  // Separate upper muzzle and lower jaw, leaving a readable dark mouth line.
  sphere(b, 0.12, SKIN_LIGHT, [0, 1.385, 0.225], [1.18, 0.72, 0.88], head, "upperMuzzle");
  box(b, [0.145, 0.055, 0.11], INK, [0, 1.345, 0.282], jaw, "openMouth");
  box(b, [0.18, 0.075, 0.12], SKIN, [0, 1.315, 0.285], jaw, "lowerJaw");
  box(b, [0.13, 0.018, 0.025], "#d95749", [0, 1.353, 0.342], jaw, "lowerLip");

  // Large silhouette beard.
  b.extrude(
    [
      [-0.18, 0.08],
      [-0.17, 0.19],
      [-0.115, 0.27],
      [-0.055, 0.31],
      [0, 0.34, "sharp"],
      [0.055, 0.31],
      [0.115, 0.27],
      [0.17, 0.19],
      [0.18, 0.08],
      [0.13, -0.07],
      [0.075, -0.18],
      [0, -0.24, "sharp"],
      [-0.075, -0.18],
      [-0.13, -0.07],
    ],
    {
      at: [0, 1.39, 0.27],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      smoothing: 1,
      color: BEARD,
      bone: head,
      name: "beardSilhouette",
    },
  );

  // Braided beard strands and moustache.
  braid(
    b,
    [
      [-0.11, 1.40, 0.31],
      [-0.17, 1.34, 0.34],
      [-0.14, 1.22, 0.34],
      [-0.085, 1.16, 0.32],
    ],
    head,
    0.028,
    BEARD,
    "beardLeft",
  );
  braid(
    b,
    [
      [0.11, 1.40, 0.31],
      [0.17, 1.34, 0.34],
      [0.14, 1.22, 0.34],
      [0.085, 1.16, 0.32],
    ],
    head,
    0.028,
    BEARD,
    "beardRight",
  );
  braid(
    b,
    [
      [-0.025, 1.38, 0.335],
      [-0.055, 1.31, 0.35],
      [0, 1.245, 0.36],
      [0.045, 1.18, 0.34],
    ],
    head,
    0.032,
    BEARD,
    "beardCenter",
  );
  braid(
    b,
    [
      [-0.025, 1.405, 0.34],
      [-0.09, 1.405, 0.35],
      [-0.12, 1.39, 0.35],
      [-0.14, 1.37, 0.34],
    ],
    head,
    0.022,
    BEARD,
    "moustacheL",
  );
  braid(
    b,
    [
      [0.025, 1.405, 0.34],
      [0.09, 1.405, 0.35],
      [0.12, 1.39, 0.35],
      [0.14, 1.37, 0.34],
    ],
    head,
    0.022,
    BEARD,
    "moustacheR",
  );

  // Freckles across the cheeks.
  const cheekSurface = b.surface(skull);
  const freckles = cheekSurface.scatter(12, {
    rng: rng(402),
    minDist: 0.025,
    filter: (h) => h.n.z > 0.58 && h.at.y < 1.48,
  });
  for (let i = 0; i < freckles.length; i++) {
    b.stick(new THREE.SphereGeometry(0.009, 6, 4), "#55251e", freckles[i], {
      embed: 0.45,
      name: `freckle${i}`,
    });
  }

  // Helmet: brim, faceted dome, cheek guards, rivets, and a rear crest.
  cyl(b, 0.265, 0.045, DARK_STEEL, [0, 1.575, 0.025], head, "helmetBrim", 12);
  b.lathe(
    [
      [0, 0],
      [0.205, 0],
      [0.225, 0.035],
      [0.205, 0.09],
      [0.165, 0.145],
      [0.10, 0.19],
      [0, 0.205],
    ],
    {
      at: [0, 1.565, 0.025],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: STEEL,
      bone: head,
      name: "helmetDome",
    },
  );
  for (const side of [1, -1]) {
    box(b, [0.075, 0.17, 0.045], STEEL, [side * 0.185, 1.49, 0.105], head, `${side > 0 ? "cheekGuardL" : "cheekGuardR"}`);
    sphere(b, 0.018, BRASS, [side * 0.205, 1.555, 0.105], [1, 1, 1], head, `${side > 0 ? "helmetRivetL" : "helmetRivetR"}`);
    rod(
      b,
      [side * 0.15, 1.59, 0.13],
      [side * 0.215, 1.59, 0.13],
      0.012,
      BRASS,
      head,
      `${side > 0 ? "helmetTrimL" : "helmetTrimR"}`,
    );
  }
  box(b, [0.07, 0.19, 0.035], BRASS, [0, 1.68, -0.045], head, "helmetBackCrest");
  box(b, [0.11, 0.045, 0.045], BRASS, [0, 1.70, -0.045], head, "helmetCrestCap");

  // A short pair of side horns/guards gives the helmet a strong fantasy silhouette.
  for (const side of [1, -1]) {
    b.spike(
      [side * 0.205, 1.60, -0.005],
      [side * 0.22, 0.10, -0.12],
      0.13,
      0.035,
      { color: BRASS, bone: head, name: `${side > 0 ? "helmHornL" : "helmHornR"}`, caps: "point" },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Raised war hammer in the right hand.

  const hammerBone = rightArm.tip;
  rod(b, [-0.29, 1.13, 0.36], [-0.285, 1.555, 0.395], 0.026, WOOD, hammerBone, "hammerHandle");
  rod(b, [-0.285, 1.20, 0.395], [-0.285, 1.50, 0.395], 0.038, DARK_LEATHER, hammerBone, "hammerGrip");
  rod(b, [-0.285, 1.215, 0.395], [-0.285, 1.235, 0.395], 0.046, BRASS, hammerBone, "hammerGripBand");
  rod(b, [-0.285, 1.47, 0.395], [-0.285, 1.49, 0.395], 0.043, BRASS, hammerBone, "hammerTopBand");

  box(b, [0.255, 0.115, 0.13], DARK_STEEL, [-0.285, 1.58, 0.395], hammerBone, "hammerHead");
  box(b, [0.13, 0.13, 0.16], STEEL, [-0.395, 1.58, 0.395], hammerBone, "hammerFace");
  b.spike(
    [-0.16, 1.58, 0.395],
    [-1, 0, 0],
    0.12,
    0.055,
    { color: STEEL, bone: hammerBone, name: "hammerPeen", caps: "point" },
  );
  box(b, [0.27, 0.018, 0.018], BRASS, [-0.285, 1.625, 0.395], hammerBone, "hammerTopTrim");
  box(b, [0.27, 0.018, 0.018], BRASS, [-0.285, 1.535, 0.395], hammerBone, "hammerBottomTrim");

  b.part(new THREE.PlaneGeometry(0.095, 0.055), "#ffffff", {
    at: [-0.285, 1.58, 0.466],
    dir: [0, 0, 1],
    axis: "z",
    texture: HAMMER_RUNE,
    bone: hammerBone,
    name: "hammerRune",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // The anvil: broad top, square waist, horn, base feet, rivets, and a glowing billet.

  const anvilBone = hips;
  box(b, [0.42, 0.105, 0.255], ANVIL_IRON, [0, 0.735, 0.43], anvilBone, "anvilTop");
  box(b, [0.29, 0.10, 0.18], DARK_STEEL, [0, 0.655, 0.43], anvilBone, "anvilShoulder");
  b.frustumBox(
    [0, 0.29, 0.43],
    [0, 0.66, 0.43],
    [0.28, 0.20],
    [0.19, 0.16],
    { color: ANVIL_IRON, bone: anvilBone, name: "anvilWaist" },
  );
  box(b, [0.51, 0.13, 0.31], ANVIL_IRON, [0, 0.18, 0.43], anvilBone, "anvilBase");
  box(b, [0.58, 0.09, 0.18], DARK_STEEL, [0, 0.075, 0.43], anvilBone, "anvilFootPlate");

  // Four blocky feet make the contact silhouette especially readable.
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      box(
        b,
        [0.16, 0.13, 0.13],
        ANVIL_IRON,
        [sx * 0.195, 0.105, 0.43 + sz * 0.095],
        anvilBone,
        `anvilFoot${sx > 0 ? "L" : "R"}${sz > 0 ? "F" : "B"}`,
      );
    }
  }

  // Horn extending toward the viewer.
  b.spike(
    [0, 0.765, 0.545],
    [0, 0, 1],
    0.30,
    0.115,
    { color: ANVIL_IRON, bone: anvilBone, name: "anvilHorn", caps: "point" },
  );
  box(b, [0.34, 0.035, 0.035], BRASS, [0, 0.795, 0.47], anvilBone, "anvilTopEdge");
  box(b, [0.34, 0.028, 0.028], DARK_STEEL, [0, 0.682, 0.43], anvilBone, "anvilShoulderEdge");

  const anvilRivets = [
    [-0.19, 0.25, 0.54],
    [0.19, 0.25, 0.54],
    [-0.19, 0.25, 0.32],
    [0.19, 0.25, 0.32],
    [-0.22, 0.735, 0.32],
    [0.22, 0.735, 0.32],
    [-0.22, 0.735, 0.54],
    [0.22, 0.735, 0.54],
  ];
  rivetRow(b, anvilRivets, BRASS, anvilBone, 0.018, "anvilRivet");

  // A hot billet gives the scene its blacksmith identity and a small warm glow.
  const billet = b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.045, 8), HOT_METAL, {
    at: [0, 0.812, 0.47],
    dir: [0, 1, 0],
    bone: anvilBone,
    name: "glowingBillet",
  });
  glow(billet, 1.8);
  const billetCore = b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.05, 8), HOT_CORE, {
    at: [0, 0.835, 0.47],
    dir: [0, 1, 0],
    bone: anvilBone,
    name: "billetCore",
  });
  glow(billetCore, 2.3);

  // Tiny sparks frozen in a stylized arc above the anvil.
  const sparkPoints = [
    [-0.10, 0.91, 0.48],
    [0.08, 0.95, 0.51],
    [0.14, 1.02, 0.48],
    [-0.04, 1.04, 0.53],
    [0.04, 1.10, 0.49],
  ];
  sparkPoints.forEach((p, i) => {
    const spark = sphere(b, 0.012 + (i % 2) * 0.004, HOT_CORE, p, [1, 1.4, 1], anvilBone, `spark${i}`);
    glow(spark, 2.0);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Small finishing details: apron ties, beard tassel, belt hanging tools, and a coil spring charm.

  rod(b, [-0.20, 0.91, 0.22], [-0.27, 0.72, 0.19], 0.012, LEATHER, hips, "apronTieL");
  rod(b, [0.20, 0.91, 0.22], [0.27, 0.72, 0.19], 0.012, LEATHER, hips, "apronTieR");
  tassel(b, [-0.27, 0.72, 0.19], hips, BRASS, "apronTasselL");
  tassel(b, [0.27, 0.72, 0.19], hips, BRASS, "apronTasselR");

  // Belt-hung tongs and a little metal measuring charm.
  rod(b, [0.20, 0.87, 0.07], [0.32, 0.62, 0.08], 0.011, DARK_STEEL, hips, "beltToolLoop");
  rod(b, [0.32, 0.62, 0.08], [0.36, 0.52, 0.08], 0.008, DARK_STEEL, hips, "beltToolDrop");
  sphere(b, 0.028, BRASS, [0.36, 0.51, 0.08], [1, 1, 0.5], hips, "beltToolWeight");

  const charmPath = coil(
    [0.245, 0.86, -0.005],
    [0.31, 0.69, -0.005],
    0.022,
    3.5,
  );
  b.sweep(charmPath, 0.0045, {
    color: COPPER,
    bone: hips,
    caps: "round",
    name: "beltCoilCharm",
  });

  return b.root;
}
```