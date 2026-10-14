// `part()`: one mesh placed in model space and parented under its bone, keeping its world transform. It returns a
// `Part`: a Frame (the geometry's origin and orientation, facing the axis it was aimed along) that follows its bone.
// A part placed on a smooth-skinned point (a bend in a tube, a hit on a bend) takes that point's weights and bends
// with the skin under it.
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { BufferGeometry, Mesh, Texture } from "three";
import {
  addMesh,
  describe,
  fillFor,
  makeMesh,
  resolveJoint,
  rigid,
  setWorld,
  skinMesh,
  weightsFor,
  writeWeights,
} from "./context";
import type { Ctx, Fill, JointRef, Tags, Weights } from "./context";
import { Spot } from "./frame";
import { aim, DEG, toDirection, toFrame, toPoint, vec } from "./math";
import type { Axis, DirectionInput, FrameInput, PointInput, V3 } from "./math";

const AXES: Record<Axis, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/**
 * A placed mesh as a Frame: `at`/`quat` are its geometry origin and orientation, `axis` its facing axis.
 * `position`, `rotation` and `scale` are the mesh's own, relative to its bone, as in three.js; the frame keeps the
 * placement the part was built with.
 */
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

  /** The mesh's position relative to its bone (three.js), not model space: that is `at`. */
  get position() {
    return this.mesh.position;
  }

  /** The mesh's rotation relative to its bone (three.js, radians). */
  get rotation() {
    return this.mesh.rotation;
  }

  /** The mesh's scale (three.js). */
  get scale() {
    return this.mesh.scale;
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

/** `part`'s one-object form: the geometry and colour inside the options. */
export type PartSpec = PartOptions & { geometry: BufferGeometry; color?: Fill };

/**
 * `part`'s arguments in either form, `(geometry, color, options)` or `({ geometry, color, ...options })`, as
 * `[geometry, color, options]`.
 */
export function partArgs(
  first: BufferGeometry | PartSpec,
  color?: Fill,
  options: PartOptions = {},
): [BufferGeometry, Fill | undefined, PartOptions] {
  if (first && !(first as BufferGeometry).isBufferGeometry && typeof first === "object" && "geometry" in first) {
    const { geometry, color: fill, ...rest } = first;
    return [geometry, fill, { ...options, ...rest }];
  }
  return [first as BufferGeometry, color, options];
}

export function part(ctx: Ctx, geometry: BufferGeometry, color: Fill | undefined, options: PartOptions = {}) {
  if (!geometry?.isBufferGeometry)
    throw new Error(
      `part(): takes (geometry, color, options) or ({ geometry, color, ...options }); got ${describe(geometry)} as the geometry`,
    );
  const placed = options.at ?? options.frame;
  const weights = placed
    ? weightsFor(ctx, options.bone, [options.at, options.frame], toPoint(placed, "part()"), "part(): bone")
    : rigid(resolveJoint(ctx, options.bone, "part(): bone"));
  const joint = weights[0][0];
  const at = placed ? toPoint(placed, "part()") : joint.at;
  const fill = fillFor(ctx, "part()", color, () => at);
  let quat = new Quaternion();
  if (options.quat) quat = options.quat.clone();
  else if (options.aim || options.dir) {
    const direction = options.aim
      ? toPoint(options.aim, "part(): aim").sub(at)
      : toDirection(options.dir!, "part(): dir");
    if (direction.lengthSq() === 0)
      throw new Error(
        options.aim
          ? "part(): aim takes a target point away from the part's position; got the position itself"
          : `part(): dir takes a non-zero direction [x, y, z]; got ${JSON.stringify(direction.toArray())}`,
      );
    quat = aim(direction, options.up, options.axis);
  } else if (options.rotation) {
    const [x, y, z] = vec(options.rotation).multiplyScalar(DEG).toArray();
    quat.setFromEuler(new Euler(x, y, z));
  } else if (options.frame) quat = toFrame(options.frame, "part(): frame").quat;
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
  const tint = options.texture?.userData.coloured && typeof fill === "string" ? "#ffffff" : fill;
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
