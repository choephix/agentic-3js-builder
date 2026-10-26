```ts
import * as THREE from "three";
import {
  arc,
  cells,
  createBuilder,
  grain,
  mottle,
  paint,
  polyline,
  rng,
  stripes,
} from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered brick tower, gallery railing, shingled roof, flower boxes, weather vane, and four chunky canvas sails.",
};

const INK = "#2c1c2d";
const STONE = "#d3bd98";
const STONE_SHADOW = "#9a806f";
const MORTAR = "#a78d78";
const BRICK_WARM = "#ba8061";
const BRICK_DARK = "#8e5e52";
const WOOD = "#704236";
const WOOD_LIGHT = "#a56b4c";
const WOOD_DARK = "#452c2d";
const ROOF = "#765052";
const ROOF_HIGHLIGHT = "#a96b5d";
const ROOF_SHADOW = "#4b3540";
const SAIL_CREAM = "#fff0c5";
const SAIL_RED = "#c95b4d";
const SAIL_SHADOW = "#b48477";
const WINDOW_BLUE = "#29495a";
const WINDOW_GLOW = "#f4c766";
const GOLD = "#edb84e";
const LEAF = "#4f8561";
const FLOWER_PINK = "#e77c93";
const FLOWER_YELLOW = "#f4c95c";
const FLOWER_BLUE = "#6a9acb";

const brickTexture = mottle(STONE, BRICK_WARM, {
  size: 0.16,
  contrast: 1.4,
  seed: 17,
});

const brickPaint = paint((p, n, _s) => {
  const row = Math.floor((p.y + 0.02) / 0.105);
  const stagger = (row & 1) === 0 ? 0 : 0.075;
  const localX = p.x + stagger + p.z * 0.035;
  const localZ = p.z + p.x * 0.025;
  const verticalCell = Math.abs(localX / 0.18 - Math.round(localX / 0.18));
  const depthCell = Math.abs(localZ / 0.32 - Math.round(localZ / 0.32));
  const horizontalCell = Math.abs((p.y + 0.01) / 0.105 - Math.round((p.y + 0.01) / 0.105));

  if (horizontalCell < 0.035 || (verticalCell < 0.035 && depthCell > 0.12)) {
    return MORTAR;
  }

  const mottled = brickTexture.at(p, n);
  if (n.y < -0.35) return BRICK_DARK;
  return n.y > 0.45 ? mottled : brickPaintBase(mottled);
});

function brickPaintBase(color: readonly [number, number, number]) {
  const lift = 0.94;
  return `#${color
    .map((v) =>
      Math.round(Math.min(1, v * lift) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

const TOWER_PAINT = cel(brickPaint, STONE_SHADOW);
const ROOF_PAINT = cel(
  stripes(ROOF, [ROOF_HIGHLIGHT, ROOF], {
    size: 0.14,
    axis: [0, 1, 0],
    width: 0.24,
    wobble: 0.22,
    seed: 8,
  }),
  ROOF_SHADOW,
);
const WOOD_PAINT = cel(
  grain(WOOD, WOOD_LIGHT, {
    size: 0.055,
    axis: [0, 1, 0],
    seed: 12,
  }),
  WOOD_DARK,
);
const SAIL_PAINT = cel(
  stripes(SAIL_CREAM, [SAIL_RED, SAIL_CREAM], {
    size: 0.2,
    axis: [0, 1, 0],
    width: 0.18,
    wobble: 0.05,
    seed: 5,
  }),
  SAIL_SHADOW,
);

const DOOR_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240">
    <defs>
      <linearGradient id="door" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9b654c"/>
        <stop offset="1" stop-color="#4b3031"/>
      </linearGradient>
    </defs>
    <path d="M18 238V78 Q80 9 142 78V238Z" fill="url(#door)" stroke="#34242a" stroke-width="9"/>
    <path d="M30 238V83 Q80 28 130 83V238" fill="none" stroke="#c18458" stroke-width="5"/>
    <path d="M80 52V238 M28 150H132 M34 102H126" stroke="#4a2d30" stroke-width="5"/>
    <path d="M62 171h30v49H62z" fill="#4f8190" stroke="#2d2831" stroke-width="5"/>
    <path d="M68 177h18v37H68z" fill="#edc967"/>
    <circle cx="112" cy="164" r="8" fill="#efbd50" stroke="#3d2930" stroke-width="4"/>
    <path d="M72 224h16" stroke="#f1c15b" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const WINDOW_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 170">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#80b8ba"/>
        <stop offset="1" stop-color="#31586d"/>
      </linearGradient>
    </defs>
    <path d="M9 168V54 Q60 2 111 54V168Z" fill="#3e2b30" stroke="#241b28" stroke-width="8"/>
    <path d="M20 164V57 Q60 19 100 57V164Z" fill="url(#glass)" stroke="#b47656" stroke-width="6"/>
    <path d="M60 22V164 M21 97H99" stroke="#452f35" stroke-width="6"/>
    <path d="M33 54L48 30 M79 30L91 53" stroke="#c7e5d0" stroke-width="5" opacity=".65"/>
    <path d="M27 141h66" stroke="#efc66e" stroke-width="4" opacity=".6"/>
  </svg>`,
  { size: 256 },
);

const SHINGLE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <path d="M3 3h58v90H3z" fill="#79504a"/>
    <path d="M4 17H60 M4 33H60 M4 49H60 M4 65H60 M4 81H60" stroke="#bd7b65" stroke-width="5"/>
    <path d="M4 18H60 M4 50H60 M4 82H60" stroke="#4c3540" stroke-width="3"/>
    <path d="M15 4v13 M32 4v13 M49 4v13 M8 34v15 M25 34v15 M42 34v15 M56 34v15 M15 66v15 M32 66v15 M49 66v15"
      stroke="#d39170" stroke-width="2"/>
  </svg>`,
  { size: 128, pixelated: true },
);

const BADGE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <circle cx="90" cy="90" r="82" fill="#f4d383" stroke="#432c32" stroke-width="10"/>
    <circle cx="90" cy="90" r="67" fill="#5d8e8b" stroke="#fff0c5" stroke-width="6"/>
    <circle cx="90" cy="90" r="13" fill="#d65e4d" stroke="#432c32" stroke-width="5"/>
    <path d="M84 82L42 36L55 30L96 79Z" fill="#fff0c5" stroke="#432c32" stroke-width="5"/>
    <path d="M98 84L144 43L149 58L105 98Z" fill="#fff0c5" stroke="#432c32" stroke-width="5"/>
    <path d="M96 98L139 144L123 148L86 106Z" fill="#fff0c5" stroke="#432c32" stroke-width="5"/>
    <path d="M83 99L39 140L32 125L75 89Z" fill="#fff0c5" stroke="#432c32" stroke-width="5"/>
    <path d="M54 145 Q90 158 126 145" fill="none" stroke="#432c32" stroke-width="6"/>
  </svg>`,
  { size: 256 },
);

const VANE_FLAG_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
    <path d="M7 9h137l-32 31 32 31H7z" fill="#d85f50" stroke="#3a2730" stroke-width="7"/>
    <path d="M26 20h84l-20 20 20 20H26z" fill="#f1c463"/>
    <circle cx="45" cy="40" r="10" fill="#5f8f83"/>
  </svg>`,
  { size: 192 },
);

const PLAQUE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 90">
    <rect x="5" y="5" width="210" height="80" rx="18" fill="#f5d58d" stroke="#432c32" stroke-width="9"/>
    <path d="M38 67V42l22-20 22 20v25 M60 32V15 M47 26l13-13 13 13" fill="none" stroke="#5d8e83" stroke-width="8"/>
    <path d="M105 28h82 M105 45h82 M105 62h58" stroke="#704236" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

function addBox(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: THREE.Vector3 | [number, number, number],
  color: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    flat: true,
    name,
  });
}

function addCylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: THREE.Vector3 | [number, number, number],
  color: any,
  segments = 10,
  name?: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    flat: true,
    name,
  });
}

function addSphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: THREE.Vector3 | [number, number, number],
  color: any,
  widthSegments = 8,
  heightSegments = 5,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, widthSegments, heightSegments), color, {
    at,
    flat: true,
    name,
  });
}

function radialPoint(radius: number, angleDeg: number, y: number) {
  const a = THREE.MathUtils.degToRad(angleDeg);
  return new THREE.Vector3(Math.sin(a) * radius, y, Math.cos(a) * radius);
}

function makeRingPoints(radius: number, y: number, count: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) points.push(radialPoint(radius, (i * 360) / count, y));
  return points;
}

function makeFlower(
  b: ReturnType<typeof createBuilder>,
  x: number,
  y: number,
  z: number,
  color: string,
  tilt = 0,
) {
  const stemBottom = new THREE.Vector3(x, y - 0.035, z);
  const stemTop = new THREE.Vector3(x + tilt * 0.018, y + 0.065, z);
  b.rod(stemBottom, stemTop, 0.006, { color: LEAF, section: { ngon: 5 }, name: "flowerStem" });
  addSphere(b, 0.027, stemTop, color, 7, 5, "flowerHead");
  addSphere(
    b,
    0.011,
    stemTop.clone().add(new THREE.Vector3(0, 0.006, 0.015)),
    FLOWER_YELLOW,
    6,
    4,
    "flowerCenter",
  );
}

function makeFlowerBox(
  b: ReturnType<typeof createBuilder>,
  x: number,
  y: number,
  z: number,
  flowerColors: string[],
) {
  addBox(b, [0.24, 0.075, 0.095], [x, y, z], WOOD_PAINT, "flowerBox");
  addBox(b, [0.25, 0.015, 0.105], [x, y + 0.041, z], WOOD_DARK, "flowerBoxRim");
  for (let i = 0; i < flowerColors.length; i++) {
    const px = x - 0.082 + i * 0.041;
    makeFlower(b, px, y + 0.045, z + 0.005, flowerColors[i], i % 2 === 0 ? -1 : 1);
  }
}

function makeSail(
  b: ReturnType<typeof createBuilder>,
  hub: THREE.Vector3,
  angleDeg: number,
  index: number,
) {
  const a = THREE.MathUtils.degToRad(angleDeg);
  const radial = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
  const across = new THREE.Vector3(Math.cos(a), -Math.sin(a), 0);
  const length = 0.66;
  const rootWidth = 0.105;
  const tipWidth = 0.044;

  const outline: [number, number, "sharp"][] = [
    [-rootWidth, 0, "sharp"],
    [rootWidth, 0, "sharp"],
    [tipWidth, length, "sharp"],
    [-tipWidth, length, "sharp"],
  ];

  b.extrude(outline, {
    at: hub,
    x: across,
    y: radial,
    thickness: 0.026,
    bevel: 0.004,
    color: SAIL_PAINT,
    name: `sailCloth${index}`,
  });

  const root = hub.clone().addScaledVector(radial, 0.01);
  const tip = hub.clone().addScaledVector(radial, length);

  const leftRoot = root.clone().addScaledVector(across, -rootWidth);
  const leftTip = tip.clone().addScaledVector(across, -tipWidth);
  const rightRoot = root.clone().addScaledVector(across, rootWidth);
  const rightTip = tip.clone().addScaledVector(across, tipWidth);

  b.rod(leftRoot, leftTip, 0.012, {
    color: WOOD_PAINT,
    section: { ngon: 6 },
    name: `sailRailLeft${index}`,
  });
  b.rod(rightRoot, rightTip, 0.012, {
    color: WOOD_PAINT,
    section: { ngon: 6 },
    name: `sailRailRight${index}`,
  });
  b.rod(root, tip, 0.014, {
    color: WOOD_DARK,
    section: { ngon: 6 },
    name: `sailSpine${index}`,
  });

  for (const t of [0.25, 0.48, 0.7, 0.88]) {
    const center = hub.clone().addScaledVector(radial, length * t);
    const width = rootWidth + (tipWidth - rootWidth) * t;
    const left = center.clone().addScaledVector(across, -width);
    const right = center.clone().addScaledVector(across, width);
    b.rod(left, right, 0.0075, {
      color: WOOD_LIGHT,
      section: { ngon: 5 },
      name: `sailCrossbar${index}`,
    });
  }

  const tipCap = tip.clone();
  b.rod(
    tipCap.clone().addScaledVector(across, -tipWidth),
    tipCap.clone().addScaledVector(across, tipWidth),
    0.009,
    {
      color: WOOD_DARK,
      section: { ngon: 6 },
      name: `sailTip${index}`,
    },
  );
}

export default function build() {
  const b = createBuilder({
    name: "dutch-windmill",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------
  // Foundation and tapered brick tower.

  addCylinder(b, 0.49, 0.16, [0, 0.08, 0], cel(STONE, STONE_SHADOW), 12, "foundation");
  addCylinder(b, 0.455, 0.07, [0, 0.195, 0], WOOD_DARK, 12, "foundationTrim");

  const tower = b.part(
    new THREE.ConeGeometry(0.455, 1.29, 12, 1, false),
    TOWER_PAINT,
    {
      at: [0, 0.82, 0],
      flat: true,
      name: "brickTower",
    },
  );

  addCylinder(b, 0.455, 0.055, [0, 0.305, 0], BRICK_DARK, 12, "lowerStoneBand");
  addCylinder(b, 0.435, 0.034, [0, 0.335, 0], STONE, 12, "lowerStoneBandLight");
  addCylinder(b, 0.35, 0.04, [0, 1.12, 0], BRICK_DARK, 12, "upperStoneBand");

  // Chunky little foundation stones soften the silhouette in the cute style.
  const foundationStones = [
    [-0.34, 0.205, 0.26],
    [0.34, 0.205, 0.26],
    [-0.36, 0.205, -0.22],
    [0.36, 0.205, -0.22],
    [-0.18, 0.205, 0.39],
    [0.18, 0.205, 0.39],
  ] as const;

  foundationStones.forEach(([x, y, z], i) => {
    addBox(
      b,
      [0.13, 0.12, 0.12],
      [x, y, z],
      i % 2 === 0 ? STONE_SHADOW : STONE,
      `foundationBlock${i}`,
    );
  });

  // ---------------------------------------------------------------------------
  // Gallery and balcony.

  addCylinder(b, 0.425, 0.075, [0, 1.455, 0], WOOD_PAINT, 12, "galleryFloor");
  addCylinder(b, 0.445, 0.028, [0, 1.502, 0], WOOD_DARK, 12, "galleryLip");

  const railingPosts = 12;
  for (let i = 0; i < railingPosts; i++) {
    const angle = (i * 360) / railingPosts;
    const p = radialPoint(0.39, angle, 1.59);
    const bottom = radialPoint(0.39, angle, 1.48);
    b.rod(bottom, p, 0.012, {
      color: WOOD_PAINT,
      section: { ngon: 6 },
      name: `galleryPost${i}`,
    });
  }

  b.sweep(polyline(makeRingPoints(0.4, 1.58, 16), { closed: true }), 0.015, {
    color: WOOD_DARK,
    section: { ngon: 6 },
    caps: "none",
    name: "galleryLowerRail",
  });

  b.sweep(polyline(makeRingPoints(0.4, 1.68, 16), { closed: true }), 0.016, {
    color: WOOD_PAINT,
    section: { ngon: 6 },
    caps: "none",
    name: "galleryUpperRail",
  });

  // Small angled braces under the gallery.
  for (const side of [-1, 1]) {
    for (const z of [-0.2, 0.2]) {
      const upper = new THREE.Vector3(side * 0.32, 1.44, z);
      const lower = new THREE.Vector3(side * 0.405, 1.28, z);
      b.rod(upper, lower, 0.018, {
        color: WOOD_DARK,
        section: { ngon: 6 },
        name: "galleryBrace",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Door, windows, flower boxes, and front plaque.

  const towerSurface = b.surface(tower);
  const doorHit = towerSurface.around([0, 0.44, 0]).at(0, 0);

  b.decal(tower, DOOR_TEXTURE, {
    at: doorHit.at,
    dir: doorHit.n,
    up: [0, 1, 0],
    size: [0.245, 0.37],
    segments: 8,
    lift: 0.004,
    name: "archedDoor",
  });

  const doorArch = arc(
    [0, 0.57, 0.425],
    [-0.118, 0.57, 0.425],
    [0, 0, 1],
    180,
  );
  b.sweep(doorArch, 0.012, {
    color: WOOD_LIGHT,
    section: { ngon: 6 },
    name: "doorArchTrim",
  });

  addSphere(b, 0.017, [0.105, 0.43, 0.433], GOLD, 7, 5, "doorHandle");

  const windowHits = [
    towerSurface.nearest([-0.125, 0.92, 0.33]),
    towerSurface.nearest([0.125, 0.92, 0.33]),
  ];

  windowHits.forEach((hit, i) => {
    b.decal(tower, WINDOW_TEXTURE, {
      at: hit.at,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.12, 0.18],
      segments: 7,
      lift: 0.004,
      mirror: i === 0,
      name: `archedWindow${i}`,
    });
  });

  makeFlowerBox(b, -0.125, 0.735, 0.382, [FLOWER_PINK, FLOWER_YELLOW, FLOWER_BLUE]);
  makeFlowerBox(b, 0.125, 0.735, 0.382, [FLOWER_BLUE, FLOWER_PINK, FLOWER_YELLOW]);

  const plaqueHit = towerSurface.around([0, 1.18, 0]).at(0, 0);
  b.decal(tower, PLAQUE_TEXTURE, {
    at: plaqueHit.at,
    dir: plaqueHit.n,
    up: [0, 1, 0],
    size: [0.24, 0.1],
    segments: 8,
    lift: 0.005,
    name: "millPlaque",
  });

  // Decorative side bricks and small round vents.
  for (const side of [-1, 1]) {
    const ventHit = towerSurface.around([side * 0.1, 1.22, 0]).at(side * 68, 6);
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), WOOD_DARK, ventHit, {
      embed: 0.25,
      name: "roundVent",
    });
  }

  // ---------------------------------------------------------------------------
  // Roof and hand-placed shingle cards.

  addCylinder(b, 0.405, 0.052, [0, 1.51, 0], ROOF_SHADOW, 12, "roofEave");
  addCylinder(b, 0.38, 0.026, [0, 1.535, 0], ROOF_HIGHLIGHT, 12, "roofEaveHighlight");

  const roof = b.part(
    new THREE.ConeGeometry(0.395, 0.39, 12, 1, false),
    ROOF_PAINT,
    {
      at: [0, 1.725, 0],
      flat: true,
      name: "thatchRoof",
    },
  );

  const roofSurface = b.surface(roof);
  const roofShingleHits = roofSurface.scatter(26, {
    rng: rng(2024),
    minDist: 0.055,
    filter: (h) => h.n.y > 0.08,
  });

  b.cards(roofShingleHits, SHINGLE_TEXTURE, {
    size: [0.075, 0.12],
    lean: 48,
    bend: 8,
    vary: 0.18,
    sink: 0.18,
    flow: [0, 0, 1],
    color: ROOF_HIGHLIGHT,
    rng: rng(2025),
    name: "roofShingleCards",
  });

  const roofApex = new THREE.Vector3(0, 1.92, 0);
  addSphere(b, 0.045, roofApex, GOLD, 8, 5, "roofCap");

  for (let i = 0; i < 8; i++) {
    const angle = (i * 360) / 8;
    const base = radialPoint(0.38, angle, 1.56);
    const end = radialPoint(0.06, angle, 1.87);
    b.rod(base, end, 0.0065, {
      color: ROOF_SHADOW,
      section: { ngon: 5 },
      name: "roofRib",
    });
  }

  // ---------------------------------------------------------------------------
  // Rear tail beam and a small fan-like tail assembly.

  const tailRoot = new THREE.Vector3(0, 1.59, -0.04);
  const tailEnd = new THREE.Vector3(0, 1.62, -0.62);
  b.rod(tailRoot, tailEnd, 0.028, {
    color: WOOD_PAINT,
    section: { ngon: 6 },
    name: "rearTailBeam",
  });

  const tailCrossA = new THREE.Vector3(-0.18, 1.73, -0.54);
  const tailCrossB = new THREE.Vector3(0.18, 1.73, -0.54);
  b.rod(tailCrossA, tailCrossB, 0.018, {
    color: WOOD_DARK,
    section: { ngon: 6 },
    name: "rearTailCrossbar",
  });

  for (const side of [-1, 1]) {
    const tailFin = [
      [-0.025, 0, "sharp"],
      [0.025, 0, "sharp"],
      [0.14, 0.2, "sharp"],
      [0.06, 0.24, "sharp"],
    ] as [number, number, "sharp"][];

    b.extrude(tailFin, {
      at: new THREE.Vector3(side * 0.015, 1.7, -0.55),
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      color: SAIL_PAINT,
      name: `rearTailFin${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Four large front sails.

  const hub = new THREE.Vector3(0, 1.23, 0.49);
  const sailAngles = [35, 125, 215, 305];
  sailAngles.forEach((angle, i) => makeSail(b, hub, angle, i));

  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.14, 10), WOOD_DARK, {
    at: hub,
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "sailAxle",
  });

  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.045, 10), GOLD, {
    at: [0, 1.23, 0.578],
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "goldenHub",
  });

  addSphere(b, 0.057, [0, 1.23, 0.615], SAIL_RED, 8, 5, "hubCap");

  // Four tiny brass bolts around the hub.
  for (let i = 0; i < 4; i++) {
    const a = THREE.MathUtils.degToRad(45 + i * 90);
    addSphere(
      b,
      0.011,
      [Math.cos(a) * 0.062, 1.23 + Math.sin(a) * 0.062, 0.65],
      GOLD,
      6,
      4,
      "hubBolt",
    );
  }

  // ---------------------------------------------------------------------------
  // Weather vane, with a cheerful red-and-gold flag.

  b.rod([0, 1.92, 0], [0, 2.045, 0], 0.008, {
    color: GOLD,
    section: { ngon: 6 },
    name: "weatherVanePole",
  });

  b.rod([-0.105, 2.01, 0], [0.12, 2.01, 0], 0.007, {
    color: GOLD,
    section: { ngon: 5 },
    name: "weatherVaneArrow",
  });

  b.part(new THREE.PlaneGeometry(0.13, 0.065), "#ffffff", {
    at: [0.055, 2.005, 0.004],
    dir: [0, 0, 1],
    axis: "z",
    texture: VANE_FLAG_TEXTURE,
    name: "weatherVaneFlag",
  });

  addSphere(b, 0.018, [0, 2.045, 0], GOLD, 7, 5, "weatherVaneFinial");

  // A small circular badge centered below the roof, partly behind the sail hub.
  const badgeBacking = addCylinder(b, 0.11, 0.025, [0, 1.17, 0.42], WOOD_DARK, 12, "badgeBacking");
  b.part(new THREE.CircleGeometry(0.095, 16), "#ffffff", {
    at: [0, 1.17, 0.438],
    dir: [0, 0, 1],
    axis: "z",
    texture: BADGE_TEXTURE,
    name: "windmillBadge",
  });

  // Small bolts along the gallery front make the balcony read as handcrafted.
  for (const x of [-0.29, -0.145, 0, 0.145, 0.29]) {
    addSphere(b, 0.012, [x, 1.515, 0.39], GOLD, 6, 4, "galleryBolt");
  }

  // A pair of tiny wooden brackets under the front balcony.
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.22, 1.44, 0.36],
      [side * 0.22, 1.31, 0.39],
      0.012,
      {
        color: WOOD_DARK,
        section: { ngon: 5 },
        name: "frontGalleryBracket",
      },
    );
  }

  return b.root;
}
```