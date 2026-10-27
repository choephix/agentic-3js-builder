import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Alexander Calder Hanging Mobile",
  description:
    "A balanced abstract hanging mobile of black wire, brass pivots, and bold red, yellow, blue, white, and black floating shapes in the spirit of Alexander Calder.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17191c";
  const CHARCOAL = "#2b2d31";
  const RED = "#d8322f";
  const VERMILION = "#ef5136";
  const YELLOW = "#f2c832";
  const GOLD = "#e4a928";
  const BLUE = "#2457a6";
  const SKY = "#3d86bf";
  const WHITE = "#e9e6dc";
  const CORAL = "#db6d51";
  const BRASS = "#b88735";

  const wire = (a: [number, number, number], c: [number, number, number], r = 0.009, color = BLACK) =>
    b.rod(a, c, r, { color, caps: "round", section: { ngon: 6 }, name: "wire" });

  const bead = (
    p: [number, number, number],
    radius = 0.035,
    color = BRASS,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      name: "pivot",
      flat: true,
    });

  const disc = (
    p: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at: p,
      dir,
      name: "painted-disc",
      flat: true,
    });

  const plate = (
    p: [number, number, number],
    x: [number, number, number],
    outline: [number, number][],
    color: string,
    thickness = 0.018,
  ) =>
    b.extrude(outline, {
      at: p,
      x,
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
      name: "cut-metal-shape",
    });

  const smallRod = (
    a: [number, number, number],
    c: [number, number, number],
    color = BLACK,
  ) => wire(a, c, 0.006, color);

  // A small ceiling-like loop gives the mobile a clear hanging point without adding scenery.
  b.part(new THREE.TorusGeometry(0.075, 0.012, 6, 12), BLACK, {
    at: [0, 3.02, 0],
    rotation: [90, 0, 0],
    name: "hanging-loop",
    flat: true,
  });
  wire([0, 2.94, 0], [0, 2.72, 0], 0.011);
  bead([0, 2.71, 0], 0.045, BRASS);

  // Top level: an asymmetric shallow bar with a red sail and a blue counterweight.
  const topLeft: [number, number, number] = [-0.72, 2.57, 0];
  const topRight: [number, number, number] = [0.62, 2.63, 0.015];
  wire(topLeft, topRight, 0.012);
  bead([0, 2.60, 0.008], 0.05, BRASS);
  wire([0, 2.71, 0], [0, 2.60, 0.008], 0.007);

  wire([-0.72, 2.57, 0], [-0.72, 2.32, 0.02], 0.006);
  plate(
    [-0.72, 2.28, 0.02],
    [1, 0, 0.12],
    [
      [-0.25, -0.08],
      [-0.04, -0.19],
      [0.20, -0.10],
      [0.27, 0.10],
      [0.07, 0.18],
      [-0.19, 0.12],
    ],
    RED,
  );
  plate(
    [-0.72, 2.28, 0.038],
    [1, 0, 0.12],
    [
      [-0.11, -0.02],
      [0.02, -0.09],
      [0.13, 0.00],
      [0.05, 0.08],
      [-0.10, 0.07],
    ],
    VERMILION,
    0.008,
  );
  disc([-0.54, 2.22, 0.045], 0.045, 0.012, WHITE, [0, 0, 1]);

  wire([0.62, 2.63, 0.015], [0.62, 2.38, 0.015], 0.006);
  disc([0.62, 2.30, 0.015], 0.17, 0.022, BLUE, [0, 0, 1]);
  disc([0.62, 2.30, 0.031], 0.07, 0.009, SKY, [0, 0, 1]);
  smallRod([0.50, 2.30, 0.043], [0.74, 2.30, 0.043], WHITE);

  // Second level bar hangs from the left side of the first bar.
  const secondA: [number, number, number] = [-0.74, 2.05, 0.02];
  const secondB: [number, number, number] = [0.40, 1.91, 0.02];
  wire([-0.72, 2.57, 0], secondA, 0.006);
  bead(secondA, 0.034, BRASS);
  wire(secondA, secondB, 0.011);
  bead([0.02, 1.985, 0.02], 0.04, BRASS);

  // Left yellow crescent-like geometric leaf.
  wire(secondA, [-0.96, 1.83, 0.035], 0.006);
  plate(
    [-0.96, 1.67, 0.035],
    [0.95, 0, 0.32],
    [
      [-0.07, -0.24],
      [0.16, -0.18],
      [0.29, 0.00],
      [0.17, 0.20],
      [-0.11, 0.25],
      [-0.23, 0.08],
    ],
    YELLOW,
  );
  plate(
    [-0.91, 1.68, 0.06],
    [0.95, 0, 0.32],
    [
      [-0.03, -0.13],
      [0.11, -0.10],
      [0.19, 0.02],
      [0.09, 0.13],
      [-0.08, 0.16],
      [-0.13, 0.03],
    ],
    GOLD,
    0.008,
  );

  // Right end carries a blue blade and a low red disc.
  wire(secondB, [0.42, 1.69, -0.02], 0.006);
  plate(
    [0.42, 1.50, -0.02],
    [0.72, 0, -0.7],
    [
      [-0.06, -0.28],
      [0.18, -0.13],
      [0.10, 0.04],
      [0.27, 0.24],
      [-0.06, 0.16],
      [-0.21, 0.00],
    ],
    BLUE,
  );
  disc([0.64, 1.47, 0.02], 0.13, 0.018, RED, [0, 0, 1]);
  disc([0.64, 1.47, 0.034], 0.045, 0.008, WHITE, [0, 0, 1]);

  // Third level, suspended from the right side of the second bar.
  const thirdA: [number, number, number] = [0.40, 1.74, 0.02];
  const thirdB: [number, number, number] = [-0.18, 1.60, 0.03];
  wire(secondB, thirdA, 0.006);
  bead(thirdA, 0.032, BRASS);
  wire(thirdA, thirdB, 0.010);
  bead(thirdB, 0.038, BRASS);

  // White broad sail, its silhouette deliberately irregular.
  wire(thirdB, [-0.18, 1.35, 0.04], 0.006);
  plate(
    [-0.18, 1.10, 0.04],
    [0.08, 0, 1],
    [
      [-0.27, -0.21],
      [-0.08, -0.29],
      [0.18, -0.19],
      [0.26, 0.03],
      [0.09, 0.25],
      [-0.19, 0.18],
      [-0.30, 0.02],
    ],
    WHITE,
  );
  plate(
    [-0.18, 1.10, 0.062],
    [0.08, 0, 1],
    [
      [-0.12, -0.10],
      [0.02, -0.17],
      [0.14, -0.08],
      [0.16, 0.08],
      [0.00, 0.14],
      [-0.14, 0.06],
    ],
    CORAL,
    0.008,
  );
  smallRod([-0.35, 1.10, 0.078], [-0.02, 1.10, 0.078], CHARCOAL);

  // Fourth level hangs from the left end of the third bar.
  const fourthA: [number, number, number] = [-0.40, 1.59, 0.03];
  const fourthB: [number, number, number] = [0.48, 1.48, 0.03];
  wire(thirdB, fourthA, 0.006);
  bead(fourthA, 0.032, BRASS);
  wire(fourthA, fourthB, 0.009);
  bead([0.05, 1.535, 0.03], 0.035, BRASS);

  // Small red blade at the left.
  wire(fourthA, [-0.55, 1.29, 0.07], 0.006);
  plate(
    [-0.55, 1.10, 0.07],
    [1, 0, -0.2],
    [
      [-0.14, -0.22],
      [0.08, -0.19],
      [0.19, -0.02],
      [0.04, 0.18],
      [-0.15, 0.12],
      [-0.22, -0.04],
    ],
    VERMILION,
  );
  disc([-0.47, 1.07, 0.095], 0.038, 0.009, YELLOW, [0, 0, 1]);

  // Large gold disc and a black counterweight at the right.
  wire(fourthB, [0.48, 1.22, 0.02], 0.006);
  disc([0.48, 1.03, 0.02], 0.19, 0.024, GOLD, [0, 0, 1]);
  disc([0.43, 1.09, 0.038], 0.055, 0.01, WHITE, [0, 0, 1]);
  wire(fourthB, [0.78, 1.33, -0.04], 0.006);
  disc([0.88, 1.19, -0.04], 0.11, 0.026, CHARCOAL, [0, 0, 1]);

  // Bottom bar: longer, quieter, and visually heavier.
  const bottomA: [number, number, number] = [0.46, 0.83, 0.02];
  const bottomB: [number, number, number] = [-0.67, 0.76, 0.02];
  wire([0.48, 1.03, 0.02], bottomA, 0.006);
  bead(bottomA, 0.036, BRASS);
  wire(bottomA, bottomB, 0.011);
  bead([-0.10, 0.795, 0.02], 0.041, BRASS);

  // Bottom blue fan.
  wire(bottomB, [-0.67, 0.54, 0.06], 0.006);
  plate(
    [-0.67, 0.35, 0.06],
    [0.82, 0, 0.25],
    [
      [-0.22, -0.17],
      [0.00, -0.26],
      [0.22, -0.14],
      [0.15, 0.05],
      [0.27, 0.22],
      [0.00, 0.17],
      [-0.23, 0.26],
      [-0.13, 0.03],
    ],
    BLUE,
  );
  disc([-0.56, 0.33, 0.08], 0.045, 0.009, SKY, [0, 0, 1]);

  // Bottom red-and-yellow pair.
  wire(bottomA, [0.64, 0.58, -0.06], 0.006);
  plate(
    [0.64, 0.34, -0.06],
    [0.55, 0, 0.84],
    [
      [-0.25, -0.13],
      [-0.07, -0.25],
      [0.18, -0.16],
      [0.25, 0.07],
      [0.06, 0.22],
      [-0.19, 0.15],
    ],
    RED,
  );
  plate(
    [0.66, 0.35, -0.025],
    [0.55, 0, 0.84],
    [
      [-0.10, -0.08],
      [0.04, -0.13],
      [0.13, -0.02],
      [0.06, 0.11],
      [-0.09, 0.08],
    ],
    YELLOW,
    0.008,
  );

  // A final small dangling weight makes the bottom silhouette taper to a point.
  wire([0.64, 0.34, -0.06], [0.64, 0.12, -0.02], 0.006);
  bead([0.64, 0.08, -0.02], 0.07, CHARCOAL);

  // Fine visual punctuation: a few short black balancing whiskers and brass caps.
  smallRod([-0.84, 2.42, 0.07], [-0.63, 2.38, 0.07]);
  smallRod([0.51, 2.46, 0.06], [0.75, 2.48, 0.06]);
  smallRod([-0.28, 1.83, 0.07], [-0.08, 1.78, 0.07]);
  smallRod([0.26, 1.78, 0.07], [0.48, 1.82, 0.07]);
  bead([-0.84, 2.42, 0.07], 0.018, BRASS);
  bead([0.75, 2.48, 0.06], 0.018, BRASS);
  bead([-0.08, 1.78, 0.07], 0.018, BRASS);
  bead([0.48, 1.82, 0.07], 0.018, BRASS);

  // A tiny rotation offset in the support geometry keeps the planes from reading as a rigid grid.
  b.part(new THREE.BoxGeometry(0.018, 0.018, 0.22), BLACK, {
    at: [-0.02, 2.60, -0.01],
    rotation: [0, 0, 22],
    name: "top-axle",
    flat: true,
  });

  return b.root;
}
