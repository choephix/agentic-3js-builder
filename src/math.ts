// Model-space vector helpers, the geometric input kinds every helper accepts (and their coercions), and the one
// orientation primitive, `aim()`.
import { Box3, Matrix4, Quaternion, Vector3 } from "three";
import type { Mesh } from "three";
import { Spot } from "./frame";
import type { Frame } from "./frame";

/**
 * A literal model-space point or direction: `[x, y, z]` or a `THREE.Vector3`. Any number array passes the type check
 * (plain `number[]` data from variables, object fields and `.map` needs no cast); it must hold exactly 3 numbers.
 */
export type V3 = Vector3 | readonly number[];
export type Axis = "x" | "y" | "z";
/** Something with a start frame: a Sweep (and so every rod, capsule, spike, horn...). */
export type HasFrame = { readonly frame: Frame };
/** A Frame (point + orientation + facing axis + owning bone), or something with one. Lines are frames too. */
export type FrameInput = Frame | HasFrame;
/** A point: literal, a raw mesh (its bounding-box centre), or any Frame's position. */
export type PointInput = V3 | Mesh | FrameInput;
/** A direction: literal, or any Frame's facing axis. */
export type DirectionInput = V3 | FrameInput;

export const DEG = Math.PI / 180;

/** A fresh `Vector3` copy of `p` (never aliases the input). `call` names the caller when a literal is malformed. */
export function vec(p: V3, call = "vec()") {
  if ("isVector3" in p) return p.clone();
  if (p.length !== 3 || !p.every(Number.isFinite))
    throw new Error(`${call}: a point or direction is [x, y, z] (3 numbers), got ${JSON.stringify(p)}`);
  return new Vector3(p[0], p[1], p[2]);
}

/** A fresh unit vector for an axis letter or a direction. */
export function axisVector(a: Axis | V3, call: string) {
  if (typeof a !== "string") return vec(a, call).normalize();
  if (a !== "x" && a !== "y" && a !== "z") throw new Error(`${call}: axis is "x", "y", "z" or [x, y, z], got "${a}"`);
  return new Vector3(a === "x" ? 1 : 0, a === "y" ? 1 : 0, a === "z" ? 1 : 0);
}

/**
 * The Frame of a Frame input. A plain `{ at, axis }` or `{ at, dir }` object (optionally with `up`) is read as the
 * line it spells, `frame(at, axis, up)`. `call` names the caller in errors.
 */
export function toFrame(x: FrameInput, call = "toFrame()"): Frame {
  const object = x as unknown as Record<string, unknown> | null;
  if (object && typeof object === "object") {
    if (typeof object.local === "function" && "quat" in object) return x as Frame;
    if ("frame" in object) return toFrame(object.frame as FrameInput, call);
    const facing = object.axis ?? object.dir;
    if (object.at !== undefined && typeof object.at !== "function" && facing !== undefined) {
      const d = toDirection(facing as DirectionInput, call);
      if (d.lengthSq() === 0) throw new Error(`${call}: the line's direction is zero-length`);
      const up = object.up === undefined ? undefined : toDirection(object.up as DirectionInput, call);
      return new Spot(toPoint(object.at as PointInput, call), aim(d, up), []);
    }
  }
  throw new Error(
    `${call}: takes a Frame (a joint, part, hit, sweep, chain or tube point, ring item, frame() or line()) or { at, axis }; got ${describeInput(x)}`,
  );
}

/** A short description of an input for errors. */
function describeInput(x: unknown) {
  if (x === null || x === undefined) return String(x);
  if (Array.isArray(x)) return `an array of ${x.length}`;
  if (typeof x !== "object") return `${typeof x} ${String(x)}`;
  const keys = Object.keys(x);
  return keys.length ? `an object with ${keys.join(", ")}` : "an empty object";
}

/** A fresh model-space point from any point input. `call` names the caller when a literal is malformed. */
export function toPoint(x: PointInput, call = "toPoint()") {
  if (!x || typeof x !== "object")
    throw new Error(`${call}: a point is [x, y, z], a Vector3 or a Frame; got ${describeInput(x)}`);
  if (Array.isArray(x) || "isVector3" in x) return vec(x as V3, call);
  if ("isMesh" in x) return new Box3().setFromObject(x as Mesh).getCenter(new Vector3());
  const object = x as unknown as Record<string, unknown>;
  const plain = typeof object.local !== "function" && !("frame" in object);
  if (plain && object.at !== undefined && typeof object.at !== "function")
    return toPoint(object.at as PointInput, call);
  if (plain) throw new Error(`${call}: a point is [x, y, z], a Vector3 or a Frame; got ${describeInput(x)}`);
  return toFrame(x as FrameInput, call).at;
}

/** A fresh direction (not normalised) from any direction input: literal, or a Frame's facing axis. */
export function toDirection(x: DirectionInput, call = "toDirection()") {
  if (!x || typeof x !== "object")
    throw new Error(`${call}: a direction is [x, y, z], a Vector3 or a Frame; got ${describeInput(x)}`);
  return Array.isArray(x) || "isVector3" in x ? vec(x as V3, call) : toFrame(x as FrameInput, call).axis;
}

export function lerp(a: PointInput, b: PointInput, t: number) {
  return toPoint(a, "lerp()").lerp(toPoint(b, "lerp()"), t);
}

export function mid(a: PointInput, b: PointInput) {
  return toPoint(a, "mid()").lerp(toPoint(b, "mid()"), 0.5);
}

/** `p` moved `dist` along the direction `dir` (normalised). */
export function offset(p: PointInput, dir: DirectionInput, dist: number) {
  return toPoint(p, "offset()").addScaledVector(toDirection(dir, "offset()").normalize(), dist);
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
export function aim(dir: DirectionInput, up?: DirectionInput, axis: Axis = "y") {
  const d = toDirection(dir, "aim()").normalize();
  if (d.lengthSq() === 0) throw new Error("aim(): zero-length direction");
  let s = up ? perpendicular(toDirection(up, "aim()").normalize(), d) : null;
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
