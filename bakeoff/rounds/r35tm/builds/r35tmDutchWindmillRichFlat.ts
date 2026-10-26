import * as THREE from "three";
import { createBuilder, polyline } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a pastel tapered tower, flower boxes, balcony, rounded red cap, and four striped wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const CREAM = "#f5e4b8";
  const CREAM_LIGHT = "#fff4cf";
  const TOWER = "#d9a86c";
  const TOWER_LIGHT = "#edc889";
  const TOWER_SHADOW = "#b9794d";
  const RED = "#bd4c45";
  const RED_DARK = "#84383d";
  const RED_LIGHT = "#e87862";
  const WOOD = "#704532";
  const WOOD_LIGHT = "#a76c4d";
  const GREEN = "#5e9561";
  const GREEN_DARK = "#326044";
  const WINDOW = "#294d54";
  const WINDOW_GLOW = "#83c1b0";
  const BLUE = "#78b7c4";
  const YELLOW = "#f4c45b";
  const PINK = "#ed8e9e";
  const WHITE = "#fff8dc";
  const INK = "#3b3034";

  const box = (size: [number, number, number], color: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      flat: true,
    });

  const sphere = (radius: number, color: string, at: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      flat: true,
    });

  const frontPlane = (
    size: [number, number],
    color: string,
    at: [number, number, number],
  ) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      flat: true,
    });

  // ------------------------------------------------------------------------------------------------
  // Main tower

  // The broad, friendly octagonal tower is deliberately chunky and slightly squat.
  b.part(
    new THREE.CylinderGeometry(0.47, 0.66, 1.62, 8),
    TOWER,
    {
      at: [0, 0.83, 0],
      flat: true,
    },
  );

  // Warm lower stones give the base a toy-built, Animal Crossing feel.
  for (const x of [-0.39, -0.13, 0.14, 0.4]) {
    box([0.22, 0.11, 0.08], x % 0.2 === 0 ? TOWER_LIGHT : TOWER_SHADOW, [x, 0.12, 0.57]);
  }

  // Pale horizontal courses around the tower.
  b.sweep(
    polyline([
      [-0.61, 0.33, 0],
      [-0.61, 0.37, 0],
      [0.61, 0.37, 0],
    ]),
    0.018,
    { color: CREAM_LIGHT, caps: "round" },
  );

  b.sweep(
    polyline([
      [-0.56, 0.88, 0],
      [-0.56, 0.92, 0],
      [0.56, 0.92, 0],
    ]),
    0.014,
    { color: CREAM, caps: "round" },
  );

  // Subtle vertical corner braces on the visible front facets.
  for (const x of [-0.43, 0.43]) {
    b.rod([x, 0.25, 0.49], [x * 0.78, 1.45, 0.39], 0.018, {
      color: TOWER_SHADOW,
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Arched front door

  const doorArch: [number, number][] = [
    [-0.17, 0],
    [0.17, 0],
    [0.17, 0.27],
    [0.14, 0.36],
    [0.08, 0.43],
    [0, 0.46],
    [-0.08, 0.43],
    [-0.14, 0.36],
    [-0.17, 0.27],
  ];

  b.extrude(doorArch, {
    at: [0, 0.08, 0.585],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.008,
    color: WOOD,
    name: "archedDoor",
  });

  const doorInset: [number, number][] = [
    [-0.125, 0.035],
    [0.125, 0.035],
    [0.125, 0.27],
    [0.1, 0.35],
    [0, 0.4],
    [-0.1, 0.35],
    [-0.125, 0.27],
  ];

  b.extrude(doorInset, {
    at: [0, 0.105, 0.607],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.008,
    color: RED_DARK,
    name: "doorInset",
  });

  // Door planks and a big round brass handle.
  for (const x of [-0.075, 0, 0.075]) {
    b.rod([x, 0.14, 0.62], [x, 0.43, 0.62], 0.009, {
      color: WOOD_LIGHT,
    });
  }
  sphere(0.026, YELLOW, [0.09, 0.29, 0.64]);

  // Door awning.
  b.extrude(
    [
      [-0.27, 0],
      [0.27, 0],
      [0.21, 0.11],
      [-0.21, 0.11],
    ],
    {
      at: [0, 0.5, 0.61],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.006,
      color: RED,
      name: "doorAwning",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Windows

  function windowAssembly(
    y: number,
    width: number,
    height: number,
    z: number,
    trim = CREAM_LIGHT,
  ) {
    box([width + 0.055, height + 0.055, 0.035], trim, [0, y, z]);
    box([width, height, 0.014], WINDOW, [0, y, z + 0.022]);
    frontPlane([width * 0.82, height * 0.8], WINDOW_GLOW, [0, y, z + 0.032]);

    box([0.018, height * 0.84, 0.018], trim, [0, y, z + 0.044]);
    box([width * 0.84, 0.018, 0.018], trim, [0, y, z + 0.045]);

    // Little flower-like highlight in the upper panes.
    sphere(0.018, WHITE, [-width * 0.2, y + height * 0.22, z + 0.055]);
    sphere(0.018, WHITE, [width * 0.2, y + height * 0.22, z + 0.055]);
  }

  windowAssembly(0.88, 0.2, 0.25, 0.535);
  windowAssembly(1.25, 0.16, 0.2, 0.49);

  // Painted shutters flank the lower window.
  for (const s of [-1, 1]) {
    box([0.095, 0.24, 0.03], BLUE, [s * 0.18, 0.89, 0.55]);
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * (0.145 + i * 0.025), 0.79, 0.574],
        [s * (0.205 + i * 0.025), 0.98, 0.574],
        0.008,
        { color: BLUE },
      );
    }
  }

  // Flower boxes under the lower window.
  box([0.42, 0.09, 0.18], WOOD, [0, 0.67, 0.62]);
  box([0.38, 0.045, 0.14], WOOD_LIGHT, [0, 0.72, 0.635]);

  for (const flower of [
    [-0.14, PINK],
    [-0.07, YELLOW],
    [0, WHITE],
    [0.08, PINK],
    [0.15, YELLOW],
  ] as [number, string][]) {
    b.rod([flower[0], 0.72, 0.64], [flower[0], 0.81, 0.64], 0.008, {
      color: GREEN_DARK,
    });
    sphere(0.035, flower[1], [flower[0], 0.82, 0.64]);
    sphere(0.015, YELLOW, [flower[0], 0.82, 0.67]);
  }

  // ------------------------------------------------------------------------------------------------
  // Balcony and upper gallery

  cyl(0.61, 0.055, WOOD, [0, 1.56, 0], 12);
  cyl(0.56, 0.035, CREAM_LIGHT, [0, 1.595, 0], 12);

  // Balcony edge band.
  b.sweep(
    polyline(
      Array.from({ length: 17 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return [Math.sin(a) * 0.61, 1.63, Math.cos(a) * 0.61];
      }),
      { closed: true },
    ),
    0.026,
    { color: RED_DARK },
  );

  // Eight simple railing posts.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.55;
    const z = Math.cos(a) * 0.55;
    cyl(0.018, 0.22, CREAM_LIGHT, [x, 1.73, z], 6);
    sphere(0.028, RED, [x, 1.85, z]);
  }

  // Upper handrail.
  b.sweep(
    polyline(
      Array.from({ length: 25 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return [Math.sin(a) * 0.57, 1.86, Math.cos(a) * 0.57];
      }),
      { closed: true },
    ),
    0.025,
    { color: CREAM_LIGHT },
  );

  // Small gallery door.
  box([0.16, 0.3, 0.035], WOOD, [0, 1.7, 0.49]);
  box([0.12, 0.24, 0.01], BLUE, [0, 1.71, 0.515]);
  box([0.012, 0.25, 0.012], CREAM_LIGHT, [0, 1.71, 0.528]);
  sphere(0.018, YELLOW, [0.06, 1.68, 0.54]);

  // ------------------------------------------------------------------------------------------------
  // Cap and roof

  // Pale collar under the roof.
  cyl(0.51, 0.09, CREAM_LIGHT, [0, 1.72, 0], 10);
  cyl(0.48, 0.05, RED_DARK, [0, 1.78, 0], 10);

  // Broad candy-red conical roof.
  b.part(
    new THREE.ConeGeometry(0.62, 0.42, 10),
    RED,
    {
      at: [0, 1.99, 0],
      flat: true,
    },
  );

  // Roof stripes radiating upward.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 0.31;
    const z = Math.cos(a) * 0.31;
    b.rod([0, 1.81, 0], [x, 2.17, z], 0.012, {
      color: RED_LIGHT,
    });
  }

  // Cap finial.
  cyl(0.035, 0.14, WOOD, [0, 2.27, 0], 8);
  sphere(0.065, YELLOW, [0, 2.37, 0]);

  // A tiny cheerful flag.
  b.extrude(
    [
      [0, 0],
      [0.22, 0.04],
      [0.16, 0.13],
      [0, 0.16],
    ],
    {
      at: [0.035, 2.29, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: BLUE,
      name: "flag",
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Rotor axle, hub, and four sails

  const rotorY = 1.93;
  const rotorZ = 0.61;

  // Axle projects from the front face toward the viewer.
  cyl(0.095, 0.24, WOOD, [0, rotorY, rotorZ], 10);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 10), WOOD_LIGHT, {
    at: [0, rotorY, rotorZ + 0.13],
    dir: [0, 0, 1],
    flat: true,
  });

  // Four broad, tapered wooden sail blades.
  const bladeOutline: [number, number][] = [
    [-0.095, 0.02],
    [0.095, 0.02],
    [0.085, 0.2],
    [0.06, 0.56],
    [0.035, 0.96],
    [-0.018, 1.1],
    [-0.068, 0.86],
    [-0.09, 0.45],
  ];

  const stripeOutline: [number, number][] = [
    [-0.05, 0.17],
    [0.05, 0.17],
    [0.045, 0.34],
    [0.03, 0.67],
    [0.015, 0.88],
    [-0.018, 0.84],
    [-0.04, 0.56],
  ];

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const radial: [number, number, number] = [Math.sin(a), Math.cos(a), 0];
    const across: [number, number, number] = [Math.cos(a), -Math.sin(a), 0];

    b.extrude(bladeOutline, {
      at: [0, rotorY, rotorZ + 0.24],
      x: across,
      y: radial,
      thickness: 0.065,
      bevel: 0.008,
      color: WOOD,
      name: `sail${i + 1}`,
    });

    // Cream inner stripe gives the sails a toy windmill graphic.
    b.extrude(stripeOutline, {
      at: [
        radial[0] * 0.012,
        rotorY + radial[1] * 0.012,
        rotorZ + 0.278,
      ],
      x: across,
      y: radial,
      thickness: 0.012,
      color: CREAM_LIGHT,
      name: `sailStripe${i + 1}`,
    });

    // Red painted outer tip.
    b.extrude(
      [
        [-0.05, 0.78],
        [0.035, 0.78],
        [0.018, 1.04],
        [-0.018, 1.1],
        [-0.068, 0.86],
      ],
      {
        at: [
          radial[0] * 0.012,
          rotorY + radial[1] * 0.012,
          rotorZ + 0.286,
        ],
        x: across,
        y: radial,
        thickness: 0.014,
        color: RED,
        name: `sailTip${i + 1}`,
      },
    );
  }

  // Layered hub: dark backing, cream face, and bright brass centre.
  sphere(0.18, RED_DARK, [0, rotorY, rotorZ + 0.31]);
  sphere(0.13, CREAM_LIGHT, [0, rotorY, rotorZ + 0.34]);
  sphere(0.075, YELLOW, [0, rotorY, rotorZ + 0.38]);
  sphere(0.035, WOOD, [0, rotorY, rotorZ + 0.42]);

  // Decorative four small bolts around the hub.
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    sphere(
      0.018,
      RED,
      [Math.sin(a) * 0.1, rotorY + Math.cos(a) * 0.1, rotorZ + 0.41],
    );
  }

  // ------------------------------------------------------------------------------------------------
  // Side mill details and trim

  // A tiny side vent on the viewer's left.
  box([0.16, 0.13, 0.025], WOOD, [-0.47, 1.15, 0.03]);
  box([0.11, 0.08, 0.012], WINDOW, [-0.47, 1.15, 0.048]);

  // Little cream pennant-like trim along the roof edge.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 0.49;
    const z = Math.cos(a) * 0.49;
    b.extrude(
      [
        [0, 0],
        [0.06, 0],
        [0.03, -0.06],
      ],
      {
        at: [x, 1.82, z],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        color: CREAM_LIGHT,
        name: "roofTrim",
      },
    );
  }

  // Two flower pots on the balcony corners.
  for (const x of [-0.42, 0.42]) {
    b.part(
      new THREE.CylinderGeometry(0.075, 0.055, 0.12, 8),
      RED,
      { at: [x, 1.69, 0.32], flat: true },
    );
    cyl(0.025, 0.13, GREEN_DARK, [x, 1.78, 0.32], 6);
    sphere(0.055, PINK, [x - 0.045, 1.85, 0.32]);
    sphere(0.05, YELLOW, [x + 0.045, 1.84, 0.32]);
    sphere(0.018, WHITE, [x, 1.88, 0.35]);
  }

  // Two painted stones at the threshold, keeping the lowest model detail close to the floor.
  box([0.22, 0.07, 0.16], TOWER_SHADOW, [-0.16, 0.035, 0.57]);
  box([0.22, 0.07, 0.16], TOWER_LIGHT, [0.16, 0.035, 0.57]);

  return b.root;
}
