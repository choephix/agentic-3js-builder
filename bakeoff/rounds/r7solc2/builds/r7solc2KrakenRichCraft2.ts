import * as THREE from "three";
import {
  createBuilder,
  catmull,
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
    "A bold, hero-styled kraken rising through a breaking sea, with eight hooked tentacles, recessed coral suckers, jade armor and an incandescent predatory gaze.",
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
    teal: "#268c91",
    jade: "#3db5ad",
    paleJade: "#82d6c4",
    coral: "#dc776e",
    salmon: "#ffab83",
    gold: "#deb66e",
    ivory: "#ffe5b3",
    cyan: "#65fff0",
    oceanSide: "#101f34",
    foam: "#b1eee2",
  };

  const skin = paint((p, n) => {
    const upper = Math.max(0, Math.min(1, n.y * 0.75 + 0.36));
    return mix(
      mix("#303354", "#247d89", upper),
      "#152b44",
      (1 - noise(p, 0.26, 18)) * 0.22,
    );
  });

  const shellPaint = paint((p, n) => {
    const light = Math.max(0, Math.min(1, n.y * 0.45 + n.z * 0.32 + 0.3));
    return mix(
      mix("#19516b", "#4ac2ae", light),
      "#85dfc0",
      noise(p, 0.45, 4) * 0.12,
    );
  });

  const underside = paint((p, n) =>
    mix(
      mix("#653e6a", "#b86e89", 0.48 + n.y * 0.18),
      "#d68c99",
      noise(p, 0.22, 3) * 0.16,
    ),
  );

  const cupPaint = paint((p, n) =>
    mix(
      "#a44e68",
      "#ffa881",
      0.34 + Math.max(0, n.y) * 0.38 + noise(p, 0.08, 2) * 0.2,
    ),
  );

  const waterPaint = paint((p, n) => {
    const ring = Math.sin(Math.hypot(p.x, p.z) * 15 + p.y * 5);
    return mix(
      "#11334b",
      "#286d7e",
      Math.max(0, n.y) * 0.45 + (ring + 1) * 0.065,
    );
  });

  const wavePaint = paint((p, n) =>
    mix(
      "#1d5b75",
      "#58aaa9",
      Math.max(0, n.y) * 0.3 + Math.max(0, Math.min(0.5, (p.y - 0.25) * 0.6)),
    ),
  );

  const rockPaint = mottle("#101c30", "#294255", {
    size: 0.7,
    contrast: 0.65,
    seed: 9,
  });

  // Skeleton: the eight limbs are extended and separately riggable.
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
      [2.65, 1.96, 2.23],
      [2.55, 1.79, 2.21],
    ],
    [
      [0.77, 1.7, 0.08],
      [1.42, 1.34, 0.15],
      [2.18, 1.12, 0.25],
      [2.99, 1.35, 0.37],
      [3.53, 1.98, 0.48],
      [3.57, 2.51, 0.5],
      [3.31, 2.74, 0.53],
      [3.07, 2.62, 0.56],
      [3.03, 2.45, 0.57],
    ],
    [
      [0.64, 1.81, -0.56],
      [1.22, 1.63, -1.03],
      [2.02, 1.81, -1.48],
      [2.72, 2.43, -1.7],
      [2.91, 3.25, -1.64],
      [2.63, 3.73, -1.48],
      [2.34, 3.63, -1.35],
      [2.28, 3.42, -1.31],
    ],
    [
      [0.24, 1.88, -0.79],
      [0.43, 1.71, -1.49],
      [0.77, 1.95, -2.25],
      [1.15, 2.54, -2.81],
      [1.24, 3.25, -2.93],
      [0.98, 3.74, -2.72],
      [0.7, 3.63, -2.56],
      [0.63, 3.43, -2.51],
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
      const points = armPaths[i].map(([x, y, z], j, list) => {
        const t = j / (list.length - 1);
        // Slightly offset the fans, without sacrificing a neutral extended pose.
        const rise = s < 0 ? Math.sin(t * Math.PI * 0.8) * [0.06, 0.14, 0.24, -0.16][i] : 0;
        const spread = s < 0 && i === 2 ? Math.sin(t * Math.PI * 0.65) * 0.12 : 0;
        return [s * (x + spread), y + rise, z];
      });
      const chain = b.chain(`tentacle${i + 1}${side}`, catmull(points), {
        parent: core,
        count: 7,
        names: (j) => `tentacle${i + 1}${side}_${j + 1}`,
        role: "tentacle",
      });
      arms.push({ chain, side: s, index: i });
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
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
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
          <stop stop-color="#ef5338"/>
          <stop offset=".52" stop-color="#ffb53f"/>
          <stop offset="1" stop-color="#fff0a7"/>
        </linearGradient>
      </defs>
      <path d="M7 39 L44 23 L151 48
               Q133 90 82 96 Q29 94 7 56Z"
            fill="#101c30" stroke="#081422" stroke-width="5"/>
      <path d="M16 43 L45 35 L142 53
               Q121 80 81 84 Q36 83 16 56Z"
            fill="url(#iris)"/>
      <path d="M81 43 L91 59 L82 85 L72 61Z" fill="#142239"/>
      <path d="M31 51 L48 44 L62 47" fill="none"
            stroke="#fff4ca" stroke-width="6" stroke-linecap="round"/>
      <path d="M107 70 L118 65" stroke="#fff9df" stroke-width="5"
            stroke-linecap="round"/>
      <path d="M15 34 L43 20 L146 43"
            stroke="#f58c39" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const cupDrawing = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#a45975"/>
      <circle cx="50" cy="50" r="42" fill="#794462"/>
      <circle cx="50" cy="50" r="34" fill="#412c4b"/>
      <circle cx="50" cy="50" r="24" fill="#25263d"/>
      <path d="M50 7 L50 17 M80 20 L72 28 M93 50 L82 50
               M80 80 L72 72 M50 93 L50 82 M20 80 L28 72
               M7 50 L18 50 M20 20 L28 28"
            stroke="#ef9c92" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 42 Q37 26 55 29" fill="none"
            stroke="#c37b91" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 63 Q49 69 60 61" fill="none"
            stroke="#5b3c5e" stroke-width="5"/>
    </svg>`,
    { size: 192 },
  );

  const gillDrawing = svg(
    `<svg viewBox="0 0 160 90">
      <path d="M14 25 Q64 5 145 16 L133 28 Q65 17 17 38Z
               M19 47 Q75 24 139 36 L126 49 Q67 38 23 60Z
               M29 69 Q77 47 126 57 L113 70 Q70 62 34 81Z"
            fill="#12334a"/>
      <path d="M19 26 Q78 11 136 19 M25 48 Q82 32 129 39
               M35 69 Q85 54 116 60"
            fill="none" stroke="#80dbc7" stroke-width="3.5"/>
    </svg>`,
    { size: 256 },
  );

  const crownDrawing = svg(
    `<svg viewBox="0 0 240 300">
      <path d="M120 16 L176 100 L161 204 L120 270 L79 204 L64 100Z"
            fill="none" stroke="#102c43" stroke-width="15"/>
      <path d="M120 16 L176 100 L161 204 L120 270 L79 204 L64 100Z"
            fill="none" stroke="#87dfc6" stroke-width="5"/>
      <path d="M120 58 L151 110 L120 197 L89 110Z"
            fill="#153d51" stroke="#d8dfab" stroke-width="4"/>
      <path d="M120 82 L136 113 L120 159 L104 113Z" fill="#71fff0"/>
      <path d="M85 214 L120 244 L155 214
               M49 93 L35 133 L61 197
               M191 93 L205 133 L179 197"
            stroke="#d9b774" stroke-width="5" fill="none"/>
      <path d="M27 113 L19 144 L39 188
               M213 113 L221 144 L201 188"
            stroke="#619f9e" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 512 },
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

  // Face: strong sockets, slanted brows and a separate articulated lower beak.
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
    ball(
      `eyeSocket${side}`,
      [s * 0.61, 2.71, 0.715],
      [0.43, 0.325, 0.235],
      C.ink,
      head,
      12,
    );
    const eye = ball(
      `eyeGlobe${side}`,
      [s * 0.61, 2.71, 0.795],
      [0.355, 0.255, 0.185],
      C.ink,
      head,
      12,
    );
    glow(
      b.decal(eye, eyeDrawing, {
        at: [s * 0.61, 2.71, 0.974],
        dir: [s * 0.24, 0.02, 1],
        size: [0.72, 0.475],
        mirror: s > 0,
        lift: 0.004,
        bone: head,
        name: `eyeDrawing${side}`,
      }),
      0.7,
    );

    plate(
      `browArmor${side}`,
      [
        [s * 0.22, 2.88, 0.86],
        [s * 0.48, 3.13, 0.78],
        [s * 0.97, 3.16, 0.65],
        [s * 1.12, 2.99, 0.51],
        [s * 0.85, 3.025, 0.88],
        [s * 0.38, 2.9, 0.98],
      ],
      shellPaint,
      head,
      0.115,
    );
    tube(
      `browHighlight${side}`,
      [
        [s * 0.25, 2.925, 0.9],
        [s * 0.51, 3.1, 0.86],
        [s * 0.94, 3.13, 0.77],
      ],
      [0.026, 0.021, 0.007],
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
    glow(
      tube(
        `cheekGlow${side}`,
        [
          [s * 0.52, 2.26, 0.835],
          [s * 0.78, 2.35, 0.78],
          [s * 0.91, 2.5, 0.64],
        ],
        [0.015, 0.018, 0.005],
        C.cyan,
        head,
      ),
      0.65,
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

    plate(
      `cheekGoldInset${side}`,
      [
        [s * 0.88, 2.29, 0.58],
        [s * 0.73, 2.2, 0.74],
        [s * 0.69, 2.16, 0.74],
        [s * 0.86, 2.23, 0.59],
      ],
      C.gold,
      head,
      0.018,
    );
  }

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

  // Armor trim is seated on the actual carapace, avoiding floating facets.
  const mantleSurface = b.surface(mantle);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const finBone = s > 0 ? finL : finR;
    const frontRidge = mantleSurface.drape(
      catmull([
        [s * 0.74, 3.1, 0.32],
        [s * 0.81, 3.45, 0.37],
        [s * 0.61, 3.98, 0.23],
        [s * 0.21, 4.57, -0.12],
      ]),
      { lift: 0.018 },
    );
    b.sweep(frontRidge, [0.033, 0.009], {
      color: C.paleJade,
      bone: mantleRig,
      sides: 5,
      smooth: false,
      name: `mantleRidge${side}`,
    });

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
          [0.039, 0.065, 0.034],
          C.cyan,
          mantleRig.joints[0],
          6,
        ),
        0.7,
      );
    }

    const backRidge = mantleSurface.drape(
      catmull([
        [s * 0.63, 3.12, -0.86],
        [s * 0.77, 3.53, -0.82],
        [s * 0.51, 4.08, -0.79],
        [s * 0.06, 4.67, -0.61],
      ]),
      { lift: 0.015 },
    );
    b.sweep(backRidge, [0.031, 0.006], {
      color: C.paleJade,
      bone: mantleRig,
      sides: 5,
      smooth: false,
      name: `mantleRearRidge${side}`,
    });

    for (let i = 0; i < 3; i++) {
      const y = 3.26 + i * 0.19;
      const width = 0.39 - i * 0.06;
      const vent = mantleSurface.drape(
        catmull([
          [s * 0.24, y, -1.1],
          [s * width, y + 0.045, -1.03],
          [s * (width + 0.17), y + 0.11, -0.92],
        ]),
        { lift: 0.007 },
      );
      b.sweep(vent, [0.029, 0.005], {
        color: C.ink,
        bone: mantleRig,
        sides: 5,
        smooth: false,
        name: `mantleRearVent${side}${i}`,
      });
    }
  }

  glow(
    b.decal(mantle, crownDrawing, {
      at: [0, 3.72, 0.52],
      dir: [0, 0.12, 1],
      size: [0.76, 1.05],
      bone: mantleRig.joints[1],
      segments: 10,
      lift: 0.004,
      name: "mantle.heraldry",
    }),
    0.35,
  );
  b.decal(mantle, scarDrawing, {
    at: [0.62, 3.57, 0.37],
    dir: [0.48, 0, 1],
    size: [0.18, 0.4],
    bone: mantleRig.joints[1],
    lift: 0.005,
    name: "mantle.battleScar",
  });

  // A substantial spear-shaped crest, grown into the mantle rather than
  // a narrow antenna balanced on its tip.
  b.extrude(
    [
      [-0.22, 0],
      [-0.2, 0.3],
      [0, 0.89],
      [0.2, 0.3],
      [0.22, 0],
      [0, 0.13],
    ],
    {
      at: [0, 4.11, -0.36],
      x: [1, 0, 0],
      y: [0, 1, -0.14],
      thickness: [0.2, 0.025],
      color: shellPaint,
      bone: mantleRig.joints[2],
      name: "crown.centralBlade",
    },
  );
  tube(
    "crown.centralInlay",
    [
      [0, 4.36, -0.215],
      [0, 4.67, -0.35],
      [0, 4.98, -0.462],
    ],
    [0.026, 0.025, 0.003],
    C.gold,
    mantleRig.joints[2],
  );

  // Each tentacle receives a genuinely surface-following underside paint.
  // No chord-like membrane can disappear inside the curved muscle.
  for (const arm of arms) {
    const { chain, side, index } = arm;
    const label = `${index + 1}${side > 0 ? "L" : "R"}`;
    let cupAngle = 0;
    const armPaint = paint((_p, _n, s) => {
      const difference = Math.abs(((s[1] - cupAngle + 540) % 360) - 180);
      if (difference < 59) return underside;
      if (difference < 63) return C.ink;
      return skin;
    });
    const tentacle = b.sweep(
      chain,
      (t) => {
        const radius = 0.46 * Math.pow(1 - t, 1.1) + 0.023;
        return [radius, radius * 0.89];
      },
      {
        color: armPaint,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `tentacle${label}.skin`,
      },
    );

    const wanted = new THREE.Vector3(0, 0.6, 1).normalize();
    let best = -Infinity;
    for (let a = 0; a < 360; a += 15) {
      const score = tentacle.at(0.44, a).n.dot(wanted);
      if (score > best) {
        best = score;
        cupAngle = a;
      }
    }

    for (let i = 0; i < 8; i++) {
      const t = 0.13 + i * 0.112;
      const rows = i < 6 ? [-31, 31] : [0];
      for (let row = 0; row < rows.length; row++) {
        const hit = tentacle.at(t, cupAngle + rows[row]);
        const r = (i < 6 ? 0.157 : 0.14) * Math.pow(1 - t, 0.9) + 0.018;
        const h = r * 0.8;
        const name = `tentacle${label}.cup${i + 1}_${row + 1}`;
        b.stick(
          new THREE.CylinderGeometry(r * 0.91, r * 0.62, h, 8),
          cupPaint,
          hit,
          { embed: 0.13, name: `${name}.foot` },
        );
        const rim = new THREE.TorusGeometry(r * 0.72, r * 0.2, 5, 10);
        rim.rotateX(-Math.PI / 2);
        b.stick(rim, C.salmon, hit.moved([0, h * 0.64, 0]), {
          embed: 0,
          name: `${name}.lip`,
        });
        const throat = new THREE.CircleGeometry(r * 0.63, 12);
        throat.rotateX(-Math.PI / 2);
        b.stick(throat, "#ffffff", hit.moved([0, h * 0.48, 0]), {
          texture: cupDrawing,
          embed: 0,
          name: `${name}.throat`,
        });
      }
    }

    for (let i = 0; i < 3; i++) {
      const t = 0.09 + i * 0.115;
      const dorsal = tentacle.at(t, cupAngle + 150);
      const size = 0.29 - i * 0.053;
      b.stick(new THREE.DodecahedronGeometry(1, 0), shellPaint, dorsal, {
        scale: [size, size * 0.35, size * 1.18],
        embed: 0.3,
        flow: chain.at(t).tangent,
        name: `tentacle${label}.rootArmor${i + 1}`,
      });
    }

    glow(
      b.sweep(tentacle.line(cupAngle + 78, 0.008).slice(0.2, 0.87), [0.019, 0.006], {
        color: C.cyan,
        bone: chain,
        sides: 5,
        smooth: false,
        name: `tentacle${label}.luminousSeam`,
      }),
      0.65,
    );
    glow(
      b.stick(
        new THREE.OctahedronGeometry(0.064, 0),
        C.cyan,
        tentacle.at(0.43, cupAngle + 78),
        {
          scale: [0.8, 0.42, 1.45],
          embed: 0.2,
          flow: chain.at(0.43).tangent,
          name: `tentacle${label}.signalNode`,
        },
      ),
      0.65,
    );
  }

  // A restrained dark ocean stage, with broad breaking sheets replacing
  // thin reed-like splash spikes.
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
      [1.27, 0],
      [1.21, 0.16],
      [0.96, 0.4],
      [0.72, 0.68],
      [0.48, 0.83],
      [0, 0.85],
    ],
    {
      at: [0, 0.27, -0.05],
      color: waterPaint,
      bone: core,
      segments: 16,
      name: "water.centralUpwelling",
    },
  );

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
    for (let j = 0; j <= 12; j++) {
      const t = j / 12;
      const a = THREE.MathUtils.degToRad(wave.start + (wave.end - wave.start) * t);
      const y = 0.3 + Math.sin(t * Math.PI) * wave.h;
      const r = wave.r + Math.sin(t * Math.PI * 2) * 0.035;
      crest.push([Math.sin(a) * r, y, Math.cos(a) * r]);
      foot.push([Math.sin(a) * (r + 0.2), 0.277, Math.cos(a) * (r + 0.2)]);
    }
    b.membrane(crest, foot, {
      color: waterPaint,
      thickness: 0.018,
      rows: 2,
      cols: 12,
      bone: core,
      name: `water.wave${i + 1}`,
    });
    b.sweep(catmull(crest), 0.015 + wave.h * 0.14, {
      color: i % 3 === 0 ? C.foam : "#4dabab",
      bone: core,
      sides: 5,
      smooth: false,
      name: `water.foamCrest${i + 1}`,
    });
  }

  // Curled, wide splash petals are rooted to the ocean along their full feet.
  // The stepped leading edges have a clear, graphic whitewater silhouette.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.16;
    const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const height = 0.39 + random() * 0.3;
    const width = 0.46 + random() * 0.2;
    const radius = 0.94 + random() * 0.15;
    const edgeA: number[][] = [];
    const edgeB: number[][] = [];
    const lip: number[][] = [];

    for (let j = 0; j <= 8; j++) {
      const t = j / 8;
      const phi = t * Math.PI * 0.7;
      const r = radius + Math.sin(phi) * 0.42;
      const y = 0.276 + Math.sin(t * Math.PI * 0.73) * height;
      const w = width * (1 - t * 0.3);
      const bend = Math.sin(t * Math.PI) * 0.09;

      const p = radial.clone().multiplyScalar(r).addScaledVector(tangent, bend);
      edgeA.push([p.x - tangent.x * w / 2, y, p.z - tangent.z * w / 2]);
      edgeB.push([p.x + tangent.x * w / 2, y, p.z + tangent.z * w / 2]);
    }

    b.membrane(catmull(edgeA), catmull(edgeB), {
      color: wavePaint,
      thickness: 0.026,
      rows: 4,
      cols: 10,
      bone: core,
      name: `water.breakingSheet${i + 1}`,
    });

    const left = edgeA[edgeA.length - 1];
    const right = edgeB[edgeB.length - 1];
    for (let j = 0; j <= 8; j++) {
      const t = j / 8;
      const scallop = Math.sin(t * Math.PI * 4) * 0.028;
      lip.push([
        left[0] + (right[0] - left[0]) * t + radial.x * scallop,
        left[1] + Math.sin(t * Math.PI) * 0.03 + Math.abs(scallop),
        left[2] + (right[2] - left[2]) * t + radial.z * scallop,
      ]);
    }
    b.sweep(catmull(lip), [0.024, 0.036, 0.024], {
      color: C.foam,
      bone: core,
      sides: 6,
      smooth: false,
      name: `water.breakingLip${i + 1}`,
    });

    for (let j = 0; j < 3; j++) {
      const t = (j + 0.6) / 3.4;
      const x = left[0] + (right[0] - left[0]) * t;
      const z = left[2] + (right[2] - left[2]) * t;
      ball(
        `water.lipFoam${i + 1}_${j}`,
        [x, left[1] + 0.012, z],
        [0.055, 0.035, 0.045],
        C.foam,
        core,
        6,
      );
    }
  }

  // Attached rivulets make the two front limbs read wet and heavy.
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
    const foamAt = [s * 1.79, 0.29, 1.88];
    ball(
      `water.ribbonFoam${s}`,
      foamAt,
      [0.16, 0.018, 0.08],
      "#78ccc5",
      core,
      8,
    );
  }

  for (let i = 0; i < 22; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.95 + random() * 2.6;
    const size = 0.035 + random() * 0.07;
    ball(
      `water.foamIsland${i + 1}`,
      [Math.sin(a) * r, 0.286, Math.cos(a) * r],
      [size * 1.7, 0.01, size],
      i % 4 === 0 ? "#8ed4cf" : "#397f91",
      core,
      6,
    );
  }

  box("stage.plaqueBack", [0, 0.168, 3.965], [1.23, 0.27, 0.065], C.ink);
  b.part(new THREE.PlaneGeometry(1.18, 0.245), "#ffffff", {
    at: [0, 0.17, 4.002],
    dir: [0, 0, 1],
    axis: "z",
    texture: plaqueDrawing,
    bone: core,
    name: "stage.nameplate",
  });

  return b.root;
}
