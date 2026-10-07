```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Griffin Knight",
  description:
    "A battle-worn knight: a great helm with a crimson plume, gold-etched layered pauldrons, a blue surcoat and kite shield bearing a silver griffin, a notched broadsword and a torn crimson cape.",
};

type V3 = [number, number, number];

const COL = {
  steel: "#aab3bd",
  steelDark: "#687283",
  steelDeep: "#424b57",
  gold: "#dba945",
  blue: "#1d3a7c",
  silver: "#e8edf3",
  silverDark: "#98a4b2",
  crimson: "#a01c24",
  crimsonDark: "#64101a",
  leather: "#3b2619",
  black: "#101013",
  blade: "#d5dde5",
  scratch: "#f4f7fa",
  grime: "#3a3128",
};

// ── primitive builders (model units are metres) ─────────────────

const sph = (rx: number, ry: number, rz: number) =>
  new THREE.SphereGeometry(1, 12, 8).scale(rx, ry, rz);

/** Upper half of an ellipsoid: a pauldron shell, open underneath. */
const dome = (rx: number, ry: number, rz: number) =>
  new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(rx, ry, rz);

const boxG = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const cylG = (rt: number, rb: number, h: number, seg = 10) =>
  new THREE.CylinderGeometry(rt, rb, h, seg);

/** A flattened torus lying in the XZ plane: a band or rim. */
const ring = (r: number, y: number, sz: number, tube = 0.008) =>
  new THREE.TorusGeometry(r, tube, 4, 22).rotateX(Math.PI / 2).scale(1, 1, sz).translate(0, y, 0);

/** A round tube from point a (radius ra) to point b (radius rb). */
function beam(a: V3, b: V3, ra: number, rb: number, seg = 8) {
  const A = new THREE.Vector3(...a);
  const B = new THREE.Vector3(...b);
  const d = B.clone().sub(A);
  const len = d.length();
  d.normalize();
  const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const x = new THREE.Vector3().crossVectors(ref, d).normalize();
  const z = new THREE.Vector3().crossVectors(x, d).normalize();
  const g = new THREE.CylinderGeometry(rb, ra, len, seg);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, d, z));
  return g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
}

/** A flat outline extruded along Z, centred on zc. */
function flat(shape: THREE.Shape, depth: number, zc = 0) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(
    0,
    0,
    zc - depth / 2,
  );
}

/** A flat polygon extruded along Z. */
function poly(pts: [number, number][], depth: number, zc = 0) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
  s.closePath();
  return flat(s, depth, zc);
}

/** Kite outline: flat top, straight sides, curved point at the bottom. */
function kite(hw: number, top: number, tip: number) {
  const s = new THREE.Shape();
  s.moveTo(-hw, top);
  s.lineTo(hw, top);
  s.lineTo(hw, top * 0.1);
  s.quadraticCurveTo(hw * 0.9, tip * 0.55, 0, tip);
  s.quadraticCurveTo(-hw * 0.9, tip * 0.55, -hw, top * 0.1);
  s.closePath();
  return s;
}

/** A cloth strip hanging from y = 0 with a torn, ragged hem. */
function tatter(w: number, h: number, t: number) {
