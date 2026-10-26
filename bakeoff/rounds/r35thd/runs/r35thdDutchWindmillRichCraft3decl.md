```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  grain,
  mottle,
  noise,
  paint,
  polyline,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful low-poly Dutch windmill in an Animal Crossing style, with a brick tower, teal cap, balcony, flower boxes, four striped sails, windows, signage, and a rear fantail.",
};

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);

const BRICK_MORTAR = "#f4d6ad";
const BRICK_DARK = "#b45e58";
const BRICK_MID = "#cf7868";
const BRICK_LIGHT = "#e39a78";
const STONE_DARK = "#9b8c86";
const STONE_MID = "#c2b2a4";
const STONE_LIGHT = "#e1d0b9";

const WOOD_DARK = "#553229";
const WOOD = "#88513d";
const WOOD_LIGHT = "#c27b55";
const CREAM = "#fff1c9";
const CREAM_SHADOW = "#e6bd8b";
const TEAL = "#2f8990";
const TEAL_DARK = "#1f5968";
const TEAL_LIGHT = "#65b8ad";
const BLUE_GLASS = "#6fc8d4";
const BLUE_DARK = "#245b78";
const GOLD = "#eab95b";
const RED = "#c9574f";
const PINK = "#ee8ca1";
const LEAF = "#5e9a57";
const LEAF_DARK = "#376d4d";
const INK = "#382634";

const STONE_PAINT = mottle(STONE_MID, STONE_LIGHT, {
  size: 0.28,
  contrast: 1.4,
  seed: 18,
});

const WOOD_PAINT = grain(WOOD, WOOD_LIGHT, {
  size: 0.08,
  axis: "y",
  seed: 9,
});

const ROOF_PAINT = mottle(TEAL_DARK, TEAL, {
  size: 0.21,
  contrast: 1.3,
  seed: 31,
});

const BRICK_PAINT = paint((p, _n) => {
  const y = p.y - 0.42;
  const course = Math.floor(y / 0.37);
  const fy = fract(y / 0.37);

  if (fy < 0.055) return BRICK_MORTAR;

  const around = ((Math.atan2(p.x, p.z) + TAU) % TAU) * 1.42;
  const offset = (course & 1) === 0 ? 0 : 0.26;
  const vertical = fract((around + offset) / 0.54);
  if (vertical < 0.045) return BRICK_MORTAR;

  const n = noise(p, 0.23, 14);
  if (n < 0.28) return BRICK_DARK;
  if (n > 0.72) return BRICK_LIGHT;
  return BRICK_MID;
});

const SAIL_PAINT = paint((_p, _n, s) => {
  const y = s[1];
  if (y > 2.82) return RED;
  const band = Math.floor((y + 0.18) / 0.67);
  if ((band & 3) === 1) return TEAL_LIGHT;
  if ((band & 3) === 3) return RED;
  return CREAM;
});

const DOOR_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 192">
    <rect width="128" height="192" fill="#8b523d"/>
    <rect x="7" y="7" width="114" height="178" rx="4" fill="#a9674a" stroke="#543127" stroke-width="5"/>
    <path d="M18 9V184 M42 9V184 M67 9V184 M93 9V184 M116 9V184"
      stroke="#6e3f34" stroke-width="4" opacity=".7"/>
    <path d="M11 57H117 M11 116H117" stroke="#c98a5e" stroke-width="5" opacity=".7"/>
    <circle cx="96" cy="99" r="7" fill="#f3c96b" stroke="#4e2c29" stroke-width="4"/>
    <path d="M25 18V174 M77 18V174" stroke="#e0a072" stroke-width="2" opacity=".65"/>
  </svg>`,
  { size: 256 },
);

const WINDOW_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160">
    <rect width="128" height="160" rx="8" fill="#214d70" stroke="#f7d18d" stroke-width="8"/>
    <rect x="13" y="13" width="102" height="134" rx="4" fill="#5bc1d0"/>
    <path d="M64 13V147 M13 79H115" stroke="#f7e3ae" stroke-width="9"/>
    <path d="M23 27L54 65 M105 27L74 65 M23 132L54 91 M105 132L74 91"
      stroke="#b6f1e5" stroke-width="4" opacity=".7"/>
    <circle cx="42" cy="45" r="7" fill="#ffffff" opacity=".8"/>
  </svg>`,
  { size: 256 },
);

const SIGN_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 112">
    <rect x="5" y="5" width="310" height="102" rx="19" fill="#fff0bd" stroke="#553329" stroke-width="10"/>
    <path d="M27 30 Q44 12 58 30 Q45 42 27 30 M25 82 Q45 63 59 82 Q42 96 25 82"
      fill="#67a956" stroke="#376d4d" stroke-width="4"/>
    <path d="M293 30 Q276 12 262 30 Q275 42 293 30 M295 82 Q275 63 261 82 Q278 96 295 82"
      fill="#67a956" stroke="#376d4d" stroke-width="4"/>
    <text x="160" y="67" text-anchor="middle"
      font-family="sans-serif" font-size="42" font-weight="900"
      letter-spacing="3" fill="#c9574f" stroke="#7b3d3c" stroke-width="1">MILL</text>
  </svg>`,
  { size: 512 },
);

const EMBLEM_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="56" fill="#fff0bd" stroke="#553329" stroke-width="8"/>
    <path d="M64 98V31 M64 44L45 28 M64 55L84 36 M64 67L43 51 M64 78L86 61"
      stroke="#c27b55" stroke-width="8" stroke-linecap="round"/>
    <path d="M43 28L35 21 M84 36L94 28 M43 51L31 45 M86 61L98 54"
      stroke="#eab95b" stroke-width="5" stroke-linecap="round"/>
    <circle cx="64" cy="98" r="7" fill="#c9574f"/>
  </svg>`,
  { size: 256 },
);

const FLAG_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
    <path d="M3 3H61L32 45Z" fill="#ee8ca1" stroke="#553329" stroke-width="4" stroke-linejoin="round"/>
    <path d="M11 9H53L32 36Z" fill="#fff0bd"/>
    <circle cx="32" cy="22" r="5" fill="#65b8ad"/>
  </svg>`,
  { size: 128 },
);

const BLUE_FLAG_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
    <path d="M3 3H61L32 45Z" fill="#65b8ad" stroke="#553329" stroke-width="4" stroke-linejoin="round"/>
    <path d="M11 9H53L32 36Z" fill="#fff0bd"/>
    <circle cx="32" cy="22" r="5" fill="#c9574f"/>
  </svg>`,
  { size: 128 },
);

function addBox(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: string | ReturnType<typeof paint>,
  at: [number, number, number] | THREE.Vector3,
  name: string,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    name,
    ...options,
  });
}

function addCylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  color: string | ReturnType<typeof paint>,
  at: [number, number, number] | THREE.Vector3,
  name: string,
  segments = 10,
  options: Record<string, unknown> = {},
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    name,
    ...options,
  });
}

function circlePoints(radius: number, y: number, count = 16, zOffset = 0) {
  const points: [number, number, number][] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    points.push([Math.sin(a) * radius, y, Math.cos(a) * radius + zOffset]);
  }
  return points;
}

function addRing(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  y: number,
  tube: number,
  color: string | ReturnType<typeof paint>,
  name: string,
  count = 16,
) {
  return b.sweep(polyline(circlePoints(radius, y, count), { closed: true }), tube, {
    color,
    caps: "none",
    sides: 6,
    name,
  });
}

function addVerticalRail(
  b: ReturnType<typeof createBuilder>,
  x: number,
  z: number,
  y0: number,
  y1: number,
  name: string,
) {
  return b.rod([x, y0, z], [x, y1, z], 0.035, WOOD_PAINT, {
    sides: 6,
    name,
  });
}

function addFrontWindow(
  b: ReturnType<typeof createBuilder>,
  y: number,
  width: number,
  height: number,
  name: string,
) {
  const zBack = 1.27;
  const zFront = 1.335;

  addBox(b, [width + 0.15, height + 0.15, 0.09], WOOD_DARK, [0, y, zBack], `${name}-recess`);

  b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
    at: [0, y, zFront],
    dir: [0, 0, 1],
    axis: "z",
    texture: WINDOW_TEXTURE,
    name: `${name}-glass`,
  });

  b.rod([-width / 2 - 0.075, y - height / 2 - 0.075, zFront + 0.012], [width / 2 + 0.075, y - height / 2 - 0.075, zFront + 0.012], 0.035, CREAM, {
    sides: 6,
    name: `${name}-lower`,
  });
  b.rod([-width / 2 - 0.075, y + height / 2 + 0.075, zFront + 0.012], [width / 2 + 0.075, y + height / 2 + 0.075, zFront + 0.012], 0.035, CREAM, {
    sides: 6,
    name: `${name}-upper`,
  });
  b.rod([-width / 2 - 0.075, y - height / 2 - 0.075, zFront + 0.012], [-width / 2 - 0.075, y + height / 2 + 0.075, zFront + 0.012], 0.035, CREAM, {
    sides: 6,
    name: `${name}-left`,
  });
  b.rod([width / 2 + 0.075, y - height / 2 - 0.075, zFront + 0.012], [width / 2 + 0.075, y + height / 2 + 0.075, zFront + 0.012], 0.035, CREAM, {
    sides: 6,
    name: `${name}-right`,
  });

  b.rod([0, y - height / 2, zFront + 0.02], [0, y + height / 2, zFront + 0.02], 0.018, CREAM_SHADOW, {
    sides: 5,
    name: `${name}-cross-v`,
  });
  b.rod([-width / 2, y, zFront + 0.02], [width / 2, y, zFront + 0.02], 0.018, CREAM_SHADOW, {
    sides: 5,
    name: `${name}-cross-h`,
  });
}

function addSideWindow(
  b: ReturnType<typeof createBuilder>,
  side: number,
  y: number,
  name: string,
) {
  const x = side * 1.29;
  const outward = side * 1.0;

  addBox(b, [0.09, 0.54, 0.46], WOOD_DARK, [x, y, 0], `${name}-recess`);

  b.part(new THREE.PlaneGeometry(0.46, 0.54), "#ffffff", {
    at: [x + side * 0.055, y, 0],
    dir: [outward, 0, 0],
    axis: "z",
    texture: WINDOW_TEXTURE,
    name: `${name}-glass`,
  });

  b.rod([x + side * 0.07, y - 0.31, -0.28], [x + side * 0.07, y - 0.31, 0.28], 0.032, CREAM, {
    sides: 6,
    name: `${name}-lower`,
  });
  b.rod([x + side * 0.07, y + 0.31, -0.28], [x + side * 0.07, y + 0.31, 0.28], 0.032, CREAM, {
    sides: 6,
    name: `${name}-upper`,
  });
  b.rod([x + side * 0.07, y - 0.31, -0.28], [x + side * 0.07, y + 0.31, -0.28], 0.032, CREAM, {
    sides: 6,
    name: `${name}-back`,
  });
  b.rod([x + side * 0.07, y - 0.31, 0.28], [x + side * 0.07, y + 0.31, 0.28], 0.032, CREAM, {
    sides: 6,
    name: `${name}-front`,
  });
}

function addFlowerBox(
  b: ReturnType<typeof createBuilder>,
  side: number,
  name: string,
) {
  const x = side * 0.88;
  const z = 1.42;

  addBox(b, [0.62, 0.22, 0.30], WOOD_PAINT, [x, 6.15, z], `${name}-box`);
  addBox(b, [0.68, 0.055, 0.34], WOOD_DARK, [x, 6.285, z], `${name}-rim`);

  for (let i = 0; i < 3; i++) {
    const fx = x + side * (i - 1) * 0.18;
    const flowerY = 6.52 + (i % 2) * 0.035;
    b.rod([fx, 6.29, z], [fx, flowerY - 0.07, z], 0.012, LEAF_DARK, {
      sides: 5,
      name: `${name}-stem-${i}`,
    });
    b.part(new THREE.SphereGeometry(0.085, 7, 5), i === 1 ? PINK : GOLD, {
      at: [fx, flowerY, z],
      flat: true,
      name: `${name}-flower-${i}`,
    });
    b.part(new THREE.SphereGeometry(0.032, 6, 4), CREAM, {
      at: [fx, flowerY, z + 0.068],
      flat: true,
      name: `${name}-center-${i}`,
    });

    const leafSide = i % 2 === 0 ? -1 : 1;
    b.extrude(
      [
        [0, 0],
        [0.10, 0.025],
        [0.18, 0.09],
        [0.08, 0.11],
        [0, 0.05],
      ],
      {
        at: [fx, 6.39, z],
        x: [leafSide, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: LEAF,
        bevel: 0.004,
        name: `${name}-leaf-${i}`,
      },
    );
  }
}

export default function build() {
  const b = createBuilder({
    name: "dutch-windmill",
    detail: 1,
    paintSize: 2048,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Foundation and tapered brick tower

  b.part(new THREE.CylinderGeometry(1.92, 2.02, 0.26, 10), STONE_PAINT, {
    at: [0, 0.13, 0],
    flat: true,
    name: "foundation-stone",
  });

  b.part(new THREE.CylinderGeometry(1.72, 1.84, 0.20, 10), STONE_LIGHT, {
    at: [0, 0.36, 0],
    flat: true,
    name: "foundation-cap",
  });

  b.lathe(
    [
      [0, 0],
      [1.62, 0],
      [1.65, 0.13],
      [1.56, 0.32],
      [1.38, 4.78],
      [1.26, 5.38],
      [1.18, 5.50],
      [0, 5.50],
    ],
    {
      at: [0, 0.45, 0],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: BRICK_PAINT,
      name: "octagonal-brick-tower",
    },
  );

  b.part(new THREE.CylinderGeometry(1.60, 1.65, 0.12, 10), BRICK_DARK, {
    at: [0, 0.58, 0],
    flat: true,
    name: "tower-lower-course",
  });

  b.part(new THREE.CylinderGeometry(1.40, 1.40, 0.10, 10), BRICK_MORTAR, {
    at: [0, 5.18, 0],
    flat: true,
    name: "tower-upper-course",
  });

  b.part(new THREE.CylinderGeometry(1.27, 1.29, 0.11, 10), BRICK_LIGHT, {
    at: [0, 5.73, 0],
    flat: true,
    name: "tower-crown-course",
  });

  // Small pale corner stones make the silhouette read as a hand-built village landmark.
  for (const side of [-1, 1]) {
    for (const zSide of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const y = 0.86 + i * 0.98;
        const radius = 1.53 - i * 0.065;
        const x = side * radius * 0.72;
        const z = zSide * radius * 0.72;
        addBox(
          b,
          [0.17, 0.27, 0.11],
          i % 2 === 0 ? STONE_LIGHT : STONE_MID,
          [x, y, z],
          `corner-stone-${side}-${zSide}-${i}`,
          { rotation: [0, side * zSide * 45, 0], flat: true },
        );
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Door, sign, and friendly front windows

  b.extrude(
    [
      [-0.53, 0],
      [0.53, 0],
      [0.53, 0.98],
      [0.43, 1.30],
      [0.22, 1.52],
      [0, 1.60],
      [-0.22, 1.52],
      [-0.43, 1.30],
      [-0.53, 0.98],
    ],
    {
      at: [0, 0.48, 1.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.14,
      bevel: 0.022,
      smoothing: 1,
      color: WOOD_PAINT,
      name: "arched-wooden-door",
    },
  );

  b.part(new THREE.PlaneGeometry(0.82, 1.17), "#ffffff", {
    at: [0, 1.10, 1.558],
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR_TEXTURE,
    name: "door-painted-panels",
  });

  b.rod([-0.56, 0.49, 1.59], [-0.56, 1.45, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-frame-left",
  });
  b.rod([0.56, 0.49, 1.59], [0.56, 1.45, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-frame-right",
  });
  b.rod([-0.56, 1.45, 1.59], [-0.37, 1.73, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-arch-left",
  });
  b.rod([0.56, 1.45, 1.59], [0.37, 1.73, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-arch-right",
  });
  b.rod([-0.37, 1.73, 1.59], [0, 1.86, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-arch-top-left",
  });
  b.rod([0.37, 1.73, 1.59], [0, 1.86, 1.59], 0.045, CREAM_SHADOW, {
    sides: 6,
    name: "door-arch-top-right",
  });

  b.part(new THREE.SphereGeometry(0.07, 8, 6), GOLD, {
    at: [0.30, 1.16, 1.64],
    flat: true,
    name: "door-gold-handle",
  });

  for (const y of [3.35, 4.35]) {
    addFrontWindow(b, y, y > 4 ? 0.52 : 0.58, y > 4 ? 0.70 : 0.78, `front-window-${y}`);
  }

  addSideWindow(b, 1, 4.02, "window-left-side");
  addSideWindow(b, -1, 4.02, "window-right-side");

  addBox(b, [1.20, 0.45, 0.14], WOOD_DARK, [0, 2.25, 1.43], "mill-sign-board");
  b.part(new THREE.PlaneGeometry(1.08, 0.37), "#ffffff", {
    at: [0, 2.25, 1.515],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN_TEXTURE,
    name: "mill-sign-art",
  });

  // A tiny wheat emblem between the upper windows.
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 12), WOOD_DARK, {
    at: [0, 5.15, 1.30],
    dir: [0, 0, 1],
    name: "emblem-disc",
  });
  b.part(new THREE.PlaneGeometry(0.53, 0.53), "#ffffff", {
    at: [0, 5.15, 1.325],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM_TEXTURE,
    name: "wheat-emblem",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Balcony, cap body, roof, and flower boxes

  b.part(new THREE.CylinderGeometry(1.56, 1.58, 0.16, 12), WOOD_PAINT, {
    at: [0, 5.98, 0],
    flat: true,
    name: "balcony-deck",
  });

  addRing(b, 1.52, 6.10, 0.045, WOOD_DARK, "balcony-front-edge", 18);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const x = Math.sin(a) * 1.48;
    const z = Math.cos(a) * 1.48;
    addVerticalRail(b, x, z, 6.05, 6.43, `balcony-post-${i}`);
  }

  addRing(b, 1.49, 6.44, 0.045, WOOD_PAINT, "balcony-top-rail", 18);

  b.part(new THREE.CylinderGeometry(1.38, 1.40, 0.46, 10), CREAM_SHADOW, {
    at: [0, 6.20, 0],
    flat: true,
    name: "rotating-cap-body",
  });

  b.part(new THREE.CylinderGeometry(1.45, 1.45, 0.075, 10), WOOD_DARK, {
    at: [0, 6.43, 0],
    flat: true,
    name: "cap-eave",
  });

  b.lathe(
    [
      [0, 0],
      [1.53, 0],
      [1.53, 0.12],
      [1.37, 0.24],
      [1.14, 0.42],
      [0.78, 0.63],
      [0.31, 0.78],
      [0, 0.80],
    ],
    {
      at: [0, 6.45, 0],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 1,
      color: ROOF_PAINT,
      name: "teal-conical-cap-roof",
    },
  );

  addRing(b, 1.46, 6.52, 0.028, TEAL_LIGHT, "roof-lower-trim", 14);
  addRing(b, 1.17, 6.86, 0.025, TEAL_DARK, "roof-middle-trim", 14);
  addRing(b, 0.76, 7.08, 0.021, TEAL_LIGHT, "roof-upper-trim", 12);

  addCylinder(b, 0.08, 0.27, GOLD, [0, 7.23, 0], "roof-finial-post", 8);
  b.part(new THREE.SphereGeometry(0.13, 8, 6), GOLD, {
    at: [0, 7.40, 0],
    flat: true,
    name: "roof-finial",
  });

  addFlowerBox(b, 1, "left-flower-box");
  addFlowerBox(b, -1, "right-flower-box");

  // Cheerful hanging pennants around the front half of the balcony.
  const flagFrames = [];
  for (let i = 0; i < 9; i++) {
    const x = -1.25 + i * 0.3125;
    flagFrames.push(frame([x, 6.43, 1.48], [0, 1, 0]));
  }
  b.cards(flagFrames, [FLAG_TEXTURE, BLUE_FLAG_TEXTURE], {
    size: [0.27, 0.23],
    lean: 180,
    flow: [0, 0, 1],
    sink: 0.04,
    color: "#ffffff",
    name: "balcony-pennants",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Four broad striped sails

  const hub = new THREE.Vector3(0, 6.82, 1.42);

  const bladeOutline: [number, number, "sharp"][] = [
    [-0.17, 0.13, "sharp"],
    [0.17, 0.13, "sharp"],
    [0.27, 0.82, "sharp"],
    [0.34, 2.22, "sharp"],
    [0.27, 3.04, "sharp"],
    [0.12, 3.26, "sharp"],
    [-0.10, 3.26, "sharp"],
    [-0.25, 3.00, "sharp"],
    [-0.29, 2.18, "sharp"],
    [-0.24, 0.82, "sharp"],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + (i * Math.PI) / 2;
    const along = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
    const across = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0);

    b.extrude(bladeOutline, {
      at: hub.clone().add(new THREE.Vector3(0, 0, 0.015)),
      x: across,
      y: along,
      thickness: [0.13, 0.09],
      bevel: 0.018,
      smoothing: 0,
      color: SAIL_PAINT,
      name: `striped-sail-${i}`,
    });

    const root = hub.clone().addScaledVector(along, 0.14);
    const tip = hub.clone().addScaledVector(along, 3.18);
    b.rod(root, tip, 0.038, WOOD_DARK, {
      sides: 6,
      name: `sail-center-spar-${i}`,
    });

    const leftRoot = hub.clone().addScaledVector(along, 0.18).addScaledVector(across, -0.16);
    const leftTip = hub.clone().addScaledVector(along, 3.06).addScaledVector(across, 0.12);
    const rightRoot = hub.clone().addScaledVector(along, 0.18).addScaledVector(across, 0.16);
    const rightTip = hub.clone().addScaledVector(along, 3.06).addScaledVector(across, 0.25);

    b.rod(leftRoot, leftTip, 0.025, WOOD, {
      sides: 5,
      name: `sail-left-edge-${i}`,
    });
    b.rod(rightRoot, rightTip, 0.025, WOOD, {
      sides: 5,
      name: `sail-right-edge-${i}`,
    });

    b.part(new THREE.SphereGeometry(0.095, 7, 5), RED, {
      at: tip,
      flat: true,
      name: `sail-tip-${i}`,
    });
  }

  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.34, 12), WOOD_DARK, {
    at: hub,
    dir: [0, 0, 1],
    flat: true,
    name: "sail-hub",
  });

  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.40, 10), GOLD, {
    at: hub.clone().add(new THREE.Vector3(0, 0, 0.17)),
    dir: [0, 0, 1],
    flat: true,
    name: "golden-hub-cap",
  });

  b.part(new THREE.SphereGeometry(0.13, 8, 6), CREAM, {
    at: hub.clone().add(new THREE.Vector3(0, 0, 0.39)),
    flat: true,
    name: "hub-center",
  });

  // Small side braces behind the hub give the sails a toy-like mechanical depth.
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.12, 6.72, 1.16],
      [side * 0.72, 6.72, 1.16],
      0.045,
      WOOD_DARK,
      { sides: 6, name: `hub-brace-${side}` },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Rear tail beam and fantail, visible around the cap from three-quarter views

  b.rod([0, 6.25, -0.92], [0, 6.78, -2.38], 0.105, WOOD_PAINT, {
    sides: 6,
    name: "rear-tail-beam",
  });
  b.rod([-0.06, 6.43, -1.43], [-0.62, 6.86, -2.22], 0.055, WOOD_DARK, {
    sides: 6,
    name: "rear-tail-brace-left",
  });
  b.rod([0.06, 6.43, -1.43], [0.62, 6.86, -2.22], 0.055, WOOD_DARK, {
    sides: 6,
    name: "rear-tail-brace-right",
  });

  const fanCenter = new THREE.Vector3(0, 6.82, -2.43);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + Math.PI / 6;
    const end = fanCenter.clone().add(new THREE.Vector3(Math.sin(a) * 0.78, Math.cos(a) * 0.78, 0));
    b.rod(fanCenter, end, 0.045, i % 2 === 0 ? WOOD : WOOD_LIGHT, {
      sides: 5,
      name: `fantail-spoke-${i}`,
    });
  }

  b.extrude(
    [
      [-0.24, 0],
      [0.24, 0],
      [0.34, 0.38],
      [0.12, 0.76],
      [-0.12, 0.76],
      [-0.34, 0.38],
    ],
    {
      at: [0, 6.47, -2.45],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.008,
      color: TEAL_LIGHT,
      name: "fantail-center-fin",
    },
  );

  b.part(new THREE.SphereGeometry(0.12, 8, 5), GOLD, {
    at: fanCenter,
    flat: true,
    name: "fantail-center-cap",
  });

  // -------------------------------------------------------------------------------------------------------------
  // A few hand-painted masonry accents and a cute threshold step

  b.part(new THREE.BoxGeometry(1.38, 0.13, 0.22), STONE_LIGHT, {
    at: [0, 0.44, 1.57],
    flat: true,
    name: "door-threshold",
  });

  b.part(new THREE.BoxGeometry(1.62, 0.10, 0.16), WOOD_DARK, {
    at: [0, 1.98, 1.54],
    flat: true,
    name: "sign-lintel",
  });

  for (let i = 0; i < 7; i++) {
    const y = 2.68 + i * 0.36;
    const x = (i % 2 === 0 ? -1 : 1) * (0.86 + (i % 3) * 0.10);
    b.part(new THREE.BoxGeometry(0.18, 0.10, 0.035), BRICK_LIGHT, {
      at: [x, y, 1.31],
      rotation: [0, 0, (i % 2 === 0 ? -1 : 1) * 18],
      flat: true,
      name: `decorative-brick-${i}`,
    });
  }

  return b.root;
}
```