// `region()`: a movable, scalable authoring frame (not a scene node) for heads, props and other sub-assemblies.
import { Euler, Quaternion, Vector3 } from "three";
import type { BufferGeometry } from "three";
import { resolveJoint } from "./context";
import type { Ctx, JointRef } from "./context";
import { DEG, vec } from "./math";
import type { V3 } from "./math";
import { part } from "./parts";
import type { PartOptions } from "./parts";
import { Capture, createJoint } from "./skeleton";
import type { Joint, JointOptions } from "./skeleton";

/** `bone`: the region rides on that joint, following its later `pose()` calls. */
export type RegionOptions = { at: V3; scale?: number; quat?: Quaternion; bone?: JointRef };

export class Region {
  private readonly origin: Vector3;
  readonly scale: number;
  private readonly rest: Quaternion;
  private readonly bone: Joint | null;
  private readonly capture: Capture | null;

  constructor(
    private readonly ctx: Ctx,
    options: RegionOptions,
  ) {
    this.origin = vec(options.at);
    this.scale = options.scale ?? 1;
    this.rest = options.quat?.clone() ?? new Quaternion();
    this.bone = options.bone === undefined ? null : resolveJoint(ctx, options.bone);
    this.capture = this.bone && new Capture([this.bone]);
  }

  /** The bone's motion since the region was made (identity without a bone). */
  private motion() {
    return this.capture?.motion(this.bone!);
  }

  /** Current region orientation in model space. */
  get quat() {
    const motion = this.motion();
    return motion ? new Quaternion().setFromRotationMatrix(motion).multiply(this.rest) : this.rest.clone();
  }

  /** Current region origin in model space. */
  get at() {
    const motion = this.motion();
    return motion ? this.origin.clone().applyMatrix4(motion) : this.origin.clone();
  }

  /** Region-local point → model space (scaled, rotated, moved). */
  p(local: V3) {
    return vec(local).multiplyScalar(this.scale).applyQuaternion(this.quat).add(this.at);
  }

  /** Region-local direction → model space (rotated only). */
  d(dir: V3) {
    return vec(dir).applyQuaternion(this.quat);
  }

  /** Region-local length → model space. */
  s(length: number) {
    return length * this.scale;
  }

  /** Region-local orientation → model space. */
  q(local = new Quaternion()) {
    return this.quat.clone().multiply(local);
  }

  /** `b.part` with every option in region units; the region scale is baked into the mesh scale. */
  part(geometry: BufferGeometry, color: string, options: PartOptions = {}) {
    let quat: Quaternion | undefined;
    if (options.quat) quat = this.q(options.quat);
    else if (!options.aim && !options.dir) {
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
    return part(this.ctx, geometry, color, {
      ...options,
      at: this.p(options.at ?? [0, 0, 0]),
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
