import * as THREE from "three";
import { countershade, createBuilder, grain, svg } from "../../../../src/index";

export const meta = {
  name: "Telescope",
  description:
    "A refractor on a three-leg alt-az tripod, about 1.35 m tall: an ivory tube with a navy dew shield, brass rings, " +
    "a glass objective, a finder scope, a star diagonal and wooden legs.",
};

const IVORY = "#f6f0e2";
const IVORY_SHADE = "#d3c6ad";
const NAVY = "#24395c";
const BRASS = "#c9963f";
const SILVER = "#c5ced6";
const RED = "#c8412f";
const GLASS = "#4f8fc4";
const BLACK = "#1d2026";
const RUBBER = "#222428";

// The tube points 35 degrees above the horizon, toward +Z. Its altitude axle runs along X through the tube's centre.
const TILT = (35 * Math.PI) / 180;
const SIN = Math.sin(TILT);
const COS = Math.cos(TILT);
const AXLE_Y = 1.05;
const AIM: [number, number, number] = [0, SIN, COS];
const UP: [number, number, number] = [0, COS, -SIN];
const SIDE: [number, number, number] = [1, 0, 0];
/** A point `s` metres along the tube from the axle, `u` metres up from its axis, `x` metres to the left. */
const at = (s: number, u = 0, x = 0): [number, number, number] => [
  x,
  AXLE_Y + s * SIN + u * COS,
  s * COS - u * SIN,
];

// Tripod geometry.
const HEAD_Y = 0.9;
const SPREAD_Y = 0.38;
const LEG_TOP_R = 0.04;
const LEG_FOOT_R = 0.45;
const LEG_ANGLES = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
const onLeg = (a: number, r: number, y: number): [number, number, number] => [r * Math.cos(a), y, r * Math.sin(a)];
const legRadius = (y: number) => LEG_TOP_R + ((LEG_FOOT_R - LEG_TOP_R) * (HEAD_Y - y)) / HEAD_Y;

export default function telescope() {
  const b = createBuilder({ name: "telescope", detail: 1, paintSize: 1024 });

  const wood = grain("#c08a52", "#7a4d29", { size: 0.02, axis: "y" });
  const ivory = countershade(IVORY, IVORY_SHADE, { level: 0.1, soft: 0.6 });
  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 100">
  <rect width="85" height="100" fill="${NAVY}"/>
  <rect y="9" width="85" height="4" fill="${BRASS}"/>
  <rect y="87" width="85" height="4" fill="${BRASS}"/>
  <circle cx="42.5" cy="50" r="20" fill="${RED}"/>
  <circle cx="42.5" cy="50" r="11" fill="${IVORY}"/>
  <circle cx="42.5" cy="50" r="5" fill="${NAVY}"/>
</svg>`,
    { size: 256 },
  );

  // Skeleton: base (root) -> head (tripod) -> tube (the altitude hinge).
  const base = b.joint("base", { at: [0, 0, 0] });
  const head = b.joint("head", { at: [0, HEAD_Y, 0], parent: base });
  const tube = b.joint("tube", { at: at(0), dir: AIM, parent: head, role: "hinge" });

  /** A square-section bar from one point to another, on `bone`. */
  const beam = (
    from: [number, number, number],
    to: [number, number, number],
    width: number,
    color: string,
    bone: typeof head,
    name: string,
  ) => {
    const a = new THREE.Vector3(...from);
    const z = new THREE.Vector3(...to);
    return b.part(new THREE.BoxGeometry(width, a.distanceTo(z), width), color, {
      at: a.clone().lerp(z, 0.5),
      dir: z.clone().sub(a),
      bone,
      name,
    });
  };

  // Tripod: navy head, three wooden legs with feet and brass leg locks, a steel spider and centre post.
  b.part(new THREE.CylinderGeometry(0.075, 0.085, 0.05, b.segments(12)), NAVY, {
    at: [0, HEAD_Y, 0],
    bone: head,
    name: "tripod head",
  });
  LEG_ANGLES.forEach((a, k) => {
    const top = onLeg(a, LEG_TOP_R, HEAD_Y);
    const foot = onLeg(a, LEG_FOOT_R, 0);
    const legDir: [number, number, number] = [0.41 * Math.cos(a), -HEAD_Y, 0.41 * Math.sin(a)];
    const lock = onLeg(a, legRadius(SPREAD_Y), SPREAD_Y);
    b.rod(top, foot, [0.024, 0.012], { color: wood, bone: head, name: `leg${k + 1}` });
    b.part(new THREE.CylinderGeometry(0.022, 0.024, 0.018, b.segments(8)), RUBBER, {
      at: [foot[0], 0.009, foot[2]],
      bone: head,
      name: `foot${k + 1}`,
    });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, b.segments(8)), BRASS, {
      at: lock,
      dir: legDir,
      bone: head,
      name: "leg lock",
    });
    b.rod(lock, [0, SPREAD_Y, 0], 0.007, { color: SILVER, bone: head, name: "spoke" });
  });
  b.part(new THREE.SphereGeometry(0.024, b.segments(8), b.segments(6)), BRASS, {
    at: [0, SPREAD_Y, 0],
    bone: head,
    name: "spider hub",
  });
  b.rod([0, SPREAD_Y, 0], [0, HEAD_Y, 0], 0.013, { color: SILVER, bone: head, name: "centre post" });

  // Alt-az fork: two navy arms rising from the head to the altitude axle, with silver pins and a red and a brass knob.
  for (const side of [1, -1]) {
    beam([side * 0.06, 0.925, 0], [side * 0.13, AXLE_Y, 0], 0.03, NAVY, head, "fork arm");
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.11, b.segments(8)), SILVER, {
      at: [side * 0.095, AXLE_Y, 0],
      dir: SIDE,
      bone: tube,
      name: "axle pin",
    });
    b.part(new THREE.CylinderGeometry(0.024, 0.026, 0.024, b.segments(10)), side > 0 ? RED : BRASS, {
      at: [side * 0.16, AXLE_Y, 0],
      dir: SIDE,
      bone: tube,
      name: "altitude knob",
    });
  }

  // Optics: ivory tube, navy dew shield, brass front ring, glass objective.
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.62, b.segments(14)), ivory, {
    at: at(-0.05),
    dir: AIM,
    bone: tube,
    name: "main tube",
  });
  b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.03, b.segments(14)), NAVY, {
    at: at(-0.36),
    dir: AIM,
    bone: tube,
    name: "rear cell",
  });
  b.part(new THREE.CylinderGeometry(0.069, 0.069, 0.14, b.segments(14)), NAVY, {
    at: at(0.33),
    dir: AIM,
    bone: tube,
    name: "dew shield",
  });
  const brassRing = new THREE.TorusGeometry(0.069, 0.008, 6, b.segments(16));
  brassRing.rotateX(Math.PI / 2);
  b.part(brassRing, BRASS, { at: at(0.4), dir: AIM, bone: tube, name: "front ring" });
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.03, b.segments(14)), GLASS, {
    at: at(0.4),
    dir: AIM,
    bone: tube,
    name: "objective",
  });

  // Finder scope on two navy brackets, above the tube.
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.24, b.segments(10)), SILVER, {
    at: at(-0.1, 0.095),
    dir: AIM,
    bone: tube,
    name: "finder",
  });
  for (const s of [-0.18, -0.02]) {
    b.part(new THREE.BoxGeometry(0.028, 0.035, 0.03), NAVY, {
      at: at(s, 0.065),
      dir: AIM,
      bone: tube,
      name: "finder bracket",
    });
  }

  // A badge on the left flank: an SVG drawing wrapped round an 80 degree arc of the tube.
  const arc = 1.4;
  b.part(
    new THREE.CylinderGeometry(0.0606, 0.0606, 0.1, b.segments(14), 1, true, -Math.PI / 2 - arc / 2, arc),
    "#ffffff",
    { at: at(-0.2), dir: AIM, bone: tube, texture: badge, name: "badge" },
  );

  // Rear focuser: silver drawtube, a knurled focus knob, a star diagonal and an eyepiece.
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, b.segments(12)), SILVER, {
    at: at(-0.43),
    dir: AIM,
    bone: tube,
    name: "drawtube",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, b.segments(10)), RUBBER, {
    at: at(-0.42, 0, 0.044),
    dir: SIDE,
    bone: tube,
    name: "focus knob",
  });
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.07, b.segments(12)), NAVY, {
    at: at(-0.5, 0.035),
    dir: UP,
    bone: tube,
    name: "star diagonal",
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, b.segments(12)), BLACK, {
    at: at(-0.5, 0.115),
    dir: UP,
    bone: tube,
    name: "eyepiece",
  });
  b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.012, b.segments(12)), BRASS, {
    at: at(-0.5, 0.16),
    dir: UP,
    bone: tube,
    name: "eyepiece ring",
  });

  return b.root;
}
