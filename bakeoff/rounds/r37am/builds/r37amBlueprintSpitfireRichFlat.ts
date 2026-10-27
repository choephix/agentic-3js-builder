import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with swept elliptical wings, cockpit canopy, propeller, landing gear, guns, panel lines and RAF roundels.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#082b46";
  const DEEP = "#0b4164";
  const BLUE = "#176b91";
  const MID = "#238db0";
  const LIGHT = "#69c5d2";
  const PALE = "#b8edf0";
  const WHITE = "#e4ffff";
  const CANOPY = "#0a3556";
  const GLASS = "#4bb7c4";
  const TIRE = "#061b2c";
  const RED = "#d15459";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 10,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    scale: [number, number, number] = [1, 1, 1],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      scale,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, z, radius, { color, caps: "flat" });

  // ---------------------------------------------------------------------------
  // Main fuselage: broad engine cowling, narrow tail boom, and a pointed nose.
  // ---------------------------------------------------------------------------

  const fuselagePath = catmull([
    [0, 0.78, -1.78],
    [0, 0.78, -1.42],
    [0, 0.8, -0.75],
    [0, 0.84, 0.2],
    [0, 0.9, 0.95],
    [0, 0.94, 1.58],
    [0, 0.93, 1.88],
  ]);

  b.sweep(fuselagePath, (t) => {
    if (t < 0.18) return 0.13 + t * 0.24;
    if (t < 0.48) return 0.175 + (t - 0.18) * 0.06;
    if (t < 0.78) return 0.19 - (t - 0.48) * 0.07;
    return 0.17 - (t - 0.78) * 0.11;
  }, {
    color: BLUE,
    sides: 8,
    caps: "round",
    section: "circle",
    sectors: [
      [-55, 55, MID],
      [125, 235, DEEP],
    ],
    name: "fuselage",
    group: "airframe",
  });

  // Lower belly and upper spine bands make the silhouette read as painted blueprint metal.
  b.sweep(catmull([
    [0, 0.69, -1.48],
    [0, 0.67, -0.75],
    [0, 0.69, 0.22],
    [0, 0.76, 1.2],
  ]), 0.035, {
    color: INK,
    sides: 6,
    caps: "flat",
    name: "belly-seam",
  });

  b.sweep(catmull([
    [0, 0.96, -1.2],
    [0, 1.01, -0.35],
    [0, 1.08, 0.65],
    [0, 1.08, 1.25],
  ]), 0.018, {
    color: LIGHT,
    sides: 5,
    caps: "flat",
    name: "spine-highlight",
  });

  // Engine front ring and spinner.
  cyl(0.205, 0.055, [0, 0.91, 1.79], INK, 12, [Math.PI / 2, 0, 0]);
  cyl(0.18, 0.065, [0, 0.91, 1.84], LIGHT, 12, [Math.PI / 2, 0, 0]);
  b.part(new THREE.ConeGeometry(0.16, 0.34, 10), DEEP, {
    at: [0, 0.91, 2.02],
    dir: [0, 0, 1],
    flat: true,
  });
  cyl(0.038, 0.025, [0, 0.91, 2.2], PALE, 8, [Math.PI / 2, 0, 0]);

  // Cowling panel ribs.
  for (const z of [1.42, 1.53, 1.64, 1.74]) {
    b.sweep(catmull([
      [-0.13, 0.87, z],
      [-0.16, 0.9, z + 0.015],
      [-0.13, 0.96, z],
      [0.13, 0.96, z],
      [0.16, 0.9, z + 0.015],
      [0.13, 0.87, z],
    ]), 0.009, {
      color: PALE,
      sides: 5,
      caps: "flat",
      name: "cowling-rib",
    });
  }

  // ---------------------------------------------------------------------------
  // Main elliptical wings. The mirrored extrudes use the same profile and remain
  // deliberately chunky, like a blueprint puppet assembled from cut plates.
  // ---------------------------------------------------------------------------

  const mainWing: [number, number][] = [
    [0.04, -0.43],
    [0.55, -0.38],
    [1.18, -0.2],
    [1.62, 0.08],
    [1.75, 0.23],
    [1.62, 0.34],
    [1.18, 0.36],
    [0.58, 0.27],
    [0.04, 0.18],
  ];

  for (const s of [1, -1]) {
    b.extrude(mainWing, {
      at: [0, 0.78, 0.28],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.085,
      bevel: 0.018,
      smoothing: 1,
      color: BLUE,
      name: s > 0 ? "main-wing-L" : "main-wing-R",
      group: "wings",
    });

    // Wing leading-edge highlight.
    rod(
      [s * 0.12, 0.835, 0.2],
      [s * 1.56, 0.835, 0.48],
      0.013,
      PALE,
    );

    // Rear spar / flap line.
    rod(
      [s * 0.48, 0.832, -0.05],
      [s * 1.46, 0.832, 0.18],
      0.009,
      INK,
    );

    // Aileron seam.
    rod(
      [s * 0.82, 0.839, -0.18],
      [s * 1.48, 0.839, -0.05],
      0.007,
      LIGHT,
    );

    // Cannon blisters and wing guns, pointing forward.
    sphere(0.045, [s * 0.92, 0.85, 0.36], DEEP, [1.0, 0.7, 1.45]);
    rod([s * 0.92, 0.86, 0.4], [s * 0.92, 0.86, 0.72], 0.018, INK);
    rod([s * 1.12, 0.84, 0.31], [s * 1.12, 0.84, 0.65], 0.012, INK);

    // RAF roundel: pale outer disc, dark blue inner disc, cyan centre.
    cyl(0.205, 0.018, [s * 0.72, 0.845, 0.02], PALE, 18);
    cyl(0.145, 0.022, [s * 0.72, 0.858, 0.02], INK, 18);
    cyl(0.072, 0.026, [s * 0.72, 0.872, 0.02], RED, 16);
    cyl(0.032, 0.029, [s * 0.72, 0.887, 0.02], PALE, 12);
  }

  // Root fairings, chunky triangular-looking blocks.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, -0.3],
        [0.5, -0.28],
        [0.66, -0.03],
        [0.44, 0.22],
        [0, 0.2],
      ],
      {
        at: [0, 0.79, 0.22],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.12,
        bevel: 0.02,
        color: DEEP,
        name: "wing-root-fairing",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Cockpit and canopy, positioned behind the engine and above the wing.
  // ---------------------------------------------------------------------------

  box([0.34, 0.16, 0.42], [0, 1.09, -0.08], CANOPY);
  b.part(new THREE.SphereGeometry(0.24, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.62), GLASS, {
    at: [0, 1.16, 0.02],
    scale: [0.86, 0.65, 1.18],
    flat: true,
  });

  // Canopy centre frame and side rails.
  box([0.022, 0.18, 0.39], [0, 1.2, 0.04], PALE);
  for (const s of [1, -1]) {
    rod([s * 0.14, 1.115, -0.2], [s * 0.19, 1.19, 0.18], 0.012, PALE);
    rod([s * 0.17, 1.12, -0.2], [s * 0.17, 1.12, 0.2], 0.009, INK);
  }
  box([0.44, 0.025, 0.03], [0, 1.095, -0.25], LIGHT);

  // Small rear fuselage spine and antenna.
  box([0.09, 0.065, 0.44], [0, 1.08, -0.5], DEEP);
  rod([0, 1.11, -0.48], [0, 1.31, -0.7], 0.008, PALE);
  sphere(0.018, [0, 1.32, -0.71], RED);

  // ---------------------------------------------------------------------------
  // Tailplanes and tall rudder.
  // ---------------------------------------------------------------------------

  const tailWing: [number, number][] = [
    [0.02, -0.22],
    [0.46, -0.17],
    [0.7, -0.04],
    [0.63, 0.11],
    [0.3, 0.14],
    [0.02, 0.09],
  ];

  for (const s of [1, -1]) {
    b.extrude(tailWing, {
      at: [0, 0.91, -1.35],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.055,
      bevel: 0.012,
      color: MID,
      name: "tailplane",
      group: "tail",
    });
    rod([s * 0.07, 0.952, -1.41], [s * 0.61, 0.952, -1.27], 0.009, PALE);
    rod([s * 0.24, 0.955, -1.34], [s * 0.58, 0.955, -1.25], 0.006, INK);
  }

  // Vertical fin and rudder, drawn in the X-Z plane and extruded sideways.
  b.extrude(
    [
      [0.02, 0],
      [0.1, 0.04],
      [0.16, 0.37],
      [0.11, 0.57],
      [0.03, 0.78],
      [-0.04, 0.72],
      [-0.05, 0.08],
    ],
    {
      at: [0, 0.91, -1.47],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.07,
      bevel: 0.012,
      color: DEEP,
      name: "vertical-tail",
      group: "tail",
    },
  );
  rod([0.041, 0.98, -1.38], [0.041, 1.43, -0.78], 0.012, PALE);
  rod([0.045, 0.97, -1.39], [0.045, 1.27, -0.94], 0.008, INK);
  box([0.085, 0.045, 0.25], [0, 1.06, -1.18], LIGHT);

  // ---------------------------------------------------------------------------
  // Landing gear: two main wheels and a small tailwheel.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    rod([s * 0.28, 0.76, 0.05], [s * 0.38, 0.27, 0.05], 0.025, INK);
    box([0.075, 0.25, 0.08], [s * 0.38, 0.23, 0.05], DEEP, [0, 0, s * 0.12]);
    cyl(0.13, 0.07, [s * 0.4, 0.14, 0.05], TIRE, 12, [0, 0, Math.PI / 2]);
    cyl(0.065, 0.078, [s * 0.4, 0.14, 0.05], LIGHT, 10, [0, 0, Math.PI / 2]);
    cyl(0.026, 0.084, [s * 0.4, 0.14, 0.05], INK, 8, [0, 0, Math.PI / 2]);
  }

  rod([0, 0.64, -1.35], [0, 0.19, -1.47], 0.018, INK);
  cyl(0.075, 0.05, [0, 0.09, -1.49], TIRE, 10, [0, 0, Math.PI / 2]);
  cyl(0.032, 0.06, [0, 0.09, -1.49], LIGHT, 8, [0, 0, Math.PI / 2]);

  // Gear-door blueprint outlines.
  for (const s of [1, -1]) {
    box([0.16, 0.012, 0.23], [s * 0.35, 0.27, 0.06], PALE, [0, s * 0.12, 0]);
    rod([s * 0.29, 0.28, -0.04], [s * 0.42, 0.28, -0.04], 0.006, INK);
  }

  // ---------------------------------------------------------------------------
  // Three-bladed propeller. Each blade is an extruded, tapered cyan plate.
  // ---------------------------------------------------------------------------

  const blade: [number, number][] = [
    [0.015, 0],
    [0.075, 0.09],
    [0.13, 0.46],
    [0.085, 0.72],
    [-0.01, 0.77],
    [-0.035, 0.48],
    [-0.025, 0.12],
  ];

  for (let i = 0; i < 3; i++) {
    const a = (i * 120 * Math.PI) / 180;
    const x = [Math.cos(a), Math.sin(a), 0] as [number, number, number];
    const y = [-Math.sin(a), Math.cos(a), 0] as [number, number, number];
    b.extrude(blade, {
      at: [0, 0.91, 2.17],
      x,
      y,
      thickness: 0.035,
      bevel: 0.006,
      color: LIGHT,
      name: "propeller-blade",
      group: "propeller",
    });
  }
  cyl(0.075, 0.1, [0, 0.91, 2.17], INK, 10, [Math.PI / 2, 0, 0]);
  cyl(0.037, 0.115, [0, 0.91, 2.23], PALE, 8, [Math.PI / 2, 0, 0]);

  // Thin blueprint dimension-like lines along the fuselage and wing roots.
  for (const z of [-1.12, -0.72, -0.32, 0.32, 0.72, 1.08]) {
    rod([-0.16, 0.93, z], [0.16, 0.93, z], 0.0045, PALE);
  }

  // Small inspection plates on the nose.
  for (const s of [1, -1]) {
    box([0.02, 0.11, 0.18], [s * 0.17, 0.93, 1.42], PALE, [0, 0, s * 0.06]);
    sphere(0.014, [s * 0.18, 1.0, 1.49], INK);
    sphere(0.014, [s * 0.18, 1.0, 1.36], INK);
  }

  return b.root;
}
