import * as THREE from "three";
import { createBuilder, polyline, svg } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An airy Alexander Calder-inspired hanging mobile of counterbalanced black wire arms and bold primary-color abstract plates.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17191d";
  const RED = "#e83b32";
  const BLUE = "#2474c9";
  const YELLOW = "#f4c928";
  const ORANGE = "#ef7b32";
  const WHITE = "#f1eee2";
  const GREEN = "#4d9c68";
  const PINK = "#d94a72";

  const wire = (a: [number, number, number], c: [number, number, number], r = 0.009, color = BLACK) => {
    return b.rod(a, c, r, { color, caps: "round", name: "black_wire" });
  };

  const bead = (p: [number, number, number], radius = 0.026, color = BLACK) => {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      flat: true,
      name: "balance_bead",
    });
  };

  type Outline = [number, number][];

  const plate = (
    outline: Outline,
    at: [number, number, number],
    x: [number, number, number],
    color: string,
    name: string,
    y: [number, number, number] = [0, 1, 0],
    thickness = 0.014,
  ) => {
    return b.extrude(outline, {
      at,
      x,
      y,
      thickness,
      bevel: 0.004,
      smoothing: 0,
      color,
      name,
      flat: true,
    });
  };

  const disk = (
    at: [number, number, number],
    radius: number,
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name = "round_plate",
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, 0.018, 12), color, {
      at,
      dir,
      flat: true,
      name,
    });
  };

  const diamond = (at: [number, number, number], scale: number, color: string, x: [number, number, number], name: string) =>
    plate(
      [
        [0, 0],
        [0.48 * scale, 0.13 * scale],
        [0.33 * scale, 0.38 * scale],
        [0.04 * scale, 0.62 * scale],
        [-0.25 * scale, 0.32 * scale],
        [-0.42 * scale, 0.06 * scale],
      ],
      at,
      x,
      color,
      name,
    );

  const crescent = (
    at: [number, number, number],
    scale: number,
    color: string,
    x: [number, number, number],
    name: string,
  ) =>
    plate(
      [
        [-0.38 * scale, 0.05 * scale],
        [-0.28 * scale, 0.28 * scale],
        [-0.05 * scale, 0.43 * scale],
        [0.28 * scale, 0.39 * scale],
        [0.43 * scale, 0.18 * scale],
        [0.31 * scale, 0.04 * scale],
        [0.04 * scale, 0.13 * scale],
        [-0.22 * scale, 0.12 * scale],
      ],
      at,
      x,
      color,
      name,
    );

  const hookTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#17191d"/>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#f4c928" stroke-width="3"/>
      <circle cx="32" cy="32" r="11" fill="#e83b32"/>
      <path d="M32 8v48M8 32h48" stroke="#f1eee2" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  // Top suspension ring and vertical spine.
  b.part(new THREE.TorusGeometry(0.075, 0.010, 6, 16), BLACK, {
    at: [0, 2.76, 0],
    rotation: [Math.PI / 2, 0, 0],
    flat: true,
    name: "ceiling_ring",
  });
  wire([0, 2.74, 0], [0, 2.42, 0], 0.012);
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 10), YELLOW, {
    at: [0, 2.42, 0],
    dir: [0, 1, 0],
    flat: true,
    name: "top_cap",
  });

  // A small graphic medallion hangs under the top cap.
  const medallion = b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.022, 12), WHITE, {
    at: [0, 2.29, 0],
    dir: [0, 0, 1],
    texture: hookTexture,
    flat: true,
    name: "graphic_medallion",
  });
  wire([0, 2.42, 0], [0, 2.34, 0], 0.008);
  void medallion;

  // Highest counterbalanced arm.
  wire([-0.61, 2.17, 0.02], [0.51, 2.17, 0.02], 0.012);
  bead([0, 2.17, 0.02], 0.035, BLACK);
  wire([0, 2.30, 0], [0, 2.17, 0.02], 0.008);

  // Left upper pendant: large red angular sail.
  wire([-0.61, 2.17, 0.02], [-0.68, 1.80, 0.04], 0.007);
  plate(
    [
      [0, 0],
      [0.34, 0.02],
      [0.26, 0.20],
      [0.05, 0.35],
      [-0.20, 0.24],
      [-0.30, 0.08],
    ],
    [-0.68, 1.75, 0.04],
    [1, 0, 0],
    RED,
    "red_upper_sail",
  );
  disk([-0.68, 1.73, 0.055], 0.035, WHITE, [0, 0, 1], "red_sail_eye");

  // Right upper pendant: yellow crescent and a tiny blue counterweight.
  wire([0.51, 2.17, 0.02], [0.63, 1.88, -0.02], 0.007);
  crescent([0.63, 1.82, -0.02], 0.72, YELLOW, [1, 0, 0], "yellow_upper_crescent");
  wire([0.51, 2.17, 0.02], [0.30, 2.03, -0.10], 0.006);
  disk([0.27, 2.02, -0.10], 0.075, BLUE, [0, 1, 0], "blue_counterweight");

  // Middle suspension drops from the upper arm.
  wire([0.05, 2.17, 0.02], [0.05, 1.88, 0.02], 0.007);
  bead([0.05, 1.88, 0.02], 0.025);

  // Middle arm, deliberately skewed for the hand-balanced Calder silhouette.
  wire([-0.48, 1.84, 0.02], [0.57, 1.84, 0.02], 0.011);
  bead([0.05, 1.84, 0.02], 0.032);
  wire([0.05, 1.88, 0.02], [0.05, 1.84, 0.02], 0.007);

  // Blue left middle blade.
  wire([-0.48, 1.84, 0.02], [-0.57, 1.47, 0.10], 0.007);
  plate(
    [
      [0, 0],
      [0.13, 0.10],
      [0.08, 0.40],
      [-0.08, 0.61],
      [-0.24, 0.45],
      [-0.18, 0.12],
    ],
    [-0.57, 1.39, 0.10],
    [1, 0, 0],
    BLUE,
    "blue_middle_blade",
  );
  wire([-0.57, 1.39, 0.10], [-0.57, 1.27, 0.10], 0.006);
  disk([-0.57, 1.22, 0.10], 0.045, ORANGE, [0, 0, 1], "orange_middle_dot");

  // Orange right middle spiral-like angular plate.
  wire([0.57, 1.84, 0.02], [0.70, 1.57, -0.03], 0.007);
  plate(
    [
      [-0.38, 0.05],
      [-0.25, 0.29],
      [0.00, 0.42],
      [0.32, 0.35],
      [0.43, 0.15],
      [0.29, 0.02],
      [0.05, 0.18],
      [-0.18, 0.17],
    ],
    [0.70, 1.49, -0.03],
    [1, 0, 0],
    ORANGE,
    "orange_middle_loop",
  );
  wire([0.70, 1.49, -0.03], [0.70, 1.36, -0.03], 0.006);
  disk([0.70, 1.31, -0.03], 0.032, BLACK, [0, 0, 1], "orange_loop_dot");

  // A lower crossbar, suspended from the middle arm.
  wire([-0.02, 1.84, 0.02], [-0.02, 1.54, 0.02], 0.007);
  bead([-0.02, 1.54, 0.02], 0.024);
  wire([-0.49, 1.51, 0.01], [0.51, 1.51, 0.01], 0.010);
  bead([-0.02, 1.51, 0.01], 0.029);

  // Lower left white leaf.
  wire([-0.49, 1.51, 0.01], [-0.64, 1.13, 0.00], 0.006);
  plate(
    [
      [0, 0],
      [0.25, 0.04],
      [0.41, 0.16],
      [0.26, 0.28],
      [-0.05, 0.31],
      [-0.27, 0.20],
      [-0.33, 0.07],
    ],
    [-0.64, 1.08, 0.00],
    [1, 0, 0],
    WHITE,
    "white_lower_leaf",
  );
  wire([-0.64, 1.08, 0.00], [-0.64, 0.94, 0.00], 0.006);
  disk([-0.64, 0.90, 0.00], 0.028, RED, [0, 0, 1], "white_leaf_dot");

  // Lower right horizontal blue oval, tilted in depth.
  wire([0.51, 1.51, 0.01], [0.62, 1.10, -0.10], 0.006);
  plate(
    [
      [-0.44, 0.02],
      [-0.26, 0.12],
      [0.02, 0.16],
      [0.35, 0.11],
      [0.46, 0.02],
      [0.30, -0.09],
      [0.00, -0.14],
      [-0.29, -0.10],
    ],
    [0.62, 1.05, -0.10],
    [1, 0, 0],
    BLUE,
    "blue_lower_oval",
    [0, 0, 1],
  );
  disk([0.62, 1.05, -0.115], 0.035, YELLOW, [0, 0, 1], "blue_oval_dot");

  // A third, very low arm gives the mobile a long graceful taper.
  wire([0.00, 1.51, 0.01], [0.00, 1.24, 0.01], 0.007);
  wire([-0.36, 1.18, 0.01], [0.48, 1.18, 0.01], 0.009);
  bead([0.00, 1.18, 0.01], 0.025);

  // Low red lightning shape on the left.
  wire([-0.36, 1.18, 0.01], [-0.43, 0.76, 0.04], 0.006);
  plate(
    [
      [0, 0],
      [0.28, 0.06],
      [0.12, 0.20],
      [0.31, 0.27],
      [-0.04, 0.42],
      [0.00, 0.25],
      [-0.26, 0.18],
    ],
    [-0.43, 0.70, 0.04],
    [1, 0, 0],
    RED,
    "red_low_lightning",
  );
  disk([-0.43, 0.68, 0.055], 0.025, YELLOW, [0, 0, 1], "red_lightning_dot");

  // Low green fan on the right.
  wire([0.48, 1.18, 0.01], [0.60, 0.85, -0.02], 0.006);
  plate(
    [
      [-0.04, 0],
      [0.24, 0.06],
      [0.43, 0.22],
      [0.34, 0.34],
      [0.04, 0.28],
      [-0.21, 0.15],
    ],
    [0.60, 0.79, -0.02],
    [1, 0, 0],
    GREEN,
    "green_low_fan",
  );
  wire([0.60, 0.79, -0.02], [0.60, 0.61, -0.02], 0.006);
  disk([0.60, 0.57, -0.02], 0.037, PINK, [0, 0, 1], "green_fan_dot");

  // A small flat plate seen from above, adding a different plane to the composition.
  wire([0.00, 1.18, 0.01], [0.00, 0.88, 0.22], 0.006);
  plate(
    [
      [-0.22, 0],
      [0.00, 0.14],
      [0.26, 0.04],
      [0.20, -0.12],
      [-0.10, -0.16],
    ],
    [0.00, 0.83, 0.22],
    [1, 0, 0],
    YELLOW,
    "yellow_low_leaf",
    [0, 0, 1],
  );

  // A few purposeful wire kinks and small discs make the balance mechanisms legible.
  wire([-0.43, 0.70, 0.04], [-0.43, 0.57, 0.04], 0.005);
  wire([0.60, 0.79, -0.02], [0.60, 0.57, -0.02], 0.005);
  wire([0.00, 0.83, 0.22], [0.00, 0.64, 0.22], 0.005);

  // Tiny terminal counterweights, all different colors.
  disk([-0.43, 0.54, 0.04], 0.052, BLUE, [0, 1, 0], "terminal_blue_weight");
  disk([0.60, 0.53, -0.02], 0.044, RED, [0, 1, 0], "terminal_red_weight");
  disk([0.00, 0.60, 0.22], 0.036, GREEN, [0, 1, 0], "terminal_green_weight");

  // A final floating black line echoes Calder's hand-drawn contour language.
  b.sweep(
    polyline([
      [-0.18, 2.34, -0.06],
      [-0.34, 2.39, -0.06],
      [-0.42, 2.31, -0.06],
    ]),
    0.006,
    { color: BLACK, caps: "round", name: "upper_contour" },
  );

  return b.root;
}
