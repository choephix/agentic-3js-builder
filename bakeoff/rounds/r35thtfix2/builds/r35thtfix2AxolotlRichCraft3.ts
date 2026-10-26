import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  mottle,
  rng,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

const LILAC = "#9b93dc";
const LILAC_SHADOW = "#6559a8";
const BELLY = "#f7ddeb";
const BELLY_SHADOW = "#d79dbf";
const MUZZLE = "#fff0df";
const MUZZLE_SHADOW = "#e9b8c5";
const PINK = "#f486bd";
const PINK_LIGHT = "#ffb3d6";
const PINK_DARK = "#b83879";
const DEEP_PINK = "#7d285e";
const DARK = "#271938";
const TONGUE = "#ff79ad";
const SPOT = "#c7b5ec";
const SPOT_DARK = "#7668b7";
const FIN = "#df75b7";
const FIN_SHADOW = "#9a3d82";

const EYE_TEX = animeEye({
  iris: "#55d5ce",
  irisLight: "#b7fff0",
  irisDark: "#216b88",
  ink: INK,
  blush: false,
  size: 512,
});

const GILL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <defs>
      <linearGradient id="gill" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#c53e86"/>
        <stop offset=".42" stop-color="#ff9aca"/>
        <stop offset="1" stop-color="#f05d9f"/>
      </linearGradient>
    </defs>
    <path d="M32 126
      C28 111 17 104 10 94
      C4 85 8 76 20 78
      C10 68 9 57 19 55
      C13 44 19 35 28 40
      C26 27 31 13 36 5
      C39 22 42 35 39 47
      C51 39 58 46 51 58
      C62 59 64 70 53 77
      C64 81 61 92 51 97
      C44 101 39 111 36 126 Z"
      fill="url(#gill)" stroke="#8b2c67" stroke-width="3" stroke-linejoin="round"/>
    <path d="M33 119 C33 92 34 62 35 15
      M33 88 C24 78 17 69 16 60
      M34 76 C44 65 50 56 50 48
      M34 102 C24 95 17 87 12 80
      M35 96 C46 89 54 83 57 76"
      fill="none" stroke="#ffd2e6" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M12 94 C19 96 27 102 31 111 M51 97 C45 101 40 108 37 116"
      fill="none" stroke="#a72d70" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const HEART_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M64 112
      C56 103 18 78 18 45
      C18 21 47 13 64 35
      C81 13 110 21 110 45
      C110 78 72 103 64 112Z"
      fill="#f58bbd" stroke="#8a356e" stroke-width="7" stroke-linejoin="round"/>
    <path d="M38 43 C47 31 57 37 62 45" fill="none"
      stroke="#ffd9ed" stroke-width="6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const STAR_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32 4 L39 24 L60 25 L44 38 L49 59 L32 47 L15 59 L20 38 L4 25 L25 24Z"
      fill="#fff4a6" stroke="#b85b91" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="32" cy="31" r="5" fill="#fffce2"/>
  </svg>`,
  { size: 128 },
);

const BODY_BASE = mottle(LILAC, "#7971c1", {
  size: 0.16,
  contrast: 1.15,
  seed: 17,
});

const COAT = cel(
  furEdge(BODY_BASE, BELLY, {
    level: -0.08,
    teeth: 0.16,
    period: 0.12,
    ink: "#8069b2",
    inkWidth: 0.018,
  }),
  "#5f54a0",
  { threshold: 0.06 },
);

const HEAD_COAT = cel(
  furEdge(LILAC, BELLY, {
    by: "position",
    axis: [0, 1, 0],
    level: 0.38,
    teeth: 0.045,
    period: 0.055,
    ink: "#755ca2",
    inkWidth: 0.006,
  }),
  LILAC_SHADOW,
  { threshold: 0.05 },
);

const MUZZLE_PAINT = cel(MUZZLE, MUZZLE_SHADOW, { threshold: 0.02 });
const GILL_PAINT = cel(PINK, PINK_DARK, { threshold: 0.02 });
const GILL_LIGHT = cel(PINK_LIGHT, FIN_SHADOW, { threshold: 0.02 });
const PAW_PAINT = cel("#a79de3", "#665aa8", { threshold: 0.02 });

export const meta = {
  name: "chibi axolotl",
  description:
    "A low-poly chibi axolotl with a huge expressive head, open mouth, soft lilac body, heart belly mark, stubby splayed feet, and six branching frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({
    name: "chibi-axolotl",
    detail: 1,
    paintSize: 2048,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: one root, then the spine, tail, jaw, limbs, toes and external gill fans.

  const hips = b.joint("hips", {
    at: [0, 0.34, -0.30],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.30],
      [0, 0.37, -0.10],
      [0, 0.40, 0.12],
      [0, 0.43, 0.27],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3"],
      role: "spine",
      group: "body",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.32, -0.42],
      [0, 0.29, -0.67],
      [0, 0.24, -0.92],
      [0, 0.18, -1.16],
      [0, 0.13, -1.36],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.48, 0.38],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.17, down: 0.075 }),
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const legChains: Array<{
    side: number;
    label: string;
    front: boolean;
    chain: ReturnType<typeof b.chain>;
    target: THREE.Vector3;
    toes: Array<ReturnType<typeof b.chain>>;
  }> = [];

  const gillChains: Array<{
    side: number;
    label: string;
    index: number;
    chain: ReturnType<typeof b.chain>;
  }> = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    const frontRoot: [number, number, number] = [side * 0.17, 0.39, 0.17];
    const frontTarget = new THREE.Vector3(side * 0.34, 0.065, 0.30);
    const frontPts = limb(
      frontRoot,
      frontTarget,
      [0.16, 0.16],
      [side > 0 ? [1, 0, 1] : [-1, 0, 1]],
    );
    const frontLeg = b.chain(`frontLeg${label}`, frontPts, {
      parent: spine.joints[1],
      names: [`shoulder${label}`, `elbow${label}`, `wrist${label}`],
      role: "leg",
      contact: [frontTarget.x, 0, frontTarget.z],
      group: "limbs",
    });

    const rearRoot: [number, number, number] = [side * 0.18, 0.34, -0.22];
    const rearTarget = new THREE.Vector3(side * 0.37, 0.065, -0.42);
    const rearPts = limb(
      rearRoot,
      rearTarget,
      [0.17, 0.17],
      [side > 0 ? [1, 0, -1] : [-1, 0, -1]],
    );
    const rearLeg = b.chain(`rearLeg${label}`, rearPts, {
      parent: spine.joints[0],
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
      role: "leg",
      contact: [rearTarget.x, 0, rearTarget.z],
      group: "limbs",
    });

    const frontToes: Array<ReturnType<typeof b.chain>> = [];
    const rearToes: Array<ReturnType<typeof b.chain>> = [];

    for (let i = 0; i < 3; i++) {
      const spread = i - 1;
      const fRoot = new THREE.Vector3(
        frontTarget.x + side * spread * 0.018,
        0.065,
        frontTarget.z + spread * 0.018,
      );
      const fTip = new THREE.Vector3(
        frontTarget.x + side * (0.075 + Math.abs(spread) * 0.018),
        0.035,
        frontTarget.z + 0.055 + spread * 0.045,
      );
      const fToe = b.chain(
        `frontToe${label}${i + 1}`,
        [fRoot, fTip],
        {
          parent: frontLeg.tip!,
          names: [`toe${label}${i + 1}`, `toe${label}${i + 1}Tip`],
          role: "digit",
          group: "digits",
        },
      );
      frontToes.push(fToe);

      const rRoot = new THREE.Vector3(
        rearTarget.x + side * spread * 0.02,
        0.065,
        rearTarget.z + spread * 0.018,
      );
      const rTip = new THREE.Vector3(
        rearTarget.x + side * (0.08 + Math.abs(spread) * 0.02),
        0.035,
        rearTarget.z - 0.055 + spread * 0.045,
      );
      const rToe = b.chain(
        `rearToe${label}${i + 1}`,
        [rRoot, rTip],
        {
          parent: rearLeg.tip!,
          names: [`rearToe${label}${i + 1}`, `rearToe${label}${i + 1}Tip`],
          role: "digit",
          group: "digits",
        },
      );
      rearToes.push(rToe);
    }

    legChains.push({
      side,
      label,
      front: true,
      chain: frontLeg,
      target: frontTarget,
      toes: frontToes,
    });
    legChains.push({
      side,
      label,
      front: false,
      chain: rearLeg,
      target: rearTarget,
      toes: rearToes,
    });

    for (let g = 0; g < 3; g++) {
      const z0 = 0.29 + (g - 1) * 0.065;
      const root = [side * 0.255, 0.51 + (g === 1 ? 0.018 : 0), z0] as [
        number,
        number,
        number,
      ];
      const mid = [
        side * (0.35 + g * 0.012),
        0.57 + (g === 1 ? 0.035 : 0),
        z0 - 0.015,
      ] as [number, number, number];
      const tip = [
        side * (0.50 + g * 0.018),
        0.58 + (g === 1 ? 0.045 : -0.015),
        z0 - 0.055 - g * 0.012,
      ] as [number, number, number];

      const gill = b.chain(
        `gill${label}${g + 1}`,
        catmull([root, mid, tip]),
        {
          parent: head,
          names: [
            `gill${label}${g + 1}Base`,
            `gill${label}${g + 1}Mid`,
            `gill${label}${g + 1}Tip`,
          ],
          role: "fan",
          group: "gills",
        },
      );
      gillChains.push({ side, label, index: g, chain: gill });
    }
  }

  // A small open-mouth pose makes the jaw read as a separate hinge while remaining a relaxed rest pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // -------------------------------------------------------------------------------------------------------------
  // Main body, tail and tail fin.

  const bodyTube = b.sweep(spine, (t) => 0.18 + 0.025 * Math.sin(t * Math.PI), {
    color: COAT,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    group: "body",
    name: "soft-bodied-spine",
  });

  const tailTube = b.sweep(
    tail,
    (t) => 0.135 * (1 - t) + 0.026,
    {
      color: COAT,
      section: { ngon: 7 },
      sides: 7,
      caps: "round",
      group: "tail",
      name: "tapered-tail",
    },
  );

  b.membrane(tailTube.curve(), tailTube.line(0, 0.105), {
    color: GILL_LIGHT,
    thickness: 0.012,
    rows: 5,
    cols: 10,
    scallop: 0.12,
    group: "tail-fin",
    name: "upper-tail-fin",
  });

  b.membrane(tailTube.line(180, 0.004), tailTube.curve(), {
    color: FIN,
    thickness: 0.012,
    rows: 5,
    cols: 10,
    scallop: 0.12,
    group: "tail-fin",
    name: "lower-tail-fin",
  });

  // A few broad vertical fin plates make the tail silhouette especially readable in a chibi render.
  for (let i = 0; i < 3; i++) {
    const t = 0.18 + i * 0.22;
    const p = tail.at(t).at;
    const w = 0.085 - i * 0.018;
    const h = 0.12 - i * 0.018;
    b.extrude(
      [
        [-w, -0.015],
        [w, -0.015],
        [w * 0.82, h * 0.62],
        [0.015, h],
        [-w * 0.82, h * 0.62],
      ],
      {
        at: p,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        bone: tail.at(t).bone,
        color: FIN,
        group: "tail-fin",
        name: `tail-fin-plate-${i + 1}`,
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head first: large faceted skull, muzzle, upper jaw, lower jaw and mouth.

  const skull = b.part(
    new THREE.SphereGeometry(1, 16, 10),
    HEAD_COAT,
    {
      bone: head,
      at: head.at,
      scale: [0.355, 0.305, 0.325],
      flat: true,
      group: "head",
      name: "large-round-skull",
    },
  );

  const crownPad = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    COAT,
    {
      bone: head,
      at: head.local({ up: 0.15, forward: 0.015 }),
      scale: [0.25, 0.09, 0.24],
      flat: true,
      group: "head",
      name: "soft-crown-pad",
    },
  );

  const upperMuzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    MUZZLE_PAINT,
    {
      bone: head,
      at: head.local({ forward: 0.205, down: 0.035 }),
      scale: [0.215, 0.145, 0.14],
      flat: true,
      group: "face",
      name: "upper-muzzle",
    },
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      MUZZLE_PAINT,
      {
        bone: head,
        at: head.local({
          left: side * 0.105,
          forward: 0.215,
          down: 0.02,
        }),
        scale: [0.115, 0.105, 0.105],
        flat: true,
        group: "face",
        name: `muzzle-pad-${side > 0 ? "L" : "R"}`,
      },
    );
  }

  const lowerJawPath = catmull([
    jaw.at,
    [0, 0.375, 0.585],
    [0, 0.392, 0.64],
  ]);

  b.sweep(lowerJawPath, [0.105, 0.065], {
    bone: jaw,
    color: MUZZLE_PAINT,
    section: { ngon: 8 },
    caps: "round",
    group: "face",
    name: "lower-jaw",
  });

  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    DARK,
    {
      bone: head,
      at: head.local({ forward: 0.295, down: 0.065 }),
      scale: [0.12, 0.045, 0.018],
      flat: true,
      group: "face",
      name: "open-mouth-shadow",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 9, 6),
    TONGUE,
    {
      bone: jaw,
      at: [0, 0.405, 0.665],
      scale: [0.062, 0.023, 0.022],
      flat: true,
      group: "face",
      name: "little-tongue",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    DARK,
    {
      bone: head,
      at: head.local({ forward: 0.333, down: 0.005 }),
      scale: [0.052, 0.038, 0.035],
      flat: true,
      group: "face",
      name: "round-nose",
    },
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 6),
      PINK,
      {
        bone: head,
        at: head.local({
          left: side * 0.17,
          forward: 0.262,
          down: 0.035,
        }),
        scale: [0.052, 0.038, 0.018],
        flat: true,
        group: "face",
        name: `cheek-blush-${side > 0 ? "L" : "R"}`,
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Big expressive eyes, forehead star and tiny cheek freckles.

  const headSurface = b.surface(skull);

  for (const side of [1, -1]) {
    const eyeHit = headSurface.around(head.at).at(side * 31, 4);
    if (eyeHit) {
      const eye = b.decal(skull, EYE_TEX, {
        at: eyeHit,
        size: [0.125, 0.17],
        segments: 8,
        lift: 0.004,
        mirror: side > 0,
        group: "face",
        name: `huge-eye-${side > 0 ? "L" : "R"}`,
      });
      glow(eye, 1.15);
    }

    const freckles = [
      head.local({ left: side * 0.195, forward: 0.285, down: 0.005 }),
      head.local({ left: side * 0.215, forward: 0.273, down: 0.035 }),
      head.local({ left: side * 0.185, forward: 0.295, down: 0.045 }),
    ];

    freckles.forEach((at, i) => {
      b.part(
        new THREE.SphereGeometry(0.012, 6, 4),
        i === 1 ? SPOT_DARK : SPOT,
        {
          bone: head,
          at,
          scale: [1.25, 0.7, 0.5],
          flat: true,
          group: "face",
          name: `cheek-freckle-${side > 0 ? "L" : "R"}-${i + 1}`,
        },
      );
    });
  }

  const crownHit = headSurface.around(head.at).at(0, 43);
  if (crownHit) {
    b.decal(skull, STAR_TEX, {
      at: crownHit,
      size: [0.09, 0.09],
      segments: 6,
      lift: 0.003,
      group: "face",
      name: "forehead-star",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs, paws and separated toes.

  for (const entry of legChains) {
    const { side, label, front, chain, target } = entry;

    b.sweep(chain, [0.062, 0.038], {
      color: COAT,
      section: { ngon: 6 },
      caps: "round",
      group: "limbs",
      name: `${front ? "front" : "rear"}-leg-${label}`,
    });

    b.part(
      new THREE.SphereGeometry(1, 9, 6),
      PAW_PAINT,
      {
        bone: chain.tip!,
        at: target,
        scale: [0.083, 0.055, 0.095],
        flat: true,
        group: "limbs",
        name: `${front ? "front" : "rear"}-paw-${label}`,
      },
    );

    for (let i = 0; i < entry.toes.length; i++) {
      const toe = entry.toes[i];
      const toeTip = toe.tip!;
      const toeEnd = toeTip.at;

      b.sweep(toe, [0.019, 0.006], {
        color: PAW_PAINT,
        section: { ngon: 6 },
        caps: "round",
        group: "digits",
        name: `${front ? "front" : "rear"}-toe-${label}-${i + 1}`,
      });

      b.part(
        new THREE.SphereGeometry(0.012, 6, 4),
        PINK_LIGHT,
        {
          bone: toeTip,
          at: toeEnd,
          scale: [1.25, 0.75, 1.1],
          flat: true,
          group: "digits",
          name: `${front ? "front" : "rear"}-toe-tip-${label}-${i + 1}`,
        },
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Frilly external gills: pink stems, textured leaf-like cards, and little branching ribs.

  for (const info of gillChains) {
    const { side, label, index, chain } = info;

    b.sweep(chain, [0.028, 0.011], {
      color: GILL_PAINT,
      section: { ngon: 6 },
      caps: "round",
      group: "gills",
      name: `gill-stem-${label}-${index + 1}`,
    });

    const gillFrames = b.along(chain, 5, () => {});
    b.cards(gillFrames, GILL_TEX, {
      size: [0.072, 0.145],
      lean: 42,
      bend: 20,
      vary: 0.18,
      flow: [side * 0.35, 0.80, -0.15],
      sink: 0.12,
      rng: rng(100 + index + (side > 0 ? 0 : 30)),
      color: "#ffffff",
      group: "gills",
      name: `frilly-gill-cards-${label}-${index + 1}`,
    });

    b.along(chain, 4, (at) => {
      const forward = side > 0 ? [0.38, 0.25, -0.18] : [-0.38, 0.25, -0.18];
      b.spike(at, forward, 0.055, 0.008, {
        color: GILL_LIGHT,
        section: { ngon: 5 },
        group: "gills",
        name: `gill-rib-${label}-${index + 1}`,
      });
    });
  }

  // A pair of extra pink base fans gives the gills a strong silhouette behind the cheeks.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const at = head.local({
        left: side * (0.245 + i * 0.016),
        up: 0.02 + i * 0.022,
        back: 0.01,
      });

      b.part(
        new THREE.SphereGeometry(1, 8, 5),
        GILL_LIGHT,
        {
          bone: head,
          at,
          scale: [0.045, 0.07, 0.028],
          flat: true,
          group: "gills",
          name: `gill-base-flap-${side > 0 ? "L" : "R"}-${i + 1}`,
        },
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Surface detail: lilac spot studs and little dorsal bumps.

  const bodySurface = b.surface([bodyTube, tailTube]);
  const spotHits = bodySurface.scatter(28, {
    rng: rng(711),
    minDist: 0.055,
    filter: (hit) => hit.n.y > -0.35 && hit.at.y > 0.16,
  });

  spotHits.forEach((hit, i) => {
    b.stick(
      new THREE.SphereGeometry(0.019, 6, 4),
      i % 4 === 0 ? SPOT_DARK : SPOT,
      hit,
      {
        embed: 0.52,
        scale: [1.2, 0.55, 0.85],
        group: "skin-detail",
        name: `skin-spot-${i + 1}`,
      },
    );
  });

  b.along(bodyTube, 8, (at) => {
    b.spike(at, at, 0.035, 0.009, {
      color: PINK_DARK,
      section: { ngon: 5 },
      group: "skin-detail",
      name: "back-bump",
    });
  });

  b.along(tailTube, 7, (at) => {
    b.spike(at, at, 0.025, 0.007, {
      color: SPOT_DARK,
      section: { ngon: 5 },
      group: "skin-detail",
      name: "tail-bump",
    });
  });

  // -------------------------------------------------------------------------------------------------------------
  // A tiny heart emblem sits on the front of the torso, just below the oversized head.

  const heartHit = bodySurface.around([0, 0.38, 0.20]).at(0, 8);
  if (heartHit) {
    b.decal(bodyTube, HEART_TEX, {
      at: heartHit,
      size: [0.14, 0.14],
      segments: 8,
      lift: 0.003,
      group: "body-decoration",
      name: "heart-belly-mark",
    });
  }

  // Add two pale collar dots where the head meets the body, making the transition read cleanly.
  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(1, 8, 5),
      BELLY,
      {
        bone: spine.joints[2],
        at: [side * 0.115, 0.40, 0.285],
        scale: [0.055, 0.045, 0.035],
        flat: true,
        group: "body-decoration",
        name: `collar-dot-${side > 0 ? "L" : "R"}`,
      },
    );
  }

  return b.root;
}
