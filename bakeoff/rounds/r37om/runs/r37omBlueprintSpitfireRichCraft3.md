```ts
import * as THREE from "three";
import { createBuilder, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a luminous cyanotype blueprint.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#04172f";
  const NAVY = "#07294a";
  const BLUE = "#0b4d73";
  const MID = "#08799b";
  const CYAN = "#18b7c7";
  const LIGHT = "#76eff0";
  const PAPER = "#b9ffff";
  const GLASS = "#06395d";
  const RED = "#56d4df";

  const blueprint = paint((p, n) => {
    const light = Math.max(0, n.y * 0.55 + n.z * 0.3 + 0.2);
    const grid = Math.sin(p.x * 80) * Math.sin(p.z * 80);
    return light > 0.42
      ? grid > 0.82 ? PAPER : LIGHT
      : light > 0.12 ? CYAN
      : BLUE;
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = BLUE,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any = CYAN,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      flat: true,
    });

  const cylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    dir: [number, number, number],
    color: any = MID,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any = CYAN,
  ) => b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "flat" });

  const panelLine = (
    a: [number, number, number],
    c: [number, number, number],
    width = 0.012,
    color: any = LIGHT,
  ) => rod(a, c, width, color);

  // ---------------------------------------------------------------------------
  // Fuselage: a compact, broad-nosed elliptical fighter body.
  // ---------------------------------------------------------------------------

  const fuselagePath = [
    { at: [0, 0.79, -1.30], w: 0.08, h: 0.08 },
    { at: [0, 0.79, -1.08], w: 0.19, h: 0.18 },
    { at: [0, 0.80, -0.78], w: 0.28, h: 0.27 },
    { at: [0, 0.82, -0.38], w: 0.36, h: 0.35 },
    { at: [0, 0.84, 0.10], w: 0.43, h: 0.43 },
    { at: [0, 0.87, 0.52], w: 0.40, h: 0.40 },
    { at: [0, 0.87, 0.87], w: 0.33, h: 0.34 },
    { at: [0, 0.85, 1.14], w: 0.23, h: 0.25 },
    { at: [0, 0.83, 1.34], w: 0.12, h: 0.14 },
  ];

  const fuselage = b.loft(fuselagePath, {
    color: blueprint,
    section: { ngon: 10 },
    caps: "round",
    name: "fuselage",
    group: "airframe",
  });

  // Lower belly and upper spine accent strips.
  b.sweep(
    [
      [0, 0.61, -1.14],
      [0, 0.59, -0.5],
      [0, 0.62, 0.28],
      [0, 0.68, 0.96],
      [0, 0.72, 1.26],
    ],
    0.025,
    { color: NAVY, caps: "flat", section: { ngon: 6 }, name: "bellyRail" },
  );
  b.sweep(
    [
      [0, 1.08, -0.76],
      [0, 1.14, -0.2],
      [0, 1.19, 0.40],
      [0, 1.18, 0.75],
    ],
    0.018,
    { color: LIGHT, caps: "flat", section: { ngon: 6 }, name: "spineHighlight" },
  );

  // Fuselage blueprint station rings and panel seams.
  for (const z of [-1.04, -0.74, -0.38, 0.04, 0.43, 0.77, 1.05]) {
    const half = z > 0.8 ? 0.26 : z > 0.3 ? 0.39 : 0.34;
    const h = z > 0.8 ? 0.25 : 0.38;
    panelLine([-half, 0.82, z], [half, 0.82, z], 0.009, LIGHT);
    panelLine([0, 0.82 - h, z], [0, 0.82 + h, z], 0.007, MID);
  }
  for (const side of [-1, 1]) {
    panelLine([side * 0.36, 0.72, -0.65], [side * 0.40, 0.91, 0.52], 0.008, LIGHT);
    panelLine([side * 0.39, 0.77, -0.22], [side * 0.40, 0.82, 0.38], 0.006, PAPER);
  }

  // ---------------------------------------------------------------------------
  // Main elliptical Spitfire wings, swept gently back with clipped tips.
  // ---------------------------------------------------------------------------

  const wingOutline: [number, number, "sharp"?][] = [
    [0.03, 0.45, "sharp"],
    [0.38, 0.32, "sharp"],
    [0.92, 0.05, "sharp"],
    [1.55, -0.10, "sharp"],
    [1.78, -0.28, "sharp"],
    [1.66, -0.42, "sharp"],
    [1.20, -0.34, "sharp"],
    [0.58, -0.10, "sharp"],
    [0.03, -0.02, "sharp"],
  ];

  const wings: any[] = [];
  for (const side of [1, -1]) {
    const wing = b.extrude(wingOutline, {
      at: [0, 0.79, 0.13],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.065, 0.045],
      bevel: 0.012,
      color: blueprint,
      name: side > 0 ? "wingL" : "wingR",
      group: "airframe",
    });
    wings.push(wing);

    // Leading-edge bright line and trailing-edge structure.
    panelLine(
      [side * 0.10, 0.84, 0.43],
      [side * 1.63, 0.80, -0.27],
      0.018,
      LIGHT,
    );
    panelLine(
      [side * 0.19, 0.75, 0.02],
      [side * 1.56, 0.73, -0.34],
      0.012,
      MID,
    );

    // Wing ribs, deliberately oversized like drawn blueprint construction lines.
    for (let i = 0; i < 6; i++) {
      const x = 0.35 + i * 0.22;
      const frontZ = 0.33 - i * 0.08;
      const backZ = -0.03 - i * 0.055;
      panelLine(
        [side * x, 0.835, frontZ],
        [side * (x + 0.10), 0.775, backZ],
        0.007,
        CYAN,
      );
    }

    // Cannon ports.
    for (const x of [0.72, 1.02]) {
      cylinder(0.026, 0.012, [side * x, 0.84, 0.11], [0, 1, 0], PAPER, 8);
      cylinder(0.012, 0.016, [side * x, 0.85, 0.11], [0, 1, 0], INK, 8);
    }
  }

  // Roundels, made as readable cyanotype decals on each wing.
  const roundel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#06294a" stroke="#b9ffff" stroke-width="5"/>
      <circle cx="50" cy="50" r="31" fill="#18b7c7" stroke="#b9ffff" stroke-width="4"/>
      <circle cx="50" cy="50" r="16" fill="#b9ffff"/>
    </svg>`,
    { size: 192 },
  );

  for (const side of [1, -1]) {
    const wingSurface = b.surface(wings[side > 0 ? 0 : 1]);
    const hit = wingSurface.nearest([side * 0.82, 0.86, 0.02]);
    if (hit) {
      b.decal(wingSurface, roundel, {
        at: hit,
        dir: [0, 1, 0],
        up: [0, 0, 1],
        size: [0.30, 0.30],
        lift: 0.004,
        mirror: side < 0,
        name: side > 0 ? "roundelL" : "roundelR",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Tailplane and large vertical rudder.
  // ---------------------------------------------------------------------------

  const tailplane: [number, number, "sharp"?][] = [
    [0.03, 0.10, "sharp"],
    [0.28, 0.03, "sharp"],
    [0.72, -0.02, "sharp"],
    [0.91, -0.15, "sharp"],
    [0.75, -0.25, "sharp"],
    [0.35, -0.18, "sharp"],
    [0.03, -0.04, "sharp"],
  ];

  for (const side of [1, -1]) {
    b.extrude(tailplane, {
      at: [0, 0.90, -1.00],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.042,
      bevel: 0.008,
      color: blueprint,
      name: side > 0 ? "tailplaneL" : "tailplaneR",
      group: "tail",
    });
    panelLine([side * 0.06, 0.93, -0.90], [side * 0.79, 0.91, -1.12], 0.012, LIGHT);
  }

  const fin = b.extrude(
    [
      [-0.03, 0.02, "sharp"],
      [0.03, 0.02, "sharp"],
      [0.29, 0.22, "sharp"],
      [0.25, 0.62, "sharp"],
      [0.11, 0.83, "sharp"],
      [0.02, 0.95, "sharp"],
      [-0.03, 0.89, "sharp"],
    ],
    {
      at: [0, 0.85, -1.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.008,
      color: blueprint,
      name: "rudderFin",
      group: "tail",
    },
  );

  panelLine([0, 1.00, -0.97], [0, 1.63, -0.82], 0.015, LIGHT);
  panelLine([0, 1.12, -1.02], [0, 1.47, -1.01], 0.009, CYAN);
  panelLine([0, 1.30, -1.00], [0, 1.50, -0.86], 0.007, MID);

  // Rudder hinge and tail edge.
  rod([0, 0.96, -1.04], [0, 1.58, -0.85], 0.018, PAPER);

  // ---------------------------------------------------------------------------
  // Cockpit: dark faceted canopy, raised frame, and rear fairing.
  // ---------------------------------------------------------------------------

  const canopy = sphere(0.23, [0, 1.13, 0.38], GLASS, [1.0, 0.62, 1.42]);
  // Canopy longitudinal frame and windshield frame.
  panelLine([-0.20, 1.17, 0.25], [0.20, 1.17, 0.25], 0.018, PAPER);
  panelLine([-0.19, 1.20, 0.53], [0.19, 1.20, 0.53], 0.014, CYAN);
  panelLine([-0.17, 1.25, 0.18], [-0.17, 1.13, 0.63], 0.012, LIGHT);
  panelLine([0.17, 1.25, 0.18], [0.17, 1.13, 0.63], 0.012, LIGHT);
  rod([0, 1.29, 0.08], [0, 1.22, 0.67], 0.015, PAPER);

  // Sliding canopy rails.
  for (const side of [-1, 1]) {
    rod(
      [side * 0.20, 1.00, 0.05],
      [side * 0.18, 1.04, 0.73],
      0.014,
      MID,
    );
  }
  // Headrest behind canopy.
  box([0.30, 0.17, 0.22], [0, 1.04, -0.02], NAVY, [0, 0, 0]);

  // ---------------------------------------------------------------------------
  // Nose, spinner, propeller, exhaust stacks, and engine paneling.
  // ---------------------------------------------------------------------------

  cylinder(0.17, 0.22, [0, 0.83, 1.37], [0, 0, 1], MID, 12);
  cylinder(0.115, 0.12, [0, 0.83, 1.53], [0, 0, 1], CYAN, 10);
  cylinder(0.065, 0.07, [0, 0.83, 1.62], [0, 0, 1], PAPER, 10);

  // Cowling rings.
  for (const z of [1.16, 1.28, 1.40]) {
    cylinder(0.215 - (z - 1.16) * 0.12, 0.018, [0, 0.83, z], [0, 0, 1], LIGHT, 12);
  }
  for (const side of [-1, 1]) {
    for (const y of [0.70, 0.80, 0.91, 1.00]) {
      rod([side * 0.18, y, 1.18], [side * 0.12, y, 1.45], 0.009, CYAN);
    }
  }

  // Three broad propeller blades in the plane facing the viewer.
  for (let i = 0; i < 3; i++) {
    const angle = (i * 120 + 18) * Math.PI / 180;
    const xAxis = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
    const yAxis = new THREE.Vector3(-Math.sin(angle), Math.cos(angle), 0);
    b.extrude(
      [
        [-0.055, 0.00, "sharp"],
        [0.055, 0.00, "sharp"],
        [0.14, 0.38, "sharp"],
        [0.035, 0.58, "sharp"],
        [-0.035, 0.52, "sharp"],
        [-0.10, 0.18, "sharp"],
      ],
      {
        at: [0, 0.83, 1.68],
        x: [xAxis.x, xAxis.y, 0],
        y: [yAxis.x, yAxis.y, 0],
        thickness: 0.035,
        bevel: 0.006,
        color: blueprint,
        name: `propellerBlade${i + 1}`,
        group: "propeller",
      },
    );
  }
  cylinder(0.09, 0.08, [0, 0.83, 1.70], [0, 0, 1], PAPER, 10);
  cylinder(0.045, 0.10, [0, 0.83, 1.76], [0, 0, 1], INK, 8);

  // Exhaust outlets, six on each side.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const z = 0.66 + i * 0.075;
      cylinder(0.022, 0.075, [side * 0.37, 0.88, z], [side, 0, 0], PAPER, 7);
      sphere(0.026, [side * 0.415, 0.88, z], INK, [1, 1, 0.7]);
    }
  }

  // ---------------------------------------------------------------------------
  // Landing gear: two wheels, struts, and a tail skid.
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    const wheelX = side * 0.48;
    rod([side * 0.28, 0.68, 0.05], [wheelX, 0.24, 0.10], 0.027, NAVY);
    rod([side * 0.33, 0.67, 0.10], [wheelX, 0.24, 0.10], 0.018, LIGHT);
    cylinder(0.115, 0.075, [wheelX, 0.13, 0.10], [1, 0, 0], INK, 12);
    cylinder(0.060, 0.082, [wheelX, 0.13, 0.10], [1, 0, 0], CYAN, 10);
    cylinder(0.025, 0.090, [wheelX, 0.13, 0.10], [1, 0, 0], PAPER, 8);
    panelLine([side * 0.42, 0.28, 0.10], [side * 0.54, 0.28, 0.10], 0.009, PAPER);
  }

  // Tail wheel / skid touches the ground.
  rod([0, 0.58, -1.03], [0, 0.20, -1.15], 0.018, NAVY);
  cylinder(0.055, 0.05, [0, 0.095, -1.17], [1, 0, 0], INK, 10);
  cylinder(0.022, 0.058, [0, 0.095, -1.17], [1, 0, 0], PAPER, 8);

  // ---------------------------------------------------------------------------
  // Blueprint annotations, rivets, and aircraft identity marks.
  // ---------------------------------------------------------------------------

  // Rivet rows along the wing roots and tailplane.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const z = -0.42 + i * 0.095;
      sphere(0.012, [side * 0.40, 0.855, z], PAPER, [1, 0.7, 1]);
    }
    for (let i = 0; i < 5; i++) {
      const z = -1.17 + i * 0.10;
      sphere(0.010, [side * 0.64, 0.925, z], LIGHT, [1, 0.7, 1]);
    }
  }

  // Blueprint-style nose arrow and identification chevrons.
  panelLine([-0.09, 1.02, 0.98], [0, 1.08, 1.19], 0.010, PAPER);
  panelLine([0.09, 1.02, 0.98], [0, 1.08, 1.19], 0.010, PAPER);
  for (const side of [-1, 1]) {
    panelLine(
      [side * 0.13, 1.05, -0.50],
      [side * 0.25, 1.07, -0.40],
      0.010,
      CYAN,
    );
    panelLine(
      [side * 0.25, 1.07, -0.40],
      [side * 0.13, 1.05, -0.30],
      0.010,
      CYAN,
    );
  }

  // Small navigation lights.
  sphere(0.035, [-0.43, 0.82, 0.28], PAPER, [1, 0.65, 1]);
  sphere(0.035, [0.43, 0.82, 0.28], LIGHT, [1, 0.65, 1]);
  sphere(0.028, [0, 0.84, 1.30], PAPER, [1, 0.65, 1]);

  // A thin blueprint title plate tucked beneath the fuselage.
  box([0.34, 0.012, 0.21], [0, 0.575, -0.42], NAVY);
  panelLine([-0.13, 0.585, -0.49], [0.13, 0.585, -0.49], 0.006, PAPER);
  panelLine([-0.13, 0.585, -0.43], [0.10, 0.585, -0.43], 0.005, CYAN);
  panelLine([-0.13, 0.585, -0.37], [0.06, 0.585, -0.37], 0.005, LIGHT);

  // Propeller hub blueprint crosshair.
  panelLine([-0.16, 0.83, 1.77], [0.16, 0.83, 1.77], 0.006, PAPER);
  panelLine([0, 0.67, 1.77], [0, 0.99, 1.77], 0.006, PAPER);

  return b.root;
}
```