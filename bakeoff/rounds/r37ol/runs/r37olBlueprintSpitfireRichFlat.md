```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";

export const meta = {
  name: "cyanotype-spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint."
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#062c4a";
  const DEEP = "#084568";
  const BLUE = "#0d638b";
  const MID = "#168ab0";
  const CYAN = "#65d4e4";
  const PALE = "#b9f4f0";
  const WHITE = "#e5ffff";
  const GLASS = "#31b8cf";
  const RUBBER = "#031c31";

  const zAxis = [0, 0, 1] as const;
  const yAxis = [0, 1, 0] as const;

  // Main aerodynamic skeleton: the fuselage is deliberately long, narrow and slightly bulbous.
  const fuselagePath = catmull([
    [0, 0.83, -1.55],
    [0, 0.84, -1.15],
    [0, 0.86, -0.55],
    [0, 0.88, 0.25],
    [0, 0.9, 0.86],
    [0, 0.91, 1.38],
    [0, 0.91, 1.63],
  ]);
  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.14) return 0.075 + t * 0.35;
      if (t < 0.48) return 0.115;
      if (t < 0.78) return 0.14 - (t - 0.48) * 0.04;
      return 0.128 - (t - 0.78) * 0.26;
    },
    {
      color: DEEP,
      sides: 8,
      caps: "round",
      name: "fuselage",
      bands: [
        [0.08, MID],
        [0.22, DEEP],
        [0.73, BLUE],
        [0.94, INK],
        [1, DEEP],
      ],
    },
  );

  // Pale blueprint belly and a strong longitudinal highlight.
  b.sweep(fuselagePath, (t) => 0.14 - t * 0.035, {
    color: PALE,
    sides: 6,
    sectors: [[112, 248, PALE]],
    caps: "none",
    name: "belly-countershade",
  });
  b.sweep(
    catmull([
      [0, 0.942, -1.25],
      [0, 0.99, -0.4],
      [0, 1.015, 0.45],
      [0, 1.02, 1.25],
    ]),
    0.012,
    { color: CYAN, caps: "flat", name: "fuselage-highlight" },
  );

  // Spitfire's broad elliptical wings, made as thick blueprint plates.
  const wingOutline: [number, number, "sharp"][] = [
    [0, -0.055, "sharp"],
    [0.28, -0.055, "sharp"],
    [0.88, -0.045, "sharp"],
    [1.34, -0.015, "sharp"],
    [1.72, 0.035, "sharp"],
    [1.98, 0.105, "sharp"],
    [2.08, 0.17, "sharp"],
    [1.97, 0.23, "sharp"],
    [1.62, 0.28, "sharp"],
    [1.1, 0.29, "sharp"],
    [0.62, 0.25, "sharp"],
    [0.25, 0.19, "sharp"],
    [0, 0.16, "sharp"],
  ];

  for (const side of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [0, 0.82, -0.12],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.055, 0.035],
      bevel: 0.012,
      smoothing: 1,
      color: BLUE,
      name: side > 0 ? "left-wing" : "right-wing",
    });

    // Wing root fairing and leading-edge trace.
    b.rod(
      [side * 0.2, 0.89, -0.52],
      [side * 1.86, 0.91, 0.04],
      0.014,
      { color: CYAN, caps: "flat", name: side > 0 ? "left-leading-edge" : "right-leading-edge" },
    );
    b.rod(
      [side * 0.34, 0.865, 0.32],
      [side * 1.76, 0.86, 0.2],
      0.009,
      { color: PALE, caps: "flat", name: side > 0 ? "left-wing-plan-line" : "right-wing-plan-line" },
    );

    // Aileron hinge line.
    b.rod(
      [side * 0.82, 0.86, 0.27],
      [side * 1.72, 0.86, 0.29],
      0.006,
      { color: INK, caps: "flat", name: side > 0 ? "left-aileron-seam" : "right-aileron-seam" },
    );

    // Cannons projecting from the wing leading edge.
    b.rod(
      [side * 1.02, 0.87, 0.18],
      [side * 1.02, 0.87, 0.57],
      0.018,
      { color: PALE, caps: "flat", name: side > 0 ? "left-cannon" : "right-cannon" },
    );
    b.part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.035, 8),
      INK,
      { at: [side * 1.02, 0.87, 0.58], dir: zAxis, name: side > 0 ? "left-cannon-muzzle" : "right-cannon-muzzle" },
    );
  }

  // Tailplane and rudder.
  const tailplane: [number, number, "sharp"][] = [
    [0, -0.025, "sharp"],
    [0.32, -0.025, "sharp"],
    [0.73, 0.01, "sharp"],
    [0.99, 0.07, "sharp"],
    [0.94, 0.16, "sharp"],
    [0.52, 0.18, "sharp"],
    [0.22, 0.14, "sharp"],
    [0, 0.12, "sharp"],
  ];
  for (const side of [-1, 1]) {
    b.extrude(tailplane, {
      at: [0, 0.96, -1.1],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.028,
      bevel: 0.006,
      color: MID,
      name: side > 0 ? "left-tailplane" : "right-tailplane",
    });
    b.rod(
      [side * 0.25, 0.995, -1.02],
      [side * 0.85, 0.995, -1.0],
      0.007,
      { color: CYAN, caps: "flat", name: side > 0 ? "left-tail-trim" : "right-tail-trim" },
    );
  }

  b.extrude(
    [
      [-0.035, 0, "sharp"],
      [0.035, 0, "sharp"],
      [0.15, 0.46, "sharp"],
      [0.08, 0.72, "sharp"],
      [-0.08, 0.72, "sharp"],
      [-0.15, 0.46, "sharp"],
    ],
    {
      at: [0, 0.96, -1.27],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: MID,
      name: "vertical-tail",
    },
  );
  b.rod([0, 1.22, -1.19], [0, 1.22, -0.87], 0.008, { color: CYAN, caps: "flat", name: "rudder-line" });

  // Raised cockpit canopy, with a stepped, glass-blue silhouette.
  b.sweep(
    catmull([
      [-0.0, 0.99, 0.43],
      [0, 1.075, 0.58],
      [0, 1.12, 0.83],
      [0, 1.085, 1.08],
      [0, 1.0, 1.22],
    ]),
    (t) => 0.105 - 0.035 * t,
    { color: GLASS, sides: 6, caps: "round", name: "cockpit-canopy" },
  );
  b.rod([0, 1.125, 0.62], [0, 1.125, 1.08], 0.009, { color: PALE, caps: "flat", name: "canopy-spine" });
  for (const side of [-1, 1]) {
    b.rod(
      [side * 0.052, 1.115, 0.55],
      [side * 0.052, 1.075, 1.13],
      0.006,
      { color: CYAN, caps: "flat", name: side > 0 ? "left-canopy-frame" : "right-canopy-frame" },
    );
  }

  // Nose spinner and four-bladed propeller at the +Z front.
  b.part(new THREE.ConeGeometry(0.145, 0.3, 10), PALE, {
    at: [0, 0.9, 1.74],
    dir: zAxis,
    name: "spinner",
  });
  b.part(new THREE.CylinderGeometry(0.18, 0.18, 0.045, 12), INK, {
    at: [0, 0.9, 1.86],
    dir: zAxis,
    name: "propeller-hub",
  });

  const blade = new THREE.BoxGeometry(0.075, 0.055, 0.62);
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2 + Math.PI / 4;
    const x = Math.cos(angle) * 0.2;
    const y = 0.9 + Math.sin(angle) * 0.2;
    b.part(blade, CYAN, {
      at: [x, y, 1.88],
      dir: zAxis,
      rotation: [0, 0, angle * 180 / Math.PI],
      name: `propeller-blade-${i}`,
    });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), PALE, { at: [x * 1.65, y + (y - 0.9) * 0.65, 1.9], name: `propeller-tip-${i}` });
  }

  // Blueprint panel seams, service hatches and national-style roundels.
  b.rod([0, 0.78, -0.92], [0, 0.78, 1.38], 0.006, { color: INK, caps: "flat", name: "belly-seam" });
  b.rod([-0.12, 0.96, -0.32], [-0.12, 0.96, 0.19], 0.005, { color: CYAN, caps: "flat", name: "port-panel-seam" });
  b.rod([0.12, 0.96, -0.32], [0.12, 0.96, 0.19], 0.005, { color: CYAN, caps: "flat", name: "starboard-panel-seam" });

  for (const side of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 16), PALE, {
      at: [side * 1.28, 0.855, -0.02],
      dir: yAxis,
      name: side > 0 ? "left-roundel" : "right-roundel",
    });
    b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 16), BLUE, {
      at: [side * 1.28, 0.866, -0.02],
      dir: yAxis,
      name: side > 0 ? "left-roundel-core" : "right-roundel-core",
    });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 12), INK, {
      at: [side * 1.28, 0.875, -0.02],
      dir: yAxis,
      name: side > 0 ? "left-roundel-center" : "right-roundel-center",
    });
  }

  // Small blueprint rivets along the wing roots.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const z = -0.38 + i * 0.13;
      b.part(new THREE.SphereGeometry(0.012, 6, 4), PALE, {
        at: [side * (0.29 + i * 0.015), 0.905, z],
        name: `wing-rivet-${side > 0 ? "L" : "R"}-${i}`,
      });
    }
  }

  // Retracted-looking landing gear: two chunky wheels just touching the floor.
  for (const side of [-1, 1]) {
    const strutTop: [number, number, number] = [side * 0.42, 0.78, -0.18];
    const axle: [number, number, number] = [side * 0.48, 0.23, -0.22];
    b.rod(strutTop, axle, 0.025, { color: INK, caps: "round", name: side > 0 ? "left-gear-strut" : "right-gear-strut" });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.07, 10), RUBBER, {
      at: axle,
      dir: [1, 0, 0],
      name: side > 0 ? "left-wheel" : "right-wheel",
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.078, 10), PALE, {
      at: [side * 0.485, 0.23, -0.22],
      dir: [1, 0, 0],
      name: side > 0 ? "left-wheel-hub" : "right-wheel-hub",
    });
  }

  // A small tailwheel keeps the silhouette grounded at the rear.
  b.rod([0, 0.79, -1.42], [0, 0.19, -1.48], 0.018, { color: INK, caps: "round", name: "tailwheel-strut" });
  b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8), RUBBER, {
    at: [0, 0.08, -1.5],
    dir: [1, 0, 0],
    name: "tailwheel",
  });

  // Blueprint annotation bars: graphic, non-textual drafting marks that reinforce the cyanotype aesthetic.
  for (let i = 0; i < 5; i++) {
    b.rod(
      [-0.95 + i * 0.08, 0.68, -1.58],
      [-0.91 + i * 0.08, 0.68, -1.42],
      0.004,
      { color: CYAN, caps: "flat", name: `tail-blueprint-mark-${i}` },
    );
  }

  return b.root;
}
```