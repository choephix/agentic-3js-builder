import * as THREE from "three";
import {
  createBuilder,
  mottle,
  stripes,
  countershade,
  paint,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "storybook Dutch windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered brick tower, cream trim, flower-box windows, balcony, thatched cap, and four chunky wooden sails.",
};

const BRICK = "#b95742";
const BRICK_DARK = "#8f3d35";
const BRICK_LIGHT = "#d87958";
const MORTAR = "#ead8b5";
const CREAM = "#fff0c5";
const CREAM_SHADOW = "#d5b77b";
const WOOD = "#70412d";
const WOOD_LIGHT = "#a66a43";
const WOOD_DARK = "#39241f";
const ROOF = "#594941";
const ROOF_LIGHT = "#80695a";
const LEAF = "#5d9b51";
const FLOWER = "#f49d9a";
const BLUE = "#6cafd1";
const GLASS = "#a9dff0";
const INK = "#36251f";
const GOLD = "#e9bb58";

const brickPaint = countershade(
  mottle(
    stripes(BRICK, [BRICK_DARK, BRICK_LIGHT], {
      size: 0.18,
      width: 0.28,
      wobble: 0.15,
      seed: 11,
    }),
    BRICK_LIGHT,
    { size: 0.32, contrast: 1.8, seed: 4 },
  ),
  BRICK_DARK,
  { level: -0.25, soft: 0.3 },
);

const roofPaint = mottle(ROOF, ROOF_LIGHT, {
  size: 0.16,
  contrast: 1.5,
  seed: 22,
});

const timberPaint = mottle(WOOD, WOOD_LIGHT, {
  size: 0.09,
  contrast: 1.7,
  seed: 8,
});

const brickTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 64">
    <rect width="96" height="64" fill="#b95742"/>
    <g fill="none" stroke="#7f3932" stroke-width="2">
      <path d="M0 16H96M0 32H96M0 48H96"/>
      <path d="M12 0V16M36 0V16M61 0V16M86 0V16
               M0 16V32M25 16V32M50 16V32M75 16V32
               M12 32V48M37 32V48M63 32V48M88 32V48
               M0 48V64M25 48V64M50 48V64M76 48V64"/>
    </g>
    <g fill="#e18463" opacity=".6">
      <path d="M3 5h17v4H3zM42 5h13v4H42zM69 21h19v4H69zM7 37h14v4H7zM47 53h19v4H47z"/>
    </g>
  </svg>`,
  { size: 256 },
);

const doorTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <rect width="64" height="96" rx="8" fill="#71422e" stroke="#36251f" stroke-width="4"/>
    <path d="M10 22H54M10 48H54M10 74H54" stroke="#a66a43" stroke-width="5"/>
    <path d="M18 7V89M46 7V89" stroke="#4a2b25" stroke-width="3"/>
    <circle cx="48" cy="56" r="4" fill="#e9bb58" stroke="#36251f" stroke-width="2"/>
    <path d="M23 15v67M41 15v67" stroke="#c08352" stroke-width="1.5" opacity=".7"/>
  </svg>`,
  { size: 256 },
);

const windowTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 88">
    <rect x="4" y="4" width="72" height="80" rx="12" fill="#fff0c5" stroke="#36251f" stroke-width="5"/>
    <rect x="13" y="13" width="54" height="62" rx="5" fill="#9ed8e7" stroke="#70412d" stroke-width="4"/>
    <path d="M40 14V74M14 44H66" stroke="#fff0c5" stroke-width="6"/>
    <path d="M18 18h18v20H18zM44 18h16v20H44z" fill="#d9f6fa" opacity=".8"/>
  </svg>`,
  { size: 256 },
);

const signTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 64">
    <path d="M8 10Q80 0 152 10L145 55Q80 64 15 55Z" fill="#fff0c5" stroke="#36251f" stroke-width="5"/>
    <path d="M28 27Q80 13 132 27" fill="none" stroke="#b95742" stroke-width="5"/>
    <path d="M31 40Q80 28 129 40" fill="none" stroke="#6cafd1" stroke-width="5"/>
    <circle cx="25" cy="17" r="4" fill="#e9bb58"/><circle cx="135" cy="17" r="4" fill="#e9bb58"/>
  </svg>`,
  { size: 256 },
);

const flowerTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <g stroke="#36251f" stroke-width="2">
      <circle cx="24" cy="25" r="7" fill="#e9bb58"/>
      <circle cx="24" cy="11" r="7" fill="#f49d9a"/>
      <circle cx="38" cy="25" r="7" fill="#f49d9a"/>
      <circle cx="24" cy="39" r="7" fill="#f49d9a"/>
      <circle cx="10" cy="25" r="7" fill="#f49d9a"/>
    </g>
  </svg>`,
  { size: 128 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  extra: Record<string, any> = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, { at, ...extra });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  segments = 12,
  extra: Record<string, any> = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    ...extra,
  });
}

function rod(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any,
) {
  return b.rod(a, c, radius, { color, caps: "flat" });
}

function rotatedBlade(
  cx: number,
  cy: number,
  z: number,
  angle: number,
): [number, number, number][] {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const local: [number, number][] = [
    [-0.035, 0.03],
    [0.06, 0.085],
    [0.58, 0.075],
    [0.73, 0.025],
    [0.73, -0.025],
    [0.58, -0.055],
    [0.06, -0.07],
    [-0.035, -0.03],
  ];
  return local.map(([x, y]) => [
    cx + x * ca - y * sa,
    cy + x * sa + y * ca,
    z,
  ]);
}

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  // Friendly little stone foundation.
  box(b, [0.82, 0.12, 0.72], [0, 0.06, 0], MORTAR);
  cylinder(b, 0.46, 0.08, [0, 0.15, 0], mottle("#b7a78a", "#817865", { size: 0.12, seed: 6 }), 10);
  box(b, [0.72, 0.05, 0.62], [0, 0.205, 0], "#9c8b70");

  // Tapered octagonal brick tower.
  b.lathe(
    [
      [0, 0],
      [0.39, 0],
      [0.40, 0.05],
      [0.34, 1.08],
      [0.33, 1.20],
      [0.30, 1.27],
      [0, 1.27],
    ],
    {
      at: [0, 0.22, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: brickPaint,
      name: "brickTower",
    },
  );

  // Cream foundation course and upper cornice.
  cylinder(b, 0.405, 0.045, [0, 0.235, 0], CREAM, 10);
  cylinder(b, 0.345, 0.045, [0, 1.27, 0], CREAM, 10);
  cylinder(b, 0.36, 0.045, [0, 1.30, 0], CREAM_SHADOW, 10);

  // Horizontal cartoon brick bands.
  for (const y of [0.43, 0.68, 0.93, 1.16]) {
    cylinder(b, 0.365 - (y - 0.43) * 0.055, 0.018, [0, y, 0], MORTAR, 10);
  }

  // Door and chunky cream doorway surround on the front.
  box(b, [0.22, 0.34, 0.025], [0, 0.40, 0.394], WOOD_DARK);
  b.part(new THREE.PlaneGeometry(0.19, 0.30), "#ffffff", {
    at: [0, 0.405, 0.411],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    name: "paintedDoor",
  });
  box(b, [0.29, 0.045, 0.055], [0, 0.585, 0.39], CREAM);
  box(b, [0.045, 0.36, 0.055], [-0.125, 0.40, 0.39], CREAM);
  box(b, [0.045, 0.36, 0.055], [0.125, 0.40, 0.39], CREAM);
  cylinder(b, 0.012, 0.018, [0.075, 0.405, 0.428], GOLD, 8, { dir: [0, 0, 1] });

  // Two windows, each with a flower box.
  for (const [x, y, s] of [
    [-0.145, 0.79, -1],
    [0.145, 0.79, 1],
    [-0.12, 1.04, -1],
    [0.12, 1.04, 1],
  ] as const) {
    box(b, [0.16, 0.19, 0.026], [x, y, 0.345], CREAM_SHADOW);
    b.part(new THREE.PlaneGeometry(0.13, 0.16), "#ffffff", {
      at: [x, y, 0.365],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      mirror: s > 0,
      name: "windowGlass",
    } as any);
    box(b, [0.19, 0.055, 0.09], [x, y - 0.12, 0.35], WOOD);
    for (let i = -1; i <= 1; i++) {
      cylinder(b, 0.018, 0.05, [x + i * 0.045, y - 0.105, 0.35], LEAF, 6);
      b.part(new THREE.PlaneGeometry(0.035, 0.035), "#ffffff", {
        at: [x + i * 0.045, y - 0.075, 0.39],
        dir: [0, 0, 1],
        axis: "z",
        texture: flowerTexture,
        name: "windowFlower",
      });
    }
  }

  // Small front sign under the balcony.
  box(b, [0.28, 0.015, 0.13], [0, 1.145, 0.367], WOOD_DARK);
  b.part(new THREE.PlaneGeometry(0.25, 0.10), "#ffffff", {
    at: [0, 1.145, 0.378],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "windmillSign",
  });

  // Balcony deck around the tower.
  cylinder(b, 0.42, 0.055, [0, 1.265, 0], WOOD, 12);
  cylinder(b, 0.385, 0.035, [0, 1.30, 0], WOOD_LIGHT, 12);
  b.sweep(
    [
      [0, 1.345, 0.40],
      [0.28, 1.345, 0.28],
      [0.40, 1.345, 0],
      [0.28, 1.345, -0.28],
      [0, 1.345, -0.40],
      [-0.28, 1.345, -0.28],
      [-0.40, 1.345, 0],
      [-0.28, 1.345, 0.28],
      [0, 1.345, 0.40],
    ],
    0.025,
    { color: WOOD_DARK, caps: "none" },
  );

  // Balcony posts and top rail.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.39;
    const z = Math.cos(a) * 0.39;
    rod(b, [x, 1.30, z], [x, 1.46, z], 0.014, WOOD);
  }
  b.sweep(
    [
      [0, 1.46, 0.41],
      [0.29, 1.46, 0.29],
      [0.41, 1.46, 0],
      [0.29, 1.46, -0.29],
      [0, 1.46, -0.41],
      [-0.29, 1.46, -0.29],
      [-0.41, 1.46, 0],
      [-0.29, 1.46, 0.29],
      [0, 1.46, 0.41],
    ],
    0.018,
    { color: WOOD_LIGHT, caps: "none" },
  );

  // Cap and rounded roof.
  cylinder(b, 0.31, 0.08, [0, 1.50, 0], CREAM, 10);
  b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.30, 0.055],
      [0.23, 0.14],
      [0.12, 0.22],
      [0, 0.25],
    ],
    {
      at: [0, 1.54, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: roofPaint,
      name: "roundedRoof",
    },
  );
  cylinder(b, 0.055, 0.16, [0, 1.82, 0], WOOD_DARK, 8);
  b.part(new THREE.SphereGeometry(0.065, 8, 6), GOLD, {
    at: [0, 1.93, 0],
    name: "roofFinial",
  });

  // Rear support glimpsed behind the sails.
  rod(b, [-0.17, 1.15, 0.30], [0.17, 1.15, 0.30], 0.025, WOOD_DARK);
  rod(b, [0, 0.98, 0.30], [0, 1.32, 0.30], 0.025, WOOD_DARK);

  // Four broad, irregular wooden sails, all in the front plane.
  const sailCenter: [number, number, number] = [0, 1.15, 0.43];
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    b.slab(rotatedBlade(sailCenter[0], sailCenter[1], sailCenter[2], angle), {
      color: timberPaint,
      thickness: 0.045,
      name: `sail${i + 1}`,
    });
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    rod(
      b,
      [sailCenter[0] + ca * 0.06, sailCenter[1] + sa * 0.06, 0.465],
      [sailCenter[0] + ca * 0.67, sailCenter[1] + sa * 0.67, 0.465],
      0.014,
      WOOD_DARK,
    );
  }

  // Central hub, four gold bolts, and a cheerful front boss.
  cylinder(b, 0.115, 0.10, sailCenter, WOOD_DARK, 12, { dir: [0, 0, 1] });
  cylinder(b, 0.082, 0.115, [0, 1.15, 0.495], GOLD, 12, { dir: [0, 0, 1] });
  b.part(new THREE.SphereGeometry(0.058, 10, 8), CREAM, {
    at: [0, 1.15, 0.565],
  });
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), WOOD_DARK, {
      at: [Math.sin(a) * 0.075, 1.15 + Math.cos(a) * 0.075, 0.585],
    });
  }

  // Cute side braces and a tiny weather vane.
  rod(b, [-0.39, 1.33, 0], [-0.48, 1.43, 0], 0.018, WOOD);
  rod(b, [0.39, 1.33, 0], [0.48, 1.43, 0], 0.018, WOOD);
  rod(b, [0, 1.94, 0], [0, 2.08, 0], 0.009, GOLD);
  b.extrude(
    [
      [0, 0],
      [0.13, 0.025],
      [0.13, 0.055],
      [0.035, 0.055],
      [0.035, 0.13],
      [0, 0.13],
    ],
    {
      at: [0, 2.04, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      color: GOLD,
      name: "weatherVane",
    },
  );

  // A few planted tufts at the foot make the building feel inhabited without stealing the scene.
  for (const x of [-0.34, 0.34]) {
    for (let i = -1; i <= 1; i++) {
      rod(b, [x + i * 0.025, 0.22, 0.33], [x + i * 0.045, 0.32, 0.33], 0.008, LEAF);
      b.part(new THREE.SphereGeometry(0.018, 6, 4), FLOWER, {
        at: [x + i * 0.045, 0.33, 0.33],
      });
    }
  }

  return b.root;
}
