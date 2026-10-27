import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
  spots,
  stripes,
} from "../../../../src/index";
import {
  animeEye,
  cel,
  furEdge,
  inkLines,
  INK,
} from "../../../../kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A vividly painted Oaxacan alebrije: a spotted jaguar body with an eagle's wings, crest, beak, talons, and long feathered tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const ORANGE = cel("#e87526", "#9c2e24");
  const GOLD = cel("#f5b82e", "#b94a27");
  const TURQUOISE = cel("#20c7b5", "#087f89");
  const BLUE = cel("#347ed0", "#253c9d");
  const MAGENTA = cel("#ed397e", "#8d206a");
  const PURPLE = cel("#7136ad", "#351d6b");
  const CREAM = cel("#ffe7a6", "#d18b57");
  const DARK = cel("#24152a", "#100c1d");
  const BEAK = cel("#f3c42e", "#b24d24");
  const SPOT = cel("#302047", "#160e27");
  const WOOD = furEdge(ORANGE, CREAM, {
    level: -0.18,
    teeth: 0.18,
    period: 0.07,
    ink: INK,
    inkWidth: 0.025,
  });
  const COAT = spots(WOOD, [SPOT, MAGENTA, BLUE], {
    size: 0.16,
    amount: 0.72,
    rosette: true,
    seed: 11,
  });
  const STRIPED = stripes(ORANGE, [MAGENTA, TURQUOISE], {
    size: 0.23,
    width: 0.28,
    wobble: 0.25,
    seed: 7,
  });

  const hips = b.joint("hips", {
    at: [0, 0.78, -0.15],
    dir: [0, 0.04, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.28],
      [0, 0.86, 0.12],
      [0, 0.93, 0.47],
      [0, 1.02, 0.72],
    ]),
    { parent: hips, names: ["spine1", "spine2", "shoulders"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.0, 0.68],
      [0, 1.12, 0.83],
      [0, 1.29, 0.9],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.3, 0.91],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.245, 1.02],
    dir: [0, -0.08, 1],
    role: "jaw",
  });

  const torso = b.sweep(spine, (t) => 0.25 - t * 0.035, {
    color: COAT,
    section: { ngon: 8 },
    sides: 8,
    name: "painted-jaguar-torso",
  });
  b.sweep(neck, [0.18, 0.13], {
    color: STRIPED,
    section: { ngon: 8 },
    name: "striped-neck",
  });

  const skull = b.part(
    new THREE.SphereGeometry(0.205, 12, 8),
    COAT,
    {
      bone: head,
      at: [0, 1.32, 0.98],
      scale: [1.03, 0.92, 1.12],
      flat: true,
      group: "head",
      name: "jaguar-skull",
    },
  );
  const muzzle = b.part(
    new THREE.SphereGeometry(0.145, 10, 6),
    CREAM,
    {
      bone: head,
      at: [0, 1.25, 1.16],
      scale: [1.05, 0.64, 0.86],
      flat: true,
      name: "cream-muzzle",
    },
  );
  b.part(
    new THREE.SphereGeometry(0.065, 8, 5),
    DARK,
    { bone: head, at: [0, 1.29, 1.285], name: "nose" },
  );

  const upperJaw = b.part(
    new THREE.BoxGeometry(0.19, 0.07, 0.22),
    CREAM,
    { bone: head, at: [0, 1.22, 1.19], name: "upper-jaw" },
  );
  b.part(
    new THREE.BoxGeometry(0.16, 0.045, 0.19),
    DARK,
    { bone: jaw, at: [0, 1.205, 1.2], name: "open-lower-jaw" },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: -12 });

  const EYE = animeEye({ iris: "#20d7cc", irisLight: "#fff5b3", size: 256 });
  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around([0, 1.32, 0.98]).at(s * 42, 4);
    if (hit)
      b.decal(faceSurface, EYE, {
        at: hit,
        size: [0.095, 0.125],
        mirror: s > 0,
        lift: 0.004,
        name: `painted-eye-${s}`,
      });
    const brow = b.sweep(
      catmull([
        [s * 0.08, 1.405, 1.115],
        [s * 0.14, 1.43, 1.075],
        [s * 0.18, 1.4, 1.0],
      ]),
      0.018,
      { color: PURPLE, caps: "round", name: `brow-${s}` },
    );
    void brow;
  }

  // Jaguar ears, intentionally oversized and painted like carved wooden petals.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.15, 0.02],
        [0.115, 0.19],
        [0.025, 0.28],
        [0, 0.12],
      ],
      {
        at: [s * 0.14, 1.44, 0.91],
        x: [s, 0, 0],
        y: [0, 0.95, 0.15],
        thickness: 0.045,
        bevel: 0.012,
        smoothing: 1,
        color: MAGENTA,
        bone: head,
        name: `jaguar-ear-${s}`,
      },
    );
    b.part(
      new THREE.ConeGeometry(0.045, 0.13, 6),
      CREAM,
      {
        bone: head,
        at: [s * 0.145, 1.58, 0.9],
        dir: [0, 0.2, 1],
        name: `ear-tuft-${s}`,
      },
    );
  }

  // Crown crest: a fan of broad, carved feathers.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.045;
    b.extrude(
      [
        [0, 0],
        [0.035, 0.015],
        [0.08, 0.22 + Math.abs(i) * 0.018],
        [0.02, 0.34 + (3 - Math.abs(i)) * 0.025],
        [-0.03, 0.12],
      ],
      {
        at: [x, 1.43, 0.82],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.006,
        color: [TURQUOISE, GOLD, BLUE, MAGENTA][(i + 3) % 4],
        bone: head,
        name: `crown-feather-${i + 3}`,
      },
    );
  }

  // Golden eagle beak and cheek feathers.
  b.part(
    new THREE.ConeGeometry(0.105, 0.32, 6),
    BEAK,
    {
      bone: head,
      at: [0, 1.315, 1.36],
      dir: [0, -0.18, 1],
      rotation: [0, 0, 180],
      name: "hooked-eagle-beak",
    },
  );
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.028, 0.16, 6), CREAM, {
      bone: head,
      at: [s * 0.155, 1.3, 1.08],
      dir: [s * 0.25, 0.15, 1],
      name: `cheek-whisker-${s}`,
    });
  }

  const legTargets = [
    [-0.19, 0.16, 0.48],
    [0.19, 0.16, 0.48],
    [-0.2, 0.14, -0.42],
    [0.2, 0.14, -0.42],
  ] as const;
  for (let i = 0; i < 4; i++) {
    const s = i % 2 === 0 ? -1 : 1;
    const front = i < 2;
    const root = [
      s * (front ? 0.18 : 0.2),
      front ? 0.88 : 0.78,
      front ? 0.48 : -0.3,
    ] as [number, number, number];
    const pts = limb(root, legTargets[i], [0.32, 0.3, 0.17], [
      [0, 0, front ? 1 : -1],
      [0, 0, front ? -1 : 1],
    ]);
    const leg = b.chain(`leg${front ? "F" : "H"}${s > 0 ? "L" : "R"}`, pts, {
      parent: spine.joints[front ? 1 : 0],
      names: [`hip${s > 0 ? "L" : "R"}${front ? "F" : "H"}`, `knee${i}`, `ankle${i}`],
      role: "leg",
      contact: legTargets[i],
    });
    b.sweep(leg, [0.075, 0.05], {
      color: COAT,
      section: { ngon: 6 },
      name: `carved-leg-${i}`,
    });
    for (let toe = -1; toe <= 1; toe++) {
      const p = [legTargets[i][0] + toe * 0.035, 0.13, legTargets[i][2] + 0.05];
      b.spike(p, [0, -0.1, 1], 0.14, 0.022, {
        color: BEAK,
        bone: leg.tip,
        name: `talon-${i}-${toe}`,
      });
    }
  }

  // Eagle wings: articulated feather fingers and colorful membranes.
  for (const s of [-1, 1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.2, 1.02, 0.45],
        [s * 0.45, 1.25, 0.35],
        [s * 0.8, 1.48, 0.15],
        [s * 1.08, 1.4, -0.02],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${s > 0 ? "L" : "R"}`, `elbow${s}`, `wingTip${s}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.12, 0.035], {
      color: TURQUOISE,
      section: { ngon: 6 },
      name: `wing-arm-${s}`,
    });
    const outer = b.chain(
      `wingFeathers${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.42, 1.2, 0.33],
        [s * 0.74, 1.22, 0.12],
        [s * 1.18, 1.08, -0.3],
      ]),
      { parent: wing.joints[1], names: [`featherBase${s}`, `featherTip${s}`], role: "fan" },
    );
    b.membrane(wing, outer, {
      color: furEdge(BLUE, MAGENTA, {
        level: 0.2,
        teeth: 0.18,
        period: 0.12,
        axis: [0, 0, 1],
        along: [0, 1, 0],
        ink: INK,
      }),
      thickness: 0.018,
      rows: 4,
      cols: 7,
      scallop: 0.18,
      name: `painted-wing-membrane-${s}`,
    });
    for (let j = 0; j < 7; j++) {
      const t = j / 6;
      const p = outer.at(t);
      b.spike(p, [s * 0.2, 0.16, -0.9], 0.42 + j * 0.035, 0.028, {
        color: [GOLD, MAGENTA, CREAM][j % 3],
        name: `flight-feather-${s}-${j}`,
      });
    }
  }

  // Long striped jaguar tail ending in a fan of eagle feathers.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.75, -0.38],
      [0, 0.68, -0.78],
      [0.05, 0.72, -1.12],
      [0.16, 0.86, -1.4],
      [0.24, 1.02, -1.62],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );
  const tailTube = b.sweep(tail, (t) => 0.12 * (1 - t) + 0.025, {
    color: STRIPED,
    section: { ngon: 7 },
    name: "painted-striped-tail",
  });
  for (let i = -3; i <= 3; i++) {
    const base = tail.at(0.86);
    b.spike(base, [i * 0.17, 0.14, -0.75], 0.42 + (3 - Math.abs(i)) * 0.08, 0.035, {
      color: [GOLD, BLUE, MAGENTA, TURQUOISE][(i + 3) % 4],
      name: `tail-plume-${i + 3}`,
    });
  }

  // Painted wood rosettes and turquoise studs across the shoulders.
  const studs = b.surface(torso).scatter(22, {
    rng: rng(21),
    minDist: 0.105,
    filter: (h) => h.n.y > -0.2,
  });
  for (let i = 0; i < studs.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.018, 0.014, 0.018, 6),
      i % 3 === 0 ? GOLD : TURQUOISE,
      studs[i],
      { embed: 0.35, name: `wood-inlay-${i}` },
    );
  }

  // A few carved whiskers make the silhouette unmistakably jaguar-like.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        catmull([
          [s * 0.09, 1.25 - i * 0.035, 1.23],
          [s * (0.27 + i * 0.025), 1.27 - i * 0.025, 1.28],
          [s * (0.4 + i * 0.02), 1.3 - i * 0.02, 1.21],
        ]),
        0.006,
        { color: CREAM, caps: "round", name: `whisker-${s}-${i}` },
      );
    }
  }

  return b.root;
}
