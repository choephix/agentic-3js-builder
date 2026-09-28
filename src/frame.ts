// Frames: a point with a full orientation, a facing axis and the bone it belongs to. Joints, parts, sweeps (at
// their start), regions, surface hits, chain and tube points, ring and along items are all frames, and so is
// anything made with `frame()` or `line()`. A Line is a frame read as "point + facing axis".
import { Quaternion, Vector3 } from "three";
import { aim, toPoint, vec } from "./math";
import type { DirectionInput, PointInput, V3 } from "./math";
import type { Joint } from "./skeleton";

const Y = new Vector3(0, 1, 0);

export abstract class Frame {
  /** Model-space position. */
  abstract get at(): Vector3;
  /** Model-space orientation. */
  abstract get quat(): Quaternion;
  /** The joint this frame moves with; null for frames made from nothing. */
  abstract get bone(): Joint | null;

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
   * This frame moved to a point given in its own coordinates, keeping orientation, facing and bone: a point derived
   * from a frame that still carries the frame's bone (`item.moved([0, 0.12, 0])` = 12 cm out along +Y).
   */
  moved(p: V3) {
    const quat = this.quat;
    return new Spot(this.local(p), quat, this.bone, this.axis.applyQuaternion(quat.invert()));
  }
}

/**
 * A frame stored relative to its bone, so it follows every later `pose()` of that bone. Without a bone it is
 * fixed in model space. `facing` is the local axis reported as `axis`.
 */
export class Spot extends Frame {
  private readonly localAt: Vector3;
  private readonly localQuat: Quaternion;

  constructor(
    at: Vector3,
    quat: Quaternion,
    readonly bone: Joint | null,
    private readonly facing: V3 = Y,
  ) {
    super();
    this.localAt = bone ? at.clone().applyMatrix4(bone.object.matrixWorld.clone().invert()) : at.clone();
    this.localQuat = bone ? bone.quat.invert().multiply(quat) : quat.clone();
  }

  get at() {
    return this.bone ? this.localAt.clone().applyMatrix4(this.bone.object.matrixWorld) : this.localAt.clone();
  }

  get quat() {
    return this.bone ? this.bone.quat.multiply(this.localQuat) : this.localQuat.clone();
  }

  get axis() {
    return this.dir(this.facing).normalize();
  }
}

/** The bone of an input that came from something built (a frame, a sweep, a path made from frames), else null. */
export function ownerOf(x: unknown): Joint | null {
  if (!x || typeof x !== "object") return null;
  if ("bone" in x) return (x as { bone: Joint | null }).bone;
  if ("frame" in x) return (x as { frame: Frame }).frame.bone;
  return null;
}

/**
 * A frame from nothing: at `at`, facing `dir`, roll from `up` (see `aim`). It belongs to `at`'s bone when `at`
 * came from something built.
 */
export function frame(at: PointInput, dir: DirectionInput, up?: DirectionInput) {
  return new Spot(toPoint(at), aim(dir, up), ownerOf(at));
}

/** A line from `a` to `b`: a frame at `a` facing `b`, with `length` and `end`. Owned by `a`'s bone, else `b`'s. */
export class Segment extends Spot {
  constructor(
    a: Vector3,
    b: Vector3,
    bone: Joint | null,
    readonly length = a.distanceTo(b),
  ) {
    super(a, aim(b.clone().sub(a)), bone);
  }

  /** The far point, in the current pose. */
  get end() {
    return this.at.addScaledVector(this.axis, this.length);
  }
}

export function line(a: PointInput, b: PointInput) {
  return new Segment(toPoint(a), toPoint(b), ownerOf(a) ?? ownerOf(b));
}
