import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "calder hanging mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile of thin black balancing rods, colorful organic plates, discs, beads, and suspended counterweights.",
};

export default function build() {
  const b = createBuilder({ name: "calder-hanging-mobile", detail: 1 });

  const BLACK = "#17151b";
  const RED = "#e84a36";
  const VERMILION = "#c9342d";
  const YELLOW = "#f3c532";
  const OCHRE = "#d99228";
  const BLUE = "#2865a7";
  const CYAN = "#2d9fb0";
  const GREEN = "#4a9b67";
  const CREAM = "#ead9b8";
  const WHITE = "#f1eee3";
  const PURPLE = "#72508f";

  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  function wire(
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.006,
    color = BLACK,
  ) {
    return b.rod(a, c, radius, { color, caps: "round", section: { ngon: 6 } });
  }

  function bead(
    p: [number, number, number],
    radius: number,
    color: string,
    scale?: [number, number, number],
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      scale,
    });
  }

  function disc(
    p: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    axis: [number, number, number] = [0, 0, 1],
    scale?: [number, number, number],
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, 14, 1), color, {
      at: p,
      dir: axis,
      scale,
      flat: true,
    });
  }

  function plate(
    p: [number, number, number],
    outline: [number, number][],
    color: string,
    thickness = 0.014,
    side = 1,
    shadow = true,
  ) {
    if (shadow) {
      const back = outline.map(([x, y]) => [x * 1.08, y * 1.08] as [number, number]);
      b.extrude(back, {
        at: [p[0], p[1], p[2] - 0.012],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: BLACK,
        name: "plate-outline",
      });
    }
    return b.extrude(outline, {
      at: p,
      x: [side, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.003,
      smoothing: 1,
      color,
      name: "colored-plate",
    });
  }

  function verticalDrop(
    from: [number, number, number],
    to: [number, number, number],
    color = BLACK,
  ) {
    wire(from, to, 0.0045, color);
  }

  function crescent(
    p: [number, number, number],
    color: string,
    side = 1,
    scale = 1,
  ) {
    const shape: [number, number][] = [
      [-0.02, -0.19],
      [0.12, -0.15],
      [0.21, -0.04],
      [0.22, 0.10],
      [0.15, 0.20],
      [0.01, 0.23],
      [0.09, 0.12],
      [0.12, 0.01],
      [0.09, -0.10],
    ].map(([x, y]) => [x * scale, y * scale]);
    return plate(p, shape, color, 0.016, side, true);
  }

  function leaf(
    p: [number, number, number],
    color: string,
    flip = 1,
    scale = 1,
  ) {
    const shape: [number, number][] = [
      [0, -0.20],
      [0.13, -0.13],
      [0.23, 0.02],
      [0.15, 0.17],
      [0.02, 0.24],
      [-0.07, 0.10],
      [-0.08, -0.05],
    ].map(([x, y]) => [x * scale * flip, y * scale]);
    const part = plate(p, shape, color, 0.014, 1, true);
    wire(
      [p[0], p[1] - 0.17 * scale, p[2] + 0.011],
      [p[0] + 0.13 * scale * flip, p[1] + 0.13 * scale, p[2] + 0.011],
      0.0025,
      BLACK,
    );
    return part;
  }

  // Top suspension loop and cap.
  b.part(new THREE.TorusGeometry(0.075, 0.012, 6, 16), BLACK, {
    at: [0, 2.775, 0],
    rotation: [0, 0, 0],
    name: "hanging-loop",
  });
  disc([0, 2.69, 0], 0.055, 0.018, BLACK, [0, 1, 0]);
  verticalDrop([0, 2.69, 0], [0, 2.43, 0]);

  // Upper balancing rod: intentionally off-center pivot and unequal visual weights.
  wire([-0.58, 2.31, 0], [0.50, 2.40, 0], 0.009);
  bead([-0.03, 2.365, 0], 0.025, BLACK);
  verticalDrop([-0.03, 2.365, 0], [0, 2.43, 0]);

  // Upper left red blade and yellow counter-disc.
  verticalDrop([-0.58, 2.31, 0], [-0.58, 2.08, 0]);
  plate(
    [-0.58, 1.91, 0],
    [
      [-0.12, -0.18],
      [0.02, -0.23],
      [0.15, -0.10],
      [0.10, 0.05],
      [0.19, 0.18],
      [0.01, 0.13],
      [-0.12, 0.23],
      [-0.08, 0.04],
    ],
    RED,
    0.016,
    1,
    true,
  );
  disc([-0.58, 1.68, 0.01], 0.085, 0.018, OCHRE, [0, 0, 1], [1.25, 1, 0.72]);

  verticalDrop([0.50, 2.40, 0], [0.50, 2.15, 0]);
  disc([0.50, 2.01, 0.015], 0.14, 0.018, YELLOW, [0, 0, 1], [1.15, 1, 0.85]);
  bead([0.50, 1.84, 0], 0.035, BLACK);

  // A second level, turned into depth so the layers read clearly.
  verticalDrop([0, 2.43, 0], [0, 2.08, 0.01]);
  wire([-0.47, 2.02, 0.04], [0.55, 1.96, 0.04], 0.008);
  bead([-0.02, 1.99, 0.04], 0.022, BLACK);

  // Middle left cyan leaf and small black counterweight.
  verticalDrop([-0.47, 2.02, 0.04], [-0.47, 1.78, 0.04]);
  leaf([-0.47, 1.61, 0.04], CYAN, 1, 0.82);
  verticalDrop([-0.47, 1.44, 0.04], [-0.47, 1.26, 0.04]);
  bead([-0.47, 1.18, 0.04], 0.075, BLACK, [1.2, 0.65, 1.0]);

  // Middle right blue crescent, hung from the end.
  verticalDrop([0.55, 1.96, 0.04], [0.55, 1.77, 0.04]);
  crescent([0.55, 1.55, 0.04], BLUE, -1, 0.82);
  bead([0.55, 1.31, 0.04], 0.052, YELLOW);

  // Center stem, visible through the composition.
  verticalDrop([0, 2.08, 0.01], [0, 1.70, 0.01]);
  disc([0, 1.67, 0.01], 0.036, 0.022, BLACK, [0, 1, 0]);

  // Third rod: broad and asymmetric, with one element pushed toward the viewer.
  wire([-0.64, 1.63, 0.16], [0.42, 1.70, -0.12], 0.008);
  bead([-0.09, 1.665, 0.02], 0.024, BLACK);
  verticalDrop([-0.09, 1.665, 0.02], [0, 1.67, 0.01]);

  verticalDrop([-0.64, 1.63, 0.16], [-0.64, 1.39, 0.16]);
  plate(
    [-0.64, 1.20, 0.16],
    [
      [-0.18, -0.10],
      [-0.04, -0.22],
      [0.12, -0.18],
      [0.22, -0.02],
      [0.14, 0.10],
      [0.02, 0.22],
      [-0.12, 0.16],
      [-0.22, 0.02],
    ],
    PURPLE,
    0.016,
    1,
    true,
  );
  disc([-0.64, 0.92, 0.16], 0.06, 0.018, CREAM, [0, 0, 1]);

  verticalDrop([0.42, 1.70, -0.12], [0.42, 1.48, -0.12]);
  disc([0.42, 1.27, -0.12], 0.115, 0.018, RED, [0, 0, 1], [0.78, 1, 1.2]);
  verticalDrop([0.42, 1.16, -0.12], [0.42, 1.02, -0.12]);
  bead([0.42, 0.94, -0.12], 0.045, BLACK);

  // Fourth, lower rod angled across depth; its silhouette forms the visual climax.
  verticalDrop([0, 1.67, 0.01], [0, 1.31, 0.01]);
  wire([-0.42, 1.27, -0.16], [0.58, 1.18, -0.16], 0.008);
  bead([-0.02, 1.23, -0.16], 0.021, BLACK);

  verticalDrop([-0.42, 1.27, -0.16], [-0.42, 1.06, -0.16]);
  leaf([-0.42, 0.86, -0.16], GREEN, -1, 0.72);
  verticalDrop([-0.42, 0.70, -0.16], [-0.42, 0.57, -0.16]);
  bead([-0.42, 0.51, -0.16], 0.055, OCHRE);

  verticalDrop([0.58, 1.18, -0.16], [0.58, 0.97, -0.16]);
  crescent([0.58, 0.75, -0.16], VERMILION, 1, 0.72);
  verticalDrop([0.58, 0.59, -0.16], [0.58, 0.49, -0.16]);
  bead([0.58, 0.42, -0.16], 0.04, BLUE);

  // A small independent foreground arm suspended from the center, adding Calder's nested rhythm.
  verticalDrop([0, 1.31, 0.01], [0, 1.00, 0.22]);
  wire([-0.30, 0.96, 0.22], [0.31, 0.91, 0.22], 0.0065);
  bead([0, 0.935, 0.22], 0.018, BLACK);

  verticalDrop([-0.30, 0.96, 0.22], [-0.30, 0.76, 0.22]);
  disc([-0.30, 0.60, 0.22], 0.09, 0.016, WHITE, [0, 0, 1], [0.8, 1, 1.2]);

  verticalDrop([0.31, 0.91, 0.22], [0.31, 0.73, 0.22]);
  plate(
    [0.31, 0.54, 0.22],
    [
      [-0.12, -0.15],
      [0.06, -0.20],
      [0.17, -0.06],
      [0.10, 0.10],
      [0.21, 0.18],
      [0.01, 0.16],
      [-0.14, 0.24],
      [-0.08, 0.03],
    ],
    YELLOW,
    0.014,
    -1,
    true,
  );

  // Tiny lower pendant, deliberately just above the floor.
  verticalDrop([0, 1.00, 0.22], [0, 0.69, 0.22]);
  bead([0, 0.58, 0.22], 0.07, CYAN, [0.8, 1.35, 0.8]);
  wire([0, 0.50, 0.22], [0.02, 0.39, 0.22], 0.004, BLACK);
  disc([0.02, 0.34, 0.22], 0.045, 0.014, RED, [0, 0, 1]);

  // A few deliberately sparse seams and rivet-like balance beads on the larger plates.
  bead([-0.58, 1.91, 0.022], 0.014, CREAM);
  bead([0.50, 2.01, 0.034], 0.014, BLACK);
  bead([-0.64, 1.20, 0.185], 0.012, YELLOW);
  bead([0.42, 1.27, -0.095], 0.012, CREAM);

  return b.root;
}
