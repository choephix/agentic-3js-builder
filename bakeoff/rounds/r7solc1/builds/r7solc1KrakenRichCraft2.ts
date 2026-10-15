import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  polyline,
  bezier,
  rng,
  paint,
  noise,
  mix,
  mottle,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Abyssal Sovereign",
  description:
    "A heroic, angular kraken erupting from a ring of black ocean: eight independently rigged tentacles, coral suction cups, luminous eyes and a towering jade carapace.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "AbyssalSovereign",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(72841);

  const C = {
    ink: "#101b32",
    deep: "#202d49",
    purple: "#51416d",
    plum: "#77517d",
    teal: "#268c91",
    jade: "#3db5ad",
    paleJade: "#82d6c4",
    edge: "#b4e9d1",
    coral: "#dc776e",
    salmon: "#ffab83",
    cupDark: "#653b63",
    gold: "#deb66e",
    ivory: "#ffe5b3",
    cyan: "#65fff0",
    blueGlow: "#3bbbe1",
    eye: "#ffb543",
    white: "#eafff2",
    ocean: "#15364c",
    oceanSide: "#101f34",
    foam: "#96e4dd",
  };

  const skin = paint((p, n) => {
    const mottling = noise(p, 0.26, 18);
    const upper = Math.max(0, Math.min(1, n.y * 0.75 + 0.36));
    const col = mix(C.purple, C.teal, upper * 0.76);
    return mix(col, "#1d2948", (1 - mottling) * 0.24);
  });

  const shellPaint = paint((p, n) => {
    const light = Math.max(0, n.y * 0.45 + n.z * 0.3 + 0.28);
    const col = mix("#19526b", "#48b9ad", light);
    return mix(col, "#79d7bd", noise(p, 0.45, 4) * 0.14);
  });

  const underside = paint((p, n) => {
    const col = mix("#83517e", "#cf7d91", 0.46 + n.y * 0.23);
    return mix(col, "#ed9a97", noise(p, 0.22, 3) * 0.18);
  });

  const cupPaint = paint((p, n) =>
    mix("#ba616f", "#ffb28b", 0.35 + Math.max(0, n.y) * 0.38 + noise(p, 0.08, 2) * 0.2),
  );

  const waterPaint = paint((p, n) => {
    const ring = Math.sin(Math.hypot(p.x, p.z) * 15 + p.y * 5);
    return mix("#12364d", "#27677a", Math.max(0, n.y) * 0.44 + (ring + 1) * 0.08);
  });

  const rockPaint = mottle("#101c30", "#294255", {
    size: 0.7,
    contrast: 0.65,
    seed: 9,
  });

  // The skeleton is established before the volumes and ornaments.
  const core = b.joint("hips", {
    at: [0, 1.5, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 1.5, 0],
      [0, 1.98, -0.02],
      [0, 2.5, -0.03],
    ],
    {
      parent: core,
      names: ["spineLower", "spineUpper", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 2.67, 0],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.03, 0.62],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const mantleRig = b.chain(
    "mantle",
    [
      [0, 2.88, -0.19],
      [0, 3.55, -0.25],
      [0, 4.16, -0.34],
      [0, 4.77, -0.46],
    ],
    {
      parent: head,
      names: ["mantleBase", "mantleMiddle", "mantleCrown", "mantleTip"],
      role: "spine",
    },
  );

  const armPaths = [
    [
      [0.46, 1.53, 0.53],
      [0.96, 1.1, 1.13],
      [1.55, 0.64, 1.85],
      [2.25, 0.66, 2.3],
      [2.83, 1.06, 2.48],
      [3.04, 1.65, 2.43],
      [2.9, 1.94, 2.3],
    ],
    [
      [0.77, 1.7, 0.08],
      [1.42, 1.34, 0.15],
      [2.18, 1.12, 0.25],
      [2.99, 1.35, 0.37],
      [3.53, 1.98, 0.48],
      [3.57, 2.51, 0.5],
      [3.31, 2.74, 0.53],
    ],
    [
      [0.64, 1.81, -0.56],
      [1.22, 1.63, -1.03],
      [2.02, 1.81, -1.48],
      [2.72, 2.43, -1.7],
      [2.91, 3.25, -1.64],
      [2.63, 3.73, -1.48],
      [2.34, 3.63, -1.35],
    ],
    [
      [0.24, 1.88, -0.79],
      [0.43, 1.71, -1.49],
      [0.77, 1.95, -2.25],
      [1.15, 2.54, -2.81],
      [1.24, 3.25, -2.93],
      [0.98, 3.74, -2.72],
      [0.7, 3.63, -2.56],
    ],
  ];

  const arms: {
    chain: ReturnType<typeof b.chain>;
    side: number;
    index: number;
  }[] = [];

  for (const s of [1, -1]) {
    for (let i = 0; i < armPaths.length; i++) {
      const side = s > 0 ? "L" : "R";
      const path = armPaths[i].map(([x, y, z]) => [s * x, y, z]);
      const arm = b.chain(`tentacle${i + 1}${side}`, catmull(path), {
        parent: core,
        count: 6,
        names: (j) => `tentacle${i + 1}${side}_${j + 1}`,
        role: "tentacle",
      });
      arms.push({ chain: arm, side: s, index: i });
    }
  }

  const finL = b.joint("mantleFinL", {
    parent: mantleRig.joints[1],
    at: [0.66, 3.48, -0.3],
    dir: [1, 0.35, -0.2],
    role: "fan",
  });
  const finR = b.joint("mantleFinR", {
    parent: mantleRig.joints[1],
    at: [-0.66, 3.48, -0.3],
    dir: [-1, 0.35, -0.2],
    role: "fan",
  });

  type Bone = typeof core;

  function ball(
    name: string,
    at: number[],
    scale: number[],
    color: any,
    bone: Bone = core,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      at,
      scale,
      bone,
      flat: true,
      name,
    });
  }

  function box(
    name: string,
    at: number[],
    size: number[],
    color: any,
    bone: Bone = core,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone,
      name,
    });
  }

  function tube(
    name: string,
    points: number[][],
    radii: number | number[],
    color: any,
    bone: Bone = core,
  ) {
    return b.sweep(catmull(points), radii, {
      color,
      bone,
      sides: 6,
      smooth: false,
      name,
    });
  }

  function plate(
    name: string,
    points: number[][],
    color: any,
    bone: Bone,
    thickness = 0.07,
  ) {
    return b.slab(points, { color, thickness, bone, name });
  }

  const eyeDrawing = svg(
    `<svg viewBox="0 0 160 110">
      <defs>
        <linearGradient id="iris" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#ff613e"/>
          <stop offset=".48" stop-color="#ffb53f"/>
          <stop offset="1" stop-color="#fff0a7"/>
        </linearGradient>
      </defs>
      <path d="M7 59 Q21 16 74 13 Q122 12 154 43
               Q137 91 82 98 Q31 98 7 59Z"
            fill="#142239" stroke="#081422" stroke-width="6"/>
      <path d="M15 59 Q33 28 78 25 Q119 22 144 46
               Q126 80 82 86 Q39 85 15 59Z"
            fill="url(#iris)"/>
      <path d="M81 26 L92 54 L83 85 L72 58Z" fill="#142239"/>
      <path d="M31 49 Q48 34 66 36" fill="none"
            stroke="#fff4ca" stroke-width="7" stroke-linecap="round"/>
      <path d="M107 70 L118 65" stroke="#fff9df" stroke-width="5"
            stroke-linecap="round"/>
      <path d="M17 30 L33 19 M119 14 L140 26"
            stroke="#fcb54b" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  const cupDrawing = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#663d64"/>
      <circle cx="50" cy="50" r="40" fill="#94516f"/>
      <circle cx="50" cy="50" r="30" fill="#673c60"
              stroke="#e68b91" stroke-width="4"/>
      <path d="M50 8 L50 19 M79 20 L72 29 M92 50 L81 50
               M80 79 L72 72 M50 92 L50 81 M20 80 L28 72
               M8 50 L19 50 M20 20 L28 28"
            stroke="#f6b2a2" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="13" fill="#302941"/>
      <path d="M40 46 Q44 39 51 40" fill="none"
            stroke="#be7890" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const gillDrawing = svg(
    `<svg viewBox="0 0 160 90">
      <path d="M14 25 Q64 5 145 16 L133 28 Q65 17 17 38Z"
            fill="#12334a"/>
      <path d="M19 47 Q75 24 139 36 L126 49 Q67 38 23 60Z"
            fill="#12334a"/>
      <path d="M29 69 Q77 47 126 57 L113 70 Q70 62 34 81Z"
            fill="#12334a"/>
      <path d="M19 26 Q78 11 136 19 M25 48 Q82 32 129 39
               M35 69 Q85 54 116 60"
            fill="none" stroke="#80dbc7" stroke-width="3.5"/>
    </svg>`,
    { size: 256 },
  );

  const crownDrawing = svg(
    `<svg viewBox="0 0 180 260">
      <path d="M90 13 L148 90 L134 185 L90 244 L46 185 L32 90Z"
            fill="none" stroke="#102c43" stroke-width="14"/>
      <path d="M90 13 L148 90 L134 185 L90 244 L46 185 L32 90Z"
            fill="none" stroke="#87dfc6" stroke-width="5"/>
      <path d="M90 45 L124 102 L90 182 L56 102Z"
            fill="#153d51" stroke="#c9e9bc" stroke-width="4"/>
      <path d="M90 69 L107 105 L90 146 L73 105Z" fill="#71fff0"/>
      <path d="M57 196 L90 220 L123 196 M24 77 L42 66
               M138 66 L156 77"
            stroke="#d9b774" stroke-width="6" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const scarDrawing = svg(
    `<svg viewBox="0 0 100 150">
      <path d="M65 10 L31 66 L53 74 L22 139 L69 68 L48 61 L78 13Z"
            fill="#12384c"/>
      <path d="M65 14 L36 63 M53 79 L29 128"
            stroke="#83dac4" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 192 },
  );

  const plaqueDrawing = svg(
    `<svg viewBox="0 0 560 140">
      <rect x="5" y="5" width="550" height="130" rx="12"
            fill="#12283d" stroke="#7ac8c3" stroke-width="6"/>
      <path d="M27 28 H109 M451 28 H533 M27 110 H109 M451 110 H533"
            stroke="#e3b974" stroke-width="4"/>
      <text x="280" y="63" text-anchor="middle" font-family="sans-serif"
            font-weight="900" font-size="38" letter-spacing="5"
            fill="#e5f5db">ABYSSAL</text>
      <text x="280" y="104" text-anchor="middle" font-family="sans-serif"
            font-weight="700" font-size="25" letter-spacing="10"
            fill="#77cfc7">SOVEREIGN</text>
    </svg>`,
    { size: 768 },
  );

  // Settle the face first: broad eye sockets, a fierce but readable gaze,
  // and a beak whose lower half has its own jaw bone.
  const skull = ball(
    "head.mass",
    [0, 2.65, 0.05],
    [1.04, 0.83, 0.82],
    skin,
    head,
    12,
  );
  ball("face.lower", [0, 2.15, 0.18], [0.81, 0.56, 0.65], underside, head);
  ball("face.bridge", [0, 2.68, 0.74], [0.205, 0.38, 0.21], shellPaint, head, 8);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const normal = [s * 0.24, 0.02, 1];

    const socket = ball(
      `eyeSocket${side}`,
      [s * 0.61, 2.71, 0.715],
      [0.43, 0.345, 0.235],
      C.ink,
      head,
      12,
    );
    const eye = ball(
      `eyeGlobe${side}`,
      [s * 0.61, 2.71, 0.795],
      [0.355, 0.265, 0.185],
      C.ink,
      head,
      12,
    );

    glow(
      b.decal(eye, eyeDrawing, {
        at: [s * 0.61, 2.71, 0.974],
        dir: normal,
        size: [0.72, 0.475],
        mirror: s > 0,
        lift: 0.004,
        bone: head,
        name: `eyeDrawing${side}`,
      }),
      0.75,
    );

    plate(
      `browArmor${side}`,
      [
        [s * 0.22, 2.955, 0.8],
        [s * 0.49, 3.17, 0.77],
        [s * 0.97, 3.12, 0.65],
        [s * 1.12, 2.96, 0.51],
        [s * 0.86, 3.0, 0.87],
        [s * 0.4, 2.94, 0.97],
      ],
      shellPaint,
      head,
      0.115,
    );

    tube(
      `browHighlight${side}`,
      [
        [s * 0.25, 2.985, 0.85],
        [s * 0.51, 3.135, 0.85],
        [s * 0.92, 3.09, 0.77],
      ],
      [0.027, 0.021, 0.008],
      C.paleJade,
      head,
    );

    plate(
      `cheekPlate${side}`,
      [
        [s * 0.36, 2.4, 0.89],
        [s * 0.82, 2.42, 0.76],
        [s * 1.05, 2.63, 0.44],
        [s * 0.97, 2.23, 0.45],
        [s * 0.57, 2.1, 0.74],
      ],
      shellPaint,
      head,
      0.09,
    );

    tube(
      `cheekGlow${side}`,
      [
        [s * 0.52, 2.26, 0.835],
        [s * 0.78, 2.35, 0.78],
        [s * 0.91, 2.5, 0.64],
      ],
      [0.017, 0.02, 0.008],
      C.cyan,
      head,
    );

    b.decal(skull, gillDrawing, {
      at: [s * 0.95, 2.64, 0.15],
      dir: [s, 0, 0.2],
      size: [0.5, 0.3],
      bone: head,
      lift: 0.004,
      name: `gills${side}`,
      mirror: s < 0,
    });

    void socket;
  }

  // A dark mouth aperture deliberately remains visible between the jaws.
  ball("mouth.aperture", [0, 2.09, 0.79], [0.34, 0.31, 0.17], C.ink, head, 8);

  b.extrude(
    [
      [-0.23, 0.21],
      [-0.2, 0.43],
      [0, 0.53],
      [0.2, 0.43],
      [0.23, 0.21],
      [0.115, 0.14],
      [0, -0.045],
      [-0.1, 0.13],
    ],
    {
      at: [0, 1.99, 1.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.23,
      bevel: 0.025,
      color: C.gold,
      bone: head,
      name: "beak.upper",
    },
  );

  plate(
    "beak.upperFacet",
    [
      [0, 2.49, 1.155],
      [0.17, 2.37, 1.155],
      [0.09, 2.17, 1.155],
      [0, 1.95, 1.155],
      [-0.025, 2.23, 1.16],
    ],
    C.ivory,
    head,
    0.018,
  );

  b.extrude(
    [
      [-0.17, 0.04],
      [-0.11, -0.16],
      [0, -0.23],
      [0.11, -0.16],
      [0.17, 0.04],
      [0, -0.015],
    ],
    {
      at: [0, 2.02, 1.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.21,
      bevel: 0.022,
      color: "#b68856",
      bone: jaw,
      name: "beak.lower",
    },
  );

  for (const s of [1, -1]) {
    tube(
      `mouthPalp${s > 0 ? "L" : "R"}`,
      [
        [s * 0.36, 2.15, 0.87],
        [s * 0.43, 1.93, 1.04],
        [s * 0.3, 1.78, 1.12],
        [s * 0.22, 1.85, 1.14],
      ],
      [0.105, 0.085, 0.05, 0.012],
      underside,
      jaw,
    );
  }

  // One muscular central volume, with the mantle rising into a spearhead.
  b.loft(
    [
      { at: [0, 1.18, -0.04], w: 1.05, h: 0.9 },
      { at: [0, 1.62, -0.05], w: 1.94, h: 1.65 },
      { at: [0, 2.15, -0.04], w: 1.79, h: 1.46 },
      { at: [0, 2.65, -0.08], w: 1.68, h: 1.4 },
    ],
    {
      bone: [core, spine, head],
      color: skin,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "body",
    },
  );

  const mantle = b.loft(
    [
      { at: [0, 2.92, -0.2], w: 1.65, h: 1.36 },
      { at: [0, 3.35, -0.24], w: 1.96, h: 1.44 },
      { at: [0, 3.88, -0.33], w: 1.65, h: 1.22 },
      { at: [0, 4.38, -0.41], w: 1.03, h: 0.78 },
      { at: [0, 4.78, -0.47], w: 0.15, h: 0.18 },
    ],
    {
      bone: mantleRig,
      color: shellPaint,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "mantle.carapace",
    },
  );

  // Broad designed facets, not a dense coat of tiny scales.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const finBone = s > 0 ? finL : finR;

    plate(
      `mantleFrontPanel${side}`,
      [
        [s * 0.07, 3.13, 0.51],
        [s * 0.67, 3.23, 0.4],
        [s * 0.78, 3.58, 0.35],
        [s * 0.46, 4.12, 0.2],
        [s * 0.04, 4.61, -0.16],
        [s * 0.22, 3.8, 0.47],
      ],
      s > 0 ? "#359c99" : "#287f88",
      mantleRig.joints[1],
      0.055,
    );

    tube(
      `mantleRidge${side}`,
      [
        [s * 0.77, 3.07, 0.26],
        [s * 0.91, 3.47, 0.2],
        [s * 0.63, 4.05, 0.06],
        [s * 0.09, 4.72, -0.37],
      ],
      [0.05, 0.045, 0.03, 0.006],
      C.paleJade,
      mantleRig.joints[1],
    );

    plate(
      `mantleFin${side}`,
      [
        [s * 0.53, 3.11, -0.28],
        [s * 1.12, 3.22, -0.35],
        [s * 1.54, 3.75, -0.52],
        [s * 1.25, 3.69, -0.43],
        [s * 0.62, 4.33, -0.44],
        [s * 0.86, 3.66, -0.29],
      ],
      C.ink,
      finBone,
      0.1,
    );

    plate(
      `mantleFinInset${side}`,
      [
        [s * 0.7, 3.23, -0.22],
        [s * 1.07, 3.34, -0.28],
        [s * 1.37, 3.66, -0.44],
        [s * 1.19, 3.61, -0.35],
        [s * 0.79, 4.04, -0.36],
        [s * 0.96, 3.55, -0.23],
      ],
      C.teal,
      finBone,
      0.045,
    );

    tube(
      `finTrim${side}`,
      [
        [s * 0.65, 3.19, -0.205],
        [s * 1.1, 3.29, -0.27],
        [s * 1.48, 3.72, -0.43],
      ],
      [0.031, 0.025, 0.004],
      C.gold,
      finBone,
    );

    for (let i = 0; i < 3; i++) {
      glow(
        ball(
          `templeLight${side}${i}`,
          [s * (0.93 - i * 0.035), 3.15 + i * 0.145, 0.18 - i * 0.018],
          [0.044, 0.078, 0.039],
          C.cyan,
          mantleRig.joints[0],
          6,
        ),
        0.8,
      );
    }

    plate(
      `mantleRearPanel${side}`,
      [
        [s * 0.06, 3.0, -0.91],
        [s * 0.65, 3.14, -0.82],
        [s * 0.82, 3.55, -0.69],
        [s * 0.57, 4.07, -0.76],
        [s * 0.03, 4.59, -0.65],
        [s * 0.19, 3.8, -0.98],
      ],
      s > 0 ? "#226f7b" : "#308d8e",
      mantleRig.joints[1],
      0.065,
    );

    tube(
      `mantleRearRidge${side}`,
      [
        [s * 0.63, 3.12, -0.86],
        [s * 0.77, 3.53, -0.74],
        [s * 0.51, 4.08, -0.79],
        [s * 0.06, 4.67, -0.61],
      ],
      [0.035, 0.032, 0.02, 0.004],
      C.paleJade,
      mantleRig.joints[1],
    );

    // Three broad vent marks follow the rear armor rather than adding
    // small, noisy scales across the silhouette.
    for (let i = 0; i < 3; i++) {
      const y = 3.26 + i * 0.19;
      const width = 0.39 - i * 0.06;
      tube(
        `mantleRearVent${side}${i}`,
        [
          [s * 0.24, y, -0.985],
          [s * width, y + 0.045, -0.95],
          [s * (width + 0.17), y + 0.11, -0.87],
        ],
        [0.035, 0.031, 0.008],
        C.ink,
        mantleRig.joints[1],
      );
    }
  }

  glow(
    b.decal(mantle, crownDrawing, {
      at: [0, 3.72, 0.52],
      dir: [0, 0.12, 1],
      size: [0.55, 0.95],
      bone: mantleRig.joints[1],
      segments: 8,
      lift: 0.004,
      name: "mantle.heraldry",
    }),
    0.45,
  );

  b.decal(mantle, scarDrawing, {
    at: [0.62, 3.57, 0.37],
    dir: [0.48, 0, 1],
    size: [0.18, 0.4],
    bone: mantleRig.joints[1],
    lift: 0.005,
    name: "mantle.battleScar",
  });

  // A raised central crown catches the light in a large, clean silhouette.
  plate(
    "crown.centralBlade",
    [
      [-0.13, 4.29, -0.29],
      [0, 5.12, -0.52],
      [0.13, 4.29, -0.29],
      [0, 4.02, -0.1],
    ],
    shellPaint,
    mantleRig.joints[2],
    0.12,
  );

  tube(
    "crown.edge",
    [
      [0, 4.1, -0.026],
      [0, 4.51, -0.25],
      [0, 5.1, -0.46],
    ],
    [0.035, 0.028, 0.003],
    C.gold,
    mantleRig.joints[2],
  );

  // Eight separated limbs. Their radial paths remain available to the rig.
  // Suckers are individual little assemblies with a flared foot, fleshy rim,
  // and a drawn recessed throat.
  for (const arm of arms) {
    const { chain, side, index } = arm;
    const label = `${index + 1}${side > 0 ? "L" : "R"}`;

    const tentacle = b.sweep(
      chain,
      (t) => {
        const r = 0.46 * Math.pow(1 - t, 1.1) + 0.028;
        return [r, r * 0.89];
      },
      {
        color: skin,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `tentacle${label}.skin`,
      },
    );

    // Choose the visible inner face in surface space, rather than using
    // guessed offsets for the attached cups.
    const wanted = new THREE.Vector3(0, 0.6, 1).normalize();
    let cupAngle = 0;
    let best = -Infinity;
    for (let a = 0; a < 360; a += 15) {
      const score = tentacle.at(0.44, a).n.dot(wanted);
      if (score > best) {
        best = score;
        cupAngle = a;
      }
    }

    // The underside is a thin skin between two actual surface paths.
    // Unlike a second thick tube, it cannot engulf the suckers.
    b.membrane(
      tentacle.line(cupAngle - 58, 0.006).slice(0.07, 0.97),
      tentacle.line(cupAngle + 58, 0.006).slice(0.07, 0.97),
      {
        color: underside,
        bone: chain,
        thickness: 0.012,
        rows: 5,
        cols: 22,
        name: `tentacle${label}.innerRibbon`,
      },
    );

    for (let i = 0; i < 7; i++) {
      const t = 0.15 + i * 0.123;
      const rows = i < 5 ? [-33, 33] : [0];

      for (let row = 0; row < rows.length; row++) {
        const hit = tentacle.at(t, cupAngle + rows[row]);
        const r = (i < 5 ? 0.137 : 0.16) * Math.pow(1 - t, 0.8) + 0.02;
        const h = r * 0.52;
        const name = `tentacle${label}.cup${i + 1}_${row + 1}`;

        b.stick(
          new THREE.CylinderGeometry(r * 0.89, r * 0.66, h, 8),
          cupPaint,
          hit,
          {
            embed: 0.13,
            name: `${name}.foot`,
          },
        );

        const rimGeo = new THREE.TorusGeometry(r * 0.73, r * 0.19, 4, 10);
        rimGeo.rotateX(-Math.PI / 2);
        b.stick(rimGeo, C.salmon, hit.moved([0, h * 0.57, 0]), {
          embed: 0,
          name: `${name}.lip`,
        });

        const discGeo = new THREE.CircleGeometry(r * 0.69, 12);
        discGeo.rotateX(-Math.PI / 2);
        b.stick(discGeo, "#ffffff", hit.moved([0, h * 0.6, 0]), {
          texture: cupDrawing,
          embed: 0,
          name: `${name}.throat`,
        });
      }
    }

    // Three broad overlapping chitin plates on each arm root.
    for (let i = 0; i < 3; i++) {
      const t = 0.09 + i * 0.115;
      const dorsal = tentacle.at(t, cupAngle + 150);
      const sz = 0.29 - i * 0.053;
      const armored = new THREE.DodecahedronGeometry(1, 0);
      b.stick(armored, shellPaint, dorsal, {
        scale: [sz, sz * 0.35, sz * 1.18],
        embed: 0.3,
        flow: chain.at(t).tangent,
        name: `tentacle${label}.rootArmor${i + 1}`,
      });
    }

    const lightPath = tentacle.line(cupAngle + 83, 0.008).slice(0.2, 0.83);
    glow(
      b.sweep(lightPath, [0.022, 0.009], {
        color: C.cyan,
        bone: chain,
        sides: 5,
        smooth: false,
        name: `tentacle${label}.luminousSeam`,
      }),
      0.8,
    );

    // A single larger bioluminescent marker repeats the head's diamond motif.
    const marker = tentacle.at(0.43, cupAngle + 78);
    glow(
      b.stick(new THREE.OctahedronGeometry(0.065, 0), C.cyan, marker, {
        scale: [0.8, 0.42, 1.45],
        embed: 0.2,
        flow: chain.at(0.43).tangent,
        name: `tentacle${label}.signalNode`,
      }),
      0.8,
    );
  }

  // Low, contained ocean stage. The kraken, rather than its scenery,
  // remains both the tallest and the largest mass.
  b.part(new THREE.CylinderGeometry(4.04, 3.91, 0.18, 12), rockPaint, {
    at: [0, 0.09, 0],
    bone: core,
    name: "stage.basalt",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(4.03, 4.03, 0.055, 12), C.oceanSide, {
    at: [0, 0.195, 0],
    bone: core,
    name: "stage.darkRim",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(3.96, 3.96, 0.055, 48), waterPaint, {
    at: [0, 0.248, 0],
    bone: core,
    name: "stage.oceanSurface",
    flat: true,
  });

  // A restrained outer inlay gives the diorama a collectible hero finish.
  const outerRing = new THREE.TorusGeometry(3.99, 0.018, 4, 72);
  outerRing.rotateX(Math.PI / 2);
  b.part(outerRing, C.teal, {
    at: [0, 0.228, 0],
    bone: core,
    name: "stage.inlay",
  });

  b.lathe(
    [
      [0, 0],
      [1.25, 0],
      [1.2, 0.12],
      [0.91, 0.35],
      [0.67, 0.66],
      [0.48, 0.81],
      [0, 0.84],
    ],
    {
      at: [0, 0.27, -0.05],
      color: waterPaint,
      bone: core,
      segments: 12,
      name: "water.centralUpwelling",
    },
  );

  // Broken concentric wave crests leave plenty of dark water visible.
  const waveArcs = [
    { r: 1.35, start: 8, end: 76, h: 0.13 },
    { r: 1.46, start: 109, end: 173, h: 0.09 },
    { r: 1.4, start: 217, end: 285, h: 0.15 },
    { r: 2.04, start: 25, end: 62, h: 0.065 },
    { r: 2.13, start: 131, end: 193, h: 0.09 },
    { r: 2.23, start: 239, end: 308, h: 0.06 },
    { r: 3.22, start: 10, end: 43, h: 0.035 },
    { r: 3.38, start: 160, end: 208, h: 0.04 },
    { r: 3.44, start: 260, end: 313, h: 0.03 },
  ];

  for (let i = 0; i < waveArcs.length; i++) {
    const wave = waveArcs[i];
    const crest: number[][] = [];
    const foot: number[][] = [];
    for (let j = 0; j <= 9; j++) {
      const t = j / 9;
      const a = THREE.MathUtils.degToRad(wave.start + (wave.end - wave.start) * t);
      const y = 0.3 + Math.sin(t * Math.PI) * wave.h;
      const r = wave.r + Math.sin(t * Math.PI * 2) * 0.035;
      crest.push([Math.sin(a) * r, y, Math.cos(a) * r]);
      foot.push([Math.sin(a) * (r + 0.18), 0.277, Math.cos(a) * (r + 0.18)]);
    }
    b.membrane(crest, foot, {
      color: waterPaint,
      thickness: 0.018,
      rows: 1,
      cols: 10,
      bone: core,
      name: `water.wave${i + 1}`,
    });
    b.sweep(catmull(crest), 0.018 + wave.h * 0.16, {
      color: i % 3 === 0 ? C.foam : "#4dabab",
      bone: core,
      sides: 5,
      smooth: false,
      name: `water.foamCrest${i + 1}`,
    });
  }

  // Upright stylized splash blades connect the rising creature to the sea.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.11;
    const r = 0.9 + random() * 0.4;
    const x = Math.sin(a);
    const z = Math.cos(a);
    const height = 0.36 + random() * 0.51;
    const base = [x * r, 0.285, z * r];
    const lean = 0.2 + random() * 0.2;
    const width = 0.075 + random() * 0.065;

    const splash = b.extrude(
      [
        [-width, 0],
        [width, 0],
        [width * 0.82, height * 0.3],
        [lean * 0.7 + width * 0.3, height * 0.76],
        [lean, height, "sharp"],
        [lean * 0.65 - width * 0.24, height * 0.75],
        [-width * 0.45, height * 0.25],
      ],
      {
        at: base,
        x: [z, 0, -x],
        y: [x * 0.22, 1, z * 0.22],
        thickness: [0.035, 0.008],
        smoothing: 1,
        color: i % 3 === 0 ? "#4faeb4" : "#246b82",
        bone: core,
        name: `water.splashBlade${i + 1}`,
      },
    );

    const tip = splash.local([lean, height * 0.96, 0.015]);

    const root = splash.local([width * 0.7, height * 0.12, 0.023]);
    const middle = splash.local([
      lean * 0.7 + width * 0.2,
      height * 0.73,
      0.014,
    ]);
    b.sweep(
      bezier(root, middle, tip),
      [0.018, 0.004],
      {
        color: C.foam,
        bone: core,
        sides: 5,
        smooth: false,
        name: `water.splashHighlight${i + 1}`,
      },
    );
    ball(
      `water.splashTip${i + 1}`,
      [tip.x, tip.y, tip.z],
      [0.033, 0.055, 0.033],
      C.foam,
      core,
      6,
    );
  }

  // Water shedding from the two large front arms is intentionally sparse.
  for (const s of [1, -1]) {
    tube(
      `water.fallingRibbon${s}`,
      [
        [s * 1.62, 0.72, 1.8],
        [s * 1.7, 0.51, 1.83],
        [s * 1.79, 0.29, 1.88],
      ],
      [0.045, 0.032, 0.012],
      "#5dbdc5",
      core,
    );

    for (let j = 0; j < 3; j++) {
      const x = s * (2.43 + j * 0.11);
      ball(
        `water.suspendedDrop${s}_${j}`,
        [x, 0.48 + j * 0.14, 2.08 + j * 0.04],
        [0.035, 0.065, 0.035],
        "#77d2cf",
        core,
        6,
      );
    }
  }

  // Small foam islands are flattened primitives, not a carpet of dots.
  for (let i = 0; i < 22; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.95 + random() * 2.6;
    const size = 0.035 + random() * 0.07;
    ball(
      `water.foamIsland${i + 1}`,
      [Math.sin(a) * r, 0.286, Math.cos(a) * r],
      [size * 1.7, 0.01, size],
      i % 4 === 0 ? C.foam : "#397f91",
      core,
      6,
    );
  }

  // An inset nameplate stays below the character's silhouette.
  box("stage.plaqueBack", [0, 0.168, 3.965], [1.23, 0.27, 0.065], C.ink);
  b.part(new THREE.PlaneGeometry(1.18, 0.245), "#ffffff", {
    at: [0, 0.17, 4.002],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueDrawing,
    bone: core,
    name: "stage.nameplate",
  });

  // Keep emissive biology selective: dark sockets, lit irises and thin seams.
  // All geometry above has entered the scene through the builder.
  return b.root;
}
