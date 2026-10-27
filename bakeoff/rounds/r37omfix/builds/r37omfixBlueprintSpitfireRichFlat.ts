import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with elliptical wings, clipped wingtips, canopy, propeller, roundels, panel lines, guns, exhausts and landing gear.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#061d45";
  const DEEP = "#082b5b";
  const BLUE = "#0d4077";
  const MID = "#176395";
  const CYAN = "#58d4e4";
  const PALE = "#b7f7f1";
  const WHITE = "#e5ffff";
  const RED = "#4c9bb5";
  const SHADOW = "#04132f";
  const GLASS = "#2d89b5";
  const GLOW = "#85eff0";

  const flat = { flat: true };

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      ...flat,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    scale: [number, number, number] = [1, 1, 1],
    segments = 12,
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.72))), color, {
      at,
      scale,
      ...flat,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments, 1), color, {
      at,
      dir,
      ...flat,
    });

  const cone = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number],
    segments = 10,
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments, 1), color, {
      at,
      dir,
      ...flat,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color, ...flat });

  const capsule = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.capsule(a, c, radius, { color, ...flat });

  const rivet = (at: [number, number, number], radius = 0.035, color = PALE) =>
    sphere(radius, at, color, [1, 1, 1], 7);

  const wingOutline: [number, number][] = [
    [0.05, -0.55],
    [1.0, -0.38],
    [2.55, -0.05],
    [4.35, 0.43],
    [5.02, 0.85],
    [5.25, 1.34],
    [4.78, 1.63],
    [3.55, 1.55],
    [2.18, 1.18],
    [0.72, 0.52],
  ];

  const tailWing: [number, number][] = [
    [0.03, -0.26],
    [0.72, -0.2],
    [1.82, 0.12],
    [2.45, 0.43],
    [2.38, 0.78],
    [1.72, 0.82],
    [0.76, 0.5],
  ];

  const tailFin: [number, number][] = [
    [0, 0],
    [0.22, 0.18],
    [0.34, 0.92],
    [0.27, 1.72],
    [0.08, 2.08],
    [-0.04, 1.1],
  ];

  // Fuselage: a long, gently tapering low-poly tube.
  const fuselagePath = catmull([
    [0, 2.18, -4.55],
    [0, 2.22, -3.85],
    [0, 2.27, -2.7],
    [0, 2.31, -1.25],
    [0, 2.34, 0.25],
    [0, 2.38, 1.65],
    [0, 2.43, 2.75],
    [0, 2.48, 3.7],
    [0, 2.43, 4.42],
    [0, 2.35, 4.7],
  ]);

  const fuselage = b.sweep(fuselagePath, (t) => {
    if (t < 0.16) return 0.39 + t * 1.7;
    if (t < 0.62) return 0.66;
    if (t < 0.84) return 0.64 - (t - 0.62) * 0.8;
    return 0.46 - (t - 0.84) * 1.9;
  }, {
    color: DEEP,
    sides: 10,
    caps: "round",
    ...flat,
  });

  // Belly keel and upper spine reinforce the distinctive elliptical fuselage.
  b.sweep(
    catmull([
      [0, 2.02, -3.5],
      [0, 1.83, -2.0],
      [0, 1.74, -0.15],
      [0, 1.82, 1.45],
      [0, 1.98, 3.35],
    ]),
    0.22,
    { color: SHADOW, sides: 7, caps: "round", ...flat },
  );

  b.sweep(
    catmull([
      [0, 2.6, -3.0],
      [0, 2.77, -1.2],
      [0, 2.84, 0.65],
      [0, 2.91, 2.0],
      [0, 2.85, 3.15],
    ]),
    0.13,
    { color: MID, sides: 7, caps: "round", ...flat },
  );

  // Main wings, one mirrored extruded slab per side.
  for (const s of [1, -1]) {
    b.extrude(wingOutline, {
      at: [s * 0.04, 2.28, -0.18],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.16, 0.1],
      bevel: 0.035,
      smoothing: 1,
      color: BLUE,
      ...flat,
    });

    // Pale leading-edge outline.
    const leading: [number, number, number][] = [
      [s * 0.15, 2.39, -0.6] as [number, number, number],
      [s * 1.05, 2.39, -0.43],
      [s * 2.55, 2.39, -0.1],
      [s * 4.32, 2.39, 0.38],
      [s * 4.92, 2.39, 0.8],
    ];
    for (let i = 0; i < leading.length - 1; i++) {
      rod(leading[i], leading[i + 1], 0.026, CYAN);
    }

    // Trailing flap seam and wing ribs.
    rod([s * 0.75, 2.39, 0.53], [s * 3.92, 2.39, 1.49], 0.018, CYAN);
    rod([s * 1.48, 2.4, 0.22], [s * 1.4, 2.4, 1.0], 0.014, MID);
    rod([s * 2.2, 2.4, 0.05], [s * 2.13, 2.4, 1.23], 0.014, MID);
    rod([s * 3.05, 2.4, 0.25], [s * 3.0, 2.4, 1.42], 0.014, MID);
    rod([s * 3.85, 2.4, 0.46], [s * 3.9, 2.4, 1.5], 0.014, MID);

    // Aileron hinge pins.
    for (let i = 0; i < 5; i++) {
      const x = 1.5 + i * 0.62;
      rivet([s * x, 2.43, 1.05 + i * 0.08], 0.027, PALE);
    }
  }

  // Wing root fairings.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.24, 2.25, -0.72],
        [s * 0.9, 2.29, -0.42],
        [s * 1.5, 2.31, 0.25],
        [s * 1.35, 2.3, 0.95],
      ]),
      0.16,
      { color: MID, sides: 7, caps: "round", ...flat },
    );
  }

  // Tailplanes.
  for (const s of [1, -1]) {
    b.extrude(tailWing, {
      at: [s * 0.02, 2.55, -3.73],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: [0.12, 0.075],
      bevel: 0.025,
      smoothing: 1,
      color: BLUE,
      ...flat,
    });
    rod([s * 0.2, 2.65, -3.9], [s * 2.22, 2.65, -3.35], 0.018, CYAN);
    rod([s * 1.05, 2.66, -3.65], [s * 1.0, 2.66, -3.12], 0.012, MID);
    rod([s * 1.6, 2.66, -3.47], [s * 1.55, 2.66, -3.02], 0.012, MID);
  }

  // Vertical tail fin and rudder seam.
  b.extrude(tailFin, {
    at: [0, 2.52, -3.8],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.025,
    smoothing: 1,
    color: BLUE,
    ...flat,
  });
  rod([0.075, 2.75, -3.58], [0.075, 4.17, -3.55], 0.022, CYAN);
  rod([0.075, 3.03, -3.63], [0.075, 3.97, -3.58], 0.014, MID);

  // Tail tip cap and rudder balance horn.
  cone(0.18, 0.42, [0, 2.52, -4.55], MID, [0, 0, -1], 8);
  rod([0, 3.52, -3.62], [0, 3.64, -3.24], 0.027, PALE);

  // Cockpit canopy, set high and slightly aft of centre.
  sphere(1, [0, 2.82, 1.1], GLASS, [0.5, 0.39, 1.15], 12);
  box([0.94, 0.045, 0.06], [0, 3.18, 0.55], PALE);
  rod([-0.42, 3.12, 0.5], [-0.42, 3.03, 1.75], 0.035, CYAN);
  rod([0.42, 3.12, 0.5], [0.42, 3.03, 1.75], 0.035, CYAN);
  rod([-0.44, 3.05, 1.75], [0, 3.1, 2.12], 0.035, CYAN);
  rod([0.44, 3.05, 1.75], [0, 3.1, 2.12], 0.035, CYAN);
  rod([0, 3.1, 0.35], [0, 3.1, 2.13], 0.025, MID);
  sphere(0.055, [0, 3.2, 1.38], WHITE, [1, 0.35, 1], 8);

  // Canopy rear fairing.
  b.sweep(
    catmull([
      [0, 2.7, 1.95],
      [0, 2.76, 2.42],
      [0, 2.7, 2.9],
      [0, 2.62, 3.25],
    ]),
    (t) => 0.27 - 0.12 * t,
    { color: MID, sides: 8, caps: "round", ...flat },
  );

  // Nose cowling bands.
  b.sweep(
    catmull([
      [0, 2.34, 3.28],
      [0, 2.36, 3.78],
      [0, 2.34, 4.26],
      [0, 2.3, 4.6],
    ]),
    (t) => 0.47 - t * 0.28,
    {
      color: BLUE,
      sides: 10,
      bands: [
        [0.25, CYAN],
        [0.52, BLUE],
        [0.77, CYAN],
        [1, DEEP],
      ],
      caps: "round",
      ...flat,
    },
  );

  // Six exhaust stacks on each side of the engine cowling.
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 2.78 + i * 0.22;
      rod([s * 0.43, 2.32, z], [s * 0.7, 2.28, z + 0.03], 0.045, PALE);
      sphere(0.052, [s * 0.7, 2.28, z + 0.03], CYAN, [1, 0.7, 1], 7);
    }
  }

  // Wing-mounted cannon fairings and gun barrels.
  for (const s of [1, -1]) {
    for (const x of [2.18, 3.38]) {
      b.sweep(
        catmull([
          [s * x, 2.3, 0.9],
          [s * x, 2.29, 1.48],
          [s * x, 2.29, 2.22],
        ]),
        (t) => 0.11 - t * 0.06,
        { color: MID, sides: 7, caps: "round", ...flat },
      );
      rod([s * x, 2.31, 2.05], [s * x, 2.31, 2.82], 0.045, PALE);
      cone(0.055, 0.18, [s * x, 2.31, 2.88], CYAN, [0, 0, 1], 8);
    }
  }

  // Main wing roundels: cyan outer ring, pale field and dark centre.
  for (const s of [1, -1]) {
    cylinder(0.42, 0.035, [s * 3.22, 2.43, 0.55], CYAN, [0, 1, 0], 16);
    cylinder(0.29, 0.043, [s * 3.22, 2.455, 0.55], PALE, [0, 1, 0], 16);
    cylinder(0.13, 0.05, [s * 3.22, 2.485, 0.55], RED, [0, 1, 0], 12);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      rivet([s * (3.22 + Math.cos(a) * 0.48), 2.48, 0.55 + Math.sin(a) * 0.48], 0.025, PALE);
    }
  }

  // Fuselage side roundels, viewed from either side.
  for (const s of [1, -1]) {
    cylinder(0.34, 0.035, [s * 0.66, 2.43, 0.0], CYAN, [s, 0, 0], 16);
    cylinder(0.23, 0.043, [s * 0.69, 2.43, 0.0], PALE, [s, 0, 0], 16);
    cylinder(0.105, 0.052, [s * 0.72, 2.43, 0.0], RED, [s, 0, 0], 12);
  }

  // Blueprint panel geometry along the fuselage.
  rod([-0.68, 2.58, -2.8], [0.68, 2.58, -2.8], 0.018, CYAN);
  rod([-0.7, 2.58, -2.45], [0.7, 2.58, -2.45], 0.014, MID);
  rod([-0.7, 2.58, 2.55], [0.7, 2.58, 2.55], 0.017, CYAN);
  rod([-0.52, 2.62, 3.05], [0.52, 2.62, 3.05], 0.014, MID);

  for (let i = 0; i < 8; i++) {
    const z = -3.18 + i * 0.63;
    rod([-0.52, 2.56, z], [-0.52, 2.56, z + 0.16], 0.012, MID);
    rod([0.52, 2.56, z], [0.52, 2.56, z + 0.16], 0.012, MID);
  }

  // Tail registration flashes.
  for (const s of [1, -1]) {
    box([0.02, 0.75, 0.18], [s * 0.07, 2.7, -4.05], PALE);
    box([0.025, 0.75, 0.18], [s * 0.1, 2.7, -4.28], CYAN);
  }

  // Propeller axle, spinner, and three broad blueprint blades.
  cylinder(0.13, 0.56, [0, 2.34, 4.86], PALE, [0, 0, 1], 12);
  cone(0.28, 0.76, [0, 2.34, 4.83], CYAN, [0, 0, 1], 12);
  sphere(0.12, [0, 2.34, 5.18], WHITE, [1, 1, 1], 10);

  const blade: [number, number][] = [
    [0.08, 0.05],
    [0.24, 0.28],
    [0.39, 0.88],
    [0.26, 1.42],
    [0.11, 1.55],
    [-0.02, 1.02],
    [-0.1, 0.3],
  ];
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    const xAxis: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const yAxis: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];
    b.extrude(blade, {
      at: [0, 2.34, 5.04],
      x: xAxis,
      y: yAxis,
      thickness: 0.075,
      bevel: 0.02,
      smoothing: 1,
      color: BLUE,
      ...flat,
    });
    rod(
      [Math.cos(a) * 0.16, 2.34 + Math.sin(a) * 0.16, 5.09],
      [Math.cos(a) * 0.92, 2.34 + Math.sin(a) * 0.92, 5.09],
      0.022,
      PALE,
    );
  }

  // Propeller blade tip blocks and hub bolts.
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    const x = Math.cos(a) * 1.18;
    const y = 2.34 + Math.sin(a) * 1.18;
    box([0.12, 0.09, 0.09], [x, y, 5.09], PALE, [0, 0, a]);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    rivet([Math.cos(a) * 0.17, 2.34 + Math.sin(a) * 0.17, 5.22], 0.025, WHITE);
  }

  // Main landing gear struts and wheels.
  for (const s of [1, -1]) {
    rod([s * 1.05, 2.15, 0.15], [s * 1.18, 0.48, 0.5], 0.105, PALE);
    rod([s * 1.18, 0.58, 0.5], [s * 1.18, 0.33, 0.55], 0.06, CYAN);
    cylinder(0.28, 0.16, [s * 1.18, 0.25, 0.62], SHADOW, [1, 0, 0], 12);
    cylinder(0.17, 0.18, [s * 1.18, 0.25, 0.62], CYAN, [1, 0, 0], 12);
    cylinder(0.07, 0.2, [s * 1.18, 0.25, 0.62], PALE, [1, 0, 0], 10);
    rod([s * 1.18, 0.25, 0.78], [s * 1.18, 0.25, 0.98], 0.025, MID);
  }

  // Retracted tail wheel.
  rod([0, 2.0, -3.72], [0, 0.52, -3.85], 0.06, PALE);
  cylinder(0.18, 0.1, [0, 0.23, -3.89], SHADOW, [1, 0, 0], 10);
  cylinder(0.08, 0.12, [0, 0.23, -3.89], CYAN, [1, 0, 0], 8);

  // Small access hatches and fastener rows.
  for (const s of [1, -1]) {
    box([0.025, 0.22, 0.62], [s * 0.69, 2.08, -1.58], MID);
    box([0.025, 0.16, 0.38], [s * 0.7, 2.05, 1.82], CYAN);
    for (let i = 0; i < 5; i++) {
      rivet([s * 0.73, 2.2, -1.82 + i * 0.12], 0.022, PALE);
      rivet([s * 0.73, 2.18, 1.67 + i * 0.1], 0.02, PALE);
    }
  }

  // Pitot tube beneath the nose.
  rod([0, 2.08, 4.0], [0, 1.72, 4.72], 0.028, PALE);
  cone(0.045, 0.22, [0, 1.69, 4.8], CYAN, [0, -1, 0], 8);

  // Blueprint-style structural dots around the wing roots.
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = -0.56 + i * 0.28;
      rivet([s * (0.22 + i * 0.035), 2.43, z], 0.023, PALE);
    }
  }

  return b.root;
}
