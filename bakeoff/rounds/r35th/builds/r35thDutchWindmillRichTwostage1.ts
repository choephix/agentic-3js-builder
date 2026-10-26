import * as THREE from "three";
import { createBuilder, polyline } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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

  const tower = b.lathe(
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
      color: PALETTE.TOWER,
      name: "towerBody",
    },
  );

  cylinder("towerBase", 1.76, 0.22, [0, 0.11, 0], PALETTE.TOWER_SHADE, 8);
  cylinder("towerBaseTrim", 1.79, 0.075, [0, 0.27, 0], PALETTE.STUCCO_TRIM, 8);

  // Broad, friendly corner braces make the tapered silhouette legible.
  b.rod(
    [-1.38, 0.38, 0.73],
    [-1.14, 5.1, 0.82],
    0.065,
    {
      color: PALETTE.STUCCO_TRIM,
      name: "leftCornerTrim",
      section: { ngon: 6 },
    },
  );
  b.rod(
    [1.38, 0.38, 0.73],
    [1.14, 5.1, 0.82],
    0.065,
    {
      color: PALETTE.STUCCO_TRIM,
      name: "rightCornerTrim",
      section: { ngon: 6 },
    },
  );

  // A pair of low horizontal facade bands.
  box("lowerFacadeBand", [2.55, 0.1, 0.1], [0, 1.9, 1.43], PALETTE.STUCCO_TRIM);
  box("upperFacadeBand", [2.25, 0.09, 0.1], [0, 4.28, 1.29], PALETTE.STUCCO_TRIM);

  // The chunky arched front door.
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
    color: PALETTE.WOOD_DARK,
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

  box("doorStep", [1.18, 0.15, 0.42], [0, 0.075, 1.57], PALETTE.WOOD_LIGHT);
  box("doorLeftPlank", [0.035, 0.72, 0.025], [-0.2, 0.61, 1.59], PALETTE.TOWER_SHADE);
  box("doorRightPlank", [0.035, 0.72, 0.025], [0.2, 0.61, 1.59], PALETTE.TOWER_SHADE);

  // Front window: a wood surround, blue inset, and simple crossbars.
  box("windowFrame", [0.92, 0.82, 0.13], [0, 3.48, 1.35], PALETTE.WOOD_DARK);
  box("windowPane", [0.73, 0.63, 0.055], [0, 3.48, 1.43], PALETTE.WINDOW);
  box("windowCrossV", [0.065, 0.67, 0.075], [0, 3.48, 1.47], PALETTE.WOOD_LIGHT);
  box("windowCrossH", [0.76, 0.065, 0.075], [0, 3.48, 1.47], PALETTE.WOOD_LIGHT);

  // A smaller upper cap window.
  box("capWindowFrame", [0.57, 0.32, 0.1], [0, 5.34, 1.18], PALETTE.WOOD_DARK);
  box("capWindowPane", [0.41, 0.19, 0.045], [0, 5.34, 1.24], PALETTE.WINDOW_LIGHT);
  box("capWindowBar", [0.045, 0.23, 0.06], [0, 5.34, 1.27], PALETTE.WOOD_LIGHT);

  // Balcony and its octagonal rail.
  cylinder("balconyPlatform", 1.53, 0.18, [0, 5.3, 0], PALETTE.WOOD_DARK, 8);
  cylinder("balconyTop", 1.59, 0.075, [0, 5.41, 0], PALETTE.WOOD_LIGHT, 8);

  const postRadius = 1.42;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    cylinder(
      `balconyPost${i}`,
      0.055,
      0.48,
      [Math.cos(a) * postRadius, 5.64, Math.sin(a) * postRadius],
      PALETTE.WOOD_DARK,
      6,
    );
  }

  const railPoints: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    railPoints.push([Math.cos(a) * postRadius, 5.88, Math.sin(a) * postRadius]);
  }
  b.sweep(polyline(railPoints, { closed: true }), 0.055, {
    color: PALETTE.WOOD_DARK,
    caps: "none",
    section: { ngon: 6 },
    name: "balconyRail",
  });

  // The wooden rotating cap beneath the roof.
  cylinder("capBody", 1.25, 0.36, [0, 5.56, 0], PALETTE.WOOD, 8);
  cylinder("capLowerTrim", 1.33, 0.09, [0, 5.38, 0], PALETTE.WOOD_DARK, 8);
  cylinder("capUpperTrim", 1.29, 0.08, [0, 5.74, 0], PALETTE.WOOD_LIGHT, 8);

  // Large low-poly teal roof.
  b.part(new THREE.ConeGeometry(1.59, 1.38, 8), PALETTE.ROOF, {
    at: [0, 6.08, 0],
    name: "roof",
  });
  cylinder("roofEave", 1.68, 0.15, [0, 5.43, 0], PALETTE.ROOF_DARK, 8);
  cylinder("roofRidge", 0.22, 0.16, [0, 6.76, 0], PALETTE.WOOD_LIGHT, 8);

  // Rear tail beam and broad tail fin.
  b.rod(
    [0, 5.65, -0.36],
    [0, 5.25, -2.2],
    0.115,
    {
      color: PALETTE.WOOD_DARK,
      section: { ngon: 6 },
      name: "tailBeam",
    },
  );

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
      color: PALETTE.WOOD,
      name: "tailFin",
    },
  );
  box("tailFinStripe", [0.08, 1.05, 0.04], [0, 5.02, -2.28], PALETTE.STUCCO_TRIM);

  // Four broad sails. The dark trapezoids are the timber frames; cream panels sit just forward.
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
      color: PALETTE.WOOD_DARK,
      name: `sailFrame${i}`,
    });

    b.extrude(sailCanvasOutline, {
      at: [0, hubY, hubZ + 0.055],
      x: across,
      y: radial,
      thickness: 0.028,
      bevel: 0.006,
      color: PALETTE.CANVAS,
      name: "sailCanvas",
    });

    // A warm edge timber on each long side gives the blades a readable silhouette.
    const startA = new THREE.Vector3(...radial).multiplyScalar(0.12);
    const endA = new THREE.Vector3(...radial).multiplyScalar(2.42);
    const sideOffset = new THREE.Vector3(...across).multiplyScalar(0.245);
    const p0 = startA.clone().add(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p1 = endA.clone().add(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p2 = startA.clone().sub(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));
    const p3 = endA.clone().sub(sideOffset).add(new THREE.Vector3(0, hubY, hubZ + 0.1));

    b.rod(p0, p1, 0.035, {
      color: PALETTE.WOOD_LIGHT,
      section: { ngon: 6 },
      name: `sailEdge${i}A`,
    });
    b.rod(p2, p3, 0.035, {
      color: PALETTE.WOOD_LIGHT,
      section: { ngon: 6 },
      name: `sailEdge${i}B`,
    });
  }

  // Central axle, front hub collar, and rounded cap.
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.62, 10), PALETTE.WOOD_DARK, {
    at: [0, hubY, 1.55],
    dir: [0, 0, 1],
    name: "sailAxle",
  });
  b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12), PALETTE.BRASS, {
    at: [0, hubY, 1.79],
    dir: [0, 0, 1],
    name: "sailHub",
  });
  b.part(new THREE.SphereGeometry(0.27, 12, 8), PALETTE.WOOD_LIGHT, {
    at: [0, hubY, 1.93],
    name: "hubCap",
  });
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10), PALETTE.ROOF_DARK, {
    at: [0, hubY, 2.08],
    dir: [0, 0, 1],
    name: "hubFrontCap",
  });

  // Little timber corner blocks and an awning over the door.
  box("doorAwning", [1.2, 0.12, 0.44], [0, 1.45, 1.53], PALETTE.WOOD_DARK);
  box("doorAwningTop", [1.05, 0.06, 0.32], [0, 1.53, 1.54], PALETTE.WOOD_LIGHT);

  for (const side of [-1, 1]) {
    box(
      `balconySupport${side > 0 ? "L" : "R"}`,
      [0.11, 0.66, 0.11],
      [side * 1.12, 5.03, 0.82],
      PALETTE.WOOD_DARK,
    );
  }

  // A few large, deliberately simple facade stones make the lower tower feel hand-built.
  box("stonePatchLeft", [0.48, 0.22, 0.035], [-0.88, 0.62, 1.54], PALETTE.TOWER_SHADE);
  box("stonePatchRight", [0.62, 0.19, 0.035], [0.86, 1.08, 1.49], PALETTE.TOWER_SHADE);
  box("stonePatchHigh", [0.45, 0.17, 0.035], [0.7, 2.46, 1.43], PALETTE.TOWER_SHADE);

  for (const add of STAGE2) add(b);
  return b.root;
}
