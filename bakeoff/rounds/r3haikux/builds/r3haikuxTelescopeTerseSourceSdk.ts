import * as THREE from "three";
import { createBuilder, gradient, grain, svg } from "../../../../src/index";

export const meta = {
  name: "Telescope",
  description:
    "A refracting telescope on a wooden tripod: navy tube with a brass collar, black dew shield, cream finder, fork mount and a star emblem.",
};

// Palette
const NAVY_DEEP = "#1b3358";
const NAVY_LIGHT = "#2f5a8f";
const BLACK = "#14161b";
const CHARCOAL = "#3a3f48";
const BRASS = "#c9a24a";
const CREAM = "#ece4cf";
const GLASS = "#8cc3e6";
const WOOD = grain("#c48d55", "#8a5429", { size: 0.03, axis: "y", seed: 3 });

const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#f4ead2"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#1f3a5f" stroke-width="3"/>
  <path d="M50 16L58.2 38.7L82.3 39.5L63.3 54.3L70 77.5L50 64L30 77.5L36.7 54.3L17.7 39.5L41.8 38.7Z" fill="#c9a24a"/>
</svg>`;

// Geometry in metres: +Y up, the telescope faces +Z, its left is +X.
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const AXLE = V(0, 1.27, 0); // the tube's altitude axle, through the fork
const TILT = (38 * Math.PI) / 180;
const D = V(0, Math.sin(TILT), Math.cos(TILT)); // tube axis, rear to front
const U = V(0, Math.cos(TILT), -Math.sin(TILT)); // across the tube, upward
const X = V(1, 0, 0); // the model's left

/** A point on the tube: h metres from the rear end (0 = rear, 0.58 = objective face), up across, side along X. */
const onTube = (h: number, up = 0, side = 0) =>
  AXLE.clone().addScaledVector(D, h - 0.34).addScaledVector(U, up).addScaledVector(X, side);

export default function telescope() {
  const b = createBuilder({ name: "telescope" });
  const cyl = (r: number, h: number, sides = 12, openEnded = false) =>
    new THREE.CylinderGeometry(r, r, h, b.segments(sides), 1, openEnded);

  // Bones: the tripod stands still (base), the fork turns in azimuth (pan), the tube tilts on its axle (tube).
  b.joint("base", { at: V(0, 0, 0) });
  b.joint("pan", { parent: "base", at: V(0, 0.98, 0) });
  b.joint("tube", { parent: "pan", at: AXLE, dir: D, role: "hinge" });

  // Tripod: three wooden legs with rubber feet, a hub, a tray and a carrying case.
  const hub = V(0, 0.94, 0);
  const feet = [V(0, 0.034, -0.48), V(0.415, 0.034, 0.24), V(-0.415, 0.034, 0.24)];
  for (const foot of feet) {
    b.rod(hub, foot, [0.026, 0.016], { color: WOOD, bone: "base", group: "tripod" });
    b.part(new THREE.SphereGeometry(0.034, b.segments(10), b.segments(7)), BLACK, {
      at: foot,
      bone: "base",
      group: "tripod",
    });
  }
  b.part(cyl(0.055, 0.1, 10), CHARCOAL, { at: hub, bone: "base", group: "tripod" });
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.235, 0.012],
      [0.235, 0.026],
      [0, 0.026],
    ],
    { color: CREAM, at: V(0, 0.5, 0), bone: "base", group: "tripod" },
  );
  b.part(new THREE.BoxGeometry(0.17, 0.07, 0.12), NAVY_DEEP, {
    at: V(0, 0.561, 0),
    bone: "base",
    group: "case",
  });
  for (const x of [-0.06, 0.06])
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.012), BRASS, {
      at: V(x, 0.561, 0.066),
      bone: "base",
      group: "case",
    });

  // Fork mount: a turntable, two tapered arms and an altitude axle with knobs.
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.125, 0.012],
      [0.125, 0.028],
      [0.1, 0.04],
      [0, 0.04],
    ],
    { color: CHARCOAL, at: V(0, 0.98, 0), bone: "pan", group: "mount" },
  );
  const fork = [
    [-0.1, 0, "sharp"],
    [0.1, 0, "sharp"],
    [0.085, 0.16],
    [0.075, 0.29],
    [0.053, 0.343],
    [0, 0.365],
    [-0.053, 0.343],
    [-0.075, 0.29],
    [-0.085, 0.16],
  ];
  for (const x of [0.1, -0.1])
    b.extrude(fork, {
      color: CHARCOAL,
      at: V(x, 0.98, 0),
      x: V(0, 0, 1),
      y: V(0, 1, 0),
      thickness: 0.035,
      bevel: 0.008,
      bone: "pan",
      group: "mount",
    });
  b.part(cyl(0.014, 0.28, 10), BLACK, { at: AXLE, dir: X, bone: "pan", group: "mount" });
  for (const s of [1, -1]) {
    b.part(cyl(0.03, 0.03, 12), BLACK, {
      at: AXLE.clone().addScaledVector(X, 0.14 * s),
      dir: X,
      bone: "pan",
      group: "mount",
    });
    b.part(cyl(0.016, 0.01, 10), BRASS, {
      at: AXLE.clone().addScaledVector(X, 0.157 * s),
      dir: X,
      bone: "pan",
      group: "mount",
    });
  }
  b.rod(V(0.1, 0.99, 0), V(0.2, 0.99, 0), 0.011, { color: BRASS, bone: "pan", group: "mount" });
  b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(7)), BLACK, {
    at: V(0.205, 0.99, 0),
    bone: "pan",
    group: "mount",
  });

  // Optical tube: a turned navy body, a black dew shield, a brass collar and a glass objective.
  const tube = b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.05, 0.02],
      [0.05, 0.58],
      [0, 0.58],
    ],
    {
      color: gradient(NAVY_DEEP, NAVY_LIGHT, onTube(0), onTube(0.58)),
      at: onTube(0),
      axis: D,
      segments: 14,
      bone: "tube",
      group: "tube",
    },
  );
  b.part(cyl(0.064, 0.1, 14, true), BLACK, { at: onTube(0.55), dir: D, bone: "tube", group: "tube" });
  b.part(cyl(0.054, 0.014, 14), BRASS, { at: onTube(0.44), dir: D, bone: "tube", group: "tube" });
  b.part(cyl(0.05, 0.006, 14), GLASS, { at: onTube(0.59), dir: D, bone: "tube", group: "tube" });

  // Side focuser with a brass knob.
  b.part(cyl(0.02, 0.07, 10), BLACK, { at: onTube(0.1, 0, 0.065), dir: X, bone: "tube", group: "tube" });
  b.part(cyl(0.03, 0.02, 12), BRASS, { at: onTube(0.1, 0, 0.11), dir: X, bone: "tube", group: "tube" });

  // Rear eyepiece: a brass barrel with a black grip.
  b.part(cyl(0.03, 0.14, 12), BRASS, { at: onTube(-0.05), dir: D, bone: "tube", group: "tube" });
  b.part(cyl(0.034, 0.015, 12), BLACK, { at: onTube(-0.1275), dir: D, bone: "tube", group: "tube" });

  // Cream finder scope on brackets, with a brass front ring.
  b.part(cyl(0.024, 0.32, 10), CREAM, { at: onTube(0.26, 0.085), dir: D, bone: "tube", group: "tube" });
  b.part(cyl(0.027, 0.012, 10), BRASS, { at: onTube(0.414, 0.085), dir: D, bone: "tube", group: "tube" });
  b.part(cyl(0.02, 0.03, 10), BLACK, { at: onTube(0.085, 0.085), dir: D, bone: "tube", group: "tube" });
  for (const h of [0.14, 0.36])
    b.rod(onTube(h, 0.03), onTube(h, 0.085), 0.011, { color: BLACK, bone: "tube", group: "tube" });

  // Star emblem decal on the tube's side, clear of the fork arms and the focuser.
  const emblem = svg(STAR_SVG, { size: 256 });
  const scope = b.surface(tube);
  const spot = scope.nearest(onTube(0.18, 0, 0.3));
  b.decal(scope, emblem, { at: spot, size: [0.075, 0.075], name: "emblem" });

  return b.root;
}
