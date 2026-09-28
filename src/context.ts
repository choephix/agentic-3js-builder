// State shared by every builder helper: the root group, the joint registry, mesh ownership, the material cache,
// the detail level, the pose counter and the rig records; the bone-inheritance rule (`boneFor`); and the two
// placement primitives every helper uses (`setWorld`, `meshFromWorld`).
import { BufferGeometry, Float32BufferAttribute, Group, Matrix4, Mesh, MeshStandardMaterial, Vector3 } from "three";
import type { Object3D, Quaternion } from "three";
import { ownerOf } from "./frame";
import type { RigRecord } from "./rig";
import type { Joint } from "./skeleton";

/** A joint handle or a joint name. */
export type JointRef = Joint | string;

export type Tags = { name?: string; group?: string };

export class Ctx {
  readonly root = new Group();
  readonly joints = new Map<string, Joint>();
  rootJoint: Joint | null = null;
  readonly meshes = new Map<Joint, Mesh[]>();
  readonly owner = new Map<Mesh, Joint>();
  /** Rig answer-key records, evaluated against the current pose when `b.root` is read. */
  readonly rig: Array<() => RigRecord> = [];
  /** Bumped by every `pose()`, so cached world-space data (surfaces) knows to refresh. */
  poses = 0;
  private readonly materials = new Map<string, MeshStandardMaterial>();

  constructor(
    name: string,
    /** Tessellation multiplier: default sides, ring density and membrane cells scale with it. */
    readonly detail: number,
  ) {
    if (!(detail > 0)) throw new Error(`detail must be positive, got ${detail}`);
    this.root.name = name;
  }

  /** `n` segments scaled by `detail` (at least 3): for the SDK's defaults and for your own geometry. */
  segments(n: number) {
    return Math.max(3, Math.round(n * this.detail));
  }

  /** One shared matte material per colour, like the creature-lab kit. */
  material(color: string) {
    const key = color.toLowerCase();
    let cached = this.materials.get(key);
    if (!cached) {
      cached = new MeshStandardMaterial({ color: key, roughness: 0.72, metalness: 0.04 });
      this.materials.set(key, cached);
    }
    return cached;
  }
}

/**
 * The joint whose bone passes closest to `p`. A bone runs from a joint to each of its child joints and belongs to
 * the parent (it moves when the parent rotates); a joint without children counts as its point.
 */
export function nearestJoint(ctx: Ctx, p: Vector3) {
  let best: Joint | null = null;
  let bestD = Infinity;
  const consider = (joint: Joint, a: Vector3, b: Vector3) => {
    const seg = b.clone().sub(a);
    const f = Math.min(Math.max(p.clone().sub(a).dot(seg) / Math.max(seg.lengthSq(), 1e-12), 0), 1);
    const d = a.clone().addScaledVector(seg, f).distanceToSquared(p);
    if (d < bestD - 1e-12) [best, bestD] = [joint, d];
  };
  for (const joint of ctx.joints.values()) {
    const at = joint.at;
    consider(joint, at, at);
    if (joint.parent) consider(joint.parent, joint.parent.at, at);
  }
  if (!best) throw new Error("No joints yet: create the root joint with b.joint(name, { at }) first");
  return best as Joint;
}

/**
 * The bone for new geometry or joints: explicit `bone`, else the bone of the first input that came from something
 * built (a joint, part, hit, sweep, tube or chain point, or a path made from them), else the joint nearest to `at`.
 */
export function boneFor(ctx: Ctx, explicit: JointRef | undefined, inputs: readonly unknown[], at: Vector3) {
  if (explicit !== undefined) return resolveJoint(ctx, explicit);
  for (const input of inputs) {
    const owner =
      ownerOf(input) ?? (input && typeof input === "object" && "isMesh" in input ? ctx.owner.get(input as Mesh) : null);
    if (owner) return owner;
  }
  return nearestJoint(ctx, at);
}

/** The joint for `ref`; omitted = the root joint. */
export function resolveJoint(ctx: Ctx, ref?: JointRef) {
  if (ref === undefined) {
    if (!ctx.rootJoint) throw new Error("No root joint yet: create one with b.joint(name, { at }) first");
    return ctx.rootJoint;
  }
  if (typeof ref !== "string") return ref;
  const joint = ctx.joints.get(ref);
  if (!joint) throw new Error(`Unknown joint "${ref}"`);
  return joint;
}

/** Parent `object` under `parent` so its WORLD transform is (position, quat, scale); matrices are left current. */
export function setWorld(
  object: Object3D,
  parent: Object3D,
  position: Vector3,
  quat: Quaternion,
  scale = new Vector3(1, 1, 1),
) {
  const local = parent.matrixWorld
    .clone()
    .invert()
    .multiply(new Matrix4().compose(position, quat, scale));
  local.decompose(object.position, object.quaternion, object.scale);
  parent.add(object);
  object.updateMatrixWorld(true);
}

export function addMesh(ctx: Ctx, mesh: Mesh, joint: Joint, tags: Tags) {
  if (tags.name) mesh.name = tags.name;
  if (tags.group) mesh.userData.group = tags.group;
  ctx.owner.set(mesh, joint);
  const list = ctx.meshes.get(joint);
  if (list) list.push(mesh);
  else ctx.meshes.set(joint, [mesh]);
}

/**
 * A mesh on `joint` from WORLD-space triangles. Vertices are stored in the joint's frame and the mesh keeps an
 * identity local transform. `smooth` shares vertices (smooth normals); otherwise every face is flat shaded.
 */
export function meshFromWorld(
  ctx: Ctx,
  positions: number[],
  index: number[],
  color: string,
  joint: Joint,
  smooth: boolean,
  tags: Tags,
) {
  const inverse = joint.object.matrixWorld.clone().invert();
  const local = new Float32Array(positions.length);
  const v = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    v.fromArray(positions, i).applyMatrix4(inverse).toArray(local, i);
  }
  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(local, 3));
  geometry.setIndex(index);
  if (!smooth) geometry = geometry.toNonIndexed();
  geometry.computeVertexNormals();
  const mesh = new Mesh(geometry, ctx.material(color));
  joint.object.add(mesh);
  mesh.updateMatrixWorld(true);
  addMesh(ctx, mesh, joint, tags);
  return mesh;
}
