import * as THREE from "three";
import {
  createBuilder,
  type Builder,
  catmull,
  polyline,
  rng,
} from "../../../../src/index";

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
    color: PALETTE.WOOD,
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
      color: PALETTE.STONE,
      name: "towerBody",
      smoothing: 0,
    },
  );

  // A darker foot course gives the tower a grounded, toy-like silhouette.
  cylinder(b, 0.82, 0.16, [0, 0.08, 0], PALETTE.STONE_DARK, "towerBase", 10);
  cylinder(b, 0.88, 0.07, [0, 0.025, 0], PALETTE.STONE_LIGHT, "baseCap", 10);

  // Upper gallery deck.
  cylinder(b, 0.86, 0.09, [0, 2.47, 0], PALETTE.WOOD_DARK, "galleryDeck", 12);
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
    PALETTE.ROOF,
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
