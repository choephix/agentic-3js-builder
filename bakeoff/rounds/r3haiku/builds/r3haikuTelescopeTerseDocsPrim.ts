import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "telescope",
  description: "A refracting telescope on a three-leg tripod, with brass trim and a finder scope.",
};

const CREAM = "#f1ead8";
const NAVY = "#1f3a5f";
const BRASS = "#d4a94a";
const WOOD = "#9a6236";
const STEEL = "#2b2e35";
const RUBBER = "#16171a";
const GLASS = "#6fa3d6";

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // Axes of the optical tube, in model space.
  const P = new THREE.Vector3(0, 1.16, 0); // tube pivot, between the trunnions
  const D = new THREE.Vector3(0, 0.5, 0.866).normalize(); // rear to front, pitched up
  const U = new THREE.Vector3(0, 0.866, -0.5).normalize(); // perpendicular to D, tube top
  const X = new THREE.Vector3(1, 0, 0); // left of the model

  // Point at `s` along the tube, `up` above it and `side` to the left.
  const T = (s: number, up = 0, side = 0) =>
    P.clone().addScaledVector(D, s).addScaledVector(U, up).addScaledVector(X, side);

  // Skeleton: the mount (tripod head) and the tube pivot.
  const mount = b.joint("mount", { at: [0, 1.0, 0] });
  const tube = b.joint("tube", { parent: mount, at: P.toArray(), aim: P.clone().add(D) });

  // Tripod: three legs, rubber feet, and a brass spreader ring.
  const feet = [90, 210, 330].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return new THREE.Vector3(0.44 * Math.cos(a), 0.02, 0.44 * Math.sin(a));
  });
  for (const foot of feet) {
    b.rod(foot, [0, 0.96, 0], 0.017, { color: WOOD, bone: mount });
    b.part(new THREE.SphereGeometry(0.032, 8, 6), RUBBER, { at: foot, bone: mount });
  }
  b.part(new THREE.TorusGeometry(0.216, 0.008, 6, 24), BRASS, {
    at: [0, 0.5, 0],
    dir: [0, 1, 0],
    axis: "z",
    bone: mount,
  });

  // Head and yoke.
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.12, 10), STEEL, { at: [0, 1.02, 0], bone: mount });
  b.rod([0, 1.05, 0], P.toArray(), 0.028, { color: STEEL, bone: mount });
  for (const s of [1, -1]) {
    const trunnion = T(0, 0, s * 0.14);
    b.rod(P, trunnion, 0.02, { color: STEEL, bone: mount });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), BRASS, {
      at: trunnion,
      dir: X,
      bone: mount,
    });
  }

  // Optical tube: a slightly tapered cream body, flared toward the front.
  const rearS = -0.25;
  const frontS = 0.6;
  const radiusAt = (s: number) => 0.075 + (0.01 * (s - rearS)) / (frontS - rearS);
  b.part(new THREE.CylinderGeometry(radiusAt(frontS), radiusAt(rearS), frontS - rearS, 16), CREAM, {
    at: T((frontS + rearS) / 2),
    dir: D,
    bone: tube,
  });

  // Navy dew collar over the front end, with a brass lip.
  b.part(new THREE.CylinderGeometry(radiusAt(frontS) + 0.01, radiusAt(frontS) + 0.01, 0.12, 16), NAVY, {
    at: T(frontS - 0.06),
    dir: D,
    bone: tube,
  });
  b.part(new THREE.TorusGeometry(radiusAt(frontS) + 0.012, 0.007, 6, 20), BRASS, {
    at: T(frontS),
    dir: D,
    axis: "z",
    bone: tube,
  });

  // Objective lens, set just inside the front lip.
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 20), GLASS, {
    at: T(frontS + 0.001),
    dir: D,
    bone: tube,
  });

  // Brass bands along the body.
  for (const s of [-0.12, 0.2]) {
    b.part(new THREE.CylinderGeometry(radiusAt(s) + 0.005, radiusAt(s) + 0.005, 0.02, 16), BRASS, {
      at: T(s),
      dir: D,
      bone: tube,
    });
  }

  // Rear: focuser draw-tube with knob, then the eyepiece.
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.08, 10), STEEL, {
    at: T(-0.17, 0.1),
    dir: U,
    bone: tube,
  });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 12), BRASS, {
    at: T(-0.17, 0.15),
    dir: X,
    bone: tube,
  });

  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), STEEL, {
    at: T(-0.31),
    dir: D,
    bone: tube,
  });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.015, 12), BRASS, {
    at: T(-0.37),
    dir: D,
    bone: tube,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 12), GLASS, {
    at: T(-0.376),
    dir: D,
    bone: tube,
  });

  // Finder scope on a bracket above the main tube.
  const finderS = 0.05;
  const finderU = 0.16;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 12), STEEL, {
    at: T(finderS, finderU),
    dir: D,
    bone: tube,
  });
  for (const s of [-0.08, 0.22]) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 12), BRASS, {
      at: T(finderS + s, finderU),
      dir: D,
      bone: tube,
    });
  }
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 12), GLASS, {
    at: T(finderS + 0.182, finderU),
    dir: D,
    bone: tube,
  });
  for (const side of [-0.02, 0.02]) {
    b.rod(T(finderS, 0.07, side), T(finderS, finderU - 0.03, side), 0.012, { color: STEEL, bone: tube });
  }

  return b.root;
}
