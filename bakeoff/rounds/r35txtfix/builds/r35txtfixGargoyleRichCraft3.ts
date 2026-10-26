import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  limb,
  mottle,
  paint,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle carved in dark weathered masonry, perched on an ornate cathedral ledge with spread bat wings, curled horns, claws, fangs, tail spines, and carved sigils.",
};

const STONE = countershade(
  mottle("#4b4850", "#847b73", { size: 0.19, contrast: 1.1, seed: 17 }),
  "#292831",
  { level: -0.16, soft: 0.28 },
);

const STONE_LIGHT = countershade(
  mottle("#77716f", "#aaa092", { size: 0.13, contrast: 1.15, seed: 23 }),
  "#494249",
  { level: -0.1, soft: 0.24 },
);

const WING_STONE = countershade(
  mottle("#3e3c46", "#6f6a6d", { size: 0.14, contrast: 1.3, seed: 31 }),
  "#24232c",
  { level: -0.18, soft: 0.2 },
);

const LEDGE_STONE = countershade(
  mottle("#57545a", "#938980", { size: 0.24, contrast: 1.05, seed: 41 }),
  "#35343a",
  { level: -0.12, soft: 0.3 },
);

const EDGE_STONE = countershade("#a49a8d", "#514952", {
  level: 0.02,
  soft: 0.22,
});

const CARVED_DARK = "#211c28";
const SOCKET_DARK = "#171621";
const TOOTH_STONE = countershade("#c1b49b", "#71675f", {
  level: -0.02,
  soft: 0.22,
});

const MOSS = mottle("#28362f", "#68735b", {
  size: 0.075,
  contrast: 1.4,
  seed: 57,
});

const SCULPTED_EDGE = paint((_p, n, _s) =>
  n.y > 0.28 ? "#9a8d81" : "#4b4550",
);

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 96 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 69 Q26 14 61 17 Q88 20 94 64 Q72 106 39 110 Q16 102 8 69Z" fill="#181521" stroke="#0b0a10" stroke-width="5"/>
    <ellipse cx="54" cy="65" rx="24" ry="38" fill="#42d3aa" stroke="#171321" stroke-width="4"/>
    <path d="M31 65 Q54 21 78 61 Q69 43 53 38 Q37 43 31 65Z" fill="#1f766c"/>
    <path d="M32 70 Q55 105 79 68 Q68 87 53 92 Q38 87 32 70Z" fill="#82f0bd"/>
    <ellipse cx="54" cy="67" rx="9" ry="25" fill="#11111a"/>
    <ellipse cx="45" cy="45" rx="8" ry="13" fill="#fffbe5"/>
    <circle cx="66" cy="78" r="4.2" fill="#fffbe5"/>
    <path d="M10 48 Q24 30 41 25" fill="none" stroke="#171321" stroke-width="7" stroke-linecap="round"/>
    <path d="M8 39 L1 28 M13 33 L7 19" fill="none" stroke="#171321" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const CHEST_SIGIL = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="54" fill="none" stroke="#201925" stroke-width="7"/>
    <path d="M64 15 L75 48 L108 45 L82 66 L94 99 L64 79 L34 99 L46 66 L20 45 L53 48Z"
      fill="none" stroke="#b2a381" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="12" fill="#b2a381" stroke="#211a26" stroke-width="4"/>
    <path d="M64 29 V48 M64 80 V99 M29 64 H48 M80 64 H99"
      stroke="#4b3b45" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

const SHOULDER_ROSETTE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="50" fill="none" stroke="#211b26" stroke-width="7"/>
    <path d="M64 17
      C74 37 91 37 111 34
      C96 48 97 66 111 82
      C90 77 76 87 64 111
      C53 88 38 77 17 82
      C31 65 32 48 17 34
      C39 38 54 35 64 17Z"
      fill="none" stroke="#9c8f7c" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="12" fill="#9c8f7c"/>
  </svg>`,
  { size: 256 },
);

const STONE_CRACKS = svg(
  `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#211b27" stroke-linecap="round" stroke-linejoin="round">
      <path d="M63 5 L59 42 L71 67 L55 91 L65 119 L48 145 L53 187" stroke-width="5"/>
      <path d="M60 44 L30 61 L12 58 M70 67 L103 76 L119 65" stroke-width="4"/>
      <path d="M55 91 L28 103 L8 96 M65 119 L92 132 L116 125" stroke-width="4"/>
      <path d="M49 145 L24 160 L8 155 M52 145 L78 160 L107 154" stroke-width="3"/>
    </g>
  </svg>`,
  { size: 256 },
);

const LEDGE_MARK = svg(
  `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 111 V63 Q18 14 128 14 Q238 14 238 63 V111"
      fill="none" stroke="#241c29" stroke-width="8"/>
    <path d="M45 110 V70 Q45 39 128 39 Q211 39 211 70 V110"
      fill="none" stroke="#a29580" stroke-width="5"/>
    <path d="M128 18 V107 M74 107 Q128 52 182 107"
      fill="none" stroke="#4f414a" stroke-width="5"/>
    <circle cx="128" cy="62" r="12" fill="#a29580" stroke="#241c29" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "cathedral-gargoyle",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first

  const hips = b.joint("hips", {
    at: [0, 0.86, -0.18],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, -0.18],
      [0, 1.07, -0.03],
      [0, 1.28, 0.08],
    ]),
    {
      parent: hips,
      names: ["spineBase", "chest", "shoulder"],
      role: "spine",
      group: "body",
    },
  );

  const chest = spine.tip!;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.28, 0.08],
      [0, 1.43, 0.18],
      [0, 1.56, 0.27],
    ]),
    {
      parent: chest,
      names: ["neckBase", "neckMid", "neckTip"],
      role: "neck",
      group: "head",
    },
  );

  const neckTip = neck.tip!;

  const head = b.joint("head", {
    parent: neckTip,
    at: neckTip.at,
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.29, -0.09]),
    aim: head.local([0, 0.54, -0.19]),
    role: "jaw",
    group: "head",
  });

  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  const legData: any[] = [];
  const armData: any[] = [];
  const wingData: any[] = [];

  for (const s of [1, -1]) {
    const legPoints = limb(
      [s * 0.2, 0.84, -0.13],
      [s * 0.36, 0.28, 0.18],
      [0.34, 0.38, 0.28],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, legPoints, {
      parent: hips,
      names:
        s > 0
          ? ["hipL", "kneeL", "ankleL", "footL"]
          : ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      group: "limbs",
      contact: [s * 0.36, 0, 0.18],
    });

    legData.push({ s, leg });

    const armPoints = limb(
      [s * 0.28, 1.21, 0.14],
      [s * 0.48, 0.28, 0.5],
      [0.34, 0.4, 0.3],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );

    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, armPoints, {
      parent: chest,
      names:
        s > 0
          ? ["shoulderL", "elbowL", "wristL", "handL"]
          : ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      group: "limbs",
    });

    armData.push({ s, arm });

    const wingRoot: [number, number, number] = [s * 0.22, 1.36, 0.03];
    const wingWrist: [number, number, number] = [s * 0.82, 1.88, -0.14];

    const leading = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        wingRoot,
        [s * 0.53, 1.63, -0.04],
        wingWrist,
        [s * 1.05, 2.03, -0.18],
      ]),
      {
        parent: chest,
        names:
          s > 0
            ? ["wingShoulderL", "wingElbowL", "wingWristL", "wingTipL"]
            : ["wingShoulderR", "wingElbowR", "wingWristR", "wingTipR"],
        role: "wing",
        group: "wings",
      },
    );

    const trailing = b.chain(
      `wingMembrane${s > 0 ? "L" : "R"}`,
      catmull([
        wingRoot,
        [s * 0.5, 1.28, -0.25],
        [s * 0.87, 1.34, -0.55],
        [s * 1.04, 1.48, -0.62],
      ]),
      {
        parent: chest,
        names:
          s > 0
            ? ["wingLowerL1", "wingLowerL2", "wingLowerL3", "wingLowerL4"]
            : ["wingLowerR1", "wingLowerR2", "wingLowerR3", "wingLowerR4"],
        role: "fan",
        group: "wings",
      },
    );

    const fingerMid = b.chain(
      `wingFingerMid${s > 0 ? "L" : "R"}`,
      catmull([wingWrist, [s * 1.14, 1.66, -0.46]]),
      {
        parent: leading.joints[2],
        names:
          s > 0
            ? ["wingDigitMidL", "wingDigitMidTipL"]
            : ["wingDigitMidR", "wingDigitMidTipR"],
        role: "digit",
        group: "wings",
      },
    );

    const fingerLow = b.chain(
      `wingFingerLow${s > 0 ? "L" : "R"}`,
      catmull([wingWrist, [s * 1.04, 1.42, -0.65]]),
      {
        parent: leading.joints[2],
        names:
          s > 0
            ? ["wingDigitLowL", "wingDigitLowTipL"]
            : ["wingDigitLowR", "wingDigitLowTipR"],
        role: "digit",
        group: "wings",
      },
    );

    wingData.push({ s, leading, trailing, fingerMid, fingerLow });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.76, -0.32],
      [0, 0.63, -0.59],
      [0.06, 0.49, -0.84],
      [0.2, 0.38, -1.08],
      [0.38, 0.31, -1.25],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      group: "tail",
    },
  );

  const hornData: any[] = [];

  for (const s of [1, -1]) {
    const horn = b.chain(
      `horn${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.17, 1.76, 0.25],
        [s * 0.27, 1.98, 0.08],
        [s * 0.35, 2.11, -0.12],
      ]),
      {
        parent: head,
        names:
          s > 0
            ? ["hornBaseL", "hornMidL", "hornTipL"]
            : ["hornBaseR", "hornMidR", "hornTipR"],
        role: "fan",
        group: "horns",
      },
    );

    hornData.push({ s, horn });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The ledge and its gothic support carving

  const ledgeBase = b.part(
    new THREE.BoxGeometry(2.5, 0.18, 2.7),
    LEDGE_STONE,
    {
      bone: hips,
      at: [0, 0.09, -0.16],
      flat: true,
      name: "ledgeBase",
      group: "ledge",
    },
  );

  const ledgeCap = b.part(
    new THREE.BoxGeometry(2.66, 0.08, 2.56),
    LEDGE_STONE,
    {
      bone: hips,
      at: [0, 0.21, -0.16],
      flat: true,
      name: "ledgeCap",
      group: "ledge",
    },
  );

  b.part(
    new THREE.BoxGeometry(2.7, 0.1, 0.14),
    EDGE_STONE,
    {
      bone: hips,
      at: [0, 0.28, 1.03],
      flat: true,
      name: "ledgeFrontLip",
      group: "ledge",
    },
  );

  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.34, 0.2, 0.5),
      LEDGE_STONE,
      {
        bone: hips,
        at: [s * 0.82, 0.1, -0.58],
        flat: true,
        name: `ledgeBlock${s > 0 ? "L" : "R"}`,
        group: "ledge",
      },
    );

    b.extrude(
      [
        [0, 0],
        [0.3, 0],
        [0.27, 0.14],
        [0.18, 0.28],
        [0.08, 0.38],
        [0, 0.26],
      ],
      {
        at: [s * 0.72, 0, -0.58],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.5,
        bevel: 0.012,
        color: LEDGE_STONE,
        bone: hips,
        name: `gothicCorbel${s > 0 ? "L" : "R"}`,
        group: "ledge",
      },
    );
  }

  const ledgeSurface = b.surface([ledgeBase, ledgeCap]);
  const ledgeMarkHit = ledgeSurface
    .around([0, 0.24, -0.15])
    .at(0, 90)!;

  b.decal(ledgeSurface, LEDGE_MARK, {
    at: ledgeMarkHit,
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.62, 0.34],
    lift: 0.003,
    segments: 8,
    name: "ledgeArchMark",
    group: "ledge",
  });

  for (const hit of ledgeSurface.scatter(12, {
    rng: rng(65),
    minDist: 0.12,
    filter: (h) => h.n.y > 0.72,
  })) {
    b.stick(
      new THREE.CylinderGeometry(0.022, 0.034, 0.014, 6),
      MOSS,
      hit,
      {
        embed: 0.48,
        flat: true,
        name: "ledgeMoss",
        group: "ledge",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Face: settled before the rest of the ornament

  const headCenter = head.local([0, 0.08, 0.04]);

  const skull = b.part(
    new THREE.SphereGeometry(1, 10, 7),
    STONE,
    {
      bone: head,
      at: headCenter,
      scale: [0.29, 0.3, 0.27],
      flat: true,
      name: "carvedSkull",
      group: "head",
    },
  );

  const skullSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around(headCenter).at(s * 28, 8)!;

    b.decal(skull, EYE_TEXTURE, {
      at: eyeHit,
      size: [0.112, 0.15],
      mirror: s > 0,
      lift: 0.004,
      segments: 8,
      name: `emeraldEye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  const muzzleCenter = head.local([0, 0.3, -0.015]);

  const muzzle = b.part(
    new THREE.DodecahedronGeometry(1, 0),
    STONE_LIGHT,
    {
      bone: head,
      at: muzzleCenter,
      scale: [0.2, 0.15, 0.18],
      flat: true,
      name: "upperMuzzle",
      group: "face",
    },
  );

  const muzzleSurface = b.surface(muzzle);

  const jawPart = b.part(
    new THREE.DodecahedronGeometry(1, 0),
    STONE,
    {
      bone: jaw,
      at: jaw.local([0, 0.1, -0.035]),
      scale: [0.18, 0.105, 0.17],
      flat: true,
      name: "lowerJaw",
      group: "jaw",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.29, 0.065, 0.035),
    SOCKET_DARK,
    {
      bone: head,
      at: head.local([0, 0.37, -0.055]),
      flat: true,
      name: "mouthCavity",
      group: "jaw",
    },
  );

  const noseHit = muzzleSurface
    .around(muzzleCenter)
    .at(0, 6)!;

  b.stick(
    new THREE.DodecahedronGeometry(0.057, 0),
    CARVED_DARK,
    noseHit,
    {
      embed: 0.28,
      flat: true,
      name: "stoneNose",
      group: "face",
    },
  );

  for (const s of [1, -1]) {
    const nostrilHit = muzzleSurface.nearest([
      s * 0.055,
      1.535,
      0.695,
    ]);

    b.stick(
      new THREE.SphereGeometry(0.019, 6, 4),
      SOCKET_DARK,
      nostrilHit,
      {
        embed: 0.42,
        flat: true,
        name: `nostril${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    const fangHit = muzzleSurface.nearest([
      s * 0.13,
      1.49,
      0.69,
    ]);

    b.spike(
      fangHit,
      [0, -1, 0],
      0.13,
      0.026,
      {
        color: TOOTH_STONE,
        section: { ngon: 6 },
        name: `upperFang${s > 0 ? "L" : "R"}`,
        group: "face",
      },
    );

    const browPath = catmull([
      head.local([-s * 0.18, 0.18, 0.16]),
      head.local([-s * 0.09, 0.235, 0.18]),
      head.local([s * 0.015, 0.29, 0.15]),
    ]);

    b.sweep(browPath, 0.026, {
      bone: head,
      color: EDGE_STONE,
      section: { ngon: 6 },
      caps: "round",
      smooth: false,
      name: `heavyBrow${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  const mouthPath = muzzleSurface.drape(
    catmull([
      [-0.16, 1.52, 0.64],
      [-0.075, 1.505, 0.675],
      [0, 1.5, 0.685],
      [0.075, 1.505, 0.675],
      [0.16, 1.52, 0.64],
    ]),
    { lift: 0.006 },
  );

  b.sweep(mouthPath, 0.011, {
    color: CARVED_DARK,
    section: { ngon: 6 },
    caps: "round",
    smooth: false,
    name: "carvedMouthLine",
    group: "jaw",
  });

  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.105, 0.035],
        [0.16, 0.28],
        [0.075, 0.22],
        [0, 0.08],
      ],
      {
        at: head.local([-s * 0.18, 0.025, 0.13]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: [0.032, 0.018],
        bevel: 0.006,
        color: STONE,
        bone: head,
        name: `pointedEar${s > 0 ? "L" : "R"}`,
        group: "head",
      },
    );
  }

  // Horns and their carved ring ridges

  for (const data of hornData) {
    const { s, horn } = data;

    const hornTube = b.sweep(
      horn,
      (t: number) => 0.064 * (1 - t) + 0.012,
      {
        color: STONE_LIGHT,
        section: { ngon: 7 },
        caps: { start: "round", end: "point" },
        smooth: false,
        name: `curledHorn${s > 0 ? "L" : "R"}`,
        group: "horns",
      },
    );

    for (const t of [0.2, 0.43, 0.66]) {
      const ringPoint = hornTube.at(t, 0);
      const ringRadius = 0.056 * (1 - t * 0.55);

      b.ring(
        ringPoint,
        {
          count: 7,
          radius: ringRadius,
          fromDeg: 0,
          toDeg: 360,
          name: `hornRidge${s > 0 ? "L" : "R"}${t}`,
          group: "horns",
          role: "fan",
        },
        (item: any) =>
          b.part(
            new THREE.CylinderGeometry(0.008, 0.008, 0.022, 6),
            EDGE_STONE,
            {
              frame: item,
              flat: true,
              name: "hornRidgeBlock",
              group: "horns",
            },
          ),
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main body, neck, crest and chest carving

  const bodyTube = b.sweep(
    spine,
    (t: number) => 0.245 - 0.038 * t,
    {
      color: STONE,
      section: { ngon: 8 },
      smooth: false,
      caps: "round",
      name: "facetedTorso",
      group: "body",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t: number) => 0.17 - 0.037 * t,
    {
      color: STONE,
      section: { ngon: 8 },
      smooth: false,
      caps: "round",
      name: "carvedNeck",
      group: "body",
    },
  );

  const bodySurface = b.surface([bodyTube, neckTube]);

  b.part(
    new THREE.OctahedronGeometry(0.14, 0),
    STONE_LIGHT,
    {
      bone: chest,
      at: chest.local([0, 0.03, 0.1]),
      scale: [1.35, 0.9, 0.65],
      flat: true,
      name: "chestKeystone",
      group: "body",
    },
  );

  const chestHit = bodySurface.around(chest.at).at(0, 27)!;

  b.decal(bodySurface, CHEST_SIGIL, {
    at: chestHit,
    size: [0.23, 0.23],
    lift: 0.004,
    segments: 8,
    name: "chestSigil",
    group: "body",
  });

  for (const s of [1, -1]) {
    const shoulderHit = bodySurface
      .around(chest.at)
      .at(s * 47, 18)!;

    b.decal(bodySurface, SHOULDER_ROSETTE, {
      at: shoulderHit,
      size: [0.15, 0.15],
      mirror: s < 0,
      lift: 0.004,
      segments: 7,
      name: `shoulderRosette${s > 0 ? "L" : "R"}`,
      group: "body",
    });
  }

  b.along(bodyTube, 6, (at: any) =>
    b.spike(at, at, 0.065, 0.025, {
      color: SCULPTED_EDGE,
      section: { ngon: 6 },
      name: "dorsalStoneFin",
      group: "body",
    }),
  );

  const collarPath = bodySurface.loop(neck.tip!, { lift: 0.012 });

  b.sweep(collarPath, 0.018, {
    color: CARVED_DARK,
    section: { ngon: 6 },
    caps: "none",
    smooth: false,
    name: "neckCollar",
    group: "body",
  });

  const collarPath2 = bodySurface.loop(neck.joints[1], { lift: 0.009 });

  b.sweep(collarPath2, 0.012, {
    color: EDGE_STONE,
    section: { ngon: 6 },
    caps: "none",
    smooth: false,
    name: "neckCarvedBand",
    group: "body",
  });

  // Weathered raised chisel marks across the shoulders and torso

  for (const hit of b.surface([bodyTube, neckTube]).scatter(25, {
    rng: rng(73),
    minDist: 0.055,
    filter: (h) =>
      h.n.y > 0.18 &&
      h.at.y > 0.8 &&
      h.at.y < 1.48 &&
      h.at.z < 0.3,
  })) {
    b.stick(
      new THREE.OctahedronGeometry(0.018, 0),
      SCULPTED_EDGE,
      hit,
      {
        embed: 0.46,
        flat: true,
        name: "raisedChiselMark",
        group: "body",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and feet

  for (const data of legData) {
    const { s, leg } = data;

    const legTube = b.sweep(
      leg,
      (t: number) => 0.105 - 0.027 * t,
      {
        color: STONE,
        section: { ngon: 6 },
        smooth: false,
        caps: "round",
        name: `crouchedLeg${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const legSurface = b.surface(legTube);
    const kneeHit = legSurface.nearest(leg.at(0.42).at);

    b.stick(
      new THREE.OctahedronGeometry(0.12, 0),
      EDGE_STONE,
      kneeHit,
      {
        embed: 0.28,
        flat: true,
        name: `angularKnee${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const kneeBand = legSurface.loop(leg.joints[1], { lift: 0.009 });

    b.sweep(kneeBand, 0.014, {
      color: CARVED_DARK,
      section: { ngon: 6 },
      caps: "none",
      smooth: false,
      name: `kneeBand${s > 0 ? "L" : "R"}`,
      group: "limbs",
    });

    const foot = b.part(
      new THREE.DodecahedronGeometry(0.1, 0),
      STONE_LIGHT,
      {
        bone: leg.tip!,
        at: leg.tip!.at,
        scale: [1.24, 0.58, 1.45],
        flat: true,
        name: `stoneFoot${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const footSurface = b.surface(foot);

    for (const dx of [-0.065, 0, 0.065]) {
      const toeTip: [number, number, number] = [
        s * 0.36 + dx,
        0.235,
        0.49 + Math.abs(dx) * 0.5,
      ];

      const toeBase = footSurface.nearest([
        s * 0.36 + dx * 0.35,
        0.275,
        0.285,
      ]);

      b.spike(
        toeBase,
        toeTip,
        null,
        0.027,
        {
          color: TOOTH_STONE,
          section: { ngon: 6 },
          caps: { start: "round", end: "point" },
          name: `footClaw${s > 0 ? "L" : "R"}`,
          group: "limbs",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Arms, planted hands and long stone claws

  for (const data of armData) {
    const { s, arm } = data;

    const armTube = b.sweep(
      arm,
      (t: number) => 0.078 - 0.022 * t,
      {
        color: STONE,
        section: { ngon: 6 },
        smooth: false,
        caps: "round",
        name: `bracedArm${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const armSurface = b.surface(armTube);

    b.stick(
      new THREE.IcosahedronGeometry(0.083, 0),
      EDGE_STONE,
      armSurface.nearest(arm.at(0.43).at),
      {
        embed: 0.3,
        flat: true,
        name: `elbowStone${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const wristBand = armSurface.loop(arm.joints[2], { lift: 0.009 });

    b.sweep(wristBand, 0.014, {
      color: CARVED_DARK,
      section: { ngon: 6 },
      caps: "none",
      smooth: false,
      name: `wristBand${s > 0 ? "L" : "R"}`,
      group: "limbs",
    });

    const palm = b.part(
      new THREE.DodecahedronGeometry(0.09, 0),
      STONE_LIGHT,
      {
        bone: arm.tip!,
        at: arm.tip!.at,
        scale: [1.15, 0.58, 1.35],
        flat: true,
        name: `grippingPalm${s > 0 ? "L" : "R"}`,
        group: "limbs",
      },
    );

    const palmSurface = b.surface(palm);

    for (const dx of [-0.06, 0, 0.06]) {
      const fingerBase = palmSurface.nearest([
        s * 0.48 + dx * 0.3,
        0.275,
        0.53,
      ]);

      const fingerTip: [number, number, number] = [
        s * 0.48 + dx,
        0.225,
        0.72 + Math.abs(dx) * 0.4,
      ];

      b.spike(
        fingerBase,
        fingerTip,
        null,
        0.025,
        {
          color: TOOTH_STONE,
          section: { ngon: 6 },
          caps: { start: "round", end: "point" },
          name: `handClaw${s > 0 ? "L" : "R"}`,
          group: "limbs",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Bat wings: leading bones, scalloped membranes, finger bones and ribs

  for (const data of wingData) {
    const { s, leading, trailing, fingerMid, fingerLow } = data;

    const leadingTube = b.sweep(
      leading,
      (t: number) => 0.072 - 0.033 * t,
      {
        color: STONE,
        section: { ngon: 7 },
        smooth: false,
        caps: "round",
        name: `wingLeadingEdge${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    const trailingTube = b.sweep(
      trailing,
      (t: number) => 0.043 - 0.018 * t,
      {
        color: WING_STONE,
        section: { ngon: 6 },
        smooth: false,
        caps: "round",
        name: `wingTrailingEdge${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    const mainMembrane = b.membrane(leading, trailing, {
      color: WING_STONE,
      thickness: 0.022,
      rows: 5,
      cols: 5,
      scallop: 0.12,
      name: `broadWingMembrane${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    const midTube = b.sweep(
      fingerMid,
      [0.035, 0.014],
      {
        color: STONE,
        section: { ngon: 6 },
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `wingFingerMid${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    const lowTube = b.sweep(
      fingerLow,
      [0.032, 0.012],
      {
        color: STONE,
        section: { ngon: 6 },
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `wingFingerLow${s > 0 ? "L" : "R"}`,
        group: "wings",
      },
    );

    b.membrane(fingerMid, fingerLow, {
      color: WING_STONE,
      thickness: 0.018,
      rows: 4,
      cols: 4,
      scallop: 0.16,
      name: `wingLowerWeb${s > 0 ? "L" : "R"}`,
      group: "wings",
    });

    for (const t of [0.2, 0.43, 0.67, 0.86]) {
      b.rod(
        leading.at(t),
        trailing.at(t),
        0.012,
        {
          color: EDGE_STONE,
          section: { ngon: 6 },
          smooth: false,
          name: `wingRib${s > 0 ? "L" : "R"}`,
          group: "wings",
        },
      );
    }

    for (const t of [0.25, 0.5, 0.75]) {
      b.rod(
        leading.at(0.55 + t * 0.4),
        fingerMid.at(t),
        0.009,
        {
          color: CARVED_DARK,
          section: { ngon: 6 },
          smooth: false,
          name: `wingFingerRib${s > 0 ? "L" : "R"}`,
          group: "wings",
        },
      );
    }

    b.along(leadingTube, 6, (at: any) =>
      b.spike(at, at, 0.045, 0.015, {
        color: EDGE_STONE,
        section: { ngon: 6 },
        name: "wingEdgeSpike",
        group: "wings",
      }),
    );

    b.along(trailingTube, 5, (at: any) =>
      b.spike(at, at, 0.036, 0.012, {
        color: EDGE_STONE,
        section: { ngon: 6 },
        name: "wingScallopSpike",
        group: "wings",
      }),
    );

    for (const joint of [leading.joints[1], leading.joints[2]]) {
      b.part(
        new THREE.IcosahedronGeometry(0.065, 0),
        EDGE_STONE,
        {
          bone: joint,
          at: joint.at,
          scale: [1.15, 0.9, 0.82],
          flat: true,
          name: `wingJointKnuckle${s > 0 ? "L" : "R"}`,
          group: "wings",
        },
      );
    }

    const wingSurface = b.surface([leadingTube, trailingTube, midTube, lowTube]);
    const crackHit = wingSurface.nearest([
      s * 0.73,
      1.57,
      -0.3,
    ]);

    b.decal(wingSurface, STONE_CRACKS, {
      at: crackHit,
      size: [0.17, 0.3],
      lift: 0.003,
      segments: 7,
      mirror: s < 0,
      name: `wingCracks${s > 0 ? "L" : "R"}`,
      group: "wings",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Spined curling tail

  const tailTube = b.sweep(
    tail,
    (t: number) => 0.105 * (1 - t) + 0.022,
    {
      color: STONE,
      bands: [
        [0.76, EDGE_STONE],
        [1, TOOTH_STONE],
      ],
      section: { ngon: 7 },
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "curlingTail",
      group: "tail",
    },
  );

  for (const t of [0.16, 0.34, 0.53, 0.7, 0.84]) {
    const tailPoint = tailTube.at(t, 0);

    b.spike(
      tailPoint,
      tailPoint,
      0.075 * (1 - t * 0.45),
      0.022,
      {
        color: EDGE_STONE,
        section: { ngon: 6 },
        name: "tailDorsalSpine",
        group: "tail",
      },
    );
  }

  const tailSurface = b.surface(tailTube);

  for (const t of [0.26, 0.49, 0.7]) {
    const tailBand = tailSurface.loop(tail.at(t), { lift: 0.008 });

    b.sweep(tailBand, 0.012, {
      color: CARVED_DARK,
      section: { ngon: 6 },
      caps: "none",
      smooth: false,
      name: "tailCarvedBand",
      group: "tail",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A few final carved chips on the appendages and a weathered ledge crack

  for (const hit of b.surface([tailTube, ...wingData.map((w) => w.leading)]).scatter(18, {
    rng: rng(91),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.25,
  })) {
    b.stick(
      new THREE.OctahedronGeometry(0.014, 0),
      SCULPTED_EDGE,
      hit,
      {
        embed: 0.48,
        flat: true,
        name: "appendageChiselMark",
        group: "weathering",
      },
    );
  }

  const ledgeCrackHit = ledgeSurface.nearest([-0.62, 0.245, 0.3]);

  b.decal(ledgeSurface, STONE_CRACKS, {
    at: ledgeCrackHit,
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.24, 0.38],
    lift: 0.003,
    segments: 7,
    name: "ledgeCrack",
    group: "ledge",
  });

  return b.root;
}
