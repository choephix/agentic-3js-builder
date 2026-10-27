```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint model.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#062c3b";
  const DEEP = "#08485d";
  const BLUE = "#08728c";
  const CYAN = "#19b9c5";
  const PALE = "#8be9e5";
  const PAPER = "#c3fff1";
  const SHADOW = "#031c29";
  const ORANGE = "#e2a94f";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color = BLUE,
    opts: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, ...opts });

  const cyl = (
    radius: number,
    length: number,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    color = BLUE,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, length, segments), color, {
      at,
      dir,
      color,
      ...({} as Record<string, unknown>),
    });

  const disk = (
    radius: number,
    depth: number,
    at: [number, number, number],
    dir: [number, number, number],
    color: string,
    segments = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
    });

  // Blueprint drafting grid / display plinth, kept deliberately simple.
  box([1.7, 0.025, 2.35], [0, 0.012, 0], INK);
  for (let x = -0.75; x <= 0.75; x += 0.15)
    box([0.006, 0.004, 2.25], [x, 0.028, 0], DEEP);
  for (let z = -1.05; z <= 1.05; z += 0.15)
    box([1.6, 0.004, 0.006], [0, 0.03, z], DEEP);

  // Main fuselage, made from a tapered, faceted centerline.
  const fuselagePath = [
    [0, 0.42, -0.72],
    [0, 0.46, -0.48],
    [0, 0.48, 0.00],
    [0, 0.49, 0.48],
    [0, 0.52, 0.78],
    [0, 0.55, 1.00],
  ] as number[][];
  const fuselage = b.sweep(
    fuselagePath,
    (t: number) => 0.16 - t * 0.075,
    { color: BLUE, sides: 8, caps: "round", name: "fuselage" },
  );

  // Lower belly and pale blueprint counter-panel.
  b.sweep(
    [
      [0, 0.40, -0.62],
      [0, 0.41, -0.15],
      [0, 0.42, 0.38],
      [0, 0.47, 0.78],
    ],
    [0.115, 0.075],
    { color: DEEP, sides: 6, name: "belly" },
  );

  // Nose spinner and engine rings.
  disk(0.145, 0.045, [0, 0.55, 1.035], [0, 0, 1], INK, 12);
  b.part(new THREE.ConeGeometry(0.11, 0.18, 10), CYAN, {
    at: [0, 0.55, 1.13],
    dir: [0, 0, 1],
  });
  for (let i = 0; i < 3; i++) {
    const r = 0.135 - i * 0.018;
    disk(r, 0.012, [0, 0.55, 1.045 + i * 0.018], [0, 0, 1], i === 1 ? PALE : INK, 12);
  }

  // Engine cowling panel ribs.
  for (let i = -3; i <= 3; i++) {
    disk(0.145, 0.009, [0, 0.55, 0.88 + i * 0.035], [0, 0, 1], DEEP, 10);
  }

  // Broad elliptical wings.
  const wingOutline: [number, number][] = [
    [0, -0.04],
    [0.18, -0.05],
    [0.57, 0.10],
    [0.73, 0.30],
    [0.68, 0.38],
    [0.28, 0.34],
    [0, 0.22],
  ];
  for (const s of [-1, 1]) {
    b.extrude(wingOutline, {
      at: [s * 0.03, 0.47, -0.12],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.045,
      bevel: 0.012,
      color: BLUE,
      name: s < 0 ? "wingR" : "wingL",
    });
    // Wing leading-edge highlight.
    box([0.52, 0.018, 0.025], [s * 0.36, 0.505, 0.08], CYAN);
    box([0.30, 0.014, 0.018], [s * 0.56, 0.51, 0.255], PALE);
    // Aileron seam and flap seam.
    box([0.42, 0.008, 0.012], [s * 0.41, 0.522, 0.275], INK);
    box([0.33, 0.008, 0.012], [s * 0.38, 0.523, -0.01], INK);
    // Cannon blister.
    cyl(0.028, 0.17, [s * 0.31, 0.52, 0.31], [0, 0, 1], INK, 8);
    cyl(0.018, 0.19, [s * 0.31, 0.55, 0.36], [0, 0, 1], PALE, 8);
  }

  // Wing root fairings and invasion stripe-like blueprint bands.
  for (const s of [-1, 1]) {
    box([0.08, 0.025, 0.32], [s * 0.13, 0.555, 0.12], PALE);
    box([0.045, 0.028, 0.29], [s * 0.19, 0.558, 0.12], DEEP);
    box([0.028, 0.03, 0.29], [s * 0.235, 0.56, 0.12], PALE);
  }

  // Tailplane.
  const tailOutline: [number, number][] = [
    [0, -0.04],
    [0.16, -0.03],
    [0.43, 0.08],
    [0.48, 0.17],
    [0.35, 0.18],
    [0, 0.13],
  ];
  for (const s of [-1, 1]) {
    b.extrude(tailOutline, {
      at: [s * 0.015, 0.58, -0.62],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.035,
      bevel: 0.008,
      color: BLUE,
    });
    box([0.25, 0.012, 0.014], [s * 0.27, 0.62, -0.48], CYAN);
    box([0.20, 0.008, 0.012], [s * 0.30, 0.625, -0.54], INK);
  }

  // Vertical fin and rudder, strongly recognizable in profile.
  b.extrude(
    [
      [0, 0],
      [0.08, 0],
      [0.18, 0.30],
      [0.12, 0.43],
      [0.045, 0.50],
      [0, 0.48],
    ],
    {
      at: [0, 0.58, -0.63],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.009,
      color: BLUE,
      name: "verticalTail",
    },
  );
  box([0.012, 0.27, 0.018], [0, 0.78, -0.57], CYAN);
  box([0.014, 0.12, 0.022], [0, 0.67, -0.50], INK);

  // Cockpit hood and stepped armored windscreen.
  box([0.24, 0.09, 0.23], [0, 0.67, 0.27], DEEP);
  b.part(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), CYAN, {
    at: [0, 0.67, 0.28],
    scale: [1.0, 0.72, 1.35],
  });
  box([0.205, 0.018, 0.105], [0, 0.76, 0.22], PALE);
  box([0.018, 0.09, 0.115], [-0.105, 0.755, 0.23], INK);
  box([0.018, 0.09, 0.115], [0.105, 0.755, 0.23], INK);
  box([0.018, 0.09, 0.115], [0, 0.755, 0.23], INK);

  // Cockpit rim and headrest.
  b.sweep(
    [
      [-0.13, 0.69, 0.15],
      [-0.13, 0.70, 0.34],
      [0.13, 0.70, 0.34],
      [0.13, 0.69, 0.15],
    ],
    0.012,
    { color: PALE, sides: 6, caps: "round" },
  );
  box([0.16, 0.13, 0.09], [0, 0.70, 0.04], INK);
  box([0.12, 0.09, 0.035], [0, 0.77, 0.035], PALE);

  // Panel lines on fuselage and blueprints of access hatches.
  for (const z of [-0.48, -0.23, 0.05, 0.48, 0.72]) {
    box([0.006, 0.11, 0.012], [0.155, 0.53, z], PALE);
    box([0.006, 0.11, 0.012], [-0.155, 0.53, z], PALE);
  }
  for (const s of [-1, 1]) {
    box([0.018, 0.09, 0.18], [s * 0.148, 0.57, -0.26], DEEP);
    box([0.01, 0.07, 0.14], [s * 0.16, 0.62, -0.26], PALE);
    for (let j = -1; j <= 1; j++)
      disk(0.012, 0.008, [s * 0.171, 0.62, -0.26 + j * 0.055], [1, 0, 0], INK, 7);
  }

  // Propeller hub and four broad blades, all forward of the nose.
  disk(0.065, 0.09, [0, 0.55, 1.21], [0, 0, 1], INK, 10);
  disk(0.036, 0.105, [0, 0.55, 1.27], [0, 0, 1], PALE, 10);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const x = Math.cos(a) * 0.14;
    const y = 0.55 + Math.sin(a) * 0.14;
    const blade = box([0.045, 0.25, 0.018], [x, y, 1.275], CYAN);
    blade.mesh.rotation.z = a;
    box([0.018, 0.19, 0.008], [x * 0.75, 0.55 + (y - 0.55) * 0.75, 1.288], PALE, {
      rotation: [0, 0, a],
    });
  }

  // Undercarriage: two wheels, struts, and tail wheel.
  for (const s of [-1, 1]) {
    cyl(0.018, 0.13, [s * 0.22, 0.35, 0.02], [0, -0.35, 0.94], INK, 7);
    disk(0.065, 0.028, [s * 0.22, 0.075, 0.02], [1, 0, 0], SHADOW, 10);
    disk(0.041, 0.034, [s * 0.22, 0.075, 0.02], [1, 0, 0], PALE, 10);
    disk(0.014, 0.038, [s * 0.22, 0.075, 0.02], [1, 0, 0], INK, 8);
  }
  cyl(0.015, 0.12, [0, 0.31, -0.55], [0, -1, 0], INK, 7);
  disk(0.042, 0.025, [0, 0.07, -0.55], [1, 0, 0], SHADOW, 9);

  // Wingtip navigation lamps and tiny blueprint rivets.
  for (const s of [-1, 1]) {
    disk(0.025, 0.018, [s * 0.70, 0.50, 0.29], [0, 1, 0], s > 0 ? CYAN : PALE, 8);
    for (let i = 0; i < 5; i++) {
      disk(0.009, 0.009, [s * (0.27 + i * 0.08), 0.535, 0.20], [0, 1, 0], PALE, 6);
    }
  }

  // Tail rivets and a bold cyanotype serial marking built from bars.
  for (let i = 0; i < 7; i++) {
    disk(0.009, 0.012, [0.13, 0.55, -0.62 + i * 0.07], [1, 0, 0], PALE, 6);
    disk(0.009, 0.012, [-0.13, 0.55, -0.62 + i * 0.07], [1, 0, 0], PALE, 6);
  }
  const serialZ = -0.08;
  for (const s of [-1, 1]) {
    box([0.012, 0.018, 0.055], [s * 0.171, 0.60, serialZ], PAPER);
    box([0.012, 0.018, 0.028], [s * 0.171, 0.60, serialZ + 0.075], PAPER);
    box([0.012, 0.018, 0.028], [s * 0.171, 0.60, serialZ - 0.075], PAPER);
  }

  // A few deliberately faceted blueprint callout tabs around the silhouette.
  box([0.006, 0.006, 0.42], [-0.84, 0.035, 0.55], PALE);
  box([0.006, 0.006, 0.25], [0.84, 0.035, -0.55], PALE);
  box([0.08, 0.006, 0.006], [-0.84, 0.035, 0.34], PALE);
  box([0.08, 0.006, 0.006], [0.84, 0.035, -0.42], PALE);

  return b.root;
}
```