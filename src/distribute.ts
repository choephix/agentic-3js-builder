// Placement helpers: `ring()` around any Line (a bone, an eye's gaze, a horn, a hit normal, a made-up line), with
// optional group joints so many items cost a few bones; `along()` any chain, sweep or path. Callbacks get a Frame
// per item that carries the bone its geometry should default to.
import { Quaternion, Vector3 } from "three";
import { boneFor, rigid } from "./context";
import type { Ctx, JointRef, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, flatten, toFrame } from "./math";
import type { FrameInput } from "./math";
import { toPath } from "./path";
import type { PathInput } from "./path";
import { sideOf, tuple } from "./rig";
import type { Role } from "./rig";
import { Chain, createJoint } from "./skeleton";
import type { ChainPoint, Joint } from "./skeleton";
import { Sweep } from "./sweep";
import type { SweepPoint } from "./sweep";

export type RingOptions = {
  count: number;
  /** Distance of each item from the line (default 0: every item starts on the line). */
  radius?: number;
  /**
   * Angles about the line (right-hand rule). 0 = the direction closest to world up (world +Z when the line is
   * vertical). A full turn (the default, 0..360) spaces items evenly; a partial range puts items on both ends.
   */
  fromDeg?: number;
  toDeg?: number;
  /** Lean every item this many degrees toward the line's direction: a cone (quill rings, a swept-back frill). */
  tilt?: number;
  /**
   * Group joints: create this many joints, each owning a contiguous run of items (so 24 feathers cost 6 bones).
   * They sit `radius` out along their run's centre direction, +Y along it, +Z toward the line's direction, so
   * posing one by +deg about its local X lifts its run toward the line's direction. Needs `name`.
   */
  joints?: number;
  /** Group joint names: `${name}1..K`, or `names`. */
  name?: string;
  names?: readonly string[] | ((i: number) => string);
  /** Parent of the group joints. Default: the line's bone, else the joint nearest the line's point. */
  parent?: JointRef;
  group?: string;
  /** Rig answer key role for the group (default "fan"). */
  role?: Role;
};

/** A ring item: +Y = `outward`, +Z leaning toward the line's direction; on its group joint, else the line's weights. */
export class RingItem extends Spot {
  constructor(
    readonly i: number,
    /** 0..1 across the ring. */
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
  ) {
    super(at, quat, weights);
  }

  get outward() {
    return this.axis;
  }
}

/**
 * `count` frames on a circle around `line` (any Line: a joint's bone, a part's facing axis, a hit normal, a tube
 * point, `line(a, b)`, `frame(at, dir)`). With `joints`, rotating a few joints moves every item (the rigid-skinning
 * tradeoff: items on neighbouring joints separate in steps when they rotate apart; 3-5 items per joint read as
 * one fan for moderate poses, `joints: count` articulates every item).
 */
export function ring(ctx: Ctx, on: FrameInput, options: RingOptions, fn?: (item: RingItem) => void) {
  const line = toFrame(on);
  const center = line.at;
  const axis = line.axis;
  const { count } = options;
  const radius = options.radius ?? 0;
  const from = options.fromDeg ?? 0;
  const to = options.toDeg ?? from + 360;
  const full = Math.abs(to - from) >= 360 - 1e-9;
  const tilt = (options.tilt ?? 0) * DEG;
  let u = flatten(new Vector3(0, 1, 0), axis);
  if (u.lengthSq() < 1e-8) u = flatten(new Vector3(0, 0, 1), axis);
  u.normalize();
  const v = axis.clone().cross(u);
  const angleOf = (i: number) => (from + (to - from) * (full ? i / count : count === 1 ? 0.5 : i / (count - 1))) * DEG;
  const outwardAt = (angle: number) =>
    u
      .clone()
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(v, Math.sin(angle))
      .multiplyScalar(Math.cos(tilt))
      .addScaledVector(axis, Math.sin(tilt));

  const groups = options.joints ?? 0;
  if (groups && !(groups <= count && options.name))
    throw new Error("ring(): `joints` needs a `name` and at most `count` joints");
  const groupOf = (i: number) => Math.floor((i * groups) / count);
  const joints: Joint[] = [];
  if (groups) {
    const parent = boneFor(ctx, options.parent, [line], center);
    const { names } = options;
    for (let k = 0; k < groups; k++) {
      const run = Array.from({ length: count }, (_, i) => i).filter((i) => groupOf(i) === k);
      const dir = outwardAt(run.reduce((sum, i) => sum + angleOf(i), 0) / run.length);
      const name = names === undefined ? `${options.name}${k + 1}` : typeof names === "function" ? names(k) : names[k];
      joints.push(
        createJoint(ctx, name, {
          parent,
          at: center.clone().addScaledVector(dir, radius),
          dir,
          up: axis,
          group: options.group,
        }),
      );
    }
    const pivot = new Spot(center, aim(axis), rigid(parent));
    ctx.rig.push(() => ({
      ring: {
        name: options.name!,
        role: options.role ?? "fan",
        side: sideOf(joints),
        pivot: tuple(pivot.at),
        axis: tuple(pivot.axis),
        joints: joints.map((joint, k) => ({
          joint: joint.name,
          items: Array.from({ length: count }, (_, i) => i).filter((i) => groupOf(i) === k).length,
        })),
      },
    }));
  }

  const items = Array.from({ length: count }, (_, i) => {
    const outward = outwardAt(angleOf(i));
    const t = full ? i / count : count === 1 ? 0.5 : i / (count - 1);
    const weights = groups ? rigid(joints[groupOf(i)]) : line.weights;
    return new RingItem(i, t, center.clone().addScaledVector(outward, radius), aim(outward, axis), weights);
  });
  if (fn) items.forEach(fn);
  return { joints, items };
}

/** A frame on a plain path: +Y = tangent, +Z = the transported normal; takes the path's weights (if any). */
export class PathPoint extends Spot {
  constructor(
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
  ) {
    super(at, quat, weights);
  }

  get tangent() {
    return this.axis;
  }
}

type AlongOptions = { from?: number; to?: number };

/**
 * `count` evenly spaced frames at the centres of equal parts of [from, to] (default 0..1): a Chain gives
 * `chain.at(t)`, a Sweep `sweep.at(t)` (on the dorsal surface), any other path input a PathPoint.
 */
export function along(source: Chain, count: number, fn: (at: ChainPoint) => void, options?: AlongOptions): ChainPoint[];
export function along(source: Sweep, count: number, fn: (at: SweepPoint) => void, options?: AlongOptions): SweepPoint[];
export function along(
  source: PathInput,
  count: number,
  fn: (at: PathPoint) => void,
  options?: AlongOptions,
): PathPoint[];
export function along(
  source: Chain | Sweep | PathInput,
  count: number,
  fn: (at: never) => void,
  options: AlongOptions = {},
) {
  const from = options.from ?? 0;
  const to = options.to ?? 1;
  const path = source instanceof Chain || source instanceof Sweep ? null : toPath(source);
  const frames = path?.frames();
  const items = Array.from({ length: count }, (_, i) => {
    const t = from + ((to - from) * (i + 0.5)) / count;
    if (!path) return (source as Chain | Sweep).at(t);
    const tangent = path.tangentAt(t);
    return new PathPoint(t, path.at(t), aim(tangent, frames!.normalAt(t)), path.weights ?? []);
  });
  items.forEach(fn as (at: unknown) => void);
  return items;
}
