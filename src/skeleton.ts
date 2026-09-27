// Joints and chains: the only helpers that create bones.
import { Group, Quaternion, Vector3 } from "three";
import { resolveJoint, setWorld } from "./context";
import type { Ctx, JointRef } from "./context";
import { aim, vec } from "./math";
import type { V3 } from "./math";
import { toPath } from "./path";
import type { Frames, Path, PathLike } from "./path";

const JOINT_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

export class Joint {
  constructor(
    readonly name: string,
    readonly object: Group,
    readonly parent: Joint | null,
  ) {}

  /** World (model-space) position. */
  get at() {
    return new Vector3().setFromMatrixPosition(this.object.matrixWorld);
  }

  /** World orientation. */
  get quat() {
    return new Quaternion().setFromRotationMatrix(this.object.matrixWorld);
  }

  /** A point given in this joint's frame (bone +Y along the bone), in model space. */
  local(p: V3) {
    return vec(p).applyMatrix4(this.object.matrixWorld);
  }

  /** A vector given in this joint's frame, rotated into model space (length kept). */
  dir(v: V3) {
    return vec(v).applyQuaternion(this.quat);
  }
}

export type JointOptions = {
  /** Omitted = this is the root joint (only one allowed). */
  parent?: JointRef;
  at: V3;
  /** Target point: bone +Y points at it. */
  aim?: V3;
  /** Direction: bone +Y points along it. */
  dir?: V3;
  /** Roll: local +Z leans toward `up` (see `aim()`). */
  up?: V3;
  group?: string;
};

export function createJoint(ctx: Ctx, name: string, options: JointOptions) {
  if (!JOINT_NAME.test(name)) throw new Error(`Joint name "${name}" must match ${JOINT_NAME}`);
  if (ctx.joints.has(name)) throw new Error(`Joint "${name}" already exists`);
  const parent = options.parent === undefined ? null : resolveJoint(ctx, options.parent);
  if (!parent && ctx.rootJoint)
    throw new Error(`Joint "${name}" has no parent but root joint "${ctx.rootJoint.name}" already exists`);
  const at = vec(options.at);
  const direction = options.aim ? vec(options.aim).sub(at) : options.dir ? vec(options.dir) : null;
  const quat = direction ? aim(direction, options.up) : (parent?.quat ?? new Quaternion());
  const object = new Group();
  object.name = name;
  object.userData.joint = name;
  if (options.group) object.userData.group = options.group;
  setWorld(object, parent ? parent.object : ctx.root, at, quat);
  const joint = new Joint(name, object, parent);
  ctx.joints.set(name, joint);
  if (!parent) ctx.rootJoint = joint;
  return joint;
}

export type ChainOptions = {
  parent: JointRef;
  /** Start roll: the chain's normal (joint +Z) leans toward `up`, then is parallel-transported along the path. */
  up?: V3;
  group?: string;
  /** Number of joints, evenly spaced by arc length. Default: one joint per knot span of the path. */
  count?: number;
};

/** A point on a chain's path with its transported frame and owning joint. */
export type ChainPoint = { t: number; p: Vector3; tangent: Vector3; normal: Vector3; binormal: Vector3; joint: Joint };

export class Chain {
  constructor(
    readonly name: string,
    readonly path: Path,
    readonly frames: Frames,
    /** Arc-length t of each joint, plus 1 for the tip. */
    readonly ts: readonly number[],
    readonly joints: readonly Joint[],
  ) {}

  get length() {
    return this.path.length;
  }

  /** Point, tangent, transported normal (= joint +Z side), binormal (tangent × normal) and joint at arc-length t. */
  at(t: number): ChainPoint {
    const tangent = this.path.tangentAt(t);
    const normal = this.frames.normalAt(t);
    return { t, p: this.path.at(t), tangent, normal, binormal: tangent.clone().cross(normal), joint: this.jointAt(t) };
  }

  /** The joint whose span contains t. */
  jointAt(t: number) {
    let i = 0;
    while (i < this.joints.length - 1 && this.ts[i + 1] <= t) i++;
    return this.joints[i];
  }

  /** [t0, t1] of joint i's span. */
  span(i: number) {
    return [this.ts[i], this.ts[i + 1]] as const;
  }
}

export function createChain(ctx: Ctx, name: string, source: PathLike, options: ChainOptions) {
  const path = toPath(source);
  const frames = path.frames(options.up);
  const ts = options.count ? Array.from({ length: options.count + 1 }, (_, i) => i / options.count!) : path.knots;
  if (ts.length < 2) throw new Error(`Chain "${name}" needs at least one span`);
  const joints: Joint[] = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const at = path.at(ts[i]);
    joints.push(
      createJoint(ctx, `${name}${i + 1}`, {
        parent: i === 0 ? options.parent : joints[i - 1],
        at,
        aim: path.at(ts[i + 1]),
        up: frames.normalAt(ts[i]),
        group: options.group,
      }),
    );
  }
  return new Chain(name, path, frames, ts, joints);
}
