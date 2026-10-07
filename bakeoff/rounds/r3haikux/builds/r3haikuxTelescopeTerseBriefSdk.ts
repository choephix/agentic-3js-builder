import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Telescope",
  description:
    "A navy and brass refracting telescope on a three-legged wooden tripod, with a finder scope, focusers and an alt-az fork head.",
};

type Vec = THREE.Vector3;
type Axes = [Vec, Vec, Vec];

const V = (x: number, y: number, z: number): Vec => new THREE.Vector3(x, y, z);
const X_AXIS = V(1, 0, 0);
const Y_AXIS = V(0, 1, 0);
const Z_AXIS = V(0, 0, 1);
const WORLD_AXES: Axes = [X_AXIS, Y_AXIS, Z_AXIS];

const mid = (a: Vec, c: Vec): Vec => a.clone().add(c).multiplyScalar(0.5);

// Right-handed basis whose Y column is `dir`, used to lay a cylinder along a direction.
// Cylinders are round, so the roll around their own axis does not matter.
function alongY(dir: Vec): THREE.Matrix4 {
  const y = dir.clone().normalize();
  const ref = Math.abs(y.x) < 0.9 ? X_AXIS : Z_AXIS;
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return new THREE.Matrix4().makeBasis(x, y, z);
}

// Cylinder from a to c: radius ra at a, rb at c. Centred on its midpoint.
function rodGeometry(a: Vec, c: Vec, ra: number, rb: number, seg: number) {
  const d = c.clone().sub(a);
  const g = new THREE.CylinderGeometry(rb, ra, d.length(), seg, 1);
  g.applyMatrix4(alongY(d));
  return g;
}

// Box: width along axes[0], height along axes[1], depth along axes[2]. Centred.
function boxGeometry(w: number, h: number, d: number, axes: Axes) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(axes[0], axes[1], axes[2]));
  return g;
}

export default function build() {
  const b = createBuilder({ name: "telescope" });
  type Bone = ReturnType<typeof b.joint>;

  // Palette: navy tube, brass fittings, wooden legs, charcoal mount, cream accents
  const NAVY = "#23466f";
  const BRASS = "#d9a441";
  const CHARCOAL = "#2b2e35";
  const WOOD = "#8f5d33";
  const CREAM = "#efe6d0";
  const RED = "#c8412f";
  const BLACK = "#16181c";
  const LENS = "#2c6f9c";
  const GLINT = "#b8ecff";

  // Skeleton: base (tripod), pan (azimuth on the head), tilt (the tube's trunnion)
  const base = b.joint("base", { at: [0, 0, 0] });
  const pan = b.joint("pan", { at: [0, 1.05, 0], parent: base });
  const tilt = b.joint("tilt", { at: [0, 1.3, 0], parent: pan });

  const rod = (a: Vec, c: Vec, ra: number, rb: number, seg: number, color: string, bone: Bone) =>
    b.part(rodGeometry(a, c, ra, rb, seg), color, { at: mid(a, c), bone });
  const block = (center: Vec, w: number, h: number, d: number, axes: Axes, color: string, bone: Bone) =>
    b.part(boxGeometry(w, h, d, axes), color, { at: center, bone });

  // Optical tube: trunnion at C, tilted up by TILT, objective toward +Z
  const TILT = 0.66;
  const C = V(0, 1.3, 0);
  const D = V(0, Math.sin(TILT), Math.cos(TILT)); // along the tube, eyepiece to objective
  const UP = V(0, Math.cos(TILT), -Math.sin(TILT)); // the tube's own up
  const TUBE_AXES: Axes = [X_AXIS, D, UP.clone().negate()];
  // A point on the tube: s along the axis, u sideways (+X), v up the tube's own up
  const at = (s: number, u = 0, v = 0): Vec =>
    C.clone().addScaledVector(D, s).addScaledVector(X_AXIS, u).addScaledVector(UP, v);
  const tube = (s0: number, s1: number, r0: number, r1: number, color: string, seg = 14) =>
    rod(at(s0), at(s1), r0, r1, seg, color, tilt);

  // ---- Tripod: three wooden legs, a hex hub, a spreader, centre column, plumb bob ----
  const R = 0.66; // foot radius
  const c30 = Math.sqrt(3) / 2;
  const legDirs: [number, number][] = [
    [0, -1],
    [c30, 0.5],
    [-c30, 0.5],
  ];
  const legTop = legDirs.map(([dx, dz]) => V(dx * 0.1, 0.92, dz * 0.1));
  const legFoot = legDirs.map(([dx, dz]) => V(dx * R, 0.03, dz * R));

  for (let i = 0; i < 3; i++) {
    const top = legTop[i];
    const foot = legFoot[i];
    const dir = foot.clone().sub(top).normalize();
    const lock = top.clone().lerp(foot, 0.35);
    rod(top, foot, 0.026, 0.018, 8, WOOD, base);
    rod(
      lock.clone().addScaledVector(dir, -0.022),
      lock.clone().addScaledVector(dir, 0.022),
      0.033,
      0.033,
      10,
      BRASS,
      base,
    );
    rod(V(foot.x, 0, foot.z), foot, 0.03, 0.03, 10, BLACK, base); // rubber shoe
  }

  // Spreader: a square-section triangle between the legs
  const knots = legTop.map((top, i) => top.clone().lerp(legFoot[i], 0.6));
  for (let i = 0; i < 3; i++) {
    rod(knots[i], knots[(i + 1) % 3], 0.011, 0.011, 4, CHARCOAL, base);
  }

  rod(V(0, 0.3, 0), V(0, 0.92, 0), 0.02, 0.02, 10, CHARCOAL, base); // centre column
  rod(V(0, 0.3, 0), V(0, 0.2, 0), 0.016, 0.004, 8, BRASS, base); // plumb bob
  rod(V(0, 0.92, 0), V(0, 0.98, 0), 0.13, 0.13, 6, CHARCOAL, base); // hex hub
  rod(V(0, 0.98, 0), V(0, 1.01, 0), 0.136, 0.136, 16, BRASS, base); // pan bearing

  // ---- Fork head: pan column, yoke plate, two arms carrying the trunnion pins ----
  rod(V(0, 1.01, 0), V(0, 1.08, 0), 0.05, 0.05, 12, CHARCOAL, pan);
  block(V(0, 1.095, 0), 0.4, 0.03, 0.1, WORLD_AXES, CHARCOAL, pan);
  rod(V(-0.2, 1.3, 0), V(0.2, 1.3, 0), 0.022, 0.022, 10, BRASS, tilt); // trunnion pin
  for (const sx of [1, -1]) {
    block(V(sx * 0.17, 1.19, 0), 0.04, 0.22, 0.1, WORLD_AXES, CHARCOAL, pan);
    rod(V(sx * 0.19, 1.3, 0), V(sx * 0.235, 1.3, 0), 0.03, 0.03, 12, BRASS, pan); // clamp knob
  }

  // ---- Main tube: navy, with brass bands and a flared dew shield ----
  tube(-0.39, -0.36, 0.066, 0.075, NAVY); // rear chamfer
  tube(-0.36, 0.19, 0.075, 0.075, NAVY); // body
  tube(0.19, 0.205, 0.075, 0.094, NAVY); // flare
  tube(0.205, 0.42, 0.094, 0.094, NAVY); // dew shield
  tube(-0.31, -0.285, 0.082, 0.082, BRASS); // rear band
  tube(0.2, 0.225, 0.1, 0.1, BRASS); // collar at the flare
  tube(0.395, 0.42, 0.1, 0.1, BRASS); // front rim

  // Objective: coated lens with a glint
  tube(0.42, 0.428, 0.08, 0.08, LENS, 16);
  tube(0.428, 0.432, 0.042, 0.042, GLINT, 16);

  // ---- Rear: focuser drawtube, eyepiece, two red focus knobs ----
  tube(-0.39, -0.47, 0.042, 0.042, CHARCOAL);
  tube(-0.47, -0.56, 0.03, 0.03, BLACK);
  tube(-0.49, -0.5, 0.034, 0.034, BRASS);
  tube(-0.56, -0.585, 0.03, 0.04, BLACK); // flared eyecup
  for (const sx of [1, -1]) {
    rod(at(-0.42, sx * 0.03), at(-0.42, sx * 0.075), 0.01, 0.01, 8, CHARCOAL, tilt); // shaft
    rod(at(-0.42, sx * 0.075), at(-0.42, sx * 0.095), 0.034, 0.034, 14, RED, tilt); // knob
  }

  // ---- Dovetail rail and a cream label with a red stripe on the +X side ----
  block(at(-0.08, 0, 0.076), 0.036, 0.5, 0.016, TUBE_AXES, CHARCOAL, tilt);
  block(at(-0.1, 0.074, 0), 0.006, 0.2, 0.04, TUBE_AXES, CREAM, tilt);
  block(at(-0.1, 0.0776, 0), 0.003, 0.2, 0.006, TUBE_AXES, RED, tilt);

  // ---- Finder scope on two brackets ----
  const FV = 0.125;
  rod(at(-0.2, 0, FV), at(0.14, 0, FV), 0.03, 0.03, 12, CREAM, tilt);
  rod(at(-0.2, 0, FV), at(-0.236, 0, FV), 0.02, 0.02, 10, BLACK, tilt); // eyepiece
  rod(at(0.14, 0, FV), at(0.149, 0, FV), 0.034, 0.034, 12, BRASS, tilt); // front ring
  rod(at(0.149, 0, FV), at(0.153, 0, FV), 0.027, 0.027, 12, LENS, tilt); // finder lens
  rod(at(-0.12, 0, 0.07), at(-0.12, 0, 0.11), 0.014, 0.014, 8, CHARCOAL, tilt);
  rod(at(0.06, 0, 0.07), at(0.06, 0, 0.11), 0.014, 0.014, 8, CHARCOAL, tilt);

  return b.root;
}
