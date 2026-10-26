import * as THREE from "three";
import { type Builder, createBuilder, catmull, polyline, rng, paint, noise, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Animal Crossing Dutch Windmill",
  description:
    "A cheerful low-poly Dutch windmill with a faceted cream tower, red cap, gallery, door, windows, and four wooden sails.",
};

export const PALETTE = {
  STONE: "#d8c49a",
  STONE_LIGHT: "#ead9b2",
  STONE_DARK: "#a88967",
  MORTAR: "#b99e79",
  ROOF: "#b74739",
  ROOF_DARK: "#7e2f2e",
  ROOF_LIGHT: "#d9684d",
  WOOD: "#68402d",
  WOOD_DARK: "#40271f",
  WOOD_LIGHT: "#98613a",
  SAIL: "#f3e1af",
  SAIL_SHADOW: "#cfae70",
  WINDOW: "#31566a",
  WINDOW_GLOW: "#9ed3ca",
  FRAME: "#f5e7bd",
  DOOR: "#47736a",
  DOOR_DARK: "#2c504d",
  BRASS: "#d59c45",
  FLOWER: "#ef8e9e",
  LEAF: "#6d9d57",
  INK: "#30252a",
  FLOOR: "#7b9d65",
} as const;

const TOWER_MASONRY = paint((p, _n) => {
  const blockW = 0.22;
  const blockH = 0.18;
  const row = Math.floor(p.y / blockH);
  const stagger = row % 2 ? blockW * 0.5 : 0;
  const fx = ((p.x + 1.2 + stagger) / blockW) % 1;
  const fz = ((p.z + 1.2 + stagger) / blockW) % 1;
  const seam = fx < 0.075 || fz < 0.075 || ((row + Math.floor((p.x + 1.2 + stagger) / blockW)) % 7 === 0 && fx < 0.11);
  if (seam) return PALETTE.MORTAR;
  const wear = noise(p, 0.31, 41);
  const lower = smoothstep(0.32, 0.72, p.y);
  if (wear > 0.82) return PALETTE.STONE_DARK;
  if (p.y < 0.48 && wear > 0.55) return PALETTE.STONE_DARK;
  return lower > 0.5 ? PALETTE.STONE_LIGHT : PALETTE.STONE;
});

const ROOF_SHINGLES = paint((p, _n) => {
  const row = Math.floor((p.y - 2.62) / 0.105);
  const angle = Math.atan2(p.x, p.z);
  const count = 18 + (row % 2) * 2;
  const phase = ((angle / (Math.PI * 2)) * count + row * 0.5) % 1;
  if (phase < 0.075) return PALETTE.ROOF_DARK;
  if (row % 3 === 1) return PALETTE.ROOF_LIGHT;
  if (noise(p, 0.18, 77) > 0.76) return PALETTE.ROOF_LIGHT;
  return PALETTE.ROOF;
});

const SAIL_PLANKS = paint((p, n) => {
  const grain = noise(new THREE.Vector3(p.x * 0.7, p.y * 1.8, p.z * 0.4), 0.16, 19);
  const seam = Math.abs(Math.sin((p.x + p.y * 0.72 + p.z * 0.2) * 18)) > 0.965;
  if (seam || Math.abs(n.z) < 0.18) return PALETTE.WOOD_DARK;
  if (grain > 0.72) return PALETTE.WOOD_LIGHT;
  if (grain < 0.24) return PALETTE.WOOD_DARK;
  return PALETTE.WOOD;
});

const GALLERY_WOOD = paint((p, _n) => {
  const plank = Math.abs(Math.sin((p.x * 0.92 + p.z * 0.38) * 20));
  if (plank > 0.965) return PALETTE.WOOD_DARK;
  if (noise(p, 0.2, 23) > 0.68) return PALETTE.WOOD_LIGHT;
  return PALETTE.WOOD;
});

export const REQUESTS = [
  {
    id: "towerMasonry",
    kind: "texture",
    part: "towerBody",
    what: "Paint the cream tower with a charming hand-laid Dutch brick and stone pattern: warm STONE_LIGHT blocks, irregular MORTAR seams, slightly darker STONE blocks near the base, and a few subtle worn patches. Keep the pattern chunky and readable in the Animal Crossing style.",
  },
  {
    id: "roofShingles",
    kind: "texture",
    part: "roofCap",
    what: "Add overlapping rows of broad red ROOF shingles to the conical cap, with alternating ROOF_LIGHT and ROOF_DARK bands, a darker underside at the eaves, and soft painterly variation rather than tiny realistic tiles.",
  },
  {
    id: "sailPlanks",
    kind: "texture",
    part: "sailWood",
    what: "Texture the four wooden sail frames with warm WOOD and WOOD_LIGHT grain, darker WOOD_DARK edges, visible broad plank divisions, and a few friendly painted wear marks. Keep every sail's construction legible.",
  },
  {
    id: "galleryWood",
    kind: "texture",
    part: "galleryDeck",
    what: "Add wide wooden plank lines to the gallery deck and rail, using WOOD_LIGHT highlights and WOOD_DARK seams. The result should feel hand-built and cozy, not photorealistic.",
  },
  {
    id: "roofLight",
    kind: "add",
    part: "roofCap",
    what: "Add a tiny warm lantern and brass weather vane on the roof peak: a faceted golden cap, a softly glowing amber lantern body, and a simple four-point arrow. Keep it compact and clear of the sails.",
    at: [0, 3.23, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.28, 0.34, 0.28],
  },
  {
    id: "windowFlowerBoxes",
    kind: "add",
    part: "frontWindows",
    what: "Add two small flower boxes beneath the upper front windows. Use WOOD_LIGHT boxes with dark soil, several chunky LEAF leaves, and pink FLOWER blossoms. Mirror the pair symmetrically.",
    at: [0, 1.82, 0.79],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.28, 0.22],
  },
  {
    id: "doorHandle",
    kind: "add",
    part: "millDoor",
    what: "Add a cheerful brass door handle and a small round mail slot to the teal door. Use BRASS with a bright highlight and keep both details centered on the clear door face.",
    at: [0.12, 0.46, 0.86],
    normal: [0, 0, 1],
    bone: null,
    room: [0.22, 0.2, 0.06],
  },
  {
    id: "sailRibbons",
    kind: "add",
    part: "sailWood",
    what: "Decorate each of the four sails with a pair of short cream pennant ribbons tied near the outer tip. Use SAIL and ROOF_LIGHT, with chunky triangular flags that flutter sideways but stay within the sail silhouette.",
    at: [0, 2.15, 0.82],
    normal: [0, 0, 1],
    bone: null,
    room: [2.25, 2.25, 0.16],
  },
  {
    id: "axleHub",
    kind: "add",
    part: "frontAxle",
    what: "Build a richer central axle hub: a large faceted WOOD_DARK boss, a brass ring, four small radial bolts, and a tiny cream center cap. Make it the visual focal point where all four sails meet.",
    at: [0, 2.16, 0.86],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.42, 0.18],
  },
  {
    id: "sideSign",
    kind: "add",
    part: "towerBody",
    what: "Place a small painted oval sign on the right side of the tower reading as a friendly mill emblem: cream signboard, dark blue windmill pictogram, and a tiny red heart. It should sit flush on the side and not interfere with the front sails.",
    at: [0.76, 1.22, 0.05],
    normal: [1, 0, 0],
    bone: null,
    room: [0.16, 0.48, 0.08],
  },
  {
    id: "baseGarden",
    kind: "add",
    part: "towerBase",
    what: "Add a restrained ring of rounded garden stones and three tiny clumps of grass around the foot of the tower. Use STONE_DARK, LEAF, and a few FLOWER dots; keep the footprint tight to the windmill.",
    at: [0, 0.04, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.9, 0.18, 1.9],
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

function p(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function rotatedPoint(
  center: THREE.Vector3,
  radial: THREE.Vector3,
  side: THREE.Vector3,
  along: number,
  across: number,
  z: number,
) {
  return center
    .clone()
    .addScaledVector(radial, along)
    .addScaledVector(side, across)
    .setZ(z);
}

function box(
  b: Builder,
  size: [number, number, number],
  at: THREE.Vector3 | [number, number, number],
  color: string,
  name: string,
  bevel = 0,
) {
  const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
  if (bevel > 0) {
    const e = new THREE.EdgesGeometry(g);
    e.dispose();
  }
  return b.part(g, color, { at, name, flat: true });
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  at: THREE.Vector3 | [number, number, number],
  color: string,
  name: string,
  segments = 10,
  dir?: [number, number, number],
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, segments),
    color,
    { at, name, flat: true, ...(dir ? { dir } : {}) },
  );
}

function frontWindow(
  b: Builder,
  x: number,
  y: number,
  name: string,
) {
  const frame = b.extrude(
    [
      [-0.14, -0.18],
      [0.14, -0.18],
      [0.18, -0.1],
      [0.16, 0.13],
      [0.08, 0.2],
      [-0.08, 0.2],
      [-0.16, 0.13],
      [-0.18, -0.1],
    ],
    {
      at: [x, y, 0.805],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: PALETTE.FRAME,
      name: `${name}Frame`,
      bevel: 0.008,
      smoothing: 0,
    },
  );

  b.extrude(
    [
      [-0.105, -0.135],
      [0.105, -0.135],
      [0.125, -0.07],
      [0.11, 0.1],
      [0.05, 0.145],
      [-0.05, 0.145],
      [-0.11, 0.1],
      [-0.125, -0.07],
    ],
    {
      at: [x, y, 0.833],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: PALETTE.WINDOW,
      name: `${name}Glass`,
    },
  );

  b.rod(
    [x - 0.11, y + 0.005, 0.85],
    [x + 0.11, y + 0.005, 0.85],
    0.014,
    { color: PALETTE.FRAME, name: `${name}BarH` },
  );
  b.rod(
    [x, y - 0.14, 0.85],
    [x, y + 0.15, 0.85],
    0.014,
    { color: PALETTE.FRAME, name: `${name}BarV` },
  );

  return frame;
}

function buildSail(
  b: Builder,
  hub: THREE.Vector3,
  angle: number,
  index: number,
) {
  const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0).normalize();
  const side = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0).normalize();
  const zFront = 0.915;
  const zBack = 0.835;

  const outline: [number, number][] = [
    [-0.09, 0.08],
    [-0.14, 0.3],
    [-0.2, 0.98],
    [-0.13, 1.12],
    [0.13, 1.12],
    [0.2, 0.98],
    [0.14, 0.3],
    [0.09, 0.08],
  ];

  b.extrude(outline, {
    at: hub.clone().setZ(zBack),
    x: [side.x, side.y, 0],
    y: [radial.x, radial.y, 0],
    thickness: 0.075,
    color: SAIL_PLANKS,
    name: "sailWood",
    bevel: 0.01,
    smoothing: 0,
  });

  const cloth: [number, number][] = [
    [-0.075, 0.27],
    [-0.11, 0.43],
    [-0.145, 0.9],
    [-0.085, 1.0],
    [0.085, 1.0],
    [0.145, 0.9],
    [0.11, 0.43],
    [0.075, 0.27],
  ];

  b.extrude(cloth, {
    at: hub.clone().setZ(zFront),
    x: [side.x, side.y, 0],
    y: [radial.x, radial.y, 0],
    thickness: 0.018,
    color: PALETTE.SAIL,
    name: `sailCloth${index}`,
  });

  const edgeA = rotatedPoint(hub, radial, side, 0.18, -0.13, zFront + 0.02);
  const edgeB = rotatedPoint(hub, radial, side, 1.07, -0.17, zFront + 0.02);
  const edgeC = rotatedPoint(hub, radial, side, 0.18, 0.13, zFront + 0.02);
  const edgeD = rotatedPoint(hub, radial, side, 1.07, 0.17, zFront + 0.02);

  b.rod(edgeA, edgeB, 0.028, {
    color: PALETTE.WOOD_DARK,
    name: `sailEdgeL${index}`,
  });
  b.rod(edgeC, edgeD, 0.028, {
    color: PALETTE.WOOD_DARK,
    name: `sailEdgeR${index}`,
  });

  for (const t of [0.48, 0.72, 0.93]) {
    const half = 0.105 + (t - 0.45) * 0.07;
    const a = rotatedPoint(hub, radial, side, t, -half, zFront + 0.038);
    const c = rotatedPoint(hub, radial, side, t, half, zFront + 0.038);
    b.rod(a, c, 0.018, {
      color: PALETTE.WOOD_LIGHT,
      name: `sailCross${index}_${Math.round(t * 100)}`,
    });
  }

  const centerRodA = rotatedPoint(hub, radial, side, 0.1, 0, zFront + 0.045);
  const centerRodB = rotatedPoint(hub, radial, side, 1.09, 0, zFront + 0.045);
  b.rod(centerRodA, centerRodB, 0.022, {
    color: PALETTE.WOOD_DARK,
    name: `sailSpine${index}`,
  });

  const tip = rotatedPoint(hub, radial, side, 1.1, 0, 0.97);
  cylinder(b, 0.045, 0.14, tip, PALETTE.BRASS, `sailTip${index}`, 8, [
    radial.x,
    radial.y,
    0,
  ]);
}

export default function build() {
  const b = createBuilder({ name: "animal-crossing-dutch-windmill", detail: 1 });

  // Broad octagonal masonry tower. The first and last profile points lie on
  // the axis, producing a solid faceted lathe.
  b.lathe(
    [
      [0, 0],
      [0.68, 0],
      [0.82, 0.12],
      [0.84, 0.42],
      [0.8, 1.08],
      [0.75, 1.82],
      [0.69, 2.42],
      [0.63, 2.58],
      [0, 2.58],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: TOWER_MASONRY,
      name: "towerBody",
      smoothing: 0,
    },
  );

  // A darker foot course gives the tower a grounded, toy-like silhouette.
  cylinder(b, 0.82, 0.16, [0, 0.08, 0], PALETTE.STONE_DARK, "towerBase", 10);
  cylinder(b, 0.88, 0.07, [0, 0.025, 0], PALETTE.STONE_LIGHT, "baseCap", 10);

  // Upper gallery deck.
  cylinder(b, 0.86, 0.09, [0, 2.47, 0], GALLERY_WOOD, "galleryDeck", 12);
  cylinder(b, 0.79, 0.06, [0, 2.54, 0], PALETTE.WOOD_LIGHT, "galleryTrim", 12);

  // Gallery posts and rails, all around the tower.
  const galleryPosts: THREE.Vector3[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const q = p(Math.sin(a) * 0.82, 2.72, Math.cos(a) * 0.82);
    galleryPosts.push(q);
    b.rod(
      p(q.x, 2.52, q.z),
      q,
      0.026,
      { color: PALETTE.WOOD, name: `galleryPost${i}` },
    );
  }
  b.sweep(
    catmull(
      galleryPosts.map((q) => [q.x, q.y, q.z]),
      { closed: true },
    ),
    0.034,
    { color: PALETTE.WOOD_LIGHT, name: "galleryRail" },
  );
  b.sweep(
    catmull(
      galleryPosts.map((q) => [q.x, 2.62, q.z]),
      { closed: true },
    ),
    0.022,
    { color: PALETTE.WOOD_DARK, name: "galleryMidRail" },
  );

  // Red cap and a dark eave ring.
  cylinder(b, 0.82, 0.12, [0, 2.62, 0], PALETTE.ROOF_DARK, "roofEave", 12);
  b.part(
    new THREE.ConeGeometry(0.78, 0.64, 12),
    ROOF_SHINGLES,
    {
      at: [0, 2.91, 0],
      name: "roofCap",
      flat: true,
    },
  );
  cylinder(b, 0.18, 0.12, [0, 3.245, 0], PALETTE.ROOF_LIGHT, "roofPeak", 8);

  // Door frame and cheerful teal door, flush with the front.
  b.extrude(
    [
      [-0.28, 0],
      [0.28, 0],
      [0.3, 0.58],
      [0.24, 0.76],
      [0, 0.9],
      [-0.24, 0.76],
      [-0.3, 0.58],
    ],
    {
      at: [0, 0.02, 0.815],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.06,
      color: PALETTE.FRAME,
      name: "millDoorFrame",
      bevel: 0.012,
    },
  );
  b.extrude(
    [
      [-0.22, 0],
      [0.22, 0],
      [0.24, 0.55],
      [0.19, 0.67],
      [0, 0.79],
      [-0.19, 0.67],
      [-0.24, 0.55],
    ],
    {
      at: [0, 0.035, 0.855],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: PALETTE.DOOR,
      name: "millDoor",
    },
  );
  b.rod(
    [-0.21, 0.07, 0.89],
    [0.21, 0.07, 0.89],
    0.014,
    { color: PALETTE.DOOR_DARK, name: "doorLowerPlank" },
  );
  b.rod(
    [-0.2, 0.29, 0.89],
    [0.2, 0.29, 0.89],
    0.012,
    { color: PALETTE.DOOR_DARK, name: "doorUpperPlank" },
  );

  // Two upper windows, positioned on the front and left/right symmetrically.
  frontWindow(b, -0.26, 1.82, "frontWindowL");
  frontWindow(b, 0.26, 1.82, "frontWindowR");

  // A pair of side windows helps the building read as a complete structure.
  for (const side of [-1, 1]) {
    b.part(
      new THREE.CylinderGeometry(0.145, 0.145, 0.035, 10),
      PALETTE.FRAME,
      {
        at: [side * 0.695, 1.56, -0.02],
        dir: [side, 0, 0],
        name: `sideWindowFrame${side}`,
        flat: true,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.105, 0.105, 0.018, 10),
      PALETTE.WINDOW,
      {
        at: [side * 0.717, 1.56, -0.02],
        dir: [side, 0, 0],
        name: `sideWindowGlass${side}`,
        flat: true,
      },
    );
  }

  // Front axle, deep enough to show around the sails.
  cylinder(
    b,
    0.075,
    0.78,
    [0, 2.16, 0.5],
    PALETTE.WOOD_DARK,
    "frontAxle",
    10,
    [0, 0, 1],
  );
  cylinder(b, 0.18, 0.15, [0, 2.16, 0.92], PALETTE.WOOD_DARK, "sailHub", 12, [
    0,
    0,
    1,
  ]);
  cylinder(b, 0.12, 0.17, [0, 2.16, 1.02], PALETTE.BRASS, "hubRing", 12, [
    0,
    0,
    1,
  ]);
  cylinder(b, 0.07, 0.19, [0, 2.16, 1.08], PALETTE.SAIL, "hubCap", 10, [
    0,
    0,
    1,
  ]);

  // Four diagonal sails. Their tips remain below the roof peak.
  const hub = p(0, 2.16, 0.99);
  const sailAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  sailAngles.forEach((angle, i) => buildSail(b, hub, angle, i));

  // Small decorative braces beneath the gallery, leaving the front clear.
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.45, 2.4, -0.45],
      [side * 0.7, 2.52, -0.7],
      0.035,
      { color: PALETTE.WOOD_DARK, name: `galleryBrace${side}` },
    );
  }

  // A few foundation stones make the contact with the ground feel intentional.
  const stones = [
    [-0.66, 0.09, 0.56, 0.22],
    [-0.34, 0.07, 0.72, 0.18],
    [0.34, 0.07, 0.72, 0.2],
    [0.67, 0.1, 0.48, 0.24],
    [-0.72, 0.08, -0.46, 0.2],
    [0.72, 0.08, -0.42, 0.23],
  ] as const;
  stones.forEach(([x, y, z, r], i) => {
    b.part(
      new THREE.DodecahedronGeometry(r, 0),
      i % 2 ? PALETTE.STONE_LIGHT : PALETTE.STONE_DARK,
      {
        at: [x, y, z],
        scale: [1.2, 0.55, 0.8],
        name: `foundationStone${i}`,
        flat: true,
      },
    );
  });

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofLight(b: Builder) {
  const AMBER = "#ffb347";

  // The stage-one peak is at y = 3.23. Keep the lantern low and compact
  // so its silhouette remains separate from the upper sail tips.
  const baseY = 3.245;
  const bodyY = 3.315;
  const vaneY = 3.405;

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 8,
    dir?: [number, number, number],
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      {
        at,
        name,
        flat: true,
        ...(dir ? { dir } : {}),
      },
    );

  // Broad faceted foot, sunk slightly into the roof peak.
  cylinder(
    0.105,
    0.045,
    [0, baseY, 0],
    PALETTE.BRASS,
    "s21LanternFoot",
    8,
  );

  // Warm glass body. The separate glowing core gives the tiny light a
  // readable focal point even when the surrounding brass cage is visible.
  const glass = cylinder(
    0.075,
    0.135,
    [0, bodyY, 0],
    AMBER,
    "s21LanternGlow",
    8,
  );
  glow(glass, 1.8);

  // Slightly smaller dark-gold lower collar and upper rim.
  cylinder(
    0.087,
    0.025,
    [0, 3.245, 0],
    PALETTE.BRASS,
    "s21LanternLowerCollar",
    8,
  );
  cylinder(
    0.09,
    0.025,
    [0, 3.385, 0],
    PALETTE.BRASS,
    "s21LanternUpperRim",
    8,
  );

  // Four chunky cage bars, deliberately sparse and low-poly.
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const x = Math.cos(a) * 0.062;
    const z = Math.sin(a) * 0.062;
    b.rod(
      [x, 3.255, z],
      [x, 3.375, z],
      0.009,
      {
        color: PALETTE.BRASS,
        name: `s21LanternBar${i}`,
      },
    );
  }

  // Faceted roof-like lantern cap.
  b.part(
    new THREE.ConeGeometry(0.11, 0.075, 8),
    PALETTE.BRASS,
    {
      at: [0, 3.425, 0],
      name: "s21LanternCap",
      flat: true,
    },
  );

  // Small warm finial above the cap.
  cylinder(
    0.026,
    0.07,
    [0, 3.49, 0],
    AMBER,
    "s21LanternFinial",
    6,
  );

  // Short vertical mast for the weather vane, kept behind the cap.
  b.rod(
    [0, 3.42, -0.012],
    [0, vaneY + 0.025, -0.012],
    0.012,
    {
      color: PALETTE.BRASS,
      name: "s21WeatherMast",
    },
  );

  // Horizontal arrow shaft, pointing toward the mill's front (+Z).
  b.rod(
    [0, vaneY, -0.16],
    [0, vaneY, 0.16],
    0.012,
    {
      color: PALETTE.BRASS,
      name: "s21WeatherArrowShaft",
    },
  );

  // Four-point arrowhead on the front of the vane.
  b.extrude(
    [
      [-0.055, 0.085],
      [0, 0.16],
      [0.055, 0.085],
      [0.022, 0.085],
      [0.022, 0.04],
      [-0.022, 0.04],
      [-0.022, 0.085],
    ],
    {
      at: [0, vaneY - 0.012, 0.16],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.016,
      color: PALETTE.BRASS,
      name: "s21WeatherArrowhead",
      bevel: 0.003,
      smoothing: 0,
    },
  );

  // A broad, friendly tail fin balances the arrow and makes its direction
  // readable from the side as well as from the front.
  b.extrude(
    [
      [-0.055, -0.08],
      [0.055, -0.08],
      [0.05, -0.015],
      [0.028, 0.035],
      [0, 0.075],
      [-0.028, 0.035],
      [-0.05, -0.015],
    ],
    {
      at: [0, vaneY - 0.012, -0.12],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      color: PALETTE.ROOF_LIGHT,
      name: "s21WeatherTailFin",
      bevel: 0.002,
      smoothing: 0,
    },
  );

  // Tiny central pivot, layered over the mast and shaft.
  cylinder(
    0.025,
    0.035,
    [0, vaneY, 0],
    PALETTE.BRASS,
    "s21WeatherPivot",
    8,
    [0, 1, 0],
  );

  // One small amber bead beneath the lantern cap adds a clear warm glow
  // without enlarging the roof silhouette.
  const bead = b.part(
    new THREE.SphereGeometry(0.027, 8, 5),
    AMBER,
    {
      at: [0, 3.395, 0],
      name: "s21LanternBead",
      flat: true,
    },
  );
  glow(bead, 1.5);
}
    return addRoofLight;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addWindowFlowerBoxes(b: Builder) {
  const WOOD = PALETTE.WOOD_LIGHT;
  const WOOD_DARK = PALETTE.WOOD_DARK;
  const SOIL = "#34251d";
  const STEM = PALETTE.LEAF;
  const FLOWER = PALETTE.FLOWER;
  const GOLD = "#f4c85d";
  const LAVENDER = "#c39bd8";

  const boxGeo = new THREE.BoxGeometry(0.34, 0.13, 0.13);
  const rimGeo = new THREE.BoxGeometry(0.365, 0.025, 0.145);
  const soilGeo = new THREE.BoxGeometry(0.29, 0.018, 0.095);
  const plankGeo = new THREE.BoxGeometry(0.30, 0.018, 0.018);
  const bracketGeo = new THREE.BoxGeometry(0.045, 0.17, 0.045);
  const leafGeo = new THREE.SphereGeometry(1, 7, 5);
  const petalGeo = new THREE.SphereGeometry(1, 7, 5);
  const centerGeo = new THREE.SphereGeometry(1, 8, 5);
  const budGeo = new THREE.SphereGeometry(1, 7, 5);

  const flower = (
    x: number,
    y: number,
    z: number,
    color: string,
    index: number,
  ) => {
    // A short visible stem roots in the soil and makes every blossom feel planted.
    b.rod(
      [x, y - 0.065, z],
      [x, y - 0.005, z],
      0.009,
      {
        color: STEM,
        name: `s22Stem${index}`,
      },
    );

    const petalRadius = 0.029;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(petalGeo, color, {
        at: [
          x + Math.cos(a) * petalRadius,
          y + Math.sin(a) * petalRadius,
          z + 0.012,
        ],
        scale: [0.026, 0.036, 0.014],
        name: `s22Petal${index}_${i}`,
        flat: true,
      });
    }

    b.part(centerGeo, GOLD, {
      at: [x, y, z + 0.034],
      scale: [0.025, 0.025, 0.018],
      name: `s22FlowerCenter${index}`,
      flat: true,
    });
  };

  const leaf = (
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    index: number,
  ) => {
    b.part(leafGeo, STEM, {
      at: [x, y, z],
      scale: [0.027, sy, 0.012],
      rotation: [0, 0, sx * 24],
      name: `s22Leaf${index}`,
      flat: true,
    });
  };

  for (const side of [-1, 1]) {
    const x = side * 0.26;
    const z = 0.855;

    // Chunky planter body, raised rim, and an inset soil surface.
    b.part(boxGeo, WOOD, {
      at: [x, 1.705, z],
      name: `s22FlowerBox${side}`,
      flat: true,
    });

    b.part(rimGeo, WOOD_DARK, {
      at: [x, 1.775, z + 0.002],
      name: `s22FlowerBoxRim${side}`,
      flat: true,
    });

    b.part(soilGeo, SOIL, {
      at: [x, 1.792, z + 0.003],
      name: `s22FlowerBoxSoil${side}`,
      flat: true,
    });

    // A pale front plank and four little corner pegs add readable construction.
    b.part(plankGeo, PALETTE.STONE_LIGHT, {
      at: [x, 1.705, z + 0.071],
      name: `s22FlowerBoxFrontPlank${side}`,
      flat: true,
    });

    for (const dx of [-0.145, 0.145]) {
      b.part(new THREE.SphereGeometry(0.012, 7, 4), GOLD, {
        at: [x + dx, 1.705, z + 0.084],
        name: `s22PlanterPeg${side}_${dx < 0 ? "L" : "R"}`,
        flat: true,
      });
    }

    // Two simple hanging brackets beneath each planter.
    for (const dx of [-0.105, 0.105]) {
      b.part(bracketGeo, WOOD_DARK, {
        at: [x + dx, 1.625, z - 0.015],
        name: `s22PlanterBracket${side}_${dx < 0 ? "L" : "R"}`,
        flat: true,
      });
      b.rod(
        [x + dx, 1.54, z - 0.015],
        [x + dx + side * 0.035, 1.62, z + 0.02],
        0.012,
        {
          color: WOOD_DARK,
          name: `s22PlanterBrace${side}_${dx < 0 ? "L" : "R"}`,
        },
      );
    }

    // Three blossoms per box, with alternating cheerful colours.
    const flowers = [
      { dx: -0.105, color: FLOWER, dy: 0.0 },
      { dx: 0, color: side < 0 ? GOLD : LAVENDER, dy: 0.018 },
      { dx: 0.105, color: FLOWER, dy: -0.004 },
    ];

    flowers.forEach((f, i) => {
      flower(x + f.dx, 1.845 + f.dy, z + 0.012, f.color, side * 10 + i);

      // Broad leaves emerge between the flowers, angled in alternating directions.
      leaf(
        x + f.dx - 0.035,
        1.807 + f.dy * 0.5,
        z + 0.018,
        -1,
        0.052,
        side * 20 + i * 2,
      );
      leaf(
        x + f.dx + 0.036,
        1.815 + f.dy * 0.5,
        z + 0.02,
        1,
        0.047,
        side * 20 + i * 2 + 1,
      );
    });

    // Tiny unopened buds fill the gaps and give the boxes a fuller silhouette.
    for (const dx of [-0.052, 0.052]) {
      b.part(budGeo, FLOWER, {
        at: [x + dx, 1.865, z + 0.018],
        scale: [0.018, 0.025, 0.014],
        name: `s22Bud${side}_${dx < 0 ? "L" : "R"}`,
        flat: true,
      });
    }
  }
}
    return addWindowFlowerBoxes;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addDoorHandle(b: Builder) {
  const brass = PALETTE.BRASS;
  const brassBright = "#f1c86b";
  const brassDark = "#8f5c29";
  const slotDark = PALETTE.WOOD_DARK;

  const axisZ: [number, number, number] = [0, 0, 1];

  // Raised, friendly shield-shaped backplate behind the handle.
  b.extrude(
    [
      [-0.045, -0.065],
      [0.045, -0.065],
      [0.058, -0.04],
      [0.052, 0.045],
      [0.025, 0.07],
      [-0.025, 0.07],
      [-0.052, 0.045],
      [-0.058, -0.04],
    ],
    {
      at: [0.12, 0.405, 0.887],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.006,
      color: brassDark,
      name: "s23DoorHandleBackplate",
    },
  );

  b.extrude(
    [
      [-0.034, -0.052],
      [0.034, -0.052],
      [0.043, -0.032],
      [0.038, 0.037],
      [0.018, 0.052],
      [-0.018, 0.052],
      [-0.038, 0.037],
      [-0.043, -0.032],
    ],
    {
      at: [0.12, 0.405, 0.898],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.004,
      color: brass,
      name: "s23DoorHandlePlate",
    },
  );

  // Short stem projecting toward the viewer.
  b.part(
    new THREE.CylinderGeometry(0.018, 0.022, 0.055, 8),
    brassDark,
    {
      at: [0.12, 0.405, 0.925],
      dir: axisZ,
      name: "s23HandleStem",
      flat: true,
    },
  );

  // Horizontal lever with softened faceted ends.
  b.rod(
    [0.12, 0.405, 0.952],
    [0.185, 0.405, 0.952],
    0.014,
    {
      color: brass,
      name: "s23HandleLever",
      section: { ngon: 8 },
      caps: "round",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.022, 8, 5),
    brassBright,
    {
      at: [0.185, 0.405, 0.952],
      name: "s23HandleKnob",
      flat: true,
    },
  );

  // Tiny highlight bead on the near shoulder of the handle.
  b.part(
    new THREE.SphereGeometry(0.009, 6, 4),
    brassBright,
    {
      at: [0.137, 0.426, 0.966],
      name: "s23HandleHighlight",
      flat: true,
    },
  );

  // Round mail-slot escutcheon above the handle.
  b.part(
    new THREE.CylinderGeometry(0.048, 0.048, 0.012, 12),
    brassDark,
    {
      at: [0.12, 0.515, 0.901],
      dir: axisZ,
      name: "s23MailSlotBack",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.039, 0.039, 0.009, 12),
    brass,
    {
      at: [0.12, 0.515, 0.91],
      dir: axisZ,
      name: "s23MailSlotRing",
      flat: true,
    },
  );

  // Dark inset opening, with a warm lower lip so it reads as a real flap.
  b.part(
    new THREE.BoxGeometry(0.052, 0.012, 0.006),
    slotDark,
    {
      at: [0.12, 0.515, 0.919],
      name: "s23MailSlotOpening",
      flat: true,
    },
  );

  b.rod(
    [0.095, 0.509, 0.924],
    [0.145, 0.509, 0.924],
    0.004,
    {
      color: brassBright,
      name: "s23MailSlotLowerLip",
      section: { ngon: 6 },
    },
  );

  // Four minute round rivets around the mail slot.
  for (const [dx, dy, i] of [
    [-0.031, 0.025, 0],
    [0.031, 0.025, 1],
    [-0.031, -0.025, 2],
    [0.031, -0.025, 3],
  ] as const) {
    b.part(
      new THREE.SphereGeometry(0.0065, 6, 4),
      brassBright,
      {
        at: [0.12 + dx, 0.515 + dy, 0.924],
        name: `s23MailSlotRivet${i}`,
        flat: true,
      },
    );
  }
}
    return addDoorHandle;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addSailRibbons(b: Builder) {
  const hub = new THREE.Vector3(0, 2.16, 0);
  const sailAngles = [
    Math.PI / 4,
    (3 * Math.PI) / 4,
    (5 * Math.PI) / 4,
    (7 * Math.PI) / 4,
  ];

  for (let i = 0; i < sailAngles.length; i++) {
    const angle = sailAngles[i];
    const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
    const side = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0);

    for (const sign of [-1, 1]) {
      const root = hub
        .clone()
        .addScaledVector(radial, 0.775)
        .addScaledVector(side, sign * 0.035)
        .setZ(0.947);

      // A chunky triangular pennant, rooted close to the sail spine and
      // fluttering sideways without exceeding the sail's broad silhouette.
      const flag = b.extrude(
        [
          [0, 0],
          [sign * 0.018, 0.145],
          [sign * 0.125, 0.078],
        ],
        {
          at: root,
          x: [side.x, side.y, 0],
          y: [radial.x, radial.y, 0],
          thickness: 0.018,
          bevel: 0.004,
          color:
            (i + (sign > 0 ? 0 : 1)) % 2 === 0
              ? PALETTE.SAIL
              : PALETTE.ROOF_LIGHT,
          name: `s24Ribbon${i}_${sign > 0 ? "L" : "R"}`,
        },
      );

      // A narrow darker hem follows the free edge, making the pennant read
      // clearly even against the cream sail cloth.
      const hemA = root
        .clone()
        .addScaledVector(side, sign * 0.018)
        .addScaledVector(radial, 0.145)
        .setZ(0.965);
      const hemB = root
        .clone()
        .addScaledVector(side, sign * 0.125)
        .addScaledVector(radial, 0.078)
        .setZ(0.965);

      b.rod(hemA, hemB, 0.009, {
        color: PALETTE.ROOF_DARK,
        name: `s24RibbonHem${i}_${sign > 0 ? "L" : "R"}`,
      });

      // Small faceted tie bead at each attachment point.
      b.part(
        new THREE.SphereGeometry(0.026, 7, 5),
        PALETTE.BRASS,
        {
          at: root
            .clone()
            .addScaledVector(radial, -0.012)
            .setZ(0.965),
          name: `s24RibbonTie${i}_${sign > 0 ? "L" : "R"}`,
          flat: true,
        },
      );
    }

    // A short central lash keeps the pair visibly tied to the sail's wooden
    // spine rather than floating as separate decals.
    const lashA = hub
      .clone()
      .addScaledVector(radial, 0.75)
      .setZ(0.958);
    const lashB = hub
      .clone()
      .addScaledVector(radial, 0.955)
      .setZ(0.958);

    b.rod(lashA, lashB, 0.014, {
      color: PALETTE.WOOD_DARK,
      name: `s24RibbonLash${i}`,
    });
  }
}
    return addSailRibbons;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addAxleHub(b: Builder) {
  const cx = 0;
  const cy = 2.16;
  const baseZ = 0.86;

  const front = (z: number) => [cx, cy, z] as [number, number, number];

  // Deep faceted wooden boss, seated over the original axle.
  b.part(
    new THREE.CylinderGeometry(0.17, 0.17, 0.115, 12),
    PALETTE.WOOD_DARK,
    {
      at: front(baseZ + 0.055),
      dir: [0, 0, 1],
      name: "s25HubBoss",
      flat: true,
    },
  );

  // Warm wooden face inset, making the hub read as a built-up wheel rather
  // than a single flat cylinder.
  b.part(
    new THREE.CylinderGeometry(0.137, 0.137, 0.026, 12),
    PALETTE.WOOD,
    {
      at: front(baseZ + 0.12),
      dir: [0, 0, 1],
      name: "s25HubFace",
      flat: true,
    },
  );

  // Brass collar around the wooden boss.
  b.part(
    new THREE.TorusGeometry(0.148, 0.018, 6, 16),
    PALETTE.BRASS,
    {
      at: front(baseZ + 0.139),
      dir: [0, 0, 1],
      name: "s25BrassCollar",
      flat: true,
    },
  );

  // Four short brass ribs point toward the bolt heads and visually lock the
  // hub into the four-sail cross.
  const diagonals = [
    [Math.SQRT1_2, Math.SQRT1_2],
    [-Math.SQRT1_2, Math.SQRT1_2],
    [-Math.SQRT1_2, -Math.SQRT1_2],
    [Math.SQRT1_2, -Math.SQRT1_2],
  ] as const;

  for (let i = 0; i < diagonals.length; i++) {
    const [dx, dy] = diagonals[i];
    b.rod(
      [dx * 0.065, cy + dy * 0.065, baseZ + 0.154],
      [dx * 0.142, cy + dy * 0.142, baseZ + 0.154],
      0.012,
      {
        color: PALETTE.BRASS,
        name: `s25HubRib${i}`,
      },
    );

    // Faceted bolt heads, each with a tiny cream highlight cap.
    b.part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.026, 8),
      PALETTE.BRASS,
      {
        at: [dx * 0.145, cy + dy * 0.145, baseZ + 0.166],
        dir: [0, 0, 1],
        name: `s25HubBolt${i}`,
        flat: true,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6),
      PALETTE.STONE_LIGHT,
      {
        at: [dx * 0.145, cy + dy * 0.145, baseZ + 0.182],
        dir: [0, 0, 1],
        name: `s25HubBoltHighlight${i}`,
        flat: true,
      },
    );
  }

  // Proud cream center cap, with a red-brown pin peeking through its face.
  b.part(
    new THREE.CylinderGeometry(0.064, 0.071, 0.042, 10),
    PALETTE.STONE_LIGHT,
    {
      at: front(baseZ + 0.159),
      dir: [0, 0, 1],
      name: "s25CenterCap",
      flat: true,
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.019, 0.019, 0.009, 8),
    PALETTE.ROOF_DARK,
    {
      at: front(baseZ + 0.186),
      dir: [0, 0, 1],
      name: "s25CenterPin",
      flat: true,
    },
  );

  // Four little cream wedges on the face make the hub feel hand-painted and
  // echo the sail directions without competing with the sails themselves.
  for (let i = 0; i < diagonals.length; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    const ux = Math.sin(angle);
    const uy = Math.cos(angle);
    const vx = Math.cos(angle);
    const vy = -Math.sin(angle);

    b.extrude(
      [
        [-0.012, 0.075],
        [0.012, 0.075],
        [0.018, 0.11],
        [0, 0.132],
        [-0.018, 0.11],
      ],
      {
        at: [ux * 0.005, cy + uy * 0.005, baseZ + 0.178],
        x: [vx, vy, 0],
        y: [ux, uy, 0],
        thickness: 0.006,
        color: PALETTE.STONE_LIGHT,
        name: `s25HubPaintMark${i}`,
        smoothing: 0,
      },
    );
  }
}
    return addAxleHub;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addSideSign(b: Builder) {
  const signAtX = 0.775;

  // -------------------------------------------------------------------------------------------------------------
  // Friendly side sign: an oval cream board, outlined in dark wood, with a tiny windmill emblem and heart.

  const signOutline: [number, number][] = [
    [-0.075, -0.19],
    [-0.12, -0.14],
    [-0.145, -0.04],
    [-0.145, 0.08],
    [-0.115, 0.17],
    [-0.055, 0.22],
    [0.055, 0.22],
    [0.115, 0.17],
    [0.145, 0.08],
    [0.145, -0.04],
    [0.12, -0.14],
    [0.075, -0.19],
    [0, -0.21],
  ];

  b.extrude(signOutline, {
    at: [signAtX, 1.22, 0.045],
    // Local drawing x runs toward model -Z, making x × y point outward +X.
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.008,
    smoothing: 1,
    color: FRAME,
    name: "s26SideSignBoard",
  });

  const insetOutline: [number, number][] = [
    [-0.062, -0.165],
    [-0.105, -0.11],
    [-0.12, 0.01],
    [-0.092, 0.12],
    [-0.04, 0.165],
    [0.04, 0.165],
    [0.092, 0.12],
    [0.12, 0.01],
    [0.105, -0.11],
    [0.062, -0.165],
    [0, -0.18],
  ];

  b.extrude(insetOutline, {
    at: [signAtX + 0.022, 1.22, 0.045],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    smoothing: 1,
    color: WINDOW_GLOW,
    name: "s26SideSignInset",
  });

  // Dark painted-looking border made from four chunky curved-ish rods.
  const sx = signAtX + 0.034;
  b.rod([sx, 1.03, -0.025], [sx, 1.02, 0.045], 0.009, {
    color: WOOD_DARK,
    name: "s26SignBorderBottom",
  });
  b.rod([sx, 1.02, 0.045], [sx, 1.07, 0.145], 0.009, {
    color: WOOD_DARK,
    name: "s26SignBorderLower",
  });
  b.rod([sx, 1.07, 0.145], [sx, 1.22, 0.19], 0.009, {
    color: WOOD_DARK,
    name: "s26SignBorderTop",
  });
  b.rod([sx, 1.22, 0.19], [sx, 1.39, 0.145], 0.009, {
    color: WOOD_DARK,
    name: "s26SignBorderUpper",
  });

  // Four-bar windmill pictogram, centered on the side sign.
  const emblemX = signAtX + 0.043;
  const emblemY = 1.235;
  const emblemZ = 0.045;

  b.part(
    new THREE.CylinderGeometry(0.027, 0.027, 0.022, 10),
    BRASS,
    {
      at: [emblemX, emblemY, emblemZ],
      dir: [1, 0, 0],
      name: "s26SignMillHub",
      flat: true,
    },
  );

  const bladeTips = [
    [emblemY + 0.095, emblemZ + 0.025],
    [emblemY - 0.025, emblemZ + 0.105],
    [emblemY - 0.095, emblemZ - 0.025],
    [emblemY + 0.025, emblemZ - 0.105],
  ] as const;

  for (let i = 0; i < bladeTips.length; i++) {
    const [ty, tz] = bladeTips[i];
    const dy = ty - emblemY;
    const dz = tz - emblemZ;
    const length = Math.hypot(dy, dz);
    const ny = dy / length;
    const nz = dz / length;
    const sideY = -nz;
    const sideZ = ny;

    const root = [emblemX, emblemY, emblemZ] as [number, number, number];
    const shoulder = [
      emblemX,
      emblemY + ny * 0.035 + sideY * 0.025,
      emblemZ + nz * 0.035 + sideZ * 0.025,
    ] as [number, number, number];
    const tip = [
      emblemX,
      ty,
      tz,
    ] as [number, number, number];

    b.rod(root, shoulder, 0.012, {
      color: WINDOW,
      name: `s26SignBladeRoot${i}`,
    });
    b.rod(shoulder, tip, 0.018, {
      color: WINDOW,
      name: `s26SignBlade${i}`,
    });
  }

  // Small red heart beneath the emblem, assembled from two lobes and a pointed body.
  const heartX = signAtX + 0.045;
  const heartY = 1.115;
  const heartZ = 0.045;
  b.part(
    new THREE.SphereGeometry(0.025, 7, 5),
    ROOF_LIGHT,
    {
      at: [heartX, heartY + 0.012, heartZ - 0.014],
      scale: [1, 0.82, 0.48],
      name: "s26SignHeartLobeA",
      flat: true,
    },
  );
  b.part(
    new THREE.SphereGeometry(0.025, 7, 5),
    ROOF_LIGHT,
    {
      at: [heartX, heartY + 0.012, heartZ + 0.014],
      scale: [1, 0.82, 0.48],
      name: "s26SignHeartLobeB",
      flat: true,
    },
  );
  b.extrude(
    [
      [-0.045, 0.02],
      [0, -0.065],
      [0.045, 0.02],
      [0.03, 0.06],
      [-0.03, 0.06],
    ],
    {
      at: [heartX, heartY, heartZ],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      color: ROOF_LIGHT,
      name: "s26SignHeartPoint",
    },
  );

  // Tiny brass hanging peg gives the sign a physical attachment to the masonry.
  b.rod(
    [signAtX - 0.005, 1.43, 0.045],
    [signAtX + 0.045, 1.43, 0.045],
    0.012,
    { color: BRASS, name: "s26SignTopPeg" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Tight foundation garden: rounded stones outside the tower footprint and three deliberate grass clumps.

  const stones: readonly [number, number, number, number, number][] = [
    [-0.86, 0.09, 0.37, 0.19, 0.7],
    [-0.58, 0.075, 0.75, 0.15, -0.25],
    [-0.08, 0.07, 0.91, 0.17, 0.15],
    [0.46, 0.08, 0.79, 0.2, -0.55],
    [0.86, 0.09, 0.35, 0.18, 0.35],
    [0.85, 0.075, -0.35, 0.19, -0.4],
    [0.4, 0.07, -0.78, 0.16, 0.2],
    [-0.32, 0.08, -0.82, 0.2, -0.7],
    [-0.83, 0.09, -0.38, 0.16, 0.25],
  ];

  stones.forEach(([x, y, z, radius, yaw], i) => {
    b.part(
      new THREE.DodecahedronGeometry(radius, 0),
      i % 3 === 0 ? STONE_LIGHT : STONE_DARK,
      {
        at: [x, y, z],
        scale: [1.25, 0.52, 0.8],
        rotation: [0, yaw, 0],
        name: `s26GardenStone${i}`,
        flat: true,
      },
    );
  });

  const grassClumps: readonly [number, number, number, number][] = [
    [-0.91, 0.02, 0.02, 0.12],
    [0.9, 0.02, 0.06, -0.2],
    [0.03, 0.02, -0.96, 0.35],
  ];

  grassClumps.forEach(([x, y, z, lean], clump) => {
    const base = new THREE.Vector3(x, y, z);
    const blades = [
      new THREE.Vector3(lean - 0.08, 0.19, -0.02),
      new THREE.Vector3(lean + 0.02, 0.23, 0.018),
      new THREE.Vector3(lean + 0.09, 0.16, -0.012),
      new THREE.Vector3(lean * 0.5, 0.21, 0.055),
    ];

    blades.forEach((tip, blade) => {
      const end = base.clone().add(tip);
      b.spike(base, end, null, 0.014, {
        color: LEAF,
        name: `s26Grass${clump}_${blade}`,
        caps: { start: "round", end: "point" },
      });
    });

    // One tiny flower per clump, offset so it reads as a planted tuft rather
    // than a floating dot.
    const flowerOffset = clump === 0 ? [0.03, 0.2, 0.035] : clump === 1 ? [-0.04, 0.19, 0.02] : [0.02, 0.2, -0.04];
    b.part(
      new THREE.SphereGeometry(0.035, 7, 5),
      FLOWER,
      {
        at: [x + flowerOffset[0], y + flowerOffset[1], z + flowerOffset[2]],
        scale: [1, 0.72, 0.7],
        name: `s26GardenFlower${clump}`,
        flat: true,
      },
    );
    b.part(
      new THREE.SphereGeometry(0.012, 6, 4),
      BRASS,
      {
        at: [x + flowerOffset[0], y + flowerOffset[1], z + flowerOffset[2] + 0.01],
        name: `s26GardenFlowerCenter${clump}`,
        flat: true,
      },
    );
  });

  // Four low leaf rosettes fill the gaps without making a large garden.
  const rosettes: readonly [number, number, number][] = [
    [-0.62, 0.025, 0.42],
    [0.61, 0.025, 0.45],
    [-0.58, 0.025, -0.55],
    [0.57, 0.025, -0.57],
  ];

  rosettes.forEach(([x, y, z], i) => {
    for (let j = 0; j < 3; j++) {
      const a = (j / 3) * Math.PI * 2 + i * 0.4;
      const start = new THREE.Vector3(x, y + 0.015, z);
      const end = new THREE.Vector3(
        x + Math.cos(a) * 0.075,
        y + 0.095 + (j % 2) * 0.025,
        z + Math.sin(a) * 0.075,
      );
      b.rod(start, end, 0.012, {
        color: LEAF,
        name: `s26LeafRosette${i}_${j}`,
      });
    }
  });
}
    return addSideSign;
  })(),
);
