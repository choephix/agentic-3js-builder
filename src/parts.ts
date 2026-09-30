// `part()`: one mesh placed in model space and parented under its bone, keeping its world transform. It returns a
// `Part`: a Frame (the geometry's origin and orientation, facing the axis it was aimed along) that follows its bone.
// A part placed on a smooth-skinned point (a bend in a tube, a hit on a bend) takes that point's weights and bends
// with the skin under it.
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { BufferGeometry, Mesh, Texture } from "three";
import { addMesh, makeMesh, resolveJoint, rigid, setWorld, skinMesh, weightsFor, writeWeights } from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint, vec } from "./math";
import type { Axis, DirectionInput, FrameInput, PointInput, V3 } from "./math";

const AXES: Record<Axis, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** A placed mesh as a Frame: `at`/`quat` are its geometry origin and orientation, `axis` its facing axis. */
export class Part extends Spot {
  constructor(
    readonly mesh: Mesh,
    at: Vector3,
    quat: Quaternion,
    weights: Weights,
    facing: V3,
  ) {
    super(at, quat, weights, facing);
  }
}

export type PartOptions = Tags & {
  /**
   * Owning bone (rigid). Default: the weights of `at` / `frame` when they came from something built (a bend in a
   * smooth tube gives two bones), else the nearest joint.
   */
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
  /**
   * An image mapped by the geometry's own UVs (three.js geometries have them), e.g. from `svg()`. A drawing in
   * colour shows its own colours; a drawing in greys (white to black) is tinted by `color`. Transparent pixels cut
   * the part away.
   */
  texture?: Texture;
  /** Faceted shading: every triangle shades as one flat face (the geometry's vertices are split, normals redone). */
  flat?: boolean;
};

export function part(ctx: Ctx, geometry: BufferGeometry, color: Fill, options: PartOptions = {}) {
  const placed = options.at ?? options.frame;
  const weights = placed
    ? weightsFor(ctx, options.bone, [options.at, options.frame], toPoint(placed))
    : rigid(resolveJoint(ctx, options.bone));
  const joint = weights[0][0];
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
  const blended = weights.length > 1;
  const shaped = options.flat
    ? geometry.index
      ? geometry.toNonIndexed()
      : geometry.clone()
    : blended
      ? geometry.clone()
      : geometry;
  if (options.flat) shaped.computeVertexNormals();
  const tint = options.texture?.userData.coloured && typeof color === "string" ? "#ffffff" : color;
  const mesh = makeMesh(ctx, shaped, tint, new Matrix4().compose(at, quat, scale), options.texture);
  setWorld(mesh, joint.object, at, quat, scale);
  addMesh(ctx, mesh, joint, options);
  if (blended)
    skinMesh(
      ctx,
      mesh,
      writeWeights(mesh.geometry, mesh.geometry.getAttribute("position").count, () => weights),
    );
  return new Part(mesh, at, quat, weights, AXES[options.axis ?? "y"]);
}
