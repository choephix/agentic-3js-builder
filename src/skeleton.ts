// Joints and chains: the only helpers that create bones. Also `pose()`, which re-poses a joint after building,
// and `Capture`, which keeps model-space data taken at build time valid after later poses.
import { Group, Matrix4, Quaternion, Vector3 } from "three";
import { boneFor, resolveJoint, setWorld } from "./context";
import type { Ctx, JointRef } from "./context";
import { Frame, Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint } from "./math";
import type { DirectionInput, FrameInput, PointInput } from "./math";
import { smoothPath, toPath } from "./path";
import type { Frames, Path, PathInput, Twist } from "./path";
import { sideOf, tuple } from "./rig";
import type { Role } from "./rig";

const JOINT_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

/** A bone: a Frame read live from the scene (its `axis` is the bone's +Y). `bone` is the joint itself. */
export class Joint extends Frame {
  constructor(
    readonly name: string,
    readonly object: Group,
    readonly parent: Joint | null,
  ) {
    super();
  }

  get at() {
    return new Vector3().setFromMatrixPosition(this.object.matrixWorld);
  }

  get quat() {
    return new Quaternion().setFromRotationMatrix(this.object.matrixWorld);
  }

  get bone(): Joint {
    return this;
  }
}

/**
 * Model-space data captured at one moment (a chain's curve, a sweep's rings, a fan's items). Data owned by a
 * joint follows that joint: `motion(joint)` maps from capture time to the joint's current pose, so handles stay
 * valid after `pose()` while the scene graph remains the one source of truth.
 */
export class Capture {
  private readonly inverse = new Map<Joint, Matrix4>();

  constructor(joints: Iterable<Joint>) {
    for (const joint of joints) this.inverse.set(joint, joint.object.matrixWorld.clone().invert());
  }

  /** Rigid transform from capture time to now for data owned by `joint`. */
  motion(joint: Joint) {
    const inverse = this.inverse.get(joint);
    if (!inverse) throw new Error(`Joint "${joint.name}" was not captured`);
    return joint.object.matrixWorld.clone().multiply(inverse);
  }
}

export type JointOptions = {
  /**
   * Omitted: the first joint is the root; later joints take the bone of `at` when it came from something built,
   * else the nearest joint.
   */
  parent?: JointRef;
  at: PointInput;
  /** Target point: bone +Y points at it. */
  aim?: PointInput;
  /** Direction: bone +Y points along it. */
  dir?: DirectionInput;
  /** Roll: local +Z leans toward `up` (see `aim()`). */
  up?: DirectionInput;
  group?: string;
  /** Rig answer key: what this joint is. "jaw" / "hinge" record the hinge axis (the bone's local X). */
  role?: Role;
};

export function createJoint(ctx: Ctx, name: string, options: JointOptions) {
  if (!JOINT_NAME.test(name)) throw new Error(`Joint name "${name}" must match ${JOINT_NAME}`);
  if (ctx.joints.has(name)) throw new Error(`Joint "${name}" already exists`);
  const at = toPoint(options.at);
  const parent = options.parent === undefined && !ctx.rootJoint ? null : boneFor(ctx, options.parent, [options.at], at);
  const direction = options.aim ? toPoint(options.aim).sub(at) : options.dir ? toDirection(options.dir) : null;
  const quat = direction ? aim(direction, options.up) : (parent?.quat ?? new Quaternion());
  const object = new Group();
  object.name = name;
  object.userData.joint = name;
  if (options.group) object.userData.group = options.group;
  setWorld(object, parent ? parent.object : ctx.root, at, quat);
  const joint = new Joint(name, object, parent);
  ctx.joints.set(name, joint);
  if (!parent) ctx.rootJoint = joint;
  const { role } = options;
  if (role)
    ctx.rig.push(() => ({
      joint: {
        name,
        role,
        side: sideOf([joint]),
        ...(role === "jaw" || role === "hinge" ? { hinge: tuple(joint.dir([1, 0, 0])) } : {}),
      },
    }));
  return joint;
}

/**
 * A rotation for `pose()`, in model space. About the joint's own position: a quaternion, `{ axis, deg }`
 * (right-hand rule; `axis` may be any direction input, e.g. a frame's facing axis), or the smallest swing that
 * points the bone (+Y) along `dir` or at `aim`. About any Line in space: `{ about, deg }` (a made-up hinge).
 */
export type PoseRotation =
  | Quaternion
  | { axis: DirectionInput; deg: number }
  | { about: FrameInput; deg: number }
  | { dir: DirectionInput }
  | { aim: PointInput };

/**
 * Rotate a joint, with everything under it: a new rest pose (open a jaw, raise a tail, fold a ring's joint group)
 * without rebuilding. Joints read the scene, frames are stored on their bone, and chains, sweeps and surfaces map
 * their build-time data through each joint's motion, so every handle stays valid.
 */
export function pose(ctx: Ctx, ref: JointRef, rotation: PoseRotation) {
  const joint = resolveJoint(ctx, ref);
  let pivot = joint.at;
  let delta: Quaternion;
  if ("isQuaternion" in rotation) delta = rotation.clone();
  else if ("about" in rotation) {
    const hinge = toFrame(rotation.about);
    pivot = hinge.at;
    delta = new Quaternion().setFromAxisAngle(hinge.axis, rotation.deg * DEG);
  } else if ("axis" in rotation)
    delta = new Quaternion().setFromAxisAngle(toDirection(rotation.axis).normalize(), rotation.deg * DEG);
  else {
    const to = "dir" in rotation ? toDirection(rotation.dir) : toPoint(rotation.aim).sub(pivot);
    delta = new Quaternion().setFromUnitVectors(joint.axis, to.normalize());
  }
  const at = joint.at.sub(pivot).applyQuaternion(delta).add(pivot);
  const world = new Matrix4().compose(at, delta.multiply(joint.quat), new Vector3(1, 1, 1));
  const { object } = joint;
  object
    .parent!.matrixWorld.clone()
    .invert()
    .multiply(world)
    .decompose(object.position, object.quaternion, object.scale);
  object.updateMatrixWorld(true);
  ctx.poses++;
  return joint;
}

export type ChainOptions = {
  /** Default: the bone of the path's start when it came from something built, else the nearest joint. */
  parent?: JointRef;
  /** Start roll: the chain's normal (joint +Z) leans toward `up`, then is parallel-transported along the path. */
  up?: DirectionInput;
  group?: string;
  /** Number of joints, evenly spaced by arc length. Default: one joint per knot span of the path. */
  count?: number;
  /** Joint names, by index from 0 (auto-riggers key on names: hipHL, kneeHL, hockHL). Default `${name}1..N`. */
  names?: readonly string[] | ((i: number) => string);
  /** Roll about the path after parallel transport: total degrees start→end, or `(t) => deg`. Joints and sweeps follow. */
  twist?: Twist;
  /** Rig answer key: what this chain is (a "leg" also records its ground contact). */
  role?: Role;
  /** Ground contact for the rig answer key (default for legs: the chain's tip, i.e. the `limb` target). */
  contact?: PointInput;
};

/** A frame on a chain: +Y = tangent, +Z = transported normal (the joints' +Z side), +X = binormal. */
export class ChainPoint extends Spot {
  constructor(
    readonly t: number,
    at: Vector3,
    quat: Quaternion,
    bone: Joint,
  ) {
    super(at, quat, bone);
  }

  get tangent() {
    return this.axis;
  }

  get normal() {
    return this.dir([0, 0, 1]);
  }

  get binormal() {
    return this.dir([1, 0, 0]);
  }
}

export class Chain {
  readonly capture: Capture;

  constructor(
    readonly name: string,
    /** The curve and frames as built; `at()` gives them in the current pose. */
    readonly path: Path,
    readonly frames: Frames,
    /** Arc-length t of each joint, plus 1 for the tip. */
    readonly ts: readonly number[],
    readonly joints: readonly Joint[],
  ) {
    this.capture = new Capture(joints);
  }

  get length() {
    return this.path.length;
  }

  /** The frame at arc-length t in the current pose (each span follows its joint), owned by that span's joint. */
  at(t: number) {
    const joint = this.jointAt(t);
    const motion = this.capture.motion(joint);
    const tangent = this.path.tangentAt(t);
    const normal = this.frames.normalAt(t);
    const basis = new Matrix4().makeBasis(tangent.clone().cross(normal), tangent, normal).premultiply(motion);
    const quat = new Quaternion().setFromRotationMatrix(basis);
    return new ChainPoint(t, this.path.at(t).applyMatrix4(motion), quat, joint);
  }

  /** The chain's curve in the current pose, with knots at the joints (a Path input: `along`, `membrane`, ...). */
  curve() {
    const count = Math.max(16, this.joints.length * 8);
    const pts = Array.from({ length: count + 1 }, (_, i) => this.at(i / count).at);
    return smoothPath(pts, null, { indices: this.ts.map((t) => Math.round(t * count)) }, false, this.joints[0]);
  }

  /** The joint whose current bone segment passes closest to `p`. */
  nearestJoint(p: PointInput) {
    const q = toPoint(p);
    const ends = [...this.joints.map((joint) => joint.at), this.at(1).at];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.joints.length; i++) {
      const seg = ends[i + 1].clone().sub(ends[i]);
      const f = Math.min(Math.max(q.clone().sub(ends[i]).dot(seg) / Math.max(seg.lengthSq(), 1e-12), 0), 1);
      const d = ends[i].clone().addScaledVector(seg, f).distanceToSquared(q);
      if (d < bestD) [best, bestD] = [i, d];
    }
    return this.joints[best];
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

export function createChain(ctx: Ctx, name: string, source: PathInput, options: ChainOptions) {
  const path = toPath(source);
  const parent = boneFor(ctx, options.parent, [path], path.at(0));
  const frames = path.frames(options.up, options.twist);
  const { names } = options;
  const nameOf = (i: number) =>
    names === undefined ? `${name}${i + 1}` : typeof names === "function" ? names(i) : names[i];
  const ts = options.count ? Array.from({ length: options.count + 1 }, (_, i) => i / options.count!) : path.knots;
  if (ts.length < 2) throw new Error(`Chain "${name}" needs at least one span`);
  if (Array.isArray(names) && names.length !== ts.length - 1)
    throw new Error(`Chain "${name}" has ${ts.length - 1} joints but ${names.length} names`);
  const joints: Joint[] = [];
  for (let i = 0; i < ts.length - 1; i++) {
    const at = path.at(ts[i]);
    joints.push(
      createJoint(ctx, nameOf(i), {
        parent: i === 0 ? parent : joints[i - 1],
        at,
        aim: path.at(ts[i + 1]),
        up: frames.normalAt(ts[i]),
        group: options.group,
      }),
    );
  }
  const chain = new Chain(name, path, frames, ts, joints);
  const { role } = options;
  if (role) {
    const contact = options.contact ? toPoint(options.contact) : role === "leg" ? path.at(1) : null;
    const last = joints[joints.length - 1];
    ctx.rig.push(() => ({
      chain: {
        name,
        role,
        side: sideOf(joints),
        joints: joints.map((joint) => joint.name),
        ...(contact ? { contact: tuple(contact.clone().applyMatrix4(chain.capture.motion(last))) } : {}),
      },
    }));
  }
  return chain;
}
