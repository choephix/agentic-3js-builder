```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description: "An abstract Alexander Calder-inspired hanging mobile of black wire arms and bold red, yellow, blue, and white sculptural forms.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#171717";
  const RED = "#e53935";
  const SCARLET = "#b9162b";
  const YELLOW = "#f5c542";
  const GOLD = "#e49b19";
  const BLUE = "#2266b1";
  const DEEP_BLUE = "#173c78";
  const WHITE = "#f2eee2";
  const ORANGE = "#e86d2c";

  const rod = (a: THREE.Vector3 | [number, number, number], c: THREE.Vector3 | [number, number, number], r = 0.012, color = BLACK) => {
    b.rod(a, c, r, { color, caps: "round", sides: 6 });
  };

  const bead = (p: THREE.Vector3 | [number, number, number], radius = 0.025, color = BLACK) => {
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, { at: p });
  };

  const hangingLine = (
    top: THREE.Vector3 | [number, number, number],
    bottom: THREE.Vector3 | [number, number, number],
    color = BLACK,
    radius = 0.006,
  ) => {
    rod(top, bottom, radius, color);
    bead(bottom, radius * 2.4, color);
  };

  const disc = (
    p: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    dir: [number, number, number] = [0, 0, 1],
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius, 0.018, 10), color, {
      at: p,
      dir,
      axis: "z",
      flat: true,
    });
  };

  const smallDisc = (
    p: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    dir: [number, number, number] = [0, 0, 1],
  ) => {
    return b.part(new THREE.CylinderGeometry(radius, radius * 0.94, 0.014, 8), color, {
      at: p,
      dir,
      axis: "z",
      flat: true,
    });
  };

  const cutout = (
    at: [number, number, number],
    outline: [number, number, "sharp"][] | [number, number][],
    x: [number, number, number],
    color: string,
    thickness = 0.018,
  ) => {
    return b.extrude(outline, {
      at,
      x,
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      smoothing: 1,
      color,
    });
  };

  // A tiny black suspension loop and the main vertical hanging stem.
  b.part(new THREE.TorusGeometry(0.055, 0.009, 6, 12), BLACK, {
    at: [0, 3.28, 0],
    rotation: [90, 0, 0],
  });
  rod([0, 3.25, 0], [0, 2.85, 0], 0.014, BLACK);
  bead([0, 2.84, 0], 0.035, BLACK);

  // -------------------- upper arm --------------------
  const upperA = new THREE.Vector3(0, 2.82, 0);
  const upperB = new THREE.Vector3(0.72, 2.77, 0.02);
  const upperC = new THREE.Vector3(1.35, 2.86, -0.02);
  rod(upperA, upperB, 0.014);
  rod(upperB, upperC, 0.011);
  bead(upperB, 0.026);

  hangingLine([0.72, 2.77, 0.02], [0.72, 2.06, 0.02], BLACK, 0.006);
  hangingLine([1.35, 2.86, -0.02], [1.35, 2.34, -0.02], BLACK, 0.006);

  // Upper red crescent and small yellow counterweight.
  cutout(
    [0.72, 1.98, 0.02],
    [
      [-0.03, -0.22, "sharp"],
      [0.10, -0.18],
      [0.20, -0.05],
      [0.18, 0.11],
      [0.07, 0.23],
      [-0.11, 0.18],
      [-0.20, 0.04],
      [-0.13, -0.10],
    ],
    [0, 0, 1],
    RED,
    0.025,
  );
  smallDisc([1.35, 2.28, -0.02], 0.105, YELLOW);

  // -------------------- middle arm --------------------
  const midRoot = new THREE.Vector3(0.72, 2.06, 0.02);
  const midA = new THREE.Vector3(0.18, 1.93, 0.07);
  const midB = new THREE.Vector3(-0.58, 2.04, 0.04);
  const midC = new THREE.Vector3(-1.12, 1.87, 0.02);
  rod(midRoot, midA, 0.013);
  rod(midA, midB, 0.011);
  rod(midB, midC, 0.009);
  bead(midA, 0.024);
  bead(midB, 0.021);

  hangingLine([-0.58, 2.04, 0.04], [-0.58, 1.37, 0.04], BLACK, 0.006);
  hangingLine([-1.12, 1.87, 0.02], [-1.12, 1.16, 0.02], BLACK, 0.006);

  // Large blue swept triangle.
  cutout(
    [-0.58, 1.29, 0.04],
    [
      [-0.31, -0.14, "sharp"],
      [0.25, -0.08],
      [0.08, 0.18, "sharp"],
      [-0.20, 0.10],
    ],
    [0, 0, 1],
    BLUE,
    0.028,
  );

  // Orange leaf at the middle arm's far end.
  cutout(
    [-1.12, 1.08, 0.02],
    [
      [0, -0.24, "sharp"],
      [0.15, -0.06],
      [0.20, 0.12],
      [0.05, 0.23, "sharp"],
      [-0.13, 0.12],
      [-0.18, -0.06],
    ],
    [0, 0, 1],
    ORANGE,
    0.022,
  );

  // -------------------- lower arm --------------------
  const lowRoot = new THREE.Vector3(-0.58, 1.37, 0.04);
  const lowA = new THREE.Vector3(-0.12, 1.20, 0.06);
  const lowB = new THREE.Vector3(0.52, 1.27, 0.02);
  const lowC = new THREE.Vector3(1.10, 1.08, -0.01);
  rod(lowRoot, lowA, 0.012);
  rod(lowA, lowB, 0.010);
  rod(lowB, lowC, 0.008);
  bead(lowA, 0.023);
  bead(lowB, 0.019);

  hangingLine([0.52, 1.27, 0.02], [0.52, 0.66, 0.02], BLACK, 0.006);
  hangingLine([1.10, 1.08, -0.01], [1.10, 0.75, -0.01], BLACK, 0.006);

  // White round plate.
  disc([0.52, 0.57, 0.02], 0.19, WHITE);
  // Blue counterweight disc, turned edge-on slightly for a graphic silhouette.
  smallDisc([1.10, 0.68, -0.01], 0.13, DEEP_BLUE, [0.18, 0.05, 0.98]);

  // -------------------- lowest eccentric arm --------------------
  const bottomRoot = new THREE.Vector3(0.52, 0.66, 0.02);
  const bottomA = new THREE.Vector3(0.12, 0.49, 0.05);
  const bottomB = new THREE.Vector3(-0.45, 0.56, 0.03);
  rod(bottomRoot, bottomA, 0.010);
  rod(bottomA, bottomB, 0.008);
  bead(bottomA, 0.020);

  hangingLine([-0.45, 0.56, 0.03], [-0.45, 0.18, 0.03], BLACK, 0.0055);

  // The signature low red organic blade.
  cutout(
    [-0.45, 0.07, 0.03],
    [
      [-0.05, -0.28, "sharp"],
      [0.16, -0.17],
      [0.23, 0.03],
      [0.12, 0.23],
      [-0.08, 0.29, "sharp"],
      [-0.19, 0.10],
      [-0.17, -0.10],
    ],
    [0, 0, 1],
    SCARLET,
    0.026,
  );

  // Tiny bright yellow punctuation near the bottom blade.
  hangingLine([0.12, 0.49, 0.05], [0.12, 0.22, 0.05], BLACK, 0.0045);
  smallDisc([0.12, 0.15, 0.05], 0.075, GOLD, [0.05, 0.15, 0.98]);

  // A few deliberately small rivet-like painted dots on the forms.
  disc([0.72, 2.02, 0.038], 0.018, YELLOW, [0, 0, 1]);
  disc([-0.58, 1.33, 0.058], 0.016, WHITE, [0, 0, 1]);
  disc([-0.45, 0.11, 0.052], 0.014, YELLOW, [0, 0, 1]);

  return b.root;
}
```