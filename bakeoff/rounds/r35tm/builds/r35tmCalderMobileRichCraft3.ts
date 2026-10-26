import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile of counterbalanced wires, vivid painted metal silhouettes, discs, crescents, and geometric ornaments.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17151a";
  const RED = "#d9483e";
  const CORAL = "#ef7152";
  const YELLOW = "#f4c542";
  const ORANGE = "#e98736";
  const BLUE = "#2776a8";
  const CYAN = "#4fa7aa";
  const GREEN = "#668c55";
  const CREAM = "#e8d8aa";
  const WIRE = "#26262a";
  const BRASS = "#b98b42";

  const random = rng(42);
  void random;

  const vertical = [0, 1, 0] as const;

  function rod(
    a: THREE.Vector3 | readonly [number, number, number],
    c: THREE.Vector3 | readonly [number, number, number],
    radius = 0.008,
    color = WIRE,
    name = "wire",
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "round",
      sides: 6,
      name,
      group: "suspension",
    });
  }

  function bead(
    p: readonly [number, number, number],
    radius: number,
    color = BRASS,
    name = "counterweight",
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      name,
      group: "hardware",
      flat: true,
    });
  }

  function disc(
    p: readonly [number, number, number],
    radius: number,
    depth: number,
    color: string,
    name: string,
    direction: readonly [number, number, number] = [0, 0, 1],
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 16, 1, false),
      color,
      {
        at: p,
        dir: direction,
        name,
        group: "painted-metal",
        flat: true,
      },
    );
  }

  function plate(
    outline: [number, number][],
    p: readonly [number, number, number],
    angle: number,
    color: string,
    name: string,
    thickness = 0.014,
  ) {
    const x: [number, number, number] = [Math.cos(angle), 0, Math.sin(angle)];
    return b.extrude(outline, {
      at: p,
      x,
      y: vertical,
      thickness,
      bevel: 0.004,
      color,
      smoothing: 0,
      name,
      group: "painted-metal",
    });
  }

  function loopRing(
    p: readonly [number, number, number],
    radius: number,
    color: string,
    name: string,
    rotation: [number, number, number] = [90, 0, 0],
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, 0.009, 6, 18),
      color,
      {
        at: p,
        rotation,
        name,
        group: "hardware",
        flat: true,
      },
    );
  }

  // The little suspension hook is intentionally part of the mobile silhouette.
  rod([0, 2.45, 0], [0, 2.67, 0], 0.009, WIRE, "top-hook-stem");
  loopRing([0, 2.48, 0], 0.075, BRASS, "top-hanging-loop");
  bead([0, 2.34, 0], 0.034, BRASS, "top-swivel");

  // First, broad balance arm: subtly off-centre like Calder's hand-balanced constructions.
  rod([-0.67, 2.22, 0], [0.69, 2.22, 0.035], 0.011, WIRE, "upper-balance-arm");
  bead([0, 2.22, 0], 0.027, BRASS, "upper-pivot");
  rod([0, 2.34, 0], [0, 2.22, 0], 0.007, WIRE, "upper-drop");

  // Left upper hanging thread and a large coral/red hooked silhouette.
  rod([-0.56, 2.22, 0], [-0.56, 1.84, 0], 0.006, WIRE, "left-upper-thread");
  loopRing([-0.56, 1.84, 0], 0.026, BRASS, "left-upper-eye");
  plate(
    [
      [-0.18, -0.16],
      [-0.03, -0.22],
      [0.15, -0.14],
      [0.22, -0.02],
      [0.15, 0.13],
      [0.02, 0.2],
      [-0.1, 0.13],
      [-0.03, 0.03],
      [0.08, -0.03],
      [-0.03, -0.1],
    ],
    [-0.56, 1.62, 0.03],
    -0.12,
    RED,
    "red-hooked-form",
    0.019,
  );
  disc([-0.56, 1.62, 0.046], 0.033, 0.008, BLACK, "red-form-rivet");

  // Right upper thread supports a blue diamond and a dangling yellow counterweight.
  rod([0.59, 2.22, 0.035], [0.59, 1.91, 0.035], 0.006, WIRE, "right-upper-thread");
  plate(
    [
      [0, -0.22],
      [0.18, 0],
      [0, 0.31],
      [-0.18, 0],
    ],
    [0.59, 1.68, 0.035],
    0.18,
    BLUE,
    "blue-diamond",
    0.017,
  );
  rod([0.59, 1.48, 0.035], [0.59, 1.12, 0.035], 0.006, WIRE, "blue-counter-thread");
  disc([0.59, 1.03, 0.035], 0.105, 0.018, YELLOW, "yellow-counter-disc");
  loopRing([0.59, 1.03, 0.05], 0.074, ORANGE, "yellow-disc-line");
  bead([0.59, 0.86, 0.035], 0.025, BRASS, "yellow-tail-bead");

  // A second balance bar hangs from the central upper bar on a long thread.
  rod([0.07, 2.22, 0.01], [0.07, 1.73, 0.01], 0.007, WIRE, "central-long-thread");
  bead([0.07, 1.70, 0.01], 0.024, BRASS, "central-second-pivot");
  rod([-0.49, 1.70, 0.01], [0.63, 1.70, 0.01], 0.010, WIRE, "middle-balance-arm");

  // Orange flat triangle at the left of the middle arm.
  rod([-0.40, 1.70, 0.01], [-0.40, 1.47, 0.01], 0.005, WIRE, "orange-thread");
  plate(
    [
      [-0.2, -0.15],
      [0.2, -0.15],
      [-0.02, 0.24],
    ],
    [-0.40, 1.27, 0.03],
    -0.28,
    ORANGE,
    "orange-triangle",
    0.016,
  );
  disc([-0.40, 1.27, 0.052], 0.026, 0.008, BLACK, "orange-triangle-rivet");

  // Broad black horizontal blade on the right of the middle arm.
  rod([0.50, 1.70, 0.01], [0.50, 1.43, 0.01], 0.005, WIRE, "black-blade-thread");
  plate(
    [
      [-0.31, -0.075],
      [0.27, -0.075],
      [0.34, 0.0],
      [0.18, 0.075],
      [-0.28, 0.075],
    ],
    [0.50, 1.28, 0.03],
    0.12,
    BLACK,
    "black-horizontal-blade",
    0.014,
  );
  disc([0.50, 1.28, 0.052], 0.028, 0.008, YELLOW, "black-blade-rivet");

  // A diagonal tertiary arm gives the mobile its recognizable Calder branching rhythm.
  rod([0.07, 1.70, 0.01], [0.07, 1.39, 0.01], 0.007, WIRE, "tertiary-drop");
  bead([0.07, 1.36, 0.01], 0.022, BRASS, "tertiary-pivot");
  rod([0.07, 1.36, 0.01], [-0.48, 1.13, -0.08], 0.009, WIRE, "tertiary-left-arm");
  rod([0.07, 1.36, 0.01], [0.56, 1.08, 0.08], 0.009, WIRE, "tertiary-right-arm");

  // Green fan-like leaf hanging left.
  rod([-0.43, 1.15, -0.06], [-0.43, 0.91, -0.06], 0.005, WIRE, "green-thread");
  plate(
    [
      [-0.06, -0.28],
      [-0.21, -0.12],
      [-0.19, 0.11],
      [-0.06, 0.3],
      [0.11, 0.2],
      [0.2, 0.03],
      [0.14, -0.12],
    ],
    [-0.43, 0.66, -0.035],
    -0.48,
    GREEN,
    "green-leaf",
    0.016,
  );
  rod([-0.43, 0.66, -0.02], [-0.43, 0.41, -0.02], 0.005, WIRE, "green-lower-thread");
  disc([-0.43, 0.34, -0.02], 0.075, 0.016, CREAM, "cream-small-disc");

  // Cyan asymmetric pennant at the right.
  rod([0.54, 1.10, 0.07], [0.54, 0.83, 0.07], 0.005, WIRE, "cyan-thread");
  plate(
    [
      [-0.08, -0.22],
      [0.17, -0.08],
      [0.23, 0.16],
      [0.02, 0.24],
      [-0.16, 0.07],
    ],
    [0.54, 0.58, 0.07],
    0.35,
    CYAN,
    "cyan-pennant",
    0.017,
  );
  disc([0.54, 0.58, 0.096], 0.025, 0.008, RED, "cyan-pennant-rivet");

  // Low final counterbalanced bar, nearly horizontal but visibly skewed in depth.
  rod([0.07, 1.36, 0.01], [0.07, 0.93, 0.01], 0.006, WIRE, "lower-main-drop");
  bead([0.07, 0.90, 0.01], 0.021, BRASS, "lower-main-pivot");
  rod([-0.50, 0.90, 0.01], [0.49, 0.90, 0.16], 0.009, WIRE, "lower-balance-arm");

  // Large warm disc at the low left.
  rod([-0.40, 0.88, 0.03], [-0.40, 0.62, 0.03], 0.005, WIRE, "low-left-thread");
  disc([-0.40, 0.42, 0.03], 0.16, 0.021, CORAL, "large-coral-disc");
  loopRing([-0.40, 0.42, 0.055], 0.115, YELLOW, "large-coral-ring");
  loopRing([-0.40, 0.42, 0.064], 0.046, BLACK, "large-coral-inner-ring");

  // Small cream bar and a red teardrop on the low right.
  rod([0.40, 0.91, 0.13], [0.40, 0.68, 0.13], 0.005, WIRE, "low-right-thread");
  plate(
    [
      [-0.22, -0.05],
      [0.16, -0.05],
      [0.23, 0.02],
      [0.11, 0.09],
      [-0.2, 0.09],
    ],
    [0.40, 0.55, 0.13],
    -0.22,
    CREAM,
    "cream-bar",
    0.014,
  );
  rod([0.40, 0.53, 0.13], [0.40, 0.31, 0.13], 0.005, WIRE, "red-drop-thread");
  plate(
    [
      [-0.06, -0.19],
      [0.08, -0.04],
      [0.12, 0.11],
      [0, 0.22],
      [-0.13, 0.07],
      [-0.13, -0.08],
    ],
    [0.40, 0.11, 0.13],
    0.22,
    RED,
    "red-lower-drop",
    0.016,
  );
  bead([0.40, -0.10, 0.13], 0.023, BRASS, "bottom-red-bead");

  // A few tiny brass spacers keep the hand-built balance points visually legible.
  bead([-0.56, 1.84, 0], 0.014, BRASS, "left-spacer");
  bead([0.59, 1.91, 0.035], 0.014, BRASS, "right-spacer");
  bead([-0.40, 0.88, 0.03], 0.014, BRASS, "left-low-spacer");
  bead([0.40, 0.91, 0.13], 0.014, BRASS, "right-low-spacer");

  return b.root;
}
