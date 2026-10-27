import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered brick tower, gallery, teal cap, windows, door, flower boxes, and four broad wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const BRICK = "#c95b43";
  const BRICK_DARK = "#9f3f38";
  const BRICK_LIGHT = "#e47a59";
  const PLASTER = "#f4dfad";
  const PLASTER_LIGHT = "#fff0c9";
  const WOOD = "#75452e";
  const WOOD_DARK = "#4c2d25";
  const WOOD_LIGHT = "#a66a43";
  const TEAL = "#2f8d88";
  const TEAL_DARK = "#205c63";
  const BLUE = "#65b8c9";
  const BLUE_DARK = "#286b79";
  const WHITE = "#fff8dc";
  const GOLD = "#f5c45f";
  const GREEN = "#77a84d";
  const GREEN_DARK = "#47733d";
  const FLOWER_PINK = "#f38c8d";
  const FLOWER_YELLOW = "#f6cf62";
  const FLOWER_PURPLE = "#aa84cf";
  const INK = "#3d2930";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 12,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    rings = 6,
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, rings), color, {
      at,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { color, section: { ngon: 6 }, caps: "round" });

  const torus = (
    major: number,
    minor: number,
    color: string,
    at: [number, number, number],
    radialSegments = 12,
    tubularSegments = 6,
  ) =>
    b.part(
      new THREE.TorusGeometry(major, minor, tubularSegments, radialSegments),
      color,
      {
        at,
        rotation: [90, 0, 0],
        flat: true,
      },
    );

  // ------------------------------------------------------------------------------------------------
  // Main tower: two overlapping low-poly turned sections make the friendly striped brick/plaster body.

  b.lathe(
    [
      [0, 0],
      [0.74, 0],
      [0.75, 0.12],
      [0.69, 0.9],
      [0.64, 1.12],
      [0, 1.12],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: BRICK,
      name: "brick-foundation",
    },
  );

  b.lathe(
    [
      [0, 0.98],
      [0.69, 0.98],
      [0.63, 1.15],
      [0.58, 1.95],
      [0.53, 2.65],
      [0.51, 2.82],
      [0, 2.82],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: PLASTER,
      name: "plaster-tower",
    },
  );

  // Brick course rings and playful darker corner stones.
  for (const y of [0.18, 0.38, 0.58, 0.78, 0.98]) {
    torus(0.69 - y * 0.045, 0.018, BRICK_DARK, [0, y, 0], 12, 4);
  }

  for (const y of [1.25, 1.52, 1.79, 2.06, 2.33, 2.60]) {
    torus(0.60 - (y - 1.2) * 0.045, 0.012, PLASTER_LIGHT, [0, y, 0], 12, 4);
  }

  // Vertical brick accents around the lower tower.
  for (const side of [-1, 1]) {
    for (const z of [-0.42, 0, 0.42]) {
      box([0.07, 0.62, 0.035], BRICK_LIGHT, [side * 0.49, 0.62, z]);
    }
  }

  // Foundation plinth and a pale sill around the tower foot.
  cylinder(0.78, 0.12, BRICK_DARK, [0, 0.06, 0], 12);
  cylinder(0.70, 0.055, PLASTER_LIGHT, [0, 0.125, 0], 12);

  // ------------------------------------------------------------------------------------------------
  // Front door, arched-ish cap, knob, sign and stone steps.

  box([0.34, 0.58, 0.06], WOOD_DARK, [0, 0.38, 0.655]);
  box([0.27, 0.51, 0.025], WOOD, [0, 0.39, 0.691]);
  box([0.025, 0.47, 0.028], WOOD_DARK, [-0.075, 0.39, 0.708]);
  box([0.025, 0.47, 0.028], WOOD_DARK, [0.075, 0.39, 0.708]);
  box([0.25, 0.025, 0.028], WOOD_DARK, [0, 0.61, 0.708]);
  sphere(0.025, GOLD, [0.105, 0.39, 0.735], 8, 5);

  box([0.52, 0.10, 0.16], PLASTER_LIGHT, [0, 0.075, 0.69]);
  box([0.43, 0.07, 0.14], WOOD_LIGHT, [0, 0.16, 0.70]);

  // Door canopy and a little triangular pediment.
  b.extrude(
    [
      [-0.27, 0],
      [0.27, 0],
      [0.21, 0.15],
      [-0.21, 0.15],
    ],
    {
      at: [0, 0.69, 0.68],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.012,
      color: TEAL_DARK,
      name: "door-canopy",
    },
  );

  // Door wreath.
  torus(0.07, 0.012, GREEN_DARK, [0, 0.48, 0.731], 10, 4);
  for (const a of [0, 90, 180, 270]) {
    const r = (a * Math.PI) / 180;
    sphere(
      0.021,
      a % 180 === 0 ? FLOWER_YELLOW : FLOWER_PINK,
      [Math.sin(r) * 0.07, 0.48 + Math.cos(r) * 0.07, 0.748],
      7,
      4,
    );
  }

  // Small painted sign.
  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48">
      <rect width="160" height="48" rx="8" fill="#f4dfad"/>
      <path d="M8 40 Q80 3 152 40" fill="none" stroke="#2f8d88" stroke-width="4"/>
      <text x="80" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#75452e">MILL</text>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.BoxGeometry(0.42, 0.13, 0.025), PLASTER_LIGHT, {
    at: [0, 0.88, 0.68],
    flat: true,
  });
  b.part(new THREE.PlaneGeometry(0.38, 0.105), WHITE, {
    at: [0, 0.88, 0.697],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
  });

  // ------------------------------------------------------------------------------------------------
  // Two front windows, each with a chunky blue frame and cream muntins.

  function windowAt(x: number, y: number, width = 0.25, height = 0.30) {
    box([width + 0.06, height + 0.06, 0.07], WOOD_DARK, [x, y, 0.48]);
    box([width, height, 0.025], BLUE_DARK, [x, y, 0.522]);
    box([width - 0.035, height - 0.035, 0.012], BLUE, [x, y, 0.541]);
    box([0.026, height - 0.035, 0.018], WHITE, [x, y, 0.553]);
    box([width - 0.035, 0.026, 0.018], WHITE, [x, y, 0.555]);
    box([width + 0.09, 0.035, 0.08], PLASTER_LIGHT, [x, y - height / 2 - 0.055, 0.46]);
    box([width + 0.09, 0.035, 0.08], PLASTER_LIGHT, [x, y + height / 2 + 0.055, 0.46]);
  }

  windowAt(-0.245, 1.50, 0.22, 0.29);
  windowAt(0.245, 1.50, 0.22, 0.29);

  // Tiny side windows visible from a three-quarter view.
  box([0.05, 0.27, 0.24], WOOD_DARK, [0.54, 2.08, 0]);
  box([0.025, 0.22, 0.19], BLUE, [0.572, 2.08, 0]);
  box([0.025, 0.22, 0.018], WHITE, [0.587, 2.08, 0]);
  box([0.025, 0.018, 0.19], WHITE, [0.587, 2.08, 0]);

  // Flower boxes under windows.
  function flowerBox(x: number, y: number, z: number) {
    box([0.32, 0.12, 0.18], WOOD, [x, y, z]);
    box([0.34, 0.035, 0.20], WOOD_DARK, [x, y + 0.075, z]);
    for (const dx of [-0.11, 0, 0.11]) {
      rod([x + dx, y + 0.08, z], [x + dx, y + 0.18, z], 0.012, GREEN_DARK);
      sphere(0.035, dx < 0 ? FLOWER_PINK : dx > 0 ? FLOWER_PURPLE : FLOWER_YELLOW, [
        x + dx,
        y + 0.20,
        z,
      ], 7, 4);
      sphere(0.012, FLOWER_YELLOW, [x + dx, y + 0.20, z + 0.028], 6, 4);
    }
  }

  flowerBox(-0.245, 1.27, 0.56);
  flowerBox(0.245, 1.27, 0.56);

  // ------------------------------------------------------------------------------------------------
  // Gallery balcony around the top of the tower.

  cylinder(0.63, 0.075, WOOD_DARK, [0, 2.74, 0], 16);
  cylinder(0.57, 0.045, WOOD_LIGHT, [0, 2.80, 0], 16);
  torus(0.64, 0.035, WOOD_DARK, [0, 2.83, 0], 16, 5);

  const railRadius = 0.66;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.cos(a) * railRadius;
    const z = Math.sin(a) * railRadius;
    rod([x, 2.80, z], [x, 3.04, z], 0.018, WOOD);
  }
  torus(railRadius, 0.025, WOOD, [0, 3.05, 0], 16, 5);

  // Gallery front gate and its gold latch.
  box([0.38, 0.25, 0.035], WOOD, [0, 2.91, 0.68]);
  box([0.025, 0.20, 0.045], WOOD_DARK, [-0.13, 2.93, 0.705]);
  box([0.025, 0.20, 0.045], WOOD_DARK, [0.13, 2.93, 0.705]);
  box([0.32, 0.025, 0.045], WOOD_DARK, [0, 3.02, 0.705]);
  sphere(0.018, GOLD, [0.06, 2.91, 0.73], 7, 4);

  // ------------------------------------------------------------------------------------------------
  // Cap and roof. The broad teal cap gives the silhouette its unmistakable windmill profile.

  b.lathe(
    [
      [0, 2.83],
      [0.58, 2.83],
      [0.65, 2.93],
      [0.58, 3.05],
      [0.50, 3.18],
      [0.34, 3.34],
      [0.10, 3.45],
      [0, 3.47],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: TEAL_DARK,
      name: "cap-roof",
    },
  );

  b.lathe(
    [
      [0, 3.00],
      [0.55, 3.00],
      [0.53, 3.08],
      [0.46, 3.20],
      [0.29, 3.35],
      [0.08, 3.43],
      [0, 3.44],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: TEAL,
      name: "cap-highlight",
    },
  );

  torus(0.58, 0.028, GOLD, [0, 2.98, 0], 12, 4);
  torus(0.49, 0.022, TEAL_DARK, [0, 3.19, 0], 12, 4);

  // Decorative cap fin / weather vane.
  rod([0, 3.38, 0], [0, 3.82, 0], 0.018, WOOD_DARK);
  b.extrude(
    [
      [0, 0],
      [0.23, 0.05],
      [0.16, 0.13],
      [0, 0.10],
      [-0.12, 0.16],
      [-0.08, 0.04],
    ],
    {
      at: [0, 3.76, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: GOLD,
      name: "weather-vane",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Windmill axle and four sails on the front (+Z), mounted below the cap.

  const axleY = 2.22;
  const axleZ = 0.66;

  cylinder(0.18, 0.16, WOOD_DARK, [0, axleY, axleZ], 12, [90, 0, 0]);
  cylinder(0.115, 0.20, GOLD, [0, axleY, axleZ + 0.04], 12, [90, 0, 0]);
  cylinder(0.075, 0.25, WOOD, [0, axleY, axleZ + 0.12], 10, [90, 0, 0]);

  // Blade helper: radial x axis and tangential y axis form a face-on sail.
  function sail(angle: number, length: number, width: number) {
    const r = angle * Math.PI / 180;
    const radial: [number, number, number] = [Math.cos(r), Math.sin(r), 0];
    const tangent: [number, number, number] = [-Math.sin(r), Math.cos(r), 0];

    const outline: [number, number, "sharp"][] = [
      [0.08, -width * 0.45, "sharp"],
      [length * 0.72, -width * 0.58, "sharp"],
      [length, -width * 0.30, "sharp"],
      [length, width * 0.30, "sharp"],
      [length * 0.72, width * 0.58, "sharp"],
      [0.08, width * 0.45, "sharp"],
    ];

    b.extrude(outline, {
      at: [0, axleY, axleZ + 0.16],
      x: radial,
      y: tangent,
      thickness: [0.045, 0.025],
      bevel: 0.012,
      color: WOOD_DARK,
      name: `sail-shadow-${angle}`,
    });

    const inset: [number, number, "sharp"][] = [
      [0.12, -width * 0.30, "sharp"],
      [length * 0.68, -width * 0.40, "sharp"],
      [length * 0.92, -width * 0.20, "sharp"],
      [length * 0.92, width * 0.20, "sharp"],
      [length * 0.68, width * 0.40, "sharp"],
      [0.12, width * 0.30, "sharp"],
    ];

    b.extrude(inset, {
      at: [radial[0] * 0.015, axleY + radial[1] * 0.015, axleZ + 0.185],
      x: radial,
      y: tangent,
      thickness: [0.020, 0.012],
      bevel: 0.006,
      color: WHITE,
      name: `sail-cloth-${angle}`,
    });

    // Cross brace and three small gold fasteners on each blade.
    rod(
      [radial[0] * 0.15, axleY + radial[1] * 0.15, axleZ + 0.215],
      [radial[0] * (length * 0.92), axleY + radial[1] * (length * 0.92), axleZ + 0.215],
      0.018,
      WOOD,
    );

    for (const d of [0.34, 0.62, 0.86]) {
      sphere(
        0.018,
        GOLD,
        [
          radial[0] * length * d,
          axleY + radial[1] * length * d,
          axleZ + 0.235,
        ],
        7,
        4,
      );
    }
  }

  sail(10, 1.35, 0.25);
  sail(100, 1.25, 0.24);
  sail(190, 1.35, 0.25);
  sail(280, 1.25, 0.24);

  // Central rosette over all sail roots.
  cylinder(0.13, 0.06, GOLD, [0, axleY, axleZ + 0.29], 12, [90, 0, 0]);
  torus(0.10, 0.015, WHITE, [0, axleY, axleZ + 0.325], 12, 4);
  sphere(0.065, GOLD, [0, axleY, axleZ + 0.36], 10, 6);

  // ------------------------------------------------------------------------------------------------
  // Side timber braces and a few cheerful masonry marks.

  for (const side of [-1, 1]) {
    rod(
      [side * 0.57, 1.05, 0.05],
      [side * 0.50, 2.55, 0.05],
      0.018,
      WOOD_LIGHT,
    );
    rod(
      [side * 0.50, 1.05, 0.05],
      [side * 0.57, 2.55, 0.05],
      0.018,
      WOOD_LIGHT,
    );
  }

  for (const y of [0.30, 0.55, 0.80]) {
    for (const x of [-0.35, 0.35]) {
      box([0.12, 0.065, 0.025], BRICK_LIGHT, [x, y, 0.66]);
    }
  }

  // Small paving stones at the front, sunk just into the floor.
  for (let i = -2; i <= 2; i++) {
    box([0.24, 0.035, 0.20], PLASTER_LIGHT, [i * 0.18, 0.018, 0.88]);
  }

  return b.root;
}
