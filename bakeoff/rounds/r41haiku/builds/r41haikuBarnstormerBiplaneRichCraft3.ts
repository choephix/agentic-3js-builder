import * as THREE from "three";
import { createBuilder, rng, stripes, svg, paint } from "../../../../src/index";

export const meta = {
  name: "barnstormer",
  description: "A whimsical open-cockpit biplane with a round red cowl, striped wings, roundels and a scarfed pilot.",
};

// Palette
const RED = "#d8452f";
const CREAM = "#f6e7bf";
const BLUE = "#2f5fb3";
const STRUT = "#e0b04a";
const DARK = "#2a2430";
const TYRE = "#27232b";
const HUB = "#f2d27a";
const SKIN = "#f0c49a";
const LEATHER = "#7a4a26";
const GLASS = "#7fd6ff";
const SCARF = "#e8a33a";
const WIRE = "#3b3442";

// Scale constants
const F = 1.2; // fuselage centre height
const WING_UP = 2.25;
const WING_LO = 1.25;

export default function build() {
  const b = createBuilder({ name: "barnstormer" });

  // Fuselage: a tapered tube from tail to nose, painted red with cream rings.
  const body = b.sweep(
    [
      [0, F, -2.7],
      [0, F, -1.2],
      [0, F, 0.4],
      [0, F, 1.7],
    ],
    (t: number) => 0.12 + 0.3 * Math.sin(Math.PI * (0.1 + 0.8 * t)),
    { color: stripes(RED, CREAM, { size: 0.55, axis: "z" }) },
  );

  // Round cowl over the engine, a little fatter than the tube.
  b.part(new THREE.SphereGeometry(0.42, 16, 12), RED, {
    at: [0, F, 1.9],
    scale: [1, 1, 1.2],
  });
  // Cream cowl band and the propeller spinner.
  b.part(new THREE.TorusGeometry(0.36, 0.05, 8, 16), CREAM, { at: [0, F, 2.12], dir: [0, 0, 1] });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.36, 0.12],
      [0.22, 0.34],
      [0, 0.4],
    ],
    { at: [0, F, 2.4], axis: [0, 0, 1], color: HUB, smoothing: 1 },
  );

  // Propeller: two blades in one slab, a tall outline spanning both tips.
  b.extrude(
    [
      [-0.13, -1.15],
      [0.13, -1.15],
      [0.11, 1.15],
      [-0.11, 1.15],
    ],
    { at: [0, F, 2.35], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.04, smoothing: 1, color: DARK },
  );

  // Cockpit opening and the pilot.
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 14), DARK, { at: [0, F + 0.4, 0.2], dir: [0, 1, 0] });
  b.part(new THREE.SphereGeometry(0.17, 12, 10), SKIN, { at: [0, 1.7, 0.2] });
  b.part(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), LEATHER, {
    at: [0, 1.76, 0.18],
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.07, 8, 6), GLASS, { at: [s * 0.09, 1.73, 0.35] });
  // Scarf: a loop at the neck with a long tail streaming back.
  b.sweep(
    [
      [0.1, 1.6, 0.2],
      [0.22, 1.55, 0.0],
      [0.3, 1.52, -0.4],
      [0.2, 1.5, -0.9],
      [0.02, 1.42, -1.3],
    ],
    (t: number) => 0.07 - 0.03 * t,
    { color: SCARF },
  );

  // Main wings: rounded slabs with stripes running out along the span.
  const wingOutline = [
    [-3.6, -0.6],
    [3.6, -0.6],
    [3.6, 0.6],
    [-3.6, 0.6],
  ] as [number, number][];
  b.extrude(wingOutline, {
    at: [0, WING_UP, 0.05],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    smoothing: 2,
    color: paint((_p, _n, _s) => CREAM),
  });
  b.extrude(wingOutline, {
    at: [0, WING_LO, 0.05],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.07,
    smoothing: 2,
    color: CREAM,
  });

  // Striped top wing, painted as a second layer for the bold spanwise bands.
  b.extrude(
    [
      [-3.6, -0.6],
      [3.6, -0.6],
      [3.6, 0.6],
      [-3.6, 0.6],
    ],
    { at: [0, WING_UP + 0.05, 0.05], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, smoothing: 2, color: RED },
  );

  // Interplane and cabane struts.
  for (const s of [1, -1]) {
    for (const x of [1.5, 3.1]) {
      for (const z of [0.35, -0.3]) {
        b.rod([s * x, WING_LO + 0.04, z], [s * x, WING_UP - 0.04, z], 0.03, { color: STRUT });
      }
    }
    b.rod([s * 0.22, 1.5, 0.45], [s * 0.9, WING_UP - 0.05, 0.3], 0.03, { color: STRUT });
  }

  // Flying wires: thin dark lines crossing between the wings.
  for (const s of [1, -1]) {
    b.rod([s * 1.5, WING_LO + 0.1, 0.35], [s * 3.1, WING_UP - 0.1, -0.3], 0.008, { color: WIRE });
    b.rod([s * 1.5, WING_UP - 0.1, 0.35], [s * 3.1, WING_LO + 0.1, -0.3], 0.008, { color: WIRE });
  }

  // Tail: a rounded horizontal stabiliser and a blue fin with a rudder shape.
  b.extrude(
    [
      [-0.8, -0.3],
      [0.8, -0.3],
      [0.8, 0.3],
      [-0.8, 0.3],
    ],
    { at: [0, 1.3, -2.3], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, smoothing: 2, color: BLUE },
  );
  b.extrude(
    [
      [0, 0],
      [0.9, 0],
      [0.6, 1.0],
      [0.15, 1.0],
    ],
    { at: [0, 1.35, -2.2], x: [0, 0, 1], thickness: 0.06, smoothing: 1, color: stripes(BLUE, CREAM, { size: 0.3, axis: "y" }) },
  );

  // Landing gear: two big wheels on struts, and a tail skid that touches the ground.
  for (const s of [1, -1]) {
    b.rod([s * 0.55, 0.9, 0.2], [s * 0.95, 0.42, 0.2], 0.03, { color: STRUT });
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 14), TYRE, {
      at: [s * 0.95, 0.42, 0.2],
      dir: [1, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 10), HUB, {
      at: [s * 0.95, 0.42, 0.2],
      dir: [1, 0, 0],
    });
  }
  b.rod([0, 0.9, 0.2], [0, 0.5, 0.2], 0.02, { color: STRUT }); // axle brace
  b.rod([0, 0.85, -2.5], [0, 0.06, -2.85], 0.035, { color: STRUT });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), TYRE, { at: [0, 0.06, -2.85] });

  // Roundels on each flank of the fuselage.
  const roundel = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="${BLUE}"/>
      <circle cx="50" cy="50" r="30" fill="${CREAM}"/>
      <circle cx="50" cy="50" r="14" fill="${RED}"/>
    </svg>`,
    { size: 128 },
  );
  const skin = b.surface(body);
  for (const [az, dir] of [
    [90, [1, 0, 0]],
    [-90, [-1, 0, 0]],
  ] as const) {
    const hit = skin.around([0, F, 0.3]).at(az, 0);
    if (hit) b.decal(skin, roundel, { at: hit, dir: [dir[0], 0, dir[2]], size: [0.5, 0.5] });
  }

  // A small blue pennant streaming from the tail fin.
  b.sweep(
    [
      [0, 2.2, -2.5],
      [0, 2.32, -3.2],
      [0, 2.1, -3.9],
      [0, 2.3, -4.6],
      [0, 2.1, -5.2],
    ],
    0.04,
    { color: BLUE },
  );

  return b.root;
}
