// State shared by every builder helper: the root group, the joint registry, mesh ownership, the material cache,
// the detail level, the pose counter, the rig records, the skins to refresh after a pose and the painted meshes to
// bake; bone weights and the inheritance rule (`weightsFor`); `Capture`, which keeps build-time data valid after
// poses; and the placement primitives every helper uses (`setWorld`, `meshFromWorld`, `makeMesh`, `skinMesh`).
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import type { Object3D, Texture } from "three";
import { bakeSheet, chartify, SURFACE } from "./bake";
import type { Painted } from "./bake";
import type { Frame } from "./frame";
import { Paint } from "./paint";
import type { RigRecord } from "./rig";
import type { Joint } from "./skeleton";

/** What every `color` option takes: a colour string, or a Paint baked into a texture over the surface. */
export type Fill = string | Paint;

/** A joint handle or a joint name. */
export type JointRef = Joint | string;

/**
 * Bone influences, heaviest first, summing to 1: `[[joint, weight], ...]`. One entry = rigid on that bone. Empty =
 * not attached to anything (a point made from nothing).
 */
export type Weights = ReadonlyArray<readonly [Joint, number]>;

/** Rigid on one joint (or on nothing). */
export const rigid = (joint: Joint | null): Weights => (joint ? [[joint, 1]] : []);

/** A weighted sum of weight sets, merged per joint, keeping the `max` heaviest (renormalised). */
export function mix(parts: ReadonlyArray<readonly [Weights, number]>, max = 4): Weights {
  const sum = new Map<Joint, number>();
  for (const [weights, f] of parts) for (const [joint, w] of weights) sum.set(joint, (sum.get(joint) ?? 0) + w * f);
  const kept = [...sum]
    .filter(([, w]) => w > 1e-4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max);
  const total = kept.reduce((acc, [, w]) => acc + w, 0);
  return kept.map(([joint, w]) => [joint, w / total] as const);
}

/**
 * Weights along a run of bones: `joints[k]` owns arc length from `starts[k]` to the next start. Around each start
 * k ≥ 1 the two neighbours blend with a smoothstep over ±`half(k)`; everywhere else one joint has it all.
 */
export function spanWeights(
  joints: readonly Joint[],
  starts: readonly number[],
  s: number,
  half: (k: number) => number,
) {
  let k = 0;
  while (k < joints.length - 1 && starts[k + 1] <= s) k++;
  for (const b of [k, k + 1]) {
    if (b < 1 || b >= joints.length) continue;
    const h = half(b);
    if (!(h > 0) || Math.abs(s - starts[b]) >= h) continue;
    const x = (s - starts[b] + h) / (2 * h);
    const f = x * x * (3 - 2 * x);
    const pair: Weights = [
      [joints[b], f],
      [joints[b - 1], 1 - f],
    ];
    return f >= 0.5 ? pair : [pair[1], pair[0]];
  }
  return rigid(joints[k]);
}

/**
 * Model-space data captured at one moment (a chain's curve, a sweep's rings, a frame). Data owned by joints
 * follows them: `blend(weights)` maps from capture time to the current pose, rigidly for one joint and by linear
 * blend for several, so handles stay valid after `pose()` while the scene graph remains the one source of truth.
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

  /** Σ weight × motion: exact for one joint, linear-blend skinning for several, identity for none. */
  blend(weights: Weights) {
    if (weights.length === 1) return this.motion(weights[0][0]);
    const out = new Matrix4();
    if (!weights.length) return out;
    out.elements.fill(0);
    for (const [joint, w] of weights) {
      const e = this.motion(joint).elements;
      for (let i = 0; i < 16; i++) out.elements[i] += w * e[i];
    }
    return out;
  }

  /** The weighted rotation from capture time to now (normalised quaternion blend). */
  turn(weights: Weights) {
    const out = new Quaternion(0, 0, 0, 0);
    if (!weights.length) return new Quaternion();
    const q = new Quaternion();
    for (const [joint, w] of weights) {
      q.setFromRotationMatrix(this.motion(joint));
      const sign = out.dot(q) < 0 ? -w : w;
      out.set(out.x + q.x * sign, out.y + q.y * sign, out.z + q.z * sign, out.w + q.w * sign);
    }
    return out.normalize();
  }
}

export type Tags = { name?: string; group?: string };

export class Ctx {
  readonly root = new Group();
  readonly joints = new Map<string, Joint>();
  rootJoint: Joint | null = null;
  readonly meshes = new Map<Joint, Mesh[]>();
  readonly owner = new Map<Mesh, Joint>();
  /** Rig answer-key records, evaluated against the current pose when `b.root` is read. */
  readonly rig: Array<() => RigRecord> = [];
  /** Blend-skinned meshes, re-deformed after every `pose()`. */
  readonly skins: Array<() => void> = [];
  /** Bumped by every `pose()`, so cached world-space data (surfaces) knows to refresh. */
  poses = 0;
  private readonly materials = new Map<string, MeshStandardMaterial>();
  /** Painted meshes, packed into one paint sheet when the root is read. */
  readonly paints: Painted[] = [];
  private baked = 0;
  private sheet: MeshStandardMaterial | null = null;

  constructor(
    name: string,
    /** Tessellation multiplier: default sides, ring density and membrane cells scale with it. */
    readonly detail: number,
    /** Paint sheet width in texels. */
    readonly paintSize: number,
  ) {
    if (!(detail > 0)) throw new Error(`detail must be positive, got ${detail}`);
    if (![512, 1024, 2048].includes(paintSize)) throw new Error(`paintSize is 512, 1024 or 2048, got ${paintSize}`);
    this.root.name = name;
  }

  /** `n` segments scaled by `detail` (at least 3): for the SDK's defaults and for your own geometry. */
  segments(n: number, detail = this.detail) {
    return Math.max(3, Math.round(n * detail));
  }

  /** A shape's own `detail` option, else the builder's. */
  detailOf(call: string, detail: number | undefined) {
    if (detail === undefined) return this.detail;
    if (!(detail > 0)) throw new Error(`${call}: detail must be positive, got ${detail}`);
    return detail;
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

  /** The one material every painted mesh shares; its map is the paint sheet. */
  paintMaterial() {
    this.sheet ??= new MeshStandardMaterial({ color: "#ffffff", roughness: 0.72, metalness: 0.04, name: "paint" });
    return this.sheet;
  }

  /** `texture` tinted by `tint` (and by vertex colours when the mesh has them), cut away where it is transparent. */
  textured(texture: Texture, tint: string, vertexColors: boolean) {
    const key = `${texture.uuid}|${tint.toLowerCase()}|${vertexColors}`;
    let cached = this.materials.get(key);
    if (!cached) {
      cached = new MeshStandardMaterial({
        color: tint.toLowerCase(),
        map: texture,
        alphaTest: 0.5,
        vertexColors,
        roughness: 0.72,
        metalness: 0.04,
      });
      this.materials.set(key, cached);
    }
    return cached;
  }

  /** Paint every painted mesh into the sheet; again only when meshes were painted since the last bake. */
  bake() {
    if (this.paints.length === this.baked) return;
    bakeSheet(this.paints, this.paintMaterial(), this.paintSize);
    this.baked = this.paints.length;
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

/** The weights of an input that came from something built (a frame, a sweep, a path made from frames), else null. */
export function weightsOf(x: unknown): Weights | null {
  if (!x || typeof x !== "object") return null;
  if ("weights" in x) {
    const weights = (x as { weights: Weights | null }).weights;
    return weights?.length ? weights : null;
  }
  if ("frame" in x) return weightsOf((x as { frame: Frame }).frame);
  return null;
}

/**
 * The weights for new geometry: explicit `bone` (rigid), else the weights of the first input that came from
 * something built (a joint, part, hit, sweep, tube or chain point, or a path made from them), else rigid on the
 * joint nearest to `at`.
 */
export function weightsFor(ctx: Ctx, explicit: JointRef | undefined, inputs: readonly unknown[], at: Vector3) {
  if (explicit !== undefined) return rigid(resolveJoint(ctx, explicit));
  for (const input of inputs) {
    const mesh = input && typeof input === "object" && "isMesh" in input ? ctx.owner.get(input as Mesh) : undefined;
    const weights = weightsOf(input) ?? (mesh ? rigid(mesh) : null);
    if (weights) return weights;
  }
  return rigid(nearestJoint(ctx, at));
}

/** The bone for new joints: the heaviest bone of `weightsFor`. */
export function boneFor(ctx: Ctx, explicit: JointRef | undefined, inputs: readonly unknown[], at: Vector3) {
  return weightsFor(ctx, explicit, inputs, at)[0][0];
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
 * Per-vertex extras for `meshFromWorld`: model-space normals (else computed), uvs, linear vertex colours, a texture,
 * and the shape's own surface coordinates for paints (2 per vertex; `wrap` when the second is degrees round a loop).
 */
export type MeshExtras = {
  normals?: number[];
  uvs?: number[];
  colors?: number[];
  texture?: Texture;
  surface?: number[];
  wrap?: boolean;
};

/**
 * A mesh from WORLD-space triangles with weights per vertex. It hangs under its heaviest bone with an identity
 * local transform; vertices on other bones are blend-skinned (`skinMesh`). `smooth` shares vertices (smooth
 * normals); otherwise every face is flat shaded.
 */
export function meshFromWorld(
  ctx: Ctx,
  positions: number[],
  index: number[],
  fill: Fill,
  weightAt: (vertex: number) => Weights,
  smooth: boolean,
  tags: Tags,
  extras: MeshExtras = {},
) {
  const count = positions.length / 3;
  const totals = new Map<Joint, number>();
  for (let i = 0; i < count; i++) for (const [j, w] of weightAt(i)) totals.set(j, (totals.get(j) ?? 0) + w);
  const joint = [...totals].sort((a, b) => b[1] - a[1])[0][0];
  const inverse = joint.object.matrixWorld.clone().invert();
  const local = new Float32Array(positions.length);
  const v = new Vector3();
  for (let i = 0; i < positions.length; i += 3) {
    v.fromArray(positions, i).applyMatrix4(inverse).toArray(local, i);
  }
  let geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(local, 3));
  if (extras.normals) {
    const turn = new Matrix3().getNormalMatrix(inverse);
    const normals = new Float32Array(extras.normals.length);
    for (let i = 0; i < normals.length; i += 3)
      v.fromArray(extras.normals, i).applyMatrix3(turn).normalize().toArray(normals, i);
    geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  }
  if (extras.uvs) geometry.setAttribute("uv", new Float32BufferAttribute(extras.uvs, 2));
  if (extras.colors) geometry.setAttribute("color", new Float32BufferAttribute(extras.colors, 3));
  if (extras.surface && fill instanceof Paint)
    geometry.setAttribute(SURFACE, new Float32BufferAttribute(extras.surface, 2));
  geometry.setIndex(index);
  const bones = totals.size > 1 ? writeWeights(geometry, count, weightAt) : null;
  if (!smooth) geometry = geometry.toNonIndexed();
  if (!extras.normals) geometry.computeVertexNormals();
  const mesh = makeMesh(ctx, geometry, fill, joint.object.matrixWorld, extras.texture, extras.wrap);
  joint.object.add(mesh);
  mesh.updateMatrixWorld(true);
  addMesh(ctx, mesh, joint, tags);
  if (bones) skinMesh(ctx, mesh, bones);
  return mesh;
}

/**
 * A mesh with the material its fill asks for. A colour string shares the matte material for that colour (with a
 * `texture`, the textured material tinted by it). A Paint cuts the geometry into charts and registers it for the
 * paint sheet, with the surface coordinates in its `_surface` attribute (else its uv; `wrap` for an angle).
 * `toWorld` is where the mesh will sit in model space.
 */
export function makeMesh(
  ctx: Ctx,
  geometry: BufferGeometry,
  fill: Fill,
  toWorld: Matrix4,
  texture?: Texture,
  wrap = false,
) {
  if (fill instanceof Paint) {
    if (texture) throw new Error("A textured part takes a colour string as its tint, not a paint");
    const { geometry: cut, ...charts } = chartify(geometry, toWorld);
    const mesh = new Mesh(cut, ctx.paintMaterial());
    ctx.paints.push({ mesh, paint: fill, wrap, ...charts });
    return mesh;
  }
  if (!texture) return new Mesh(geometry, ctx.material(fill));
  if (!geometry.getAttribute("uv"))
    throw new Error(
      "`texture` needs geometry with UVs: a three.js geometry, or cards; SDK shapes take a paint instead",
    );
  return new Mesh(geometry, ctx.textured(texture, fill, Boolean(geometry.getAttribute("color"))));
}

/** `skinIndex` / `skinWeight` attributes (indices into the returned bone list), up to 4 influences per vertex. */
export function writeWeights(geometry: BufferGeometry, count: number, weightAt: (vertex: number) => Weights) {
  const bones: Joint[] = [];
  const indices = new Uint16Array(count * 4);
  const weights = new Float32Array(count * 4);
  for (let i = 0; i < count; i++)
    weightAt(i)
      .slice(0, 4)
      .forEach(([joint, w], k) => {
        let b = bones.indexOf(joint);
        if (b < 0) b = bones.push(joint) - 1;
        indices[i * 4 + k] = b;
        weights[i * 4 + k] = w;
      });
  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(indices, 4));
  geometry.setAttribute("skinWeight", new Float32BufferAttribute(weights, 4));
  return bones;
}

const skinners = new WeakMap<Mesh, () => void>();

/**
 * Make a mesh with `skinIndex` / `skinWeight` over `bones` follow them: `userData.skinBones` names them for the
 * exporter, and every later `pose()` re-deforms the vertices from their current (bind) positions by linear blend.
 * Skinning a mesh again (after its geometry was replaced) replaces its earlier skin.
 */
export function skinMesh(ctx: Ctx, mesh: Mesh, bones: readonly Joint[]) {
  mesh.userData.skinBones = bones.map((joint) => joint.name);
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const indices = geometry.getAttribute("skinIndex");
  const weights = geometry.getAttribute("skinWeight");
  mesh.updateWorldMatrix(true, false);
  const toWorld = mesh.matrixWorld.clone();
  const normalToWorld = new Matrix3().getNormalMatrix(toWorld);
  const bindPositions = Array.from({ length: position.count }, (_, i) =>
    new Vector3().fromBufferAttribute(position, i).applyMatrix4(toWorld),
  );
  const bindNormals = Array.from({ length: position.count }, (_, i) =>
    new Vector3().fromBufferAttribute(normal, i).applyMatrix3(normalToWorld),
  );
  const capture = new Capture(bones);
  const skin = () => {
    const motions = bones.map((joint) => capture.motion(joint));
    const turns = motions.map((m) => new Matrix3().setFromMatrix4(m));
    const toLocal = mesh.matrixWorld.clone().invert();
    const normalToLocal = new Matrix3().getNormalMatrix(toLocal);
    const p = new Vector3();
    const n = new Vector3();
    const v = new Vector3();
    for (let i = 0; i < position.count; i++) {
      p.set(0, 0, 0);
      n.set(0, 0, 0);
      for (let k = 0; k < 4; k++) {
        const w = weights.getComponent(i, k);
        if (!w) continue;
        const b = indices.getComponent(i, k);
        p.addScaledVector(v.copy(bindPositions[i]).applyMatrix4(motions[b]), w);
        n.addScaledVector(v.copy(bindNormals[i]).applyMatrix3(turns[b]), w);
      }
      position.setXYZ(i, ...p.applyMatrix4(toLocal).toArray());
      normal.setXYZ(i, ...n.applyMatrix3(normalToLocal).normalize().toArray());
    }
    position.needsUpdate = true;
    normal.needsUpdate = true;
    geometry.boundingBox = null;
    geometry.boundingSphere = null;
  };
  const earlier = skinners.get(mesh);
  if (earlier) ctx.skins.splice(ctx.skins.indexOf(earlier), 1);
  skinners.set(mesh, skin);
  ctx.skins.push(skin);
}

/** The weights of one vertex of a built mesh (its skin attributes, else rigid on its bone). */
export function vertexWeights(ctx: Ctx, mesh: Mesh, vertex: number): Weights {
  const names = mesh.userData.skinBones as string[] | undefined;
  const indices = mesh.geometry.getAttribute("skinIndex");
  const weights = mesh.geometry.getAttribute("skinWeight");
  if (!names || !indices || !weights) return rigid(ctx.owner.get(mesh) ?? null);
  const out: Array<readonly [Joint, number]> = [];
  for (let k = 0; k < 4; k++) {
    const w = weights.getComponent(vertex, k);
    if (w > 0) out.push([ctx.joints.get(names[indices.getComponent(vertex, k)])!, w]);
  }
  return out.sort((a, b) => b[1] - a[1]);
}
