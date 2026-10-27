import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "alebrije-jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije combining a spotted jaguar body with an eagle's beak, crest, talons, and enormous patterned wings.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const BLUE = cel("#1769b0", "#0b2d68");
  const TURQUOISE = cel("#18c5b5", "#08736f");
  const MAGENTA = cel("#d52d83", "#721449");
  const GOLD = cel("#ffc52e", "#b86612");
  const ORANGE = cel("#f36d27", "#9f2f20");
  const RED = cel("#e53632", "#771c2c");
  const PURPLE = cel("#7136ad", "#371c72");
  const CREAM = cel("#fff0b2", "#c98d56");
  const BLACK = "#211426";
  const WHITE = "#fff9dc";

  const jaguarCoat = furEdge(
    cel("#ef8a24", "#9c321e"),
    cel("#efcf69", "#9e6338"),
    {
      by: "normal",
      level: -0.16,
      teeth: 0.18,
      period: 0.13,
      ink: "#5b1d2d",
      inkWidth: 0.025,
    },
  );

  const spots = paint((p, n) => {
    const q = Math.sin(p.x * 34 + Math.sin(p.z * 12) * 2.2) *
      Math.sin(p.z * 29 + p.y * 11);
    const rosette =
      Math.sin(p.x * 61 + p.z * 17) *
      Math.sin(p.z * 53 - p.x * 13);
    if (q > 0.54 && rosette > -0.35) return n.y > 0.25 ? "#39172e" : "#55203f";
    if (q > 0.68) return "#f7d04b";
    return jaguarCoat;
  });

  const wingPaint = paint((p, n) => {
    const stripe = Math.sin(p.x * 18 + p.z * 8 + p.y * 7);
    if (stripe > 0.45) return MAGENTA;
    if (stripe < -0.55) return TURQUOISE;
    return n.y > 0.25 ? BLUE : PURPLE;
  });

  // Skeleton first: spine, head, jaws, tail, legs, wings, and feather fingers.
  const hips = b.joint("hips", {
    at: [0, 0.84, -0.3],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.84, -0.55],
    [0, 0.9, -0.15],
    [0, 0.96, 0.25],
    [0, 1.08, 0.62],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "shoulders"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.03, 0.45],
      [0, 1.16, 0.62],
      [0, 1.28, 0.76],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.31, 0.82],
    dir: [0, 0.04, 1],
    role: "head",
    group: "face",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.27, 0.9],
    dir: [0, -0.25, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.84, -0.55],
      [0, 0.79, -0.95],
      [0, 0.91, -1.3],
      [0.08, 1.08, -1.57],
      [0.2, 1.23, -1.72],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legTargets = [
    [0.29, 0.13, 0.38],
    [-0.29, 0.13, 0.38],
    [0.3, 0.13, -0.42],
    [-0.3, 0.13, -0.42],
  ] as const;
  const legNames = [
    ["hipL", "kneeL", "ankleL"],
    ["hipR", "kneeR", "ankleR"],
    ["hipBackL", "kneeBackL", "ankleBackL"],
    ["hipBackR", "kneeBackR", "ankleBackR"],
  ];
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    const root = [
      s * (i < 2 ? 0.28 : 0.25),
      0.87,
      i < 2 ? 0.3 : -0.38,
    ] as const;
    const pts = limb(
      root,
      legTargets[i],
      [0.27, 0.27, 0.18],
      [
        [0, 0, i < 2 ? 1 : -1],
        [0, 0, i < 2 ? -1 : 1],
      ],
      { sole: [0, 0, 1] },
    );
    legs.push(
      b.chain(`leg${i}`, pts, {
        parent: hips,
        names: legNames[i],
        role: "leg",
        contact: legTargets[i],
      }),
    );
  }

  const wingL = b.chain(
    "wingL",
    catmull([
      [0.3, 1.02, 0.38],
      [0.65, 1.2, 0.35],
      [1.02, 1.42, 0.25],
      [1.42, 1.58, 0.1],
    ]),
    { parent: spine.joints[2], names: ["wingL", "wingL2", "wingL3"], role: "wing" },
  );
  const wingR = b.chain(
    "wingR",
    catmull([
      [-0.3, 1.02, 0.38],
      [-0.65, 1.2, 0.35],
      [-1.02, 1.42, 0.25],
      [-1.42, 1.58, 0.1],
    ]),
    { parent: spine.joints[2], names: ["wingR", "wingR2", "wingR3"], role: "wing" },
  );

  const featherL = b.chain(
    "featherL",
    catmull([
      [1.0, 1.42, 0.25],
      [1.35, 1.57, 0.05],
      [1.78, 1.56, -0.15],
    ]),
    { parent: wingL.tip, names: ["featherL", "featherL2"], role: "fan" },
  );
  const featherR = b.chain(
    "featherR",
    catmull([
      [-1.0, 1.42, 0.25],
      [-1.35, 1.57, 0.05],
      [-1.78, 1.56, -0.15],
    ]),
    { parent: wingR.tip, names: ["featherR", "featherR2"], role: "fan" },
  );

  // Main body and tail.
  b.sweep(spine, (t) => 0.26 - t * 0.035, {
    color: spots,
    section: "box",
    sides: 8,
    name: "painted-jaguar-torso",
  });
  b.sweep(neck, [0.2, 0.15], {
    color: spots,
    section: "box",
    name: "neck",
  });
  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.035, {
    color: spots,
    section: "box",
    bands: [[0.62, MAGENTA], [0.82, GOLD], [1, TURQUOISE]],
    name: "striped-tail",
  });

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => (t < 0.55 ? 0.095 : 0.07), {
      color: i % 2 ? BLUE : ORANGE,
      section: "box",
      name: `leg-${i}`,
    });
    const ankle = leg.tip;
    b.part(
      new THREE.SphereGeometry(0.105, 8, 5),
      i % 2 ? GOLD : MAGENTA,
      { bone: ankle, at: ankle.at, scale: [1.18, 0.6, 1.35], name: `paw-${i}` },
    );
    for (let toe = -1; toe <= 1; toe++) {
      const side = toe * 0.045;
      b.spike(
        ankle.at,
        [side, -0.04, 0.18],
        null,
        0.018,
        { color: CREAM, bone: ankle, name: `talon-${i}-${toe}` },
      );
    }
  }

  // Skull, muzzle, open lower jaw, and painted nose.
  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    spots,
    {
      bone: head,
      at: head.at,
      scale: [0.27, 0.25, 0.3],
      name: "large-jaguar-skull",
    },
  );
  b.part(
    new THREE.SphereGeometry(1, 8, 6),
    CREAM,
    {
      bone: head,
      at: head.local({ forward: 0.2, down: 0.05 }),
      scale: [0.2, 0.14, 0.16],
      name: "cream-muzzle",
    },
  );
  b.part(
    new THREE.SphereGeometry(1, 8, 5),
    BLACK,
    {
      bone: head,
      at: head.local({ forward: 0.34, down: 0.02 }),
      scale: [0.095, 0.065, 0.06],
      name: "nose",
    },
  );
  b.sweep(
    catmull([
      jaw.at,
      [0, 1.18, 0.95],
      [0, 1.15, 1.08],
    ]),
    [0.11, 0.055],
    { bone: jaw, color: RED, section: "box", name: "open-lower-jaw" },
  );
  b.part(
    new THREE.BoxGeometry(0.17, 0.025, 0.24),
    WHITE,
    {
      bone: jaw,
      at: [0, 1.2, 1.02],
      name: "lower-teeth",
    },
  );
  for (const s of [1, -1]) {
    b.spike(
      head.local({ left: s * 0.12, down: 0.04, forward: 0.18 }),
      [0, -0.02, 1],
      0.11,
      0.028,
      { color: CREAM, bone: jaw, name: `fang-${s}` },
    );
  }

  // Huge expressive eyes are decals seated on the skull.
  const eyeTexture = animeEye({
    iris: "#20d7d2",
    irisLight: "#fff06a",
    irisDark: "#48218c",
    blush: "#ff668c",
  });
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(head.at).at(s * 38, 5);
    if (hit) {
      b.decal(skullSurface, eyeTexture, {
        at: hit,
        size: [0.13, 0.17],
        lift: 0.008,
        mirror: s > 0,
        name: `painted-eye-${s}`,
      });
    }
  }

  // Round ears with bright inner petals.
  const earOutline: [number, number, "sharp"][] = [
    [0, -0.16, "sharp"],
    [0.17, -0.02, "sharp"],
    [0.15, 0.22, "sharp"],
    [0.02, 0.31, "sharp"],
    [-0.12, 0.18, "sharp"],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.18, up: 0.14, back: 0.02 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: MAGENTA,
      bone: head,
      name: `round-ear-${s}`,
    });
    b.extrude(
      [
        [0, -0.08, "sharp"],
        [0.1, 0, "sharp"],
        [0.08, 0.13, "sharp"],
        [0, 0.18, "sharp"],
        [-0.07, 0.08, "sharp"],
      ],
      {
        at: head.local({ left: s * 0.185, up: 0.15, forward: 0.01 }),
        x: [s, 0, 0],
        thickness: 0.052,
        color: GOLD,
        bone: head,
        name: `ear-inner-${s}`,
      },
    );
  }

  // Eagle beak over the jaguar muzzle.
  b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.1, 0.11],
      [0.025, 0.3, "sharp"],
      [-0.025, 0.3, "sharp"],
      [-0.1, 0.11],
    ],
    {
      at: head.local({ forward: 0.31, down: 0.03 }),
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.12, 0.025],
      bevel: 0.018,
      color: GOLD,
      bone: head,
      name: "hooked-eagle-beak",
    },
  );
  b.part(
    new THREE.BoxGeometry(0.19, 0.018, 0.025),
    BLACK,
    { bone: head, at: head.local({ forward: 0.36, down: 0.005 }), name: "beak-slit" },
  );

  // Crown of stylized painted feathers.
  const crestTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 63C4 48 5 28 16 1c11 27 12 47 0 62Z" fill="#fff"/><path d="M16 4v55" stroke="#222" stroke-width="3"/><path d="M7 39h18M9 29h14M12 18h8" stroke="#222" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const crestFrames = [
    head.local({ left: 0.0, up: 0.2, back: 0.02 }),
    head.local({ left: 0.08, up: 0.18, back: 0.01 }),
    head.local({ left: -0.08, up: 0.18, back: 0.01 }),
    head.local({ left: 0.15, up: 0.12, back: -0.01 }),
    head.local({ left: -0.15, up: 0.12, back: -0.01 }),
  ].map((p) => b.surface(skull).nearest(p));
  b.cards(
    crestFrames.filter(Boolean),
    crestTex,
    {
      size: [0.13, 0.34],
      lean: 15,
      bend: 18,
      cross: true,
      color: [ORANGE, MAGENTA, TURQUOISE, GOLD] as any,
      rng: rng(12),
      name: "crest-feathers",
    },
  );

  // Broad ceremonial wings.
  b.sweep(wingL, [0.14, 0.07], {
    color: wingPaint,
    section: "box",
    name: "left-wing-arm",
  });
  b.sweep(wingR, [0.14, 0.07], {
    color: wingPaint,
    section: "box",
    name: "right-wing-arm",
  });
  b.membrane(
    wingL,
    catmull([
      [0.32, 0.98, 0.3],
      [0.7, 1.0, 0.05],
      [1.1, 1.14, -0.05],
      [1.55, 1.24, -0.18],
    ]),
    { color: wingPaint, thickness: 0.025, rows: 5, cols: 7, scallop: 0.12, name: "left-wing-web" },
  );
  b.membrane(
    wingR,
    catmull([
      [-0.32, 0.98, 0.3],
      [-0.7, 1.0, 0.05],
      [-1.1, 1.14, -0.05],
      [-1.55, 1.24, -0.18],
    ]),
    { color: wingPaint, thickness: 0.025, rows: 5, cols: 7, scallop: 0.12, name: "right-wing-web" },
  );
  b.sweep(featherL, [0.07, 0.018], {
    color: GOLD,
    section: "box",
    caps: { end: "point", start: "round" },
    name: "left-primary-feather",
  });
  b.sweep(featherR, [0.07, 0.018], {
    color: GOLD,
    section: "box",
    caps: { end: "point", start: "round" },
    name: "right-primary-feather",
  );

  // Painted feather bars and eye-spots on each wing.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const x = s * (0.62 + i * 0.19);
      const y = 1.28 + i * 0.07;
      const z = 0.27 - i * 0.11;
      b.part(
        new THREE.CylinderGeometry(0.018, 0.018, 0.7, 7),
        i % 2 ? MAGENTA : TURQUOISE,
        {
          bone: s > 0 ? wingL.joints[Math.min(i, 2)] : wingR.joints[Math.min(i, 2)],
          at: [x, y, z],
          dir: [s * 0.15, 0.15, -1],
          name: `wing-bar-${s}-${i}`,
        },
      );
    }
    b.part(
      new THREE.SphereGeometry(0.12, 10, 6),
      ORANGE,
      {
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        at: [s * 0.88, 1.34, 0.22],
        scale: [1.25, 0.35, 1],
        name: `wing-eye-spot-${s}`,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.055, 8, 5),
      BLACK,
      {
        bone: s > 0 ? wingL.joints[1] : wingR.joints[1],
        at: [s * 0.9, 1.35, 0.25],
        name: `wing-eye-pupil-${s}`,
      },
    );
  }

  // Jewel-like rosette medallion on the chest.
  b.part(
    new THREE.CylinderGeometry(0.2, 0.2, 0.035, 10),
    GOLD,
    {
      bone: spine.joints[2],
      at: [0, 1.04, 0.49],
      dir: [0, 0, 1],
      name: "chest-medallion",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.12, 0.12, 0.042, 8),
    MAGENTA,
    {
      bone: spine.joints[2],
      at: [0, 1.04, 0.515],
      dir: [0, 0, 1],
      name: "medallion-center",
    },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    b.part(
      new THREE.SphereGeometry(0.026, 6, 4),
      i % 2 ? TURQUOISE : CREAM,
      {
        bone: spine.joints[2],
        at: [Math.sin(a) * 0.145, 1.04 + Math.cos(a) * 0.145, 0.53],
        name: `medallion-bead-${i}`,
      },
    );
  }

  // Whiskers and painted facial markings.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        head.local({ left: s * (0.11 + i * 0.015), down: 0.03 + i * 0.025, forward: 0.27 }),
        head.local({ left: s * (0.28 + i * 0.04), down: 0.01 + i * 0.035, forward: 0.32 }),
        0.006,
        { color: CREAM, bone: head, name: `whisker-${s}-${i}` },
      );
    }
    b.part(
      new THREE.SphereGeometry(0.028, 6, 4),
      TURQUOISE,
      {
        bone: head,
        at: head.local({ left: s * 0.105, down: 0.01, forward: 0.3 }),
        name: `cheek-jewel-${s}`,
      },
    );
  }

  // A few large decorative tail rings.
  b.along(tail, 6, (at) =>
    b.part(
      new THREE.TorusGeometry(0.095, 0.012, 5, 8),
      at.t > 0.5 ? GOLD : TURQUOISE,
      { frame: at, name: "tail-ring" },
    ),
  );

  return b.root;
}
