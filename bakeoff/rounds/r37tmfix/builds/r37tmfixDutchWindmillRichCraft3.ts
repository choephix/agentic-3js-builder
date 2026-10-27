import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  countershade,
  rng,
  svg,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered plaster tower, warm timber trim, flower-box windows, a broad shingled cap, and four wooden sails.",
};

const PLASTER = cel("#f3c978", "#c98d4e");
const PLASTER_LIGHT = cel("#ffe3a0", "#d6a15d");
const WOOD = cel("#754326", "#44251d");
const WOOD_LIGHT = cel("#a86632", "#5c301f");
const ROOF = cel("#5d7f68", "#304c49");
const ROOF_LIGHT = cel("#86a86e", "#45634f");
const CREAM = cel("#fff1bd", "#d9b978");
const BLUE = cel("#63b6c5", "#347486");
const FLOWER = "#e86b67";
const LEAF = "#5b984b";
const METAL = cel("#d5a94d", "#805d2e");
const INK = "#34251f";

const doorTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 160">
    <rect x="4" y="4" width="92" height="152" rx="7" fill="#8a4e2d" stroke="#38241e" stroke-width="6"/>
    <rect x="13" y="14" width="74" height="58" rx="4" fill="#6fb5bd" stroke="#4a2c20" stroke-width="5"/>
    <path d="M50 15v56M14 43h72" stroke="#f2d28d" stroke-width="5"/>
    <rect x="13" y="79" width="74" height="68" rx="3" fill="#754126" stroke="#4a2c20" stroke-width="5"/>
    <path d="M20 90h60M20 108h60M20 126h60" stroke="#a86a3d" stroke-width="5"/>
    <circle cx="72" cy="104" r="5" fill="#f3c85b" stroke="#4a2c20" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const windowTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="#64b8c6" stroke="#4a2c20" stroke-width="8"/>
    <path d="M50 8v84M8 50h84" stroke="#fff0bd" stroke-width="7"/>
    <path d="M20 20l60 60M80 20L20 80" stroke="#d7edf0" stroke-width="4" opacity=".8"/>
  </svg>`,
  { size: 192 },
);

const signTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70">
    <rect x="4" y="4" width="212" height="62" rx="18" fill="#ffe19a" stroke="#563520" stroke-width="8"/>
    <text x="110" y="48" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size=" thirty" fill="#754326">MILL</text>
  </svg>`,
  { size: 256 },
);

const stripedPlaster = paint((p, n) => {
  const band = Math.sin(p.y * 34 + p.z * 1.5) > 0.7;
  return band && n.y > -0.3 ? "#f7d88a" : PLASTER;
});

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  rotation?: [number, number, number],
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    rotation,
    name,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  segments = 12,
  name?: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    name,
    flat: true,
  });
}

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  // --- Main tapered tower ---------------------------------------------------
  b.frustumBox(
    [0, 0.08, 0],
    [0, 1.32, 0],
    [0.78, 0.98],
    [0.61, 0.78],
    {
      color: stripedPlaster,
      section: "box",
      name: "tapered plaster tower",
    },
  );

  // Broad foundation stones give the mill a friendly, grounded silhouette.
  box(b, [0.92, 0.12, 0.88], [0, 0.06, 0], WOOD_LIGHT, undefined, "stone foundation");
  box(b, [0.84, 0.055, 0.82], [0, 0.145, 0], CREAM, undefined, "foundation cap");

  // Lower timber ring and corner posts.
  box(b, [0.86, 0.075, 0.055], [0, 0.35, 0.415], WOOD, undefined, "lower front sill");
  box(b, [0.72, 0.07, 0.055], [0, 0.86, 0.37], WOOD, undefined, "upper front sill");

  for (const x of [-0.34, 0.34]) {
    b.rod([x, 0.16, 0.40], [x * 0.78, 1.27, 0.34], 0.035, {
      color: WOOD,
      section: { ngon: 5 },
      name: `front corner beam ${x}`,
    });
  }

  // Front diagonal timber braces.
  b.rod([-0.32, 0.42, 0.435], [0.25, 0.78, 0.405], 0.026, {
    color: WOOD_LIGHT,
    section: { ngon: 5 },
    name: "left diagonal brace",
  });
  b.rod([0.32, 0.42, 0.435], [-0.25, 0.78, 0.405], 0.026, {
    color: WOOD_LIGHT,
    section: { ngon: 5 },
    name: "right diagonal brace",
  });

  // Side timber bands.
  for (const y of [0.39, 0.88, 1.18]) {
    b.sweep(
      catmull(
        [
          [-0.4, y, 0],
          [0, y, -0.43],
          [0.4, y, 0],
          [0, y, 0.43],
        ],
        { closed: true },
      ),
      0.025,
      { color: WOOD, caps: "none", name: `timber belt ${y}` },
    );
  }

  // --- Door and windows -----------------------------------------------------
  b.part(new THREE.PlaneGeometry(0.28, 0.47), "#ffffff", {
    at: [0, 0.39, 0.455],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "painted front door",
  });

  // Door awning.
  b.extrude(
    [
      [-0.23, 0],
      [0.23, 0],
      [0.18, 0.11],
      [-0.18, 0.11],
    ],
    {
      at: [0, 0.66, 0.47],
      x: [1, 0, 0],
      y: [0, 0.25, 1],
      thickness: 0.035,
      bevel: 0.01,
      color: ROOF_LIGHT,
      name: "door awning",
    },
  );

  // Round upper window.
  b.part(new THREE.CircleGeometry(0.145, 16), "#ffffff", {
    at: [0, 1.02, 0.382],
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTexture,
    name: "round window",
  });

  // Window sill and flower box.
  box(b, [0.43, 0.045, 0.07], [0, 0.84, 0.405], WOOD, undefined, "window sill");
  box(b, [0.37, 0.11, 0.13], [0, 0.77, 0.45], WOOD_LIGHT, undefined, "flower box");
  for (const x of [-0.13, -0.045, 0.045, 0.13]) {
    cylinder(b, 0.035, 0.055, [x, 0.86, 0.45], LEAF, 7, "flower leaves");
    cylinder(b, 0.023, 0.04, [x, 0.91, 0.45], FLOWER, 7, "flower blossom");
  }

  // Little side windows for depth.
  for (const side of [-1, 1]) {
    b.part(new THREE.CircleGeometry(0.09, 12), "#ffffff", {
      at: [side * 0.39, 0.92, 0.02],
      dir: [side, 0, 0],
      axis: "z",
      texture: windowTexture,
      name: `side window ${side}`,
    });
  }

  // Decorative sign mounted below the cap.
  box(b, [0.52, 0.18, 0.045], [0, 1.235, 0.405], WOOD, undefined, "sign board");
  b.part(new THREE.PlaneGeometry(0.43, 0.12), "#ffffff", {
    at: [0, 1.235, 0.432],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "mill sign",
  });

  // --- Cap, roof, and balcony -----------------------------------------------
  b.sweep(
    catmull(
      [
        [-0.42, 1.29, 0],
        [0, 1.29, -0.43],
        [0.42, 1.29, 0],
        [0, 1.29, 0.43],
      ],
      { closed: true },
    ),
    0.035,
    { color: WOOD, caps: "none", name: "cap rim" },
  );

  // Rounded green cap / bonnet.
  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.43, 0.08],
      [0.34, 0.18],
      [0.20, 0.28],
      [0, 0.34],
    ],
    {
      at: [0, 1.29, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: ROOF,
      name: "green bonnet roof",
    },
  );

  // Shingle-like horizontal roof stripes.
  for (const y of [1.36, 1.43, 1.50, 1.56]) {
    const r = 0.42 - (y - 1.29) * 0.75;
    cylinder(b, r, 0.018, [0, y, 0], ROOF_LIGHT, 12, "roof shingle ring");
  }

  // Small golden roof finial.
  cylinder(b, 0.035, 0.13, [0, 1.70, 0], METAL, 8, "roof finial");
  b.part(new THREE.SphereGeometry(0.06, 8, 6), METAL, {
    at: [0, 1.79, 0],
    name: "roof finial ball",
  });

  // Rear balcony rail, visible at the sides of the cap.
  for (const x of [-0.34, -0.17, 0, 0.17, 0.34]) {
    b.rod([x, 1.34, -0.39], [x, 1.48, -0.39], 0.014, {
      color: WOOD,
      section: { ngon: 5 },
      name: "balcony baluster",
    });
  }
  b.rod([-0.42, 1.49, -0.39], [0.42, 1.49, -0.39], 0.022, {
    color: WOOD,
    section: { ngon: 5 },
    name: "balcony rail",
  });

  // --- Front axle and four sails --------------------------------------------
  const hub = [0, 1.62, 0.48] as [number, number, number];

  // Axle barrel, face plate, and central cap.
  cylinder(b, 0.10, 0.22, hub, WOOD, 12, "sail axle");
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 12), METAL, {
    at: [0, 1.62, 0.61],
    dir: [0, 0, 1],
    name: "golden axle plate",
  });
  b.part(new THREE.SphereGeometry(0.095, 10, 8), WOOD_LIGHT, {
    at: [0, 1.62, 0.67],
    name: "wooden hub",
  });

  const sailOutline: [number, number, "sharp"][] = [
    [-0.055, 0, "sharp"],
    [0.06, 0, "sharp"],
    [0.13, 0.60, "sharp"],
    [0.045, 0.87, "sharp"],
    [-0.075, 0.87, "sharp"],
    [-0.12, 0.60, "sharp"],
  ];

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const radial: [number, number, number] = [Math.sin(a), Math.cos(a), 0];
    const tangent: [number, number, number] = [Math.cos(a), -Math.sin(a), 0];

    b.extrude(sailOutline, {
      at: hub,
      x: tangent,
      y: radial,
      thickness: [0.045, 0.018],
      bevel: 0.012,
      color: CREAM,
      name: `cream sail ${i + 1}`,
    });

    // Dark central spar gives each sail the chunky puppet-like graphic read.
    const p0: [number, number, number] = [
      hub[0] + radial[0] * 0.03,
      hub[1] + radial[1] * 0.03,
      hub[2] + 0.035,
    ];
    const p1: [number, number, number] = [
      hub[0] + radial[0] * 0.82,
      hub[1] + radial[1] * 0.82,
      hub[2] + 0.035,
    ];
    b.rod(p0, p1, 0.022, {
      color: WOOD,
      section: { ngon: 5 },
      name: `sail spar ${i + 1}`,
    });

    // Tiny gold end cap.
    b.part(new THREE.SphereGeometry(0.032, 7, 5), METAL, {
      at: p1,
      name: `sail end cap ${i + 1}`,
    });
  }

  // Hub cross bolts.
  for (const [x, y] of [
    [0.055, 1.675],
    [-0.055, 1.565],
    [0.055, 1.565],
    [-0.055, 1.675],
  ]) {
    cylinder(b, 0.012, 0.035, [x, y, 0.705], METAL, 6, "hub bolt");
  }

  // A pair of soft, colorful pennants on the roof.
  b.extrude(
    [
      [0, 0],
      [0.20, -0.02],
      [0.13, 0.12],
      [0.02, 0.09],
    ],
    {
      at: [0.03, 1.76, -0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: FLOWER,
      name: "pink pennant",
    },
  );
  b.extrude(
    [
      [0, 0],
      [-0.17, -0.01],
      [-0.11, 0.10],
      [-0.01, 0.08],
    ],
    {
      at: [-0.03, 1.78, -0.02],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: BLUE,
      name: "blue pennant",
    },
  );

  // Small grounding stones around the footprint, kept subordinate to the mill.
  const stones = [
    [-0.48, 0.05, 0.18, 0.17],
    [0.48, 0.05, -0.16, 0.15],
    [-0.33, 0.04, -0.43, 0.13],
    [0.30, 0.04, 0.43, 0.14],
  ];
  for (let i = 0; i < stones.length; i++) {
    const [x, y, z, s] = stones[i];
    b.part(new THREE.DodecahedronGeometry(s, 0), CREAM, {
      at: [x, y, z],
      scale: [1.2, 0.55, 0.85],
      rotation: [0, i * 27, 0],
      name: "foundation stone",
    });
  }

  return b.root;
}
