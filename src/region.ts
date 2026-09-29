// `region()`: a movable, scalable authoring frame (not a scene node) for heads, props and other sub-assemblies.
// A region is a Frame; literal points and directions given to its methods are in region units, anything built
// (joints, parts, hits...) is already in model space and passes through.
import { Euler, Quaternion } from "three";
import type { BufferGeometry } from "three";
import { resolveJoint, rigid, weightsOf } from "./context";
import type { Ctx, Fill, JointRef } from "./context";
import { Spot } from "./frame";
import { DEG, toDirection, toPoint, vec } from "./math";
import type { DirectionInput, PointInput, V3 } from "./math";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import { createJoint } from "./skeleton";
import type { JointOptions } from "./skeleton";

/** `bone` (default: the weights of `at` when it came from something built): the region rides on that joint. */
export type RegionOptions = { at: PointInput; scale?: number; quat?: Quaternion; bone?: JointRef };

const literal = (x: PointInput | DirectionInput): x is V3 => Array.isArray(x) || "isVector3" in x;

export class Region extends Spot {
  readonly scale: number;

  constructor(
    private readonly ctx: Ctx,
    options: RegionOptions,
  ) {
    const weights = options.bone === undefined ? (weightsOf(options.at) ?? []) : rigid(resolveJoint(ctx, options.bone));
    super(toPoint(options.at), options.quat?.clone() ?? new Quaternion(), weights);
    this.scale = options.scale ?? 1;
  }

  /** Region-local point (scaled, rotated, moved) → model space. Non-literal points pass through. */
  p(local: PointInput) {
    return literal(local) ? this.local(vec(local).multiplyScalar(this.scale)) : toPoint(local);
  }

  /** Region-local direction (rotated) → model space. Non-literal directions pass through. */
  d(dir: DirectionInput) {
    return literal(dir) ? this.dir(dir) : toDirection(dir);
  }

  /** Region-local length → model space. */
  s(length: number) {
    return length * this.scale;
  }

  /** Region-local orientation → model space. */
  q(local = new Quaternion()) {
    return this.quat.multiply(local);
  }

  /** `b.part` with every option in region units; the region scale is baked into the mesh scale. */
  part(geometry: BufferGeometry, color: Fill, options: PartOptions = {}) {
    let quat: Quaternion | undefined;
    if (options.quat) quat = this.q(options.quat);
    else if (!options.aim && !options.dir && !options.frame) {
      const [x, y, z] = vec(options.rotation ?? [0, 0, 0])
        .multiplyScalar(DEG)
        .toArray();
      quat = this.q(new Quaternion().setFromEuler(new Euler(x, y, z)));
    }
    const scale =
      options.scale === undefined
        ? this.scale
        : typeof options.scale === "number"
          ? options.scale * this.scale
          : vec(options.scale).multiplyScalar(this.scale);
    // Literal positions take the region's weights (it is passed as the frame); built inputs keep their own.
    const own = !options.frame && (!options.at || literal(options.at));
    return part(this.ctx, geometry, color, {
      ...options,
      frame: own ? this : options.frame,
      at:
        options.at && literal(options.at) ? this.p(options.at) : (options.at ?? (options.frame ? undefined : this.at)),
      aim: options.aim && this.p(options.aim),
      dir: options.dir && this.d(options.dir),
      up: options.up && this.d(options.up),
      quat,
      rotation: undefined,
      scale,
    });
  }

  /** `b.joint` with positions/directions in region units. Joints are moved and rotated, never scaled. */
  joint(name: string, options: JointOptions) {
    return createJoint(this.ctx, name, {
      ...options,
      at: this.p(options.at),
      aim: options.aim && this.p(options.aim),
      dir: options.dir && this.d(options.dir),
      up: options.up && this.d(options.up),
    });
  }
}
