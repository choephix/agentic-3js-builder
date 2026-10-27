```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-flat-colour arctic research station with a warm timber cabin, snow drifts, radio mast, solar array, fuel drums, sled crates, flags, and glowing windows.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const NAVY = "#172b49";
  const DEEP_NAVY = "#0b1930";
  const MIDNIGHT = "#10233c";
  const SNOW = "#dceaf0";
  const SNOW_LIGHT = "#f4fbfa";
  const SNOW_BLUE = "#b8d4df";
  const ICE = "#7eb4c4";
  const SHADOW = "#7595a8";
  const ORANGE = "#d96842";
  const ORANGE_DARK = "#9e3f35";
  const SALMON = "#ed8a62";
  const CREAM = "#f4d6a1";
  const WOOD = "#8d493c";
  const WOOD_DARK = "#552f38";
  const TEAL = "#3f8e9b";
  const TEAL_DARK = "#24576d";
  const YELLOW = "#f2ba55";
  const RED = "#c8493f";
  const BLACK = "#101a2c";
  const GLASS = "#83d0d0";
  const WHITE = "#ffffff";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      flat: true,
      ...options,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, 8, 1),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.SphereGeometry(radius, 8, 5),
      color,
      at,
      options,
    );

  const beam = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "flat" });

  const wedge = (
    points: [number, number][],
    at: [number, number, number],
    x: [number, number, number],
    color: string,
    thickness = 0.04,
  ) =>
    b.extrude(points, {
      at,
      x,
      y: [0, 1, 0],
      thickness,
      bevel: 0.008,
      color,
      smoothing: 0,
    });

  // ---------------------------------------------------------------------------
  // Snow island: a deliberately graphic, low-poly footprint.
  // ---------------------------------------------------------------------------

  box([4.5, 0.18, 3.7], SNOW_BLUE, [0, 0.09, 0]);

  const snowMounds: [number, number, number, number, string][] = [
    [-1.88, 0.22, -1.35, 0.42, SNOW_LIGHT],
    [-1.52, 0.18, 1.28, 0.52, SNOW],
    [1.90, 0.24, 1.30, 0.50, SNOW_LIGHT],
    [1.95, 0.18, -1.20, 0.60, SNOW],
    [0.25, 0.20, -1.65, 0.48, SNOW_LIGHT],
    [-0.60, 0.16, 1.67, 0.45, SNOW],
  ];

  for (const [x, y, z, r, c] of snowMounds) {
    sphere(r, c, [x, y, z], { scale: [1.25, 0.5, 0.8] });
  }

  // Angular blue ice shards around the perimeter.
  const iceShapes: [number, number, number, number][] = [
    [-2.02, 0.31, 0.32, 0.42],
    [-1.77, 0.27, -1.68, 0.30],
    [1.52, 0.31, 1.68, 0.38],
    [2.10, 0.28, 0.45, 0.34],
    [1.40, 0.30, -1.67, 0.28],
  ];

  for (const [x, y, z, h] of iceShapes) {
    wedge(
      [
        [-0.18, 0],
        [0.14, 0],
        [0.09, h * 0.65],
        [0.01, h],
        [-0.08, h * 0.48],
      ],
      [x, y, z],
      [0, 0, 1],
      ICE,
      0.045,
    );
  }

  // ---------------------------------------------------------------------------
  // Raised cabin platform and stilts.
  // ---------------------------------------------------------------------------

  box([1.75, 0.14, 1.35], WOOD_DARK, [0, 0.50, 0]);
  box([1.57, 0.12, 1.20], WOOD, [0, 0.61, 0]);

  for (const x of [-0.66, 0.66]) {
    for (const z of [-0.47, 0.47]) {
      box([0.13, 0.48, 0.13], WOOD_DARK, [x, 0.31, z]);
      box([0.19, 0.06, 0.19], CREAM, [x, 0.08, z]);
    }
  }

  // Cross braces under the station.
  beam([-0.70, 0.18, -0.50], [0.70, 0.48, 0.50], 0.035, WOOD_DARK);
  beam([0.70, 0.18, -0.50], [-0.70, 0.48, 0.50], 0.035, WOOD_DARK);
  beam([-0.70, 0.18, 0.50], [0.70, 0.48, -0.50], 0.025, WOOD);

  // ---------------------------------------------------------------------------
  // Cabin body, trim, roof and chimney.
  // ---------------------------------------------------------------------------

  box([1.52, 0.95, 1.14], SALMON, [0, 1.15, 0]);
  box([1.57, 0.07, 1.19], ORANGE_DARK, [0, 0.70, 0]);
  box([1.58, 0.06, 1.20], CREAM, [0, 1.64, 0]);

  // Vertical corner boards make the block read as a painted ranger cabin.
  for (const x of [-0.76, 0.76]) {
    box([0.09, 0.98, 0.09], CREAM, [x, 1.16, 0.57]);
    box([0.09, 0.98, 0.09], ORANGE_DARK, [x, 1.16, -0.57]);
  }

  // Horizontal siding bands.
  for (let y = 0.83; y <= 1.51; y += 0.17) {
    box([1.48, 0.025, 0.018], ORANGE_DARK, [0, y, 0.579]);
  }

  // Pitched roof: two chunky overlapping planes.
  box([1.78, 0.12, 0.78], NAVY, [-0.43, 1.72, 0], {
    rotation: [0, 0, -16],
  });
  box([1.78, 0.12, 0.78], NAVY, [0.43, 1.72, 0], {
    rotation: [0, 0, 16],
  });
  box([1.78, 0.08, 0.10], CREAM, [0, 1.72, 0.40]);
  box([1.78, 0.08, 0.10], DEEP_NAVY, [0, 1.72, -0.40]);

  // Roof ridge and snow cap.
  beam([-0.88, 1.86, 0], [0.88, 1.86, 0], 0.045, WOOD_DARK);
  box([1.72, 0.07, 0.24], SNOW_LIGHT, [0, 1.89, 0], {
    rotation: [0, 0, 0],
  });

  // Chimney with a little snow collar.
  box([0.18, 0.55, 0.18], WOOD_DARK, [0.40, 2.02, -0.18]);
  box([0.25, 0.08, 0.25], SNOW_LIGHT, [0.40, 2.31, -0.18]);
  box([0.28, 0.08, 0.28], BLACK, [0.40, 2.38, -0.18]);

  // ---------------------------------------------------------------------------
  // Front porch and red door, facing +Z.
  // ---------------------------------------------------------------------------

  box([0.56, 0.08, 0.34], WOOD_DARK, [0, 0.69, 0.78]);
  box([0.09, 0.62, 0.09], WOOD_DARK, [-0.29, 1.00, 0.91]);
  box([0.09, 0.62, 0.09], WOOD_DARK, [0.29, 1.00, 0.91]);
  box([0.72, 0.08, 0.09], CREAM, [0, 1.32, 0.91]);
  box([0.42, 0.67, 0.035], ORANGE_DARK, [0, 1.05, 0.592]);
  box([0.32, 0.19, 0.025], GLASS, [0, 1.18, 0.616]);
  box([0.025, 0.025, 0.025], YELLOW, [0.14, 1.04, 0.625]);

  // Porch lamp.
  cylinder(0.055, 0.12, BLACK, [-0.34, 1.38, 0.72]);
  const porchLamp = sphere(0.07, YELLOW, [-0.34, 1.31, 0.72], {
    scale: [0.75, 0.75, 0.75],
  });
  glow(porchLamp, 1.8);

  // ---------------------------------------------------------------------------
  // Windows: dark frames, warm interior and snow ledges.
  // ---------------------------------------------------------------------------

  const window = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    side: "front" | "side",
  ) => {
    const front = side === "front";
    const depth = front ? 0.62 : 0;
    const frameX = front ? w : 0.045;
    const frameZ = front ? 0.045 : w;

    box([frameX, h, frameZ], BLACK, [x, y, z + depth]);
    box(
      [front ? w * 0.82 : 0.025, h * 0.78, front ? 0.025 : w * 0.82],
      GLASS,
      [x, y, z + depth + (front ? 0.027 : 0)],
    );

    if (front) {
      box([0.035, h * 0.78, 0.035], BLACK, [x, y, z + depth + 0.045]);
      box([w * 0.82, 0.035, 0.035], BLACK, [x, y, z + depth + 0.045]);
      box([w + 0.12, 0.07, 0.12], SNOW_LIGHT, [x, y + h * 0.53, z + depth]);
    } else {
      box([0.035, h * 0.78, 0.035], BLACK, [x + 0.045, y, z]);
      box([0.035, 0.035, w * 0.82], BLACK, [x + 0.045, y, z]);
      box([0.13, 0.07, w + 0.12], SNOW_LIGHT, [x, y + h * 0.53, z]);
    }

    const light = sphere(
      0.055,
      YELLOW,
      front ? [x, y, z + depth + 0.052] : [x + 0.052, y, z],
      { scale: [1.1, 0.75, 0.3] },
    );
    glow(light, 0.8);
  };

  window(-0.42, 1.21, 0, 0.48, 0.42, "front");
  window(0.42, 1.21, 0, 0.48, 0.42, "front");
  window(-0.77, 1.24, 0.18, 0.42, 0.37, "side");

  // ---------------------------------------------------------------------------
  // Radio mast and instrument platform on the left.
  // ---------------------------------------------------------------------------

  const mastBase: [number, number, number] = [-1.18, 0.70, -0.15];
  cylinder(0.14, 0.10, WOOD_DARK, [-1.18, 0.68, -0.15]);
  beam([-1.18, 0.73, -0.15], [-1.18, 2.72, -0.15], 0.035, TEAL_DARK);
  beam([-1.18, 0.73, -0.15], [-0.92, 2.65, -0.15], 0.025, TEAL_DARK);
  beam([-1.18, 1.45, -0.15], [-0.92, 2.07, -0.15], 0.022, TEAL_DARK);
  beam([-1.18, 1.45, -0.15], [-1.43, 2.07, -0.15], 0.022, TEAL_DARK);
  beam([-1.18, 2.10, -0.15], [-0.92, 2.65, -0.15], 0.018, TEAL_DARK);
  beam([-1.18, 2.10, -0.15], [-1.43, 2.65, -0.15], 0.018, TEAL_DARK);

  box([0.75, 0.06, 0.05], CREAM, [-1.18, 2.14, -0.15]);
  box([0.08, 0.34, 0.08], WOOD_DARK, [-1.18, 2.32, -0.15]);
  sphere(0.06, RED, [-1.18, 2.75, -0.15]);

  // Radio dish / wind vane.
  cylinder(0.22, 0.045, CREAM, [-0.91, 2.39, -0.15], {
    rotation: [0, 0, 32],
  });
  beam([-0.91, 2.39, -0.15], [-0.76, 2.54, -0.15], 0.018, BLACK);
  box([0.30, 0.025, 0.025], RED, [-0.67, 2.61, -0.15], {
    rotation: [0, 0, -12],
  });

  // Small instrument box at mast foot.
  box([0.38, 0.32, 0.32], TEAL_DARK, [-1.18, 0.87, 0.03]);
  box([0.25, 0.15, 0.025], GLASS, [-1.18, 0.91, 0.205]);
  box([0.07, 0.07, 0.035], YELLOW, [-1.04, 0.88, 0.22]);

  // ---------------------------------------------------------------------------
  // Solar panel rack to the right of the cabin.
  // ---------------------------------------------------------------------------

  const solarX = 1.16;
  const solarZ = -0.30;

  for (const x of [0.82, 1.50]) {
    beam([x, 0.67, solarZ], [x, 1.12, solarZ], 0.035, TEAL_DARK);
  }
  beam([0.76, 1.12, solarZ], [1.56, 1.12, solarZ], 0.04, TEAL_DARK);

  for (const x of [0.83, 1.15, 1.47]) {
    box([0.28, 0.035, 0.48], DEEP_NAVY, [x, 1.22, solarZ], {
      rotation: [0, 0, -19],
    });
    box([0.22, 0.012, 0.40], TEAL, [x, 1.245, solarZ + 0.02], {
      rotation: [0, 0, -19],
    });
    box([0.018, 0.018, 0.40], CREAM, [x - 0.07, 1.26, solarZ + 0.03], {
      rotation: [0, 0, -19],
    });
    box([0.018, 0.018, 0.40], CREAM, [x + 0.07, 1.26, solarZ + 0.03], {
      rotation: [0, 0, -19],
    });
  }

  box([0.68, 0.08, 0.22], WOOD_DARK, [1.16, 0.65, solarZ]);
  cylinder(0.07, 0.30, TEAL_DARK, [1.16, 0.53, solarZ]);

  // ---------------------------------------------------------------------------
  // Fuel, generator, sled and field equipment.
  // ---------------------------------------------------------------------------

  // Orange fuel drums.
  for (const z of [0.92, 1.18]) {
    cylinder(0.16, 0.32, ORANGE, [1.43, 0.84, z], {
      rotation: [Math.PI / 2, 0, 0],
    });
    box([0.27, 0.035, 0.035], CREAM, [1.43, 0.84, z + 0.135], {
      rotation: [0, 0, 0],
    });
  }

  // Generator housing.
  box([0.54, 0.35, 0.38], WOOD_DARK, [1.55, 0.54, 0.73]);
  box([0.42, 0.20, 0.025], BLACK, [1.55, 0.61, 0.93]);
  box([0.13, 0.12, 0.035], YELLOW, [1.38, 0.61, 0.955]);
  for (const x of [1.39, 1.47, 1.55, 1.63, 1.71]) {
    box([0.025, 0.18, 0.015], TEAL, [x, 0.50, 0.94]);
  }

  // Cargo sled.
  box([0.85, 0.12, 0.46], ORANGE_DARK, [0.05, 0.34, 1.25]);
  box([0.69, 0.30, 0.34], CREAM, [0.05, 0.55, 1.25]);
  box([0.61, 0.16, 0.20], ORANGE, [0.05, 0.77, 1.25]);
  beam([-0.43, 0.25, 1.10], [0.43, 0.25, 1.10], 0.035, TEAL_DARK);
  beam([-0.43, 0.25, 1.40], [0.43, 0.25, 1.40], 0.035, TEAL_DARK);
  beam([-0.46, 0.27, 1.10], [-0.62, 0.27, 1.10], 0.025, TEAL_DARK);
  beam([-0.46, 0.27, 1.40], [-0.62, 0.27, 1.40], 0.025, TEAL_DARK);

  // Two strapped cargo boxes.
  box([0.34, 0.26, 0.30], WOOD, [-0.16, 0.84, 1.23]);
  box([0.30, 0.22, 0.27], TEAL, [0.22, 0.81, 1.23]);
  box([0.36, 0.035, 0.035], CREAM, [-0.16, 0.84, 1.39]);
  box([0.32, 0.035, 0.035], CREAM, [0.22, 0.81, 1.37]);

  // Yellow field case on the snow.
  box([0.46, 0.25, 0.34], YELLOW, [-1.60, 0.34, 0.73]);
  box([0.30, 0.035, 0.035], BLACK, [-1.60, 0.37, 0.91]);
  box([0.08, 0.08, 0.04], BLACK, [-1.78, 0.38, 0.91]);
  box([0.08, 0.08, 0.04], BLACK, [-1.42, 0.38, 0.91]);

  // ---------------------------------------------------------------------------
  // Survey flags and an orange safety pennant.
  // ---------------------------------------------------------------------------

  const flag = (
    x: number,
    z: number,
    height: number,
    color: string,
    lean = 0,
  ) => {
    beam([x, 0.20, z], [x, height, z], 0.012, BLACK);
    box([0.24, 0.15, 0.025], color, [x + 0.11, height - 0.10, z], {
      rotation: [0, 0, lean],
    });
    sphere(0.025, WHITE, [x, height + 0.015, z]);
  };

  flag(-1.92, -0.62, 0.86, RED, -8);
  flag(1.82, 0.48, 0.96, YELLOW, 7);
  flag(-0.98, 1.72, 2.28, ORANGE, -10);

  // ---------------------------------------------------------------------------
  // Snow tracks leading from the station.
  // ---------------------------------------------------------------------------

  const trackMarks = [
    [-1.72, -1.31],
    [-1.40, -1.47],
    [-1.07, -1.58],
    [-0.72, -1.65],
    [-0.37, -1.70],
    [-0.02, -1.73],
    [0.33, -1.75],
    [0.68, -1.77],
    [1.03, -1.78],
    [1.38, -1.80],
  ] as const;

  for (let i = 0; i < trackMarks.length; i++) {
    const [x, z] = trackMarks[i];
    box([0.14, 0.018, 0.34], SHADOW, [x, 0.205, z], {
      rotation: [0, 0, i % 2 === 0 ? -8 : 8],
    });
    box([0.14, 0.018, 0.34], SHADOW, [x + 0.22, 0.208, z + 0.05], {
      rotation: [0, 0, i % 2 === 0 ? 8 : -8],
    });
  }

  // ---------------------------------------------------------------------------
  // Antenna guy ropes, roof vents, and graphic signage.
  // ---------------------------------------------------------------------------

  beam([-1.18, 1.28, -0.15], [-1.82, 0.25, -0.82], 0.009, CREAM);
  beam([-1.18, 1.28, -0.15], [-0.55, 0.22, -1.62], 0.009, CREAM);
  beam([-1.18, 1.28, -0.15], [-1.88, 0.24, 0.50], 0.009, CREAM);

  // Snow anchors over the guy ropes.
  for (const p of [
    [-1.82, 0.25, -0.82],
    [-0.55, 0.22, -1.62],
    [-1.88, 0.24, 0.50],
  ] as [number, number, number][]) {
    sphere(0.09, SNOW_LIGHT, p, { scale: [1.3, 0.65, 1.3] });
  }

  // Roof vents.
  for (const x of [-0.24, 0.18]) {
    cylinder(0.06, 0.16, TEAL_DARK, [x, 1.95, 0.12]);
    box([0.15, 0.035, 0.14], SNOW_LIGHT, [x, 2.04, 0.12]);
  }

  // Bold station sign on the front.
  box([0.68, 0.24, 0.045], NAVY, [0, 1.53, 0.625]);
  box([0.57, 0.12, 0.018], YELLOW, [0, 1.53, 0.652]);

  // A simple geometric polar-star emblem built from four diamond blades.
  for (const rotation of [0, 90, 45, -45]) {
    wedge(
      [
        [0, 0.11],
        [0.035, 0],
        [0, -0.11],
        [-0.035, 0],
      ],
      [0, 1.53, 0.668],
      [0, 0, 1],
      NAVY,
      0.008,
    );
  }

  // ---------------------------------------------------------------------------
  // A few foreground snow facets give the diorama a designed silhouette.
  // ---------------------------------------------------------------------------

  wedge(
    [
      [-0.75, 0],
      [0.75, 0],
      [0.55, 0.12],
      [-0.18, 0.20],
      [-0.68, 0.10],
    ],
    [0.15, 0.22, -1.56],
    [0, 0, 1],
    SNOW_LIGHT,
    0.05,
  );

  wedge(
    [
      [-0.55, 0],
      [0.55, 0],
      [0.35, 0.14],
      [-0.38, 0.19],
    ],
    [-1.25, 0.22, -1.22],
    [0, 0, 1],
    SNOW,
    0.045,
  );

  // Small orange trail marker nearest the viewer.
  cylinder(0.035, 0.42, BLACK, [1.65, 0.38, -1.22]);
  box([0.24, 0.14, 0.025], ORANGE, [1.76, 0.55, -1.22], {
    rotation: [0, 0, -8],
  });
  box([0.12, 0.03, 0.03], CREAM, [1.76, 0.55, -1.24]);

  return b.root;
}
```