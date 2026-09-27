// Model-space vector helpers and the one orientation primitive, `aim()`.
import { Matrix4, Quaternion, Vector3 } from "three";

/** A model-space point or direction: a `[x, y, z]` tuple or a `THREE.Vector3`. */
export type V3 = Vector3 | readonly [number, number, number];
export type Axis = "x" | "y" | "z";

export const DEG = Math.PI / 180;

/** A fresh `Vector3` copy of `p` (never aliases the input). */
export function vec(p: V3) {
  return "isVector3" in p ? p.clone() : new Vector3(p[0], p[1], p[2]);
}

export function lerp(a: V3, b: V3, t: number) {
  return vec(a).lerp(vec(b), t);
}

export function mid(a: V3, b: V3) {
  return lerp(a, b, 0.5);
}

/** `p` moved `dist` along the direction `dir` (normalised). */
export function offset(p: V3, dir: V3, dist: number) {
  return vec(p).addScaledVector(vec(dir).normalize(), dist);
}

/** `v` with its component along the unit vector `n` removed. */
export function flatten(v: Vector3, n: Vector3) {
  return v.clone().addScaledVector(n, -v.dot(n));
}

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);
const PARALLEL = 1e-8;

/** The unit secondary axis: `hint` made perpendicular to `d`, or null when they are parallel. */
function perpendicular(hint: Vector3, d: Vector3) {
  const s = flatten(hint, d);
  return s.lengthSq() > PARALLEL ? s.normalize() : null;
}

/**
 * Orientation whose local `axis` points along `dir`.
 *
 * Roll convention (pinned):
 * - axis "y" (bones, tubes, most geometry): local +Z leans toward `up`. Without `up`, the frame is a pure pitch
 *   of "X = creature's right": local +X stays as close to world -X as possible and +Z = X × dir. So in the
 *   mid-plane a bone pointing forward has +Z up, down → +Z forward, up → +Z back, backward → +Z down, and
 *   left/right widths always run along world X. Fallback when `dir` ∥ X (straight sideways): +Z = world up.
 * - axis "z" and "x" (look-at style): local +Y leans toward `up` (default world +Y). Fallback when `dir` ∥ up:
 *   axis "z" keeps local +X = world +X, axis "x" keeps local +Z = world +Z.
 * An explicit `up` parallel to `dir` falls back to the default rule. Deterministic for every input.
 */
export function aim(dir: V3, up?: V3, axis: Axis = "y") {
  const d = vec(dir).normalize();
  if (d.lengthSq() === 0) throw new Error("aim(): zero-length direction");
  let s = up ? perpendicular(vec(up).normalize(), d) : null;
  if (!s) {
    if (axis === "y") s = perpendicular(d.clone().cross(X), d) ?? perpendicular(Y, d)!;
    else if (axis === "z") s = perpendicular(Y, d) ?? d.clone().cross(X).normalize();
    else s = perpendicular(Y, d) ?? Z.clone().cross(d).normalize();
  }
  const basis = new Matrix4();
  if (axis === "y") basis.makeBasis(d.clone().cross(s), d, s);
  else if (axis === "z") basis.makeBasis(s.clone().cross(d), s, d);
  else basis.makeBasis(d, s, d.clone().cross(s));
  return new Quaternion().setFromRotationMatrix(basis);
}

/** Deterministic PRNG in [0, 1), same algorithm as the creature-lab kit. */
export function rng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
