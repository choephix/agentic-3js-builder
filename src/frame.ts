// Frames: a point with a full orientation, a facing axis and the bone weights it moves with. Joints, parts, sweeps
// (at their start), regions, surface hits, chain and tube points, ring and along items are all frames, and so is
// anything made with `frame()` or `line()`. A Line is a frame read as "point + facing axis".
import { Quaternion, Vector3 } from "three";
import { Capture, weightsOf } from "./context";
import type { Weights } from "./context";
import { aim, toPoint, vec } from "./math";
import type { DirectionInput, PointInput, V3 } from "./math";

const Y = new Vector3(0, 1, 0);

export abstract class Frame {
  /** Model-space position. */
  abstract get at(): Vector3;
  /** Model-space orientation. */
  abstract get quat(): Quaternion;
  /** The bones this frame moves with, heaviest first: one for a rigid point, two on a smooth bend, none for frames made from nothing. */
  abstract get weights(): Weights;

  /** The heaviest bone; null for frames made from nothing. */
  get bone() {
    return this.weights[0]?.[0] ?? null;
  }

  /** The facing direction (unit): local +Y, unless the frame was aimed along another axis. */
  get axis() {
    return this.dir(Y);
  }

  /** A point given in this frame (meters) → model space. */
  local(p: V3) {
    return vec(p).applyQuaternion(this.quat).add(this.at);
  }

  /** A vector given in this frame → model space (length kept). */
  dir(v: V3) {
    return vec(v).applyQuaternion(this.quat);
  }

  /**
   * This frame moved to a point given in its own coordinates, keeping orientation, facing and weights: a point
   * derived from a frame that still carries the frame's bones (`item.moved([0, 0.12, 0])` = 12 cm out along +Y).
   */
  moved(p: V3) {
    const quat = this.quat;
    return new Spot(this.local(p), quat, this.weights, this.axis.applyQuaternion(quat.invert()));
  }
}

/**
 * A frame stored as a bind transform plus weights, so it follows every later `pose()` of its bones (blended when it
 * has several). Without weights it is fixed in model space. `facing` is the local axis reported as `axis`.
 * `at`/`quat` are given in `capture`'s pose (default: now).
 */
export class Spot extends Frame {
  private readonly bindAt: Vector3;
  private readonly bindQuat: Quaternion;
  private readonly capture: Capture;

  constructor(
    at: Vector3,
    quat: Quaternion,
    readonly weights: Weights = [],
    private readonly facing: V3 = Y,
    capture?: Capture,
  ) {
    super();
    this.bindAt = at.clone();
    this.bindQuat = quat.clone();
    this.capture = capture ?? new Capture(weights.map(([joint]) => joint));
  }

  get at() {
    return this.bindAt.clone().applyMatrix4(this.capture.blend(this.weights));
  }

  get quat() {
    return this.capture.turn(this.weights).multiply(this.bindQuat);
  }

  get axis() {
    return this.dir(this.facing).normalize();
  }
}

/**
 * A frame from nothing: at `at`, facing `dir`, roll from `up` (see `aim`). It takes `at`'s weights when `at` came
 * from something built.
 */
export function frame(at: PointInput, dir: DirectionInput, up?: DirectionInput) {
  return new Spot(toPoint(at), aim(dir, up), weightsOf(at) ?? []);
}

/** A line from `a` to `b`: a frame at `a` facing `b`, with `length` and `end`. Takes `a`'s weights, else `b`'s. */
export class Segment extends Spot {
  constructor(
    a: Vector3,
    b: Vector3,
    weights: Weights,
    readonly length = a.distanceTo(b),
  ) {
    super(a, aim(b.clone().sub(a)), weights);
  }

  /** The far point, in the current pose. */
  get end() {
    return this.at.addScaledVector(this.axis, this.length);
  }
}

export function line(a: PointInput, b: PointInput) {
  return new Segment(toPoint(a), toPoint(b), weightsOf(a) ?? weightsOf(b) ?? []);
}
