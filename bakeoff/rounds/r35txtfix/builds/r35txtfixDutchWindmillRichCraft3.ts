import * as THREE from "three";
import {
  aim,
  catmull,

  createBuilder,
  grain,
  mottle,
  noise,
  paint,
  polyline,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a warm brick tower, flower-filled gallery, shingled cap, four decorated sails, lantern, tailpole, and whimsical weather vane.",
};

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

// -------------------------------------------------------------------------------------------------
// Palette and surface paints

const INK = "#2a1c29";
const BRICK_MORTAR = paint((_p, n) => (n.y > 0.1 ? "#efc28d" : "#aa725d"));
const BRICK_MAIN = paint((_p, n) => (n.y > 0.1 ? "#c9684c" : "#833d3b"));
const BRICK_ALT = paint((_p, n) => (n.y > 0.1 ? "#df7a51" : "#994a40"));

const STONE = mottle("#b8b4a0", "#777a73", { size: 0.18, contrast: 1.4, seed: 14 });
const STONE_LIGHT = paint((_p, n) => (n.y > 0.1 ? "#d9cfaa" : "#898071"));

const WOOD_DARK = paint((_p, n) => (n.y > 0.1 ? "#563329" : "#2e2026"));
const WOOD = grain("#7a472d", "#b8753e", { size: 0.075, axis: "y", seed: 8 });
const WOOD_LIGHT = grain("#9b5a31", "#d4944d", { size: 0.065, axis: "y", seed: 12 });
const WOOD_EDGE = paint((_p, n) => (n.y > 0.1 ? "#3d2729" : "#241c25"));

const ROOF = mottle("#315d5c", "#183b43", { size: 0.16, contrast: 1.25, seed: 22 });
const ROOF_TRIM = paint((_p, n) => (n.y > 0.1 ? "#5c8880" : "#294c52"));
const ROOF_DARK = paint((_p, n) => (n.y > 0.1 ? "#214448" : "#122a32"));

const CREAM = paint((_p, n) => (n.y > 0.1 ? "#f6dfae" : "#bd8665"));
const CANVAS = paint((_p, n) => (n.y > 0.1 ? "#f5e7bd" : "#c89d77"));
const RED = paint((_p, n) => (n.y > 0.1 ? "#e75b48" : "#9b303c"));
const GOLD = paint((_p, n) => (n.y > 0.1 ? "#f2c65b" : "#a86b3d"));
const LEAF = paint((_p, n) => (n.y > 0.1 ? "#76ad62" : "#3f704e"));
const FLOWER_PINK = paint((_p, n) => (n.y > 0.1 ? "#f18ca2" : "#aa4c68"));
const FLOWER_YELLOW = paint((_p, n) => (n.y > 0.1 ? "#f8cf58" : "#b17b3a"));
const FLOWER_BLUE = paint((_p, n) => (n.y > 0.1 ? "#70b9d0" : "#3c718a"));
const WINDOW_GLOW = "#ffe08a";

// A hand-painted brick field. Horizontal course lines are deliberately chunky so the tower reads
// as a friendly low-poly building rather than a smooth cone.
const BRICK_PAINT = paint((p, _n) => {
  const courseHeight = 0.245;
  const brickWidth = 0.47;
  const row = Math.floor((p.y + 0.01) / courseHeight);
  const yCoord = (p.y + 0.01) / courseHeight;
  const ySeam = Math.abs(yCoord - Math.round(yCoord));

  // On front and back faces use X for the brick run; on side faces use Z.
  const run = Math.abs(_n.z) >= Math.abs(_n.x) ? p.x : p.z;
  const stagger = row % 2 === 0 ? 0 : brickWidth * 0.5;
  const xCoord = (run + stagger) / brickWidth;
  const xSeam = Math.abs(xCoord - Math.round(xCoord));

  if (ySeam < 0.055 || xSeam < 0.055) return BRICK_MORTAR;
  return noise(p, 0.22, 31) > 0.63 ? BRICK_ALT : BRICK_MAIN;
});

const ROOF_PAINT = paint((p, n) => {
  const band = Math.floor((p.y - 4.02) / 0.11);
  const broad = noise(p, 0.18, 41);
  if (n.y > 0.45 && band % 2 === 0 && broad > 0.42) return ROOF_TRIM;
  return ROOF;
});

const SAIL_WOOD = grain("#75412d", "#b66f3c", { size: 0.08, axis: "y", seed: 51 });

// -------------------------------------------------------------------------------------------------
// SVG textures. The drawings are used sparingly over primitive geometry: windows, door, sign,
// flowers, sail canvas, and the rear tail ornament.

const WINDOW_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
    <circle cx="50" cy="60" r="43" fill="#ffd77e" stroke="#35242b" stroke-width="7"/>
    <path d="M50 17V103 M14 60H86" stroke="#805039" stroke-width="7"/>
    <path d="M20 31Q50 14 80 31 M20 89Q50 106 80 89" fill="none" stroke="#fff0ae" stroke-width="4" opacity=".7"/>
    <circle cx="36" cy="42" r="7" fill="#fff5c2" opacity=".9"/>
  </svg>`,
  { size: 192 },
);

const DOOR_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
    <path d="M13 130V48Q14 12 50 10Q86 12 87 48V130Z" fill="#67402f" stroke="#291d27" stroke-width="5"/>
    <path d="M27 130V49Q28 28 50 25Q72 28 73 49V130" fill="none" stroke="#a86a3d" stroke-width="5"/>
    <path d="M36 31V127 M50 25V127 M64 31V127" stroke="#3e2a2b" stroke-width="3" opacity=".8"/>
    <path d="M20 60H80 M16 91H84" stroke="#bf7c46" stroke-width="3" opacity=".65"/>
    <circle cx="68" cy="77" r="5.5" fill="#f2c65b" stroke="#3b2829" stroke-width="3"/>
    <path d="M68 77l7 2" stroke="#f7e2a0" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const SIGN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72">
    <rect x="4" y="5" width="232" height="62" rx="12" fill="#f0d29a" stroke="#3b292c" stroke-width="7"/>
    <path d="M21 17H219 M21 56H219" stroke="#bc7542" stroke-width="3" opacity=".75"/>
    <text x="120" y="45" text-anchor="middle" font-family="Georgia,serif" font-size="27" font-weight="bold" letter-spacing="3" fill="#52312d">DE MOLEN</text>
  </svg>`,
  { size: 384 },
);

const FLOWER_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 45">
    <g stroke="#4a8050" stroke-width="3" fill="none">
      <path d="M25 42Q28 20 25 7 M65 42Q67 22 72 10 M104 42Q101 20 108 5 M145 42Q142 19 149 9"/>
    </g>
    <g stroke="#4a8050" stroke-width="2">
      <path d="M27 28l-12-5 M28 32l13-7 M65 29l-13-7 M66 34l13-9 M103 27l-13-6 M102 34l14-7 M144 29l-13-7 M143 34l14-8"/>
    </g>
    <g stroke="#38242c" stroke-width="2">
      <circle cx="25" cy="7" r="10" fill="#f18ca2"/><circle cx="25" cy="7" r="3.5" fill="#f8cf58"/>
      <circle cx="72" cy="10" r="10" fill="#70b9d0"/><circle cx="72" cy="10" r="3.5" fill="#f8cf58"/>
      <circle cx="108" cy="5" r="10" fill="#f8cf58"/><circle cx="108" cy="5" r="3.5" fill="#e75b48"/>
      <circle cx="149" cy="9" r="10" fill="#f18ca2"/><circle cx="149" cy="9" r="3.5" fill="#70b9d0"/>
    </g>
  </svg>`,
  { size: 256 },
);

const SAIL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">
    <defs>
      <clipPath id="sailShape">
        <path d="M35 194L65 194L84 8L16 8Z"/>
      </clipPath>
    </defs>
    <g clip-path="url(#sailShape)">
      <rect x="0" y="0" width="100" height="200" fill="#f4dfae"/>
      <path d="M12 168L88 114L91 136L15 190Z" fill="#d75d48"/>
      <path d="M8 118L92 58L94 80L10 140Z" fill="#6b9c85"/>
      <path d="M18 32L84 0L86 20L16 52Z" fill="#fff2c5" opacity=".9"/>
      <path d="M18 190L84 190" stroke="#5a3730" stroke-width="7"/>
      <path d="M26 5L22 200 M74 5L78 200" stroke="#70402d" stroke-width="4"/>
      <circle cx="50" cy="102" r="8" fill="#f2c65b" stroke="#4b2c2b" stroke-width="3"/>
    </g>
  </svg>`,
  { size: 384 },
);

const TAIL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M48 92L54 55L27 24L48 31L53 7L60 31L82 22L62 55L58 92Z" fill="#efc45b" stroke="#4a2b2d" stroke-width="6" stroke-linejoin="round"/>
    <path d="M52 48L52 12" stroke="#fff0ad" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

// -------------------------------------------------------------------------------------------------
// Small construction helpers

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: THREE.Vector3 | [number, number, number],
  color: any,
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    rotation,
    flat: true,
    name,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: THREE.Vector3 | [number, number, number],
  color: any,
  name: string,
  sides = 10,
  dir?: THREE.Vector3 | [number, number, number],
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
    at,
    dir,
    flat: true,
    name,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: THREE.Vector3 | [number, number, number],
  color: any,
  name: string,
  segments = 8,
) {
  return b.part(new THREE.SphereGeometry(radius, segments, Math.max(4, Math.floor(segments * 0.7))), color, {
    at,
    flat: true,
    name,
  });
}

function rod(
  b: ReturnType<typeof createBuilder>,
  a: THREE.Vector3 | [number, number, number],
  c: THREE.Vector3 | [number, number, number],
  radius: number,
  color: any,
  name: string,
) {
  return b.rod(a, c, radius, { color, name, section: { ngon: 6 } });
}

function octagonalLoop(radius: number, y: number, phase = 0) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = phase + (i / 8) * TAU;
    points.push(new THREE.Vector3(Math.sin(a) * radius, y, Math.cos(a) * radius));
  }
  return polyline(points, { closed: true });
}

function roundLoop(radius: number, y: number, count = 12, phase = 0) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const a = phase + (i / count) * TAU;
    points.push(new THREE.Vector3(Math.sin(a) * radius, y, Math.cos(a) * radius));
  }
  return polyline(points, { closed: true });
}

function towerRadiusAt(y: number) {
  const t = Math.min(Math.max((y - 0.28) / 3.34, 0), 1);
  return 1.16 + (0.82 - 1.16) * t;
}

// -------------------------------------------------------------------------------------------------
// Main model

export default function build() {
  const b = createBuilder({
    name: "dutch-windmill",
    detail: 1,
    paintSize: 2048,
  });

  const randomFlower = rng(81);

  // -----------------------------------------------------------------------------------------------
  // Foundation and octagonal brick tower

  cylinder(b, 1.34, 0.20, [0, 0.10, 0], STONE, "foundationLower", 12);
  cylinder(b, 1.27, 0.16, [0, 0.27, 0], STONE_LIGHT, "foundationUpper", 12);
  cylinder(b, 1.19, 0.08, [0, 0.39, 0], STONE, "foundationCoping", 12);

  // Individual chunky foundation stones make the bottom feel hand-built.
  for (let i = 0; i < 8; i++) {
    const angle = i * 45;
    const a = angle * DEG;
    const radius = 1.17;
    box(
      b,
      [0.36, 0.17, 0.25],
      [Math.sin(a) * radius, 0.41, Math.cos(a) * radius],
      i % 2 === 0 ? STONE_LIGHT : STONE,
      `foundationStone${i}`,
      [0, angle, 0],
    );
  }

  const towerPath = catmull(
    [
      [0, 0.28, 0],
      [0, 1.25, 0],
      [0, 2.35, 0],
      [0, 3.20, 0],
      [0, 3.62, 0],
    ],
    { tension: 0.15 },
  );

  const tower = b.sweep(towerPath, (t) => 1.16 + (0.82 - 1.16) * t, {
    section: { ngon: 8 },
    caps: "flat",
    color: BRICK_PAINT,
    name: "octagonalBrickTower",
  });

  // Course seams ride the taper and visually divide the wall into large friendly brick rows.
  for (let i = 0; i < 8; i++) {
    const y = 0.48 + i * 0.40;
    const radius = towerRadiusAt(y) + 0.006;
    b.sweep(octagonalLoop(radius, y, Math.PI / 8), 0.018, {
      section: { ngon: 6 },
      color: BRICK_MORTAR,
      name: `mortarCourse${i}`,
    });
  }

  // A pale cap course separates the brick tower from the gallery.
  b.sweep(octagonalLoop(0.84, 3.57, Math.PI / 8), 0.025, {
    section: { ngon: 6 },
    color: CREAM,
    name: "upperLimeCourse",
  });

  // Tiny dark corner seams emphasize the eight-sided silhouette.
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i / 8) * TAU;
    const bottomR = towerRadiusAt(0.52) + 0.004;
    const topR = towerRadiusAt(3.44) + 0.004;
    rod(
      b,
      [Math.sin(a) * bottomR, 0.53, Math.cos(a) * bottomR],
      [Math.sin(a) * topR, 3.42, Math.cos(a) * topR],
      0.012,
      BRICK_MORTAR,
      `cornerMortar${i}`,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Front door and mill sign

  const doorOutline: ([number, number] | [number, number, "sharp"])[] = [
    [-0.39, 0],
    [0.39, 0],
    [0.39, 0.54],
    [0.31, 0.73],
    [0.17, 0.86],
    [0, 0.91],
    [-0.17, 0.86],
    [-0.31, 0.73],
    [-0.39, 0.54],
  ];

  b.extrude(doorOutline, {
    at: [0, 0.25, 1.12],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    bevel: 0.018,
    smoothing: 1,
    color: WOOD_DARK,
    name: "archedDoor",
  });

  box(b, [0.93, 0.10, 0.17], [0, 0.24, 1.13], STONE_LIGHT, "doorThreshold");

  const doorFace = b.part(new THREE.PlaneGeometry(0.82, 1.02), "#ffffff", {
    at: [0, 0.76, 1.155],
    dir: [0, 0, 1],
    axis: "z",
    texture: DOOR_TEX,
    name: "paintedDoorFace",
  });

  // A pair of chunky hinge straps gives the door a puppet-like, readable construction.
  rod(b, [-0.345, 0.48, 1.185], [-0.345, 1.05, 1.185], 0.014, GOLD, "doorHingeL");
  rod(b, [0.345, 0.48, 1.185], [0.345, 1.05, 1.185], 0.014, GOLD, "doorHingeR");
  sphere(b, 0.035, [0.235, 0.72, 1.205], GOLD, "doorHandle", 7);

  // Painted wooden plaque above the doorway.
  box(b, [0.98, 0.29, 0.075], [0, 1.53, 1.055], WOOD_DARK, "signBoard");
  const signFace = b.part(new THREE.PlaneGeometry(0.88, 0.245), "#ffffff", {
    at: [0, 1.53, 1.102],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN_TEX,
    name: "millNamePlaque",
  });

  // -----------------------------------------------------------------------------------------------
  // Windows mounted from the actual tower surface

  const towerSurface = b.surface(tower);

  function addWindow(
    center: [number, number, number],
    azimuth: number,
    width: number,
    height: number,
    name: string,
    mirror = false,
  ) {
    const hit = towerSurface.around(center).at(azimuth, 0);
    if (!hit) return;

    b.stick(
      new THREE.CylinderGeometry(width * 0.52, width * 0.52, 0.075, 12),
      WOOD_DARK,
      hit,
      {
        embed: 0.52,
        name: `${name}Frame`,
      },
    );

    const pane = b.decal(tower, WINDOW_TEX, {
      at: hit.at,
      dir: hit.axis,
      up: [0, 1, 0],
      size: [width * 0.92, height * 0.92],
      segments: 6,
      lift: 0.026,
      mirror,
      name: `${name}Pane`,
    });

    glow(pane, 0.75);
  }

  addWindow([0, 2.14, 0], 0, 0.47, 0.57, "frontLowerWindow");
  addWindow([0, 2.86, 0], 0, 0.39, 0.48, "frontUpperWindow");
  addWindow([0, 2.40, 0], 90, 0.39, 0.48, "leftGalleryWindow", true);
  addWindow([0, 2.40, 0], -90, 0.39, 0.48, "rightGalleryWindow", false);

  // -----------------------------------------------------------------------------------------------
  // Gallery platform, braces, railings, and flower trough

  cylinder(b, 0.96, 0.14, [0, 3.68, 0], WOOD_DARK, "galleryPlatform", 12);
  cylinder(b, 1.02, 0.055, [0, 3.765, 0], CREAM, "galleryPaleEdge", 12);

  const galleryRail = roundLoop(0.95, 4.02, 14, 0);
  b.sweep(galleryRail, 0.027, {
    section: { ngon: 6 },
    color: WOOD_DARK,
    name: "galleryTopRail",
  });

  b.sweep(roundLoop(0.94, 3.86, 14, 0.08), 0.018, {
    section: { ngon: 6 },
    color: WOOD_LIGHT,
    name: "galleryMiddleRail",
  });

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    const x = Math.sin(a) * 0.94;
    const z = Math.cos(a) * 0.94;
    rod(b, [x, 3.77, z], [x, 4.04, z], 0.026, WOOD_DARK, `galleryPost${i}`);
  }

  // Brass-colored rail fasteners are tiny but make the gallery sparkle.
  b.along(galleryRail, 12, (at) =>
    b.part(new THREE.SphereGeometry(0.034, 6, 4), GOLD, {
      at,
      flat: true,
      name: `galleryRivet`,
    }),
  );

  // Slanted gallery braces under the platform.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + Math.PI / 8;
    const innerR = 0.73;
    const outerR = 0.96;
    rod(
      b,
      [Math.sin(a) * innerR, 3.43, Math.cos(a) * innerR],
      [Math.sin(a) * outerR, 3.65, Math.cos(a) * outerR],
      0.027,
      WOOD_DARK,
      `galleryBrace${i}`,
    );
  }

  // The flower trough is part of the mill's gallery, not a separate scene prop.
  box(b, [0.94, 0.17, 0.23], [0, 3.84, 1.02], WOOD_LIGHT, "flowerTrough");
  box(b, [0.88, 0.055, 0.18], [0, 3.935, 1.03], WOOD_DARK, "flowerSoil");

  const flowerXs = [-0.37, -0.22, -0.07, 0.10, 0.25, 0.39];
  const flowerColors = [FLOWER_PINK, FLOWER_YELLOW, FLOWER_BLUE];
  for (let i = 0; i < flowerXs.length; i++) {
    const x = flowerXs[i];
    const z = 1.055 + (i % 2) * 0.018;
    rod(b, [x, 3.93, z], [x + (randomFlower() - 0.5) * 0.025, 4.075, z], 0.012, LEAF, `flowerStem${i}`);

    const flowerColor = flowerColors[Math.floor(randomFlower() * flowerColors.length)];
    sphere(b, 0.062, [x, 4.10, z], flowerColor, `flowerHead${i}`, 7);
    sphere(b, 0.022, [x, 4.10, z + 0.055], GOLD, `flowerCenter${i}`, 6);

    sphere(b, 0.043, [x - 0.045, 4.015, z], LEAF, `flowerLeafL${i}`, 6);
    sphere(b, 0.043, [x + 0.045, 4.035, z], LEAF, `flowerLeafR${i}`, 6);
  }

  const flowerFace = b.part(new THREE.PlaneGeometry(0.88, 0.23), "#ffffff", {
    at: [0, 4.035, 1.145],
    dir: [0, 0, 1],
    axis: "z",
    texture: FLOWER_TEX,
    name: "paintedFlowerFront",
  });

  // -----------------------------------------------------------------------------------------------
  // Cap body and faceted shingled roof

  b.lathe(
    [
      [0, 0],
      [0.79, 0],
      [0.84, 0.08],
      [0.84, 0.23],
      [0.72, 0.31],
      [0, 0.34],
    ],
    {
      at: [0, 3.75, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: ROOF_TRIM,
      name: "capHousing",
    },
  );

  b.lathe(
    [
      [0, 0],
      [0.80, 0],
      [0.79, 0.075],
      [0.70, 0.17],
      [0.60, 0.30],
      [0.45, 0.43],
      [0.25, 0.54],
      [0, 0.61],
    ],
    {
      at: [0, 4.04, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: ROOF_PAINT,
      name: "facetedShingleRoof",
    },
  );

  // Shingle rings and ribs make the roof read in silhouette even at thumbnail scale.
  const roofBands = [
    [0.80, 4.10],
    [0.70, 4.26],
    [0.54, 4.43],
  ] as const;

  for (let i = 0; i < roofBands.length; i++) {
    const [radius, y] = roofBands[i];
    b.sweep(octagonalLoop(radius, y, Math.PI / 8), 0.018, {
      section: { ngon: 6 },
      color: ROOF_DARK,
      name: `roofShingleBand${i}`,
    });
  }

  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + (i / 8) * TAU;
    rod(
      b,
      [Math.sin(a) * 0.73, 4.10, Math.cos(a) * 0.73],
      [Math.sin(a) * 0.16, 4.57, Math.cos(a) * 0.16],
      0.019,
      ROOF_DARK,
      `roofRib${i}`,
    );
  }

  sphere(b, 0.11, [0, 4.64, 0], GOLD, "roofFinial", 8);

  // A tiny cheerful weather vane, kept below the top sail.
  rod(b, [0, 4.58, 0], [0, 5.00, 0], 0.019, GOLD, "weatherVanePole");
  rod(b, [-0.27, 4.91, 0], [0.22, 4.91, 0], 0.015, GOLD, "weatherVaneArrow");
  b.spike([0.22, 4.91, 0], [1, 0, 0], 0.11, 0.031, {
    color: GOLD,
    name: "weatherVaneArrowhead",
  });
  b.extrude(
    [
      [-0.16, 0],
      [0.08, 0],
      [0.22, 0.10],
      [0.08, 0.18],
      [-0.16, 0.18],
    ],
    {
      at: [-0.02, 4.78, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.034,
      bevel: 0.008,
      color: RED,
      name: "weatherVanePennant",
    },
  );

  // -----------------------------------------------------------------------------------------------
  // Front axle, hub, and four decorated sails

  const sailOrigin = new THREE.Vector3(0, 4.18, 1.26);

  function sailAxes(angle: number) {
    const a = angle * DEG;
    return {
      along: new THREE.Vector3(Math.sin(a), Math.cos(a), 0),
      across: new THREE.Vector3(Math.cos(a), -Math.sin(a), 0),
    };
  }

  function sailPoint(angle: number, across: number, along: number, z: number) {
    const axes = sailAxes(angle);
    return sailOrigin
      .clone()
      .addScaledVector(axes.across, across)
      .addScaledVector(axes.along, along)
      .setZ(z);
  }

  rod(
    b,
    [0, 4.18, 0.55],
    [0, 4.18, 1.23],
    0.12,
    WOOD_DARK,
    "rearAxle",
  );

  cylinder(b, 0.25, 0.30, [0, 4.18, 1.28], WOOD_DARK, "sailHub", 10, [0, 0, 1]);
  cylinder(b, 0.34, 0.065, [0, 4.18, 1.46], GOLD, "hubFrontRing", 12, [0, 0, 1]);
  sphere(b, 0.105, [0, 4.18, 1.51], WOOD_LIGHT, "hubCap", 8);

  const bladeOutline: [number, number, "sharp"?][] = [
    [-0.15, 0.02],
    [0.15, 0.02],
    [0.23, 1.60],
    [0.28, 2.04, "sharp"],
    [-0.28, 2.04, "sharp"],
    [-0.23, 1.60],
  ];

  const sailAngles = [25, 115, 205, 295];

  for (let i = 0; i < sailAngles.length; i++) {
    const angle = sailAngles[i];
    const axes = sailAxes(angle);

    b.extrude(bladeOutline, {
      at: sailOrigin,
      x: axes.across,
      y: axes.along,
      thickness: 0.095,
      bevel: 0.018,
      smoothing: 1,
      color: SAIL_WOOD,
      name: `woodenSail${i}`,
    });

    // The canvas drawing is a transparent tapered card in the exact sail plane.
    const sailCanvas = b.part(new THREE.PlaneGeometry(0.56, 1.92), "#ffffff", {
      at: sailPoint(angle, 0, 1.02, 1.345),
      quat: aim(axes.along, [0, 0, 1], "y"),
      texture: SAIL_TEX,
      name: `paintedCanvasSail${i}`,
    });

    // Dark rails and a center spar sit just in front of the canvas.
    rod(
      b,
      sailPoint(angle, -0.17, 0.08, 1.38),
      sailPoint(angle, -0.27, 2.01, 1.38),
      0.022,
      WOOD_EDGE,
      `sail${i}LeftRail`,
    );
    rod(
      b,
      sailPoint(angle, 0.17, 0.08, 1.38),
      sailPoint(angle, 0.27, 2.01, 1.38),
      0.022,
      WOOD_EDGE,
      `sail${i}RightRail`,
    );
    rod(
      b,
      sailPoint(angle, 0, 0.08, 1.39),
      sailPoint(angle, 0, 2.01, 1.39),
      0.025,
      WOOD_DARK,
      `sail${i}CenterSpar`,
    );

    rod(
      b,
      sailPoint(angle, -0.19, 0.83, 1.395),
      sailPoint(angle, 0.19, 0.83, 1.395),
      0.018,
      WOOD_EDGE,
      `sail${i}CrossBraceA`,
    );
    rod(
      b,
      sailPoint(angle, -0.22, 1.42, 1.395),
      sailPoint(angle, 0.22, 1.42, 1.395),
      0.018,
      WOOD_EDGE,
      `sail${i}CrossBraceB`,
    );

    sphere(b, 0.052, sailPoint(angle, 0, 2.02, 1.405), GOLD, `sail${i}TipBolt`, 7);
    sphere(b, 0.034, sailPoint(angle, 0, 0.12, 1.42), GOLD, `sail${i}RootBolt`, 7);
  }

  // Hub bolts repeat the gold motif from the sign and railing.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    sphere(
      b,
      0.026,
      [Math.sin(a) * 0.23, 4.18 + Math.cos(a) * 0.23, 1.52],
      GOLD,
      `hubBolt${i}`,
      6,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Rear tailpole and decorative tail vane

  rod(
    b,
    [0, 4.04, -0.56],
    [0, 3.86, -2.05],
    0.072,
    WOOD_DARK,
    "rearTailpole",
  );
  rod(
    b,
    [-0.18, 3.99, -0.73],
    [-0.18, 3.85, -1.83],
    0.026,
    WOOD_LIGHT,
    "tailpoleHighlightL",
  );
  rod(
    b,
    [0.18, 3.99, -0.73],
    [0.18, 3.85, -1.83],
    0.026,
    WOOD_LIGHT,
    "tailpoleHighlightR",
  );

  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.28, 0.30],
      [0.17, 0.55],
      [0, 0.69, "sharp"],
      [-0.17, 0.55],
      [-0.28, 0.30],
    ],
    {
      at: [0, 3.69, -2.05],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 1,
      color: WOOD_LIGHT,
      name: "rearTailVane",
    },
  );

  const tailBadge = b.part(new THREE.PlaneGeometry(0.54, 0.59), "#ffffff", {
    at: [0, 3.99, -2.095],
    dir: [0, 0, -1],
    axis: "z",
    texture: TAIL_TEX,
    name: "tailVaneBadge",
  });

  // -----------------------------------------------------------------------------------------------
  // Warm gallery lantern and small metal fittings

  rod(b, [0.72, 3.40, 0.78], [0.72, 3.40, 1.00], 0.022, GOLD, "lanternBracket");
  cylinder(b, 0.15, 0.035, [0.72, 3.53, 1.00], WOOD_DARK, "lanternTop", 8);
  cylinder(b, 0.15, 0.035, [0.72, 3.28, 1.00], WOOD_DARK, "lanternBottom", 8);

  const lanternGlass = sphere(b, 0.095, [0.72, 3.405, 1.00], WINDOW_GLOW, "lanternGlow", 8);
  glow(lanternGlass, 1.8);

  for (const x of [-0.07, 0.07]) {
    rod(
      b,
      [0.72 + x, 3.30, 1.00],
      [0.72 + x, 3.51, 1.00],
      0.012,
      WOOD_DARK,
      `lanternCageX${x}`,
    );
  }
  for (const z of [0.94, 1.06]) {
    rod(
      b,
      [0.65, 3.405, z],
      [0.79, 3.405, z],
      0.012,
      WOOD_DARK,
      `lanternCageZ${z}`,
    );
  }

  // A few pale rivets on the lower tower give the masonry a handmade toy-town finish.
  const rivetPositions = [
    [-0.82, 0.62, 0.83],
    [0.82, 0.62, 0.83],
    [-0.90, 1.12, 0.67],
    [0.90, 1.12, 0.67],
    [-0.75, 1.58, 0.76],
    [0.75, 1.58, 0.76],
  ] as const;

  rivetPositions.forEach(([x, y, z], i) => {
    sphere(b, 0.028, [x, y, z], CREAM, `wallRivet${i}`, 6);
  });

  // -----------------------------------------------------------------------------------------------
  // Low-poly flour sacks and a small miller's tool rack attached to the building

  // These are attached to the mill wall under the gallery and remain subordinate to the building.
  box(b, [0.28, 0.25, 0.20], [-0.75, 0.53, 0.96], CANVAS, "flourSackL");
  box(b, [0.23, 0.22, 0.18], [-0.48, 0.50, 1.00], CREAM, "flourSackM");
  box(b, [0.19, 0.18, 0.17], [-0.27, 0.47, 1.02], CANVAS, "flourSackS");

  rod(b, [-0.83, 0.55, 1.08], [-0.83, 0.98, 1.08], 0.018, WOOD_DARK, "toolRackPostL");
  rod(b, [-0.36, 0.55, 1.08], [-0.36, 0.98, 1.08], 0.018, WOOD_DARK, "toolRackPostR");
  rod(b, [-0.83, 0.91, 1.08], [-0.36, 0.91, 1.08], 0.022, WOOD_DARK, "toolRackBeam");

  // Three simple hanging tools, kept in a neat readable row.
  rod(b, [-0.72, 0.91, 1.10], [-0.72, 0.62, 1.10], 0.012, GOLD, "toolHandleA");
  rod(b, [-0.59, 0.91, 1.10], [-0.59, 0.67, 1.10], 0.012, GOLD, "toolHandleB");
  rod(b, [-0.46, 0.91, 1.10], [-0.46, 0.64, 1.10], 0.012, GOLD, "toolHandleC");

  b.extrude(
    [
      [-0.075, 0],
      [0.075, 0],
      [0.10, 0.11],
      [0.03, 0.18],
      [-0.03, 0.18],
      [-0.10, 0.11],
    ],
    {
      at: [-0.72, 0.53, 1.10],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: WOOD_DARK,
      name: "toolBladeA",
    },
  );

  b.extrude(
    [
      [-0.09, 0],
      [0.09, 0],
      [0.07, 0.13],
      [-0.07, 0.13],
    ],
    {
      at: [-0.59, 0.58, 1.10],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: WOOD_DARK,
      name: "toolBladeB",
    },
  );

  b.extrude(
    [
      [-0.12, 0],
      [0.12, 0],
      [0.08, 0.13],
      [-0.08, 0.13],
    ],
    {
      at: [-0.46, 0.55, 1.10],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: WOOD_DARK,
      name: "toolBladeC",
    },
  );

  // -----------------------------------------------------------------------------------------------
  // A handful of final color accents: ceramic buttons around the gallery and roof

  const accentDots = [
    [-0.66, 3.79, 0.70],
    [0.66, 3.79, 0.70],
    [-0.72, 4.03, 0.63],
    [0.72, 4.03, 0.63],
    [-0.56, 3.79, -0.77],
    [0.56, 3.79, -0.77],
  ] as const;

  accentDots.forEach(([x, y, z], i) => {
    sphere(b, 0.037, [x, y, z], i % 2 === 0 ? RED : GOLD, `galleryAccent${i}`, 7);
  });

  // The builder root is the complete static architectural model.
  return b.root;
}
