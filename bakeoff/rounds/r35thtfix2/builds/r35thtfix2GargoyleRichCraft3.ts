import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
  mottle,
  countershade,
  paint,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "cathedral gargoyle",
  description:
    "A crouched gothic stone gargoyle perched on a carved cathedral ledge, with spread wings, curled horns, an open fanged jaw, claws, tail spines, and glowing eyes.",
};

const STONE = countershade(
  mottle("#747b87", "#3d414c", { size: 0.18, contrast: 1.35, seed: 17 }),
  "#282b35",
  { level: -0.18, soft: 0.3 },
);

const STONE_LIGHT = countershade(
  mottle("#a2a8ad", "#5a606b", { size: 0.12, contrast: 1.2, seed: 23 }),
  "#3b3e49",
  { level: -0.08, soft: 0.3 },
);

const STONE_DARK = mottle("#454954", "#20222c", {
  size: 0.11,
  contrast: 1.5,
  seed: 41,
});

const WING_STONE = countershade(
  mottle("#818791", "#444954", { size: 0.22, contrast: 1.15, seed: 31 }),
  "#30333d",
  { level: -0.1, soft: 0.28 },
);

const CARVED_EDGE = "#c2c6c6";
const SHADOW = "#1d1e27";
const MOUTH = "#11121a";
const CLAW = "#25232b";
const AMBER = "#ffae48";
const LEDGE_STONE = mottle("#646a73", "#30333b", {
  size: 0.24,
  contrast: 1.1,
  seed: 71,
});
const LEDGE_EDGE = countershade(
  mottle("#858a8c", "#454951", { size: 0.16, contrast: 1.25, seed: 73 }),
  "#33363f",
  { level: -0.15, soft: 0.32 },
);

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 128 176" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6e260e"/>
        <stop offset="0.48" stop-color="#ff8a29"/>
        <stop offset="1" stop-color="#ffe48a"/>
      </linearGradient>
      <radialGradient id="shine">
        <stop offset="0" stop-color="#fffbd2"/>
        <stop offset="1" stop-color="#ffb13c"/>
      </radialGradient>
    </defs>
    <path d="M12 83 Q30 13 64 9 Q99 13 116 83 Q96 155 64 166 Q31 155 12 83Z"
      fill="#18131c" stroke="#09090d" stroke-width="8"/>
    <ellipse cx="64" cy="88" rx="40" ry="57" fill="url(#iris)" stroke="#4c1e17" stroke-width="6"/>
    <path d="M26 55 Q64 18 102 55 Q87 72 64 73 Q41 72 26 55Z" fill="#752617" opacity=".78"/>
    <path d="M29 119 Q64 143 99 119 Q87 151 64 154 Q41 151 29 119Z" fill="url(#shine)" opacity=".8"/>
    <ellipse cx="64" cy="92" rx="12" ry="39" fill="#130e17"/>
    <ellipse cx="46" cy="55" rx="12" ry="18" fill="#fffbe1"/>
    <circle cx="82" cy="119" r="6" fill="#fff5c7"/>
    <path d="M19 43 Q9 29 5 13 M22 53 Q10 48 3 39" fill="none"
      stroke="#15111a" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const CHEST_SIGIL = svg(
  `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 8 L74 47 L110 61 L78 78 L84 119 L64 101 L44 119 L50 78 L18 61 L54 47Z"
      fill="#171822" stroke="#d0c9b6" stroke-width="5" stroke-linejoin="round"/>
    <path d="M64 25 L64 91 M37 61 L91 61 M49 47 L79 78 M79 47 L49 78"
      stroke="#4b4d58" stroke-width="4" fill="none"/>
    <circle cx="64" cy="61" r="8" fill="#d8a251"/>
  </svg>`,
  { size: 256 },
);

const WING_CARVING = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 104 Q42 69 62 16 Q68 11 71 18 Q66 62 112 101"
      fill="none" stroke="#f0e9d5" stroke-width="7" stroke-linecap="round"/>
    <path d="M31 102 Q50 72 61 42 M48 105 Q65 75 69 52 M69 103 Q82 76 82 65 M88 103 Q96 88 95 78"
      fill="none" stroke="#292b35" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function stoneSpike(
  b: ReturnType<typeof createBuilder>,
  base: any,
  direction: [number, number, number],
  length: number,
  radius: number,
  color: any = STONE_LIGHT,
  bone?: any,
) {
  return b.spike(base, direction, length, radius, {
    color,
    bone,
    caps: { start: "round", end: "point" },
  });
}

function clawedDigits(
  b: ReturnType<typeof createBuilder>,
  parent: any,
  prefix: string,
  start: [number, number, number],
  side: number,
  count: number,
  forward: number,
  role: "digit" = "digit",
) {
  const chains: any[] = [];
  for (let i = 0; i < count; i++) {
    const spread = (i - (count - 1) / 2) * 0.055;
    const root: [number, number, number] = [
      start[0] + spread,
      start[1] + (i === 1 ? 0.015 : 0),
      start[2] + i * 0.012,
    ];
    const tip: [number, number, number] = [
      root[0] + spread * 0.55,
      0.155,
      root[2] + forward + Math.abs(i - 1) * 0.025,
    ];
    const points = limb(root, tip, [0.105, 0.105], [[0, -1, 0]]);
    const chain = b.chain(prefix + (i + 1), points, {
      parent,
      names: [prefix + (i + 1), `${prefix}Mid${i + 1}`, `${prefix}Tip${i + 1}`],
      role,
    });
    b.sweep(chain, (t: number) => 0.026 - t * 0.012, {
      color: STONE_LIGHT,
      section: { ngon: 6 },
      caps: "round",
      name: `${prefix}${i + 1}Bone`,
    });
    stoneSpike(
      b,
      chain.tip,
      [0, -0.32, 0.95],
      0.075,
      0.018,
      CLAW,
      chain.tip,
    );
    chains.push(chain);
  }
  return chains;
}

export default function build() {
  const b = createBuilder({
    name: "cathedral-gargoyle",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: one root pelvis, then spine, neck, head, jaw, limbs, wings,
  // and a long articulated tail.

  const hips = b.joint("hips", {
    at: [0, 0.98, -0.02],
    dir: [0, 1, 0.04],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.02],
      [0, 1.16, 0.01],
      [0, 1.38, 0.06],
      [0, 1.53, 0.13],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "spineTip"],
      role: "spine",
      group: "body",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      spine.at(1),
      [0, 1.57, 0.19],
      [0, 1.72, 0.29],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      group: "body",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.76, 0.34],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.63, 0.58],
    aim: [0, 1.55, 0.84],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.18],
      [0, 0.78, -0.48],
      [0, 0.61, -0.78],
      [0, 0.42, -1.05],
      [0, 0.34, -1.24],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "body",
    },
  );

  const legs: any[] = [];
  const arms: any[] = [];
  const wings: any[] = [];

  for (const s of [1, -1]) {
    const hipRoot: [number, number, number] = [s * 0.24, 1.03, -0.04];
    const footTarget: [number, number, number] = [s * 0.53, 0.205, 0.31];
    const legPoints = limb(
      hipRoot,
      footTarget,
      [0.38, 0.35, 0.31],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain("leg" + (s > 0 ? "L" : "R"), legPoints, {
      parent: hips,
      names: [
        s > 0 ? "hipL" : "hipR",
        s > 0 ? "kneeL" : "kneeR",
        s > 0 ? "ankleL" : "ankleR",
        s > 0 ? "footL" : "footR",
      ],
      role: "leg",
      contact: footTarget,
      group: "limbs",
    });
    b.sweep(leg, (t: number) => 0.105 - t * 0.042, {
      color: STONE,
      section: { ngon: 7 },
      caps: "round",
      name: `carvedLeg${s > 0 ? "L" : "R"}`,
    });
    legs.push(leg);

    const armRoot: [number, number, number] = [s * 0.29, 1.42, 0.12];
    const handTarget: [number, number, number] = [s * 0.58, 0.22, 0.72];
    const armPoints = limb(
      armRoot,
      handTarget,
      [0.43, 0.49, 0.42],
      [
        [0, -1, 1],
        [0, 1, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const arm = b.chain("arm" + (s > 0 ? "L" : "R"), armPoints, {
      parent: spine.joints[2],
      names: [
        s > 0 ? "shoulderL" : "shoulderR",
        s > 0 ? "elbowL" : "elbowR",
        s > 0 ? "wristL" : "wristR",
        s > 0 ? "handL" : "handR",
      ],
      role: "arm",
      group: "limbs",
    });
    b.sweep(arm, (t: number) => 0.074 - t * 0.03, {
      color: STONE,
      section: { ngon: 7 },
      caps: "round",
      name: `carvedArm${s > 0 ? "L" : "R"}`,
    });
    arms.push(arm);

    const wingBase: [number, number, number] = [s * 0.28, 1.48, -0.02];
    const wingPoints = [
      wingBase,
      [s * 0.66, 1.71, -0.13] as [number, number, number],
      [s * 1.06, 1.76, -0.2] as [number, number, number],
      [s * 1.34, 1.49, -0.17] as [number, number, number],
    ];
    const wing = b.chain("wing" + (s > 0 ? "L" : "R"), catmull(wingPoints), {
      parent: spine.joints[2],
      names: [
        s > 0 ? "wingBaseL" : "wingBaseR",
        s > 0 ? "wingMidL" : "wingMidR",
        s > 0 ? "wingOuterL" : "wingOuterR",
        s > 0 ? "wingTipL" : "wingTipR",
      ],
      role: "wing",
      group: "wings",
    });
    wings.push(wing);
  }

  // ---------------------------------------------------------------------------
  // The ledge: simple, heavy cathedral masonry, sized to the spread wings.

  box(b, [3.18, 0.18, 1.74], [0, 0.09, -0.05], LEDGE_STONE, undefined, "ledgeSlab");
  box(b, [3.28, 0.12, 0.19], [0, 0.21, 0.76], LEDGE_EDGE, undefined, "ledgeFrontLip");
  box(b, [0.22, 0.3, 0.28], [-1.05, 0.24, 0.44], LEDGE_STONE, undefined, "leftCorbel");
  box(b, [0.22, 0.3, 0.28], [1.05, 0.24, 0.44], LEDGE_STONE, undefined, "rightCorbel");

  const ledgeCracks = [
    [
      [-1.24, 0.188, 0.16],
      [-0.85, 0.188, 0.21],
      [-0.64, 0.188, 0.12],
    ],
    [
      [0.82, 0.188, -0.45],
      [0.54, 0.188, -0.24],
      [0.28, 0.188, -0.18],
    ],
    [
      [-0.12, 0.188, -0.82],
      [0.07, 0.188, -0.57],
      [0.03, 0.188, -0.31],
    ],
    [
      [1.32, 0.188, 0.21],
      [1.03, 0.188, 0.31],
      [0.89, 0.188, 0.52],
    ],
  ];
  for (let i = 0; i < ledgeCracks.length; i++) {
    b.sweep(catmull(ledgeCracks[i] as any), 0.008, {
      color: SHADOW,
      caps: "flat",
      section: { ngon: 5 },
      name: `ledgeCrack${i}`,
    });
  }

  // Small gothic corner blocks beneath the perch.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.28, 0, "sharp"],
        [0.19, 0.25, "sharp"],
        [0.07, 0.31, "sharp"],
      ],
      {
        at: [s * 1.12, 0.12, 0.45],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.16,
        bevel: 0.012,
        color: LEDGE_EDGE,
        name: `ledgeGothicBracket${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Main body and tail.

  const body = b.sweep(spine, (t: number) => {
    if (t < 0.18) return 0.27;
    if (t < 0.72) return 0.29;
    return 0.22;
  }, {
    color: STONE,
    section: { ngon: 8 },
    caps: "round",
    name: "facetedTorso",
  });

  const neckTube = b.sweep(neck, (t: number) => 0.19 - t * 0.035, {
    color: STONE,
    section: { ngon: 8 },
    caps: "round",
    name: "carvedNeck",
  });

  b.sweep(tail, (t: number) => 0.15 * (1 - t) + 0.025, {
    color: STONE_DARK,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "serratedTail",
  });

  // Haunches give the crouch its heavy, animal silhouette.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.25, 9, 7), STONE, {
      at: [s * 0.27, 0.91, -0.05],
      scale: [1.05, 1.08, 1.18],
      bone: legs[s > 0 ? 0 : 1].joints[0],
      flat: true,
      name: `heavyHaunch${s > 0 ? "L" : "R"}`,
    });

    b.part(new THREE.SphereGeometry(0.13, 8, 6), STONE_LIGHT, {
      at: [s * 0.48, 0.55, 0.2],
      scale: [1.12, 0.88, 1.28],
      bone: legs[s > 0 ? 0 : 1].joints[1],
      flat: true,
      name: `kneecap${s > 0 ? "L" : "R"}`,
    });

    b.part(new THREE.SphereGeometry(0.11, 8, 6), STONE_DARK, {
      at: [s * 0.53, 0.31, 0.33],
      scale: [1.12, 0.8, 1.15],
      bone: legs[s > 0 ? 0 : 1].joints[2],
      flat: true,
      name: `ankleStone${s > 0 ? "L" : "R"}`,
    });
  }

  // A blocky, raised chest plane.
  b.part(new THREE.SphereGeometry(0.24, 8, 6), STONE_LIGHT, {
    at: [0, 1.28, 0.19],
    scale: [0.78, 1.12, 0.48],
    bone: spine.joints[2],
    flat: true,
    name: "raisedChest",
  });

  // Chest sigil, placed before the decorative ribs around it.
  b.decal(body, CHEST_SIGIL, {
    at: [0, 1.29, 0.295],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.23, 0.29],
    segments: 8,
    lift: 0.004,
    name: "chestSigil",
  });

  // Shoulder stones and carved ribs.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.14, 8, 6), STONE_LIGHT, {
      at: [s * 0.31, 1.43, 0.08],
      scale: [1.18, 0.9, 1.15],
      bone: spine.joints[2],
      flat: true,
      name: `shoulderPlate${s > 0 ? "L" : "R"}`,
    });
    for (let i = 0; i < 3; i++) {
      const y = 1.22 + i * 0.105;
      b.rod(
        [s * (0.13 + i * 0.018), y, 0.255] as [number, number, number],
        [s * (0.28 + i * 0.024), y + 0.015, 0.22] as [number, number, number],
        0.014,
        STONE_DARK,
        {
          bone: spine.joints[2],
          name: `ribGroove${s > 0 ? "L" : "R"}${i}`,
        },
      );
    }
  }

  // Dorsal spikes and tail spines.
  b.along(body, 7, (at: any, i: number) =>
    stoneSpike(
      b,
      at,
      [0, 0.36 + i * 0.01, -0.1],
      0.075 + i * 0.006,
      0.022,
      STONE_DARK,
    ),
  );

  b.along(tail, 6, (at: any, i: number) =>
    stoneSpike(
      b,
      at,
      [0, 0.18, -0.5],
      0.085 - i * 0.008,
      0.022 - i * 0.002,
      STONE_LIGHT,
    ),
  );

  // ---------------------------------------------------------------------------
  // Wings: leading bones, scalloped membranes, carved ribs, and wing markings.

  for (let wi = 0; wi < wings.length; wi++) {
    const s = wi === 0 ? 1 : -1;
    const wing = wings[wi];

    b.sweep(wing, (t: number) => 0.055 - t * 0.025, {
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "round",
      name: `wingLeadingBone${s > 0 ? "L" : "R"}`,
    });

    const lowerEdge = catmull([
      wing.at(0),
      [s * 0.68, 1.29, -0.08],
      [s * 1.12, 1.05, -0.15],
      [s * 1.34, 1.49, -0.17],
    ]);

    b.membrane(wing, lowerEdge, {
      color: WING_STONE,
      thickness: 0.018,
      rows: 5,
      cols: 10,
      scallop: 0.16,
      name: `wingMembrane${s > 0 ? "L" : "R"}`,
    });

    b.sweep(lowerEdge, 0.024, {
      color: STONE_DARK,
      section: { ngon: 6 },
      caps: "round",
      name: `wingTrailingRim${s > 0 ? "L" : "R"}`,
    });

    const ribs = [
      [
        [s * 0.42, 1.53, -0.045],
        [s * 0.72, 1.29, -0.09],
      ],
      [
        [s * 0.66, 1.69, -0.13],
        [s * 0.97, 1.11, -0.14],
      ],
      [
        [s * 0.91, 1.75, -0.18],
        [s * 1.2, 1.16, -0.16],
      ],
    ];
    ribs.forEach((rib, i) => {
      b.rod(rib[0], rib[1], 0.018, {
        color: STONE_DARK,
        name: `wingRib${s > 0 ? "L" : "R"}${i}`,
      });
    });

    const wingMark = b.decal(b.root, WING_CARVING, {
      at: [s * 0.86, 1.42, -0.13],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.22, 0.22],
      segments: 5,
      lift: 0.003,
      mirror: s < 0,
      name: `wingCarving${s > 0 ? "L" : "R"}`,
    });
    void wingMark;

    // Three pointed outer knuckles make the silhouette read as a gargoyle wing.
    for (let i = 0; i < 3; i++) {
      const p = wing.at(0.42 + i * 0.17);
      stoneSpike(
        b,
        p,
        [s * 0.36, 0.11 + i * 0.02, -0.08],
        0.13 - i * 0.015,
        0.032 - i * 0.004,
        STONE_LIGHT,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Feet, hands, toes, and fingers.

  for (const s of [1, -1]) {
    const leg = legs[s > 0 ? 0 : 1];
    const arm = arms[s > 0 ? 0 : 1];

    b.part(new THREE.SphereGeometry(0.105, 8, 6), STONE_LIGHT, {
      at: leg.at(1),
      scale: [1.35, 0.7, 1.4],
      bone: leg.joints[leg.joints.length - 1],
      flat: true,
      name: `clawedFoot${s > 0 ? "L" : "R"}`,
    });

    clawedDigits(
      b,
      leg.tip,
      `toe${s > 0 ? "L" : "R"}`,
      [s * 0.53, 0.22, 0.34],
      s,
      3,
      0.21,
    );

    b.part(new THREE.SphereGeometry(0.09, 8, 6), STONE_LIGHT, {
      at: arm.at(1),
      scale: [1.22, 0.75, 1.2],
      bone: arm.joints[arm.joints.length - 1],
      flat: true,
      name: `clawedHand${s > 0 ? "L" : "R"}`,
    });

    clawedDigits(
      b,
      arm.tip,
      `finger${s > 0 ? "L" : "R"}`,
      [s * 0.58, 0.23, 0.72],
      s,
      4,
      0.18,
    );

    // Elbow and wrist bands, cut as dark stone rings.
    for (const [joint, label] of [
      [arm.joints[1], "elbow"],
      [arm.joints[2], "wrist"],
    ] as any[]) {
      b.ring(
        joint,
        { count: 7, radius: label === "elbow" ? 0.078 : 0.052, tilt: 0 },
        (item: any) =>
          b.part(new THREE.SphereGeometry(0.015, 5, 4), STONE_DARK, {
            frame: item,
            bone: joint,
            flat: true,
            name: `${label}BandStud`,
          }),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Head, ears, horns, muzzle, open jaw, and face.

  const skull = b.part(new THREE.SphereGeometry(0.295, 11, 8), STONE_LIGHT, {
    bone: head,
    at: head.at,
    scale: [1.02, 1.05, 1.08],
    flat: true,
    name: "angularSkull",
  });

  b.part(new THREE.SphereGeometry(0.14, 8, 6), STONE, {
    bone: head,
    at: [0, 1.68, 0.59],
    scale: [1.22, 0.82, 1.35],
    flat: true,
    name: "upperMuzzle",
  });

  b.frustumBox(
    [0, 1.68, 0.57],
    [0, 1.68, 0.82],
    [0.17, 0.15],
    [0.12, 0.11],
    {
      color: STONE,
      bone: head,
      name: "carvedSnout",
    },
  );

  b.part(new THREE.SphereGeometry(0.055, 7, 5), MOUTH, {
    bone: head,
    at: [0, 1.69, 0.82],
    flat: true,
    name: "stoneNose",
  });

  // Separate lower jaw, visibly hinged open.
  b.frustumBox(
    [0, 1.62, 0.59],
    [0, 1.55, 0.84],
    [0.145, 0.09],
    [0.105, 0.075],
    {
      color: STONE_DARK,
      bone: jaw,
      name: "lowerJaw",
    },
  );

  b.part(new THREE.SphereGeometry(0.105, 8, 6), MOUTH, {
    bone: jaw,
    at: [0, 1.58, 0.72],
    scale: [1.05, 0.5, 1.18],
    flat: true,
    name: "mouthCavity",
  });

  // Upper and lower teeth: broad, readable carved fangs.
  for (const s of [1, -1]) {
    stoneSpike(
      b,
      [s * 0.09, 1.67, 0.72],
      [0, -1, 0],
      0.12,
      0.027,
      CARVED_EDGE,
      head,
    );
    stoneSpike(
      b,
      [s * 0.045, 1.64, 0.77],
      [0, -1, 0],
      0.085,
      0.021,
      STONE_LIGHT,
      head,
    );
    stoneSpike(
      b,
      [s * 0.095, 1.585, 0.76],
      [0, 1, 0],
      0.075,
      0.022,
      CARVED_EDGE,
      jaw,
    );
  }

  // Ears are broad pointed gothic slabs.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.16, 0, "sharp"],
    [0.13, 0.19, "sharp"],
    [0.055, 0.34, "sharp"],
    [0.025, 0.17, "sharp"],
  ];
  const innerEar: [number, number, "sharp"][] = [
    [0.025, 0.025, "sharp"],
    [0.125, 0.025, "sharp"],
    [0.105, 0.16, "sharp"],
    [0.058, 0.27, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.19, 1.85, 0.31],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: STONE,
      bone: head,
      name: `pointedEar${s > 0 ? "L" : "R"}`,
    });
    b.extrude(innerEar, {
      at: [s * 0.198, 1.865, 0.335],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: STONE_DARK,
      bone: head,
      name: `innerEar${s > 0 ? "L" : "R"}`,
    });
  }

  // Crown crest gives the silhouette a cathedral-finial quality.
  b.extrude(
    [
      [-0.13, 0, "sharp"],
      [0.13, 0, "sharp"],
      [0.095, 0.16, "sharp"],
      [0, 0.31, "sharp"],
      [-0.095, 0.16, "sharp"],
    ],
    {
      at: [0, 1.84, 0.42],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: STONE_DARK,
      bone: head,
      name: "foreheadCrest",
    },
  );

  // Eye decals are seated on the skull surface, then made faintly self-lit.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(s * 26, 8);
    if (eyeHit) {
      const eye = b.decal(skull, EYE_TEXTURE, {
        at: eyeHit,
        dir: eyeHit.n,
        up: [0, 1, 0],
        size: [0.105, 0.145],
        segments: 8,
        lift: 0.004,
        mirror: s > 0,
        name: `emberEye${s > 0 ? "L" : "R"}`,
      });
      glow(eye, 1.35);
    }

    // Heavy stone brows protect the eyes.
    b.rod(
      [s * 0.085, 1.86, 0.585],
      [s * 0.155, 1.875, 0.62],
      0.023,
      {
        color: STONE_DARK,
        bone: head,
        name: `browRidge${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Horns curl upward and backward from the temples.
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hornBase = headSurface.around(head.at).at(s * 52, 48);
    if (hornBase) {
      const hornPath = bezier(
        hornBase,
        [s * 0.31, 1.98, 0.28],
        [s * 0.45, 2.16, 0.11],
        [s * 0.34, 2.29, -0.02],
      );
      const horn = b.sprout(
        `horn${s > 0 ? "L" : "R"}`,
        hornBase,
        hornPath,
        [0.064, 0.012],
        {
          count: 0,
          color: STONE_DARK,
          caps: { start: "round", end: "point" },
          group: "head",
        },
      );

      b.along(horn.sweep, 4, (at: any, i: number) =>
        b.rod(
          at.moved([0, -0.008, 0]),
          at.moved([0, 0.009, 0]),
          0.009,
          {
            color: CARVED_EDGE,
            name: `hornChisel${s > 0 ? "L" : "R"}${i}`,
          },
        ),
      );
    }
  }

  // A collar of chunky carved stones at the base of the neck.
  b.ring(
    neck.joints[1],
    { count: 9, radius: 0.205, tilt: 8, role: "fan", name: "neckCollar" },
    (item: any) =>
      b.part(new THREE.SphereGeometry(0.045, 6, 5), STONE_DARK, {
        frame: item,
        flat: true,
        name: "collarStone",
      }),
  );

  // ---------------------------------------------------------------------------
  // Surface chips, carved studs, and a few deliberate masonry imperfections.

  const bodySurface = b.surface([body, neckTube]);
  const chips = bodySurface.scatter(24, {
    rng: rng(190),
    minDist: 0.105,
    filter: (h: any) => h.n.y > -0.55 && h.at.y > 0.72,
  });

  for (let i = 0; i < chips.length; i++) {
    const h = chips[i];
    b.stick(
      new THREE.CylinderGeometry(0.018, 0.026, 0.009, 6),
      i % 3 === 0 ? CARVED_EDGE : STONE_DARK,
      h,
      {
        embed: 0.42,
        spin: i * 37,
        name: `weatheredChip${i}`,
      },
    );
  }

  // A line of small shoulder rivets imitates old repairs in the cathedral stone.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), CARVED_EDGE, {
        at: [s * (0.34 + i * 0.018), 1.34 + i * 0.055, 0.2],
        bone: spine.joints[2],
        flat: true,
        name: `shoulderRepair${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // A final gargoyle-like brow stone over the nose.
  b.part(new THREE.SphereGeometry(0.07, 7, 5), STONE_DARK, {
    bone: head,
    at: [0, 1.79, 0.7],
    scale: [1.7, 0.45, 0.8],
    flat: true,
    name: "browKeystone",
  });

  return b.root;
}
