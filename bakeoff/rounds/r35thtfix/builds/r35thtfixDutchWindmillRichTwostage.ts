import * as THREE from "three";
import { type Builder, createBuilder, grain, mix, noise, paint, polyline, resolve, stripes, bezier, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const PALETTE = {
  TOWER: "#f0d4a0",
  TOWER_SHADE: "#d8ad7e",
  STUCCO_TRIM: "#d97863",
  WOOD: "#9b613b",
  WOOD_LIGHT: "#c18a52",
  WOOD_DARK: "#59392d",
  ROOF: "#4d8b7b",
  ROOF_DARK: "#2f625d",
  DOOR: "#9a5260",
  WINDOW: "#294c63",
  WINDOW_LIGHT: "#72c8c2",
  CANVAS: "#fff0c5",
  CANVAS_SHADE: "#e7b477",
  BRASS: "#d69a43",
  INK: "#4a302c",
  FLOWER_PINK: "#e57d91",
  FLOWER_YELLOW: "#f5c85c",
  LEAF: "#5b9c65",
} as const;

const {
  TOWER,
  TOWER_SHADE,
  STUCCO_TRIM,
  WOOD,
  WOOD_LIGHT,
  WOOD_DARK,
  ROOF,
  ROOF_DARK,
  CANVAS,
  CANVAS_SHADE,
  BRASS,
  LEAF,
} = PALETTE;

const fract = (x: number) => x - Math.floor(x);
const coral = "#e8a090";

const TOWER_MASONRY = paint((p, _n) => {
  const row = Math.floor(p.y / 0.48);
  const stagger = row % 2 === 0 ? 0 : 0.34;
  const localX = p.x + stagger;
  const localZ = p.z + 0.2;
  const fx = fract(localX / 0.72);
  const fz = fract(localZ / 0.58);
  const irregular = noise(new THREE.Vector3(Math.floor(localX / 0.72), row, Math.floor(localZ / 0.58)), 1, 23);
  const verticalGap = 0.025 + irregular * 0.018;
  const horizontalGap = 0.035 + irregular * 0.02;
  const joint = fx < verticalGap || fz < horizontalGap;

  if (joint) return TOWER_SHADE;

  let stone: string | readonly [number, number, number] =
    p.y < 1.25 ? mix(TOWER, TOWER_SHADE, 0.23) : TOWER;

  if (p.y > 1.1 && noise(p, 0.82, 12) > 0.89) stone = mix(stone, STUCCO_TRIM, 0.34);
  return stone;
});

const ROOF_ROWS = stripes(ROOF, ROOF_DARK, {
  size: 0.27,
  axis: "y",
  width: 0.28,
  wobble: 0.08,
  seed: 31,
});

const ROOF_THATCH = paint((p, n) => {
  let color = resolve(ROOF_ROWS, p, n);
  if (p.y < 5.76 && n.y > 0.12 && noise(p, 0.22, 44) > 0.58) {
    color = mix(color, LEAF, 0.44);
  }
  return color;
});

const SAIL_CANVAS = paint((_p, _n, s) => {
  const across = s[0];
  const along = s[1];
  const row = Math.floor((along + 0.15) / 0.54);
  const paleBand = row % 4 === 1;
  const coralBand = row % 7 === 4 && Math.abs(across) < 0.24;

  if (coralBand) return coral;
  if (paleBand) return CANVAS_SHADE;

  const stitchX = Math.abs(fract((across + 0.3) / 0.105) - 0.5) < 0.035;
  const stitchY = Math.abs(fract((along + 0.03) / 0.23) - 0.5) < 0.045;
  if (stitchX && stitchY) return WOOD_LIGHT;

  return CANVAS;
});

const WOOD_GRAIN = grain(WOOD_DARK, WOOD, {
  size: 0.16,
  axis: [0, 0, 1],
  seed: 73,
});

const WOODWORK = paint((p, n, s) => {
  const t = s[0];
  const angle = ((s[1] % 360) + 360) % 360;
  let color = resolve(WOOD_GRAIN, p, n);

  if (n.y > 0.48) color = mix(color, WOOD_LIGHT, 0.2);

  const nailPositions = [0.22, 0.53, 0.82];
  const nearNail = nailPositions.some((v) => Math.abs(t - v) < 0.025);
  const frontward = angle < 13 || angle > 347;
  if (nearNail && frontward) return BRASS;

  return color;
});

export const meta = {
  name: "Dutch Windmill",
  description:
    "A chunky, cheerful Animal Crossing-style Dutch windmill with a tapered stucco tower, teal cap, balcony, wooden sail cross, arched door, windows, and rear tail.",
};

export const REQUESTS = [
  {
    id: "roofWeatherVane",
    kind: "add",
    part: "roof",
    what:
      "A whimsical brass weather vane on the roof peak: a slim pole, curled arrow, and tiny four-point windmill silhouette. Use BRASS, WOOD_DARK, and a small FLOWER_PINK pennant. Keep it rounded and toy-like.",
    at: [0, 6.72, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.65, 0.75, 0.65],
  },
  {
    id: "sailLattice",
    kind: "add",
    part: "sailCanvas",
    what:
      "Decorative wooden lattice strips over the four sail canvases: two slim diagonal braces on each blade, small warm-brass fasteners, and a neat repeating Animal Crossing-style rhythm. Use WOOD_DARK, WOOD_LIGHT, and BRASS without obscuring the cream canvas.",
    at: [0, 4.35, 1.79],
    normal: [0, 0, 1],
    bone: null,
    room: [3.75, 3.75, 0.32],
  },
  {
    id: "hubEmblem",
    kind: "add",
    part: "sailHub",
    what:
      "A cheerful circular hub emblem mounted on the front of the sail hub: a raised cream rosette with four rounded petals, a BRASS centre, and a thin WOOD_DARK outline. It should read clearly from the front.",
    at: [0, 4.35, 1.88],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.8, 0.2],
  },
  {
    id: "doorSign",
    kind: "add",
    part: "door",
    what:
      "A little oval windmill-owner plaque and chunky brass handle on the arched door. Use BRASS, CANVAS, and WINDOW, with a simple painted windmill pictogram rather than tiny text.",
    at: [0, 1.05, 1.61],
    normal: [0, 0, 1],
    bone: null,
    room: [0.72, 0.42, 0.16],
  },
  {
    id: "windowGlow",
    kind: "add",
    part: "windowPane",
    what:
      "Warm glowing window dressing on the front window: a thick rounded inner frame, four amber panes, and two tiny curtains tied with FLOWER_PINK ribbons. Keep the main WINDOW pane visible around it.",
    at: [0, 3.45, 1.53],
    normal: [0, 0, 1],
    bone: null,
    room: [0.88, 0.85, 0.18],
  },
  {
    id: "flowerBoxes",
    kind: "add",
    part: "balconyRail",
    what:
      "Two overflowing flower boxes attached to the balcony front, one left and one right of the sail clearance. Use WOOD_LIGHT boxes, LEAF foliage, and large simple FLOWER_PINK and FLOWER_YELLOW blossoms. Stay below the rail top.",
    at: [-0.88, 5.39, 1.42],
    normal: [0, 0, 1],
    bone: null,
    room: [1.25, 0.5, 0.42],
  },
  {
    id: "balconyLantern",
    kind: "add",
    part: "balconyPlatform",
    what:
      "A small hanging lantern under the balcony at the front-right: WOOD_DARK bracket, BRASS cap, translucent WINDOW_LIGHT glass, and a tiny warm glowing centre. It must hang clear of the spinning sails.",
    at: [1.12, 5.05, 1.25],
    normal: [0, 0, 1],
    bone: null,
    room: [0.42, 0.72, 0.42],
  },
  {
    id: "tailLadder",
    kind: "add",
    part: "tailBeam",
    what:
      "A simple rear maintenance ladder along the tail beam, with two WOOD_LIGHT rails, five WOOD_DARK rungs, and a small brass end cap. It should follow the rear slope and remain behind the tower.",
    at: [0, 5.34, -1.62],
    normal: [0, 0, -1],
    bone: null,
    room: [0.58, 1.45, 0.5],
  },
  {
    id: "roofMoss",
    kind: "add",
    part: "roof",
    what:
      "A few chunky moss tufts tucked along the roof eaves and one side of the roof, using LEAF and a darker green companion. Keep them sparse, broad, and hand-shaped rather than making a smooth covering.",
    at: [0.92, 5.43, 0.88],
    normal: [0.55, 0.2, 0.8],
    bone: null,
    room: [1.1, 0.42, 0.9],
  },
  {
    id: "cornerMilestone",
    kind: "add",
    part: "towerBody",
    what:
      "A friendly painted milestone plaque on the lower left tower: a rounded CANVAS stone shape, STUCCO_TRIM border, and a BRASS windmill icon. Mount it flat on the front-left facade without blocking the door.",
    at: [-0.92, 1.58, 1.37],
    normal: [-0.22, 0.04, 0.97],
    bone: null,
    room: [0.62, 0.7, 0.18],
  },
  {
    id: "towerMasonry",
    kind: "texture",
    part: "towerBody",
    what:
      "Paint the stucco tower with a subtle hand-built masonry pattern: large warm TOWER blocks, irregular TOWER_SHADE joints, slightly darker lower stones, and occasional STUCCO_TRIM accents. Keep it soft and colourful, never realistic or noisy.",
  },
  {
    id: "roofThatch",
    kind: "texture",
    part: "roof",
    what:
      "Paint the teal roof as layered low-poly thatch or painted shingles in ROOF and ROOF_DARK, with broad curved horizontal rows, a few muted LEAF moss streaks near the eaves, and a warm WOOD_LIGHT ridge.",
  },
  {
    id: "sailCanvas",
    kind: "texture",
    part: "sailCanvas",
    what:
      "Paint the four sail inserts as clean cream canvas with broad CANVAS_SHADE bands, tiny warm stitching marks, and alternating pale coral accents. Keep each blade readable at a distance and leave the WOOD_DARK borders crisp.",
  },
  {
    id: "woodwork",
    kind: "texture",
    part: "tailBeam",
    what:
      "Paint the exposed WOOD and WOOD_DARK timbers with simple broad wood grain following each beam, a lighter edge on upward faces, and a few rounded BRASS nail heads. Use an illustrated, tidy pattern rather than fine photoreal grain.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
    });
  };

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      name,
    });
  };

  b.lathe(
    [
      [0, 0],
      [1.62, 0],
      [1.68, 0.14],
      [1.57, 0.34],
      [1.48, 2.2],
      [1.39, 4.25],
      [1.28, 5.22],
      [1.2, 5.42],
      [0, 5.42],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 8,
      color: TOWER_MASONRY,
      name: "towerBody",
    },
  );

  cylinder("towerBase", 1.76, 0.22, [0, 0.11, 0], TOWER_SHADE, 8);
  cylinder("towerBaseTrim", 1.79, 0.075, [0, 0.27, 0], STUCCO_TRIM, 8);

  b.rod([-1.38, 0.38, 0.73], [-1.14, 5.1, 0.82], 0.065, {
    color: STUCCO_TRIM,
    name: "leftCornerTrim",
    section: { ngon: 6 },
  });
  b.rod([1.38, 0.38, 0.73], [1.14, 5.1, 0.82], 0.065, {
    color: STUCCO_TRIM,
    name: "rightCornerTrim",
    section: { ngon: 6 },
  });

  box("lowerFacadeBand", [2.55, 0.1, 0.1], [0, 1.9, 1.43], STUCCO_TRIM);
  box("upperFacadeBand", [2.25, 0.09, 0.1], [0, 4.28, 1.29], STUCCO_TRIM);

  const doorFrameOutline: [number, number][] = [
    [-0.56, 0],
    [0.56, 0],
    [0.56, 0.78],
    [0.46, 0.98],
    [0.27, 1.13],
    [0, 1.2],
    [-0.27, 1.13],
    [-0.46, 0.98],
    [-0.56, 0.78],
  ];

  b.extrude(doorFrameOutline, {
    at: [0, 0.2, 1.46],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.025,
    smoothing: 1,
    color: WOOD_DARK,
    name: "doorFrame",
  });

  const doorOutline: [number, number][] = [
    [-0.43, 0],
    [0.43, 0],
    [0.43, 0.75],
    [0.35, 0.9],
    [0.2, 1.02],
    [0, 1.08],
    [-0.2, 1.02],
    [-0.35, 0.9],
    [-0.43, 0.75],
  ];

  b.extrude(doorOutline, {
    at: [0, 0.25, 1.54],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.065,
    bevel: 0.012,
    smoothing: 1,
    color: PALETTE.DOOR,
    name: "door",
  });

  box("doorStep", [1.18, 0.15, 0.42], [0, 0.075, 1.57], WOOD_LIGHT);
  box("doorLeftPlank", [0.035, 0.72, 0.025], [-0.2, 0.61, 1.59], TOWER_SHADE);
  box("doorRightPlank", [0.035, 0.72, 0.025], [0.2, 0.61, 1.59], TOWER_SHADE);

  box("windowFrame", [0.92, 0.82, 0.13], [0, 3.48, 1.35], WOOD_DARK);
  box("windowPane", [0.73, 0.63, 0.055], [0, 3.48, 1.43], PALETTE.WINDOW);
  box("windowCrossV", [0.065, 0.67, 0.075], [0, 3.48, 1.47], WOOD_LIGHT);
  box("windowCrossH", [0.76, 0.065, 0.075], [0, 3.48, 1.47], WOOD_LIGHT);

  box("capWindowFrame", [0.57, 0.32, 0.1], [0, 5.34, 1.18], WOOD_DARK);
  box("capWindowPane", [0.41, 0.19, 0.045], [0, 5.34, 1.24], PALETTE.WINDOW_LIGHT);
  box("capWindowBar", [0.045, 0.23, 0.06], [0, 5.34, 1.27], WOOD_LIGHT);

  cylinder("balconyPlatform", 1.53, 0.18, [0, 5.3, 0], WOOD_DARK, 8);
  cylinder("balconyTop", 1.59, 0.075, [0, 5.41, 0], WOOD_LIGHT, 8);

  const postRadius = 1.42;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    cylinder(
      `balconyPost${i}`,
      0.055,
      0.48,
      [Math.cos(a) * postRadius, 5.64, Math.sin(a) * postRadius],
      WOOD_DARK,
      6,
    );
  }

  const railPoints: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    railPoints.push([Math.cos(a) * postRadius, 5.88, Math.sin(a) * postRadius]);
  }

  b.sweep(polyline(railPoints, { closed: true }), 0.055, {
    color: WOOD_DARK,
    caps: "none",
    section: { ngon: 6 },
    name: "balconyRail",
  });

  cylinder("capBody", 1.25, 0.36, [0, 5.56, 0], WOOD, 8);
  cylinder("capLowerTrim", 1.33, 0.09, [0, 5.38, 0], WOOD_DARK, 8);
  cylinder("capUpperTrim", 1.29, 0.08, [0, 5.74, 0], WOOD_LIGHT, 8);

  b.part(new THREE.ConeGeometry(1.59, 1.38, 8), ROOF_THATCH, {
    at: [0, 6.08, 0],
    name: "roof",
  });
  cylinder("roofEave", 1.68, 0.15, [0, 5.43, 0], ROOF_DARK, 8);
  cylinder("roofRidge", 0.22, 0.16, [0, 6.76, 0], WOOD_LIGHT, 8);

  b.rod([0, 5.65, -0.36], [0, 5.25, -2.2], 0.115, {
    color: WOODWORK,
    section: { ngon: 6 },
    name: "tailBeam",
  });

  b.extrude(
    [
      [-0.2, -0.53],
      [0.2, -0.53],
      [0.34, 0.1],
      [0.23, 0.7],
      [0, 0.88],
      [-0.23, 0.7],
      [-0.34, 0.1],
    ],
    {
      at: [0, 4.86, -2.2],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.13,
      bevel: 0.018,
      smoothing: 1,
      color: WOOD,
      name: "tailFin",
    },
  );

  box("tailFinStripe", [0.08, 1.05, 0.04], [0, 5.02, -2.28], STUCCO_TRIM);

  const hubY = 4.35;
  const hubZ = 1.68;
  const sailLength = 2.48;

  const sailFrameOutline: [number, number][] = [
    [-0.19, 0.05],
    [0.19, 0.05],
    [0.3, sailLength],
    [-0.3, sailLength],
  ];

  const sailCanvasOutline: [number, number][] = [
    [-0.105, 0.18],
    [0.105, 0.18],
    [0.215, 2.31],
    [-0.215, 2.31],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = 45 + i * 90;
    const r = (angle * Math.PI) / 180;
    const radial: [number, number, number] = [Math.cos(r), Math.sin(r), 0];
    const across: [number, number, number] = [Math.sin(r), -Math.cos(r), 0];

    b.extrude(sailFrameOutline, {
      at: [0, hubY, hubZ],
      x: across,
      y: radial,
      thickness: 0.085,
      bevel: 0.012,
      color: WOOD_DARK,
      name: `sailFrame${i}`,
    });

    b.extrude(sailCanvasOutline, {
      at: [0, hubY, hubZ + 0.055],
      x: across,
      y: radial,
      thickness: 0.028,
      bevel: 0.006,
      color: SAIL_CANVAS,
      name: "sailCanvas",
    });

    const startA = new THREE.Vector3(...radial).multiplyScalar(0.12);
    const endA = new THREE.Vector3(...radial).multiplyScalar(2.42);
    const sideOffset = new THREE.Vector3(...across).multiplyScalar(0.245);
    const p0 = startA.clone().add(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p1 = endA.clone().add(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p2 = startA.clone().sub(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p3 = endA.clone().sub(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));

    b.rod(p0, p1, 0.035, {
      color: WOOD_LIGHT,
      section: { ngon: 6 },
      name: `sailEdge${i}A`,
    });

    b.rod(p2, p3, 0.035, {
      color: WOOD_LIGHT,
      section: { ngon: 6 },
      name: `sailEdge${i}B`,
    });
  }

  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.62, 10), WOOD_DARK, {
    at: [0, hubY, 1.55],
    dir: [0, 0, 1],
    name: "sailAxle",
  });

  b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12), BRASS, {
    at: [0, hubY, 1.79],
    dir: [0, 0, 1],
    name: "sailHub",
  });

  b.part(new THREE.SphereGeometry(0.27, 12, 8), WOOD_LIGHT, {
    at: [0, hubY, 1.93],
    name: "hubCap",
  });

  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10), ROOF_DARK, {
    at: [0, hubY, 2.08],
    dir: [0, 0, 1],
    name: "hubFrontCap",
  });

  box("doorAwning", [1.2, 0.12, 0.44], [0, 1.45, 1.53], WOOD_DARK);
  box("doorAwningTop", [1.05, 0.06, 0.32], [0, 1.53, 1.54], WOOD_LIGHT);

  for (const side of [-1, 1]) {
    box(
      `balconySupport${side > 0 ? "L" : "R"}`,
      [0.11, 0.66, 0.11],
      [side * 1.12, 5.03, 0.82],
      WOOD_DARK,
    );
  }

  box("stonePatchLeft", [0.48, 0.22, 0.035], [-0.88, 0.62, 1.54], TOWER_SHADE);
  box("stonePatchRight", [0.62, 0.19, 0.035], [0.86, 1.08, 1.49], TOWER_SHADE);
  box("stonePatchHigh", [0.45, 0.17, 0.035], [0.7, 2.46, 1.43], TOWER_SHADE);

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addRoofWeatherVane(b: Builder) {
  const P = PALETTE;

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) =>
    b.rod(a, c, radius, {
      color,
      section: { ngon: 6 },
      caps: "round",
      name,
      group: "stage2-weather-vane",
    });

  // A chunky stepped socket sunk into the rounded roof peak.
  b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.075, 8), P.WOOD_DARK, {
    at: [0, 6.745, 0],
    name: "vaneSocketShadow",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.CylinderGeometry(0.115, 0.13, 0.055, 10), P.BRASS, {
    at: [0, 6.795, 0],
    name: "vaneSocketBrass",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.CylinderGeometry(0.078, 0.09, 0.055, 8), P.WOOD_LIGHT, {
    at: [0, 6.845, 0],
    name: "vaneSocketCap",
    group: "stage2-weather-vane",
  });

  // Main mast, with collars that make it feel assembled rather than printed.
  b.part(new THREE.CylinderGeometry(0.027, 0.035, 0.34, 8), P.BRASS, {
    at: [0, 6.985, 0],
    name: "vaneMast",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.035, 10), P.WOOD_DARK, {
    at: [0, 6.9, 0.01],
    dir: [0, 0, 1],
    name: "arrowPivotBack",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.045, 10), P.BRASS, {
    at: [0, 6.9, 0.055],
    dir: [0, 0, 1],
    name: "arrowPivotFront",
    group: "stage2-weather-vane",
  });

  // Front-facing arrow. The dark under-rod gives the small brass arrow a readable outline.
  rod(
    "arrowDarkUnderRod",
    [-0.255, 6.9, 0.085],
    [0.205, 6.9, 0.085],
    0.027,
    P.WOOD_DARK,
  );

  rod(
    "arrowBrassRod",
    [-0.255, 6.9, 0.105],
    [0.205, 6.9, 0.105],
    0.014,
    P.BRASS,
  );

  b.spike([0.19, 6.9, 0.105], [1, 0, 0], 0.115, 0.042, {
    color: P.BRASS,
    name: "arrowHead",
    group: "stage2-weather-vane",
  });

  // A curled flourish replaces the usual flat tail fin.
  b.sweep(
    bezier(
      [-0.235, 6.9, 0.105],
      [-0.305, 6.91, 0.105],
      [-0.32, 6.98, 0.105],
      [-0.245, 7.025, 0.105],
    ),
    0.012,
    {
      color: P.WOOD_DARK,
      section: { ngon: 6 },
      caps: "round",
      name: "arrowTailCurl",
      group: "stage2-weather-vane",
    },
  );

  // A small cheerful pennant hanging from the tail.
  b.extrude(
    [
      [0, 0],
      [0.12, 0],
      [0.095, -0.065],
      [0.035, -0.105],
      [0, -0.09],
    ],
    {
      at: [-0.235, 6.895, 0.112],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.006,
      smoothing: 1,
      color: P.FLOWER_PINK,
      name: "vanePennant",
      group: "stage2-weather-vane",
    },
  );

  b.part(new THREE.SphereGeometry(0.014, 8, 5), P.BRASS, {
    at: [-0.235, 6.9, 0.125],
    name: "pennantGrommet",
    group: "stage2-weather-vane",
  });

  // Four broad, low-poly blades form a miniature windmill emblem above the arrow.
  const bladeOutline: [number, number][] = [
    [-0.016, 0.014],
    [0.018, 0.014],
    [0.033, 0.052],
    [0.019, 0.101],
    [-0.018, 0.083],
    [-0.031, 0.042],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = (45 + i * 90) * (Math.PI / 180);
    const radial: [number, number, number] = [
      Math.cos(angle),
      Math.sin(angle),
      0,
    ];
    const tangent: [number, number, number] = [
      -Math.sin(angle),
      Math.cos(angle),
      0,
    ];

    b.extrude(bladeOutline, {
      at: [0, 7.0, 0.035],
      x: tangent,
      y: radial,
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: i % 2 === 0 ? P.WOOD_DARK : P.WOOD,
      name: `miniVaneBlade${i}`,
      group: "stage2-weather-vane",
    });

    // A short warm edge rib gives each blade a crafted wooden face.
    const ribA: [number, number, number] = [
      radial[0] * 0.027 - tangent[0] * 0.008,
      7.0 + radial[1] * 0.027 - tangent[1] * 0.008,
      0.058,
    ];
    const ribB: [number, number, number] = [
      radial[0] * 0.085 - tangent[0] * 0.008,
      7.0 + radial[1] * 0.085 - tangent[1] * 0.008,
      0.058,
    ];
    rod(`miniBladeRib${i}`, ribA, ribB, 0.006, P.WOOD_LIGHT);
  }

  // Central cap and four visible rivets finish the tiny silhouette.
  b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.034, 10), P.WOOD_DARK, {
    at: [0, 7.0, 0.062],
    dir: [0, 0, 1],
    name: "miniVaneHubDark",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.045, 10), P.BRASS, {
    at: [0, 7.0, 0.089],
    dir: [0, 0, 1],
    name: "miniVaneHubBrass",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.SphereGeometry(0.026, 10, 6), P.BRASS, {
    at: [0, 7.0, 0.118],
    name: "miniVaneHubKnob",
    group: "stage2-weather-vane",
  });

  for (let i = 0; i < 4; i++) {
    const angle = (45 + i * 90) * (Math.PI / 180);
    b.part(
      new THREE.SphereGeometry(0.009, 7, 5),
      P.BRASS,
      {
        at: [
          Math.cos(angle) * 0.047,
          7.0 + Math.sin(angle) * 0.047,
          0.108,
        ],
        name: `miniVaneRivet${i}`,
        group: "stage2-weather-vane",
      },
    );
  }

  // A tiny finial above the emblem keeps the roofline playful and finished.
  b.part(new THREE.CylinderGeometry(0.014, 0.018, 0.055, 7), P.BRASS, {
    at: [0, 7.065, 0.02],
    name: "vaneFinialStem",
    group: "stage2-weather-vane",
  });

  b.part(new THREE.SphereGeometry(0.025, 8, 5), P.FLOWER_PINK, {
    at: [0, 7.098, 0.02],
    name: "vaneFinialFlower",
    group: "stage2-weather-vane",
  });
}
    return addRoofWeatherVane;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addSailLattice(b: Builder) {
  const hubY = 4.35;
  const hubZ = 1.68;
  const sailFaceZ = 1.79;

  const pointOnBlade = (
    angleDeg: number,
    along: number,
    across: number,
    z = sailFaceZ,
  ) => {
    const a = THREE.MathUtils.degToRad(angleDeg);
    const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const cross = new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
    return new THREE.Vector3(0, hubY, z)
      .addScaledVector(radial, along)
      .addScaledVector(cross, across);
  };

  const brace = (
    angleDeg: number,
    aAlong: number,
    aAcross: number,
    bAlong: number,
    bAcross: number,
    color: string,
    name: string,
  ) => {
    const a = pointOnBlade(angleDeg, aAlong, aAcross);
    const c = pointOnBlade(angleDeg, bAlong, bAcross);
    b.rod(a, c, 0.026, {
      color,
      section: { ngon: 6 },
      caps: "flat",
      name,
      flat: true,
    });

    // A narrow raised highlight makes the painted timber read as hand-finished.
    const hiA = pointOnBlade(angleDeg, aAlong + 0.05, aAcross, sailFaceZ + 0.03);
    const hiB = pointOnBlade(angleDeg, bAlong - 0.05, bAcross, sailFaceZ + 0.03);
    b.rod(hiA, hiB, 0.008, {
      color: PALETTE.WOOD_LIGHT,
      section: { ngon: 6 },
      caps: "flat",
      name: `${name}Highlight`,
      flat: true,
    });
  };

  const rivet = (angleDeg: number, along: number, across: number, index: string) => {
    const at = pointOnBlade(angleDeg, along, across, sailFaceZ + 0.055);
    b.part(new THREE.SphereGeometry(0.038, 8, 5), PALETTE.BRASS, {
      at,
      name: `s22SailRivet${index}`,
      flat: true,
    });
  };

  // Two crossed timber braces on every sail, with tiny raised highlight strips.
  for (let i = 0; i < 4; i++) {
    const angle = 45 + i * 90;

    brace(angle, 0.34, -0.07, 1.66, 0.145, PALETTE.WOOD_DARK, `s22Lattice${i}A`);
    brace(angle, 0.34, 0.07, 1.66, -0.145, PALETTE.WOOD_DARK, `s22Lattice${i}B`);

    // Warm fasteners at the roots, tips, and crossing make the lattice feel assembled.
    rivet(angle, 0.35, -0.07, `${i}A`);
    rivet(angle, 1.66, 0.145, `${i}B`);
    rivet(angle, 0.35, 0.07, `${i}C`);
    rivet(angle, 1.66, -0.145, `${i}D`);
    rivet(angle, 1.0, 0, `${i}E`);
  }

  // A short axle collar connects the requested attachment point to the visible front of
  // the already-built rounded hub cap.
  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.38, 8), PALETTE.WOOD_DARK, {
    at: [0, hubY, 2.02],
    dir: [0, 0, 1],
    name: "s22EmblemMount",
    flat: true,
  });

  const emblemZ = 2.215;

  // Thin dark medallion behind the rosette.
  b.part(new THREE.CylinderGeometry(0.295, 0.295, 0.045, 16), PALETTE.WOOD_DARK, {
    at: [0, hubY, emblemZ],
    dir: [0, 0, 1],
    name: "s22EmblemBacking",
    flat: true,
  });

  // Slightly raised outer ring keeps the rosette readable against the timber cap.
  b.part(new THREE.TorusGeometry(0.255, 0.018, 6, 16), PALETTE.WOOD_LIGHT, {
    at: [0, hubY, emblemZ + 0.034],
    dir: [0, 0, 1],
    name: "s22EmblemRing",
    flat: true,
  });

  // Four broad, low-poly cream petals. Flattened spheres preserve the chunky puppet look.
  const petals: Array<[number, number, number, number]> = [
    [0, 0.115, 0.105, 0.145],
    [0, -0.115, 0.105, 0.145],
    [-0.115, 0, 0.145, 0.105],
    [0.115, 0, 0.145, 0.105],
  ];

  petals.forEach(([x, y, sx, sy], i) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), PALETTE.CANVAS, {
      at: [x, hubY + y, emblemZ + 0.074],
      scale: [sx, sy, 0.042],
      name: `s22RosettePetal${i}`,
      flat: true,
    });
  });

  // Brass flower centre with a tiny pale glint.
  b.part(new THREE.CylinderGeometry(0.073, 0.073, 0.065, 10), PALETTE.BRASS, {
    at: [0, hubY, emblemZ + 0.098],
    dir: [0, 0, 1],
    name: "s22RosetteCenter",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.022, 7, 5), PALETTE.CANVAS, {
    at: [-0.022, hubY + 0.028, emblemZ + 0.14],
    name: "s22RosetteGlint",
    flat: true,
  });
}
    return addSailLattice;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addDoorSign(b: Builder) {
  type P2 = [number, number];

  const oval = (rx: number, ry: number, steps = 16): P2[] => {
    const points: P2[] = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      points.push([Math.cos(a) * rx, Math.sin(a) * ry]);
    }
    return points;
  };

  const roundedRect = (w: number, h: number, r: number): P2[] => {
    const points: P2[] = [];
    const corners = [
      [w / 2 - r, h / 2 - r, 0],
      [-w / 2 + r, h / 2 - r, 90],
      [-w / 2 + r, -h / 2 + r, 180],
      [w / 2 - r, -h / 2 + r, 270],
    ] as const;

    for (const [cx, cy, start] of corners) {
      for (let i = 0; i <= 3; i++) {
        const a = ((start + i * 30) * Math.PI) / 180;
        points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    }
    return points;
  };

  const rotate2 = (points: P2[], degrees: number): P2[] => {
    const a = (degrees * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return points.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  };

  const slab = (
    name: string,
    outline: P2[],
    at: [number, number, number],
    thickness: number,
    color: string,
    bevel = 0,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      smoothing: 1,
      color,
      name,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Door plaque: a layered oval with a raised four-sail windmill pictogram.

  slab("doorSignBack", oval(0.285, 0.145, 20), [0, 1.05, 1.595], 0.045, PALETTE.WOOD_DARK, 0.012);
  slab("doorSignBrassRim", oval(0.265, 0.13, 20), [0, 1.05, 1.62], 0.032, PALETTE.BRASS, 0.008);
  slab("doorSignCreamFace", oval(0.235, 0.105, 20), [0, 1.05, 1.642], 0.018, PALETTE.CANVAS, 0.006);

  const blade = [
    [-0.018, 0.018],
    [0.03, 0.018],
    [0.073, 0.125],
    [0.02, 0.17],
    [-0.026, 0.09],
  ] as P2[];

  for (let i = 0; i < 4; i++) {
    slab(
      `doorSignBlade${i}`,
      rotate2(blade, i * 90),
      [0, 1.05, 1.658],
      0.012,
      i % 2 === 0 ? PALETTE.WINDOW : PALETTE.WOOD_DARK,
      0.003,
    );
  }

  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 10), PALETTE.BRASS, {
    at: [0, 1.05, 1.675],
    dir: [0, 0, 1],
    name: "doorSignHub",
  });

  // Small chunky handle and a dark mounting rosette, kept low and to the viewer's right.
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.022, 10), PALETTE.WOOD_DARK, {
    at: [0.29, 0.89, 1.602],
    dir: [0, 0, 1],
    name: "doorHandleRosette",
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 8), PALETTE.BRASS, {
    at: [0.29, 0.89, 1.64],
    dir: [0, 0, 1],
    name: "doorHandleStem",
  });
  b.part(new THREE.SphereGeometry(0.052, 10, 7), PALETTE.BRASS, {
    at: [0.29, 0.89, 1.702],
    name: "doorHandle",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Warm inner window dressing. The dark rounded panel makes a strong inset frame while the four panes sit above it.

  slab(
    "windowInnerRoundedFrame",
    roundedRect(0.72, 0.59, 0.075),
    [0, 3.45, 1.488],
    0.035,
    PALETTE.WOOD_DARK,
    0.009,
  );

  const pane = (name: string, x: number, y: number, color: string) => {
    const part = slab(
      name,
      roundedRect(0.275, 0.215, 0.025),
      [x, y, 1.52],
      0.025,
      color,
      0.008,
    );
    glow(part, 1.35);
    return part;
  };

  pane("windowAmberPaneTL", -0.155, 3.312, PALETTE.FLOWER_YELLOW);
  pane("windowAmberPaneTR", 0.155, 3.312, PALETTE.CANVAS_SHADE);
  pane("windowAmberPaneBL", -0.155, 3.588, PALETTE.CANVAS_SHADE);
  pane("windowAmberPaneBR", 0.155, 3.588, PALETTE.FLOWER_YELLOW);

  // Raised muntins restore a tidy four-pane rhythm and leave a little dark breathing space.
  b.part(new THREE.BoxGeometry(0.045, 0.535, 0.035), PALETTE.WOOD_LIGHT, {
    at: [0, 3.45, 1.548],
    name: "windowInnerVerticalMuntin",
  });
  b.part(new THREE.BoxGeometry(0.64, 0.045, 0.035), PALETTE.WOOD_LIGHT, {
    at: [0, 3.45, 1.549],
    name: "windowInnerHorizontalMuntin",
  });

  // A tiny brass curtain rod and rounded finials.
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.66, 7), PALETTE.BRASS, {
    at: [0, 3.748, 1.56],
    dir: [1, 0, 0],
    name: "curtainRod",
  });
  for (const x of [-0.345, 0.345]) {
    b.part(new THREE.SphereGeometry(0.026, 8, 6), PALETTE.BRASS, {
      at: [x, 3.748, 1.56],
      name: x < 0 ? "curtainRodFinialL" : "curtainRodFinialR",
    });
  }

  // Soft triangular curtains with a small scalloped lower edge.
  const curtainL: P2[] = [
    [-0.34, 0.255],
    [-0.225, 0.255],
    [-0.225, 0.105],
    [-0.245, 0.055],
    [-0.27, 0.085],
    [-0.295, 0.05],
    [-0.34, 0.09],
  ];
  const curtainR: P2[] = curtainL.map(([x, y]) => [-x, y]);

  slab("curtainL", curtainL, [0, 3.45, 1.568], 0.018, PALETTE.CANVAS, 0.004);
  slab("curtainR", curtainR, [0, 3.45, 1.568], 0.018, PALETTE.CANVAS, 0.004);

  // Pink tiebacks and tiny brass tieback pins.
  for (const side of [-1, 1]) {
    const x = side * 0.245;
    b.part(new THREE.SphereGeometry(0.031, 8, 6), PALETTE.FLOWER_PINK, {
      at: [x, 3.54, 1.588],
      name: side < 0 ? "curtainTieL" : "curtainTieR",
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 5), PALETTE.BRASS, {
      at: [side * 0.245, 3.54, 1.605],
      name: side < 0 ? "curtainPinL" : "curtainPinR",
    });
  }

  // A pair of small painted highlights on the glowing glass, like reflected afternoon light.
  for (const side of [-1, 1]) {
    slab(
      side < 0 ? "windowReflectionL" : "windowReflectionR",
      [
        [-0.018, -0.055],
        [0.018, -0.055],
        [0.018, 0.055],
        [-0.018, 0.055],
      ],
      [side * 0.205, 3.35, 1.568],
      0.008,
      PALETTE.WINDOW_LIGHT,
      0.002,
    );
  }
}
    return addDoorSign;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addFlowerBoxes(b: Builder) {
  const boxXs = [-1.12, -0.62];
  const flowerAngles = [0, 72, 144, 216, 288];

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, name, ...options });

  const leaf = (
    x: number,
    y: number,
    z: number,
    size: number,
    angle: number,
    name: string,
  ) => {
    const r = (angle * Math.PI) / 180;
    const along: [number, number, number] = [Math.cos(r), Math.sin(r), 0];
    const across: [number, number, number] = [-Math.sin(r), Math.cos(r), 0];

    b.extrude(
      [
        [0, 0],
        [size * 0.62, size * 0.12],
        [size, size * 0.42],
        [size * 0.55, size * 0.78],
        [size * 0.08, size * 0.54],
        [-size * 0.08, size * 0.16],
      ],
      {
        at: [x, y, z],
        x: along,
        y: across,
        thickness: 0.014,
        bevel: 0.004,
        smoothing: 1,
        color: PALETTE.LEAF,
        name,
      },
    );

    // A tiny raised midrib gives the flat leaf a handmade, low-poly highlight.
    b.rod(
      [x + along[0] * size * 0.08, y + along[1] * size * 0.08, z + 0.012],
      [x + along[0] * size * 0.76, y + along[1] * size * 0.76, z + 0.012],
      0.006,
      {
        color: PALETTE.WOOD_LIGHT,
        section: { ngon: 5 },
        name: `${name}Rib`,
      },
    );
  };

  const flower = (
    x: number,
    y: number,
    z: number,
    petalColor: string,
    centerColor: string,
    index: number,
  ) => {
    const petalGeometry = new THREE.SphereGeometry(1, 7, 4);

    for (let i = 0; i < flowerAngles.length; i++) {
      const a = (flowerAngles[i] * Math.PI) / 180;
      const px = x + Math.sin(a) * 0.052;
      const py = y + Math.cos(a) * 0.052;

      part(
        petalGeometry,
        petalColor,
        [px, py, z],
        `flower${index}Petal${i}`,
        {
          scale: [0.043, 0.061, 0.024],
          rotation: [0, 0, flowerAngles[i]],
        },
      );
    }

    part(
      new THREE.SphereGeometry(0.044, 8, 5),
      centerColor,
      [x, y, z + 0.026],
      `flower${index}Center`,
    );

    part(
      new THREE.SphereGeometry(0.017, 6, 4),
      PALETTE.WOOD_DARK,
      [x, y + 0.004, z + 0.059],
      `flower${index}CenterDot`,
    );
  };

  // A continuous mounting rail makes the two boxes feel fastened to the balcony
  // instead of floating in front of it.
  part(
    new THREE.BoxGeometry(1.18, 0.09, 0.09),
    PALETTE.WOOD_DARK,
    [-0.87, 5.39, 1.415],
    "flowerBoxMountRail",
  );

  boxXs.forEach((cx, boxIndex) => {
    const tag = boxIndex === 0 ? "Left" : "Right";

    // Deep planter body, warm lip, dark soil, and a lower bevel-like strip.
    part(
      new THREE.BoxGeometry(0.43, 0.22, 0.27),
      PALETTE.WOOD_LIGHT,
      [cx, 5.365, 1.425],
      `flowerBox${tag}`,
    );
    part(
      new THREE.BoxGeometry(0.49, 0.055, 0.31),
      PALETTE.WOOD_DARK,
      [cx, 5.49, 1.425],
      `flowerBox${tag}TopLip`,
    );
    part(
      new THREE.BoxGeometry(0.35, 0.035, 0.205),
      PALETTE.WOOD_DARK,
      [cx, 5.515, 1.425],
      `flowerBox${tag}Soil`,
    );
    part(
      new THREE.BoxGeometry(0.45, 0.055, 0.29),
      PALETTE.WOOD,
      [cx, 5.255, 1.425],
      `flowerBox${tag}LowerBand`,
    );

    // Three vertical slats and four chunky corner studs on the front face.
    for (let i = -1; i <= 1; i++) {
      part(
        new THREE.BoxGeometry(0.035, 0.17, 0.025),
        i === 0 ? PALETTE.WOOD_DARK : PALETTE.WOOD,
        [cx + i * 0.135, 5.365, 1.568],
        `flowerBox${tag}Slat${i + 2}`,
      );
    }

    for (const sx of [-0.19, 0.19]) {
      for (const sy of [5.285, 5.465]) {
        part(
          new THREE.SphereGeometry(0.018, 6, 4),
          PALETTE.BRASS,
          [cx + sx, sy, 1.585],
          `flowerBox${tag}Rivet${sx < 0 ? "L" : "R"}${sy < 5.4 ? "B" : "T"}`,
        );
      }
    }

    // Two small wooden brackets descend behind each planter.
    for (const dx of [-0.15, 0.15]) {
      b.rod(
        [cx + dx, 5.29, 1.29],
        [cx + dx, 5.16, 1.42],
        0.026,
        {
          color: PALETTE.WOOD_DARK,
          section: { ngon: 5 },
          name: `flowerBox${tag}Bracket${dx < 0 ? "L" : "R"}`,
        },
      );
      part(
        new THREE.SphereGeometry(0.035, 6, 4),
        PALETTE.BRASS,
        [cx + dx, 5.155, 1.42],
        `flowerBox${tag}BracketCap${dx < 0 ? "L" : "R"}`,
      );
    }

    // Low foliage spills over the front and sides of the soil.
    leaf(cx - 0.16, 5.515, 1.54, 0.17, -62, `foliage${tag}A`);
    leaf(cx - 0.07, 5.535, 1.56, 0.19, -25, `foliage${tag}B`);
    leaf(cx + 0.08, 5.525, 1.55, 0.18, 25, `foliage${tag}C`);
    leaf(cx + 0.17, 5.505, 1.54, 0.16, 65, `foliage${tag}D`);
    leaf(cx - 0.02, 5.555, 1.57, 0.15, 2, `foliage${tag}E`);

    // Simple chunky stems, deliberately visible between the leaves.
    const flowerXs = [cx - 0.125, cx, cx + 0.125];
    const flowerYs = [5.555, 5.575, 5.555];
    const flowerZs = [1.585, 1.59, 1.585];

    for (let i = 0; i < flowerXs.length; i++) {
      b.rod(
        [flowerXs[i], 5.51, 1.49],
        [flowerXs[i], flowerYs[i] - 0.035, flowerZs[i]],
        0.012,
        {
          color: PALETTE.LEAF,
          section: { ngon: 5 },
          name: `stem${tag}${i}`,
        },
      );

      const pink = (boxIndex + i) % 2 === 0;
      flower(
        flowerXs[i],
        flowerYs[i],
        flowerZs[i],
        pink ? PALETTE.FLOWER_PINK : PALETTE.FLOWER_YELLOW,
        pink ? PALETTE.FLOWER_YELLOW : PALETTE.FLOWER_PINK,
        boxIndex * 3 + i,
      );
    }

    // Two smaller buds fill the gaps and make the boxes look genuinely overflowing.
    for (let i = 0; i < 2; i++) {
      const bx = cx + (i === 0 ? -0.19 : 0.19);
      const by = 5.565 + i * 0.012;
      const bz = 1.565;

      b.rod(
        [bx, 5.505, 1.49],
        [bx, by - 0.025, bz],
        0.009,
        {
          color: PALETTE.LEAF,
          section: { ngon: 5 },
          name: `budStem${tag}${i}`,
        },
      );
      part(
        new THREE.SphereGeometry(0.043, 7, 5),
        i === 0 ? PALETTE.FLOWER_PINK : PALETTE.FLOWER_YELLOW,
        [bx, by, bz],
        `bud${tag}${i}`,
        { scale: [0.72, 1, 0.62] },
      );
    }
  });
}
    return addFlowerBoxes;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addBalconyLantern(b: Builder) {
  const C = PALETTE;

  const rod = (
    name: string,
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) =>
    b.rod(a, z, radius, {
      color,
      name,
      section: { ngon: 6 },
    });

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
    });

  // ---------------------------------------------------------------------------
  // Balcony lantern: a bracket, hanging stem, faceted lantern body, glass,
  // mullions, caps, and a tiny glowing windmill-shaped glass mark.
  // ---------------------------------------------------------------------------

  rod(
    "s2LanternBracketArm",
    [1.12, 5.25, 1.08],
    [1.12, 5.25, 1.31],
    0.045,
    C.WOOD_DARK,
  );
  rod(
    "s2LanternBracketDrop",
    [1.12, 5.25, 1.31],
    [1.12, 5.08, 1.31],
    0.042,
    C.WOOD_DARK,
  );
  rod(
    "s2LanternBracketBrace",
    [1.12, 5.19, 1.13],
    [1.12, 5.07, 1.29],
    0.025,
    C.WOOD_LIGHT,
  );

  cylinder("s2LanternHangerCollar", 0.085, 0.06, [1.12, 5.065, 1.31], C.BRASS, 8);
  rod(
    "s2LanternHangerStem",
    [1.12, 5.04, 1.31],
    [1.12, 4.99, 1.31],
    0.025,
    C.BRASS,
  );

  const lanternTop = cylinder(
    "s2LanternTopCap",
    0.145,
    0.07,
    [1.12, 5.005, 1.31],
    C.BRASS,
    8,
  );
  const lanternGlass = cylinder(
    "s2LanternGlass",
    0.112,
    0.235,
    [1.12, 4.85, 1.31],
    C.WINDOW_LIGHT,
    8,
  );
  const lanternBottom = cylinder(
    "s2LanternBottomCap",
    0.132,
    0.065,
    [1.12, 4.705, 1.31],
    C.BRASS,
    8,
  );

  // A dark octagonal frame remains visible around the luminous glass.
  cylinder("s2LanternOuterBody", 0.135, 0.255, [1.12, 4.85, 1.31], C.WOOD_DARK, 8);

  // Re-seat the smaller glowing glass in front of the dark body.
  const frontGlass = b.part(
    new THREE.CylinderGeometry(0.108, 0.108, 0.22, 8),
    C.WINDOW_LIGHT,
    {
      at: [1.12, 4.85, 1.31],
      name: "s2LanternInnerGlass",
    },
  );

  // Four chunky corner uprights, intentionally a little irregular in colour.
  const cornerPosts: [number, number, number][] = [
    [1.02, 4.85, 1.23],
    [1.22, 4.85, 1.23],
    [1.02, 4.85, 1.39],
    [1.22, 4.85, 1.39],
  ];
  cornerPosts.forEach((p, i) => {
    rod(
      `s2LanternCornerPost${i}`,
      [p[0], 4.72, p[2]],
      [p[0], 4.98, p[2]],
      0.018,
      i % 2 === 0 ? C.WOOD_DARK : C.WOOD_LIGHT,
    );
  });

  // Warm centre ember.
  const ember = b.part(new THREE.SphereGeometry(0.045, 8, 6), C.FLOWER_YELLOW, {
    at: [1.12, 4.85, 1.31],
    name: "s2LanternEmber",
  });

  const lanternGlyph = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 7 L37 24 L54 18 L42 32 L54 46 L37 40 L32 57 L27 40 L10 46 L22 32 L10 18 L27 24 Z"
        fill="#fff0c5" stroke="#9a5260" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="5" fill="#d69a43"/>
    </svg>`,
    { size: 96 },
  );

  const glyph = b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    at: [1.12, 4.85, 1.425],
    dir: [0, 0, 1],
    axis: "z",
    texture: lanternGlyph,
    name: "s2LanternWindmillGlyph",
  });

  // Slightly exaggerated glow suits the toy-like evening-lantern read.
  glow(frontGlass, 0.85);
  glow(ember, 1.8);
  glow(glyph, 1.2);

  // Small pointed brass finial beneath the lantern.
  b.spike(
    [1.12, 4.67, 1.31],
    [0, -1, 0],
    0.075,
    0.035,
    { color: C.BRASS, name: "s2LanternBottomFinial" },
  );

  // ---------------------------------------------------------------------------
  // Rear maintenance ladder: two sloping rails following the tail beam,
  // five broad rungs, paired rivets, and a brass end cap.
  // ---------------------------------------------------------------------------

  const railStartY = 5.55;
  const railStartZ = -0.67;
  const railEndY = 5.29;
  const railEndZ = -1.98;
  const railX = 0.235;
  const ladderDepth = -0.13;

  rod(
    "s2TailLadderRailL",
    [-railX, railStartY, railStartZ + ladderDepth],
    [-railX, railEndY, railEndZ + ladderDepth],
    0.035,
    C.WOOD_LIGHT,
  );
  rod(
    "s2TailLadderRailR",
    [railX, railStartY, railStartZ + ladderDepth],
    [railX, railEndY, railEndZ + ladderDepth],
    0.035,
    C.WOOD_LIGHT,
  );

  const rungTs = [0.12, 0.3, 0.48, 0.66, 0.84];
  rungTs.forEach((t, i) => {
    const y = railStartY + (railEndY - railStartY) * t;
    const z = railStartZ + (railEndZ - railStartZ) * t + ladderDepth;
    rod(
      `s2TailLadderRung${i}`,
      [-railX - 0.015, y, z],
      [railX + 0.015, y, z],
      0.029,
      C.WOOD_DARK,
    );

    // Brass nail heads sit on the rear-facing side of each rung.
    for (const side of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.026, 6, 4), C.BRASS, {
        at: [side * railX, y, z - 0.035],
        name: `s2TailLadderRivet${i}${side > 0 ? "L" : "R"}`,
      });
    }
  });

  // Broad brass shoes at the two upper rail sockets.
  for (const side of [-1, 1]) {
    cylinder(
      `s2TailLadderUpperSocket${side > 0 ? "L" : "R"}`,
      0.062,
      0.055,
      [side * railX, railStartY, railStartZ + ladderDepth - 0.025],
      C.BRASS,
      8,
      [0, 0, 1],
    );
  }

  // A friendly oversized cap at the lower end of the ladder.
  b.part(new THREE.SphereGeometry(0.095, 8, 6), C.BRASS, {
    at: [0, railEndY, railEndZ + ladderDepth - 0.02],
    name: "s2TailLadderEndCap",
  });
  cylinder(
    "s2TailLadderEndBand",
    0.09,
    0.07,
    [0, railEndY + 0.015, railEndZ + ladderDepth - 0.02],
    C.WOOD_DARK,
    8,
    [0, 0, 1],
  );
}
    return addBalconyLantern;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addRoofMoss(b: Builder) {
  const MOSS_DARK = "#3f754a";

  const roofBase = new THREE.Vector3(0.92, 5.43, 0.88);
  const roofNormal = new THREE.Vector3(0.55, 0.2, 0.8).normalize();

  // A tangent frame on the sloping roof: local x runs around the eave,
  // local y climbs the roof, and x × y points out from the roof.
  const roofY = new THREE.Vector3(0, 1, 0)
    .addScaledVector(roofNormal, -roofNormal.y)
    .normalize();
  const roofX = roofY.clone().cross(roofNormal).normalize();

  const scaledOutline = (
    outline: readonly [number, number][],
    sx: number,
    sy: number,
  ): [number, number][] => outline.map(([x, y]) => [x * sx, y * sy]);

  const mossSilhouette: [number, number][] = [
    [-0.24, -0.045],
    [0.24, -0.045],
    [0.22, 0.035],
    [0.15, 0.105],
    [0.09, 0.055],
    [0.025, 0.22],
    [-0.035, 0.085],
    [-0.11, 0.17],
    [-0.17, 0.06],
    [-0.23, 0.105],
  ];

  const mossTuft: [number, number][] = [
    [-0.065, -0.025],
    [0.065, -0.025],
    [0.058, 0.045],
    [0.028, 0.12],
    [-0.005, 0.24],
    [-0.042, 0.115],
    [-0.062, 0.05],
  ];

  const roofPoint = (dx: number, dy: number, lift: number) =>
    roofBase
      .clone()
      .addScaledVector(roofX, dx)
      .addScaledVector(roofY, dy)
      .addScaledVector(roofNormal, lift);

  const mossPatches = [
    { x: -0.29, y: -0.005, sx: 1.0, sy: 0.82 },
    { x: 0.0, y: 0.018, sx: 0.92, sy: 0.72 },
    { x: 0.29, y: -0.012, sx: 0.82, sy: 0.68 },
  ];

  // Dark underlayers make the bright moss read as a chunky, hand-cut silhouette.
  for (let i = 0; i < mossPatches.length; i++) {
    const patch = mossPatches[i];
    b.extrude(scaledOutline(mossSilhouette, patch.sx, patch.sy), {
      at: roofPoint(patch.x, patch.y, 0.022),
      x: roofX,
      y: roofY,
      thickness: 0.055,
      bevel: 0.008,
      color: MOSS_DARK,
      name: `roofMossBacking${i}`,
    });

    b.extrude(scaledOutline(mossSilhouette, patch.sx * 0.82, patch.sy * 0.78), {
      at: roofPoint(patch.x + 0.01, patch.y + 0.015, 0.058),
      x: roofX,
      y: roofY,
      thickness: 0.035,
      bevel: 0.006,
      color: PALETTE.LEAF,
      name: `roofMossPatch${i}`,
    });
  }

  // A few tall, separate blades break up the continuous strip without making a
  // smooth green covering.
  const bladePlaces = [
    [-0.36, 0.02, 1.0],
    [-0.16, 0.055, 0.78],
    [0.08, 0.038, 0.92],
    [0.31, 0.025, 0.72],
  ] as const;

  for (let i = 0; i < bladePlaces.length; i++) {
    const [x, y, scale] = bladePlaces[i];
    b.extrude(scaledOutline(mossTuft, scale, scale), {
      at: roofPoint(x, y, 0.09),
      x: roofX,
      y: roofY,
      thickness: 0.028,
      bevel: 0.004,
      color: i % 2 === 0 ? PALETTE.LEAF : MOSS_DARK,
      name: `roofMossBlade${i}`,
    });
  }

  // Three low-poly moss knobs soften the pointed blades and give the eave a
  // playful Animal Crossing silhouette.
  const knobPlaces = [
    [-0.42, 0.01, 0.055],
    [0.0, 0.025, 0.065],
    [0.37, 0.005, 0.05],
  ] as const;

  for (let i = 0; i < knobPlaces.length; i++) {
    const [x, y, radius] = knobPlaces[i];
    const p = roofPoint(x, y, 0.105);
    b.part(new THREE.SphereGeometry(radius, 7, 5), i === 1 ? MOSS_DARK : PALETTE.LEAF, {
      at: p,
      name: `roofMossKnob${i}`,
    });
  }

  // --------------------------------------------------------------------------------
  // Friendly milestone plaque on the lower-left front facade.

  const plaqueAt = new THREE.Vector3(-0.92, 1.58, 1.37);
  const plaqueNormal = new THREE.Vector3(-0.22, 0.04, 0.97).normalize();
  const plaqueY = new THREE.Vector3(0, 1, 0);
  const plaqueX = new THREE.Vector3(plaqueNormal.z, 0, -plaqueNormal.x).normalize();

  const plaqueCenter = plaqueAt.clone().addScaledVector(plaqueNormal, 0.042);

  const outerPlaque: [number, number][] = [
    [-0.235, -0.285],
    [0.235, -0.285],
    [0.285, -0.205],
    [0.285, 0.17],
    [0.205, 0.275],
    [-0.205, 0.275],
    [-0.285, 0.17],
    [-0.285, -0.205],
  ];

  const innerPlaque: [number, number][] = [
    [-0.205, -0.245],
    [0.205, -0.245],
    [0.245, -0.17],
    [0.245, 0.14],
    [0.17, 0.235],
    [-0.17, 0.235],
    [-0.245, 0.14],
    [-0.245, -0.17],
  ];

  b.extrude(outerPlaque, {
    at: plaqueCenter,
    x: plaqueX,
    y: plaqueY,
    thickness: 0.095,
    bevel: 0.022,
    smoothing: 1,
    color: PALETTE.STUCCO_TRIM,
    name: "cornerMilestoneBorder",
  });

  b.extrude(innerPlaque, {
    at: plaqueCenter.clone().addScaledVector(plaqueNormal, 0.058),
    x: plaqueX,
    y: plaqueY,
    thickness: 0.038,
    bevel: 0.014,
    smoothing: 1,
    color: PALETTE.CANVAS,
    name: "cornerMilestoneFace",
  });

  // Four chunky brass fasteners give the plaque a built object feel.
  const rivetCorners = [
    [-0.215, -0.215],
    [0.215, -0.215],
    [0.215, 0.205],
    [-0.215, 0.205],
  ] as const;

  for (let i = 0; i < rivetCorners.length; i++) {
    const [x, y] = rivetCorners[i];
    const p = plaqueCenter
      .clone()
      .addScaledVector(plaqueX, x)
      .addScaledVector(plaqueY, y)
      .addScaledVector(plaqueNormal, 0.12);

    b.part(new THREE.SphereGeometry(0.026, 7, 5), PALETTE.BRASS, {
      at: p,
      name: `milestoneRivet${i}`,
    });
  }

  // A four-bladed brass windmill pictogram sits proud of the canvas.
  const iconCenter = plaqueCenter
    .clone()
    .addScaledVector(plaqueY, 0.018)
    .addScaledVector(plaqueNormal, 0.105);

  const iconBlade: [number, number][] = [
    [-0.025, -0.028],
    [0.025, -0.028],
    [0.092, 0.02],
    [0.105, 0.05],
    [0.055, 0.045],
    [0.004, 0.012],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const radial = plaqueX
      .clone()
      .multiplyScalar(Math.cos(angle))
      .add(plaqueY.clone().multiplyScalar(Math.sin(angle)))
      .normalize();
    const tangent = plaqueX
      .clone()
      .multiplyScalar(-Math.sin(angle))
      .add(plaqueY.clone().multiplyScalar(Math.cos(angle)))
      .normalize();

    b.extrude(iconBlade, {
      at: iconCenter,
      x: radial,
      y: tangent,
      thickness: 0.024,
      bevel: 0.005,
      color: PALETTE.BRASS,
      name: `milestoneWindmillBlade${i}`,
    });
  }

  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.035, 10), PALETTE.WOOD_DARK, {
    at: iconCenter.clone().addScaledVector(plaqueNormal, 0.02),
    dir: plaqueNormal,
    name: "milestoneWindmillHubDark",
  });

  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.045, 10), PALETTE.BRASS, {
    at: iconCenter.clone().addScaledVector(plaqueNormal, 0.052),
    dir: plaqueNormal,
    name: "milestoneWindmillHub",
  });

  // A tiny painted baseline under the icon makes it feel like a sign rather
  // than a loose ornament.
  b.rod(
    plaqueCenter
      .clone()
      .addScaledVector(plaqueX, -0.14)
      .addScaledVector(plaqueY, -0.17)
      .addScaledVector(plaqueNormal, 0.105),
    plaqueCenter
      .clone()
      .addScaledVector(plaqueX, 0.14)
      .addScaledVector(plaqueY, -0.17)
      .addScaledVector(plaqueNormal, 0.105),
    0.012,
    {
      color: PALETTE.STUCCO_TRIM,
      section: { ngon: 6 },
      name: "milestoneBaseline",
    },
  );
}
    return addRoofMoss;
  })(),
);
