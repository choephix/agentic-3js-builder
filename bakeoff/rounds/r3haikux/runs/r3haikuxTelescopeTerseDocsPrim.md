```ts
import * as THREE from "three";
import { createBuilder, grain, paint, svg } from "agentic-3js-builder";

type V3 = [number, number, number];

const NAVY = "#1d3b63";
const IVORY = "#f2ead3";
const BRASS = "#d8a544";
const CHAR = "#2b2f38";
const RUBBER = "#121317";
const GLASS = "#3f9cc4";
const WOOD_LIGHT = "#d39a5c";
const WOOD_DARK = "#8d5a2e";

const UP: V3 = [0, 1, 0];
const TRUN: V3 = [0, 1.25, 0]; // altitude trunnion: the tube pivots here

// The tube sits 35 degrees above horizontal and points forward (+Z).
const ELEV = (35 * Math.PI) / 180;
const AXIS: V3 = [0, Math.sin(ELEV), Math.cos(ELEV)]; // along the tube, rear to front
const NORM: V3 = [0, Math.cos(ELEV), -Math.sin(ELEV)]; // across the tube, up and back

// s metres along the tube from the trunnion, o metres up from its axis, x to the left
const along = (s: number, o = 0, x = 0): V3 => [
  x,
  TRUN[1] + AXIS[1] * s + NORM[1] * o,
  AXIS[2] * s + NORM[2] * o,
];

const unit = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

export const meta = {
  name: "Telescope",
  description:
    "A refractor on a three-legged pan-and-tilt mount: navy tube with ivory pinstripes, brass fittings, grained wooden tripod.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  type Bone = ReturnType<typeof b.joint>;

  // A cylinder of radius r and length len, its axis along dir, centred on `at`.
  const cyl = (r: number, len: number, color: string, at: V3, dir: V3, bone: Bone) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 10), color, { at, dir, bone, flat: true });

  // Skeleton: tripod base, pan head, and the altitude hinge the tube swings on.
  const base = b.joint("base", { at: [0, 0, 0] });
  const pan = b.joint("pan", { parent: base, at: [0, 0.985, 0], dir: UP });
  const tilt = b.joint("tilt", { parent: pan, at: TRUN, dir: AXIS, role: "hinge" });

  // ---- Tripod -------------------------------------------------------------
  const C = Math.sqrt(3) / 2;
  const legDirs: V3[] = [
    [0, 0, 1],
    [C, 0, -0.5],
    [-C, 0, -0.5],
  ];
  // f = 0 at the head, 1 at the foot
  const legPt = (u: V3, f: number): V3 => {
    const r = 0.07 + 0.55 * f;
    return [u[0] * r, 0.945 - 0.915 * f, u[2] * r];
  };
  const hubY = 0.945 - 0.915 * 0.55;
  const hub: V3 = [0, hubY, 0];

  for (const u of legDirs) {
    const axis = unit([u[0] * 0.55, -0.915, u[2] * 0.55]);
    b.rod(legPt(u, 0), legPt(u, 1), [0.03, 0.02], {
      color: grain(WOOD_LIGHT, WOOD_DARK, { size: 0.014, axis }),
      bone: base,
    });
    cyl(0.032, 0.045, BRASS, legPt(u, 0.8), axis, base); // leg-lock collar
    cyl(0.04, 0.03, RUBBER, [u[0] * 0.62, 0.015, u[2] * 0.62], UP, base); // rubber foot
    b.rod(hub, legPt(u, 0.55), 0.011, { color: CHAR, bone: base }); // spreader
  }
  cyl(0.022, 0.935 - hubY, CHAR, [0, (0.935 + hubY) / 2, 0], UP, base); // centre column
  cyl(0.04, 0.05, BRASS, hub, UP, base); // spreader hub
  cyl(0.085, 0.03, CHAR, [0, 0.95, 0], UP, base); // head plate

  // ---- Pan head and fork --------------------------------------------------
  cyl(0.075, 0.04, BRASS, [0, 0.985, 0], UP, pan); // azimuth disc
  cyl(0.018, 0.03, RUBBER, [0.09, 0.985, 0], [1, 0, 0], pan); // azimuth lock knob
  b.part(new THREE.BoxGeometry(0.34, 0.035, 0.11), CHAR, {
    at: [0, 1.02, 0],
    bone: pan,
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.035, 0.27, 0.07), CHAR, {
      at: [s * 0.155, 1.135, 0],
      bone: pan,
      flat: true,
    });
    cyl(0.034, 0.03, BRASS, [s * 0.19, TRUN[1], 0], [1, 0, 0], tilt); // altitude knob
  }
  cyl(0.02, 0.36, BRASS, TRUN, [1, 0, 0], tilt); // trunnion axle

  // ---- Optical tube -------------------------------------------------------
  // Navy with two ivory pinstripes, painted by position along the tube.
  const tubeColour = paint((p) => {
    const a =
      (p.x - TRUN[0]) * AXIS[0] + (p.y - TRUN[1]) * AXIS[1] + (p.z - TRUN[2]) * AXIS[2];
    return Math.abs(a - 0.2) < 0.008 || Math.abs(a + 0.26) < 0.008 ? IVORY : NAVY;
  });
  const tube = b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 10), tubeColour, {
    at: TRUN,
    dir: AXIS,
    bone: tilt,
    flat: true,
  });

  cyl(0.1, 0.06, BRASS, along(0.33), AXIS, tilt); // objective cell
  cyl(0.088, 0.01, GLASS, along(0.36), AXIS, tilt); // objective lens
  cyl(0.098, 0.03, BRASS, along(-0.315), AXIS, tilt); // rear collar
  cyl(0.045, 0.09, CHAR, along(-0.375), AXIS, tilt); // focuser drawtube
  cyl(0.016, 0.05, BRASS, along(-0.36, 0.06), NORM, tilt); // focus lock thumbscrew

  cyl(0.108, 0.07, CHAR, along(-0.16), AXIS, tilt); // mount ring, rear
  cyl(0.108, 0.07, CHAR, along(0.09), AXIS, tilt); // mount ring, front

  // Diagonal and eyepiece, rising off the rear of the tube
  cyl(0.05, 0.1, CHAR, along(-0.25, 0.11), NORM, tilt); // diagonal
  cyl(0.03, 0.18, BRASS, along(-0.25, 0.25), NORM, tilt); // eyepiece barrel
  cyl(0.034, 0.02, BRASS, along(-0.25, 0.35), NORM, tilt); // eyepiece collar
  cyl(0.03, 0.03, RUBBER, along(-0.25, 0.375), NORM, tilt); // eyecup

  // Finder scope on the top of the tube
  cyl(0.02, 0.06, CHAR, along(-0.1, 0.095), NORM, tilt); // finder bracket
  cyl(0.02, 0.06, CHAR, along(0, 0.095), NORM, tilt); // finder bracket
  cyl(0.03, 0.4, CHAR, along(0.02, 0.13), AXIS, tilt); // finder body
  cyl(0.034, 0.024, BRASS, along(0.21, 0.13), AXIS, tilt); // finder collar
  cyl(0.024, 0.008, GLASS, along(0.226, 0.13), AXIS, tilt); // finder lens

  // Brass medallion with a star, wrapped onto both flanks of the tube
  const medal = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="${BRASS}"/>
      <circle cx="32" cy="32" r="25" fill="${NAVY}"/>
      <path d="M32 10 L37.3 24.7 L52.9 25.2 L40.6 34.8 L44.9 49.8 L32 41 L19.1 49.8 L23.4 34.8 L11.1 25.2 L26.7 24.7 Z" fill="${IVORY}"/>
    </svg>`,
    { size: 128 },
  );
  for (const side of [1, -1])
    b.decal(tube, medal, {
      at: along(-0.07, 0, side * 0.09),
      dir: [side, 0, 0],
      size: [0.07, 0.07],
      bone: tilt,
    });

  return b.root;
}
```