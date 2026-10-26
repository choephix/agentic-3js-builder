import * as THREE from "three";
import { createBuilder, bezier } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A balanced Alexander Calder-inspired hanging mobile of painted steel rods, wires, biomorphic plates, counterweights, and bright primary-color accents.",
};

export default function build() {
  const b = createBuilder({ name: "calder-hanging-mobile", detail: 1 });

  const BLACK = "#17191d";
  const INK = "#25232a";
  const OXBLOOD = "#7e2028";
  const RED = "#d83c3e";
  const RED_LIGHT = "#ed5b4f";
  const YELLOW = "#f1c532";
  const GOLD = "#d99a22";
  const BLUE = "#2f6fae";
  const BLUE_LIGHT = "#4f92c5";
  const ORANGE = "#df7138";
  const RUST = "#a7432e";
  const CREAM = "#e3d4b3";
  const GREEN = "#638e70";
  const BRONZE = "#624a35";
  const STEEL = "#8d8371";

  const group = "mobile";

  type Point = readonly [number, number, number];
  type Direction = readonly [number, number, number];

  const V = (p: Point | Direction) => new THREE.Vector3(p[0], p[1], p[2]);

  const normalOf = (x: Direction, y: Direction = [0, 1, 0]) =>
    V(x).cross(V(y)).normalize();

  const onPlane = (
    at: Point,
    x: Direction,
    y: Direction,
    u: number,
    v: number,
    lift = 0,
  ): Point => {
    const p = V(at);
    p.addScaledVector(V(x).normalize(), u);
    p.addScaledVector(V(y).normalize(), v);
    p.addScaledVector(normalOf(x, y), lift);
    return [p.x, p.y, p.z];
  };

  const organic = (
    rx: number,
    ry: number,
    count = 12,
    phase = 0,
    wobble = 0.08,
  ): [number, number][] => {
    const points: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = phase + (i / count) * Math.PI * 2;
      const variation =
        1 +
        wobble *
          Math.sin(a * 3.0 + 0.7) *
          Math.cos(a * 1.7 - 0.4);
      points.push([
        Math.cos(a) * rx * variation,
        Math.sin(a) * ry * (1 + wobble * 0.35 * Math.cos(a * 2)),
      ]);
    }
    return points;
  };

  const plate = (
    name: string,
    at: Point,
    outline: any,
    color: string,
    x: Direction = [1, 0, 0],
    y: Direction = [0, 1, 0],
    thickness = 0.024,
    bevel = 0.006,
  ) =>
    b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel,
      smoothing: 1,
      color,
      name,
      group,
    });

  const ellipse = (
    name: string,
    at: Point,
    rx: number,
    ry: number,
    color: string,
    x: Direction = [1, 0, 0],
    y: Direction = [0, 1, 0],
    thickness = 0.02,
  ) =>
    plate(
      name,
      at,
      organic(rx, ry, 14, Math.PI / 14, 0.045),
      color,
      x,
      y,
      thickness,
      Math.min(thickness * 0.28, 0.005),
    );

  const rod = (
    name: string,
    a: Point,
    c: Point,
    radius = 0.009,
    color = BLACK,
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "round",
      sides: 8,
      name,
      group,
    });

  const wire = (name: string, a: Point, c: Point, radius = 0.0035) =>
    b.rod(a, c, radius, {
      color: INK,
      caps: "round",
      sides: 6,
      name,
      group,
    });

  const curvedWire = (
    name: string,
    points: [Point, Point, Point, Point],
    radius = 0.004,
  ) =>
    b.sweep(bezier(points[0], points[1], points[2], points[3]), radius, {
      color: INK,
      caps: "round",
      sides: 6,
      name,
      group,
    });

  const bead = (
    name: string,
    at: Point,
    radius: number,
    color: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      flat: true,
      name,
      group,
    });

  const pivot = (name: string, at: Point, radius = 0.026) => {
    bead(`${name}.dark`, at, radius, BLACK);
    ellipse(
      `${name}.cap`,
      [at[0], at[1], at[2] + radius * 0.78],
      radius * 0.62,
      radius * 0.62,
      GOLD,
      [1, 0, 0],
      [0, 1, 0],
      0.008,
    );
  };

  const verticalDisk = (
    name: string,
    at: Point,
    radius: number,
    color: string,
  ) =>
    plate(
      name,
      at,
      organic(radius, radius, 14, Math.PI / 14, 0.025),
      color,
      [1, 0, 0],
      [0, 1, 0],
      0.018,
      0.004,
    );

  // ---------------------------------------------------------------------------------------------------------------
  // Ceiling hook and the central suspension.

  curvedWire(
    "ceiling-hook",
    [
      [0, 3.04, 0],
      [0.005, 3.14, 0],
      [0.12, 3.17, 0.005],
      [0.16, 3.08, 0.01],
    ],
    0.007,
  );

  b.part(new THREE.TorusGeometry(0.064, 0.009, 6, 16), BRONZE, {
    at: [0, 3.035, 0],
    rotation: [90, 0, 0],
    flat: true,
    name: "ceiling-ring",
    group,
  });

  wire("main-suspension", [0.055, 3.02, 0], [0, 2.69, 0], 0.005);
  bead("upper-suspension-bead", [0, 2.69, 0], 0.036, RED);

  b.part(new THREE.TorusGeometry(0.047, 0.007, 6, 14), GOLD, {
    at: [0, 2.68, 0],
    rotation: [90, 0, 0],
    flat: true,
    name: "upper-ring",
    group,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Upper balance beam.

  rod(
    "upper-balance",
    [-0.76, 2.60, 0],
    [0.76, 2.60, 0],
    0.012,
    BLACK,
  );
  pivot("upper-pivot", [0, 2.60, 0], 0.034);

  bead("upper-left-counterweight", [-0.76, 2.60, 0], 0.036, STEEL);
  bead("upper-right-counterweight", [0.76, 2.60, 0], 0.031, BRONZE);

  // Upper left red biomorphic blade.
  wire("upper-left-drop", [-0.65, 2.60, 0], [-0.65, 2.39, 0.035], 0.003);
  plate(
    "upper-left-red-blade",
    [-0.65, 2.39, 0.04],
    [
      [-0.03, -0.27],
      [-0.16, -0.15],
      [-0.21, 0.03],
      [-0.13, 0.22],
      [0.02, 0.31, "sharp"],
      [0.16, 0.17],
      [0.14, -0.08],
      [0.06, -0.24],
    ],
    RED,
    [1, 0, 0.12],
    [0, 1, 0],
    0.028,
  );

  plate(
    "upper-left-red-inset",
    onPlane([-0.65, 2.39, 0.04], [1, 0, 0.12], [0, 1, 0], -0.015, 0.07, 0.016),
    [
      [-0.055, -0.06],
      [-0.085, 0.03],
      [-0.035, 0.11],
      [0.045, 0.09],
      [0.065, 0.01],
      [0.03, -0.07],
    ],
    OXBLOOD,
    [1, 0, 0.12],
    [0, 1, 0],
    0.009,
    0.002,
  );

  ellipse(
    "upper-left-red-dot",
    onPlane([-0.65, 2.39, 0.04], [1, 0, 0.12], [0, 1, 0], 0.07, -0.12, 0.018),
    0.027,
    0.027,
    CREAM,
    [1, 0, 0.12],
    [0, 1, 0],
    0.008,
  );

  // Upper right yellow leaf.
  wire("upper-right-drop", [0.64, 2.60, 0], [0.64, 2.34, -0.02], 0.003);
  plate(
    "upper-right-yellow-leaf",
    [0.64, 2.34, -0.02],
    [
      [-0.20, -0.18],
      [-0.06, -0.28],
      [0.12, -0.20],
      [0.22, -0.02],
      [0.19, 0.17],
      [0.05, 0.28, "sharp"],
      [-0.12, 0.19],
      [-0.22, 0.02],
    ],
    YELLOW,
    [0.97, 0, -0.18],
    [0, 1, 0],
    0.03,
  );

  plate(
    "upper-right-yellow-slash",
    onPlane([0.64, 2.34, -0.02], [0.97, 0, -0.18], [0, 1, 0], -0.01, 0.02, 0.017),
    [
      [-0.13, -0.02],
      [-0.01, -0.11],
      [0.13, -0.03],
      [0.12, 0.035],
      [0.01, 0.095],
      [-0.12, 0.045],
    ],
    GOLD,
    [0.97, 0, -0.18],
    [0, 1, 0],
    0.009,
    0.002,
  );

  ellipse(
    "upper-right-yellow-eye",
    onPlane([0.64, 2.34, -0.02], [0.97, 0, -0.18], [0, 1, 0], 0.085, 0.105, 0.019),
    0.034,
    0.034,
    RED,
    [0.97, 0, -0.18],
    [0, 1, 0],
    0.008,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Left secondary arm.

  wire("left-branch-hanger", [-0.72, 2.60, 0], [-0.78, 2.18, 0.09], 0.004);
  rod(
    "left-secondary-balance",
    [-1.16, 2.18, 0.09],
    [-0.30, 2.18, -0.02],
    0.010,
    BRONZE,
  );
  pivot("left-secondary-pivot", [-0.78, 2.18, 0.09], 0.027);
  bead("left-secondary-tip", [-1.16, 2.18, 0.09], 0.029, BLACK);
  bead("left-secondary-tip-small", [-0.30, 2.18, -0.02], 0.022, GOLD);

  wire("left-blue-drop", [-1.08, 2.18, 0.09], [-1.08, 1.88, 0.13], 0.003);
  plate(
    "left-blue-sail",
    [-1.08, 1.88, 0.13],
    [
      [-0.25, -0.12],
      [-0.18, -0.27],
      [-0.01, -0.34, "sharp"],
      [0.18, -0.22],
      [0.25, -0.01],
      [0.16, 0.19],
      [-0.02, 0.28],
      [-0.19, 0.18],
    ],
    BLUE,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.027,
  );

  plate(
    "left-blue-sail-inset",
    onPlane([-1.08, 1.88, 0.13], [0.98, 0, 0.2], [0, 1, 0], 0.035, -0.02, 0.017),
    [
      [-0.12, -0.07],
      [-0.02, -0.15],
      [0.12, -0.09],
      [0.13, 0.01],
      [0.03, 0.09],
      [-0.10, 0.07],
    ],
    BLUE_LIGHT,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.008,
    0.002,
  );

  ellipse(
    "left-blue-sail-dot",
    onPlane([-1.08, 1.88, 0.13], [0.98, 0, 0.2], [0, 1, 0], -0.08, 0.13, 0.018),
    0.03,
    0.03,
    YELLOW,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.008,
  );

  wire("left-cream-drop", [-0.38, 2.18, -0.02], [-0.38, 1.67, 0.02], 0.003);
  ellipse(
    "left-cream-counterplate",
    [-0.38, 1.60, 0.02],
    0.14,
    0.23,
    CREAM,
    [0.99, 0, -0.08],
    [0, 1, 0],
    0.021,
  );
  plate(
    "left-cream-countermark",
    onPlane([-0.38, 1.60, 0.02], [0.99, 0, -0.08], [0, 1, 0], 0.015, 0.01, 0.015),
    [
      [-0.07, -0.13],
      [0.02, -0.17],
      [0.09, -0.04],
      [0.06, 0.13],
      [-0.03, 0.17],
      [-0.09, 0.04],
    ],
    RED,
    [0.99, 0, -0.08],
    [0, 1, 0],
    0.008,
    0.002,
  );

  // A small orange counterweight at the far left.
  wire("left-lower-orange-string", [-1.08, 1.88, 0.13], [-1.08, 1.37, 0.19], 0.003);
  plate(
    "left-orange-drop",
    [-1.08, 1.28, 0.19],
    [
      [-0.12, -0.18],
      [-0.22, -0.02],
      [-0.16, 0.16],
      [0.01, 0.26, "sharp"],
      [0.17, 0.14],
      [0.20, -0.05],
      [0.08, -0.19],
    ],
    ORANGE,
    [0.94, 0, 0.34],
    [0, 1, 0],
    0.025,
  );
  ellipse(
    "left-orange-dot",
    onPlane([-1.08, 1.28, 0.19], [0.94, 0, 0.34], [0, 1, 0], -0.06, 0.07, 0.016),
    0.025,
    0.025,
    BLACK,
    [0.94, 0, 0.34],
    [0, 1, 0],
    0.007,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Right secondary arm.

  wire("right-branch-hanger", [0.72, 2.60, 0], [0.77, 2.14, -0.10], 0.004);
  rod(
    "right-secondary-balance",
    [0.35, 2.14, -0.10],
    [1.22, 2.14, 0.06],
    0.010,
    BRONZE,
  );
  pivot("right-secondary-pivot", [0.77, 2.14, -0.10], 0.027);
  bead("right-secondary-inner-tip", [0.35, 2.14, -0.10], 0.024, GOLD);
  bead("right-secondary-outer-tip", [1.22, 2.14, 0.06], 0.032, BLACK);

  wire("right-red-drop", [0.38, 2.14, -0.10], [0.38, 1.79, -0.01], 0.003);
  plate(
    "right-red-petal",
    [0.38, 1.70, -0.01],
    [
      [-0.19, -0.14],
      [-0.06, -0.28],
      [0.11, -0.22],
      [0.20, -0.05],
      [0.13, 0.15],
      [-0.01, 0.25, "sharp"],
      [-0.17, 0.17],
    ],
    RED_LIGHT,
    [1, 0, 0.16],
    [0, 1, 0],
    0.027,
  );

  plate(
    "right-red-petal-mark",
    onPlane([0.38, 1.70, -0.01], [1, 0, 0.16], [0, 1, 0], -0.02, -0.015, 0.017),
    [
      [-0.11, -0.06],
      [-0.04, -0.13],
      [0.08, -0.10],
      [0.13, 0.01],
      [0.04, 0.09],
      [-0.08, 0.08],
    ],
    OXBLOOD,
    [1, 0, 0.16],
    [0, 1, 0],
    0.008,
    0.002,
  );

  wire("right-yellow-drop", [1.16, 2.14, 0.06], [1.16, 1.82, 0.10], 0.003);
  plate(
    "right-yellow-hook",
    [1.16, 1.70, 0.10],
    [
      [-0.19, -0.25],
      [-0.29, -0.06],
      [-0.23, 0.13],
      [-0.06, 0.29, "sharp"],
      [0.13, 0.20],
      [0.23, 0.02],
      [0.15, -0.17],
      [0.01, -0.22],
      [-0.01, -0.03],
      [0.07, 0.11],
      [-0.04, 0.16],
      [-0.13, 0.05],
      [-0.10, -0.10],
    ],
    YELLOW,
    [0.96, 0, -0.28],
    [0, 1, 0],
    0.028,
  );
  ellipse(
    "right-yellow-hook-dot",
    onPlane([1.16, 1.70, 0.10], [0.96, 0, -0.28], [0, 1, 0], 0.10, -0.08, 0.018),
    0.027,
    0.027,
    BLUE,
    [0.96, 0, -0.28],
    [0, 1, 0],
    0.008,
  );

  // A dark pendulum on the right, giving the mobile a visual counterweight.
  wire("right-dark-pendulum", [1.18, 1.70, 0.10], [1.18, 1.24, 0.18], 0.003);
  bead("right-dark-pendulum-bead", [1.18, 1.13, 0.18], 0.08, BLACK);
  ellipse(
    "right-dark-pendulum-face",
    [1.18, 1.13, 0.25],
    0.042,
    0.042,
    CREAM,
    [1, 0, 0],
    [0, 1, 0],
    0.008,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Central lower balance, suspended from the upper beam.

  wire("central-long-suspension", [0, 2.60, 0], [0, 1.91, 0.12], 0.004);
  bead("central-upper-bead", [0, 2.23, 0.06], 0.024, GOLD);

  rod(
    "central-balance",
    [-0.52, 1.91, 0.12],
    [0.57, 1.91, 0.12],
    0.010,
    BLACK,
  );
  pivot("central-pivot", [0, 1.91, 0.12], 0.029);
  bead("central-left-tip", [-0.52, 1.91, 0.12], 0.027, STEEL);
  bead("central-right-tip", [0.57, 1.91, 0.12], 0.026, BRONZE);

  wire("central-left-drop", [-0.47, 1.91, 0.12], [-0.47, 1.56, 0.15], 0.003);
  plate(
    "central-left-green",
    [-0.47, 1.45, 0.15],
    [
      [-0.19, -0.16],
      [-0.18, 0.05],
      [-0.05, 0.22],
      [0.12, 0.26, "sharp"],
      [0.22, 0.09],
      [0.16, -0.13],
      [0.02, -0.25],
    ],
    GREEN,
    [0.99, 0, 0.11],
    [0, 1, 0],
    0.025,
  );
  plate(
    "central-left-green-stripe",
    onPlane([-0.47, 1.45, 0.15], [0.99, 0, 0.11], [0, 1, 0], 0.035, 0.01, 0.016),
    [
      [-0.08, -0.12],
      [-0.01, -0.16],
      [0.09, -0.06],
      [0.08, 0.04],
      [-0.02, 0.13],
      [-0.09, 0.06],
    ],
    CREAM,
    [0.99, 0, 0.11],
    [0, 1, 0],
    0.008,
    0.002,
  );

  wire("central-right-drop", [0.52, 1.91, 0.12], [0.52, 1.54, 0.02], 0.003);
  ellipse(
    "central-right-blue-disc",
    [0.52, 1.42, 0.02],
    0.20,
    0.27,
    BLUE,
    [0.96, 0, -0.28],
    [0, 1, 0],
    0.024,
  );
  plate(
    "central-right-blue-crescent",
    onPlane([0.52, 1.42, 0.02], [0.96, 0, -0.28], [0, 1, 0], 0.07, 0.025, 0.016),
    [
      [-0.13, -0.17],
      [-0.02, -0.21],
      [0.10, -0.10],
      [0.13, 0.05],
      [0.03, 0.18],
      [-0.08, 0.16],
      [-0.14, 0.03],
      [-0.06, -0.03],
      [0.03, 0.03],
      [0.04, 0.09],
      [-0.03, 0.11],
      [-0.10, 0.05],
    ],
    BLUE_LIGHT,
    [0.96, 0, -0.28],
    [0, 1, 0],
    0.009,
    0.002,
  );
  ellipse(
    "central-right-blue-dot",
    onPlane([0.52, 1.42, 0.02], [0.96, 0, -0.28], [0, 1, 0], -0.09, -0.11, 0.017),
    0.032,
    0.032,
    YELLOW,
    [0.96, 0, -0.28],
    [0, 1, 0],
    0.008,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Lowest balance, hung from the central balance.

  wire("lower-central-suspension", [0, 1.91, 0.12], [0, 1.22, 0.21], 0.004);
  bead("lower-central-bead", [0, 1.54, 0.16], 0.026, RED);

  rod(
    "lower-balance",
    [-0.43, 1.22, 0.21],
    [0.48, 1.22, 0.21],
    0.009,
    BRONZE,
  );
  pivot("lower-pivot", [0, 1.22, 0.21], 0.026);
  bead("lower-left-tip", [-0.43, 1.22, 0.21], 0.023, GOLD);
  bead("lower-right-tip", [0.48, 1.22, 0.21], 0.025, STEEL);

  wire("lower-left-drop", [-0.38, 1.22, 0.21], [-0.38, 0.88, 0.26], 0.003);
  plate(
    "lower-left-orange-fan",
    [-0.38, 0.73, 0.26],
    [
      [-0.22, -0.13],
      [-0.17, 0.05],
      [-0.06, 0.18],
      [0.07, 0.25, "sharp"],
      [0.21, 0.14],
      [0.25, -0.04],
      [0.14, -0.19],
      [-0.02, -0.25],
    ],
    ORANGE,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.027,
  );
  plate(
    "lower-left-orange-rib",
    onPlane([-0.38, 0.73, 0.26], [0.98, 0, 0.2], [0, 1, 0], -0.03, 0.0, 0.017),
    [
      [-0.13, -0.09],
      [-0.04, -0.13],
      [0.13, 0.06],
      [0.09, 0.12],
      [-0.06, 0.04],
    ],
    RUST,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.008,
    0.002,
  );
  ellipse(
    "lower-left-orange-eye",
    onPlane([-0.38, 0.73, 0.26], [0.98, 0, 0.2], [0, 1, 0], 0.10, 0.12, 0.018),
    0.028,
    0.028,
    CREAM,
    [0.98, 0, 0.2],
    [0, 1, 0],
    0.008,
  );

  wire("lower-right-drop", [0.44, 1.22, 0.21], [0.44, 0.88, 0.06], 0.003);
  plate(
    "lower-right-yellow-fin",
    [0.44, 0.70, 0.06],
    [
      [-0.12, -0.26],
      [0.04, -0.31, "sharp"],
      [0.17, -0.14],
      [0.20, 0.08],
      [0.07, 0.24],
      [-0.10, 0.19],
      [-0.18, 0.01],
    ],
    YELLOW,
    [0.95, 0, -0.31],
    [0, 1, 0],
    0.026,
  );
  plate(
    "lower-right-yellow-mark",
    onPlane([0.44, 0.70, 0.06], [0.95, 0, -0.31], [0, 1, 0], 0.015, 0.07, 0.016),
    [
      [-0.08, -0.08],
      [0.02, -0.14],
      [0.10, -0.02],
      [0.08, 0.10],
      [-0.03, 0.13],
      [-0.10, 0.03],
    ],
    RED,
    [0.95, 0, -0.31],
    [0, 1, 0],
    0.008,
    0.002,
  );

  // Bottom central hanging shape, deliberately larger and darker to finish the silhouette.
  wire("bottom-center-drop", [0, 1.22, 0.21], [0, 0.82, 0.20], 0.004);
  bead("bottom-center-bead", [0, 0.82, 0.20], 0.032, GOLD);

  plate(
    "bottom-black-sculptural-form",
    [0, 0.59, 0.20],
    [
      [-0.19, -0.12],
      [-0.22, 0.08],
      [-0.10, 0.25],
      [0.07, 0.29, "sharp"],
      [0.22, 0.15],
      [0.25, -0.06],
      [0.12, -0.25],
      [-0.04, -0.29],
    ],
    BLACK,
    [1, 0, 0.06],
    [0, 1, 0],
    0.032,
  );

  plate(
    "bottom-black-red-inset",
    onPlane([0, 0.59, 0.20], [1, 0, 0.06], [0, 1, 0], -0.035, 0.035, 0.019),
    [
      [-0.08, -0.14],
      [0.02, -0.19],
      [0.12, -0.07],
      [0.10, 0.08],
      [0.00, 0.16],
      [-0.10, 0.07],
    ],
    RED,
    [1, 0, 0.06],
    [0, 1, 0],
    0.009,
    0.002,
  );

  ellipse(
    "bottom-black-yellow-dot",
    onPlane([0, 0.59, 0.20], [1, 0, 0.06], [0, 1, 0], 0.07, -0.13, 0.019),
    0.031,
    0.031,
    YELLOW,
    [1, 0, 0.06],
    [0, 1, 0],
    0.009,
  );

  // A pair of tiny offset silhouettes add the layered, hand-cut-metal quality of a Calder sculpture.
  wire("bottom-left-mini-string", [-0.38, 0.73, 0.26], [-0.68, 0.43, 0.22], 0.0028);
  plate(
    "bottom-left-mini-blue",
    [-0.68, 0.31, 0.22],
    [
      [-0.09, -0.09],
      [-0.13, 0.02],
      [-0.04, 0.13],
      [0.08, 0.11],
      [0.13, 0.00],
      [0.06, -0.12],
    ],
    BLUE,
    [0.99, 0, 0.1],
    [0, 1, 0],
    0.018,
    0.003,
  );

  wire("bottom-right-mini-string", [0.44, 0.70, 0.06], [0.78, 0.48, 0.00], 0.0028);
  plate(
    "bottom-right-mini-cream",
    [0.78, 0.36, 0],
    [
      [-0.12, -0.08],
      [-0.02, -0.14],
      [0.11, -0.06],
      [0.13, 0.07],
      [0.02, 0.14],
      [-0.11, 0.07],
    ],
    CREAM,
    [0.98, 0, -0.16],
    [0, 1, 0],
    0.018,
    0.003,
  );

  // A few intentional metal fittings make the suspension read as assembled rather than floating.
  bead("bottom-left-fitting", [-0.68, 0.43, 0.22], 0.018, GOLD);
  bead("bottom-right-fitting", [0.78, 0.48, 0], 0.017, BLACK);

  b.part(new THREE.TorusGeometry(0.035, 0.006, 6, 12), STEEL, {
    at: [-0.38, 0.73, 0.26],
    rotation: [90, 0, 0],
    flat: true,
    name: "orange-hanger-ring",
    group,
  });

  b.part(new THREE.TorusGeometry(0.032, 0.006, 6, 12), GOLD, {
    at: [0.44, 0.70, 0.06],
    rotation: [90, 0, 0],
    flat: true,
    name: "yellow-hanger-ring",
    group,
  });

  return b.root;
}
