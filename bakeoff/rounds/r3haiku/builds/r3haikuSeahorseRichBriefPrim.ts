import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "seahorse",
  description:
    "A sunny yellow seahorse with ridged body, dark pin-stripes, white freckles, a crown of spikes and a fluttering dorsal fin, curling its tail around a strand of seagrass.",
};

const YELLOW = "#ffd23f";
const YELLOW_DEEP = "#f0a21a";
const INK = "#3a2a14";
const WHITE = "#fffdf2";
const GRASS = "#3f9b4a";
const GRASS_LIGHT = "#6fbf5a";
const FIN = "#ffeaa3";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Skeleton: root at the hips, body spine rising to the head.
  b.joint("hips", { at: [0, 0.085, 0] });

  const spinePts: number[][] = [
    [0, 0.09, 0],
    [0, 0.12, 0.004],
    [0, 0.15, 0.012],
    [0, 0.18, 0.014],
    [0, 0.21, 0.012],
    [0, 0.24, 0.012],
    [0, 0.265, 0.018],
    [0, 0.28, 0.025],
  ];
  const spine = b.chain("spine", spinePts);

  // Curled prehensile tail: wraps once and a bit more around the seagrass at x = 0.06.
  const R = 0.0145;
  const tailPts: number[][] = [
    [0, 0.085, -0.004],
    [0.02, 0.083, -0.004],
  ];
  const N = 10;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const th = Math.PI + t * 2.3 * Math.PI;
    tailPts.push([0.06 + R * Math.cos(th), 0.078 - 0.03 * t, R * Math.sin(th)]);
  }
  b.chain("tail", tailPts);

  // Body: a smooth tube along the spine.
  const trunk = b.sweep(spine, 0.028, { color: YELLOW });

  // Ridges: thin dark rings stacked along the body.
  b.along(spine, 8, (at) => {
    b.part(new THREE.TorusGeometry(0.031, 0.0022, 6, 18), INK, { frame: at });
  });

  // Freckles: small white dots stuck onto the body surface.
  const skin = b.surface(trunk);
  const freckleSpots: number[][] = [
    [0.022, 0.14, 0.02],
    [-0.02, 0.165, 0.021],
    [0.024, 0.19, 0.016],
    [-0.018, 0.2, 0.014],
    [0.02, 0.23, 0.012],
    [-0.012, 0.13, 0.026],
    [0.006, 0.215, 0.024],
  ];
  for (const p of freckleSpots) {
    const hit = skin.nearest(p);
    b.stick(new THREE.SphereGeometry(0.0034, 6, 4), WHITE, hit);
  }

  // Head: a round yellow dome.
  b.part(new THREE.SphereGeometry(0.03, 14, 10), YELLOW, {
    at: [0, 0.28, 0.025],
  });

  // Crown of spikes on top of the head.
  b.spike([0, 0.298, 0.022], [0, 1, -0.3], 0.025, 0.005);
  b.spike([0.01, 0.296, 0.028], [0.5, 0.8, -0.2], 0.02, 0.0045);
  b.spike([-0.01, 0.296, 0.028], [-0.5, 0.8, -0.2], 0.02, 0.0045);

  // Tube snout, pointing forward and a touch down.
  b.sweep(
    [
      [0, 0.276, 0.04],
      [0, 0.266, 0.08],
      [0, 0.258, 0.118],
    ],
    0.008,
    { color: YELLOW_DEEP },
  );
  b.part(new THREE.SphereGeometry(0.006, 8, 6), INK, { at: [0, 0.258, 0.121] });

  // Big curious eyes: white ball with a dark pupil set forward.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 12, 10), WHITE, {
      at: [s * 0.021, 0.292, 0.036],
    });
    b.part(new THREE.SphereGeometry(0.0075, 10, 8), INK, {
      at: [s * 0.028, 0.293, 0.044],
    });
  }

  // Delicate fluttering dorsal fin, a thin extruded fan along the back.
  b.extrude(
    [
      [0, 0],
      [0.02, 0.02],
      [0.035, 0.07],
      [0.03, 0.12],
      [0.012, 0.14],
      [0, 0.13],
    ],
    { at: [0, 0.1, -0.004], x: [0, 0, -1], y: [0, 1, 0] },
  );

  // Seagrass strand rooted on the floor, the tail's perch.
  b.sweep(
    [
      [0.06, 0, 0],
      [0.065, 0.15, 0.006],
      [0.058, 0.3, -0.004],
      [0.063, 0.36, 0],
    ],
    0.005,
    { color: GRASS },
  );
  b.sweep(
    [
      [0.068, 0, 0.012],
      [0.072, 0.18, 0.016],
      [0.07, 0.26, 0.01],
    ],
    0.004,
    { color: GRASS_LIGHT },
  );

  return b.root;
}
