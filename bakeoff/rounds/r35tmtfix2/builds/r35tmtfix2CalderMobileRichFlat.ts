import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "calder-hanging-mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile with dark wire arms, suspended colored abstract plates, beads, and counterbalanced forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-hanging-mobile", detail: 1 });

  const WIRE = "#25262a";
  const WIRE_HI = "#4b4d50";
  const RED = "#d94335";
  const ORANGE = "#ed8c2d";
  const YELLOW = "#f0c735";
  const BLUE = "#2468a8";
  const DEEP_BLUE = "#1e4770";
  const GREEN = "#4b9368";
  const TURQUOISE = "#3faaa5";
  const PINK = "#d76586";
  const CREAM = "#e5d6af";
  const WHITE = "#eee8d7";
  const BLACK = "#17181b";

  const v = (x: number, y: number, z: number) => [x, y, z] as [number, number, number];

  function wire(
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.008,
    color = WIRE,
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "round",
      sides: 6,
      name: "wire",
      group: "suspension",
    });
  }

  function bead(
    at: [number, number, number],
    radius: number,
    color: string,
    segments = 8,
  ) {
    return b.part(new THREE.SphereGeometry(radius, segments, Math.max(4, segments - 2)), color, {
      at,
      name: "bead",
      group: "ornament",
      flat: true,
    });
  }

  function cylinder(
    at: [number, number, number],
    radius: number,
    height: number,
    color: string,
    dir: [number, number, number] = [0, 1, 0],
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
      at,
      dir,
      name: "hub",
      group: "suspension",
      flat: true,
    });
  }

  function plate(
    outline: [number, number, string?][],
    at: [number, number, number],
    x: [number, number, number],
    y: [number, number, number],
    color: string,
    name: string,
    thickness = 0.012,
  ) {
    return b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
      name,
      group: "abstract-forms",
    });
  }

  function verticalPlate(
    outline: [number, number, string?][],
    at: [number, number, number],
    color: string,
    name: string,
    twist: number = 0,
  ) {
    const rad = (twist * Math.PI) / 180;
    const x: [number, number, number] = [Math.cos(rad), 0, Math.sin(rad)];
    const y: [number, number, number] = [0, 1, 0];
    return plate(outline, at, x, y, color, name);
  }

  function disc(
    at: [number, number, number],
    radius: number,
    color: string,
    name: string,
    twist = 0,
  ) {
    const outline: [number, number, string?][] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      outline.push([Math.cos(a) * radius, Math.sin(a) * radius]);
    }
    return verticalPlate(outline, at, color, name, twist);
  }

  // A tiny upper eye and a long, slightly offset suspension thread.
  bead(v(0, 2.86, 0), 0.035, WIRE_HI, 8);
  wire(v(0, 2.86, 0), v(0, 2.68, 0), 0.007, WIRE);
  wire(v(0, 2.68, 0), v(0.035, 2.51, 0.015), 0.006, WIRE);

  // First balance: a long, elegant horizontal arm.
  const pivotA = v(0.035, 2.51, 0.015);
  wire(v(-0.72, 2.51, 0.015), v(0.63, 2.51, 0.015), 0.012, WIRE);
  cylinder(pivotA, 0.028, 0.075, WIRE_HI);
  bead(pivotA, 0.045, RED);

  // Left end: a small deep-blue lozenge and a warm hanging disc.
  wire(v(-0.72, 2.51, 0.015), v(-0.72, 2.28, 0.015), 0.006, WIRE);
  plate(
    [
      [-0.09, 0],
      [-0.035, 0.15],
      [0.06, 0.12],
      [0.1, 0.01],
      [0.025, -0.13],
      [-0.07, -0.1],
    ],
    v(-0.72, 2.16, 0.015),
    [1, 0, 0],
    [0, 1, 0],
    DEEP_BLUE,
    "left-blue-lozenge",
    0.014,
  );
  wire(v(-0.72, 2.16, 0.015), v(-0.87, 1.88, 0.015), 0.005, WIRE);
  bead(v(-0.87, 1.86, 0.015), 0.027, YELLOW);
  disc(v(-0.87, 1.68, 0.015), 0.12, ORANGE, "left-orange-disc", 8);

  // Right end: a second, smaller balance arm suspended from the first.
  wire(v(0.63, 2.51, 0.015), v(0.63, 2.27, 0.015), 0.006, WIRE);
  bead(v(0.63, 2.25, 0.015), 0.035, TURQUOISE);
  wire(v(0.63, 2.25, 0.015), v(0.9, 2.25, 0.09), 0.009, WIRE);
  wire(v(0.9, 2.25, 0.09), v(1.34, 2.25, 0.09), 0.008, WIRE);
  cylinder(v(0.9, 2.25, 0.09), 0.022, 0.06, WIRE_HI);
  bead(v(0.9, 2.25, 0.09), 0.032, RED);

  // Small counterweight on the short side of the secondary arm.
  wire(v(0.9, 2.25, 0.09), v(0.9, 2.02, 0.09), 0.005, WIRE);
  plate(
    [
      [-0.085, -0.02],
      [-0.015, 0.13],
      [0.075, 0.095],
      [0.1, -0.02],
      [0.025, -0.14],
      [-0.065, -0.11],
    ],
    v(0.9, 1.87, 0.09),
    [1, 0, 0],
    [0, 1, 0],
    PINK,
    "pink-counterweight",
    0.013,
  );

  // Long side of secondary arm: a sweeping yellow crescent.
  wire(v(1.34, 2.25, 0.09), v(1.34, 2.01, 0.09), 0.005, WIRE);
  wire(v(1.34, 2.01, 0.09), v(1.24, 1.75, 0.16), 0.005, WIRE);
  plate(
    [
      [-0.025, 0],
      [0.02, 0.14],
      [0.1, 0.23],
      [0.19, 0.2],
      [0.24, 0.08],
      [0.2, -0.08],
      [0.1, -0.19],
      [-0.01, -0.22],
      [0.045, -0.08],
      [0.12, 0.02],
      [0.14, 0.1],
      [0.09, 0.14],
      [0.02, 0.1],
    ],
    v(1.24, 1.47, 0.16),
    [0.95, 0, 0.3],
    [0, 1, 0],
    YELLOW,
    "yellow-crescent",
    0.015,
  );

  // A tiny red bead beneath the crescent, giving it a visual punctuation mark.
  wire(v(1.24, 1.47, 0.16), v(1.24, 1.23, 0.16), 0.005, WIRE);
  bead(v(1.24, 1.18, 0.16), 0.045, RED);

  // A separate rearward branch from the primary pivot, giving the mobile depth.
  wire(v(0.035, 2.51, 0.015), v(0.035, 2.36, 0.015), 0.006, WIRE);
  bead(v(0.035, 2.33, 0.015), 0.026, CREAM);
  wire(v(0.035, 2.33, 0.015), v(-0.22, 2.18, -0.26), 0.008, WIRE);
  wire(v(-0.22, 2.18, -0.26), v(-0.72, 2.18, -0.26), 0.008, WIRE);
  cylinder(v(-0.22, 2.18, -0.26), 0.021, 0.055, WIRE_HI);
  bead(v(-0.22, 2.18, -0.26), 0.032, BLUE);

  // Rear branch's left hanging form: broad green leaf.
  wire(v(-0.72, 2.18, -0.26), v(-0.72, 1.95, -0.26), 0.005, WIRE);
  plate(
    [
      [0, -0.16],
      [-0.08, -0.1],
      [-0.14, 0.02],
      [-0.1, 0.15],
      [0, 0.25],
      [0.13, 0.17],
      [0.19, 0.03],
      [0.13, -0.08],
      [0.04, -0.16],
    ],
    v(-0.72, 1.72, -0.26),
    [0.94, 0, -0.34],
    [0.06, 0.998, 0.02],
    GREEN,
    "rear-green-leaf",
    0.018,
  );
  // A slim contrasting rib across the leaf.
  wire(v(-0.72, 1.54, -0.255), v(-0.72, 1.91, -0.255), 0.004, WIRE_HI);

  // Rear branch's right hanging form: a blue asymmetric fan.
  wire(v(-0.22, 2.18, -0.26), v(-0.05, 1.97, -0.26), 0.005, WIRE);
  plate(
    [
      [-0.02, -0.2],
      [-0.13, -0.08],
      [-0.15, 0.12],
      [-0.05, 0.27],
      [0.09, 0.34],
      [0.18, 0.24],
      [0.14, 0.1],
      [0.08, -0.04],
      [0.1, -0.16],
    ],
    v(-0.05, 1.67, -0.26),
    [0.88, 0, 0.48],
    [0, 1, 0],
    BLUE,
    "rear-blue-fan",
    0.016,
  );
  bead(v(-0.05, 1.34, -0.26), 0.038, CREAM);
  wire(v(-0.05, 1.67, -0.26), v(-0.05, 1.34, -0.26), 0.004, WIRE);

  // A forward-facing lower arm hangs from a small red pivot.
  wire(v(0.035, 2.33, 0.015), v(0.18, 2.08, 0.2), 0.006, WIRE);
  bead(v(0.18, 2.05, 0.2), 0.031, ORANGE);
  wire(v(0.18, 2.05, 0.2), v(0.58, 1.92, 0.23), 0.009, WIRE);
  wire(v(0.58, 1.92, 0.23), v(1.05, 1.92, 0.23), 0.008, WIRE);
  cylinder(v(0.58, 1.92, 0.23), 0.02, 0.06, WIRE_HI);
  bead(v(0.58, 1.92, 0.23), 0.03, WHITE);

  // Front arm left: a small red triangular plate.
  wire(v(0.58, 1.92, 0.23), v(0.58, 1.68, 0.23), 0.005, WIRE);
  plate(
    [
      [-0.14, -0.12],
      [0.12, -0.1],
      [0.02, 0.23],
      [-0.04, 0.31],
    ],
    v(0.58, 1.47, 0.23),
    [1, 0, 0],
    [0, 1, 0],
    RED,
    "front-red-triangle",
    0.014,
  );

  // Front arm right: an irregular cream pebble with a blue dot.
  wire(v(1.05, 1.92, 0.23), v(1.05, 1.68, 0.23), 0.005, WIRE);
  plate(
    [
      [-0.17, -0.05],
      [-0.1, 0.13],
      [0.02, 0.22],
      [0.16, 0.12],
      [0.19, -0.04],
      [0.1, -0.18],
      [-0.06, -0.2],
    ],
    v(1.05, 1.45, 0.23),
    [0.97, 0, -0.24],
    [0, 1, 0],
    CREAM,
    "front-cream-pebble",
    0.017,
  );
  disc(v(1.05, 1.48, 0.252), 0.052, DEEP_BLUE, "cream-pebble-dot", 0);

  // A low independent counterweight, suspended from the central knot.
  wire(v(0.18, 2.05, 0.2), v(0.18, 1.78, 0.2), 0.005, WIRE);
  plate(
    [
      [-0.14, 0],
      [-0.08, 0.16],
      [0.03, 0.2],
      [0.14, 0.1],
      [0.15, -0.07],
      [0.04, -0.19],
      [-0.09, -0.15],
    ],
    v(0.18, 1.56, 0.2),
    [0.86, 0, 0.51],
    [0, 1, 0],
    TURQUOISE,
    "low-turquoise-form",
    0.015,
  );

  // A few intentionally tiny, graphic elements keep the silhouette lively.
  wire(v(-0.87, 1.68, 0.015), v(-0.98, 1.48, 0.015), 0.004, WIRE_HI);
  bead(v(-0.98, 1.43, 0.015), 0.025, WHITE);
  wire(v(1.24, 1.18, 0.16), v(1.39, 0.99, 0.16), 0.004, WIRE);
  disc(v(1.39, 0.92, 0.16), 0.07, DEEP_BLUE, "lowest-blue-dot", -12);

  // Small dark caps at a few exposed joints, characteristic of a hand-balanced wire sculpture.
  bead(v(0.63, 2.25, 0.09), 0.018, BLACK, 6);
  bead(v(0.58, 1.92, 0.23), 0.016, BLACK, 6);
  bead(v(-0.22, 2.18, -0.26), 0.016, BLACK, 6);

  return b.root;
}
