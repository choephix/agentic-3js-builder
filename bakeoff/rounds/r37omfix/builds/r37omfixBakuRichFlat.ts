import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  limb,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A low-poly ukiyo-e woodblock interpretation of the Japanese baku: a friendly tapir spirit with indigo fur, vermilion markings, cream muzzle, curled dream wisps, cloud motifs, and a glowing golden dream jewel.",
};

const INK = "#211827";
const NIGHT = "#26375f";
const DEEP = "#182844";
const INDIGO = "#334f83";
const BLUE = "#5276a9";
const CREAM = "#f1d9a6";
const PALE = "#ffecc4";
const VERMILION = "#c94d3c";
const RED_DARK = "#79333c";
const GOLD = "#d9a744";
const GOLD_LIGHT = "#f4d477";
const JADE = "#4d9b91";
const WHITE = "#fff4d5";
const SHADOW = "#342a3c";
const WAVE = "#315678";
const WAVE_LIGHT = "#7098af";

function sphere(
  b: ReturnType<typeof createBuilder>,
  bone: any,
  at: any,
  scale: [number, number, number],
  color: string,
  segments = 10,
  rings = 7,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, segments, rings), color, {
    bone,
    at,
    scale,
    name,
    flat: true,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  bone: any,
  at: any,
  size: [number, number, number],
  color: string,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    bone,
    at,
    name,
    flat: true,
  });
}

function bead(
  b: ReturnType<typeof createBuilder>,
  bone: any,
  at: any,
  r: number,
  color: string,
  name?: string,
) {
  return sphere(b, bone, at, [r, r, r], color, 7, 5, name);
}

function stripe(
  b: ReturnType<typeof createBuilder>,
  bone: any,
  a: any,
  c: any,
  radius: number,
  color: string,
  name?: string,
) {
  return b.rod(a, c, radius, { bone, color, caps: "flat", name });
}

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  // -----------------------------------------------------------------------------------------------
  // Skeleton first: the calm, broad resting pose of a tapir spirit.

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.34],
    dir: [0, 0.12, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.72, -0.34],
    [0, 0.82, -0.05],
    [0, 0.91, 0.24],
    [0, 1.02, 0.52],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
    group: "body",
  });

  const neckPath = catmull([
    [0, 1.02, 0.52],
    [0, 1.12, 0.67],
    [0, 1.22, 0.79],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "body",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.22, 0.79],
    dir: [0, 0.06, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.16, 0.88],
    dir: [0, -0.28, 0.96],
    role: "jaw",
    group: "head",
  });

  const trunkPath = catmull([
    [0, 1.17, 0.92],
    [0, 1.10, 1.04],
    [0, 1.02, 1.18],
    [0, 0.96, 1.30],
    [0, 0.91, 1.40],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: jaw,
    names: ["trunk1", "trunk2", "trunk3", "trunk4"],
    role: "spine",
    group: "head",
  });

  const tailPath = catmull([
    [0, 0.76, -0.56],
    [0, 0.79, -0.78],
    [0, 0.88, -0.96],
    [0, 0.98, -1.10],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
    group: "body",
  });

  const legSpecs = [
    {
      side: "L",
      x: 0.22,
      z: -0.27,
      target: [0.29, 0.10, -0.38],
      names: ["hipL", "kneeL", "ankleL"],
    },
    {
      side: "R",
      x: -0.22,
      z: -0.27,
      target: [-0.29, 0.10, -0.38],
      names: ["hipR", "kneeR", "ankleR"],
    },
    {
      side: "L",
      x: 0.20,
      z: 0.36,
      target: [0.25, 0.10, 0.45],
      names: ["shoulderL", "elbowL", "wristL"],
    },
    {
      side: "R",
      x: -0.20,
      z: 0.36,
      target: [-0.25, 0.10, 0.45],
      names: ["shoulderR", "elbowR", "wristR"],
    },
  ];

  const legs: any[] = [];
  for (const spec of legSpecs) {
    const root = [spec.x, 0.78, spec.z];
    const target = spec.target;
    const points = limb(
      root,
      target,
      [0.25, 0.25],
      spec.z < 0 ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(`leg${spec.side}${spec.z < 0 ? "H" : "F"}`, points, {
      parent: hips,
      names: spec.names,
      role: "leg",
      group: "legs",
      contact: target,
    });
    legs.push({ chain, spec, points });
  }

  // -----------------------------------------------------------------------------------------------
  // Main silhouette: chunky tapir body, angular facets, dark back and pale belly.

  const body = b.sweep(spine, (t) => 0.29 - t * 0.055, {
    color: INDIGO,
    sides: 8,
    caps: "round",
    group: "body",
    name: "faceted indigo body",
    sectors: [
      [112, 248, CREAM],
      [250, 290, RED_DARK],
    ],
  });

  b.sweep(neck, (t) => 0.18 - t * 0.02, {
    color: NIGHT,
    sides: 8,
    caps: "round",
    group: "body",
    name: "short spirit neck",
    sectors: [[112, 248, CREAM]],
  });

  b.sweep(tail, (t) => 0.105 - t * 0.065, {
    color: NIGHT,
    sides: 7,
    caps: { start: "round", end: "point" },
    group: "body",
    name: "tapered tail",
  });

  // Belly bib and shoulder patches, built as strongly readable woodblock shapes.
  b.sweep(
    catmull([
      [0, 0.82, 0.26],
      [0, 0.76, 0.42],
      [0, 0.70, 0.56],
    ]),
    [0.16, 0.075],
    {
      bone: hips,
      color: CREAM,
      sides: 6,
      caps: "round",
      name: "cream belly bib",
      group: "markings",
    },
  );

  for (const s of [1, -1]) {
    const shoulder = [s * 0.175, 0.91, 0.31];
    sphere(b, hips, shoulder, [0.12, 0.19, 0.14], VERMILION, 8, 6, `vermilion shoulder ${s}`);
    stripe(
      b,
      hips,
      [s * 0.225, 0.86, 0.23],
      [s * 0.245, 0.77, 0.12],
      0.018,
      GOLD,
      `shoulder gold stripe ${s}`,
    );
  }

  // Blocky leg tubes and cream socks.
  for (const item of legs) {
    const c = item.chain;
    b.sweep(c, [0.095, 0.075], {
      color: NIGHT,
      sides: 6,
      caps: "round",
      group: "legs",
      name: `dark ${item.spec.side} leg`,
    });

    const sockPath = catmull([
      item.points[1],
      item.points[2],
      item.spec.target,
    ]);
    b.sweep(sockPath, [0.088, 0.068], {
      color: CREAM,
      sides: 6,
      caps: "round",
      group: "legs",
      name: `cream ${item.spec.side} sock`,
    });

    const foot = item.spec.target;
    box(
      b,
      c.tip,
      [foot[0], 0.085, foot[2] + 0.025],
      [0.19, 0.09, 0.25],
      INK,
      `ink hoof ${item.spec.side}`,
    );
    box(
      b,
      c.tip,
      [foot[0], 0.112, foot[2] + 0.052],
      [0.15, 0.035, 0.16],
      VERMILION,
      `vermilion hoof sole ${item.spec.side}`,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Head: the identity cue is a huge soft tapir head with a long, expressive trunk.

  sphere(b, head, [0, 1.25, 0.79], [0.275, 0.255, 0.30], NIGHT, 12, 8, "large tapir skull");
  sphere(b, head, [0, 1.18, 0.94], [0.24, 0.18, 0.24], CREAM, 10, 7, "cream cheek muzzle");
  b.sweep(trunk, (t) => 0.105 - t * 0.07, {
    color: CREAM,
    sides: 7,
    caps: { start: "round", end: "round" },
    group: "head",
    name: "long cream dream-snuffling trunk",
  });

  // Nose pad and nostril marks.
  sphere(b, trunk.tip, [0, 0.91, 1.405], [0.092, 0.055, 0.045], INK, 8, 5, "velvet nose");
  for (const s of [1, -1]) {
    bead(b, trunk.tip, [s * 0.035, 0.925, 1.442], 0.012, GOLD_LIGHT, `nostril glint ${s}`);
  }

  // Open jaw: separate upper and lower planes, with a dark mouth slit.
  box(b, jaw, [0, 1.105, 1.02], [0.25, 0.105, 0.22], CREAM, "lower jaw");
  box(b, jaw, [0, 1.135, 1.118], [0.185, 0.024, 0.012], INK, "open mouth line");
  for (const s of [1, -1]) {
    const tooth = [s * 0.068, 1.105, 1.125];
    b.part(new THREE.ConeGeometry(0.018, 0.06, 6), PALE, {
      bone: jaw,
      at: tooth,
      dir: [0, -1, 0],
      name: `small dream tooth ${s}`,
    });
  }

  // Eyes: dark almond surround, gold iris, cream highlight.
  for (const s of [1, -1]) {
    const ex = s * 0.145;
    sphere(b, head, [ex, 1.29, 0.968], [0.072, 0.078, 0.035], INK, 9, 6, `ink eye ${s}`);
    sphere(b, head, [ex, 1.29, 1.000], [0.046, 0.052, 0.018], GOLD, 8, 5, `gold iris ${s}`);
    sphere(b, head, [ex, 1.298, 1.018], [0.018, 0.028, 0.009], INK, 7, 5, `black pupil ${s}`);
    bead(b, head, [ex - s * 0.015, 1.32, 1.028], 0.009, WHITE, `eye glint ${s}`);

    // Painted eyebrow slash.
    stripe(
      b,
      head,
      [ex - s * 0.065, 1.375, 0.972],
      [ex + s * 0.06, 1.395, 0.972],
      0.012,
      VERMILION,
      `vermilion brow ${s}`,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Ears: broad leaf-like black ears with vermilion inner woodblock cuts.

  const earOutline: [number, number, "sharp"][] = [
    [-0.11, 0, "sharp"],
    [-0.17, 0.10, "sharp"],
    [-0.13, 0.28, "sharp"],
    [-0.045, 0.38, "sharp"],
    [0.065, 0.27, "sharp"],
    [0.10, 0.08, "sharp"],
    [0.06, 0, "sharp"],
  ];

  for (const s of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.17, 1.41, 0.76],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: INK,
      bone: head,
      name: `black leaf ear ${s}`,
      group: "head",
    });

    b.extrude(
      [
        [-0.055, 0.025],
        [-0.085, 0.11],
        [-0.055, 0.235],
        [0.03, 0.17],
        [0.055, 0.06],
      ],
      {
        at: [s * 0.175, 1.43, 0.775],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        bevel: 0.006,
        color: VERMILION,
        bone: head,
        name: `vermilion inner ear ${s}`,
        group: "markings",
      },
    );

    stripe(
      b,
      head,
      [s * 0.19, 1.48, 0.77],
      [s * 0.19, 1.65, 0.77],
      0.009,
      GOLD,
      `ear woodgrain ${s}`,
    );
  }

  // A forehead diamond, the traditional talisman-like focal point.
  const diamond = b.extrude(
    [
      [0, 0.10, "sharp"],
      [0.065, 0.18, "sharp"],
      [0, 0.27, "sharp"],
      [-0.065, 0.18, "sharp"],
    ],
    {
      at: [0, 1.30, 1.055],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.008,
      color: GOLD,
      bone: head,
      name: "forehead dream diamond",
      group: "ornament",
    },
  );
  bead(b, head, [0, 1.48, 1.08], 0.027, GOLD_LIGHT, "diamond highlight");

  // -----------------------------------------------------------------------------------------------
  // Dream-eating spirit details: curled wisps and woodblock cloud ornaments.

  const wispPaths = [
    catmull([
      [0.12, 1.05, 0.70],
      [0.36, 1.17, 0.67],
      [0.49, 1.34, 0.76],
      [0.42, 1.48, 0.92],
      [0.28, 1.53, 1.00],
    ]),
    catmull([
      [-0.11, 1.01, 0.64],
      [-0.34, 1.13, 0.60],
      [-0.47, 1.30, 0.68],
      [-0.42, 1.45, 0.84],
      [-0.28, 1.48, 0.93],
    ]),
    catmull([
      [0.05, 0.92, -0.47],
      [0.34, 1.00, -0.63],
      [0.47, 1.14, -0.55],
      [0.39, 1.23, -0.39],
      [0.25, 1.19, -0.32],
    ]),
  ];

  wispPaths.forEach((path, i) => {
    b.sweep(path, [0.026, 0.008], {
      bone: i === 2 ? hips : head,
      color: i === 1 ? GOLD : JADE,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `curled dream wisp ${i + 1}`,
      group: "dream magic",
    });
  });

  // Small gold beads make the wisps read as deliberate print motifs.
  const beadPositions = [
    [0.48, 1.34, 0.76],
    [-0.46, 1.30, 0.68],
    [0.47, 1.14, -0.55],
    [0.25, 1.19, -0.32],
  ];
  beadPositions.forEach((p, i) => bead(b, i < 2 ? head : hips, p, 0.026, GOLD, `dream bead ${i}`));

  // -----------------------------------------------------------------------------------------------
  // Ukiyo-e cloud forms behind the spirit, kept attached to the root as graphic framing.

  const cloud1 = b.sweep(
    catmull([
      [-0.62, 0.28, 0.05],
      [-0.78, 0.35, 0.12],
      [-0.72, 0.47, 0.20],
      [-0.55, 0.49, 0.16],
      [-0.45, 0.42, 0.06],
      [-0.28, 0.44, 0.02],
    ]),
    0.055,
    {
      bone: hips,
      color: WAVE_LIGHT,
      sides: 6,
      caps: "round",
      name: "left cloud curl",
      group: "cloud frame",
    },
  );

  const cloud2 = b.sweep(
    catmull([
      [0.62, 0.29, 0.02],
      [0.78, 0.37, 0.10],
      [0.72, 0.50, 0.18],
      [0.54, 0.52, 0.14],
      [0.43, 0.44, 0.04],
      [0.28, 0.45, 0.01],
    ]),
    0.055,
    {
      bone: hips,
      color: WAVE_LIGHT,
      sides: 6,
      caps: "round",
      name: "right cloud curl",
      group: "cloud frame",
    },
  );

  // Bold dark cloud underlines, like separate carved blocks.
  stripe(b, hips, [-0.72, 0.27, 0.08], [-0.30, 0.27, 0.02], 0.018, DEEP, "left cloud ink");
  stripe(b, hips, [0.72, 0.28, 0.06], [0.30, 0.28, 0.01], 0.018, DEEP, "right cloud ink");

  // -----------------------------------------------------------------------------------------------
  // Stylized wave crests around the feet: a compact print border, not a separate scene.

  const wavePath = catmull([
    [-0.62, 0.045, -0.08],
    [-0.42, 0.075, 0.04],
    [-0.22, 0.04, -0.03],
    [0, 0.08, 0.06],
    [0.22, 0.04, -0.03],
    [0.42, 0.075, 0.04],
    [0.62, 0.045, -0.08],
  ]);

  b.sweep(wavePath, 0.025, {
    bone: hips,
    color: WAVE,
    sides: 6,
    caps: "round",
    name: "front wave border",
    group: "woodblock frame",
  });

  for (const s of [1, -1]) {
    const foam = catmull([
      [s * 0.20, 0.07, -0.01],
      [s * 0.34, 0.10, 0.07],
      [s * 0.48, 0.08, 0.00],
    ]);
    b.sweep(foam, 0.012, {
      bone: hips,
      color: PALE,
      sides: 5,
      caps: "round",
      name: `wave foam ${s}`,
      group: "woodblock frame",
    });
  }

  // A few carved-looking red marks on the back.
  stripe(b, spine.joints[0], [-0.16, 0.91, -0.28], [-0.16, 0.98, -0.05], 0.014, VERMILION, "back mark left");
  stripe(b, spine.joints[0], [0.16, 0.91, -0.28], [0.16, 0.98, -0.05], 0.014, VERMILION, "back mark right");
  stripe(b, spine.joints[1], [-0.13, 1.00, -0.02], [-0.13, 1.06, 0.19], 0.012, GOLD, "back gold left");
  stripe(b, spine.joints[1], [0.13, 1.00, -0.02], [0.13, 1.06, 0.19], 0.012, GOLD, "back gold right");

  // Small decorative tassels beneath the dream wisps.
  for (const s of [1, -1]) {
    const top = [s * 0.42, 1.30, 0.74];
    const tip = [s * 0.45, 1.12, 0.70];
    b.sweep(bezier(top, [s * 0.48, 1.23, 0.72], [s * 0.43, 1.15, 0.68], tip), [0.018, 0.004], {
      bone: head,
      color: GOLD,
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `gold tassel ${s}`,
      group: "ornament",
    });
  }

  return b.root;
}
