import * as THREE from "three";
import { createBuilder, polyline, rng } from "../../../../src/index";

export const meta = {
  name: "Alexander Calder Hanging Mobile",
  description:
    "A balanced, floating abstract mobile of hand-cut organic shapes, slender black wires, and bold primary-color forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171717";
  const RED = "#d9382f";
  const BLUE = "#1769aa";
  const YELLOW = "#f2c230";
  const ORANGE = "#e87529";
  const GREEN = "#3c8f65";
  const WHITE = "#e8dfc9";
  const PURPLE = "#704d91";

  const wire = 0.008;
  const tinyWire = 0.005;

  const rod = (a: [number, number, number], c: [number, number, number], r = wire) => {
    b.rod(a, c, r, { color: BLACK, caps: "round", section: { ngon: 6 } });
  };

  const ball = (at: [number, number, number], radius: number, color = BLACK) => {
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      flat: true,
      name: "counterweight",
    });
  };

  const disc = (
    at: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    rotation = 0,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at,
      rotation: [0, rotation, 0],
      flat: true,
      name: "painted-disc",
    });
  };

  const plate = (
    at: [number, number, number],
    outline: [number, number][],
    color: string,
    xAxis: [number, number, number] = [1, 0, 0],
    thickness = 0.012,
  ) => {
    b.extrude(outline, {
      at,
      x: xAxis,
      y: [0, 0, 1],
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
      name: "cut-metal-shape",
    });
  };

  // A long, slightly irregular suspension thread.
  rod([0, 3.45, 0], [0, 3.05, 0], tinyWire);
  rod([0, 3.05, 0], [0, 2.72, 0.015], tinyWire);
  ball([0, 3.46, 0], 0.026, BLACK);

  // Uppermost horizontal balance bar.
  rod([-0.72, 2.72, 0.015], [0.75, 2.72, 0.015], wire);
  rod([0, 3.05, 0], [0, 2.72, 0.015], tinyWire);
  ball([0, 2.72, 0.015], 0.017, BLACK);

  // Left end of the first bar: red abstract leaf.
  rod([-0.72, 2.72, 0.015], [-0.72, 2.40, 0.02], tinyWire);
  plate(
    [-0.72, 2.31, 0.02],
    [
      [-0.20, 0.0],
      [-0.10, 0.20],
      [0.10, 0.27],
      [0.22, 0.12],
      [0.13, -0.08],
      [-0.08, -0.15],
    ],
    RED,
    [1, 0, 0],
  );

  // Small yellow counterweight on the opposite end.
  rod([0.75, 2.72, 0.015], [0.75, 2.48, 0.06], tinyWire);
  disc([0.75, 2.39, 0.06], 0.12, 0.018, YELLOW, 18);
  ball([0.75, 2.22, 0.06], 0.055, BLACK);

  // Second hanging string, deliberately offset from the first pivot.
  rod([-0.20, 2.71, 0.015], [-0.20, 2.20, -0.02], tinyWire);

  // Second balance bar, diagonal in plan and slightly tilted in height.
  rod([-0.92, 2.18, -0.02], [0.68, 2.29, -0.02], wire);
  ball([-0.20, 2.20, -0.02], 0.016, BLACK);

  // Left blue crescent-like geometric plate.
  rod([-0.92, 2.18, -0.02], [-1.03, 1.87, -0.08], tinyWire);
  plate(
    [-1.03, 1.70, -0.08],
    [
      [-0.21, -0.16],
      [-0.25, 0.08],
      [-0.11, 0.25],
      [0.08, 0.28],
      [0.18, 0.12],
      [0.10, -0.02],
      [-0.02, 0.08],
      [-0.12, 0.02],
      [-0.10, -0.12],
    ],
    BLUE,
    [1, 0, 0],
  );

  // Right orange disk and a long dark counterweight.
  rod([0.68, 2.29, -0.02], [0.88, 2.05, 0.03], tinyWire);
  disc([0.94, 1.91, 0.03], 0.17, 0.02, ORANGE, -12);
  rod([0.68, 2.29, -0.02], [0.68, 2.02, 0.16], tinyWire);
  ball([0.68, 1.89, 0.16], 0.075, BLACK);

  // Third string descends from the second bar's left interior.
  rod([-0.48, 2.21, -0.02], [-0.48, 1.73, -0.15], tinyWire);

  // A broad, quiet third bar.
  rod([-0.98, 1.72, -0.15], [0.48, 1.62, -0.15], wire);
  ball([-0.48, 1.73, -0.15], 0.016, BLACK);

  // Large green leaf on the far left.
  rod([-0.98, 1.72, -0.15], [-1.18, 1.36, -0.20], tinyWire);
  plate(
    [-1.25, 1.14, -0.20],
    [
      [-0.12, -0.28],
      [-0.26, -0.08],
      [-0.22, 0.17],
      [-0.02, 0.29],
      [0.18, 0.22],
      [0.26, 0.03],
      [0.12, -0.14],
    ],
    GREEN,
    [1, 0, 0],
  );
  rod([-1.25, 1.14, -0.185], [-1.25, 1.14, -0.05], tinyWire);

  // A suspended yellow diamond, hanging independently from the third bar.
  rod([0.12, 1.65, -0.15], [0.12, 1.30, -0.10], tinyWire);
  plate(
    [0.12, 1.10, -0.10],
    [
      [0, 0.27],
      [0.17, 0],
      [0, -0.25],
      [-0.17, 0],
    ],
    YELLOW,
    [1, 0, 0],
  );

  // A tiny purple counterweight balancing the yellow diamond.
  rod([0.48, 1.62, -0.15], [0.62, 1.34, -0.10], tinyWire);
  disc([0.68, 1.20, -0.10], 0.095, 0.018, PURPLE, 28);
  ball([0.68, 1.04, -0.10], 0.04, BLACK);

  // Fourth string, making the bottom assembly feel like a separate kinetic tier.
  rod([-0.10, 1.64, -0.15], [-0.10, 1.10, 0.03], tinyWire);

  // Bottom balance arm.
  rod([-0.62, 1.08, 0.03], [0.60, 1.18, 0.03], wire);
  ball([-0.10, 1.10, 0.03], 0.015, BLACK);

  // Bottom red round plate.
  rod([-0.62, 1.08, 0.03], [-0.72, 0.78, 0.12], tinyWire);
  disc([-0.78, 0.62, 0.12], 0.20, 0.018, RED, -10);

  // Bottom blue angular plate.
  rod([0.60, 1.18, 0.03], [0.78, 0.87, 0.15], tinyWire);
  plate(
    [0.83, 0.66, 0.15],
    [
      [-0.20, -0.04],
      [-0.05, 0.20],
      [0.19, 0.13],
      [0.24, -0.10],
      [0.03, -0.22],
    ],
    BLUE,
    [1, 0, 0],
  );

  // A small white oval tucked behind the lower arm for depth.
  rod([0.05, 1.08, 0.03], [0.05, 0.78, -0.16], tinyWire);
  disc([0.05, 0.61, -0.16], 0.105, 0.016, WHITE, 35);

  // Fine black accent rods give the silhouette the delicate Calder-wire quality.
  rod([-1.25, 1.14, -0.20], [-1.02, 1.00, -0.20], 0.004);
  rod([0.12, 1.10, -0.10], [0.28, 0.93, -0.10], 0.004);
  rod([0.83, 0.66, 0.15], [0.96, 0.55, 0.15], 0.004);

  // A few small flat counterweights, kept chunky and graphic rather than realistic.
  disc([-0.98, 2.03, 0.05], 0.055, 0.014, WHITE, 0);
  disc([0.37, 1.86, -0.08], 0.065, 0.014, GREEN, 0);
  disc([-0.36, 0.87, 0.02], 0.05, 0.014, ORANGE, 0);

  return b.root;
}
