import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "storybook Dutch windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered brick tower, red cap, balcony, windows, door, flower boxes, and four broad wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const C = {
    brick: "#c96f58",
    brickLight: "#df8b68",
    brickDark: "#9d4e46",
    mortar: "#e8b08a",
    cream: "#fff0c7",
    sail: "#f7e1a6",
    sailShadow: "#d8ae69",
    roof: "#9f3e45",
    roofLight: "#bf5550",
    wood: "#704537",
    woodLight: "#a9684d",
    darkWood: "#4a2b31",
    window: "#84c9d0",
    windowDark: "#367583",
    door: "#5b3840",
    doorLight: "#85534a",
    brass: "#e5b65f",
    leaf: "#75a955",
    leafDark: "#4d7b49",
    flower: "#ed8a86",
    flowerYellow: "#f5c85e",
    shadow: "#6a4548",
  };

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
  ) => {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    rotation?: [number, number, number],
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, rotation, flat: true },
    );
  };

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    segments = 10,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, segments, 6), color, {
      at,
      flat: true,
    });
  };

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
  ) => {
    return b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      flat: true,
    });
  };

  // ---------------------------------------------------------------------------
  // Main tower: a squat, friendly, wide-bottomed Dutch mill body.
  // ---------------------------------------------------------------------------

  b.frustumBox(
    [0, 0.04, 0],
    [0, 1.43, 0],
    [0.82, 0.72],
    [0.56, 0.55],
    {
      color: C.brick,
      section: "box",
      caps: "flat",
      flat: true,
      name: "tapered-brick-tower",
    } as any,
  );

  // Broad warm bands make the tower readable as painted masonry.
  box([0.78, 0.055, 0.73], C.brickLight, [0, 0.38, 0]);
  box([0.73, 0.045, 0.66], C.brickLight, [0, 0.82, 0]);
  box([0.65, 0.04, 0.60], C.brickLight, [0, 1.22, 0]);

  // Brick courses on the front face.
  const courses = [
    [0.16, 0.77],
    [0.31, 0.75],
    [0.47, 0.70],
    [0.63, 0.66],
    [0.78, 0.63],
    [0.93, 0.60],
    [1.08, 0.58],
    [1.23, 0.56],
  ];
  for (let row = 0; row < courses.length; row++) {
    const [y, width] = courses[row];
    const z = 0.371 - row * 0.006;
    box([width, 0.018, 0.014], C.mortar, [0, y, z]);
    const offset = row % 2 ? 0.11 : 0;
    for (let x = -width / 2 + offset; x < width / 2; x += 0.22) {
      box([0.014, 0.135, 0.018], C.mortar, [x, y + 0.072, z + 0.002]);
    }
  }

  // Side masonry marks, deliberately sparse so the front remains the hero.
  for (let row = 0; row < 5; row++) {
    const y = 0.24 + row * 0.21;
    const half = 0.39 - row * 0.045;
    box([0.014, 0.018, 0.28], C.mortar, [half, y, 0.03]);
    box([0.014, 0.018, 0.28], C.mortar, [-half, y, 0.03]);
    box([0.24, 0.018, 0.014], C.mortar, [0.18, y, -0.29]);
    box([0.24, 0.018, 0.014], C.mortar, [-0.18, y, -0.29]);
  }

  // ---------------------------------------------------------------------------
  // Foundation stones and little entry porch.
  // ---------------------------------------------------------------------------

  box([0.92, 0.12, 0.82], C.shadow, [0, 0.035, 0]);
  box([0.80, 0.08, 0.74], C.cream, [0, 0.10, 0]);
  box([0.70, 0.045, 0.68], C.brickDark, [0, 0.145, 0]);

  box([0.42, 0.08, 0.25], C.wood, [0, 0.205, 0.38]);
  box([0.35, 0.05, 0.21], C.woodLight, [0, 0.265, 0.39]);

  // Door with rounded-looking cap made from a small cylinder slice-like ornament.
  box([0.25, 0.43, 0.035], C.door, [0, 0.40, 0.382]);
  box([0.19, 0.35, 0.018], C.doorLight, [0, 0.39, 0.404]);
  cyl(0.095, 0.02, C.doorLight, [0, 0.615, 0.407], 10, [90, 0, 0]);
  box([0.018, 0.32, 0.025], C.door, [-0.015, 0.39, 0.419]);
  cyl(0.018, 0.018, C.brass, [0.075, 0.405, 0.423], 8, [90, 0, 0]);

  // Door planks and a cheery little handle.
  for (let x = -0.095; x <= 0.095; x += 0.048) {
    box([0.012, 0.34, 0.012], C.wood, [x, 0.40, 0.421]);
  }
  sphere(0.018, C.brass, [0.073, 0.41, 0.438], 8);

  // ---------------------------------------------------------------------------
  // Windows: cream surrounds, teal glass, and chunky cross muntins.
  // ---------------------------------------------------------------------------

  const window = (x: number, y: number, z: number, w: number, h: number) => {
    box([w + 0.07, h + 0.07, 0.032], C.cream, [x, y, z]);
    box([w, h, 0.038], C.windowDark, [x, y, z + 0.02]);
    box([w * 0.82, h * 0.82, 0.012], C.window, [x, y, z + 0.045]);
    box([0.018, h * 0.86, 0.016], C.cream, [x, y, z + 0.055]);
    box([w * 0.86, 0.018, 0.016], C.cream, [x, y, z + 0.057]);
  };

  window(0, 1.02, 0.365, 0.22, 0.22);
  window(-0.255, 0.91, 0.23, 0.14, 0.18);
  window(0.255, 0.91, 0.23, 0.14, 0.18);

  // Small flower boxes below the side windows.
  for (const x of [-0.255, 0.255]) {
    box([0.23, 0.08, 0.13], C.wood, [x, 0.76, 0.31]);
    box([0.20, 0.04, 0.11], C.woodLight, [x, 0.81, 0.31]);
    for (let i = -1; i <= 1; i++) {
      sphere(0.045, i === 0 ? C.flowerYellow : C.flower, [
        x + i * 0.065,
        0.88 + (i === 0 ? 0.025 : 0),
        0.315,
      ], 8);
      sphere(0.035, C.leaf, [x + i * 0.06 + 0.025, 0.84, 0.30], 7);
    }
  }

  // ---------------------------------------------------------------------------
  // Gallery platform, railing, and cap.
  // ---------------------------------------------------------------------------

  box([0.72, 0.07, 0.68], C.wood, [0, 1.43, 0]);
  box([0.65, 0.035, 0.61], C.cream, [0, 1.475, 0]);

  // Gallery support brackets.
  for (const x of [-0.29, 0.29]) {
    box([0.07, 0.22, 0.07], C.darkWood, [x, 1.33, 0.27], [20 * (x > 0 ? 1 : -1), 0, 0]);
  }

  // Four square posts and a rounded-looking top rail.
  for (const x of [-0.31, 0.31]) {
    for (const z of [-0.25, 0.25]) {
      box([0.045, 0.24, 0.045], C.woodLight, [x, 1.62, z]);
    }
  }
  box([0.70, 0.055, 0.055], C.wood, [0, 1.75, 0.25]);
  box([0.70, 0.055, 0.055], C.wood, [0, 1.75, -0.25]);
  box([0.055, 0.055, 0.52], C.wood, [-0.34, 1.75, 0]);
  box([0.055, 0.055, 0.52], C.wood, [0.34, 1.75, 0]);

  // Red onion-like cap and pale rim.
  cone(0.47, 0.34, C.roof, [0, 1.82, 0], 10);
  cone(0.39, 0.25, C.roofLight, [0, 1.94, 0], 10);
  cyl(0.405, 0.06, C.cream, [0, 1.68, 0], 12);

  // Cap finial.
  cyl(0.035, 0.19, C.wood, [0, 2.13, 0], 8);
  sphere(0.065, C.brass, [0, 2.25, 0], 8);

  // ---------------------------------------------------------------------------
  // Main front machinery and sails.
  // ---------------------------------------------------------------------------

  const hub: [number, number, number] = [0, 1.12, 0.405];

  // Cream circular face plate and chunky axle.
  cyl(0.235, 0.055, C.wood, hub, 12, [90, 0, 0]);
  cyl(0.185, 0.065, C.cream, [0, 1.12, 0.445], 12, [90, 0, 0]);
  cyl(0.105, 0.09, C.brass, [0, 1.12, 0.49], 10, [90, 0, 0]);
  sphere(0.07, C.wood, [0, 1.12, 0.55], 10);

  // Sails use a broad, tapered, blocky extruded outline.
  const sailOutline: [number, number][] = [
    [0.00, -0.075],
    [0.83, -0.045],
    [0.99, 0.015],
    [0.80, 0.075],
    [0.15, 0.13],
    [0.00, 0.095],
  ];
  const sailInset: [number, number][] = [
    [0.12, -0.038],
    [0.77, -0.025],
    [0.87, 0.012],
    [0.75, 0.042],
    [0.19, 0.078],
    [0.12, 0.058],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = i * 90;
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      THREE.MathUtils.degToRad(angle),
    );

    b.extrude(sailOutline, {
      at: hub,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      color: C.wood,
      quat: q,
      name: `wooden-sail-${i}`,
    });

    b.extrude(sailInset, {
      at: [0, 1.12, 0.452],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.005,
      color: C.sail,
      quat: q,
      name: `canvas-sail-${i}`,
    });

    // Decorative diagonal brace in the wood portion.
    box([0.68, 0.028, 0.028], C.sailShadow, [0.39, 1.12, 0.47], [
      0,
      0,
      angle + 8,
    ]);
  }

  // A neat central cap hides the four sail roots.
  cyl(0.12, 0.13, C.brass, [0, 1.12, 0.56], 10, [90, 0, 0]);
  cyl(0.06, 0.15, C.cream, [0, 1.12, 0.635], 10, [90, 0, 0]);

  // Little bolts around the hub.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sphere(
      0.018,
      C.brass,
      [Math.sin(a) * 0.15, 1.12 + Math.cos(a) * 0.15, 0.585],
      6,
    );
  }

  // ---------------------------------------------------------------------------
  // Side tail vane: the small Dutch windmill flourish behind the cap.
  // ---------------------------------------------------------------------------

  box([0.07, 0.56, 0.07], C.wood, [0.54, 1.98, -0.07], [0, 0, -18]);
  b.extrude(
    [
      [0, 0],
      [0.28, 0.04],
      [0.43, 0.18],
      [0.25, 0.22],
      [0.09, 0.14],
    ],
    {
      at: [0.57, 1.78, -0.08],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.006,
      color: C.sail,
      rotation: [0, 0, -12],
      name: "tail-vane",
    },
  );

  // Two tiny roof dormers, giving the silhouette extra personality.
  for (const x of [-0.22, 0.22]) {
    box([0.14, 0.13, 0.11], C.cream, [x, 1.92, 0.25]);
    cone(0.11, 0.10, C.roofLight, [x, 2.035, 0.25], 5);
    box([0.07, 0.07, 0.015], C.window, [x, 1.94, 0.312]);
    box([0.012, 0.07, 0.02], C.cream, [x, 1.94, 0.323]);
  }

  // A few oversized foundation flowers soften the base without becoming scenery.
  for (const x of [-0.48, 0.48]) {
    sphere(0.08, C.leafDark, [x, 0.18, 0.30], 7);
    sphere(0.055, C.leaf, [x * 0.94, 0.28, 0.33], 7);
    sphere(0.052, x < 0 ? C.flower : C.flowerYellow, [x, 0.38, 0.34], 8);
    sphere(0.025, C.flowerYellow, [x, 0.39, 0.39], 7);
  }

  return b.root;
}
