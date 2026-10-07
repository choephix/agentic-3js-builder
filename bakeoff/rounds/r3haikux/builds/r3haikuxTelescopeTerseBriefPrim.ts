import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Telescope",
  description:
    "A navy-and-brass refracting telescope on a walnut tripod, with a pan head and a tilting tube cradle.",
};

type V = [number, number, number];

// palette
const NAVY = "#1f3b63";
const BRASS = "#d9a441";
const BRASS_DK = "#8e6a24";
const WALNUT = "#7a4a2b";
const BLACK = "#1d1d22";
const GLASS = "#2f8fc4";
const GLASS_LT = "#a6e4ff";
const IVORY = "#efe4c8";

const DEG = Math.PI / 180;
const ELEV = 40 * DEG; // tube elevation
const T: V = [0, 1.22, 0]; // tube centre, also its tilt pivot
const D: V = [0, Math.sin(ELEV), Math.cos(ELEV)]; // optical axis, out of the objective
const U: V = [0, Math.cos(ELEV), -Math.sin(ELEV)]; // the tube's top, square to D
const X: V = [1, 0, 0];
const UP: V = [0, 1, 0];
const FWD: V = [0, 0, 1];

// a point on the tube: s along the axis (+ = objective end), r up over the tube, x sideways
const P = (s: number, r = 0, x = 0): V => [
  x,
  T[1] + D[1] * s + U[1] * r,
  T[2] + D[2] * s + U[2] * r,
];

const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const lenOf = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => {
  const l = lenOf(a);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp3 = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

// turn a geometry built along +Y so that its +Y runs along dir
function orient<G extends THREE.BufferGeometry>(geo: G, dir: V): G {
  const y = new THREE.Vector3(...unit(dir));
  const ref =
    Math.abs(y.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
}

export default function build() {
  const b = createBuilder({ name: "telescope" });
  type Joint = ReturnType<typeof b.joint>;

  // rig: tripod (floor) -> pan head (turns about Y) -> tilt cradle (pivots on X at the tube's centre)
  const tripod = b.joint("tripod", { at: [0, 0, 0], dir: UP });
  const pan = b.joint("pan", { at: [0, 1.05, 0], parent: tripod, dir: UP });
  const tilt = b.joint("tilt", { at: T, parent: pan, dir: X, up: UP });

  // every piece goes through b.part on a bone; `at` is model space, orientation is baked into the geometry
  const put = (geo: THREE.BufferGeometry, color: string, at: V, bone: Joint) => {
    b.part(geo, color, { at, bone });
  };
  const cyl = (r: number, h: number, dir: V, at: V, color: string, bone: Joint, seg = 20) =>
    put(orient(new THREE.CylinderGeometry(r, r, h, seg), dir), color, at, bone);
  const block = (w: number, h: number, d: number, at: V, color: string, bone: Joint) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, bone);
  const plank = (w: number, h: number, d: number, dir: V, at: V, color: string, bone: Joint) =>
    put(orient(new THREE.BoxGeometry(w, h, d), dir), color, at, bone);
  const bar = (a: V, c: V, r: number, color: string, bone: Joint) =>
    cyl(r, lenOf(sub(c, a)), sub(c, a), lerp3(a, c, 0.5), color, bone, 12);

  // ---- tripod: three walnut legs, brass hub, a walnut accessory tray between them
  const tops: V[] = [];
  const feet: V[] = [];
  for (const deg of [180, 60, -60]) {
    const a = deg * DEG;
    const g: V = [Math.sin(a), 0, Math.cos(a)];
    tops.push([g[0] * 0.06, 0.95, g[2] * 0.06]);
    feet.push([g[0] * 0.62, 0, g[2] * 0.62]);
  }
  tops.forEach((top, i) => {
    const foot = feet[i];
    const dir = sub(foot, top);
    cyl(0.026, lenOf(dir), dir, lerp3(top, foot, 0.5), WALNUT, tripod); // leg
    cyl(0.034, 0.05, dir, lerp3(top, foot, 0.14), BRASS, tripod); // brass collar
    cyl(0.034, 0.03, UP, [foot[0], 0.015, foot[2]], BLACK, tripod, 14); // rubber foot
  });
  const brace = tops.map((top, i) => lerp3(top, feet[i], 0.684)); // spreader points at y = 0.3
  brace.forEach((p, i) => bar(p, brace[(i + 1) % 3], 0.012, BRASS_DK, tripod));
  cyl(0.38, 0.025, UP, [0, 0.29, 0], WALNUT, tripod, 24); // accessory tray
  cyl(0.1, 0.04, UP, [0, 0.97, 0], BRASS_DK, tripod, 6); // hub plate
  cyl(0.03, 0.06, UP, [0, 1.02, 0], BRASS, tripod); // column

  // ---- pan head: brass turntable with ivory scale ticks, walnut yoke
  cyl(0.1, 0.04, UP, [0, 1.07, 0], BRASS, pan, 28);
  for (let k = 0; k < 12; k++) {
    const a = k * 30 * DEG;
    const r: V = [Math.sin(a), 0, Math.cos(a)];
    plank(0.005, 0.016, 0.002, r, [0.078 * r[0], 1.0915, 0.078 * r[2]], IVORY, pan);
  }
  for (const sx of [-1, 1]) {
    block(0.035, 0.16, 0.12, [sx * 0.13, 1.17, 0], WALNUT, pan); // yoke arm
    put(new THREE.SphereGeometry(0.018, 16, 12), BRASS, [sx * 0.13, 1.25, 0], pan); // arm cap
  }
  cyl(0.011, 0.18, FWD, [0, 1.07, 0.1], BRASS_DK, pan, 10); // slow-motion handle
  put(new THREE.SphereGeometry(0.022, 16, 12), BLACK, [0, 1.07, 0.2], pan); // handle knob

  // ---- tube (tilt bone): navy enamel, brass fittings, blue objective
  cyl(0.085, 0.84, D, P(0), NAVY, tilt, 24); // main tube
  cyl(0.1, 0.07, D, P(0), BRASS, tilt, 24); // trunnion collar
  for (const sx of [-1, 1]) cyl(0.02, 0.05, X, P(0, 0, sx * 0.12), BRASS_DK, tilt, 12); // pins
  cyl(0.028, 0.035, X, P(0, 0, 0.1625), BLACK, tilt, 16); // clamp knob
  plank(0.05, 0.42, 0.02, D, P(0, -0.093), BLACK, tilt); // dovetail saddle under the tube
  for (const sx of [-1, 1]) plank(0.003, 0.3, 0.04, D, P(-0.2, 0, sx * 0.0865), IVORY, tilt); // labels

  // objective end
  cyl(0.1, 0.07, D, P(0.445), BRASS, tilt, 24); // objective cell
  put(
    orient(new THREE.TorusGeometry(0.1, 0.01, 10, 32).rotateX(Math.PI / 2), D),
    BRASS,
    P(0.48),
    tilt,
  ); // cell lip
  cyl(0.082, 0.008, D, P(0.484), GLASS, tilt, 24); // objective glass
  cyl(0.04, 0.003, D, P(0.4885), GLASS_LT, tilt, 20); // glint on the glass
  cyl(0.091, 0.022, D, P(0.28), BRASS, tilt, 24); // band

  // ---- finder scope on the tube's top
  cyl(0.026, 0.3, D, P(0.12, 0.118), BLACK, tilt, 16);
  cyl(0.033, 0.02, D, P(-0.02, 0.118), BRASS, tilt, 16);
  cyl(0.033, 0.02, D, P(0.24, 0.118), BRASS, tilt, 16);
  cyl(0.02, 0.005, D, P(0.2725, 0.118), GLASS, tilt, 16);
  bar(P(-0.02, 0.07), P(-0.02, 0.13), 0.012, BRASS_DK, tilt);
  bar(P(0.24, 0.07), P(0.24, 0.13), 0.012, BRASS_DK, tilt);

  // ---- rear: brass cell, focuser drawtube, eyepiece
  cyl(0.092, 0.06, D, P(-0.4), BRASS, tilt, 24);
  cyl(0.04, 0.13, D, P(-0.495), BRASS_DK, tilt, 20);
  cyl(0.046, 0.016, D, P(-0.54), BRASS, tilt, 20);
  cyl(0.028, 0.03, X, P(-0.48, 0, 0.056), BLACK, tilt, 16); // focus knob
  cyl(0.028, 0.1, D, P(-0.6), BLACK, tilt, 20); // eyepiece barrel
  cyl(0.031, 0.01, D, P(-0.6), BRASS, tilt, 20); // barrel ring
  cyl(0.032, 0.026, D, P(-0.66), BLACK, tilt, 20); // eyecup

  return b.root;
}
