import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile with black wire arms, counterbalanced rods, and bold red, yellow, blue, and white abstract plates.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#161619";
  const RED = "#d94332";
  const VERMILION = "#ef5536";
  const BLUE = "#2567a8";
  const YELLOW = "#e4b52d";
  const CREAM = "#e9dfc8";
  const WHITE = "#f3eee1";
  const OCHRE = "#b98725";

  const root = b.joint("suspension", {
    at: [0, 2.48, 0],
    dir: [0, -1, 0],
    role: "fan",
    group: "mobile",
  });

  const tube = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[], r = 0.012, color = BLACK) =>
    b.rod(a, c, r, { color, bone: root, caps: "round", group: "wire" });

  const ball = (at: THREE.Vector3 | number[], radius: number, color: string, name: string) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      bone: root,
      name,
      group: "counterweights",
      flat: true,
    });

  const plate = (
    name: string,
    at: THREE.Vector3 | number[],
    outline: [number, number, "sharp"][] | [number, number][],
    color: string,
    scale = 1,
  ) =>
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.018, 0.028],
      bevel: 0.008,
      smoothing: 1,
      color,
      bone: root,
      group: "painted-plates",
      name,
    }).mesh.scale.set(scale, scale, scale);

  const hanging = (
    name: string,
    top: THREE.Vector3 | number[],
    bottom: THREE.Vector3 | number[],
    radius = 0.006,
  ) => {
    tube(top, bottom, radius, BLACK);
    return b.joint(name, {
      parent: root,
      at: bottom,
      dir: [0, -1, 0],
      role: "hinge",
      group: "hangers",
    });
  };

  // Suspension cord and a small, deliberately visible Calder-like black hub.
  tube([0, 2.66, 0], [0, 2.48, 0], 0.009);
  ball([0, 2.475, 0], 0.038, BLACK, "central-knot");

  // The upper balancing boom: a long, slightly tilted black wire with unlike ends.
  const upperLeft = new THREE.Vector3(-0.76, 2.21, 0.04);
  const upperRight = new THREE.Vector3(0.67, 2.31, -0.025);
  tube(upperLeft, upperRight, 0.012);
  tube([0, 2.48, 0], [0.02, 2.26, 0], 0.009);
  ball(upperLeft, 0.047, RED, "upper-red-counterweight");
  ball(upperRight, 0.032, BLACK, "upper-right-knot");

  // Left descending arm: a pale vertical organic plate and a red teardrop.
  const leftHanger = hanging("leftHinge", [-0.72, 2.22, 0.04], [-0.72, 1.62, 0.04], 0.005);
  const leftPlateOutline: [number, number, "sharp"][] = [
    [-0.18, -0.18, "sharp"],
    [-0.02, -0.27, "sharp"],
    [0.16, -0.19, "sharp"],
    [0.22, 0.02, "sharp"],
    [0.12, 0.26, "sharp"],
    [-0.08, 0.34, "sharp"],
    [-0.2, 0.17, "sharp"],
  ];
  b.extrude(leftPlateOutline, {
    at: [-0.72, 1.44, 0.04],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.025,
    bevel: 0.01,
    color: CREAM,
    bone: leftHanger,
    group: "painted-plates",
    name: "cream-left-leaf",
  });
  ball([-0.43, 1.56, 0.04], 0.07, RED, "left-red-drop");

  // A secondary black boom grows from the left hanger and reaches dramatically forward.
  const leftBoom = b.joint("leftBoom", {
    parent: leftHanger,
    at: [-0.72, 1.62, 0.04],
    dir: [0.9, -0.08, 0.18],
    role: "fan",
    group: "booms",
  });
  b.sweep(
    b.chain(
      "leftBoomArm",
      [
        [-0.72, 1.62, 0.04],
        [-0.18, 1.55, 0.16],
        [0.42, 1.48, 0.19],
      ],
      { parent: leftHanger, names: ["leftBoomRoot", "leftBoomTip"], role: "arm", group: "booms" },
    ),
    0.011,
    { color: BLACK, caps: "round", section: { ngon: 6 }, group: "booms" },
  );
  const yellowDrop = hanging("yellowDropHinge", [0.38, 1.49, 0.19], [0.38, 1.02, 0.19], 0.005);
  const yellowShape: [number, number, "sharp"][] = [
    [-0.17, 0.16, "sharp"],
    [0.02, 0.27, "sharp"],
    [0.2, 0.12, "sharp"],
    [0.12, -0.18, "sharp"],
    [-0.1, -0.24, "sharp"],
  ];
  b.extrude(yellowShape, {
    at: [0.38, 0.84, 0.19],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.018, 0.035],
    bevel: 0.008,
    color: YELLOW,
    bone: yellowDrop,
    group: "painted-plates",
    name: "golden-angular-leaf",
  });

  // Right upper boom, offset in depth so the silhouette reads clearly from three-quarter views.
  const rightRoot = new THREE.Vector3(0.02, 2.27, -0.03);
  const rightTip = new THREE.Vector3(1.03, 2.03, -0.11);
  tube(rightRoot, rightTip, 0.011);
  ball(rightTip, 0.058, BLUE, "blue-upper-weight");

  // Blue fan hanging from the far right.
  const blueHanger = hanging("blueFanHinge", [0.9, 2.06, -0.1], [0.9, 1.51, -0.1], 0.005);
  const blueFan: [number, number, "sharp"][] = [
    [-0.25, -0.17, "sharp"],
    [-0.08, -0.23, "sharp"],
    [0.11, -0.16, "sharp"],
    [0.22, 0.04, "sharp"],
    [0.13, 0.28, "sharp"],
    [-0.05, 0.37, "sharp"],
    [-0.18, 0.2, "sharp"],
  ];
  b.extrude(blueFan, {
    at: [0.9, 1.32, -0.1],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.025,
    bevel: 0.009,
    color: BLUE,
    bone: blueHanger,
    group: "painted-plates",
    name: "blue-scalloped-fan",
  });

  // A tiny red counterweight on the far side of the blue fan.
  tube([0.9, 1.52, -0.1], [1.18, 1.43, -0.12], 0.006);
  ball([1.23, 1.42, -0.12], 0.035, VERMILION, "far-red-bead");

  // Central lower arm, bending backward, with a cream crescent.
  const centerHanger = hanging("centerHinge", [0.01, 2.28, 0], [-0.02, 1.81, 0.02], 0.005);
  const lowerBoom = b.chain(
    "lowerBoom",
    [
      [-0.02, 1.81, 0.02],
      [0.25, 1.7, 0.02],
      [0.62, 1.73, 0.02],
      [0.9, 1.86, 0.01],
    ],
    { parent: centerHanger, names: ["lowerRoot", "lowerMiddle", "lowerTip"], role: "arm", group: "booms" },
  );
  b.sweep(lowerBoom, (t) => 0.012 - t * 0.003, {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
    group: "booms",
  });
  const crescentHanger = hanging("crescentHinge", [0.9, 1.86, 0.01], [0.9, 1.25, 0.01], 0.005);
  const crescent: [number, number, "sharp"][] = [
    [-0.26, 0.05, "sharp"],
    [-0.14, 0.22, "sharp"],
    [0.08, 0.3, "sharp"],
    [0.25, 0.18, "sharp"],
    [0.15, 0.08, "sharp"],
    [0.0, 0.12, "sharp"],
    [-0.1, 0.02, "sharp"],
    [-0.06, -0.16, "sharp"],
    [-0.2, -0.24, "sharp"],
  ];
  b.extrude(crescent, {
    at: [0.9, 1.04, 0.01],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.018, 0.032],
    bevel: 0.008,
    color: WHITE,
    bone: crescentHanger,
    group: "painted-plates",
    name: "white-crescent",
  });

  // Lowest, broad black arm gives the whole mobile a strong Calder silhouette.
  const lowArm = b.chain(
    "lowArm",
    [
      [0, 1.95, 0.01],
      [-0.32, 1.57, 0.03],
      [-0.63, 1.25, 0.05],
      [-0.98, 1.18, 0.06],
    ],
    { parent: root, names: ["lowRoot", "lowElbow", "lowTip"], role: "arm", group: "booms" },
  );
  b.sweep(lowArm, [0.013, 0.007], {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
    group: "booms",
  });
  const lowHanger = hanging("lowHinge", [-0.98, 1.18, 0.06], [-0.98, 0.67, 0.06], 0.005);
  const lowPlate: [number, number, "sharp"][] = [
    [-0.2, -0.18, "sharp"],
    [-0.02, -0.3, "sharp"],
    [0.2, -0.18, "sharp"],
    [0.18, 0.04, "sharp"],
    [0.06, 0.28, "sharp"],
    [-0.16, 0.2, "sharp"],
    [-0.28, 0.02, "sharp"],
  ];
  b.extrude(lowPlate, {
    at: [-0.98, 0.47, 0.06],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.028,
    bevel: 0.01,
    color: RED,
    bone: lowHanger,
    group: "painted-plates",
    name: "low-red-petal",
  });

  // A small ochre disc balances the heavy low red leaf without making the composition symmetrical.
  tube([-0.98, 1.18, 0.06], [-1.27, 1.3, 0.08], 0.005);
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.026, 12), OCHRE, {
    at: [-1.31, 1.32, 0.08],
    dir: [0, 0, 1],
    bone: root,
    group: "painted-plates",
    name: "ochre-disc",
    flat: true,
  });

  // Small black beads at several pivots emphasize the handmade wire-and-balance construction.
  ball([-0.72, 2.22, 0.04], 0.018, BLACK, "left-pivot");
  ball([0.02, 2.27, -0.03], 0.018, BLACK, "right-pivot");
  ball([0.9, 1.51, -0.1], 0.016, BLACK, "blue-pivot");
  ball([-0.02, 1.81, 0.02], 0.018, BLACK, "lower-pivot");

  return b.root;
}
