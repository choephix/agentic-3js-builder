import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "telescope",
  description: "A refractor telescope on a three-legged wooden tripod, with a navy dew shield, brass rings, a finder scope and an eyepiece.",
};

const TILT = (35 * Math.PI) / 180;
// Optical axis of the tube, tilted up toward the front (+Z).
const DIR = [0, Math.sin(TILT), Math.cos(TILT)];
// Perpendicular to the tube, pointing "up" from the tube's point of view.
const UP = [0, Math.cos(TILT), -Math.sin(TILT)];
// Trunnion: the point the tube pivots on.
const C = [0, 1.35, 0];

// Point along the tube: d measured along the optical axis from the pivot,
// off measured along the tube's "up" side.
const onTube = (d: number, off = 0): number[] => [
  C[0] + DIR[0] * d + UP[0] * off,
  C[1] + DIR[1] * d + UP[1] * off,
  C[2] + DIR[2] * d + UP[2] * off,
];

const COLORS = {
  tube: "#f3efe4",
  shield: "#1f3556",
  brass: "#c79a3b",
  mount: "#2b2f36",
  wood: "#9b6a3c",
  woodDark: "#7a5230",
  lens: "#3d7fc0",
  rubber: "#1a1d22",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  b.joint("base", { at: [0, 0, 0] });

  // Tripod legs: three splayed wooden legs from the head down to the floor.
  const legTop = [0, 0.9, 0];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3 + 0.5;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const start = [0.09 * s, 0.9, 0.09 * c];
    const foot = [0.65 * s, 0.01, 0.65 * c];
    const vec = [foot[0] - start[0], foot[1] - start[1], foot[2] - start[2]];
    const len = Math.hypot(vec[0], vec[1], vec[2]);
    const d = [vec[0] / len, vec[1] / len, vec[2] / len];
    const mid = [
      (start[0] + foot[0]) / 2,
      (start[1] + foot[1]) / 2,
      (start[2] + foot[2]) / 2,
    ];

    b.part(new THREE.CylinderGeometry(0.024, 0.016, len, 8), COLORS.wood, {
      at: mid,
      dir: d,
    });
    // Brass knob where the leg meets the head.
    b.part(new THREE.SphereGeometry(0.035, 12, 8), COLORS.brass, { at: start });
    // Rubber foot.
    b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.025, 10), COLORS.rubber, {
      at: [foot[0], 0.0125, foot[2]],
      dir: [0, 1, 0],
    });
  }

  // Tripod head: hub plate, column, pan head and a wooden accessory shelf.
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 14), COLORS.mount, {
    at: legTop,
    dir: [0, 1, 0],
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 12), COLORS.mount, {
    at: [0, 0.98, 0],
    dir: [0, 1, 0],
  });
  b.part(new THREE.BoxGeometry(0.22, 0.06, 0.16), COLORS.mount, {
    at: [0, 1.06, 0],
  });
  b.part(new THREE.CylinderGeometry(0.37, 0.37, 0.02, 16), COLORS.woodDark, {
    at: [0, 0.42, 0],
    dir: [0, 1, 0],
  });

  // Fork arms holding the tube by its trunnion axle.
  for (const x of [-0.12, 0.12]) {
    b.part(new THREE.BoxGeometry(0.035, 0.28, 0.08), COLORS.mount, {
      at: [x, 1.21, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.3, 12), COLORS.brass, {
    at: C,
    dir: [1, 0, 0],
  });

  // Main optical tube.
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 1.0, 20), COLORS.tube, {
    at: C,
    dir: DIR,
  });
  // Brass bands around the tube.
  for (const d of [-0.22, 0.2]) {
    b.part(new THREE.CylinderGeometry(0.079, 0.079, 0.03, 20), COLORS.brass, {
      at: onTube(d),
      dir: DIR,
    });
  }
  // Rear end cap.
  b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 20), COLORS.mount, {
    at: onTube(-0.49),
    dir: DIR,
  });

  // Dew shield at the front: navy sleeve with a brass lip.
  b.part(new THREE.CylinderGeometry(0.092, 0.088, 0.14, 20), COLORS.shield, {
    at: onTube(0.55),
    dir: DIR,
  });
  b.part(new THREE.CylinderGeometry(0.094, 0.094, 0.012, 20), COLORS.brass, {
    at: onTube(0.62),
    dir: DIR,
  });
  // Objective lens, glowing blue glass.
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 20), COLORS.lens, {
    at: onTube(0.5),
    dir: DIR,
  });

  // Focuser on the upper side of the tube, with a brass knob.
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12), COLORS.mount, {
    at: onTube(-0.4, 0.13),
    dir: UP,
  });
  b.part(new THREE.SphereGeometry(0.035, 12, 8), COLORS.brass, {
    at: onTube(-0.4, 0.2),
  });

  // Eyepiece at the rear, with a brass collar.
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 14), COLORS.mount, {
    at: onTube(-0.575),
    dir: DIR,
  });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 14), COLORS.brass, {
    at: onTube(-0.655),
    dir: DIR,
  });

  // Finder scope riding alongside the tube on two brackets.
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.32, 14), COLORS.shield, {
    at: onTube(-0.05, 0.14),
    dir: DIR,
  });
  for (const d of [-0.15, 0.05]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), COLORS.brass, {
      at: onTube(d, 0.1),
      dir: UP,
    });
  }
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 14), COLORS.lens, {
    at: onTube(0.115, 0.14),
    dir: DIR,
  });

  return b.root;
}
