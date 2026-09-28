// `part()`: one mesh placed in model space and parented under its bone, keeping its world transform. It returns a
// `Part`: a Frame (the geometry's origin and orientation, facing the axis it was aimed along) that follows its bone.
import { Euler, Mesh, Quaternion, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { addMesh, boneFor, resolveJoint, setWorld } from "./context";
import type { Ctx, JointRef, Tags } from "./context";
import { Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint, vec } from "./math";
import type { Axis, DirectionInput, FrameInput, PointInput, V3 } from "./math";
import type { Joint } from "./skeleton";

const AXES: Record<Axis, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** A placed mesh as a Frame: `at`/`quat` are its geometry origin and orientation, `axis` its facing axis. */
export class Part extends Spot {
  constructor(
    readonly mesh: Mesh,
    at: Vector3,
    quat: Quaternion,
    bone: Joint,
    facing: V3,
  ) {
    super(at, quat, bone, facing);
  }
}

export type PartOptions = Tags & {
  /** Owning bone. Default: the bone of `frame` / `at` when they came from something built, else the nearest joint. */
  bone?: JointRef;
  /** Place the geometry on a frame: its position, and its orientation unless another orientation option is given. */
  frame?: FrameInput;
  /** Position of the geometry origin; default `frame`'s position, else the bone's. */
  at?: PointInput;
  /** Orientation, first match wins: `quat`, then `aim` (target point) / `dir`, then `rotation`, then `frame`. */
  quat?: Quaternion;
  aim?: PointInput;
  dir?: DirectionInput;
  up?: DirectionInput;
  /** Geometry axis pointed by `aim`/`dir`, and reported as the part's facing `axis` (default "y"). */
  axis?: Axis;
  /** Euler XYZ in degrees, model space. */
  rotation?: V3;
  scale?: number | V3;
};

export function part(ctx: Ctx, geometry: BufferGeometry, color: string, options: PartOptions = {}) {
  const placed = options.at ?? options.frame;
  const joint = placed
    ? boneFor(ctx, options.bone, [options.at, options.frame], toPoint(placed))
    : resolveJoint(ctx, options.bone);
  const at = placed ? toPoint(placed) : joint.at;
  let quat = new Quaternion();
  if (options.quat) quat = options.quat.clone();
  else if (options.aim || options.dir)
    quat = aim(options.aim ? toPoint(options.aim).sub(at) : toDirection(options.dir!), options.up, options.axis);
  else if (options.rotation) {
    const [x, y, z] = vec(options.rotation).multiplyScalar(DEG).toArray();
    quat.setFromEuler(new Euler(x, y, z));
  } else if (options.frame) quat = toFrame(options.frame).quat;
  const scale =
    options.scale === undefined
      ? new Vector3(1, 1, 1)
      : typeof options.scale === "number"
        ? new Vector3().setScalar(options.scale)
        : vec(options.scale);
  const mesh = new Mesh(geometry, ctx.material(color));
  setWorld(mesh, joint.object, at, quat, scale);
  addMesh(ctx, mesh, joint, options);
  return new Part(mesh, at, quat, joint, AXES[options.axis ?? "y"]);
}
