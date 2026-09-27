// `part()`: one mesh placed in model space and parented under its bone, keeping its world transform.
import { Euler, Mesh, Quaternion, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { addMesh, resolveJoint, setWorld } from "./context";
import type { Ctx, JointRef, Tags } from "./context";
import { aim, DEG, vec } from "./math";
import type { Axis, V3 } from "./math";

export type PartOptions = Tags & {
  /** Owning bone; omitted = the root joint. */
  bone?: JointRef;
  /** Model-space position of the geometry origin; omitted = the bone's position. */
  at?: V3;
  /** Orientation, first match wins: `quat`, then `aim` (target point) / `dir`, then `rotation`, else world axes. */
  quat?: Quaternion;
  aim?: V3;
  dir?: V3;
  up?: V3;
  /** Geometry axis pointed by `aim`/`dir` (default "y", the axis of three's cylinders and cones). */
  axis?: Axis;
  /** Euler XYZ in degrees, model space. */
  rotation?: V3;
  scale?: number | V3;
};

export function part(ctx: Ctx, geometry: BufferGeometry, color: string, options: PartOptions = {}) {
  const joint = resolveJoint(ctx, options.bone);
  const at = options.at ? vec(options.at) : joint.at;
  let quat = new Quaternion();
  if (options.quat) quat = options.quat.clone();
  else if (options.aim || options.dir)
    quat = aim(options.aim ? vec(options.aim).sub(at) : vec(options.dir!), options.up, options.axis);
  else if (options.rotation) {
    const [x, y, z] = vec(options.rotation).multiplyScalar(DEG).toArray();
    quat.setFromEuler(new Euler(x, y, z));
  }
  const scale =
    options.scale === undefined
      ? new Vector3(1, 1, 1)
      : typeof options.scale === "number"
        ? new Vector3().setScalar(options.scale)
        : vec(options.scale);
  const mesh = new Mesh(geometry, ctx.material(color));
  setWorld(mesh, joint.object, at, quat, scale);
  addMesh(ctx, mesh, joint, options);
  return mesh;
}
